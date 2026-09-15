### Screens: SCR-22 … SCR-27, SCR-29, SCR-37, SCR-38 — Administrator console

**Purpose:** The administrator's operational view of the unified layer — what is connected, whether it is working, and what has gone wrong. This is the feature that demonstrates the platform is **operable**, not merely usable.
**User Stories:** US-086, US-087, US-088, US-089, US-090, US-091, US-092, US-093, US-125, US-131, US-143 · **Features:** F11, F8, F16
**Template:** `ConsolePage` — `usa-sidenav` sub-navigation + list/detail split

> **The console carries the same shell as every user-facing screen** — same demo banner, same header, same footer. The administrator is **inside the same product**, not in a separate tool (FR-F11-07 rule 5). Every console action is authorized server-side and audited; **the console has no privileged bypass.**

#### Console shell

```
│ Connected applications                                          <h1>          │
│                                                                               │
│ ┌─ usa-sidenav ────────┐ ┌─ CONTENT ──────────────────────────────────────┐  │
│ │ <nav aria-label=      │ │                                                │  │
│ │  "Administrator       │ │                                                │  │
│ │   console">           │ │                                                │  │
│ │                       │ │                                                │  │
│ │ ▸ Connected apps  ◀── │ │    aria-current="page" + VISIBLE non-colour    │  │
│ │ ▸ System health       │ │    indicator (weight + left rule)              │  │
│ │ ▸ Integration issues  │ │                                                │  │
│ │ ▸ Audit trail         │ │                                                │  │
│ │ ▸ Identities & roles  │ │                                                │  │
│ │ ▸ Announcements       │ │                                                │  │
│ │ ▸ Demo operations     │ │                                                │  │
│ └───────────────────────┘ └────────────────────────────────────────────────┘  │
```

---

### Screen: SCR-22 — Connected applications inventory

```
│ Connected applications                                          <h1>          │
│                                            [ Register an application ]        │
│                                                                               │
│ Search [ 🔍 name or ID ]   Status [ All ▾ ]        [ Apply ] [ Clear ]        │
│                                                                               │
│ <caption>Connected applications — 5 registered</caption>                      │
│ ┌────────────┬────────┬────────────┬──────────────┬──────────┬─────────────┐ │
│ │Display name│ ID     │Adapter type│ Work-item    │ Health   │ Enabled     │ │
│ │     ⇅      │  ⇅     │            │ types        │   ⇅      │   ⇅         │ │
│ ├────────────┼────────┼────────────┼──────────────┼──────────┼─────────────┤ │
│ │▣ Electronic│ EAPP   │rest-generic│ 1 ▸          │✓ Healthy │ ✓ Enabled   │ │  ← th scope="row"
│ │  Application│       │ -v1        │              │ 15:04Z   │ [Details →] │ │
│ │▣ Individual│ IEP    │rest-generic│ 2 ▸          │✓ Healthy │ ✓ Enabled   │ │
│ │  Engagement│        │ -v1        │              │ 15:04Z   │ [Details →] │ │
│ │▣ Personnel │ PVQ    │rest-generic│ 1 ▸          │✓ Healthy │ ✓ Enabled   │ │
│ │  Vetting Q.│        │ -v1        │              │ 15:04Z   │ [Details →] │ │
│ │▣ Position  │ PDT    │rest-generic│ 1 ▸          │✓ Healthy │ ✓ Enabled   │ │
│ │  Desig.Tool│        │ -v1        │              │ 15:04Z   │ [Details →] │ │
│ │▣ Investig. │ IM     │rest-generic│ 1 ▸          │✕ Unavail │ ✓ Enabled   │ │
│ │  Management│        │ -v1        │              │ 14:51Z   │ [Details →] │ │
│ └────────────┴────────┴────────────┴──────────────┴──────────┴─────────────┘ │
│                                                                               │
│ ★ DISABLED AND INVALID APPLICATIONS ARE LISTED WITH THEIR STATE CLEARLY       │
│   MARKED — never hidden. An administrator troubleshooting an ABSENCE needs    │
│   to see the row. (FR-F11-01 rule 5)                                          │
│ ★ Health refreshes every 30s, announced politely:                             │
│   "Investigation Management is now unavailable."                              │
```

