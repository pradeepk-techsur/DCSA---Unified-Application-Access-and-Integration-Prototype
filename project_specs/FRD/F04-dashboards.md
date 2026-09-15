## F4 — Role-Specific Personalized Dashboards

**Traces to:** PRD F4 (P0). **Screens:** SCR-09 Investigator, SCR-10 Adjudicator, SCR-11 Applicant, SCR-12 Administrator. **API:** `Y1a §Dashboard`. Role-differentiated composition is measured by **SM-23**; time-to-next-item by **SM-24**; the applicant's time-to-answer by **SM-25**.

**Description:** The landing page after sign-in, composed differently for each of the four roles. It answers "what is mine, what is urgent, what changed, and what should I know" by aggregating across every connected spoke. Each dashboard is a real screen with real widgets, real empty states, per-widget loading, and an explicit account of anything missing because a source is unhealthy.

**Terminology:**
- **Widget** — an independently loaded dashboard region with its own data source, loading state, empty state, and error state.
- **Composition** — the ordered widget set for a role, defined in configuration (`Y0a.dashboard_compositions`), not hard-coded per role in the UI.
- **Partial composition** — a dashboard rendered while one or more sources are unavailable.

---

### FR-F04-01 — Dashboard composition endpoint and widget loading model

**Description:** One endpoint returns the role's widget manifest and data, with per-source status, so a slow spoke degrades one widget rather than the page.

**Inputs:** `GET /api/dashboard` (authenticated). Optional `?widgets=` to refresh a subset.

**Processing / business rules:**
1. The hub reads the composition for `principal.activeRole` from configuration and resolves each widget's data source.
2. Spoke-backed widgets are fanned out concurrently with per-adapter timeouts from the registry (`FR-F08b-03`). The endpoint returns when all adapters have settled or their timeouts elapse — it never waits on a single slow spoke beyond its configured timeout.
3. Response shape:
   ```json
   {
     "role": "INVESTIGATOR",
     "widgets": [ { "widgetId": "assigned-work", "title": "My assigned work",
                    "state": "READY", "data": { ... }, "href": "/work" } ],
     "sourceStatus": [ { "applicationId": "IM", "label": "Investigation Management",
                         "status": "DOWN", "omittedItemEstimate": 12,
                         "message": "Investigation Management is unavailable — 12 items are not shown." } ],
     "generatedAt": "2026-09-14T15:04:11Z",
     "correlationId": "01JD…"
   }
   ```
4. `widget.state` ∈ `READY | EMPTY | PARTIAL | ERROR`. `PARTIAL` means the widget rendered but is missing at least one source; the widget must then name the missing system inline.
5. The client MAY request widgets individually for progressive rendering; each widget renders its own skeleton with `aria-busy="true"` until settled, and announces completion once via a polite live region ("Dashboard loaded. 3 of 4 systems reporting.").
6. Widget data is never cached across principals; it is computed per request.

**Outputs:** Role dashboard populated per composition.

**Validation rules:** `widgets` query values must exist in the role's composition; unknown values are ignored.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| All sources down | 200 | — | Page renders with a prominent degraded alert: "We can't reach the connected systems right now. Your dashboard will fill in automatically when they're back." |
| Composition missing for role | 500 | `INTERNAL_ERROR` | "We couldn't build your dashboard. Refresh the page — reference {correlationId}." |
| Widget data source error | 200 (widget `ERROR`) | — | In-widget: "We couldn't load this section. Try again." with a retry button. |

**Acceptance criteria:**
- AC-1: With one spoke forced down, the dashboard still renders and names the missing system with a quantified gap (NFR-10).
- AC-2: Dashboard renders within 2 seconds under seeded data (NFR-17).
- AC-3: No widget renders blank; every widget has a designed READY/EMPTY/ERROR presentation.

---

### FR-F04-02 — Investigator dashboard (SCR-09)

**Description:** The primary demo persona's landing page: caseload posture, what is overdue, what changed, and the on-ramp to the flagship workflow.

