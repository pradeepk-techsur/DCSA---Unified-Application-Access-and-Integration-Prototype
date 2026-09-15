# Functional Requirements Document — DCSA Unified Application Access and Integration Prototype

**Project Acronym:** DCSA-UAL
**Document Type:** Functional Requirements Document (FRD)
**Status:** Draft v1.0
**Date:** 2026-09-14
**Derived From:** `project_specs/PRD-DCSA-UAL.md` (features F0–F19), `.planning/PROJECT.md`

> **DEMO — SYNTHETIC DATA ONLY.** This document specifies a demonstration prototype. No real DCSA data, no real PII, no connection to any real government system. Authentication is simulated; no certificate validation occurs.

---

## 1. Scope

This FRD specifies the implementable behavior of every PRD feature F0 through F19: the hub (unified application layer), the unified web UI, the five simulated spoke services (eApp, IEP, PVQ, PDT, IM), the adapter contract that joins them, and the supporting data, operability, and verification surfaces. For each functional requirement it states inputs, processing and business rules, outputs, validation, error handling with user-facing copy, and acceptance criteria. Where the PRD asserts a capability ("aggregate across five spokes," "degrade visibly"), this document says exactly what the system does, in what order, and what happens when it does not work.

This FRD does not choose libraries, frameworks, deployment topology, or storage engines beyond what the PRD already assumed; `TechArch-DCSA-UAL.md` owns those decisions. Where this document writes SQL DDL, it is a logical schema specifying entities, fields, keys, and isolation boundaries — the physical engine is a TechArch decision.

## 2. Conventions

**Requirement IDs.** Every functional requirement carries an ID of the form `FR-F{nn}-{mm}` where `F{nn}` is the originating PRD feature and `{mm}` is a sequence number within that feature. Example: `FR-F07a-04` is the fourth requirement derived from PRD feature F7 (part A). Where a feature's requirements are large enough to occupy two chunks, `{nn}` carries an `a`/`b` suffix — **F07a/F07b** (flagship journey / flagship orchestration) and **F08a/F08b** (adapter contract / application registry). IDs are stable; retired requirements are marked `[WITHDRAWN]` rather than renumbered.

**Recorded deviations from this document.** Two requirements are deliberately superseded by TechArch Architecture Decision Records, and the superseding text is written into the requirement itself rather than left to be discovered: `FR-F10-01` step 2 (no frame-blocking header — **ADR-012**) and the `Y1b` port map's web UI port (**3000** bound `0.0.0.0`, not 7000 — **ADR-013**). There are no other TechArch deviations; elsewhere, where TechArch appears to contradict this document, this document wins.

**Cross-references.** `see FR-F05-03` points at another requirement. `see Y1a §Work Queue` points at a section of a cross-feature chunk. `Y0a` is the hub schema, `Y0b` the spoke schemas, `Y1a` the hub BFF API, `Y1b` the spoke mock APIs, `Y2` the error catalog, `Y3` the integration points.

**Keywords.** MUST = mandatory, verified by test. SHOULD = strongly expected, deviation must be recorded. MAY = optional.

**Error identifiers.** Every error condition carries a machine-readable `code` (SCREAMING_SNAKE_CASE) and a user-facing `message`. The message copy in this document is normative — implementations use this exact text. Full catalog in `Y2-errors.md`.

**Screens.** Every UI screen carries an ID of the form `SCR-{nn}`. The complete screen inventory is `FR-F03-02`; per-screen specifications live with their owning feature.

**Actors.** `INVESTIGATOR`, `ADJUDICATOR`, `APPLICANT`, `ADMINISTRATOR`. An identity MAY hold more than one role.

**Layer discipline.** The presentation layer is specified as its own requirement set (F3, F4, F5, F6, F11, F12, F13, F14) with screens, states, and interactions. It is never folded into an API or serialization requirement. Every API requirement names the screen(s) it serves; every screen requirement names the endpoint(s) it consumes.

---

## 3. Shared Domain Models

These models are referenced by name throughout the document. They are hub-side models; spoke-native shapes are defined in `Y0b` and normalized into these by adapters (`FR-F08a-03`).

### 3.1 Principal

The authenticated subject of every authorization decision. Assembled server-side from the session; never accepted from a client.

