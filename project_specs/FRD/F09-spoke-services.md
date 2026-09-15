## F9 — Five Simulated Spoke Services with Isolated Data Namespaces

**Traces to:** PRD F9 (P0); NFR-08, SM-13, R-05. **Schema:** `Y0b`. **API:** `Y1b`.

**Description:** eApp, IEP, PVQ, PDT, and Investigation Management implemented as five genuinely separate simulated services — separate processes, separate HTTP APIs, separate data namespaces — each with realistic domain behavior for the workflows in scope. The separation must be real and observable, because a reviewer who suspects a shared database has no reason to believe anything else in the demonstration.

**Terminology:**
- **Namespace** — one spoke's exclusive data store. No other service, including the hub, reads it directly.
- **Opaque reference** — a cross-system identifier a spoke stores but never resolves.
- **Spoke activity** — a spoke's own internal history, independent of the hub's audit log.

---

### FR-F09-01 — Service isolation (the deliverable)

**Description:** What "separate" means concretely, and how it is verified.

**Processing / business rules:**
1. Each spoke runs as its **own process**, listening on its own port, startable and stoppable independently (`FR-F18-02`).
2. Each spoke owns **its own database/schema namespace** with its own credentials. The demo provisions six namespaces: `hub`, `eapp`, `iep`, `pvq`, `pdt`, `im` (plus `cvs` for the demo sixth application). Each service's credentials grant access to exactly one namespace — isolation enforced by grants, not by convention.
3. **No shared tables.** No table is readable by more than one service. There is no "common" or "shared" schema. Where two systems refer to the same real-world thing (a subject), each holds its own row keyed by the same opaque `subjectRef` string, with no foreign key between them.
4. **No cross-service database access and no cross-service HTTP calls between spokes.** A spoke's only inbound caller is the hub, via its adapter. A spoke makes no outbound calls at all.
5. All cross-system relationships are opaque references resolved exclusively by the hub (`FR-F07a-01`).
6. Verification: (a) an architecture test asserts each service's connection string targets only its own namespace; (b) a runtime test asserts each service's credentials cannot read another namespace; (c) a network test asserts no spoke-to-spoke traffic; (d) during the demo, each spoke's API is queried directly to show independent state (SM-03, SM-13).

**Error handling:** An attempted cross-namespace read fails at the database permission layer, is logged, and surfaces as `ADAPTER_INTERNAL` — it cannot silently succeed.

**Acceptance criteria:**
- AC-1: Stopping any single spoke leaves the hub and the remaining four fully functional with a visible degraded warning (PRD F9 acceptance signal, SM-15).
- AC-2: Each spoke's credentials are proven unable to read any other namespace.
- AC-3: Zero shared tables exist, verified by schema inspection.

---

### FR-F09-02 — eApp (Electronic Application)

**Description:** Synthetic SF-86-style security questionnaire submissions: sections, answers, case records, submission status, and case state transitions.

**Entities:** `subjects`, `cases`, `questionnaire_sections`, `answers`, `case_activity`, `case_assignments`. Full DDL in `Y0b §eApp`.

**Domain behavior:**
1. A case has `caseState ∈ { DRAFT, SUBMITTED, UNDER_REVIEW, INFORMATION_REQUESTED, REVIEW_COMPLETE_PENDING_ADJUDICATION, ADJUDICATED, CLOSED }` with a defined transition table; illegal transitions are rejected with `ADAPTER_REJECTED` and a plain reason.
2. A case carries `outstandingIssueCount` and `outstandingIssueRefs` (opaque PVQ identifiers). eApp never queries PVQ and never interprets the reference beyond string equality.
3. Questionnaire sections are addressable by a stable locus (`SECTION_13A`), and answers by a path within it — this is what a PVQ issue points at.
4. Actions exposed: `ACKNOWLEDGE_ASSIGNMENT`, `REQUEST_CLARIFICATION`, `RECORD_FINDING`, `ADJUDICATE_CASE`, `RETURN_FOR_CLARIFICATION`, `SUBMIT_APPLICANT_RESPONSE`, `CLEAR_OUTSTANDING_ISSUE`.
5. `CLEAR_OUTSTANDING_ISSUE(issueRef)` is **idempotent**: if `issueRef` is not in `outstandingIssueRefs`, it returns success with no change. This is what makes the flagship retry safe (`FR-F07b-03`).
6. When `outstandingIssueCount` reaches 0 from a non-zero value, `caseState` moves `UNDER_REVIEW → REVIEW_COMPLETE_PENDING_ADJUDICATION` and one `case_activity` row is written.
7. Work-item type emitted: `EAPP_CASE_REVIEW`. Relationship types emitted: `HAS_ISSUE`, `HAS_DESIGNATION`, `ASSIGNED_CASE`.

