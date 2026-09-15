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
