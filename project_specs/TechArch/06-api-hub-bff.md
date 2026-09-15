## 6. API Design — Hub BFF

**Base:** `/api` · **Format:** `application/json; charset=utf-8` · **Auth:** server-side session cookie; mutations require `X-CSRF-Token` · **Origin:** same-origin as the UI via the Next.js rewrite, so no CORS and no `SameSite` relaxation is needed.

Every endpoint traverses the eleven-step pipeline. Every endpoint is authorized by the PDP. Every mutating endpoint writes audit before its success response is composed. None of that is per-endpoint code — it is the pipeline, and a route cannot opt out of it.

---

### 6.1 How Endpoints Are Declared

One TypeBox declaration per route yields four artifacts that must agree: the TypeScript request/response types, the runtime ajv validator, the OpenAPI schema, and the client-side form validator. Declaring them separately guarantees drift; `FR-F10-06` rule 1 forbids hand-maintained documentation for that reason.

```ts
// apps/hub/src/routes/orchestration.ts

const ResolvePvqIssueRequest = Type.Object({
  issueId:                 Type.String({ pattern: '^[A-Z][A-Z0-9_]{1,15}:.+$' }),
  parentCaseId:            Type.String({ pattern: '^[A-Z][A-Z0-9_]{1,15}:.+$' }),
  disposition:             Type.Union([
                             Type.Literal('SUBSTANTIATED'),
                             Type.Literal('UNSUBSTANTIATED'),
                             Type.Literal('RESOLVED_WITH_CLARIFICATION'),
                             Type.Literal('REFERRED_FOR_FURTHER_REVIEW')]),
  resolutionNarrative:     Type.String({ minLength: 20, maxLength: 4000 }),
  reviewedAnswerConfirmed: Type.Literal(true),
  stateVersion:            Type.String(),
  idempotencyKey:          Type.String({ pattern: ULID }),
}, { additionalProperties: false });   // unknown fields are REJECTED, never ignored

app.post('/api/orchestration/resolve-pvq-issue', {
  schema: {
    body: ResolvePvqIssueRequest,
    response: { 200: OrchestrationResult, 207: OrchestrationResult, ...errorResponses },
  },
  config: {
    action: 'ISSUE.RESOLVE',            // read by pipeline step 7 (the PDP)
    resourceType: 'ISSUE',
    auditActionType: 'ORCHESTRATION_STARTED',   // read by pipeline step 9
    mutating: true,
  },
}, resolvePvqIssueHandler);
```

A route registered without `config.action`, a request schema, and a response schema **fails the boot-time contract check and the process exits non-zero**. The hub will not start with an endpoint that could bypass the PDP or the audit writer.

---

### 6.2 Common Types

```ts
// packages/contracts/src/common.ts

/** Every non-2xx response body. No stack traces, no hostnames, no SQL, no spoke exception text. */
export interface ErrorEnvelope {
  error: {
    code: string;                      // from the closed Y2 catalog; validated at boot
    message: string;                   // exact user-facing copy from Y2
    detail: string | null;
    correlationId: string;             // always present; the user can quote it
    fieldErrors: Array<{ fieldId: string; message: string }>;
    retryable: boolean;                // server-driven: the UI does not guess
    retryAfterSeconds: number | null;
  };
}

/** Every list response. Uniform so every list screen behaves identically. */
export interface ListEnvelope<T> {
  items: T[];
  page: number; pageSize: number;      // 10 | 25 | 50 | 100, default 25
  totalCount: number; totalPages: number;
  hasNext: boolean;
  truncated: boolean;                  // a source capped its result set
  correlationId: string;
}

/** Per-source status. Present on every fan-out response — this is partial failure made visible. */
export interface SourceStatus {
  applicationId: string;
  label: string;                       // registry displayName; substituted for {System}
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  itemCount: number | null;
  latencyMs: number | null;
  omittedItemEstimate: number | null;  // from work_item_counts_cache; null => "some items"
  message: string | null;              // exact degraded copy from Y2 §8
}

export interface Breadcrumb { label: string; href: string; sourceSystem: string | null }
```