**Scope enforcement:** `mode: SUBJECT` → cases with matching `subjectRef`; `ASSIGNEE_OR_UNIT` → cases assigned to the principal or matching org+region; `ORG` → cases in the organization.

**Acceptance criteria:**
- AC-1: Clearing an already-cleared issue reference returns success without double-decrementing.
- AC-2: An illegal state transition is rejected with a readable reason.
- AC-3: A scoped query for subject A never returns subject B's case.

---

### FR-F09-03 — PVQ (Personnel Vetting Questionnaire)

**Description:** Forms plus issue items raised against specific questionnaire answers, with disposition, resolution narrative, and resolution state — the second half of the flagship workflow.

**Entities:** `questionnaires`, `questionnaire_responses`, `issues`, `issue_activity`. Full DDL in `Y0b §PVQ`.

**Domain behavior:**
1. `issues.status ∈ { OPEN, IN_REVIEW, RESOLVED_SUBSTANTIATED, RESOLVED_UNSUBSTANTIATED, RESOLVED_WITH_CLARIFICATION, REFERRED }`.
2. Each issue carries the relationship fields specified in `FR-F07a-01`: `parentSystem`, `parentCaseRef`, `answerLocus`, `answerSectionLabel`, `answerSnapshot`, `subjectRef`.
3. `RESOLVE_ISSUE(disposition, narrative)` is permitted only from `OPEN` or `IN_REVIEW`. From a resolved state it returns `ADAPTER_REJECTED` with "This issue has already been resolved."
4. Resolution records `resolvedBy`, `resolvedByPrincipalId`, `resolvedAt`, `disposition`, `resolutionNarrative`, and writes one `issue_activity` row.
5. `RESOLVE_ISSUE` is **idempotent on `X-UAL-Idempotency-Key`**: a repeat returns the original outcome without re-writing.
6. Actions exposed: `RESOLVE_ISSUE`, `REQUEST_CLARIFICATION`, `ASSIGN_ISSUE`, `START_REVIEW`.
7. Work-item type emitted: `PVQ_ISSUE`. Relationship type emitted: `ISSUE_AGAINST`.
8. PVQ never calls eApp. It stores `parentCaseRef` as a string and nothing more.

**Acceptance criteria:**
- AC-1: Resolving an already-resolved issue is rejected with the specified plain message.
- AC-2: Idempotent repeat produces one state change and one activity row.
- AC-3: The seeded flagship issue `ISS-2207` references `CASE-A-1042` and `SECTION_13A`.

---

### FR-F09-04 — IEP (Individual Engagement Portal)

**Description:** Individual-facing status records, notices, and outstanding tasks for applicant personas.

**Entities:** `individuals`, `status_records`, `notices`, `tasks`, `iep_activity`. Full DDL in `Y0b §IEP`.

