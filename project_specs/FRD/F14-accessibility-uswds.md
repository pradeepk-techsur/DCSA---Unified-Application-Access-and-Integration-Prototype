## F14 — USWDS v3 Accessible Interface (Section 508 / WCAG 2.1 AA)

**Traces to:** PRD F14 (P0 — hard requirement); NFR-01, NFR-02, NFR-03, NFR-16, SM-07, SM-08, SM-09, R-04. **Screens:** all, plus SCR-36 accessibility statement.

**Description:** The accessible, design-system-conformant interface treated as a first-class feature with its own testable functional requirements — not as a quality attribute asserted at the end. For a federal audience, accessibility failures are disqualifying. Each requirement below is written as behavior a test can verify, because "be accessible" is not implementable and "every interactive control is operable by keyboard with a visible focus indicator" is.

> **Assumption (flagged):** the DCSA Ecosystem Style Guide (Attachment 1) was not supplied. USWDS v3 with token-based DCSA theming is assumed. Adopting the real guide is a token and asset swap. Revisit on receipt (PRD §4, Q-01).

**Terminology:**
- **Design token** — a named theme value (color, spacing, type) from USWDS; the only permitted source of visual values.
- **Live region** — an `aria-live` container announcing asynchronous change without moving focus.
- **Error summary** — the USWDS pattern listing form errors at the top of a form with in-page links to each field.

---

### FR-F14-01 — USWDS component adoption and token-only theming

**Processing / business rules:**
1. Every UI element is a USWDS v3 component or composed from USWDS primitives. No bespoke component library, and no reimplementation of a component USWDS provides (button, alert, accordion, banner, breadcrumb, card, checkbox, combo box, date picker, file input, form, header, footer, icon, identifier, in-page navigation, language selector, link, list, modal, pagination, process list, prose, radio, range, search, select, side navigation, site alert, skip nav, step indicator, summary box, table, tag, text input, textarea, time picker, tooltip, validation).
2. **Zero hard-coded color, font, or spacing literals** anywhere in the codebase. All visual values are USWDS design tokens or theme-token overrides in a single theme configuration file.
3. A lint rule fails the build on any hex color, `rgb()`, `hsl()`, named color, raw `px`/`rem` spacing outside the token scale, or font-family literal in component code (NFR-03).
4. DCSA theming is expressed exclusively as token overrides: federal blue palette, Public Sans typography, USWDS spacing and radius scales, plus a reserved header slot for a DCSA seal/wordmark asset.
5. No inline styles carrying visual values; utility classes come from the USWDS utility set.

**Acceptance criteria:**
- AC-1: The lint rule passes with zero violations (NFR-03).
- AC-2: Changing the theme configuration changes the entire application's palette with no component edits.

---

### FR-F14-02 — Keyboard operability

**Processing / business rules:**
1. Every interactive control is reachable and operable by keyboard alone: Tab/Shift-Tab to move, Enter to activate links and buttons, Space to activate buttons and toggle checkboxes, Arrow keys within radio groups and menus, Escape to close overlays.
2. **No keyboard traps.** Focus can always leave any component using the keyboard.
3. Modals (SCR-02 certificate picker, SCR-06 timeout warning, confirmation dialogs) trap focus **while open**, close on Escape, and **restore focus to the invoking control** on close.
4. Tab order follows visual order on every screen. Positive `tabindex` values are prohibited.
5. Custom composite widgets (sortable table headers, filter chips, accordions, the account menu) implement the ARIA Authoring Practices keyboard patterns for their role.
6. Disabled controls are not in the tab order, and their `disabledReason` is exposed adjacent to them in text so the explanation is available without focusing the disabled element (`FR-F06-03`).
7. The flagship workflow is completable using the keyboard alone, end to end (SM-08).

**Acceptance criteria:**
- AC-1: A keyboard-only pass completes the flagship workflow (SM-08, recorded).
- AC-2: The automated keyboard smoke test asserts reachability and operability of every primary control (`FR-F19-07`).
- AC-3: Zero keyboard traps across all routes.

---

### FR-F14-03 — Accessible forms

**Processing / business rules:**
1. Every input has a programmatically associated `<label>` (`for`/`id`). Placeholder text is never a substitute for a label.
2. Hint text is associated via `aria-describedby`.
3. Required fields are marked with a text indicator ("required") in the label — never by color or asterisk alone.
4. Related inputs are grouped in `<fieldset>` with a `<legend>` (disposition radio group, MFA method choice, role selection, risk factors).
5. On validation failure:
   - A USWDS error summary renders at the top of the form with `role="alert"` and a heading "There is a problem."
   - **Focus moves to the summary.**
   - Each entry is an in-page link to its field; activating it focuses that field.
   - Each field shows an inline error message associated by `aria-describedby`, and the field carries `aria-invalid="true"`.
   - The document title is prefixed "Error: " so the failure is announced on page-level submissions.