**Response headers on every response:** `X-Correlation-Id`, `X-UAL-Session-Expires`, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`. **Deliberately absent:** `X-Frame-Options` and any CSP `frame-ancestors` directive (ADR-012).

---

### 6.3 Auth and Session

| Method | Path | Permission | Audit |
|---|---|---|---|
| GET | `/api/auth/methods` | — | No |
| POST | `/api/auth/initiate` | — | No |
| POST | `/api/auth/complete` | — | Yes (`AUTH_SUCCESS` / `AUTH_FAILURE`) |
| POST | `/api/auth/logout` | session | Yes (`LOGOUT`) |
| GET | `/api/session` | session | No |
| POST | `/api/session/extend` | session | No |
| POST | `/api/session/active-role` | session | Yes (`ROLE_CONTEXT_SWITCHED`) |

```ts
export interface AuthMethodsResponse {
  methods: Array<{
    methodId: 'CAC_PIV' | 'ECA' | 'GENERIC_MFA';
    label: string; description: string; iconToken: string;
    enabled: boolean; disabledReason: string | null;
    simulationNotice: string;          // on-screen proof that sign-in is SIMULATED
  }>;
}

export interface AuthInitiateRequest {
  methodId: 'CAC_PIV' | 'ECA' | 'GENERIC_MFA';
  username?: string;                   // required for GENERIC_MFA, 3–128 chars
}
export interface AuthInitiateResponse {
  transactionId: string;
  state: 'AWAITING_SELECTION' | 'AWAITING_OTP';
  expiresAt: string;
  /** Cert paths only. Every field is fabricated; nothing is parsed or validated. */
  identities?: Array<{
    identityId: string; subjectCommonName: string; subjectOrganization: string;
    issuer: string;                    // 'DEMO-DOD-CA-59 (synthetic)'
    serialNumber: string;              // '00:DEMO:...'
    validFrom: string; validTo: string; roles: RoleId[];
  }>;
  demoCode?: string;                   // GENERIC_MFA only; deterministic and shown on screen
}

export interface AuthCompleteRequest { transactionId: string; identityId?: string; otp?: string }
export interface AuthCompleteResponse {
  principal: PrincipalView; entitlements: EntitlementsResponse;
  expiresAt: string; returnTo: string;   // honours the deep link that triggered sign-in
}
// + Set-Cookie: ual_session=<signed sessionId>; HttpOnly; Secure; SameSite=Lax; Path=/
// The cookie carries NOTHING but a signed sessionId. No roles. No attributes. No entitlements.

export interface PrincipalView {       // what the client may see — a strict subset of Principal
  principalId: string; displayName: string;
  roles: RoleId[]; activeRole: RoleId;
  identityMethod: 'CAC_PIV' | 'ECA' | 'GENERIC_MFA';
  attributes: { organization: string; clearanceTier: 'T1'|'T3'|'T5';
                assignedRegion: string; subjectRef: string | null };
  expiresAt: string;
  authEventCount: number;              // asserted === 1 across the flagship workflow (SM-02)
}

export interface ActiveRoleRequest { activeRole: RoleId }   // 403 ROLE_NOT_HELD if not held
```

Errors: `503 AUTH_CONFIG_UNAVAILABLE`, `400 AUTH_TX_EXPIRED`, `400 AUTH_TX_CONSUMED`, `400 VALIDATION_FAILED`, `401 AUTH_FAILED`, `403 IDENTITY_NOT_PROVISIONED`, `429 AUTH_ATTEMPTS_EXCEEDED`, `401 SESSION_INVALID`, `401 SESSION_EXPIRED`, `401 SESSION_MAX_LIFETIME`, `403 CSRF_REJECTED`.

---

### 6.4 Entitlements and Registry Version

| Method | Path | Permission | Audit |
|---|---|---|---|
| GET | `/api/entitlements` | `NAV.READ` | No |
| GET | `/api/registry-version` | session | No |

```ts
export interface EntitlementsResponse {
  activeRole: RoleId;
  roles: RoleId[];
  navigation: Array<{ id: string; label: string; href: string;
                      iconToken: string; order: number; badgeCount: number | null }>;
  permissions: string[];               // action strings, for rendering only
  defaultLanding: string;              // '/dashboard'
  registryVersion: number;
}

