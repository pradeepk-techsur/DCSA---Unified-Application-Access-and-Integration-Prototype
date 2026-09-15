## Epic 8: Adapter Framework and Data-Driven Application Registry (F8)

The common interface every spoke integration implements, plus the configuration-driven registry that tells the hub which applications exist and what they can do. This is the mechanism that makes "onboard the next application" a configuration change rather than an engineering project — and it is the reason the hub contains no hard-coded list of five systems anywhere.

---

### US-070: Add or remove an application without touching hub code
**As an** Administrator, **I want** navigation, the work queue, health monitoring, and the console inventory all to read from one registry, **so that** changing the connected estate is configuration rather than a deployment.

**Acceptance Criteria:**
- [ ] Given an application is removed from the registry, when users next load the product, then it disappears from navigation, the work queue, search, and the console with no code change and no errors anywhere.
- [ ] Given the hub's source is inspected, when a reviewer looks for a list of applications, then no hard-coded list of five systems exists in the hub.
- [ ] Given the registry declares an application's work-item types and supported actions, when the UI renders them, then it renders exactly what was declared — no more and no less.
- [ ] Given an application is added to the registry, when the queue fans out, then it is included automatically.

**Priority:** P0 | **Feature Ref:** F8 | **Persona:** PER-04 | **FRD:** FR-F08b-01, FR-F08b-02, FR-F05-02

---

### US-071: Turn an application off at runtime when it is misbehaving
**As an** Administrator, **I want to** disable a connected application from the console, **so that** I can contain a failing integration without redeploying anything.

**Acceptance Criteria:**
- [ ] Given I disable an application, when users' entitlements next refresh, then its navigation entry disappears within one registry poll without a restart and without anyone signing out.
- [ ] Given an application is disabled, when a user opens one of its items, then they are told "{System} is turned off in this environment. Contact your administrator if you need access."
- [ ] Given an application is disabled, when the queue fans out, then that source is marked skipped and contributes nothing, without producing an error.
- [ ] Given I re-enable it, when the change takes effect, then health probing resumes immediately rather than waiting for the next scheduled interval.
- [ ] Given I disable or enable an application, when the action completes, then an audit record names me, the application, and the change.

**Priority:** P1 | **Feature Ref:** F8, F11 | **Persona:** PER-04 | **FRD:** FR-F08b-03, FR-F11-04

---

### US-072: Have an application that supports fewer actions degrade its controls rather than error
**As an** Investigator, **I want** a connected application that cannot do something to simply not offer it, **so that** I never encounter a control that fails when I use it.

**Acceptance Criteria:**
- [ ] Given an application declares a reduced capability set, when its items render, then only the declared actions appear and nothing errors.
- [ ] Given an application does not support capability description at all, when it is registered, then it is registered with no work-item types and the console says so explicitly.
- [ ] Given an adapter's declared capabilities change, when a connection test is run, then the difference is reported — for example "This application now reports 1 new action: REQUEST_EXTENSION."
- [ ] Given a registered action is removed from an application's declaration, when the UI next renders, then that control no longer appears anywhere.

**Priority:** P1 | **Feature Ref:** F8 | **Persona:** PER-01, PER-04 | **FRD:** FR-F08a-07, FR-F08a-02

---

### US-073: Have one slow application bounded so it cannot stall everyone else
**As an** Investigator, **I want** per-application timeouts, retries, and circuit breaking, **so that** one struggling system cannot hold my whole queue hostage.

**Acceptance Criteria:**
- [ ] Given an application's timeout, retry, and circuit policy is configured in the registry, when the hub calls it, then those values are honoured without a code change.
- [ ] Given one source is slow, when the queue aggregates, then it returns when the other adapters have settled or the slow one's timeout elapses — it never waits beyond the configured budget.
- [ ] Given repeated failures against one application, when the threshold is reached, then the circuit opens and the hub stops calling it for data.
- [ ] Given the circuit is open, when health probing continues, then probes still run so recovery is detected, and the circuit half-opens and closes on success.
- [ ] Given every adapter call, when it completes or fails, then it is logged with its correlation ID and feeds both the audit trail and the integration issues log.

**Priority:** P1 | **Feature Ref:** F8, F16 | **Persona:** PER-01, PER-04 | **FRD:** FR-F08a-05, FR-F08b-05

---

### US-074: Prove a new adapter is correct before it is trusted
**As an** Administrator onboarding a new application, **I want** a conformance test suite any adapter must pass, **so that** a new integration is verified rather than hoped for.

**Acceptance Criteria:**
- [ ] Given a candidate adapter, when the conformance suite is run standalone, then it verifies every interface operation — list, get, act, history, health, and describe.
- [ ] Given the suite runs, when it checks normalisation, then it asserts that every native status maps to exactly one normalised category and that an unmapped status is a failure.
- [ ] Given the suite runs, when it checks scope enforcement, then it asserts the spoke applies the supplied ownership scope in its own query rather than returning a full set for the hub to filter.
- [ ] Given the suite runs, when it checks behaviour under stress, then it exercises timeout, error, and unavailable conditions.
- [ ] Given the demonstration sixth application, when the suite is run against it, then it passes.

**Priority:** P1 | **Feature Ref:** F8, F19 | **Persona:** PER-04 | **FRD:** FR-F08a-08, FR-F19-03

---

### US-075: Be protected from a mis-registered application reaching users
**As an** Administrator, **I want** the registry validated at startup and flagged when a row is wrong, **so that** a misconfiguration is caught before a user meets it.

**Acceptance Criteria:**
- [ ] Given a registry row has an invalid configuration, when the console lists it, then the row is shown with a warning naming the field and the reason, and it does not appear for users until fixed.
- [ ] Given a disabled or invalid application, when the console renders, then it is listed with its state marked rather than hidden — an administrator troubleshooting an absence needs to see the row.
- [ ] Given startup runs, when registry validation executes, then a structurally invalid registry fails the startup check with a specific message.
- [ ] Given an adapter returns a record that does not satisfy the normalised work-item schema, when the hub validates it, then the record is dropped, one integration issue is recorded naming the application and field, and the queue still renders the remainder.

**Priority:** P1 | **Feature Ref:** F8, F11 | **Persona:** PER-04 | **FRD:** FR-F08b-06, FR-F05-02, FR-F11-04

---
