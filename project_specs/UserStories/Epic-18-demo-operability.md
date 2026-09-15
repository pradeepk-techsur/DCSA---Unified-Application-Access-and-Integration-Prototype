## Epic 18: Demo Operability — Single-Command Run and Scripted Demonstration Path (F18)

The prototype must build, run, and be demonstrated from one documented command sequence, with a scripted path that drives the flagship workflow reliably. Per the project charter: a prototype nobody can start is a prototype that scored zero. These stories are written from the point of view of the reviewer who has never seen the repository and the operator who did not build it.

---

### US-138: Start the whole prototype with one command
**As an** evaluating reviewer with no prior exposure, **I want** a single documented command that brings up everything, **so that** I can be looking at a signed-in dashboard within ten minutes of cloning.

**Acceptance Criteria:**
- [ ] Given a clean checkout on a clean machine, when I run the documented start command, then the hub, the web UI, all five spoke services, the unregistered sixth service, all data namespaces, and the seeded data all come up.
- [ ] Given the command completes, when I read its output, then it prints the UI URL, the hub API URL, every spoke's URL and port, the four demonstration persona sign-ins, the reset command, and the shutdown command.
- [ ] Given I follow the README only, when I time myself, then I reach a signed-in dashboard in under ten minutes including image pulls.
- [ ] Given the environment is already running, when I run the command again, then it reports current state rather than erroring or duplicating.
- [ ] Given a spoke fails to start, when the rest comes up, then the hub still starts and that spoke begins in an unavailable state — which is exactly the degraded behaviour the product is designed to handle.
- [ ] Given a port clash, when I need to resolve it, then I can change the port in one environment file without editing code.

**Priority:** P0 | **Feature Ref:** F18 | **Persona:** PER-04 | **FRD:** FR-F18-01

---

### US-139: Be told precisely what is wrong when startup fails
**As an** evaluating reviewer, **I want** pre-flight checks that name the problem and the fix, **so that** a missing prerequisite costs me a minute rather than an hour.

**Acceptance Criteria:**
- [ ] Given a port is already in use, when pre-flight runs, then startup stops before launching anything and reports "Port {n} is already in use by another process. Stop it, or change {VAR} in .env and try again."
- [ ] Given a prerequisite tool is missing or too old, when pre-flight runs, then it names the tool, the required version, and what was found.
- [ ] Given insufficient memory, when pre-flight runs, then it warns with the available and recommended amounts rather than failing silently.
- [ ] Given any pre-flight failure, when it reports, then it states what is wrong and what to do — never a bare exit code.
- [ ] Given seed validation fails after startup, when it reports, then startup fails with the specific missing precondition named.

**Priority:** P0 | **Feature Ref:** F18, F17 | **Persona:** PER-04 | **FRD:** FR-F18-03, FR-F18-01

---

### US-140: Drive the flagship workflow from a script, unaided
**As an** evaluating reviewer, **I want** a numbered script naming the persona, every control to activate, and the expected state at each step, **so that** I can complete the product's most important workflow in under three minutes without being coached.

**Acceptance Criteria:**
- [ ] Given the flagship script, when I read it, then each step states the action, the exact control, and the expected observable state.
- [ ] Given a freshly reset environment, when I follow the script from sign-in through resolution to the dual-system confirmation, then every step's expected state matches actual behaviour.
- [ ] Given the script, when I reach the verification steps, then it tells me how to confirm both systems changed — both in the UI and by calling the two spoke APIs directly.
- [ ] Given I follow the script unaided, when I time myself, then I complete it in under three minutes.
- [ ] Given the primary seeded issue has already been consumed mid-session, when I consult the script, then a documented fallback item is named.
- [ ] Given the automated end-to-end test, when its path is compared to the script, then they match exactly, so a passing test means a working demonstration.

**Priority:** P0 | **Feature Ref:** F18, F7 | **Persona:** PER-04, PER-01 | **FRD:** FR-F18-05

---

### US-141: Demonstrate the other four claims from scripts too
**As an** Administrator running the demonstration, **I want** secondary scripts for access control, degradation, registration, and audit, **so that** every claim the prototype makes has a repeatable path rather than an improvisation.

