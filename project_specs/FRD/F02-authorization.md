## F2 — Role- and Attribute-Based Access Control, Enforced Server-Side

**Traces to:** PRD F2 (P0); NFR-04, NFR-05, SM-18. **Screens:** SCR-30 Access denied; affects every screen via entitlements. **API:** every endpoint in `Y1a`.

**Description:** Authorization for the four roles is evaluated on the server for every request at the resource level, combining role, attributes, and resource ownership. Client-side conditional rendering exists for usability and is never the control. This requirement set defines the authorization decision function, its inputs, its outputs, where it is invoked, and how applicant data isolation is enforced at the data layer rather than the view layer.

**Terminology:**
- **PDP (policy decision point)** — the single hub function `authorize(request) → Decision`. There is exactly one implementation; no endpoint hand-rolls its own check.
- **PEP (policy enforcement point)** — the middleware and data-access wrappers that call the PDP and act on the result.
- **Entitlements** — the server-computed set of navigation items, permissions, and per-resource actions returned to the UI for rendering only.
- **Ownership predicate** — a mandatory query-level filter injected into every list operation, derived from the principal.

---

### FR-F02-01 — The authorization decision function

**Description:** A single, total function evaluated on every request. It is the only place an allow/deny decision is made.

**Inputs (the complete decision input, `AuthzRequest`):**
- `principal` (Principal, §3.1) — resolved server-side from the session; never from the request body, query string, or any header the browser can set
- `action` (string) — the operation verb, e.g. `WORK_ITEM.READ`, `WORK_ITEM.ACT`, `ADMIN.APP.REGISTER`, `AUDIT.READ_ALL`
- `resourceType` (enum: `WORK_ITEM` | `CASE` | `ISSUE` | `APPLICATION` | `ANNOUNCEMENT` | `AUDIT_RECORD` | `USER` | `DASHBOARD` | `NAV`)
- `resourceRef` (object | null) — `{ sourceSystem, nativeId }` for resource-scoped decisions; null only for collection-level decisions that are subsequently ownership-filtered
- `resourceAttributes` (object | null) — attributes of the resource as reported by its owning system: `{ assigneeId, subjectRef, organization, region, sensitivityTier, statusCategory }`
- `context` (object) — `{ correlationId, requestId, method, path, now, sourceHealth }`

**Processing / business rules (evaluation order; first match wins):**
1. **Session gate.** If no valid session → `DENY(SESSION_INVALID)`.
2. **Role gate.** Look up `(activeRole, action)` in the permission matrix (`FR-F02-02`). If absent → `DENY(AUTHZ_DENIED)`.
3. **Attribute gate.** Evaluate the attribute rules for `(activeRole, resourceType)` (`FR-F02-03`). Any failing rule → `DENY(AUTHZ_DENIED)`.
4. **Ownership gate.** For resource-scoped decisions, evaluate the ownership predicate (`FR-F02-04`). Failure → `DENY(AUTHZ_DENIED)`.
5. **Action-state gate.** For `*.ACT`, verify the action is in the server-computed action list for this principal and this resource *in its current state* (`FR-F02-05`). Failure → `DENY(ACTION_NOT_AVAILABLE)`.
6. Otherwise → `ALLOW`.
7. Decisions are computed fresh per request. Caching of a decision beyond the request is prohibited; entitlement caching for rendering is permitted for at most 60 seconds and is never load-bearing.

**Outputs:** `Decision = { effect: ALLOW | DENY, reasonCode, ruleId, obligations[] }`. `obligations` may include `REDACT_FIELDS: [...]` for partial reads (e.g., an applicant sees their own case without investigator narrative fields).

**Validation rules:**
- The function MUST be total: an unmapped `(role, action)` pair denies. There is no default-allow branch.
- `principal.activeRole` MUST be one of `principal.roles`, re-checked at decision time.
- Any request carrying `role`, `roles`, `principalId`, or `entitlements` in body/query is rejected with `VALIDATION_FAILED` — these are reserved names, and accepting them silently would be a latent bypass.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Denied (any reason) | 403 | `AUTHZ_DENIED` | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {correlationId}." |
| Action not available in current state | 409 | `ACTION_NOT_AVAILABLE` | "This action isn't available for this item right now. Refresh the page to see the current options." |
| Reserved field supplied by client | 400 | `VALIDATION_FAILED` | "Your request couldn't be completed. Refresh the page and try again." |

