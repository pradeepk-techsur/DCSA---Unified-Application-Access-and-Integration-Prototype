## F1 — Unified Session and Single Sign-On Across All Spokes

**Traces to:** PRD F1 (P0). **Screens:** global header session control (SCR-08 shell), all authenticated screens. **API:** `Y1a §Session`.

**Description:** One authentication establishes authorized access to every connected spoke for the life of the session. The hub holds the only session the user has; spokes never see the browser and never issue their own login. On every adapter call the hub presents an attested principal — identity, roles, attributes, correlation ID — signed by the hub. The user never re-authenticates when moving between work owned by different systems, including on deep links.

**Terminology:**
- **Hub session** — the single server-side session record (`Y0a.sessions`) keyed by a signed, HttpOnly cookie.
- **Attested principal** — the hub-signed assertion passed to a spoke on every call (`X-UAL-Principal`).
- **Spoke context handle** — a per-session, per-spoke opaque handle the spoke may issue to model its own session, held only by the hub.
- **Correlation ID** — a per-user-action ULID propagated hub → adapter → spoke and into audit.

---

### FR-F01-01 — Single server-side session issuance

**Description:** Session creation on successful authentication, with no role or entitlement data stored client-side.

**Inputs:** Successful auth completion from `FR-F00-02/03/04`: `{ identityId, identityMethod, transactionId }`.

**Processing / business rules:**
1. Hub creates a row in `Y0a.sessions`: `sessionId` (ULID), `principalId`, `identityMethod`, `activeRole`, `createdAt`, `lastActivityAt`, `idleExpiresAt`, `absoluteExpiresAt`, `status = ACTIVE`, `userAgentHash`, `ipHash`.
2. Hub sets a cookie `ual_session` with attributes `HttpOnly; Secure; SameSite=Lax; Path=/`. The cookie value is the signed `sessionId` only — no roles, no attributes, no entitlements.
3. Every authenticated response sets `Cache-Control: no-store`.
4. A CSRF token is issued as a separate readable cookie and required as an `X-CSRF-Token` header on all state-changing requests.
5. The principal is rebuilt from the database on every request. A stale in-memory copy MUST NOT outlive a request.

**Outputs:** `Set-Cookie: ual_session=…`; response body `{ principal, entitlements, expiresAt }`.

**Validation rules:**
- Session cookie signature valid; `sessionId` exists and `status = ACTIVE`; `now < idleExpiresAt` and `now < absoluteExpiresAt`.
- Mismatched `userAgentHash` invalidates the session (defense against cookie replay in the demo).

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Missing/invalid cookie on authenticated route | 401 | `SESSION_INVALID` | "You're not signed in. Sign in to continue." |
| Session terminated | 401 | `SESSION_INVALID` | Same copy — terminated and unknown are indistinguishable. |
| Missing/invalid CSRF token | 403 | `CSRF_REJECTED` | "Your request couldn't be completed. Refresh the page and try again." |

**Acceptance criteria:**
- AC-1: The session cookie contains no role, attribute, or entitlement data (inspected by test).
- AC-2: Editing the cookie value invalidates the session rather than escalating privilege.
- AC-3: A state-changing request without the CSRF header is rejected with 403 and audited as `AUTHZ_DENIED`.

---

### FR-F01-02 — Attested principal propagation to spokes

**Description:** The contract by which a spoke learns who is acting, without ever trusting the browser.

**Inputs:** Hub-internal: `Principal`, `correlationId`, target `applicationId`, adapter operation name.

**Processing / business rules:**
1. Before any adapter call, the hub constructs a principal assertion:
   ```json
   {
     "principalId": "USR-0007",
     "displayName": "Marcus Vale",
     "activeRole": "INVESTIGATOR",
     "roles": ["INVESTIGATOR"],
     "attributes": { "organization": "DCSA-FIELD-OPS-EAST", "clearanceTier": "T5",
                     "assignedRegion": "REGION-NE", "subjectRef": null },
     "sessionId": "SES-01JD…",
     "issuedAt": "2026-09-14T15:04:11Z",
     "expiresAt": "2026-09-14T15:09:11Z",
     "audience": "PVQ",
     "correlationId": "01JD7K2Q9X8V3MZ4R6T"
   }
   ```
