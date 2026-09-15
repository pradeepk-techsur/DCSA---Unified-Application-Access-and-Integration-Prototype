## Epic 15: Notifications, Alerts, and System Announcements (F15)

The layer that tells users something needs their attention: work-driven alerts derived server-side from aggregated spoke data, and administrator-authored announcements. Distinct from the demo banner, which is permanent chrome and is never affected by anything in this epic.

---

### US-119: Be told when something on my caseload changes
**As an** Investigator, **I want** alerts for overdue items, new assignments, newly raised PVQ issues on my cases, blocked cases, and stalled work, **so that** I am told rather than left to discover a problem when it is already late.

**Acceptance Criteria:**
- [ ] Given seeded data, when alerts are computed, then each configured rule fires for at least one persona — overdue, due soon, new assignment, new PVQ issue, blocked, stalled, action required, and incomplete orchestration.
- [ ] Given an alert is generated, when it renders, then it carries a severity as text plus icon, a title, a message, the source system badge, a generated date, and a direct link to the item that produced it.
- [ ] Given a PVQ issue raised in the last seven days against a case assigned to me, when my dashboard renders, then the alert appears and links to the parent eApp case — the on-ramp to the flagship workflow.
- [ ] Given alert counts and queue counts, when I compare them, then they agree exactly, because both derive from the same aggregation.
- [ ] Given any alert, when I follow its link, then it opens an item I am permitted to see — an alert can never reference something I cannot open.
- [ ] Given alert computation runs, when it completes, then it has mutated no spoke; alerts are read-only over spoke data and so never need to be undone.

**Priority:** P1 | **Feature Ref:** F15, F4 | **Persona:** PER-01 | **FRD:** FR-F15-01

---

### US-120: See at a glance that something is waiting for me
**As an** Adjudicator, **I want** an unread count in the header and one page listing everything that wants my attention, **so that** I do not have to visit four screens to find out whether anything changed.

**Acceptance Criteria:**
- [ ] Given unread alerts exist, when the header renders, then it shows a count as text plus icon with the accessible name "Notifications: {n} unread" and is a link rather than a hover-only popover.
- [ ] Given I open the notifications page, when it renders, then it shows sections for "Needs your attention", "Other alerts", and "Announcements", each with a heading and a count, and each empty section shows its own empty state rather than disappearing.
- [ ] Given I filter by type, severity, source system, or read state, when results return, then chips and a clear-all control behave exactly as the work queue's do and the result count is announced.
- [ ] Given the header count and the page's unread count, when I compare them, then they match exactly.
- [ ] Given the page, when the accessibility scan runs, then it reports zero serious or critical violations and the list is a real table with a caption.

**Priority:** P1 | **Feature Ref:** F15 | **Persona:** PER-02 | **FRD:** FR-F15-02, FR-F15-06

---

### US-121: Mark an alert as read without it disappearing
**As an** Investigator, **I want** read state that changes an alert's treatment without hiding it, **so that** noticing something is not confused with resolving it.

**Acceptance Criteria:**
- [ ] Given I mark an alert as read, when it completes, then a polite announcement states "Marked as read. {n} unread remaining."
- [ ] Given an item is still overdue, when I have marked its alert read, then the alert is still shown — dismissing awareness does not resolve work.
- [ ] Given I complete the underlying work, when alerts are next computed, then the alert disappears automatically.
- [ ] Given read state, when another user views their own notifications, then my read state has no effect on theirs.
- [ ] Given read state, when I sign in again later, then it has persisted.
- [ ] Given marking read, when the audit trail is queried, then it is deliberately not recorded, because it changes no mission data and auditing it would flood the trail.

**Priority:** P1 | **Feature Ref:** F15 | **Persona:** PER-01 | **FRD:** FR-F15-03

---

### US-122: Read a notice from the platform team where I already look
**As an** Applicant, **I want** announcements to appear on my dashboard and stay retrievable afterwards, **so that** I do not learn something important from an email I have already lost.

**Acceptance Criteria:**
- [ ] Given an announcement targets my role and is currently effective, when I sign in, then it appears in a dedicated region below the header using the site-alert pattern matching its severity.
- [ ] Given I dismiss an informational or warning announcement, when the dismissal saves, then it disappears immediately for me without a reload and remains visible for other users.
- [ ] Given I dismissed something by accident, when I open the notifications page, then it is still listed with its full text and issued date, marked "Dismissed".
- [ ] Given an emergency announcement, when it renders, then it cannot be dismissed and the component explains why.
- [ ] Given the announcement body, when it renders, then it is plain text escaped on render, with any link provided as a structured action rather than smuggled into prose.
- [ ] Given an announcement arrives mid-session, when it appears, then it is announced politely once — or assertively if it is an emergency — without stealing focus.

**Priority:** P1 | **Feature Ref:** F15, F11 | **Persona:** PER-03 | **FRD:** FR-F15-04

---

### US-123: Never have a notice hide the demo banner
**As an** evaluating reviewer, **I want** the synthetic-data banner to survive every announcement, alert, and overlay, **so that** the honesty of the demonstration cannot be compromised by a notification.

**Acceptance Criteria:**
- [ ] Given an emergency announcement is active and a modal is open simultaneously, when the page is inspected, then the demo banner is still visible and not overlaid, scrolled out, or reduced.
- [ ] Given any overlay, when it renders, then it sits below the banner in stacking order.
- [ ] Given the banner, when it is compared to announcements, then they are different components — the banner is chrome, is not stored as an announcement, and is unaffected by any announcement setting.
- [ ] Given the automated assertion for the worst case, when it runs in CI, then it passes.

**Priority:** P1 | **Feature Ref:** F15, F3 | **Persona:** PER-04 | **FRD:** FR-F15-05, FR-F03-03

---

### US-124: Not be told everything is fine when alerts could not be computed
**As an** Adjudicator, **I want** the notifications surface to say which systems it could not reach, **so that** an absent alert is never presented to me as an all-clear.

**Acceptance Criteria:**
- [ ] Given a source is unavailable, when notifications render, then a named notice states "Alerts from {System} aren't available right now."
- [ ] Given every source is unavailable, when the page renders, then it states "We can't check for new alerts right now. Announcements are still shown below." rather than showing nothing.
- [ ] Given I genuinely have no alerts, when the page renders, then it reads "You have no notifications. New alerts and announcements will appear here." — copy distinct from the degraded case.
- [ ] Given notifications cannot load at all, when the page renders, then a retry control is offered rather than a blank region.
- [ ] Given alert polling is running, when a modal is open or a form has unsaved input, then polling is suspended so an announcement never interrupts an action in progress.

**Priority:** P1 | **Feature Ref:** F15, F16 | **Persona:** PER-02 | **FRD:** FR-F15-01, FR-F15-02, FR-F16-07

---