**Acceptance criteria:**
- AC-1: Every hub endpoint invokes the PDP; a test enumerating routes finds zero endpoints without a PDP call.
- AC-2: A request body containing `"activeRole": "ADMINISTRATOR"` from an Applicant session is rejected and changes nothing.
- AC-3: Every DENY writes an audit record (`FR-F02-07`).

---

### FR-F02-02 — Role permission matrix

**Description:** The documented, data-held mapping of role to permitted actions. Held in `Y0a.role_permissions`, not in code branches.

**Processing / business rules:** The matrix (✓ = permitted, subject to attribute and ownership gates):

| Action | Investigator | Adjudicator | Applicant | Administrator |
|---|:--:|:--:|:--:|:--:|
| `NAV.READ` (own entitlements) | ✓ | ✓ | ✓ | ✓ |
| `DASHBOARD.READ` | ✓ | ✓ | ✓ | ✓ |
| `WORK_QUEUE.LIST` | ✓ | ✓ | ✓ | — |
| `WORK_ITEM.READ` | ✓ | ✓ | ✓ | — |
| `WORK_ITEM.ACT` | ✓ | ✓ | ✓ (own tasks only) | — |
| `CASE.READ` (eApp) | ✓ | ✓ | ✓ (own) | — |
| `ISSUE.READ` (PVQ) | ✓ | ✓ | — | — |
| `ISSUE.RESOLVE` (PVQ) | ✓ | — | — | — |
| `ISSUE.REQUEST_CLARIFICATION` | ✓ | ✓ | — | — |
| `CASE.ADJUDICATE` | — | ✓ | — | — |
| `DESIGNATION.READ` (PDT) | ✓ | ✓ | — | ✓ |
| `DESIGNATION.APPROVE` (PDT) | — | ✓ | — | — |
| `NOTICE.READ` (IEP) | — | — | ✓ | — |
| `NOTICE.ACKNOWLEDGE` (IEP) | — | — | ✓ | — |
| `AUDIT.READ_OWN` | ✓ | ✓ | ✓ | ✓ |
| `AUDIT.READ_ALL` | — | — | — | ✓ |
| `ADMIN.APP.LIST` / `.READ` | — | — | — | ✓ |
| `ADMIN.APP.REGISTER` / `.EDIT` / `.DISABLE` / `.DEREGISTER` | — | — | — | ✓ |
| `ADMIN.HEALTH.READ` / `.PROBE` | — | — | — | ✓ |
| `ADMIN.ISSUES.READ` | — | — | — | ✓ |
| `ADMIN.ANNOUNCEMENT.*` | — | — | — | ✓ |
| `ADMIN.USER.READ` | — | — | — | ✓ |
| `ADMIN.FAILURE_INJECTION.*` | — | — | — | ✓ |

Rules:
1. Administrators do NOT receive mission work-item access. Operating the platform and doing mission work are separate concerns; conflating them would weaken the least-privilege demonstration. An Administrator opening a work-item URL receives `AUTHZ_DENIED`.
2. Adding a permission is a data change in `Y0a.role_permissions`; it MUST NOT require a code change (NFR-19).
3. The matrix is rendered read-only in the admin console (`FR-F11-07`) so a reviewer can see the policy rather than infer it.

**Outputs:** Permission rows consumed by the PDP and by `GET /api/entitlements`.

**Validation rules:** Every `action` string referenced by any endpoint MUST exist in the matrix; a startup check fails the build otherwise.

**Error handling:** Missing matrix row → treated as DENY, and an `INTERNAL_POLICY_GAP` integration issue is recorded for the administrator.

**Acceptance criteria:**
- AC-1: For each of the four roles, every permitted action succeeds and every non-permitted action returns 403 — 4 roles × full matrix, automated (`FR-F19-02`).
- AC-2: The startup check fails if any endpoint references an unknown action string.

---

### FR-F02-03 — Attribute rules layered on role

**Description:** Attributes narrow role grants. Role alone never suffices for a resource-scoped decision.

