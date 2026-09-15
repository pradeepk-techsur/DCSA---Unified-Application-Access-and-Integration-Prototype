# Personas
## DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

| Field | Value |
|-------|-------|
| **Product Name** | DCSA Unified Application Access and Integration Prototype |
| **Project Acronym** | DCSA-UAL |
| **Document Type** | Personas |
| **Status** | Draft v1.0 |
| **Date** | 2026-09-14 |
| **Related PRD** | `project_specs/PRD-DCSA-UAL.md` (Section 3 — Target Users; Section 2 — Problem Statement) |
| **Related Charter** | `.planning/PROJECT.md` |

> **DEMO — SYNTHETIC DATA ONLY.** These personas describe the users the demonstration prototype must convincingly serve and that an Innovation Call evaluator must recognize as credible. The individuals named here are fabricated. No real DCSA personnel, no real applicants, and no real case data are represented. Names, caseloads, and identifiers are synthetic by construction and correspond to the seeded demo identities defined in F17.

**How to read this document.** Four roles are named in the charter and enforced by F2's policy engine: Investigator, Adjudicator, Applicant, Administrator. Each gets one persona, and the four are kept deliberately distinct because the product's entire RBAC/ABAC story depends on their differences being visible in the demo — different navigation, different dashboards, different queues, different available actions on the same work item, different denials. A persona that blurs into its neighbor would weaken exactly the thing the prototype exists to prove.

Every persona carries an **Access Scope** section. That section is the human-readable source for the authorization rules specified in F2 and detailed downstream in the RBAC/ABAC design. If the policy engine and this document disagree, one of them is wrong and it should be resolved before build.

---

## Persona Summary

| ID | Name | Role | Home Systems (today) | Primary Goal |
|----|------|------|----------------------|--------------|
| PER-01 | Marcus Vale | Field/Desk Background Investigator, DCSA Personnel Vetting | IM (caseload), eApp (questionnaires), PVQ (issue items) | Finish a case-advancing action that spans eApp and PVQ in one sitting, in one place, without re-logging in or re-typing context |
| PER-02 | Dana Okonkwo | Adjudicator, Consolidated Adjudication Services | eApp, PVQ, PDT, IM (read-heavy across all four) | Render a defensible trust determination with the complete cross-system record visible at once, and know which determinations are aging |
| PER-03 | Renée Ashford | Applicant — cleared-industry employee undergoing initial vetting | IEP (status, notices), eApp (questionnaire) | Know, in plain language, where she is in the process and exactly what she owes next — without learning which government system owns which piece |
| PER-04 | Priya Raghunathan | Platform Administrator, Integrated Enterprise program office | The unified layer itself; all six registered applications | Know which applications are connected and healthy before a user complains, and onboard the next application as configuration rather than an engineering project |

**Persona coverage note.** PER-01 is the primary demo persona and the actor in the flagship workflow (F7). PER-04 is the persona who proves extensibility (F12) and operability (F11, F16) live. PER-02 and PER-03 exist to prove the same unified layer composes differently per role (F4) and enforces differently per role (F2) — they are not decoration, they are the control group.

---

## PER-01: Marcus Vale

**Role & Context:**
Marcus is a background investigator in DCSA's personnel vetting mission with eleven years on the job — six as a contract field investigator, five as a federal investigator. He carries a rolling caseload of **38–45 active cases** assigned to him through Investigation Management, weighted toward Tier 3 and Tier 5 investigations for a regional coverage area. On a typical day he touches eight to twelve cases: reviewing questionnaire content submitted through eApp, chasing issue items raised in PVQ against specific questionnaire answers, recording findings, and moving cases forward so they don't age past their due dates. He is not an analyst sitting on one case for a week; he is a throughput worker who is measured on cases closed on time and on the defensibility of what he recorded.

His work environment is split. Roughly half his week is at a government-furnished laptop at a hoteling desk in a field office, dual monitors when he can get them, single 14-inch screen when he can't. The other half is at a subject's employer site, in a hotel room, or in a car between interviews, on the same laptop over a VPN that is sometimes excellent and sometimes not. **His interruption profile is severe:** phone calls from sources, a supervisor asking for a status on a specific case, a subject calling back during the ninety-minute window they promised. He frequently has to abandon a screen mid-task and come back to it forty minutes later, and he needs the application to still know what he was doing. He is the reason F5's "return-to-queue restores your filters, sort, and page" and F3's cross-application breadcrumbs are not nice-to-haves.

Organizationally he reports to a field supervisor who sees his workload through IM, and his output flows downstream to adjudicators like PER-02 who will read what he recorded months later, out of context, and have to trust it.

**Context of Use:**

- **Where:** Field office hoteling desk (≈50%), subject/employer sites and hotels over VPN (≈40%), occasional SCIF-resident workstation for restricted material (≈10%).
- **Device:** GFE Windows laptop; dual 24-inch monitors when docked, 14-inch laptop screen when mobile. Responsive layout down to a narrow window matters because he routinely runs the browser at half-screen width beside a notes document.
- **When:** 0700–1800 with a hard end-of-day push to record everything before the day's actions age; Monday morning triage of what came in over the weekend.
- **Interruption profile:** High. Expects to resume a partially completed action after a 10–60 minute interruption without losing context or being logged out silently. Session-timeout warning and accessible re-authentication (F0) must be graceful, not punishing.
- **Connectivity:** Intermittent over VPN. A slow or unavailable spoke must degrade with a named warning (F16), not stall the page — he will assume the whole system is broken and give up otherwise.

**Goals:**

