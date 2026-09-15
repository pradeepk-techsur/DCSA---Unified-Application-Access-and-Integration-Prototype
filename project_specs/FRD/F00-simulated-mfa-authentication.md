## F0 — Simulated Multi-Method MFA Authentication

**Traces to:** PRD F0 (P0). **Screens:** SCR-01 Login, SCR-02 CAC/PIV certificate selection, SCR-03 ECA identity selection, SCR-04 Generic MFA credential entry, SCR-05 Generic MFA one-time code, SCR-06 Session timeout warning, SCR-07 Signed-out confirmation. **API:** `Y1a §Auth`.

**Description:** A simulated identity provider offering three authentication paths — CAC/PIV, ECA, and generic MFA — each backed by its own synthetic identity set, demonstrating that the hub supports multiple identity and access management service providers rather than one provider with three skins. No certificate is parsed and no credential is validated against anything real; the user selects a synthetic identity and the hub issues a session. Every screen in the flow states plainly that authentication is simulated.

**Terminology:**
- **Auth method** — one of the three paths (`CAC_PIV`, `ECA`, `GENERIC_MFA`), each with its own selection UI and its own synthetic identity pool.
- **Auth transaction** — a short-lived server-side record tracking a login in progress between initiation and completion (`Y0a.auth_transactions`).
- **Demo code** — the deterministic six-digit one-time code used by the generic MFA path.
- **Synthetic identity** — a seeded persona row (`Y0a.users`) bound to roles and attributes.

---

### FR-F00-01 — Authentication method selection (SCR-01)

**Description:** The unauthenticated landing screen presents the three authentication methods as three clearly differentiated, equally weighted choices, and states that authentication is simulated.

**Inputs:** none (unauthenticated GET). Optional query param `returnTo` (string, relative path) preserved for post-login redirect.

**Processing / business rules:**
1. Hub calls `GET /api/auth/methods`, which reads enabled methods from configuration (not hard-coded in the UI).
2. Each method returns `{ methodId, label, description, iconToken, enabled, simulationNotice }`.
3. The screen renders one USWDS card per method with a heading, a one-sentence description of what the method represents in the real world, and a primary action button.
4. A USWDS site-alert of type "info" renders above the method list with the exact copy: **"Simulated sign-in. This prototype does not validate certificates, passwords, or one-time codes. Choose a method and a demo identity to continue."**
5. The non-dismissible demo banner (`FR-F03-03`) renders on this screen, as it does on every screen including error pages.
6. `returnTo` MUST be validated as a same-origin relative path beginning with `/`; anything else is discarded silently and the user lands on the dashboard.

**Outputs:** SCR-01 rendered with three method cards, the simulation notice, and the demo banner. No session is created.

**Validation rules:**
- `returnTo` matches `^/[A-Za-z0-9/_\-?=&.]*$` and does not begin with `//`. Non-conforming values are dropped, not echoed.
- A method with `enabled: false` renders as a disabled card with `disabledReason` text; it is never hidden silently.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Method configuration unreadable | 503 | `AUTH_CONFIG_UNAVAILABLE` | "Sign-in is temporarily unavailable. Please try again in a moment." |
| Already authenticated | 302 | — | Redirect to dashboard; no error shown. |

**Acceptance criteria:**
- AC-1: The login screen lists exactly three methods, each with distinct label, description, and destination.
- AC-2: The simulation notice text appears verbatim and is programmatically associated with the method group via `aria-describedby`.
- AC-3: The demo banner is present and has no close control (asserted by `FR-F19-08`).
- AC-4: Tab order reaches all three method actions; each is operable with Enter and Space.

---

### FR-F00-02 — CAC/PIV simulated certificate selection (SCR-02)

**Description:** The CAC/PIV path presents a simulated certificate-selection dialog listing synthetic identities with mock certificate subject details, mirroring the browser certificate picker a real PIV flow would produce.

**Inputs:** `POST /api/auth/initiate` with `{ methodId: "CAC_PIV" }`.

