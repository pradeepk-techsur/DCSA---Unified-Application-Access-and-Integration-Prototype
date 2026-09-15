## 5. The Adapter Seam

This is the primary architectural deliverable. Everything else in this prototype could be rebuilt in a different framework; the claim that survives is *"onboarding the sixth application is a configuration change, not a code change,"* and the adapter seam is the only thing that makes that claim true.

The seam has three parts, and all three must hold:

1. **A compiler-checked interface** every adapter implements identically (`packages/adapter-contract`).
2. **A shared runtime** that applies deadline, retry, backoff, circuit-breaking, normalization validation, and error classification *outside* every adapter, so those behaviors cannot be implemented differently six times (`packages/adapter-runtime`).
3. **A registry record** that supplies each adapter's endpoint, policy, capabilities, and role visibility as data, so adding an application inserts a row rather than editing a file (`hub.registered_applications`).

---

### 5.1 `packages/adapter-contract` — The Interface

```ts
// packages/adapter-contract/src/types.ts
// The complete vocabulary of the hub↔spoke boundary. Nothing else crosses it.

export type StatusCategory = 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'CLOSED';
export type Priority       = 'ROUTINE' | 'ELEVATED' | 'URGENT';
export type HealthStatus   = 'HEALTHY' | 'DEGRADED' | 'DOWN';
export type RoleId = 'INVESTIGATOR' | 'ADJUDICATOR' | 'APPLICANT' | 'ADMINISTRATOR';

/** Resolved server-side from the session. Never constructed from client input. */
export interface Principal {
  principalId: string;                 // ULID
  displayName: string;
  identityMethod: 'CAC_PIV' | 'ECA' | 'GENERIC_MFA';
  roles: RoleId[];
  activeRole: RoleId;
  attributes: {
    organization: string;
    clearanceTier: 'T1' | 'T3' | 'T5';
    assignedRegion: string;
    caseAssignments: string[];         // hub-side only; NEVER sent to a spoke
    subjectRef: string | null;         // non-null only for APPLICANT
  };
  sessionId: string;
  issuedAt: string;                    // ISO-8601 UTC
  expiresAt: string;
}

/** Mandatory on every read. Absence is a programming error, never a permissive default. */
export type Scope =
  | { mode: 'SUBJECT';            subjectRef: string }
  | { mode: 'ASSIGNEE_OR_UNIT';   principalId: string; organization: string; assignedRegion: string }
  | { mode: 'ORG';                organization: string }
  | { mode: 'NONE' };               // ADMINISTRATOR: platform resources only, no work items

/** Passed to every operation. Constructed only by the scoped spoke-query wrapper. */
export interface AdapterContext {
  principal: Principal;
  scope: Scope;
  correlationId: string;               // ULID, one per user action
  requestId: string;                   // ULID, unique per adapter call
  deadlineAt: string;                  // absolute ISO-8601; the adapter MUST abort at it
  idempotencyKey?: string;             // present on every mutating call
  contextHandle?: string;              // when the spoke declares supportsContext
}

export interface RelatedRef {
  relationshipType:
    | 'HAS_ISSUE' | 'ISSUE_AGAINST' | 'HAS_DESIGNATION' | 'DESIGNATION_FOR'
    | 'ASSIGNED_CASE' | 'CASE_ASSIGNMENT_FOR' | 'HAS_NOTICE' | 'NOTICE_FOR';
  targetSystem: string;                // registry applicationId
  targetNativeId: string;              // OPAQUE. The adapter never resolves this.
  label: string;                       // "Issue raised against Section 13A employment history"
  contextHint: string | null;          // "SECTION_13A.employer[0].endDate"
  resolvable: boolean;                 // set by the HUB after lookup, not by the adapter
}

export interface WorkItem {
  workItemId: string;                  // `${sourceSystem}:${nativeId}` — composed by the adapter
  nativeId: string;
  sourceSystem: string;
  sourceSystemLabel: string;
  subjectRef: string;
  subjectDisplayName: string;
  type: string;                        // registry-declared work-item type
  typeLabel: string;
  title: string;                       // <= 120 chars
  status: string;                      // spoke-native status, preserved verbatim
  statusLabel: string;
  statusCategory: StatusCategory;      // via describe().workItemTypes[].statusMap
  priority: Priority;                  // normalized; ROUTINE when priorityNative is false
  priorityProvided: boolean;           // false lets the UI say "not provided by {System}"
  assigneeId: string | null;
  assigneeDisplayName: string | null;
  assigneeResolvable: boolean;         // false => "assigned to someone we can't resolve"
  createdAt: string;
  dueDate: string | null;
  lastActivityAt: string;
  overdue: boolean;                    // computed hub-side from dueDate + statusCategory
  relatedRefs: RelatedRef[];
  sourceHealth: HealthStatus;          // stamped by the runtime, not the adapter
}

export interface ActionFormField {
  fieldId: string;
  label: string;
  control: 'text' | 'textarea' | 'radio' | 'select' | 'checkbox' | 'date';
  required: boolean;
  hint?: string;
  options?: Array<{ value: string; label: string; hint?: string }>;
  minLength?: number;
  maxLength?: number;
  requiredMessage: string;             // exact copy from Y2; client and server use the same string
}

export interface ActionDescriptor {
  actionId: string;                    // 'RESOLVE_ISSUE'
  label: string;
  description: string;
  enabled: boolean;
  disabledReason: string | null;       // plain language, shown next to the disabled control
  confirmationRequired: boolean;
  formSchema: { fields: ActionFormField[] } | null;
  targetSystems: string[];             // length > 1 means orchestrated
}

export interface ActivityEvent {
  eventId: string;
  occurredAt: string;
  origin: 'HUB' | 'SPOKE';
  sourceSystem: string;
  actorDisplayName: string;
  actorRole: string | null;
  action: string;
  summary: string;
  correlationId: string | null;
}
```

