## F6 — Work-Item Detail and Action Completion

**Traces to:** PRD F6 (P0). **Screens:** SCR-14 generic detail, SCR-15 eApp case view, SCR-16 PVQ issue detail, SCR-17 PDT designation view, SCR-18 IEP applicant status view, SCR-19 IM case assignment view. **API:** `Y1a §Work Items`.

**Description:** The page where work actually gets done. It renders the full record from its owning spoke, exposes only the actions this principal is authorized to perform on this specific item in its current state, executes those actions through the adapter, writes audit, and shows the item's complete activity history merged from the spoke and the hub. It also carries the related-items panel that is the on-ramp to the flagship workflow.

**Terminology:**
- **Owning spoke** — the system of record for the item; the only system whose state the detail page reports.
- **Action form** — a USWDS form generated from the `ActionDescriptor.formSchema`.
- **Related items panel** — cross-system relationships rendered inline (§3.4).
- **Merged history** — the union of spoke-native activity and hub audit records for the item.

---

### FR-F06-01 — Work-item detail screen (SCR-14)

**Description:** The generic Detail template every item type specializes.

**Inputs:** `GET /api/work-items/{workItemId}` where `workItemId = {sourceSystem}:{nativeId}`; optional `returnTo`.

**Processing / business rules:**
1. Authorization is resource-level (`FR-F02-01` steps 1–4) before any content is composed.
2. The hub resolves `sourceSystem` from the registry, calls `getWorkItem(principal, scope, nativeId)`, and validates the response against the detail schema.
3. Response composition: `{ item (WorkItem + typeSpecificDetail), availableActions: ActionDescriptor[], relatedRefs: RelatedRef[], breadcrumbTrail[], stateVersion, sourceHealth, redactions[] }`.
4. Page regions in document order: breadcrumb → `<h1>` (item title) → summary header (source badge, subject, status, priority, due date, assignee, last activity) → type-specific content sections → related items panel → action panel → activity history.
5. The summary header repeats the source system in text ("System of record: PVQ — Personnel Vetting Questionnaire").
6. `stateVersion` is rendered into the action forms as a hidden field for optimistic concurrency (`FR-F02-05`).
7. Deep-linking directly to this URL while unauthenticated triggers login with `returnTo` and lands here afterwards, with exactly one authentication event (`FR-F01-03`).

**Outputs:** SCR-14 (or a type-specific variant) fully populated.

**Validation rules:** `workItemId` matches `^[A-Z0-9_]{2,16}:[A-Za-z0-9._\-]{1,64}$`. Malformed IDs return the same 403 as a forbidden item — the format of an identifier is not a disclosure channel.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Not authorized / not found | 403 | `AUTHZ_DENIED` | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {correlationId}." |
| Owning system unavailable | 503 | `UPSTREAM_UNAVAILABLE` | "{System} isn't responding right now, so we can't show this item. Your other work is still available." with "Try again" and "Back to work queue." |
| Owning application disabled | 409 | `APPLICATION_DISABLED` | "{System} is turned off in this environment. Contact your administrator if you need access." |
| Malformed detail from spoke | 502 | `UPSTREAM_CONTRACT_ERROR` | "We couldn't read this item from {System}. We've logged the problem — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Each role can open at least one item and see full detail with correct attribution.
- AC-2: A forbidden item and a non-existent item are indistinguishable in the response.
- AC-3: With the owning spoke down, the page renders the error state inside the shell, never a blank page.

---

### FR-F06-02 — Type-specific detail content

**Description:** What each item type shows, so no detail page is a generic key/value dump.

**Processing / business rules:** Each work-item type declares a render profile in the registry (`contentProfile`), and the UI maps it to a section layout. Unknown profiles fall back to a labelled definition-list rendering — never an empty page.

| Type | Screen | Sections |
|---|---|---|
| `EAPP_CASE_REVIEW` | SCR-15 | Case summary; questionnaire sections with answers (collapsible, heading-structured); submission history; outstanding issues; related PVQ issues, PDT designation, IM assignment |
| `PVQ_ISSUE` | SCR-16 | Issue summary; the flagged question and answer quoted in context; issue history; resolution form; link back to the parent eApp case |
| `PDT_DESIGNATION` | SCR-17 | Position details; sensitivity and risk factors; computed investigation tier; review history |
| `IEP_TASK` / `IEP_NOTICE` | SCR-18 | Plain-language description; what is required; due date; notice body; acknowledge/submit action |
| `IM_CASE_ASSIGNMENT` | SCR-19 | Case summary; assigned leads; workload context; status transitions |

