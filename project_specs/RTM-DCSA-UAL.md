# Requirements Traceability Matrix

## DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

| Field | Value |
|-------|-------|
| **Product Name** | DCSA Unified Application Access and Integration Prototype |
| **Project Acronym** | DCSA-UAL |
| **Document Type** | Requirements Traceability Matrix (RTM) |
| **Status** | Draft v1.0 |
| **Date** | 2026-09-15 |
| **Responds To** | DCSA Innovation Call #01 — "Unified Application Access and Integration Prototype" (DCSA Innovation Gateway, HS0021-26-CSO-DCSA) |
| **Traced Documents** | `PRD`, `FRD`, `TechArch`, `UserStories`, `PERSONAS`, `JTBD`, `JOURNEYS`, `STORY-MAP`, `UX-Mockup`, `.planning/PROJECT.md` |
| **Baseline Verified** | Yes — counts in §2 were recomputed from the source documents for this RTM, not inherited |

> **DEMO — SYNTHETIC DATA ONLY.** This matrix traces a demonstration prototype. No real DCSA data, no real PII, no connection to any real government system. Authentication is simulated; no certificate validation occurs. Every identity, case, questionnaire, issue item, and identifier named in this document is fabricated and invalid by construction.

---

## 1. Overview

This Requirements Traceability Matrix provides **bidirectional traceability** across the DCSA-UAL specification suite. It answers four questions that a builder, a reviewer, and a test engineer each need to answer from opposite directions: *what implements this requirement*, *what requirement does this code satisfy*, *what verifies it*, and *whose job does it actually serve*.

The suite is unusual in having two parallel traceability spines rather than one, and this document traces both. The **engineering spine** runs `PRD feature → FRD requirement → TechArch specification → user story → test case`. The **human-centred spine** runs `persona → job-to-be-done → journey → story-map release → user story`, and it converges on the same story set from the other side. A story that appears on the engineering spine but not the human spine is a story built for the document rather than for a user; a journey stage with no story behind it is a demo step that cannot be walked. Both conditions are reported in §11 rather than smoothed over.

Traceability here is deliberately literal. Every identifier in every cell of every matrix in this document was extracted from the source documents rather than asserted — the FR-ID set from the 182 requirement headings across the twenty-two FRD feature chunks, the US-ID set from the 151 story headings across the twenty epic chunks, the screen inventory from `FR-F03-02`, the endpoint catalogue from `Y1a`, the table set from the TechArch hub and spoke DDL, and the human-layer identifiers from `PERSONAS`, `JTBD`, `JOURNEYS`, and `STORY-MAP`. Where an identifier does not exist, this document says so and classifies the gap; it does not invent one. The single exception is the **TC-** test-case identifier space, which this RTM introduces because the suite did not previously carry one — each TC is derived from a named acceptance criterion in the FRD or the UserStories and from a named suite in `FRD F19` / `TechArch §14`, and no TC asserts behaviour that is not already specified upstream.

The matrix is organised around one non-negotiable claim. The product charter states that if everything else fails, the flagship cross-application workflow must work. §7 therefore isolates that workflow — PRD **F7**, requirements `FR-F07a-01…06` and `FR-F07b-01…07`, journey **JRN-01.01**, job **JTBD-01.1**, stories **US-059…US-069** — into a single end-to-end view, from persona motivation through to the specific test assertions and the specific spoke API calls that prove both systems changed. A reviewer who reads only §7 should be able to satisfy themselves that the central claim is traceable, testable, and demonstrable.

**How to read this document.** §2 establishes counts and identifier conventions and records the verification of the suite's own reconciliation claims. §3 is the feature-level master matrix. §4 is the PRD-feature requirement detail. §5 is the complete 182-row requirement-level matrix. §6 is the human-centred layer. §7 is the flagship thread. §8 is the test-case catalogue. §9 and §10 trace non-functional requirements and success metrics through specification, implementation, and verification. §11 is the gap analysis. §12 and §13 are change management and sign-off.

---

## 2. Requirements Summary

### 2.1 What is being traced

- **20 PRD features** — `F0` … `F19`. 15 are P0, 5 are P1, 0 are P2. `F7` is P0 and additionally designated the highest-priority feature in the product.
- **6 PRD product principles** — `PRIN-01` … `PRIN-06`. These carry IDs because seven user stories parent to them instead of to a job-to-be-done.
- **182 FRD functional requirements** — `FR-F00-01` … `FR-F19-10`, distributed across 22 feature chunks (F07 and F08 each split into an `a`/`b` pair) plus six cross-feature chunks (`Y0a`, `Y0b`, `Y1a`, `Y1b`, `Y2`, `Y3`).
- **38 screens** — `SCR-01` … `SCR-38`, enumerated normatively in `FR-F03-02`, each with an owning FR, a role set, and a data source.
- **34 hub BFF endpoints** — catalogued in `Y1a`, every one authorised server-side and every mutating one audited before response.
- **16 Architecture Decision Records** — `ADR-001` … `ADR-016`, two of which (`ADR-012`, `ADR-013`) are recorded deliberate deviations from the FRD.
- **33 hub tables + 25 spoke tables** across 7 isolated schemas (`hub`, `eapp`, `pvq`, `iep`, `pdt`, `im`, `cvs`).
- **151 user stories** — `US-001` … `US-151`, across 20 epics whose numbering matches the PRD feature numbering exactly.
- **20 non-functional requirements** — `NFR-01` … `NFR-20`.
- **25 success metrics** — `SM-01` … `SM-25`.
- **15 risks** — `R-01` … `R-15`.
- **4 personas** — `PER-01` … `PER-04`. **16 jobs** — `JTBD-01.1` … `JTBD-04.4`. **10 journeys** — `JRN-01.01` … `JRN-04.03`, 78 journey stages. **3 releases** — `R1`, `R2`, `R3`. **6 demo segments**.
- **176 test cases** — `TC-*`, introduced by this document across seven test types.

### 2.2 Verification of the suite's reconciliation claims

The suite was reconciled immediately before this RTM was generated, and two specific claims were handed over with it. Both were re-verified here rather than accepted.

| Claim handed over | Verification method | Result |
|---|---|---|
| "FRD reports 186 referenced / 186 defined FR-IDs with zero dangling" | Extracted every `FR-F{nn}[ab]-{mm}` requirement heading across `FRD/*.md`; extracted every inline `FR-` citation across the same corpus; compared the sets | **Partially confirmed, count corrected.** The correct figure is **182 defined / 182 referenced**, not 186. Zero dangling references and zero orphan definitions — the *integrity* claim holds exactly. The 186 figure appears to be a stale count; no FR-ID is missing and none is duplicated. Recorded as `RTM-GAP-11`. |
| "US-IDs are 151/151" | Extracted every `US-\d{3}` story heading across `UserStories/Epic-*.md`; compared against the `Y0-story-index` table and the `STORY-MAP` placement counts | **Confirmed.** 151 story headings, 151 index rows, 151 placed on the story map, 0 orphans. |
| Zero dangling `FR-` references *outside* the FRD | Extracted `FR-` citations from `TechArch` (56 unique), `UserStories` (168 unique), `JOURNEYS` (4), `STORY-MAP` (2), `UX-Mockup` (64) and compared each set against the 182 defined IDs | **Confirmed.** Zero dangling references in any downstream document. |
| Every PRD feature has ≥1 FRD requirement | Grouped the 182 FR-IDs by originating feature | **Confirmed.** All 20 features covered; minimum 6 requirements (F01, F04, F08b, F15), maximum 12 (F06, F14, F16). |
| Every user story cites ≥1 FRD requirement | Parsed the `**FRD:**` trailer on all 151 stories | **Confirmed.** 151 of 151 stories carry at least one FR citation. |

### 2.3 Identifier conventions

| Prefix | Level | Owning document | Example | Count |
|---|---|---|---|---|
| `F{n}` | PRD feature | `PRD` §5 | `F7` | 20 |
| `PRIN-{nn}` | PRD product principle | `PRD` §3 | `PRIN-03` | 6 |
| `NFR-{nn}` | Non-functional requirement | `PRD` §6 | `NFR-13` | 20 |
| `SM-{nn}` | Success metric | `PRD` §7 | `SM-02` | 25 |
| `R-{nn}` | Risk | `PRD` §8 | `R-06` | 15 |
| `Q-{nn}` | Open question / assumption | `PRD` §11 | `Q-01` | 7 |
| `FR-F{nn}[ab]-{mm}` | Functional requirement | `FRD` | `FR-F07b-03` | 182 |
| `SCR-{nn}` | Screen | `FRD` `FR-F03-02` | `SCR-20` | 38 |
| `ADR-{nnn}` | Architecture decision | `TechArch` §16 | `ADR-011` | 16 |
| `US-{nnn}` | User story | `UserStories` | `US-063` | 151 |
| `PER-{nn}` | Persona | `PERSONAS` | `PER-01` | 4 |
| `JTBD-{nn}.{n}` | Job to be done | `JTBD` | `JTBD-01.1` | 16 |
| `JRN-{nn}.{nn}` | Journey | `JOURNEYS` | `JRN-01.01` | 10 |
| `R{n}` | Release | `STORY-MAP` | `R1` | 3 |
| `TC-{T}-{nnn}` | Test case | **this document** | `TC-E-011` | 176 |
| `RTM-GAP-{nn}` | Traceability gap | **this document** | `RTM-GAP-01` | 14 |

**Test-case type codes.** `TC-U-*` unit · `TC-I-*` integration (API, full hook chain) · `TC-AC-*` adapter-contract / conformance · `TC-E-*` end-to-end (browser) · `TC-A-*` accessibility · `TC-RN-*` RBAC negative-path · `TC-R-*` resilience / degradation.

### 2.4 Requirement distribution by feature

| Feature | Priority | FRD requirements | Stories | Screens | Test cases | Owning TechArch chunks |
|---|---|---|---|---|---|---|
| F0 Simulated multi-method MFA authentication | P0 | 8 (`FR-F00-01…08`) | 8 (US-001…008) | SCR-01…07 | 8 | §8.1, §6.3, §3.4 |
| F1 Unified session and SSO across all spokes | P0 | 6 (`FR-F01-01…06`) | 6 (US-009…014) | SCR-08 header | 7 | §8.2, §1.2, §3.4, §7.1 |
| F2 Role- and attribute-based access control | P0 | 8 (`FR-F02-01…08`) | 11 (US-015…025) | SCR-26, 27, 30 | 13 | §8.3–8.6, §1.2, §3.4 |
| F3 Unified navigation shell and global chrome | P0 | 8 (`FR-F03-01…08`) | 7 (US-026…032) | SCR-08, 31, 35 | 7 | §12.1, §12.3, §1.5, §8.9 |
| F4 Role-specific personalised dashboard | P0 | 6 (`FR-F04-01…06`) | 7 (US-033…039) | SCR-09…12 | 4 | §6.5, §1.2, §12.5 |
| F5 Unified work queue | P0 | 9 (`FR-F05-01…09`) | 10 (US-040…049) | SCR-13 | 10 | §6.5, §1.2, §10.3 |
| F6 Work-item detail and action completion | P0 | 12 (`FR-F06-01…12`) | 9 (US-050…058) | SCR-14…19 | 9 | §6.6, §1.2, §12.5 |
| **F7 Flagship cross-application workflow** | **P0 — highest** | **13** (`FR-F07a-01…06`, `FR-F07b-01…07`) | **11** (US-059…069) | SCR-13→15→16→20 | **12** | **§11 (all), §6.7, §3.7, ADR-010, ADR-011** |
| F8 Adapter framework and application registry | P0 | 14 (`FR-F08a-01…08`, `FR-F08b-01…06`) | 6 (US-070…075) | SCR-22, 23 | 13 | §5 (all), §3.5, §17 |
| F9 Five simulated spoke services | P0 | 8 (`FR-F09-01…08`) | 5 (US-076…080) | — | 6 | §4 (all), §7, §1.4 |
| F10 Unified layer API (BFF) | P0 | 7 (`FR-F10-01…07`) | 5 (US-081…085) | — | 8 | §6 (all), §1.3, ADR-003, ADR-012 |
| F11 Administrator console | P1 | 7 (`FR-F11-01…07`) | 8 (US-086…093) | SCR-22…27, 29 | 8 | §6.8, §10.7, §3.6 |
| F12 Application registration and onboarding | P1 | 8 (`FR-F12-01…08`) | 7 (US-094…100) | SCR-28 | 7 | §17 (all), §5.4, §3.5 |
| F13 Immutable audit trail and viewer | P0 | 8 (`FR-F13-01…08`) | 8 (US-101…108) | SCR-33, 34 | 8 | §9 (all), §3.6, §3.8, ADR-016 |
| F14 USWDS v3 accessible interface | P0 | 12 (`FR-F14-01…12`) | 10 (US-109…118) | all + SCR-36 | 12 | §12.3, §12.4, §2.3, ADR-008, ADR-014 |
| F15 Notifications, alerts, announcements | P1 | 6 (`FR-F15-01…06`) | 6 (US-119…124) | SCR-21, 29 | 6 | §6.8, §3.7, §12.5 |
| F16 Health monitoring, resilience, degraded UX | P1 | 12 (`FR-F16-01…12`) | 8 (US-125…132) | SCR-24, 25, 32, 38 | 10 | §10 (all), §1.2, §3.6, ADR-007 |
| F17 Synthetic seed data corpus | P0 | 11 (`FR-F17-01…11`) | 5 (US-133…137) | — | 9 | §13 (all), §4.2 |
| F18 Demo operability | P0 | 9 (`FR-F18-01…09`) | 7 (US-138…144) | SCR-37 | 9 | §15 (all), §0.5, §0.6, ADR-002 |
| F19 Automated test and a11y verification suite | P1 | 10 (`FR-F19-01…10`) | 7 (US-145…151) | — | 10 | §14 (all), §2.6 |
| **Total** | — | **182** | **151** | **38** | **176** | 18 chunks |

> Test-case counts are assigned by owning feature and sum to 176; many individual TCs additionally satisfy requirements in neighbouring features, which is why the per-feature column in §5 shows cross-feature TC references.

---

## 3. Master Traceability Matrix — PRD → FRD → TechArch → UserStories

One row per PRD feature. This is the top-level view; §5 expands it to requirement granularity.

| PRD feature | FRD requirements | TechArch specification | Key tables / endpoints | ADRs | User stories | Journeys |
|---|---|---|---|---|---|---|
| **F0** Simulated MFA | `FR-F00-01…08` | §8.1 three simulated IdPs; §6.3 auth & session endpoints; §3.4 identity DDL | `hub.users`, `hub.user_auth_methods`, `hub.auth_transactions`, `hub.user_roles`, `hub.user_case_assignments` · `GET /api/auth/methods`, `POST /api/auth/initiate`, `POST /api/auth/complete`, `POST /api/auth/logout` | ADR-009 | US-001…008 | 01.01, 01.02, 01.03, 02.01, 03.01 |
| **F1** Unified session / SSO | `FR-F01-01…06` | §8.2 session & SSO propagation; §1.2 session service; §7.1 common spoke contract | `hub.sessions`, `hub.spoke_contexts` · `GET /api/session`, `POST /api/session/extend`, `POST /api/session/active-role` · `X-UAL-Principal-Assertion` (Ed25519) | ADR-009 | US-009…014 | 01.01, 01.02, 02.01, 03.01, 04.01, 04.03 |
| **F2** RBAC/ABAC server-side | `FR-F02-01…08` | §8.3 PDP; §8.4 applicant data scoping at the data layer; §8.5 client hiding is presentation; §8.6 non-enumeration; §8.7 zero-trust alignment; §1.2 PDP + scoped spoke-query wrapper (PEP) | `hub.roles`, `hub.permissions`, `hub.role_permissions`, `hub.attribute_rules` · pipeline hook 7 · `GET /api/entitlements` · `deriveScope()` / `enforceScopeOnResult()` | ADR-016 | US-015…025 | 01.01, 01.02, 02.01, 03.01, 03.02, 04.01, 04.03 |
| **F3** Navigation shell | `FR-F03-01…08` | §12.1 routing; §12.3 USWDS integration; §1.5 shell layer; §8.9 the demo banner as an architectural invariant | `apps/web/app/(shell)/layout.tsx` · SCR-01…38 inventory · `GET /api/entitlements`, `GET /api/search` | ADR-014 | US-026…032 | 01.01, 01.02, 03.01, 03.02 |
| **F4** Role dashboards | `FR-F04-01…06` | §6.5 dashboard endpoint; §1.2 dashboard composer; §12.5 uniform state pattern | `hub.dashboard_compositions`, `hub.work_item_counts_cache` · `GET /api/dashboard` · SCR-09…12 | ADR-006 | 01.01, 01.02, 02.02, 03.01, 03.02 |
| **F5** Unified work queue | `FR-F05-01…09` | §6.5 work-queue endpoint; §1.2 work-queue aggregator; §10.3 partial-failure aggregation | `hub.queue_default_views`, `hub.user_view_preferences` · `GET /api/work-items` with `sourceStatus[]` · SCR-13 | ADR-006, ADR-007 | US-040…049 | 01.01, 01.02, 01.03, 02.01, 02.02, 03.01, 04.01, 04.03 |
| **F6** Work-item detail | `FR-F06-01…12` | §6.6 work-item endpoints; §1.2 work-item service; §12.5 uniform state pattern | `GET /api/work-items/{id}`, `/related`, `/activity`, `POST /actions/{actionId}` · SCR-14…19 | ADR-006 | US-050…058 | 01.01, 01.02, 01.03, 02.01, 02.02, 03.01, 03.02 |
| **F7 FLAGSHIP** | `FR-F07a-01…06`, `FR-F07b-01…07` | **§11.1–11.8** forward-recovery saga, execution sequence, failure branches, reconciliation record, observed-state confirmation, generic engine, retry worker, post-condition model; **§6.7** the flagship endpoint | `hub.orchestration_definitions`, `hub.orchestration_transactions`, `hub.orchestration_retry_queue`, `hub.idempotency_records` · `POST /api/orchestration/resolve-pvq-issue`, `POST /api/orchestration/{transactionId}/retry` · SCR-20 | **ADR-010** (retry queue is a table), **ADR-011** (forward recovery, not compensating rollback) | **US-059…069** | **01.01**, 02.01 |
| **F8** Adapter framework + registry | `FR-F08a-01…08`, `FR-F08b-01…06` | §5.1 `packages/adapter-contract` interface; §5.2 `adapter-runtime` policy; §5.3 PVQ implementation sketch; §5.4 the registry record; §5.5 capability negotiation; §5.6 conformance suite; §3.5 registry DDL; §17.4 where each surface gets its knowledge | `hub.registered_applications`, `hub.registry_version`, `hub.retired_application_ids` · `adapter-rest-json-v1` · seven interface operations · `GET /api/registry-version` | ADR-001, ADR-007 | US-070…075 | 01.01, 01.02, 01.03, 02.02, 04.01, 04.02, 04.03 |
| **F9** Five simulated spokes | `FR-F09-01…08` | §4.1 conventions; §4.2 cross-namespace reference map; §4.3–4.8 per-spoke DDL; §4.9 isolation verification checklist; §7.2 per-spoke surfaces; §7.3 direct verification; §1.4 spoke service template | `eapp.*` (5), `pvq.*` (3), `iep.*` (5), `pdt.*` (5), `im.*` (5), `cvs.*` (2) — 7 schemas, 7 roles, zero cross-schema FKs · ports 7101–7106 | **ADR-004** (schema-per-service, role-per-service), ADR-005 | US-076…080 | 01.01, 01.03, 02.01, 02.02, 03.02, 04.01, 04.02 |
| **F10** Unified layer API (BFF) | `FR-F10-01…07` | §6.1 how endpoints are declared; §6.2 common types; §6.9 cross-cutting API rules; §1.3 choke point 1 — the eleven-hook edge pipeline | 34 endpoints in `Y1a` · `packages/contracts` (TypeBox → types, validators, OpenAPI) · boot-time contract check | ADR-003, **ADR-012**, ADR-015 | US-081…085 | 01.01, 02.01, 03.02, 04.02 |
| **F11** Administrator console | `FR-F11-01…07` | §6.8 admin endpoints; §10.7 integration issue recording; §3.6 health & issues DDL | `hub.application_health`, `hub.application_health_checks`, `hub.integration_issues`, `hub.announcements` · `GET /api/admin/health`, `/integration-issues`, `POST /api/admin/announcements` · SCR-22…27, 29 | ADR-007 | US-086…093 | 01.03, 04.01, 04.02, 04.03 |
| **F12** Registration / onboarding | `FR-F12-01…08` | §17.1 the complete onboarding path; §17.2 live CVS registration script; §17.3 what was written and what was not; §17.5 a seventh app with a different backend; §5.4 registry record; §3.5 registration drafts | `hub.application_registration_drafts`, `hub.registered_applications` · `POST /api/admin/applications`, `/test-connection`, `PATCH`, `DELETE` · SCR-28 · `docs/ONBOARDING-A-NEW-APP.md` | ADR-001 | US-094…100 | 01.02, 04.01 |
| **F13** Audit trail and viewer | `FR-F13-01…08` | §9.1 three layers of enforcement; §9.2 the interceptor (pipeline hook 9, `onSend`); §9.3 record structure and hash chain; §9.4 coverage; §9.5 correlated chains; §9.6 role-scoped visibility; §9.7 integrity verification; §3.8 final grants — where immutability actually lives | `hub.audit_events`, `hub.audit_action_types` · no UPDATE/DELETE grant for `hub_service` · `GET /api/audit`, `/chain/{correlationId}`, `/integrity`, `/export` · SCR-33, 34 | **ADR-016** (structural enforcement over developer discipline) | US-101…108 | 01.01, 02.01, 02.02, 03.01, 03.02, 04.01, 04.02, 04.03 |
| **F14** USWDS accessible interface | `FR-F14-01…12` | §12.3 USWDS integration and token-only theming; §12.4 accessibility architecture; §12.6 rendering strategy; §2.3 frontend stack; §2.9 Next.js configuration constraints | `packages/theme/_uswds-theme.scss` (only file with a colour value) · `apps/web/components/uswds/` · Stylelint no-visual-literals rule | **ADR-008** (USWDS wholesale, token-only), **ADR-014** (Next.js 15 App Router) | US-109…118 | all ten journeys |
| **F15** Notifications & announcements | `FR-F15-01…06` | §6.8 notifications endpoints; §3.7 notifications DDL; §12.5 uniform state pattern; §1.2 alert deriver (read-time, never persisted) | `hub.alert_read_state`, `hub.announcements`, `hub.announcement_dismissals` · `GET /api/notifications` · SCR-21, 29 | ADR-006 | US-119…124 | 01.01, 01.02, 02.02, 03.01, 04.02 |
| **F16** Health, resilience, degraded UX | `FR-F16-01…12` | §10.1 health monitoring; §10.2 timeout/retry/circuit policy; §10.3 partial-failure aggregation; §10.4 the degraded-mode UX contract; §10.5 failure injection; §10.6 automatic recovery; §10.7 integration issue recording; §10.8 resilience test matrix | `hub.application_health`, `hub.integration_issues` · `POST /api/admin/failure-injection` · `/admin/injection` per spoke · SCR-24, 25, 32, 38 | **ADR-007** (hand-written circuit breaker) | US-125…132 | 01.02, 01.03, 02.02, 04.01, 04.02, 04.03 |
| **F17** Synthetic seed corpus | `FR-F17-01…11` | §13.1 design properties; §13.2 pipeline; §13.3 volume; §13.4 flagship preconditions; §13.5 edge-state coverage; §13.6 personas; §13.7 obviously synthetic content; §13.8 validation (startup fails on bad data); §13.9 reset | `packages/seed` · `UAL_SEED_CONSTANT`, `UAL_SEED_REFERENCE_DATE` · `POST /api/admin/reset` · `docs/SEED-DATA.md` | ADR-004 | US-133…137 | 01.01, 01.02, 02.01, 03.01, 03.02, 04.01 |
| **F18** Demo operability | `FR-F18-01…09` | §15.1 the single command; §15.2 `compose.yaml`; §15.3 `run.sh` surface; §15.4 health endpoints; §15.5 demo readiness (SCR-37); §15.6 how an evaluator drives the demo; §15.7 troubleshooting; §0.5 topology and port map | 11 containers, 1 compose project, 1 network · `run.sh` · `.env` as the single port source · `GET /api/admin/status` · `docs/README.md`, `docs/DEMO-SCRIPTS.md` | **ADR-002** (Compose, not Kubernetes), **ADR-013** (web UI on port 3000) | US-138…144 | the scripted demo path (all six segments) |
| **F19** Test & a11y verification | `FR-F19-01…10` | §14.1 the pyramid; §14.2 flagship E2E; §14.3 RBAC enforcement; §14.4 adapter conformance; §14.5 audit coverage and immutability; §14.6 accessibility verification; §14.7 link and control integrity crawl; §14.8 architecture conformance; §14.9 determinism; §14.10 reviewer-readable results | `flagship.spec.ts`, `rbac.matrix.spec.ts`, `rbac.negative.spec.ts`, `axe.spec.ts`, `crawl.spec.ts`, `isolation.spec.ts`, `resilience.spec.ts`, `registration.spec.ts`, `audit.coverage.spec.ts`, `packages/conformance` | ADR-015, ADR-016 | US-145…151 | 03.02, 04.03 *(negative-path and resilience assertions)* |

