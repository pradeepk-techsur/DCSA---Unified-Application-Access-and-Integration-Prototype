## Epic 13: Immutable Audit Trail and Audit Viewer (F13)

An append-only record of who did what, to what, and when — written on every state-changing operation and viewable and filterable in the UI. The audit trail is not optional instrumentation: an action that cannot be audited does not complete.

---

### US-101: Have every action I take recorded before I am told it worked
**As an** Investigator, **I want** the record of my action written before the system reports success, **so that** what I did months ago is still defensible when an adjudicator or an inspector reads it.

**Acceptance Criteria:**
- [ ] Given I complete any state-changing action, when it succeeds, then exactly one audit record exists for it, written inside the mutation path before the success response was composed.
- [ ] Given the audit store is unavailable, when I attempt an action, then it is reported as not completed — the system never returns success for an unaudited action.
- [ ] Given a spoke write committed before an audit write failed, when I see the result, then I am told honestly that it may have been applied in that system, told to check its current status, and given a correlation ID; an administrator is notified.
- [ ] Given any audit write, when it is inspected, then it is synchronous rather than queued or batched.

**Priority:** P0 | **Feature Ref:** F13 | **Persona:** PER-01 | **FRD:** FR-F13-01

---

### US-102: Have the record capture who I was at the moment I acted
**As an** Adjudicator, **I want** the audit record to snapshot the actor's roles and attributes as at the time of the action, **so that** a later change to someone's permissions cannot rewrite what they were when they acted.

**Acceptance Criteria:**
- [ ] Given any audit record, when I read it, then it carries timestamp, sequence number, actor identity and display name, the actor's roles and attributes as at the time of action, active role, action type, target system and its display name, target resource type and identifier, outcome, reason code and policy rule for denials, before/after summaries, correlation and request identifiers, session identifier, sign-in method, and record hashes.
- [ ] Given a role or attribute changes after an action, when I read the historical record, then it still shows what the actor held at the time.
- [ ] Given an application is later de-registered, when I read a record referencing it, then the stored display name is shown rather than a live lookup, so history stays legible.
- [ ] Given a before/after summary, when I read it, then it is plain language such as "status: Open → Resolved — Substantiated" rather than a raw record dump.
- [ ] Given an undeclared action type, when startup validation runs, then it fails the check — the action vocabulary is closed.

**Priority:** P0 | **Feature Ref:** F13 | **Persona:** PER-02 | **FRD:** FR-F13-02

---

### US-103: Find authentication, denials, and integration failures in the trail too
**As an** Administrator, **I want** the trail to cover more than mutations, **so that** a security question can be answered from one place rather than three.

**Acceptance Criteria:**
- [ ] Given a sign-in, sign-out, session expiry, failed authentication, or role switch, when it occurs, then a record of the appropriate type exists.
- [ ] Given any authorisation denial, when it occurs, then a record exists with outcome denied and the policy rule that denied it.
- [ ] Given an application is registered, updated, enabled, disabled, de-registered, or probed, when it occurs, then a record names the administrator and the change.
- [ ] Given an adapter failure accompanies a user action, when it occurs, then a record exists for it.
- [ ] Given the audit trail itself is viewed or exported, when it happens, then that read is itself recorded.
- [ ] Given routine list reads, when they occur, then they are deliberately **not** audited, and the enumerated exceptions are documented rather than left to discretion.

**Priority:** P0 | **Feature Ref:** F13 | **Persona:** PER-04 | **FRD:** FR-F13-02

---

### US-104: Trust that no one has quietly altered the record
**As an** Administrator, **I want** audit storage to be append-only with detectable tampering, **so that** "immutable" is a property I can demonstrate rather than a word in a document.

**Acceptance Criteria:**
- [ ] Given the application's routes and code, when they are enumerated and statically analysed, then no endpoint, service method, or UI control updates or deletes an audit record.
- [ ] Given the hub's database credential, when its grants are inspected, then it holds insert and select on the audit table only — no update, no delete, no truncate.
- [ ] Given I attempt a mutation method against the audit API, when it is rejected, then I am told "Audit records can't be changed or deleted."
- [ ] Given I run an integrity check, when it completes, then it reports how many records were checked and whether the hash chain verifies, shown as text plus icon.
- [ ] Given a record is altered directly in the database outside the application, when the integrity check runs, then it fails at that record and names the first broken sequence number.
- [ ] Given a full demonstration run, when sequence numbers are inspected, then they are monotonic and gap-free.

