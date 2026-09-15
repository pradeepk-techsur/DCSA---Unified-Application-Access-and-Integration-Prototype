## F10 — Unified Layer API (Backend-for-Frontend)

**Traces to:** PRD F10 (P0); NFR-04, NFR-06, NFR-15, SM-18, SM-19. **Full endpoint catalog:** `Y1a-api-hub-bff.md`.

**Description:** The hub's own HTTP API — the single server-side surface the web UI consumes and the only place authorization and audit are enforced. It is a product surface in its own right: it is what a future client or an evaluator's `curl` command talks to, and it is where the zero-trust claims are testable. This chunk specifies the API's cross-cutting behavior; `Y1a` specifies every endpoint's method, path, auth requirement, request schema, response schema, and error codes.

**Terminology:**
- **BFF** — backend-for-frontend: endpoints shaped for the UI's screens rather than mirroring spoke APIs.
- **Choke point** — the single middleware chain every request passes through.
- **Mutating endpoint** — any endpoint using POST, PATCH, PUT, or DELETE semantics that changes state.

---

### FR-F10-01 — Request pipeline (the choke point)

**Description:** The ordered middleware every request traverses. No endpoint may bypass or reorder it.

**Processing / business rules — in order:**
1. **Correlation.** Assign or adopt `correlationId`; generate `requestId` (`FR-F01-06`).
2. **Security headers.** Set `Cache-Control: no-store` on authenticated responses, plus CSP (`default-src 'self'`), `X-Content-Type-Options: nosniff`, and `Referrer-Policy: same-origin`. **No frame-blocking header is emitted:** neither the hub nor the UI sets `X-Frame-Options`, and the CSP contains **no** `frame-ancestors` directive. *(Amended per TechArch **ADR-012**, which supersedes the original `X-Frame-Options: DENY` clause. The prototype is presented through an embedded preview iframe; a frame-blocking header renders that preview blank — visually indistinguishable from a crashed build, and exactly the failure mode `NFR-09` exists to prevent. **Production delta:** restore `frame-ancestors 'self'` when the application is not presented through an embedding harness.)*
3. **Session resolution.** Resolve the principal from the session store (`FR-F01-01`). Reject unauthenticated access to protected routes with 401.
4. **CSRF.** Verify the CSRF token on mutating requests.
5. **Reserved-field rejection.** Reject any request carrying `role`, `roles`, `activeRole`, `principalId`, `entitlements`, or `scope` in body or query (`FR-F02-01`).
6. **Input validation.** Validate against the endpoint's declared schema; unknown fields are rejected, not ignored.
7. **Authorization.** Invoke the PDP (`FR-F02-01`). Deny → 403 plus a denial audit record.
8. **Handler.** Execute, calling adapters through the scoped wrapper only (`FR-F02-04`).
9. **Audit (mutating only).** Write the audit record **before** composing the success response (`FR-F13-01`). Failure to audit fails the request.
10. **Response.** Attach `X-Correlation-Id`, `X-UAL-Session-Expires`, and the standard envelope for errors.
11. **Access log.** Emit a structured log line with outcome and latency; never log request bodies of action forms or authentication payloads.

**Validation rules:** A registered route without a declared `action` string, request schema, and response schema fails the startup check — the API's own contract is validated at boot rather than discovered at demo time.

**Error handling:** Any uncaught handler exception is converted to 500 `INTERNAL_ERROR` with the standard envelope and a correlation ID; the stack is logged server-side only.

**Acceptance criteria:**
- AC-1: A route-enumeration test confirms every endpoint traverses steps 1–11.
- AC-2: No endpoint returns a body outside the documented response or error envelope.
- AC-3: Reserved fields are rejected on every endpoint.

---

### FR-F10-02 — Endpoint groups and their screens

**Description:** The API's functional surface, with each group named against the screens it serves. Full specifications in `Y1a`.

