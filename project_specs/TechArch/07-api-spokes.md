## 7. API Design — Spoke Mock Services

Six independent HTTP services on six ports, each backed by its own schema and its own credential. These APIs are **directly callable by an evaluator**, which is how the demo proves a dual-system write instead of asserting one: after resolving the issue in the unified UI, the reviewer curls PVQ and eApp separately and watches both report the change in their own words.

---

### 7.1 The Common Spoke Contract

Implemented once in `@ual/spoke-kit` and therefore identical across all six services. A seventh service written by someone else must satisfy this same contract, which is what makes the onboarding cost bounded.

**Required request headers on all data endpoints:**

| Header | Required | Notes |
|---|---|---|
| `X-UAL-Principal` | Yes | Ed25519-signed assertion; `aud` MUST equal this service or the request is rejected |
| `X-UAL-Correlation-Id` | Yes | ULID; echoed on the response and stored in the activity row |
| `X-UAL-Request-Id` | Yes | ULID, unique per call |
| `X-UAL-Scope` | Yes on reads | `{ mode, subjectRef?, principalId?, organization?, assignedRegion? }`; **absent scope is refused** |
| `X-UAL-Idempotency-Key` | Yes on mutations | ULID; honoured for 24 hours |
| `X-UAL-Deadline` | Yes | Absolute ISO-8601; the service aborts its own work at the deadline |

```ts
// packages/spoke-kit/src/assertion.ts — the verification every spoke performs, identically
export async function verifyPrincipal(header: string, selfId: string): Promise<Principal> {
  const { payload } = await jwtVerify(header, hubPublicKey, {
    algorithms: ['EdDSA'],
    audience: selfId,              // a PVQ-audience assertion replayed at eApp fails HERE
  });                              // expiry (5 min) is checked by jose
  if (!payload.principalId) throw new PrincipalRejected();
  return payload as unknown as Principal;
}
```

Four properties follow, and each is separately tested:

1. **A browser cannot call a spoke.** The browser holds a session cookie, not a signed assertion. A direct fetch from the page to `localhost:7102` is rejected `401 PRINCIPAL_REJECTED` (`FR-F01-02` AC-3).
2. **An assertion cannot be replayed sideways.** The `aud` claim binds it to one application (`FR-F01-02` AC-2).
3. **A spoke never authenticates a user.** It verifies the hub's attestation. The hub is the only session authority, which is what makes SSO propagation a one-way trust rather than six login integrations.
4. **`caseAssignments` is never sent to a spoke.** The hub evaluates assignment-based authorization itself, so a spoke cannot be induced to widen scope (`FR-F01-02` rule 5).

**Common response envelopes.** Success bodies carry `"_synthetic": true` and every record carries `syntheticMarker`. Error bodies are `{ code, message, detail }`, and `message` is safe to surface to a user **only** for `ACTION_REJECTED`.

**Common error codes and their hub mapping:**

| HTTP | Spoke code | Meaning | Adapter class | Hub → user |
|---|---|---|---|---|
| 400 | `SCOPE_REQUIRED` | Scope header missing or malformed | `ADAPTER_CONTRACT_ERROR` | 502 `UPSTREAM_CONTRACT_ERROR` |
| 400 | `VALIDATION_FAILED` | Payload invalid | `ADAPTER_REJECTED` | 400 `VALIDATION_FAILED` |
| 401 | `PRINCIPAL_REJECTED` | Assertion missing / unsigned / wrong audience / expired | `ADAPTER_PRINCIPAL_REJECTED` | 502 `UPSTREAM_REJECTED` + issue |
| 403 | `FORBIDDEN` | Spoke-side denial | `ADAPTER_FORBIDDEN` | 403 `AUTHZ_DENIED_UPSTREAM` |
| 404 | `NOT_FOUND` | Unknown entity | `ADAPTER_NOT_FOUND` | **403 `AUTHZ_DENIED`** (non-enumerable) |
| 409 | `IDEMPOTENCY_KEY_REUSED` | Same key, different payload | `ADAPTER_REJECTED` | 409 `STATE_CONFLICT` |
| 409 | `STATE_CONFLICT` | `stateVersion` stale | `ADAPTER_REJECTED` | 409 `STATE_CONFLICT` |
| 422 | `ACTION_REJECTED` | Business rejection; `message` is user-safe | `ADAPTER_REJECTED` | 422 `UPSTREAM_REJECTED_ACTION` |
| 429 | `RATE_LIMITED` | Throttled | `ADAPTER_RATE_LIMITED` | 503 `UPSTREAM_UNAVAILABLE` |
| 503 | `SERVICE_UNAVAILABLE` | Injected or genuine | `ADAPTER_UNREACHABLE` | 503 `UPSTREAM_UNAVAILABLE` |

