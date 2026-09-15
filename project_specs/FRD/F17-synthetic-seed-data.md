## F17 — Synthetic Seed Data Corpus

**Traces to:** PRD F17 (P0); NFR-12, SM-22, R-09, R-10. **Schema:** `Y0a`, `Y0b`.

**Description:** A realistic, internally consistent body of synthetic data spanning all five spoke systems plus the demo sixth, and all four roles — rich enough that every screen looks like a working system, and coherent enough that cross-system relationships (especially the flagship eApp↔PVQ link) are genuine rather than staged. **Every UI flow the demo exercises must have its precondition rows seeded**, including the edge states.

**Terminology:**
- **Persona** — a seeded identity used in the demo script.
- **Referential coherence** — the same `subjectRef` meaning the same synthetic person across namespaces, without any foreign key.
- **Edge state** — a seeded condition that exists specifically so a non-happy UI state is demonstrable (overdue, unassigned, zero-item, degraded).
- **Baseline** — the pristine seeded state the reset command restores.

---

### FR-F17-01 — Seed volume and distribution

**Description:** How much of each entity, calibrated so filtering, sorting, searching, and pagination are meaningful without making the demo slow.

| Namespace | Entity | Count | Notes |
|---|---|---|---|
| hub | identities (`users`) | 14 | 5 investigators, 3 adjudicators, 4 applicants, 2 administrators; one identity holds Investigator + Adjudicator |
| hub | registered applications | 5 | eApp, IEP, PVQ, PDT, IM. **CVS deliberately absent** (`FR-F12-06`) |
| hub | announcements | 4 | 2 active (different target roles), 1 scheduled, 1 expired |
| hub | audit events | ~120 | Pre-seeded history so the viewer, filters, and pagination are populated on first load |
| eapp | subjects | 22 | Shared `subjectRef` values with IEP, PVQ, PDT, IM |
| eapp | cases | 26 | Across all 7 case states; 6 assigned to the demo investigator |
| eapp | questionnaire sections / answers | 26 × 12 sections | Realistic section structure, obviously fictitious content |
| pvq | questionnaires | 20 | Linked by `subjectRef` |
| pvq | issues | 18 | 6 OPEN, 3 IN_REVIEW, 7 resolved (mixed dispositions), 2 REFERRED |
| iep | individuals | 22 | Matching `subjectRef` set |
| iep | status records | 22 | Across all 4 stages |
| iep | notices | 34 | Mixed read/unread |
| iep | tasks | 19 | 11 OPEN (4 overdue), 8 COMPLETE |
| pdt | positions | 24 | Across all 4 sensitivity levels |
| pdt | designations | 24 | 5 PENDING_REVIEW, 15 APPROVED, 4 RETURNED |
| im | investigations | 31 | Across all 5 statuses, all 3 priorities |
| im | assignments | 28 | Distributed across 5 investigators; 3 unassigned |
| im | leads | 62 | 2–3 per active investigation |
| cvs | alerts | 9 | Unregistered until the demo; 4 assignable to the demo investigator |

**Rules:**
1. The demo investigator's queue contains **28–34 items** across at least four source systems — enough for meaningful pagination at 25 per page, enough that filters visibly narrow, not so many that the page is slow.
2. Every enumerated status, priority, and state value in every spoke appears at least once, so every filter option returns results rather than an empty set. A filter that always returns nothing looks broken.
3. Volume targets are upper-bounded so `GET /api/work-items` completes within 2 seconds (NFR-17).

**Acceptance criteria:**
- AC-1: Every filter facet, for every role, returns at least one result on the default date range.
- AC-2: Pagination is exercised (>1 page) for the investigator queue, the audit viewer, and the admin inventory.

---

### FR-F17-02 — Personas and role/attribute coverage

**Description:** The identities the demo script uses, with the attributes that make ABAC observable.

> **Normative persona binding.** The four design personas in `PERSONAS-DCSA-UAL.md` (PER-01…PER-04) are seeded under **exactly these names**. One name per human, in every document and on every screen. The `PER-ID` column below is the binding; it is asserted by seed validation (`FR-F17-10`). Identities with no `PER-ID` are supporting cast that exist to make an authorization rule observable and are deliberately *not* design personas.

