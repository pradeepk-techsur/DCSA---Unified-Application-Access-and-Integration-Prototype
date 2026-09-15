### Flow 6: Administrator — triage an integration failure, and rehearse degradation on purpose

Two administrator flows sharing the console. 6a is **accountability** (demo Segment 6); 6b is the **driver** for the resilience demonstration (Segment 2b).

**User Stories:** US-086, US-087, US-088, US-089, US-090, US-093, US-103, US-104, US-105, US-106, US-125, US-131, US-143
**Features:** F11 (console), F13 (audit), F16 (health, failure injection)
**Persona:** PER-04 Priya Raghunathan (Administrator)

---

#### Flow 6a: Health view → integration issue → correlation ID → audit chain → contain

**Trigger:** A user reports "my queue looks short," or the administrator sees an unhealthy application on the dashboard.
**Journey:** JRN-04.02 · Demo path: Segment 6 — **accountability**

```
[SCR-12 Administrator dashboard]
   │  "System health"        ✓ 4 healthy  ! 0 degraded  ✕ 1 unavailable
   │  "Integration issues (24h)"   14 · by error class
   ▼
[SCR-24 System health]
   │  ┌──────────────┬──────────┬───────────┬─────────┬──────────┬────────┐
   │  │ Application  │ Status   │ Last OK   │ Latency │ Failures │Circuit │
   │  ├──────────────┼──────────┼───────────┼─────────┼──────────┼────────┤
   │  │ ▣ eApp       │ ✓Healthy │ 15:04:02Z │ 38 ms   │ 0        │ Closed │
   │  │ ▣ IM         │ ✕Unavail │ 14:51:11Z │ —       │ 26       │ OPEN   │
   │  └──────────────┴──────────┴───────────┴─────────┴──────────┴────────┘
   │  [?] What do these states mean?  ← usa-accordion disclosure with the
   │                                    PRECISE definitions — a reviewer is
   │                                    never guessing what "degraded" means
   │  [ Check now ] per row → live probe, bypasses cache AND circuit
   ▼  row link
[SCR-25 Integration issues]
   │  default filter: last 24 hours, newest first
   │  "14 issues in the last 24 hours."
   │  ┌───────────┬──────┬───────────────┬──────────────┬─────────────────┐
   │  │ Timestamp │ App  │ Operation     │ Error class  │ Correlation ID  │
   │  ├───────────┼──────┼───────────────┼──────────────┼─────────────────┤
   │  │ 14:52:03Z │ ▣ IM │ listWorkItems │ TIMEOUT      │ 01JD7K2Q… →     │
   │  │ 14:52:03Z │ ▣ IM │ healthCheck   │ CONN_REFUSED │ 01JD7K2R… →     │
   │  └───────────┴──────┴───────────────┴──────────────┴─────────────────┘
   │   ↑ THIS is where technical detail lives — spoke HTTP status, escaped
   │     response excerpt (≤1000 chars), adapter requestId. The ONLY place
   │     it appears; it is suppressed from every user-facing message.
   │   ↑ Append-only. NO resolve/dismiss workflow — the log is EVIDENCE,
   │     not a ticket queue. The absence is deliberate.
   ▼  correlation ID link
[SCR-34 Audit record detail & chain view]
   │  ┌─────────────────────────────────────────────────────────────┐
   │  │ "Investigator Marcus Vale opened work item IM-3310 on        │
   │  │  2026-09-15. Investigation Management did not respond."      │
   │  │  1  WORK_ITEM_VIEWED       ▣ IM    FAILURE   +0ms            │
   │  │  2  ADAPTER_FAILURE        ▣ IM    FAILURE   +5002ms         │
   │  │  3  WORK_ITEM_VIEWED       HUB     SUCCESS   +5010ms         │
   │  │     (degraded state rendered)                                │
   │  └─────────────────────────────────────────────────────────────┘
   │  Links out: → affected work item  → application detail (SCR-23)
   │             → the integration issue sharing this correlation ID
   │
   │  ╔═══ ADMINISTRATORS ARE NOT EXEMPT ═══════════════════════════╗
   │  ║ Filter the audit viewer by actor = Priya Raghunathan and    ║
   │  ║ her OWN actions are there: FAILURE_INJECTED, APPLICATION_   ║
   │  ║ PROBED, AUDIT_VIEWED. Viewing the audit trail itself writes ║
   │  ║ an AUDIT_VIEWED record. The trail audits its own reading.   ║
   │  ╚═════════════════════════════════════════════════════════════╝
   ▼
[SCR-23 Application detail — IM]  ── contain
   │  Configuration · Capabilities · Status maps · Resilience policy ·
   │  Health history · Recent integration issues (20) · Provenance
   │  [ Test connection ]  [ Edit configuration ]  [ Disable ]
   │
   └── [ Disable ] ──▶ typed-name confirmation + reason
          "This removes Investigation Management from navigation, the
           work queue, and health monitoring for all users.
           12 work items will stop appearing."
          → change audited, reflected in user-facing nav within one poll
```

