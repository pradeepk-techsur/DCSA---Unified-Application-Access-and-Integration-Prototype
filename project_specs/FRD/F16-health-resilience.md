## F16 — Health Monitoring, Resilience, and Degraded-System Experience

**Traces to:** PRD F16 (P1); NFR-09, NFR-10, SM-15, SM-16, SM-17, R-13. **Screens:** SCR-24 health, SCR-25 issues, SCR-32 error boundary, SCR-38 failure injection; degraded states on every data screen. **API:** `Y1a §Health`, `§Admin — operations`.

**Description:** Background health checking of every registered application, plus the complete set of resilience behaviors and UX states that keep the prototype usable when a spoke misbehaves. The requirement is explicit and absolute: adapter failure degrades visibly and gracefully. Never a blank page, never an unhandled error, never a silent omission.

**Terminology:**
- **Probe** — one `healthCheck()` call against one application.
- **Health state** — `HEALTHY`, `DEGRADED`, or `DOWN`, defined precisely in `FR-F16-03`.
- **Degraded experience** — the UI mode in which some data is missing and the gap is named and quantified.
- **Failure injection** — administrator-triggered forcing of a spoke into an abnormal state for demonstration.

---

### FR-F16-01 — Health monitor service

**Processing / business rules:**
1. A background monitor probes every **enabled** registry application on its configured `healthProbeIntervalSec` (default 30 s).
2. Probes are concurrent across applications and never block user requests. A user request never waits on a probe.
3. Each probe uses `healthTimeoutMs`, performs **no retries**, and **bypasses the circuit breaker** — this is how recovery is detected while the circuit is open (`FR-F08a-05` rule 5).
4. Each probe result is stored in `Y0a.application_health_checks` `{ applicationId, checkedAt, status, latencyMs, errorClass, detail }`, and the current state is upserted into `Y0a.application_health`.
5. History is retained for the last 500 checks per application, sufficient for the console's history view and for the demo.
6. Probing starts immediately on registration or re-enable rather than waiting for the next interval (`FR-F12-05`, `FR-F08b-03`).
7. If the monitor itself is not running, the console shows a warning (`FR-F11-02`) — an absent monitor must not masquerade as all-healthy.

**Acceptance criteria:**
- AC-1: Stopping a spoke moves it to `DOWN` within one interval plus timeout.
- AC-2: Restarting it returns `HEALTHY` within one interval, with no user action (SM-17).
- AC-3: Probing continues while a circuit is open.

---

### FR-F16-02 — Health summary endpoint

**Processing / business rules:**
1. `GET /api/health/summary` returns, for every application the principal may see: `{ applicationId, displayName, status, lastCheckedAt, latencyMs, circuitState, message }`.
2. It reads stored results; it never probes synchronously, so it is fast and safe to poll.
3. It is authenticated but available to all roles, because every role's UI needs to know when to clear a degraded notice.
4. For non-administrators the response omits `circuitState` and technical `errorClass`, carrying only the user-appropriate `message`.
5. Clients poll it every 30 seconds while a degraded notice is displayed, and on window refocus.

**Acceptance criteria:**
- AC-1: Polling reflects a state change within one client poll after the monitor records it.
- AC-2: Non-administrators receive no technical detail.

---

### FR-F16-03 — Health state definitions

**Description:** Precise definitions, because "degraded" is meaningless if it is not defined.

| State | Definition | UI consequence |
|---|---|---|
| `HEALTHY` | Probe succeeded within `healthTimeoutMs` **and** `latencyMs <= degradedLatencyThresholdMs` (default 1500) **and** the spoke reported `status: HEALTHY` | Normal operation; no notice |
| `DEGRADED` | Probe succeeded but `latencyMs > degradedLatencyThresholdMs`, **or** the spoke self-reported `DEGRADED`, **or** the last 10 data calls show an error rate >20% while probes still pass | Data still loads; rows show "Slow to respond"; a non-blocking notice names the system; actions remain enabled but warn |
| `DOWN` | Probe failed (timeout, connection refused, non-2xx, malformed), **or** the circuit is `OPEN` | Data omitted for that source; degraded warning names the system and quantifies the gap; actions targeting it are disabled with a reason |

**Additional rules:**
1. Transitions require confirmation to avoid flapping: `HEALTHY → DOWN` requires 2 consecutive failed probes; `DOWN → HEALTHY` requires 1 successful probe (fast recovery, cautious failure — the asymmetry is deliberate, since a false "back up" is less harmful than a flapping banner).
2. Every transition writes an `integration_issues` row and is visible in the console health history.
3. State definitions are documented in the UI behind a "What do these states mean?" disclosure (`FR-F11-02`).

**Acceptance criteria:**
- AC-1: Each state is reachable via failure injection and produces its specified UI consequence.
- AC-2: A single transient failure does not flip a healthy system to `DOWN`.

