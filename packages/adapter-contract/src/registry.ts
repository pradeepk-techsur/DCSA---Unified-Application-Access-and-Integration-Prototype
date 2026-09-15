// packages/adapter-contract/src/registry.ts
//
// The registry record that drives dynamic application registration.
// Transcribed verbatim from TechArch §5.4, where it appears as
// `packages/contracts/src/registry.ts`. It lives HERE in Phase 1 because
// `@ual/contracts` — the TypeBox/OpenAPI package — is a Phase 2 deliverable that
// arrives with the BFF. Phase 2 may move or re-export this interface from
// `@ual/contracts` once that package exists; every field below is unchanged.

import type { WorkItemTypeDescriptor, ActionDescriptorDeclaration, Capabilities } from './describe.js';
import type { RoleId } from './types.js';

export interface RegistryRecord {
  // Identity — applicationId is IMMUTABLE after creation: workItemIds and audit
  // records already refer to it, and retired IDs are never reused.
  applicationId: string;               // ^[A-Z][A-Z0-9_]{1,15}$
  displayName: string;                 // 3–60 chars; appears on every badge, breadcrumb, error
  description?: string;
  iconToken: string;                   // token NAME, validated against the theme token set

  // Connection
  adapterType: 'REST_JSON_V1';         // resolvable implementation key
  baseEndpoint: string;
  healthEndpoint: string;
  contractVersion: string;             // populated from describe(); must be hub-supported

  // Capabilities — pre-populated from describe(), confirmed by the administrator
  workItemTypes: WorkItemTypeDescriptor[];
  supportedActions: ActionDescriptorDeclaration[];
  capabilities: Capabilities;
  relationshipTypesEmitted: string[];

  // Access — a RESTRICTION, never a grant. Role-matrix permissions still apply.
  visibleToRoles: RoleId[];            // length >= 1; nothing pre-checked on the form

  // Resilience policy — per application, never hard-coded per spoke
  timeoutMs: number;                   // 5000   [500, 30000]
  actionTimeoutMs: number;             // 10000  [1000, 30000]
  healthTimeoutMs: number;             // 2000   [500, 10000]
  maxRetries: number;                  // 2      [0, 5]
  backoffInitialMs: number;            // 200    [50, 5000]
  backoffMultiplier: number;           // 2.0    [1.0, 4.0]
  backoffJitterPct: number;            // 20     [0, 50]
  circuitFailureThreshold: number;     // 5      [2, 50]
  circuitOpenMs: number;               // 30000  [5000, 300000]
  circuitHalfOpenProbes: number;       // 1      [1, 5]
  healthProbeIntervalSec: number;      // 30     [10, 600]
  degradedLatencyMs: number;           // 1500

  // Lifecycle
  enabled: boolean;
  configState: 'VALID' | 'INVALID' | 'INCOMPATIBLE';
  configProblem?: string;
  isDemoSixthApp: boolean;
}
