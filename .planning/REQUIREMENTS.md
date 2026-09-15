# Requirements: DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

**Defined:** 2026-09-15
**Core Value:** A user signs in once and completes a cross-application workflow end-to-end without ever logging into — or navigating to — a second system.

**ID policy:** Requirement IDs are the PRD feature IDs (F0–F19) and NFR IDs (NFR-01–NFR-20), preserved verbatim. The FRD (182 FRs), UserStories (151 stories), STORY-MAP (3 releases), and RTM (182-row traceability matrix) all cite these IDs. Renaming would fork every downstream document.

**Source of truth:** `project_specs/PRD-DCSA-UAL.md` §5 (features), §6 (NFRs), §9 (out of scope). Detailed behavior lives in `project_specs/FRD-DCSA-UAL.md`. This file is the scoping contract; the specs are the specification.

---

## v1 Requirements

All 20 PRD features are in v1. The brief called for a complete, fully functional MVP, and the Innovation Call's Phase 2 and Phase 3 outcomes depend on the extensibility and operability features that a P0-only cut would remove.

### Identity and Access

- [ ] **F0**: Simulated multi-method MFA authentication — user selects CAC/PIV, ECA, or a generic MFA method, completes a simulated challenge, and is issued a hub session. Failed authentication discloses nothing about identity validity. *(P0)*
- [ ] **F1**: Unified session and SSO across all spokes — once authenticated at the hub, the user reaches eApp, IEP, PVQ, PDT, and IM content with zero additional authentication events for the life of the session. *(P0)*
- [ ] **F2**: Role- and attribute-based access control enforced server-side — every request is authorized at the resource level against role, attributes, and ownership for Investigator, Adjudicator, Applicant, and Administrator. An applicant can read only their own records, enforced at the data layer. *(P0)*

### Unified Experience

- [ ] **F3**: Unified navigation shell and global chrome — one header, role-aware primary navigation, skip link, landmark structure, footer identifier, and the non-dismissible "Demo – Synthetic Data Only" banner on every route. *(P0)*
- [ ] **F4**: Role-specific personalized dashboard — four structurally distinct dashboards showing assigned work, alerts, due dates, application status, recent activity, and system announcements appropriate to the signed-in role. *(P0)*
- [ ] **F5**: Unified work queue — one queue aggregating work items from all five spokes into a normalized item model, with source-system attribution, filter, sort, search, and pagination. A single spoke failing degrades the queue visibly; it never fails it. *(P0)*
- [ ] **F6**: Work-item detail and action completion — user reviews item information, sees a server-computed action set that differs by role, completes an action, and reads the full activity history. *(P0)*
- [ ] **F7**: **Flagship cross-application workflow** — an investigator opens an assigned eApp case, sees a related PVQ issue surfaced inline, traverses to it without leaving the shell, resolves it with a disposition and narrative, and observes both the PVQ issue status and the eApp case outstanding-issue state update, with correlated audit records and no re-authentication. Partial failure of the second write is reported honestly and never described as success. *(P0 — highest priority in the product)*

### Integration Layer

- [ ] **F8**: Adapter framework and data-driven application registry — a common adapter interface every spoke implements, with a registry that drives fan-out. No hard-coded application list anywhere in hub core. *(P0)*
- [ ] **F9**: Five simulated spoke services with isolated namespaces — eApp, IEP, PVQ, PDT, and IM run as separate services over separate data namespaces. No spoke reads another spoke's store; cross-system relationships resolve only through the hub. *(P0)*
- [ ] **F10**: Unified layer API (backend-for-frontend) — a single server-side choke point where authorization and audit are structurally unbypassable. *(P0)*

### Administration and Extensibility

- [ ] **F11**: Administrator console — connected applications inventory, per-application health detail, and an integration-issue log with correlation IDs. *(P1)*
- [ ] **F12**: Application registration and onboarding flow — an administrator registers a sixth application through the UI, configures its health probe, and sees it appear in the console and begin reporting health without a code change, redeploy, or restart. *(P1)*

### Trust and Accountability

- [ ] **F13**: Immutable audit trail and audit viewer — every state-changing action writes an append-only, sequence-numbered, hash-chained record (actor, role, action, target system, target id, timestamp, outcome, correlation id) before the success response returns. Filterable viewer in the UI. *(P0)*
- [ ] **F14**: USWDS v3 accessible interface — Section 508 / WCAG 2.1 AA across every screen: accessible forms with associated errors, accessible data tables, keyboard operability, visible focus, focus management on navigation and async update, live-region announcements, landmark structure, color-independent meaning, 320px reflow, 200% zoom. Theming via design tokens only, no hard-coded literals. *(P0)*

### Operational Realism

- [ ] **F15**: Notifications, alerts, and system announcements — role-targeted announcements and item-level alerts on the dashboard, dismissible per user, never obscuring the demo banner. *(P1)*
- [ ] **F16**: Health monitoring, resilience, and degraded-system UX — health probes per registered application, circuit breaking, a degraded-system warning that names the affected application and quantifies the missing data, actions disabled with an explanation rather than silently failing, and a failure-injection mechanism to demonstrate it. *(P1)*
- [ ] **F17**: Synthetic seed data corpus — idempotent seed across all five spokes and all four roles, covering every UI precondition the demo exercises, including edge states (overdue, unassigned, zero-item applicant, degraded spoke). Persona identities bound to PER-01–PER-04; startup fails if a persona is missing or double-bound. *(P0)*

