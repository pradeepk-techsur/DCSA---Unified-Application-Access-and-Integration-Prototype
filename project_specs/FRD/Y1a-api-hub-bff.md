## Y1a — Hub BFF API Catalog

**Base:** `/api`. **Format:** JSON (`application/json; charset=utf-8`). **Auth:** server-side session cookie (`FR-F01-01`); mutating requests require `X-CSRF-Token`. **Every endpoint** traverses the pipeline in `FR-F10-01` and is authorized by the PDP (`FR-F02-01`). **Every mutating endpoint** writes audit before responding (`FR-F13-01`).

**Common headers.** Request: `X-CSRF-Token` (mutations), `X-Correlation-Id` (optional, ULID), `X-Idempotency-Key` (mutations). Response: `X-Correlation-Id`, `X-UAL-Session-Expires`, `Cache-Control: no-store`.

**Error envelope:** §3.6. **Error codes:** `Y2`.

**Column key:** *Auth* = required permission (`—` = none/anonymous). *Audit* = writes an audit record.

---

### §Auth

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/auth/methods` | — | No |
| POST | `/api/auth/initiate` | — | No |
| POST | `/api/auth/complete` | — | Yes (`AUTH_SUCCESS` / `AUTH_FAILURE`) |
| POST | `/api/auth/logout` | session | Yes (`LOGOUT`) |

**`GET /api/auth/methods`** → `200 { methods: [{ methodId, label, description, iconToken, enabled, disabledReason, simulationNotice }] }`
Errors: `503 AUTH_CONFIG_UNAVAILABLE`.

**`POST /api/auth/initiate`**
Request: `{ methodId: "CAC_PIV"|"ECA"|"GENERIC_MFA", username?: string }` (`username` required for `GENERIC_MFA`, 3–128 chars).
→ `200 { transactionId, state, expiresAt, identities?: [{ identityId, subjectCommonName, subjectOrganization, issuer, serialNumber, validFrom, validTo, roles[] }], demoCode?: string }`
`identities` for CAC_PIV/ECA; `demoCode` for GENERIC_MFA. Errors: `400 VALIDATION_FAILED`, `503 AUTH_CONFIG_UNAVAILABLE`.

**`POST /api/auth/complete`**
Request: `{ transactionId, identityId?, otp? }` (`identityId` for cert paths, `otp` 6 digits for MFA).
→ `200 { principal, entitlements, expiresAt, returnTo }` + `Set-Cookie: ual_session`
Errors: `400 AUTH_TX_EXPIRED`, `400 AUTH_TX_CONSUMED`, `400 VALIDATION_FAILED`, `401 AUTH_FAILED`, `403 IDENTITY_NOT_PROVISIONED`, `429 AUTH_ATTEMPTS_EXCEEDED`.

**`POST /api/auth/logout`** → `204`. Idempotent (`FR-F00-07`).

---

### §Session

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/session` | session | No |
| POST | `/api/session/extend` | session | No |
| POST | `/api/session/active-role` | session | Yes (`ROLE_CONTEXT_SWITCHED`) |

**`GET /api/session`** → `200 { principalId, displayName, roles[], activeRole, identityMethod, attributes{}, expiresAt, authEventCount }`
Errors: `401 SESSION_INVALID`.

**`POST /api/session/extend`** → `200 { expiresAt }`. Errors: `401 SESSION_EXPIRED`, `401 SESSION_MAX_LIFETIME`.

**`POST /api/session/active-role`** Request: `{ activeRole }` → `200 { principal, entitlements }`. Errors: `403 ROLE_NOT_HELD`.

---

### §Entitlements

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/entitlements` | `NAV.READ` | No |
| GET | `/api/registry-version` | session | No |

**`GET /api/entitlements`** → `200 { activeRole, roles[], navigation: [{ id, label, href, iconToken, order, badgeCount }], permissions: [string], defaultLanding, registryVersion }`
Errors: `500 INTERNAL_ERROR`.

**`GET /api/registry-version`** → `200 { version, updatedAt }` — polled every 30 s to detect registry changes (`FR-F08b-03`).

---

### §Dashboard

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/dashboard` | `DASHBOARD.READ` | No |

