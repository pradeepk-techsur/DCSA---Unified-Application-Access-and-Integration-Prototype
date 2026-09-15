## Epic 7: FLAGSHIP — eApp Case → Related PVQ Issue → Dual-System Update (F7)

> **The single most important epic in this product.** If everything else fails, this must work.

An Investigator, signed in once, opens an eApp case from the unified work queue, discovers a related PVQ issue raised against a specific questionnaire answer, opens and resolves that issue without leaving the unified experience, and observes **both** eApp and PVQ reflect the change. No second login. No second application. No re-entry of context. No manual correlation.

The stories below are written one per step of the demonstrated path, so the epic can be read as the demo script and so a regression in any single step is attributable. US-066 covers the partial-failure path, which is the honest half of this story and the one R-06 names.

**Seeded preconditions (normative):** eApp `CASE-A-1042`, subject `SUBJ-00418`, `outstandingIssueCount = 1`; PVQ `ISS-2207`, status `OPEN`, `answerLocus = SECTION_13A.employer[0].endDate`.

---

### US-059: Find the eApp case in my unified queue and open it
**As an** Investigator, **I want** the eApp case carrying an outstanding issue to be waiting in my queue, **so that** the flagship workflow starts from my normal day rather than from a special screen.

**Acceptance Criteria:**
- [ ] Given I sign in and open the work queue at its default view, when page one renders, then `EAPP:CASE-A-1042` is present without my applying any filter.
- [ ] Given that row renders, when I read it, then it is attributed "eApp" and shows the subject, status "Under review", priority, and due date.
- [ ] Given I activate the row, when the case opens, then there is no interstitial, no new tab, and no credential prompt, and the queue state is encoded for my return.
- [ ] Given the case detail renders, when I time it under seeded data, then the case content appears within two seconds.
- [ ] Given the breadcrumb renders, when I read it, then it shows `Work Queue › eApp Case A-1042`.
- [ ] Given this step completes, when the audit trail is checked, then zero additional authentication events have occurred.

**Priority:** P0 | **Feature Ref:** F7, F5 | **Persona:** PER-01 | **FRD:** FR-F07a-02, FR-F18-05

---

### US-060: Discover, on the case itself, that an issue was raised against one of its answers
**As an** Investigator, **I want** the related PVQ issue surfaced inline on the case with the relationship explained, **so that** I stop discovering issues by accident after the case is already late.

**Acceptance Criteria:**
- [ ] Given the case detail renders, when I read the header, then it shows "1 outstanding issue" as a link that moves focus to the related-items panel heading.
- [ ] Given the related-items panel resolves, when I read the PVQ entry, then it is labelled "Issue raised against Section 13A — Employment history", badged PVQ, with the issue status "Open", the raised date, and the issue title.
- [ ] Given that label, when I trace its origin, then it comes from PVQ's own record rather than being composed by the UI — changing the seeded label changes what is displayed.
- [ ] Given the panel renders, when I read it, then the PDT designation and the IM assignment for the same case are also shown, so the cross-system story is more than a single link.
- [ ] Given case detail loads, when the related panel is still resolving, then the main case content renders first and the panel resolves independently with its own skeleton.
- [ ] Given PVQ is unavailable at this moment, when the panel renders, then the case still opens and the panel states "PVQ isn't responding right now, so this related issue can't be opened."

**Priority:** P0 | **Feature Ref:** F7, F6 | **Persona:** PER-01 | **FRD:** FR-F07a-01, FR-F06-05

---

### US-061: Move from the case to the issue without leaving the experience
**As an** Investigator, **I want to** open the related PVQ issue inside the same shell with the case context carried for me, **so that** crossing a system boundary costs me nothing — no login, no search, no retyping a reference.