- Complete a case-advancing action that legitimately spans two systems — read the eApp questionnaire answer, resolve the PVQ issue raised against it — in one continuous sitting with one login and zero re-entry of the case or subject identifier (F7, F1, F6).
- See one authoritative answer to "what is assigned to me and what is due first," aggregated across IM, eApp, PVQ, and PDT, rather than reconstructing it from three systems and memory (F5, F4).
- Be told, not discover, when something on his caseload changes — a new PVQ issue raised against a case he owns, an item going overdue, a case becoming blocked (F15, F4).
- Leave a record of what he did that will survive scrutiny months later, including which system the change landed in and when (F13, F6).
- Never be surprised by a system that quietly didn't save something. When a cross-system write half-succeeds, he wants to be told exactly which system changed and which didn't, with a retry path (F7 partial-completion state).
- Keep working when a spoke is down, with an explicit statement of what he cannot currently see (F16).

**Pain Points:**

*These describe today's fragmented multi-application environment — the condition the product exists to end.*

- **Three logins for one task.** Advancing a single case routinely means authenticating separately to Investigation Management, eApp, and PVQ. Each system has its own session lifetime, so the one he needs third has always timed out by the time he gets there.
- **Copy-paste as an integration layer.** He keeps a scratch document open with the subject's identifier, the case number, and the PVQ issue reference, because none of the three systems will accept a reference from another. A transposed digit pasted into the wrong system is a real and recurring error class.
- **No single view of assigned work.** IM tells him what cases he owns. PVQ tells him what issue items are open, but not prioritized against his case due dates. eApp tells him which questionnaires are awaiting review. Nothing tells him what to do first, so prioritization happens by habit and by whoever called him most recently.
- **Context is lost at every boundary.** Jumping from an eApp case to the related PVQ issue means opening a second application, searching for the issue by the reference he wrote down, and re-establishing in his own head what he was trying to accomplish. The cognitive reset costs more than the clicks.
- **Correlation is manual.** To answer "what happened to this case and who touched it," he pulls activity history from each system separately and lines the timestamps up by hand. Nobody can see the cross-system action as a single event because no system recorded it as one.
- **Discovery is accidental.** A PVQ issue raised against one of his cases does not reliably surface anywhere he looks daily. He finds out when the case is already late, or when his supervisor asks.
- **Each system interprets his role its own way.** He holds different effective permissions in each application, with no single place to see what he is actually entitled to, so he occasionally invests effort in an action he turns out not to be authorized to complete.
- **Degradation is silent.** When a back-end is unhealthy, the symptom is usually an empty list, not a warning. He cannot distinguish "no items" from "the system couldn't reach the source," which means he cannot trust an empty screen.

**Technical Expertise:** Intermediate. Fluent in enterprise web applications, case management tooling, and government workflow systems; fast with keyboard shortcuts in tools he uses daily. Not a developer — no API, no command line, no interest in how the integration works, only in whether it holds. He will not read documentation to accomplish a routine task; if a control isn't discoverable he will conclude the capability doesn't exist.

**Top Tasks:**

1. **Triage the aggregated work queue and pick the next action** — daily, multiple times, critical. Opens the unified queue defaulted to "assigned to me, due date ascending," scans source attribution and status, and selects the highest-consequence item. (F5, F4)
2. **Open an eApp case, review the questionnaire section, and resolve the related PVQ issue item** — several times weekly, critical. *This is the flagship workflow (F7) and the single most important path in the product.*
3. **Record a finding or request clarification on a work item** — daily, high. Completes a USWDS form with validation and sees the confirmation name exactly what changed and in which system. (F6)
4. **Check alerts for newly raised issues, overdue items, and blocked cases on his caseload** — daily, first thing, high. (F15, F4)
5. **Review an item's full activity history before acting on it** — several times weekly, medium-high. Needs the spoke's own history merged with hub audit records so he can see the cross-system chain as one narrative. (F6, F13)

**Access Scope:**

*This section is normative input to the F2 RBAC/ABAC policy.*

| | |
|---|---|
| **May see** | Work items across IM, eApp, PVQ, and PDT **where he is the assigned investigator or the item belongs to his assigned unit/region**. Full detail for those items, including subject context, questionnaire sections referenced by an issue, and related-item relationships. His own activity history and audit records. |
| **May do** | Acknowledge assignment; record a finding; request clarification; resolve a PVQ issue item with disposition and narrative (the flagship action); advance case state where IM permits it for his role. |
| **May NOT see** | Cases assigned to other investigators or outside his region. Adjudicative determinations and adjudicator-only deliberative content. Any applicant's IEP record other than as subject context on a case he owns. The administrator console, application registry, integration error log, failure-injection controls, or the full platform-wide audit trail. |
| **May NOT do** | Render or record a trust determination. Register, enable, or disable an application. Author system announcements. View or modify another investigator's assignments. |
| **Governing attributes** | `role=investigator`; `assigned_region`; `organization`; `clearance_tier`; per-resource `case_assignment`. Resource-level check required: fetching case X verifies Marcus's entitlement to **X specifically**, not merely that investigators may fetch cases. |
| **Negative-path expectation** | A direct API call to an adjudicator-only or administrator-only endpoint, or to a case assigned to another investigator, is denied server-side with a non-enumerable error and the denial is audited (F2, F13). |

**Success Criteria:**

- Completes the eApp → PVQ resolution workflow end-to-end with **exactly one authentication event** in the audit log for the session (SM-01, SM-02).
- **Zero** manual re-entry of subject, case, or issue identifiers at any step of that workflow (SM-04).
- Both eApp and PVQ independently return the updated state when queried through their own APIs after his action (SM-03).
- Can find and open the next item he should work from the dashboard in **two clicks or fewer**.
- Work queue shows correctly attributed items from **at least four of five** spoke systems (SM-14).
- With a spoke forced offline, his queue still renders the remaining sources plus a specific named warning — **never** an error page or a blank screen (SM-15, SM-16).
- The full cross-system action is retrievable as **one correlated chain** in the audit viewer (SM-20).
- Completes the flagship workflow **keyboard-only**, start to finish (SM-08).

**Accessibility Considerations:**