**Processing / business rules:**
1. Hub creates an auth transaction: `{ transactionId (ULID), methodId, state: "AWAITING_SELECTION", createdAt, expiresAt = createdAt + 10 minutes }`.
2. Hub returns the synthetic certificate list for this method: for each identity, `{ identityId, subjectCommonName, subjectOrganization, issuer, serialNumber, validFrom, validTo, roles[] }`.
3. Values are fabricated by construction: issuer is `DEMO-DOD-CA-59 (synthetic)`, serial numbers begin `00:DEMO:`, and every entry is suffixed "(synthetic certificate)".
4. The list renders as a USWDS table inside a modal dialog with `role="dialog"`, `aria-modal="true"`, focus trapped, focus restored to the invoking button on dismissal.
5. Selecting a row calls `POST /api/auth/complete` with `{ transactionId, identityId }`.
6. Hub validates the transaction is `AWAITING_SELECTION`, unexpired, and that `identityId` belongs to the CAC/PIV pool. It then issues a session (`FR-F01-01`).
7. Hub writes one `AUTH_SUCCESS` audit record (`FR-F13-02`) including `identityMethod`.

**Outputs:** On success, a session cookie plus `{ principal, entitlements, returnTo }`; browser navigates to the role dashboard. On failure, SCR-02 remains open with an inline error summary.

**Validation rules:**
- `transactionId` exists, is unexpired, and is in state `AWAITING_SELECTION`.
- `identityId` exists AND its `allowedMethods` includes `CAC_PIV`. An identity registered only for ECA MUST NOT be selectable here — this is what proves the two pools are genuinely distinct.
- A transaction is single-use; a second `complete` on the same transaction fails.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Transaction expired | 400 | `AUTH_TX_EXPIRED` | "Your sign-in attempt timed out. Choose a sign-in method to start again." |
| Transaction already used | 400 | `AUTH_TX_CONSUMED` | "That sign-in attempt has already been completed. Choose a sign-in method to start again." |
| Identity not in this method's pool | 401 | `AUTH_FAILED` | "We couldn't sign you in with the selected identity. Choose a different demo identity or sign-in method." |
| Identity disabled | 401 | `AUTH_FAILED` | Same copy as above — the response MUST NOT distinguish "disabled" from "unknown." |

**Acceptance criteria:**
- AC-1: At least one synthetic identity per role (Investigator, Adjudicator, Applicant, Administrator) is selectable via CAC/PIV and produces a working session.
- AC-2: Every listed certificate displays the "(synthetic certificate)" marker and a demo issuer.
- AC-3: Attempting to complete with an ECA-only identityId returns `AUTH_FAILED` and writes an `AUTH_FAILURE` audit record.
- AC-4: The dialog traps focus, closes on Escape, and restores focus to the "Sign in with CAC/PIV" button.

---

### FR-F00-03 — ECA simulated external CA path (SCR-03)

**Description:** The ECA path demonstrates a second, independent identity provider: a different identity pool, a different issuer namespace, and its own selection screen — not a relabelled CAC/PIV picker.

**Inputs:** `POST /api/auth/initiate` with `{ methodId: "ECA" }`, then `POST /api/auth/complete` with `{ transactionId, identityId }`.

**Processing / business rules:**
1. Identical transaction lifecycle to `FR-F00-02`.
2. The ECA identity pool is disjoint in issuer and partially disjoint in membership from the CAC/PIV pool: at minimum, one identity is ECA-only and one is CAC/PIV-only, seeded per `FR-F17-02`.
3. The screen renders as a full page (not a modal) with a USWDS process-list showing the two simulated steps: "External certificate authority" → "Confirm identity," reinforcing that this is a different IdP flow.
4. Issuer is `DEMO-ECA-VENDOR-07 (synthetic)`.
5. On success, `identityMethod` on the principal is `ECA` and the session header (`FR-F03-05`) displays "Signed in via ECA (simulated)."

**Outputs:** As `FR-F00-02`, with `identityMethod: "ECA"`.

**Validation rules:** As `FR-F00-02`, with pool membership checked against `ECA`.

**Error handling:** Same table as `FR-F00-02`.

**Acceptance criteria:**
- AC-1: The ECA identity list differs from the CAC/PIV list by at least one identity in each direction.
- AC-2: The audit record for an ECA sign-in records `identityMethod: "ECA"`, distinguishable in the audit viewer filter.
- AC-3: The header of an ECA session names ECA as the method.

---

### FR-F00-04 — Generic MFA path: identity entry and one-time code (SCR-04, SCR-05)

**Description:** A two-step username-plus-one-time-code path, demonstrating a non-certificate IdP. The demo code is deterministic and visibly displayed so a reviewer is never blocked.

**Inputs:**
- Step 1: `{ methodId: "GENERIC_MFA", username (string, required, 3–128 chars) }`
- Step 2: `{ transactionId (string, required), otp (string, required, exactly 6 digits) }`

