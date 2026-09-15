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