- Federal workforce; assume screen-reader and keyboard-only investigators exist in this population and that reasonable-accommodation users are performing the same throughput-measured work as everyone else. Accessibility here is not an edge case, it is a coworker.
- Heavy data-table user. The work queue must expose proper header scope, captions, sortable headers that **announce sort state**, and an announced result count when filters change — otherwise the queue is unusable non-visually (F14).
- Cross-application traversal must preserve focus and announce the new context. Moving from eApp case detail to the related PVQ issue must produce a descriptive page-title change and place focus predictably, or a screen-reader user loses exactly the continuity this product claims to deliver.
- Status must never be color-only. Overdue, blocked, and resolved states need text and/or icon pairing (NFR-02).
- Degraded-system warnings and asynchronous action results must be delivered through live regions **without stealing focus** — he may be mid-form when a queue refresh completes (F14, F16).
- Action forms need programmatically associated labels, inline error messaging, and an error summary at the top of the form with in-page links to the offending fields. His resolution narrative is a long free-text field; losing it to a validation failure is a trust-destroying event.
- Works at 200% zoom and in a half-width browser window at 320px equivalent without horizontal scrolling or loss of function (NFR-16).

---

## PER-02: Dana Okonkwo

**Role & Context:**
Dana is an adjudicator at a consolidated adjudication facility, rendering trust determinations on completed investigative material. Where Marcus produces the record, Dana consumes it and decides. She works a queue of **15–25 cases pending determination** at any time, typically spending 25–90 minutes per case depending on whether issue items were raised and how cleanly they were resolved. Her decisions are the point at which the government says yes or no to an individual's eligibility, and every determination she makes must be defensible on the record — to a reviewing authority, to an appeal, and to an inspector general years later.

Her reading pattern is fundamentally cross-system. To adjudicate one subject she needs: the eApp questionnaire as submitted, every PVQ issue item raised against it **and how each was dispositioned**, the PDT position designation that set the investigation tier in the first place (because adjudicating against the wrong tier is a finding against her), and the IM case record showing investigative completeness and chain of activity. Four systems, one decision, and today there is no single screen that shows all four.

She works almost entirely from a fixed desk workstation in a controlled facility, dual or triple monitors, long uninterrupted reading blocks. **Her interruption profile is low but her context depth is high** — she holds an enormous amount of case detail in working memory across a 45-minute read, and anything that forces her to re-establish that context is expensive. She is also acutely aware of aging: determinations have timeliness metrics, and a case sitting in her queue because she is waiting on a clarification from an investigator is a case she needs surfaced, not buried.

**Context of Use:**

- **Where:** Fixed workstation in a controlled adjudication facility; occasionally a SCIF workstation for restricted material.
- **Device:** GFE desktop, two or three large monitors. Reads long documents side by side. Rarely mobile, never on a phone.
- **When:** Sustained 0800–1630 reading and decision blocks; end-of-month push on aging determinations.
- **Interruption profile:** Low frequency, high cost. Interruptions are supervisory queries and clarification callbacks from investigators. She needs to leave a case and return to precisely the same reading position and filter context.
- **Connectivity:** Stable. Her tolerance for a slow page is nonetheless low, because she is reading, and latency compounds across a 25-case day.

**Goals:**

- Assemble the complete cross-system picture for one subject — eApp questionnaire, PVQ issue dispositions, PDT designation and tier, IM case completeness — on one screen path without four logins (F5, F6, F7 related-items panel, F1).
- See the **disposition and narrative** an investigator recorded against each issue item, not just that an issue existed and closed. The quality of her determination depends on the quality of that record. (F6, F13)
- Know which of her pending determinations are aging and which are blocked awaiting someone else, so timeliness is managed by evidence rather than by end-of-month panic (F4, F5, F15).
- Record a determination with a durable, correlated audit record naming her as actor, at that moment, with the attributes she held at the time (F13, F6).
- Distinguish reliably between "no issues were raised on this case" and "the system that holds the issues is currently unreachable." Adjudicating on incomplete data because a spoke was quietly down is a career-relevant error. (F16)

**Pain Points:**

*These describe today's fragmented multi-application environment.*

- **Four systems, one decision, no shared view.** She logs into eApp, PVQ, PDT, and IM separately for a single subject and assembles the picture herself, on paper or in a side document. The assembly is the work, and it is unbillable.
- **Separate logins with mismatched session lifetimes.** By the time she has read the questionnaire in eApp, her PVQ session has expired. She re-authenticates multiple times per case, several times a day.
- **Correlation by identifier, by hand.** The PVQ issue references a case; the case references a subject; the PDT designation references a position. Nothing resolves those references for her, so she re-searches each system with an identifier she copied from the last one.
- **Investigator findings arrive without their context.** She reads a resolution narrative in PVQ with no ability to see, in the same place, the questionnaire answer it was raised against. The relationship exists in the data and not in her screen.
- **No cross-system timeline.** Reconstructing "what happened on this case, in what order, across which systems" requires exporting activity from each system and merging timestamps manually — which she does only when a case is contested, meaning she usually decides without it.
- **Aging is invisible until it's a metric.** Nothing aggregates her pending determinations by age across systems. She learns a case is late from a report, not from her workspace.
- **Silent incompleteness.** An empty issue list in PVQ looks identical whether the subject genuinely has no issues or the service is degraded. She has no way to tell, and the cost of getting that wrong is asymmetric.
- **Role ambiguity across systems.** She has read access to things in one system she cannot see in another, with no consistent explanation, so she is never confident she has seen everything she is entitled to see.

**Technical Expertise:** Intermediate. Deep domain expertise, high tolerance for dense information, comfortable with complex filterable interfaces and long-form reading UIs. Not technical in the engineering sense and has no interest in the integration mechanics — but she is unusually sensitive to *data provenance*, and she will ask which system a given field came from. Source-system attribution on every row and every detail panel (F5, F6) is a credibility requirement for her, not a nicety.

**Top Tasks:**