```ts
// packages/adapter-contract/src/describe.ts

export interface WorkItemTypeDescriptor {
  type: string;
  label: string;
  contentProfile: string;                     // drives detail rendering; e.g. 'ISSUE_DETAIL'
  statusMap: Record<string, StatusCategory>;  // MUST map EVERY native status the spoke can emit
  priorityNative: boolean;
}

export interface ActionDescriptorDeclaration {
  actionId: string;
  label: string;
  appliesToTypes: string[];
  requiredPermission: string;                 // MUST exist in hub.permissions
  formSchema: { fields: ActionFormField[] } | null;
  targetSystems: string[];
  idempotent: boolean;
}

export interface Capabilities {
  supportsSearch: boolean;
  supportsFilter: string[];
  supportsContext: boolean;
  supportsSummary: boolean;
  supportsActivityHistory: boolean;
  maxPageSize: number;
}

export interface DescribeResult {
  applicationId: string;                      // ^[A-Z][A-Z0-9_]{1,15}$
  displayName: string;
  adapterVersion: string;
  contractVersion: string;                    // checked against the hub's supported set
  workItemTypes: WorkItemTypeDescriptor[];
  actions: ActionDescriptorDeclaration[];
  capabilities: Capabilities;
  relationshipTypesEmitted: RelatedRef['relationshipType'][];
  iconToken: string;                          // a token NAME — never a color, never a URL
}

export interface HealthResult {
  status: HealthStatus;
  latencyMs: number;
  checkedAt: string;
  version: string;
  detail?: string;
}
```