---

### FR-F16-04 — Pre-emptive action disabling

**Processing / business rules:**
1. When an action's `targetSystems` includes an application in `DOWN`, the action is returned `enabled: false` with `disabledReason`: "{System} isn't responding right now. Try again when it's back." (`FR-F06-03`).
2. Orchestrated actions are disabled if **any** target system is `DOWN`, with the reason naming which: "eApp isn't responding right now, so this issue can't be resolved yet." Half-performing a dual write when we already know it will fail is worse than declining it (`FR-F07b-01` step 4).
3. `DEGRADED` systems do **not** disable actions; instead a warning is shown: "{System} is responding slowly. This may take longer than usual."
4. Disabled state is recomputed on health poll; recovery re-enables controls without a reload, announced politely: "eApp is available again. You can now resolve this issue."

**Acceptance criteria:**
- AC-1: With eApp down, the resolve action on SCR-16 is disabled with the specified reason.
- AC-2: Restoring eApp re-enables it within one poll without a reload.

---

### FR-F16-05 — Degraded-system warning presentation

**Processing / business rules:**
1. Wherever incomplete data is shown, a USWDS warning site-alert with `role="status"` names the affected application and quantifies what is missing:
   **"Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date."**
2. When the omitted count is unknown (no prior successful count), the copy omits the number rather than guessing: "Investigation Management is unavailable — some items are not shown."
3. Multiple affected systems are listed in one alert, each named and quantified — not a generic "some systems are unavailable."
4. The alert appears on: work queue, dashboard, search results, notifications, and related-items panels. It is per-screen and contextual, not a single global banner, so the user learns what is missing *here*.
5. The alert is announced once on first appearance via `role="status"` and is not re-announced on every poll.
6. Row-level `sourceHealth` badges mark items from `DEGRADED` sources with "Slow to respond."
7. On recovery, the alert is replaced by a polite announcement with a refresh control (`FR-F05-05` rule 6) rather than silently reordering content.

**Acceptance criteria:**
- AC-1: Degraded state is always visible and specific — the application is named and the gap quantified (NFR-10).
- AC-2: No screen silently omits data from a failed source.

---

### FR-F16-06 — Loading states

**Processing / business rules:**
1. Skeleton or spinner treatments at widget and section granularity, never whole-page blanking, so a slow source does not blank the page.
2. The loading region carries `aria-busy="true"` and a visually hidden "Loading {region name}" label; completion is announced once.
3. Skeletons preserve layout dimensions to prevent content shift when data arrives.
4. A region still loading after its configured timeout transitions to its error or degraded state — it never spins indefinitely.
5. Reduced-motion preference disables skeleton shimmer (`FR-F14-08`).

**Acceptance criteria:**
- AC-1: A forced-slow spoke produces a per-widget loading state, not a blank page.
- AC-2: No spinner persists past its timeout.

---

### FR-F16-07 — Empty states

**Processing / business rules:**
1. Every list, table, and widget has a designed empty state with a heading, an explanation of what would appear there, and an action where one exists.
2. Empty states are distinguished from degraded states: "You have no assigned work" is different from "We couldn't load your work." Conflating them would tell a user they have nothing to do when in fact the system is broken — the single most consequential empty-state error, and explicitly prohibited.
3. Empty-state copy is specified per screen in the owning requirement and consolidated in `Y2 §Empty state copy`.
4. The zero-item applicant persona (`FR-F17-06`) exists so empty states are demonstrable rather than theoretical.

**Acceptance criteria:**
- AC-1: Every list and widget has an implemented, designed empty state.
- AC-2: Empty and degraded states are never conflated, verified by test with a forced outage.

---

### FR-F16-08 — Error states

**Processing / business rules:**
1. Four distinct, recoverable presentations (`FR-F06-07`): authorization denial, validation failure, source unavailability, unexpected error.
2. Each carries a heading, plain-language explanation, a correlation ID, and at least one concrete next action.
3. Error copy never contains a stack trace, exception name, hostname, port, SQL, or spoke-internal identifier (`FR-F08a-06` rule 3).
4. Errors within a region (widget, panel) render inline and do not replace the page; errors at page scope render SCR-30/31/32 inside the shell.
5. Every error state includes a working exit: dashboard, work queue, or retry.

**Acceptance criteria:**
- AC-1: All four classes are reachable and render their designed states.
- AC-2: Automated scan finds zero prohibited content in error copy.

---

### FR-F16-09 — Integration issue recording