**Processing / business rules:**
1. Step 1 creates an auth transaction in state `AWAITING_OTP` regardless of whether the username matches a seeded identity. Response timing is normalized to a fixed floor of 250 ms so username existence cannot be inferred by timing.
2. If the username matches an identity whose `allowedMethods` includes `GENERIC_MFA`, the hub stores the bound `identityId` on the transaction and computes the demo code as a deterministic function of `transactionId` and the seed. If it does not match, the transaction is created with `identityId: null` and a code that can never validate.
3. SCR-05 displays the code in a USWDS summary-box with copy: **"Demo one-time code: 123456. In a real deployment this code would be delivered to your registered device."** The code is shown only when the transaction resolved to a real identity; otherwise a synthetic-looking code is displayed and submission still fails with the generic failure message.
4. Step 2 compares the submitted `otp` against the transaction's code in constant time. On match, session issued.
5. Maximum 5 OTP attempts per transaction; the 6th fails the transaction into state `LOCKED`.
6. Every failed attempt writes an `AUTH_FAILURE` audit record with the attempted username, the method, and the reason class — never the submitted code.

**Outputs:** Step 1 → SCR-05 with `transactionId` and the displayed demo code. Step 2 → session and dashboard redirect, or inline error on SCR-05.

**Validation rules:**
- `username`: required; trimmed; 3–128 characters; inline error "Enter your demo username." when empty.
- `otp`: required; exactly 6 characters, digits only; inline error "Enter the 6-digit code shown above." when malformed. Format validation runs client-side and server-side; the server is authoritative.
- Error summary at top of form links to the offending field per `FR-F14-03`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Unknown username or wrong code | 401 | `AUTH_FAILED` | "We couldn't sign you in. Check the demo username and code, then try again." |
| Attempts exhausted | 429 | `AUTH_ATTEMPTS_EXCEEDED` | "Too many attempts. Choose a sign-in method to start again." |
| Transaction expired | 400 | `AUTH_TX_EXPIRED` | "Your sign-in attempt timed out. Choose a sign-in method to start again." |
| Malformed code | 400 | `VALIDATION_FAILED` | Field-level: "Enter the 6-digit code shown above." |

**Acceptance criteria:**
- AC-1: A seeded generic-MFA identity signs in successfully using the displayed code.
- AC-2: An unknown username produces `AUTH_FAILED` with identical copy, status, and response-time profile to a known username with a wrong code — verified by `FR-F19-02`.
- AC-3: No response body or log line ever contains the submitted code.
- AC-4: Six consecutive wrong codes lock the transaction and return `AUTH_ATTEMPTS_EXCEEDED`.

---

### FR-F00-05 — Synthetic identity to role and attribute binding

**Description:** Each synthetic identity is bound to one or more roles plus the attribute set that drives ABAC (`FR-F02-03`).

**Inputs:** Seeded rows in `Y0a.users`, `Y0a.user_roles`, `Y0a.user_attributes`.

**Processing / business rules:**
1. On session issuance the hub materializes the full principal (§3.1) from the identity's role and attribute rows. Roles and attributes are never read from a request.
2. If an identity holds more than one role, `activeRole` defaults to the highest-privilege role by the order `ADMINISTRATOR > ADJUDICATOR > INVESTIGATOR > APPLICANT`, and the user may switch active role via the header control (`FR-F03-05`).
3. Switching active role re-evaluates entitlements server-side and writes a `ROLE_CONTEXT_SWITCHED` audit record. It does not create a new session and does not require re-authentication.
4. `APPLICANT` identities MUST have a non-null `subjectRef`; mission-role identities MUST have a null `subjectRef`. A multi-role identity holding `APPLICANT` plus a mission role is disallowed by seed validation, because it would make data-layer ownership filtering ambiguous.

**Outputs:** A fully populated `Principal` on the session; `GET /api/session` returns it minus internal fields.

**Validation rules (seed-time, enforced by `FR-F17-10`):**
- Every identity has ≥1 role, a non-empty `organization`, a valid `clearanceTier`, and a valid `assignedRegion`.
- `caseAssignments` reference case identifiers that exist in the seeded spoke data.
- At least one identity holds two mission roles (Investigator + Adjudicator) to exercise role switching.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Identity has no roles | 403 | `IDENTITY_NOT_PROVISIONED` | "This demo identity isn't set up with a role yet. Choose a different identity." |
| Requested activeRole not held | 403 | `ROLE_NOT_HELD` | "You don't have that role. Your available roles are shown in the account menu." |