```ts
// packages/adapter-contract/src/errors.ts
// The CLOSED error taxonomy. Every hub-side handling decision keys off `class`.

export type AdapterErrorClass =
  | 'ADAPTER_UNREACHABLE'           // refused / DNS / TLS — retryable
  | 'ADAPTER_TIMEOUT'               // deadline exceeded — retryable for reads ONLY
  | 'ADAPTER_CIRCUIT_OPEN'          // hub declined to call a failing spoke — auto-recovers
  | 'ADAPTER_INDETERMINATE'         // mutating call may or may not have applied — user decides
  | 'ADAPTER_REJECTED'              // business rejection; plainMessage is user-safe
  | 'ADAPTER_NOT_FOUND'             // unknown native id — becomes a 403, non-enumerable
  | 'ADAPTER_FORBIDDEN'             // spoke denied this principal
  | 'ADAPTER_PRINCIPAL_REJECTED'    // assertion invalid / wrong audience / expired
  | 'ADAPTER_CONTRACT_ERROR'        // response failed schema validation
  | 'ADAPTER_SCOPE_VIOLATION'       // spoke returned out-of-scope data
  | 'ADAPTER_RATE_LIMITED'
  | 'ADAPTER_CONTRACT_UNSUPPORTED'
  | 'ADAPTER_INTERNAL';

export class AdapterError extends Error {
  constructor(readonly detail: {
    class: AdapterErrorClass;
    applicationId: string;
    operation: AdapterOperation;
    correlationId: string;
    requestId: string;
    retryable: boolean;
    httpStatusFromSpoke?: number;
    /** The ONLY spoke-supplied text ever shown to a user, and only for ADAPTER_REJECTED.
     *  Capped at 200 chars, HTML-escaped, stripped of identifier/stack patterns. */
    plainMessage?: string;
    retryAfterSeconds?: number;
    internalDetail?: string;          // goes to integration_issues, never to the UI
  }) { super(detail.class); }
}
```

```ts
// packages/adapter-contract/src/adapter.ts
// THE CONTRACT. Eight operations. Nothing else may be called on an adapter.

export type AdapterOperation =
  | 'describe' | 'healthCheck' | 'listWorkItems' | 'getWorkItem'
  | 'getWorkItemSummary' | 'performAction' | 'getActivityHistory' | 'context';

export interface ListFilters {
  statusCategory?: StatusCategory[];
  priority?: Priority[];
  type?: string[];
  assignee?: string;                   // 'me' | 'unassigned' | principalId
  dueFrom?: string;
  dueTo?: string;
  q?: string;
}
export interface Paging { limit: number; cursor?: string }

export interface ListResult {
  items: WorkItem[];
  nextCursor: string | null;
  totalKnown: number | null;           // null => UI says "Showing n items", not "n of N"
  truncated: boolean;
}

export interface GetResult {
  item: WorkItem;
  typeSpecificDetail: Record<string, unknown>;
  availableActions: ActionDescriptor[];   // the SPOKE's view of STATE validity only
  relatedRefs: RelatedRef[];
  stateVersion: string;
  activitySupported: boolean;
}

export interface SummaryResult {
  nativeId: string; title: string; status: string; statusLabel: string;
  statusCategory: StatusCategory; subjectRef: string; lastActivityAt: string;
}

export interface ActionResult {
  outcome: 'APPLIED' | 'REJECTED';
  newState: WorkItem;                  // the spoke's POST-WRITE state, re-read if necessary
  stateVersion: string;
  appliedAt: string;
  rejectionReason?: { code: string; plainMessage: string };
}

export interface HistoryResult { events: ActivityEvent[]; nextCursor: string | null }

/**
 * Every spoke integration implements this interface, identically.
 *
 * Invariants enforced by the conformance suite (FR-F08a-08):
 *  - Every method returns a typed result or throws AdapterError. Never an untyped throw.
 *  - Every method honours ctx.deadlineAt and aborts its in-flight call at it.
 *  - Non-mutating methods are side-effect free in the spoke.
 *  - performAction passes ctx.idempotencyKey as X-UAL-Idempotency-Key.
 *  - An adapter NEVER calls another adapter, reads another spoke, or touches the hub database.
 *  - Optional methods are present iff declared in describe().capabilities.
 */
export interface SpokeAdapter {
  readonly applicationId: string;
  readonly adapterType: string;        // 'REST_JSON_V1'

  describe(): Promise<DescribeResult>;
  healthCheck(): Promise<HealthResult>;

  listWorkItems(ctx: AdapterContext, filters: ListFilters, paging: Paging): Promise<ListResult>;
  getWorkItem(ctx: AdapterContext, nativeId: string): Promise<GetResult>;

  /** Optional — capabilities.supportsSummary. Hub falls back to getWorkItem when absent. */
  getWorkItemSummary?(ctx: AdapterContext, nativeId: string): Promise<SummaryResult>;

  /** The only mutating operation. */
  performAction(
    ctx: AdapterContext, nativeId: string, actionId: string, payload: Record<string, unknown>,
  ): Promise<ActionResult>;

  /** Optional — capabilities.supportsActivityHistory. */
  getActivityHistory?(ctx: AdapterContext, nativeId: string, paging: Paging): Promise<HistoryResult>;

  /** Optional pair — capabilities.supportsContext. */
  establishContext?(ctx: AdapterContext): Promise<{ contextHandle: string }>;
  revokeContext?(ctx: AdapterContext, handle: string): Promise<void>;
}
```

