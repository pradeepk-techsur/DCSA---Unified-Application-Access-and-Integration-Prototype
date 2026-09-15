
## PER-01: Marcus Vale

*Field/desk background investigator, DCSA Personnel Vetting. 38–45 active cases across IM, eApp, PVQ, and PDT. Measured on cases closed on time and on the defensibility of what he recorded. Interrupted constantly; half his week is on a VPN from somewhere that is not an office.*

---

### JRN-01.01: Clear the Blocking Issue — eApp Case → Related PVQ Issue → Dual-System Update

> **THE FLAGSHIP JOURNEY.** This is the single most important journey in this document and the artifact that proves the entire product thesis. It maps PRD **F7** and **JTBD-01.1**. Per the project charter: *if everything else fails, this must work.*

**Persona:** PER-01 (Marcus Vale)
**Scenario:** It is 0815 on a Tuesday. Marcus is at a hoteling desk in the field office with a case that is due in four days and cannot move. eApp case `CASE-A-1042` is under review, and PVQ has raised an issue item against one specific answer in its Section 13A employment history — an end date on the subject's first listed employer that does not reconcile with what the employer's HR record says. Marcus has to read the answer, judge it against what he already knows from the employer interview he conducted last week, and dispose of the issue. Today that is two applications, two logins, a scratch document holding three identifiers, and forty minutes. In the unified layer it is one sitting, one authentication, zero re-typed identifiers, and both systems provably updated before he stands up.
**Related Jobs:** JTBD-01.1 *(primary)*, JTBD-01.2 *(entry)*, JTBD-01.3 *(the record he leaves)*
**Entry Trigger:** A dashboard alert — `ALERT-NEW-PVQ-ISSUE` — fires on a case Marcus owns, telling him an issue was raised three days ago against `CASE-A-1042`. Today, that alert does not exist; he would find out when the case aged or when his supervisor asked.
**Demo Path:** ✅ **PRIMARY SCRIPTED DEMO — Segment 1.** Target: complete manually in **under three minutes** with no instruction beyond the demo script (PRD F7 acceptance signal).

#### Preconditions (Seed Data Required)