| Group | Endpoints | Serves |
|---|---|---|
| Auth | `GET /api/auth/methods`, `POST /api/auth/initiate`, `POST /api/auth/complete`, `POST /api/auth/logout` | SCR-01–05, SCR-07 |
| Session | `GET /api/session`, `POST /api/session/extend`, `POST /api/session/active-role` | SCR-06, SCR-08 header |
| Entitlements | `GET /api/entitlements`, `GET /api/registry-version` | SCR-08 navigation |
| Dashboard | `GET /api/dashboard` | SCR-09–12 |
| Work queue | `GET /api/work-items`, `GET /api/search` | SCR-13, SCR-35 |
| Work item | `GET /api/work-items/{id}`, `GET /api/work-items/{id}/actions`, `POST /api/work-items/{id}/actions/{actionId}`, `GET /api/work-items/{id}/activity`, `GET /api/work-items/{id}/related` | SCR-14–19 |
| Orchestration | `POST /api/orchestration/resolve-pvq-issue`, `GET /api/orchestration/{txId}`, `POST /api/orchestration/{txId}/retry` | SCR-16, SCR-20 |
| Notifications | `GET /api/notifications`, `POST /api/notifications/{id}/read`, `POST /api/announcements/{id}/dismiss` | SCR-21, dashboards |
| Health | `GET /api/health/summary` | SCR-13 degraded polling, SCR-24 |
| Admin — applications | `GET/POST /api/admin/applications`, `GET/PATCH/DELETE /api/admin/applications/{id}`, `POST /api/admin/applications/test-connection`, `POST /api/admin/applications/{id}/probe` | SCR-22, SCR-23, SCR-28 |
| Admin — operations | `GET /api/admin/health`, `GET /api/admin/integration-issues`, `GET /api/admin/users`, `GET /api/admin/users/{id}`, `GET /api/admin/status`, `POST /api/admin/failure-injection` | SCR-24–27, SCR-37, SCR-38 |
| Admin — announcements | `GET/POST /api/admin/announcements`, `PATCH/DELETE /api/admin/announcements/{id}` | SCR-29 |
| Audit | `GET /api/audit`, `GET /api/audit/{id}`, `GET /api/audit/chain/{correlationId}`, `GET /api/audit/export` | SCR-33, SCR-34 |

**Rules:**
1. Every endpoint is consumed by at least one screen, or is explicitly documented as a verification surface (`/api/admin/status`). There are no orphan endpoints.
2. Every screen's data requirements are satisfiable by the listed endpoints. There is no screen without an endpoint (the inverse of "no dead routes").

**Acceptance criteria:**
- AC-1: Screen-to-endpoint mapping is complete in both directions.
- AC-2: Every endpoint is exercised by at least one automated test, including one unauthorized-access negative case each (PRD F10 acceptance signal).

---

### FR-F10-03 — Consistent error contract

**Description:** One error shape, machine-readable and human-readable, with no information disclosure.

**Processing / business rules:**
1. All non-2xx responses use the §3.6 envelope.
2. `code` is from the closed catalog in `Y2`; new codes require a catalog entry with user-facing copy. An undocumented code cannot be emitted — a startup check validates emitted codes against the catalog.
3. `message` is the exact user-facing copy from `Y2`, written in plain language, actionable, containing no jargon, no stack trace, no internal identifier.
4. `fieldErrors[]` carries `{ fieldId, message }` for validation failures, driving the error summary and inline messages (`FR-F14-03`).
5. Denials never disclose existence (`FR-F02-07`).
6. `retryable` and `retryAfterSeconds` tell the client whether to offer a retry control, so retry affordances are server-driven rather than guessed.
7. HTTP status usage: 400 validation, 401 session, 403 authorization, 404 only for genuinely public-safe missing routes (not resources), 409 state conflicts, 422 upstream business rejection, 207 partial orchestration, 429 rate/attempt limits, 500 internal, 502 upstream contract/indeterminate, 503 upstream unavailable, 504 orchestration timeout.

