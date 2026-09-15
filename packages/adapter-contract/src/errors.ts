// packages/adapter-contract/src/errors.ts
// The CLOSED error taxonomy. Every hub-side handling decision keys off `class`.
// Transcribed verbatim from TechArch/05-adapter-seam.md §5.1; the thirteen classes
// agree with FRD/F08a-adapter-contract.md FR-F08a-06.

import type { AdapterOperation } from './adapter.js';

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
