# User Story Map
## DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

| Field | Value |
|-------|-------|
| **Product Name** | DCSA Unified Application Access and Integration Prototype |
| **Project Acronym** | DCSA-UAL |
| **Document Type** | User Story Map |
| **Status** | Draft v1.0 |
| **Date** | 2026-09-15 |
| **Related Personas** | `project_specs/PERSONAS-DCSA-UAL.md` (PER-01 … PER-04) |
| **Related Journeys** | `project_specs/JOURNEYS-DCSA-UAL.md` (JRN-01.01 … JRN-04.03) |
| **Related JTBD** | `project_specs/JTBD-DCSA-UAL.md` (JTBD-01.1 … JTBD-04.4) |
| **Related User Stories** | `project_specs/UserStories-DCSA-UAL.md` (US-001 … US-151) |
| **Related PRD** | `project_specs/PRD-DCSA-UAL.md` (§5 Feature Requirements F0–F19) |
| **Related Charter** | `.planning/PROJECT.md` |

> **DEMO — SYNTHETIC DATA ONLY.** This map organizes a demonstration prototype. No real DCSA personnel, applicants, cases, or systems are represented. Every NaC below is written to be **watched happening** on synthetic data in front of an evaluator.

---

## Overview

### What this document is

This map takes the **151 existing user stories** in `UserStories-DCSA-UAL.md` and places each one at the intersection of two axes. It creates no new stories.

- **Horizontal axis (the backbone)** — the user's path through the unified experience, derived from the journey stages in `JOURNEYS-DCSA-UAL.md`, **not** from the PRD feature list. The backbone reads as a day of work, not as an architecture diagram:

  > **Authenticate → Orient → Find work → Work an item → Resolve across systems → Verify & Audit → Administer & Extend**

  This ordering is deliberate. The product's entire argument is that a single piece of work crosses system boundaries; a feature-ordered backbone would hide exactly the seam the prototype exists to prove. Every backbone step below appears in at least one journey stage table, and the flagship journey JRN-01.01 traverses all seven in sequence.

- **Vertical axis (the releases)** — three increments, each of which completes journeys rather than feature areas. R1 is a walking skeleton that ends with the flagship journey demonstrable end to end; R2 adds role breadth and the trust claims; R3 adds extensibility and operability.

### What NaC means here

**Natural Acceptance Criteria** are what the *user* would say has to be true, phrased in their own words, derived from a JTBD **desired outcome** applied to a specific journey stage. They are not implementation assertions. Each one is written so an evaluator could watch it happen — or fail — in a live demonstration.

```
JTBD desired outcome  ×  journey stage context  =  NaC
"Minimize the number      "JRN-01.01:Traverse"      "I cross from the case to the
 of authentication                                    issue and nothing asks me to
 events…"                                             sign in again."
```

NaC are **not invented**. Every one traces to a JTBD outcome ID in the NaC Derivation Table. Seven structural stories have no JTBD ancestor at all — those are parented instead to a **PRD product principle ID** (`PRIN-01`…`PRIN-06`, PRD §3) and are called out honestly in the Gap Analysis rather than given a fabricated JTBD parent.

### How to read the matrix

Each `###` section below is one **backbone step** and carries one activity table with a fixed six-column shape:

`| Activity | Persona | Epic | Stories | NaC | Release |`

Each story is owned by exactly one activity row, in the backbone step where the user actually encounters it. Three stories (US-061, US-067, US-107) carry a second row marked *(shared)* because they deliver two distinct user-observable claims at the same stage; the second row adds no scope. Cross-cutting epics (F14 accessibility, F13 audit, F2 authorization) are distributed to the step where their behaviour is *observable*, not collected into a technical lane — because an accessibility story nobody can point at during a demo is an accessibility story nobody will build.

---