Note the 404 → 403 conversion. A spoke honestly reports "no such issue"; the hub deliberately flattens that into the same denial a forbidden resource produces, so an attacker cannot enumerate identifiers by observing which ones exist.

**Common endpoints on every spoke:**

| Method | Path | Assertion? | Purpose |
|---|---|---|---|
| GET | `/health` | **No** | `{ status, latencyMs, version, checkedAt, detail? }` — deliberately unauthenticated so a spoke with a broken auth path is still probeable |
| GET | `/describe` | No | Capability metadata driving registration and the registry row |
| POST | `/admin/injection` | Operator token | `{ mode, slowMs?, errorRatePct?, durationSec? }` |
| GET | `/admin/injection` | Operator token | Current injection state |

---

### 7.2 Per-Spoke Surfaces

#### eApp — port 7101, namespace `eapp`

| Method | Path | Purpose |
|---|---|---|
| GET | `/cases` | Scoped list; `status`, `assignee`, `dueFrom`, `dueTo`, `q`, `limit`, `cursor` |
| GET | `/cases/{caseId}` | Full case: sections, answers, outstanding issue refs, related refs |
| GET | `/cases/{caseId}/activity` | eApp's own history |
| GET | `/cases/{caseId}/sections/{sectionCode}` | One questionnaire section with answers |
| POST | `/cases/{caseId}/actions/{actionId}` | Execute an action |
| GET | `/subjects/{subjectRef}` | Subject record (scope-checked) |

**Actions:** `ACKNOWLEDGE_ASSIGNMENT`, `REQUEST_CLARIFICATION`, `RECORD_FINDING`, `ADJUDICATE_CASE`, `RETURN_FOR_CLARIFICATION`, `SUBMIT_APPLICANT_RESPONSE`, `CLEAR_OUTSTANDING_ISSUE`.

```http
POST /cases/CASE-A-1042/actions/CLEAR_OUTSTANDING_ISSUE     ← the flagship's eApp leg
X-UAL-Principal: <Ed25519 JWT, aud=EAPP>
X-UAL-Idempotency-Key: 01JD7K2Q9X8V3MZ4R6TQ0000B

{ "issueRef": "ISS-2207", "resolvedDisposition": "SUBSTANTIATED", "stateVersion": "a91f…" }

200 { "outcome": "APPLIED", "case": { … }, "stateVersion": "c2b7…",
      "appliedAt": "2026-09-14T15:05:02Z", "_synthetic": true }
```

**Idempotent by design:** if `issueRef` is already absent from `outstanding_issue_refs`, the response is still `200 APPLIED` with no state change. Combined with a stable idempotency key, this is what makes forward-recovery retry of the flagship's second leg provably safe against double-decrementing `outstandingIssueCount` (`FR-F07b-03` rule 4).

#### PVQ — port 7102, namespace `pvq`

| Method | Path | Purpose |
|---|---|---|
| GET | `/issues` | Scoped list; `status`, `parentCaseRef`, `subjectRef`, `assignee`, `q`, `limit`, `cursor` |
| GET | `/issues/{issueId}` | Full issue incl. `parentCaseRef`, `answerLocus`, `answerSectionLabel`, `answerSnapshot` |
| GET | `/issues/{issueId}/summary` | Lightweight summary for related-item panels |
| GET | `/issues/{issueId}/activity` | PVQ's own history |
| POST | `/issues/{issueId}/actions/{actionId}` | Execute an action |
| GET | `/questionnaires/{id}` | Questionnaire record |