---

## 4. Requirements Detail — PRD features and what they became

Each PRD feature, the requirements derived from it, and the story set that delivers it. Read this section for the *shape* of a feature's traceability; read §5 for the row-by-row detail.

- **F0 — Simulated multi-method MFA authentication (P0).** Eight requirements covering method selection, the CAC/PIV certificate picker, the ECA external-CA path, the generic-MFA two-step with a deterministic demo code, identity-to-role/attribute binding, timeout and re-authentication, logout with full downstream context termination, and — separately and non-negotiably — simulation labelling. `FR-F00-08` exists on its own because the honesty obligation is not a sub-clause of a login screen: it forbids four specific verbs anywhere in user-facing copy, and `TC-A-001` scans for them on every route. Delivered by US-001…008; US-008 is one of the seven stories parented to `PRIN-06` rather than to a job, because no persona's desired outcome is "be told the authentication is fake."
- **F1 — Unified session and SSO (P0).** Six requirements. The load-bearing one is `FR-F01-02`: the hub presents an Ed25519-signed principal assertion to each spoke, spokes verify `aud` and `exp` and reject anything else, and the browser is never in that trust path. `FR-F01-03` is the zero-re-authentication guarantee and is asserted by test rather than by design intent (`TC-E-004`, `TC-E-012`). `FR-F01-06` makes the correlation ID a first-class lifecycle object, which is what later makes `SM-20` provable.
- **F2 — RBAC/ABAC enforced server-side (P0).** Eight requirements and the largest negative-path story set in the suite — six of the eleven stories (US-018…023) are refusals, each with its own dedicated test case. `FR-F02-04` is notable for pushing applicant data isolation down to the data layer rather than leaving it in the handler: the scope becomes SQL predicates in the spoke repository, so a forgotten filter cannot leak. `FR-F02-07` specifies non-enumeration as a measurable property — byte-identical responses and a normalised timing floor — which `TC-RN-001` and `TC-I-011` assert quantitatively.
- **F3 — Unified navigation shell (P0).** Eight requirements, including the normative 38-screen inventory (`FR-F03-02`) that every other document's screen references resolve against, and `FR-F03-03`, the demo banner. The banner requirement is unusually detailed because it carries a real tension: `NFR-13` demands verbatim copy everywhere, `SM-25` demands the applicant's status answer above the fold at 320×568. The FRD resolves it by budget — accessible-DOM copy always present, visible copy permitted to truncate to its bold lede below 640px — and `TC-A-003` evaluates *accessible* text at three viewports so a conformant build cannot fail.
- **F4 — Role-specific personalised dashboard (P0).** Six requirements, one per role plus the composition endpoint and the widget-interaction contract. The four dashboards are traced separately (`FR-F04-02…05`) precisely so `SM-23` — visibly and substantively different, not a relabelled copy — is checkable rather than rhetorical.
- **F5 — Unified work queue (P0).** Nine requirements. `FR-F05-05` is the resilience contract for the queue and is the single requirement most often cited elsewhere in the degraded-experience chain. `FR-F05-02` defines the normalised `WorkItem` shape that makes five heterogeneous sources sortable against each other at all.
- **F6 — Work-item detail and action completion (P0).** Twelve requirements — the largest set alongside F14 and F16 — because this is where work is actually done and where five spoke-specific detail views (`FR-F06-08…11`) each need their own content specification. `FR-F06-05`, the related-items panel, is explicitly the on-ramp to F7.
- **F7 — Flagship cross-application workflow (P0, highest).** Thirteen requirements across two chunks: `F07a` is the user's journey through the workflow, `F07b` is the orchestration behind it. Every one of the eleven stories US-059…069 maps to a distinct step or failure mode, which is deliberate — a regression in any single step is attributable to one story and one test. See §7 for the full thread.
- **F8 — Adapter framework and data-driven registry (P0).** Fourteen requirements, split into the contract (`F08a`) and the registry (`F08b`). `FR-F08b-02` is the no-hard-coding rule and is enforced by a grep-based architecture conformance test, not by convention. This is the feature with the largest requirement-to-story ratio (14 requirements, 6 stories) because much of the contract is machine-verified rather than user-observable — which is why its gap profile in §11 is the way it is.
- **F9 — Five simulated spoke services (P0).** Eight requirements. `FR-F09-01` is the isolation deliverable; `FR-F09-08` is the proof surface that lets an evaluator `curl` a spoke directly and see its own answer. Those two together are what make `SM-03` and `SM-13` demonstrable rather than asserted.
- **F10 — Unified layer API / BFF (P0).** Seven requirements, of which `FR-F10-01` — the eleven-hook edge pipeline — carries the entire zero-trust and audit story structurally. A route that does not declare an action string and request/response schemas fails the boot-time contract check and the process exits non-zero. Starting is not permitted with a route that could bypass the PDP.
- **F11 — Administrator console (P1).** Seven requirements covering inventory, health, the integration-issue log, application detail, manual connection test, announcements, and console-wide conventions. `FR-F11-07` explicitly refuses administrator exemption from authorisation and audit.
- **F12 — Application registration and onboarding (P1).** Eight requirements. This is the extensibility proof, and `FR-F12-06` names the demo sixth application — **CVS**, the Continuous Vetting Service — which ships running but unregistered on port 7106 specifically so registration can be performed live. `Q-06` is closed against it.
- **F13 — Immutable audit trail and viewer (P0).** Eight requirements. `FR-F13-01` makes the audit write part of the mutation path; `FR-F13-03` makes immutability structural — no route, no SQL statement, and no database grant permits modification — and `TC-I-063` asserts all three layers independently.
- **F14 — USWDS v3 accessible interface (P0).** Twelve requirements, treated as functional requirements rather than as quality notes. `FR-F14-12` is the verification gate itself: the build fails on any serious or critical violation. `FR-F14-10` covers the accessibility of error, empty, and loading states — the screens most likely to be built carelessly.
- **F15 — Notifications, alerts, announcements (P1).** Six requirements. `FR-F15-01` keeps alert derivation read-only over spoke data, so an alert never needs to be undone; `FR-F15-05` keeps announcements from ever obscuring the demo banner.
- **F16 — Health monitoring, resilience, degraded-system UX (P1).** Twelve requirements — the full set of behaviours and UX states that keep the prototype usable when a spoke misbehaves, plus `FR-F16-11`, the administrator failure-injection control that makes degradation rehearsable on demand rather than theoretical.
- **F17 — Synthetic seed data corpus (P0).** Eleven requirements. `FR-F17-03` pins the flagship preconditions and `FR-F17-10` fails startup loudly when any of them is missing — a demo starting on broken data is worse than one that refuses to start. `FR-F17-11` is the reset that makes the demo repeatable.
- **F18 — Demo operability (P0).** Nine requirements: one command, per-service control, pre-flight checks, README, the flagship demo script, five secondary scripts, the service status page, clean shutdown, and documented troubleshooting for the three likeliest demo-day failures.
- **F19 — Automated test and accessibility verification suite (P1).** Ten requirements, each naming what is asserted rather than that tests exist. `FR-F19-09` requires the CI artifact to map every FRD requirement to its verifying test **and flag requirements with no test** — which is the machine-readable counterpart of §11 of this document.

---

## 5. Requirement-Level Traceability Matrix — all 182 FRD requirements

Every FRD requirement, its explicit TechArch citation where one exists, the stories that cite it, and the test cases that verify it. A `*(feature chunk)*` entry in the TechArch column means the requirement has no *explicit* FR-ID citation in TechArch and is covered by its feature's owning chunk as listed in §2.4 and §3 — TechArch cites 56 of the 182 FR-IDs by ID and covers the remainder structurally by section. Rows marked **— none** in the story column are carried into §11 as `RTM-GAP-01`…`RTM-GAP-04`.

#### F0 — Simulated multi-method MFA authentication *(8 requirements)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F00-01` | Authentication method selection (SCR-01) | *(feature chunk)* | US-001, US-011 | TC-E-001 |
| `FR-F00-02` | CAC/PIV simulated certificate selection (SCR-02) | *(feature chunk)* | US-002, US-005 | TC-E-001, TC-I-001 |
| `FR-F00-03` | ECA simulated external CA path (SCR-03) | *(feature chunk)* | US-003 | TC-E-002 |
| `FR-F00-04` | Generic MFA path: identity entry and one-time code (SCR-04, SCR-05) | §00 | US-004, US-005 | TC-E-003, TC-I-001 |
| `FR-F00-05` | Synthetic identity to role and attribute binding | *(feature chunk)* | US-013 | TC-I-006, TC-U-001 |
| `FR-F00-06` | Session timeout, warning, and re-authentication (SCR-06) | *(feature chunk)* | US-006, US-117 | TC-A-014, TC-I-002 |
| `FR-F00-07` | Logout and full context termination (SCR-07) | *(feature chunk)* | US-007 | TC-I-003 |
| `FR-F00-08` | Simulation labeling (non-negotiable) | §08 | US-008 | TC-A-001 |

#### F1 — Unified session and SSO across all spokes *(6)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F01-01` | Single server-side session issuance | §02 | **— none** | TC-U-002 |
| `FR-F01-02` | Attested principal propagation to spokes | §01, §02, §07 | US-010 | TC-AC-001 |
| `FR-F01-03` | Zero re-authentication guarantee | *(feature chunk)* | US-009, US-011 | TC-E-004, TC-E-012, TC-I-004 |
| `FR-F01-04` | Per-spoke context handles and invalidation | *(feature chunk)* | **— none** | TC-I-003 |
| `FR-F01-05` | Session state surfaced in the UI | *(feature chunk)* | US-012 | TC-I-005 |
| `FR-F01-06` | Correlation identifier lifecycle | *(feature chunk)* | US-014 | TC-I-007 |

#### F2 — Role- and attribute-based access control, server-side *(8)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F02-01` | The authorization decision function | *(feature chunk)* | US-010, US-016 | TC-I-009, TC-U-002 |
| `FR-F02-02` | Role permission matrix | *(feature chunk)* | US-019, US-020, US-023, US-025 | TC-I-012, TC-RN-002, TC-RN-003, TC-RN-006 |
| `FR-F02-03` | Attribute rules layered on role | *(feature chunk)* | US-016, US-021, US-022 | TC-I-009, TC-RN-004, TC-RN-005 |
| `FR-F02-04` | Applicant data isolation enforced at the data layer | §01, §02, §08 | US-016, US-018, US-030 | TC-AC-004, TC-I-014, TC-RN-001 |
| `FR-F02-05` | Action-level authorization and server-computed action lists | §04 | US-017, US-019 | TC-I-010, TC-RN-002 |
| `FR-F02-06` | Entitlements endpoint drives navigation and controls | §01, §06 | US-015 | TC-I-008 |
| `FR-F02-07` | Denial handling, audit, and non-enumeration (SCR-30) | *(feature chunk)* | US-018, US-020, US-024 | TC-I-011, TC-RN-001, TC-RN-003 |
| `FR-F02-08` | Role and attribute visibility for administrators | *(feature chunk)* | US-025 | TC-I-012 |

#### F3 — Unified navigation shell and global chrome *(8)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F03-01` | Shell composition and landmark structure (SCR-08) | *(feature chunk)* | US-026 | TC-A-002 |
| `FR-F03-02` | Screen inventory (every route maps to a real screen) | *(feature chunk)* | US-028, US-032 | TC-E-006, TC-I-013 |
| `FR-F03-03` | Non-dismissible demo banner | §02 | US-008, US-027, US-123, US-150 | TC-A-003 |
| `FR-F03-04` | Role-differentiated primary navigation | *(feature chunk)* | US-015, US-028 | TC-I-008, TC-I-013 |
| `FR-F03-05` | Session and identity controls in the header | *(feature chunk)* | US-012, US-013 | TC-I-005, TC-I-006 |
| `FR-F03-06` | Cross-application breadcrumbs | *(feature chunk)* | US-029, US-061 | TC-E-005 |
| `FR-F03-07` | Global search entry point (SCR-35) | *(feature chunk)* | US-030 | TC-I-014 |
| `FR-F03-08` | Not-found route (SCR-31) and page templates | *(feature chunk)* | US-031 | TC-I-015 |

#### F4 — Role-specific personalised dashboard *(6)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F04-01` | Dashboard composition endpoint and widget loading model | *(feature chunk)* | US-033, US-037, US-038 | TC-I-016, TC-R-001 |
| `FR-F04-02` | Investigator dashboard (SCR-09) | *(feature chunk)* | US-033 | TC-E-007 |
| `FR-F04-03` | Adjudicator dashboard (SCR-10) | *(feature chunk)* | US-034 | TC-E-007 |
| `FR-F04-04` | Applicant dashboard (SCR-11) | *(feature chunk)* | US-035 | TC-E-007 |
| `FR-F04-05` | Administrator dashboard (SCR-12) | *(feature chunk)* | US-036 | TC-E-007 |
| `FR-F04-06` | Widget interaction, linking, and state integrity | *(feature chunk)* | US-039 | TC-E-008 |

#### F5 — Unified work queue *(9)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F05-01` | Work queue screen (SCR-13) | §02 | US-040, US-049 | TC-I-022 |
| `FR-F05-02` | Aggregation and normalization across heterogeneous sources | *(feature chunk)* | US-040, US-070, US-075 | TC-I-017, TC-U-003 |
| `FR-F05-03` | Filtering semantics | §05 | US-021, US-042 | TC-I-018, TC-RN-004 |
| `FR-F05-04` | Sorting, pagination, and result counting | *(feature chunk)* | US-043, US-045 | TC-I-019 |
| `FR-F05-05` | Partial-failure tolerance and degraded queue (the resilience contract) | *(feature chunk)* | US-048 | TC-R-002 |
| `FR-F05-06` | Search within the queue | *(feature chunk)* | US-044 | TC-I-020 |
| `FR-F05-07` | Source attribution on every row | *(feature chunk)* | US-041 | TC-U-003 |
| `FR-F05-08` | Saved default view per role | *(feature chunk)* | US-046 | TC-I-021 |
| `FR-F05-09` | Queue context preservation | *(feature chunk)* | US-047 | TC-E-009 |

#### F6 — Work-item detail and action completion *(12)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F06-01` | Work-item detail screen (SCR-14) | §02 | US-011, US-050, US-058 | TC-I-004, TC-I-023, TC-R-003 |
| `FR-F06-02` | Type-specific detail content | *(feature chunk)* | US-050 | TC-I-023 |
| `FR-F06-03` | Server-computed action list and rendering | *(feature chunk)* | US-017, US-051 | TC-I-010, TC-I-024 |
| `FR-F06-04` | Action forms, validation, and submission | *(feature chunk)* | US-052, US-053, US-057 | TC-E-010, TC-I-025, TC-I-026 |
| `FR-F06-05` | Related items panel (on-ramp to F7) | *(feature chunk)* | US-055, US-060 | TC-I-028 |
| `FR-F06-06` | Activity history (merged spoke + hub) | *(feature chunk)* | US-056 | TC-I-029 |
| `FR-F06-07` | Confirmation, failure differentiation, and recovery paths | *(feature chunk)* | US-054 | TC-I-027 |
| `FR-F06-08` | eApp case view specifics (SCR-15) | *(feature chunk)* | US-050, US-062 | TC-I-023 |
| `FR-F06-09` | PDT designation view specifics (SCR-17) | *(feature chunk)* | US-057 | TC-E-010 |
| `FR-F06-10` | IEP applicant status view specifics (SCR-18) | *(feature chunk)* | US-057 | TC-E-010 |
| `FR-F06-11` | IM case assignment view specifics (SCR-19) | *(feature chunk)* | US-057, US-058 | TC-E-010 |
| `FR-F06-12` | Return-to-queue navigation | *(feature chunk)* | US-053 | TC-E-009 |

#### **F7 part a — FLAGSHIP workflow journey** *(6)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F07a-01` | The eApp ↔ PVQ relationship model | *(feature chunk)* | US-055, US-060, US-080 | TC-I-028 |
| `FR-F07a-02` | Step 1–2: Entry from the queue and case detail (SCR-13 → SCR-15) | *(feature chunk)* | US-059 | TC-E-011 |
| `FR-F07a-03` | Step 3: Discovery and traversal to the PVQ issue (SCR-15 → SCR-16) | *(feature chunk)* | US-061, US-062 | TC-E-011 |
| `FR-F07a-04` | Step 4: The resolution form (SCR-16) | *(feature chunk)* | US-063 | TC-E-011, TC-I-030 |
| `FR-F07a-05` | Step 6: Verification affordance and return path | *(feature chunk)* | US-067 | TC-E-013 |
| `FR-F07a-06` | Continuity assertions (the acceptance contract) | *(feature chunk)* | US-009, US-069, US-145 | TC-A-005, TC-E-004, TC-E-012 |

#### **F7 part b — FLAGSHIP workflow orchestration** *(7)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F07b-01` | Orchestration endpoint and execution sequence | *(feature chunk)* | US-064 | TC-E-011, TC-I-030, TC-I-031 |
| `FR-F07b-02` | Failure of leg 1 (PVQ): clean abort | *(feature chunk)* | US-064 | TC-I-032 |
| `FR-F07b-03` | Failure of leg 2 (eApp): partial completion and compensation | §04, §07 | US-066 | TC-R-004 |
| `FR-F07b-04` | Dual-system confirmation view (SCR-20) | *(feature chunk)* | US-065 | TC-E-011, TC-I-033 |
| `FR-F07b-05` | Post-condition state model | *(feature chunk)* | US-067 | TC-E-011, TC-E-013 |
| `FR-F07b-06` | Correlated audit chain for the workflow | *(feature chunk)* | US-068 | TC-I-034 |
| `FR-F07b-07` | Generalization: orchestration is not special-cased to one workflow | §01 | **— none** | TC-U-004 |

