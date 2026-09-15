## F12 — Application Registration and Onboarding Flow

**Traces to:** PRD F12 (P1 — the extensibility proof); NFR-11, SM-11, SM-12, R-07. **Screens:** SCR-28 (multi-step registration form), SCR-22/23. **API:** `Y1a §Admin — applications`.

**Description:** An in-app, UI-driven flow for registering an additional application into the unified layer, performed live during the demo as a configuration action — no code change, no redeploy, no restart. This is the feature that turns "extensible" from an assertion into an observable event.

**Terminology:**
- **Candidate application** — an application being registered, not yet in the registry.
- **Live connection test** — calling the candidate's health and `describe()` endpoints during registration, before submission is allowed.
- **Capability auto-discovery** — pre-populating work-item types and actions from the candidate's own `describe()`.
- **Demo sixth application** — "Continuous Vetting Service" (`CVS`), shipped running but unregistered.

---

### FR-F12-01 — Multi-step registration form (SCR-28)

**Description:** A guided USWDS form in five steps, each independently validated, with state preserved across steps.

**Steps and fields:**

| Step | Fields |
|---|---|
| 1. Identity | `displayName` (required), `applicationId` (required), `description` (optional), `iconToken` (required, chosen from a token picker) |
| 2. Connection | `baseEndpoint` (required), `healthEndpoint` (required), `adapterType` (required, select), `timeoutMs`, `actionTimeoutMs`, `healthTimeoutMs`, `maxRetries`, `backoffInitialMs`, `backoffMultiplier`, `circuitFailureThreshold`, `circuitOpenMs`, `healthProbeIntervalSec` (all pre-filled with defaults) |
| 3. Test connection | No inputs — runs the live test (`FR-F12-03`) and displays results. Cannot proceed until the test succeeds or the administrator explicitly acknowledges a warning-level result |
| 4. Capabilities | `workItemTypes[]` and `supportedActions[]`, pre-populated by auto-discovery (`FR-F12-04`), each confirmable and editable; status maps shown per type |
| 5. Access & review | `visibleToRoles[]` (required, none pre-selected), then a full read-only review of every value with an "Edit" link per step, and the submit action |

**Processing / business rules:**
1. Rendered with the USWDS step-indicator, `aria-current="step"` on the active step, and a text counter "Step 3 of 5."
2. Each step validates on "Continue"; failures render an error summary at the top with focus moved to it and in-page links to offending fields (`FR-F14-03`).
3. Form state is held server-side in a draft record keyed to the administrator's session, so a refresh or a session extension does not lose work. Drafts expire after 60 minutes.
4. Back navigation preserves entered values; the step indicator allows returning to any completed step.
5. Step 5's review screen is the only place submission is possible, and it restates the consequences: "{displayName} will become visible to {roles} and its work items will appear in their work queues immediately."
6. On submission the registry row is created, `registryVersion` bumps, health probing begins immediately, and the administrator lands on SCR-23 for the new application with a success alert.

**Outputs:** New registry row; application live across all surfaces.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Step validation failure | 400 | `VALIDATION_FAILED` | "There is a problem. Fix the following, then try again." + field copy (`FR-F12-02`). |
| Draft expired | 409 | `DRAFT_EXPIRED` | "Your registration draft expired. Start again — your entries weren't saved." |
| Submitted without a successful test | 400 | `CONNECTION_TEST_REQUIRED` | "Test the connection before you register this application." |

**Acceptance criteria:**
- AC-1: An administrator completes registration of CVS in under 5 minutes during a live demo (SM-11).
- AC-2: The form is completable using only the keyboard.
- AC-3: Each step's errors are announced and linked.

---

### FR-F12-02 — Field validation rules and messages

**Description:** Every field's rule and its exact error copy.

