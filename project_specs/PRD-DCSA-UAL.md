# Product Requirements Document — DCSA Unified Application Access and Integration Prototype

**Project Acronym:** DCSA-UAL
**Document Type:** Product Requirements Document (PRD)
**Status:** Draft v1.0
**Date:** 2026-09-14
**Responds To:** DCSA Innovation Call #01 — "Unified Application Access and Integration Prototype" (DCSA Innovation Gateway, HS0021-26-CSO-DCSA)

> **DEMO — SYNTHETIC DATA ONLY.** This document specifies a demonstration prototype. It contains no real DCSA data, no real PII, and describes no connection to any real government system. All identities, cases, questionnaires, and issue items referenced are fabricated.

---

## 1. Executive Summary

DCSA-UAL is a working demonstration prototype of a **unified application access and integration layer** for the Defense Counterintelligence and Security Agency. It gives investigators, adjudicators, applicants, and administrators a single sign-on entry point, a single personalized dashboard, and a single aggregated work queue spanning five mission applications — eApp, IEP, PVQ, PDT, and Investigation Management — while those five systems remain genuinely separate simulated services behind swappable per-system adapters.

The prototype exists to prove one thesis in a live demonstration: **a user signs in once and completes a cross-application workflow end-to-end without ever logging into, or navigating to, a second system.** Concretely, an investigator opens an eApp case, discovers a related PVQ issue item, resolves it, and observes both underlying systems reflect the change — with no re-authentication and no loss of context.

Everything else in this document is supporting cast for that outcome. The build runs on synthetic data only, conforms to Section 508 / WCAG 2.1 AA using USWDS v3, enforces authorization server-side on every request in alignment with zero-trust principles, writes an immutable audit record on every state change, and demonstrates the hub-and-spoke onboarding pattern by registering a sixth application through the UI as a configuration action rather than a code change.

---

## 2. Problem Statement

DCSA executes personnel vetting, industrial security, counterintelligence, and insider-threat missions through a set of applications that were built and are sustained independently. A user with a single piece of work to finish frequently cannot finish it in a single place. The Innovation Call names the consequence directly: fragmented environments produce disconnected workflows, inconsistent authentication and user experience, and inefficient access paths that increase user burden and reduce operational efficiency.

The pain expresses itself differently for each population, but the root cause is the same — the systems were organized around applications instead of around the work.

**For mission users (investigators, adjudicators):**

- A single logical task — validating a questionnaire answer, clearing an issue item, advancing a case — routinely spans two or three applications that do not share a session.
- Each transition costs a re-authentication, a re-orientation, and a manual re-entry of context (subject identifier, case number, what the user was actually trying to do).
- Work is discovered per-system. There is no single answer to "what is assigned to me and what is due first," so prioritization happens by memory and habit rather than by evidence.
- Users hold multiple roles and attributes across systems, and each system interprets those roles on its own terms.

**For applicants and individuals in the vetting process:**

- Status, notices, and required actions live in different places than the questionnaire itself.
- There is no single, plain-language view of "where am I in this process and what do I owe you next."

**For administrators and the agency:**

- No consolidated view of which applications are connected, which are healthy, and where integration is failing. Problems are discovered by user complaint.
- Onboarding a new application is a bespoke engineering project every time, because there is no repeatable integration contract.
- Auditability is per-system, so reconstructing "who did what, to what, when" across a cross-system action requires correlating multiple logs by hand.
- Sustainment, modification, and modernization costs compound, because every change touches a system that was never designed to be changed in concert with its neighbors.

**The underlying challenge**, as stated in the Innovation Call, is to transition from siloed legacy capabilities to an integrated platform of modular components supporting phased integration, replacement, and modernization of back-end services **without disrupting the user experience or mission execution**. A monolithic replacement is not on the table. The unified layer must deliver a coherent experience on day one while the spokes keep doing their jobs.

**What this prototype must answer:** can a hub-and-spoke unified layer deliver genuinely continuous cross-application work — not four screens stitched together — and can a sixth application be onboarded as configuration rather than code? Those two questions are what a reviewer will be watching for in the demo.

---

## 3. Product Vision

### Vision Statement

**One front door to the mission.** Authorized users sign in once, see all of their work in one place regardless of which system holds it, and complete that work without leaving the unified experience — while the underlying mission applications continue to perform their assigned functions behind a common adapter interface that makes onboarding the next application a configuration change.

### Strategic Goals

- **Prove workflow continuity, not just navigation.** Demonstrate at least one complete cross-application workflow in which the user acts on two different spoke systems, both systems reflect the change, and the user never re-authenticates or re-enters context.
- **Prove the hub-and-spoke seam is real.** Keep the five simulated spokes as separate services with separate data namespaces reachable only through adapters. No shared schema, no cross-system database reads. The adapter boundary is the deliverable, not an implementation detail.
- **Prove extensibility by doing it, not by asserting it.** Register a sixth application live, through the administrator UI, against a data-driven adapter registry.
- **Make zero-trust posture visible.** Authorize every request at the resource level, server-side. Never trust a client-claimed role. Write an audit record on every mutation and expose it in the UI.
- **Meet the federal accessibility bar as a hard gate.** Section 508 / WCAG 2.1 AA via USWDS v3 components and design tokens — accessible forms, data tables, navigation, contrast, keyboard operation, and screen-reader semantics.
- **Be demonstrable by anyone.** A single documented command sequence builds and runs the prototype, and a scripted demonstration path drives the flagship workflow reliably.
- **Earn trust through honesty about scope.** Synthetic data only, plainly labeled on every screen, with simulated authentication clearly identified as simulated.

### Target Users

**Investigator** — Primary demo persona. Carries a caseload from Investigation Management, reviews questionnaire content from eApp, and resolves issue items raised in PVQ. Needs a prioritized queue, fast context switching that isn't actually a context switch, and a defensible record of what was done.

**Adjudicator** — Reviews completed investigative material and renders determinations. Needs case status across systems, due-date visibility, and the same continuity guarantee across the eApp/PVQ/IM boundary.

**Applicant** — The individual in the vetting process. Needs a plain-language status view, outstanding tasks, and notices — sourced from IEP and eApp — without learning which system owns which piece.

**Administrator** — Operates the unified layer itself. Needs an inventory of connected applications, per-application health, an integration error log, the audit trail, and the ability to register a new application.

### Product Principles

> These six carry IDs because downstream documents cite them as requirement parents. Seven user stories (US-008, US-027, US-032, US-118, US-123, US-135, US-150) have **no JTBD ancestor** — they exist to satisfy an agency- and evaluator-facing obligation rather than a user job, because no persona's desired outcome is "see a synthetic-data banner." Rather than fabricate a job for them, `STORY-MAP-DCSA-UAL.md` parents them to these principles by ID.

| ID | Principle | |
|---|---|---|
| **PRIN-01** | **Continuity over navigation.** | If the user has to notice which system they're in, the product has failed. |
| **PRIN-02** | **Server is the authority.** | Client-side hiding is presentation. Authorization and audit happen on the server, every time. |
| **PRIN-03** | **Every button works.** | No dead links, no placeholder screens, no "coming soon." A non-functional control in a demo is worse than a missing one. |
| **PRIN-04** | **Degrade visibly, never blankly.** | An unhealthy spoke produces a clear degraded-system warning and a still-usable rest of the application. |
| **PRIN-05** | **Configuration over code.** | Adding an application, a role, or a work-item type should not require a deployment of the hub. |
| **PRIN-06** | **Honest demo.** | Synthetic data is labeled as synthetic. Simulated auth is labeled as simulated. |

---

## 4. Technical Architecture

### Architectural Shape

The system is **hub-and-spoke**. The hub (the unified application layer) owns identity and session, navigation, work aggregation, audit, and the adapter registry. The five spokes are independently running simulated services, each with its own data namespace, reachable only through a per-system adapter implementing a common interface.

```
                    ┌──────────────────────────────────────┐
                    │   Unified Web UI (USWDS v3)          │
                    │   Dashboard · Work Queue · Detail    │
                    │   Admin Console · Audit Viewer       │
                    └───────────────┬──────────────────────┘
                                    │  authenticated session
                    ┌───────────────▼──────────────────────┐
                    │   HUB — Unified Application Layer    │
                    │   ├─ Simulated IdP / SSO session     │
                    │   ├─ RBAC/ABAC policy engine         │
                    │   ├─ Work aggregation + orchestration│
                    │   ├─ Immutable audit log             │
                    │   ├─ Health monitor                  │
                    │   └─ Data-driven adapter registry    │
                    └───┬───┬───┬───┬───┬──────────────────┘
          adapter iface │   │   │   │   │  (common contract)
                    ┌───▼┐┌─▼─┐┌▼──┐┌▼──┐┌▼──┐
                    │eApp││IEP││PVQ││PDT││ IM│   ← separate services,
                    └────┘└───┘└───┘└───┘└───┘     separate data namespaces
```

### Proposed Stack

