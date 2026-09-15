// packages/adapter-contract/src/adapter.ts
// THE CONTRACT. Eight operations. Nothing else may be called on an adapter.
// Transcribed verbatim from TechArch/05-adapter-seam.md §5.1.

import type {
  StatusCategory, Priority, WorkItem, RelatedRef, ActionDescriptor, ActivityEvent,
  AdapterContext,
} from './types.js';
import type { DescribeResult, HealthResult } from './describe.js';

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