- `principalId` (string, ULID) — hub identity identifier
- `displayName` (string) — e.g., "Marcus Vale"
- `identityMethod` (enum: `CAC_PIV` | `ECA` | `GENERIC_MFA`) — how this session was established
- `roles` (array of enum: `INVESTIGATOR` | `ADJUDICATOR` | `APPLICANT` | `ADMINISTRATOR`) — one or more
- `activeRole` (enum, one of `roles`) — the role context the user is currently operating in
- `attributes` (object):
  - `organization` (string) — e.g., `DCSA-FIELD-OPS-EAST`
  - `clearanceTier` (enum: `T1` | `T3` | `T5`)
  - `assignedRegion` (string) — e.g., `REGION-NE`
  - `caseAssignments` (array of string) — spoke-scoped case references assigned to this principal
  - `subjectRef` (string | null) — for `APPLICANT` identities, the synthetic subject this person *is*; null for mission roles
- `sessionId` (string, ULID)
- `issuedAt` / `expiresAt` (ISO-8601 UTC timestamps)

### 3.2 WorkItem (normalized)

The single shape every spoke work item is projected into (`FR-F05-02`).

- `workItemId` (string) — hub-composed, globally unique: `{sourceSystem}:{nativeId}` (e.g., `PVQ:ISS-2207`)
- `nativeId` (string) — the spoke's own identifier, unmodified
- `sourceSystem` (string) — registry `applicationId` (e.g., `EAPP`, `IEP`, `PVQ`, `PDT`, `IM`, `CVS`)
- `sourceSystemLabel` (string) — registry display name, for UI attribution
- `subjectRef` (string) — the synthetic person the work concerns (e.g., `SUBJ-00418`)
- `subjectDisplayName` (string) — fabricated name for display
- `type` (string) — registry-declared work-item type (e.g., `EAPP_CASE_REVIEW`, `PVQ_ISSUE`)
- `typeLabel` (string) — human-readable type name
- `title` (string, ≤120 chars) — e.g., "Case A-1042 — Section 13A employment history"
- `status` (string) — spoke-native status value, preserved verbatim
- `statusLabel` (string) — human-readable status
- `statusCategory` (enum: `OPEN` | `IN_PROGRESS` | `BLOCKED` | `CLOSED`) — normalized bucket for filtering/sorting across heterogeneous sources
- `priority` (enum: `ROUTINE` | `ELEVATED` | `URGENT`) — normalized three-tier scale
- `assigneeId` (string | null) — hub principalId, or null for unassigned
- `assigneeDisplayName` (string | null)
- `createdAt`, `dueDate` (ISO-8601 date or datetime), `lastActivityAt` (ISO-8601 UTC)
- `overdue` (boolean) — computed hub-side: `dueDate < now AND statusCategory != CLOSED`
- `relatedRefs` (array of `RelatedRef`) — cross-system relationships (§3.4)
- `sourceHealth` (enum: `HEALTHY` | `DEGRADED` | `DOWN`) — health of the owning system at fetch time

### 3.3 ActionDescriptor

Server-computed; the UI renders only what appears here (`FR-F02-05`, `FR-F06-03`).

- `actionId` (string) — e.g., `RESOLVE_ISSUE`
- `label` (string) — button copy, e.g., "Resolve issue"
- `description` (string) — one-sentence explanation shown as hint text
- `enabled` (boolean) — false when the action exists but is currently unavailable
- `disabledReason` (string | null) — plain-language explanation shown next to a disabled control
- `confirmationRequired` (boolean)
- `formSchema` (object | null) — field definitions for the action form (`FR-F06-05`)
- `targetSystems` (array of string) — every system this action writes to; length > 1 means orchestrated (`FR-F07b-01`)

### 3.4 RelatedRef

The relationship model that makes cross-application work discoverable without database joins.

- `relationshipType` (enum: `HAS_ISSUE` | `ISSUE_AGAINST` | `HAS_DESIGNATION` | `DESIGNATION_FOR` | `ASSIGNED_CASE` | `CASE_ASSIGNMENT_FOR` | `HAS_NOTICE` | `NOTICE_FOR`)
- `targetSystem` (string) — registry `applicationId` of the system holding the related record
- `targetNativeId` (string) — opaque reference; the hub resolves it via that system's adapter
- `label` (string) — plain-language explanation, e.g., "Issue raised against Section 13A employment history"
- `contextHint` (string | null) — the specific locus, e.g., `SECTION_13A.employer[0].endDate`
- `resolvable` (boolean) — false when the target system is DOWN or the principal lacks entitlement

### 3.5 ActivityEvent