1. **Open a pending determination and review the complete cross-system record for the subject** — several times daily, critical. eApp questionnaire → PVQ issues and dispositions → PDT designation/tier → IM case status, via the related-items panel rather than four searches. (F6, F5)
2. **Record a determination or return a case for additional investigation** — several times daily, critical. Server-authorized action, validated form, confirmation naming the affected system, audit record written before success returns. (F6, F13)
3. **Review her pending queue by age and due date to manage timeliness** — daily, high. Sort and filter across sources with clear date semantics. (F5, F4)
4. **Read the correlated activity history for a contested or complex case** — weekly, high. One chain, one narrative, across systems. (F13, F6)
5. **Request clarification from the assigned investigator and track that the case is blocked pending response** — weekly, medium-high. (F6, F15)

**Access Scope:**

| | |
|---|---|
| **May see** | Completed and in-adjudication cases **within her adjudicative queue and organizational scope**, including the eApp questionnaire content, PVQ issue items with dispositions and narratives, PDT designations and resulting tiers, and IM case status/completeness for those subjects. Broader read across the four mission spokes than PER-01, because adjudication requires the whole picture — but scoped by organization and clearance tier, not unlimited. Her own activity history. |
| **May do** | Record a determination; return a case for additional investigation; request clarification; annotate the adjudicative record. Read-heavy by design — her write surface is narrow and consequential. |
| **May NOT see** | Cases outside her adjudicative assignment or above her clearance tier. Investigator-only working notes where the domain model marks them as such. Applicant IEP self-service content. The administrator console, registry, integration error log, failure-injection controls, or the platform-wide audit trail. |
| **May NOT do** | Perform investigator actions — she cannot resolve a PVQ issue item herself; that is PER-01's action and the distinction must be visible in the demo. Register or configure applications. Author announcements. Modify another adjudicator's determinations. |
| **Governing attributes** | `role=adjudicator`; `organization`; `clearance_tier`; adjudicative queue assignment. Action-level authorization matters most here: she may legitimately **view** a PVQ issue item that she may not **resolve**. |
| **Negative-path expectation** | Opening the same PVQ issue work item as PER-01 must present a **different server-computed action set**. That side-by-side is the clearest live demonstration of action-level RBAC in the whole product and should be in the demo script (F18 secondary scripts). |

**Success Criteria:**

- Reaches every artifact needed for one determination — questionnaire, issue dispositions, designation/tier, case status — **without leaving the unified shell and without re-authenticating**.
- Can state, for any field on screen, which spoke system it came from (source attribution present on 100% of work-item rows and detail panels).
- Views the same work item as PER-01 and sees a demonstrably different, server-computed set of available actions (F2, F6).
- Cross-system activity for a case renders as a **single correlated chain** rather than four disconnected histories (SM-20).
- When PVQ is unavailable, she sees a specific named warning stating that issue data is missing — never an empty list that reads as "no issues" (SM-15, NFR-10).
- Her pending queue answers "what is aging" without her building a report.

**Accessibility Considerations:**

- Long-form reading is her core activity. Correct heading hierarchy, landmark regions, and descriptive page titles are what make a dense adjudication record navigable by screen reader and by keyboard-only power users who navigate by headings (F14, F3).
- Multi-source detail pages need clear programmatic grouping — fieldset/legend and section landmarks — so a non-visual user can tell where eApp content ends and PVQ content begins. Source attribution must be in the accessible name, not conveyed only by a colored badge.
- Sortable, filterable queue tables must announce sort state and result counts (F14). She sorts constantly.
- Determination forms are high-consequence and long. Error summary with focus management and in-page links to offending fields is mandatory; a lost narrative is a lost hour.
- Zoom to 200% without loss of function — magnification users are common in a reading-intensive workforce (NFR-16).
- Status conveyed by text and icon, never color alone (NFR-02). "Resolved," "open," "returned," and "overdue" must be distinguishable in grayscale.

---

## PER-03: Renée Ashford

**Role & Context:**
Renée is the individual being vetted. In the seeded demo she is a **non-government-affiliated, private-sector employee** — a systems engineer at a cleared defense contractor undergoing an initial Tier 3 investigation because her new position requires eligibility she does not yet hold. Her start date on billable work depends on this process completing. She has never been through vetting before and has no mental model of DCSA's internal system boundaries; to her, "the government" is one entity that is asking her for things.

The Applicant persona in this product is deliberately broad: the same role and the same screens serve **industry/private-sector applicants, federal employees, military members, and DoW civilians**. Renée is the hardest variant of that set and is therefore the design target — she has the least institutional context, the least tolerance for jargon, and the highest anxiety, because a delay she doesn't understand is a paycheck she doesn't receive. If the experience works for her it works for a re-investigating military member who has done this three times before.

She interacts with the process in short, anxious bursts: fifteen minutes at lunch, twenty minutes after her kids are in bed. **Her interruption profile is high and her sessions are short**, often on a personal laptop and frequently on a phone. She is not a daily user; she may not return for eleven days and will have forgotten everything about the interface when she does. She needs the product to re-orient her in seconds, in plain language, every single time.

**Context of Use:**

- **Where:** Home, personal device; occasionally her employer's office on a break. Never in a government facility, never on GFE.
- **Device:** Personal laptop and — importantly — a **phone**. Mobile responsiveness is not theoretical for this persona; a meaningful share of applicant sessions are "check status on my phone while waiting for something else." Responsive down to 320px with no horizontal scroll is a real requirement for her (NFR-16).
- **When:** Evenings and weekends, short sessions, often weeks apart.
- **Interruption profile:** Very high, low-stakes interruptions — a child, a doorbell. She abandons and resumes. A session timeout that discards her progress without warning is the single fastest way to lose her.
- **Connectivity:** Home broadband and cellular. Tolerant of slowness, intolerant of ambiguity.

**Goals:**

