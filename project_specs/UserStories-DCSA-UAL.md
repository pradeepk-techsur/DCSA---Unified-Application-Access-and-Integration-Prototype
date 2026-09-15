# User Stories
## DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

| Field | Value |
|-------|-------|
| **Product Name** | DCSA Unified Application Access and Integration Prototype |
| **Project Acronym** | DCSA-UAL |
| **Document Type** | User Stories |
| **Status** | Draft v1.0 |
| **Date** | 2026-09-14 |
| **Related PRD** | `project_specs/PRD-DCSA-UAL.md` (features F0–F19) |
| **Related FRD** | `project_specs/FRD-DCSA-UAL.md` (requirements `FR-F{nn}-{mm}`) |
| **Related Personas** | `project_specs/PERSONAS-DCSA-UAL.md` (PER-01 … PER-04) |
| **Related Charter** | `.planning/PROJECT.md` |

> **DEMO — SYNTHETIC DATA ONLY.** Every story below is written to be demonstrable against the synthetic seed corpus (F17) on a freshly reset environment. No real DCSA data, no real PII, no connection to any government system. Authentication is simulated and labelled as simulated on every screen.

---

## Story Format

Each story follows: **As a [persona], I want to [action], so that [outcome].**

Acceptance criteria are written in Given / When / Then form beneath each story and are phrased so a reviewer can verify them during a live demonstration. Stories are grouped by epic, one epic per PRD feature, and prioritised.

**Story IDs** are `US-NNN`, sequential and stable across the whole document. Retired stories are marked `[WITHDRAWN]` rather than renumbered.

**Metadata line** on every story carries the priority, the PRD feature it satisfies, the persona it serves, and the FRD requirement(s) that specify the behaviour:

`**Priority:** P0 | **Feature Ref:** F7 | **Persona:** PER-01 | **FRD:** FR-F07a-03`

---

## Personas Referenced

| ID | Persona | Role name used in stories | Why this persona exists in the demo |
|----|---------|---------------------------|-------------------------------------|
| PER-01 | Marcus Vale | **Investigator** | Primary demo persona; the actor in the flagship workflow (F7) |
| PER-02 | Dana Okonkwo | **Adjudicator** | Proves the same item yields a *different* server-computed action set (F2, F6) |
| PER-03 | Renée Ashford | **Applicant** | The strictest access scope; the headline zero-trust negative test (F2) |
| PER-04 | Priya Raghunathan | **Administrator** | Proves the platform is operable (F11, F16) and extensible (F12) |

Stories use the **role name** in the "As a…" sentence, because the product's behaviour is driven by role and attributes rather than by an individual. The `PER-XX` identifier in the metadata line carries the traceability back to `PERSONAS-DCSA-UAL.md`.

> **Note on seeded identity names — RESOLVED.** The FRD seed corpus (`FR-F17-02`) is now bound to the design personas: PER-01 seeds as **Marcus Vale**, PER-02 as **Dana Okonkwo**, PER-03 as **Renée Ashford**, PER-04 as **Priya Raghunathan**. These stories continue to reference **roles**, not seeded names, so they remain immune to any future renaming. Where a story names a specific seeded record — `EAPP:CASE-A-1042`, `PVQ:ISS-2207`, `SUBJ-00418`, `CVS` — that identifier is normative because the demo script depends on it.

---

## Reading This Document as an Evaluator

Five clusters carry the evaluation weight, and they are called out here so a reviewer can find them fast:

| What a reviewer is checking | Epic | Stories |
|---|---|---|
| **Is the cross-system workflow genuinely continuous?** | Epic 7 | US-059 … US-069 |
| **Is zero trust demonstrable, not asserted?** | Epic 2 | US-018 … US-025 (the negative paths) |
| **Is the platform extensible without code?** | Epic 12 | US-094 … US-100 |
| **Does it degrade visibly rather than blankly?** | Epic 16 | US-125 … US-132 |
| **Is it accessible to a federal standard?** | Epic 14 | US-109 … US-118 |

---
## Epic 0: Simulated Multi-Method MFA Authentication (F0)

The front door. Three genuinely distinct simulated identity providers — CAC/PIV, ECA, and a generic username-plus-one-time-code path — each with its own identity pool, each producing a working session for every role, and each labelled unmistakably as simulated so no reviewer mistakes the prototype for real PKI.

---

### US-001: Choose a sign-in method
**As an** Investigator, **I want to** see the available sign-in methods on one landing screen, **so that** I can enter the system by whichever identity provider my credential belongs to.

**Acceptance Criteria:**
- [ ] Given I am unauthenticated, when I open the application URL, then I see exactly three clearly differentiated method cards — CAC/PIV, ECA, and generic MFA — each with a heading, a one-sentence description, and a primary action.
- [ ] Given the login screen is rendered, when I read it, then a USWDS info alert states verbatim "Simulated sign-in. This prototype does not validate certificates, passwords, or one-time codes. Choose a method and a demo identity to continue."
- [ ] Given the login screen is rendered, when I inspect the page, then the non-dismissible "Demo — Synthetic Data Only" banner is present with no close control.
- [ ] Given a method is configured as disabled, when the screen renders, then that card appears disabled with a stated reason rather than being silently hidden.
- [ ] Given I navigate by keyboard only, when I press Tab, then all three method actions are reachable and operable with Enter and Space.

**Priority:** P0 | **Feature Ref:** F0 | **Persona:** PER-01, PER-02, PER-03, PER-04 | **FRD:** FR-F00-01

---

### US-002: Sign in with a simulated CAC/PIV certificate
**As an** Investigator, **I want to** sign in by selecting my identity from a simulated certificate picker, **so that** I can start work the same way a PIV holder would, without the prototype pretending to validate real PKI.

**Acceptance Criteria:**
- [ ] Given I choose CAC/PIV, when the picker opens, then a modal dialog lists synthetic identities with subject common name, organisation, issuer `DEMO-DOD-CA-59 (synthetic)`, a serial beginning `00:DEMO:`, and validity dates.
- [ ] Given the picker is open, when I read any row, then it carries the marker "(synthetic certificate)".
- [ ] Given I select an identity in the CAC/PIV pool, when selection completes, then a session is established and I land on the dashboard for that identity's role.
- [ ] Given at least one synthetic identity exists per role, when each is selected in turn, then each produces a working session — Investigator, Adjudicator, Applicant, and Administrator.
- [ ] Given the picker is open, when I press Tab repeatedly, then focus stays trapped inside the dialog; pressing Escape closes it and returns focus to the "Sign in with CAC/PIV" button.
- [ ] Given I complete sign-in, when I query the audit trail, then exactly one `AUTH_SUCCESS` record exists carrying `identityMethod: CAC_PIV`.

**Priority:** P0 | **Feature Ref:** F0 | **Persona:** PER-01 | **FRD:** FR-F00-02, FR-F13-02

---

### US-003: Sign in through the ECA external certificate authority
**As an** Investigator whose credential is issued by an external CA, **I want to** sign in through a visibly separate ECA path, **so that** the prototype demonstrates support for more than one identity provider rather than one provider with three skins.

**Acceptance Criteria:**
- [ ] Given I choose ECA, when the flow starts, then I see a full page (not the CAC/PIV modal) with a process list showing "External certificate authority" then "Confirm identity".
- [ ] Given the ECA identity list is displayed, when I compare it to the CAC/PIV list, then the two differ by at least one identity in each direction, and the ECA issuer reads `DEMO-ECA-VENDOR-07 (synthetic)`.
- [ ] Given I complete ECA sign-in, when the shell renders, then the header states "Signed in via ECA (simulated)".
- [ ] Given I attempt to complete the CAC/PIV flow using an ECA-only identity, when I submit, then sign-in fails with the generic failure message and an `AUTH_FAILURE` record is written.
- [ ] Given an ECA session exists, when an Administrator filters the audit viewer by identity method, then the ECA sign-in is distinguishable from the CAC/PIV sign-ins.

**Priority:** P0 | **Feature Ref:** F0 | **Persona:** PER-01 | **FRD:** FR-F00-03

---

### US-004: Sign in with generic MFA using a visible demo code
**As an** Applicant, **I want to** sign in with a username and a one-time code that is shown to me on screen, **so that** I can reach my status without a certificate and without being blocked by a code I never receive.

**Acceptance Criteria:**
- [ ] Given I choose generic MFA, when I enter a seeded demo username and continue, then I reach the one-time-code step.
- [ ] Given I am on the code step, when the page renders, then a USWDS summary box displays "Demo one-time code: {code}. In a real deployment this code would be delivered to your registered device."
- [ ] Given I enter the displayed code, when I submit, then a session is established and I land on the Applicant dashboard.
- [ ] Given I submit a code that is not six digits, when validation runs, then an error summary appears at the top of the form with focus moved to it and an in-page link to the code field reading "Enter the 6-digit code shown above."
- [ ] Given I submit six wrong codes in a row, when the sixth fails, then the transaction is locked and I am told "Too many attempts. Choose a sign-in method to start again."

**Priority:** P0 | **Feature Ref:** F0 | **Persona:** PER-03 | **FRD:** FR-F00-04

---

### US-005: Be told nothing useful when sign-in fails
**As an** Applicant, **I want** a failed sign-in to give the same answer whether or not my username exists, **so that** nobody can use the login screen to discover who holds an account.

**Acceptance Criteria:**
- [ ] Given I submit an unknown username with any code, when it fails, then the message, HTTP status, and response shape are identical to a known username with a wrong code.
- [ ] Given I submit an unknown username, when I measure the response, then its timing profile matches the known-username case (a normalised floor of 250 ms is applied).
- [ ] Given any failed attempt, when I inspect the response body and the server logs, then neither contains the submitted code.
- [ ] Given a failed attempt occurs, when an Administrator opens the audit viewer, then an `AUTH_FAILURE` record exists naming the attempted username, the method, and the reason class.
- [ ] Given a disabled identity is selected, when sign-in fails, then the response does not distinguish "disabled" from "unknown".

**Priority:** P0 | **Feature Ref:** F0 | **Persona:** PER-03 | **FRD:** FR-F00-04, FR-F00-02

---

### US-006: Be warned before my session times out, and get back without losing my place
**As an** Investigator working in the field with frequent interruptions, **I want** an advance warning before my session expires and a way back to exactly where I was, **so that** a forty-minute interruption does not cost me the form I had half-written.

**Acceptance Criteria:**
- [ ] Given my session has two minutes of idle time remaining, when the threshold is crossed, then a modal opens with a live countdown and two actions, "Stay signed in" and "Sign out now".
- [ ] Given the modal is open and I am using a screen reader, when the countdown runs, then it is announced at open, at 60 seconds, and at 15 seconds — not on every tick.
- [ ] Given I have partially completed an action form, when I choose "Stay signed in", then the session extends without a page reload and every field I had entered is preserved.
- [ ] Given my session expires while I am on a work-item detail page, when I sign in again as the same identity, then I return to that page with my prior work-queue filters, sort, and page restored.
- [ ] Given the modal is open, when I operate it with the keyboard alone, then focus is trapped inside it and both actions are reachable.

**Priority:** P0 | **Feature Ref:** F0 | **Persona:** PER-01, PER-03 | **FRD:** FR-F00-06, FR-F14-09

---

### US-007: Sign out and end access to every connected application
**As an** Investigator, **I want** signing out to end my access to all five connected systems at once, **so that** leaving a shared workstation does not leave a live session behind in a spoke.

**Acceptance Criteria:**
- [ ] Given I am signed in, when I choose "Sign out", then I land on a confirmation screen reading "You're signed out. Your session and all connected application access have ended."
- [ ] Given I have signed out, when any authenticated API call is replayed with the old session cookie, then it returns 401 `SESSION_INVALID`.
- [ ] Given I have signed out, when I press the browser Back button, then I see the login or signed-out screen — never a cached dashboard.
- [ ] Given I sign out, when the audit trail is queried, then exactly one `LOGOUT` record exists for that session.
- [ ] Given a spoke refuses the context-revocation call, when I sign out, then sign-out still succeeds and an integration issue is recorded for the Administrator.

**Priority:** P0 | **Feature Ref:** F0 | **Persona:** PER-01 | **FRD:** FR-F00-07

---

### US-008: Never be misled into thinking the authentication is real
**As an** evaluating reviewer, **I want** every authentication screen to say plainly that sign-in is simulated, **so that** I can assess the prototype honestly and never mistake a demo for a PKI integration.

**Acceptance Criteria:**
- [ ] Given any of the five authentication screens, when it renders, then it carries both the demo banner and a visible simulation notice.
- [ ] Given the authentication copy is scanned automatically, when the scan runs, then the terms "verified", "validated", "authenticated against", and "trusted certificate" appear zero times.
- [ ] Given a synthetic certificate, issuer, or serial is displayed anywhere, when I read it, then it carries a "(synthetic)" marker.
- [ ] Given an authentication error or session-timeout screen, when it renders, then the demo banner is still present.

**Priority:** P0 | **Feature Ref:** F0 | **Persona:** PER-04 | **FRD:** FR-F00-08, FR-F03-03

---
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
## Epic 3: Unified Navigation Shell and Global Chrome (F3)

The persistent frame every authenticated screen lives inside. This is what makes five systems read as one product, and it is where the "every button works" promise is either kept or broken.

---

### US-026: Work inside one consistent frame on every screen
**As an** Investigator, **I want** every screen to sit inside the same header, navigation, breadcrumb, and footer, **so that** I never have to notice which underlying system I am in.

**Acceptance Criteria:**
- [ ] Given any route for any role, when it renders, then the document order is skip link → demo banner → government banner → header → breadcrumb → main → footer.
- [ ] Given any page, when its landmarks are inspected, then there is exactly one banner, one primary nav, one breadcrumb nav, one main, one contentinfo, and exactly one `<h1>` that names the page rather than the product.
- [ ] Given a client-side route change, when it completes, then the document title updates to "{Page name} — DCSA Unified Layer" and focus moves to the new page's `<h1>`.
- [ ] Given a viewport of 320px, when any route renders, then there is no horizontal page scrolling; at 200% zoom the page remains fully usable.
- [ ] Given entitlements fail to load, when the shell renders, then the banner, header identity, and an inline recoverable alert appear — never a bare page.

**Priority:** P0 | **Feature Ref:** F3 | **Persona:** PER-01, PER-02, PER-03, PER-04 | **FRD:** FR-F03-01, FR-F14-05

---

### US-027: Always be able to see that the data is synthetic
**As an** evaluating reviewer, **I want** a "Demo — Synthetic Data Only" banner that cannot be hidden on any screen, **so that** nobody can mistake a demonstration for a live system or a real personnel record.

**Acceptance Criteria:**
- [ ] Given any route — including login, access-denied, not-found, and unexpected-error screens — when it renders, then the banner is present with the full specified copy.
- [ ] Given the banner element, when the DOM is inspected, then it has no close control, no conditional hide path, and no state that removes it.
- [ ] Given an emergency announcement is active and a modal is open simultaneously, when the page is inspected, then the banner remains visible and is not overlaid.
- [ ] Given a screen reader is in use, when a page loads, then the banner is exposed to assistive technology and announced once as part of the banner landmark.
- [ ] Given the automated per-route assertion runs in CI, when it completes, then 100% of routes report the banner present.

**Priority:** P0 | **Feature Ref:** F3, F14 | **Persona:** PER-04 | **FRD:** FR-F03-03, FR-F15-05

---

### US-028: Find every part of my job in a menu built for my role
**As an** Applicant, **I want** navigation written in my language and limited to what concerns me, **so that** I do not have to learn which government system owns which step.

