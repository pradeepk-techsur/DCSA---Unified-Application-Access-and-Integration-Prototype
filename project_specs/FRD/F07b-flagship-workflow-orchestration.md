## F7 (part B) — Flagship Workflow: Orchestration, Compensation, Confirmation, Audit

**Traces to:** PRD F7 (P0 — highest priority); R-06; SM-01, SM-03, SM-20. **Screens:** SCR-20 dual-system confirmation. **API:** `Y1a §Orchestration`.

**Description:** The distributed write at the heart of the flagship workflow. One user action mutates two independent systems that share no database and support no distributed transaction. This chunk states exactly what the hub does, in what order, what it does when the second write fails, what the user is told, and what the audit trail records. Nothing here is hand-waved: there is no two-phase commit available, so the behavior is a **forward-recovery saga with explicit partial-completion disclosure and an idempotent retry path**.

**Terminology:**
- **Orchestration** — the hub-coordinated sequence of adapter writes belonging to one user action.
- **Leg** — one spoke write within the orchestration (`PVQ leg`, `eApp leg`).
- **Partial completion** — the state in which one leg succeeded and another did not.
- **Compensation** — the action taken when a leg fails after a prior leg succeeded.
- **Reconciliation record** — the durable hub row that makes a partial completion recoverable rather than lost (`Y0a.orchestration_transactions`).

---

### FR-F07b-01 — Orchestration endpoint and execution sequence

**Description:** The single endpoint backing the flagship action, and the exact order of operations.

**Inputs:** `POST /api/orchestration/resolve-pvq-issue` — payload per `FR-F07a-04`.

**Processing / business rules — the sequence, in order:**
1. **Authorize.** Full decision per `FR-F02-01` for `ISSUE.RESOLVE` on `PVQ:ISS-2207`, and for `CASE.UPDATE_ISSUE_STATE` on `EAPP:CASE-A-1042`. **Both** must pass before anything is written. A principal authorized for one leg but not the other is denied outright with `AUTHZ_DENIED` — the hub never performs a half-authorized orchestration.
2. **Validate.** Payload validation per `FR-F07a-04`.
3. **Verify the relationship.** Read the issue from PVQ; confirm `parentCaseRef == parentCaseId`, `subjectRef` matches the case's subject, and the issue is in a resolvable state. Read the case from eApp; confirm it exists and lists this issue in `outstandingIssueRefs`.
4. **Pre-flight health.** Check the current circuit and health state of **both** applications. If either is `DOWN` or its circuit is open, the orchestration is refused **before any write** with `UPSTREAM_UNAVAILABLE` naming the system. Refusing up front is preferred to discovering it halfway.
5. **Create the reconciliation record.** Insert `Y0a.orchestration_transactions` with `{ transactionId, correlationId, principalId, workflow: "RESOLVE_PVQ_ISSUE", idempotencyKey, legs: [{system: PVQ, state: PENDING}, {system: EAPP, state: PENDING}], state: IN_PROGRESS, createdAt }`. This row exists **before** any spoke is written, so a crash mid-orchestration is discoverable.
6. **Execute leg 1 — PVQ (the system of record for the issue).** `performAction(principal, ISS-2207, "RESOLVE_ISSUE", { disposition, narrative })`. PVQ is first because it owns the authoritative outcome; eApp's state is derived from it. On success, update the leg to `COMMITTED` with the spoke's returned state and write audit record #1 (`FR-F07b-06`).
7. **Execute leg 2 — eApp (the derived state).** `performAction(principal, CASE-A-1042, "CLEAR_OUTSTANDING_ISSUE", { issueRef: "ISS-2207", resolvedDisposition })`. On success, update the leg to `COMMITTED` and write audit record #2.
8. **Finalize.** Set the transaction `state = COMPLETED`, re-read both items from their spokes, and return per-system outcomes (`FR-F07b-04`).
9. **Failure branches** are specified in `FR-F07b-02` and `FR-F07b-03`.
10. **Idempotency.** `idempotencyKey` is unique-constrained on the transaction table. A repeat submission with the same key returns the stored outcome without re-executing either leg.
11. **Timeouts.** Each leg carries the registry-configured timeout (default 5 s). The eApp leg does not inherit time already spent on the PVQ leg; the overall request budget is 15 s, after which the response returns the current known state rather than hanging.
12. `REFERRED_FOR_FURTHER_REVIEW` executes leg 1 only; the transaction has a single leg and completes after step 6.

