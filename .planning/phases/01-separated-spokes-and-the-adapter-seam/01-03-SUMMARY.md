---
phase: 01-separated-spokes-and-the-adapter-seam
plan: 03
subsystem: api
tags: [adapter, spoke, jose, ed25519, jwt, pino, circuit-breaker, typescript, resilience]

# Dependency graph
requires:
  - phase: 01-01
    provides: npm-workspaces root, tsconfig.base.json (strict / noUncheckedIndexedAccess / exactOptionalPropertyTypes), build/test scripts
provides:
  - "@ual/adapter-contract — the compiler-checked SpokeAdapter interface (8 operations), the 13-class AdapterError taxonomy, and RegistryRecord"
  - "@ual/assertions — deterministic Ed25519 audience-bound principal assertions (mint/verify) and 15-min operator tokens"
  - "@ual/adapter-runtime — invoke() applying deadline/retry/backoff/circuit/schema-validation/classification outside every adapter; Circuit state machine; IssueSink + CircuitStateStore ports"
  - "@ual/adapter-rest-json-v1 — the REST_JSON_V1 adapterType all demo spokes use, registry-driven with zero spoke-identifier literals"
affects: [01-04, 01-06, 01-07, F9-simulated-spokes, F12-application-registration]

# Tech tracking
tech-stack:
  added: [jose@5.9.6, pino@9.5.0]
  patterns:
    - "Resilience applied OUTSIDE the adapter (invoke wraps every call); adapters never retry"
    - "Ports over implementations (IssueSink, CircuitStateStore) keep runtime free of @ual/db and unit-testable"
    - "Registry-driven endpoint/status mapping — no switch on application id, proven by a literal-grep gate"
    - "Business rejection resolves (ActionResult REJECTED); transport failure throws (AdapterError) — separated at the type level"

key-files:
  created:
    - packages/adapter-contract/src/{types,describe,errors,adapter,registry,index}.ts
    - packages/assertions/src/{keys,mint,verify,index}.ts
    - packages/adapter-runtime/src/{invoke,circuit,classify,backoff,validate,issues,log,index}.ts
    - packages/adapter-rest-json-v1/src/{adapter,normalize,index}.ts
  modified:
    - tsconfig.json (added the four package project references)

key-decisions:
  - "RECORDED CONFLICT resolved: implement all EIGHT SpokeAdapter operations (FR-F08a-01 / TechArch §5.1 win on WHAT), not the roadmap's six; getWorkItemSummary + establishContext/revokeContext are optional, present iff declared in capabilities"
  - "RegistryRecord lives in @ual/adapter-contract in Phase 1 (TechArch places it in @ual/contracts, a Phase 2 BFF deliverable); a file comment flags the future move"
  - "verify.ts resolves the public key lazily (Rule 1 fix) so the deterministic seed is read at first use rather than module-load time"
  - "validate.ts ships a shallow structural validator here; exhaustive TypeBox schemas remain @ual/contracts' Phase 2 job"

patterns-established:
  - "Deterministic Ed25519 keypair from sha256(UAL_ASSERTION_KEY_SEED) wrapped in the RFC 8410 PKCS#8 prefix — hub mints, spokes verify across processes, reset-safe"
  - "Circuit is one instance per applicationId with a healthCheck bypass in every state; bounds read from the registry row, never constants"

# Metrics
duration: 20min
completed: 2026-09-15
---

# Phase 01 Plan 03: The Adapter Seam Summary

**The adapter seam in four packages: a compiler-checked SpokeAdapter contract, deterministic Ed25519 audience-bound assertions, a resilience runtime (deadline/retry/backoff/circuit/validation) applied outside every adapter, and the single REST_JSON_V1 adapterType — the machinery that makes "onboard the sixth application by configuration, not code" true.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-09-15T15:42:00Z
- **Completed:** 2026-09-15T15:58:00Z
- **Tasks:** 3
- **Files modified:** 30 created + 1 modified