- Get a single, plain-language answer to **"where am I in this process, and what do I owe you next"** — without knowing or caring that the answer is assembled from IEP and eApp (F4 application-status widget, F5).
- See her outstanding tasks as a short, ordered, unambiguous list with due dates, not a systems inventory (F4, F5).
- Receive and read notices in the same place she checks status, rather than in an email she has already lost (F15).
- Submit what is asked of her and receive a confirmation that plainly states it was received and what happens next (F6).
- See a history of what she has submitted and when, so she can answer her security officer's "did you send that in?" with evidence rather than memory (F6 activity history, F13 scoped to self).
- Be confident, at a glance, that she is seeing **only her own information** — and equally, that nobody else is seeing it. Privacy legibility matters to an applicant.

**Pain Points:**

*These describe today's fragmented multi-application environment.*

- **The status lives somewhere other than the form.** She completed a questionnaire in one system, and the status of that questionnaire is reported in another, with different terminology for the same state. She cannot tell whether the two screens are describing the same thing.
- **Separate credentials for the pieces of one process.** A login for the questionnaire, a different login for the portal that sends her notices. She has reset at least one of those passwords twice, and each reset costs her an evening.
- **Nobody tells her what is next.** She learns she owes something when a deadline has nearly passed, usually through a forwarded email from her facility security officer rather than from the systems themselves.
- **Process jargon as a status display.** Internal state names, tier codes, and system-specific abbreviations are presented to her as if she should know them. "Pending SOI transmittal" is not a status; it is a barrier.
- **No single history.** She cannot prove what she submitted or when without searching her email.
- **Uncertainty as the default state.** Long silences with no visible progress indicator lead her to assume something is wrong and to call her security officer — generating work for three other people to answer a question the interface should have answered.
- **No confidence about scope.** She has no visible assurance that the system is showing her only her own record, which is unsettling when the record contains her most sensitive personal information.

**Technical Expertise:** Intermediate as a general computer user, **novice with respect to this domain**. Professionally technical, but she has zero familiarity with DCSA process vocabulary, zero knowledge of which system owns which step, and no patience for learning either. Design for her as a competent adult encountering an unfamiliar bureaucracy for the first time — plain language, explicit next steps, no unexplained acronyms, no internal state names surfaced raw.

**Top Tasks:**

1. **Check overall application status in plain language** — the reason for ~70% of her sessions, critical. Sourced from IEP and eApp, presented as one progress narrative, not two system statuses. (F4)
2. **See and complete outstanding tasks** — episodic, critical. A short ordered list with due dates and a clear entry point into the action. (F5, F6)
3. **Read notices addressed to her** — episodic, high. In-app, retained, with read state. (F15)
4. **Submit a response or additional information and get a real confirmation** — a few times per process, critical. Confirmation must name what was received and what happens next. (F6)
5. **Review what she has already submitted and when** — occasional, medium, but high-reassurance value. (F6, F13 self-scoped)

**Access Scope:**

*This is the strictest scope in the product and the most important negative test.*

| | |
|---|---|
| **May see** | **Her own records only.** Her IEP status, notices, and outstanding tasks. Her own eApp submission and its status. Her own submission/activity history. |
| **May do** | Submit a response; acknowledge a notice; complete an assigned task; update her own contact information where the domain model permits. |
| **May NOT see** | Any other individual's record, under any circumstance. Investigative content, investigator notes, or findings about her. PVQ issue items raised against her answers (the issue-resolution workflow is a mission-user surface and is deliberately not exposed to the applicant). PDT designations. IM case records, assignment, or investigator identity. Adjudicative deliberation. The administrator console or any platform-wide audit view. |
| **May NOT do** | Any investigator or adjudicator action. Any administrative action. Any read of a work item not owned by her identity. |
| **Governing attributes** | `role=applicant`; `subject_identity`. **Every** read must be resource-level entitlement-checked against her subject identity — route-level checks are insufficient and would be a defect. |
| **Negative-path expectation** | **This is the headline zero-trust demonstration (PRD F2 acceptance signal).** An authenticated Applicant calling an Investigator-only endpoint directly — or calling a legitimate endpoint with another subject's resource ID — is denied **server-side**, receives a consistent non-enumerable error that does not reveal whether the resource exists, and the denial is written to the audit trail. This should be shown live via curl in the demo (F18 secondary scripts). |

**Success Criteria:**

- Can answer "where am I and what do I owe next" within **30 seconds of signing in**, on a phone, without scrolling past a fold of jargon.
- **Zero** internal system names, tier codes, or state abbreviations presented to her without plain-language explanation. She should not need to know that eApp and IEP are different things.
- Every outstanding task links directly to the action that discharges it — no dead ends, no "contact your security officer" as a primary path (NFR-14).
- A submission produces a confirmation that names what was received and what happens next; the submission then appears in her own history.
- A direct API attempt to read another subject's record is denied and audited (SM-18).
- Her dashboard is **visibly and substantively different** from the three mission-role dashboards — same product, different composition (F4 acceptance signal, SM-23).

**Accessibility Considerations:**

- **The widest accessibility exposure in the product.** Applicants are the general public and the entire cleared workforce; the population includes screen-reader users, keyboard-only users, magnification users, users with cognitive and reading disabilities, and users whose disability is directly relevant to what the vetting process is asking about. Section 508 obligations are at their most consequential here, and a failure on this surface is the one most likely to be noticed externally.
- **Plain language is an accessibility requirement**, not just a tone preference. Short sentences, defined terms, no unexplained acronyms, explicit next action.
- Mobile and small-viewport support is a genuine access path for her, not a responsive-design checkbox: usable at 320px width, at 200% zoom, with touch targets of adequate size (NFR-16, F14).
- Forms must have programmatically associated labels, described-by hint text for anything ambiguous, required-field indication that is not color-only, inline errors, and an error summary with focus management. She is entering personal detail she may find uncomfortable to disclose; a confusing validation error compounds that.
- Session timeout requires a clear warning and an accessible re-authentication path that **does not discard entered data** — her sessions are short and interrupted, and she will be timed out (F0).
- Status progress must be conveyed by text and structure, not by a color-coded graphic alone (NFR-02).
- Notices and asynchronous updates delivered via live regions without stealing focus (F14, F15).

