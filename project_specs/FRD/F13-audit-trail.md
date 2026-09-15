## F13 — Immutable Audit Trail and Audit Viewer

**Traces to:** PRD F13 (P0); NFR-06, NFR-07, SM-19, SM-20, R-15. **Screens:** SCR-33 audit viewer, SCR-34 record detail and chain view. **Schema:** `Y0a §audit_events`. **API:** `Y1a §Audit`.

**Description:** An append-only record of who did what, to what, and when — written on every state-changing operation across the platform, and viewable and filterable in the UI. The audit trail is not optional instrumentation: an action that cannot be audited does not complete.

**Terminology:**
- **Audit record** — one immutable row in `Y0a.audit_events`.
- **Chain** — all records sharing one `correlationId`, read as a single narrative.
- **Hash chain** — per-record hash linking each record to its predecessor, making tampering detectable.
- **Before/after summary** — a plain-language description of what changed, not a full data dump.

---

### FR-F13-01 — Mandatory audit write on every mutation

**Description:** The guarantee that makes the audit trail trustworthy.

**Inputs:** Every mutating operation's outcome, principal, target, and correlation context.

**Processing / business rules:**
1. The audit write occurs **inside** the mutation path, after the underlying change is confirmed and **before** the success response is composed (`FR-F10-01` step 9).
2. If the audit write fails, the operation is reported to the user as **not completed**, with `AUDIT_WRITE_FAILED`. The hub does not return success for an unaudited action under any circumstance.
3. Where the underlying spoke write already committed before the audit failure (unavoidable in a distributed write), the hub additionally: marks the orchestration or action record `AUDIT_GAP`, creates an `integration_issues` row of class `AUDIT_WRITE_FAILED` with every detail needed to reconstruct the event, and surfaces it to administrators. The discrepancy is recorded and visible rather than hidden — honesty about a gap is the only defensible behavior when the gap cannot be prevented.
4. Audit writes never depend on a spoke's availability; they are hub-local.
5. A registry of mutating endpoints and their expected audit action types is asserted by test (`FR-F19-05`): invoking each produces exactly one record of the expected type (SM-19).
6. The audit write is not deferred, queued, batched, or made asynchronous. Deferral is what turns a guarantee into a hope.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Audit store unavailable pre-write | 503 | `AUDIT_UNAVAILABLE` | "We can't record actions right now, so this action wasn't completed. Try again shortly — reference {correlationId}." |
| Audit write failed post-spoke-commit | 500 | `AUDIT_WRITE_FAILED` | "We couldn't record this action. It may have been applied in {System} — check the item's current status. An administrator has been notified — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Every mutating endpoint writes exactly one record per success (SM-19).
- AC-2: Simulating audit-store failure causes mutations to be reported as failed.
- AC-3: A post-commit audit failure produces an integration issue and the specified honest message.

---

### FR-F13-02 — Record schema and coverage

**Description:** What is captured, and which operations must produce a record.

**Record fields** (full DDL in `Y0a`):
- `auditId` (ULID), `sequenceNumber` (monotonic integer, gap-free per store)
- `occurredAt` (ISO-8601 UTC, server clock)
- `actorPrincipalId`, `actorDisplayName`, `actorRolesAtAction` (array), `actorActiveRoleAtAction`, `actorAttributesAtAction` (JSON snapshot) — recorded **as at the time of action**, so later changes cannot rewrite what the actor was
- `actionType` (string, closed vocabulary)
- `targetSystem` (`HUB` or `applicationId`), `targetSystemDisplayName` (denormalized, so history survives de-registration)
- `targetResourceType`, `targetResourceId`
- `outcome` (`SUCCESS | FAILURE | DENIED | PARTIAL`)
- `reasonCode`, `policyRuleId` (for denials)
- `beforeSummary`, `afterSummary` (plain-language strings, ≤500 chars each)
- `correlationId`, `requestId`, `adapterRequestId`
- `sessionId`, `identityMethod`
- `clientContext` (`{ ipHash, userAgentHash }`)
- `recordHash`, `previousRecordHash`

**Coverage — operations that MUST write a record:**