2. The assertion is serialized, signed with the hub's assertion key, and sent as header `X-UAL-Principal`. `audience` binds the assertion to one target application; a spoke MUST reject an assertion whose `audience` is not itself.
3. Assertion lifetime is 5 minutes, independent of session lifetime, and is minted fresh per call.
4. Headers on every adapter call: `X-UAL-Principal`, `X-UAL-Correlation-Id`, `X-UAL-Request-Id` (unique per call), `X-UAL-Adapter-Version`.
5. `caseAssignments` is NOT sent to spokes; the hub evaluates assignment-based authorization itself (`FR-F02-04`) so a spoke cannot be tricked into widening scope.
6. Spokes MUST verify signature, `audience`, and expiry, and MUST reject an unsigned or browser-originated request. Spoke APIs are not reachable from the browser in the demo topology.

**Outputs:** Adapter call carrying the attested principal.

**Validation rules (spoke side):** signature valid; `audience == self`; `now < expiresAt`; `principalId` present. Failure → 401 `PRINCIPAL_REJECTED` returned to the adapter, surfaced as an integration issue (`FR-F16-09`), never as a login prompt to the user.

**Error handling:**

| Scenario | HTTP (hub→user) | Code | User-facing message |
|---|---|---|---|
| Spoke rejects assertion | 502 | `UPSTREAM_REJECTED` | "The {System} system couldn't process this request. We've logged the problem — reference {correlationId}." |
| Assertion signing key unavailable | 500 | `INTERNAL_ERROR` | "Something went wrong on our side. Try again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Every adapter call in a captured trace carries a signed assertion with the correct `audience`.
- AC-2: Replaying a PVQ-audience assertion against the eApp service is rejected with `PRINCIPAL_REJECTED`.
- AC-3: A direct browser call to a spoke port with the session cookie is rejected (no principal assertion present).

---

### FR-F01-03 — Zero re-authentication guarantee

**Description:** Traversing work owned by different spokes never prompts for credentials, opens a new tab, or leaves the unified shell.

**Inputs:** User navigation across any combination of spoke-owned screens within one session.

**Processing / business rules:**
1. All spoke data reaches the UI through hub BFF endpoints only. The UI MUST NOT contain any link, iframe, or redirect whose origin is a spoke service.
2. Deep links (`/work/PVQ:ISS-2207`) on an unauthenticated browser redirect to SCR-01 with `returnTo`, and after sign-in land directly on the requested item — one authentication, not two.
3. The hub MUST NOT emit any 401/403 to the browser that results in a login form while the hub session remains valid. A spoke-side authorization failure surfaces as a permission or availability error, never as a credential prompt.
4. A session-scoped counter of authentication events is exposed at `GET /api/session` as `authEventCount` for demonstration and test assertion.

**Outputs:** Continuous navigation; `authEventCount == 1` across the flagship workflow.

**Validation rules:** Automated link crawl (`FR-F19-08`) asserts zero outbound links to spoke origins.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Spoke returns authorization failure for a valid principal | 403 | `AUTHZ_DENIED_UPSTREAM` | "You don't have access to this item in {System}." |

**Acceptance criteria:**
- AC-1: The flagship workflow (F7) produces exactly one `AUTH_SUCCESS` audit record (SM-02).
- AC-2: A scripted traversal touching all five spokes produces exactly one authentication event.
- AC-3: No screen in the application navigates to a non-hub origin.

---

### FR-F01-04 — Per-spoke context handles and invalidation

**Description:** Where a spoke models its own session, the hub holds the handle and disposes of it on logout — transparently to the user.

**Inputs:** Adapter responses carrying `contextHandle`; logout or session expiry events.