**Acceptance Criteria:**
- [ ] Given I sign in as an Applicant, when the navigation renders, then it reads Dashboard, My Tasks, My Notices, My Status, Help — with no internal system names presented as menu labels.
- [ ] Given each of the four roles signs in, when their navigation is compared, then all four sets are distinct and each item resolves to a real, populated page.
- [ ] Given a navigation item carries a badge count, when it renders, then the count is text plus number, never colour alone.
- [ ] Given I am on a page, when I look at the navigation, then the current item carries `aria-current="page"` plus a visible non-colour indicator.
- [ ] Given a nav item's target application is unavailable, when I follow it, then I reach that screen's degraded state, not a broken link.

**Priority:** P0 | **Feature Ref:** F3 | **Persona:** PER-03 | **FRD:** FR-F03-04, FR-F03-02

---

### US-029: Always know where I am across a system boundary
**As an** Investigator who has been interrupted mid-task, **I want** a breadcrumb that names both the case and the related issue with their source systems, **so that** I can re-orient in seconds and retrace my steps.

**Acceptance Criteria:**
- [ ] Given I have moved from the queue to an eApp case to its related PVQ issue, when I read the breadcrumb, then it shows `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207` with source badges on the second and third segments.
- [ ] Given breadcrumb labels, when they render, then they come from the server's `breadcrumbTrail` rather than being invented by the client from identifiers.
- [ ] Given I activate the case segment from the issue screen, when it loads, then I return to the case with its context intact.
- [ ] Given the final segment, when it renders, then it is plain text with `aria-current="page"` and preceding segments are links.
- [ ] Given a trail deeper than four segments, when it renders, then the middle collapses behind an accessible "Show full trail" disclosure, never a silent ellipsis.

**Priority:** P0 | **Feature Ref:** F3, F7 | **Persona:** PER-01 | **FRD:** FR-F03-06

---

### US-030: Search across everything I am allowed to see
**As an** Adjudicator, **I want** one search box that looks across every connected system within my scope, **so that** I can find a subject or a case without knowing which system holds it.

**Acceptance Criteria:**
- [ ] Given I search a seeded case number, when results render, then that case appears, badged with its source system.
- [ ] Given results, when they render, then they are grouped by source system and ranked with exact identifier matches first.
- [ ] Given I enter fewer than two characters, when I attempt to search, then no request is issued and the control states "Enter at least 2 characters to search."
- [ ] Given one source is unavailable, when results render, then the available results are shown plus a named notice listing the systems not searched.
- [ ] Given an Applicant searches, when results are computed, then another subject's items can never appear.
- [ ] Given results render, when a screen reader is in use, then a polite announcement states "{n} results for {q}. {m} systems searched."

**Priority:** P1 | **Feature Ref:** F3, F5 | **Persona:** PER-02, PER-03 | **FRD:** FR-F03-07, FR-F02-04

---

### US-031: Land somewhere useful when a page does not exist
**As a** user who has followed a stale link, **I want** a not-found page that explains what happened and offers me a way forward, **so that** a broken link never ends my session.

**Acceptance Criteria:**
- [ ] Given I open an unknown route, when it renders, then I see "We couldn't find that page" inside the shell with the demo banner, the attempted path shown as escaped text, a correlation ID, and two working exits.
- [ ] Given that page, when the response is inspected, then it returns HTTP 404 with the title "Page not found — DCSA Unified Layer" and focus is moved to the heading.
- [ ] Given the not-found page, when the accessibility scan runs, then it reports zero serious or critical violations.
- [ ] Given the attempted path contains markup, when it is displayed, then it is escaped and never rendered as HTML.

**Priority:** P0 | **Feature Ref:** F3, F16 | **Persona:** PER-01, PER-03 | **FRD:** FR-F03-08

---

### US-032: Reach every screen the product claims to have
**As an** evaluating reviewer, **I want** every navigation item and every primary control to lead to a real, populated screen, **so that** I can trust the demonstration is a working system rather than a set of stubs.

**Acceptance Criteria:**
- [ ] Given the full screen inventory, when an automated crawl runs for every role, then every reachable screen returns HTTP 200 with a non-empty main region.
- [ ] Given every interactive control on every screen, when the control-integrity test runs, then each has a handler producing an observable result — zero dead links, zero placeholder screens, zero buttons that do nothing.
- [ ] Given every screen, when it is checked, then it has an implemented populated state, a designed empty state, and a designed error state.
- [ ] Given any screen in the inventory, when it is reviewed, then it is built on one of the four page templates — List, Detail, Form, or Console.

**Priority:** P0 | **Feature Ref:** F3, F19 | **Persona:** PER-04 | **FRD:** FR-F03-02, FR-F19-08

---
## Epic 4: Role-Specific Personalised Dashboards (F4)

Four dashboards, genuinely different from one another, each answering "what is mine, what is urgent, what changed, and what should I know" by aggregating across every connected spoke. These are written as four separate stories deliberately: a single parameterised "user sees a dashboard" story would hide exactly the difference the demonstration has to prove.

---

### US-033: See my caseload posture the moment I sign in *(Investigator)*
**As an** Investigator, **I want** a landing page that tells me what is assigned to me, what is overdue, and what has just been raised against my cases, **so that** I can pick the next highest-consequence action in two clicks instead of reconstructing priority from memory.

**Acceptance Criteria:**
- [ ] Given I sign in, when my dashboard renders, then it shows, in order: My assigned work, Needs attention, Newly raised PVQ issues, Due soon and overdue, Recent activity, Announcements, and System status when a source is unhealthy.
- [ ] Given "My assigned work" renders, when I read it, then it shows a total plus a per-source-system breakdown covering at least four of the five spokes, each labelled with its source system and linking into the queue pre-filtered to that system.
- [ ] Given "Needs attention" renders, when I read it, then it lists the top five items ranked overdue first, then priority, then due date, each with title, source badge, subject, due date, status, and a direct link to its detail screen.
- [ ] Given a PVQ issue was raised in the last seven days against a case assigned to me, when the dashboard renders, then it appears in "Newly raised PVQ issues" and links to the parent eApp case — this is the on-ramp to the flagship workflow.
- [ ] Given an item is overdue, when it is displayed, then the overdue state is conveyed by text and icon, never by colour alone.
- [ ] Given seeded data, when the page loads, then it renders within two seconds and no widget is blank or placeholder.

**Priority:** P0 | **Feature Ref:** F4 | **Persona:** PER-01 | **FRD:** FR-F04-02, FR-F04-01

---

### US-034: See what is awaiting my determination and what is ageing *(Adjudicator)*
**As an** Adjudicator, **I want** a landing page organised around determinations rather than caseload, **so that** timeliness is managed by evidence instead of by end-of-month panic.

**Acceptance Criteria:**
- [ ] Given I sign in, when my dashboard renders, then it shows, in order: Awaiting my determination, Case status distribution, Approaching determination deadlines, Returned for clarification, Recent activity, Announcements, and System status when relevant.
- [ ] Given my dashboard is compared to the Investigator dashboard, when both are open, then they differ in at least three widgets — this is not a relabelled copy.
- [ ] Given "Case status distribution" renders, when I inspect it, then it is an accessible data table (a chart, if present, is accompanied by the equivalent table) and each row links to the pre-filtered queue.
- [ ] Given my scope is organisation-wide rather than assignee-based, when widget headings render, then they say so — "Across {organisation}".
- [ ] Given "Approaching determination deadlines" renders, when I read it, then items due within 14 days are listed ascending with overdue items called out first.
- [ ] Given nothing awaits me, when the widget renders, then it shows the designed empty state "Nothing is waiting on your determination." rather than a blank region.

**Priority:** P0 | **Feature Ref:** F4 | **Persona:** PER-02 | **FRD:** FR-F04-03

---

### US-035: Understand where I am in the process in plain language *(Applicant)*
**As an** Applicant, **I want** a landing page that answers "where am I and what do I owe you next" without jargon, **so that** I can get the answer on my phone in thirty seconds without learning which system owns which step.

**Acceptance Criteria:**
- [ ] Given I sign in, when my dashboard renders, then it shows, in order: Where you are, What you need to do, Your notices, Your submission, Announcements, and a plainly-worded system status when relevant.
- [ ] Given "Where you are" renders, when I read it, then a step indicator shows Submitted → Under review → Information requested → Complete with the current step marked in **text** as well as visually, plus a one-sentence explanation of that step.
- [ ] Given "What you need to do" renders, when I read a task, then it states the due date, links directly to the action that discharges it, and explains the consequence of not acting in plain language.
- [ ] Given the page renders, when I read the body copy, then no internal system name, tier code, or state abbreviation appears without a plain-language explanation.
- [ ] Given my dashboard is compared to the three mission dashboards, when all four are viewed, then mine is visibly and substantively different in composition.
- [ ] Given I view it at 320px width, when it renders, then the answer to "where am I and what do I owe" is above the fold with no horizontal scrolling.
- [ ] Given a source is unavailable, when the notice renders, then it reads "Some of your information isn't available right now. Please check back shortly." with no internal jargon.

**Priority:** P0 | **Feature Ref:** F4 | **Persona:** PER-03 | **FRD:** FR-F04-04, FR-F14-08

---

### US-036: See the state of the platform at a glance *(Administrator)*
**As an** Administrator, **I want** a landing page about the layer itself rather than about mission work, **so that** I know whether anything is broken before a user calls me.

**Acceptance Criteria:**
- [ ] Given I sign in, when my dashboard renders, then it shows, in order: Connected applications, System health, Integration issues in the last 24 hours, Recent administrative activity, Announcements management, and Demo operations.
- [ ] Given "System health" renders, when I read a status, then it is text plus icon with a last-check time and latency — never a coloured dot alone.
- [ ] Given health data is displayed, when the page loads, then it is read from stored monitor results rather than probing on page load, and a "Check now" control triggers an on-demand probe.
- [ ] Given an adapter failure is induced, when one health-check interval has elapsed, then a visible entry appears in the integration-issues widget.
- [ ] Given I attempt to deep-link from this dashboard to a mission work item, when the request is evaluated, then it is denied — this dashboard exposes no mission content.
- [ ] Given the sixth application is registered live, when the dashboard next renders, then the connected-applications count has incremented without a restart.

**Priority:** P0 | **Feature Ref:** F4, F11 | **Persona:** PER-04 | **FRD:** FR-F04-05

---

### US-037: Have a slow system degrade one widget rather than my whole page
**As an** Investigator on an intermittent VPN, **I want** each dashboard widget to load independently, **so that** one slow source does not blank the page and make me assume the whole system is broken.

**Acceptance Criteria:**
- [ ] Given one spoke is slow, when the dashboard loads, then each widget renders its own skeleton with `aria-busy` until it settles, and the rest of the page is usable meanwhile.
- [ ] Given all widgets have settled, when a screen reader is in use, then completion is announced once — "Dashboard loaded. 3 of 4 systems reporting."
- [ ] Given a widget's data source errors, when it renders, then it shows an in-widget message "We couldn't load this section. Try again." with a working retry, and the rest of the dashboard is unaffected.
- [ ] Given a region is still loading past its configured timeout, when the timeout elapses, then it transitions to its error or degraded state rather than spinning indefinitely.
- [ ] Given the reduced-motion preference is set, when skeletons render, then shimmer animation is disabled.

**Priority:** P1 | **Feature Ref:** F4, F16 | **Persona:** PER-01 | **FRD:** FR-F04-01, FR-F16-06

---

### US-038: Be told what is missing, rather than shown an incomplete picture
**As an** Adjudicator, **I want** my dashboard to name what it could not load, **so that** I never mistake "the system that holds the issues is down" for "this subject has no issues".

**Acceptance Criteria:**
- [ ] Given one spoke is unavailable, when the dashboard renders, then a notice names the affected system and quantifies the gap — for example "Investigation Management is unavailable — 12 items are not shown."
- [ ] Given no prior item count exists for that source, when the notice renders, then the copy omits the number rather than guessing: "…some items are not shown."
- [ ] Given multiple sources are affected, when the notice renders, then each is named and quantified individually, not merged into "some systems are unavailable".
- [ ] Given a widget rendered with a source missing, when it displays, then the widget itself names the missing system inline rather than silently omitting rows.
- [ ] Given the spoke is restored, when the 30-second status poll next runs, then the notice clears without a page reload and without re-authentication.

**Priority:** P1 | **Feature Ref:** F4, F16 | **Persona:** PER-02 | **FRD:** FR-F04-01, FR-F16-05, FR-F16-12

---

### US-039: Act on anything my dashboard shows me
**As an** Investigator, **I want** every count, row, and widget on my dashboard to lead somewhere real and pre-scoped, **so that** the landing page is a launchpad rather than a report.

**Acceptance Criteria:**
- [ ] Given any widget, when I inspect it, then it has exactly one primary destination and every count and row is a link to a real, pre-scoped screen.
- [ ] Given a "View all" link, when I follow it, then the destination queue arrives with the equivalent filter already applied and shown as a removable chip.
- [ ] Given I refresh a single widget, when it completes, then only that widget re-requests and the outcome is announced politely — "My assigned work updated. 14 items."
- [ ] Given I dismiss an announcement, when I return later or sign in elsewhere, then it stays dismissed for me and is unaffected for other users.
- [ ] Given a widget's destination route does not exist, when CI runs, then the navigation crawl fails the build.

**Priority:** P0 | **Feature Ref:** F4 | **Persona:** PER-01 | **FRD:** FR-F04-06

---
## Epic 5: Unified Work Queue (F5)

One list of everything assigned to the signed-in user, aggregated from every connected spoke, normalised into a common shape while keeping unmistakable source attribution. Filterable, sortable, searchable, paginated, and implemented as a proper accessible data table — with partial failure of any single source degrading that source only.

---

### US-040: See everything assigned to me in one list
**As an** Investigator, **I want** one queue containing my work from every connected system, **so that** I have a single authoritative answer to "what is assigned to me and what is due first".

**Acceptance Criteria:**
- [ ] Given I open the work queue, when it renders, then it contains correctly attributed items originating from at least four of the five spokes.
- [ ] Given the table renders, when I read a row, then it shows title, source system, type, subject, status, priority, assignee, due date, and last activity.
- [ ] Given items come from differently shaped native records, when they are displayed, then they share one consistent shape and sort correctly against one another.
- [ ] Given a spoke's native status vocabulary differs from another's, when the row renders, then the native status is still shown verbatim alongside its normalised category.
- [ ] Given an Administrator opens the queue route, when the request is evaluated, then it is denied — administrators hold no work-item read permission.

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-01 | **FRD:** FR-F05-01, FR-F05-02

---

### US-041: Always know which system owns an item
**As an** Adjudicator, **I want** every row and every detail panel to state which system the record came from, **so that** I can vouch for the provenance of anything I base a determination on.

**Acceptance Criteria:**
- [ ] Given any queue row, when it renders, then the source system appears as a text label from the registry with an accompanying icon — never colour-only and never icon-only.
- [ ] Given a screen reader is in use, when it reaches a source badge, then it announces "Source system: {display name}".
- [ ] Given I open an item, when the detail header renders, then it repeats the source in text — "System of record: PVQ — Personnel Vetting Questionnaire".
- [ ] Given a newly registered sixth application, when its items appear in the queue, then they are attributed with that application's registered display name and icon token, with no code change.
- [ ] Given any row, when I read it, then ownership is unambiguous.

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-02 | **FRD:** FR-F05-07

---

### US-042: Narrow the queue to what I need right now
**As an** Investigator, **I want to** filter by source system, type, status, priority, assignee, and due-date range, **so that** I can reduce forty items to the three that matter this morning.

