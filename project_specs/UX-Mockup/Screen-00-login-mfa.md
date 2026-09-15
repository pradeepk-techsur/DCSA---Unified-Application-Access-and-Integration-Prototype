## Screen Designs

Every screen below carries: purpose, wireframe, information hierarchy, the full state set, interactive elements, and accessibility notes. All build on one of the four page templates (`00-overview §Page Templates`) and use the patterns in `Y0-patterns`.

---

### Screen: SCR-01 — Login, method selection

**Purpose:** Present three authentication methods as equally weighted, clearly differentiated choices, and state plainly that authentication is simulated.
**User Stories:** US-001, US-005, US-008 · **Features:** F0, F3 · **Template:** Standalone (shell without primary nav)

#### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ Skip to main content                          (visible on focus)     │
├──────────────────────────────────────────────────────────────────────┤
│ Demo — Synthetic Data Only. This prototype contains no real DCSA     │  ← usa-site-alert--info --slim
│ data, no real personal information, and no connection to any         │    NON-DISMISSIBLE, data-permanent="true"
│ government system.                                                   │    NO close control anywhere
├──────────────────────────────────────────────────────────────────────┤
│ ▣ An official website of the United States government   Here's how ▾ │  ← usa-banner (collapsed)
├──────────────────────────────────────────────────────────────────────┤
│  [DCSA seal/wordmark slot]   DCSA Unified Layer                      │  ← usa-header, NO primary nav
├──────────────────────────────────────────────────────────────────────┤
│ <main id="main-content">                                             │
│                                                                      │
│   Sign in to the DCSA Unified Layer                        <h1>      │
│                                                                      │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │ ⓘ Simulated sign-in. This prototype does not validate      │    │  ← usa-site-alert--info
│   │   certificates, passwords, or one-time codes. Choose a     │    │    aria-describedby the method group
│   │   method and a demo identity to continue.                  │    │    COPY IS VERBATIM-NORMATIVE
│   └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│   <fieldset> <legend class="usa-sr-only">Choose a sign-in method     │
│                                                                      │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐   │
│   │ ▣ CAC / PIV      │ │ ▣ ECA            │ │ ▣ Username +     │   │  ← three usa-card
│   │      <h2>        │ │      <h2>        │ │   one-time code  │   │    EQUALLY WEIGHTED
│   │                  │ │                  │ │      <h2>        │   │    differentiated by heading
│   │ Your Common      │ │ An External      │ │ For people who   │   │    text + ICON SHAPE,
│   │ Access Card or   │ │ Certificate      │ │ don't have a     │   │    never by fill colour
│   │ PIV credential.  │ │ Authority        │ │ government       │   │
│   │ Used by          │ │ credential from  │ │ card.            │   │
│   │ government       │ │ an approved      │ │                  │   │
│   │ personnel.       │ │ commercial       │ │                  │   │
│   │                  │ │ provider.        │ │                  │   │
│   │ [Sign in with    │ │ [Sign in with    │ │ [Sign in with    │   │
│   │  CAC/PIV      →] │ │  ECA          →] │ │  username     →] │   │
│   └──────────────────┘ └──────────────────┘ └──────────────────┘   │
│   </fieldset>                                                        │
│ </main>                                                              │
├──────────────────────────────────────────────────────────────────────┤
│ usa-identifier                                                       │
│  Defense Counterintelligence and Security Agency · DEMO PROTOTYPE     │
│  Accessibility statement · About this demo · Synthetic data only     │  ← SCR-36 reachable while
└──────────────────────────────────────────────────────────────────────┘    UNAUTHENTICATED
```

#### Information hierarchy

| Priority | Content | Placement |
|---|---|---|
| **Primary** | The three method choices | Centre, equal visual weight, above the fold at all breakpoints |
| **Primary** | The simulation notice | Directly above the method group, programmatically associated to it |
| Secondary | What each method *means in the real world* | One sentence inside each card — a reviewer should not have to guess why there are three |
| Secondary | The demo banner | Top of document, permanent |
| Tertiary | Accessibility statement, footer identity | `usa-identifier` footer |

#### States

| State | Appearance | User feedback |
|---|---|---|
| **Default** | Three enabled method cards | — |
| **Loading** | Card region `aria-busy="true"`, skeleton preserving card dimensions | sr-only "Loading sign-in methods" |
| **Method disabled** | Card renders **disabled with `disabledReason` text** — never hidden silently | "This sign-in method isn't available in this environment." |
| **Error** (config unreadable) | `usa-alert--error` replacing the card group | "Sign-in is temporarily unavailable. Please try again in a moment." + `[Try again]` |
| **Post-expiry entry** | Additional `usa-site-alert--info` above `<h1>` | "You were signed out because of inactivity. Sign in again to pick up where you left off." |
| **Empty** | *Not reachable* — three methods are configuration-guaranteed. If all were disabled, the error state renders | — |

#### Interactive elements

| Element | Component | Behaviour |
|---|---|---|
| "Sign in with CAC/PIV" | `usa-button` in `usa-card` | `POST /api/auth/initiate` → opens SCR-02 modal |
| "Sign in with ECA" | `usa-button` | → SCR-03 full page |
| "Sign in with username" | `usa-button` | → SCR-04 |
| Accessibility statement | `usa-identifier` link | → SCR-36 |
| Skip link | `usa-skipnav` | Moves focus to `<main>` |

---

### Screen: SCR-02 — CAC/PIV certificate picker

**Purpose:** Simulate the browser certificate picker a real PIV flow would produce, using synthetic identities that are invalid by construction.
**User Stories:** US-002, US-008 · **Features:** F0 · **Template:** FormPage inside `usa-modal`

```
┌─ usa-modal · role="dialog" aria-modal="true" · FOCUS TRAPPED ────────┐
│                                                                  [✕] │
│  Choose a certificate                                      <h1>      │
│                                                                      │
│  ⓘ These are synthetic certificates. No certificate is parsed or     │
│    validated.                                                        │
│                                                                      │
│  <caption>Synthetic certificates available for demonstration</caption>│
│  ┌─────────────────────┬──────────────────┬───────────┬───────────┐ │
│  │ Common name         │ Organization     │ Issuer    │ Valid to  │ │  ← th scope="col"
│  ├─────────────────────┼──────────────────┼───────────┼───────────┤ │
│  │ VALE.MARCUS.T.10041 │ DCSA-FIELD-OPS-  │ DEMO-DOD- │ 2029-04-01│ │  ← th scope="row"
│  │ (synthetic          │ EAST             │ CA-59     │           │ │
│  │  certificate)       │                  │(synthetic)│           │ │
│  │ Investigator        │ serial 00:DEMO:…  │           │ [Select]  │ │
│  ├─────────────────────┼──────────────────┼───────────┼───────────┤ │
│  │ OKONKWO.DANA.R.…    │ DCSA-ADJ-CENTRAL │ DEMO-DOD- │ 2029-04-01│ │
│  │ (synthetic cert.)   │                  │ CA-59     │           │ │
│  │ Adjudicator         │                  │(synthetic)│ [Select]  │ │
│  ├─────────────────────┼──────────────────┼───────────┼───────────┤ │
│  │ RAGHUNATHAN.PRIYA…  │ DCSA-PLATFORM-OPS│ DEMO-DOD- │ 2029-04-01│ │
│  │ (synthetic cert.)   │                  │ CA-59     │           │ │
│  │ Administrator       │                  │(synthetic)│ [Select]  │ │
│  └─────────────────────┴──────────────────┴───────────┴───────────┘ │
│                                                                      │
│  [ Cancel ]                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

