## 14. Testing Architecture

The test suite exists to protect four claims whose failure would invalidate the demonstration: **the flagship workflow works**, **authorization is enforced server-side**, **adapters behave uniformly**, and **the interface is accessible**. Everything else is supporting coverage.

Two principles shape the approach. First, **tests are generated from declarations wherever possible** — the role matrix generates RBAC tests, the route table generates audit-coverage tests, the screen inventory generates the crawl — so adding a permission or an endpoint without adding its test is not possible. Second, **a flaky test is quarantined and fixed, never retried into passing**; a suite that is retried until green protects nothing.

---

### 14.1 The Pyramid

| Tier | Tool | Count (approx.) | Runtime | What it protects |
|---|---|---|---|---|
| Unit | Vitest 2.1 | ~400 | < 30 s | PDP decisions, normalization, circuit state machine, hash chain, scope derivation, date offsetting |
| Integration (API) | Vitest + `fastify.inject()` | ~250 | < 90 s | Full hook chain per endpoint: session → CSRF → reserved fields → validation → PDP → handler → audit |
| Adapter conformance | `@ual/conformance` | 10 × 6 adapters | < 60 s | The adapter contract, per adapter, standalone-runnable |
| Integration (DB) | Vitest + real Postgres | ~40 | < 30 s | Grants, isolation, append-only audit, seed validation |
| E2E | Playwright 1.49 | ~25 | < 6 min | Flagship, RBAC, degraded, registration, keyboard-only |
| Accessibility | `@axe-core/playwright` | every route × every role × 5 states | < 5 min | WCAG 2.1 AA gate |
| Crawl | Playwright | every route × 4 roles | < 3 min | "Every button works" |

`fastify.inject()` is the reason the integration tier is worth its weight: it dispatches a request through the **complete** hook chain without binding a port, so an API test genuinely exercises the PDP and the audit interceptor rather than a mocked approximation of them.

---

### 14.2 Flagship End-to-End Test

The single most important test in the repository, and it drives exactly the path in the demo script — so **a passing test means a working demo**.

```ts
// tests/e2e/flagship.spec.ts
test('investigator resolves a PVQ issue from an eApp case; both systems update', async ({ page }) => {
  await reset();

  // Sign in ONCE, via CAC/PIV, as the primary persona
  await page.goto('/');
  await page.getByRole('button', { name: /CAC\/PIV/ }).click();
  await page.getByRole('button', { name: /Marcus Vale/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/dashboard/i);

  // Queue → eApp case → related PVQ issue, all inside the unified shell
  await page.getByRole('link', { name: 'Work Queue' }).click();
  await page.getByRole('link', { name: /Case A-1042/ }).click();
  await expect(page.getByText('1 outstanding issue')).toBeVisible();
  await page.getByRole('link', { name: /ISS-2207/ }).click();

  // Continuity: same shell, breadcrumb carries case context, NO login prompt
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }))
    .toContainText('eApp Case A-1042');
  await expect(page.locator('form[action*="login"]')).toHaveCount(0);

  // Resolve
  await page.getByLabel('Substantiated').check();
  await page.getByLabel(/Resolution narrative/).fill(NARRATIVE);
  await page.getByLabel(/I have reviewed the flagged answer/).check();
  await page.getByRole('button', { name: 'Resolve issue' }).click();

  // Dual-system confirmation, read back from BOTH spokes independently
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Resolution complete');
  const results = page.getByRole('table', { name: 'Results in each connected system' });
  await expect(results).toContainText('Resolved — Substantiated');
  await expect(results).toContainText('No outstanding issues');

  // ---- Assertions against each spoke's OWN API, bypassing the hub entirely ----
  const pvq = await spokeGet('PVQ', '/issues/ISS-2207');
  expect(pvq.status).toBe('RESOLVED_SUBSTANTIATED');
  expect(pvq.disposition).toBe('SUBSTANTIATED');
  expect(pvq.resolvedBy).toBe('Marcus Vale');
  expect(pvq.resolutionNarrative).toBe(NARRATIVE);

  const eapp = await spokeGet('EAPP', '/cases/CASE-A-1042');
  expect(eapp.outstandingIssueRefs).not.toContain('ISS-2207');
  expect(eapp.outstandingIssueCount).toBe(0);
  expect(eapp.caseState).toBe('REVIEW_COMPLETE_PENDING_ADJUDICATION');

  // ---- Continuity properties ----
  const session = await api('/api/session');
  expect(session.authEventCount).toBe(1);                       // exactly one sign-in
  expect(spokeOriginRequests(page)).toHaveLength(0);            // browser never hit a spoke
  expect(loginFormsSeenAfterSignIn(page)).toBe(0);
  expect(identifiersTypedByTest()).toEqual([NARRATIVE]);        // no IDs re-entered

  // ---- Audit chain ----
  const chain = await api(`/api/audit/chain/${correlationId}`);
  expect(chain.records.length).toBeGreaterThanOrEqual(5);
  expect(chain.summary).toMatch(/resolved PVQ issue ISS-2207 against eApp case A-1042/);
  expect(chain.records.map(r => r.actionType)).toEqual(expect.arrayContaining([
    'WORK_ITEM_VIEWED', 'RELATED_ITEMS_RESOLVED', 'ORCHESTRATION_STARTED',
    'ISSUE_RESOLVED', 'CASE_ISSUE_CLEARED', 'ORCHESTRATION_COMPLETED']));

  // ---- Banner and accessibility on every screen visited ----
  for (const url of visitedUrls(page)) {
    await page.goto(url);
    await expect(page.getByText(/Demo — Synthetic Data Only/)).toBeVisible();
    const scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations.filter(v => ['serious','critical'].includes(v.impact!))).toHaveLength(0);
  }
});
```