**The two subtle rules worth restating, because getting either wrong collapses the design:**

- **`availableActions` from the spoke is about *state*, never about *authorization*.** The spoke says "this issue is open, so it can be resolved." The hub then intersects that with the role matrix, the attribute rules, and the ownership predicate. The spoke never has the last word on who may act (`FR-F08a-03` rule 1).
- **A business rejection is a `Promise` that resolves, not one that throws.** `ActionResult.outcome === 'REJECTED'` carries a user-safe `plainMessage`; a transport failure throws `AdapterError`. Conflating those two is what produces error messages like *"Request failed"* in place of *"This issue has already been resolved."* The contract keeps them apart at the type level (`FR-F08a-04` rule 1).

---

### 5.2 `packages/adapter-runtime` — Policy Applied Outside Every Adapter

Resilience is implemented **once**, around the adapter, rather than six times inside adapters. An adapter that forgets to retry cannot exist, because adapters do not retry.

```ts
// packages/adapter-runtime/src/invoke.ts

export async function invoke<Op extends AdapterOperation>(
  adapter: SpokeAdapter, operation: Op, args: AdapterArgs<Op>, ctx: AdapterContext,
): Promise<AdapterResult<Op>> {
  const cfg = registry.policyFor(adapter.applicationId);   // all bounds from the registry row
  const mutating = operation === 'performAction';

  // 1. Circuit gate — healthCheck is exempt, so recovery stays detectable (FR-F08a-05 rule 5).
  if (operation !== 'healthCheck' && circuit.isOpen(adapter.applicationId)) {
    throw adapterError('ADAPTER_CIRCUIT_OPEN', { retryable: false, ...ctx });
  }

  const maxAttempts = mutating ? 1 : cfg.maxRetries + 1;   // performAction is never auto-retried
  let attempt = 0;

  while (true) {
    attempt++;
    const budgetMs = Date.parse(ctx.deadlineAt) - Date.now();
    if (budgetMs <= 0) throw adapterError('ADAPTER_TIMEOUT', { retryable: false, ...ctx });

    try {
      const started = performance.now();
      const result = await (adapter[operation] as Fn)(ctx, ...argsOf(args));
      const latencyMs = performance.now() - started;

      validateAgainstSchema(operation, result, adapter.applicationId);  // → ADAPTER_CONTRACT_ERROR
      circuit.recordSuccess(adapter.applicationId);
      adapterLog.info({ ...ctx, operation, outcome: 'SUCCESS', latencyMs, attempt });
      return result;

    } catch (err) {
      const ae = classify(err, adapter.applicationId, operation, ctx, mutating);

      // A mutating timeout becomes INDETERMINATE: outcome unknown, decision passes to
      // the orchestration engine or the user. Auto-retry here would risk double-applying.
      if (mutating && ae.detail.class === 'ADAPTER_TIMEOUT') {
        ae.detail.class = 'ADAPTER_INDETERMINATE';
        ae.detail.retryable = false;
      }

      circuit.recordFailure(adapter.applicationId, ae);
      if (shouldRecordIssue(ae)) integrationIssues.record(ae, ctx);  // not for NOT_FOUND/REJECTED

      const retryable = ae.detail.retryable && attempt < maxAttempts;
      const delay = backoffDelay(cfg, attempt);                       // ± jitterPct
      const fitsInBudget = Date.now() + delay < Date.parse(ctx.deadlineAt);
      if (!retryable || !fitsInBudget) throw ae;                      // never retry past the deadline
      await sleep(delay);
    }
  }
}
```

**Circuit state machine** (`packages/adapter-runtime/src/circuit.ts`), one instance per `applicationId`, state persisted in `hub.application_health`:

