## F7 (part A) — Flagship Cross-Application Workflow: the User Journey

**Traces to:** PRD F7 (P0 — highest priority feature in the product); SM-01, SM-02, SM-03, SM-04, SM-20. **Screens:** SCR-13 → SCR-15 → SCR-16 → SCR-20. **API:** `Y1a §Work Items`, `Y1a §Orchestration`.

**Description:** An investigator, signed in once, opens an eApp case from the unified work queue, discovers a related PVQ issue raised against a specific questionnaire answer, opens and resolves that issue without leaving the unified experience, and observes both eApp and PVQ reflect the change. No second login, no second application, no re-entry of context, no manual correlation. This chunk specifies the journey, step by step, including the relationship model that makes discovery possible. Part B (`F07b`) specifies the orchestrated dual write, its compensation behavior, the confirmation view, and the audit chain.

If everything else in this product fails, this must work.

**Terminology:**
- **Parent case** — the eApp case record the issue was raised against (`EAPP:CASE-A-1042` in the seeded demo).
- **Issue item** — the PVQ record referencing that case and a specific answer (`PVQ:ISS-2207`).
- **Answer locus** — the precise questionnaire coordinate the issue concerns, e.g. `SECTION_13A.employer[0].endDate`.
- **Traversal** — navigation from the case to the issue within the unified shell, carrying context.
- **Disposition** — the investigator's resolution outcome, from a controlled vocabulary.

---

### FR-F07a-01 — The eApp ↔ PVQ relationship model

**Description:** The cross-system reference that makes the workflow real rather than staged. There is no shared database and no join; the relationship is an opaque reference the hub resolves through adapters.

**Processing / business rules:**
1. **PVQ owns the relationship.** A PVQ issue record carries:
   - `parentCaseRef` (string, required) — the eApp case's native identifier, e.g. `CASE-A-1042`. Opaque to PVQ; PVQ never resolves it and never queries eApp.
   - `parentSystem` (string, required, constant `EAPP`) — which system the reference belongs to.
   - `answerLocus` (string, required) — the questionnaire coordinate, e.g. `SECTION_13A.employer[0].endDate`.
   - `answerSectionLabel` (string, required) — human copy, e.g. "Section 13A — Employment history".
   - `answerSnapshot` (string, required) — the answer text as it stood when the issue was raised, stored by PVQ so the issue is readable even if the answer later changes.
   - `subjectRef` (string, required) — the same synthetic subject identifier eApp uses, so the hub can cross-check scope.
2. **eApp holds the counterpart state, not the relationship.** An eApp case carries `outstandingIssueCount` (integer) and `outstandingIssueRefs` (array of opaque PVQ issue identifiers) plus `caseState`. eApp does not know what a PVQ issue contains; it knows only that N remain outstanding.
3. **The hub resolves, and only the hub resolves.** On `GET /api/work-items/EAPP:CASE-A-1042`, the eApp adapter returns `outstandingIssueRefs`; the hub converts each into a `RelatedRef` with `relationshipType: HAS_ISSUE`, `targetSystem: PVQ`, then calls the PVQ adapter for a summary. Symmetrically, the PVQ issue returns a `RelatedRef` with `relationshipType: ISSUE_AGAINST`, `targetSystem: EAPP`.
4. **Consistency cross-check.** When resolving, the hub verifies that the PVQ issue's `subjectRef` matches the eApp case's `subjectRef`. A mismatch means the two systems disagree; the reference renders as unresolvable with "This related item couldn't be confirmed. We've logged the problem — reference {correlationId}." and an `INTEGRATION_REFERENCE_MISMATCH` issue is recorded. The hub never displays a relationship it cannot corroborate.
5. No foreign key, no shared table, and no cross-namespace read exists anywhere in the implementation (NFR-08, SM-13).

**Inputs:** eApp case record; PVQ issue record; registry entries for both.

**Outputs:** Bidirectional `RelatedRef` entries resolvable in either direction.

**Validation rules:** `parentCaseRef` non-empty; `answerLocus` matches `^[A-Z0-9_]+(\.[A-Za-z0-9_\[\]]+)*$`; `subjectRef` matches the seeded subject format.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Referenced case not found in eApp | 200 | — | Related panel: "The related case couldn't be found in eApp. We've logged the problem — reference {correlationId}." |
| Subject mismatch between systems | 200 | — | "This related item couldn't be confirmed. We've logged the problem — reference {correlationId}." |
| PVQ unavailable | 200 | — | "PVQ isn't responding right now, so this related issue can't be opened." |