Additional rules:
1. Questionnaire answers on SCR-15 render as accessible disclosure sections with `<h3>` headings, expanded state announced, and deep-linkable anchors (`#SECTION_13A`) so a related issue can point at the exact answer.
2. Every displayed record carries its synthetic marker (`FR-F17-08`) visible in the summary header: "Synthetic record — demo data."
3. Redacted fields (applicant view) are absent from the payload; the UI does not render a "hidden" placeholder that implies concealed content about them.

**Acceptance criteria:**
- AC-1: All five type screens are implemented and populated from seed data.
- AC-2: SCR-15 supports anchor navigation to a named questionnaire section.

---

### FR-F06-03 — Server-computed action list and rendering

**Description:** Only authorized, currently-valid actions are offered, and each is explained.

**Inputs:** `availableActions` from `FR-F02-05`.

**Processing / business rules:**
1. The action panel renders one control per descriptor, grouped: primary action (at most one, USWDS primary button), secondary actions, destructive actions (with confirmation).
2. `enabled: false` descriptors render as disabled controls with the `disabledReason` displayed as adjacent text, programmatically associated via `aria-describedby`. Disabled controls are focusable-by-description: the reason is available to assistive technology without requiring focus on a disabled element.
3. Actions whose `targetSystems.length > 1` display a note: "This updates {System A} and {System B}." — the user is told before they act that two systems change.
4. Actions targeting an unavailable system are forced to `enabled: false` with reason "{System} isn't responding right now. Try again when it's back." (`FR-F16-04`).
5. The list is recomputed after every successful action; the page does not keep a stale action panel.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Action posted that is not in the list | 403 | `AUTHZ_DENIED` | "You don't have permission to do that." |
| Action invalid for current state | 409 | `ACTION_NOT_AVAILABLE` | "This action isn't available for this item right now. Refresh the page to see the current options." |

**Acceptance criteria:**
- AC-1: The same item shows different action sets to Investigator and Adjudicator (demo script §RBAC).
- AC-2: Disabled actions always state why.

---

### FR-F06-04 — Action forms, validation, and submission

**Description:** How a user supplies input for an action and how that input is validated on both sides.

**Inputs:** `POST /api/work-items/{id}/actions/{actionId}` with `{ stateVersion, payload: {...} }` and the CSRF header.

**Processing / business rules:**
1. Forms are generated from `formSchema`: each field declares `{ fieldId, label, type (text|textarea|select|radio|checkbox|date), required, maxLength, options[], hint, validationMessage }`.
2. Client-side validation runs on submit (not on every keystroke) and mirrors the server rules. **The server is authoritative and revalidates everything.**
3. On validation failure the UI renders a USWDS error summary at the top of the form with `role="alert"`, focus moved to the summary, each entry linking to its field; each field shows an inline error associated by `aria-describedby` and marked `aria-invalid="true"` (`FR-F14-03`).
4. Submission is **not optimistic**: the UI shows a busy state and reflects the new state only after the spoke confirms the write. Displayed state never diverges from the system of record (PRD F6).
5. Order of operations for a single-system action:
   a. Re-authorize (`FR-F02-05`) → b. Validate payload → c. Call adapter `performAction` → d. On success, write audit (`FR-F13-01`) → e. Re-read item state from the spoke → f. Return the new state and a confirmation message. If the audit write fails, the operation is reported as failed (`FR-F13-01` rule 4) and a compensation note is recorded.
6. Double-submit protection: the action request carries an `idempotencyKey` (client-generated ULID). A repeat with the same key within 10 minutes returns the original outcome without re-executing.
7. Success renders a USWDS success alert naming exactly what changed and where: "Issue ISS-2207 marked Resolved — Substantiated in PVQ." announced via `aria-live="polite"`, with focus moved to the alert.