| Persona | PER-ID | Roles | Auth methods | Attributes | Purpose |
|---|---|---|---|---|---|
| **Marcus Vale** | **PER-01** | INVESTIGATOR | CAC/PIV, Generic MFA | org `DCSA-FIELD-OPS-EAST`, tier `T5`, region `REGION-NE`, 6 case assignments | **Primary flagship persona** |
| Harlan T. Boyce | — | INVESTIGATOR | CAC/PIV | org `DCSA-FIELD-OPS-EAST`, tier `T3`, region `REGION-NE`, 5 assignments | Unit-mate: demonstrates read-not-write (`ATTR-INV-02`) and the T3/T5 clearance denial (`ATTR-INV-03`) |
| Ingrid L. Vasterling | — | INVESTIGATOR | ECA only | org `DCSA-FIELD-OPS-WEST`, tier `T5`, region `REGION-SW`, 4 assignments | Demonstrates ECA as a distinct IdP pool and cross-org denial |
| Dana Okonkwo | **PER-02** | ADJUDICATOR | CAC/PIV | org `DCSA-FIELD-OPS-EAST`, tier `T5`, region `REGION-NE` | Adjudicator dashboard and different action set on the same item |
| Sofia K. Mendelbaum | — | INVESTIGATOR + ADJUDICATOR | CAC/PIV, Generic MFA | org `DCSA-FIELD-OPS-EAST`, tier `T5`, region `REGION-NE` | **Multi-role identity**: role switching without re-authentication |
| Theodore Q. Lansbury | — | APPLICANT | Generic MFA | subjectRef `SUBJ-00418` | Applicant with a full set: status, notices, tasks, and an eApp case |
| Renée Ashford | **PER-03** | APPLICANT | Generic MFA | subjectRef `SUBJ-00622` | Applicant with an `INFORMATION_REQUESTED` case — action-required path |
| Bartholomew N. Quigley | — | APPLICANT | ECA | subjectRef `SUBJ-00907` | **Zero-item applicant**: all empty states (`FR-F17-06`) |
| Priya Raghunathan | **PER-04** | ADMINISTRATOR | CAC/PIV | org `DCSA-HQ`, tier `T5`, region `NATIONAL` | **Primary admin persona**: console, registration, audit |

**Rules:**
1. Every role has at least one identity signing in via each of at least two methods, so all three auth paths are demonstrable across roles (PRD F0 acceptance signal).
2. The CAC/PIV and ECA pools are partially disjoint: Ingrid is ECA-only, Marcus and Priya are CAC/PIV-primary (`FR-F00-03`).
3. No identity holds both APPLICANT and a mission role (`FR-F00-05` rule 4).
4. **Dana Okonkwo (PER-02) holds ADJUDICATOR only.** She must not also hold INVESTIGATOR: the product's clearest live RBAC demonstration is that she can *view* `PVQ:ISS-2207` and cannot *resolve* it (`PERSONAS` PER-02 Access Scope). The dual-role identity is a separate, non-persona identity (Sofia K. Mendelbaum).
5. **The flagship subject is `SUBJ-00418` (Theodore Q. Lansbury)** — a non-persona applicant. `SUBJ-00622` (Renée Ashford, PER-03) additionally has **one eApp case and one IM assignment owned by Marcus Vale (PER-01)**, so the `PERSONAS` §Persona Relationships claim — *the applicant is the subject of the investigator's cases* — is literally true in the seed. Renée never sees that case's investigative content (`FR-F02-02`).
6. Names are fabricated. The four persona names are ordinary-looking by design — an evaluator must be able to say them aloud — and the supporting cast uses deliberately unusual composites. **No name is drawn from any real directory** (R-10), and no name is paired with a valid-format identifier (`FR-F17-08`).

**Acceptance criteria:**
- AC-1: Each persona signs in successfully by each of its listed methods.
- AC-2: The multi-role persona switches roles and observes different navigation and dashboards.
- AC-3: Seed validation asserts the PER-ID binding above, and fails startup if any of PER-01…PER-04 is missing or bound to more than one identity — a demo in which a persona document and a screen disagree on a name is not allowed to start.
- AC-4: Dana Okonkwo's roles are exactly `["ADJUDICATOR"]`, asserted by test, so the action-set contrast on `PVQ:ISS-2207` cannot silently regress.