| Category | Actions |
|---|---|
| Authentication | `AUTH_SUCCESS`, `AUTH_FAILURE`, `LOGOUT`, `SESSION_EXPIRED`, `ROLE_CONTEXT_SWITCHED` |
| Authorization | `AUTHZ_DENIED` (every denial, including CSRF rejections) |
| Work items | `WORK_ITEM_VIEWED`, `WORK_ITEM_ACTION_PERFORMED`, `RELATED_ITEMS_RESOLVED`, `RELATED_ITEM_TRAVERSED` |
| Spoke-specific mutations | `ISSUE_RESOLVED`, `CASE_ISSUE_CLEARED`, `CASE_ADJUDICATED`, `DESIGNATION_APPROVED`, `DESIGNATION_RETURNED`, `NOTICE_ACKNOWLEDGED`, `TASK_COMPLETED`, `ASSIGNMENT_ACCEPTED`, `CASE_STATUS_UPDATED`, `LEAD_NOTE_ADDED`, `ALERT_ACKNOWLEDGED`, `ALERT_CLEARED`, `ALERT_ESCALATED` |
| Orchestration | `ORCHESTRATION_STARTED`, `ORCHESTRATION_COMPLETED`, `ORCHESTRATION_PARTIAL`, `ORCHESTRATION_FAILED`, `ORCHESTRATION_RETRY_ATTEMPTED` |
| Administration | `APPLICATION_REGISTERED`, `APPLICATION_UPDATED`, `APPLICATION_ENABLED`, `APPLICATION_DISABLED`, `APPLICATION_DEREGISTERED`, `APPLICATION_PROBED`, `ANNOUNCEMENT_CREATED`, `ANNOUNCEMENT_UPDATED`, `ANNOUNCEMENT_EXPIRED`, `FAILURE_INJECTED`, `FAILURE_CLEARED`, `OPERATOR_TOKEN_ISSUED`, `DEMO_RESET_PERFORMED` |
| Identity | `USER_VIEWED`, `ROLE_ASSIGNED` |
| Integration | `ADAPTER_FAILURE` (recorded when the failure accompanies a user action) |
| Audit | `AUDIT_VIEWED`, `AUDIT_EXPORTED` |

**Rules:**
1. `beforeSummary`/`afterSummary` are human-readable, e.g. `"status: Open"` → `"status: Resolved — Substantiated"`. They never contain full record dumps, and never contain narrative free text verbatim beyond 500 characters (the narrative lives in the spoke, which is its system of record).
2. `actionType` is a closed vocabulary; an undeclared type fails a startup check.
3. Read auditing is deliberately limited to the categories above — routine list reads are not audited so the trail stays legible, and the exceptions are enumerated rather than left to discretion.

**Acceptance criteria:**
- AC-1: Every listed action type is produced by at least one code path and is filterable in the viewer.
- AC-2: Actor roles and attributes are snapshotted at action time.

---

### FR-F13-03 — Append-only storage and integrity

**Description:** No update path, no delete path, and detectable tampering.

**Processing / business rules:**
1. The application exposes **no** endpoint, service method, or UI control that updates or deletes an audit record. The absence is verified by test (`FR-F19-05`): route enumeration finds no PUT/PATCH/DELETE under `/api/audit`, and static analysis finds no update or delete statement against `audit_events`.
2. Database-level protection: the hub's application credential holds `INSERT` and `SELECT` on `audit_events` only — no `UPDATE`, no `DELETE`, no `TRUNCATE`. Enforcement lives at the grant, not at the code.
3. `sequenceNumber` is assigned monotonically and gap-free by the store. A gap is detectable and reported.
4. `recordHash = H(sequenceNumber ‖ occurredAt ‖ actorPrincipalId ‖ actionType ‖ targetSystem ‖ targetResourceId ‖ outcome ‖ beforeSummary ‖ afterSummary ‖ correlationId ‖ previousRecordHash)`. The first record chains from a genesis constant.
5. `GET /api/audit/integrity` recomputes the chain over a range and returns `{ verified, recordsChecked, firstBrokenSequence | null, checkedAt }`.
6. SCR-33 displays an integrity indicator: "Integrity verified — {n} records checked at {time}" or, on failure, an error alert naming the first broken sequence number. The indicator is text plus icon, never color alone.
7. Retention: records are never purged in this prototype. The reset command (`FR-F17-11`) rebuilds the entire environment from scratch rather than deleting rows, so even reset is not a deletion path.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Integrity check fails | 200 | — | "Audit integrity check failed at record {n}. Records may have been altered outside the application. Contact your administrator." |
| Attempted mutation endpoint | 405 | `METHOD_NOT_ALLOWED` | "Audit records can't be changed or deleted." |

**Acceptance criteria:**
- AC-1: No application path can modify or delete an audit record (NFR-07).
- AC-2: Manually altering a record in the database causes the integrity check to fail at that record, demonstrably.
- AC-3: Sequence numbers are gap-free across a full demo run.

---

### FR-F13-04 — Correlated cross-system chains

**Description:** One user action reads as one narrative, not four disconnected rows.

**Processing / business rules:**
1. Every record carries the `correlationId` of the user action that produced it (`FR-F01-06`).
2. `GET /api/audit/chain/{correlationId}` returns all records for that ID in `sequenceNumber` order, plus a computed `summary` line naming actor, systems touched, and overall outcome.
3. Chains spanning retries (`FR-F07b-03`) include every attempt, so a partial completion's history is complete rather than tidied.
4. The chain view (SCR-34) renders records as an ordered narrative with system badges and elapsed time between steps.
5. Chain visibility respects role scoping (`FR-F13-07`): a mission user sees their own chain; records within the chain belonging to another actor are shown as redacted placeholders ("An action by another user — {timestamp}") rather than omitted, so the narrative's shape is honest even when detail is withheld.

**Acceptance criteria:**
- AC-1: The flagship workflow renders as one chain of ≥5 records (SM-20).
- AC-2: The chain summary line correctly names both systems and the outcome.

---

### FR-F13-05 — Audit viewer (SCR-33)