- `eventId` (string), `occurredAt` (ISO-8601 UTC)
- `origin` (enum: `HUB` | `SPOKE`) — hub audit record vs. spoke-native history entry
- `sourceSystem` (string), `actorDisplayName` (string), `actorRole` (string | null)
- `action` (string), `summary` (string), `correlationId` (string | null)

### 3.6 Error Envelope

Every non-2xx hub response body:

```json
{
  "error": {
    "code": "AUTHZ_DENIED",
    "message": "You don't have access to this item.",
    "detail": "If you believe this is a mistake, contact your administrator and provide the reference below.",
    "correlationId": "01JD7K2Q9X8V3MZ4R6T",
    "fieldErrors": [],
    "retryable": false,
    "retryAfterSeconds": null
  }
}
```

Rules: no stack traces, no internal hostnames, no SQL, no spoke exception text. Denials never disclose whether the resource exists. Every envelope carries a `correlationId` the user can quote.

### 3.7 Cross-Cutting Terminology

- **Hub** — the unified application layer: session, authorization, aggregation, orchestration, audit, registry, health.
- **Spoke** — one of the simulated mission services (eApp, IEP, PVQ, PDT, IM, plus the demo sixth application).
- **Adapter** — the per-spoke component implementing the common interface (`FR-F08a-01`). The only path from hub to spoke.
- **Registry** — the data-driven table of registered applications (`Y0a.registered_applications`) from which navigation, fan-out, health, and admin inventory are derived. The hub contains no hard-coded application list.
- **Fan-out** — a hub operation that calls N adapters concurrently and merges the results with partial-failure tolerance.
- **Correlation ID** — a ULID generated at the hub edge per user action, propagated to every adapter call, audit record, and error log entry belonging to that action.
- **Degraded** — a system state in which some data is unavailable but the application remains usable, and the gap is named on screen.
- **Orchestrated action** — a single user action that writes to two or more spokes (`FR-F07b-01`), recorded as one correlated audit chain (`FR-F07b-06`).
- **Synthetic marker** — a per-record field proving the row is fabricated demo data (`FR-F17-08`).

---

## 4. Document Map

| Chunk | Contents |
|---|---|
| `00-header.md` | This section: scope, conventions, shared models, terminology |
| `F00-simulated-mfa-authentication.md` | F0 — CAC/PIV, ECA, generic MFA; simulated IdP |
| `F01-unified-session-sso.md` | F1 — session, principal propagation, SSO to spokes |
| `F02-authorization.md` | F2 — server-side RBAC/ABAC decision function |
| `F03-navigation-shell.md` | F3 — global chrome, screen inventory, demo banner |
| `F04-dashboards.md` | F4 — four role dashboards |
| `F05-work-queue.md` | F5 — aggregation, filter/sort/search/paginate |
| `F06-work-item-detail.md` | F6 — detail, actions, history |
| `F07a-flagship-workflow-journey.md` | F7 — flagship workflow, steps 1–5 |
| `F07b-flagship-workflow-orchestration.md` | F7 — orchestration, compensation, confirmation, audit |
| `F08a-adapter-contract.md` | F8 — the adapter interface contract |
| `F08b-application-registry.md` | F8 — data-driven registry and registry-derived behavior |
| `F09-spoke-services.md` | F9 — five isolated simulated services |
| `F10-bff-api.md` | F10 — hub BFF API behavior |
| `F11-admin-console.md` | F11 — connected apps, health, integration issues |
| `F12-application-registration.md` | F12 — sixth-app onboarding flow |
| `F13-audit-trail.md` | F13 — append-only audit and viewer |
| `F14-accessibility-uswds.md` | F14 — WCAG 2.1 AA / Section 508 as functional requirements |
| `F15-notifications-announcements.md` | F15 — alerts and announcements |
| `F16-health-resilience.md` | F16 — health probes, degradation, failure injection |
| `F17-synthetic-seed-data.md` | F17 — seed corpus and coverage matrix |
| `F18-demo-operability.md` | F18 — single-command run, demo scripts |
| `F19-test-accessibility-suite.md` | F19 — automated verification |
| `Y0a-schema-hub.md` | Hub database schema |
| `Y0b-schema-spokes.md` | Five isolated spoke schemas + demo sixth |
| `Y1a-api-hub-bff.md` | Hub BFF endpoint catalog |
| `Y1b-api-spokes.md` | Per-spoke mock API surfaces |
| `Y2-errors.md` | Consolidated error catalog with user-facing copy |
| `Y3-integrations.md` | Integration points and contracts |

---