export interface RegistryVersionResponse { version: number; updatedAt: string }
```

`navigation` is computed from the role matrix intersected with the registry, so a disabled or de-registered application contributes no items. The client polls `/api/registry-version` every 30 seconds and on every navigation; a change triggers an entitlements refetch, which is how registering CVS makes it appear in a signed-in investigator's navigation **without a reload and without a restart**.

The client treats all of this as presentation input. `FR-F02-06` rule 4 is the load-bearing sentence: hiding a control is never the security boundary.

---

### 6.5 Dashboard, Work Queue, and Search

| Method | Path | Permission | Audit |
|---|---|---|---|
| GET | `/api/dashboard` | `DASHBOARD.READ` | No |
| GET | `/api/work-items` | `WORK_QUEUE.LIST` | No |
| GET | `/api/search` | `WORK_QUEUE.LIST` | No |

```ts
export interface DashboardResponse {
  role: RoleId;
  widgets: Array<{
    widgetId: string; title: string;
    state: 'READY' | 'EMPTY' | 'PARTIAL' | 'ERROR';   // per-widget, so one slow spoke
    data: unknown;                                    // cannot blank the whole page
    href: string; message: string | null;
  }>;
  sourceStatus: SourceStatus[];
  generatedAt: string; correlationId: string;
}

export interface WorkItemsQuery {
  q?: string;
  sourceSystem?: string[]; type?: string[];
  status?: StatusCategory[]; priority?: Priority[];
  assignee?: 'me' | 'unassigned' | string;
  dueFrom?: string; dueTo?: string; overdueOnly?: boolean;
  sort?: 'dueDate'|'priority'|'statusCategory'|'sourceSystem'|'lastActivityAt'|'title';
  dir?: 'asc' | 'desc';
  page?: number; pageSize?: 10|25|50|100;
}

export interface WorkItemsResponse extends ListEnvelope<WorkItem> {
  appliedFilters: Record<string, unknown>;   // drives the removable filter chips
  sourceStatus: SourceStatus[];
}

export interface SearchResponse {
  groups: Array<{ applicationId: string; label: string; items: WorkItem[] }>;
  totalCount: number;
  sourceStatus: SourceStatus[];
  exactMatch?: WorkItem;                     // identifier match is ranked first
  correlationId: string;
}
```

**The partial-failure contract, stated once and applied everywhere.** `GET /api/work-items` returns **200 whenever at least one source succeeded**. Failed sources appear in `sourceStatus[]` with `status: 'DOWN'` and the exact `Y2 §8` copy — *"Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date."* The omitted count comes from `hub.work_item_counts_cache`; when no prior count exists, the copy drops the number rather than guessing. Only when **every** source fails does the queue render the all-unavailable empty state — and even then it is a 200 with a designed state, never a 500 (`FR-F19-04` rule 3).

A dashboard responds 200 whenever the shell can be built; widget failures live in `widget.state`, not in the HTTP status.

---

### 6.6 Work Items

| Method | Path | Permission | Audit |
|---|---|---|---|
| GET | `/api/work-items/{workItemId}` | `WORK_ITEM.READ` | Yes (`WORK_ITEM_VIEWED`) |
| GET | `/api/work-items/{workItemId}/actions` | `WORK_ITEM.READ` | No |
| POST | `/api/work-items/{workItemId}/actions/{actionId}` | `WORK_ITEM.ACT` | Yes (action-specific) |
| GET | `/api/work-items/{workItemId}/activity` | `WORK_ITEM.READ` | No |
| GET | `/api/work-items/{workItemId}/related` | `WORK_ITEM.READ` | Yes (`RELATED_ITEMS_RESOLVED`) |

`workItemId` is `{sourceSystem}:{nativeId}` — e.g. `PVQ:ISS-2207`.

```ts
export interface WorkItemDetailResponse {
  item: WorkItem;
  typeSpecificDetail: Record<string, unknown>;   // rendered by workItemTypes[].contentProfile
  availableActions: ActionDescriptor[];          // SERVER-computed; spoke state ∩ role ∩ attributes
  relatedRefs: ResolvedRelatedRef[];
  breadcrumbTrail: Breadcrumb[];                 // server-provided; the client never invents labels
  stateVersion: string;
  sourceHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  syntheticMarker: 'DEMO-SYNTHETIC';
}