*Normative input to F17 seeding. Seed validation (`FR-F17-10`) must fail loudly if any row below is missing — a broken flagship demo must be diagnosable in seconds, not debugged live.*

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | An INVESTIGATOR identity bound to PER-01, CAC/PIV-enabled, `org=DCSA-FIELD-OPS-EAST`, `tier=T5`, `region=REGION-NE`, holding the case assignment for `CASE-A-1042`. |
| P2 | eapp | `CASE-A-1042`, subject `SUBJ-00418`, `caseState=UNDER_REVIEW`, `outstandingIssueCount=1`, `outstandingIssueRefs=["ISS-2207"]`, due in 4 days, with a populated `SECTION_13A` containing ≥ 2 employer entries. |
| P3 | pvq | `ISS-2207`, `status=OPEN`, `parentSystem=EAPP`, `parentCaseRef=CASE-A-1042`, `subjectRef=SUBJ-00418`, `answerLocus=SECTION_13A.employer[0].endDate`, `answerSectionLabel="Section 13A — Employment history"`, `answerSnapshot` populated, raised 3 days ago. |
| P4 | pdt | A designation referencing `CASE-A-1042`, so the related-items panel shows more than one relationship type and the cross-system story is not a single link. |
| P5 | im | An assignment referencing `CASE-A-1042` assigned to PER-01, giving the panel a third relationship type. |
| P6 | hub | PER-01's default queue view surfaces `EAPP:CASE-A-1042` on **page 1 without filtering**; the `ALERT-NEW-PVQ-ISSUE` rule fires for `ISS-2207` so the dashboard on-ramp is populated. |
| P7 | pvq | A **second** OPEN issue on a different case owned by PER-01, so the journey can be re-run on alternate data if `ISS-2207` has already been consumed mid-session. |
| P8 | hub | ~120 pre-seeded audit events so the audit viewer is populated before this journey writes to it, and the new correlated chain is visibly *one chain among many* rather than the only content. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Sign in | Selects CAC/PIV, picks his synthetic certificate identity | SCR-01 login → SCR-02 certificate picker | "One card, one door. Let's see if it holds." | Neutral, mildly skeptical | **Today:** three separate logins for one case-advancing action — IM, eApp, PVQ — and the third has always timed out by the time he reaches it | One authentication event for the whole session, asserted in the audit log (SM-02) |
| 2. Orient | Scans the alerts panel and sees "New issue raised on CASE-A-1042 — 3 days ago" | SCR-09 investigator dashboard → alerts panel | "There it is. Nobody had to call me." | Alert, slightly annoyed the issue sat three days | **Today:** discovery is accidental — he learns a PVQ issue exists when the case is already late or when his supervisor asks | Exceptions are announced and link directly into the item that produced them (F15) |
| 3. Enter the work | Activates the alert link, landing in his queue with the case in view | SCR-13 unified work queue, default view "assigned to me, due date ascending" | "Due in four days. This is the one." | Focused | **Today:** three lists — IM cases, PVQ issues, eApp questionnaires — none prioritized against the others, so he prioritizes by habit | One queue, five sources, each row badged with its owning system; the next action is ≤ 2 clicks from sign-in |
| 4. Open the case | Opens `CASE-A-1042` from the queue row | SCR-15 eApp case view | "Same header, same chrome. I didn't go anywhere." | Settling in | **Today:** opening the case means a second application and re-establishing in his own head what he was doing | Detail opens inside the shell with queue context preserved for the return trip (F6) |
| 5. Read the answer | Reads Section 13A, employer[0], and the end date under question | SCR-15 → questionnaire section panel, source-badged `eApp` | "End date says March. The employer told me January." | Engaged, professionally suspicious | **Today:** the answer is in eApp and the issue is in PVQ, and nothing on his screen connects them | The flagged answer is rendered in the same view that will link to the issue raised against it |
| 6. Discover the relationship | Reads the related-items panel: "Issue raised against Section 13A employment history" plus the PDT designation and IM assignment | SCR-15 → related items panel (live via the PVQ adapter, not a hard-coded link) | "It's already connected. I don't have to go find it." | Relief — this is the moment the product earns him | **Today:** he copies the issue reference into a scratch document and searches PVQ for it by hand; a transposed digit is a real and recurring error class | Cross-system relationships resolved live and explained in words, with source attribution (F6 → on-ramp to F7) |
| 7. Traverse | Activates the related issue and lands on the PVQ issue, breadcrumb reading `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207` | SCR-16 PVQ issue detail (in-shell, no interstitial, no new tab) | "No login. No new tab. I'm still in the same place." | Confident | **Today:** a second authentication, a manual search, and a cognitive reset that costs more than the clicks | Zero re-authentication, zero context re-entry, breadcrumb carrying the case context forward (F1, F3, F7) |
| 8. Resolve | Selects a disposition, types a resolution narrative referencing the employer interview, submits | SCR-16 → resolution form (USWDS, validated, error summary on failure) | "This has to read right to an adjudicator in nine months." | Deliberate, high-stakes concentration | **Today:** the narrative is written without the questionnaire answer on screen, so he over-explains to compensate for the reader's missing context | Answer and issue in one continuous path; a long narrative is never lost to a validation failure (F14) |
| 9. See both systems answer | Reads the dual-system confirmation naming each spoke and what each now says | SCR-20 dual-system confirmation | "PVQ says resolved. eApp says the case is clear. Both of them said it, not the middle layer." | Trust — the decisive moment | **Today:** he re-opens each system separately to check the change actually landed, because no confirmation names a system or quantifies anything | State read back **from each spoke independently**, so the demo proves the dual update rather than asserting it (SM-03) |
| 10. Verify on the case | Returns to the case and sees "No outstanding issues" and the updated case state | SCR-15 re-read from eApp | "Clean. It moves." | Satisfied | **Today:** verification is a fourth login and a manual comparison of two screens | One click back to a re-read (not cached) case, proving the parent state changed (F7 verification affordance) |
| 11. Leave the record | Opens the item's activity history and sees the whole action as one correlated chain | SCR-15 activity history → SCR-34 audit chain view | "One story, not four rows. That'll hold up." | Reassured, done | **Today:** correlation is manual — he exports activity from each system and lines timestamps up by hand | One correlation ID spanning both reads, both writes, and the confirmation, viewable as a single narrative (F13, SM-20) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Sign in | Simulated IdP establishes one server-side session; principal (identity, roles, attributes, correlation ID) is now presentable to every adapter; `AUTH_SUCCESS` audit event written — the only one for the session | F0, F1, F13 |
| 2. Orient | Dashboard composes server-side across five spokes; the alert rule computes "new PVQ issue on a case you own" from live spoke data and renders it with a direct deep link | F4, F15, F2 |
| 3. Enter the work | Queue fans out to five adapters in one request with per-source partial-failure tolerance; rows normalized and source-badged; result count announced | F5, F8, F14 |
| 4. Open the case | Hub authorizes **this principal against this case specifically** (resource-level, not route-level), fetches detail via the eApp adapter, preserves queue filters/sort/page for return | F2, F6, F8 |
| 5. Read the answer | Section content rendered from eApp with source attribution present in the accessible name, not just a badge | F6, F14 |
| 6. Discover the relationship | Hub resolves `outstandingIssueRefs` into typed `RelatedRef` objects by calling the PVQ adapter live; PDT and IM relationships resolved the same way; a reference that will not resolve renders a "couldn't be confirmed" state rather than a broken link | F6, F7, F8, F9 |
| 7. Traverse | In-shell route change to the PVQ item carrying `from=EAPP:CASE-A-1042`; no credential prompt, no tab; descriptive page title change; focus placed on the new `h1`; traversal itself audited so the chain shows the path, not just the endpoints | F1, F3, F7, F13, F14 |
| 8. Resolve | Server re-authorizes **two** permissions — `ISSUE.RESOLVE` on `PVQ:ISS-2207` and `CASE.UPDATE_ISSUE_STATE` on `EAPP:CASE-A-1042` — before anything is written; validation errors return an error summary with in-page links and the narrative intact | F2, F6, F7, F14 |
| 9. See both systems answer | Hub orchestrates PVQ first (authoritative outcome), then eApp's parent-state update; audit written before the success response returns; **if the second write fails, an explicit partial-completion state names exactly which system changed and which did not, with a retry path — never a success message** | F7, F13, F10 |
| 10. Verify on the case | eApp re-read through its adapter (not from cache) showing `outstandingIssueCount=0`; a per-system view offers PVQ's own record of the resolution | F6, F7, F9 |
| 11. Leave the record | Spoke-native history merged with hub audit records into one chronology; chain view returns every record sharing the workflow correlation ID | F6, F13 |