---

### FR-F17-03 — The flagship workflow's seeded preconditions

**Description:** The exact rows the flagship demo depends on. These are named so a broken demo is diagnosable in seconds.

**Required baseline state:**
1. **eApp:** case `CASE-A-1042`, subject `SUBJ-00418` (Theodore Q. Lansbury), `caseState = UNDER_REVIEW`, `outstandingIssueCount = 1`, `outstandingIssueRefs = ["ISS-2207"]`, assigned to Marcus Vale, due in 4 days, with a populated `SECTION_13A` employment-history section containing at least two employer entries.
2. **PVQ:** issue `ISS-2207`, `status = OPEN`, `parentSystem = EAPP`, `parentCaseRef = CASE-A-1042`, `subjectRef = SUBJ-00418`, `answerLocus = SECTION_13A.employer[0].endDate`, `answerSectionLabel = "Section 13A — Employment history"`, `answerSnapshot` containing the fabricated answer text, raised 3 days ago.
3. **PDT:** a designation referencing `CASE-A-1042` so the related-items panel shows more than one relationship type.
4. **IM:** an assignment referencing `CASE-A-1042` assigned to Marcus, so the panel shows three relationship types and the cross-system story is not a single link.
5. **Hub:** Marcus's queue default view surfaces `EAPP:CASE-A-1042` on page 1 without filtering; the `ALERT-NEW-PVQ-ISSUE` rule fires for `ISS-2207` so the dashboard on-ramp is populated.
6. A **second** open PVQ issue on a different case exists, so the demo can be repeated on alternate data if `ISS-2207` has already been consumed mid-session.

**Validation rules (seed-time assertions, `FR-F17-10`):** every reference above resolves; the subject matches across eApp, PVQ, IEP, PDT, and IM; the issue is `OPEN`; the case count is exactly 1.

**Acceptance criteria:**
- AC-1: Seed validation fails loudly if any flagship precondition is missing.
- AC-2: The flagship workflow succeeds on a freshly seeded environment without manual setup.

---

### FR-F17-04 — Referential coherence across isolated namespaces

**Processing / business rules:**
1. `subjectRef` (format `SUBJ-#####`) identifies the same synthetic person in every namespace. There is **no** foreign key, no shared table, and no cross-namespace query — coherence is a property of the seed generator, not of the schema (NFR-08).
2. Case references (`CASE-X-####`) are generated by eApp and referenced opaquely by PVQ, PDT, and IM.
3. Issue references (`ISS-####`) are generated by PVQ and referenced opaquely by eApp.
4. Person display names are seeded identically per `subjectRef` in each namespace that displays them, so the same person does not appear under two names.
5. The generator emits a manifest of every cross-namespace reference; seed validation asserts every one resolves in its target namespace.
6. Deliberate negative coverage: **one** PVQ issue references a case that does not exist in eApp, so the `INTEGRATION_REFERENCE_MISMATCH` handling (`FR-F07a-01` rule 4) is demonstrable rather than theoretical. It is documented so it is not mistaken for a defect.

**Acceptance criteria:**
- AC-1: Every cross-namespace reference except the one intentional orphan resolves.
- AC-2: The intentional orphan renders the specified "couldn't be confirmed" state.

---

### FR-F17-05 — Deterministic seeding

**Processing / business rules:**
1. All generated values — identifiers, names, dates, statuses, narratives — derive from a fixed seed constant. The same seed produces byte-identical data every time.
2. Relative dates are computed from a **seed reference date** rather than from `now`, then offset so that "overdue by 6 days" stays overdue whenever the demo runs. Absolute stored dates are recomputed at seed time relative to the current date so the corpus never goes stale.
3. Sort order of seeded rows is deterministic, so the demo script's "the item is third in the list" expectations hold (SM-22).
4. The seed is applied automatically at startup (`FR-F18-03`).
5. The seed constant and reference date are documented.

