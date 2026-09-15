---
phase: 01-separated-spokes-and-the-adapter-seam
plan: 01
subsystem: infra
tags: [npm-workspaces, typescript, postgres, pg, docker-compose, migrations, eslint, vitest]

# Dependency graph
requires: []
provides:
  - "npm-workspaces monorepo root (dcsa-ual) on the pinned toolchain, building under TypeScript strict"
  - "@ual/db: per-role pg Pool factory (createPool/roleFor) pinning search_path to one schema"
  - "@ual/migrate: numbered-SQL runner, one txn per file, sha256-checksummed in hub.schema_migrations"
  - "000_bootstrap.sql: seven schemas, seven login roles, and the GRANT/REVOKE isolation matrix (ADR-004)"
  - "compose.yaml: ual-db (postgres:17.2-alpine, healthcheck, published) + ual-migrate job; Dockerfile"
  - ".env as the single source of all nine ports (WEB=3000 reserved, BIND=0.0.0.0)"
  - "eslint architecture boundary rule (no-restricted-imports) for hub core"
affects: [F8, F17, adapter-seam, spoke-services, seed-corpus]

# Tech tracking
tech-stack:
  added:
    - "typescript 5.6.3, vitest 2.1.8, eslint 9.17.0, prettier 3.4.2, typescript-eslint 8.18.2"
    - "pg 8.13.1 (no ORM, ADR-005), @types/pg 8.11.10, @types/node 22.10.2"
    - "postgres:17.2-alpine (pinned by digest), node:22.11-bookworm-slim base image"
  patterns:
    - "Per-role DB pools: each service constructs its pool with its OWN role credentials; search_path pinned to one schema"
    - "Numbered .sql migrations, immutable by checksum; owner credential used only by the runner"
    - "Every port defined once in .env and interpolated into compose; no port literal in code"
    - "ESLint no-restricted-imports as an architecture boundary gate"

key-files:
  created:
    - "package.json — npm workspaces root, exact-pinned deps, build/test/lint/arch scripts"
    - "tsconfig.base.json — strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes"
    - "tsconfig.json — project references for tsc -b"
    - "eslint.config.js — flat config with hub-core import boundary"
    - "vitest.config.ts — forks pool, serial, 30s timeout"
    - ".env — nine ports + demo constants + seven per-role passwords"
    - "packages/db/src/pool.ts — createPool, roleFor, NAMESPACES"
    - "packages/migrate/src/runner.ts — runMigrations, migrationStatus, substituteVars"
    - "packages/migrate/src/cli.ts — up | status"
    - "packages/migrate/sql/000_bootstrap.sql — the isolation model, byte-faithful to TechArch §3.2"
    - "packages/migrate/test/runner.spec.ts — idempotence, checksum-abort, 7 schemas + 7 roles"
    - "Dockerfile — multi-stage build (npm ci → build) + lean runtime"
    - "compose.yaml — ual-db + ual-migrate"
  modified: []

key-decisions:
  - "Added @types/pg (pinned 8.11.10) — required to type the pg driver under strict mode (Rule 3, blocking)"
  - "runner ensures hub.schema_migrations via existence check, not pre-create, so it never collides with 000's CREATE TABLE"
  - "cvs schema + cvs_service role created now though the CVS service ships in Phase 7 — the grant matrix is one immutable file"

patterns-established:
  - "Isolation is exercised, not asserted: each role holds USAGE on exactly one schema (cross-schema count == 0)"
  - "Migrations are immutable: a mutated applied file aborts the run non-zero"

# Metrics
duration: 8min
completed: 2026-09-15
---

# Phase 1 Plan 01: Repository Foundation, Per-Role Database Access, and Migration Runner Summary