| State | Copy |
|---|---|
| Empty | "No applications are registered yet. Register your first application to get started." + register action |
| No search matches | "No applications match '{q}'." + clear-search control |
| Registry unreadable | "We can't load the application list right now. Try again in a moment — reference {id}." |
| Not an administrator | → SCR-30: "You don't have access to this page." **Denial audited** |

**Acceptance:** all five spokes appear with configuration read from the registry; the newly registered sixth appears **immediately, without a restart** (SM-12).

---

### Screen: SCR-23 — Application detail

**Purpose:** Everything about one application in one place.

```
│ Investigation Management                                        <h1>          │
│ ▣ IM · rest-generic-v1 · ✕ Unavailable                                        │
│                                                                               │
│ [ Test connection ]  [ Edit configuration ]  [ Disable ]  [ De-register ]     │
│                                                                               │
│ ┌── CONFIGURATION ────────────────────────────────────── <h2> ─────────────┐ │
│ │ Application ID   IM        (immutable — existing records refer to it)    │ │
│ │ Base endpoint    http://im:8085        Health endpoint  /health          │ │
│ │ Visible to roles Investigator, Adjudicator                               │ │
│ │ Registered       1 Aug 2026 by seed                                      │ │
│ │                                                                          │ │
│ │ ⓘ This prototype uses no credentials for spoke connections.              │ │
│ │   ↑ the screen SAYS SO, rather than leaving a reviewer wondering         │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌── CAPABILITIES (from describe(), cached 15:04Z) ────── <h2> ─────────────┐ │
│ ┌── WORK-ITEM TYPES AND STATUS MAPS ──────────────────── <h2> ─────────────┐ │
│ │ <caption>Status map for IM_CASE_ASSIGNMENT — 4 statuses</caption>        │ │
│ │ │ Native status    │ Normalised category │                              │ │
│ │ │ ASSIGNED         │ Open                │   ★ MAPPING IS INSPECTABLE,   │ │
│ │ │ IN_PROGRESS      │ In progress         │     not buried in code        │ │
│ │ │ ON_HOLD          │ Blocked             │                              │ │
│ │ │ CLOSED           │ Closed              │                              │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌── SUPPORTED ACTIONS (+ required permission) ────────── <h2> ─────────────┐ │
│ ┌── RESILIENCE POLICY ────────────────────────────────── <h2> ─────────────┐ │
│ │ timeout 5000ms · action timeout 10000ms · retries 2 · backoff 250ms ×2.0 │ │
│ │ circuit 5 failures / 30000ms · probe interval 30s                        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌── HEALTH HISTORY (last 50 checks) ──────────────────── <h2> ─────────────┐ │
│ ┌── RECENT INTEGRATION ISSUES (last 20) ──────────────── <h2> ─────────────┐ │
│ ┌── PROVENANCE ───────────────────────────────────────── <h2> ─────────────┐ │
```

**Destructive actions** require a **typed confirmation of the display name plus a reason**, and state consequences explicitly with counts: *"This removes Investigation Management from navigation, the work queue, and health monitoring for all users. 12 work items will stop appearing. Audit records that mention Investigation Management are kept."*

| State | Copy |
|---|---|
| Not found | "We couldn't find that application. It may have been removed." |
| Invalid configuration | Warning: "This application's configuration has a problem: {field} — {reason}. It won't appear for users until it's fixed." |
| Confirmation mismatch | "The name you typed doesn't match. Type {displayName} exactly to confirm." |
| Missing reason | "Enter a reason for removing this application." |

---

### Screen: SCR-24 — System health