**Actions:** `RESOLVE_ISSUE`, `REQUEST_CLARIFICATION`, `ASSIGN_ISSUE`, `START_REVIEW`.

```http
POST /issues/ISS-2207/actions/RESOLVE_ISSUE                 ← the flagship's PVQ leg
{ "disposition": "SUBSTANTIATED", "narrative": "…", "stateVersion": "7f3c…" }

200 { "outcome": "APPLIED",
      "issue": { "status": "RESOLVED_SUBSTANTIATED", "disposition": "SUBSTANTIATED",
                 "resolutionNarrative": "…", "resolvedBy": "Marcus Vale",
                 "resolvedByPrincipalId": "01JD…", "resolvedAt": "2026-09-14T15:05:01Z" },
      "stateVersion": "e4a1…", "appliedAt": "2026-09-14T15:05:01Z", "_synthetic": true }
```

Permitted only from `OPEN` or `IN_REVIEW`; from a resolved state it returns `422 ACTION_REJECTED` with the user-safe message **"This issue has already been resolved."** Idempotent on `X-UAL-Idempotency-Key`.

#### IEP — port 7103, namespace `iep`

| Method | Path | Purpose |
|---|---|---|
| GET | `/individuals/{subjectRef}/status` | Status record with plain-language stage explanation |
| GET | `/notices` · `/notices/{noticeId}` | Scoped list and detail; `readState`, `severity` |
| GET | `/tasks` · `/tasks/{taskId}` | Scoped list and detail incl. `responseSchema` |
| POST | `/notices/{noticeId}/actions/ACKNOWLEDGE_NOTICE` | Sets `read_at` |
| POST | `/tasks/{taskId}/actions/COMPLETE_TASK` | Validates against `responseSchema` |
| GET | `/activity` | IEP's own history, scoped |

**Scope note.** IEP accepts `mode: SUBJECT` only. `ASSIGNEE_OR_UNIT` or `ORG` returns `400 SCOPE_REQUIRED`: *"This service serves individual-scoped requests only."* Registered `visibleToRoles: ["APPLICANT"]`.

#### PDT — port 7104, namespace `pdt`

| Method | Path | Purpose |
|---|---|---|
| GET | `/designations` | Scoped list; `status`, `sensitivityLevel`, `riskLevel`, `q` |
| GET | `/designations/{designationId}` | Full designation incl. risk factors and the tier rule text |
| GET | `/designations/{designationId}/activity` | PDT's own history |
| POST | `/designations/{designationId}/actions/{actionId}` | `APPROVE_DESIGNATION`, `RETURN_DESIGNATION` |
| GET | `/tier-rules` | The displayable rule table |

**Capability note.** PDT's `describe()` declares `priorityNative: false` and emits no `dueDate`, deliberately exercising normalization, nulls-last sorting, and the "Priority not provided by PDT" affordance. It is the negative control for the claim that the hub does not assume homogeneous sources.

#### IM — port 7105, namespace `im`

| Method | Path | Purpose |
|---|---|---|
| GET | `/investigations` | Scoped list; `status`, `priority`, `assignee`, `dueFrom`, `dueTo`, `q` |
| GET | `/investigations/{investigationId}` | Full investigation incl. leads and assignment |
| GET | `/investigations/{investigationId}/leads` · `/activity` | Leads; IM's own history |
| POST | `/investigations/{investigationId}/actions/{actionId}` | `ACCEPT_ASSIGNMENT`, `UPDATE_CASE_STATUS`, `ADD_LEAD_NOTE`, `REQUEST_EXTENSION` |
| GET | `/workload/{principalId}` | Investigator workload counts |

**IM is the designated outage-demonstration spoke.** Stopping this container, or injecting `UNAVAILABLE`, drives the degraded-state script.

#### CVS — port 7106, namespace `cvs` (the demo sixth application)

