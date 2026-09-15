# Deferred / Out-of-Scope Items — Phase 01

Discoveries logged during plan execution that are outside the current plan's
scope. Not fixed here per the execute-plan SCOPE BOUNDARY rule.

## From plan 01-02 (schemas + isolation suite)

- **Root `npm run build` (`tsc -b`) fails on parallel-plan packages.** The root
  `tsconfig.json` (edited by plan 01-03) references `packages/adapter-runtime`
  and `packages/adapter-rest-json-v1`. At the time 01-02 ran:
  - `packages/adapter-runtime/src/log.ts` imports `pino`, which is not yet a
    declared dependency → `TS2307: Cannot find module 'pino'`.
  - `packages/adapter-rest-json-v1/tsconfig.json` does not exist →
    `TS5083: Cannot read file`.
  These are incomplete work-in-progress from the concurrently-running plan 01-03
  and are expected to resolve when that plan completes. Plan 01-02's own packages
  (`@ual/db`, `@ual/migrate`) build cleanly in isolation
  (`npx tsc -b packages/db packages/migrate` → exit 0), which is what 01-02's
  verification relies on. No action taken by 01-02.