#### F8 part a — Adapter contract *(8)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F08a-01` | Interface operations (the contract) | §00 | **— none** | TC-AC-002 |
| `FR-F08a-02` | `describe()` and `healthCheck()` | §01 | US-072 | TC-AC-003, TC-I-057 |
| `FR-F08a-03` | `listWorkItems` and `getWorkItem` | §05 | **— none** | TC-AC-004 |
| `FR-F08a-04` | `performAction`, `getWorkItemSummary`, `getActivityHistory` | §05 | **— none** | TC-AC-005 |
| `FR-F08a-05` | Timeout, retry, backoff, and circuit-breaking policy | §01, §02, §05, §10 | US-073 | TC-AC-006, TC-AC-008 |
| `FR-F08a-06` | Adapter error taxonomy | *(feature chunk)* | **— none** | TC-AC-007 |
| `FR-F08a-07` | Capability negotiation and graceful affordance degradation | §05 | US-072 | TC-AC-003 |
| `FR-F08a-08` | Adapter conformance test suite | §02, §05 | US-074 | TC-AC-002, TC-AC-009, TC-AC-010 |

#### F8 part b — Data-driven application registry *(6)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F08b-01` | Registry record fields | *(feature chunk)* | US-070 | TC-E-015 |
| `FR-F08b-02` | Registry-derived behavior (the no-hard-coding rule) | §00, §02, §05 | US-070 | TC-E-015 |
| `FR-F08b-03` | Runtime enable/disable | *(feature chunk)* | US-071 | TC-E-015 |
| `FR-F08b-04` | Role visibility and per-application access scoping | *(feature chunk)* | **— none** | TC-I-036 |
| `FR-F08b-05` | Adapter call logging feeding audit and integration issues | §02 | US-073 | TC-I-037 |
| `FR-F08b-06` | Registry integrity and startup validation | §00 | US-075 | TC-I-035 |

#### F9 — Five simulated spoke services with isolated namespaces *(8)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F09-01` | Service isolation (the deliverable) | §00, §04 | US-076, US-079 | TC-AC-009, TC-I-038, TC-R-005, TC-U-005 |
| `FR-F09-02` | eApp (Electronic Application) | *(feature chunk)* | US-078 | TC-I-040 |
| `FR-F09-03` | PVQ (Personnel Vetting Questionnaire) | *(feature chunk)* | US-078 | TC-I-040 |
| `FR-F09-04` | IEP (Individual Engagement Portal) | *(feature chunk)* | US-078 | TC-I-040 |
| `FR-F09-05` | PDT (Position Designation Tool) | *(feature chunk)* | US-078 | TC-I-040 |
| `FR-F09-06` | IM (Investigation Management) | §04 | US-078 | TC-I-040 |
| `FR-F09-07` | Common spoke service requirements | §01, §04 | **— none** | TC-AC-001, TC-AC-011, TC-I-031 |
| `FR-F09-08` | Independent queryability (the proof surface) | §00 | US-067, US-077 | TC-E-013, TC-I-039 |

#### F10 — Unified layer API / BFF *(7)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F10-01` | Request pipeline (the choke point) | §01, §02, §16 | US-010, US-081 | TC-I-041, TC-RN-007, TC-RN-008 |
| `FR-F10-02` | Endpoint groups and their screens | *(feature chunk)* | **— none** | TC-I-045, TC-RN-009 |
| `FR-F10-03` | Consistent error contract | *(feature chunk)* | US-082 | TC-AC-007, TC-I-011, TC-I-042 |
| `FR-F10-04` | Pagination, filtering, and sorting conventions | *(feature chunk)* | **— none** | TC-I-019, TC-I-046 |
| `FR-F10-05` | Mandatory audit on mutation | *(feature chunk)* | US-083 | TC-I-043 |
| `FR-F10-06` | API documentation as a deliverable | §00, §02, §06 | US-084 | TC-I-044 |
| `FR-F10-07` | Rate limiting and abuse resistance (demo-grade) | §02 | **— none** | TC-I-047 |

#### F11 — Administrator console *(7)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F11-01` | Connected applications inventory (SCR-22) | *(feature chunk)* | US-086 | TC-I-048 |
| `FR-F11-02` | System health view (SCR-24) | *(feature chunk)* | US-087 | TC-I-049 |
| `FR-F11-03` | Integration issues log (SCR-25) | *(feature chunk)* | US-066, US-088 | TC-I-050, TC-R-004 |
| `FR-F11-04` | Application detail view (SCR-23) | *(feature chunk)* | US-071, US-075, US-089 | TC-I-051 |
| `FR-F11-05` | Manual connection test | *(feature chunk)* | US-090 | TC-I-052 |
| `FR-F11-06` | System announcements management (SCR-29) | *(feature chunk)* | US-091 | TC-I-053 |
| `FR-F11-07` | Policy visibility and console-wide conventions | *(feature chunk)* | US-020, US-023, US-025, US-092, US-093 | TC-A-006, TC-I-054, TC-RN-003, TC-RN-006 |

#### F12 — Application registration and onboarding *(8)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F12-01` | Multi-step registration form (SCR-28) | *(feature chunk)* | US-094 | TC-E-016 |
| `FR-F12-02` | Field validation rules and messages | *(feature chunk)* | US-095 | TC-I-055 |
| `FR-F12-03` | Live connection test (step 3) | *(feature chunk)* | US-096 | TC-I-056 |
| `FR-F12-04` | Capability auto-discovery (step 4) | §05 | US-097 | TC-I-057 |
| `FR-F12-05` | Post-registration propagation | *(feature chunk)* | US-098 | TC-E-017 |
| `FR-F12-06` | The demo sixth application (CVS) | *(feature chunk)* | US-099 | TC-E-016 |
| `FR-F12-07` | Edit and de-register flows | §03 | US-100 | TC-I-058 |
| `FR-F12-08` | Onboarding documentation | *(feature chunk)* | **— none** | TC-I-059 |

#### F13 — Immutable audit trail and viewer *(8)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F13-01` | Mandatory audit write on every mutation | *(feature chunk)* | US-053, US-083, US-101 | TC-I-026, TC-I-043, TC-I-060 |
| `FR-F13-02` | Record schema and coverage | *(feature chunk)* | US-002, US-093, US-102, US-103 | TC-I-054, TC-I-061, TC-I-062 |
| `FR-F13-03` | Append-only storage and integrity | §02, §03, §04, §06 | US-023, US-104 | TC-I-063, TC-RN-006 |
| `FR-F13-04` | Correlated cross-system chains | *(feature chunk)* | US-014, US-068, US-107 | TC-I-007, TC-I-034 |
| `FR-F13-05` | Audit viewer (SCR-33) | *(feature chunk)* | US-105 | TC-I-064 |
| `FR-F13-06` | Record detail and chain view (SCR-34) | *(feature chunk)* | US-106 | TC-I-065 |
| `FR-F13-07` | Role-scoped audit visibility | *(feature chunk)* | US-107 | TC-RN-010 |
| `FR-F13-08` | Export | *(feature chunk)* | US-108 | TC-I-066 |

#### F14 — USWDS v3 accessible interface, Section 508 / WCAG 2.1 AA *(12)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F14-01` | USWDS component adoption and token-only theming | §02 | US-118 | TC-A-016, TC-U-006 |
| `FR-F14-02` | Keyboard operability | *(feature chunk)* | US-069, US-109 | TC-A-005, TC-A-007, TC-A-009 |
| `FR-F14-03` | Accessible forms | §02, §16 | US-052, US-063, US-113 | TC-A-010, TC-I-025 |
| `FR-F14-04` | Accessible data tables | *(feature chunk)* | US-045, US-092, US-110 | TC-A-004, TC-A-006, TC-A-008, TC-I-019 |
| `FR-F14-05` | Accessible navigation and landmarks | *(feature chunk)* | US-026, US-111, US-112 | TC-A-002, TC-A-007 |
| `FR-F14-06` | Color contrast and non-color meaning | *(feature chunk)* | US-111, US-114 | TC-A-009, TC-A-011 |
| `FR-F14-07` | Screen-reader semantics and live regions | *(feature chunk)* | US-115 | TC-A-008, TC-A-012 |
| `FR-F14-08` | Motion, zoom, and responsive behavior | *(feature chunk)* | US-035, US-116 | TC-A-013 |
| `FR-F14-09` | Timing and session accessibility | *(feature chunk)* | US-006, US-117 | TC-A-014 |
| `FR-F14-10` | Error, empty, and loading state accessibility | *(feature chunk)* | **— none** | TC-A-015 |
| `FR-F14-11` | Accessibility statement (SCR-36) | *(feature chunk)* | US-118 | TC-A-016 |
| `FR-F14-12` | Accessibility verification gate | §02 | US-118, US-149 | TC-A-017 |

#### F15 — Notifications, alerts, and system announcements *(6)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F15-01` | Derived alert computation | *(feature chunk)* | US-119, US-124 | TC-I-067, TC-R-006 |
| `FR-F15-02` | Alert presentation: dashboard, header indicator, list (SCR-21) | *(feature chunk)* | US-120, US-124 | TC-I-068 |
| `FR-F15-03` | Read/unread state | *(feature chunk)* | US-121 | TC-I-069 |
| `FR-F15-04` | System announcements rendering | *(feature chunk)* | US-091, US-122 | TC-I-053, TC-I-070 |
| `FR-F15-05` | Distinction from the demo banner | *(feature chunk)* | US-027, US-123 | TC-A-003, TC-A-018 |
| `FR-F15-06` | Notifications list screen behavior (SCR-21) | *(feature chunk)* | US-120 | TC-I-068 |

#### F16 — Health monitoring, resilience, degraded-system UX *(12)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F16-01` | Health monitor service | *(feature chunk)* | US-125 | TC-I-071 |
| `FR-F16-02` | Health summary endpoint | *(feature chunk)* | US-125 | TC-I-049, TC-I-071 |
| `FR-F16-03` | Health state definitions | §10 | US-087, US-125 | TC-AC-008, TC-I-071 |
| `FR-F16-04` | Pre-emptive action disabling | *(feature chunk)* | US-051, US-126 | TC-I-024, TC-R-007 |
| `FR-F16-05` | Degraded-system warning presentation | *(feature chunk)* | US-038, US-048, US-127 | TC-R-001, TC-R-002, TC-R-003, TC-R-008 |
| `FR-F16-06` | Loading states | §02 | US-037, US-128 | TC-I-016, TC-R-009 |
| `FR-F16-07` | Empty states | §10 | US-049, US-124, US-129 | TC-I-022, TC-R-006, TC-R-010, TC-R-014 |
| `FR-F16-08` | Error states | *(feature chunk)* | US-054, US-058, US-130 | TC-I-015, TC-I-027, TC-R-003, TC-R-011 |
| `FR-F16-09` | Integration issue recording | *(feature chunk)* | US-088 | TC-I-037, TC-I-050 |
| `FR-F16-10` | Global error boundary (SCR-32) | *(feature chunk)* | US-130 | TC-R-011 |
| `FR-F16-11` | Failure injection controls (SCR-38) | §01, §04 | US-131 | TC-I-072 |
| `FR-F16-12` | Automatic recovery | *(feature chunk)* | US-038, US-132 | TC-R-001, TC-R-012 |

#### F17 — Synthetic seed data corpus *(11)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F17-01` | Seed volume and distribution | *(feature chunk)* | US-133 | TC-I-073 |
| `FR-F17-02` | Personas and role/attribute coverage | §13 | **— none** | TC-I-074 |
| `FR-F17-03` | The flagship workflow's seeded preconditions | *(feature chunk)* | US-137 | TC-I-075 |
| `FR-F17-04` | Referential coherence across isolated namespaces | §04 | US-080 | TC-U-005, TC-U-007 |
| `FR-F17-05` | Deterministic seeding | *(feature chunk)* | US-136 | TC-U-008 |
| `FR-F17-06` | Edge-state coverage | *(feature chunk)* | US-022, US-134 | TC-I-076, TC-RN-005 |
| `FR-F17-07` | Per-persona screen coverage matrix | *(feature chunk)* | US-133 | TC-I-073 |
| `FR-F17-08` | Obviously synthetic content | §01, §04 | US-135 | TC-U-009 |
| `FR-F17-09` | Seed data documentation | §00 | US-135 | TC-U-009 |
| `FR-F17-10` | Seed validation | *(feature chunk)* | US-137 | TC-I-075, TC-I-077 |
| `FR-F17-11` | Reset to baseline | §09 | US-099, US-136 | TC-E-014, TC-E-018 |

#### F18 — Demo operability *(9)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F18-01` | Single startup command | §00, §02 | US-138, US-139 | TC-E-019 |
| `FR-F18-02` | Per-service control | §00 | US-079, US-143 | TC-I-078, TC-R-005 |
| `FR-F18-03` | Pre-flight checks, seeding, and reset | *(feature chunk)* | US-139 | TC-I-079 |
| `FR-F18-04` | README | §00, §02 | US-144 | TC-E-020 |
| `FR-F18-05` | Flagship demo script (F7) | §00 | US-059, US-077, US-140 | TC-E-021, TC-I-039 |
| `FR-F18-06` | Secondary demo scripts | §00 | US-141 | TC-E-022 |
| `FR-F18-07` | Service status page (SCR-37) | *(feature chunk)* | US-142 | TC-I-080 |
| `FR-F18-08` | Clean shutdown | *(feature chunk)* | US-144 | TC-I-081 |
| `FR-F18-09` | Documented troubleshooting | *(feature chunk)* | US-144 | TC-I-082 |

#### F19 — Automated test and accessibility verification suite *(10)*

| FRD requirement | Title | TechArch cite | User stories | Test cases |
|---|---|---|---|---|
| `FR-F19-01` | Flagship workflow end-to-end test | *(feature chunk)* | US-145 | TC-E-014, TC-E-023 |
| `FR-F19-02` | RBAC enforcement tests | §08 | US-018, US-019, US-085, US-146 | TC-RN-001, TC-RN-007, TC-RN-008, TC-RN-009, TC-RN-011 |
| `FR-F19-03` | Adapter conformance and behavior tests | §00, §01, §03, §04 | US-074, US-147 | TC-AC-010, TC-AC-012 |
| `FR-F19-04` | Resilience tests | §06, §10 | US-147 | TC-R-013, TC-R-014, TC-R-015 |
| `FR-F19-05` | Audit coverage and immutability tests | *(feature chunk)* | US-148 | TC-I-083 |
| `FR-F19-06` | Automated accessibility scan | §02 | US-149 | TC-A-017, TC-A-019 |
| `FR-F19-07` | Keyboard navigation smoke test | §02 | US-149 | TC-A-005, TC-A-007, TC-A-020 |
| `FR-F19-08` | Link and control integrity crawl | *(feature chunk)* | US-032, US-150 | TC-A-003, TC-E-006, TC-E-024 |
| `FR-F19-09` | Reviewer-readable results summary | *(feature chunk)* | US-085, US-151 | TC-I-084 |
| `FR-F19-10` | Test environment and determinism | §02 | US-151 | TC-I-085, TC-U-008 |
---

## 6. Human-Centred Traceability Layer — PERSONAS → JTBD → JOURNEYS → STORY-MAP → UserStories

The suite carries a full human-centred layer, and a builder needs it as much as the engineering spine: it is what tells you *why* a requirement exists and *which demo segment breaks* if you cut a story. This section traces it end to end and converges it on the same 151 stories.

### 6.1 Personas → Jobs

| Persona | Role | Jobs held | Primary job | Release at which they can do meaningful work | Demo segments |
|---|---|---|---|---|---|
| **PER-01** Marcus Vale | Investigator | `JTBD-01.1`, `JTBD-01.2`, `JTBD-01.3`, `JTBD-01.4` | **`JTBD-01.1`** — clear a blocking issue in one sitting *(the flagship)* | **R1** — fully | 1 *(primary)*, 2a, 3b |
| **PER-02** Dana Okonkwo | Adjudicator | `JTBD-02.1`, `JTBD-02.2`, `JTBD-02.3`, `JTBD-02.4` | `JTBD-02.2` — render a determination defensible years later | **R2** — fully; none in R1 *(deliberate)* | 4, 2c |
| **PER-03** Renée Ashford | Applicant | `JTBD-03.1`, `JTBD-03.2`, `JTBD-03.3`, `JTBD-03.4` | `JTBD-03.1` — find out where I actually stand | **R2** — fully; none in R1 *(deliberate)* | 5a, 5b |
| **PER-04** Priya Raghunathan | Administrator | `JTBD-04.1`, `JTBD-04.2`, `JTBD-04.3`, `JTBD-04.4` | `JTBD-04.1` — onboard the next application as configuration | R1 partial *(verifier only)* → R2 partial *(auditor)* → **R3** fully *(operator)* | 3a, 6, 2b |

> Seeded identity binding is asserted at seed time by `FR-F17-02` AC-3 and `FR-F17-10`, and verified by `TC-I-074`: PER-01 → Marcus Vale, PER-02 → Dana Okonkwo, PER-03 → Renée Ashford (`SUBJ-00622`), PER-04 → Priya Raghunathan. The supporting cast (Harlan T. Boyce, Ingrid L. Vasterling, Sofia K. Mendelbaum, Theodore Q. Lansbury / `SUBJ-00418`, Bartholomew N. Quigley) are deliberately **not** design personas and carry no `PER-ID`.

### 6.2 Jobs → Features → Journeys → Stories

Story sets are taken from the `STORY-MAP` JTBD coverage table, which is the authoritative job→story mapping in the suite.

| JTBD | Persona | Priority | PRD features | Journeys | Stories carrying the job | NaC derived | First release |
|---|---|---|---|---|---|---|---|
| **`JTBD-01.1`** *(flagship)* | PER-01 | **P0** | **F7**, F1, F2, F3, F6, F9, F10, F13, F14 | **JRN-01.01** | US-001, US-002, US-009, US-016, US-021, US-022, US-055, **US-059…US-069**, US-077, US-109 | **10** | **R1** |
| `JTBD-01.2` | PER-01 | P0 | F5, F4, F15, F3, F2, F17 | JRN-01.02, JRN-01.01 | US-033, US-039, US-040…US-047, US-119 | 5 | R1 |
| `JTBD-01.3` | PER-01 | P0 | F13, F6, F10, F2, F1 | JRN-01.01, JRN-01.02 | US-053, US-056, US-068, US-083, US-101, US-106 | 4 | R1 |
| `JTBD-01.4` | PER-01 | P1 | F16, F5, F4, F14, F9, F11 | JRN-01.03, JRN-04.03 | US-037, US-048, US-058, US-073, US-115, US-126, US-127, US-128, US-130, US-132 | 6 | R2 *(US-130)* → **R3** |
| `JTBD-02.1` | PER-02 | P0 | F6, F5, F7, F1, F3, F14, F17 | JRN-02.01 | US-011, US-030, US-041, US-044, US-050, US-055, US-056, US-114 | 4 | R2 |
| `JTBD-02.2` | PER-02 | P0 | F2, F6, F13, F10, F14 | JRN-02.01 | US-013, US-017, US-019, US-051, US-057, US-101, US-102, US-104, US-105, US-146 | 5 | R2 |
| `JTBD-02.3` | PER-02 | P1 | F4, F5, F15, F6, F14 | JRN-02.02 | US-034, US-039, US-042, US-043, US-057, US-120, US-121 | 3 | R2 |
| `JTBD-02.4` | PER-02 | P1 | F16, F6, F5, F14, F9 | JRN-02.02 | US-038, US-049, US-058, US-124, US-126, US-127, US-129 | 3 | R2 *(US-049)* → **R3** |
| `JTBD-03.1` | PER-03 | P0 | F4, F5, F1, F3, F14, F17 | JRN-03.01, JRN-03.02 | US-003, US-004, US-015, US-028, US-035, US-116 | 4 | R2 |
| `JTBD-03.2` | PER-03 | P0 | F5, F6, F4, F0, F14 | JRN-03.01 | US-006, US-052, US-053, US-057, US-113, US-117 | 4 | R2 |
| `JTBD-03.3` | PER-03 | P1 | F15, F4, F6, F14, F3 | JRN-03.01 | US-115, US-121, US-122, US-123 | 3 | R2 |
| `JTBD-03.4` | PER-03 | P1 | F2, F13, F6, F10, F19 | JRN-03.02 | US-005, US-007, US-015, US-018, US-020, US-024, US-103, US-105, US-107 | 5 | R1 *(partial)* → **R2** |
| **`JTBD-04.1`** *(extensibility)* | PER-04 | **P1** | **F12**, F8, F11, F13, F14, F9, F18 | JRN-04.01, JRN-01.02 | US-070, US-071, US-074, **US-094…US-100**, US-147 | 5 | R1 *(partial)* → **R3** |
| `JTBD-04.2` | PER-04 | P1 | **F11**, **F16**, F8, F14, F9, F10 | JRN-04.02, JRN-04.03 | US-036, US-086, US-087, US-090, US-125, US-131, US-132, US-149, US-151 | 4 | R1 *(partial)* → **R3** |
| `JTBD-04.3` | PER-04 | P1 | F11, F13, F16, F10, F14, F8 | JRN-04.02 | US-025, US-082, US-084, US-088, US-089, US-091, US-103, US-105, US-139, US-144 | 5 | R2 *(partial)* → **R3** |
| `JTBD-04.4` | PER-04 | P1 | F13, F11, F16, F2, F15, F19, F18 | JRN-04.02, JRN-04.03, JRN-03.02 | US-014, US-023, US-081, US-093, US-102, US-103, US-104, US-108, US-131, US-141, US-143, US-148 | 4 | R1 *(partial)* → **R3** |