> **Confirmed by TechArch (Q-03 closed).** The Innovation Call does not prescribe an implementation stack for a prototype, and no DCSA-standard stack was supplied. The selections below optimize for demonstrability, USWDS fidelity, and single-command startup. **TechArch §2 has since pinned every selection to an exact version with recorded rationale and ADRs, and owns the authoritative stack decision** — this table is the intent, TechArch §2 is the contract.

| Layer | Selection | Rationale |
|---|---|---|
| Design system | USWDS v3 + design tokens | Federal standard; token-based theming allows DCSA style guide swap without rewrite |
| Web UI | TypeScript **server-rendered** React (Next.js App Router) consuming USWDS v3 components | Accessible component primitives; avoids a bespoke component library. **Server-rendered, not an SPA**: FR-F03-03 rule 1 requires the demo banner to be present in the initial document with no client state path to hide it, page `<title>` must be server-set and unique per route, and route-level error/not-found boundaries map directly onto SCR-32 and SCR-31. A pure SPA cannot satisfy those as written. Confirmed in TechArch §2.3. |
| Hub API | TypeScript/Node HTTP service (BFF pattern) | Single server-side authorization and audit choke point |
| Spoke services | Five independent TypeScript/Node services | Separate processes make the hub-and-spoke separation observable, not asserted |
| Persistence | One lightweight relational store per namespace (hub + 5 spokes) | Enforces no-shared-schema constraint physically |
| Session | Server-side session with signed cookie | Simulated SSO; no client-trusted role claims |
| Orchestration | Container compose, single documented command | Deliverability constraint: one command to build, run, demo |
| Testing | Unit + integration + end-to-end + automated a11y scan | Flagship workflow, RBAC enforcement, and adapter behavior must be test-covered |

### Adapter Contract (conceptual)

Every spoke adapter implements the same interface so the hub never special-cases a system:

- `listWorkItems(principal, filters)` — returns normalized work items with source-system attribution
- `getWorkItem(principal, id)` — returns full detail plus available actions for this principal
- `performAction(principal, id, action, payload)` — executes a state change, returns new state
- `getActivityHistory(principal, id)` — returns the item's history as seen by the spoke
- `healthCheck()` — returns availability and latency for the health monitor
- `describe()` — returns capability metadata used by the registry and the admin console

### Key Architectural Constraints

- **No cross-spoke data access.** A spoke may not read another spoke's store. Cross-system workflows are orchestrated by the hub through adapters.
- **Server-side authorization on every request.** The hub resolves the principal's roles and attributes from the session and evaluates policy per resource. The client never supplies its own role.
- **Mandatory audit write.** Every state-changing operation writes an append-only audit record before the response returns. An action that cannot be audited does not complete.
- **Data-driven registry.** Application registration adds a registry row and configuration, not a code path.
- **Token-based theming.** No hard-coded colors, fonts, or spacing values anywhere in the UI.

### Design System Assumption (explicit, flagged for revisit)

Attachment 1 of the Innovation Call, the **"DCSA Ecosystem Style Guide," was not supplied** with the source material available to this effort. A referenced `Page_render_reference.pdf` is likewise not on disk.

**Assumption:** the design system is **USWDS v3** with DCSA-flavored theming applied through USWDS design tokens — federal blue palette, Public Sans typography, and reserved placement for DCSA seal/wordmark in the global header. All theming is expressed as token overrides in a single theme configuration.

**Consequence if the assumption is wrong:** adopting the real style guide is a token/theme change plus an asset swap, not a component rewrite. **This assumption must be revisited the moment Attachment 1 is available**, and any divergence recorded as a change to F14.

---

## 5. Feature Requirements

Features are grouped by capability surface. Every feature carries an ID and a priority. Priorities: **P0** = required for the demonstration to succeed; **P1** = required for a complete, credible prototype; **P2** = valuable, cut first under pressure.

### 5.1 Identity, Access, and Session

---

#### F0: Simulated Multi-Method MFA Authentication

**Description:** A simulated identity provider offering three distinct authentication paths — CAC/PIV, ECA, and a generic MFA method (username + one-time code) — mirroring DCSA's requirement to support multiple identity and access management service providers. Authentication is *simulated*: the user selects an identity and method rather than presenting a validated certificate. The simulation is labeled as such in the UI so no reviewer mistakes it for real PKI.

**Capabilities:**

- Login landing page presenting three clearly differentiated authentication method choices: CAC/PIV, ECA, generic MFA.
- CAC/PIV path: simulated certificate-selection dialog listing synthetic identities with mock certificate subject details; selection establishes the session.
- ECA path: simulated external certificate authority flow with its own synthetic identity set, demonstrating multiple IdPs rather than one IdP with a skin.
- Generic MFA path: username entry followed by a simulated one-time-code step with visible, deterministic demo code handling.
- Each synthetic identity is bound to one or more of the four roles plus attributes (organization, clearance tier, assigned region, case eligibility).
- Explicit on-screen labeling that authentication is simulated and no real credentials are validated.
- Logout that fully terminates the unified session and all downstream spoke context.
- Session timeout with a warning and an accessible re-authentication path.
- Failed-authentication handling with accessible, non-leaking error messaging.

**Acceptance Signals:**

- All three methods produce a working session for at least one synthetic identity per role.
- No real certificate validation occurs and nothing in the UI implies it does.

**Priority:** P0 (Critical — MVP requirement)

---

#### F1: Unified Session and Single Sign-On Across All Spokes

**Description:** One authentication establishes authorized access to every connected spoke for the life of the session. When the user acts on eApp, IEP, PVQ, PDT, or IM through the unified layer, the hub presents the already-established principal to the relevant adapter. The user is never prompted for credentials a second time, and moving between work belonging to different systems requires no interstitial login, no new tab, and no re-entry of context.

**Capabilities:**

- Single server-side session established at login and honored by every adapter call.
- Principal propagation: the hub passes an attested principal (identity, roles, attributes, correlation ID) to each spoke on every call; spokes trust the hub, never the browser.
- Per-spoke session/context handles managed transparently by the hub and invalidated on logout.
- Session continuity across all navigation, including deep links into work-item detail pages belonging to any spoke.
- Zero re-authentication guarantee measured and asserted by automated test across the flagship workflow.
- Correlation identifier attached to every hub→spoke call for audit and troubleshooting.
- Session state surfaced in the UI header: who you are signed in as, active role context, time remaining.

**Acceptance Signals:**

- A scripted traversal touching all five spokes in one session produces exactly one authentication event in the audit log.

**Priority:** P0 (Critical — MVP requirement)

---

#### F2: Role- and Attribute-Based Access Control, Enforced Server-Side

**Description:** Authorization for the four roles — Investigator, Adjudicator, Applicant, Administrator — evaluated on the server for every request at the resource level, incorporating both role and attributes (e.g., case assignment, organization, clearance tier). Client-side conditional rendering exists for usability only and is never the control. This is the feature that carries the zero-trust story.

**Capabilities:**

- Four roles with distinct, documented permission sets across navigation, work items, actions, and administrative functions.
- Attribute-aware rules layered on role: an investigator sees only cases assigned to them or their unit; an applicant sees only their own records.
- Server-side policy evaluation on every API request, including every adapter-mediated read and write — no endpoint trusts a client-supplied role, identity, or scope.
- Resource-level checks, not route-level only: fetching work item X verifies this principal's entitlement to X specifically.
- Action-level authorization: a principal may be permitted to view an item but not to perform a given action on it, and available actions are computed server-side.
- Denied requests return a consistent, accessible, non-enumerable error (no disclosure of whether the resource exists).
- Navigation and controls rendered from server-provided entitlements so the UI never advertises what the user cannot do.
- Role/attribute assignment visible to administrators and recorded in the audit trail.
- Negative-path test coverage: direct API calls attempting cross-role and cross-tenant access are rejected.

**Acceptance Signals:**

- An authenticated Applicant calling an Investigator-only API endpoint directly is denied server-side, and the denial is audited.

**Priority:** P0 (Critical — MVP requirement)

---

### 5.2 Unified User Experience

---

#### F3: Unified Navigation Shell and Global Chrome

**Description:** The persistent application frame every authenticated screen lives inside: DCSA-themed global header, role-aware primary navigation, breadcrumb trail, user/session controls, footer, skip links, and the non-dismissible "Demo – Synthetic Data Only" banner. This is what makes the experience read as one product rather than five, and it is where the "every button works" promise is either kept or broken.

**Capabilities:**

- USWDS header with DCSA wordmark placement, banner region, and primary navigation generated from the principal's server-provided entitlements.
- Non-dismissible "Demo – Synthetic Data Only" banner rendered in the global header on every screen, including login and error pages, with no close control and no CSS/state path to hide it.
- Role-differentiated navigation: each role's nav set is distinct and every item resolves to a real, populated page — zero dead links, zero placeholder screens.
- Breadcrumbs that express cross-application context (e.g., Work Queue → eApp Case A-1042 → Related PVQ Issue) so users always know where they are and can retrace.
- Session/identity control in the header: current identity, active role, sign-out, session timer.
- Skip-to-main-content link, landmark regions, and correct heading hierarchy on every page.
- Responsive layout from mobile viewport up; no horizontal scrolling at 320px width.
- Global search entry point scoped to work items the principal may see.
- Consistent page templates for list, detail, form, and console views so new screens inherit correct structure.