**Inputs:** `principal.attributes`, `resourceAttributes`.

**Processing / business rules:**

| Role | Rule ID | Rule |
|---|---|---|
| Investigator | `ATTR-INV-01` | May read a work item only if `resourceAttributes.assigneeId == principal.principalId` **or** (`resourceAttributes.organization == principal.attributes.organization` **and** `resourceAttributes.region == principal.attributes.assignedRegion`). This is the "assigned to me or my unit" rule. |
| Investigator | `ATTR-INV-02` | May act on a work item only if `assigneeId == principalId`. Unit visibility grants read, not write. |
| Investigator | `ATTR-INV-03` | May read a case only if `resourceAttributes.sensitivityTier <= principal.attributes.clearanceTier` (ordering `T1 < T3 < T5`). |
| Adjudicator | `ATTR-ADJ-01` | May read items whose `organization` matches, regardless of assignee; may act only on items in `statusCategory` `IN_PROGRESS` or `OPEN` that are routed to adjudication. |
| Adjudicator | `ATTR-ADJ-02` | Clearance-tier rule as `ATTR-INV-03`. |
| Applicant | `ATTR-APP-01` | May read a resource only if `resourceAttributes.subjectRef == principal.attributes.subjectRef`. No organization or region rule applies. |
| Applicant | `ATTR-APP-02` | May act only on work items of type `IEP_TASK` or `EAPP_APPLICANT_RESPONSE` whose `subjectRef` matches. |
| Administrator | `ATTR-ADM-01` | No attribute narrowing on platform resources; full estate visibility for applications, health, issues, audit, users. |
| All | `ATTR-ALL-01` | A disabled application's resources are unreadable by anyone except via the admin console's configuration view. |

Additional rules:
1. Rules are evaluated conjunctively within a role; all applicable rules must pass.
2. Rule IDs are returned in the `Decision.ruleId` and recorded in the audit record for a denial, so a reviewer can see *which* rule denied.
3. Clearance-tier comparison uses a defined ordinal map; string comparison is prohibited.

**Outputs:** Pass/fail per rule; `ruleId` of the first failing rule.

**Validation rules:** `resourceAttributes` MUST come from the owning spoke's response, never from the client. If a spoke omits an attribute needed by a rule, the decision is DENY with `reasonCode: INSUFFICIENT_RESOURCE_ATTRIBUTES` — fail closed.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Attribute rule failed | 403 | `AUTHZ_DENIED` | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {correlationId}." |
| Resource attributes unavailable | 403 | `AUTHZ_DENIED` | Same copy — fail closed, no disclosure. |

**Acceptance criteria:**
- AC-1: Investigator A can read but not act on a unit-mate's item; the disabled action carries the reason "This item is assigned to {name}."
- AC-2: A `T3` investigator receives 403 on a `T5` case, and the audit record names `ATTR-INV-03`.
- AC-3: An applicant requesting another subject's record receives 403 identical in body and timing to a request for a non-existent record.

---

### FR-F02-04 — Applicant data isolation enforced at the data layer

**Description:** An applicant can read only their own records. This is enforced by an ownership predicate injected into the data access path, not by filtering a fetched list and not by hiding UI.

**Inputs:** `principal`, target operation, target application(s).

**Processing / business rules:**
1. The hub exposes a single spoke-query wrapper. Every adapter list/get call passes through it. The wrapper computes a mandatory `scope` object from the principal and attaches it to the adapter request:
   - `APPLICANT` → `{ mode: "SUBJECT", subjectRef: principal.attributes.subjectRef }`
   - `INVESTIGATOR` → `{ mode: "ASSIGNEE_OR_UNIT", principalId, organization, assignedRegion }`
   - `ADJUDICATOR` → `{ mode: "ORG", organization }`
   - `ADMINISTRATOR` → `{ mode: "NONE" }` (no work-item access; platform resources only)