**Acceptance criteria:**
- AC-1: The relationship is discoverable in both directions through adapters only; an architecture test confirms zero cross-namespace queries.
- AC-2: Editing `parentCaseRef` directly in PVQ's store changes what the case page shows, proving the link is live rather than hard-coded.

---

### FR-F07a-02 — Step 1–2: Entry from the queue and case detail (SCR-13 → SCR-15)

**Description:** The investigator finds the case in the unified queue and opens it.

**Inputs:** Investigator session; queue at default view.

**Processing / business rules:**
1. The seeded investigator's default queue (`assignee=me`, sorted by due date ascending) contains `EAPP:CASE-A-1042` on page 1. The demo does not require filtering to find it, though filtering to source system `eApp` also surfaces it (`FR-F18-05` documents both paths).
2. The row is attributed "eApp" and shows subject, status "Under review", priority, and due date.
3. Activating the row navigates to SCR-15 with `returnTo` encoding the queue state, and sets the breadcrumb `Work Queue › eApp Case A-1042`.
4. SCR-15 loads case detail via the eApp adapter and the related items panel via the PVQ, PDT, and IM adapters concurrently (`FR-F06-05`). The main case content does not wait on the related panel: case detail renders first; the related panel renders its own skeleton and resolves independently.
5. The header shows **"1 outstanding issue"** as a link to the related items panel, with an anchor that moves focus to the panel heading.
6. Elapsed time from row activation to case content rendered: ≤2 seconds under seeded data (NFR-17).

**Outputs:** SCR-15 populated, related panel resolved, outstanding-issue indicator visible.

**Validation rules:** The investigator must be the assignee or in-unit per `ATTR-INV-01`; the demo persona is the assignee, which also grants the act permission needed later.

**Error handling:** Per `FR-F06-01`. If PVQ is down at this step, the case still opens; the related panel shows the PVQ-unavailable state and the workflow is blocked with an explanation rather than a broken page — and `FR-F18-09` documents this as a demo-day contingency.

**Acceptance criteria:**
- AC-1: The case opens from the queue in one activation with no interstitial.
- AC-2: The outstanding-issue indicator is present and links to the related panel.
- AC-3: Zero authentication events occur during this step.

---

### FR-F07a-03 — Step 3: Discovery and traversal to the PVQ issue (SCR-15 → SCR-16)

**Description:** The moment the product's thesis is either proven or lost: moving from one system's record to another's without leaving the experience.

**Inputs:** `RelatedRef { relationshipType: HAS_ISSUE, targetSystem: PVQ, targetNativeId: ISS-2207, label, contextHint }`.

**Processing / business rules:**
1. The related items panel renders the issue with its **explained relationship**, sourced from PVQ's `answerSectionLabel`, not composed by the UI:
   **"Issue raised against Section 13A — Employment history"**, with the PVQ badge, issue status "Open", raised date, and the issue title.
2. Activating it performs a client-side route change to `/work/PVQ:ISS-2207?returnTo=…&from=EAPP:CASE-A-1042`. Requirements on this transition:
   - It MUST be an in-shell navigation. No new tab, no window open, no redirect to a spoke origin, no iframe.
   - It MUST NOT trigger any authentication prompt, interstitial, or loading screen that replaces the shell. The header, banner, and navigation remain mounted throughout.
   - Breadcrumb becomes `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207`, with source badges on the second and third segments.
   - Focus moves to the new page's `<h1>`, and the page title updates (`FR-F03-01`).
   - No identifier is typed, copied, or re-entered by the user at any point (SM-04).
3. SCR-16 renders with the case context preserved in a "Related case" summary strip at the top: "Part of eApp Case A-1042 — {subject name}", itself a link back.
4. The issue detail quotes the flagged answer in context: the question text, the `answerSnapshot`, and the `answerSectionLabel`. The investigator can also open the parent case's exact section via a link that deep-anchors to `#SECTION_13A` on SCR-15 (`FR-F06-08`).
5. The transition writes one audit record `RELATED_ITEM_TRAVERSED` with both `EAPP:CASE-A-1042` and `PVQ:ISS-2207` and the workflow correlation ID, so the audit chain shows the traversal, not just the endpoints.

**Outputs:** SCR-16 with case context, quoted answer, and the resolution form available.