**The partial-failure variant** injects eApp `UNAVAILABLE` after the PVQ leg commits and asserts:

```ts
expect(response.status()).toBe(207);
expect(body.overallOutcome).toBe('PARTIALLY_COMPLETED');
expect(await page.textContent('main')).not.toMatch(/\bsuccess/i);   // R-06, literally
expect(body.systems.find(s => s.applicationId === 'PVQ')!.outcome).toBe('COMMITTED');
expect(body.systems.find(s => s.applicationId === 'EAPP')!.outcome).toBe('FAILED');
await expect(page.getByRole('button', { name: /Retry eApp update/ })).toBeVisible();

await clearInjection('IM');                             // restore eApp
await expect.poll(() => txState(txId), { timeout: 200_000 }).toBe('COMPLETED');  // auto-converges
expect((await spokeGet('EAPP', '/cases/CASE-A-1042')).outstandingIssueCount).toBe(0);
```

**Determinism gate:** the whole flagship suite runs three consecutive times with a reset between each and must produce identical results.

---

### 14.3 RBAC Enforcement Tests

**Generated from the role matrix**, so a permission added without a test is impossible.

```ts
// tests/integration/rbac.matrix.spec.ts
for (const role of ROLES) {
  for (const action of ALL_ACTIONS) {
    const permitted = roleMatrix.permits(role, action);
    test(`${role} ${permitted ? 'may' : 'may NOT'} ${action}`, async () => {
      const res = await asRole(role).call(endpointFor(action));
      permitted ? expect(res.statusCode).toBeLessThan(400)
                : expect(res.statusCode).toBe(403);
      if (!permitted) {
        const rec = await lastAuditRecord();
        expect(rec.actionType).toBe('AUTHZ_DENIED');
        expect(rec.outcome).toBe('DENIED');
      }
    });
  }
}
```

**Direct API negative paths, UI bypassed entirely:**

| Test | Expected |
|---|---|
| Applicant → Investigator-only endpoint | 403, audited |
| Investigator → another unit's resource | 403, `ATTR-INV-01` in the audit record |
| T3 investigator → T5 case | 403, `ATTR-INV-03` in the audit record |
| Applicant → another subject's item by ID | 403, **byte-identical** to a fabricated ID |
| Administrator → any work item | 403 |
| `role` / `activeRole` / `principalId` in body or query | 400, zero privilege effect |
| Mutation without CSRF token | 403, audited |
| Edited session cookie | 401, never an escalation |
| Action absent from the server-computed list | 403 |
| Stale `stateVersion` | 409 |
| Spoke API called directly with subject A's scope | Zero rows belonging to subject B |

**Non-enumeration** is asserted quantitatively: forbidden-ID and fabricated-ID responses are compared byte-for-byte apart from the correlation ID, and response times are compared against the 120 ms normalization floor.

**Coverage requirement:** 100% of endpoints have at least one unauthorized-access negative test. The endpoint list comes from the route table, so a new endpoint without one fails the build.

---

### 14.4 Adapter Conformance

`packages/conformance` runs standalone against any adapter:

```bash
./run.sh conformance --adapter=CVS --endpoint=http://localhost:7106
```

| # | Assertion |
|---|---|
| 1 | Operations 1–7 present; optional operations present **iff** declared in `describe()` |
| 2 | `describe()` validates; **every** native status is mapped; every `requiredPermission` exists in the role matrix |
| 3 | Every returned `WorkItem` satisfies the normalized shape; `workItemId` formatting; priority and status mapping correct |
| 4 | Scope enforcement: a scoped list for subject A returns zero rows for subject B; a scoped get for a foreign resource returns `NOT_FOUND`/`FORBIDDEN`, never data |
| 5 | Deadline honouring: a call with a 100 ms deadline aborts within 150 ms |
| 6 | Error taxonomy: induced connection refusal, timeout, 4xx, 5xx, and malformed response each produce the correct `AdapterError` class |
| 7 | Idempotency: `performAction` repeated with one key applies once |
| 8 | `stateVersion` changes after mutation, stable otherwise |
| 9 | No cross-spoke access: outbound calls target only this application's base endpoint |
| 10 | Health semantics: `DOWN` promptly when stopped, `HEALTHY` after restart |

Plus behavioral assertions across all six adapters: timeout with a `SLOW` spoke still returns the aggregate within budget; transient read failures retry per policy while `performAction` timeouts **never** do; the circuit opens at the threshold, fails fast, continues health probing, and closes on a successful probe; malformed items are dropped **individually** with an issue logged while the batch still renders.

Items 1, 2, and 6 run **live during registration**, so a non-conformant application cannot be registered at all.

---

### 14.5 Audit Coverage and Immutability

| Test | Assertion |
|---|---|
| Coverage | **Every mutating endpoint** (derived from the route table) produces **exactly one** record of the expected action type. A new mutating endpoint without an audit assertion fails the build. |
| Ordering | The record exists before the success response is observable — asserted by failing the audit store and confirming the mutation reports failure |
| Immutability (routes) | Route enumeration finds no `PUT`/`PATCH`/`DELETE` under `/api/audit` |
| Immutability (code) | Static analysis finds no `UPDATE`/`DELETE` statement against `audit_events` |
| Immutability (**grant**) | `UPDATE hub.audit_events` as `hub_service` raises `42501` |
| Integrity | The hash chain verifies across a full demo run; altering a row *outside* the application fails verification **at that sequence number** |
| Sequence | No gaps across a full run |
| Scoping | A mission user's audit query returns zero records authored by another actor |

---

### 14.6 Accessibility Verification

**The gate:** axe-core runs against **every route, for every role**, and the build **fails on any serious or critical violation**. Moderate and minor are reported and tracked with owners.

Coverage deliberately includes non-default states, because those are the screens most likely to have been built carelessly:

| State | How reached |
|---|---|
| Error screens | SCR-30 via a denied navigation; SCR-31 via a fabricated URL; SCR-32 via an injected client exception |
| Empty states | The zero-item applicant persona |
| Degraded states | Failure injection on IM |
| Loading states | `SLOW` injection, scanned mid-load |
| Open modals | Certificate picker, timeout warning, confirmation dialogs |
| Forms in error | Submitting the resolution form empty |

**Keyboard smoke test** (Playwright, no axe): for each role, tab through every route asserting every interactive control reachable, focus always visible, tab order matching DOM order, and no keyboard trap. Modals trap focus while open, close on Escape, and restore focus to the invoking control. Invalid form submission moves focus to the error summary and its links focus their fields. The skip link is present, first focusable, and moves focus to `<main>` on every route. **The flagship workflow is driven keyboard-only, end to end.**

**Documented manual pass**, keyboard-only and screen-reader, performed before the demo and recorded with date, tooling, and findings. Accessibility review is a merge gate: a change introducing a violation does not merge.

---

### 14.7 Link and Control Integrity Crawl

The automated form of "every button works" — the mechanical guarantee behind the product principle that a non-functional control in a demo is worse than a missing one.

For each role, the crawl visits every navigation item and every route in the screen inventory and asserts:

1. HTTP 200 or a **designed** error screen
2. Non-empty `<main>`
3. A unique page `<title>`
4. Exactly one `<h1>`
5. The demo banner present — including with a modal open and an `EMERGENCY` announcement active, and with no close control and no `display:none`/`visibility:hidden`/zero-height computed style
6. Every interactive control has a handler, a destination, or a documented disabled reason — **a control that does nothing fails the build**
7. Zero links to non-hub origins on authenticated screens
8. Zero prohibited copy: stack-trace patterns (`at `, `.js:`, `Traceback`), exception class names, hostnames, IPs, port numbers, SQL fragments, raw HTTP reason phrases, and the prohibited authentication verbs ("verified", "validated", "authenticated against", "trusted certificate")
9. Every `entitlements.navigation[].href` resolves