**Job coverage: 16 of 16 addressed.** 74 needs-and-constraints derived. The flagship job carries 10 — the heaviest derivation in the suite, which is correct: it has the most stages, the most failure modes, and the most at stake in a live evaluation.

### 6.3 Journeys → Stories → Releases → Demo segments

| Journey | Persona | Stages | Primary jobs | Stage-covering stories | Completed in | Demo segment |
|---|---|---|---|---|---|---|
| **JRN-01.01** Clear the blocking issue *(flagship)* | PER-01 | **11** | `JTBD-01.1` *(primary)*, `JTBD-01.2` *(entry)*, `JTBD-01.3` *(record)* | **US-059…US-069 (11/11)** | **R1** | **1 — primary, ~5 min** |
| JRN-01.02 Monday-morning triage | PER-01 | 7 | `JTBD-01.2`, `JTBD-01.3` | US-033, US-039, US-040…US-047, US-119 *(stages 1–6)*; **US-098** *(stage 7)* | R3 *(6/7 at R1)* | 3b |
| JRN-01.03 Keep working while IM is down | PER-01 | 7 | `JTBD-01.4` | **US-048, US-126, US-127, US-128, US-132** + US-037, US-058, US-073, US-115, US-130 | R3 | **2a** |
| JRN-02.01 Assemble and determine | PER-02 | 9 | `JTBD-02.1`, `JTBD-02.2` | US-011, US-013, US-017, US-019, US-030, US-041, US-044, US-050, US-051, US-055, US-056, US-057, US-114 | R2 *(9/9)* | **4** |
| JRN-02.02 Aging queue, missing data | PER-02 | 7 | `JTBD-02.3`, `JTBD-02.4` | US-034, US-038, US-039, US-042, US-043, US-049, US-120, US-121, US-124, US-126, US-127; **US-129** *(stages 5–6)* | R3 *(5/7 at R2)* | 2c |
| JRN-03.01 Where I stand, what I owe | PER-03 | 8 | `JTBD-03.1`, `JTBD-03.2`, `JTBD-03.3` | US-003, US-004, US-006, US-015, US-028, US-035, US-052, US-053, US-057, US-113, US-115, US-116, US-117, US-121, US-122, US-123 | R2 *(8/8)* | 5a |
| JRN-03.02 Proof and boundary | PER-03 | 6 | `JTBD-03.4` | US-005, US-007, US-015, **US-018, US-020, US-024**, US-103, US-105, US-107 | R2 *(6/6)* | **5b** |
| JRN-04.01 Register the sixth application | PER-04 | 9 | `JTBD-04.1` | **US-094…US-100** + US-070, US-071, US-074, US-147 | R3 *(9/9)* | **3a** |
| JRN-04.02 Triage an integration failure | PER-04 | 8 | `JTBD-04.2`, `JTBD-04.3`, `JTBD-04.4` | **US-086…US-093** + US-025, US-082, US-084, US-103, US-105 | R3 *(8/8)* | 6 |
| JRN-04.03 Rehearse degradation | PER-04 | 6 | `JTBD-04.2`, `JTBD-04.4` | **US-131, US-143, US-125, US-132** + US-141, US-127 | R3 *(6/6)* | **2b** |

**Journey coverage: 10 of 10 journeys and 78 of 78 stages have at least one covering story.**

> **Traceability-direction note, carried to `RTM-GAP-05`.** `JOURNEYS-DCSA-UAL.md` contains **zero `US-` references** across all thirteen of its chunks (verified). Journey→story traceability therefore exists only in `STORY-MAP-DCSA-UAL.md`, and the story sets in the table above are reconstructed from the STORY-MAP JTBD coverage table and the per-release "closed by" attributions. The reconstruction is sound and the coverage claim is verifiable, but a JOURNEYS revision should carry story IDs on its stage tables so the link is stated rather than derived.

### 6.4 Story-map releases → stories → demonstrable journeys

| Release | Theme | Stories | Backbone coverage | Journeys complete | Demo segments runnable |
|---|---|---|---|---|---|
| **R1** | Walking skeleton — the flagship journey, end to end | **67** | Authenticate 8 · Orient 7 · Find work 14 · Work an item 17 · Resolve across systems 8 · Verify & Audit 10 · Administer & Extend 3 | **JRN-01.01 (11/11)** | **Segment 1** *(the thesis)* |
| **R2** | Role breadth and trust | **34** *(36 rows less 2 split-acceptance carry-overs)* | Authenticate 7 · Orient 8 · Find work 5 *(incl. US-078 IEP/PDT and US-133 PER-02…04, both continuing from R1)* · Work an item 3 · Resolve across systems 9 · Verify & Audit 4 | + JRN-02.01, JRN-03.01, JRN-03.02 | Segments 1, 4, 5a, 5b *(role- and resource-level zero trust)* |
| **R3** | Extensibility and operability | **50** | Orient 4 · Find work 2 · Work an item 2 · Verify & Audit 10 · Administer & Extend 32 | + JRN-01.02, JRN-01.03, JRN-02.02, JRN-04.01, JRN-04.02, JRN-04.03 — **all ten** | **All six segments** |
| **Total** | — | **151** | 7 of 7 backbone steps populated | 10 of 10 | 6 of 6 |

Three stories (US-061, US-067, US-107) appear in a second activity row marked *(shared)* because they carry two distinct user-observable claims at the same stage; three (US-078, US-107, US-133) have acceptance legitimately split across two releases. Neither is double-counted in the totals. Seven stories (US-008, US-027, US-032, US-118, US-123, US-135, US-150) have **no JTBD ancestor** and are parented to PRD product principles — US-008, US-027, US-118, US-123, US-135 → `PRIN-06` *(honest demo)*; US-032, US-150 → `PRIN-03` *(every button works)*.

### 6.5 Principles → Stories

| Principle | Statement | Stories parented to it | Requirements | Test cases |
|---|---|---|---|---|
| `PRIN-01` | Continuity over navigation | *(delivered through `JTBD-01.1`)* | `FR-F01-03`, `FR-F03-06`, `FR-F07a-03`, `FR-F07a-06` | TC-E-005, TC-E-012 |
| `PRIN-02` | Server is the authority | *(delivered through F2/F10)* | `FR-F02-01`, `FR-F02-06`, `FR-F10-01` | TC-I-041, TC-RN-007, TC-RN-011 |
| `PRIN-03` | Every button works | **US-032, US-150** | `FR-F03-02`, `FR-F19-08` | TC-E-006, TC-E-024 |
| `PRIN-04` | Degrade visibly, never blankly | *(delivered through F16)* | `FR-F16-05`, `FR-F16-08`, `FR-F16-10` | TC-R-008, TC-R-011, TC-R-013 |
| `PRIN-05` | Configuration over code | *(delivered through F8/F12)* | `FR-F08b-02`, `FR-F12-01`, `FR-F12-05` | TC-E-015, TC-E-016, TC-E-017 |
| `PRIN-06` | Honest demo | **US-008, US-027, US-118, US-123, US-135** | `FR-F00-08`, `FR-F03-03`, `FR-F14-11`, `FR-F15-05`, `FR-F17-08` | TC-A-001, TC-A-003, TC-A-016, TC-A-018, TC-U-009 |

---

## 7. FLAGSHIP Traceability Thread — the product's central claim, end to end

> **The charter is unambiguous: "If everything else fails, that single unified workflow must work."** This section exists so a reviewer can verify that claim's traceability in one view rather than by assembling it from six documents.

### 7.1 The claim

An investigator, signed in **once**, opens an eApp case from the unified work queue, discovers a related PVQ issue raised against a specific questionnaire answer, resolves that issue **without leaving the unified experience**, and observes **both** eApp and PVQ reflect the change — with no second login, no second application, no re-entry of context, and no manual correlation.

### 7.2 The thread

| Layer | Identifier | Content |
|---|---|---|
| Charter | `.planning/PROJECT.md` "Core Value" | "A user signs in once and completes a cross-application workflow end-to-end without ever logging into — or navigating to — a second system." |
| Persona | **PER-01** Marcus Vale | Field/desk background investigator, 38–45 active cases across IM, eApp, PVQ, PDT; measured on on-time closure and on the defensibility of what he recorded |
| Job | **`JTBD-01.1`** (P0) | "When a case is blocked by an issue raised against a questionnaire answer, I want to clear it in one sitting, so the investigation keeps moving." |
| Journey | **`JRN-01.01`** — 11 stages, Demo Segment 1, target **under three minutes** manually | Sign in → Orient → Enter the work → Open the case → Read the answer → **Discover the relationship** → **Traverse** → Resolve → **See both systems answer** → Verify on the case → Leave the record |
| PRD feature | **F7** (P0 — highest priority in the product) | Eleven named capabilities from entry through orchestration, consistency handling, dual-system confirmation, verification affordance, audit chain, continuity assertions, and the scripted demo path |
| Screens | `SCR-13` → `SCR-15` → `SCR-16` → `SCR-20`, then `SCR-15` re-read → `SCR-34` | Work queue → eApp case view → PVQ issue detail & resolution → dual-system confirmation → case re-read → audit chain view |
| Endpoints | `GET /api/work-items` → `GET /api/work-items/EAPP:CASE-A-1042` → `/related` → `GET /api/work-items/PVQ:ISS-2207` → **`POST /api/orchestration/resolve-pvq-issue`** → `GET /api/audit/chain/{correlationId}`; retry via `POST /api/orchestration/{transactionId}/retry` | The orchestration endpoint is the only one whose `ActionDescriptor.targetSystems` has length > 1 |
| Seeded preconditions | `FR-F17-03`, `JRN-01.01` P1–P8 | hub: INVESTIGATOR bound to PER-01, CAC/PIV, `org=DCSA-FIELD-OPS-EAST`, `tier=T5`, `region=REGION-NE`, holds the assignment · eapp: `CASE-A-1042`, `SUBJ-00418`, `UNDER_REVIEW`, `outstandingIssueCount=1`, due in 4 days, ≥2 employer entries in `SECTION_13A` · pvq: `ISS-2207`, `OPEN`, `answerLocus=SECTION_13A.employer[0].endDate`, raised 3 days ago, `answerSnapshot` populated · pdt + im: designations/assignments on the same case so the panel shows three relationship types · hub: default queue surfaces the case on page 1 unfiltered, `ALERT-NEW-PVQ-ISSUE` fires, ~120 pre-seeded audit events, plus a spare second open issue for mid-session re-runs |

### 7.3 Requirements → stories → tests, step by step

| # | Journey stage | FRD requirement | User story | Verifying test cases |
|---|---|---|---|---|
| — | Relationship model *(underpins 6–10)* | `FR-F07a-01` — the eApp ↔ PVQ relationship model | US-055, US-060, US-080 | TC-I-028, TC-U-005, TC-U-007 |
| 1–3 | Sign in, orient, enter the work | `FR-F00-01`, `FR-F00-02`, `FR-F04-02`, `FR-F15-01`, `FR-F05-01` | US-001, US-002, US-033, US-119, US-040 | TC-E-001, TC-E-007, TC-I-016, TC-I-067, TC-I-017 |
| 4–5 | Open the case, read the flagged answer | **`FR-F07a-02`** — entry from the queue and case detail (SCR-13 → SCR-15) | **US-059** | TC-E-011, TC-E-012, TC-I-023 |
| 6 | Discover the relationship | `FR-F07a-01`, `FR-F06-05` — related-items panel resolved live through the PVQ adapter | **US-060** | TC-E-011, TC-I-028 |
| 7 | **Traverse** *(highest accessibility risk in the product)* | **`FR-F07a-03`** — discovery and traversal (SCR-15 → SCR-16); `FR-F03-06` breadcrumbs | **US-061**, US-062 | TC-E-011, TC-E-012, TC-E-005, TC-A-005 |
| 8 | Resolve — disposition and narrative | **`FR-F07a-04`** — the resolution form (SCR-16); `FR-F14-03` accessible forms | **US-063** | TC-E-011, TC-I-025, TC-I-030, TC-A-010 |
| 8 | Orchestrate both legs | **`FR-F07b-01`** execution sequence; **`FR-F07b-02`** leg-1 clean abort | **US-064** | TC-E-011, TC-I-030, TC-I-031, TC-I-032 |
| 9 | **See both systems answer** | **`FR-F07b-04`** dual-system confirmation (SCR-20); **`FR-F07b-05`** post-condition state model | **US-065** | TC-E-011, TC-I-033 |
| 9′ | **Partial completion — the honest half** | **`FR-F07b-03`** leg-2 failure, partial completion and forward recovery; `FR-F11-03` integration issue | **US-066** | **TC-R-004**, TC-I-050 |
| 10 | Verify independently | **`FR-F07a-05`** verification affordance and return path; `FR-F09-08` independent queryability | **US-067** | **TC-E-013**, TC-I-039, TC-E-009 |
| 11 | Leave the record | **`FR-F07b-06`** correlated audit chain; `FR-F13-04` cross-system chains | **US-068** | TC-I-034, TC-I-007, TC-I-065 |
| all | Keyboard-only completion | `FR-F14-02` keyboard operability; **`FR-F07a-06`** continuity assertions | **US-069** | **TC-A-005**, TC-A-007, TC-A-009 |
| all | Continuity contract | **`FR-F07a-06`** — the acceptance contract, ten asserted properties | US-009, US-069, US-145 | **TC-E-012**, TC-E-004 |
| — | Generic orchestration *(not special-cased)* | **`FR-F07b-07`** — the engine names no spoke | **— no story** *(`RTM-GAP-02`)* | **TC-U-004** |
| — | Demo script and repeatability | `FR-F18-05` flagship demo script steps 1–13; `FR-F17-11` reset; `FR-F19-01` E2E gate | US-140, US-136, US-145 | TC-E-021, TC-E-014, TC-E-018, TC-E-023 |

### 7.4 Architecture that carries it

| Concern | TechArch specification | ADR |
|---|---|---|
| Distributed write | §11.2 execution sequence — reconciliation row written **before** the first spoke call; PVQ leg first (authoritative outcome), then eApp parent-state | — |
| Failure strategy | §11.1, §11.3 — **forward recovery, never compensating rollback**: a recorded investigative disposition is not fabricated away | **ADR-011** |
| Retry durability | §11.7 retry worker draining `hub.orchestration_retry_queue` on a backoff schedule | **ADR-010** — the retry queue is a database table, not in-process state |
| Confirmation integrity | §11.5 — the confirmation view shows **observed state, not asserted state**: a fresh re-read per spoke, and a failed re-read renders "couldn't confirm" rather than being omitted | — |
| Genericity | §11.6 — the engine is driven by `hub.orchestration_definitions` and contains no application identifier; enforced by architecture conformance test | ADR-016 |
| Idempotency | `hub.idempotency_records` at the hub, `<ns>.idempotency_records` at each spoke, 24-hour retention, `409 IDEMPOTENCY_KEY_REUSED` on same key + different payload | — |
| Authorisation of both legs | §8.3 PDP evaluates `ISSUE.RESOLVE` on `PVQ:ISS-2207` **and** `CASE.UPDATE_ISSUE_STATE` on `EAPP:CASE-A-1042` before anything is written | ADR-016 |
| Audit | §9.2 interceptor at pipeline hook 9 (`onSend`, mutations), §9.5 correlated chains | ADR-016 |

### 7.5 Success metrics riding on the flagship

| Metric | Target | Verified by | Observed where |
|---|---|---|---|
| `SM-01` Flagship workflow completion | End to end in a single session, under three minutes manually | TC-E-011, TC-E-023 | Live demo Segment 1 + `flagship.spec.ts` |
| `SM-02` Re-authentications | **Exactly zero** — one `AUTH_SUCCESS` record for the session | TC-E-012, TC-E-004 | `flagship.spec.ts:authEventCount` + audit log shown live |
| `SM-03` Dual-system change verified independently | Both spoke APIs return updated state with the hub out of the path | **TC-E-013**, TC-I-039 | `curl http://localhost:7102/issues/ISS-2207` and `:7101/cases/CASE-A-1042`, live |
| `SM-04` Context loss | Zero identifiers re-entered at any step | TC-E-012 | `identifiersTypedByTest()` equals the narrative only |
| `SM-08` Keyboard-only completion | Flagship completable keyboard-only | **TC-A-005** | Recorded manual keyboard pass + keyboard smoke suite |
| `SM-20` Flagship audit chain | Whole action retrievable as one correlated chain | TC-I-034 | Audit viewer SCR-34, live |
| `SM-22` Demo repeatability | Three consecutive identical runs with a reset between | TC-E-014, TC-E-018 | Pre-demo rehearsal |

### 7.6 Risks attached to this thread

| Risk | Mitigation traced to |
|---|---|
| `R-02` Flagship feels stitched together | `FR-F07a-03` in-shell traversal, `FR-F03-06` breadcrumb carry-over, `FR-F07a-06` asserted continuity — TC-E-012, TC-E-005 |
| `R-03` Scope breadth starves the flagship | `STORY-MAP` R1 scope test *(is this slice needed to watch JRN-01.01 complete?)*; US-145 ships in R1 so R3's breadth cannot silently break R1's depth |
| `R-06` Dual-system update partially fails during the demo | `FR-F07b-03` explicit partial-completion state, no "success" copy, retry path, forward recovery — **TC-R-004** asserts the absence of the word "success" literally |
| `R-08` Demo environment fails on demo day | `FR-F18-01`, `FR-F18-03`, `FR-F18-09`, `FR-F17-11` — TC-E-019, TC-I-079, TC-I-082, TC-E-018 |

---

## 8. Test Case Coverage Matrix

**176 test cases across seven types.** Every test case is derived from a named acceptance criterion in the FRD or in a user story, and is assigned to a suite named in `FR-F19-01…10` or `TechArch §14`. Coverage properties, verified by construction:

- **All 182 FRD requirements have at least one verifying test case.**
- **All 151 user stories have at least one verifying test case.**
- **All 20 PRD features have test cases in at least two different test types.**
- No test case asserts behaviour that is not already specified upstream; where a TC exists to close a story gap (for example `TC-U-004` for `FR-F07b-07`), it is flagged in §11.

| Type | Count | Tier / tooling | Runtime budget | What it protects |
|---|---|---|---|---|
| Unit | 9 | Vitest 2.1 (~400 assertions) | < 30 s | PDP decisions, normalisation, circuit state machine, hash chain, scope derivation, date offsetting, architecture invariants |
| Integration (API) | 85 | Vitest + `fastify.inject()` (~250) | < 90 s | The complete hook chain per endpoint: session → CSRF → reserved fields → validation → PDP → handler → audit |
| Adapter-contract | 12 | `@ual/conformance` (10 × 6 adapters) | < 60 s | The adapter contract, per adapter, standalone-runnable and run live during registration |
| End-to-end | 24 | Playwright 1.49 (~25 specs) | < 6 min | Flagship, RBAC, degraded, registration, keyboard-only, crawl |
| Accessibility | 20 | `@axe-core/playwright` — every route × every role × 5 states | < 5 min | WCAG 2.1 AA / Section 508 gate |
| RBAC negative-path | 11 | Generated from the role matrix + `rbac.negative.spec.ts` | *(in integration budget)* | Zero-trust enforcement, non-enumeration, denial auditing |
| Resilience / degradation | 15 | `resilience.spec.ts` with failure injection | *(in E2E budget)* | Graceful degradation, partial-failure honesty, automatic recovery |

### 8.1 Unit — 9 cases

| TC ID | F | Assertion | FRD source | Stories | Verified by |
|---|---|---|---|---|---|
| `TC-U-001` | F0 | Each synthetic identity resolves to its declared role set and attribute bundle (organization, clearanceTier, assignedRegion, caseAssignments, subjectRef); a multi-role identity resolves to all roles held. | `FR-F00-05` | US-013 | Vitest unit tier |
| `TC-U-002` | F1 | `Principal` is rebuilt from `hub.sessions` on every request; no role, identity, or scope is read from the cookie or request body. | `FR-F01-01`, `FR-F02-01` | US-010 | Vitest unit tier |
| `TC-U-003` | F5 | Normalization: every spoke-native status maps to exactly one `statusCategory`; priority maps onto the three-tier scale; `workItemId` is `{sourceSystem}:{nativeId}`; `overdue` is computed hub-side. | `FR-F05-02`, `FR-F05-07` | US-041 | Vitest unit tier |
| `TC-U-004` | F7 | Architecture conformance: the orchestration engine source contains no reference to `PVQ`, `EAPP`, or any other application identifier — the saga is generic and registry-driven. | `FR-F07b-07` | *—* | Architecture conformance (TechArch §14.8) |
| `TC-U-005` | F9 | Cross-namespace relationships are opaque references resolved by the hub; no join, no foreign key, and no shared schema crosses a namespace boundary. | `FR-F09-01`, `FR-F17-04` | US-080 | Vitest unit + `information_schema` introspection |
| `TC-U-006` | F14 | Stylelint finds zero hard-coded colour, font, or spacing literals across all SCSS and component styles; `packages/theme/_uswds-theme.scss` is the only file containing a colour value. | `FR-F14-01` | US-118 | Stylelint gate (NFR-03) |
| `TC-U-007` | F17 | Referential coherence: every `subjectRef`, `parentCaseRef`, and `answerLocus` in the seed resolves against the owning namespace, including the one intentional seeded orphan. | `FR-F17-04` | US-080 | Seed validator unit tests |
| `TC-U-008` | F17 | Determinism: the same `UAL_SEED_CONSTANT` produces byte-identical seed output; all relative dates derive from `UAL_SEED_REFERENCE_DATE`, never from wall-clock `now`. | `FR-F17-05`, `FR-F19-10` | US-136 | Vitest unit tier |
| `TC-U-009` | F17 | Every spoke response body carries `_synthetic: true` and every record a `syntheticMarker`; name, address, and identifier generators are invalid-by-construction. | `FR-F17-08`, `FR-F17-09` | US-135 | Vitest unit tier |

