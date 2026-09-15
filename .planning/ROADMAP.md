# Roadmap: DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

## Overview

This roadmap builds the prototype in the order its dependencies actually run, with one
governing constraint: **the flagship cross-application workflow (F7, JRN-01.01) must be
demonstrable as early as its dependencies allow, because it is the single artifact that
proves the product's thesis to an evaluator.**

The build starts underneath the UI — five genuinely separate spoke services, isolated data
namespaces, the adapter seam, a data-driven registry, and the synthetic corpus every later
screen renders (Phase 1). It then erects the structural choke point the TechArch mandates:
one sign-in, one server-side authorization decision point, one mandatory audit write, one
BFF (Phase 2). Only then does UI exist, and it is built accessible from the first screen
rather than retrofitted (Phase 3), because a retrofitted federal accessibility story is a
disqualified one. Phase 4 delivers the surfaces that answer "what is mine and how do I act
on it," which are the last prerequisites of the flagship. **Phase 5 is the flagship** — at
that point an evaluator can watch the whole thesis complete, and every later phase is a
regression gate against it.

Phases 6 and 7 deliver the two architectural claims a reviewer will actually test, in the
order the STORY-MAP's schedule-risk gate requires: **operability before extensibility**, so
a truncated build still leaves a platform that can be operated and a newly registered
application is never invisible to monitoring. Phase 8 makes the whole thing startable,
scriptable, rehearsable, and verified.

Deviation from `STORY-MAP-DCSA-UAL.md` is minimal and declared: its R1 slices *within*
features (investigator-only dashboards, three-of-five spoke depth) to reach the flagship
faster. This roadmap keeps whole features in single phases for traceability, and therefore
reaches the flagship at Phase 5 of 8 rather than at the end of a thin R1. The intent —
flagship early, nothing after it that the flagship needs — is preserved. Where a feature
legitimately completes in two places (the administrator dashboard, announcement authoring,
seed breadth), the phase detail says so explicitly rather than hiding it.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Separated Spokes and the Adapter Seam** - Five real, independently callable simulated services over isolated namespaces, a common adapter contract, a data-driven registry, and the synthetic corpus every later screen depends on
- [ ] **Phase 2: One Sign-In, One Enforcement Point** - Simulated multi-method MFA, SSO across all spokes, and a single server-side choke point where resource-level authorization and immutable audit are unbypassable
- [ ] **Phase 3: The Accessible Unified Shell** - One USWDS v3 frame, role-aware navigation, the non-dismissible demo banner, and continuous automated accessibility gating from the first screen
- [ ] **Phase 4: What Is Mine, and Acting On It** - Role dashboards, the unified five-source work queue, work-item detail with real state-changing actions, merged history, and derived alerts
- [ ] **Phase 5: The Flagship Cross-Application Workflow** - eApp case → related PVQ issue → resolve → both spokes independently confirm, one session, zero re-typed identifiers, one correlated audit chain
- [ ] **Phase 6: Operating the Platform** - Administrator console, per-application health, integration issue log, circuit breaking, and degradation that is named, quantified, survivable, and self-healing
- [ ] **Phase 7: Onboarding the Next Application as Configuration** - Live UI registration of a sixth application with zero code changes and zero restarts, visible immediately to an already-signed-in user
- [ ] **Phase 8: Demonstrable, Verified, Rehearsed** - One command from clean checkout to running seeded system, six scripted demo segments, and the full automated test and accessibility suite

## Phase Details

