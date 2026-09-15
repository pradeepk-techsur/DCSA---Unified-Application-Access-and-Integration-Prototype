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
