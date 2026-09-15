## F8 (part A) — The Adapter Interface Contract

**Traces to:** PRD F8 (P0); NFR-08, NFR-11, NFR-19, SM-13. **API:** `Y3-integrations.md`. **Screens:** none directly (this is the integration seam).

**Description:** The common interface every spoke adapter implements, identically. This contract is the extensibility deliverable: a sixth application must be addable by writing one adapter implementation plus a registry row, with **zero changes to hub code**. This chunk specifies the exact operations, their request and response shapes, timeout and retry policy, circuit-breaking, and the complete error taxonomy. Part B (`F08b`) specifies the registry that drives which adapters exist and how they are configured.

**Terminology:**
- **Adapter** — the hub-side component translating between the hub's models and one spoke's native API. The only path from hub to spoke.
- **Conformance** — satisfying the interface, the normalization rules, and the behavioral tests in `FR-F08a-08`.
- **Adapter type** — the implementation kind named in the registry (`REST_JSON_V1` for all demo spokes); the hub instantiates by type.
- **Circuit** — per-application failure gate with `CLOSED`, `OPEN`, `HALF_OPEN` states.

---

### FR-F08a-01 — Interface operations (the contract)

**Description:** The eight operations every adapter implements. Nothing else may be called on an adapter by the hub; no hub code may reach a spoke by any other means.

**Common call envelope.** Every operation receives:
```
AdapterContext {
  principal: Principal,          // §3.1, attested downstream per FR-F01-02
  scope: Scope,                  // FR-F02-04 — mandatory, never absent
  correlationId: string,         // ULID
  requestId: string,             // ULID, unique per adapter call
  deadlineAt: ISO-8601,          // absolute; adapter must not exceed
  idempotencyKey?: string        // present on all mutating calls
}
```

| # | Operation | Purpose | Mutating |
|---|---|---|---|
| 1 | `describe()` | Capability metadata for registry and console | No |
| 2 | `healthCheck()` | Availability and latency | No |
| 3 | `listWorkItems(ctx, filters, paging)` | Normalized work items | No |
| 4 | `getWorkItem(ctx, nativeId)` | Full detail + available actions + related refs | No |
| 5 | `getWorkItemSummary(ctx, nativeId)` | Lightweight summary for related-items panels | No |
| 6 | `performAction(ctx, nativeId, actionId, payload)` | Execute a state change | **Yes** |
| 7 | `getActivityHistory(ctx, nativeId, paging)` | Spoke-native history | No |
| 8 | `establishContext(ctx)` / `revokeContext(ctx, handle)` | Optional session handles (`FR-F01-04`) | Yes (session only) |

**Rules:**
1. Every operation is asynchronous and returns either a typed success result or a typed `AdapterError` (`FR-F08a-06`). Adapters MUST NOT throw untyped errors across the boundary; an unexpected exception is wrapped as `ADAPTER_INTERNAL`.
2. Every operation MUST honour `deadlineAt` and abort its in-flight call when reached.
3. Every non-mutating operation MUST be side-effect free in the spoke.
4. `performAction` MUST pass `idempotencyKey` to the spoke as `X-UAL-Idempotency-Key`.
5. An adapter MUST NOT call another adapter, read another spoke, or reach the hub's database. Cross-system coordination belongs to the orchestration engine (`FR-F07b-07`).
6. Operations 5 and 8 are optional: an adapter declares support in `describe()`. When unsupported, the hub degrades affordances (`FR-F08a-07`) rather than erroring — `getWorkItemSummary` falls back to `getWorkItem`, and context handling is skipped.

**Acceptance criteria:**
- AC-1: All six demo adapters (five spokes + the sixth demo app) implement operations 1–7 identically and pass the conformance suite.
- AC-2: A static check finds zero direct spoke HTTP calls in hub code outside adapter implementations.

---

### FR-F08a-02 — `describe()` and `healthCheck()`

**`describe()` — inputs:** none (no principal required; it is metadata).

