## Epic 12: Application Registration and Onboarding Flow (F12)

The extensibility proof. Registering a sixth application is a configuration action performed live in the UI during the demonstration — no code change, no redeploy, no restart. The demonstration sixth application, the Continuous Vetting Service (`CVS`), ships running but deliberately unregistered, so its absence before registration is itself part of the evidence.

---

### US-094: Register a new application through a guided form
**As an** Administrator, **I want** a step-by-step registration form with state preserved between steps, **so that** onboarding an application is a five-minute configuration task rather than an engineering project.

**Acceptance Criteria:**
- [ ] Given I start registration, when the form renders, then it presents five steps — Identity, Connection, Test connection, Capabilities, Access and review — with a step indicator, `aria-current="step"` on the active step, and a text counter reading "Step 3 of 5".
- [ ] Given I complete a step and continue, when validation fails, then an error summary appears at the top with focus moved to it and in-page links to each offending field.
- [ ] Given I navigate back to a completed step, when it renders, then my entered values are preserved.
- [ ] Given I refresh the page or extend my session mid-flow, when I return, then my draft is intact because it is held server-side.
- [ ] Given I reach step five, when the review renders, then every value is restated read-only with an edit link per step, plus the consequence: "{displayName} will become visible to {roles} and its work items will appear in their work queues immediately."
- [ ] Given I complete registration during a live demonstration, when I time it, then it takes under five minutes.
- [ ] Given I use only the keyboard, when I complete the whole flow, then every control is reachable and operable.

**Priority:** P1 | **Feature Ref:** F12 | **Persona:** PER-04 | **FRD:** FR-F12-01

---

### US-095: Be caught before I register something broken
**As an** Administrator, **I want** each field validated with a specific message, **so that** a typo is caught in the form rather than discovered later by a user with an empty queue.

**Acceptance Criteria:**
- [ ] Given I submit a duplicate application identifier, when validation runs, then I am told specifically "That application ID is already in use. Choose a different one." — not a generic failure.
- [ ] Given I submit an identifier that was previously de-registered, when validation runs, then it is still rejected as in use, because audit records and historical work-item identifiers refer to it.
- [ ] Given I submit a base endpoint containing embedded credentials, when validation runs, then I am told "Remove the username and password from the address."
- [ ] Given I submit a timeout, retry, backoff, or circuit value outside its permitted range, when validation runs, then the message names the permitted range.
- [ ] Given I submit an action requiring a permission that does not exist in the role matrix, when validation runs, then I am told "That permission doesn't exist in this system. Choose one from the list."
- [ ] Given I register an application declaring zero work-item types, when the review renders, then it states plainly "This application won't add any work items to users' queues."
- [ ] Given every documented rule, when the validation test suite runs, then each produces its exact specified message.

**Priority:** P1 | **Feature Ref:** F12 | **Persona:** PER-04 | **FRD:** FR-F12-02

---

### US-096: Test the connection before I commit to it
**As an** Administrator, **I want** the hub to call the candidate application live before registration is allowed, **so that** a broken registration never reaches a user.

**Acceptance Criteria:**
- [ ] Given I reach the test step, when the test runs, then results render as a checklist with per-check status text plus icon covering reachability, health response, capability description, integration version support, declared work-item types, declared actions, and permission validity.
- [ ] Given all checks pass, when the step settles, then "Continue" is enabled and the discovered capabilities are cached.
- [ ] Given the application is unreachable, when the test completes, then "Continue" remains disabled and I am told "We couldn't reach that application at {endpoint}. Check that it's running and the address is correct." with a "Test again" control.
- [ ] Given the application responds but reports a degraded state or declares no work-item types, when the test completes, then I may continue only after explicitly ticking "I understand and want to register this application anyway."
- [ ] Given the application uses an unsupported integration version, when the test completes, then I am told which version it uses and which are supported, and registration is blocked.
- [ ] Given the test result is older than ten minutes at submission, when I submit, then the test is re-run automatically.
- [ ] Given the test completes, when a screen reader is in use, then the outcome is announced — "Connection test complete. 6 of 7 checks passed."

**Priority:** P1 | **Feature Ref:** F12 | **Persona:** PER-04 | **FRD:** FR-F12-03

---

### US-097: Let the application tell me what it can do
**As an** Administrator, **I want** work-item types and actions pre-populated from the application's own declaration, **so that** I am confirming what exists rather than transcribing a specification.

