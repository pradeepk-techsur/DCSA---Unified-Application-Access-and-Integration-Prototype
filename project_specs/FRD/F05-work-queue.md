## F5 — Unified Work Queue

**Traces to:** PRD F5 (P0); SM-14, SM-16, NFR-09, NFR-10. **Screens:** SCR-13 Unified work queue. **API:** `Y1a §Work Queue`.

**Description:** One list of everything assigned to the signed-in user, aggregated from eApp, IEP, PVQ, PDT, IM (and any subsequently registered application), normalized into a common work-item shape while retaining unmistakable source attribution. Filterable, sortable, searchable, paginated, and implemented as a proper accessible data table. Partial failure of any source degrades that source only — one spoke down never produces a failed queue.

**Terminology:**
- **Fan-out** — concurrent adapter `listWorkItems` calls to every enabled application the principal may see.
- **Normalization** — projection of a spoke-native record into the WorkItem model (§3.2).
- **Source status** — per-application outcome of the fan-out: `OK`, `TIMEOUT`, `ERROR`, `CIRCUIT_OPEN`, `SKIPPED_DISABLED`.
- **Merge key** — `sourceSystem + nativeId`, guaranteeing global uniqueness without coordination between spokes.

---

### FR-F05-01 — Work queue screen (SCR-13)

**Description:** The presentation of the aggregated queue: filter rail, active-filter chips, sortable table, pagination, result count, and all four non-happy states.

**Inputs:** URL query state `{ q, sourceSystem[], type[], status[], priority[], assignee, dueFrom, dueTo, sort, dir, page, pageSize }`.

**Processing / business rules:**
1. Layout uses the List template (`FR-F03-08`): filter region (`<form>` landmark, labelled "Filter work items"), results region, pagination.
2. Table columns: Title (link), Source system (text badge + icon), Type, Subject, Status, Priority, Assignee, Due date, Last activity. The table has a `<caption>` ("Work items assigned to you — {n} results"), `<th scope="col">` on every header, and `scope="row"` on the title cell.
3. Result count is announced on every filter, sort, search, or page change through a polite live region: "{n} work items. Showing {a} to {b}. {m} of {k} systems reporting."
4. All queue state lives in the URL so a link to a filtered view is shareable and the browser Back button restores the exact view.
5. Row entry navigates to SCR-14/15/16/17/18/19 as appropriate for the item type, carrying a `returnTo` that restores filters, sort, and page (`FR-F06-10`).
6. **No bulk actions.** Actions are performed on the detail page so every mutation is audited in full context (PRD F5, "bulk-free by design").
7. The screen is not available to Administrators (`FR-F02-02`); they have no work-item read permission.

**Outputs:** SCR-13 with populated table, or a designed empty/degraded state.

**Validation rules:** Unknown query parameters are ignored, not echoed. `pageSize` ∈ {10, 25, 50, 100}, default 25. `page` ≥ 1.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| No items match filters | 200 | — | "No work items match your filters. Clear filters to see all of your work." with a "Clear all filters" button. |
| No items at all | 200 | — | "You have no assigned work right now. New assignments will appear here." |
| Every source unavailable | 200 | — | "We can't reach any connected systems right now. Your work will appear here automatically when they're back." plus a "Try again" control. |
| Invalid filter value | 400 | `VALIDATION_FAILED` | Field-level: "Choose a valid {filter name}." |

**Acceptance criteria:**
- AC-1: The investigator queue contains correctly attributed items from at least four distinct spokes (SM-14).
- AC-2: Every state (populated, filtered-empty, wholly-empty, degraded, loading, error) is reachable and designed.
- AC-3: Table passes automated accessibility scan with zero serious or critical violations.

---

### FR-F05-02 — Aggregation and normalization across heterogeneous sources

**Description:** How five differently shaped native records become one queue.

**Inputs:** `principal`, resolved filter set, registry rows for enabled applications.