### 8.2 Integration (API — full hook chain via `fastify.inject()`) — 85 cases

| TC ID | F | Assertion | FRD source | Stories | Verified by |
|---|---|---|---|---|---|
| `TC-I-001` | F0 | A failed sign-in returns a byte-identical non-disclosing error for a valid and an invented identity; nothing in the response reveals whether the account exists. | `FR-F00-02`, `FR-F00-04` | US-005 | Vitest + `fastify.inject()` |
| `TC-I-002` | F0 | Idle timeout fires the SCR-06 warning with a live countdown; `POST /api/session/extend` extends in place; entered form data is not discarded. | `FR-F00-06` | US-006 | Vitest + `fastify.inject()` |
| `TC-I-003` | F0 | `POST /api/auth/logout` terminates the hub session and invalidates every `hub.spoke_contexts` row; a subsequent adapter call with the old context is rejected. | `FR-F00-07`, `FR-F01-04` | US-007 | Vitest + `fastify.inject()` |
| `TC-I-004` | F1 | A deep link to a work-item route survives one sign-in and lands on the requested item via `returnTo`, with no second credential prompt. | `FR-F01-03`, `FR-F06-01` | US-011 | Vitest + `fastify.inject()` |
| `TC-I-005` | F1 | `GET /api/session` returns identity, `activeRole`, and remaining session time; the header renders them and the values match the server. | `FR-F01-05`, `FR-F03-05` | US-012 | Vitest + `fastify.inject()` |
| `TC-I-006` | F1 | `POST /api/session/active-role` switches the active role within the held role set without re-authentication, is audited, and re-computes entitlements. | `FR-F00-05`, `FR-F03-05` | US-013 | Vitest + `fastify.inject()` |
| `TC-I-007` | F1 | One correlation ID generated at the hub edge appears on every adapter call header, every audit row, every integration-issue row, and the error envelope for that action. | `FR-F01-06`, `FR-F13-04` | US-014 | Vitest + `fastify.inject()` |
| `TC-I-008` | F2 | `GET /api/entitlements` returns the server-computed navigation and permission set; the rendered nav and controls are a strict subset of it. | `FR-F02-06`, `FR-F03-04` | US-015 | Vitest + `fastify.inject()` |
| `TC-I-009` | F2 | Resource-level authorization: fetching work item X verifies this principal's entitlement to X specifically, not merely to the route. | `FR-F02-01`, `FR-F02-03` | US-016 | Vitest + `fastify.inject()` |
| `TC-I-010` | F2 | The same work item returns different `ActionDescriptor[]` sets for an investigator and an adjudicator; each action is re-authorized at execution time. | `FR-F02-05`, `FR-F06-03` | US-017 | Vitest + `fastify.inject()` |
| `TC-I-011` | F2 | Every denial returns the same envelope shape, code, and copy; response bodies for a forbidden ID and a fabricated ID differ only in `correlationId`, and timings are normalized to the 120 ms floor. | `FR-F02-07`, `FR-F10-03` | US-024 | `rbac.negative.spec.ts` |
| `TC-I-012` | F2 | SCR-26/27 expose each identity's roles, attributes, and recent activity to administrators; the role matrix and attribute rules are inspectable rather than inferred. | `FR-F02-08`, `FR-F02-02` | US-025 | Vitest + `fastify.inject()` |
| `TC-I-013` | F3 | Primary navigation is generated per role from entitlements; the four nav sets are distinct and every item maps to a row in the SCR-01…38 inventory. | `FR-F03-04`, `FR-F03-02` | US-028 | Vitest + `fastify.inject()` |
| `TC-I-014` | F3 | `GET /api/search` is scoped server-side to work items the principal may see; a search for another subject's identifier returns zero rows rather than a denial. | `FR-F03-07`, `FR-F02-04` | US-030 | Vitest + `fastify.inject()` |
| `TC-I-015` | F3 | A fabricated URL renders SCR-31 inside the shell with working exits to dashboard and queue — never a framework 404 page and never a stack trace. | `FR-F03-08`, `FR-F16-08` | US-031 | Vitest + `fastify.inject()` |
| `TC-I-016` | F4 | `GET /api/dashboard` returns role-appropriate widget data with per-source status; a slow source degrades one widget and the remaining widgets render. | `FR-F04-01`, `FR-F16-06` | US-033, US-037 | Vitest + `fastify.inject()` |
| `TC-I-017` | F5 | `GET /api/work-items` fans out concurrently over the registry rows visible to the active role and returns correctly attributed items from at least four of five spokes. | `FR-F05-02` | US-040 | Vitest + `fastify.inject()` |
| `TC-I-018` | F5 | Filtering by source system, type, status, priority, assignee, and due-date range; active filters render as removable chips with a working clear-all. | `FR-F05-03` | US-042 | Vitest + `fastify.inject()` |
| `TC-I-019` | F5 | Sorting on due date, priority, status, source, and last activity; pagination with an announced result count; sortable headers announce sort state. | `FR-F05-04`, `FR-F14-04`, `FR-F10-04` | US-043, US-045 | Vitest + `fastify.inject()` |
| `TC-I-020` | F5 | Search across title, subject reference, and identifier is applied server-side within the principal's scope. | `FR-F05-06` | US-044 | Vitest + `fastify.inject()` |
| `TC-I-021` | F5 | Each role opens the queue on its saved default view (investigator: assigned to me, due date ascending). | `FR-F05-08` | US-046 | Vitest + `fastify.inject()` |
| `TC-I-022` | F5 | A genuine zero-result queue renders the designed empty state with guidance; an unreachable source renders the degraded state instead — the two are never the same screen. | `FR-F05-01`, `FR-F16-07` | US-049, US-129 | Vitest + `fastify.inject()` |
| `TC-I-023` | F6 | `GET /api/work-items/{id}` returns full detail with source attribution and subject context; eApp case detail renders its questionnaire sections. | `FR-F06-01`, `FR-F06-02`, `FR-F06-08` | US-050 | Vitest + `fastify.inject()` |
| `TC-I-024` | F6 | Only server-computed actions render; a disabled action carries a plain-language `disabledReason`; an action targeting a DOWN system is pre-emptively disabled. | `FR-F06-03`, `FR-F16-04` | US-051, US-126 | Vitest + `fastify.inject()` |
| `TC-I-025` | F6 | Action forms validate against the same TypeBox schema client- and server-side; invalid submission returns field errors and the typed narrative is preserved verbatim. | `FR-F06-04`, `FR-F14-03` | US-052 | Vitest + `fastify.inject()` |
| `TC-I-026` | F6 | The confirmation names exactly what changed and in which system, and the state shown is the spoke's confirmed write — never an optimistic value. | `FR-F06-04`, `FR-F13-01` | US-053 | Vitest + `fastify.inject()` |
| `TC-I-027` | F6 | Authorization denial, validation failure, and source unavailability produce three distinct, recoverable presentations, each carrying a correlation ID. | `FR-F06-07`, `FR-F16-08` | US-054 | Vitest + `fastify.inject()` |
| `TC-I-028` | F6 | `GET /api/work-items/{id}/related` resolves `RelatedRef`s live through the target adapters; the relationship label comes from the spoke's record, not the UI. | `FR-F06-05`, `FR-F07a-01` | US-055, US-060 | Vitest + `fastify.inject()` |
| `TC-I-029` | F6 | `GET /api/work-items/{id}/activity` merges spoke-native history with hub audit records into one chronology showing actor, action, timestamp, and origin system. | `FR-F06-06` | US-056 | Vitest + `fastify.inject()` |
| `TC-I-030` | F7 | The orchestration endpoint authorizes **both** legs — `ISSUE.RESOLVE` on `PVQ:ISS-2207` and `CASE.UPDATE_ISSUE_STATE` on `EAPP:CASE-A-1042` — before any write; a client-supplied parent case reference that does not match the issue's real parent is rejected. | `FR-F07b-01`, `FR-F07a-04` | US-063, US-064 | `flagship.spec.ts` + integration tier |
| `TC-I-031` | F7 | Replaying the orchestration with the same `X-UAL-Idempotency-Key` returns the stored outcome and executes neither leg a second time, at hub and at spoke. | `FR-F07b-01`, `FR-F09-07` | US-064 | Vitest + `fastify.inject()` |
| `TC-I-032` | F7 | Leg-1 (PVQ) failure aborts cleanly: no eApp call is attempted, the response states unambiguously that nothing changed, and a reconciliation row exists. | `FR-F07b-02` | US-064 | Vitest + `fastify.inject()` |
| `TC-I-033` | F7 | SCR-20 shows a per-system results table whose values are a **fresh re-read** from each owning spoke; a failed re-read renders a 'couldn't confirm' row with a working Check-again control rather than being omitted. | `FR-F07b-04` | US-065 | `flagship.spec.ts` |
| `TC-I-034` | F7 | `GET /api/audit/chain/{correlationId}` returns ≥5 records spanning case read, related-item resolution, traversal, issue read, both writes, and completion, with a summary line and before/after summaries. | `FR-F07b-06`, `FR-F13-04` | US-068 | `flagship.spec.ts:chain` |
| `TC-I-035` | F8 | Registry startup validation rejects a duplicate identifier, a retired identifier, a malformed endpoint, and an unresolvable `adapterType`, and the hub exits non-zero with an actionable message. | `FR-F08b-06` | US-075 | Vitest + real Postgres |
| `TC-I-036` | F8 | Per-application role visibility scoping: an application visible only to ADMINISTRATOR never appears in an investigator's navigation, queue fan-out, or search. | `FR-F08b-04` | *—* | Vitest + `fastify.inject()` |
| `TC-I-037` | F8 | Every adapter call emits a structured log carrying the correlation ID, and a failure emits exactly one `hub.integration_issues` row linked to the corresponding audit record. | `FR-F08b-05`, `FR-F16-09` | US-073, US-088 | Vitest + real Postgres |
| `TC-I-038` | F9 | Isolation: 42 cross-schema read attempts (every service role × every foreign schema) raise `42501`, and `information_schema` shows zero cross-schema foreign keys. | `FR-F09-01` | US-076 | `isolation.spec.ts` |
| `TC-I-039` | F9 | Each spoke's published port answers directly with a short-lived operator token: `GET {pvq}/issues/ISS-2207` and `GET {eapp}/cases/CASE-A-1042` return the spoke's own state with the hub out of the path. | `FR-F09-08`, `FR-F18-05` | US-077 | `isolation.spec.ts` + `flagship.spec.ts:spokeGet` |
| `TC-I-040` | F9 | Per-spoke domain behaviour: eApp case state transitions, PVQ issue disposition, IEP notices/tasks, PDT tier derivation, IM assignment and leads each behave as specified. | `FR-F09-02`, `FR-F09-03`, `FR-F09-04`, `FR-F09-05`, `FR-F09-06` | US-078 | Vitest + real Postgres, per service |
| `TC-I-041` | F10 | The eleven ordered edge hooks run for every route in every child plugin; a route declared without an `action` string or request/response schema fails the boot-time contract check and the process exits non-zero. | `FR-F10-01` | US-081 | Boot-time contract check + integration tier |
| `TC-I-042` | F10 | Every non-2xx response from every endpoint matches the error envelope: machine code, human message, detail, correlation ID, field errors, retryability — and contains no stack trace, hostname, port, or SQL fragment. | `FR-F10-03` | US-082 | Vitest + `fastify.inject()`, all routes |
| `TC-I-043` | F10 | Every mutating route in the route table produces exactly one audit record of its declared action type, written before the success response is observable. | `FR-F10-05`, `FR-F13-01` | US-083, US-148 | `audit.coverage.spec.ts` |
| `TC-I-044` | F10 | The generated OpenAPI document matches the route declarations field for field; hand-edited documentation cannot drift because none exists. | `FR-F10-06` | US-084 | Architecture conformance (TechArch §14.8) |
| `TC-I-045` | F10 | Every endpoint group in `Y1a` names the screen(s) it serves and every screen in the inventory names the endpoint(s) it consumes; the mapping is complete in both directions. | `FR-F10-02` | *—* | Contract cross-check (generated) |
| `TC-I-046` | F10 | Pagination, filtering, and sorting parameter conventions are identical across every collection endpoint, including the announced total and the partial-source-failure report. | `FR-F10-04` | *—* | Vitest + `fastify.inject()` |
| `TC-I-047` | F10 | Demo-grade rate limiting bounds repeated authentication and orchestration attempts without impeding the scripted demo path. | `FR-F10-07` | *—* | Vitest + `fastify.inject()` |
| `TC-I-048` | F11 | SCR-22 lists every registered application with identifier, adapter type, endpoint, work-item types, actions, enabled state, and registration date, read directly from the registry. | `FR-F11-01` | US-086 | Vitest + `fastify.inject()` |
| `TC-I-049` | F11 | SCR-24 reports per-application status, last successful check, latency, and recent check history from `hub.application_health` / `application_health_checks`. | `FR-F11-02`, `FR-F16-02` | US-087 | Vitest + `fastify.inject()` |
| `TC-I-050` | F11 | An induced adapter failure produces a correctly attributed SCR-25 entry within one health-check interval, filterable, and linked to its audit record by correlation ID. | `FR-F11-03`, `FR-F16-09` | US-088 | `resilience.spec.ts` |
| `TC-I-051` | F11 | SCR-23 shows one application's full configuration, health history, and recent errors in a single view. | `FR-F11-04` | US-089 | Vitest + `fastify.inject()` |
| `TC-I-052` | F11 | `POST /api/admin/applications/{id}/probe` performs a live health check on demand and reports the real result, including failure. | `FR-F11-05` | US-090 | Vitest + `fastify.inject()` |
| `TC-I-053` | F11 | Announcement create/edit/expire with severity, target roles, and effective/expiry dates; an announcement targeted at one role appears on that role's dashboard and no other. | `FR-F11-06`, `FR-F15-04` | US-091 | Vitest + `fastify.inject()` |
| `TC-I-054` | F11 | Every administrator console action is authorized by the PDP and writes an audit record; the administrator is not exempt from either. | `FR-F11-07`, `FR-F13-02` | US-093 | `audit.coverage.spec.ts` |
| `TC-I-055` | F12 | Registration validation: duplicate identifier, retired identifier, unreachable endpoint, and malformed policy values each produce the specified accessible inline error and error-summary entry. | `FR-F12-02` | US-095 | `registration.spec.ts` |
| `TC-I-056` | F12 | `POST /api/admin/applications/test-connection` gates submission: an unreachable or non-conformant candidate cannot be registered. | `FR-F12-03` | US-096 | `registration.spec.ts` |
| `TC-I-057` | F12 | Capability auto-discovery pre-populates work-item types and actions from the candidate's own `describe()` and presents them for confirmation rather than transcription. | `FR-F12-04`, `FR-F08a-02` | US-097 | `registration.spec.ts` |
| `TC-I-058` | F12 | Edit and de-register require confirmation, write audit records naming the administrator and the configuration, and retire the identifier against reuse. | `FR-F12-07` | US-100 | `registration.spec.ts` |
| `TC-I-059` | F12 | `docs/ONBOARDING-A-NEW-APP.md` states everything a new application must implement to be registerable, and the stated list matches what the conformance suite actually enforces. | `FR-F12-08` | *—* | Documentation conformance check |
| `TC-I-060` | F13 | Exactly one audit record per successful mutation; failing the audit store causes the mutation to report failure rather than proceed silently. | `FR-F13-01` | US-101 | `audit.coverage.spec.ts` |
| `TC-I-061` | F13 | The record captures actor identity **and the roles/attributes held at the time of the action**, plus target system, resource, outcome, correlation ID, and a before/after summary. | `FR-F13-02` | US-102 | `audit.coverage.spec.ts` |
| `TC-I-062` | F13 | Coverage beyond mutations: authentication success and failure, authorization denials, registration changes, and adapter failures are all present in the trail. | `FR-F13-02` | US-103 | `audit.coverage.spec.ts` |
| `TC-I-063` | F13 | Append-only: route enumeration finds no PUT/PATCH/DELETE under `/api/audit`; static analysis finds no UPDATE/DELETE against `audit_events`; `UPDATE hub.audit_events` as `hub_service` raises `42501`; the hash chain verifies and fails at the exact altered sequence number, with no gaps across a full run. | `FR-F13-03` | US-104 | `audit.coverage.spec.ts` + DB grant tier |
| `TC-I-064` | F13 | SCR-33 filters by actor, role, action type, target system, resource, outcome, and date range, sorted and paginated. | `FR-F13-05` | US-105 | Vitest + `fastify.inject()` |
| `TC-I-065` | F13 | SCR-34 opens one record in full and follows it into the chain sharing its correlation ID. | `FR-F13-06` | US-106 | Vitest + `fastify.inject()` |
| `TC-I-066` | F13 | `GET /api/audit/export` returns exactly the records shown on screen for the active filter and carries the synthetic-data notice. | `FR-F13-08` | US-108 | Vitest + `fastify.inject()` |
| `TC-I-067` | F15 | Alerts are derived read-only at read time from aggregated spoke data — overdue, newly assigned, newly raised PVQ issue on an owned case, blocked, approaching due date — and no derived alert is persisted. | `FR-F15-01` | US-119 | Vitest + `fastify.inject()` |
| `TC-I-068` | F15 | The header indicator count reconciles with the notifications list, and every alert resolves to the real populated work item that produced it. | `FR-F15-02`, `FR-F15-06` | US-120 | Vitest + `fastify.inject()` + `crawl.spec.ts` |
| `TC-I-069` | F15 | Read/unread state persists per user and per alert; marking an alert read does not remove it from the list. | `FR-F15-03` | US-121 | Vitest + `fastify.inject()` |
| `TC-I-070` | F15 | Announcements render as USWDS site alerts, are dismissible per user and per announcement with dismissal persisted, and respect effective/expiry windows. | `FR-F15-04` | US-122 | Vitest + `fastify.inject()` |
| `TC-I-071` | F16 | The background monitor probes every enabled registry row on schedule, records status/latency/history, advances the circuit state machine, and writes an issue row on each state transition — without blocking or being blocked by a user request. | `FR-F16-01`, `FR-F16-02`, `FR-F16-03` | US-125 | `resilience.spec.ts` |
| `TC-I-072` | F16 | `POST /api/admin/failure-injection` is administrator-only, audited, applies `UNAVAILABLE`/`SLOW`/`ERROR` per spoke, and auto-expires. | `FR-F16-11` | US-131 | `resilience.spec.ts` |
| `TC-I-073` | F17 | Seed volume is calibrated so every filter facet, for every role, returns at least one result on the default date range, and pagination is exercised on the investigator queue, the audit viewer, and the admin inventory. | `FR-F17-01`, `FR-F17-07` | US-133 | Seed validation + integration tier |
| `TC-I-074` | F17 | Persona binding: PER-01 Marcus Vale, PER-02 Dana Okonkwo, PER-03 Renée Ashford (`SUBJ-00622`), PER-04 Priya Raghunathan seed with their declared roles and attributes, including the multi-role identity. | `FR-F17-02` | *—* | Seed validation (`FR-F17-02` AC-3) |
| `TC-I-075` | F17 | Flagship preconditions P1–P8 are all present at baseline, including `ISS-2207` `OPEN`, `CASE-A-1042` `outstandingIssueCount=1`, the PDT and IM relationships, the spare second open issue, and ~120 pre-seeded audit events. | `FR-F17-03`, `FR-F17-10` | US-137 | Seed validation (`FR-F17-10`) |
| `TC-I-076` | F17 | Edge states are reachable without breaking anything: overdue items, blocked cases, a zero-item applicant, an above-tier case, and the one intentional orphan reference. | `FR-F17-06` | US-134 | Integration tier |
| `TC-I-077` | F17 | Seed validation fails startup with a specific, actionable message when any flagship precondition is missing or any persona binding is broken. | `FR-F17-10` | US-137 | Seed validator (startup gate) |
| `TC-I-078` | F18 | Each service starts and stops independently; `docker compose stop ual-im` is a real outage and the hub starts even when every spoke is down. | `FR-F18-02` | US-143, US-079 | `resilience.spec.ts` + deployment dry run |
| `TC-I-079` | F18 | Pre-flight checks report prerequisite versions and port availability with actionable messages; a port clash is resolvable from `.env` without editing code. | `FR-F18-03` | US-139 | Deployment dry run |
| `TC-I-080` | F18 | SCR-37 lists every running service and its state so a demo operator can confirm readiness at a glance. | `FR-F18-07` | US-142 | Vitest + `fastify.inject()` |
| `TC-I-081` | F18 | Clean shutdown stops all eleven containers with no orphaned processes and no held ports. | `FR-F18-08` | US-144 | Deployment dry run |
| `TC-I-082` | F18 | The documented troubleshooting section covers the three most likely demo-day failures and each documented remedy actually works. | `FR-F18-09` | US-144 | Deployment dry run |
| `TC-I-083` | F19 | The audit coverage and immutability suite runs in CI and a new mutating endpoint without an audit assertion fails the build. | `FR-F19-05` | US-148 | `audit.coverage.spec.ts` |
| `TC-I-084` | F19 | The reviewer-readable summary maps every success metric to a named test with a current status and maps every FRD requirement ID to its verifying test(s), flagging any requirement with no test. | `FR-F19-09` | US-151 | `FR-F19-09` CI artifact |
| `TC-I-085` | F19 | The whole suite produces identical results across three consecutive runs and no test depends on the current wall-clock date; flaky tests are quarantined, never retried into passing. | `FR-F19-10` | US-151 | CI determinism gate |