**Validation rules:**
- The `from` parameter is validated as a well-formed `workItemId` and is used only for breadcrumb and audit context — it never influences authorization. Authorization for the issue is evaluated independently (`FR-F02-01`).
- If the principal is entitled to the case but not the issue, traversal is denied with the standard denial; the case page's related panel would have already shown "You don't have access to the related item in PVQ."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| PVQ unavailable at traversal | 503 | `UPSTREAM_UNAVAILABLE` | "PVQ isn't responding right now, so we can't open this issue. Your other work is still available." with "Try again" and "Back to the case." |
| Not entitled to the issue | 403 | `AUTHZ_DENIED` | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {correlationId}." |
| Issue already resolved by someone else | 200 | — | Banner on SCR-16: "This issue was already resolved by {actor} on {date}. No further action is needed." Resolution form is disabled with that reason. |

**Acceptance criteria:**
- AC-1: Traversal produces zero authentication events and zero navigations outside the hub origin (asserted by E2E test, SM-02).
- AC-2: The breadcrumb names both systems; the case context strip is present on SCR-16.
- AC-3: The relationship label is sourced from PVQ's data, verified by changing the seeded label and observing the UI change.

---

### FR-F07a-04 — Step 4: The resolution form (SCR-16)

**Description:** What the investigator fills in to resolve the issue, and how it is validated.

**Inputs:** `POST /api/orchestration/resolve-pvq-issue` (the orchestrated endpoint, specified in `F07b`) with:
- `issueId` (string, required) — `PVQ:ISS-2207`
- `parentCaseId` (string, required) — `EAPP:CASE-A-1042`, echoed from the detail response, re-verified server-side
- `disposition` (enum, required) — `SUBSTANTIATED` | `UNSUBSTANTIATED` | `RESOLVED_WITH_CLARIFICATION` | `REFERRED_FOR_FURTHER_REVIEW`
- `resolutionNarrative` (string, required, 20–4000 chars)
- `reviewedAnswerConfirmed` (boolean, required, must be `true`)
- `stateVersion` (string, required) — from the detail response
- `idempotencyKey` (string, required) — client ULID
- CSRF header required

**Processing / business rules:**
1. The form is a USWDS form built from the `RESOLVE_ISSUE` `ActionDescriptor.formSchema`:
   - A radio group for disposition inside a `<fieldset>` with `<legend>` "Resolution disposition", each option carrying hint text explaining what it means. Radio (not select) because the options are few and consequential.
   - A textarea for the narrative with a character counter announced politely at 90% and 100% of limit.
   - A checkbox "I have reviewed the flagged answer" — required, acting as the deliberate-action gate.
2. The action panel displays the dual-system notice before submission: **"This updates PVQ and eApp."**
3. On submit the UI disables the primary button, shows a busy state with `aria-busy`, and announces "Resolving issue. This updates two systems."
4. The submission is **not optimistic**. The UI shows the result only after `F07b` orchestration returns per-system outcomes.
5. `REFERRED_FOR_FURTHER_REVIEW` does **not** clear the eApp outstanding-issue state: the issue moves to PVQ status `REFERRED` and eApp's outstanding count is unchanged. This is specified deliberately so the dual-write is not a blanket rule but a disposition-driven one, and so the demo can show both a clearing and a non-clearing path. Which spokes are written for each disposition:

   | Disposition | PVQ result | eApp result | targetSystems |
   |---|---|---|---|
   | `SUBSTANTIATED` | `RESOLVED_SUBSTANTIATED` | outstanding count −1; if 0 → `caseState = REVIEW_COMPLETE_PENDING_ADJUDICATION` | PVQ, EAPP |
   | `UNSUBSTANTIATED` | `RESOLVED_UNSUBSTANTIATED` | outstanding count −1; same state rule | PVQ, EAPP |
   | `RESOLVED_WITH_CLARIFICATION` | `RESOLVED_WITH_CLARIFICATION` | outstanding count −1; same state rule | PVQ, EAPP |
   | `REFERRED_FOR_FURTHER_REVIEW` | `REFERRED` | unchanged | PVQ |

6. The flagship demo path uses `SUBSTANTIATED` (`FR-F18-05`).

