## Epic 2: Role- and Attribute-Based Access Control, Enforced Server-Side (F2)

The epic that carries the zero-trust story. Authorisation is evaluated on the server for every request at the resource level, combining role, attributes, and ownership. Client-side hiding is presentation and never the control.

**The denial stories in this epic are first-class deliverables, not footnotes.** US-018 through US-025 are how the zero-trust claim becomes something a reviewer can watch happen rather than something a slide asserts. Each is demonstrable live, several of them via `curl` outside the browser entirely.

---

### US-015: See only the navigation and controls I am actually entitled to use
**As an** Applicant, **I want** the menu and the buttons on screen to reflect what I am permitted to do, **so that** I never waste effort on a path that will refuse me at the end.

**Acceptance Criteria:**
- [ ] Given I sign in, when the shell renders, then navigation is built from a server-computed entitlements response, not from a client-side role check.
- [ ] Given each of the four roles signs in, when their navigation is compared, then all four sets are visibly different.
- [ ] Given any navigation item for any role, when an automated crawl follows it, then it resolves to a real, populated page — zero 404s, zero empty shells, zero non-functional controls.
- [ ] Given an application is disabled by an Administrator, when my entitlements next refresh (within one registry poll), then its navigation entry disappears without a restart and without my signing out.

**Priority:** P0 | **Feature Ref:** F2, F3 | **Persona:** PER-03 | **FRD:** FR-F02-06, FR-F03-04

---

### US-016: Have my entitlement to a specific record checked, not just my role
**As an** Investigator, **I want** the system to verify my entitlement to *this* case rather than merely that investigators may fetch cases, **so that** a leaked identifier cannot open someone else's work.

**Acceptance Criteria:**
- [ ] Given I request a work item, when authorisation runs, then the decision evaluates the session gate, the role gate, the attribute gate, and the ownership gate against that specific resource's attributes.
- [ ] Given the resource attributes come from the owning spoke, when a spoke omits an attribute a rule needs, then the decision fails closed and denies.
- [ ] Given I am entitled to a case, when I fetch it, then the response is composed only after the ownership predicate has passed — there is no path that fetches first and decides afterwards.
- [ ] Given an automated route enumeration runs, when it completes, then zero hub endpoints are found that do not invoke the policy decision point.

**Priority:** P0 | **Feature Ref:** F2 | **Persona:** PER-01 | **FRD:** FR-F02-01, FR-F02-03, FR-F02-04

---

### US-017: See a different set of actions than my colleague on the very same item
**As an** Adjudicator, **I want to** open the same work item an Investigator has open and see a different set of available actions, **so that** the separation between producing the record and deciding on it is visible rather than promised.

**Acceptance Criteria:**
- [ ] Given the same PVQ issue is opened by an Investigator and by an Adjudicator, when both action panels are compared side by side, then the sets differ and the Adjudicator has no "Resolve issue" control.
- [ ] Given the action list is rendered, when I inspect its origin, then it was computed server-side from the role matrix intersected with attribute rules and the item's current state.
- [ ] Given I post an action that is absent from my returned list, when the request is evaluated, then it is denied server-side with `AUTHZ_DENIED` and nothing changes.
- [ ] Given an action exists for my role but is not valid right now, when the panel renders, then it appears disabled with a plain-language reason rather than being hidden.
- [ ] Given the item changed since I opened it, when I submit an action with a stale `stateVersion`, then I receive `STATE_CONFLICT` and am told to refresh rather than silently overwriting.

**Priority:** P0 | **Feature Ref:** F2, F6 | **Persona:** PER-02, PER-01 | **FRD:** FR-F02-05, FR-F06-03

---

### US-018: Be refused when I try to open another person's record  *(negative path)*
**As an** Applicant, **I want** any attempt to read another individual's record to be refused by the server, **so that** I can trust that my own most sensitive information is equally out of everyone else's reach.

