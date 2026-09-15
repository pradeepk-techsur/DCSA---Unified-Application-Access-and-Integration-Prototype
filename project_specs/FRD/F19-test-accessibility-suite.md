## F19 — Automated Test and Accessibility Verification Suite

**Traces to:** PRD F19 (P1); NFR-01, NFR-04, NFR-06, NFR-07, NFR-14, SM-05, SM-06, SM-07, SM-18, SM-19, SM-25. **Screens:** none (CI surface), plus the reviewer-readable report.

**Description:** Automated coverage for the three things whose failure would invalidate the demonstration — the flagship workflow, RBAC enforcement, and adapter behavior — plus automated accessibility scanning across every route. Each requirement below names what is asserted, so "we have tests" is replaced by "these specific claims are protected."

**Terminology:**
- **E2E** — a browser-driven test exercising the real UI against real services.
- **Negative path** — a test asserting that a forbidden thing is refused.
- **Control-integrity crawl** — the automated form of "every button works."

---

### FR-F19-01 — Flagship workflow end-to-end test

**Processing / business rules:**
1. Drives the full browser path of `FR-F18-05` steps 1–13 against a freshly reset environment.
2. Asserts all ten continuity properties in `FR-F07a-06`, specifically:
   - exactly one `AUTH_SUCCESS` audit record for the session (SM-02)
   - zero document requests to any spoke origin
   - zero login forms after initial sign-in
   - zero identifiers typed by the test beyond the narrative text (SM-04)
   - post-state asserted in **both** eApp and PVQ via their own APIs, not through the hub (SM-03)
   - one correlated audit chain of ≥5 records (SM-20)
   - the demo banner present on every screen visited
   - zero serious or critical accessibility violations on SCR-13, 15, 16, 20
3. Asserts every post-condition in `FR-F07b-05` field by field.
4. Runs the partial-failure variant: with eApp injected `UNAVAILABLE` after the PVQ leg, asserts 207 `ORCHESTRATION_PARTIAL`, the absence of the word "success" in the response and rendered page, the presence of both per-system outcomes, and automatic convergence after recovery.
5. Runs three consecutive times with a reset between, asserting identical results (SM-22).

**Acceptance criteria:**
- AC-1: The test passes in CI and fails on any regression to any asserted property.
- AC-2: The partial-failure variant passes.

---

### FR-F19-02 — RBAC enforcement tests

**Processing / business rules:**
1. **Matrix coverage.** For each of the four roles, every action in `FR-F02-02` is exercised: permitted actions succeed, non-permitted actions return 403. This is a generated test from the role matrix, so adding a permission without a test is impossible.
2. **Direct API negative paths**, bypassing the UI entirely:
   - Applicant calling an Investigator-only endpoint → 403, audited (PRD F2 acceptance signal, SM-18)
   - Investigator requesting another unit's resource → 403
   - `T3` investigator requesting a `T5` case → 403 with `ATTR-INV-03` in the audit record
   - Applicant requesting another subject's item by ID → 403, byte-identical to a fabricated ID
   - Administrator requesting a work item → 403
   - Any request supplying `role`/`activeRole`/`principalId` in body or query → 400, no privilege effect
   - Mutating request without CSRF token → 403
   - Request with an edited session cookie → 401
3. **Non-enumeration.** Forbidden-ID and fabricated-ID responses compared byte-for-byte apart from the correlation ID, and response times compared against the normalization floor.
4. **Action-level.** Posting an action absent from the server-computed list → 403; posting with a stale `stateVersion` → 409.
5. **Spoke-level scope.** Calling each spoke's API directly with `mode: SUBJECT` for subject A returns zero rows for subject B (`FR-F02-04` AC-1).
6. **Denial auditing.** Every denial above produces exactly one `AUTHZ_DENIED` audit record with the correct `policyRuleId`.

**Acceptance criteria:**
- AC-1: 100% of endpoints have at least one unauthorized-access negative test (PRD F10 acceptance signal, SM-18).
- AC-2: All denials are audited and non-enumerable.

---

### FR-F19-03 — Adapter conformance and behavior tests

