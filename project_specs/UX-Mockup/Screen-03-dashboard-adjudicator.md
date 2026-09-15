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