**Acceptance criteria:**
- AC-1: Every error path returns the envelope; a schema test asserts it across all endpoints.
- AC-2: Zero user-facing messages contain prohibited content, verified by scan.

---

### FR-F10-04 — Pagination, filtering, and sorting conventions

**Description:** Uniform list semantics so every list screen behaves the same way.

**Processing / business rules:**
1. Query parameters: `page` (≥1, default 1), `pageSize` (10|25|50|100, default 25), `sort` (field name), `dir` (`asc`|`desc`), plus endpoint-specific filters.
2. Response envelope for lists: `{ items[], page, pageSize, totalCount, totalPages, hasNext, truncated, sourceStatus?[], correlationId }`.
3. `totalCount` reflects only retrieved data; when `truncated` or any `sourceStatus` is non-OK, the UI must qualify the count (`FR-F05-04`).
4. Invalid `sort`/`dir` normalize to defaults rather than erroring; invalid filter values error with a field message.
5. Filters are always applied server-side after authorization; a filter never widens scope.

**Acceptance criteria:**
- AC-1: All list endpoints share the envelope and parameter names.
- AC-2: No list endpoint returns unfiltered data for the client to filter.

---

### FR-F10-05 — Mandatory audit on mutation

**Description:** The API-level expression of the audit guarantee.

**Processing / business rules:**
1. Every mutating endpoint writes exactly one primary audit record per successful invocation (orchestrations write one per leg plus start/complete records, per `FR-F07b-06`).
2. The write happens **before** the success response is composed. If it fails, the endpoint returns `AUDIT_WRITE_FAILED` and the operation is reported as not completed (`FR-F13-01`).
3. A registry of mutating endpoints and their expected audit action types is maintained and asserted by test: invoking each mutating endpoint produces exactly one record of the expected type (SM-19).
4. Read endpoints write audit records only where specified: work-item views, related-item resolution, audit views, and identity views. Routine list reads are not audited, to keep the trail legible — but every one of those exceptions is enumerated here rather than left to implementer discretion.

**Acceptance criteria:**
- AC-1: 100% of mutating endpoints produce exactly one audit record per success (SM-19).
- AC-2: A simulated audit-store failure causes the mutation to be reported as failed.

---

### FR-F10-06 — API documentation as a deliverable

**Description:** Published, accurate API documentation reviewers can read and exercise.

**Processing / business rules:**
1. An OpenAPI-style document is generated from the implementation's route declarations, request/response schemas, and error catalog — not hand-maintained, so it cannot drift.
2. It is served at `/api/docs` (Administrator-authorized) and written to a file at build time for inclusion in the repository.
3. Each endpoint documents: method, path, summary, required role/permission, request schema, response schema, all possible error codes with their user-facing copy, and whether it writes audit.
4. A CI check fails if a route exists without documentation or documents a schema that does not match the implementation.

**Acceptance criteria:**
- AC-1: Generated documentation covers 100% of routes.
- AC-2: A reviewer can exercise the documented flagship endpoint from the documentation alone.

---

### FR-F10-07 — Rate limiting and abuse resistance (demo-grade)

**Description:** Bounded protection appropriate to a prototype, specified so behavior is predictable rather than absent.

**Processing / business rules:**
1. Authentication endpoints: 20 attempts per IP per 5 minutes, plus the per-transaction attempt cap (`FR-F00-04`).
2. Mutating endpoints: 60 requests per session per minute.
3. Read endpoints: 600 requests per session per minute.
4. Exceeding a limit returns 429 `RATE_LIMITED` with `retryAfterSeconds`, and the UI shows: "You're making requests faster than we can handle. Wait {n} seconds and try again."
5. Limits are configuration values and are set generously enough that no legitimate demo action can trip them.

**Acceptance criteria:**
- AC-1: Limits never trigger during the scripted demo paths.
- AC-2: Exceeding a limit returns the envelope with a retry hint, never a blank or default framework error page.

---
