// packages/adapter-contract/src/types.ts
// The complete vocabulary of the hub↔spoke boundary. Nothing else crosses it.
// Transcribed verbatim from TechArch/05-adapter-seam.md §5.1.

export type StatusCategory = 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'CLOSED';
export type Priority       = 'ROUTINE' | 'ELEVATED' | 'URGENT';
export type HealthStatus   = 'HEALTHY' | 'DEGRADED' | 'DOWN';
export type RoleId = 'INVESTIGATOR' | 'ADJUDICATOR' | 'APPLICANT' | 'ADMINISTRATOR';

/** Resolved server-side from the session. Never constructed from client input. */
export interface Principal {
  principalId: string;                 // ULID
  displayName: string;
  identityMethod: 'CAC_PIV' | 'ECA' | 'GENERIC_MFA';
  roles: RoleId[];
  activeRole: RoleId;
  attributes: {
    organization: string;
    clearanceTier: 'T1' | 'T3' | 'T5';
    assignedRegion: string;
    caseAssignments: string[];         // hub-side only; NEVER sent to a spoke
    subjectRef: string | null;         // non-null only for APPLICANT
  };
  sessionId: string;
  issuedAt: string;                    // ISO-8601 UTC
  expiresAt: string;
}

/** Mandatory on every read. Absence is a programming error, never a permissive default. */
export type Scope =
  | { mode: 'SUBJECT';            subjectRef: string }
  | { mode: 'ASSIGNEE_OR_UNIT';   principalId: string; organization: string; assignedRegion: string }
  | { mode: 'ORG';                organization: string }
  | { mode: 'NONE' };               // ADMINISTRATOR: platform resources only, no work items

/** Passed to every operation. Constructed only by the scoped spoke-query wrapper. */
export interface AdapterContext {
  principal: Principal;
  scope: Scope;
  correlationId: string;               // ULID, one per user action
  requestId: string;                   // ULID, unique per adapter call
  deadlineAt: string;                  // absolute ISO-8601; the adapter MUST abort at it
  idempotencyKey?: string;             // present on every mutating call
  contextHandle?: string;              // when the spoke declares supportsContext
}

export interface RelatedRef {
  relationshipType:
    | 'HAS_ISSUE' | 'ISSUE_AGAINST' | 'HAS_DESIGNATION' | 'DESIGNATION_FOR'
    | 'ASSIGNED_CASE' | 'CASE_ASSIGNMENT_FOR' | 'HAS_NOTICE' | 'NOTICE_FOR';
  targetSystem: string;                // registry applicationId
  targetNativeId: string;              // OPAQUE. The adapter never resolves this.
  label: string;                       // "Issue raised against Section 13A employment history"
  contextHint: string | null;          // "SECTION_13A.employer[0].endDate"
  resolvable: boolean;                 // set by the HUB after lookup, not by the adapter
}

export interface WorkItem {
  workItemId: string;                  // `${sourceSystem}:${nativeId}` — composed by the adapter
  nativeId: string;
  sourceSystem: string;
  sourceSystemLabel: string;
  subjectRef: string;
  subjectDisplayName: string;
  type: string;                        // registry-declared work-item type
  typeLabel: string;
  title: string;                       // <= 120 chars
  status: string;                      // spoke-native status, preserved verbatim
  statusLabel: string;
  statusCategory: StatusCategory;      // via describe().workItemTypes[].statusMap
  priority: Priority;                  // normalized; ROUTINE when priorityNative is false
  priorityProvided: boolean;           // false lets the UI say "not provided by {System}"
  assigneeId: string | null;
  assigneeDisplayName: string | null;
  assigneeResolvable: boolean;         // false => "assigned to someone we can't resolve"
  createdAt: string;
  dueDate: string | null;
  lastActivityAt: string;
  overdue: boolean;                    // computed hub-side from dueDate + statusCategory
  relatedRefs: RelatedRef[];
  sourceHealth: HealthStatus;          // stamped by the runtime, not the adapter
}

export interface ActionFormField {
  fieldId: string;
  label: string;
  control: 'text' | 'textarea' | 'radio' | 'select' | 'checkbox' | 'date';
  required: boolean;
  hint?: string;
  options?: Array<{ value: string; label: string; hint?: string }>;
  minLength?: number;
  maxLength?: number;
  requiredMessage: string;             // exact copy from Y2; client and server use the same string
}

export interface ActionDescriptor {
  actionId: string;                    // 'RESOLVE_ISSUE'
  label: string;
  description: string;
  enabled: boolean;
  disabledReason: string | null;       // plain language, shown next to the disabled control
  confirmationRequired: boolean;
  formSchema: { fields: ActionFormField[] } | null;
  targetSystems: string[];             // length > 1 means orchestrated
}

export interface ActivityEvent {
  eventId: string;
  occurredAt: string;
  origin: 'HUB' | 'SPOKE';
  sourceSystem: string;
  actorDisplayName: string;
  actorRole: string | null;
  action: string;
  summary: string;
  correlationId: string | null;
}