```
                 consecutiveFailures >= circuitFailureThreshold
   ┌────────┐ ───────────────────────────────────────────────▶ ┌──────┐
   │ CLOSED │                                                   │ OPEN │
   └────────┘ ◀─────────────────────────────────────────────── └──────┘
        ▲            probe success (circuitHalfOpenProbes)          │
        │                                                           │ after circuitOpenMs
        │            ┌───────────┐                                  │
        └─────────── │ HALF_OPEN │ ◀────────────────────────────────┘
          success    └───────────┘   admits circuitHalfOpenProbes calls
                           │
                           └─── failure ──▶ OPEN, timer reset

   healthCheck() BYPASSES this machine entirely in every state.
   Every transition writes an integration_issues row and is visible in the admin console.
```

Defaults from the registry: threshold 5, open 30 000 ms, half-open probes 1. Each is per-application and adjustable without a deployment.

---

### 5.3 Concrete Implementation Sketch: the PVQ Adapter

All six demo adapters are instances of one `adapterType`, `REST_JSON_V1`, configured by their registry row. A genuinely different backend (SOAP, a file drop, a message queue) would add a second `adapterType` implementing the same interface; the hub instantiates by type and knows nothing else about it.

```ts
// packages/adapter-rest-json-v1/src/adapter.ts  (abridged to the flagship path)

export class RestJsonV1Adapter implements SpokeAdapter {
  constructor(
    readonly applicationId: string,
    private readonly cfg: RegistryRow,
    private readonly assertions: AssertionMinter,   // Ed25519, audience-bound
  ) {}
  readonly adapterType = 'REST_JSON_V1';

  // ---- transport: the ONE place this package speaks HTTP -------------------
  private async call<T>(
    ctx: AdapterContext, method: 'GET' | 'POST', path: string,
    opts: { body?: unknown; scoped?: boolean } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'X-UAL-Principal':      await this.assertions.mint(ctx.principal, this.applicationId, ctx),
      'X-UAL-Correlation-Id': ctx.correlationId,
      'X-UAL-Request-Id':     ctx.requestId,
      'X-UAL-Deadline':       ctx.deadlineAt,
      'X-UAL-Adapter-Version': ADAPTER_VERSION,
    };
    // Scope is MANDATORY on reads. The hub refuses to issue an unscoped call, and the
    // spoke refuses to serve one. Two independent refusals, deliberately redundant.
    if (opts.scoped) headers['X-UAL-Scope'] = JSON.stringify(ctx.scope);
    if (ctx.idempotencyKey) headers['X-UAL-Idempotency-Key'] = ctx.idempotencyKey;
    if (opts.body) headers['Content-Type'] = 'application/json';

    const res = await fetch(new URL(path, this.cfg.baseEndpoint), {
      method, headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      // Absolute deadline, enforced at the socket. An adapter that ignored its deadline
      // would still be cut off by the runtime's own budget check.
      signal: AbortSignal.timeout(Math.max(0, Date.parse(ctx.deadlineAt) - Date.now())),
    });
    if (!res.ok) throw await this.toAdapterError(res, ctx);
    return res.json() as Promise<T>;
  }

  // ---- metadata -----------------------------------------------------------
  describe    = () => fetchJson<DescribeResult>(new URL('/describe', this.cfg.baseEndpoint));
  healthCheck = () => fetchJson<HealthResult>(this.cfg.healthEndpoint,
                                              { timeoutMs: this.cfg.healthTimeoutMs });

  // ---- reads --------------------------------------------------------------
  async listWorkItems(ctx: AdapterContext, f: ListFilters, p: Paging): Promise<ListResult> {
    const qs = this.pushDownFilters(f, p);      // advisory only; the hub re-applies (FR-F05-03)
    const raw = await this.call<PvqIssueListDto>(ctx, 'GET', `/issues?${qs}`, { scoped: true });

    const items: WorkItem[] = [];
    for (const dto of raw.items) {
      // Malformed rows are dropped INDIVIDUALLY. One bad record must not empty a queue.
      const mapped = this.normalizeIssue(dto);
      if (mapped.ok) items.push(mapped.value);
      else integrationIssues.record(contractError(mapped.reason, ctx, this.applicationId), ctx);
    }
    return { items, nextCursor: raw.nextCursor, totalKnown: raw.totalKnown, truncated: raw.truncated };
  }

  async getWorkItem(ctx: AdapterContext, nativeId: string): Promise<GetResult> {
    const dto = await this.call<PvqIssueDto>(ctx, 'GET', `/issues/${enc(nativeId)}`, { scoped: true });
    const mapped = this.normalizeIssue(dto);
    if (!mapped.ok) throw contractError(mapped.reason, ctx, this.applicationId);

    return {
      item: mapped.value,
      typeSpecificDetail: {
        answerLocus: dto.answerLocus,
        answerSectionLabel: dto.answerSectionLabel,
        answerSnapshot: dto.answerSnapshot,      // the quoted answer the investigator reviews
        description: dto.description,
      },
      // STATE validity only. The hub intersects this with role/attribute policy.
      availableActions: this.stateValidActions(dto),
      relatedRefs: [{
        relationshipType: 'ISSUE_AGAINST',
        targetSystem: dto.parentSystem,          // 'EAPP' — an OPAQUE string from PVQ's row
        targetNativeId: dto.parentCaseRef,       // 'CASE-A-1042' — never dereferenced here
        label: `Issue raised against ${dto.answerSectionLabel}`,
        contextHint: dto.answerLocus,
        resolvable: false,                       // only the HUB may set this true
      }],
      stateVersion: dto.stateVersion,
      activitySupported: true,
    };
  }

  // ---- the flagship write -------------------------------------------------
  async performAction(
    ctx: AdapterContext, nativeId: string, actionId: string, payload: Record<string, unknown>,
  ): Promise<ActionResult> {
    // Never invoke an action the spoke did not declare (FR-F08a-04 rule 4).
    if (!this.cfg.supportedActions.some(a => a.actionId === actionId)) {
      throw adapterError('ADAPTER_REJECTED', { ...ctx, plainMessage: undefined });
    }
    try {
      const res = await this.call<PvqActionDto>(
        ctx, 'POST', `/issues/${enc(nativeId)}/actions/${enc(actionId)}`,
        { body: payload },                      // idempotency key already on the header
      );
      const mapped = this.normalizeIssue(res.issue);
      if (!mapped.ok) throw contractError(mapped.reason, ctx, this.applicationId);
      return {
        outcome: 'APPLIED',
        newState: mapped.value,                 // the spoke's post-write state, not our projection
        stateVersion: res.stateVersion,
        appliedAt: res.appliedAt,
      };
    } catch (e) {
      // 422 is a BUSINESS rejection: it resolves with a user-safe message.
      // Everything else is a transport/availability failure and throws.
      if (isSpoke422(e)) {
        return {
          outcome: 'REJECTED',
          newState: await this.getWorkItem(ctx, nativeId).then(r => r.item),
          stateVersion: e.stateVersion,
          appliedAt: new Date().toISOString(),
          rejectionReason: { code: e.code, plainMessage: sanitize(e.message) },  // ≤200 chars, escaped
        };
      }
      throw e;
    }
  }

  // ---- normalization: the statusMap comes from describe(), never from code ----
  private normalizeIssue(dto: PvqIssueDto): Result<WorkItem> {
    const typeDesc = this.cfg.workItemTypes.find(t => t.type === 'PVQ_ISSUE')!;
    const category = typeDesc.statusMap[dto.status];
    // An unmapped native status is a CONFORMANCE FAILURE, not a silent default. Defaulting
    // here is how a queue quietly starts mis-filtering months later.
    if (!category) return err(`Unmapped status '${dto.status}' for PVQ_ISSUE`);

    return ok({
      workItemId: `${this.applicationId}:${dto.issueId}`,
      nativeId: dto.issueId,
      sourceSystem: this.applicationId,
      sourceSystemLabel: this.cfg.displayName,   // from the registry: renaming propagates everywhere
      subjectRef: dto.subjectRef,
      subjectDisplayName: dto.subjectDisplayName,
      type: 'PVQ_ISSUE',
      typeLabel: typeDesc.label,
      title: truncate(dto.title, 120),
      status: dto.status,
      statusLabel: humanize(dto.status),
      statusCategory: category,
      priority: typeDesc.priorityNative ? normalizePriority(dto.priority) : 'ROUTINE',
      priorityProvided: typeDesc.priorityNative,
      assigneeId: dto.assignedPrincipalId,
      assigneeDisplayName: dto.assignedDisplayName,
      assigneeResolvable: dto.assignedPrincipalId !== null,
      createdAt: dto.raisedAt,
      dueDate: dto.dueDate,
      lastActivityAt: dto.lastActivityAt,
      overdue: false,                            // computed hub-side against the seed reference date
      relatedRefs: [],
      sourceHealth: 'HEALTHY',                   // stamped by the runtime at fetch time
    });
  }
}
```

