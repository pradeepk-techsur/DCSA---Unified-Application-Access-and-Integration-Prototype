## Coverage Analysis

### Persona Coverage

Who can do **meaningful work** — not merely sign in — at the end of each release.

| Persona | R1 | R2 | R3 |
|---|---|---|---|
| **PER-01** Investigator | ✅ **Full.** Flagship journey end to end, plus triage. 44 stories. | ✅ Full + failure classification, search, region/tier enforcement. +5 | ✅ Full + degradation, recovery, sixth source in an open session. +8 |
| **PER-02** Adjudicator | ❌ None. Authentication only; no dashboard, no determination. | ✅ **Full.** Determination journey and the action-set difference. +12 | ✅ Full + the empty-vs-degraded distinction her risk profile depends on. +4 |
| **PER-03** Applicant | ❌ None. Her sign-in method itself is R2. | ✅ **Full.** Status, task, notice, proof, and the headline denial. +11 | ✅ Full + designed empty states, accessibility statement. +3 |
| **PER-04** Administrator | ◐ **Partial — verifier only.** Starts the prototype, drives the script, queries spokes directly, reads the chain. No console. | ◐ Partial — gains the filterable audit viewer. Still no operations surface. +5 | ✅ **Full.** Inventory, health, error log, registration, failure injection, announcements. +34 |

**Deliberate R1 exclusion.** Two of four personas cannot work at the end of R1. That is the cost of the walking-skeleton rule and it is paid knowingly: an R1 that served all four personas thinly would be an R1 in which the flagship journey was not yet reliable, and the flagship journey is the only thing the charter says must work.

---

### JTBD Coverage

| JTBD ID | Persona | First addressed | Stories carrying it | NaC derived |
|---|---|---|---|---|
| **JTBD-01.1** *(flagship)* | PER-01 | **R1** | US-001, US-002, US-009, US-016, US-021, US-022, US-055, US-059…US-069, US-077, US-109 | **10** |
| JTBD-01.2 | PER-01 | R1 | US-033, US-039, US-040…US-047, US-119 | 5 |
| JTBD-01.3 | PER-01 | R1 | US-053, US-056, US-068, US-083, US-101, US-106 | 4 |
| JTBD-01.4 | PER-01 | R2 *(US-130)* → **R3** | US-037, US-048, US-058, US-073, US-115, US-126, US-127, US-128, US-130, US-132 | 6 |
| JTBD-02.1 | PER-02 | R2 | US-011, US-030, US-041, US-044, US-050, US-055, US-056, US-114 | 4 |
| JTBD-02.2 | PER-02 | R2 | US-013, US-017, US-019, US-051, US-057, US-101, US-102, US-104, US-105, US-146 | 5 |
| JTBD-02.3 | PER-02 | R2 | US-034, US-039, US-042, US-043, US-057, US-120, US-121 | 3 |
| JTBD-02.4 | PER-02 | R2 *(US-049)* → **R3** | US-038, US-049, US-058, US-124, US-126, US-127, US-129 | 3 |
| JTBD-03.1 | PER-03 | R2 | US-003, US-004, US-015, US-028, US-035, US-116 | 4 |
| JTBD-03.2 | PER-03 | R2 | US-006, US-052, US-053, US-057, US-113, US-117 | 4 |
| JTBD-03.3 | PER-03 | R2 | US-115, US-121, US-122, US-123 | 3 |
| JTBD-03.4 | PER-03 | R1 *(US-007, US-015, US-107)* → **R2** | US-005, US-007, US-015, US-018, US-020, US-024, US-103, US-105, US-107 | 5 |
| **JTBD-04.1** *(extensibility)* | PER-04 | R1 *(US-070, US-076, US-080, US-136, US-138, US-140)* → **R3** | US-070, US-071, US-074, US-094…US-100, US-147 | 5 |
| JTBD-04.2 | PER-04 | R1 *(US-137, US-145)* → **R3** | US-036, US-086, US-087, US-090, US-125, US-131, US-132, US-149, US-151 | 4 |
| JTBD-04.3 | PER-04 | R2 *(US-082)* → **R3** | US-025, US-082, US-084, US-088, US-089, US-091, US-103, US-105, US-139, US-144 | 5 |
| JTBD-04.4 | PER-04 | R1 *(US-014, US-081)* → **R3** | US-014, US-023, US-081, US-093, US-102, US-103, US-104, US-108, US-131, US-141, US-143, US-148 | 4 |

**All 16 jobs are addressed.** 74 NaC derived across them. The flagship job JTBD-01.1 carries 10 — the heaviest derivation in the map, which is correct: it is the job with the most stages, the most failure modes, and the most at stake in a live evaluation.

---

### PRD Feature Coverage — F0 through F19

Every PRD feature appears in at least one epic and at least one release. Epic numbering deliberately matches PRD feature numbering, so a feature can never drift from its epic.

