## Epic 16: Health Monitoring, Resilience, and Degraded-System Experience (F16)

Background health checking of every registered application, plus the complete set of resilience behaviours and user-visible states that keep the prototype usable when a spoke misbehaves. The requirement is explicit and absolute: adapter failure degrades visibly and gracefully. Never a blank page, never an unhandled error, never a silent omission.

---

### US-125: Have the platform watch every connected system for me
**As an** Administrator, **I want** background health probing of every enabled application with defined states, **so that** "degraded" means something specific rather than something I have to guess.

**Acceptance Criteria:**
- [ ] Given every enabled application, when the monitor runs, then it probes each on its configured interval, concurrently, without ever blocking a user request.
- [ ] Given a probe, when it executes, then it uses the configured health timeout, performs no retries, and bypasses the circuit breaker so recovery is detected while the circuit is open.
- [ ] Given each state, when it is defined, then healthy means a fast successful probe, degraded means a slow or self-reported-degraded probe or a recent data-call error rate above twenty percent, and unavailable means a failed probe or an open circuit.
- [ ] Given a single transient failure, when it occurs, then a healthy system is not flipped to unavailable — two consecutive failures are required, while one success is enough to recover.
- [ ] Given a state transition, when it occurs, then it is recorded and visible in the console's health history.
- [ ] Given the monitor itself is not running, when the console renders, then a warning says so rather than letting an absent monitor look like all-healthy.

**Priority:** P1 | **Feature Ref:** F16, F11 | **Persona:** PER-04 | **FRD:** FR-F16-01, FR-F16-02, FR-F16-03

---

### US-126: Be stopped before I start an action that cannot succeed
**As an** Investigator, **I want** actions targeting an unavailable system disabled in advance with an explanation, **so that** I never lose a narrative to a submission that was doomed before I pressed the button.

**Acceptance Criteria:**
- [ ] Given a target system is unavailable, when the action panel renders, then the action is disabled with "{System} isn't responding right now. Try again when it's back."
- [ ] Given an action writes to two systems and either is unavailable, when the panel renders, then it is disabled and the reason names which — "eApp isn't responding right now, so this issue can't be resolved yet."
- [ ] Given a system is merely degraded rather than down, when the panel renders, then the action remains enabled and a warning states "{System} is responding slowly. This may take longer than usual."
- [ ] Given the system recovers, when the next health poll lands, then the control is re-enabled without a reload and the change is announced politely — "eApp is available again. You can now resolve this issue."

**Priority:** P1 | **Feature Ref:** F16, F6 | **Persona:** PER-01 | **FRD:** FR-F16-04

---

### US-127: Be told what is missing, where it is missing
**As an** Investigator, **I want** a degraded warning on the exact screen where data is incomplete, naming the system and quantifying the gap, **so that** I learn what is missing *here* rather than reading a generic banner.

**Acceptance Criteria:**
- [ ] Given incomplete data is shown, when the screen renders, then a warning alert names the affected application and quantifies the gap — "Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date."
- [ ] Given no prior successful count exists, when the notice renders, then the number is omitted rather than guessed.
- [ ] Given more than one system is affected, when the notice renders, then each is named and quantified individually rather than merged into "some systems are unavailable".
- [ ] Given the work queue, the dashboard, search results, notifications, and related-items panels, when any of them renders incomplete data, then each shows its own contextual warning.
- [ ] Given the warning first appears, when a screen reader is in use, then it is announced once and not re-announced on every poll.
- [ ] Given no screen anywhere, when data from a failed source is omitted, then it is never omitted silently.

**Priority:** P1 | **Feature Ref:** F16, F5 | **Persona:** PER-01 | **FRD:** FR-F16-05

---

### US-128: Watch a page fill in rather than sit blank
**As an** Investigator on an intermittent VPN, **I want** loading states at section granularity, **so that** a slow system never makes the whole product look broken.

**Acceptance Criteria:**
- [ ] Given a slow source, when a page loads, then skeletons appear at widget and section granularity and the page is never wholly blanked.
- [ ] Given a loading region, when it renders, then it is marked busy with a visually hidden "Loading {region}" label and announces completion exactly once.
- [ ] Given a skeleton, when it renders, then it preserves layout dimensions so content does not shift when data arrives.
- [ ] Given a region still loading past its configured timeout, when the timeout elapses, then it transitions to its error or degraded state — no spinner persists indefinitely.
- [ ] Given the reduced-motion preference, when skeletons render, then shimmer is disabled.

