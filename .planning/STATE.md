---
pivota_spec_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 01-03-PLAN.md
last_updated: "2026-09-15T15:58:00.000Z"
last_activity: "2026-09-15 — Plan 01-03 complete: the adapter seam — @ual/adapter-contract, @ual/assertions (Ed25519), @ual/adapter-runtime, @ual/adapter-rest-json-v1; 30 tests"
progress:
  total_phases: 8
  completed_phases: 0
  total_plans: 7
  completed_plans: 3
  percent: 29
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-14)

**Core value:** A user signs in once and completes a cross-application workflow end-to-end without ever logging into — or navigating to — a second system.
**Current focus:** Phase 1 — Separated Spokes and the Adapter Seam

## Current Position

Phase: 1 of 8 (Separated Spokes and the Adapter Seam)
Plan: 3 of 7 in current phase (complete)
Status: In progress
Last activity: 2026-09-15 — Plan 01-03 complete: the adapter seam (contract + assertions + runtime + REST_JSON_V1 adapter), 30 unit tests, build/lint clean

Progress: [███░░░░░░░] 29%

## Performance Metrics

**Velocity:**

- Total plans completed: 3
- Average duration: 14min
- Total execution time: ~0.7 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 3 | 7 | 14min |

**Recent Trend:**

- Last 5 plans: 01-01 (8min, 3 tasks, 22 files), 01-02 (14min, 3 tasks, 15 files), 01-03 (20min, 3 tasks, 31 files)
- Trend: steady

*Updated after each plan completion*

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 8min | 3 tasks | 22 files |
| Phase 01 P02 | 14min | 3 tasks | 15 files |
| Phase 01 P03 | 20min | 3 tasks | 31 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Flagship workflow (F7) lands at Phase 5 of 8 — as early as its dependencies (seam, choke point, shell, work surface) allow. Every phase after it treats JRN-01.01 as a standing regression gate.
- [Roadmap]: Operability (Phase 6, F11/F16) precedes extensibility (Phase 7, F12), per the STORY-MAP's internal ordering gate — a truncated build still leaves an operable platform, and a registered application is never invisible to monitoring.
- [Roadmap]: F17 seed corpus is owned by Phase 1 and extended by Phases 4, 6, 7 as their surfaces arrive — no screen is ever built against an empty namespace.
- [Roadmap]: F14 accessibility is a Phase 3 foundation with a CI axe gate running from that phase forward; F19's complete suite in Phase 8 is a sweep, not a discovery.
- [01-01]: Isolation is exercised, not asserted — @ual/db pins each pool's search_path to one schema; verified 7 own-schema USAGE grants and 0 cross-schema grants after bootstrap.
- [01-01]: Migrations are immutable by sha256 checksum; a mutated applied file aborts the runner non-zero. Owner credential is used only by @ual/migrate, never by a service pool.
- [01-01]: cvs schema + cvs_service role created in Phase 1 (service ships Phase 7) because the bootstrap grant matrix is one immutable, reviewable file.
- [01-01]: Added @types/pg (pinned) to type the pg driver under TS strict — a blocking dependency, not scope creep (ADR-005 keeps hand-written SQL, no ORM).
- [01-02]: Phase-1 hub subset only — sessions/audit/orchestration/notifications and application_registration_drafts deferred to Phase 2+, each omission stated in a header comment so it reads as deliberate.
- [01-02]: hub.registered_applications ships 35 columns verbatim from TechArch §3.5; the plan's >=36 verify threshold was an off-by-one authoring error, verbatim fidelity is the real requirement (all 12 policy columns + CHECK bounds verified individually).
- [01-02]: Isolation is a runnable proof, not prose — tests/integration/isolation.spec.ts denies all 42 cross-schema reads with 42501, asserts zero cross-schema FKs, and names any violator; hub holds no spoke USAGE.
- [01-02]: DB-mutating integration suites serialised (vitest fileParallelism:false) and tests/tsconfig.json isolates the test tree from sibling plans' broken root project references — both minimal fixes touching no other plan's files.
- [01-03]: Six-vs-eight operations conflict resolved toward EIGHT (FR-F08a-01/TechArch §5.1 win on WHAT); getWorkItemSummary + establishContext/revokeContext are optional, present iff declared in capabilities. Conformance suite (01-07) asserts this.
- [01-03]: RegistryRecord placed in @ual/adapter-contract for Phase 1; TechArch's @ual/contracts arrives with the Phase 2 BFF — a file comment flags the eventual move/re-export.
- [01-03]: Resilience lives OUTSIDE the adapter (invoke wraps every call); IssueSink + CircuitStateStore are ports so @ual/adapter-runtime carries no @ual/db and no HTTP client and stays unit-testable.
- [01-03]: @ual/adapter-rest-json-v1 is registry-driven with zero spoke-id literals in src (EAPP/IEP/PVQ/PDT/IM) — a 422 resolves as a sanitized business rejection, a 503 throws; the two are separated at the type level.

### Pending Todos

None yet.

### Blockers/Concerns

- Q-01 / Q-02: Real "DCSA Ecosystem Style Guide" (Attachment 1) and `Page_render_reference` were never supplied. USWDS v3 assumed; Phase 3 criterion 5 (token-only theming, zero hard-coded literals) is the hedge that keeps the eventual swap a theme change.
- RTM-GAP-04: `FR-F14-10` (P0 accessibility states) has no citing user story — resolve during Phase 3 planning.
- Flow-07: JRN-03.02 walkthrough recorded but not authored; carries the resource-level zero-trust claim. Close before Phase 8 demo rehearsal.

## Session Continuity

Last session: 2026-09-15
Stopped at: Completed 01-03-PLAN.md
Resume file: None