2. **Spokes MUST apply the scope in their own query.** A spoke receiving `mode: "SUBJECT"` returns only rows matching that `subjectRef`; it does not return a full set for the hub to filter. This is asserted by `FR-F19-03` conformance tests calling spoke APIs directly.
3. **The hub re-applies the same predicate after receiving results** (defense in depth). Any row violating the predicate is dropped, and an `INTEGRATION_SCOPE_VIOLATION` issue is recorded naming the offending application — a spoke leaking out-of-scope rows is an operational defect, surfaced, not silently tolerated.
4. `getWorkItem` on a specific ID follows the identical path: the scope accompanies the get, and the post-check re-verifies `subjectRef`/assignment before the response is composed. There is no code path that fetches a resource and then decides.
5. Applicant reads receive the obligation `REDACT_FIELDS: ["investigatorNotes", "issueNarrativeInternal", "adjudicationRationale"]`, applied by the hub before serialization.

**Outputs:** Result sets that cannot contain out-of-scope rows; violation issues when a spoke misbehaves.

**Validation rules:**
- `subjectRef` MUST be non-null for an applicant session; a null value fails closed with `IDENTITY_NOT_PROVISIONED`.
- The wrapper MUST refuse to issue an adapter call with an absent `scope` — absence is a programming error, not a permissive default.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Out-of-scope get | 403 | `AUTHZ_DENIED` | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {correlationId}." |
| Spoke returned out-of-scope rows | 200 (filtered) | — | No user-facing error; rows dropped, issue logged for the administrator. |
| Missing scope on internal call | 500 | `INTERNAL_ERROR` | "Something went wrong on our side. Try again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Calling the spoke API directly with `mode: "SUBJECT"` for subject X returns zero rows belonging to subject Y (`FR-F19-03`).
- AC-2: A deliberately mis-scoped spoke response results in filtered output plus one `INTEGRATION_SCOPE_VIOLATION` entry.
- AC-3: Applicant API responses never contain redacted field names, verified by schema assertion.

---

### FR-F02-05 — Action-level authorization and server-computed action lists

**Description:** Viewing an item and acting on it are separate decisions. The list of actions is computed by the server and re-authorized at execution.

**Inputs:** `principal`, resource state from the owning spoke, registry-declared supported actions for the application and work-item type.

**Processing / business rules:**
1. On `GET /api/work-items/{id}`, the hub asks the adapter for `availableActions` given the principal and item state, then intersects that list with the role matrix and attribute rules, producing `ActionDescriptor[]` (§3.3).
2. An action the principal could perform but cannot right now (wrong state, unavailable spoke, item assigned to someone else) is returned with `enabled: false` and a plain-language `disabledReason`. It is shown, disabled, with the reason — not hidden — because a hidden control teaches the user nothing.
3. An action the principal may never perform in this role is omitted entirely.
4. On `POST /api/work-items/{id}/actions/{actionId}`, the full decision (`FR-F02-01` steps 1–5) is re-run against freshly fetched resource state. A stale action list MUST NOT authorize anything.
5. Optimistic concurrency: the detail response carries `stateVersion`; the action request must echo it. A mismatch returns `STATE_CONFLICT`.

**Outputs:** `ActionDescriptor[]` on read; execution result or denial on write.

**Validation rules:** `actionId` must be declared by the registry for that application and work-item type; unknown action IDs return `ACTION_NOT_AVAILABLE`, not 404.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Action not permitted for role | 403 | `AUTHZ_DENIED` | "You don't have permission to do that." |
| Action not valid in current state | 409 | `ACTION_NOT_AVAILABLE` | "This action isn't available for this item right now. Refresh the page to see the current options." |
| Stale `stateVersion` | 409 | `STATE_CONFLICT` | "This item changed since you opened it. Refresh to see the latest version, then try again." |

**Acceptance criteria:**
- AC-1: The same work item opened by an Investigator and an Adjudicator yields different action lists (demo script §RBAC).
- AC-2: Posting an action absent from the returned list is denied server-side.
- AC-3: A concurrent change produces `STATE_CONFLICT` rather than a silent overwrite.

---

### FR-F02-06 — Entitlements endpoint drives navigation and controls

**Description:** The UI renders navigation and global controls from server-provided entitlements so it never advertises what the user cannot do.

**Inputs:** `GET /api/entitlements` (authenticated).