### 8.3 Adapter-contract / conformance — 12 cases

| TC ID | F | Assertion | FRD source | Stories | Verified by |
|---|---|---|---|---|---|
| `TC-AC-001` | F1 | Every spoke verifies the Ed25519 principal assertion (`aud === self`, `exp > now`) and rejects a forged or expired assertion with `401 PRINCIPAL_REJECTED`; `/health` and `/describe` require no assertion. | `FR-F01-02`, `FR-F09-07` | US-010 | `@ual/conformance` + `@ual/spoke-kit` tests |
| `TC-AC-002` | F8 | Conformance assertion 1: operations 1–7 are present on every adapter, and optional operations are present **iff** declared in `describe()`. | `FR-F08a-01`, `FR-F08a-08` | *—* | `@ual/conformance` |
| `TC-AC-003` | F8 | Conformance assertion 2: `describe()` validates; **every** native status is mapped; every `requiredPermission` exists in the role matrix; an application declaring fewer actions degrades its UI affordances rather than erroring. | `FR-F08a-02`, `FR-F08a-07` | US-072, US-097 | `@ual/conformance` |
| `TC-AC-004` | F8 | Conformance assertions 3–4: every returned `WorkItem` satisfies the normalized shape; a scoped list for subject A returns zero rows for subject B; a scoped get for a foreign resource returns `NOT_FOUND`/`FORBIDDEN`, never data. | `FR-F08a-03`, `FR-F02-04` | *—* | `@ual/conformance` |
| `TC-AC-005` | F8 | `performAction`, `getWorkItemSummary`, and `getActivityHistory` behave to contract, and `stateVersion` changes after mutation and is stable otherwise. | `FR-F08a-04` | *—* | `@ual/conformance` |
| `TC-AC-006` | F8 | Deadline honouring: a call with a 100 ms deadline aborts within 150 ms; a transient read failure retries per policy; a `performAction` timeout is **never** retried. | `FR-F08a-05` | US-073 | `@ual/conformance` |
| `TC-AC-007` | F8 | Error taxonomy: induced connection refusal, timeout, 4xx, 5xx, and malformed response each produce the correct `AdapterError` class, hub status, code, and user-facing message. | `FR-F08a-06`, `FR-F10-03` | US-082 | `@ual/conformance` |
| `TC-AC-008` | F8 | Circuit behaviour: `circuitFailureThreshold` consecutive failures open the circuit; data calls then fail fast without touching the spoke; health probing continues; a successful probe closes it. | `FR-F08a-05`, `FR-F16-03` | US-073 | `@ual/conformance` |
| `TC-AC-009` | F8 | No cross-spoke access: outbound calls target only this application's base endpoint, and zero spoke-to-spoke traffic occurs across the whole test run. | `FR-F08a-08`, `FR-F09-01` | US-076, US-080 | `@ual/conformance` + `isolation.spec.ts` |
| `TC-AC-010` | F8 | The conformance suite is runnable standalone against any endpoint (`./run.sh conformance --adapter=CVS --endpoint=…`), and assertions 1, 2, and 6 run **live during registration** so a non-conformant application cannot be registered. | `FR-F08a-08`, `FR-F19-03` | US-074, US-147 | `@ual/conformance` |
| `TC-AC-011` | F9 | Common spoke requirements verified identically on all six services: assertion verification, mandatory `X-UAL-Scope` on reads, deadline abort, idempotency records, `stateVersion` recompute, own activity row per mutation, honest `/health`, `/describe`, injection control, correlation echo, synthetic markers, and closed error set. | `FR-F09-07` | *—* | `@ual/conformance` + `@ual/spoke-kit` tests |
| `TC-AC-012` | F19 | The full conformance suite runs in CI against all six adapters (10 assertions × 6) plus the cross-adapter behavioural assertions. | `FR-F19-03` | US-147 | `@ual/conformance` in CI |

### 8.4 End-to-end (browser) — 24 cases

| TC ID | F | Assertion | FRD source | Stories | Verified by |
|---|---|---|---|---|---|
| `TC-E-001` | F0 | CAC/PIV: method selection on SCR-01, synthetic certificate picker on SCR-02, selection establishes a session, and one `AUTH_SUCCESS` record is written. | `FR-F00-01`, `FR-F00-02` | US-001, US-002 | `auth` E2E (Playwright) |
| `TC-E-002` | F0 | ECA: a distinct external-CA path with its own synthetic identity set establishes a session — demonstrably a second identity provider, not one provider with a skin. | `FR-F00-03` | US-003 | `auth` E2E (Playwright) |
| `TC-E-003` | F0 | Generic MFA: username entry then the deterministic demo one-time code (`UAL_DEMO_OTP`) establishes a session on a phone-width viewport. | `FR-F00-04` | US-004 | `auth` E2E (Playwright) |
| `TC-E-004` | F1 | A scripted traversal touching all five spokes in one session produces **exactly one** authentication event in the audit log. | `FR-F01-03`, `FR-F07a-06` | US-009 | `flagship.spec.ts:authEventCount` |
| `TC-E-005` | F3 | Breadcrumbs express cross-application context (`Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207`) with source badges, and each segment retraces correctly. | `FR-F03-06` | US-029 | `flagship.spec.ts` + crawl |
| `TC-E-006` | F3 | Link-and-control integrity crawl: every navigation item and every route in the SCR inventory, for all four roles — HTTP 200 or a designed error screen, non-empty `<main>`, unique `<title>`, exactly one `<h1>`, and every interactive control has a handler, a destination, or a documented disabled reason. | `FR-F03-02`, `FR-F19-08` | US-032, US-150 | `crawl.spec.ts` |
| `TC-E-007` | F4 | Signing in as each of the four roles produces a substantively different, fully populated dashboard — different widgets, counts, and navigation — with no empty or placeholder widget. | `FR-F04-02`, `FR-F04-03`, `FR-F04-04`, `FR-F04-05` | US-033, US-034, US-035, US-036 | Dashboard E2E (Playwright) |
| `TC-E-008` | F4 | Every dashboard widget, count, and alert links to a real populated destination, and the correct next item to work is reachable in two clicks or fewer for investigator and adjudicator. | `FR-F04-06` | US-039 | `crawl.spec.ts` + dashboard E2E |
| `TC-E-009` | F5 | Returning from a work item restores the queue's prior filters, sort, and page exactly. | `FR-F05-09`, `FR-F06-12` | US-047 | `flagship.spec.ts` + queue E2E |
| `TC-E-010` | F6 | Each role completes at least one real, persisted action on its own work-item type (PDT designation approval, IEP task response, IM assignment acknowledgement), and the change is visible in both the spoke's data and the audit trail. | `FR-F06-09`, `FR-F06-10`, `FR-F06-11`, `FR-F06-04` | US-057 | Role-action E2E (Playwright) |
| `TC-E-011` | F7 | **FLAGSHIP.** Sign in once as PER-01 via CAC/PIV → work queue default view → `EAPP:CASE-A-1042` → read Section 13A → related-items panel → `PVQ:ISS-2207` → resolve with disposition and narrative → SCR-20 dual-system confirmation reporting `Resolved — Substantiated` and `No outstanding issues`. | `FR-F07a-02`, `FR-F07a-03`, `FR-F07a-04`, `FR-F07b-01`, `FR-F07b-04`, `FR-F07b-05` | US-059, US-060, US-061, US-062, US-063, US-064, US-065, US-067 | `flagship.spec.ts` |
| `TC-E-012` | F7 | **FLAGSHIP continuity.** Exactly one authentication event; zero document requests to any spoke origin; zero login forms after sign-in; zero identifiers typed beyond the narrative text; the shell stays mounted across the traversal with no interstitial, tab, iframe, or redirect. | `FR-F07a-06`, `FR-F01-03` | US-059, US-061, US-069 | `flagship.spec.ts` continuity block |
| `TC-E-013` | F7 | **FLAGSHIP dual-system proof.** `spokeGet('PVQ','/issues/ISS-2207')` returns `RESOLVED_SUBSTANTIATED` with disposition, resolver, and narrative; `spokeGet('EAPP','/cases/CASE-A-1042')` returns `outstandingIssueCount = 0` and `REVIEW_COMPLETE_PENDING_ADJUDICATION` — both with the hub out of the path. | `FR-F07a-05`, `FR-F07b-05`, `FR-F09-08` | US-067 | `flagship.spec.ts:spokeGet × 2` |
| `TC-E-014` | F7 | **FLAGSHIP repeatability.** The flagship suite runs three consecutive times with a reset between each and produces identical results; `ISS-2207` is `OPEN` at the start of every run. | `FR-F19-01`, `FR-F17-11` | US-136, US-140, US-145 | `flagship × 3 with reset` |
| `TC-E-015` | F8 | Registry-driven behaviour: removing an application row removes it cleanly from navigation, queue fan-out, admin inventory, and health monitoring with no code change and no errors; disabling it at runtime does the same without a redeploy. | `FR-F08b-01`, `FR-F08b-02`, `FR-F08b-03` | US-070, US-071 | `registration.spec.ts` + architecture conformance |
| `TC-E-016` | F12 | An administrator registers **CVS** through the five-step SCR-28 wizard in under five minutes with zero code changes and zero restarts, and it appears immediately in inventory, health, role navigation, and the work queue. | `FR-F12-01`, `FR-F12-06` | US-094, US-099 | `registration.spec.ts` |
| `TC-E-017` | F12 | Post-registration propagation reaches an **already-signed-in** investigator's session: CVS work items appear without sign-out, reload, or re-authentication (registry-version poll). | `FR-F12-05` | US-098 | `registration.spec.ts`, two browser contexts |
| `TC-E-018` | F17 | `reset` restores all seven namespaces and the hub to pristine baseline mid-demo, and the flagship path is immediately re-runnable. | `FR-F17-11` | US-136, US-099 | `flagship × 3 with reset` |
| `TC-E-019` | F18 | From a clean checkout on a clean machine, one documented command brings up the database, migrations, seed, six spokes, hub, and UI, and a reviewer reaches a signed-in dashboard in under ten minutes. | `FR-F18-01` | US-138 | Fresh-machine dry run |
| `TC-E-020` | F18 | A reviewer with no prior exposure follows `docs/README.md` — prerequisites, start command, URL, the four demo personas, the reset command — and succeeds unaided. | `FR-F18-04` | US-144 | Fresh-machine dry run |
| `TC-E-021` | F18 | The flagship demo script's numbered steps 1–13 are drivable verbatim, and the expected observable state at each step matches, including the independent spoke verification step. | `FR-F18-05` | US-140 | `flagship.spec.ts` (mirrors the script) |
| `TC-E-022` | F18 | All five secondary demo scripts are drivable: degraded-system behaviour (Segment 2), sixth-application registration (3), role-level zero trust (4), resource-level zero trust via `curl` (5b), and audit-chain review (6). | `FR-F18-06` | US-141 | Secondary demo E2E (Playwright) + `curl` fixtures |
| `TC-E-023` | F19 | The flagship end-to-end suite exists, gates the build, and fails on regression to any asserted property, including the partial-failure variant. | `FR-F19-01` | US-145 | `flagship.spec.ts` |
| `TC-E-024` | F19 | The crawl additionally scans user-facing copy on every route for prohibited content — stack-trace patterns, exception class names, hostnames, IPs, ports, SQL fragments, raw HTTP reason phrases, and the prohibited authentication verbs — and asserts every `entitlements.navigation[].href` resolves. | `FR-F19-08` | US-150 | `crawl.spec.ts` |

### 8.5 Accessibility — 20 cases

| TC ID | F | Assertion | FRD source | Stories | Verified by |
|---|---|---|---|---|---|
| `TC-A-001` | F0 | Every authentication screen states that authentication is simulated, and the prohibited verbs ('verified', 'validated', 'authenticated against', 'trusted certificate') appear nowhere in user-facing copy. | `FR-F00-08` | US-008 | `crawl.spec.ts` copy scan |
| `TC-A-002` | F3 | The shell provides landmark regions, a correct single-`<h1>` heading hierarchy, current-page indication, and a keyboard-operable primary navigation on every route. | `FR-F03-01`, `FR-F14-05` | US-026 | `axe.spec.ts` + keyboard smoke |
| `TC-A-003` | F3 | The demo banner's verbatim copy is present in the accessible DOM on every route at 320px, 768px, and 1280px — including with a modal open and an `EMERGENCY` announcement active — with no close control and no `display:none`, `visibility:hidden`, or zero-height computed style; the ≤ `units(15)` chrome budget holds at 320×568 and SCR-11's status sentence stays above the fold. | `FR-F03-03`, `FR-F15-05`, `FR-F19-08` | US-027, US-123 | `crawl.spec.ts` banner assertion |
| `TC-A-004` | F5 | The work queue is operable with a screen reader: caption, header scope, sortable headers announcing sort state, and announced result counts on filter, search, and pagination change. | `FR-F14-04` | US-110 | `axe.spec.ts` + screen-reader manual pass |
| `TC-A-005` | F7 | **FLAGSHIP keyboard-only.** The whole workflow is driven with Tab/Shift-Tab/Enter/Space/arrows/Escape; focus lands on the new page heading and the `<title>` changes descriptively at every screen boundary; no trap; axe reports zero serious or critical violations on SCR-13, SCR-15, SCR-16, and SCR-20. | `FR-F14-02`, `FR-F07a-06`, `FR-F19-07` | US-069 | `axe.spec.ts` + keyboard smoke + recorded manual pass |
| `TC-A-006` | F11 | Administrator console tables follow the same accessible data-table pattern as F5 — caption, header scope, sortable headers, accessible pagination — so the console is as accessible as the rest of the product. | `FR-F11-07`, `FR-F14-04` | US-092 | `axe.spec.ts` |
| `TC-A-007` | F14 | Every interactive element on every route is reachable and operable by keyboard alone; tab order matches DOM order; modals trap focus, close on Escape, and restore focus to the invoking control; the skip link is present, first focusable, and moves focus to `<main>`. | `FR-F14-02`, `FR-F14-05`, `FR-F19-07` | US-109, US-112 | Keyboard smoke test (Playwright) |
| `TC-A-008` | F14 | Controls carry correct roles and accessible names; source attribution is in the accessible name, not a colour badge alone; asynchronous updates announce through live regions. | `FR-F14-04`, `FR-F14-07` | US-110 | `axe.spec.ts` + manual screen-reader pass |
| `TC-A-009` | F14 | A visible focus indicator with sufficient contrast is present on every focusable control against its own background. | `FR-F14-02`, `FR-F14-06` | US-111 | `axe.spec.ts` + keyboard smoke |
| `TC-A-010` | F14 | Forms: programmatically associated labels, described-by hint text, non-colour required indication, inline errors, and an error summary at the top with focus management and in-page links to the offending fields; submitting the resolution form empty is scanned in its error state. | `FR-F14-03` | US-113 | `axe.spec.ts` (forms-in-error state) |
| `TC-A-011` | F14 | All text and meaningful non-text elements meet WCAG 2.1 AA contrast, and status is never conveyed by colour alone — always paired with text and/or icon, distinguishable in greyscale. | `FR-F14-06` | US-114 | Automated contrast check + greyscale review |
| `TC-A-012` | F14 | Live regions announce queue refresh, action results, and degraded-system warnings without stealing focus; the dual-system confirmation deliberately does take focus. | `FR-F14-07` | US-115 | `axe.spec.ts` + manual screen-reader pass |
| `TC-A-013` | F14 | Usable at 200% zoom and at 320px viewport width with no horizontal scrolling and no loss of function; `prefers-reduced-motion` is respected. | `FR-F14-08` | US-116 | Responsive/zoom audit + `axe.spec.ts` |
| `TC-A-014` | F14 | Timing: the session warning is announced accessibly, extension is keyboard-operable, and no entered data is lost to the timer. | `FR-F14-09`, `FR-F00-06` | US-117 | `axe.spec.ts` (open-modal state) + keyboard smoke |
| `TC-A-015` | F14 | Error, empty, and loading states are themselves accessible: SCR-30/31/32 scanned, empty states announced, and busy states exposed via `aria-busy`/live region rather than silence. | `FR-F14-10` | *—* | `axe.spec.ts` (non-default states) |
| `TC-A-016` | F14 | SCR-36 states the conformance target (Section 508 / WCAG 2.1 AA), known limitations, and the Q-01 style-guide assumption, and is reachable by anonymous users. | `FR-F14-11`, `FR-F14-01` | US-118 | `axe.spec.ts` + `crawl.spec.ts` |
| `TC-A-017` | F14 | **The gate.** axe-core runs against every route × every role × five states (default, error, empty, degraded, loading, open modal, form-in-error) and the build fails on any serious or critical violation; moderate and minor are reported with owners and due dates. | `FR-F14-12`, `FR-F19-06` | US-149 | `axe.spec.ts` |
| `TC-A-018` | F15 | No announcement, at any severity and with any modal open, obscures or displaces the demo banner. | `FR-F15-05` | US-123 | `crawl.spec.ts` banner assertion |
| `TC-A-019` | F19 | The accessibility scan runs on every pull request, not only on main, and accessibility review is a merge gate. | `FR-F19-06` | US-149 | CI configuration check |
| `TC-A-020` | F19 | The keyboard smoke suite runs per role across every route in CI and reports zero unreachable primary controls and zero traps. | `FR-F19-07` | US-149 | Keyboard smoke test in CI |

### 8.6 RBAC negative-path — 11 cases

| TC ID | F | Assertion | FRD source | Stories | Verified by |
|---|---|---|---|---|---|
| `TC-RN-001` | F2 | An authenticated applicant requesting **another subject's** work item by ID is denied server-side, and the response is byte-identical (apart from `correlationId`) to the response for a fabricated ID; the denial is audited with its `policyRuleId`. | `FR-F02-04`, `FR-F02-07`, `FR-F19-02` | US-018 | `rbac.negative.spec.ts` |
| `TC-RN-002` | F2 | An investigator posting an adjudicator-only action — and any action absent from the server-computed list — receives 403; a stale `stateVersion` receives 409. | `FR-F02-02`, `FR-F02-05` | US-019 | `rbac.negative.spec.ts` |
| `TC-RN-003` | F2 | Investigator, adjudicator, and applicant calls to every administrator endpoint and console route are refused server-side and audited. | `FR-F02-02`, `FR-F02-07`, `FR-F11-07` | US-020 | `rbac.matrix.spec.ts` |
| `TC-RN-004` | F2 | An investigator requesting a case outside their unit or assigned region is refused with `ATTR-INV-01` recorded in the audit record; the same case is absent from their queue fan-out. | `FR-F02-03`, `FR-F05-03` | US-021 | `rbac.negative.spec.ts` |
| `TC-RN-005` | F2 | A `T3` investigator requesting a `T5` case is refused with `ATTR-INV-03` recorded in the audit record. | `FR-F02-03`, `FR-F17-06` | US-022 | `rbac.negative.spec.ts` |
| `TC-RN-006` | F2 | An administrator requesting any mission work item is refused — administrators operate the platform, not the caseload — and no administrator path can mutate audit. | `FR-F02-02`, `FR-F11-07`, `FR-F13-03` | US-023 | `rbac.negative.spec.ts` |
| `TC-RN-007` | F2 | Any request supplying `role`, `activeRole`, or `principalId` in body or query is rejected with 400 by the reserved-field hook and has zero privilege effect. | `FR-F10-01`, `FR-F19-02` | US-010, US-081 | `rbac.negative.spec.ts` |
| `TC-RN-008` | F2 | A mutating request without a CSRF token is refused with 403 and audited; an edited session cookie yields 401 and never an escalation. | `FR-F10-01`, `FR-F19-02` | US-081 | `rbac.negative.spec.ts` |
| `TC-RN-009` | F10 | **Coverage:** 100% of endpoints in the route table have at least one unauthorized-access negative test; a new endpoint without one fails the build. | `FR-F19-02`, `FR-F10-02` | US-085, US-146 | `rbac.negative.spec.ts` (route-table generated) |
| `TC-RN-010` | F13 | A mission user's audit query returns zero records authored by another actor; role-scoped visibility holds on viewer, chain view, and export. | `FR-F13-07` | US-107 | `rbac.negative.spec.ts` |
| `TC-RN-011` | F19 | The RBAC matrix suite is **generated from the role matrix** — every role × every action, permitted succeeding and non-permitted returning 403 with an `AUTHZ_DENIED` record — so adding a permission without a test is impossible. | `FR-F19-02` | US-146 | `rbac.matrix.spec.ts` |