**Response:**
```json
{
  "applicationId": "PVQ",
  "displayName": "Personnel Vetting Questionnaire",
  "adapterVersion": "1.0.0",
  "contractVersion": "1.0",
  "workItemTypes": [
    { "type": "PVQ_ISSUE", "label": "Questionnaire issue", "contentProfile": "ISSUE_DETAIL",
      "statusMap": { "OPEN": "OPEN", "IN_REVIEW": "IN_PROGRESS",
                     "RESOLVED_SUBSTANTIATED": "CLOSED", "RESOLVED_UNSUBSTANTIATED": "CLOSED",
                     "RESOLVED_WITH_CLARIFICATION": "CLOSED", "REFERRED": "BLOCKED" },
      "priorityNative": true }
  ],
  "actions": [
    { "actionId": "RESOLVE_ISSUE", "label": "Resolve issue", "appliesToTypes": ["PVQ_ISSUE"],
      "requiredPermission": "ISSUE.RESOLVE", "formSchema": { "fields": [ ... ] },
      "targetSystems": ["PVQ"], "idempotent": true }
  ],
  "capabilities": { "supportsSearch": true, "supportsFilter": ["status","priority","dueDate"],
                    "supportsContext": false, "supportsSummary": true,
                    "supportsActivityHistory": true, "maxPageSize": 200 },
  "relationshipTypesEmitted": ["ISSUE_AGAINST"],
  "iconToken": "icon-clipboard-check"
}
```

**Processing / business rules:**
1. `describe()` is called at registration (`FR-F12-03`), at hub startup, and on demand from the admin console. Results are cached with the registry row and refreshed on manual "Test connection."
2. `contractVersion` is checked against the hub's supported set. An unsupported version blocks registration with a specific message and marks an existing application `INCOMPATIBLE` rather than silently misbehaving.
3. Every `workItemTypes[].statusMap` MUST map every native status the spoke can emit to exactly one `statusCategory`. Unmapped statuses are a conformance failure (`FR-F05-02`).
4. Declared `actions[].requiredPermission` MUST exist in the role matrix (`FR-F02-02`); an unknown permission blocks registration.

**`healthCheck()` — response:**
```json
{ "status": "HEALTHY" | "DEGRADED" | "DOWN", "latencyMs": 42,
  "checkedAt": "2026-09-14T15:04:11Z", "version": "1.0.0", "detail": "optional plain text" }
```

**Rules:** `healthCheck()` uses a shorter timeout than data operations (default 2 s), never retries, and is never blocked behind the circuit breaker — it is how recovery is detected. `DEGRADED` means reachable but exceeding its latency threshold.

**Error handling:**

| Scenario | Code | Behavior |
|---|---|---|
| `describe()` unreachable at registration | `ADAPTER_UNREACHABLE` | Registration blocked with "We couldn't reach that application at the address you entered. Check the endpoint and try again." |
| `contractVersion` unsupported | `ADAPTER_CONTRACT_UNSUPPORTED` | "This application uses an integration version we don't support yet (version {v}). Supported versions: {list}." |
| Health check fails | `ADAPTER_UNREACHABLE` | Status recorded `DOWN`; integration issue logged. |

**Acceptance criteria:**
- AC-1: Every adapter's `describe()` validates against the schema.
- AC-2: An adapter with an unmapped native status fails the conformance suite.

---

### FR-F08a-03 — `listWorkItems` and `getWorkItem`

**`listWorkItems(ctx, filters, paging)` — inputs:**
- `filters`: `{ statusCategory?[], priority?[], type?[], assignee?, dueFrom?, dueTo?, q? }` — advisory push-down only; the hub re-applies (`FR-F05-03`)
- `paging`: `{ limit (≤ capabilities.maxPageSize), cursor? }`

**Response:** `{ items: WorkItem[], nextCursor: string | null, totalKnown: number | null, truncated: boolean }`

**Rules:**
1. The adapter MUST apply `ctx.scope` in its request to the spoke; a call without scope is a contract violation and the hub refuses to issue it (`FR-F02-04`).
2. The adapter performs normalization (§3.2). The hub validates the output schema and rejects malformed items individually rather than failing the batch.
3. `totalKnown` is null when the spoke cannot count cheaply; the UI then says "Showing {n} items" rather than "{n} of {N}".
4. The adapter MUST NOT return items outside scope even if the spoke does; it filters and reports an `INTEGRATION_SCOPE_VIOLATION`.

