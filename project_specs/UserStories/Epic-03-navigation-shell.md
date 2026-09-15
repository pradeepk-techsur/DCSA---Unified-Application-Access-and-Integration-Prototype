## Epic 3: Unified Navigation Shell and Global Chrome (F3)

The persistent frame every authenticated screen lives inside. This is what makes five systems read as one product, and it is where the "every button works" promise is either kept or broken.

---

### US-026: Work inside one consistent frame on every screen
**As an** Investigator, **I want** every screen to sit inside the same header, navigation, breadcrumb, and footer, **so that** I never have to notice which underlying system I am in.

**Acceptance Criteria:**
- [ ] Given any route for any role, when it renders, then the document order is skip link → demo banner → government banner → header → breadcrumb → main → footer.
- [ ] Given any page, when its landmarks are inspected, then there is exactly one banner, one primary nav, one breadcrumb nav, one main, one contentinfo, and exactly one `<h1>` that names the page rather than the product.
- [ ] Given a client-side route change, when it completes, then the document title updates to "{Page name} — DCSA Unified Layer" and focus moves to the new page's `<h1>`.
- [ ] Given a viewport of 320px, when any route renders, then there is no horizontal page scrolling; at 200% zoom the page remains fully usable.
- [ ] Given entitlements fail to load, when the shell renders, then the banner, header identity, and an inline recoverable alert appear — never a bare page.

**Priority:** P0 | **Feature Ref:** F3 | **Persona:** PER-01, PER-02, PER-03, PER-04 | **FRD:** FR-F03-01, FR-F14-05

---

### US-027: Always be able to see that the data is synthetic
**As an** evaluating reviewer, **I want** a "Demo — Synthetic Data Only" banner that cannot be hidden on any screen, **so that** nobody can mistake a demonstration for a live system or a real personnel record.

**Acceptance Criteria:**
- [ ] Given any route — including login, access-denied, not-found, and unexpected-error screens — when it renders, then the banner is present with the full specified copy.
- [ ] Given the banner element, when the DOM is inspected, then it has no close control, no conditional hide path, and no state that removes it.
- [ ] Given an emergency announcement is active and a modal is open simultaneously, when the page is inspected, then the banner remains visible and is not overlaid.
- [ ] Given a screen reader is in use, when a page loads, then the banner is exposed to assistive technology and announced once as part of the banner landmark.
- [ ] Given the automated per-route assertion runs in CI, when it completes, then 100% of routes report the banner present.

**Priority:** P0 | **Feature Ref:** F3, F14 | **Persona:** PER-04 | **FRD:** FR-F03-03, FR-F15-05

---

### US-028: Find every part of my job in a menu built for my role
**As an** Applicant, **I want** navigation written in my language and limited to what concerns me, **so that** I do not have to learn which government system owns which step.

**Acceptance Criteria:**
- [ ] Given I sign in as an Applicant, when the navigation renders, then it reads Dashboard, My Tasks, My Notices, My Status, Help — with no internal system names presented as menu labels.
- [ ] Given each of the four roles signs in, when their navigation is compared, then all four sets are distinct and each item resolves to a real, populated page.
- [ ] Given a navigation item carries a badge count, when it renders, then the count is text plus number, never colour alone.
- [ ] Given I am on a page, when I look at the navigation, then the current item carries `aria-current="page"` plus a visible non-colour indicator.
- [ ] Given a nav item's target application is unavailable, when I follow it, then I reach that screen's degraded state, not a broken link.

**Priority:** P0 | **Feature Ref:** F3 | **Persona:** PER-03 | **FRD:** FR-F03-04, FR-F03-02

---

### US-029: Always know where I am across a system boundary
**As an** Investigator who has been interrupted mid-task, **I want** a breadcrumb that names both the case and the related issue with their source systems, **so that** I can re-orient in seconds and retrace my steps.

**Acceptance Criteria:**
- [ ] Given I have moved from the queue to an eApp case to its related PVQ issue, when I read the breadcrumb, then it shows `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207` with source badges on the second and third segments.
- [ ] Given breadcrumb labels, when they render, then they come from the server's `breadcrumbTrail` rather than being invented by the client from identifiers.
- [ ] Given I activate the case segment from the issue screen, when it loads, then I return to the case with its context intact.
- [ ] Given the final segment, when it renders, then it is plain text with `aria-current="page"` and preceding segments are links.
- [ ] Given a trail deeper than four segments, when it renders, then the middle collapses behind an accessible "Show full trail" disclosure, never a silent ellipsis.

**Priority:** P0 | **Feature Ref:** F3, F7 | **Persona:** PER-01 | **FRD:** FR-F03-06

---

### US-030: Search across everything I am allowed to see
**As an** Adjudicator, **I want** one search box that looks across every connected system within my scope, **so that** I can find a subject or a case without knowing which system holds it.

**Acceptance Criteria:**
- [ ] Given I search a seeded case number, when results render, then that case appears, badged with its source system.
- [ ] Given results, when they render, then they are grouped by source system and ranked with exact identifier matches first.
- [ ] Given I enter fewer than two characters, when I attempt to search, then no request is issued and the control states "Enter at least 2 characters to search."
- [ ] Given one source is unavailable, when results render, then the available results are shown plus a named notice listing the systems not searched.
- [ ] Given an Applicant searches, when results are computed, then another subject's items can never appear.
- [ ] Given results render, when a screen reader is in use, then a polite announcement states "{n} results for {q}. {m} systems searched."

**Priority:** P1 | **Feature Ref:** F3, F5 | **Persona:** PER-02, PER-03 | **FRD:** FR-F03-07, FR-F02-04

---

### US-031: Land somewhere useful when a page does not exist
**As a** user who has followed a stale link, **I want** a not-found page that explains what happened and offers me a way forward, **so that** a broken link never ends my session.

**Acceptance Criteria:**
- [ ] Given I open an unknown route, when it renders, then I see "We couldn't find that page" inside the shell with the demo banner, the attempted path shown as escaped text, a correlation ID, and two working exits.
- [ ] Given that page, when the response is inspected, then it returns HTTP 404 with the title "Page not found — DCSA Unified Layer" and focus is moved to the heading.
- [ ] Given the not-found page, when the accessibility scan runs, then it reports zero serious or critical violations.
- [ ] Given the attempted path contains markup, when it is displayed, then it is escaped and never rendered as HTML.

**Priority:** P0 | **Feature Ref:** F3, F16 | **Persona:** PER-01, PER-03 | **FRD:** FR-F03-08

---

### US-032: Reach every screen the product claims to have
**As an** evaluating reviewer, **I want** every navigation item and every primary control to lead to a real, populated screen, **so that** I can trust the demonstration is a working system rather than a set of stubs.

**Acceptance Criteria:**
- [ ] Given the full screen inventory, when an automated crawl runs for every role, then every reachable screen returns HTTP 200 with a non-empty main region.
- [ ] Given every interactive control on every screen, when the control-integrity test runs, then each has a handler producing an observable result — zero dead links, zero placeholder screens, zero buttons that do nothing.
- [ ] Given every screen, when it is checked, then it has an implemented populated state, a designed empty state, and a designed error state.
- [ ] Given any screen in the inventory, when it is reviewed, then it is built on one of the four page templates — List, Detail, Form, or Console.

**Priority:** P0 | **Feature Ref:** F3, F19 | **Persona:** PER-04 | **FRD:** FR-F03-02, FR-F19-08

---