### Phase 1: Separated Spokes and the Adapter Seam
**Goal**: The five mission systems exist as genuinely separate, independently callable services over isolated data namespaces, populated with the synthetic corpus every later screen renders, and reachable only through one common adapter interface driven by a data-driven registry.
**Depends on**: Nothing (first phase)
**Requirements**: F8, F9, F17
**Success Criteria** (what must be TRUE):
  1. An evaluator can `curl` each of the five spokes directly on its own published port and get realistic synthetic domain records back — `CASE-A-1042` from eApp, `ISS-2207` from PVQ, the IM assignment, the PDT designation, the IEP notices — and every precondition JRN-01.01 lists (P1–P8) is present in the seeded data.
  2. The separation is provable rather than asserted: separate schemas with separate credentials, zero cross-schema grants and zero cross-schema foreign keys, verified by an automated introspection check; cross-system relationships exist only as opaque references, and no spoke process can read another spoke's store or call the hub.
  3. A spoke is reachable **only** through its adapter — zero direct HTTP call sites aimed at a spoke endpoint exist outside the adapter packages, all five adapters implement the same six-operation contract (`list`, `get`, `act`, `history`, `health`, `describe`), and a standalone conformance run proves it for each one.
  4. Adding or removing a registry row changes which applications the fan-out targets, with no hard-coded list of spoke identifiers anywhere in hub core — enforced by a CI check, not by convention. (This is what Phase 7's live registration plugs into; if it is not true here, extensibility becomes a retrofit.)
  5. Seeding is deterministic and idempotent: two runs produce identical data, the documented reset command returns `ISS-2207` to `OPEN`, and startup **fails loudly and specifically** when a persona binding is missing or double-bound — so a broken corpus is diagnosed at start-up rather than discovered in front of a reviewer.
**Journeys demonstrable at end of phase**: None end-to-end (no UI yet). JRN-01.01's data preconditions and JRN-04.01's separation claim (US-076, US-077) are verifiable by direct spoke API calls.
**Scope note**: F17 is *owned* here and extended in later phases as their surfaces arrive — Phase 4 adds breadth for PER-02/03/04 and every filter facet, Phase 6 adds the degraded-spoke and blocked-action edge states, Phase 7 adds the CVS corpus. The seeding mechanism, validator, and reset command all land here so no later phase is ever built against an empty namespace.
**Plans**: TBD

### Phase 2: One Sign-In, One Enforcement Point
**Goal**: A user authenticates once through a simulated identity provider and every subsequent request — read or write — passes a single server-side choke point that resolves the principal, authorizes at the resource level, and writes an immutable audit record before any success is returned.
**Depends on**: Phase 1
**Requirements**: F0, F1, F2, F10, F13
**Success Criteria** (what must be TRUE):
  1. Signing in once via CAC/PIV, ECA, or generic MFA establishes a session that reaches work belonging to all five spokes with **exactly one authentication event** in the audit log for the whole traversal, and nothing in the flow implies a real certificate was validated.
  2. An authenticated Applicant principal calling an Investigator-only endpoint, and calling a legitimate endpoint with another subject's resource identifier, is refused **server-side** with byte-identical non-enumerable errors — and both refusals appear in the audit trail. Bypassing the (not yet built) UI grants nothing.
  3. Every mutating endpoint writes exactly one sequence-numbered, hash-chained audit record **before** responding; an operation whose audit write fails does not complete; and no application path exists to modify or delete an audit record — verified by test, not asserted.
  4. An evaluator can drive the hub API with `curl`: a consistent machine-readable error contract carrying a correlation ID, documentation generated from the implementation rather than hand-maintained, and one correlation ID propagated from caller through hub into every adapter call and into both audit and error records.
  5. Logout terminates the hub session and all downstream spoke context, and session timeout warns with a live countdown and an accessible re-authentication path rather than silently discarding a user's work.
**Journeys demonstrable at end of phase**: None end-to-end (no UI). The zero-trust denial beats of JRN-03.02 are demonstrable at the API level with `curl`.
**Plans**: TBD

### Phase 3: The Accessible Unified Shell
**Goal**: Every screen in the product lives inside one accessible, token-themed frame that a keyboard-only or screen-reader user can operate completely and that no viewer can mistake for a real-data system.
**Depends on**: Phase 2
**Requirements**: F3, F14
**Success Criteria** (what must be TRUE):
  1. Every route renders inside one USWDS v3 shell — header, role-aware primary navigation built from **server-computed entitlements**, breadcrumbs that carry cross-application context, session/identity control, footer — and every navigation item for every role resolves to a real, populated page with no 404 and no placeholder.
  2. The verbatim "Demo – Synthetic Data Only" banner is present in the **server-rendered** DOM of every route including login and error routes, at every viewport, with no close control and no CSS, state, or feature-flag path to hide it.
  3. An automated accessibility sweep over every route that exists × every role runs in CI **from this phase forward** and fails the build on any serious or critical violation — so later phases are gated continuously rather than discovering violations at the end. (The complete suite is Phase 8; the gate starts here.)
  4. The shell is fully operable keyboard-only with visible focus order, skip link, landmark regions, correct heading hierarchy, and a descriptive server-set page title per route; it is usable at 320px width and 200% zoom with no horizontal scrolling and no loss of function.
  5. Zero hard-coded color, font, or spacing literals exist in the codebase — verified by lint — so the real DCSA Ecosystem Style Guide, when it arrives, is applied as a token swap rather than a component rewrite. (This is the explicit hedge on open item Q-01.)
**Journeys demonstrable at end of phase**: None end-to-end. The shell, banner, and accessibility claims of every journey become continuously verifiable from here.
**Plans**: TBD

### Phase 4: What Is Mine, and Acting On It
**Goal**: A signed-in user sees everything assigned to them across all five systems in one place, knows what is urgent and what changed, and completes a real state-changing action on a single item with its full cross-system history.
**Depends on**: Phase 3
**Requirements**: F4, F5, F6, F15
**Success Criteria** (what must be TRUE):
  1. Each of the four roles lands on a **visibly different, fully populated** dashboard — assigned work, alerts, due dates, application status, recent activity, announcements — where every widget links to a real destination, empty states are designed rather than blank, and a slow spoke degrades one widget rather than the page.
  2. The queue aggregates correctly attributed items from at least four of five spokes in a single fan-out, with server-side filter, sort, search, and pagination scoped to what the principal may see; sort state and result counts are announced; and returning from an item restores prior filters, sort, and page after an interruption.
  3. A user opens an item, sees a **server-computed** action set (two roles opening the same item are offered different actions), completes a concrete action, and the resulting change is readable through the owning spoke's **own** API — not only through the hub that wrote it.
  4. The item's activity history reads as one chronology merging the spoke's native record with hub audit records — actor, action, timestamp, originating system — and confirmations name exactly what changed and in which system rather than saying "Saved".
  5. Alerts are derived server-side from live spoke data, each one opens the work item that produced it, the header count reconciles with the notifications list, and announcements are dismissible per user and **never** obscure the demo banner under any severity or modal combination.
**Journeys demonstrable at end of phase**: JRN-01.02 stages 1–6 (Monday-morning triage), JRN-02.01 (assemble and determine), JRN-02.02 stages 1–4 and 7, JRN-03.01 (where I stand, what I owe), JRN-03.02 (proof and boundary, now readable in the UI). Demo segments 4 and 5 become presentable.
**Scope note**: The administrator dashboard's *operational* widgets (health posture, integration failures) have nothing behind them until Phase 6 and complete there — shipping them now would mean shipping the placeholder widgets the PRD forbids. Announcement *rendering and dismissal* ship here; the administrator authoring surface for announcements ships with the console in Phase 6.
**Plans**: TBD

### Phase 5: The Flagship Cross-Application Workflow
**Goal**: An investigator clears a blocking PVQ issue on an eApp case in one sitting — discovering the relationship on the case, traversing it in-shell, resolving it, and watching both systems independently confirm the change — with no re-authentication and no context re-entry.
**Depends on**: Phase 4
**Requirements**: F7
**Success Criteria** (what must be TRUE):
  1. A reviewer following the demo script completes JRN-01.01 end to end **manually in under three minutes**, having typed **zero** case, subject, or issue identifiers by hand, with exactly one authentication event in the audit log for the session.
  2. The related PVQ issue is discovered **on the eApp case itself** — resolved live through the PVQ adapter, never a hard-coded link, and explained in words ("raised against Section 13A employment history") — and traversal to it happens inside the shell with no credential prompt, no new tab, no interstitial, and a breadcrumb that still names the case it came from.
  3. `GET {pvq}/issues/ISS-2207` and `GET {eapp}/cases/CASE-A-1042`, called **directly against the spokes with the hub out of the path**, both return the updated state, and the confirmation view shows each spoke's own answer rather than the hub asserting on their behalf.
  4. When the second write fails — inducible on demand — the user sees an explicit **partial-completion** state naming which system changed and which did not, with a correlation ID and a retry path, and the word "success" appears nowhere on that screen. A half-done write is never reported as done.
  5. The entire action retrieves as a **single correlated chain** in the audit viewer — case read, traversal, both writes, confirmation — and the whole path completes keyboard-only, with focus landing predictably on the new heading at the cross-application boundary.
**Journeys demonstrable at end of phase**: **JRN-01.01 complete, all 11 stages** — the product's thesis is watchable from here, and it becomes a regression gate run at the end of every subsequent phase. Demo segment 1 is presentable.
**Plans**: TBD

### Phase 6: Operating the Platform — Console, Health, and Visible Degradation
**Goal**: An administrator can see what is connected, whether it is working, and what has gone wrong — and any single system failing degrades the product visibly and survivably instead of blanking it.
**Depends on**: Phase 5
**Requirements**: F11, F16
**Success Criteria** (what must be TRUE):
  1. The console inventories every registered application **from the registry** with adapter type, endpoint, exposed types and actions, enabled state, current health, last successful check, latency, and check history; a manual "test connection" returns a live result announced in text; and every console action is itself authorized and audited under the administrator's own name.
  2. An induced adapter failure produces a correctly attributed entry in the integration issue log within one health-check interval, and the correlation ID a user reads off their error screen resolves the whole trace — error log into audit chain — in one query.
  3. With a spoke forced offline from the administrator-only failure-injection control, the queue renders the remaining sources **fully and actionably** beside a warning that **names the application and quantifies the gap** ("Investigation Management is unavailable — 12 items are not shown"), and the same specific treatment appears consistently on dashboard, queue, and detail.
  4. No blank page, unhandled error, or stack trace is reachable anywhere in the product during the outage; actions targeting an unavailable spoke are **disabled with a readable reason before submission** rather than failing mid-flight and taking typed input with them; and a designed empty state is distinguishable from a degraded state both visually and non-visually.
  5. Restoring the spoke clears the warning and restores data with **no reload and no re-authentication**, counts reconcile, and the change is announced through a live region **without stealing focus** from a half-written narrative.
**Journeys demonstrable at end of phase**: JRN-01.03 (keep working while IM is down) complete, JRN-02.02 complete, JRN-04.02 (triage an integration failure) complete, JRN-04.03 (rehearse degradation) complete. Demo segments 2 and 6 presentable. The administrator dashboard is completed here.
**Ordering note**: This phase deliberately precedes Phase 7 per the STORY-MAP's internal ordering gate (R3a before R3b). If the build is truncated, the platform is still operable and a registered application is never invisible to monitoring — the reverse order would leave a registration wizard writing rows that nothing probes and nothing displays.
**Plans**: TBD

### Phase 7: Onboarding the Next Application as Configuration
**Goal**: An administrator registers a sixth application live through the UI and it becomes a first-class part of the platform immediately — no code change, no redeploy, no restart.
**Depends on**: Phase 6
**Requirements**: F12
**Success Criteria** (what must be TRUE):
  1. In **under five minutes**, an administrator completes the guided multi-step registration of the Continuous Vetting Service — which ships running but deliberately unregistered — including a **live connection test** and capability auto-discovery from `describe()` **before** submission; duplicate-identifier and unreachable-endpoint conditions are caught at the step with an accessible inline error and error summary.
  2. On submission the new application appears at once in the inventory, in health monitoring, in role-scoped navigation, and in the unified work queue, with **zero code changes and zero restarts** — registration is a configuration record, not a code path.
  3. An investigator **already signed in in another window** sees CVS-badged work items arrive without signing out and without reloading the application, within thirty seconds.
  4. De-registering removes the application cleanly from navigation, queue, and console with no errors and no orphaned UI, and registration, edit, and de-registration each write an audit record naming the administrator and the configuration.
  5. A candidate adapter can prove itself against the standalone conformance suite before being trusted, the onboarding documentation states exactly what a new application must implement, and an application declaring fewer capabilities simply offers fewer controls rather than erroring.
**Journeys demonstrable at end of phase**: JRN-04.01 (register the sixth application) complete, JRN-01.02 stage 7 — closing JRN-01.02 at 7/7. Demo segment 3 presentable.
**Plans**: TBD

### Phase 8: Demonstrable, Verified, Rehearsed
**Goal**: Anyone can start the prototype from a clean checkout with one documented command and drive all six demonstration segments from a script, with every claim the product makes backed by a suite that runs rather than a paragraph that asserts.
**Depends on**: Phase 7
**Requirements**: F18, F19
**Success Criteria** (what must be TRUE):
  1. On a clean machine with no prior state and no network dependency, **one documented command sequence** builds, migrates, seeds, and runs the whole system to a usable UI; a failed start names the port, container, or missing dependency in plain words rather than printing a stack trace.
  2. All six demonstration segments run from written scripts with the expected state named at every step; a pre-flight check confirms all six applications healthy and `ISS-2207` open before presenting; and a written contingency exists for the three likeliest demo-day failures — a consumed flagship case, a spoke that will not start, and a stuck circuit breaker.
  3. The full suite runs and reports: unit, integration, adapter-contract conformance, the flagship end-to-end path, RBAC negative paths, resilience and degradation — and an accessibility sweep across **every route for every role** reporting zero serious and zero critical violations, with a dated manual keyboard and screen-reader pass recorded alongside it.
  4. An automated crawl of every navigation item for every one of the four roles returns a real, populated page: zero 404s, zero placeholder screens, zero non-functional controls.
  5. The full demonstration is **rehearsable**: it runs three times identically with a reset between runs, and one readable artifact maps requirements to the tests covering them — what passed, what failed, when it last ran — without anyone opening a CI log.
**Journeys demonstrable at end of phase**: All ten journeys, all 78 stages, driven from scripts and re-runnable. JRN-01.01 still completes in under three minutes with exactly one authentication event — the standing regression gate.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Separated Spokes and the Adapter Seam | 0/TBD | Not started | - |
| 2. One Sign-In, One Enforcement Point | 0/TBD | Not started | - |
| 3. The Accessible Unified Shell | 0/TBD | Not started | - |
| 4. What Is Mine, and Acting On It | 0/TBD | Not started | - |
| 5. The Flagship Cross-Application Workflow | 0/TBD | Not started | - |
| 6. Operating the Platform | 0/TBD | Not started | - |
| 7. Onboarding the Next Application as Configuration | 0/TBD | Not started | - |
| 8. Demonstrable, Verified, Rehearsed | 0/TBD | Not started | - |

## Requirement Coverage

All 20 v1 features (F0–F19) are mapped to exactly one phase. No orphans, no duplicates.

| Phase | Requirements |
|-------|--------------|
| 1 | F8, F9, F17 |
| 2 | F0, F1, F2, F10, F13 |
| 3 | F3, F14 |
| 4 | F4, F5, F6, F15 |
| 5 | F7 |
| 6 | F11, F16 |
| 7 | F12 |
| 8 | F18, F19 |

The 20 NFRs are cross-cutting and are not separately phased; each is carried as a success
criterion in the phase that first makes it observable and re-verified by Phase 8's suite:
NFR-01/02/03/16 → Phase 3; NFR-04/05/06/07/15/20 → Phase 2; NFR-08 → Phase 1;
NFR-12/13 → Phases 1 and 3; NFR-14/17 → Phases 3 and 4; NFR-09/10 → Phase 6;
NFR-11/19 → Phases 1 and 7; NFR-18 → Phase 8.

---
*Roadmap created: 2026-09-15*