**A greenfield npm-workspaces monorepo that builds under TypeScript strict, plus the per-role PostgreSQL access layer, a checksum-immutable numbered-SQL migration runner, and a compose topology whose `000_bootstrap.sql` grant matrix a reviewer can inspect in `psql` before a single table exists.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-09-15T15:30:19Z
- **Completed:** 2026-09-15T15:38:42Z
- **Tasks:** 3
- **Files modified:** 22 created

## Accomplishments
- npm-workspaces root on the pinned toolchain (exact versions, zero `^`/`~`/pre-release), committed `package-lock.json`; `npm run build` and `npm run lint` both exit 0.
- `@ual/db` per-role pool factory: `createPool` sets `search_path` to a single schema so a cross-namespace reference fails to resolve; `roleFor` reads `UAL_PW_<NS>`. No HTTP client in its dependency tree.
- `@ual/migrate` runner: filename-ordered, one transaction per file, sha256 checksum in `hub.schema_migrations`; idempotent on re-run and aborts non-zero on a mutated applied file. `:'<ns>_pw'` substitution from a fixed seven-token allow-list.
- `000_bootstrap.sql` byte-faithful to TechArch §3.2: 7 schemas, 7 login roles, 7 `GRANT USAGE`, 7 cross-schema `REVOKE ALL`, and `hub.schema_migrations`. Verified: 7 schemas, 7 login roles, 7 own-schema USAGE grants, and **0** cross-schema USAGE grants.
- Multi-stage Dockerfile (`npm ci` → build; devDependencies present at build time) and a `compose.yaml` with `ual-db` (postgres:17.2-alpine pinned by digest, healthcheck, published on `${UAL_DB_PORT}`) and the `ual-migrate` job (`depends_on: service_healthy`, `restart: no`). No `X-Frame-Options`/`frame-ancestors` anywhere (ADR-012).

## Task Commits

1. **Task 1: npm-workspaces root with pinned toolchain** - `f5d272c` (chore)
2. **Task 2: @ual/db + @ual/migrate + 000_bootstrap.sql** - `d90b8b1` (feat)
3. **Task 3: Dockerfile + compose topology** - `a09da61` (feat)

## Files Created/Modified
- `package.json`, `package-lock.json` — workspaces root, exact-pinned deps
- `tsconfig.base.json`, `tsconfig.json` — strict compiler flags + project references
- `eslint.config.js`, `.prettierrc.json`, `vitest.config.ts`, `.nvmrc` — toolchain config
- `.env` — nine ports (WEB=3000 reserved, BIND=0.0.0.0), demo constants, seven per-role passwords
- `.gitignore` (project entry: `*.tsbuildinfo`), `.dockerignore`
- `packages/db/{package.json,tsconfig.json,src/index.ts,src/pool.ts}` — `@ual/db`
- `packages/migrate/{package.json,tsconfig.json,src/cli.ts,src/runner.ts,sql/000_bootstrap.sql,test/runner.spec.ts}` — `@ual/migrate`
- `Dockerfile`, `compose.yaml` — container topology

