// packages/adapter-rest-json-v1/src/adapter.ts
//
// The one adapterType every demo spoke uses. All demo spokes are instances of
// this ONE class, differing only in their registry row — which is precisely why
// onboarding a REST/JSON application costs ~0 adapter work (TechArch §17.6).
//
// What must NEVER be in this file: a call to another spoke, any database access,
// any retry loop, any circuit logic, any authorization decision, any hard-coded
// status default, and any user-facing string other than a sanitized plainMessage
// forwarded from the spoke. Endpoint mapping is registry-driven — no `switch` on
// application id, and no spoke-identifier literal appears here.

import {
  AdapterError,
  type SpokeAdapter,
  type AdapterContext,
  type ListFilters,
  type Paging,
  type ListResult,
  type GetResult,
  type SummaryResult,
  type ActionResult,
  type HistoryResult,
  type DescribeResult,
  type HealthResult,
  type ActionDescriptor,
  type RegistryRecord,
} from '@ual/adapter-contract';
import type { AssertionMinter } from '@ual/assertions';
import { normalizeRow, sanitize, humanize, type SpokeRowDto } from './normalize.js';

export const ADAPTER_VERSION = '1.0.0';

/** A recorder for the per-row contract errors dropped during a list. Plan 01-06
 *  wires the pg-backed IssueSink; here the adapter accepts any recorder. */
export interface RowIssueRecorder {
  record(err: AdapterError, ctx: AdapterContext): void;
}

const noopRowRecorder: RowIssueRecorder = { record() { /* empty */ } };

function enc(segment: string): string {
  return encodeURIComponent(segment);
}

/** Derive the collection path for a work-item type from its registry descriptor.
 *  Convention (registry-driven, not per-spoke code): the type descriptor's
 *  contentProfile names the surface; we lower-case the type to its REST plural.
 *  A future descriptor can carry an explicit `pathTemplate` and this reads it. */
function collectionPath(cfg: RegistryRecord): string {
  const first = cfg.workItemTypes[0];
  const profile = (first as { pathSegment?: string } | undefined)?.pathSegment;
  if (profile) return `/${profile.replace(/^\/+/, '')}`;
  // Fall back to the base endpoint's declared resource path: the registry row's
  // baseEndpoint already points at the collection root, so an empty segment
  // means "the collection is the base endpoint itself".
  return '';
}

/** A typed shape for a spoke error body. */
interface SpokeErrorBody { code?: string; message?: string; detail?: string }

export class RestJsonV1Adapter implements SpokeAdapter {
  readonly adapterType = 'REST_JSON_V1';

  constructor(
    readonly applicationId: string,
    private readonly cfg: RegistryRecord,
    private readonly assertions: AssertionMinter,
    private readonly rows: RowIssueRecorder = noopRowRecorder,
  ) {}

  // ---- transport: the ONE place this package speaks HTTP -------------------
  private async call<T>(
    ctx: AdapterContext,
    method: 'GET' | 'POST',
    path: string,
    opts: { body?: unknown; scoped?: boolean } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'X-UAL-Principal': await this.assertions.mint(ctx.principal, this.applicationId, ctx),
      'X-UAL-Correlation-Id': ctx.correlationId,
      'X-UAL-Request-Id': ctx.requestId,
      'X-UAL-Deadline': ctx.deadlineAt,
      'X-UAL-Adapter-Version': ADAPTER_VERSION,
    };
    // Scope is MANDATORY on reads. Two independent refusals, deliberately redundant.
    if (opts.scoped) headers['X-UAL-Scope'] = JSON.stringify(ctx.scope);
    if (ctx.idempotencyKey) headers['X-UAL-Idempotency-Key'] = ctx.idempotencyKey;
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

