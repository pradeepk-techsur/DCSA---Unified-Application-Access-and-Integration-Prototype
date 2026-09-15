## F8 (part B) — Data-Driven Application Registry

**Traces to:** PRD F8 (P0); NFR-11, NFR-19, SM-11, SM-12, R-07. **Screens:** SCR-22, SCR-23 (admin console). **Schema:** `Y0a §registered_applications`.

**Description:** The configuration store that tells the hub which applications exist, how to reach them, what they expose, and who may see them. Every hub behavior that depends on "which systems are there" reads from this registry. **There is no hard-coded list of five systems anywhere in the hub.** Adding, disabling, or removing an application is a data change.

**Terminology:**
- **Registry row** — one application's configuration record.
- **Registry version** — a monotonically increasing counter bumped on any registry change; clients poll it to know when to refresh entitlements.
- **Registry-derived behavior** — anything the hub computes by reading the registry rather than from code.

---

### FR-F08b-01 — Registry record fields

**Description:** The complete field set captured per application. Full DDL in `Y0a`.

| Field | Type | Required | Rules |
|---|---|---|---|
| `applicationId` | string | Yes | Immutable. `^[A-Z][A-Z0-9_]{1,15}$`. Globally unique. Used as the `sourceSystem` prefix of every `workItemId`. |
| `displayName` | string | Yes | 3–60 chars. Shown on every badge, breadcrumb, error message, and audit record. |
| `description` | string | No | ≤500 chars. Shown in the admin console. |
| `adapterType` | string | Yes | Must be a registered adapter implementation key (`REST_JSON_V1`). |
| `baseEndpoint` | string (URL) | Yes | `http`/`https`, host must resolve, no credentials in URL, no fragment. |
| `healthEndpoint` | string (URL) | Yes | Absolute, or relative to `baseEndpoint`. |
| `contractVersion` | string | Yes | Populated from `describe()`; must be hub-supported. |
| `workItemTypes` | JSON array | Yes | From `describe()`, confirmable/editable at registration. Each with type, label, contentProfile, statusMap, priorityNative. |
| `supportedActions` | JSON array | Yes | From `describe()`. Each with actionId, label, appliesToTypes, requiredPermission, formSchema. |
| `capabilities` | JSON object | Yes | From `describe()`. |
| `visibleToRoles` | array of role | Yes | ≥1 role. Controls nav, queue fan-out, and admin visibility. |
| `timeoutMs`, `actionTimeoutMs`, `healthTimeoutMs` | integer | Yes | Defaults and bounds per `FR-F08a-05`. |
| `maxRetries`, `backoffInitialMs`, `backoffMultiplier`, `backoffJitterPct` | numeric | Yes | Defaults and bounds per `FR-F08a-05`. |
| `circuitFailureThreshold`, `circuitOpenMs`, `circuitHalfOpenProbes` | integer | Yes | Defaults and bounds per `FR-F08a-05`. |
| `healthProbeIntervalSec` | integer | Yes | Default 30; bounds 10–600. |
| `iconToken` | string | Yes | A USWDS/theme token name — **never a color or an image URL** (NFR-03). Validated against the token set. |
| `enabled` | boolean | Yes | Default true. Runtime toggle. |
| `isDemoSixthApp` | boolean | No | Marks the app shipped-but-unregistered for the live demo. |
| `registeredAt`, `registeredByPrincipalId`, `updatedAt`, `updatedByPrincipalId` | — | Yes | Provenance, shown in the console. |
| `lastDescribeAt`, `lastDescribePayload` | — | No | Cached capability metadata. |

**Validation rules:** Detailed in `FR-F12-02`. `applicationId` immutability is enforced: an edit attempting to change it is rejected, because existing `workItemId`s and audit records reference it.

**Acceptance criteria:**
- AC-1: All five spokes exist as registry rows at startup; none is referenced by name in hub code.
- AC-2: Changing `displayName` changes every badge, breadcrumb, error message, and new audit record without a restart.

---

### FR-F08b-02 — Registry-derived behavior (the no-hard-coding rule)