**Emotion curve (1 anxious → 5 confident):** Sign in **3** → Orient **3** (an issue sat three days) → Enter **4** → Open case **4** → Read answer **4** → Discover relationship **5** *(the "oh — it's already connected" moment)* → Traverse **5** → Resolve **3** *(deliberate dip: this is a government record about a person, and he is being careful)* → Both systems answer **5** *(peak trust)* → Verify **5** → Record **5**.

#### Key Moments

- **Decision Point — Stage 8 (Resolve).** Marcus chooses a disposition and writes a narrative that an adjudicator will read months later out of context. This is the product's most consequential write and the one that must never fail silently or lose typed text.
- **Delight Opportunity — Stage 6 (Discover the relationship).** The instant the related-items panel shows the PVQ issue already connected to the answer it was raised against, with the relationship explained in words, the product has replaced his scratch document. This is the moment to slow down in the demo.
- **Peak-trust Moment — Stage 9 (Dual-system confirmation).** Showing each spoke's **own** answer, and being able to prove it with independent API calls outside the hub entirely, is what separates a demonstration from an assertion.
- **Risk of Abandonment — Stage 7 (Traverse).** Any credential prompt, new tab, "you are now leaving this application" interstitial, or visual discontinuity here is the exact pain he came to escape. One occurrence and he stops believing the rest of the product.
- **Trust-destroying Risk — Stage 9.** A success message that turns out to be false in one of the two systems ends this persona's relationship with the product permanently. The partial-completion state exists for this reason and must be demonstrable on demand.

#### Success Exit Criteria

- The workflow completes end to end in **under three minutes**, manually, following the demo script (PRD F7 acceptance signal, SM-01).
- The audit log contains **exactly one authentication event** for the session (SM-02).
- **Zero** manual re-entry of subject, case, or issue identifiers at any step (SM-04).
- `GET {pvq}/issues/ISS-2207` and `GET {eapp}/cases/CASE-A-1042`, called **directly against the spokes**, both return the updated state (SM-03).
- The entire action is retrievable as a **single correlated chain** in the audit viewer (SM-20).
- Returning to the queue restores prior filters, sort, and page.
- The whole path is completed **keyboard-only** in a separate verification pass (SM-08).