| Method | Path | Purpose |
|---|---|---|
| GET | `/alerts` · `/alerts/{alertId}` · `/alerts/{alertId}/summary` · `/alerts/{alertId}/activity` | Scoped list, detail, summary, history |
| POST | `/alerts/{alertId}/actions/{actionId}` | `ACKNOWLEDGE_ALERT`, `CLEAR_ALERT` (`{reason}`), `ESCALATE_ALERT` (`{reason}`) |

```jsonc
// GET /describe — what the registration wizard reads to pre-fill the capabilities step
{
  "applicationId": "CVS", "displayName": "Continuous Vetting Service",
  "adapterVersion": "1.0.0", "contractVersion": "1.0",
  "workItemTypes": [{ "type": "CVS_ALERT", "label": "Continuous vetting alert",
    "contentProfile": "ALERT_DETAIL", "priorityNative": true,
    "statusMap": { "NEW": "OPEN", "UNDER_REVIEW": "IN_PROGRESS",
                   "CLEARED": "CLOSED", "ESCALATED": "BLOCKED" } }],
  "actions": [ /* ACKNOWLEDGE_ALERT, CLEAR_ALERT, ESCALATE_ALERT */ ],
  "capabilities": { "supportsSearch": true, "supportsFilter": ["status","priority"],
                    "supportsContext": false, "supportsSummary": true,
                    "supportsActivityHistory": true, "maxPageSize": 200 },
  "relationshipTypesEmitted": [], "iconToken": "icon-shield-check"
}
```

CVS runs from first startup and has **no registry row** until an administrator registers it live. It is a fully ordinary conformant service; nothing in the hub special-cases it, which is the entire point of the extensibility demonstration.

---

### 7.3 Direct Verification: Proving the Dual-System Write

This is step 12 of the flagship demo script, and it is the moment a skeptical reviewer is either convinced or not. The evaluator leaves the unified UI entirely and asks each system directly.

```bash
# Issue a short-lived operator token (administrator-only, audited)
TOKEN=$(./run.sh token --audience=PVQ)

curl -s -H "X-UAL-Principal: $TOKEN" http://localhost:7102/issues/ISS-2207 | jq
# {
#   "issueId": "ISS-2207",
#   "status": "RESOLVED_SUBSTANTIATED",
#   "disposition": "SUBSTANTIATED",
#   "parentCaseRef": "CASE-A-1042",
#   "resolvedBy": "Marcus Vale",
#   "resolvedAt": "2026-09-14T15:05:01Z",
#   "_synthetic": true
# }

TOKEN=$(./run.sh token --audience=EAPP)
curl -s -H "X-UAL-Principal: $TOKEN" http://localhost:7101/cases/CASE-A-1042 | jq
# {
#   "caseId": "CASE-A-1042",
#   "caseState": "REVIEW_COMPLETE_PENDING_ADJUDICATION",
#   "outstandingIssueCount": 0,
#   "outstandingIssueRefs": [],
#   "_synthetic": true
# }
```

Two separate processes, two separate schemas, two separate credentials, two separate ports, two independent answers that agree. And the token minted for PVQ is rejected by eApp — the audience binding is demonstrable in the same breath:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -H "X-UAL-Principal: $(./run.sh token --audience=PVQ)" \
  http://localhost:7101/cases/CASE-A-1042
# 401
```

---

### 7.4 Port and Namespace Map

| Service | Host port | Namespace | Credential | Registered at seed |
|---|---|---|---|---|
| Web UI | **3000** | — | — | — |
| Hub API | 7100 | `hub` | `hub_service` | — |
| eApp | 7101 | `eapp` | `eapp_service` | Yes |
| PVQ | 7102 | `pvq` | `pvq_service` | Yes |
| IEP | 7103 | `iep` | `iep_service` | Yes |
| PDT | 7104 | `pdt` | `pdt_service` | Yes |
| IM | 7105 | `im` | `im_service` | Yes |
| CVS | 7106 | `cvs` | `cvs_service` | **No — registered live during the demo** |
| PostgreSQL | 7199 | all seven | `ual_owner` (migrations only) | — |

All ports come from `.env`. The web UI port deviates from `Y1b`'s 7000 per ADR-013.

---