**Description:** Every place the hub must know "which applications exist" and what it reads.

| Behavior | Derives from | Requirement |
|---|---|---|
| Work-queue fan-out | `enabled = true AND activeRole ∈ visibleToRoles` | `FR-F05-02` |
| Dashboard widget sources | same | `FR-F04-01` |
| Search fan-out | same AND `capabilities.supportsSearch` | `FR-F03-07` |
| Navigation items | `visibleToRoles` ∩ role matrix | `FR-F02-06` |
| Health monitoring targets | `enabled = true` | `FR-F16-02` |
| Admin inventory | all rows, enabled and disabled | `FR-F11-01` |
| Source badges and labels | `displayName`, `iconToken` | `FR-F05-07` |
| Work-item type rendering | `workItemTypes[].contentProfile` | `FR-F06-02` |
| Available actions | `supportedActions` ∩ role matrix ∩ spoke state | `FR-F02-05` |
| Timeout/retry/circuit policy | per-row settings | `FR-F08a-05` |
| Related-item resolution targets | `RelatedRef.targetSystem` looked up in registry | `FR-F06-05` |
| Orchestration legs | `workflow definition → applicationId` | `FR-F07b-07` |
| Error message system names | `displayName` | `Y2` |

**Rules:**
1. A CI check greps the hub source for the literal strings `EAPP`, `IEP`, `PVQ`, `PDT`, `IM` outside of seed data, tests, and adapter implementation packages. Any occurrence in hub core fails the build. This is the mechanical enforcement of R-07.
2. A `RelatedRef` naming an application absent from the registry is dropped with `INTEGRATION_UNKNOWN_TARGET` and never rendered (`FR-F06-05`).
3. Removing a registry row removes the application from every surface listed above with no code change and no error (PRD F8 acceptance signal).

**Acceptance criteria:**
- AC-1: The grep check passes.
- AC-2: De-registering an application cleanly removes it from navigation, queue, search, health, and console.

---

### FR-F08b-03 — Runtime enable/disable

**Description:** Turning an application off at runtime, without a redeploy or restart.

**Inputs:** `PATCH /api/admin/applications/{applicationId}` with `{ enabled: boolean, reason: string (required, 10–500 chars) }`.

**Processing / business rules:**
1. Administrator-only, authorized and audited (`ADMIN.APP.DISABLE`).
2. Disabling: the application is excluded from fan-out, search, navigation, and health probing immediately on the next request. In-flight calls complete; no new calls are issued.
3. `registryVersion` is incremented. Clients polling `GET /api/registry-version` (every 30 s, and on every navigation) detect the change and re-fetch entitlements, updating navigation without a reload.
4. Existing deep links to a disabled application's items return 409 `APPLICATION_DISABLED` with a specific message — not a 404 and not a silent redirect, because the user deserves to know the system was turned off rather than that their item vanished.
5. Re-enabling restores everything and triggers an immediate health probe rather than waiting for the next interval.
6. Disabling writes an audit record with the supplied reason in `afterSummary`.
7. Disabling an application that is a leg in an active orchestration definition produces a warning at the confirmation step: "{n} cross-system workflows use this application and will stop working while it's off." The administrator may proceed; the warning is recorded.

**Validation rules:** `reason` required — a state change with operational impact is not permitted without a recorded justification.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Missing reason | 400 | `VALIDATION_FAILED` | "Enter a reason for this change." |
| Application not found | 404 | `APPLICATION_NOT_FOUND` | "We couldn't find that application. It may have been removed." |
| Access to a disabled app's item | 409 | `APPLICATION_DISABLED` | "{System} is turned off in this environment. Contact your administrator if you need access." |

**Acceptance criteria:**
- AC-1: Disabling an application removes its nav item and queue rows within one poll interval, with no restart (NFR-11).
- AC-2: Re-enabling restores them and health turns `HEALTHY` within one probe.
- AC-3: Both transitions are audited with the reason.

---

### FR-F08b-04 — Role visibility and per-application access scoping