**Widgets (in order):**
1. **My assigned work** — total count plus a breakdown by source system (eApp, PVQ, PDT, IM), each with a count and a link into the queue pre-filtered to that system. Source labels are always shown; the user always knows which system owns what.
2. **Needs attention** — top 5 items ranked by `overdue DESC, priority DESC, dueDate ASC`. Each row: title, source badge, subject, due date, status, and a direct link to SCR-14/15/16.
3. **Newly raised PVQ issues** — issues created in the last 7 days against cases assigned to this investigator. **This widget is the intended entry point to the F7 flagship workflow** and links directly to the eApp case that carries the issue.
4. **Due soon and overdue** — counts for overdue, due today, due in 7 days, with an accessible status treatment (text + icon, never color alone).
5. **Recent activity** — this principal's last 10 audit records (`AUDIT.READ_OWN`), each linking back to the affected item and to the audit chain view.
6. **Announcements** — active announcements targeted at `INVESTIGATOR` (`FR-F15-04`), dismissible per user.
7. **System status** — present only when at least one source is not healthy; names each affected system and what is missing.

**Processing / business rules:**
1. All counts derive from the same aggregation path as the work queue (`FR-F05-02`), so dashboard and queue can never disagree.
2. "Needs attention" excludes items the principal may read but not act on, because it is an action list; unit-visible items appear in the queue, not here.
3. Each widget's "View all" link carries the equivalent queue filter so the destination is pre-scoped.

**Empty states:** "You have no assigned work right now. New assignments will appear here." / "No issues have been raised on your cases in the last 7 days."

**Error handling:** per `FR-F04-01`. If PVQ is down, widget 3 shows: "We can't reach PVQ right now, so new issues aren't shown. Everything else on this page is current."

**Acceptance criteria:**
- AC-1: The seeded investigator persona sees items from at least four distinct source systems, each attributed (SM-14).
- AC-2: The "newly raised PVQ issues" widget contains the flagship demo issue and links to eApp case A-1042.
- AC-3: Overdue items appear with both text and icon indication.

---

### FR-F04-03 — Adjudicator dashboard (SCR-10)

**Description:** Determination-oriented landing page — visibly different composition from the Investigator's, not a relabelled copy.

**Widgets (in order):**
1. **Awaiting my determination** — count and top items in `statusCategory = IN_PROGRESS` routed to adjudication, across eApp and IM.
2. **Case status distribution** — counts by `statusCategory` across the adjudicator's organization, rendered as an accessible data table (not a chart-only presentation), with each row linking to the filtered queue.
3. **Approaching determination deadlines** — items due within 14 days, sorted ascending, with overdue called out first.
4. **Returned for clarification** — items the adjudicator previously sent back that have since been updated.
5. **Recent activity** — own audit records.
6. **Announcements** — targeted at `ADJUDICATOR`.
7. **System status** — as above.

**Processing / business rules:**
1. Scope is organization-wide per `ATTR-ADJ-01`, not assignee-based; the widget headings say so ("Across {organization}").
2. Any chart included MUST be accompanied by an equivalent accessible table; data is never available only as a graphic.

**Empty states:** "Nothing is waiting on your determination." / "No cases in your organization have upcoming deadlines in the next 14 days."

**Acceptance criteria:**
- AC-1: The adjudicator dashboard differs from the investigator dashboard in at least three widgets.
- AC-2: The status distribution is readable as a table by a screen reader.

---

### FR-F04-04 — Applicant dashboard (SCR-11)

**Description:** A plain-language answer to "where am I in this process and what do I owe you next," assembled from eApp and IEP without ever naming internal systems as a burden on the user.

**Widgets (in order):**
1. **Where you are** — a USWDS step-indicator showing the vetting stages (Submitted → Under review → Information requested → Complete) with the current step marked in text as well as visually, plus a one-sentence explanation of the current step.
2. **What you need to do** — outstanding tasks from IEP and eApp with due dates and direct links to complete them (SCR-18). Each task states the consequence of not acting in plain language.
3. **Your notices** — IEP notices, newest first, with read/unread state and an accessible "Mark as read" action.
4. **Your submission** — read-only summary of the applicant's eApp submission: reference number, submitted date, current status, and a link to view it (redacted per `FR-F02-04` obligations).
5. **Announcements** — targeted at `APPLICANT`.
6. **System status** — worded without internal jargon: "Some of your information isn't available right now. Please check back shortly."