**Outputs:** `{ transactionId, correlationId, overallOutcome, systems: [ { applicationId, label, outcome, stateBefore, stateAfter, message } ], retry: { available, endpoint } | null }` where `overallOutcome ∈ COMPLETED | PARTIALLY_COMPLETED | FAILED`.

**Validation rules:** Steps 1–4 are all preconditions; none may be skipped, reordered, or made conditional on configuration.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Either leg unauthorized | 403 | `AUTHZ_DENIED` | "You don't have permission to resolve this issue." |
| Relationship verification failed | 400 | `RELATIONSHIP_MISMATCH` | "We couldn't confirm which case this issue belongs to. Refresh the page and try again — reference {correlationId}." |
| Either system unhealthy pre-flight | 503 | `UPSTREAM_UNAVAILABLE` | "{System} isn't responding right now, so nothing was changed. Try again when it's back." |
| Overall budget exceeded | 504 | `ORCHESTRATION_TIMEOUT` | "This is taking longer than expected. Check the issue's current status before trying again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: The reconciliation row exists before the first spoke write, verified by test with an injected crash.
- AC-2: A repeated `idempotencyKey` executes the legs exactly once.
- AC-3: An unhealthy eApp prevents the PVQ write from occurring at all.

---

### FR-F07b-02 — Failure of leg 1 (PVQ): clean abort

**Description:** The simple case — nothing was written, so nothing needs undoing.

**Processing / business rules:**
1. If the PVQ write fails for any reason (rejection, timeout, unavailability), the transaction is marked `FAILED`, leg 1 `FAILED` with its error class, and **no eApp call is attempted**.
2. One audit record is written: `action = ORCHESTRATION_FAILED`, `outcome = FAILURE`, `targetSystem = PVQ`, with the error class and the correlation ID.
3. The user sees an error on SCR-16 (not SCR-20, because there is no dual outcome to confirm): the message states unambiguously that **nothing changed**, and offers "Try again."
4. If the PVQ write times out with an indeterminate outcome, the transaction is marked `INDETERMINATE` rather than `FAILED`, and the message tells the user their outcome is unknown and how to check. Retry in this state is still safe because of idempotency at both the hub and the spoke (`FR-F09-07` requires spokes to honour `X-UAL-Idempotency-Key`).

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| PVQ rejected the action | 422 | `UPSTREAM_REJECTED_ACTION` | "PVQ couldn't resolve this issue: {plain reason from PVQ}. Nothing was changed." |
| PVQ unavailable | 503 | `UPSTREAM_UNAVAILABLE` | "PVQ isn't responding right now, so nothing was changed. Try again in a moment." |
| PVQ timeout, outcome unknown | 502 | `UPSTREAM_INDETERMINATE` | "We're not sure whether PVQ recorded your resolution. Refresh this issue to check its status before trying again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: A forced PVQ failure leaves eApp completely untouched, verified by direct eApp API read.
- AC-2: The user message correctly states that nothing changed.

---

### FR-F07b-03 — Failure of leg 2 (eApp): partial completion and compensation

**Description:** The hard case, and the one R-06 names. PVQ has committed; eApp has not. This is a distributed write across two independent systems with no shared transaction. Here is exactly what happens.