**Acceptance Signals:**

- Automated crawl of every navigation item for every role returns a real page with no 404, no empty shell, and no non-functional control.

**Priority:** P0 (Critical — MVP requirement)

---

#### F4: Role-Specific Personalized Dashboard

**Description:** The landing page after sign-in, composed differently for each of the four roles. It answers "what is mine, what is urgent, what changed, and what should I know" by aggregating across all connected spokes — assigned work, alerts, due dates, application status, recent activity, and system announcements.

**Capabilities:**

- Four distinct dashboard compositions — Investigator, Adjudicator, Applicant, Administrator — each assembled from role-appropriate widgets.
- **Assigned work summary:** counts and top-priority items aggregated across all five spokes, each labeled with its source system.
- **Alerts panel:** actionable exceptions (overdue items, newly raised PVQ issues, blocked cases) with direct links into the relevant work-item detail page.
- **Due dates:** upcoming and overdue items with clear date semantics and accessible status indicators (never color alone).
- **Application status:** for Applicants, plain-language progress through the vetting process sourced from eApp and IEP; for mission roles, status distribution across their caseload.
- **Recent activity:** the principal's own recent actions drawn from the audit trail, with links back to the affected items.
- **System announcements:** administrator-authored notices rendered in a dismissible-per-user notification region (distinct from the non-dismissible demo banner).
- **Degraded-system notice:** when a spoke is unhealthy, the dashboard shows what is incomplete and why rather than silently omitting data.
- Every dashboard widget links to a real destination; empty states are designed, not blank.
- Widget-level loading states so a slow spoke does not block the whole page.

**Acceptance Signals:**

- Signing in as each of the four synthetic personas produces a visibly different, fully populated dashboard with no empty or placeholder widget.

**Priority:** P0 (Critical — MVP requirement)

---

#### F5: Unified Work Queue

**Description:** One list of everything assigned to the signed-in user, aggregated from eApp, IEP, PVQ, PDT, and Investigation Management, normalized into a common work-item shape while retaining clear source-system attribution. Filterable, sortable, searchable, and accessible as a proper data table.

**Capabilities:**

- Aggregation across all five adapters in a single request, with per-source partial-failure tolerance.
- Normalized work-item model: ID, title, subject reference, type, source system, status, priority, assignee, created date, due date, last activity.
- Visible source-system attribution on every row — the user always knows which system owns the item.
- **Filtering** by source system, work-item type, status, priority, assignee, and due-date range, with active filters shown as removable chips and a clear-all control.
- **Sorting** on due date, priority, status, source system, and last activity, with accessible sortable column headers announcing sort state.
- **Search** across title, subject reference, and identifier, scoped server-side to what the principal may see.
- Pagination with accessible page controls and an announced result count.
- Saved/default view per role (e.g., Investigator defaults to "assigned to me, sorted by due date ascending").
- Row-level entry into F6 work-item detail, preserving queue context for return navigation.
- Degraded-source indicator: if IM is unavailable, the queue renders the other four sources plus an explicit "Investigation Management items unavailable" notice.
- Empty state with guidance rather than a blank table.
- Bulk-free by design: actions are performed on the detail page so every action is fully audited in context.

**Acceptance Signals:**

- The queue for the investigator persona contains items originating from at least four distinct spokes, each correctly attributed.

**Priority:** P0 (Critical — MVP requirement)

---

#### F6: Work-Item Detail and Action Completion

**Description:** The page where work actually gets done. It presents the full information for a single work item from its owning spoke, exposes the concrete actions this principal is authorized to perform on it, executes those actions against the spoke through its adapter, and shows the item's complete activity history.

**Capabilities:**

- Full item detail rendered from the owning adapter, with source-system attribution and subject context.
- Server-computed action list: only actions this principal is authorized to perform on this specific item are rendered, and each is re-authorized at execution time.
- Concrete, state-changing actions per work-item type — e.g., acknowledge assignment, request clarification, record a finding, resolve an issue item, approve a designation, submit a response.
- Action forms built from USWDS form components with client-side and server-side validation, inline accessible error messaging, and error summary linking to the offending field.
- Optimistic-free submission: the UI reflects state only after the spoke confirms the write, so displayed state never diverges from system of record.
- **Related items panel:** cross-system relationships surfaced inline (an eApp case links to its related PVQ issue items, its PDT designation, and its IM assignment) — this is the on-ramp to F7.
- **Activity history:** full chronological history for the item, merging the spoke's own history with the hub's audit records, showing actor, action, timestamp, and originating system.
- Confirmation and success states that name exactly what changed and in which system.
- Failure states that distinguish "you are not permitted" from "the source system is unavailable" from "your input was invalid," each with a recovery path.
- Return-to-queue navigation that restores the user's prior filters, sort, and page.

**Acceptance Signals:**

- Each role can complete at least one real, persisted action, and the change is visible in both the spoke's data and the audit trail.

**Priority:** P0 (Critical — MVP requirement)

---

### 5.3 Flagship Capability

---

#### F7: Flagship Cross-Application Workflow — eApp Case → Related PVQ Issue → Dual-System Update

**Description:** **The single most important feature in this product.** An investigator, signed in once, opens an eApp case from the unified work queue, discovers a related PVQ issue item raised against a questionnaire answer, opens and resolves that issue item without leaving the unified experience, and observes both eApp and PVQ reflect the resulting state change. No second login. No second application. No re-entry of context. No manual correlation.

This is the artifact that proves the entire thesis. Per the project charter: if everything else fails, this must work.

**Capabilities:**

- **Entry:** investigator's work queue contains an eApp case work item; opening it loads full case detail with subject context.
- **Discovery:** the case detail page surfaces related PVQ issue items inline, with the relationship explained ("Issue raised against Section 13A employment history"), sourced live through the PVQ adapter — not a hard-coded link.
- **Traversal:** selecting the related issue navigates to the PVQ issue detail *within the unified shell*, carrying case context in the breadcrumb, with no authentication prompt and no visual discontinuity.
- **Action:** the investigator resolves the issue — reviewing the flagged answer, recording a resolution disposition and narrative, and submitting.
- **Orchestration:** the hub executes a coordinated update across two spokes through their adapters: PVQ marks the issue resolved with the disposition; eApp updates the parent case state to reflect that its outstanding issue is cleared.
- **Consistency handling:** if the second write fails, the hub surfaces an explicit partial-completion state with the exact systems affected and a retry path — it never silently reports success.
- **Dual-system confirmation:** a confirmation view shows the resulting state *as reported back by each spoke independently*, so the demo can prove both systems actually changed rather than asserting it.
- **Verification affordance:** the user can return to the eApp case and see the updated status, and open a per-system view showing PVQ's record of the resolution.
- **Audit:** the entire workflow produces a correlated audit chain — one correlation ID spanning the read of the case, the read of the issue, both writes, and the confirmation — viewable as a single narrative in the audit viewer (F13).
- **Continuity assertions:** zero re-authentications, zero context re-entry, zero navigation outside the unified shell — all three asserted by automated end-to-end test.
- **Scripted demo path:** the exact click sequence, starting persona, and expected state at each step documented in the demo script (F18).

**Acceptance Signals:**

- End-to-end automated test drives the full workflow, asserts the post-state in both eApp and PVQ via their independent APIs, and asserts exactly one authentication event for the session.
- A reviewer can complete the workflow manually in under three minutes without instruction beyond the demo script.

**Priority:** P0 (Critical — **highest priority feature in the product**)

---

### 5.4 Integration Layer

---

#### F8: Adapter Framework and Data-Driven Application Registry

**Description:** The common interface every spoke integration implements, plus the configuration-driven registry that tells the hub which applications exist, how to reach them, what work-item types they expose, and what actions they support. This is the mechanism that makes "onboard the next application" a configuration change instead of an engineering project.

**Capabilities:**

- A single documented adapter interface — list, get, act, history, health, describe — that every spoke adapter implements identically.
- Normalization layer mapping each spoke's native representation into the hub's common work-item and activity models, with source attribution preserved.
- **Data-driven registry:** applications are defined as configuration records (identifier, display name, base endpoint, adapter type, work-item types, supported actions, health endpoint, enabled flag, icon/theme token) held in the hub's store.
- Registry-driven behavior throughout: navigation, work-queue fan-out, admin console inventory, and health monitoring all read from the registry — no hard-coded list of five systems anywhere in the hub.
- Enable/disable an application at runtime without redeploying the hub.
- Capability negotiation via `describe()`: an application that supports fewer actions degrades its UI affordances rather than erroring.
- Per-adapter timeout, retry, and circuit-breaking policy configured in the registry.
- Adapter call logging with correlation IDs feeding both audit (F13) and the integration error log (F11).
- Interface conformance test suite that any new adapter must pass, executable standalone.