### 8.7 Resilience / degradation — 15 cases

| TC ID | F | Assertion | FRD source | Stories | Verified by |
|---|---|---|---|---|---|
| `TC-R-001` | F4 | A slow or unavailable source degrades one dashboard widget, not the page; the widget names the affected application and what is missing, and clears automatically on recovery. | `FR-F04-01`, `FR-F16-05`, `FR-F16-12` | US-037, US-038 | `resilience.spec.ts` |
| `TC-R-002` | F5 | With IM forced offline, the queue renders the other four sources fully and actionably plus an explicit named, quantified notice ('Investigation Management is unavailable — 12 items are not shown'), and no error page appears anywhere. | `FR-F05-05`, `FR-F16-05` | US-048 | `resilience.spec.ts` |
| `TC-R-003` | F6 | A work-item detail screen whose owning spoke is unavailable degrades cleanly: named warning, actions pre-disabled with reason, working exits — never a blank page. | `FR-F06-01`, `FR-F16-08`, `FR-F16-05` | US-058 | `resilience.spec.ts` |
| `TC-R-004` | F7 | **FLAGSHIP partial-failure variant.** With eApp injected `UNAVAILABLE` after the PVQ leg commits: HTTP 207, `overallOutcome = PARTIALLY_COMPLETED`, the word 'success' absent from response and rendered page, both per-system outcomes present, a working 'Retry eApp update' control, the PVQ disposition **not** reversed, automatic convergence after `clearInjection`, and exactly one `ORCHESTRATION_INCOMPLETE` integration issue when retries exhaust. | `FR-F07b-03`, `FR-F11-03` | US-066 | `flagship.spec.ts` partial-failure variant |
| `TC-R-005` | F9 | Stopping any single spoke process leaves the hub and the remaining five fully functional with a visible degraded warning; restarting restores it. | `FR-F09-01`, `FR-F18-02` | US-079 | `resilience.spec.ts` (one process-stop test per spoke) |
| `TC-R-006` | F15 | An empty alerts panel means 'nothing needs you'; when the alert rules could not be computed, a distinct state says so rather than implying all is well. | `FR-F15-01`, `FR-F16-07` | US-124 | `resilience.spec.ts` |
| `TC-R-007` | F16 | An action targeting an unavailable spoke is pre-emptively disabled with an explanatory message, and posting it anyway is refused server-side rather than failing mid-submission. | `FR-F16-04` | US-126 | `resilience.spec.ts` |
| `TC-R-008` | F16 | Every surface showing incomplete data carries a degraded warning naming the affected application and quantifying the gap. | `FR-F16-05` | US-127 | `resilience.spec.ts` |
| `TC-R-009` | F16 | With a `SLOW` injection, loading states render at widget and section granularity with accessible busy announcements and the page fills in rather than blanking. | `FR-F16-06` | US-128 | `resilience.spec.ts` + `axe.spec.ts` (loading state) |
| `TC-R-010` | F16 | A designed empty state and a degraded state are visually and non-visually distinguishable on every list, table, and widget. | `FR-F16-07` | US-129 | `resilience.spec.ts` |
| `TC-R-011` | F16 | An injected client-side exception renders SCR-32 inside the shell with working exits and a correlation ID — never a blank page and never a stack trace. | `FR-F16-08`, `FR-F16-10` | US-130 | `resilience.spec.ts` |
| `TC-R-012` | F16 | Restoring a spoke clears the warning and restores data within 30 seconds with no reload and no re-authentication. | `FR-F16-12` | US-132 | `resilience.spec.ts` |
| `TC-R-013` | F16 | Fault-injection crawl: every route for every role with one spoke down — HTTP 200 or a designed error screen, non-empty `<main>`, demo banner present, zero uncaught client errors. | `FR-F19-04` | US-130, US-048 | `resilience.spec.ts` + `crawl.spec.ts` |
| `TC-R-014` | F16 | All sources down: the queue returns 200 with the all-unavailable empty state, never a 500. | `FR-F19-04`, `FR-F16-07` | US-129 | `resilience.spec.ts` |
| `TC-R-015` | F19 | The resilience suite covers all five single-spoke outage scenarios plus recovery per spoke, with zero error pages, and runs in CI using failure injection so suites stay parallelizable. | `FR-F19-04` | US-147 | `resilience.spec.ts` |
---

## 9. Non-Functional Requirement Traceability

Each `NFR` traced through three columns that matter separately: **where it is specified** as behaviour a builder can implement, **where it is implemented** architecturally, and **what verifies it**. An NFR with a specification but no verification is a promise; an NFR with verification but no specification is a test looking for a requirement. Both conditions are called out.

| NFR | Category | Specified in (FRD) | Implemented in (TechArch) | Verified by (TC) | Metric |
|---|---|---|---|---|---|
| `NFR-01` | Accessibility — Section 508 / WCAG 2.1 AA, zero serious or critical | `FR-F14-01`…`FR-F14-12`, `FR-F19-06` | §12.4 accessibility architecture; §12.3 USWDS integration; §2.3 frontend stack | **TC-A-017** *(the gate)*, TC-A-019, TC-A-007, TC-A-005, TC-A-015 + documented manual keyboard and screen-reader pass | `SM-07` |
| `NFR-02` | Accessibility — never colour alone; keyboard-operable with visible focus | `FR-F14-02`, `FR-F14-06` | §12.4; §12.3 token-only theming | TC-A-009, TC-A-011, TC-A-007 | `SM-09` |
| `NFR-03` | Design system — 100% USWDS v3, zero visual literals, tokens only | `FR-F14-01`, cited in `FR-F08b`, `Y0a` | §12.3; §2.3; `stylelint.config.cjs` at repo root; `packages/theme/_uswds-theme.scss` as the only file with a colour value — **ADR-008** | **TC-U-006** *(Stylelint gate)*, TC-A-016 | — |
| `NFR-04` | Zero trust — every request authorised server-side at resource level | `FR-F02-01`, `FR-F02-03`, `FR-F02-04`, `FR-F10-01`, `FR-F19-02` | §8.3 PDP; §8.4 data-layer scoping; §1.3 choke point 1 — pipeline hook 7; §1.2 PDP + scoped spoke-query wrapper — **ADR-016** | **TC-I-041** *(boot-time contract check)*, TC-I-009, **TC-RN-009** *(100% endpoint coverage)*, TC-RN-011, TC-RN-001 | `SM-18` |
| `NFR-05` | Zero trust — client-side hiding is presentation only | `FR-F02-05`, `FR-F02-06` | §8.5; §12.7 the frontend's security posture; §1.5 "the client renders what the server says it may see" | TC-I-008, TC-I-010, TC-RN-002, TC-RN-007 | `SM-18` |
| `NFR-06` | Auditability — audit record written before the success response | `FR-F13-01`, `FR-F10-05` | §9.1 three layers of enforcement; §9.2 the interceptor at pipeline hook 9 (`onSend`, mutations) | **TC-I-043**, TC-I-060, TC-I-026 | `SM-19` |
| `NFR-07` | Auditability — append-only, sequence-numbered, hash-chained | `FR-F13-03`, `FR-F19-05` | §9.3 record structure and hash chain; §9.7 integrity verification; §3.8 final grants — *where immutability actually lives* — **ADR-016** | **TC-I-063** *(routes + static analysis + DB grant + chain + sequence)*, TC-I-083, TC-RN-006 | — |
| `NFR-08` | Data integrity — no spoke reads another spoke's store | `FR-F09-01`, `FR-F08a-01`, `FR-F17-04`, `Y0a`, `Y0b` | §3.1 schema-per-service, role-per-service; §4.1, §4.2, §4.9 isolation verification checklist — **ADR-004** | **TC-I-038** *(42 cross-schema probes raise `42501`)*, TC-U-005, TC-AC-009 | `SM-13` |
| `NFR-09` | Resilience — single-spoke failure never blanks, throws, or takes the layer down | `FR-F05-05`, `FR-F16-08`, `FR-F16-10`, `FR-F19-04` | §10.3 partial-failure aggregation; §10.4 degraded-mode UX contract; §12.5 uniform state pattern — **ADR-007** | TC-R-002, TC-R-011, **TC-R-013** *(fault-injection crawl)*, TC-R-014, TC-R-005 | `SM-15`, `SM-16` |
| `NFR-10` | Resilience — degraded state always visible and specific: app named, gap quantified | `FR-F16-05`, `FR-F04-01`, `FR-F05-05` | §10.4 | **TC-R-008**, TC-R-002, TC-R-001, TC-R-003 | `SM-15` |
| `NFR-11` | Extensibility — registering a sixth application is configuration only | `FR-F08b-02`, `FR-F08b-03`, `FR-F12-01`, `FR-F12-05`, `Y3` | §17.1–17.6 the complete onboarding path and where the cost actually is; §5.4 registry record; §3.5 registry DDL — **ADR-001** | **TC-E-016**, **TC-E-017**, TC-E-015, TC-I-057 | `SM-11`, `SM-12` |
| `NFR-12` | Privacy — no real PII or data; obviously synthetic | `FR-F17-08`, `FR-F17-09`, `Y3` | §13.7 obviously synthetic content; §4.1 per-record markers | **TC-U-009**, TC-I-073, TC-I-074 | — |
| `NFR-13` | Privacy — non-dismissible demo banner, verbatim in the accessible DOM on every route | `FR-F03-03`, `FR-F15-05`, `FR-F19-08` | **§8.9 the demo banner as an architectural invariant**; §1.5 shell layer; §12.6 rendering strategy — server-rendered so there is no client state path to hide it | **TC-A-003** *(3 viewports × modal × EMERGENCY announcement, evaluating accessible text)*, TC-A-018, TC-E-006 | `SM-10` |
| `NFR-14` | Usability — every navigation item resolves; zero dead links or placeholders | `FR-F03-02`, `FR-F19-08` | §12.1 routing — one segment per `SCR-nn`, "invent a route not in the screen inventory" prohibited; §1.5 | **TC-E-006** *(crawl, 4 roles × 38 routes)*, TC-E-024, TC-E-008 | `SM-05`, `SM-06` |
| `NFR-15` | Observability — correlation ID propagated into audit and error logs | `FR-F01-06`, `FR-F10-03` | §1.6 cross-cutting concerns — pipeline hook 1; §9.5 correlated chains; §10.7 integration issue recording | **TC-I-007**, TC-I-042, TC-I-034, TC-I-037 | `SM-20` |
| `NFR-16` | Responsiveness — usable from 320px and at 200% zoom | `FR-F03-03`, `FR-F14-08` | §12.3; §12.4 | **TC-A-013**, TC-A-003 | `SM-25` |
| `NFR-17` | Performance (demo-grade) — dashboard and queue under 2 s; a slow spoke bounded | `FR-F04-01`, `FR-F07a-02`, `FR-F08a-05`, `FR-F17-01` | §10.2 timeout, retry, circuit policy; §10.3 aggregation within budget | **TC-AC-006** *(deadline honoured within 150 ms)*, TC-R-009, TC-I-016 | — |
| `NFR-18` | Deliverability — clean checkout to running seeded app via one documented command | `FR-F18-01`, `FR-F18-03` | §15.1 the single command; §15.2 `compose.yaml`; §0.5 topology and port map — **ADR-002** | **TC-E-019**, TC-I-079, TC-E-020, TC-I-081 | `SM-21` |
| `NFR-19` | Maintainability — a new work-item type or action is adapter-level only | `FR-F02-05`, `FR-F07b-07`, `FR-F08a-07`, `FR-F08b-01` | §5.5 capability negotiation; §17.5 a seventh application with a different backend; §17.6 where the onboarding cost actually is; §11.6 the engine is generic | TC-AC-003, **TC-U-004**, TC-I-036 | — |
| `NFR-20` | Security posture — sessions expire with warning; logout terminates all context; failed auth discloses nothing | **⚠ Not cited by ID in any downstream document** — functionally specified by `FR-F00-02`, `FR-F00-06`, `FR-F00-07`, `FR-F01-04` | §8.1 three simulated IdPs; §8.2 session and SSO propagation | TC-I-001, TC-I-002, TC-I-003, TC-A-014 | — |

**Summary.** 19 of 20 NFRs are specified by ID in at least one FRD requirement, implemented in at least one named TechArch section, and verified by at least one test case. `NFR-20` is the exception and is carried as `RTM-GAP-06`: its behaviour is fully specified and fully tested, but no downstream document cites the identifier, so the NFR would not appear in a mechanically generated coverage report.

### 9.1 The four NFR clusters the Innovation Call will be judged on

| Cluster | NFRs | Requirements | Architecture | Verification | Live demonstration |
|---|---|---|---|---|---|
| **Accessibility** (Section 508 / WCAG 2.1 AA) | `NFR-01`, `NFR-02`, `NFR-03`, `NFR-16` | `FR-F14-01…12`, `FR-F19-06`, `FR-F19-07` | §12.3, §12.4, ADR-008, ADR-014 | TC-A-001…TC-A-020 *(20 cases)*; build fails on any serious or critical violation | Keyboard-only flagship pass, Segment 1 |
| **Zero-trust authorisation** | `NFR-04`, `NFR-05` | `FR-F02-01…08`, `FR-F10-01`, `FR-F19-02` | §8.3–8.7, §1.2, §1.3, ADR-016 | TC-RN-001…TC-RN-011 *(11 cases)* + TC-I-041; 100% of endpoints carry a negative test | Segment 4 *(role-level)*, Segment 5b *(resource-level, live `curl`)* |
| **Auditability** | `NFR-06`, `NFR-07`, `NFR-15` | `FR-F13-01…08`, `FR-F10-05`, `FR-F19-05` | §9.1–9.8, §3.8 grants, ADR-016 | TC-I-043, TC-I-060…TC-I-066, TC-I-083, TC-RN-010 | Segment 6 *(one correlation ID resolving a whole cross-system action)* |
| **Graceful degradation** | `NFR-09`, `NFR-10` | `FR-F16-01…12`, `FR-F05-05`, `FR-F19-04` | §10.1–10.8, ADR-007 | TC-R-001…TC-R-015 *(15 cases)* | Segment 2 *(induce, observe, restore — two windows side by side)* |
| **Extensibility** | `NFR-11`, `NFR-19` | `FR-F08a-*`, `FR-F08b-*`, `FR-F12-01…08` | §5, §17, ADR-001 | TC-E-015, TC-E-016, TC-E-017, TC-AC-002…TC-AC-012 | Segment 3 *(CVS registered live, under five minutes, zero restarts)* |

---

## 10. Success-Metric Traceability

All 25 metrics are demo-evaluable. Each row names the target, where the metric is specified downstream, the verifying test case, and the journey or demo segment in which a reviewer observes it.

### 10.1 Primary metrics — the demo passes or fails on these

| Metric | Target | Specified in | Verifying test | Observed in |
|---|---|---|---|---|
| `SM-01` | Flagship completes end to end in a single session | `FR-F07a-*`, `FR-F07b-*`, `FR-F19-01` | **TC-E-011**, TC-E-023 | JRN-01.01, Segment 1 |
| `SM-02` | **Exactly zero** re-authentications — one `AUTH_SUCCESS` for the session | `FR-F01-03`, `FR-F07a-06`, `FR-F18-05`, `FR-F19-01` | **TC-E-012**, TC-E-004 | JRN-01.01 stage 1, Segment 1 |
| `SM-03` | Both eApp and PVQ return updated state through their **own** APIs | `FR-F07a-05`, `FR-F07b-05`, `FR-F09-08`, `FR-F18-05` | **TC-E-013**, TC-I-039 | JRN-01.01 stage 9–10, Segment 1 |
| `SM-04` | Zero manual re-entry of subject, case, or issue identifiers | `FR-F03-06`, `FR-F07a-06`, `FR-F18-05` | **TC-E-012** | JRN-01.01, JRN-02.01, Segment 1 |
| `SM-05` | 100% of primary navigation items, all four roles, resolve to a real populated page | `FR-F03-02`, `FR-F19-08` | **TC-E-006**, TC-E-024 | Crawl artifact, R2/R3 gates |
| `SM-06` | **Zero** dead links, placeholder screens, or buttons that do nothing | `FR-F03-02`, `FR-F19-08` | **TC-E-006**, TC-E-008, TC-E-024 | Crawl artifact + manual walkthrough |

### 10.2 Accessibility and compliance

| Metric | Target | Specified in | Verifying test | Observed in |
|---|---|---|---|---|
| `SM-07` | Zero serious or critical violations, all routes, all roles | `FR-F14-12`, `FR-F19-06`, `FR-F07a-06` | **TC-A-017**, TC-A-019, TC-A-005 | CI accessibility report |
| `SM-08` | Flagship completable keyboard-only | `FR-F14-02`, `FR-F19-07` | **TC-A-005**, TC-A-007 | Recorded manual keyboard pass |
| `SM-09` | 100% contrast conformance; status never colour alone | `FR-F14-06` | **TC-A-011** | Automated contrast check + greyscale review |
| `SM-10` | Banner present on 100% of routes incl. login and error pages; zero dismissal paths | `FR-F03-03`, `FR-F15-05`, `FR-F19-08` | **TC-A-003**, TC-A-018 | Per-route crawl assertion |

### 10.3 Architecture and extensibility

| Metric | Target | Specified in | Verifying test | Observed in |
|---|---|---|---|---|
| `SM-11` | Sixth application registered live in under 5 minutes, zero code changes, zero restarts | `FR-F08b-02`, `FR-F12-01`, `FR-F12-06`, `FR-F18-06`, `Y3` | **TC-E-016** | JRN-04.01, Segment 3a |
| `SM-12` | Newly registered app appears in inventory, health, navigation, and queue immediately — including in an open session | `FR-F03-02`, `FR-F04-*`, `FR-F05-*`, `FR-F11-01`, `FR-F12-05` | **TC-E-017** | JRN-04.01 → JRN-01.02, Segment 3 |
| `SM-13` | Zero cross-namespace data access; each spoke independently startable and queryable | `FR-F08a-08`, `FR-F09-01`, `FR-F09-08`, `FR-F19-03`, `Y0b`, `Y1b` | **TC-I-038** *(42 probes)*, TC-AC-009, TC-I-039 | `isolation.spec.ts` + live API calls |
| `SM-14` | Investigator queue carries correctly attributed items from ≥4 of 5 spokes | `FR-F04-*`, `FR-F05-02`, `FR-F05-07` | **TC-I-017**, TC-U-003 | JRN-01.02 stage 1, R2 gate |

### 10.4 Resilience

| Metric | Target | Specified in | Verifying test | Observed in |
|---|---|---|---|---|
| `SM-15` | Forced outage produces a visible, specific degraded warning — never an error page or blank screen | `FR-F05-05`, `FR-F09-01`, `FR-F16-05`, `FR-F18-06`, `FR-F19-04` | **TC-R-002**, TC-R-008, TC-R-013 | JRN-01.03, JRN-04.03, Segment 2a/2b |
| `SM-16` | With one spoke down, remaining sources render fully and remain actionable | `FR-F05-05`, `FR-F16-05`, `FR-F19-04` | **TC-R-002**, TC-R-007 | JRN-01.03, Segment 2 |
| `SM-17` | Restored spoke clears the warning and restores data without reload or re-authentication | `FR-F16-12`, `FR-F08a-05`, `FR-F11-*`, `FR-F19-04` | **TC-R-012**, TC-R-001 | JRN-01.03 stage 7, JRN-04.03 stage 6 |

### 10.5 Security and audit

| Metric | Target | Specified in | Verifying test | Observed in |
|---|---|---|---|---|
| `SM-18` | 100% of endpoints authorise server-side; 100% of direct unauthorised calls denied | `FR-F02-07`, `FR-F10-01`, `FR-F18-06`, `FR-F19-02` | **TC-RN-009**, TC-RN-011, TC-RN-001…008 | Segment 4, Segment 5b *(live `curl`)* |
| `SM-19` | 100% of state-changing actions produce exactly one audit record | `FR-F10-05`, `FR-F13-01`, `FR-F19-05` | **TC-I-043**, TC-I-060 | `audit.coverage.spec.ts` |
| `SM-20` | Whole flagship workflow retrievable as one correlated chain | `FR-F01-06`, `FR-F07b-06`, `FR-F13-04`, `FR-F18-05`, `Y3` | **TC-I-034**, TC-I-007 | SCR-34 audit chain view, Segment 1 and 6 |

### 10.6 Operability

| Metric | Target | Specified in | Verifying test | Observed in |
|---|---|---|---|---|
| `SM-21` | Under 10 minutes from clean checkout to signed-in dashboard | `FR-F18-01`, `FR-F18-04` | **TC-E-019**, TC-E-020 | Fresh-machine dry run |
| `SM-22` | Flagship runnable 3 consecutive times with a reset between, identical result | `FR-F05-*`, `FR-F07a-*`, `FR-F12-*`, `FR-F17-05`, `FR-F17-11`, `FR-F18-*`, `FR-F19-01` | **TC-E-014**, TC-E-018, TC-U-008 | Pre-demo rehearsal |

### 10.7 Role experience