**Processing / business rules:**
1. If an adapter's `describe()` declares `supportsContext: true`, the hub establishes a handle on first use per session via `establishContext(principal)` and stores it in `Y0a.spoke_contexts` `{ sessionId, applicationId, contextHandle, establishedAt, lastUsedAt }`.
2. Subsequent calls for that session and application include the handle.
3. On logout, expiry, or session termination the hub calls `revokeContext(handle)` for every held handle, then deletes the rows. Revocation failures are recorded as integration issues and do not block termination.
4. If a spoke rejects a handle as stale (`CONTEXT_EXPIRED`), the adapter transparently re-establishes once and retries the original call. A second failure surfaces as `UPSTREAM_UNAVAILABLE`. The user is never told about handles.

**Outputs:** Handles established, used, and revoked without user involvement.

**Validation rules:** A handle is only ever used with the session and application that created it.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Handle rejected twice | 503 | `UPSTREAM_UNAVAILABLE` | "{System} isn't responding right now. Your other work is still available." |

**Acceptance criteria:**
- AC-1: After logout, `Y0a.spoke_contexts` contains zero rows for that session.
- AC-2: A forced stale handle causes one transparent re-establishment and a successful user-visible result.

---

### FR-F01-05 — Session state surfaced in the UI

**Description:** The header always shows who the user is, in what role context, and how much session time remains.

**Inputs:** `GET /api/session` → `{ displayName, activeRole, roles[], identityMethod, expiresAt, authEventCount }`.

**Processing / business rules:**
1. The global header renders: display name, active role badge, sign-in method label ("via CAC/PIV (simulated)"), a session timer, and an account menu containing role switch (when `roles.length > 1`), "Accessibility statement," and "Sign out."
2. The timer updates client-side from `expiresAt` and re-syncs on every successful API response via the `X-UAL-Session-Expires` response header.
3. The timer is presented as text ("Session expires in 24 minutes"), never color-only, and is not an `aria-live` region except at the thresholds in `FR-F00-06`.
4. The account menu is a keyboard-operable USWDS nav dropdown with `aria-expanded` state.

**Outputs:** Header chrome reflecting live session state on every screen.

**Validation rules:** Role switch options are exactly the roles held; an unavailable role is never listed.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Session lookup fails | 401 | `SESSION_INVALID` | "You're not signed in. Sign in to continue." |

**Acceptance criteria:**
- AC-1: Every authenticated screen displays identity, active role, method, and remaining time.
- AC-2: The account menu is reachable and operable by keyboard alone with visible focus.

---

### FR-F01-06 — Correlation identifier lifecycle

**Description:** One user action produces one correlation ID that appears on every hub operation, adapter call, audit record, and error entry belonging to it.

**Inputs:** Inbound request; optional client-supplied `X-Correlation-Id`.

**Processing / business rules:**
1. The hub generates a ULID `correlationId` at the edge for each inbound request unless the request carries an `X-Correlation-Id` that matches `^[0-9A-HJKMNP-TV-Z]{26}$`, in which case it is adopted (this lets the UI tie a multi-request user action together, e.g. the flagship workflow).
2. The ID is attached to: the request log, every adapter call header, every audit record written during the request, every integration issue recorded, and the error envelope of any failure response.
3. Responses always return `X-Correlation-Id`.
4. Orchestrated actions (`FR-F07b-01`) reuse one correlation ID across both spoke writes and both audit records, producing a single chain in the audit viewer (`FR-F07b-06`).

**Outputs:** `X-Correlation-Id` on every response; correlated rows in `Y0a.audit_events` and `Y0a.integration_issues`.

**Validation rules:** A malformed client-supplied ID is ignored (a fresh one is generated), never echoed.

**Error handling:** None user-facing; correlation failures are internal and non-blocking, but a missing correlation ID on an audit write is a hard failure (`FR-F13-01`).

**Acceptance criteria:**
- AC-1: Every error the user can see displays a correlation ID that retrieves the matching audit chain in the viewer.
- AC-2: The flagship workflow's audit chain contains ≥5 records sharing one correlation ID (SM-20).

---