**Processing / business rules:**
1. The hub resolves the candidate application list from the registry — never a hard-coded list of five. Applications that are disabled, or that the principal's role is not granted in `registered_applications.visible_to_roles`, are marked `SKIPPED_DISABLED` and contribute nothing.
2. For each candidate, the hub calls `listWorkItems(principal, scope, filters, paging)` concurrently, subject to per-adapter timeout, retry, and circuit state (`FR-F08a-05`).
3. Each adapter returns native records plus its declared field mapping; the adapter — not the hub — performs normalization into the WorkItem model. The hub validates the result against the WorkItem schema and rejects non-conforming records with an `INTEGRATION_NORMALIZATION_ERROR` issue rather than rendering malformed rows.
4. Normalization rules that must be uniform across all adapters:
   - `workItemId = "{sourceSystem}:{nativeId}"`.
   - `statusCategory` is mapped from the native status via the adapter's declared status map; every native status MUST map to exactly one category. An unmapped status is a conformance failure (`FR-F19-03`).
   - `priority` maps native scales to `ROUTINE | ELEVATED | URGENT`. Sources with no native priority map everything to `ROUTINE` and declare `priorityNative: false` so the UI can note "Priority not provided by {system}" rather than implying one.
   - `dueDate` is normalized to ISO-8601; sources without due dates emit `null`, and null sorts last in ascending order and last in descending order (nulls always last, never interleaved).
   - `lastActivityAt` is required; an adapter unable to supply it uses the record's updated timestamp.
   - `assigneeId` is mapped to a hub `principalId` via the adapter's identity map; an unmapped assignee yields `assigneeId: null` with `assigneeDisplayName` preserved as the native string, so "unassigned" and "assigned to someone we can't resolve" are distinguishable.
5. Results are merged, de-duplicated by merge key, then filtered, sorted, and paginated **hub-side** (`FR-F05-03`, `FR-F05-04`) because sources cannot agree on a global order.
6. `sourceHealth` is stamped on every item from the fan-out outcome for that application.

**Outputs:** `{ items: WorkItem[], totalCount, page, pageSize, sourceStatus[], correlationId }`.

**Validation rules:** Every returned WorkItem MUST satisfy the §3.2 schema; required fields are `workItemId, nativeId, sourceSystem, subjectRef, type, title, status, statusCategory, priority, lastActivityAt`.

**Error handling:**

| Scenario | HTTP | Code | Behavior |
|---|---|---|---|
| Adapter returns malformed item | 200 | — | Item dropped; `INTEGRATION_NORMALIZATION_ERROR` issue recorded naming application, field, and correlation ID. Queue still renders. |
| Adapter returns out-of-scope item | 200 | — | Item dropped; `INTEGRATION_SCOPE_VIOLATION` recorded (`FR-F02-04`). |
| Registry unreadable | 503 | `REGISTRY_UNAVAILABLE` | "We can't load your work list right now. Try again in a moment — reference {correlationId}." |

**Acceptance criteria:**
- AC-1: Removing an application from the registry removes its items from the queue with no code change (PRD F8 acceptance signal).
- AC-2: A deliberately malformed adapter response drops one row and logs one issue; the queue renders the remainder.
- AC-3: Items from five sources share one consistent shape and sort correctly against each other.

---

### FR-F05-03 — Filtering semantics

**Description:** Filters that behave identically regardless of which system owns the row.

**Inputs:** `sourceSystem[]`, `type[]`, `status[]` (by `statusCategory`), `priority[]`, `assignee` (`me | unassigned | {principalId}`), `dueFrom`, `dueTo`, `overdueOnly` (boolean).

**Processing / business rules:**
1. Filters combine as AND across facets, OR within a facet. Example: `sourceSystem in (EAPP, PVQ) AND statusCategory in (OPEN, IN_PROGRESS)`.
2. Filters are applied **server-side after normalization**, so they work uniformly even when a source cannot filter natively. Where an adapter declares `supportsFilter: [...]`, the hub pushes those facets down to reduce payload, then re-applies them after merge — push-down is an optimization, never the authority.
3. `status` filters on `statusCategory`, not native status, because native vocabularies differ. The native status remains visible in the table and in the item detail.
4. `assignee=unassigned` matches `assigneeId == null AND assigneeDisplayName == null`; `assignee=me` matches the principal. An investigator may not filter to another individual's name unless that person is within their organization and region (the filter respects `FR-F02-03`, it does not widen scope).
5. `dueFrom`/`dueTo` are inclusive dates in the user's displayed timezone (UTC for the demo, labelled as such). Items with `dueDate == null` are excluded when a due-date range is active, and the UI states this: "Items without a due date are hidden while a date range is applied."
6. Active filters render as removable USWDS chips with accessible names ("Remove filter: Source system — PVQ"), plus a "Clear all filters" button. Removing a chip updates the URL, re-queries, and announces the new count.
7. Role defaults: Investigator → `assignee=me`, `statusCategory in (OPEN, IN_PROGRESS)`; Adjudicator → `statusCategory=IN_PROGRESS`; Applicant → no filter (their scope is already their own records). Defaults are applied only on first load and are visibly shown as chips so the user knows a filter is active — a silently pre-filtered list is a lie about completeness.