**Priority:** P1 | **Feature Ref:** F16, F14 | **Persona:** PER-01 | **FRD:** FR-F16-06

---

### US-129: Never confuse "nothing to do" with "nothing loaded"
**As an** Adjudicator, **I want** empty states and degraded states to read differently, **so that** I never adjudicate on incomplete data because a spoke was quietly down.

**Acceptance Criteria:**
- [ ] Given every list, table, and widget in the product, when it has no content, then it shows a designed empty state with a heading, an explanation of what would appear, and an action where one exists.
- [ ] Given an empty state and a degraded state on the same surface, when both copies are compared, then "You have no assigned work" is never used to describe "We couldn't load your work."
- [ ] Given PVQ is unavailable while I review a subject, when the issues region renders, then I see a named warning that issue data is missing — never an empty list that reads as "no issues".
- [ ] Given a forced outage, when the empty-versus-degraded test runs, then it confirms the two states are never conflated.
- [ ] Given the zero-item applicant persona, when they sign in, then every one of their screens shows its designed empty state, making the empty case demonstrable rather than theoretical.

**Priority:** P1 | **Feature Ref:** F16 | **Persona:** PER-02, PER-03 | **FRD:** FR-F16-07

---

### US-130: Never see a blank page or a stack trace
**As a** user in any role, **I want** every unexpected condition to render a usable error screen inside the product, **so that** a failure never ends my session with a browser default page.

**Acceptance Criteria:**
- [ ] Given an unhandled client-side condition, when it occurs, then the global boundary renders an error screen inside the shell with "Something went wrong", a plain explanation, a correlation ID, and the actions "Try again" and "Go to my dashboard".
- [ ] Given an uncaught server-side exception, when it occurs, then the standard error envelope is returned and no framework default error page is ever served.
- [ ] Given the error screen, when it renders, then it carries the demo banner, a descriptive title, focus on the heading, and an assertive announcement.
- [ ] Given a fault-injection crawl across every route, when it runs, then no route produces a blank page or a stack trace.
- [ ] Given an error is caught by the boundary, when it is handled, then it is reported to the server with its correlation ID so it appears in the integration log.

**Priority:** P1 | **Feature Ref:** F16 | **Persona:** PER-01, PER-02, PER-03, PER-04 | **FRD:** FR-F16-10, FR-F16-08

---

### US-131: Break a system on purpose in front of a reviewer
**As an** Administrator, **I want** controls to force any connected application into an unavailable, slow, or erroring state, **so that** resilience is demonstrated live rather than described.

**Acceptance Criteria:**
- [ ] Given I open the failure-injection screen, when it renders, then every application is listed with its current injection state, controls for each mode, a "Clear all" action, and a prominent notice that injected states affect all users of the environment.
- [ ] Given I force Investigation Management unavailable, when an Investigator refreshes, then their queue renders the other four sources with the named, quantified warning, the dashboard shows its notice, dependent actions are disabled — and no error page appears anywhere.
- [ ] Given I force a slow state, when pages load, then loading states and the degraded treatment appear rather than a stall.
- [ ] Given I set a duration, when it elapses, then injection auto-clears, so a forgotten injection cannot silently break a later demonstration.
- [ ] Given injection is active, when I check the health screen and the service status page, then the injected state is surfaced so no operator mistakes it for a real outage.
- [ ] Given any injection change, when it completes, then it is authorised and audited.
- [ ] Given a non-administrator attempts to reach these controls, when the request is evaluated, then it is denied and audited.

**Priority:** P1 | **Feature Ref:** F16 | **Persona:** PER-04 | **FRD:** FR-F16-11

---

### US-132: Watch the system heal itself without anyone touching it
**As an** Investigator, **I want** a restored system to reappear on its own, **so that** an outage costs me a wait rather than a sign-out.

**Acceptance Criteria:**
- [ ] Given a spoke is restored, when the next probe succeeds, then the circuit half-opens and closes and the stored state becomes healthy.
- [ ] Given my client is polling, when the change is detected within thirty seconds, then the degraded notice clears, affected actions are re-enabled, and a polite announcement offers a refresh control.
- [ ] Given recovery occurs, when it completes, then it required no page reload, no re-authentication, and no administrator action.
- [ ] Given mutations that failed during the outage, when recovery happens, then none is silently replayed — replaying a failed write without my knowledge would be unsafe.
- [ ] Given a partially completed orchestration, when recovery happens, then it converges through its own retry queue independently of health polling.

**Priority:** P1 | **Feature Ref:** F16, F7 | **Persona:** PER-01 | **FRD:** FR-F16-12

---
