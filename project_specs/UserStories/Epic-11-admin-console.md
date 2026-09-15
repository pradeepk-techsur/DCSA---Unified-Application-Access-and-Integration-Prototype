## Epic 11: Administrator Console — Connected Applications, Health, and Integration Issues (F11)

The administrator's operational view of the unified layer: what is connected, whether it is working, and what has gone wrong. This is the epic that demonstrates the platform is *operable*, not merely usable — and every console action is itself authorised and audited, because administrators are not exempt.

---

### US-086: See everything that is connected to the platform
**As an** Administrator, **I want** an inventory of every registered application with its full configuration, **so that** I can answer "what is attached to this platform right now" from one screen.

**Acceptance Criteria:**
- [ ] Given I open the connected-applications screen, when it renders, then every registered application is listed with display name, identifier, adapter type, endpoint, work-item type count, supported action count, roles it is visible to, health, enabled state, and registration date.
- [ ] Given the list renders, when I inspect its source, then every value is read directly from the registry rather than from a hard-coded list.
- [ ] Given disabled or invalid applications exist, when the list renders, then they appear with their state clearly marked rather than hidden.
- [ ] Given I sort, filter, or search the table, when results return, then the interaction behaves exactly as the work queue does and the new result count is announced.
- [ ] Given health is displayed, when I read it, then it is text plus icon with the last-check timestamp shown so staleness is visible.
- [ ] Given the sixth application is registered, when I return to this screen, then it appears immediately with no restart.

**Priority:** P1 | **Feature Ref:** F11, F8 | **Persona:** PER-04 | **FRD:** FR-F11-01

---

### US-087: Know whether each connected system is healthy before a user tells me
**As an** Administrator, **I want** per-application health with latency and check history, **so that** the first signal of an outage is my console rather than an investigator's phone call.

**Acceptance Criteria:**
- [ ] Given I open the system health screen, when it renders, then it summarises counts of healthy, degraded, and unavailable as text plus icon, and lists per-application current status, last successful check, last attempt, current latency, rolling p50/p95, consecutive failure count, circuit state, and next scheduled probe.
- [ ] Given I want to know what a state means, when I open the "What do these states mean?" disclosure, then each state's precise definition is shown.
- [ ] Given a spoke is stopped, when one probe interval elapses, then it moves to unavailable and the circuit opening is visible.
- [ ] Given the spoke is restarted, when the next probe succeeds, then it returns to healthy and the circuit closes automatically with no action from me.
- [ ] Given the health monitor itself is not running, when I open the screen, then a warning states so — an absent monitor never masquerades as all-healthy.
- [ ] Given I expand check history, when it renders, then the last fifty checks are shown with timestamp, status, latency, and error class.

**Priority:** P1 | **Feature Ref:** F11, F16 | **Persona:** PER-04 | **FRD:** FR-F11-02, FR-F16-03

---

### US-088: Diagnose an integration failure from one place
**As an** Administrator, **I want** a filterable log of adapter and orchestration failures with correlation IDs, **so that** a user's report becomes one query rather than an afternoon of manual log merging.

**Acceptance Criteria:**
- [ ] Given I open the integration issues screen, when it renders, then each row shows timestamp, application, operation, error class, affected user where applicable, correlation ID, attempt number, and the circuit state at time of failure.
- [ ] Given the default view, when it loads, then it shows the last 24 hours newest-first with a prominent count reading "{n} issues in the last 24 hours."
- [ ] Given a row, when I follow its links, then I reach the correlated audit chain and the application detail in one click each.
- [ ] Given I need the technical detail, when I open a row, then it carries the spoke HTTP status, a truncated escaped response excerpt, and the adapter request ID — the detail deliberately suppressed from user-facing messages appears here and only here.
- [ ] Given I induce an adapter failure, when one health-check interval elapses, then exactly one new correctly attributed entry appears.
- [ ] Given no issues in the selected range, when the list renders, then it reads "No integration issues in this period. That's good news."
- [ ] Given a correlation ID cell, when I read it, then it is selectable, copyable text rather than an image or a truncated cell with no accessible full value.

**Priority:** P1 | **Feature Ref:** F11, F16 | **Persona:** PER-04 | **FRD:** FR-F11-03, FR-F16-09

---

### US-089: See everything about one application in one place
**As an** Administrator, **I want** a detail view per application covering configuration, capabilities, resilience policy, health history, and recent errors, **so that** I can decide whether to retest, reconfigure, or disable it without leaving the screen.

**Acceptance Criteria:**
- [ ] Given I open an application's detail, when it renders, then it shows configuration with the identifier marked immutable, capabilities from the cached description with the time it was captured, work-item types and status maps as an inspectable table, supported actions with their required permissions, resilience policy, health history, the last twenty integration issues, and provenance.
- [ ] Given the configuration section, when I read it, then it states "This prototype uses no credentials for spoke connections."
- [ ] Given the row's configuration is invalid, when the page renders, then a warning names the field and the reason and states that the application will not appear for users until it is fixed.
- [ ] Given I choose a destructive action, when the confirmation opens, then it requires typing the application's display name plus a reason and states the consequences, including how many work items will stop appearing.
- [ ] Given a confirmation dialog opens, when I operate it by keyboard, then focus is trapped and restored to the invoking control on close.