---

### 14.8 Architecture Conformance Tests

Tests that protect the architecture itself, not its behavior. These are what keep the four structural properties from eroding.

| Test | Assertion | Protects |
|---|---|---|
| No hard-coded application names | Grep for `EAPP`, `IEP`, `PVQ`, `PDT`, `IM` in hub core outside seed, tests, and adapter packages returns zero | Registry-driven behavior |
| No spoke HTTP outside adapters | No `fetch`/HTTP client call site targeting a spoke endpoint outside `packages/adapter-*` | The adapter is the only path |
| Hub core imports no adapter | ESLint `no-restricted-imports` | Module boundaries |
| Orchestration engine names no spoke | The engine source contains no reference to PVQ or eApp | Generic saga |
| No cross-schema FK | Schema introspection over `information_schema` | Isolation |
| 42 cross-schema read attempts fail | Every role × every foreign schema raises `42501` | Isolation |
| Every route declares action + schemas | Boot-time contract check | PDP cannot be bypassed |
| Every mutating route declares an audit type | Boot-time contract check | Audit cannot be forgotten |
| Every emitted error code exists in `Y2` | Boot-time check | Error contract |
| No visual literals | Stylelint over all SCSS and component styles | Token-only theming |
| OpenAPI matches implementation | Generated spec compared against route declarations | Documentation cannot drift |

---

### 14.9 Determinism and Environment

1. Tests run against the **same deterministic seed as the demo**, with a reset between suites. A failure therefore means a real defect rather than data drift.
2. Resilience tests use **failure injection** rather than stopping processes, so suites stay parallelizable; the process-stop path is exercised by one dedicated test per spoke.
3. Tests never depend on wall-clock `now` for overdue assertions; they use the seed reference date.
4. The whole suite produces identical results across three consecutive runs.
5. **Flaky tests are quarantined and fixed, never retried into passing.**

---

### 14.10 Reviewer-Readable Results

CI produces a human-readable summary committed as an artifact, so a reviewer can read it without running anything:

```
DCSA-UAL — Verification Summary                     Build 2026-09-14T09:12Z

PROTECTED CLAIMS
  ✓ Flagship workflow            flagship.spec.ts                    PASS (3/3 runs)
  ✓ RBAC enforcement             rbac.matrix.spec.ts (412 cases)     PASS
  ✓ Adapter behavior             conformance × 6 adapters (60)       PASS
  ✓ Accessibility                axe × 38 routes × 4 roles × 5 states PASS (0 serious/critical)

SUCCESS METRIC TRACEABILITY
  SM-01 cross-app workflow       flagship.spec.ts                    PASS
  SM-02 one auth event           flagship.spec.ts:authEventCount     PASS
  SM-03 dual-system verified     flagship.spec.ts:spokeGet × 2       PASS
  SM-05 zero dead links          crawl.spec.ts (4 roles × 38 routes) PASS
  SM-07 zero a11y violations     axe.spec.ts                         PASS
  SM-11/12 sixth-app onboarding  registration.spec.ts                PASS
  SM-13 namespace isolation      isolation.spec.ts (42 probes)       PASS
  SM-15/16/17 degrade + recover  resilience.spec.ts (5 spokes)       PASS
  SM-18 server-side denial       rbac.negative.spec.ts               PASS
  SM-19 audit on every mutation  audit.coverage.spec.ts (31 routes)  PASS
  SM-20 correlated chain         flagship.spec.ts:chain              PASS
  SM-22 repeatability            flagship × 3 with reset             PASS

ACCESSIBILITY DETAIL            0 critical · 0 serious · 2 moderate · 5 minor
  moderate  /admin/health       color-contrast on the latency sparkline  (owner: FE, due 09-18)
  moderate  /admin/integration-issues  table caption verbosity           (owner: FE, due 09-18)

REQUIREMENTS WITHOUT TEST COVERAGE
  (none)
```

A traceability table maps every FRD requirement ID to its verifying tests and **flags requirements with no test** rather than leaving them silently uncovered. A gap that is visible is a decision; a gap that is invisible is an accident.

---
