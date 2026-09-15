## Epic 17: Synthetic Seed Data Corpus (F17)

A realistic, internally consistent body of synthetic data across every spoke and every role — rich enough that every screen looks like a working system, coherent enough that cross-system relationships are genuine rather than staged, and obviously fabricated enough that no security-minded evaluator mistakes it for real personnel data. Without it, every screen is an empty state.

---

### US-133: Find every screen populated, whichever persona I sign in as
**As an** evaluating reviewer, **I want** each seeded persona to produce a fully populated experience across every screen their role can reach, **so that** the demonstration never lands on an accidentally blank widget.

**Acceptance Criteria:**
- [ ] Given each persona signs in, when every screen reachable by their role is opened, then each renders populated content or its intended designed empty state — never an accidental blank region.
- [ ] Given the investigator persona's queue, when it loads, then it holds enough items across at least four source systems to make filtering, sorting, and pagination meaningful without being slow.
- [ ] Given every filter facet for every role, when the default date range is applied, then each returns at least one result — a filter that always returns nothing looks broken.
- [ ] Given the investigator queue, the audit viewer, and the console inventory, when each loads, then each exercises more than one page of pagination.
- [ ] Given seeded volume, when the work queue is requested, then it completes within two seconds.
- [ ] Given the coverage matrix, when it is checked, then it is asserted by automated test rather than by inspection.

**Priority:** P0 | **Feature Ref:** F17 | **Persona:** PER-01, PER-02, PER-03, PER-04 | **FRD:** FR-F17-01, FR-F17-07

---

### US-134: Reach every non-happy state without having to break something
**As an** evaluating reviewer, **I want** the edge states seeded rather than theoretical, **so that** overdue sorting, empty states, denials, and unusual dispositions can all be shown on demand.

**Acceptance Criteria:**
- [ ] Given overdue items, unassigned items, an unresolvable assignee, items with no due date, and a source with no native priority, when each is opened, then each renders its specified treatment.
- [ ] Given the zero-item applicant persona, when they sign in, then every applicant empty state is reachable.
- [ ] Given the applicant with an information-requested case, when they sign in, then the action-required alert and the applicant action path are reachable.
- [ ] Given already-resolved and referred PVQ issues, when each is opened, then the "already resolved" disabled state and the non-clearing disposition path are demonstrable.
- [ ] Given cross-organisation, clearance-tier, and read-not-write conditions, when each denial is attempted, then each produces its specified refusal.
- [ ] Given blocked and stalled items, when alerts are computed, then each corresponding alert rule fires.
- [ ] Given the demonstration script, when it exercises an edge state, then it names the persona and the item that reaches it.

**Priority:** P0 | **Feature Ref:** F17, F2, F16 | **Persona:** PER-01, PER-03 | **FRD:** FR-F17-06

---

### US-135: Trust that nothing here resembles a real person
**As an** evaluating reviewer with a security mindset, **I want** every seeded value to be obviously and verifiably fabricated, **so that** I have no reason to raise a privacy concern about the prototype.

**Acceptance Criteria:**
- [ ] Given any seeded name, when I read it, then it is a deliberately unusual fabricated composite drawn from no real directory.
- [ ] Given any seeded identifier, when it is checked, then it is invalid by construction — reserved postcode ranges, never-issued national identifier ranges, reserved phone prefixes, and an invalid email domain.
- [ ] Given any record, when I inspect it, then it carries a synthetic marker, every API response declares itself synthetic, and every detail screen shows "Synthetic record — demo data" in its summary header.
- [ ] Given any narrative text, when I read it, then it is clearly fictitious and free of anything resembling real case content.
- [ ] Given an automated check for real-format validity, when it runs across the corpus, then zero seeded values pass.
- [ ] Given the seed provenance documentation, when I read it, then it states how the data was generated and asserts explicitly that it derives from no real source.

**Priority:** P0 | **Feature Ref:** F17 | **Persona:** PER-04 | **FRD:** FR-F17-08, FR-F17-09

---

### US-136: Get the same demonstration every time I run it
**As an** Administrator running the demonstration, **I want** deterministic seeding and a fast reset, **so that** the script's expected states hold on the third run as reliably as on the first.

**Acceptance Criteria:**
- [ ] Given the same seed constant, when the data is generated twice, then the two corpora are identical, verified by content hash.
- [ ] Given relative dates, when the demonstration is run on any calendar date, then an item seeded as overdue is still overdue, because dates are recomputed from a reference date at seed time.
- [ ] Given seeded row ordering, when the queue loads, then it is deterministic, so a script that says "the item is third in the list" holds.
- [ ] Given I run the reset command, when it completes in under thirty seconds, then all namespaces are re-seeded, the sixth application is de-registered, failure injection is cleared, sessions are cleared, alert read state and announcement dismissals are cleared, and orchestration transactions and retry queues are emptied.
- [ ] Given reset completes, when I read its confirmation, then it lists what was restored including "CVS de-registered" and "Failure injection cleared".
- [ ] Given reset runs, when audit records are inspected afterwards, then the baseline was rebuilt rather than rows deleted, preserving the property that no deletion path exists, and a reset record appears in the new baseline.
- [ ] Given three consecutive flagship runs with a reset between each, when each completes, then the result is identical.

**Priority:** P0 | **Feature Ref:** F17, F18 | **Persona:** PER-04 | **FRD:** FR-F17-05, FR-F17-11

---

### US-137: Refuse to start rather than demonstrate on broken data
**As an** Administrator, **I want** seed validation to fail startup with a specific message, **so that** a demonstration never begins on a corpus that will break halfway through.

**Acceptance Criteria:**
- [ ] Given seeding completes, when validation runs, then it asserts that every cross-namespace reference resolves apart from the one documented intentional orphan, that every flagship precondition holds, that every persona has a role and complete attributes, that every filter facet returns at least one row per role, and that every edge state exists.
- [ ] Given a flagship precondition is missing, when startup runs, then it fails with a specific actionable message naming the missing precondition and telling me to run reset.
- [ ] Given a broken cross-reference, when validation runs, then it fails naming the referencing record and the missing target.
- [ ] Given a filter facet that returns nothing for a role, when validation runs, then it warns rather than failing.
- [ ] Given CI, when a build runs, then seed validation runs as part of it.

**Priority:** P0 | **Feature Ref:** F17, F18 | **Persona:** PER-04 | **FRD:** FR-F17-10, FR-F17-03

---
