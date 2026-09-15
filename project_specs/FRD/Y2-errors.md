## Y2 — Consolidated Error Catalog and User-Facing Copy

**Normative.** The `message` column is the exact text the implementation uses. A code not in this catalog cannot be emitted; a startup check validates emitted codes against it (`FR-F10-03` rule 2).

**Copy rules (apply to every message in this document):**
1. Plain language. No jargon, no system internals, no exception names, no stack traces, no hostnames, no ports, no SQL.
2. Say what happened, say whether anything changed, say what to do next.
3. Name the affected system by its registry `displayName` (`{System}`), never by its internal identifier.
4. Never blame the user. Never say "invalid" where "check" will do.
5. Denials never reveal whether a resource exists.
6. Every user-visible error surfaces a copyable correlation ID.
7. `{correlationId}`, `{System}`, `{n}`, `{m}`, `{q}`, `{label}`, `{name}`, `{v}`, `{list}`, `{date}`, `{actor}` are substitution tokens.

---

### 1. Authentication and session

| Code | HTTP | Message | Detail / next step |
|---|---|---|---|
| `AUTH_CONFIG_UNAVAILABLE` | 503 | "Sign-in is temporarily unavailable. Please try again in a moment." | — |
| `AUTH_FAILED` | 401 | "We couldn't sign you in. Check the demo username and code, then try again." | Identical for unknown identity, wrong code, and disabled identity (`FR-F00-04`). |
| `AUTH_FAILED` (cert paths) | 401 | "We couldn't sign you in with the selected identity. Choose a different demo identity or sign-in method." | — |
| `AUTH_TX_EXPIRED` | 400 | "Your sign-in attempt timed out. Choose a sign-in method to start again." | — |
| `AUTH_TX_CONSUMED` | 400 | "That sign-in attempt has already been completed. Choose a sign-in method to start again." | — |
| `AUTH_ATTEMPTS_EXCEEDED` | 429 | "Too many attempts. Choose a sign-in method to start again." | — |
| `IDENTITY_NOT_PROVISIONED` | 403 | "This demo identity isn't set up with a role yet. Choose a different identity." | — |
| `ROLE_NOT_HELD` | 403 | "You don't have that role. Your available roles are shown in the account menu." | — |
| `SESSION_INVALID` | 401 | "You're not signed in. Sign in to continue." | Same copy for missing, altered, and terminated sessions. |
| `SESSION_EXPIRED` | 401 | "You were signed out because of inactivity. Sign in again to pick up where you left off." | Preserves `returnTo`. |
| `SESSION_MAX_LIFETIME` | 401 | "Your session reached its time limit. Sign in again to continue." | — |
| `CSRF_REJECTED` | 403 | "Your request couldn't be completed. Refresh the page and try again." | — |

---

### 2. Authorization

| Code | HTTP | Message | Detail / next step |
|---|---|---|---|
| `AUTHZ_DENIED` | 403 | "You don't have access to this item." | "If you think this is a mistake, contact your administrator and give them reference {correlationId}." Identical for forbidden and non-existent resources (`FR-F02-07`). |
| `AUTHZ_DENIED` (page scope) | 403 | "You don't have access to this page." | Actions: "Go to my dashboard", "Go to my work queue". |
| `AUTHZ_DENIED` (action scope) | 403 | "You don't have permission to do that." | — |
| `AUTHZ_DENIED_UPSTREAM` | 403 | "You don't have access to this item in {System}." | — |
| `ACTION_NOT_AVAILABLE` | 409 | "This action isn't available for this item right now. Refresh the page to see the current options." | — |
| `STATE_CONFLICT` | 409 | "This item changed since you opened it. Refresh to see the latest version, then try again." | — |

---

### 3. Validation — generic

