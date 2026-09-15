## Epic 4: Role-Specific Personalised Dashboards (F4)

Four dashboards, genuinely different from one another, each answering "what is mine, what is urgent, what changed, and what should I know" by aggregating across every connected spoke. These are written as four separate stories deliberately: a single parameterised "user sees a dashboard" story would hide exactly the difference the demonstration has to prove.

---

### US-033: See my caseload posture the moment I sign in *(Investigator)*
**As an** Investigator, **I want** a landing page that tells me what is assigned to me, what is overdue, and what has just been raised against my cases, **so that** I can pick the next highest-consequence action in two clicks instead of reconstructing priority from memory.

**Acceptance Criteria:**
- [ ] Given I sign in, when my dashboard renders, then it shows, in order: My assigned work, Needs attention, Newly raised PVQ issues, Due soon and overdue, Recent activity, Announcements, and System status when a source is unhealthy.
- [ ] Given "My assigned work" renders, when I read it, then it shows a total plus a per-source-system breakdown covering at least four of the five spokes, each labelled with its source system and linking into the queue pre-filtered to that system.
- [ ] Given "Needs attention" renders, when I read it, then it lists the top five items ranked overdue first, then priority, then due date, each with title, source badge, subject, due date, status, and a direct link to its detail screen.
- [ ] Given a PVQ issue was raised in the last seven days against a case assigned to me, when the dashboard renders, then it appears in "Newly raised PVQ issues" and links to the parent eApp case — this is the on-ramp to the flagship workflow.
- [ ] Given an item is overdue, when it is displayed, then the overdue state is conveyed by text and icon, never by colour alone.
- [ ] Given seeded data, when the page loads, then it renders within two seconds and no widget is blank or placeholder.

**Priority:** P0 | **Feature Ref:** F4 | **Persona:** PER-01 | **FRD:** FR-F04-02, FR-F04-01

---

### US-034: See what is awaiting my determination and what is ageing *(Adjudicator)*
**As an** Adjudicator, **I want** a landing page organised around determinations rather than caseload, **so that** timeliness is managed by evidence instead of by end-of-month panic.

**Acceptance Criteria:**
- [ ] Given I sign in, when my dashboard renders, then it shows, in order: Awaiting my determination, Case status distribution, Approaching determination deadlines, Returned for clarification, Recent activity, Announcements, and System status when relevant.
- [ ] Given my dashboard is compared to the Investigator dashboard, when both are open, then they differ in at least three widgets — this is not a relabelled copy.
- [ ] Given "Case status distribution" renders, when I inspect it, then it is an accessible data table (a chart, if present, is accompanied by the equivalent table) and each row links to the pre-filtered queue.
- [ ] Given my scope is organisation-wide rather than assignee-based, when widget headings render, then they say so — "Across {organisation}".
- [ ] Given "Approaching determination deadlines" renders, when I read it, then items due within 14 days are listed ascending with overdue items called out first.
- [ ] Given nothing awaits me, when the widget renders, then it shows the designed empty state "Nothing is waiting on your determination." rather than a blank region.

**Priority:** P0 | **Feature Ref:** F4 | **Persona:** PER-02 | **FRD:** FR-F04-03

---

### US-035: Understand where I am in the process in plain language *(Applicant)*
**As an** Applicant, **I want** a landing page that answers "where am I and what do I owe you next" without jargon, **so that** I can get the answer on my phone in thirty seconds without learning which system owns which step.

**Acceptance Criteria:**
- [ ] Given I sign in, when my dashboard renders, then it shows, in order: Where you are, What you need to do, Your notices, Your submission, Announcements, and a plainly-worded system status when relevant.
- [ ] Given "Where you are" renders, when I read it, then a step indicator shows Submitted → Under review → Information requested → Complete with the current step marked in **text** as well as visually, plus a one-sentence explanation of that step.
- [ ] Given "What you need to do" renders, when I read a task, then it states the due date, links directly to the action that discharges it, and explains the consequence of not acting in plain language.
- [ ] Given the page renders, when I read the body copy, then no internal system name, tier code, or state abbreviation appears without a plain-language explanation.
- [ ] Given my dashboard is compared to the three mission dashboards, when all four are viewed, then mine is visibly and substantively different in composition.
- [ ] Given I view it at 320px width, when it renders, then the answer to "where am I and what do I owe" is above the fold with no horizontal scrolling.
- [ ] Given a source is unavailable, when the notice renders, then it reads "Some of your information isn't available right now. Please check back shortly." with no internal jargon.