**Outputs:** Filtered result set plus the applied-filter descriptor echoed in the response.

**Validation rules:**
- Enumerated facets validated against registry-declared values; unknown values return `VALIDATION_FAILED` naming the facet.
- `dueFrom <= dueTo`; otherwise field error "Enter an end date that comes after the start date."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Unknown facet value | 400 | `VALIDATION_FAILED` | "Choose a valid {facet}." |
| Reversed date range | 400 | `VALIDATION_FAILED` | "Enter an end date that comes after the start date." |

**Acceptance criteria:**
- AC-1: Filtering by source system to a single spoke returns only that spoke's items, with the chip visible.
- AC-2: Default role filters are shown as chips on first load and are removable.
- AC-3: A filter that a source cannot apply natively still filters correctly after merge.

---

### FR-F05-04 — Sorting, pagination, and result counting

**Description:** Deterministic ordering and paging across sources that do not share an ordering.

**Processing / business rules:**
1. Sortable fields: `dueDate`, `priority`, `statusCategory`, `sourceSystem`, `lastActivityAt`, `title`. Default: `dueDate ASC` with `overdue` items first.
2. Sorting is performed hub-side on the merged set. To page correctly, the hub requests up to `pageSize × page + overfetchMargin` from each source (bounded by `maxPerSourceFetch`, default 200) and pages the merged result. When any source truncates at `maxPerSourceFetch`, the response sets `truncated: true` and the UI shows: "Showing the first {n} items from each system. Narrow your filters to see more." — the system never silently hides rows.
3. Tie-breaking is deterministic: `sortField, then sourceSystem ASC, then nativeId ASC`. Identical queries always return identical order (required for repeatable demos, SM-22).
4. `priority` sorts by ordinal `URGENT > ELEVATED > ROUTINE`, never alphabetically.
5. Sortable column headers are `<th>` containing a `<button aria-sort="ascending|descending|none">`; activating toggles direction and announces "Sorted by due date, ascending. {n} items."
6. Pagination uses the USWDS pagination component with `aria-label="Work queue pagination"`, current page marked `aria-current="page"`, and Previous/Next disabled (not hidden) at bounds with an explanatory `disabledReason`.
7. `totalCount` counts only items actually retrieved. When a source failed, the count is accompanied by the degraded notice (`FR-F05-05`) so the number is never presented as complete when it is not.

**Validation rules:** `sort` must be one of the permitted fields; `dir` ∈ `asc|desc`. Invalid values fall back to the default and are corrected in the URL rather than erroring.

**Error handling:** No distinct errors; invalid sort silently normalizes to default (documented behavior, not a failure).

**Acceptance criteria:**
- AC-1: Sorting by due date places overdue items first and null due dates last in both directions.
- AC-2: The same query run twice returns identical ordering.
- AC-3: Truncation is disclosed when it occurs.

---

### FR-F05-05 — Partial-failure tolerance and degraded queue (the resilience contract)

**Description:** One spoke down must never produce a failed queue. The other sources render fully, and the gap is named and quantified.

**Inputs:** Fan-out outcomes per application.

**Processing / business rules:**
1. Each adapter call resolves to `{ applicationId, status, itemCount, latencyMs, errorClass?, omittedItemEstimate? }`. The aggregate endpoint returns HTTP **200** whenever at least one source succeeded — a partial result is a success with disclosure, not an error.
2. HTTP 200 with `sourceStatus` entries of `TIMEOUT | ERROR | CIRCUIT_OPEN` triggers a USWDS warning site-alert above the table, `role="status"`, naming each affected application:
   **"Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date."**
   The omitted-item estimate comes from the last successful count for that application and principal (`Y0a.work_item_counts_cache`); when no prior count exists the copy omits the number: "Investigation Management is unavailable — some items are not shown."
3. Every row also carries its `sourceHealth`; rows from a `DEGRADED` (slow but responding) source show an inline "Slow to respond" note so the user understands staleness.
4. Actions targeting an unavailable source are pre-emptively disabled at the detail screen (`FR-F06-04`), never allowed to fail mid-submission.
5. When all sources fail, HTTP is still 200 with an empty item list and a full-width degraded alert — never a 500, never a blank page, never an error route (NFR-09).
6. Recovery: the queue polls `GET /api/health/summary` every 30 seconds while a degraded notice is displayed. On recovery the notice is replaced by a polite live announcement — "Investigation Management is available again. Refresh to see 12 more items." — with a "Refresh" button. The queue does not silently reorder under the user's cursor.
7. Each failed source records one `integration_issues` row per failure with the correlation ID, visible to administrators (`FR-F11-03`).