**Acceptance criteria:**
- AC-1: Signing in as each of the four personas yields a principal with the seeded roles and all four attributes populated.
- AC-2: The dual-role identity can switch active role and observe different navigation without re-authenticating; exactly one `AUTH_SUCCESS` and one `ROLE_CONTEXT_SWITCHED` record exist.
- AC-3: No API response ever accepts `roles` or `activeRole` from the request body for authorization purposes.

---

### FR-F00-06 — Session timeout, warning, and re-authentication (SCR-06)

**Description:** Sessions expire on inactivity with an accessible advance warning and a path back in that does not lose the user's place.

**Inputs:** Client inactivity timer; `POST /api/session/extend`.

**Processing / business rules:**
1. Session idle timeout is 30 minutes; absolute maximum lifetime is 8 hours. Both are configuration values.
2. At 2 minutes remaining, the UI opens a USWDS modal (SCR-06) with a live countdown and two actions: "Stay signed in" and "Sign out now."
3. The countdown is announced to assistive technology via an `aria-live="polite"` region at open, at 60 seconds, and at 15 seconds — not on every tick (`FR-F14-07`).
4. "Stay signed in" calls `POST /api/session/extend`, which resets idle expiry server-side and returns the new `expiresAt`. It does not extend the absolute maximum.
5. On expiry, the client is redirected to SCR-01 with `returnTo` set to the current path and a site-alert: **"You were signed out because of inactivity. Sign in again to pick up where you left off."**
6. After re-authentication as the same identity, the user returns to `returnTo` with the work queue's saved view state restored (`FR-F05-09`).
7. Expiry writes a `SESSION_EXPIRED` audit record.

**Outputs:** Modal, extended session, or redirect to login with context preserved.

**Validation rules:**
- `extend` requires a currently valid (not yet expired) session; an expired session cannot be extended.
- `returnTo` revalidated on use per `FR-F00-01`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Extend after expiry | 401 | `SESSION_EXPIRED` | "You were signed out because of inactivity. Sign in again to pick up where you left off." |
| Absolute lifetime reached | 401 | `SESSION_MAX_LIFETIME` | "Your session reached its time limit. Sign in again to continue." |

**Acceptance criteria:**
- AC-1: The warning modal appears at 2 minutes remaining, traps focus, and is fully keyboard-operable.
- AC-2: "Stay signed in" extends the session without a page reload and without losing form input.
- AC-3: Post-expiry re-authentication returns the user to the page they were on.

---

### FR-F00-07 — Logout and full context termination (SCR-07)

**Description:** Sign-out terminates the hub session and every downstream spoke context established under it.

**Inputs:** `POST /api/auth/logout` (authenticated).

**Processing / business rules:**
1. Hub marks the session `TERMINATED`, clears the session cookie with an immediate expiry, and invalidates every per-spoke context handle held for that session (`FR-F01-04`).
2. Hub calls each adapter's `revokeContext(sessionId)` where the registry declares support; failures are logged as integration issues (`FR-F16-09`) but never block logout.
3. Hub writes one `LOGOUT` audit record.
4. User lands on SCR-07 with copy: **"You're signed out. Your session and all connected application access have ended."** and a "Sign in again" action.
5. Pressing browser Back after logout MUST NOT render cached authenticated content; authenticated responses set `Cache-Control: no-store`.

**Outputs:** Cleared session, SCR-07.

**Validation rules:** Logout is idempotent; calling it without a session returns 204 and renders SCR-07.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Spoke revocation failed | 200 | — | No user-facing error. Logout succeeds; an integration issue is recorded. |

**Acceptance criteria:**
- AC-1: After logout, every authenticated API call with the old cookie returns 401 `SESSION_INVALID`.
- AC-2: Back-navigation after logout shows SCR-01 or SCR-07, never a cached dashboard.
- AC-3: Exactly one `LOGOUT` audit record per sign-out.

---

### FR-F00-08 — Simulation labeling (non-negotiable)

**Description:** Nothing in the authentication experience may imply real credential validation.

**Processing / business rules:**
1. SCR-01 through SCR-05 each carry a visible simulation notice (`FR-F00-01` step 4 copy, or method-specific equivalent).
2. Every synthetic certificate, issuer, and serial number carries a "(synthetic)" marker.
3. The words "verified," "validated," "authenticated against," and "trusted certificate" MUST NOT appear in authentication UI copy. Permitted verbs: "selected," "simulated," "demo."
4. The global demo banner is present on all authentication screens including error and timeout screens.

**Acceptance criteria:**
- AC-1: Automated copy scan (`FR-F19-08`) finds zero prohibited terms on authentication routes.
- AC-2: The demo banner and the simulation notice both appear on every authentication screen, verified per-route.

---