**Acceptance Criteria:**
- [ ] Given I apply filters across facets, when results return, then facets combine as AND between them and OR within each one.
- [ ] Given a filter is active, when the page renders, then it appears as a removable chip with an accessible name such as "Remove filter: Source system — PVQ", alongside a "Clear all filters" control.
- [ ] Given I remove a chip, when the query re-runs, then the URL updates and the new result count is announced politely.
- [ ] Given a source cannot apply a filter natively, when results are merged, then the filter is still applied correctly hub-side.
- [ ] Given a due-date range is active, when items without due dates are excluded, then the UI states "Items without a due date are hidden while a date range is applied."
- [ ] Given I enter a reversed date range, when I submit, then a field error reads "Enter an end date that comes after the start date."

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-01 | **FRD:** FR-F05-03

---

### US-043: Order the queue by what is most urgent
**As an** Investigator, **I want to** sort by due date, priority, status, source system, and last activity, **so that** prioritisation is driven by evidence rather than by whoever called me most recently.

**Acceptance Criteria:**
- [ ] Given I sort by due date ascending, when results render, then overdue items appear first and items with no due date appear last in both directions.
- [ ] Given I sort by priority, when results render, then the order is Urgent, then Elevated, then Routine — never alphabetical.
- [ ] Given I activate a sortable column header, when the sort applies, then `aria-sort` on that header reflects the new state and a polite announcement states "Sorted by due date, ascending. {n} items."
- [ ] Given I run the identical query twice, when I compare the results, then the ordering is byte-identical — ties break deterministically by sort field, then source system, then native identifier.
- [ ] Given a source truncated at its per-source fetch limit, when results render, then the UI discloses it: "Showing the first {n} items from each system. Narrow your filters to see more."

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-01 | **FRD:** FR-F05-04

---

### US-044: Find one specific item by name or number
**As an** Adjudicator, **I want to** search the queue by title, subject, or identifier, **so that** I can jump to a known case without paging through a list.

**Acceptance Criteria:**
- [ ] Given I search a seeded case number, when results return, then exactly that item is returned and the UI offers "Go to this item" as a primary action.
- [ ] Given I search fewer than two characters, when I submit, then I am told "Enter at least 2 characters to search." and no query is issued.
- [ ] Given search combines with active filters, when results return, then the search acts as an additional AND term rather than replacing the filters.
- [ ] Given I am an Applicant, when I search, then another subject's item can never appear in my results.
- [ ] Given no matches, when results render, then the empty state reads "No work items match '{q}'. Check the spelling, or try a case or subject number."

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-02, PER-03 | **FRD:** FR-F05-06

---

### US-045: Page through a long queue and know how much there is
**As an** Investigator, **I want** accessible pagination with an announced result count, **so that** I know how much work I have and can move through it without a mouse.

**Acceptance Criteria:**
- [ ] Given results exceed one page, when pagination renders, then it uses the USWDS component with `aria-label="Work queue pagination"` and the current page marked `aria-current="page"`.
- [ ] Given I am on the first or last page, when I look at Previous or Next, then the bound control is disabled and visible with an explanatory reason — not hidden.
- [ ] Given I change filters, sort, search, or page, when results settle, then a polite region announces "{n} work items. Showing {a} to {b}. {m} of {k} systems reporting."
- [ ] Given a source failed, when the count is displayed, then it is accompanied by the degraded notice so the number is never presented as complete.
- [ ] Given I set page size, when it applies, then only 10, 25, 50, or 100 are accepted, defaulting to 25.

**Priority:** P0 | **Feature Ref:** F5, F14 | **Persona:** PER-01 | **FRD:** FR-F05-04, FR-F14-04

---

### US-046: Open the queue already sensibly scoped for my role
**As an** Investigator, **I want** the queue to open on "assigned to me, due date ascending", **so that** my first screen of the day is already the screen I need.

**Acceptance Criteria:**
- [ ] Given I open the queue for the first time, when it renders, then the role default is applied and shown as visible, removable chips — a silently pre-filtered list is never presented as complete.
- [ ] Given each of the three work-queue roles opens the queue, when defaults apply, then Investigator gets assignee-me plus open and in-progress, Adjudicator gets in-progress, and Applicant gets no filter.
- [ ] Given I override the default, when I return later, then my preference persists for filters, sort, and page size — but not page number.
- [ ] Given I choose "Reset to default view", when it applies, then the role default is restored and the change is announced.
- [ ] Given a saved preference references a de-registered application, when the queue loads, then the stale facet is dropped silently and the page loads cleanly.

**Priority:** P1 | **Feature Ref:** F5 | **Persona:** PER-01, PER-02, PER-03 | **FRD:** FR-F05-08

---

### US-047: Come back to exactly the queue I left
**As an** Investigator interrupted mid-task, **I want** returning from an item to restore my filters, sort, page, and place in the list, **so that** a forty-minute interruption costs me nothing but the forty minutes.

**Acceptance Criteria:**
- [ ] Given I filter the queue and open an item, when I choose "Back to work queue", then the same filtered page returns with sort, page, and scroll position intact and focus restored to the row I came from.
- [ ] Given I complete an action on an item, when I return to the queue, then I land on the same filtered page — never on an unfiltered page one.
- [ ] Given I share the URL of a filtered view, when a colleague with the same entitlements opens it, then they see the same filter state, because queue state lives in the URL.
- [ ] Given my session expires mid-flow, when I sign in again, then the same queue state is restored.
- [ ] Given I press the browser Back button, when the previous view loads, then it restores the exact prior query state.

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-01 | **FRD:** FR-F05-09

---

### US-048: Keep working when one connected system is down
**As an** Investigator, **I want** the queue to render everything it can and tell me exactly what is missing, **so that** I can never mistake a silent outage for an empty queue.

**Acceptance Criteria:**
- [ ] Given Investigation Management is forced offline, when the queue loads, then it returns successfully, renders the other four sources fully, and shows a warning naming the system and quantifying the gap — "Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date."
- [ ] Given a source is down, when the queue renders, then no error page appears anywhere in the application and the remaining items stay actionable.
- [ ] Given every source fails, when the queue renders, then it still returns successfully with a full-width degraded alert and a retry control — never a 500, never a blank page.
- [ ] Given a source is slow but responding, when its rows render, then they carry an inline "Slow to respond" note.
- [ ] Given the source is restored, when the 30-second health poll detects it, then the warning is replaced by a polite announcement and a refresh control — the list does not silently reorder under my cursor.
- [ ] Given each induced failure, when the Administrator checks the integration log, then exactly one correctly attributed issue entry exists.

**Priority:** P0 | **Feature Ref:** F5, F16 | **Persona:** PER-01, PER-04 | **FRD:** FR-F05-05, FR-F16-05

---

### US-049: Get guidance rather than a blank table when there is nothing to show
**As an** Applicant with nothing outstanding, **I want** an empty queue to explain itself, **so that** I know the system is working and I simply have nothing to do.

**Acceptance Criteria:**
- [ ] Given I have no assigned work at all, when the queue renders, then it reads "You have no assigned work right now. New assignments will appear here." with the table caption still present.
- [ ] Given my filters exclude everything, when results return, then it reads "No work items match your filters. Clear filters to see all of your work." with a working "Clear all filters" button.
- [ ] Given an empty state and a degraded state, when each is compared, then the copy is distinct — "you have nothing to do" is never used to describe "we could not load your work".
- [ ] Given the zero-item applicant persona signs in, when every queue and widget renders, then each shows its designed empty state and no blank region.

**Priority:** P0 | **Feature Ref:** F5, F16 | **Persona:** PER-03 | **FRD:** FR-F05-01, FR-F16-07

---
## Epic 6: Work-Item Detail and Action Completion (F6)

The page where work actually gets done: the full record from its owning spoke, only the actions this principal may perform on this item in its current state, the execution of those actions through the adapter, and the item's complete history merged from the spoke and the hub. It also carries the related-items panel that is the on-ramp to the flagship workflow.

---

### US-050: Review the full record for a single work item
**As an** Investigator, **I want to** open an item and see everything the owning system holds about it, **so that** I can act on evidence rather than on a summary row.

**Acceptance Criteria:**
- [ ] Given I open a work item, when it renders, then the page shows, in order: breadcrumb, heading, summary header, type-specific content, related items, action panel, and activity history.
- [ ] Given the summary header renders, when I read it, then it names the system of record in text, plus subject, status, priority, due date, assignee, and last activity.
- [ ] Given each of the five work-item types, when opened, then a purpose-built screen renders — questionnaire case, PVQ issue, PDT designation, IEP task/notice, IM assignment — not a generic key/value dump.
- [ ] Given any record is displayed, when I read the summary header, then it carries the marker "Synthetic record — demo data".
- [ ] Given an eApp case, when I open a questionnaire section, then sections render as accessible disclosures with stable anchors so a related issue can point at an exact answer.

**Priority:** P0 | **Feature Ref:** F6 | **Persona:** PER-01, PER-02 | **FRD:** FR-F06-01, FR-F06-02, FR-F06-08

---

### US-051: See only the actions I can actually take, and why the others are unavailable
**As an** Investigator, **I want** the action panel to show what I may do and explain what I may not, **so that** I never invest effort in an action the system will refuse.

**Acceptance Criteria:**
- [ ] Given I open an item, when the action panel renders, then it shows at most one primary action plus secondary and destructive actions, each computed server-side for this principal, this item, and its current state.
- [ ] Given an action exists for my role but is currently unavailable, when it renders, then it is shown disabled with a plain-language reason associated programmatically, not hidden.
- [ ] Given an action I may never perform in this role, when the panel renders, then it is omitted entirely.
- [ ] Given an action writes to more than one system, when it renders, then the panel states "This updates {System A} and {System B}." before I act.
- [ ] Given a target system is unavailable, when the panel renders, then the action is disabled with "{System} isn't responding right now. Try again when it's back."
- [ ] Given I complete an action, when the page settles, then the action list is recomputed rather than left stale.

**Priority:** P0 | **Feature Ref:** F6, F2 | **Persona:** PER-01 | **FRD:** FR-F06-03, FR-F16-04

---

### US-052: Complete an action through a form that validates properly
**As an** Investigator, **I want to** record a finding or request clarification through a validated form, **so that** a mistake is caught before it reaches the system of record and my narrative is never lost to a validation failure.

**Acceptance Criteria:**
- [ ] Given an action requires input, when the form renders, then it is built from the server-declared field schema with labels, hint text, and required indication in text rather than colour or asterisk alone.
- [ ] Given I submit invalid input, when validation fails, then an error summary appears at the top of the form, focus moves to it, each entry links in-page to its field, and each field carries an inline message and `aria-invalid="true"`.
- [ ] Given I submit invalid input, when the page re-renders, then everything I had already typed is preserved.
- [ ] Given I disable client-side validation, when I submit invalid input, then the server rejects it identically — the server is authoritative.
- [ ] Given a long narrative field, when I pass 90% and 100% of its limit, then a character counter is announced politely rather than on every keystroke.
- [ ] Given I double-submit the same action, when the second request arrives, then idempotency ensures the action executes exactly once.

**Priority:** P0 | **Feature Ref:** F6, F14 | **Persona:** PER-01 | **FRD:** FR-F06-04, FR-F14-03

---

### US-053: Be told exactly what changed and in which system
**As an** Investigator, **I want** the confirmation to name the change and the system it landed in, **so that** I can trust what I am seeing months later and so my supervisor can too.

**Acceptance Criteria:**
- [ ] Given an action succeeds, when the confirmation renders, then it names the item, the change, and the system — for example "Issue ISS-2207 marked Resolved — Substantiated in PVQ."
- [ ] Given the confirmation appears, when a screen reader is in use, then it is announced politely and receives focus.
- [ ] Given the UI reflects a new state, when I inspect the sequence, then the state was read back from the spoke after it confirmed the write — submission is never optimistic.
- [ ] Given the action completes, when the audit trail is queried, then exactly one audit record exists for it.
- [ ] Given I remain on the detail page after acting, when the page settles, then I still see evidence of what I just did, with "Back to work queue" offered as a secondary control.

**Priority:** P0 | **Feature Ref:** F6, F13 | **Persona:** PER-01 | **FRD:** FR-F06-04, FR-F06-12, FR-F13-01

---

### US-054: Know which kind of failure I am looking at, and what to do about it
**As an** Investigator, **I want** failures to be distinguishable and each to offer a recovery path, **so that** I never have to guess whether to retry, fix my input, or ask for access.

**Acceptance Criteria:**
- [ ] Given an authorisation denial, when it renders, then it reads "You don't have permission to do that." and offers a return to the item with no retry, because retrying will not help.
- [ ] Given a validation failure, when it renders, then it shows an error summary with per-field guidance and a fix-and-resubmit path.
- [ ] Given the owning system is unavailable, when it renders, then it reads "{System} isn't responding right now, so nothing was changed." with "Try again" and "Back to work queue".
- [ ] Given an unexpected error, when it renders, then it reads "Something went wrong on our side. Nothing was changed." with a correlation ID and working exits.
- [ ] Given any failure message, when I read it, then it states explicitly whether anything changed — ambiguity is permitted only for the indeterminate-timeout case, whose copy says the outcome is unknown and tells me how to check.
- [ ] Given any failure message, when it is scanned automatically, then it contains no stack trace, exception name, hostname, port, SQL, or spoke-internal identifier, and always displays a copyable correlation ID.

**Priority:** P0 | **Feature Ref:** F6, F16 | **Persona:** PER-01 | **FRD:** FR-F06-07, FR-F16-08

---

### US-055: See what this item is connected to in other systems
**As an** Adjudicator, **I want** cross-system relationships surfaced inline on the item I am reading, **so that** assembling the complete picture stops being the work.

**Acceptance Criteria:**
- [ ] Given I open eApp case A-1042, when the related-items panel resolves, then it shows the related PVQ issue, the PDT designation, and the IM assignment, each badged with its system and grouped by relationship type with a count.
- [ ] Given a related item renders, when I read it, then the relationship is explained in the owning system's own words — for example "Issue raised against Section 13A employment history" — not composed by the UI from identifiers.
- [ ] Given the relationship is edited in the owning spoke's store, when I reload the page, then the panel reflects the change — proving the link is live rather than hard-coded.
- [ ] Given a target system is unavailable, when the panel renders, then it reads "{System} isn't responding right now, so this related item can't be opened." rather than showing a broken link or omitting the row.
- [ ] Given I am not entitled to a related item, when it renders, then it reads "You don't have access to the related item in {System}."
- [ ] Given there are no related items, when the panel renders, then it reads "No related items in other systems."

**Priority:** P0 | **Feature Ref:** F6, F7 | **Persona:** PER-02, PER-01 | **FRD:** FR-F06-05, FR-F07a-01

---

### US-056: Read one history instead of merging four by hand
**As an** Adjudicator reviewing a contested case, **I want** the item's spoke history and the hub's audit records in one chronological view, **so that** I can see the cross-system action as a single narrative.

**Acceptance Criteria:**
- [ ] Given I open an item's activity history, when it renders, then spoke-native entries and hub audit records appear merged in one list ordered newest first.
- [ ] Given a history row renders, when I read it, then it shows an absolute UTC timestamp plus a relative time, actor, actor role, action summary, and an origin badge distinguishing "Recorded by {System}" from "Recorded by the unified layer".
- [ ] Given a row carries a correlation ID, when I activate it, then I open the chain view showing every record for that action, where I am entitled to see it.
- [ ] Given the owning spoke's history call fails, when the page renders, then hub records still appear with the notice "Some history from {System} isn't available right now."
- [ ] Given more than twenty entries, when I choose "Load more", then further entries append and a polite announcement states "{n} more entries loaded."
- [ ] Given I am an Applicant, when I view my own history, then internal narratives are absent from the payload rather than merely hidden.

