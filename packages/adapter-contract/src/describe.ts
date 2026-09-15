// packages/adapter-contract/src/describe.ts
// Transcribed verbatim from TechArch/05-adapter-seam.md §5.1.

import type { StatusCategory, ActionFormField, RelatedRef, HealthStatus } from './types.js';

export interface WorkItemTypeDescriptor {
  type: string;
  label: string;
  contentProfile: string;                     // drives detail rendering; e.g. 'ISSUE_DETAIL'
  statusMap: Record<string, StatusCategory>;  // MUST map EVERY native status the spoke can emit
  priorityNative: boolean;
}

export interface ActionDescriptorDeclaration {
  actionId: string;
  label: string;
  appliesToTypes: string[];
  requiredPermission: string;                 // MUST exist in hub.permissions
  formSchema: { fields: ActionFormField[] } | null;
  targetSystems: string[];
  idempotent: boolean;
}

export interface Capabilities {
  supportsSearch: boolean;
  supportsFilter: string[];
  supportsContext: boolean;
  supportsSummary: boolean;
  supportsActivityHistory: boolean;
  maxPageSize: number;
}

export interface DescribeResult {
  applicationId: string;                      // ^[A-Z][A-Z0-9_]{1,15}$
  displayName: string;
  adapterVersion: string;
  contractVersion: string;                    // checked against the hub's supported set
  workItemTypes: WorkItemTypeDescriptor[];
  actions: ActionDescriptorDeclaration[];
  capabilities: Capabilities;
  relationshipTypesEmitted: RelatedRef['relationshipType'][];
  iconToken: string;                          // a token NAME — never a color, never a URL
}

export interface HealthResult {
  status: HealthStatus;
  latencyMs: number;
  checkedAt: string;
  version: string;
  detail?: string;
}
