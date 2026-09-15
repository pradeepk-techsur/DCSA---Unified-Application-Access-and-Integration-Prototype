// packages/adapter-runtime/src/backoff.ts
//
// Retry spacing per FR-F08a-05 rule 2: backoffInitialMs × multiplier^(attempt-1),
// ± jitterPct. The jitter source is injectable so tests are deterministic.

import type { RegistryRecord } from '@ual/adapter-contract';

export type BackoffConfig = Pick<
  RegistryRecord,
  'backoffInitialMs' | 'backoffMultiplier' | 'backoffJitterPct'
>;

/** A source of randomness in [0, 1). Injected so tests can pin it. */
export type JitterSource = () => number;

export const defaultJitterSource: JitterSource = Math.random;

/**
 * Delay before `attempt` (1-based). Attempt 1 is the first retry after the
 * initial try, so its base is backoffInitialMs. Jitter is applied symmetrically:
 * a jitterPct of 20 spreads the delay across ±20% of its base.
 */
export function backoffDelay(
  cfg: BackoffConfig,
  attempt: number,
  jitter: JitterSource = defaultJitterSource,
): number {
  const base = cfg.backoffInitialMs * Math.pow(cfg.backoffMultiplier, Math.max(0, attempt - 1));
  const jitterFraction = cfg.backoffJitterPct / 100;
  // Map [0,1) → [-jitterFraction, +jitterFraction).
  const swing = (jitter() * 2 - 1) * jitterFraction;
  return Math.max(0, Math.round(base * (1 + swing)));
}