**`getWorkItem(ctx, nativeId)` — response:** `{ item: WorkItem, typeSpecificDetail: object, availableActions: ActionDescriptor[], relatedRefs: RelatedRef[], stateVersion: string, activitySupported: boolean }`

**Rules:**
1. `availableActions` reflects the spoke's view of what is valid **in the item's current state**; the hub then intersects with role/attribute policy (`FR-F02-05`). The spoke never has the last word on authorization, only on state validity.
2. `stateVersion` MUST change whenever any field the UI displays changes (an ETag, version counter, or content hash).
3. `relatedRefs` are opaque; the adapter never resolves them.
4. A `nativeId` that does not exist returns `NOT_FOUND`, which the hub converts to the same 403 as a denial (`FR-F06-01`).

**Acceptance criteria:**
- AC-1: A scoped list for an applicant returns only that subject's items, asserted directly against the adapter.
- AC-2: `stateVersion` changes after any mutation, verified by conformance test.

---

### FR-F08a-04 — `performAction`, `getWorkItemSummary`, `getActivityHistory`

**`performAction(ctx, nativeId, actionId, payload)` — response:**
`{ outcome: "APPLIED" | "REJECTED", newState: WorkItem, stateVersion, appliedAt, rejectionReason?: { code, plainMessage } }`

**Rules:**
1. `REJECTED` is a *business* rejection (the spoke understood but declined), returned as a normal result with a plain-language `plainMessage` safe to show a user. Transport and availability problems are `AdapterError`s instead. Conflating the two is what produces unhelpful error messages, so the contract separates them explicitly.
2. The adapter MUST pass `idempotencyKey`; the spoke MUST return the original outcome for a repeated key (`FR-F09-07`).
3. `newState` MUST be the spoke's post-write state, re-read if necessary — not the adapter's optimistic projection.
4. `performAction` MUST NOT be invoked for an `actionId` the spoke did not declare in `describe()`.

**`getWorkItemSummary(ctx, nativeId)` — response:** `{ nativeId, title, status, statusLabel, statusCategory, subjectRef, lastActivityAt }`. Optional capability; used by related-items panels to avoid fetching full detail for every reference.

**`getActivityHistory(ctx, nativeId, paging)` — response:** `{ events: ActivityEvent[] (origin: SPOKE), nextCursor }`. Optional capability; when unsupported the hub renders hub audit records only and notes "Detailed history isn't available from {System}."

**Error handling:** per `FR-F08a-06`.

**Acceptance criteria:**
- AC-1: A business rejection surfaces the spoke's plain message to the user; a transport failure does not.
- AC-2: Repeating a `performAction` with the same idempotency key applies the change once.

---

### FR-F08a-05 — Timeout, retry, backoff, and circuit-breaking policy

**Description:** Resilience behavior is uniform across adapters and configured per application in the registry — never hard-coded per spoke.

**Configuration (per application, `Y0a.registered_applications`):**

| Setting | Default | Bounds | Applies to |
|---|---|---|---|
| `timeoutMs` | 5000 | 500–30000 | list, get, summary, history |
| `actionTimeoutMs` | 10000 | 1000–30000 | performAction |
| `healthTimeoutMs` | 2000 | 500–10000 | healthCheck |
| `maxRetries` | 2 | 0–5 | idempotent operations only |
| `backoffInitialMs` | 200 | 50–5000 | retry spacing |
| `backoffMultiplier` | 2.0 | 1.0–4.0 | retry spacing |
| `backoffJitterPct` | 20 | 0–50 | retry spacing |
| `circuitFailureThreshold` | 5 | 2–50 | consecutive failures to open |
| `circuitOpenMs` | 30000 | 5000–300000 | open duration before half-open |
| `circuitHalfOpenProbes` | 1 | 1–5 | probes allowed in half-open |

