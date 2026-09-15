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