**Acceptance Criteria:**
- [ ] Given I am authenticated as an Applicant, when I call a legitimate work-item endpoint with another subject's resource identifier, then I receive HTTP 403 `AUTHZ_DENIED` from the server, not a filtered empty page.
- [ ] Given that denial, when I compare it to a request for a fabricated identifier that does not exist, then the two responses are byte-identical apart from the correlation ID — status, code, message, and shape all match.
- [ ] Given the denial occurs, when an Administrator opens the audit viewer, then a record exists with `outcome: DENIED`, the failing policy rule ID, and the correlation ID.
- [ ] Given I bypass the browser entirely and issue the request with `curl`, when the server responds, then the denial is identical — the UI was never the control.
- [ ] Given a list request as an Applicant, when the spoke is queried, then the ownership predicate is applied inside the spoke's own query, so another subject's rows are never returned for the hub to filter.

**Priority:** P0 | **Feature Ref:** F2 | **Persona:** PER-03 | **FRD:** FR-F02-04, FR-F02-07, FR-F19-02

---

### US-019: Be refused when I attempt an adjudicator-only action  *(negative path)*
**As an** Investigator, **I want** an attempt to render a determination to be refused by the server even if I construct the request by hand, **so that** the boundary between investigation and adjudication is enforced rather than merely styled.

**Acceptance Criteria:**
- [ ] Given I am authenticated as an Investigator, when I post `CASE.ADJUDICATE` against a case I can legitimately read, then I receive HTTP 403 `AUTHZ_DENIED` and the case state is unchanged.
- [ ] Given that attempt, when the audit viewer is queried, then a `AUTHZ_DENIED` record exists naming me, the action, the target, and the rule that denied it.
- [ ] Given the denial response, when I read it, then it discloses nothing about the case beyond the standard message and correlation ID.
- [ ] Given the reverse case — an Adjudicator posting `ISSUE.RESOLVE` — when the request is evaluated, then it is denied identically and audited identically.
- [ ] Given both attempts, when run as automated negative tests, then both are asserted in CI as part of the RBAC suite.

**Priority:** P0 | **Feature Ref:** F2 | **Persona:** PER-01, PER-02 | **FRD:** FR-F02-02, FR-F02-05, FR-F19-02

---

### US-020: Be refused when I try to reach the administrator console  *(negative path)*
**As an** Investigator, **I want** the administrator console to refuse me at the server even when I type its URL directly, **so that** platform administration is genuinely separated from mission work.

**Acceptance Criteria:**
- [ ] Given I am authenticated as an Investigator, when I navigate directly to any admin console route, then I see the "Access denied" screen inside the shell — never a blank page, never a partially rendered console.
- [ ] Given I call any `/api/admin/*` endpoint directly, when the server responds, then it is HTTP 403 `AUTHZ_DENIED`.
- [ ] Given the denial screen renders, when I read it, then it carries a heading, a plain explanation, a copyable correlation ID, and two working exits — "Go to my dashboard" and "Go to my work queue".
- [ ] Given the denial occurs, when the audit viewer is queried, then it is recorded with the failing rule ID.
- [ ] Given the same attempt by an Adjudicator and by an Applicant, when each is evaluated, then each is denied and audited identically.

**Priority:** P0 | **Feature Ref:** F2 | **Persona:** PER-01, PER-02, PER-03 | **FRD:** FR-F02-02, FR-F02-07, FR-F11-07

---

### US-021: Be refused a case outside my unit or region  *(negative path)*
**As an** Investigator, **I want** cases belonging to another region or organisation to be out of my reach, **so that** the attribute half of the access-control story is demonstrable and not just the role half.

**Acceptance Criteria:**
- [ ] Given a case assigned to an investigator in a different organisation and region, when I request it, then I receive 403 `AUTHZ_DENIED` and the audit record names rule `ATTR-INV-01`.
- [ ] Given a case assigned to a unit-mate in my own organisation and region, when I request it, then I can read it.
- [ ] Given that same unit-mate's case, when I attempt to act on it, then the action is disabled with the reason "This item is assigned to {name}" and a posted attempt is denied under rule `ATTR-INV-02`.
- [ ] Given I filter the work queue by another individual's name, when the filter is applied, then it respects my scope and does not widen it.

**Priority:** P0 | **Feature Ref:** F2 | **Persona:** PER-01 | **FRD:** FR-F02-03, FR-F05-03

---