### Deliverability

- [ ] **F18**: Demo operability — clean checkout to running, seeded application via a single documented command sequence on a clean machine, plus a scripted demonstration path an evaluator can follow. *(P0)*
- [ ] **F19**: Automated test and accessibility verification suite — unit, integration, adapter-contract, end-to-end (flagship workflow), automated accessibility scanning, RBAC negative-path, and resilience/degradation tests, with a CI artifact mapping requirements to tests. *(P1)*

---

## Non-Functional Requirements (v1)

These are not optional polish. NFR-01/02 (accessibility), NFR-04/05 (zero trust), NFR-06/07 (auditability), NFR-12/13 (synthetic-data disclosure) and NFR-14 (no dead routes) are each independently disqualifying if unmet.

| ID | Category | Requirement |
|----|----------|-------------|
| **NFR-01** | Accessibility | All screens conform to Section 508 / WCAG 2.1 AA; automated scans report zero serious or critical violations; manual keyboard and screen-reader passes documented |
| **NFR-02** | Accessibility | Meaning is never conveyed by color alone; every interactive element is keyboard-operable with visible focus |
| **NFR-03** | Design System | 100% of UI built from USWDS v3 components; zero hard-coded color/font/spacing literals; all theming via design tokens |
| **NFR-04** | Zero Trust | Every API request authorized server-side at the resource level; no endpoint trusts a client-supplied role, identity, or scope |
| **NFR-05** | Zero Trust | Client-side conditional rendering is presentation only; bypassing the UI never grants access |
| **NFR-06** | Auditability | Every state-changing action writes an audit record before the success response returns; actions that cannot be audited do not complete |
| **NFR-07** | Auditability | Audit storage is append-only, sequence-numbered, and hash-chained; no application path can modify or delete a record |
| **NFR-08** | Data Integrity | No spoke reads another spoke's data store; cross-system relationships resolve only through the hub via adapters |
| **NFR-09** | Resilience | Failure of any single spoke never produces a blank page, an unhandled error, or a total outage of the unified layer |
| **NFR-10** | Resilience | Degraded state is always visible and specific — affected application named, missing data quantified |
| **NFR-11** | Extensibility | Registering a sixth application requires configuration only — no code change, no hub redeploy, no restart |
| **NFR-12** | Privacy | No real PII, no real DCSA data, no connection to any real government system; all content obviously synthetic |
| **NFR-13** | Privacy | Non-dismissible "Demo – Synthetic Data Only" banner on every screen, with no CSS, state, or feature-flag path to hide it; verbatim copy present in the accessible DOM at every viewport |
| **NFR-14** | Usability | Every navigation item resolves to a real, populated page — zero dead links, zero placeholder screens, zero non-functional controls |
| **NFR-15** | Observability | Every user action carries a correlation ID propagated through hub and adapter calls into both audit and error logs |
| **NFR-16** | Responsiveness | Usable from 320px viewport width upward and at 200% zoom without loss of function or horizontal scrolling |
| **NFR-17** | Performance | Dashboard and work queue render within 2 seconds under seeded demo data; a slow spoke never blocks the rest of the page beyond its configured timeout |
| **NFR-18** | Deliverability | Clean checkout to running, seeded application via a single documented command sequence on a clean machine |
| **NFR-19** | Maintainability | Adding a work-item type or action to an existing spoke requires adapter-level changes only, never hub core changes |
| **NFR-20** | Security Posture | Sessions expire with warning; logout fully terminates hub and all spoke context; failed authentication discloses nothing about identity validity |

---

## v2 Requirements

Deferred. Tracked but not in the current roadmap.

### Production Transition (Innovation Call Phase 4)

- **V2-ATO-01**: Security authorization package and ATO evidence artifacts
- **V2-ATO-02**: AWS GovCloud IL4/IL5 deployment topology and infrastructure-as-code
- **V2-ATO-03**: Production-grade high availability, disaster recovery, and performance engineering

### Real Integration

- **V2-INT-01**: Real identity provider integration with PKI-backed CAC/PIV certificate validation and ECA trust chains
- **V2-INT-02**: Real MuleSoft API integration replacing the mock adapter for one spoke
- **V2-INT-03**: ServiceNow / JIRA integration for the integration-issue log

### Breadth

- **V2-APP-01**: Onboarding of the remaining DCSA applications and required forms (DD254, additional standard forms) beyond the initial five
- **V2-UX-01**: Real DCSA Ecosystem Style Guide applied via token swap, replacing the USWDS-default theming assumption
- **V2-ANL-01**: AI/ML-assisted risk indicators and anomaly surfacing, with human judgment retained at the decision point