**Acceptance Criteria:**
- [ ] Given I activate the related issue, when the issue screen loads, then it renders inside the same shell with the header, banner, and navigation remaining mounted throughout — no new tab, no window, no iframe, no redirect to a spoke origin.
- [ ] Given the traversal occurs, when I observe it, then no authentication prompt, interstitial, or full-page loading screen replaces the shell.
- [ ] Given the issue screen renders, when I read the breadcrumb, then it reads `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207` with source badges on the second and third segments.
- [ ] Given the issue screen renders, when I read the top of the page, then a case context strip states "Part of eApp Case A-1042 — {subject name}" and links back to the case.
- [ ] Given the traversal completes, when I count what I typed, then I typed nothing — no identifier was entered, copied, or pasted at any point.
- [ ] Given a screen reader is in use, when the new page loads, then the page title changes descriptively and focus moves to the new heading.
- [ ] Given the traversal occurs, when the audit trail is queried, then a `RELATED_ITEM_TRAVERSED` record exists naming both the case and the issue under the workflow correlation ID.

**Priority:** P0 | **Feature Ref:** F7, F3 | **Persona:** PER-01 | **FRD:** FR-F07a-03, FR-F03-06

---

### US-062: Read the flagged answer in context before I decide
**As an** Investigator, **I want** the issue screen to quote the questionnaire answer the issue was raised against, **so that** I can resolve it on the evidence rather than on a reference number.

**Acceptance Criteria:**
- [ ] Given the issue screen renders, when I read it, then it shows the question text, the answer snapshot as it stood when the issue was raised, and the section label "Section 13A — Employment history".
- [ ] Given I want the full context, when I follow the link to the parent case's section, then it deep-anchors to that exact questionnaire section on the case screen.
- [ ] Given I arrive at that section via the related-item link, when it renders, then it carries a text marker reading "Issue raised on this section".
- [ ] Given the underlying answer has since changed in eApp, when I read the issue, then the snapshot PVQ stored is still readable, so the issue remains interpretable.
- [ ] Given the issue was already resolved by someone else, when the page renders, then a banner states "This issue was already resolved by {actor} on {date}. No further action is needed." and the resolution form is disabled with that reason.

**Priority:** P0 | **Feature Ref:** F7, F6 | **Persona:** PER-01 | **FRD:** FR-F07a-03, FR-F06-08

---

### US-063: Resolve the issue with a disposition and a narrative
**As an** Investigator, **I want to** record how I resolved the issue and confirm I reviewed the flagged answer, **so that** what I leave behind survives scrutiny by an adjudicator months later.

**Acceptance Criteria:**
- [ ] Given the resolution form renders, when I read it, then it offers a radio group inside a fieldset legended "Resolution disposition" with four options — Substantiated, Unsubstantiated, Resolved with clarification, Referred for further review — each carrying hint text explaining what it means.
- [ ] Given the form renders, when I read the action panel, then it states "This updates PVQ and eApp." **before** I submit.
- [ ] Given I submit without choosing a disposition, when validation runs, then an error summary appears with focus moved to it and the message "Choose a resolution disposition."
- [ ] Given I submit a narrative shorter than 20 characters, when validation runs, then the message reads "Enter at least 20 characters describing how you resolved this issue." and my typed text is preserved.
- [ ] Given I submit without confirming I reviewed the answer, when validation runs, then the message reads "Confirm that you have reviewed the flagged answer."
- [ ] Given I choose "Referred for further review", when I submit, then only PVQ is written and the eApp outstanding-issue count is deliberately unchanged, demonstrating that the dual write is disposition-driven rather than blanket.
- [ ] Given I submit a parent case identifier that does not match the issue's actual parent, when the server verifies the relationship, then the request is rejected — the client does not get to tell the server which case to update.

**Priority:** P0 | **Feature Ref:** F7, F6 | **Persona:** PER-01 | **FRD:** FR-F07a-04, FR-F14-03

---

### US-064: Have the hub coordinate the update across both systems
**As an** Investigator, **I want** one submission to update both PVQ and eApp correctly or not at all, **so that** I never have to perform the second half of my own transaction by hand.

