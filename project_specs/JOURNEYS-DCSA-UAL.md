# User Journeys
## DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

| Field | Value |
|-------|-------|
| **Product Name** | DCSA Unified Application Access and Integration Prototype |
| **Project Acronym** | DCSA-UAL |
| **Document Type** | User Journeys |
| **Status** | Draft v1.0 |
| **Date** | 2026-09-15 |
| **Related Personas** | `project_specs/PERSONAS-DCSA-UAL.md` (PER-01 … PER-04) |
| **Related JTBD** | `project_specs/JTBD-DCSA-UAL.md` (JTBD-01.1 … JTBD-04.4) |
| **Related PRD** | `project_specs/PRD-DCSA-UAL.md` (§5 Feature Requirements F0–F19; §7 Success Metrics) |
| **Related FRD** | `project_specs/FRD-DCSA-UAL.md` (screen inventory SCR-01 … SCR-38; seed corpus F17) |
| **Related Charter** | `.planning/PROJECT.md` |

> **DEMO — SYNTHETIC DATA ONLY.** Every journey below is written to be **walked live, on synthetic data, in front of an evaluator**. The people are fabricated. The cases, questionnaires, issue items, and identifiers are fabricated and invalid by construction. No real DCSA personnel, applicants, or systems are represented.

---

## How to Read This Document

Each journey is a **to-be** journey: it maps the step the user actually takes in the unified layer, and — in the **Pain Point** column — what that same step costs them **today**, in the fragmented multi-application estate. That column is the product's argument. If a stage has no "today" cost, the stage is not earning its place.

Every journey carries:

- **Entry Trigger** — the real-world event that starts it.
- **Preconditions (Seed Data Required)** — the exact synthetic rows that must exist for the journey to be demonstrable. **This section is normative input to the F17 seeding work.** A journey whose preconditions are not seeded is a journey that cannot be demoed, and seed validation (`FR-F17-10`) should fail loudly rather than let it be discovered in front of a reviewer.
- **Journey Stages** — step, action, touchpoint (a specific screen from the FRD inventory), the user's thinking, their feeling, today's cost, and the design opportunity.
- **System Response by Stage** — what the product does in reply, with the PRD feature IDs (F0–F19) exercised.
- **Emotion Curve** — the affective shape of the journey on a 1–5 scale (1 = anxious/distrustful, 5 = confident). Journeys that never dip are lies.
- **Key Moments**, **Success Exit Criteria**, **Failure and Alternate Paths**, **Accessibility Notes**, **Success Outcome**, and **Feature Touchpoints**.

**Accessibility is a completion criterion, not a note.** Every journey in this document must be completable **keyboard-only and with a screen reader**, start to finish. Where a journey has a step that is a known accessibility risk — a cross-application traversal, a live connection test, a live-region degraded warning arriving mid-form — the risk is named explicitly in that journey's Accessibility Notes so it can be tested rather than assumed (F14, NFR-01, NFR-02, NFR-16, SM-07, SM-08).

**Touchpoint notation.** Touchpoints name the FRD screen (e.g. `SCR-15 eApp case view`) and the component within it, so a journey step maps to something a builder can point at. Screens are defined in `FRD-DCSA-UAL.md` §Screen Inventory.

### Persona ↔ seeded identity binding (action for the seeding work)

**RESOLVED.** The persona names used throughout this document (Marcus Vale, Dana Okonkwo, Renée Ashford, Priya Raghunathan) are the **design personas** from `PERSONAS-DCSA-UAL.md`, and the FRD seed corpus (`FR-F17-02`) has been reconciled to them: PER-01 seeds as **Marcus Vale**, PER-02 as **Dana Okonkwo**, PER-03 as **Renée Ashford** (`SUBJ-00622`), PER-04 as **Priya Raghunathan**. The supporting cast — Harlan T. Boyce (T3 unit-mate), Ingrid L. Vasterling (ECA-only), Sofia K. Mendelbaum (dual-role), Theodore Q. Lansbury (`SUBJ-00418`, the flagship subject), Bartholomew N. Quigley (zero-item applicant) — are deliberately **not** design personas and carry no `PER-ID`. One name per human, everywhere. `FR-F17-02` AC-3 asserts the binding at seed time and fails startup if it breaks. This document's preconditions remain written against the **stable seed references** (`CASE-A-1042`, `ISS-2207`, `SUBJ-00418`, `SUBJ-00622`, `CVS`), which were unaffected by the decision.

---

## Journey Index

| ID | Persona | Scenario | Key JTBD | Stages | Demo path |
|----|---------|----------|----------|--------|-----------|
| **JRN-01.01** | PER-01 Marcus Vale | **Flagship** — clear a blocking PVQ issue on an eApp case in one sitting, one login, dual-system update | JTBD-01.1 | 11 | **Primary — Segment 1** |
| JRN-01.02 | PER-01 Marcus Vale | Monday-morning triage: one queue answers "what do I work next" across five spokes | JTBD-01.2, JTBD-01.3 | 7 | Supporting — Segment 3b |
| JRN-01.03 | PER-01 Marcus Vale | Keep working while Investigation Management is down — named degradation, disabled actions, automatic recovery | JTBD-01.4 | 7 | **Secondary — Segment 2a** |
| JRN-02.01 | PER-02 Dana Okonkwo | Assemble the whole cross-system picture on a subject and render a determination | JTBD-02.1, JTBD-02.2 | 9 | **Secondary — Segment 4** |
| JRN-02.02 | PER-02 Dana Okonkwo | Work the aging queue, return a case for more investigation, and refuse to decide on data that is quietly missing | JTBD-02.3, JTBD-02.4 | 7 | Supporting — Segment 2c |
| JRN-03.01 | PER-03 Renée Ashford | On a phone at lunch: where do I stand, what do I owe, do it now | JTBD-03.1, JTBD-03.2, JTBD-03.3 | 8 | Supporting — Segment 5a |
| JRN-03.02 | PER-03 Renée Ashford | Prove what I submitted — and see, live, that the boundary around my record holds | JTBD-03.4 | 6 | **Secondary — Segment 5b** |
| JRN-04.01 | PER-04 Priya Raghunathan | Register the sixth application live, through the UI, and watch it start reporting health | JTBD-04.1 | 9 | **Secondary — Segment 3a** |
| JRN-04.02 | PER-04 Priya Raghunathan | Triage a reported integration failure: health view → integration-issue log → correlation ID → audit chain → contain | JTBD-04.2, JTBD-04.3, JTBD-04.4 | 8 | Supporting — Segment 6 |
| JRN-04.03 | PER-04 Priya Raghunathan | Rehearse degradation on purpose: induce an outage, watch the product degrade visibly, restore it | JTBD-04.2, JTBD-04.4 | 6 | **Secondary — Segment 2b** |

**Coverage check.** Four personas, ten journeys, every persona ≥ 2. All sixteen JTBD entries are claimed by at least one journey (see *Journey-to-JTBD Traceability*). Every journey is demonstrable live on the F17 synthetic corpus with no manual setup beyond the documented reset command (`FR-F17-11`).

---

## The Scripted Demonstration Path

This is the order an evaluator should be walked through, and the order rehearsal should protect. It follows the demo-script assignment already made in `JTBD-DCSA-UAL.md` (§Downstream Use): **JTBD-01.1 is the primary script; JTBD-01.4, JTBD-02.2, JTBD-03.4, and JTBD-04.1 are the secondary scripts** (PRD F18).

| Segment | Journeys | What the evaluator is being shown | Duration |
|---------|----------|-----------------------------------|----------|
| **1. The thesis** | **JRN-01.01** | One sign-in, one shell, a case-advancing action that spans eApp and PVQ, and both spokes independently confirming the change. **If only one thing is demonstrated, it is this.** | ~5 min |
| **2. Resilience** | JRN-04.03 (drive) → JRN-01.03 (observe) → JRN-02.02 (the adjudicator consequence) | Degradation is named and quantified, not blank; the rest of the queue stays usable; recovery needs no reload and no re-authentication. Two windows side by side: Priya induces, Marcus observes. | ~4 min |
| **3. Extensibility** | **JRN-04.01** (drive) → JRN-01.02 (observe) | A sixth application onboarded as configuration, live, in under five minutes — and its work items appearing in an already-signed-in investigator's queue without him signing out. | ~6 min |
| **4. Zero trust, role-level** | JRN-02.01 | The same PVQ issue work item, opened by the adjudicator and by the investigator, presenting **different server-computed action sets**. | ~3 min |
| **5. Zero trust, resource-level** | JRN-03.01 → **JRN-03.02** | The strictest scope in the product, then the curl denial: another subject's resource ID, denied server-side, non-enumerably, and the denial visible in the audit trail. | ~4 min |
| **6. Accountability** | JRN-04.02 | One correlation ID resolving the entire cross-system chain — including the administrator's own actions, because administrators are not exempt. | ~3 min |

**Rehearsal rule.** Segments 2 and 3 mutate platform state (failure injection, registry). The reset command (`FR-F17-11`) must be run between full rehearsals so Segment 1 is always driven against pristine baseline data — `ISS-2207` must be `OPEN` at the moment the demo starts (SM-22).

---

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

### JRN-01.02: Monday-Morning Triage Across the Whole Caseload

**Persona:** PER-01 (Marcus Vale)
**Scenario:** 0705 on a Monday, laptop on a hotel desk over a VPN. Forty-one open cases, a weekend of accumulation, and a day that will be interrupted a dozen times. Marcus needs one trustworthy answer to "what is assigned to me and what is due first" before he starts making phone calls — and he needs that answer to survive the interruptions, so that when he comes back at 0940 after a source calls him, the queue is still where he left it. This journey is also where a newly registered sixth application (CVS) becomes visible to him without signing out, which is why it is paired with JRN-04.01 in the demo.
**Related Jobs:** JTBD-01.2 *(primary)*, JTBD-01.3 *(recent activity and the record)*, JTBD-04.1 *(as the observing half of the extensibility proof)*
**Entry Trigger:** Start of the working day, and again after every interruption of 10–60 minutes.
**Demo Path:** Supporting — **Segment 3b**. Marcus's queue is the window an evaluator watches while Priya registers CVS in the other window.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | PER-01's queue contains **28–34 items** spanning **at least four of five** spokes, so pagination at 25 per page is exercised and SM-14 is observable. |
| P2 | im | Overdue assignments owned by PER-01, so the overdue alert rule and due-date sort have real material rather than a contrived single row. |
| P3 | eapp / pvq / pdt | Items owned by PER-01 in each namespace with varied status and priority, so **every filter facet returns at least one result** — a filter that always returns nothing looks broken. |
| P4 | hub | Default saved view for the investigator role: "assigned to me, due date ascending", applied without configuration. |
| P5 | hub | Two active announcements targeted at the investigator role, one of which is dismissible per user, plus ~4 alerts of distinct types (overdue, newly raised issue, blocked case, approaching due). |
| P6 | cvs | Nine CVS alerts, four of them assignable to PER-01, seeded but **unreachable until CVS is registered** — the visible consequence of JRN-04.01. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Sign in | Authenticates once by CAC/PIV over a VPN that is having a mediocre morning | SCR-01 → SCR-02 | "Please just let me in once." | Impatient | **Today:** three logins with three session lifetimes; the one he needs third has already expired | One session, honored by every adapter for its whole life (F1) |
| 2. Take the temperature | Reads assigned-work counts, alerts, and due-date widgets | SCR-09 investigator dashboard | "Forty-one open. Four overdue. One new issue. Okay." | Braced but oriented | **Today:** the shape of his own workload has to be reconstructed from three systems and memory | One composed answer to "what is mine, what is urgent, what changed" (F4) |
| 3. Open the queue | Activates "View all work" and lands on the default view | SCR-13 unified work queue, "assigned to me, due date ascending" | "It already sorted it the way I would have." | Mildly surprised | **Today:** three lists, three sort orders, none prioritized against the others, so he prioritizes by whoever called him last | A default view that answers the question without configuration; next action ≤ 2 clicks from sign-in |
| 4. Narrow | Adds a source-system filter and a due-date range; chips appear with a clear-all | SCR-13 → filter chips + result count | "Show me just what's overdue this week." | In control | **Today:** narrowing means re-querying each system separately and comparing by hand | Server-scoped filtering with removable chips and an announced result count (F5, F14) |
| 5. Read a row and commit | Scans source badges and status text, opens the highest-consequence item | SCR-13 row → SCR-14/SCR-15 detail | "PVQ badge, due Thursday. That's the one that blocks a case." | Decisive | **Today:** priority and due-date semantics differ invisibly between systems, so a sorted list can be wrong in a way he cannot see | Normalized date and priority semantics with visible source attribution on every row |
| 6. Get interrupted, come back | A source calls; he abandons the screen for forty minutes, then returns via the browser | SCR-13 restored with prior filters, sort, and page | "It's exactly where I left it. I don't have to rebuild this." | Relieved | **Today:** he rebuilds filters and scroll position from scratch a dozen times a day | Queue context preserved across return navigation and interruption (F6) |
| 7. Notice something new arrive | A sixth source appears in the filter list and four new items appear in the queue, correctly attributed — without him signing out | SCR-13 → source filter + new CVS-badged rows | "Where did those come from? Nobody restarted anything." | Curious, then impressed | **Today:** a new application means a new login, a new URL, and an engineering project that took months | Registry-driven fan-out: a newly registered application reaches an open session on the next poll (F8, F12, SM-12) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Sign in | One server-side session; entitlements computed server-side and returned to build navigation, so the UI never advertises what he cannot do | F0, F1, F2 |
| 2. Take the temperature | Dashboard composed per role from live spoke data with widget-level loading states, so a slow spoke never blanks the page; alert rules computed server-side | F4, F15, F16 |
| 3. Open the queue | Single fan-out request across all registered adapters with per-source partial-failure tolerance; normalized work-item model with source attribution retained | F5, F8 |
| 4. Narrow | Filtering, sorting, and search evaluated **server-side and scoped to what this principal may see** — never a client-side filter over an over-fetched list | F5, F2, F14 |
| 5. Read a row and commit | Resource-level authorization on open; queue context (filters, sort, page) captured for the return trip | F2, F6 |
| 6. Get interrupted, come back | Saved view state restored; session still live, or SCR-06 timeout warning with an accessible path back that does not discard anything | F6, F0 |
| 7. Notice something new arrive | Registry version poll (≤ 30 s) delivers updated navigation and fan-out targets to an open session; CVS items normalized and badged like any other source, with **no special-casing anywhere in the hub** | F8, F12, F5 |

**Emotion curve (1 anxious → 5 confident):** Sign in **2** *(Monday, VPN, forty-one cases)* → Dashboard **3** → Queue **4** → Narrow **4** → Commit **4** → Return from interruption **5** *(the context survived)* → New source appears **5**.

#### Key Moments

- **Decision Point — Stage 5.** He commits his morning to an ordering. If the sort is wrong in a way he cannot explain, the whole day is mis-spent and he goes back to checking each system by hand.
- **Delight Opportunity — Stage 6.** Returning after forty minutes to filters, sort, and page exactly as he left them. For an investigator with a severe interruption profile, this is worth more than any feature that looks better in a screenshot.
- **Risk of Abandonment — Stage 3.** A queue that shows fewer sources than he knows he has work in. He will not report it; he will quietly resume checking each system directly, and the product has lost its only value.
- **Demo Moment — Stage 7.** New work arriving in an already-signed-in session without a restart is the visible consequence that makes JRN-04.01's registration real rather than administrative.

#### Success Exit Criteria

- The queue renders correctly attributed items from **at least four of five** spokes (SM-14), rising to six after CVS registration.
- The correct next item is reachable from the dashboard in **two clicks or fewer**.
- Every filter facet returns at least one result on the default date range; pagination is exercised (> 1 page).
- Returning from an item restores filters, sort, and page.
- Sort changes announce sort state; filter changes announce a result count.
- Newly registered CVS items appear **without signing out or reloading the application** (SM-12).

#### Failure and Alternate Paths