**Acceptance Signals:**

- Removing an application from the registry removes it cleanly from navigation, queue, and admin console with no code change and no errors.

**Priority:** P0 (Critical — MVP requirement)

---

#### F9: Five Simulated Spoke Services with Isolated Data Namespaces

**Description:** eApp, IEP, PVQ, PDT, and Investigation Management implemented as five genuinely separate simulated services — separate processes, separate APIs, separate data namespaces — each with realistic domain behavior for the workflows in scope. The separation must be real and observable, because a reviewer who suspects a shared database has no reason to believe the integration story.

**Capabilities:**

- **eApp (Electronic Application):** synthetic SF-86-style security questionnaire submissions; sections, answers, case records, submission status, and case state transitions.
- **IEP (Individual Engagement Portal):** individual-facing status records, notices, and outstanding tasks for applicant personas.
- **PVQ (Personnel Vetting Questionnaire):** forms plus **issue items** raised against specific questionnaire answers, with disposition, resolution narrative, and resolution state — the second half of the flagship workflow.
- **PDT (Position Designation Tool):** position sensitivity/risk designations, resulting investigation tier, and designation review work items.
- **IM (Investigation Management):** case assignment, investigative leads, investigator workload, and case status.
- Each service exposes its own HTTP API, independently callable — which is how the demo *proves* dual-system update rather than asserting it.
- Each service owns a distinct data namespace; no service reads another's store, and no shared schema exists.
- Cross-system relationships expressed only as opaque references (e.g., PVQ issue carries an eApp case reference) resolved by the hub, never by direct database join.
- Each service records its own internal activity history, independent of the hub's audit log.
- Per-service health endpoint reporting status and latency.
- Per-service failure injection control (see F16) so degraded behavior can be demonstrated on demand.
- Each service independently startable and stoppable, so "what happens when IM is down" is a real experiment.

**Acceptance Signals:**

- Stopping any single spoke leaves the hub and the remaining four fully functional, with a visible degraded warning.

**Priority:** P0 (Critical — MVP requirement)

---

#### F10: Unified Layer API (Backend-for-Frontend)

**Description:** The hub's own HTTP API — the single server-side surface the web UI consumes and the only place authorization and audit are enforced. It is a product surface in its own right: it is what a future mobile client, a partner system, or an evaluator's curl command would talk to, and it is where the zero-trust claims are actually testable.

**Capabilities:**

- Authentication and session endpoints (methods list, initiate, complete, session info, logout).
- Entitlements endpoint returning the principal's server-computed navigation and permission set.
- Dashboard composition endpoint returning role-appropriate widget data with per-source status.
- Work-queue endpoints supporting filter, sort, search, and pagination parameters, with partial-source-failure reporting.
- Work-item detail, available-actions, action-execution, and activity-history endpoints.
- Cross-application orchestration endpoint backing the flagship workflow, returning per-system outcomes.
- Administrative endpoints: application inventory, health, integration errors, application registration, announcements.
- Audit query endpoints with filtering.
- Consistent error contract: machine-readable code, human-readable message, correlation ID, and no information disclosure on denial.
- Every endpoint authorizes server-side; every mutating endpoint writes audit before responding.
- Published API documentation (OpenAPI-style) generated from the implementation and available to reviewers.
- Request correlation IDs propagated end-to-end from browser through hub to spoke.

**Acceptance Signals:**

- Every documented endpoint is exercised by an automated test, including at least one unauthorized-access negative case each.

**Priority:** P0 (Critical — MVP requirement)

---

### 5.5 Administration and Governance

---

#### F11: Administrator Console — Connected Applications, Health, and Integration Issues

**Description:** The administrator's operational view of the unified layer: what is connected, whether it is working, and what has gone wrong. This is the feature that demonstrates the platform is operable, not just usable.

**Capabilities:**

- **Connected applications inventory:** every registered application with display name, identifier, adapter type, endpoint, exposed work-item types, supported actions, enabled state, and registration date — read directly from the registry (F8).
- **Per-application health:** current status (healthy / degraded / unavailable), last successful check, response latency, and recent check history, sourced from the health monitor (F16).
- **Integration issues / error log:** chronological, filterable record of adapter failures — timestamp, application, operation, error class, correlation ID, and the affected principal where applicable — with links to the corresponding audit entries.
- Application detail view: full configuration, health history, recent errors, and a manual "test connection" action that performs a live health check on demand.
- Enable/disable an application from the console, with the change audited and immediately reflected in user-facing navigation and queue.
- **System announcements management:** create, edit, expire, and target announcements by role, surfaced on user dashboards (F4).
- **User and role visibility:** synthetic identities, their assigned roles and attributes, and their recent activity.
- Entry point to the audit viewer (F13) scoped to administrative concerns.
- Console-wide accessible data tables with sort, filter, and pagination consistent with F5 patterns.
- Every console action is itself authorized and audited — administrators are not exempt.

**Acceptance Signals:**

- Inducing an adapter failure produces a new, correctly attributed entry in the integration error log within one health-check interval.

**Priority:** P1 (Required for a complete prototype)

---

#### F12: Application Registration and Onboarding Flow

**Description:** An in-app, UI-driven flow for registering a sixth application into the unified layer — demonstrating the repeatable onboarding pattern the Innovation Call asks the prototype to establish. Registering an application is a configuration action performed live during the demo, not a code change, not a redeploy.

**Capabilities:**

- Guided multi-step USWDS form: application identity (name, identifier, description, icon/theme token) → connection (base endpoint, adapter type, health endpoint, timeout/retry policy) → capabilities (work-item types, supported actions) → access (which roles may see it) → review and confirm.
- **Live connection test** during registration: the hub calls the candidate application's health and `describe()` endpoints and shows the result before allowing submission.
- Capability auto-discovery: where `describe()` is supported, work-item types and actions are pre-populated from the application's own declaration and shown for confirmation.
- Validation with accessible inline errors and an error summary; duplicate-identifier and unreachable-endpoint conditions are caught with clear guidance.
- On submission, a registry record is created and the application immediately appears in the admin inventory, health monitoring, role-scoped navigation, and the unified work queue — without restarting the hub.
- A **demo sixth application** ("Continuous Vetting Service" or equivalent synthetic service) ships with the prototype, unregistered by default, specifically so registration can be performed live in front of a reviewer.
- Edit and de-register flows with confirmation, both fully audited.
- Registration and de-registration write audit records naming the administrator, the application, and the configuration.
- Onboarding documentation generated alongside: what a new application must implement to be registerable.

**Acceptance Signals:**

- During a live demo, an administrator registers the sixth application and an investigator immediately sees its work items in the unified queue — with zero code changes and zero restarts.

**Priority:** P1 (Required for a complete prototype — this is the extensibility proof)

---

#### F13: Immutable Audit Trail and Audit Viewer

**Description:** An append-only record of who did what, to what, and when — written on every state-changing operation across the platform, and viewable and filterable in the UI. The audit trail is not optional instrumentation; an action that cannot be audited does not complete.

**Capabilities:**

- **Mandatory write on every mutation:** the audit record is written as part of the operation, before the success response is returned.
- Record schema: timestamp, actor identity, actor roles/attributes at time of action, action type, target system, target resource identifier, outcome, correlation ID, and a before/after state summary where applicable.
- **Append-only storage:** no update or delete path exists in the application for audit records; the absence of mutation endpoints is verified by test.
- Coverage beyond mutations: authentication events (success and failure), authorization denials, application registration changes, and adapter failures are all recorded.
- **Correlated cross-system chains:** a single correlation ID links every hub and adapter operation belonging to one user action, so the flagship workflow reads as one coherent narrative rather than four disconnected rows.
- **Audit viewer UI:** accessible data table with filtering by actor, role, action type, target system, resource, outcome, and date range; sortable and paginated.
- Detail view for a single audit record, and a chain view showing all records sharing a correlation ID.
- Role-scoped visibility: administrators see the full trail; mission users see their own activity (surfaced as "recent activity" on the dashboard and on item detail pages).
- Export of a filtered audit view for demonstration purposes.
- Integrity indicator: sequence numbering and per-record hash chaining so tampering is detectable and demonstrably so.

**Acceptance Signals:**

- Every mutating endpoint in F10 produces exactly one audit record per successful invocation, verified by automated test.
- The flagship workflow renders as a single correlated chain in the viewer.

**Priority:** P0 (Critical — MVP requirement)

---

### 5.6 Interface Quality, Data, and Operability

---

#### F14: USWDS v3 Accessible Interface Implementation (Section 508 / WCAG 2.1 AA)

**Description:** The accessible, design-system-conformant web interface itself — treated as a first-class feature, not a byproduct of building endpoints. For a federal audience, accessibility failures are disqualifying. Every screen in this product is built from USWDS v3 components and themed exclusively through design tokens.

**Capabilities:**