**Priority:** P0 | **Feature Ref:** F13 | **Persona:** PER-04 | **FRD:** FR-F13-03

---

### US-105: Read and filter the trail to answer a specific question
**As an** Administrator, **I want** a filterable audit table, **so that** "who did what, to what, when" is one query rather than an afternoon.

**Acceptance Criteria:**
- [ ] Given I open the audit viewer, when it renders, then columns show timestamp, actor, role at action, action, target system, target resource, outcome as text plus icon, and a correlation ID linking to the chain.
- [ ] Given I filter by actor, role, action type, target system, resource, outcome, correlation ID, or date range, when results return, then the filters combine correctly and appear as removable chips with a clear-all control, matching the work-queue pattern.
- [ ] Given I change any filter or sort, when results settle, then a polite announcement states "{n} audit records. Showing {a} to {b}."
- [ ] Given I request a range longer than ninety days, when I submit, then I am told "Choose a date range of 90 days or fewer."
- [ ] Given no records match, when the table renders, then it reads "No audit records match your filters. Try widening the date range."
- [ ] Given the table, when the accessibility scan runs, then it reports zero serious or critical violations and sort state is announced.

**Priority:** P0 | **Feature Ref:** F13, F14 | **Persona:** PER-04 | **FRD:** FR-F13-05

---

### US-106: Open one record in full and follow it into its chain
**As an** Administrator, **I want** a record detail view with a link into everything that shared its correlation ID, **so that** I can move from a symptom to the whole story in one step.

**Acceptance Criteria:**
- [ ] Given I open a record, when it renders, then every field is shown in a definition list including the actor's roles and attributes as at the time of action, the reason code and policy rule for denials, both hashes, and the sequence number.
- [ ] Given I choose "View full chain", when it loads, then every record sharing that correlation ID renders as an ordered narrative with system badges, elapsed time between steps, and a summary line.
- [ ] Given I need to quote the reference, when I use the copy control, then the full correlation ID is copied as selectable text.
- [ ] Given I am entitled to the affected work item, when I follow the link, then I reach it; where I am not entitled, the link is absent rather than broken.
- [ ] Given a record I may not see, when I request it, then the denial is identical to the denial for a record that does not exist.
- [ ] Given the hashes are displayed, when I read them, then a short explanation states what they prove.

**Priority:** P0 | **Feature Ref:** F13 | **Persona:** PER-04 | **FRD:** FR-F13-06

---

### US-107: See my own activity without seeing anyone else's
**As an** Investigator, **I want** my dashboard and item histories to show my own audited activity, **so that** I can retrace what I did without being given a window into colleagues' work.

**Acceptance Criteria:**
- [ ] Given I am a mission user or applicant, when I query the audit trail, then I see only records where I am the actor.
- [ ] Given that scoping, when it is implemented, then it is applied in the query itself rather than by filtering after retrieval, verified by a direct API probe.
- [ ] Given a chain I participated in that also contains another actor's records, when I view it, then those records appear as redacted placeholders — "An action by another user — {timestamp}" — so the shape of the narrative is honest even where detail is withheld.
- [ ] Given I am an Administrator, when I query the trail, then I see every record.
- [ ] Given I am an Applicant viewing my own activity, when it renders, then no fields are redacted, because my own actions contain nothing I may not see.

**Priority:** P0 | **Feature Ref:** F13, F2 | **Persona:** PER-01, PER-03, PER-04 | **FRD:** FR-F13-07, FR-F13-04

---

### US-108: Take the evidence away with me
**As an** Administrator, **I want to** export a filtered audit view, **so that** I can attach the record of a cross-system action to an inquiry without a screenshot.

**Acceptance Criteria:**
- [ ] Given I export a filtered view, when the file is produced, then it contains exactly the records I could see on screen under the same scoping and filters.
- [ ] Given the export, when I open it, then its first line reads `# DEMO — SYNTHETIC DATA ONLY` and a header block states generation time, generating actor, applied filters, record count, and the integrity verification result for the range.
- [ ] Given I request more than ten thousand records, when I submit, then I am told "Narrow your filters — exports are limited to 10,000 records."
- [ ] Given any export, when it completes, then an audit record naming the filters and the count is written.
- [ ] Given CSV output, when I open it, then it is UTF-8 with a byte-order mark, quoted fields, and the documented column order; JSON output mirrors the API record schema.

**Priority:** P1 | **Feature Ref:** F13 | **Persona:** PER-04 | **FRD:** FR-F13-08

---