**Processing / business rules:**
1. Runs the full conformance suite (`FR-F08a-08`) against all six adapters.
2. **Timeout behavior:** with a spoke injected `SLOW` beyond its timeout, the adapter aborts at the deadline and the aggregate request still returns within budget.
3. **Retry behavior:** a transient failure on an idempotent read is retried per policy; a `performAction` timeout is **never** retried; retries respect the deadline.
4. **Circuit behavior:** `circuitFailureThreshold` consecutive failures open the circuit; data calls then fail fast without touching the spoke; health probing continues; a successful probe closes it.
5. **Normalization:** every native status maps to exactly one category; malformed items are dropped individually with an issue logged, and the batch still renders.
6. **Error taxonomy:** each class in `FR-F08a-06` is induced and asserted to produce its specified hub status, code, and user-facing message.
7. **Idempotency:** repeated `performAction` with one key applies once, at both hub and spoke.
8. **Isolation:** each spoke's credentials cannot read another namespace; no spoke-to-spoke traffic occurs (SM-13).
9. **Registry independence:** the hard-coded-application-name grep check (`FR-F08b-02` rule 1) passes.

**Acceptance criteria:**
- AC-1: All six adapters pass conformance.
- AC-2: Every error class is covered.
- AC-3: Isolation assertions pass.

---

### FR-F19-04 — Resilience tests

**Processing / business rules:**
1. For **each** of the five spokes in turn, forced offline: the queue and dashboard render partial results with a named, quantified degraded warning, and **no error page appears anywhere in the application** (NFR-09, SM-15, SM-16).
2. A fault-injection crawl visits every route for every role with one spoke down and asserts: HTTP 200 or a designed error screen, a non-empty `<main>`, the demo banner present, and zero uncaught client errors.
3. All-sources-down: the queue returns 200 with the all-unavailable empty state, never a 500.
4. Recovery: restoring each spoke clears the warning and restores data within 30 seconds without reload or re-authentication (SM-17).
5. Action pre-disabling: with a target system down, the relevant action is disabled with its reason, and posting it anyway is refused.
6. Global error boundary: an injected client-side exception renders SCR-32 inside the shell with working exits.

**Acceptance criteria:**
- AC-1: All five single-spoke outage scenarios pass with zero error pages.
- AC-2: The recovery assertion passes for each spoke.

---

### FR-F19-05 — Audit coverage and immutability tests

**Processing / business rules:**
1. **Coverage:** every mutating endpoint is invoked and asserted to produce exactly one audit record of the expected action type (SM-19). The endpoint list is derived from the route table, so a new mutating endpoint without an audit assertion fails the build.
2. **Ordering:** the audit record exists before the success response is observable — asserted by failing the audit store and confirming the mutation reports failure (`FR-F13-01`).
3. **Immutability:** route enumeration finds no PUT/PATCH/DELETE under `/api/audit`; static analysis finds no UPDATE/DELETE statement against `audit_events`; a direct attempt using the application credential is refused by the database grant (NFR-07).
4. **Integrity:** the hash chain verifies across a full demo run; manually altering a row causes verification to fail at that sequence number.
5. **Sequence:** no gaps across a full run.
6. **Correlation:** the flagship chain assertion (`FR-F19-01`).
7. **Scoping:** a mission user's audit query returns zero records authored by another actor.

**Acceptance criteria:**
- AC-1: 100% of mutating endpoints produce exactly one record (SM-19).
- AC-2: No application path can modify or delete a record (NFR-07).

---

### FR-F19-06 — Automated accessibility scan

**Processing / business rules:**
1. axe-core (or equivalent) runs against **every route, for every role**, in CI.
2. Coverage includes non-default states: error screens (SCR-30, 31, 32), empty states (via the zero-item applicant), degraded states (via failure injection), loading states, open modals, and forms in their error state. Scanning only happy paths would miss precisely the screens most likely to be built carelessly.
3. The build **fails** on any serious or critical violation (SM-07, NFR-01). Moderate and minor violations are reported and tracked with owners.
4. Scan results are published as a reviewer-readable report (`FR-F19-09`).
5. The scan runs on every pull request, not only on main — accessibility regressions are cheapest to fix before merge.

