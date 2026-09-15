## Y1b — Spoke Service Mock API Surfaces

Each of the six simulated services exposes its own independent HTTP API on its own port. These APIs are callable directly — which is how the demo **proves** dual-system change rather than asserting it (`FR-F09-08`, SM-03, SM-13).

**Reachable only by the hub's adapters** in normal operation, plus by a demo operator holding a short-lived operator token (`FR-F09-08`).

---

### Common contract (every spoke)

**Required request headers** on all data endpoints:

| Header | Required | Notes |
|---|---|---|
| `X-UAL-Principal` | Yes | Signed principal assertion; `audience` MUST equal this service (`FR-F01-02`) |
| `X-UAL-Correlation-Id` | Yes | ULID; echoed on the response |
| `X-UAL-Request-Id` | Yes | ULID, unique per call |
| `X-UAL-Scope` | Yes on reads | `{ mode, subjectRef?, principalId?, organization?, assignedRegion? }` — absent scope is refused (`FR-F09-07` rule 2) |
| `X-UAL-Idempotency-Key` | Yes on mutations | ULID (`FR-F09-07` rule 3) |
| `X-UAL-Deadline` | Yes | Absolute ISO-8601; the service aborts at the deadline |

**Common response envelope (success):** every body carries `"_synthetic": true` and every record carries `syntheticMarker` (`FR-F17-08`).

**Common response envelope (error):** `{ "code": "...", "message": "...", "detail": "..." }` — `message` is plain language and safe to surface **only** for `ACTION_REJECTED` (`FR-F08a-06` rule 2).

**Common error codes:**

| HTTP | Code | Meaning | Adapter maps to |
|---|---|---|---|
| 400 | `SCOPE_REQUIRED` | Scope header missing or malformed | `ADAPTER_CONTRACT_ERROR` |
| 400 | `VALIDATION_FAILED` | Payload invalid | `ADAPTER_REJECTED` |
| 401 | `PRINCIPAL_REJECTED` | Assertion missing, unsigned, wrong audience, expired | `ADAPTER_PRINCIPAL_REJECTED` |
| 403 | `FORBIDDEN` | Spoke-side denial for this principal | `ADAPTER_FORBIDDEN` |
| 404 | `NOT_FOUND` | Unknown entity | `ADAPTER_NOT_FOUND` |
| 409 | `IDEMPOTENCY_KEY_REUSED` | Same key, different payload | `ADAPTER_REJECTED` |
| 409 | `STATE_CONFLICT` | `stateVersion` stale | `ADAPTER_REJECTED` |
| 422 | `ACTION_REJECTED` | Business rejection; `message` is user-safe | `ADAPTER_REJECTED` |
| 429 | `RATE_LIMITED` | Throttled | `ADAPTER_RATE_LIMITED` |
| 503 | `SERVICE_UNAVAILABLE` | Injected or genuine unavailability | `ADAPTER_UNREACHABLE` |

**Common endpoints on every spoke:**

| Method | Path | Assertion required | Purpose |
|---|---|---|---|
| GET | `/health` | **No** | `{ status, latencyMs, version, checkedAt, detail? }` — no assertion, so a spoke with a broken auth path is still probeable (`FR-F09-07` rule 6) |
| GET | `/describe` | No | Capability metadata (`FR-F08a-02`) |
| POST | `/admin/injection` | Operator token | `{ mode, slowMs?, errorRatePct?, durationSec? }` (`FR-F16-11`) |
| GET | `/admin/injection` | Operator token | Current injection state |

---

### §eApp — port 7101, namespace `eapp`

| Method | Path | Purpose |
|---|---|---|
| GET | `/cases` | Scoped list; query `status`, `assignee`, `dueFrom`, `dueTo`, `q`, `limit`, `cursor` |
| GET | `/cases/{caseId}` | Full case: sections, answers, outstanding issue refs, related refs |
| GET | `/cases/{caseId}/activity` | eApp's own history |
| GET | `/cases/{caseId}/sections/{sectionCode}` | One questionnaire section with answers |
| POST | `/cases/{caseId}/actions/{actionId}` | Execute an action |
| GET | `/subjects/{subjectRef}` | Subject record (scope-checked) |

**Actions:** `ACKNOWLEDGE_ASSIGNMENT`, `REQUEST_CLARIFICATION`, `RECORD_FINDING`, `ADJUDICATE_CASE`, `RETURN_FOR_CLARIFICATION`, `SUBMIT_APPLICANT_RESPONSE`, `CLEAR_OUTSTANDING_ISSUE`.