**Acceptance criteria:**
- AC-1: Two fresh seeds produce identical data, verified by content hash.
- AC-2: Overdue items remain overdue regardless of the date the demo runs.

---

### FR-F17-06 — Edge-state coverage

**Description:** Every non-happy UI state must have seeded preconditions. A designed empty state that cannot be reached is not demonstrable.

| Edge state | Seeded precondition | Demonstrates |
|---|---|---|
| Overdue items | 4 IM investigations and 4 IEP tasks past due | Overdue sorting, `ALERT-OVERDUE`, non-color indication |
| Items with no assignee | 3 IM investigations with `assigneeId = null` | `assignee=unassigned` filter, "Unassigned" rendering |
| Unresolvable assignee | 1 IM investigation assigned to a native identity with no hub mapping | "Assigned to someone we can't resolve" vs "unassigned" (`FR-F05-02`) |
| Items with no due date | 5 PDT designations (PDT has no due dates) | Nulls-last sorting, "No due date" rendering |
| No native priority | All PDT items | "Priority not provided by PDT" affordance |
| Zero-item applicant | Bartholomew N. Quigley: no tasks, no notices, no case | Every applicant empty state |
| Applicant with action required | Renée Ashford: case in `INFORMATION_REQUESTED` | `ALERT-ACTION-REQUIRED`, applicant action path |
| Already-resolved issue | 7 resolved PVQ issues | "Already resolved" disabled state (`FR-F07a-03`) |
| Referred issue | 2 PVQ issues in `REFERRED` | Non-clearing disposition path (`FR-F07a-04`) |
| Cross-org denial | Ingrid's `REGION-SW` cases vs Marcus's `REGION-NE` | `ATTR-INV-01` denial |
| Clearance-tier denial | 2 eApp cases at `T5` sensitivity; Harlan is `T3` | `ATTR-INV-03` denial |
| Read-not-write | Harlan's items visible to Marcus as unit-mate | `ATTR-INV-02` disabled action with reason |
| Stalled item | 3 IM investigations with `lastActivityAt` >14 days | `ALERT-STALLED` |
| Blocked item | 2 items in `statusCategory = BLOCKED` | `ALERT-BLOCKED` |
| Degraded spoke | Not seeded — produced by failure injection (`FR-F16-11`) | Degraded queue, disabled actions |
| Expired announcement | 1 expired, 1 scheduled | Announcement state filtering |
| Truncation | Optional high-volume seed profile (`--profile=large`, 400 IM items) | `truncated` disclosure (`FR-F05-04`) |
| Audit chain | ~120 pre-seeded audit events including 2 complete correlated chains | Populated viewer and chain view on first load |

**Acceptance criteria:**
- AC-1: Every row above is reachable in a freshly seeded environment.
- AC-2: The demo script references each edge state it exercises by persona and item.

---

### FR-F17-07 — Per-persona screen coverage matrix

**Description:** The assertion that no screen is empty for the persona intended to use it.

**Processing / business rules:** Seed validation asserts, for each persona, that every screen reachable by their role renders populated content (or its intended empty state):

| Persona | Screens that must be populated |
|---|---|
| Marcus (Investigator) | SCR-09, 13, 14, 15, 16, 17, 19, 21, 33 (own), 35 |
| Dana (Adjudicator) | SCR-10, 13, 14, 15, 17, 19, 21, 33 (own), 35 |
| Theodore (Applicant) | SCR-11, 13, 14, 15 (redacted), 18, 21, 33 (own) |
| Bartholomew (Applicant, zero-item) | SCR-11, 13, 18, 21 — all in **designed empty states** |
| Priya (Administrator) | SCR-12, 22, 23, 24, 25, 26, 27, 29, 33, 34, 37, 38 |

**Acceptance criteria:**
- AC-1: Signing in as each persona produces a fully populated (or intentionally empty) experience across every reachable screen — no accidental empty widget (PRD F4 acceptance signal).
- AC-2: The matrix is asserted by automated test, not by inspection.

---

### FR-F17-08 — Obviously synthetic content