| Field | Rule | Error message |
|---|---|---|
| `displayName` | Required; 3–60 chars; unique among registered applications | "Enter a display name." / "Use between 3 and 60 characters." / "Another application already uses that name. Choose a different one." |
| `applicationId` | Required; `^[A-Z][A-Z0-9_]{1,15}$`; globally unique including de-registered IDs | "Enter an application ID." / "Use 2 to 16 characters: capital letters, numbers, and underscores, starting with a letter." / "That application ID is already in use. Choose a different one." |
| `description` | ≤500 chars | "Shorten this to 500 characters or fewer. You've used {m}." |
| `iconToken` | Required; must exist in the theme token set | "Choose an icon." / "That icon isn't available. Choose one from the list." |
| `baseEndpoint` | Required; valid absolute URL; `http`/`https`; no embedded credentials; no fragment; host resolvable | "Enter the application's base address." / "Enter a valid web address starting with http:// or https://." / "Remove the username and password from the address." / "We couldn't find a server at that address. Check it and try again." |
| `healthEndpoint` | Required; absolute URL or path relative to `baseEndpoint` | "Enter the application's health check address." / "Enter a valid address or a path starting with /." |
| `adapterType` | Required; must be a registered implementation | "Choose an adapter type." / "That adapter type isn't available." |
| `timeoutMs` | 500–30000 | "Enter a timeout between 500 and 30,000 milliseconds." |
| `actionTimeoutMs` | 1000–30000 | "Enter an action timeout between 1,000 and 30,000 milliseconds." |
| `healthTimeoutMs` | 500–10000 | "Enter a health check timeout between 500 and 10,000 milliseconds." |
| `maxRetries` | 0–5 | "Enter a number of retries between 0 and 5." |
| `backoffInitialMs` | 50–5000 | "Enter a starting backoff between 50 and 5,000 milliseconds." |
| `backoffMultiplier` | 1.0–4.0 | "Enter a backoff multiplier between 1.0 and 4.0." |
| `circuitFailureThreshold` | 2–50 | "Enter a failure threshold between 2 and 50." |
| `circuitOpenMs` | 5000–300000 | "Enter a circuit reset time between 5,000 and 300,000 milliseconds." |
| `healthProbeIntervalSec` | 10–600 | "Enter a check interval between 10 and 600 seconds." |
| `workItemTypes` | ≥0 permitted; each needs `type`, `label`, `contentProfile`, complete `statusMap` | "Give this work-item type a label." / "Map every status this application can report. Unmapped: {list}." |
| `supportedActions` | Each needs `actionId`, `label`, `appliesToTypes`, `requiredPermission` existing in the role matrix | "Choose which work-item types this action applies to." / "That permission doesn't exist in this system. Choose one from the list." |
| `visibleToRoles` | ≥1 role | "Choose at least one role that can see this application." |

**Additional rules:**
1. An application registering **zero** work-item types is permitted — it will appear in the admin inventory and health monitoring but contribute nothing to the queue. The review step states this plainly: "This application won't add any work items to users' queues."
2. `applicationId` uniqueness includes de-registered identifiers, because audit records and historical `workItemId`s reference them; reusing one would corrupt the trail.
3. Server-side validation is authoritative and repeats every client rule.

**Acceptance criteria:**
- AC-1: Every rule produces its exact message, verified by test.
- AC-2: A duplicate `applicationId` is caught with the specific message, not a generic failure.

---

### FR-F12-03 — Live connection test (step 3)

**Description:** The hub calls the candidate application before allowing registration, so a broken registration is caught in the form rather than discovered by users.

**Inputs:** `POST /api/admin/applications/test-connection` with `{ baseEndpoint, healthEndpoint, adapterType, healthTimeoutMs, timeoutMs }`.

**Processing / business rules:**
1. The hub instantiates a transient adapter of `adapterType` and calls `healthCheck()` then `describe()`. Nothing is persisted.
2. Results render as a checklist with per-check status text plus icon:
   - "Reachable at {endpoint}" — pass/fail with latency
   - "Health check responded" — pass/fail with reported status
   - "Capability description received" — pass/fail
   - "Integration version supported" — pass/fail with version
   - "Work-item types declared" — count
   - "Actions declared" — count
   - "Permissions valid" — pass/fail, listing any unknown permissions
