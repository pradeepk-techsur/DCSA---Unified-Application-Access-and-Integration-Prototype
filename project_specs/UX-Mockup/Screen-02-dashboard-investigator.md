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