**Priority:** P0 | **Feature Ref:** F4 | **Persona:** PER-03 | **FRD:** FR-F04-04, FR-F14-08

---

### US-036: See the state of the platform at a glance *(Administrator)*
**As an** Administrator, **I want** a landing page about the layer itself rather than about mission work, **so that** I know whether anything is broken before a user calls me.

**Acceptance Criteria:**
- [ ] Given I sign in, when my dashboard renders, then it shows, in order: Connected applications, System health, Integration issues in the last 24 hours, Recent administrative activity, Announcements management, and Demo operations.
- [ ] Given "System health" renders, when I read a status, then it is text plus icon with a last-check time and latency — never a coloured dot alone.
- [ ] Given health data is displayed, when the page loads, then it is read from stored monitor results rather than probing on page load, and a "Check now" control triggers an on-demand probe.
- [ ] Given an adapter failure is induced, when one health-check interval has elapsed, then a visible entry appears in the integration-issues widget.
- [ ] Given I attempt to deep-link from this dashboard to a mission work item, when the request is evaluated, then it is denied — this dashboard exposes no mission content.
- [ ] Given the sixth application is registered live, when the dashboard next renders, then the connected-applications count has incremented without a restart.

**Priority:** P0 | **Feature Ref:** F4, F11 | **Persona:** PER-04 | **FRD:** FR-F04-05

---

### US-037: Have a slow system degrade one widget rather than my whole page
**As an** Investigator on an intermittent VPN, **I want** each dashboard widget to load independently, **so that** one slow source does not blank the page and make me assume the whole system is broken.

**Acceptance Criteria:**
- [ ] Given one spoke is slow, when the dashboard loads, then each widget renders its own skeleton with `aria-busy` until it settles, and the rest of the page is usable meanwhile.
- [ ] Given all widgets have settled, when a screen reader is in use, then completion is announced once — "Dashboard loaded. 3 of 4 systems reporting."
- [ ] Given a widget's data source errors, when it renders, then it shows an in-widget message "We couldn't load this section. Try again." with a working retry, and the rest of the dashboard is unaffected.
- [ ] Given a region is still loading past its configured timeout, when the timeout elapses, then it transitions to its error or degraded state rather than spinning indefinitely.
- [ ] Given the reduced-motion preference is set, when skeletons render, then shimmer animation is disabled.

**Priority:** P1 | **Feature Ref:** F4, F16 | **Persona:** PER-01 | **FRD:** FR-F04-01, FR-F16-06

---

### US-038: Be told what is missing, rather than shown an incomplete picture
**As an** Adjudicator, **I want** my dashboard to name what it could not load, **so that** I never mistake "the system that holds the issues is down" for "this subject has no issues".

**Acceptance Criteria:**
- [ ] Given one spoke is unavailable, when the dashboard renders, then a notice names the affected system and quantifies the gap — for example "Investigation Management is unavailable — 12 items are not shown."
- [ ] Given no prior item count exists for that source, when the notice renders, then the copy omits the number rather than guessing: "…some items are not shown."
- [ ] Given multiple sources are affected, when the notice renders, then each is named and quantified individually, not merged into "some systems are unavailable".
- [ ] Given a widget rendered with a source missing, when it displays, then the widget itself names the missing system inline rather than silently omitting rows.
- [ ] Given the spoke is restored, when the 30-second status poll next runs, then the notice clears without a page reload and without re-authentication.

**Priority:** P1 | **Feature Ref:** F4, F16 | **Persona:** PER-02 | **FRD:** FR-F04-01, FR-F16-05, FR-F16-12

---

### US-039: Act on anything my dashboard shows me
**As an** Investigator, **I want** every count, row, and widget on my dashboard to lead somewhere real and pre-scoped, **so that** the landing page is a launchpad rather than a report.

**Acceptance Criteria:**
- [ ] Given any widget, when I inspect it, then it has exactly one primary destination and every count and row is a link to a real, pre-scoped screen.
- [ ] Given a "View all" link, when I follow it, then the destination queue arrives with the equivalent filter already applied and shown as a removable chip.
- [ ] Given I refresh a single widget, when it completes, then only that widget re-requests and the outcome is announced politely — "My assigned work updated. 14 items."
- [ ] Given I dismiss an announcement, when I return later or sign in elsewhere, then it stays dismissed for me and is unaffected for other users.
- [ ] Given a widget's destination route does not exist, when CI runs, then the navigation crawl fails the build.

**Priority:** P0 | **Feature Ref:** F4 | **Persona:** PER-01 | **FRD:** FR-F04-06

---