| # | Step | Screen | Design obligation |
|---|---|---|---|
| 1 | See health at a glance | SCR-12 / SCR-24 | Status is **text + icon**, never a red/green dot. Last-check timestamp shown so **staleness is visible** |
| 2 | Find the failures | SCR-25 | Every row links to its audit chain **and** its application detail — symptom to context in one click |
| 3 | Follow one correlation ID | SCR-34 | One ID resolves the entire cross-system chain, including elapsed time between steps |
| 4 | Confirm the platform is honest about itself | SCR-33 filtered | Administrator's own actions are in the trail |
| 5 | Contain | SCR-23 | Destructive actions require typed confirmation + reason, and **state their consequences with counts** |

**Failure and alternate paths**

| Condition | What she sees | Recovery |
|---|---|---|
| Health monitor itself not running | Warning alert on SCR-24: "Health monitoring isn't running. Statuses below may be out of date." — **an absent monitor must never masquerade as all-healthy** | Restart the monitor |
| No health data yet | "No health checks have run yet. The first check runs within {n} seconds." | Wait one interval |
| No issues in range | "No integration issues in this period. That's good news." | — |
| Application config invalid | Warning on SCR-23: "This application's configuration has a problem: {field} — {reason}. It won't appear for users until it's fixed." | Edit configuration |
| `ORCHESTRATION_INCOMPLETE` issue | Row links to the orchestration transaction **with a working manual retry** | Retry the outstanding leg |
| Audit integrity check fails | Error alert on SCR-33 naming the **first broken sequence number**: "Records may have been altered outside the application." | Escalate — this is the tamper-evidence working |
| Attempt to modify an audit record | 405: "Audit records can't be changed or deleted." No such endpoint exists | — |

---

#### Flow 6b: Rehearse degradation on purpose

**Trigger:** Demo rehearsal, or the live Segment 2 demonstration.
**Journey:** JRN-04.03 · Demo path: ✅ Segment 2b — **drives Flow 2b in the other window**