**Validation rules (generic, applied to every action payload):**
- Required fields present and non-empty after trim → "Enter {label}." / "Select {label}."
- `maxLength` enforced; textarea narrative fields default to 4000 characters → "Shorten this to {n} characters or fewer. You've used {m}."
- Select/radio values must be in `options` → "Choose a valid {label}."
- Dates must be ISO-8601 and within ±5 years → "Enter a valid date."
- Unknown payload fields are rejected rather than ignored → `VALIDATION_FAILED`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Validation failure | 400 | `VALIDATION_FAILED` | Summary: "There is a problem. Fix the following, then try again." plus per-field copy above. |
| Stale state | 409 | `STATE_CONFLICT` | "This item changed since you opened it. Refresh to see the latest version, then try again." |
| Spoke rejected the action | 422 | `UPSTREAM_REJECTED_ACTION` | "{System} couldn't complete this action: {spoke-provided plain reason}. Nothing was changed." |
| Spoke unavailable | 503 | `UPSTREAM_UNAVAILABLE` | "{System} isn't responding right now, so nothing was changed. Try again in a moment." |
| Spoke timed out after write may have occurred | 502 | `UPSTREAM_INDETERMINATE` | "We're not sure whether {System} completed this action. Refresh this item to check its current status before trying again — reference {correlationId}." |
| Audit write failed | 500 | `AUDIT_WRITE_FAILED` | "We couldn't record this action, so it wasn't completed. Try again — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Each role completes at least one real, persisted action visible in both the spoke's own API and the audit trail (PRD F6 acceptance signal).
- AC-2: A double-submitted action executes once.
- AC-3: Error summary focus management and field association pass the accessibility scan.

---

### FR-F06-05 — Related items panel (on-ramp to F7)

**Description:** Cross-system relationships surfaced inline, resolved live, never hard-coded.

**Inputs:** `relatedRefs` from the owning spoke.

**Processing / business rules:**
1. The owning spoke returns opaque references (§3.4). The hub resolves each by calling the target application's adapter for a lightweight summary (`getWorkItemSummary`), concurrently and with the same timeout/circuit policy as the queue.
2. Each related item renders: relationship label ("Issue raised against Section 13A employment history"), the target system badge, the target item's title and status, and a link into that item's detail screen **inside the unified shell**.
3. Unresolvable references (target system down, principal not entitled) render with `resolvable: false` and an explanation — "PVQ isn't responding right now, so this related issue can't be opened." — rather than a broken link or a silent omission. Entitlement failures read: "You don't have access to the related item in {System}."
4. The panel groups by relationship type with a heading per group and a count.
5. Selecting a related item carries breadcrumb context (`FR-F03-06`) and a `returnTo` back to the originating item.
6. The panel is a `<section aria-labelledby>` with an accessible list, not a bare set of links.

**Outputs:** Related items panel; the traversal path for `FR-F07a-03`.

**Validation rules:** A `RelatedRef` whose `targetSystem` is not in the registry is dropped and logged as `INTEGRATION_UNKNOWN_TARGET`; it is never rendered as a dead link.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Target system unavailable | 200 | — | "{System} isn't responding right now, so this related item can't be opened." |
| Not entitled to target | 200 | — | "You don't have access to the related item in {System}." |
| No related items | 200 | — | "No related items in other systems." |

**Acceptance criteria:**
- AC-1: eApp case A-1042 shows its related PVQ issue, PDT designation, and IM assignment, each correctly badged.
- AC-2: The relationship is sourced live through the adapter; deleting the relationship in PVQ's store removes it from the panel without a code change.

---

### FR-F06-06 — Activity history (merged spoke + hub)

**Description:** A single chronological history combining what the spoke recorded and what the hub audited.

**Inputs:** `getActivityHistory(principal, nativeId)` from the owning adapter; `Y0a.audit_events` filtered by target resource.

**Processing / business rules:**
1. The hub merges both sources into `ActivityEvent[]` (§3.5), sorted `occurredAt DESC`, tie-broken by `origin` (HUB after SPOKE for the same instant, since the hub writes after the spoke confirms).
2. Each row shows: timestamp (absolute, UTC, plus relative "2 hours ago"), actor, actor role, action summary, origin badge ("Recorded by PVQ" vs "Recorded by the unified layer"), and the correlation ID as a link to the audit chain view (SCR-34) where the principal is entitled to see it.
3. Mission users see hub records that are their own or that concern this item and are within their scope; administrators see all. Applicants see a simplified history with internal narratives redacted.
4. History is paginated (20 per page) with an accessible "Load more" control that appends and announces "{n} more entries loaded."
5. If the spoke's history call fails, hub records still render with a notice: "Some history from {System} isn't available right now."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Spoke history unavailable | 200 | — | "Some history from {System} isn't available right now." |
| No history | 200 | — | "No activity recorded yet." |

**Acceptance criteria:**
- AC-1: A completed action appears in the history from both origins within the same view.
- AC-2: The correlation link opens the chain view showing all records for that action.

---

### FR-F06-07 — Confirmation, failure differentiation, and recovery paths

**Description:** The user always knows what happened, in which system, and what to do next.