**Acceptance Criteria:**
- [ ] Given I submit, when the hub processes it, then it authorises **both** legs before writing anything — a principal authorised for one leg but not the other is denied outright.
- [ ] Given either target system is unhealthy, when the pre-flight check runs, then the orchestration is refused before any write with "{System} isn't responding right now, so nothing was changed."
- [ ] Given the orchestration proceeds, when it executes, then a reconciliation record exists before the first spoke is written, so a crash mid-orchestration is discoverable.
- [ ] Given the PVQ write succeeds, when the eApp write follows, then PVQ records the disposition and resolver, and eApp decrements its outstanding-issue count and moves the case to "Review complete — pending adjudication" when the count reaches zero.
- [ ] Given I accidentally submit twice, when the second request arrives with the same idempotency key, then the stored outcome is returned and neither leg executes a second time.
- [ ] Given the PVQ write fails, when the hub responds, then no eApp call is attempted and the message states unambiguously that nothing changed.

**Priority:** P0 | **Feature Ref:** F7 | **Persona:** PER-01 | **FRD:** FR-F07b-01, FR-F07b-02

---

### US-065: See what each system says about itself after my action
**As an** Investigator, **I want** the confirmation to report what each system independently says now, **so that** the demonstration proves both systems changed rather than asserting it.

**Acceptance Criteria:**
- [ ] Given the orchestration completes, when the confirmation screen renders, then it shows a per-system results table with columns System, What we asked for, What the system reports now, and Outcome — one row per leg.
- [ ] Given that table renders, when I inspect its data, then each row shows a **fresh re-read** from the owning spoke rather than the value the hub intended to write.
- [ ] Given a successful substantiated resolution, when the table renders, then PVQ reports "Resolved — Substantiated" and eApp reports "No outstanding issues".
- [ ] Given a re-read fails for one system, when that row renders, then it reads "We couldn't confirm the current state in {System}." with a "Check again" control — the row is never omitted for tidiness.
- [ ] Given the table renders, when it is inspected for accessibility, then it is a real table with a caption reading "Results in each connected system", header scopes, and outcome shown as text plus icon, never colour alone.
- [ ] Given the screen renders, when a screen reader is in use, then it is announced once — "Resolution complete. PVQ and eApp both updated." — and the summary alert receives focus.

**Priority:** P0 | **Feature Ref:** F7 | **Persona:** PER-01 | **FRD:** FR-F07b-04

---

### US-066: Be told the truth when only one of the two systems updates  *(partial-failure path)*
**As an** Investigator, **I want** a half-completed cross-system update to be reported precisely, with a retry path, **so that** I am never told something succeeded when it did not.

**Acceptance Criteria:**
- [ ] Given PVQ has committed and the eApp write fails, when the response returns, then the outcome is reported as partially completed and the word "success" appears nowhere on the screen.
- [ ] Given the partial state renders, when I read it, then it states "Partly completed. PVQ recorded your resolution. eApp hasn't been updated yet — we're retrying automatically. You can also retry now." with the correlation ID.
- [ ] Given the partial state, when I look at the per-system table, then one row shows committed and one shows failed, and a "Retry eApp update" control is present and working.
- [ ] Given the PVQ resolution has committed, when the hub handles the failure, then it does **not** reverse it — a recorded investigative disposition is not fabricated away — and instead retries the outstanding leg with backoff.
- [ ] Given the eApp leg is still outstanding, when I return to the case, then it still shows "1 outstanding issue" plus an advisory that a resolution was recorded in PVQ and is being retried — the UI never fakes convergence.
- [ ] Given eApp is restored, when automatic retry next runs, then the legs converge with no action from me and the case then shows "No outstanding issues".
- [ ] Given retries are exhausted, when the state settles, then the transaction is flagged for attention, exactly one `ORCHESTRATION_INCOMPLETE` integration issue is visible to an Administrator, and that entry offers a working manual retry.
- [ ] Given retries run, when the audit chain is read, then every attempt appears under the original correlation ID.

