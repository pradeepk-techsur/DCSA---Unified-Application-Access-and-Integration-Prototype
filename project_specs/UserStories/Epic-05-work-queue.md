## Epic 5: Unified Work Queue (F5)

One list of everything assigned to the signed-in user, aggregated from every connected spoke, normalised into a common shape while keeping unmistakable source attribution. Filterable, sortable, searchable, paginated, and implemented as a proper accessible data table — with partial failure of any single source degrading that source only.

---

### US-040: See everything assigned to me in one list
**As an** Investigator, **I want** one queue containing my work from every connected system, **so that** I have a single authoritative answer to "what is assigned to me and what is due first".

**Acceptance Criteria:**
- [ ] Given I open the work queue, when it renders, then it contains correctly attributed items originating from at least four of the five spokes.
- [ ] Given the table renders, when I read a row, then it shows title, source system, type, subject, status, priority, assignee, due date, and last activity.
- [ ] Given items come from differently shaped native records, when they are displayed, then they share one consistent shape and sort correctly against one another.
- [ ] Given a spoke's native status vocabulary differs from another's, when the row renders, then the native status is still shown verbatim alongside its normalised category.
- [ ] Given an Administrator opens the queue route, when the request is evaluated, then it is denied — administrators hold no work-item read permission.

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-01 | **FRD:** FR-F05-01, FR-F05-02

---

### US-041: Always know which system owns an item
**As an** Adjudicator, **I want** every row and every detail panel to state which system the record came from, **so that** I can vouch for the provenance of anything I base a determination on.

**Acceptance Criteria:**
- [ ] Given any queue row, when it renders, then the source system appears as a text label from the registry with an accompanying icon — never colour-only and never icon-only.
- [ ] Given a screen reader is in use, when it reaches a source badge, then it announces "Source system: {display name}".
- [ ] Given I open an item, when the detail header renders, then it repeats the source in text — "System of record: PVQ — Personnel Vetting Questionnaire".
- [ ] Given a newly registered sixth application, when its items appear in the queue, then they are attributed with that application's registered display name and icon token, with no code change.
- [ ] Given any row, when I read it, then ownership is unambiguous.

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-02 | **FRD:** FR-F05-07

---

### US-042: Narrow the queue to what I need right now
**As an** Investigator, **I want to** filter by source system, type, status, priority, assignee, and due-date range, **so that** I can reduce forty items to the three that matter this morning.

**Acceptance Criteria:**
- [ ] Given I apply filters across facets, when results return, then facets combine as AND between them and OR within each one.
- [ ] Given a filter is active, when the page renders, then it appears as a removable chip with an accessible name such as "Remove filter: Source system — PVQ", alongside a "Clear all filters" control.
- [ ] Given I remove a chip, when the query re-runs, then the URL updates and the new result count is announced politely.
- [ ] Given a source cannot apply a filter natively, when results are merged, then the filter is still applied correctly hub-side.
- [ ] Given a due-date range is active, when items without due dates are excluded, then the UI states "Items without a due date are hidden while a date range is applied."
- [ ] Given I enter a reversed date range, when I submit, then a field error reads "Enter an end date that comes after the start date."

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-01 | **FRD:** FR-F05-03

---

### US-043: Order the queue by what is most urgent
**As an** Investigator, **I want to** sort by due date, priority, status, source system, and last activity, **so that** prioritisation is driven by evidence rather than by whoever called me most recently.

**Acceptance Criteria:**
- [ ] Given I sort by due date ascending, when results render, then overdue items appear first and items with no due date appear last in both directions.
- [ ] Given I sort by priority, when results render, then the order is Urgent, then Elevated, then Routine — never alphabetical.
- [ ] Given I activate a sortable column header, when the sort applies, then `aria-sort` on that header reflects the new state and a polite announcement states "Sorted by due date, ascending. {n} items."
- [ ] Given I run the identical query twice, when I compare the results, then the ordering is byte-identical — ties break deterministically by sort field, then source system, then native identifier.
- [ ] Given a source truncated at its per-source fetch limit, when results render, then the UI discloses it: "Showing the first {n} items from each system. Narrow your filters to see more."

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-01 | **FRD:** FR-F05-04

---

### US-044: Find one specific item by name or number
**As an** Adjudicator, **I want to** search the queue by title, subject, or identifier, **so that** I can jump to a known case without paging through a list.

**Acceptance Criteria:**
- [ ] Given I search a seeded case number, when results return, then exactly that item is returned and the UI offers "Go to this item" as a primary action.
- [ ] Given I search fewer than two characters, when I submit, then I am told "Enter at least 2 characters to search." and no query is issued.
- [ ] Given search combines with active filters, when results return, then the search acts as an additional AND term rather than replacing the filters.
- [ ] Given I am an Applicant, when I search, then another subject's item can never appear in my results.
- [ ] Given no matches, when results render, then the empty state reads "No work items match '{q}'. Check the spelling, or try a case or subject number."

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-02, PER-03 | **FRD:** FR-F05-06

---

### US-045: Page through a long queue and know how much there is
**As an** Investigator, **I want** accessible pagination with an announced result count, **so that** I know how much work I have and can move through it without a mouse.