**Processing / business rules:**
1. **Retries apply only to idempotent operations.** `listWorkItems`, `getWorkItem`, `getWorkItemSummary`, `getActivityHistory`, `healthCheck` (no retry by policy), `describe` are retryable. `performAction` is retried **only** when the adapter can prove the request never reached the spoke (connection refused, DNS failure, TLS failure). A timeout on `performAction` is **never** auto-retried — it becomes `ADAPTER_INDETERMINATE` and the decision passes to the orchestration engine or the user (`FR-F06-04`).
2. Retry delay: `backoffInitialMs × multiplier^(attempt-1)`, ± `jitterPct`, capped so that total elapsed never exceeds `ctx.deadlineAt`. A retry that cannot complete before the deadline is not attempted.
3. Retries are attempted on `ADAPTER_UNREACHABLE`, `ADAPTER_TIMEOUT` (non-mutating only), and HTTP 502/503/504. They are **not** attempted on 4xx, `ADAPTER_REJECTED`, `PRINCIPAL_REJECTED`, or `ADAPTER_CONTRACT_ERROR` — retrying those is guaranteed waste.
4. **Circuit breaker** per application: `circuitFailureThreshold` consecutive failures opens the circuit. While `OPEN`, calls fail immediately with `ADAPTER_CIRCUIT_OPEN` without touching the spoke — one slow spoke cannot stall the aggregate queue. After `circuitOpenMs` the circuit goes `HALF_OPEN` and admits `circuitHalfOpenProbes` calls; success closes it, failure re-opens it with the timer reset.
5. The circuit never blocks `healthCheck()`, so recovery is always detectable and automatic (SM-17).
6. Circuit state transitions write `integration_issues` rows and are visible in the admin console (`FR-F11-02`).
7. All timeouts are enforced by the hub as absolute deadlines, so an adapter that ignores its deadline is still cut off.

**Validation rules:** Registry values outside bounds are rejected at registration with a field error naming the bound.

**Error handling:**

| Scenario | Code | User-facing message |
|---|---|---|
| Circuit open | `ADAPTER_CIRCUIT_OPEN` | "{System} isn't responding right now. We'll reconnect automatically." |
| All retries exhausted | `ADAPTER_UNREACHABLE` | "{System} isn't responding right now. Your other work is still available." |
| Mutating timeout | `ADAPTER_INDETERMINATE` | "We're not sure whether {System} completed this action. Refresh this item to check its current status before trying again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: With a spoke forced to hang, the work queue still returns within the configured timeout plus overhead (NFR-17).
- AC-2: Five consecutive failures open the circuit; the spoke stops receiving data calls; health probing continues.
- AC-3: Restoring the spoke closes the circuit automatically without restart or user action.
- AC-4: A `performAction` timeout is never auto-retried.

---

### FR-F08a-06 — Adapter error taxonomy

**Description:** The closed set of error classes an adapter may return. Every hub-side handling decision keys off this taxonomy, so it must be exhaustive and unambiguous.

**`AdapterError { class, httpStatusFromSpoke?, plainMessage?, retryable, correlationId, applicationId, operation, detail }`**

| Class | Meaning | Retryable | Hub → user mapping |
|---|---|---|---|
| `ADAPTER_UNREACHABLE` | Connection refused, DNS failure, TLS failure, spoke down | Yes | 503 `UPSTREAM_UNAVAILABLE` |
| `ADAPTER_TIMEOUT` | Deadline exceeded, outcome unknown | Non-mutating only | 503 (read) / 502 `UPSTREAM_INDETERMINATE` (write) |
| `ADAPTER_CIRCUIT_OPEN` | Hub declined to call a failing spoke | No (auto-recovers) | 503 `UPSTREAM_UNAVAILABLE` |
| `ADAPTER_INDETERMINATE` | Mutating call may or may not have applied | No (user decides) | 502 `UPSTREAM_INDETERMINATE` |
| `ADAPTER_REJECTED` | Spoke declined for a business reason | No | 422 `UPSTREAM_REJECTED_ACTION` with `plainMessage` |
| `ADAPTER_NOT_FOUND` | Native ID does not exist | No | 403 `AUTHZ_DENIED` (non-enumerable, `FR-F02-07`) |
| `ADAPTER_FORBIDDEN` | Spoke denied the principal | No | 403 `AUTHZ_DENIED_UPSTREAM` |
| `ADAPTER_PRINCIPAL_REJECTED` | Assertion invalid, wrong audience, expired | No | 502 `UPSTREAM_REJECTED` + integration issue |
| `ADAPTER_CONTRACT_ERROR` | Response failed schema validation | No | 502 `UPSTREAM_CONTRACT_ERROR` + integration issue |
| `ADAPTER_SCOPE_VIOLATION` | Spoke returned out-of-scope data | No | Rows dropped; issue logged; request otherwise succeeds |
| `ADAPTER_RATE_LIMITED` | Spoke signalled throttling | Yes, with `retryAfter` | 503 `UPSTREAM_UNAVAILABLE` |
| `ADAPTER_CONTRACT_UNSUPPORTED` | Contract version mismatch | No | 409 `APPLICATION_INCOMPATIBLE` |
| `ADAPTER_INTERNAL` | Unexpected adapter-side failure | No | 500 `INTERNAL_ERROR` + issue |