| Condition | What Marcus sees | Recovery |
|-----------|------------------|----------|
| One spoke unavailable | Remaining sources render fully plus a named, quantified warning — see JRN-01.03 | Keep working; recovery is automatic |
| Genuinely empty filter result | A **designed empty state** explaining what would appear here and offering "clear filters" — visibly different from a degraded state | Clear or widen the filters |
| Session expires during a long interruption | SCR-06 warning while still signed in; if it lapses, sign-in returns him to the requested path via `returnTo` | Re-authenticate; queue view state is restored |
| An item he may see but may not act on | The item opens; the action set is computed server-side and simply does not offer what he is not entitled to do | No wasted effort on an action he cannot complete |
| Search returns another investigator's case by identifier guess | Denied at resource level, non-enumerably; the denial is audited | Continue within his own scope |

#### Accessibility Notes

- **Keyboard-only:** the entire journey — filter chips, sortable headers, pagination, row activation, clear-all — is reachable and operable by keyboard with a visible focus order that follows the visual order. No keyboard traps in the filter panel.
- **Screen reader:** the queue is a proper data table with caption and header scope; sortable headers announce current sort state; filter and pagination changes announce the new result count via a live region; source attribution is in each row's accessible name.
- Announcements and alerts arriving asynchronously (including CVS appearing at Stage 7) are delivered through live regions **without stealing focus** — he may be mid-form elsewhere.
- Overdue, blocked, and new states are conveyed by text and/or icon, never color alone (NFR-02).
- Usable at 200% zoom and at 320px-equivalent width with no horizontal scrolling; the queue reflows rather than requiring lateral scroll (NFR-16).

#### Success Outcome

Marcus's unified queue renders correctly attributed items from at least four of five spokes and he opens the correct next item from the dashboard in **two clicks or fewer** — the success measure of JTBD-01.2 (SM-14, SM-24) — with his working context surviving a 40-minute interruption and a newly onboarded sixth application reaching his open session without a sign-out (SM-12).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Sign in | F0, F1, F2 |
| 2. Take the temperature | F4, F15, F16, F17 |
| 3. Open the queue | F5, F8, F17 |
| 4. Narrow | F5, F2, F14 |
| 5. Read a row and commit | F5, F6, F2 |
| 6. Get interrupted, come back | F6, F0, F3 |
| 7. Notice something new arrive | F8, F12, F5, F16 |

---

### JRN-01.03: Keep Working While Investigation Management Is Down

**Persona:** PER-01 (Marcus Vale)
**Scenario:** Mid-morning, Marcus is at an employer site working over a VPN. Unknown to him, Investigation Management has just been forced into an unavailable state — in the demo, deliberately, by Priya from the failure-injection controls (JRN-04.03); in production, by an ordinary outage. He refreshes his queue. Today, the symptom of an unhealthy back-end is an empty list, and an empty list that might be a lie is worse than an error: he cannot distinguish "no items" from "the system couldn't be reached," so he stops trusting every screen. This journey is the product's answer: degradation that is **named, quantified, and survivable**, with the other four sources fully usable and recovery that costs him nothing.
**Related Jobs:** JTBD-01.4 *(primary)*, JTBD-01.2 *(the queue he is still working)*
**Entry Trigger:** A spoke becomes unhealthy while Marcus has an open session — detected by the background health monitor, not by Marcus.
**Demo Path:** ✅ **SECONDARY SCRIPTED DEMO — Segment 2a.** Driven from the other window by JRN-04.03. The evaluator watches this window.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | im | **IM is the designated outage-demonstration spoke.** Its seed data must include items owned by PER-01 — including overdue ones — so that removing it **visibly changes counts**. A degradation demo against an empty source is abstract and unconvincing. |
| P2 | hub | A populated `work_item_counts_cache` for PER-01 × IM from a prior successful fan-out, so the warning can quantify the gap ("12 items are not shown") rather than fall back to the unquantified copy. |
| P3 | eapp / pvq / pdt | Enough PER-01-owned items in the remaining spokes that the queue is still substantively useful with IM removed — the claim is "the rest of your work is up to date," and it has to be true on screen. |
| P4 | im | At least one **in-flight action target** owned by PER-01 in IM, so the pre-emptively disabled action state is demonstrable rather than theoretical. |
| P5 | hub | Failure-injection controls available to the administrator identity (SCR-38), demo-scoped and administrator-only. |
| P6 | hub | Circuit-breaker thresholds and health-probe interval configured tightly enough that the demo does not require an awkward silence — degradation and recovery must both be observable inside one health-check interval. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Refresh the queue | Returns to the queue after a call and the page refreshes | SCR-13 unified work queue | "Hang on — that's fewer rows than it was." | Suspicious | **Today:** an empty or short list is indistinguishable from an outage, so he cannot trust what he is looking at | Partial results by default: what is available renders, what is missing is stated |
| 2. Read the warning | Reads a prominent site-alert: **"Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date."** | SCR-13 → degraded-system banner | "Twelve missing, and I know which system. Fine — that's not my problem to solve." | Annoyed but oriented | **Today:** he calls the administrator or a colleague to ask whether "it's just me," and waits | Degradation named **and quantified**, so the gap is bounded rather than unknown (NFR-10) |
| 3. Keep working the rest | Filters to eApp and PVQ and continues triaging | SCR-13 → source filter, remaining four sources fully actionable | "Four out of five still works. I can use the morning." | Productive again | **Today:** one unhealthy back-end stalls the page or blanks the list, and he stops working entirely | One slow or dead spoke never stalls the aggregate request; the rest stays actionable (SM-16) |
| 4. Hit a blocked action | Opens an item whose action targets IM; the action is visibly disabled with a plain explanation | SCR-14 work-item detail → disabled action + explanatory text | "It's telling me now, not after I typed three paragraphs." | Respected | **Today:** the action is offered, accepted, and fails mid-submission, taking his typed input with it | Actions against an unavailable spoke are **pre-emptively disabled with an explanation**, never allowed to fail mid-flight |
| 5. Check whether it is just him | Glances at the header status indicator; the warning is consistent everywhere incomplete data is shown | SCR-08 shell header → SCR-09 dashboard degraded notice | "Same message on the dashboard. It's the system, not me." | Settled | **Today:** each screen fails differently, so he cannot form a single picture of what is wrong | Consistent, specific degraded treatment wherever incomplete data appears (F16) |
| 6. Recovery arrives | The next successful health check restores IM; the warning clears and the missing items reappear | SCR-13 live-region update — **no reload, no re-authentication** | "It came back on its own. I didn't have to do anything." | Reassured | **Today:** recovery means a page reload at best and a fresh login at worst, usually discovered by trial and error | Automatic recovery via half-open circuit probing; the user does nothing (SM-17) |
| 7. Resume with a full picture | Clears the filter and sees all five sources and the restored count | SCR-13 full queue + announced result count | "Back to forty-one. Nothing got lost." | Confident | **Today:** he re-verifies each source by hand before he trusts the total again | Counts reconcile after recovery, so trust is restored rather than merely assumed |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Refresh the queue | Fan-out returns HTTP 200 with partial results and a per-source status list; the failing adapter's error is logged with a correlation ID into the integration error log | F5, F16, F8, F11 |
| 2. Read the warning | Degraded banner rendered from per-source status, naming the application and quantifying the omission from the last successful count; where no prior count exists the copy omits the number rather than guessing | F16, F14, NFR-10 |
| 3. Keep working the rest | Circuit breaker opens after the configured failure threshold, so the hub stops hammering IM and the remaining adapters answer at full speed | F16, F8, F9 |
| 4. Hit a blocked action | Server-computed action list marks IM-targeted actions unavailable with a reason; the client renders them disabled with explanatory text rather than hiding them, so the capability is legible | F6, F2, F16 |
| 5. Check whether it is just him | Degraded state is surfaced consistently on dashboard, queue, and detail; **no error page and no blank screen appears anywhere** in the application | F4, F16, F3 |
| 6. Recovery arrives | Half-open probing succeeds, the circuit closes, health flips to healthy, polling delivers restored data to the open session; the warning clears through the same live region that raised it | F16, F1 |
| 7. Resume with a full picture | Full fan-out resumes; `work_item_counts_cache` refreshed; result count announced | F5, F16, F14 |

**Emotion curve (1 anxious → 5 confident):** Refresh **2** *(the count is wrong)* → Read warning **3** *(named and bounded — the anxiety converts to information)* → Keep working **4** → Blocked action **4** *(told before, not after)* → Cross-check **4** → Recovery **5** → Resume **5**.

#### Key Moments

- **Decision Point — Stage 2.** Does he keep working or stop and start phoning people? The named, quantified warning is the entire difference. "Investigation Management is unavailable — 12 items are not shown" converts an outage into a bounded, manageable fact.
- **Risk of Abandonment — Stage 1.** If the short list arrives with no explanation, he learns the screen can lie by omission. That trust loss is permanent: he will re-check every source system by hand forever, and the product's only value is gone.
- **Risk — Stage 4.** A warning that steals focus out of a half-written narrative is itself a failure. Degraded notices are polite live-region updates, never focus grabs.
- **Delight Opportunity — Stage 6.** Recovery with **no reload and no re-authentication** is the observable that separates "we handled the error" from "we designed for it" (SM-17).

#### Success Exit Criteria

- The queue renders the remaining four sources **fully and actionably** with a **specific named warning** (SM-15, SM-16).
- **No error page, blank screen, or stack trace appears anywhere in the application** during the outage (NFR-09, SM-15).
- Actions targeting the unavailable spoke are disabled with an explanation before submission, not failed after it.
- Restoring the spoke clears the warning and restores data **without user reload or re-authentication** (SM-17).
- The degraded warning is announced to assistive technology **without stealing focus**.
- A correctly attributed entry appears in the integration error log within one health-check interval (pairs with JRN-04.02).

#### Failure and Alternate Paths

| Condition | What Marcus sees | Recovery |
|-----------|------------------|----------|
| Two spokes down simultaneously | Both named in the warning with their own counts; the remaining sources still render | Unchanged behavior; the warning composes rather than collapsing into "something went wrong" |
| Spoke is **slow** rather than dead | Widget- and section-level loading states with accessible busy announcements; the adapter times out at its configured bound and degrades to the named warning rather than hanging the page | Page remains interactive throughout |
| Omitted count unknown (no cached prior count) | "Investigation Management is unavailable — some items are not shown." The number is omitted rather than guessed | Count returns on the next successful fan-out |
| The spoke returns but with errors | Health reports degraded rather than healthy; the warning persists with the degraded wording; the circuit reopens on repeated failure | Automatic, with the error log recording each failure class |
| Marcus is mid-form in another item when recovery lands | The live region announces the change; **focus is not moved**; his input is untouched | He finishes the form and sees the refreshed queue on return |

#### Accessibility Notes

- **Keyboard-only:** every control remains reachable during degradation. Disabled actions stay **focusable and explained** (or are paired with adjacent explanatory text) so a keyboard user learns *why* rather than finding an inert control.
- **Screen reader:** the degraded warning is delivered through a live region with `aria-live="polite"` and is also present in the page's static structure, so a user who arrives after the announcement still encounters it by navigating headings and landmarks. Announcements **must not** move focus.
- The warning names the application in text — health and degraded states are never conveyed by a red/green dot or color alone (NFR-02).
- Loading and busy states carry accessible busy announcements; a skeleton without semantics is a silent screen.
- The distinction between a **designed empty state** and a **degraded state** must be clear non-visually as well as visually: different wording, different structure, not merely a different icon color.
- Usable at 200% zoom and 320px-equivalent width; the banner must not consume the viewport or push the demo banner out of view (NFR-13, NFR-16).

#### Success Outcome

With a spoke forced offline from the administrator's failure-injection control, Marcus's queue renders the remaining sources plus a **specific named warning with no error page anywhere in the application**, and restoring the spoke clears the warning **without reload or re-authentication** — the success measure of JTBD-01.4 (SM-15, SM-16, SM-17).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Refresh the queue | F5, F16, F8 |
| 2. Read the warning | F16, F14, F5 |
| 3. Keep working the rest | F5, F16, F9 |
| 4. Hit a blocked action | F6, F2, F16 |
| 5. Check whether it is just him | F4, F3, F16 |
| 6. Recovery arrives | F16, F1, F11 |
| 7. Resume with a full picture | F5, F16, F14 |

---

## PER-02: Dana Okonkwo

*Adjudicator, Consolidated Adjudication Services. 15–25 cases pending determination, 25–90 minutes each. Reads across eApp, PVQ, PDT, and IM to make one decision that must be defensible to a reviewing authority, an appeal, and an inspector general years later. Low interruption frequency, very high context depth.*

---

### JRN-02.01: Assemble the Whole Picture on a Subject and Render a Determination