**Domain behavior:**
1. A status record maps a `subjectRef` to a plain-language stage: `SUBMITTED`, `UNDER_REVIEW`, `INFORMATION_REQUESTED`, `COMPLETE`, each with a user-readable explanation string stored in IEP (so the copy is data, not code).
2. Notices have `title`, `body`, `issuedAt`, `readAt`, `severity`. `ACKNOWLEDGE_NOTICE` sets `readAt`.
3. Tasks have `title`, `description`, `dueDate`, `status ∈ { OPEN, COMPLETE }`, and an optional `responseSchema` driving the completion form. `COMPLETE_TASK` validates against it.
4. IEP is the only spoke whose primary audience is `APPLICANT`; its `visibleToRoles` is `[APPLICANT]`.
5. Work-item types emitted: `IEP_TASK`, `IEP_NOTICE`.
6. IEP holds a `subjectRef` matching eApp's for the same synthetic person, with no foreign key and no cross-query.

**Acceptance criteria:**
- AC-1: An applicant's tasks and notices are retrievable only under `mode: SUBJECT` matching their own `subjectRef`.
- AC-2: The zero-item applicant persona returns empty sets cleanly (`FR-F17-06`).

---

### FR-F09-05 — PDT (Position Designation Tool)

**Description:** Position sensitivity/risk designations, resulting investigation tier, and designation review work items.

**Entities:** `positions`, `designations`, `risk_factors`, `designation_activity`. Full DDL in `Y0b §PDT`.

**Domain behavior:**
1. A designation records `sensitivityLevel ∈ { NON_SENSITIVE, NONCRITICAL_SENSITIVE, CRITICAL_SENSITIVE, SPECIAL_SENSITIVE }` and `riskLevel ∈ { LOW, MODERATE, HIGH }`, producing `investigationTier ∈ { T1, T3, T5 }` by a stored, displayable rule table — the rule that produced the tier is shown on screen (`FR-F06-09`).
2. `designations.status ∈ { DRAFT, PENDING_REVIEW, APPROVED, RETURNED }`.
3. Actions exposed: `APPROVE_DESIGNATION`, `RETURN_DESIGNATION` (reason required, 10–1000 chars).
4. Work-item type emitted: `PDT_DESIGNATION`. Relationship type emitted: `DESIGNATION_FOR` (opaque reference to an eApp case).
5. PDT declares `priorityNative: false` — it has no native priority. This is deliberate: it exercises the normalization rule in `FR-F05-02` and the UI's "Priority not provided by {system}" affordance.

**Acceptance criteria:**
- AC-1: Approving a designation changes PDT's own state, verified through PDT's API.
- AC-2: PDT items appear in the queue with `ROUTINE` priority and the "not provided" note.

---

### FR-F09-06 — IM (Investigation Management)

**Description:** Case assignment, investigative leads, investigator workload, and case status.

**Entities:** `investigations`, `assignments`, `leads`, `investigator_workload`, `im_activity`. Full DDL in `Y0b §IM`.

**Domain behavior:**
1. `investigations.status ∈ { OPEN, IN_PROGRESS, PENDING_INFORMATION, COMPLETE, CLOSED }` with priority `ROUTINE | ELEVATED | URGENT` (native, so `priorityNative: true`).
2. Assignments bind an investigation to an investigator `principalId` with `assignedAt` and `dueDate`; workload is a derived count per investigator.
3. Leads are child records with `status`, `dueDate`, and notes; `ADD_LEAD_NOTE` appends.
4. Actions exposed: `ACCEPT_ASSIGNMENT`, `UPDATE_CASE_STATUS`, `ADD_LEAD_NOTE`, `REQUEST_EXTENSION`.
5. Work-item type emitted: `IM_CASE_ASSIGNMENT`. Relationship type emitted: `CASE_ASSIGNMENT_FOR`.
6. **IM is the designated outage-demonstration spoke.** Its seed data includes overdue items so that removing it visibly changes counts (`FR-F17-07`), which makes the degraded-state demonstration legible rather than abstract.

**Acceptance criteria:**
- AC-1: IM contributes overdue items to the investigator queue and dashboard.
- AC-2: Forcing IM down produces the specified degraded warning naming IM and quantifying the gap (SM-15).

---

### FR-F09-07 — Common spoke service requirements

**Description:** Behavior every spoke implements identically, so the adapter contract is honoured uniformly.