| Feature | Epic | Stories | First release | Complete by | Backbone step(s) where it is observable |
|---|---|---|---|---|---|
| F0 Simulated Multi-Method MFA | Epic 0 | US-001…008 | **R1** | R2 | Authenticate |
| F1 Unified Session and SSO | Epic 1 | US-009…014 | **R1** | R2 | Authenticate · Resolve across systems |
| F2 RBAC/ABAC Server-Side | Epic 2 | US-015…025 | **R1** | R3 | Work an item · Resolve across systems |
| F3 Unified Navigation Shell | Epic 3 | US-026…032 | **R1** | R3 | Orient · Verify & Audit |
| F4 Role-Specific Dashboards | Epic 4 | US-033…039 | **R1** | R3 | Orient |
| F5 Unified Work Queue | Epic 5 | US-040…049 | **R1** | R3 | Find work |
| F6 Work-Item Detail and Action | Epic 6 | US-050…058 | **R1** | R3 | Work an item |
| **F7 Flagship Cross-App Workflow** | **Epic 7** | **US-059…069** | **R1** | **R1** | Work an item · **Resolve across systems** · Verify & Audit |
| F8 Adapter Framework and Registry | Epic 8 | US-070…075 | **R1** | R3 | Administer & Extend |
| F9 Five Simulated Spoke Services | Epic 9 | US-076…080 | **R1** | R3 | Find work · Work an item · Verify & Audit |
| F10 Unified Layer API (BFF) | Epic 10 | US-081…085 | **R1** | R3 | Resolve across systems · Verify & Audit |
| F11 Administrator Console | Epic 11 | US-086…093 | R3 | R3 | Administer & Extend |
| F12 Application Registration | Epic 12 | US-094…100 | R3 | R3 | Administer & Extend |
| F13 Immutable Audit Trail | Epic 13 | US-101…108 | **R1** | R3 | Verify & Audit |
| F14 USWDS Accessible Interface | Epic 14 | US-109…118 | **R1** | R3 | Work an item · Find work · Verify & Audit |
| F15 Notifications and Announcements | Epic 15 | US-119…124 | **R1** | R3 | Orient |
| F16 Health, Resilience, Degraded UX | Epic 16 | US-125…132 | R2 *(US-130)* | R3 | Administer & Extend · Find work · Work an item |
| F17 Synthetic Seed Data | Epic 17 | US-133…137 | **R1** | R2 | Find work |
| F18 Demo Operability | Epic 18 | US-138…144 | **R1** *(US-138, US-140)* | R3 | Administer & Extend |
| F19 Test and A11y Verification | Epic 19 | US-145…151 | **R1** *(US-145)* | R3 | Verify & Audit |

✅ **F0–F19: 20 of 20 covered.** No feature is unmapped, and no feature appears only as a label — each has named stories and a named release.

---

### Journey Coverage

Every journey is covered by stories in some release, and every journey is complete by R3.

| Journey | Persona | Demo segment | R1 | R2 | R3 |
|---|---|---|---|---|---|
| **JRN-01.01** Flagship issue resolution | PER-01 | **1 — primary** | ✅ **Complete (11/11)** | ✅ regression | ✅ regression |
| JRN-01.02 Monday-morning triage | PER-01 | 3b | ◐ 6/7 | ◐ 6/7 | ✅ **Complete (7/7)** |
| JRN-01.03 Keep working while IM is down | PER-01 | 2a | — | — | ✅ **Complete (7/7)** |
| JRN-02.01 Assemble and determine | PER-02 | 4 | — | ✅ **Complete (9/9)** | ✅ |
| JRN-02.02 Aging queue, missing data | PER-02 | 2c | — | ◐ 5/7 | ✅ **Complete (7/7)** |
| JRN-03.01 Where I stand, what I owe | PER-03 | 5a | — | ✅ **Complete (8/8)** | ✅ |
| JRN-03.02 Proof and boundary | PER-03 | 5b | — | ✅ **Complete (6/6)** | ✅ |
| JRN-04.01 Register the sixth application | PER-04 | 3a | — | — | ✅ **Complete (9/9)** |
| JRN-04.02 Triage an integration failure | PER-04 | 6 | — | — | ✅ **Complete (8/8)** |
| JRN-04.03 Rehearse degradation | PER-04 | 2b | — | — | ✅ **Complete (6/6)** |

✅ **10 of 10 journeys covered.** ✅ **78 of 78 journey stages have at least one story.**

**Demonstration-path readiness by release:**

| Release | Demo segments runnable |
|---|---|
| R1 | Segment 1 *(the thesis)* |
| R2 | Segments 1, 4 *(role-level zero trust)*, 5a, 5b *(resource-level zero trust)* |
| R3 | **All six segments** — 1 thesis, 2 resilience, 3 extensibility, 4 role-level, 5 resource-level, 6 accountability |

