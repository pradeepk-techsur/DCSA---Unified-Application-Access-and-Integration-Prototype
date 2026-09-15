// packages/adapter-runtime/src/validate.ts
//
// Structural validation of an adapter's success result. A malformed adapter
// response is ADAPTER_CONTRACT_ERROR, never a silently-accepted shape
// (T-01-19). This is deliberately shallow — the exhaustive TypeBox schemas live
// in @ual/contracts (Phase 2). Here we assert the load-bearing shape so a
// garbage payload cannot enter hub types.

import {
  AdapterError,
  type AdapterOperation,
  type AdapterContext,
} from '@ual/adapter-contract';

function contractError(
  operation: AdapterOperation,
  applicationId: string,
  ctx: AdapterContext,
  detail: string,
): AdapterError {
  return new AdapterError({
    class: 'ADAPTER_CONTRACT_ERROR',
    applicationId,
    operation,
    correlationId: ctx.correlationId,
    requestId: ctx.requestId,
    retryable: false,
    internalDetail: detail,
  });
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isWorkItemLike(v: unknown): boolean {
  return (
    isObject(v) &&
    typeof v['workItemId'] === 'string' &&
    typeof v['nativeId'] === 'string' &&
    typeof v['statusCategory'] === 'string'
  );
}

/**
 * Throws ADAPTER_CONTRACT_ERROR if `result` does not match the minimal shape for
 * `operation`. Returns void on success.
 */
export function validateAgainstSchema(
  operation: AdapterOperation,
  result: unknown,
  applicationId: string,
  ctx: AdapterContext,
): void {
  const fail = (detail: string): never => {
    throw contractError(operation, applicationId, ctx, detail);
  };

  switch (operation) {
    case 'describe':
      if (!isObject(result) || typeof result['applicationId'] !== 'string' || !Array.isArray(result['workItemTypes'])) {
        fail('describe() result missing applicationId or workItemTypes');
      }
      return;
    case 'healthCheck':
      if (!isObject(result) || typeof result['status'] !== 'string' || typeof result['latencyMs'] !== 'number') {
        fail('healthCheck() result missing status or latencyMs');
      }
      return;
    case 'listWorkItems':
      if (!isObject(result) || !Array.isArray(result['items'])) fail('listWorkItems() result missing items array');
      else if (!(result['items'] as unknown[]).every(isWorkItemLike)) fail('listWorkItems() contains a malformed WorkItem');
      return;
    case 'getWorkItem':
      if (!isObject(result) || !isWorkItemLike(result['item'])) fail('getWorkItem() result missing a valid item');
      return;
    case 'getWorkItemSummary':
      if (!isObject(result) || typeof result['nativeId'] !== 'string' || typeof result['statusCategory'] !== 'string') {
        fail('getWorkItemSummary() result missing nativeId or statusCategory');
      }
      return;
    case 'performAction':
      if (!isObject(result) || (result['outcome'] !== 'APPLIED' && result['outcome'] !== 'REJECTED')) {
        fail('performAction() result missing a valid outcome');
      } else if (!isWorkItemLike(result['newState'])) {
        fail('performAction() result missing a valid newState');
      }
      return;
    case 'getActivityHistory':
      if (!isObject(result) || !Array.isArray(result['events'])) fail('getActivityHistory() result missing events array');
      return;
    case 'context':
      return;
    default:
      return;
  }
}