**Persona:** PER-02 (Dana Okonkwo)
**Scenario:** A subject reaches Dana for determination. The case is the one Marcus worked: eApp case `CASE-A-1042` on subject `SUBJ-00418`, with one PVQ issue that was raised against a Section 13A employment answer and has since been dispositioned. To decide, Dana needs four things — the questionnaire as submitted, every issue raised against it **and how each was disposed**, the PDT designation that set the investigation tier, and the IM case record showing investigative completeness. Today that is four logins, four searches, and an assembly job she performs by hand on paper, which is the actual work and is unbillable. In the unified layer it is one reading path. This journey also carries the product's clearest live RBAC demonstration: Dana opens **the same PVQ issue work item Marcus resolved** and is offered a demonstrably different, server-computed set of actions.
**Related Jobs:** JTBD-02.1 *(primary)*, JTBD-02.2 *(the determination and its record)*
**Entry Trigger:** A case transitions into her adjudicative queue as investigatively complete.
**Demo Path:** ✅ **SECONDARY SCRIPTED DEMO — Segment 4.** The side-by-side action-set contrast with JRN-01.01 is the sharpest zero-trust moment in the product and should be shown immediately after the flagship, while the evaluator still has `ISS-2207` in mind.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | An ADJUDICATOR identity bound to PER-02, `org=DCSA-FIELD-OPS-EAST`, `tier=T5`, with `CASE-A-1042`'s subject inside her adjudicative scope — and **without** the investigator's `case_assignment`, so the action-set difference is attribute-driven, not hard-coded. |
| P2 | pvq | `ISS-2207` in a **resolved** state with its disposition **and full resolution narrative** populated. Dana's determination quality depends on reading the narrative, not merely that an issue closed. *(If the demo runs Segment 4 after Segment 1, this state is produced live by Marcus — which is the better story.)* |
| P3 | pdt | An `APPROVED` designation for the subject's position with its resulting investigation **tier**, since adjudicating against the wrong tier is a finding against her. |
| P4 | im | The IM case record for `CASE-A-1042` showing investigative completeness and its chain of activity. |
| P5 | hub | 15–25 items in her pending-determination queue with **varied age**, including at least one blocked-awaiting-investigator item, so the aging story (JRN-02.02) has material. |
| P6 | hub | An adjudicator dashboard composition visibly different from the investigator's — different widgets, different counts, different navigation (SM-23). |
| P7 | pvq | A second subject whose issue set is **genuinely empty**, so "no issues exist" and "PVQ is unreachable" can be shown as two different screens (JRN-02.02). |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Sign in and settle | Authenticates once, sees a determination-shaped dashboard | SCR-01/SCR-02 → SCR-10 adjudicator dashboard | "Same product as the investigator, but this is my work, not his." | Composed | **Today:** four logins with mismatched session lifetimes; PVQ has expired by the time she finishes reading eApp | One session for the entire 45-minute read, no credential prompt at any boundary (F1) |
| 2. Pick the determination | Sorts her pending queue by age and opens the oldest | SCR-13 queue, adjudicator default view | "Oldest first. The clock is measured on me." | Purposeful | **Today:** she learns a case is aging from a management report, not from her workspace | Aging surfaced in the workspace where the decision is made (F5, F4) |
| 3. Read what was submitted | Reads the eApp questionnaire as submitted, section by section | SCR-15 eApp case view, source-badged `eApp` | "This is the record as he gave it. Good." | Absorbed | **Today:** she assembles the four sources herself, on paper or in a side document — the assembly *is* the work | The record assembles itself; her time goes to judging evidence, not collecting it |
| 4. Follow the issue | Opens the related PVQ issue from the related-items panel — no search, no identifier | SCR-15 related items → SCR-16 PVQ issue detail | "And here's the answer it was raised against, one click away." | Impressed | **Today:** she reads a resolution narrative in PVQ with no ability to see the questionnaire answer it concerns; the relationship exists in the data and not on her screen | Cross-system relationships resolved inline so traversal replaces four searches (F6, F7) |
| 5. Read the disposition and the narrative | Reads the investigator's disposition **and his narrative**, with actor and timestamp | SCR-16 → disposition panel + activity history | "He interviewed the employer. That's why the date changed. I can rely on this." | Confident in the record | **Today:** she sees that an issue existed and closed, with no visibility into the reasoning that closed it | The quality of her determination is only as good as the record; the record is now legible (F6, F13) |
| 6. Notice what she cannot do | Sees that the resolve action Marcus used **is not offered to her** on this same item | SCR-16 → server-computed action set | "I can read this. I can't resolve it. That's correct — and the system knows it, not just the policy." | Trust in the boundary | **Today:** she relies on convention rather than enforcement, and is never confident she has seen everything she is entitled to see | Action-level authorization computed server-side per item and per principal, re-authorized at execution (F2) |
| 7. Check the tier | Opens the PDT designation and confirms the investigation tier | SCR-17 PDT designation view, source-badged `PDT` | "Tier 3. The investigation matches the designation." | Careful | **Today:** a fourth login and a fourth search against a reference she copied from the third system | Designation and resulting tier reachable in the same reading path (F6) |
| 8. Render the determination | Completes the determination form — decision, rationale, supporting references — and submits | SCR-14 determination form (long, high-consequence, validated) | "This has to stand up on appeal in four years." | Deliberate, weighty | **Today:** she records the determination in one system and documents its basis in a side note, because no single record ties her decision to the material she saw | Determination and its basis captured together with a durable, correlated audit record (F13) |
| 9. Confirm and move on | Reads a confirmation naming what changed and in which system; returns to her queue with context intact | SCR-14 confirmation → SCR-13 restored | "It says which system, and I can see my own entry in the trail." | Settled, finished | **Today:** she re-opens systems to confirm her own write, because confirmations name nothing and quantify nothing | Confirmation names system and resulting state; her own action appears in her recent activity (F6, F13) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Sign in and settle | One session; entitlements computed server-side produce an adjudicator-specific navigation set and dashboard composition, visibly different from the investigator's | F0, F1, F2, F4 |
| 2. Pick the determination | Queue fan-out scoped to her adjudicative assignment and clearance tier; consistent date semantics normalized across sources so the sort is explainable | F5, F2, F8 |
| 3. Read what was submitted | eApp content rendered with **source attribution present in the accessible name**, correct heading hierarchy and landmarks for heading-based navigation across a dense record | F6, F14 |
| 4. Follow the issue | Related refs resolved live through the PVQ adapter; breadcrumb carries subject and case context; no credential prompt at the boundary | F6, F7, F1, F3 |
| 5. Read the disposition and the narrative | Spoke-native history merged with hub audit records into one chronology showing actor, action, timestamp, and originating system | F6, F13 |
| 6. Notice what she cannot do | The server computes the action set for **this principal on this item**: read actions yes, `ISSUE.RESOLVE` no. A direct API call to the investigator-only resolve endpoint is denied server-side and **the denial is audited** | **F2**, F10, F13 |
| 7. Check the tier | PDT adapter read, source-badged, with programmatic grouping so a non-visual reader can tell where eApp content ends and PDT content begins | F6, F9, F14 |
| 8. Render the determination | Action re-authorized at execution time; validation returns an error summary with focus management and in-page links; **one audit record written before the success response returns**, capturing actor identity and the roles/attributes she held at that moment | F2, F6, F13, F14 |
| 9. Confirm and move on | Confirmation names the affected system and resulting state; queue filters, sort, and page restored on return | F6, F5, F13 |

**Emotion curve (1 anxious → 5 confident):** Sign in **3** → Pick **3** → Read questionnaire **4** → Follow the issue **5** *(the relationship is already on her screen)* → Read the narrative **5** → See the boundary **5** *(enforcement, not convention)* → Check tier **4** → Render determination **2** *(the heaviest moment in the product — a government decision about a person)* → Confirm **5**.

#### Key Moments

- **Decision Point — Stage 8.** The determination itself. Everything before it is preparation; everything after it is record. A lost narrative here costs an hour and her trust in the form.
- **Delight Opportunity — Stage 4.** The traversal from questionnaire answer to the issue raised against it, without a search and without an identifier. For Dana this replaces the paper assembly that currently *is* her job.
- **Demo Moment — Stage 6.** Opening the same work item as the investigator and seeing a different, server-computed action set. Show it side by side with JRN-01.01, then show the curl denial and the audited entry.
- **Risk of Abandonment — Stage 3/7.** Any field she cannot attribute to a source system. Unattributed data is, to her, unusable data — and one unattributed panel makes her doubt the rest of the screen.
- **Trust-destroying Risk — Stage 6.** An action offered to her that the server then refuses. A UI that advertises what she cannot do makes her distrust every other control in the product.

#### Success Exit Criteria

- Every artifact needed for one determination — questionnaire, issue disposition and narrative, designation and tier, case status — is reached **without leaving the unified shell and without re-authenticating** (SM-02, SM-04).
- **Source attribution is present on 100%** of work-item rows and detail panels, in the accessible name and not by badge colour alone.
- Dana and Marcus open the same work item and are presented with **different, server-computed action sets**; a direct API call by Dana to the investigator-only resolve action is denied and audited (SM-18).
- Her determination writes **exactly one audit record before the success response returns** (SM-19).
- Cross-system activity for the case renders as a **single correlated chain**, not four disconnected histories (SM-20).

#### Failure and Alternate Paths

| Condition | What Dana sees | Recovery |
|-----------|----------------|----------|
| PVQ unavailable during the read | A **specific named warning** stating issue data is unavailable — never an empty issue list that reads as "no issues" | She defers the determination rather than deciding on incomplete data; see JRN-02.02 |
| A case outside her organization or above her clearance tier | SCR-30 access denied, non-enumerable, with a correlation ID; the denial is audited | Return to her queue; nothing about the case's existence is disclosed |
| Validation failure on the determination form | Error summary at the top with in-page links to the offending fields; **the rationale narrative is preserved** | Correct the named field and resubmit |
| She needs something the investigator did not record | She uses "request clarification", which marks the case **blocked pending investigator response** and surfaces as a work item in his queue | Tracked as blocked until his response arrives (JRN-02.02) |
| She returns the case for additional investigation | Recorded as a distinct audited action with its own confirmation, moving the case back to the investigator | The case leaves her aging queue with an evidenced reason |
| Session approaches expiry during a 45-minute read | SCR-06 warning with countdown and "Stay signed in"; nothing entered is discarded | Extend in place |

#### Accessibility Notes

- **Keyboard-only and screen-reader completable end to end.** Long-form reading is her core activity, so **heading hierarchy, landmark regions, and descriptive page titles** are what make a dense multi-source adjudication record navigable — power users navigate by heading, not by scrolling.
- **Programmatic grouping** (fieldset/legend, section landmarks) must make it unambiguous non-visually where eApp content ends and PVQ or PDT content begins. Source attribution belongs in the accessible name.
- Sortable, filterable queue tables announce sort state and result counts. She sorts constantly.
- The determination form is long and high-consequence: **error summary with focus management and in-page links to offending fields is mandatory**. A lost narrative is a lost hour and a lost user.
- Status vocabulary — resolved, open, returned, overdue, blocked — distinguishable in **grayscale** by text and/or icon (NFR-02).
- Usable at **200% zoom** without loss of function; magnification users are common in a reading-intensive workforce (NFR-16).
- The degraded-data warning (alternate path) is announced via a live region **without stealing focus** mid-read.

#### Success Outcome

Dana reaches every artifact needed for one determination without leaving the unified shell and without re-authenticating, with source attribution on 100% of rows and panels — the success measure of JTBD-02.1 — and her determination is recorded as exactly one audit record naming her and the attributes she held at the time, while the investigator-only action remains unavailable to her and denied server-side if attempted directly (JTBD-02.2, SM-18, SM-19).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Sign in and settle | F0, F1, F2, F4 |
| 2. Pick the determination | F5, F4, F2 |
| 3. Read what was submitted | F6, F9, F14, F17 |
| 4. Follow the issue | F6, **F7**, F1, F3 |
| 5. Read the disposition and the narrative | F6, F13 |
| 6. Notice what she cannot do | **F2**, F6, F10, F13 |
| 7. Check the tier | F6, F9, F14 |
| 8. Render the determination | F6, F2, F13, F14 |
| 9. Confirm and move on | F6, F5, F13 |

---

### JRN-02.02: Manage the Clock — and Refuse to Decide on Data That Is Quietly Missing

**Persona:** PER-02 (Dana Okonkwo)
**Scenario:** Last week of the month. Dana's timeliness metrics are about to be reported, and she needs to know which of her pending determinations are aging, which are blocked waiting on someone else, and which she can actually close today. Partway through the sweep she opens a subject whose issue list is empty — and this is the moment the product either earns her permanently or loses her permanently. An empty list that is actually an outage would be a career-relevant error, made invisibly. This journey covers both halves of her clock problem: surfacing aging and blocked work without building a report, and being able to tell a genuine absence from an unreachable source.
**Related Jobs:** JTBD-02.3 *(aging and blocked)*, JTBD-02.4 *(never decide on missing data)*
**Entry Trigger:** End-of-month timeliness push; and, within it, opening any subject whose issue list renders empty.
**Demo Path:** Supporting — **Segment 2c.** Run immediately after JRN-01.03 while PVQ (or IM) is still injected as unavailable: the same outage that degrades the investigator's queue produces a *different and equally specific* consequence for the adjudicator. One induced failure, two persona-appropriate responses.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | Pending determinations for PER-02 spanning a **range of ages**, including at least two past their timeliness threshold and two approaching it, so "aging" is visible without contrivance. |
| P2 | hub | At least one determination in a **blocked-pending-investigator-response** state, created by a seeded clarification request, so "waiting on someone else" is distinguishable from "waiting on me". |
| P3 | pvq | **A subject with a genuinely empty issue set.** This is the control case: the designed empty state must be demonstrably different from the degraded state, and that comparison is impossible without a true empty. |
| P4 | hub | Alert rules for overdue, approaching-due, and blocked/stalled computed server-side, each resolving to a **real, populated destination** — an alert that links to an empty page is worse than no alert. |
| P5 | hub | Failure-injection control able to force **PVQ** specifically (not only IM) into unavailable, so the adjudicator-facing consequence is demonstrable. |
| P6 | im / eapp / pdt | Remaining sources populated for her scope so the queue stays useful during the injected PVQ outage. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Ask the clock question | Opens her dashboard and reads the aging and blocked widgets | SCR-10 adjudicator dashboard → alerts panel | "What's aging, and what's not actually mine to move?" | Businesslike, slightly braced | **Today:** aging is invisible until it is a metric someone else reports; she learns a case is late from a report | Aging and blocked computed server-side and surfaced continuously, not retrospectively (F4, F15) |
| 2. Separate mine from theirs | Filters the queue to "blocked" and reads what each is waiting on | SCR-13 queue → status filter + blocked reason | "Three are waiting on investigators. Those aren't my delay." | Relieved of some guilt | **Today:** she tracks "waiting on investigator" in memory or a side list, because nothing models the wait | Blocked state modelled and attributed, so the clock is managed by evidence (F6, F15) |
| 3. Sort by age | Sorts by age across sources and confirms the ordering is explainable | SCR-13 → sortable headers announcing sort state | "The dates mean the same thing across all of these — I can defend this order." | In control | **Today:** date semantics differ silently between systems, so a sorted list can be wrong in a way she cannot see | Consistent, normalized date semantics regardless of which spoke supplied the row (F5) |
| 4. Open the next determination | Opens the oldest and begins the read | SCR-15 eApp case view | "Let's close this one before the month ends." | Focused | **Today:** the read begins with four logins and an assembly job | One reading path (see JRN-02.01) |
| 5. **Hit the empty issue list** | Reaches the issues section and finds nothing listed | SCR-15 → related issues panel | "No issues at all? On a Tier 3? That's either very clean or very wrong." | Suspicion — the pivotal moment | **Today:** an empty PVQ list looks identical whether the subject has no issues or the service is down, and the cost of guessing wrong is asymmetric and invisible | The screen must answer the question she is already asking, before she asks it |
| 6. Read which one it is | Reads either a **designed empty state** ("No issues have been raised against this subject.") or a **named degraded warning** ("Issue data from PVQ is unavailable — issues for this subject are not shown.") | SCR-15 → empty state **or** degraded banner (visibly and semantically different) | "It's the system, not the subject. I'm not deciding this today." | Vindicated, then decisive | **Today:** there is no signal either way, so she either delays everything or accepts the risk silently | Absence and outage are two different screens with two different sentences (F16, NFR-10) |
| 7. Act on the distinction | Defers the determination with a reason, or — on a genuine empty — proceeds and decides | SCR-14 action set (determination actions disabled while the source is unavailable, with explanation) | "Deferring with a recorded reason is defensible. Deciding blind is not." | Professionally safe | **Today:** she delays cases she is unsure about, adding to the aging problem she is separately measured on | Actions that depend on an unavailable source are disabled with an explanation rather than permitted to fail (F16) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Ask the clock question | Alert rules for overdue, approaching-due, and blocked/stalled evaluated server-side over aggregated spoke data; each alert deep-links to the item that produced it; alert counts reconcile with the queue | F4, F15, F5 |
| 2. Separate mine from theirs | Blocked state and its reason carried on the normalized work item; clarification requests tracked until the investigator responds | F6, F15, F8 |
| 3. Sort by age | Date fields normalized at the adapter boundary so cross-source sorting is semantically valid; sort state announced | F5, F8, F14 |
| 4. Open the next determination | Resource-level authorization; full detail assembled across adapters with source attribution | F2, F6 |
| 5. Hit the empty issue list | Per-source status accompanies every aggregated panel — the UI always knows whether a source answered, failed, or answered with nothing | F16, F6, F8 |
| 6. Read which one it is | Two distinct, designed states with different copy and different structure: empty vs. degraded. Degraded names the application and what is missing; announced via live region **without stealing focus** | **F16**, F14, NFR-10 |
| 7. Act on the distinction | Determination actions that depend on the unavailable source are pre-emptively disabled with a reason; the deferral is a real audited action with its own record | F16, F6, F2, F13 |

**Emotion curve (1 anxious → 5 confident):** Dashboard **3** → Separate blocked **4** → Sort by age **4** → Open determination **4** → **Empty issue list 1** *(the sharpest trust dip in the entire document — she is one screen away from a career-relevant error)* → Read which one it is **4** → Act **5**.

#### Key Moments

- **Decision Point — Stage 6/7.** Decide or defer. The entire value of the degraded-state design is compressed into whether this one screen tells her which world she is in.
- **Trust-destroying Risk — Stage 5.** One instance of an empty list that turns out to have been an outage and the trust loss is **permanent and total** for this persona. She will re-check every source by hand forever, and the product's aggregation value goes to zero.
- **Risk of Abandonment — Stage 1.** An aging view she has to build herself is the workaround she already has; she will keep the spreadsheet and stop opening the dashboard.
- **Delight Opportunity — Stage 2.** Being able to say "three of my late cases are waiting on investigators, and here is the evidence" turns a monthly defensive conversation into a two-minute factual one.

#### Success Exit Criteria

- Her dashboard and queue answer **"what is aging and what is blocked"** without her constructing a report, and **every alert resolves to a real, populated destination** (SM-06, SM-24).
- With PVQ forced offline, the subject record shows a **specific named warning that issue data is unavailable — and never an empty issue list** (SM-15, NFR-10).
- The designed empty state and the degraded state are distinguishable **both visually and non-visually**, by wording and structure rather than by colour or icon alone.
- Actions depending on an unavailable source are disabled with an explanation before submission.
- A generic "something went wrong" appears nowhere: every incomplete view names the system and the gap.

#### Failure and Alternate Paths