**Processing / business rules:**
1. Success states name the item, the change, and the system(s): "Case A-1042 updated in eApp. Outstanding issue cleared."
2. Failure states are differentiated into exactly four user-visible classes, each with its own recovery action:
   - **Not permitted** → "You don't have permission to do that." Action: return to the item (no retry offered, because retrying will not help).
   - **Input invalid** → error summary with per-field guidance. Action: fix and resubmit.
   - **Source unavailable** → "{System} isn't responding right now, so nothing was changed." Action: "Try again" plus "Back to work queue."
   - **Unexpected error** → "Something went wrong on our side. Nothing was changed. Reference {correlationId}." Action: "Try again" plus "Go to dashboard."
3. Every failure message states whether anything changed. Ambiguity is only permitted for `UPSTREAM_INDETERMINATE`, whose copy explicitly says the outcome is unknown and tells the user how to check.
4. No failure message contains a stack trace, exception class, hostname, port, SQL, or spoke-internal identifier.
5. Every failure displays a copyable correlation ID.

**Acceptance criteria:**
- AC-1: Each of the four classes is reachable in the demo and renders its designed presentation.
- AC-2: Automated scan finds zero stack traces or internal identifiers in user-facing error copy.

---

### FR-F06-08 — eApp case view specifics (SCR-15)

**Processing / business rules:**
1. Header shows case reference, subject, submission date, case status, outstanding-issue count, and assigned investigator.
2. **Outstanding issues indicator** is a first-class element: "1 outstanding issue" with a link into the related items panel. When the flagship workflow resolves the issue, this indicator changes to "No outstanding issues" — the visible proof that eApp changed (`FR-F07b-05`).
3. Questionnaire sections render as disclosures with stable anchors; the section referenced by a related PVQ issue is highlighted with a text marker ("Issue raised on this section") when arrived at via the related-item link.
4. Actions available to an Investigator: `ACKNOWLEDGE_ASSIGNMENT`, `REQUEST_CLARIFICATION`, `RECORD_FINDING`. To an Adjudicator: `ADJUDICATE_CASE`, `RETURN_FOR_CLARIFICATION`. To the owning Applicant: `SUBMIT_APPLICANT_RESPONSE` (only when the case is in `INFORMATION_REQUESTED`).

**Acceptance criteria:**
- AC-1: The outstanding-issue indicator reflects eApp's state as returned by its own API, not a hub-computed guess.

---

### FR-F06-09 — PDT designation view specifics (SCR-17)

**Processing / business rules:**
1. Shows position title, organization, sensitivity level, risk factors as an accessible table, and the resulting investigation tier with the rule that produced it stated in text.
2. Actions: Adjudicator `APPROVE_DESIGNATION` / `RETURN_DESIGNATION` (with required reason); Investigator read-only; Administrator read-only via admin context.
3. Approval writes to PDT only (single-system action) and records audit.

**Acceptance criteria:** AC-1: An adjudicator approves a designation and PDT's own API reflects the new state.

---

### FR-F06-10 — IEP applicant status view specifics (SCR-18)

**Processing / business rules:**
1. Shows the applicant's status record, notices list, and outstanding tasks in plain language, with no internal case jargon.
2. Actions: `ACKNOWLEDGE_NOTICE`, `COMPLETE_TASK` (with a task-specific form), both scoped to `subjectRef` at the data layer.
3. Notices support read/unread with an accessible toggle; state persists in IEP's own store, not the hub's, because it is IEP's record.
4. The zero-item applicant persona renders designed empty states here (`FR-F17-06`).

**Acceptance criteria:** AC-1: An applicant completes a task and IEP's own API shows the task closed. AC-2: A second applicant's task is unreachable by ID.

---

### FR-F06-11 — IM case assignment view specifics (SCR-19)

**Processing / business rules:**
1. Shows case, assignment, leads list, investigator workload context, and status.
2. Actions: Investigator `ACCEPT_ASSIGNMENT`, `UPDATE_CASE_STATUS`, `ADD_LEAD_NOTE`; Adjudicator read.
3. IM is the spoke used for the forced-outage demonstration (`FR-F16-11`), so this screen must render its unavailable state cleanly and is explicitly covered by `FR-F19-04`.

**Acceptance criteria:** AC-1: With IM down, SCR-19 shows the unavailable state with working exits and no console errors.

---

### FR-F06-12 — Return-to-queue navigation

**Processing / business rules:**
1. A persistent "Back to work queue" control appears above the `<h1>` and in the action panel footer, restoring filters, sort, page, and focus (`FR-F05-09`).
2. After a successful action the user remains on the detail page with the updated state and a success alert; a secondary control offers "Back to work queue." The user is never involuntarily navigated away from evidence of what they just did.

**Acceptance criteria:** AC-1: Return navigation restores the exact prior queue view in all tested paths.

---
