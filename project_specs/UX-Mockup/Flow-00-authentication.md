## User Flows

Each flow maps a journey from `JOURNEYS-DCSA-UAL.md` onto concrete screens and states. Entry, decision points, branches, and exits are all named. Failure paths are first-class — a flow that only documents the happy path is not a design.

---

### Flow 0: Authentication — three methods, one session

**Trigger:** Unauthenticated user reaches any route; or a deep link (`/work/PVQ:ISS-2207`) while signed out; or session expiry redirect.
**User Stories:** US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-011, US-012
**Features:** F0 (simulated MFA), F1 (unified session/SSO), F3 (shell), F13 (audit)
**Journeys:** JRN-01.01 stage 1, JRN-01.02 stage 1, JRN-03.01 stage 1

```
[Any route, unauthenticated]
   │  deep link preserved as ?returnTo=/work/PVQ:ISS-2207
   ▼
[SCR-01 Login — method selection]
   │  usa-site-alert--info: "Simulated sign-in. This prototype does not
   │  validate certificates, passwords, or one-time codes."
   │
   ├── "Sign in with CAC/PIV" ──▶ [SCR-02 Certificate picker — usa-modal]
   │                                  │
   │                                  ├── Select synthetic certificate row
   │                                  │     │
   │                                  │     ├── Identity in CAC/PIV pool ──▶ ✓ SESSION
   │                                  │     │
   │                                  │     └── Identity ECA-only ──▶ [AUTH_FAILED]
   │                                  │           "We couldn't sign you in with the
   │                                  │            selected identity."
   │                                  │           → stays on SCR-02, error summary
   │                                  │           → AUTH_FAILURE audit record
   │                                  │
   │                                  └── Escape / Cancel ──▶ back to SCR-01
   │                                        focus restored to invoking button
   │
   ├── "Sign in with ECA certificate" ──▶ [SCR-03 ECA identity selection — full page]
   │                                  │   usa-process-list: "External certificate
   │                                  │   authority" → "Confirm identity"
   │                                  │   issuer: DEMO-ECA-VENDOR-07 (synthetic)
   │                                  │     │
   │                                  │     ├── Valid ECA identity ──▶ ✓ SESSION
   │                                  │     └── Not in ECA pool ──▶ [AUTH_FAILED]
   │
   └── "Sign in with username and code" ──▶ [SCR-04 Username]
                                      │       │
                                      │       ▼ "Continue"  (250ms timing floor)
                                      │  [SCR-05 One-time code]
                                      │   usa-summary-box:
                                      │   "Demo one-time code: 123456."
                                      │       │
                                      │       ├── Code matches ──▶ ✓ SESSION
                                      │       │
                                      │       ├── Wrong code ──▶ [AUTH_FAILED]
                                      │       │     "We couldn't sign you in. Check the
                                      │       │      demo username and code, then try again."
                                      │       │     → identical copy, status, and response
                                      │       │       time to an unknown username
                                      │       │
                                      │       └── 6th wrong attempt ──▶ [LOCKED]
                                      │             "Too many attempts. Choose a sign-in
                                      │              method to start again." → SCR-01
                                      ▼
                            ✓ SESSION ESTABLISHED
                            • ONE AUTH_SUCCESS audit record — the only one
                              for the whole session (SM-02)
                            • Principal materialised server-side: roles,
                              attributes, correlationId
                                      │
                                      ├── returnTo present & same-origin ──▶ that route
                                      │      (flagship deep link lands directly on the item —
                                      │       ONE authentication, not two)
                                      │
                                      └── otherwise ──▶ [/dashboard]
                                                          │
                          ┌───────────────────────────────┼───────────────────────────────┐
                          ▼               ▼               ▼                               ▼
                    [SCR-09 Inv]   [SCR-10 Adj]    [SCR-11 Applicant]          [SCR-12 Admin]
                        by principal.activeRole — four visibly different compositions
```

#### Steps

| # | Step | Screen / component | System response |
|---|---|---|---|
| 1 | User lands unauthenticated | SCR-01, three `usa-card` method tiles, equally weighted | `GET /api/auth/methods` reads enabled methods from **configuration**, not hard-coded in the UI |
| 2 | User reads the simulation notice | `usa-site-alert--info`, associated to the method group via `aria-describedby` | Copy is verbatim-normative and scanned in CI |
| 3 | User picks a method | `usa-button` inside the card | `POST /api/auth/initiate` creates an auth transaction, 10-min expiry, single-use |
| 4a | CAC/PIV: certificate picker | `usa-modal` + `usa-table` of synthetic certs | Every row shows `DEMO-DOD-CA-59 (synthetic)`, serial `00:DEMO:…`, "(synthetic certificate)" |
| 4b | ECA: identity selection | Full page + `usa-process-list` — **deliberately not a relabelled CAC picker** | Disjoint identity pool proves two IdPs, not one with a skin (US-003) |
| 4c | Generic MFA: username → code | `usa-input` → `usa-summary-box` with the visible demo code | Deterministic code; reviewer is never blocked |
| 5 | Selection completes | — | `POST /api/auth/complete` → session cookie + `AUTH_SUCCESS` audit |
| 6 | Land | Role dashboard, or `returnTo` deep link | Header now shows identity, role badge, method label, session timer |