**Processing / business rules:**
1. Every `AdapterError` (except `ADAPTER_NOT_FOUND` and `ADAPTER_REJECTED`, which are business outcomes) writes one `integration_issues` row: `{ occurredAt, applicationId, operation, errorClass, spokeHttpStatus, responseExcerpt (≤1000 chars, escaped), attempt, circuitStateAtFailure, principalId, correlationId, adapterRequestId }`.
2. Health state transitions, circuit transitions, scope violations, normalization errors, orchestration incompletions, and audit-write failures also produce rows with their own classes.
3. Rows are append-only and surfaced on SCR-25 (`FR-F11-03`).
4. Recording an issue never blocks the user request; issue writing is best-effort and failures are logged, with the deliberate exception of audit writes, which are blocking (`FR-F13-01`).
5. Issues are correlated to audit records by `correlationId`, enabling navigation between them.

**Acceptance criteria:**
- AC-1: Each induced failure produces exactly one correctly attributed issue within one health-check interval (PRD F11 acceptance signal).
- AC-2: Issues link to audit chains sharing the correlation ID.

---

### FR-F16-10 — Global error boundary (SCR-32)

**Processing / business rules:**
1. A global boundary catches any unhandled client-side condition and renders SCR-32 **inside the shell**: heading "Something went wrong," plain explanation, correlation ID, and actions "Try again," "Go to my dashboard."
2. Server-side, any uncaught exception returns 500 with the standard envelope; no framework default error page is ever served.
3. SCR-32 carries the demo banner, sets a descriptive title, moves focus to the `<h1>`, and announces via `role="alert"`.
4. The boundary never produces a blank page, a raw stack trace, or a browser default error (NFR-09).
5. Errors caught by the boundary are reported to the server with their correlation ID so they appear in the integration log.

**Acceptance criteria:**
- AC-1: A deliberately thrown client error renders SCR-32 with working exits.
- AC-2: No route can produce a blank page or a stack trace, verified by fault-injection crawl.

---

### FR-F16-11 — Failure injection controls (SCR-38)

**Description:** Administrator-only, demo-scoped controls making degradation reproducible on demand rather than described.

**Inputs:** `POST /api/admin/failure-injection` with `{ applicationId, mode: NORMAL | UNAVAILABLE | SLOW | ERROR, slowMs?, errorRatePct?, durationSec? }`.

**Processing / business rules:**
1. Administrator-only (`ADMIN.FAILURE_INJECTION.*`), authorized and audited (`FAILURE_INJECTED`, `FAILURE_CLEARED`).
2. The hub forwards the setting to the target spoke's injection endpoint; the spoke honours it on its data endpoints and reflects it honestly at `/health` (`FR-F09-07` rule 7).
3. Modes:
   - `UNAVAILABLE` — connection refused or 503 on data endpoints
   - `SLOW(slowMs)` — artificial latency, used to demonstrate timeouts and `DEGRADED`
   - `ERROR(errorRatePct)` — a proportion of calls return 500
   - `NORMAL` — clears injection
4. `durationSec` auto-clears after the interval (default 300, max 1800), so a forgotten injection cannot silently break a later demo.
5. SCR-38 lists every application with its current injection state, controls to set each mode, a "Clear all" action, and a prominent notice: "Failure injection is a demonstration tool. Injected states affect all users of this environment."
6. Active injection is surfaced on SCR-24 and SCR-37 so no operator mistakes an injected outage for a real one.
7. Injection state is cleared by the reset command (`FR-F17-11`).

**Validation rules:** `slowMs` 100–30000; `errorRatePct` 1–100; `durationSec` 10–1800; `applicationId` must exist and be enabled.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Spoke will not accept injection | 502 | `INJECTION_FAILED` | "We couldn't change {name}'s simulated state. Check that it's running." |
| Invalid parameters | 400 | `VALIDATION_FAILED` | Field copy per bounds above. |

**Acceptance criteria:**
- AC-1: Forcing IM `UNAVAILABLE` produces the degraded queue, the dashboard notice, and the disabled actions — with no error page anywhere (SM-15).
- AC-2: Clearing injection restores normal behavior automatically (SM-17).
- AC-3: Every injection change is audited.

---

### FR-F16-12 — Automatic recovery

**Processing / business rules:**
1. When a spoke returns, the monitor detects it on the next probe, the circuit half-opens and closes on a successful probe, and the stored state becomes `HEALTHY`.
2. Client polling detects the change within 30 seconds, clears the degraded notice, re-enables affected actions, and announces politely with a refresh control.
3. Recovery requires **no user reload, no re-authentication, and no administrator action** (SM-17).
4. In-flight requests that failed during the outage are not auto-replayed — replaying a failed mutation without user knowledge would be unsafe. Reads may be re-fetched by the user's refresh action.
5. Partially completed orchestrations converge via their own retry queue (`FR-F07b-03`), independently of health polling.

**Acceptance criteria:**
- AC-1: Restoring a spoke clears the warning and restores data without reload or re-authentication (SM-17).
- AC-2: No failed mutation is silently replayed.

---
