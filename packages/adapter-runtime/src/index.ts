// @ual/adapter-runtime — deadline, retry, backoff, circuit gating, schema
// validation and error classification applied OUTSIDE every adapter.
//
// This package depends on @ual/adapter-contract and pino ONLY. It has no
// @ual/db and no HTTP client: the IssueSink and CircuitStateStore are ports so
// the runtime stays unit-testable without a database.

export { invoke } from './invoke.js';
export type {
  AdapterArgs,
  AdapterResult,
  AdapterRuntimeConfig,
  AdapterRuntimeDeps,
} from './invoke.js';

export {
  Circuit,
  InMemoryCircuitStateStore,
} from './circuit.js';
export type {
  CircuitState,
  CircuitPolicy,
  CircuitSnapshot,
  CircuitStateStore,
  CircuitTransition,
  TransitionListener,
  Clock,
} from './circuit.js';

export { classify } from './classify.js';
export type { ClassifiableError } from './classify.js';

export { backoffDelay, defaultJitterSource } from './backoff.js';
export type { BackoffConfig, JitterSource } from './backoff.js';

export { validateAgainstSchema } from './validate.js';

export { noopIssueSink, shouldRecordIssue } from './issues.js';
export type { IssueSink } from './issues.js';

export { adapterLog, createAdapterLogger } from './log.js';
export type { AdapterLogRecord } from './log.js';