**Every row carries** the "(synthetic certificate)" marker, a `DEMO-DOD-CA-59 (synthetic)` issuer, and a serial beginning `00:DEMO:`. The role each identity holds is shown, so a demo driver can pick the persona they need without a cheat sheet.

#### States

| State | Appearance | Feedback |
|---|---|---|
| Default | Populated certificate table, ≥1 identity per role | — |
| Loading | `aria-busy`, skeleton rows preserving height | sr-only "Loading certificates" |
| **Auth failed** | Error summary at top of modal, `role="alert"`, focus moved to it | "We couldn't sign you in with the selected identity. Choose a different demo identity or sign-in method." |
| **Transaction expired** | Modal closes, SCR-01 shows site-alert | "Your sign-in attempt timed out. Choose a sign-in method to start again." |
| **Transaction consumed** | Same | "That sign-in attempt has already been completed." |
| Empty | *Not reachable under seeded data* — seed validation fails loudly first | — |

> **Non-enumeration:** a disabled identity returns **the same copy** as an unknown one. The response must not distinguish "disabled" from "unknown."

---

### Screen: SCR-03 — ECA identity selection

**Purpose:** Demonstrate a **second, independent identity provider** — a different pool, a different issuer namespace, and its own selection screen. Deliberately **not** a relabelled CAC/PIV picker.
**User Stories:** US-003 · **Features:** F0 · **Template:** FormPage, full page

