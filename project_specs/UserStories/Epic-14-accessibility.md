## Epic 14: USWDS v3 Accessible Interface — Section 508 / WCAG 2.1 AA (F14)

Accessibility is treated here as a set of user stories rather than as a checklist appended to a quality section, because the people these stories describe are doing the same throughput-measured work as everyone else. For a federal audience, failures on this surface are disqualifying — so every story below is written from the user's point of view and every criterion is something a test or a manual pass can verify.

---

### US-109: Do my entire job from the keyboard
**As an** Investigator who does not use a mouse, **I want** every control in the product reachable and operable by keyboard, **so that** nothing in my work depends on a pointing device.

**Acceptance Criteria:**
- [ ] Given any screen, when I navigate with Tab and Shift-Tab, then every interactive element is reachable, and Enter activates links and buttons, Space activates buttons and toggles checkboxes, arrow keys move within radio groups and menus, and Escape closes overlays.
- [ ] Given any component, when I try to leave it with the keyboard, then I can — there are zero keyboard traps anywhere in the product.
- [ ] Given a modal is open — the certificate picker, the session warning, a destructive confirmation — when I operate it, then focus is trapped while it is open, Escape closes it, and focus returns to the control that opened it.
- [ ] Given any screen, when I Tab through it, then tab order follows visual order and no positive tab index is used.
- [ ] Given a disabled control, when I Tab past it, then it is not in the tab order and its reason is available as adjacent text rather than requiring focus on the disabled element.
- [ ] Given the flagship workflow, when I complete it keyboard-only from queue to confirmation, then it succeeds end to end.

**Priority:** P0 | **Feature Ref:** F14 | **Persona:** PER-01 | **FRD:** FR-F14-02

---

### US-110: Operate the work queue with a screen reader
**As an** Investigator who uses a screen reader, **I want** the work queue to be a properly structured data table, **so that** the single most-used screen in the product is usable non-visually.

**Acceptance Criteria:**
- [ ] Given the queue renders, when I reach the table, then it has a caption describing its contents and current result count, a column header scope on every header, and a row header on each row's identifying cell.
- [ ] Given a sortable header, when I activate it, then the sort state is exposed on the header and the new sort and result count are announced — "Sorted by due date, ascending. 14 items."
- [ ] Given I change a filter or search, when results settle, then the new count is announced politely — "{n} results. Showing {a} to {b}."
- [ ] Given pagination, when I reach it, then it carries an accessible label, the current page is marked, and bound controls are disabled and visible rather than hidden.
- [ ] Given a narrow viewport, when the table exceeds the width, then it scrolls horizontally inside its own labelled, keyboard-scrollable region rather than forcing page-level horizontal scroll.
- [ ] Given an empty table, when it renders, then the designed empty state appears inside the table region with the caption still present.
- [ ] Given every data table in the product — queue, audit, admin inventory, health, integration issues, identities, and the dual-system confirmation results — when each is checked, then all of the above hold.

**Priority:** P0 | **Feature Ref:** F14, F5 | **Persona:** PER-01, PER-02, PER-04 | **FRD:** FR-F14-04

---

### US-111: Always see where my focus is
**As an** Adjudicator navigating by keyboard through a dense record, **I want** a visible focus indicator on every focusable element, **so that** I never lose my place in a long reading session.

**Acceptance Criteria:**
- [ ] Given any focusable element receives focus, when it does, then a visible focus indicator appears that meets a 3:1 contrast ratio against every background it appears on.
- [ ] Given the codebase, when the lint rule runs, then removing an outline without providing a replacement indicator fails the build.
- [ ] Given forced-colors or high-contrast mode is active, when I navigate, then focus indicators, status icons, and the demo banner all remain visible.
- [ ] Given a client-side route change, when the new page renders, then focus moves to its heading rather than being left at the top of an unchanged document.

**Priority:** P0 | **Feature Ref:** F14 | **Persona:** PER-02 | **FRD:** FR-F14-06, FR-F14-05

---

### US-112: Skip past the chrome straight to the content
**As an** Applicant using a screen reader on a phone, **I want** a skip link and correct landmarks, **so that** I do not have to traverse the header on every page to reach what I came for.