**Acceptance criteria:**
- AC-1: Zero serious or critical violations across all routes and roles (SM-07).
- AC-2: Non-default states are included in coverage.

---

### FR-F19-07 — Keyboard navigation smoke test

**Processing / business rules:**
1. For each role, tabs through every route asserting: every interactive control is reachable, focus is always visible (computed outline or equivalent present), tab order matches DOM order, and no keyboard trap exists.
2. Modals: focus is trapped while open, Escape closes, focus returns to the invoking control.
3. Forms: submitting invalid input moves focus to the error summary and its links focus their fields.
4. Skip link: present, first focusable, and moves focus to `<main>` on every route.
5. The flagship workflow is driven keyboard-only end to end (SM-08).

**Acceptance criteria:**
- AC-1: The keyboard-only flagship run passes.
- AC-2: Zero unreachable primary controls and zero traps.

---

### FR-F19-08 — Link and control integrity crawl

**Description:** The automated form of "every button works" — the mechanical guarantee behind SM-05 and SM-06.

**Processing / business rules:**
1. For each role, crawls every navigation item and every route in the screen inventory (`FR-F03-02`) asserting: HTTP 200 or a designed error screen, a non-empty `<main>`, a unique page `<title>`, exactly one `<h1>`, and the demo banner present (NFR-13, SM-10).
2. Enumerates every interactive control on every route and asserts each has a handler, a destination, or a documented disabled reason. A control that does nothing fails the build (SM-06).
3. Asserts zero links to non-hub origins in authenticated screens (`FR-F01-03`).
4. Asserts the demo banner has no close control and is not removed from the accessibility tree, **evaluating accessible text rather than visible text** so the permitted <640px lede truncation (`FR-F03-03` rule 3a) cannot fail a conformant build — run at 320px, 768px and 1280px, including with an `EMERGENCY` announcement active and a modal open (`FR-F15-05`). Additionally asserts the ≤ `units(15)` chrome budget at 320×568 and that SCR-11's status sentence is above the fold (SM-25).
5. Scans user-facing copy on every route for prohibited content: stack-trace patterns, exception class names, hostnames, ports, SQL fragments, and the prohibited authentication verbs (`FR-F00-08`).
6. Asserts every `entitlements.navigation[].href` resolves (SM-05).

**Acceptance criteria:**
- AC-1: 100% of navigation items for all four roles resolve to a real populated page (SM-05).
- AC-2: Zero dead links, placeholder screens, or non-functional controls (SM-06, NFR-14).
- AC-3: Zero prohibited copy findings.

---

### FR-F19-09 — Reviewer-readable results summary

**Processing / business rules:**
1. CI produces a human-readable summary, not only a log: pass/fail per suite, counts, and — critically — the mapping from each success metric (SM-01 through SM-22) to the test that verifies it and its current status.
2. The summary names the three protected claims explicitly: flagship workflow, RBAC enforcement, adapter behavior — plus accessibility.
3. Accessibility results list violations by severity with route and rule.
4. The summary is committed as an artifact so a reviewer can read it without running anything.
5. A traceability table maps every FRD requirement ID to its verifying test(s), and flags requirements with no test.

**Acceptance criteria:**
- AC-1: Every success metric maps to a named test with a current status.
- AC-2: Requirements without test coverage are visibly flagged rather than silently uncovered.

---

### FR-F19-10 — Test environment and determinism

**Processing / business rules:**
1. Tests run against the same deterministic seed as the demo (`FR-F17-05`), with a reset between suites, so a test failure means a real defect rather than data drift.
2. Failure injection is used for resilience tests rather than stopping processes, so suites stay parallelizable; the process-stop path is exercised by one dedicated test per spoke.
3. Tests never depend on wall-clock "now" for overdue assertions; they use the seed reference date (`FR-F17-05` rule 2).
4. Flaky tests are quarantined and fixed rather than retried into passing — a retried-until-green suite protects nothing.

**Acceptance criteria:**
- AC-1: The suite produces identical results across three consecutive runs.
- AC-2: No test depends on the current date.

---
