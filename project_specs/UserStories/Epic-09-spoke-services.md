## Epic 9: Five Simulated Spoke Services with Isolated Data Namespaces (F9)

eApp, IEP, PVQ, PDT, and Investigation Management as five genuinely separate simulated services — separate processes, separate APIs, separate data namespaces. The separation must be real and observable, because a reviewer who suspects a shared database has no reason to believe anything else in the demonstration.

---

### US-076: Satisfy myself that the five systems are genuinely separate
**As an** evaluating reviewer, **I want to** confirm that no spoke can read another spoke's data, **so that** the hub-and-spoke integration claim is evidence rather than architecture-diagram decoration.

**Acceptance Criteria:**
- [ ] Given the running environment, when I inspect it, then each spoke runs as its own process on its own port with its own database namespace and its own credentials.
- [ ] Given a spoke's credentials, when a test attempts to read another namespace, then the read fails at the database permission layer — isolation is enforced by grants, not by convention.
- [ ] Given the schemas, when they are inspected, then zero tables are shared between services and no "common" schema exists.
- [ ] Given network traffic is observed, when the product is exercised, then there is no spoke-to-spoke traffic; a spoke's only inbound caller is the hub via its adapter.
- [ ] Given two systems refer to the same synthetic person, when their rows are inspected, then each holds its own row keyed by the same opaque subject reference with no foreign key between them.

**Priority:** P0 | **Feature Ref:** F9 | **Persona:** PER-04 | **FRD:** FR-F09-01

---

### US-077: Query each system directly to prove what the hub told me
**As an** evaluating reviewer, **I want** each spoke's API to be independently callable, **so that** I can verify a dual-system change without the unified layer in the path.

**Acceptance Criteria:**
- [ ] Given an administrator issues a short-lived operator token, when I call a spoke's documented API directly, then it returns human-readable JSON including the fields the demo script asserts on.
- [ ] Given the flagship workflow has run, when I query PVQ and eApp directly, then both show the updated state.
- [ ] Given the operator token is issued, when the audit trail is checked, then the issuance is recorded, and the token expires within fifteen minutes.
- [ ] Given the demo script, when I follow it, then it contains the exact commands for reading the flagship case and issue before and after the workflow.

**Priority:** P0 | **Feature Ref:** F9, F7 | **Persona:** PER-04 | **FRD:** FR-F09-08, FR-F18-05

---

### US-078: Find each system behaving like the real thing it stands in for
**As an** Investigator, **I want** each simulated system to hold realistic domain content for the workflows in scope, **so that** every screen reads like a working system rather than a mock.

**Acceptance Criteria:**
- [ ] Given eApp, when I open a case, then it holds SF-86-style questionnaire sections and answers, a case record, submission status, and case state transitions.
- [ ] Given PVQ, when I open an issue, then it holds the issue raised against a specific answer with its locus, section label, answer snapshot, disposition, and resolution state.
- [ ] Given IEP, when an Applicant signs in, then it holds their status record, notices, and outstanding tasks.
- [ ] Given PDT, when I open a designation, then it holds position sensitivity, risk factors, and the resulting investigation tier with the rule that produced it stated in text.
- [ ] Given IM, when I open an assignment, then it holds case assignment, investigative leads, workload context, and case status.
- [ ] Given each spoke, when an action is performed on one of its records, then that spoke records its own internal activity history independently of the hub's audit log.

**Priority:** P0 | **Feature Ref:** F9, F17 | **Persona:** PER-01, PER-02, PER-03 | **FRD:** FR-F09-02, FR-F09-03, FR-F09-04, FR-F09-05, FR-F09-06

---

### US-079: Keep using the product when one system is genuinely stopped
**As an** Investigator, **I want** the unified layer to stay fully usable when a spoke process is stopped outright, **so that** "what happens when Investigation Management is down" is a real experiment rather than a description.

**Acceptance Criteria:**
- [ ] Given any single spoke is stopped, when I use the product, then the hub and the remaining four spokes stay fully functional with a visible degraded warning.
- [ ] Given a spoke is stopped, when I navigate the product, then no error page appears anywhere.
- [ ] Given the spoke is restarted, when the next health probe runs, then full function is restored automatically with no hub restart and no re-authentication.
- [ ] Given each of the five spokes in turn, when each is stopped, then the same behaviour holds.

**Priority:** P0 | **Feature Ref:** F9, F16 | **Persona:** PER-01 | **FRD:** FR-F09-01, FR-F18-02

---

### US-080: See cross-system relationships expressed as references, never as joins
**As an** Administrator, **I want** cross-system relationships to be opaque references resolved only by the hub, **so that** the integration pattern is repeatable for the next application rather than bespoke to these five.

**Acceptance Criteria:**
- [ ] Given a PVQ issue references an eApp case, when PVQ is inspected, then it stores the reference opaquely and never resolves it, never queries eApp, and holds no foreign key.
- [ ] Given an eApp case carries outstanding issue references, when eApp is inspected, then it knows only that N remain outstanding — not what a PVQ issue contains.
- [ ] Given the hub resolves a relationship, when it does so, then it cross-checks that the two systems agree on the subject, and renders the relationship as unresolvable when they do not.
- [ ] Given the seed contains one deliberate orphan reference, when the related panel renders it, then it shows "This related item couldn't be confirmed. We've logged the problem — reference {correlationId}." and an integration issue is recorded.
- [ ] Given an architecture test runs, when it completes, then it confirms zero cross-namespace queries anywhere in the implementation.

**Priority:** P0 | **Feature Ref:** F9, F7 | **Persona:** PER-04 | **FRD:** FR-F07a-01, FR-F17-04

---