```
│ System health                                                   <h1>          │
│                                                                               │
│ ✓ Healthy 4      ! Degraded 0      ✕ Unavailable 1                            │
│                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ! Failure injection is active: IM → UNAVAILABLE, auto-clears in 4:12.    │ │
│ │   ↑ SO NO OPERATOR MISTAKES AN INJECTED OUTAGE FOR A REAL ONE.          │ │
│ │     [ Failure injection controls → ]  SCR-38                             │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ <caption>Application health — 5 applications, last checked 15:04 UTC</caption>│
│ ┌──────┬──────────┬───────────┬─────────┬──────┬──────┬─────────┬──────────┐ │
│ │ App  │ Status   │ Last OK   │ Last try│ p50  │ p95  │ Circuit │ Next     │ │
│ ├──────┼──────────┼───────────┼─────────┼──────┼──────┼─────────┼──────────┤ │
│ │▣eApp │✓ Healthy │ 15:04:02Z │15:04:02Z│ 38ms │ 61ms │ Closed  │ 15:04:32Z│ │
│ │▣ IM  │✕ Unavail │ 14:51:11Z │15:04:02Z│  —   │  —   │ OPEN    │ 15:04:32Z│ │
│ │      │          │ 26 consecutive failures      │         │[Check now]│ │
│ └──────┴──────────┴───────────┴─────────┴──────┴──────┴─────────┴──────────┘ │
│                                                                               │
│ ▸ What do these states mean?          ← usa-accordion disclosure with the     │
│   Healthy   — probe succeeded within timeout AND latency ≤ 1500ms             │
│   Degraded  — probe succeeded but slow, OR spoke self-reported degraded,      │
│                OR >20% error rate on the last 10 data calls                   │
│   Unavailable — probe failed, OR the circuit is open                          │
│   ↑ A REVIEWER IS NEVER GUESSING WHAT "DEGRADED" MEANS. (FR-F11-02 rule 4)   │
```

| State | Copy |
|---|---|
| No health data yet | "No health checks have run yet. The first check runs within {n} seconds." |
| **Monitor not running** | Warning: "Health monitoring isn't running. Statuses below may be out of date." — **an absent monitor must never masquerade as all-healthy** (US-125) |

**"Check now"** performs a **live probe bypassing cache and circuit** (an explicit operator action; blocking it would defeat its purpose), announced politely: "Connection test complete. Investigation Management couldn't be reached at http://im:8085."

---

### Screen: SCR-25 — Integration issues log

```
│ Integration issues                                              <h1>          │
│ 14 issues in the last 24 hours                                                │
│                                                                               │
│ Application [All ▾] Error class [All ▾] Operation [All ▾]                     │
│ From [2026-09-14] To [2026-09-15]   [ Apply ] [ Clear all filters ]           │
│ Active: [Last 24 hours ✕]                                                     │
│                                                                               │
│ <caption>Integration issues — 14 results, newest first</caption>              │
│ ┌───────────┬──────┬──────────────┬──────────────┬──────┬────────┬─────────┐ │
│ │Timestamp ▼│ App  │ Operation    │ Error class  │Affect│Attempt │Correlat.│ │
│ ├───────────┼──────┼──────────────┼──────────────┼──────┼────────┼─────────┤ │
│ │14:52:03Z  │▣ IM  │listWorkItems │TIMEOUT       │M.Vale│ 2 of 2 │01JD7K2Q→│ │
│ │           │      │              │circuit: OPEN │      │        │         │ │
│ │14:52:03Z  │▣ IM  │healthCheck   │CONN_REFUSED  │ —    │ 1 of 1 │01JD7K2R→│ │
│ └───────────┴──────┴──────────────┴──────────────┴──────┴────────┴─────────┘ │
│                                                                               │
│ Row expansion reveals the technical detail suppressed from user-facing        │
│ messages: spoke HTTP status · response excerpt (≤1000 chars, ESCAPED) ·       │
│ adapter requestId.  ★ THIS IS THE APPROPRIATE PLACE FOR THAT DETAIL,          │
│   AND THE ONLY PLACE IT APPEARS. (FR-F11-03 rule 3)                           │
│                                                                               │
│ Every row links to: [ audit chain → ] SCR-34   and   [ application → ] SCR-23 │
│ ★ Symptom to context in ONE click.                                            │
│                                                                               │
│ ⓘ Append-only. There is NO resolve/dismiss workflow, and the absence is       │
│   DELIBERATE — the log is EVIDENCE, not a ticket queue. (rule 5)              │
```