```
│   Sign in with an ECA certificate                           <h1>     │
│                                                                      │
│   ┌─ usa-process-list ───────────────────────────────────────────┐   │
│   │ 1. External certificate authority                            │   │  ← makes the "different
│   │    Your credential is issued by an approved commercial       │   │    IdP flow" legible,
│   │    provider, not by the Department of Defense.               │   │    not just asserted
│   │ 2. Confirm identity                                          │   │
│   │    Choose which demo identity to sign in as.                 │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   ⓘ Simulated sign-in. No certificate is parsed or validated.        │
│                                                                      │
│   <caption>ECA demo identities — 3 available</caption>               │
│   │ Common name          │ Organization      │ Issuer              │ │
│   │ ASHFORD.RENEE.…      │ NORTHBRIDGE       │ DEMO-ECA-VENDOR-07  │ │
│   │ (synthetic cert.)    │ SYSTEMS (cleared  │ (synthetic)         │ │
│   │ Applicant            │ contractor)       │          [Select]   │ │
```

**The pools are genuinely disjoint** — at minimum one identity is ECA-only and one is CAC/PIV-only. Selecting a CAC-only identity here returns `AUTH_FAILED`. This is what proves two IdPs rather than one with a skin.
On success the header reads **"Signed in via ECA (simulated)."**

States as SCR-02, plus: **empty pool** → "No ECA demo identities are configured in this environment." (designed, though seed validation prevents it).

---

### Screens: SCR-04 / SCR-05 — Generic MFA

**Purpose:** A non-certificate IdP path, with a **deterministic, visibly displayed** demo code so a reviewer is never blocked.
**User Stories:** US-004, US-005, US-113 · **Features:** F0, F14 · **Template:** FormPage

```
SCR-04                                    SCR-05
│  Enter your demo username    <h1>       │  Enter your one-time code   <h1>
│                                          │
│  ⓘ Simulated sign-in.                   │  ┌─ usa-summary-box ──────────────┐
│                                          │  │ Demo one-time code: 123456     │
│  Demo username (required)                │  │ In a real deployment this code │
│  ┌────────────────────────────┐          │  │ would be delivered to your     │
│  │ r.ashford                  │          │  │ registered device.             │
│  └────────────────────────────┘          │  └────────────────────────────────┘
│  usa-hint: Use one of the demo           │
│  identities listed in the demo script.   │  One-time code (required)
│                                          │  ┌──────────┐
│         [ Continue ]                     │  │ 123456   │  ← inputmode="numeric"
│                                          │  └──────────┘   autocomplete="one-time-code"
│                                          │  usa-hint: Enter the 6-digit code shown above.
│                                          │
│                                          │  [ Sign in ]   [ Start again ]
```

#### States

| State | Appearance | Feedback |
|---|---|---|
| Default | Labelled input, hint text, primary button | — |
| **Validation error** | Error summary `role="alert"`, **focus moved to summary**, in-page link to field; field `aria-invalid="true"` + inline `usa-error-message`; title prefixed "Error: " | "Enter your demo username." / "Enter the 6-digit code shown above." |
| **Auth failed** | Error summary | "We couldn't sign you in. Check the demo username and code, then try again." — **identical copy, status, and response-time profile** whether the username is unknown or the code is wrong |
| **Attempts exhausted** (6th) | Redirect to SCR-01 with site-alert | "Too many attempts. Choose a sign-in method to start again." |
| **Transaction expired** | Redirect to SCR-01 | "Your sign-in attempt timed out." |
| Submitting | Button disabled, `aria-busy` | "Signing in…" announced once |

> **Never** does a response body or log line contain the submitted code.

---

### Screen: SCR-06 — Session timeout warning (modal)