**Priority:** P0 | **Feature Ref:** F6, F13 | **Persona:** PER-02, PER-03 | **FRD:** FR-F06-06

---

### US-057: Complete the action my role exists to perform
**As an** Adjudicator, **I want to** record a determination or return a case for additional investigation, **so that** my half of the workflow is real rather than represented.

**Acceptance Criteria:**
- [ ] Given a case awaiting determination, when I record a determination, then the change persists and is visible through eApp's own API independently of the hub.
- [ ] Given a PDT designation, when I approve or return it with a required reason, then PDT's own API reflects the new state and an audit record is written.
- [ ] Given I return a case for clarification, when the Investigator next opens their queue, then the returned item appears in their work.
- [ ] Given an Applicant completes an assigned task, when it is submitted, then IEP's own API shows the task closed and a confirmation names what was received and what happens next.
- [ ] Given each of the four roles, when each performs at least one real action, then each change is visible in both the owning spoke's data and the audit trail.

**Priority:** P0 | **Feature Ref:** F6 | **Persona:** PER-02, PER-03, PER-01 | **FRD:** FR-F06-04, FR-F06-09, FR-F06-10, FR-F06-11

---

### US-058: See an unavailable system's screen degrade cleanly rather than break
**As an** Investigator, **I want** an item whose owning system is down to render an explained unavailable state, **so that** a spoke outage never produces a blank page or a stack trace.

**Acceptance Criteria:**
- [ ] Given Investigation Management is down, when I open an IM assignment, then the page renders inside the shell with "{System} isn't responding right now, so we can't show this item. Your other work is still available." plus "Try again" and "Back to work queue".
- [ ] Given that state renders, when I inspect the browser console, then no unhandled error is present.
- [ ] Given an application has been disabled by an Administrator, when I open one of its items, then I am told "{System} is turned off in this environment. Contact your administrator if you need access."
- [ ] Given a spoke returns a malformed record, when the hub validates it, then I see "We couldn't read this item from {System}. We've logged the problem — reference {correlationId}." and an integration issue is recorded.
- [ ] Given a forbidden item and a non-existent item, when each is requested, then the two responses are indistinguishable.

**Priority:** P0 | **Feature Ref:** F6, F16 | **Persona:** PER-01 | **FRD:** FR-F06-01, FR-F06-11, FR-F16-08

---
## Epic 7: FLAGSHIP — eApp Case → Related PVQ Issue → Dual-System Update (F7)

> **The single most important epic in this product.** If everything else fails, this must work.

An Investigator, signed in once, opens an eApp case from the unified work queue, discovers a related PVQ issue raised against a specific questionnaire answer, opens and resolves that issue without leaving the unified experience, and observes **both** eApp and PVQ reflect the change. No second login. No second application. No re-entry of context. No manual correlation.

The stories below are written one per step of the demonstrated path, so the epic can be read as the demo script and so a regression in any single step is attributable. US-066 covers the partial-failure path, which is the honest half of this story and the one R-06 names.

**Seeded preconditions (normative):** eApp `CASE-A-1042`, subject `SUBJ-00418`, `outstandingIssueCount = 1`; PVQ `ISS-2207`, status `OPEN`, `answerLocus = SECTION_13A.employer[0].endDate`.

---

### US-059: Find the eApp case in my unified queue and open it
**As an** Investigator, **I want** the eApp case carrying an outstanding issue to be waiting in my queue, **so that** the flagship workflow starts from my normal day rather than from a special screen.

**Acceptance Criteria:**
- [ ] Given I sign in and open the work queue at its default view, when page one renders, then `EAPP:CASE-A-1042` is present without my applying any filter.
- [ ] Given that row renders, when I read it, then it is attributed "eApp" and shows the subject, status "Under review", priority, and due date.
- [ ] Given I activate the row, when the case opens, then there is no interstitial, no new tab, and no credential prompt, and the queue state is encoded for my return.
- [ ] Given the case detail renders, when I time it under seeded data, then the case content appears within two seconds.
- [ ] Given the breadcrumb renders, when I read it, then it shows `Work Queue › eApp Case A-1042`.
- [ ] Given this step completes, when the audit trail is checked, then zero additional authentication events have occurred.

**Priority:** P0 | **Feature Ref:** F7, F5 | **Persona:** PER-01 | **FRD:** FR-F07a-02, FR-F18-05

---

### US-060: Discover, on the case itself, that an issue was raised against one of its answers
**As an** Investigator, **I want** the related PVQ issue surfaced inline on the case with the relationship explained, **so that** I stop discovering issues by accident after the case is already late.

**Acceptance Criteria:**
- [ ] Given the case detail renders, when I read the header, then it shows "1 outstanding issue" as a link that moves focus to the related-items panel heading.
- [ ] Given the related-items panel resolves, when I read the PVQ entry, then it is labelled "Issue raised against Section 13A — Employment history", badged PVQ, with the issue status "Open", the raised date, and the issue title.
- [ ] Given that label, when I trace its origin, then it comes from PVQ's own record rather than being composed by the UI — changing the seeded label changes what is displayed.
- [ ] Given the panel renders, when I read it, then the PDT designation and the IM assignment for the same case are also shown, so the cross-system story is more than a single link.
- [ ] Given case detail loads, when the related panel is still resolving, then the main case content renders first and the panel resolves independently with its own skeleton.
- [ ] Given PVQ is unavailable at this moment, when the panel renders, then the case still opens and the panel states "PVQ isn't responding right now, so this related issue can't be opened."

**Priority:** P0 | **Feature Ref:** F7, F6 | **Persona:** PER-01 | **FRD:** FR-F07a-01, FR-F06-05

---

### US-061: Move from the case to the issue without leaving the experience
**As an** Investigator, **I want to** open the related PVQ issue inside the same shell with the case context carried for me, **so that** crossing a system boundary costs me nothing — no login, no search, no retyping a reference.

**Acceptance Criteria:**
- [ ] Given I activate the related issue, when the issue screen loads, then it renders inside the same shell with the header, banner, and navigation remaining mounted throughout — no new tab, no window, no iframe, no redirect to a spoke origin.
- [ ] Given the traversal occurs, when I observe it, then no authentication prompt, interstitial, or full-page loading screen replaces the shell.
- [ ] Given the issue screen renders, when I read the breadcrumb, then it reads `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207` with source badges on the second and third segments.
- [ ] Given the issue screen renders, when I read the top of the page, then a case context strip states "Part of eApp Case A-1042 — {subject name}" and links back to the case.
- [ ] Given the traversal completes, when I count what I typed, then I typed nothing — no identifier was entered, copied, or pasted at any point.
- [ ] Given a screen reader is in use, when the new page loads, then the page title changes descriptively and focus moves to the new heading.
- [ ] Given the traversal occurs, when the audit trail is queried, then a `RELATED_ITEM_TRAVERSED` record exists naming both the case and the issue under the workflow correlation ID.

**Priority:** P0 | **Feature Ref:** F7, F3 | **Persona:** PER-01 | **FRD:** FR-F07a-03, FR-F03-06

---

### US-062: Read the flagged answer in context before I decide
**As an** Investigator, **I want** the issue screen to quote the questionnaire answer the issue was raised against, **so that** I can resolve it on the evidence rather than on a reference number.

**Acceptance Criteria:**
- [ ] Given the issue screen renders, when I read it, then it shows the question text, the answer snapshot as it stood when the issue was raised, and the section label "Section 13A — Employment history".
- [ ] Given I want the full context, when I follow the link to the parent case's section, then it deep-anchors to that exact questionnaire section on the case screen.
- [ ] Given I arrive at that section via the related-item link, when it renders, then it carries a text marker reading "Issue raised on this section".
- [ ] Given the underlying answer has since changed in eApp, when I read the issue, then the snapshot PVQ stored is still readable, so the issue remains interpretable.
- [ ] Given the issue was already resolved by someone else, when the page renders, then a banner states "This issue was already resolved by {actor} on {date}. No further action is needed." and the resolution form is disabled with that reason.

**Priority:** P0 | **Feature Ref:** F7, F6 | **Persona:** PER-01 | **FRD:** FR-F07a-03, FR-F06-08

---

### US-063: Resolve the issue with a disposition and a narrative
**As an** Investigator, **I want to** record how I resolved the issue and confirm I reviewed the flagged answer, **so that** what I leave behind survives scrutiny by an adjudicator months later.

**Acceptance Criteria:**
- [ ] Given the resolution form renders, when I read it, then it offers a radio group inside a fieldset legended "Resolution disposition" with four options — Substantiated, Unsubstantiated, Resolved with clarification, Referred for further review — each carrying hint text explaining what it means.
- [ ] Given the form renders, when I read the action panel, then it states "This updates PVQ and eApp." **before** I submit.
- [ ] Given I submit without choosing a disposition, when validation runs, then an error summary appears with focus moved to it and the message "Choose a resolution disposition."
- [ ] Given I submit a narrative shorter than 20 characters, when validation runs, then the message reads "Enter at least 20 characters describing how you resolved this issue." and my typed text is preserved.
- [ ] Given I submit without confirming I reviewed the answer, when validation runs, then the message reads "Confirm that you have reviewed the flagged answer."
- [ ] Given I choose "Referred for further review", when I submit, then only PVQ is written and the eApp outstanding-issue count is deliberately unchanged, demonstrating that the dual write is disposition-driven rather than blanket.
- [ ] Given I submit a parent case identifier that does not match the issue's actual parent, when the server verifies the relationship, then the request is rejected — the client does not get to tell the server which case to update.

**Priority:** P0 | **Feature Ref:** F7, F6 | **Persona:** PER-01 | **FRD:** FR-F07a-04, FR-F14-03

---

### US-064: Have the hub coordinate the update across both systems
**As an** Investigator, **I want** one submission to update both PVQ and eApp correctly or not at all, **so that** I never have to perform the second half of my own transaction by hand.

**Acceptance Criteria:**
- [ ] Given I submit, when the hub processes it, then it authorises **both** legs before writing anything — a principal authorised for one leg but not the other is denied outright.
- [ ] Given either target system is unhealthy, when the pre-flight check runs, then the orchestration is refused before any write with "{System} isn't responding right now, so nothing was changed."
- [ ] Given the orchestration proceeds, when it executes, then a reconciliation record exists before the first spoke is written, so a crash mid-orchestration is discoverable.
- [ ] Given the PVQ write succeeds, when the eApp write follows, then PVQ records the disposition and resolver, and eApp decrements its outstanding-issue count and moves the case to "Review complete — pending adjudication" when the count reaches zero.
- [ ] Given I accidentally submit twice, when the second request arrives with the same idempotency key, then the stored outcome is returned and neither leg executes a second time.
- [ ] Given the PVQ write fails, when the hub responds, then no eApp call is attempted and the message states unambiguously that nothing changed.

**Priority:** P0 | **Feature Ref:** F7 | **Persona:** PER-01 | **FRD:** FR-F07b-01, FR-F07b-02

---

### US-065: See what each system says about itself after my action
**As an** Investigator, **I want** the confirmation to report what each system independently says now, **so that** the demonstration proves both systems changed rather than asserting it.

**Acceptance Criteria:**
- [ ] Given the orchestration completes, when the confirmation screen renders, then it shows a per-system results table with columns System, What we asked for, What the system reports now, and Outcome — one row per leg.
- [ ] Given that table renders, when I inspect its data, then each row shows a **fresh re-read** from the owning spoke rather than the value the hub intended to write.
- [ ] Given a successful substantiated resolution, when the table renders, then PVQ reports "Resolved — Substantiated" and eApp reports "No outstanding issues".
- [ ] Given a re-read fails for one system, when that row renders, then it reads "We couldn't confirm the current state in {System}." with a "Check again" control — the row is never omitted for tidiness.
- [ ] Given the table renders, when it is inspected for accessibility, then it is a real table with a caption reading "Results in each connected system", header scopes, and outcome shown as text plus icon, never colour alone.
- [ ] Given the screen renders, when a screen reader is in use, then it is announced once — "Resolution complete. PVQ and eApp both updated." — and the summary alert receives focus.

**Priority:** P0 | **Feature Ref:** F7 | **Persona:** PER-01 | **FRD:** FR-F07b-04

---

### US-066: Be told the truth when only one of the two systems updates  *(partial-failure path)*
**As an** Investigator, **I want** a half-completed cross-system update to be reported precisely, with a retry path, **so that** I am never told something succeeded when it did not.

**Acceptance Criteria:**
- [ ] Given PVQ has committed and the eApp write fails, when the response returns, then the outcome is reported as partially completed and the word "success" appears nowhere on the screen.
- [ ] Given the partial state renders, when I read it, then it states "Partly completed. PVQ recorded your resolution. eApp hasn't been updated yet — we're retrying automatically. You can also retry now." with the correlation ID.
- [ ] Given the partial state, when I look at the per-system table, then one row shows committed and one shows failed, and a "Retry eApp update" control is present and working.
- [ ] Given the PVQ resolution has committed, when the hub handles the failure, then it does **not** reverse it — a recorded investigative disposition is not fabricated away — and instead retries the outstanding leg with backoff.
- [ ] Given the eApp leg is still outstanding, when I return to the case, then it still shows "1 outstanding issue" plus an advisory that a resolution was recorded in PVQ and is being retried — the UI never fakes convergence.
- [ ] Given eApp is restored, when automatic retry next runs, then the legs converge with no action from me and the case then shows "No outstanding issues".
- [ ] Given retries are exhausted, when the state settles, then the transaction is flagged for attention, exactly one `ORCHESTRATION_INCOMPLETE` integration issue is visible to an Administrator, and that entry offers a working manual retry.
- [ ] Given retries run, when the audit chain is read, then every attempt appears under the original correlation ID.

**Priority:** P0 | **Feature Ref:** F7, F16 | **Persona:** PER-01, PER-04 | **FRD:** FR-F07b-03, FR-F11-03

---

### US-067: Satisfy myself independently that both systems really changed
**As an** evaluating reviewer, **I want to** verify the post-state in eApp and PVQ outside the unified layer entirely, **so that** I can believe the dual-system claim rather than take the hub's word for it.

**Acceptance Criteria:**
- [ ] Given the workflow has completed, when I return to the eApp case, then it shows "No outstanding issues" and the updated case state, re-read live from eApp.
- [ ] Given the workflow has completed, when I open the PVQ issue, then it shows status resolved with the disposition, narrative, resolver, and resolution timestamp.
- [ ] Given an operator token issued for the demonstration, when I `curl` the PVQ and eApp APIs directly, then both return the updated state without the hub in the path.
- [ ] Given I choose "Back to work queue" from the confirmation, when the queue loads, then my original filters, sort, and page are restored.
- [ ] Given each verification step, when it completes, then no re-authentication was required at any point.

**Priority:** P0 | **Feature Ref:** F7, F9 | **Persona:** PER-01, PER-04 | **FRD:** FR-F07a-05, FR-F07b-05, FR-F09-08

---

### US-068: Read the whole cross-system action as one story
**As an** Adjudicator reading this record months later, **I want** the entire workflow retrievable as a single correlated chain, **so that** I can see what happened across both systems as one event instead of four disconnected rows.