| Condition | What Dana sees | Recovery |
|-----------|----------------|----------|
| PVQ recovers while she is still on the page | The warning clears through the same live region and the issue list populates — **no reload, no re-authentication**; focus is not moved | She continues the read with a complete record |
| Alert count disagrees with the queue | *Must not occur.* Counts are computed from the same server-side evaluation as the queue rows; a mismatch is a defect, not a display quirk | Treated as a P0 bug — reconciling counts is a hiring criterion for this persona |
| Blocked item's investigator has responded | The blocked state clears and the item returns to "waiting on me" with the response visible in activity history | She resumes the determination |
| She defers a determination | Recorded as an audited action with a reason; the item remains in her queue flagged as deferred-pending-source | Revisit when health is restored |
| Both PVQ and IM unavailable | Both named, each with its own missing-data statement; she is never left inferring which part of the record is incomplete | Defer; no partial-picture determination is offered |

#### Accessibility Notes

- **Keyboard-only and screen-reader completable end to end**, including the sort, the status filter, and the deferral action.
- **The empty-vs-degraded distinction must be legible non-visually.** Different sentences and different structure — not the same container with a different icon colour. A screen-reader user must reach the same conclusion Dana does, in the same second.
- Degraded warnings arrive via `aria-live="polite"` and **must not steal focus** mid-read; they also persist in the static page structure so a user who arrives later encounters them by heading or landmark navigation.
- Aging and blocked status conveyed by text and/or icon, never colour alone — "overdue," "blocked," "approaching due" must be distinguishable in grayscale (NFR-02).
- Queue sort and filter changes announce sort state and result count.
- Disabled determination actions remain discoverable with their explanation programmatically associated, so a keyboard user learns *why* rather than encountering an inert control.
- Usable at 200% zoom without loss of function (NFR-16).

#### Success Outcome

Dana's dashboard and queue answer "what is aging and what is blocked" without her building a report, every alert resolves to a real destination (JTBD-02.3, SM-06, SM-24) — and with PVQ forced offline she sees a specific named warning that issue data is unavailable rather than an empty list she could misread as "no issues exist" (JTBD-02.4, SM-15, NFR-10).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Ask the clock question | F4, F15, F5 |
| 2. Separate mine from theirs | F6, F15, F5 |
| 3. Sort by age | F5, F8, F14 |
| 4. Open the next determination | F6, F2, F9 |
| 5. Hit the empty issue list | **F16**, F6, F8 |
| 6. Read which one it is | **F16**, F14, F9 |
| 7. Act on the distinction | F16, F6, F2, F13 |

---

## PER-03: Renée Ashford

*The individual being vetted — a private-sector systems engineer at a cleared defense contractor undergoing an initial Tier 3 investigation. Her start date on billable work depends on this process completing. She has no mental model of DCSA's internal system boundaries and must never need one. Short, anxious, frequently interrupted sessions, often on a phone, sometimes eleven days apart.*

---

### JRN-03.01: On a Phone at Lunch — Where Do I Stand, What Do I Owe, Do It Now

**Persona:** PER-03 (Renée Ashford)
**Scenario:** It has been eleven days since Renée last looked. She is eating lunch at her desk with her phone in one hand. She wants one thing: a plain-language answer to *where am I in this process and what do I owe you next.* She has forgotten the interface entirely and will not learn it again. She signs in with a non-CAC method — she has no CAC, will never have one, and is not a government employee — reads her status in a sentence she understands, finds one outstanding task with a due date, completes it, and sees the status change as a result. She never learns that the answer was assembled from two systems, and she never sees anything belonging to anyone else.
**Related Jobs:** JTBD-03.1 *(where do I stand)*, JTBD-03.2 *(what do I owe, do it now)*, JTBD-03.3 *(notices where she already looks)*
**Entry Trigger:** Anxiety plus elapsed time — roughly 70% of her sessions exist for the status question alone. Secondarily, a notice issued to her since her last visit.
**Demo Path:** Supporting — **Segment 5a**, immediately before the zero-trust demonstration in JRN-03.02. Show it **on a narrow viewport**; the applicant surface is the one an evaluator is most likely to resize.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | An APPLICANT identity bound to PER-03 with **`subjectRef = SUBJ-00622`** and a **non-CAC authentication method** (generic MFA with a visible deterministic demo code, or ECA). The applicant persona must never require a CAC — she does not have one, and a CAC-only applicant would be a domain error on screen. |
| P2 | iep | A status record for `SUBJ-00622` at a mid-process stage, plus **at least one unread notice** and **one OPEN task with a due date** in the `INFORMATION_REQUESTED` shape — this is the action-required path. |
| P3 | eapp | Her own submitted case for `SUBJ-00622` with submission date and current state, so the plain-language narrative is assembled from **two** systems (IEP + eApp) and the "one process, not two system statuses" claim is real. |
| P4 | iep | Prior completed submissions in her history, so Stage 8 and JRN-03.02 have evidence to show rather than an empty list. |
| P5 | pvq | **A PVQ issue raised against one of her answers that she must never see.** Its existence in the seed is what makes the access boundary demonstrable; its absence from every applicant screen is the test. |
| P6 | hub | A **zero-item applicant** identity seeded separately, so every applicant empty state ("You don't have anything to do right now.") is demonstrable without emptying Renée's account. |
| P7 | hub | Plain-language copy mapping for every internal state code that could surface on an applicant screen — no tier codes, no `INFORMATION_REQUESTED`, no `SOI`, no system names. The mapping is seed/configuration, not per-screen improvisation. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Get in | Signs in with username and a one-time code on her phone | SCR-01 login → SCR-04 → SCR-05 generic MFA | "Please don't make me reset a password again." | Tense, low expectations | **Today:** one login for the questionnaire, another for the portal that sends notices; she has reset one of them twice, each reset costing an evening | One credential for the whole process, with the simulated auth labelled honestly (F0) |
| 2. Read where she stands | Reads a one-sentence status and a short progress structure, above the fold, on a 320px screen | SCR-11 applicant dashboard → status widget | "Okay — they have it, it's being reviewed, nothing is wrong." | **Relief** — the whole point of the session | **Today:** two screens with different terminology for the same state, and she cannot tell whether they describe the same thing | One plain-language progress narrative assembled from IEP and eApp, presented as one process (F4) |
| 3. Understand, not decode | Reads the status without hitting an acronym or an internal state name | SCR-11 → plain-language copy, no tier codes, no system names | "Nothing here I have to look up. Good." | Respected | **Today:** "Pending SOI transmittal" is presented as a status; it is not a status, it is a barrier | Zero internal system names, tier codes, or state abbreviations without plain-language explanation |
| 4. See what she owes | Sees one outstanding task with a due date, stated as an obligation not a systems inventory | SCR-11 → outstanding tasks list | "One thing. Due Friday. That I can do at lunch." | Focused, faintly anxious about the date | **Today:** she learns she owes something when the deadline has nearly passed, via a forwarded email from her security officer | A short, ordered, unambiguous task list with due dates (F4, F5) |
| 5. Read the notice | Opens the unread notice sitting in the same place she checks status | SCR-11 notices region → SCR-21 notifications | "It's here, not in an email I lost." | Reassured | **Today:** notices arrive by email, sometimes second-hand, and get lost; she cannot tell what she has already handled | Notices in-app, retained, with read/unread state (F15) |
| 6. Do the thing | Activates the task, completes the form, uploads/enters what was asked, submits | SCR-18 IEP task → task action form (USWDS, labelled, validated) | "Am I giving them the right thing? …Yes, it says exactly what they want." | Concentrating; mildly uncomfortable disclosing personal detail | **Today:** the task has no path from where she found it; she re-reads an email chain to work out which system it refers to | **Every task links directly to the action that discharges it** — no dead ends, no "contact your security officer" as a primary path (NFR-14) |
| 7. Get a real confirmation | Reads a confirmation naming what was received and what happens next | SCR-18 confirmation | "Received. Reviewed in about two weeks. That's an answer." | **Relief, then done** | **Today:** a bare "Submitted" leaves her unsure anything happened, so she calls her security officer anyway | Confirmation names what was received **and what happens next** (F6) |
| 8. See it land | Returns to the dashboard; the task is gone, the status line reflects the submission, and the item appears in her history | SCR-11 refreshed → SCR-18 submission history | "The screen changed because of something I did. It's actually connected." | Confident | **Today:** nothing visibly changes, so she assumes nothing happened and checks again tomorrow | Her action changes her status narrative — the system is legibly responsive (F4, F6) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Get in | Non-CAC path establishes one session; the simulation is labelled on screen so nothing implies real credential validation; no language claiming anything was "verified" or "validated" | F0, F1 |
| 2. Read where she stands | Dashboard composes IEP status and eApp case state into **one** progress narrative server-side; the applicant composition is visibly and substantively different from the three mission dashboards (SM-23) | **F4**, F5, F8 |
| 3. Understand, not decode | Internal state codes translated through the plain-language mapping before they leave the server; raw state names never reach the applicant surface | F4, F14 |
| 4. See what she owes | Outstanding tasks aggregated and ordered by due date, each carrying a working deep link to the action that discharges it | F4, F5, F6 |
| 5. Read the notice | Notices rendered with read/unread state and an accessible mark-as-read; new notices announced via live region **without stealing focus** | F15, F14 |
| 6. Do the thing | **Every read is resource-level entitlement-checked against her `subjectRef`** — route-level checks alone would be a defect; the form validates server-side with an accessible error summary; session-timeout warning offers re-authentication **without discarding entered data** | **F2**, F6, F0, F14 |
| 7. Get a real confirmation | Write executed through the IEP adapter; **one audit record written before the success response returns**; confirmation names the received artifact and the next step | F6, F13 |
| 8. See it land | Status recomposed from live spoke data; the task leaves the open list; the submission appears in her self-scoped history | F4, F6, F13 |

**Emotion curve (1 anxious → 5 confident):** Get in **2** *(eleven days of silence and a password she half-remembers)* → Read status **4** *(the biggest single emotional jump in this document)* → Understand **4** → See what she owes **3** *(a due date is a small spike of stress)* → Read notice **4** → Do the thing **3** *(disclosing personal detail is uncomfortable)* → Confirmation **5** → See it land **5**.

#### Key Moments

- **Delight Opportunity — Stage 2.** Answering "where am I" in one sentence, above the fold, on a phone, in under 30 seconds. For 70% of her sessions this **is** the product. Everything else is secondary.
- **Decision Point — Stage 6.** Whether she completes the task now or defers it "until the weekend" — which historically means a missed deadline and a phone call to three other people.
- **Risk of Abandonment — Stage 3.** One unexplained acronym or internal state name and she concludes the system is not for her and calls her security officer instead. Jargon is the failure mode, not layout.
- **Risk of Abandonment — Stage 6.** Losing a partly completed form to a silent timeout. She will not start it a third time in the same week.
- **Boundary Moment — throughout.** She sees her own record and nothing else. A PVQ issue exists against one of her answers (precondition P5) and appears **nowhere** on any applicant screen. That asymmetry is a deliberate access-control boundary, not an omission, and it is the setup for JRN-03.02.

#### Success Exit Criteria

- She can answer **"where am I in this process"** within **30 seconds of signing in, on a 320px-wide viewport, without scrolling past a fold of jargon** (SM-25, NFR-16).
- The screen contains **zero** internal system names, tier codes, or state abbreviations without plain-language explanation.
- **100% of outstanding tasks link directly to the action that discharges them** (SM-06, NFR-14).
- A submission produces a confirmation naming what was received and what happens next, and then appears in her own history.
- Her dashboard is **visibly and substantively different** from the three mission-role dashboards — same product, different composition (SM-23).
- No applicant screen exposes investigative content, investigator identity, PVQ issue items, PDT designations, or IM case records.

#### Failure and Alternate Paths

| Condition | What Renée sees | Recovery |
|-----------|-----------------|----------|
| Session times out mid-form | SCR-06 warning with a countdown and an accessible re-authentication path that **does not discard entered data** | Re-authenticate and continue; nothing re-typed |
| Validation error on a personal-detail field | Inline error plus an error summary with focus management and in-page links; plain-language message, no field codes | Fix the named field; entered content preserved |
| She has nothing outstanding | Designed empty state: "You don't have anything to do right now. We'll let you know if that changes." — never a blank panel | Nothing owed; the session ends reassured |
| IEP unavailable | A named plain-language warning that part of her status could not be loaded, without jargon and without a raw system name where one can be avoided | Status returns automatically on recovery; nothing she must do |
| She tries a URL for an investigator page | SCR-30 access denied, non-enumerable, with exits back to her dashboard; the denial is audited | Returns to her own dashboard |
| A notice arrives while she is signed in | Announced via live region **without stealing focus**, with unread state | She reads it when she is ready |

#### Accessibility Notes

*This is the **widest accessibility exposure in the product**. Applicants are the general public and the entire cleared workforce; the population includes screen-reader, keyboard-only, magnification, and cognitive/reading-disability users — and users whose disability is directly relevant to what the vetting process is asking about. A failure here is the one most likely to be noticed externally.*

- **Keyboard-only and screen-reader completable end to end**, including sign-in, task completion, and mark-as-read.
- **Plain language is an accessibility requirement, not a tone preference.** Short sentences, defined terms, no unexplained acronyms, one explicit next action.
- **Mobile is a genuine access path, not a responsive checkbox:** usable at **320px width with no horizontal scroll**, at 200% zoom, with adequate touch targets (NFR-16).
- Forms: programmatically associated labels, described-by hint text for anything ambiguous, required-field indication that is **not colour-only**, inline errors, and an error summary with focus management. She is entering personal detail she may find uncomfortable to disclose; a confusing validation error compounds that.
- **Session timeout** needs a clear warning and an accessible re-authentication path that does not discard entered data — her sessions are short and interrupted, and she *will* be timed out (F0).
- Progress is conveyed by **text and structure**, not by a colour-coded graphic alone (NFR-02).
- Notices and asynchronous updates are delivered via live regions **without stealing focus** (F14, F15).
- The non-dismissible demo banner must not consume the top of a 320px viewport to the point where the status answer falls below the fold (NFR-13 vs. SM-25 — resolved by the measured chrome budget in FR-F03-03 rule 3a; tested explicitly).

#### Success Outcome

Renée answers "where am I and what do I owe next" within 30 seconds of signing in on a phone, with zero unexplained internal terms (JTBD-03.1, SM-25) — and 100% of her outstanding tasks link directly to the action that discharges them, with her submission producing a confirmation naming what was received and what happens next, then appearing in her own history (JTBD-03.2, SM-06, NFR-14).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Get in | F0, F1, F3 |
| 2. Read where she stands | **F4**, F5, F9, F17 |
| 3. Understand, not decode | F4, F14 |
| 4. See what she owes | F4, F5, F6 |
| 5. Read the notice | F15, F4, F14 |
| 6. Do the thing | F6, **F2**, F0, F14 |
| 7. Get a real confirmation | F6, F13 |
| 8. See it land | F4, F6, F13 |

---

### JRN-03.02: Prove What I Submitted — and Watch the Boundary Around My Record Hold