**Acceptance Criteria:**
- [ ] Given the candidate supports capability description, when the capabilities step renders, then types, labels, content profiles, status maps, priority handling, and actions are pre-filled and each is marked "Reported by the application."
- [ ] Given I attempt to add a type or action the application did not declare, when I try, then I cannot — the form states "Only capabilities the application reports can be registered."
- [ ] Given I remove a declared action to limit exposure, when registration completes, then that action appears nowhere in the UI and the removal is recorded in the registry and audited.
- [ ] Given a status map is incomplete, when I try to continue, then progression is blocked with the unmapped statuses listed by name.
- [ ] Given the adapter type does not support capability description, when the step renders, then it shows empty lists with the guidance "This application doesn't describe its own capabilities. It will be registered with no work-item types."

**Priority:** P1 | **Feature Ref:** F12, F8 | **Persona:** PER-04 | **FRD:** FR-F12-04

---

### US-098: Watch the new application appear everywhere, immediately
**As an** Administrator, **I want** a newly registered application to become live across every surface without a restart, **so that** extensibility is something a reviewer watches happen rather than something I describe.

**Acceptance Criteria:**
- [ ] Given I submit the registration, when it completes, then the application appears at once in the console inventory, in health monitoring with a probe issued immediately, in the role-scoped navigation of every role I granted, in work-queue fan-out, in search, and as a related-item resolution target.
- [ ] Given an Investigator is already signed in in another browser, when their registry version next polls within thirty seconds, then their navigation and queue update to include the new application **without signing out, reloading, or re-authenticating**.
- [ ] Given the new application's items appear in that queue, when they render, then they are correctly attributed with the registered display name and icon token.
- [ ] Given registration completes, when the audit trail is queried, then one record names me, the application identifier, and a summary of the configuration.
- [ ] Given the whole sequence, when it is performed, then zero code changes and zero restarts occurred.

**Priority:** P1 | **Feature Ref:** F12 | **Persona:** PER-04, PER-01 | **FRD:** FR-F12-05

---

### US-099: Have a sixth application ready to register in front of an audience
**As an** Administrator running the demonstration, **I want** a real sixth service shipped running but unregistered, **so that** the registration demonstration has a visible consequence rather than producing only a new console row.

**Acceptance Criteria:**
- [ ] Given a freshly reset environment, when I look anywhere in the UI, then the Continuous Vetting Service appears nowhere — its absence before registration is part of the demonstration.
- [ ] Given CVS is running, when the conformance suite is run against it, then it passes the full adapter contract.
- [ ] Given I register CVS, when an Investigator's queue next refreshes, then CVS alert items assigned to that investigator appear, correctly attributed.
- [ ] Given CVS is registered, when its work-item type and actions are inspected, then they match what CVS declared, and its actions behave like any other application's.
- [ ] Given the hub source is inspected, when a reviewer looks for special-casing of CVS, then none exists.
- [ ] Given I run the reset command, when it completes, then CVS is de-registered and the registration demonstration repeats identically.

**Priority:** P1 | **Feature Ref:** F12, F17 | **Persona:** PER-04 | **FRD:** FR-F12-06, FR-F17-11

---

### US-100: Change or remove a registered application safely
**As an** Administrator, **I want** edit and de-registration flows that state their consequences and record what I did, **so that** removing an application is reversible in understanding even when it is not reversible in effect.

**Acceptance Criteria:**
- [ ] Given I edit an application, when the form opens, then values are pre-filled and the identifier is read-only with the explanation "The application ID can't be changed because existing records refer to it."
- [ ] Given I change the endpoint or adapter type, when I try to save, then a passing connection test is required first.
- [ ] Given I de-register an application, when the confirmation opens, then it requires me to type the display name exactly plus a reason, and states that this removes it from navigation, queue, search, and health monitoring for all users, how many work items will stop appearing, and that audit records mentioning it are kept.
- [ ] Given I type a name that does not match, when I submit, then I am told "The name you typed doesn't match. Type {displayName} exactly to confirm."
- [ ] Given de-registration completes, when users next load the product, then the application is gone from every surface with no code change and no errors anywhere.
- [ ] Given audit records referencing the removed application, when I read them afterwards, then they remain readable and show the stored display name so history stays legible.
- [ ] Given I de-register an application that is a leg in an orchestrated workflow, when I confirm, then I am warned those workflows will fail and the warning is recorded with the audit entry.

**Priority:** P1 | **Feature Ref:** F12, F8 | **Persona:** PER-04 | **FRD:** FR-F12-07

---