### US-022: Be refused a case above my clearance tier  *(negative path)*
**As an** Investigator holding a T3 clearance, **I want** T5-sensitivity cases to be unreachable, **so that** clearance tier is enforced by the platform rather than by convention.

**Acceptance Criteria:**
- [ ] Given a seeded eApp case at T5 sensitivity and my attributes at T3, when I request it, then I receive 403 `AUTHZ_DENIED`.
- [ ] Given that denial, when the audit record is read, then it names rule `ATTR-INV-03`.
- [ ] Given tier comparison is performed, when it runs, then it uses a defined ordinal map (`T1 < T3 < T5`) rather than string comparison.
- [ ] Given the same case, when requested by a T5-cleared investigator who is otherwise in scope, then it is readable.

**Priority:** P0 | **Feature Ref:** F2 | **Persona:** PER-01 | **FRD:** FR-F02-03, FR-F17-06

---

### US-023: Be refused mission content even though I administer the platform  *(negative path)*
**As an** Administrator, **I want** my platform privileges to stop at the boundary of mission content, **so that** "administrators are not exempt" is a demonstrable claim rather than a policy statement.

**Acceptance Criteria:**
- [ ] Given I am authenticated as an Administrator, when I deep-link to any work-item URL, then I receive `AUTHZ_DENIED` — administrative privilege confers no work-item read permission.
- [ ] Given I am on the administrator dashboard, when it renders, then it exposes no work items, no questionnaire answers, no investigative findings, and no applicant PII.
- [ ] Given I view an identity's detail in the console, when the page loads, then a `USER_VIEWED` audit record is written naming me — my reads are audited too.
- [ ] Given I perform any console mutation, when it completes, then an audit record exists naming me, the action, and a before/after summary.
- [ ] Given I attempt to modify or delete an audit record through any application path, when the attempt is made, then no such path exists, the attempt fails, and the attempt itself is recorded.

**Priority:** P0 | **Feature Ref:** F2, F11, F13 | **Persona:** PER-04 | **FRD:** FR-F02-02, FR-F11-07, FR-F13-03

---

### US-024: Get a denial that explains itself without revealing anything
**As a** user who has been refused something, **I want** a denial screen that tells me what to do next and gives me a reference to quote, **so that** I can get help without the system leaking whether the thing I asked for exists.

**Acceptance Criteria:**
- [ ] Given a denied page navigation, when the screen renders, then it shows "You don't have access to this page", a plain explanation, a copyable correlation ID, and two working exits, all inside the unified shell with the demo banner present.
- [ ] Given a denial inside an embedded region such as a dashboard widget or a related-items panel, when it renders, then an inline alert appears and the rest of the page remains usable.
- [ ] Given the denial screen renders, when a screen reader is in use, then the page title reads "Access denied — DCSA Unified Layer", focus moves to the heading, and the error is announced assertively.
- [ ] Given any denial response, when it is inspected, then it contains no resource title, no subject name, and no hint that the resource exists.
- [ ] Given the denial screen, when the accessibility scan runs, then it reports zero serious or critical violations and the screen is fully keyboard-navigable.

**Priority:** P0 | **Feature Ref:** F2, F14 | **Persona:** PER-01, PER-02, PER-03, PER-04 | **FRD:** FR-F02-07

---

### US-025: Inspect the policy rather than infer it from behaviour
**As an** Administrator, **I want to** read the role and permission matrix in the console, **so that** I can answer "what is this user actually entitled to" from one place instead of testing it by trial.

**Acceptance Criteria:**
- [ ] Given I open the roles-and-permissions view, when it renders, then the full action-by-role matrix appears as an accessible table read directly from the stored policy.
- [ ] Given the displayed matrix, when it is compared to enforced behaviour by automated test, then the two agree.
- [ ] Given I open an identity's detail, when it renders, then I see their roles, all four attributes, permitted sign-in methods, and recent activity with links into the audit viewer.
- [ ] Given a multi-role identity exists in the seed, when I view it, then both roles are shown.
- [ ] Given a permission is added to the stored matrix, when the system next evaluates it, then the change takes effect without a code change.

**Priority:** P1 | **Feature Ref:** F2, F11 | **Persona:** PER-04 | **FRD:** FR-F02-02, FR-F02-08, FR-F11-07

---