3. **Pass** (all checks pass) → "Continue" enabled.
4. **Warning** (reachable, describe succeeded, but health reports `DEGRADED`, or zero work-item types declared) → "Continue" enabled after an explicit acknowledgement checkbox: "I understand and want to register this application anyway."
5. **Fail** (unreachable, describe failed, unsupported version, or invalid permissions) → "Continue" disabled with the reason stated and a "Test again" control. Registration is not possible until it passes.
6. The test is announced via live region: "Connection test complete. 6 of 7 checks passed."
7. The test result is stored on the draft and expires after 10 minutes; submitting with a stale result re-runs the test automatically.

**Error handling:**

| Scenario | Result | User-facing message |
|---|---|---|
| Connection refused / DNS failure | Fail | "We couldn't reach that application at {endpoint}. Check that it's running and the address is correct." |
| Health timeout | Fail | "The application didn't respond within {n} milliseconds. Check the address, or increase the health check timeout." |
| `describe()` missing or malformed | Fail | "The application responded, but didn't describe what it can do in a format we understand. It may not support this integration version." |
| Contract version unsupported | Fail | "This application uses integration version {v}, which we don't support yet. Supported versions: {list}." |
| Unknown required permission | Fail | "This application asks for permissions this system doesn't have: {list}." |
| Health `DEGRADED` | Warning | "The application responded slowly ({n} ms). You can register it, but users may see delays." |
| Zero work-item types | Warning | "This application doesn't provide any work items. It will appear in the admin console but not in users' work queues." |

**Acceptance criteria:**
- AC-1: Registering against a stopped application is blocked with the unreachable message (PRD F12 capability).
- AC-2: Each failure and warning case renders its specified copy.
- AC-3: A passing test enables progression and caches the discovered capabilities.

---

### FR-F12-04 — Capability auto-discovery (step 4)

**Description:** Where `describe()` is supported, capabilities are pre-populated from the application's own declaration and shown for confirmation.

**Processing / business rules:**
1. Work-item types, their labels, content profiles, status maps, and priority handling are pre-filled from `describe()`, each marked "Reported by the application."
2. Actions are pre-filled with `actionId`, `label`, `appliesToTypes`, `requiredPermission`, and `formSchema`.
3. The administrator may edit labels and `visibleToRoles` but **may not invent** types or actions the application did not declare — doing so would register capabilities the adapter cannot deliver, producing exactly the dead controls the product forbids. The form states this: "Only capabilities the application reports can be registered."
4. The administrator may **remove** a declared type or action to limit what is exposed; removals are recorded in the registry row and audited.
5. Status maps are shown as an editable table; an incomplete map blocks progression with the unmapped statuses listed.
6. If `describe()` is unsupported by the adapter type, step 4 presents empty lists with guidance: "This application doesn't describe its own capabilities. It will be registered with no work-item types."

**Acceptance criteria:**
- AC-1: CVS's declared types and actions appear pre-filled and correct.
- AC-2: Removing a declared action prevents it from appearing anywhere in the UI.
- AC-3: An incomplete status map blocks submission with the specific unmapped values listed.

---

### FR-F12-05 — Post-registration propagation

**Description:** What must be true immediately after submission, with no restart.

**Processing / business rules:**
1. Registry row created; `registryVersion` incremented.
2. The application appears at once in: admin inventory (SCR-22), health monitoring (SCR-24, first probe issued immediately), the role-scoped navigation of every role in `visibleToRoles`, work-queue fan-out, search fan-out (if `supportsSearch`), and related-item resolution targets.
3. Users with an open session receive updated navigation on their next `registryVersion` poll (≤30 s) without signing out or reloading.
4. An audit record `APPLICATION_REGISTERED` is written with the administrator, the application ID, and a summary of the configuration.
5. **The demo assertion:** an administrator registers CVS, and an investigator already signed in sees CVS work items in the unified queue within one poll — zero code changes, zero restarts (SM-11, SM-12, PRD F12 acceptance signal).

**Acceptance criteria:**
- AC-1: The full propagation list is satisfied within 30 seconds of submission.
- AC-2: A signed-in investigator's navigation and queue update without re-authentication.
- AC-3: One audit record is written naming the administrator and configuration.

---

### FR-F12-06 — The demo sixth application (CVS)

**Description:** A synthetic sixth service shipped running but unregistered, existing specifically so registration can be performed live.