**Processing / business rules:**
1. Response: `{ activeRole, roles[], navigation: [{ id, label, href, icon, order, badgeCount }], permissions: [action strings], featureFlags: {}, defaultLanding: "/dashboard" }`.
2. `navigation` is computed from the role matrix intersected with the registry (`FR-F08b-04`): an application that is disabled or de-registered contributes no nav items.
3. Every navigation entry MUST resolve to an implemented route with real content. A CI check (`FR-F19-08`) crawls each role's navigation and fails on 404, empty shell, or a control with no handler.
4. The UI treats entitlements as presentation input only. Hiding a control is never the security boundary — `FR-F02-01` is.
5. Entitlements are re-fetched on role switch, on application enable/disable (via a polled `registryVersion`), and on session resume.

**Outputs:** Navigation and permission set for the current principal.

**Validation rules:** `navigation[].href` must be same-origin and must exist in the route table.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Entitlement computation failure | 500 | `INTERNAL_ERROR` | "We couldn't load your menu. Refresh the page — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Four roles produce four visibly different navigation sets (SM-23).
- AC-2: Disabling an application in the admin console removes its nav entry for all users within one `registryVersion` poll, with no restart.
- AC-3: Zero dead links across all roles.

---

### FR-F02-07 — Denial handling, audit, and non-enumeration (SCR-30)

**Description:** Denials are consistent, accessible, non-enumerable, and always audited.

**Inputs:** Any `DENY` decision.

**Processing / business rules:**
1. Every denial returns HTTP 403 with the standard envelope. A non-existent resource and a forbidden resource return the **same status, same code, same message, and same response shape**. Response time is normalized to a 120 ms floor to prevent timing enumeration.
2. Every denial writes an audit record: `action = AUTHZ_DENIED`, `outcome = DENIED`, with `ruleId`, `resourceType`, `resourceRef` (hashed for non-existent resources), `correlationId`.
3. A denied page navigation renders SCR-30 "Access denied" inside the shell: heading "You don't have access to this page," the plain-language explanation, the correlation ID in a copyable field, and two actions — "Go to my dashboard" and "Go to my work queue." Never a blank page, never a stack trace.
4. SCR-30 sets `<title>Access denied — DCSA Unified Layer</title>`, moves focus to the `<h1>`, and announces the error via an `aria-live="assertive"` region.
5. Denials in embedded contexts (a dashboard widget, a related-items panel) render an inline USWDS alert rather than replacing the page.

**Outputs:** SCR-30 or inline alert; one audit record per denial.

**Validation rules:** Denial responses MUST NOT include resource titles, subject names, or existence hints.

**Error handling:** This requirement *is* the error handling; failures to audit a denial escalate per `FR-F13-01` (the request fails rather than completing unaudited).

**Acceptance criteria:**
- AC-1: An authenticated Applicant calling an Investigator-only endpoint directly is denied and the denial appears in the audit viewer (PRD F2 acceptance signal, SM-18).
- AC-2: Requests for a forbidden ID and a fabricated ID are byte-identical apart from the correlation ID.
- AC-3: SCR-30 passes the automated accessibility scan and is keyboard-navigable.

---

### FR-F02-08 — Role and attribute visibility for administrators

**Description:** Administrators can see who holds which roles and attributes, and every assignment is auditable.

**Inputs:** `GET /api/admin/users`, `GET /api/admin/users/{id}`.

**Processing / business rules:**
1. The admin console lists synthetic identities with display name, roles, all four attributes, sign-in methods allowed, and last activity timestamp.
2. The user detail view shows recent audit activity for that identity (last 50 records) with links into the audit viewer.
3. Role assignment changes are out of scope for this prototype's UI (identities are seeded), but the schema and audit action `ROLE_ASSIGNED` exist so the capability is demonstrable; any seeded change is recorded.
4. This view is Administrator-only and itself authorized and audited (`ADMIN.USER.READ`).

**Outputs:** SCR-26 User & role visibility list; SCR-27 user detail.

**Validation rules:** Pagination default 25, max 100. Search by display name or role.

**Error handling:** Standard `AUTHZ_DENIED` for non-administrators; empty state copy "No identities match your filters."

**Acceptance criteria:**
- AC-1: An administrator can see the multi-role identity and both of its roles.
- AC-2: Viewing user detail writes an audit record of type `USER_VIEWED` (read of identity data is auditable).

---