export interface ResolvedRelatedRef extends RelatedRef {
  targetSystemLabel: string;
  targetWorkItemId: string | null;              // null when the target system is unregistered
  summary?: { title: string; statusLabel: string; lastActivityAt: string };
  unresolvableReason?: string;                  // exact copy from Y2 §8
}

export interface PerformActionRequest {
  stateVersion: string;                         // optimistic concurrency → 409 STATE_CONFLICT
  idempotencyKey: string;                       // ULID
  payload: Record<string, unknown>;             // validated against ActionDescriptor.formSchema
}
export interface PerformActionResponse {
  item: WorkItem;                               // post-write state, re-read from the spoke
  stateVersion: string;
  message: string;                              // "Issue ISS-2207 marked Resolved — Substantiated in PVQ."
  targetSystems: string[];
  correlationId: string;
}

export interface ActivityResponse {
  events: ActivityEvent[];                      // hub audit records MERGED with spoke history
  page: number; pageSize: number; hasNext: boolean;
  spokeHistoryAvailable: boolean;               // false => "Detailed history isn't available from {System}."
  message?: string;
}
```

Errors: `403 AUTHZ_DENIED` (**also returned for a non-existent item** — byte-identical body, response time normalized to a 120 ms floor, so existence cannot be enumerated), `409 APPLICATION_DISABLED`, `409 ACTION_NOT_AVAILABLE`, `409 STATE_CONFLICT`, `422 UPSTREAM_REJECTED_ACTION`, `500 AUDIT_WRITE_FAILED`, `502 UPSTREAM_CONTRACT_ERROR`, `502 UPSTREAM_INDETERMINATE`, `503 UPSTREAM_UNAVAILABLE`.

---

### 6.7 Orchestration — the Flagship Endpoint

| Method | Path | Permission | Audit |
|---|---|---|---|
| POST | `/api/orchestration/resolve-pvq-issue` | `ISSUE.RESOLVE` | Yes (chain of ≥5 records) |
| GET | `/api/orchestration/{transactionId}` | owner or `ADMIN.*` | No |
| POST | `/api/orchestration/{transactionId}/retry` | owner or `ADMIN.*` | Yes (`ORCHESTRATION_RETRY_ATTEMPTED`) |

```ts
export interface ResolvePvqIssueRequest {
  issueId: string;                     // 'PVQ:ISS-2207'
  parentCaseId: string;                // 'EAPP:CASE-A-1042'
  disposition: 'SUBSTANTIATED' | 'UNSUBSTANTIATED'
             | 'RESOLVED_WITH_CLARIFICATION' | 'REFERRED_FOR_FURTHER_REVIEW';
  resolutionNarrative: string;         // 20–4000 chars
  reviewedAnswerConfirmed: true;       // an explicit affirmation, not a default
  stateVersion: string;
  idempotencyKey: string;
}