- USWDS v3 component library adopted wholesale; no bespoke component library and no reimplementation of components USWDS already provides.
- **Theming via design tokens only** — federal blue palette, Public Sans typography, USWDS spacing/radius tokens. No hard-coded color, font, or spacing literals anywhere in the codebase, verified by lint rule.
- **Accessible forms:** programmatically associated labels, described-by hint text, required-field indication that is not color-only, inline error messaging, error summary at the top of the form with focus management and in-page links to offending fields, and fieldset/legend grouping for related inputs.
- **Accessible data tables:** proper header scope, captions, sortable column headers that announce sort state, accessible pagination controls, and announced result counts for filter/search changes.
- **Accessible navigation:** landmark regions, skip-to-main-content link, current-page indication in navigation, keyboard-operable menus, and logical, visible focus order.
- **Color contrast:** all text and meaningful non-text elements meet WCAG 2.1 AA ratios; status is never conveyed by color alone — always paired with text and/or icon.
- **Keyboard operation:** every interactive element reachable and operable by keyboard alone; no keyboard traps; modals trap focus correctly and restore it on close.
- **Screen-reader semantics:** correct roles and names on all controls, live regions for asynchronous updates (queue refresh, action results, degraded-system warnings), and descriptive page titles that change on navigation.
- **Motion and zoom:** respects reduced-motion preference; usable at 200% zoom and at 320px viewport width without loss of function.
- Accessibility statement page describing conformance level and known limitations.
- Automated accessibility scanning integrated into CI (F19), plus a documented manual keyboard and screen-reader pass.

**Assumption (flagged):** DCSA Ecosystem Style Guide not supplied — USWDS v3 with token-based DCSA theming assumed. See §4, Q-01. Revisit on receipt of Attachment 1.

**Acceptance Signals:**

- An automated accessibility scan across **every authenticated route for every one of the four roles** reports zero serious and zero critical violations, and the build fails if it does not (SM-07).
- The flagship workflow is completed start to finish **keyboard-only**, with focus landing predictably at every cross-application boundary (SM-08).
- A lint rule finds zero hard-coded color, font, or spacing literals in the codebase (NFR-03).

**Priority:** P0 (Critical — hard requirement, not a polish item)

---

#### F15: Notifications, Alerts, and System Announcements

**Description:** The information layer that tells users something needs their attention: work-driven alerts derived from spoke data, and administrator-authored system announcements. Distinct from the demo banner, which is permanent chrome.

**Capabilities:**

- **Derived alerts** computed server-side from aggregated spoke data: overdue items, newly assigned work, newly raised PVQ issue items on a case the user owns, blocked or stalled cases, and approaching due dates.
- Alert presentation on the dashboard (F4) and as a header indicator with an accessible count.
- Each alert links directly to the work item that produced it, preserving context.
- **System announcements** authored by administrators (F11) with title, body, severity, target roles, and effective/expiry dates.
- Announcement rendering using USWDS site-alert patterns, dismissible per user and per announcement (dismissal state persisted), never obscuring the demo banner.
- Notifications list page: all current alerts and announcements for the principal, filterable by type and severity.
- Read/unread state for alerts, with an accessible mark-as-read action.
- Live-region announcement of new alerts for screen-reader users without stealing focus.
- Alert generation is read-only over spoke data — it never mutates a spoke, so it never needs to be undone.

**Acceptance Signals:**

- Every alert on every dashboard resolves to the real, populated work item that produced it, and the header count reconciles with the notifications list (SM-06, SM-24).
- An administrator-authored announcement targeted at one role appears on that role's dashboard and on no other, is dismissible per user, and **never obscures the demo banner** under any combination of announcement severity and open modal (NFR-13, SM-10).

**Priority:** P1 (Required for a complete prototype — "alerts" and "system announcements" are named Innovation Call outcomes)

---

#### F16: Health Monitoring, Resilience, and Degraded-System Experience

**Description:** Background health checking of every registered application, plus the full set of resilience behaviors and UX states that keep the prototype usable when a spoke misbehaves. The requirement is explicit: adapter failure must degrade visibly and gracefully. Never a blank page, never an unhandled error.

**Capabilities:**

- **Background health monitor:** periodic asynchronous health checks against every enabled application's health endpoint, recording status, latency, and check history.
- Circuit-breaker behavior per adapter: repeated failures open the circuit, the hub stops hammering the failing spoke, and half-open probing restores service automatically on recovery.
- Configurable per-adapter timeouts and bounded retries with backoff, so one slow spoke cannot stall the aggregate work-queue request.
- **Degraded-system warning:** a prominent, accessible warning wherever incomplete data is shown, naming the affected application and what is missing ("Investigation Management is unavailable — 12 items are not shown").
- **Partial success by default:** the work queue and dashboard render everything available rather than failing wholesale when one source is down.
- Actions targeting an unavailable spoke are pre-emptively disabled with an explanatory message rather than allowed to fail mid-submission.
- **Loading states:** skeleton/spinner treatments at widget and section granularity with accessible busy announcements, so a slow source does not blank the page.
- **Empty states:** every list, table, and widget has a designed empty state explaining what would appear here and what the user can do.
- **Error states:** distinct, recoverable presentations for authorization denial, validation failure, source-system unavailability, and unexpected error — each with a correlation ID for support and a clear next action.
- Global error boundary guaranteeing that no unhandled condition produces a blank page or a stack trace.
- **Failure injection controls** (administrator-only, demo-scoped): force any spoke into unavailable, slow, or erroring state on demand, so resilience can be demonstrated live rather than described.
- Automatic recovery: when the spoke returns, the warning clears and data reappears without the user reloading or re-authenticating.

**Acceptance Signals:**

- With IM forced offline, the investigator's queue still renders the other four sources plus a visible degraded warning — and no error page appears anywhere in the application.

**Priority:** P1 (Required for a complete prototype — this is a named Innovation Call evaluation concern)

---

#### F17: Synthetic Seed Data Corpus

