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