**Processing / business rules:**
1. **No rollback of leg 1 is attempted.** Reversing a recorded investigative disposition would fabricate a false history in the system of record and would itself require an audited mutation that never actually reflected the investigator's intent. PVQ's resolution stands. The chosen strategy is **forward recovery**, not compensation-by-reversal.
2. The transaction is marked `state = PARTIALLY_COMPLETED`, leg PVQ `COMMITTED`, leg EAPP `FAILED` with error class and attempt count.
3. A **compensation task** is enqueued in `Y0a.orchestration_retry_queue` with `{ transactionId, system: EAPP, operation, payload, attempts: 0, nextAttemptAt }`. The hub retries the eApp leg automatically with exponential backoff (5 s, 15 s, 45 s, 135 s; 4 attempts maximum), and stops when eApp succeeds or attempts are exhausted.
4. Automatic retry uses the same idempotency key, so a retry after an indeterminate first attempt cannot double-decrement `outstandingIssueCount`. eApp's `CLEAR_OUTSTANDING_ISSUE` is additionally specified as idempotent on `issueRef` (`Y0b §eApp`): clearing an already-cleared issue reference is a no-op returning success.
5. **The user is told immediately and precisely.** SCR-20 renders in partial state (`FR-F07b-04`) with per-system outcomes. The response NEVER reports overall success. The word "success" does not appear on a partial confirmation.
6. A **manual retry** control is offered: `POST /api/orchestration/{transactionId}/retry`, authorized to the original principal and to Administrators, idempotent, which attempts the outstanding leg immediately and returns fresh per-system outcomes.
7. If retries are exhausted, the transaction is marked `NEEDS_ATTENTION`, an `integration_issues` row is created with class `ORCHESTRATION_INCOMPLETE`, and it appears in the administrator's integration issues list (`FR-F11-03`) with a direct link to the transaction and its manual retry. The condition is surfaced to a human rather than being silently abandoned.
8. Until the eApp leg commits, the eApp case continues to display "1 outstanding issue" — which is **correct**, because that is genuinely eApp's state. The UI never fakes convergence. SCR-15 additionally shows, for the affected case, an advisory: "A resolution was recorded in PVQ on {date} but hasn't been applied to this case yet. We're retrying automatically."
9. Every retry attempt, successful or not, writes its own audit record sharing the original correlation ID, so the chain reads as one continuing narrative.

**Outputs:** `overallOutcome: PARTIALLY_COMPLETED` with per-system detail and a retry affordance.

**Validation rules:** Manual retry is permitted only while the transaction is `PARTIALLY_COMPLETED` or `NEEDS_ATTENTION`; retrying a `COMPLETED` transaction returns the stored outcome unchanged.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| eApp leg failed after PVQ committed | 207 | `ORCHESTRATION_PARTIAL` | "Partly completed. PVQ recorded your resolution. eApp hasn't been updated yet — we're retrying automatically. You can also retry now. Reference {correlationId}." |
| Manual retry failed again | 207 | `ORCHESTRATION_PARTIAL` | "eApp still isn't responding. PVQ's record is unchanged and correct. We'll keep retrying — reference {correlationId}." |
| Retry attempts exhausted | 207 | `ORCHESTRATION_NEEDS_ATTENTION` | "eApp couldn't be updated after several attempts. PVQ's record is correct. An administrator has been notified — reference {correlationId}." |
| Retry on a completed transaction | 200 | — | "This was already completed. Both systems are up to date." |

**Acceptance criteria:**
- AC-1: With eApp forced to fail, the response is 207 `ORCHESTRATION_PARTIAL`, the word "success" appears nowhere, and both per-system outcomes are shown accurately (R-06).
- AC-2: Restoring eApp causes automatic retry to converge within the backoff schedule with no user action, and the case then shows "No outstanding issues."
- AC-3: Exhausted retries produce exactly one `ORCHESTRATION_INCOMPLETE` integration issue visible to an administrator.
- AC-4: Double-execution of the eApp leg cannot decrement the outstanding count twice (idempotency test).

