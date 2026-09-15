# User Stories
## DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

| Field | Value |
|-------|-------|
| **Product Name** | DCSA Unified Application Access and Integration Prototype |
| **Project Acronym** | DCSA-UAL |
| **Document Type** | User Stories |
| **Status** | Draft v1.0 |
| **Date** | 2026-09-14 |
| **Related PRD** | `project_specs/PRD-DCSA-UAL.md` (features F0–F19) |
| **Related FRD** | `project_specs/FRD-DCSA-UAL.md` (requirements `FR-F{nn}-{mm}`) |
| **Related Personas** | `project_specs/PERSONAS-DCSA-UAL.md` (PER-01 … PER-04) |
| **Related Charter** | `.planning/PROJECT.md` |

> **DEMO — SYNTHETIC DATA ONLY.** Every story below is written to be demonstrable against the synthetic seed corpus (F17) on a freshly reset environment. No real DCSA data, no real PII, no connection to any government system. Authentication is simulated and labelled as simulated on every screen.

---

## Story Format

Each story follows: **As a [persona], I want to [action], so that [outcome].**

Acceptance criteria are written in Given / When / Then form beneath each story and are phrased so a reviewer can verify them during a live demonstration. Stories are grouped by epic, one epic per PRD feature, and prioritised.

**Story IDs** are `US-NNN`, sequential and stable across the whole document. Retired stories are marked `[WITHDRAWN]` rather than renumbered.

**Metadata line** on every story carries the priority, the PRD feature it satisfies, the persona it serves, and the FRD requirement(s) that specify the behaviour:

`**Priority:** P0 | **Feature Ref:** F7 | **Persona:** PER-01 | **FRD:** FR-F07a-03`

---

## Personas Referenced

| ID | Persona | Role name used in stories | Why this persona exists in the demo |
|----|---------|---------------------------|-------------------------------------|
| PER-01 | Marcus Vale | **Investigator** | Primary demo persona; the actor in the flagship workflow (F7) |
| PER-02 | Dana Okonkwo | **Adjudicator** | Proves the same item yields a *different* server-computed action set (F2, F6) |
| PER-03 | Renée Ashford | **Applicant** | The strictest access scope; the headline zero-trust negative test (F2) |
| PER-04 | Priya Raghunathan | **Administrator** | Proves the platform is operable (F11, F16) and extensible (F12) |

Stories use the **role name** in the "As a…" sentence, because the product's behaviour is driven by role and attributes rather than by an individual. The `PER-XX` identifier in the metadata line carries the traceability back to `PERSONAS-DCSA-UAL.md`.

> **Note on seeded identity names — RESOLVED.** The FRD seed corpus (`FR-F17-02`) is now bound to the design personas: PER-01 seeds as **Marcus Vale**, PER-02 as **Dana Okonkwo**, PER-03 as **Renée Ashford**, PER-04 as **Priya Raghunathan**. These stories continue to reference **roles**, not seeded names, so they remain immune to any future renaming. Where a story names a specific seeded record — `EAPP:CASE-A-1042`, `PVQ:ISS-2207`, `SUBJ-00418`, `CVS` — that identifier is normative because the demo script depends on it.

---

## Reading This Document as an Evaluator

Five clusters carry the evaluation weight, and they are called out here so a reviewer can find them fast:

| What a reviewer is checking | Epic | Stories |
|---|---|---|
| **Is the cross-system workflow genuinely continuous?** | Epic 7 | US-059 … US-069 |
| **Is zero trust demonstrable, not asserted?** | Epic 2 | US-018 … US-025 (the negative paths) |
| **Is the platform extensible without code?** | Epic 12 | US-094 … US-100 |
| **Does it degrade visibly rather than blankly?** | Epic 16 | US-125 … US-132 |
| **Is it accessible to a federal standard?** | Epic 14 | US-109 … US-118 |

---
