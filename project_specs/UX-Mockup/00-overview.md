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
