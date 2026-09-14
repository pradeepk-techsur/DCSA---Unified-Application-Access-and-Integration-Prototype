# DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

## What This Is

A working MVP of a unified application layer for the Defense Counterintelligence and Security Agency (DCSA). It gives investigators, adjudicators, applicants, and administrators **one place** to log in, see their assigned work, and act on it — while the existing DCSA mission applications (eApp, IEP, PVQ, PDT, Investigation Management) remain separate simulated systems behind mock APIs/adapters.

This is a **demonstration prototype** responding to DCSA Innovation Call #01 ("Unified Application Access and Integration Prototype") under the DCSA Innovation Gateway (HS0021-26-CSO-DCSA). It runs on **synthetic data only** and is labeled "Demo – Synthetic Data Only" throughout.

## Core Value

**A user signs in once and completes a cross-application workflow end-to-end without ever logging into — or navigating to — a second system.** Concretely: an investigator opens an eApp case, discovers a related PVQ issue, resolves it, and sees both underlying systems reflect the change, all inside one interface.

If everything else fails, that single unified workflow must work.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Simulated MFA login supporting CAC/PIV, ECA, and a generic MFA method, with single sign-on across all integrated applications
- [ ] Role-based (and attribute-aware) access control for four roles: Investigator, Adjudicator, Applicant, Administrator — each sees only what they are authorized to see
- [ ] Role-specific personalized dashboard showing assigned work, alerts, due dates, application status, recent activity, and system announcements
- [ ] One combined work queue aggregating tasks from eApp, IEP, PVQ, PDT, and Investigation Management, with filter/sort/search
- [ ] Work-item detail page: review information, complete a concrete action, and view full activity history
- [ ] The flagship cross-application workflow: investigator opens an eApp case → finds a related PVQ issue → resolves it → both systems update, with no re-authentication and no context loss
- [ ] Administrator console: connected applications, system health, integration issues/errors
- [ ] Application registration flow for onboarding a future application (hub-and-spoke onboarding pattern demonstrated, not just described)
- [ ] Immutable audit trail recording who performed each action, on what, and when — viewable in the UI
- [ ] Each legacy system (eApp, IEP, PVQ, PDT, IM) implemented as a **separate simulated service behind its own mock API/adapter**, so adapters are swappable and new apps can be added
- [ ] USWDS-based, Section 508 / WCAG 2.1 AA accessible UI: accessible forms, data tables, navigation, color contrast, keyboard operation, screen-reader semantics
- [ ] Realistic synthetic sample data across all five systems, with the "Demo – Synthetic Data Only" label always visible
- [ ] Every button and workflow functional — no dead links, no placeholder screens
- [ ] Error messages, loading states, empty states, and a degraded-system warning when a connected application is unhealthy
- [ ] Automated tests covering the flagship workflow, RBAC enforcement, and adapter behavior
- [ ] Run/demo instructions: how to start the app and drive the main workflow

### Out of Scope

- Real DCSA data, real PII, or connections to real government systems — this is a synthetic-data prototype only
- Real CAC/PIV certificate validation, real PKI, real ECA trust chains — authentication is **simulated**, selecting an identity/role rather than validating credentials
- AWS GovCloud IL4/IL5 deployment, ATO artifacts, and security authorization packages — the Innovation Call's Phase 4 concerns, not this MVP
- Sustainment of the real IE applications (the OTA scope item) — out of scope for a demonstration build
- Rewriting or replacing the legacy applications — they stay behind adapters by design (hub-and-spoke, not monolith replacement)
- MuleSoft, ServiceNow, JIRA, GitLab, Artifactory integrations — simulated at the adapter boundary only
- Production-grade scalability, HA, DR, and performance engineering — correctness and demonstrability come first
- Native mobile applications — responsive web only
- AI/ML risk scoring and behavioral threat analytics — named in the Gateway's broader priorities, not in Innovation Call #01's prototype scope

## Context

**Source material (input, not specification):**
- `project_specs/ref_docs/DCSA_Innovation_Call_01_Unified_Application_Layer.pdf.md` — the governing requirement. Problem statement, four project phases, key outcomes per phase, security considerations.
- `project_specs/ref_docs/DCSA_Innovation_Gateway_20260623.pdf.md` — parent solicitation; technical priorities (digital transformation, modular architecture/MOSA, zero trust, data integration).
- `project_specs/ref_docs/Att_1__Solution_Concept_Paper_Template_20260623.docx.md` — Solution Concept Paper template; useful framing for the narrative, not for the build.