## Accomplishments
- One `SpokeAdapter` interface transcribed verbatim from TechArch §5.1 with all eight operations; the closed 13-class `AdapterError` taxonomy; `RegistryRecord` with all twelve resilience-policy fields — `@ual/adapter-contract` compiles under `strict` with **zero runtime dependencies**.
- `@ual/assertions`: a deterministic Ed25519 keypair from the seed, EdDSA principal assertions (`aud` = applicationId, 5-min exp) that reject sideways replay, 15-min operator tokens, and a `verifyPrincipal` matching the spoke-kit contract. `caseAssignments` is never minted.
- `@ual/adapter-runtime`: `invoke()` gates the circuit (healthCheck exempt), enforces a per-attempt deadline budget, refuses to auto-retry `performAction`, rewrites a mutating timeout to `ADAPTER_INDETERMINATE`, validates every success shape, and records issues for everything except business outcomes. `Circuit` is a hand-written CLOSED/OPEN/HALF_OPEN machine with a health bypass. `IssueSink` and `CircuitStateStore` are ports, so the package carries no `@ual/db` and no HTTP client.
- `@ual/adapter-rest-json-v1`: `RestJsonV1Adapter` speaks HTTP in exactly one method via Node's built-in `fetch`; endpoints and status maps come from the registry row; no spoke-identifier literal appears in `src/`; a 422 resolves as a sanitized business rejection while a 503 throws; a malformed list row is dropped alone.

## Task Commits

1. **Task 1: @ual/adapter-contract + @ual/assertions** — `2a62ed3` (feat)
2. **Task 2: @ual/adapter-runtime** — `5914200` (feat)
3. **Task 3: @ual/adapter-rest-json-v1** — `dd64983` (feat, also carried lint-clean removals in adapter-runtime)

## Files Created/Modified
- `packages/adapter-contract/src/*` — the contract: `types`, `describe`, `errors`, `adapter`, `registry`, `index`
- `packages/assertions/src/*` — `keys` (deterministic Ed25519), `mint`, `verify`, `index`; `test/assertions.spec.ts`
- `packages/adapter-runtime/src/*` — `invoke`, `circuit`, `classify`, `backoff`, `validate`, `issues`, `log`, `index`; `test/{circuit,invoke}.spec.ts`
- `packages/adapter-rest-json-v1/src/*` — `adapter`, `normalize`, `index`; `test/adapter.spec.ts`
- `tsconfig.json` — added the four package project references

## Decisions Made
- **Six-vs-eight operations conflict resolved toward eight.** The roadmap/US-074 name a six-operation contract; FR-F08a-01 and TechArch §5.1 specify eight. Per FRD-wins-on-WHAT, all eight are implemented: operations 1–4, 6, 7 mandatory; `getWorkItemSummary` (5) and `establishContext`/`revokeContext` (8) optional, present iff declared in `capabilities`. The plan-01-07 conformance suite asserts exactly this.
- **`RegistryRecord` placed in `@ual/adapter-contract`** for Phase 1 (TechArch's `@ual/contracts` arrives with the Phase 2 BFF); a file comment marks the eventual move/re-export.
- **Lazy public-key resolution in `verify.ts`** so the deterministic seed is read at first use, not at module-load — necessary for cross-process and test ordering.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] verify.ts evaluated the public key at module load, before the seed was available**
- **Found during:** Task 1 (assertions test run)
- **Issue:** A module-level `const hubPublicKey = getPublicKey()` derived the key at import time, which threw `UAL_ASSERTION_KEY_SEED is not set` before any test could set it and would equally fail if the env var were populated after import in production.
- **Fix:** Resolve `getPublicKey()` lazily inside `verifyPrincipal`. jose treats the `KeyObject` identically; behaviour is unchanged, ordering is fixed.
- **Files modified:** packages/assertions/src/verify.ts
- **Verification:** All 6 assertion tests pass.
- **Committed in:** `2a62ed3` (Task 1 commit)