#### Session lifecycle branches

```
[Authenticated, any screen]
   │
   ├── 28 minutes idle ──▶ [SCR-06 Session timeout warning — usa-modal]
   │                          live countdown; announced at open, 60s, 15s
   │                          (NOT every tick)
   │                          │
   │                          ├── "Stay signed in" ──▶ POST /api/session/extend
   │                          │     ✓ no page reload
   │                          │     ✓ ENTERED FORM DATA PRESERVED  ← critical:
   │                          │       a half-written resolution narrative survives
   │                          │
   │                          └── "Sign out now" / expiry ──▶ SCR-01 with
   │                                ?returnTo=<current path>
   │                                usa-site-alert: "You were signed out because
   │                                of inactivity. Sign in again to pick up where
   │                                you left off."
   │                                → re-auth restores the page AND the queue's
   │                                  saved filters/sort/page
   │
   ├── Header account menu ▸ "Switch role" (only when >1 role held)
   │        POST /api/session/active-role → entitlements refetched → nav re-renders
   │        announced politely: "Role changed to Adjudicator. Your menu has been updated."
   │        ✓ NO re-authentication.  One ROLE_CONTEXT_SWITCHED audit record.
   │
   └── Header account menu ▸ "Sign out" ──▶ [SCR-07 Signed out]
            "You're signed out. Your session and all connected application
             access have ended."   + [Sign in again]
            • every per-spoke context handle invalidated
            • Back button MUST NOT render cached authenticated content
              (Cache-Control: no-store)
```

#### Failure and alternate paths

| Condition | What the user sees | Recovery |
|---|---|---|
| Unknown username | `AUTH_FAILED` — **identical copy, status, and response-time profile** to a known username with a wrong code | Retry; existence is not inferable (US-005) |
| Identity registered for ECA only, selected in CAC/PIV picker | `AUTH_FAILED`, generic copy; `AUTH_FAILURE` audited | Choose a different identity or method |
| Identity disabled | **Same copy as unknown** — response must not distinguish "disabled" from "unknown" | Choose a different identity |
| Auth transaction expired (>10 min) | "Your sign-in attempt timed out. Choose a sign-in method to start again." | Back to SCR-01 |
| Transaction replayed | "That sign-in attempt has already been completed." | Back to SCR-01 |
| 6 consecutive wrong codes | `AUTH_ATTEMPTS_EXCEEDED` — transaction `LOCKED` | Start again from SCR-01 |
| Identity has no roles | "This demo identity isn't set up with a role yet. Choose a different identity." | Choose another |
| Method config unreadable | "Sign-in is temporarily unavailable. Please try again in a moment." | Retry |
| Already authenticated, hits `/login` | Silent 302 to dashboard, no error | — |
| `returnTo` is off-origin or starts `//` | Value **dropped silently, never echoed**; user lands on dashboard | — |

#### Exit criteria

- All three methods produce a working session for at least one synthetic identity **per role** (F0 acceptance signal).
- Exactly **one** `AUTH_SUCCESS` audit event per session, asserted across a five-spoke traversal (SM-02 / US-009).
- A deep link resolves after **one** authentication, landing on the requested item (US-011).
- **Nothing** in the UI implies real credential validation. The words "verified," "validated," "authenticated against," and "trusted certificate" appear nowhere on authentication routes — scanned in CI (FR-F00-08 / US-008).
- The demo banner is present on SCR-01…07 including error states.

#### Accessibility notes

- **Heading hierarchy:** one `<h1>` per screen — "Sign in to the DCSA Unified Layer" (SCR-01), "Choose a certificate" (SCR-02), "Enter your demo username" (SCR-04), "Enter your one-time code" (SCR-05). `<h2>` per method card.
- **Landmarks:** unauthenticated routes render banner + `<main>` + `<footer role="contentinfo">` and **no primary nav** — correct, because there is nothing yet to navigate.
- **Focus order:** skip link → demo banner → gov banner → `<main>` → three method buttons in visual order. Tab reaches all three; each operable with Enter **and** Space.
- **Modal (SCR-02):** focus trapped while open, Escape closes, focus **restored to the "Sign in with CAC/PIV" button**.
- **Certificate table:** real `<table>` with `<caption>` "Synthetic certificates available for demonstration", `<th scope="col">`, `scope="row"` on the common-name cell.
- **Form association:** `usa-label` `for`/`id` on username and OTP; hint text via `aria-describedby`; the simulation notice associated to the method group via `aria-describedby`.
- **Error summary:** `role="alert"`, focus moved to it, in-page links to the offending field, `aria-invalid="true"` on the field, document title prefixed "Error: ".
- **Countdown (SCR-06):** announced at open, 60s, and 15s only — a per-second live region is unusable.
- **Colour independence:** method cards differentiate by heading text and icon shape, never by fill colour.
- **Target size:** method cards ≥ 44×44 CSS px; the whole card is the click target, not just the button text.
- **320px:** method cards stack vertically, full-width, no horizontal scroll. The demo banner truncates to its lede (see `00-overview §Demo banner`).

---