**What is not in this file, and must never be:** any call to another spoke, any database access, any retry loop, any circuit logic, any authorization decision, any hard-coded status default, and any user-facing string other than a sanitized `plainMessage` forwarded from the spoke.

---

### 5.4 The Registry Record — What Drives Dynamic Registration

This is the shape an administrator produces through SCR-28. Inserting it is the whole act of onboarding.

```ts
// packages/contracts/src/registry.ts

export interface RegistryRecord {
  // Identity — applicationId is IMMUTABLE after creation: workItemIds and audit
  // records already refer to it, and retired IDs are never reused.
  applicationId: string;               // ^[A-Z][A-Z0-9_]{1,15}$
  displayName: string;                 // 3–60 chars; appears on every badge, breadcrumb, error
  description?: string;
  iconToken: string;                   // token NAME, validated against the theme token set

  // Connection
  adapterType: 'REST_JSON_V1';         // resolvable implementation key
  baseEndpoint: string;
  healthEndpoint: string;
  contractVersion: string;             // populated from describe(); must be hub-supported

  // Capabilities — pre-populated from describe(), confirmed by the administrator
  workItemTypes: WorkItemTypeDescriptor[];
  supportedActions: ActionDescriptorDeclaration[];
  capabilities: Capabilities;
  relationshipTypesEmitted: string[];

  // Access — a RESTRICTION, never a grant. Role-matrix permissions still apply.
  visibleToRoles: RoleId[];            // length >= 1; nothing pre-checked on the form

  // Resilience policy — per application, never hard-coded per spoke
  timeoutMs: number;                   // 5000   [500, 30000]
  actionTimeoutMs: number;             // 10000  [1000, 30000]
  healthTimeoutMs: number;             // 2000   [500, 10000]
  maxRetries: number;                  // 2      [0, 5]
  backoffInitialMs: number;            // 200    [50, 5000]
  backoffMultiplier: number;           // 2.0    [1.0, 4.0]
  backoffJitterPct: number;            // 20     [0, 50]
  circuitFailureThreshold: number;     // 5      [2, 50]
  circuitOpenMs: number;               // 30000  [5000, 300000]
  circuitHalfOpenProbes: number;       // 1      [1, 5]
  healthProbeIntervalSec: number;      // 30     [10, 600]
  degradedLatencyMs: number;           // 1500

  // Lifecycle
  enabled: boolean;
  configState: 'VALID' | 'INVALID' | 'INCOMPATIBLE';
  configProblem?: string;
  isDemoSixthApp: boolean;
}
```

