## Epic 19: Automated Test and Accessibility Verification Suite (F19)

Automated coverage for the three things whose failure would invalidate the demonstration — the flagship workflow, access-control enforcement, and adapter behaviour — plus accessibility scanning across every route for every role. These stories are written from the point of view of the reviewer who wants evidence and the operator who has to keep the demonstration working between rehearsals.

---

### US-145: Know the flagship workflow still works before I demonstrate it
**As an** Administrator, **I want** an end-to-end test that drives the full browser path and asserts the post-state in both systems, **so that** a regression in the product's most important workflow fails the build rather than the demonstration.

**Acceptance Criteria:**
- [ ] Given the test runs, when it executes, then it drives the real browser path from sign-in through the queue, the case, the related issue, the resolution form, and the confirmation.
- [ ] Given the test completes, when it asserts, then it verifies the post-state in eApp and PVQ by calling their own APIs rather than through the hub.
- [ ] Given the test completes, when it counts, then it asserts exactly one authentication event, zero navigations outside the hub origin, zero credential prompts, and zero manually typed identifiers.
- [ ] Given the test completes, when it checks the trail, then it asserts one correlated audit chain of at least five records.
- [ ] Given the test completes, when it checks presentation, then it asserts the demo banner on every visited screen and zero serious or critical accessibility violations on the four screens involved.
- [ ] Given a regression in any one of those assertions, when CI runs, then the build fails.

**Priority:** P1 | **Feature Ref:** F19, F7 | **Persona:** PER-04 | **FRD:** FR-F19-01, FR-F07a-06

---

### US-146: Have the access-control claims tested rather than asserted
**As an** evaluating reviewer, **I want** positive and negative authorisation tests for all four roles, **so that** the zero-trust posture is measured across the surface rather than sampled in a demonstration.

**Acceptance Criteria:**
- [ ] Given each of the four roles, when the suite runs, then every permitted action in the matrix succeeds and every non-permitted action is denied.
- [ ] Given direct API calls bypassing the browser, when the negative suite runs, then calls to unauthorised endpoints and unauthorised resource identifiers are all denied.
- [ ] Given cross-organisation, clearance-tier, assignee, and subject-ownership rules, when each is tested, then each denial names the rule that produced it.
- [ ] Given a request carrying a client-supplied role, identity, or scope, when the test submits it, then it is rejected and nothing changes.
- [ ] Given a denial for a forbidden resource and a denial for a fabricated one, when both are compared, then they are indistinguishable.
- [ ] Given every denial produced by the suite, when the trail is checked, then each was audited.

**Priority:** P1 | **Feature Ref:** F19, F2 | **Persona:** PER-04 | **FRD:** FR-F19-02

---

### US-147: Have every adapter proven to behave the same way
**As an** Administrator, **I want** conformance and behaviour tests for every adapter, **so that** the integration contract is enforced rather than described.

**Acceptance Criteria:**
- [ ] Given every adapter, when the conformance suite runs, then each implements the full interface correctly and normalises correctly.
- [ ] Given each adapter, when it is tested under timeout, error, and unavailable conditions, then it behaves as specified.
- [ ] Given the scope contract, when it is tested, then each spoke is confirmed to apply the supplied ownership scope in its own query.
- [ ] Given a spoke is forced offline, when the resilience tests run, then the queue and dashboard render partial results with the degraded warning and no error page appears.
- [ ] Given the suite, when a new adapter is added, then it can be run standalone against that adapter alone.

**Priority:** P1 | **Feature Ref:** F19, F8 | **Persona:** PER-04 | **FRD:** FR-F19-03, FR-F19-04

---

### US-148: Have the audit guarantee tested on every mutating endpoint
**As an** evaluating reviewer, **I want** automated proof that every mutation is audited and no audit record can be changed, **so that** the immutability claim is verified rather than promised.

**Acceptance Criteria:**
- [ ] Given every mutating endpoint, when the suite runs, then each produces exactly one audit record of the expected type per successful invocation.
- [ ] Given the audit API, when routes are enumerated, then no update or delete method exists under it.
- [ ] Given static analysis, when it runs, then no update or delete statement against the audit table exists anywhere in the implementation.
- [ ] Given a record altered outside the application, when the integrity check runs, then it detects the break and names the first broken sequence number.
- [ ] Given the audit store is made unavailable, when a mutation is attempted, then the test asserts the mutation is reported as failed.

**Priority:** P1 | **Feature Ref:** F19, F13 | **Persona:** PER-04 | **FRD:** FR-F19-05

---

### US-149: Have accessibility checked on every route for every role
**As an** evaluating reviewer, **I want** an automated accessibility scan that fails the build, **so that** a federal conformance claim is backed by a gate rather than by intent.

**Acceptance Criteria:**
- [ ] Given CI runs, when the scan executes, then it covers every authenticated route for every role, plus error, empty, and degraded states.
- [ ] Given any serious or critical violation, when the scan reports, then the build fails; moderate and minor violations are reported and tracked.
- [ ] Given the keyboard smoke test, when it runs, then it asserts reachability and operability of every primary control.
- [ ] Given a change that introduces a violation, when it is proposed, then it does not merge.
- [ ] Given the documented manual keyboard and screen-reader pass, when it is performed before the demonstration, then it is recorded with date, tooling, and findings.

**Priority:** P1 | **Feature Ref:** F19, F14 | **Persona:** PER-04 | **FRD:** FR-F19-06, FR-F19-07, FR-F14-12

---

### US-150: Prove that every button really does work
**As an** evaluating reviewer, **I want** an automated crawl of every navigation item and primary control for every role, **so that** the "every button works" promise is enforced rather than hoped for.

**Acceptance Criteria:**
- [ ] Given every role's navigation, when the crawl runs, then every item resolves to a real, populated page — zero 404s and zero empty shells.
- [ ] Given every primary control on every screen, when the crawl runs, then each has a handler producing an observable result — zero non-functional controls.
- [ ] Given every route including login and error screens, when the crawl runs, then the demo banner is asserted present with no close control and no hidden computed style.
- [ ] Given authentication routes, when the copy scan runs, then it finds zero prohibited terms implying real credential validation.
- [ ] Given a feature with a non-functional control, when it is proposed for merge, then it does not merge — scope is cut rather than a stub shipped.

**Priority:** P1 | **Feature Ref:** F19, F3 | **Persona:** PER-04 | **FRD:** FR-F19-08, FR-F03-03

---

### US-151: Read the test results without reading a CI log
**As an** evaluating reviewer, **I want** a readable summary of what was verified, **so that** I can judge the evidence without being a build engineer.

**Acceptance Criteria:**
- [ ] Given a completed CI run, when I open the results summary, then it states, in plain language, the flagship workflow outcome, access-control coverage, adapter conformance, resilience results, audit coverage, and the accessibility scan result.
- [ ] Given the summary, when I read it, then it reports pass or fail against each named success metric rather than only a raw test count.
- [ ] Given the test environment, when the suite runs, then it is deterministic — the same seed and the same reset produce the same result on repeated runs.
- [ ] Given the summary, when it is produced, then it is an artefact a reviewer can be handed rather than a log they must interpret.

**Priority:** P1 | **Feature Ref:** F19 | **Persona:** PER-04 | **FRD:** FR-F19-09, FR-F19-10

---