**Persona:** PER-03 (Renée Ashford)
**Scenario:** Renée's facility security officer emails to ask whether she sent in the employment documentation two weeks ago. She wants to answer with evidence rather than memory — and while she is in there, she wants the quieter reassurance that the most sensitive information she has ever disclosed is visible **only** to her. This journey has two audiences. For Renée it is a five-minute errand ending in relief. For an evaluator it is the **headline zero-trust demonstration in the product**: an authenticated applicant is the strictest access scope in the system, and the denial is shown live — from the UI and then from curl — with the denial itself written to the audit trail.
**Related Jobs:** JTBD-03.4 *(primary)*, JTBD-03.1 *(the reassurance that keeps her from calling)*
**Entry Trigger:** A third party asks her to prove a prior submission; and, for the demo, the evaluator asking "what stops one applicant from reading another's file?"
**Demo Path:** ✅ **SECONDARY SCRIPTED DEMO — Segment 5b.** Runs immediately after JRN-03.01. Drive stages 1–3 in the browser, stages 4–6 with **curl against the hub API**, then show the audited denials in the audit viewer as the administrator. Zero-trust claims that are asserted but not demonstrable are worth nothing here.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | iep / eapp | A **completed prior submission** for `SUBJ-00622` with a real timestamp and a retrievable record, so "prove it" has something to prove. |
| P2 | hub | Self-scoped audit/activity records for her identity covering her own submissions — and **nothing else**. Her history view is audit scoped to self, not the platform trail. |
| P3 | hub | A **second applicant** (different `subjectRef`, e.g. `SUBJ-00418`) with a known, real resource ID. The denial demo requires a resource that genuinely exists: denying a request for something non-existent proves nothing about enumeration. |
| P4 | pvq / im | Investigative content about Renée that exists and is deliberately unreachable from every applicant surface — a PVQ issue raised against her answer, and an IM assignment naming an investigator. |
| P5 | hub | A published API surface an evaluator can call directly (OpenAPI documentation available), with a **consistent non-enumerable error contract** and correlation IDs on every response. |
| P6 | hub | Audit coverage for **authorization denials**, not just successes, so the denials produced during this demo appear in the viewer within seconds. |
| P7 | hub | An administrator identity available in a second window to display the audit trail immediately after the denials are produced. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Look for proof | Signs in and opens her own submission history | SCR-11 dashboard → SCR-18 submission history | "Did I actually send that, or did I just mean to?" | Uncertain, slightly defensive | **Today:** she searches personal email to prove what she submitted, and keeps her own copies because she cannot retrieve them from the system | A self-scoped history showing what she sent and when, with links back to the item (F6, F13 self-scoped) |
| 2. Find the entry | Reads the dated entry: what was submitted, when, and its current state | SCR-18 history row → item link | "Sent on the 3rd. There it is, with a date." | **Relief** | **Today:** she answers from memory and hopes; her security officer re-asks a week later | Evidence, not recollection — answerable in one screenshot |
| 3. Check the edges | Notices there is nothing on any of her screens about investigators, findings, or issues raised against her answers | SCR-11 / SCR-18 — investigative content absent by design | "This is my file. Just mine. Nothing about anybody else, and nothing I shouldn't have." | Quietly reassured | **Today:** no visible assurance that the system shows her only her own record, which is unsettling given what the record contains | Privacy legibility: the scope she is in is evident from the shape of what she can reach |
| 4. **(Evaluator) Try the side door — wrong subject** | An authenticated applicant session calls a legitimate endpoint with **another subject's real resource ID** | Hub API via curl (`GET /api/work-items/{other-subject-item}`) | *(Evaluator:)* "Does the check happen on the resource, or only on the route?" | Evaluator: testing | **Today:** each system interprets scope on its own terms; nobody can demonstrate the boundary, only describe it | **Resource-level** entitlement check against her `subjectRef` on **every** read — route-level checks alone are a defect (F2) |
| 5. **(Evaluator) Try the side door — wrong role** | The same session calls the **investigator-only resolve endpoint** directly | Hub API via curl (`POST /api/…/actions/RESOLVE_ISSUE`) | *(Evaluator:)* "And if she just calls the mission endpoint?" | Evaluator: testing | **Today:** authorization lives partly in each UI, so bypassing the UI is an untested path | Server-side authorization on every request; client-side hiding is presentation, never the control (NFR-04, NFR-05) |
| 6. **(Evaluator) Read the denials** | The administrator opens the audit viewer and filters to the last minute | SCR-33 audit viewer → SCR-34 record detail | *(Evaluator:)* "So the attempt is on the record, not just blocked." | Evaluator: convinced | **Today:** denials are not recorded anywhere reconstructable, so an attempted breach leaves no trail | Denials audited with actor, target, outcome, and correlation ID (F13) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Look for proof | Audit/activity query **scoped to her identity** server-side; she cannot widen it by parameter, because the scope is applied server-side rather than requested by the client | F13, F2, F6 |
| 2. Find the entry | Submission record read back through the owning adapter with its real timestamp and current state, linked to the item | F6, F9 |
| 3. Check the edges | Navigation and entitlements are server-computed: investigative surfaces are not rendered, not linked, and not reachable by URL. The PVQ issue against her answer exists in the seed and resolves for mission roles only | **F2**, F3, F4 |
| 4. Wrong subject | Denied **server-side** with a **consistent non-enumerable error** that does not reveal whether the resource exists, plus a correlation ID; **the denial is written to the audit trail** | **F2**, F10, F13 |
| 5. Wrong role | Denied server-side with the identical error shape and status as the wrong-subject case — the two failures are indistinguishable to the caller, which is the point | **F2**, F10, F13 |
| 6. Read the denials | Audit viewer returns both denial records with actor identity, roles/attributes held at the time, action type, target system and resource, outcome `DENIED`, and correlation ID, filterable and paginated | F13, F11 |

**Emotion curve (1 anxious → 5 confident):** Look for proof **2** *(she genuinely is not sure)* → Find the entry **5** *(evidence, immediately)* → Check the edges **5** → *(evaluator segment — Renée's journey has ended reassured; stages 4–6 are the reviewer's curve: skeptical **2** → tested **3** → convinced **5**)*.

#### Key Moments

- **Delight Opportunity — Stage 2.** Answering her security officer with a dated record in under a minute. Small errand, disproportionate reassurance, and it removes a support contact that today costs three other people time.
- **Demo Moment — Stages 4–6.** This is the product's **headline zero-trust demonstration** (PRD F2 acceptance signal, SM-18). Show it live with curl. An evaluator who has been told about server-side authorization and shown it are two different evaluators.
- **Risk — Stage 4/5.** An error that discloses whether another record exists. A 404-vs-403 distinction, a differing message, or even a differing response time is an enumeration oracle and fails this journey regardless of whether access was granted.
- **Trust-destroying Risk — Stage 3.** Any glimpse of another individual's information, however incidental — a name in a shared header, a count that includes others, an autocomplete leak. One occurrence is unrecoverable for this persona and externally reportable.
- **Risk — Stage 1.** A history that omits something she knows she submitted. A partial record is worse than none, because she will trust it.

#### Success Exit Criteria

- Her submission history shows **everything she submitted and nothing belonging to anyone else**, retrievable in under a minute.
- An authenticated applicant calling an investigator-only endpoint, **or a legitimate endpoint with another subject's resource ID**, is denied **server-side** with a **consistent non-enumerable error**, and the denial **appears in the audit trail** — demonstrable live via curl (SM-18, PRD F2 acceptance signal).
- The two denial classes are **indistinguishable to the caller** in status, body, and timing.
- No applicant screen or reachable URL exposes investigative content, investigator identity, PVQ issue items, PDT designations, IM case records, or adjudicative deliberation.
- Every denial carries a correlation ID that the administrator can resolve in the audit viewer (JRN-04.02).

#### Failure and Alternate Paths

| Condition | What happens | Recovery |
|-----------|--------------|----------|
| She follows a stale deep link to an item that is no longer hers | SCR-30 access denied, non-enumerable, with exits to her dashboard; denial audited | Returns to her own dashboard |
| She guesses another subject's ID in the UI | Identical denial to the API path — the UI is not a second authorization surface, it just renders what the server permits | Same |
| An endpoint is discovered that authorizes only at route level | **This is a defect, not an alternate path.** Negative-path tests must cover every endpoint with an unauthorized resource identifier, not merely an unauthorized role (NFR-04, F19) | Fix before demo; it invalidates the segment |
| Audit write fails during a denial | The denial still stands; the audit failure is itself surfaced and logged — an action that cannot be audited does not complete, and that rule applies to recording denials too | Administrator triages via JRN-04.02 |
| Evaluator asks to try it themselves | Published API documentation and a running endpoint are available; nothing about the demo depends on the evaluator not looking | Encouraged — this persona's scope is the one that best survives inspection |

#### Accessibility Notes

- **Keyboard-only and screen-reader completable end to end** for the applicant-facing stages (1–3): history table, row links, and the return path.
- The **history table** is a proper data table with caption, header scope, and an announced result count; dates are readable as text, not as a graphic or a relative-only phrase ("2 weeks ago") that loses precision when precision is the point.
- **Access-denied pages must be accessible and plain-language**: a clear heading, an explanation that does not leak, a selectable correlation ID, and at least two working exits. A denial is a page like any other and is in scope for 508.
- The correlation ID on a denial must be **selectable, copyable text** — she may be asked to quote it, and the administrator certainly will (JRN-04.02).
- No security state is conveyed by colour alone; "you don't have access" is a sentence, not a red box (NFR-02).
- Usable at 320px width and 200% zoom, since this errand will happen on her phone (NFR-16).

#### Success Outcome

Renée produces evidence of a prior submission in under a minute from a self-scoped history — and an authenticated applicant calling an investigator-only endpoint, or a legitimate endpoint with another subject's resource ID, is denied server-side with a consistent non-enumerable error whose denial appears in the audit trail: the success measure of JTBD-03.4 and the PRD F2 acceptance signal (SM-18).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Look for proof | F6, F13, F2 |
| 2. Find the entry | F6, F9, F17 |
| 3. Check the edges | **F2**, F3, F4 |
| 4. Wrong subject | **F2**, F10, F13, F19 |
| 5. Wrong role | **F2**, F10, F13, F19 |
| 6. Read the denials | F13, F11, F10 |

---

## PER-04: Priya Raghunathan

*Platform administrator for the unified layer itself, in the Integrated Enterprise program office. Not a mission user — she is responsible for the thing all three other personas depend on. Expert: reads OpenAPI docs, calls endpoints with curl, and tries to break the authorization model on purpose. She is the reviewer archetype an evaluator will emulate. **Administrators are not exempt** — her own actions are authorized server-side and audited, and platform privilege is explicitly not privilege over mission content.*

---

### JRN-04.01: Register the Sixth Application Live, Through the UI

**Persona:** PER-04 (Priya Raghunathan)
**Scenario:** A sixth application — the Continuous Vetting Service — is running, conformant, and completely invisible to the platform: no registry row, nothing in navigation, nothing in any queue, nothing in the console. Priya onboards it herself, in the UI, in one sitting, while an investigator stays signed in at the next desk. Identity, connection, a live connection test, capabilities auto-discovered from the application's own `describe()`, role access, review, submit. No pull request, no deployment, no restart. Ninety seconds later CVS is in the inventory, being health-probed, in role navigation, and its work items are in Marcus's queue — and he never signed out. This is the product's **extensibility proof**, and it is the claim that determines whether the platform's premise holds beyond the five systems it launched with.
**Related Jobs:** JTBD-04.1 *(primary)*, JTBD-04.2 *(it starts reporting health)*, JTBD-04.4 *(the registration is audited)*
**Entry Trigger:** A new mission application becomes available to join the platform — in the demo, the moment an evaluator asks "what does it take to add another one?"
**Demo Path:** ✅ **SECONDARY SCRIPTED DEMO — Segment 3a.** Run **two windows side by side**: Priya registering in one, Marcus's already-signed-in queue in the other (JRN-01.02, Stage 7). The consequence in the second window is the proof; the wizard alone is just a form.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | An ADMINISTRATOR identity bound to PER-04, `org=DCSA-HQ`, with console, registry, audit, and failure-injection entitlements — and **no** access to mission work-item content. |
| P2 | hub | Exactly **five** registered applications at baseline (eApp, IEP, PVQ, PDT, IM). **CVS is deliberately absent from the registry.** Its absence from navigation, queue, and console before registration is itself part of the demonstration. |
| P3 | cvs | The Continuous Vetting Service **running** as a sixth spoke process with its own data namespace, implementing the full adapter contract and passing the conformance suite — including a working `describe()` and health endpoint. |
| P4 | cvs | Nine seeded `CVS_ALERT` work items, **four assignable to the investigator persona**, so registration produces an immediately visible change in his queue. The demo needs a visible consequence, not just a new console row. |
| P5 | hub | A retired-identifier table and duplicate-identifier validation, so the "identifier already in use" error path is demonstrable without breaking the happy path. |
| P6 | hub | Reset (`FR-F17-11`) returns CVS to **unregistered**, so the registration demo is repeatable identically (SM-22). |
| P7 | hub | An investigator session already open at the start of the segment, so "without signing out" is observed rather than claimed. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Show the "before" | Opens the connected-applications inventory: five rows, no CVS anywhere | SCR-22 admin console — connected applications | "Five. Nothing up my sleeve." | Matter-of-fact | **Today:** there is no inventory at all; what is connected lives in an informal list that drifts from reality | A registry-backed inventory that is the single answer to "what is attached right now" (F11, F8) |
| 2. Start the flow | Activates "Register application" and enters identity: display name, identifier, description, icon token | SCR-28 registration wizard, step 1 of 5 | "This is a form, not a ticket to an engineering team." | Purposeful | **Today:** onboarding is a bespoke project — requirements, custom code, a release, a regression cycle; weeks to months per application | Onboarding as a **configuration action she performs herself** (F12) |
| 3. Describe the connection | Enters base endpoint, health endpoint, adapter type; accepts pre-filled timeout, retry, backoff, and circuit-breaker defaults | SCR-28 step 2 — connection | "Sensible defaults. I don't have to invent a retry policy to get started." | Comfortable | **Today:** every integration re-invents timeout and failure policy, differently, in code | Per-adapter resilience policy as registry configuration, not code (F8) |
| 4. Test it before committing | Runs the **live connection test**; reads pass/fail with latency, announced in a live region | SCR-28 step 3 — test connection | "It answered. I'm not submitting into the dark." | Increasingly confident | **Today:** she cannot try an integration before committing to it; an unreachable endpoint is discovered *after* the work is done | A live test that **gates submission** — unreachable endpoints are caught here, not later (F12) |
| 5. Let it describe itself | Reviews work-item types and supported actions **pre-populated from the application's own `describe()`**, confirms and edits | SCR-28 step 4 — capabilities (auto-discovered) | "It told the platform what it can do. I just confirmed it." | Impressed — the architectural point lands here | **Today:** capabilities are discovered by reading someone else's documentation, or by asking their team | Capability negotiation via `describe()`: applications declare themselves (F8, F12) |
| 6. Decide who sees it | Selects which roles may see CVS; nothing pre-selected | SCR-28 step 5 — access | "Investigators and adjudicators. Not applicants." | Deliberate | **Today:** role visibility for a new system is configured separately in that system, on its own terms | Role-scoped visibility set once, at the hub, and honored everywhere (F2, F8) |
| 7. Review and submit | Reads the full read-only review with per-step edit links, submits | SCR-28 review → confirmation | "Two minutes. No deployment." | Satisfied | **Today:** the equivalent milestone is a release note, weeks later | Registry row created; `registryVersion` incremented; the change is audited naming her and the configuration (F12, F13) |
| 8. Watch it come alive | Sees CVS in the inventory and in health monitoring, with a **first probe issued immediately** rather than at the next interval | SCR-22 inventory → SCR-24 system health | "It's already being monitored. Nobody restarted anything." | **Delight** | **Today:** monitoring for a new system is a separate onboarding with a separate team and its own definition of "up" | Registry-driven behavior everywhere: navigation, fan-out, console, and health all read from the same source (F8, F11, F16) |
| 9. Prove the consequence | Looks at the investigator's window: CVS-badged items in his queue, on a session that never ended | *(second window)* SCR-13 unified work queue | "That's the whole claim, right there." | Vindicated | **Today:** a new application means a new URL, a new login, and a user who has to be told it exists | An open session receives updated navigation and fan-out on the next registry poll — **zero code changes, zero restarts** (SM-11, SM-12) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Show the "before" | Inventory rendered from the registry: display name, identifier, adapter type, endpoint, work-item types, supported actions, enabled state, registration date. There is **no hard-coded list of applications anywhere in the hub** | F11, F8 |
| 2. Start the flow | Multi-step form with per-step validation and state preserved across steps; duplicate and retired identifiers rejected with clear guidance | F12, F14 |
| 3. Describe the connection | Timeout, retry, backoff, and circuit-breaker fields pre-filled with defaults and stored as registry configuration for this adapter | F12, F8, F16 |
| 4. Test it before committing | Hub calls the candidate's health and `describe()` endpoints live; result displayed **and announced via a live region**; the step cannot be passed on failure without an explicit acknowledgement of a warning-level result | **F12**, F14, F16 |
| 5. Let it describe itself | `describe()` output parsed into work-item types and supported actions, pre-populated for confirmation; an application supporting fewer actions degrades its UI affordances rather than erroring | **F8**, F12 |
| 6. Decide who sees it | `visibleToRoles` written to the registry and enforced server-side in entitlements, navigation, and queue fan-out | F2, F8 |
| 7. Review and submit | Registry row created, `registryVersion` incremented, **`APPLICATION_REGISTERED` audit record written** naming the administrator, the application ID, and a configuration summary | F12, F13 |
| 8. Watch it come alive | Appears at once in inventory, health monitoring (first probe issued immediately), role-scoped navigation, work-queue fan-out, search fan-out, and related-item resolution targets — **with no hub restart** | F11, F16, F8, F5 |
| 9. Prove the consequence | Open investigator sessions receive updated navigation on their next `registryVersion` poll (≤ 30 s) without signing out or reloading; CVS items are normalized and badged like any other source, with **no special-casing anywhere in the hub** | F5, F8, F1, F12 |

