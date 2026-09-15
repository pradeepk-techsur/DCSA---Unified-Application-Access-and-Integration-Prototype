## F11 — Administrator Console: Connected Applications, Health, and Integration Issues

**Traces to:** PRD F11 (P1). **Screens:** SCR-22 connected applications, SCR-23 application detail, SCR-24 system health, SCR-25 integration issues, SCR-26/27 identities, SCR-29 announcements. **API:** `Y1a §Admin`.

**Description:** The administrator's operational view of the unified layer: what is connected, whether it is working, and what has gone wrong. This is the feature that demonstrates the platform is operable, not merely usable. Every console screen is a real, populated screen with designed empty, loading, error, and degraded states, and every console action is itself authorized and audited — administrators are not exempt.

**Terminology:**
- **Inventory** — the registry rendered for humans.
- **Integration issue** — a recorded adapter or orchestration failure (`Y0a.integration_issues`).
- **Probe** — an on-demand health check initiated by an administrator.

---

### FR-F11-01 — Connected applications inventory (SCR-22)

**Description:** Every registered application, read directly from the registry.

**Inputs:** `GET /api/admin/applications` with `page`, `pageSize`, `sort`, `dir`, `q`, `status` (`enabled|disabled|invalid|incompatible`).

**Processing / business rules:**
1. Accessible only with `ADMIN.APP.LIST`; the whole console is behind the Administrator role gate plus per-endpoint authorization.
2. Table columns: Display name, Application ID, Adapter type, Endpoint, Work-item types (count, expandable), Supported actions (count), Visible to roles, Health (text + icon), Enabled state, Registered date. `<caption>`: "Connected applications — {n} registered".
3. Sortable on display name, application ID, health, enabled state, registered date. Filterable by status and searchable by name or ID.
4. Health is read from stored monitor results (`FR-F16-02`), with the last-check timestamp shown so staleness is visible.
5. Disabled and invalid applications are listed with their state clearly marked — they are never hidden, because an administrator troubleshooting an absence needs to see the row.
6. Primary action: "Register an application" → SCR-28. Row action: "View details" → SCR-23.
7. The list refreshes health every 30 seconds via `GET /api/health/summary` and announces changes politely ("Investigation Management is now unavailable.").

**Outputs:** SCR-22 populated from the registry.

**Validation rules:** Standard list conventions (`FR-F10-04`).

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Not an administrator | 403 | `AUTHZ_DENIED` | "You don't have access to this page." |
| Registry unreadable | 503 | `REGISTRY_UNAVAILABLE` | "We can't load the application list right now. Try again in a moment — reference {correlationId}." |
| No applications registered | 200 | — | "No applications are registered yet. Register your first application to get started." with the register action. |
| No search matches | 200 | — | "No applications match '{q}'." with a clear-search control. |

**Acceptance criteria:**
- AC-1: All five spokes appear with correct configuration read from the registry.
- AC-2: The newly registered sixth application appears immediately after registration without a restart (SM-12).
- AC-3: Table passes the accessibility scan.

---

### FR-F11-02 — System health view (SCR-24)

**Description:** Per-application health, latency, and check history.

**Inputs:** `GET /api/admin/health?applicationId=&since=`.

**Processing / business rules:**
1. Summary region: counts of healthy / degraded / unavailable, each as text plus icon.
2. Table per application: current status, last successful check, last check attempt, current latency, rolling p50/p95 latency over the last hour, consecutive failure count, circuit state (`CLOSED | OPEN | HALF_OPEN`), next scheduled probe.
3. Check history: the last 50 checks per application with timestamp, status, latency, and error class where applicable, available as an expandable region and as a table on SCR-23.
4. Health states are defined precisely (`FR-F16-03`) and displayed with their definitions available via a "What do these states mean?" disclosure — so a reviewer is not guessing what "degraded" means.
5. Manual "Check now" per row triggers `POST /api/admin/applications/{id}/probe` (`FR-F11-05`).
6. Status is never conveyed by color alone; each state has a distinct icon and text label.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| No health data yet | 200 | — | "No health checks have run yet. The first check runs within {n} seconds." |
| Monitor not running | 200 | — | Warning alert: "Health monitoring isn't running. Statuses below may be out of date." |