**Validation rules (server-authoritative, mirrored client-side):**
- `disposition` ∈ the four values → "Choose a resolution disposition."
- `resolutionNarrative` trimmed length ≥20 → "Enter at least 20 characters describing how you resolved this issue." ; ≤4000 → "Shorten this to 4000 characters or fewer. You've used {m}."
- `reviewedAnswerConfirmed === true` → "Confirm that you have reviewed the flagged answer."
- `parentCaseId` MUST match the issue's actual `parentCaseRef` resolved server-side from PVQ. A mismatch is rejected: the client does not get to tell the server which case to update.
- `stateVersion` current → else `STATE_CONFLICT`.
- Principal MUST hold `ISSUE.RESOLVE` and be the assignee of the parent case (`ATTR-INV-02`).

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Validation failure | 400 | `VALIDATION_FAILED` | "There is a problem. Fix the following, then try again." + per-field copy above. |
| Parent case mismatch | 400 | `RELATIONSHIP_MISMATCH` | "We couldn't confirm which case this issue belongs to. Refresh the page and try again — reference {correlationId}." |
| Not the assignee | 403 | `AUTHZ_DENIED` | "You don't have permission to resolve this issue." |
| Issue already resolved | 409 | `ACTION_NOT_AVAILABLE` | "This issue was already resolved. Refresh the page to see its current status." |
| Either system unavailable at submit | 503 | `UPSTREAM_UNAVAILABLE` | "{System} isn't responding right now, so nothing was changed. Try again in a moment." |

**Acceptance criteria:**
- AC-1: The form validates identically client-side and server-side; disabling JavaScript-side validation does not permit an invalid submission.
- AC-2: Submitting `parentCaseId` for a different case is rejected.
- AC-3: The dual-system notice appears before submission, and the referral disposition writes only PVQ.

---

### FR-F07a-05 — Step 6: Verification affordance and return path

**Description:** After the orchestrated write (`F07b`), the investigator can independently satisfy themselves that both systems changed.

**Processing / business rules:**
1. The confirmation view (SCR-20, `FR-F07b-04`) offers three destinations, all real:
   - "View the updated issue in PVQ" → SCR-16 re-read from PVQ, showing status `Resolved — Substantiated`, disposition, narrative, and resolver.
   - "Return to eApp Case A-1042" → SCR-15 re-read from eApp, showing **"No outstanding issues"** and the updated case state.
   - "Back to work queue" → SCR-13 with the original filters, sort, and page restored.
2. Both destinations re-read live from their owning spokes. The confirmation view does not cache the pre-computed result and present it as a fresh read; re-reads carry a new correlation ID linked to the workflow chain by `parentCorrelationId`.
3. A "View audit trail for this action" link opens SCR-34 chain view filtered to the workflow correlation ID (`FR-F07b-06`).
4. The demo script additionally shows direct spoke API calls (`GET {pvq}/issues/ISS-2207`, `GET {eapp}/cases/CASE-A-1042`) proving the change outside the hub entirely (SM-03, `FR-F18-05`).

**Acceptance criteria:**
- AC-1: Returning to the case shows "No outstanding issues" sourced from eApp's own API.
- AC-2: The independent spoke API calls return the updated state (SM-03).
- AC-3: Round trip from confirmation to case to queue preserves context with no re-authentication.

---

### FR-F07a-06 — Continuity assertions (the acceptance contract)

**Description:** The properties an automated test must assert for this workflow to count as passing. These are requirements, not aspirations.

**Processing / business rules:** The end-to-end test (`FR-F19-01`) drives the browser through steps 1–6 and asserts:
1. **Exactly one authentication event** in `Y0a.audit_events` with `action = AUTH_SUCCESS` for the session (SM-02).
2. **Zero navigations outside the hub origin** — network trace contains no document request to a spoke port.
3. **Zero credential prompts** — no login form rendered after the initial sign-in.
4. **Zero manual context re-entry** — the test types only the disposition narrative and never an identifier (SM-04).
5. **Both systems changed**, asserted by direct calls to the eApp and PVQ APIs, not through the hub (SM-03).
6. **One correlated audit chain** containing ≥5 records: case read, issue read, traversal, PVQ write, eApp write, confirmation (SM-20).
7. **The demo banner present** on every screen visited (NFR-13).
8. **Zero serious or critical accessibility violations** on SCR-13, SCR-15, SCR-16, SCR-20 (SM-07).
9. **Total wall-clock under 3 minutes** for a manual run following the demo script (PRD F7 acceptance signal).
10. **Repeatable**: after `reset` (`FR-F17-11`), the workflow runs identically three consecutive times (SM-22).

**Acceptance criteria:**
- AC-1: All ten assertions pass in CI.
- AC-2: A regression in any one of them fails the build.

---
