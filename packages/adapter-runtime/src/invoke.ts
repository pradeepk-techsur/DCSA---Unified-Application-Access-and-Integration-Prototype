// packages/adapter-runtime/src/invoke.ts
//
// Policy applied OUTSIDE every adapter. Resilience is implemented ONCE, around
// the adapter, rather than six times inside adapters: an adapter that forgets to
// retry cannot exist, because adapters do not retry. Transcribes the algorithm
// from TechArch/05-adapter-seam.md §5.2, including the reasoning comments.

import {
  AdapterError,
  type SpokeAdapter,
  type AdapterOperation,
  type AdapterContext,
  type RegistryRecord,
  type ListFilters,
  type Paging,
  type DescribeResult,
  type HealthResult,
  type ListResult,
  type GetResult,
  type SummaryResult,
  type ActionResult,
  type HistoryResult,
} from '@ual/adapter-contract';
import { Circuit } from './circuit.js';
import { classify } from './classify.js';
import { backoffDelay, defaultJitterSource, type JitterSource } from './backoff.js';
import { validateAgainstSchema } from './validate.js';
import { type IssueSink, shouldRecordIssue } from './issues.js';
import { adapterLog, type AdapterLogRecord } from './log.js';

/** Per-operation argument tuples (ctx is threaded separately). */
export type AdapterArgs<Op extends AdapterOperation> =
  Op extends 'describe' ? []
  : Op extends 'healthCheck' ? []
  : Op extends 'listWorkItems' ? [filters: ListFilters, paging: Paging]
  : Op extends 'getWorkItem' ? [nativeId: string]
  : Op extends 'getWorkItemSummary' ? [nativeId: string]
  : Op extends 'performAction' ? [nativeId: string, actionId: string, payload: Record<string, unknown>]
  : Op extends 'getActivityHistory' ? [nativeId: string, paging: Paging]
  : never;

export type AdapterResult<Op extends AdapterOperation> =
  Op extends 'describe' ? DescribeResult
  : Op extends 'healthCheck' ? HealthResult
  : Op extends 'listWorkItems' ? ListResult
  : Op extends 'getWorkItem' ? GetResult
  : Op extends 'getWorkItemSummary' ? SummaryResult
  : Op extends 'performAction' ? ActionResult
  : Op extends 'getActivityHistory' ? HistoryResult
  : never;

export interface AdapterRuntimeDeps {
  policy: RegistryRecord;
  circuit: Circuit;
  issues: IssueSink;
  jitter?: JitterSource;
  log?: (record: AdapterLogRecord) => void;
  /** Injectable sleep so tests do not wait real backoff delays. */
  sleep?: (ms: number) => Promise<void>;
}

export type AdapterRuntimeConfig = AdapterRuntimeDeps;

const realSleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

function timeoutError(
  applicationId: string,
  operation: AdapterOperation,
  ctx: AdapterContext,
): AdapterError {
  return new AdapterError({
    class: 'ADAPTER_TIMEOUT',
    applicationId,
    operation,
    correlationId: ctx.correlationId,
    requestId: ctx.requestId,
    retryable: false,
  });
}

function circuitOpenError(
  applicationId: string,
  operation: AdapterOperation,
  ctx: AdapterContext,
): AdapterError {
  return new AdapterError({
    class: 'ADAPTER_CIRCUIT_OPEN',
    applicationId,
    operation,
    correlationId: ctx.correlationId,
    requestId: ctx.requestId,
    retryable: false,
  });
}

export async function invoke<Op extends AdapterOperation>(
  adapter: SpokeAdapter,
  operation: Op,
  args: AdapterArgs<Op>,
  ctx: AdapterContext,
  deps: AdapterRuntimeDeps,
): Promise<AdapterResult<Op>> {
  const { policy: cfg, circuit, issues } = deps;
  const jitter = deps.jitter ?? defaultJitterSource;
  const sleep = deps.sleep ?? realSleep;
  const appId = adapter.applicationId;
  const mutating = operation === 'performAction';

  // 1. Circuit gate — healthCheck is EXEMPT in every state, so recovery stays
  //    detectable (FR-F08a-05 rule 5).
  if (operation !== 'healthCheck' && circuit.isOpen()) {
    throw circuitOpenError(appId, operation, ctx);
  }
  if (operation !== 'healthCheck') circuit.onDispatch();

  // performAction is NEVER auto-retried.
  const maxAttempts = mutating ? 1 : cfg.maxRetries + 1;
  let attempt = 0;

  for (;;) {
    attempt++;

    // 3. Per-attempt budget check against ctx.deadlineAt.
    const budgetMs = Date.parse(ctx.deadlineAt) - Date.now();
    if (budgetMs <= 0) throw timeoutError(appId, operation, ctx);

    try {
      const started = performance.now();
      const fn = (adapter as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>)[operation];
      if (typeof fn !== 'function') {
        throw new AdapterError({
          class: 'ADAPTER_CONTRACT_UNSUPPORTED',
          applicationId: appId,
          operation,
          correlationId: ctx.correlationId,
          requestId: ctx.requestId,
          retryable: false,
          internalDetail: `Adapter does not implement optional operation '${operation}'`,
        });
      }
      const result = await fn.call(adapter, ctx, ...(args as unknown[]));
      const latencyMs = performance.now() - started;

      // 4. Validate the shape before it enters hub types (→ ADAPTER_CONTRACT_ERROR).
      validateAgainstSchema(operation, result, appId, ctx);
      circuit.recordSuccess();
      emitLog(deps, {
        correlationId: ctx.correlationId,
        requestId: ctx.requestId,
        applicationId: appId,
        operation,
        principalId: ctx.principal.principalId,
        outcome: 'SUCCESS',
        latencyMs,
        attempt,
        circuitState: circuit.state(),
      });
      return result as AdapterResult<Op>;
    } catch (err) {
      const ae = classify(err, appId, operation, ctx);

      // 5. A mutating timeout becomes INDETERMINATE: outcome unknown, decision
      //    passes upward. Auto-retry here would risk double-applying.
      if (mutating && ae.detail.class === 'ADAPTER_TIMEOUT') {
        ae.detail.class = 'ADAPTER_INDETERMINATE';
        ae.detail.retryable = false;
      }

      circuit.recordFailure();
      // Not for NOT_FOUND / REJECTED — those are business outcomes, not failures.
      if (shouldRecordIssue(ae)) await issues.record(ae, ctx);

      emitLog(deps, {
        correlationId: ctx.correlationId,
        requestId: ctx.requestId,
        applicationId: appId,
        operation,
        principalId: ctx.principal.principalId,
        outcome: 'FAILURE',
        latencyMs: 0,
        errorClass: ae.detail.class,
        attempt,
        circuitState: circuit.state(),
      });

      const retryable = ae.detail.retryable && attempt < maxAttempts;
      const delay = backoffDelay(cfg, attempt, jitter);
      const fitsInBudget = Date.now() + delay < Date.parse(ctx.deadlineAt);
      // Never retry past the deadline.
      if (!retryable || !fitsInBudget) throw ae;
      await sleep(delay);
    }
  }
}

function emitLog(deps: AdapterRuntimeDeps, record: AdapterLogRecord): void {
  if (deps.log) {
    deps.log(record);
    return;
  }
  if (record.outcome === 'SUCCESS') adapterLog.info(record, 'adapter call');
  else adapterLog.warn(record, 'adapter call failed');
}