6. Error copy is specific and actionable, naming what to do — never "Invalid input." All copy is specified per-field in the owning requirement and consolidated in `Y2`.
7. Character-limited fields show a counter announced politely at 90% and 100% of the limit, not on every keystroke.
8. Success confirmations are announced via a polite live region and receive focus, so a keyboard user knows the action landed.
9. Client validation never blocks a submission the server would accept, and never accepts one the server would reject — the rules are the same rules.

**Acceptance criteria:**
- AC-1: Every form in the application satisfies rules 1–8, verified by automated scan plus manual audit.
- AC-2: Submitting an invalid form moves focus to the summary and links to the offending field.

---

### FR-F14-04 — Accessible data tables

**Processing / business rules:**
1. Every data table is a real `<table>` with a `<caption>` describing its contents and current result count.
2. `<th scope="col">` on every column header; `scope="row"` on the row's identifying cell.
3. Sortable headers contain a `<button>` with `aria-sort` on the `<th>` reflecting `ascending | descending | none`; activation announces the new sort and result count via a polite live region.
4. Pagination uses the USWDS pagination component with `aria-label`, `aria-current="page"` on the current page, and disabled (not hidden) bounds controls.
5. Result-count changes from filtering, searching, sorting, or paging are announced politely: "{n} results. Showing {a} to {b}."
6. Tables never rely on color to convey status; every status cell carries text, and an icon where helpful.
7. Tables scroll horizontally within a labelled, keyboard-scrollable region at narrow viewports rather than forcing page-level horizontal scroll (NFR-16).
8. Empty tables render a designed empty state inside the table region, with the caption still present.

**Acceptance criteria:**
- AC-1: All tables (work queue, audit, admin inventory, health, integration issues, identities, confirmation results) satisfy rules 1–8.
- AC-2: Sort state changes are announced.

---

### FR-F14-05 — Accessible navigation and landmarks

**Processing / business rules:**
1. Landmark structure per `FR-F03-01`, with unique `aria-label`s on multiple navs.
2. A skip-to-main-content link is the first focusable element on every page, visible on focus, and moves focus to `<main>`.
3. Current page is indicated by `aria-current="page"` plus a visible non-color indicator.
4. Heading hierarchy is correct and gap-free on every screen: one `<h1>`, then `<h2>` for major regions, `<h3>` for subsections.
5. Menus are keyboard-operable with `aria-expanded` state and Escape to close.
6. Breadcrumbs use `<nav aria-label="Breadcrumb">` with an ordered list and `aria-current="page"` on the final segment.
7. Page titles are unique and descriptive, and change on every navigation including client-side route changes (`FR-F03-01`).
8. Focus moves to the new page's `<h1>` on client-side navigation, so screen-reader users are not left at the top of an unchanged DOM.

**Acceptance criteria:**
- AC-1: Every route has a correct landmark set and heading hierarchy.
- AC-2: The skip link works on every route.

---

### FR-F14-06 — Color contrast and non-color meaning

**Processing / business rules:**
1. All text meets WCAG 2.1 AA contrast: 4.5:1 for normal text, 3:1 for large text (≥24px, or ≥19px bold).
2. Meaningful non-text elements — focus indicators, form borders, status icons, chart elements — meet 3:1 against adjacent colors.
3. **Status is never conveyed by color alone.** Every status, priority, health state, outcome, overdue marker, and validation state is paired with text and/or a distinct icon shape (NFR-02):
   - Health: "Healthy" ✓ / "Degraded" ! / "Unavailable" ✕
   - Priority: "Urgent" / "Elevated" / "Routine" as text, with distinct tag shapes
   - Overdue: the word "Overdue" plus an icon, never a red row alone
   - Outcome: "Success" / "Denied" / "Failed" as text
4. Focus indicators are visible against every background they appear on, meeting 3:1, and are never removed (`outline: none` without a replacement is prohibited by lint).
5. The interface is usable in forced-colors / high-contrast mode: the demo banner, focus indicators, and status icons remain visible.
6. Information conveyed by a chart is always also available as an accessible table (`FR-F04-03`).

**Acceptance criteria:**
- AC-1: Automated contrast check reports 100% conformance (SM-09).
- AC-2: A grayscale rendering of every screen retains all status meaning.

---

### FR-F14-07 — Screen-reader semantics and live regions

**Processing / business rules:**
1. Every control has an accessible name that matches or contains its visible label. Icon-only controls carry `aria-label`.
2. Live regions announce asynchronous change **without stealing focus**:
   - `aria-live="polite"`: queue refresh and result counts, widget load completion, sort and filter changes, new alert counts, health recovery, role switch, connection test results.
   - `aria-live="assertive"` / `role="alert"`: form error summaries, action failures, session timeout warning thresholds, degraded-system warnings on first appearance.