**Acceptance Criteria:**
- [ ] Given the workflow completed, when I open the audit chain for its correlation ID, then it contains at least five records covering the case read, the related-item resolution, the traversal, the issue read, both writes, and the completion.
- [ ] Given the chain renders, when I read the top of it, then a summary line states "Investigator {name} resolved PVQ issue ISS-2207 against eApp case A-1042 on {date}. Both systems updated."
- [ ] Given the chain renders, when I read each record, then it carries a system badge, the elapsed time since the previous step, and a plain-language before/after summary such as "status: Open → Resolved — Substantiated" and "outstanding issues: 1 → 0".
- [ ] Given a partial completion, when I read its chain, then it clearly shows which leg failed and every retry attempt.
- [ ] Given I want to keep the evidence, when I export the filtered chain, then the export contains exactly the records shown on screen and carries the synthetic-data notice.
- [ ] Given any audit write in the chain had failed, when the operation was evaluated, then it would have been reported as not completed rather than silently proceeding.

**Priority:** P0 | **Feature Ref:** F7, F13 | **Persona:** PER-02, PER-04 | **FRD:** FR-F07b-06, FR-F13-04

---

### US-069: Complete the entire flagship workflow using the keyboard alone
**As an** Investigator who does not use a mouse, **I want to** drive the whole cross-application workflow from the keyboard, **so that** the continuity this product claims is available to me on the same terms as everyone else.

**Acceptance Criteria:**
- [ ] Given I use only the keyboard, when I run the workflow from queue to confirmation, then every step is reachable and operable with Tab, Shift-Tab, Enter, Space, arrow keys, and Escape.
- [ ] Given I move between screens, when each loads, then focus lands predictably on the new page's heading and the page title changes descriptively.
- [ ] Given any interactive element receives focus, when it does, then the focus indicator is visible against its background.
- [ ] Given I traverse from the case to the issue, when focus moves, then I am never trapped and never returned to the top of an unchanged document.
- [ ] Given the four screens involved, when the automated accessibility scan runs on each, then it reports zero serious or critical violations.
- [ ] Given the manual keyboard pass, when it is performed before the demonstration, then it is recorded with date, tooling, and findings.

**Priority:** P0 | **Feature Ref:** F7, F14 | **Persona:** PER-01 | **FRD:** FR-F14-02, FR-F07a-06

---
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
## Epic 10: Unified Layer API — Backend-for-Frontend (F10)

The hub's own HTTP API: the single server-side surface the web UI consumes and the only place authorisation and audit are enforced. It is a product surface in its own right, because it is what an evaluator's `curl` command talks to and where the zero-trust claims become testable.

---

### US-081: Have every request pass through one enforcement point
**As an** Administrator responsible for the platform's security posture, **I want** every API request to traverse the same ordered pipeline, **so that** no endpoint can quietly skip authorisation or audit.

**Acceptance Criteria:**
- [ ] Given any request, when it is processed, then it passes in order through correlation, security headers, session resolution, CSRF verification, reserved-field rejection, input validation, authorisation, handler, audit on mutation, and response composition.
- [ ] Given a route enumeration test runs, when it completes, then zero endpoints are found that bypass or reorder the pipeline.
- [ ] Given an authenticated response, when its headers are inspected, then it carries `Cache-Control: no-store`, a content-security policy, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.
- [ ] Given a request carrying an unknown field, when validation runs, then the field is rejected rather than ignored.
- [ ] Given the access log, when it is inspected, then it never contains an action form body or an authentication payload.

**Priority:** P0 | **Feature Ref:** F10, F2 | **Persona:** PER-04 | **FRD:** FR-F10-01

---

### US-082: Get the same shape of error from every endpoint
**As an** Administrator diagnosing a report, **I want** one consistent error contract across the whole API, **so that** I can interpret any failure without learning a per-endpoint dialect.

**Acceptance Criteria:**
- [ ] Given any non-2xx response, when I read the body, then it carries a machine-readable code, a human-readable message, a detail line, a correlation ID, field errors where applicable, and retry guidance.
- [ ] Given any error response, when I inspect it, then it contains no stack trace, no internal hostname, no SQL, and no spoke exception text.
- [ ] Given a denial, when I read the response, then it never discloses whether the resource exists.
- [ ] Given any error message text, when it is compared to the documented catalogue, then the copy matches exactly.

**Priority:** P0 | **Feature Ref:** F10 | **Persona:** PER-04 | **FRD:** FR-F10-03

---

### US-083: Have every state change recorded before I am told it worked
**As an** Administrator, **I want** the audit write to happen inside the mutation path before the success response, **so that** an unauditable action can never be reported as complete.

**Acceptance Criteria:**
- [ ] Given any mutating endpoint, when it succeeds, then exactly one audit record of the expected type exists for that invocation.
- [ ] Given the audit store is made unavailable, when I attempt a mutation, then it is reported as not completed with a specific message and a correlation ID.
- [ ] Given a spoke write committed before an audit write failed, when the response returns, then I am told honestly that the action may have been applied, an integration issue is created, and an administrator is notified.
- [ ] Given the audit write, when it is inspected, then it is synchronous — never deferred, queued, batched, or made asynchronous.
- [ ] Given a registry of mutating endpoints, when the audit-coverage test runs, then every one is asserted.

**Priority:** P0 | **Feature Ref:** F10, F13 | **Persona:** PER-04 | **FRD:** FR-F10-05, FR-F13-01

---

### US-084: Read accurate API documentation and exercise it myself
**As an** evaluating reviewer with a technical background, **I want** published API documentation generated from the implementation, **so that** I can test the zero-trust claims directly rather than taking them on faith.

**Acceptance Criteria:**
- [ ] Given the documentation, when I open it, then it covers 100% of routes and is generated from the implementation's route declarations rather than hand-maintained.
- [ ] Given any documented endpoint, when I read its entry, then it states method, path, summary, required permission, request and response schemas, every possible error code with its user-facing copy, and whether it writes audit.
- [ ] Given a route exists without documentation, or documented schemas that do not match the implementation, when CI runs, then the build fails.
- [ ] Given the documentation alone, when I exercise the flagship orchestration endpoint, then I can do so successfully.
- [ ] Given the documentation route, when a non-administrator requests it, then access is denied.

**Priority:** P1 | **Feature Ref:** F10 | **Persona:** PER-04 | **FRD:** FR-F10-06

---

### US-085: Have every endpoint tested including at least one refusal
**As an** evaluating reviewer, **I want** every documented endpoint exercised by an automated test with an unauthorised negative case, **so that** the server-side authorisation claim is measured across the whole surface rather than sampled.

**Acceptance Criteria:**
- [ ] Given the endpoint catalogue, when the test suite runs, then every documented endpoint is exercised.
- [ ] Given each endpoint, when the negative suite runs, then at least one unauthorised-access case is asserted and denied.
- [ ] Given the four roles, when the RBAC suite runs, then every permitted action succeeds and every non-permitted action returns a denial.
- [ ] Given an endpoint references an action string absent from the role matrix, when the startup check runs, then it fails the build.
- [ ] Given test results, when a reviewer reads the summary, then it is presented in readable form rather than only as a CI log.

**Priority:** P1 | **Feature Ref:** F10, F19 | **Persona:** PER-04 | **FRD:** FR-F19-02, FR-F19-09

---
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
## Epic 13: Immutable Audit Trail and Audit Viewer (F13)

An append-only record of who did what, to what, and when — written on every state-changing operation and viewable and filterable in the UI. The audit trail is not optional instrumentation: an action that cannot be audited does not complete.

---

### US-101: Have every action I take recorded before I am told it worked
**As an** Investigator, **I want** the record of my action written before the system reports success, **so that** what I did months ago is still defensible when an adjudicator or an inspector reads it.

**Acceptance Criteria:**
- [ ] Given I complete any state-changing action, when it succeeds, then exactly one audit record exists for it, written inside the mutation path before the success response was composed.
- [ ] Given the audit store is unavailable, when I attempt an action, then it is reported as not completed — the system never returns success for an unaudited action.
- [ ] Given a spoke write committed before an audit write failed, when I see the result, then I am told honestly that it may have been applied in that system, told to check its current status, and given a correlation ID; an administrator is notified.
- [ ] Given any audit write, when it is inspected, then it is synchronous rather than queued or batched.

**Priority:** P0 | **Feature Ref:** F13 | **Persona:** PER-01 | **FRD:** FR-F13-01

---

### US-102: Have the record capture who I was at the moment I acted
**As an** Adjudicator, **I want** the audit record to snapshot the actor's roles and attributes as at the time of the action, **so that** a later change to someone's permissions cannot rewrite what they were when they acted.

**Acceptance Criteria:**
- [ ] Given any audit record, when I read it, then it carries timestamp, sequence number, actor identity and display name, the actor's roles and attributes as at the time of action, active role, action type, target system and its display name, target resource type and identifier, outcome, reason code and policy rule for denials, before/after summaries, correlation and request identifiers, session identifier, sign-in method, and record hashes.
- [ ] Given a role or attribute changes after an action, when I read the historical record, then it still shows what the actor held at the time.
- [ ] Given an application is later de-registered, when I read a record referencing it, then the stored display name is shown rather than a live lookup, so history stays legible.
- [ ] Given a before/after summary, when I read it, then it is plain language such as "status: Open → Resolved — Substantiated" rather than a raw record dump.
- [ ] Given an undeclared action type, when startup validation runs, then it fails the check — the action vocabulary is closed.

**Priority:** P0 | **Feature Ref:** F13 | **Persona:** PER-02 | **FRD:** FR-F13-02

---

### US-103: Find authentication, denials, and integration failures in the trail too
**As an** Administrator, **I want** the trail to cover more than mutations, **so that** a security question can be answered from one place rather than three.

**Acceptance Criteria:**
- [ ] Given a sign-in, sign-out, session expiry, failed authentication, or role switch, when it occurs, then a record of the appropriate type exists.
- [ ] Given any authorisation denial, when it occurs, then a record exists with outcome denied and the policy rule that denied it.
- [ ] Given an application is registered, updated, enabled, disabled, de-registered, or probed, when it occurs, then a record names the administrator and the change.
- [ ] Given an adapter failure accompanies a user action, when it occurs, then a record exists for it.
- [ ] Given the audit trail itself is viewed or exported, when it happens, then that read is itself recorded.
- [ ] Given routine list reads, when they occur, then they are deliberately **not** audited, and the enumerated exceptions are documented rather than left to discretion.

**Priority:** P0 | **Feature Ref:** F13 | **Persona:** PER-04 | **FRD:** FR-F13-02

---

### US-104: Trust that no one has quietly altered the record
**As an** Administrator, **I want** audit storage to be append-only with detectable tampering, **so that** "immutable" is a property I can demonstrate rather than a word in a document.

**Acceptance Criteria:**
- [ ] Given the application's routes and code, when they are enumerated and statically analysed, then no endpoint, service method, or UI control updates or deletes an audit record.
- [ ] Given the hub's database credential, when its grants are inspected, then it holds insert and select on the audit table only — no update, no delete, no truncate.
- [ ] Given I attempt a mutation method against the audit API, when it is rejected, then I am told "Audit records can't be changed or deleted."
- [ ] Given I run an integrity check, when it completes, then it reports how many records were checked and whether the hash chain verifies, shown as text plus icon.
- [ ] Given a record is altered directly in the database outside the application, when the integrity check runs, then it fails at that record and names the first broken sequence number.
- [ ] Given a full demonstration run, when sequence numbers are inspected, then they are monotonic and gap-free.

**Priority:** P0 | **Feature Ref:** F13 | **Persona:** PER-04 | **FRD:** FR-F13-03

---

### US-105: Read and filter the trail to answer a specific question
**As an** Administrator, **I want** a filterable audit table, **so that** "who did what, to what, when" is one query rather than an afternoon.

**Acceptance Criteria:**
- [ ] Given I open the audit viewer, when it renders, then columns show timestamp, actor, role at action, action, target system, target resource, outcome as text plus icon, and a correlation ID linking to the chain.
- [ ] Given I filter by actor, role, action type, target system, resource, outcome, correlation ID, or date range, when results return, then the filters combine correctly and appear as removable chips with a clear-all control, matching the work-queue pattern.
- [ ] Given I change any filter or sort, when results settle, then a polite announcement states "{n} audit records. Showing {a} to {b}."
- [ ] Given I request a range longer than ninety days, when I submit, then I am told "Choose a date range of 90 days or fewer."
- [ ] Given no records match, when the table renders, then it reads "No audit records match your filters. Try widening the date range."
- [ ] Given the table, when the accessibility scan runs, then it reports zero serious or critical violations and sort state is announced.

**Priority:** P0 | **Feature Ref:** F13, F14 | **Persona:** PER-04 | **FRD:** FR-F13-05

---

### US-106: Open one record in full and follow it into its chain
**As an** Administrator, **I want** a record detail view with a link into everything that shared its correlation ID, **so that** I can move from a symptom to the whole story in one step.

**Acceptance Criteria:**
- [ ] Given I open a record, when it renders, then every field is shown in a definition list including the actor's roles and attributes as at the time of action, the reason code and policy rule for denials, both hashes, and the sequence number.
- [ ] Given I choose "View full chain", when it loads, then every record sharing that correlation ID renders as an ordered narrative with system badges, elapsed time between steps, and a summary line.
- [ ] Given I need to quote the reference, when I use the copy control, then the full correlation ID is copied as selectable text.
- [ ] Given I am entitled to the affected work item, when I follow the link, then I reach it; where I am not entitled, the link is absent rather than broken.
- [ ] Given a record I may not see, when I request it, then the denial is identical to the denial for a record that does not exist.
- [ ] Given the hashes are displayed, when I read them, then a short explanation states what they prove.

**Priority:** P0 | **Feature Ref:** F13 | **Persona:** PER-04 | **FRD:** FR-F13-06

---

### US-107: See my own activity without seeing anyone else's
**As an** Investigator, **I want** my dashboard and item histories to show my own audited activity, **so that** I can retrace what I did without being given a window into colleagues' work.

**Acceptance Criteria:**
- [ ] Given I am a mission user or applicant, when I query the audit trail, then I see only records where I am the actor.
- [ ] Given that scoping, when it is implemented, then it is applied in the query itself rather than by filtering after retrieval, verified by a direct API probe.
- [ ] Given a chain I participated in that also contains another actor's records, when I view it, then those records appear as redacted placeholders — "An action by another user — {timestamp}" — so the shape of the narrative is honest even where detail is withheld.
- [ ] Given I am an Administrator, when I query the trail, then I see every record.
- [ ] Given I am an Applicant viewing my own activity, when it renders, then no fields are redacted, because my own actions contain nothing I may not see.

**Priority:** P0 | **Feature Ref:** F13, F2 | **Persona:** PER-01, PER-03, PER-04 | **FRD:** FR-F13-07, FR-F13-04

---

### US-108: Take the evidence away with me
**As an** Administrator, **I want to** export a filtered audit view, **so that** I can attach the record of a cross-system action to an inquiry without a screenshot.

**Acceptance Criteria:**
- [ ] Given I export a filtered view, when the file is produced, then it contains exactly the records I could see on screen under the same scoping and filters.
- [ ] Given the export, when I open it, then its first line reads `# DEMO — SYNTHETIC DATA ONLY` and a header block states generation time, generating actor, applied filters, record count, and the integrity verification result for the range.
- [ ] Given I request more than ten thousand records, when I submit, then I am told "Narrow your filters — exports are limited to 10,000 records."
- [ ] Given any export, when it completes, then an audit record naming the filters and the count is written.
- [ ] Given CSV output, when I open it, then it is UTF-8 with a byte-order mark, quoted fields, and the documented column order; JSON output mirrors the API record schema.

**Priority:** P1 | **Feature Ref:** F13 | **Persona:** PER-04 | **FRD:** FR-F13-08

---
## Epic 14: USWDS v3 Accessible Interface — Section 508 / WCAG 2.1 AA (F14)