| State | Copy |
|---|---|
| No issues in range | **"No integration issues in this period. That's good news."** |
| `ORCHESTRATION_INCOMPLETE` row | Additionally links to the orchestration transaction **with its manual retry action** |
| Export too large | "Narrow your filters — exports are limited to 10,000 records." |

---

### Screens: SCR-26 / SCR-27 — Identities and roles

```
│ Identities & roles                                              <h1>          │
│ <caption>Synthetic identities — 14 identities</caption>                       │
│ │ Display name    │ Roles              │ Org         │ Tier │ Region │ Methods│
│ │ Marcus Vale     │ Investigator       │ FIELD-OPS-E │ T5   │ NE     │CAC/PIV,│
│ │   PER-01        │                    │             │      │        │MFA     │
│ │ Harlan T. Boyce │ Investigator       │ FIELD-OPS-E │ T3   │ NE     │CAC/PIV │
│ │ Ingrid L.       │ Investigator       │ FIELD-OPS-W │ T5   │ SW     │ECA     │
│ │   Vasterling    │   ◀── ECA-only: the pools are genuinely disjoint       │
│ │ Dana Okonkwo    │ Adjudicator        │ FIELD-OPS-E │ T5   │ NE     │CAC/PIV │
│ │   PER-02        │   ◀── ADJUDICATOR ONLY. She may VIEW ISS-2207 and may  │
│ │                 │       not RESOLVE it. (FR-F17-02 rule 4)               │
│ │ Sofia K.        │ Investigator,      │ FIELD-OPS-E │ T5   │ NE     │CAC/PIV,│
│ │   Mendelbaum    │ Adjudicator ◀──────│             │      │        │MFA     │
│ │                 │ the dual-role identity — exercises role switching      │
│ │ Renée Ashford   │ Applicant          │ —           │ —    │ —      │MFA,ECA │
│ │   PER-03        │                    │             │      │        │        │
│ │ Priya Raghunathan│ Administrator     │ DCSA-HQ     │ T5   │NATIONAL│CAC/PIV │
│ │   PER-04        │                    │             │      │        │        │
│ │ … 6 further supporting identities (FR-F17-01: 14 total)                  │

│ SCR-27 Identity detail: roles, all four attributes, allowed sign-in methods,  │
│ and the last 50 audit records for that identity, linked into SCR-33.          │
│ ★ Viewing identity data WRITES a USER_VIEWED audit record — reading identity  │
│   data is itself auditable. (FR-F02-08 AC-2)                                  │
```

Also on the console: a **read-only "Roles and permissions" matrix** rendering the full role × permission table as an accessible `usa-table`, **so a reviewer can inspect the policy rather than infer it from behaviour** (US-025, FR-F11-07 rule 1).

---

### Screen: SCR-29 — Announcement management

```
│ Announcements                                                   <h1>          │
│ 1 active · 0 scheduled · 3 expired          [ Create announcement ]           │
│                                                                               │
│ Form fields: title (5–120) · body (10–2000, PLAIN TEXT, escaped on render)   │
│ severity (Info / Warning / Emergency) · target roles (≥1) ·                   │
│ effective from · expires at · dismissible                                     │
│                                                                               │
│ ⚠ Changing the message will show it again to people who dismissed it.        │
│ ⚠ Emergency announcements are non-dismissible regardless of the setting —     │
│   and STILL never obscure or replace the demo banner. (FR-F11-06 rule 6)      │
│                                                                               │
│ Expire is a SOFT action (sets expiresAt = now). Announcements are never       │
│ hard-deleted, so the audit trail stays meaningful.                            │
```