| Code | HTTP | Message |
|---|---|---|
| `VALIDATION_FAILED` (summary) | 400 | "There is a problem. Fix the following, then try again." |
| `VALIDATION_FAILED` (unknown field) | 400 | "Your request couldn't be completed. Refresh the page and try again." |
| Required text field | 400 | "Enter {label}." |
| Required choice field | 400 | "Select {label}." / "Choose a valid {label}." |
| Over max length | 400 | "Shorten this to {n} characters or fewer. You've used {m}." |
| Under min length | 400 | "Enter at least {n} characters." |
| Invalid date | 400 | "Enter a valid date." |
| Reversed date range | 400 | "Enter an end date that comes after the start date." |
| Search too short | 400 | "Enter at least 2 characters to search." |
| Audit range too large | 400 | "Choose a date range of 90 days or fewer." |
| `EXPORT_TOO_LARGE` | 400 | "Narrow your filters — exports are limited to 10,000 records." |
| `RATE_LIMITED` | 429 | "You're making requests faster than we can handle. Wait {n} seconds and try again." |

---

### 4. Upstream (spoke) conditions

| Code | HTTP | Message | Changed anything? |
|---|---|---|---|
| `UPSTREAM_UNAVAILABLE` (read) | 503 | "{System} isn't responding right now, so we can't show this item. Your other work is still available." | No |
| `UPSTREAM_UNAVAILABLE` (write) | 503 | "{System} isn't responding right now, so nothing was changed. Try again in a moment." | **No — stated explicitly** |
| `UPSTREAM_REJECTED_ACTION` | 422 | "{System} couldn't complete this action: {plain reason}. Nothing was changed." | No |
| `UPSTREAM_INDETERMINATE` | 502 | "We're not sure whether {System} completed this action. Refresh this item to check its current status before trying again — reference {correlationId}." | **Unknown — stated explicitly** |
| `UPSTREAM_REJECTED` | 502 | "The {System} system couldn't process this request. We've logged the problem — reference {correlationId}." | No |
| `UPSTREAM_CONTRACT_ERROR` | 502 | "We couldn't read this item from {System}. We've logged the problem — reference {correlationId}." | No |
| `APPLICATION_DISABLED` | 409 | "{System} is turned off in this environment. Contact your administrator if you need access." | No |
| `APPLICATION_INCOMPATIBLE` | 409 | "This application uses an integration version we don't support yet (version {v}). Supported versions: {list}." | No |
| `REGISTRY_UNAVAILABLE` | 503 | "We can't load your work list right now. Try again in a moment — reference {correlationId}." | No |

---

### 5. Orchestration (the distributed-write cases)

| Code | HTTP | Message |
|---|---|---|
| `ORCHESTRATION_PARTIAL` | 207 | "Partly completed. {System A} recorded your resolution. {System B} hasn't been updated yet — we're retrying automatically. You can also retry now. Reference {correlationId}." |
| `ORCHESTRATION_PARTIAL` (retry failed) | 207 | "{System B} still isn't responding. {System A}'s record is unchanged and correct. We'll keep retrying — reference {correlationId}." |
| `ORCHESTRATION_NEEDS_ATTENTION` | 207 | "{System B} couldn't be updated after several attempts. {System A}'s record is correct. An administrator has been notified — reference {correlationId}." |
| `ORCHESTRATION_TIMEOUT` | 504 | "This is taking longer than expected. Check the issue's current status before trying again — reference {correlationId}." |
| `RELATIONSHIP_MISMATCH` | 400 | "We couldn't confirm which case this issue belongs to. Refresh the page and try again — reference {correlationId}." |
| Already completed (retry) | 200 | "This was already completed. Both systems are up to date." |

**Rule:** the word "success" or "successful" MUST NOT appear in any `ORCHESTRATION_PARTIAL` or `ORCHESTRATION_NEEDS_ATTENTION` response or rendered page (`FR-F07b-03` rule 5, R-06). Asserted by test.

---

### 6. Audit

| Code | HTTP | Message |
|---|---|---|
| `AUDIT_UNAVAILABLE` | 503 | "We can't record actions right now, so this action wasn't completed. Try again shortly — reference {correlationId}." |
| `AUDIT_WRITE_FAILED` | 500 | "We couldn't record this action. It may have been applied in {System} — check the item's current status. An administrator has been notified — reference {correlationId}." |
| `METHOD_NOT_ALLOWED` (audit mutation) | 405 | "Audit records can't be changed or deleted." |
| Integrity failure | 200 | "Audit integrity check failed at record {n}. Records may have been altered outside the application. Contact your administrator." |