Accessibility is treated here as a set of user stories rather than as a checklist appended to a quality section, because the people these stories describe are doing the same throughput-measured work as everyone else. For a federal audience, failures on this surface are disqualifying — so every story below is written from the user's point of view and every criterion is something a test or a manual pass can verify.

---

### US-109: Do my entire job from the keyboard
**As an** Investigator who does not use a mouse, **I want** every control in the product reachable and operable by keyboard, **so that** nothing in my work depends on a pointing device.

**Acceptance Criteria:**
- [ ] Given any screen, when I navigate with Tab and Shift-Tab, then every interactive element is reachable, and Enter activates links and buttons, Space activates buttons and toggles checkboxes, arrow keys move within radio groups and menus, and Escape closes overlays.
- [ ] Given any component, when I try to leave it with the keyboard, then I can — there are zero keyboard traps anywhere in the product.
- [ ] Given a modal is open — the certificate picker, the session warning, a destructive confirmation — when I operate it, then focus is trapped while it is open, Escape closes it, and focus returns to the control that opened it.
- [ ] Given any screen, when I Tab through it, then tab order follows visual order and no positive tab index is used.
- [ ] Given a disabled control, when I Tab past it, then it is not in the tab order and its reason is available as adjacent text rather than requiring focus on the disabled element.
- [ ] Given the flagship workflow, when I complete it keyboard-only from queue to confirmation, then it succeeds end to end.

**Priority:** P0 | **Feature Ref:** F14 | **Persona:** PER-01 | **FRD:** FR-F14-02

---

### US-110: Operate the work queue with a screen reader
**As an** Investigator who uses a screen reader, **I want** the work queue to be a properly structured data table, **so that** the single most-used screen in the product is usable non-visually.

**Acceptance Criteria:**
- [ ] Given the queue renders, when I reach the table, then it has a caption describing its contents and current result count, a column header scope on every header, and a row header on each row's identifying cell.
- [ ] Given a sortable header, when I activate it, then the sort state is exposed on the header and the new sort and result count are announced — "Sorted by due date, ascending. 14 items."
- [ ] Given I change a filter or search, when results settle, then the new count is announced politely — "{n} results. Showing {a} to {b}."
- [ ] Given pagination, when I reach it, then it carries an accessible label, the current page is marked, and bound controls are disabled and visible rather than hidden.
- [ ] Given a narrow viewport, when the table exceeds the width, then it scrolls horizontally inside its own labelled, keyboard-scrollable region rather than forcing page-level horizontal scroll.
- [ ] Given an empty table, when it renders, then the designed empty state appears inside the table region with the caption still present.
- [ ] Given every data table in the product — queue, audit, admin inventory, health, integration issues, identities, and the dual-system confirmation results — when each is checked, then all of the above hold.

**Priority:** P0 | **Feature Ref:** F14, F5 | **Persona:** PER-01, PER-02, PER-04 | **FRD:** FR-F14-04

---

### US-111: Always see where my focus is
**As an** Adjudicator navigating by keyboard through a dense record, **I want** a visible focus indicator on every focusable element, **so that** I never lose my place in a long reading session.

**Acceptance Criteria:**
- [ ] Given any focusable element receives focus, when it does, then a visible focus indicator appears that meets a 3:1 contrast ratio against every background it appears on.
- [ ] Given the codebase, when the lint rule runs, then removing an outline without providing a replacement indicator fails the build.
- [ ] Given forced-colors or high-contrast mode is active, when I navigate, then focus indicators, status icons, and the demo banner all remain visible.
- [ ] Given a client-side route change, when the new page renders, then focus moves to its heading rather than being left at the top of an unchanged document.

**Priority:** P0 | **Feature Ref:** F14 | **Persona:** PER-02 | **FRD:** FR-F14-06, FR-F14-05

---

### US-112: Skip past the chrome straight to the content
**As an** Applicant using a screen reader on a phone, **I want** a skip link and correct landmarks, **so that** I do not have to traverse the header on every page to reach what I came for.

**Acceptance Criteria:**
- [ ] Given any page, when I press Tab once, then the first focusable element is a skip-to-main-content link that becomes visible on focus and moves focus to the main region.
- [ ] Given any page, when landmarks are inspected, then there is exactly one banner, one primary navigation, one breadcrumb navigation, one main, and one contentinfo, with distinct labels on any additional navigation regions.
- [ ] Given any page, when the heading structure is inspected, then it is gap-free with exactly one `<h1>`, `<h2>` for major regions, and `<h3>` for subsections.
- [ ] Given any page, when the title is read, then it is unique and descriptive and changes on every navigation including client-side route changes.
- [ ] Given the primary navigation, when I reach the current item, then it is indicated both programmatically and by a visible non-colour indicator.

**Priority:** P0 | **Feature Ref:** F14, F3 | **Persona:** PER-03 | **FRD:** FR-F14-05

---

### US-113: Understand exactly what I got wrong in a form
**As an** Applicant entering personal detail I find uncomfortable to disclose, **I want** form errors announced clearly and tied to the fields that caused them, **so that** a confusing validation message does not compound an already stressful task.

**Acceptance Criteria:**
- [ ] Given a form field, when it renders, then it has a programmatically associated label — never a placeholder standing in for one — and any hint text is associated by description.
- [ ] Given a required field, when it renders, then it is marked with a text indicator reading "required", never by colour or an asterisk alone.
- [ ] Given related inputs such as the disposition radio group or the sign-in method choice, when they render, then they are grouped in a fieldset with a legend.
- [ ] Given I submit an invalid form, when validation fails, then an error summary headed "There is a problem" appears at the top, focus moves to it, each entry links in-page to its field, each field shows an inline message associated by description and marked invalid, and the document title is prefixed "Error: ".
- [ ] Given any error message, when I read it, then it is specific and actionable and names what to do — never "Invalid input."
- [ ] Given a character-limited field, when I reach 90% and 100% of the limit, then a counter is announced politely rather than on every keystroke.
- [ ] Given a successful submission, when the confirmation appears, then it is announced politely and receives focus.

**Priority:** P0 | **Feature Ref:** F14, F6 | **Persona:** PER-03, PER-01 | **FRD:** FR-F14-03

---

### US-114: Never have to distinguish a status by colour
**As an** Adjudicator with a colour vision deficiency, **I want** every status, priority, and health state paired with text or a distinct icon, **so that** I can read the product in grayscale without losing meaning.

**Acceptance Criteria:**
- [ ] Given any health state, when it renders, then it shows "Healthy", "Degraded", or "Unavailable" as text with a distinct icon.
- [ ] Given any priority, when it renders, then it shows "Urgent", "Elevated", or "Routine" as text with a distinct tag shape.
- [ ] Given an overdue item, when it renders, then the word "Overdue" appears with an icon — never a coloured row alone.
- [ ] Given any outcome, when it renders, then "Success", "Denied", or "Failed" appears as text.
- [ ] Given all text, when contrast is measured, then it meets 4.5:1 for normal text and 3:1 for large text; meaningful non-text elements meet 3:1.
- [ ] Given every screen rendered in grayscale, when I read it, then all status meaning is retained.
- [ ] Given any chart, when it renders, then the same information is also available as an accessible table.

**Priority:** P0 | **Feature Ref:** F14 | **Persona:** PER-02 | **FRD:** FR-F14-06

---

### US-115: Be told about asynchronous changes without losing my place
**As an** Investigator who may be mid-form when a queue refresh or a degraded-system warning arrives, **I want** updates announced without stealing my focus, **so that** an alert never costs me what I was typing.

**Acceptance Criteria:**
- [ ] Given a queue refresh, a result count change, a widget load, a sort change, a new alert count, a health recovery, a role switch, or a connection-test result, when it completes, then it is announced politely without moving focus.
- [ ] Given a form error summary, an action failure, a session timeout threshold, or a degraded-system warning on first appearance, when it occurs, then it is announced assertively.
- [ ] Given rapid successive changes, when they occur, then announcements are debounced and deduplicated into one rather than a stream.
- [ ] Given a loading region, when it is busy, then it is marked busy with a visually hidden label and announces completion exactly once rather than repeatedly during polling.
- [ ] Given new content is inserted, when it arrives, then it does not move focus or reorder content under my cursor.
- [ ] Given a decorative icon, when it renders, then it is hidden from assistive technology; informative icons carry text alternatives.

**Priority:** P0 | **Feature Ref:** F14, F16 | **Persona:** PER-01 | **FRD:** FR-F14-07

---

### US-116: Use the product zoomed in, on a small screen, and without animation
**As an** Applicant checking my status on a phone, and **as a** magnification user in a reading-intensive role, **I want** the interface to work at 320px and at 200% zoom with motion I can turn off, **so that** how I read is not a barrier to what I can do.

**Acceptance Criteria:**
- [ ] Given a 320px viewport, when any route renders, then there is no horizontal page scroll and no loss of function.
- [ ] Given 200% zoom, when any route renders, then all content and function remain available with no clipping or overlap.
- [ ] Given text resized to 200%, when the page renders, then nothing is clipped or overlapping.
- [ ] Given content reflow, when it occurs, then two-dimensional scrolling is not required, except for data tables which scroll inside their own labelled region.
- [ ] Given a touch device, when I reach any target, then it is at least 44 by 44 CSS pixels.
- [ ] Given the reduced-motion preference is set, when the page renders, then all non-essential animation is disabled including skeleton shimmer and transitions.
- [ ] Given any tooltip or hover-revealed content, when I use a keyboard or touch, then the same content is available on focus and is never the only source of essential information.

**Priority:** P0 | **Feature Ref:** F14 | **Persona:** PER-03, PER-02 | **FRD:** FR-F14-08

---

### US-117: Not be punished by a timer for working at my own pace
**As an** Applicant whose sessions are short and interrupted, **I want** timing behaviour that warns me, lets me extend, and never discards what I typed, **so that** an interruption does not cost me an evening.

**Acceptance Criteria:**
- [ ] Given my session is about to expire, when two minutes remain, then a warning appears, is keyboard-operable, and offers an extension.
- [ ] Given the countdown runs, when a screen reader is in use, then it is announced at open, at 60 seconds, and at 15 seconds rather than continuously.
- [ ] Given I extend the session from inside a partially completed form, when the extension lands, then every field I had entered is preserved.
- [ ] Given content auto-refreshes, when it does, then it never moves focus or changes what is under my cursor; health polling updates a notice region only.
- [ ] Given any form, when I complete it, then no time limit other than the session timeout applies.

**Priority:** P0 | **Feature Ref:** F14, F0 | **Persona:** PER-03, PER-01 | **FRD:** FR-F14-09, FR-F00-06

---

### US-118: Read what the product claims about its own accessibility
**As an** evaluating reviewer, **I want** an accessibility statement and an automated gate that fails the build, **so that** the conformance claim is backed by evidence rather than by assertion.

**Acceptance Criteria:**
- [ ] Given the footer or the account menu on any screen — including while unauthenticated — when I follow the accessibility link, then I reach a statement naming the conformance target, the assessment approach, known limitations with dates, and how to report a problem.
- [ ] Given the statement, when I read it, then it discloses that the DCSA Ecosystem Style Guide was not supplied and that USWDS v3 with token-based theming was assumed.
- [ ] Given known limitations, when I read them, then they are listed with dates rather than claimed to be none.
- [ ] Given CI runs, when the automated accessibility scan executes across every route for every role including error, empty, and degraded states, then the build fails on any serious or critical violation.
- [ ] Given the codebase, when the theming lint rule runs, then zero hard-coded colour, font, or spacing literals are found and all visual values come from design tokens.
- [ ] Given a manual keyboard and screen-reader pass, when it is performed before the demonstration, then it is documented with date, tooling, and findings.

**Priority:** P0 | **Feature Ref:** F14, F19 | **Persona:** PER-04 | **FRD:** FR-F14-11, FR-F14-12, FR-F14-01

---
## Epic 15: Notifications, Alerts, and System Announcements (F15)

The layer that tells users something needs their attention: work-driven alerts derived server-side from aggregated spoke data, and administrator-authored announcements. Distinct from the demo banner, which is permanent chrome and is never affected by anything in this epic.

---

### US-119: Be told when something on my caseload changes
**As an** Investigator, **I want** alerts for overdue items, new assignments, newly raised PVQ issues on my cases, blocked cases, and stalled work, **so that** I am told rather than left to discover a problem when it is already late.

**Acceptance Criteria:**
- [ ] Given seeded data, when alerts are computed, then each configured rule fires for at least one persona — overdue, due soon, new assignment, new PVQ issue, blocked, stalled, action required, and incomplete orchestration.
- [ ] Given an alert is generated, when it renders, then it carries a severity as text plus icon, a title, a message, the source system badge, a generated date, and a direct link to the item that produced it.
- [ ] Given a PVQ issue raised in the last seven days against a case assigned to me, when my dashboard renders, then the alert appears and links to the parent eApp case — the on-ramp to the flagship workflow.
- [ ] Given alert counts and queue counts, when I compare them, then they agree exactly, because both derive from the same aggregation.
- [ ] Given any alert, when I follow its link, then it opens an item I am permitted to see — an alert can never reference something I cannot open.
- [ ] Given alert computation runs, when it completes, then it has mutated no spoke; alerts are read-only over spoke data and so never need to be undone.

**Priority:** P1 | **Feature Ref:** F15, F4 | **Persona:** PER-01 | **FRD:** FR-F15-01

---

### US-120: See at a glance that something is waiting for me
**As an** Adjudicator, **I want** an unread count in the header and one page listing everything that wants my attention, **so that** I do not have to visit four screens to find out whether anything changed.

**Acceptance Criteria:**
- [ ] Given unread alerts exist, when the header renders, then it shows a count as text plus icon with the accessible name "Notifications: {n} unread" and is a link rather than a hover-only popover.
- [ ] Given I open the notifications page, when it renders, then it shows sections for "Needs your attention", "Other alerts", and "Announcements", each with a heading and a count, and each empty section shows its own empty state rather than disappearing.
- [ ] Given I filter by type, severity, source system, or read state, when results return, then chips and a clear-all control behave exactly as the work queue's do and the result count is announced.
- [ ] Given the header count and the page's unread count, when I compare them, then they match exactly.
- [ ] Given the page, when the accessibility scan runs, then it reports zero serious or critical violations and the list is a real table with a caption.

**Priority:** P1 | **Feature Ref:** F15 | **Persona:** PER-02 | **FRD:** FR-F15-02, FR-F15-06

---

### US-121: Mark an alert as read without it disappearing
**As an** Investigator, **I want** read state that changes an alert's treatment without hiding it, **so that** noticing something is not confused with resolving it.

**Acceptance Criteria:**
- [ ] Given I mark an alert as read, when it completes, then a polite announcement states "Marked as read. {n} unread remaining."
- [ ] Given an item is still overdue, when I have marked its alert read, then the alert is still shown — dismissing awareness does not resolve work.
- [ ] Given I complete the underlying work, when alerts are next computed, then the alert disappears automatically.
- [ ] Given read state, when another user views their own notifications, then my read state has no effect on theirs.
- [ ] Given read state, when I sign in again later, then it has persisted.
- [ ] Given marking read, when the audit trail is queried, then it is deliberately not recorded, because it changes no mission data and auditing it would flood the trail.

**Priority:** P1 | **Feature Ref:** F15 | **Persona:** PER-01 | **FRD:** FR-F15-03

---

### US-122: Read a notice from the platform team where I already look
**As an** Applicant, **I want** announcements to appear on my dashboard and stay retrievable afterwards, **so that** I do not learn something important from an email I have already lost.