**Purpose:** Warn before expiry, allow extension **without losing entered data**, and never punish a user for working at their own pace.
**User Stories:** US-006, US-117 · **Features:** F0, F14 · **Template:** `usa-modal`

```
┌─ usa-modal · focus trapped · Escape closes ──────────────────────────┐
│  Your session is about to end                              <h1>      │
│                                                                      │
│  You'll be signed out in 1:47 because there's been no activity.      │
│                                                                      │
│  Anything you've typed will be kept if you stay signed in.           │  ← the reassurance that
│                                                                      │    matters most to PER-03
│  [ Stay signed in ]   [ Sign out now ]                               │
└──────────────────────────────────────────────────────────────────────┘
```

| State | Appearance | Feedback |
|---|---|---|
| Open | Modal at T−2:00, live countdown | Announced **at open, 60s, and 15s only** — never per-tick |
| Extending | Button busy | "Session extended." polite, once. **No page reload. Form input intact.** |
| Expired | Redirect to SCR-01 with `returnTo` | "You were signed out because of inactivity. Sign in again to pick up where you left off." |
| Absolute lifetime reached | Redirect | "Your session reached its time limit. Sign in again to continue." |

---

### Screen: SCR-07 — Signed out

**Purpose:** Confirm that the session **and all downstream spoke context** have ended.
**User Stories:** US-007 · **Features:** F0, F1 · **Template:** Standalone

```
│   You're signed out                                        <h1>      │
│                                                                      │
│   Your session and all connected application access have ended.      │
│                                                                      │
│   [ Sign in again ]                                                  │
```

Back-navigation after sign-out **must not** render cached authenticated content — every authenticated response carries `Cache-Control: no-store`. The demo banner is present here as everywhere.

---

### Accessibility notes — all authentication screens

- **Heading hierarchy:** exactly one `<h1>` per screen, naming the screen's own task (not the product). `<h2>` per method card. Gap-free.
- **Landmarks:** `banner` (containing the demo banner and header), `main`, `contentinfo`. **No `nav[Primary]`** on unauthenticated routes — correct, because there is nothing yet to navigate.
- **Focus order:** skip link → demo banner content → gov banner toggle → `<main>` `<h1>` → simulation notice → method buttons in visual order → footer. Follows visual order exactly; positive `tabindex` prohibited.
- **Focus management:** SCR-02 modal traps focus while open, closes on Escape, and **restores focus to the "Sign in with CAC/PIV" button**. On every client-side route change (SCR-01→04→05) `document.title` updates and focus moves to the new `<h1>`.
- **Visible focus indicator:** `$theme-focus-color` (`blue-warm-40v`), `0.25rem` width, `0` offset, meeting 3:1 against every background it appears on. `outline: none` without a replacement is prohibited by lint.
- **Keyboard operability:** every method card button is reachable and operable with **Enter and Space**. The certificate table's Select buttons are real `<button>`s. No keyboard traps anywhere, including inside the modal.
- **Data table (SCR-02/03):** real `<table>` with `<caption>` stating contents and count, `<th scope="col">` on every header, `scope="row"` on the common-name cell. Not sortable (small fixed list), so no `aria-sort` is claimed.
- **Form label + error association:** `usa-label` with `for`/`id` on every input; hint via `aria-describedby`; required marked with the **text** "required"; on failure the field gets `aria-invalid="true"` and an inline `usa-error-message` joined into `aria-describedby`; the error summary has `role="alert"`, receives focus, and links in-page to the field.
- **aria-live:** countdown announcements (open/60s/15s) via `aria-live="polite"`; error summaries via `role="alert"`; "Signing in…" busy state announced once.
- **Colour-independent meaning:** method cards are differentiated by **heading text and icon shape**. Certificate validity, identity role, and failure states are all conveyed in text.
- **Target sizes:** every method card is a ≥44×44 px target, and the **whole card is clickable**, not just the button text.
- **320px reflow:** method cards stack vertically full-width; the certificate table reflows to stacked definition-list cards (see `Y1-responsive`); the demo banner truncates to its lede; no horizontal scroll at any point.
- **Simulation honesty (CI-scanned):** the words "verified," "validated," "authenticated against," and "trusted certificate" appear **nowhere** on authentication routes. Permitted verbs: "selected," "simulated," "demo."

---
