# Deferred Items — Phase 01

Out-of-scope discoveries logged during execution. NOT fixed by the discovering
plan (see execute-plan.md SCOPE_BOUNDARY).

## From plan 01-03

- **`tests/integration/isolation.spec.ts:275` — unused eslint-disable directive**
  (warning, not error). This file belongs to plan 01-01's isolation harness and
  is currently untracked in the working tree; it is not touched by plan 01-03.
  `npm run lint` exits 0 (warnings do not fail the gate). Left for the owning
  plan to clean up.