---

### FR-F07b-04 — Dual-system confirmation view (SCR-20)

**Description:** The screen that proves both systems changed, by reporting what each system independently says.

**Inputs:** Orchestration response; fresh re-reads from both spokes.

**Processing / business rules:**
1. After finalization the hub **re-reads** the issue from PVQ and the case from eApp through their adapters, and SCR-20 displays those returned states — not the values the hub intended to write. The distinction matters: the screen reports observed state, not asserted state.
2. Layout:
   - `<h1>` reflecting outcome: "Resolution complete" (COMPLETED) or "Partly completed" (PARTIALLY_COMPLETED) or "Not completed" (FAILED).
   - A summary alert matching outcome severity (success / warning / error), `role="status"` or `role="alert"` as appropriate, receiving focus on render.
   - A **per-system results table** with columns: System, What we asked for, What the system reports now, Outcome. One row per leg, each badged with the system name and carrying the timestamp of the re-read.
   - The narrative and disposition recorded, so the user can confirm what they submitted.
   - Actions: "View the updated issue in PVQ", "Return to eApp Case A-1042", "Back to work queue", "View audit trail for this action". Plus "Retry eApp update" when partial.
3. The table is a real `<table>` with `<caption>` "Results in each connected system", `scope` attributes, and text-plus-icon outcome indicators — never color alone.
4. The screen is announced once via live region: "Resolution complete. PVQ and eApp both updated." or "Partly completed. PVQ updated. eApp not updated."
5. If a re-read fails, that row reads "We couldn't confirm the current state in {System}." with a "Check again" control — the view degrades honestly rather than omitting the row.

**Outputs:** SCR-20 in one of three outcome presentations.

**Validation rules:** The screen MUST render all legs, including the ones that failed. A leg is never omitted for tidiness.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Re-read failed for a system | 200 | — | Row copy: "We couldn't confirm the current state in {System}." with "Check again." |

**Acceptance criteria:**
- AC-1: The confirmation table shows PVQ status `Resolved — Substantiated` and eApp `No outstanding issues`, both from fresh reads (SM-03).
- AC-2: In partial state the table shows one committed and one failed row, with the retry action present.
- AC-3: SCR-20 passes the accessibility scan and is fully keyboard-operable.

---

### FR-F07b-05 — Post-condition state model

**Description:** The exact expected state in both systems after a successful `SUBSTANTIATED` resolution — the demo script's assertion target.

**Post-conditions (PVQ, `Y0b §PVQ`):**
- `issue.status = RESOLVED_SUBSTANTIATED`
- `issue.disposition = SUBSTANTIATED`
- `issue.resolutionNarrative = {submitted narrative}`
- `issue.resolvedBy = {principal display name}`, `issue.resolvedByPrincipalId = {principalId}`
- `issue.resolvedAt = {UTC timestamp}`
- One new row in PVQ's own `issue_activity` table with actor and action

**Post-conditions (eApp, `Y0b §eApp`):**
- `case.outstandingIssueRefs` no longer contains `ISS-2207`
- `case.outstandingIssueCount` decremented by 1
- If count reaches 0: `case.caseState = REVIEW_COMPLETE_PENDING_ADJUDICATION`; otherwise `caseState` unchanged
- One new row in eApp's own `case_activity` table

**Post-conditions (hub):**
- `orchestration_transactions.state = COMPLETED`, both legs `COMMITTED`
- ≥5 `audit_events` rows sharing one `correlationId`
- Zero `integration_issues` rows for this correlation ID

**Acceptance criteria:**
- AC-1: Every post-condition is asserted by the E2E test via each system's own API (`FR-F19-01`).
- AC-2: The demo script states these post-conditions so a reviewer knows what to look for (`FR-F18-05`).

---

### FR-F07b-06 — Correlated audit chain for the workflow