**Emotion curve (1 anxious → 5 confident):** Show the before **4** *(she is in control; this is her console)* → Step 1 **4** → Connection **3** *(endpoints and policy are where mistakes happen)* → **Live test 5** *(it answered — the relief moment)* → Auto-discovery **5** → Access **4** → Submit **4** *(brief: did it take?)* → Inventory and health **5** → Investigator's queue **5** *(peak)*.

#### Key Moments

- **Decision Point — Stage 4.** The live connection test is the gate. Passing it converts "I hope this endpoint is right" into "the platform just talked to it," and it is the step that makes submitting feel safe.
- **Delight Opportunity — Stage 5.** Capability auto-discovery. The application declaring its own work-item types and actions is the moment the architectural claim becomes concrete for a technical evaluator.
- **Demo Moment — Stage 9.** Work items appearing in an already-signed-in investigator's queue. Do not narrate this; switch windows and let it be seen. **Under five minutes, zero code changes, zero restarts** (SM-11, SM-12).
- **Risk of Abandonment — any stage.** Any step that requires a developer, a pull request, a redeploy, or a restart. That is precisely the status quo she is trying to escape, and one such step invalidates the whole journey.
- **Credibility Risk — the whole journey.** A registration flow that works only for the one application shipped with the demo is hard-coded extensibility. The conformance suite and the absence of CVS-specific code in the hub are what make this honest.

#### Success Exit Criteria

- CVS is registered **live through the UI in under five minutes, with zero code changes and zero restarts** (SM-11, NFR-11).
- It appears **immediately** in admin inventory, health monitoring, role-scoped navigation, and the unified work queue (SM-12).
- An investigator with an **open session** sees CVS work items **without signing out or reloading** (SM-12).
- The registration writes **one audit record** naming the administrator, the application, and the configuration.
- **De-registration is equally clean:** removing CVS from the registry removes it from navigation, queue, and console with no code change and no errors, and is audited (PRD F8 acceptance signal).
- Reset returns the system to the unregistered state and the demo repeats identically (SM-22).

#### Failure and Alternate Paths

| Condition | What Priya sees | Recovery |
|-----------|-----------------|----------|
| Endpoint unreachable at the test step | A named failure with latency and error class, and the step **does not pass** — submission is blocked | Correct the endpoint and re-test; nothing was written |
| `describe()` unsupported or partial | Capabilities step falls back to manual entry; the application registers with fewer declared actions and its UI affordances degrade accordingly rather than erroring | Register with what is declared; refresh capabilities later via "Test connection" |
| Duplicate or retired identifier | Validation error with clear guidance; identifiers are never reused because existing work-item IDs and audit records reference them | Choose a new identifier |
| Step validation failure | Error summary with in-page links; **state preserved across steps**, so nothing already entered is lost | Fix and continue |
| Registration succeeds but the spoke then fails | It appears in inventory as **degraded/unavailable** with an integration-error entry within one health-check interval — registration and health are independent concerns | Triage via JRN-04.02; disable if required |
| She tries to open a CVS **work item's content** | Denied — administrative privilege over the platform is **not** privilege over mission content, and the attempt is itself audited | Console-level operation only; this separation is a defensible-design point worth stating aloud in the demo |

#### Accessibility Notes

*An operations console is a frequent and unexamined accessibility failure point precisely because it is assumed to be "internal tooling." It is not exempt from Section 508.*

- **Keyboard-only and screen-reader completable end to end**, including the wizard, the live test, and the confirmation.
- The multi-step wizard needs **accessible step indication** (current step programmatically conveyed, not just visually), per-step validation with an error summary and focus management, and preserved state across steps.
- The **live connection test must be keyboard-operable and its result announced via a live region** — a result that only appears visually leaves a non-visual user unable to know whether the gate has opened.
- No reliance on drag, hover, or pointer-only interaction anywhere in the flow, including the icon-token picker.
- **Health status is never colour-only:** healthy / degraded / unavailable each need a text label and/or icon. A red/green dot alone is both a conformance failure and an operational hazard (NFR-02).
- Console data tables — inventory, health history — follow the same accessible patterns as the work queue: header scope, captions, sort-state announcement, accessible pagination, announced result counts.
- **Destructive actions** (disable, de-register) use accessible confirmation dialogs that trap focus correctly and restore it on close.
- Endpoints, identifiers, and correlation IDs are **selectable, copyable text**, never truncated cells without an accessible full value.

#### Success Outcome

Priya registers the sixth application live through the UI **in under five minutes with zero code changes and zero restarts**, and the investigator sees its work items in his unified queue **without signing out** — the success measure of JTBD-04.1 (SM-11, SM-12, NFR-11) and the PRD F12 acceptance signal.

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Show the "before" | F11, F8 |
| 2. Start the flow | **F12**, F14 |
| 3. Describe the connection | **F12**, F8, F16 |
| 4. Test it before committing | **F12**, F14, F16, F9 |
| 5. Let it describe itself | **F8**, F12, F9 |
| 6. Decide who sees it | F2, F8, F12 |
| 7. Review and submit | **F12**, F13, F14 |
| 8. Watch it come alive | F11, F16, F8 |
| 9. Prove the consequence | F5, F8, F1, F12 |

---

### JRN-04.02: Triage a Reported Integration Failure — Health View → Error Log → Correlation ID → Audit Chain

**Persona:** PER-04 (Priya Raghunathan)
**Scenario:** 0916. An investigator messages: "my queue is missing things and an action wouldn't submit — here's the reference number off the error screen." Priya has minutes, not an afternoon, to establish which of four possibilities this is: a spoke outage, an adapter misconfiguration, an authorization denial, or user error. Today that means exporting logs from the hub and every candidate system and lining up timestamps by hand, with nothing tying the records to one another — because nothing ever issued a correlation ID. In the unified layer she starts at the health view, confirms the symptom in the integration-issue log, takes the correlation ID the user already gave her, and follows it into the audit chain where the whole cross-system action reads as one narrative. Then she decides whether to contain.
**Related Jobs:** JTBD-04.2 *(know before anyone complains)*, JTBD-04.3 *(classify in minutes from one place)*, JTBD-04.4 *(account for who did what, to what, when)*
**Entry Trigger:** A user report carrying a correlation ID — or, better, the start-of-day health check that catches the same failure before the report arrives.
**Demo Path:** Supporting — **Segment 6**, the accountability closer. Runs best immediately after Segment 2 (resilience), because the injected outage has already produced real error-log entries and a real degraded history to triage. Also the natural place to show the denials produced in JRN-03.02.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | Health history for each registered application with **at least one prior degraded episode**, so the health view shows a history rather than a single green row — a monitor with no past is not credible. |
| P2 | hub | Pre-seeded **integration error entries** across more than one application and more than one error class (timeout, connection refused, contract violation), so filtering is meaningful rather than decorative. |
| P3 | hub | ~120 pre-seeded audit events so the viewer, its filters, and its pagination are populated on first load. |
| P4 | hub | **At least one complete correlated chain** in the seed — a multi-spoke action under a single correlation ID — so the chain view is demonstrable even before the live demo produces one. |
| P5 | hub | Audit coverage for **authorization denials**, adapter failures, authentication events, and registration changes — not only successful mutations. |
| P6 | hub | The administrator's **own** prior console actions present in the trail, attributed to her — "administrators are not exempt" must be visible, not just stated. |
| P7 | hub | Correlation IDs surfaced in **user-facing error states**, so the premise of this journey (a user hands her an ID) is real. |
| P8 | hub | A disable/enable capability on a registered application, audited, with immediate effect on user-facing navigation and queue. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Start where the truth is | Opens the health view and reads status, last successful check, latency, and recent history for all applications | SCR-24 admin console — system health | "Is this one system or the whole platform?" | Alert, methodical | **Today:** health is checked per system, by different teams, with different definitions of "up," and the first signal is a phone call | One consolidated health surface, read from the registry, refreshed by a background monitor (F11, F16) |
| 2. Confirm the symptom | Sees the implicated application degraded with a recent transition time | SCR-24 → application row + check history | "Degraded at 09:07. His message was 09:14. That fits." | Focused, quietly relieved it is explainable | **Today:** she cannot tell whether the user's complaint and the system's state are the same event | Time-ordered health history makes symptom and cause line up without guessing |
| 3. Read the failures | Filters the integration-issue log by application and time window | SCR-25 admin console — integration issues | "Connection refused, twelve times, one operation. That's the spoke, not the adapter." | Confident in the classification | **Today:** diagnosis is manual log correlation across the hub and every candidate system, by hand, in a spreadsheet | Filterable error log with timestamp, application, operation, error class, correlation ID, and affected principal (F11) |
| 4. Take the thread | Pastes the correlation ID the user gave her and filters on it | SCR-25 filter → SCR-33 audit viewer | "One identifier. Let's see how far it actually goes." | Testing the claim | **Today:** there is no correlation ID because nothing ever issued one; the trace stops wherever she stops assembling it | Correlation IDs propagated end to end, browser → hub → spoke, into **both** audit and error logs (NFR-15) |
| 5. Read it as one story | Opens the chain view and reads every hub and adapter operation belonging to that one user action | SCR-34 audit record detail & chain view | "Read the case, read the issue, wrote PVQ, failed on eApp. That's the whole thing, in order." | **Satisfaction** — the answer is a record, not a reconstruction | **Today:** the result is an assertion she has to ask people to believe, heavily caveated | A cross-system action retrievable as a **single correlated chain** (SM-20) |
| 6. Classify and answer | Determines it is a spoke outage, not misconfiguration, not denial, not user error — and says so, with references | SCR-34 → copy correlation ID into the ticket | "Spoke outage. Twelve items withheld. He wasn't doing anything wrong." | Decisive | **Today:** she guesses the failure class from the symptom and escalates to whichever team seems most likely | Four candidate causes distinguished from **one place**, in minutes |
| 7. Contain if needed | Disables the implicated application from the console, with an accessible confirmation | SCR-23 application detail → disable (confirmed) | "Take it out of their queue until it's stable. Better a named absence than intermittent failure." | In control | **Today:** containment requires someone else's deployment, so the failing integration stays in users' faces | Enable/disable at runtime, **audited**, and immediately reflected in user navigation and queue (F11, F8) |
| 8. Close the loop | Confirms her own console action appears in the audit trail attributed to her; posts an announcement targeted at the affected roles | SCR-33 audit viewer (filtered to her) → SCR-29 announcements | "My own action is in there under my name. As it should be." | Accountable, done | **Today:** auditability is per-system, administrative actions least of all, and she communicates by emailing everyone | **Administrators are not exempt**; targeted announcements replace the email blast (F11, F13, F15) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Start where the truth is | Background health monitor's recorded status, latency, and check history per registered application, with status conveyed by **text and/or icon, never a dot alone** | F11, F16, F14 |
| 2. Confirm the symptom | Check history with transition times; circuit-breaker state visible in its effects — the hub stopped hammering the failing spoke | F16, F8 |
| 3. Read the failures | Chronological, filterable adapter-failure log with timestamp, application, operation, error class, correlation ID, and affected principal, **linked to the corresponding audit entries** | **F11**, F13 |
| 4. Take the thread | The same correlation ID resolves in both the error log and the audit trail; it is present as **selectable, copyable text**, never a truncated cell | F13, F10, NFR-15 |
| 5. Read it as one story | Chain view returns every record sharing the correlation ID: hub operations and adapter calls, in sequence, with actor, roles/attributes at the time, target system and resource, and outcome | **F13** |
| 6. Classify and answer | Denials, adapter failures, authentication events, and successful mutations are all in the same trail, so the four candidate causes are distinguishable without leaving the console | F13, F11, F2 |
| 7. Contain if needed | Disable writes an audit record and takes effect immediately in entitlements, navigation, and queue fan-out — no restart; users see a named absence rather than intermittent failure | F11, F8, F13 |
| 8. Close the loop | Her console actions are authorized server-side and audited under her identity; announcements are authored with severity, target roles, and effective/expiry dates, rendered on the right dashboards and dismissible per user, **never obscuring the demo banner** | F11, F13, F15 |

**Emotion curve (1 anxious → 5 confident):** Report arrives **2** *(unknown scope, a user waiting, the clock running)* → Health view **3** → Symptom confirmed **4** → Error log **4** → Correlation ID **4** → **Chain view 5** *(the whole action in one place — the moment the afternoon becomes four minutes)* → Classify **5** → Contain **5** → Close the loop **5**.

#### Key Moments

- **Decision Point — Stage 7.** Contain or wait. Disabling an application is user-visible and audited; she needs to make it quickly, from evidence, and be able to justify it later.
- **Delight Opportunity — Stage 5.** One identifier resolving the entire cross-system chain. This is the difference between an answer that is a record and an answer that is an assertion she asks people to believe.
- **Demo Moment — Stage 8.** Her own console action, in the audit trail, under her name — paired with the fact that she **cannot** read the mission content of the work item she just triaged. "Administrators are not exempt" and "platform privilege is not content privilege" are demonstrable claims, not policy statements.
- **Risk of Abandonment — Stage 4.** A trace that stops at the hub boundary and never reaches the adapter call. If the chain is partial, she goes back to manual log merging and the console becomes a dashboard she does not open.
- **Credibility Risk — Stage 1.** A health view that reports "up" while users are experiencing failures. A dashboard that lies is worse than no dashboard, and this persona will catch it.

#### Success Exit Criteria

- Given a correlation ID taken from a user-facing error state, she retrieves **the complete chain of hub and adapter operations for that action in a single filtered query** (SM-20).
- An induced adapter failure produces a **correctly attributed entry in the integration error log and a degraded/unavailable health state within one health-check interval** (PRD F11 acceptance signal).
- Disabling the implicated application is reflected in user navigation and queue **immediately** and is **itself audited**.
- Her own console actions appear in the audit trail **attributed to her**.
- An attempt by her to read mission work-item content, or to mutate an audit record through any application path, is **denied and itself audited** — and **no application path to modify or delete an audit record exists for anyone**, verified by test (NFR-07).
- Total time from report to classification: **minutes**, from one console.

#### Failure and Alternate Paths

| Condition | What Priya sees | Recovery |
|-----------|-----------------|----------|
| The user has no correlation ID | She filters the audit trail by actor, action type, target system, and time window instead — every user-facing error state carries an ID, so this should be rare | Same chain reached by a longer route |
| The failure was an **authorization denial**, not an outage | The trail shows outcome `DENIED` with the principal, the target resource, and the attributes held at the time — user error or a policy question, not an incident | Answer the user; no containment needed |
| The failure was a **contract violation** by the spoke | Error class in the log distinguishes it from a timeout or refusal; the adapter conformance suite is the follow-up | Escalate to the application's team with evidence, not a symptom |
| Health says healthy but users report failures | Manual **"test connection"** from the application detail view performs a live check on demand, settling the disagreement immediately | If the live test fails, the monitor's interval or thresholds are the defect |
| She disables an application by mistake | Re-enable is equally immediate and equally audited; probing restarts at once rather than waiting for the next interval | Both actions are on the record, which is the point |
| Audit query returns a chain with a gap | **A defect, not an alternate path** — a write that produced no audit record, or a denial never recorded, is a P0 bug (NFR-06) | Fix before demo; the segment's whole claim depends on completeness |

