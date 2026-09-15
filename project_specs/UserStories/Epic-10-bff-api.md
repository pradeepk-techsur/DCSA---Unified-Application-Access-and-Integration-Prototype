## Epic 10: Unified Layer API — Backend-for-Frontend (F10)

The hub's own HTTP API: the single server-side surface the web UI consumes and the only place authorisation and audit are enforced. It is a product surface in its own right, because it is what an evaluator's `curl` command talks to and where the zero-trust claims become testable.

---

### US-081: Have every request pass through one enforcement point
**As an** Administrator responsible for the platform's security posture, **I want** every API request to traverse the same ordered pipeline, **so that** no endpoint can quietly skip authorisation or audit.

**Acceptance Criteria:**
- [ ] Given any request, when it is processed, then it passes in order through correlation, security headers, session resolution, CSRF verification, reserved-field rejection, input validation, authorisation, handler, audit on mutation, and response composition.
- [ ] Given a route enumeration test runs, when it completes, then zero endpoints are found that bypass or reorder the pipeline.
- [ ] Given an authenticated response, when its headers are inspected, then it carries `Cache-Control: no-store`, a content-security policy, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.
- [ ] Given a request carrying an unknown field, when validation runs, then the field is rejected rather than ignored.
- [ ] Given the access log, when it is inspected, then it never contains an action form body or an authentication payload.

**Priority:** P0 | **Feature Ref:** F10, F2 | **Persona:** PER-04 | **FRD:** FR-F10-01

---

### US-082: Get the same shape of error from every endpoint
**As an** Administrator diagnosing a report, **I want** one consistent error contract across the whole API, **so that** I can interpret any failure without learning a per-endpoint dialect.

**Acceptance Criteria:**
- [ ] Given any non-2xx response, when I read the body, then it carries a machine-readable code, a human-readable message, a detail line, a correlation ID, field errors where applicable, and retry guidance.
- [ ] Given any error response, when I inspect it, then it contains no stack trace, no internal hostname, no SQL, and no spoke exception text.
- [ ] Given a denial, when I read the response, then it never discloses whether the resource exists.
- [ ] Given any error message text, when it is compared to the documented catalogue, then the copy matches exactly.

**Priority:** P0 | **Feature Ref:** F10 | **Persona:** PER-04 | **FRD:** FR-F10-03

---

### US-083: Have every state change recorded before I am told it worked
**As an** Administrator, **I want** the audit write to happen inside the mutation path before the success response, **so that** an unauditable action can never be reported as complete.

**Acceptance Criteria:**
- [ ] Given any mutating endpoint, when it succeeds, then exactly one audit record of the expected type exists for that invocation.
- [ ] Given the audit store is made unavailable, when I attempt a mutation, then it is reported as not completed with a specific message and a correlation ID.
- [ ] Given a spoke write committed before an audit write failed, when the response returns, then I am told honestly that the action may have been applied, an integration issue is created, and an administrator is notified.
- [ ] Given the audit write, when it is inspected, then it is synchronous — never deferred, queued, batched, or made asynchronous.
- [ ] Given a registry of mutating endpoints, when the audit-coverage test runs, then every one is asserted.

**Priority:** P0 | **Feature Ref:** F10, F13 | **Persona:** PER-04 | **FRD:** FR-F10-05, FR-F13-01

---

### US-084: Read accurate API documentation and exercise it myself
**As an** evaluating reviewer with a technical background, **I want** published API documentation generated from the implementation, **so that** I can test the zero-trust claims directly rather than taking them on faith.

**Acceptance Criteria:**
- [ ] Given the documentation, when I open it, then it covers 100% of routes and is generated from the implementation's route declarations rather than hand-maintained.
- [ ] Given any documented endpoint, when I read its entry, then it states method, path, summary, required permission, request and response schemas, every possible error code with its user-facing copy, and whether it writes audit.
- [ ] Given a route exists without documentation, or documented schemas that do not match the implementation, when CI runs, then the build fails.
- [ ] Given the documentation alone, when I exercise the flagship orchestration endpoint, then I can do so successfully.
- [ ] Given the documentation route, when a non-administrator requests it, then access is denied.

**Priority:** P1 | **Feature Ref:** F10 | **Persona:** PER-04 | **FRD:** FR-F10-06

---

### US-085: Have every endpoint tested including at least one refusal
**As an** evaluating reviewer, **I want** every documented endpoint exercised by an automated test with an unauthorised negative case, **so that** the server-side authorisation claim is measured across the whole surface rather than sampled.

**Acceptance Criteria:**
- [ ] Given the endpoint catalogue, when the test suite runs, then every documented endpoint is exercised.
- [ ] Given each endpoint, when the negative suite runs, then at least one unauthorised-access case is asserted and denied.
- [ ] Given the four roles, when the RBAC suite runs, then every permitted action succeeds and every non-permitted action returns a denial.
- [ ] Given an endpoint references an action string absent from the role matrix, when the startup check runs, then it fails the build.
- [ ] Given test results, when a reviewer reads the summary, then it is presented in readable form rather than only as a CI log.

**Priority:** P1 | **Feature Ref:** F10, F19 | **Persona:** PER-04 | **FRD:** FR-F19-02, FR-F19-09

---