| Metric | Target | Specified in | Verifying test | Observed in |
|---|---|---|---|---|
| `SM-23` | Four roles produce visibly and substantively different dashboards and nav sets — not a relabelled copy | `FR-F02-*`, `FR-F04-02…05` | **TC-E-007**, TC-I-013 | Four sign-ins side by side |
| `SM-24` | Correct next item reachable from the dashboard in ≤ 2 clicks, investigator and adjudicator | `FR-F04-06` | **TC-E-008**, TC-I-068 | JRN-01.02, JRN-02.02, demo script observation |
| `SM-25` | Applicant answers "where am I" within 30 s at 320×568 without scrolling, zero unexplained internal terms | `FR-F03-03`, `FR-F04-04`, `FR-F19-08` | **TC-A-003** *(chrome budget + above-the-fold assertion)*, TC-A-013, TC-E-007 | JRN-03.01, Segment 5a, on a phone-width viewport |

**Summary.** 25 of 25 metrics have a named verifying test case and a named observation point. Two reporting inconsistencies are carried as gaps: `FR-F19-09` scopes its CI traceability artifact to "SM-01 through SM-22" while the PRD F19 acceptance signal requires SM-01 through SM-25 (`RTM-GAP-07`), and the `UserStories` success-metric coverage table also stops at SM-22 (`RTM-GAP-08`).

---

## 11. Coverage Gap Analysis

**No blocking gaps.** Every PRD feature has FRD requirements, every journey has covering stories, every story has a test case, and every requirement has a test case. The findings below are honest disclosures and, in four cases, reporting defects worth fixing before hand-off. Each carries an ID so it can be closed rather than rediscovered.

### 11.1 Mandatory checks — results

| Check | Method | Result |
|---|---|---|
| Any PRD feature with **no FRD requirement**? | Grouped 182 FR-IDs by originating feature | **None.** 20 of 20 features covered, min 6, max 12 requirements. |
| Any FRD requirement with **no user story**? | Parsed `**FRD:**` trailers on all 151 stories, reversed the mapping | **15 of 182** — see `RTM-GAP-01`…`RTM-GAP-04`. All 15 are machine-verified rather than user-observable; all 15 have a test case. |
| Any user story with **no test case**? | Reversed the 176-case TC catalogue against the 151 story IDs | **None.** 151 of 151 covered. |
| Any FRD requirement with **no test case**? | Reversed the TC catalogue against the 182 FR-IDs | **None.** 182 of 182 covered. |
| Any journey with **no covering stories**? | `STORY-MAP` journey coverage + per-release "closed by" attributions | **None.** 10 of 10 journeys, 78 of 78 stages covered. |
| Any JTBD with **no journey**? | `JOURNEYS` JTBD coverage check | **None.** 16 of 16 jobs exercised. |
| Any persona with **< 2 journeys**? | `JOURNEYS` journey index | **None.** Each of PER-01…04 carries 2–3 journeys. |
| Any dangling `FR-` reference anywhere in the suite? | Set comparison across FRD, TechArch (56), UserStories (168), JOURNEYS (4), STORY-MAP (2), UX-Mockup (64) | **None.** Zero dangling across 294 unique downstream citations. |
| Any story not placed on the story map? | `STORY-MAP` placement integrity | **None.** 151 placed, 0 orphans. |
| Any `SCR-nn` reference to a screen outside the inventory? | Set comparison against `FR-F03-02` | **None.** SCR-01…38 closed. |

### 11.2 Requirements with no citing user story — `RTM-GAP-01` … `RTM-GAP-04`

Fifteen requirements are not cited by any story's `**FRD:**` trailer. In every case the behaviour is either a machine-verified contract, an internal lifecycle detail, or a documentation artifact — nothing user-observable is missing. All fifteen are nevertheless test-covered, and the implicit story is named so the link can be made explicit in a future revision.

| Gap | Requirements | Why no story exists | Test coverage | Implicit story | Recommendation |
|---|---|---|---|---|---|
| **`RTM-GAP-01`** *(session internals)* | `FR-F01-01` single server-side session issuance; `FR-F01-04` per-spoke context handles and invalidation | Both are internals of behaviour a user experiences through other stories: the session exists (US-009, US-012) and ends (US-007) | TC-U-002, TC-I-003 | US-009 / US-012 for issuance, US-007 for invalidation | Add the FR citations to US-009 and US-007. No new story needed. |
| **`RTM-GAP-02`** *(contract and genericity)* | `FR-F07b-07` orchestration is not special-cased; `FR-F08a-01` interface operations; `FR-F08a-03` `listWorkItems`/`getWorkItem`; `FR-F08a-04` `performAction`/`getWorkItemSummary`/`getActivityHistory`; `FR-F08a-06` adapter error taxonomy; `FR-F08b-04` role visibility and per-application access scoping; `FR-F09-07` common spoke service requirements | These are the adapter seam itself — verified by conformance suite, not by a user action. A user story for "the interface has seven operations" would be a fiction. | TC-U-004, TC-AC-002, TC-AC-004, TC-AC-005, TC-AC-007, TC-I-036, TC-AC-011 | US-070 and US-074 *(prove a new adapter is correct before trusting it)*; US-082 for the error taxonomy | Cite these FRs from US-074 and US-082. `FR-F07b-07` is on the flagship thread and should be cited from US-064 explicitly, because "the engine is generic" is the claim that makes F12 credible. |
| **`RTM-GAP-03`** *(API conventions)* | `FR-F10-02` endpoint groups and their screens; `FR-F10-04` pagination/filtering/sorting conventions; `FR-F10-07` rate limiting (demo-grade) | Cross-cutting conventions rather than features. `FR-F10-07` is the only requirement in the suite with **neither** a story **nor** an upstream PRD capability bullet — it is a defensive addition made in the FRD. | TC-I-045, TC-I-046, TC-I-047 | US-045 *(pagination)*, US-084 *(API documentation)*; none for rate limiting | Cite `FR-F10-04` from US-045 and `FR-F10-02` from US-084. Decide explicitly whether `FR-F10-07` is in scope for the prototype or should be marked `[WITHDRAWN]`. |
| **`RTM-GAP-04`** *(cross-cutting and documentation)* | `FR-F12-08` onboarding documentation; `FR-F14-10` error/empty/loading state accessibility; `FR-F17-02` personas and role/attribute coverage | `FR-F14-10` is the notable one: it is a **P0 accessibility requirement** on exactly the states most likely to be built carelessly, and it has no story of its own. `FR-F12-08` and `FR-F17-02` are artifacts whose consumers are other documents. | TC-I-059, **TC-A-015**, TC-I-074 | US-128, US-129, US-130 collectively cover the states; US-118 covers the accessibility claim; US-133 covers persona seeding | **Add explicit `FR-F14-10` citations to US-128, US-129, and US-130.** A P0 accessibility requirement reachable only by inference is the kind of gap that produces a demo-day violation. |

### 11.3 Reporting and direction gaps — `RTM-GAP-05` … `RTM-GAP-11`

| Gap | Finding | Impact | Recommendation |
|---|---|---|---|
| **`RTM-GAP-05`** | `JOURNEYS-DCSA-UAL.md` contains **zero `US-` references** across all 13 chunks. Journey→story traceability exists only in `STORY-MAP`. | Medium. Coverage is verifiable, but only by joining two documents. A journey stage that loses its story would not be detectable from JOURNEYS alone. | Add a story column to each journey's stage table, or a per-journey traceability block mirroring §6.3 of this document. |
| **`RTM-GAP-06`** | `NFR-20` (security posture — session expiry, logout termination, non-disclosing auth failure) appears **only in the PRD**. No FRD requirement, TechArch section, or story cites the identifier. | Low functionally, medium for reporting. The behaviour is fully specified (`FR-F00-02`, `FR-F00-06`, `FR-F00-07`, `FR-F01-04`) and fully tested (TC-I-001, TC-I-002, TC-I-003, TC-A-014), but a mechanically generated NFR coverage report would show it uncovered. | Add `NFR-20` to the `**Traces to:**` line of `FRD/F00-simulated-mfa-authentication.md` and `F01-unified-session-sso.md`. |
| **`RTM-GAP-07`** | `FR-F19-09` rule 1 scopes the CI traceability artifact to "SM-01 through **SM-22**". The PRD F19 acceptance signal requires "every success metric **SM-01 through SM-25**". `SM-23` and `SM-24` are cited by no F19 requirement at all. | Medium. Three role-experience metrics — including `SM-24`, a two-click usability claim the demo script depends on — would be absent from the reviewer-readable report. | Correct `FR-F19-09` rule 1 to SM-25 and add `SM-23`/`SM-24` assertions to `FR-F19-08` (crawl) and the dashboard E2E. TC-E-007 and TC-E-008 already carry them. |
| **`RTM-GAP-08`** | The `UserStories` success-metric coverage table stops at `SM-22`; `SM-23`, `SM-24`, `SM-25` have no story-level demonstration named. | Low. `FRD F04` covers all three; the omission is in the story document's summary table only. | Extend the table: `SM-23` → US-033…036; `SM-24` → US-039; `SM-25` → US-035, US-116. |
| **`RTM-GAP-09`** | `TechArch` cites **56 of 182** FR-IDs explicitly by ID; the remaining 126 are covered structurally by section but carry no ID-level citation. | Low. The chunk map (§0.7) and the per-feature mapping in §3 of this document make coverage determinable. But there is no mechanical way to prove TechArch covers a given requirement. | Add a `**Implements:**` line to each TechArch section listing the FR-IDs it realises. This is the single highest-leverage traceability improvement available to the suite. |
| **`RTM-GAP-10`** | No `TC-` identifier space existed before this RTM. `FR-F19-09` rule 5 requires the CI artifact to map every FRD requirement to its verifying test(s). | Medium. Without an adopted TC space, the CI artifact will invent its own identifiers and the two traceability views will diverge. | Adopt the 176 TC IDs in §8 as the build's test-registry keys, and have `FR-F19-09`'s artifact emit them. Then this RTM and the CI report are the same claim in two formats. |
| **`RTM-GAP-11`** | The reconciliation hand-off reported **186** defined / 186 referenced FR-IDs. Re-extraction gives **182 / 182**. Integrity is exact (zero dangling, zero orphans); the count was stale. | Low. Corrected here. | Update the FRD's own summary count to 182 wherever it appears, so the next reconciliation does not re-open a closed question. |

### 11.4 Disclosed scope and sequencing risks — `RTM-GAP-12` … `RTM-GAP-14`

| Gap | Finding | Consequence to manage |
|---|---|---|
| **`RTM-GAP-12`** | `Q-01` (DCSA Ecosystem Style Guide, Attachment 1) and `Q-02` (`Page_render_reference.pdf`) remain **open — external input required**; neither can be closed from inside this effort. | Blast radius is bounded and documented: `A-05` in `FRD Y3` confines it to F14 theming tokens and header assets — a token and asset swap, not a component rewrite. Disclosed on SCR-36 per `FR-F14-11` and verified by TC-A-016. **Revisit immediately on receipt of Attachment 1** and record any divergence as a change to F14. |
| **`RTM-GAP-13`** | `JRN-01.02` stage 7 and `JRN-02.02` stages 5–6 are stranded until R3 — both journeys are mostly demonstrable from R1/R2 but cannot be walked end to end earlier. | Deliberate: stage 7 is the *consequence* of registration (F12) and stages 5–6 are the *consequence* of the health monitor (F16). **Rehearsal scripts must not claim these journeys complete before R3.** Closed by US-098 and US-129 respectively. |
| **`RTM-GAP-14`** | PER-02 and PER-03 can do no meaningful work at the end of R1 — a deliberate consequence of the walking-skeleton rule. | **If the build stops after R1, the RBAC/ABAC claim is unproven**, because its clearest live demonstration (US-017 — the same work item, two roles, two server-computed action sets) requires PER-02 to exist. R2 is therefore not optional for a credible evaluation. Additionally, all of PER-04's journeys land in R3, which carries 50 stories and 5 of the 10 journeys; mitigated by shipping US-070 (registry-driven fan-out) and US-145 (flagship regression test) in R1 and by R3's internal ordering gate sequencing operability before extensibility. |

### 11.5 Priority of remediation

| Priority | Gaps | Rationale |
|---|---|---|
| **Fix before build starts** | `RTM-GAP-04` *(FR-F14-10 citations)*, `RTM-GAP-10` *(adopt the TC space)* | A P0 accessibility requirement reachable only by inference, and a test registry that will otherwise fork. |
| **Fix before hand-off** | `RTM-GAP-06`, `RTM-GAP-07`, `RTM-GAP-08`, `RTM-GAP-11` | All four are one-line reporting corrections that make coverage mechanically provable. |
| **Fix opportunistically** | `RTM-GAP-01`, `RTM-GAP-02`, `RTM-GAP-03`, `RTM-GAP-05`, `RTM-GAP-09` | Traceability quality improvements; no behaviour is missing. |
| **Monitor, do not fix** | `RTM-GAP-12`, `RTM-GAP-13`, `RTM-GAP-14` | Bounded external dependency and two deliberate sequencing decisions. |

---

## 12. Change Management

### 12.1 Change control for this matrix

This RTM is a **derived document**. It is regenerated rather than edited whenever any traced document changes, and the regeneration re-extracts every identifier rather than trusting the previous version. The following changes require regeneration:

| Trigger | What must be re-verified |
|---|---|
| A PRD feature is added, removed, or re-prioritised | §2.4, §3, §4; the feature's FR set, story set, and TC set |
| An FRD requirement is added, withdrawn, or renumbered | §5 in full; §11.1 requirement-coverage checks; the affected feature's TC assignments |
| A user story is added, split, or removed | §5 story columns; §6.2–6.4; §11.1 story-coverage check; `STORY-MAP` placement integrity |
| A TechArch section, ADR, table, or endpoint changes | §3 TechArch column; §9 implementation column; §7.4 if the flagship thread is touched |
| An `NFR` or `SM` is added or retargeted | §9 or §10 in full |
| A persona, job, journey, or journey stage changes | §6 in full; §11.1 human-layer coverage checks |
| Attachment 1 (DCSA Ecosystem Style Guide) is received | `RTM-GAP-12` closes; F14 theming requirements and TC-A-016 re-verified; PRD `Q-01` re-dispositioned |

**Rule.** A requirement is never renumbered. A retired requirement is marked `[WITHDRAWN]` in place, and this matrix retains its row with the withdrawal recorded — so a build artifact referencing an old ID resolves to an explanation rather than to nothing.

### 12.2 Change log

| Version | Date | Author | Change | Affected sections |
|---|---|---|---|---|
| 1.0 | 2026-09-15 | Pivota Spec Framework — RTM generator | Initial matrix. Traced 20 PRD features, 182 FRD requirements, 18 TechArch chunks / 16 ADRs / 58 tables / 34 endpoints, 151 user stories, 4 personas, 16 jobs, 10 journeys, 3 releases, 20 NFRs, 25 success metrics. Introduced the 176-case `TC-` identifier space. Recorded 14 traceability gaps. Corrected the FR-ID count from the reported 186 to the verified 182 with integrity confirmed. | All |

### 12.3 Traceability health indicators

Track these five numbers across revisions. A regression in any of them is a traceability defect, not a documentation preference.

| Indicator | Baseline v1.0 | Target |
|---|---|---|
| FRD requirements with no citing story | 15 / 182 (8.2%) | ≤ 5 / 182, and zero among P0 user-observable requirements |
| FRD requirements with no explicit TechArch ID citation | 126 / 182 (69.2%) | 0 — via the `**Implements:**` line proposed in `RTM-GAP-09` |
| FRD requirements with no test case | 0 / 182 | 0 |
| User stories with no test case | 0 / 151 | 0 |
| NFRs not cited by ID downstream | 1 / 20 (`NFR-20`) | 0 |
| Success metrics absent from the CI traceability artifact | 3 / 25 (`SM-23`, `SM-24`, `SM-25`) | 0 |
| Dangling requirement references, any document | 0 | 0 |

---

## 13. Approval and Sign-Off

By signing below, each approver confirms that the traceability relationships in this matrix accurately reflect the documents named in §12.1 as of the stated date, that the gaps recorded in §11 have been reviewed and dispositioned, and that the remediation priorities in §11.5 are accepted.

| Role | Responsibility in this matrix | Name | Signature | Date |
|---|---|---|---|---|
| **Product Owner** | PRD features, priorities, product principles, success metrics; accepts §3, §4, §10 | ________________________ | ________________________ | ____________ |
| **Lead Business Analyst** | FRD requirement completeness and the PRD→FRD mapping; accepts §5 and §11.2 | ________________________ | ________________________ | ____________ |
| **Lead Architect** | TechArch specifications, ADRs, data model, adapter seam; accepts §3 TechArch column, §7.4, §9 implementation column | ________________________ | ________________________ | ____________ |
| **UX / Accessibility Lead** | Personas, jobs, journeys, screen inventory, Section 508 / WCAG 2.1 AA conformance; accepts §6, §9.1 accessibility cluster, and the `RTM-GAP-04` remediation | ________________________ | ________________________ | ____________ |
| **QA / Verification Lead** | Test-case catalogue, coverage properties, CI gates; accepts §8, §10, and the `RTM-GAP-10` adoption of the `TC-` space | ________________________ | ________________________ | ____________ |
| **Security / Zero-Trust Reviewer** | `NFR-04`…`NFR-07`, RBAC negative-path coverage, audit immutability; accepts §9.1 zero-trust and auditability clusters | ________________________ | ________________________ | ____________ |
| **Demo Operator** | Demonstrability of the six scripted segments and the flagship thread; accepts §7 and §11.4 `RTM-GAP-13` | ________________________ | ________________________ | ____________ |

### 13.1 Conditions of approval

1. **`RTM-GAP-04` and `RTM-GAP-10` are closed before build start.** A P0 accessibility requirement (`FR-F14-10`) must be cited by the stories that deliver it, and the `TC-` identifier space must be adopted as the build's test registry so that `FR-F19-09`'s artifact and this matrix remain the same claim.
2. **`RTM-GAP-06`, `RTM-GAP-07`, `RTM-GAP-08`, and `RTM-GAP-11` are closed before hand-off.** Four one-line corrections that make NFR and success-metric coverage mechanically provable.
3. **The flagship thread in §7 is re-verified at every release gate.** R1, R2, and R3 each assert `SM-01`…`SM-04`, `SM-08`, `SM-20`, and `SM-22`; a regression in `TC-E-011`, `TC-E-012`, `TC-E-013`, or `TC-R-004` blocks the gate regardless of what else passes.
4. **`RTM-GAP-12` is revisited on receipt of Attachment 1.** The DCSA Ecosystem Style Guide assumption is disclosed on SCR-36 and must be re-dispositioned, not silently retained, once the real guide exists.
5. **Approval of this matrix is not approval of the specifications it traces.** It is a statement that the relationships between them are complete, consistent, and gap-disclosed.

---

## 14. Related Documents

| Document | Relationship to this matrix |
|---|---|
| `.planning/PROJECT.md` | Source charter — the core-value statement that §7 traces, plus constraints and key decisions |
| `project_specs/PRD-DCSA-UAL.md` | Upstream — features `F0`…`F19`, principles `PRIN-01`…`PRIN-06`, `NFR-01`…`NFR-20`, `SM-01`…`SM-25`, risks `R-01`…`R-15`, questions `Q-01`…`Q-07` |
| `project_specs/FRD-DCSA-UAL.md` *(chunks in `FRD/`)* | Upstream — 182 functional requirements, the 38-screen inventory (`FR-F03-02`), hub and spoke schemas (`Y0a`, `Y0b`), endpoint catalogues (`Y1a`, `Y1b`), error catalogue (`Y2`), integration points (`Y3`) |
| `project_specs/TechArch-DCSA-UAL.md` *(chunks in `TechArch/`)* | Upstream — 18 chunks, `ADR-001`…`ADR-016`, component map, adapter seam, security placement, audit enforcement, resilience, orchestration, testing architecture |
| `project_specs/UserStories-DCSA-UAL.md` *(chunks in `UserStories/`)* | Upstream — 151 stories in 20 epics, story index, priority tiers |
| `project_specs/PERSONAS-DCSA-UAL.md` | Upstream — `PER-01`…`PER-04`, feature-persona matrix |
| `project_specs/JTBD-DCSA-UAL.md` | Upstream — `JTBD-01.1`…`JTBD-04.4`, outcome-to-feature traceability |
| `project_specs/JOURNEYS-DCSA-UAL.md` *(chunks in `JOURNEYS/`)* | Upstream — `JRN-01.01`…`JRN-04.03`, 78 stages, the six-segment scripted demonstration path, journey→JTBD traceability |
| `project_specs/STORY-MAP-DCSA-UAL.md` *(chunks in `STORY-MAP/`)* | Upstream — backbone matrix, releases `R1`/`R2`/`R3`, JTBD and journey coverage, placement integrity, gap analysis |
| `project_specs/UX-Mockup-DCSA-UAL.md` | Upstream — screen and flow designs; 64 FR-ID citations, all resolving |
| `project_specs/ref_docs/DCSA_Innovation_Call_01_Unified_Application_Layer.pdf.md` | Governing requirement (input, not specification) |
| `project_specs/ref_docs/DCSA_Innovation_Gateway_20260623.pdf.md` | Parent solicitation — technical priorities and evaluation criteria |
| **Missing** — "Attachment 1 — DCSA Ecosystem Style Guide" | Referenced by the Innovation Call, **not supplied**. Drives `Q-01` and `RTM-GAP-12`. |

---

*Document generated by Pivota Spec Framework — Requirements Traceability Matrix generator.*
*Last updated: 2026-09-15. All identifiers extracted from the source documents and re-verified for this revision; no placeholder identifiers appear in this matrix.*
*DEMO — SYNTHETIC DATA ONLY. No real DCSA data, no real PII, no real system connections.*