**Description:** The whole workflow reads as one narrative in the audit viewer.

**Processing / business rules:**
1. The UI generates one workflow correlation ID when the investigator opens the case and sends it as `X-Correlation-Id` on every subsequent request in the workflow (`FR-F01-06`).
2. Records written, in order, all sharing that ID:

   | # | Action | Target system | Outcome | Notes |
   |---|---|---|---|---|
   | 1 | `WORK_ITEM_VIEWED` | EAPP | SUCCESS | case read |
   | 2 | `RELATED_ITEMS_RESOLVED` | HUB | SUCCESS | related refs resolved, targets listed |
   | 3 | `RELATED_ITEM_TRAVERSED` | HUB | SUCCESS | from case to issue |
   | 4 | `WORK_ITEM_VIEWED` | PVQ | SUCCESS | issue read |
   | 5 | `ORCHESTRATION_STARTED` | HUB | SUCCESS | transactionId, legs planned |
   | 6 | `ISSUE_RESOLVED` | PVQ | SUCCESS | before/after summary |
   | 7 | `CASE_ISSUE_CLEARED` | EAPP | SUCCESS | before/after summary |
   | 8 | `ORCHESTRATION_COMPLETED` | HUB | SUCCESS | overall outcome, per-leg states |

   Failure paths substitute `ORCHESTRATION_PARTIAL` / `ORCHESTRATION_FAILED` at #8 and add `ORCHESTRATION_RETRY_ATTEMPTED` records for each retry.
3. Records 6 and 7 each carry a `beforeSummary` / `afterSummary` describing the state change in plain language ("status: Open → Resolved — Substantiated"; "outstanding issues: 1 → 0").
4. SCR-34's chain view renders these as an ordered narrative with system badges and elapsed time between steps, plus a single-line summary at the top: "Investigator {name} resolved PVQ issue ISS-2207 against eApp case A-1042 on {date}. Both systems updated."
5. The chain is exportable (`FR-F13-08`) for the demo.

**Validation rules:** Every record MUST carry the correlation ID; an audit write missing it fails the operation (`FR-F13-01`).

**Error handling:** If audit writing fails at record 6, the PVQ write has already committed — the transaction is marked `AUDIT_GAP`, an `integration_issues` row of class `AUDIT_WRITE_FAILED` is created, and the user is shown the `AUDIT_WRITE_FAILED` message. This is deliberately treated as a serious condition: the system reports the action as not completed and surfaces the discrepancy rather than hiding it.

**Acceptance criteria:**
- AC-1: The flagship workflow renders as a single correlated chain of ≥5 records in the viewer (SM-20).
- AC-2: The chain view's summary line correctly names actor, both systems, and outcome.
- AC-3: A partial completion's chain clearly shows which leg failed and every retry attempt.

---

### FR-F07b-07 — Generalization: orchestration is not special-cased to one workflow

**Description:** The orchestration machinery is reusable, so a second cross-system workflow would not require new hub plumbing (NFR-19).

**Processing / business rules:**
1. Orchestrations are defined as configuration: `{ workflowId, legs: [{ applicationId, operation, payloadMapping, required }], preconditions, onLegFailure: ABORT | FORWARD_RECOVER }`.
2. `resolve-pvq-issue` is the first instance of this definition, not a bespoke code path. A second workflow (e.g. PDT designation change propagating to IM case tier) is addable by adding a definition plus adapter operations both spokes already declare.
3. Leg order, retry policy, and failure strategy come from the definition; the execution engine is generic.
4. The engine emits the same reconciliation rows, audit records, and confirmation shape for any workflow, so SCR-20 renders any orchestration without modification.

**Acceptance criteria:**
- AC-1: A second, trivial orchestration definition added in configuration executes end-to-end and renders on SCR-20 with no code change (design-review demonstrable).
- AC-2: The engine contains no reference to PVQ or eApp by name.

---