**Description:** A realistic, internally consistent body of synthetic data spanning all five spoke systems and all four roles — rich enough that every screen looks like a working system, and coherent enough that cross-system relationships (especially the flagship workflow's eApp↔PVQ link) are genuine rather than staged.

**Capabilities:**

- Synthetic identities covering all four roles, including at least one multi-role identity to exercise attribute-based access control.
- **eApp:** multiple synthetic questionnaire submissions at varying completion and review states, with section-level answers realistic in shape but obviously fictitious in content.
- **IEP:** status records, notices, and outstanding tasks for applicant personas.
- **PVQ:** forms and issue items raised against specific eApp answers, in open, in-review, and resolved states — including the specific unresolved issue that anchors the flagship demo.
- **PDT:** position designations across sensitivity levels with resulting investigation tiers and pending review items.
- **IM:** cases assigned across investigators with varied status, priority, and due dates, including overdue items so alerts and due-date sorting have something real to show.
- **Referential coherence across namespaces:** subject references, case references, and issue-to-answer references line up across the five services even though the stores are separate.
- Volume calibrated for demonstration: enough rows to make filtering, sorting, searching, and pagination meaningful; not so many that the demo is slow.
- **Obviously synthetic content:** fabricated names, fictional addresses, invalid-by-construction identifiers, and no data resembling real persons — plus per-record synthetic markers.
- Deterministic seeding: the same seed produces the same data every time, so the demo script's expected states are reliable.
- **Reset-to-baseline command** restoring all five namespaces and the hub to pristine demo state, so the flagship workflow can be run repeatedly.
- Seed data documented: what exists, which persona sees what, and which records the demo script depends on.

**Acceptance Signals:**

- Signing in as each of the four personas produces a fully populated (or intentionally, designedly empty) experience across **every screen reachable by that role** — no accidental empty widget.
- **Every filter facet, for every role, returns at least one result** on the default date range; pagination is exercised on the investigator queue, the audit viewer, and the admin inventory.
- Seed validation **fails startup with a specific, actionable message** when any flagship precondition is missing or any persona binding is broken — a demo starting on broken data is worse than one that refuses to start.
- The flagship workflow runs three consecutive times with a reset between each, producing an identical result every time (SM-22).

**Priority:** P0 (Critical — without it, every screen is an empty state)

---

#### F18: Demo Operability — Single-Command Run and Scripted Demonstration Path

**Description:** The prototype must build, run, and be demonstrated from a single documented command sequence, with a scripted path that drives the flagship workflow reliably. Per the project constraints: a prototype nobody can start is a prototype that scored zero.

**Capabilities:**

- **One documented command** brings up the hub, the web UI, all five spoke services, and the seeded data from a clean checkout on a clean machine.
- Pre-flight check reporting prerequisite versions and port availability with actionable messages when something is missing.
- Deterministic seed applied automatically on startup; `reset` command returns everything to baseline mid-demo.
- README covering: prerequisites, the start command, the URL, the four demo personas and how to sign in as each, and the reset command.
- **Scripted demonstration path for the flagship workflow (F7):** numbered steps, starting persona, exact navigation, the action to take, and the expected observable state at each step — including how to independently verify both eApp and PVQ changed.
- Secondary demo scripts — **five**, matching the five secondary segments in `JOURNEYS-DCSA-UAL.md` §The Scripted Demonstration Path:
  1. **Degraded-system behavior** (induce failure, observe the named and quantified warning, restore, observe automatic recovery) — Segment 2.
  2. **Sixth-application registration** (F12) live through the UI, with an already-signed-in investigator observing in a second window — Segment 3.
  3. **Role-level zero trust** — the same PVQ issue work item opened by the investigator and by the adjudicator, presenting different server-computed action sets — Segment 4.
  4. **Resource-level zero trust** — an authenticated applicant calling a legitimate endpoint with **another subject's resource ID**, denied server-side with a consistent non-enumerable error, and the denial visible in the audit trail. Demonstrated live via `curl` — Segment 5b, JRN-03.02.
  5. **Audit chain review** (F13) — one correlation ID resolving an entire cross-system action, including the administrator's own actions — Segment 6.
- Health/status page listing every running service and its state, so a demo operator can confirm readiness at a glance before presenting.
- Clean shutdown command that stops all services without orphaned processes or ports.
- Documented troubleshooting for the three most likely demo-day failures.

**Acceptance Signals:**

- A reviewer with no prior exposure follows the README and reaches a signed-in dashboard in under ten minutes.

**Priority:** P0 (Critical — deliverability constraint)

---

#### F19: Automated Test and Accessibility Verification Suite

**Description:** Automated coverage for the three things whose failure would invalidate the demonstration: the flagship workflow, RBAC enforcement, and adapter behavior — plus automated accessibility scanning across every route.

**Capabilities:**

- **End-to-end test of the flagship workflow (F7):** drives the full browser path and asserts post-state independently in both eApp and PVQ via their own APIs, plus asserts exactly one authentication event.
- **RBAC enforcement tests:** for each of the four roles, positive tests for permitted operations and negative tests for direct API calls to unauthorized endpoints and unauthorized resource identifiers.
- **Adapter conformance tests:** every adapter implements the full interface correctly, normalizes correctly, and behaves correctly under timeout, error, and unavailable conditions.
- **Resilience tests:** with a spoke forced offline, the queue and dashboard render partial results with the degraded warning and no error page.
- **Audit coverage tests:** every mutating endpoint writes exactly one audit record; audit records cannot be modified or deleted through any application path.
- **Automated accessibility scan** (axe-core or equivalent) across every authenticated route for every role, run in CI, failing the build on any serious or critical violation.
- Keyboard-navigation smoke test asserting reachability and operability of primary controls.
- **Link and control integrity test:** crawls every navigation item and primary control for every role, asserting a real destination and no non-functional control — the automated form of "every button works."
- Test results summarized in a form a reviewer can read, not just a CI log.

**Acceptance Signals:**

- **Every success metric SM-01 through SM-25 maps to a named test with a current pass/fail status** in the reviewer-readable report, and requirements with no verifying test are visibly flagged rather than silently uncovered.
- The suite produces identical results across three consecutive runs, and no test depends on the current wall-clock date.
- The link-and-control integrity crawl passes for all four roles: zero 404s, zero placeholder screens, zero controls without a handler, a destination, or a documented disabled reason (SM-05, SM-06, PRIN-03).

**Priority:** P1 (Required for a complete prototype — named in the project requirements)

---

## 6. Non-Functional Requirements

| ID | Category | Requirement | Verification |
|---|---|---|---|
| NFR-01 | Accessibility | All screens conform to Section 508 / WCAG 2.1 AA. Automated scans report zero serious or critical violations; manual keyboard and screen-reader passes documented. | Automated CI scan (F19) + documented manual pass |
| NFR-02 | Accessibility | Status and meaning are never conveyed by color alone; all interactive elements are keyboard-operable with visible focus. | Manual audit + automated checks |
| NFR-03 | Design System | 100% of UI built from USWDS v3 components; zero hard-coded color, font, or spacing literals; all theming via design tokens. | Lint rule + code review |
| NFR-04 | Zero Trust | Every API request is authorized server-side at the resource level. No endpoint trusts a client-supplied role, identity, or scope. | Negative-path tests on every endpoint |
| NFR-05 | Zero Trust | Client-side conditional rendering is presentation only; bypassing the UI never grants access. | Direct API penetration tests per role |
| NFR-06 | Auditability | Every state-changing action writes an audit record before the success response returns. Actions that cannot be audited do not complete. | Automated per-endpoint audit assertion |
| NFR-07 | Auditability | Audit storage is append-only; no application path can modify or delete a record. Records are sequence-numbered and hash-chained. | Test asserting absence of mutation paths |
| NFR-08 | Data Integrity | No spoke reads another spoke's data store. Cross-system relationships resolve only through the hub via adapters. | Architecture review + isolated store verification |
| NFR-09 | Resilience | Failure or unavailability of any single spoke never produces a blank page, an unhandled error, or a total outage of the unified layer. | Failure-injection tests for all five spokes |
| NFR-10 | Resilience | Degraded state is always visible and specific — the affected application is named and the missing data is quantified. | Manual + automated degraded-state tests |
| NFR-11 | Extensibility | Registering a sixth application requires configuration only — no code change, no hub redeploy, no restart. | Live registration of the demo sixth app |
| NFR-12 | Privacy | No real PII, no real DCSA data, no connection to any real government system. All content is obviously synthetic. | Data review + seed-data provenance documentation |
| NFR-13 | Privacy | A non-dismissible "Demo – Synthetic Data Only" banner renders at the top of the document, above the header, on every screen — with no close control and no CSS, state, or feature-flag path to hide it. Its **verbatim copy is present in the accessible DOM at every viewport**; below 640px the *visible* copy may truncate to its bold lede to stay inside the measured chrome budget that keeps SCR-11's status answer above the fold at 320×568 (see FR-F03-03 and NFR-16 — the NFR-13 / SM-25 tension is resolved by budget, not by dismissal). | Automated presence check on every route, asserting accessible text rather than visible text |
| NFR-14 | Usability | Every navigation item resolves to a real, populated page. Zero dead links, zero placeholder screens, zero non-functional controls. | Automated crawl per role (F19) |
| NFR-15 | Observability | Every user action carries a correlation ID propagated through hub and adapter calls into both audit and error logs. | Correlation assertion in flagship E2E test |
| NFR-16 | Responsiveness | Interface is usable from 320px viewport width upward and at 200% zoom without loss of function or horizontal scrolling. | Manual responsive audit |
| NFR-17 | Performance (demo-grade) | Dashboard and work queue render within 2 seconds under seeded demo data; a slow spoke never blocks the rest of the page beyond its configured timeout. | Timed demo-path measurement |
| NFR-18 | Deliverability | Clean checkout to running, seeded application via a single documented command sequence on a clean machine. | Fresh-machine dry run before demo |
| NFR-19 | Maintainability | Adding a work-item type or action to an existing spoke requires adapter-level changes only, never hub core changes. | Design review |
| NFR-20 | Security Posture | Sessions expire with warning; logout fully terminates hub and all spoke context; failed authentication discloses nothing about identity validity. | Session and auth tests |

---

## 7. Success Metrics

All metrics are **demo-evaluable and observable** — a reviewer can verify each one during or immediately after a live demonstration. This is deliberate: the evaluation lens for this Innovation Call is concept viability, mission alignment, and whether the cross-system workflow is genuinely continuous rather than four screens stitched together.

### Primary Metrics (the demo passes or fails on these)

| # | Metric | Target | How Observed |
|---|---|---|---|
| SM-01 | **Flagship workflow completion** | Investigator completes eApp case → related PVQ issue → resolution → dual-system update end-to-end in a single session | Live demo + automated E2E test |
| SM-02 | **Re-authentications during flagship workflow** | **Exactly zero** | Audit log shows exactly one authentication event for the session |
| SM-03 | **Dual-system state change verified independently** | Both eApp and PVQ return updated state when queried through their own APIs | Independent API query shown live |
| SM-04 | **Context loss during workflow** | Zero — no manual re-entry of subject, case, or issue identifiers at any step | Demo script observation |
| SM-05 | **Navigation integrity** | 100% of primary navigation items, for all four roles, resolve to a real populated page | Automated crawl (F19) |
| SM-06 | **Non-functional controls** | **Zero** dead links, placeholder screens, or buttons that do nothing | Automated control-integrity test + manual walkthrough |

### Accessibility and Compliance Metrics

| # | Metric | Target | How Observed |
|---|---|---|---|
| SM-07 | Automated accessibility violations | **Zero serious or critical** violations across all routes for all roles | CI accessibility scan report |
| SM-08 | Keyboard-only task completion | Flagship workflow completable using keyboard alone | Manual keyboard pass, recorded |
| SM-09 | Color contrast conformance | 100% of text and meaningful non-text elements meet WCAG 2.1 AA | Automated contrast check |
| SM-10 | Demo banner presence | Present on 100% of routes, including login and error pages; zero dismissal paths | Automated per-route assertion |

### Architecture and Extensibility Metrics

| # | Metric | Target | How Observed |
|---|---|---|---|
| SM-11 | **Sixth-application registration** | Registered live through the UI in under 5 minutes, with zero code changes and zero restarts | Live demo |
| SM-12 | Post-registration visibility | Newly registered app appears in admin inventory, health monitoring, role navigation, and work queue immediately | Live demo |
| SM-13 | Spoke isolation | Zero cross-namespace data access; each spoke independently startable and queryable | Architecture review + live API calls |
| SM-14 | Work-queue source coverage | Investigator queue contains correctly attributed items from at least 4 of 5 spokes | Live demo |

### Resilience Metrics

| # | Metric | Target | How Observed |
|---|---|---|---|
| SM-15 | **Adapter outage behavior** | Forced spoke outage produces a visible, specific degraded-system warning — **never an error page or blank screen** | Live failure injection |
| SM-16 | Partial-result rendering | With one spoke down, remaining sources render fully and remain actionable | Live failure injection |
| SM-17 | Automatic recovery | Restored spoke clears the warning and restores data without user reload or re-authentication | Live failure injection |

### Security and Audit Metrics

| # | Metric | Target | How Observed |
|---|---|---|---|
| SM-18 | Server-side authorization coverage | 100% of API endpoints enforce authorization server-side; 100% of direct unauthorized API calls are denied | Negative-path test report |
| SM-19 | Audit coverage | 100% of state-changing actions produce exactly one audit record | Automated audit assertion |
| SM-20 | Flagship audit chain | The entire flagship workflow is retrievable as a single correlated chain in the audit viewer | Live demo of audit viewer |

### Operability Metrics

| # | Metric | Target | How Observed |
|---|---|---|---|
| SM-21 | **Time to running application** | Under 10 minutes from clean checkout to signed-in dashboard following the README | Fresh-machine dry run |
| SM-22 | Demo repeatability | Flagship workflow runnable 3 consecutive times with a reset between each, identical result each time | Pre-demo rehearsal |

### Role Experience Metrics

> These three were previously cited downstream as "SM-05". They are distinct claims from navigation integrity and each is separately demo-observable, so each now carries its own ID. Downstream documents (JTBD, JOURNEYS, PERSONAS, UX-Mockup) cite these IDs.

| # | Metric | Target | How Observed |
|---|---|---|---|
| SM-23 | **Role-differentiated composition** | Signing in as each of the four roles produces a visibly and substantively different dashboard and navigation set — different widgets, different counts, different nav items — not a relabelled copy | Live demo, four sign-ins side by side (F4 acceptance signal) |
| SM-24 | Time-to-next-item | The correct next item to work is reachable from the dashboard in **two clicks or fewer**, for the investigator and the adjudicator | Demo script observation |
| SM-25 | **Applicant time-to-answer** | The applicant answers "where am I in this process" within **30 seconds of signing in, on a 320×568 viewport, without scrolling**, and the screen contains **zero unexplained internal system names, tier codes, or state abbreviations** | Live demo on a phone-width viewport + automated above-the-fold assertion (F19) |

---

## 8. Risks and Mitigations

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-01 | **Style guide unavailable** — DCSA Ecosystem Style Guide (Attachment 1) was not supplied; assumed theming may not match evaluator expectations | Medium | High | Build entirely on USWDS v3 with token-based theming so the real guide is a token/asset swap, not a rewrite. Record the assumption prominently (§4) and state it openly in the demo. |
| R-02 | **Flagship workflow feels stitched together** — the demo reads as four screens rather than continuous work | **Critical** | Medium | Treat F7 as the highest-priority feature; build it first and keep it working. Enforce breadcrumb context carry-over, zero interstitials, and shell-internal navigation. Assert continuity in automated tests, not just by eye. |
| R-03 | **Scope breadth starves the flagship** — twenty features compete for finite build time and the demo centerpiece is under-polished | High | High | Strict priority discipline: P0 features only until F7 is demo-solid end-to-end. P2 items are explicitly expendable. Vertical slices, not horizontal layers. |
| R-04 | **Accessibility treated as end-stage polish**, producing serious violations at demo time | **High — federal audience; failures are disqualifying** | Medium | Accessibility is F14, a P0 feature, not a task. USWDS components from the first screen. Automated a11y scan in CI from day one, failing the build. Manual keyboard/SR pass before demo. |
| R-05 | **Shared-schema shortcut** under time pressure collapses the five spokes into one store, invalidating the integration claim | High | Medium | Separate processes and separate stores enforced from the first commit. Architecture test asserting isolation. Spokes independently queryable during the demo as proof. |
| R-06 | **Dual-system update partially fails** during the demo, producing an inconsistent or dishonest success message | High | Low | Explicit partial-completion state with named affected systems and a retry path. Never report success on a partial write. Confirmation view reads state back from each spoke independently. |
| R-07 | **Extensibility becomes hard-coded** — the "register a sixth app" flow works only for the one app shipped for the demo | High | Medium | Registry is data-driven from the start; hub contains no hard-coded list of applications. Conformance test suite any adapter must pass. Removing an app from the registry must cleanly remove it everywhere. |
| R-08 | **Demo environment fails on demo day** — dependency, port, or seeding problem on an unfamiliar machine | **Critical** | Medium | Single-command containerized startup (F18). Pre-flight checks. Fresh-machine dry run before the demo. Reset command. Documented troubleshooting for the three likeliest failures. |
| R-09 | **Synthetic data looks fake or is too thin**, making screens read as unfinished | Medium | Medium | F17 is P0. Realistic volume and referential coherence across namespaces. Every list has enough rows for filtering/sorting/pagination to be meaningful. |
| R-10 | **Synthetic data looks too real**, raising a PII concern with a security-minded evaluator | High | Low | Obviously fabricated names and invalid-by-construction identifiers. Per-record synthetic markers. Non-dismissible demo banner on every screen (NFR-13). |
| R-11 | **Placeholder screens survive to demo day**, violating the "every button works" promise | High | Medium | Automated control-integrity crawl per role in CI (F19). No feature merges with a non-functional control. Cut scope rather than ship a stub. |
| R-12 | **Zero-trust claims are asserted but not demonstrable** | Medium | Medium | Negative-path tests on every endpoint; direct API denial demonstrable live. Audit viewer shows denials, not only successes. |
| R-13 | **Degraded-system handling untested** because failures never occurred in development | Medium | Medium | Administrator failure-injection controls (F16) make degradation reproducible on demand; resilience tests run in CI. |
| R-14 | **Prototype mistaken for production-ready**, creating expectations around ATO, IL4/IL5, or real integration | Medium | Medium | Explicit Out of Scope section (§9), reinforced verbally in the demo and by the persistent banner. Position as Phase 2 evidence, not Phase 4 delivery. |
| R-15 | **Audit write becomes optional** under implementation pressure, leaving mutations unrecorded | High | Low | Audit write is inside the mutation path, before the response. Automated assertion on every mutating endpoint. |

---

## 9. Out of Scope

Each exclusion below is deliberate and reasoned. Listing them is part of the product: a prototype that pretends to cover Phase 4 concerns is less credible, not more.

**Real data and real systems**

- **Real DCSA data, real PII, or connections to real government systems.** This is a synthetic-data demonstration. Handling real CUI or PII would require the security authorization posture this prototype explicitly does not claim. Every screen says so.

**Authentication and PKI**

- **Real CAC/PIV certificate validation, real PKI, real ECA trust chains.** Certificate math cannot be meaningfully performed outside the government environment, and it is not the behavior under evaluation. The evaluable claim is *SSO continuity across applications* — which F0 and F1 demonstrate with simulated identity selection. The simulation is labeled as simulated.

**Deployment and authorization**

- **AWS GovCloud IL4/IL5 deployment, ATO artifacts, and security authorization packages.** These are Innovation Call Phase 4 concerns. This prototype produces Phase 2-style evidence — architecture viability and demonstrated workflow continuity — not an authorization package.
- **Production-grade high availability, disaster recovery, and performance engineering.** Correctness and demonstrability come first; scale engineering follows a production-transition decision. Demo-grade responsiveness (NFR-17) is the bar here.

**Sustainment and replacement**

- **Sustainment of the real IE applications.** The Innovation Call places IE sustainment in the OTA scope as an ongoing responsibility across all phases. It is not something a demonstration build can or should simulate.
- **Rewriting or replacing the legacy applications.** The architecture is hub-and-spoke by design. The spokes stay behind adapters. A monolith replacement would contradict the thesis under test.

**Enterprise tool integrations**

- **MuleSoft, ServiceNow, JIRA, GitLab, and Artifactory integrations.** These are government-furnished environment dependencies unavailable outside DCSA. They are simulated at the adapter boundary only — which is sufficient to prove the integration pattern without the real endpoints.

**Advanced analytics**

- **AI/ML risk scoring and behavioral threat analytics (BTAC).** Named in the Innovation Gateway's broader technical priorities, but explicitly outside Innovation Call #01's prototype scope. Including them would dilute the workflow-continuity thesis this prototype exists to prove.

**Platform breadth**

- **Native mobile applications.** Responsive web only. A responsive USWDS interface serves the demonstration need; native clients add build surface with no evaluation value.
- **Applications beyond the five in scope (plus the demo sixth).** The Innovation Call scopes the initial prototype to eApp, IEP, PVQ, and PDT; IM is included here because it anchors investigator workload. The sixth application exists specifically to demonstrate onboarding, not to add mission capability.

**Process**

- **Real user research and usability testing with actual DCSA personnel.** Named as an ongoing Innovation Call activity, but requires government-furnished access to designated users. The prototype is built to *support* that engagement, not to substitute for it.

---

## 10. Feature Index

| ID | Feature | Surface | Priority | Rationale |
|---|---|---|---|---|
| **F0** | Simulated Multi-Method MFA Authentication | UI + API | **P0** | Entry point; demonstrates multiple IdP support (CAC/PIV, ECA, generic MFA) |
| **F1** | Unified Session and SSO Across All Spokes | API + Session | **P0** | Core Innovation Call outcome: no repeated logins across applications |
| **F2** | Role- and Attribute-Based Access Control (server-side) | API + Policy | **P0** | Zero-trust posture; least-privilege across four roles |
| **F3** | Unified Navigation Shell and Global Chrome | UI | **P0** | Makes five systems read as one product; carries the demo banner |
| **F4** | Role-Specific Personalized Dashboard | UI + API | **P0** | Named outcome: assigned work, alerts, due dates, status, activity, announcements |
| **F5** | Unified Work Queue | UI + API | **P0** | Aggregation across all five spokes with filter/sort/search and attribution |
| **F6** | Work-Item Detail and Action Completion | UI + API | **P0** | Where work is actually completed; on-ramp to the flagship workflow |
| **F7** | **Flagship Cross-Application Workflow (eApp → PVQ)** | UI + Orchestration | **P0 — HIGHEST** | **The single artifact that proves the entire thesis** |
| **F8** | Adapter Framework and Data-Driven Application Registry | Integration | **P0** | Makes onboarding configuration, not code; no hard-coded app list |
| **F9** | Five Simulated Spoke Services with Isolated Namespaces | Services + Data | **P0** | Proves hub-and-spoke separation is real, not asserted |
| **F10** | Unified Layer API (Backend-for-Frontend) | API | **P0** | Single server-side authorization and audit choke point |
| **F11** | Administrator Console — Applications, Health, Errors | UI + API | **P1** | Demonstrates the platform is operable, not just usable |
| **F12** | Application Registration and Onboarding Flow | UI + API | **P1** | The extensibility proof — sixth app registered live |
| **F13** | Immutable Audit Trail and Audit Viewer | Data + UI | **P0** | Named requirement; non-optional under zero trust |
| **F14** | USWDS v3 Accessible Interface (508 / WCAG 2.1 AA) | UI + Assets | **P0** | Hard federal requirement; failures are disqualifying |
| **F15** | Notifications, Alerts, and System Announcements | UI + Async | **P1** | Named Innovation Call outcomes for the landing experience |
| **F16** | Health Monitoring, Resilience, Degraded-System UX | Async + UI | **P1** | Graceful degradation is an explicit evaluation concern |
| **F17** | Synthetic Seed Data Corpus | Data | **P0** | Without it every screen is an empty state |
| **F18** | Demo Operability — Single-Command Run + Demo Script | Ops + Docs | **P0** | A prototype nobody can start scores zero |
| **F19** | Automated Test and Accessibility Verification Suite | Tests + CI | **P1** | Protects flagship workflow, RBAC, adapters, and a11y from regression |

### Priority Summary

| Priority | Count | Features |
|---|---|---|
| **P0** | 15 | F0, F1, F2, F3, F4, F5, F6, **F7**, F8, F9, F10, F13, F14, F17, F18 |
| **P1** | 5 | F11, F12, F15, F16, F19 |
| **P2** | 0 | — (none; anything not essential was moved to Out of Scope rather than deprioritized) |

> **Note on P0 count:** F7 is P0 but is additionally designated the highest-priority feature in the product. If build time compresses, everything else yields to F7.

### Requirement Traceability

| Charter Requirement | Covered By |
|---|---|
| Simulated MFA login (CAC/PIV, ECA, generic) with SSO across spokes | F0, F1 |
| Role-based + attribute-aware access control, server-side | F2, F10 |
| Role-specific personalized dashboard | F4, F15 |
| Unified work queue with filter/sort/search and attribution | F5 |
| Work-item detail: review, act, view history | F6 |
| **Flagship cross-application workflow** | **F7** |
| Administrator console: apps, health, integration issues | F11, F16 |
| Application registration flow (onboarding pattern) | F12, F8 |
| Immutable audit trail, viewable and filterable | F13 |
| Five spokes as separate services behind common adapters | F9, F8 |
| USWDS v3 accessible UI (508 / WCAG 2.1 AA) | F14, F3 |
| Realistic synthetic seed data | F17 |
| Error / loading / empty states + degraded-system warning | F16 |
| Demo operability: one command + scripted demo path | F18 |
| Automated tests (flagship, RBAC, adapters) | F19 |

---

## 11. Open Questions and Assumptions

> **Status key.** *Closed — Decided*: settled downstream, no further input needed. *Open — external input required*: cannot be closed from inside this effort. *Assumption — bounded*: a modelling choice whose blast radius if wrong is documented in FRD `Y3 §Assumptions` (A-01…A-06) and is confined to configuration and seed data.

| # | Item | Type | Disposition |
|---|---|---|---|
| Q-01 | DCSA Ecosystem Style Guide (Attachment 1) not supplied | **Open — external input required** | Cannot be closed from inside this effort; the attachment was never supplied. USWDS v3 + token-based DCSA theming assumed meanwhile. **Revisit immediately on receipt.** Impact bounded to F14 theming tokens and header assets (FRD `Y3` A-05: a token and asset swap, not a component rewrite). Disclosed on SCR-36, the accessibility statement, per `FR-F14-11`. |
| Q-02 | `Page_render_reference.pdf` referenced but not on disk | **Open — external input required** | Cannot be closed from inside this effort. Proceeding without it; layout follows the four standard USWDS page templates defined in UX-Mockup §Page Templates. |
| Q-03 | Implementation stack not prescribed by the Innovation Call | **Closed — Decided** | TechArch §2 pins every selection to an exact version against four hard constraints, with rejections recorded as ADRs. Node 22 LTS / TypeScript 5.6 / Next.js 15 App Router (server-rendered) / Fastify 5 / USWDS 3.11 / containerized Postgres. §4 above is updated to match. |
| Q-04 | Exact eApp↔PVQ relationship semantics in the real systems | **Assumption — bounded** | Modeled as: a PVQ issue item references a specific eApp case and answer; resolving the issue clears the case's outstanding-issue state. Plausible and sufficient for demonstration; would be validated in a real Phase 1 discovery. |
| Q-05 | Attribute taxonomy for ABAC (which attributes actually govern access at DCSA) | **Assumption — bounded** | Synthetic taxonomy: organization, clearance tier, assigned region, case assignment. Demonstrates the mechanism; real taxonomy is a discovery output. |
| Q-06 | Identity of the demo "sixth application" | **Closed — Decided** | **Continuous Vetting Service (`CVS`).** No longer a placeholder: standardized downstream in TechArch §17, FRD `Y0b §CVS`, `FR-F12-06`, `FR-F17-01` (9 seeded alerts, unregistered at seed), JOURNEYS JRN-04.01/JRN-01.02 preconditions, and US-099. Substituting a different service is still only a seed-data change — the onboarding pattern is the point — but the demo is now built against CVS. |
| Q-07 | Whether IM belongs in the initial prototype set | **Decision** | Included. The Innovation Call scopes the initial set to eApp, IEP, PVQ, and PDT, but IM anchors investigator workload and is named in the broader sustainment set. Including it makes the investigator persona credible. |

---

## 12. Related Documents

| Document | Relationship |
|---|---|
| `.planning/PROJECT.md` | Source charter — requirements, constraints, key decisions |
| `project_specs/ref_docs/DCSA_Innovation_Call_01_Unified_Application_Layer.pdf.md` | Governing requirement (input, not specification) |
| `project_specs/ref_docs/DCSA_Innovation_Gateway_20260623.pdf.md` | Parent solicitation — technical priorities, evaluation criteria |
| `project_specs/ref_docs/Att_1__Solution_Concept_Paper_Template_20260623.docx.md` | Narrative framing template (not a build input) |
| `project_specs/FRD-DCSA-UAL.md` | *(downstream)* Functional requirements derived from these features |
| `project_specs/TechArch-DCSA-UAL.md` | *(downstream)* Technical architecture; owns stack decisions deferred from §4 |
| `project_specs/UserStories-DCSA-UAL.md` | *(downstream)* User stories and acceptance criteria per feature |

---

*Document status: Draft v1.0 — 2026-09-14. Generated as the foundation for FRD, TechArch, and UserStories.*
*DEMO — SYNTHETIC DATA ONLY. No real DCSA data, no real PII, no real system connections.*