export interface OrchestrationResult {
  transactionId: string;
  correlationId: string;
  overallOutcome: 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED'
                | 'INDETERMINATE' | 'NEEDS_ATTENTION';
  systems: Array<{
    applicationId: string;
    label: string;
    outcome: 'COMMITTED' | 'FAILED' | 'NOT_ATTEMPTED' | 'UNCONFIRMED';
    requested: string;                 // "Resolve issue as Substantiated"
    stateBefore: string;               // "Open"
    stateAfter: string;                // "Resolved — Substantiated"
    readBackAt: string | null;         // timestamp of the INDEPENDENT re-read
    message: string | null;
  }>;
  retry: { available: boolean; endpoint: string } | null;
}
```

**HTTP status carries the semantics.** `200` means both legs committed. **`207` means partial completion** — and the word "success" appears nowhere in a 207 response or in the page rendered from it, asserted by test (`Y2 §5` rule, `R-06`). `403` means at least one leg was unauthorized and therefore **nothing was written**. `503` means a pre-flight health check refused the orchestration before any write. `504` means the 15-second budget expired and the user is told to check current state rather than assume.

`systems[].stateAfter` is populated from a **fresh independent re-read of each spoke after finalization** — the confirmation screen reports observed state, not asserted state. That distinction is the difference between demonstrating a dual-system write and claiming one.

---

### 6.8 Notifications, Health, Admin, and Audit

| Method | Path | Permission | Audit |
|---|---|---|---|
| GET | `/api/notifications` | `DASHBOARD.READ` | No |
| POST | `/api/notifications/{alertId}/read` | `DASHBOARD.READ` | No |
| POST | `/api/notifications/read-all` | `DASHBOARD.READ` | No |
| POST | `/api/announcements/{id}/dismiss` | `DASHBOARD.READ` | No |
| GET | `/api/health/summary` | session | No |
| GET | `/api/admin/applications` | `ADMIN.APP.LIST` | No |
| GET | `/api/admin/applications/{id}` | `ADMIN.APP.READ` | No |
| POST | `/api/admin/applications` | `ADMIN.APP.REGISTER` | Yes (`APPLICATION_REGISTERED`) |
| PATCH | `/api/admin/applications/{id}` | `ADMIN.APP.EDIT` / `.DISABLE` | Yes |
| DELETE | `/api/admin/applications/{id}` | `ADMIN.APP.DEREGISTER` | Yes (`APPLICATION_DEREGISTERED`) |
| POST | `/api/admin/applications/test-connection` | `ADMIN.APP.REGISTER` | No |
| POST | `/api/admin/applications/{id}/probe` | `ADMIN.HEALTH.PROBE` | Yes (`APPLICATION_PROBED`) |
| GET | `/api/admin/health` | `ADMIN.HEALTH.READ` | No |
| GET | `/api/admin/integration-issues` | `ADMIN.ISSUES.READ` | No |
| GET | `/api/admin/users` · `/{id}` | `ADMIN.USER.READ` | Yes (`USER_VIEWED`) |
| GET | `/api/admin/status` | `ADMIN.HEALTH.READ` | No |
| POST | `/api/admin/failure-injection` | `ADMIN.FAILURE_INJECTION.SET` | Yes |
| POST | `/api/admin/operator-token` | `ADMIN.HEALTH.READ` | Yes (`OPERATOR_TOKEN_ISSUED`) |
| POST | `/api/admin/reset` | `ADMIN.HEALTH.PROBE` | Yes (`DEMO_RESET_PERFORMED`) |
| GET/POST/PATCH/DELETE | `/api/admin/announcements[/{id}]` | `ADMIN.ANNOUNCEMENT.*` | Yes |
| GET | `/api/audit` | `AUDIT.READ_OWN` / `.READ_ALL` | Yes (`AUDIT_VIEWED`) |
| GET | `/api/audit/{auditId}` | scoped | No |
| GET | `/api/audit/chain/{correlationId}` | scoped | No |
| GET | `/api/audit/export` | scoped | Yes (`AUDIT_EXPORTED`) |
| GET | `/api/audit/integrity` | `AUDIT.READ_ALL` | No |
| GET | `/api/docs` · `/api/docs/openapi.json` | `ADMIN.APP.LIST` | No |

**There is no `PUT`, `PATCH`, or `DELETE` anywhere under `/api/audit`.** Route enumeration asserts the absence, and the database grant makes the absence structural rather than merely observed (`FR-F13-03` rules 1–2).

```ts
export interface HealthSummaryResponse {
  applications: Array<{
    applicationId: string; displayName: string;
    status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    lastCheckedAt: string | null; latencyMs: number | null;
    message: string | null;
    circuitState?: 'CLOSED' | 'OPEN' | 'HALF_OPEN';   // ADMINISTRATORS ONLY
  }>;
  degradedCount: number; downCount: number; checkedAt: string;
}