**Description:** Which roles can see an application at all — a coarse gate layered above the per-resource policy.

**Processing / business rules:**
1. `visibleToRoles` is a registry field set at registration and editable afterwards.
2. It is a **restriction**, never a grant: a role listed in `visibleToRoles` still requires the matching role-matrix permission and must pass attribute and ownership gates. Registering an application visible to `APPLICANT` does not grant applicants anything they could not otherwise access.
3. A role not listed never sees the application in navigation, queue, search, or related-item resolution. An attempted access returns `AUTHZ_DENIED`, indistinguishable from any other denial.
4. Changing `visibleToRoles` bumps `registryVersion` and is audited.
5. Default at registration: the roles the administrator selects, with none pre-checked — the form requires a deliberate choice rather than defaulting to broad visibility.

**Acceptance criteria:**
- AC-1: An application visible only to Investigator does not appear for Adjudicator in any surface.
- AC-2: Adding a role to `visibleToRoles` does not bypass the role matrix; access still requires the relevant permission.

---

### FR-F08b-05 — Adapter call logging feeding audit and integration issues

**Description:** Every adapter call is observable, and failures reach both the integration log and (where they accompany a user action) the audit chain.

**Processing / business rules:**
1. Every adapter call emits a structured log entry: `{ correlationId, requestId, applicationId, operation, principalId, outcome, latencyMs, errorClass?, attempt, circuitState }`.
2. Failures (`AdapterError` classes per `FR-F08a-06`, excluding `ADAPTER_NOT_FOUND` and `ADAPTER_REJECTED`) additionally insert an `integration_issues` row visible in the admin console (`FR-F11-03`).
3. Calls made during a mutating user action contribute to the audit chain through their shared correlation ID; the audit record references the adapter `requestId` so an administrator can move from audit to integration log and back.
4. Logs never contain the principal assertion, session cookie, one-time codes, or full request payloads of action forms; narrative text is recorded in the audit `afterSummary` (which is the appropriate place), not in adapter logs.
5. Latency is recorded on every call and feeds the health view's rolling latency figure.

**Acceptance criteria:**
- AC-1: A failed adapter call produces one integration issue correlated to the user's action.
- AC-2: An administrator can navigate audit → integration issue → application detail for the same correlation ID.
- AC-3: No secret or credential material appears in any log, verified by scan.

---

### FR-F08b-06 — Registry integrity and startup validation

**Description:** A malformed registry must fail loudly at startup rather than producing subtly broken behavior at demo time.

**Processing / business rules:**
1. At startup the hub validates every registry row: required fields, ID format, URL validity, bounds on all policy numbers, `adapterType` resolvable, `iconToken` in the token set, `visibleToRoles` non-empty and valid, every `requiredPermission` present in the role matrix.
2. A row failing validation is marked `INVALID`, excluded from all user-facing surfaces, and surfaced in the admin console with the specific field and reason. The hub still starts — one bad row must not prevent the demo — but the condition is loudly visible, not silent.
3. At startup, `describe()` and `healthCheck()` are called for every enabled row; results update `contractVersion`, cached capabilities, and initial health. Unreachable applications start in `DOWN` with an integration issue recorded, and the console says so.
4. `registryVersion` is recomputed at startup so clients refresh entitlements after a restart.

**Error handling:**

| Scenario | Behavior | Admin console copy |
|---|---|---|
| Row fails validation | Row `INVALID`, excluded | "This application's configuration has a problem: {field} — {reason}. It won't appear for users until it's fixed." |
| `describe()` unreachable at startup | Health `DOWN`, cached capabilities retained | "We couldn't reach {System} at startup. Users will see a degraded warning until it responds." |
| Contract version unsupported | Row `INCOMPATIBLE`, excluded | "This application uses an integration version we don't support yet (version {v})." |

**Acceptance criteria:**
- AC-1: A deliberately corrupted registry row produces a specific console message and does not break any user-facing screen.
- AC-2: The hub starts successfully with one spoke stopped, showing that spoke as `DOWN`.

---