---

## PER-04: Priya Raghunathan

**Role & Context:**
Priya is the platform administrator for the unified layer itself — an IT operations lead in the Integrated Enterprise program office rather than a mission user. She does not investigate, adjudicate, or apply. She is responsible for the thing all three of those people depend on: which applications are connected, whether they are healthy, where integration is failing, who has which role, and what it takes to bring the next application onto the hub.

She is the persona who proves the product's two architectural claims. She runs F11 (inventory, health, integration error log) to prove the platform is **operable**, and she runs F12 (register the sixth application live, through the UI, with zero code changes and zero restarts) to prove it is **extensible**. In the demo she is also the operator of the failure-injection controls (F16) — she is the one who takes Investigation Management offline on purpose so an evaluator can watch Marcus's queue degrade visibly instead of blankly, and then restores it and watches the warning clear without anyone reloading or re-authenticating.

Her working rhythm is monitoring punctuated by incident. Most of the day she is in other tools; she checks the console at start of day and whenever something is reported. **Her interruption profile is bursty** — long quiet periods, then a high-urgency window where she needs to establish, fast, whether a user's complaint is a spoke outage, an adapter misconfiguration, an authorization denial, or user error. Today, answering that question means correlating logs from several systems by hand. She is also the person who will be asked, after any incident, "who did what, to what, when" — and she needs that answer to be one query, not an afternoon.

**Context of Use:**

- **Where:** Government office or approved telework, fixed workstation.
- **Device:** GFE laptop, dual monitors, console open alongside ticketing and chat.
- **When:** Start-of-day health check; on-demand during incidents; scheduled work when onboarding an application. During a live demo, she drives the extensibility and resilience segments.
- **Interruption profile:** Bursty. Long monitoring lulls, then urgent diagnostic windows where time-to-answer is the metric.
- **Connectivity:** Stable, but she is deliberately exercising unstable spokes — the product must behave correctly when the thing being observed is broken on purpose.

**Goals:**

- Know the state of every connected application — healthy, degraded, unavailable, with latency and check history — **before** a user reports a problem (F11, F16).
- Diagnose an integration failure from one place: a filterable error log with timestamp, application, operation, error class, correlation ID, and affected principal, linked to the corresponding audit entries (F11, F13).
- Onboard a new application as a **configuration action performed live in the UI** — identity, connection, capability discovery via `describe()`, role access, live connection test, confirm — with no code change, no redeploy, no restart (F12, F8).
- Answer "who did what, to what, when" across systems as a single correlated chain rather than a manual log merge (F13).
- See which synthetic identities hold which roles and attributes, and have every change to that recorded in the audit trail (F11, F2).
- Communicate to users through targeted system announcements rather than email blasts (F11, F15).
- Demonstrate resilience deliberately: induce failure, observe the specific degraded warning, restore, observe automatic recovery (F16).

**Pain Points:**

*These describe today's fragmented multi-application environment.*

- **No consolidated view of what is connected or healthy.** Application health is checked per system, by different teams, with different definitions of "up." There is no inventory that answers "what is attached to this platform right now."
- **Problems are discovered by user complaint.** The first signal that an integration is failing is Marcus calling to say his queue is empty. By then the incident has been running for an hour and has an audience.
- **Diagnosis is manual log correlation.** A single user-reported failure means pulling logs from the hub and from each candidate system and lining up timestamps by hand, with nothing tying the records to one another. There is no correlation ID because nothing ever issued one.
- **Onboarding an application is a bespoke engineering project.** Every new integration is custom code, a new deployment, and a new set of assumptions, because there is no repeatable integration contract and no registry. The cost is the reason the ecosystem stays fragmented — which makes this her most strategically important pain point.
- **Auditability is per-system.** Reconstructing a cross-system action for an inquiry means correlating multiple logs by hand, and the result is an assertion rather than a record.
- **Role and attribute assignment is opaque and scattered.** Each system interprets roles on its own terms, so "what is this user actually entitled to" has no single answer — and neither does "who granted that."
- **Degradation cannot be rehearsed.** There is no way to induce a controlled failure, so resilience behavior is untested until it is production.
- **Sustainment cost compounds invisibly.** Every change touches a system never designed to change in concert with its neighbors, and nothing in her tooling makes that cost legible to the people funding it.

**Technical Expertise:** Expert. Comfortable with APIs, correlation IDs, health endpoints, circuit breakers, timeout and retry policy, and reading raw error classes. She will inspect the OpenAPI documentation (F10), call endpoints directly with curl, and attempt to break the authorization model deliberately — and she is exactly the reviewer archetype an evaluator will emulate. **Administrators are not exempt from authorization or audit** (F11): her own console actions must be authorized server-side and written to the audit trail, and she should be able to see her own entries there.

**Top Tasks:**

1. **Review the connected-applications inventory and per-application health at start of day** — daily, critical. Status, last successful check, latency, recent history, all read from the registry (F11, F8, F16).
2. **Register the sixth application through the guided UI flow** — rare in production, **central to the demo**, critical. Identity → connection → capability auto-discovery via `describe()` → role access → live connection test → confirm, and it appears immediately in inventory, health monitoring, role navigation, and the work queue with no restart (F12, SM-11, SM-12).
3. **Triage an integration failure from the error log** — as needed, high. Filter, identify the correlation ID, follow it into the audit chain, run a manual "test connection," decide whether to disable the application (F11, F13).
4. **Induce and then restore a spoke failure to verify degraded-system behavior** — during rehearsal and demo, high. Confirms a named warning appears, no error page occurs anywhere, and recovery is automatic (F16, SM-15, SM-17).
5. **Query the audit trail for a cross-system action and read it as one correlated chain** — as needed, high. Filter by actor, role, action type, target system, resource, outcome, and date range (F13, SM-20).
6. **Author and target a system announcement by role** — occasional, medium. Appears on the right dashboards, dismissible per user, never obscuring the demo banner (F11, F15).

