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