#### Accessibility Notes

- **Keyboard-only and screen-reader completable end to end** — health view, error log, audit viewer, chain view, disable confirmation, and announcement authoring.
- **The audit viewer is the densest table in the product and the one an evaluator is most likely to inspect.** It needs header scope, a caption, sort-state announcement, accessible pagination, and announced result counts — the same patterns as the work queue, not a lesser console variant.
- **Correlation IDs must be selectable, copyable text with an accessible full value** — never images, never truncated cells without the full string available. She pastes them into tickets constantly.
- Health status conveyed by **text label and/or icon**, never colour alone. A red/green dot is a conformance failure and an operational hazard (NFR-02).
- **Destructive actions** (disable, de-register) use confirmation dialogs that **trap focus correctly and restore it on close**.
- Filter controls on the error log and audit viewer are keyboard-operable with programmatically associated labels and announced result counts on change.
- Announcement authoring is an ordinary accessible form: labelled fields, inline errors, error summary with focus management.

#### Success Outcome

Priya retrieves the complete hub-and-adapter chain for a reported action from a single correlation ID in one filtered query, classifies the failure from one console in minutes, and contains it with an audited action reflected immediately in user navigation — while her own actions remain attributable to her and mission content remains outside her reach (JTBD-04.2, JTBD-04.3, JTBD-04.4; SM-20, PRD F11 acceptance signal).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Start where the truth is | **F11**, F16, F8 |
| 2. Confirm the symptom | F11, **F16** |
| 3. Read the failures | **F11**, F13, F9 |
| 4. Take the thread | F13, F10, F11 |
| 5. Read it as one story | **F13**, F10 |
| 6. Classify and answer | F13, F11, F2 |
| 7. Contain if needed | F11, F8, F13 |
| 8. Close the loop | F11, F13, F15 |

---

### JRN-04.03: Rehearse Degradation on Purpose — Induce, Observe, Restore

**Persona:** PER-04 (Priya Raghunathan)
**Scenario:** Before a demonstration — and, in a real program, before a production incident teaches it to her — Priya needs to verify that the platform degrades the way it claims to. She takes Investigation Management offline **on purpose** from the administrator-only failure-injection controls, watches the health monitor notice, watches the integration error log fill with correctly attributed entries, watches an investigator's queue degrade **visibly rather than blankly** in the next window, and then restores the spoke and watches everything clear automatically with nobody reloading and nobody re-authenticating. Today there is no way to induce a controlled failure at all, so resilience behavior is untested until it is production.
**Related Jobs:** JTBD-04.2 *(health before complaint)*, JTBD-04.4 *(resilience is rehearsable)*; drives JTBD-01.4 and JTBD-02.4 from the other side of the glass
**Entry Trigger:** Pre-demo rehearsal, or an evaluator asking "what happens when one of these is down?"
**Demo Path:** ✅ **SECONDARY SCRIPTED DEMO — Segment 2b.** This is the **driving** half of the resilience segment: Priya acts here, the evaluator watches JRN-01.03 (investigator) and JRN-02.02 (adjudicator) in the other window. Always restore before moving to the next segment.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | **Failure-injection controls present, administrator-only, and demo-scoped** (SCR-38), able to force any registered spoke into **unavailable, slow, or erroring** state and restore it. |
| P2 | im | **IM designated as the outage-demonstration spoke**, with seeded items — including overdue ones — owned by the investigator persona, so removing it **visibly changes counts** on the observing screen. |
| P3 | pvq | PVQ independently injectable, because the adjudicator-facing consequence (JRN-02.02) is a different and equally important demonstration. |
| P4 | hub | A populated per-principal, per-source count cache so the degraded warning can **quantify** the omission rather than falling back to unquantified copy. |
| P5 | hub | Health-probe interval and circuit-breaker thresholds tuned so degradation **and** recovery are each observable within a single check interval — a resilience demo with a ninety-second silence in the middle does not land. |
| P6 | hub | An investigator session open in a second window before injection begins, so "no reload, no re-authentication" is observed rather than asserted. |
| P7 | hub | Restore leaves **no residue**: no stuck circuit, no stale degraded flag, no orphaned error state. Verified as part of rehearsal, because a failure injection a restore does not fully clear is a firing criterion for this persona. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Set the stage | Confirms all six applications healthy and the investigator's queue complete in the other window | SCR-24 system health + *(second window)* SCR-13 | "Everything green, everything text-labelled. Baseline established." | Composed | **Today:** she has no baseline view at all; "healthy" is an informal belief per system | A single health surface that makes a baseline statable in one screenshot (F11) |
| 2. Break it deliberately | Forces Investigation Management into **unavailable** from the failure-injection controls | SCR-38 failure-injection controls (administrator-only) | "Down it goes. Now let's see whether we told anyone." | Deliberate, slightly theatrical | **Today:** degradation cannot be rehearsed, so resilience behavior is discovered in production with an audience | Controlled, reversible failure injection — resilience becomes testable rather than hypothetical (F16) |
| 3. Watch the monitor catch it | Watches health flip to unavailable within one check interval, with a transition time and text label | SCR-24 → IM row + check history | "Seven seconds. The monitor found it before any human could have." | Satisfied | **Today:** the first signal of a failing integration is an investigator calling to say his queue is empty | **Detection by monitoring rather than by user report** — the core of JTBD-04.2 |
| 4. Watch the log fill | Reads correctly attributed entries appearing in the integration-issue log with operation, error class, and correlation ID | SCR-25 integration issues | "Attributed to IM, named operation, real error class, and an ID I can follow." | Confident in the instrumentation | **Today:** failures leave traces in several places and nothing ties them together | A correctly attributed error-log entry **within one health-check interval** (PRD F11 acceptance signal) |
| 5. Watch the user experience it | Switches to the investigator window: four sources still rendering, a named and quantified warning, IM-targeted actions disabled with an explanation, **no error page anywhere** | *(second window)* SCR-13 → degraded banner | "He can still work. He knows exactly what he's missing. Nobody had to call me." | **This is the point** | **Today:** the user sees an empty list, assumes the whole system is broken, and stops working | Degradation that is named, quantified, and survivable (SM-15, SM-16) |
| 6. Put it back | Restores IM; watches health return to healthy, the warning clear, and the missing items reappear in the other window | SCR-38 restore → SCR-24 → *(second window)* SCR-13 | "Cleared on its own. He didn't reload, and he never signed in again." | Assured, finished | **Today:** recovery is confirmed by asking users whether it looks better now | **Automatic recovery** via half-open probing, with no user action at all (SM-17) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Set the stage | Health monitor reports current status, last successful check, latency, and recent history for every registered application, status conveyed by text and/or icon | F11, F16 |
| 2. Break it deliberately | Injection applied to the targeted spoke only; the control is administrator-only, server-authorized, and **the injection action is itself audited** | F16, F2, F13 |
| 3. Watch the monitor catch it | Background probe fails; after the configured threshold the **circuit opens** and the hub stops hammering the spoke; health state transitions with a recorded time | **F16**, F8 |
| 4. Watch the log fill | Adapter failures logged with timestamp, application, operation, error class, correlation ID, and affected principal, linked to the corresponding audit entries | F11, F13, F8 |
| 5. Watch the user experience it | Aggregate queue returns partial results with per-source status; the degraded banner names the application and quantifies the omission; actions targeting the unavailable spoke are pre-emptively disabled with a reason; the **global error boundary guarantees no blank page and no stack trace anywhere** | **F16**, F5, F6, F14 |
| 6. Put it back | Half-open probing succeeds, the circuit closes, health returns to healthy, and open sessions receive restored data through polling — **no reload, no re-authentication**; the warning clears through the same live region that raised it | **F16**, F1, F5 |

**Emotion curve (1 anxious → 5 confident):** Baseline **4** → Inject **4** *(in control — but this is the moment she finds out whether the claims are real)* → Monitor catches it **5** → Log fills **5** → User's screen **5** *(named, quantified, still working — the payoff)* → Restore **5**.

> **Note on this curve.** Priya's journey is the only one in this document that does not dip below 4. That is correct and deliberate: the anxiety of this scenario belongs to **Marcus and Dana**, in the other window, and the product's job is to keep their curves from collapsing. Priya's flat-confident curve *is* the outcome being demonstrated — an operator who is not surprised.

#### Key Moments

- **Demo Moment — Stage 5.** The window switch. An evaluator seeing "Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date." on a real user's screen, while the rest of that screen keeps working, is the entire resilience argument in one frame.
- **Decision Point — Stage 2.** Which spoke to break. IM is the designated outage spoke because its absence **visibly changes counts** for the investigator persona; injecting a spoke with no seeded work makes the demonstration abstract.
- **Delight Opportunity — Stage 6.** Automatic recovery with no user action. "He didn't reload, and he never signed in again" is the sentence to say out loud.
- **Risk — the whole journey.** Failure injection that leaves the platform in a state a restore does not fully clear. That is a firing criterion for this persona and a demo-day catastrophe: it would poison every segment that follows.
- **Risk — Stage 5.** A single error page, blank screen, or stack trace anywhere in the product during the injection fails the segment outright, regardless of how good the warning looks (SM-15, NFR-09).

#### Success Exit Criteria

- An induced adapter failure produces a **degraded/unavailable health state and a correctly attributed integration-error entry within one health-check interval** (PRD F11 acceptance signal).
- The forced outage produces a **visible, specific degraded warning across the product and no error page anywhere** (SM-15).
- Remaining sources render fully and **remain actionable** (SM-16).
- Restoring the spoke **clears the warning and restores data without user reload or re-authentication** (SM-17).
- The injection and restoration actions are **themselves audited** and attributable to Priya.
- The platform returns to a **clean baseline** — no stuck circuit, no stale flag — so the next demo segment runs on pristine behavior.

#### Failure and Alternate Paths

| Condition | What Priya sees | Recovery |
|-----------|-----------------|----------|
| She injects **slow** rather than **unavailable** | Adapters time out at their configured bounds; the page stays interactive with loading states and then degrades to the named warning; one slow spoke never stalls the aggregate request | Restore; timeout policy verified |
| She injects **erroring** responses | Health reports degraded rather than unavailable; the error log records the error class distinctly; the circuit opens on repeated failure | Restore; error classification verified |
| Two spokes injected at once | Both named in the warning, each with its own count; the composition does not collapse into a generic message | Restore both |
| Recovery does not clear the warning | **A defect, not an alternate path** — automatic recovery is SM-17 and a blocking issue for the demo | Fix before demo |
| A user is mid-form when injection or recovery lands | The live region announces; **focus is never moved**; entered data is untouched | Verified explicitly during rehearsal, because this is the most likely accessibility regression |
| Injection controls reachable by a non-administrator | **A defect.** The controls are administrator-only and server-authorized; a direct API attempt by any other role must be denied and audited | Covered by negative-path tests (F19) |

#### Accessibility Notes

- **Keyboard-only and screen-reader completable end to end**, including the injection controls, the confirmation, and the restore.
- Failure-injection controls are **state-changing and consequential**: they need clear labels, an accessible confirmation with correct focus trapping and restoration, and an announced result — not a bare toggle whose effect is only visible somewhere else on the page.
- **Health and injected state are never colour-only.** "Unavailable (injected)" needs a text label; an operator must be able to tell an induced state from a real one, non-visually, so a demo state is never mistaken for a genuine outage.
- The observed degraded warning in the user window must be verified **with a screen reader during rehearsal**: announced via live region, **without stealing focus**, and also present in the static page structure for anyone arriving after the announcement.
- Check-history and error-log tables follow the standard accessible data-table patterns with announced result counts as new entries arrive.
- Transition times, correlation IDs, and error classes are selectable, copyable text.

#### Success Outcome

Priya induces a controlled spoke failure and observes the specific degraded warning appear across the product with **no error page anywhere**, a correctly attributed error-log entry within one health-check interval, and — on restore — the warning clearing automatically **without any user reloading or re-authenticating**: the demonstrable half of JTBD-04.2 and JTBD-04.4, and the enabling condition for JTBD-01.4 and JTBD-02.4 (SM-15, SM-16, SM-17).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Set the stage | F11, F16, F8 |
| 2. Break it deliberately | **F16**, F2, F13 |
| 3. Watch the monitor catch it | **F16**, F11, F8 |
| 4. Watch the log fill | F11, F13, F9 |
| 5. Watch the user experience it | **F16**, F5, F6, F14 |
| 6. Put it back | **F16**, F1, F5, F11 |

---

## Cross-Journey Patterns

### Common Pain Points (the "today" costs that recur across personas)

These are the frictions that appeared in **three or more** journeys. Each is a single root cause with four different symptoms — which is precisely why a unified layer, rather than four better applications, is the right response.

| # | Recurring pain (today) | Appears in | Single cause | Solved once by |
|---|------------------------|-----------|--------------|----------------|
| X-01 | **Multiple logins for one piece of work**, with mismatched session lifetimes so the system needed last has always expired | JRN-01.01, 01.02, 02.01, 03.01 | Identity is owned per application | F0 + F1 — one session, honored by every adapter, for its whole life |
| X-02 | **Identifiers hand-carried between systems** in a scratch document, with transposition as a recurring error class | JRN-01.01, 02.01, 03.01 | No system accepts a reference from another | F6 related items + F7 — relationships resolved live by the hub |
| X-03 | **An empty screen that might be a lie** — no way to distinguish "nothing here" from "the source could not be reached" | JRN-01.03, 02.02, 04.02, 04.03 | Aggregation without per-source status | F16 — designed empty states and named, quantified degraded states as two different screens |
| X-04 | **Discovery is accidental** — work, notices, and exceptions are found late or second-hand | JRN-01.02, 02.02, 03.01 | Nothing computes exceptions across systems | F15 + F4 — server-side alert rules linking directly to the item that produced them |
| X-05 | **Confirmation that names nothing** — "Saved" with no system, no state, no evidence — forcing manual re-verification | JRN-01.01, 02.01, 03.01 | Writes are per-system and unattributed | F6 + F7 — confirmations naming system and resulting state, read back per spoke |
| X-06 | **Correlation by hand** — reconstructing "what happened, in what order, across which systems" by merging timestamps | JRN-01.01, 02.01, 04.02 | No correlation ID was ever issued | F13 — one correlation ID spanning an entire cross-system action |
| X-07 | **Role meaning differs per system**, so nobody can say what they are actually entitled to and effort is invested in actions that turn out to be forbidden | JRN-01.02, 02.01, 03.02, 04.01 | Authorization is implemented four times, four ways | F2 — one server-side policy engine, action sets computed per principal per resource |
| X-08 | **Context lost at every boundary** — filters, sort, page, and the user's own train of thought | JRN-01.01, 01.02, 02.01, 03.01 | Each application is a separate destination | F3 + F6 — one shell, breadcrumbs that carry cross-application context, restored queue state |
| X-09 | **Internal vocabulary leaking to people who cannot decode it** | JRN-03.01, 03.02 | Status display is an internal state dump | F4 + F14 — plain-language mapping applied server-side before anything reaches an applicant |
| X-10 | **Degradation cannot be rehearsed**, so resilience behavior is first observed in production | JRN-01.03, 02.02, 04.03 | No controlled failure mechanism exists | F16 failure injection — resilience becomes a test, not a hope |

### Shared Opportunities (built once, paid for by every persona)