```
[SCR-37 Demo operations / service status]
   │  service readiness at a glance · reset command · demo-script links
   ▼
[SCR-38 Failure injection controls]
   │
   │  ┌──────────────────────────────────────────────────────────────┐
   │  │ ! Failure injection is a demonstration tool. Injected states │
   │  │   affect all users of this environment.                      │
   │  │                          usa-site-alert--warning, PROMINENT  │
   │  └──────────────────────────────────────────────────────────────┘
   │
   │  ┌──────────┬──────────────┬────────────────────────────────────┐
   │  │ App      │ Current      │ Set mode                           │
   │  ├──────────┼──────────────┼────────────────────────────────────┤
   │  │ ▣ eApp   │ Normal       │ (•)Normal ( )Unavail ( )Slow ( )Err│
   │  │ ▣ PVQ    │ Normal       │ (•)Normal ( )Unavail ( )Slow ( )Err│
   │  │ ▣ IM     │ ✕ Unavailable│ ( )Normal (•)Unavail ( )Slow ( )Err│
   │  │          │ auto-clears  │  duration [ 300 ] sec (10–1800)    │
   │  │          │ in 4:12      │                                    │
   │  └──────────┴──────────────┴────────────────────────────────────┘
   │  [ Clear all ]
   │
   │  Modes:  Unavailable → conn refused / 503 on data endpoints
   │          Slow(ms)    → artificial latency → demonstrates DEGRADED
   │          Error(%)    → proportion of calls return 500
   │          Normal      → clears injection
   │
   │  durationSec AUTO-CLEARS (default 300, max 1800), so a forgotten
   │  injection cannot silently break a later demo.
   ▼
   Active injection is surfaced on SCR-24 AND SCR-37, so no operator
   mistakes an INJECTED outage for a REAL one.
   Every change is audited: FAILURE_INJECTED / FAILURE_CLEARED.
   │
   ▼  ┌──────────────────────────────────────────────────────────┐
      │ OTHER WINDOW: Flow 2b — the investigator observes.        │
      │ Degradation named + quantified within one health interval.│
      │ Recovery on [Clear all] — no reload, no re-auth.          │
      └──────────────────────────────────────────────────────────┘
```

**Failure and alternate paths**

| Condition | What she sees | Recovery |
|---|---|---|
| Spoke won't accept injection | "We couldn't change {name}'s simulated state. Check that it's running." | Start the spoke |
| Out-of-bounds parameter | Field error per bounds (`slowMs` 100–30000, `errorRatePct` 1–100, `durationSec` 10–1800) | Correct the value |
| Injection forgotten | Auto-clears after `durationSec`; countdown visible in the table | Automatic |
| Reset command run | All injection state cleared; CVS returned to unregistered | Demo repeats identically (SM-22) |

#### Exit criteria (both flows)

- Inducing an adapter failure produces a **new, correctly attributed entry** in the integration log within one health-check interval (F11 acceptance signal).
- Each entry links to a **real audit chain** sharing its correlation ID.
- Forcing IM `UNAVAILABLE` produces the degraded queue, the dashboard notice, and disabled actions — **with no error page anywhere** (SM-15).
- Clearing injection restores normal behaviour **automatically** (SM-17).
- **Every** console action is authorized and audited — the console has no privileged bypass (US-093).
- An Investigator attempting any console route is **denied and audited** (US-020).

#### Accessibility notes

- **Console shell:** `ConsolePage` template — `usa-sidenav` sub-navigation with `aria-current="page"` plus a visible non-colour indicator; `<nav aria-label="Administrator console">` distinct from `<nav aria-label="Primary">`.
- **Heading hierarchy:** `<h1>` per console screen ("System health", "Integration issues") → `<h2>` per region → `<h3>` per expandable detail.
- **Health status:** text + distinct icon shape (`check_circle` / `warning` / `cancel`). A grayscale rendering retains all meaning. **Never a coloured dot.**
- **All console tables** use the same caption / `scope` / sortable-header / pagination pattern as the work queue, so the interaction is **learned once** (US-092).
- **Circuit state** (`Closed` / `Open` / `Half-open`) is text, with the state definitions available behind an accessible `usa-accordion` disclosure rather than a hover tooltip.
- **Correlation ID** rendered monospace and selectable with a copy control announcing "Reference copied," and linked to the chain view with the accessible name "View the full audit chain for this action."
- **Live probe results** ("Check now", "Test connection") announced politely once: "Connection test complete. {System} is healthy, responded in {n} milliseconds." Never a silent spinner.
- **Failure-injection radios** are grouped in a `<fieldset>` with a `<legend>` naming the application — so a screen-reader user knows which application a radio group controls without inferring it from table position.
- **Auto-clear countdown** is rendered as text and is **not** a per-second live region; it updates silently and is announced only on expiry.
- **Destructive confirmations** (Disable, De-register) trap focus, require typed confirmation, state consequences with counts, and restore focus on close.
- **320px:** console tables reflow to stacked cards per the `Y1-responsive` table-reflow pattern; the sidenav collapses into the primary menu button and remains fully reachable.

---