The CVS row an administrator creates live during the demo:

```jsonc
{
  "applicationId": "CVS",
  "displayName": "Continuous Vetting Service",
  "description": "Continuous evaluation alerts raised against cleared personnel.",
  "iconToken": "icon-shield-check",
  "adapterType": "REST_JSON_V1",
  "baseEndpoint": "http://ual-cvs:7106",
  "healthEndpoint": "http://ual-cvs:7106/health",
  "contractVersion": "1.0",                      // discovered by the live connection test
  "workItemTypes": [{                            // pre-filled from describe()
    "type": "CVS_ALERT", "label": "Continuous vetting alert",
    "contentProfile": "ALERT_DETAIL", "priorityNative": true,
    "statusMap": { "NEW": "OPEN", "UNDER_REVIEW": "IN_PROGRESS",
                   "CLEARED": "CLOSED", "ESCALATED": "BLOCKED" }
  }],
  "supportedActions": [
    { "actionId": "ACKNOWLEDGE_ALERT", "label": "Acknowledge alert",
      "appliesToTypes": ["CVS_ALERT"], "requiredPermission": "WORK_ITEM.ACT",
      "formSchema": null, "targetSystems": ["CVS"], "idempotent": true },
    { "actionId": "CLEAR_ALERT", "label": "Clear alert",
      "appliesToTypes": ["CVS_ALERT"], "requiredPermission": "WORK_ITEM.ACT",
      "formSchema": { "fields": [{ "fieldId": "reason", "label": "Reason for clearing",
                                   "control": "textarea", "required": true,
                                   "minLength": 10, "maxLength": 1000,
                                   "requiredMessage": "Enter a reason for clearing." }] },
      "targetSystems": ["CVS"], "idempotent": true }
  ],
  "capabilities": { "supportsSearch": true, "supportsFilter": ["status","priority"],
                    "supportsContext": false, "supportsSummary": true,
                    "supportsActivityHistory": true, "maxPageSize": 200 },
  "relationshipTypesEmitted": [],
  "visibleToRoles": ["INVESTIGATOR", "ADJUDICATOR"],
  "timeoutMs": 5000, "actionTimeoutMs": 10000, "healthTimeoutMs": 2000,
  "maxRetries": 2, "backoffInitialMs": 200, "backoffMultiplier": 2.0, "backoffJitterPct": 20,
  "circuitFailureThreshold": 5, "circuitOpenMs": 30000, "circuitHalfOpenProbes": 1,
  "healthProbeIntervalSec": 30, "degradedLatencyMs": 1500,
  "enabled": true, "configState": "VALID", "isDemoSixthApp": true
}
```