---

### 7. Administration and registration

| Code | HTTP | Message |
|---|---|---|
| `APPLICATION_NOT_FOUND` | 404 | "We couldn't find that application. It may have been removed." |
| `DUPLICATE_APPLICATION_ID` | 409 | "That application ID is already in use. Choose a different one." |
| `IMMUTABLE_FIELD` | 400 | "The application ID can't be changed because existing records refer to it." |
| `CONNECTION_TEST_REQUIRED` | 400 | "Test the connection before you register this application." |
| `DRAFT_EXPIRED` | 409 | "Your registration draft expired. Start again — your entries weren't saved." |
| `ANNOUNCEMENT_NOT_FOUND` | 404 | "We couldn't find that announcement. It may have been removed." |
| `INJECTION_FAILED` | 502 | "We couldn't change {name}'s simulated state. Check that it's running." |
| De-register confirm mismatch | 400 | "The name you typed doesn't match. Type {displayName} exactly to confirm." |
| Missing reason | 400 | "Enter a reason for this change." / "Enter a reason for removing this application." |

**Connection test outcomes (`FR-F12-03`), all returned with HTTP 200 and a `result` field:**

| Result | Message |
|---|---|
| Unreachable | "We couldn't reach that application at {endpoint}. Check that it's running and the address is correct." |
| Health timeout | "The application didn't respond within {n} milliseconds. Check the address, or increase the health check timeout." |
| Malformed describe | "The application responded, but didn't describe what it can do in a format we understand. It may not support this integration version." |
| Version unsupported | "This application uses integration version {v}, which we don't support yet. Supported versions: {list}." |
| Unknown permission | "This application asks for permissions this system doesn't have: {list}." |
| Degraded (warning) | "The application responded slowly ({n} ms). You can register it, but users may see delays." |
| Zero work-item types (warning) | "This application doesn't provide any work items. It will appear in the admin console but not in users' work queues." |

**Registration field errors:** the full table is `FR-F12-02` and is normative there; it is not duplicated here to avoid divergence.

---

### 8. Degraded-system copy

| Situation | Copy |
|---|---|
| One source down, count known | "{System} is unavailable — {n} items are not shown. The rest of your work is up to date." |
| One source down, count unknown | "{System} is unavailable — some items are not shown." |
| Multiple sources down | One alert listing each system and its count; never a generic "some systems are unavailable." |
| Source slow (row level) | "Slow to respond." |
| Source slow (action level) | "{System} is responding slowly. This may take longer than usual." |
| Action disabled, system down | "{System} isn't responding right now. Try again when it's back." |
| Orchestrated action disabled | "{System} isn't responding right now, so this issue can't be resolved yet." |
| Circuit open | "{System} isn't responding right now. We'll reconnect automatically." |
| Recovery | "{System} is available again. Refresh to see {n} more items." |
| Recovery (action) | "{System} is available again. You can now resolve this issue." |
| All sources down (queue) | "We can't reach any connected systems right now. Your work will appear here automatically when they're back." |
| All sources down (dashboard) | "We can't reach the connected systems right now. Your dashboard will fill in automatically when they're back." |
| All sources down (search) | "We couldn't reach any connected systems. Your search will work again once they're back." |
| Alerts unavailable | "Alerts from {System} aren't available right now." |
| Related item, system down | "{System} isn't responding right now, so this related issue can't be opened." |
| Related item, not entitled | "You don't have access to the related item in {System}." |
| Related item, unconfirmable | "This related item couldn't be confirmed. We've logged the problem — reference {correlationId}." |
| Related case missing | "The related case couldn't be found in eApp. We've logged the problem — reference {correlationId}." |
| Spoke history unavailable | "Some history from {System} isn't available right now." |
| Confirmation re-read failed | "We couldn't confirm the current state in {System}." |
| Health data absent | "No health checks have run yet. The first check runs within {n} seconds." |
| Monitor not running | "Health monitoring isn't running. Statuses below may be out of date." |

---

### 9. Empty-state copy