**Access Scope:**

| | |
|---|---|
| **May see** | The full application registry and every application's configuration, health, and check history. The complete integration error log. The **platform-wide audit trail**, including authentication events, authorization denials, registration changes, and adapter failures. Synthetic identity inventory with assigned roles, attributes, and recent activity. Announcement management. Failure-injection controls (administrator-only, demo-scoped). |
| **May do** | Register, edit, enable, disable, and de-register applications; run manual connection tests; author, edit, expire, and target announcements; view and export filtered audit views; operate failure-injection controls. All of it authorized server-side and audited. |
| **May NOT see** | **Mission work-item content.** Administrative privilege on the platform is deliberately *not* privilege over case content: she does not get investigative findings, adjudicative determinations, questionnaire answers, or applicant PII merely because she administers the hub. This separation is a defensible-design point worth stating explicitly in the demo. |
| **May NOT do** | Perform investigator, adjudicator, or applicant actions on work items. Modify or delete audit records — **no application path exists** for this, for anyone, and its absence is verified by test (NFR-07). |
| **Governing attributes** | `role=administrator`; `organization`. Platform-scoped, not mission-scoped. |
| **Negative-path expectation** | An administrator attempting to read a mission work item's content, or to mutate an audit record through any application path, is denied — and the attempt is itself audited. "Administrators are not exempt" is a demonstrable claim, not a policy statement. |

**Success Criteria:**

- Registers the sixth application live through the UI in **under 5 minutes**, with zero code changes and zero restarts (SM-11).
- The newly registered application appears **immediately** in admin inventory, health monitoring, role-scoped navigation, and the unified work queue — and PER-01 sees its work items in his queue without signing out (SM-12).
- Removing an application from the registry removes it cleanly from navigation, queue, and console with no code change and no errors (F8 acceptance signal).
- An induced adapter failure produces a correctly attributed entry in the integration error log **within one health-check interval** (F11 acceptance signal).
- A forced spoke outage produces a visible, specific degraded warning across the product and **no error page anywhere** (SM-15); restoring the spoke clears the warning without user reload or re-authentication (SM-17).
- Any cross-system user action is retrievable as a **single correlated chain** in the audit viewer (SM-20).
- Her own console actions appear in the audit trail attributed to her (F11 — administrators are not exempt).

**Accessibility Considerations:**

- Administrators are federal employees and the population includes screen-reader and keyboard-only users. An operations console is a frequent and unexamined accessibility failure point precisely because it is assumed to be "internal tooling" — it is not exempt from Section 508 and must not be treated as second-class (F11: console tables follow the same accessible patterns as F5).
- Console data tables — inventory, health history, error log, audit viewer — need header scope, captions, sort-state announcement, accessible pagination, and announced result counts. The audit viewer is the densest table in the product and the one an evaluator is most likely to inspect.
- The multi-step registration wizard (F12) must have accessible step indication, per-step validation with an error summary and focus management, a keyboard-operable live connection test whose **result is announced via a live region**, and no reliance on drag, hover, or pointer-only interaction.
- Health status must never be color-only: healthy/degraded/unavailable each need a text label and/or icon (NFR-02). A red/green dot alone is a conformance failure and an operational hazard.
- Destructive actions — disable, de-register — need accessible confirmation dialogs that trap focus correctly and restore it on close (F14).
- Correlation IDs must be selectable and copyable text, not images or truncated cells without an accessible full value; she copies them into tickets constantly.

---

## Persona Relationships

| Persona | Interacts With | Nature of Interaction |
|---------|---------------|----------------------|
| PER-01 Investigator | PER-02 Adjudicator | **Producer → consumer of the record.** Marcus's issue dispositions, resolution narratives, and findings are the material Dana adjudicates weeks or months later, out of context. Dana returns cases to Marcus for additional investigation and requests clarification; those requests arrive in his unified queue as work items, and his responses unblock her determination. Neither can perform the other's actions on the same work item — the visible difference in their server-computed action sets is the product's clearest live RBAC demonstration. |
| PER-01 Investigator | PER-03 Applicant | **Investigator acts on the applicant's record; they do not share a screen.** Renée is the *subject* of Marcus's cases. He sees her submission as case context; she never sees his findings, his notes, or even that a PVQ issue was raised against one of her answers. Their only mediated touchpoint is a request for information that surfaces to her as an outstanding task in IEP and to him as a pending item in his queue. This asymmetry is a deliberate access-control boundary, not an oversight. |
| PER-02 Adjudicator | PER-03 Applicant | **Decision-maker and subject, fully mediated.** Dana's determination changes Renée's status; Renée experiences it as a plain-language status change and a notice, with no visibility into deliberation. Dana sees the complete cross-system record; Renée sees only her own status, tasks, and notices. |
| PER-04 Administrator | PER-01, PER-02, PER-03 | **Platform provider to all mission users.** Priya's registry determines which applications appear in their navigation and queues; her health monitoring determines whether they see complete data or a named degraded warning; her announcements appear on their dashboards. When any of them reports "my queue is empty," she is the one who determines whether that is an outage, a misconfiguration, an authorization denial, or a genuinely empty queue. Critically, she administers the platform **without** access to their mission content. |
| PER-04 Administrator | PER-01 Investigator | **The extensibility proof, demonstrated as a pair.** Priya registers the sixth application live (F12); Marcus, still signed in and without reloading, sees its work items appear in his unified queue. Two personas, one uninterrupted demo beat — this is SM-11 and SM-12 rendered as a story rather than a claim. |
| PER-02 Adjudicator | PER-04 Administrator | **Audit and inquiry.** When a determination is contested, Dana needs the correlated cross-system chain for the case; Priya holds the platform-wide audit trail and the export capability. Dana sees her own activity; Priya sees the full trail — and Priya's own access to it is itself audited. |

