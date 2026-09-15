// packages/adapter-runtime/src/issues.ts
//
// The IssueSink is a PORT, not an implementation. Keeping it a port is what lets
// this package stay free of @ual/db and stay unit-testable without a database.
// The pg-backed sink that writes hub.integration_issues is wired in plan 01-06.

import type { AdapterError, AdapterContext } from '@ual/adapter-contract';

export interface IssueSink {
  record(err: AdapterError, ctx: AdapterContext): Promise<void>;
}

/** A sink that records nothing. The default when no persistence is wired. */
export const noopIssueSink: IssueSink = {
  async record(): Promise<void> {
    /* intentionally empty */
  },
};

/**
 * FR-F08a-06 rule 1: every AdapterError writes exactly one integration_issues row
 * EXCEPT ADAPTER_NOT_FOUND and ADAPTER_REJECTED, which are normal business
 * outcomes rather than integration failures.
 */
export function shouldRecordIssue(err: AdapterError): boolean {
  const cls = err.detail.class;
  return cls !== 'ADAPTER_NOT_FOUND' && cls !== 'ADAPTER_REJECTED';
}