**Acceptance Criteria:**
- [ ] Given any page, when I press Tab once, then the first focusable element is a skip-to-main-content link that becomes visible on focus and moves focus to the main region.
- [ ] Given any page, when landmarks are inspected, then there is exactly one banner, one primary navigation, one breadcrumb navigation, one main, and one contentinfo, with distinct labels on any additional navigation regions.
- [ ] Given any page, when the heading structure is inspected, then it is gap-free with exactly one `<h1>`, `<h2>` for major regions, and `<h3>` for subsections.
- [ ] Given any page, when the title is read, then it is unique and descriptive and changes on every navigation including client-side route changes.
- [ ] Given the primary navigation, when I reach the current item, then it is indicated both programmatically and by a visible non-colour indicator.

**Priority:** P0 | **Feature Ref:** F14, F3 | **Persona:** PER-03 | **FRD:** FR-F14-05

---

### US-113: Understand exactly what I got wrong in a form
**As an** Applicant entering personal detail I find uncomfortable to disclose, **I want** form errors announced clearly and tied to the fields that caused them, **so that** a confusing validation message does not compound an already stressful task.

**Acceptance Criteria:**
- [ ] Given a form field, when it renders, then it has a programmatically associated label — never a placeholder standing in for one — and any hint text is associated by description.
- [ ] Given a required field, when it renders, then it is marked with a text indicator reading "required", never by colour or an asterisk alone.
- [ ] Given related inputs such as the disposition radio group or the sign-in method choice, when they render, then they are grouped in a fieldset with a legend.
- [ ] Given I submit an invalid form, when validation fails, then an error summary headed "There is a problem" appears at the top, focus moves to it, each entry links in-page to its field, each field shows an inline message associated by description and marked invalid, and the document title is prefixed "Error: ".
- [ ] Given any error message, when I read it, then it is specific and actionable and names what to do — never "Invalid input."
- [ ] Given a character-limited field, when I reach 90% and 100% of the limit, then a counter is announced politely rather than on every keystroke.
- [ ] Given a successful submission, when the confirmation appears, then it is announced politely and receives focus.

**Priority:** P0 | **Feature Ref:** F14, F6 | **Persona:** PER-03, PER-01 | **FRD:** FR-F14-03

---

### US-114: Never have to distinguish a status by colour
**As an** Adjudicator with a colour vision deficiency, **I want** every status, priority, and health state paired with text or a distinct icon, **so that** I can read the product in grayscale without losing meaning.

**Acceptance Criteria:**
- [ ] Given any health state, when it renders, then it shows "Healthy", "Degraded", or "Unavailable" as text with a distinct icon.
- [ ] Given any priority, when it renders, then it shows "Urgent", "Elevated", or "Routine" as text with a distinct tag shape.
- [ ] Given an overdue item, when it renders, then the word "Overdue" appears with an icon — never a coloured row alone.
- [ ] Given any outcome, when it renders, then "Success", "Denied", or "Failed" appears as text.
- [ ] Given all text, when contrast is measured, then it meets 4.5:1 for normal text and 3:1 for large text; meaningful non-text elements meet 3:1.
- [ ] Given every screen rendered in grayscale, when I read it, then all status meaning is retained.
- [ ] Given any chart, when it renders, then the same information is also available as an accessible table.

**Priority:** P0 | **Feature Ref:** F14 | **Persona:** PER-02 | **FRD:** FR-F14-06

---

### US-115: Be told about asynchronous changes without losing my place
**As an** Investigator who may be mid-form when a queue refresh or a degraded-system warning arrives, **I want** updates announced without stealing my focus, **so that** an alert never costs me what I was typing.