#### Failure and Alternate Paths

| Condition | What Marcus sees | Recovery |
|-----------|------------------|----------|
| PVQ write succeeds, eApp parent-state write fails | Explicit **partial-completion** state: "The issue was resolved in PVQ. The case record in eApp was not updated." Named systems, correlation ID, retry action. **No success confirmation is shown.** | Retry the eApp half; the retry is a distinct audited operation under the same correlation ID |
| PVQ unavailable at Stage 7 | The related issue link renders, but the issue detail shows a named degraded state; the resolve action is **pre-emptively disabled with an explanation** rather than allowed to fail mid-submission | Work other queue items; the action re-enables automatically when PVQ recovers, with no reload and no re-authentication |
| Validation failure on the resolution form | Error summary at the top of the form with in-page links to the offending fields; **the narrative is preserved verbatim** | Fix the named field and resubmit |
| Session timeout warning mid-narrative | SCR-06 modal with a live countdown and "Stay signed in"; entered data is not discarded | Extend in place; if the session does end, re-authentication returns him to the requested item via `returnTo` |
| `ISS-2207` already resolved (demo re-run without reset) | The issue detail shows its resolved state and disposition; the resolve action is absent because the server computes it as unavailable | Run the reset command, or drive the journey on the second seeded open issue (precondition P7) |
| Issue references a case that does not exist (the one intentional seeded orphan) | A "couldn't be confirmed" relationship state naming what could not be resolved — not a broken link and not a stack trace | Documented seed condition; exists so the mismatch handling is demonstrable rather than theoretical |
| Marcus opens a case assigned to another investigator by direct URL | SCR-30 access denied, non-enumerable, with a correlation ID and exits to his dashboard and queue; the denial is audited | Return to his own queue |

#### Accessibility Notes

*This journey must be completable **keyboard-only and with a screen reader**, start to finish (SM-08). It is the accessibility pass that matters most, because it is the path a reviewer will watch.*

- **Queue table (Stage 3):** proper header scope and caption; sortable headers announce sort state; filter and pagination changes announce a result count. Without this the queue is unusable non-visually.
- **The traversal (Stage 7) is the highest-risk accessibility step in the product.** Moving from the eApp case to the related PVQ issue must produce a **descriptive page-title change** and place focus predictably on the new heading. If focus is dropped to the document top or left on a detached element, a screen-reader user loses precisely the continuity this product claims to deliver.
- **Source attribution** (`eApp`, `PVQ`, `PDT`, `IM`) must be in the **accessible name** of each row and panel, never conveyed by a colored badge alone (NFR-02).
- **Resolution form (Stage 8):** programmatically associated labels, described-by hint text on the disposition options, required-field indication that is not color-only, inline errors, and an **error summary with focus management and in-page links**. The narrative is long free text; losing it to a validation failure is a trust-destroying event.
- **Dual-system confirmation (Stage 9):** announced via `aria-live="polite"` with focus moved deliberately to the alert, since this is a result the user is waiting for. Contrast with degraded warnings, which must **never** steal focus.
- **Status vocabulary** — open, resolved, overdue, blocked — distinguishable in grayscale by text and/or icon.
- Usable at **200% zoom** and in a **half-width browser window at 320px equivalent** with no horizontal scrolling, because Marcus routinely runs the browser beside a notes document (NFR-16).

#### Success Outcome

Marcus completes eApp case → related PVQ issue → resolution → dual-system confirmation in **under three minutes, with exactly one authentication event in the audit log, zero manual identifier re-entry, and both spokes independently returning the updated state through their own APIs** — the success measure of JTBD-01.1 and the primary metric set SM-01 through SM-04, with SM-20 satisfied by the correlated chain.

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Sign in | F0, F1, F13 |
| 2. Orient | F4, F15, F2, F17 |
| 3. Enter the work | F5, F8, F14, F17 |
| 4. Open the case | F2, F6, F8, F9 |
| 5. Read the answer | F6, F9, F14 |
| 6. Discover the relationship | **F7**, F6, F8, F9 |
| 7. Traverse | **F7**, F1, F3, F13, F14 |
| 8. Resolve | **F7**, F2, F6, F14 |
| 9. See both systems answer | **F7**, F10, F13, F16 |
| 10. Verify on the case | **F7**, F6, F9 |
| 11. Leave the record | F13, F6, F10 |

---