/** Always HTTP 200. The outcome lives in `result`, because a failed connection test is a
 *  normal, expected, informative result — not an error the form should blow up on. */
export interface TestConnectionResponse {
  result: 'PASS' | 'WARNING' | 'FAIL';
  checks: Array<{ checkId: string; label: string;
                  status: 'PASS'|'WARNING'|'FAIL'; detail: string }>;
  describe?: DescribeResult;           // pre-populates the capabilities step of SCR-28
  durationMs: number;
}

export interface FailureInjectionRequest {
  applicationId: string;
  mode: 'NORMAL' | 'UNAVAILABLE' | 'SLOW' | 'ERROR';
  slowMs?: number;                     // 100–30000
  errorRatePct?: number;               // 1–100
  durationSec?: number;                // 10–1800, default 300; auto-clears
}

export interface AuditRecordView {
  auditId: string; sequenceNumber: number; occurredAt: string;
  actorPrincipalId: string | null; actorDisplayName: string | null;
  actorRolesAtAction: RoleId[] | null; actorActiveRoleAtAction: RoleId | null;
  actorAttributesAtAction: Record<string, unknown> | null;   // snapshot AT THE TIME OF ACTION
  actionType: string;
  targetSystem: string; targetSystemDisplayName: string;
  targetResourceType: string | null; targetResourceId: string | null;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'PARTIAL';
  reasonCode: string | null; policyRuleId: string | null;    // e.g. 'ATTR-INV-03'
  beforeSummary: string | null; afterSummary: string | null;
  correlationId: string; requestId: string; adapterRequestId: string | null;
  sessionId: string | null; identityMethod: string | null;
  recordHash: string; previousRecordHash: string;
}

export interface AuditChainResponse {
  correlationId: string;
  summary: string;   // "Investigator Marcus Vale resolved PVQ issue ISS-2207 against
                     //  eApp case A-1042 on 14 Sep 2026. Both systems updated."
  records: AuditRecordView[];
  redactedCount: number;               // other actors' records shown as placeholders, not omitted
}

export interface AuditIntegrityResponse {
  verified: boolean; recordsChecked: number;
  firstBrokenSequence: number | null; checkedAt: string;
}
```

---

### 6.9 Cross-Cutting API Rules

| Rule | Implementation |
|---|---|
| Reserved fields rejected | `role`, `roles`, `activeRole`, `principalId`, `entitlements`, `scope` in body or query → `400 VALIDATION_FAILED`, no privilege effect. A latent bypass is prevented by refusing the input rather than by remembering to ignore it. |
| Unknown fields rejected | `additionalProperties: false` on every request schema. Ignoring unknown fields hides client/server drift. |
| Denials non-enumerable | Forbidden and non-existent resources return byte-identical bodies (modulo `correlationId`), with response time normalized to a 120 ms floor. |
| Correlation propagation | A client-supplied `X-Correlation-Id` matching `^[0-9A-HJKMNP-TV-Z]{26}$` is adopted; anything else is ignored and a fresh ULID generated. This is how the UI ties the multi-request flagship workflow into one audit chain. |
| Idempotency | Mutations carry `X-Idempotency-Key`; hub replays the stored response for a repeated key, and `409` on the same key with a different payload. |
| Rate limits | 20 auth attempts / IP / 5 min; 60 mutations / session / min; 600 reads / session / min. Set generously enough that no scripted demo path can trip them. |
| Never a framework error page | Any uncaught exception becomes `500 INTERNAL_ERROR` in the standard envelope; the stack is logged server-side only. |
| OpenAPI is generated | `@fastify/swagger` reads the same TypeBox schemas; CI fails if a route lacks documentation or documents a schema the implementation does not match. |

---