**Acceptance Criteria:**
- [ ] Given a queue refresh, a result count change, a widget load, a sort change, a new alert count, a health recovery, a role switch, or a connection-test result, when it completes, then it is announced politely without moving focus.
- [ ] Given a form error summary, an action failure, a session timeout threshold, or a degraded-system warning on first appearance, when it occurs, then it is announced assertively.
- [ ] Given rapid successive changes, when they occur, then announcements are debounced and deduplicated into one rather than a stream.
- [ ] Given a loading region, when it is busy, then it is marked busy with a visually hidden label and announces completion exactly once rather than repeatedly during polling.
- [ ] Given new content is inserted, when it arrives, then it does not move focus or reorder content under my cursor.
- [ ] Given a decorative icon, when it renders, then it is hidden from assistive technology; informative icons carry text alternatives.

**Priority:** P0 | **Feature Ref:** F14, F16 | **Persona:** PER-01 | **FRD:** FR-F14-07

---

### US-116: Use the product zoomed in, on a small screen, and without animation
**As an** Applicant checking my status on a phone, and **as a** magnification user in a reading-intensive role, **I want** the interface to work at 320px and at 200% zoom with motion I can turn off, **so that** how I read is not a barrier to what I can do.

**Acceptance Criteria:**
- [ ] Given a 320px viewport, when any route renders, then there is no horizontal page scroll and no loss of function.
- [ ] Given 200% zoom, when any route renders, then all content and function remain available with no clipping or overlap.
- [ ] Given text resized to 200%, when the page renders, then nothing is clipped or overlapping.
- [ ] Given content reflow, when it occurs, then two-dimensional scrolling is not required, except for data tables which scroll inside their own labelled region.
- [ ] Given a touch device, when I reach any target, then it is at least 44 by 44 CSS pixels.
- [ ] Given the reduced-motion preference is set, when the page renders, then all non-essential animation is disabled including skeleton shimmer and transitions.
- [ ] Given any tooltip or hover-revealed content, when I use a keyboard or touch, then the same content is available on focus and is never the only source of essential information.

**Priority:** P0 | **Feature Ref:** F14 | **Persona:** PER-03, PER-02 | **FRD:** FR-F14-08

---

### US-117: Not be punished by a timer for working at my own pace
**As an** Applicant whose sessions are short and interrupted, **I want** timing behaviour that warns me, lets me extend, and never discards what I typed, **so that** an interruption does not cost me an evening.

**Acceptance Criteria:**
- [ ] Given my session is about to expire, when two minutes remain, then a warning appears, is keyboard-operable, and offers an extension.
- [ ] Given the countdown runs, when a screen reader is in use, then it is announced at open, at 60 seconds, and at 15 seconds rather than continuously.
- [ ] Given I extend the session from inside a partially completed form, when the extension lands, then every field I had entered is preserved.
- [ ] Given content auto-refreshes, when it does, then it never moves focus or changes what is under my cursor; health polling updates a notice region only.
- [ ] Given any form, when I complete it, then no time limit other than the session timeout applies.

**Priority:** P0 | **Feature Ref:** F14, F0 | **Persona:** PER-03, PER-01 | **FRD:** FR-F14-09, FR-F00-06

---

### US-118: Read what the product claims about its own accessibility
**As an** evaluating reviewer, **I want** an accessibility statement and an automated gate that fails the build, **so that** the conformance claim is backed by evidence rather than by assertion.

**Acceptance Criteria:**
- [ ] Given the footer or the account menu on any screen — including while unauthenticated — when I follow the accessibility link, then I reach a statement naming the conformance target, the assessment approach, known limitations with dates, and how to report a problem.
- [ ] Given the statement, when I read it, then it discloses that the DCSA Ecosystem Style Guide was not supplied and that USWDS v3 with token-based theming was assumed.
- [ ] Given known limitations, when I read them, then they are listed with dates rather than claimed to be none.
- [ ] Given CI runs, when the automated accessibility scan executes across every route for every role including error, empty, and degraded states, then the build fails on any serious or critical violation.
- [ ] Given the codebase, when the theming lint rule runs, then zero hard-coded colour, font, or spacing literals are found and all visual values come from design tokens.
- [ ] Given a manual keyboard and screen-reader pass, when it is performed before the demonstration, then it is documented with date, tooling, and findings.

**Priority:** P0 | **Feature Ref:** F14, F19 | **Persona:** PER-04 | **FRD:** FR-F14-11, FR-F14-12, FR-F14-01

---