**Acceptance criteria:**
- AC-1: Stopping a spoke moves it to `DOWN` within one probe interval and shows the circuit opening.
- AC-2: Restarting it returns `HEALTHY` and closes the circuit automatically (SM-17).

---

### FR-F11-03 — Integration issues log (SCR-25)

**Description:** The chronological, filterable record of adapter and orchestration failures.

**Inputs:** `GET /api/admin/integration-issues` with `applicationId`, `errorClass`, `operation`, `principalId`, `from`, `to`, `q`, plus list conventions.

**Processing / business rules:**
1. Columns: Timestamp (UTC), Application, Operation, Error class, Affected user (where applicable), Correlation ID, Attempt, Circuit state at time of failure.
2. Every row links to: the correlated audit chain (SCR-34) and the application detail (SCR-23). An administrator can move from symptom to context in one click.
3. Rows capture the technical detail suppressed from user-facing messages (`FR-F08a-06` rule 3): spoke HTTP status, response excerpt (truncated to 1000 chars, escaped), and the adapter `requestId`. This is the appropriate place for that detail, and the only place it appears.
4. Default filter: last 24 hours, newest first. A prominent count shows "{n} issues in the last 24 hours."
5. Issues are append-only; there is no resolve/dismiss workflow in this prototype, and the absence is deliberate — the log is evidence, not a ticket queue.
6. `ORCHESTRATION_INCOMPLETE` issues (`FR-F07b-03`) additionally link to the orchestration transaction with its manual retry action.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| No issues in range | 200 | — | "No integration issues in this period. That's good news." |
| Export failure | 500 | `INTERNAL_ERROR` | "We couldn't build that export. Try again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Inducing an adapter failure produces a new, correctly attributed entry within one health-check interval (PRD F11 acceptance signal).
- AC-2: Each entry links to a real audit chain sharing its correlation ID.
- AC-3: An `ORCHESTRATION_INCOMPLETE` entry offers a working retry.

---

### FR-F11-04 — Application detail view (SCR-23)

**Description:** Everything about one application in one place.

**Inputs:** `GET /api/admin/applications/{applicationId}`.

**Processing / business rules:**
1. Sections: Configuration (all registry fields, with `applicationId` marked immutable); Capabilities (from cached `describe()`, with `lastDescribeAt`); Work-item types and status maps (as a table, so mapping is inspectable); Supported actions with required permissions; Resilience policy (timeouts, retries, circuit settings); Health history; Recent integration issues (last 20); Provenance (registered by/at, updated by/at).
2. Actions: "Test connection" (`FR-F11-05`), "Edit configuration" (→ SCR-28 in edit mode), "Disable"/"Enable" (`FR-F08b-03`), "De-register" (`FR-F12-07`).
3. Destructive actions require a typed confirmation of the application's display name plus a reason, and state their consequences explicitly: "This removes {name} from navigation, the work queue, and health monitoring for all users. {n} work items will stop appearing."
4. The configuration section renders secrets-free; the registry holds no credentials in this prototype, and the screen says so: "This prototype uses no credentials for spoke connections."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Application not found | 404 | `APPLICATION_NOT_FOUND` | "We couldn't find that application. It may have been removed." |
| Invalid configuration row | 200 | — | Warning: "This application's configuration has a problem: {field} — {reason}. It won't appear for users until it's fixed." |

**Acceptance criteria:**
- AC-1: Every registry field is visible and accurate on this screen.
- AC-2: Destructive actions require typed confirmation and a reason.

---

### FR-F11-05 — Manual connection test

**Description:** An on-demand live probe an administrator can run in front of a reviewer.

**Inputs:** `POST /api/admin/applications/{applicationId}/probe`.