---

## Feature-Persona Matrix

**Legend:** **Primary** — the persona is a principal user of this feature and its design is driven by their needs. **Secondary** — the persona uses or benefits from the feature but does not drive its design. **—** — not applicable to this persona.

| Feature | PER-01 Investigator | PER-02 Adjudicator | PER-03 Applicant | PER-04 Administrator |
|---------|--------|--------|--------|--------|
| **F0:** Simulated Multi-Method MFA Authentication | Primary | Primary | Primary | Primary |
| **F1:** Unified Session and SSO Across All Spokes | **Primary** | Primary | Secondary | Secondary |
| **F2:** Role- and Attribute-Based Access Control (server-side) | Primary | Primary | **Primary** | **Primary** |
| **F3:** Unified Navigation Shell and Global Chrome | Primary | Primary | Primary | Primary |
| **F4:** Role-Specific Personalized Dashboard | Primary | Primary | **Primary** | Primary |
| **F5:** Unified Work Queue | **Primary** | Primary | Secondary | Secondary |
| **F6:** Work-Item Detail and Action Completion | **Primary** | Primary | Primary | — |
| **F7:** **Flagship Cross-Application Workflow (eApp → PVQ)** | **PRIMARY — sole actor** | Secondary (consumes the resulting disposition) | — (subject of, never actor in) | Secondary (observes the correlated audit chain) |
| **F8:** Adapter Framework and Data-Driven Registry | Secondary (benefits: queue fan-out, attribution) | Secondary | — | **Primary** |
| **F9:** Five Simulated Spoke Services, Isolated Namespaces | Secondary (source of his work) | Secondary | Secondary (IEP, eApp only) | Primary |
| **F10:** Unified Layer API (Backend-for-Frontend) | Secondary (via UI) | Secondary (via UI) | Secondary (via UI) | **Primary** (calls it directly) |
| **F11:** Administrator Console — Apps, Health, Errors | — | — | — | **Primary** |
| **F12:** Application Registration and Onboarding Flow | Secondary (sees new app's items appear in queue) | Secondary | — | **Primary — sole actor** |
| **F13:** Immutable Audit Trail and Audit Viewer | Secondary (own activity, item history) | Primary (correlated case chain) | Secondary (own submission history) | **Primary** (platform-wide trail) |
| **F14:** USWDS v3 Accessible Interface (508 / WCAG 2.1 AA) | Primary | Primary | **Primary** (widest exposure — general public) | Primary (console is not exempt) |
| **F15:** Notifications, Alerts, and System Announcements | **Primary** (new PVQ issues, overdue, blocked) | Primary (aging determinations) | Primary (notices, task reminders) | **Primary** (authors announcements) |
| **F16:** Health Monitoring, Resilience, Degraded-System UX | Primary (must keep working when a spoke is down) | Primary (must never mistake outage for "no issues") | Secondary | **Primary** (operates monitoring and failure injection) |
| **F17:** Synthetic Seed Data Corpus | Primary (caseload across 4 spokes, incl. flagship issue) | Primary (completed cases, dispositions, designations) | Primary (her own IEP/eApp records) | Primary (identities, roles, attributes, registry) |
| **F18:** Demo Operability — Single Command + Demo Script | Primary (starting persona of the flagship script) | Secondary (RBAC comparison script) | Secondary (RBAC negative-path script) | Primary (registration + resilience scripts) |
| **F19:** Automated Test and Accessibility Verification Suite | Secondary (flagship E2E asserts his path) | Secondary (RBAC action-set tests) | Secondary (cross-tenant denial tests) | Secondary (adapter conformance, a11y crawl) |

**Coverage check:** all twenty features (F0–F19) map to at least one Primary persona; no persona is Primary on fewer than eight features; and each persona is the **sole or dominant** Primary on at least one feature — PER-01 on F7, PER-02 on the F6/F13 adjudicative-record path, PER-03 on F2's strictest scope and F4's plain-language composition, PER-04 on F11 and F12. No two personas share an identical column, which is the structural evidence that the four roles are genuinely distinct rather than four labels on one user.

---

## Traceability Notes

| Persona | Derived From (PRD) | Grounding Evidence |
|---|---|---|
| PER-01 Investigator | PRD §3 Target Users — "Investigator — Primary demo persona"; §2 mission-user pain; F7 | Caseload from IM, questionnaire review from eApp, issue items from PVQ; prioritized queue; defensible record |
| PER-02 Adjudicator | PRD §3 Target Users — "Adjudicator"; §2 mission-user pain; F5/F6/F13 | Reviews completed investigative material; needs cross-system case status, due-date visibility, and the same continuity guarantee across eApp/PVQ/IM |
| PER-03 Applicant | PRD §3 Target Users — "Applicant"; §2 "For applicants and individuals in the vetting process"; F2 acceptance signal | Plain-language status, outstanding tasks, notices from IEP and eApp; sees only own records; the canonical cross-role denial test |
| PER-04 Administrator | PRD §3 Target Users — "Administrator"; §2 "For administrators and the agency"; F11/F12/F13/F16 | Inventory of connected applications, per-application health, integration error log, audit trail, application registration |

**Assumptions carried from the PRD.** The ABAC attribute taxonomy used in the Access Scope sections — `organization`, `clearance_tier`, `assigned_region`, `case_assignment`, `subject_identity` — is the synthetic taxonomy flagged as **Q-05** in PRD §11. It demonstrates the mechanism; the real DCSA attribute taxonomy is a discovery output. The eApp↔PVQ relationship semantics underpinning PER-01's flagship task follow **Q-04**. Accessibility expectations throughout assume USWDS v3 with token-based theming per **Q-01**, which remains open pending Attachment 1.

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-09-14*