3. Loading states set `aria-busy="true"` on the affected region and announce once on completion — not repeatedly during polling.
4. Announcements are debounced and deduplicated: rapid successive changes produce one announcement, not a stream.
5. Decorative images and icons are `aria-hidden="true"`; informative icons carry text alternatives.
6. Dynamic content insertion (a new alert, a refreshed widget) does not move focus or reorder content under the user's cursor (`FR-F05-05` rule 6).
7. The demo banner is exposed to assistive technology (never `aria-hidden`) and is announced once per page load as part of the banner landmark.

**Acceptance criteria:**
- AC-1: A screen-reader pass confirms every async state change is announced exactly once (documented manual pass, NFR-01).
- AC-2: No announcement steals focus.

---

### FR-F14-08 — Motion, zoom, and responsive behavior

**Processing / business rules:**
1. `prefers-reduced-motion: reduce` disables all non-essential animation, including skeleton shimmer, transitions, and auto-advancing indicators.
2. The interface is fully usable at 200% zoom with no loss of content or function.
3. The interface is fully usable at 320px viewport width with no horizontal page scroll (NFR-16).
4. Text can be resized to 200% without clipping or overlap.
5. Content reflows rather than requiring two-dimensional scrolling, except for data tables, which scroll horizontally within their own labelled region.
6. Touch targets are at least 44×44 CSS pixels.
7. No content requires a hover to be discoverable; tooltip content is also available on focus and is never the only source of essential information.

**Acceptance criteria:**
- AC-1: Every route passes a 320px and a 200%-zoom audit.
- AC-2: Reduced-motion preference is respected across all animated elements.

---

### FR-F14-09 — Timing and session accessibility

**Processing / business rules:**
1. The session timeout warning appears at least 2 minutes before expiry (`FR-F00-06`), is keyboard-operable, and can be extended.
2. The countdown is announced at open, 60 seconds, and 15 seconds — not continuously.
3. No content auto-refreshes in a way that moves focus or changes what is under the cursor; health polling updates a notice region only.
4. There is no time limit on completing a form other than the session timeout, and extending the session preserves entered form data (`FR-F00-06` rule 4).

**Acceptance criteria:**
- AC-1: Extending a session from within a partially completed form preserves all input.
- AC-2: The countdown announcement pattern is verified in a screen-reader pass.

---

### FR-F14-10 — Error, empty, and loading state accessibility

**Processing / business rules:**
1. Every error state has: a heading, plain-language explanatory text, at least one actionable next step, and a copyable correlation ID where applicable.
2. Error pages (SCR-30, SCR-31, SCR-32) set a descriptive `<title>`, move focus to the `<h1>`, render inside the shell with the demo banner, and provide working exit links.
3. Empty states are designed content with a heading, an explanation of what would appear, and — where applicable — an action. Never a blank region.
4. Loading states use `aria-busy` on the region, preserve layout to prevent content shift, and announce completion once.
5. Degraded states use `role="status"` and name the affected system and the missing data (`FR-F16-05`).

**Acceptance criteria:**
- AC-1: Every screen's four non-happy states are implemented and pass the accessibility scan.
- AC-2: No state renders a blank region or an unlabelled spinner.

---

### FR-F14-11 — Accessibility statement (SCR-36)

**Processing / business rules:**
1. A screen stating: the conformance target (Section 508 / WCAG 2.1 AA), the assessment approach (automated axe-core scanning in CI plus documented manual keyboard and screen-reader passes), known limitations with dates, and how to report an accessibility problem.
2. Reachable from the footer on every screen and from the account menu, including while unauthenticated.
3. States the USWDS assumption and that the DCSA Ecosystem Style Guide was not available (PRD Q-01) — honesty about the assumption belongs on the page that claims conformance.
4. The page itself conforms fully.

**Acceptance criteria:**
- AC-1: The statement is reachable from every screen including login.
- AC-2: Known limitations are listed with dates rather than claimed to be none.

---

### FR-F14-12 — Accessibility verification gate

**Processing / business rules:**
1. An automated axe-core (or equivalent) scan runs in CI across **every route, for every role**, including error, empty, and degraded states (`FR-F19-06`).
2. The build **fails** on any serious or critical violation (SM-07). Moderate and minor violations are reported and tracked.
3. A documented manual pass — keyboard-only and screen-reader — is performed before the demo and recorded with date, tooling, and findings.
4. Accessibility review is a merge gate: a change introducing a violation does not merge.

**Acceptance criteria:**
- AC-1: CI reports zero serious or critical violations across all routes and roles (SM-07, NFR-01).
- AC-2: The manual pass is documented and current.

---