**Priority:** P0 | **Feature Ref:** F7, F16 | **Persona:** PER-01, PER-04 | **FRD:** FR-F07b-03, FR-F11-03

---

### US-067: Satisfy myself independently that both systems really changed
**As an** evaluating reviewer, **I want to** verify the post-state in eApp and PVQ outside the unified layer entirely, **so that** I can believe the dual-system claim rather than take the hub's word for it.

**Acceptance Criteria:**
- [ ] Given the workflow has completed, when I return to the eApp case, then it shows "No outstanding issues" and the updated case state, re-read live from eApp.
- [ ] Given the workflow has completed, when I open the PVQ issue, then it shows status resolved with the disposition, narrative, resolver, and resolution timestamp.
- [ ] Given an operator token issued for the demonstration, when I `curl` the PVQ and eApp APIs directly, then both return the updated state without the hub in the path.
- [ ] Given I choose "Back to work queue" from the confirmation, when the queue loads, then my original filters, sort, and page are restored.
- [ ] Given each verification step, when it completes, then no re-authentication was required at any point.

**Priority:** P0 | **Feature Ref:** F7, F9 | **Persona:** PER-01, PER-04 | **FRD:** FR-F07a-05, FR-F07b-05, FR-F09-08

---

### US-068: Read the whole cross-system action as one story
**As an** Adjudicator reading this record months later, **I want** the entire workflow retrievable as a single correlated chain, **so that** I can see what happened across both systems as one event instead of four disconnected rows.

**Acceptance Criteria:**
- [ ] Given the workflow completed, when I open the audit chain for its correlation ID, then it contains at least five records covering the case read, the related-item resolution, the traversal, the issue read, both writes, and the completion.
- [ ] Given the chain renders, when I read the top of it, then a summary line states "Investigator {name} resolved PVQ issue ISS-2207 against eApp case A-1042 on {date}. Both systems updated."
- [ ] Given the chain renders, when I read each record, then it carries a system badge, the elapsed time since the previous step, and a plain-language before/after summary such as "status: Open → Resolved — Substantiated" and "outstanding issues: 1 → 0".
- [ ] Given a partial completion, when I read its chain, then it clearly shows which leg failed and every retry attempt.
- [ ] Given I want to keep the evidence, when I export the filtered chain, then the export contains exactly the records shown on screen and carries the synthetic-data notice.
- [ ] Given any audit write in the chain had failed, when the operation was evaluated, then it would have been reported as not completed rather than silently proceeding.

**Priority:** P0 | **Feature Ref:** F7, F13 | **Persona:** PER-02, PER-04 | **FRD:** FR-F07b-06, FR-F13-04

---

### US-069: Complete the entire flagship workflow using the keyboard alone
**As an** Investigator who does not use a mouse, **I want to** drive the whole cross-application workflow from the keyboard, **so that** the continuity this product claims is available to me on the same terms as everyone else.

**Acceptance Criteria:**
- [ ] Given I use only the keyboard, when I run the workflow from queue to confirmation, then every step is reachable and operable with Tab, Shift-Tab, Enter, Space, arrow keys, and Escape.
- [ ] Given I move between screens, when each loads, then focus lands predictably on the new page's heading and the page title changes descriptively.
- [ ] Given any interactive element receives focus, when it does, then the focus indicator is visible against its background.
- [ ] Given I traverse from the case to the issue, when focus moves, then I am never trapped and never returned to the top of an unchanged document.
- [ ] Given the four screens involved, when the automated accessibility scan runs on each, then it reports zero serious or critical violations.
- [ ] Given the manual keyboard pass, when it is performed before the demonstration, then it is recorded with date, tooling, and findings.

**Priority:** P0 | **Feature Ref:** F7, F14 | **Persona:** PER-01 | **FRD:** FR-F14-02, FR-F07a-06

---
