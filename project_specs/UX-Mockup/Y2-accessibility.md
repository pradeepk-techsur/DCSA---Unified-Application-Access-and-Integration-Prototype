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
