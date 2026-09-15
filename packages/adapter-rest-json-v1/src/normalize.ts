// packages/adapter-rest-json-v1/src/normalize.ts
//
// Normalization for the ONE adapterType every demo spoke uses. The status map
// comes from describe()/the cached registry row, NEVER from code. An unmapped
// native status is a CONFORMANCE FAILURE returned as an error result, not
// defaulted — defaulting here is how a queue quietly starts mis-filtering months
// later (TechArch §5.3, FRD 00-header §3.2).

import type {
  WorkItem, Priority, StatusCategory, RegistryRecord, WorkItemTypeDescriptor,
} from '@ual/adapter-contract';

/** A row as the spoke's REST/JSON surface returns it. Fields are advisory-typed. */
export interface SpokeRowDto {
  nativeId: string;
  subjectRef: string;
  subjectDisplayName: string;
  type: string;                        // must match a declared workItemType.type
  title: string;
  status: string;                      // spoke-native, preserved verbatim
  priority?: string | null;
  assignedPrincipalId?: string | null;
  assignedDisplayName?: string | null;
  createdAt: string;
  dueDate?: string | null;
  lastActivityAt: string;
}

export type NormalizeResult =
  | { ok: true; value: WorkItem }
  | { ok: false; reason: string };

export function ok(value: WorkItem): NormalizeResult { return { ok: true, value }; }
export function err(reason: string): NormalizeResult { return { ok: false, reason }; }

/** Truncate a title to the contract's 120-char cap. */
export function truncate(s: string, max = 120): string {
  return s.length <= max ? s : s.slice(0, max);
}

/** Humanize a SCREAMING_SNAKE native status for a default label. */
export function humanize(status: string): string {
  return status
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const PRIORITY_MAP: Record<string, Priority> = {
  ROUTINE: 'ROUTINE', LOW: 'ROUTINE', NORMAL: 'ROUTINE',
  ELEVATED: 'ELEVATED', MEDIUM: 'ELEVATED', HIGH: 'ELEVATED',
  URGENT: 'URGENT', CRITICAL: 'URGENT',
};

export function normalizePriority(native: string | null | undefined): Priority {
  if (!native) return 'ROUTINE';
  return PRIORITY_MAP[native.toUpperCase()] ?? 'ROUTINE';
}

/**
 * Normalize one spoke row to a WorkItem using the registry-declared type
 * descriptor's statusMap. Returns an error result for an unknown type or an
 * unmapped status; the caller records ADAPTER_CONTRACT_ERROR and drops the row
 * individually rather than failing the whole batch.
 */
export function normalizeRow(cfg: RegistryRecord, dto: SpokeRowDto): NormalizeResult {
  const typeDesc: WorkItemTypeDescriptor | undefined = cfg.workItemTypes.find(
    (t) => t.type === dto.type,
  );
  if (!typeDesc) return err(`Unknown work-item type '${dto.type}' for ${cfg.applicationId}`);

  const category: StatusCategory | undefined = typeDesc.statusMap[dto.status];
  if (!category) {
    return err(`Unmapped status '${dto.status}' for ${dto.type}`);
  }

  const assigneeId = dto.assignedPrincipalId ?? null;

  return ok({
    workItemId: `${cfg.applicationId}:${dto.nativeId}`,
    nativeId: dto.nativeId,
    sourceSystem: cfg.applicationId,
    sourceSystemLabel: cfg.displayName,   // from the registry: renaming propagates everywhere
    subjectRef: dto.subjectRef,
    subjectDisplayName: dto.subjectDisplayName,
    type: dto.type,
    typeLabel: typeDesc.label,
    title: truncate(dto.title, 120),
    status: dto.status,
    statusLabel: humanize(dto.status),
    statusCategory: category,
    priority: typeDesc.priorityNative ? normalizePriority(dto.priority) : 'ROUTINE',
    priorityProvided: typeDesc.priorityNative,
    assigneeId,
    assigneeDisplayName: dto.assignedDisplayName ?? null,
    assigneeResolvable: assigneeId !== null,   // false => "assigned to someone we can't resolve"
    createdAt: dto.createdAt,
    dueDate: dto.dueDate ?? null,
    lastActivityAt: dto.lastActivityAt,
    overdue: false,                            // computed hub-side against the seed reference date
    relatedRefs: [],
    sourceHealth: 'HEALTHY',                   // the runtime stamps the real value at fetch time
  });
}

const IDENTIFIER_OR_STACK = /(\bat\s+[\w.]+\s*\(|[\w./-]+:\d+:\d+|0x[0-9a-fA-F]+|\/[\w./-]+)/g;

/**
 * The ONLY spoke text ever shown to a user, and only on a 422. Cap 200 chars,
 * HTML-escape, strip identifier/stack patterns (TechArch §5.1, FR-F08a-06 rule 2).
 */
export function sanitize(message: string): string {
  const stripped = message.replace(IDENTIFIER_OR_STACK, '').replace(/\s+/g, ' ').trim();
  const escaped = stripped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped.slice(0, 200);
}