**Processing / business rules:**
1. Every row on this dashboard is filtered by `subjectRef` at the data layer (`FR-F02-04`). The applicant view never receives another subject's data to hide.
2. Copy avoids internal system names in body text; source badges are still shown on work-item rows for attribution consistency but are secondary.
3. Investigator narratives, issue internal notes, and adjudication rationale are redacted before serialization — they never reach the browser.

**Empty states:** "You don't have anything to do right now. We'll let you know if that changes." / "You have no notices." — the zero-item applicant is a seeded persona (`FR-F17-06`) so this state is demonstrable.

**Acceptance criteria:**
- AC-1: The applicant dashboard shows only that applicant's records, verified by direct API probe with another subject's ID.
- AC-2: The zero-item applicant persona renders designed empty states in every widget, with no blank regions.
- AC-3: Redacted fields are absent from the response payload, not merely hidden.

---

### FR-F04-05 — Administrator dashboard (SCR-12)

**Description:** Platform operability at a glance — the administrator's dashboard is about the layer itself, not about mission work.

**Widgets (in order):**
1. **Connected applications** — count of registered / enabled / disabled, with a link to SCR-22.
2. **System health** — per-application status chips (text + icon), last check time, and latency; links to SCR-24.
3. **Integration issues (24h)** — count by error class with the five most recent entries; links to SCR-25.
4. **Recent administrative activity** — audit records for admin actions, linking to SCR-33.
5. **Announcements management** — active/scheduled/expired counts with a link to SCR-29.
6. **Demo operations** — service readiness summary and links to SCR-37 and the failure-injection controls (SCR-38).

**Processing / business rules:**
1. Health data is read from the health monitor's stored results (`FR-F16-02`), not by probing on page load, so the dashboard is fast and probing stays on its cadence. A manual "Check now" control triggers an on-demand probe (`FR-F11-05`).
2. The administrator dashboard exposes no work items; attempting to deep-link to one returns `AUTHZ_DENIED` per `FR-F02-02` rule 1.

**Empty states:** "No integration issues in the last 24 hours." / "No applications are registered yet. Register your first application to get started." (the latter is reachable only if the registry is emptied — it is still designed.)

**Acceptance criteria:**
- AC-1: Inducing an adapter failure adds a visible entry to the integration-issues widget within one health-check interval.
- AC-2: Registering the sixth application increments the connected-applications count without a restart (SM-12).

---

### FR-F04-06 — Widget interaction, linking, and state integrity

**Description:** Behavior common to all dashboards.

**Processing / business rules:**
1. Every widget has exactly one primary destination; every count and every row is a link to a real, pre-scoped screen. A widget that displays a number the user cannot act on is not permitted.
2. Widget refresh: a "Refresh" control per widget re-requests that widget only and announces the outcome politely ("My assigned work updated. 14 items.").
3. Auto-refresh polls `GET /api/dashboard?widgets=system-status` every 30 seconds to pick up health changes; recovery clears the degraded notice without a user reload (SM-17). No other widget auto-refreshes, to avoid content shifting under a reader.
4. Dismissing an announcement persists per user per announcement (`Y0a.announcement_dismissals`) and does not affect other users.
5. Keyboard: widgets are `<section>` elements with `aria-labelledby` pointing at their heading; tab order follows visual order; no widget is a focus trap.

**Validation rules:** A widget whose destination route does not exist fails the CI navigation crawl.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Widget refresh fails | 200 (widget `ERROR`) | — | "We couldn't refresh this section. Try again." |
| Dismiss announcement fails | 500 | `INTERNAL_ERROR` | "We couldn't save that. The notice will reappear until we can." |

**Acceptance criteria:**
- AC-1: Signing in as each persona produces a visibly different, fully populated dashboard with no empty or placeholder widget (PRD F4 acceptance signal).
- AC-2: Restoring a downed spoke clears the degraded notice within 30 seconds without a reload or re-authentication.

---