---

### Story Placement Integrity

| Check | Result |
|---|---|
| Stories in `UserStories-DCSA-UAL.md` | 151 |
| Stories placed on the map | **151** |
| Activity rows in the matrix | 135 |
| Stories owned by exactly one activity row | 148 |
| Stories appearing in a second row, marked *(shared)* | 3 — US-061, US-067, US-107 |
| **Orphan stories** (not mapped to any backbone step) | **0** |
| Backbone steps with no stories | 0 of 7 |
| Release totals *(distinct stories)* | R1 **67** · R2 **34** · R3 **50** = 151 |
| Stories whose acceptance splits across two releases | 3 — US-078, US-107, US-133 |

> **On the three shared rows.** US-061 (traverse) and US-067 (verify) each carry two distinct user-observable claims at the same journey stage — *"no login prompt"* and *"no identifier re-typed"*; *"the case is clean"* and *"I checked outside the hub"*. US-107 is self-scoped activity history, which PER-01 uses in R1 (recent activity on the flagship chain) and PER-03 uses in R2 (proving a submission). Splitting them into separate rows keeps each NaC atomic and testable. Each story is still owned by exactly one release-defining row; the second row is marked *(shared)* and adds no new scope.

---

### Gap Analysis

**No blocking gaps.** Every PRD feature, every journey, every JTBD, and every story is accounted for. The findings below are honest disclosures, not omissions.

**1. Seven stories have no JTBD ancestor and are parented to a PRD product principle (`PRIN-nn`).**
US-008, US-027, US-032, US-118, US-123, US-135, US-150. These carry the PRD's product principles — *Honest demo*, *Synthetic data only*, *Every button works* — which are **agency- and evaluator-facing obligations, not user jobs.** No persona's desired outcome is "see a synthetic-data banner." Rather than fabricate a JTBD parent for them, their NaC is derived from the named PRD principle and flagged. **PRD §3 now assigns those principles stable IDs (`PRIN-01`…`PRIN-06`), so these seven citations resolve to a real parent rather than to a prose label** — US-008, US-027, US-118 and US-123 → `PRIN-06` (Honest demo); US-135 → `PRIN-06`; US-032 and US-150 → `PRIN-03` (Every button works). This remains a deliberate modelling decision; if a future revision of `JTBD-DCSA-UAL.md` adds an evaluator or agency persona, these seven should be re-parented to it.

**2. Two personas do no meaningful work at the end of R1.**
PER-02 and PER-03 are excluded from R1 by the walking-skeleton rule. Consequence to manage: **if the build stops after R1, the RBAC/ABAC story is unproven**, because the clearest demonstration of it (US-017 — the same work item, two roles, two action sets) requires PER-02 to exist. R2 is therefore not optional for a credible evaluation; it is the release where the zero-trust claim stops being architecture and starts being evidence.

**3. PER-04's journeys are all in R3 — the single largest release.**
Both architectural claims land in the last increment. This is unavoidable (F12 and F16 depend on everything before them) but it is the map's principal schedule risk: **R3 carries 50 stories and 5 of the 10 journeys.** Mitigation: US-070 (registry-driven fan-out) ships in R1 so the registry seam is exercised from the start; US-145 (flagship regression test) ships in R1 so R3's breadth cannot silently break R1's depth; and R3 now carries an **internal ordering gate** (see R3 §Internal ordering gate) sequencing operability before extensibility with a checkpoint between, so a truncated R3 still leaves the platform operable and Segments 2 and 6 demonstrable.

**4. JRN-01.02 stage 7 and JRN-02.02 stages 5–6 are stranded until R3.**
Both journeys are *mostly* demonstrable from R1/R2 but cannot be walked end to end until R3. This is deliberate — stage 7 is the *consequence* of registration and stages 5–6 are the *consequence* of the health monitor — but rehearsal scripts should not claim these journeys as complete before R3.

**5. `US-078` and `US-133` are split across releases.**
Spoke domain depth (IEP, PDT) and seed breadth (PER-02…04) legitimately land in two increments. Each is one story with two release cells, not two stories. Build tracking should treat these as split-acceptance rather than re-open them as new stories.

**6. Carried forward from upstream — persona/seed name reconciliation. ✅ RESOLVED.**
**Closed.** The FRD seed corpus (`FR-F17-02`) has been reconciled to the design personas — PER-01 Marcus Vale, PER-02 Dana Okonkwo, PER-03 Renée Ashford, PER-04 Priya Raghunathan — with the binding asserted at seed time (`FR-F17-02` AC-3, `FR-F17-10`). This map continues to use **roles and stable record references** (`EAPP:CASE-A-1042`, `PVQ:ISS-2207`, `SUBJ-00418`, `CVS`) and so remains immune to any future renaming.

---
