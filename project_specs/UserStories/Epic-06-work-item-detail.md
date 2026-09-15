## Epic 6: Work-Item Detail and Action Completion (F6)

The page where work actually gets done: the full record from its owning spoke, only the actions this principal may perform on this item in its current state, the execution of those actions through the adapter, and the item's complete history merged from the spoke and the hub. It also carries the related-items panel that is the on-ramp to the flagship workflow.

---

### US-050: Review the full record for a single work item
**As an** Investigator, **I want to** open an item and see everything the owning system holds about it, **so that** I can act on evidence rather than on a summary row.

**Acceptance Criteria:**
- [ ] Given I open a work item, when it renders, then the page shows, in order: breadcrumb, heading, summary header, type-specific content, related items, action panel, and activity history.
- [ ] Given the summary header renders, when I read it, then it names the system of record in text, plus subject, status, priority, due date, assignee, and last activity.
- [ ] Given each of the five work-item types, when opened, then a purpose-built screen renders — questionnaire case, PVQ issue, PDT designation, IEP task/notice, IM assignment — not a generic key/value dump.
- [ ] Given any record is displayed, when I read the summary header, then it carries the marker "Synthetic record — demo data".
- [ ] Given an eApp case, when I open a questionnaire section, then sections render as accessible disclosures with stable anchors so a related issue can point at an exact answer.

**Priority:** P0 | **Feature Ref:** F6 | **Persona:** PER-01, PER-02 | **FRD:** FR-F06-01, FR-F06-02, FR-F06-08

---

### US-051: See only the actions I can actually take, and why the others are unavailable
**As an** Investigator, **I want** the action panel to show what I may do and explain what I may not, **so that** I never invest effort in an action the system will refuse.

**Acceptance Criteria:**
- [ ] Given I open an item, when the action panel renders, then it shows at most one primary action plus secondary and destructive actions, each computed server-side for this principal, this item, and its current state.
- [ ] Given an action exists for my role but is currently unavailable, when it renders, then it is shown disabled with a plain-language reason associated programmatically, not hidden.
- [ ] Given an action I may never perform in this role, when the panel renders, then it is omitted entirely.
- [ ] Given an action writes to more than one system, when it renders, then the panel states "This updates {System A} and {System B}." before I act.
- [ ] Given a target system is unavailable, when the panel renders, then the action is disabled with "{System} isn't responding right now. Try again when it's back."
- [ ] Given I complete an action, when the page settles, then the action list is recomputed rather than left stale.

**Priority:** P0 | **Feature Ref:** F6, F2 | **Persona:** PER-01 | **FRD:** FR-F06-03, FR-F16-04

---

### US-052: Complete an action through a form that validates properly
**As an** Investigator, **I want to** record a finding or request clarification through a validated form, **so that** a mistake is caught before it reaches the system of record and my narrative is never lost to a validation failure.

**Acceptance Criteria:**
- [ ] Given an action requires input, when the form renders, then it is built from the server-declared field schema with labels, hint text, and required indication in text rather than colour or asterisk alone.
- [ ] Given I submit invalid input, when validation fails, then an error summary appears at the top of the form, focus moves to it, each entry links in-page to its field, and each field carries an inline message and `aria-invalid="true"`.
- [ ] Given I submit invalid input, when the page re-renders, then everything I had already typed is preserved.
- [ ] Given I disable client-side validation, when I submit invalid input, then the server rejects it identically — the server is authoritative.
- [ ] Given a long narrative field, when I pass 90% and 100% of its limit, then a character counter is announced politely rather than on every keystroke.
- [ ] Given I double-submit the same action, when the second request arrives, then idempotency ensures the action executes exactly once.

**Priority:** P0 | **Feature Ref:** F6, F14 | **Persona:** PER-01 | **FRD:** FR-F06-04, FR-F14-03

---

### US-053: Be told exactly what changed and in which system
**As an** Investigator, **I want** the confirmation to name the change and the system it landed in, **so that** I can trust what I am seeing months later and so my supervisor can too.

**Acceptance Criteria:**
- [ ] Given an action succeeds, when the confirmation renders, then it names the item, the change, and the system — for example "Issue ISS-2207 marked Resolved — Substantiated in PVQ."
- [ ] Given the confirmation appears, when a screen reader is in use, then it is announced politely and receives focus.
- [ ] Given the UI reflects a new state, when I inspect the sequence, then the state was read back from the spoke after it confirmed the write — submission is never optimistic.
- [ ] Given the action completes, when the audit trail is queried, then exactly one audit record exists for it.
- [ ] Given I remain on the detail page after acting, when the page settles, then I still see evidence of what I just did, with "Back to work queue" offered as a secondary control.

**Priority:** P0 | **Feature Ref:** F6, F13 | **Persona:** PER-01 | **FRD:** FR-F06-04, FR-F06-12, FR-F13-01

---

### US-054: Know which kind of failure I am looking at, and what to do about it
**As an** Investigator, **I want** failures to be distinguishable and each to offer a recovery path, **so that** I never have to guess whether to retry, fix my input, or ask for access.

