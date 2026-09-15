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
## F0 — Simulated Multi-Method MFA Authentication

**Traces to:** PRD F0 (P0). **Screens:** SCR-01 Login, SCR-02 CAC/PIV certificate selection, SCR-03 ECA identity selection, SCR-04 Generic MFA credential entry, SCR-05 Generic MFA one-time code, SCR-06 Session timeout warning, SCR-07 Signed-out confirmation. **API:** `Y1a §Auth`.

**Description:** A simulated identity provider offering three authentication paths — CAC/PIV, ECA, and generic MFA — each backed by its own synthetic identity set, demonstrating that the hub supports multiple identity and access management service providers rather than one provider with three skins. No certificate is parsed and no credential is validated against anything real; the user selects a synthetic identity and the hub issues a session. Every screen in the flow states plainly that authentication is simulated.

**Terminology:**
- **Auth method** — one of the three paths (`CAC_PIV`, `ECA`, `GENERIC_MFA`), each with its own selection UI and its own synthetic identity pool.
- **Auth transaction** — a short-lived server-side record tracking a login in progress between initiation and completion (`Y0a.auth_transactions`).
- **Demo code** — the deterministic six-digit one-time code used by the generic MFA path.
- **Synthetic identity** — a seeded persona row (`Y0a.users`) bound to roles and attributes.

---

### FR-F00-01 — Authentication method selection (SCR-01)

**Description:** The unauthenticated landing screen presents the three authentication methods as three clearly differentiated, equally weighted choices, and states that authentication is simulated.

**Inputs:** none (unauthenticated GET). Optional query param `returnTo` (string, relative path) preserved for post-login redirect.

**Processing / business rules:**
1. Hub calls `GET /api/auth/methods`, which reads enabled methods from configuration (not hard-coded in the UI).
2. Each method returns `{ methodId, label, description, iconToken, enabled, simulationNotice }`.
3. The screen renders one USWDS card per method with a heading, a one-sentence description of what the method represents in the real world, and a primary action button.
4. A USWDS site-alert of type "info" renders above the method list with the exact copy: **"Simulated sign-in. This prototype does not validate certificates, passwords, or one-time codes. Choose a method and a demo identity to continue."**
5. The non-dismissible demo banner (`FR-F03-03`) renders on this screen, as it does on every screen including error pages.
6. `returnTo` MUST be validated as a same-origin relative path beginning with `/`; anything else is discarded silently and the user lands on the dashboard.

**Outputs:** SCR-01 rendered with three method cards, the simulation notice, and the demo banner. No session is created.

**Validation rules:**
- `returnTo` matches `^/[A-Za-z0-9/_\-?=&.]*$` and does not begin with `//`. Non-conforming values are dropped, not echoed.
- A method with `enabled: false` renders as a disabled card with `disabledReason` text; it is never hidden silently.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Method configuration unreadable | 503 | `AUTH_CONFIG_UNAVAILABLE` | "Sign-in is temporarily unavailable. Please try again in a moment." |
| Already authenticated | 302 | — | Redirect to dashboard; no error shown. |

**Acceptance criteria:**
- AC-1: The login screen lists exactly three methods, each with distinct label, description, and destination.
- AC-2: The simulation notice text appears verbatim and is programmatically associated with the method group via `aria-describedby`.
- AC-3: The demo banner is present and has no close control (asserted by `FR-F19-08`).
- AC-4: Tab order reaches all three method actions; each is operable with Enter and Space.

---

### FR-F00-02 — CAC/PIV simulated certificate selection (SCR-02)

**Description:** The CAC/PIV path presents a simulated certificate-selection dialog listing synthetic identities with mock certificate subject details, mirroring the browser certificate picker a real PIV flow would produce.

**Inputs:** `POST /api/auth/initiate` with `{ methodId: "CAC_PIV" }`.

**Processing / business rules:**
1. Hub creates an auth transaction: `{ transactionId (ULID), methodId, state: "AWAITING_SELECTION", createdAt, expiresAt = createdAt + 10 minutes }`.
2. Hub returns the synthetic certificate list for this method: for each identity, `{ identityId, subjectCommonName, subjectOrganization, issuer, serialNumber, validFrom, validTo, roles[] }`.
3. Values are fabricated by construction: issuer is `DEMO-DOD-CA-59 (synthetic)`, serial numbers begin `00:DEMO:`, and every entry is suffixed "(synthetic certificate)".
4. The list renders as a USWDS table inside a modal dialog with `role="dialog"`, `aria-modal="true"`, focus trapped, focus restored to the invoking button on dismissal.
5. Selecting a row calls `POST /api/auth/complete` with `{ transactionId, identityId }`.
6. Hub validates the transaction is `AWAITING_SELECTION`, unexpired, and that `identityId` belongs to the CAC/PIV pool. It then issues a session (`FR-F01-01`).
7. Hub writes one `AUTH_SUCCESS` audit record (`FR-F13-02`) including `identityMethod`.

**Outputs:** On success, a session cookie plus `{ principal, entitlements, returnTo }`; browser navigates to the role dashboard. On failure, SCR-02 remains open with an inline error summary.

**Validation rules:**
- `transactionId` exists, is unexpired, and is in state `AWAITING_SELECTION`.
- `identityId` exists AND its `allowedMethods` includes `CAC_PIV`. An identity registered only for ECA MUST NOT be selectable here — this is what proves the two pools are genuinely distinct.
- A transaction is single-use; a second `complete` on the same transaction fails.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Transaction expired | 400 | `AUTH_TX_EXPIRED` | "Your sign-in attempt timed out. Choose a sign-in method to start again." |
| Transaction already used | 400 | `AUTH_TX_CONSUMED` | "That sign-in attempt has already been completed. Choose a sign-in method to start again." |
| Identity not in this method's pool | 401 | `AUTH_FAILED` | "We couldn't sign you in with the selected identity. Choose a different demo identity or sign-in method." |
| Identity disabled | 401 | `AUTH_FAILED` | Same copy as above — the response MUST NOT distinguish "disabled" from "unknown." |

**Acceptance criteria:**
- AC-1: At least one synthetic identity per role (Investigator, Adjudicator, Applicant, Administrator) is selectable via CAC/PIV and produces a working session.
- AC-2: Every listed certificate displays the "(synthetic certificate)" marker and a demo issuer.
- AC-3: Attempting to complete with an ECA-only identityId returns `AUTH_FAILED` and writes an `AUTH_FAILURE` audit record.
- AC-4: The dialog traps focus, closes on Escape, and restores focus to the "Sign in with CAC/PIV" button.

---

### FR-F00-03 — ECA simulated external CA path (SCR-03)

**Description:** The ECA path demonstrates a second, independent identity provider: a different identity pool, a different issuer namespace, and its own selection screen — not a relabelled CAC/PIV picker.

**Inputs:** `POST /api/auth/initiate` with `{ methodId: "ECA" }`, then `POST /api/auth/complete` with `{ transactionId, identityId }`.

**Processing / business rules:**
1. Identical transaction lifecycle to `FR-F00-02`.
2. The ECA identity pool is disjoint in issuer and partially disjoint in membership from the CAC/PIV pool: at minimum, one identity is ECA-only and one is CAC/PIV-only, seeded per `FR-F17-02`.
3. The screen renders as a full page (not a modal) with a USWDS process-list showing the two simulated steps: "External certificate authority" → "Confirm identity," reinforcing that this is a different IdP flow.
4. Issuer is `DEMO-ECA-VENDOR-07 (synthetic)`.
5. On success, `identityMethod` on the principal is `ECA` and the session header (`FR-F03-05`) displays "Signed in via ECA (simulated)."

**Outputs:** As `FR-F00-02`, with `identityMethod: "ECA"`.

**Validation rules:** As `FR-F00-02`, with pool membership checked against `ECA`.

**Error handling:** Same table as `FR-F00-02`.

**Acceptance criteria:**
- AC-1: The ECA identity list differs from the CAC/PIV list by at least one identity in each direction.
- AC-2: The audit record for an ECA sign-in records `identityMethod: "ECA"`, distinguishable in the audit viewer filter.
- AC-3: The header of an ECA session names ECA as the method.

---

### FR-F00-04 — Generic MFA path: identity entry and one-time code (SCR-04, SCR-05)

**Description:** A two-step username-plus-one-time-code path, demonstrating a non-certificate IdP. The demo code is deterministic and visibly displayed so a reviewer is never blocked.

**Inputs:**
- Step 1: `{ methodId: "GENERIC_MFA", username (string, required, 3–128 chars) }`
- Step 2: `{ transactionId (string, required), otp (string, required, exactly 6 digits) }`

**Processing / business rules:**
1. Step 1 creates an auth transaction in state `AWAITING_OTP` regardless of whether the username matches a seeded identity. Response timing is normalized to a fixed floor of 250 ms so username existence cannot be inferred by timing.
2. If the username matches an identity whose `allowedMethods` includes `GENERIC_MFA`, the hub stores the bound `identityId` on the transaction and computes the demo code as a deterministic function of `transactionId` and the seed. If it does not match, the transaction is created with `identityId: null` and a code that can never validate.
3. SCR-05 displays the code in a USWDS summary-box with copy: **"Demo one-time code: 123456. In a real deployment this code would be delivered to your registered device."** The code is shown only when the transaction resolved to a real identity; otherwise a synthetic-looking code is displayed and submission still fails with the generic failure message.
4. Step 2 compares the submitted `otp` against the transaction's code in constant time. On match, session issued.
5. Maximum 5 OTP attempts per transaction; the 6th fails the transaction into state `LOCKED`.
6. Every failed attempt writes an `AUTH_FAILURE` audit record with the attempted username, the method, and the reason class — never the submitted code.

**Outputs:** Step 1 → SCR-05 with `transactionId` and the displayed demo code. Step 2 → session and dashboard redirect, or inline error on SCR-05.

**Validation rules:**
- `username`: required; trimmed; 3–128 characters; inline error "Enter your demo username." when empty.
- `otp`: required; exactly 6 characters, digits only; inline error "Enter the 6-digit code shown above." when malformed. Format validation runs client-side and server-side; the server is authoritative.
- Error summary at top of form links to the offending field per `FR-F14-03`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Unknown username or wrong code | 401 | `AUTH_FAILED` | "We couldn't sign you in. Check the demo username and code, then try again." |
| Attempts exhausted | 429 | `AUTH_ATTEMPTS_EXCEEDED` | "Too many attempts. Choose a sign-in method to start again." |
| Transaction expired | 400 | `AUTH_TX_EXPIRED` | "Your sign-in attempt timed out. Choose a sign-in method to start again." |
| Malformed code | 400 | `VALIDATION_FAILED` | Field-level: "Enter the 6-digit code shown above." |

**Acceptance criteria:**
- AC-1: A seeded generic-MFA identity signs in successfully using the displayed code.
- AC-2: An unknown username produces `AUTH_FAILED` with identical copy, status, and response-time profile to a known username with a wrong code — verified by `FR-F19-02`.
- AC-3: No response body or log line ever contains the submitted code.
- AC-4: Six consecutive wrong codes lock the transaction and return `AUTH_ATTEMPTS_EXCEEDED`.

---

### FR-F00-05 — Synthetic identity to role and attribute binding

**Description:** Each synthetic identity is bound to one or more roles plus the attribute set that drives ABAC (`FR-F02-03`).

**Inputs:** Seeded rows in `Y0a.users`, `Y0a.user_roles`, `Y0a.user_attributes`.

**Processing / business rules:**
1. On session issuance the hub materializes the full principal (§3.1) from the identity's role and attribute rows. Roles and attributes are never read from a request.
2. If an identity holds more than one role, `activeRole` defaults to the highest-privilege role by the order `ADMINISTRATOR > ADJUDICATOR > INVESTIGATOR > APPLICANT`, and the user may switch active role via the header control (`FR-F03-05`).
3. Switching active role re-evaluates entitlements server-side and writes a `ROLE_CONTEXT_SWITCHED` audit record. It does not create a new session and does not require re-authentication.
4. `APPLICANT` identities MUST have a non-null `subjectRef`; mission-role identities MUST have a null `subjectRef`. A multi-role identity holding `APPLICANT` plus a mission role is disallowed by seed validation, because it would make data-layer ownership filtering ambiguous.

**Outputs:** A fully populated `Principal` on the session; `GET /api/session` returns it minus internal fields.

**Validation rules (seed-time, enforced by `FR-F17-10`):**
- Every identity has ≥1 role, a non-empty `organization`, a valid `clearanceTier`, and a valid `assignedRegion`.
- `caseAssignments` reference case identifiers that exist in the seeded spoke data.
- At least one identity holds two mission roles (Investigator + Adjudicator) to exercise role switching.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Identity has no roles | 403 | `IDENTITY_NOT_PROVISIONED` | "This demo identity isn't set up with a role yet. Choose a different identity." |
| Requested activeRole not held | 403 | `ROLE_NOT_HELD` | "You don't have that role. Your available roles are shown in the account menu." |

**Acceptance criteria:**
- AC-1: Signing in as each of the four personas yields a principal with the seeded roles and all four attributes populated.
- AC-2: The dual-role identity can switch active role and observe different navigation without re-authenticating; exactly one `AUTH_SUCCESS` and one `ROLE_CONTEXT_SWITCHED` record exist.
- AC-3: No API response ever accepts `roles` or `activeRole` from the request body for authorization purposes.

---

### FR-F00-06 — Session timeout, warning, and re-authentication (SCR-06)

**Description:** Sessions expire on inactivity with an accessible advance warning and a path back in that does not lose the user's place.

**Inputs:** Client inactivity timer; `POST /api/session/extend`.

**Processing / business rules:**
1. Session idle timeout is 30 minutes; absolute maximum lifetime is 8 hours. Both are configuration values.
2. At 2 minutes remaining, the UI opens a USWDS modal (SCR-06) with a live countdown and two actions: "Stay signed in" and "Sign out now."
3. The countdown is announced to assistive technology via an `aria-live="polite"` region at open, at 60 seconds, and at 15 seconds — not on every tick (`FR-F14-07`).
4. "Stay signed in" calls `POST /api/session/extend`, which resets idle expiry server-side and returns the new `expiresAt`. It does not extend the absolute maximum.
5. On expiry, the client is redirected to SCR-01 with `returnTo` set to the current path and a site-alert: **"You were signed out because of inactivity. Sign in again to pick up where you left off."**
6. After re-authentication as the same identity, the user returns to `returnTo` with the work queue's saved view state restored (`FR-F05-09`).
7. Expiry writes a `SESSION_EXPIRED` audit record.

**Outputs:** Modal, extended session, or redirect to login with context preserved.

**Validation rules:**
- `extend` requires a currently valid (not yet expired) session; an expired session cannot be extended.
- `returnTo` revalidated on use per `FR-F00-01`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Extend after expiry | 401 | `SESSION_EXPIRED` | "You were signed out because of inactivity. Sign in again to pick up where you left off." |
| Absolute lifetime reached | 401 | `SESSION_MAX_LIFETIME` | "Your session reached its time limit. Sign in again to continue." |

**Acceptance criteria:**
- AC-1: The warning modal appears at 2 minutes remaining, traps focus, and is fully keyboard-operable.
- AC-2: "Stay signed in" extends the session without a page reload and without losing form input.
- AC-3: Post-expiry re-authentication returns the user to the page they were on.

---

### FR-F00-07 — Logout and full context termination (SCR-07)

**Description:** Sign-out terminates the hub session and every downstream spoke context established under it.

**Inputs:** `POST /api/auth/logout` (authenticated).

**Processing / business rules:**
1. Hub marks the session `TERMINATED`, clears the session cookie with an immediate expiry, and invalidates every per-spoke context handle held for that session (`FR-F01-04`).
2. Hub calls each adapter's `revokeContext(sessionId)` where the registry declares support; failures are logged as integration issues (`FR-F16-09`) but never block logout.
3. Hub writes one `LOGOUT` audit record.
4. User lands on SCR-07 with copy: **"You're signed out. Your session and all connected application access have ended."** and a "Sign in again" action.
5. Pressing browser Back after logout MUST NOT render cached authenticated content; authenticated responses set `Cache-Control: no-store`.

**Outputs:** Cleared session, SCR-07.

**Validation rules:** Logout is idempotent; calling it without a session returns 204 and renders SCR-07.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Spoke revocation failed | 200 | — | No user-facing error. Logout succeeds; an integration issue is recorded. |

**Acceptance criteria:**
- AC-1: After logout, every authenticated API call with the old cookie returns 401 `SESSION_INVALID`.
- AC-2: Back-navigation after logout shows SCR-01 or SCR-07, never a cached dashboard.
- AC-3: Exactly one `LOGOUT` audit record per sign-out.

---

### FR-F00-08 — Simulation labeling (non-negotiable)

**Description:** Nothing in the authentication experience may imply real credential validation.

**Processing / business rules:**
1. SCR-01 through SCR-05 each carry a visible simulation notice (`FR-F00-01` step 4 copy, or method-specific equivalent).
2. Every synthetic certificate, issuer, and serial number carries a "(synthetic)" marker.
3. The words "verified," "validated," "authenticated against," and "trusted certificate" MUST NOT appear in authentication UI copy. Permitted verbs: "selected," "simulated," "demo."
4. The global demo banner is present on all authentication screens including error and timeout screens.

**Acceptance criteria:**
- AC-1: Automated copy scan (`FR-F19-08`) finds zero prohibited terms on authentication routes.
- AC-2: The demo banner and the simulation notice both appear on every authentication screen, verified per-route.

---
## F1 — Unified Session and Single Sign-On Across All Spokes

**Traces to:** PRD F1 (P0). **Screens:** global header session control (SCR-08 shell), all authenticated screens. **API:** `Y1a §Session`.

**Description:** One authentication establishes authorized access to every connected spoke for the life of the session. The hub holds the only session the user has; spokes never see the browser and never issue their own login. On every adapter call the hub presents an attested principal — identity, roles, attributes, correlation ID — signed by the hub. The user never re-authenticates when moving between work owned by different systems, including on deep links.

**Terminology:**
- **Hub session** — the single server-side session record (`Y0a.sessions`) keyed by a signed, HttpOnly cookie.
- **Attested principal** — the hub-signed assertion passed to a spoke on every call (`X-UAL-Principal`).
- **Spoke context handle** — a per-session, per-spoke opaque handle the spoke may issue to model its own session, held only by the hub.
- **Correlation ID** — a per-user-action ULID propagated hub → adapter → spoke and into audit.

---

### FR-F01-01 — Single server-side session issuance

**Description:** Session creation on successful authentication, with no role or entitlement data stored client-side.

**Inputs:** Successful auth completion from `FR-F00-02/03/04`: `{ identityId, identityMethod, transactionId }`.

**Processing / business rules:**
1. Hub creates a row in `Y0a.sessions`: `sessionId` (ULID), `principalId`, `identityMethod`, `activeRole`, `createdAt`, `lastActivityAt`, `idleExpiresAt`, `absoluteExpiresAt`, `status = ACTIVE`, `userAgentHash`, `ipHash`.
2. Hub sets a cookie `ual_session` with attributes `HttpOnly; Secure; SameSite=Lax; Path=/`. The cookie value is the signed `sessionId` only — no roles, no attributes, no entitlements.
3. Every authenticated response sets `Cache-Control: no-store`.
4. A CSRF token is issued as a separate readable cookie and required as an `X-CSRF-Token` header on all state-changing requests.
5. The principal is rebuilt from the database on every request. A stale in-memory copy MUST NOT outlive a request.

**Outputs:** `Set-Cookie: ual_session=…`; response body `{ principal, entitlements, expiresAt }`.

**Validation rules:**
- Session cookie signature valid; `sessionId` exists and `status = ACTIVE`; `now < idleExpiresAt` and `now < absoluteExpiresAt`.
- Mismatched `userAgentHash` invalidates the session (defense against cookie replay in the demo).

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Missing/invalid cookie on authenticated route | 401 | `SESSION_INVALID` | "You're not signed in. Sign in to continue." |
| Session terminated | 401 | `SESSION_INVALID` | Same copy — terminated and unknown are indistinguishable. |
| Missing/invalid CSRF token | 403 | `CSRF_REJECTED` | "Your request couldn't be completed. Refresh the page and try again." |

**Acceptance criteria:**
- AC-1: The session cookie contains no role, attribute, or entitlement data (inspected by test).
- AC-2: Editing the cookie value invalidates the session rather than escalating privilege.
- AC-3: A state-changing request without the CSRF header is rejected with 403 and audited as `AUTHZ_DENIED`.

---

### FR-F01-02 — Attested principal propagation to spokes

**Description:** The contract by which a spoke learns who is acting, without ever trusting the browser.

**Inputs:** Hub-internal: `Principal`, `correlationId`, target `applicationId`, adapter operation name.

**Processing / business rules:**
1. Before any adapter call, the hub constructs a principal assertion:
   ```json
   {
     "principalId": "USR-0007",
     "displayName": "Marcus Vale",
     "activeRole": "INVESTIGATOR",
     "roles": ["INVESTIGATOR"],
     "attributes": { "organization": "DCSA-FIELD-OPS-EAST", "clearanceTier": "T5",
                     "assignedRegion": "REGION-NE", "subjectRef": null },
     "sessionId": "SES-01JD…",
     "issuedAt": "2026-09-14T15:04:11Z",
     "expiresAt": "2026-09-14T15:09:11Z",
     "audience": "PVQ",
     "correlationId": "01JD7K2Q9X8V3MZ4R6T"
   }
   ```
2. The assertion is serialized, signed with the hub's assertion key, and sent as header `X-UAL-Principal`. `audience` binds the assertion to one target application; a spoke MUST reject an assertion whose `audience` is not itself.
3. Assertion lifetime is 5 minutes, independent of session lifetime, and is minted fresh per call.
4. Headers on every adapter call: `X-UAL-Principal`, `X-UAL-Correlation-Id`, `X-UAL-Request-Id` (unique per call), `X-UAL-Adapter-Version`.
5. `caseAssignments` is NOT sent to spokes; the hub evaluates assignment-based authorization itself (`FR-F02-04`) so a spoke cannot be tricked into widening scope.
6. Spokes MUST verify signature, `audience`, and expiry, and MUST reject an unsigned or browser-originated request. Spoke APIs are not reachable from the browser in the demo topology.

**Outputs:** Adapter call carrying the attested principal.

**Validation rules (spoke side):** signature valid; `audience == self`; `now < expiresAt`; `principalId` present. Failure → 401 `PRINCIPAL_REJECTED` returned to the adapter, surfaced as an integration issue (`FR-F16-09`), never as a login prompt to the user.

**Error handling:**

| Scenario | HTTP (hub→user) | Code | User-facing message |
|---|---|---|---|
| Spoke rejects assertion | 502 | `UPSTREAM_REJECTED` | "The {System} system couldn't process this request. We've logged the problem — reference {correlationId}." |
| Assertion signing key unavailable | 500 | `INTERNAL_ERROR` | "Something went wrong on our side. Try again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Every adapter call in a captured trace carries a signed assertion with the correct `audience`.
- AC-2: Replaying a PVQ-audience assertion against the eApp service is rejected with `PRINCIPAL_REJECTED`.
- AC-3: A direct browser call to a spoke port with the session cookie is rejected (no principal assertion present).

---

### FR-F01-03 — Zero re-authentication guarantee

**Description:** Traversing work owned by different spokes never prompts for credentials, opens a new tab, or leaves the unified shell.

**Inputs:** User navigation across any combination of spoke-owned screens within one session.

**Processing / business rules:**
1. All spoke data reaches the UI through hub BFF endpoints only. The UI MUST NOT contain any link, iframe, or redirect whose origin is a spoke service.
2. Deep links (`/work/PVQ:ISS-2207`) on an unauthenticated browser redirect to SCR-01 with `returnTo`, and after sign-in land directly on the requested item — one authentication, not two.
3. The hub MUST NOT emit any 401/403 to the browser that results in a login form while the hub session remains valid. A spoke-side authorization failure surfaces as a permission or availability error, never as a credential prompt.
4. A session-scoped counter of authentication events is exposed at `GET /api/session` as `authEventCount` for demonstration and test assertion.

**Outputs:** Continuous navigation; `authEventCount == 1` across the flagship workflow.

**Validation rules:** Automated link crawl (`FR-F19-08`) asserts zero outbound links to spoke origins.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Spoke returns authorization failure for a valid principal | 403 | `AUTHZ_DENIED_UPSTREAM` | "You don't have access to this item in {System}." |

**Acceptance criteria:**
- AC-1: The flagship workflow (F7) produces exactly one `AUTH_SUCCESS` audit record (SM-02).
- AC-2: A scripted traversal touching all five spokes produces exactly one authentication event.
- AC-3: No screen in the application navigates to a non-hub origin.

---

### FR-F01-04 — Per-spoke context handles and invalidation

**Description:** Where a spoke models its own session, the hub holds the handle and disposes of it on logout — transparently to the user.

**Inputs:** Adapter responses carrying `contextHandle`; logout or session expiry events.

**Processing / business rules:**
1. If an adapter's `describe()` declares `supportsContext: true`, the hub establishes a handle on first use per session via `establishContext(principal)` and stores it in `Y0a.spoke_contexts` `{ sessionId, applicationId, contextHandle, establishedAt, lastUsedAt }`.
2. Subsequent calls for that session and application include the handle.
3. On logout, expiry, or session termination the hub calls `revokeContext(handle)` for every held handle, then deletes the rows. Revocation failures are recorded as integration issues and do not block termination.
4. If a spoke rejects a handle as stale (`CONTEXT_EXPIRED`), the adapter transparently re-establishes once and retries the original call. A second failure surfaces as `UPSTREAM_UNAVAILABLE`. The user is never told about handles.

**Outputs:** Handles established, used, and revoked without user involvement.

**Validation rules:** A handle is only ever used with the session and application that created it.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Handle rejected twice | 503 | `UPSTREAM_UNAVAILABLE` | "{System} isn't responding right now. Your other work is still available." |

**Acceptance criteria:**
- AC-1: After logout, `Y0a.spoke_contexts` contains zero rows for that session.
- AC-2: A forced stale handle causes one transparent re-establishment and a successful user-visible result.

---

### FR-F01-05 — Session state surfaced in the UI

**Description:** The header always shows who the user is, in what role context, and how much session time remains.

**Inputs:** `GET /api/session` → `{ displayName, activeRole, roles[], identityMethod, expiresAt, authEventCount }`.

**Processing / business rules:**
1. The global header renders: display name, active role badge, sign-in method label ("via CAC/PIV (simulated)"), a session timer, and an account menu containing role switch (when `roles.length > 1`), "Accessibility statement," and "Sign out."
2. The timer updates client-side from `expiresAt` and re-syncs on every successful API response via the `X-UAL-Session-Expires` response header.
3. The timer is presented as text ("Session expires in 24 minutes"), never color-only, and is not an `aria-live` region except at the thresholds in `FR-F00-06`.
4. The account menu is a keyboard-operable USWDS nav dropdown with `aria-expanded` state.

**Outputs:** Header chrome reflecting live session state on every screen.

**Validation rules:** Role switch options are exactly the roles held; an unavailable role is never listed.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Session lookup fails | 401 | `SESSION_INVALID` | "You're not signed in. Sign in to continue." |

**Acceptance criteria:**
- AC-1: Every authenticated screen displays identity, active role, method, and remaining time.
- AC-2: The account menu is reachable and operable by keyboard alone with visible focus.

---

### FR-F01-06 — Correlation identifier lifecycle

**Description:** One user action produces one correlation ID that appears on every hub operation, adapter call, audit record, and error entry belonging to it.

**Inputs:** Inbound request; optional client-supplied `X-Correlation-Id`.

**Processing / business rules:**
1. The hub generates a ULID `correlationId` at the edge for each inbound request unless the request carries an `X-Correlation-Id` that matches `^[0-9A-HJKMNP-TV-Z]{26}$`, in which case it is adopted (this lets the UI tie a multi-request user action together, e.g. the flagship workflow).
2. The ID is attached to: the request log, every adapter call header, every audit record written during the request, every integration issue recorded, and the error envelope of any failure response.
3. Responses always return `X-Correlation-Id`.
4. Orchestrated actions (`FR-F07b-01`) reuse one correlation ID across both spoke writes and both audit records, producing a single chain in the audit viewer (`FR-F07b-06`).

**Outputs:** `X-Correlation-Id` on every response; correlated rows in `Y0a.audit_events` and `Y0a.integration_issues`.

**Validation rules:** A malformed client-supplied ID is ignored (a fresh one is generated), never echoed.

**Error handling:** None user-facing; correlation failures are internal and non-blocking, but a missing correlation ID on an audit write is a hard failure (`FR-F13-01`).

**Acceptance criteria:**
- AC-1: Every error the user can see displays a correlation ID that retrieves the matching audit chain in the viewer.
- AC-2: The flagship workflow's audit chain contains ≥5 records sharing one correlation ID (SM-20).

---
## F2 — Role- and Attribute-Based Access Control, Enforced Server-Side

**Traces to:** PRD F2 (P0); NFR-04, NFR-05, SM-18. **Screens:** SCR-30 Access denied; affects every screen via entitlements. **API:** every endpoint in `Y1a`.

**Description:** Authorization for the four roles is evaluated on the server for every request at the resource level, combining role, attributes, and resource ownership. Client-side conditional rendering exists for usability and is never the control. This requirement set defines the authorization decision function, its inputs, its outputs, where it is invoked, and how applicant data isolation is enforced at the data layer rather than the view layer.

**Terminology:**
- **PDP (policy decision point)** — the single hub function `authorize(request) → Decision`. There is exactly one implementation; no endpoint hand-rolls its own check.
- **PEP (policy enforcement point)** — the middleware and data-access wrappers that call the PDP and act on the result.
- **Entitlements** — the server-computed set of navigation items, permissions, and per-resource actions returned to the UI for rendering only.
- **Ownership predicate** — a mandatory query-level filter injected into every list operation, derived from the principal.

---

### FR-F02-01 — The authorization decision function

**Description:** A single, total function evaluated on every request. It is the only place an allow/deny decision is made.

**Inputs (the complete decision input, `AuthzRequest`):**
- `principal` (Principal, §3.1) — resolved server-side from the session; never from the request body, query string, or any header the browser can set
- `action` (string) — the operation verb, e.g. `WORK_ITEM.READ`, `WORK_ITEM.ACT`, `ADMIN.APP.REGISTER`, `AUDIT.READ_ALL`
- `resourceType` (enum: `WORK_ITEM` | `CASE` | `ISSUE` | `APPLICATION` | `ANNOUNCEMENT` | `AUDIT_RECORD` | `USER` | `DASHBOARD` | `NAV`)
- `resourceRef` (object | null) — `{ sourceSystem, nativeId }` for resource-scoped decisions; null only for collection-level decisions that are subsequently ownership-filtered
- `resourceAttributes` (object | null) — attributes of the resource as reported by its owning system: `{ assigneeId, subjectRef, organization, region, sensitivityTier, statusCategory }`
- `context` (object) — `{ correlationId, requestId, method, path, now, sourceHealth }`

**Processing / business rules (evaluation order; first match wins):**
1. **Session gate.** If no valid session → `DENY(SESSION_INVALID)`.
2. **Role gate.** Look up `(activeRole, action)` in the permission matrix (`FR-F02-02`). If absent → `DENY(AUTHZ_DENIED)`.
3. **Attribute gate.** Evaluate the attribute rules for `(activeRole, resourceType)` (`FR-F02-03`). Any failing rule → `DENY(AUTHZ_DENIED)`.
4. **Ownership gate.** For resource-scoped decisions, evaluate the ownership predicate (`FR-F02-04`). Failure → `DENY(AUTHZ_DENIED)`.
5. **Action-state gate.** For `*.ACT`, verify the action is in the server-computed action list for this principal and this resource *in its current state* (`FR-F02-05`). Failure → `DENY(ACTION_NOT_AVAILABLE)`.
6. Otherwise → `ALLOW`.
7. Decisions are computed fresh per request. Caching of a decision beyond the request is prohibited; entitlement caching for rendering is permitted for at most 60 seconds and is never load-bearing.

**Outputs:** `Decision = { effect: ALLOW | DENY, reasonCode, ruleId, obligations[] }`. `obligations` may include `REDACT_FIELDS: [...]` for partial reads (e.g., an applicant sees their own case without investigator narrative fields).

**Validation rules:**
- The function MUST be total: an unmapped `(role, action)` pair denies. There is no default-allow branch.
- `principal.activeRole` MUST be one of `principal.roles`, re-checked at decision time.
- Any request carrying `role`, `roles`, `principalId`, or `entitlements` in body/query is rejected with `VALIDATION_FAILED` — these are reserved names, and accepting them silently would be a latent bypass.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Denied (any reason) | 403 | `AUTHZ_DENIED` | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {correlationId}." |
| Action not available in current state | 409 | `ACTION_NOT_AVAILABLE` | "This action isn't available for this item right now. Refresh the page to see the current options." |
| Reserved field supplied by client | 400 | `VALIDATION_FAILED` | "Your request couldn't be completed. Refresh the page and try again." |

**Acceptance criteria:**
- AC-1: Every hub endpoint invokes the PDP; a test enumerating routes finds zero endpoints without a PDP call.
- AC-2: A request body containing `"activeRole": "ADMINISTRATOR"` from an Applicant session is rejected and changes nothing.
- AC-3: Every DENY writes an audit record (`FR-F02-07`).

---

### FR-F02-02 — Role permission matrix

**Description:** The documented, data-held mapping of role to permitted actions. Held in `Y0a.role_permissions`, not in code branches.

**Processing / business rules:** The matrix (✓ = permitted, subject to attribute and ownership gates):

| Action | Investigator | Adjudicator | Applicant | Administrator |
|---|:--:|:--:|:--:|:--:|
| `NAV.READ` (own entitlements) | ✓ | ✓ | ✓ | ✓ |
| `DASHBOARD.READ` | ✓ | ✓ | ✓ | ✓ |
| `WORK_QUEUE.LIST` | ✓ | ✓ | ✓ | — |
| `WORK_ITEM.READ` | ✓ | ✓ | ✓ | — |
| `WORK_ITEM.ACT` | ✓ | ✓ | ✓ (own tasks only) | — |
| `CASE.READ` (eApp) | ✓ | ✓ | ✓ (own) | — |
| `ISSUE.READ` (PVQ) | ✓ | ✓ | — | — |
| `ISSUE.RESOLVE` (PVQ) | ✓ | — | — | — |
| `ISSUE.REQUEST_CLARIFICATION` | ✓ | ✓ | — | — |
| `CASE.ADJUDICATE` | — | ✓ | — | — |
| `DESIGNATION.READ` (PDT) | ✓ | ✓ | — | ✓ |
| `DESIGNATION.APPROVE` (PDT) | — | ✓ | — | — |
| `NOTICE.READ` (IEP) | — | — | ✓ | — |
| `NOTICE.ACKNOWLEDGE` (IEP) | — | — | ✓ | — |
| `AUDIT.READ_OWN` | ✓ | ✓ | ✓ | ✓ |
| `AUDIT.READ_ALL` | — | — | — | ✓ |
| `ADMIN.APP.LIST` / `.READ` | — | — | — | ✓ |
| `ADMIN.APP.REGISTER` / `.EDIT` / `.DISABLE` / `.DEREGISTER` | — | — | — | ✓ |
| `ADMIN.HEALTH.READ` / `.PROBE` | — | — | — | ✓ |
| `ADMIN.ISSUES.READ` | — | — | — | ✓ |
| `ADMIN.ANNOUNCEMENT.*` | — | — | — | ✓ |
| `ADMIN.USER.READ` | — | — | — | ✓ |
| `ADMIN.FAILURE_INJECTION.*` | — | — | — | ✓ |

Rules:
1. Administrators do NOT receive mission work-item access. Operating the platform and doing mission work are separate concerns; conflating them would weaken the least-privilege demonstration. An Administrator opening a work-item URL receives `AUTHZ_DENIED`.
2. Adding a permission is a data change in `Y0a.role_permissions`; it MUST NOT require a code change (NFR-19).
3. The matrix is rendered read-only in the admin console (`FR-F11-07`) so a reviewer can see the policy rather than infer it.

**Outputs:** Permission rows consumed by the PDP and by `GET /api/entitlements`.

**Validation rules:** Every `action` string referenced by any endpoint MUST exist in the matrix; a startup check fails the build otherwise.

**Error handling:** Missing matrix row → treated as DENY, and an `INTERNAL_POLICY_GAP` integration issue is recorded for the administrator.

**Acceptance criteria:**
- AC-1: For each of the four roles, every permitted action succeeds and every non-permitted action returns 403 — 4 roles × full matrix, automated (`FR-F19-02`).
- AC-2: The startup check fails if any endpoint references an unknown action string.

---

### FR-F02-03 — Attribute rules layered on role

**Description:** Attributes narrow role grants. Role alone never suffices for a resource-scoped decision.

**Inputs:** `principal.attributes`, `resourceAttributes`.

**Processing / business rules:**

| Role | Rule ID | Rule |
|---|---|---|
| Investigator | `ATTR-INV-01` | May read a work item only if `resourceAttributes.assigneeId == principal.principalId` **or** (`resourceAttributes.organization == principal.attributes.organization` **and** `resourceAttributes.region == principal.attributes.assignedRegion`). This is the "assigned to me or my unit" rule. |
| Investigator | `ATTR-INV-02` | May act on a work item only if `assigneeId == principalId`. Unit visibility grants read, not write. |
| Investigator | `ATTR-INV-03` | May read a case only if `resourceAttributes.sensitivityTier <= principal.attributes.clearanceTier` (ordering `T1 < T3 < T5`). |
| Adjudicator | `ATTR-ADJ-01` | May read items whose `organization` matches, regardless of assignee; may act only on items in `statusCategory` `IN_PROGRESS` or `OPEN` that are routed to adjudication. |
| Adjudicator | `ATTR-ADJ-02` | Clearance-tier rule as `ATTR-INV-03`. |
| Applicant | `ATTR-APP-01` | May read a resource only if `resourceAttributes.subjectRef == principal.attributes.subjectRef`. No organization or region rule applies. |
| Applicant | `ATTR-APP-02` | May act only on work items of type `IEP_TASK` or `EAPP_APPLICANT_RESPONSE` whose `subjectRef` matches. |
| Administrator | `ATTR-ADM-01` | No attribute narrowing on platform resources; full estate visibility for applications, health, issues, audit, users. |
| All | `ATTR-ALL-01` | A disabled application's resources are unreadable by anyone except via the admin console's configuration view. |

Additional rules:
1. Rules are evaluated conjunctively within a role; all applicable rules must pass.
2. Rule IDs are returned in the `Decision.ruleId` and recorded in the audit record for a denial, so a reviewer can see *which* rule denied.
3. Clearance-tier comparison uses a defined ordinal map; string comparison is prohibited.

**Outputs:** Pass/fail per rule; `ruleId` of the first failing rule.

**Validation rules:** `resourceAttributes` MUST come from the owning spoke's response, never from the client. If a spoke omits an attribute needed by a rule, the decision is DENY with `reasonCode: INSUFFICIENT_RESOURCE_ATTRIBUTES` — fail closed.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Attribute rule failed | 403 | `AUTHZ_DENIED` | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {correlationId}." |
| Resource attributes unavailable | 403 | `AUTHZ_DENIED` | Same copy — fail closed, no disclosure. |

**Acceptance criteria:**
- AC-1: Investigator A can read but not act on a unit-mate's item; the disabled action carries the reason "This item is assigned to {name}."
- AC-2: A `T3` investigator receives 403 on a `T5` case, and the audit record names `ATTR-INV-03`.
- AC-3: An applicant requesting another subject's record receives 403 identical in body and timing to a request for a non-existent record.

---

### FR-F02-04 — Applicant data isolation enforced at the data layer

**Description:** An applicant can read only their own records. This is enforced by an ownership predicate injected into the data access path, not by filtering a fetched list and not by hiding UI.

**Inputs:** `principal`, target operation, target application(s).

**Processing / business rules:**
1. The hub exposes a single spoke-query wrapper. Every adapter list/get call passes through it. The wrapper computes a mandatory `scope` object from the principal and attaches it to the adapter request:
   - `APPLICANT` → `{ mode: "SUBJECT", subjectRef: principal.attributes.subjectRef }`
   - `INVESTIGATOR` → `{ mode: "ASSIGNEE_OR_UNIT", principalId, organization, assignedRegion }`
   - `ADJUDICATOR` → `{ mode: "ORG", organization }`
   - `ADMINISTRATOR` → `{ mode: "NONE" }` (no work-item access; platform resources only)
2. **Spokes MUST apply the scope in their own query.** A spoke receiving `mode: "SUBJECT"` returns only rows matching that `subjectRef`; it does not return a full set for the hub to filter. This is asserted by `FR-F19-03` conformance tests calling spoke APIs directly.
3. **The hub re-applies the same predicate after receiving results** (defense in depth). Any row violating the predicate is dropped, and an `INTEGRATION_SCOPE_VIOLATION` issue is recorded naming the offending application — a spoke leaking out-of-scope rows is an operational defect, surfaced, not silently tolerated.
4. `getWorkItem` on a specific ID follows the identical path: the scope accompanies the get, and the post-check re-verifies `subjectRef`/assignment before the response is composed. There is no code path that fetches a resource and then decides.
5. Applicant reads receive the obligation `REDACT_FIELDS: ["investigatorNotes", "issueNarrativeInternal", "adjudicationRationale"]`, applied by the hub before serialization.

**Outputs:** Result sets that cannot contain out-of-scope rows; violation issues when a spoke misbehaves.

**Validation rules:**
- `subjectRef` MUST be non-null for an applicant session; a null value fails closed with `IDENTITY_NOT_PROVISIONED`.
- The wrapper MUST refuse to issue an adapter call with an absent `scope` — absence is a programming error, not a permissive default.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Out-of-scope get | 403 | `AUTHZ_DENIED` | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {correlationId}." |
| Spoke returned out-of-scope rows | 200 (filtered) | — | No user-facing error; rows dropped, issue logged for the administrator. |
| Missing scope on internal call | 500 | `INTERNAL_ERROR` | "Something went wrong on our side. Try again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Calling the spoke API directly with `mode: "SUBJECT"` for subject X returns zero rows belonging to subject Y (`FR-F19-03`).
- AC-2: A deliberately mis-scoped spoke response results in filtered output plus one `INTEGRATION_SCOPE_VIOLATION` entry.
- AC-3: Applicant API responses never contain redacted field names, verified by schema assertion.

---

### FR-F02-05 — Action-level authorization and server-computed action lists

**Description:** Viewing an item and acting on it are separate decisions. The list of actions is computed by the server and re-authorized at execution.

**Inputs:** `principal`, resource state from the owning spoke, registry-declared supported actions for the application and work-item type.

**Processing / business rules:**
1. On `GET /api/work-items/{id}`, the hub asks the adapter for `availableActions` given the principal and item state, then intersects that list with the role matrix and attribute rules, producing `ActionDescriptor[]` (§3.3).
2. An action the principal could perform but cannot right now (wrong state, unavailable spoke, item assigned to someone else) is returned with `enabled: false` and a plain-language `disabledReason`. It is shown, disabled, with the reason — not hidden — because a hidden control teaches the user nothing.
3. An action the principal may never perform in this role is omitted entirely.
4. On `POST /api/work-items/{id}/actions/{actionId}`, the full decision (`FR-F02-01` steps 1–5) is re-run against freshly fetched resource state. A stale action list MUST NOT authorize anything.
5. Optimistic concurrency: the detail response carries `stateVersion`; the action request must echo it. A mismatch returns `STATE_CONFLICT`.

**Outputs:** `ActionDescriptor[]` on read; execution result or denial on write.

**Validation rules:** `actionId` must be declared by the registry for that application and work-item type; unknown action IDs return `ACTION_NOT_AVAILABLE`, not 404.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Action not permitted for role | 403 | `AUTHZ_DENIED` | "You don't have permission to do that." |
| Action not valid in current state | 409 | `ACTION_NOT_AVAILABLE` | "This action isn't available for this item right now. Refresh the page to see the current options." |
| Stale `stateVersion` | 409 | `STATE_CONFLICT` | "This item changed since you opened it. Refresh to see the latest version, then try again." |

**Acceptance criteria:**
- AC-1: The same work item opened by an Investigator and an Adjudicator yields different action lists (demo script §RBAC).
- AC-2: Posting an action absent from the returned list is denied server-side.
- AC-3: A concurrent change produces `STATE_CONFLICT` rather than a silent overwrite.

---

### FR-F02-06 — Entitlements endpoint drives navigation and controls

**Description:** The UI renders navigation and global controls from server-provided entitlements so it never advertises what the user cannot do.

**Inputs:** `GET /api/entitlements` (authenticated).

**Processing / business rules:**
1. Response: `{ activeRole, roles[], navigation: [{ id, label, href, icon, order, badgeCount }], permissions: [action strings], featureFlags: {}, defaultLanding: "/dashboard" }`.
2. `navigation` is computed from the role matrix intersected with the registry (`FR-F08b-04`): an application that is disabled or de-registered contributes no nav items.
3. Every navigation entry MUST resolve to an implemented route with real content. A CI check (`FR-F19-08`) crawls each role's navigation and fails on 404, empty shell, or a control with no handler.
4. The UI treats entitlements as presentation input only. Hiding a control is never the security boundary — `FR-F02-01` is.
5. Entitlements are re-fetched on role switch, on application enable/disable (via a polled `registryVersion`), and on session resume.

**Outputs:** Navigation and permission set for the current principal.

**Validation rules:** `navigation[].href` must be same-origin and must exist in the route table.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Entitlement computation failure | 500 | `INTERNAL_ERROR` | "We couldn't load your menu. Refresh the page — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Four roles produce four visibly different navigation sets (SM-23).
- AC-2: Disabling an application in the admin console removes its nav entry for all users within one `registryVersion` poll, with no restart.
- AC-3: Zero dead links across all roles.

---

### FR-F02-07 — Denial handling, audit, and non-enumeration (SCR-30)

**Description:** Denials are consistent, accessible, non-enumerable, and always audited.

**Inputs:** Any `DENY` decision.

**Processing / business rules:**
1. Every denial returns HTTP 403 with the standard envelope. A non-existent resource and a forbidden resource return the **same status, same code, same message, and same response shape**. Response time is normalized to a 120 ms floor to prevent timing enumeration.
2. Every denial writes an audit record: `action = AUTHZ_DENIED`, `outcome = DENIED`, with `ruleId`, `resourceType`, `resourceRef` (hashed for non-existent resources), `correlationId`.
3. A denied page navigation renders SCR-30 "Access denied" inside the shell: heading "You don't have access to this page," the plain-language explanation, the correlation ID in a copyable field, and two actions — "Go to my dashboard" and "Go to my work queue." Never a blank page, never a stack trace.
4. SCR-30 sets `<title>Access denied — DCSA Unified Layer</title>`, moves focus to the `<h1>`, and announces the error via an `aria-live="assertive"` region.
5. Denials in embedded contexts (a dashboard widget, a related-items panel) render an inline USWDS alert rather than replacing the page.

**Outputs:** SCR-30 or inline alert; one audit record per denial.

**Validation rules:** Denial responses MUST NOT include resource titles, subject names, or existence hints.

**Error handling:** This requirement *is* the error handling; failures to audit a denial escalate per `FR-F13-01` (the request fails rather than completing unaudited).

**Acceptance criteria:**
- AC-1: An authenticated Applicant calling an Investigator-only endpoint directly is denied and the denial appears in the audit viewer (PRD F2 acceptance signal, SM-18).
- AC-2: Requests for a forbidden ID and a fabricated ID are byte-identical apart from the correlation ID.
- AC-3: SCR-30 passes the automated accessibility scan and is keyboard-navigable.

---

### FR-F02-08 — Role and attribute visibility for administrators

**Description:** Administrators can see who holds which roles and attributes, and every assignment is auditable.

**Inputs:** `GET /api/admin/users`, `GET /api/admin/users/{id}`.

**Processing / business rules:**
1. The admin console lists synthetic identities with display name, roles, all four attributes, sign-in methods allowed, and last activity timestamp.
2. The user detail view shows recent audit activity for that identity (last 50 records) with links into the audit viewer.
3. Role assignment changes are out of scope for this prototype's UI (identities are seeded), but the schema and audit action `ROLE_ASSIGNED` exist so the capability is demonstrable; any seeded change is recorded.
4. This view is Administrator-only and itself authorized and audited (`ADMIN.USER.READ`).

**Outputs:** SCR-26 User & role visibility list; SCR-27 user detail.

**Validation rules:** Pagination default 25, max 100. Search by display name or role.

**Error handling:** Standard `AUTHZ_DENIED` for non-administrators; empty state copy "No identities match your filters."

**Acceptance criteria:**
- AC-1: An administrator can see the multi-role identity and both of its roles.
- AC-2: Viewing user detail writes an audit record of type `USER_VIEWED` (read of identity data is auditable).

---
## F3 — Unified Navigation Shell and Global Chrome

**Traces to:** PRD F3 (P0); NFR-13, NFR-14, NFR-16, SM-05, SM-06, SM-10. **Screens:** SCR-08 (the shell itself) plus the full screen inventory below. **API:** `Y1a §Entitlements`.

**Description:** The persistent application frame every authenticated screen lives inside — DCSA-themed global header, role-aware primary navigation, breadcrumbs that express cross-application context, session controls, footer, skip link, and the non-dismissible demo banner. This is the presentation-layer feature that makes five systems read as one product, and it is where the "every button works" promise is kept or broken. It is specified as its own requirement set with its own screens and states; it is not a byproduct of any API feature.

**Terminology:**
- **Shell** — the chrome: banner, header, nav, breadcrumb, main landmark, footer. Every route renders inside it, including errors.
- **Page template** — one of four reusable layouts (List, Detail, Form, Console) every screen is built from.
- **Cross-application breadcrumb** — a trail whose segments may belong to different source systems.
- **Dead route** — a navigation target that 404s, renders an empty shell, or shows a non-functional control. The product tolerates zero.

---

### FR-F03-01 — Shell composition and landmark structure (SCR-08)

**Description:** The structural frame and its accessibility semantics.

**Inputs:** `GET /api/entitlements`, `GET /api/session`, current route.

**Processing / business rules:**
1. Document order: skip link → demo banner → USWDS government banner → header (wordmark, primary nav, session controls) → breadcrumb → `<main id="main-content">` → footer.
2. Landmarks: exactly one `<header role="banner">`, one `<nav aria-label="Primary">`, one `<nav aria-label="Breadcrumb">`, one `<main>`, one `<footer role="contentinfo">`. Additional navs carry distinct `aria-label`s.
3. Exactly one `<h1>` per page, which is the page's own title, not the product name.
4. `document.title` is set on every navigation as `{Page name} — DCSA Unified Layer`, and the new page's `<h1>` receives focus on client-side route change so screen-reader users are not stranded.
5. The shell renders for authenticated and unauthenticated routes alike; unauthenticated routes show the banner and footer but no primary nav.
6. Responsive: at <640px the primary nav collapses to a USWDS menu button with `aria-expanded`, focus trapped while open, Escape closes and restores focus. No horizontal scrolling at 320px; usable at 200% zoom (NFR-16).

**Outputs:** A consistent frame on every route.

**Validation rules:** A route MUST NOT render outside the shell. A CI check asserts the shell's landmark set and single-`h1` rule on every route for every role.

**Error handling:** If entitlements fail to load, the shell renders with the banner, header identity, and an inline alert "We couldn't load your menu. Refresh the page — reference {correlationId}." The user is never left with a bare page.

**Acceptance criteria:**
- AC-1: Every route for every role renders the full landmark set (automated).
- AC-2: Page title and focus update on client-side navigation.
- AC-3: No horizontal scroll at 320px on any route.

---

### FR-F03-02 — Screen inventory (every route maps to a real screen)

**Description:** The complete enumeration of screens, their purpose, the roles that can reach them, their data sources, and their required states. Every primary navigation item maps to a row here; every row is implemented. There are no placeholder screens.

| ID | Screen | Purpose | Roles | Data source | Owning FR |
|---|---|---|---|---|---|
| SCR-01 | Login — method selection | Choose auth method | Anonymous | `/api/auth/methods` | FR-F00-01 |
| SCR-02 | CAC/PIV certificate picker | Select synthetic cert identity | Anonymous | `/api/auth/initiate` | FR-F00-02 |
| SCR-03 | ECA identity selection | Select ECA identity | Anonymous | `/api/auth/initiate` | FR-F00-03 |
| SCR-04 | Generic MFA — username | Enter demo username | Anonymous | `/api/auth/initiate` | FR-F00-04 |
| SCR-05 | Generic MFA — one-time code | Enter demo code | Anonymous | `/api/auth/complete` | FR-F00-04 |
| SCR-06 | Session timeout warning (modal) | Extend or end session | All | `/api/session/extend` | FR-F00-06 |
| SCR-07 | Signed out | Confirm termination | Anonymous | — | FR-F00-07 |
| SCR-08 | Application shell | Chrome for all routes | All | `/api/entitlements` | FR-F03-01 |
| SCR-09 | Investigator dashboard | Caseload, alerts, due dates | Investigator | `/api/dashboard` | FR-F04-02 |
| SCR-10 | Adjudicator dashboard | Determination queue, status mix | Adjudicator | `/api/dashboard` | FR-F04-03 |
| SCR-11 | Applicant dashboard | Plain-language status, tasks, notices | Applicant | `/api/dashboard` | FR-F04-04 |
| SCR-12 | Administrator dashboard | Platform health, issues, registry | Administrator | `/api/dashboard` | FR-F04-05 |
| SCR-13 | Unified work queue | All assigned work, all sources | Inv, Adj, App | `/api/work-items` | FR-F05-01 |
| SCR-14 | Work-item detail | Review and act | Inv, Adj, App | `/api/work-items/{id}` | FR-F06-01 |
| SCR-15 | eApp case view | Full questionnaire case + related items | Inv, Adj, App (own) | `/api/work-items/EAPP:*` | FR-F06-08 |
| SCR-16 | PVQ issue detail & resolution | Resolve a questionnaire issue | Investigator | `/api/work-items/PVQ:*` | FR-F07a-04 |
| SCR-17 | PDT designation view | Review/approve position designation | Inv, Adj, Admin(read) | `/api/work-items/PDT:*` | FR-F06-09 |
| SCR-18 | IEP applicant status view | Status, notices, outstanding tasks | Applicant | `/api/work-items/IEP:*` | FR-F06-10 |
| SCR-19 | IM case assignment view | Case assignment and leads | Inv, Adj | `/api/work-items/IM:*` | FR-F06-11 |
| SCR-20 | Dual-system confirmation | Per-spoke result of an orchestrated action | Investigator | `/api/orchestration/*` | FR-F07b-04 |
| SCR-21 | Notifications & announcements | All alerts and notices | All | `/api/notifications` | FR-F15-06 |
| SCR-22 | Admin console — connected applications | Registry inventory | Administrator | `/api/admin/applications` | FR-F11-01 |
| SCR-23 | Admin console — application detail | Config, health history, errors, test connection | Administrator | `/api/admin/applications/{id}` | FR-F11-04 |
| SCR-24 | Admin console — system health | Per-app health and latency | Administrator | `/api/admin/health` | FR-F11-02 |
| SCR-25 | Admin console — integration issues | Adapter failure log | Administrator | `/api/admin/integration-issues` | FR-F11-03 |
| SCR-26 | Admin console — identities & roles | Who holds what | Administrator | `/api/admin/users` | FR-F02-08 |
| SCR-27 | Identity detail | Roles, attributes, recent activity | Administrator | `/api/admin/users/{id}` | FR-F02-08 |
| SCR-28 | Application registration (multi-step) | Onboard a new application | Administrator | `/api/admin/applications` | FR-F12-01 |
| SCR-29 | Announcement management | Create/edit/expire announcements | Administrator | `/api/admin/announcements` | FR-F15-04 |
| SCR-30 | Access denied | Explain denial, offer exits | All | — | FR-F02-07 |
| SCR-31 | Not found | Explain missing route, offer exits | All | — | FR-F03-08 |
| SCR-32 | Unexpected error | Global error boundary | All | — | FR-F16-10 |
| SCR-33 | Audit trail viewer | Filterable audit table | Admin (all), others (own) | `/api/audit` | FR-F13-05 |
| SCR-34 | Audit record detail & chain view | One record + its correlation chain | Admin (all), others (own) | `/api/audit/{id}` | FR-F13-06 |
| SCR-35 | Global search results | Search across permitted work items | Inv, Adj, App | `/api/search` | FR-F03-07 |
| SCR-36 | Accessibility statement | Conformance and known limits | All + anonymous | static | FR-F14-11 |
| SCR-37 | Demo operations / service status | Service readiness at a glance | Administrator | `/api/admin/status` | FR-F18-07 |
| SCR-38 | Failure injection controls | Force spoke states for demo | Administrator | `/api/admin/failure-injection` | FR-F16-11 |

**Validation rules:** Every row has an implemented route, a populated state under seeded data, a designed empty state, and a designed error state. No row is marked "coming soon."

**Acceptance criteria:**
- AC-1: An automated crawl per role reaches every reachable screen with HTTP 200 and non-empty `<main>` (SM-05).
- AC-2: Every interactive control on every screen has a handler that produces an observable result (SM-06).

---

### FR-F03-03 — Non-dismissible demo banner

**Description:** A permanent, unhideable indicator that all data is synthetic.

**Processing / business rules:**
1. Rendered server-side into the document at the top of the shell, above the USWDS government banner, on **every** route including SCR-01, SCR-30, SCR-31, SCR-32.
2. Copy: **"Demo — Synthetic Data Only. This prototype contains no real DCSA data, no real personal information, and no connection to any government system."**
3. The element has no close control, no `hidden` attribute path, no CSS class toggled by state, and is not conditional on any feature flag. It carries `data-permanent="true"`.
3a. **Responsive chrome budget (normative).** The banner competes with primary content at 320px, where SCR-11's plain-language status answer must remain above the fold. The resolution is a measured budget, never dismissal:
   - **≥ 1024px:** full copy, single line, ≤ `units(4)`.
   - **640–1023px:** full copy, may wrap to two lines, ≤ `units(6)`.
   - **< 640px:** the **visible** copy truncates to its bold lede — "Demo — Synthetic Data Only." — while **the full sentence in rule 2 remains verbatim in the accessible DOM** in a visually-hidden span, ≤ `units(4)`. The USWDS government banner collapses to its closed accordion state, the header compacts to a single `units(7)` row, and on SCR-11 the `<h1>` and status sentence are the first content in `<main>` with no breadcrumb, page-alert, or announcement region above them.
   - **Total chrome budget at 320px: ≤ `units(15)` (~120px)**, so the status sentence is visible in a 320×568 viewport without scrolling. This is a measured acceptance criterion on SCR-11 (NFR-16, SM-25), not an aspiration.
   Truncation of the *visible* copy is the only permitted variation. It is not a dismissal path, and it never applies to the accessible text.
4. It is not `aria-hidden`, is inside the `banner` landmark, and meets AA contrast in both default and forced-colors modes.
5. It is not the same component as announcements (`FR-F15-04`), which are dismissible, and an announcement MUST NOT overlay it.

**Validation rules:** A CI assertion (`FR-F19-08`) loads every route, for every role, plus error routes, and fails if the banner's **verbatim accessible text** is absent, if a close control exists, or if the banner element is removed from the accessibility tree (`display:none`, `visibility:hidden`, `aria-hidden`, or zero height). The assertion runs at 320px, 768px and 1280px and evaluates **accessible text, not visible text**, so the rule 3a truncation cannot fail a conformant build — while a genuinely hidden banner still fails at every width.

**Error handling:** If banner rendering fails, the page fails — a page without the banner is not served.

**Acceptance criteria:**
- AC-1: 100% of routes present the banner (SM-10, NFR-13), at 320px, 768px and 1280px.
- AC-2: Zero dismissal paths exist, verified by DOM inspection and by grep for a close handler.
- AC-3: At 320×568 the total chrome above `<main>` measures ≤ `units(15)` and SCR-11's status sentence is visible without scrolling (SM-25, NFR-16), while the banner's full sentence is still returned verbatim by the accessibility tree.

---

### FR-F03-04 — Role-differentiated primary navigation

**Description:** Each role gets a distinct navigation set, generated from server entitlements, where every item leads somewhere real.

**Inputs:** `entitlements.navigation` (`FR-F02-06`).

**Processing / business rules:**
1. Default nav sets:
   - **Investigator:** Dashboard, Work Queue, Notifications, My Activity (audit-own), Search
   - **Adjudicator:** Dashboard, Work Queue, Notifications, My Activity, Search
   - **Applicant:** Dashboard, My Tasks, My Notices, My Status, Help
   - **Administrator:** Dashboard, Connected Applications, System Health, Integration Issues, Audit Trail, Identities & Roles, Announcements, Demo Operations
2. Items are ordered by `order` from entitlements; badge counts (e.g. unread alerts) are supplied server-side and rendered as text plus count, never color-only.
3. Current page indication uses `aria-current="page"` plus a visible non-color indicator (weight/underline).
4. Navigation items sourced from registry-backed applications disappear when the application is disabled, without a redeploy.
5. Keyboard: nav is a list of links; dropdowns (if any) are USWDS nav submenus with arrow-key support and Escape to close.

**Outputs:** Rendered primary nav.

**Validation rules:** Zero items without a route; zero routes reachable by a role whose entitlements omit them (server enforces regardless).

**Error handling:** A nav item whose target application is DOWN still renders and still resolves; the destination screen shows the degraded state (`FR-F16-05`) rather than a broken link.

**Acceptance criteria:**
- AC-1: Four roles produce four distinct nav sets, each fully populated.
- AC-2: Disabling an app removes its nav item within one registry poll with no restart (SM-12 inverse).

---

### FR-F03-05 — Session and identity controls in the header

**Description:** Header-resident controls for identity, role context, session time, and sign-out.

**Processing / business rules:**
1. Renders: "Signed in as {displayName}", role badge "{activeRole}", method label "via {method} (simulated)", session timer, account menu.
2. Account menu items: "Switch role" (only when >1 role, listing held roles), "Accessibility statement," "Sign out."
3. Role switch calls `POST /api/session/active-role`, re-fetches entitlements, re-renders nav, and announces via `aria-live="polite"`: "Role changed to {role}. Your menu has been updated."
4. Sign-out posts to `/api/auth/logout` (`FR-F00-07`).
5. On viewports <640px, controls collapse into the menu button but remain reachable — nothing becomes unreachable at small sizes.

**Validation rules:** Role switch offers only held roles; a POST with an unheld role returns `ROLE_NOT_HELD`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Role switch to unheld role | 403 | `ROLE_NOT_HELD` | "You don't have that role. Your available roles are shown in the account menu." |
| Session info unavailable | 401 | `SESSION_INVALID` | "You're not signed in. Sign in to continue." |

**Acceptance criteria:**
- AC-1: Role switch changes navigation and dashboard without re-authentication and writes one audit record.
- AC-2: All header controls are keyboard-reachable with visible focus.

---

### FR-F03-06 — Cross-application breadcrumbs

**Description:** Breadcrumbs that express where the user is across system boundaries, so the flagship workflow never feels like a context switch.

**Inputs:** Route parameters plus server-provided `breadcrumbTrail` on detail responses.

**Processing / business rules:**
1. Detail endpoints return `breadcrumbTrail: [{ label, href, sourceSystem | null }]`. The client does not invent labels from IDs.
2. Cross-system example, exactly as the flagship workflow produces it:
   `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207`
   with the second segment badged "eApp" and the third badged "PVQ".
3. The final segment is plain text with `aria-current="page"`; preceding segments are links that restore their prior state (queue filters, case scroll position).
4. Trail depth is capped at 4; deeper trails collapse the middle with an accessible "Show full trail" disclosure, never with a silent ellipsis.
5. Breadcrumb source-system badges use text plus icon, never color alone.

**Outputs:** Breadcrumb nav on every detail and form screen.

**Validation rules:** Every non-final segment resolves; a segment whose source system is DOWN still renders and leads to that screen's degraded state.

**Error handling:** Missing `breadcrumbTrail` → client renders a minimal trail from the route table and records a client-side telemetry warning; the page still works.

**Acceptance criteria:**
- AC-1: During F7, the breadcrumb names both the eApp case and the PVQ issue with source badges (SM-04 support).
- AC-2: Clicking the case segment from the issue screen returns to the case with context intact.

---

### FR-F03-07 — Global search entry point (SCR-35)

**Description:** A header search scoped server-side to what the principal may see.

**Inputs:** `q` (string, 2–120 chars), optional `sourceSystem[]`, `type[]`.

**Processing / business rules:**
1. `GET /api/search?q=` fans out to enabled adapters with the principal's scope (`FR-F02-04`) and matches on title, subject reference, and identifier.
2. Results are normalized WorkItems grouped by source system, each row badged with its system, ranked by exact-identifier match, then title match, then recency.
3. Partial-source failure is tolerated exactly as in the work queue (`FR-F05-05`): results render, and a named degraded notice lists the systems not searched.
4. Result count is announced via `aria-live="polite"`: "{n} results for {q}. {m} systems searched."
5. Administrators do not receive work-item search (they hold no work-item read permission); their header search targets applications, identities, and audit records instead.

**Outputs:** SCR-35 with grouped results, or a designed empty state.

**Validation rules:** `q` trimmed, minimum 2 characters after trim; below that the control shows "Enter at least 2 characters to search." and does not issue a request.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Query too short | 400 | `VALIDATION_FAILED` | "Enter at least 2 characters to search." |
| All sources unavailable | 200 | — | Empty state: "We couldn't reach any connected systems. Your search will work again once they're back." |
| No matches | 200 | — | Empty state: "No results for '{q}'. Check the spelling, or try a case or subject number." |

**Acceptance criteria:**
- AC-1: Searching a seeded case number returns that case, badged with eApp.
- AC-2: An applicant's search never returns another subject's item (`FR-F02-04`).

---

### FR-F03-08 — Not-found route (SCR-31) and page templates

**Description:** Unknown routes and the four reusable layouts.

**Processing / business rules:**
1. Unknown routes render SCR-31 inside the shell: `<h1>` "We couldn't find that page," explanatory sentence, the attempted path shown as text (escaped, never rendered as HTML), correlation ID, and two actions: "Go to my dashboard," "Go to my work queue."
2. SCR-31 returns HTTP 404 with `<title>Page not found — DCSA Unified Layer</title>` and moves focus to the `<h1>`.
3. Four page templates exist and are the only permitted layouts: **List** (filters + table + pagination), **Detail** (summary header + content sections + action panel + activity), **Form** (error summary + fieldsets + actions), **Console** (sub-navigation + list/detail split). New screens inherit correct heading order, landmarks, and state handling from the template.
4. Each template defines loading, empty, error, and degraded presentations so no screen has to invent them (`FR-F16-06`, `FR-F16-07`, `FR-F16-08`).

**Validation rules:** A screen not built on one of the four templates fails design review; the templates are the mechanism by which accessibility is inherited rather than re-litigated per page.

**Error handling:** SCR-31 is itself error handling; it never 500s and always includes the demo banner.

**Acceptance criteria:**
- AC-1: A fabricated URL renders SCR-31 with the banner, a 404 status, and working exit links.
- AC-2: All 38 screens map to one of the four templates (design review artifact).

---
## F4 — Role-Specific Personalized Dashboards

**Traces to:** PRD F4 (P0). **Screens:** SCR-09 Investigator, SCR-10 Adjudicator, SCR-11 Applicant, SCR-12 Administrator. **API:** `Y1a §Dashboard`. Role-differentiated composition is measured by **SM-23**; time-to-next-item by **SM-24**; the applicant's time-to-answer by **SM-25**.

**Description:** The landing page after sign-in, composed differently for each of the four roles. It answers "what is mine, what is urgent, what changed, and what should I know" by aggregating across every connected spoke. Each dashboard is a real screen with real widgets, real empty states, per-widget loading, and an explicit account of anything missing because a source is unhealthy.

**Terminology:**
- **Widget** — an independently loaded dashboard region with its own data source, loading state, empty state, and error state.
- **Composition** — the ordered widget set for a role, defined in configuration (`Y0a.dashboard_compositions`), not hard-coded per role in the UI.
- **Partial composition** — a dashboard rendered while one or more sources are unavailable.

---

### FR-F04-01 — Dashboard composition endpoint and widget loading model

**Description:** One endpoint returns the role's widget manifest and data, with per-source status, so a slow spoke degrades one widget rather than the page.

**Inputs:** `GET /api/dashboard` (authenticated). Optional `?widgets=` to refresh a subset.

**Processing / business rules:**
1. The hub reads the composition for `principal.activeRole` from configuration and resolves each widget's data source.
2. Spoke-backed widgets are fanned out concurrently with per-adapter timeouts from the registry (`FR-F08b-03`). The endpoint returns when all adapters have settled or their timeouts elapse — it never waits on a single slow spoke beyond its configured timeout.
3. Response shape:
   ```json
   {
     "role": "INVESTIGATOR",
     "widgets": [ { "widgetId": "assigned-work", "title": "My assigned work",
                    "state": "READY", "data": { ... }, "href": "/work" } ],
     "sourceStatus": [ { "applicationId": "IM", "label": "Investigation Management",
                         "status": "DOWN", "omittedItemEstimate": 12,
                         "message": "Investigation Management is unavailable — 12 items are not shown." } ],
     "generatedAt": "2026-09-14T15:04:11Z",
     "correlationId": "01JD…"
   }
   ```
4. `widget.state` ∈ `READY | EMPTY | PARTIAL | ERROR`. `PARTIAL` means the widget rendered but is missing at least one source; the widget must then name the missing system inline.
5. The client MAY request widgets individually for progressive rendering; each widget renders its own skeleton with `aria-busy="true"` until settled, and announces completion once via a polite live region ("Dashboard loaded. 3 of 4 systems reporting.").
6. Widget data is never cached across principals; it is computed per request.

**Outputs:** Role dashboard populated per composition.

**Validation rules:** `widgets` query values must exist in the role's composition; unknown values are ignored.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| All sources down | 200 | — | Page renders with a prominent degraded alert: "We can't reach the connected systems right now. Your dashboard will fill in automatically when they're back." |
| Composition missing for role | 500 | `INTERNAL_ERROR` | "We couldn't build your dashboard. Refresh the page — reference {correlationId}." |
| Widget data source error | 200 (widget `ERROR`) | — | In-widget: "We couldn't load this section. Try again." with a retry button. |

**Acceptance criteria:**
- AC-1: With one spoke forced down, the dashboard still renders and names the missing system with a quantified gap (NFR-10).
- AC-2: Dashboard renders within 2 seconds under seeded data (NFR-17).
- AC-3: No widget renders blank; every widget has a designed READY/EMPTY/ERROR presentation.

---

### FR-F04-02 — Investigator dashboard (SCR-09)

**Description:** The primary demo persona's landing page: caseload posture, what is overdue, what changed, and the on-ramp to the flagship workflow.

**Widgets (in order):**
1. **My assigned work** — total count plus a breakdown by source system (eApp, PVQ, PDT, IM), each with a count and a link into the queue pre-filtered to that system. Source labels are always shown; the user always knows which system owns what.
2. **Needs attention** — top 5 items ranked by `overdue DESC, priority DESC, dueDate ASC`. Each row: title, source badge, subject, due date, status, and a direct link to SCR-14/15/16.
3. **Newly raised PVQ issues** — issues created in the last 7 days against cases assigned to this investigator. **This widget is the intended entry point to the F7 flagship workflow** and links directly to the eApp case that carries the issue.
4. **Due soon and overdue** — counts for overdue, due today, due in 7 days, with an accessible status treatment (text + icon, never color alone).
5. **Recent activity** — this principal's last 10 audit records (`AUDIT.READ_OWN`), each linking back to the affected item and to the audit chain view.
6. **Announcements** — active announcements targeted at `INVESTIGATOR` (`FR-F15-04`), dismissible per user.
7. **System status** — present only when at least one source is not healthy; names each affected system and what is missing.

**Processing / business rules:**
1. All counts derive from the same aggregation path as the work queue (`FR-F05-02`), so dashboard and queue can never disagree.
2. "Needs attention" excludes items the principal may read but not act on, because it is an action list; unit-visible items appear in the queue, not here.
3. Each widget's "View all" link carries the equivalent queue filter so the destination is pre-scoped.

**Empty states:** "You have no assigned work right now. New assignments will appear here." / "No issues have been raised on your cases in the last 7 days."

**Error handling:** per `FR-F04-01`. If PVQ is down, widget 3 shows: "We can't reach PVQ right now, so new issues aren't shown. Everything else on this page is current."

**Acceptance criteria:**
- AC-1: The seeded investigator persona sees items from at least four distinct source systems, each attributed (SM-14).
- AC-2: The "newly raised PVQ issues" widget contains the flagship demo issue and links to eApp case A-1042.
- AC-3: Overdue items appear with both text and icon indication.

---

### FR-F04-03 — Adjudicator dashboard (SCR-10)

**Description:** Determination-oriented landing page — visibly different composition from the Investigator's, not a relabelled copy.

**Widgets (in order):**
1. **Awaiting my determination** — count and top items in `statusCategory = IN_PROGRESS` routed to adjudication, across eApp and IM.
2. **Case status distribution** — counts by `statusCategory` across the adjudicator's organization, rendered as an accessible data table (not a chart-only presentation), with each row linking to the filtered queue.
3. **Approaching determination deadlines** — items due within 14 days, sorted ascending, with overdue called out first.
4. **Returned for clarification** — items the adjudicator previously sent back that have since been updated.
5. **Recent activity** — own audit records.
6. **Announcements** — targeted at `ADJUDICATOR`.
7. **System status** — as above.

**Processing / business rules:**
1. Scope is organization-wide per `ATTR-ADJ-01`, not assignee-based; the widget headings say so ("Across {organization}").
2. Any chart included MUST be accompanied by an equivalent accessible table; data is never available only as a graphic.

**Empty states:** "Nothing is waiting on your determination." / "No cases in your organization have upcoming deadlines in the next 14 days."

**Acceptance criteria:**
- AC-1: The adjudicator dashboard differs from the investigator dashboard in at least three widgets.
- AC-2: The status distribution is readable as a table by a screen reader.

---

### FR-F04-04 — Applicant dashboard (SCR-11)

**Description:** A plain-language answer to "where am I in this process and what do I owe you next," assembled from eApp and IEP without ever naming internal systems as a burden on the user.

**Widgets (in order):**
1. **Where you are** — a USWDS step-indicator showing the vetting stages (Submitted → Under review → Information requested → Complete) with the current step marked in text as well as visually, plus a one-sentence explanation of the current step.
2. **What you need to do** — outstanding tasks from IEP and eApp with due dates and direct links to complete them (SCR-18). Each task states the consequence of not acting in plain language.
3. **Your notices** — IEP notices, newest first, with read/unread state and an accessible "Mark as read" action.
4. **Your submission** — read-only summary of the applicant's eApp submission: reference number, submitted date, current status, and a link to view it (redacted per `FR-F02-04` obligations).
5. **Announcements** — targeted at `APPLICANT`.
6. **System status** — worded without internal jargon: "Some of your information isn't available right now. Please check back shortly."

**Processing / business rules:**
1. Every row on this dashboard is filtered by `subjectRef` at the data layer (`FR-F02-04`). The applicant view never receives another subject's data to hide.
2. Copy avoids internal system names in body text; source badges are still shown on work-item rows for attribution consistency but are secondary.
3. Investigator narratives, issue internal notes, and adjudication rationale are redacted before serialization — they never reach the browser.

**Empty states:** "You don't have anything to do right now. We'll let you know if that changes." / "You have no notices." — the zero-item applicant is a seeded persona (`FR-F17-06`) so this state is demonstrable.

**Acceptance criteria:**
- AC-1: The applicant dashboard shows only that applicant's records, verified by direct API probe with another subject's ID.
- AC-2: The zero-item applicant persona renders designed empty states in every widget, with no blank regions.
- AC-3: Redacted fields are absent from the response payload, not merely hidden.

---

### FR-F04-05 — Administrator dashboard (SCR-12)

**Description:** Platform operability at a glance — the administrator's dashboard is about the layer itself, not about mission work.

**Widgets (in order):**
1. **Connected applications** — count of registered / enabled / disabled, with a link to SCR-22.
2. **System health** — per-application status chips (text + icon), last check time, and latency; links to SCR-24.
3. **Integration issues (24h)** — count by error class with the five most recent entries; links to SCR-25.
4. **Recent administrative activity** — audit records for admin actions, linking to SCR-33.
5. **Announcements management** — active/scheduled/expired counts with a link to SCR-29.
6. **Demo operations** — service readiness summary and links to SCR-37 and the failure-injection controls (SCR-38).

**Processing / business rules:**
1. Health data is read from the health monitor's stored results (`FR-F16-02`), not by probing on page load, so the dashboard is fast and probing stays on its cadence. A manual "Check now" control triggers an on-demand probe (`FR-F11-05`).
2. The administrator dashboard exposes no work items; attempting to deep-link to one returns `AUTHZ_DENIED` per `FR-F02-02` rule 1.

**Empty states:** "No integration issues in the last 24 hours." / "No applications are registered yet. Register your first application to get started." (the latter is reachable only if the registry is emptied — it is still designed.)

**Acceptance criteria:**
- AC-1: Inducing an adapter failure adds a visible entry to the integration-issues widget within one health-check interval.
- AC-2: Registering the sixth application increments the connected-applications count without a restart (SM-12).

---

### FR-F04-06 — Widget interaction, linking, and state integrity

**Description:** Behavior common to all dashboards.

**Processing / business rules:**
1. Every widget has exactly one primary destination; every count and every row is a link to a real, pre-scoped screen. A widget that displays a number the user cannot act on is not permitted.
2. Widget refresh: a "Refresh" control per widget re-requests that widget only and announces the outcome politely ("My assigned work updated. 14 items.").
3. Auto-refresh polls `GET /api/dashboard?widgets=system-status` every 30 seconds to pick up health changes; recovery clears the degraded notice without a user reload (SM-17). No other widget auto-refreshes, to avoid content shifting under a reader.
4. Dismissing an announcement persists per user per announcement (`Y0a.announcement_dismissals`) and does not affect other users.
5. Keyboard: widgets are `<section>` elements with `aria-labelledby` pointing at their heading; tab order follows visual order; no widget is a focus trap.

**Validation rules:** A widget whose destination route does not exist fails the CI navigation crawl.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Widget refresh fails | 200 (widget `ERROR`) | — | "We couldn't refresh this section. Try again." |
| Dismiss announcement fails | 500 | `INTERNAL_ERROR` | "We couldn't save that. The notice will reappear until we can." |

**Acceptance criteria:**
- AC-1: Signing in as each persona produces a visibly different, fully populated dashboard with no empty or placeholder widget (PRD F4 acceptance signal).
- AC-2: Restoring a downed spoke clears the degraded notice within 30 seconds without a reload or re-authentication.

---
## F5 — Unified Work Queue

**Traces to:** PRD F5 (P0); SM-14, SM-16, NFR-09, NFR-10. **Screens:** SCR-13 Unified work queue. **API:** `Y1a §Work Queue`.

**Description:** One list of everything assigned to the signed-in user, aggregated from eApp, IEP, PVQ, PDT, IM (and any subsequently registered application), normalized into a common work-item shape while retaining unmistakable source attribution. Filterable, sortable, searchable, paginated, and implemented as a proper accessible data table. Partial failure of any source degrades that source only — one spoke down never produces a failed queue.

**Terminology:**
- **Fan-out** — concurrent adapter `listWorkItems` calls to every enabled application the principal may see.
- **Normalization** — projection of a spoke-native record into the WorkItem model (§3.2).
- **Source status** — per-application outcome of the fan-out: `OK`, `TIMEOUT`, `ERROR`, `CIRCUIT_OPEN`, `SKIPPED_DISABLED`.
- **Merge key** — `sourceSystem + nativeId`, guaranteeing global uniqueness without coordination between spokes.

---

### FR-F05-01 — Work queue screen (SCR-13)

**Description:** The presentation of the aggregated queue: filter rail, active-filter chips, sortable table, pagination, result count, and all four non-happy states.

**Inputs:** URL query state `{ q, sourceSystem[], type[], status[], priority[], assignee, dueFrom, dueTo, sort, dir, page, pageSize }`.

**Processing / business rules:**
1. Layout uses the List template (`FR-F03-08`): filter region (`<form>` landmark, labelled "Filter work items"), results region, pagination.
2. Table columns: Title (link), Source system (text badge + icon), Type, Subject, Status, Priority, Assignee, Due date, Last activity. The table has a `<caption>` ("Work items assigned to you — {n} results"), `<th scope="col">` on every header, and `scope="row"` on the title cell.
3. Result count is announced on every filter, sort, search, or page change through a polite live region: "{n} work items. Showing {a} to {b}. {m} of {k} systems reporting."
4. All queue state lives in the URL so a link to a filtered view is shareable and the browser Back button restores the exact view.
5. Row entry navigates to SCR-14/15/16/17/18/19 as appropriate for the item type, carrying a `returnTo` that restores filters, sort, and page (`FR-F06-10`).
6. **No bulk actions.** Actions are performed on the detail page so every mutation is audited in full context (PRD F5, "bulk-free by design").
7. The screen is not available to Administrators (`FR-F02-02`); they have no work-item read permission.

**Outputs:** SCR-13 with populated table, or a designed empty/degraded state.

**Validation rules:** Unknown query parameters are ignored, not echoed. `pageSize` ∈ {10, 25, 50, 100}, default 25. `page` ≥ 1.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| No items match filters | 200 | — | "No work items match your filters. Clear filters to see all of your work." with a "Clear all filters" button. |
| No items at all | 200 | — | "You have no assigned work right now. New assignments will appear here." |
| Every source unavailable | 200 | — | "We can't reach any connected systems right now. Your work will appear here automatically when they're back." plus a "Try again" control. |
| Invalid filter value | 400 | `VALIDATION_FAILED` | Field-level: "Choose a valid {filter name}." |

**Acceptance criteria:**
- AC-1: The investigator queue contains correctly attributed items from at least four distinct spokes (SM-14).
- AC-2: Every state (populated, filtered-empty, wholly-empty, degraded, loading, error) is reachable and designed.
- AC-3: Table passes automated accessibility scan with zero serious or critical violations.

---

### FR-F05-02 — Aggregation and normalization across heterogeneous sources

**Description:** How five differently shaped native records become one queue.

**Inputs:** `principal`, resolved filter set, registry rows for enabled applications.

**Processing / business rules:**
1. The hub resolves the candidate application list from the registry — never a hard-coded list of five. Applications that are disabled, or that the principal's role is not granted in `registered_applications.visible_to_roles`, are marked `SKIPPED_DISABLED` and contribute nothing.
2. For each candidate, the hub calls `listWorkItems(principal, scope, filters, paging)` concurrently, subject to per-adapter timeout, retry, and circuit state (`FR-F08a-05`).
3. Each adapter returns native records plus its declared field mapping; the adapter — not the hub — performs normalization into the WorkItem model. The hub validates the result against the WorkItem schema and rejects non-conforming records with an `INTEGRATION_NORMALIZATION_ERROR` issue rather than rendering malformed rows.
4. Normalization rules that must be uniform across all adapters:
   - `workItemId = "{sourceSystem}:{nativeId}"`.
   - `statusCategory` is mapped from the native status via the adapter's declared status map; every native status MUST map to exactly one category. An unmapped status is a conformance failure (`FR-F19-03`).
   - `priority` maps native scales to `ROUTINE | ELEVATED | URGENT`. Sources with no native priority map everything to `ROUTINE` and declare `priorityNative: false` so the UI can note "Priority not provided by {system}" rather than implying one.
   - `dueDate` is normalized to ISO-8601; sources without due dates emit `null`, and null sorts last in ascending order and last in descending order (nulls always last, never interleaved).
   - `lastActivityAt` is required; an adapter unable to supply it uses the record's updated timestamp.
   - `assigneeId` is mapped to a hub `principalId` via the adapter's identity map; an unmapped assignee yields `assigneeId: null` with `assigneeDisplayName` preserved as the native string, so "unassigned" and "assigned to someone we can't resolve" are distinguishable.
5. Results are merged, de-duplicated by merge key, then filtered, sorted, and paginated **hub-side** (`FR-F05-03`, `FR-F05-04`) because sources cannot agree on a global order.
6. `sourceHealth` is stamped on every item from the fan-out outcome for that application.

**Outputs:** `{ items: WorkItem[], totalCount, page, pageSize, sourceStatus[], correlationId }`.

**Validation rules:** Every returned WorkItem MUST satisfy the §3.2 schema; required fields are `workItemId, nativeId, sourceSystem, subjectRef, type, title, status, statusCategory, priority, lastActivityAt`.

**Error handling:**

| Scenario | HTTP | Code | Behavior |
|---|---|---|---|
| Adapter returns malformed item | 200 | — | Item dropped; `INTEGRATION_NORMALIZATION_ERROR` issue recorded naming application, field, and correlation ID. Queue still renders. |
| Adapter returns out-of-scope item | 200 | — | Item dropped; `INTEGRATION_SCOPE_VIOLATION` recorded (`FR-F02-04`). |
| Registry unreadable | 503 | `REGISTRY_UNAVAILABLE` | "We can't load your work list right now. Try again in a moment — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Removing an application from the registry removes its items from the queue with no code change (PRD F8 acceptance signal).
- AC-2: A deliberately malformed adapter response drops one row and logs one issue; the queue renders the remainder.
- AC-3: Items from five sources share one consistent shape and sort correctly against each other.

---

### FR-F05-03 — Filtering semantics

**Description:** Filters that behave identically regardless of which system owns the row.

**Inputs:** `sourceSystem[]`, `type[]`, `status[]` (by `statusCategory`), `priority[]`, `assignee` (`me | unassigned | {principalId}`), `dueFrom`, `dueTo`, `overdueOnly` (boolean).

**Processing / business rules:**
1. Filters combine as AND across facets, OR within a facet. Example: `sourceSystem in (EAPP, PVQ) AND statusCategory in (OPEN, IN_PROGRESS)`.
2. Filters are applied **server-side after normalization**, so they work uniformly even when a source cannot filter natively. Where an adapter declares `supportsFilter: [...]`, the hub pushes those facets down to reduce payload, then re-applies them after merge — push-down is an optimization, never the authority.
3. `status` filters on `statusCategory`, not native status, because native vocabularies differ. The native status remains visible in the table and in the item detail.
4. `assignee=unassigned` matches `assigneeId == null AND assigneeDisplayName == null`; `assignee=me` matches the principal. An investigator may not filter to another individual's name unless that person is within their organization and region (the filter respects `FR-F02-03`, it does not widen scope).
5. `dueFrom`/`dueTo` are inclusive dates in the user's displayed timezone (UTC for the demo, labelled as such). Items with `dueDate == null` are excluded when a due-date range is active, and the UI states this: "Items without a due date are hidden while a date range is applied."
6. Active filters render as removable USWDS chips with accessible names ("Remove filter: Source system — PVQ"), plus a "Clear all filters" button. Removing a chip updates the URL, re-queries, and announces the new count.
7. Role defaults: Investigator → `assignee=me`, `statusCategory in (OPEN, IN_PROGRESS)`; Adjudicator → `statusCategory=IN_PROGRESS`; Applicant → no filter (their scope is already their own records). Defaults are applied only on first load and are visibly shown as chips so the user knows a filter is active — a silently pre-filtered list is a lie about completeness.

**Outputs:** Filtered result set plus the applied-filter descriptor echoed in the response.

**Validation rules:**
- Enumerated facets validated against registry-declared values; unknown values return `VALIDATION_FAILED` naming the facet.
- `dueFrom <= dueTo`; otherwise field error "Enter an end date that comes after the start date."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Unknown facet value | 400 | `VALIDATION_FAILED` | "Choose a valid {facet}." |
| Reversed date range | 400 | `VALIDATION_FAILED` | "Enter an end date that comes after the start date." |

**Acceptance criteria:**
- AC-1: Filtering by source system to a single spoke returns only that spoke's items, with the chip visible.
- AC-2: Default role filters are shown as chips on first load and are removable.
- AC-3: A filter that a source cannot apply natively still filters correctly after merge.

---

### FR-F05-04 — Sorting, pagination, and result counting

**Description:** Deterministic ordering and paging across sources that do not share an ordering.

**Processing / business rules:**
1. Sortable fields: `dueDate`, `priority`, `statusCategory`, `sourceSystem`, `lastActivityAt`, `title`. Default: `dueDate ASC` with `overdue` items first.
2. Sorting is performed hub-side on the merged set. To page correctly, the hub requests up to `pageSize × page + overfetchMargin` from each source (bounded by `maxPerSourceFetch`, default 200) and pages the merged result. When any source truncates at `maxPerSourceFetch`, the response sets `truncated: true` and the UI shows: "Showing the first {n} items from each system. Narrow your filters to see more." — the system never silently hides rows.
3. Tie-breaking is deterministic: `sortField, then sourceSystem ASC, then nativeId ASC`. Identical queries always return identical order (required for repeatable demos, SM-22).
4. `priority` sorts by ordinal `URGENT > ELEVATED > ROUTINE`, never alphabetically.
5. Sortable column headers are `<th>` containing a `<button aria-sort="ascending|descending|none">`; activating toggles direction and announces "Sorted by due date, ascending. {n} items."
6. Pagination uses the USWDS pagination component with `aria-label="Work queue pagination"`, current page marked `aria-current="page"`, and Previous/Next disabled (not hidden) at bounds with an explanatory `disabledReason`.
7. `totalCount` counts only items actually retrieved. When a source failed, the count is accompanied by the degraded notice (`FR-F05-05`) so the number is never presented as complete when it is not.

**Validation rules:** `sort` must be one of the permitted fields; `dir` ∈ `asc|desc`. Invalid values fall back to the default and are corrected in the URL rather than erroring.

**Error handling:** No distinct errors; invalid sort silently normalizes to default (documented behavior, not a failure).

**Acceptance criteria:**
- AC-1: Sorting by due date places overdue items first and null due dates last in both directions.
- AC-2: The same query run twice returns identical ordering.
- AC-3: Truncation is disclosed when it occurs.

---

### FR-F05-05 — Partial-failure tolerance and degraded queue (the resilience contract)

**Description:** One spoke down must never produce a failed queue. The other sources render fully, and the gap is named and quantified.

**Inputs:** Fan-out outcomes per application.

**Processing / business rules:**
1. Each adapter call resolves to `{ applicationId, status, itemCount, latencyMs, errorClass?, omittedItemEstimate? }`. The aggregate endpoint returns HTTP **200** whenever at least one source succeeded — a partial result is a success with disclosure, not an error.
2. HTTP 200 with `sourceStatus` entries of `TIMEOUT | ERROR | CIRCUIT_OPEN` triggers a USWDS warning site-alert above the table, `role="status"`, naming each affected application:
   **"Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date."**
   The omitted-item estimate comes from the last successful count for that application and principal (`Y0a.work_item_counts_cache`); when no prior count exists the copy omits the number: "Investigation Management is unavailable — some items are not shown."
3. Every row also carries its `sourceHealth`; rows from a `DEGRADED` (slow but responding) source show an inline "Slow to respond" note so the user understands staleness.
4. Actions targeting an unavailable source are pre-emptively disabled at the detail screen (`FR-F06-04`), never allowed to fail mid-submission.
5. When all sources fail, HTTP is still 200 with an empty item list and a full-width degraded alert — never a 500, never a blank page, never an error route (NFR-09).
6. Recovery: the queue polls `GET /api/health/summary` every 30 seconds while a degraded notice is displayed. On recovery the notice is replaced by a polite live announcement — "Investigation Management is available again. Refresh to see 12 more items." — with a "Refresh" button. The queue does not silently reorder under the user's cursor.
7. Each failed source records one `integration_issues` row per failure with the correlation ID, visible to administrators (`FR-F11-03`).

**Outputs:** 200 with partial items, `sourceStatus[]`, and a degraded alert.

**Validation rules:** `sourceStatus` MUST contain one entry per candidate application — including successes — so the UI can always state "{m} of {k} systems reporting."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| One or more sources failed | 200 | — | "{System} is unavailable — {n} items are not shown. The rest of your work is up to date." |
| All sources failed | 200 | — | "We can't reach any connected systems right now. Your work will appear here automatically when they're back." |
| Source slow but responding | 200 | — | Row-level: "Slow to respond." |

**Acceptance criteria:**
- AC-1: With IM forced offline, the queue renders the other four sources plus a visible, specific degraded warning, and no error page appears anywhere (SM-15, SM-16).
- AC-2: Restoring IM clears the warning without reload or re-authentication (SM-17).
- AC-3: Each induced failure produces exactly one integration-issue entry.

---

### FR-F05-06 — Search within the queue

**Description:** Server-scoped free-text search across the aggregated set.

**Inputs:** `q` (string, 2–120 chars).

**Processing / business rules:**
1. `q` matches, case-insensitively, against `title`, `subjectRef`, `subjectDisplayName`, `nativeId`, and `workItemId`.
2. Where an adapter declares `supportsSearch: true`, `q` is pushed down; results are then re-matched hub-side so behavior is uniform.
3. Search combines with active filters as an additional AND term.
4. An exact `nativeId` or `workItemId` match is ranked first and, when it is the only result, the UI offers "Go to this item" as a primary action.
5. Search never widens scope: the ownership predicate (`FR-F02-04`) applies before matching.

**Validation rules:** minimum 2 characters after trim; maximum 120; the query is escaped for display and never rendered as HTML.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Too short | 400 | `VALIDATION_FAILED` | "Enter at least 2 characters to search." |
| No matches | 200 | — | "No work items match '{q}'. Check the spelling, or try a case or subject number." |

**Acceptance criteria:**
- AC-1: Searching a seeded case number returns exactly that item.
- AC-2: An applicant's search cannot surface another subject's item.

---

### FR-F05-07 — Source attribution on every row

**Description:** The user always knows which system owns an item.

**Processing / business rules:**
1. Every row displays the source system as a text label (registry `displayName`) with an accompanying icon. Attribution is never color-only and never icon-only.
2. The source column is sortable and filterable, and its values come from the registry so a newly registered application is attributed correctly with no code change.
3. The item detail header, breadcrumb, action confirmations, and audit records all repeat the source-system name, so attribution survives every context change.
4. Screen-reader text for the badge reads "Source system: {displayName}".

**Acceptance criteria:**
- AC-1: A newly registered sixth application's items appear correctly attributed with its registered display name and icon token (SM-12).
- AC-2: No row is ambiguous about ownership.

---

### FR-F05-08 — Saved default view per role

**Description:** Each role opens the queue in a sensible, visible default.

**Processing / business rules:**
1. Defaults per `FR-F05-03` rule 7, held in `Y0a.queue_default_views` keyed by role — configuration, not code.
2. The user may override and the override persists per principal in `Y0a.user_view_preferences` (filters, sort, page size — not page number).
3. A "Reset to default view" control restores the role default and announces the change.
4. Persisted preferences never widen authorization; they are re-validated against current entitlements on load and silently dropped if a referenced source is no longer visible.

**Acceptance criteria:**
- AC-1: Investigator's first load shows "assigned to me, due date ascending" with visible chips.
- AC-2: A saved preference referencing a de-registered application loads cleanly without error.

---

### FR-F05-09 — Queue context preservation

**Description:** Leaving and returning to the queue restores exactly what the user had.

**Processing / business rules:**
1. Navigating into an item appends the encoded queue state to the detail route as `returnTo`.
2. "Back to work queue" on the detail screen restores filters, sort, page, and scroll position, and returns focus to the row the user came from.
3. Post-action returns (including after the flagship workflow) use the same mechanism, so a completed action never dumps the user at an unfiltered page 1.
4. Session expiry and re-authentication preserve the same `returnTo` (`FR-F00-06`).

**Acceptance criteria:**
- AC-1: Filter → open item → act → return lands on the same filtered page with focus restored.
- AC-2: Re-authentication mid-flow returns to the same queue state.

---
## F6 — Work-Item Detail and Action Completion

**Traces to:** PRD F6 (P0). **Screens:** SCR-14 generic detail, SCR-15 eApp case view, SCR-16 PVQ issue detail, SCR-17 PDT designation view, SCR-18 IEP applicant status view, SCR-19 IM case assignment view. **API:** `Y1a §Work Items`.

**Description:** The page where work actually gets done. It renders the full record from its owning spoke, exposes only the actions this principal is authorized to perform on this specific item in its current state, executes those actions through the adapter, writes audit, and shows the item's complete activity history merged from the spoke and the hub. It also carries the related-items panel that is the on-ramp to the flagship workflow.

**Terminology:**
- **Owning spoke** — the system of record for the item; the only system whose state the detail page reports.
- **Action form** — a USWDS form generated from the `ActionDescriptor.formSchema`.
- **Related items panel** — cross-system relationships rendered inline (§3.4).
- **Merged history** — the union of spoke-native activity and hub audit records for the item.

---

### FR-F06-01 — Work-item detail screen (SCR-14)

**Description:** The generic Detail template every item type specializes.

**Inputs:** `GET /api/work-items/{workItemId}` where `workItemId = {sourceSystem}:{nativeId}`; optional `returnTo`.

**Processing / business rules:**
1. Authorization is resource-level (`FR-F02-01` steps 1–4) before any content is composed.
2. The hub resolves `sourceSystem` from the registry, calls `getWorkItem(principal, scope, nativeId)`, and validates the response against the detail schema.
3. Response composition: `{ item (WorkItem + typeSpecificDetail), availableActions: ActionDescriptor[], relatedRefs: RelatedRef[], breadcrumbTrail[], stateVersion, sourceHealth, redactions[] }`.
4. Page regions in document order: breadcrumb → `<h1>` (item title) → summary header (source badge, subject, status, priority, due date, assignee, last activity) → type-specific content sections → related items panel → action panel → activity history.
5. The summary header repeats the source system in text ("System of record: PVQ — Personnel Vetting Questionnaire").
6. `stateVersion` is rendered into the action forms as a hidden field for optimistic concurrency (`FR-F02-05`).
7. Deep-linking directly to this URL while unauthenticated triggers login with `returnTo` and lands here afterwards, with exactly one authentication event (`FR-F01-03`).

**Outputs:** SCR-14 (or a type-specific variant) fully populated.

**Validation rules:** `workItemId` matches `^[A-Z0-9_]{2,16}:[A-Za-z0-9._\-]{1,64}$`. Malformed IDs return the same 403 as a forbidden item — the format of an identifier is not a disclosure channel.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Not authorized / not found | 403 | `AUTHZ_DENIED` | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {correlationId}." |
| Owning system unavailable | 503 | `UPSTREAM_UNAVAILABLE` | "{System} isn't responding right now, so we can't show this item. Your other work is still available." with "Try again" and "Back to work queue." |
| Owning application disabled | 409 | `APPLICATION_DISABLED` | "{System} is turned off in this environment. Contact your administrator if you need access." |
| Malformed detail from spoke | 502 | `UPSTREAM_CONTRACT_ERROR` | "We couldn't read this item from {System}. We've logged the problem — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Each role can open at least one item and see full detail with correct attribution.
- AC-2: A forbidden item and a non-existent item are indistinguishable in the response.
- AC-3: With the owning spoke down, the page renders the error state inside the shell, never a blank page.

---

### FR-F06-02 — Type-specific detail content

**Description:** What each item type shows, so no detail page is a generic key/value dump.

**Processing / business rules:** Each work-item type declares a render profile in the registry (`contentProfile`), and the UI maps it to a section layout. Unknown profiles fall back to a labelled definition-list rendering — never an empty page.

| Type | Screen | Sections |
|---|---|---|
| `EAPP_CASE_REVIEW` | SCR-15 | Case summary; questionnaire sections with answers (collapsible, heading-structured); submission history; outstanding issues; related PVQ issues, PDT designation, IM assignment |
| `PVQ_ISSUE` | SCR-16 | Issue summary; the flagged question and answer quoted in context; issue history; resolution form; link back to the parent eApp case |
| `PDT_DESIGNATION` | SCR-17 | Position details; sensitivity and risk factors; computed investigation tier; review history |
| `IEP_TASK` / `IEP_NOTICE` | SCR-18 | Plain-language description; what is required; due date; notice body; acknowledge/submit action |
| `IM_CASE_ASSIGNMENT` | SCR-19 | Case summary; assigned leads; workload context; status transitions |

Additional rules:
1. Questionnaire answers on SCR-15 render as accessible disclosure sections with `<h3>` headings, expanded state announced, and deep-linkable anchors (`#SECTION_13A`) so a related issue can point at the exact answer.
2. Every displayed record carries its synthetic marker (`FR-F17-08`) visible in the summary header: "Synthetic record — demo data."
3. Redacted fields (applicant view) are absent from the payload; the UI does not render a "hidden" placeholder that implies concealed content about them.

**Acceptance criteria:**
- AC-1: All five type screens are implemented and populated from seed data.
- AC-2: SCR-15 supports anchor navigation to a named questionnaire section.

---

### FR-F06-03 — Server-computed action list and rendering

**Description:** Only authorized, currently-valid actions are offered, and each is explained.

**Inputs:** `availableActions` from `FR-F02-05`.

**Processing / business rules:**
1. The action panel renders one control per descriptor, grouped: primary action (at most one, USWDS primary button), secondary actions, destructive actions (with confirmation).
2. `enabled: false` descriptors render as disabled controls with the `disabledReason` displayed as adjacent text, programmatically associated via `aria-describedby`. Disabled controls are focusable-by-description: the reason is available to assistive technology without requiring focus on a disabled element.
3. Actions whose `targetSystems.length > 1` display a note: "This updates {System A} and {System B}." — the user is told before they act that two systems change.
4. Actions targeting an unavailable system are forced to `enabled: false` with reason "{System} isn't responding right now. Try again when it's back." (`FR-F16-04`).
5. The list is recomputed after every successful action; the page does not keep a stale action panel.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Action posted that is not in the list | 403 | `AUTHZ_DENIED` | "You don't have permission to do that." |
| Action invalid for current state | 409 | `ACTION_NOT_AVAILABLE` | "This action isn't available for this item right now. Refresh the page to see the current options." |

**Acceptance criteria:**
- AC-1: The same item shows different action sets to Investigator and Adjudicator (demo script §RBAC).
- AC-2: Disabled actions always state why.

---

### FR-F06-04 — Action forms, validation, and submission

**Description:** How a user supplies input for an action and how that input is validated on both sides.

**Inputs:** `POST /api/work-items/{id}/actions/{actionId}` with `{ stateVersion, payload: {...} }` and the CSRF header.

**Processing / business rules:**
1. Forms are generated from `formSchema`: each field declares `{ fieldId, label, type (text|textarea|select|radio|checkbox|date), required, maxLength, options[], hint, validationMessage }`.
2. Client-side validation runs on submit (not on every keystroke) and mirrors the server rules. **The server is authoritative and revalidates everything.**
3. On validation failure the UI renders a USWDS error summary at the top of the form with `role="alert"`, focus moved to the summary, each entry linking to its field; each field shows an inline error associated by `aria-describedby` and marked `aria-invalid="true"` (`FR-F14-03`).
4. Submission is **not optimistic**: the UI shows a busy state and reflects the new state only after the spoke confirms the write. Displayed state never diverges from the system of record (PRD F6).
5. Order of operations for a single-system action:
   a. Re-authorize (`FR-F02-05`) → b. Validate payload → c. Call adapter `performAction` → d. On success, write audit (`FR-F13-01`) → e. Re-read item state from the spoke → f. Return the new state and a confirmation message. If the audit write fails, the operation is reported as failed (`FR-F13-01` rule 4) and a compensation note is recorded.
6. Double-submit protection: the action request carries an `idempotencyKey` (client-generated ULID). A repeat with the same key within 10 minutes returns the original outcome without re-executing.
7. Success renders a USWDS success alert naming exactly what changed and where: "Issue ISS-2207 marked Resolved — Substantiated in PVQ." announced via `aria-live="polite"`, with focus moved to the alert.

**Validation rules (generic, applied to every action payload):**
- Required fields present and non-empty after trim → "Enter {label}." / "Select {label}."
- `maxLength` enforced; textarea narrative fields default to 4000 characters → "Shorten this to {n} characters or fewer. You've used {m}."
- Select/radio values must be in `options` → "Choose a valid {label}."
- Dates must be ISO-8601 and within ±5 years → "Enter a valid date."
- Unknown payload fields are rejected rather than ignored → `VALIDATION_FAILED`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Validation failure | 400 | `VALIDATION_FAILED` | Summary: "There is a problem. Fix the following, then try again." plus per-field copy above. |
| Stale state | 409 | `STATE_CONFLICT` | "This item changed since you opened it. Refresh to see the latest version, then try again." |
| Spoke rejected the action | 422 | `UPSTREAM_REJECTED_ACTION` | "{System} couldn't complete this action: {spoke-provided plain reason}. Nothing was changed." |
| Spoke unavailable | 503 | `UPSTREAM_UNAVAILABLE` | "{System} isn't responding right now, so nothing was changed. Try again in a moment." |
| Spoke timed out after write may have occurred | 502 | `UPSTREAM_INDETERMINATE` | "We're not sure whether {System} completed this action. Refresh this item to check its current status before trying again — reference {correlationId}." |
| Audit write failed | 500 | `AUDIT_WRITE_FAILED` | "We couldn't record this action, so it wasn't completed. Try again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Each role completes at least one real, persisted action visible in both the spoke's own API and the audit trail (PRD F6 acceptance signal).
- AC-2: A double-submitted action executes once.
- AC-3: Error summary focus management and field association pass the accessibility scan.

---

### FR-F06-05 — Related items panel (on-ramp to F7)

**Description:** Cross-system relationships surfaced inline, resolved live, never hard-coded.

**Inputs:** `relatedRefs` from the owning spoke.

**Processing / business rules:**
1. The owning spoke returns opaque references (§3.4). The hub resolves each by calling the target application's adapter for a lightweight summary (`getWorkItemSummary`), concurrently and with the same timeout/circuit policy as the queue.
2. Each related item renders: relationship label ("Issue raised against Section 13A employment history"), the target system badge, the target item's title and status, and a link into that item's detail screen **inside the unified shell**.
3. Unresolvable references (target system down, principal not entitled) render with `resolvable: false` and an explanation — "PVQ isn't responding right now, so this related issue can't be opened." — rather than a broken link or a silent omission. Entitlement failures read: "You don't have access to the related item in {System}."
4. The panel groups by relationship type with a heading per group and a count.
5. Selecting a related item carries breadcrumb context (`FR-F03-06`) and a `returnTo` back to the originating item.
6. The panel is a `<section aria-labelledby>` with an accessible list, not a bare set of links.

**Outputs:** Related items panel; the traversal path for `FR-F07a-03`.

**Validation rules:** A `RelatedRef` whose `targetSystem` is not in the registry is dropped and logged as `INTEGRATION_UNKNOWN_TARGET`; it is never rendered as a dead link.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Target system unavailable | 200 | — | "{System} isn't responding right now, so this related item can't be opened." |
| Not entitled to target | 200 | — | "You don't have access to the related item in {System}." |
| No related items | 200 | — | "No related items in other systems." |

**Acceptance criteria:**
- AC-1: eApp case A-1042 shows its related PVQ issue, PDT designation, and IM assignment, each correctly badged.
- AC-2: The relationship is sourced live through the adapter; deleting the relationship in PVQ's store removes it from the panel without a code change.

---

### FR-F06-06 — Activity history (merged spoke + hub)

**Description:** A single chronological history combining what the spoke recorded and what the hub audited.

**Inputs:** `getActivityHistory(principal, nativeId)` from the owning adapter; `Y0a.audit_events` filtered by target resource.

**Processing / business rules:**
1. The hub merges both sources into `ActivityEvent[]` (§3.5), sorted `occurredAt DESC`, tie-broken by `origin` (HUB after SPOKE for the same instant, since the hub writes after the spoke confirms).
2. Each row shows: timestamp (absolute, UTC, plus relative "2 hours ago"), actor, actor role, action summary, origin badge ("Recorded by PVQ" vs "Recorded by the unified layer"), and the correlation ID as a link to the audit chain view (SCR-34) where the principal is entitled to see it.
3. Mission users see hub records that are their own or that concern this item and are within their scope; administrators see all. Applicants see a simplified history with internal narratives redacted.
4. History is paginated (20 per page) with an accessible "Load more" control that appends and announces "{n} more entries loaded."
5. If the spoke's history call fails, hub records still render with a notice: "Some history from {System} isn't available right now."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Spoke history unavailable | 200 | — | "Some history from {System} isn't available right now." |
| No history | 200 | — | "No activity recorded yet." |

**Acceptance criteria:**
- AC-1: A completed action appears in the history from both origins within the same view.
- AC-2: The correlation link opens the chain view showing all records for that action.

---

### FR-F06-07 — Confirmation, failure differentiation, and recovery paths

**Description:** The user always knows what happened, in which system, and what to do next.

**Processing / business rules:**
1. Success states name the item, the change, and the system(s): "Case A-1042 updated in eApp. Outstanding issue cleared."
2. Failure states are differentiated into exactly four user-visible classes, each with its own recovery action:
   - **Not permitted** → "You don't have permission to do that." Action: return to the item (no retry offered, because retrying will not help).
   - **Input invalid** → error summary with per-field guidance. Action: fix and resubmit.
   - **Source unavailable** → "{System} isn't responding right now, so nothing was changed." Action: "Try again" plus "Back to work queue."
   - **Unexpected error** → "Something went wrong on our side. Nothing was changed. Reference {correlationId}." Action: "Try again" plus "Go to dashboard."
3. Every failure message states whether anything changed. Ambiguity is only permitted for `UPSTREAM_INDETERMINATE`, whose copy explicitly says the outcome is unknown and tells the user how to check.
4. No failure message contains a stack trace, exception class, hostname, port, SQL, or spoke-internal identifier.
5. Every failure displays a copyable correlation ID.

**Acceptance criteria:**
- AC-1: Each of the four classes is reachable in the demo and renders its designed presentation.
- AC-2: Automated scan finds zero stack traces or internal identifiers in user-facing error copy.

---

### FR-F06-08 — eApp case view specifics (SCR-15)

**Processing / business rules:**
1. Header shows case reference, subject, submission date, case status, outstanding-issue count, and assigned investigator.
2. **Outstanding issues indicator** is a first-class element: "1 outstanding issue" with a link into the related items panel. When the flagship workflow resolves the issue, this indicator changes to "No outstanding issues" — the visible proof that eApp changed (`FR-F07b-05`).
3. Questionnaire sections render as disclosures with stable anchors; the section referenced by a related PVQ issue is highlighted with a text marker ("Issue raised on this section") when arrived at via the related-item link.
4. Actions available to an Investigator: `ACKNOWLEDGE_ASSIGNMENT`, `REQUEST_CLARIFICATION`, `RECORD_FINDING`. To an Adjudicator: `ADJUDICATE_CASE`, `RETURN_FOR_CLARIFICATION`. To the owning Applicant: `SUBMIT_APPLICANT_RESPONSE` (only when the case is in `INFORMATION_REQUESTED`).

**Acceptance criteria:**
- AC-1: The outstanding-issue indicator reflects eApp's state as returned by its own API, not a hub-computed guess.

---

### FR-F06-09 — PDT designation view specifics (SCR-17)

**Processing / business rules:**
1. Shows position title, organization, sensitivity level, risk factors as an accessible table, and the resulting investigation tier with the rule that produced it stated in text.
2. Actions: Adjudicator `APPROVE_DESIGNATION` / `RETURN_DESIGNATION` (with required reason); Investigator read-only; Administrator read-only via admin context.
3. Approval writes to PDT only (single-system action) and records audit.

**Acceptance criteria:** AC-1: An adjudicator approves a designation and PDT's own API reflects the new state.

---

### FR-F06-10 — IEP applicant status view specifics (SCR-18)

**Processing / business rules:**
1. Shows the applicant's status record, notices list, and outstanding tasks in plain language, with no internal case jargon.
2. Actions: `ACKNOWLEDGE_NOTICE`, `COMPLETE_TASK` (with a task-specific form), both scoped to `subjectRef` at the data layer.
3. Notices support read/unread with an accessible toggle; state persists in IEP's own store, not the hub's, because it is IEP's record.
4. The zero-item applicant persona renders designed empty states here (`FR-F17-06`).

**Acceptance criteria:** AC-1: An applicant completes a task and IEP's own API shows the task closed. AC-2: A second applicant's task is unreachable by ID.

---

### FR-F06-11 — IM case assignment view specifics (SCR-19)

**Processing / business rules:**
1. Shows case, assignment, leads list, investigator workload context, and status.
2. Actions: Investigator `ACCEPT_ASSIGNMENT`, `UPDATE_CASE_STATUS`, `ADD_LEAD_NOTE`; Adjudicator read.
3. IM is the spoke used for the forced-outage demonstration (`FR-F16-11`), so this screen must render its unavailable state cleanly and is explicitly covered by `FR-F19-04`.

**Acceptance criteria:** AC-1: With IM down, SCR-19 shows the unavailable state with working exits and no console errors.

---

### FR-F06-12 — Return-to-queue navigation

**Processing / business rules:**
1. A persistent "Back to work queue" control appears above the `<h1>` and in the action panel footer, restoring filters, sort, page, and focus (`FR-F05-09`).
2. After a successful action the user remains on the detail page with the updated state and a success alert; a secondary control offers "Back to work queue." The user is never involuntarily navigated away from evidence of what they just did.

**Acceptance criteria:** AC-1: Return navigation restores the exact prior queue view in all tested paths.

---
## F7 (part A) — Flagship Cross-Application Workflow: the User Journey

**Traces to:** PRD F7 (P0 — highest priority feature in the product); SM-01, SM-02, SM-03, SM-04, SM-20. **Screens:** SCR-13 → SCR-15 → SCR-16 → SCR-20. **API:** `Y1a §Work Items`, `Y1a §Orchestration`.

**Description:** An investigator, signed in once, opens an eApp case from the unified work queue, discovers a related PVQ issue raised against a specific questionnaire answer, opens and resolves that issue without leaving the unified experience, and observes both eApp and PVQ reflect the change. No second login, no second application, no re-entry of context, no manual correlation. This chunk specifies the journey, step by step, including the relationship model that makes discovery possible. Part B (`F07b`) specifies the orchestrated dual write, its compensation behavior, the confirmation view, and the audit chain.

If everything else in this product fails, this must work.

**Terminology:**
- **Parent case** — the eApp case record the issue was raised against (`EAPP:CASE-A-1042` in the seeded demo).
- **Issue item** — the PVQ record referencing that case and a specific answer (`PVQ:ISS-2207`).
- **Answer locus** — the precise questionnaire coordinate the issue concerns, e.g. `SECTION_13A.employer[0].endDate`.
- **Traversal** — navigation from the case to the issue within the unified shell, carrying context.
- **Disposition** — the investigator's resolution outcome, from a controlled vocabulary.

---

### FR-F07a-01 — The eApp ↔ PVQ relationship model

**Description:** The cross-system reference that makes the workflow real rather than staged. There is no shared database and no join; the relationship is an opaque reference the hub resolves through adapters.

**Processing / business rules:**
1. **PVQ owns the relationship.** A PVQ issue record carries:
   - `parentCaseRef` (string, required) — the eApp case's native identifier, e.g. `CASE-A-1042`. Opaque to PVQ; PVQ never resolves it and never queries eApp.
   - `parentSystem` (string, required, constant `EAPP`) — which system the reference belongs to.
   - `answerLocus` (string, required) — the questionnaire coordinate, e.g. `SECTION_13A.employer[0].endDate`.
   - `answerSectionLabel` (string, required) — human copy, e.g. "Section 13A — Employment history".
   - `answerSnapshot` (string, required) — the answer text as it stood when the issue was raised, stored by PVQ so the issue is readable even if the answer later changes.
   - `subjectRef` (string, required) — the same synthetic subject identifier eApp uses, so the hub can cross-check scope.
2. **eApp holds the counterpart state, not the relationship.** An eApp case carries `outstandingIssueCount` (integer) and `outstandingIssueRefs` (array of opaque PVQ issue identifiers) plus `caseState`. eApp does not know what a PVQ issue contains; it knows only that N remain outstanding.
3. **The hub resolves, and only the hub resolves.** On `GET /api/work-items/EAPP:CASE-A-1042`, the eApp adapter returns `outstandingIssueRefs`; the hub converts each into a `RelatedRef` with `relationshipType: HAS_ISSUE`, `targetSystem: PVQ`, then calls the PVQ adapter for a summary. Symmetrically, the PVQ issue returns a `RelatedRef` with `relationshipType: ISSUE_AGAINST`, `targetSystem: EAPP`.
4. **Consistency cross-check.** When resolving, the hub verifies that the PVQ issue's `subjectRef` matches the eApp case's `subjectRef`. A mismatch means the two systems disagree; the reference renders as unresolvable with "This related item couldn't be confirmed. We've logged the problem — reference {correlationId}." and an `INTEGRATION_REFERENCE_MISMATCH` issue is recorded. The hub never displays a relationship it cannot corroborate.
5. No foreign key, no shared table, and no cross-namespace read exists anywhere in the implementation (NFR-08, SM-13).

**Inputs:** eApp case record; PVQ issue record; registry entries for both.

**Outputs:** Bidirectional `RelatedRef` entries resolvable in either direction.

**Validation rules:** `parentCaseRef` non-empty; `answerLocus` matches `^[A-Z0-9_]+(\.[A-Za-z0-9_\[\]]+)*$`; `subjectRef` matches the seeded subject format.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Referenced case not found in eApp | 200 | — | Related panel: "The related case couldn't be found in eApp. We've logged the problem — reference {correlationId}." |
| Subject mismatch between systems | 200 | — | "This related item couldn't be confirmed. We've logged the problem — reference {correlationId}." |
| PVQ unavailable | 200 | — | "PVQ isn't responding right now, so this related issue can't be opened." |

**Acceptance criteria:**
- AC-1: The relationship is discoverable in both directions through adapters only; an architecture test confirms zero cross-namespace queries.
- AC-2: Editing `parentCaseRef` directly in PVQ's store changes what the case page shows, proving the link is live rather than hard-coded.

---

### FR-F07a-02 — Step 1–2: Entry from the queue and case detail (SCR-13 → SCR-15)

**Description:** The investigator finds the case in the unified queue and opens it.

**Inputs:** Investigator session; queue at default view.

**Processing / business rules:**
1. The seeded investigator's default queue (`assignee=me`, sorted by due date ascending) contains `EAPP:CASE-A-1042` on page 1. The demo does not require filtering to find it, though filtering to source system `eApp` also surfaces it (`FR-F18-05` documents both paths).
2. The row is attributed "eApp" and shows subject, status "Under review", priority, and due date.
3. Activating the row navigates to SCR-15 with `returnTo` encoding the queue state, and sets the breadcrumb `Work Queue › eApp Case A-1042`.
4. SCR-15 loads case detail via the eApp adapter and the related items panel via the PVQ, PDT, and IM adapters concurrently (`FR-F06-05`). The main case content does not wait on the related panel: case detail renders first; the related panel renders its own skeleton and resolves independently.
5. The header shows **"1 outstanding issue"** as a link to the related items panel, with an anchor that moves focus to the panel heading.
6. Elapsed time from row activation to case content rendered: ≤2 seconds under seeded data (NFR-17).

**Outputs:** SCR-15 populated, related panel resolved, outstanding-issue indicator visible.

**Validation rules:** The investigator must be the assignee or in-unit per `ATTR-INV-01`; the demo persona is the assignee, which also grants the act permission needed later.

**Error handling:** Per `FR-F06-01`. If PVQ is down at this step, the case still opens; the related panel shows the PVQ-unavailable state and the workflow is blocked with an explanation rather than a broken page — and `FR-F18-09` documents this as a demo-day contingency.

**Acceptance criteria:**
- AC-1: The case opens from the queue in one activation with no interstitial.
- AC-2: The outstanding-issue indicator is present and links to the related panel.
- AC-3: Zero authentication events occur during this step.

---

### FR-F07a-03 — Step 3: Discovery and traversal to the PVQ issue (SCR-15 → SCR-16)

**Description:** The moment the product's thesis is either proven or lost: moving from one system's record to another's without leaving the experience.

**Inputs:** `RelatedRef { relationshipType: HAS_ISSUE, targetSystem: PVQ, targetNativeId: ISS-2207, label, contextHint }`.

**Processing / business rules:**
1. The related items panel renders the issue with its **explained relationship**, sourced from PVQ's `answerSectionLabel`, not composed by the UI:
   **"Issue raised against Section 13A — Employment history"**, with the PVQ badge, issue status "Open", raised date, and the issue title.
2. Activating it performs a client-side route change to `/work/PVQ:ISS-2207?returnTo=…&from=EAPP:CASE-A-1042`. Requirements on this transition:
   - It MUST be an in-shell navigation. No new tab, no window open, no redirect to a spoke origin, no iframe.
   - It MUST NOT trigger any authentication prompt, interstitial, or loading screen that replaces the shell. The header, banner, and navigation remain mounted throughout.
   - Breadcrumb becomes `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207`, with source badges on the second and third segments.
   - Focus moves to the new page's `<h1>`, and the page title updates (`FR-F03-01`).
   - No identifier is typed, copied, or re-entered by the user at any point (SM-04).
3. SCR-16 renders with the case context preserved in a "Related case" summary strip at the top: "Part of eApp Case A-1042 — {subject name}", itself a link back.
4. The issue detail quotes the flagged answer in context: the question text, the `answerSnapshot`, and the `answerSectionLabel`. The investigator can also open the parent case's exact section via a link that deep-anchors to `#SECTION_13A` on SCR-15 (`FR-F06-08`).
5. The transition writes one audit record `RELATED_ITEM_TRAVERSED` with both `EAPP:CASE-A-1042` and `PVQ:ISS-2207` and the workflow correlation ID, so the audit chain shows the traversal, not just the endpoints.

**Outputs:** SCR-16 with case context, quoted answer, and the resolution form available.

**Validation rules:**
- The `from` parameter is validated as a well-formed `workItemId` and is used only for breadcrumb and audit context — it never influences authorization. Authorization for the issue is evaluated independently (`FR-F02-01`).
- If the principal is entitled to the case but not the issue, traversal is denied with the standard denial; the case page's related panel would have already shown "You don't have access to the related item in PVQ."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| PVQ unavailable at traversal | 503 | `UPSTREAM_UNAVAILABLE` | "PVQ isn't responding right now, so we can't open this issue. Your other work is still available." with "Try again" and "Back to the case." |
| Not entitled to the issue | 403 | `AUTHZ_DENIED` | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {correlationId}." |
| Issue already resolved by someone else | 200 | — | Banner on SCR-16: "This issue was already resolved by {actor} on {date}. No further action is needed." Resolution form is disabled with that reason. |

**Acceptance criteria:**
- AC-1: Traversal produces zero authentication events and zero navigations outside the hub origin (asserted by E2E test, SM-02).
- AC-2: The breadcrumb names both systems; the case context strip is present on SCR-16.
- AC-3: The relationship label is sourced from PVQ's data, verified by changing the seeded label and observing the UI change.

---

### FR-F07a-04 — Step 4: The resolution form (SCR-16)

**Description:** What the investigator fills in to resolve the issue, and how it is validated.

**Inputs:** `POST /api/orchestration/resolve-pvq-issue` (the orchestrated endpoint, specified in `F07b`) with:
- `issueId` (string, required) — `PVQ:ISS-2207`
- `parentCaseId` (string, required) — `EAPP:CASE-A-1042`, echoed from the detail response, re-verified server-side
- `disposition` (enum, required) — `SUBSTANTIATED` | `UNSUBSTANTIATED` | `RESOLVED_WITH_CLARIFICATION` | `REFERRED_FOR_FURTHER_REVIEW`
- `resolutionNarrative` (string, required, 20–4000 chars)
- `reviewedAnswerConfirmed` (boolean, required, must be `true`)
- `stateVersion` (string, required) — from the detail response
- `idempotencyKey` (string, required) — client ULID
- CSRF header required

**Processing / business rules:**
1. The form is a USWDS form built from the `RESOLVE_ISSUE` `ActionDescriptor.formSchema`:
   - A radio group for disposition inside a `<fieldset>` with `<legend>` "Resolution disposition", each option carrying hint text explaining what it means. Radio (not select) because the options are few and consequential.
   - A textarea for the narrative with a character counter announced politely at 90% and 100% of limit.
   - A checkbox "I have reviewed the flagged answer" — required, acting as the deliberate-action gate.
2. The action panel displays the dual-system notice before submission: **"This updates PVQ and eApp."**
3. On submit the UI disables the primary button, shows a busy state with `aria-busy`, and announces "Resolving issue. This updates two systems."
4. The submission is **not optimistic**. The UI shows the result only after `F07b` orchestration returns per-system outcomes.
5. `REFERRED_FOR_FURTHER_REVIEW` does **not** clear the eApp outstanding-issue state: the issue moves to PVQ status `REFERRED` and eApp's outstanding count is unchanged. This is specified deliberately so the dual-write is not a blanket rule but a disposition-driven one, and so the demo can show both a clearing and a non-clearing path. Which spokes are written for each disposition:

   | Disposition | PVQ result | eApp result | targetSystems |
   |---|---|---|---|
   | `SUBSTANTIATED` | `RESOLVED_SUBSTANTIATED` | outstanding count −1; if 0 → `caseState = REVIEW_COMPLETE_PENDING_ADJUDICATION` | PVQ, EAPP |
   | `UNSUBSTANTIATED` | `RESOLVED_UNSUBSTANTIATED` | outstanding count −1; same state rule | PVQ, EAPP |
   | `RESOLVED_WITH_CLARIFICATION` | `RESOLVED_WITH_CLARIFICATION` | outstanding count −1; same state rule | PVQ, EAPP |
   | `REFERRED_FOR_FURTHER_REVIEW` | `REFERRED` | unchanged | PVQ |

6. The flagship demo path uses `SUBSTANTIATED` (`FR-F18-05`).

**Validation rules (server-authoritative, mirrored client-side):**
- `disposition` ∈ the four values → "Choose a resolution disposition."
- `resolutionNarrative` trimmed length ≥20 → "Enter at least 20 characters describing how you resolved this issue." ; ≤4000 → "Shorten this to 4000 characters or fewer. You've used {m}."
- `reviewedAnswerConfirmed === true` → "Confirm that you have reviewed the flagged answer."
- `parentCaseId` MUST match the issue's actual `parentCaseRef` resolved server-side from PVQ. A mismatch is rejected: the client does not get to tell the server which case to update.
- `stateVersion` current → else `STATE_CONFLICT`.
- Principal MUST hold `ISSUE.RESOLVE` and be the assignee of the parent case (`ATTR-INV-02`).

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Validation failure | 400 | `VALIDATION_FAILED` | "There is a problem. Fix the following, then try again." + per-field copy above. |
| Parent case mismatch | 400 | `RELATIONSHIP_MISMATCH` | "We couldn't confirm which case this issue belongs to. Refresh the page and try again — reference {correlationId}." |
| Not the assignee | 403 | `AUTHZ_DENIED` | "You don't have permission to resolve this issue." |
| Issue already resolved | 409 | `ACTION_NOT_AVAILABLE` | "This issue was already resolved. Refresh the page to see its current status." |
| Either system unavailable at submit | 503 | `UPSTREAM_UNAVAILABLE` | "{System} isn't responding right now, so nothing was changed. Try again in a moment." |

**Acceptance criteria:**
- AC-1: The form validates identically client-side and server-side; disabling JavaScript-side validation does not permit an invalid submission.
- AC-2: Submitting `parentCaseId` for a different case is rejected.
- AC-3: The dual-system notice appears before submission, and the referral disposition writes only PVQ.

---

### FR-F07a-05 — Step 6: Verification affordance and return path

**Description:** After the orchestrated write (`F07b`), the investigator can independently satisfy themselves that both systems changed.

**Processing / business rules:**
1. The confirmation view (SCR-20, `FR-F07b-04`) offers three destinations, all real:
   - "View the updated issue in PVQ" → SCR-16 re-read from PVQ, showing status `Resolved — Substantiated`, disposition, narrative, and resolver.
   - "Return to eApp Case A-1042" → SCR-15 re-read from eApp, showing **"No outstanding issues"** and the updated case state.
   - "Back to work queue" → SCR-13 with the original filters, sort, and page restored.
2. Both destinations re-read live from their owning spokes. The confirmation view does not cache the pre-computed result and present it as a fresh read; re-reads carry a new correlation ID linked to the workflow chain by `parentCorrelationId`.
3. A "View audit trail for this action" link opens SCR-34 chain view filtered to the workflow correlation ID (`FR-F07b-06`).
4. The demo script additionally shows direct spoke API calls (`GET {pvq}/issues/ISS-2207`, `GET {eapp}/cases/CASE-A-1042`) proving the change outside the hub entirely (SM-03, `FR-F18-05`).

**Acceptance criteria:**
- AC-1: Returning to the case shows "No outstanding issues" sourced from eApp's own API.
- AC-2: The independent spoke API calls return the updated state (SM-03).
- AC-3: Round trip from confirmation to case to queue preserves context with no re-authentication.

---

### FR-F07a-06 — Continuity assertions (the acceptance contract)

**Description:** The properties an automated test must assert for this workflow to count as passing. These are requirements, not aspirations.

**Processing / business rules:** The end-to-end test (`FR-F19-01`) drives the browser through steps 1–6 and asserts:
1. **Exactly one authentication event** in `Y0a.audit_events` with `action = AUTH_SUCCESS` for the session (SM-02).
2. **Zero navigations outside the hub origin** — network trace contains no document request to a spoke port.
3. **Zero credential prompts** — no login form rendered after the initial sign-in.
4. **Zero manual context re-entry** — the test types only the disposition narrative and never an identifier (SM-04).
5. **Both systems changed**, asserted by direct calls to the eApp and PVQ APIs, not through the hub (SM-03).
6. **One correlated audit chain** containing ≥5 records: case read, issue read, traversal, PVQ write, eApp write, confirmation (SM-20).
7. **The demo banner present** on every screen visited (NFR-13).
8. **Zero serious or critical accessibility violations** on SCR-13, SCR-15, SCR-16, SCR-20 (SM-07).
9. **Total wall-clock under 3 minutes** for a manual run following the demo script (PRD F7 acceptance signal).
10. **Repeatable**: after `reset` (`FR-F17-11`), the workflow runs identically three consecutive times (SM-22).

**Acceptance criteria:**
- AC-1: All ten assertions pass in CI.
- AC-2: A regression in any one of them fails the build.

---
## F7 (part B) — Flagship Workflow: Orchestration, Compensation, Confirmation, Audit

**Traces to:** PRD F7 (P0 — highest priority); R-06; SM-01, SM-03, SM-20. **Screens:** SCR-20 dual-system confirmation. **API:** `Y1a §Orchestration`.

**Description:** The distributed write at the heart of the flagship workflow. One user action mutates two independent systems that share no database and support no distributed transaction. This chunk states exactly what the hub does, in what order, what it does when the second write fails, what the user is told, and what the audit trail records. Nothing here is hand-waved: there is no two-phase commit available, so the behavior is a **forward-recovery saga with explicit partial-completion disclosure and an idempotent retry path**.

**Terminology:**
- **Orchestration** — the hub-coordinated sequence of adapter writes belonging to one user action.
- **Leg** — one spoke write within the orchestration (`PVQ leg`, `eApp leg`).
- **Partial completion** — the state in which one leg succeeded and another did not.
- **Compensation** — the action taken when a leg fails after a prior leg succeeded.
- **Reconciliation record** — the durable hub row that makes a partial completion recoverable rather than lost (`Y0a.orchestration_transactions`).

---

### FR-F07b-01 — Orchestration endpoint and execution sequence

**Description:** The single endpoint backing the flagship action, and the exact order of operations.

**Inputs:** `POST /api/orchestration/resolve-pvq-issue` — payload per `FR-F07a-04`.

**Processing / business rules — the sequence, in order:**
1. **Authorize.** Full decision per `FR-F02-01` for `ISSUE.RESOLVE` on `PVQ:ISS-2207`, and for `CASE.UPDATE_ISSUE_STATE` on `EAPP:CASE-A-1042`. **Both** must pass before anything is written. A principal authorized for one leg but not the other is denied outright with `AUTHZ_DENIED` — the hub never performs a half-authorized orchestration.
2. **Validate.** Payload validation per `FR-F07a-04`.
3. **Verify the relationship.** Read the issue from PVQ; confirm `parentCaseRef == parentCaseId`, `subjectRef` matches the case's subject, and the issue is in a resolvable state. Read the case from eApp; confirm it exists and lists this issue in `outstandingIssueRefs`.
4. **Pre-flight health.** Check the current circuit and health state of **both** applications. If either is `DOWN` or its circuit is open, the orchestration is refused **before any write** with `UPSTREAM_UNAVAILABLE` naming the system. Refusing up front is preferred to discovering it halfway.
5. **Create the reconciliation record.** Insert `Y0a.orchestration_transactions` with `{ transactionId, correlationId, principalId, workflow: "RESOLVE_PVQ_ISSUE", idempotencyKey, legs: [{system: PVQ, state: PENDING}, {system: EAPP, state: PENDING}], state: IN_PROGRESS, createdAt }`. This row exists **before** any spoke is written, so a crash mid-orchestration is discoverable.
6. **Execute leg 1 — PVQ (the system of record for the issue).** `performAction(principal, ISS-2207, "RESOLVE_ISSUE", { disposition, narrative })`. PVQ is first because it owns the authoritative outcome; eApp's state is derived from it. On success, update the leg to `COMMITTED` with the spoke's returned state and write audit record #1 (`FR-F07b-06`).
7. **Execute leg 2 — eApp (the derived state).** `performAction(principal, CASE-A-1042, "CLEAR_OUTSTANDING_ISSUE", { issueRef: "ISS-2207", resolvedDisposition })`. On success, update the leg to `COMMITTED` and write audit record #2.
8. **Finalize.** Set the transaction `state = COMPLETED`, re-read both items from their spokes, and return per-system outcomes (`FR-F07b-04`).
9. **Failure branches** are specified in `FR-F07b-02` and `FR-F07b-03`.
10. **Idempotency.** `idempotencyKey` is unique-constrained on the transaction table. A repeat submission with the same key returns the stored outcome without re-executing either leg.
11. **Timeouts.** Each leg carries the registry-configured timeout (default 5 s). The eApp leg does not inherit time already spent on the PVQ leg; the overall request budget is 15 s, after which the response returns the current known state rather than hanging.
12. `REFERRED_FOR_FURTHER_REVIEW` executes leg 1 only; the transaction has a single leg and completes after step 6.

**Outputs:** `{ transactionId, correlationId, overallOutcome, systems: [ { applicationId, label, outcome, stateBefore, stateAfter, message } ], retry: { available, endpoint } | null }` where `overallOutcome ∈ COMPLETED | PARTIALLY_COMPLETED | FAILED`.

**Validation rules:** Steps 1–4 are all preconditions; none may be skipped, reordered, or made conditional on configuration.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Either leg unauthorized | 403 | `AUTHZ_DENIED` | "You don't have permission to resolve this issue." |
| Relationship verification failed | 400 | `RELATIONSHIP_MISMATCH` | "We couldn't confirm which case this issue belongs to. Refresh the page and try again — reference {correlationId}." |
| Either system unhealthy pre-flight | 503 | `UPSTREAM_UNAVAILABLE` | "{System} isn't responding right now, so nothing was changed. Try again when it's back." |
| Overall budget exceeded | 504 | `ORCHESTRATION_TIMEOUT` | "This is taking longer than expected. Check the issue's current status before trying again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: The reconciliation row exists before the first spoke write, verified by test with an injected crash.
- AC-2: A repeated `idempotencyKey` executes the legs exactly once.
- AC-3: An unhealthy eApp prevents the PVQ write from occurring at all.

---

### FR-F07b-02 — Failure of leg 1 (PVQ): clean abort

**Description:** The simple case — nothing was written, so nothing needs undoing.

**Processing / business rules:**
1. If the PVQ write fails for any reason (rejection, timeout, unavailability), the transaction is marked `FAILED`, leg 1 `FAILED` with its error class, and **no eApp call is attempted**.
2. One audit record is written: `action = ORCHESTRATION_FAILED`, `outcome = FAILURE`, `targetSystem = PVQ`, with the error class and the correlation ID.
3. The user sees an error on SCR-16 (not SCR-20, because there is no dual outcome to confirm): the message states unambiguously that **nothing changed**, and offers "Try again."
4. If the PVQ write times out with an indeterminate outcome, the transaction is marked `INDETERMINATE` rather than `FAILED`, and the message tells the user their outcome is unknown and how to check. Retry in this state is still safe because of idempotency at both the hub and the spoke (`FR-F09-07` requires spokes to honour `X-UAL-Idempotency-Key`).

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| PVQ rejected the action | 422 | `UPSTREAM_REJECTED_ACTION` | "PVQ couldn't resolve this issue: {plain reason from PVQ}. Nothing was changed." |
| PVQ unavailable | 503 | `UPSTREAM_UNAVAILABLE` | "PVQ isn't responding right now, so nothing was changed. Try again in a moment." |
| PVQ timeout, outcome unknown | 502 | `UPSTREAM_INDETERMINATE` | "We're not sure whether PVQ recorded your resolution. Refresh this issue to check its status before trying again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: A forced PVQ failure leaves eApp completely untouched, verified by direct eApp API read.
- AC-2: The user message correctly states that nothing changed.

---

### FR-F07b-03 — Failure of leg 2 (eApp): partial completion and compensation

**Description:** The hard case, and the one R-06 names. PVQ has committed; eApp has not. This is a distributed write across two independent systems with no shared transaction. Here is exactly what happens.

**Processing / business rules:**
1. **No rollback of leg 1 is attempted.** Reversing a recorded investigative disposition would fabricate a false history in the system of record and would itself require an audited mutation that never actually reflected the investigator's intent. PVQ's resolution stands. The chosen strategy is **forward recovery**, not compensation-by-reversal.
2. The transaction is marked `state = PARTIALLY_COMPLETED`, leg PVQ `COMMITTED`, leg EAPP `FAILED` with error class and attempt count.
3. A **compensation task** is enqueued in `Y0a.orchestration_retry_queue` with `{ transactionId, system: EAPP, operation, payload, attempts: 0, nextAttemptAt }`. The hub retries the eApp leg automatically with exponential backoff (5 s, 15 s, 45 s, 135 s; 4 attempts maximum), and stops when eApp succeeds or attempts are exhausted.
4. Automatic retry uses the same idempotency key, so a retry after an indeterminate first attempt cannot double-decrement `outstandingIssueCount`. eApp's `CLEAR_OUTSTANDING_ISSUE` is additionally specified as idempotent on `issueRef` (`Y0b §eApp`): clearing an already-cleared issue reference is a no-op returning success.
5. **The user is told immediately and precisely.** SCR-20 renders in partial state (`FR-F07b-04`) with per-system outcomes. The response NEVER reports overall success. The word "success" does not appear on a partial confirmation.
6. A **manual retry** control is offered: `POST /api/orchestration/{transactionId}/retry`, authorized to the original principal and to Administrators, idempotent, which attempts the outstanding leg immediately and returns fresh per-system outcomes.
7. If retries are exhausted, the transaction is marked `NEEDS_ATTENTION`, an `integration_issues` row is created with class `ORCHESTRATION_INCOMPLETE`, and it appears in the administrator's integration issues list (`FR-F11-03`) with a direct link to the transaction and its manual retry. The condition is surfaced to a human rather than being silently abandoned.
8. Until the eApp leg commits, the eApp case continues to display "1 outstanding issue" — which is **correct**, because that is genuinely eApp's state. The UI never fakes convergence. SCR-15 additionally shows, for the affected case, an advisory: "A resolution was recorded in PVQ on {date} but hasn't been applied to this case yet. We're retrying automatically."
9. Every retry attempt, successful or not, writes its own audit record sharing the original correlation ID, so the chain reads as one continuing narrative.

**Outputs:** `overallOutcome: PARTIALLY_COMPLETED` with per-system detail and a retry affordance.

**Validation rules:** Manual retry is permitted only while the transaction is `PARTIALLY_COMPLETED` or `NEEDS_ATTENTION`; retrying a `COMPLETED` transaction returns the stored outcome unchanged.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| eApp leg failed after PVQ committed | 207 | `ORCHESTRATION_PARTIAL` | "Partly completed. PVQ recorded your resolution. eApp hasn't been updated yet — we're retrying automatically. You can also retry now. Reference {correlationId}." |
| Manual retry failed again | 207 | `ORCHESTRATION_PARTIAL` | "eApp still isn't responding. PVQ's record is unchanged and correct. We'll keep retrying — reference {correlationId}." |
| Retry attempts exhausted | 207 | `ORCHESTRATION_NEEDS_ATTENTION` | "eApp couldn't be updated after several attempts. PVQ's record is correct. An administrator has been notified — reference {correlationId}." |
| Retry on a completed transaction | 200 | — | "This was already completed. Both systems are up to date." |

**Acceptance criteria:**
- AC-1: With eApp forced to fail, the response is 207 `ORCHESTRATION_PARTIAL`, the word "success" appears nowhere, and both per-system outcomes are shown accurately (R-06).
- AC-2: Restoring eApp causes automatic retry to converge within the backoff schedule with no user action, and the case then shows "No outstanding issues."
- AC-3: Exhausted retries produce exactly one `ORCHESTRATION_INCOMPLETE` integration issue visible to an administrator.
- AC-4: Double-execution of the eApp leg cannot decrement the outstanding count twice (idempotency test).

---

### FR-F07b-04 — Dual-system confirmation view (SCR-20)

**Description:** The screen that proves both systems changed, by reporting what each system independently says.

**Inputs:** Orchestration response; fresh re-reads from both spokes.

**Processing / business rules:**
1. After finalization the hub **re-reads** the issue from PVQ and the case from eApp through their adapters, and SCR-20 displays those returned states — not the values the hub intended to write. The distinction matters: the screen reports observed state, not asserted state.
2. Layout:
   - `<h1>` reflecting outcome: "Resolution complete" (COMPLETED) or "Partly completed" (PARTIALLY_COMPLETED) or "Not completed" (FAILED).
   - A summary alert matching outcome severity (success / warning / error), `role="status"` or `role="alert"` as appropriate, receiving focus on render.
   - A **per-system results table** with columns: System, What we asked for, What the system reports now, Outcome. One row per leg, each badged with the system name and carrying the timestamp of the re-read.
   - The narrative and disposition recorded, so the user can confirm what they submitted.
   - Actions: "View the updated issue in PVQ", "Return to eApp Case A-1042", "Back to work queue", "View audit trail for this action". Plus "Retry eApp update" when partial.
3. The table is a real `<table>` with `<caption>` "Results in each connected system", `scope` attributes, and text-plus-icon outcome indicators — never color alone.
4. The screen is announced once via live region: "Resolution complete. PVQ and eApp both updated." or "Partly completed. PVQ updated. eApp not updated."
5. If a re-read fails, that row reads "We couldn't confirm the current state in {System}." with a "Check again" control — the view degrades honestly rather than omitting the row.

**Outputs:** SCR-20 in one of three outcome presentations.

**Validation rules:** The screen MUST render all legs, including the ones that failed. A leg is never omitted for tidiness.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Re-read failed for a system | 200 | — | Row copy: "We couldn't confirm the current state in {System}." with "Check again." |

**Acceptance criteria:**
- AC-1: The confirmation table shows PVQ status `Resolved — Substantiated` and eApp `No outstanding issues`, both from fresh reads (SM-03).
- AC-2: In partial state the table shows one committed and one failed row, with the retry action present.
- AC-3: SCR-20 passes the accessibility scan and is fully keyboard-operable.

---

### FR-F07b-05 — Post-condition state model

**Description:** The exact expected state in both systems after a successful `SUBSTANTIATED` resolution — the demo script's assertion target.

**Post-conditions (PVQ, `Y0b §PVQ`):**
- `issue.status = RESOLVED_SUBSTANTIATED`
- `issue.disposition = SUBSTANTIATED`
- `issue.resolutionNarrative = {submitted narrative}`
- `issue.resolvedBy = {principal display name}`, `issue.resolvedByPrincipalId = {principalId}`
- `issue.resolvedAt = {UTC timestamp}`
- One new row in PVQ's own `issue_activity` table with actor and action

**Post-conditions (eApp, `Y0b §eApp`):**
- `case.outstandingIssueRefs` no longer contains `ISS-2207`
- `case.outstandingIssueCount` decremented by 1
- If count reaches 0: `case.caseState = REVIEW_COMPLETE_PENDING_ADJUDICATION`; otherwise `caseState` unchanged
- One new row in eApp's own `case_activity` table

**Post-conditions (hub):**
- `orchestration_transactions.state = COMPLETED`, both legs `COMMITTED`
- ≥5 `audit_events` rows sharing one `correlationId`
- Zero `integration_issues` rows for this correlation ID

**Acceptance criteria:**
- AC-1: Every post-condition is asserted by the E2E test via each system's own API (`FR-F19-01`).
- AC-2: The demo script states these post-conditions so a reviewer knows what to look for (`FR-F18-05`).

---

### FR-F07b-06 — Correlated audit chain for the workflow

**Description:** The whole workflow reads as one narrative in the audit viewer.

**Processing / business rules:**
1. The UI generates one workflow correlation ID when the investigator opens the case and sends it as `X-Correlation-Id` on every subsequent request in the workflow (`FR-F01-06`).
2. Records written, in order, all sharing that ID:

   | # | Action | Target system | Outcome | Notes |
   |---|---|---|---|---|
   | 1 | `WORK_ITEM_VIEWED` | EAPP | SUCCESS | case read |
   | 2 | `RELATED_ITEMS_RESOLVED` | HUB | SUCCESS | related refs resolved, targets listed |
   | 3 | `RELATED_ITEM_TRAVERSED` | HUB | SUCCESS | from case to issue |
   | 4 | `WORK_ITEM_VIEWED` | PVQ | SUCCESS | issue read |
   | 5 | `ORCHESTRATION_STARTED` | HUB | SUCCESS | transactionId, legs planned |
   | 6 | `ISSUE_RESOLVED` | PVQ | SUCCESS | before/after summary |
   | 7 | `CASE_ISSUE_CLEARED` | EAPP | SUCCESS | before/after summary |
   | 8 | `ORCHESTRATION_COMPLETED` | HUB | SUCCESS | overall outcome, per-leg states |

   Failure paths substitute `ORCHESTRATION_PARTIAL` / `ORCHESTRATION_FAILED` at #8 and add `ORCHESTRATION_RETRY_ATTEMPTED` records for each retry.
3. Records 6 and 7 each carry a `beforeSummary` / `afterSummary` describing the state change in plain language ("status: Open → Resolved — Substantiated"; "outstanding issues: 1 → 0").
4. SCR-34's chain view renders these as an ordered narrative with system badges and elapsed time between steps, plus a single-line summary at the top: "Investigator {name} resolved PVQ issue ISS-2207 against eApp case A-1042 on {date}. Both systems updated."
5. The chain is exportable (`FR-F13-08`) for the demo.

**Validation rules:** Every record MUST carry the correlation ID; an audit write missing it fails the operation (`FR-F13-01`).

**Error handling:** If audit writing fails at record 6, the PVQ write has already committed — the transaction is marked `AUDIT_GAP`, an `integration_issues` row of class `AUDIT_WRITE_FAILED` is created, and the user is shown the `AUDIT_WRITE_FAILED` message. This is deliberately treated as a serious condition: the system reports the action as not completed and surfaces the discrepancy rather than hiding it.

**Acceptance criteria:**
- AC-1: The flagship workflow renders as a single correlated chain of ≥5 records in the viewer (SM-20).
- AC-2: The chain view's summary line correctly names actor, both systems, and outcome.
- AC-3: A partial completion's chain clearly shows which leg failed and every retry attempt.

---

### FR-F07b-07 — Generalization: orchestration is not special-cased to one workflow

**Description:** The orchestration machinery is reusable, so a second cross-system workflow would not require new hub plumbing (NFR-19).

**Processing / business rules:**
1. Orchestrations are defined as configuration: `{ workflowId, legs: [{ applicationId, operation, payloadMapping, required }], preconditions, onLegFailure: ABORT | FORWARD_RECOVER }`.
2. `resolve-pvq-issue` is the first instance of this definition, not a bespoke code path. A second workflow (e.g. PDT designation change propagating to IM case tier) is addable by adding a definition plus adapter operations both spokes already declare.
3. Leg order, retry policy, and failure strategy come from the definition; the execution engine is generic.
4. The engine emits the same reconciliation rows, audit records, and confirmation shape for any workflow, so SCR-20 renders any orchestration without modification.

**Acceptance criteria:**
- AC-1: A second, trivial orchestration definition added in configuration executes end-to-end and renders on SCR-20 with no code change (design-review demonstrable).
- AC-2: The engine contains no reference to PVQ or eApp by name.

---
## F8 (part A) — The Adapter Interface Contract

**Traces to:** PRD F8 (P0); NFR-08, NFR-11, NFR-19, SM-13. **API:** `Y3-integrations.md`. **Screens:** none directly (this is the integration seam).

**Description:** The common interface every spoke adapter implements, identically. This contract is the extensibility deliverable: a sixth application must be addable by writing one adapter implementation plus a registry row, with **zero changes to hub code**. This chunk specifies the exact operations, their request and response shapes, timeout and retry policy, circuit-breaking, and the complete error taxonomy. Part B (`F08b`) specifies the registry that drives which adapters exist and how they are configured.

**Terminology:**
- **Adapter** — the hub-side component translating between the hub's models and one spoke's native API. The only path from hub to spoke.
- **Conformance** — satisfying the interface, the normalization rules, and the behavioral tests in `FR-F08a-08`.
- **Adapter type** — the implementation kind named in the registry (`REST_JSON_V1` for all demo spokes); the hub instantiates by type.
- **Circuit** — per-application failure gate with `CLOSED`, `OPEN`, `HALF_OPEN` states.

---

### FR-F08a-01 — Interface operations (the contract)

**Description:** The eight operations every adapter implements. Nothing else may be called on an adapter by the hub; no hub code may reach a spoke by any other means.

**Common call envelope.** Every operation receives:
```
AdapterContext {
  principal: Principal,          // §3.1, attested downstream per FR-F01-02
  scope: Scope,                  // FR-F02-04 — mandatory, never absent
  correlationId: string,         // ULID
  requestId: string,             // ULID, unique per adapter call
  deadlineAt: ISO-8601,          // absolute; adapter must not exceed
  idempotencyKey?: string        // present on all mutating calls
}
```

| # | Operation | Purpose | Mutating |
|---|---|---|---|
| 1 | `describe()` | Capability metadata for registry and console | No |
| 2 | `healthCheck()` | Availability and latency | No |
| 3 | `listWorkItems(ctx, filters, paging)` | Normalized work items | No |
| 4 | `getWorkItem(ctx, nativeId)` | Full detail + available actions + related refs | No |
| 5 | `getWorkItemSummary(ctx, nativeId)` | Lightweight summary for related-items panels | No |
| 6 | `performAction(ctx, nativeId, actionId, payload)` | Execute a state change | **Yes** |
| 7 | `getActivityHistory(ctx, nativeId, paging)` | Spoke-native history | No |
| 8 | `establishContext(ctx)` / `revokeContext(ctx, handle)` | Optional session handles (`FR-F01-04`) | Yes (session only) |

**Rules:**
1. Every operation is asynchronous and returns either a typed success result or a typed `AdapterError` (`FR-F08a-06`). Adapters MUST NOT throw untyped errors across the boundary; an unexpected exception is wrapped as `ADAPTER_INTERNAL`.
2. Every operation MUST honour `deadlineAt` and abort its in-flight call when reached.
3. Every non-mutating operation MUST be side-effect free in the spoke.
4. `performAction` MUST pass `idempotencyKey` to the spoke as `X-UAL-Idempotency-Key`.
5. An adapter MUST NOT call another adapter, read another spoke, or reach the hub's database. Cross-system coordination belongs to the orchestration engine (`FR-F07b-07`).
6. Operations 5 and 8 are optional: an adapter declares support in `describe()`. When unsupported, the hub degrades affordances (`FR-F08a-07`) rather than erroring — `getWorkItemSummary` falls back to `getWorkItem`, and context handling is skipped.

**Acceptance criteria:**
- AC-1: All six demo adapters (five spokes + the sixth demo app) implement operations 1–7 identically and pass the conformance suite.
- AC-2: A static check finds zero direct spoke HTTP calls in hub code outside adapter implementations.

---

### FR-F08a-02 — `describe()` and `healthCheck()`

**`describe()` — inputs:** none (no principal required; it is metadata).

**Response:**
```json
{
  "applicationId": "PVQ",
  "displayName": "Personnel Vetting Questionnaire",
  "adapterVersion": "1.0.0",
  "contractVersion": "1.0",
  "workItemTypes": [
    { "type": "PVQ_ISSUE", "label": "Questionnaire issue", "contentProfile": "ISSUE_DETAIL",
      "statusMap": { "OPEN": "OPEN", "IN_REVIEW": "IN_PROGRESS",
                     "RESOLVED_SUBSTANTIATED": "CLOSED", "RESOLVED_UNSUBSTANTIATED": "CLOSED",
                     "RESOLVED_WITH_CLARIFICATION": "CLOSED", "REFERRED": "BLOCKED" },
      "priorityNative": true }
  ],
  "actions": [
    { "actionId": "RESOLVE_ISSUE", "label": "Resolve issue", "appliesToTypes": ["PVQ_ISSUE"],
      "requiredPermission": "ISSUE.RESOLVE", "formSchema": { "fields": [ ... ] },
      "targetSystems": ["PVQ"], "idempotent": true }
  ],
  "capabilities": { "supportsSearch": true, "supportsFilter": ["status","priority","dueDate"],
                    "supportsContext": false, "supportsSummary": true,
                    "supportsActivityHistory": true, "maxPageSize": 200 },
  "relationshipTypesEmitted": ["ISSUE_AGAINST"],
  "iconToken": "icon-clipboard-check"
}
```

**Processing / business rules:**
1. `describe()` is called at registration (`FR-F12-03`), at hub startup, and on demand from the admin console. Results are cached with the registry row and refreshed on manual "Test connection."
2. `contractVersion` is checked against the hub's supported set. An unsupported version blocks registration with a specific message and marks an existing application `INCOMPATIBLE` rather than silently misbehaving.
3. Every `workItemTypes[].statusMap` MUST map every native status the spoke can emit to exactly one `statusCategory`. Unmapped statuses are a conformance failure (`FR-F05-02`).
4. Declared `actions[].requiredPermission` MUST exist in the role matrix (`FR-F02-02`); an unknown permission blocks registration.

**`healthCheck()` — response:**
```json
{ "status": "HEALTHY" | "DEGRADED" | "DOWN", "latencyMs": 42,
  "checkedAt": "2026-09-14T15:04:11Z", "version": "1.0.0", "detail": "optional plain text" }
```

**Rules:** `healthCheck()` uses a shorter timeout than data operations (default 2 s), never retries, and is never blocked behind the circuit breaker — it is how recovery is detected. `DEGRADED` means reachable but exceeding its latency threshold.

**Error handling:**

| Scenario | Code | Behavior |
|---|---|---|
| `describe()` unreachable at registration | `ADAPTER_UNREACHABLE` | Registration blocked with "We couldn't reach that application at the address you entered. Check the endpoint and try again." |
| `contractVersion` unsupported | `ADAPTER_CONTRACT_UNSUPPORTED` | "This application uses an integration version we don't support yet (version {v}). Supported versions: {list}." |
| Health check fails | `ADAPTER_UNREACHABLE` | Status recorded `DOWN`; integration issue logged. |

**Acceptance criteria:**
- AC-1: Every adapter's `describe()` validates against the schema.
- AC-2: An adapter with an unmapped native status fails the conformance suite.

---

### FR-F08a-03 — `listWorkItems` and `getWorkItem`

**`listWorkItems(ctx, filters, paging)` — inputs:**
- `filters`: `{ statusCategory?[], priority?[], type?[], assignee?, dueFrom?, dueTo?, q? }` — advisory push-down only; the hub re-applies (`FR-F05-03`)
- `paging`: `{ limit (≤ capabilities.maxPageSize), cursor? }`

**Response:** `{ items: WorkItem[], nextCursor: string | null, totalKnown: number | null, truncated: boolean }`

**Rules:**
1. The adapter MUST apply `ctx.scope` in its request to the spoke; a call without scope is a contract violation and the hub refuses to issue it (`FR-F02-04`).
2. The adapter performs normalization (§3.2). The hub validates the output schema and rejects malformed items individually rather than failing the batch.
3. `totalKnown` is null when the spoke cannot count cheaply; the UI then says "Showing {n} items" rather than "{n} of {N}".
4. The adapter MUST NOT return items outside scope even if the spoke does; it filters and reports an `INTEGRATION_SCOPE_VIOLATION`.

**`getWorkItem(ctx, nativeId)` — response:** `{ item: WorkItem, typeSpecificDetail: object, availableActions: ActionDescriptor[], relatedRefs: RelatedRef[], stateVersion: string, activitySupported: boolean }`

**Rules:**
1. `availableActions` reflects the spoke's view of what is valid **in the item's current state**; the hub then intersects with role/attribute policy (`FR-F02-05`). The spoke never has the last word on authorization, only on state validity.
2. `stateVersion` MUST change whenever any field the UI displays changes (an ETag, version counter, or content hash).
3. `relatedRefs` are opaque; the adapter never resolves them.
4. A `nativeId` that does not exist returns `NOT_FOUND`, which the hub converts to the same 403 as a denial (`FR-F06-01`).

**Acceptance criteria:**
- AC-1: A scoped list for an applicant returns only that subject's items, asserted directly against the adapter.
- AC-2: `stateVersion` changes after any mutation, verified by conformance test.

---

### FR-F08a-04 — `performAction`, `getWorkItemSummary`, `getActivityHistory`

**`performAction(ctx, nativeId, actionId, payload)` — response:**
`{ outcome: "APPLIED" | "REJECTED", newState: WorkItem, stateVersion, appliedAt, rejectionReason?: { code, plainMessage } }`

**Rules:**
1. `REJECTED` is a *business* rejection (the spoke understood but declined), returned as a normal result with a plain-language `plainMessage` safe to show a user. Transport and availability problems are `AdapterError`s instead. Conflating the two is what produces unhelpful error messages, so the contract separates them explicitly.
2. The adapter MUST pass `idempotencyKey`; the spoke MUST return the original outcome for a repeated key (`FR-F09-07`).
3. `newState` MUST be the spoke's post-write state, re-read if necessary — not the adapter's optimistic projection.
4. `performAction` MUST NOT be invoked for an `actionId` the spoke did not declare in `describe()`.

**`getWorkItemSummary(ctx, nativeId)` — response:** `{ nativeId, title, status, statusLabel, statusCategory, subjectRef, lastActivityAt }`. Optional capability; used by related-items panels to avoid fetching full detail for every reference.

**`getActivityHistory(ctx, nativeId, paging)` — response:** `{ events: ActivityEvent[] (origin: SPOKE), nextCursor }`. Optional capability; when unsupported the hub renders hub audit records only and notes "Detailed history isn't available from {System}."

**Error handling:** per `FR-F08a-06`.

**Acceptance criteria:**
- AC-1: A business rejection surfaces the spoke's plain message to the user; a transport failure does not.
- AC-2: Repeating a `performAction` with the same idempotency key applies the change once.

---

### FR-F08a-05 — Timeout, retry, backoff, and circuit-breaking policy

**Description:** Resilience behavior is uniform across adapters and configured per application in the registry — never hard-coded per spoke.

**Configuration (per application, `Y0a.registered_applications`):**

| Setting | Default | Bounds | Applies to |
|---|---|---|---|
| `timeoutMs` | 5000 | 500–30000 | list, get, summary, history |
| `actionTimeoutMs` | 10000 | 1000–30000 | performAction |
| `healthTimeoutMs` | 2000 | 500–10000 | healthCheck |
| `maxRetries` | 2 | 0–5 | idempotent operations only |
| `backoffInitialMs` | 200 | 50–5000 | retry spacing |
| `backoffMultiplier` | 2.0 | 1.0–4.0 | retry spacing |
| `backoffJitterPct` | 20 | 0–50 | retry spacing |
| `circuitFailureThreshold` | 5 | 2–50 | consecutive failures to open |
| `circuitOpenMs` | 30000 | 5000–300000 | open duration before half-open |
| `circuitHalfOpenProbes` | 1 | 1–5 | probes allowed in half-open |

**Processing / business rules:**
1. **Retries apply only to idempotent operations.** `listWorkItems`, `getWorkItem`, `getWorkItemSummary`, `getActivityHistory`, `healthCheck` (no retry by policy), `describe` are retryable. `performAction` is retried **only** when the adapter can prove the request never reached the spoke (connection refused, DNS failure, TLS failure). A timeout on `performAction` is **never** auto-retried — it becomes `ADAPTER_INDETERMINATE` and the decision passes to the orchestration engine or the user (`FR-F06-04`).
2. Retry delay: `backoffInitialMs × multiplier^(attempt-1)`, ± `jitterPct`, capped so that total elapsed never exceeds `ctx.deadlineAt`. A retry that cannot complete before the deadline is not attempted.
3. Retries are attempted on `ADAPTER_UNREACHABLE`, `ADAPTER_TIMEOUT` (non-mutating only), and HTTP 502/503/504. They are **not** attempted on 4xx, `ADAPTER_REJECTED`, `PRINCIPAL_REJECTED`, or `ADAPTER_CONTRACT_ERROR` — retrying those is guaranteed waste.
4. **Circuit breaker** per application: `circuitFailureThreshold` consecutive failures opens the circuit. While `OPEN`, calls fail immediately with `ADAPTER_CIRCUIT_OPEN` without touching the spoke — one slow spoke cannot stall the aggregate queue. After `circuitOpenMs` the circuit goes `HALF_OPEN` and admits `circuitHalfOpenProbes` calls; success closes it, failure re-opens it with the timer reset.
5. The circuit never blocks `healthCheck()`, so recovery is always detectable and automatic (SM-17).
6. Circuit state transitions write `integration_issues` rows and are visible in the admin console (`FR-F11-02`).
7. All timeouts are enforced by the hub as absolute deadlines, so an adapter that ignores its deadline is still cut off.

**Validation rules:** Registry values outside bounds are rejected at registration with a field error naming the bound.

**Error handling:**

| Scenario | Code | User-facing message |
|---|---|---|
| Circuit open | `ADAPTER_CIRCUIT_OPEN` | "{System} isn't responding right now. We'll reconnect automatically." |
| All retries exhausted | `ADAPTER_UNREACHABLE` | "{System} isn't responding right now. Your other work is still available." |
| Mutating timeout | `ADAPTER_INDETERMINATE` | "We're not sure whether {System} completed this action. Refresh this item to check its current status before trying again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: With a spoke forced to hang, the work queue still returns within the configured timeout plus overhead (NFR-17).
- AC-2: Five consecutive failures open the circuit; the spoke stops receiving data calls; health probing continues.
- AC-3: Restoring the spoke closes the circuit automatically without restart or user action.
- AC-4: A `performAction` timeout is never auto-retried.

---

### FR-F08a-06 — Adapter error taxonomy

**Description:** The closed set of error classes an adapter may return. Every hub-side handling decision keys off this taxonomy, so it must be exhaustive and unambiguous.

**`AdapterError { class, httpStatusFromSpoke?, plainMessage?, retryable, correlationId, applicationId, operation, detail }`**

| Class | Meaning | Retryable | Hub → user mapping |
|---|---|---|---|
| `ADAPTER_UNREACHABLE` | Connection refused, DNS failure, TLS failure, spoke down | Yes | 503 `UPSTREAM_UNAVAILABLE` |
| `ADAPTER_TIMEOUT` | Deadline exceeded, outcome unknown | Non-mutating only | 503 (read) / 502 `UPSTREAM_INDETERMINATE` (write) |
| `ADAPTER_CIRCUIT_OPEN` | Hub declined to call a failing spoke | No (auto-recovers) | 503 `UPSTREAM_UNAVAILABLE` |
| `ADAPTER_INDETERMINATE` | Mutating call may or may not have applied | No (user decides) | 502 `UPSTREAM_INDETERMINATE` |
| `ADAPTER_REJECTED` | Spoke declined for a business reason | No | 422 `UPSTREAM_REJECTED_ACTION` with `plainMessage` |
| `ADAPTER_NOT_FOUND` | Native ID does not exist | No | 403 `AUTHZ_DENIED` (non-enumerable, `FR-F02-07`) |
| `ADAPTER_FORBIDDEN` | Spoke denied the principal | No | 403 `AUTHZ_DENIED_UPSTREAM` |
| `ADAPTER_PRINCIPAL_REJECTED` | Assertion invalid, wrong audience, expired | No | 502 `UPSTREAM_REJECTED` + integration issue |
| `ADAPTER_CONTRACT_ERROR` | Response failed schema validation | No | 502 `UPSTREAM_CONTRACT_ERROR` + integration issue |
| `ADAPTER_SCOPE_VIOLATION` | Spoke returned out-of-scope data | No | Rows dropped; issue logged; request otherwise succeeds |
| `ADAPTER_RATE_LIMITED` | Spoke signalled throttling | Yes, with `retryAfter` | 503 `UPSTREAM_UNAVAILABLE` |
| `ADAPTER_CONTRACT_UNSUPPORTED` | Contract version mismatch | No | 409 `APPLICATION_INCOMPATIBLE` |
| `ADAPTER_INTERNAL` | Unexpected adapter-side failure | No | 500 `INTERNAL_ERROR` + issue |

**Rules:**
1. Every `AdapterError` writes exactly one `integration_issues` row (`FR-F16-09`) except `ADAPTER_NOT_FOUND` and `ADAPTER_REJECTED`, which are normal business outcomes rather than integration failures.
2. `plainMessage` is the only spoke-supplied text ever shown to a user, and only for `ADAPTER_REJECTED`. It is length-capped (200 chars), HTML-escaped, and stripped of anything matching identifier/stack patterns.
3. No other spoke text — exception messages, HTTP reason phrases, response bodies — reaches the UI. It is recorded in the integration issue for administrators (`FR-F11-03`).

**Acceptance criteria:**
- AC-1: Every class is reachable in test via failure injection (`FR-F16-11`) and produces its specified user-facing message.
- AC-2: No user-facing string in any failure path contains a stack trace, hostname, or port.

---

### FR-F08a-07 — Capability negotiation and graceful affordance degradation

**Description:** An application supporting fewer capabilities loses affordances, not usability.

**Processing / business rules:**
1. `capabilities.supportsSearch: false` → the source is excluded from search fan-out, and search results note: "{System} doesn't support search. Its items aren't included in these results."
2. `capabilities.supportsActivityHistory: false` → the detail page shows hub audit records only with "Detailed history isn't available from {System}."
3. `capabilities.supportsSummary: false` → related-items panels call `getWorkItem` instead, with a correspondingly larger timeout budget.
4. An application declaring no `actions` for a type renders a read-only detail page with an explanatory note rather than an empty action panel: "No actions are available for this item."
5. Missing capabilities MUST NOT produce errors, empty regions, or disabled controls without explanation.
6. Declared but unimplemented capabilities are caught by the conformance suite before registration is permitted.

**Acceptance criteria:**
- AC-1: An adapter with all optional capabilities disabled still produces a fully usable queue and detail experience.
- AC-2: Every degraded affordance states why.

---

### FR-F08a-08 — Adapter conformance test suite

**Description:** The standalone, executable suite any new adapter must pass. This is what makes "add a sixth application" a bounded task rather than an open-ended one.

**Processing / business rules:** The suite runs against a live adapter + spoke pair and asserts:
1. **Interface completeness** — operations 1–7 present; optional operations present iff declared.
2. **`describe()` schema validity**, including complete status maps and permissions that exist in the role matrix.
3. **Normalization** — every returned WorkItem satisfies §3.2; required fields present; `workItemId` formatting; priority and status mapping correctness.
4. **Scope enforcement** — a scoped list for subject A returns zero rows for subject B; a scoped get for a foreign resource returns `ADAPTER_NOT_FOUND` or `ADAPTER_FORBIDDEN`, never data.
5. **Deadline honouring** — a call with a 100 ms deadline aborts within 150 ms.
6. **Error taxonomy** — induced connection refusal, timeout, 4xx, 5xx, and malformed response each produce the correct `AdapterError` class.
7. **Idempotency** — `performAction` repeated with one key applies once.
8. **`stateVersion` progression** — changes after mutation, stable otherwise.
9. **No cross-spoke access** — the adapter's outbound calls target only its own application's base endpoint (asserted by network policy in test).
10. **Health semantics** — `healthCheck()` returns `DOWN` promptly when the spoke is stopped and `HEALTHY` after restart.

**Outputs:** A pass/fail report readable by a reviewer (`FR-F19-09`), and a gate on registration (`FR-F12-04` runs items 1–2 and 6 live).

**Acceptance criteria:**
- AC-1: All six adapters pass the full suite in CI.
- AC-2: The suite is runnable standalone against an arbitrary adapter with a single documented command.
- AC-3: Deliberately breaking one adapter's status map fails the suite with a specific, actionable message.

---
## F8 (part B) — Data-Driven Application Registry

**Traces to:** PRD F8 (P0); NFR-11, NFR-19, SM-11, SM-12, R-07. **Screens:** SCR-22, SCR-23 (admin console). **Schema:** `Y0a §registered_applications`.

**Description:** The configuration store that tells the hub which applications exist, how to reach them, what they expose, and who may see them. Every hub behavior that depends on "which systems are there" reads from this registry. **There is no hard-coded list of five systems anywhere in the hub.** Adding, disabling, or removing an application is a data change.

**Terminology:**
- **Registry row** — one application's configuration record.
- **Registry version** — a monotonically increasing counter bumped on any registry change; clients poll it to know when to refresh entitlements.
- **Registry-derived behavior** — anything the hub computes by reading the registry rather than from code.

---

### FR-F08b-01 — Registry record fields

**Description:** The complete field set captured per application. Full DDL in `Y0a`.

| Field | Type | Required | Rules |
|---|---|---|---|
| `applicationId` | string | Yes | Immutable. `^[A-Z][A-Z0-9_]{1,15}$`. Globally unique. Used as the `sourceSystem` prefix of every `workItemId`. |
| `displayName` | string | Yes | 3–60 chars. Shown on every badge, breadcrumb, error message, and audit record. |
| `description` | string | No | ≤500 chars. Shown in the admin console. |
| `adapterType` | string | Yes | Must be a registered adapter implementation key (`REST_JSON_V1`). |
| `baseEndpoint` | string (URL) | Yes | `http`/`https`, host must resolve, no credentials in URL, no fragment. |
| `healthEndpoint` | string (URL) | Yes | Absolute, or relative to `baseEndpoint`. |
| `contractVersion` | string | Yes | Populated from `describe()`; must be hub-supported. |
| `workItemTypes` | JSON array | Yes | From `describe()`, confirmable/editable at registration. Each with type, label, contentProfile, statusMap, priorityNative. |
| `supportedActions` | JSON array | Yes | From `describe()`. Each with actionId, label, appliesToTypes, requiredPermission, formSchema. |
| `capabilities` | JSON object | Yes | From `describe()`. |
| `visibleToRoles` | array of role | Yes | ≥1 role. Controls nav, queue fan-out, and admin visibility. |
| `timeoutMs`, `actionTimeoutMs`, `healthTimeoutMs` | integer | Yes | Defaults and bounds per `FR-F08a-05`. |
| `maxRetries`, `backoffInitialMs`, `backoffMultiplier`, `backoffJitterPct` | numeric | Yes | Defaults and bounds per `FR-F08a-05`. |
| `circuitFailureThreshold`, `circuitOpenMs`, `circuitHalfOpenProbes` | integer | Yes | Defaults and bounds per `FR-F08a-05`. |
| `healthProbeIntervalSec` | integer | Yes | Default 30; bounds 10–600. |
| `iconToken` | string | Yes | A USWDS/theme token name — **never a color or an image URL** (NFR-03). Validated against the token set. |
| `enabled` | boolean | Yes | Default true. Runtime toggle. |
| `isDemoSixthApp` | boolean | No | Marks the app shipped-but-unregistered for the live demo. |
| `registeredAt`, `registeredByPrincipalId`, `updatedAt`, `updatedByPrincipalId` | — | Yes | Provenance, shown in the console. |
| `lastDescribeAt`, `lastDescribePayload` | — | No | Cached capability metadata. |

**Validation rules:** Detailed in `FR-F12-02`. `applicationId` immutability is enforced: an edit attempting to change it is rejected, because existing `workItemId`s and audit records reference it.

**Acceptance criteria:**
- AC-1: All five spokes exist as registry rows at startup; none is referenced by name in hub code.
- AC-2: Changing `displayName` changes every badge, breadcrumb, error message, and new audit record without a restart.

---

### FR-F08b-02 — Registry-derived behavior (the no-hard-coding rule)

**Description:** Every place the hub must know "which applications exist" and what it reads.

| Behavior | Derives from | Requirement |
|---|---|---|
| Work-queue fan-out | `enabled = true AND activeRole ∈ visibleToRoles` | `FR-F05-02` |
| Dashboard widget sources | same | `FR-F04-01` |
| Search fan-out | same AND `capabilities.supportsSearch` | `FR-F03-07` |
| Navigation items | `visibleToRoles` ∩ role matrix | `FR-F02-06` |
| Health monitoring targets | `enabled = true` | `FR-F16-02` |
| Admin inventory | all rows, enabled and disabled | `FR-F11-01` |
| Source badges and labels | `displayName`, `iconToken` | `FR-F05-07` |
| Work-item type rendering | `workItemTypes[].contentProfile` | `FR-F06-02` |
| Available actions | `supportedActions` ∩ role matrix ∩ spoke state | `FR-F02-05` |
| Timeout/retry/circuit policy | per-row settings | `FR-F08a-05` |
| Related-item resolution targets | `RelatedRef.targetSystem` looked up in registry | `FR-F06-05` |
| Orchestration legs | `workflow definition → applicationId` | `FR-F07b-07` |
| Error message system names | `displayName` | `Y2` |

**Rules:**
1. A CI check greps the hub source for the literal strings `EAPP`, `IEP`, `PVQ`, `PDT`, `IM` outside of seed data, tests, and adapter implementation packages. Any occurrence in hub core fails the build. This is the mechanical enforcement of R-07.
2. A `RelatedRef` naming an application absent from the registry is dropped with `INTEGRATION_UNKNOWN_TARGET` and never rendered (`FR-F06-05`).
3. Removing a registry row removes the application from every surface listed above with no code change and no error (PRD F8 acceptance signal).

**Acceptance criteria:**
- AC-1: The grep check passes.
- AC-2: De-registering an application cleanly removes it from navigation, queue, search, health, and console.

---

### FR-F08b-03 — Runtime enable/disable

**Description:** Turning an application off at runtime, without a redeploy or restart.

**Inputs:** `PATCH /api/admin/applications/{applicationId}` with `{ enabled: boolean, reason: string (required, 10–500 chars) }`.

**Processing / business rules:**
1. Administrator-only, authorized and audited (`ADMIN.APP.DISABLE`).
2. Disabling: the application is excluded from fan-out, search, navigation, and health probing immediately on the next request. In-flight calls complete; no new calls are issued.
3. `registryVersion` is incremented. Clients polling `GET /api/registry-version` (every 30 s, and on every navigation) detect the change and re-fetch entitlements, updating navigation without a reload.
4. Existing deep links to a disabled application's items return 409 `APPLICATION_DISABLED` with a specific message — not a 404 and not a silent redirect, because the user deserves to know the system was turned off rather than that their item vanished.
5. Re-enabling restores everything and triggers an immediate health probe rather than waiting for the next interval.
6. Disabling writes an audit record with the supplied reason in `afterSummary`.
7. Disabling an application that is a leg in an active orchestration definition produces a warning at the confirmation step: "{n} cross-system workflows use this application and will stop working while it's off." The administrator may proceed; the warning is recorded.

**Validation rules:** `reason` required — a state change with operational impact is not permitted without a recorded justification.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Missing reason | 400 | `VALIDATION_FAILED` | "Enter a reason for this change." |
| Application not found | 404 | `APPLICATION_NOT_FOUND` | "We couldn't find that application. It may have been removed." |
| Access to a disabled app's item | 409 | `APPLICATION_DISABLED` | "{System} is turned off in this environment. Contact your administrator if you need access." |

**Acceptance criteria:**
- AC-1: Disabling an application removes its nav item and queue rows within one poll interval, with no restart (NFR-11).
- AC-2: Re-enabling restores them and health turns `HEALTHY` within one probe.
- AC-3: Both transitions are audited with the reason.

---

### FR-F08b-04 — Role visibility and per-application access scoping

**Description:** Which roles can see an application at all — a coarse gate layered above the per-resource policy.

**Processing / business rules:**
1. `visibleToRoles` is a registry field set at registration and editable afterwards.
2. It is a **restriction**, never a grant: a role listed in `visibleToRoles` still requires the matching role-matrix permission and must pass attribute and ownership gates. Registering an application visible to `APPLICANT` does not grant applicants anything they could not otherwise access.
3. A role not listed never sees the application in navigation, queue, search, or related-item resolution. An attempted access returns `AUTHZ_DENIED`, indistinguishable from any other denial.
4. Changing `visibleToRoles` bumps `registryVersion` and is audited.
5. Default at registration: the roles the administrator selects, with none pre-checked — the form requires a deliberate choice rather than defaulting to broad visibility.

**Acceptance criteria:**
- AC-1: An application visible only to Investigator does not appear for Adjudicator in any surface.
- AC-2: Adding a role to `visibleToRoles` does not bypass the role matrix; access still requires the relevant permission.

---

### FR-F08b-05 — Adapter call logging feeding audit and integration issues

**Description:** Every adapter call is observable, and failures reach both the integration log and (where they accompany a user action) the audit chain.

**Processing / business rules:**
1. Every adapter call emits a structured log entry: `{ correlationId, requestId, applicationId, operation, principalId, outcome, latencyMs, errorClass?, attempt, circuitState }`.
2. Failures (`AdapterError` classes per `FR-F08a-06`, excluding `ADAPTER_NOT_FOUND` and `ADAPTER_REJECTED`) additionally insert an `integration_issues` row visible in the admin console (`FR-F11-03`).
3. Calls made during a mutating user action contribute to the audit chain through their shared correlation ID; the audit record references the adapter `requestId` so an administrator can move from audit to integration log and back.
4. Logs never contain the principal assertion, session cookie, one-time codes, or full request payloads of action forms; narrative text is recorded in the audit `afterSummary` (which is the appropriate place), not in adapter logs.
5. Latency is recorded on every call and feeds the health view's rolling latency figure.

**Acceptance criteria:**
- AC-1: A failed adapter call produces one integration issue correlated to the user's action.
- AC-2: An administrator can navigate audit → integration issue → application detail for the same correlation ID.
- AC-3: No secret or credential material appears in any log, verified by scan.

---

### FR-F08b-06 — Registry integrity and startup validation

**Description:** A malformed registry must fail loudly at startup rather than producing subtly broken behavior at demo time.

**Processing / business rules:**
1. At startup the hub validates every registry row: required fields, ID format, URL validity, bounds on all policy numbers, `adapterType` resolvable, `iconToken` in the token set, `visibleToRoles` non-empty and valid, every `requiredPermission` present in the role matrix.
2. A row failing validation is marked `INVALID`, excluded from all user-facing surfaces, and surfaced in the admin console with the specific field and reason. The hub still starts — one bad row must not prevent the demo — but the condition is loudly visible, not silent.
3. At startup, `describe()` and `healthCheck()` are called for every enabled row; results update `contractVersion`, cached capabilities, and initial health. Unreachable applications start in `DOWN` with an integration issue recorded, and the console says so.
4. `registryVersion` is recomputed at startup so clients refresh entitlements after a restart.

**Error handling:**

| Scenario | Behavior | Admin console copy |
|---|---|---|
| Row fails validation | Row `INVALID`, excluded | "This application's configuration has a problem: {field} — {reason}. It won't appear for users until it's fixed." |
| `describe()` unreachable at startup | Health `DOWN`, cached capabilities retained | "We couldn't reach {System} at startup. Users will see a degraded warning until it responds." |
| Contract version unsupported | Row `INCOMPATIBLE`, excluded | "This application uses an integration version we don't support yet (version {v})." |

**Acceptance criteria:**
- AC-1: A deliberately corrupted registry row produces a specific console message and does not break any user-facing screen.
- AC-2: The hub starts successfully with one spoke stopped, showing that spoke as `DOWN`.

---
## F9 — Five Simulated Spoke Services with Isolated Data Namespaces

**Traces to:** PRD F9 (P0); NFR-08, SM-13, R-05. **Schema:** `Y0b`. **API:** `Y1b`.

**Description:** eApp, IEP, PVQ, PDT, and Investigation Management implemented as five genuinely separate simulated services — separate processes, separate HTTP APIs, separate data namespaces — each with realistic domain behavior for the workflows in scope. The separation must be real and observable, because a reviewer who suspects a shared database has no reason to believe anything else in the demonstration.

**Terminology:**
- **Namespace** — one spoke's exclusive data store. No other service, including the hub, reads it directly.
- **Opaque reference** — a cross-system identifier a spoke stores but never resolves.
- **Spoke activity** — a spoke's own internal history, independent of the hub's audit log.

---

### FR-F09-01 — Service isolation (the deliverable)

**Description:** What "separate" means concretely, and how it is verified.

**Processing / business rules:**
1. Each spoke runs as its **own process**, listening on its own port, startable and stoppable independently (`FR-F18-02`).
2. Each spoke owns **its own database/schema namespace** with its own credentials. The demo provisions six namespaces: `hub`, `eapp`, `iep`, `pvq`, `pdt`, `im` (plus `cvs` for the demo sixth application). Each service's credentials grant access to exactly one namespace — isolation enforced by grants, not by convention.
3. **No shared tables.** No table is readable by more than one service. There is no "common" or "shared" schema. Where two systems refer to the same real-world thing (a subject), each holds its own row keyed by the same opaque `subjectRef` string, with no foreign key between them.
4. **No cross-service database access and no cross-service HTTP calls between spokes.** A spoke's only inbound caller is the hub, via its adapter. A spoke makes no outbound calls at all.
5. All cross-system relationships are opaque references resolved exclusively by the hub (`FR-F07a-01`).
6. Verification: (a) an architecture test asserts each service's connection string targets only its own namespace; (b) a runtime test asserts each service's credentials cannot read another namespace; (c) a network test asserts no spoke-to-spoke traffic; (d) during the demo, each spoke's API is queried directly to show independent state (SM-03, SM-13).

**Error handling:** An attempted cross-namespace read fails at the database permission layer, is logged, and surfaces as `ADAPTER_INTERNAL` — it cannot silently succeed.

**Acceptance criteria:**
- AC-1: Stopping any single spoke leaves the hub and the remaining four fully functional with a visible degraded warning (PRD F9 acceptance signal, SM-15).
- AC-2: Each spoke's credentials are proven unable to read any other namespace.
- AC-3: Zero shared tables exist, verified by schema inspection.

---

### FR-F09-02 — eApp (Electronic Application)

**Description:** Synthetic SF-86-style security questionnaire submissions: sections, answers, case records, submission status, and case state transitions.

**Entities:** `subjects`, `cases`, `questionnaire_sections`, `answers`, `case_activity`, `case_assignments`. Full DDL in `Y0b §eApp`.

**Domain behavior:**
1. A case has `caseState ∈ { DRAFT, SUBMITTED, UNDER_REVIEW, INFORMATION_REQUESTED, REVIEW_COMPLETE_PENDING_ADJUDICATION, ADJUDICATED, CLOSED }` with a defined transition table; illegal transitions are rejected with `ADAPTER_REJECTED` and a plain reason.
2. A case carries `outstandingIssueCount` and `outstandingIssueRefs` (opaque PVQ identifiers). eApp never queries PVQ and never interprets the reference beyond string equality.
3. Questionnaire sections are addressable by a stable locus (`SECTION_13A`), and answers by a path within it — this is what a PVQ issue points at.
4. Actions exposed: `ACKNOWLEDGE_ASSIGNMENT`, `REQUEST_CLARIFICATION`, `RECORD_FINDING`, `ADJUDICATE_CASE`, `RETURN_FOR_CLARIFICATION`, `SUBMIT_APPLICANT_RESPONSE`, `CLEAR_OUTSTANDING_ISSUE`.
5. `CLEAR_OUTSTANDING_ISSUE(issueRef)` is **idempotent**: if `issueRef` is not in `outstandingIssueRefs`, it returns success with no change. This is what makes the flagship retry safe (`FR-F07b-03`).
6. When `outstandingIssueCount` reaches 0 from a non-zero value, `caseState` moves `UNDER_REVIEW → REVIEW_COMPLETE_PENDING_ADJUDICATION` and one `case_activity` row is written.
7. Work-item type emitted: `EAPP_CASE_REVIEW`. Relationship types emitted: `HAS_ISSUE`, `HAS_DESIGNATION`, `ASSIGNED_CASE`.

**Scope enforcement:** `mode: SUBJECT` → cases with matching `subjectRef`; `ASSIGNEE_OR_UNIT` → cases assigned to the principal or matching org+region; `ORG` → cases in the organization.

**Acceptance criteria:**
- AC-1: Clearing an already-cleared issue reference returns success without double-decrementing.
- AC-2: An illegal state transition is rejected with a readable reason.
- AC-3: A scoped query for subject A never returns subject B's case.

---

### FR-F09-03 — PVQ (Personnel Vetting Questionnaire)

**Description:** Forms plus issue items raised against specific questionnaire answers, with disposition, resolution narrative, and resolution state — the second half of the flagship workflow.

**Entities:** `questionnaires`, `questionnaire_responses`, `issues`, `issue_activity`. Full DDL in `Y0b §PVQ`.

**Domain behavior:**
1. `issues.status ∈ { OPEN, IN_REVIEW, RESOLVED_SUBSTANTIATED, RESOLVED_UNSUBSTANTIATED, RESOLVED_WITH_CLARIFICATION, REFERRED }`.
2. Each issue carries the relationship fields specified in `FR-F07a-01`: `parentSystem`, `parentCaseRef`, `answerLocus`, `answerSectionLabel`, `answerSnapshot`, `subjectRef`.
3. `RESOLVE_ISSUE(disposition, narrative)` is permitted only from `OPEN` or `IN_REVIEW`. From a resolved state it returns `ADAPTER_REJECTED` with "This issue has already been resolved."
4. Resolution records `resolvedBy`, `resolvedByPrincipalId`, `resolvedAt`, `disposition`, `resolutionNarrative`, and writes one `issue_activity` row.
5. `RESOLVE_ISSUE` is **idempotent on `X-UAL-Idempotency-Key`**: a repeat returns the original outcome without re-writing.
6. Actions exposed: `RESOLVE_ISSUE`, `REQUEST_CLARIFICATION`, `ASSIGN_ISSUE`, `START_REVIEW`.
7. Work-item type emitted: `PVQ_ISSUE`. Relationship type emitted: `ISSUE_AGAINST`.
8. PVQ never calls eApp. It stores `parentCaseRef` as a string and nothing more.

**Acceptance criteria:**
- AC-1: Resolving an already-resolved issue is rejected with the specified plain message.
- AC-2: Idempotent repeat produces one state change and one activity row.
- AC-3: The seeded flagship issue `ISS-2207` references `CASE-A-1042` and `SECTION_13A`.

---

### FR-F09-04 — IEP (Individual Engagement Portal)

**Description:** Individual-facing status records, notices, and outstanding tasks for applicant personas.

**Entities:** `individuals`, `status_records`, `notices`, `tasks`, `iep_activity`. Full DDL in `Y0b §IEP`.

**Domain behavior:**
1. A status record maps a `subjectRef` to a plain-language stage: `SUBMITTED`, `UNDER_REVIEW`, `INFORMATION_REQUESTED`, `COMPLETE`, each with a user-readable explanation string stored in IEP (so the copy is data, not code).
2. Notices have `title`, `body`, `issuedAt`, `readAt`, `severity`. `ACKNOWLEDGE_NOTICE` sets `readAt`.
3. Tasks have `title`, `description`, `dueDate`, `status ∈ { OPEN, COMPLETE }`, and an optional `responseSchema` driving the completion form. `COMPLETE_TASK` validates against it.
4. IEP is the only spoke whose primary audience is `APPLICANT`; its `visibleToRoles` is `[APPLICANT]`.
5. Work-item types emitted: `IEP_TASK`, `IEP_NOTICE`.
6. IEP holds a `subjectRef` matching eApp's for the same synthetic person, with no foreign key and no cross-query.

**Acceptance criteria:**
- AC-1: An applicant's tasks and notices are retrievable only under `mode: SUBJECT` matching their own `subjectRef`.
- AC-2: The zero-item applicant persona returns empty sets cleanly (`FR-F17-06`).

---

### FR-F09-05 — PDT (Position Designation Tool)

**Description:** Position sensitivity/risk designations, resulting investigation tier, and designation review work items.

**Entities:** `positions`, `designations`, `risk_factors`, `designation_activity`. Full DDL in `Y0b §PDT`.

**Domain behavior:**
1. A designation records `sensitivityLevel ∈ { NON_SENSITIVE, NONCRITICAL_SENSITIVE, CRITICAL_SENSITIVE, SPECIAL_SENSITIVE }` and `riskLevel ∈ { LOW, MODERATE, HIGH }`, producing `investigationTier ∈ { T1, T3, T5 }` by a stored, displayable rule table — the rule that produced the tier is shown on screen (`FR-F06-09`).
2. `designations.status ∈ { DRAFT, PENDING_REVIEW, APPROVED, RETURNED }`.
3. Actions exposed: `APPROVE_DESIGNATION`, `RETURN_DESIGNATION` (reason required, 10–1000 chars).
4. Work-item type emitted: `PDT_DESIGNATION`. Relationship type emitted: `DESIGNATION_FOR` (opaque reference to an eApp case).
5. PDT declares `priorityNative: false` — it has no native priority. This is deliberate: it exercises the normalization rule in `FR-F05-02` and the UI's "Priority not provided by {system}" affordance.

**Acceptance criteria:**
- AC-1: Approving a designation changes PDT's own state, verified through PDT's API.
- AC-2: PDT items appear in the queue with `ROUTINE` priority and the "not provided" note.

---

### FR-F09-06 — IM (Investigation Management)

**Description:** Case assignment, investigative leads, investigator workload, and case status.

**Entities:** `investigations`, `assignments`, `leads`, `investigator_workload`, `im_activity`. Full DDL in `Y0b §IM`.

**Domain behavior:**
1. `investigations.status ∈ { OPEN, IN_PROGRESS, PENDING_INFORMATION, COMPLETE, CLOSED }` with priority `ROUTINE | ELEVATED | URGENT` (native, so `priorityNative: true`).
2. Assignments bind an investigation to an investigator `principalId` with `assignedAt` and `dueDate`; workload is a derived count per investigator.
3. Leads are child records with `status`, `dueDate`, and notes; `ADD_LEAD_NOTE` appends.
4. Actions exposed: `ACCEPT_ASSIGNMENT`, `UPDATE_CASE_STATUS`, `ADD_LEAD_NOTE`, `REQUEST_EXTENSION`.
5. Work-item type emitted: `IM_CASE_ASSIGNMENT`. Relationship type emitted: `CASE_ASSIGNMENT_FOR`.
6. **IM is the designated outage-demonstration spoke.** Its seed data includes overdue items so that removing it visibly changes counts (`FR-F17-07`), which makes the degraded-state demonstration legible rather than abstract.

**Acceptance criteria:**
- AC-1: IM contributes overdue items to the investigator queue and dashboard.
- AC-2: Forcing IM down produces the specified degraded warning naming IM and quantifying the gap (SM-15).

---

### FR-F09-07 — Common spoke service requirements

**Description:** Behavior every spoke implements identically, so the adapter contract is honoured uniformly.

**Processing / business rules:**
1. **Principal verification.** Every request MUST carry a valid `X-UAL-Principal` assertion with `audience` equal to this service. Missing, malformed, wrong-audience, or expired → 401 `PRINCIPAL_REJECTED`. A request without an assertion is refused even from localhost (`FR-F01-02`).
2. **Scope application.** Every read MUST apply the supplied `scope` in its own query (`FR-F02-04` rule 2). Returning out-of-scope rows is a defect the hub detects and reports.
3. **Idempotency.** Every mutating endpoint MUST honour `X-UAL-Idempotency-Key`, storing `{ key, requestHash, response, createdAt }` for 24 hours and replaying the stored response for a repeat. A repeat with the same key but a different payload returns 409 `IDEMPOTENCY_KEY_REUSED`.
4. **State versioning.** Every entity exposes a `stateVersion` that changes on any user-visible field change.
5. **Own activity log.** Every mutation writes a row to that service's own activity table, independent of the hub's audit log. The two are deliberately separate: the spoke's log is what the spoke knows, the hub's audit is what the platform knows, and the demo shows both (`FR-F06-06`).
6. **Health endpoint.** `GET /health` returns `{ status, latencyMs, version, checkedAt }` and never requires an assertion (so the monitor can probe a spoke whose auth path is broken).
7. **Failure injection.** Every spoke exposes an admin-only control surface (`FR-F16-11`) to force `UNAVAILABLE`, `SLOW(ms)`, `ERROR(rate)`, and `NORMAL`. Injected state affects data endpoints and is reflected honestly by `/health`.
8. **Correlation echo.** Every response echoes `X-UAL-Correlation-Id`.
9. **Error shape.** Spoke errors use `{ code, message, detail }` where `message` is plain language safe to surface for business rejections only (`FR-F08a-06` rule 2).
10. **Synthetic markers.** Every record carries `syntheticMarker: "DEMO-SYNTHETIC"` and every API response includes a top-level `"_synthetic": true` (`FR-F17-08`).

**Error handling:**

| Scenario | HTTP (spoke) | Code | Adapter maps to |
|---|---|---|---|
| Missing/invalid assertion | 401 | `PRINCIPAL_REJECTED` | `ADAPTER_PRINCIPAL_REJECTED` |
| Scope absent | 400 | `SCOPE_REQUIRED` | `ADAPTER_CONTRACT_ERROR` |
| Unknown entity | 404 | `NOT_FOUND` | `ADAPTER_NOT_FOUND` |
| Business rejection | 422 | `ACTION_REJECTED` | `ADAPTER_REJECTED` |
| Idempotency key reuse with different payload | 409 | `IDEMPOTENCY_KEY_REUSED` | `ADAPTER_REJECTED` |
| Injected unavailability | 503 | `SERVICE_UNAVAILABLE` | `ADAPTER_UNREACHABLE` |

**Acceptance criteria:**
- AC-1: All six services pass the shared conformance suite (`FR-F08a-08`).
- AC-2: A direct browser call to any spoke port is refused for lack of an assertion.
- AC-3: Every spoke response carries the synthetic marker.

---

### FR-F09-08 — Independent queryability (the proof surface)

**Description:** The demo must be able to prove dual-system change by querying each system directly, outside the hub.

**Processing / business rules:**
1. Each spoke's API is documented (`Y1b`) and callable with a demo-operator assertion token issued by `FR-F18-06` for demonstration purposes — a short-lived, administrator-generated assertion that lets a reviewer run `curl` against a spoke.
2. The demo script includes the exact commands for reading `PVQ:ISS-2207` and `EAPP:CASE-A-1042` before and after the flagship workflow (`FR-F18-05`).
3. Responses are JSON, human-readable, and include the fields the demo script asserts on (`FR-F07b-05`).
4. The operator token is itself audited on issuance and expires in 15 minutes.

**Acceptance criteria:**
- AC-1: A reviewer can query both spokes directly and observe the post-workflow state (SM-03).
- AC-2: Issuing an operator token writes an audit record.

---
## F10 — Unified Layer API (Backend-for-Frontend)

**Traces to:** PRD F10 (P0); NFR-04, NFR-06, NFR-15, SM-18, SM-19. **Full endpoint catalog:** `Y1a-api-hub-bff.md`.

**Description:** The hub's own HTTP API — the single server-side surface the web UI consumes and the only place authorization and audit are enforced. It is a product surface in its own right: it is what a future client or an evaluator's `curl` command talks to, and it is where the zero-trust claims are testable. This chunk specifies the API's cross-cutting behavior; `Y1a` specifies every endpoint's method, path, auth requirement, request schema, response schema, and error codes.

**Terminology:**
- **BFF** — backend-for-frontend: endpoints shaped for the UI's screens rather than mirroring spoke APIs.
- **Choke point** — the single middleware chain every request passes through.
- **Mutating endpoint** — any endpoint using POST, PATCH, PUT, or DELETE semantics that changes state.

---

### FR-F10-01 — Request pipeline (the choke point)

**Description:** The ordered middleware every request traverses. No endpoint may bypass or reorder it.

**Processing / business rules — in order:**
1. **Correlation.** Assign or adopt `correlationId`; generate `requestId` (`FR-F01-06`).
2. **Security headers.** Set `Cache-Control: no-store` on authenticated responses, plus CSP (`default-src 'self'`), `X-Content-Type-Options: nosniff`, and `Referrer-Policy: same-origin`. **No frame-blocking header is emitted:** neither the hub nor the UI sets `X-Frame-Options`, and the CSP contains **no** `frame-ancestors` directive. *(Amended per TechArch **ADR-012**, which supersedes the original `X-Frame-Options: DENY` clause. The prototype is presented through an embedded preview iframe; a frame-blocking header renders that preview blank — visually indistinguishable from a crashed build, and exactly the failure mode `NFR-09` exists to prevent. **Production delta:** restore `frame-ancestors 'self'` when the application is not presented through an embedding harness.)*
3. **Session resolution.** Resolve the principal from the session store (`FR-F01-01`). Reject unauthenticated access to protected routes with 401.
4. **CSRF.** Verify the CSRF token on mutating requests.
5. **Reserved-field rejection.** Reject any request carrying `role`, `roles`, `activeRole`, `principalId`, `entitlements`, or `scope` in body or query (`FR-F02-01`).
6. **Input validation.** Validate against the endpoint's declared schema; unknown fields are rejected, not ignored.
7. **Authorization.** Invoke the PDP (`FR-F02-01`). Deny → 403 plus a denial audit record.
8. **Handler.** Execute, calling adapters through the scoped wrapper only (`FR-F02-04`).
9. **Audit (mutating only).** Write the audit record **before** composing the success response (`FR-F13-01`). Failure to audit fails the request.
10. **Response.** Attach `X-Correlation-Id`, `X-UAL-Session-Expires`, and the standard envelope for errors.
11. **Access log.** Emit a structured log line with outcome and latency; never log request bodies of action forms or authentication payloads.

**Validation rules:** A registered route without a declared `action` string, request schema, and response schema fails the startup check — the API's own contract is validated at boot rather than discovered at demo time.

**Error handling:** Any uncaught handler exception is converted to 500 `INTERNAL_ERROR` with the standard envelope and a correlation ID; the stack is logged server-side only.

**Acceptance criteria:**
- AC-1: A route-enumeration test confirms every endpoint traverses steps 1–11.
- AC-2: No endpoint returns a body outside the documented response or error envelope.
- AC-3: Reserved fields are rejected on every endpoint.

---

### FR-F10-02 — Endpoint groups and their screens

**Description:** The API's functional surface, with each group named against the screens it serves. Full specifications in `Y1a`.

| Group | Endpoints | Serves |
|---|---|---|
| Auth | `GET /api/auth/methods`, `POST /api/auth/initiate`, `POST /api/auth/complete`, `POST /api/auth/logout` | SCR-01–05, SCR-07 |
| Session | `GET /api/session`, `POST /api/session/extend`, `POST /api/session/active-role` | SCR-06, SCR-08 header |
| Entitlements | `GET /api/entitlements`, `GET /api/registry-version` | SCR-08 navigation |
| Dashboard | `GET /api/dashboard` | SCR-09–12 |
| Work queue | `GET /api/work-items`, `GET /api/search` | SCR-13, SCR-35 |
| Work item | `GET /api/work-items/{id}`, `GET /api/work-items/{id}/actions`, `POST /api/work-items/{id}/actions/{actionId}`, `GET /api/work-items/{id}/activity`, `GET /api/work-items/{id}/related` | SCR-14–19 |
| Orchestration | `POST /api/orchestration/resolve-pvq-issue`, `GET /api/orchestration/{txId}`, `POST /api/orchestration/{txId}/retry` | SCR-16, SCR-20 |
| Notifications | `GET /api/notifications`, `POST /api/notifications/{id}/read`, `POST /api/announcements/{id}/dismiss` | SCR-21, dashboards |
| Health | `GET /api/health/summary` | SCR-13 degraded polling, SCR-24 |
| Admin — applications | `GET/POST /api/admin/applications`, `GET/PATCH/DELETE /api/admin/applications/{id}`, `POST /api/admin/applications/test-connection`, `POST /api/admin/applications/{id}/probe` | SCR-22, SCR-23, SCR-28 |
| Admin — operations | `GET /api/admin/health`, `GET /api/admin/integration-issues`, `GET /api/admin/users`, `GET /api/admin/users/{id}`, `GET /api/admin/status`, `POST /api/admin/failure-injection` | SCR-24–27, SCR-37, SCR-38 |
| Admin — announcements | `GET/POST /api/admin/announcements`, `PATCH/DELETE /api/admin/announcements/{id}` | SCR-29 |
| Audit | `GET /api/audit`, `GET /api/audit/{id}`, `GET /api/audit/chain/{correlationId}`, `GET /api/audit/export` | SCR-33, SCR-34 |

**Rules:**
1. Every endpoint is consumed by at least one screen, or is explicitly documented as a verification surface (`/api/admin/status`). There are no orphan endpoints.
2. Every screen's data requirements are satisfiable by the listed endpoints. There is no screen without an endpoint (the inverse of "no dead routes").

**Acceptance criteria:**
- AC-1: Screen-to-endpoint mapping is complete in both directions.
- AC-2: Every endpoint is exercised by at least one automated test, including one unauthorized-access negative case each (PRD F10 acceptance signal).

---

### FR-F10-03 — Consistent error contract

**Description:** One error shape, machine-readable and human-readable, with no information disclosure.

**Processing / business rules:**
1. All non-2xx responses use the §3.6 envelope.
2. `code` is from the closed catalog in `Y2`; new codes require a catalog entry with user-facing copy. An undocumented code cannot be emitted — a startup check validates emitted codes against the catalog.
3. `message` is the exact user-facing copy from `Y2`, written in plain language, actionable, containing no jargon, no stack trace, no internal identifier.
4. `fieldErrors[]` carries `{ fieldId, message }` for validation failures, driving the error summary and inline messages (`FR-F14-03`).
5. Denials never disclose existence (`FR-F02-07`).
6. `retryable` and `retryAfterSeconds` tell the client whether to offer a retry control, so retry affordances are server-driven rather than guessed.
7. HTTP status usage: 400 validation, 401 session, 403 authorization, 404 only for genuinely public-safe missing routes (not resources), 409 state conflicts, 422 upstream business rejection, 207 partial orchestration, 429 rate/attempt limits, 500 internal, 502 upstream contract/indeterminate, 503 upstream unavailable, 504 orchestration timeout.

**Acceptance criteria:**
- AC-1: Every error path returns the envelope; a schema test asserts it across all endpoints.
- AC-2: Zero user-facing messages contain prohibited content, verified by scan.

---

### FR-F10-04 — Pagination, filtering, and sorting conventions

**Description:** Uniform list semantics so every list screen behaves the same way.

**Processing / business rules:**
1. Query parameters: `page` (≥1, default 1), `pageSize` (10|25|50|100, default 25), `sort` (field name), `dir` (`asc`|`desc`), plus endpoint-specific filters.
2. Response envelope for lists: `{ items[], page, pageSize, totalCount, totalPages, hasNext, truncated, sourceStatus?[], correlationId }`.
3. `totalCount` reflects only retrieved data; when `truncated` or any `sourceStatus` is non-OK, the UI must qualify the count (`FR-F05-04`).
4. Invalid `sort`/`dir` normalize to defaults rather than erroring; invalid filter values error with a field message.
5. Filters are always applied server-side after authorization; a filter never widens scope.

**Acceptance criteria:**
- AC-1: All list endpoints share the envelope and parameter names.
- AC-2: No list endpoint returns unfiltered data for the client to filter.

---

### FR-F10-05 — Mandatory audit on mutation

**Description:** The API-level expression of the audit guarantee.

**Processing / business rules:**
1. Every mutating endpoint writes exactly one primary audit record per successful invocation (orchestrations write one per leg plus start/complete records, per `FR-F07b-06`).
2. The write happens **before** the success response is composed. If it fails, the endpoint returns `AUDIT_WRITE_FAILED` and the operation is reported as not completed (`FR-F13-01`).
3. A registry of mutating endpoints and their expected audit action types is maintained and asserted by test: invoking each mutating endpoint produces exactly one record of the expected type (SM-19).
4. Read endpoints write audit records only where specified: work-item views, related-item resolution, audit views, and identity views. Routine list reads are not audited, to keep the trail legible — but every one of those exceptions is enumerated here rather than left to implementer discretion.

**Acceptance criteria:**
- AC-1: 100% of mutating endpoints produce exactly one audit record per success (SM-19).
- AC-2: A simulated audit-store failure causes the mutation to be reported as failed.

---

### FR-F10-06 — API documentation as a deliverable

**Description:** Published, accurate API documentation reviewers can read and exercise.

**Processing / business rules:**
1. An OpenAPI-style document is generated from the implementation's route declarations, request/response schemas, and error catalog — not hand-maintained, so it cannot drift.
2. It is served at `/api/docs` (Administrator-authorized) and written to a file at build time for inclusion in the repository.
3. Each endpoint documents: method, path, summary, required role/permission, request schema, response schema, all possible error codes with their user-facing copy, and whether it writes audit.
4. A CI check fails if a route exists without documentation or documents a schema that does not match the implementation.

**Acceptance criteria:**
- AC-1: Generated documentation covers 100% of routes.
- AC-2: A reviewer can exercise the documented flagship endpoint from the documentation alone.

---

### FR-F10-07 — Rate limiting and abuse resistance (demo-grade)

**Description:** Bounded protection appropriate to a prototype, specified so behavior is predictable rather than absent.

**Processing / business rules:**
1. Authentication endpoints: 20 attempts per IP per 5 minutes, plus the per-transaction attempt cap (`FR-F00-04`).
2. Mutating endpoints: 60 requests per session per minute.
3. Read endpoints: 600 requests per session per minute.
4. Exceeding a limit returns 429 `RATE_LIMITED` with `retryAfterSeconds`, and the UI shows: "You're making requests faster than we can handle. Wait {n} seconds and try again."
5. Limits are configuration values and are set generously enough that no legitimate demo action can trip them.

**Acceptance criteria:**
- AC-1: Limits never trigger during the scripted demo paths.
- AC-2: Exceeding a limit returns the envelope with a retry hint, never a blank or default framework error page.

---
## F11 — Administrator Console: Connected Applications, Health, and Integration Issues

**Traces to:** PRD F11 (P1). **Screens:** SCR-22 connected applications, SCR-23 application detail, SCR-24 system health, SCR-25 integration issues, SCR-26/27 identities, SCR-29 announcements. **API:** `Y1a §Admin`.

**Description:** The administrator's operational view of the unified layer: what is connected, whether it is working, and what has gone wrong. This is the feature that demonstrates the platform is operable, not merely usable. Every console screen is a real, populated screen with designed empty, loading, error, and degraded states, and every console action is itself authorized and audited — administrators are not exempt.

**Terminology:**
- **Inventory** — the registry rendered for humans.
- **Integration issue** — a recorded adapter or orchestration failure (`Y0a.integration_issues`).
- **Probe** — an on-demand health check initiated by an administrator.

---

### FR-F11-01 — Connected applications inventory (SCR-22)

**Description:** Every registered application, read directly from the registry.

**Inputs:** `GET /api/admin/applications` with `page`, `pageSize`, `sort`, `dir`, `q`, `status` (`enabled|disabled|invalid|incompatible`).

**Processing / business rules:**
1. Accessible only with `ADMIN.APP.LIST`; the whole console is behind the Administrator role gate plus per-endpoint authorization.
2. Table columns: Display name, Application ID, Adapter type, Endpoint, Work-item types (count, expandable), Supported actions (count), Visible to roles, Health (text + icon), Enabled state, Registered date. `<caption>`: "Connected applications — {n} registered".
3. Sortable on display name, application ID, health, enabled state, registered date. Filterable by status and searchable by name or ID.
4. Health is read from stored monitor results (`FR-F16-02`), with the last-check timestamp shown so staleness is visible.
5. Disabled and invalid applications are listed with their state clearly marked — they are never hidden, because an administrator troubleshooting an absence needs to see the row.
6. Primary action: "Register an application" → SCR-28. Row action: "View details" → SCR-23.
7. The list refreshes health every 30 seconds via `GET /api/health/summary` and announces changes politely ("Investigation Management is now unavailable.").

**Outputs:** SCR-22 populated from the registry.

**Validation rules:** Standard list conventions (`FR-F10-04`).

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Not an administrator | 403 | `AUTHZ_DENIED` | "You don't have access to this page." |
| Registry unreadable | 503 | `REGISTRY_UNAVAILABLE` | "We can't load the application list right now. Try again in a moment — reference {correlationId}." |
| No applications registered | 200 | — | "No applications are registered yet. Register your first application to get started." with the register action. |
| No search matches | 200 | — | "No applications match '{q}'." with a clear-search control. |

**Acceptance criteria:**
- AC-1: All five spokes appear with correct configuration read from the registry.
- AC-2: The newly registered sixth application appears immediately after registration without a restart (SM-12).
- AC-3: Table passes the accessibility scan.

---

### FR-F11-02 — System health view (SCR-24)

**Description:** Per-application health, latency, and check history.

**Inputs:** `GET /api/admin/health?applicationId=&since=`.

**Processing / business rules:**
1. Summary region: counts of healthy / degraded / unavailable, each as text plus icon.
2. Table per application: current status, last successful check, last check attempt, current latency, rolling p50/p95 latency over the last hour, consecutive failure count, circuit state (`CLOSED | OPEN | HALF_OPEN`), next scheduled probe.
3. Check history: the last 50 checks per application with timestamp, status, latency, and error class where applicable, available as an expandable region and as a table on SCR-23.
4. Health states are defined precisely (`FR-F16-03`) and displayed with their definitions available via a "What do these states mean?" disclosure — so a reviewer is not guessing what "degraded" means.
5. Manual "Check now" per row triggers `POST /api/admin/applications/{id}/probe` (`FR-F11-05`).
6. Status is never conveyed by color alone; each state has a distinct icon and text label.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| No health data yet | 200 | — | "No health checks have run yet. The first check runs within {n} seconds." |
| Monitor not running | 200 | — | Warning alert: "Health monitoring isn't running. Statuses below may be out of date." |

**Acceptance criteria:**
- AC-1: Stopping a spoke moves it to `DOWN` within one probe interval and shows the circuit opening.
- AC-2: Restarting it returns `HEALTHY` and closes the circuit automatically (SM-17).

---

### FR-F11-03 — Integration issues log (SCR-25)

**Description:** The chronological, filterable record of adapter and orchestration failures.

**Inputs:** `GET /api/admin/integration-issues` with `applicationId`, `errorClass`, `operation`, `principalId`, `from`, `to`, `q`, plus list conventions.

**Processing / business rules:**
1. Columns: Timestamp (UTC), Application, Operation, Error class, Affected user (where applicable), Correlation ID, Attempt, Circuit state at time of failure.
2. Every row links to: the correlated audit chain (SCR-34) and the application detail (SCR-23). An administrator can move from symptom to context in one click.
3. Rows capture the technical detail suppressed from user-facing messages (`FR-F08a-06` rule 3): spoke HTTP status, response excerpt (truncated to 1000 chars, escaped), and the adapter `requestId`. This is the appropriate place for that detail, and the only place it appears.
4. Default filter: last 24 hours, newest first. A prominent count shows "{n} issues in the last 24 hours."
5. Issues are append-only; there is no resolve/dismiss workflow in this prototype, and the absence is deliberate — the log is evidence, not a ticket queue.
6. `ORCHESTRATION_INCOMPLETE` issues (`FR-F07b-03`) additionally link to the orchestration transaction with its manual retry action.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| No issues in range | 200 | — | "No integration issues in this period. That's good news." |
| Export failure | 500 | `INTERNAL_ERROR` | "We couldn't build that export. Try again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Inducing an adapter failure produces a new, correctly attributed entry within one health-check interval (PRD F11 acceptance signal).
- AC-2: Each entry links to a real audit chain sharing its correlation ID.
- AC-3: An `ORCHESTRATION_INCOMPLETE` entry offers a working retry.

---

### FR-F11-04 — Application detail view (SCR-23)

**Description:** Everything about one application in one place.

**Inputs:** `GET /api/admin/applications/{applicationId}`.

**Processing / business rules:**
1. Sections: Configuration (all registry fields, with `applicationId` marked immutable); Capabilities (from cached `describe()`, with `lastDescribeAt`); Work-item types and status maps (as a table, so mapping is inspectable); Supported actions with required permissions; Resilience policy (timeouts, retries, circuit settings); Health history; Recent integration issues (last 20); Provenance (registered by/at, updated by/at).
2. Actions: "Test connection" (`FR-F11-05`), "Edit configuration" (→ SCR-28 in edit mode), "Disable"/"Enable" (`FR-F08b-03`), "De-register" (`FR-F12-07`).
3. Destructive actions require a typed confirmation of the application's display name plus a reason, and state their consequences explicitly: "This removes {name} from navigation, the work queue, and health monitoring for all users. {n} work items will stop appearing."
4. The configuration section renders secrets-free; the registry holds no credentials in this prototype, and the screen says so: "This prototype uses no credentials for spoke connections."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Application not found | 404 | `APPLICATION_NOT_FOUND` | "We couldn't find that application. It may have been removed." |
| Invalid configuration row | 200 | — | Warning: "This application's configuration has a problem: {field} — {reason}. It won't appear for users until it's fixed." |

**Acceptance criteria:**
- AC-1: Every registry field is visible and accurate on this screen.
- AC-2: Destructive actions require typed confirmation and a reason.

---

### FR-F11-05 — Manual connection test

**Description:** An on-demand live probe an administrator can run in front of a reviewer.

**Inputs:** `POST /api/admin/applications/{applicationId}/probe`.

**Processing / business rules:**
1. Calls `healthCheck()` and `describe()` live, bypassing cached results and bypassing the circuit breaker (this is an explicit operator action, and blocking it would defeat its purpose).
2. Returns `{ health: {...}, describe: {...} | null, contractVersionSupported: boolean, capabilityChanges: [...], durationMs }`.
3. `capabilityChanges` diffs the live `describe()` against the cached one and lists additions and removals, so drift is visible: "This application now reports 1 new action: REQUEST_EXTENSION."
4. On success, cached capabilities and health are updated, and `registryVersion` is bumped if capabilities changed.
5. The action is audited (`APPLICATION_PROBED`) with the outcome.
6. Results render inline with a live-region announcement: "Connection test complete. {System} is healthy, responded in {n} milliseconds."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Unreachable | 200 | — | "We couldn't reach {name} at {endpoint}. Check that the application is running and the address is correct." |
| Contract unsupported | 200 | — | "{name} uses an integration version we don't support yet (version {v}). Supported versions: {list}." |
| Health degraded | 200 | — | "{name} responded, but slowly ({n} ms). Users may see delays." |

**Acceptance criteria:**
- AC-1: Testing a stopped spoke returns the unreachable message with the endpoint named.
- AC-2: Testing a running spoke updates cached capabilities and reports any drift.

---

### FR-F11-06 — System announcements management (SCR-29)

**Description:** Administrator-authored notices surfaced on user dashboards.

**Inputs:** `POST /api/admin/announcements`, `PATCH /api/admin/announcements/{id}`, `DELETE` (expire).

**Processing / business rules:**
1. Fields: `title` (5–120 chars), `body` (10–2000 chars, plain text only — no HTML, and input is escaped on render), `severity` (`INFO | WARNING | EMERGENCY`), `targetRoles` (≥1), `effectiveFrom`, `expiresAt`, `dismissible` (boolean, default true).
2. List shows active, scheduled, and expired announcements with counts, filterable by state and severity.
3. Editing an active announcement resets per-user dismissals only when `severity` or `body` changes materially; the form warns: "Changing the message will show it again to people who dismissed it."
4. Expire is a soft action setting `expiresAt = now`; announcements are never hard-deleted, so the audit trail stays meaningful.
5. All create/edit/expire actions are audited with before/after summaries.
6. `EMERGENCY` announcements are non-dismissible regardless of the `dismissible` flag, and the form explains this. They still never obscure or replace the demo banner (`FR-F03-03`).

**Validation rules:**
- `effectiveFrom < expiresAt` → "Enter an end date and time that comes after the start."
- `targetRoles` non-empty → "Choose at least one role to show this to."
- `body` plain text; any markup is escaped, not stripped silently.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Validation failure | 400 | `VALIDATION_FAILED` | "There is a problem. Fix the following, then try again." + field copy. |
| Announcement not found | 404 | `ANNOUNCEMENT_NOT_FOUND` | "We couldn't find that announcement. It may have been removed." |

**Acceptance criteria:**
- AC-1: A created announcement appears on the targeted roles' dashboards within one poll and not on others'.
- AC-2: Dismissal persists per user and does not affect other users.
- AC-3: Every announcement action is audited.

---

### FR-F11-07 — Policy visibility and console-wide conventions

**Description:** The console shows the platform's policy, and behaves consistently.

**Processing / business rules:**
1. A read-only "Roles and permissions" view renders the role matrix (`FR-F02-02`) as an accessible table, so a reviewer can inspect the policy rather than infer it from behavior.
2. All console tables use the same sort, filter, and pagination patterns as the work queue (`FR-F05-04`), so patterns are learned once.
3. Every console screen provides an entry point to the audit viewer pre-filtered to its subject (application, identity, announcement).
4. **Every console action is authorized server-side and audited**, including reads of identity data (`FR-F02-08`). The console has no privileged bypass.
5. Console screens carry the demo banner and the same shell as user-facing screens — the administrator is inside the same product, not a separate tool.

**Acceptance criteria:**
- AC-1: The role matrix view matches the enforced policy, verified by comparing against `role_permissions`.
- AC-2: Every console mutation produces an audit record naming the administrator.
- AC-3: An Investigator attempting any console route is denied and audited.

---
## F12 — Application Registration and Onboarding Flow

**Traces to:** PRD F12 (P1 — the extensibility proof); NFR-11, SM-11, SM-12, R-07. **Screens:** SCR-28 (multi-step registration form), SCR-22/23. **API:** `Y1a §Admin — applications`.

**Description:** An in-app, UI-driven flow for registering an additional application into the unified layer, performed live during the demo as a configuration action — no code change, no redeploy, no restart. This is the feature that turns "extensible" from an assertion into an observable event.

**Terminology:**
- **Candidate application** — an application being registered, not yet in the registry.
- **Live connection test** — calling the candidate's health and `describe()` endpoints during registration, before submission is allowed.
- **Capability auto-discovery** — pre-populating work-item types and actions from the candidate's own `describe()`.
- **Demo sixth application** — "Continuous Vetting Service" (`CVS`), shipped running but unregistered.

---

### FR-F12-01 — Multi-step registration form (SCR-28)

**Description:** A guided USWDS form in five steps, each independently validated, with state preserved across steps.

**Steps and fields:**

| Step | Fields |
|---|---|
| 1. Identity | `displayName` (required), `applicationId` (required), `description` (optional), `iconToken` (required, chosen from a token picker) |
| 2. Connection | `baseEndpoint` (required), `healthEndpoint` (required), `adapterType` (required, select), `timeoutMs`, `actionTimeoutMs`, `healthTimeoutMs`, `maxRetries`, `backoffInitialMs`, `backoffMultiplier`, `circuitFailureThreshold`, `circuitOpenMs`, `healthProbeIntervalSec` (all pre-filled with defaults) |
| 3. Test connection | No inputs — runs the live test (`FR-F12-03`) and displays results. Cannot proceed until the test succeeds or the administrator explicitly acknowledges a warning-level result |
| 4. Capabilities | `workItemTypes[]` and `supportedActions[]`, pre-populated by auto-discovery (`FR-F12-04`), each confirmable and editable; status maps shown per type |
| 5. Access & review | `visibleToRoles[]` (required, none pre-selected), then a full read-only review of every value with an "Edit" link per step, and the submit action |

**Processing / business rules:**
1. Rendered with the USWDS step-indicator, `aria-current="step"` on the active step, and a text counter "Step 3 of 5."
2. Each step validates on "Continue"; failures render an error summary at the top with focus moved to it and in-page links to offending fields (`FR-F14-03`).
3. Form state is held server-side in a draft record keyed to the administrator's session, so a refresh or a session extension does not lose work. Drafts expire after 60 minutes.
4. Back navigation preserves entered values; the step indicator allows returning to any completed step.
5. Step 5's review screen is the only place submission is possible, and it restates the consequences: "{displayName} will become visible to {roles} and its work items will appear in their work queues immediately."
6. On submission the registry row is created, `registryVersion` bumps, health probing begins immediately, and the administrator lands on SCR-23 for the new application with a success alert.

**Outputs:** New registry row; application live across all surfaces.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Step validation failure | 400 | `VALIDATION_FAILED` | "There is a problem. Fix the following, then try again." + field copy (`FR-F12-02`). |
| Draft expired | 409 | `DRAFT_EXPIRED` | "Your registration draft expired. Start again — your entries weren't saved." |
| Submitted without a successful test | 400 | `CONNECTION_TEST_REQUIRED` | "Test the connection before you register this application." |

**Acceptance criteria:**
- AC-1: An administrator completes registration of CVS in under 5 minutes during a live demo (SM-11).
- AC-2: The form is completable using only the keyboard.
- AC-3: Each step's errors are announced and linked.

---

### FR-F12-02 — Field validation rules and messages

**Description:** Every field's rule and its exact error copy.

| Field | Rule | Error message |
|---|---|---|
| `displayName` | Required; 3–60 chars; unique among registered applications | "Enter a display name." / "Use between 3 and 60 characters." / "Another application already uses that name. Choose a different one." |
| `applicationId` | Required; `^[A-Z][A-Z0-9_]{1,15}$`; globally unique including de-registered IDs | "Enter an application ID." / "Use 2 to 16 characters: capital letters, numbers, and underscores, starting with a letter." / "That application ID is already in use. Choose a different one." |
| `description` | ≤500 chars | "Shorten this to 500 characters or fewer. You've used {m}." |
| `iconToken` | Required; must exist in the theme token set | "Choose an icon." / "That icon isn't available. Choose one from the list." |
| `baseEndpoint` | Required; valid absolute URL; `http`/`https`; no embedded credentials; no fragment; host resolvable | "Enter the application's base address." / "Enter a valid web address starting with http:// or https://." / "Remove the username and password from the address." / "We couldn't find a server at that address. Check it and try again." |
| `healthEndpoint` | Required; absolute URL or path relative to `baseEndpoint` | "Enter the application's health check address." / "Enter a valid address or a path starting with /." |
| `adapterType` | Required; must be a registered implementation | "Choose an adapter type." / "That adapter type isn't available." |
| `timeoutMs` | 500–30000 | "Enter a timeout between 500 and 30,000 milliseconds." |
| `actionTimeoutMs` | 1000–30000 | "Enter an action timeout between 1,000 and 30,000 milliseconds." |
| `healthTimeoutMs` | 500–10000 | "Enter a health check timeout between 500 and 10,000 milliseconds." |
| `maxRetries` | 0–5 | "Enter a number of retries between 0 and 5." |
| `backoffInitialMs` | 50–5000 | "Enter a starting backoff between 50 and 5,000 milliseconds." |
| `backoffMultiplier` | 1.0–4.0 | "Enter a backoff multiplier between 1.0 and 4.0." |
| `circuitFailureThreshold` | 2–50 | "Enter a failure threshold between 2 and 50." |
| `circuitOpenMs` | 5000–300000 | "Enter a circuit reset time between 5,000 and 300,000 milliseconds." |
| `healthProbeIntervalSec` | 10–600 | "Enter a check interval between 10 and 600 seconds." |
| `workItemTypes` | ≥0 permitted; each needs `type`, `label`, `contentProfile`, complete `statusMap` | "Give this work-item type a label." / "Map every status this application can report. Unmapped: {list}." |
| `supportedActions` | Each needs `actionId`, `label`, `appliesToTypes`, `requiredPermission` existing in the role matrix | "Choose which work-item types this action applies to." / "That permission doesn't exist in this system. Choose one from the list." |
| `visibleToRoles` | ≥1 role | "Choose at least one role that can see this application." |

**Additional rules:**
1. An application registering **zero** work-item types is permitted — it will appear in the admin inventory and health monitoring but contribute nothing to the queue. The review step states this plainly: "This application won't add any work items to users' queues."
2. `applicationId` uniqueness includes de-registered identifiers, because audit records and historical `workItemId`s reference them; reusing one would corrupt the trail.
3. Server-side validation is authoritative and repeats every client rule.

**Acceptance criteria:**
- AC-1: Every rule produces its exact message, verified by test.
- AC-2: A duplicate `applicationId` is caught with the specific message, not a generic failure.

---

### FR-F12-03 — Live connection test (step 3)

**Description:** The hub calls the candidate application before allowing registration, so a broken registration is caught in the form rather than discovered by users.

**Inputs:** `POST /api/admin/applications/test-connection` with `{ baseEndpoint, healthEndpoint, adapterType, healthTimeoutMs, timeoutMs }`.

**Processing / business rules:**
1. The hub instantiates a transient adapter of `adapterType` and calls `healthCheck()` then `describe()`. Nothing is persisted.
2. Results render as a checklist with per-check status text plus icon:
   - "Reachable at {endpoint}" — pass/fail with latency
   - "Health check responded" — pass/fail with reported status
   - "Capability description received" — pass/fail
   - "Integration version supported" — pass/fail with version
   - "Work-item types declared" — count
   - "Actions declared" — count
   - "Permissions valid" — pass/fail, listing any unknown permissions
3. **Pass** (all checks pass) → "Continue" enabled.
4. **Warning** (reachable, describe succeeded, but health reports `DEGRADED`, or zero work-item types declared) → "Continue" enabled after an explicit acknowledgement checkbox: "I understand and want to register this application anyway."
5. **Fail** (unreachable, describe failed, unsupported version, or invalid permissions) → "Continue" disabled with the reason stated and a "Test again" control. Registration is not possible until it passes.
6. The test is announced via live region: "Connection test complete. 6 of 7 checks passed."
7. The test result is stored on the draft and expires after 10 minutes; submitting with a stale result re-runs the test automatically.

**Error handling:**

| Scenario | Result | User-facing message |
|---|---|---|
| Connection refused / DNS failure | Fail | "We couldn't reach that application at {endpoint}. Check that it's running and the address is correct." |
| Health timeout | Fail | "The application didn't respond within {n} milliseconds. Check the address, or increase the health check timeout." |
| `describe()` missing or malformed | Fail | "The application responded, but didn't describe what it can do in a format we understand. It may not support this integration version." |
| Contract version unsupported | Fail | "This application uses integration version {v}, which we don't support yet. Supported versions: {list}." |
| Unknown required permission | Fail | "This application asks for permissions this system doesn't have: {list}." |
| Health `DEGRADED` | Warning | "The application responded slowly ({n} ms). You can register it, but users may see delays." |
| Zero work-item types | Warning | "This application doesn't provide any work items. It will appear in the admin console but not in users' work queues." |

**Acceptance criteria:**
- AC-1: Registering against a stopped application is blocked with the unreachable message (PRD F12 capability).
- AC-2: Each failure and warning case renders its specified copy.
- AC-3: A passing test enables progression and caches the discovered capabilities.

---

### FR-F12-04 — Capability auto-discovery (step 4)

**Description:** Where `describe()` is supported, capabilities are pre-populated from the application's own declaration and shown for confirmation.

**Processing / business rules:**
1. Work-item types, their labels, content profiles, status maps, and priority handling are pre-filled from `describe()`, each marked "Reported by the application."
2. Actions are pre-filled with `actionId`, `label`, `appliesToTypes`, `requiredPermission`, and `formSchema`.
3. The administrator may edit labels and `visibleToRoles` but **may not invent** types or actions the application did not declare — doing so would register capabilities the adapter cannot deliver, producing exactly the dead controls the product forbids. The form states this: "Only capabilities the application reports can be registered."
4. The administrator may **remove** a declared type or action to limit what is exposed; removals are recorded in the registry row and audited.
5. Status maps are shown as an editable table; an incomplete map blocks progression with the unmapped statuses listed.
6. If `describe()` is unsupported by the adapter type, step 4 presents empty lists with guidance: "This application doesn't describe its own capabilities. It will be registered with no work-item types."

**Acceptance criteria:**
- AC-1: CVS's declared types and actions appear pre-filled and correct.
- AC-2: Removing a declared action prevents it from appearing anywhere in the UI.
- AC-3: An incomplete status map blocks submission with the specific unmapped values listed.

---

### FR-F12-05 — Post-registration propagation

**Description:** What must be true immediately after submission, with no restart.

**Processing / business rules:**
1. Registry row created; `registryVersion` incremented.
2. The application appears at once in: admin inventory (SCR-22), health monitoring (SCR-24, first probe issued immediately), the role-scoped navigation of every role in `visibleToRoles`, work-queue fan-out, search fan-out (if `supportsSearch`), and related-item resolution targets.
3. Users with an open session receive updated navigation on their next `registryVersion` poll (≤30 s) without signing out or reloading.
4. An audit record `APPLICATION_REGISTERED` is written with the administrator, the application ID, and a summary of the configuration.
5. **The demo assertion:** an administrator registers CVS, and an investigator already signed in sees CVS work items in the unified queue within one poll — zero code changes, zero restarts (SM-11, SM-12, PRD F12 acceptance signal).

**Acceptance criteria:**
- AC-1: The full propagation list is satisfied within 30 seconds of submission.
- AC-2: A signed-in investigator's navigation and queue update without re-authentication.
- AC-3: One audit record is written naming the administrator and configuration.

---

### FR-F12-06 — The demo sixth application (CVS)

**Description:** A synthetic sixth service shipped running but unregistered, existing specifically so registration can be performed live.

**Processing / business rules:**
1. "Continuous Vetting Service" (`applicationId: CVS`) runs as a sixth spoke process with its own namespace (`Y0b §CVS`), implementing the full adapter contract and passing the conformance suite.
2. It is **not** present in the seeded registry. Its absence from navigation, queue, and console before registration is itself part of the demonstration.
3. Its seeded data includes work items assignable to the investigator persona, so registering it produces an immediately visible change in that persona's queue — the demo needs a visible consequence, not just a new console row.
4. Work-item type: `CVS_ALERT` with statuses `NEW`, `UNDER_REVIEW`, `CLEARED`, `ESCALATED`. Actions: `ACKNOWLEDGE_ALERT`, `CLEAR_ALERT` (reason required), `ESCALATE_ALERT`.
5. `FR-F17-11`'s reset command returns CVS to unregistered, so the registration demo is repeatable (SM-22).
6. CVS is functionally ordinary: no special-casing anywhere in the hub, which is the entire point.

**Acceptance criteria:**
- AC-1: Before registration, CVS appears nowhere in the UI.
- AC-2: After registration, CVS items appear in the investigator queue, correctly attributed with its display name and icon.
- AC-3: Reset returns the system to the unregistered state, and the demo repeats identically.

---

### FR-F12-07 — Edit and de-register flows

**Description:** Changing and removing a registered application, both fully audited.

**Inputs:** `PATCH /api/admin/applications/{id}`; `DELETE /api/admin/applications/{id}` with `{ reason }`.

**Processing / business rules:**
1. **Edit** reuses SCR-28 in edit mode with values pre-filled. `applicationId` is displayed read-only with an explanation: "The application ID can't be changed because existing records refer to it."
2. Changing `baseEndpoint`, `healthEndpoint`, or `adapterType` re-requires a passing connection test before saving.
3. Edits write an audit record with a before/after summary of exactly which fields changed.
4. **De-register** requires typed confirmation of the display name plus a reason (10–500 chars), and states consequences: "This removes {name} from navigation, the work queue, search, and health monitoring for all users. {n} work items will stop appearing. Audit records that mention {name} are kept."
5. De-registration removes the registry row, bumps `registryVersion`, stops health probing, and drops the application from every surface — with no code change and no errors anywhere (PRD F8 acceptance signal).
6. Audit records referencing the de-registered application are retained and remain readable; the audit viewer shows the stored display name from the record, not a lookup, so history stays legible after removal.
7. De-registering an application that is a leg in an orchestration definition warns that those workflows will fail, and the warning is recorded with the audit entry.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Confirmation text mismatch | 400 | `VALIDATION_FAILED` | "The name you typed doesn't match. Type {displayName} exactly to confirm." |
| Missing reason | 400 | `VALIDATION_FAILED` | "Enter a reason for removing this application." |
| Application not found | 404 | `APPLICATION_NOT_FOUND` | "We couldn't find that application. It may have already been removed." |
| Attempt to change `applicationId` | 400 | `IMMUTABLE_FIELD` | "The application ID can't be changed because existing records refer to it." |

**Acceptance criteria:**
- AC-1: De-registering removes the application cleanly from navigation, queue, search, and console, with no errors (PRD F8 acceptance signal).
- AC-2: Audit records naming the removed application remain readable afterwards.
- AC-3: Both edit and de-register write audit records naming the administrator, the application, and the change.

---

### FR-F12-08 — Onboarding documentation

**Description:** What a new application must implement to be registerable, generated alongside the prototype.

**Processing / business rules:**
1. A document is produced covering: the adapter interface (`FR-F08a-01`), the `describe()` schema, the normalized WorkItem model, status map requirements, the principal assertion contract, scope enforcement obligations, idempotency requirements, health endpoint expectations, the error taxonomy, and how to run the conformance suite standalone.
2. It is linked from SCR-28 step 1 ("What does an application need to support?") and from SCR-22, so it is discoverable where it is needed rather than only in a repository.
3. CVS serves as the worked reference implementation and is named as such.

**Acceptance criteria:**
- AC-1: A developer can implement a conformant adapter from this document plus the conformance suite alone.
- AC-2: The document is reachable from within the application.

---
## F13 — Immutable Audit Trail and Audit Viewer

**Traces to:** PRD F13 (P0); NFR-06, NFR-07, SM-19, SM-20, R-15. **Screens:** SCR-33 audit viewer, SCR-34 record detail and chain view. **Schema:** `Y0a §audit_events`. **API:** `Y1a §Audit`.

**Description:** An append-only record of who did what, to what, and when — written on every state-changing operation across the platform, and viewable and filterable in the UI. The audit trail is not optional instrumentation: an action that cannot be audited does not complete.

**Terminology:**
- **Audit record** — one immutable row in `Y0a.audit_events`.
- **Chain** — all records sharing one `correlationId`, read as a single narrative.
- **Hash chain** — per-record hash linking each record to its predecessor, making tampering detectable.
- **Before/after summary** — a plain-language description of what changed, not a full data dump.

---

### FR-F13-01 — Mandatory audit write on every mutation

**Description:** The guarantee that makes the audit trail trustworthy.

**Inputs:** Every mutating operation's outcome, principal, target, and correlation context.

**Processing / business rules:**
1. The audit write occurs **inside** the mutation path, after the underlying change is confirmed and **before** the success response is composed (`FR-F10-01` step 9).
2. If the audit write fails, the operation is reported to the user as **not completed**, with `AUDIT_WRITE_FAILED`. The hub does not return success for an unaudited action under any circumstance.
3. Where the underlying spoke write already committed before the audit failure (unavoidable in a distributed write), the hub additionally: marks the orchestration or action record `AUDIT_GAP`, creates an `integration_issues` row of class `AUDIT_WRITE_FAILED` with every detail needed to reconstruct the event, and surfaces it to administrators. The discrepancy is recorded and visible rather than hidden — honesty about a gap is the only defensible behavior when the gap cannot be prevented.
4. Audit writes never depend on a spoke's availability; they are hub-local.
5. A registry of mutating endpoints and their expected audit action types is asserted by test (`FR-F19-05`): invoking each produces exactly one record of the expected type (SM-19).
6. The audit write is not deferred, queued, batched, or made asynchronous. Deferral is what turns a guarantee into a hope.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Audit store unavailable pre-write | 503 | `AUDIT_UNAVAILABLE` | "We can't record actions right now, so this action wasn't completed. Try again shortly — reference {correlationId}." |
| Audit write failed post-spoke-commit | 500 | `AUDIT_WRITE_FAILED` | "We couldn't record this action. It may have been applied in {System} — check the item's current status. An administrator has been notified — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Every mutating endpoint writes exactly one record per success (SM-19).
- AC-2: Simulating audit-store failure causes mutations to be reported as failed.
- AC-3: A post-commit audit failure produces an integration issue and the specified honest message.

---

### FR-F13-02 — Record schema and coverage

**Description:** What is captured, and which operations must produce a record.

**Record fields** (full DDL in `Y0a`):
- `auditId` (ULID), `sequenceNumber` (monotonic integer, gap-free per store)
- `occurredAt` (ISO-8601 UTC, server clock)
- `actorPrincipalId`, `actorDisplayName`, `actorRolesAtAction` (array), `actorActiveRoleAtAction`, `actorAttributesAtAction` (JSON snapshot) — recorded **as at the time of action**, so later changes cannot rewrite what the actor was
- `actionType` (string, closed vocabulary)
- `targetSystem` (`HUB` or `applicationId`), `targetSystemDisplayName` (denormalized, so history survives de-registration)
- `targetResourceType`, `targetResourceId`
- `outcome` (`SUCCESS | FAILURE | DENIED | PARTIAL`)
- `reasonCode`, `policyRuleId` (for denials)
- `beforeSummary`, `afterSummary` (plain-language strings, ≤500 chars each)
- `correlationId`, `requestId`, `adapterRequestId`
- `sessionId`, `identityMethod`
- `clientContext` (`{ ipHash, userAgentHash }`)
- `recordHash`, `previousRecordHash`

**Coverage — operations that MUST write a record:**

| Category | Actions |
|---|---|
| Authentication | `AUTH_SUCCESS`, `AUTH_FAILURE`, `LOGOUT`, `SESSION_EXPIRED`, `ROLE_CONTEXT_SWITCHED` |
| Authorization | `AUTHZ_DENIED` (every denial, including CSRF rejections) |
| Work items | `WORK_ITEM_VIEWED`, `WORK_ITEM_ACTION_PERFORMED`, `RELATED_ITEMS_RESOLVED`, `RELATED_ITEM_TRAVERSED` |
| Spoke-specific mutations | `ISSUE_RESOLVED`, `CASE_ISSUE_CLEARED`, `CASE_ADJUDICATED`, `DESIGNATION_APPROVED`, `DESIGNATION_RETURNED`, `NOTICE_ACKNOWLEDGED`, `TASK_COMPLETED`, `ASSIGNMENT_ACCEPTED`, `CASE_STATUS_UPDATED`, `LEAD_NOTE_ADDED`, `ALERT_ACKNOWLEDGED`, `ALERT_CLEARED`, `ALERT_ESCALATED` |
| Orchestration | `ORCHESTRATION_STARTED`, `ORCHESTRATION_COMPLETED`, `ORCHESTRATION_PARTIAL`, `ORCHESTRATION_FAILED`, `ORCHESTRATION_RETRY_ATTEMPTED` |
| Administration | `APPLICATION_REGISTERED`, `APPLICATION_UPDATED`, `APPLICATION_ENABLED`, `APPLICATION_DISABLED`, `APPLICATION_DEREGISTERED`, `APPLICATION_PROBED`, `ANNOUNCEMENT_CREATED`, `ANNOUNCEMENT_UPDATED`, `ANNOUNCEMENT_EXPIRED`, `FAILURE_INJECTED`, `FAILURE_CLEARED`, `OPERATOR_TOKEN_ISSUED`, `DEMO_RESET_PERFORMED` |
| Identity | `USER_VIEWED`, `ROLE_ASSIGNED` |
| Integration | `ADAPTER_FAILURE` (recorded when the failure accompanies a user action) |
| Audit | `AUDIT_VIEWED`, `AUDIT_EXPORTED` |

**Rules:**
1. `beforeSummary`/`afterSummary` are human-readable, e.g. `"status: Open"` → `"status: Resolved — Substantiated"`. They never contain full record dumps, and never contain narrative free text verbatim beyond 500 characters (the narrative lives in the spoke, which is its system of record).
2. `actionType` is a closed vocabulary; an undeclared type fails a startup check.
3. Read auditing is deliberately limited to the categories above — routine list reads are not audited so the trail stays legible, and the exceptions are enumerated rather than left to discretion.

**Acceptance criteria:**
- AC-1: Every listed action type is produced by at least one code path and is filterable in the viewer.
- AC-2: Actor roles and attributes are snapshotted at action time.

---

### FR-F13-03 — Append-only storage and integrity

**Description:** No update path, no delete path, and detectable tampering.

**Processing / business rules:**
1. The application exposes **no** endpoint, service method, or UI control that updates or deletes an audit record. The absence is verified by test (`FR-F19-05`): route enumeration finds no PUT/PATCH/DELETE under `/api/audit`, and static analysis finds no update or delete statement against `audit_events`.
2. Database-level protection: the hub's application credential holds `INSERT` and `SELECT` on `audit_events` only — no `UPDATE`, no `DELETE`, no `TRUNCATE`. Enforcement lives at the grant, not at the code.
3. `sequenceNumber` is assigned monotonically and gap-free by the store. A gap is detectable and reported.
4. `recordHash = H(sequenceNumber ‖ occurredAt ‖ actorPrincipalId ‖ actionType ‖ targetSystem ‖ targetResourceId ‖ outcome ‖ beforeSummary ‖ afterSummary ‖ correlationId ‖ previousRecordHash)`. The first record chains from a genesis constant.
5. `GET /api/audit/integrity` recomputes the chain over a range and returns `{ verified, recordsChecked, firstBrokenSequence | null, checkedAt }`.
6. SCR-33 displays an integrity indicator: "Integrity verified — {n} records checked at {time}" or, on failure, an error alert naming the first broken sequence number. The indicator is text plus icon, never color alone.
7. Retention: records are never purged in this prototype. The reset command (`FR-F17-11`) rebuilds the entire environment from scratch rather than deleting rows, so even reset is not a deletion path.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Integrity check fails | 200 | — | "Audit integrity check failed at record {n}. Records may have been altered outside the application. Contact your administrator." |
| Attempted mutation endpoint | 405 | `METHOD_NOT_ALLOWED` | "Audit records can't be changed or deleted." |

**Acceptance criteria:**
- AC-1: No application path can modify or delete an audit record (NFR-07).
- AC-2: Manually altering a record in the database causes the integrity check to fail at that record, demonstrably.
- AC-3: Sequence numbers are gap-free across a full demo run.

---

### FR-F13-04 — Correlated cross-system chains

**Description:** One user action reads as one narrative, not four disconnected rows.

**Processing / business rules:**
1. Every record carries the `correlationId` of the user action that produced it (`FR-F01-06`).
2. `GET /api/audit/chain/{correlationId}` returns all records for that ID in `sequenceNumber` order, plus a computed `summary` line naming actor, systems touched, and overall outcome.
3. Chains spanning retries (`FR-F07b-03`) include every attempt, so a partial completion's history is complete rather than tidied.
4. The chain view (SCR-34) renders records as an ordered narrative with system badges and elapsed time between steps.
5. Chain visibility respects role scoping (`FR-F13-07`): a mission user sees their own chain; records within the chain belonging to another actor are shown as redacted placeholders ("An action by another user — {timestamp}") rather than omitted, so the narrative's shape is honest even when detail is withheld.

**Acceptance criteria:**
- AC-1: The flagship workflow renders as one chain of ≥5 records (SM-20).
- AC-2: The chain summary line correctly names both systems and the outcome.

---

### FR-F13-05 — Audit viewer (SCR-33)

**Description:** The accessible, filterable table where the trail is read.

**Inputs:** `GET /api/audit` with `actor`, `actorRole`, `actionType`, `targetSystem`, `targetResourceId`, `outcome`, `from`, `to`, `correlationId`, `q`, plus list conventions.

**Processing / business rules:**
1. Columns: Timestamp (UTC), Actor, Role at action, Action, Target system, Target resource, Outcome (text + icon), Correlation ID (link to chain).
2. Filters render as a form with a filter-chip summary and a "Clear all filters" control, matching the work-queue pattern (`FR-F05-03`) so the interaction is learned once.
3. Default view: last 24 hours, newest first, scoped by role (`FR-F13-07`).
4. Sortable on timestamp, actor, action type, target system, outcome. Default `occurredAt DESC`.
5. Result count announced politely on every change: "{n} audit records. Showing {a} to {b}."
6. Each row links to SCR-34; the correlation ID links to the chain view.
7. Free-text `q` matches actor display name, target resource ID, and action type — not summaries, which could otherwise be used to fish for narrative content.
8. Viewing the audit trail itself writes an `AUDIT_VIEWED` record. The audit trail audits its own reading, which is both correct and demonstrable.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| No records match | 200 | — | "No audit records match your filters. Try widening the date range." |
| Range too large | 400 | `VALIDATION_FAILED` | "Choose a date range of 90 days or fewer." |
| Reversed range | 400 | `VALIDATION_FAILED` | "Enter an end date that comes after the start date." |

**Acceptance criteria:**
- AC-1: Every filter works and combines correctly.
- AC-2: The table passes the accessibility scan with proper headers, caption, and announced sort state.
- AC-3: Opening the viewer writes one `AUDIT_VIEWED` record.

---

### FR-F13-06 — Record detail and chain view (SCR-34)

**Description:** One record in full, and its chain.

**Processing / business rules:**
1. Record detail shows every field in a definition list: timestamp, actor with roles and attributes **as at the time of action**, action, target system and resource, outcome, reason code and policy rule (for denials), before/after summaries, correlation and request IDs, session ID, identity method, sequence number, and record hash.
2. "View full chain" shows every record sharing the correlation ID as an ordered narrative with a summary line.
3. Links out: to the affected work item (where the principal is entitled), to the application detail (administrators), and to the integration issue sharing the correlation ID (administrators).
4. A copy control for the correlation ID, so an administrator can quote it — and so a user quoting a correlation ID from an error message can be helped.
5. The record hash and previous hash are displayed with a short explanation of what they prove.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Record not visible to this principal | 403 | `AUTHZ_DENIED` | "You don't have access to this audit record." |
| Record not found | 403 | `AUTHZ_DENIED` | Same copy (non-enumerable). |

**Acceptance criteria:**
- AC-1: The flagship chain is readable end-to-end from any of its records.
- AC-2: Denial is non-enumerable.

---

### FR-F13-07 — Role-scoped audit visibility

**Description:** Who sees what in the trail.

**Processing / business rules:**
1. **Administrators** (`AUDIT.READ_ALL`) see every record.
2. **Mission users and applicants** (`AUDIT.READ_OWN`) see records where `actorPrincipalId == principalId`. These surface as "Recent activity" on the dashboard (`FR-F04-02`) and as the hub-origin half of item activity history (`FR-F06-06`).
3. Records concerning a resource but performed by another actor are **not** shown to non-administrators, except as redacted placeholders within a chain the user participated in (`FR-F13-04` rule 5).
4. Scoping is applied in the query, not after retrieval — the same data-layer discipline as `FR-F02-04`.
5. An applicant's own-activity view redacts no fields, because their own actions contain nothing they may not see.

**Acceptance criteria:**
- AC-1: An investigator's audit query returns zero records authored by another actor.
- AC-2: The scoping predicate is applied in the query, verified by inspection and by a direct API probe.

---

### FR-F13-08 — Export

**Description:** Export of a filtered view for demonstration purposes.

**Inputs:** `GET /api/audit/export?format=csv|json` with the same filters as the viewer.

**Processing / business rules:**
1. Exports respect the same role scoping and filters as the on-screen view; an export can never contain a record the user could not see on screen.
2. Maximum 10,000 records per export; beyond that the response is 400 with "Narrow your filters — exports are limited to 10,000 records."
3. The export includes a header block: generated-at, generating actor, applied filters, record count, and the integrity verification result for the exported range.
4. Every export writes an `AUDIT_EXPORTED` record naming the filters and the count.
5. CSV is UTF-8 with a BOM, quoted fields, and a documented column order; JSON mirrors the API record schema.
6. Exported files carry a synthetic-data notice as the first line: `# DEMO — SYNTHETIC DATA ONLY`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Too many records | 400 | `EXPORT_TOO_LARGE` | "Narrow your filters — exports are limited to 10,000 records." |
| Export generation failed | 500 | `INTERNAL_ERROR` | "We couldn't build that export. Try again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: An export of the flagship chain contains exactly the records shown on screen.
- AC-2: Every export writes an audit record.
- AC-3: Exported files carry the synthetic-data notice.

---
## F14 — USWDS v3 Accessible Interface (Section 508 / WCAG 2.1 AA)

**Traces to:** PRD F14 (P0 — hard requirement); NFR-01, NFR-02, NFR-03, NFR-16, SM-07, SM-08, SM-09, R-04. **Screens:** all, plus SCR-36 accessibility statement.

**Description:** The accessible, design-system-conformant interface treated as a first-class feature with its own testable functional requirements — not as a quality attribute asserted at the end. For a federal audience, accessibility failures are disqualifying. Each requirement below is written as behavior a test can verify, because "be accessible" is not implementable and "every interactive control is operable by keyboard with a visible focus indicator" is.

> **Assumption (flagged):** the DCSA Ecosystem Style Guide (Attachment 1) was not supplied. USWDS v3 with token-based DCSA theming is assumed. Adopting the real guide is a token and asset swap. Revisit on receipt (PRD §4, Q-01).

**Terminology:**
- **Design token** — a named theme value (color, spacing, type) from USWDS; the only permitted source of visual values.
- **Live region** — an `aria-live` container announcing asynchronous change without moving focus.
- **Error summary** — the USWDS pattern listing form errors at the top of a form with in-page links to each field.

---

### FR-F14-01 — USWDS component adoption and token-only theming

**Processing / business rules:**
1. Every UI element is a USWDS v3 component or composed from USWDS primitives. No bespoke component library, and no reimplementation of a component USWDS provides (button, alert, accordion, banner, breadcrumb, card, checkbox, combo box, date picker, file input, form, header, footer, icon, identifier, in-page navigation, language selector, link, list, modal, pagination, process list, prose, radio, range, search, select, side navigation, site alert, skip nav, step indicator, summary box, table, tag, text input, textarea, time picker, tooltip, validation).
2. **Zero hard-coded color, font, or spacing literals** anywhere in the codebase. All visual values are USWDS design tokens or theme-token overrides in a single theme configuration file.
3. A lint rule fails the build on any hex color, `rgb()`, `hsl()`, named color, raw `px`/`rem` spacing outside the token scale, or font-family literal in component code (NFR-03).
4. DCSA theming is expressed exclusively as token overrides: federal blue palette, Public Sans typography, USWDS spacing and radius scales, plus a reserved header slot for a DCSA seal/wordmark asset.
5. No inline styles carrying visual values; utility classes come from the USWDS utility set.

**Acceptance criteria:**
- AC-1: The lint rule passes with zero violations (NFR-03).
- AC-2: Changing the theme configuration changes the entire application's palette with no component edits.

---

### FR-F14-02 — Keyboard operability

**Processing / business rules:**
1. Every interactive control is reachable and operable by keyboard alone: Tab/Shift-Tab to move, Enter to activate links and buttons, Space to activate buttons and toggle checkboxes, Arrow keys within radio groups and menus, Escape to close overlays.
2. **No keyboard traps.** Focus can always leave any component using the keyboard.
3. Modals (SCR-02 certificate picker, SCR-06 timeout warning, confirmation dialogs) trap focus **while open**, close on Escape, and **restore focus to the invoking control** on close.
4. Tab order follows visual order on every screen. Positive `tabindex` values are prohibited.
5. Custom composite widgets (sortable table headers, filter chips, accordions, the account menu) implement the ARIA Authoring Practices keyboard patterns for their role.
6. Disabled controls are not in the tab order, and their `disabledReason` is exposed adjacent to them in text so the explanation is available without focusing the disabled element (`FR-F06-03`).
7. The flagship workflow is completable using the keyboard alone, end to end (SM-08).

**Acceptance criteria:**
- AC-1: A keyboard-only pass completes the flagship workflow (SM-08, recorded).
- AC-2: The automated keyboard smoke test asserts reachability and operability of every primary control (`FR-F19-07`).
- AC-3: Zero keyboard traps across all routes.

---

### FR-F14-03 — Accessible forms

**Processing / business rules:**
1. Every input has a programmatically associated `<label>` (`for`/`id`). Placeholder text is never a substitute for a label.
2. Hint text is associated via `aria-describedby`.
3. Required fields are marked with a text indicator ("required") in the label — never by color or asterisk alone.
4. Related inputs are grouped in `<fieldset>` with a `<legend>` (disposition radio group, MFA method choice, role selection, risk factors).
5. On validation failure:
   - A USWDS error summary renders at the top of the form with `role="alert"` and a heading "There is a problem."
   - **Focus moves to the summary.**
   - Each entry is an in-page link to its field; activating it focuses that field.
   - Each field shows an inline error message associated by `aria-describedby`, and the field carries `aria-invalid="true"`.
   - The document title is prefixed "Error: " so the failure is announced on page-level submissions.
6. Error copy is specific and actionable, naming what to do — never "Invalid input." All copy is specified per-field in the owning requirement and consolidated in `Y2`.
7. Character-limited fields show a counter announced politely at 90% and 100% of the limit, not on every keystroke.
8. Success confirmations are announced via a polite live region and receive focus, so a keyboard user knows the action landed.
9. Client validation never blocks a submission the server would accept, and never accepts one the server would reject — the rules are the same rules.

**Acceptance criteria:**
- AC-1: Every form in the application satisfies rules 1–8, verified by automated scan plus manual audit.
- AC-2: Submitting an invalid form moves focus to the summary and links to the offending field.

---

### FR-F14-04 — Accessible data tables

**Processing / business rules:**
1. Every data table is a real `<table>` with a `<caption>` describing its contents and current result count.
2. `<th scope="col">` on every column header; `scope="row"` on the row's identifying cell.
3. Sortable headers contain a `<button>` with `aria-sort` on the `<th>` reflecting `ascending | descending | none`; activation announces the new sort and result count via a polite live region.
4. Pagination uses the USWDS pagination component with `aria-label`, `aria-current="page"` on the current page, and disabled (not hidden) bounds controls.
5. Result-count changes from filtering, searching, sorting, or paging are announced politely: "{n} results. Showing {a} to {b}."
6. Tables never rely on color to convey status; every status cell carries text, and an icon where helpful.
7. Tables scroll horizontally within a labelled, keyboard-scrollable region at narrow viewports rather than forcing page-level horizontal scroll (NFR-16).
8. Empty tables render a designed empty state inside the table region, with the caption still present.

**Acceptance criteria:**
- AC-1: All tables (work queue, audit, admin inventory, health, integration issues, identities, confirmation results) satisfy rules 1–8.
- AC-2: Sort state changes are announced.

---

### FR-F14-05 — Accessible navigation and landmarks

**Processing / business rules:**
1. Landmark structure per `FR-F03-01`, with unique `aria-label`s on multiple navs.
2. A skip-to-main-content link is the first focusable element on every page, visible on focus, and moves focus to `<main>`.
3. Current page is indicated by `aria-current="page"` plus a visible non-color indicator.
4. Heading hierarchy is correct and gap-free on every screen: one `<h1>`, then `<h2>` for major regions, `<h3>` for subsections.
5. Menus are keyboard-operable with `aria-expanded` state and Escape to close.
6. Breadcrumbs use `<nav aria-label="Breadcrumb">` with an ordered list and `aria-current="page"` on the final segment.
7. Page titles are unique and descriptive, and change on every navigation including client-side route changes (`FR-F03-01`).
8. Focus moves to the new page's `<h1>` on client-side navigation, so screen-reader users are not left at the top of an unchanged DOM.

**Acceptance criteria:**
- AC-1: Every route has a correct landmark set and heading hierarchy.
- AC-2: The skip link works on every route.

---

### FR-F14-06 — Color contrast and non-color meaning

**Processing / business rules:**
1. All text meets WCAG 2.1 AA contrast: 4.5:1 for normal text, 3:1 for large text (≥24px, or ≥19px bold).
2. Meaningful non-text elements — focus indicators, form borders, status icons, chart elements — meet 3:1 against adjacent colors.
3. **Status is never conveyed by color alone.** Every status, priority, health state, outcome, overdue marker, and validation state is paired with text and/or a distinct icon shape (NFR-02):
   - Health: "Healthy" ✓ / "Degraded" ! / "Unavailable" ✕
   - Priority: "Urgent" / "Elevated" / "Routine" as text, with distinct tag shapes
   - Overdue: the word "Overdue" plus an icon, never a red row alone
   - Outcome: "Success" / "Denied" / "Failed" as text
4. Focus indicators are visible against every background they appear on, meeting 3:1, and are never removed (`outline: none` without a replacement is prohibited by lint).
5. The interface is usable in forced-colors / high-contrast mode: the demo banner, focus indicators, and status icons remain visible.
6. Information conveyed by a chart is always also available as an accessible table (`FR-F04-03`).

**Acceptance criteria:**
- AC-1: Automated contrast check reports 100% conformance (SM-09).
- AC-2: A grayscale rendering of every screen retains all status meaning.

---

### FR-F14-07 — Screen-reader semantics and live regions

**Processing / business rules:**
1. Every control has an accessible name that matches or contains its visible label. Icon-only controls carry `aria-label`.
2. Live regions announce asynchronous change **without stealing focus**:
   - `aria-live="polite"`: queue refresh and result counts, widget load completion, sort and filter changes, new alert counts, health recovery, role switch, connection test results.
   - `aria-live="assertive"` / `role="alert"`: form error summaries, action failures, session timeout warning thresholds, degraded-system warnings on first appearance.
3. Loading states set `aria-busy="true"` on the affected region and announce once on completion — not repeatedly during polling.
4. Announcements are debounced and deduplicated: rapid successive changes produce one announcement, not a stream.
5. Decorative images and icons are `aria-hidden="true"`; informative icons carry text alternatives.
6. Dynamic content insertion (a new alert, a refreshed widget) does not move focus or reorder content under the user's cursor (`FR-F05-05` rule 6).
7. The demo banner is exposed to assistive technology (never `aria-hidden`) and is announced once per page load as part of the banner landmark.

**Acceptance criteria:**
- AC-1: A screen-reader pass confirms every async state change is announced exactly once (documented manual pass, NFR-01).
- AC-2: No announcement steals focus.

---

### FR-F14-08 — Motion, zoom, and responsive behavior

**Processing / business rules:**
1. `prefers-reduced-motion: reduce` disables all non-essential animation, including skeleton shimmer, transitions, and auto-advancing indicators.
2. The interface is fully usable at 200% zoom with no loss of content or function.
3. The interface is fully usable at 320px viewport width with no horizontal page scroll (NFR-16).
4. Text can be resized to 200% without clipping or overlap.
5. Content reflows rather than requiring two-dimensional scrolling, except for data tables, which scroll horizontally within their own labelled region.
6. Touch targets are at least 44×44 CSS pixels.
7. No content requires a hover to be discoverable; tooltip content is also available on focus and is never the only source of essential information.

**Acceptance criteria:**
- AC-1: Every route passes a 320px and a 200%-zoom audit.
- AC-2: Reduced-motion preference is respected across all animated elements.

---

### FR-F14-09 — Timing and session accessibility

**Processing / business rules:**
1. The session timeout warning appears at least 2 minutes before expiry (`FR-F00-06`), is keyboard-operable, and can be extended.
2. The countdown is announced at open, 60 seconds, and 15 seconds — not continuously.
3. No content auto-refreshes in a way that moves focus or changes what is under the cursor; health polling updates a notice region only.
4. There is no time limit on completing a form other than the session timeout, and extending the session preserves entered form data (`FR-F00-06` rule 4).

**Acceptance criteria:**
- AC-1: Extending a session from within a partially completed form preserves all input.
- AC-2: The countdown announcement pattern is verified in a screen-reader pass.

---

### FR-F14-10 — Error, empty, and loading state accessibility

**Processing / business rules:**
1. Every error state has: a heading, plain-language explanatory text, at least one actionable next step, and a copyable correlation ID where applicable.
2. Error pages (SCR-30, SCR-31, SCR-32) set a descriptive `<title>`, move focus to the `<h1>`, render inside the shell with the demo banner, and provide working exit links.
3. Empty states are designed content with a heading, an explanation of what would appear, and — where applicable — an action. Never a blank region.
4. Loading states use `aria-busy` on the region, preserve layout to prevent content shift, and announce completion once.
5. Degraded states use `role="status"` and name the affected system and the missing data (`FR-F16-05`).

**Acceptance criteria:**
- AC-1: Every screen's four non-happy states are implemented and pass the accessibility scan.
- AC-2: No state renders a blank region or an unlabelled spinner.

---

### FR-F14-11 — Accessibility statement (SCR-36)

**Processing / business rules:**
1. A screen stating: the conformance target (Section 508 / WCAG 2.1 AA), the assessment approach (automated axe-core scanning in CI plus documented manual keyboard and screen-reader passes), known limitations with dates, and how to report an accessibility problem.
2. Reachable from the footer on every screen and from the account menu, including while unauthenticated.
3. States the USWDS assumption and that the DCSA Ecosystem Style Guide was not available (PRD Q-01) — honesty about the assumption belongs on the page that claims conformance.
4. The page itself conforms fully.

**Acceptance criteria:**
- AC-1: The statement is reachable from every screen including login.
- AC-2: Known limitations are listed with dates rather than claimed to be none.

---

### FR-F14-12 — Accessibility verification gate

**Processing / business rules:**
1. An automated axe-core (or equivalent) scan runs in CI across **every route, for every role**, including error, empty, and degraded states (`FR-F19-06`).
2. The build **fails** on any serious or critical violation (SM-07). Moderate and minor violations are reported and tracked.
3. A documented manual pass — keyboard-only and screen-reader — is performed before the demo and recorded with date, tooling, and findings.
4. Accessibility review is a merge gate: a change introducing a violation does not merge.

**Acceptance criteria:**
- AC-1: CI reports zero serious or critical violations across all routes and roles (SM-07, NFR-01).
- AC-2: The manual pass is documented and current.

---
## F15 — Notifications, Alerts, and System Announcements

**Traces to:** PRD F15 (P1). **Screens:** SCR-21 notifications list, SCR-29 announcement management, dashboard alert panels, header indicator. **API:** `Y1a §Notifications`.

**Description:** The information layer that tells users something needs their attention: work-driven alerts derived server-side from aggregated spoke data, and administrator-authored system announcements. Distinct from the demo banner, which is permanent chrome and is never affected by anything in this feature.

**Terminology:**
- **Alert** — a derived, read-only signal computed from spoke data (overdue item, new issue, approaching due date). Not stored as spoke state, never mutating a spoke.
- **Announcement** — administrator-authored content stored in the hub (`Y0a.announcements`).
- **Notification** — the union of the two, as presented to the user.
- **Dismissal** — a per-user, per-announcement suppression.

---

### FR-F15-01 — Derived alert computation

**Description:** Alerts are computed server-side from the same aggregation that feeds the queue, so they can never disagree with it.

**Inputs:** Aggregated `WorkItem[]` for the principal (`FR-F05-02`); current time; alert rule configuration.

**Processing / business rules:** Alert rules, each with an ID, a condition, and a severity:

| Rule ID | Condition | Severity | Roles |
|---|---|---|---|
| `ALERT-OVERDUE` | `overdue == true AND statusCategory != CLOSED` | WARNING | Inv, Adj, App |
| `ALERT-DUE-SOON` | `dueDate within 3 days AND statusCategory != CLOSED` | INFO | Inv, Adj, App |
| `ALERT-NEW-ASSIGNMENT` | `assigneeId == principalId AND createdAt within 24h` | INFO | Inv, Adj |
| `ALERT-NEW-PVQ-ISSUE` | A `PVQ_ISSUE` created within 7 days whose `parentCaseRef` is a case assigned to the principal | WARNING | Inv |
| `ALERT-BLOCKED` | `statusCategory == BLOCKED` | WARNING | Inv, Adj |
| `ALERT-STALLED` | `statusCategory == IN_PROGRESS AND lastActivityAt older than 14 days` | INFO | Inv, Adj |
| `ALERT-ACTION-REQUIRED` | An `IEP_TASK` or eApp case in `INFORMATION_REQUESTED` for the applicant's own subject | WARNING | App |
| `ALERT-ORCHESTRATION-INCOMPLETE` | An orchestration transaction in `PARTIALLY_COMPLETED` or `NEEDS_ATTENTION` authored by the principal | WARNING | Inv |

Additional rules:
1. Alerts are **read-only over spoke data**: alert generation never mutates a spoke, so it never needs to be undone (PRD F15).
2. Alerts are computed on request, not stored as durable rows — except for read state (`FR-F15-03`), which is hub-local.
3. Every alert carries `{ alertId (deterministic hash of ruleId + workItemId), ruleId, severity, title, message, workItemId, sourceSystem, generatedAt, actionHref }`. Determinism matters: the same condition produces the same `alertId` across requests, so read state sticks.
4. Alerts respect the principal's scope; an alert can never reference an item the principal may not open.
5. When a source is unavailable, alerts derived from it are absent, and the notifications surface says so: "Alerts from {System} aren't available right now." — an absent alert is never presented as an all-clear.
6. `ALERT-NEW-PVQ-ISSUE` is the dashboard on-ramp to the flagship workflow (`FR-F04-02` widget 3).

**Outputs:** `alerts[]` on `GET /api/notifications` and in dashboard widgets.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Source unavailable | 200 | — | "Alerts from {System} aren't available right now." |
| No alerts | 200 | — | "You have no alerts right now." |

**Acceptance criteria:**
- AC-1: Every rule fires against seeded data for at least one persona (`FR-F17-07`).
- AC-2: Alert counts match the queue's filtered counts exactly.
- AC-3: No alert links to an item the principal cannot open.

---

### FR-F15-02 — Alert presentation: dashboard, header indicator, list (SCR-21)

**Processing / business rules:**
1. **Dashboard alerts panel** (`FR-F04-02` widget 2) shows the top alerts by severity then due date, each linking directly to the item that produced it, preserving context.
2. **Header indicator** shows an unread count as text plus icon with an accessible name: "Notifications: 4 unread." It is a link to SCR-21, never a hover-only popover, so it is operable by keyboard and touch alike.
3. **SCR-21 notifications list** shows all current alerts and announcements for the principal, filterable by type (`Alert | Announcement`) and severity, sortable by date and severity, with a designed empty state.
4. Each row: severity (text + icon), title, message, source system badge (alerts only), generated/issued date, read state, and a link to the originating item or the announcement detail.
5. The list is a real table with a caption and announced result counts (`FR-F14-04`).
6. New alerts arriving during a session are announced once via a polite live region — "You have 1 new alert." — **without stealing focus** (`FR-F14-07`).
7. Alert polling occurs every 60 seconds and is suspended while a modal is open or a form has unsaved input, so an announcement never interrupts an action in progress.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Notifications unavailable | 200 | — | "We couldn't load your notifications. Try again." with a retry control. |
| Empty | 200 | — | "You have no notifications. New alerts and announcements will appear here." |

**Acceptance criteria:**
- AC-1: The header count matches SCR-21's unread count exactly.
- AC-2: Every alert link resolves to a real, permitted item.
- AC-3: New-alert announcements do not move focus.

---

### FR-F15-03 — Read/unread state

**Processing / business rules:**
1. Read state is hub-local, per principal per `alertId` (`Y0a.alert_read_state`). It is not spoke state, because whether a user has noticed something is a hub concern.
2. `POST /api/notifications/{alertId}/read` marks one read; `POST /api/notifications/read-all` marks all currently visible alerts read.
3. The control is an accessible button labelled "Mark as read" with a confirmation announced politely: "Marked as read. 3 unread remaining."
4. Read state does not hide an alert; it only changes its visual and textual treatment and the unread count. A still-overdue item still shows as an alert, because dismissing awareness does not resolve work.
5. When the underlying condition clears (the item is completed), the alert disappears on the next computation, and its read-state row is garbage-collected.
6. Read state is per principal; it never affects another user.
7. Marking read is **not** audited — it is not a state change to mission data, and auditing it would flood the trail. This exclusion is deliberate and recorded here rather than left implicit.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Alert no longer exists | 200 | — | No error; the request is a no-op and the list refreshes. |
| Persist failure | 500 | `INTERNAL_ERROR` | "We couldn't save that. The alert will stay unread for now." |

**Acceptance criteria:**
- AC-1: Read state persists across sessions and is per user.
- AC-2: A resolved condition removes its alert automatically.

---

### FR-F15-04 — System announcements rendering

**Description:** Administrator-authored notices as users see them. Authoring is `FR-F11-06`.

**Processing / business rules:**
1. An announcement is shown to a principal when: `now` is between `effectiveFrom` and `expiresAt`, `principal.activeRole ∈ targetRoles`, and the principal has not dismissed it.
2. Rendering uses the USWDS site-alert pattern with severity mapping: `INFO` → informative, `WARNING` → warning, `EMERGENCY` → emergency.
3. Announcements render in a dedicated region **below** the demo banner and the header, and **never** overlay, replace, or reduce the visibility of the demo banner (`FR-F03-03`).
4. `INFO` and `WARNING` announcements are dismissible; `EMERGENCY` announcements are not (`FR-F11-06` rule 6), and their non-dismissibility is explained in the component: "This notice can't be dismissed."
5. Dismissal is per user per announcement, persisted in `Y0a.announcement_dismissals`, and takes effect immediately without a reload.
6. Announcement body is plain text, escaped on render. No HTML, no scripts, no links embedded in body text; a single optional `actionHref` and `actionLabel` provide a link, so link destinations are structured rather than smuggled into prose.
7. Announcements also appear on SCR-21 with their full text and issued date, including dismissed ones (shown as "Dismissed"), so a user can retrieve something they dismissed by accident.
8. New announcements arriving mid-session are announced politely once, and `EMERGENCY` ones use `role="alert"`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Dismiss failed | 500 | `INTERNAL_ERROR` | "We couldn't save that. The notice will reappear until we can." |

**Acceptance criteria:**
- AC-1: An announcement targeted at Investigator appears for that role and not for others.
- AC-2: Dismissal persists per user and is retrievable on SCR-21.
- AC-3: An announcement never obscures the demo banner, verified visually and by DOM assertion.

---

### FR-F15-05 — Distinction from the demo banner

**Description:** An explicit non-conflict requirement, because conflating the two would compromise NFR-13.

**Processing / business rules:**
1. The demo banner is chrome, permanent, non-dismissible, and rendered by the shell (`FR-F03-03`). It is not an announcement, is not stored in `announcements`, and is not affected by any announcement setting.
2. No announcement, alert, modal, or overlay may cover, hide, or scroll the demo banner out of the document. Overlays render below it in stacking order.
3. An automated assertion verifies banner visibility with an active `EMERGENCY` announcement and an open modal simultaneously — the worst case, tested explicitly.

**Acceptance criteria:**
- AC-1: The banner remains visible under every announcement and overlay combination (NFR-13, SM-10).

---

### FR-F15-06 — Notifications list screen behavior (SCR-21)

**Processing / business rules:**
1. Reachable from the header indicator and from primary navigation for all roles.
2. Sections: "Needs your attention" (unread warnings), "Other alerts", "Announcements". Each section has a heading and a count; empty sections render their own empty state rather than disappearing, so the page's structure is stable.
3. Filters: type, severity, source system, read state. Filter chips and clear-all, matching the queue pattern.
4. Bulk "Mark all as read" with a confirmation announcement.
5. Every row's primary link opens the originating work item; announcements expand in place to full text.
6. Degraded sources are named at the top of the page when alerts could not be computed for them.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| All sources unavailable | 200 | — | "We can't check for new alerts right now. Announcements are still shown below." |
| No notifications at all | 200 | — | "You have no notifications. New alerts and announcements will appear here." |

**Acceptance criteria:**
- AC-1: The page is fully populated for the investigator persona and shows designed empty states for the zero-item applicant.
- AC-2: All filters work and are announced.
- AC-3: The page passes the accessibility scan.

---
## F16 — Health Monitoring, Resilience, and Degraded-System Experience

**Traces to:** PRD F16 (P1); NFR-09, NFR-10, SM-15, SM-16, SM-17, R-13. **Screens:** SCR-24 health, SCR-25 issues, SCR-32 error boundary, SCR-38 failure injection; degraded states on every data screen. **API:** `Y1a §Health`, `§Admin — operations`.

**Description:** Background health checking of every registered application, plus the complete set of resilience behaviors and UX states that keep the prototype usable when a spoke misbehaves. The requirement is explicit and absolute: adapter failure degrades visibly and gracefully. Never a blank page, never an unhandled error, never a silent omission.

**Terminology:**
- **Probe** — one `healthCheck()` call against one application.
- **Health state** — `HEALTHY`, `DEGRADED`, or `DOWN`, defined precisely in `FR-F16-03`.
- **Degraded experience** — the UI mode in which some data is missing and the gap is named and quantified.
- **Failure injection** — administrator-triggered forcing of a spoke into an abnormal state for demonstration.

---

### FR-F16-01 — Health monitor service

**Processing / business rules:**
1. A background monitor probes every **enabled** registry application on its configured `healthProbeIntervalSec` (default 30 s).
2. Probes are concurrent across applications and never block user requests. A user request never waits on a probe.
3. Each probe uses `healthTimeoutMs`, performs **no retries**, and **bypasses the circuit breaker** — this is how recovery is detected while the circuit is open (`FR-F08a-05` rule 5).
4. Each probe result is stored in `Y0a.application_health_checks` `{ applicationId, checkedAt, status, latencyMs, errorClass, detail }`, and the current state is upserted into `Y0a.application_health`.
5. History is retained for the last 500 checks per application, sufficient for the console's history view and for the demo.
6. Probing starts immediately on registration or re-enable rather than waiting for the next interval (`FR-F12-05`, `FR-F08b-03`).
7. If the monitor itself is not running, the console shows a warning (`FR-F11-02`) — an absent monitor must not masquerade as all-healthy.

**Acceptance criteria:**
- AC-1: Stopping a spoke moves it to `DOWN` within one interval plus timeout.
- AC-2: Restarting it returns `HEALTHY` within one interval, with no user action (SM-17).
- AC-3: Probing continues while a circuit is open.

---

### FR-F16-02 — Health summary endpoint

**Processing / business rules:**
1. `GET /api/health/summary` returns, for every application the principal may see: `{ applicationId, displayName, status, lastCheckedAt, latencyMs, circuitState, message }`.
2. It reads stored results; it never probes synchronously, so it is fast and safe to poll.
3. It is authenticated but available to all roles, because every role's UI needs to know when to clear a degraded notice.
4. For non-administrators the response omits `circuitState` and technical `errorClass`, carrying only the user-appropriate `message`.
5. Clients poll it every 30 seconds while a degraded notice is displayed, and on window refocus.

**Acceptance criteria:**
- AC-1: Polling reflects a state change within one client poll after the monitor records it.
- AC-2: Non-administrators receive no technical detail.

---

### FR-F16-03 — Health state definitions

**Description:** Precise definitions, because "degraded" is meaningless if it is not defined.

| State | Definition | UI consequence |
|---|---|---|
| `HEALTHY` | Probe succeeded within `healthTimeoutMs` **and** `latencyMs <= degradedLatencyThresholdMs` (default 1500) **and** the spoke reported `status: HEALTHY` | Normal operation; no notice |
| `DEGRADED` | Probe succeeded but `latencyMs > degradedLatencyThresholdMs`, **or** the spoke self-reported `DEGRADED`, **or** the last 10 data calls show an error rate >20% while probes still pass | Data still loads; rows show "Slow to respond"; a non-blocking notice names the system; actions remain enabled but warn |
| `DOWN` | Probe failed (timeout, connection refused, non-2xx, malformed), **or** the circuit is `OPEN` | Data omitted for that source; degraded warning names the system and quantifies the gap; actions targeting it are disabled with a reason |

**Additional rules:**
1. Transitions require confirmation to avoid flapping: `HEALTHY → DOWN` requires 2 consecutive failed probes; `DOWN → HEALTHY` requires 1 successful probe (fast recovery, cautious failure — the asymmetry is deliberate, since a false "back up" is less harmful than a flapping banner).
2. Every transition writes an `integration_issues` row and is visible in the console health history.
3. State definitions are documented in the UI behind a "What do these states mean?" disclosure (`FR-F11-02`).

**Acceptance criteria:**
- AC-1: Each state is reachable via failure injection and produces its specified UI consequence.
- AC-2: A single transient failure does not flip a healthy system to `DOWN`.

---

### FR-F16-04 — Pre-emptive action disabling

**Processing / business rules:**
1. When an action's `targetSystems` includes an application in `DOWN`, the action is returned `enabled: false` with `disabledReason`: "{System} isn't responding right now. Try again when it's back." (`FR-F06-03`).
2. Orchestrated actions are disabled if **any** target system is `DOWN`, with the reason naming which: "eApp isn't responding right now, so this issue can't be resolved yet." Half-performing a dual write when we already know it will fail is worse than declining it (`FR-F07b-01` step 4).
3. `DEGRADED` systems do **not** disable actions; instead a warning is shown: "{System} is responding slowly. This may take longer than usual."
4. Disabled state is recomputed on health poll; recovery re-enables controls without a reload, announced politely: "eApp is available again. You can now resolve this issue."

**Acceptance criteria:**
- AC-1: With eApp down, the resolve action on SCR-16 is disabled with the specified reason.
- AC-2: Restoring eApp re-enables it within one poll without a reload.

---

### FR-F16-05 — Degraded-system warning presentation

**Processing / business rules:**
1. Wherever incomplete data is shown, a USWDS warning site-alert with `role="status"` names the affected application and quantifies what is missing:
   **"Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date."**
2. When the omitted count is unknown (no prior successful count), the copy omits the number rather than guessing: "Investigation Management is unavailable — some items are not shown."
3. Multiple affected systems are listed in one alert, each named and quantified — not a generic "some systems are unavailable."
4. The alert appears on: work queue, dashboard, search results, notifications, and related-items panels. It is per-screen and contextual, not a single global banner, so the user learns what is missing *here*.
5. The alert is announced once on first appearance via `role="status"` and is not re-announced on every poll.
6. Row-level `sourceHealth` badges mark items from `DEGRADED` sources with "Slow to respond."
7. On recovery, the alert is replaced by a polite announcement with a refresh control (`FR-F05-05` rule 6) rather than silently reordering content.

**Acceptance criteria:**
- AC-1: Degraded state is always visible and specific — the application is named and the gap quantified (NFR-10).
- AC-2: No screen silently omits data from a failed source.

---

### FR-F16-06 — Loading states

**Processing / business rules:**
1. Skeleton or spinner treatments at widget and section granularity, never whole-page blanking, so a slow source does not blank the page.
2. The loading region carries `aria-busy="true"` and a visually hidden "Loading {region name}" label; completion is announced once.
3. Skeletons preserve layout dimensions to prevent content shift when data arrives.
4. A region still loading after its configured timeout transitions to its error or degraded state — it never spins indefinitely.
5. Reduced-motion preference disables skeleton shimmer (`FR-F14-08`).

**Acceptance criteria:**
- AC-1: A forced-slow spoke produces a per-widget loading state, not a blank page.
- AC-2: No spinner persists past its timeout.

---

### FR-F16-07 — Empty states

**Processing / business rules:**
1. Every list, table, and widget has a designed empty state with a heading, an explanation of what would appear there, and an action where one exists.
2. Empty states are distinguished from degraded states: "You have no assigned work" is different from "We couldn't load your work." Conflating them would tell a user they have nothing to do when in fact the system is broken — the single most consequential empty-state error, and explicitly prohibited.
3. Empty-state copy is specified per screen in the owning requirement and consolidated in `Y2 §Empty state copy`.
4. The zero-item applicant persona (`FR-F17-06`) exists so empty states are demonstrable rather than theoretical.

**Acceptance criteria:**
- AC-1: Every list and widget has an implemented, designed empty state.
- AC-2: Empty and degraded states are never conflated, verified by test with a forced outage.

---

### FR-F16-08 — Error states

**Processing / business rules:**
1. Four distinct, recoverable presentations (`FR-F06-07`): authorization denial, validation failure, source unavailability, unexpected error.
2. Each carries a heading, plain-language explanation, a correlation ID, and at least one concrete next action.
3. Error copy never contains a stack trace, exception name, hostname, port, SQL, or spoke-internal identifier (`FR-F08a-06` rule 3).
4. Errors within a region (widget, panel) render inline and do not replace the page; errors at page scope render SCR-30/31/32 inside the shell.
5. Every error state includes a working exit: dashboard, work queue, or retry.

**Acceptance criteria:**
- AC-1: All four classes are reachable and render their designed states.
- AC-2: Automated scan finds zero prohibited content in error copy.

---

### FR-F16-09 — Integration issue recording

**Processing / business rules:**
1. Every `AdapterError` (except `ADAPTER_NOT_FOUND` and `ADAPTER_REJECTED`, which are business outcomes) writes one `integration_issues` row: `{ occurredAt, applicationId, operation, errorClass, spokeHttpStatus, responseExcerpt (≤1000 chars, escaped), attempt, circuitStateAtFailure, principalId, correlationId, adapterRequestId }`.
2. Health state transitions, circuit transitions, scope violations, normalization errors, orchestration incompletions, and audit-write failures also produce rows with their own classes.
3. Rows are append-only and surfaced on SCR-25 (`FR-F11-03`).
4. Recording an issue never blocks the user request; issue writing is best-effort and failures are logged, with the deliberate exception of audit writes, which are blocking (`FR-F13-01`).
5. Issues are correlated to audit records by `correlationId`, enabling navigation between them.

**Acceptance criteria:**
- AC-1: Each induced failure produces exactly one correctly attributed issue within one health-check interval (PRD F11 acceptance signal).
- AC-2: Issues link to audit chains sharing the correlation ID.

---

### FR-F16-10 — Global error boundary (SCR-32)

**Processing / business rules:**
1. A global boundary catches any unhandled client-side condition and renders SCR-32 **inside the shell**: heading "Something went wrong," plain explanation, correlation ID, and actions "Try again," "Go to my dashboard."
2. Server-side, any uncaught exception returns 500 with the standard envelope; no framework default error page is ever served.
3. SCR-32 carries the demo banner, sets a descriptive title, moves focus to the `<h1>`, and announces via `role="alert"`.
4. The boundary never produces a blank page, a raw stack trace, or a browser default error (NFR-09).
5. Errors caught by the boundary are reported to the server with their correlation ID so they appear in the integration log.

**Acceptance criteria:**
- AC-1: A deliberately thrown client error renders SCR-32 with working exits.
- AC-2: No route can produce a blank page or a stack trace, verified by fault-injection crawl.

---

### FR-F16-11 — Failure injection controls (SCR-38)

**Description:** Administrator-only, demo-scoped controls making degradation reproducible on demand rather than described.

**Inputs:** `POST /api/admin/failure-injection` with `{ applicationId, mode: NORMAL | UNAVAILABLE | SLOW | ERROR, slowMs?, errorRatePct?, durationSec? }`.

**Processing / business rules:**
1. Administrator-only (`ADMIN.FAILURE_INJECTION.*`), authorized and audited (`FAILURE_INJECTED`, `FAILURE_CLEARED`).
2. The hub forwards the setting to the target spoke's injection endpoint; the spoke honours it on its data endpoints and reflects it honestly at `/health` (`FR-F09-07` rule 7).
3. Modes:
   - `UNAVAILABLE` — connection refused or 503 on data endpoints
   - `SLOW(slowMs)` — artificial latency, used to demonstrate timeouts and `DEGRADED`
   - `ERROR(errorRatePct)` — a proportion of calls return 500
   - `NORMAL` — clears injection
4. `durationSec` auto-clears after the interval (default 300, max 1800), so a forgotten injection cannot silently break a later demo.
5. SCR-38 lists every application with its current injection state, controls to set each mode, a "Clear all" action, and a prominent notice: "Failure injection is a demonstration tool. Injected states affect all users of this environment."
6. Active injection is surfaced on SCR-24 and SCR-37 so no operator mistakes an injected outage for a real one.
7. Injection state is cleared by the reset command (`FR-F17-11`).

**Validation rules:** `slowMs` 100–30000; `errorRatePct` 1–100; `durationSec` 10–1800; `applicationId` must exist and be enabled.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Spoke will not accept injection | 502 | `INJECTION_FAILED` | "We couldn't change {name}'s simulated state. Check that it's running." |
| Invalid parameters | 400 | `VALIDATION_FAILED` | Field copy per bounds above. |

**Acceptance criteria:**
- AC-1: Forcing IM `UNAVAILABLE` produces the degraded queue, the dashboard notice, and the disabled actions — with no error page anywhere (SM-15).
- AC-2: Clearing injection restores normal behavior automatically (SM-17).
- AC-3: Every injection change is audited.

---

### FR-F16-12 — Automatic recovery

**Processing / business rules:**
1. When a spoke returns, the monitor detects it on the next probe, the circuit half-opens and closes on a successful probe, and the stored state becomes `HEALTHY`.
2. Client polling detects the change within 30 seconds, clears the degraded notice, re-enables affected actions, and announces politely with a refresh control.
3. Recovery requires **no user reload, no re-authentication, and no administrator action** (SM-17).
4. In-flight requests that failed during the outage are not auto-replayed — replaying a failed mutation without user knowledge would be unsafe. Reads may be re-fetched by the user's refresh action.
5. Partially completed orchestrations converge via their own retry queue (`FR-F07b-03`), independently of health polling.

**Acceptance criteria:**
- AC-1: Restoring a spoke clears the warning and restores data without reload or re-authentication (SM-17).
- AC-2: No failed mutation is silently replayed.

---
## F17 — Synthetic Seed Data Corpus

**Traces to:** PRD F17 (P0); NFR-12, SM-22, R-09, R-10. **Schema:** `Y0a`, `Y0b`.

**Description:** A realistic, internally consistent body of synthetic data spanning all five spoke systems plus the demo sixth, and all four roles — rich enough that every screen looks like a working system, and coherent enough that cross-system relationships (especially the flagship eApp↔PVQ link) are genuine rather than staged. **Every UI flow the demo exercises must have its precondition rows seeded**, including the edge states.

**Terminology:**
- **Persona** — a seeded identity used in the demo script.
- **Referential coherence** — the same `subjectRef` meaning the same synthetic person across namespaces, without any foreign key.
- **Edge state** — a seeded condition that exists specifically so a non-happy UI state is demonstrable (overdue, unassigned, zero-item, degraded).
- **Baseline** — the pristine seeded state the reset command restores.

---

### FR-F17-01 — Seed volume and distribution

**Description:** How much of each entity, calibrated so filtering, sorting, searching, and pagination are meaningful without making the demo slow.

| Namespace | Entity | Count | Notes |
|---|---|---|---|
| hub | identities (`users`) | 14 | 5 investigators, 3 adjudicators, 4 applicants, 2 administrators; one identity holds Investigator + Adjudicator |
| hub | registered applications | 5 | eApp, IEP, PVQ, PDT, IM. **CVS deliberately absent** (`FR-F12-06`) |
| hub | announcements | 4 | 2 active (different target roles), 1 scheduled, 1 expired |
| hub | audit events | ~120 | Pre-seeded history so the viewer, filters, and pagination are populated on first load |
| eapp | subjects | 22 | Shared `subjectRef` values with IEP, PVQ, PDT, IM |
| eapp | cases | 26 | Across all 7 case states; 6 assigned to the demo investigator |
| eapp | questionnaire sections / answers | 26 × 12 sections | Realistic section structure, obviously fictitious content |
| pvq | questionnaires | 20 | Linked by `subjectRef` |
| pvq | issues | 18 | 6 OPEN, 3 IN_REVIEW, 7 resolved (mixed dispositions), 2 REFERRED |
| iep | individuals | 22 | Matching `subjectRef` set |
| iep | status records | 22 | Across all 4 stages |
| iep | notices | 34 | Mixed read/unread |
| iep | tasks | 19 | 11 OPEN (4 overdue), 8 COMPLETE |
| pdt | positions | 24 | Across all 4 sensitivity levels |
| pdt | designations | 24 | 5 PENDING_REVIEW, 15 APPROVED, 4 RETURNED |
| im | investigations | 31 | Across all 5 statuses, all 3 priorities |
| im | assignments | 28 | Distributed across 5 investigators; 3 unassigned |
| im | leads | 62 | 2–3 per active investigation |
| cvs | alerts | 9 | Unregistered until the demo; 4 assignable to the demo investigator |

**Rules:**
1. The demo investigator's queue contains **28–34 items** across at least four source systems — enough for meaningful pagination at 25 per page, enough that filters visibly narrow, not so many that the page is slow.
2. Every enumerated status, priority, and state value in every spoke appears at least once, so every filter option returns results rather than an empty set. A filter that always returns nothing looks broken.
3. Volume targets are upper-bounded so `GET /api/work-items` completes within 2 seconds (NFR-17).

**Acceptance criteria:**
- AC-1: Every filter facet, for every role, returns at least one result on the default date range.
- AC-2: Pagination is exercised (>1 page) for the investigator queue, the audit viewer, and the admin inventory.

---

### FR-F17-02 — Personas and role/attribute coverage

**Description:** The identities the demo script uses, with the attributes that make ABAC observable.

> **Normative persona binding.** The four design personas in `PERSONAS-DCSA-UAL.md` (PER-01…PER-04) are seeded under **exactly these names**. One name per human, in every document and on every screen. The `PER-ID` column below is the binding; it is asserted by seed validation (`FR-F17-10`). Identities with no `PER-ID` are supporting cast that exist to make an authorization rule observable and are deliberately *not* design personas.

| Persona | PER-ID | Roles | Auth methods | Attributes | Purpose |
|---|---|---|---|---|---|
| **Marcus Vale** | **PER-01** | INVESTIGATOR | CAC/PIV, Generic MFA | org `DCSA-FIELD-OPS-EAST`, tier `T5`, region `REGION-NE`, 6 case assignments | **Primary flagship persona** |
| Harlan T. Boyce | — | INVESTIGATOR | CAC/PIV | org `DCSA-FIELD-OPS-EAST`, tier `T3`, region `REGION-NE`, 5 assignments | Unit-mate: demonstrates read-not-write (`ATTR-INV-02`) and the T3/T5 clearance denial (`ATTR-INV-03`) |
| Ingrid L. Vasterling | — | INVESTIGATOR | ECA only | org `DCSA-FIELD-OPS-WEST`, tier `T5`, region `REGION-SW`, 4 assignments | Demonstrates ECA as a distinct IdP pool and cross-org denial |
| Dana Okonkwo | **PER-02** | ADJUDICATOR | CAC/PIV | org `DCSA-FIELD-OPS-EAST`, tier `T5`, region `REGION-NE` | Adjudicator dashboard and different action set on the same item |
| Sofia K. Mendelbaum | — | INVESTIGATOR + ADJUDICATOR | CAC/PIV, Generic MFA | org `DCSA-FIELD-OPS-EAST`, tier `T5`, region `REGION-NE` | **Multi-role identity**: role switching without re-authentication |
| Theodore Q. Lansbury | — | APPLICANT | Generic MFA | subjectRef `SUBJ-00418` | Applicant with a full set: status, notices, tasks, and an eApp case |
| Renée Ashford | **PER-03** | APPLICANT | Generic MFA | subjectRef `SUBJ-00622` | Applicant with an `INFORMATION_REQUESTED` case — action-required path |
| Bartholomew N. Quigley | — | APPLICANT | ECA | subjectRef `SUBJ-00907` | **Zero-item applicant**: all empty states (`FR-F17-06`) |
| Priya Raghunathan | **PER-04** | ADMINISTRATOR | CAC/PIV | org `DCSA-HQ`, tier `T5`, region `NATIONAL` | **Primary admin persona**: console, registration, audit |

**Rules:**
1. Every role has at least one identity signing in via each of at least two methods, so all three auth paths are demonstrable across roles (PRD F0 acceptance signal).
2. The CAC/PIV and ECA pools are partially disjoint: Ingrid is ECA-only, Marcus and Priya are CAC/PIV-primary (`FR-F00-03`).
3. No identity holds both APPLICANT and a mission role (`FR-F00-05` rule 4).
4. **Dana Okonkwo (PER-02) holds ADJUDICATOR only.** She must not also hold INVESTIGATOR: the product's clearest live RBAC demonstration is that she can *view* `PVQ:ISS-2207` and cannot *resolve* it (`PERSONAS` PER-02 Access Scope). The dual-role identity is a separate, non-persona identity (Sofia K. Mendelbaum).
5. **The flagship subject is `SUBJ-00418` (Theodore Q. Lansbury)** — a non-persona applicant. `SUBJ-00622` (Renée Ashford, PER-03) additionally has **one eApp case and one IM assignment owned by Marcus Vale (PER-01)**, so the `PERSONAS` §Persona Relationships claim — *the applicant is the subject of the investigator's cases* — is literally true in the seed. Renée never sees that case's investigative content (`FR-F02-02`).
6. Names are fabricated. The four persona names are ordinary-looking by design — an evaluator must be able to say them aloud — and the supporting cast uses deliberately unusual composites. **No name is drawn from any real directory** (R-10), and no name is paired with a valid-format identifier (`FR-F17-08`).

**Acceptance criteria:**
- AC-1: Each persona signs in successfully by each of its listed methods.
- AC-2: The multi-role persona switches roles and observes different navigation and dashboards.
- AC-3: Seed validation asserts the PER-ID binding above, and fails startup if any of PER-01…PER-04 is missing or bound to more than one identity — a demo in which a persona document and a screen disagree on a name is not allowed to start.
- AC-4: Dana Okonkwo's roles are exactly `["ADJUDICATOR"]`, asserted by test, so the action-set contrast on `PVQ:ISS-2207` cannot silently regress.

---

### FR-F17-03 — The flagship workflow's seeded preconditions

**Description:** The exact rows the flagship demo depends on. These are named so a broken demo is diagnosable in seconds.

**Required baseline state:**
1. **eApp:** case `CASE-A-1042`, subject `SUBJ-00418` (Theodore Q. Lansbury), `caseState = UNDER_REVIEW`, `outstandingIssueCount = 1`, `outstandingIssueRefs = ["ISS-2207"]`, assigned to Marcus Vale, due in 4 days, with a populated `SECTION_13A` employment-history section containing at least two employer entries.
2. **PVQ:** issue `ISS-2207`, `status = OPEN`, `parentSystem = EAPP`, `parentCaseRef = CASE-A-1042`, `subjectRef = SUBJ-00418`, `answerLocus = SECTION_13A.employer[0].endDate`, `answerSectionLabel = "Section 13A — Employment history"`, `answerSnapshot` containing the fabricated answer text, raised 3 days ago.
3. **PDT:** a designation referencing `CASE-A-1042` so the related-items panel shows more than one relationship type.
4. **IM:** an assignment referencing `CASE-A-1042` assigned to Marcus, so the panel shows three relationship types and the cross-system story is not a single link.
5. **Hub:** Marcus's queue default view surfaces `EAPP:CASE-A-1042` on page 1 without filtering; the `ALERT-NEW-PVQ-ISSUE` rule fires for `ISS-2207` so the dashboard on-ramp is populated.
6. A **second** open PVQ issue on a different case exists, so the demo can be repeated on alternate data if `ISS-2207` has already been consumed mid-session.

**Validation rules (seed-time assertions, `FR-F17-10`):** every reference above resolves; the subject matches across eApp, PVQ, IEP, PDT, and IM; the issue is `OPEN`; the case count is exactly 1.

**Acceptance criteria:**
- AC-1: Seed validation fails loudly if any flagship precondition is missing.
- AC-2: The flagship workflow succeeds on a freshly seeded environment without manual setup.

---

### FR-F17-04 — Referential coherence across isolated namespaces

**Processing / business rules:**
1. `subjectRef` (format `SUBJ-#####`) identifies the same synthetic person in every namespace. There is **no** foreign key, no shared table, and no cross-namespace query — coherence is a property of the seed generator, not of the schema (NFR-08).
2. Case references (`CASE-X-####`) are generated by eApp and referenced opaquely by PVQ, PDT, and IM.
3. Issue references (`ISS-####`) are generated by PVQ and referenced opaquely by eApp.
4. Person display names are seeded identically per `subjectRef` in each namespace that displays them, so the same person does not appear under two names.
5. The generator emits a manifest of every cross-namespace reference; seed validation asserts every one resolves in its target namespace.
6. Deliberate negative coverage: **one** PVQ issue references a case that does not exist in eApp, so the `INTEGRATION_REFERENCE_MISMATCH` handling (`FR-F07a-01` rule 4) is demonstrable rather than theoretical. It is documented so it is not mistaken for a defect.

**Acceptance criteria:**
- AC-1: Every cross-namespace reference except the one intentional orphan resolves.
- AC-2: The intentional orphan renders the specified "couldn't be confirmed" state.

---

### FR-F17-05 — Deterministic seeding

**Processing / business rules:**
1. All generated values — identifiers, names, dates, statuses, narratives — derive from a fixed seed constant. The same seed produces byte-identical data every time.
2. Relative dates are computed from a **seed reference date** rather than from `now`, then offset so that "overdue by 6 days" stays overdue whenever the demo runs. Absolute stored dates are recomputed at seed time relative to the current date so the corpus never goes stale.
3. Sort order of seeded rows is deterministic, so the demo script's "the item is third in the list" expectations hold (SM-22).
4. The seed is applied automatically at startup (`FR-F18-03`).
5. The seed constant and reference date are documented.

**Acceptance criteria:**
- AC-1: Two fresh seeds produce identical data, verified by content hash.
- AC-2: Overdue items remain overdue regardless of the date the demo runs.

---

### FR-F17-06 — Edge-state coverage

**Description:** Every non-happy UI state must have seeded preconditions. A designed empty state that cannot be reached is not demonstrable.

| Edge state | Seeded precondition | Demonstrates |
|---|---|---|
| Overdue items | 4 IM investigations and 4 IEP tasks past due | Overdue sorting, `ALERT-OVERDUE`, non-color indication |
| Items with no assignee | 3 IM investigations with `assigneeId = null` | `assignee=unassigned` filter, "Unassigned" rendering |
| Unresolvable assignee | 1 IM investigation assigned to a native identity with no hub mapping | "Assigned to someone we can't resolve" vs "unassigned" (`FR-F05-02`) |
| Items with no due date | 5 PDT designations (PDT has no due dates) | Nulls-last sorting, "No due date" rendering |
| No native priority | All PDT items | "Priority not provided by PDT" affordance |
| Zero-item applicant | Bartholomew N. Quigley: no tasks, no notices, no case | Every applicant empty state |
| Applicant with action required | Renée Ashford: case in `INFORMATION_REQUESTED` | `ALERT-ACTION-REQUIRED`, applicant action path |
| Already-resolved issue | 7 resolved PVQ issues | "Already resolved" disabled state (`FR-F07a-03`) |
| Referred issue | 2 PVQ issues in `REFERRED` | Non-clearing disposition path (`FR-F07a-04`) |
| Cross-org denial | Ingrid's `REGION-SW` cases vs Marcus's `REGION-NE` | `ATTR-INV-01` denial |
| Clearance-tier denial | 2 eApp cases at `T5` sensitivity; Harlan is `T3` | `ATTR-INV-03` denial |
| Read-not-write | Harlan's items visible to Marcus as unit-mate | `ATTR-INV-02` disabled action with reason |
| Stalled item | 3 IM investigations with `lastActivityAt` >14 days | `ALERT-STALLED` |
| Blocked item | 2 items in `statusCategory = BLOCKED` | `ALERT-BLOCKED` |
| Degraded spoke | Not seeded — produced by failure injection (`FR-F16-11`) | Degraded queue, disabled actions |
| Expired announcement | 1 expired, 1 scheduled | Announcement state filtering |
| Truncation | Optional high-volume seed profile (`--profile=large`, 400 IM items) | `truncated` disclosure (`FR-F05-04`) |
| Audit chain | ~120 pre-seeded audit events including 2 complete correlated chains | Populated viewer and chain view on first load |

**Acceptance criteria:**
- AC-1: Every row above is reachable in a freshly seeded environment.
- AC-2: The demo script references each edge state it exercises by persona and item.

---

### FR-F17-07 — Per-persona screen coverage matrix

**Description:** The assertion that no screen is empty for the persona intended to use it.

**Processing / business rules:** Seed validation asserts, for each persona, that every screen reachable by their role renders populated content (or its intended empty state):

| Persona | Screens that must be populated |
|---|---|
| Marcus (Investigator) | SCR-09, 13, 14, 15, 16, 17, 19, 21, 33 (own), 35 |
| Dana (Adjudicator) | SCR-10, 13, 14, 15, 17, 19, 21, 33 (own), 35 |
| Theodore (Applicant) | SCR-11, 13, 14, 15 (redacted), 18, 21, 33 (own) |
| Bartholomew (Applicant, zero-item) | SCR-11, 13, 18, 21 — all in **designed empty states** |
| Priya (Administrator) | SCR-12, 22, 23, 24, 25, 26, 27, 29, 33, 34, 37, 38 |

**Acceptance criteria:**
- AC-1: Signing in as each persona produces a fully populated (or intentionally empty) experience across every reachable screen — no accidental empty widget (PRD F4 acceptance signal).
- AC-2: The matrix is asserted by automated test, not by inspection.

---

### FR-F17-08 — Obviously synthetic content

**Processing / business rules:**
1. Names are fabricated composites, deliberately unusual, and drawn from no real directory.
2. Addresses use fictional street names in real-but-generic cities, with ZIP codes reserved as invalid by construction (`00000`–`00099`).
3. Identifiers are invalid by construction: SSN-shaped values use `900-00-####` (a range never issued); phone numbers use `555-01##`; email addresses use `@example.invalid`.
4. Dates of birth are plausible but generated; no real person's identifying combination is reproducible.
5. **Every record carries `syntheticMarker: "DEMO-SYNTHETIC"`**, every API response carries `"_synthetic": true`, and every detail screen displays "Synthetic record — demo data" in its summary header (`FR-F06-02`).
6. Narrative text is clearly fictitious and free of anything resembling real case content.
7. Seed provenance is documented: how data was generated, what it is, and the explicit assertion that it derives from no real source (NFR-12).

**Acceptance criteria:**
- AC-1: No seeded value passes a real-format validity check for SSN, phone, email domain, or ZIP.
- AC-2: 100% of records carry the synthetic marker.
- AC-3: Provenance documentation exists and is linked from the accessibility/about surface.

---

### FR-F17-09 — Seed data documentation

**Processing / business rules:**
1. A document describes: every persona with sign-in instructions, what each persona sees, the flagship workflow's exact preconditions (`FR-F17-03`), every edge state and how to reach it, and the records the demo script depends on.
2. It is linked from the README (`FR-F18-04`) and from SCR-37.
3. It states the seed constant and reference date, and how to regenerate.

**Acceptance criteria:**
- AC-1: A demo operator can identify the right persona and item for any demo path from this document alone.

---

### FR-F17-10 — Seed validation

**Processing / business rules:**
1. After seeding, a validator asserts: all cross-namespace references resolve (except the one documented orphan); every flagship precondition holds; **each of PER-01…PER-04 resolves to exactly one seeded identity under the name given in `FR-F17-02`**; every persona has ≥1 role and complete attributes; **Dana Okonkwo holds ADJUDICATOR only**; every filter facet returns ≥1 row per role; every edge state exists; every persona's screen coverage matrix is satisfied.
2. Validation failure **fails startup** with a specific, actionable message naming the missing precondition — a demo starting on broken data is worse than one that refuses to start.
3. The validator runs in CI on every build.

**Error handling:**

| Scenario | Behavior | Message |
|---|---|---|
| Flagship precondition missing | Startup fails | "Seed validation failed: PVQ issue ISS-2207 is not in OPEN state. The flagship demo will not work. Run `reset` to restore baseline." |
| Broken cross-reference | Startup fails | "Seed validation failed: PVQ issue {id} references eApp case {ref}, which does not exist." |
| Persona binding broken | Startup fails | "Seed validation failed: PER-02 is not bound to exactly one identity named 'Dana Okonkwo'. The persona documents and the screens will disagree in front of a reviewer." |
| Empty facet | Warning | "Seed warning: filter value {facet}={value} returns no rows for role {role}." |

**Acceptance criteria:**
- AC-1: Corrupting a flagship precondition causes startup to fail with the specific message.
- AC-2: Validation runs in CI.

---

### FR-F17-11 — Reset to baseline

**Processing / business rules:**
1. A single documented command (`FR-F18-03`) restores the hub and all six namespaces to pristine baseline: re-seeds all data, **de-registers CVS**, clears failure injection, clears sessions, clears alert read state and announcement dismissals, and clears orchestration transactions and retry queues.
2. Audit events are restored to the pre-seeded baseline set. Reset is a full rebuild, not a deletion of audit rows — preserving the "no delete path exists" property (`FR-F13-03` rule 7).
3. Reset completes in under 30 seconds so it can be run between demo passes.
4. Reset writes a `DEMO_RESET_PERFORMED` record into the newly seeded audit baseline, so the reset itself is visible.
5. After reset, the flagship workflow runs identically (SM-22).
6. Reset is invocable from the command line and from SCR-37 by an administrator, with typed confirmation and a warning: "This restores all demo data to its starting state and signs out all users."

**Acceptance criteria:**
- AC-1: The flagship workflow runs 3 consecutive times with a reset between each, identical result each time (SM-22).
- AC-2: After reset, CVS is unregistered and the registration demo repeats.
- AC-3: Reset completes in under 30 seconds.

---
## F18 — Demo Operability: Single-Command Run and Scripted Demonstration Path

**Traces to:** PRD F18 (P0 — deliverability constraint); NFR-18, SM-21, SM-22, R-08. **Screens:** SCR-37 demo operations / service status.

**Description:** The prototype must build, run, and be demonstrated from a single documented command sequence, with scripted paths that drive the flagship workflow reliably. A prototype nobody can start is a prototype that scored zero.

**Terminology:**
- **Pre-flight** — the environment check run before startup.
- **Demo script** — a numbered, deterministic click sequence with expected observable state at each step.
- **Operator** — the person running the demo, who may not be the person who built it.

---

### FR-F18-01 — Single startup command

**Processing / business rules:**
1. One documented command brings up, from a clean checkout on a clean machine: the hub API, the web UI, all five spoke services, the CVS sixth service (running, unregistered), all seven data namespaces, and the seeded data.
2. The command is idempotent: running it on an already-running environment reports current state rather than erroring or duplicating.
3. Startup is ordered: databases → namespace migrations → seed → spoke services → hub → UI, with the hub waiting for spoke health (bounded, 60 s) before declaring ready. A spoke that fails to start does **not** block hub startup — it starts `DOWN`, which is exactly the degraded state the product is designed to handle.
4. On completion the command prints: the UI URL, the hub API URL, every spoke's URL and port, the four demo persona sign-ins, the reset command, and the shutdown command.
5. Total time from command to signed-in-ready is under 10 minutes on a clean machine including image pulls (SM-21).
6. Ports are configurable via a single environment file so a port clash is resolvable without editing code.

**Error handling:**

| Scenario | Behavior | Operator message |
|---|---|---|
| Port in use | Pre-flight fails before starting | "Port {n} is already in use by another process. Stop it, or change {VAR} in .env and try again." |
| Missing prerequisite | Pre-flight fails | "{Tool} {version} or later is required. Found: {found}. Install it and try again." |
| Insufficient resources | Pre-flight warns | "This environment has {n} GB of memory available. At least {m} GB is recommended." |
| Spoke failed to start | Startup continues | "{Service} didn't start. The application will run with {Service} unavailable — you'll see a degraded warning. Check logs with {command}." |

**Acceptance criteria:**
- AC-1: A reviewer with no prior exposure reaches a signed-in dashboard in under 10 minutes following the README (SM-21, PRD F18 acceptance signal).
- AC-2: The command is verified on a clean machine before the demo (NFR-18).

---

### FR-F18-02 — Per-service control

**Processing / business rules:**
1. Each of the seven services (hub, UI, five spokes, CVS) is independently startable, stoppable, and restartable by documented command — because "what happens when IM is down" must be a real experiment, not a simulation of one.
2. Stopping a spoke produces genuine unavailability at the network level, distinct from failure injection (`FR-F16-11`), which simulates it inside a running service. Both paths are documented, and the demo script says which to use when: stopping the process is the more convincing demonstration; injection is the safer one mid-demo because it auto-clears.
3. Logs are viewable per service by documented command.
4. Restarting a spoke requires no hub restart and no user re-authentication (SM-17).

**Acceptance criteria:**
- AC-1: Stopping any single spoke leaves the hub and remaining services fully functional (PRD F9 acceptance signal).
- AC-2: Restarting it restores full function automatically.

---

### FR-F18-03 — Pre-flight checks, seeding, and reset

**Processing / business rules:**
1. Pre-flight verifies: required tool versions, port availability for all seven services, available disk and memory, and network access for image pulls. Each failure reports what is wrong and what to do — never a bare exit code.
2. The deterministic seed (`FR-F17-05`) is applied automatically on first startup, and seed validation (`FR-F17-10`) runs immediately after. Validation failure fails startup with a specific message.
3. The `reset` command (`FR-F17-11`) restores baseline in under 30 seconds and is runnable mid-demo without a restart.
4. Reset prints a confirmation listing what was restored, including "CVS de-registered" and "Failure injection cleared," so the operator knows the environment is demo-ready.

**Acceptance criteria:**
- AC-1: Pre-flight catches a port clash and a missing prerequisite with actionable messages.
- AC-2: Reset restores baseline in under 30 seconds and validation passes afterwards.

---

### FR-F18-04 — README

**Processing / business rules:** The README covers, in this order:
1. What this is, and the synthetic-data statement.
2. Prerequisites with versions.
3. The single start command.
4. The UI URL.
5. The four demo personas: name, role, sign-in method, and exactly what to click to sign in as each.
6. The flagship demo script pointer (`FR-F18-05`).
7. The reset command.
8. The shutdown command.
9. Troubleshooting for the three likeliest failures (`FR-F18-09`).
10. Per-service URLs and ports, for direct spoke queries (`FR-F09-08`).

**Rules:** the README is verified by a fresh-machine dry run before the demo, and the verification date is recorded in it. A README that has not been tested on a clean machine is an untested deliverable.

**Acceptance criteria:**
- AC-1: A reviewer following only the README reaches a signed-in dashboard (SM-21).
- AC-2: The dry-run date is present and recent.

---

### FR-F18-05 — Flagship demo script (F7)

**Description:** The numbered, deterministic path that drives the product's most important feature.

**Processing / business rules:** The script specifies, per step: the action, the exact control to activate, and the **expected observable state**.

| # | Action | Expected observable state |
|---|---|---|
| 0 | Run `reset` | "Baseline restored. CVS de-registered. Failure injection cleared." |
| 1 | Open the UI | SCR-01 with three methods and the demo banner |
| 2 | Sign in as Marcus Vale via CAC/PIV | SCR-02 lists synthetic certificates; selecting Marcus lands on SCR-09 |
| 3 | Observe the dashboard | "Newly raised PVQ issues" widget shows the ISS-2207 alert; assigned work shows ≥4 source systems |
| 4 | Open the work queue | SCR-13, 28–34 items, chips showing the default filter, items from eApp, PVQ, PDT, IM |
| 5 | Open eApp Case A-1042 | SCR-15; header shows "1 outstanding issue"; breadcrumb `Work Queue › eApp Case A-1042` |
| 6 | Observe the related items panel | PVQ issue ISS-2207 labelled "Issue raised against Section 13A — Employment history", plus PDT and IM relationships |
| 7 | Open the related PVQ issue | SCR-16 inside the same shell; breadcrumb adds `› Related PVQ Issue ISS-2207`; no login prompt; case context strip present |
| 8 | Review the quoted answer | Section 13A question, answer snapshot, and section label displayed |
| 9 | Resolve: disposition `SUBSTANTIATED`, narrative, confirm checkbox | Action panel shows "This updates PVQ and eApp" before submission |
| 10 | Submit | SCR-20: "Resolution complete"; per-system table shows PVQ `Resolved — Substantiated` and eApp `No outstanding issues`, each from a fresh read |
| 11 | Return to eApp Case A-1042 | SCR-15 shows "No outstanding issues"; case state `Review complete — pending adjudication` |
| 12 | Verify independently | `curl` the PVQ and eApp APIs directly (`FR-F09-08`); both show the updated state (SM-03) |
| 13 | Open the audit chain | SCR-34 shows one correlated chain of ≥5 records with the summary line naming both systems (SM-20) |
| 14 | Confirm continuity | Header shows one sign-in; `authEventCount == 1`; no identifier was typed at any step (SM-02, SM-04) |

**Rules:**
1. The script states the starting persona, the reset precondition, and a fallback item (the second seeded open issue, `FR-F17-03` rule 6) if the primary has been consumed.
2. It is completable by a reviewer in under 3 minutes (PRD F7 acceptance signal).
3. It is rehearsed as part of pre-demo verification and matches the automated E2E test's path exactly, so a passing test means a working demo.

**Acceptance criteria:**
- AC-1: A reviewer completes the script unaided in under 3 minutes.
- AC-2: Each step's expected state matches actual behavior on a freshly reset environment.

---

### FR-F18-06 — Secondary demo scripts

**Processing / business rules:** Four additional scripts, each with the same step/expected-state structure:

1. **RBAC enforcement.** Open the same item as Marcus (Investigator) and Dana (Adjudicator) and observe different available actions; attempt a direct API call to an Investigator-only endpoint as Theodore (Applicant) and observe the server-side denial; show the denial in the audit viewer (SM-18). Includes the cross-org and clearance-tier denials using Ingrid and Harlan.
2. **Degraded-system behavior.** Force IM `UNAVAILABLE` from SCR-38; observe the queue rendering the other four sources with the named, quantified warning; observe the dashboard notice and the disabled action; clear injection; observe automatic recovery with no reload (SM-15, SM-16, SM-17).
3. **Sixth-application registration.** As Priya, register CVS through SCR-28 including the live connection test; then, in a second browser as the already-signed-in Marcus, observe CVS items appearing in the queue within one poll — with zero code changes and zero restarts (SM-11, SM-12).
4. **Audit chain review.** Filter the audit viewer by correlation ID; open the chain view; export the filtered view; show the integrity indicator (SM-20).

**Additional rule:** an **operator token** command (`FR-F09-08`) issues a short-lived assertion so a reviewer can `curl` spoke APIs directly during scripts 1 and 3.

**Acceptance criteria:**
- AC-1: All four scripts run successfully on a freshly reset environment.
- AC-2: Each script names its starting persona and reset precondition.

---

### FR-F18-07 — Service status page (SCR-37)

**Processing / business rules:**
1. Lists every service — hub, UI, five spokes, CVS — with: running state, version, health, latency, port, current failure-injection state, and namespace row counts.
2. A "Demo readiness" summary at the top: green/amber/red with text, checking that all services are up, seed validation passed, CVS is unregistered, and no failure injection is active. This is the single check an operator runs before presenting.
3. Actions: "Run reset" (typed confirmation), "Clear all failure injection," "Re-run seed validation," "Issue operator token."
4. Administrator-only, authorized and audited.
5. It answers, in one glance, "is this environment ready to demo" — which is the question that actually matters at 9:58 before a 10:00 demo.

**Error handling:**

| Scenario | Display | Message |
|---|---|---|
| A service is down | Red | "{Service} isn't running. Start it with {command} before demonstrating." |
| Seed validation failed | Red | "Seed validation failed: {reason}. Run reset before demonstrating." |
| CVS already registered | Amber | "CVS is already registered. Run reset to restore the registration demo." |
| Failure injection active | Amber | "{Service} is in a simulated {mode} state. Clear it before demonstrating unless this is intentional." |

**Acceptance criteria:**
- AC-1: The readiness summary correctly reports amber when CVS is registered or injection is active.
- AC-2: All four actions work from the page.

---

### FR-F18-08 — Clean shutdown

**Processing / business rules:**
1. A single documented command stops all seven services and releases all ports, with no orphaned processes.
2. Shutdown is graceful: in-flight requests complete or are cancelled within 10 seconds.
3. A `--purge` variant additionally removes data volumes, returning the machine to pre-run state.
4. The command reports what was stopped and confirms ports are released.

**Acceptance criteria:**
- AC-1: After shutdown, no process holds any of the configured ports.
- AC-2: A subsequent start command succeeds without manual cleanup.

---

### FR-F18-09 — Documented troubleshooting

**Processing / business rules:** The three likeliest demo-day failures, each with symptom, cause, and fix:

1. **Port already in use.** Symptom: pre-flight fails naming the port. Fix: stop the conflicting process, or change the port in `.env` and restart.
2. **A spoke didn't start.** Symptom: degraded warning naming a system; SCR-37 shows it red. Fix: check that service's log, restart just that service; the rest of the demo continues meanwhile — and the degraded state is itself demonstrable, which is worth saying out loud.
3. **Seed state consumed mid-demo.** Symptom: the flagship issue is already resolved; SCR-16 shows "already resolved." Fix: run `reset` (under 30 s), or use the documented fallback issue.

Plus two more that cost little to document: stale browser session after a reset (fix: sign out and back in), and CVS already registered from a prior run (fix: reset, or de-register from SCR-23).

**Acceptance criteria:**
- AC-1: Each documented symptom is reproducible and each documented fix resolves it.
- AC-2: Troubleshooting is in the README, not only in a separate document.

---
## F19 — Automated Test and Accessibility Verification Suite

**Traces to:** PRD F19 (P1); NFR-01, NFR-04, NFR-06, NFR-07, NFR-14, SM-05, SM-06, SM-07, SM-18, SM-19, SM-25. **Screens:** none (CI surface), plus the reviewer-readable report.

**Description:** Automated coverage for the three things whose failure would invalidate the demonstration — the flagship workflow, RBAC enforcement, and adapter behavior — plus automated accessibility scanning across every route. Each requirement below names what is asserted, so "we have tests" is replaced by "these specific claims are protected."

**Terminology:**
- **E2E** — a browser-driven test exercising the real UI against real services.
- **Negative path** — a test asserting that a forbidden thing is refused.
- **Control-integrity crawl** — the automated form of "every button works."

---

### FR-F19-01 — Flagship workflow end-to-end test

**Processing / business rules:**
1. Drives the full browser path of `FR-F18-05` steps 1–13 against a freshly reset environment.
2. Asserts all ten continuity properties in `FR-F07a-06`, specifically:
   - exactly one `AUTH_SUCCESS` audit record for the session (SM-02)
   - zero document requests to any spoke origin
   - zero login forms after initial sign-in
   - zero identifiers typed by the test beyond the narrative text (SM-04)
   - post-state asserted in **both** eApp and PVQ via their own APIs, not through the hub (SM-03)
   - one correlated audit chain of ≥5 records (SM-20)
   - the demo banner present on every screen visited
   - zero serious or critical accessibility violations on SCR-13, 15, 16, 20
3. Asserts every post-condition in `FR-F07b-05` field by field.
4. Runs the partial-failure variant: with eApp injected `UNAVAILABLE` after the PVQ leg, asserts 207 `ORCHESTRATION_PARTIAL`, the absence of the word "success" in the response and rendered page, the presence of both per-system outcomes, and automatic convergence after recovery.
5. Runs three consecutive times with a reset between, asserting identical results (SM-22).

**Acceptance criteria:**
- AC-1: The test passes in CI and fails on any regression to any asserted property.
- AC-2: The partial-failure variant passes.

---

### FR-F19-02 — RBAC enforcement tests

**Processing / business rules:**
1. **Matrix coverage.** For each of the four roles, every action in `FR-F02-02` is exercised: permitted actions succeed, non-permitted actions return 403. This is a generated test from the role matrix, so adding a permission without a test is impossible.
2. **Direct API negative paths**, bypassing the UI entirely:
   - Applicant calling an Investigator-only endpoint → 403, audited (PRD F2 acceptance signal, SM-18)
   - Investigator requesting another unit's resource → 403
   - `T3` investigator requesting a `T5` case → 403 with `ATTR-INV-03` in the audit record
   - Applicant requesting another subject's item by ID → 403, byte-identical to a fabricated ID
   - Administrator requesting a work item → 403
   - Any request supplying `role`/`activeRole`/`principalId` in body or query → 400, no privilege effect
   - Mutating request without CSRF token → 403
   - Request with an edited session cookie → 401
3. **Non-enumeration.** Forbidden-ID and fabricated-ID responses compared byte-for-byte apart from the correlation ID, and response times compared against the normalization floor.
4. **Action-level.** Posting an action absent from the server-computed list → 403; posting with a stale `stateVersion` → 409.
5. **Spoke-level scope.** Calling each spoke's API directly with `mode: SUBJECT` for subject A returns zero rows for subject B (`FR-F02-04` AC-1).
6. **Denial auditing.** Every denial above produces exactly one `AUTHZ_DENIED` audit record with the correct `policyRuleId`.

**Acceptance criteria:**
- AC-1: 100% of endpoints have at least one unauthorized-access negative test (PRD F10 acceptance signal, SM-18).
- AC-2: All denials are audited and non-enumerable.

---

### FR-F19-03 — Adapter conformance and behavior tests

**Processing / business rules:**
1. Runs the full conformance suite (`FR-F08a-08`) against all six adapters.
2. **Timeout behavior:** with a spoke injected `SLOW` beyond its timeout, the adapter aborts at the deadline and the aggregate request still returns within budget.
3. **Retry behavior:** a transient failure on an idempotent read is retried per policy; a `performAction` timeout is **never** retried; retries respect the deadline.
4. **Circuit behavior:** `circuitFailureThreshold` consecutive failures open the circuit; data calls then fail fast without touching the spoke; health probing continues; a successful probe closes it.
5. **Normalization:** every native status maps to exactly one category; malformed items are dropped individually with an issue logged, and the batch still renders.
6. **Error taxonomy:** each class in `FR-F08a-06` is induced and asserted to produce its specified hub status, code, and user-facing message.
7. **Idempotency:** repeated `performAction` with one key applies once, at both hub and spoke.
8. **Isolation:** each spoke's credentials cannot read another namespace; no spoke-to-spoke traffic occurs (SM-13).
9. **Registry independence:** the hard-coded-application-name grep check (`FR-F08b-02` rule 1) passes.

**Acceptance criteria:**
- AC-1: All six adapters pass conformance.
- AC-2: Every error class is covered.
- AC-3: Isolation assertions pass.

---

### FR-F19-04 — Resilience tests

**Processing / business rules:**
1. For **each** of the five spokes in turn, forced offline: the queue and dashboard render partial results with a named, quantified degraded warning, and **no error page appears anywhere in the application** (NFR-09, SM-15, SM-16).
2. A fault-injection crawl visits every route for every role with one spoke down and asserts: HTTP 200 or a designed error screen, a non-empty `<main>`, the demo banner present, and zero uncaught client errors.
3. All-sources-down: the queue returns 200 with the all-unavailable empty state, never a 500.
4. Recovery: restoring each spoke clears the warning and restores data within 30 seconds without reload or re-authentication (SM-17).
5. Action pre-disabling: with a target system down, the relevant action is disabled with its reason, and posting it anyway is refused.
6. Global error boundary: an injected client-side exception renders SCR-32 inside the shell with working exits.

**Acceptance criteria:**
- AC-1: All five single-spoke outage scenarios pass with zero error pages.
- AC-2: The recovery assertion passes for each spoke.

---

### FR-F19-05 — Audit coverage and immutability tests

**Processing / business rules:**
1. **Coverage:** every mutating endpoint is invoked and asserted to produce exactly one audit record of the expected action type (SM-19). The endpoint list is derived from the route table, so a new mutating endpoint without an audit assertion fails the build.
2. **Ordering:** the audit record exists before the success response is observable — asserted by failing the audit store and confirming the mutation reports failure (`FR-F13-01`).
3. **Immutability:** route enumeration finds no PUT/PATCH/DELETE under `/api/audit`; static analysis finds no UPDATE/DELETE statement against `audit_events`; a direct attempt using the application credential is refused by the database grant (NFR-07).
4. **Integrity:** the hash chain verifies across a full demo run; manually altering a row causes verification to fail at that sequence number.
5. **Sequence:** no gaps across a full run.
6. **Correlation:** the flagship chain assertion (`FR-F19-01`).
7. **Scoping:** a mission user's audit query returns zero records authored by another actor.

**Acceptance criteria:**
- AC-1: 100% of mutating endpoints produce exactly one record (SM-19).
- AC-2: No application path can modify or delete a record (NFR-07).

---

### FR-F19-06 — Automated accessibility scan

**Processing / business rules:**
1. axe-core (or equivalent) runs against **every route, for every role**, in CI.
2. Coverage includes non-default states: error screens (SCR-30, 31, 32), empty states (via the zero-item applicant), degraded states (via failure injection), loading states, open modals, and forms in their error state. Scanning only happy paths would miss precisely the screens most likely to be built carelessly.
3. The build **fails** on any serious or critical violation (SM-07, NFR-01). Moderate and minor violations are reported and tracked with owners.
4. Scan results are published as a reviewer-readable report (`FR-F19-09`).
5. The scan runs on every pull request, not only on main — accessibility regressions are cheapest to fix before merge.

**Acceptance criteria:**
- AC-1: Zero serious or critical violations across all routes and roles (SM-07).
- AC-2: Non-default states are included in coverage.

---

### FR-F19-07 — Keyboard navigation smoke test

**Processing / business rules:**
1. For each role, tabs through every route asserting: every interactive control is reachable, focus is always visible (computed outline or equivalent present), tab order matches DOM order, and no keyboard trap exists.
2. Modals: focus is trapped while open, Escape closes, focus returns to the invoking control.
3. Forms: submitting invalid input moves focus to the error summary and its links focus their fields.
4. Skip link: present, first focusable, and moves focus to `<main>` on every route.
5. The flagship workflow is driven keyboard-only end to end (SM-08).

**Acceptance criteria:**
- AC-1: The keyboard-only flagship run passes.
- AC-2: Zero unreachable primary controls and zero traps.

---

### FR-F19-08 — Link and control integrity crawl

**Description:** The automated form of "every button works" — the mechanical guarantee behind SM-05 and SM-06.

**Processing / business rules:**
1. For each role, crawls every navigation item and every route in the screen inventory (`FR-F03-02`) asserting: HTTP 200 or a designed error screen, a non-empty `<main>`, a unique page `<title>`, exactly one `<h1>`, and the demo banner present (NFR-13, SM-10).
2. Enumerates every interactive control on every route and asserts each has a handler, a destination, or a documented disabled reason. A control that does nothing fails the build (SM-06).
3. Asserts zero links to non-hub origins in authenticated screens (`FR-F01-03`).
4. Asserts the demo banner has no close control and is not removed from the accessibility tree, **evaluating accessible text rather than visible text** so the permitted <640px lede truncation (`FR-F03-03` rule 3a) cannot fail a conformant build — run at 320px, 768px and 1280px, including with an `EMERGENCY` announcement active and a modal open (`FR-F15-05`). Additionally asserts the ≤ `units(15)` chrome budget at 320×568 and that SCR-11's status sentence is above the fold (SM-25).
5. Scans user-facing copy on every route for prohibited content: stack-trace patterns, exception class names, hostnames, ports, SQL fragments, and the prohibited authentication verbs (`FR-F00-08`).
6. Asserts every `entitlements.navigation[].href` resolves (SM-05).

**Acceptance criteria:**
- AC-1: 100% of navigation items for all four roles resolve to a real populated page (SM-05).
- AC-2: Zero dead links, placeholder screens, or non-functional controls (SM-06, NFR-14).
- AC-3: Zero prohibited copy findings.

---

### FR-F19-09 — Reviewer-readable results summary

**Processing / business rules:**
1. CI produces a human-readable summary, not only a log: pass/fail per suite, counts, and — critically — the mapping from each success metric (SM-01 through SM-22) to the test that verifies it and its current status.
2. The summary names the three protected claims explicitly: flagship workflow, RBAC enforcement, adapter behavior — plus accessibility.
3. Accessibility results list violations by severity with route and rule.
4. The summary is committed as an artifact so a reviewer can read it without running anything.
5. A traceability table maps every FRD requirement ID to its verifying test(s), and flags requirements with no test.

**Acceptance criteria:**
- AC-1: Every success metric maps to a named test with a current status.
- AC-2: Requirements without test coverage are visibly flagged rather than silently uncovered.

---

### FR-F19-10 — Test environment and determinism

**Processing / business rules:**
1. Tests run against the same deterministic seed as the demo (`FR-F17-05`), with a reset between suites, so a test failure means a real defect rather than data drift.
2. Failure injection is used for resilience tests rather than stopping processes, so suites stay parallelizable; the process-stop path is exercised by one dedicated test per spoke.
3. Tests never depend on wall-clock "now" for overdue assertions; they use the seed reference date (`FR-F17-05` rule 2).
4. Flaky tests are quarantined and fixed rather than retried into passing — a retried-until-green suite protects nothing.

**Acceptance criteria:**
- AC-1: The suite produces identical results across three consecutive runs.
- AC-2: No test depends on the current date.

---
## Y0a — Database Schema: Hub Namespace

**Namespace:** `hub`. **Owned by:** the unified application layer only. **Accessible by:** the hub service credential only. No spoke service has any grant on this namespace, and this namespace has no grant on any spoke namespace (`FR-F09-01`, NFR-08).

DDL below is logical: it specifies entities, fields, keys, constraints, and isolation boundaries. The physical engine is a TechArch decision. Types are written in ANSI-ish SQL for clarity.

---

### Isolation statement

```sql
-- Seven independent namespaces, each with its own credential.
-- Grants are the enforcement mechanism; convention is not.
CREATE SCHEMA hub;   -- hub service only
CREATE SCHEMA eapp;  -- eApp service only
CREATE SCHEMA iep;   -- IEP service only
CREATE SCHEMA pvq;   -- PVQ service only
CREATE SCHEMA pdt;   -- PDT service only
CREATE SCHEMA im;    -- IM service only
CREATE SCHEMA cvs;   -- Continuous Vetting Service only

GRANT USAGE ON SCHEMA hub TO hub_service;
REVOKE ALL ON SCHEMA hub FROM eapp_service, iep_service, pvq_service,
                              pdt_service, im_service, cvs_service;
-- and symmetrically for each spoke schema.
-- NO table appears in more than one schema. NO cross-schema foreign key exists.
```

---

### Identity and session

```sql
CREATE TABLE hub.users (
  principal_id        VARCHAR(26)  PRIMARY KEY,           -- ULID
  display_name        VARCHAR(120) NOT NULL,
  subject_ref         VARCHAR(32)  NULL,                  -- non-null only for APPLICANT (FR-F00-05)
  organization        VARCHAR(64)  NOT NULL,
  clearance_tier      VARCHAR(4)   NOT NULL CHECK (clearance_tier IN ('T1','T3','T5')),
  assigned_region     VARCHAR(32)  NOT NULL,
  enabled             BOOLEAN      NOT NULL DEFAULT TRUE,
  synthetic_marker    VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  created_at          TIMESTAMPTZ  NOT NULL,
  last_activity_at    TIMESTAMPTZ  NULL
);

CREATE TABLE hub.roles (
  role_id     VARCHAR(16) PRIMARY KEY,   -- INVESTIGATOR | ADJUDICATOR | APPLICANT | ADMINISTRATOR
  label       VARCHAR(64) NOT NULL,
  description VARCHAR(500) NOT NULL
);

CREATE TABLE hub.user_roles (
  principal_id VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  role_id      VARCHAR(16) NOT NULL REFERENCES hub.roles(role_id),
  assigned_at  TIMESTAMPTZ NOT NULL,
  assigned_by  VARCHAR(26) NULL,
  PRIMARY KEY (principal_id, role_id)
);

CREATE TABLE hub.user_case_assignments (          -- attribute input for ATTR-INV-01/02
  principal_id   VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  source_system  VARCHAR(16) NOT NULL,            -- registry applicationId (opaque, no FK to a spoke)
  native_case_id VARCHAR(64) NOT NULL,
  assigned_at    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (principal_id, source_system, native_case_id)
);

CREATE TABLE hub.user_auth_methods (              -- which IdP pools an identity belongs to (FR-F00-02/03/04)
  principal_id VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  method_id    VARCHAR(16) NOT NULL CHECK (method_id IN ('CAC_PIV','ECA','GENERIC_MFA')),
  username     VARCHAR(128) NULL,                 -- GENERIC_MFA only
  cert_subject_cn      VARCHAR(160) NULL,         -- CAC_PIV / ECA, synthetic
  cert_subject_org     VARCHAR(160) NULL,
  cert_issuer          VARCHAR(160) NULL,         -- 'DEMO-DOD-CA-59 (synthetic)' / 'DEMO-ECA-VENDOR-07 (synthetic)'
  cert_serial          VARCHAR(64)  NULL,         -- '00:DEMO:...'
  cert_valid_from      DATE NULL,
  cert_valid_to        DATE NULL,
  PRIMARY KEY (principal_id, method_id),
  UNIQUE (method_id, username)
);

CREATE TABLE hub.auth_transactions (              -- FR-F00-02/03/04
  transaction_id   VARCHAR(26)  PRIMARY KEY,
  method_id        VARCHAR(16)  NOT NULL,
  state            VARCHAR(24)  NOT NULL CHECK (state IN
                     ('AWAITING_SELECTION','AWAITING_OTP','CONSUMED','LOCKED','EXPIRED')),
  bound_principal_id VARCHAR(26) NULL,            -- null when username did not resolve
  otp_hash         VARCHAR(128) NULL,
  attempt_count    SMALLINT     NOT NULL DEFAULT 0,
  attempted_username VARCHAR(128) NULL,
  created_at       TIMESTAMPTZ  NOT NULL,
  expires_at       TIMESTAMPTZ  NOT NULL
);

CREATE TABLE hub.sessions (                       -- FR-F01-01
  session_id          VARCHAR(26)  PRIMARY KEY,
  principal_id        VARCHAR(26)  NOT NULL REFERENCES hub.users(principal_id),
  identity_method     VARCHAR(16)  NOT NULL,
  active_role         VARCHAR(16)  NOT NULL REFERENCES hub.roles(role_id),
  status              VARCHAR(16)  NOT NULL CHECK (status IN ('ACTIVE','TERMINATED','EXPIRED')),
  auth_event_count    SMALLINT     NOT NULL DEFAULT 1,   -- asserted == 1 by SM-02
  created_at          TIMESTAMPTZ  NOT NULL,
  last_activity_at    TIMESTAMPTZ  NOT NULL,
  idle_expires_at     TIMESTAMPTZ  NOT NULL,
  absolute_expires_at TIMESTAMPTZ  NOT NULL,
  user_agent_hash     VARCHAR(64)  NOT NULL,
  ip_hash             VARCHAR(64)  NOT NULL,
  csrf_token_hash     VARCHAR(64)  NOT NULL
);
CREATE INDEX ix_sessions_principal ON hub.sessions(principal_id, status);

CREATE TABLE hub.spoke_contexts (                 -- FR-F01-04
  session_id     VARCHAR(26) NOT NULL REFERENCES hub.sessions(session_id),
  application_id VARCHAR(16) NOT NULL,
  context_handle VARCHAR(256) NOT NULL,
  established_at TIMESTAMPTZ NOT NULL,
  last_used_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (session_id, application_id)
);
```

---

### Authorization policy

```sql
CREATE TABLE hub.permissions (                    -- closed vocabulary of action strings (FR-F02-02)
  action        VARCHAR(48) PRIMARY KEY,          -- e.g. 'WORK_ITEM.ACT'
  resource_type VARCHAR(24) NOT NULL,
  description   VARCHAR(500) NOT NULL
);

CREATE TABLE hub.role_permissions (               -- the matrix, as DATA not code
  role_id VARCHAR(16) NOT NULL REFERENCES hub.roles(role_id),
  action  VARCHAR(48) NOT NULL REFERENCES hub.permissions(action),
  PRIMARY KEY (role_id, action)
);

CREATE TABLE hub.attribute_rules (                -- FR-F02-03, rule IDs surfaced in denials
  rule_id       VARCHAR(24) PRIMARY KEY,          -- e.g. 'ATTR-INV-01'
  role_id       VARCHAR(16) NOT NULL REFERENCES hub.roles(role_id),
  resource_type VARCHAR(24) NOT NULL,
  applies_to_action_pattern VARCHAR(48) NOT NULL, -- e.g. 'WORK_ITEM.*'
  expression    TEXT        NOT NULL,             -- declarative predicate over principal+resource attributes
  description   VARCHAR(500) NOT NULL,
  enabled       BOOLEAN     NOT NULL DEFAULT TRUE
);
```

---

### Application registry

```sql
CREATE TABLE hub.registered_applications (        -- FR-F08b-01
  application_id            VARCHAR(16)  PRIMARY KEY
                              CHECK (application_id ~ '^[A-Z][A-Z0-9_]{1,15}$'),
  display_name              VARCHAR(60)  NOT NULL UNIQUE,
  description               VARCHAR(500) NULL,
  adapter_type              VARCHAR(32)  NOT NULL,
  base_endpoint             VARCHAR(512) NOT NULL,
  health_endpoint           VARCHAR(512) NOT NULL,
  contract_version          VARCHAR(16)  NOT NULL,
  work_item_types           JSONB        NOT NULL,   -- [{type,label,contentProfile,statusMap,priorityNative}]
  supported_actions         JSONB        NOT NULL,   -- [{actionId,label,appliesToTypes,requiredPermission,formSchema,targetSystems}]
  capabilities              JSONB        NOT NULL,
  visible_to_roles          JSONB        NOT NULL,   -- ["INVESTIGATOR", ...] , length >= 1
  relationship_types_emitted JSONB       NOT NULL DEFAULT '[]',
  icon_token                VARCHAR(64)  NOT NULL,   -- token name, never a color or URL (NFR-03)
  timeout_ms                INTEGER      NOT NULL DEFAULT 5000  CHECK (timeout_ms BETWEEN 500 AND 30000),
  action_timeout_ms         INTEGER      NOT NULL DEFAULT 10000 CHECK (action_timeout_ms BETWEEN 1000 AND 30000),
  health_timeout_ms         INTEGER      NOT NULL DEFAULT 2000  CHECK (health_timeout_ms BETWEEN 500 AND 10000),
  max_retries               SMALLINT     NOT NULL DEFAULT 2     CHECK (max_retries BETWEEN 0 AND 5),
  backoff_initial_ms        INTEGER      NOT NULL DEFAULT 200   CHECK (backoff_initial_ms BETWEEN 50 AND 5000),
  backoff_multiplier        NUMERIC(3,1) NOT NULL DEFAULT 2.0   CHECK (backoff_multiplier BETWEEN 1.0 AND 4.0),
  backoff_jitter_pct        SMALLINT     NOT NULL DEFAULT 20    CHECK (backoff_jitter_pct BETWEEN 0 AND 50),
  circuit_failure_threshold SMALLINT     NOT NULL DEFAULT 5     CHECK (circuit_failure_threshold BETWEEN 2 AND 50),
  circuit_open_ms           INTEGER      NOT NULL DEFAULT 30000 CHECK (circuit_open_ms BETWEEN 5000 AND 300000),
  circuit_half_open_probes  SMALLINT     NOT NULL DEFAULT 1     CHECK (circuit_half_open_probes BETWEEN 1 AND 5),
  health_probe_interval_sec INTEGER      NOT NULL DEFAULT 30    CHECK (health_probe_interval_sec BETWEEN 10 AND 600),
  degraded_latency_ms       INTEGER      NOT NULL DEFAULT 1500,
  enabled                   BOOLEAN      NOT NULL DEFAULT TRUE,
  config_state              VARCHAR(16)  NOT NULL DEFAULT 'VALID'
                              CHECK (config_state IN ('VALID','INVALID','INCOMPATIBLE')),
  config_problem            VARCHAR(500) NULL,
  is_demo_sixth_app         BOOLEAN      NOT NULL DEFAULT FALSE,
  last_describe_at          TIMESTAMPTZ  NULL,
  last_describe_payload     JSONB        NULL,
  registered_at             TIMESTAMPTZ  NOT NULL,
  registered_by             VARCHAR(26)  NOT NULL REFERENCES hub.users(principal_id),
  updated_at                TIMESTAMPTZ  NULL,
  updated_by                VARCHAR(26)  NULL
);

CREATE TABLE hub.retired_application_ids (        -- FR-F12-02 rule 2: IDs are never reused
  application_id VARCHAR(16) PRIMARY KEY,
  display_name   VARCHAR(60) NOT NULL,
  retired_at     TIMESTAMPTZ NOT NULL,
  retired_by     VARCHAR(26) NOT NULL
);

CREATE TABLE hub.registry_version (               -- single row; bumped on any registry change
  id              SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  version         BIGINT   NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE hub.application_registration_drafts (  -- FR-F12-01 rule 3
  draft_id       VARCHAR(26) PRIMARY KEY,
  session_id     VARCHAR(26) NOT NULL REFERENCES hub.sessions(session_id),
  payload        JSONB       NOT NULL,
  test_result    JSONB       NULL,
  test_result_at TIMESTAMPTZ NULL,
  created_at     TIMESTAMPTZ NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL
);
```

---

### Health and integration issues

```sql
CREATE TABLE hub.application_health (             -- current state, one row per application
  application_id       VARCHAR(16) PRIMARY KEY REFERENCES hub.registered_applications(application_id),
  status               VARCHAR(12) NOT NULL CHECK (status IN ('HEALTHY','DEGRADED','DOWN')),
  latency_ms           INTEGER     NULL,
  last_checked_at      TIMESTAMPTZ NULL,
  last_success_at      TIMESTAMPTZ NULL,
  consecutive_failures SMALLINT    NOT NULL DEFAULT 0,
  circuit_state        VARCHAR(12) NOT NULL DEFAULT 'CLOSED'
                         CHECK (circuit_state IN ('CLOSED','OPEN','HALF_OPEN')),
  circuit_opened_at    TIMESTAMPTZ NULL,
  injected_mode        VARCHAR(16) NULL CHECK (injected_mode IN ('UNAVAILABLE','SLOW','ERROR')),
  injected_params      JSONB       NULL,
  injected_until       TIMESTAMPTZ NULL
);

CREATE TABLE hub.application_health_checks (      -- rolling history, last 500 per application
  check_id       BIGSERIAL   PRIMARY KEY,
  application_id VARCHAR(16) NOT NULL,
  checked_at     TIMESTAMPTZ NOT NULL,
  status         VARCHAR(12) NOT NULL,
  latency_ms     INTEGER     NULL,
  error_class    VARCHAR(40) NULL,
  detail         VARCHAR(500) NULL
);
CREATE INDEX ix_health_checks_app_time ON hub.application_health_checks(application_id, checked_at DESC);

CREATE TABLE hub.integration_issues (             -- FR-F16-09, append-only
  issue_id            VARCHAR(26)  PRIMARY KEY,
  occurred_at         TIMESTAMPTZ  NOT NULL,
  application_id      VARCHAR(16)  NOT NULL,
  application_display_name VARCHAR(60) NOT NULL,   -- denormalized: survives de-registration
  operation           VARCHAR(40)  NOT NULL,
  error_class         VARCHAR(40)  NOT NULL,
  spoke_http_status   SMALLINT     NULL,
  response_excerpt    VARCHAR(1000) NULL,          -- escaped; admin-only surface
  attempt             SMALLINT     NOT NULL DEFAULT 1,
  circuit_state_at_failure VARCHAR(12) NULL,
  principal_id        VARCHAR(26)  NULL,
  correlation_id      VARCHAR(26)  NOT NULL,
  adapter_request_id  VARCHAR(26)  NULL,
  orchestration_tx_id VARCHAR(26)  NULL
);
CREATE INDEX ix_issues_time  ON hub.integration_issues(occurred_at DESC);
CREATE INDEX ix_issues_app   ON hub.integration_issues(application_id, occurred_at DESC);
CREATE INDEX ix_issues_corr  ON hub.integration_issues(correlation_id);
```

---

### Audit (append-only)

```sql
CREATE TABLE hub.audit_events (                   -- FR-F13-02; INSERT + SELECT grants ONLY
  audit_id                  VARCHAR(26)  PRIMARY KEY,
  sequence_number           BIGSERIAL    NOT NULL UNIQUE,
  occurred_at               TIMESTAMPTZ  NOT NULL,
  actor_principal_id        VARCHAR(26)  NULL,     -- null only for pre-auth failures
  actor_display_name        VARCHAR(120) NULL,
  actor_roles_at_action     JSONB        NULL,
  actor_active_role_at_action VARCHAR(16) NULL,
  actor_attributes_at_action  JSONB       NULL,    -- snapshot: later changes cannot rewrite history
  action_type               VARCHAR(48)  NOT NULL,
  target_system             VARCHAR(16)  NOT NULL, -- 'HUB' or applicationId
  target_system_display_name VARCHAR(60) NOT NULL, -- denormalized for post-de-registration legibility
  target_resource_type      VARCHAR(24)  NULL,
  target_resource_id        VARCHAR(96)  NULL,
  outcome                   VARCHAR(10)  NOT NULL
                              CHECK (outcome IN ('SUCCESS','FAILURE','DENIED','PARTIAL')),
  reason_code               VARCHAR(48)  NULL,
  policy_rule_id            VARCHAR(24)  NULL,
  before_summary            VARCHAR(500) NULL,
  after_summary             VARCHAR(500) NULL,
  correlation_id            VARCHAR(26)  NOT NULL,
  request_id                VARCHAR(26)  NOT NULL,
  adapter_request_id        VARCHAR(26)  NULL,
  session_id                VARCHAR(26)  NULL,
  identity_method           VARCHAR(16)  NULL,
  client_ip_hash            VARCHAR(64)  NULL,
  client_user_agent_hash    VARCHAR(64)  NULL,
  previous_record_hash      VARCHAR(64)  NOT NULL,
  record_hash               VARCHAR(64)  NOT NULL
);
CREATE INDEX ix_audit_time    ON hub.audit_events(occurred_at DESC);
CREATE INDEX ix_audit_actor   ON hub.audit_events(actor_principal_id, occurred_at DESC);
CREATE INDEX ix_audit_corr    ON hub.audit_events(correlation_id, sequence_number);
CREATE INDEX ix_audit_target  ON hub.audit_events(target_system, target_resource_id);
CREATE INDEX ix_audit_action  ON hub.audit_events(action_type, occurred_at DESC);

-- Immutability is enforced at the grant, not in code (FR-F13-03 rule 2):
GRANT INSERT, SELECT ON hub.audit_events TO hub_service;
REVOKE UPDATE, DELETE, TRUNCATE ON hub.audit_events FROM hub_service;

CREATE TABLE hub.audit_action_types (             -- closed vocabulary; startup-validated
  action_type VARCHAR(48) PRIMARY KEY,
  category    VARCHAR(24) NOT NULL,
  description VARCHAR(500) NOT NULL,
  is_mutation BOOLEAN     NOT NULL
);
```

---

### Orchestration

```sql
CREATE TABLE hub.orchestration_definitions (      -- FR-F07b-07: workflows are configuration
  workflow_id     VARCHAR(48) PRIMARY KEY,        -- e.g. 'RESOLVE_PVQ_ISSUE'
  display_name    VARCHAR(120) NOT NULL,
  legs            JSONB       NOT NULL,           -- [{applicationId,operation,payloadMapping,required,order}]
  preconditions   JSONB       NOT NULL,
  on_leg_failure  VARCHAR(20) NOT NULL CHECK (on_leg_failure IN ('ABORT','FORWARD_RECOVER')),
  retry_schedule_sec JSONB    NOT NULL DEFAULT '[5,15,45,135]',
  enabled         BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE hub.orchestration_transactions (     -- FR-F07b-01 step 5
  transaction_id  VARCHAR(26)  PRIMARY KEY,
  workflow_id     VARCHAR(48)  NOT NULL REFERENCES hub.orchestration_definitions(workflow_id),
  correlation_id  VARCHAR(26)  NOT NULL,
  principal_id    VARCHAR(26)  NOT NULL REFERENCES hub.users(principal_id),
  idempotency_key VARCHAR(26)  NOT NULL UNIQUE,
  state           VARCHAR(24)  NOT NULL CHECK (state IN
                    ('IN_PROGRESS','COMPLETED','PARTIALLY_COMPLETED','FAILED',
                     'INDETERMINATE','NEEDS_ATTENTION','AUDIT_GAP')),
  legs            JSONB        NOT NULL,          -- [{system,operation,state,stateBefore,stateAfter,errorClass,attempts}]
  request_payload JSONB        NOT NULL,
  result_payload  JSONB        NULL,
  created_at      TIMESTAMPTZ  NOT NULL,
  completed_at    TIMESTAMPTZ  NULL
);
CREATE INDEX ix_orch_state ON hub.orchestration_transactions(state, created_at);
CREATE INDEX ix_orch_corr  ON hub.orchestration_transactions(correlation_id);

CREATE TABLE hub.orchestration_retry_queue (      -- FR-F07b-03 rule 3
  retry_id        VARCHAR(26) PRIMARY KEY,
  transaction_id  VARCHAR(26) NOT NULL REFERENCES hub.orchestration_transactions(transaction_id),
  application_id  VARCHAR(16) NOT NULL,
  operation       VARCHAR(40) NOT NULL,
  payload         JSONB       NOT NULL,
  attempts        SMALLINT    NOT NULL DEFAULT 0,
  max_attempts    SMALLINT    NOT NULL DEFAULT 4,
  next_attempt_at TIMESTAMPTZ NOT NULL,
  last_error_class VARCHAR(40) NULL,
  state           VARCHAR(16) NOT NULL DEFAULT 'PENDING'
                    CHECK (state IN ('PENDING','SUCCEEDED','EXHAUSTED'))
);
CREATE INDEX ix_retry_due ON hub.orchestration_retry_queue(state, next_attempt_at);

CREATE TABLE hub.idempotency_records (            -- FR-F06-04 rule 6
  idempotency_key VARCHAR(26)  PRIMARY KEY,
  principal_id    VARCHAR(26)  NOT NULL,
  endpoint        VARCHAR(160) NOT NULL,
  request_hash    VARCHAR(64)  NOT NULL,
  response_status SMALLINT     NOT NULL,
  response_body   JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL,
  expires_at      TIMESTAMPTZ  NOT NULL
);
```

---

### Notifications, announcements, and view state

```sql
CREATE TABLE hub.announcements (                  -- FR-F11-06
  announcement_id VARCHAR(26)  PRIMARY KEY,
  title           VARCHAR(120) NOT NULL,
  body            VARCHAR(2000) NOT NULL,         -- plain text; escaped on render
  severity        VARCHAR(12)  NOT NULL CHECK (severity IN ('INFO','WARNING','EMERGENCY')),
  target_roles    JSONB        NOT NULL,          -- length >= 1
  dismissible     BOOLEAN      NOT NULL DEFAULT TRUE,  -- forced FALSE when severity='EMERGENCY'
  action_href     VARCHAR(512) NULL,
  action_label    VARCHAR(60)  NULL,
  effective_from  TIMESTAMPTZ  NOT NULL,
  expires_at      TIMESTAMPTZ  NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL,
  created_by      VARCHAR(26)  NOT NULL REFERENCES hub.users(principal_id),
  updated_at      TIMESTAMPTZ  NULL,
  updated_by      VARCHAR(26)  NULL,
  CHECK (effective_from < expires_at)
);

CREATE TABLE hub.announcement_dismissals (        -- per user, per announcement
  announcement_id VARCHAR(26) NOT NULL REFERENCES hub.announcements(announcement_id),
  principal_id    VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  dismissed_at    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (announcement_id, principal_id)
);

CREATE TABLE hub.alert_read_state (               -- FR-F15-03; alerts themselves are derived, not stored
  principal_id VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  alert_id     VARCHAR(64) NOT NULL,              -- deterministic hash of ruleId + workItemId
  read_at      TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (principal_id, alert_id)
);

CREATE TABLE hub.queue_default_views (            -- FR-F05-08; per role, configuration
  role_id     VARCHAR(16) PRIMARY KEY REFERENCES hub.roles(role_id),
  filters     JSONB       NOT NULL,
  sort_field  VARCHAR(24) NOT NULL,
  sort_dir    VARCHAR(4)  NOT NULL CHECK (sort_dir IN ('asc','desc')),
  page_size   SMALLINT    NOT NULL DEFAULT 25
);

CREATE TABLE hub.user_view_preferences (          -- per principal override
  principal_id VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  view_key     VARCHAR(32) NOT NULL,              -- 'WORK_QUEUE' | 'AUDIT' | ...
  filters      JSONB       NOT NULL,
  sort_field   VARCHAR(24) NOT NULL,
  sort_dir     VARCHAR(4)  NOT NULL,
  page_size    SMALLINT    NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (principal_id, view_key)
);

CREATE TABLE hub.dashboard_compositions (         -- FR-F04-01; widget sets are configuration
  role_id    VARCHAR(16) NOT NULL REFERENCES hub.roles(role_id),
  widget_id  VARCHAR(40) NOT NULL,
  title      VARCHAR(80) NOT NULL,
  data_source VARCHAR(40) NOT NULL,
  href       VARCHAR(160) NOT NULL,
  sort_order SMALLINT    NOT NULL,
  PRIMARY KEY (role_id, widget_id)
);

CREATE TABLE hub.work_item_counts_cache (         -- FR-F05-05 rule 2: quantifying "12 items are not shown"
  principal_id   VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  application_id VARCHAR(16) NOT NULL,
  item_count     INTEGER     NOT NULL,
  counted_at     TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (principal_id, application_id)
);

CREATE TABLE hub.operator_tokens (                -- FR-F09-08; short-lived spoke-query assertions
  token_id     VARCHAR(26) PRIMARY KEY,
  issued_to    VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  audience     VARCHAR(16) NOT NULL,
  issued_at    TIMESTAMPTZ NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ NULL
);
```

---

### Schema notes

1. **No table in `hub` references any spoke table.** `user_case_assignments.native_case_id`, `integration_issues.application_id`, and `audit_events.target_resource_id` are opaque strings by design.
2. **Denormalized display names** (`integration_issues.application_display_name`, `audit_events.target_system_display_name`) exist so history stays legible after an application is de-registered (`FR-F12-07` rule 6).
3. **`audit_events` has no UPDATE or DELETE grant.** This is the enforcement; application-level discipline is the secondary control (`FR-F13-03`).
4. **`hub.registry_version`** is a single-row table deliberately, so a client can poll one value rather than diffing a list.
5. **Alerts are not stored** — only read state is. Storing derived alerts would create a second source of truth that could disagree with the queue (`FR-F15-01` rule 2).

---
## Y0b — Database Schema: Spoke Namespaces (Isolated)

**Namespaces:** `eapp`, `iep`, `pvq`, `pdt`, `im`, `cvs`. Each is owned by exactly one service, with its own credential. **No table is shared. No cross-schema foreign key exists anywhere in this document.** The isolation is a deliverable, not an implementation detail (`FR-F09-01`, NFR-08, SM-13).

Cross-system relationships are expressed **only** as opaque string references (`subject_ref`, `parent_case_ref`, `outstanding_issue_refs`) that the owning service stores but never resolves. Resolution happens exclusively in the hub, through adapters (`FR-F07a-01`).

---

### Conventions common to every spoke

Each spoke's tables carry these columns unless noted:

```sql
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',  -- FR-F17-08
  state_version    VARCHAR(32) NOT NULL,   -- changes on any user-visible field change (FR-F08a-03)
  created_at       TIMESTAMPTZ NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL
```

Each spoke also carries these two operational tables:

```sql
CREATE TABLE <ns>.idempotency_records (          -- FR-F09-07 rule 3
  idempotency_key VARCHAR(26)  PRIMARY KEY,
  request_hash    VARCHAR(64)  NOT NULL,
  response_status SMALLINT     NOT NULL,
  response_body   JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL,
  expires_at      TIMESTAMPTZ  NOT NULL          -- created_at + 24h
);

CREATE TABLE <ns>.injection_state (              -- FR-F16-11; demo failure injection
  id           SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode         VARCHAR(16) NOT NULL DEFAULT 'NORMAL'
                 CHECK (mode IN ('NORMAL','UNAVAILABLE','SLOW','ERROR')),
  slow_ms      INTEGER  NULL,
  error_rate_pct SMALLINT NULL,
  expires_at   TIMESTAMPTZ NULL
);
```

---

## §eApp — `eapp` namespace

```sql
CREATE TABLE eapp.subjects (
  subject_ref      VARCHAR(32)  PRIMARY KEY,      -- 'SUBJ-00418'; opaque, no FK anywhere
  display_name     VARCHAR(120) NOT NULL,
  date_of_birth    DATE         NOT NULL,         -- fabricated
  synthetic_ssn    VARCHAR(11)  NOT NULL,         -- '900-00-####', invalid by construction
  email            VARCHAR(160) NOT NULL,         -- '@example.invalid'
  phone            VARCHAR(20)  NOT NULL,         -- '555-01##'
  address_line     VARCHAR(160) NOT NULL,
  postal_code      VARCHAR(10)  NOT NULL,         -- '000##', invalid by construction
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE eapp.cases (
  case_id                VARCHAR(32) PRIMARY KEY,  -- 'CASE-A-1042'
  subject_ref            VARCHAR(32) NOT NULL REFERENCES eapp.subjects(subject_ref),
  case_state             VARCHAR(40) NOT NULL CHECK (case_state IN
                           ('DRAFT','SUBMITTED','UNDER_REVIEW','INFORMATION_REQUESTED',
                            'REVIEW_COMPLETE_PENDING_ADJUDICATION','ADJUDICATED','CLOSED')),
  sensitivity_tier       VARCHAR(4)  NOT NULL CHECK (sensitivity_tier IN ('T1','T3','T5')),
  organization           VARCHAR(64) NOT NULL,     -- ABAC input
  region                 VARCHAR(32) NOT NULL,     -- ABAC input
  assigned_principal_id  VARCHAR(26) NULL,         -- hub principal id, opaque to eApp
  assigned_display_name  VARCHAR(120) NULL,
  priority               VARCHAR(12) NOT NULL DEFAULT 'ROUTINE',
  submitted_at           TIMESTAMPTZ NULL,
  due_date               DATE        NULL,
  outstanding_issue_count SMALLINT   NOT NULL DEFAULT 0,
  outstanding_issue_refs  JSONB      NOT NULL DEFAULT '[]',  -- ["ISS-2207"] — OPAQUE PVQ refs, never resolved here
  pdt_designation_ref     VARCHAR(32) NULL,        -- opaque PDT ref
  im_assignment_ref       VARCHAR(32) NULL,        -- opaque IM ref
  last_activity_at        TIMESTAMPTZ NOT NULL,
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX ix_eapp_cases_subject  ON eapp.cases(subject_ref);
CREATE INDEX ix_eapp_cases_assignee ON eapp.cases(assigned_principal_id);
CREATE INDEX ix_eapp_cases_org      ON eapp.cases(organization, region);

CREATE TABLE eapp.questionnaire_sections (
  section_id    VARCHAR(48) PRIMARY KEY,           -- 'CASE-A-1042#SECTION_13A'
  case_id       VARCHAR(32) NOT NULL REFERENCES eapp.cases(case_id),
  section_code  VARCHAR(24) NOT NULL,              -- 'SECTION_13A' — the anchorable locus
  section_label VARCHAR(120) NOT NULL,             -- 'Section 13A — Employment history'
  sort_order    SMALLINT    NOT NULL,
  completed     BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE eapp.answers (
  answer_id    VARCHAR(48) PRIMARY KEY,
  section_id   VARCHAR(48) NOT NULL REFERENCES eapp.questionnaire_sections(section_id),
  answer_path  VARCHAR(120) NOT NULL,              -- 'employer[0].endDate' — targeted by PVQ answer_locus
  question_text VARCHAR(500) NOT NULL,
  answer_text  VARCHAR(2000) NOT NULL,
  UNIQUE (section_id, answer_path)
);

CREATE TABLE eapp.case_activity (                  -- eApp's OWN history, independent of hub audit
  activity_id  VARCHAR(26) PRIMARY KEY,
  case_id      VARCHAR(32) NOT NULL REFERENCES eapp.cases(case_id),
  occurred_at  TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  actor_principal_id VARCHAR(26) NULL,
  action       VARCHAR(48) NOT NULL,
  summary      VARCHAR(500) NOT NULL,
  correlation_id VARCHAR(26) NULL
);
CREATE INDEX ix_eapp_activity ON eapp.case_activity(case_id, occurred_at DESC);
```

**Behavioral notes (`FR-F09-02`):** `CLEAR_OUTSTANDING_ISSUE(issue_ref)` removes `issue_ref` from `outstanding_issue_refs` if present, decrements the count, and is a **no-op success** if absent — this idempotency is what makes flagship retry safe. When the count reaches zero from non-zero, `case_state` moves `UNDER_REVIEW → REVIEW_COMPLETE_PENDING_ADJUDICATION`.

---

## §PVQ — `pvq` namespace

```sql
CREATE TABLE pvq.questionnaires (
  questionnaire_id VARCHAR(32) PRIMARY KEY,
  subject_ref      VARCHAR(32) NOT NULL,           -- same string as eapp.subjects.subject_ref; NO FK
  subject_display_name VARCHAR(120) NOT NULL,
  form_type        VARCHAR(40) NOT NULL,
  submitted_at     TIMESTAMPTZ NULL,
  status           VARCHAR(24) NOT NULL,
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE pvq.issues (                          -- PVQ OWNS the eApp↔PVQ relationship (FR-F07a-01)
  issue_id            VARCHAR(32) PRIMARY KEY,     -- 'ISS-2207'
  questionnaire_id    VARCHAR(32) NULL REFERENCES pvq.questionnaires(questionnaire_id),
  subject_ref         VARCHAR(32) NOT NULL,        -- cross-checked by the hub against eApp's subject
  subject_display_name VARCHAR(120) NOT NULL,
  parent_system       VARCHAR(16) NOT NULL DEFAULT 'EAPP',
  parent_case_ref     VARCHAR(32) NOT NULL,        -- 'CASE-A-1042' — OPAQUE; PVQ never queries eApp
  answer_locus        VARCHAR(160) NOT NULL,       -- 'SECTION_13A.employer[0].endDate'
  answer_section_label VARCHAR(120) NOT NULL,      -- 'Section 13A — Employment history'
  answer_snapshot     VARCHAR(2000) NOT NULL,      -- the answer as it stood when raised
  title               VARCHAR(160) NOT NULL,
  description         VARCHAR(2000) NOT NULL,
  status              VARCHAR(32) NOT NULL CHECK (status IN
                        ('OPEN','IN_REVIEW','RESOLVED_SUBSTANTIATED','RESOLVED_UNSUBSTANTIATED',
                         'RESOLVED_WITH_CLARIFICATION','REFERRED')),
  priority            VARCHAR(12) NOT NULL DEFAULT 'ELEVATED',
  organization        VARCHAR(64) NOT NULL,
  region              VARCHAR(32) NOT NULL,
  assigned_principal_id VARCHAR(26) NULL,
  assigned_display_name VARCHAR(120) NULL,
  raised_at           TIMESTAMPTZ NOT NULL,
  due_date            DATE        NULL,
  disposition         VARCHAR(32) NULL CHECK (disposition IN
                        ('SUBSTANTIATED','UNSUBSTANTIATED','RESOLVED_WITH_CLARIFICATION',
                         'REFERRED_FOR_FURTHER_REVIEW')),
  resolution_narrative VARCHAR(4000) NULL,
  resolved_by         VARCHAR(120) NULL,
  resolved_by_principal_id VARCHAR(26) NULL,
  resolved_at         TIMESTAMPTZ NULL,
  last_activity_at    TIMESTAMPTZ NOT NULL,
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX ix_pvq_issues_parent  ON pvq.issues(parent_system, parent_case_ref);
CREATE INDEX ix_pvq_issues_subject ON pvq.issues(subject_ref);
CREATE INDEX ix_pvq_issues_status  ON pvq.issues(status, due_date);

CREATE TABLE pvq.issue_activity (
  activity_id  VARCHAR(26) PRIMARY KEY,
  issue_id     VARCHAR(32) NOT NULL REFERENCES pvq.issues(issue_id),
  occurred_at  TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  actor_principal_id VARCHAR(26) NULL,
  action       VARCHAR(48) NOT NULL,
  summary      VARCHAR(500) NOT NULL,
  correlation_id VARCHAR(26) NULL
);
```

**Behavioral notes (`FR-F09-03`):** `RESOLVE_ISSUE` is permitted only from `OPEN` or `IN_REVIEW`; from a resolved state it returns a business rejection ("This issue has already been resolved."). It is idempotent on `X-UAL-Idempotency-Key`. `parent_case_ref` is stored and returned, never dereferenced.

---

## §IEP — `iep` namespace

```sql
CREATE TABLE iep.individuals (
  subject_ref      VARCHAR(32)  PRIMARY KEY,       -- same string as eApp/PVQ; NO FK
  display_name     VARCHAR(120) NOT NULL,
  email            VARCHAR(160) NOT NULL,          -- '@example.invalid'
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE iep.status_records (
  status_record_id VARCHAR(32)  PRIMARY KEY,
  subject_ref      VARCHAR(32)  NOT NULL REFERENCES iep.individuals(subject_ref),
  stage            VARCHAR(32)  NOT NULL CHECK (stage IN
                     ('SUBMITTED','UNDER_REVIEW','INFORMATION_REQUESTED','COMPLETE')),
  stage_explanation VARCHAR(500) NOT NULL,         -- plain-language copy stored as DATA, not code
  updated_at       TIMESTAMPTZ  NOT NULL,
  state_version    VARCHAR(32)  NOT NULL,
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE iep.notices (
  notice_id        VARCHAR(32)  PRIMARY KEY,
  subject_ref      VARCHAR(32)  NOT NULL REFERENCES iep.individuals(subject_ref),
  title            VARCHAR(160) NOT NULL,
  body             VARCHAR(4000) NOT NULL,
  severity         VARCHAR(12)  NOT NULL CHECK (severity IN ('INFO','ACTION_REQUIRED','URGENT')),
  issued_at        TIMESTAMPTZ  NOT NULL,
  read_at          TIMESTAMPTZ  NULL,              -- IEP owns read state for ITS notices
  state_version    VARCHAR(32)  NOT NULL,
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE iep.tasks (
  task_id          VARCHAR(32)  PRIMARY KEY,
  subject_ref      VARCHAR(32)  NOT NULL REFERENCES iep.individuals(subject_ref),
  title            VARCHAR(160) NOT NULL,
  description      VARCHAR(2000) NOT NULL,
  consequence_text VARCHAR(500) NOT NULL,          -- "what happens if you don't act", plain language
  status           VARCHAR(16)  NOT NULL CHECK (status IN ('OPEN','COMPLETE')),
  due_date         DATE         NULL,
  response_schema  JSONB        NULL,              -- drives the completion form
  response_payload JSONB        NULL,
  completed_at     TIMESTAMPTZ  NULL,
  last_activity_at TIMESTAMPTZ  NOT NULL,
  state_version    VARCHAR(32)  NOT NULL,
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE iep.iep_activity (
  activity_id VARCHAR(26) PRIMARY KEY,
  target_type VARCHAR(16) NOT NULL CHECK (target_type IN ('NOTICE','TASK','STATUS')),
  target_id   VARCHAR(32) NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  action      VARCHAR(48) NOT NULL,
  summary     VARCHAR(500) NOT NULL,
  correlation_id VARCHAR(26) NULL
);
```

---

## §PDT — `pdt` namespace

```sql
CREATE TABLE pdt.positions (
  position_id      VARCHAR(32)  PRIMARY KEY,
  title            VARCHAR(160) NOT NULL,
  organization     VARCHAR(64)  NOT NULL,
  region           VARCHAR(32)  NOT NULL,
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE pdt.designations (
  designation_id    VARCHAR(32) PRIMARY KEY,       -- 'DSG-0431'
  position_id       VARCHAR(32) NOT NULL REFERENCES pdt.positions(position_id),
  subject_ref       VARCHAR(32) NULL,              -- opaque
  eapp_case_ref     VARCHAR(32) NULL,              -- opaque eApp ref; PDT never queries eApp
  sensitivity_level VARCHAR(32) NOT NULL CHECK (sensitivity_level IN
                      ('NON_SENSITIVE','NONCRITICAL_SENSITIVE','CRITICAL_SENSITIVE','SPECIAL_SENSITIVE')),
  risk_level        VARCHAR(12) NOT NULL CHECK (risk_level IN ('LOW','MODERATE','HIGH')),
  investigation_tier VARCHAR(4) NOT NULL CHECK (investigation_tier IN ('T1','T3','T5')),
  tier_rule_id      VARCHAR(24) NOT NULL REFERENCES pdt.tier_rules(rule_id),
  status            VARCHAR(20) NOT NULL CHECK (status IN
                      ('DRAFT','PENDING_REVIEW','APPROVED','RETURNED')),
  organization      VARCHAR(64) NOT NULL,
  region            VARCHAR(32) NOT NULL,
  reviewed_by       VARCHAR(120) NULL,
  reviewed_at       TIMESTAMPTZ NULL,
  return_reason     VARCHAR(1000) NULL,
  last_activity_at  TIMESTAMPTZ NOT NULL,
  -- NOTE: no due_date and no priority column. PDT declares priorityNative:false,
  -- exercising the normalization rules in FR-F05-02 and the "not provided" affordance.
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE pdt.tier_rules (                      -- the rule is DATA so it can be displayed (FR-F06-09)
  rule_id           VARCHAR(24)  PRIMARY KEY,
  sensitivity_level VARCHAR(32)  NOT NULL,
  risk_level        VARCHAR(12)  NOT NULL,
  investigation_tier VARCHAR(4)  NOT NULL,
  rule_text         VARCHAR(500) NOT NULL,
  UNIQUE (sensitivity_level, risk_level)
);

CREATE TABLE pdt.risk_factors (
  factor_id      VARCHAR(32) PRIMARY KEY,
  designation_id VARCHAR(32) NOT NULL REFERENCES pdt.designations(designation_id),
  factor_code    VARCHAR(32) NOT NULL,
  factor_label   VARCHAR(160) NOT NULL,
  weight         VARCHAR(12) NOT NULL
);

CREATE TABLE pdt.designation_activity (
  activity_id    VARCHAR(26) PRIMARY KEY,
  designation_id VARCHAR(32) NOT NULL REFERENCES pdt.designations(designation_id),
  occurred_at    TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  action         VARCHAR(48) NOT NULL,
  summary        VARCHAR(500) NOT NULL,
  correlation_id VARCHAR(26) NULL
);
```

---

## §IM — `im` namespace

```sql
CREATE TABLE im.investigations (
  investigation_id VARCHAR(32) PRIMARY KEY,        -- 'INV-7741'
  subject_ref      VARCHAR(32) NOT NULL,           -- opaque
  subject_display_name VARCHAR(120) NOT NULL,
  eapp_case_ref    VARCHAR(32) NULL,               -- opaque
  title            VARCHAR(160) NOT NULL,
  status           VARCHAR(24) NOT NULL CHECK (status IN
                     ('OPEN','IN_PROGRESS','PENDING_INFORMATION','COMPLETE','CLOSED')),
  priority         VARCHAR(12) NOT NULL CHECK (priority IN ('ROUTINE','ELEVATED','URGENT')),
  sensitivity_tier VARCHAR(4)  NOT NULL,
  organization     VARCHAR(64) NOT NULL,
  region           VARCHAR(32) NOT NULL,
  opened_at        TIMESTAMPTZ NOT NULL,
  due_date         DATE        NULL,
  last_activity_at TIMESTAMPTZ NOT NULL,
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE im.assignments (
  assignment_id        VARCHAR(32) PRIMARY KEY,
  investigation_id     VARCHAR(32) NOT NULL REFERENCES im.investigations(investigation_id),
  assigned_principal_id VARCHAR(26) NULL,          -- NULL = unassigned (seeded edge state)
  assigned_native_user  VARCHAR(120) NULL,         -- set with NULL principal_id = unresolvable assignee
  assigned_display_name VARCHAR(120) NULL,
  assigned_at          TIMESTAMPTZ NULL,
  accepted_at          TIMESTAMPTZ NULL,
  due_date             DATE        NULL,
  state_version        VARCHAR(32) NOT NULL
);
CREATE INDEX ix_im_assign_principal ON im.assignments(assigned_principal_id);

CREATE TABLE im.leads (
  lead_id          VARCHAR(32) PRIMARY KEY,
  investigation_id VARCHAR(32) NOT NULL REFERENCES im.investigations(investigation_id),
  title            VARCHAR(160) NOT NULL,
  status           VARCHAR(20) NOT NULL,
  due_date         DATE        NULL,
  notes            VARCHAR(4000) NULL,
  state_version    VARCHAR(32) NOT NULL
);

CREATE TABLE im.investigator_workload (            -- derived, refreshed on assignment change
  principal_id     VARCHAR(26) PRIMARY KEY,
  open_count       INTEGER     NOT NULL DEFAULT 0,
  overdue_count    INTEGER     NOT NULL DEFAULT 0,
  computed_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE im.im_activity (
  activity_id      VARCHAR(26) PRIMARY KEY,
  investigation_id VARCHAR(32) NOT NULL REFERENCES im.investigations(investigation_id),
  occurred_at      TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  action           VARCHAR(48) NOT NULL,
  summary          VARCHAR(500) NOT NULL,
  correlation_id   VARCHAR(26) NULL
);
```

---

## §CVS — `cvs` namespace (demo sixth application)

```sql
CREATE TABLE cvs.alerts (                          -- FR-F12-06
  alert_id         VARCHAR(32) PRIMARY KEY,        -- 'CVA-0091'
  subject_ref      VARCHAR(32) NOT NULL,           -- opaque, coherent with the other namespaces
  subject_display_name VARCHAR(120) NOT NULL,
  alert_type       VARCHAR(40) NOT NULL,
  title            VARCHAR(160) NOT NULL,
  description      VARCHAR(2000) NOT NULL,
  status           VARCHAR(20) NOT NULL CHECK (status IN
                     ('NEW','UNDER_REVIEW','CLEARED','ESCALATED')),
  priority         VARCHAR(12) NOT NULL,
  organization     VARCHAR(64) NOT NULL,
  region           VARCHAR(32) NOT NULL,
  assigned_principal_id VARCHAR(26) NULL,
  assigned_display_name VARCHAR(120) NULL,
  raised_at        TIMESTAMPTZ NOT NULL,
  due_date         DATE        NULL,
  clear_reason     VARCHAR(1000) NULL,
  last_activity_at TIMESTAMPTZ NOT NULL,
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE cvs.alert_activity (
  activity_id VARCHAR(26) PRIMARY KEY,
  alert_id    VARCHAR(32) NOT NULL REFERENCES cvs.alerts(alert_id),
  occurred_at TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  action      VARCHAR(48) NOT NULL,
  summary     VARCHAR(500) NOT NULL,
  correlation_id VARCHAR(26) NULL
);
```

**Note:** CVS's data exists from first startup, but **no `hub.registered_applications` row exists for it** until an administrator registers it live (`FR-F12-06`). Its invisibility before registration is part of the demonstration.

---

### Isolation verification checklist (`FR-F19-03` item 8)

| Assertion | How verified |
|---|---|
| No cross-schema foreign key exists | Schema introspection: every FK's referenced table is in the same schema |
| No table name appears in two schemas with shared data | Schema inventory diff |
| Each service credential can read only its own schema | Runtime probe per service against every other schema; all must fail |
| No spoke makes an outbound call to another spoke | Network policy assertion during test |
| The hub holds no spoke table grants | Grant inspection |
| Cross-system references are strings with no FK | Column inspection: `subject_ref`, `parent_case_ref`, `eapp_case_ref`, `outstanding_issue_refs`, `pdt_designation_ref`, `im_assignment_ref` all unconstrained |

---
## Y1a — Hub BFF API Catalog

**Base:** `/api`. **Format:** JSON (`application/json; charset=utf-8`). **Auth:** server-side session cookie (`FR-F01-01`); mutating requests require `X-CSRF-Token`. **Every endpoint** traverses the pipeline in `FR-F10-01` and is authorized by the PDP (`FR-F02-01`). **Every mutating endpoint** writes audit before responding (`FR-F13-01`).

**Common headers.** Request: `X-CSRF-Token` (mutations), `X-Correlation-Id` (optional, ULID), `X-Idempotency-Key` (mutations). Response: `X-Correlation-Id`, `X-UAL-Session-Expires`, `Cache-Control: no-store`.

**Error envelope:** §3.6. **Error codes:** `Y2`.

**Column key:** *Auth* = required permission (`—` = none/anonymous). *Audit* = writes an audit record.

---

### §Auth

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/auth/methods` | — | No |
| POST | `/api/auth/initiate` | — | No |
| POST | `/api/auth/complete` | — | Yes (`AUTH_SUCCESS` / `AUTH_FAILURE`) |
| POST | `/api/auth/logout` | session | Yes (`LOGOUT`) |

**`GET /api/auth/methods`** → `200 { methods: [{ methodId, label, description, iconToken, enabled, disabledReason, simulationNotice }] }`
Errors: `503 AUTH_CONFIG_UNAVAILABLE`.

**`POST /api/auth/initiate`**
Request: `{ methodId: "CAC_PIV"|"ECA"|"GENERIC_MFA", username?: string }` (`username` required for `GENERIC_MFA`, 3–128 chars).
→ `200 { transactionId, state, expiresAt, identities?: [{ identityId, subjectCommonName, subjectOrganization, issuer, serialNumber, validFrom, validTo, roles[] }], demoCode?: string }`
`identities` for CAC_PIV/ECA; `demoCode` for GENERIC_MFA. Errors: `400 VALIDATION_FAILED`, `503 AUTH_CONFIG_UNAVAILABLE`.

**`POST /api/auth/complete`**
Request: `{ transactionId, identityId?, otp? }` (`identityId` for cert paths, `otp` 6 digits for MFA).
→ `200 { principal, entitlements, expiresAt, returnTo }` + `Set-Cookie: ual_session`
Errors: `400 AUTH_TX_EXPIRED`, `400 AUTH_TX_CONSUMED`, `400 VALIDATION_FAILED`, `401 AUTH_FAILED`, `403 IDENTITY_NOT_PROVISIONED`, `429 AUTH_ATTEMPTS_EXCEEDED`.

**`POST /api/auth/logout`** → `204`. Idempotent (`FR-F00-07`).

---

### §Session

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/session` | session | No |
| POST | `/api/session/extend` | session | No |
| POST | `/api/session/active-role` | session | Yes (`ROLE_CONTEXT_SWITCHED`) |

**`GET /api/session`** → `200 { principalId, displayName, roles[], activeRole, identityMethod, attributes{}, expiresAt, authEventCount }`
Errors: `401 SESSION_INVALID`.

**`POST /api/session/extend`** → `200 { expiresAt }`. Errors: `401 SESSION_EXPIRED`, `401 SESSION_MAX_LIFETIME`.

**`POST /api/session/active-role`** Request: `{ activeRole }` → `200 { principal, entitlements }`. Errors: `403 ROLE_NOT_HELD`.

---

### §Entitlements

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/entitlements` | `NAV.READ` | No |
| GET | `/api/registry-version` | session | No |

**`GET /api/entitlements`** → `200 { activeRole, roles[], navigation: [{ id, label, href, iconToken, order, badgeCount }], permissions: [string], defaultLanding, registryVersion }`
Errors: `500 INTERNAL_ERROR`.

**`GET /api/registry-version`** → `200 { version, updatedAt }` — polled every 30 s to detect registry changes (`FR-F08b-03`).

---

### §Dashboard

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/dashboard` | `DASHBOARD.READ` | No |

**`GET /api/dashboard?widgets=a,b`** → `200 { role, widgets: [{ widgetId, title, state: "READY"|"EMPTY"|"PARTIAL"|"ERROR", data, href, message? }], sourceStatus: [{ applicationId, label, status, omittedItemEstimate, message }], generatedAt, correlationId }`
Always `200` when at least the shell can be built; widget failures are expressed in `widget.state` (`FR-F04-01`). Errors: `500 INTERNAL_ERROR` (composition missing).

---

### §Work Queue

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/work-items` | `WORK_QUEUE.LIST` | No |
| GET | `/api/search` | `WORK_QUEUE.LIST` | No |

**`GET /api/work-items`**
Query: `q`, `sourceSystem[]`, `type[]`, `status[]` (statusCategory), `priority[]`, `assignee` (`me|unassigned|{principalId}`), `dueFrom`, `dueTo`, `overdueOnly`, `sort` (`dueDate|priority|statusCategory|sourceSystem|lastActivityAt|title`), `dir`, `page`, `pageSize`.
→ `200 { items: WorkItem[], page, pageSize, totalCount, totalPages, hasNext, truncated, appliedFilters{}, sourceStatus: [{ applicationId, label, status, itemCount, latencyMs, omittedItemEstimate, message }], correlationId }`
**Returns 200 whenever ≥1 source succeeded** (`FR-F05-05`). Errors: `400 VALIDATION_FAILED`, `503 REGISTRY_UNAVAILABLE`.

**`GET /api/search?q=`** Query: `q` (2–120), `sourceSystem[]`, `type[]` → `200 { groups: [{ applicationId, label, items: WorkItem[] }], totalCount, sourceStatus[], exactMatch?: WorkItem, correlationId }`
Errors: `400 VALIDATION_FAILED`.

---

### §Work Items

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/work-items/{workItemId}` | `WORK_ITEM.READ` | Yes (`WORK_ITEM_VIEWED`) |
| GET | `/api/work-items/{workItemId}/actions` | `WORK_ITEM.READ` | No |
| POST | `/api/work-items/{workItemId}/actions/{actionId}` | `WORK_ITEM.ACT` | Yes (action-specific) |
| GET | `/api/work-items/{workItemId}/activity` | `WORK_ITEM.READ` | No |
| GET | `/api/work-items/{workItemId}/related` | `WORK_ITEM.READ` | Yes (`RELATED_ITEMS_RESOLVED`) |

**`GET /api/work-items/{workItemId}`** (`{sourceSystem}:{nativeId}`)
→ `200 { item: WorkItem, typeSpecificDetail: object, availableActions: ActionDescriptor[], relatedRefs: RelatedRef[], breadcrumbTrail: [{ label, href, sourceSystem }], stateVersion, sourceHealth, syntheticMarker }`
Errors: `403 AUTHZ_DENIED` (also for not-found — non-enumerable), `409 APPLICATION_DISABLED`, `502 UPSTREAM_CONTRACT_ERROR`, `503 UPSTREAM_UNAVAILABLE`.

**`POST /api/work-items/{workItemId}/actions/{actionId}`**
Request: `{ stateVersion, idempotencyKey, payload: {…} }`
→ `200 { item: WorkItem, stateVersion, message, targetSystems[], correlationId }`
Errors: `400 VALIDATION_FAILED`, `403 AUTHZ_DENIED`, `409 ACTION_NOT_AVAILABLE`, `409 STATE_CONFLICT`, `422 UPSTREAM_REJECTED_ACTION`, `500 AUDIT_WRITE_FAILED`, `502 UPSTREAM_INDETERMINATE`, `503 UPSTREAM_UNAVAILABLE`.

**`GET /api/work-items/{workItemId}/activity?page=&pageSize=`**
→ `200 { events: ActivityEvent[], page, pageSize, hasNext, spokeHistoryAvailable: boolean, message? }`

**`GET /api/work-items/{workItemId}/related`**
→ `200 { relatedRefs: [{ relationshipType, targetSystem, targetSystemLabel, targetNativeId, targetWorkItemId, label, contextHint, resolvable, summary?: { title, statusLabel, lastActivityAt }, unresolvableReason? }] }`

---

### §Orchestration

| Method | Path | Auth | Audit |
|---|---|---|---|
| POST | `/api/orchestration/resolve-pvq-issue` | `ISSUE.RESOLVE` | Yes (chain, `FR-F07b-06`) |
| GET | `/api/orchestration/{transactionId}` | owner or `ADMIN.*` | No |
| POST | `/api/orchestration/{transactionId}/retry` | owner or `ADMIN.*` | Yes (`ORCHESTRATION_RETRY_ATTEMPTED`) |

**`POST /api/orchestration/resolve-pvq-issue`**
Request:
```json
{ "issueId": "PVQ:ISS-2207", "parentCaseId": "EAPP:CASE-A-1042",
  "disposition": "SUBSTANTIATED", "resolutionNarrative": "…20–4000 chars…",
  "reviewedAnswerConfirmed": true, "stateVersion": "…", "idempotencyKey": "01JD…" }
```
→ `200` (COMPLETED) or `207` (PARTIALLY_COMPLETED):
```json
{ "transactionId": "…", "correlationId": "…", "overallOutcome": "COMPLETED",
  "systems": [ { "applicationId": "PVQ", "label": "Personnel Vetting Questionnaire",
                 "outcome": "COMMITTED", "requested": "Resolve issue as Substantiated",
                 "stateBefore": "Open", "stateAfter": "Resolved — Substantiated",
                 "readBackAt": "2026-09-14T15:05:02Z", "message": null } ],
  "retry": null }
```
Errors: `400 VALIDATION_FAILED`, `400 RELATIONSHIP_MISMATCH`, `403 AUTHZ_DENIED`, `409 ACTION_NOT_AVAILABLE`, `409 STATE_CONFLICT`, `500 AUDIT_WRITE_FAILED`, `502 UPSTREAM_INDETERMINATE`, `503 UPSTREAM_UNAVAILABLE`, `504 ORCHESTRATION_TIMEOUT`.

**`POST /api/orchestration/{transactionId}/retry`** → `200` or `207` with the same shape. Errors: `403 AUTHZ_DENIED`, `409 ACTION_NOT_AVAILABLE` (already completed returns `200` with stored outcome).

---

### §Notifications

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/notifications` | `DASHBOARD.READ` | No |
| POST | `/api/notifications/{alertId}/read` | `DASHBOARD.READ` | No (`FR-F15-03` rule 7) |
| POST | `/api/notifications/read-all` | `DASHBOARD.READ` | No |
| POST | `/api/announcements/{id}/dismiss` | `DASHBOARD.READ` | No |

**`GET /api/notifications`** Query: `type`, `severity`, `sourceSystem`, `readState`, list params
→ `200 { alerts: [{ alertId, ruleId, severity, title, message, workItemId, sourceSystem, sourceSystemLabel, generatedAt, actionHref, read }], announcements: [{ announcementId, title, body, severity, issuedAt, dismissible, dismissed, actionHref, actionLabel }], unreadCount, sourceStatus[] }`

---

### §Health

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/health/summary` | session | No |

→ `200 { applications: [{ applicationId, displayName, status, lastCheckedAt, latencyMs, message, circuitState? }], degradedCount, downCount, checkedAt }`
`circuitState` and technical detail are administrator-only (`FR-F16-02` rule 4).

---

### §Admin — Applications

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/admin/applications` | `ADMIN.APP.LIST` | No |
| GET | `/api/admin/applications/{id}` | `ADMIN.APP.READ` | No |
| POST | `/api/admin/applications` | `ADMIN.APP.REGISTER` | Yes (`APPLICATION_REGISTERED`) |
| PATCH | `/api/admin/applications/{id}` | `ADMIN.APP.EDIT` / `.DISABLE` | Yes (`APPLICATION_UPDATED` / `_ENABLED` / `_DISABLED`) |
| DELETE | `/api/admin/applications/{id}` | `ADMIN.APP.DEREGISTER` | Yes (`APPLICATION_DEREGISTERED`) |
| POST | `/api/admin/applications/test-connection` | `ADMIN.APP.REGISTER` | No |
| POST | `/api/admin/applications/{id}/probe` | `ADMIN.HEALTH.PROBE` | Yes (`APPLICATION_PROBED`) |

**`POST /api/admin/applications`** Request: the full registry record (`FR-F08b-01`) plus `draftId`.
→ `201 { application, registryVersion }`
Errors: `400 VALIDATION_FAILED` (field-level per `FR-F12-02`), `400 CONNECTION_TEST_REQUIRED`, `409 DUPLICATE_APPLICATION_ID`, `409 DRAFT_EXPIRED`, `409 APPLICATION_INCOMPATIBLE`.

**`PATCH /api/admin/applications/{id}`** Request: partial record; `{ enabled, reason }` for enable/disable.
Errors: `400 VALIDATION_FAILED`, `400 IMMUTABLE_FIELD`, `404 APPLICATION_NOT_FOUND`.

**`DELETE /api/admin/applications/{id}`** Request: `{ confirmDisplayName, reason }` → `200 { registryVersion, removedItemEstimate }`. Errors: `400 VALIDATION_FAILED`, `404 APPLICATION_NOT_FOUND`.

**`POST /api/admin/applications/test-connection`** Request: `{ baseEndpoint, healthEndpoint, adapterType, healthTimeoutMs, timeoutMs }`
→ `200 { result: "PASS"|"WARNING"|"FAIL", checks: [{ checkId, label, status, detail }], describe?: {…}, durationMs }`
Always `200`; the outcome is in `result` (`FR-F12-03`).

**`POST /api/admin/applications/{id}/probe`**
→ `200 { health, describe, contractVersionSupported, capabilityChanges: [{ kind, item }], durationMs }`

---

### §Admin — Operations

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/admin/health` | `ADMIN.HEALTH.READ` | No |
| GET | `/api/admin/integration-issues` | `ADMIN.ISSUES.READ` | No |
| GET | `/api/admin/users` | `ADMIN.USER.READ` | Yes (`USER_VIEWED`) |
| GET | `/api/admin/users/{id}` | `ADMIN.USER.READ` | Yes (`USER_VIEWED`) |
| GET | `/api/admin/status` | `ADMIN.HEALTH.READ` | No |
| POST | `/api/admin/failure-injection` | `ADMIN.FAILURE_INJECTION.SET` | Yes (`FAILURE_INJECTED`/`FAILURE_CLEARED`) |
| POST | `/api/admin/operator-token` | `ADMIN.HEALTH.READ` | Yes (`OPERATOR_TOKEN_ISSUED`) |
| POST | `/api/admin/reset` | `ADMIN.HEALTH.PROBE` | Yes (`DEMO_RESET_PERFORMED`) |

**`GET /api/admin/health`** → `200 { applications: [{ applicationId, displayName, status, lastCheckedAt, lastSuccessAt, latencyMs, p50LatencyMs, p95LatencyMs, consecutiveFailures, circuitState, nextProbeAt, injectedMode }], monitorRunning: boolean }`

**`GET /api/admin/integration-issues`** Query: `applicationId`, `errorClass`, `operation`, `principalId`, `from`, `to`, `q`, list params
→ `200 { items: [{ issueId, occurredAt, applicationId, applicationDisplayName, operation, errorClass, spokeHttpStatus, responseExcerpt, attempt, circuitStateAtFailure, principalId, correlationId, adapterRequestId, orchestrationTxId }], …list envelope }`

**`GET /api/admin/status`** → `200 { services: [{ serviceId, label, running, version, health, latencyMs, port, injectedMode, rowCounts{} }], readiness: { level: "READY"|"CAUTION"|"NOT_READY", checks: [{ checkId, label, status, message }] } }`

**`POST /api/admin/failure-injection`** Request: `{ applicationId, mode, slowMs?, errorRatePct?, durationSec? }` → `200 { applicationId, mode, expiresAt }`. Errors: `400 VALIDATION_FAILED`, `404 APPLICATION_NOT_FOUND`, `502 INJECTION_FAILED`.

**`POST /api/admin/reset`** Request: `{ confirmPhrase: "RESET" }` → `202 { startedAt }`; completes < 30 s (`FR-F17-11`).

---

### §Admin — Announcements

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/admin/announcements` | `ADMIN.ANNOUNCEMENT.READ` | No |
| POST | `/api/admin/announcements` | `ADMIN.ANNOUNCEMENT.CREATE` | Yes (`ANNOUNCEMENT_CREATED`) |
| PATCH | `/api/admin/announcements/{id}` | `ADMIN.ANNOUNCEMENT.EDIT` | Yes (`ANNOUNCEMENT_UPDATED`) |
| DELETE | `/api/admin/announcements/{id}` | `ADMIN.ANNOUNCEMENT.EXPIRE` | Yes (`ANNOUNCEMENT_EXPIRED`) |

**`POST /api/admin/announcements`** Request: `{ title, body, severity, targetRoles[], dismissible, actionHref?, actionLabel?, effectiveFrom, expiresAt }` → `201 { announcement }`. Errors: `400 VALIDATION_FAILED`.
`DELETE` is a soft expire (sets `expiresAt = now`); records are never hard-deleted.

---

### §Audit

| Method | Path | Auth | Audit |
|---|---|---|---|
| GET | `/api/audit` | `AUDIT.READ_OWN` / `AUDIT.READ_ALL` | Yes (`AUDIT_VIEWED`) |
| GET | `/api/audit/{auditId}` | scoped | No |
| GET | `/api/audit/chain/{correlationId}` | scoped | No |
| GET | `/api/audit/export` | scoped | Yes (`AUDIT_EXPORTED`) |
| GET | `/api/audit/integrity` | `AUDIT.READ_ALL` | No |

**`GET /api/audit`** Query: `actor`, `actorRole`, `actionType`, `targetSystem`, `targetResourceId`, `outcome`, `correlationId`, `from`, `to`, `q`, list params
→ `200 { items: [audit record fields per FR-F13-02], …list envelope, scope: "OWN"|"ALL" }`
Errors: `400 VALIDATION_FAILED` (range > 90 days, reversed range).

**`GET /api/audit/chain/{correlationId}`** → `200 { correlationId, summary: string, records: [...], redactedCount }`

**`GET /api/audit/export?format=csv|json`** → `200` file stream. Errors: `400 EXPORT_TOO_LARGE`.

**`GET /api/audit/integrity?fromSequence=&toSequence=`** → `200 { verified, recordsChecked, firstBrokenSequence, checkedAt }`

---

### §Documentation

| Method | Path | Auth |
|---|---|---|
| GET | `/api/docs` | `ADMIN.APP.LIST` |
| GET | `/api/docs/openapi.json` | `ADMIN.APP.LIST` |

Generated from route declarations (`FR-F10-06`); a route without documentation fails the CI check.

---

### Endpoint → screen traceability

Every endpoint above is consumed by at least one screen in `FR-F03-02`, and every screen's data requirements are met by these endpoints (`FR-F10-02` rule 1). `/api/admin/status`, `/api/audit/integrity`, and `/api/docs` are additionally documented verification surfaces.

---
## Y1b — Spoke Service Mock API Surfaces

Each of the six simulated services exposes its own independent HTTP API on its own port. These APIs are callable directly — which is how the demo **proves** dual-system change rather than asserting it (`FR-F09-08`, SM-03, SM-13).

**Reachable only by the hub's adapters** in normal operation, plus by a demo operator holding a short-lived operator token (`FR-F09-08`).

---

### Common contract (every spoke)

**Required request headers** on all data endpoints:

| Header | Required | Notes |
|---|---|---|
| `X-UAL-Principal` | Yes | Signed principal assertion; `audience` MUST equal this service (`FR-F01-02`) |
| `X-UAL-Correlation-Id` | Yes | ULID; echoed on the response |
| `X-UAL-Request-Id` | Yes | ULID, unique per call |
| `X-UAL-Scope` | Yes on reads | `{ mode, subjectRef?, principalId?, organization?, assignedRegion? }` — absent scope is refused (`FR-F09-07` rule 2) |
| `X-UAL-Idempotency-Key` | Yes on mutations | ULID (`FR-F09-07` rule 3) |
| `X-UAL-Deadline` | Yes | Absolute ISO-8601; the service aborts at the deadline |

**Common response envelope (success):** every body carries `"_synthetic": true` and every record carries `syntheticMarker` (`FR-F17-08`).

**Common response envelope (error):** `{ "code": "...", "message": "...", "detail": "..." }` — `message` is plain language and safe to surface **only** for `ACTION_REJECTED` (`FR-F08a-06` rule 2).

**Common error codes:**

| HTTP | Code | Meaning | Adapter maps to |
|---|---|---|---|
| 400 | `SCOPE_REQUIRED` | Scope header missing or malformed | `ADAPTER_CONTRACT_ERROR` |
| 400 | `VALIDATION_FAILED` | Payload invalid | `ADAPTER_REJECTED` |
| 401 | `PRINCIPAL_REJECTED` | Assertion missing, unsigned, wrong audience, expired | `ADAPTER_PRINCIPAL_REJECTED` |
| 403 | `FORBIDDEN` | Spoke-side denial for this principal | `ADAPTER_FORBIDDEN` |
| 404 | `NOT_FOUND` | Unknown entity | `ADAPTER_NOT_FOUND` |
| 409 | `IDEMPOTENCY_KEY_REUSED` | Same key, different payload | `ADAPTER_REJECTED` |
| 409 | `STATE_CONFLICT` | `stateVersion` stale | `ADAPTER_REJECTED` |
| 422 | `ACTION_REJECTED` | Business rejection; `message` is user-safe | `ADAPTER_REJECTED` |
| 429 | `RATE_LIMITED` | Throttled | `ADAPTER_RATE_LIMITED` |
| 503 | `SERVICE_UNAVAILABLE` | Injected or genuine unavailability | `ADAPTER_UNREACHABLE` |

**Common endpoints on every spoke:**

| Method | Path | Assertion required | Purpose |
|---|---|---|---|
| GET | `/health` | **No** | `{ status, latencyMs, version, checkedAt, detail? }` — no assertion, so a spoke with a broken auth path is still probeable (`FR-F09-07` rule 6) |
| GET | `/describe` | No | Capability metadata (`FR-F08a-02`) |
| POST | `/admin/injection` | Operator token | `{ mode, slowMs?, errorRatePct?, durationSec? }` (`FR-F16-11`) |
| GET | `/admin/injection` | Operator token | Current injection state |

---

### §eApp — port 7101, namespace `eapp`

| Method | Path | Purpose |
|---|---|---|
| GET | `/cases` | Scoped list; query `status`, `assignee`, `dueFrom`, `dueTo`, `q`, `limit`, `cursor` |
| GET | `/cases/{caseId}` | Full case: sections, answers, outstanding issue refs, related refs |
| GET | `/cases/{caseId}/activity` | eApp's own history |
| GET | `/cases/{caseId}/sections/{sectionCode}` | One questionnaire section with answers |
| POST | `/cases/{caseId}/actions/{actionId}` | Execute an action |
| GET | `/subjects/{subjectRef}` | Subject record (scope-checked) |

**Actions:** `ACKNOWLEDGE_ASSIGNMENT`, `REQUEST_CLARIFICATION`, `RECORD_FINDING`, `ADJUDICATE_CASE`, `RETURN_FOR_CLARIFICATION`, `SUBMIT_APPLICANT_RESPONSE`, `CLEAR_OUTSTANDING_ISSUE`.

**`POST /cases/CASE-A-1042/actions/CLEAR_OUTSTANDING_ISSUE`** — the flagship's eApp leg
Request: `{ issueRef: "ISS-2207", resolvedDisposition: "SUBSTANTIATED", stateVersion }`
→ `200 { outcome: "APPLIED", case: {…}, stateVersion, appliedAt }`
**Idempotent:** if `issueRef` is absent from `outstanding_issue_refs`, returns `200` with `outcome: "APPLIED"` and no change (`FR-F09-02` rule 5) — this is what makes the flagship retry safe.
Errors: `409 STATE_CONFLICT`, `422 ACTION_REJECTED` ("This case can't be updated in its current state."), `404 NOT_FOUND`.

**Demo verification call (`FR-F18-05` step 12):**
```
GET http://localhost:7101/cases/CASE-A-1042
→ { "caseState": "REVIEW_COMPLETE_PENDING_ADJUDICATION",
    "outstandingIssueCount": 0, "outstandingIssueRefs": [], "_synthetic": true }
```

---

### §PVQ — port 7102, namespace `pvq`

| Method | Path | Purpose |
|---|---|---|
| GET | `/issues` | Scoped list; query `status`, `parentCaseRef`, `subjectRef`, `assignee`, `q`, `limit`, `cursor` |
| GET | `/issues/{issueId}` | Full issue incl. `parentCaseRef`, `answerLocus`, `answerSectionLabel`, `answerSnapshot` |
| GET | `/issues/{issueId}/summary` | Lightweight summary for related-item panels |
| GET | `/issues/{issueId}/activity` | PVQ's own history |
| POST | `/issues/{issueId}/actions/{actionId}` | Execute an action |
| GET | `/questionnaires/{id}` | Questionnaire record |

**Actions:** `RESOLVE_ISSUE`, `REQUEST_CLARIFICATION`, `ASSIGN_ISSUE`, `START_REVIEW`.

**`POST /issues/ISS-2207/actions/RESOLVE_ISSUE`** — the flagship's PVQ leg
Request: `{ disposition: "SUBSTANTIATED", narrative: "…", stateVersion }`
→ `200 { outcome: "APPLIED", issue: { status: "RESOLVED_SUBSTANTIATED", disposition, resolutionNarrative, resolvedBy, resolvedByPrincipalId, resolvedAt }, stateVersion, appliedAt }`
Permitted only from `OPEN` or `IN_REVIEW`. Idempotent on `X-UAL-Idempotency-Key`.
Errors: `422 ACTION_REJECTED` — `message`: **"This issue has already been resolved."**; `409 STATE_CONFLICT`; `404 NOT_FOUND`.

**Demo verification call:**
```
GET http://localhost:7102/issues/ISS-2207
→ { "status": "RESOLVED_SUBSTANTIATED", "disposition": "SUBSTANTIATED",
    "parentCaseRef": "CASE-A-1042", "resolvedBy": "Marcus Vale", "_synthetic": true }
```

---

### §IEP — port 7103, namespace `iep`

| Method | Path | Purpose |
|---|---|---|
| GET | `/individuals/{subjectRef}/status` | Status record with plain-language stage explanation |
| GET | `/notices` | Scoped list; query `readState`, `severity` |
| GET | `/notices/{noticeId}` | Notice detail |
| GET | `/tasks` | Scoped list; query `status`, `dueFrom`, `dueTo` |
| GET | `/tasks/{taskId}` | Task detail incl. `responseSchema` |
| POST | `/notices/{noticeId}/actions/ACKNOWLEDGE_NOTICE` | Sets `read_at` |
| POST | `/tasks/{taskId}/actions/COMPLETE_TASK` | Validates against `responseSchema` |
| GET | `/activity` | IEP's own history, scoped |

**Scope note:** IEP accepts `mode: SUBJECT` only. A request with `mode: ASSIGNEE_OR_UNIT` or `ORG` returns `400 SCOPE_REQUIRED` with detail "This service serves individual-scoped requests only." — IEP is `visibleToRoles: [APPLICANT]`.

**Errors:** `422 ACTION_REJECTED` — "This task has already been completed." / "This notice has already been acknowledged."

---

### §PDT — port 7104, namespace `pdt`

| Method | Path | Purpose |
|---|---|---|
| GET | `/designations` | Scoped list; query `status`, `sensitivityLevel`, `riskLevel`, `q` |
| GET | `/designations/{designationId}` | Full designation incl. risk factors and the tier rule text |
| GET | `/designations/{designationId}/activity` | PDT's own history |
| POST | `/designations/{designationId}/actions/{actionId}` | Execute an action |
| GET | `/tier-rules` | The displayable rule table (`FR-F06-09`) |

**Actions:** `APPROVE_DESIGNATION`, `RETURN_DESIGNATION` (`{ reason }`, 10–1000 chars).

**Capability note:** PDT's `describe()` declares `priorityNative: false` and emits no `dueDate`, deliberately exercising the normalization rules in `FR-F05-02` and the "Priority not provided by PDT" affordance.

**Errors:** `422 ACTION_REJECTED` — "This designation isn't awaiting review." / `400 VALIDATION_FAILED` — "Enter a reason for returning this designation."

---

### §IM — port 7105, namespace `im`

| Method | Path | Purpose |
|---|---|---|
| GET | `/investigations` | Scoped list; query `status`, `priority`, `assignee`, `dueFrom`, `dueTo`, `q` |
| GET | `/investigations/{investigationId}` | Full investigation incl. leads and assignment |
| GET | `/investigations/{investigationId}/leads` | Leads list |
| GET | `/investigations/{investigationId}/activity` | IM's own history |
| POST | `/investigations/{investigationId}/actions/{actionId}` | Execute an action |
| GET | `/workload/{principalId}` | Investigator workload counts |

**Actions:** `ACCEPT_ASSIGNMENT`, `UPDATE_CASE_STATUS` (`{ status, note }`), `ADD_LEAD_NOTE` (`{ leadId, note }`), `REQUEST_EXTENSION` (`{ requestedDueDate, reason }`).

**Demo note:** IM is the designated outage-demonstration spoke (`FR-F09-06` rule 6). Stopping this process, or injecting `UNAVAILABLE`, is what drives the degraded-state script (`FR-F18-06` script 2).

**Errors:** `422 ACTION_REJECTED` — "This assignment has already been accepted." / "This investigation is closed and can't be updated."

---

### §CVS — port 7106, namespace `cvs` (demo sixth application)

| Method | Path | Purpose |
|---|---|---|
| GET | `/alerts` | Scoped list; query `status`, `priority`, `assignee`, `q` |
| GET | `/alerts/{alertId}` | Alert detail |
| GET | `/alerts/{alertId}/summary` | Lightweight summary |
| GET | `/alerts/{alertId}/activity` | CVS's own history |
| POST | `/alerts/{alertId}/actions/{actionId}` | Execute an action |

**Actions:** `ACKNOWLEDGE_ALERT`, `CLEAR_ALERT` (`{ reason }`, required), `ESCALATE_ALERT` (`{ reason }`, required).

**`GET /describe`** returns work-item type `CVS_ALERT` with status map `NEW→OPEN`, `UNDER_REVIEW→IN_PROGRESS`, `CLEARED→CLOSED`, `ESCALATED→BLOCKED`, and `capabilities.supportsSearch: true`, `supportsSummary: true`, `supportsActivityHistory: true`.

**Registration note:** CVS runs from first startup but has **no registry row** until an administrator registers it live (`FR-F12-06`). It is a fully ordinary conformant service; nothing in the hub special-cases it, which is the entire point of the extensibility demonstration.

---

### Port and namespace map

| Service | Port | Namespace | Registered at seed |
|---|---|---|---|
| Hub API | 7100 | `hub` | — |
| Web UI | **3000**, bound `0.0.0.0` | — | — |
| eApp | 7101 | `eapp` | Yes |
| PVQ | 7102 | `pvq` | Yes |
| IEP | 7103 | `iep` | Yes |
| PDT | 7104 | `pdt` | Yes |
| IM | 7105 | `im` | Yes |
| CVS | 7106 | `cvs` | **No** — registered live during the demo |

All ports are configurable via a single environment file (`FR-F18-01` rule 6).

> **Amended per TechArch ADR-013,** which supersedes this map's original web UI port of **7000**. The demo is presented through an embedded preview harness that expects a conventional development port and requires a deterministic `0.0.0.0` bind to reach the service from the host. A boot assertion fails fast if the bind host is not `0.0.0.0` or the port is not 3000, so a misconfiguration surfaces as a clear startup error rather than as an application nobody can reach. **Every other port in this map is adopted unchanged.**

---
## Y2 — Consolidated Error Catalog and User-Facing Copy

**Normative.** The `message` column is the exact text the implementation uses. A code not in this catalog cannot be emitted; a startup check validates emitted codes against it (`FR-F10-03` rule 2).

**Copy rules (apply to every message in this document):**
1. Plain language. No jargon, no system internals, no exception names, no stack traces, no hostnames, no ports, no SQL.
2. Say what happened, say whether anything changed, say what to do next.
3. Name the affected system by its registry `displayName` (`{System}`), never by its internal identifier.
4. Never blame the user. Never say "invalid" where "check" will do.
5. Denials never reveal whether a resource exists.
6. Every user-visible error surfaces a copyable correlation ID.
7. `{correlationId}`, `{System}`, `{n}`, `{m}`, `{q}`, `{label}`, `{name}`, `{v}`, `{list}`, `{date}`, `{actor}` are substitution tokens.

---

### 1. Authentication and session

| Code | HTTP | Message | Detail / next step |
|---|---|---|---|
| `AUTH_CONFIG_UNAVAILABLE` | 503 | "Sign-in is temporarily unavailable. Please try again in a moment." | — |
| `AUTH_FAILED` | 401 | "We couldn't sign you in. Check the demo username and code, then try again." | Identical for unknown identity, wrong code, and disabled identity (`FR-F00-04`). |
| `AUTH_FAILED` (cert paths) | 401 | "We couldn't sign you in with the selected identity. Choose a different demo identity or sign-in method." | — |
| `AUTH_TX_EXPIRED` | 400 | "Your sign-in attempt timed out. Choose a sign-in method to start again." | — |
| `AUTH_TX_CONSUMED` | 400 | "That sign-in attempt has already been completed. Choose a sign-in method to start again." | — |
| `AUTH_ATTEMPTS_EXCEEDED` | 429 | "Too many attempts. Choose a sign-in method to start again." | — |
| `IDENTITY_NOT_PROVISIONED` | 403 | "This demo identity isn't set up with a role yet. Choose a different identity." | — |
| `ROLE_NOT_HELD` | 403 | "You don't have that role. Your available roles are shown in the account menu." | — |
| `SESSION_INVALID` | 401 | "You're not signed in. Sign in to continue." | Same copy for missing, altered, and terminated sessions. |
| `SESSION_EXPIRED` | 401 | "You were signed out because of inactivity. Sign in again to pick up where you left off." | Preserves `returnTo`. |
| `SESSION_MAX_LIFETIME` | 401 | "Your session reached its time limit. Sign in again to continue." | — |
| `CSRF_REJECTED` | 403 | "Your request couldn't be completed. Refresh the page and try again." | — |

---

### 2. Authorization

| Code | HTTP | Message | Detail / next step |
|---|---|---|---|
| `AUTHZ_DENIED` | 403 | "You don't have access to this item." | "If you think this is a mistake, contact your administrator and give them reference {correlationId}." Identical for forbidden and non-existent resources (`FR-F02-07`). |
| `AUTHZ_DENIED` (page scope) | 403 | "You don't have access to this page." | Actions: "Go to my dashboard", "Go to my work queue". |
| `AUTHZ_DENIED` (action scope) | 403 | "You don't have permission to do that." | — |
| `AUTHZ_DENIED_UPSTREAM` | 403 | "You don't have access to this item in {System}." | — |
| `ACTION_NOT_AVAILABLE` | 409 | "This action isn't available for this item right now. Refresh the page to see the current options." | — |
| `STATE_CONFLICT` | 409 | "This item changed since you opened it. Refresh to see the latest version, then try again." | — |

---

### 3. Validation — generic

| Code | HTTP | Message |
|---|---|---|
| `VALIDATION_FAILED` (summary) | 400 | "There is a problem. Fix the following, then try again." |
| `VALIDATION_FAILED` (unknown field) | 400 | "Your request couldn't be completed. Refresh the page and try again." |
| Required text field | 400 | "Enter {label}." |
| Required choice field | 400 | "Select {label}." / "Choose a valid {label}." |
| Over max length | 400 | "Shorten this to {n} characters or fewer. You've used {m}." |
| Under min length | 400 | "Enter at least {n} characters." |
| Invalid date | 400 | "Enter a valid date." |
| Reversed date range | 400 | "Enter an end date that comes after the start date." |
| Search too short | 400 | "Enter at least 2 characters to search." |
| Audit range too large | 400 | "Choose a date range of 90 days or fewer." |
| `EXPORT_TOO_LARGE` | 400 | "Narrow your filters — exports are limited to 10,000 records." |
| `RATE_LIMITED` | 429 | "You're making requests faster than we can handle. Wait {n} seconds and try again." |

---

### 4. Upstream (spoke) conditions

| Code | HTTP | Message | Changed anything? |
|---|---|---|---|
| `UPSTREAM_UNAVAILABLE` (read) | 503 | "{System} isn't responding right now, so we can't show this item. Your other work is still available." | No |
| `UPSTREAM_UNAVAILABLE` (write) | 503 | "{System} isn't responding right now, so nothing was changed. Try again in a moment." | **No — stated explicitly** |
| `UPSTREAM_REJECTED_ACTION` | 422 | "{System} couldn't complete this action: {plain reason}. Nothing was changed." | No |
| `UPSTREAM_INDETERMINATE` | 502 | "We're not sure whether {System} completed this action. Refresh this item to check its current status before trying again — reference {correlationId}." | **Unknown — stated explicitly** |
| `UPSTREAM_REJECTED` | 502 | "The {System} system couldn't process this request. We've logged the problem — reference {correlationId}." | No |
| `UPSTREAM_CONTRACT_ERROR` | 502 | "We couldn't read this item from {System}. We've logged the problem — reference {correlationId}." | No |
| `APPLICATION_DISABLED` | 409 | "{System} is turned off in this environment. Contact your administrator if you need access." | No |
| `APPLICATION_INCOMPATIBLE` | 409 | "This application uses an integration version we don't support yet (version {v}). Supported versions: {list}." | No |
| `REGISTRY_UNAVAILABLE` | 503 | "We can't load your work list right now. Try again in a moment — reference {correlationId}." | No |

---

### 5. Orchestration (the distributed-write cases)

| Code | HTTP | Message |
|---|---|---|
| `ORCHESTRATION_PARTIAL` | 207 | "Partly completed. {System A} recorded your resolution. {System B} hasn't been updated yet — we're retrying automatically. You can also retry now. Reference {correlationId}." |
| `ORCHESTRATION_PARTIAL` (retry failed) | 207 | "{System B} still isn't responding. {System A}'s record is unchanged and correct. We'll keep retrying — reference {correlationId}." |
| `ORCHESTRATION_NEEDS_ATTENTION` | 207 | "{System B} couldn't be updated after several attempts. {System A}'s record is correct. An administrator has been notified — reference {correlationId}." |
| `ORCHESTRATION_TIMEOUT` | 504 | "This is taking longer than expected. Check the issue's current status before trying again — reference {correlationId}." |
| `RELATIONSHIP_MISMATCH` | 400 | "We couldn't confirm which case this issue belongs to. Refresh the page and try again — reference {correlationId}." |
| Already completed (retry) | 200 | "This was already completed. Both systems are up to date." |

**Rule:** the word "success" or "successful" MUST NOT appear in any `ORCHESTRATION_PARTIAL` or `ORCHESTRATION_NEEDS_ATTENTION` response or rendered page (`FR-F07b-03` rule 5, R-06). Asserted by test.

---

### 6. Audit

| Code | HTTP | Message |
|---|---|---|
| `AUDIT_UNAVAILABLE` | 503 | "We can't record actions right now, so this action wasn't completed. Try again shortly — reference {correlationId}." |
| `AUDIT_WRITE_FAILED` | 500 | "We couldn't record this action. It may have been applied in {System} — check the item's current status. An administrator has been notified — reference {correlationId}." |
| `METHOD_NOT_ALLOWED` (audit mutation) | 405 | "Audit records can't be changed or deleted." |
| Integrity failure | 200 | "Audit integrity check failed at record {n}. Records may have been altered outside the application. Contact your administrator." |

---

### 7. Administration and registration

| Code | HTTP | Message |
|---|---|---|
| `APPLICATION_NOT_FOUND` | 404 | "We couldn't find that application. It may have been removed." |
| `DUPLICATE_APPLICATION_ID` | 409 | "That application ID is already in use. Choose a different one." |
| `IMMUTABLE_FIELD` | 400 | "The application ID can't be changed because existing records refer to it." |
| `CONNECTION_TEST_REQUIRED` | 400 | "Test the connection before you register this application." |
| `DRAFT_EXPIRED` | 409 | "Your registration draft expired. Start again — your entries weren't saved." |
| `ANNOUNCEMENT_NOT_FOUND` | 404 | "We couldn't find that announcement. It may have been removed." |
| `INJECTION_FAILED` | 502 | "We couldn't change {name}'s simulated state. Check that it's running." |
| De-register confirm mismatch | 400 | "The name you typed doesn't match. Type {displayName} exactly to confirm." |
| Missing reason | 400 | "Enter a reason for this change." / "Enter a reason for removing this application." |

**Connection test outcomes (`FR-F12-03`), all returned with HTTP 200 and a `result` field:**

| Result | Message |
|---|---|
| Unreachable | "We couldn't reach that application at {endpoint}. Check that it's running and the address is correct." |
| Health timeout | "The application didn't respond within {n} milliseconds. Check the address, or increase the health check timeout." |
| Malformed describe | "The application responded, but didn't describe what it can do in a format we understand. It may not support this integration version." |
| Version unsupported | "This application uses integration version {v}, which we don't support yet. Supported versions: {list}." |
| Unknown permission | "This application asks for permissions this system doesn't have: {list}." |
| Degraded (warning) | "The application responded slowly ({n} ms). You can register it, but users may see delays." |
| Zero work-item types (warning) | "This application doesn't provide any work items. It will appear in the admin console but not in users' work queues." |

**Registration field errors:** the full table is `FR-F12-02` and is normative there; it is not duplicated here to avoid divergence.

---

### 8. Degraded-system copy

| Situation | Copy |
|---|---|
| One source down, count known | "{System} is unavailable — {n} items are not shown. The rest of your work is up to date." |
| One source down, count unknown | "{System} is unavailable — some items are not shown." |
| Multiple sources down | One alert listing each system and its count; never a generic "some systems are unavailable." |
| Source slow (row level) | "Slow to respond." |
| Source slow (action level) | "{System} is responding slowly. This may take longer than usual." |
| Action disabled, system down | "{System} isn't responding right now. Try again when it's back." |
| Orchestrated action disabled | "{System} isn't responding right now, so this issue can't be resolved yet." |
| Circuit open | "{System} isn't responding right now. We'll reconnect automatically." |
| Recovery | "{System} is available again. Refresh to see {n} more items." |
| Recovery (action) | "{System} is available again. You can now resolve this issue." |
| All sources down (queue) | "We can't reach any connected systems right now. Your work will appear here automatically when they're back." |
| All sources down (dashboard) | "We can't reach the connected systems right now. Your dashboard will fill in automatically when they're back." |
| All sources down (search) | "We couldn't reach any connected systems. Your search will work again once they're back." |
| Alerts unavailable | "Alerts from {System} aren't available right now." |
| Related item, system down | "{System} isn't responding right now, so this related issue can't be opened." |
| Related item, not entitled | "You don't have access to the related item in {System}." |
| Related item, unconfirmable | "This related item couldn't be confirmed. We've logged the problem — reference {correlationId}." |
| Related case missing | "The related case couldn't be found in eApp. We've logged the problem — reference {correlationId}." |
| Spoke history unavailable | "Some history from {System} isn't available right now." |
| Confirmation re-read failed | "We couldn't confirm the current state in {System}." |
| Health data absent | "No health checks have run yet. The first check runs within {n} seconds." |
| Monitor not running | "Health monitoring isn't running. Statuses below may be out of date." |

---

### 9. Empty-state copy

| Screen / region | Copy |
|---|---|
| Work queue — no matches | "No work items match your filters. Clear filters to see all of your work." |
| Work queue — nothing assigned | "You have no assigned work right now. New assignments will appear here." |
| Search — no results | "No results for '{q}'. Check the spelling, or try a case or subject number." |
| Queue search — no results | "No work items match '{q}'. Check the spelling, or try a case or subject number." |
| Dashboard — assigned work | "You have no assigned work right now. New assignments will appear here." |
| Dashboard — new PVQ issues | "No issues have been raised on your cases in the last 7 days." |
| Adjudicator — awaiting determination | "Nothing is waiting on your determination." |
| Adjudicator — deadlines | "No cases in your organization have upcoming deadlines in the next 14 days." |
| Applicant — tasks | "You don't have anything to do right now. We'll let you know if that changes." |
| Applicant — notices | "You have no notices." |
| Notifications | "You have no notifications. New alerts and announcements will appear here." |
| Alerts | "You have no alerts right now." |
| Related items | "No related items in other systems." |
| Activity history | "No activity recorded yet." |
| Audit viewer | "No audit records match your filters. Try widening the date range." |
| Admin — applications | "No applications are registered yet. Register your first application to get started." |
| Admin — application search | "No applications match '{q}'." |
| Admin — integration issues | "No integration issues in this period. That's good news." |
| Admin — identities | "No identities match your filters." |
| Detail — no actions | "No actions are available for this item." |
| Detail — no spoke history | "Detailed history isn't available from {System}." |
| Search — source excluded | "{System} doesn't support search. Its items aren't included in these results." |

**Rule (`FR-F16-07` rule 2):** an empty state MUST NOT be shown when the true cause is a failure. "You have no assigned work" and "We couldn't load your work" are different statements, and conflating them is prohibited.

---

### 10. Page-level error screens

| Screen | Heading | Body | Actions |
|---|---|---|---|
| SCR-30 Access denied | "You don't have access to this page." | "If you think this is a mistake, contact your administrator and give them reference {correlationId}." | "Go to my dashboard", "Go to my work queue" |
| SCR-31 Not found | "We couldn't find that page." | "The address {path} doesn't match anything in this application. It may have been moved or mistyped." | "Go to my dashboard", "Go to my work queue" |
| SCR-32 Unexpected error | "Something went wrong." | "We hit a problem we didn't expect. Nothing you were doing has been lost. Reference {correlationId}." | "Try again", "Go to my dashboard" |

All three render inside the shell with the demo banner, set a descriptive page title, move focus to the `<h1>`, and announce via `role="alert"` (`FR-F14-10`).

---

### 11. Confirmation and success copy

| Situation | Copy |
|---|---|
| Single-system action | "{Item} updated in {System}. {What changed}." |
| PVQ issue resolved | "Issue ISS-2207 marked Resolved — Substantiated in PVQ." |
| eApp case updated | "Case A-1042 updated in eApp. Outstanding issue cleared." |
| Orchestration complete | "Resolution complete. PVQ and eApp both updated." |
| Orchestration partial | "Partly completed. PVQ updated. eApp not updated." |
| Role switched | "Role changed to {role}. Your menu has been updated." |
| Marked as read | "Marked as read. {n} unread remaining." |
| Connection test passed | "Connection test complete. {System} is healthy, responded in {n} milliseconds." |
| Widget refreshed | "{Widget} updated. {n} items." |
| Sort changed | "Sorted by {field}, {direction}. {n} items." |
| Queue loaded | "{n} work items. Showing {a} to {b}. {m} of {k} systems reporting." |
| Dashboard loaded | "Dashboard loaded. {m} of {k} systems reporting." |

---

### 12. Prohibited content (asserted by `FR-F19-08` rule 5)

User-facing copy anywhere in the application MUST NOT contain: stack-trace patterns (`at `, `.js:`, `Traceback`), exception class names, hostnames or IP addresses, port numbers, SQL fragments, spoke-internal identifiers not shown elsewhere in the UI, raw HTTP reason phrases, or the authentication verbs prohibited by `FR-F00-08` ("verified", "validated", "authenticated against", "trusted certificate").

---
## Y3 — Integration Points and Contracts

**Scope note.** This prototype integrates with **no real external system**. Every integration point below is either internal to the prototype (hub ↔ spoke) or an explicitly simulated stand-in for something that would be external in a production deployment. This is stated first because the credibility of the demonstration depends on being unambiguous about it (PRD §9, NFR-12).

---

### 1. Integration inventory

| # | Integration | Kind | Real or simulated | Owning requirement |
|---|---|---|---|---|
| I-01 | Hub → eApp adapter | Internal HTTP + adapter contract | Simulated spoke | `FR-F08a-01`, `FR-F09-02` |
| I-02 | Hub → PVQ adapter | Internal HTTP + adapter contract | Simulated spoke | `FR-F08a-01`, `FR-F09-03` |
| I-03 | Hub → IEP adapter | Internal HTTP + adapter contract | Simulated spoke | `FR-F08a-01`, `FR-F09-04` |
| I-04 | Hub → PDT adapter | Internal HTTP + adapter contract | Simulated spoke | `FR-F08a-01`, `FR-F09-05` |
| I-05 | Hub → IM adapter | Internal HTTP + adapter contract | Simulated spoke | `FR-F08a-01`, `FR-F09-06` |
| I-06 | Hub → CVS adapter | Internal HTTP + adapter contract | Simulated sixth app | `FR-F12-06` |
| I-07 | Identity provider (CAC/PIV) | Authentication | **Simulated** — identity selection, no PKI | `FR-F00-02` |
| I-08 | Identity provider (ECA) | Authentication | **Simulated** — separate identity pool | `FR-F00-03` |
| I-09 | Identity provider (generic MFA) | Authentication | **Simulated** — deterministic demo code | `FR-F00-04` |
| I-10 | Browser → Hub BFF | HTTP/JSON | Real (within the prototype) | `FR-F10-01` |
| I-11 | Demo operator → spoke APIs | HTTP/JSON | Real (within the prototype) | `FR-F09-08` |
| I-12 | Hub → hub datastore | Database | Real (within the prototype) | `Y0a` |
| I-13 | Each spoke → its own datastore | Database | Real, isolated per namespace | `Y0b` |

**Explicitly absent integrations** (PRD §9): MuleSoft, ServiceNow, JIRA, GitLab, Artifactory, any real DCSA system, any real PKI or ECA trust chain, any AWS GovCloud service. These are simulated at the adapter boundary only, which is sufficient to prove the integration pattern without the real endpoints.

---

### 2. The hub ↔ spoke contract (I-01 … I-06)

This is the prototype's one real integration contract, and the extensibility deliverable.

**Transport:** HTTP/1.1 or HTTP/2, JSON bodies, UTF-8.
**Direction:** hub → spoke only. **A spoke never calls the hub and never calls another spoke** (`FR-F09-01` rule 4).
**Interface:** the eight operations in `FR-F08a-01`.
**Per-spoke API surfaces:** `Y1b`.

**Request contract (hub obligations):**

| Obligation | Requirement |
|---|---|
| Present a signed principal assertion with correct `audience` | `FR-F01-02` |
| Present a mandatory `scope` on every read | `FR-F02-04` |
| Present an idempotency key on every mutation | `FR-F08a-04` |
| Present a correlation ID and a unique request ID | `FR-F01-06` |
| Present an absolute deadline and enforce it hub-side | `FR-F08a-05` |
| Never forward client-supplied role or identity claims | `FR-F02-01` |
| Never send `caseAssignments` to a spoke | `FR-F01-02` rule 5 |

**Response contract (spoke obligations):**

| Obligation | Requirement |
|---|---|
| Verify the assertion; reject unsigned, wrong-audience, or expired | `FR-F09-07` rule 1 |
| Apply the supplied scope in its own query | `FR-F09-07` rule 2 |
| Honour the idempotency key for 24 hours | `FR-F09-07` rule 3 |
| Expose a `stateVersion` that changes on user-visible change | `FR-F09-07` rule 4 |
| Write its own activity record on every mutation | `FR-F09-07` rule 5 |
| Expose `/health` without requiring an assertion | `FR-F09-07` rule 6 |
| Echo the correlation ID | `FR-F09-07` rule 8 |
| Return business rejections as `422 ACTION_REJECTED` with user-safe copy | `FR-F09-07` rule 9 |
| Carry synthetic markers on every record and response | `FR-F09-07` rule 10 |

**Failure contract:** the closed error taxonomy in `FR-F08a-06`, mapped to user-facing copy in `Y2 §4`.
**Resilience contract:** timeouts, bounded retries with backoff, and per-application circuit breaking per `FR-F08a-05`, all configured in the registry rather than in code.
**Conformance:** the standalone suite in `FR-F08a-08` is the acceptance gate for any new adapter.

---

### 3. Cross-system relationship contract

The one place two spokes are semantically connected, specified so it cannot degenerate into a hidden join.

| Aspect | Contract |
|---|---|
| Ownership | **PVQ owns the eApp↔PVQ relationship.** It stores `parentSystem`, `parentCaseRef`, `answerLocus`, `answerSectionLabel`, `answerSnapshot`, `subjectRef` (`FR-F07a-01`). |
| Counterpart | eApp stores only `outstandingIssueCount` and `outstandingIssueRefs` — a count and opaque strings. It knows nothing about issue content. |
| Resolution | **Only the hub resolves references**, via adapters. No spoke dereferences another spoke's identifier. |
| Verification | The hub cross-checks `subjectRef` agreement between the two systems before displaying a relationship (`FR-F07a-01` rule 4). |
| Failure | A mismatch renders as unconfirmable with an `INTEGRATION_REFERENCE_MISMATCH` issue — never as a silently dropped or silently displayed link. |
| Enforcement | No cross-schema foreign key exists; verified by schema introspection (`Y0b` checklist). |

The same pattern governs `eapp.cases.pdt_designation_ref`, `eapp.cases.im_assignment_ref`, `pdt.designations.eapp_case_ref`, and `im.investigations.eapp_case_ref`: opaque strings, hub-resolved, never joined.

---

### 4. Identity provider integration (I-07 … I-09)

| Aspect | Contract |
|---|---|
| Nature | **Simulated.** No certificate is parsed, no signature is checked, no credential is validated against any authority. |
| Distinctness | Three genuinely separate paths with separate identity pools, separate issuer namespaces, and separate selection UIs — demonstrating multi-IdP support rather than one IdP with three skins (`FR-F00-02`, `FR-F00-03`, `FR-F00-04`). |
| Labelling | Every authentication screen states that sign-in is simulated; prohibited verbs are enforced by scan (`FR-F00-08`). |
| Downstream propagation | The hub is the only session authority. Spokes receive an attested principal per call and never perform their own authentication (`FR-F01-02`). |
| Production path | In a real deployment, I-07/08/09 would be replaced by real IdP integrations behind the same session-issuance seam. The rest of the system — session, propagation, authorization, audit — would be unchanged. This is a design property worth stating: the simulation is confined to one boundary. |

---

### 5. Correlation and observability across boundaries

| Aspect | Contract |
|---|---|
| Generation | One ULID correlation ID per user action, generated at the hub edge or adopted from a validated client header (`FR-F01-06`). |
| Propagation | Attached to every adapter call header, every audit record, every integration issue, and every error envelope. |
| Spoke participation | Spokes echo the correlation ID and record it in their own activity tables, so a hub audit record and a spoke activity row for the same action share an identifier. |
| Reconstruction | An administrator can move audit chain → integration issue → application detail → spoke activity for one identifier (`FR-F08b-05` AC-2). |
| Verification | The flagship E2E test asserts a single chain spanning both spoke writes (SM-15, SM-20). |

---

### 6. Integration failure surfaces

Where an integration problem becomes visible, and to whom.

| Surface | Audience | Content | Requirement |
|---|---|---|---|
| Degraded-system alert | All users | Named system, quantified gap, plain language | `FR-F16-05` |
| Row-level source badge | All users | "Slow to respond" | `FR-F05-05` |
| Disabled action with reason | All users | Why this action can't run now | `FR-F16-04` |
| Error envelope | All users / API consumers | Code, plain message, correlation ID | `FR-F10-03` |
| Integration issues log | Administrators | Full technical detail, spoke response excerpt, circuit state | `FR-F11-03` |
| Health view | Administrators | Status, latency, circuit state, check history | `FR-F11-02` |
| Audit chain | Administrators / own actions | What was attempted, by whom, with what outcome | `FR-F13-04` |
| Orchestration transaction | Owner + administrators | Per-leg state and retry affordance | `FR-F07b-03` |

**Rule:** technical detail appears **only** on administrator surfaces. User-facing surfaces carry plain language and a correlation ID (`FR-F08a-06` rule 3, `Y2` copy rules).

---

### 7. Adding a new integration (the extensibility path)

The complete list of what a sixth (or seventh) application requires. If this list grows, extensibility has regressed.

| Step | What | Code change in the hub? |
|---|---|---|
| 1 | Implement the adapter contract (`FR-F08a-01`) as one adapter implementation | New adapter package only — **no hub core change** |
| 2 | Pass the conformance suite (`FR-F08a-08`) standalone | No |
| 3 | Expose `/health` and `/describe` | No |
| 4 | Register through the admin UI (`FR-F12-01`) with a passing live connection test | **No — configuration only** |
| 5 | Choose `visibleToRoles` and confirm discovered capabilities | No |
| 6 | Observe the application appear in navigation, queue, search, health, and console | No restart, no redeploy (NFR-11) |

**What is explicitly NOT required:** a hub code change, a schema migration in the hub, a redeploy, a restart, a change to navigation code, a change to the work-queue fan-out, or a new entry in any hard-coded list — because no such list exists (`FR-F08b-02` rule 1, enforced by a CI grep).

**Demonstrated live:** CVS is registered in front of a reviewer in under 5 minutes, and an already-signed-in investigator sees its work items within one registry poll (SM-11, SM-12).

---

### 8. Integration assumptions and their blast radius

| # | Assumption | If wrong | Blast radius |
|---|---|---|---|
| A-01 | A PVQ issue references an eApp case and a specific answer; resolving it clears the case's outstanding-issue state (PRD Q-04) | Real semantics differ | `FR-F07a-01` relationship fields and `FR-F07a-04`'s disposition→effect table. The orchestration engine, adapter contract, and UI are unaffected — the mapping is configuration (`FR-F07b-07`). |
| A-02 | ABAC attributes are organization, clearance tier, assigned region, case assignment (PRD Q-05) | Real taxonomy differs | `hub.user_attributes` columns and `hub.attribute_rules` expressions. The decision function (`FR-F02-01`) is unchanged. |
| A-03 | Spokes can apply a supplied scope in their own queries | A real legacy system cannot | The adapter absorbs it by filtering post-fetch and reporting a scope violation (`FR-F02-04` rule 3). Correctness is preserved; efficiency is not. |
| A-04 | Spokes can honour an idempotency key | A real system cannot | Orchestration retry must then use a compensating read-before-write. `FR-F07b-03` would need a per-leg strategy field — the engine already reads strategy from configuration. |
| A-05 | The design system is USWDS v3 with token-based theming (PRD Q-01) | The real style guide differs | Token and asset swap (`FR-F14-01`), not a component rewrite. |
| A-06 | The sixth application is "Continuous Vetting Service" (PRD Q-06) | A different app is preferred | Seed data and `Y0b §CVS` only. The onboarding pattern is the point, not the app. |

Each assumption is confined to a named, small surface. That containment is itself a design goal: an integration prototype whose assumptions are load-bearing across the whole system would not survive contact with real requirements.

---
