# UX Mockup
## DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

| Field | Value |
|---|---|
| **Product Name** | DCSA Unified Application Access and Integration Prototype |
| **Project Acronym** | DCSA-UAL |
| **Document Type** | UX Mockup / Screen Design Specification |
| **Status** | Draft v1.0 |
| **Date** | 2026-09-15 |
| **Based on** | `UserStories-DCSA-UAL.md` (US-001…US-151), `PRD-DCSA-UAL.md` (F0–F19), `FRD-DCSA-UAL.md` (SCR-01…SCR-38, FR-F00…FR-F19), `JOURNEYS-DCSA-UAL.md` (JRN-01.01…JRN-04.03), `TechArch-DCSA-UAL.md` §12 |
| **Design system** | USWDS v3, token-only theming |
| **Accessibility target** | Section 508 / WCAG 2.1 AA (hard gate) |

> **DEMO — SYNTHETIC DATA ONLY.** Every screen in this document renders a non-dismissible demo banner. All names, cases, questionnaires, issues, and identifiers shown in wireframes are fabricated.

---

## Overview

### What this document is

A screen-by-screen design specification precise enough to build from without guessing placement. Every screen carries a wireframe, an information hierarchy, the full state set, interactive-element behaviour, and accessibility notes. Reusable behaviours are defined **once** in `Y0-patterns` and referenced by name everywhere else — the thirty-eighth screen must not invent a thirty-eighth interpretation of "loading."

### The UX thesis

The product's entire argument is **continuity**. A user signs in once and completes a cross-application workflow without noticing which system they are in. Three design consequences follow, and they govern every decision below:

1. **The shell never unmounts.** Header, demo banner, primary navigation, and footer remain mounted across every navigation including the flagship eApp → PVQ traversal. There is no interstitial, no new tab, no redirect to a spoke origin. (F1, F3, F7 / US-009, US-026, US-061)
2. **Source attribution is always present but never the subject.** The user always knows which system owns an item — but they never have to *act* on that knowledge. Attribution is a badge and an accessible name, not a navigation decision. (F5 / US-041)
3. **The server decides; the client renders.** Navigation comes from `entitlements.navigation`; action buttons come from server-computed `ActionDescriptor[]`. Hiding a control is a courtesy, never a control. (F2 / US-015, US-051)

Every screen in this document consumes the hub's Backend-for-Frontend API (**F10**) — the single server-side surface where authorization and audit are enforced. F10 has no screen of its own, but it is the reason the states in `Y0-patterns` are expressible at all: per-source status, server-computed action lists, partial-failure reporting, and the consistent error envelope (code, message, correlation ID, no information disclosure on denial) are API contracts this design depends on. Where a screen shows "4 of 5 systems reporting" or a disabled action with a reason, it is rendering F10's response shape, not inventing one.

### Design principles

| # | Principle | Design consequence |
|---|---|---|
| P1 | **Continuity over navigation** | No visual discontinuity at a system boundary. Breadcrumbs carry cross-system context with source badges (F3 / US-029). |
| P2 | **Every button works** | Zero dead links, zero placeholder screens. Every nav item, widget count, and table row resolves to a real, populated destination (F3 / US-032, US-150). |
| P3 | **Degrade visibly, never blankly** | A failed source is **named and quantified** on the screen where its data is missing. Empty ≠ error ≠ degraded, and the distinction is legible non-visually (F16 / US-127, US-129). |
| P4 | **Honest confirmation** | Confirmations report **observed** state read back from each spoke, not asserted state. The word "success" never appears on a partial outcome (F7 / US-065, US-066). |
| P5 | **Accessibility is inherited, not re-litigated** | Four page templates carry landmarks, heading order, and the five-state contract. A screen not built on a template fails design review (F14 / US-109…US-118). |
| P6 | **Plain language is a requirement** | Especially on the applicant surface: no tier codes, no internal state names, no system names in body copy (F4 / US-035). |
| P7 | **Token-only theming** | No hard-coded colour, font, or spacing anywhere. See the assumption below. |

---

## Design System Constraints (binding)

### USWDS v3 components only

Every element in this document names the **actual USWDS component** used. Where USWDS provides a component, it is used; no bespoke equivalent is designed. Components in play across this product:

`usa-banner` · `usa-header` · `usa-nav` · `usa-navbar` · `usa-menu-btn` · `usa-sidenav` · `usa-breadcrumb` · `usa-skipnav` · `usa-identifier` · `usa-footer` · `usa-site-alert` · `usa-alert` · `usa-summary-box` · `usa-card` · `usa-table` · `usa-pagination` · `usa-tag` · `usa-icon` · `usa-icon-list` · `usa-button` · `usa-button-group` · `usa-modal` · `usa-form` · `usa-input` · `usa-textarea` · `usa-select` · `usa-combo-box` · `usa-radio` · `usa-checkbox` · `usa-fieldset` · `usa-legend` · `usa-hint` · `usa-error-message` · `usa-character-count` · `usa-date-picker` · `usa-date-range-picker` · `usa-file-input` · `usa-search` · `usa-accordion` · `usa-process-list` · `usa-step-indicator` · `usa-in-page-navigation` · `usa-tooltip` · `usa-prose` · `usa-list` · `usa-link` · `usa-label`

**Prohibited:** any custom component duplicating a USWDS one. A PR introducing one fails design review (TechArch §12.3).

### No hard-coded colours — token names only

Every visual value in this document is referenced by **USWDS design token name**, never by hex, rgb, or a colour word. The palette lives in exactly one file (`packages/theme/_uswds-theme.scss`) and a build-failing stylelint rule enforces the rest (NFR-03 / US-116).

Tokens referenced throughout this document:

| Purpose | Token |
|---|---|
| Primary action, links | `$theme-color-primary` → `blue-warm-60v` |
| Primary hover/active | `$theme-color-primary-darker` → `blue-warm-80v` |
| Base text / body | `$theme-color-base-darkest`, family `gray-cool` |
| Accent (source badges) | `$theme-color-accent-cool` → `cyan-30v` |
| Info state | `$theme-color-info`, `$theme-color-info-lighter` |
| Warning / degraded | `$theme-color-warning`, `$theme-color-warning-lighter` |
| Error / denial | `$theme-color-error`, `$theme-color-error-lighter` |
| Success / confirmation | `$theme-color-success`, `$theme-color-success-lighter` |
| Demo banner background | `$theme-banner-background-color` → `ink` |
| Focus ring | `$theme-focus-color` → `blue-warm-40v`, width `0.25rem`, offset `0` |
| Spacing | `units()` scale only — `05, 1, 105, 2, 3, 4, 5, 7, 9` |
| Radius | `$theme-border-radius-md` |
| Type | `$theme-font-type-sans` → Public Sans (self-hosted) |

> **ASSUMPTION — RECORDED, FLAGGED FOR REVISIT.**
> **Attachment 1, the "DCSA Ecosystem Style Guide," was not supplied** with the source material, and the referenced `Page_render_reference.pdf` is not on disk. This document therefore assumes **USWDS v3 with DCSA-flavoured theming applied entirely through design tokens**: federal blue palette, Public Sans typography, and a reserved header slot for a DCSA seal/wordmark asset.
>
> **Consequence if wrong:** adopting the real guide is a change to one theme file plus an asset swap — **not** a component rewrite. Every wireframe in this document remains valid; only token *values* change. This assumption is restated on SCR-36 (Accessibility Statement), because honesty about the assumption belongs on the page that claims conformance (PRD §4 Q-01, FR-F14-11).
>
> **Revisit trigger:** the moment Attachment 1 is available. Record any divergence as a change to F14.

### The demo banner — a global invariant

A non-dismissible **"Demo — Synthetic Data Only"** region renders at the very top of the document on **every** route, including login (SCR-01…05), signed-out (SCR-07), and all three error pages (SCR-30/31/32). It is a `usa-site-alert usa-site-alert--info usa-site-alert--slim` variant, server-rendered into the root layout, carrying `data-permanent="true"`, with **no close control, no `hidden` path, no state toggle, no feature flag** (FR-F03-03 / US-027, US-123).

Copy (verbatim, normative):
> **Demo — Synthetic Data Only.** This prototype contains no real DCSA data, no real personal information, and no connection to any government system.

**Layout budget so it never hides primary content:**

| Viewport | Banner treatment | Height budget |
|---|---|---|
| ≥ `desktop` (1024px+) | Full copy, single line | `units(4)` ≈ 32px |
| `tablet` (640–1023px) | Full copy, may wrap to 2 lines | ≤ `units(6)` |
| < 640px | **Truncated to the bold lede only** — "Demo — Synthetic Data Only." The full sentence remains in the DOM inside a `usa-accordion`-free visually-hidden span so screen readers and the CI copy-scan still find it verbatim | ≤ `units(4)` |

> ⚠ **RESOLVED TENSION — NFR-13 vs SM-25. Budgeted here, made normative in FR-F03-03 rule 3a, tested explicitly.**
> At **320px** the applicant's status answer (SCR-11, "Where you are") **must remain above the fold**. The demo banner, the USWDS government banner, and the header together threaten that. The resolution designed here:
> 1. The banner truncates to its lede at <640px (above).
> 2. The **USWDS government banner (`usa-banner`) collapses to its closed accordion state** at <640px — one line, `units(4)`.
> 3. The header compacts to a single `units(7)` row: wordmark + `usa-menu-btn`.
> 4. **The `<h1>` and the status sentence are the first content in `<main>`** — no breadcrumb, no page-level alert region, no announcement region above them on SCR-11.
> Total chrome budget at 320px: **≤ `units(15)` (~120px)**, leaving the status sentence visible in a 568px-tall viewport without scrolling. This is a measured acceptance criterion on SCR-11, not an aspiration.
>
> The banner is **never** overlaid, never obscured by an announcement (`usa-site-alert` announcements render *below* it), and `EMERGENCY` announcements do not change this (FR-F11-06 rule 6).

---

## Page Templates — accessibility is inherited

Every one of the 38 screens is built on exactly one of four templates. The template supplies landmarks, heading order, focus management, and all five data states. This is the mechanism by which correctness is inherited instead of re-argued (TechArch §12.4, FR-F03-08).

| Template | Structure | Screens using it |
|---|---|---|
| **`ListPage`** | Filter form (`<form>` landmark) → filter chips → `usa-table` with `<caption>` → `usa-pagination` | SCR-13, 21, 22, 24, 25, 26, 29, 33, 35 |
| **`DetailPage`** | Summary header → content sections → related items → action panel → activity history | SCR-14, 15, 16, 17, 18, 19, 20, 23, 27, 34 |
| **`FormPage`** | Error summary → `usa-fieldset` groups → action bar | SCR-02, 03, 04, 05, 28 |
| **`ConsolePage`** | `usa-sidenav` sub-navigation + list/detail split | SCR-22, 23, 24, 25, 26, 29, 37, 38 |

Standalone (shell + single content block, no template): SCR-01, 07, 30, 31, 32, 36.
Dashboards (SCR-09/10/11/12) use a **widget grid** composed of `usa-card` and `DataRegion` sections — a `ListPage` variant with `<section aria-labelledby>` per widget.

**Every data-bearing region on every template is wrapped in the `DataRegion` component** implementing the five-state contract defined in `Y0-patterns §DataRegion`.

---

## Navigation Map

> The single source of truth for how every screen is **reached**. The planner derives nav-wiring tasks from this table; verify-work flags any built route missing from the running app's link graph as an orphan gap.

| Screen | Route | Reached from | Nav element |
|---|---|---|---|
| SCR-01 Login — method selection | `/login` | Unauthenticated entry; expired session redirect; any deep link while signed out | App entry point / redirect with `returnTo` |
| SCR-02 CAC/PIV certificate picker | `/login/cac-piv` | SCR-01 | `usa-card` button: "Sign in with CAC/PIV" |
| SCR-03 ECA identity selection | `/login/eca` | SCR-01 | `usa-card` button: "Sign in with ECA certificate" |
| SCR-04 Generic MFA — username | `/login/mfa` | SCR-01 | `usa-card` button: "Sign in with username and code" |
| SCR-05 Generic MFA — one-time code | `/login/mfa/code` | SCR-04 | Primary button: "Continue" |
| SCR-06 Session timeout warning | *(modal, no route)* | Any authenticated screen | Inactivity timer at T−2 min → `usa-modal` |
| SCR-07 Signed out | `/signed-out` | Any authenticated screen | Header account menu → "Sign out" |
| SCR-08 Application shell | *(wraps all authenticated routes)* | — | The frame itself |
| SCR-09 Investigator dashboard | `/dashboard` | Post-login landing (Investigator); any screen | Primary nav: "Dashboard" |
| SCR-10 Adjudicator dashboard | `/dashboard` | Post-login landing (Adjudicator); any screen | Primary nav: "Dashboard" |
| SCR-11 Applicant dashboard | `/dashboard` | Post-login landing (Applicant); any screen | Primary nav: "Dashboard" |
| SCR-12 Administrator dashboard | `/dashboard` | Post-login landing (Administrator); any screen | Primary nav: "Dashboard" |
| SCR-13 Unified work queue | `/work` | SCR-09/10/11; SCR-14–20 return link | Primary nav: "Work Queue"; dashboard widget "View all work"; breadcrumb segment 1 |
| SCR-14 Work-item detail (generic) | `/work/[workItemId]` | SCR-13 row; SCR-09/10 widget row; SCR-35 result row | Table row title link (`scope="row"` cell) |
| SCR-15 eApp case view | `/work/EAPP:*` | SCR-13 row; SCR-09 "Newly raised PVQ issues" widget; SCR-16 "Related case" strip; SCR-20 "Return to eApp Case" | Row click / related-item link / breadcrumb segment 2 |
| SCR-16 PVQ issue detail & resolution | `/work/PVQ:*` | **SCR-15 related-items panel** *(flagship traversal)*; SCR-13 row; SCR-20 "View the updated issue in PVQ" | Related-items panel link; breadcrumb segment 3 |
| SCR-17 PDT designation view | `/work/PDT:*` | SCR-13 row; SCR-15 related-items panel; SCR-10 widget | Row click / related-item link |
| SCR-18 IEP applicant status view | `/work/IEP:*` | SCR-11 "What you need to do" / "Your notices"; SCR-13 row | Applicant nav: "My Tasks", "My Notices"; task row link |
| SCR-19 IM case assignment view | `/work/IM:*` | SCR-13 row; SCR-15 related-items panel | Row click / related-item link |
| SCR-20 Dual-system confirmation | `/work/[id]/confirm/[txId]` | SCR-16 resolution form submit | Result of "Resolve issue" submission |
| SCR-21 Notifications & announcements | `/notifications` | Any screen; SCR-09/10/11 alerts widget | Primary nav: "Notifications" (+ header bell with count) |
| SCR-22 Admin — connected applications | `/admin/applications` | SCR-12 "Connected applications" widget | Admin nav: "Connected Applications" |
| SCR-23 Admin — application detail | `/admin/applications/[id]` | SCR-22 row; SCR-24 row; SCR-25 row link | Row action: "View details" |
| SCR-24 Admin — system health | `/admin/health` | SCR-12 "System health" widget | Admin nav: "System Health" |
| SCR-25 Admin — integration issues | `/admin/integration-issues` | SCR-12 "Integration issues" widget; SCR-23 section link | Admin nav: "Integration Issues" |
| SCR-26 Admin — identities & roles | `/admin/identities` | SCR-12 | Admin nav: "Identities & Roles" |
| SCR-27 Identity detail | `/admin/identities/[id]` | SCR-26 row | Row click |
| SCR-28 Application registration | `/admin/applications/register` | SCR-22 primary button; SCR-23 "Edit configuration" | Button: "Register an application" |
| SCR-29 Announcement management | `/admin/announcements` | SCR-12 "Announcements" widget | Admin nav: "Announcements" |
| SCR-30 Access denied | `/denied` | Any denied navigation (403) | Server denial → rendered inside shell |
| SCR-31 Not found | *(catch-all)* | Any unknown route (404) | Route fallthrough → rendered inside shell |
| SCR-32 Unexpected error | *(error boundary)* | Any unhandled condition (500 / client throw) | Global error boundary → rendered inside shell |
| SCR-33 Audit trail viewer | `/activity` | SCR-09/10/11 "Recent activity" widget; SCR-12 | Primary nav: "My Activity" (mission roles) / "Audit Trail" (Administrator) |
| SCR-34 Audit record detail & chain | `/activity/[auditId]` | SCR-33 row; **SCR-15/16 activity-history correlation link**; SCR-20 "View audit trail for this action"; SCR-25 row link | Row click / correlation-ID link affordance |
| SCR-35 Global search results | `/search` | Header `usa-search` submit | Header search field |
| SCR-36 Accessibility statement | `/accessibility` | **Footer on every screen** (incl. login); header account menu | `usa-identifier` footer link |
| SCR-37 Demo operations / status | `/admin/operations` | SCR-12 "Demo operations" widget | Admin nav: "Demo Operations" |
| SCR-38 Failure injection controls | `/admin/failure-injection` | SCR-37 primary link; SCR-12 "Demo operations" widget; SCR-24 banner link | Link: "Failure injection controls" |

### Invariant — no orphan screens

Every screen above has **at least one inbound path traceable back to the app shell**. Verified three ways:

1. **Primary-nav reachability.** Each of the four roles' nav sets (FR-F03-04) covers: Dashboard, Work Queue/My Tasks, Notifications, My Activity, Search — plus the eight Administrator console items. Every nav entry resolves to an implemented, populated route (US-032, SM-05).
2. **Parent-traceable detail screens.** SCR-14–20, 23, 27, 34 are detail/confirmation screens reached by row click or related-item link from a parent that is itself on the nav. This is legitimate; the parent traces to the shell.
3. **System-invoked screens.** SCR-06 (timer), SCR-30/31/32 (server/boundary) have no nav entry by design — they are *invoked*, not navigated to. Each renders **inside the shell** with working exits back to Dashboard and Work Queue, so they are never terminal.

A screen reachable only by typing its URL is a design error. **None exist in this design.**

### Role-differentiated navigation (the RBAC demonstration in the chrome)

| Role | Primary nav set (`usa-nav` items, in order) |
|---|---|
| **Investigator** (PER-01) | Dashboard · Work Queue · Notifications · My Activity · *(header search)* |
| **Adjudicator** (PER-02) | Dashboard · Work Queue · Notifications · My Activity · *(header search)* |
| **Applicant** (PER-03) | Dashboard · My Tasks · My Notices · My Status · Help |
| **Administrator** (PER-04) | Dashboard · Connected Applications · System Health · Integration Issues · Audit Trail · Identities & Roles · Announcements · Demo Operations |

The Administrator nav **contains no Work Queue** — administrators hold no work-item read permission (FR-F02-02 rule 1). That absence is deliberate and is itself part of the least-privilege demonstration (US-023).

---

## Document Map

| Chunk | Contents |
|---|---|
| `00-overview.md` | This section: approach, principles, design-system constraints, templates, navigation map |
| `Flow-00-authentication.md` | Sign-in (3 methods), failure, timeout, sign-out |
| `Flow-01-flagship-cross-application.md` | **JRN-01.01 / F7** — the flagship traversal and dual-system update |
| `Flow-02-triage-and-degradation.md` | JRN-01.02 triage; JRN-01.03 degraded-system survival |
| `Flow-03-adjudication.md` | JRN-02.01 — cross-system picture and determination; RBAC action-set contrast |
| `Flow-04-applicant-status.md` | JRN-03.01 — phone-first status and owed action |
| `Flow-05-admin-onboarding.md` | JRN-04.01 — register the sixth application live |
| `Flow-06-admin-issue-triage.md` | JRN-04.02 — health → issue log → correlation ID → audit chain; JRN-04.03 — rehearsed degradation (§6b) |
| *(no dedicated flow)* | **JRN-03.02 — proof and boundary (demo Segment 5b, resource-level zero trust).** **Known gap, recorded deliberately.** Nine of ten journeys have a flow chunk; this one does not. It is composed from existing screens plus a terminal step: SCR-11 applicant dashboard → SCR-33 self-scoped activity ("prove what I submitted") → a `curl` call to a legitimate endpoint carrying **another subject's** resource ID → SCR-30 access denied, non-enumerable → SCR-33/SCR-34 showing the denial on the record. Every screen it needs is already specified; what is missing is the walkthrough. A `Flow-07` chunk should be authored before the demonstration, because this is a **named secondary demo script** (PRD F18) and the headline resource-level zero-trust claim (PER-03 Access Scope, SM-18). |
| `Screen-00-login-mfa.md` | SCR-01…SCR-05, SCR-07 |
| `Screen-01-application-shell.md` | SCR-08 — header, banner, nav, breadcrumb, footer, skip link |
| `Screen-02-dashboard-investigator.md` | SCR-09 |
| `Screen-03-dashboard-adjudicator.md` | SCR-10 |
| `Screen-04-dashboard-applicant.md` | SCR-11 — mobile-first |
| `Screen-05-dashboard-administrator.md` | SCR-12 |
| `Screen-06-work-queue.md` | SCR-13 |
| `Screen-07-work-item-detail.md` | SCR-14 |
| `Screen-08-eapp-case-view.md` | SCR-15 — **the hinge of the flagship journey** |
| `Screen-09-pvq-issue-and-confirmation.md` | SCR-16 + SCR-20 |
| `Screen-10-pdt-iep-im-views.md` | SCR-17, SCR-18, SCR-19 |
| `Screen-11-admin-console.md` | SCR-22, 23, 24, 25 (+ 26, 27, 29, 37, 38) |
| `Screen-12-application-registration.md` | SCR-28 |
| `Screen-13-audit-viewer.md` | SCR-33, SCR-34 |
| `Screen-14-error-and-utility-pages.md` | SCR-30, 31, 32, 21, 35, 36 |
| `Y0-patterns.md` | Reusable interaction patterns (DataRegion, source badge, action panel, confirmation-with-readback, degraded banner, audit link) |
| `Y1-responsive.md` | Breakpoints, table reflow, phone-first applicant view |
| `Y2-accessibility.md` | Cross-cutting a11y contract and per-screen verification matrix |

---
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
### Flow 1: FLAGSHIP — eApp case → related PVQ issue → dual-system update

> **This is the single most important flow in the product.** It maps PRD **F7**, JTBD-01.1, and JRN-01.01. Per the project charter: *if everything else fails, this must work.* Target: complete manually in **under three minutes** following the demo script.

**Trigger:** Dashboard alert `ALERT-NEW-PVQ-ISSUE` — "New issue raised on CASE-A-1042 — 3 days ago."
**User Stories:** US-059, US-060, US-061, US-062, US-063, US-064, US-065, US-066, US-067, US-068, US-069
**Features:** F7 (flagship), F1 (session), F2 (authz), F3 (shell), F5 (queue), F6 (detail), F13 (audit), F14 (a11y)
**Persona:** PER-01 Marcus Vale (Investigator)
**Demo path:** ✅ PRIMARY SCRIPTED DEMO — Segment 1

```
[SCR-09 Investigator dashboard]
   │  "Newly raised PVQ issues" widget
   │  ▣ PVQ  "Issue raised against Section 13A — Employment history"
   │         Case A-1042 · raised 3 days ago
   │
   ▼  activate alert link                            ← ≤2 clicks from sign-in
[SCR-13 Unified work queue]
   │  default view: assigned to me, due date ascending
   │  chips visible: [Assigned to: me ✕] [Status: Open, In progress ✕]
   │  EAPP:CASE-A-1042 on page 1, NO filtering required
   │
   │  ┌───────────────────────────────────────────────────────┐
   │  │ Case A-1042 — Section 13A employment history          │
   │  │ ▣ eApp │ SUBJ-00418 │ Under review │ Routine │ 4 days │
   │  └───────────────────────────────────────────────────────┘
   │
   ▼  activate row  (returnTo encodes filters+sort+page)
[SCR-15 eApp case view]                    ◀── THE HINGE ───────────────┐
   │  breadcrumb: Work Queue › ▣ eApp Case A-1042                       │
   │  header: "1 outstanding issue"  ← LINK, moves focus to panel       │
   │                                                                    │
   │  Questionnaire sections (usa-accordion, anchored #SECTION_13A)     │
   │    ▸ Section 13A — Employment history                             │
   │        employer[0].endDate  ·  "March 2019"   ← the flagged answer │
   │                                                                    │
   │  ╔═ Related items in other systems ═══════════════════════════╗   │
   │  ║ Issues raised against this case (1)                        ║   │
   │  ║  ▣ PVQ  ISS-2207 · Open · raised 3 days ago                ║   │
   │  ║  "Issue raised against Section 13A — Employment history"   ║   │
   │  ║       ↑ label sourced LIVE from PVQ's answerSectionLabel,  ║   │
   │  ║         not composed by the UI, not hard-coded             ║   │
   │  ║ Position designation (1)   ▣ PDT  PDT-0771 · Approved      ║   │
   │  ║ Case assignment (1)        ▣ IM   IM-3310 · Active         ║   │
   │  ╚════════════════════════════════════════════════════════════╝   │
   │        ↑ THREE relationship types — the cross-system story is      │
   │          not a single link                                         │
   │                                                                    │
   ▼  activate the related PVQ issue                                    │
   │                                                                    │
   │  ╔══ THE TRAVERSAL — highest-risk step in the product ══════════╗ │
   │  ║ • in-shell client route change, header/banner/nav STAY MOUNTED║ │
   │  ║ • NO new tab, NO iframe, NO redirect to a spoke origin        ║ │
   │  ║ • NO credential prompt, NO interstitial                       ║ │
   │  ║ • ZERO identifiers typed, copied, or re-entered   (SM-04)     ║ │
   │  ║ • focus moves to the new <h1>; document.title updates         ║ │
   │  ║ • RELATED_ITEM_TRAVERSED audit record written — the chain      ║ │
   │  ║   shows the PATH, not just the endpoints                      ║ │
   │  ╚═══════════════════════════════════════════════════════════════╝ │
   ▼                                                                    │
[SCR-16 PVQ issue detail & resolution]                                  │
   │  breadcrumb: Work Queue › ▣ eApp Case A-1042 › ▣ PVQ Issue ISS-2207│
   │  "Related case" strip: Part of eApp Case A-1042 — {subject} ───────┘
   │
   │  The flagged answer quoted IN CONTEXT:
   │    question text · answerSnapshot ("March 2019") · section label
   │    [ View this section in the case → ] deep-anchors to #SECTION_13A
   │
   │  ┌─ Resolve this issue ─────────────────────────────────┐
   │  │ usa-fieldset / legend "Resolution disposition"        │
   │  │  ( ) Substantiated          ← radio, each with hint   │
   │  │  ( ) Unsubstantiated                                  │
   │  │  ( ) Resolved with clarification                      │
   │  │  ( ) Referred for further review                      │
   │  │                                                        │
   │  │ Resolution narrative (required)  usa-character-count   │
   │  │ [ 20–4000 chars ]                                     │
   │  │                                                        │
   │  │ [x] I have reviewed the flagged answer   ← gate        │
   │  │                                                        │
   │  │ ⓘ This updates PVQ and eApp.   ← BEFORE they act      │
   │  │ [ Resolve issue ]                                     │
   │  └───────────────────────────────────────────────────────┘
   │
   ▼  submit
   │  "Resolving issue. This updates two systems." (aria-busy, button disabled)
   │  NOT OPTIMISTIC — no state shown until both spokes answer
   │
   ├─── VALIDATION FAILS ──▶ error summary, focus to summary, in-page
   │                          links, NARRATIVE PRESERVED VERBATIM
   │                          → back to form
   │
   ├─── EITHER SYSTEM DOWN PRE-FLIGHT ──▶ refused BEFORE any write
   │       "eApp isn't responding right now, so nothing was changed."
   │       (the action was already disabled — see Flow 2)
   │
   ▼  orchestration: authorize BOTH → validate → verify relationship →
   │  pre-flight health → reconciliation row → PVQ leg → eApp leg
   │
[SCR-20 Dual-system confirmation]
   │
   ├── BOTH LEGS COMMITTED ──▶ ✓ "Resolution complete"
   │      ┌──────────┬──────────────────┬─────────────────────┬─────────┐
   │      │ System   │ What we asked for│ What it reports NOW │ Outcome │
   │      │ ▣ PVQ    │ Resolve as       │ Resolved —          │ ✓       │
   │      │          │ Substantiated    │ Substantiated       │ Updated │
   │      │ ▣ eApp   │ Clear ISS-2207   │ No outstanding      │ ✓       │
   │      │          │                  │ issues              │ Updated │
   │      └──────────┴──────────────────┴─────────────────────┴─────────┘
   │        ↑ values RE-READ from each spoke, not what the hub intended
   │
   └── eApp LEG FAILED ──▶ ! "Partly completed"    ← word "success" ABSENT
          PVQ ✓ Updated  ·  eApp ✕ Not updated (1 outstanding issue)
          "we're retrying automatically"  [ Retry eApp update ]
          → SCR-15 shows advisory, still says "1 outstanding issue"
            because THAT IS GENUINELY eApp's STATE. UI never fakes convergence.
   │
   ▼  three real destinations + the audit link
   ├── "View the updated issue in PVQ" ──▶ SCR-16, re-read from PVQ
   ├── "Return to eApp Case A-1042"    ──▶ SCR-15, re-read, "No outstanding issues"
   ├── "Back to work queue"            ──▶ SCR-13, ORIGINAL filters/sort/page
   └── "View audit trail for this action" ──▶ SCR-34 chain view
          ┌────────────────────────────────────────────────────────┐
          │ "Investigator Marcus Vale resolved PVQ issue ISS-2207  │
          │  against eApp case A-1042 on 2026-09-15.               │
          │  Both systems updated."                                │
          │  1 WORK_ITEM_VIEWED        ▣ eApp                      │
          │  2 RELATED_ITEMS_RESOLVED  HUB                         │
          │  3 RELATED_ITEM_TRAVERSED  HUB    ← the path, not just │
          │  4 WORK_ITEM_VIEWED        ▣ PVQ     the endpoints     │
          │  5 ORCHESTRATION_STARTED   HUB                         │
          │  6 ISSUE_RESOLVED          ▣ PVQ  status: Open →       │
          │                                   Resolved—Substantiated│
          │  7 CASE_ISSUE_CLEARED      ▣ eApp outstanding: 1 → 0   │
          │  8 ORCHESTRATION_COMPLETED HUB                         │
          │  ── all eight share ONE correlationId ──               │
          └────────────────────────────────────────────────────────┘
```

#### Steps

| # | Step | Screen | UI elements | Design obligation |
|---|---|---|---|---|
| 1 | Orient | SCR-09 | "Newly raised PVQ issues" `usa-card` widget | The exception is **announced**, not discovered. Links directly into the item that produced it (F15) |
| 2 | Enter the work | SCR-13 | `usa-table`, source badges, default chips | Case appears on page 1 **without filtering**. Next action ≤2 clicks from sign-in |
| 3 | Open the case | SCR-15 | Row link, `returnTo` | Same chrome, no discontinuity — "I didn't go anywhere" |
| 4 | Read the answer | SCR-15 | `usa-accordion` section, anchor `#SECTION_13A` | The flagged answer is rendered in the same view that links to the issue raised against it |
| 5 | **Discover the relationship** | SCR-15 | Related-items panel, grouped by relationship type | **The delight moment.** Relationship explained in *words*, sourced live from PVQ. Slow down here in the demo |
| 6 | **Traverse** | SCR-15 → SCR-16 | In-shell route change, breadcrumb grows | **The highest-risk step.** Any prompt, tab, or interstitial and the persona stops believing the product |
| 7 | Resolve | SCR-16 | `usa-fieldset` radios + `usa-textarea` + gate checkbox | Most consequential write in the product. Must never fail silently or lose typed text |
| 8 | **See both systems answer** | SCR-20 | Per-system read-back table | **Peak trust.** Each spoke's *own* answer, provable by independent API call |
| 9 | Verify on the case | SCR-15 | Re-read, "No outstanding issues" | Not cached — proves the parent state changed |
| 10 | Leave the record | SCR-34 | Chain view, one correlation ID | "One story, not four rows" |

#### Decision point — disposition drives which systems are written

The dual write is **disposition-driven, not a blanket rule** — designed so the demo can show both a clearing and a non-clearing path (FR-F07a-04 rule 5):

| Disposition | PVQ result | eApp result | `targetSystems` | Dual-system notice shown? |
|---|---|---|---|---|
| **Substantiated** *(flagship demo path)* | `RESOLVED_SUBSTANTIATED` | outstanding −1; if 0 → `REVIEW_COMPLETE_PENDING_ADJUDICATION` | PVQ, EAPP | ✓ "This updates PVQ and eApp." |
| Unsubstantiated | `RESOLVED_UNSUBSTANTIATED` | outstanding −1, same rule | PVQ, EAPP | ✓ |
| Resolved with clarification | `RESOLVED_WITH_CLARIFICATION` | outstanding −1, same rule | PVQ, EAPP | ✓ |
| **Referred for further review** | `REFERRED` | **unchanged** | PVQ only | ✗ — notice reads "This updates PVQ." |

The notice text updates **live as the radio selection changes**, so the user always knows the blast radius before submitting.

#### Failure and alternate paths

| Condition | What the user sees | Recovery |
|---|---|---|
| **PVQ committed, eApp failed** | SCR-20 in **partial** state. `<h1>` "Partly completed". Per-system table shows one ✓ and one ✕. **"Success" appears nowhere.** Correlation ID + `[Retry eApp update]` | Auto-retry (5s/15s/45s/135s); manual retry available; converges without user action |
| PVQ failed (leg 1) | Error on **SCR-16, not SCR-20** — there is no dual outcome to confirm. "PVQ isn't responding right now, so nothing was changed." | "Try again". eApp verified untouched |
| PVQ timeout, outcome unknown | `UPSTREAM_INDETERMINATE`: "We're not sure whether PVQ recorded your resolution. Refresh this issue to check its status before trying again." | The **only** permitted ambiguity, and it says so explicitly |
| Either system DOWN before submit | Action **pre-emptively disabled** with named reason. Never allowed to fail mid-submission | Auto re-enables on recovery, announced politely, no reload |
| Validation failure | Error summary, focus moved, in-page links, **narrative preserved verbatim** | Fix the named field, resubmit |
| Session timeout mid-narrative | SCR-06 modal, countdown, "Stay signed in" — **entered data not discarded** | Extend in place; or re-auth returns via `returnTo` |
| `ISS-2207` already resolved | Banner on SCR-16: "This issue was already resolved by {actor} on {date}. No further action is needed." Form disabled with that reason; action **absent** because the server computes it unavailable | Run reset, or drive on the second seeded open issue |
| Issue references a non-existent case *(seeded orphan)* | Related panel: "This related item couldn't be confirmed. We've logged the problem — reference {id}." **Not a broken link, not a stack trace** | Documented seed condition — makes mismatch handling demonstrable |
| Subject mismatch between systems | Same "couldn't be confirmed" state; `INTEGRATION_REFERENCE_MISMATCH` logged. **The hub never displays a relationship it cannot corroborate** | Administrator sees it in the issue log |
| Direct URL to another investigator's case | SCR-30 access denied, non-enumerable, correlation ID, exits to dashboard and queue; denial audited | Return to own queue |
| Client submits a `parentCaseId` for a different case | `RELATIONSHIP_MISMATCH` — **the client does not get to tell the server which case to update** | Refresh and retry |

#### Exit criteria (the acceptance contract)

- Completes end-to-end in **under three minutes**, manually, from the demo script (SM-01).
- **Exactly one** authentication event in the audit log (SM-02).
- **Zero** manual re-entry of subject, case, or issue identifiers (SM-04).
- `GET {pvq}/issues/ISS-2207` and `GET {eapp}/cases/CASE-A-1042`, called **directly against the spokes**, both return updated state (SM-03).
- Retrievable as a **single correlated chain** of ≥5 records (SM-20).
- Returning to the queue restores prior filters, sort, and page.
- Completed **keyboard-only** in a separate verification pass (SM-08 / US-069).
- **Zero serious or critical** accessibility violations on SCR-13, 15, 16, 20 (SM-07).
- Demo banner present on every screen visited (NFR-13).

#### Accessibility notes

> This is the accessibility pass that matters most, because it is the path a reviewer will watch. **Keyboard-only and screen-reader completable, start to finish.**

- **Queue table (step 2):** `<caption>` with live result count, `<th scope="col">`, `scope="row"` on title. Sortable headers announce sort state. Filter and pagination changes announce result count. Without this the queue is unusable non-visually.
- **The traversal (step 6) is the highest-risk accessibility step in the product.** It **must** produce a descriptive `document.title` change and place focus on the new `<h1>`. If focus drops to document top or lands on a detached element, a screen-reader user loses **precisely the continuity this product claims to deliver**. Verified explicitly, not assumed.
- **Source attribution** (`eApp`, `PVQ`, `PDT`, `IM`) is in the **accessible name** of every row, panel, and breadcrumb segment — never a coloured badge alone (NFR-02).
- **Related-items panel** is a `<section aria-labelledby>` containing an accessible **list**, not a bare set of links. Groups carry a heading and a count per relationship type.
- **Resolution form (step 7):** `<fieldset>`/`<legend>` around the disposition radios; hint text per option via `aria-describedby`; required indicated by the **text** "required"; character counter announced at 90% and 100% only; inline errors + error summary with focus management and in-page links.
- **Dual-system confirmation (step 8):** announced `aria-live="polite"` **and focus moved deliberately to the alert** — this is a result the user is waiting for. **Contrast with degraded warnings, which must never steal focus.** That asymmetry is intentional and must be preserved.
- **Confirmation table:** real `<table>`, `<caption>` "Results in each connected system", `scope` attributes, outcome as text + icon.
- **Status vocabulary** — open, resolved, overdue, blocked — distinguishable in **grayscale** by text and/or icon shape.
- **Focus return:** "Back to work queue" restores filters, sort, page **and returns focus to the row the user came from**.
- **Zoom and reflow:** usable at 200% zoom and at a **320px-equivalent half-width window** with no horizontal scrolling — Marcus routinely runs the browser beside a notes document (NFR-16).
- **Anchor navigation:** "View this section in the case" deep-links to `#SECTION_13A` and moves focus to that section's heading, with a text marker "Issue raised on this section."

---
### Flow 2: Monday-morning triage, and surviving a downed system

Two journeys sharing one screen (SCR-13). They are documented together because the **degraded** variant is only meaningful against the **healthy** variant — the whole design argument is that the user can tell them apart.

**User Stories:** US-040, US-042, US-043, US-045, US-046, US-047, US-048, US-049, US-098, US-126, US-127, US-129, US-132
**Features:** F5 (queue), F8 (registry fan-out), F12 (registration propagation), F16 (health/resilience)
**Personas:** PER-01 Marcus Vale (Investigator)
**Demo path:** Segment 3b (triage, observing CVS arrive) · ✅ Segment 2a (degradation, driven from the other window)

---

#### Flow 2a: Triage — one queue answers "what do I work next"

**Trigger:** Start of the working day; and again after every 10–60 minute interruption.
**Journey:** JRN-01.02

```
[SCR-01 → one sign-in over a mediocre VPN]
   ▼
[SCR-09 Investigator dashboard]
   │  "41 open · 4 overdue · 1 new issue"
   │  one composed answer to "what is mine, what is urgent, what changed"
   ▼  "View all work"
[SCR-13 Unified work queue — DEFAULT VIEW]
   │  ✓ assigned to me, due date ascending — applied WITHOUT configuration
   │  ✓ default filters shown as REMOVABLE CHIPS  ← a silently pre-filtered
   │                                                list is a lie about completeness
   │  28–34 items · ≥4 of 5 spokes · pagination exercised at 25/page
   │
   ├─ Narrow ──▶ add source filter + due-date range
   │     chips appear · URL updates · announced:
   │     "9 work items. Showing 1 to 9. 5 of 5 systems reporting."
   │
   ├─ Read a row and commit ──▶ scan source badges + status text
   │     ▣ PVQ · due Thursday · Elevated  ← "that's the one that blocks a case"
   │     normalized date and priority semantics ACROSS sources, so a
   │     sorted list cannot be wrong in a way he cannot see
   │     ▼
   │  [SCR-14/15/16 detail]  ── returnTo encodes filters+sort+page
   │     │
   │     ▼  "Back to work queue"
   │  ◀──┘ restores filters, sort, page AND FOCUS TO THE ORIGINATING ROW
   │
   ├─ INTERRUPTION (40 minutes) ──▶ returns via browser
   │     ✓ queue is exactly where he left it — state lives in the URL
   │     ✓ or SCR-06 timeout warning → extend → nothing lost
   │
   └─ A SIXTH SOURCE APPEARS  ← driven by Flow 5 in the other window
         registryVersion poll (≤30s) → entitlements invalidated
         ▣ CVS filter option appears · 4 CVS-badged rows appear
         announced POLITELY via live region — focus NOT stolen,
         content NOT reordered under the cursor
         ✓ NO sign-out.  NO reload.  NO restart.  (SM-12)
```

| # | Step | Screen / component | Design obligation |
|---|---|---|---|
| 1 | Take the temperature | SCR-09 widgets | Counts derive from the **same aggregation path** as the queue, so dashboard and queue can never disagree |
| 2 | Open the queue | SCR-13 default view | Answers the question **without configuration**; defaults visible as chips |
| 3 | Narrow | Filter rail + chips | Filtering is **server-side and scoped to the principal** — never a client-side filter over an over-fetched list |
| 4 | Commit | Row → detail | Resource-level authorization on open; queue context captured for the return trip |
| 5 | Return from interruption | URL state | **The delight moment for this persona** — worth more than any feature that looks better in a screenshot |
| 6 | Notice CVS arrive | Source filter + new rows | Registry-driven fan-out with **no special-casing anywhere in the hub** |

**Exit criteria:** ≥4 of 5 spokes correctly attributed (SM-14), rising to 6 after CVS registration · correct next item ≤2 clicks from dashboard · every filter facet returns ≥1 result on the default range · pagination exercised · return restores filters/sort/page · CVS items appear **without signing out or reloading** (SM-12).

---

#### Flow 2b: Keep working while Investigation Management is down

> **The product's answer to the worst failure mode in the problem space:** today, an empty list is indistinguishable from an outage — and *an empty list that might be a lie is worse than an error*.

**Trigger:** A spoke becomes unhealthy while the user has an open session — detected by the **background health monitor**, not by the user.
**Journey:** JRN-01.03 · driven from the other window by Flow 6b (failure injection)

```
        ┌─────────────────────────────────────────────────────────┐
        │ OTHER WINDOW: Administrator forces IM → UNAVAILABLE      │
        │ [SCR-38 Failure injection controls]                      │
        └───────────────────────┬─────────────────────────────────┘
                                │  health monitor: 2 consecutive failed probes
                                ▼
[SCR-13 Unified work queue — refreshed]
   │
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ ! Investigation Management is unavailable — 12 items are │
   │  │   not shown. The rest of your work is up to date.        │
   │  │            usa-site-alert--warning  role="status"        │
   │  │            announced ONCE · focus NOT moved              │
   │  └──────────────────────────────────────────────────────────┘
   │  caption: "Work items assigned to you — 29 results.
   │            4 of 5 systems reporting."   ← the total is NEVER
   │                                           presented as complete
   │  ▼ remaining four sources render FULLY and ACTIONABLY
   │
   │  ┌─ THE CRUCIAL DISTINCTION ──────────────────────────────┐
   │  │                                                        │
   │  │  DEGRADED (above)          vs.   EMPTY                 │
   │  │  "IM is unavailable —            "You have no assigned │
   │  │   12 items are not shown"         work right now."     │
   │  │  usa-site-alert--warning          usa-alert--info      │
   │  │  icon: warning  !                 icon: info  ⓘ        │
   │  │  data IS missing                  data is genuinely    │
   │  │                                   absent               │
   │  │  → different WORDING, different STRUCTURE, different   │
   │  │    ICON SHAPE. Legible in grayscale AND non-visually.  │
   │  └────────────────────────────────────────────────────────┘
   │
   ├─ Keep working ──▶ filter to eApp + PVQ, continue triaging
   │     one dead spoke NEVER stalls the aggregate request
   │
   ├─ Hit a blocked action ──▶ [SCR-14 detail, IM-targeted item]
   │     [ Update case status ] (disabled, removed from tab order)
   │     "Investigation Management isn't responding right now.
   │      Try again when it's back."   ← adjacent TEXT, aria-describedby
   │     ✓ told BEFORE typing three paragraphs, not after
   │
   ├─ Cross-check ──▶ same specific message on SCR-09 dashboard
   │     consistent degraded treatment wherever incomplete data appears
   │     ✗ NO error page.  ✗ NO blank screen.  ✗ NO stack trace. ANYWHERE.
   │
   ▼  RECOVERY — one successful probe (DOWN→HEALTHY needs only 1;
   │              HEALTHY→DOWN needs 2. Asymmetry is deliberate.)
   │
   │  warning replaced by a POLITE announcement + explicit control:
   │  "Investigation Management is available again.
   │   Refresh to see 12 more items."        [ Refresh ]
   │   ↑ does NOT silently reorder rows under the cursor
   │
   ▼  clear filter → all five sources → count reconciles → 41 again
      ✓ NO reload.  ✓ NO re-authentication.  ✓ NO admin action. (SM-17)
```

**Steps and system response**

| # | Step | What the user sees | System response |
|---|---|---|---|
| 1 | Refresh the queue | Fewer rows than expected | Fan-out returns **HTTP 200 with partial results** + per-source status list. A partial result is *a success with disclosure, not an error* |
| 2 | Read the warning | Named + quantified degraded banner | Count comes from `work_item_counts_cache`; **omitted rather than guessed** when unknown |
| 3 | Keep working | Four sources fully actionable | Circuit breaker opens so the hub stops hammering IM; remaining adapters answer at full speed |
| 4 | Hit a blocked action | Disabled control + plain reason | Server-computed action list marks IM-targeted actions unavailable **with a reason**; client renders them **disabled, not hidden**, so the capability stays legible |
| 5 | Cross-check | Same message on dashboard | Degraded state surfaced consistently; **no error page anywhere** |
| 6 | Recovery arrives | Polite announcement + Refresh | Half-open probing succeeds, circuit closes, polling delivers restored data to the **open session** |
| 7 | Resume | Counts reconcile | Full fan-out resumes; counts cache refreshed; result count announced |

**Failure and alternate paths**

| Condition | What the user sees | Recovery |
|---|---|---|
| **Two spokes down** | Both named in **one** alert with their own counts. The warning **composes** rather than collapsing into "something went wrong" | Unchanged behaviour |
| Spoke **slow** rather than dead | Widget/section loading states with accessible busy announcements; adapter times out at its bound and degrades to the named warning rather than hanging the page. Rows show inline **"Slow to respond"** | Page stays interactive throughout |
| Omitted count unknown | "Investigation Management is unavailable — **some** items are not shown." Number omitted, never guessed | Count returns on next successful fan-out |
| Spoke returns **but with errors** | Health reports `DEGRADED`, not healthy; warning persists with degraded wording; circuit reopens on repeated failure | Automatic; each failure class recorded |
| **All** sources down | Degraded state with an empty list — **never** an empty state, never a 500, never an error route: "We can't reach any connected systems right now. Your work will appear here automatically when they're back." + `[Try again]` | Automatic |
| Mid-form elsewhere when recovery lands | Live region announces; **focus is not moved; input is untouched** | Finishes the form, sees refreshed queue on return |
| Genuinely empty filter result | Designed empty state explaining what would appear + `[Clear all filters]` — **visibly and structurally different** from degraded | Clear or widen filters |

**Exit criteria**

- Remaining four sources render **fully and actionably** with a **specific named warning** (SM-15, SM-16).
- **No error page, blank screen, or stack trace anywhere in the application** during the outage (NFR-09).
- Actions targeting the unavailable spoke are **disabled with an explanation before submission**, not failed after it.
- Restoring the spoke clears the warning and restores data **without reload or re-authentication** (SM-17).
- The degraded warning is announced to assistive technology **without stealing focus**.
- One correctly attributed entry appears in the integration error log within one health-check interval.

**Accessibility notes**

- **Keyboard-only:** every control remains reachable during degradation. Disabled actions are **removed from the tab order** but their reason renders as **adjacent text** — so a keyboard user learns *why* rather than discovering an inert control.
- **Screen reader:** the degraded warning is delivered through `role="status"` **and is also present in the static page structure**, so a user arriving after the announcement still meets it by navigating headings and landmarks. Announcements **must not** move focus.
- The warning **names the application in text** — health and degraded states are never a red/green dot (NFR-02).
- Loading and busy states carry `aria-busy` and an accessible label; **a skeleton without semantics is a silent screen**.
- The **empty-vs-degraded distinction must be clear non-visually**: different wording, different structure — not merely a different icon colour.
- The degraded banner **must not consume the viewport or push the demo banner out of view** at 320px (NFR-13 vs NFR-16 — tested explicitly).
- Announcements are **debounced**: the 30-second health poll does **not** re-announce an already-displayed warning.

---
### Flow 3: Adjudication — assemble the cross-system picture, render a determination

**Trigger:** An item reaches the adjudicator's "Awaiting my determination" queue.
**User Stories:** US-017, US-019, US-034, US-038, US-050, US-055, US-056, US-057, US-068, US-124
**Features:** F2 (RBAC action sets), F4 (adjudicator dashboard), F6 (detail, related items, history), F13 (audit)
**Persona:** PER-02 Dana Okonkwo (Adjudicator)
**Demo path:** ✅ SECONDARY SCRIPTED DEMO — Segment 4 (zero trust, role-level)

```
[SCR-10 Adjudicator dashboard]           ← visibly DIFFERENT composition
   │  "Awaiting my determination"  · "Case status distribution" (as a TABLE)
   │  "Approaching determination deadlines" · "Returned for clarification"
   │  scope: ACROSS {organization} — stated in the widget heading,
   │         because adjudicator scope is org-wide, not assignee-based
   ▼
[SCR-13 Work queue — adjudicator default: statusCategory = In progress]
   ▼
[SCR-15 eApp case view — SAME SCREEN the investigator uses]
   │
   │  ╔═══════════════ THE RBAC DEMONSTRATION ═══════════════════════╗
   │  ║ Same work item. Same URL. Different server-computed action   ║
   │  ║ set. Nothing is hidden client-side — the server simply       ║
   │  ║ returns a different ActionDescriptor[].                      ║
   │  ║                                                              ║
   │  ║  INVESTIGATOR sees          │  ADJUDICATOR sees              ║
   │  ║  ─────────────────────────  │  ───────────────────────────── ║
   │  ║  [ Acknowledge assignment ] │  [ Adjudicate case ]  ← primary║
   │  ║  [ Request clarification ]  │  [ Return for clarification ]  ║
   │  ║  [ Record finding ]         │                                ║
   │  ║                             │  (no Record finding — omitted, ║
   │  ║                             │   not disabled: an action the  ║
   │  ║                             │   role may NEVER perform is    ║
   │  ║                             │   omitted entirely)            ║
   │  ╚══════════════════════════════════════════════════════════════╝
   │
   │  On the related PVQ issue (SCR-16), the contrast is sharper:
   │    INVESTIGATOR: [ Resolve issue ]      ← holds ISSUE.RESOLVE
   │    ADJUDICATOR:  (absent)               ← does NOT hold ISSUE.RESOLVE
   │                  [ Request clarification ]  ← holds that one
   │
   ▼  assemble the picture — WITHOUT leaving the shell
   │
   │  ╔═ Related items in other systems ═══════════════════════════╗
   │  ║  ▣ PVQ  ISS-2207 · Resolved — Substantiated                ║
   │  ║  ▣ PDT  PDT-0771 · Tier 5 designation · Approved           ║
   │  ║  ▣ IM   IM-3310  · Assignment · Closed                     ║
   │  ╚════════════════════════════════════════════════════════════╝
   │
   │  ╔═ Activity history — ONE chronology, not four merged by hand ═╗
   │  ║ 2026-09-15 15:04Z  Marcus Vale (Investigator)                ║
   │  ║   Resolved issue ISS-2207 — Substantiated                    ║
   │  ║   Recorded by PVQ          [01JD7K…  View audit chain →]     ║
   │  ║ 2026-09-15 15:04Z  Unified layer                             ║
   │  ║   Outstanding issues: 1 → 0                                  ║
   │  ║   Recorded by the unified layer                              ║
   │  ║ 2026-09-12 09:11Z  PVQ system                                ║
   │  ║   Issue raised against Section 13A                           ║
   │  ║   Recorded by PVQ                                            ║
   │  ╚══════════════════════════════════════════════════════════════╝
   │        ↑ spoke-native history MERGED with hub audit records;
   │          each row badged with its ORIGIN
   ▼
   ├── [ Adjudicate case ] ──▶ usa-modal confirmation ──▶ single-system
   │        write to eApp ──▶ confirmation naming what changed and where:
   │        "Case A-1042 adjudicated in eApp."
   │
   └── [ Return for clarification ] ──▶ form: required reason
            ──▶ writes to eApp, item reappears in the investigator's queue
            ──▶ and in the adjudicator's "Returned for clarification" widget
                when it comes back updated
```

#### Steps

| # | Step | Screen | Design obligation |
|---|---|---|---|
| 1 | See what awaits determination | SCR-10 | Composition differs from the Investigator's in **at least three widgets** — it is not a relabelled copy (US-034) |
| 2 | Read the status distribution | SCR-10 | Rendered as an **accessible data table**, not a chart-only presentation. Any chart **must** be accompanied by an equivalent table (US-114) |
| 3 | Open the case | SCR-15 | Org-scoped read (`ATTR-ADJ-01`), not assignee-scoped |
| 4 | See the different action set | SCR-15/16 action panel | **The zero-trust demonstration.** Server-computed; client renders what it is given |
| 5 | Assemble the cross-system picture | Related-items panel | Three relationship types resolved live through adapters — no joins |
| 6 | Read one history | Activity history | Spoke-native + hub audit merged into **one** chronology with origin badges |
| 7 | Decide, or refuse to decide | Action panel | See "refuse to decide" below |

#### The "refuse to decide on quietly missing data" path

> JRN-02.02's core insight: an adjudicator must never be shown a confident-looking picture that is silently incomplete.

```
[SCR-15 with PVQ unavailable]
   │
   │  ┌────────────────────────────────────────────────────────┐
   │  │ ! PVQ is unavailable — related issue items can't be     │
   │  │   shown for this case.                                  │
   │  └────────────────────────────────────────────────────────┘
   │
   │  Related items panel:
   │    ▣ PVQ  "PVQ isn't responding right now, so this related
   │            issue can't be opened."          ← NOT a broken link,
   │                                               NOT a silent omission
   │    ▣ PDT  PDT-0771 · Approved               ← still resolves
   │    ▣ IM   IM-3310  · Closed                 ← still resolves
   │
   │  Action panel:
   │    [ Adjudicate case ] (disabled)
   │    "Part of this case's record can't be loaded right now.
   │     Adjudicating on an incomplete picture isn't available
   │     until PVQ is back."
   │
   └──▶ The adjudicator is STOPPED, and told WHY. The design refuses
        to let a determination be rendered against data the product
        knows is missing. (US-038, US-124, US-129)
```

**This is the deliberate inverse of "degrade gracefully."** For read-only screens, partial data plus disclosure is correct. For a **consequential determination**, the product declines and explains. The distinction is encoded in `ActionDescriptor.enabled` + `disabledReason`, computed server-side — not a UI judgement call.

#### Failure and alternate paths

| Condition | What the adjudicator sees | Recovery |
|---|---|---|
| Attempts `ISSUE.RESOLVE` by direct API call | 403 `AUTHZ_DENIED`, "You don't have permission to do that." Denial **audited** with the failing `ruleId` | None — retrying will not help, and no retry is offered |
| Opens a case outside their organization | SCR-30, non-enumerable, identical to a non-existent case | Return to own queue |
| Case above clearance tier | SCR-30; audit record names `ATTR-ADJ-02` | — |
| Alerts could not be computed | Dashboard widget states so explicitly rather than showing a reassuring zero (US-124) | Automatic on recovery |
| Stale `stateVersion` (someone else acted) | `STATE_CONFLICT`: "This item changed since you opened it. Refresh to see the latest version, then try again." | Refresh, re-read, re-decide |

#### Exit criteria

- The adjudicator dashboard differs from the investigator dashboard in **≥3 widgets** (US-034).
- The **same** work item presents **different action sets** to Investigator and Adjudicator, demonstrable live (US-017, demo Segment 4).
- The status distribution is **readable as a table by a screen reader** (US-114).
- Activity history renders spoke and hub origins in one chronology with correlation links (US-056, US-068).
- A determination cannot be rendered while a contributing system's data is knowably missing (US-038).

#### Accessibility notes

- **Heading hierarchy:** `<h1>` case title → `<h2>` per region (Case summary, Questionnaire, Related items, Actions, Activity history) → `<h3>` per questionnaire section and per related-item group. Gap-free.
- **Status distribution table:** real `<table>` with `<caption>`, `<th scope="col">`, `scope="row"` on the status cell. If a chart is added, the table is the **primary** representation, not a hidden fallback.
- **Action panel:** omitted actions are genuinely absent from the DOM (not `display:none`), so a screen-reader user's experience matches the visual one. Disabled actions carry adjacent `disabledReason` text linked by `aria-describedby`.
- **Activity history:** `<ol>` in reverse-chronological order; each entry names actor, role at action, origin ("Recorded by PVQ" / "Recorded by the unified layer"), and absolute UTC timestamp **plus** relative time. Pagination via an accessible "Load more" that appends and announces "{n} more entries loaded."
- **Correlation link:** accessible name "View the full audit chain for this action" — not a bare ULID.
- **Modal confirmations** on `Adjudicate case` and `Return for clarification` trap focus, close on Escape, and restore focus to the invoking button.
- **Required reason field** on `Return for clarification` is labelled, `aria-describedby` hint, error summary on failure, content preserved.
- **320px:** the related-items panel and action panel stack below the case content; no horizontal scroll. The action panel remains reachable without scrolling past the entire questionnaire — it is anchored by an `usa-in-page-navigation` jump list on narrow viewports.

---
### Flow 4: Applicant — on a phone at lunch: where do I stand, what do I owe, do it now

> **This is the widest accessibility exposure in the product.** Applicants are the general public and the entire cleared workforce. The population includes screen-reader, keyboard-only, magnification, and cognitive/reading-disability users — **and users whose disability is directly relevant to what the vetting process is asking about**. A failure here is the one most likely to be noticed externally.

**Trigger:** Anxiety plus elapsed time. ~70% of this persona's sessions exist for the status question **alone**.
**User Stories:** US-004, US-015, US-018, US-035, US-044, US-049, US-057, US-107, US-112, US-113, US-116, US-117, US-122
**Features:** F0 (non-CAC auth), F2 (resource-level isolation), F4 (applicant dashboard), F6 (task completion), F15 (notices)
**Persona:** PER-03 Renée Ashford (Applicant) — `subjectRef = SUBJ-00622`
**Demo path:** Segment 5a — **show it on a narrow viewport**; the applicant surface is the one an evaluator is most likely to resize.

```
╔══ 320px — PHONE-FIRST. This is the primary design target, not a ══╗
║   responsive afterthought.                                        ║
╚═══════════════════════════════════════════════════════════════════╝

[SCR-01] → [SCR-04 username] → [SCR-05 demo code]
   │   NON-CAC path. She has no CAC, will never have one, and is not
   │   a government employee. A CAC-only applicant would be a domain
   │   error on screen.
   ▼
┌─────────────────────────────────┐  ← 320px
│ Demo — Synthetic Data Only.     │  units(4)   ← truncated lede
├─────────────────────────────────┤
│ ▣ An official website ▾         │  units(4)   ← usa-banner, CLOSED
├─────────────────────────────────┤
│ [DCSA]              [☰]         │  units(7)   ← compact header row
├─────────────────────────────────┤
│                                 │
│ Your security clearance         │  ← <h1>, FIRST content in <main>
│ application                     │     no breadcrumb above it
│                                 │
│ ┌─────────────────────────────┐ │
│ │ We have your application    │ │  ← THE ANSWER, ABOVE THE FOLD
│ │ and it is being reviewed.   │ │     ONE SENTENCE. NO JARGON.
│ │ Nothing is needed from you  │ │     usa-summary-box
│ │ on this right now.          │ │
│ └─────────────────────────────┘ │
│                                 │  ═══ FOLD (568px viewport) ═══
│ Where you are                   │
│  ✓ Submitted                    │  ← usa-step-indicator, VERTICAL
│  ● Under review  ← you are here │     current step marked IN TEXT
│  ○ Information requested        │     as well as visually
│  ○ Complete                     │
│                                 │
│ What you need to do (1)         │
│ ┌─────────────────────────────┐ │
│ │ Confirm your address        │ │
│ │ history for 2019–2021       │ │
│ │ Due Friday 18 September     │ │
│ │ If we don't hear from you   │ │  ← consequence stated in
│ │ by then, your application   │ │     PLAIN LANGUAGE
│ │ will pause.                 │ │
│ │ [ Start this task ]  ───────┼─┼──▶ SCR-18
│ └─────────────────────────────┘ │
│                                 │
│ Your notices (1 unread)         │
│  ● Interview scheduling ───────┼──▶ SCR-21 / SCR-18
│    12 September                 │
│                                 │
│ Your submission                 │
│  Reference AP-00622-1           │
│  Submitted 2 August 2026        │
│  [ View what I submitted ]      │
└─────────────────────────────────┘
```

#### The 320px chrome budget — a measured acceptance criterion

> ⚠ **RESOLVED TENSION: NFR-13 (banner always visible) vs SM-25 (status answer ≤30s, above the fold).** Resolved by the measured chrome budget now normative in FR-F03-03 rule 3a.

| Element | Budget at 320px | Mechanism |
|---|---|---|
| Demo banner | `units(4)` | Truncated to bold lede; full sentence remains in DOM for screen readers and the CI copy-scan |
| USWDS government banner | `units(4)` | `usa-banner` renders in **closed** accordion state |
| Header | `units(7)` | Wordmark + `usa-menu-btn` only; identity/role/timer move into the menu |
| **Total chrome** | **≤ `units(15)` (~120px)** | |
| `<h1>` + status sentence | Immediately follows | **No breadcrumb, no page-level alert region, no announcement region above them on SCR-11** |

**Acceptance:** on a 320×568 viewport, the status sentence is visible **without scrolling**. This is tested, not assumed.

#### Steps

| # | Step | Screen / component | Design obligation |
|---|---|---|---|
| 1 | Get in | SCR-04 → SCR-05, `usa-summary-box` with visible demo code | Non-CAC path; simulation labelled honestly; no "verified"/"validated" language |
| 2 | **Read where she stands** | SCR-11 `usa-summary-box` | **One sentence, above the fold, on 320px.** For 70% of her sessions this *is* the product. Everything else is secondary |
| 3 | Understand, not decode | Plain-language copy mapping | **Zero** internal system names, tier codes, or state abbreviations without explanation. "Pending SOI transmittal" is not a status — it is a barrier |
| 4 | See what she owes | "What you need to do" list | Ordered by due date; each task states the **consequence of not acting** in plain language |
| 5 | Read the notice | Notices region → SCR-21/SCR-18 | In-app, retained, with read/unread state — not an email she lost |
| 6 | Do the thing | SCR-18 task form | **Every task links directly to the action that discharges it.** No dead ends; "contact your security officer" is never a primary path (NFR-14) |
| 7 | Get a real confirmation | SCR-18 confirmation | Names **what was received AND what happens next** — a bare "Submitted" leaves her calling her security officer anyway |
| 8 | See it land | SCR-11 refreshed | The task is gone, the status line reflects the submission, the item appears in her history. **Her action visibly changed her status narrative** |

#### The boundary — what she must never see

```
SEEDED BUT INVISIBLE:
  • A PVQ issue raised against one of her own answers  (precondition P5)
  • Investigator narratives, issue internal notes, adjudication rationale
  • Any PDT designation, any IM case record, any other subject's anything

ENFORCEMENT (not a UI decision):
  • Every read is resource-level entitlement-checked against subjectRef
  • Scope predicate injected at the DATA LAYER — spokes apply it in their
    own query; the hub re-applies it after receiving results
  • Redacted fields are ABSENT FROM THE PAYLOAD, not hidden in the DOM
  • The UI does NOT render a "hidden content" placeholder that implies
    concealed material about her  (FR-F06-02 rule 3)

VISIBLE CONSEQUENCE: there is nothing on any applicant screen to inspect,
because there is nothing in the response to inspect. That asymmetry is a
deliberate access-control boundary, not an omission — and it is the setup
for the zero-trust curl demonstration (Segment 5b).
```

#### Failure and alternate paths

| Condition | What she sees | Recovery |
|---|---|---|
| **Session times out mid-form** | SCR-06 with countdown and an accessible re-auth path that **does not discard entered data**. Her sessions are short and interrupted — she *will* be timed out, and she will not start a personal-detail form a third time in one week | Re-authenticate and continue; nothing re-typed |
| Validation error on a personal-detail field | Inline error + error summary with focus management and in-page links. **Plain-language message, no field codes.** Entered content preserved | Fix the named field |
| She has nothing outstanding | Designed empty state: "You don't have anything to do right now. We'll let you know if that changes." — **never a blank panel**. Demonstrable via the seeded zero-item applicant persona | Session ends reassured |
| IEP unavailable | Named warning **without jargon**: "Some of your information isn't available right now. Please check back shortly." | Returns automatically on recovery; nothing she must do |
| She tries an investigator URL | SCR-30, non-enumerable, with exits to **her** dashboard; denial audited | Returns to her dashboard |
| A notice arrives while signed in | Announced via live region **without stealing focus**, with unread state | She reads it when ready |
| Another subject's resource ID, by URL or curl | 403, **identical in body and timing** to a request for a non-existent record. Denial visible in the audit trail | — (this is Segment 5b's demonstration) |

#### Exit criteria

- She answers **"where am I in this process"** within **30 seconds of signing in, on a 320px viewport, without scrolling past a fold of jargon** (SM-25, NFR-16).
- **Zero** internal system names, tier codes, or state abbreviations without plain-language explanation.
- **100%** of outstanding tasks link directly to the action that discharges them (SM-06, NFR-14).
- A submission produces a confirmation naming **what was received and what happens next**, then appears in her own history.
- Her dashboard is **visibly and substantively different** from the three mission dashboards (SM-23).
- **No applicant screen** exposes investigative content, investigator identity, PVQ issues, PDT designations, or IM records.

#### Accessibility notes

- **Plain language is an accessibility requirement, not a tone preference.** Short sentences, defined terms, no unexplained acronyms, one explicit next action. **Jargon is the failure mode here, not layout** — one unexplained acronym and she concludes the system is not for her.
- **Keyboard-only and screen-reader completable end to end**, including sign-in, task completion, and mark-as-read.
- **Heading hierarchy:** `<h1>` "Your security clearance application" → `<h2>` per widget ("Where you are", "What you need to do", "Your notices", "Your submission"). Gap-free. The `<h1>` is the **first** thing in `<main>`.
- **Landmarks:** skip link → demo banner → gov banner → `banner` → `nav[Primary]` → `main` → `contentinfo`. The skip link is the first focusable element and moves focus to `<main>` (US-112).
- **Step indicator:** `usa-step-indicator` conveys progress by **text and structure**, not a colour-coded graphic. Current step carries `aria-current="step"` **and** the visible words "you are here" (NFR-02).
- **Forms:** programmatically associated labels (never a placeholder as a label); `aria-describedby` hint text for anything ambiguous; required indicated by the **text** "required", not colour or asterisk alone; inline errors with `aria-invalid="true"`; error summary with focus management. She is entering personal detail she may find uncomfortable to disclose — a confusing validation error compounds that.
- **Touch targets ≥ 44×44 CSS px**, with adequate spacing. Task cards are fully tappable, not just the button.
- **320px, no horizontal scroll; 200% zoom, no clipping or overlap.** Content reflows; nothing requires two-dimensional scrolling.
- **Live regions without focus theft** for arriving notices and async status updates (US-115).
- **Reduced motion:** `prefers-reduced-motion: reduce` disables skeleton shimmer and all transitions.
- **No hover-only content.** Any tooltip content is available on focus and is never the sole source of essential information.
- **Timing:** no time limit other than the session timeout; extending preserves entered form data (US-117).

---
### Flow 5: Register the sixth application live — extensibility as an observable event

> The feature that turns "extensible" from an assertion into something a reviewer watches happen. Registration is a **configuration action**: no code change, no redeploy, no restart.

**Trigger:** A new mission application ("Continuous Vetting Service", `CVS`) needs onboarding. It ships **running but unregistered** — its absence from navigation, queue, and console before registration is itself part of the demonstration.
**User Stories:** US-070, US-094, US-095, US-096, US-097, US-098, US-099, US-100
**Features:** F8 (registry), F12 (registration), F11 (console), F16 (health)
**Persona:** PER-04 Priya Raghunathan (Administrator)
**Demo path:** ✅ SECONDARY SCRIPTED DEMO — Segment 3a. Target: **under 5 minutes, live** (SM-11). Paired with Flow 2a in the other window.

```
BEFORE: CVS appears NOWHERE in the UI. Not in nav, not in the queue,
        not in the console, not in health monitoring. Verified on screen.

[SCR-12 Administrator dashboard]
   │  "Connected applications: 5 registered · 5 enabled · 0 disabled"
   ▼
[SCR-22 Connected applications]
   │  usa-table — 5 rows: eApp, IEP, PVQ, PDT, IM
   │  [ Register an application ]  ← primary usa-button
   ▼
[SCR-28 Application registration — usa-step-indicator, 5 steps]

  ┌─ Step 1 of 5 · Identity ────────────────────────────────────┐
  │ Display name    [ Continuous Vetting Service        ]        │
  │ Application ID  [ CVS                               ]        │
  │   ^[A-Z][A-Z0-9_]{1,15}$ · unique INCLUDING de-registered   │
  │      IDs, because audit records refer to them               │
  │ Description     [ ...                               ]        │
  │ Icon            [ visibility ▾ ]  ← token picker, NOT a      │
  │                                     colour picker           │
  │ [?] What does an application need to support? → onboarding   │
  │                                                  docs        │
  │                                          [ Continue ]        │
  └──────────────────────────────────────────────────────────────┘
           │
  ┌─ Step 2 of 5 · Connection ──────────────────────────────────┐
  │ Base endpoint    [ http://cvs:8086                  ]        │
  │ Health endpoint  [ /health                          ]        │
  │ Adapter type     [ rest-generic-v1 ▾ ]                       │
  │ ▸ Resilience policy (usa-accordion, ALL PRE-FILLED)          │
  │   timeoutMs 5000 · actionTimeoutMs 10000 · maxRetries 2      │
  │   backoff 250ms ×2.0 · circuit 5 failures / 30000ms          │
  │   healthProbeIntervalSec 30                                  │
  │                                [ Back ]  [ Continue ]        │
  └──────────────────────────────────────────────────────────────┘
           │
  ┌─ Step 3 of 5 · Test connection ─────────────────────────────┐
  │              ← LIVE. Calls healthCheck() then describe().    │
  │                Nothing is persisted.                         │
  │ [ Run connection test ]                                      │
  │                                                              │
  │ ✓ Reachable at http://cvs:8086            42 ms              │
  │ ✓ Health check responded                  HEALTHY            │
  │ ✓ Capability description received                            │
  │ ✓ Integration version supported           v1                 │
  │ ✓ Work-item types declared                1                  │
  │ ✓ Actions declared                        3                  │
  │ ✓ Permissions valid                                          │
  │        announced: "Connection test complete. 7 of 7 passed."  │
  │                                [ Back ]  [ Continue ]        │
  │                                                              │
  │  ── BRANCHES ──────────────────────────────────────────────  │
  │  PASS      → Continue ENABLED                                │
  │  WARNING   → Continue enabled only after explicit            │
  │              [x] "I understand and want to register this     │
  │                   application anyway."                       │
  │  FAIL      → Continue DISABLED + reason + [ Test again ]     │
  │              Registration is NOT POSSIBLE until it passes.   │
  │              A broken registration is caught in the FORM,    │
  │              not discovered by users.                        │
  └──────────────────────────────────────────────────────────────┘
           │
  ┌─ Step 4 of 5 · Capabilities (AUTO-DISCOVERED) ──────────────┐
  │ Work-item types                     "Reported by the         │
  │  ▸ CVS_ALERT — "Continuous vetting alert"   application"     │
  │      contentProfile: alert-summary                           │
  │      Status map (editable table):                            │
  │        NEW           → Open                                  │
  │        UNDER_REVIEW  → In progress                           │
  │        CLEARED       → Closed                                │
  │        ESCALATED     → Blocked                               │
  │      ← an INCOMPLETE map BLOCKS progression, listing the     │
  │        unmapped values by name                               │
  │ Actions                                                      │
  │  [x] ACKNOWLEDGE_ALERT   [x] CLEAR_ALERT   [x] ESCALATE_ALERT│
  │                                                              │
  │ ⓘ Only capabilities the application reports can be           │
  │   registered.  ← may REMOVE, may NOT INVENT. Inventing would │
  │                  register capabilities the adapter cannot    │
  │                  deliver — exactly the dead controls the     │
  │                  product forbids.                            │
  │                                [ Back ]  [ Continue ]        │
  └──────────────────────────────────────────────────────────────┘
           │
  ┌─ Step 5 of 5 · Access & review ─────────────────────────────┐
  │ Visible to roles (required, NONE pre-selected)               │
  │  [x] Investigator  [ ] Adjudicator  [ ] Applicant  [ ] Admin │
  │                                                              │
  │ ── Review every value, with [Edit] per step ──               │
  │                                                              │
  │ ⚠ Continuous Vetting Service will become visible to          │
  │   Investigator and its work items will appear in their       │
  │   work queues immediately.                                   │
  │                                                              │
  │                    [ Back ]  [ Register application ]        │
  └──────────────────────────────────────────────────────────────┘
           ▼
[SCR-23 Application detail — CVS]
   │  ✓ usa-alert--success, focus moved to it
   │    "Continuous Vetting Service is registered. Health checks
   │     have started."
   │
   ▼  PROPAGATION — all of it, within 30 seconds, NO RESTART:
      • SCR-22 inventory        → 6 rows
      • SCR-24 health           → first probe issued IMMEDIATELY
      • role-scoped navigation  → for every role in visibleToRoles
      • work-queue fan-out      → CVS included
      • search fan-out          → if supportsSearch
      • related-item resolution → CVS is a valid target system
      • APPLICATION_REGISTERED audit record

        ┌─────────────────────────────────────────────────────┐
        │ OTHER WINDOW — Flow 2a, investigator ALREADY SIGNED  │
        │ IN, never signed out:                               │
        │   registryVersion poll (≤30s)                        │
        │   → ▣ CVS appears in the source filter               │
        │   → 4 CVS-badged rows appear in his queue            │
        │   → announced POLITELY, focus not stolen             │
        │ THE DEMO ASSERTION: zero code changes, zero restarts │
        └─────────────────────────────────────────────────────┘
```

#### Steps

| # | Step | Screen | Design obligation |
|---|---|---|---|
| 1 | Open the inventory | SCR-22 | Five rows; CVS **visibly absent** — the "before" state is part of the proof |
| 2 | Identity | SCR-28 step 1 | `applicationId` uniqueness includes de-registered IDs; onboarding docs linked **where they are needed** |
| 3 | Connection | SCR-28 step 2 | Every resilience value pre-filled with a sane default, editable, bounded |
| 4 | **Test connection** | SCR-28 step 3 | **Live call before submission.** Fail blocks progression entirely |
| 5 | Capabilities | SCR-28 step 4 | Auto-discovered from `describe()`, marked "Reported by the application" |
| 6 | Access & review | SCR-28 step 5 | Roles required, **none pre-selected**; consequences restated before submit |
| 7 | Submit | → SCR-23 | Registry row + `registryVersion` bump + immediate probe + audit |
| 8 | Observe propagation | SCR-22/24 + other window | The visible consequence that makes registration **real** rather than administrative |

#### Failure and alternate paths

| Condition | What the administrator sees | Recovery |
|---|---|---|
| Application not running | **Fail:** "We couldn't reach that application at {endpoint}. Check that it's running and the address is correct." Continue disabled | Start it, `[Test again]` |
| Health timeout | **Fail:** "The application didn't respond within {n} ms. Check the address, or increase the health check timeout." | Adjust step 2, re-test |
| `describe()` missing/malformed | **Fail:** "The application responded, but didn't describe what it can do in a format we understand." | — |
| Contract version unsupported | **Fail:** "This application uses integration version {v}, which we don't support yet. Supported: {list}." | — |
| Unknown required permission | **Fail:** "This application asks for permissions this system doesn't have: {list}." | — |
| Health `DEGRADED` | **Warning:** "The application responded slowly ({n} ms). You can register it, but users may see delays." | Acknowledge checkbox → Continue |
| Zero work-item types | **Warning:** "This application doesn't provide any work items. It will appear in the admin console but not in users' work queues." | Acknowledge → Continue. Review step restates it plainly |
| Duplicate `applicationId` | Field error: "That application ID is already in use. Choose a different one." — **specific, not generic** | Change the ID |
| Duplicate display name | "Another application already uses that name. Choose a different one." | — |
| Incomplete status map | Blocks step 4: "Map every status this application can report. **Unmapped: {list}.**" | Complete the map |
| Draft expired (>60 min) | "Your registration draft expired. Start again — your entries weren't saved." | Restart |
| Submitted with a stale test (>10 min) | Test **re-runs automatically** before submission | — |
| Submitted with no test | `CONNECTION_TEST_REQUIRED`: "Test the connection before you register this application." | Go to step 3 |
| Attempt to change `applicationId` in edit mode | Read-only with explanation: "The application ID can't be changed because existing records refer to it." | — |

#### De-registration (the inverse proof)

```
[SCR-23] ▸ [ De-register ]  ──▶ usa-modal
   │  "This removes Continuous Vetting Service from navigation, the work
   │   queue, search, and health monitoring for all users.
   │   4 work items will stop appearing.
   │   Audit records that mention Continuous Vetting Service are kept."
   │
   │  Type the display name to confirm: [ ___________________ ]
   │  Reason (10–500 chars, required):  [ ___________________ ]
   │                              [ Cancel ]  [ De-register ]
   ▼
   Registry row removed · registryVersion bumped · probing stopped ·
   dropped from EVERY surface — with NO code change and NO errors
   anywhere.  Audit records naming CVS remain READABLE, using the
   STORED display name rather than a lookup, so history stays legible
   after removal.
```

#### Exit criteria

- An administrator completes CVS registration in **under 5 minutes** during a live demo (SM-11).
- The form is completable **using only the keyboard** (US-094).
- Full propagation within **30 seconds** of submission (SM-12).
- A signed-in investigator's navigation and queue update **without re-authentication or reload**.
- Removing an application from the registry removes it cleanly from navigation, queue, search, and console with **no code change and no errors** (PRD F8 acceptance signal).
- Reset returns CVS to unregistered, and the demo **repeats identically** (SM-22).
- **Zero special-casing of CVS anywhere in the hub** — which is the entire point.

#### Accessibility notes

- **Step indicator:** `usa-step-indicator` with `aria-current="step"` on the active step **and** a text counter "Step 3 of 5" — progress is never conveyed by segment colour alone.
- **Heading hierarchy:** `<h1>` "Register an application" (constant across steps) → `<h2>` per step name → `<h3>` per fieldset group. The `<h1>` does **not** change per step; the step name does, so screen-reader users get a stable page identity plus a changing sub-heading.
- **Per-step validation:** each "Continue" validates; failure renders an error summary at the top with `role="alert"`, **focus moved to it**, and in-page links to offending fields.
- **Form state survives** refresh and session extension via a server-side draft — a 5-step form lost to a timeout is a demo-killer.
- **Back navigation preserves entered values**; the step indicator allows returning to any **completed** step (and only completed steps are interactive).
- **Connection-test results** render as a `usa-icon-list` checklist with **text status per check** (pass/fail/warning) plus icon — never a colour-only row. Announced once via polite live region: "Connection test complete. 7 of 7 checks passed."
- **Disabled "Continue"** on a failing test is removed from the tab order, with the blocking reason rendered as **adjacent text** linked by `aria-describedby`.
- **Status-map table** (step 4) is a real `<table>` with `<caption>`, `scope="col"`, and `scope="row"` on the native-status cell; editable cells are labelled `usa-select` controls, not bare inputs.
- **Icon picker** offers icons by **name and shape preview**, with accessible names — it is a token picker, so there is no colour dependency.
- **Destructive confirmation modal** traps focus, closes on Escape, restores focus to the invoking control. Typed-name confirmation field is labelled and its mismatch error is specific: "The name you typed doesn't match. Type {displayName} exactly to confirm."
- **320px:** steps stack vertically; the step indicator collapses to "Step 3 of 5" text plus the current step label; the review table reflows to stacked definition lists.

---
### Flow 6: Administrator — triage an integration failure, and rehearse degradation on purpose

Two administrator flows sharing the console. 6a is **accountability** (demo Segment 6); 6b is the **driver** for the resilience demonstration (Segment 2b).

**User Stories:** US-086, US-087, US-088, US-089, US-090, US-093, US-103, US-104, US-105, US-106, US-125, US-131, US-143
**Features:** F11 (console), F13 (audit), F16 (health, failure injection)
**Persona:** PER-04 Priya Raghunathan (Administrator)

---

#### Flow 6a: Health view → integration issue → correlation ID → audit chain → contain

**Trigger:** A user reports "my queue looks short," or the administrator sees an unhealthy application on the dashboard.
**Journey:** JRN-04.02 · Demo path: Segment 6 — **accountability**

```
[SCR-12 Administrator dashboard]
   │  "System health"        ✓ 4 healthy  ! 0 degraded  ✕ 1 unavailable
   │  "Integration issues (24h)"   14 · by error class
   ▼
[SCR-24 System health]
   │  ┌──────────────┬──────────┬───────────┬─────────┬──────────┬────────┐
   │  │ Application  │ Status   │ Last OK   │ Latency │ Failures │Circuit │
   │  ├──────────────┼──────────┼───────────┼─────────┼──────────┼────────┤
   │  │ ▣ eApp       │ ✓Healthy │ 15:04:02Z │ 38 ms   │ 0        │ Closed │
   │  │ ▣ IM         │ ✕Unavail │ 14:51:11Z │ —       │ 26       │ OPEN   │
   │  └──────────────┴──────────┴───────────┴─────────┴──────────┴────────┘
   │  [?] What do these states mean?  ← usa-accordion disclosure with the
   │                                    PRECISE definitions — a reviewer is
   │                                    never guessing what "degraded" means
   │  [ Check now ] per row → live probe, bypasses cache AND circuit
   ▼  row link
[SCR-25 Integration issues]
   │  default filter: last 24 hours, newest first
   │  "14 issues in the last 24 hours."
   │  ┌───────────┬──────┬───────────────┬──────────────┬─────────────────┐
   │  │ Timestamp │ App  │ Operation     │ Error class  │ Correlation ID  │
   │  ├───────────┼──────┼───────────────┼──────────────┼─────────────────┤
   │  │ 14:52:03Z │ ▣ IM │ listWorkItems │ TIMEOUT      │ 01JD7K2Q… →     │
   │  │ 14:52:03Z │ ▣ IM │ healthCheck   │ CONN_REFUSED │ 01JD7K2R… →     │
   │  └───────────┴──────┴───────────────┴──────────────┴─────────────────┘
   │   ↑ THIS is where technical detail lives — spoke HTTP status, escaped
   │     response excerpt (≤1000 chars), adapter requestId. The ONLY place
   │     it appears; it is suppressed from every user-facing message.
   │   ↑ Append-only. NO resolve/dismiss workflow — the log is EVIDENCE,
   │     not a ticket queue. The absence is deliberate.
   ▼  correlation ID link
[SCR-34 Audit record detail & chain view]
   │  ┌─────────────────────────────────────────────────────────────┐
   │  │ "Investigator Marcus Vale opened work item IM-3310 on        │
   │  │  2026-09-15. Investigation Management did not respond."      │
   │  │  1  WORK_ITEM_VIEWED       ▣ IM    FAILURE   +0ms            │
   │  │  2  ADAPTER_FAILURE        ▣ IM    FAILURE   +5002ms         │
   │  │  3  WORK_ITEM_VIEWED       HUB     SUCCESS   +5010ms         │
   │  │     (degraded state rendered)                                │
   │  └─────────────────────────────────────────────────────────────┘
   │  Links out: → affected work item  → application detail (SCR-23)
   │             → the integration issue sharing this correlation ID
   │
   │  ╔═══ ADMINISTRATORS ARE NOT EXEMPT ═══════════════════════════╗
   │  ║ Filter the audit viewer by actor = Priya Raghunathan and    ║
   │  ║ her OWN actions are there: FAILURE_INJECTED, APPLICATION_   ║
   │  ║ PROBED, AUDIT_VIEWED. Viewing the audit trail itself writes ║
   │  ║ an AUDIT_VIEWED record. The trail audits its own reading.   ║
   │  ╚═════════════════════════════════════════════════════════════╝
   ▼
[SCR-23 Application detail — IM]  ── contain
   │  Configuration · Capabilities · Status maps · Resilience policy ·
   │  Health history · Recent integration issues (20) · Provenance
   │  [ Test connection ]  [ Edit configuration ]  [ Disable ]
   │
   └── [ Disable ] ──▶ typed-name confirmation + reason
          "This removes Investigation Management from navigation, the
           work queue, and health monitoring for all users.
           12 work items will stop appearing."
          → change audited, reflected in user-facing nav within one poll
```

| # | Step | Screen | Design obligation |
|---|---|---|---|
| 1 | See health at a glance | SCR-12 / SCR-24 | Status is **text + icon**, never a red/green dot. Last-check timestamp shown so **staleness is visible** |
| 2 | Find the failures | SCR-25 | Every row links to its audit chain **and** its application detail — symptom to context in one click |
| 3 | Follow one correlation ID | SCR-34 | One ID resolves the entire cross-system chain, including elapsed time between steps |
| 4 | Confirm the platform is honest about itself | SCR-33 filtered | Administrator's own actions are in the trail |
| 5 | Contain | SCR-23 | Destructive actions require typed confirmation + reason, and **state their consequences with counts** |

**Failure and alternate paths**

| Condition | What she sees | Recovery |
|---|---|---|
| Health monitor itself not running | Warning alert on SCR-24: "Health monitoring isn't running. Statuses below may be out of date." — **an absent monitor must never masquerade as all-healthy** | Restart the monitor |
| No health data yet | "No health checks have run yet. The first check runs within {n} seconds." | Wait one interval |
| No issues in range | "No integration issues in this period. That's good news." | — |
| Application config invalid | Warning on SCR-23: "This application's configuration has a problem: {field} — {reason}. It won't appear for users until it's fixed." | Edit configuration |
| `ORCHESTRATION_INCOMPLETE` issue | Row links to the orchestration transaction **with a working manual retry** | Retry the outstanding leg |
| Audit integrity check fails | Error alert on SCR-33 naming the **first broken sequence number**: "Records may have been altered outside the application." | Escalate — this is the tamper-evidence working |
| Attempt to modify an audit record | 405: "Audit records can't be changed or deleted." No such endpoint exists | — |

---

#### Flow 6b: Rehearse degradation on purpose

**Trigger:** Demo rehearsal, or the live Segment 2 demonstration.
**Journey:** JRN-04.03 · Demo path: ✅ Segment 2b — **drives Flow 2b in the other window**

```
[SCR-37 Demo operations / service status]
   │  service readiness at a glance · reset command · demo-script links
   ▼
[SCR-38 Failure injection controls]
   │
   │  ┌──────────────────────────────────────────────────────────────┐
   │  │ ! Failure injection is a demonstration tool. Injected states │
   │  │   affect all users of this environment.                      │
   │  │                          usa-site-alert--warning, PROMINENT  │
   │  └──────────────────────────────────────────────────────────────┘
   │
   │  ┌──────────┬──────────────┬────────────────────────────────────┐
   │  │ App      │ Current      │ Set mode                           │
   │  ├──────────┼──────────────┼────────────────────────────────────┤
   │  │ ▣ eApp   │ Normal       │ (•)Normal ( )Unavail ( )Slow ( )Err│
   │  │ ▣ PVQ    │ Normal       │ (•)Normal ( )Unavail ( )Slow ( )Err│
   │  │ ▣ IM     │ ✕ Unavailable│ ( )Normal (•)Unavail ( )Slow ( )Err│
   │  │          │ auto-clears  │  duration [ 300 ] sec (10–1800)    │
   │  │          │ in 4:12      │                                    │
   │  └──────────┴──────────────┴────────────────────────────────────┘
   │  [ Clear all ]
   │
   │  Modes:  Unavailable → conn refused / 503 on data endpoints
   │          Slow(ms)    → artificial latency → demonstrates DEGRADED
   │          Error(%)    → proportion of calls return 500
   │          Normal      → clears injection
   │
   │  durationSec AUTO-CLEARS (default 300, max 1800), so a forgotten
   │  injection cannot silently break a later demo.
   ▼
   Active injection is surfaced on SCR-24 AND SCR-37, so no operator
   mistakes an INJECTED outage for a REAL one.
   Every change is audited: FAILURE_INJECTED / FAILURE_CLEARED.
   │
   ▼  ┌──────────────────────────────────────────────────────────┐
      │ OTHER WINDOW: Flow 2b — the investigator observes.        │
      │ Degradation named + quantified within one health interval.│
      │ Recovery on [Clear all] — no reload, no re-auth.          │
      └──────────────────────────────────────────────────────────┘
```

**Failure and alternate paths**

| Condition | What she sees | Recovery |
|---|---|---|
| Spoke won't accept injection | "We couldn't change {name}'s simulated state. Check that it's running." | Start the spoke |
| Out-of-bounds parameter | Field error per bounds (`slowMs` 100–30000, `errorRatePct` 1–100, `durationSec` 10–1800) | Correct the value |
| Injection forgotten | Auto-clears after `durationSec`; countdown visible in the table | Automatic |
| Reset command run | All injection state cleared; CVS returned to unregistered | Demo repeats identically (SM-22) |

#### Exit criteria (both flows)

- Inducing an adapter failure produces a **new, correctly attributed entry** in the integration log within one health-check interval (F11 acceptance signal).
- Each entry links to a **real audit chain** sharing its correlation ID.
- Forcing IM `UNAVAILABLE` produces the degraded queue, the dashboard notice, and disabled actions — **with no error page anywhere** (SM-15).
- Clearing injection restores normal behaviour **automatically** (SM-17).
- **Every** console action is authorized and audited — the console has no privileged bypass (US-093).
- An Investigator attempting any console route is **denied and audited** (US-020).

#### Accessibility notes

- **Console shell:** `ConsolePage` template — `usa-sidenav` sub-navigation with `aria-current="page"` plus a visible non-colour indicator; `<nav aria-label="Administrator console">` distinct from `<nav aria-label="Primary">`.
- **Heading hierarchy:** `<h1>` per console screen ("System health", "Integration issues") → `<h2>` per region → `<h3>` per expandable detail.
- **Health status:** text + distinct icon shape (`check_circle` / `warning` / `cancel`). A grayscale rendering retains all meaning. **Never a coloured dot.**
- **All console tables** use the same caption / `scope` / sortable-header / pagination pattern as the work queue, so the interaction is **learned once** (US-092).
- **Circuit state** (`Closed` / `Open` / `Half-open`) is text, with the state definitions available behind an accessible `usa-accordion` disclosure rather than a hover tooltip.
- **Correlation ID** rendered monospace and selectable with a copy control announcing "Reference copied," and linked to the chain view with the accessible name "View the full audit chain for this action."
- **Live probe results** ("Check now", "Test connection") announced politely once: "Connection test complete. {System} is healthy, responded in {n} milliseconds." Never a silent spinner.
- **Failure-injection radios** are grouped in a `<fieldset>` with a `<legend>` naming the application — so a screen-reader user knows which application a radio group controls without inferring it from table position.
- **Auto-clear countdown** is rendered as text and is **not** a per-second live region; it updates silently and is announced only on expiry.
- **Destructive confirmations** (Disable, De-register) trap focus, require typed confirmation, state consequences with counts, and restore focus on close.
- **320px:** console tables reflow to stacked cards per the `Y1-responsive` table-reflow pattern; the sidenav collapses into the primary menu button and remains fully reachable.

---
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
### Screen: SCR-08 — Global application shell

**Purpose:** The persistent frame every authenticated screen lives inside. This is what makes five systems read as one product, and it is where the "every button works" promise is kept or broken.
**User Stories:** US-012, US-013, US-026, US-027, US-028, US-029, US-030, US-032, US-112 · **Features:** F3, F1, F2, F14
**Owning FR:** FR-F03-01 … FR-F03-07

#### Layout — desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ▸ Skip to main content                          ← FIRST focusable element,   │
│                                                   visible on focus,          │
│                                                   moves focus to <main>      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Demo — Synthetic Data Only. This prototype contains no real DCSA data, no    │  ◀ usa-site-alert--info --slim
│ real personal information, and no connection to any government system.       │    data-permanent="true"
│                                                                              │    NO close control · NO hidden path
├──────────────────────────────────────────────────────────────────────────────┤    NO state toggle · NO feature flag
│ ▣ An official website of the United States government        Here's how ▾    │  ◀ usa-banner
├──────────────────────────────────────────────────────────────────────────────┤
│ <header role="banner">                                                       │
│ ┌──────────────┐                                    ┌───────────────────────┐│
│ │ [DCSA seal]  │  DCSA Unified Layer                │ 🔍 [Search work...  ] ││  ◀ usa-search
│ │  wordmark    │                                    └───────────────────────┘│    (→ SCR-35)
│ │  ASSET SLOT  │                                                             │
│ └──────────────┘                          Signed in as Marcus Vale           │
│                                           [Investigator] via CAC/PIV         │  ◀ role badge = usa-tag
│                                           (simulated) · 27:14 remaining      │    method label · session timer
│                                           [🔔 3]  [ Account ▾ ]              │  ◀ alert count (text+number)
├──────────────────────────────────────────────────────────────────────────────┤
│ <nav aria-label="Primary">                                                   │
│  Dashboard │ Work Queue │ Notifications (3) │ My Activity                    │  ◀ usa-nav
│  ─────────                                                                   │    aria-current="page"
│  ↑ current: aria-current="page" + VISIBLE non-colour indicator (weight       │    + underline/weight
│    + underline). Never colour alone.                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ <nav aria-label="Breadcrumb">                                                │
│  Work Queue  ›  ▣ eApp  Case A-1042  ›  ▣ PVQ  Related Issue ISS-2207        │  ◀ usa-breadcrumb
│      ↑ link           ↑ link + badge         ↑ aria-current="page", text     │    CROSS-SYSTEM context
├──────────────────────────────────────────────────────────────────────────────┤
│ <main id="main-content">                                                     │
│                                                                              │
│   [ exactly one <h1> — the PAGE's own title, never the product name ]       │
│   [ page content, built on one of four templates ]                          │
│                                                                              │
│ </main>                                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ <footer role="contentinfo"> · usa-identifier                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ [DCSA seal]  Defense Counterintelligence and Security Agency          │   │
│  │              DEMONSTRATION PROTOTYPE — SYNTHETIC DATA ONLY            │   │
│  │                                                                       │   │
│  │  Accessibility statement · About this demo · Onboarding documentation │   │  ◀ SCR-36 reachable
│  │  Synthetic data only · No connection to any government system         │   │    from EVERY screen
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Document order (normative, FR-F03-01 rule 1)

```
skip link → demo banner → usa-banner → header[banner] → nav[Primary]
          → nav[Breadcrumb] → main#main-content → footer[contentinfo]
```

**Landmark rules:** exactly one `<header role="banner">`, one `<nav aria-label="Primary">`, one `<nav aria-label="Breadcrumb">`, one `<main>`, one `<footer role="contentinfo">`. Any additional nav carries a distinct `aria-label` (e.g. `aria-label="Administrator console"` on the console sidenav). **Exactly one `<h1>` per page**, and it is the page's own title.

#### Account menu

```
[ Account ▾ ]  ── usa-nav submenu, aria-expanded, Escape closes
   ├─ Switch role  ▸   ← ONLY when >1 role held, listing held roles
   │    ( ) Investigator  (•) Adjudicator
   │    → POST /api/session/active-role → entitlements refetched
   │    → nav re-renders → announced politely:
   │      "Role changed to Adjudicator. Your menu has been updated."
   │    ✓ NO re-authentication.  ONE ROLE_CONTEXT_SWITCHED audit record.
   ├─ Accessibility statement  → SCR-36
   └─ Sign out                 → SCR-07
```

#### Information hierarchy

| Priority | Content | Placement | Why here |
|---|---|---|---|
| **Primary** | Page content (`<main>`) | Centre | The work |
| **Primary** | Demo banner | Absolute top, permanent | Non-negotiable honesty invariant (NFR-13) |
| **Primary** | Primary navigation | Below header | Role-differentiated; the RBAC story in the chrome |
| **Secondary** | Breadcrumb | Directly above `<main>` | Cross-system context — the continuity proof made visible |
| **Secondary** | Identity + active role + session timer | Header right | "Who am I, in which role, how long do I have" (US-012) |
| **Secondary** | Global search | Header right | Scoped server-side to what the principal may see |
| Tertiary | Alert count | Header, text + number | Links to SCR-21 |
| Tertiary | Footer identity, accessibility statement | `usa-identifier` | Reachable from every screen incl. login |

#### States

| Region | State | Appearance | Feedback |
|---|---|---|---|
| **Navigation** | Ready | Role-appropriate items, all resolving to real pages | — |
| | **Entitlements failed** | Shell still renders with banner + header identity + inline `usa-alert--error` in the nav region | "We couldn't load your menu. Refresh the page — reference {correlationId}." **The user is never left with a bare page** |
| | Registry change | Nav item appears/disappears within one `registryVersion` poll (≤30s) | Polite announcement; **no reload, no restart** |
| | App DOWN | Nav item **still renders and still resolves** — the destination shows its degraded state | Never a broken link (FR-F03-04 rule 5) |
| **Session timer** | Ready | "27:14 remaining" | Updates silently, not a live region |
| | T−2:00 | → SCR-06 modal | Announced at open / 60s / 15s |
| **Alert count** | Ready | `🔔 3` with accessible name "3 unread notifications" | Polite announcement on change |
| | Zero | `🔔` with "No unread notifications" | Never hidden |
| | Uncomputable | Count replaced by "—" with adjacent text "Alerts couldn't be checked" | **Never shows a reassuring zero it cannot substantiate** (US-124) |
| **Breadcrumb** | Ready | Server-supplied `breadcrumbTrail` | — |
| | Missing trail | Minimal trail from the route table; client telemetry warning | Page still works |
| | Depth > 4 | Middle collapses behind accessible "Show full trail" disclosure | **Never a silent ellipsis** |
| **Demo banner** | **Always ready** | There is no other state. If banner rendering fails, **the page fails** — a page without the banner is not served | — |

#### Interactive elements

| Element | Component | Behaviour |
|---|---|---|
| Skip to main content | `usa-skipnav` | First focusable on every route; visible on focus; moves focus to `<main>` |
| Government banner toggle | `usa-banner` accordion | `aria-expanded`; collapsed by default |
| Wordmark | Link | → `/dashboard` |
| Global search | `usa-search` | → SCR-35. Min 2 chars after trim; below that: "Enter at least 2 characters to search." and **no request issued** |
| Primary nav items | `usa-nav` links | Server-generated from `entitlements.navigation`. Zero items without a route |
| Alert indicator | `usa-button--unstyled` + count | → SCR-21 |
| Account menu | `usa-nav` submenu | `aria-expanded`, arrow-key support, Escape closes and restores focus |
| Switch role | Radio group in submenu | Only held roles offered; an unheld role POST returns `ROLE_NOT_HELD` |
| Sign out | Button | `POST /api/auth/logout` → SCR-07 |
| Breadcrumb segments | `usa-breadcrumb` links | Non-final segments **restore prior state** (queue filters, case scroll position) |
| Footer links | `usa-identifier` | → SCR-36 and onboarding docs |

#### Responsive behaviour

```
< 640px  ── primary nav collapses to usa-menu-btn [☰]
            • aria-expanded on the button
            • focus TRAPPED while the menu is open
            • Escape closes AND restores focus to the button
            • identity, role, session timer, search, and account menu
              all move INTO the menu — NOTHING becomes unreachable
            • header compacts to a single units(7) row
            • demo banner truncates to its bold lede (full sentence
              remains in the DOM for screen readers and CI copy-scan)
            • usa-banner renders in CLOSED state
            → total chrome ≤ units(15) ≈ 120px   (see 00-overview)

640–1023px ── nav remains horizontal; identity block wraps under the
              wordmark; search collapses to an icon-triggered field

≥1024px   ── full layout as drawn above
```

**No horizontal scrolling at 320px on any route. Usable at 200% zoom.** (NFR-16)

#### Accessibility notes

- **Heading hierarchy:** the shell contributes **no** `<h1>`; each page supplies exactly one, and it is the page's own title rather than the product name. Heading order within `<main>` is gap-free (`<h1>` → `<h2>` regions → `<h3>` subsections). A CI check asserts the landmark set and the single-`<h1>` rule **on every route for every role**.
- **Landmark regions:** as enumerated above. The demo banner sits **inside** the `banner` landmark and is **never** `aria-hidden` — it is announced once per page load as part of that landmark.
- **Focus order:** follows visual order exactly on every screen. Positive `tabindex` values prohibited.
- **Focus management on navigation:** on every client-side route change, `document.title` is set to `{Page name} — DCSA Unified Layer` and **focus moves to the new page's `<h1>`**. Without this, screen-reader users are stranded at the top of an unchanged DOM. This is the single most important focus behaviour in the product, because the flagship traversal depends on it.
- **Focus management on modal:** any modal opened from the shell (SCR-06) traps focus, closes on Escape, and **restores focus to the invoking control**.
- **Focus management on async update:** navigation changes from a `registryVersion` poll are announced politely and **never move focus or reorder content under the cursor**.
- **Visible focus indicator:** `$theme-focus-color` at `0.25rem`, `0` offset, ≥3:1 against every background including the inverted header. Never removed.
- **Keyboard operability:** every header control, nav item, breadcrumb segment, search field, and account-menu entry is reachable and operable by keyboard. The collapsed mobile menu traps focus **only while open** and is escapable. **Zero keyboard traps across all routes.**
- **Current-page indication:** `aria-current="page"` **plus** a visible non-colour indicator (weight + underline).
- **Colour-independent meaning:** role badge, method label, alert count, session timer, and source badges are all text. Health and status never appear as a bare coloured dot anywhere in the chrome.
- **aria-live regions:** role switch, alert-count change, and registry-driven nav updates → `aria-live="polite"`. Session-timeout thresholds → `role="alert"`. All announcements debounced and deduplicated.
- **Target sizes:** all header and nav controls ≥44×44 CSS px, including the collapsed menu button and the alert indicator.
- **Forced-colors / high-contrast mode:** the demo banner, focus indicators, and status icons remain visible. Verified as part of the contrast audit.
- **320px reflow:** content reflows rather than requiring two-dimensional scrolling. Data tables are the sole exception and scroll horizontally **within their own labelled, keyboard-scrollable region** — never forcing page-level horizontal scroll.
- **Errors render inside the shell.** SCR-30/31/32 live under the authenticated layout, so the demo banner, navigation, and working exits are **always present**. A bare error page would violate both the banner invariant and the never-blank rule.

---
### Screen: SCR-09 — Investigator dashboard (PER-01)

**Purpose:** Answer "what is mine, what is urgent, what changed, and what should I know" for a caseload spanning four spokes — and provide the on-ramp to the flagship workflow.
**User Stories:** US-033, US-037, US-039, US-119, US-120 · **Features:** F4, F5, F15, F16 · **Persona:** PER-01 Marcus Vale
**Template:** Widget grid (`<section aria-labelledby>` per widget, each wrapped in `DataRegion`)

> **The four dashboards must be visibly different from one another. That difference IS the RBAC demonstration** (F4 acceptance signal, SM-23). Signing in as each persona produces a different composition — not a relabelled copy.

#### Layout — desktop

```
│ <main id="main-content">                                                     │
│                                                                              │
│  Your caseload                                                    <h1>       │
│  Tuesday 15 September 2026 · 5 of 5 systems reporting                        │
│                                                                              │
│  ┌── My assigned work ────────────────── <h2> ──┐ ┌── Due soon & overdue ──┐ │
│  │                                               │ │                        │ │
│  │            41  items assigned to you          │ │  ⚠ Overdue        4   │ │
│  │                                               │ │  ● Due today      2   │ │
│  │  ▣ eApp   12  →  ▣ PVQ    9  →                │ │  ○ Due in 7 days 11   │ │
│  │  ▣ PDT     8  →  ▣ IM    12  →                │ │                        │ │
│  │      ↑ each count is a LINK into the queue    │ │  text + ICON, never    │ │
│  │        PRE-FILTERED to that system            │ │  colour alone          │ │
│  │      ↑ source labels ALWAYS shown             │ │  [ View overdue → ]    │ │
│  │  [ View all work → ]                          │ │                        │ │
│  └───────────────────────────────────────────────┘ └────────────────────────┘ │
│                                                                              │
│  ┌── Needs attention ─────────────────────────────────────── <h2> ─────────┐ │
│  │  Top 5, ranked: overdue DESC, priority DESC, dueDate ASC                 │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│  │  │ ⚠ Overdue 3 days · ▣ IM · Urgent                                 │   │ │
│  │  │ Case IM-3287 — Subject interview outstanding                     │   │ │
│  │  │ SUBJ-00511 · In progress · was due 12 Sep              [Open →]  │   │ │
│  │  ├──────────────────────────────────────────────────────────────────┤   │ │
│  │  │ ● Due in 4 days · ▣ eApp · Routine                               │   │ │
│  │  │ Case A-1042 — Section 13A employment history                     │   │ │
│  │  │ SUBJ-00418 · Under review · due 19 Sep                 [Open →]  │   │ │
│  │  └──────────────────────────────────────────────────────────────────┘   │ │
│  │  ↑ EXCLUDES items he may read but not act on — this is an ACTION list.  │ │
│  │    Unit-visible items appear in the queue, not here.                    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌══ Newly raised PVQ issues ═══════════════════════════════ <h2> ═════════┐ │
│  ║   ★ THE INTENDED ENTRY POINT TO THE FLAGSHIP WORKFLOW (F7)              ║ │
│  ║  ┌──────────────────────────────────────────────────────────────────┐  ║ │
│  ║  │ ▣ PVQ · raised 3 days ago                                        │  ║ │
│  ║  │ Issue raised against Section 13A — Employment history            │  ║ │
│  ║  │ on eApp Case A-1042 · SUBJ-00418 · Open                          │  ║ │
│  ║  │                                    [ Open the case → ] ──────────┼──╫─┼──▶ SCR-15
│  ║  └──────────────────────────────────────────────────────────────────┘  ║ │
│  ║  Issues raised in the last 7 days on cases assigned to you.            ║ │
│  ╚═════════════════════════════════════════════════════════════════════════╝ │
│                                                                              │
│  ┌── Recent activity ──────── <h2> ──┐ ┌── Announcements ───── <h2> ───────┐ │
│  │ Your last 10 actions              │ │ ⓘ Scheduled maintenance Thursday  │ │
│  │ 15:04Z Resolved ISS-2207 (PVQ)    │ │   19:00–21:00Z.        [Dismiss]  │ │
│  │        [chain →]                  │ │   ↑ dismissible PER USER,         │ │
│  │ 14:51Z Viewed IM-3287             │ │     persisted. NEVER overlays     │ │
│  │ [ View all my activity → ]        │ │     the demo banner.              │ │
│  └───────────────────────────────────┘ └───────────────────────────────────┘ │
│                                                                              │
│  ┌── System status ───────────────────────────────── <h2> ─────────────────┐ │
│  │  PRESENT ONLY when at least one source is not healthy.                  │ │
│  │  ! Investigation Management is unavailable — 12 items are not shown.    │ │
│  │    The rest of your work is up to date.                                 │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
```

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | Total assigned count + per-source breakdown | Top-left, largest type | The orienting number: "forty-one open" |
| **Primary** | Overdue / due-today counts | Top-right | The urgency answer |
| **Primary** | Needs attention (top 5 actionable) | Full width, second row | The "what do I work next" answer, pre-ranked |
| **Primary** | Newly raised PVQ issues | Full width, emphasised | **The flagship on-ramp.** Exceptions are *announced*, not discovered accidentally |
| Secondary | Recent activity | Lower-left | The record he leaves (US-107) |
| Secondary | Announcements | Lower-right | Dismissible per user |
| Conditional | System status | Bottom, **only when unhealthy** | Named + quantified gap |

#### States — per widget (every widget is an independent `DataRegion`)

| Widget | Loading | Empty | Error | Degraded | Ready |
|---|---|---|---|---|---|
| **My assigned work** | Skeleton preserving card height, `aria-busy`, sr-only "Loading my assigned work" | "You have no assigned work right now. New assignments will appear here." | "We couldn't load this section." + `[Try again]` | Counts render for available sources + inline "IM is unavailable, so its count isn't included." | Counts + links |
| **Needs attention** | Skeleton rows | "Nothing needs your attention right now." | In-widget error + retry | Renders available items + names missing system | Top 5 rows |
| **Newly raised PVQ issues** | Skeleton | "No issues have been raised on your cases in the last 7 days." | Error + retry | **"We can't reach PVQ right now, so new issues aren't shown. Everything else on this page is current."** | Issue rows |
| **Due soon & overdue** | Skeleton | "Nothing is due in the next 7 days." | Error + retry | Partial counts + named gap | Counts |
| **Recent activity** | Skeleton | "No recent activity recorded yet." | Error + retry | n/a (hub-local, never degraded) | 10 rows |
| **Announcements** | Skeleton | *Widget hidden entirely when none active* | "We couldn't load notices." | n/a | Cards |
| **System status** | — | *Widget absent when all healthy* | — | The degraded content itself | — |

**Page-level:** all sources down → prominent degraded alert: "We can't reach the connected systems right now. Your dashboard will fill in automatically when they're back." **Never a blank page, never an error route.**

> **Critical:** a slow spoke degrades **one widget, not the page** (US-037). Each widget renders its own skeleton and settles independently. Completion is announced once: *"Dashboard loaded. 3 of 4 systems reporting."*

#### Interactive elements

| Element | Component | Behaviour |
|---|---|---|
| Per-source count | `usa-link` | → SCR-13 pre-filtered to that `sourceSystem` |
| "View all work" | `usa-button--outline` | → SCR-13 default view |
| Needs-attention row | Card link | → SCR-14/15/16/19 by type, with `returnTo` |
| **"Open the case"** (PVQ issues widget) | `usa-button` | **→ SCR-15 eApp case A-1042 — the flagship entry** |
| Overdue count | `usa-link` | → SCR-13 with `overdueOnly=true` |
| Activity row | `usa-link` | → affected item |
| Chain link | `usa-button--unstyled` | → SCR-34 chain view |
| Dismiss announcement | `usa-button--unstyled` | Persists per user per announcement; does not affect other users |
| Widget "Refresh" | `usa-button--unstyled` + `usa-icon refresh` | Re-requests **that widget only**; announces "My assigned work updated. 41 items." |

**Every widget has exactly one primary destination, and every count and every row is a link to a real, pre-scoped screen. A widget that displays a number the user cannot act on is not permitted** (FR-F04-06 rule 1 / US-039).

#### Auto-refresh discipline

Only `system-status` auto-polls (every 30s), to pick up health changes and clear a degraded notice without a reload (SM-17). **No other widget auto-refreshes**, specifically to avoid content shifting under a reader (FR-F04-06 rule 3).

#### Accessibility notes

- **Heading hierarchy:** one `<h1>` "Your caseload"; each widget is a `<section aria-labelledby>` with an `<h2>`; rows inside a widget use `<h3>` where they carry a title. Gap-free.
- **Landmarks:** widgets are `<section>` elements referenced by their heading — not `region` roles applied indiscriminately, which would flood the landmark list.
- **Focus order** follows visual order: h1 → widget 1 → widget 2 … → footer. **No widget is a focus trap.**
- **Async updates:** widget load completion and refresh results announced via `aria-live="polite"`, once each, debounced. The 30-second system-status poll **does not re-announce** an already-displayed degraded notice.
- **Focus is never moved** by a widget settling, a poll landing, or an announcement arriving — the user may be reading elsewhere on the page.
- **Colour-independent meaning:** overdue is the **word "Overdue" plus an icon**, never a red row or a red count. Priority is text (`Urgent`/`Elevated`/`Routine`) with distinct tag shapes. Source attribution is text + icon.
- **Source attribution in accessible names:** each row's accessible name includes "Source system: {displayName}" so a screen-reader user hears ownership without seeing the badge.
- **Counts as links:** each count link has an accessible name describing the destination — "12 eApp items, view in work queue" — not a bare number.
- **Empty states are content**, with a heading and an explanation of what would appear — never a blank region and never an unlabelled spinner.
- **Target sizes:** widget cards, count links, and dismiss controls all ≥44×44 px.
- **320px reflow:** widgets stack to a single column in priority order — My assigned work → Due soon & overdue → Needs attention → **Newly raised PVQ issues** → Recent activity → Announcements → System status. No horizontal scroll; usable at 200% zoom.
- **Reduced motion:** skeleton shimmer disabled under `prefers-reduced-motion: reduce`.

#### Acceptance

- Items from **at least four distinct source systems**, each correctly attributed (SM-14).
- The "newly raised PVQ issues" widget **contains the flagship demo issue and links to eApp case A-1042**.
- Overdue items appear with **both text and icon** indication.
- **No empty or placeholder widget** under seeded data.
- Correct next item reachable in **≤2 clicks** from here (SM-24).

---
### Screen: SCR-10 — Adjudicator dashboard (PER-02)

**Purpose:** A determination-oriented landing page — **visibly different composition from the Investigator's, not a relabelled copy.**
**User Stories:** US-034, US-038, US-114, US-124 · **Features:** F4, F5, F16 · **Persona:** PER-02 Dana Okonkwo
**Template:** Widget grid

> **Differentiation contract:** this dashboard must differ from SCR-09 in **at least three widgets** (FR-F04-03 AC-1). The differences below are structural, not cosmetic — different scope (organisation-wide vs assignee), different ranking (aging vs due date), and two widgets with no SCR-09 counterpart.

#### How it differs from the Investigator dashboard

| | SCR-09 Investigator | SCR-10 Adjudicator |
|---|---|---|
| **Scope** | Assigned **to me** | **Across my organization** — stated in every widget heading |
| Widget 1 | My assigned work (by source) | **Awaiting my determination** |
| Widget 2 | Needs attention (overdue-first) | **Case status distribution** (as an accessible table) |
| Widget 3 | **Newly raised PVQ issues** *(flagship on-ramp)* | **Approaching determination deadlines** (14-day horizon) |
| Widget 4 | Due soon & overdue | **Returned for clarification** *(no SCR-09 counterpart)* |
| Ranking logic | `overdue DESC, priority DESC, dueDate ASC` | **Aging** — oldest-waiting first |
| Primary verb | "Work" | "Decide" |

#### Layout — desktop

```
│  Awaiting your determination                                      <h1>       │
│  Across DCSA-ADJ-CENTRAL · 5 of 5 systems reporting                          │
│                                     ↑ SCOPE IS STATED, because adjudicator   │
│                                       scope is org-wide, not assignee-based  │
│                                                                              │
│  ┌── Awaiting my determination ───────────────────────────── <h2> ─────────┐ │
│  │                                                                          │ │
│  │          17  cases awaiting your determination                           │ │
│  │                                                                          │ │
│  │  Oldest waiting                                                          │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│  │  │ ⚠ Waiting 23 days · ▣ eApp · Urgent                              │   │ │
│  │  │ Case A-0918 — Review complete, pending adjudication               │   │ │
│  │  │ SUBJ-00377 · In progress                               [Open →]  │   │ │
│  │  ├──────────────────────────────────────────────────────────────────┤   │ │
│  │  │ ● Waiting 11 days · ▣ eApp · Routine                             │   │ │
│  │  │ Case A-1042 — Review complete, pending adjudication               │   │ │
│  │  │ SUBJ-00418 · In progress                               [Open →]  │   │ │
│  │  ├──────────────────────────────────────────────────────────────────┤   │ │
│  │  │ ● Waiting 6 days · ▣ IM · Routine                                │   │ │
│  │  │ Case IM-3301 — Investigation closed, ready for review             │   │ │
│  │  └──────────────────────────────────────────────────────────────────┘   │ │
│  │  [ View all awaiting determination → ]                                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Case status distribution ────────────────────────────── <h2> ─────────┐ │
│  │  Across DCSA-ADJ-CENTRAL                                                 │ │
│  │                                                                          │ │
│  │  <caption>Case status distribution across DCSA-ADJ-CENTRAL —            │ │
│  │           4 statuses, 84 cases</caption>                                │ │
│  │  ┌──────────────────┬───────┬──────────────────────────────────────┐   │ │
│  │  │ Status           │ Cases │                                      │   │ │  ← th scope="col"
│  │  ├──────────────────┼───────┼──────────────────────────────────────┤   │ │
│  │  │ ○ Open           │    22 │  [ View these → ]                    │   │ │  ← th scope="row"
│  │  │ ● In progress    │    41 │  [ View these → ]                    │   │ │
│  │  │ ⊘ Blocked        │     4 │  [ View these → ]                    │   │ │
│  │  │ ✓ Closed         │    17 │  [ View these → ]                    │   │ │
│  │  └──────────────────┴───────┴──────────────────────────────────────┘   │ │
│  │                                                                          │ │
│  │  ★ RENDERED AS AN ACCESSIBLE DATA TABLE, NOT A CHART-ONLY PRESENTATION. │ │
│  │    If a chart is ever added it ACCOMPANIES this table; data is NEVER    │ │
│  │    available only as a graphic. (US-114, FR-F04-03 rule 2)              │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Approaching deadlines ──────────┐ ┌── Returned for clarification ─────┐ │
│  │ Due within 14 days,                │ │ Items you sent back that have    │ │
│  │ overdue called out FIRST           │ │ since been UPDATED               │ │
│  │                                    │ │                                  │ │
│  │ ⚠ Overdue          3               │ │ ▣ eApp A-0844 · updated 2d ago   │ │
│  │ ● Due in 7 days    6               │ │   Investigator added findings    │ │
│  │ ○ Due in 14 days   9               │ │                        [Open →]  │ │
│  │ [ View deadline list → ]           │ │ [ View all returned → ]          │ │
│  └────────────────────────────────────┘ └──────────────────────────────────┘ │
│                                                                              │
│  ┌── Recent activity ────────────────┐ ┌── Announcements ──────────────────┐ │
│  │ Your last 10 determinations       │ │ Targeted at ADJUDICATOR           │ │
│  └────────────────────────────────────┘ └──────────────────────────────────┘ │
│                                                                              │
│  ┌── System status ─── present ONLY when a source is unhealthy ────────────┐ │
```

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | Count awaiting determination + oldest-waiting items | Top, full width | The adjudicator's whole job, ranked by **aging** — the thing that actually goes wrong |
| **Primary** | Case status distribution | Second row, full width | The portfolio view; **an accessible table first** |
| Secondary | Approaching deadlines | Third row left | Forward-looking risk |
| Secondary | Returned for clarification | Third row right | Closes a loop SCR-09 has no equivalent of |
| Secondary | Recent activity | Fourth row left | Own determinations |
| Secondary | Announcements | Fourth row right | Role-targeted |
| Conditional | System status | Bottom, only when unhealthy | Named + quantified |

#### States

| Widget | Empty state copy | Degraded behaviour |
|---|---|---|
| Awaiting my determination | "Nothing is waiting on your determination." | Renders available sources; names the missing one |
| Case status distribution | "No cases in your organization yet." | Partial counts **with an explicit caveat row**: "eApp is unavailable — its cases aren't counted." The total is **never** presented as complete |
| Approaching deadlines | "No cases in your organization have upcoming deadlines in the next 14 days." | Named gap |
| Returned for clarification | "You haven't returned any cases for clarification." | Named gap |
| Recent activity | "No recent activity recorded yet." | n/a (hub-local) |
| Announcements | *Widget hidden when none active* | n/a |

**Loading:** per-widget skeleton, `aria-busy`, layout preserved, completion announced once.
**Error:** in-widget `usa-alert--error` + `[Try again]`; never replaces the page.

> **The honesty obligation specific to this role (US-124, US-038):** when alerts or counts **could not be computed**, the widget says so explicitly rather than displaying a reassuring zero. An adjudicator shown "0 overdue" when the number is actually unknown is being actively misled — the one failure this persona cannot tolerate.

#### Interactive elements

| Element | Component | Behaviour |
|---|---|---|
| Awaiting-determination row | Card link | → SCR-15 / SCR-19 with `returnTo` |
| "View all awaiting determination" | `usa-button--outline` | → SCR-13 filtered `statusCategory=IN_PROGRESS` |
| Status-distribution row link | `usa-link` | → SCR-13 filtered to that `statusCategory` |
| Deadline counts | `usa-link` | → SCR-13 with the matching due-date range |
| Returned-item row | Card link | → the item |
| Widget refresh | `usa-button--unstyled` | Re-requests that widget; announces result |

#### Accessibility notes

- **Heading hierarchy:** `<h1>` "Awaiting your determination" → `<h2>` per widget → `<h3>` per item title inside a widget. Gap-free.
- **The status distribution is the key a11y obligation on this screen.** It is a real `<table>` with a `<caption>` naming the scope and totals, `<th scope="col">` on both headers, and `scope="row"` on the status cell. **A screen-reader user gets the same information, in the same structure, as a sighted one** (FR-F04-03 AC-2). No chart substitutes for it.
- **Scope is announced, not implied:** every widget heading includes "Across {organization}", so a screen-reader user is never left inferring whether a count is personal or organisational.
- **Aging is text:** "Waiting 23 days" is written out, with an icon for the overdue threshold — never a heat-map colour.
- **Colour-independent meaning:** status categories carry distinct icon shapes (`radio_button_unchecked` / `pending` / `block` / `check_circle`) plus text. The whole screen survives a grayscale rendering.
- **Focus order** follows visual order; widgets are not focus traps; async settling never moves focus.
- **Live regions:** widget completion and refresh announced politely, once, debounced. Degraded notices `role="status"`, announced once, **never stealing focus**.
- **Target sizes** ≥44×44 px for every row link and table action.
- **320px reflow:** widgets stack single-column in priority order. The status-distribution table reflows to a stacked definition list per the `Y1-responsive` pattern, retaining caption and row-header semantics.
- **Reduced motion** respected for skeletons and transitions.

#### Acceptance

- Differs from SCR-09 in **at least three widgets** (FR-F04-03 AC-1).
- Status distribution is **readable as a table by a screen reader** (AC-2).
- No widget displays an uncomputable value as a confident zero (US-124).
- Fully populated under seeded data, with **no empty or placeholder widget**.

---
### Screen: SCR-11 — Applicant dashboard (PER-03) — MOBILE-FIRST

**Purpose:** A plain-language answer to "where am I in this process and what do I owe you next," assembled from eApp and IEP **without ever naming internal systems as a burden on the user**.
**User Stories:** US-035, US-049, US-107, US-112, US-113, US-116, US-122 · **Features:** F4, F5, F15 · **Persona:** PER-03 Renée Ashford
**Template:** Widget grid, **phone-first**

> **This persona is phone-first, not phone-tolerant.** ~70% of her sessions exist for the status question alone, on a phone, at lunch, eleven days apart. **The 320px layout below is the primary design; the desktop layout is the adaptation.**

#### Layout — 320px (PRIMARY)

```
┌─────────────────────────────────┐ ─┐
│ Demo — Synthetic Data Only.     │  │ units(4)  truncated lede
├─────────────────────────────────┤  │
│ ▣ An official website ▾         │  │ units(4)  usa-banner CLOSED
├─────────────────────────────────┤  ├─ CHROME BUDGET ≤ units(15) (~120px)
│ [DCSA]                    [☰]   │  │ units(7)  compact header
├─────────────────────────────────┤ ─┘
│ <main>                          │
│                                 │
│ Your security clearance         │  ← <h1>, FIRST content in <main>.
│ application                     │    NO breadcrumb, NO page-level alert
│                                 │    region, NO announcement region above it
│ ┌─────────────────────────────┐ │
│ │ We have your application    │ │  ★ THE ANSWER. ONE SENTENCE.
│ │ and it is being reviewed.   │ │    usa-summary-box
│ │ Nothing is needed from you  │ │    ABOVE THE FOLD at 320×568.
│ │ on this right now.          │ │    This is the acceptance criterion.
│ └─────────────────────────────┘ │
│                                 │
│ ══════ FOLD (320×568) ══════════│
│                                 │
│ Where you are            <h2>   │
│ ┌─────────────────────────────┐ │  ← usa-step-indicator, VERTICAL at 320px
│ │ ✓ Submitted                 │ │    current step marked IN TEXT
│ │   Completed 2 August        │ │    ("you are here") as well as visually
│ │ ● Under review              │ │    aria-current="step"
│ │   ▸ You are here            │ │
│ │   We're checking the        │ │  ← one-sentence explanation of the
│ │   information you gave us.  │ │    CURRENT step. Not a glossary.
│ │   This usually takes 4–8    │ │
│ │   weeks.                    │ │
│ │ ○ Information requested     │ │
│ │ ○ Complete                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ What you need to do (1)  <h2>   │
│ ┌─────────────────────────────┐ │
│ │ Confirm your address        │ │
│ │ history for 2019–2021       │ │
│ │                             │ │
│ │ ⚠ Due Friday 18 September   │ │  ← text + icon, never a red date
│ │                             │ │
│ │ If we don't hear from you   │ │  ★ CONSEQUENCE STATED IN PLAIN
│ │ by then, your application   │ │    LANGUAGE — not a bare due date
│ │ will pause.                 │ │
│ │                             │ │
│ │ [ Start this task      → ]  │ │  ← ≥44×44px; WHOLE CARD tappable
│ └─────────────────────────────┘ │    100% of tasks link DIRECTLY to
│                                 │    the action that discharges them
│ Your notices (1 unread)  <h2>   │
│ ┌─────────────────────────────┐ │
│ │ ● Unread                    │ │  ← read/unread is TEXT + icon
│ │ Interview scheduling        │ │
│ │ 12 September                │ │
│ │ [ Read ]  [ Mark as read ]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Your submission          <h2>   │
│ ┌─────────────────────────────┐ │
│ │ Reference  AP-00622-1       │ │
│ │ Submitted  2 August 2026    │ │
│ │ Status     Being reviewed   │ │
│ │ [ View what I submitted → ] │ │
│ └─────────────────────────────┘ │
│ </main>                         │
├─────────────────────────────────┤
│ usa-identifier (stacked)        │
│ Accessibility statement         │
└─────────────────────────────────┘
```

#### Layout — desktop (≥1024px)

Two columns: **left (2/3)** — "Where you are", "What you need to do", "Your notices"; **right (1/3)** — "Your submission", "Announcements", "System status". The `<h1>` and status sentence remain the first content in `<main>`.

#### The language contract

```
NEVER APPEARS ON THIS SCREEN            INSTEAD
────────────────────────────────────    ────────────────────────────────────
"INFORMATION_REQUESTED"                 "We need something from you"
"Tier 3" / "T3"                         (omitted — irrelevant to her)
"Pending SOI transmittal"               "We're checking the information
                                         you gave us"
"eApp" / "IEP" / "PVQ" in body copy     "your application" / "your notices"
"Adjudication"                          "the final decision"
"Subject" / "SUBJ-00622"                "you" / (omitted)
"Case"                                  "your application"
```

**Rule:** zero internal system names, tier codes, or state abbreviations **without plain-language explanation** (SM-25). Source badges still exist on work-item rows for attribution consistency, but they are **secondary** — smaller, lower-contrast-but-still-AA, and never in a heading. The mapping from internal state → plain language is **seed/configuration**, not per-screen improvisation, so it cannot drift.

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | The one-sentence status answer | Immediately under `<h1>`, above the fold at 320px | **70% of sessions exist for this alone.** Everything else is secondary |
| **Primary** | Where you are (step indicator) | Directly below | Structure, not decoration — answers "how much is left" |
| **Primary** | What you need to do | Below status | The obligation, with due date and consequence |
| Secondary | Your notices | Below tasks | In the same place she checks status — not an email she lost |
| Secondary | Your submission | Right column / bottom | Proof of what she sent |
| Tertiary | Announcements | Right column / bottom | Role-targeted |
| Conditional | System status | Bottom, jargon-free | "Some of your information isn't available right now. Please check back shortly." |

#### States

| Widget | Loading | Empty | Error | Degraded |
|---|---|---|---|---|
| **Where you are** | Skeleton preserving box height | *Not reachable — every applicant has a status* | "We couldn't load your status right now. Try again." | "Part of your status isn't available right now. Please check back shortly." |
| **What you need to do** | Skeleton | **"You don't have anything to do right now. We'll let you know if that changes."** | Error + retry | Named-in-plain-language gap |
| **Your notices** | Skeleton | **"You have no notices."** | Error + retry | "Your notices aren't available right now." |
| **Your submission** | Skeleton | *Not reachable* | Error + retry | Partial with caveat |
| **Announcements** | Skeleton | *Hidden when none* | Silent fail | n/a |

> **The zero-item applicant is a separately seeded persona** (FR-F17-06), specifically so every applicant empty state is **demonstrable rather than theoretical** — without emptying Renée's account. Every empty state here is designed content with a heading and an explanation. **Never a blank panel.**

**Degraded wording is de-jargoned.** Where mission screens say "Investigation Management is unavailable — 12 items are not shown," this screen says "Some of your information isn't available right now. Please check back shortly." Same honesty, no internal system names where they can be avoided.

#### What must never appear

```
SEEDED BUT INVISIBLE ON EVERY APPLICANT SCREEN:
  • A PVQ issue raised against one of her own answers (seed precondition P5)
  • investigatorNotes · issueNarrativeInternal · adjudicationRationale
  • Any PDT designation, any IM case record
  • Any other subject's anything

ENFORCEMENT — not a UI decision:
  • Every row filtered by subjectRef AT THE DATA LAYER
  • Redacted fields are ABSENT FROM THE PAYLOAD, not hidden in the DOM
  • The UI does NOT render a "hidden content" placeholder that would imply
    concealed material about her (FR-F06-02 rule 3)
```

The result: there is nothing on screen to inspect, because there is nothing in the response to inspect. Verified by direct API probe with another subject's ID (FR-F04-04 AC-1, AC-3).

#### Interactive elements

| Element | Component | Behaviour |
|---|---|---|
| "Start this task" | `usa-button` (whole card tappable) | → SCR-18 task form |
| Notice "Read" | `usa-link` | → SCR-18 / SCR-21 notice body |
| "Mark as read" | `usa-button--unstyled` | Toggles read state, persisted in **IEP's own store** (it is IEP's record); announced politely |
| "View what I submitted" | `usa-button--outline` | → SCR-18 submission view (redacted per obligations) |
| Step indicator | Non-interactive | Structure only; not a wizard |

#### Accessibility notes

> **This is the widest accessibility exposure in the product.** The population includes screen-reader, keyboard-only, magnification, and cognitive/reading-disability users — and users whose disability is directly relevant to what the vetting process is asking about.

- **Plain language is an accessibility requirement, not a tone preference.** Short sentences, defined terms, no unexplained acronyms, one explicit next action per card. **Jargon is the failure mode here, not layout.**
- **Heading hierarchy:** `<h1>` "Your security clearance application" → `<h2>` per widget. Gap-free. **The `<h1>` is the first element in `<main>`**, with no intervening alert or breadcrumb region — this is what keeps the status answer above the fold.
- **Landmarks:** skip link (first focusable, moves focus to `<main>`) → demo banner → gov banner → `banner` → `nav[Primary]` → `main` → `contentinfo`.
- **Step indicator:** `usa-step-indicator` with `aria-current="step"` **and** the visible words "You are here." Progress conveyed by **text and structure**, never a colour-coded graphic alone (NFR-02).
- **Read/unread state** is text + icon, never a colour dot.
- **Due dates** carry the word "Due" plus an icon; overdue carries the word "Overdue". Never a red date alone.
- **Forms (on SCR-18):** programmatically associated `<label>` on every input — never a placeholder as a label; `aria-describedby` hint text for anything ambiguous; required marked with the **text** "required"; inline `usa-error-message` with `aria-invalid="true"`; error summary with `role="alert"`, focus moved to it, in-page links. **She is entering personal detail she may find uncomfortable to disclose — a confusing validation error compounds that.**
- **Session timing:** she *will* be timed out. SCR-06 gives a clear warning and an accessible re-authentication path that **does not discard entered data**. There is no time limit on completing a form other than the session timeout (US-117).
- **Live regions without focus theft:** an arriving notice is announced politely and does **not** move focus or reorder content under her cursor.
- **Target sizes ≥44×44 CSS px**, generously spaced. The **whole task card** is the target, not just the button text.
- **320px:** no horizontal scroll; **the status sentence is visible without scrolling on a 320×568 viewport** — a measured acceptance criterion, tested explicitly because of the NFR-13 / SM-25 tension documented in `00-overview` and made normative in FR-F03-03 rule 3a.
- **200% zoom:** no clipping, no overlap, content reflows; no two-dimensional scrolling.
- **Reduced motion:** all non-essential animation disabled, including skeleton shimmer.
- **No hover-only content.** Any explanatory text is present inline or available on focus, never tooltip-only.

#### Acceptance

- She answers "where am I in this process" within **30 seconds of signing in, on a 320px viewport, without scrolling past a fold of jargon** (SM-25, NFR-16).
- Shows **only that applicant's records**, verified by direct API probe with another subject's ID.
- The **zero-item applicant persona renders designed empty states in every widget**, with no blank regions.
- **Redacted fields are absent from the response payload**, not merely hidden.
- **Visibly and substantively different** from the three mission dashboards.

---
### Screen: SCR-12 — Administrator dashboard (PER-04)

**Purpose:** Platform operability at a glance. **This dashboard is about the layer itself, not about mission work** — which is why it is the most structurally different of the four.
**User Stories:** US-023, US-036, US-086, US-087, US-088, US-093, US-125, US-131 · **Features:** F4, F11, F12, F16 · **Persona:** PER-04 Priya Raghunathan
**Template:** Widget grid

> **The sharpest RBAC signal in the product:** this dashboard shows **no work items at all**, and the Administrator's navigation **contains no Work Queue**. Operating the platform and doing mission work are separate concerns; conflating them would weaken the least-privilege demonstration. An Administrator deep-linking to a work item receives `AUTHZ_DENIED` (FR-F02-02 rule 1 / US-023).

#### Layout — desktop

```
│  Platform status                                                  <h1>       │
│  Tuesday 15 September 2026 15:04 UTC                                         │
│                                                                              │
│  ┌── Connected applications ─────────┐ ┌── System health ──────── <h2> ────┐ │
│  │              <h2>                  │ │                                   │ │
│  │      5  registered                 │ │  ✓ Healthy       4                │ │
│  │      5  enabled                    │ │  ! Degraded      0                │ │
│  │      0  disabled                   │ │  ✕ Unavailable   1                │ │
│  │                                    │ │                                   │ │
│  │  ▣ eApp  ▣ IEP  ▣ PVQ             │ │  ▣ eApp  ✓ Healthy    38ms 15:04Z │ │
│  │  ▣ PDT   ▣ IM                      │ │  ▣ IEP   ✓ Healthy    41ms 15:04Z │ │
│  │                                    │ │  ▣ PVQ   ✓ Healthy    35ms 15:04Z │ │
│  │  [ Manage applications → ]         │ │  ▣ PDT   ✓ Healthy    52ms 15:04Z │ │
│  │  [ Register an application → ]     │ │  ▣ IM    ✕ Unavailable   — 14:51Z │ │
│  │                                    │ │                                   │ │
│  │  ↑ increments WITHOUT a restart    │ │  ↑ text + ICON SHAPE, never a     │ │
│  │    when a 6th app is registered    │ │    red/green dot. Last-check time │ │
│  │    (SM-12)                         │ │    shown so STALENESS IS VISIBLE. │ │
│  │                                    │ │  [ View health → ]                │ │
│  └────────────────────────────────────┘ └───────────────────────────────────┘ │
│                                                                              │
│  ┌── Integration issues (last 24 hours) ──────────────────── <h2> ─────────┐ │
│  │                                                                          │ │
│  │      14  issues in the last 24 hours                                    │ │
│  │                                                                          │ │
│  │  By error class:   TIMEOUT 8 · CONNECTION_REFUSED 5 · NORMALIZATION 1   │ │
│  │                                                                          │ │
│  │  Five most recent                                                        │ │
│  │  ┌─────────────┬───────┬───────────────┬──────────────┬──────────────┐  │ │
│  │  │ 14:52:03Z   │ ▣ IM  │ listWorkItems │ TIMEOUT      │ 01JD7K2Q… →  │  │ │
│  │  │ 14:52:03Z   │ ▣ IM  │ healthCheck   │ CONN_REFUSED │ 01JD7K2R… →  │  │ │
│  │  │ 14:51:33Z   │ ▣ IM  │ healthCheck   │ CONN_REFUSED │ 01JD7K2S… →  │  │ │
│  │  └─────────────┴───────┴───────────────┴──────────────┴──────────────┘  │ │
│  │                              ↑ correlation ID links to the AUDIT CHAIN  │ │
│  │  [ View all integration issues → ]                                      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌── Recent administrative activity ─┐ ┌── Announcements ──────── <h2> ────┐ │
│  │              <h2>                  │ │                                   │ │
│  │ 14:48Z  You                        │ │   1  active                       │ │
│  │   FAILURE_INJECTED  IM → UNAVAIL   │ │   0  scheduled                    │ │
│  │   [chain →]                        │ │   3  expired                      │ │
│  │ 14:02Z  You                        │ │                                   │ │
│  │   APPLICATION_PROBED  PVQ          │ │  [ Manage announcements → ]       │ │
│  │                                    │ │                                   │ │
│  │ ★ ADMINISTRATORS ARE NOT EXEMPT.   │ └───────────────────────────────────┘ │
│  │   Her own actions are in the trail │ ┌── Demo operations ────── <h2> ────┐ │
│  │   like everyone else's. (US-093)   │ │  Services  6 of 6 running         │ │
│  │                                    │ │  Seed data ✓ validated            │ │
│  │ [ View audit trail → ]             │ │  Injection ! IM → UNAVAILABLE     │ │
│  └────────────────────────────────────┘ │            auto-clears in 4:12    │ │
│                                          │  [ Demo operations → ]  SCR-37   │ │
│                                          │  [ Failure injection → ] SCR-38  │ │
│                                          └───────────────────────────────────┘ │
```

#### How it differs from the three mission dashboards

| | Mission dashboards (09/10/11) | SCR-12 Administrator |
|---|---|---|
| **Subject matter** | Work items, cases, tasks | **The platform itself** |
| Work items shown | Yes | **None — and none are reachable** |
| Primary question | "What do I work next?" | "Is the layer healthy, and what broke?" |
| Data source | Spoke fan-out | Registry + health monitor + integration log + audit |
| Nav companion | Work Queue | **Eight console items, no Work Queue** |
| Unique widgets | — | Connected applications · Integration issues · Demo operations |

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | Connected-application counts | Top-left | "What is connected" — the inventory answer |
| **Primary** | Per-application health | Top-right | "Is it working" — **before a user tells her** (US-087) |
| **Primary** | Integration issues (24h) | Second row, full width | "What has gone wrong" — with correlation IDs into the audit chain |
| Secondary | Recent administrative activity | Third row left | Her own accountability |
| Secondary | Announcements management | Third row right | Counts + link |
| Secondary | Demo operations | Third row right | Readiness + **active-injection visibility** |

#### States

| Widget | Loading | Empty | Error | Degraded |
|---|---|---|---|---|
| **Connected applications** | Skeleton | **"No applications are registered yet. Register your first application to get started."** *(reachable only if the registry is emptied — still designed)* | "We can't load the application list right now. Try again in a moment — reference {id}." | n/a (registry is hub-local) |
| **System health** | Skeleton | "No health checks have run yet. The first check runs within {n} seconds." | Error + retry | **"Health monitoring isn't running. Statuses below may be out of date."** — an absent monitor must **never** masquerade as all-healthy (US-125) |
| **Integration issues** | Skeleton | **"No integration issues in the last 24 hours."** | Error + retry | n/a (hub-local) |
| **Recent admin activity** | Skeleton | "No administrative activity recorded yet." | Error + retry | n/a |
| **Announcements** | Skeleton | "No announcements have been created." | Error + retry | n/a |
| **Demo operations** | Skeleton | *Not reachable* | Error + retry | Lists any service not running |

> **Health data is read from the monitor's stored results, not probed on page load** — so the dashboard is fast and probing stays on its cadence. A manual "Check now" on SCR-24 triggers an on-demand probe (FR-F04-05 rule 1).

> **Active failure injection is surfaced here and on SCR-24/37**, so no operator mistakes an **injected** outage for a **real** one (FR-F16-11 rule 6). This is a demo-safety design decision, not decoration.

#### Interactive elements

| Element | Component | Behaviour |
|---|---|---|
| "Manage applications" | `usa-button--outline` | → SCR-22 |
| "Register an application" | `usa-button` | → SCR-28 |
| Health row | `usa-link` | → SCR-23 application detail |
| "View health" | `usa-button--outline` | → SCR-24 |
| Integration-issue correlation ID | `usa-link`, monospace | → SCR-34 chain view |
| "View all integration issues" | `usa-button--outline` | → SCR-25 |
| Admin-activity chain link | `usa-button--unstyled` | → SCR-34 |
| "View audit trail" | `usa-button--outline` | → SCR-33 (full trail, `AUDIT.READ_ALL`) |
| "Manage announcements" | `usa-button--outline` | → SCR-29 |
| "Demo operations" / "Failure injection" | `usa-button--outline` | → SCR-37 / SCR-38 |

#### Accessibility notes

- **Heading hierarchy:** `<h1>` "Platform status" → `<h2>` per widget → `<h3>` per sub-grouping. Gap-free.
- **Health status is the key colour-independence obligation here.** Every state is **text + a distinct icon shape** — "Healthy" ✓ `check_circle`, "Degraded" ! `warning`, "Unavailable" ✕ `cancel`. **Never a coloured dot.** A grayscale rendering of this screen retains every status meaning (FR-F14-06 AC-2).
- **Latency and last-check timestamps are text**, so staleness is legible non-visually. A stale "Healthy" with an old timestamp is a different fact from a fresh one, and both are readable.
- **Integration-issue table:** real `<table>` with `<caption>` "Five most recent integration issues — 14 in the last 24 hours", `<th scope="col">` per column, `scope="row"` on the timestamp cell.
- **Correlation IDs** render monospace and selectable, with an accessible name of "View the full audit chain for this action" on the link — not a bare ULID read character by character.
- **Error classes are plain text tokens** (`TIMEOUT`, `CONNECTION_REFUSED`), not colour-coded severity bars. Severity, where shown, is worded.
- **Counts as links** carry descriptive accessible names — "14 integration issues in the last 24 hours, view all" — not a bare number.
- **Active-injection notice** uses `role="status"` and is announced once; the auto-clear countdown updates **silently** and is announced only on expiry, never per-second.
- **Focus order** follows visual order; widgets are `<section aria-labelledby>`; none is a focus trap; polled updates never move focus.
- **Live regions:** health-state changes announced politely once — "Investigation Management is now unavailable." Debounced; not re-announced on every 30-second poll.
- **Target sizes** ≥44×44 px for all widget links and table row actions.
- **320px reflow:** widgets stack single-column: Connected applications → System health → Integration issues → Demo operations → Recent admin activity → Announcements. The health and issue tables reflow to stacked cards per `Y1-responsive`, retaining caption and row-header semantics.
- **Reduced motion** respected.

#### Acceptance

- Inducing an adapter failure adds a **visible entry to the integration-issues widget within one health-check interval** (FR-F04-05 AC-1).
- Registering the sixth application **increments the connected-applications count without a restart** (SM-12).
- **No work items are exposed**; deep-linking to one returns `AUTHZ_DENIED` and is audited (US-023).
- Visibly and substantively different from SCR-09, SCR-10, and SCR-11.
- Fully populated under seeded data, **no empty or placeholder widget**.

---
### Screen: SCR-13 — Unified work queue

**Purpose:** One list of everything assigned to the signed-in user, aggregated from five (then six) spokes, normalised into a common shape while retaining **unmistakable source attribution**. The screen where "one queue, five systems" is either believed or not.
**User Stories:** US-040, US-041, US-042, US-043, US-044, US-045, US-046, US-047, US-048, US-049, US-110, US-129 · **Features:** F5, F8, F14, F16
**Template:** `ListPage` · **Roles:** Investigator, Adjudicator, Applicant — **not Administrator** (no work-item read permission)

#### Layout — desktop

```
│  Work queue                                                       <h1>       │
│                                                                              │
│  ┌── FILTER RAIL ────────┐ ┌── RESULTS ─────────────────────────────────────┐│
│  │ <form> landmark,       │ │                                                ││
│  │ aria-label="Filter     │ │ Active filters:                                ││
│  │ work items"            │ │ [Assigned to: me ✕] [Status: Open, In progress ✕]││
│  │                        │ │ [ Clear all filters ]                          ││
│  │ Search                 │ │   ↑ ROLE DEFAULTS RENDER AS VISIBLE CHIPS on   ││
│  │ ┌────────────────────┐ │ │     first load. A silently pre-filtered list   ││
│  │ │ 🔍 case or subject │ │ │     is a lie about completeness. (US-046)      ││
│  │ └────────────────────┘ │ │                                                ││
│  │                        │ │ <caption>Work items assigned to you —          ││
│  │ Source system          │ │   28 results. 5 of 5 systems reporting.</caption>││
│  │ ☐ eApp (12)            │ │ ┌────┬──────┬──────┬─────┬──────┬────┬───────┐ ││
│  │ ☐ IEP (0)              │ │ │Title│Source│Type │Subj │Status│Pri │Due ▲  │ ││
│  │ ☐ PVQ (9)              │ │ │     │  ⇅   │  ⇅  │     │  ⇅   │ ⇅  │  ⇅    │ ││
│  │ ☐ PDT (8)              │ │ ├────┴──────┴──────┴─────┴──────┴────┴───────┤ ││
│  │ ☐ IM (12)              │ │ │ Case IM-3287 — Subject interview           │ ││
│  │   ↑ from the REGISTRY, │ │ │ outstanding                    ← th scope  │ ││
│  │     not hard-coded.    │ │ │ ▣ IM │Assignment│SUBJ-00511│In progress│    │ ││
│  │     A 6th app appears  │ │ │ Urgent │ ⚠ Overdue 3 days │ 12 Sep      │ ││
│  │     here automatically │ │ ├────────────────────────────────────────────┤ ││
│  │                        │ │ │ Case A-1042 — Section 13A employment       │ ││
│  │ Type                   │ │ │ history                                    │ ││
│  │ ☐ Case review          │ │ │ ▣ eApp │Case review│SUBJ-00418│Under review│ ││
│  │ ☐ Issue item           │ │ │ Routine │ ● Due in 4 days │ 19 Sep       │ ││
│  │ ☐ Designation          │ │ ├────────────────────────────────────────────┤ ││
│  │ ☐ Assignment           │ │ │ Issue ISS-2207 — Section 13A end date      │ ││
│  │                        │ │ │ ▣ PVQ │Issue item│SUBJ-00418│Open         │ ││
│  │ Status                 │ │ │ Elevated │ ● Due in 2 days │ 17 Sep      │ ││
│  │ ☐ Open                 │ │ └────────────────────────────────────────────┘ ││
│  │ ☐ In progress          │ │                                                ││
│  │ ☐ Blocked              │ │  Showing 1 to 25 of 28                         ││
│  │ ☐ Closed               │ │  ‹ Prev  [1] 2  Next ›       usa-pagination    ││
│  │                        │ │  ↑ bounds controls DISABLED, not hidden        ││
│  │ Priority               │ │                                                ││
│  │ ☐ Urgent ☐ Elevated    │ │  Items per page: [25 ▾]                        ││
│  │ ☐ Routine              │ └────────────────────────────────────────────────┘│
│  │                        │                                                   │
│  │ Assigned to            │  NO BULK ACTIONS, BY DESIGN. Actions happen on   │
│  │ (•) Me ( ) Unassigned  │  the detail page so every mutation is audited    │
│  │                        │  in full context. (FR-F05-01 rule 6)             │
│  │ Due date               │                                                   │
│  │ From [ 2026-09-01 ]    │                                                   │
│  │ To   [ 2026-09-30 ]    │                                                   │
│  │   usa-date-picker      │                                                   │
│  │ ☐ Overdue only         │                                                   │
│  │                        │                                                   │
│  │ [ Apply filters ]      │                                                   │
│  │ [ Reset to default ]   │                                                   │
│  └────────────────────────┘                                                   │
```

#### Table columns

| Column | Sortable | Content | Notes |
|---|---|---|---|
| **Title** | ✓ | Link to detail, `<th scope="row">` | The row's identifying cell |
| **Source system** | ✓ | `usa-tag` — **text + icon** | From registry `displayName`; accessible name "Source system: {name}" |
| **Type** | — | `typeLabel` | e.g. "Case review", "Issue item" |
| **Subject** | — | `subjectRef` + display name | Fabricated |
| **Status** | ✓ | Native status text + category icon | **Native status preserved verbatim**; category drives filtering |
| **Priority** | ✓ | Urgent / Elevated / Routine + icon | Sorts by **ordinal**, never alphabetically |
| **Assignee** | — | Display name, or "Unassigned" | "Unassigned" and "assigned to someone we can't resolve" are **distinguishable** |
| **Due date** | ✓ | Date + overdue marker | **Nulls always sort last**, both directions |
| **Last activity** | ✓ | Relative + absolute | |

#### Information hierarchy

| Priority | Content | Placement |
|---|---|---|
| **Primary** | The rows themselves, sorted by the role default | Right 3/4, first screenful |
| **Primary** | Result count + systems-reporting count | Table `<caption>` — so the total is **never** presented as complete when it is not |
| **Primary** | Active filter chips | Directly above the table |
| **Primary** | Degraded banner (when present) | **Above** the table, above the chips |
| Secondary | Filter rail | Left 1/4 (collapses to a disclosure below `tablet`) |
| Secondary | Pagination + page size | Below table |
| Tertiary | Source counts in filter facets | Inline in the rail |

#### States

```
┌─ 1 LOADING ────────────────────────────────────────────────────────┐
│ Skeleton rows preserving row height · aria-busy="true"             │
│ <caption> present · sr-only "Loading work items"                   │
│ Announced ONCE on completion: "28 work items. Showing 1 to 25.     │
│ 5 of 5 systems reporting."                                         │
└────────────────────────────────────────────────────────────────────┘

┌─ 2a EMPTY — no items at all ───────────────────────────────────────┐
│ ⓘ You have no assigned work right now.                             │
│   New assignments will appear here.                                │
│   usa-alert--info  ·  caption still present                        │
└────────────────────────────────────────────────────────────────────┘

┌─ 2b EMPTY — filters exclude everything ────────────────────────────┐
│ ⓘ No work items match your filters.                                │
│   Clear filters to see all of your work.                           │
│   [ Clear all filters ]                                            │
└────────────────────────────────────────────────────────────────────┘

┌─ 2c EMPTY — search found nothing ──────────────────────────────────┐
│ ⓘ No work items match 'A-9999'.                                    │
│   Check the spelling, or try a case or subject number.             │
└────────────────────────────────────────────────────────────────────┘

┌─ 3 ERROR — registry unreadable ────────────────────────────────────┐
│ ✕ We can't load your work list right now.                          │
│   Try again in a moment — reference 01JD7K2Q9X8V3MZ4R6T  [Copy]     │
│   [ Try again ]                                                    │
└────────────────────────────────────────────────────────────────────┘

┌─ 4a DEGRADED — one source down ────────────────────────────────────┐
│ ! Investigation Management is unavailable — 12 items are not       │
│   shown. The rest of your work is up to date.                      │
│   usa-site-alert--warning · role="status" · announced ONCE         │
│                                                                    │
│ <caption>Work items assigned to you — 16 results.                  │
│          4 of 5 systems reporting.</caption>                       │
│ ▼ remaining four sources render FULLY and ACTIONABLY               │
└────────────────────────────────────────────────────────────────────┘

┌─ 4b DEGRADED — count unknown ──────────────────────────────────────┐
│ ! Investigation Management is unavailable — some items are not     │
│   shown.            ← NUMBER OMITTED, NEVER GUESSED                │
└────────────────────────────────────────────────────────────────────┘

┌─ 4c DEGRADED — two sources down (COMPOSES, never collapses) ───────┐
│ ! Investigation Management is unavailable — 12 items are not       │
│   shown. PVQ is unavailable — 9 items are not shown.               │
│   The rest of your work is up to date.                             │
└────────────────────────────────────────────────────────────────────┘

┌─ 4d DEGRADED — ALL sources down (NOT an empty state) ──────────────┐
│ ! We can't reach any connected systems right now. Your work will   │
│   appear here automatically when they're back.     [ Try again ]   │
│   HTTP 200. Never a 500. Never a blank page. Never an error route. │
└────────────────────────────────────────────────────────────────────┘

┌─ 4e DEGRADED — source slow but responding ─────────────────────────┐
│ Row-level inline note under the title: "Slow to respond."          │
│ Actions remain ENABLED; a warning is shown rather than a block.    │
└────────────────────────────────────────────────────────────────────┘

┌─ 4f TRUNCATION disclosed ──────────────────────────────────────────┐
│ ⓘ Showing the first 200 items from each system. Narrow your        │
│   filters to see more.        ← the system NEVER silently hides    │
└────────────────────────────────────────────────────────────────────┘

┌─ 5 RECOVERY ───────────────────────────────────────────────────────┐
│ ✓ Investigation Management is available again.                     │
│   Refresh to see 12 more items.          [ Refresh ]               │
│   Polite announcement + EXPLICIT control. Does NOT silently         │
│   reorder rows under the user's cursor.                            │
└────────────────────────────────────────────────────────────────────┘
```

> **The empty-vs-degraded distinction is the single most consequential thing on this screen.** "You have no assigned work" and "We couldn't load your work" use different components, different icon shapes, different headings, and different structures — legible in grayscale **and** non-visually (US-129, `Y0-patterns §DataRegion`).

#### Interactive elements

| Element | Component | Behaviour |
|---|---|---|
| Search field | `usa-search` | Min 2 chars after trim; matches title, subjectRef, subject name, nativeId, workItemId. **Exact identifier match ranks first** and, when sole result, offers "Go to this item" |
| Facet checkboxes | `usa-checkbox` in `usa-fieldset` | AND across facets, OR within a facet. Applied **server-side after normalisation** |
| Date range | `usa-date-range-picker` | Inclusive; `dueFrom <= dueTo` enforced. When active, states: "Items without a due date are hidden while a date range is applied." |
| Filter chip remove | `usa-tag` + button | Accessible name "Remove filter: Source system — PVQ". Updates URL, re-queries, announces count |
| "Clear all filters" | `usa-button--outline` | Removes all chips, re-queries |
| "Reset to default view" | `usa-button--unstyled` | Restores the role default; announces the change |
| Sortable header | `<th>` containing `<button>`, `aria-sort` | Toggles direction; announces "Sorted by due date, ascending. 28 items." |
| Row title | Link, `<th scope="row">` | → detail with `returnTo` encoding filters+sort+page |
| Pagination | `usa-pagination` | `aria-current="page"`; bounds **disabled, not hidden**, with a reason |
| Page size | `usa-select` | 10 / 25 / 50 / 100, default 25 |

#### Queue context preservation (US-047)

All state lives in the **URL**: `?sourceSystem=PVQ&status=OPEN&sort=dueDate&dir=asc&page=2`. Consequences: the view is shareable, the Back button behaves, and "return to the queue with filters intact" is a property of the address bar rather than a stateful hack. Returning from a detail screen restores filters, sort, page, scroll position, **and moves focus back to the row the user came from**.

#### Accessibility notes

- **Heading hierarchy:** `<h1>` "Work queue" → `<h2>` "Filter work items" (visually hidden if the rail is self-evident) → `<h2>` "Results". Gap-free.
- **Landmarks:** the filter rail is a `<form>` landmark with `aria-label="Filter work items"`; the results region is a `<section aria-labelledby>`. The table is **not** wrapped in a redundant `region`.
- **Accessible data table** — the core obligation here:
  - Real `<table>` with a `<caption>` stating **contents, current result count, and systems-reporting count**.
  - `<th scope="col">` on every column header; `scope="row"` on the **title** cell.
  - Sortable headers contain a real `<button>`; `aria-sort` lives on the `<th>` and reflects `ascending | descending | none`.
  - Sort activation announces the new sort **and** the result count politely.
  - `usa-pagination` with `aria-label="Work queue pagination"`, `aria-current="page"`, disabled bounds controls.
- **Result-count announcements** on every filter, search, sort, or page change: "{n} work items. Showing {a} to {b}. {m} of {k} systems reporting." Debounced and deduplicated.
- **Source attribution in the accessible name** of every row — "Source system: Personnel Vetting Questionnaire" — never conveyed by a coloured badge alone (NFR-02).
- **Colour-independent meaning:** overdue is the **word "Overdue" plus an icon**; priority is text with distinct tag shapes; status carries its category icon shape. The screen survives a grayscale rendering intact.
- **Keyboard:** the entire screen — search, facets, date pickers, chips, clear-all, sortable headers, rows, pagination, page size — is reachable and operable by keyboard in visual order. **No keyboard trap in the filter rail.**
- **Focus management:** filter/sort/page changes update content **without moving focus**, so a keyboard user does not lose their place; the announcement carries the information instead. Focus is deliberately restored to the originating row on return from a detail screen.
- **Degraded notices never steal focus** and are present in the static structure as well as the live region, so a user arriving late still meets them by navigating headings.
- **Target sizes** ≥44×44 px for chips, sort buttons, pagination controls, and row links.
- **320px reflow:** see `Y1-responsive §Work queue table reflow` — the table becomes a stacked card list retaining caption and row-header semantics; the filter rail collapses into a `usa-accordion` disclosure above the results. **No page-level horizontal scroll.** Where horizontal scrolling is used at intermediate widths, it is confined to a **labelled, keyboard-scrollable region**.

#### Acceptance

- Contains correctly attributed items from **at least four distinct spokes** (SM-14), six after CVS registration.
- **Every state** — populated, filtered-empty, wholly-empty, degraded, loading, error, truncated, recovering — is reachable and designed.
- Table passes the automated accessibility scan with **zero serious or critical violations**.
- Default role filters shown as **removable chips** on first load.
- Identical queries return **identical ordering** (required for repeatable demos, SM-22).
- Filter → open item → act → return lands on the **same filtered page with focus restored**.

---
### Screen: SCR-14 — Work-item detail (generic)

**Purpose:** The page where work actually gets done. The generic `DetailPage` every item type specialises — SCR-15 (eApp), SCR-16 (PVQ), SCR-17 (PDT), SCR-18 (IEP), SCR-19 (IM) are all this screen with a different content profile.
**User Stories:** US-050, US-051, US-052, US-053, US-054, US-055, US-056, US-057, US-058, US-126 · **Features:** F6, F2, F13, F16
**Template:** `DetailPage`

> **One dynamic route serves every item type** (`/work/[workItemId]` where `workItemId = {sourceSystem}:{nativeId}`). The body renders from the registry-supplied `contentProfile`, so **a sixth application's detail page exists the moment it is registered** — no new route, no new file. Unknown profiles fall back to a labelled definition list, never an empty page.

#### Layout — region order is normative

```
│ ‹ Back to work queue          ← persistent, ABOVE the <h1>, restores        │
│                                 filters+sort+page+focus                     │
│                                                                             │
│ Work Queue › ▣ eApp Case A-1042        ← usa-breadcrumb, cross-system      │
│                                                                             │
│ Case A-1042 — Section 13A employment history              <h1>              │
│                                                                             │
│ ┌── SUMMARY HEADER ───────────────────────────────────────────────────────┐ │
│ │ System of record: eApp — Electronic Application       ← REPEATED IN TEXT│ │
│ │ Synthetic record — demo data                          ← per FR-F17-08   │ │
│ │                                                                         │ │
│ │ Subject     SUBJ-00418 · Theodore Q. Lansbury                           │ │
│ │ Status      Under review              Priority   Routine                │ │
│ │ Due         19 September 2026 (in 4 days)                               │ │
│ │ Assignee    Marcus Vale (you)                                           │ │
│ │ Last activity  12 September 2026 09:11 UTC (3 days ago)                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌── TYPE-SPECIFIC CONTENT SECTIONS ──────────────────── <h2> ─────────────┐ │
│ │  Rendered from contentProfile. See SCR-15…19 for each profile.          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌── RELATED ITEMS IN OTHER SYSTEMS ──────────────────── <h2> ─────────────┐ │
│ │  Grouped by relationship type, each group with a heading and a count.   │ │
│ │  See Y0-patterns and SCR-15 for the full treatment — this panel is the  │ │
│ │  ON-RAMP TO THE FLAGSHIP WORKFLOW.                                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌── ACTIONS ─────────────────────────────────────────── <h2> ─────────────┐ │
│ │  Server-computed ActionDescriptor[] only. See Y0-patterns §Action panel.│ │
│ │                                                                         │ │
│ │  [ Record finding ]              ← at most ONE primary                  │ │
│ │  [ Request clarification ]       ← usa-button--outline                  │ │
│ │  [ Acknowledge assignment ] (disabled)                                  │ │
│ │  Investigation Management isn't responding right now. Try again when    │ │
│ │  it's back.          ← disabledReason as ADJACENT TEXT, aria-describedby│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌── ACTIVITY HISTORY ────────────────────────────────── <h2> ─────────────┐ │
│ │  ONE chronology merging the spoke's own history with hub audit records. │ │
│ │                                                                         │ │
│ │  2026-09-15 15:04 UTC (2 hours ago)                                     │ │
│ │  Marcus Vale · Investigator                                             │ │
│ │  Resolved issue ISS-2207 — Substantiated                                │ │
│ │  ▣ Recorded by PVQ          01JD7K2Q… [ View audit chain → ]            │ │
│ │  ─────────────────────────────────────────────────────────────────────  │ │
│ │  2026-09-15 15:04 UTC (2 hours ago)                                     │ │
│ │  Marcus Vale · Investigator                                             │ │
│ │  Outstanding issues: 1 → 0                                              │ │
│ │  ▣ Recorded by the unified layer   01JD7K2Q… [ View audit chain → ]     │ │
│ │  ─────────────────────────────────────────────────────────────────────  │ │
│ │  2026-09-12 09:11 UTC (3 days ago)                                      │ │
│ │  PVQ system                                                             │ │
│ │  Issue raised against Section 13A — Employment history                  │ │
│ │  ▣ Recorded by PVQ                                                      │ │
│ │                                                                         │ │
│ │  [ Load more ]   ← appends, announces "20 more entries loaded."         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ [ Back to work queue ]        ← repeated in the action-panel footer         │
```

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | Item title (`<h1>`) + summary header | Top | Identity and state at a glance |
| **Primary** | System of record, **in text** | Summary header | Attribution survives every context change |
| **Primary** | Type-specific content | Main body | The substance of the work |
| **Primary** | Related items | After content, before actions | Discovery **precedes** action — the flagship on-ramp |
| **Primary** | Action panel | After related items | Where work gets done |
| Secondary | Activity history | Bottom | The record left behind |
| Secondary | Back-to-queue | Above `<h1>` **and** in the action footer | Return is always one control away |
| Tertiary | Synthetic-record marker | Summary header | Honesty invariant per record |

#### States

| Region | State | Appearance | Copy |
|---|---|---|---|
| **Page** | Loading | Section-level skeletons preserving layout; summary header settles first | sr-only "Loading work item" |
| | **Not authorised / not found** | → SCR-30 inside the shell | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {id}." **A forbidden item and a non-existent item are indistinguishable** |
| | **Owning system unavailable** | Error state **inside the shell**, never blank | "{System} isn't responding right now, so we can't show this item. Your other work is still available." + `[Try again]` + `[Back to work queue]` |
| | **Application disabled** | Error state | "{System} is turned off in this environment. Contact your administrator if you need access." |
| | **Malformed spoke response** | Error state | "We couldn't read this item from {System}. We've logged the problem — reference {id}." |
| **Related items** | Ready | Grouped list with badges | — |
| | Empty | `usa-alert--info --slim` | "No related items in other systems." |
| | **Target down** | Entry renders **with an explanation, not a broken link** | "{System} isn't responding right now, so this related item can't be opened." |
| | **Not entitled to target** | Entry renders with explanation | "You don't have access to the related item in {System}." |
| | **Unconfirmable reference** | Entry renders | "This related item couldn't be confirmed. We've logged the problem — reference {id}." |
| **Actions** | Ready | Server-computed set | — |
| | Disabled | Control disabled + adjacent reason text | Per `disabledReason` |
| | Submitting | Button busy, `aria-busy` | "Recording finding…" announced once |
| **Activity history** | Ready | Merged chronology, 20/page | — |
| | Empty | `usa-alert--info --slim` | "No activity recorded yet." |
| | **Spoke history unavailable** | Hub records still render + notice | "Some history from {System} isn't available right now." |

#### The four failure classes (never conflated)

Every failure resolves to exactly one of four user-visible classes, each with its own recovery — and **every message states whether anything changed** (FR-F06-07):

| Class | Copy | Recovery offered | Changed anything? |
|---|---|---|---|
| **Not permitted** | "You don't have permission to do that." | Return to item — **no retry**, because retrying will not help | No |
| **Input invalid** | Error summary + per-field guidance | Fix and resubmit | No |
| **Source unavailable** | "{System} isn't responding right now, so nothing was changed." | `[Try again]` + `[Back to work queue]` | **No** |
| **Unexpected error** | "Something went wrong on our side. Nothing was changed. Reference {id}." | `[Try again]` + `[Go to dashboard]` | **No** |

> **The one permitted ambiguity** is `UPSTREAM_INDETERMINATE`: "We're not sure whether {System} completed this action. Refresh this item to check its current status before trying again — reference {id}." Its copy **explicitly says the outcome is unknown** and tells the user how to check. Every other message is definite.

**No failure message contains a stack trace, exception class, hostname, port, SQL, or spoke-internal identifier.** Every failure displays a copyable correlation ID.

#### Action forms

Generated from `ActionDescriptor.formSchema`; each field declares label, type, required, maxLength, options, hint, and validation message.

- Client validation runs **on submit, not on every keystroke**, and mirrors server rules exactly (same schema).
- **Submission is not optimistic.** The UI shows a busy state and reflects new state **only after the spoke confirms the write** — displayed state never diverges from the system of record.
- Double-submit protection via a client-generated `idempotencyKey`; a repeat within 10 minutes returns the original outcome **without re-executing**.
- Success renders a `usa-alert--success` naming **exactly what changed and where** — "Issue ISS-2207 marked Resolved — Substantiated in PVQ." — announced politely, **with focus moved to the alert**.
- **After a successful action the user stays on the detail page** with updated state and the success alert. A secondary control offers "Back to work queue." **The user is never involuntarily navigated away from evidence of what they just did** (FR-F06-12 rule 2).
- `stateVersion` is a hidden field; a mismatch returns `STATE_CONFLICT`: "This item changed since you opened it. Refresh to see the latest version, then try again."

#### Accessibility notes

- **Heading hierarchy:** `<h1>` item title → `<h2>` per region (Summary, content sections, Related items, Actions, Activity history) → `<h3>` per content subsection and per related-item group. Gap-free, no skipped levels.
- **Landmarks:** `main` contains the whole detail; Related items and Actions are `<section aria-labelledby>`; the breadcrumb is `<nav aria-label="Breadcrumb">`.
- **Focus management on entry:** arriving from the queue moves focus to the `<h1>` and updates `document.title`.
- **Focus management on async success:** the success alert **receives focus** — this is a result the user submitted and is waiting for. Contrast with degraded notices, which never take focus.
- **Focus management on validation failure:** focus moves to the error summary; title prefixed "Error: "; each entry links in-page to its field.
- **Focus management on return:** "Back to work queue" restores the queue **and returns focus to the originating row**.
- **Disabled actions** are removed from the tab order, with `disabledReason` rendered as **adjacent visible text** joined via `aria-describedby` — so a keyboard user learns *why* rather than finding an inert control.
- **Related items panel** is a `<section aria-labelledby>` containing an accessible **list**, not a bare set of links. Each entry's accessible name includes the relationship label and the source system.
- **Activity history** is an `<ol>`; each entry names actor, role at action, origin badge ("Recorded by PVQ" / "Recorded by the unified layer"), absolute UTC timestamp **and** relative time. "Load more" appends and announces the count — it does not replace content or move focus.
- **Correlation link** accessible name: "View the full audit chain for this action."
- **Colour-independent meaning:** status, priority, overdue, origin, and outcome are all text + distinct icon shape.
- **Source attribution** appears in the summary header **as text** ("System of record: PVQ — Personnel Vetting Questionnaire"), not only as a badge.
- **Keyboard:** every control — back link, breadcrumb segments, disclosures, form fields, actions, history pagination — reachable and operable in visual order. Modals (destructive confirmations) trap focus, close on Escape, restore focus to the invoking control.
- **Target sizes** ≥44×44 px throughout.
- **320px reflow:** regions stack in the normative order; the summary header becomes a stacked definition list; an `usa-in-page-navigation` jump list is provided so the **action panel is reachable without scrolling past the entire content body**. No horizontal page scroll.

#### Acceptance

- Each role can open at least one item and see full detail with **correct attribution**.
- A forbidden item and a non-existent item are **indistinguishable** in the response.
- With the owning spoke down, the page renders its error state **inside the shell, never a blank page**.
- Each role completes at least one **real, persisted action** visible in both the spoke's own API and the audit trail.
- A double-submitted action **executes once**.
- All four failure classes are reachable and render their designed presentations.

---
### Screen: SCR-15 — eApp case view — THE HINGE OF THE FLAGSHIP JOURNEY

> **This is where the product's thesis is either proven or lost.** Everything else is supporting cast. The design question this screen answers: **how is a cross-system relationship made visible and traversable without leaving the shell?**

**Purpose:** Present a full eApp questionnaire case, and surface the **related PVQ issue inline** — explained in words, resolved live through the adapter, and traversable in one activation without a login, a new tab, or a re-typed identifier.
**User Stories:** US-059, US-060, US-061, US-062, US-055, US-050, US-056 · **Features:** F7, F6, F2, F9, F13, F14
**Template:** `DetailPage` · **Seeded demo case:** `EAPP:CASE-A-1042`, subject `SUBJ-00418`

#### Layout

```
│ ‹ Back to work queue                                                          │
│ Work Queue › ▣ eApp Case A-1042                                               │
│                                                                               │
│ Case A-1042 — Security questionnaire review                     <h1>          │
│                                                                               │
│ ┌── CASE SUMMARY ──────────────────────────────────────────────────────────┐ │
│ │ System of record: eApp — Electronic Application                          │ │
│ │ Synthetic record — demo data                                             │ │
│ │                                                                          │ │
│ │ Case reference   CASE-A-1042        Submitted   2 August 2026            │ │
│ │ Subject          SUBJ-00418 · Theodore Q. Lansbury                       │ │
│ │ Case status      Under review       Due         19 Sep 2026 (4 days)     │ │
│ │ Investigator     Marcus Vale (you)                                       │ │
│ │                                                                          │ │
│ │ ╔══════════════════════════════════════════════════════════════════════╗ │ │
│ │ ║ ⚠  1 outstanding issue                            [ Go to issue ↓ ]  ║ │ │
│ │ ╚══════════════════════════════════════════════════════════════════════╝ │ │
│ │   ★ FIRST-CLASS ELEMENT, not a field in a list. It is a LINK that moves  │ │
│ │     FOCUS to the related-items panel heading. When the flagship workflow │ │
│ │     resolves the issue this becomes "No outstanding issues" — THE        │ │
│ │     VISIBLE PROOF THAT eApp CHANGED. Sourced from eApp's OWN API, never  │ │
│ │     a hub-computed guess. (FR-F06-08 rule 2)                             │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── QUESTIONNAIRE SECTIONS ──────────────────────────── <h2> ──────────────┐ │
│ │  usa-accordion — collapsible, heading-structured, STABLE ANCHORS         │ │
│ │                                                                          │ │
│ │  ▸ Section 12 — Where you have lived            #SECTION_12       <h3>   │ │
│ │  ▾ Section 13A — Employment history             #SECTION_13A      <h3>   │ │
│ │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│ │  │ ⚠ Issue raised on this section                                     │ │ │
│ │  │   ↑ TEXT MARKER, shown when arrived at via the related-item link   │ │ │
│ │  │                                                                    │ │ │
│ │  │ Employer 1                                                         │ │ │
│ │  │   Employer name    Meridian Logistics Group                        │ │ │
│ │  │   Position         Systems analyst                                 │ │ │
│ │  │   Start date       June 2016                                       │ │ │
│ │  │   End date         March 2019      ◀── THE FLAGGED ANSWER          │ │ │
│ │  │                                        answerLocus:                │ │ │
│ │  │                                        SECTION_13A.employer[0]     │ │ │
│ │  │                                                     .endDate       │ │ │
│ │  │ Employer 2                                                         │ │ │
│ │  │   Employer name    Northbridge Systems                             │ │ │
│ │  │   Start date       April 2019                                      │ │ │
│ │  └────────────────────────────────────────────────────────────────────┘ │ │
│ │  ▸ Section 13B — Employment record              #SECTION_13B      <h3>   │ │
│ │  ▸ Section 22 — Police record                   #SECTION_22       <h3>   │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ╔══ RELATED ITEMS IN OTHER SYSTEMS ═══════════════════ <h2> ═══════════════╗ │
│ ║  ★★★ THE MOMENT THE PRODUCT EARNS THIS PERSONA ★★★                       ║ │
│ ║  Resolved LIVE through the PVQ, PDT, and IM adapters. No joins, no        ║ │
│ ║  shared schema, no hard-coded links. The main case content does NOT      ║ │
│ ║  wait on this panel — it renders its own skeleton and settles            ║ │
│ ║  independently. (FR-F07a-02 rule 4)                                      ║ │
│ ║                                                                          ║ │
│ ║  ┌─ Issues raised against this case (1) ───────────────── <h3> ───────┐ ║ │
│ ║  │                                                                     │ ║ │
│ ║  │  ▣ PVQ   Issue ISS-2207                              ○ Open        │ ║ │
│ ║  │                                                                     │ ║ │
│ ║  │  "Issue raised against Section 13A — Employment history"            │ ║ │
│ ║  │    ↑ THE RELATIONSHIP EXPLAINED IN WORDS.                           │ ║ │
│ ║  │      Sourced from PVQ's answerSectionLabel — NOT composed by the    │ ║ │
│ ║  │      UI, NOT hard-coded. Changing the seeded label changes what     │ ║ │
│ ║  │      appears here. (FR-F07a-03 AC-3)                                │ ║ │
│ ║  │                                                                     │ ║ │
│ ║  │  Raised 12 September 2026 (3 days ago)                              │ ║ │
│ ║  │                                                                     │ ║ │
│ ║  │  [ Open this issue → ]  ◀══ THE TRAVERSAL                           │ ║ │
│ ║  │                             in-shell · no tab · no login · no       │ ║ │
│ ║  │                             identifier typed                        │ ║ │
│ ║  └─────────────────────────────────────────────────────────────────────┘ ║ │
│ ║                                                                          ║ │
│ ║  ┌─ Position designation (1) ──────────────────────────── <h3> ───────┐ ║ │
│ ║  │  ▣ PDT   PDT-0771 · Tier 5 designation · ✓ Approved                │ ║ │
│ ║  │  "Position designation for this case"          [ Open → ] SCR-17   │ ║ │
│ ║  └─────────────────────────────────────────────────────────────────────┘ ║ │
│ ║                                                                          ║ │
│ ║  ┌─ Case assignment (1) ───────────────────────────────── <h3> ───────┐ ║ │
│ ║  │  ▣ IM    IM-3310 · Assignment · ● Active                           │ ║ │
│ ║  │  "Investigation assignment for this case"      [ Open → ] SCR-19   │ ║ │
│ ║  └─────────────────────────────────────────────────────────────────────┘ ║ │
│ ║                                                                          ║ │
│ ║  ★ THREE relationship types, THREE systems. The cross-system story is    ║ │
│ ║    not a single link — it is a genuine web, resolved live. (seed P4, P5) ║ │
│ ╚══════════════════════════════════════════════════════════════════════════╝ │
│                                                                               │
│ ┌── ACTIONS ──────────────────────────────────────────── <h2> ─────────────┐ │
│ │  INVESTIGATOR: [ Record finding ] [ Request clarification ]              │ │
│ │                [ Acknowledge assignment ]                                │ │
│ │  ADJUDICATOR:  [ Adjudicate case ] [ Return for clarification ]          │ │
│ │  APPLICANT (own, only when INFORMATION_REQUESTED):                       │ │
│ │                [ Submit response ]                                       │ │
│ │   ↑ SAME SCREEN, DIFFERENT SERVER-COMPUTED SETS — see Flow 3             │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── ACTIVITY HISTORY ─────────────────────────────────── <h2> ─────────────┐ │
│ │  Merged spoke + hub chronology with origin badges and correlation links  │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
```

#### How the relationship is made visible and traversable — the design decisions

| Decision | What it is | Why |
|---|---|---|
| **Relationship stated in prose, not as an ID** | "Issue raised against Section 13A — Employment history" | An opaque reference (`ISS-2207 → CASE-A-1042`) is what the scratch document already does. The *sentence* is the product |
| **Label sourced from PVQ, not composed by the UI** | `answerSectionLabel` comes over the adapter | Makes the link demonstrably **live**. Editing the seeded label changes the screen — proof it is not hard-coded |
| **Grouped by relationship type with a heading and count** | Three `<h3>` groups | A screen-reader user can navigate by heading straight to "Issues raised against this case" |
| **Panel loads independently of case content** | Separate `DataRegion`, own skeleton | A slow PVQ must not delay the case. Continuity beats completeness in load order |
| **Outstanding-issue indicator is a focus-moving link** | Anchors to the panel heading | The count in the header and the panel below are **the same fact**, connected by one keystroke |
| **Traversal is a client route change** | `/work/PVQ:ISS-2207?returnTo=…&from=EAPP:CASE-A-1042` | The shell **never unmounts**. No tab, no iframe, no spoke origin, no interstitial |
| **`from` is context only, never authorisation** | Used for breadcrumb and audit | Authorisation for the issue is evaluated **independently** — the client does not get to widen its own scope |
| **Traversal itself is audited** | `RELATED_ITEM_TRAVERSED` | The audit chain shows the **path**, not just the endpoints |
| **Unresolvable refs render with an explanation** | Never a broken link, never a silent omission | A reference the hub cannot corroborate is shown as uncertain, with a correlation ID |

#### States

| Region | State | Appearance | Copy |
|---|---|---|---|
| **Outstanding-issue indicator** | Open issues | `usa-alert--warning --slim`, "⚠ 1 outstanding issue" + link | — |
| | **Resolved (post-flagship)** | `usa-alert--success --slim`, "✓ No outstanding issues" | **The visible proof eApp changed.** Re-read from eApp's own API |
| | **Partial completion pending** | `usa-alert--warning`, still "1 outstanding issue" **plus** advisory | "A resolution was recorded in PVQ on {date} but hasn't been applied to this case yet. We're retrying automatically." **The UI never fakes convergence** |
| **Questionnaire** | Loading | Skeleton sections preserving height | sr-only "Loading questionnaire sections" |
| | Ready | Collapsed accordions, first section expanded | — |
| | Arrived via related link | Target section **expanded**, focus on its `<h3>`, text marker "Issue raised on this section" | — |
| **Related items** | Loading | Own skeleton, independent of case body | sr-only "Loading related items" |
| | Ready | Grouped entries with badges | — |
| | Empty | `usa-alert--info --slim` | "No related items in other systems." |
| | **PVQ down** | Entry renders, link disabled, reason shown | "PVQ isn't responding right now, so this related issue can't be opened." |
| | **Not entitled** | Entry renders with explanation | "You don't have access to the related item in PVQ." |
| | **Reference unconfirmable** (subject mismatch / missing case) | Entry renders as uncertain | "This related item couldn't be confirmed. We've logged the problem — reference {id}." |
| | Unknown target system | Entry **dropped and logged** | Never rendered as a dead link |
| **Actions** | eApp down | All disabled with reason | "eApp isn't responding right now." |
| | PVQ down (for the resolve path) | Resolve disabled **pre-emptively** | "eApp isn't responding right now, so this issue can't be resolved yet." |
| **Page** | Owning system down | Error state inside shell | "eApp isn't responding right now, so we can't show this item. Your other work is still available." + `[Try again]` + `[Back to work queue]` |
| | Not authorised | → SCR-30, non-enumerable | — |

#### Interactive elements

| Element | Component | Behaviour |
|---|---|---|
| "Go to issue" (outstanding indicator) | `usa-link` | Anchors to related-panel heading and **moves focus** there |
| Questionnaire section | `usa-accordion` | `aria-expanded`, expansion announced; stable `#SECTION_*` anchors; deep-linkable |
| **"Open this issue"** | `usa-button--outline` in the related panel | **The flagship traversal** → SCR-16 carrying `returnTo` and `from` |
| PDT / IM related entries | `usa-button--outline` | → SCR-17 / SCR-19, same in-shell pattern |
| Action buttons | Per `Y0-patterns §Action panel` | Server-computed set |
| Breadcrumb "Work Queue" | `usa-breadcrumb` link | Restores filters, sort, page |
| "Back to work queue" | `usa-button--unstyled` | Restores queue **and focus to originating row** |

#### Accessibility notes

- **Heading hierarchy:** `<h1>` "Case A-1042 — Security questionnaire review" → `<h2>` Case summary / Questionnaire sections / Related items in other systems / Actions / Activity history → `<h3>` per questionnaire section and per related-item group. **Gap-free** — a screen-reader user can reach "Issues raised against this case" by heading navigation alone.
- **The related-items panel is a `<section aria-labelledby>` containing an accessible list** (`<ul>` of grouped entries), not a bare pile of links. Each entry's accessible name is the full relationship sentence plus the source system — e.g. "Issue raised against Section 13A — Employment history, source system: Personnel Vetting Questionnaire, status Open."
- **Source attribution is in the accessible name of every panel and row** — never conveyed by a coloured badge alone (NFR-02).
- **Focus management on traversal (the highest-risk a11y step in the product):** activating "Open this issue" **must** produce a descriptive `document.title` change and place focus on SCR-16's new `<h1>`. If focus drops to document top or lands on a detached element, a screen-reader user loses **exactly the continuity this product claims to deliver**. Verified explicitly, not assumed (SM-08).
- **Focus management on anchor navigation:** "Go to issue" and "View this section in the case" both move focus to the target heading, not merely scroll to it.
- **Accordion semantics:** each section header is a `<button>` inside its `<h3>`, with `aria-expanded` and `aria-controls`; expansion state is announced.
- **Anchors are stable and deep-linkable** (`#SECTION_13A`), so a related issue can point at the exact answer and a returning link lands in the right place.
- **The "Issue raised on this section" marker is text**, not a highlight colour — legible in grayscale and to a screen reader.
- **Outstanding-issue indicator** conveys its state by icon shape + text ("⚠ 1 outstanding issue" / "✓ No outstanding issues"), never by colour alone. Its change after the flagship action is announced politely.
- **Related-panel loading is announced once on settle** ("Related items loaded. 3 items.") and **does not move focus** — the user may be reading the questionnaire.
- **Degraded related-item entries stay focusable and explained**; a disabled link is paired with adjacent reason text via `aria-describedby`.
- **Keyboard:** entire screen operable — back link, breadcrumb, accordions, related-item links, actions, history. No keyboard traps. Tab order follows visual order.
- **Target sizes** ≥44×44 px; related-item entries are fully clickable cards.
- **320px reflow:** regions stack in normative order. The related-items panel is **promoted above the questionnaire sections at <640px**, because on a narrow viewport the relationship is the reason the user is here and must not sit below four collapsed accordions. An `usa-in-page-navigation` jump list provides direct access to Related items, Actions, and Activity history. No horizontal scroll; usable at 200% zoom.

#### Acceptance

- Case A-1042 shows its related **PVQ issue, PDT designation, and IM assignment**, each correctly badged (FR-F06-05 AC-1).
- The relationship is **sourced live through the adapter** — deleting it in PVQ's store removes it from the panel with no code change (AC-2).
- The relationship **label is sourced from PVQ's data**, verified by changing the seeded label and observing the UI change.
- The outstanding-issue indicator **reflects eApp's state as returned by its own API**, not a hub-computed guess.
- The case opens from the queue in **one activation with no interstitial**, and **zero authentication events** occur.
- Supports **anchor navigation to a named questionnaire section**.
- Traversal produces **zero authentication events and zero navigations outside the hub origin** (SM-02).

---
### Screen: SCR-16 — PVQ issue detail and resolution form

**Purpose:** The destination of the flagship traversal, and the product's **most consequential write**. Present the flagged answer in context, take a disposition and a narrative, and hand off to the orchestrated dual-system update.
**User Stories:** US-062, US-063, US-052, US-113, US-126 · **Features:** F7, F6, F2, F14, F16
**Template:** `DetailPage` + `FormPage` action region · **Seeded demo issue:** `PVQ:ISS-2207`

#### Layout

```
│ ‹ Back to eApp Case A-1042                                                    │
│ Work Queue › ▣ eApp Case A-1042 › ▣ PVQ Related Issue ISS-2207               │
│   ↑ THE CONTINUITY PROOF: breadcrumb names BOTH systems, in one line,        │
│     with no identifier typed by the user                                     │
│                                                                               │
│ Issue ISS-2207 — Section 13A employment end date                <h1>          │
│                                                     ← focus lands HERE on    │
│                                                       traversal              │
│ ┌══ RELATED CASE CONTEXT STRIP ═══════════════════════════════════════════┐  │
│ │ ▣ eApp   Part of Case A-1042 — Theodore Q. Lansbury        [ Open → ]   │  │
│ │   ↑ the case context travels WITH him. He never has to remember where   │  │
│ │     he came from, and the way back is one control. (FR-F07a-03 rule 3)  │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── ISSUE SUMMARY ─────────────────────────────────────────────────────────┐ │
│ │ System of record: PVQ — Personnel Vetting Questionnaire                  │ │
│ │ Synthetic record — demo data                                             │ │
│ │ Status  ○ Open      Raised  12 Sep 2026 (3 days ago)                     │ │
│ │ Subject SUBJ-00418 · Theodore Q. Lansbury                                │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── THE FLAGGED ANSWER, QUOTED IN CONTEXT ───────────── <h2> ──────────────┐ │
│ │  usa-summary-box                                                         │ │
│ │                                                                          │ │
│ │  Section 13A — Employment history                                        │ │
│ │                                                                          │ │
│ │  Question                                                                │ │
│ │  "Provide the end date of your employment with this employer."           │ │
│ │                                                                          │ │
│ │  Answer as submitted                          ← answerSnapshot, stored   │ │
│ │  ┌────────────────────────────────────────┐    by PVQ so the issue stays │ │
│ │  │  March 2019                            │    readable even if the      │ │
│ │  └────────────────────────────────────────┘    answer later changes      │ │
│ │                                                                          │ │
│ │  Why this was raised                                                     │ │
│ │  The end date does not reconcile with the employer's HR record.          │ │
│ │                                                                          │ │
│ │  [ View this section in the case → ]  ← deep-anchors to #SECTION_13A     │ │
│ │                                          on SCR-15 and MOVES FOCUS       │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── RESOLVE THIS ISSUE ──────────────────────────────── <h2> ──────────────┐ │
│ │                                                                          │ │
│ │  <fieldset>  <legend>Resolution disposition (required)</legend>          │ │
│ │                                     ← RADIO not select: the options are  │ │
│ │  ( ) Substantiated                    few and CONSEQUENTIAL              │ │
│ │      The discrepancy is confirmed and material to the investigation.     │ │
│ │  ( ) Unsubstantiated                  ← each option carries hint text    │ │
│ │      The discrepancy was not confirmed; the answer stands.                 via aria-describedby
│ │  ( ) Resolved with clarification                                         │ │
│ │      The subject or a source provided information that resolves it.      │ │
│ │  ( ) Referred for further review                                         │ │
│ │      Requires escalation. This does NOT clear the case's outstanding     │ │
│ │      issue.                     ← the non-clearing path, stated UP FRONT │ │
│ │  </fieldset>                                                             │ │
│ │                                                                          │ │
│ │  Resolution narrative (required)                                         │ │
│ │  How you resolved this issue. An adjudicator may read this months from   │ │
│ │  now without other context.        ← usa-hint, aria-describedby          │ │
│ │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│ │  │ Contacted Meridian Logistics HR on 11 September. Their record       │ │ │
│ │  │ shows separation in January 2019, not March...                      │ │ │
│ │  └────────────────────────────────────────────────────────────────────┘ │ │
│ │  usa-character-count: 247 of 4000 characters                             │ │
│ │   ↑ announced POLITELY at 90% and 100% ONLY — never per keystroke        │ │
│ │                                                                          │ │
│ │  [x] I have reviewed the flagged answer (required)                       │ │
│ │      ↑ the DELIBERATE-ACTION GATE                                        │ │
│ │                                                                          │ │
│ │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│ │  │ ⓘ This updates PVQ and eApp.                                     │   │ │
│ │  │   ↑ THE USER IS TOLD BEFORE THEY ACT that two systems change.    │   │ │
│ │  │     Text updates LIVE as the disposition selection changes —     │   │ │
│ │  │     "Referred for further review" changes it to "This updates    │   │ │
│ │  │     PVQ." (FR-F06-03 rule 3)                                     │   │ │
│ │  └──────────────────────────────────────────────────────────────────┘   │ │
│ │                                                                          │ │
│ │  [ Resolve issue ]        [ Cancel ]                                     │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── ISSUE HISTORY ────────────────────────────────────── <h2> ─────────────┐ │
```

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | Related-case context strip | Directly under `<h1>` | Continuity: he must never wonder where he is or how to get back |
| **Primary** | The flagged answer, quoted | Above the form | **He cannot write a defensible narrative without the answer on screen.** Today he writes it blind and over-explains to compensate |
| **Primary** | Disposition radios | Form top | The consequential choice |
| **Primary** | Narrative textarea | Form middle | The record an adjudicator reads in nine months |
| **Primary** | Dual-system notice | Immediately above submit | Blast radius disclosed **before** the act |
| Secondary | Issue summary | Under the context strip | Status, dates, subject |
| Secondary | Issue history | Bottom | — |

#### States

| State | Appearance | Copy / behaviour |
|---|---|---|
| **Ready** | Form enabled, disposition unselected | — |
| **Loading** | Section skeletons; context strip settles first | sr-only "Loading issue" |
| **Submitting** | Primary button disabled, `aria-busy="true"` | Announced once: "Resolving issue. This updates two systems." **Not optimistic** — no state shown until both spokes answer |
| **Validation failure** | Error summary at form top, `role="alert"`, **focus moved to it**, in-page links; each field `aria-invalid="true"` + inline error; title prefixed "Error: " | "There is a problem. Fix the following, then try again."<br>• "Choose a resolution disposition."<br>• "Enter at least 20 characters describing how you resolved this issue."<br>• "Confirm that you have reviewed the flagged answer."<br>**THE NARRATIVE IS PRESERVED VERBATIM** |
| **Already resolved** | `usa-alert--info` banner; form **disabled with that reason**; the resolve action is **absent** because the server computes it unavailable | "This issue was already resolved by {actor} on {date}. No further action is needed." |
| **PVQ down** | Page-level error inside the shell | "PVQ isn't responding right now, so we can't open this issue. Your other work is still available." + `[Try again]` + `[Back to the case]` |
| **eApp down (pre-emptive)** | Resolve button **disabled before submission**, reason as adjacent text | "eApp isn't responding right now, so this issue can't be resolved yet." **Half-performing a dual write we already know will fail is worse than declining it** |
| **Recovery** | Button re-enables **without reload** | Announced politely: "eApp is available again. You can now resolve this issue." |
| **Not the assignee** | Action absent; explanatory text | "You don't have permission to resolve this issue." |
| **Stale `stateVersion`** | Error alert | "This item changed since you opened it. Refresh to see the latest version, then try again." |
| **Leg-1 (PVQ) failure** | **Stays on SCR-16**, error alert — **not** SCR-20, because there is no dual outcome to confirm | "PVQ isn't responding right now, so nothing was changed." + `[Try again]` |
| **Indeterminate PVQ outcome** | Error alert, the **one permitted ambiguity** | "We're not sure whether PVQ recorded your resolution. Refresh this issue to check its status before trying again — reference {id}." |
| **Adjudicator viewing** | Resolve action **omitted entirely** (role may never perform it); `[Request clarification]` shown instead | The RBAC contrast, demo Segment 4 |

#### Validation rules (server-authoritative, mirrored client-side)

| Field | Rule | Message |
|---|---|---|
| `disposition` | One of four values | "Choose a resolution disposition." |
| `resolutionNarrative` | ≥20 chars trimmed | "Enter at least 20 characters describing how you resolved this issue." |
| | ≤4000 chars | "Shorten this to 4000 characters or fewer. You've used {m}." |
| `reviewedAnswerConfirmed` | Must be `true` | "Confirm that you have reviewed the flagged answer." |
| `parentCaseId` | Must match the issue's actual `parentCaseRef`, resolved server-side | "We couldn't confirm which case this issue belongs to. Refresh the page and try again — reference {id}." **The client does not get to tell the server which case to update** |

---

### Screen: SCR-20 — Dual-system confirmation

**Purpose:** **Prove** both systems changed, by reporting what each system independently says about itself. This is the peak-trust moment of the entire product.
**User Stories:** US-064, US-065, US-066, US-067, US-068 · **Features:** F7, F13, F16
**Template:** `DetailPage` · **Pattern:** `Y0-patterns §Confirmation with read-back`

#### Layout — COMPLETED

```
│ Work Queue › ▣ eApp Case A-1042 › ▣ PVQ Issue ISS-2207 › Resolution result   │
│                                                                               │
│ Resolution complete                                             <h1>          │
│                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓  PVQ and eApp both updated.                                            │ │
│ │    usa-alert--success · role="status" · RECEIVES FOCUS on render         │ │
│ │    announced once: "Resolution complete. PVQ and eApp both updated."     │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── RESULTS IN EACH CONNECTED SYSTEM ────────────────── <h2> ──────────────┐ │
│ │ <caption>Results in each connected system</caption>                      │ │
│ │ ┌──────────┬──────────────────────┬────────────────────────┬──────────┐ │ │
│ │ │ System   │ What we asked for    │ What the system        │ Outcome  │ │ │  ← th scope="col"
│ │ │          │                      │ reports now            │          │ │ │
│ │ ├──────────┼──────────────────────┼────────────────────────┼──────────┤ │ │
│ │ │ ▣ PVQ    │ Resolve issue        │ Resolved —             │ ✓        │ │ │  ← th scope="row"
│ │ │          │ ISS-2207 as          │ Substantiated          │ Updated  │ │ │
│ │ │          │ Substantiated        │ read 15:04:11 UTC      │          │ │ │
│ │ ├──────────┼──────────────────────┼────────────────────────┼──────────┤ │ │
│ │ │ ▣ eApp   │ Clear outstanding    │ No outstanding issues  │ ✓        │ │ │
│ │ │          │ issue ISS-2207 on    │ Case state: Review     │ Updated  │ │ │
│ │ │          │ Case A-1042          │ complete, pending      │          │ │ │
│ │ │          │                      │ adjudication           │          │ │ │
│ │ │          │                      │ read 15:04:12 UTC      │          │ │ │
│ │ └──────────┴──────────────────────┴────────────────────────┴──────────┘ │ │
│ │                                                                          │ │
│ │  ★ THE "WHAT THE SYSTEM REPORTS NOW" COLUMN IS A FRESH RE-READ FROM      │ │
│ │    EACH SPOKE — not the value the hub intended to write. The timestamp   │ │
│ │    makes that evident. This screen reports OBSERVED state, not ASSERTED  │ │
│ │    state, and that distinction is the whole point. (FR-F07b-04 rule 1)   │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── WHAT YOU RECORDED ────────────────────────────────── <h2> ─────────────┐ │
│ │ Disposition  Substantiated                                               │ │
│ │ Narrative    "Contacted Meridian Logistics HR on 11 September..."        │ │
│ │   ↑ so the user can confirm what they submitted                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ [ View the updated issue in PVQ ]   → SCR-16, re-read from PVQ               │
│ [ Return to eApp Case A-1042 ]      → SCR-15, re-read, "No outstanding issues"│
│ [ Back to work queue ]              → SCR-13, ORIGINAL filters/sort/page     │
│ [ View audit trail for this action ]→ SCR-34 chain, filtered to correlationId│
│    ↑ ALL FOUR ARE REAL DESTINATIONS. All re-read LIVE from their owning      │
│      spokes — the confirmation does NOT cache a pre-computed result and      │
│      present it as a fresh read. (FR-F07a-05 rule 2)                         │
```

#### Layout — PARTIALLY COMPLETED (the honesty state)

```
│ Partly completed                                                <h1>          │
│                          ↑ NOT "success". The word "success" appears NOWHERE │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ !  PVQ recorded your resolution. eApp hasn't been updated yet —          │ │
│ │    we're retrying automatically. You can also retry now.                 │ │
│ │    Reference 01JD7K2Q9X8V3MZ4R6T   [⧉ Copy]                              │ │
│ │    usa-alert--warning · role="alert" · receives focus                    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────┬──────────────────────┬────────────────────────┬──────────────┐  │
│ │ ▣ PVQ    │ Resolve as           │ Resolved —             │ ✓ Updated    │  │
│ │          │ Substantiated        │ Substantiated          │              │  │
│ ├──────────┼──────────────────────┼────────────────────────┼──────────────┤  │
│ │ ▣ eApp   │ Clear outstanding    │ 1 outstanding issue    │ ✕ Not        │  │
│ │          │ issue ISS-2207       │ (unchanged)            │   updated    │  │
│ └──────────┴──────────────────────┴────────────────────────┴──────────────┘  │
│   ↑ EVERY LEG RENDERS, INCLUDING THE FAILED ONE. A leg is never omitted      │
│     for tidiness. (FR-F07b-04 validation rule)                               │
│                                                                               │
│ [ Retry eApp update ]   ← idempotent; available to the original principal    │
│                           and to Administrators                              │
│ [ View the updated issue in PVQ ]  [ Back to work queue ]                    │
│                                                                               │
│ announced once: "Partly completed. PVQ updated. eApp not updated."           │
│                                                                               │
│ ⓘ PVQ's resolution STANDS. No rollback is attempted — reversing a recorded   │
│   investigative disposition would fabricate a false history in the system    │
│   of record. The strategy is FORWARD RECOVERY. (FR-F07b-03 rule 1)           │
│ ⓘ SCR-15 continues to show "1 outstanding issue", because that is GENUINELY  │
│   eApp's state, plus an advisory that a retry is in progress.                │
│   THE UI NEVER FAKES CONVERGENCE. (rule 8)                                   │
```

#### Three outcome presentations

| `overallOutcome` | `<h1>` | Alert | ARIA | Actions |
|---|---|---|---|---|
| `COMPLETED` | "Resolution complete" | `usa-alert--success` | `role="status"` | 4 destinations |
| `PARTIALLY_COMPLETED` | **"Partly completed"** | `usa-alert--warning` | `role="alert"` | + `[Retry eApp update]` |
| `FAILED` | "Not completed" | `usa-alert--error` | `role="alert"` | `[Try again]`, `[Back to the issue]` |

**Additional states**

| Condition | Row copy | Control |
|---|---|---|
| Re-read failed for a system | "We couldn't confirm the current state in {System}." | `[Check again]` — the view **degrades honestly rather than omitting the row** |
| Manual retry failed again | "eApp still isn't responding. PVQ's record is unchanged and correct. We'll keep retrying — reference {id}." | `[Retry]` remains |
| Retries exhausted | "eApp couldn't be updated after several attempts. PVQ's record is correct. An administrator has been notified — reference {id}." | Escalated to the integration-issue log |
| Retry on a completed transaction | "This was already completed. Both systems are up to date." | — |
| Referral disposition (single leg) | Table renders **one row** (PVQ only); `<h1>` "Resolution complete" | eApp leg legitimately absent — the transaction had one leg |

#### Accessibility notes — SCR-16 and SCR-20

- **Heading hierarchy:** SCR-16 `<h1>` issue title → `<h2>` The flagged answer / Resolve this issue / Issue history. SCR-20 `<h1>` outcome → `<h2>` Results in each connected system / What you recorded. Gap-free.
- **Focus on traversal arrival (SCR-16):** focus lands on the `<h1>` and `document.title` updates. This is the single most-watched focus behaviour in the product.
- **Focus on confirmation (SCR-20):** the summary alert **receives focus** and is announced once. This is the **one deliberate exception** to "async updates never take focus" — the user submitted this and is waiting for it. Degraded notices elsewhere must never behave this way; preserving that asymmetry is a requirement, not a detail.
- **Form semantics (SCR-16):** `<fieldset>`/`<legend>` around the disposition radios; per-option hint text via `aria-describedby`; required indicated by the **text** "(required)"; `usa-character-count` announced politely at **90% and 100% only**; textarea labelled with `for`/`id`, never a placeholder-as-label.
- **Error summary:** `role="alert"`, focus moved to it, in-page links to each offending field, `aria-invalid="true"` on the field, document title prefixed "Error: ". **The narrative is preserved verbatim** — losing a long free-text narrative to a validation failure is a trust-destroying event and is explicitly prohibited.
- **Dual-system notice** is plain text in a `usa-alert--slim`, **programmatically associated to the submit button via `aria-describedby`**, and its text updates live with the disposition selection — announced politely, once, debounced.
- **Disabled submit** is removed from the tab order with its reason as adjacent text linked by `aria-describedby`.
- **Confirmation table (SCR-20):** real `<table>` with `<caption>` "Results in each connected system", `<th scope="col">` on all four columns, `scope="row"` on the System cell. Outcome is **text + icon shape** ("✓ Updated" / "✕ Not updated") — never colour alone.
- **Read-back timestamps are text**, so the observed-not-asserted distinction is available non-visually.
- **Correlation ID** is monospace, selectable, with a copy control announcing "Reference copied," and linked to the chain view with the accessible name "View the full audit chain for this action."
- **Keyboard:** SCR-16 and SCR-20 are fully keyboard-operable end to end — this is part of the keyboard-only flagship pass (US-069, SM-08).
- **Colour independence:** every outcome, status, and disposition is text + icon. A grayscale render of SCR-20 still distinguishes completed from partial.
- **Target sizes** ≥44×44 px for radios, checkbox, buttons, and copy control.
- **320px reflow:** the disposition radios stack with full-width hit areas; the confirmation table reflows to **stacked per-system cards**, each retaining "System / What we asked for / What it reports now / Outcome" as a labelled definition list — the per-system read-back is never lost to a horizontal scroll.

#### Acceptance

- The confirmation table shows PVQ `Resolved — Substantiated` and eApp `No outstanding issues`, **both from fresh reads** (SM-03).
- In partial state the table shows one committed and one failed row, **with the retry action present**, and **the word "success" appears nowhere** (R-06).
- SCR-20 passes the accessibility scan and is **fully keyboard-operable**.
- The form validates **identically client-side and server-side**; disabling client validation does not permit an invalid submission.
- Submitting a `parentCaseId` for a different case is **rejected**.
- The dual-system notice appears **before** submission, and the referral disposition writes **only PVQ**.

---
### Screens: SCR-17, SCR-18, SCR-19 — PDT, IEP, and IM views

Lighter than the flagship screens, but **real screens with real states — no dead nav**. Each is the `DetailPage` template with a different `contentProfile`. Every navigation item that reaches them resolves to populated content under seeded data (US-032, SM-05).

---

### Screen: SCR-17 — PDT designation view

**Purpose:** Review a position sensitivity/risk designation and the investigation tier it produced — including **the rule that produced it, stated in text**.
**User Stories:** US-050, US-055, US-057 · **Features:** F6, F2, F9 · **Roles:** Adjudicator (act), Investigator (read), Administrator (read via admin context)

```
│ ‹ Back to work queue                                                          │
│ Work Queue › ▣ PDT Designation PDT-0771                                       │
│                                                                               │
│ Designation PDT-0771 — Systems analyst, Northbridge Systems     <h1>          │
│                                                                               │
│ ┌── SUMMARY ───────────────────────────────────────────────────────────────┐ │
│ │ System of record: PDT — Position Designation Tool                        │ │
│ │ Synthetic record — demo data                                             │ │
│ │ Position     Systems analyst          Organization  Northbridge Systems  │ │
│ │ Status       ● Pending review         Submitted     28 July 2026         │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── POSITION DETAILS ─────────────────────────────────── <h2> ─────────────┐ │
│ │ Position title · Duty location · Supervisory status · Access required    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── SENSITIVITY AND RISK FACTORS ─────────────────────── <h2> ─────────────┐ │
│ │ <caption>Risk factors assessed for this position — 5 factors</caption>   │ │
│ │ ┌────────────────────────────┬────────────┬───────────────────────────┐ │ │
│ │ │ Factor                     │ Assessment │ Contributes to tier       │ │ │  ← th scope="col"
│ │ ├────────────────────────────┼────────────┼───────────────────────────┤ │ │
│ │ │ National security duties   │ Yes        │ Yes                       │ │ │  ← th scope="row"
│ │ │ IT system privilege level  │ Elevated   │ Yes                       │ │ │
│ │ │ Fiduciary responsibility   │ No         │ No                        │ │ │
│ │ │ Public contact             │ Limited    │ No                        │ │ │
│ │ │ Access to classified info  │ Secret     │ Yes                       │ │ │
│ │ └────────────────────────────┴────────────┴───────────────────────────┘ │ │
│ │   ★ AN ACCESSIBLE TABLE, not a risk-matrix graphic                       │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── COMPUTED INVESTIGATION TIER ──────────────────────── <h2> ─────────────┐ │
│ │ usa-summary-box                                                          │ │
│ │                                                                          │ │
│ │   Tier 5 — Single Scope Background Investigation                         │ │
│ │                                                                          │ │
│ │   Why this tier                                                          │ │
│ │   This position was designated Tier 5 because it involves national       │ │
│ │   security duties AND access to classified information at the Secret     │ │
│ │   level or above.                                                        │ │
│ │     ↑ THE RULE THAT PRODUCED IT, STATED IN TEXT — not an opaque output.  │ │
│ │       An adjudicator approving a designation must be able to see the     │ │
│ │       reasoning, not just the result. (FR-F06-09 rule 1)                 │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── ACTIONS ──────────────────────────────────────────── <h2> ─────────────┐ │
│ │  ADJUDICATOR:  [ Approve designation ]                                   │ │
│ │                [ Return designation ]  ← requires a reason               │ │
│ │  INVESTIGATOR: (read-only — no actions rendered)                         │ │
│ │                "You can view this designation but not change it."        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── REVIEW HISTORY ───────────────────────────────────── <h2> ─────────────┐ │
```

| State | Appearance | Copy |
|---|---|---|
| Ready | Populated as above | — |
| Loading | Section skeletons, `aria-busy` | sr-only "Loading designation" |
| Empty (risk factors) | `usa-alert--info --slim` in-table | "No risk factors were recorded for this position." |
| PDT down | Error inside shell | "PDT isn't responding right now, so we can't show this item. Your other work is still available." + `[Try again]` + `[Back to work queue]` |
| Not authorised | → SCR-30, non-enumerable | — |
| Investigator viewing | Action panel shows explanatory text, **no controls** | Read-only actions are **omitted**, not disabled — the role may never perform them |
| Approve submitted | `usa-alert--success`, focus moved | "Designation PDT-0771 approved in PDT." Single-system write |
| Return — missing reason | Error summary, focus moved, in-page link | "Enter a reason for returning this designation." |

**Accessibility:** `<h1>` → `<h2>` per region → `<h3>` where subsections exist, gap-free. Risk factors are a real `<table>` with `<caption>`, `scope="col"`, `scope="row"` — **information conveyed by a chart is always also available as a table** (FR-F14-06 rule 6). The tier rationale is prose, not a colour-coded badge. Assessments ("Yes"/"Elevated"/"Secret") are text. Focus moves to the success alert on completion. 320px: the risk table reflows to stacked cards retaining row-header semantics.

---

### Screen: SCR-18 — IEP applicant status view

**Purpose:** The applicant's task and notice surface — plain language, phone-first, with **every task linking directly to the action that discharges it**.
**User Stories:** US-035, US-049, US-057, US-113, US-122 · **Features:** F6, F2, F15 · **Role:** Applicant (own records only)

```
│ ‹ Back to your dashboard                                                      │
│                                                                               │
│ Confirm your address history for 2019–2021                      <h1>          │
│                                                                               │
│ ┌── WHAT WE NEED ─────────────────────────────────────── <h2> ─────────────┐ │
│ │ usa-summary-box                                                          │ │
│ │                                                                          │ │
│ │ We need you to confirm where you lived between January 2019 and          │ │
│ │ December 2021. The dates you gave us have a gap of about four months.    │ │
│ │                                                                          │ │
│ │ ⚠ Due Friday 18 September 2026                                           │ │
│ │                                                                          │ │
│ │ If we don't hear from you by then, your application will pause until     │ │
│ │ you reply.        ← CONSEQUENCE IN PLAIN LANGUAGE, not a bare due date   │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── YOUR ANSWER ──────────────────────────────────────── <h2> ─────────────┐ │
│ │                                                                          │ │
│ │  Address (required)                                                      │ │
│ │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│ │  │                                                                    │ │ │
│ │  └────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                          │ │
│ │  Lived there from (required)      Lived there to (required)             │ │
│ │  ┌──────────────────┐             ┌──────────────────┐                  │ │
│ │  │ MM / YYYY        │             │ MM / YYYY        │  usa-date-picker │ │
│ │  └──────────────────┘             └──────────────────┘                  │ │
│ │                                                                          │ │
│ │  Anything else we should know (optional)                                 │ │
│ │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│ │  └────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                          │ │
│ │  Supporting document (optional)                                          │ │
│ │  [ Choose file ]  usa-file-input                                         │ │
│ │  usa-hint: PDF, JPG, or PNG. Up to 10 MB.                               │ │
│ │                                                                          │ │
│ │  [ Send this to DCSA ]      [ Save and finish later ]                    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │

          ── ON SUCCESS ──

│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓  We've received your address history.                                  │ │
│ │                                                                          │ │
│ │    What happens next                                                     │ │
│ │    Someone will review what you sent within about two weeks. You don't   │ │
│ │    need to do anything else right now. We'll let you know if we need     │ │
│ │    more.                                                                 │ │
│ │      ↑ NAMES WHAT WAS RECEIVED **AND** WHAT HAPPENS NEXT.                │ │
│ │        A bare "Submitted" leaves her calling her security officer        │ │
│ │        anyway. (JRN-03.01 stage 7)                                       │ │
│ │                                                                          │ │
│ │    [ Back to your dashboard ]                                            │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
```

#### Notices variant

```
│ Interview scheduling                                            <h1>          │
│ ● Unread · 12 September 2026                                                 │
│ ┌── NOTICE ───────────────────────────────────────────────────────────────┐  │
│ │ [ plain-text notice body, escaped, never rendered as HTML ]             │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│ [ Mark as read ]   ← state persists in IEP's OWN store, because it is       │
│                       IEP's record — not the hub's (FR-F06-10 rule 3)        │
```

| State | Appearance | Copy |
|---|---|---|
| Ready | Task form or notice body | — |
| Loading | Skeleton preserving layout | sr-only "Loading" |
| **Empty (no tasks)** | `usa-alert--info` | "You don't have anything to do right now. We'll let you know if that changes." |
| **Empty (no notices)** | `usa-alert--info` | "You have no notices." |
| Validation failure | Error summary, focus moved, in-page links, **plain-language messages, no field codes**; **content preserved** | "Enter the address where you lived." / "Enter the month and year you moved in." |
| IEP down | De-jargoned notice | "Some of your information isn't available right now. Please check back shortly." |
| Not her record | → SCR-30, **identical in body and timing** to a non-existent record | — |
| Session timeout mid-form | SCR-06 → extend → **entered data intact** | — |
| Submitting | Button busy, `aria-busy` | "Sending…" announced once |

> **The zero-item applicant persona** exists precisely so these empty states are demonstrable rather than theoretical (FR-F17-06).

**Accessibility:** `<h1>` is the task name, not "Task detail". Labels are programmatically associated (`for`/`id`), never placeholders. Required marked with the **text** "(required)". Hint text via `aria-describedby`. Error summary `role="alert"` with focus moved and in-page links; fields get `aria-invalid="true"`. `usa-file-input` has a real label and states accepted formats and size in text. Due dates carry the word "Due"/"Overdue" plus an icon, never a red date. Read/unread is text + icon. Success alert receives focus and is announced. **Phone-first: ≥44×44 px targets, 320px with no horizontal scroll, 200% zoom without clipping.** No internal system names in body copy.

---

### Screen: SCR-19 — IM case assignment view

**Purpose:** Case assignment, leads, and workload context. **IM is the designated outage-demonstration spoke**, so this screen's unavailable state is a first-class design deliverable, not an afterthought.
**User Stories:** US-050, US-051, US-058, US-126, US-130 · **Features:** F6, F16 · **Roles:** Investigator (act), Adjudicator (read)

```
│ ‹ Back to work queue                                                          │
│ Work Queue › ▣ IM Case assignment IM-3310                                     │
│                                                                               │
│ Assignment IM-3310 — Background investigation, SUBJ-00418       <h1>          │
│                                                                               │
│ ┌── SUMMARY ───────────────────────────────────────────────────────────────┐ │
│ │ System of record: IM — Investigation Management                          │ │
│ │ Synthetic record — demo data                                             │ │
│ │ Case         IM-3310              Status     ● Active                    │ │
│ │ Assigned to  Marcus Vale (you)    Assigned   4 August 2026               │ │
│ │ Due          19 September 2026    Tier       T5                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── INVESTIGATIVE LEADS ──────────────────────────────── <h2> ─────────────┐ │
│ │ <caption>Leads for this assignment — 3 leads</caption>                   │ │
│ │ ┌──────────────────────┬────────────┬──────────────┬──────────────────┐ │ │
│ │ │ Lead                 │ Type       │ Status       │ Last updated     │ │ │
│ │ ├──────────────────────┼────────────┼──────────────┼──────────────────┤ │ │
│ │ │ Meridian Logistics   │ Employment │ ✓ Complete   │ 11 Sep 2026      │ │ │
│ │ │ Northbridge Systems  │ Employment │ ● In progress│ 14 Sep 2026      │ │ │
│ │ │ Residence 2019–2021  │ Residence  │ ○ Open       │ 4 Aug 2026       │ │ │
│ │ └──────────────────────┴────────────┴──────────────┴──────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── WORKLOAD CONTEXT ─────────────────────────────────── <h2> ─────────────┐ │
│ │ You have 12 active assignments in Investigation Management.              │ │
│ │ 4 are overdue.                        [ View in work queue → ]           │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── ACTIONS ──────────────────────────────────────────── <h2> ─────────────┐ │
│ │  INVESTIGATOR: [ Update case status ] [ Add lead note ]                  │ │
│ │                [ Accept assignment ]                                     │ │
│ │  ADJUDICATOR:  (read-only)                                               │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── STATUS TRANSITIONS ───────────────────────────────── <h2> ─────────────┐ │
```

#### The unavailable state — a first-class deliverable

```
│ ‹ Back to work queue                                                          │
│ Work Queue › ▣ IM Case assignment IM-3310                                     │
│                                                                               │
│ Assignment IM-3310                                              <h1>          │
│                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ !  Investigation Management isn't responding right now, so we can't      │ │
│ │    show this item. Your other work is still available.                   │ │
│ │                                                                          │ │
│ │    Reference 01JD7K2Q9X8V3MZ4R6T   [⧉ Copy]                              │ │
│ │                                                                          │ │
│ │    [ Try again ]      [ Back to work queue ]                             │ │
│ │                                                                          │ │
│ │    usa-alert--warning · role="alert" · focus moved to <h1>               │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ✓ RENDERS INSIDE THE SHELL — demo banner, header, nav, footer all present  │
│  ✓ NO blank page.  ✓ NO stack trace.  ✓ NO console errors.                  │
│  ✓ Working exits.  ✓ Passes the accessibility scan in THIS state.           │
│                                                                              │
│  This screen is explicitly covered by the fault-injection crawl (FR-F19-04) │
│  because IM is the spoke the demo deliberately takes down. (FR-F06-11)      │
```

| State | Appearance | Copy |
|---|---|---|
| Ready | Populated as above | — |
| Loading | Section skeletons | sr-only "Loading assignment" |
| Empty (no leads) | `usa-alert--info --slim` in-table | "No leads have been recorded for this assignment yet." |
| **IM unavailable** | As drawn above | "Investigation Management isn't responding right now…" |
| **IM slow** | Content renders + row note | "Slow to respond." Actions remain **enabled** with a warning: "Investigation Management is responding slowly. This may take longer than usual." |
| Actions blocked | Disabled + adjacent reason | "Investigation Management isn't responding right now. Try again when it's back." |
| Recovery | Controls re-enable **without reload** | Announced politely: "Investigation Management is available again." |
| Adjudicator viewing | Actions **omitted**, explanatory text | — |

**Accessibility:** `<h1>` → `<h2>` per region, gap-free. Leads are a real `<table>` with `<caption>`, `scope="col"`, `scope="row"` on the lead name; lead status is text + icon shape. The unavailable state keeps a valid heading structure and landmark set, moves focus to the `<h1>`, announces via `role="alert"`, and **passes the automated a11y scan in its degraded state** — degraded states are scanned too (FR-F14-12 rule 1). Disabled actions are out of the tab order with reasons as adjacent text. 320px: leads table reflows to stacked cards; no horizontal page scroll.

**Acceptance (SCR-19):** with IM down, the screen shows its unavailable state with **working exits and no console errors** (FR-F06-11 AC-1).

---
### Screens: SCR-22 … SCR-27, SCR-29, SCR-37, SCR-38 — Administrator console

**Purpose:** The administrator's operational view of the unified layer — what is connected, whether it is working, and what has gone wrong. This is the feature that demonstrates the platform is **operable**, not merely usable.
**User Stories:** US-086, US-087, US-088, US-089, US-090, US-091, US-092, US-093, US-125, US-131, US-143 · **Features:** F11, F8, F16
**Template:** `ConsolePage` — `usa-sidenav` sub-navigation + list/detail split

> **The console carries the same shell as every user-facing screen** — same demo banner, same header, same footer. The administrator is **inside the same product**, not in a separate tool (FR-F11-07 rule 5). Every console action is authorized server-side and audited; **the console has no privileged bypass.**

#### Console shell

```
│ Connected applications                                          <h1>          │
│                                                                               │
│ ┌─ usa-sidenav ────────┐ ┌─ CONTENT ──────────────────────────────────────┐  │
│ │ <nav aria-label=      │ │                                                │  │
│ │  "Administrator       │ │                                                │  │
│ │   console">           │ │                                                │  │
│ │                       │ │                                                │  │
│ │ ▸ Connected apps  ◀── │ │    aria-current="page" + VISIBLE non-colour    │  │
│ │ ▸ System health       │ │    indicator (weight + left rule)              │  │
│ │ ▸ Integration issues  │ │                                                │  │
│ │ ▸ Audit trail         │ │                                                │  │
│ │ ▸ Identities & roles  │ │                                                │  │
│ │ ▸ Announcements       │ │                                                │  │
│ │ ▸ Demo operations     │ │                                                │  │
│ └───────────────────────┘ └────────────────────────────────────────────────┘  │
```

---

### Screen: SCR-22 — Connected applications inventory

```
│ Connected applications                                          <h1>          │
│                                            [ Register an application ]        │
│                                                                               │
│ Search [ 🔍 name or ID ]   Status [ All ▾ ]        [ Apply ] [ Clear ]        │
│                                                                               │
│ <caption>Connected applications — 5 registered</caption>                      │
│ ┌────────────┬────────┬────────────┬──────────────┬──────────┬─────────────┐ │
│ │Display name│ ID     │Adapter type│ Work-item    │ Health   │ Enabled     │ │
│ │     ⇅      │  ⇅     │            │ types        │   ⇅      │   ⇅         │ │
│ ├────────────┼────────┼────────────┼──────────────┼──────────┼─────────────┤ │
│ │▣ Electronic│ EAPP   │rest-generic│ 1 ▸          │✓ Healthy │ ✓ Enabled   │ │  ← th scope="row"
│ │  Application│       │ -v1        │              │ 15:04Z   │ [Details →] │ │
│ │▣ Individual│ IEP    │rest-generic│ 2 ▸          │✓ Healthy │ ✓ Enabled   │ │
│ │  Engagement│        │ -v1        │              │ 15:04Z   │ [Details →] │ │
│ │▣ Personnel │ PVQ    │rest-generic│ 1 ▸          │✓ Healthy │ ✓ Enabled   │ │
│ │  Vetting Q.│        │ -v1        │              │ 15:04Z   │ [Details →] │ │
│ │▣ Position  │ PDT    │rest-generic│ 1 ▸          │✓ Healthy │ ✓ Enabled   │ │
│ │  Desig.Tool│        │ -v1        │              │ 15:04Z   │ [Details →] │ │
│ │▣ Investig. │ IM     │rest-generic│ 1 ▸          │✕ Unavail │ ✓ Enabled   │ │
│ │  Management│        │ -v1        │              │ 14:51Z   │ [Details →] │ │
│ └────────────┴────────┴────────────┴──────────────┴──────────┴─────────────┘ │
│                                                                               │
│ ★ DISABLED AND INVALID APPLICATIONS ARE LISTED WITH THEIR STATE CLEARLY       │
│   MARKED — never hidden. An administrator troubleshooting an ABSENCE needs    │
│   to see the row. (FR-F11-01 rule 5)                                          │
│ ★ Health refreshes every 30s, announced politely:                             │
│   "Investigation Management is now unavailable."                              │
```

| State | Copy |
|---|---|
| Empty | "No applications are registered yet. Register your first application to get started." + register action |
| No search matches | "No applications match '{q}'." + clear-search control |
| Registry unreadable | "We can't load the application list right now. Try again in a moment — reference {id}." |
| Not an administrator | → SCR-30: "You don't have access to this page." **Denial audited** |

**Acceptance:** all five spokes appear with configuration read from the registry; the newly registered sixth appears **immediately, without a restart** (SM-12).

---

### Screen: SCR-23 — Application detail

**Purpose:** Everything about one application in one place.

```
│ Investigation Management                                        <h1>          │
│ ▣ IM · rest-generic-v1 · ✕ Unavailable                                        │
│                                                                               │
│ [ Test connection ]  [ Edit configuration ]  [ Disable ]  [ De-register ]     │
│                                                                               │
│ ┌── CONFIGURATION ────────────────────────────────────── <h2> ─────────────┐ │
│ │ Application ID   IM        (immutable — existing records refer to it)    │ │
│ │ Base endpoint    http://im:8085        Health endpoint  /health          │ │
│ │ Visible to roles Investigator, Adjudicator                               │ │
│ │ Registered       1 Aug 2026 by seed                                      │ │
│ │                                                                          │ │
│ │ ⓘ This prototype uses no credentials for spoke connections.              │ │
│ │   ↑ the screen SAYS SO, rather than leaving a reviewer wondering         │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌── CAPABILITIES (from describe(), cached 15:04Z) ────── <h2> ─────────────┐ │
│ ┌── WORK-ITEM TYPES AND STATUS MAPS ──────────────────── <h2> ─────────────┐ │
│ │ <caption>Status map for IM_CASE_ASSIGNMENT — 4 statuses</caption>        │ │
│ │ │ Native status    │ Normalised category │                              │ │
│ │ │ ASSIGNED         │ Open                │   ★ MAPPING IS INSPECTABLE,   │ │
│ │ │ IN_PROGRESS      │ In progress         │     not buried in code        │ │
│ │ │ ON_HOLD          │ Blocked             │                              │ │
│ │ │ CLOSED           │ Closed              │                              │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌── SUPPORTED ACTIONS (+ required permission) ────────── <h2> ─────────────┐ │
│ ┌── RESILIENCE POLICY ────────────────────────────────── <h2> ─────────────┐ │
│ │ timeout 5000ms · action timeout 10000ms · retries 2 · backoff 250ms ×2.0 │ │
│ │ circuit 5 failures / 30000ms · probe interval 30s                        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌── HEALTH HISTORY (last 50 checks) ──────────────────── <h2> ─────────────┐ │
│ ┌── RECENT INTEGRATION ISSUES (last 20) ──────────────── <h2> ─────────────┐ │
│ ┌── PROVENANCE ───────────────────────────────────────── <h2> ─────────────┐ │
```

**Destructive actions** require a **typed confirmation of the display name plus a reason**, and state consequences explicitly with counts: *"This removes Investigation Management from navigation, the work queue, and health monitoring for all users. 12 work items will stop appearing. Audit records that mention Investigation Management are kept."*

| State | Copy |
|---|---|
| Not found | "We couldn't find that application. It may have been removed." |
| Invalid configuration | Warning: "This application's configuration has a problem: {field} — {reason}. It won't appear for users until it's fixed." |
| Confirmation mismatch | "The name you typed doesn't match. Type {displayName} exactly to confirm." |
| Missing reason | "Enter a reason for removing this application." |

---

### Screen: SCR-24 — System health

```
│ System health                                                   <h1>          │
│                                                                               │
│ ✓ Healthy 4      ! Degraded 0      ✕ Unavailable 1                            │
│                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ! Failure injection is active: IM → UNAVAILABLE, auto-clears in 4:12.    │ │
│ │   ↑ SO NO OPERATOR MISTAKES AN INJECTED OUTAGE FOR A REAL ONE.          │ │
│ │     [ Failure injection controls → ]  SCR-38                             │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ <caption>Application health — 5 applications, last checked 15:04 UTC</caption>│
│ ┌──────┬──────────┬───────────┬─────────┬──────┬──────┬─────────┬──────────┐ │
│ │ App  │ Status   │ Last OK   │ Last try│ p50  │ p95  │ Circuit │ Next     │ │
│ ├──────┼──────────┼───────────┼─────────┼──────┼──────┼─────────┼──────────┤ │
│ │▣eApp │✓ Healthy │ 15:04:02Z │15:04:02Z│ 38ms │ 61ms │ Closed  │ 15:04:32Z│ │
│ │▣ IM  │✕ Unavail │ 14:51:11Z │15:04:02Z│  —   │  —   │ OPEN    │ 15:04:32Z│ │
│ │      │          │ 26 consecutive failures      │         │[Check now]│ │
│ └──────┴──────────┴───────────┴─────────┴──────┴──────┴─────────┴──────────┘ │
│                                                                               │
│ ▸ What do these states mean?          ← usa-accordion disclosure with the     │
│   Healthy   — probe succeeded within timeout AND latency ≤ 1500ms             │
│   Degraded  — probe succeeded but slow, OR spoke self-reported degraded,      │
│                OR >20% error rate on the last 10 data calls                   │
│   Unavailable — probe failed, OR the circuit is open                          │
│   ↑ A REVIEWER IS NEVER GUESSING WHAT "DEGRADED" MEANS. (FR-F11-02 rule 4)   │
```

| State | Copy |
|---|---|
| No health data yet | "No health checks have run yet. The first check runs within {n} seconds." |
| **Monitor not running** | Warning: "Health monitoring isn't running. Statuses below may be out of date." — **an absent monitor must never masquerade as all-healthy** (US-125) |

**"Check now"** performs a **live probe bypassing cache and circuit** (an explicit operator action; blocking it would defeat its purpose), announced politely: "Connection test complete. Investigation Management couldn't be reached at http://im:8085."

---

### Screen: SCR-25 — Integration issues log

```
│ Integration issues                                              <h1>          │
│ 14 issues in the last 24 hours                                                │
│                                                                               │
│ Application [All ▾] Error class [All ▾] Operation [All ▾]                     │
│ From [2026-09-14] To [2026-09-15]   [ Apply ] [ Clear all filters ]           │
│ Active: [Last 24 hours ✕]                                                     │
│                                                                               │
│ <caption>Integration issues — 14 results, newest first</caption>              │
│ ┌───────────┬──────┬──────────────┬──────────────┬──────┬────────┬─────────┐ │
│ │Timestamp ▼│ App  │ Operation    │ Error class  │Affect│Attempt │Correlat.│ │
│ ├───────────┼──────┼──────────────┼──────────────┼──────┼────────┼─────────┤ │
│ │14:52:03Z  │▣ IM  │listWorkItems │TIMEOUT       │M.Vale│ 2 of 2 │01JD7K2Q→│ │
│ │           │      │              │circuit: OPEN │      │        │         │ │
│ │14:52:03Z  │▣ IM  │healthCheck   │CONN_REFUSED  │ —    │ 1 of 1 │01JD7K2R→│ │
│ └───────────┴──────┴──────────────┴──────────────┴──────┴────────┴─────────┘ │
│                                                                               │
│ Row expansion reveals the technical detail suppressed from user-facing        │
│ messages: spoke HTTP status · response excerpt (≤1000 chars, ESCAPED) ·       │
│ adapter requestId.  ★ THIS IS THE APPROPRIATE PLACE FOR THAT DETAIL,          │
│   AND THE ONLY PLACE IT APPEARS. (FR-F11-03 rule 3)                           │
│                                                                               │
│ Every row links to: [ audit chain → ] SCR-34   and   [ application → ] SCR-23 │
│ ★ Symptom to context in ONE click.                                            │
│                                                                               │
│ ⓘ Append-only. There is NO resolve/dismiss workflow, and the absence is       │
│   DELIBERATE — the log is EVIDENCE, not a ticket queue. (rule 5)              │
```

| State | Copy |
|---|---|
| No issues in range | **"No integration issues in this period. That's good news."** |
| `ORCHESTRATION_INCOMPLETE` row | Additionally links to the orchestration transaction **with its manual retry action** |
| Export too large | "Narrow your filters — exports are limited to 10,000 records." |

---

### Screens: SCR-26 / SCR-27 — Identities and roles

```
│ Identities & roles                                              <h1>          │
│ <caption>Synthetic identities — 14 identities</caption>                       │
│ │ Display name    │ Roles              │ Org         │ Tier │ Region │ Methods│
│ │ Marcus Vale     │ Investigator       │ FIELD-OPS-E │ T5   │ NE     │CAC/PIV,│
│ │   PER-01        │                    │             │      │        │MFA     │
│ │ Harlan T. Boyce │ Investigator       │ FIELD-OPS-E │ T3   │ NE     │CAC/PIV │
│ │ Ingrid L.       │ Investigator       │ FIELD-OPS-W │ T5   │ SW     │ECA     │
│ │   Vasterling    │   ◀── ECA-only: the pools are genuinely disjoint       │
│ │ Dana Okonkwo    │ Adjudicator        │ FIELD-OPS-E │ T5   │ NE     │CAC/PIV │
│ │   PER-02        │   ◀── ADJUDICATOR ONLY. She may VIEW ISS-2207 and may  │
│ │                 │       not RESOLVE it. (FR-F17-02 rule 4)               │
│ │ Sofia K.        │ Investigator,      │ FIELD-OPS-E │ T5   │ NE     │CAC/PIV,│
│ │   Mendelbaum    │ Adjudicator ◀──────│             │      │        │MFA     │
│ │                 │ the dual-role identity — exercises role switching      │
│ │ Renée Ashford   │ Applicant          │ —           │ —    │ —      │MFA,ECA │
│ │   PER-03        │                    │             │      │        │        │
│ │ Priya Raghunathan│ Administrator     │ DCSA-HQ     │ T5   │NATIONAL│CAC/PIV │
│ │   PER-04        │                    │             │      │        │        │
│ │ … 6 further supporting identities (FR-F17-01: 14 total)                  │

│ SCR-27 Identity detail: roles, all four attributes, allowed sign-in methods,  │
│ and the last 50 audit records for that identity, linked into SCR-33.          │
│ ★ Viewing identity data WRITES a USER_VIEWED audit record — reading identity  │
│   data is itself auditable. (FR-F02-08 AC-2)                                  │
```

Also on the console: a **read-only "Roles and permissions" matrix** rendering the full role × permission table as an accessible `usa-table`, **so a reviewer can inspect the policy rather than infer it from behaviour** (US-025, FR-F11-07 rule 1).

---

### Screen: SCR-29 — Announcement management

```
│ Announcements                                                   <h1>          │
│ 1 active · 0 scheduled · 3 expired          [ Create announcement ]           │
│                                                                               │
│ Form fields: title (5–120) · body (10–2000, PLAIN TEXT, escaped on render)   │
│ severity (Info / Warning / Emergency) · target roles (≥1) ·                   │
│ effective from · expires at · dismissible                                     │
│                                                                               │
│ ⚠ Changing the message will show it again to people who dismissed it.        │
│ ⚠ Emergency announcements are non-dismissible regardless of the setting —     │
│   and STILL never obscure or replace the demo banner. (FR-F11-06 rule 6)      │
│                                                                               │
│ Expire is a SOFT action (sets expiresAt = now). Announcements are never       │
│ hard-deleted, so the audit trail stays meaningful.                            │
```

| Validation | Message |
|---|---|
| `effectiveFrom ≥ expiresAt` | "Enter an end date and time that comes after the start." |
| No target roles | "Choose at least one role to show this to." |

---

### Screens: SCR-37 / SCR-38 — Demo operations and failure injection

**User Stories:** US-131, US-138, US-142, US-143, US-144 · **Features:** F18 (demo operability), F16 (failure injection), F17 (seed validation)

See `Flow-06-admin-issue-triage §Flow 6b` for the full SCR-38 wireframe and state set.

**SCR-37** presents service readiness at a glance: services running (6 of 6), seed-data validation result, active injections with countdowns, and links to the demo scripts and the reset command. It is the pre-demo confidence check (US-142, F18).

**SCR-38** lists every application with its current injection state, controls per mode, a "Clear all" action, and the prominent notice: *"Failure injection is a demonstration tool. Injected states affect all users of this environment."*

---

### Console-wide states

| State | Treatment |
|---|---|
| **Loading** | Per-region skeletons preserving layout, `aria-busy`, completion announced once |
| **Empty** | Designed content per screen (copy above) — never a blank table |
| **Error** | In-region `usa-alert--error` + correlation ID + `[Try again]`; never replaces the page |
| **Degraded** | Health-derived; named and quantified; `role="status"`, announced once |
| **Denied** | → SCR-30 "You don't have access to this page." Audited |
| **Success** | `usa-alert--success`, focus moved, naming exactly what changed |

### Accessibility notes — console-wide

- **Heading hierarchy:** `<h1>` per console screen naming that screen ("System health", "Integration issues") → `<h2>` per region → `<h3>` per expandable subsection. Gap-free.
- **Landmarks:** the sidenav is `<nav aria-label="Administrator console">`, **distinct** from `<nav aria-label="Primary">` — two navs on a page require distinct labels.
- **Current page** in the sidenav: `aria-current="page"` plus a visible non-colour indicator (weight + left rule).
- **All console tables** use the identical caption / `scope="col"` / `scope="row"` / sortable-`<button>`-with-`aria-sort` / `usa-pagination` pattern as the work queue, **so the interaction is learned once** (US-092, FR-F11-07 rule 2).
- **Result counts announced** politely on every filter, sort, or page change.
- **Health and circuit states are text + distinct icon shape**, never a coloured dot. The console survives a grayscale rendering with all status meaning intact.
- **Latency and timestamps are text**, so staleness is legible non-visually.
- **State definitions** live behind an accessible `usa-accordion` disclosure, **not a hover tooltip** — no content requires hover to be discoverable.
- **Correlation IDs** are monospace and selectable with a copy control ("Reference copied" announced politely) and a link whose accessible name is "View the full audit chain for this action."
- **Live probe results** announced once, politely; never a silent spinner.
- **Destructive confirmations** use `usa-modal` — focus trapped, Escape closes, focus restored to the invoking control; the typed-name field is labelled with a specific mismatch error.
- **Failure-injection radio groups** sit in a `<fieldset>` with a `<legend>` naming the application, so a screen-reader user knows which application a group controls without inferring it from table position.
- **Countdowns** update silently and announce only on expiry — never per-second.
- **Target sizes** ≥44×44 px for all row actions, sort buttons, and pagination controls.
- **320px reflow:** the sidenav collapses into the primary menu button and remains fully reachable; console tables reflow to stacked cards retaining caption and row-header semantics (see `Y1-responsive`). No page-level horizontal scroll.

### Acceptance

- Inducing an adapter failure produces a **correctly attributed entry within one health-check interval** (F11 acceptance signal).
- Each entry links to a **real audit chain** sharing its correlation ID.
- **Every console mutation produces an audit record naming the administrator** (US-093).
- An Investigator attempting any console route is **denied and audited** (US-020).
- The role matrix view **matches the enforced policy**, verified against `role_permissions`.
- All console tables pass the accessibility scan.

---
### Screen: SCR-28 — Application registration (multi-step)

**Purpose:** Onboard a sixth application as a **configuration action performed live**, not a code change. The screen that turns "extensible" into something a reviewer watches happen.
**User Stories:** US-094, US-095, US-096, US-097, US-098, US-099, US-100 · **Features:** F12, F8, F11
**Template:** `FormPage` with `usa-step-indicator` · **Target:** complete in **under 5 minutes, live** (SM-11)

> Full flow narrative, branch logic, and the paired investigator-window observation are in `Flow-05-admin-onboarding`. This chunk specifies the screen itself.

#### Layout — step frame (constant across all five steps)

```
│ Admin console › Connected applications › Register an application              │
│                                                                               │
│ Register an application                                         <h1>          │
│    ↑ CONSTANT across steps, so screen-reader users get a stable page identity │
│                                                                               │
│ ┌── usa-step-indicator ───────────────────────────────────────────────────┐  │
│ │  ①────────②────────③────────④────────⑤                                  │  │
│ │ Identity Connection Test  Capabil.  Access                               │  │
│ │           ▲ aria-current="step"                                          │  │
│ │  Step 2 of 5   ← TEXT COUNTER, because progress must never be conveyed   │  │
│ │                  by segment colour alone                                 │  │
│ │  Completed steps are interactive; future steps are not.                  │  │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ Connection                                                      <h2>          │
│    ↑ the CHANGING sub-heading                                                 │
│                                                                               │
│ [ ── error summary renders here on failure, role="alert", receives focus ── ] │
│                                                                               │
│ [ ── step fields ── ]                                                         │
│                                                                               │
│ [ Back ]                                              [ Continue ]            │
```

#### Step 1 — Identity

```
│ Display name (required)                                                       │
│ ┌────────────────────────────────────┐  usa-hint: 3–60 characters. This is   │
│ │ Continuous Vetting Service         │  what users will see.                 │
│ └────────────────────────────────────┘                                       │
│                                                                               │
│ Application ID (required)                                                     │
│ ┌────────────────────────────────────┐  usa-hint: 2–16 characters: capital   │
│ │ CVS                                │  letters, numbers, and underscores,   │
│ └────────────────────────────────────┘  starting with a letter. This can't   │
│                                          be changed later.                    │
│                                                                               │
│ Description (optional)          usa-character-count: 0 of 500                 │
│ ┌────────────────────────────────────────────────────────────────────────┐   │
│ └────────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│ Icon (required)                                                               │
│ ┌──────────────────────────┐  usa-combo-box · TOKEN PICKER, not a colour     │
│ │ visibility           ▾   │  picker. Options presented by NAME and SHAPE.   │
│ └──────────────────────────┘                                                  │
│                                                                               │
│ [?] What does an application need to support?  → onboarding documentation     │
│     ↑ linked WHERE IT IS NEEDED, not only in a repository (FR-F12-08 rule 2) │
```

#### Step 2 — Connection

```
│ Base endpoint (required)      [ http://cvs:8086                        ]      │
│ Health endpoint (required)    [ /health                                ]      │
│ Adapter type (required)       [ rest-generic-v1                     ▾  ]      │
│                                                                               │
│ ▸ Resilience policy (usa-accordion — collapsed, ALL PRE-FILLED WITH DEFAULTS) │
│   Request timeout      [ 5000  ] ms      Action timeout    [ 10000 ] ms       │
│   Health timeout       [ 3000  ] ms      Max retries       [ 2     ]          │
│   Backoff initial      [ 250   ] ms      Backoff multiplier[ 2.0   ]          │
│   Circuit threshold    [ 5     ]         Circuit open for  [ 30000 ] ms       │
│   Health probe interval[ 30    ] s                                            │
│   ↑ COLLAPSED BY DEFAULT: a five-minute live demo must not require reading    │
│     nine tuning fields, but they must be present and editable.               │
```

#### Step 3 — Test connection (the gate)

```
│ Test connection                                                 <h2>          │
│                                                                               │
│ We'll call the application's health and capability endpoints now.             │
│ Nothing is saved yet.                                                         │
│                                                                               │
│ [ Run connection test ]                                                       │
│                                                                               │
│ ── RESULTS (usa-icon-list — TEXT status per check, plus icon) ──              │
│ ✓ Reachable at http://cvs:8086                              42 ms             │
│ ✓ Health check responded                                    HEALTHY           │
│ ✓ Capability description received                                             │
│ ✓ Integration version supported                             v1                │
│ ✓ Work-item types declared                                  1                 │
│ ✓ Actions declared                                          3                 │
│ ✓ Permissions valid                                                           │
│                                                                               │
│ announced once: "Connection test complete. 7 of 7 checks passed."             │
│                                                                               │
│ [ Back ]                                              [ Continue ]            │
│                                                                               │
│ ╔═══ THREE OUTCOMES ══════════════════════════════════════════════════════╗  │
│ ║ PASS    → Continue ENABLED                                              ║  │
│ ║ WARNING → Continue enabled ONLY after an explicit acknowledgement:      ║  │
│ ║           [ ] I understand and want to register this application anyway.║  │
│ ║ FAIL    → Continue DISABLED (out of tab order) + reason as adjacent     ║  │
│ ║           text + [ Test again ].                                        ║  │
│ ║           REGISTRATION IS NOT POSSIBLE UNTIL IT PASSES — a broken       ║  │
│ ║           registration is caught in the FORM, not discovered by users.  ║  │
│ ╚═════════════════════════════════════════════════════════════════════════╝  │
```

| Outcome | Condition | Copy |
|---|---|---|
| **Fail** | Connection refused / DNS | "We couldn't reach that application at {endpoint}. Check that it's running and the address is correct." |
| **Fail** | Health timeout | "The application didn't respond within {n} milliseconds. Check the address, or increase the health check timeout." |
| **Fail** | `describe()` missing/malformed | "The application responded, but didn't describe what it can do in a format we understand. It may not support this integration version." |
| **Fail** | Version unsupported | "This application uses integration version {v}, which we don't support yet. Supported versions: {list}." |
| **Fail** | Unknown permission | "This application asks for permissions this system doesn't have: {list}." |
| **Warning** | Health `DEGRADED` | "The application responded slowly ({n} ms). You can register it, but users may see delays." |
| **Warning** | Zero work-item types | "This application doesn't provide any work items. It will appear in the admin console but not in users' work queues." |

Test results are stored on the draft and **expire after 10 minutes**; submitting with a stale result **re-runs the test automatically**.

#### Step 4 — Capabilities (auto-discovered)

```
│ Capabilities                                                    <h2>          │
│                                                                               │
│ ⓘ Only capabilities the application reports can be registered.                │
│   ↑ You may REMOVE a declared type or action to limit exposure. You may NOT   │
│     INVENT one — registering a capability the adapter cannot deliver would    │
│     produce exactly the dead controls this product forbids. (FR-F12-04 rule 3)│
│                                                                               │
│ Work-item types                                                               │
│ ┌─ CVS_ALERT — "Continuous vetting alert"        Reported by the application ┐│
│ │   [x] Include this type                                                    ││
│ │   Label          [ Continuous vetting alert         ]  ← editable          ││
│ │   Content profile  alert-summary                       ← not editable      ││
│ │                                                                            ││
│ │   Status map (required — every status must be mapped)                      ││
│ │   <caption>Status map for CVS_ALERT — 4 statuses</caption>                 ││
│ │   │ Native status  │ Normalised category │                                ││
│ │   │ NEW            │ [ Open          ▾ ] │                                ││
│ │   │ UNDER_REVIEW   │ [ In progress   ▾ ] │                                ││
│ │   │ CLEARED        │ [ Closed        ▾ ] │                                ││
│ │   │ ESCALATED      │ [ Blocked       ▾ ] │                                ││
│ │   ★ AN INCOMPLETE MAP BLOCKS PROGRESSION, listing unmapped values by name  ││
│ └────────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│ Actions                                                                       │
│ [x] ACKNOWLEDGE_ALERT  "Acknowledge alert"   requires WORK_ITEM.ACT          │
│ [x] CLEAR_ALERT        "Clear alert"         requires WORK_ITEM.ACT          │
│ [x] ESCALATE_ALERT     "Escalate alert"      requires WORK_ITEM.ACT          │
│                                                                               │
│ If describe() is unsupported: empty lists plus guidance —                     │
│ "This application doesn't describe its own capabilities. It will be           │
│  registered with no work-item types."                                         │
```

#### Step 5 — Access and review

```
│ Access & review                                                 <h2>          │
│                                                                               │
│ <fieldset> <legend>Which roles can see this application? (required)</legend>  │
│  [x] Investigator   [ ] Adjudicator   [ ] Applicant   [ ] Administrator      │
│ </fieldset>                                                                   │
│  ↑ NONE PRE-SELECTED — visibility is an explicit decision, never a default   │
│                                                                               │
│ ── Review ──────────────────────────────────────────────────────────────────  │
│ Identity      Continuous Vetting Service · CVS · visibility icon   [ Edit ]   │
│ Connection    http://cvs:8086 · /health · rest-generic-v1          [ Edit ]   │
│ Test          ✓ 7 of 7 checks passed at 15:02:14Z                  [ Edit ]   │
│ Capabilities  1 work-item type · 3 actions                         [ Edit ]   │
│ Access        Investigator                                         [ Edit ]   │
│   ↑ read-only restatement of EVERY value, with a per-step Edit link          │
│                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ⚠ Continuous Vetting Service will become visible to Investigator and its │ │
│ │   work items will appear in their work queues immediately.               │ │
│ │   ↑ CONSEQUENCES RESTATED at the only point submission is possible       │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ [ Back ]                                        [ Register application ]      │
```

#### Information hierarchy

| Priority | Content | Placement |
|---|---|---|
| **Primary** | Current step's fields | Centre |
| **Primary** | Step indicator + "Step n of 5" text | Above fields |
| **Primary** | Error summary (on failure) | Top of step, receives focus |
| **Primary** | Test-result checklist (step 3) | Centre — it is the gate |
| **Primary** | Consequence statement (step 5) | Immediately above submit |
| Secondary | Resilience policy | Collapsed accordion, step 2 |
| Secondary | Per-step Edit links | Review table, step 5 |
| Tertiary | Onboarding documentation link | Step 1 |

#### States

| State | Appearance | Copy |
|---|---|---|
| **Ready** | Step fields, defaults pre-filled | — |
| **Step validation failure** | Error summary at top, `role="alert"`, **focus moved**, in-page links; fields `aria-invalid="true"` + inline errors | "There is a problem. Fix the following, then try again." + per-field copy |
| **Testing** | Button busy, checklist `aria-busy` | "Testing connection…" announced once |
| **Test fail** | Checklist with ✕ rows; Continue disabled with reason | Per the outcome table above |
| **Test warning** | Checklist with ! rows; acknowledgement checkbox appears | Per the outcome table |
| **Draft expired** (>60 min) | Page-level `usa-alert--warning` | "Your registration draft expired. Start again — your entries weren't saved." |
| **Submitted without test** | Error summary | "Test the connection before you register this application." |
| **Duplicate ID** | Field error — **specific, not generic** | "That application ID is already in use. Choose a different one." |
| **Duplicate name** | Field error | "Another application already uses that name. Choose a different one." |
| **Incomplete status map** | Blocks step 4 | "Map every status this application can report. **Unmapped: {list}.**" |
| **Success** | → SCR-23 with `usa-alert--success`, **focus moved to it** | "Continuous Vetting Service is registered. Health checks have started." |
| **Edit mode** | Same screen, values pre-filled; `applicationId` read-only | "The application ID can't be changed because existing records refer to it." |

**Form state is held in a server-side draft** keyed to the administrator's session, so a refresh or a session extension does not lose work. A five-step form lost to a timeout is a demo-killer.

#### Accessibility notes

- **Heading hierarchy:** `<h1>` "Register an application" is **constant** across steps; `<h2>` is the changing step name; `<h3>` per fieldset group. This gives screen-reader users a stable page identity plus a changing sub-heading, rather than an `<h1>` that mutates under them.
- **Step indicator:** `usa-step-indicator` with `aria-current="step"` on the active step **and** a visible text counter "Step 2 of 5". Progress is **never** conveyed by segment colour alone. Completed steps are real links; future steps are not interactive and are not in the tab order.
- **Per-step focus management:** on advancing, focus moves to the new step's `<h2>`; `document.title` updates to include the step name. On validation failure, focus moves to the error summary and the title is prefixed "Error: ".
- **Error summary:** `role="alert"`, heading "There is a problem", each entry an in-page link that focuses its field. Every field carries `aria-invalid="true"` and an inline `usa-error-message` joined into `aria-describedby`.
- **Labels and hints:** every input has a programmatically associated `<label>` — never a placeholder-as-label. Numeric bounds are stated in `usa-hint` text **before** the user errs, not only in the error message. Required marked with the **text** "(required)".
- **Character counters** on description announce politely at 90% and 100% of the limit only.
- **Connection-test checklist** is a `usa-icon-list` where each item carries **text status** plus an icon — never a colour-only row. The result is announced once, politely, and does **not** move focus.
- **Disabled "Continue"** is removed from the tab order with its blocking reason rendered as **adjacent visible text** linked by `aria-describedby`, so a keyboard user learns why rather than finding an inert control.
- **Status-map table** is a real `<table>` with `<caption>`, `<th scope="col">`, and `scope="row"` on the native-status cell; each mapping control is a labelled `usa-select`, not a bare input.
- **Icon picker** is a `usa-combo-box` offering icons by **name with a shape preview** — a token picker with no colour dependency and full keyboard support.
- **Role checkboxes** are grouped in a `<fieldset>` with a `<legend>` posing the question.
- **Review table** is a real `<table>` with `scope="row"` on the step-name cell; each Edit link's accessible name names its step ("Edit step 2, Connection").
- **Keyboard:** the entire five-step form is completable **using only the keyboard** (US-094 AC-2) — including the accordion, combo box, status-map selects, and acknowledgement checkbox. No keyboard traps.
- **Target sizes** ≥44×44 px for all controls including step-indicator links.
- **320px reflow:** steps stack vertically; the step indicator collapses to "Step 2 of 5" plus the current step label; the status-map and review tables reflow to stacked definition lists retaining row-header semantics. No horizontal page scroll; usable at 200% zoom.

#### Acceptance

- An administrator completes CVS registration in **under 5 minutes** during a live demo (SM-11).
- The form is **completable using only the keyboard**.
- Each step's errors are **announced and linked**.
- Every validation rule produces **its exact specified message**; a duplicate `applicationId` is caught with the **specific** message, not a generic failure.
- Registering against a stopped application is **blocked** with the unreachable message.
- An incomplete status map blocks submission **with the unmapped values listed by name**.
- On submission, full propagation occurs within **30 seconds with no restart** (SM-12).

---
### Screens: SCR-33 / SCR-34 — Audit trail viewer, record detail, and chain view

**Purpose:** Make "who did what, to what, when" readable — and make a cross-system action read as **one narrative rather than four disconnected rows**.
**User Stories:** US-068, US-101, US-102, US-103, US-104, US-105, US-106, US-107, US-108 · **Features:** F13, F7
**Template:** `ListPage` (SCR-33), `DetailPage` (SCR-34)

> **Role-scoped by the same navigation item.** Administrators reach this as **"Audit Trail"** (full trail, `AUDIT.READ_ALL`); mission users and applicants reach it as **"My Activity"** (own records only, `AUDIT.READ_OWN`). Scoping is applied **in the query**, not after retrieval.

---

### Screen: SCR-33 — Audit trail viewer

```
│ Audit trail                                                     <h1>          │
│                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Integrity verified — 1,284 records checked at 15:04 UTC                 │ │
│ │   Each record is hash-chained to the one before it, so tampering is       │ │
│ │   detectable.                              [ Verify again ]               │ │
│ │   ↑ TEXT + ICON, never colour alone                                       │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── FILTERS ────────────┐ ┌── RESULTS ─────────────────────────────────────┐ │
│ │ <form> aria-label=     │ │ Active: [Last 24 hours ✕]  [ Clear all ]       │ │
│ │ "Filter audit records" │ │                                                │ │
│ │                        │ │ <caption>Audit records — 142 results,          │ │
│ │ Search                 │ │   newest first</caption>                       │ │
│ │ [🔍 actor, resource,   │ │ ┌──────────┬────────┬──────┬───────────┬─────┐│ │
│ │  or action ]           │ │ │Timestamp▼│ Actor  │ Role │ Action    │ Out ││ │
│ │  ↑ does NOT match      │ │ ├──────────┼────────┼──────┼───────────┼─────┤│ │
│ │    summaries — which   │ │ │15:04:12Z │M. Vale │Invest│CASE_ISSUE_│ ✓   ││ │  ← th scope="row"
│ │    could otherwise be  │ │ │          │        │igator│CLEARED    │Succ ││ │
│ │    used to fish for    │ │ │          │ ▣ eApp │ CASE-A-1042      │     ││ │
│ │    narrative content   │ │ │          │ 01JD7K2Q9X8V3MZ4R6T  →chain     ││ │
│ │                        │ │ ├──────────┼────────┼──────┼───────────┼─────┤│ │
│ │ Actor                  │ │ │15:04:11Z │M. Vale │Invest│ISSUE_     │ ✓   ││ │
│ │ [ All ▾ ]              │ │ │          │ ▣ PVQ  │igator│RESOLVED   │Succ ││ │
│ │                        │ │ │          │ ISS-2207 · 01JD7K2Q… →chain     ││ │
│ │ Role at action         │ │ ├──────────┼────────┼──────┼───────────┼─────┤│ │
│ │ [ All ▾ ]              │ │ │14:58:02Z │R.Ashford│Appli│AUTHZ_     │ ⊘   ││ │
│ │                        │ │ │          │ ▣ PVQ   │cant │DENIED     │Denied││ │
│ │ Action type            │ │ │          │ rule ATTR-APP-01                ││ │
│ │ [ All ▾ ]              │ │ └──────────┴────────┴──────┴───────────┴─────┘│ │
│ │                        │ │                                                │ │
│ │ Target system          │ │  Showing 1 to 25 of 142                        │ │
│ │ ☐ HUB ☐ eApp ☐ IEP     │ │  ‹ Prev [1] 2 3 4 5 6 Next ›                   │ │
│ │ ☐ PVQ ☐ PDT ☐ IM       │ │                                                │ │
│ │                        │ │  [ Export CSV ]  [ Export JSON ]               │ │
│ │ Outcome                │ └────────────────────────────────────────────────┘ │
│ │ ☐ Success ☐ Denied     │                                                   │
│ │ ☐ Failed  ☐ Partial    │  ★ OPENING THIS VIEWER WRITES AN AUDIT_VIEWED     │
│ │                        │    RECORD. The audit trail audits its own         │
│ │ Date range             │    reading — which is both correct and            │
│ │ From [2026-09-14]      │    demonstrable. (FR-F13-05 rule 8)               │
│ │ To   [2026-09-15]      │                                                   │
│ │  max 90 days           │                                                   │
│ │                        │                                                   │
│ │ Correlation ID         │                                                   │
│ │ [                    ] │                                                   │
│ │                        │                                                   │
│ │ [ Apply ] [ Reset ]    │                                                   │
│ └────────────────────────┘                                                   │
```

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | The records, newest first | Right 3/4 | The evidence |
| **Primary** | Integrity indicator | Above everything | Trust in the record precedes reading it (US-104) |
| **Primary** | Correlation ID as a **chain link** on every row | Rightmost column | The affordance that turns rows into narrative |
| **Primary** | Result count in `<caption>` | Table caption | Announced on every change |
| Secondary | Filter rail | Left 1/4 | Same pattern as the work queue — learned once |
| Secondary | Export controls | Below table | Take the evidence away (US-108) |

#### States

| State | Appearance | Copy |
|---|---|---|
| **Ready** | Populated table, default last 24 hours newest first | — |
| **Loading** | Skeleton rows preserving height, `aria-busy` | sr-only "Loading audit records" |
| **Empty** | `usa-alert--info`, caption still present | "No audit records match your filters. Try widening the date range." |
| **Error** | `usa-alert--error` + correlation ID + retry | "We couldn't load the audit trail. Try again — reference {id}." |
| **Degraded** | *Not applicable* — audit is hub-local and never depends on a spoke | — |
| **Integrity FAILED** | `usa-alert--error` replacing the success indicator, naming the **first broken sequence number** | "Audit integrity check failed at record 1,043. Records may have been altered outside the application. Contact your administrator." |
| **Range too large** | Field error | "Choose a date range of 90 days or fewer." |
| **Reversed range** | Field error | "Enter an end date that comes after the start date." |
| **Export too large** | Error alert | "Narrow your filters — exports are limited to 10,000 records." |
| **Mission user view** | Same screen, `<h1>` "My activity"; only own records | An investigator's query returns **zero records authored by another actor** |

**Exports** respect the same role scoping and filters as the on-screen view — an export can never contain a record the user could not see on screen. Each file carries a header block (generated-at, actor, applied filters, count, integrity result) and a first line: `# DEMO — SYNTHETIC DATA ONLY`. Every export writes an `AUDIT_EXPORTED` record.

---

### Screen: SCR-34 — Record detail and chain view

```
│ Audit trail › Record 01JD7K2Q9X8V3MZ4R6T                                      │
│                                                                               │
│ ISSUE_RESOLVED — PVQ issue ISS-2207                             <h1>          │
│                                                                               │
│ ┌── RECORD ───────────────────────────────────────────── <h2> ─────────────┐ │
│ │ <dl> definition list — every field, nothing hidden                       │ │
│ │                                                                          │ │
│ │ Occurred at        2026-09-15 15:04:11 UTC                               │ │
│ │ Sequence number    1,281                                                 │ │
│ │ Actor              Marcus Vale                                           │ │
│ │ Roles at action    Investigator          ← SNAPSHOTTED AT ACTION TIME,   │ │
│ │ Active role        Investigator            so later changes cannot       │ │
│ │ Attributes         org DCSA-FIELD-OPS-EAST rewrite what the actor WAS    │ │
│ │                    tier T5 · region REGION-NE                            │ │
│ │ Action             ISSUE_RESOLVED                                        │ │
│ │ Target system      ▣ PVQ — Personnel Vetting Questionnaire               │ │
│ │ Target resource    PVQ_ISSUE · ISS-2207                                  │ │
│ │ Outcome            ✓ Success                                             │ │
│ │ Before             status: Open                                          │ │
│ │ After              status: Resolved — Substantiated                      │ │
│ │   ↑ PLAIN-LANGUAGE SUMMARIES, not record dumps. The narrative itself     │ │
│ │     lives in PVQ, which is its system of record.                        │ │
│ │ Correlation ID     01JD7K2Q9X8V3MZ4R6T  [⧉ Copy]                         │ │
│ │ Session · method   01JD7… · CAC/PIV (simulated)                          │ │
│ │ Record hash        a3f9…c21   Previous hash  7b12…e44                    │ │
│ │   ↑ shown WITH a short explanation of what they prove                    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ [ View the affected work item → ]  [ View the application → ]                 │
│                                                                               │
│ ╔══ FULL CHAIN — 8 records sharing this correlation ID ═══ <h2> ═══════════╗ │
│ ║                                                                          ║ │
│ ║ ┌─ usa-summary-box ────────────────────────────────────────────────────┐ ║ │
│ ║ │ Investigator Marcus Vale resolved PVQ issue ISS-2207 against eApp    │ ║ │
│ ║ │ case A-1042 on 15 September 2026. Both systems updated.              │ ║ │
│ ║ │   ↑ THE SUMMARY LINE: actor, both systems, outcome — in one sentence │ ║ │
│ ║ └──────────────────────────────────────────────────────────────────────┘ ║ │
│ ║                                                                          ║ │
│ ║ <ol> — ordered narrative with system badges and ELAPSED TIME             ║ │
│ ║                                                                          ║ │
│ ║  1  15:03:41Z  +0s      WORK_ITEM_VIEWED         ▣ eApp     ✓           ║ │
│ ║                         Case A-1042 opened                               ║ │
│ ║  2  15:03:42Z  +1s      RELATED_ITEMS_RESOLVED   HUB        ✓           ║ │
│ ║                         3 related items resolved: PVQ, PDT, IM           ║ │
│ ║  3  15:03:58Z  +17s     RELATED_ITEM_TRAVERSED   HUB        ✓           ║ │
│ ║                         eApp Case A-1042 → PVQ Issue ISS-2207            ║ │
│ ║                         ★ THE PATH IS RECORDED, not just the endpoints   ║ │
│ ║  4  15:03:59Z  +18s     WORK_ITEM_VIEWED         ▣ PVQ      ✓           ║ │
│ ║  5  15:04:10Z  +29s     ORCHESTRATION_STARTED    HUB        ✓           ║ │
│ ║                         2 legs planned: PVQ, eApp                        ║ │
│ ║  6  15:04:11Z  +30s     ISSUE_RESOLVED           ▣ PVQ      ✓  ◀ you    ║ │
│ ║                         status: Open → Resolved — Substantiated          ║ │
│ ║  7  15:04:12Z  +31s     CASE_ISSUE_CLEARED       ▣ eApp     ✓           ║ │
│ ║                         outstanding issues: 1 → 0                        ║ │
│ ║  8  15:04:12Z  +31s     ORCHESTRATION_COMPLETED  HUB        ✓           ║ │
│ ║                         Both legs committed                              ║ │
│ ║                                                                          ║ │
│ ║ [ Export this chain ]                                                    ║ │
│ ╚══════════════════════════════════════════════════════════════════════════╝ │
```

#### Chain variants

| Variant | Rendering |
|---|---|
| **Partial completion** | Record 8 is `ORCHESTRATION_PARTIAL`; additional `ORCHESTRATION_RETRY_ATTEMPTED` records appear **for each retry**, so the history is complete rather than tidied. The failed leg is clearly marked ✕ |
| **Failure** | Record 8 is `ORCHESTRATION_FAILED`; the eApp leg is **absent**, correctly — it was never attempted |
| **Mission user viewing a chain they participated in** | Records by **another actor** render as redacted placeholders — "An action by another user — 15:04:12Z" — rather than being omitted, **so the narrative's shape is honest even when detail is withheld** (FR-F13-04 rule 5) |
| **Integration-issue chain** | Includes `ADAPTER_FAILURE` records with the error class, linked from SCR-25 |

#### States

| State | Copy |
|---|---|
| Ready | Full record + chain |
| Loading | Section skeletons, `aria-busy` |
| **Not visible to this principal** | → "You don't have access to this audit record." |
| **Not found** | **Same copy** — non-enumerable |
| Chain of one | Chain section renders with a single record and states "This action produced one record." |

---

### Accessibility notes — SCR-33 and SCR-34

- **Heading hierarchy:** SCR-33 `<h1>` "Audit trail" (or "My activity") → `<h2>` "Filter audit records" / "Results". SCR-34 `<h1>` action + resource → `<h2>` "Record" / "Full chain". Gap-free.
- **Landmarks:** filter rail is a `<form>` landmark with `aria-label="Filter audit records"`; results are a `<section aria-labelledby>`.
- **Accessible data table (SCR-33):** real `<table>` with `<caption>` stating contents and current result count; `<th scope="col">` on every header; **`scope="row"` on the timestamp cell**; sortable headers contain a `<button>` with `aria-sort` on the `<th>`; `usa-pagination` with `aria-label="Audit trail pagination"`, `aria-current="page"`, and **disabled — not hidden — bounds controls**.
- **Result-count announcement** on every filter, sort, or page change: "142 audit records. Showing 1 to 25."
- **Filter chips** carry accessible names of the form "Remove filter: Last 24 hours", with a "Clear all filters" control — the identical pattern to the work queue, so it is learned once.
- **The chain is an `<ol>`**, not a styled `<div>` stack — the ordering is semantic, and a screen-reader user hears "1 of 8", "2 of 8". Elapsed time and system badges are text.
- **Correlation ID** is rendered in a monospace, selectable field with a copy control announcing "Reference copied," and as a link whose accessible name is **"View the full audit chain for this action"** — never a bare ULID read out character by character.
- **Outcome is text + distinct icon shape** — "✓ Success", "⊘ Denied", "✕ Failed", "! Partial". The screen survives a grayscale rendering with all outcome meaning intact.
- **Integrity indicator is text + icon**, never a colour-only state, and names the first broken sequence number on failure.
- **Record detail is a `<dl>`** with programmatic term/description pairing, so every field is announced with its label.
- **Hash values** are marked with `lang` where appropriate and accompanied by a short plain-language explanation of what they prove, rather than presented as unexplained hex.
- **Focus management:** arriving at SCR-34 moves focus to the `<h1>` and updates `document.title`. Following a correlation link from an error message or item history does the same. "Export" announces completion politely and does not move focus.
- **Redacted chain placeholders** are announced as content ("An action by another user"), not skipped — the shape of the narrative must be perceivable non-visually.
- **Keyboard:** the entire screen — filters, date pickers, chips, sortable headers, row links, pagination, copy controls, export buttons — is reachable and operable in visual order. No keyboard traps.
- **Target sizes** ≥44×44 px for sort buttons, chips, pagination, copy, and chain links.
- **320px reflow:** the filter rail collapses into a `usa-accordion` disclosure above the results; the audit table reflows to stacked cards retaining caption and row-header semantics; the chain `<ol>` stacks naturally with elapsed time on its own line. No page-level horizontal scroll; usable at 200% zoom.

### Acceptance

- The **flagship workflow renders as a single correlated chain of ≥5 records** (SM-20).
- The chain summary line correctly names **actor, both systems, and outcome**.
- A partial completion's chain **clearly shows which leg failed and every retry attempt**.
- Every filter works and combines correctly; the table passes the accessibility scan with **proper headers, caption, and announced sort state**.
- Opening the viewer writes **one `AUDIT_VIEWED` record**.
- An investigator's audit query returns **zero records authored by another actor**.
- Denial of an inaccessible record is **non-enumerable**.
- Manually altering a record in the database causes the integrity check to **fail at that record, demonstrably**.

---
### Screens: SCR-30, SCR-31, SCR-32 — Error pages, and SCR-21 / SCR-35 / SCR-36 utility screens

---

## Error pages — plain language, actionable, never terminal

**Purpose:** Three distinct, recoverable presentations. **Every one renders inside the shell** — demo banner, header, navigation, and footer all present — so an error is never a dead end and never violates the banner invariant.
**User Stories:** US-024, US-031, US-054, US-130 · **Features:** F2, F3, F16, F14

> **The rule that governs all three:** no blank page, no stack trace, no framework default error page, no browser default. Ever. Verified by a fault-injection crawl (US-130, NFR-09).

Each error page has: **a heading, plain-language explanatory text, at least one concrete next action, and a copyable correlation ID** where applicable. Each sets a descriptive `<title>`, **moves focus to the `<h1>`**, and announces via a live region.

---

### Screen: SCR-30 — Access denied (403)

```
│ [ demo banner · gov banner · header · PRIMARY NAV all present ]              │
│                                                                              │
│ <main>                                                                       │
│                                                                              │
│  ⊘  You don't have access to this page                          <h1>        │
│                                                  ← focus lands here          │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ You don't have access to this item.                                    │ │
│  │                                                                        │ │
│  │ If you think this is a mistake, contact your administrator and give    │ │
│  │ them the reference below.                                              │ │
│  │                                                                        │ │
│  │ Reference  01JD7K2Q9X8V3MZ4R6T          [⧉ Copy ]                       │ │
│  │                                                                        │ │
│  │      usa-alert--error · role="alert" · aria-live="assertive"           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  [ Go to my dashboard ]      [ Go to my work queue ]                         │
│       ↑ TWO WORKING EXITS, role-appropriate. An applicant gets               │
│         "Go to my dashboard" and "Go to my tasks" instead.                   │
│                                                                              │
│  <title>Access denied — DCSA Unified Layer</title>                           │
```

**Non-enumeration is the design constraint here.** A forbidden resource and a non-existent one return **the same status, the same code, the same message, and the same response shape**, with response time normalised to a 120ms floor. The page therefore:

- **Never** names the resource that was requested.
- **Never** shows a title, subject name, or any existence hint.
- **Never** varies its copy by reason — "you lack the role", "it's another unit's case", "it doesn't exist" all render identically.
- **Always** writes an `AUTHZ_DENIED` audit record carrying the failing `ruleId`, which is visible to administrators in SCR-33 but **never surfaced to the denied user**.

**Embedded denials** (a dashboard widget, a related-items panel) render an **inline `usa-alert`** rather than replacing the page: "You don't have access to the related item in PVQ."

---

### Screen: SCR-31 — Not found (404)

```
│  ⓘ  We couldn't find that page                                  <h1>        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ The address you tried doesn't match anything in this application.      │ │
│  │ It may have been mistyped, or the item may have been removed.          │ │
│  │                                                                        │ │
│  │ You tried:                                                             │ │
│  │   /work/EAPP:CASE-A-9999                                               │ │
│  │   ↑ shown AS TEXT, ESCAPED, NEVER rendered as HTML                     │ │
│  │                                                                        │ │
│  │ Reference  01JD7K2Q9X8V3MZ4R6T          [⧉ Copy ]                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  [ Go to my dashboard ]      [ Go to my work queue ]                         │
│                                                                              │
│  HTTP 404 · <title>Page not found — DCSA Unified Layer</title>               │
│  ★ SCR-31 IS ITSELF ERROR HANDLING — it never 500s, and it always            │
│    includes the demo banner.                                                 │
```

> **Deliberate distinction from SCR-30.** A *route* that does not exist (`/admin/wdgets`) gets SCR-31. A *resource* the principal may not see gets SCR-30 — because confirming "this case ID doesn't exist" would itself be a disclosure. The two pages are never interchanged.

---

### Screen: SCR-32 — Unexpected error (500 / client boundary)

```
│  ✕  Something went wrong                                        <h1>        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Something went wrong on our side. Nothing was changed.                 │ │
│  │   ↑ STATES WHETHER ANYTHING CHANGED — every failure message does       │ │
│  │                                                                        │ │
│  │ We've logged the problem. If it keeps happening, give your             │ │
│  │ administrator the reference below.                                     │ │
│  │                                                                        │ │
│  │ Reference  01JD7K2Q9X8V3MZ4R6T          [⧉ Copy ]                       │ │
│  │                                                                        │ │
│  │      usa-alert--error · role="alert"                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  [ Try again ]      [ Go to my dashboard ]                                   │
│                                                                              │
│  <title>Something went wrong — DCSA Unified Layer</title>                    │
│                                                                              │
│  ★ NO stack trace. NO exception class. NO hostname, port, or SQL.            │
│    Errors caught by the boundary are reported to the server with their       │
│    correlation ID, so they appear in the integration log for an              │
│    administrator — the detail goes where it belongs, not to the user.        │
```

### Error-page comparison

| | SCR-30 Denied | SCR-31 Not found | SCR-32 Unexpected |
|---|---|---|---|
| HTTP | 403 | 404 | 500 (or client boundary) |
| Icon | `block` ⊘ | `info` ⓘ | `error` ✕ |
| Live region | `assertive` | polite (focus moves) | `role="alert"` |
| Shows what was requested | **Never** | Yes, escaped as text | No |
| Retry offered | **No** — retrying will not help | No | **Yes** |
| Correlation ID | Yes | Yes | Yes |
| Exits | Dashboard, Work queue | Dashboard, Work queue | Try again, Dashboard |
| Audited | Yes — `AUTHZ_DENIED` | No | Yes — via integration log |

### Accessibility notes — all three error pages

- **Render inside the shell**, so the demo banner, landmark set, navigation, and footer are all present and the page is never a bare document.
- **One `<h1>`**, which is the error statement itself in plain language — not "Error 403".
- **Focus moves to the `<h1>`** on render; `document.title` is descriptive and unique.
- **Announced** via the politeness level in the table above; announced **once**, not repeatedly.
- **Plain language, no codes in the visible copy.** "You don't have access to this page" — not `AUTHZ_DENIED`. The machine-readable code exists in the response envelope for support, not on screen.
- **Correlation ID** is monospace, selectable, with a copy control announcing "Reference copied."
- **Every exit is a real, role-appropriate destination** — an Administrator's SCR-30 offers "Go to my dashboard" and "Go to connected applications", not a Work Queue they cannot access.
- **Colour-independent:** each page is identified by heading text and icon **shape**, not by a coloured band.
- **Keyboard:** all controls reachable and operable; the copy control is a real `<button>`.
- **Target sizes** ≥44×44 px.
- **320px:** content reflows, no horizontal scroll; the escaped path on SCR-31 wraps rather than overflowing.
- **These pages are included in the automated accessibility scan**, in every role — error states are scanned, not exempted (FR-F14-12 rule 1).

---

## Screen: SCR-21 — Notifications and announcements

**Purpose:** One place for all current alerts and administrator notices.
**User Stories:** US-119, US-120, US-121, US-122, US-123, US-124 · **Features:** F15 · **Template:** `ListPage`

```
│ Notifications                                                   <h1>          │
│ 3 unread                                                                      │
│                                                                               │
│ Type [ All ▾ ]  Severity [ All ▾ ]  ☐ Unread only    [ Apply ] [ Clear ]      │
│                                                                               │
│ ┌── ALERTS (derived from your work) ─────────────────── <h2> ──────────────┐ │
│ │ ● Unread · ▣ PVQ · 12 Sep                                                │ │
│ │   New issue raised on a case you own                                     │ │
│ │   Issue ISS-2207 against eApp Case A-1042                                │ │
│ │   [ Open the case → ]          [ Mark as read ]                          │ │
│ │ ─────────────────────────────────────────────────────────────────────────│ │
│ │ ● Unread · ▣ IM · 12 Sep                                                 │ │
│ │   Assignment overdue by 3 days                                           │ │
│ │   Case IM-3287                                                           │ │
│ │   [ Open the assignment → ]    [ Mark as read ]                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── ANNOUNCEMENTS ───────────────────────────────────── <h2> ──────────────┐ │
│ │ ⓘ Scheduled maintenance Thursday 19:00–21:00 UTC.        [ Dismiss ]     │ │
│ │   ↑ dismissible PER USER, persisted; NEVER overlays the demo banner      │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
```

| State | Copy |
|---|---|
| Empty | "You have no notifications. We'll let you know when something needs your attention." |
| **Alerts uncomputable** | "We couldn't check for alerts right now, so this list may be incomplete." — **never a reassuring empty list it cannot substantiate** (US-124) |
| Degraded | Named + quantified per `Y0-patterns` |
| New alert arrives | Announced politely, **focus not stolen**; unread count updates |

**Every alert links directly to the work item that produced it**, preserving context. Marking as read **does not make the alert disappear** (US-121) — it changes state, so a user who mis-clicks does not lose the item.

**Accessibility:** `<h1>` + `<h2>` per group, gap-free. Read/unread is **text + icon**, never a colour dot. "Mark as read" is a real `<button>` announcing "Marked as read." Alerts arriving asynchronously use `aria-live="polite"` and never move focus or reorder content under the cursor. Source badges in accessible names. 320px: stacks single-column, ≥44×44 px targets.

---

## Screen: SCR-35 — Global search results

**Purpose:** Find one item across everything the principal may see.
**User Stories:** US-030, US-044 · **Features:** F3, F5 · **Template:** `ListPage`

```
│ Search results                                                  <h1>          │
│ 4 results for "A-1042". 5 systems searched.                                   │
│   ↑ announced politely on every change                                        │
│                                                                               │
│ [🔍 A-1042                              ]  [ Search ]                         │
│ Source [ All ▾ ]  Type [ All ▾ ]                                              │
│                                                                               │
│ ┌── ▣ eApp (1) ──────────────────────────────────── <h2> ─────────────────┐  │
│ │ Case A-1042 — Section 13A employment history          ★ exact match      │  │
│ │ SUBJ-00418 · Under review · due 19 Sep                                   │  │
│ │ [ Go to this item → ]  ← offered as PRIMARY when it is the sole exact    │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│ ┌── ▣ PVQ (1) ──────────────────────────────────── <h2> ─────────────────┐  │
│ │ Issue ISS-2207 — relates to Case A-1042                                  │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
```

Results are **grouped by source system**, each row badged, ranked by exact-identifier match → title match → recency.

| State | Copy |
|---|---|
| Query too short | "Enter at least 2 characters to search." — **no request is issued** |
| No matches | "No results for '{q}'. Check the spelling, or try a case or subject number." |
| **All sources unavailable** | "We couldn't reach any connected systems. Your search will work again once they're back." |
| Partial source failure | Results render **plus** a named degraded notice listing the systems **not** searched |
| Administrator | Search targets **applications, identities, and audit records** — administrators hold no work-item read permission |

**Search never widens scope**: the ownership predicate is applied **before** matching, so an applicant's search cannot surface another subject's item. The query is escaped for display and **never rendered as HTML**.

**Accessibility:** `<h1>` + `<h2>` per source group, gap-free. Result count announced politely. Source attribution in accessible names. Grouping is semantic (`<section aria-labelledby>` per group with a list), so heading navigation works. 320px: groups stack; no horizontal scroll.

---

## Screen: SCR-36 — Accessibility statement

**Purpose:** State the conformance claim, how it was assessed, what is **not** yet conformant, and how to report a problem. **Reachable from the footer on every screen, including login.**
**User Stories:** US-118 · **Features:** F14 · **Template:** Standalone

```
│ Accessibility statement                                         <h1>          │
│                                                                               │
│ ┌── CONFORMANCE TARGET ─────────────────────────────── <h2> ──────────────┐  │
│ │ This prototype targets Section 508 and WCAG 2.1 Level AA.               │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── HOW WE ASSESSED IT ─────────────────────────────── <h2> ──────────────┐  │
│ │ • Automated axe-core scanning in continuous integration across every    │  │
│ │   route, for every role, including error, empty, and degraded states.   │  │
│ │   The build fails on any serious or critical violation.                │  │
│ │ • A documented manual keyboard-only pass.                              │  │
│ │ • A documented manual screen-reader pass.                              │  │
│ │ Last manual pass: {date} · Tooling: {list} · Findings: {n}             │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── KNOWN LIMITATIONS ──────────────────────────────── <h2> ──────────────┐  │
│ │ Listed WITH DATES rather than claimed to be none.                      │  │
│ │ ★ "We have no known limitations" is not a credible claim and is        │  │
│ │   explicitly not made. (FR-F14-11 AC-2)                                │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── DESIGN SYSTEM ASSUMPTION ───────────────────────── <h2> ──────────────┐  │
│ │ This prototype is built on the U.S. Web Design System (USWDS) v3 with  │  │
│ │ theming applied entirely through design tokens.                        │  │
│ │                                                                        │  │
│ │ The DCSA Ecosystem Style Guide referenced as Attachment 1 of the       │  │
│ │ Innovation Call WAS NOT SUPPLIED to this effort. USWDS v3 with         │  │
│ │ token-based theming was assumed in its place. Adopting the real guide  │  │
│ │ is a token and asset change, not a component rewrite.                  │  │
│ │                                                                        │  │
│ │ ★ HONESTY ABOUT THE ASSUMPTION BELONGS ON THE PAGE THAT CLAIMS         │  │
│ │   CONFORMANCE. (FR-F14-11 rule 3, PRD Q-01)                            │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── SYNTHETIC DATA ─────────────────────────────────── <h2> ──────────────┐  │
│ │ This is a demonstration prototype. All data is synthetic. Authentication│  │
│ │ is simulated; no credential is validated.                              │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── REPORT A PROBLEM ───────────────────────────────── <h2> ──────────────┐  │
```

**Accessibility:** the page itself conforms fully — it is the one page where a violation would be self-refuting. `<h1>` → `<h2>` per section, gap-free. Reachable from the `usa-identifier` footer on **every** screen and from the account menu, **including while unauthenticated**. Plain prose, `usa-prose` typography, no tables required to convey meaning. 320px reflow, 200% zoom.

---
## Interaction Patterns

Defined **once** here, referenced by name from every screen. A screen that needs one of these behaviours uses the pattern; it does not redesign it. This is what prevents the thirty-eighth screen from inventing a thirty-eighth interpretation of "loading."

---

### Pattern: `DataRegion` — the five-state contract

**When to use:** Every data-bearing region on every screen — every table, list, widget, panel, and summary block. No exceptions.
**Traces to:** F16 / US-127, US-128, US-129, US-130; FR-F16-05…08; TechArch §12.5.

Every region resolves to exactly one of five states. The states are **mutually exclusive** and the distinction between them is legible **non-visually**.

```
┌─ DataRegion ──────────────────────────────────────────────┐
│                                                           │
│  1 LOADING    aria-busy="true" · skeleton preserves       │
│               layout dimensions · sr-only "Loading        │
│               {region}" · announce completion ONCE        │
│                                                           │
│  2 EMPTY      usa-alert--info (slim) · heading +          │
│               "what would appear here" + action.          │
│               ONLY when data is genuinely empty AND       │
│               zero sources failed.                        │
│                                                           │
│  3 ERROR      usa-alert--error role="alert" · heading,    │
│               plain cause, copyable correlation ID,       │
│               "Try again" button. Inline within the       │
│               region — NEVER replaces the page.           │
│                                                           │
│  4 DEGRADED   usa-site-alert--warning role="status" ·     │
│               names the system, quantifies the gap ·      │
│               announced ONCE · partial content renders    │
│               BELOW it.                                   │
│                                                           │
│  5 READY      Content. Possibly partial — and if so,      │
│               state 4 sits above it saying exactly        │
│               what is missing.                            │
└───────────────────────────────────────────────────────────┘
```

#### State specifications

| State | USWDS component | ARIA | Focus | Announcement |
|---|---|---|---|---|
| **Loading** | Skeleton block (USWDS utility classes, layout-preserving) | `aria-busy="true"` on region; `<span class="usa-sr-only">Loading {region}</span>` | Not moved | On completion only, once, polite: "{Region} loaded. {n} items." |
| **Empty** | `usa-alert usa-alert--info usa-alert--slim` inside the region | `role="status"` | Not moved | Polite, once |
| **Error** | `usa-alert usa-alert--error` | `role="alert"` | Not moved (region-scoped errors never steal focus) | Assertive, once |
| **Degraded** | `usa-site-alert usa-site-alert--warning usa-site-alert--slim` | `role="status"` | **Never moved** — see the rule below | Polite, once on first appearance; **not re-announced on each 30s poll** |
| **Ready** | Native content | — | Not moved | Result count, polite |

#### The empty-vs-degraded rule (the most consequential distinction in the product)

> **"You have no assigned work" and "We couldn't load your work" are different statements. Conflating them tells a user they have nothing to do when in fact the system is broken.** This is explicitly prohibited (FR-F16-07 rule 2 / US-129).

The distinction is enforced structurally, not stylistically:

| | Empty | Degraded |
|---|---|---|
| Trigger | `data.length === 0` **AND** `sourceStatus.every(s => s.status === 'OK')` | `sourceStatus.some(s => s.status !== 'OK')` — **regardless of `data.length`** |
| Heading | "You have no assigned work right now." | "Investigation Management is unavailable" |
| Body | "New assignments will appear here." | "12 items are not shown. The rest of your work is up to date." |
| Component | `usa-alert--info` | `usa-site-alert--warning` |
| Icon | `usa-icon` `info` | `usa-icon` `warning` |
| Action | *(none, or "Clear filters")* | *(none — recovery is automatic)* |
| Grayscale-distinguishable | Yes — different heading, different structure, different icon **shape** | Yes |
| Announced as | "No results." | "Investigation Management is unavailable. 12 items are not shown." |

**All sources down** is a *degraded* state with an empty list, never an empty state:
> "We can't reach any connected systems right now. Your work will appear here automatically when they're back." + "Try again" control.

#### Degraded never steals focus

A degraded notice arriving asynchronously — e.g. while the user is mid-narrative on SCR-16 — is delivered through `role="status"` (polite) and **must not move focus, must not reorder content under the cursor, and must not discard input** (JRN-01.03 Key Moment / US-115). Contrast with the **confirmation** pattern below, which *does* take focus, because it is a result the user is waiting for.

---

### Pattern: Source-system badge

**When to use:** Every work-item row, detail header, breadcrumb segment, related-item entry, confirmation table row, and audit record that belongs to a spoke.
**Traces to:** F5 / US-041; FR-F05-07; NFR-02.

```
  ┌──────────────┐
  │ ▣ eApp       │   usa-tag  +  usa-icon (per-application iconToken from registry)
  └──────────────┘
     ↑      ↑
   icon   registry displayName (text — ALWAYS present)
```

**Rules:**
1. Attribution is **text + icon**. Never colour-only. Never icon-only. Never colour + icon without text (NFR-02 / US-114).
2. The `displayName` and `iconToken` come from the **registry**, so a newly registered sixth application (CVS) is attributed correctly with **zero code change** (US-098, SM-12).
3. Accessible name is `"Source system: {displayName}"` — supplied via `usa-sr-only` text inside the tag, so a screen-reader user hears attribution on every row without hearing "eApp" as a bare token.
4. Each application's icon is a **distinct shape**, not a distinct colour, so a grayscale rendering retains meaning.

| Application | Label | Icon shape (`usa-icon`) |
|---|---|---|
| eApp | `eApp` | `description` (document) |
| IEP | `IEP` | `person` |
| PVQ | `PVQ` | `flag` |
| PDT | `PDT` | `assessment` |
| IM | `IM` | `folder` |
| CVS *(sixth app, post-registration)* | `CVS` | `visibility` |

**Row-level health modifier.** A row from a `DEGRADED` source carries an additional inline note — not a badge colour — reading **"Slow to respond"** with `usa-icon warning` (FR-F05-05 rule 3).

---

### Pattern: Status, priority, and outcome vocabulary

**When to use:** Any status, priority, health, outcome, or overdue indicator.
**Traces to:** F14 / US-114; FR-F14-06 rule 3.

**Rule: status is never conveyed by colour alone.** Every value is text **plus** a distinct icon shape. Verified two ways — automated contrast scan at 100%, and a **grayscale rendering of every screen retaining all status meaning**.

| Domain | Values (text) | Icon | Component |
|---|---|---|---|
| **Status category** | Open · In progress · Blocked · Closed | `radio_button_unchecked` · `pending` · `block` · `check_circle` | `usa-tag` |
| **Priority** | Urgent · Elevated · Routine | `priority_high` · `arrow_upward` · `remove` | `usa-tag` (distinct border weights, not distinct fills) |
| **Overdue** | The **word** "Overdue" + days | `warning` | `usa-tag` — never a coloured row alone |
| **Health** | Healthy · Degraded · Unavailable | `check_circle` ✓ · `warning` ! · `cancel` ✕ | Inline text + icon |
| **Outcome** | Success · Denied · Failed · Partial | `check_circle` · `block` · `error` · `error_outline` | Inline text + icon |
| **Priority not provided** | "Priority not provided by {system}" | `help_outline` | `usa-hint` — never an implied default |

The last row matters: a source with no native priority maps everything to `ROUTINE` and declares `priorityNative: false`, so the UI **says so** rather than implying a priority the source never asserted (FR-F05-02 rule 4).

---

### Pattern: Action panel

**When to use:** Every detail screen (SCR-14…19, 23, 27).
**Traces to:** F2, F6, F16 / US-051, US-126; FR-F06-03, FR-F16-04.

```
┌─ Actions ──────────────────────────────────── <h2> ──────┐
│                                                          │
│  [ Resolve issue ]   ← usa-button (primary, AT MOST ONE) │
│  ⓘ This updates PVQ and eApp.        ← dual-system note  │
│                                                          │
│  [ Request clarification ]  ← usa-button--outline        │
│                                                          │
│  [ Record finding ] (disabled)                           │
│  Investigation Management isn't responding right now.    │
│  Try again when it's back.      ← disabledReason, TEXT,  │
│                                   aria-describedby-linked│
│                                                          │
│  ── Destructive ──────────────────────────────────────   │
│  [ Return designation ]  ← usa-button--secondary         │
│                             + usa-modal confirmation     │
└──────────────────────────────────────────────────────────┘
```

**Rules:**
1. **The server computes the list.** The client renders `ActionDescriptor[]` and nothing else. An action the principal may *never* perform in this role is **omitted**. An action they could perform but cannot *right now* is **shown disabled with a reason** — because a hidden control teaches the user nothing (FR-F02-05 rules 2–3).
2. Grouping: at most one primary (`usa-button`), then secondary (`usa-button--outline`), then destructive (`usa-button--secondary` + confirmation modal).
3. **Disabled controls are removed from the tab order**, and their `disabledReason` renders as **adjacent visible text** associated by `aria-describedby` — so the explanation is readable without focusing an unfocusable element (FR-F14-02 rule 6).
4. **Dual-system notice.** When `targetSystems.length > 1`, a `usa-alert--info usa-alert--slim` renders directly under the control: *"This updates PVQ and eApp."* The user is told **before** they act that two systems change (FR-F06-03 rule 3).
5. **Pre-emptive disabling.** When any `targetSystem` is `DOWN`, the action is disabled with the named reason — never allowed to fail mid-submission after the user has typed three paragraphs (FR-F16-04 / US-126).
6. **Recovery re-enables without reload**, announced politely: *"eApp is available again. You can now resolve this issue."*
7. The list is **recomputed after every successful action**. No stale action panel.

**This panel is the RBAC demonstration.** The same PVQ issue opened by an Investigator and an Adjudicator presents **different action sets** — Investigator sees `Resolve issue`; Adjudicator does not (they lack `ISSUE.RESOLVE`) but sees `Request clarification` (US-017, JRN-02.01, demo Segment 4).

---

### Pattern: Confirmation with read-back

**When to use:** Any action that changes state — and **mandatory** for orchestrated (multi-system) actions.
**Traces to:** F6, F7 / US-053, US-065, US-066; FR-F06-07, FR-F07b-04.

The defining rule: **the confirmation reports observed state read back from each system, not the state the hub intended to write.**

```
┌──────────────────────────────────────────────────────────────┐
│ ✓  Resolution complete                        <h1> + focus   │
│    PVQ and eApp both updated.       usa-alert--success       │
│                                     role="status" + focus    │
├──────────────────────────────────────────────────────────────┤
│ Results in each connected system            <caption>        │
│ ┌──────────┬───────────────────┬──────────────────┬────────┐ │
│ │ System   │ What we asked for │ What the system  │Outcome │ │
│ │          │                   │ reports now      │        │ │
│ ├──────────┼───────────────────┼──────────────────┼────────┤ │
│ │ ▣ PVQ    │ Resolve issue as  │ Resolved —       │ ✓      │ │
│ │          │ Substantiated     │ Substantiated    │Updated │ │
│ │          │                   │ read 15:04:11Z   │        │ │
│ ├──────────┼───────────────────┼──────────────────┼────────┤ │
│ │ ▣ eApp   │ Clear outstanding │ No outstanding   │ ✓      │ │
│ │          │ issue ISS-2207    │ issues           │Updated │ │
│ │          │                   │ read 15:04:12Z   │        │ │
│ └──────────┴───────────────────┴──────────────────┴────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Rules:**
1. A **real `<table>`** with `<caption>` "Results in each connected system", `<th scope="col">` per column, `scope="row"` on the System cell. Outcome is text + icon.
2. **Every leg renders, including failed ones.** A leg is never omitted for tidiness (FR-F07b-04 validation rule).
3. Each row carries the **timestamp of the re-read**, making it evident that the value was observed, not asserted.
4. A failed re-read renders honestly: *"We couldn't confirm the current state in {System}."* + "Check again" — the view degrades rather than hiding the row.
5. **Focus moves to the summary alert** on render, and it is announced once. This is the one async result that *does* take focus, because the user is waiting for it (contrast: degraded notices, which never do).
6. **Partial completion never says "success."** See the pattern below.

#### The partial-failure display

When one leg commits and another does not, `<h1>` reads **"Partly completed"** and the summary alert is `usa-alert--warning`. **The word "success" appears nowhere on the screen** (FR-F07b-03 rule 5, R-06).

```
┌──────────────────────────────────────────────────────────────┐
│ !  Partly completed                            <h1> + focus  │
│    PVQ recorded your resolution. eApp hasn't been updated    │
│    yet — we're retrying automatically.                       │
│    Reference 01JD7K2Q9X8V3MZ4R6T   [Copy]                    │
│                                    usa-alert--warning        │
├──────────────────────────────────────────────────────────────┤
│ │ ▣ PVQ  │ Resolve as Substantiated │ Resolved —          │✓ │
│ │        │                          │ Substantiated       │Updated│
│ │ ▣ eApp │ Clear issue ISS-2207     │ 1 outstanding issue │✕ │
│ │        │                          │ (unchanged)         │Not updated│
├──────────────────────────────────────────────────────────────┤
│ [ Retry eApp update ]  ← usa-button, idempotent              │
│ [ View the updated issue in PVQ ]  [ Back to work queue ]    │
└──────────────────────────────────────────────────────────────┘
```

Announced once: *"Partly completed. PVQ updated. eApp not updated."*

**Honesty obligations in this state:**
- PVQ's resolution **stands** — no rollback is attempted, because reversing a recorded investigative disposition would fabricate a false history (FR-F07b-03 rule 1).
- The eApp case **continues to display "1 outstanding issue"** on SCR-15, because that is genuinely eApp's state. **The UI never fakes convergence** (FR-F07b-03 rule 8). SCR-15 additionally shows an advisory: *"A resolution was recorded in PVQ on {date} but hasn't been applied to this case yet. We're retrying automatically."*
- Exhausted retries escalate to `NEEDS_ATTENTION` and surface in the administrator's integration-issue log — surfaced to a human rather than silently abandoned.

---

### Pattern: Degraded-system banner

**When to use:** Work queue, dashboard, search results, notifications, related-items panel — **wherever incomplete data is shown**.
**Traces to:** F16 / US-048, US-127; FR-F16-05, NFR-10.

```
┌────────────────────────────────────────────────────────────┐
│ !  Investigation Management is unavailable — 12 items are  │
│    not shown. The rest of your work is up to date.         │
│                     usa-site-alert--warning role="status"  │
└────────────────────────────────────────────────────────────┘
```

**Rules:**
1. **Named and quantified.** The application is named in **text** (never a red dot) and the omission is counted from the last successful count in `work_item_counts_cache`.
2. **When the count is unknown, the number is omitted rather than guessed:** *"Investigation Management is unavailable — some items are not shown."* (FR-F16-05 rule 2 / JRN-01.03 alternate path).
3. **Multiple systems compose into one alert**, each named and quantified — never a generic "some systems are unavailable" (rule 3).
4. **Contextual, not global.** The alert renders per-screen, above the affected content, so the user learns what is missing *here* (rule 4).
5. Announced **once** on first appearance via `role="status"`; **not re-announced** on each 30-second poll. Also present in the **static page structure**, so a user arriving after the announcement still meets it by navigating headings and landmarks (JRN-01.03 a11y note).
6. **Recovery** replaces it with a polite announcement plus an explicit control — *"Investigation Management is available again. Refresh to see 12 more items."* + `[Refresh]` — rather than silently reordering rows under the user's cursor (FR-F05-05 rule 6).
7. Always paired with the **"{m} of {k} systems reporting"** count in the table caption, so the total is never presented as complete when it is not.

---

### Pattern: Audit link affordance (correlation ID)

**When to use:** Every error message, every activity-history row, every integration-issue row, every confirmation.
**Traces to:** F13 / US-068, US-106; FR-F13-04, FR-F13-06.

```
   Reference 01JD7K2Q9X8V3MZ4R6T   [⧉ Copy]   [View audit trail →]
             ↑ monospace, selectable  ↑         ↑
             always visible          usa-button--unstyled
                                     announces "Reference copied"
```

**Rules:**
1. A correlation ID appears on **every** error state and **every** state-changing confirmation, rendered in a monospace, user-selectable field with a copy control (`usa-button--unstyled` + `usa-icon content_copy`).
2. Copying announces politely: *"Reference copied."*
3. Where the principal is entitled to see it, the ID is **also a link** to SCR-34's chain view filtered to that correlation ID — turning "here is a reference number" into "here is the whole story."
4. In activity history, the correlation ID is the **link affordance** that converts four disconnected rows into one narrative. Accessible name: *"View the full audit chain for this action."*
5. Administrators additionally get cross-links from an integration issue → its audit chain → the application detail, so symptom-to-context is one click (FR-F11-03 rule 2).

---

### Pattern: Cross-application breadcrumb

**When to use:** Every detail and form screen.
**Traces to:** F3, F7 / US-029, US-061; FR-F03-06.

```
Work Queue  ›  ▣ eApp  Case A-1042  ›  ▣ PVQ  Related Issue ISS-2207
    ↑                ↑                            ↑
  link          link + badge            aria-current="page", plain text
restores filters
```

**Rules:**
1. Labels come from the server (`breadcrumbTrail`), never invented client-side from IDs.
2. Segments belonging to a spoke carry a **source badge** (text + icon, never colour alone).
3. Non-final segments are links that **restore prior state** — queue filters/sort/page, case scroll position.
4. Final segment is plain text with `aria-current="page"`.
5. Depth capped at 4; deeper trails collapse the middle behind an accessible "Show full trail" disclosure — never a silent ellipsis.
6. `<nav aria-label="Breadcrumb">` wrapping an ordered list (`usa-breadcrumb`).

**This is the flagship journey's continuity proof made visible.** After traversal the trail reads `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207` — naming both systems, in one line, without the user having typed an identifier (SM-04).

---

### Pattern: Filter chips and result count

**When to use:** SCR-13, 33, 35 and every console list.
**Traces to:** F5, F14 / US-042, US-045, US-110; FR-F05-03 rule 6, FR-F14-04.

```
Active filters:  [ Source: PVQ  ✕ ]  [ Assigned to: me  ✕ ]  [ Clear all filters ]
                   ↑ usa-tag + remove button
                   accessible name: "Remove filter: Source system — PVQ"
```

**Rules:**
1. **Role default filters render as visible chips on first load.** A silently pre-filtered list is a lie about completeness (FR-F05-03 rule 7).
2. Removing a chip updates the URL, re-queries, and announces the new count.
3. Result count announced politely on **every** filter, sort, search, or page change:
   *"{n} work items. Showing {a} to {b}. {m} of {k} systems reporting."*
4. Queue state lives in the **URL** (`?sourceSystem=PVQ&status=OPEN&sort=dueDate&dir=asc&page=2`), so "return with filters intact" is a property of the address bar, the link is shareable, and the Back button behaves (TechArch §12.1).

---

### Pattern: Sortable table header

**When to use:** Every data table.
**Traces to:** F14 / US-110; FR-F14-04 rule 3.

```
┌──────────────────────┐
│ Due date  ▲          │   <th scope="col" aria-sort="ascending">
│  └ <button>          │     <button>Due date</button>
└──────────────────────┘
```

Activation toggles direction and announces politely: *"Sorted by due date, ascending. 28 items."*
Nulls **always sort last**, in both directions — never interleaved (FR-F05-04 rule 2).
Pagination bounds controls are **disabled, not hidden**, with an explanatory reason.

---

### Pattern: Form validation and error summary

**When to use:** Every form.
**Traces to:** F14 / US-113; FR-F14-03, FR-F06-04.

```
┌──────────────────────────────────────────────────────┐
│ ✕  There is a problem                role="alert"    │
│    Fix the following, then try again.  ← FOCUS HERE  │
│    • Choose a resolution disposition.   ← in-page    │
│    • Enter at least 20 characters describing how       link
│      you resolved this issue.                        │
└──────────────────────────────────────────────────────┘
```

**Rules:**
1. Summary at top of form, `role="alert"`, heading "There is a problem." **Focus moves to the summary.**
2. Each entry is an **in-page link** that focuses its field.
3. Each field shows an inline `usa-error-message` associated by `aria-describedby`, and carries `aria-invalid="true"`.
4. Document title is prefixed `"Error: "`.
5. **Entered content is preserved verbatim.** Losing a long narrative to a validation failure is a trust-destroying event and is explicitly prohibited (JRN-01.01 Key Moment).
6. Required fields marked with the **text** "required" — never colour or asterisk alone.
7. Character counters (`usa-character-count`) announce at **90% and 100%** of limit, not on every keystroke.
8. Client and server validate with the **same schema**, so client validation can never block a submission the server would accept (TechArch §12.4).

---

### Pattern: Modal dialog

**When to use:** SCR-02 certificate picker, SCR-06 timeout warning, destructive-action confirmations.
**Traces to:** F14 / US-109, US-111; FR-F14-02 rule 3.

`usa-modal` with `role="dialog"`, `aria-modal="true"`. Focus **trapped while open**, Escape closes, and **focus returns to the invoking control** on close. No exceptions, verified by test.

---

### Pattern: Live-region politeness map

**Traces to:** F14 / US-115; FR-F14-07 rule 2.

| Politeness | Used for |
|---|---|
| `aria-live="polite"` | Queue refresh and result counts · widget load completion · sort and filter changes · alert counts · **health recovery** · role switch · connection-test results · "Reference copied" |
| `role="alert"` / assertive | Form error summaries · action failures · session-timeout thresholds · **degraded warnings on first appearance only** |

Announcements are **debounced and deduplicated** — rapid successive changes produce one announcement, not a stream. Dynamic insertion **never** moves focus or reorders content under the cursor.

**The one deliberate exception:** the dual-system confirmation (`Confirmation with read-back`) **does** take focus, because it is the result the user submitted and is waiting for. Every other async update does not.

---
## Responsive Considerations

### Breakpoints — USWDS tokens only

No raw pixel media queries. All breakpoints reference the USWDS breakpoint token scale, so a theme change moves them consistently.

| Token | Width | Design intent |
|---|---|---|
| `mobile` | 320px | **Hard floor.** Every route must be fully usable with **no horizontal page scroll** (NFR-16, US-116) |
| `mobile-lg` | 480px | Cards gain internal two-column layout for label/value pairs |
| `tablet` | 640px | Primary nav expands from `usa-menu-btn` to horizontal `usa-nav`; tables begin transitional treatment |
| `tablet-lg` | 880px | Filter rails move from disclosure to sidebar; dashboards go two-column |
| `desktop` | 1024px | Full layouts as drawn in the screen chunks; console list/detail split |
| `desktop-lg` | 1200px | Max content width caps via `$theme-site-margins-width`; no further reflow |

**Governing rules:**
- Content **reflows** rather than requiring two-dimensional scrolling. Data tables are the sole exception, and they scroll **within their own labelled, keyboard-scrollable region** — never forcing page-level horizontal scroll (FR-F14-08 rule 5).
- Fully usable at **200% zoom** with no clipping or overlap. Text resizable to 200% without loss of content or function.
- **Touch targets ≥ 44×44 CSS pixels** at every breakpoint, with adequate spacing.
- **No content requires hover** to be discoverable. Tooltip content is available on focus and is never the sole source of essential information.
- `prefers-reduced-motion: reduce` disables all non-essential animation, including skeleton shimmer.

---

### The chrome budget at 320px

The demo banner is a **global invariant** and cannot be dismissed. At 320px it competes directly with primary content — a real, named tension (NFR-13 vs SM-25), resolved by the chrome budget in FR-F03-03 rule 3a.

```
┌─────────────────────────────────┐ ─┐
│ Demo — Synthetic Data Only.     │  │ units(4)  ← TRUNCATED to bold lede.
│                                 │  │             Full sentence stays in the
│                                 │  │             DOM in a visually-hidden
│                                 │  │             span, so screen readers and
│                                 │  │             the CI copy-scan still find
│                                 │  │             it VERBATIM.
├─────────────────────────────────┤  │
│ ▣ An official website ▾         │  │ units(4)  ← usa-banner CLOSED state
├─────────────────────────────────┤  ├─ ≤ units(15) TOTAL (~120px)
│ [DCSA]                    [☰]   │  │ units(7)  ← single compact row:
│                                 │  │             wordmark + menu button.
│                                 │  │             Identity, role, timer,
│                                 │  │             search, account menu all
│                                 │  │             move INTO the menu —
│                                 │  │             NOTHING becomes unreachable.
└─────────────────────────────────┘ ─┘
```

**Never done to make room:** hiding the banner, shrinking it below AA contrast, reducing its text below the minimum readable size, or overlaying it with an announcement. The banner budget is fixed; **other chrome yields to it**.

---

### Phone-first: the applicant view

SCR-11 and SCR-18 are designed at 320px **first**, and adapted upward. This is a genuine access path, not a responsive checkbox — this persona is on a phone, at lunch, in short interrupted sessions.

**The measured acceptance criterion:** on a **320×568** viewport, the status sentence on SCR-11 is visible **without scrolling**.

Achieved by:
1. Chrome capped at `units(15)` (above).
2. `<h1>` is the **first** element in `<main>` — **no breadcrumb, no page-level alert region, no announcement region above it** on SCR-11.
3. The status answer is a `usa-summary-box` immediately following the `<h1>`.
4. The step indicator, task list, and notices all fall **below** the fold — correctly, because they are secondary to the status question.

If a degraded notice must appear on SCR-11, it renders **below** the status summary box, not above it. The applicant's answer to "where do I stand" outranks the platform's account of its own health on this one screen.

---

### Work-queue table reflow — the hardest responsive problem

A nine-column data table cannot survive 320px as a table. The design uses a **three-stage progression**, and the key constraint is that **accessible-table semantics must survive every stage**.

```
≥ desktop (1024px) ── FULL TABLE
┌────────────────┬────────┬──────┬────────┬────────┬──────┬────────┬────────┐
│ Title          │ Source │ Type │ Subject│ Status │ Pri  │ Due ▲  │ Last   │
├────────────────┼────────┼──────┼────────┼────────┼──────┼────────┼────────┤
│ Case A-1042 …  │ ▣ eApp │ Case │SUBJ-…  │ Under  │Routine│ 19 Sep│ 3d ago │
└────────────────┴────────┴──────┴────────┴────────┴──────┴────────┴────────┘

tablet–desktop (640–1023px) ── COLUMN PRIORITY + SCROLL REGION
  Columns drop in reverse priority order: Last activity → Assignee → Type.
  Remaining columns sit inside a labelled, keyboard-scrollable region:
  <div role="region" aria-label="Work items table, scrollable"
       tabindex="0">  ← focusable so keyboard users can scroll it
  Dropped values are NOT lost — they move into the row's expandable detail.

< tablet (640px) ── STACKED CARD LIST
┌───────────────────────────────────────┐
│ Case A-1042 — Section 13A employment  │  ← the row-identifying cell becomes
│ history                               │    the card heading, still <th scope="row">
│                                       │
│ Source system   ▣ eApp                │  ← EVERY cell keeps an explicit,
│ Type            Case review           │    VISIBLE label. The <th scope="col">
│ Subject         SUBJ-00418            │    text is rendered as the label, so
│ Status          Under review          │    header/cell association survives
│ Priority        Routine               │    the visual change.
│ Due             19 Sep 2026 (4 days)  │
│ Last activity   3 days ago            │
│                                       │
│                        [ Open → ]     │
└───────────────────────────────────────┘
```

**What must NOT change across stages:**
- The `<table>` element, `<caption>`, `<th scope="col">`, and `<th scope="row">` **remain in the DOM at every breakpoint.** The card appearance is achieved with CSS display changes, **not** by swapping to `<div>`s. A screen-reader user gets identical semantics at 320px and 1440px.
- The `<caption>` continues to state contents, result count, and systems-reporting count.
- Sortable headers remain `<button>`s with `aria-sort`. At <640px they move into a **"Sort by" `usa-select`** that is bound to the same state and announces identically — sorting is never lost on mobile.
- Source attribution stays text + icon with the accessible name "Source system: {displayName}".

**Filter rail:** sidebar at ≥`tablet-lg`; collapses to a `usa-accordion` disclosure **above** the results below that, labelled "Filter work items (2 active)" so the active-filter count is visible while collapsed. **Filter chips always remain visible** even when the rail is collapsed — a hidden active filter is the same lie about completeness as a silent default.

**Pagination:** full `usa-pagination` at ≥`tablet`; at <640px it reduces to "Previous / Page 2 of 6 / Next" with bounds controls **disabled, not hidden**.

---

### Other table reflows

The same DOM-preserving card pattern applies to every table in the product:

| Table | Priority columns retained longest | Notes |
|---|---|---|
| Audit trail (SCR-33) | Timestamp, Actor, Action, Outcome | Correlation ID moves into the card body but remains a link |
| Integration issues (SCR-25) | Timestamp, Application, Error class | Technical detail stays in the expandable region |
| Connected applications (SCR-22) | Display name, Health, Enabled | Adapter type and endpoint move into the card |
| System health (SCR-24) | Application, Status, Last OK | Latency percentiles move into the card |
| **Dual-system confirmation (SCR-20)** | **All four columns** | Reflows to **stacked per-system cards**, each a labelled definition list. The per-system read-back is the point of the screen and is **never** lost to a scroll region |
| Risk factors (SCR-17), Leads (SCR-19), Status maps (SCR-28) | Identifying column + value | Standard card reflow |

---

### Dashboard reflow

| Breakpoint | Layout |
|---|---|
| ≥`desktop` | Two-column widget grid as drawn in the screen chunks |
| `tablet`–`desktop` | Two columns, widgets may span full width where content demands |
| <`tablet` | **Single column, ordered by priority** — not by source order |

Single-column priority orders:

- **SCR-09 Investigator:** My assigned work → Due soon & overdue → Needs attention → **Newly raised PVQ issues** → Recent activity → Announcements → System status
- **SCR-10 Adjudicator:** Awaiting my determination → Approaching deadlines → Case status distribution → Returned for clarification → Recent activity → Announcements
- **SCR-11 Applicant:** *(status summary is not a widget — it sits above)* Where you are → What you need to do → Your notices → Your submission → Announcements → System status
- **SCR-12 Administrator:** Connected applications → System health → Integration issues → Demo operations → Recent admin activity → Announcements

---

### Detail-screen reflow

At <`tablet`, detail regions stack in the normative document order (summary → content → related items → actions → activity history), with two adjustments:

1. **An `usa-in-page-navigation` jump list** is inserted after the summary header, linking to Related items, Actions, and Activity history — so the **action panel is reachable without scrolling past an entire questionnaire body**.
2. **On SCR-15 the related-items panel is promoted above the questionnaire sections at <640px.** On a narrow viewport the cross-system relationship is the reason the user is on this screen; it must not sit below four collapsed accordions. This is a deliberate reordering, and because it is a CSS order change on a semantically-ordered DOM, heading navigation still reaches everything.

---

### Forms

- Inputs are full-width below `tablet`; side-by-side pairs (date from/to) stack.
- `usa-step-indicator` (SCR-28) collapses to **"Step 3 of 5" plus the current step label** — segments are not rendered as tiny unlabelled dots.
- The disposition radio group (SCR-16) stacks with **full-width hit areas**, each ≥44px tall, hint text on its own line.
- Error summaries remain at the top of the form and still receive focus.
- `usa-character-count` remains visible and continues to announce at 90% and 100%.

---

### Modals

`usa-modal` at <`tablet` becomes full-screen with a sticky action bar, so the primary action is never below the fold on a short viewport. Focus trapping, Escape-to-close, and focus restoration are **unchanged** across all breakpoints.

---

### Verification

| Check | Method |
|---|---|
| No horizontal page scroll at 320px, every route, every role | Automated crawl at 320px width |
| Usable at 200% zoom, every route | Automated + manual audit |
| Table semantics identical at 320px and 1440px | DOM assertion that `<table>`, `<caption>`, and `scope` attributes persist |
| SCR-11 status sentence above the fold at 320×568 | **Explicit measured test** — the NFR-13 / SM-25 tension |
| Touch targets ≥44×44 px | Automated measurement |
| Reduced-motion honoured | Automated check on animated elements |

---
## Accessibility Notes

Section 508 / WCAG 2.1 Level AA is a **hard gate**, not a polish item. For a federal audience, accessibility failures are disqualifying. This chunk states the cross-cutting contract; per-screen specifics live in each screen chunk.

**The governing design decision:** accessibility is **inherited from four page templates**, not implemented per screen. A pattern re-litigated across 38 screens will be wrong on at least three of them. A screen not built on a template fails design review.

---

### Heading hierarchy

| Rule | Applies to |
|---|---|
| **Exactly one `<h1>` per page**, and it is the **page's own title**, not the product name | Every route |
| `<h2>` for major regions, `<h3>` for subsections — **gap-free**, no skipped levels | Every route |
| The shell contributes **no** `<h1>`; each page supplies it | SCR-08 |
| Multi-step forms keep a **constant `<h1>`** with a changing `<h2>` step name | SCR-28 |
| Dashboard widgets are `<section aria-labelledby>` pointing at their `<h2>` | SCR-09–12 |
| Related-item groups and questionnaire sections are `<h3>` | SCR-14–19 |

A CI check asserts the single-`<h1>` rule and heading order **on every route for every role**.

---

### Landmark regions

Document order is normative:

```
skip link → demo banner → usa-banner → <header role="banner">
  → <nav aria-label="Primary"> → <nav aria-label="Breadcrumb">
  → <main id="main-content"> → <footer role="contentinfo">
```

- Exactly one each of `banner`, `main`, `contentinfo`.
- **Every additional nav carries a distinct `aria-label`** — the console sidenav is `<nav aria-label="Administrator console">`.
- Filter rails are `<form>` landmarks with `aria-label` ("Filter work items", "Filter audit records").
- The demo banner sits **inside** the `banner` landmark and is **never `aria-hidden`**.
- Unauthenticated routes render banner + main + contentinfo and **no primary nav** — correct, because there is nothing yet to navigate.
- **Error pages render inside the shell**, so the full landmark set is present even on SCR-30/31/32.

---

### Focus order and focus management

Tab order **follows visual order on every screen**. Positive `tabindex` values are prohibited.

| Situation | Behaviour | Why |
|---|---|---|
| **Client-side navigation** | `document.title` updates to `{Page name} — DCSA Unified Layer`; **focus moves to the new `<h1>`** | Without this, screen-reader users are stranded at the top of an unchanged DOM |
| **The flagship traversal (SCR-15 → SCR-16)** | Same, and this is the **highest-risk a11y step in the product** — verified explicitly, not assumed | If focus drops to document top or a detached element, the user loses **exactly the continuity this product claims to deliver** |
| **Form validation failure** | Focus moves to the **error summary**; title prefixed `"Error: "`; each entry is an in-page link that focuses its field | |
| **Modal open** | Focus **trapped**; Escape closes; **focus returns to the invoking control** | |
| **Action success / dual-system confirmation** | Confirmation announced politely **and receives focus** | This is a result the user submitted and is waiting for — the **one deliberate exception** |
| **Degraded notice arriving** | Announced politely; **focus NOT moved**; input untouched; content not reordered | The user may be mid-narrative elsewhere. A warning that steals focus is itself a failure |
| **Widget settling / poll landing** | Announced once; **focus not moved** | |
| **Return to queue** | Restores filters, sort, page **and returns focus to the originating row** | |
| **Anchor navigation** (outstanding-issue link, "view this section") | **Moves focus** to the target heading, not merely scrolls | |
| **Skip link** | First focusable element on every route; visible on focus; moves focus to `<main>` | |
| **Disabled control** | **Removed from the tab order**, with `disabledReason` rendered as **adjacent visible text** joined via `aria-describedby` | So the explanation is readable without focusing an unfocusable element |

---

### Visible focus indicator

`$theme-focus-color` (`blue-warm-40v`), width `0.25rem`, offset `0`. Meets **≥3:1 against every background it appears on**, including the inverted header and the demo banner. **Never removed** — `outline: none` without a replacement is prohibited by a build-failing lint rule. Remains visible in forced-colors / high-contrast mode.

---

### Keyboard operability

- **Every interactive control** is reachable and operable by keyboard alone: Tab/Shift-Tab, Enter for links and buttons, Space for buttons and checkboxes, Arrow keys within radio groups and menus, Escape to close overlays.
- **Zero keyboard traps** across all routes. Focus can always leave any component.
- Composite widgets — sortable headers, filter chips, accordions, the account menu, combo boxes, step indicators — implement the **ARIA Authoring Practices** keyboard pattern for their role.
- **The flagship workflow is completable using the keyboard alone, end to end** (US-069, SM-08), recorded as a documented pass.
- **The five-step registration form is completable using only the keyboard** (US-094).
- The collapsed mobile menu traps focus **only while open** and is escapable.

---

### Accessible data tables

Every table in the product — work queue, audit, confirmation, admin inventory, health, integration issues, identities, risk factors, leads, status maps:

| Requirement | Detail |
|---|---|
| Real `<table>` | Never a `<div>` grid. **Preserved at every breakpoint**, including the 320px card treatment |
| `<caption>` | States contents **and current result count**, e.g. "Work items assigned to you — 28 results. 5 of 5 systems reporting." |
| `<th scope="col">` | On **every** column header |
| `<th scope="row">` | On the row's identifying cell (title, timestamp, system, application name) |
| Sortable headers | `<th>` containing a real `<button>`; **`aria-sort` on the `<th>`** reflecting `ascending \| descending \| none` |
| **Sort announcement** | Activation announces politely: "Sorted by due date, ascending. 28 items." |
| Pagination | `usa-pagination` with `aria-label`, `aria-current="page"`, and bounds controls **disabled — not hidden** — with a reason |
| Result-count announcement | On every filter, search, sort, or page change: "{n} results. Showing {a} to {b}." Debounced |
| Status cells | Always carry **text**; icon where helpful. Never colour-only |
| Narrow viewports | Horizontal scroll confined to a **labelled, keyboard-scrollable region** (`role="region"` + `aria-label` + `tabindex="0"`), never page-level scroll |
| Empty tables | Designed empty state **inside the table region, with the caption still present** |

---

### Forms — label and error association

| Requirement | Detail |
|---|---|
| Label | Programmatically associated `<label>` via `for`/`id` on **every** input. **A placeholder is never a label** |
| Hint text | Associated via `aria-describedby` |
| Required | Marked with the **text** "required" — never colour or asterisk alone |
| Grouping | Related inputs in `<fieldset>` with `<legend>` — disposition radios, MFA method choice, role selection, risk factors, failure-injection modes |
| Invalid field | `aria-invalid="true"` **plus** an inline `usa-error-message` joined into `aria-describedby` |
| **Error summary** | `role="alert"`, heading "There is a problem", **focus moved to it**, each entry an **in-page link** that focuses its field |
| Document title | Prefixed `"Error: "` on validation failure |
| Error copy | Specific and actionable, naming what to do. **Never "Invalid input."** |
| Character counters | `usa-character-count` announced politely at **90% and 100%** of limit — not on every keystroke |
| **Content preservation** | Entered content is **preserved verbatim** through validation failure and session extension. Losing a long narrative is a trust-destroying event and is explicitly prohibited |
| Validation parity | Client and server validate with the **same schema**, so client validation can never block a submission the server would accept |

---

### aria-live regions

| Politeness | Used for |
|---|---|
| `aria-live="polite"` | Queue refresh and result counts · widget load completion · sort and filter changes · alert counts · **health recovery** · role switch · connection-test results · "Reference copied" · "{n} more entries loaded" |
| `role="alert"` / `assertive` | Form error summaries · action failures · session-timeout thresholds · **degraded warnings on first appearance only** · SCR-30 denial |

**Rules:**
- Announcements are **debounced and deduplicated** — rapid successive changes produce one announcement, not a stream.
- A degraded notice is **not re-announced** on every 30-second poll.
- Loading regions set `aria-busy="true"` and announce completion **once**, not repeatedly during polling.
- **Dynamic insertion never moves focus or reorders content under the user's cursor.**
- Degraded warnings are **also present in the static page structure**, so a user arriving after the announcement still meets them by navigating headings and landmarks.
- The session countdown announces at **open, 60s, and 15s only** — never per tick.
- Auto-clear countdowns (SCR-38) update **silently** and announce only on expiry.

---

### Colour-independent meaning

**Status is never conveyed by colour alone.** Every status, priority, health state, outcome, overdue marker, read state, and validation state is paired with **text and a distinct icon shape**.

| Domain | Representation |
|---|---|
| Health | "Healthy" ✓ `check_circle` / "Degraded" ! `warning` / "Unavailable" ✕ `cancel` |
| Status category | "Open" / "In progress" / "Blocked" / "Closed" + distinct icons |
| Priority | "Urgent" / "Elevated" / "Routine" as text, **distinct tag shapes** (border weight), not distinct fills |
| Overdue | The **word "Overdue"** plus an icon — never a red row or red date |
| Outcome | "Success" / "Denied" / "Failed" / "Partial" as text + icon |
| Source system | Registry `displayName` as text + **distinct icon shape per application** |
| Read/unread | Text + icon, never a colour dot |
| Progress (step indicator) | `aria-current="step"` + the visible words "You are here" |
| Priority not provided | "Priority not provided by {system}" — never an implied default |

**Verified two ways:** an automated contrast check reporting **100% conformance** (SM-09), and **a grayscale rendering of every screen retaining all status meaning** (FR-F14-06 AC-2).

**Contrast:** 4.5:1 normal text, 3:1 large text (≥24px, or ≥19px bold), 3:1 for meaningful non-text elements (focus indicators, form borders, status icons). Usable in **forced-colors / high-contrast mode** — the demo banner, focus indicators, and status icons all remain visible.

---

### Target sizes

**≥ 44×44 CSS pixels** for every interactive control at every breakpoint, with adequate spacing. Card-based controls (method cards on SCR-01, task cards on SCR-11, related-item entries on SCR-15) are **fully clickable**, not just their button text.

---

### 320px reflow

- **No horizontal page scroll on any route, for any role** (NFR-16).
- Content reflows rather than requiring two-dimensional scrolling; tables are the sole exception and scroll within their own labelled region.
- Usable at **200% zoom**; text resizable to 200% without clipping or overlap.
- **The measured case:** SCR-11's status sentence is visible **without scrolling at 320×568**. See `Y1-responsive §Chrome budget` for the mechanism and `00-overview` for the recorded NFR-13 / SM-25 tension.
- Table semantics (`<table>`, `<caption>`, `scope`) are **identical at 320px and 1440px** — the card treatment is CSS, not a DOM swap.

---

### Timing and motion

- Session timeout warning at **T−2 minutes**, keyboard-operable, extendable.
- **Extending a session preserves all entered form data** (US-117, FR-F14-09 AC-1).
- No time limit on completing a form other than the session timeout.
- No content auto-refreshes in a way that moves focus or changes what is under the cursor; health polling updates a notice region only.
- `prefers-reduced-motion: reduce` disables **all** non-essential animation including skeleton shimmer, transitions, and auto-advancing indicators.

---

### Per-screen verification matrix

Every screen must pass all eight columns. Error, empty, and **degraded** states are scanned too — they are not exempted.

| Screen | Headings | Landmarks | Focus mgmt | Keyboard | Table a11y | Form a11y | Live regions | 320px |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| SCR-01 Login | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| SCR-02 Cert picker | ✓ | ✓ | **modal** | ✓ | ✓ | ✓ | ✓ | ✓ |
| SCR-03 ECA | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| SCR-04/05 MFA | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| SCR-06 Timeout | ✓ | — | **modal** | ✓ | — | — | **countdown** | ✓ |
| SCR-07 Signed out | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ |
| SCR-08 Shell | ✓ | **✓ core** | **✓ core** | ✓ | — | — | ✓ | ✓ |
| SCR-09 Inv dashboard | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| SCR-10 Adj dashboard | ✓ | ✓ | ✓ | ✓ | **✓ distribution** | — | ✓ | ✓ |
| SCR-11 Applicant | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | **✓ measured** |
| SCR-12 Admin dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| SCR-13 Work queue | ✓ | ✓ | ✓ | ✓ | **✓ core** | ✓ | **✓ core** | **✓ reflow** |
| SCR-14 Detail | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| **SCR-15 eApp case** | ✓ | ✓ | **✓ critical** | ✓ | — | — | ✓ | **✓ reorder** |
| **SCR-16 PVQ issue** | ✓ | ✓ | **✓ critical** | ✓ | — | **✓ critical** | ✓ | ✓ |
| SCR-17 PDT | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| SCR-18 IEP | ✓ | ✓ | ✓ | ✓ | — | **✓ critical** | ✓ | **✓ phone-first** |
| SCR-19 IM | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **SCR-20 Confirmation** | ✓ | ✓ | **✓ takes focus** | ✓ | **✓ critical** | — | ✓ | **✓ card reflow** |
| SCR-21 Notifications | ✓ | ✓ | ✓ | ✓ | — | ✓ | **✓ no focus theft** | ✓ |
| SCR-22–27, 29 Console | ✓ | **✓ 2 navs** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| SCR-28 Registration | **✓ constant h1** | ✓ | **✓ per step** | **✓ critical** | ✓ | **✓ critical** | ✓ | ✓ |
| SCR-30/31/32 Errors | ✓ | ✓ | **✓ to h1** | ✓ | — | — | ✓ | ✓ |
| SCR-33 Audit viewer | ✓ | ✓ | ✓ | ✓ | **✓ core** | ✓ | ✓ | ✓ |
| SCR-34 Chain view | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| SCR-35 Search | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| SCR-36 A11y statement | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ |
| SCR-37/38 Demo ops | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

### Verification gate

- **Automated axe-core scan in CI across every route, for every role**, including error, empty, and **degraded** states.
- **The build fails on any serious or critical violation** (SM-07). Moderate and minor are reported and tracked.
- A **documented manual pass** — keyboard-only and screen-reader — is performed before the demo and recorded with date, tooling, and findings.
- **Accessibility review is a merge gate:** a change introducing a violation does not merge.
- The **flagship workflow keyboard-only pass** is recorded separately, because it is the path a reviewer will watch (SM-08).
- **Known limitations are published with dates** on SCR-36. "We have no known limitations" is not a credible claim and is not made.

---