**Acceptance Criteria:**
- [ ] Given an announcement targets my role and is currently effective, when I sign in, then it appears in a dedicated region below the header using the site-alert pattern matching its severity.
- [ ] Given I dismiss an informational or warning announcement, when the dismissal saves, then it disappears immediately for me without a reload and remains visible for other users.
- [ ] Given I dismissed something by accident, when I open the notifications page, then it is still listed with its full text and issued date, marked "Dismissed".
- [ ] Given an emergency announcement, when it renders, then it cannot be dismissed and the component explains why.
- [ ] Given the announcement body, when it renders, then it is plain text escaped on render, with any link provided as a structured action rather than smuggled into prose.
- [ ] Given an announcement arrives mid-session, when it appears, then it is announced politely once — or assertively if it is an emergency — without stealing focus.

**Priority:** P1 | **Feature Ref:** F15, F11 | **Persona:** PER-03 | **FRD:** FR-F15-04

---

### US-123: Never have a notice hide the demo banner
**As an** evaluating reviewer, **I want** the synthetic-data banner to survive every announcement, alert, and overlay, **so that** the honesty of the demonstration cannot be compromised by a notification.

**Acceptance Criteria:**
- [ ] Given an emergency announcement is active and a modal is open simultaneously, when the page is inspected, then the demo banner is still visible and not overlaid, scrolled out, or reduced.
- [ ] Given any overlay, when it renders, then it sits below the banner in stacking order.
- [ ] Given the banner, when it is compared to announcements, then they are different components — the banner is chrome, is not stored as an announcement, and is unaffected by any announcement setting.
- [ ] Given the automated assertion for the worst case, when it runs in CI, then it passes.

**Priority:** P1 | **Feature Ref:** F15, F3 | **Persona:** PER-04 | **FRD:** FR-F15-05, FR-F03-03

---

### US-124: Not be told everything is fine when alerts could not be computed
**As an** Adjudicator, **I want** the notifications surface to say which systems it could not reach, **so that** an absent alert is never presented to me as an all-clear.

**Acceptance Criteria:**
- [ ] Given a source is unavailable, when notifications render, then a named notice states "Alerts from {System} aren't available right now."
- [ ] Given every source is unavailable, when the page renders, then it states "We can't check for new alerts right now. Announcements are still shown below." rather than showing nothing.
- [ ] Given I genuinely have no alerts, when the page renders, then it reads "You have no notifications. New alerts and announcements will appear here." — copy distinct from the degraded case.
- [ ] Given notifications cannot load at all, when the page renders, then a retry control is offered rather than a blank region.
- [ ] Given alert polling is running, when a modal is open or a form has unsaved input, then polling is suspended so an announcement never interrupts an action in progress.

**Priority:** P1 | **Feature Ref:** F15, F16 | **Persona:** PER-02 | **FRD:** FR-F15-01, FR-F15-02, FR-F16-07

---
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
## Story Index

All 151 stories, in document order, with the PRD feature each satisfies and the persona it serves. Story IDs are stable; the epic column matches the PRD feature ID.

| Story | Title | Epic / Feature | Priority | Persona |
|---|---|---|---|---|
| US-001 | Choose a sign-in method | Epic 0 / F0 | P0 | PER-01…04 |
| US-002 | Sign in with a simulated CAC/PIV certificate | Epic 0 / F0 | P0 | PER-01 |
| US-003 | Sign in through the ECA external certificate authority | Epic 0 / F0 | P0 | PER-01 |
| US-004 | Sign in with generic MFA using a visible demo code | Epic 0 / F0 | P0 | PER-03 |
| US-005 | Be told nothing useful when sign-in fails | Epic 0 / F0 | P0 | PER-03 |
| US-006 | Be warned before my session times out | Epic 0 / F0 | P0 | PER-01, PER-03 |
| US-007 | Sign out and end access to every connected application | Epic 0 / F0 | P0 | PER-01 |
| US-008 | Never be misled into thinking the authentication is real | Epic 0 / F0 | P0 | PER-04 |
| US-009 | Move between systems' work without signing in again | Epic 1 / F1 | P0 | PER-01 |
| US-010 | Have my identity asserted by the hub, never by my browser | Epic 1 / F1 | P0 | PER-04 |
| US-011 | Follow a deep link and land there after one sign-in | Epic 1 / F1 | P0 | PER-02 |
| US-012 | See who I am, in which role, and how long I have | Epic 1 / F1 | P0 | PER-01 |
| US-013 | Switch between the roles I hold without signing in again | Epic 1 / F1 | P0 | PER-01, PER-02 |
| US-014 | Have every step of one action carry one reference | Epic 1 / F1 | P0 | PER-04 |
| US-015 | See only the navigation and controls I am entitled to | Epic 2 / F2 | P0 | PER-03 |
| US-016 | Have my entitlement to a specific record checked | Epic 2 / F2 | P0 | PER-01 |
| US-017 | See a different action set than my colleague on the same item | Epic 2 / F2 | P0 | PER-02 |
| **US-018** | **Be refused another person's record** *(negative)* | Epic 2 / F2 | P0 | PER-03 |
| **US-019** | **Be refused an adjudicator-only action** *(negative)* | Epic 2 / F2 | P0 | PER-01 |
| **US-020** | **Be refused the administrator console** *(negative)* | Epic 2 / F2 | P0 | PER-01…03 |
| **US-021** | **Be refused a case outside my unit or region** *(negative)* | Epic 2 / F2 | P0 | PER-01 |
| **US-022** | **Be refused a case above my clearance tier** *(negative)* | Epic 2 / F2 | P0 | PER-01 |
| **US-023** | **Be refused mission content as an administrator** *(negative)* | Epic 2 / F2 | P0 | PER-04 |
| US-024 | Get a denial that explains itself without revealing anything | Epic 2 / F2 | P0 | PER-01…04 |
| US-025 | Inspect the policy rather than infer it | Epic 2 / F2 | P1 | PER-04 |
| US-026 | Work inside one consistent frame on every screen | Epic 3 / F3 | P0 | PER-01…04 |
| US-027 | Always see that the data is synthetic | Epic 3 / F3 | P0 | PER-04 |
| US-028 | Find my job in a menu built for my role | Epic 3 / F3 | P0 | PER-03 |
| US-029 | Always know where I am across a system boundary | Epic 3 / F3 | P0 | PER-01 |
| US-030 | Search across everything I am allowed to see | Epic 3 / F3 | P1 | PER-02, PER-03 |
| US-031 | Land somewhere useful when a page does not exist | Epic 3 / F3 | P0 | PER-01, PER-03 |
| US-032 | Reach every screen the product claims to have | Epic 3 / F3 | P0 | PER-04 |
| US-033 | See my caseload posture on sign-in *(Investigator dashboard)* | Epic 4 / F4 | P0 | PER-01 |
| US-034 | See what awaits my determination *(Adjudicator dashboard)* | Epic 4 / F4 | P0 | PER-02 |
| US-035 | Understand where I am in plain language *(Applicant dashboard)* | Epic 4 / F4 | P0 | PER-03 |
| US-036 | See the state of the platform *(Administrator dashboard)* | Epic 4 / F4 | P0 | PER-04 |
| US-037 | Have a slow system degrade one widget, not my page | Epic 4 / F4 | P1 | PER-01 |
| US-038 | Be told what is missing rather than shown a partial picture | Epic 4 / F4 | P1 | PER-02 |
| US-039 | Act on anything my dashboard shows me | Epic 4 / F4 | P0 | PER-01 |
| US-040 | See everything assigned to me in one list | Epic 5 / F5 | P0 | PER-01 |
| US-041 | Always know which system owns an item | Epic 5 / F5 | P0 | PER-02 |
| US-042 | Narrow the queue to what I need right now | Epic 5 / F5 | P0 | PER-01 |
| US-043 | Order the queue by what is most urgent | Epic 5 / F5 | P0 | PER-01 |
| US-044 | Find one specific item by name or number | Epic 5 / F5 | P0 | PER-02, PER-03 |
| US-045 | Page through a long queue and know how much there is | Epic 5 / F5 | P0 | PER-01 |
| US-046 | Open the queue already sensibly scoped for my role | Epic 5 / F5 | P1 | PER-01…03 |
| US-047 | Come back to exactly the queue I left | Epic 5 / F5 | P0 | PER-01 |
| US-048 | Keep working when one connected system is down | Epic 5 / F5 | P0 | PER-01, PER-04 |
| US-049 | Get guidance rather than a blank table | Epic 5 / F5 | P0 | PER-03 |
| US-050 | Review the full record for a single work item | Epic 6 / F6 | P0 | PER-01, PER-02 |
| US-051 | See only the actions I can take, and why the others are not | Epic 6 / F6 | P0 | PER-01 |
| US-052 | Complete an action through a form that validates properly | Epic 6 / F6 | P0 | PER-01 |
| US-053 | Be told exactly what changed and in which system | Epic 6 / F6 | P0 | PER-01 |
| US-054 | Know which kind of failure I am looking at | Epic 6 / F6 | P0 | PER-01 |
| US-055 | See what this item is connected to in other systems | Epic 6 / F6 | P0 | PER-02, PER-01 |
| US-056 | Read one history instead of merging four by hand | Epic 6 / F6 | P0 | PER-02, PER-03 |
| US-057 | Complete the action my role exists to perform | Epic 6 / F6 | P0 | PER-02, PER-03 |
| US-058 | See an unavailable system's screen degrade cleanly | Epic 6 / F6 | P0 | PER-01 |
| **US-059** | **Find the eApp case in my queue and open it** | **Epic 7 / F7** | **P0** | PER-01 |
| **US-060** | **Discover the issue raised against one of its answers** | **Epic 7 / F7** | **P0** | PER-01 |
| **US-061** | **Move from the case to the issue without leaving** | **Epic 7 / F7** | **P0** | PER-01 |
| **US-062** | **Read the flagged answer in context** | **Epic 7 / F7** | **P0** | PER-01 |
| **US-063** | **Resolve the issue with a disposition and narrative** | **Epic 7 / F7** | **P0** | PER-01 |
| **US-064** | **Have the hub coordinate the update across both systems** | **Epic 7 / F7** | **P0** | PER-01 |
| **US-065** | **See what each system says about itself afterwards** | **Epic 7 / F7** | **P0** | PER-01 |
| **US-066** | **Be told the truth when only one system updates** *(partial)* | **Epic 7 / F7** | **P0** | PER-01, PER-04 |
| **US-067** | **Verify independently that both systems changed** | **Epic 7 / F7** | **P0** | PER-01, PER-04 |
| **US-068** | **Read the whole cross-system action as one story** | **Epic 7 / F7** | **P0** | PER-02, PER-04 |
| **US-069** | **Complete the flagship workflow keyboard-only** | **Epic 7 / F7** | **P0** | PER-01 |
| US-070 | Add or remove an application without touching hub code | Epic 8 / F8 | P0 | PER-04 |
| US-071 | Turn an application off at runtime | Epic 8 / F8 | P1 | PER-04 |
| US-072 | Have a reduced-capability application degrade its controls | Epic 8 / F8 | P1 | PER-01, PER-04 |
| US-073 | Have one slow application bounded | Epic 8 / F8 | P1 | PER-01, PER-04 |
| US-074 | Prove a new adapter is correct before trusting it | Epic 8 / F8 | P1 | PER-04 |
| US-075 | Be protected from a mis-registered application | Epic 8 / F8 | P1 | PER-04 |
| US-076 | Satisfy myself the five systems are genuinely separate | Epic 9 / F9 | P0 | PER-04 |
| US-077 | Query each system directly to prove what the hub told me | Epic 9 / F9 | P0 | PER-04 |
| US-078 | Find each system behaving like the real thing | Epic 9 / F9 | P0 | PER-01…03 |
| US-079 | Keep using the product when one system is stopped | Epic 9 / F9 | P0 | PER-01 |
| US-080 | See relationships as references, never as joins | Epic 9 / F9 | P0 | PER-04 |
| US-081 | Have every request pass through one enforcement point | Epic 10 / F10 | P0 | PER-04 |
| US-082 | Get the same shape of error from every endpoint | Epic 10 / F10 | P0 | PER-04 |
| US-083 | Have every state change recorded before success | Epic 10 / F10 | P0 | PER-04 |
| US-084 | Read accurate API documentation and exercise it | Epic 10 / F10 | P1 | PER-04 |
| US-085 | Have every endpoint tested including a refusal | Epic 10 / F10 | P1 | PER-04 |
| US-086 | See everything connected to the platform | Epic 11 / F11 | P1 | PER-04 |
| US-087 | Know whether each system is healthy before a user tells me | Epic 11 / F11 | P1 | PER-04 |
| US-088 | Diagnose an integration failure from one place | Epic 11 / F11 | P1 | PER-04 |
| US-089 | See everything about one application in one place | Epic 11 / F11 | P1 | PER-04 |
| US-090 | Test a connection live, in front of a reviewer | Epic 11 / F11 | P1 | PER-04 |
| US-091 | Tell users something without an email blast | Epic 11 / F11 | P1 | PER-04 |
| US-092 | Use a console as accessible as the rest of the product | Epic 11 / F11 | P1 | PER-04 |
| US-093 | Account for my own actions like everyone else | Epic 11 / F11 | P1 | PER-04 |
| US-094 | Register a new application through a guided form | Epic 12 / F12 | P1 | PER-04 |
| US-095 | Be caught before I register something broken | Epic 12 / F12 | P1 | PER-04 |
| US-096 | Test the connection before I commit to it | Epic 12 / F12 | P1 | PER-04 |
| US-097 | Let the application tell me what it can do | Epic 12 / F12 | P1 | PER-04 |
| US-098 | Watch the new application appear everywhere immediately | Epic 12 / F12 | P1 | PER-04, PER-01 |
| US-099 | Have a sixth application ready to register live | Epic 12 / F12 | P1 | PER-04 |
| US-100 | Change or remove a registered application safely | Epic 12 / F12 | P1 | PER-04 |
| US-101 | Have every action recorded before I am told it worked | Epic 13 / F13 | P0 | PER-01 |
| US-102 | Have the record capture who I was when I acted | Epic 13 / F13 | P0 | PER-02 |
| US-103 | Find authentication, denials, and failures in the trail | Epic 13 / F13 | P0 | PER-04 |
| US-104 | Trust that no one has quietly altered the record | Epic 13 / F13 | P0 | PER-04 |
| US-105 | Read and filter the trail to answer a question | Epic 13 / F13 | P0 | PER-04 |
| US-106 | Open one record in full and follow it into its chain | Epic 13 / F13 | P0 | PER-04 |
| US-107 | See my own activity without seeing anyone else's | Epic 13 / F13 | P0 | PER-01, PER-03 |
| US-108 | Take the evidence away with me | Epic 13 / F13 | P1 | PER-04 |
| US-109 | Do my entire job from the keyboard | Epic 14 / F14 | P0 | PER-01 |
| US-110 | Operate the work queue with a screen reader | Epic 14 / F14 | P0 | PER-01, PER-02 |
| US-111 | Always see where my focus is | Epic 14 / F14 | P0 | PER-02 |
| US-112 | Skip past the chrome straight to the content | Epic 14 / F14 | P0 | PER-03 |
| US-113 | Understand exactly what I got wrong in a form | Epic 14 / F14 | P0 | PER-03, PER-01 |
| US-114 | Never have to distinguish a status by colour | Epic 14 / F14 | P0 | PER-02 |
| US-115 | Be told about async changes without losing my place | Epic 14 / F14 | P0 | PER-01 |
| US-116 | Use the product zoomed, small, and without animation | Epic 14 / F14 | P0 | PER-03, PER-02 |
| US-117 | Not be punished by a timer for working at my own pace | Epic 14 / F14 | P0 | PER-03, PER-01 |
| US-118 | Read what the product claims about its accessibility | Epic 14 / F14 | P0 | PER-04 |
| US-119 | Be told when something on my caseload changes | Epic 15 / F15 | P1 | PER-01 |
| US-120 | See at a glance that something is waiting for me | Epic 15 / F15 | P1 | PER-02 |
| US-121 | Mark an alert as read without it disappearing | Epic 15 / F15 | P1 | PER-01 |
| US-122 | Read a notice where I already look | Epic 15 / F15 | P1 | PER-03 |
| US-123 | Never have a notice hide the demo banner | Epic 15 / F15 | P1 | PER-04 |
| US-124 | Not be told all is well when alerts could not be computed | Epic 15 / F15 | P1 | PER-02 |
| US-125 | Have the platform watch every connected system | Epic 16 / F16 | P1 | PER-04 |
| US-126 | Be stopped before starting an action that cannot succeed | Epic 16 / F16 | P1 | PER-01 |
| US-127 | Be told what is missing, where it is missing | Epic 16 / F16 | P1 | PER-01 |
| US-128 | Watch a page fill in rather than sit blank | Epic 16 / F16 | P1 | PER-01 |
| US-129 | Never confuse "nothing to do" with "nothing loaded" | Epic 16 / F16 | P1 | PER-02, PER-03 |
| US-130 | Never see a blank page or a stack trace | Epic 16 / F16 | P1 | PER-01…04 |
| US-131 | Break a system on purpose in front of a reviewer | Epic 16 / F16 | P1 | PER-04 |
| US-132 | Watch the system heal itself | Epic 16 / F16 | P1 | PER-01 |
| US-133 | Find every screen populated, whichever persona I use | Epic 17 / F17 | P0 | PER-01…04 |
| US-134 | Reach every non-happy state without breaking something | Epic 17 / F17 | P0 | PER-01, PER-03 |
| US-135 | Trust that nothing here resembles a real person | Epic 17 / F17 | P0 | PER-04 |
| US-136 | Get the same demonstration every time I run it | Epic 17 / F17 | P0 | PER-04 |
| US-137 | Refuse to start rather than demonstrate on broken data | Epic 17 / F17 | P0 | PER-04 |
| US-138 | Start the whole prototype with one command | Epic 18 / F18 | P0 | PER-04 |
| US-139 | Be told precisely what is wrong when startup fails | Epic 18 / F18 | P0 | PER-04 |
| US-140 | Drive the flagship workflow from a script, unaided | Epic 18 / F18 | P0 | PER-04, PER-01 |
| US-141 | Demonstrate the other four claims from scripts too | Epic 18 / F18 | P0 | PER-04 |
| US-142 | Know the environment is ready before I present | Epic 18 / F18 | P0 | PER-04 |
| US-143 | Take one system down deliberately and put it back | Epic 18 / F18 | P0 | PER-04 |
| US-144 | Recover from the three likeliest demo-day failures | Epic 18 / F18 | P0 | PER-04 |
| US-145 | Know the flagship workflow still works before I demo it | Epic 19 / F19 | P1 | PER-04 |
| US-146 | Have the access-control claims tested, not asserted | Epic 19 / F19 | P1 | PER-04 |
| US-147 | Have every adapter proven to behave the same way | Epic 19 / F19 | P1 | PER-04 |
| US-148 | Have the audit guarantee tested on every endpoint | Epic 19 / F19 | P1 | PER-04 |
| US-149 | Have accessibility checked on every route for every role | Epic 19 / F19 | P1 | PER-04 |
| US-150 | Prove that every button really does work | Epic 19 / F19 | P1 | PER-04 |
| US-151 | Read the test results without reading a CI log | Epic 19 / F19 | P1 | PER-04 |