**Missing source material (flagged assumption):**
- "Attachment 1 – DCSA Ecosystem Style Guide" is referenced by the Innovation Call but was **not supplied**. A `Page_render_reference.pdf.md` was referenced in the request but is **not on disk**.
- **Assumption:** the design system is **USWDS (U.S. Web Design System) v3** with DCSA-flavored theming (federal blue palette, DCSA seal/wordmark placement, Public Sans typography). If the real style guide arrives, theming is swappable via USWDS design tokens — do not hard-code colors.

**Domain background:**
- DCSA runs personnel vetting, industrial security, counterintelligence, and insider-threat missions across multiple disconnected applications. Users hold multiple roles and attributes and must log into and navigate separate systems to finish related work.
- The five systems in scope for this MVP:
  - **eApp** — Electronic Application; the applicant's security questionnaire submission (SF-86 style).
  - **IEP** — Individual Engagement Portal; the individual's front door for status, notices, and tasks.
  - **PVQ** — Personnel Vetting Questionnaire; forms and issue items raised against submitted answers.
  - **PDT** — Position Designation Tool; determines position sensitivity/risk and required investigation tier.
  - **IM** — Investigation Management; case assignment, leads, and investigator workload.
- The target architecture is explicitly **hub-and-spoke**: the unified layer owns identity, navigation, work aggregation, and audit; the spokes keep performing their assigned functions behind adapters. This is what makes "add another application later" cheap, and it is what the prototype must prove.
- Zero-trust alignment matters to the evaluator: authorize every request at the resource level, never trust the client's claimed role, and make the audit trail non-optional.

**Evaluation lens (how a reviewer will judge this):**
- Concept viability, mission alignment, affordability — plus, for a live demo, whether every button actually works and whether the cross-system workflow is genuinely continuous rather than four screens stitched together.

## Constraints

- **Data**: Synthetic only. No real or realistic-but-real PII. Every screen carries a "Demo – Synthetic Data Only" banner — non-dismissible in the global header.
- **Accessibility**: Section 508 / WCAG 2.1 AA is a hard requirement, not a polish item. Federal audience; accessibility failures are disqualifying.
- **Design system**: USWDS components and design tokens. No bespoke component library. Theming via tokens so the real DCSA style guide can be dropped in later.
- **Architecture**: Legacy systems MUST remain separate simulated services reachable only through per-system adapters implementing a common interface. No direct cross-system database access, no shared schema shortcuts — the adapter seam is the deliverable.
- **Extensibility**: Registering a sixth application must be a demonstrable in-app action, not a code change. Adapter registry is data-driven.
- **Security**: Role/attribute-based authorization enforced server-side on every request. Client-side hiding is presentation only, never the control. Every state-changing action writes an audit record.
- **Resilience**: Adapter failure must degrade gracefully — a visible degraded-system warning, the rest of the queue still usable. Never a blank page or an unhandled error.
- **Deliverability**: Must build, run, and be demoed from a single documented command sequence. A prototype nobody can start is a prototype that scored zero.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hub-and-spoke with per-system adapters behind a common interface | Directly mirrors the Innovation Call's stated target architecture and is what makes "onboard the next app" demonstrable | — Pending |
| Simulated identity provider with CAC/PIV, ECA, and generic MFA paths | Real PKI is impossible outside the government environment; the evaluable behavior is SSO continuity across apps, not certificate math | — Pending |
| USWDS v3 + design tokens, pending the real DCSA style guide | Style guide was not supplied; tokens make the eventual swap a theme change rather than a rewrite | — Pending |
| Five spokes run as separate simulated services, each with its own data store/namespace | Proves the separation is real rather than asserted; prevents the shared-schema shortcut that would invalidate the demo | — Pending |
| Server-side RBAC/ABAC on every request + mandatory audit write on every mutation | Zero-trust alignment is an explicit evaluation dimension; audit trail is a named requirement | — Pending |
| Flagship workflow (eApp case → related PVQ issue → resolve → both systems update) is the primary acceptance test | It is the single artifact that proves the whole thesis; everything else is supporting cast | — Pending |

---
*Last updated: 2026-09-14 after initialization*