**Everything the hub does with CVS is derived from that row.** Work-queue fan-out reads `enabled` and `visibleToRoles`. Navigation reads `visibleToRoles` intersected with the role matrix. Badges read `displayName` and `iconToken`. Error messages substitute `displayName` for `{System}`. Timeouts, retries, and circuit thresholds read the policy fields. Available actions read `supportedActions` intersected with the role matrix and spoke state. Health probing reads `healthEndpoint` and `healthProbeIntervalSec`. Search fan-out reads `capabilities.supportsSearch`.

Not one of those behaviors consults a list in code, and a CI grep proves it: the literals `EAPP`, `IEP`, `PVQ`, `PDT`, `IM` appear nowhere in hub core outside seed data, tests, and adapter packages (`FR-F08b-02` rule 1).

---

### 5.5 Capability Negotiation

An application that supports less loses affordances, not usability. The hub degrades and *explains*; it never renders an empty region or a disabled control without a reason.

| Declared | Hub behavior | Copy shown |
|---|---|---|
| `supportsSearch: false` | Excluded from search fan-out | "{System} doesn't support search. Its items aren't included in these results." |
| `supportsActivityHistory: false` | Detail page renders hub audit records only | "Detailed history isn't available from {System}." |
| `supportsSummary: false` | Related-items panel calls `getWorkItem` with a larger timeout budget | — (invisible to the user) |
| `supportsContext: false` | Context establishment skipped entirely | — (invisible to the user) |
| No `actions` for a type | Read-only detail page with an explanatory note | "No actions are available for this item." |
| `priorityNative: false` | Priority normalizes to `ROUTINE`, `priorityProvided: false` | "Priority not provided by {System}" |
| No `dueDate` emitted | Nulls sort last regardless of direction | "No due date" |

Declared-but-unimplemented capabilities are caught by the conformance suite **before registration is permitted** (`FR-F08a-07` rule 6), so the negotiation cannot be quietly wrong.

---

### 5.6 Conformance Suite

`packages/conformance` is a standalone Vitest suite runnable against any adapter with one command:

```bash
./run.sh conformance --adapter=CVS --endpoint=http://localhost:7106
```

It asserts the ten items of `FR-F08a-08`: interface completeness, `describe()` schema validity with complete status maps and known permissions, normalization correctness, scope enforcement (subject A's scope returns zero of subject B's rows), deadline honouring (a 100 ms deadline aborts within 150 ms), the full error taxonomy under induced faults, idempotency, `stateVersion` progression, no cross-spoke outbound calls, and health semantics across stop/start.

Items 1, 2, and 6 additionally run **live during registration** (`FR-F12-04`), so a non-conformant application cannot be registered in the first place. That is what converts "onboarding is bounded" from an aspiration into a gate.

---