**`GET /api/dashboard?widgets=a,b`** → `200 { role, widgets: [{ widgetId, title, state: "READY"|"EMPTY"|"PARTIAL"|"ERROR", data, href, message? }], sourceStatus: [{ applicationId, label, status, omittedItemEstimate, message }], generatedAt, correlationId }`
Always `200` when at least the shell can be built; widget failures are expressed in `widget.state` (`FR-F04-01`). Errors: `500 INTERNAL_ERROR` (composition missing).

---

### §Work Queue

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/work-items` | `WORK_QUEUE.LIST` | No |
| GET | `/api/search` | `WORK_QUEUE.LIST` | No |

**`GET /api/work-items`**
Query: `q`, `sourceSystem[]`, `type[]`, `status[]` (statusCategory), `priority[]`, `assignee` (`me|unassigned|{principalId}`), `dueFrom`, `dueTo`, `overdueOnly`, `sort` (`dueDate|priority|statusCategory|sourceSystem|lastActivityAt|title`), `dir`, `page`, `pageSize`.
→ `200 { items: WorkItem[], page, pageSize, totalCount, totalPages, hasNext, truncated, appliedFilters{}, sourceStatus: [{ applicationId, label, status, itemCount, latencyMs, omittedItemEstimate, message }], correlationId }`
**Returns 200 whenever ≥1 source succeeded** (`FR-F05-05`). Errors: `400 VALIDATION_FAILED`, `503 REGISTRY_UNAVAILABLE`.

**`GET /api/search?q=`** Query: `q` (2–120), `sourceSystem[]`, `type[]` → `200 { groups: [{ applicationId, label, items: WorkItem[] }], totalCount, sourceStatus[], exactMatch?: WorkItem, correlationId }`
Errors: `400 VALIDATION_FAILED`.

---

### §Work Items

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/work-items/{workItemId}` | `WORK_ITEM.READ` | Yes (`WORK_ITEM_VIEWED`) |
| GET | `/api/work-items/{workItemId}/actions` | `WORK_ITEM.READ` | No |
| POST | `/api/work-items/{workItemId}/actions/{actionId}` | `WORK_ITEM.ACT` | Yes (action-specific) |
| GET | `/api/work-items/{workItemId}/activity` | `WORK_ITEM.READ` | No |
| GET | `/api/work-items/{workItemId}/related` | `WORK_ITEM.READ` | Yes (`RELATED_ITEMS_RESOLVED`) |

**`GET /api/work-items/{workItemId}`** (`{sourceSystem}:{nativeId}`)
→ `200 { item: WorkItem, typeSpecificDetail: object, availableActions: ActionDescriptor[], relatedRefs: RelatedRef[], breadcrumbTrail: [{ label, href, sourceSystem }], stateVersion, sourceHealth, syntheticMarker }`
Errors: `403 AUTHZ_DENIED` (also for not-found — non-enumerable), `409 APPLICATION_DISABLED`, `502 UPSTREAM_CONTRACT_ERROR`, `503 UPSTREAM_UNAVAILABLE`.

**`POST /api/work-items/{workItemId}/actions/{actionId}`**
Request: `{ stateVersion, idempotencyKey, payload: {…} }`
→ `200 { item: WorkItem, stateVersion, message, targetSystems[], correlationId }`
Errors: `400 VALIDATION_FAILED`, `403 AUTHZ_DENIED`, `409 ACTION_NOT_AVAILABLE`, `409 STATE_CONFLICT`, `422 UPSTREAM_REJECTED_ACTION`, `500 AUDIT_WRITE_FAILED`, `502 UPSTREAM_INDETERMINATE`, `503 UPSTREAM_UNAVAILABLE`.

