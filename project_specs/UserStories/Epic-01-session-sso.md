## Epic 1: Unified Session and Single Sign-On Across All Spokes (F1)

One authentication establishes authorised access to every connected spoke for the life of the session. The user is never prompted a second time, never opens a second application, and never re-enters context at a system boundary. This is the epic the Innovation Call's core outcome rests on, and it is measured — not asserted — by counting authentication events in the audit log.

---

### US-009: Move between work from different systems without signing in again
**As an** Investigator, **I want to** open work items belonging to eApp, IEP, PVQ, PDT, and Investigation Management in one sitting without re-authenticating, **so that** finishing one logical task does not cost me three logins.

**Acceptance Criteria:**
- [ ] Given I have signed in once, when I open at least one work item from each of the five spokes in a single session, then no login screen, credential prompt, or interstitial appears at any point.
- [ ] Given that traversal has completed, when the audit trail is filtered to my session, then exactly one `AUTH_SUCCESS` record exists.
- [ ] Given I open any spoke's item, when the page loads, then it renders inside the same unified shell — same header, same banner, same navigation — with no new tab and no redirect to a spoke origin.
- [ ] Given a scripted traversal touching all five spokes, when it is run as an automated test, then the test asserts zero re-authentications and passes in CI.

**Priority:** P0 | **Feature Ref:** F1 | **Persona:** PER-01 | **FRD:** FR-F01-03, FR-F07a-06

---

### US-010: Have my identity asserted to each spoke by the hub, never by my browser
**As an** Administrator, **I want** the hub to present an attested principal to each spoke on every call, **so that** no spoke ever trusts a role or identity that a browser could have supplied.

**Acceptance Criteria:**
- [ ] Given any hub-to-spoke call, when it is inspected, then it carries the principal's identity, roles, attributes, and a correlation ID asserted by the hub.
- [ ] Given a request arrives at the hub carrying `role`, `roles`, `activeRole`, `principalId`, `entitlements`, or `scope` in its body or query, when the pipeline runs, then the request is rejected with `VALIDATION_FAILED` and nothing changes.
- [ ] Given a spoke is called directly by a client without a hub assertion, when it responds, then it does not honour a browser-supplied role.
- [ ] Given a session is established, when the principal is materialised, then roles and attributes are read from the hub's identity store and never from the request.

**Priority:** P0 | **Feature Ref:** F1, F2 | **Persona:** PER-04 | **FRD:** FR-F01-02, FR-F02-01, FR-F10-01

---

### US-011: Follow a deep link straight into a work item and land there after one sign-in
**As an** Adjudicator following a link from a colleague, **I want to** open a work-item URL directly and be taken there after signing in once, **so that** I am not dumped on a generic landing page having lost what I was sent to look at.

**Acceptance Criteria:**
- [ ] Given I am unauthenticated and open a work-item detail URL, when I complete sign-in, then I land on that exact work item.
- [ ] Given that deep-link sign-in, when the audit trail is queried, then exactly one authentication event exists for the session.
- [ ] Given the `returnTo` value is not a same-origin relative path, when the redirect is evaluated, then the value is discarded silently and I land on my dashboard.
- [ ] Given I deep-link to an item I am not entitled to see, when authorisation runs, then I receive the standard denial screen rather than the item.

**Priority:** P0 | **Feature Ref:** F1 | **Persona:** PER-02 | **FRD:** FR-F01-03, FR-F06-01, FR-F00-01

---

### US-012: See who I am signed in as, in which role, and how long I have
**As an** Investigator, **I want** my identity, active role, sign-in method, and remaining session time visible in the header, **so that** I always know what I am entitled to do before I invest effort in an action.

**Acceptance Criteria:**
- [ ] Given I am signed in, when any screen renders, then the header shows "Signed in as {name}", a role badge for my active role, "via {method} (simulated)", and a session timer.
- [ ] Given I open the account menu, when it expands, then it offers "Switch role" (only when I hold more than one role), "Accessibility statement", and "Sign out".
- [ ] Given I use a narrow viewport below 640px, when the header collapses, then every one of those controls remains reachable through the menu button.
- [ ] Given I navigate by keyboard, when I Tab through the header, then every control is reachable with a visible focus indicator.

**Priority:** P0 | **Feature Ref:** F1, F3 | **Persona:** PER-01 | **FRD:** FR-F01-05, FR-F03-05

---

### US-013: Switch between the roles I hold without signing in again
**As a** user who holds both the Investigator and Adjudicator roles, **I want to** switch my active role from the header, **so that** I can do both halves of my job without maintaining two accounts or two sessions.

**Acceptance Criteria:**
- [ ] Given I hold two roles, when I switch active role, then navigation, dashboard, and available actions change to the new role's set without a re-authentication.
- [ ] Given I switch role, when the change lands, then a polite live-region announcement states "Role changed to {role}. Your menu has been updated."
- [ ] Given I switch role, when the audit trail is queried, then exactly one `AUTH_SUCCESS` and one `ROLE_CONTEXT_SWITCHED` record exist for the session.
- [ ] Given I post a role I do not hold, when the request is evaluated, then it is denied with `ROLE_NOT_HELD` and my context is unchanged.
- [ ] Given I switch role, when entitlements are recomputed, then they are computed server-side, not adjusted in the browser.

**Priority:** P0 | **Feature Ref:** F1, F2 | **Persona:** PER-01, PER-02 | **FRD:** FR-F00-05, FR-F03-05

---

### US-014: Have every step of one action carry a single reference I can quote
**As an** Administrator diagnosing a user's report, **I want** every hub and adapter operation belonging to one user action to share one correlation ID, **so that** I can answer "what happened" with one query instead of an afternoon of log merging.

**Acceptance Criteria:**
- [ ] Given a user performs one action, when the resulting records are inspected, then every hub audit record, adapter call log, and integration issue for that action shares one correlation ID.
- [ ] Given any error is shown to a user, when they read it, then a copyable correlation ID is displayed with the message.
- [ ] Given I paste a correlation ID into the audit viewer, when I search, then I see the complete chain for that action in sequence order.
- [ ] Given any hub response, when I inspect its headers, then it carries `X-Correlation-Id`.

**Priority:** P0 | **Feature Ref:** F1, F13 | **Persona:** PER-04 | **FRD:** FR-F01-06, FR-F13-04

---
