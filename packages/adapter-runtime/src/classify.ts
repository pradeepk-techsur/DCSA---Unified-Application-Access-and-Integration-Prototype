// packages/adapter-runtime/src/classify.ts
//
// Map a caught error to one of the thirteen AdapterErrorClass values. Per the
// table in TechArch/05 plan §5.2 / FR-F08a-06. ADAPTER_CIRCUIT_OPEN and
// ADAPTER_INDETERMINATE are produced by invoke() itself, never here.

import { AdapterError, type AdapterErrorClass, type AdapterOperation, type AdapterContext } from '@ual/adapter-contract';

/**
 * Signals classify() can read off a caught error. An adapter that already knows
 * the precise class throws an AdapterError and classify() passes it through; a
 * raw transport failure (fetch AbortError, ECONNREFUSED) is classified here.
 */
export interface ClassifiableError {
  name?: string;
  code?: string;                    // Node system error code: ECONNREFUSED, ENOTFOUND, ...
  httpStatusFromSpoke?: number;     // set by the adapter's toAdapterError on a non-ok response
  spokeCode?: string;               // the spoke's { code } body field
  retryAfterSeconds?: number;
  message?: string;
  cause?: unknown;
}

const RETRYABLE: Record<AdapterErrorClass, boolean> = {
  ADAPTER_UNREACHABLE: true,
  ADAPTER_TIMEOUT: true,            // reads only; invoke() rewrites a mutating timeout
  ADAPTER_CIRCUIT_OPEN: false,
  ADAPTER_INDETERMINATE: false,
  ADAPTER_REJECTED: false,
  ADAPTER_NOT_FOUND: false,
  ADAPTER_FORBIDDEN: false,
  ADAPTER_PRINCIPAL_REJECTED: false,
  ADAPTER_CONTRACT_ERROR: false,
  ADAPTER_SCOPE_VIOLATION: false,
  ADAPTER_RATE_LIMITED: true,
  ADAPTER_CONTRACT_UNSUPPORTED: false,
  ADAPTER_INTERNAL: false,
};

function classFor(err: ClassifiableError, mutating: boolean): AdapterErrorClass {
  const name = err.name ?? '';
  const code = err.code ?? '';
  const status = err.httpStatusFromSpoke;

  // Deadline exceeded / abort.
  if (name === 'AbortError' || name === 'TimeoutError' || code === 'ABORT_ERR') {
    return 'ADAPTER_TIMEOUT';
  }
  // Connection refused / DNS / TLS failure.
  if (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN' ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code.startsWith('ERR_TLS') ||
    code.startsWith('CERT_')
  ) {
    return 'ADAPTER_UNREACHABLE';
  }

  if (typeof status === 'number') {
    if (status === 401) return 'ADAPTER_PRINCIPAL_REJECTED';
    if (status === 403) return 'ADAPTER_FORBIDDEN';
    if (status === 404) return 'ADAPTER_NOT_FOUND';
    if (status === 409 || status === 422) return 'ADAPTER_REJECTED';
    if (status === 429) return 'ADAPTER_RATE_LIMITED';
    if (status === 502 || status === 503 || status === 504) return 'ADAPTER_UNREACHABLE';
    if (status === 400 && err.spokeCode === 'SCOPE_REQUIRED') return 'ADAPTER_CONTRACT_ERROR';
    if (status >= 500) return 'ADAPTER_INTERNAL';
  }

  // Explicit contract / scope / version signals surfaced by the adapter or runtime.
  if (err.spokeCode === 'CONTRACT_ERROR') return 'ADAPTER_CONTRACT_ERROR';
  if (err.spokeCode === 'SCOPE_VIOLATION') return 'ADAPTER_SCOPE_VIOLATION';
  if (err.spokeCode === 'CONTRACT_UNSUPPORTED') return 'ADAPTER_CONTRACT_UNSUPPORTED';

  return 'ADAPTER_INTERNAL';
}

/**
 * Classify a caught error into a typed AdapterError. An AdapterError caught here
 * is returned as-is (the adapter already knew its class). `mutating` is threaded
 * for callers; the timeout→INDETERMINATE rewrite for writes is invoke()'s job.
 */
export function classify(
  err: unknown,
  applicationId: string,
  operation: AdapterOperation,
  ctx: AdapterContext,
  mutating: boolean,
): AdapterError {
  if (err instanceof AdapterError) return err;

  const ce = (err ?? {}) as ClassifiableError;
  const cls = classFor(ce, mutating);

  return new AdapterError({
    class: cls,
    applicationId,
    operation,
    correlationId: ctx.correlationId,
    requestId: ctx.requestId,
    retryable: RETRYABLE[cls],
    ...(ce.httpStatusFromSpoke !== undefined ? { httpStatusFromSpoke: ce.httpStatusFromSpoke } : {}),
    ...(ce.retryAfterSeconds !== undefined ? { retryAfterSeconds: ce.retryAfterSeconds } : {}),
    ...(ce.message !== undefined ? { internalDetail: ce.message } : {}),
  });
}