**`GET /api/work-items/{workItemId}/activity?page=&pageSize=`**
→ `200 { events: ActivityEvent[], page, pageSize, hasNext, spokeHistoryAvailable: boolean, message? }`

**`GET /api/work-items/{workItemId}/related`**
→ `200 { relatedRefs: [{ relationshipType, targetSystem, targetSystemLabel, targetNativeId, targetWorkItemId, label, contextHint, resolvable, summary?: { title, statusLabel, lastActivityAt }, unresolvableReason? }] }`

---

### §Orchestration

| Method | Path | Auth | Audit |
|---|---|---|---|
| POST | `/api/orchestration/resolve-pvq-issue` | `ISSUE.RESOLVE` | Yes (chain, `FR-F07b-06`) |
| GET | `/api/orchestration/{transactionId}` | owner or `ADMIN.*` | No |
| POST | `/api/orchestration/{transactionId}/retry` | owner or `ADMIN.*` | Yes (`ORCHESTRATION_RETRY_ATTEMPTED`) |

**`POST /api/orchestration/resolve-pvq-issue`**
Request:
```json
{ "issueId": "PVQ:ISS-2207", "parentCaseId": "EAPP:CASE-A-1042",
  "disposition": "SUBSTANTIATED", "resolutionNarrative": "…20–4000 chars…",
  "reviewedAnswerConfirmed": true, "stateVersion": "…", "idempotencyKey": "01JD…" }
```
→ `200` (COMPLETED) or `207` (PARTIALLY_COMPLETED):
```json
{ "transactionId": "…", "correlationId": "…", "overallOutcome": "COMPLETED",
  "systems": [ { "applicationId": "PVQ", "label": "Personnel Vetting Questionnaire",
                 "outcome": "COMMITTED", "requested": "Resolve issue as Substantiated",
                 "stateBefore": "Open", "stateAfter": "Resolved — Substantiated",
                 "readBackAt": "2026-09-14T15:05:02Z", "message": null } ],
  "retry": null }
```
Errors: `400 VALIDATION_FAILED`, `400 RELATIONSHIP_MISMATCH`, `403 AUTHZ_DENIED`, `409 ACTION_NOT_AVAILABLE`, `409 STATE_CONFLICT`, `500 AUDIT_WRITE_FAILED`, `502 UPSTREAM_INDETERMINATE`, `503 UPSTREAM_UNAVAILABLE`, `504 ORCHESTRATION_TIMEOUT`.

**`POST /api/orchestration/{transactionId}/retry`** → `200` or `207` with the same shape. Errors: `403 AUTHZ_DENIED`, `409 ACTION_NOT_AVAILABLE` (already completed returns `200` with stored outcome).

---

### §Notifications

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/notifications` | `DASHBOARD.READ` | No |
| POST | `/api/notifications/{alertId}/read` | `DASHBOARD.READ` | No (`FR-F15-03` rule 7) |
| POST | `/api/notifications/read-all` | `DASHBOARD.READ` | No |
| POST | `/api/announcements/{id}/dismiss` | `DASHBOARD.READ` | No |

**`GET /api/notifications`** Query: `type`, `severity`, `sourceSystem`, `readState`, list params
→ `200 { alerts: [{ alertId, ruleId, severity, title, message, workItemId, sourceSystem, sourceSystemLabel, generatedAt, actionHref, read }], announcements: [{ announcementId, title, body, severity, issuedAt, dismissible, dismissed, actionHref, actionLabel }], unreadCount, sourceStatus[] }`

---

### §Health

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/health/summary` | session | No |

→ `200 { applications: [{ applicationId, displayName, status, lastCheckedAt, latencyMs, message, circuitState? }], degradedCount, downCount, checkedAt }`
`circuitState` and technical detail are administrator-only (`FR-F16-02` rule 4).

---