**`POST /cases/CASE-A-1042/actions/CLEAR_OUTSTANDING_ISSUE`** — the flagship's eApp leg
Request: `{ issueRef: "ISS-2207", resolvedDisposition: "SUBSTANTIATED", stateVersion }`
→ `200 { outcome: "APPLIED", case: {…}, stateVersion, appliedAt }`
**Idempotent:** if `issueRef` is absent from `outstanding_issue_refs`, returns `200` with `outcome: "APPLIED"` and no change (`FR-F09-02` rule 5) — this is what makes the flagship retry safe.
Errors: `409 STATE_CONFLICT`, `422 ACTION_REJECTED` ("This case can't be updated in its current state."), `404 NOT_FOUND`.

**Demo verification call (`FR-F18-05` step 12):**
```
GET http://localhost:7101/cases/CASE-A-1042
→ { "caseState": "REVIEW_COMPLETE_PENDING_ADJUDICATION",
    "outstandingIssueCount": 0, "outstandingIssueRefs": [], "_synthetic": true }
```

---

### §PVQ — port 7102, namespace `pvq`

| Method | Path | Purpose |
|---|---|---|
| GET | `/issues` | Scoped list; query `status`, `parentCaseRef`, `subjectRef`, `assignee`, `q`, `limit`, `cursor` |
| GET | `/issues/{issueId}` | Full issue incl. `parentCaseRef`, `answerLocus`, `answerSectionLabel`, `answerSnapshot` |
| GET | `/issues/{issueId}/summary` | Lightweight summary for related-item panels |
| GET | `/issues/{issueId}/activity` | PVQ's own history |
| POST | `/issues/{issueId}/actions/{actionId}` | Execute an action |
| GET | `/questionnaires/{id}` | Questionnaire record |

**Actions:** `RESOLVE_ISSUE`, `REQUEST_CLARIFICATION`, `ASSIGN_ISSUE`, `START_REVIEW`.

**`POST /issues/ISS-2207/actions/RESOLVE_ISSUE`** — the flagship's PVQ leg
Request: `{ disposition: "SUBSTANTIATED", narrative: "…", stateVersion }`
→ `200 { outcome: "APPLIED", issue: { status: "RESOLVED_SUBSTANTIATED", disposition, resolutionNarrative, resolvedBy, resolvedByPrincipalId, resolvedAt }, stateVersion, appliedAt }`
Permitted only from `OPEN` or `IN_REVIEW`. Idempotent on `X-UAL-Idempotency-Key`.
Errors: `422 ACTION_REJECTED` — `message`: **"This issue has already been resolved."**; `409 STATE_CONFLICT`; `404 NOT_FOUND`.

**Demo verification call:**
```
GET http://localhost:7102/issues/ISS-2207
→ { "status": "RESOLVED_SUBSTANTIATED", "disposition": "SUBSTANTIATED",
    "parentCaseRef": "CASE-A-1042", "resolvedBy": "Marcus Vale", "_synthetic": true }
```

---

### §IEP — port 7103, namespace `iep`

| Method | Path | Purpose |
|---|---|---|
| GET | `/individuals/{subjectRef}/status` | Status record with plain-language stage explanation |
| GET | `/notices` | Scoped list; query `readState`, `severity` |
| GET | `/notices/{noticeId}` | Notice detail |
| GET | `/tasks` | Scoped list; query `status`, `dueFrom`, `dueTo` |
| GET | `/tasks/{taskId}` | Task detail incl. `responseSchema` |
| POST | `/notices/{noticeId}/actions/ACKNOWLEDGE_NOTICE` | Sets `read_at` |
| POST | `/tasks/{taskId}/actions/COMPLETE_TASK` | Validates against `responseSchema` |
| GET | `/activity` | IEP's own history, scoped |

**Scope note:** IEP accepts `mode: SUBJECT` only. A request with `mode: ASSIGNEE_OR_UNIT` or `ORG` returns `400 SCOPE_REQUIRED` with detail "This service serves individual-scoped requests only." — IEP is `visibleToRoles: [APPLICANT]`.

**Errors:** `422 ACTION_REJECTED` — "This task has already been completed." / "This notice has already been acknowledged."

---

### §PDT — port 7104, namespace `pdt`