**Acceptance Criteria:**
- [ ] Given an authorisation denial, when it renders, then it reads "You don't have permission to do that." and offers a return to the item with no retry, because retrying will not help.
- [ ] Given a validation failure, when it renders, then it shows an error summary with per-field guidance and a fix-and-resubmit path.
- [ ] Given the owning system is unavailable, when it renders, then it reads "{System} isn't responding right now, so nothing was changed." with "Try again" and "Back to work queue".
- [ ] Given an unexpected error, when it renders, then it reads "Something went wrong on our side. Nothing was changed." with a correlation ID and working exits.
- [ ] Given any failure message, when I read it, then it states explicitly whether anything changed — ambiguity is permitted only for the indeterminate-timeout case, whose copy says the outcome is unknown and tells me how to check.
- [ ] Given any failure message, when it is scanned automatically, then it contains no stack trace, exception name, hostname, port, SQL, or spoke-internal identifier, and always displays a copyable correlation ID.

**Priority:** P0 | **Feature Ref:** F6, F16 | **Persona:** PER-01 | **FRD:** FR-F06-07, FR-F16-08

---

### US-055: See what this item is connected to in other systems
**As an** Adjudicator, **I want** cross-system relationships surfaced inline on the item I am reading, **so that** assembling the complete picture stops being the work.

**Acceptance Criteria:**
- [ ] Given I open eApp case A-1042, when the related-items panel resolves, then it shows the related PVQ issue, the PDT designation, and the IM assignment, each badged with its system and grouped by relationship type with a count.
- [ ] Given a related item renders, when I read it, then the relationship is explained in the owning system's own words — for example "Issue raised against Section 13A employment history" — not composed by the UI from identifiers.
- [ ] Given the relationship is edited in the owning spoke's store, when I reload the page, then the panel reflects the change — proving the link is live rather than hard-coded.
- [ ] Given a target system is unavailable, when the panel renders, then it reads "{System} isn't responding right now, so this related item can't be opened." rather than showing a broken link or omitting the row.
- [ ] Given I am not entitled to a related item, when it renders, then it reads "You don't have access to the related item in {System}."
- [ ] Given there are no related items, when the panel renders, then it reads "No related items in other systems."

**Priority:** P0 | **Feature Ref:** F6, F7 | **Persona:** PER-02, PER-01 | **FRD:** FR-F06-05, FR-F07a-01

---

### US-056: Read one history instead of merging four by hand
**As an** Adjudicator reviewing a contested case, **I want** the item's spoke history and the hub's audit records in one chronological view, **so that** I can see the cross-system action as a single narrative.

**Acceptance Criteria:**
- [ ] Given I open an item's activity history, when it renders, then spoke-native entries and hub audit records appear merged in one list ordered newest first.
- [ ] Given a history row renders, when I read it, then it shows an absolute UTC timestamp plus a relative time, actor, actor role, action summary, and an origin badge distinguishing "Recorded by {System}" from "Recorded by the unified layer".
- [ ] Given a row carries a correlation ID, when I activate it, then I open the chain view showing every record for that action, where I am entitled to see it.
- [ ] Given the owning spoke's history call fails, when the page renders, then hub records still appear with the notice "Some history from {System} isn't available right now."
- [ ] Given more than twenty entries, when I choose "Load more", then further entries append and a polite announcement states "{n} more entries loaded."
- [ ] Given I am an Applicant, when I view my own history, then internal narratives are absent from the payload rather than merely hidden.

**Priority:** P0 | **Feature Ref:** F6, F13 | **Persona:** PER-02, PER-03 | **FRD:** FR-F06-06

---

### US-057: Complete the action my role exists to perform
**As an** Adjudicator, **I want to** record a determination or return a case for additional investigation, **so that** my half of the workflow is real rather than represented.

**Acceptance Criteria:**
- [ ] Given a case awaiting determination, when I record a determination, then the change persists and is visible through eApp's own API independently of the hub.
- [ ] Given a PDT designation, when I approve or return it with a required reason, then PDT's own API reflects the new state and an audit record is written.
- [ ] Given I return a case for clarification, when the Investigator next opens their queue, then the returned item appears in their work.
- [ ] Given an Applicant completes an assigned task, when it is submitted, then IEP's own API shows the task closed and a confirmation names what was received and what happens next.
- [ ] Given each of the four roles, when each performs at least one real action, then each change is visible in both the owning spoke's data and the audit trail.

**Priority:** P0 | **Feature Ref:** F6 | **Persona:** PER-02, PER-03, PER-01 | **FRD:** FR-F06-04, FR-F06-09, FR-F06-10, FR-F06-11

---

### US-058: See an unavailable system's screen degrade cleanly rather than break
**As an** Investigator, **I want** an item whose owning system is down to render an explained unavailable state, **so that** a spoke outage never produces a blank page or a stack trace.

**Acceptance Criteria:**
- [ ] Given Investigation Management is down, when I open an IM assignment, then the page renders inside the shell with "{System} isn't responding right now, so we can't show this item. Your other work is still available." plus "Try again" and "Back to work queue".
- [ ] Given that state renders, when I inspect the browser console, then no unhandled error is present.
- [ ] Given an application has been disabled by an Administrator, when I open one of its items, then I am told "{System} is turned off in this environment. Contact your administrator if you need access."
- [ ] Given a spoke returns a malformed record, when the hub validates it, then I see "We couldn't read this item from {System}. We've logged the problem — reference {correlationId}." and an integration issue is recorded.
- [ ] Given a forbidden item and a non-existent item, when each is requested, then the two responses are indistinguishable.

**Priority:** P0 | **Feature Ref:** F6, F16 | **Persona:** PER-01 | **FRD:** FR-F06-01, FR-F06-11, FR-F16-08

---