### §Admin — Applications

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/admin/applications` | `ADMIN.APP.LIST` | No |
| GET | `/api/admin/applications/{id}` | `ADMIN.APP.READ` | No |
| POST | `/api/admin/applications` | `ADMIN.APP.REGISTER` | Yes (`APPLICATION_REGISTERED`) |
| PATCH | `/api/admin/applications/{id}` | `ADMIN.APP.EDIT` / `.DISABLE` | Yes (`APPLICATION_UPDATED` / `_ENABLED` / `_DISABLED`) |
| DELETE | `/api/admin/applications/{id}` | `ADMIN.APP.DEREGISTER` | Yes (`APPLICATION_DEREGISTERED`) |
| POST | `/api/admin/applications/test-connection` | `ADMIN.APP.REGISTER` | No |
| POST | `/api/admin/applications/{id}/probe` | `ADMIN.HEALTH.PROBE` | Yes (`APPLICATION_PROBED`) |

**`POST /api/admin/applications`** Request: the full registry record (`FR-F08b-01`) plus `draftId`.
→ `201 { application, registryVersion }`
Errors: `400 VALIDATION_FAILED` (field-level per `FR-F12-02`), `400 CONNECTION_TEST_REQUIRED`, `409 DUPLICATE_APPLICATION_ID`, `409 DRAFT_EXPIRED`, `409 APPLICATION_INCOMPATIBLE`.

**`PATCH /api/admin/applications/{id}`** Request: partial record; `{ enabled, reason }` for enable/disable.
Errors: `400 VALIDATION_FAILED`, `400 IMMUTABLE_FIELD`, `404 APPLICATION_NOT_FOUND`.

**`DELETE /api/admin/applications/{id}`** Request: `{ confirmDisplayName, reason }` → `200 { registryVersion, removedItemEstimate }`. Errors: `400 VALIDATION_FAILED`, `404 APPLICATION_NOT_FOUND`.

**`POST /api/admin/applications/test-connection`** Request: `{ baseEndpoint, healthEndpoint, adapterType, healthTimeoutMs, timeoutMs }`
→ `200 { result: "PASS"|"WARNING"|"FAIL", checks: [{ checkId, label, status, detail }], describe?: {…}, durationMs }`
Always `200`; the outcome is in `result` (`FR-F12-03`).

**`POST /api/admin/applications/{id}/probe`**
→ `200 { health, describe, contractVersionSupported, capabilityChanges: [{ kind, item }], durationMs }`

---

### §Admin — Operations

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/admin/health` | `ADMIN.HEALTH.READ` | No |
| GET | `/api/admin/integration-issues` | `ADMIN.ISSUES.READ` | No |
| GET | `/api/admin/users` | `ADMIN.USER.READ` | Yes (`USER_VIEWED`) |
| GET | `/api/admin/users/{id}` | `ADMIN.USER.READ` | Yes (`USER_VIEWED`) |
| GET | `/api/admin/status` | `ADMIN.HEALTH.READ` | No |
| POST | `/api/admin/failure-injection` | `ADMIN.FAILURE_INJECTION.SET` | Yes (`FAILURE_INJECTED`/`FAILURE_CLEARED`) |
| POST | `/api/admin/operator-token` | `ADMIN.HEALTH.READ` | Yes (`OPERATOR_TOKEN_ISSUED`) |
| POST | `/api/admin/reset` | `ADMIN.HEALTH.PROBE` | Yes (`DEMO_RESET_PERFORMED`) |

**`GET /api/admin/health`** → `200 { applications: [{ applicationId, displayName, status, lastCheckedAt, lastSuccessAt, latencyMs, p50LatencyMs, p95LatencyMs, consecutiveFailures, circuitState, nextProbeAt, injectedMode }], monitorRunning: boolean }`