---

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real DCSA data, real PII, real government system connections | Synthetic-data prototype by mandate; a real-data connection would be both impossible outside the enclave and a privacy violation |
| Real PKI / CAC / PIV certificate validation, real ECA trust chains | Authentication is simulated; the evaluable behavior is SSO continuity across applications, not certificate cryptography |
| AWS GovCloud IL4/IL5 deployment and ATO packages | Innovation Call Phase 4 concerns, not an MVP demonstration build |
| Sustainment of the real IE applications | An OTA performance obligation, not a deliverable of a demonstration prototype |
| Rewriting or replacing the legacy applications | Contradicts the hub-and-spoke thesis — the spokes staying separate is the point |
| MuleSoft, ServiceNow, JIRA, GitLab, Artifactory integrations | Simulated at the adapter boundary only; real integration requires the government environment |
| AI/ML risk scoring and behavioral threat analytics | Named in the Gateway's broader priorities but not in Innovation Call #01's prototype scope |
| Native mobile applications | Responsive web only; the applicant persona is served phone-first through the web UI |
| Production-grade HA, DR, and performance engineering | Correctness and demonstrability come first; NFR-17 sets the demo-grade bar |
| External SaaS dependencies | The demo must run deterministically on an evaluator's machine without network reliance |

---

## Traceability

Populated during roadmap creation. See `.planning/ROADMAP.md` for phase goals and success criteria.

| Requirement | Phase | Status |
|-------------|-------|--------|
| F0 | Phase 2 | Pending |
| F1 | Phase 2 | Pending |
| F2 | Phase 2 | Pending |
| F3 | Phase 3 | Pending |
| F4 | Phase 4 | Pending |
| F5 | Phase 4 | Pending |
| F6 | Phase 4 | Pending |
| F7 | Phase 5 | Pending |
| F8 | Phase 1 | Pending |
| F9 | Phase 1 | Pending |
| F10 | Phase 2 | Pending |
| F11 | Phase 6 | Pending |
| F12 | Phase 7 | Pending |
| F13 | Phase 2 | Pending |
| F14 | Phase 3 | Pending |
| F15 | Phase 4 | Pending |
| F16 | Phase 6 | Pending |
| F17 | Phase 1 | Pending |
| F18 | Phase 8 | Pending |
| F19 | Phase 8 | Pending |

**Phase groupings:**

| Phase | Name | Requirements |
|-------|------|--------------|
| 1 | Separated Spokes and the Adapter Seam | F8, F9, F17 |
| 2 | One Sign-In, One Enforcement Point | F0, F1, F2, F10, F13 |
| 3 | The Accessible Unified Shell | F3, F14 |
| 4 | What Is Mine, and Acting On It | F4, F5, F6, F15 |
| 5 | The Flagship Cross-Application Workflow | F7 |
| 6 | Operating the Platform | F11, F16 |
| 7 | Onboarding the Next Application as Configuration | F12 |
| 8 | Demonstrable, Verified, Rehearsed | F18, F19 |

**Coverage:**
- v1 requirements: 20 features + 20 NFRs
- Features mapped to phases: 20 / 20 ✓ (each to exactly one phase; no orphans, no duplicates)
- Unmapped: 0
- NFRs: cross-cutting, not separately phased — each carried as a success criterion in the phase that first makes it observable and re-verified by the Phase 8 suite (mapping in ROADMAP.md § Requirement Coverage)

**Features completing in more than one phase (owner phase in the table above, declared in ROADMAP.md phase details):**
- **F17** — corpus owned by Phase 1; extended in Phase 4 (persona/facet breadth), Phase 6 (degraded and blocked-action edge states), Phase 7 (CVS corpus)
- **F4** — three mission dashboards in Phase 4; the administrator dashboard's operational widgets complete in Phase 6, when the console and health monitor exist to populate them
- **F15** — alert derivation, rendering, and per-user dismissal in Phase 4; administrator announcement authoring with the console in Phase 6
- **F14** — accessibility foundation and CI gate in Phase 3; the every-route × every-role sweep and manual pass in Phase 8 under F19

---

## Open Items Carried Forward

| ID | Item | Status |
|----|------|--------|
| Q-01 | Real "DCSA Ecosystem Style Guide" (Attachment 1) was never supplied — USWDS v3 assumed, theming via tokens so it is swappable | Open — external input required |
| Q-02 | `Page_render_reference` document referenced by the user but not present on disk | Open — external input required |
| Q-04 / Q-05 | Investigation Management included in the prototype set though the Innovation Call names eApp/IEP/PVQ/PDT; eApp↔PVQ relationship semantics modeled from first principles | Bounded — documented in FRD `Y3` |
| Q-03 / Q-06 | Design-system decision and demo sixth-application identity (Continuous Vetting Service) | Decided |
| RTM-GAP-04 | `FR-F14-10` (P0 accessibility states) has no citing user story | Fix before build |
| RTM-GAP-09 | TechArch cites only 56 of 182 FR-IDs by ID; the rest are covered by section | Traceability improvement |
| Flow-07 | JRN-03.02 walkthrough recorded but not authored; carries the resource-level zero-trust claim | Close before demo rehearsal |

---
*Requirements defined: 2026-09-15*
*Last updated: 2026-09-15 after roadmap creation (traceability populated, 20/20 features mapped)*