| Validation | Message |
|---|---|
| `effectiveFrom ≥ expiresAt` | "Enter an end date and time that comes after the start." |
| No target roles | "Choose at least one role to show this to." |

---

### Screens: SCR-37 / SCR-38 — Demo operations and failure injection

**User Stories:** US-131, US-138, US-142, US-143, US-144 · **Features:** F18 (demo operability), F16 (failure injection), F17 (seed validation)

See `Flow-06-admin-issue-triage §Flow 6b` for the full SCR-38 wireframe and state set.

**SCR-37** presents service readiness at a glance: services running (6 of 6), seed-data validation result, active injections with countdowns, and links to the demo scripts and the reset command. It is the pre-demo confidence check (US-142, F18).

**SCR-38** lists every application with its current injection state, controls per mode, a "Clear all" action, and the prominent notice: *"Failure injection is a demonstration tool. Injected states affect all users of this environment."*

---

### Console-wide states

| State | Treatment |
|---|---|
| **Loading** | Per-region skeletons preserving layout, `aria-busy`, completion announced once |
| **Empty** | Designed content per screen (copy above) — never a blank table |
| **Error** | In-region `usa-alert--error` + correlation ID + `[Try again]`; never replaces the page |
| **Degraded** | Health-derived; named and quantified; `role="status"`, announced once |
| **Denied** | → SCR-30 "You don't have access to this page." Audited |
| **Success** | `usa-alert--success`, focus moved, naming exactly what changed |

### Accessibility notes — console-wide

- **Heading hierarchy:** `<h1>` per console screen naming that screen ("System health", "Integration issues") → `<h2>` per region → `<h3>` per expandable subsection. Gap-free.
- **Landmarks:** the sidenav is `<nav aria-label="Administrator console">`, **distinct** from `<nav aria-label="Primary">` — two navs on a page require distinct labels.
- **Current page** in the sidenav: `aria-current="page"` plus a visible non-colour indicator (weight + left rule).
- **All console tables** use the identical caption / `scope="col"` / `scope="row"` / sortable-`<button>`-with-`aria-sort` / `usa-pagination` pattern as the work queue, **so the interaction is learned once** (US-092, FR-F11-07 rule 2).
- **Result counts announced** politely on every filter, sort, or page change.
- **Health and circuit states are text + distinct icon shape**, never a coloured dot. The console survives a grayscale rendering with all status meaning intact.
- **Latency and timestamps are text**, so staleness is legible non-visually.
- **State definitions** live behind an accessible `usa-accordion` disclosure, **not a hover tooltip** — no content requires hover to be discoverable.
- **Correlation IDs** are monospace and selectable with a copy control ("Reference copied" announced politely) and a link whose accessible name is "View the full audit chain for this action."
- **Live probe results** announced once, politely; never a silent spinner.
- **Destructive confirmations** use `usa-modal` — focus trapped, Escape closes, focus restored to the invoking control; the typed-name field is labelled with a specific mismatch error.
- **Failure-injection radio groups** sit in a `<fieldset>` with a `<legend>` naming the application, so a screen-reader user knows which application a group controls without inferring it from table position.
- **Countdowns** update silently and announce only on expiry — never per-second.
- **Target sizes** ≥44×44 px for all row actions, sort buttons, and pagination controls.
- **320px reflow:** the sidenav collapses into the primary menu button and remains fully reachable; console tables reflow to stacked cards retaining caption and row-header semantics (see `Y1-responsive`). No page-level horizontal scroll.

### Acceptance

- Inducing an adapter failure produces a **correctly attributed entry within one health-check interval** (F11 acceptance signal).
- Each entry links to a **real audit chain** sharing its correlation ID.
- **Every console mutation produces an audit record naming the administrator** (US-093).
- An Investigator attempting any console route is **denied and audited** (US-020).
- The role matrix view **matches the enforced policy**, verified against `role_permissions`.
- All console tables pass the accessibility scan.

---