**Processing / business rules:**
1. **Principal verification.** Every request MUST carry a valid `X-UAL-Principal` assertion with `audience` equal to this service. Missing, malformed, wrong-audience, or expired → 401 `PRINCIPAL_REJECTED`. A request without an assertion is refused even from localhost (`FR-F01-02`).
2. **Scope application.** Every read MUST apply the supplied `scope` in its own query (`FR-F02-04` rule 2). Returning out-of-scope rows is a defect the hub detects and reports.
3. **Idempotency.** Every mutating endpoint MUST honour `X-UAL-Idempotency-Key`, storing `{ key, requestHash, response, createdAt }` for 24 hours and replaying the stored response for a repeat. A repeat with the same key but a different payload returns 409 `IDEMPOTENCY_KEY_REUSED`.
4. **State versioning.** Every entity exposes a `stateVersion` that changes on any user-visible field change.
5. **Own activity log.** Every mutation writes a row to that service's own activity table, independent of the hub's audit log. The two are deliberately separate: the spoke's log is what the spoke knows, the hub's audit is what the platform knows, and the demo shows both (`FR-F06-06`).
6. **Health endpoint.** `GET /health` returns `{ status, latencyMs, version, checkedAt }` and never requires an assertion (so the monitor can probe a spoke whose auth path is broken).
7. **Failure injection.** Every spoke exposes an admin-only control surface (`FR-F16-11`) to force `UNAVAILABLE`, `SLOW(ms)`, `ERROR(rate)`, and `NORMAL`. Injected state affects data endpoints and is reflected honestly by `/health`.
8. **Correlation echo.** Every response echoes `X-UAL-Correlation-Id`.
9. **Error shape.** Spoke errors use `{ code, message, detail }` where `message` is plain language safe to surface for business rejections only (`FR-F08a-06` rule 2).
10. **Synthetic markers.** Every record carries `syntheticMarker: "DEMO-SYNTHETIC"` and every API response includes a top-level `"_synthetic": true` (`FR-F17-08`).

**Error handling:**

| Scenario | HTTP (spoke) | Code | Adapter maps to |
|---|---|---|---|
| Missing/invalid assertion | 401 | `PRINCIPAL_REJECTED` | `ADAPTER_PRINCIPAL_REJECTED` |
| Scope absent | 400 | `SCOPE_REQUIRED` | `ADAPTER_CONTRACT_ERROR` |
| Unknown entity | 404 | `NOT_FOUND` | `ADAPTER_NOT_FOUND` |
| Business rejection | 422 | `ACTION_REJECTED` | `ADAPTER_REJECTED` |
| Idempotency key reuse with different payload | 409 | `IDEMPOTENCY_KEY_REUSED` | `ADAPTER_REJECTED` |
| Injected unavailability | 503 | `SERVICE_UNAVAILABLE` | `ADAPTER_UNREACHABLE` |

**Acceptance criteria:**
- AC-1: All six services pass the shared conformance suite (`FR-F08a-08`).
- AC-2: A direct browser call to any spoke port is refused for lack of an assertion.
- AC-3: Every spoke response carries the synthetic marker.

---

### FR-F09-08 — Independent queryability (the proof surface)

**Description:** The demo must be able to prove dual-system change by querying each system directly, outside the hub.

**Processing / business rules:**
1. Each spoke's API is documented (`Y1b`) and callable with a demo-operator assertion token issued by `FR-F18-06` for demonstration purposes — a short-lived, administrator-generated assertion that lets a reviewer run `curl` against a spoke.
2. The demo script includes the exact commands for reading `PVQ:ISS-2207` and `EAPP:CASE-A-1042` before and after the flagship workflow (`FR-F18-05`).
3. Responses are JSON, human-readable, and include the fields the demo script asserts on (`FR-F07b-05`).
4. The operator token is itself audited on issuance and expires in 15 minutes.

**Acceptance criteria:**
- AC-1: A reviewer can query both spokes directly and observe the post-workflow state (SM-03).
- AC-2: Issuing an operator token writes an audit record.

---