    const init: RequestInit = {
      method,
      headers,
      // Absolute deadline, enforced at the socket.
      signal: AbortSignal.timeout(Math.max(0, Date.parse(ctx.deadlineAt) - Date.now())),
    };
    if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
    const res = await fetch(new URL(path, this.cfg.baseEndpoint), init);
    if (!res.ok) throw await this.toAdapterError(res, ctx);
    return (await res.json()) as T;
  }

  private async toAdapterError(res: Response, ctx: AdapterContext): Promise<AdapterError> {
    let body: SpokeErrorBody = {};
    try { body = (await res.json()) as SpokeErrorBody; } catch { /* non-JSON body */ }

    // Map the spoke's HTTP status to a class; the runtime's classify() shares this
    // table, but the adapter throws a precise class so a caught error is authoritative.
    const status = res.status;
    let cls: AdapterError['detail']['class'];
    let retryable = false;
    let plainMessage: string | undefined;
    let retryAfterSeconds: number | undefined;

    if (status === 401) cls = 'ADAPTER_PRINCIPAL_REJECTED';
    else if (status === 403) cls = 'ADAPTER_FORBIDDEN';
    else if (status === 404) cls = 'ADAPTER_NOT_FOUND';
    else if (status === 409 || status === 422) {
      cls = 'ADAPTER_REJECTED';
      // 422/409 message is user-safe ONLY for a business rejection; performAction
      // reads it back off the thrown error. sanitize() is applied there.
      plainMessage = body.message;
    } else if (status === 429) {
      cls = 'ADAPTER_RATE_LIMITED';
      retryable = true;
      const ra = res.headers.get('retry-after');
      if (ra) retryAfterSeconds = Number(ra) || undefined;
    } else if (status === 502 || status === 503 || status === 504) {
      cls = 'ADAPTER_UNREACHABLE';
      retryable = true;
    } else if (status === 400 && body.code === 'SCOPE_REQUIRED') {
      cls = 'ADAPTER_CONTRACT_ERROR';
    } else {
      cls = status >= 500 ? 'ADAPTER_INTERNAL' : 'ADAPTER_REJECTED';
    }

    return new AdapterError({
      class: cls,
      applicationId: this.applicationId,
      operation: 'getWorkItem',
      correlationId: ctx.correlationId,
      requestId: ctx.requestId,
      retryable,
      httpStatusFromSpoke: status,
      ...(plainMessage !== undefined ? { plainMessage } : {}),
      ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
      ...(body.code !== undefined ? { internalDetail: `${body.code}: ${body.detail ?? body.message ?? ''}` } : {}),
    });
  }

  private contractError(reason: string, ctx: AdapterContext): AdapterError {
    return new AdapterError({
      class: 'ADAPTER_CONTRACT_ERROR',
      applicationId: this.applicationId,
      operation: 'getWorkItem',
      correlationId: ctx.correlationId,
      requestId: ctx.requestId,
      retryable: false,
      internalDetail: reason,
    });
  }

  // ---- metadata -----------------------------------------------------------
  async describe(): Promise<DescribeResult> {
    const res = await fetch(new URL('/describe', this.cfg.baseEndpoint));
    if (!res.ok) {
      throw new AdapterError({
        class: 'ADAPTER_UNREACHABLE', applicationId: this.applicationId, operation: 'describe',
        correlationId: 'describe', requestId: 'describe', retryable: true,
        httpStatusFromSpoke: res.status,
      });
    }
    return (await res.json()) as DescribeResult;
  }

  async healthCheck(): Promise<HealthResult> {
    const started = Date.now();
    const res = await fetch(this.cfg.healthEndpoint, {
      signal: AbortSignal.timeout(this.cfg.healthTimeoutMs),
    });
    if (!res.ok) {
      return { status: 'DOWN', latencyMs: Date.now() - started, checkedAt: new Date().toISOString(), version: 'unknown' };
    }
    const body = (await res.json()) as Partial<HealthResult>;
    return {
      status: body.status ?? 'HEALTHY',
      latencyMs: body.latencyMs ?? Date.now() - started,
      checkedAt: body.checkedAt ?? new Date().toISOString(),
      version: body.version ?? 'unknown',
      ...(body.detail !== undefined ? { detail: body.detail } : {}),
    };
  }

  // ---- reads --------------------------------------------------------------
  async listWorkItems(ctx: AdapterContext, f: ListFilters, p: Paging): Promise<ListResult> {
    const qs = this.pushDownFilters(f, p);      // advisory only; the hub re-applies (FR-F05-03)
    const base = collectionPath(this.cfg);
    const raw = await this.call<{
      items: SpokeRowDto[]; nextCursor: string | null; totalKnown: number | null; truncated: boolean;
    }>(ctx, 'GET', `${base}?${qs}`, { scoped: true });

    const items = [];
    for (const dto of raw.items) {
      // Malformed rows are dropped INDIVIDUALLY. One bad record must not empty a queue.
      const mapped = normalizeRow(this.cfg, dto);
      if (mapped.ok) items.push(mapped.value);
      else this.rows.record(this.contractError(mapped.reason, ctx), ctx);
    }
    return { items, nextCursor: raw.nextCursor, totalKnown: raw.totalKnown, truncated: raw.truncated };
  }

  async getWorkItem(ctx: AdapterContext, nativeId: string): Promise<GetResult> {
    const base = collectionPath(this.cfg);
    const dto = await this.call<SpokeRowDto & {
      typeSpecificDetail?: Record<string, unknown>;
      availableActions?: ActionDescriptor[];
      stateVersion: string;
      activitySupported?: boolean;
    }>(ctx, 'GET', `${base}/${enc(nativeId)}`, { scoped: true });

    const mapped = normalizeRow(this.cfg, dto);
    if (!mapped.ok) throw this.contractError(mapped.reason, ctx);

    return {
      item: mapped.value,
      typeSpecificDetail: dto.typeSpecificDetail ?? {},
      availableActions: dto.availableActions ?? [],   // STATE validity only; the hub intersects policy
      relatedRefs: [],                                // resolvable=false is the HUB's to set
      stateVersion: dto.stateVersion,
      activitySupported: dto.activitySupported ?? this.cfg.capabilities.supportsActivityHistory,
    };
  }

  async getWorkItemSummary(ctx: AdapterContext, nativeId: string): Promise<SummaryResult> {
    const base = collectionPath(this.cfg);
    const dto = await this.call<SpokeRowDto>(ctx, 'GET', `${base}/${enc(nativeId)}/summary`, { scoped: true });
    const typeDesc = this.cfg.workItemTypes.find((t) => t.type === dto.type);
    const category = typeDesc?.statusMap[dto.status];
    if (!category) throw this.contractError(`Unmapped status '${dto.status}'`, ctx);
    return {
      nativeId: dto.nativeId,
      title: dto.title,
      status: dto.status,
      statusLabel: humanize(dto.status),
      statusCategory: category,
      subjectRef: dto.subjectRef,
      lastActivityAt: dto.lastActivityAt,
    };
  }

  async getActivityHistory(ctx: AdapterContext, nativeId: string, p: Paging): Promise<HistoryResult> {
    const base = collectionPath(this.cfg);
    const cursor = p.cursor ? `&cursor=${enc(p.cursor)}` : '';
    return this.call<HistoryResult>(
      ctx, 'GET', `${base}/${enc(nativeId)}/activity?limit=${p.limit}${cursor}`, { scoped: true },
    );
  }

  // ---- the flagship write -------------------------------------------------
  async performAction(
    ctx: AdapterContext, nativeId: string, actionId: string, payload: Record<string, unknown>,
  ): Promise<ActionResult> {
    // Never invoke an action the spoke did not declare (FR-F08a-04 rule 4).
    if (!this.cfg.supportedActions.some((a) => a.actionId === actionId)) {
      throw new AdapterError({
        class: 'ADAPTER_REJECTED', applicationId: this.applicationId, operation: 'performAction',
        correlationId: ctx.correlationId, requestId: ctx.requestId, retryable: false,
        internalDetail: `Action '${actionId}' is not declared by ${this.applicationId}`,
      });
    }

    const base = collectionPath(this.cfg);
    try {
      const res = await this.call<{
        issue?: SpokeRowDto; item?: SpokeRowDto; stateVersion: string; appliedAt: string;
      }>(ctx, 'POST', `${base}/${enc(nativeId)}/actions/${enc(actionId)}`, { body: payload });

      const rowDto = res.item ?? res.issue;
      if (!rowDto) throw this.contractError('performAction response carried no post-write state', ctx);
      const mapped = normalizeRow(this.cfg, rowDto);
      if (!mapped.ok) throw this.contractError(mapped.reason, ctx);

      return {
        outcome: 'APPLIED',
        newState: mapped.value,                 // the spoke's post-write state, not our projection
        stateVersion: res.stateVersion,
        appliedAt: res.appliedAt,
      };
    } catch (e) {
      // 422 is a BUSINESS rejection: it RESOLVES with a user-safe message.
      // Everything else is a transport/availability failure and THROWS.
      if (e instanceof AdapterError && e.detail.httpStatusFromSpoke === 422) {
        const reRead = await this.getWorkItem(ctx, nativeId);
        return {
          outcome: 'REJECTED',
          newState: reRead.item,
          stateVersion: reRead.stateVersion,
          appliedAt: new Date().toISOString(),
          rejectionReason: {
            code: (e.detail.internalDetail ?? 'ACTION_REJECTED').split(':')[0] ?? 'ACTION_REJECTED',
            plainMessage: sanitize(e.detail.plainMessage ?? 'This action was rejected.'),
          },
        };
      }
      throw e;
    }
  }

  // ---- filter push-down: advisory only ------------------------------------
  private pushDownFilters(f: ListFilters, p: Paging): string {
    const params = new URLSearchParams();
    if (f.q) params.set('q', f.q);
    if (f.assignee) params.set('assignee', f.assignee);
    if (f.dueFrom) params.set('dueFrom', f.dueFrom);
    if (f.dueTo) params.set('dueTo', f.dueTo);
    if (f.statusCategory?.length) params.set('statusCategory', f.statusCategory.join(','));
    if (f.priority?.length) params.set('priority', f.priority.join(','));
    if (f.type?.length) params.set('type', f.type.join(','));
    params.set('limit', String(p.limit));
    if (p.cursor) params.set('cursor', p.cursor);
    return params.toString();
  }
}