**Rules:**
1. Every `AdapterError` writes exactly one `integration_issues` row (`FR-F16-09`) except `ADAPTER_NOT_FOUND` and `ADAPTER_REJECTED`, which are normal business outcomes rather than integration failures.
2. `plainMessage` is the only spoke-supplied text ever shown to a user, and only for `ADAPTER_REJECTED`. It is length-capped (200 chars), HTML-escaped, and stripped of anything matching identifier/stack patterns.
3. No other spoke text — exception messages, HTTP reason phrases, response bodies — reaches the UI. It is recorded in the integration issue for administrators (`FR-F11-03`).

**Acceptance criteria:**
- AC-1: Every class is reachable in test via failure injection (`FR-F16-11`) and produces its specified user-facing message.
- AC-2: No user-facing string in any failure path contains a stack trace, hostname, or port.

---

### FR-F08a-07 — Capability negotiation and graceful affordance degradation

**Description:** An application supporting fewer capabilities loses affordances, not usability.

**Processing / business rules:**
1. `capabilities.supportsSearch: false` → the source is excluded from search fan-out, and search results note: "{System} doesn't support search. Its items aren't included in these results."
2. `capabilities.supportsActivityHistory: false` → the detail page shows hub audit records only with "Detailed history isn't available from {System}."
3. `capabilities.supportsSummary: false` → related-items panels call `getWorkItem` instead, with a correspondingly larger timeout budget.
4. An application declaring no `actions` for a type renders a read-only detail page with an explanatory note rather than an empty action panel: "No actions are available for this item."
5. Missing capabilities MUST NOT produce errors, empty regions, or disabled controls without explanation.
6. Declared but unimplemented capabilities are caught by the conformance suite before registration is permitted.

**Acceptance criteria:**
- AC-1: An adapter with all optional capabilities disabled still produces a fully usable queue and detail experience.
- AC-2: Every degraded affordance states why.

---

### FR-F08a-08 — Adapter conformance test suite

**Description:** The standalone, executable suite any new adapter must pass. This is what makes "add a sixth application" a bounded task rather than an open-ended one.

**Processing / business rules:** The suite runs against a live adapter + spoke pair and asserts:
1. **Interface completeness** — operations 1–7 present; optional operations present iff declared.
2. **`describe()` schema validity**, including complete status maps and permissions that exist in the role matrix.
3. **Normalization** — every returned WorkItem satisfies §3.2; required fields present; `workItemId` formatting; priority and status mapping correctness.
4. **Scope enforcement** — a scoped list for subject A returns zero rows for subject B; a scoped get for a foreign resource returns `ADAPTER_NOT_FOUND` or `ADAPTER_FORBIDDEN`, never data.
5. **Deadline honouring** — a call with a 100 ms deadline aborts within 150 ms.
6. **Error taxonomy** — induced connection refusal, timeout, 4xx, 5xx, and malformed response each produce the correct `AdapterError` class.
7. **Idempotency** — `performAction` repeated with one key applies once.
8. **`stateVersion` progression** — changes after mutation, stable otherwise.
9. **No cross-spoke access** — the adapter's outbound calls target only its own application's base endpoint (asserted by network policy in test).
10. **Health semantics** — `healthCheck()` returns `DOWN` promptly when the spoke is stopped and `HEALTHY` after restart.

**Outputs:** A pass/fail report readable by a reviewer (`FR-F19-09`), and a gate on registration (`FR-F12-04` runs items 1–2 and 6 live).

**Acceptance criteria:**
- AC-1: All six adapters pass the full suite in CI.
- AC-2: The suite is runnable standalone against an arbitrary adapter with a single documented command.
- AC-3: Deliberately breaking one adapter's status map fails the suite with a specific, actionable message.

---
