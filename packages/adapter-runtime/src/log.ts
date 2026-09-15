// packages/adapter-runtime/src/log.ts
//
// The structured logger for every adapter call (FR-F08b-05 rule 1). `redact`
// paths are configured HERE, at the logger, so the assertion, cookies, one-time
// codes, and action form payloads can never appear — a new call site cannot
// forget it (FR-F08b-05 rule 4).

import { pino, type Logger } from 'pino';

/** One structured record per adapter call. */
export interface AdapterLogRecord {
  correlationId: string;
  requestId: string;
  applicationId: string;
  operation: string;
  principalId: string;
  outcome: 'SUCCESS' | 'FAILURE';
  latencyMs: number;
  errorClass?: string;
  attempt: number;
  circuitState: string;
}

/**
 * Redaction is enforced at the logger. Any of these paths, wherever they appear
 * in a logged object, is replaced rather than printed. The assertion header,
 * cookies, one-time codes, and action form payloads are covered.
 */
const REDACT_PATHS = [
  'headers["x-ual-principal"]',
  'headers["X-UAL-Principal"]',
  'headers.authorization',
  'headers.cookie',
  'assertion',
  'principalAssertion',
  'cookie',
  'oneTimeCode',
  'otp',
  'payload',
  'actionPayload',
  'formPayload',
  '*.assertion',
  '*.cookie',
  '*.payload',
];

export const adapterLog: Logger = pino({
  name: 'adapter-runtime',
  redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
});

/** Create a child logger (used by tests and by callers wiring their own transport). */
export function createAdapterLogger(bindings: Record<string, unknown> = {}): Logger {
  return adapterLog.child(bindings);
}