- **One session, four experiences.** F0/F1 eliminate X-01 for every persona simultaneously. This is the single highest-leverage capability in the product, and it is invisible when it works — which is why the audit log's "exactly one authentication event" is the observable that proves it (SM-02).
- **Per-source status on every aggregate.** Every list, panel, and widget knows whether each source answered, failed, or answered with nothing. That one design decision produces the investigator's named warning (JRN-01.03), the adjudicator's refusal to decide blind (JRN-02.02), and the administrator's health picture (JRN-04.02) from the same substrate.
- **Server-computed action sets.** The same mechanism that keeps Dana from resolving an issue (JRN-02.01), Renée from touching another subject's record (JRN-03.02), and Priya from reading mission content (JRN-04.01/04.02) is one policy engine, evaluated per resource, on every request. **Three different demo moments, one implementation.**
- **The correlation ID as connective tissue.** Issued at the browser, propagated hub → adapter → spoke, landing in both the audit trail and the integration error log. It is what turns Marcus's flagship action into one chain (JRN-01.01), lets Priya answer a report in minutes (JRN-04.02), and gives every error state something a user can hand to an administrator.
- **Accessible data tables as a single pattern.** The work queue, the notices list, the audit viewer, the inventory, the health history, and the error log are the **same accessible table** with different columns. Building it once and well serves every persona; building it six times is how the console ends up non-conformant.
- **Designed empty states as a first-class deliverable.** Every journey has at least one path that ends in nothing to show. An empty state that explains and offers a next action is the difference between "the system is working and I have nothing to do" and "the system is broken."

### Convergence Points (where journeys meet)

| Convergence | Journeys | What happens | Why it matters to the demo |
|-------------|----------|--------------|----------------------------|
| **The same work item, two roles** | JRN-01.01 ↔ JRN-02.01 | Marcus resolves `ISS-2207`; Dana can read it and its narrative but is **not offered** the resolve action | The clearest live RBAC demonstration in the product — show them back to back |
| **Producer → consumer of the record** | JRN-01.01 → JRN-02.01 | Marcus's disposition and narrative are the material Dana adjudicates weeks later, out of context | Makes the audit and narrative-quality requirements concrete rather than abstract |
| **One outage, two consequences** | JRN-04.03 → JRN-01.03 + JRN-02.02 | Priya injects once; the investigator sees a named, quantified queue gap, the adjudicator sees a refusal to present an ambiguous empty list | One induced failure yields two persona-appropriate designed responses — the strongest evidence that resilience was designed, not patched |
| **One registration, one user-visible consequence** | JRN-04.01 → JRN-01.02 | CVS registered in one window; its items appear in an open investigator session in the other | Extensibility is proven by the second window, not by the wizard |
| **Mediated, never shared** | JRN-01.01 ↔ JRN-03.01 | Marcus acts on Renée's record; she never sees his findings, his notes, or that an issue was raised against her answer. Their only touchpoint is a request for information: a task to her, a pending item to him | A deliberate access-control boundary, not an oversight — and the setup for the zero-trust demonstration |
| **Every action lands in the same trail** | all ten | Authentications, traversals, writes, denials, adapter failures, console actions | The audit viewer is where every journey in this document can be seen to have happened |

### Cross-Cutting Accessibility Commitments

Stated once here because they apply to **every** journey and should be verified per journey rather than per screen:

1. **Every journey in this document is completable keyboard-only and with a screen reader, start to finish.** This is a completion criterion, not a note (SM-08).
2. **Cross-application traversal preserves focus and announces context.** The highest-risk step in the product (JRN-01.01, Stage 7) and the one a screen-reader user will notice first if it is wrong.
3. **Asynchronous updates — queue refreshes, action results, degraded warnings, new notices — are delivered via live regions and never steal focus**, with the single deliberate exception of a result the user is explicitly waiting for (the dual-system confirmation).
4. **Status is never colour-only**, anywhere, for anyone — including the administrator console, where a red/green health dot is both a conformance failure and an operational hazard (NFR-02).
5. **Source attribution lives in the accessible name**, not in a coloured badge. An adjudicator who cannot attribute a field cannot use it.
6. **Long, high-consequence forms** — issue resolution, determination, applicant submission, application registration — all require an error summary with focus management and in-page links to offending fields. A lost narrative is a lost user in four different ways.
7. **Usable at 200% zoom and 320px-equivalent width**, with the applicant surface (JRN-03.01) as the hardest case and the non-dismissible demo banner as a real layout constraint to test against (NFR-13, NFR-16).
8. **Denial, empty, degraded, and error pages are in scope for 508** — they are pages like any other, and they are where a user is already frustrated.

---

## Journey-to-JTBD Traceability

Every journey stage below maps to the job it serves and the outcome that must be observable in a live synthetic-data demonstration. Stage names are abbreviated; full text is in each journey's stage table.

| Journey Stage | JTBD ID | Expected Outcome |
|---------------|---------|------------------|
| JRN-01.01:Sign in | JTBD-01.1 | One authentication event serves the entire cross-system workflow; the audit log shows exactly one (SM-02) |
| JRN-01.01:Orient | JTBD-01.2 | A newly raised PVQ issue on a case he owns is **announced**, not discovered late, and links directly to the item |
| JRN-01.01:Discover relationship | JTBD-01.1 | The issue raised against a questionnaire answer is visible **on the case**, explained in words, resolved live rather than hard-coded |
| JRN-01.01:Traverse | JTBD-01.1 | Traversal happens inside the same shell with case context carried in the breadcrumb — no interstitial, no new tab, no credential prompt |
| JRN-01.01:Resolve | JTBD-01.1 | Disposition and narrative persist as a real action, re-authorized server-side at execution against **both** target resources |
| JRN-01.01:Dual confirmation | JTBD-01.1 | Both spokes independently return the updated state through their own APIs; a partial write is never reported as success (SM-03) |
| JRN-01.01:Leave the record | JTBD-01.3 | The whole action is retrievable as a **single correlated chain**, with exactly one audit record per state change (SM-19, SM-20) |
| JRN-01.02:Open the queue | JTBD-01.2 | One queue spanning at least four of five spokes replaces three per-system lists; default view answers "what first" (SM-14) |
| JRN-01.02:Narrow | JTBD-01.2 | Filtering and sorting are server-scoped, explainable across sources, and announce result count and sort state |
| JRN-01.02:Return from interruption | JTBD-01.2 | Filters, sort, and page survive a 10–60 minute interruption without rebuilding |
| JRN-01.02:New source appears | JTBD-04.1 | A newly registered application reaches an **open session** without sign-out or reload (SM-12) |
| JRN-01.03:Read the warning | JTBD-01.4 | Degradation **names the application and quantifies the gap**; never a blank screen and never an error page (SM-15, NFR-10) |
| JRN-01.03:Keep working | JTBD-01.4 | Remaining sources render fully and remain actionable while one spoke is down (SM-16) |
| JRN-01.03:Blocked action | JTBD-01.4 | Actions targeting an unavailable spoke are pre-emptively disabled with an explanation rather than failing mid-submission |
| JRN-01.03:Recovery | JTBD-01.4 | The warning clears and data returns **without reload or re-authentication** (SM-17) |
| JRN-02.01:Read what was submitted | JTBD-02.1 | The questionnaire as submitted is reachable in the same path as everything else bearing on the subject |
| JRN-02.01:Follow the issue | JTBD-02.1 | Cross-system relationships resolve inline; traversal replaces four searches and four logins (SM-02, SM-04) |
| JRN-02.01:Read the narrative | JTBD-02.1 | The investigator's **disposition and narrative** are visible, not merely that an issue existed and closed |
| JRN-02.01:Notice what she cannot do | JTBD-02.2 | The same work item presents a **different, server-computed action set** per principal; a direct API call to the investigator-only action is denied and audited (SM-18) |
| JRN-02.01:Render determination | JTBD-02.2 | Exactly one audit record, written before the success response, naming actor and the attributes held at the time (SM-19) |
| JRN-02.02:Ask the clock question | JTBD-02.3 | Aging and blocked determinations are surfaced continuously, each alert resolving to a real populated destination (SM-06, SM-24) |
| JRN-02.02:Sort by age | JTBD-02.3 | Date semantics are consistent across sources, so a sorted list is defensible |
| JRN-02.02:Empty issue list | JTBD-02.4 | A genuine absence and an unreachable source are **two different screens**, distinguishable visually and non-visually |
| JRN-02.02:Read which one it is | JTBD-02.4 | With PVQ offline, a specific named warning appears and **no empty issue list** is presented (SM-15, NFR-10) |
| JRN-03.01:Read where she stands | JTBD-03.1 | "Where am I" answered within 30 seconds on a 320px viewport, as one process rather than two system statuses (SM-25, NFR-16) |
| JRN-03.01:Understand, not decode | JTBD-03.1 | Zero internal system names, tier codes, or state abbreviations without plain-language explanation |
| JRN-03.01:See what she owes | JTBD-03.2 | A short, ordered, unambiguous task list with due dates — not a systems inventory |
| JRN-03.01:Do the thing | JTBD-03.2 | **100% of tasks link directly to the action that discharges them**; nothing is lost to a session timeout (SM-06, NFR-14) |
| JRN-03.01:Confirmation | JTBD-03.2 | The confirmation names what was received and what happens next, then appears in her own history |
| JRN-03.01:Read the notice | JTBD-03.3 | Notices are delivered where status is checked, retained, with unread state, announced without stealing focus |
| JRN-03.02:Find the entry | JTBD-03.4 | A self-scoped history produces evidence of a prior submission in under a minute |
| JRN-03.02:Check the edges | JTBD-03.4 | Investigative content, issue items, designations, and case records are unreachable from every applicant surface |
| JRN-03.02:Wrong subject / wrong role | JTBD-03.4 | Denied **server-side**, with a **consistent non-enumerable error**, and the denial written to the audit trail (SM-18) |
| JRN-03.02:Read the denials | JTBD-04.4 | Denials — not only successes — are on the record, with actor, target, outcome, and correlation ID |
| JRN-04.01:Start the flow | JTBD-04.1 | Onboarding is a guided configuration action performed in the UI, not an engineering project |
| JRN-04.01:Test before committing | JTBD-04.1 | A live connection test gates submission; unreachable endpoints are caught before, not after |
| JRN-04.01:Let it describe itself | JTBD-04.1 | Capabilities auto-discovered via `describe()` and confirmed, not transcribed from documentation |
| JRN-04.01:Review and submit | JTBD-04.4 | Registration writes one audit record naming the administrator, the application, and the configuration |
| JRN-04.01:Watch it come alive | JTBD-04.1 | Immediate appearance in inventory, health, navigation, and queue — **under five minutes, zero code changes, zero restarts** (SM-11) |
| JRN-04.01:Prove the consequence | JTBD-04.1 | An investigator with an open session sees the new source's items **without signing out** (SM-12) |
| JRN-04.02:Start where the truth is | JTBD-04.2 | Health, latency, and check history for every registered application are visible before a user reports a problem |
| JRN-04.02:Read the failures | JTBD-04.3 | A filterable error log with application, operation, error class, correlation ID, and affected principal, linked to audit |
| JRN-04.02:Take the thread | JTBD-04.3 | A correlation ID from a user-facing error state resolves the **complete hub-and-adapter trace in one query** (SM-20) |
| JRN-04.02:Read it as one story | JTBD-04.4 | A cross-system action reads as one correlated chain — a record, not a reconstruction |
| JRN-04.02:Contain if needed | JTBD-04.3 | Disabling an application is immediate in user navigation and queue, and is itself audited |
| JRN-04.02:Close the loop | JTBD-04.4 | The administrator's **own** actions are attributable to her; mission content and audit mutation remain out of reach for everyone (NFR-07) |
| JRN-04.03:Break it deliberately | JTBD-04.4 | Resilience is rehearsable: controlled, reversible, administrator-only failure injection, itself audited |
| JRN-04.03:Monitor catches it | JTBD-04.2 | Degraded/unavailable state and a correctly attributed error-log entry appear **within one health-check interval** |
| JRN-04.03:Watch the user experience it | JTBD-01.4 | A visible, specific degraded warning across the product and **no error page anywhere** (SM-15, SM-16) |
| JRN-04.03:Put it back | JTBD-04.2 | Restoration returns the application to healthy with **no manual intervention** and no user reload or re-authentication (SM-17) |

### JTBD Coverage Check

All sixteen jobs are exercised by at least one journey; the five demo-critical jobs are exercised by a journey that is on the scripted path.

| JTBD | Journeys | On demo path |
|------|----------|--------------|
| JTBD-01.1 *(flagship)* | **JRN-01.01** | ✅ Segment 1 (primary) |
| JTBD-01.2 | JRN-01.02, JRN-01.01 | ✅ Segment 3b |
| JTBD-01.3 | JRN-01.01, JRN-01.02 | ✅ Segment 1 |
| JTBD-01.4 | JRN-01.03, JRN-04.03 | ✅ Segment 2a |
| JTBD-02.1 | JRN-02.01 | ✅ Segment 4 |
| JTBD-02.2 | JRN-02.01 | ✅ Segment 4 |
| JTBD-02.3 | JRN-02.02 | Segment 2c |
| JTBD-02.4 | JRN-02.02 | Segment 2c |
| JTBD-03.1 | JRN-03.01, JRN-03.02 | ✅ Segment 5a |
| JTBD-03.2 | JRN-03.01 | ✅ Segment 5a |
| JTBD-03.3 | JRN-03.01 | Segment 5a |
| JTBD-03.4 | JRN-03.02 | ✅ Segment 5b |
| JTBD-04.1 | JRN-04.01, JRN-01.02 | ✅ Segment 3a |
| JTBD-04.2 | JRN-04.02, JRN-04.03 | ✅ Segment 2b / 6 |
| JTBD-04.3 | JRN-04.02 | ✅ Segment 6 |
| JTBD-04.4 | JRN-04.02, JRN-04.03, JRN-03.02 | ✅ Segment 6 |

### Journey-to-Feature Coverage Check

| Feature | Journeys exercising it | Feature | Journeys exercising it |
|---------|------------------------|---------|------------------------|
| F0 | 01.01, 01.02, 01.03, 02.01, 03.01 | F10 | 01.01, 02.01, 03.02, 04.02 |
| F1 | 01.01, 01.02, 02.01, 03.01, 04.01, 04.03 | F11 | 01.03, 04.01, 04.02, 04.03 |
| F2 | 01.01, 01.02, 02.01, 03.01, 03.02, 04.01, 04.03 | F12 | 01.02, 04.01 |
| F3 | 01.01, 01.02, 03.01, 03.02 | F13 | 01.01, 02.01, 02.02, 03.01, 03.02, 04.01, 04.02, 04.03 |
| F4 | 01.01, 01.02, 02.02, 03.01, 03.02 | F14 | all ten journeys |
| F5 | 01.01, 01.02, 01.03, 02.01, 02.02, 03.01, 04.01, 04.03 | F15 | 01.01, 01.02, 02.02, 03.01, 04.02 |
| F6 | 01.01, 01.02, 01.03, 02.01, 02.02, 03.01, 03.02 | F16 | 01.02, 01.03, 02.02, 04.01, 04.02, 04.03 |
| F7 | **01.01**, 02.01 | F17 | 01.01, 01.02, 02.01, 03.01, 03.02, 04.01 |
| F8 | 01.01, 01.02, 01.03, 02.02, 04.01, 04.02, 04.03 | F18 | the scripted demo path (all six segments) |
| F9 | 01.01, 01.03, 02.01, 02.02, 03.02, 04.01, 04.02 | F19 | 03.02, 04.03 *(negative-path and resilience assertions)* |

**Gap note.** F18 (demo operability) and F19 (test and accessibility verification) are exercised *by* these journeys rather than *within* them — they are the scaffolding that makes every journey repeatable and verifiable. Their acceptance evidence is the scripted demo path in the header and the per-journey Success Exit Criteria throughout.

---

## Downstream Use

| Consumer | What it takes from this document |
|----------|----------------------------------|
| **STORY-MAP** | Journey stages become the story-map backbone steps; per-journey Success Exit Criteria seed acceptance criteria |
| **FRD / Functional Requirements** | Stage → screen (SCR-xx) mapping and Failure/Alternate Path tables define the required states per screen, including the non-happy ones |
| **Seed data (F17)** | Every journey's **Preconditions** table is normative input to the seed corpus and to seed-time validation assertions |
| **Demo script (F18)** | The scripted demonstration path, its six segments, and the per-journey demo flags |
| **Verification / Test Plan (F19)** | Success Exit Criteria map to SM-01 … SM-22; Accessibility Notes define the manual keyboard and screen-reader passes per journey |
| **UX design** | Emotion curves and Key Moments identify where to invest design effort — and where a dip is legitimate and should not be designed away |

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-09-15*