| Screen / region | Copy |
|---|---|
| Work queue — no matches | "No work items match your filters. Clear filters to see all of your work." |
| Work queue — nothing assigned | "You have no assigned work right now. New assignments will appear here." |
| Search — no results | "No results for '{q}'. Check the spelling, or try a case or subject number." |
| Queue search — no results | "No work items match '{q}'. Check the spelling, or try a case or subject number." |
| Dashboard — assigned work | "You have no assigned work right now. New assignments will appear here." |
| Dashboard — new PVQ issues | "No issues have been raised on your cases in the last 7 days." |
| Adjudicator — awaiting determination | "Nothing is waiting on your determination." |
| Adjudicator — deadlines | "No cases in your organization have upcoming deadlines in the next 14 days." |
| Applicant — tasks | "You don't have anything to do right now. We'll let you know if that changes." |
| Applicant — notices | "You have no notices." |
| Notifications | "You have no notifications. New alerts and announcements will appear here." |
| Alerts | "You have no alerts right now." |
| Related items | "No related items in other systems." |
| Activity history | "No activity recorded yet." |
| Audit viewer | "No audit records match your filters. Try widening the date range." |
| Admin — applications | "No applications are registered yet. Register your first application to get started." |
| Admin — application search | "No applications match '{q}'." |
| Admin — integration issues | "No integration issues in this period. That's good news." |
| Admin — identities | "No identities match your filters." |
| Detail — no actions | "No actions are available for this item." |
| Detail — no spoke history | "Detailed history isn't available from {System}." |
| Search — source excluded | "{System} doesn't support search. Its items aren't included in these results." |

**Rule (`FR-F16-07` rule 2):** an empty state MUST NOT be shown when the true cause is a failure. "You have no assigned work" and "We couldn't load your work" are different statements, and conflating them is prohibited.

---

### 10. Page-level error screens

| Screen | Heading | Body | Actions |
|---|---|---|---|
| SCR-30 Access denied | "You don't have access to this page." | "If you think this is a mistake, contact your administrator and give them reference {correlationId}." | "Go to my dashboard", "Go to my work queue" |
| SCR-31 Not found | "We couldn't find that page." | "The address {path} doesn't match anything in this application. It may have been moved or mistyped." | "Go to my dashboard", "Go to my work queue" |
| SCR-32 Unexpected error | "Something went wrong." | "We hit a problem we didn't expect. Nothing you were doing has been lost. Reference {correlationId}." | "Try again", "Go to my dashboard" |

All three render inside the shell with the demo banner, set a descriptive page title, move focus to the `<h1>`, and announce via `role="alert"` (`FR-F14-10`).

---

### 11. Confirmation and success copy

| Situation | Copy |
|---|---|
| Single-system action | "{Item} updated in {System}. {What changed}." |
| PVQ issue resolved | "Issue ISS-2207 marked Resolved — Substantiated in PVQ." |
| eApp case updated | "Case A-1042 updated in eApp. Outstanding issue cleared." |
| Orchestration complete | "Resolution complete. PVQ and eApp both updated." |
| Orchestration partial | "Partly completed. PVQ updated. eApp not updated." |
| Role switched | "Role changed to {role}. Your menu has been updated." |
| Marked as read | "Marked as read. {n} unread remaining." |
| Connection test passed | "Connection test complete. {System} is healthy, responded in {n} milliseconds." |
| Widget refreshed | "{Widget} updated. {n} items." |
| Sort changed | "Sorted by {field}, {direction}. {n} items." |
| Queue loaded | "{n} work items. Showing {a} to {b}. {m} of {k} systems reporting." |
| Dashboard loaded | "Dashboard loaded. {m} of {k} systems reporting." |

---

### 12. Prohibited content (asserted by `FR-F19-08` rule 5)

User-facing copy anywhere in the application MUST NOT contain: stack-trace patterns (`at `, `.js:`, `Traceback`), exception class names, hostnames or IP addresses, port numbers, SQL fragments, spoke-internal identifiers not shown elsewhere in the UI, raw HTTP reason phrases, or the authentication verbs prohibited by `FR-F00-08` ("verified", "validated", "authenticated against", "trusted certificate").

---