**Processing / business rules:**
1. Calls `healthCheck()` and `describe()` live, bypassing cached results and bypassing the circuit breaker (this is an explicit operator action, and blocking it would defeat its purpose).
2. Returns `{ health: {...}, describe: {...} | null, contractVersionSupported: boolean, capabilityChanges: [...], durationMs }`.
3. `capabilityChanges` diffs the live `describe()` against the cached one and lists additions and removals, so drift is visible: "This application now reports 1 new action: REQUEST_EXTENSION."
4. On success, cached capabilities and health are updated, and `registryVersion` is bumped if capabilities changed.
5. The action is audited (`APPLICATION_PROBED`) with the outcome.
6. Results render inline with a live-region announcement: "Connection test complete. {System} is healthy, responded in {n} milliseconds."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Unreachable | 200 | — | "We couldn't reach {name} at {endpoint}. Check that the application is running and the address is correct." |
| Contract unsupported | 200 | — | "{name} uses an integration version we don't support yet (version {v}). Supported versions: {list}." |
| Health degraded | 200 | — | "{name} responded, but slowly ({n} ms). Users may see delays." |

**Acceptance criteria:**
- AC-1: Testing a stopped spoke returns the unreachable message with the endpoint named.
- AC-2: Testing a running spoke updates cached capabilities and reports any drift.

---

### FR-F11-06 — System announcements management (SCR-29)

**Description:** Administrator-authored notices surfaced on user dashboards.

**Inputs:** `POST /api/admin/announcements`, `PATCH /api/admin/announcements/{id}`, `DELETE` (expire).

**Processing / business rules:**
1. Fields: `title` (5–120 chars), `body` (10–2000 chars, plain text only — no HTML, and input is escaped on render), `severity` (`INFO | WARNING | EMERGENCY`), `targetRoles` (≥1), `effectiveFrom`, `expiresAt`, `dismissible` (boolean, default true).
2. List shows active, scheduled, and expired announcements with counts, filterable by state and severity.
3. Editing an active announcement resets per-user dismissals only when `severity` or `body` changes materially; the form warns: "Changing the message will show it again to people who dismissed it."
4. Expire is a soft action setting `expiresAt = now`; announcements are never hard-deleted, so the audit trail stays meaningful.
5. All create/edit/expire actions are audited with before/after summaries.
6. `EMERGENCY` announcements are non-dismissible regardless of the `dismissible` flag, and the form explains this. They still never obscure or replace the demo banner (`FR-F03-03`).

**Validation rules:**
- `effectiveFrom < expiresAt` → "Enter an end date and time that comes after the start."
- `targetRoles` non-empty → "Choose at least one role to show this to."
- `body` plain text; any markup is escaped, not stripped silently.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Validation failure | 400 | `VALIDATION_FAILED` | "There is a problem. Fix the following, then try again." + field copy. |
| Announcement not found | 404 | `ANNOUNCEMENT_NOT_FOUND` | "We couldn't find that announcement. It may have been removed." |

**Acceptance criteria:**
- AC-1: A created announcement appears on the targeted roles' dashboards within one poll and not on others'.
- AC-2: Dismissal persists per user and does not affect other users.
- AC-3: Every announcement action is audited.

---

### FR-F11-07 — Policy visibility and console-wide conventions

**Description:** The console shows the platform's policy, and behaves consistently.

**Processing / business rules:**
1. A read-only "Roles and permissions" view renders the role matrix (`FR-F02-02`) as an accessible table, so a reviewer can inspect the policy rather than infer it from behavior.
2. All console tables use the same sort, filter, and pagination patterns as the work queue (`FR-F05-04`), so patterns are learned once.
3. Every console screen provides an entry point to the audit viewer pre-filtered to its subject (application, identity, announcement).
4. **Every console action is authorized server-side and audited**, including reads of identity data (`FR-F02-08`). The console has no privileged bypass.
5. Console screens carry the demo banner and the same shell as user-facing screens — the administrator is inside the same product, not a separate tool.

**Acceptance criteria:**
- AC-1: The role matrix view matches the enforced policy, verified by comparing against `role_permissions`.
- AC-2: Every console mutation produces an audit record naming the administrator.
- AC-3: An Investigator attempting any console route is denied and audited.

---