| Method | Path | Purpose |
|---|---|---|
| GET | `/designations` | Scoped list; query `status`, `sensitivityLevel`, `riskLevel`, `q` |
| GET | `/designations/{designationId}` | Full designation incl. risk factors and the tier rule text |
| GET | `/designations/{designationId}/activity` | PDT's own history |
| POST | `/designations/{designationId}/actions/{actionId}` | Execute an action |
| GET | `/tier-rules` | The displayable rule table (`FR-F06-09`) |

**Actions:** `APPROVE_DESIGNATION`, `RETURN_DESIGNATION` (`{ reason }`, 10–1000 chars).

**Capability note:** PDT's `describe()` declares `priorityNative: false` and emits no `dueDate`, deliberately exercising the normalization rules in `FR-F05-02` and the "Priority not provided by PDT" affordance.

**Errors:** `422 ACTION_REJECTED` — "This designation isn't awaiting review." / `400 VALIDATION_FAILED` — "Enter a reason for returning this designation."

---

### §IM — port 7105, namespace `im`

| Method | Path | Purpose |
|---|---|---|
| GET | `/investigations` | Scoped list; query `status`, `priority`, `assignee`, `dueFrom`, `dueTo`, `q` |
| GET | `/investigations/{investigationId}` | Full investigation incl. leads and assignment |
| GET | `/investigations/{investigationId}/leads` | Leads list |
| GET | `/investigations/{investigationId}/activity` | IM's own history |
| POST | `/investigations/{investigationId}/actions/{actionId}` | Execute an action |
| GET | `/workload/{principalId}` | Investigator workload counts |

**Actions:** `ACCEPT_ASSIGNMENT`, `UPDATE_CASE_STATUS` (`{ status, note }`), `ADD_LEAD_NOTE` (`{ leadId, note }`), `REQUEST_EXTENSION` (`{ requestedDueDate, reason }`).

**Demo note:** IM is the designated outage-demonstration spoke (`FR-F09-06` rule 6). Stopping this process, or injecting `UNAVAILABLE`, is what drives the degraded-state script (`FR-F18-06` script 2).

**Errors:** `422 ACTION_REJECTED` — "This assignment has already been accepted." / "This investigation is closed and can't be updated."

---

### §CVS — port 7106, namespace `cvs` (demo sixth application)

| Method | Path | Purpose |
|---|---|---|
| GET | `/alerts` | Scoped list; query `status`, `priority`, `assignee`, `q` |
| GET | `/alerts/{alertId}` | Alert detail |
| GET | `/alerts/{alertId}/summary` | Lightweight summary |
| GET | `/alerts/{alertId}/activity` | CVS's own history |
| POST | `/alerts/{alertId}/actions/{actionId}` | Execute an action |

**Actions:** `ACKNOWLEDGE_ALERT`, `CLEAR_ALERT` (`{ reason }`, required), `ESCALATE_ALERT` (`{ reason }`, required).

**`GET /describe`** returns work-item type `CVS_ALERT` with status map `NEW→OPEN`, `UNDER_REVIEW→IN_PROGRESS`, `CLEARED→CLOSED`, `ESCALATED→BLOCKED`, and `capabilities.supportsSearch: true`, `supportsSummary: true`, `supportsActivityHistory: true`.

**Registration note:** CVS runs from first startup but has **no registry row** until an administrator registers it live (`FR-F12-06`). It is a fully ordinary conformant service; nothing in the hub special-cases it, which is the entire point of the extensibility demonstration.

---

### Port and namespace map

| Service | Port | Namespace | Registered at seed |
|---|---|---|---|
| Hub API | 7100 | `hub` | — |
| Web UI | **3000**, bound `0.0.0.0` | — | — |
| eApp | 7101 | `eapp` | Yes |
| PVQ | 7102 | `pvq` | Yes |
| IEP | 7103 | `iep` | Yes |
| PDT | 7104 | `pdt` | Yes |
| IM | 7105 | `im` | Yes |
| CVS | 7106 | `cvs` | **No** — registered live during the demo |

All ports are configurable via a single environment file (`FR-F18-01` rule 6).

> **Amended per TechArch ADR-013,** which supersedes this map's original web UI port of **7000**. The demo is presented through an embedded preview harness that expects a conventional development port and requires a deterministic `0.0.0.0` bind to reach the service from the host. A boot assertion fails fast if the bind host is not `0.0.0.0` or the port is not 3000, so a misconfiguration surfaces as a clear startup error rather than as an application nobody can reach. **Every other port in this map is adopted unchanged.**

---