**Processing / business rules:**
1. Names are fabricated composites, deliberately unusual, and drawn from no real directory.
2. Addresses use fictional street names in real-but-generic cities, with ZIP codes reserved as invalid by construction (`00000`–`00099`).
3. Identifiers are invalid by construction: SSN-shaped values use `900-00-####` (a range never issued); phone numbers use `555-01##`; email addresses use `@example.invalid`.
4. Dates of birth are plausible but generated; no real person's identifying combination is reproducible.
5. **Every record carries `syntheticMarker: "DEMO-SYNTHETIC"`**, every API response carries `"_synthetic": true`, and every detail screen displays "Synthetic record — demo data" in its summary header (`FR-F06-02`).
6. Narrative text is clearly fictitious and free of anything resembling real case content.
7. Seed provenance is documented: how data was generated, what it is, and the explicit assertion that it derives from no real source (NFR-12).

**Acceptance criteria:**
- AC-1: No seeded value passes a real-format validity check for SSN, phone, email domain, or ZIP.
- AC-2: 100% of records carry the synthetic marker.
- AC-3: Provenance documentation exists and is linked from the accessibility/about surface.

---

### FR-F17-09 — Seed data documentation

**Processing / business rules:**
1. A document describes: every persona with sign-in instructions, what each persona sees, the flagship workflow's exact preconditions (`FR-F17-03`), every edge state and how to reach it, and the records the demo script depends on.
2. It is linked from the README (`FR-F18-04`) and from SCR-37.
3. It states the seed constant and reference date, and how to regenerate.

**Acceptance criteria:**
- AC-1: A demo operator can identify the right persona and item for any demo path from this document alone.

---

### FR-F17-10 — Seed validation

**Processing / business rules:**
1. After seeding, a validator asserts: all cross-namespace references resolve (except the one documented orphan); every flagship precondition holds; **each of PER-01…PER-04 resolves to exactly one seeded identity under the name given in `FR-F17-02`**; every persona has ≥1 role and complete attributes; **Dana Okonkwo holds ADJUDICATOR only**; every filter facet returns ≥1 row per role; every edge state exists; every persona's screen coverage matrix is satisfied.
2. Validation failure **fails startup** with a specific, actionable message naming the missing precondition — a demo starting on broken data is worse than one that refuses to start.
3. The validator runs in CI on every build.

**Error handling:**

| Scenario | Behavior | Message |
|---|---|---|
| Flagship precondition missing | Startup fails | "Seed validation failed: PVQ issue ISS-2207 is not in OPEN state. The flagship demo will not work. Run `reset` to restore baseline." |
| Broken cross-reference | Startup fails | "Seed validation failed: PVQ issue {id} references eApp case {ref}, which does not exist." |
| Persona binding broken | Startup fails | "Seed validation failed: PER-02 is not bound to exactly one identity named 'Dana Okonkwo'. The persona documents and the screens will disagree in front of a reviewer." |
| Empty facet | Warning | "Seed warning: filter value {facet}={value} returns no rows for role {role}." |

**Acceptance criteria:**
- AC-1: Corrupting a flagship precondition causes startup to fail with the specific message.
- AC-2: Validation runs in CI.

---

### FR-F17-11 — Reset to baseline

**Processing / business rules:**
1. A single documented command (`FR-F18-03`) restores the hub and all six namespaces to pristine baseline: re-seeds all data, **de-registers CVS**, clears failure injection, clears sessions, clears alert read state and announcement dismissals, and clears orchestration transactions and retry queues.
2. Audit events are restored to the pre-seeded baseline set. Reset is a full rebuild, not a deletion of audit rows — preserving the "no delete path exists" property (`FR-F13-03` rule 7).
3. Reset completes in under 30 seconds so it can be run between demo passes.
4. Reset writes a `DEMO_RESET_PERFORMED` record into the newly seeded audit baseline, so the reset itself is visible.
5. After reset, the flagship workflow runs identically (SM-22).
6. Reset is invocable from the command line and from SCR-37 by an administrator, with typed confirmation and a warning: "This restores all demo data to its starting state and signs out all users."

**Acceptance criteria:**
- AC-1: The flagship workflow runs 3 consecutive times with a reset between each, identical result each time (SM-22).
- AC-2: After reset, CVS is unregistered and the registration demo repeats.
- AC-3: Reset completes in under 30 seconds.

---