**Outputs:** 200 with partial items, `sourceStatus[]`, and a degraded alert.

**Validation rules:** `sourceStatus` MUST contain one entry per candidate application — including successes — so the UI can always state "{m} of {k} systems reporting."

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| One or more sources failed | 200 | — | "{System} is unavailable — {n} items are not shown. The rest of your work is up to date." |
| All sources failed | 200 | — | "We can't reach any connected systems right now. Your work will appear here automatically when they're back." |
| Source slow but responding | 200 | — | Row-level: "Slow to respond." |

**Acceptance criteria:**
- AC-1: With IM forced offline, the queue renders the other four sources plus a visible, specific degraded warning, and no error page appears anywhere (SM-15, SM-16).
- AC-2: Restoring IM clears the warning without reload or re-authentication (SM-17).
- AC-3: Each induced failure produces exactly one integration-issue entry.

---

### FR-F05-06 — Search within the queue

**Description:** Server-scoped free-text search across the aggregated set.

**Inputs:** `q` (string, 2–120 chars).

**Processing / business rules:**
1. `q` matches, case-insensitively, against `title`, `subjectRef`, `subjectDisplayName`, `nativeId`, and `workItemId`.
2. Where an adapter declares `supportsSearch: true`, `q` is pushed down; results are then re-matched hub-side so behavior is uniform.
3. Search combines with active filters as an additional AND term.
4. An exact `nativeId` or `workItemId` match is ranked first and, when it is the only result, the UI offers "Go to this item" as a primary action.
5. Search never widens scope: the ownership predicate (`FR-F02-04`) applies before matching.

**Validation rules:** minimum 2 characters after trim; maximum 120; the query is escaped for display and never rendered as HTML.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Too short | 400 | `VALIDATION_FAILED` | "Enter at least 2 characters to search." |
| No matches | 200 | — | "No work items match '{q}'. Check the spelling, or try a case or subject number." |

**Acceptance criteria:**
- AC-1: Searching a seeded case number returns exactly that item.
- AC-2: An applicant's search cannot surface another subject's item.

---

### FR-F05-07 — Source attribution on every row

**Description:** The user always knows which system owns an item.

**Processing / business rules:**
1. Every row displays the source system as a text label (registry `displayName`) with an accompanying icon. Attribution is never color-only and never icon-only.
2. The source column is sortable and filterable, and its values come from the registry so a newly registered application is attributed correctly with no code change.
3. The item detail header, breadcrumb, action confirmations, and audit records all repeat the source-system name, so attribution survives every context change.
4. Screen-reader text for the badge reads "Source system: {displayName}".

**Acceptance criteria:**
- AC-1: A newly registered sixth application's items appear correctly attributed with its registered display name and icon token (SM-12).
- AC-2: No row is ambiguous about ownership.

---

### FR-F05-08 — Saved default view per role

**Description:** Each role opens the queue in a sensible, visible default.

**Processing / business rules:**
1. Defaults per `FR-F05-03` rule 7, held in `Y0a.queue_default_views` keyed by role — configuration, not code.
2. The user may override and the override persists per principal in `Y0a.user_view_preferences` (filters, sort, page size — not page number).
3. A "Reset to default view" control restores the role default and announces the change.
4. Persisted preferences never widen authorization; they are re-validated against current entitlements on load and silently dropped if a referenced source is no longer visible.

**Acceptance criteria:**
- AC-1: Investigator's first load shows "assigned to me, due date ascending" with visible chips.
- AC-2: A saved preference referencing a de-registered application loads cleanly without error.

---

### FR-F05-09 — Queue context preservation

**Description:** Leaving and returning to the queue restores exactly what the user had.

**Processing / business rules:**
1. Navigating into an item appends the encoded queue state to the detail route as `returnTo`.
2. "Back to work queue" on the detail screen restores filters, sort, page, and scroll position, and returns focus to the row the user came from.
3. Post-action returns (including after the flagship workflow) use the same mechanism, so a completed action never dumps the user at an unfiltered page 1.
4. Session expiry and re-authentication preserve the same `returnTo` (`FR-F00-06`).

**Acceptance criteria:**
- AC-1: Filter → open item → act → return lands on the same filtered page with focus restored.
- AC-2: Re-authentication mid-flow returns to the same queue state.

---
