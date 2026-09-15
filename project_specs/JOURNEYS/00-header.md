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