**Acceptance Criteria:**
- [ ] Given results exceed one page, when pagination renders, then it uses the USWDS component with `aria-label="Work queue pagination"` and the current page marked `aria-current="page"`.
- [ ] Given I am on the first or last page, when I look at Previous or Next, then the bound control is disabled and visible with an explanatory reason — not hidden.
- [ ] Given I change filters, sort, search, or page, when results settle, then a polite region announces "{n} work items. Showing {a} to {b}. {m} of {k} systems reporting."
- [ ] Given a source failed, when the count is displayed, then it is accompanied by the degraded notice so the number is never presented as complete.
- [ ] Given I set page size, when it applies, then only 10, 25, 50, or 100 are accepted, defaulting to 25.

**Priority:** P0 | **Feature Ref:** F5, F14 | **Persona:** PER-01 | **FRD:** FR-F05-04, FR-F14-04

---

### US-046: Open the queue already sensibly scoped for my role
**As an** Investigator, **I want** the queue to open on "assigned to me, due date ascending", **so that** my first screen of the day is already the screen I need.

**Acceptance Criteria:**
- [ ] Given I open the queue for the first time, when it renders, then the role default is applied and shown as visible, removable chips — a silently pre-filtered list is never presented as complete.
- [ ] Given each of the three work-queue roles opens the queue, when defaults apply, then Investigator gets assignee-me plus open and in-progress, Adjudicator gets in-progress, and Applicant gets no filter.
- [ ] Given I override the default, when I return later, then my preference persists for filters, sort, and page size — but not page number.
- [ ] Given I choose "Reset to default view", when it applies, then the role default is restored and the change is announced.
- [ ] Given a saved preference references a de-registered application, when the queue loads, then the stale facet is dropped silently and the page loads cleanly.

**Priority:** P1 | **Feature Ref:** F5 | **Persona:** PER-01, PER-02, PER-03 | **FRD:** FR-F05-08

---

### US-047: Come back to exactly the queue I left
**As an** Investigator interrupted mid-task, **I want** returning from an item to restore my filters, sort, page, and place in the list, **so that** a forty-minute interruption costs me nothing but the forty minutes.

**Acceptance Criteria:**
- [ ] Given I filter the queue and open an item, when I choose "Back to work queue", then the same filtered page returns with sort, page, and scroll position intact and focus restored to the row I came from.
- [ ] Given I complete an action on an item, when I return to the queue, then I land on the same filtered page — never on an unfiltered page one.
- [ ] Given I share the URL of a filtered view, when a colleague with the same entitlements opens it, then they see the same filter state, because queue state lives in the URL.
- [ ] Given my session expires mid-flow, when I sign in again, then the same queue state is restored.
- [ ] Given I press the browser Back button, when the previous view loads, then it restores the exact prior query state.

**Priority:** P0 | **Feature Ref:** F5 | **Persona:** PER-01 | **FRD:** FR-F05-09

---

### US-048: Keep working when one connected system is down
**As an** Investigator, **I want** the queue to render everything it can and tell me exactly what is missing, **so that** I can never mistake a silent outage for an empty queue.

**Acceptance Criteria:**
- [ ] Given Investigation Management is forced offline, when the queue loads, then it returns successfully, renders the other four sources fully, and shows a warning naming the system and quantifying the gap — "Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date."
- [ ] Given a source is down, when the queue renders, then no error page appears anywhere in the application and the remaining items stay actionable.
- [ ] Given every source fails, when the queue renders, then it still returns successfully with a full-width degraded alert and a retry control — never a 500, never a blank page.
- [ ] Given a source is slow but responding, when its rows render, then they carry an inline "Slow to respond" note.
- [ ] Given the source is restored, when the 30-second health poll detects it, then the warning is replaced by a polite announcement and a refresh control — the list does not silently reorder under my cursor.
- [ ] Given each induced failure, when the Administrator checks the integration log, then exactly one correctly attributed issue entry exists.

**Priority:** P0 | **Feature Ref:** F5, F16 | **Persona:** PER-01, PER-04 | **FRD:** FR-F05-05, FR-F16-05

---

### US-049: Get guidance rather than a blank table when there is nothing to show
**As an** Applicant with nothing outstanding, **I want** an empty queue to explain itself, **so that** I know the system is working and I simply have nothing to do.

**Acceptance Criteria:**
- [ ] Given I have no assigned work at all, when the queue renders, then it reads "You have no assigned work right now. New assignments will appear here." with the table caption still present.
- [ ] Given my filters exclude everything, when results return, then it reads "No work items match your filters. Clear filters to see all of your work." with a working "Clear all filters" button.
- [ ] Given an empty state and a degraded state, when each is compared, then the copy is distinct — "you have nothing to do" is never used to describe "we could not load your work".
- [ ] Given the zero-item applicant persona signs in, when every queue and widget renders, then each shows its designed empty state and no blank region.

**Priority:** P0 | **Feature Ref:** F5, F16 | **Persona:** PER-03 | **FRD:** FR-F05-01, FR-F16-07

---