**Processing / business rules:**
1. "Continuous Vetting Service" (`applicationId: CVS`) runs as a sixth spoke process with its own namespace (`Y0b §CVS`), implementing the full adapter contract and passing the conformance suite.
2. It is **not** present in the seeded registry. Its absence from navigation, queue, and console before registration is itself part of the demonstration.
3. Its seeded data includes work items assignable to the investigator persona, so registering it produces an immediately visible change in that persona's queue — the demo needs a visible consequence, not just a new console row.
4. Work-item type: `CVS_ALERT` with statuses `NEW`, `UNDER_REVIEW`, `CLEARED`, `ESCALATED`. Actions: `ACKNOWLEDGE_ALERT`, `CLEAR_ALERT` (reason required), `ESCALATE_ALERT`.
5. `FR-F17-11`'s reset command returns CVS to unregistered, so the registration demo is repeatable (SM-22).
6. CVS is functionally ordinary: no special-casing anywhere in the hub, which is the entire point.

**Acceptance criteria:**
- AC-1: Before registration, CVS appears nowhere in the UI.
- AC-2: After registration, CVS items appear in the investigator queue, correctly attributed with its display name and icon.
- AC-3: Reset returns the system to the unregistered state, and the demo repeats identically.

---

### FR-F12-07 — Edit and de-register flows

**Description:** Changing and removing a registered application, both fully audited.

**Inputs:** `PATCH /api/admin/applications/{id}`; `DELETE /api/admin/applications/{id}` with `{ reason }`.

**Processing / business rules:**
1. **Edit** reuses SCR-28 in edit mode with values pre-filled. `applicationId` is displayed read-only with an explanation: "The application ID can't be changed because existing records refer to it."
2. Changing `baseEndpoint`, `healthEndpoint`, or `adapterType` re-requires a passing connection test before saving.
3. Edits write an audit record with a before/after summary of exactly which fields changed.
4. **De-register** requires typed confirmation of the display name plus a reason (10–500 chars), and states consequences: "This removes {name} from navigation, the work queue, search, and health monitoring for all users. {n} work items will stop appearing. Audit records that mention {name} are kept."
5. De-registration removes the registry row, bumps `registryVersion`, stops health probing, and drops the application from every surface — with no code change and no errors anywhere (PRD F8 acceptance signal).
6. Audit records referencing the de-registered application are retained and remain readable; the audit viewer shows the stored display name from the record, not a lookup, so history stays legible after removal.
7. De-registering an application that is a leg in an orchestration definition warns that those workflows will fail, and the warning is recorded with the audit entry.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Confirmation text mismatch | 400 | `VALIDATION_FAILED` | "The name you typed doesn't match. Type {displayName} exactly to confirm." |
| Missing reason | 400 | `VALIDATION_FAILED` | "Enter a reason for removing this application." |
| Application not found | 404 | `APPLICATION_NOT_FOUND` | "We couldn't find that application. It may have already been removed." |
| Attempt to change `applicationId` | 400 | `IMMUTABLE_FIELD` | "The application ID can't be changed because existing records refer to it." |

**Acceptance criteria:**
- AC-1: De-registering removes the application cleanly from navigation, queue, search, and console, with no errors (PRD F8 acceptance signal).
- AC-2: Audit records naming the removed application remain readable afterwards.
- AC-3: Both edit and de-register write audit records naming the administrator, the application, and the change.

---

### FR-F12-08 — Onboarding documentation

**Description:** What a new application must implement to be registerable, generated alongside the prototype.

**Processing / business rules:**
1. A document is produced covering: the adapter interface (`FR-F08a-01`), the `describe()` schema, the normalized WorkItem model, status map requirements, the principal assertion contract, scope enforcement obligations, idempotency requirements, health endpoint expectations, the error taxonomy, and how to run the conformance suite standalone.
2. It is linked from SCR-28 step 1 ("What does an application need to support?") and from SCR-22, so it is discoverable where it is needed rather than only in a repository.
3. CVS serves as the worked reference implementation and is named as such.

**Acceptance criteria:**
- AC-1: A developer can implement a conformant adapter from this document plus the conformance suite alone.
- AC-2: The document is reachable from within the application.

---