## Decisions Made
- **Added `@types/pg` (pinned 8.11.10):** the `pg` driver ships no bundled types; under `strict` the `@ual/db`/`@ual/migrate` sources do not type-check without it. Pinned to match the version-pinning policy. (Rule 3 — blocking.)
- **Runner ensures `hub.schema_migrations` via an existence check, not `CREATE TABLE IF NOT EXISTS`:** the bootstrap migration itself creates the table with a plain `CREATE TABLE` (byte-faithful to the spec), so pre-creating it collided. The runner now reads recorded checksums only when `to_regclass('hub.schema_migrations')` is non-null and records the first migration inside 000's own transaction.
- **`cvs` schema/role created in Phase 1** though the CVS service lands in Phase 7 — the grant matrix is one immutable, reviewable file and the runner forbids editing an applied migration. (Recorded, deliberate; consistent with the plan's scope note.)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `@types/pg` to type the pg driver under strict mode**
- **Found during:** Task 1 / Task 2
- **Issue:** `pg` has no bundled type declarations; `packages/db` and `packages/migrate` fail `tsc -b` under `strict` without `@types/pg`.
- **Fix:** Added `@types/pg` pinned to `8.11.10` in the root and package devDependencies.
- **Files modified:** `package.json`, `packages/db/package.json`, `packages/migrate/package.json`, `package-lock.json`
- **Verification:** `npm run build` exits 0 across all workspace packages.
- **Committed in:** `f5d272c` / `d90b8b1`

**2. [Rule 1 - Bug] Migration recorder collided with the bootstrap `CREATE TABLE`**
- **Found during:** Task 2 (first live migration run: `relation "schema_migrations" already exists`)
- **Issue:** The runner pre-created `hub.schema_migrations` with `CREATE TABLE IF NOT EXISTS`, then `000_bootstrap.sql` ran its own `CREATE TABLE hub.schema_migrations` inside the migration transaction, aborting the run.
- **Fix:** Replaced the pre-create with a `to_regclass` existence check; on first run the recorded set is empty and 000 creates the table, and the first record is inserted inside 000's transaction.
- **Files modified:** `packages/migrate/src/runner.ts`
- **Verification:** `up` then `up` again → 1 applied then 0 applied (idempotent), exit 0 both times.
- **Committed in:** `d90b8b1`

**3. [Rule 1 - Bug] Test harness could not drop service roles**
- **Found during:** Task 2 (vitest `resetDatabase`: `role "hub_service" cannot be dropped because some objects depend on it`)
- **Issue:** Service roles still hold `GRANT CONNECT ON DATABASE ual`, a dependency that blocks `DROP ROLE`.
- **Fix:** `resetDatabase` now runs `DROP OWNED BY <role> CASCADE` before `DROP ROLE`, guarded by a `pg_roles` existence check.
- **Files modified:** `packages/migrate/test/runner.spec.ts`
- **Verification:** Both integration tests pass; suite is re-runnable.
- **Committed in:** `d90b8b1`

---

**Total deviations:** 3 auto-fixed (1 blocking dependency, 2 bugs).
**Impact on plan:** All three were necessary for the plan to build and its tests to pass. No scope change — the artifacts, contracts, and success criteria are exactly as specified.

## Issues Encountered
- The plan's `<verify>` for Task 2 used `--reporter=list`, which this vitest (2.1.8) resolves as a module path and errors on. Ran the suite with the default reporter instead — both tests pass. Cosmetic; no functional impact.
- The Task 2 verify depends on `docker compose up -d ual-db`, but `compose.yaml` is authored in Task 3. Verified Task 2 against a standalone `postgres:17.2-alpine` container matching the compose spec (same image, env, published port), then re-ran the full sequence through `compose.yaml` in Task 3. The digest captured from that pull was used to pin the image in compose.

## Known Stubs
None found — `grep` for TODO/FIXME/placeholder/not-implemented across all changed source files returns nothing.

## User Setup Required
None - no external service configuration required. All credentials in `.env` are `demo-only-` synthetic values, committed per TechArch §15.8.

## Next Phase Readiness
- The workspace root, build, database, and migration path exist; every later Phase-1 plan attaches to `compose.yaml` and adds numbered `.sql` files under `packages/migrate/sql/`.
- `@ual/db` and the isolation matrix are ready for the spoke services (F9) and the adapter seam (F8).
- No blockers. Plan 01-06 will add the spoke-name-literal grep gate and wire `arch:check`; plan 01-07 will add `ual-seed`, the five spokes, and `ual-hub` to compose.

## Self-Check: PASSED

- All 12 spot-checked created files exist on disk.
- All three task commits (`f5d272c`, `d90b8b1`, `a09da61`) present in git history.
- Plan-level build check: `npm run build` → exit 0.
- `## Known Stubs` section present: None found.

---
*Phase: 01-separated-spokes-and-the-adapter-seam*
*Completed: 2026-09-15*
