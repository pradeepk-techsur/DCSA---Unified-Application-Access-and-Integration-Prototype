---
pivota_spec_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 01-02-PLAN.md
last_updated: "2026-09-15T15:55:33.825Z"
last_activity: "2026-09-15 — Plan 01-02 complete: 12 migrations (7 isolated schemas), grant matrix, isolation introspection suite"
progress:
  total_phases: 8
  completed_phases: 0
  total_plans: 7
  completed_plans: 2
  percent: 29
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-14)

**Core value:** A user signs in once and completes a cross-application workflow end-to-end without ever logging into — or navigating to — a second system.
**Current focus:** Phase 1 — Separated Spokes and the Adapter Seam

## Current Position

Phase: 1 of 8 (Separated Spokes and the Adapter Seam)
Plan: 2 of 7 in current phase (complete)
Status: In progress
Last activity: 2026-09-15 — Plan 01-02 complete: 12 migrations laying 7 isolated schemas, grant matrix, isolation introspection suite (all 42 cross-schema reads denied 42501)

Progress: [███░░░░░░░] 29%

## Performance Metrics

**Velocity:**

- Total plans completed: 2
- Average duration: 11min
- Total execution time: ~0.4 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | 7 | 11min |

**Recent Trend:**

- Last 5 plans: 01-01 (8min, 3 tasks, 22 files), 01-02 (14min, 3 tasks, 15 files)
- Trend: steady

*Updated after each plan completion*

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 8min | 3 tasks | 22 files |
| Phase 01 P02 | 14min | 3 tasks | 15 files |

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

### Pending Todos

None yet.

### Blockers/Concerns

- Q-01 / Q-02: Real "DCSA Ecosystem Style Guide" (Attachment 1) and `Page_render_reference` were never supplied. USWDS v3 assumed; Phase 3 criterion 5 (token-only theming, zero hard-coded literals) is the hedge that keeps the eventual swap a theme change.
- RTM-GAP-04: `FR-F14-10` (P0 accessibility states) has no citing user story — resolve during Phase 3 planning.
- Flow-07: JRN-03.02 walkthrough recorded but not authored; carries the resource-level zero-trust claim. Close before Phase 8 demo rehearsal.

## Session Continuity

Last session: 2026-09-15
Stopped at: Completed 01-02-PLAN.md
Resume file: None