**Description:** The accessible, filterable table where the trail is read.

**Inputs:** `GET /api/audit` with `actor`, `actorRole`, `actionType`, `targetSystem`, `targetResourceId`, `outcome`, `from`, `to`, `correlationId`, `q`, plus list conventions.

**Processing / business rules:**
1. Columns: Timestamp (UTC), Actor, Role at action, Action, Target system, Target resource, Outcome (text + icon), Correlation ID (link to chain).
2. Filters render as a form with a filter-chip summary and a "Clear all filters" control, matching the work-queue pattern (`FR-F05-03`) so the interaction is learned once.
3. Default view: last 24 hours, newest first, scoped by role (`FR-F13-07`).
4. Sortable on timestamp, actor, action type, target system, outcome. Default `occurredAt DESC`.
5. Result count announced politely on every change: "{n} audit records. Showing {a} to {b}."
6. Each row links to SCR-34; the correlation ID links to the chain view.
7. Free-text `q` matches actor display name, target resource ID, and action type — not summaries, which could otherwise be used to fish for narrative content.
8. Viewing the audit trail itself writes an `AUDIT_VIEWED` record. The audit trail audits its own reading, which is both correct and demonstrable.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| No records match | 200 | — | "No audit records match your filters. Try widening the date range." |
| Range too large | 400 | `VALIDATION_FAILED` | "Choose a date range of 90 days or fewer." |
| Reversed range | 400 | `VALIDATION_FAILED` | "Enter an end date that comes after the start date." |

**Acceptance criteria:**
- AC-1: Every filter works and combines correctly.
- AC-2: The table passes the accessibility scan with proper headers, caption, and announced sort state.
- AC-3: Opening the viewer writes one `AUDIT_VIEWED` record.

---

### FR-F13-06 — Record detail and chain view (SCR-34)

**Description:** One record in full, and its chain.

**Processing / business rules:**
1. Record detail shows every field in a definition list: timestamp, actor with roles and attributes **as at the time of action**, action, target system and resource, outcome, reason code and policy rule (for denials), before/after summaries, correlation and request IDs, session ID, identity method, sequence number, and record hash.
2. "View full chain" shows every record sharing the correlation ID as an ordered narrative with a summary line.
3. Links out: to the affected work item (where the principal is entitled), to the application detail (administrators), and to the integration issue sharing the correlation ID (administrators).
4. A copy control for the correlation ID, so an administrator can quote it — and so a user quoting a correlation ID from an error message can be helped.
5. The record hash and previous hash are displayed with a short explanation of what they prove.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Record not visible to this principal | 403 | `AUTHZ_DENIED` | "You don't have access to this audit record." |
| Record not found | 403 | `AUTHZ_DENIED` | Same copy (non-enumerable). |

**Acceptance criteria:**
- AC-1: The flagship chain is readable end-to-end from any of its records.
- AC-2: Denial is non-enumerable.

---

### FR-F13-07 — Role-scoped audit visibility

**Description:** Who sees what in the trail.

**Processing / business rules:**
1. **Administrators** (`AUDIT.READ_ALL`) see every record.
2. **Mission users and applicants** (`AUDIT.READ_OWN`) see records where `actorPrincipalId == principalId`. These surface as "Recent activity" on the dashboard (`FR-F04-02`) and as the hub-origin half of item activity history (`FR-F06-06`).
3. Records concerning a resource but performed by another actor are **not** shown to non-administrators, except as redacted placeholders within a chain the user participated in (`FR-F13-04` rule 5).
4. Scoping is applied in the query, not after retrieval — the same data-layer discipline as `FR-F02-04`.
5. An applicant's own-activity view redacts no fields, because their own actions contain nothing they may not see.

**Acceptance criteria:**
- AC-1: An investigator's audit query returns zero records authored by another actor.
- AC-2: The scoping predicate is applied in the query, verified by inspection and by a direct API probe.

---

### FR-F13-08 — Export

**Description:** Export of a filtered view for demonstration purposes.

**Inputs:** `GET /api/audit/export?format=csv|json` with the same filters as the viewer.

**Processing / business rules:**
1. Exports respect the same role scoping and filters as the on-screen view; an export can never contain a record the user could not see on screen.
2. Maximum 10,000 records per export; beyond that the response is 400 with "Narrow your filters — exports are limited to 10,000 records."
3. The export includes a header block: generated-at, generating actor, applied filters, record count, and the integrity verification result for the exported range.
4. Every export writes an `AUDIT_EXPORTED` record naming the filters and the count.
5. CSV is UTF-8 with a BOM, quoted fields, and a documented column order; JSON mirrors the API record schema.
6. Exported files carry a synthetic-data notice as the first line: `# DEMO — SYNTHETIC DATA ONLY`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Too many records | 400 | `EXPORT_TOO_LARGE` | "Narrow your filters — exports are limited to 10,000 records." |
| Export generation failed | 500 | `INTERNAL_ERROR` | "We couldn't build that export. Try again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: An export of the flagship chain contains exactly the records shown on screen.
- AC-2: Every export writes an audit record.
- AC-3: Exported files carry the synthetic-data notice.

---