**Priority:** P1 | **Feature Ref:** F11 | **Persona:** PER-04 | **FRD:** FR-F11-04

---

### US-090: Test a connection live, in front of a reviewer
**As an** Administrator, **I want** an on-demand connection test that bypasses cached results, **so that** I can prove an application's state at this exact moment rather than quoting a stale check.

**Acceptance Criteria:**
- [ ] Given I choose "Check now" or "Test connection", when it runs, then the hub calls the application's health and description endpoints live, bypassing both the cache and the circuit breaker.
- [ ] Given the result returns, when it renders, then it is announced via a live region — "Connection test complete. {System} is healthy, responded in {n} milliseconds."
- [ ] Given the application is stopped, when the test runs, then it reports "We couldn't reach {name} at {endpoint}. Check that the application is running and the address is correct."
- [ ] Given the application responds slowly, when the test completes, then it reports "{name} responded, but slowly ({n} ms). Users may see delays."
- [ ] Given capabilities have drifted since the last cached description, when the test completes, then the additions and removals are listed explicitly.
- [ ] Given the test runs, when it completes, then an audit record naming me and the outcome is written.

**Priority:** P1 | **Feature Ref:** F11 | **Persona:** PER-04 | **FRD:** FR-F11-05

---

### US-091: Tell users something without sending an email blast
**As an** Administrator, **I want to** author announcements targeted by role with effective and expiry dates, **so that** the right people see the right notice in the place they already look.

**Acceptance Criteria:**
- [ ] Given I create an announcement with a title, plain-text body, severity, target roles, and effective and expiry dates, when it becomes effective, then it appears on the targeted roles' dashboards within one poll and not on others'.
- [ ] Given I leave target roles empty, when I submit, then validation reads "Choose at least one role to show this to."
- [ ] Given I set an expiry earlier than the effective date, when I submit, then validation reads "Enter an end date and time that comes after the start."
- [ ] Given I materially change an active announcement's body or severity, when I save, then the form warns "Changing the message will show it again to people who dismissed it."
- [ ] Given I expire an announcement, when it is processed, then it is soft-expired rather than deleted, so the audit trail stays meaningful.
- [ ] Given an emergency-severity announcement, when it renders for a user, then it is non-dismissible, the component explains why, and it still never obscures the demo banner.
- [ ] Given any create, edit, or expire action, when it completes, then an audit record with a before/after summary names me.

**Priority:** P1 | **Feature Ref:** F11, F15 | **Persona:** PER-04 | **FRD:** FR-F11-06, FR-F15-04

---

### US-092: Use a console that is as accessible as the rest of the product
**As an** Administrator who uses a screen reader, **I want** the console tables and dialogs to follow the same accessible patterns as the work queue, **so that** "internal tooling" is not treated as exempt from Section 508.

**Acceptance Criteria:**
- [ ] Given every console table — inventory, health, check history, integration issues, identities, audit — when each renders, then it has a caption, column header scopes, a row header, sortable headers that announce sort state, accessible pagination, and announced result counts.
- [ ] Given any health, outcome, or enabled state, when it renders, then it is conveyed by text and icon and never by colour alone.
- [ ] Given a destructive confirmation dialog, when I operate it by keyboard, then focus is trapped while open, Escape closes it, and focus returns to the invoking control.
- [ ] Given every console screen, when the accessibility scan runs, then it reports zero serious or critical violations.
- [ ] Given every console screen, when it renders, then it carries the demo banner and the same shell as user-facing screens.

**Priority:** P1 | **Feature Ref:** F11, F14 | **Persona:** PER-04 | **FRD:** FR-F11-07, FR-F14-04

---

### US-093: Account for my own actions the same way everyone else does
**As an** Administrator, **I want** my own console actions to be authorised and audited, **so that** the claim that administrators are not exempt survives inspection.

**Acceptance Criteria:**
- [ ] Given any console mutation I perform, when it completes, then exactly one audit record names me, my roles at the time, the target, and a before/after summary.
- [ ] Given I view an identity's detail, when the page loads, then a read audit record is written — identity reads are auditable.
- [ ] Given I open the audit viewer, when it loads, then my own console actions are visible there attributed to me.
- [ ] Given an Investigator, Adjudicator, or Applicant attempts any console route, when the request is evaluated, then it is denied and the denial is audited.
- [ ] Given the console, when I look for a privileged bypass, then none exists — every console endpoint runs the same authorisation pipeline as every other.

**Priority:** P1 | **Feature Ref:** F11, F13, F2 | **Persona:** PER-04 | **FRD:** FR-F11-07, FR-F13-02

---