**Acceptance Criteria:**
- [ ] Given the access-control script, when I follow it, then I open the same item as two different roles and show the differing action sets, issue a direct API call as an applicant and show the server-side denial, and then show that denial in the audit viewer.
- [ ] Given the degradation script, when I follow it, then I force a spoke unavailable, show the named and quantified warning with the rest of the queue still usable and the dependent action disabled, then clear it and show automatic recovery with no reload.
- [ ] Given the registration script, when I follow it, then I register the sixth application including the live connection test, and in a second browser an already-signed-in investigator sees its items appear without signing out.
- [ ] Given the audit script, when I follow it, then I filter by correlation ID, open the chain view, export the filtered view, and show the integrity indicator.
- [ ] Given each script, when I read its heading, then it names its starting persona and its reset precondition.
- [ ] Given all four scripts, when they are run on a freshly reset environment, then all four succeed.

**Priority:** P0 | **Feature Ref:** F18, F2, F12, F13, F16 | **Persona:** PER-04 | **FRD:** FR-F18-06

---

### US-142: Know the environment is ready before I stand up to present
**As an** Administrator, **I want** one page that tells me whether this environment is demonstration-ready, **so that** the question I actually have at 09:58 has a one-glance answer.

**Acceptance Criteria:**
- [ ] Given I open the service status page, when it renders, then every service is listed with running state, version, health, latency, port, current failure-injection state, and namespace row counts.
- [ ] Given the readiness summary at the top, when it renders, then it reports green, amber, or red with text, checking that all services are up, seed validation passed, the sixth application is unregistered, and no failure injection is active.
- [ ] Given the sixth application is already registered or an injection is active, when the summary renders, then it reports amber with the specific reason and the fix.
- [ ] Given a service is down, when the summary renders, then it reports red naming the service and the command to start it.
- [ ] Given the page's actions, when I use them, then I can run reset with typed confirmation, clear all failure injection, re-run seed validation, and issue an operator token.
- [ ] Given a non-administrator, when they request the page, then access is denied and the attempt is audited.

**Priority:** P0 | **Feature Ref:** F18 | **Persona:** PER-04 | **FRD:** FR-F18-07

---

### US-143: Take one system down deliberately and put it back
**As an** Administrator, **I want** each service independently startable and stoppable by documented command, **so that** "what happens when Investigation Management is down" is a real experiment rather than a simulation of one.

**Acceptance Criteria:**
- [ ] Given each of the seven services, when I stop and restart it by documented command, then it behaves independently of the others.
- [ ] Given I stop a spoke process outright, when the product is used, then unavailability is genuine at the network level, distinct from in-process failure injection.
- [ ] Given both mechanisms exist, when I consult the documentation, then it explains which to use when — stopping the process is the more convincing demonstration, injection is the safer one mid-demonstration because it auto-clears.
- [ ] Given I restart a spoke, when it comes back, then no hub restart and no user re-authentication is required.
- [ ] Given I need to diagnose one service, when I consult the documentation, then per-service log commands are documented.

**Priority:** P0 | **Feature Ref:** F18, F9, F16 | **Persona:** PER-04 | **FRD:** FR-F18-02

---

### US-144: Recover from the three things most likely to go wrong on the day
**As an** Administrator, **I want** documented troubleshooting and a clean shutdown, **so that** a demonstration-day problem has a known fix rather than an audience watching me debug.

**Acceptance Criteria:**
- [ ] Given a port clash, a spoke that did not start, or seed state consumed mid-demonstration, when I consult the README's troubleshooting section, then each is documented with symptom, cause, and fix.
- [ ] Given a stale browser session after a reset, or a sixth application left registered from a prior run, when I consult the documentation, then each has a documented fix.
- [ ] Given each documented symptom, when it is reproduced, then the documented fix resolves it.
- [ ] Given the shutdown command, when I run it, then all services stop, all ports are released with no orphaned processes, in-flight requests complete or cancel within ten seconds, and the command reports what it stopped.
- [ ] Given a purge variant, when I run it, then data volumes are removed and the machine returns to its pre-run state; a subsequent start succeeds without manual cleanup.
- [ ] Given the README, when I check it, then the fresh-machine dry-run verification date is present and recent.

**Priority:** P0 | **Feature Ref:** F18 | **Persona:** PER-04 | **FRD:** FR-F18-08, FR-F18-09, FR-F18-04

---