---

## Summary Table

| Epic | Feature | Story Range | Story Count | P0 | P1 |
|------|---------|-------------|-------------|----|----|
| Epic 0 — Simulated Multi-Method MFA Authentication | F0 | US-001…008 | 8 | 8 | 0 |
| Epic 1 — Unified Session and SSO Across All Spokes | F1 | US-009…014 | 6 | 6 | 0 |
| Epic 2 — Server-Side RBAC/ABAC and Denial Paths | F2 | US-015…025 | 11 | 10 | 1 |
| Epic 3 — Unified Navigation Shell and Global Chrome | F3 | US-026…032 | 7 | 6 | 1 |
| Epic 4 — Role-Specific Personalised Dashboards | F4 | US-033…039 | 7 | 5 | 2 |
| Epic 5 — Unified Work Queue | F5 | US-040…049 | 10 | 9 | 1 |
| Epic 6 — Work-Item Detail and Action Completion | F6 | US-050…058 | 9 | 9 | 0 |
| **Epic 7 — FLAGSHIP Cross-Application Workflow** | **F7** | **US-059…069** | **11** | **11** | **0** |
| Epic 8 — Adapter Framework and Registry | F8 | US-070…075 | 6 | 1 | 5 |
| Epic 9 — Five Simulated Spoke Services | F9 | US-076…080 | 5 | 5 | 0 |
| Epic 10 — Unified Layer API (BFF) | F10 | US-081…085 | 5 | 3 | 2 |
| Epic 11 — Administrator Console | F11 | US-086…093 | 8 | 0 | 8 |
| Epic 12 — Application Registration and Onboarding | F12 | US-094…100 | 7 | 0 | 7 |
| Epic 13 — Immutable Audit Trail and Viewer | F13 | US-101…108 | 8 | 7 | 1 |
| Epic 14 — USWDS v3 Accessible Interface | F14 | US-109…118 | 10 | 10 | 0 |
| Epic 15 — Notifications, Alerts, Announcements | F15 | US-119…124 | 6 | 0 | 6 |
| Epic 16 — Health, Resilience, Degraded-System UX | F16 | US-125…132 | 8 | 0 | 8 |
| Epic 17 — Synthetic Seed Data Corpus | F17 | US-133…137 | 5 | 5 | 0 |
| Epic 18 — Demo Operability | F18 | US-138…144 | 7 | 7 | 0 |
| Epic 19 — Automated Test and A11y Verification | F19 | US-145…151 | 7 | 0 | 7 |
| **Total** | **F0–F19** | **US-001…151** | **151** | **102** | **49** |

---

## Feature Coverage Check

Every PRD feature F0 through F19 is covered by at least one story, and every story names the feature it satisfies.

| Feature | PRD Priority | Epic | Stories |
|---|---|---|---|
| F0 Simulated Multi-Method MFA Authentication | P0 | Epic 0 | 8 |
| F1 Unified Session and SSO | P0 | Epic 1 | 6 |
| F2 RBAC/ABAC Enforced Server-Side | P0 | Epic 2 | 11 |
| F3 Unified Navigation Shell | P0 | Epic 3 | 7 |
| F4 Role-Specific Dashboard | P0 | Epic 4 | 7 |
| F5 Unified Work Queue | P0 | Epic 5 | 10 |
| F6 Work-Item Detail and Action Completion | P0 | Epic 6 | 9 |
| **F7 Flagship Cross-Application Workflow** | **P0 — highest** | **Epic 7** | **11** |
| F8 Adapter Framework and Registry | P0 | Epic 8 | 6 |
| F9 Five Simulated Spoke Services | P0 | Epic 9 | 5 |
| F10 Unified Layer API (BFF) | P0 | Epic 10 | 5 |
| F11 Administrator Console | P1 | Epic 11 | 8 |
| F12 Application Registration and Onboarding | P1 | Epic 12 | 7 |
| F13 Immutable Audit Trail and Viewer | P0 | Epic 13 | 8 |
| F14 USWDS v3 Accessible Interface | P0 | Epic 14 | 10 |
| F15 Notifications, Alerts, Announcements | P1 | Epic 15 | 6 |
| F16 Health, Resilience, Degraded-System UX | P1 | Epic 16 | 8 |
| F17 Synthetic Seed Data Corpus | P0 | Epic 17 | 5 |
| F18 Demo Operability | P0 | Epic 18 | 7 |
| F19 Automated Test and A11y Verification | P1 | Epic 19 | 7 |

> Several stories carry more than one feature reference where a behaviour is genuinely jointly owned — for example US-048 (degraded work queue) satisfies both F5 and F16, and US-069 (keyboard-only flagship) satisfies both F7 and F14. The epic column above assigns each story to exactly one owning feature so the counts do not double-count.

---
## Priority Definitions

Priorities mirror the PRD's definitions exactly, so a story's priority and its feature's priority can never disagree.

| Priority | Definition | Meaning for this prototype |
|----------|------------|----------------------------|
| **P0** | Critical — required for the demonstration to succeed | If this story fails, the demonstration fails. Build these first and keep them working. |
| **P1** | High — required for a complete, credible prototype | The demonstration survives without it, but the prototype reads as unfinished to an evaluator. |
| **P2** | Medium — valuable, cut first under pressure | **Not used.** The PRD deliberately moved everything non-essential to Out of Scope rather than deprioritising it. |
| **P3** | Low — future consideration | **Not used**, for the same reason. |

### Priority distribution

| Priority | Stories | Share |
|---|---|---|
| **P0** | 102 | 68% |
| **P1** | 49 | 32% |
| P2 | 0 | — |
| P3 | 0 | — |
| **Total** | **151** | **100%** |

---

## Build Sequencing Guidance

The PRD's R-03 risk — *"scope breadth starves the flagship"* — applies directly to this story set. One hundred and fifty-one stories will compete for finite build time, and the demonstration centrepiece is the thing that must not be under-polished. The sequencing below is the discipline that keeps that from happening.

**Tier 1 — the vertical slice that proves the thesis.** Build these until the flagship workflow runs end to end, reliably, three times in a row with a reset between each. Nothing else starts until it does.

> US-001 · US-002 · US-009 · US-016 · US-026 · US-027 · US-040 · US-050 · US-059 … US-069 · US-101 · US-133 · US-136 · US-138 · US-140

**Tier 2 — the claims a reviewer will probe next.** The zero-trust negatives, the four distinct dashboards, and the accessibility gate. These are the stories that turn "it works" into "it is credible."

> US-015 · US-017 · US-018 … US-025 · US-033 … US-036 · US-039 · US-041 … US-049 · US-051 … US-058 · US-102 … US-107 · US-109 … US-118 · US-134 · US-135 · US-137 · US-139 · US-141 … US-144

**Tier 3 — the completeness tier.** Operability, extensibility, notifications, resilience polish, and the verification suite. Every one of these is P1; none of them is optional if the prototype is to read as complete, but each yields to Tier 1 if time compresses.

> US-030 · US-037 · US-038 · US-046 · US-070 … US-100 · US-108 · US-119 … US-132 · US-145 … US-151

---

## Traceability

| Charter requirement (`.planning/PROJECT.md`) | PRD feature | Stories |
|---|---|---|
| Simulated MFA login (CAC/PIV, ECA, generic) with SSO across spokes | F0, F1 | US-001 … US-014 |
| Role-based and attribute-aware access control, server-side | F2, F10 | US-015 … US-025, US-081, US-085 |
| Role-specific personalised dashboard | F4, F15 | US-033 … US-039, US-119 … US-124 |
| Unified work queue with filter/sort/search and attribution | F5 | US-040 … US-049 |
| Work-item detail: review, act, view history | F6 | US-050 … US-058 |
| **Flagship cross-application workflow** | **F7** | **US-059 … US-069** |
| Administrator console: apps, health, integration issues | F11, F16 | US-086 … US-093, US-125 … US-132 |
| Application registration flow (onboarding pattern) | F12, F8 | US-094 … US-100, US-070 … US-075 |
| Immutable audit trail, viewable and filterable | F13 | US-101 … US-108 |
| Five spokes as separate services behind common adapters | F9, F8 | US-076 … US-080 |
| USWDS v3 accessible UI (508 / WCAG 2.1 AA) | F14, F3 | US-109 … US-118, US-026 … US-032 |
| Realistic synthetic seed data | F17 | US-133 … US-137 |
| Error / loading / empty states + degraded-system warning | F16 | US-127 … US-130, US-048, US-049, US-054 |
| Demo operability: one command + scripted demo path | F18 | US-138 … US-144 |
| Automated tests (flagship, RBAC, adapters) | F19 | US-145 … US-151 |

### Success-metric coverage

| Metric | Target | Demonstrated by |
|---|---|---|
| SM-01 Flagship workflow completion | End to end in one session | US-059 … US-067 |
| SM-02 Re-authentications during flagship | Exactly zero | US-009, US-061, US-145 |
| SM-03 Dual-system change verified independently | Both spoke APIs agree | US-067, US-077 |
| SM-04 Context loss during workflow | Zero | US-061, US-029 |
| SM-05 Navigation integrity | 100% of items resolve | US-032, US-015 |
| SM-06 Non-functional controls | Zero | US-032, US-150 |
| SM-07 Accessibility violations | Zero serious or critical | US-118, US-149 |
| SM-08 Keyboard-only task completion | Flagship completable | US-069, US-109 |
| SM-09 Colour contrast conformance | 100% | US-114 |
| SM-10 Demo banner presence | 100% of routes | US-027, US-123, US-150 |
| SM-11 Sixth-application registration | Under 5 minutes, live | US-094, US-099 |
| SM-12 Post-registration visibility | Immediate, everywhere | US-098 |
| SM-13 Spoke isolation | Zero cross-namespace access | US-076, US-080 |
| SM-14 Work-queue source coverage | ≥4 of 5 spokes | US-040, US-033 |
| SM-15 Adapter outage behaviour | Visible, specific warning | US-048, US-127, US-131 |
| SM-16 Partial-result rendering | Remaining sources actionable | US-048, US-126 |
| SM-17 Automatic recovery | No reload, no re-auth | US-132, US-038 |
| SM-18 Server-side authorisation coverage | 100% denied | US-018 … US-023, US-146 |
| SM-19 Audit coverage | Exactly one record per mutation | US-101, US-083, US-148 |
| SM-20 Flagship audit chain | One correlated chain | US-068, US-014, US-106 |
| SM-21 Time to running application | Under 10 minutes | US-138, US-139 |
| SM-22 Demo repeatability | 3 identical runs | US-136, US-140 |

---

## Open Items Carried Forward

| # | Item | Effect on these stories |
|---|---|---|
| Q-01 | DCSA Ecosystem Style Guide (Attachment 1) not supplied | US-109 … US-118 assume USWDS v3 with token-based theming. Adopting the real guide is a token and asset swap; acceptance criteria referencing components remain valid. US-118 requires the assumption to be disclosed on the accessibility statement. |
| Q-04 | Exact eApp ↔ PVQ relationship semantics | US-060, US-063, and US-064 encode the modelled semantics: a PVQ issue references a specific eApp case and answer, and resolving it clears that case's outstanding-issue state. Plausible and sufficient for demonstration; would be validated in a real discovery phase. |
| Q-05 | Attribute taxonomy for ABAC | US-021 and US-022 use the synthetic taxonomy of organisation, clearance tier, assigned region, and case assignment. The mechanism is what is demonstrated; the real taxonomy is a discovery output. |
| Q-06 | Identity of the demonstration sixth application | US-099 names the Continuous Vetting Service. Any plausible synthetic service works; the onboarding pattern is the point. |
| — | Seeded identity names differ between the FRD seed corpus and the persona document | Stories reference **roles** rather than seeded individual names, so the two documents cannot drift. Named record identifiers (`EAPP:CASE-A-1042`, `PVQ:ISS-2207`, `CVS`) remain normative because the demonstration script depends on them. |

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-09-14*
*DEMO — SYNTHETIC DATA ONLY. No real DCSA data, no real PII, no real system connections.*