**2. [Rule 1 - Bug] RequestInit body typed `string | undefined` under exactOptionalPropertyTypes**
- **Found during:** Task 3 (adapter build)
- **Issue:** `fetch(url, { body: opts.body ? ... : undefined })` fails to compile under `exactOptionalPropertyTypes` because `body` cannot be `undefined`.
- **Fix:** Build the `RequestInit` object and assign `body` only when present.
- **Files modified:** packages/adapter-rest-json-v1/src/adapter.ts
- **Verification:** `npm run build` exits 0.
- **Committed in:** `dd64983` (Task 3 commit)

**3. [Rule 1 - Bug] Unused bindings failed the lint gate**
- **Found during:** Post-Task-3 `npm run lint`
- **Issue:** `AdapterContext` import + `_err` parameter in circuit.ts and the `mutating` parameter in classify.ts were unused; the eslint config has no `argsIgnorePattern`, so even underscore-prefixed args error.
- **Fix:** Removed the unused import and parameters; updated the one `circuit.recordFailure()` call site and the `classify(...)` call site accordingly.
- **Files modified:** packages/adapter-runtime/src/{circuit,classify,invoke}.ts
- **Verification:** `npm run lint` exits 0 with 0 errors; 30 tests still pass.
- **Committed in:** `dd64983` (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 1 — bugs).
**Impact on plan:** All three were correctness/compilation fixes required to satisfy the plan's own build and lint gates. No scope creep; the contract shapes and behaviours are exactly as specified.

## Known Stubs
None found. A `TODO|FIXME|placeholder|not-implemented` scan across all four packages' `src/` returned nothing. `validate.ts` ships a deliberately shallow structural validator (the exhaustive TypeBox schemas are a documented Phase 2 `@ual/contracts` deliverable), which is a scoped design boundary, not an incomplete implementation — the plan's `<verification>` for a malformed-response → `ADAPTER_CONTRACT_ERROR` passes with it.

## Issues Encountered
None blocking. One out-of-scope lint **warning** exists in `tests/integration/isolation.spec.ts:275` (an untracked file owned by plan 01-01/01-02, not touched here); it is a warning, `npm run lint` exits 0, and it is logged in `deferred-items.md` per the scope boundary.

## Environment Note
The sandbox runs Node **v20.20.2**, not the `engines.node` 22.11.0 the repo pins. Everything this plan uses (built-in `fetch`, `AbortSignal.timeout`, `require()` of the ESM contract dist for the verify probes) works on v20, so all builds/tests/lint pass. Flagged so a later plan relying on a Node-22-only API is not surprised.

## Deferred Issues
None from this plan's own scope — all three fast-check gates (build, all four unit suites, lint) pass. The 3-attempt fix cap was never approached.

## Next Phase Readiness
- The adapter seam is complete and exercised: `npm run build` (all packages compile under strict), 30 unit tests passing across the four packages, `npm run lint` clean.
- **Ready for 01-04** (`@ual/spoke-kit`, which consumes `verifyPrincipal`/`PrincipalRejected` and the operator-token scope claim) and the five simulated spokes (F9), which implement against `SpokeAdapter`.
- Plan 01-06 will wire the pg-backed `IssueSink` and `CircuitStateStore` and ship the CI grep gate; plan 01-07's conformance suite runs `RestJsonV1Adapter` against five registry rows.

## Self-Check: PASSED
- Created files verified on disk (7 spot-checked, all FOUND).
- Task commits verified in git log (`2a62ed3`, `5914200`, `dd64983` all FOUND).
- Plan-level build ran: `npm run build` → exit 0.
- `npm run lint` → exit 0 (0 errors); all four unit suites → 30 passed / 0 failed.
- `## Known Stubs` present; no blocking stub.

---
*Phase: 01-separated-spokes-and-the-adapter-seam*
*Completed: 2026-09-15*
