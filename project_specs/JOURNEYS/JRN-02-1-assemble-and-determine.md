
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