**`GET /api/admin/integration-issues`** Query: `applicationId`, `errorClass`, `operation`, `principalId`, `from`, `to`, `q`, list params
→ `200 { items: [{ issueId, occurredAt, applicationId, applicationDisplayName, operation, errorClass, spokeHttpStatus, responseExcerpt, attempt, circuitStateAtFailure, principalId, correlationId, adapterRequestId, orchestrationTxId }], …list envelope }`

**`GET /api/admin/status`** → `200 { services: [{ serviceId, label, running, version, health, latencyMs, port, injectedMode, rowCounts{} }], readiness: { level: "READY"|"CAUTION"|"NOT_READY", checks: [{ checkId, label, status, message }] } }`

**`POST /api/admin/failure-injection`** Request: `{ applicationId, mode, slowMs?, errorRatePct?, durationSec? }` → `200 { applicationId, mode, expiresAt }`. Errors: `400 VALIDATION_FAILED`, `404 APPLICATION_NOT_FOUND`, `502 INJECTION_FAILED`.

**`POST /api/admin/reset`** Request: `{ confirmPhrase: "RESET" }` → `202 { startedAt }`; completes < 30 s (`FR-F17-11`).

---

### §Admin — Announcements

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/admin/announcements` | `ADMIN.ANNOUNCEMENT.READ` | No |
| POST | `/api/admin/announcements` | `ADMIN.ANNOUNCEMENT.CREATE` | Yes (`ANNOUNCEMENT_CREATED`) |
| PATCH | `/api/admin/announcements/{id}` | `ADMIN.ANNOUNCEMENT.EDIT` | Yes (`ANNOUNCEMENT_UPDATED`) |
| DELETE | `/api/admin/announcements/{id}` | `ADMIN.ANNOUNCEMENT.EXPIRE` | Yes (`ANNOUNCEMENT_EXPIRED`) |

**`POST /api/admin/announcements`** Request: `{ title, body, severity, targetRoles[], dismissible, actionHref?, actionLabel?, effectiveFrom, expiresAt }` → `201 { announcement }`. Errors: `400 VALIDATION_FAILED`.
`DELETE` is a soft expire (sets `expiresAt = now`); records are never hard-deleted.

---

### §Audit

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/audit` | `AUDIT.READ_OWN` / `AUDIT.READ_ALL` | Yes (`AUDIT_VIEWED`) |
| GET | `/api/audit/{auditId}` | scoped | No |
| GET | `/api/audit/chain/{correlationId}` | scoped | No |
| GET | `/api/audit/export` | scoped | Yes (`AUDIT_EXPORTED`) |
| GET | `/api/audit/integrity` | `AUDIT.READ_ALL` | No |

**`GET /api/audit`** Query: `actor`, `actorRole`, `actionType`, `targetSystem`, `targetResourceId`, `outcome`, `correlationId`, `from`, `to`, `q`, list params
→ `200 { items: [audit record fields per FR-F13-02], …list envelope, scope: "OWN"|"ALL" }`
Errors: `400 VALIDATION_FAILED` (range > 90 days, reversed range).

**`GET /api/audit/chain/{correlationId}`** → `200 { correlationId, summary: string, records: [...], redactedCount }`

**`GET /api/audit/export?format=csv|json`** → `200` file stream. Errors: `400 EXPORT_TOO_LARGE`.

**`GET /api/audit/integrity?fromSequence=&toSequence=`** → `200 { verified, recordsChecked, firstBrokenSequence, checkedAt }`

---

### §Documentation

| Method | Path | Auth |
|---|---|---|
| GET | `/api/docs` | `ADMIN.APP.LIST` |
| GET | `/api/docs/openapi.json` | `ADMIN.APP.LIST` |

Generated from route declarations (`FR-F10-06`); a route without documentation fails the CI check.

---

### Endpoint → screen traceability

Every endpoint above is consumed by at least one screen in `FR-F03-02`, and every screen's data requirements are met by these endpoints (`FR-F10-02` rule 1). `/api/admin/status`, `/api/audit/integrity`, and `/api/docs` are additionally documented verification surfaces.

---
