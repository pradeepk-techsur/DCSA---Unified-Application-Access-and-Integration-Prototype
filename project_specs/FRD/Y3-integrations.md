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
