## F15 — Notifications, Alerts, and System Announcements

**Traces to:** PRD F15 (P1). **Screens:** SCR-21 notifications list, SCR-29 announcement management, dashboard alert panels, header indicator. **API:** `Y1a §Notifications`.

**Description:** The information layer that tells users something needs their attention: work-driven alerts derived server-side from aggregated spoke data, and administrator-authored system announcements. Distinct from the demo banner, which is permanent chrome and is never affected by anything in this feature.

**Terminology:**
- **Alert** — a derived, read-only signal computed from spoke data (overdue item, new issue, approaching due date). Not stored as spoke state, never mutating a spoke.
- **Announcement** — administrator-authored content stored in the hub (`Y0a.announcements`).
- **Notification** — the union of the two, as presented to the user.
- **Dismissal** — a per-user, per-announcement suppression.

---

### FR-F15-01 — Derived alert computation

**Description:** Alerts are computed server-side from the same aggregation that feeds the queue, so they can never disagree with it.

**Inputs:** Aggregated `WorkItem[]` for the principal (`FR-F05-02`); current time; alert rule configuration.

**Processing / business rules:** Alert rules, each with an ID, a condition, and a severity:

| Rule ID | Condition | Severity | Roles |
|---|---|---|---|
| `ALERT-OVERDUE` | `overdue == true AND statusCategory != CLOSED` | WARNING | Inv, Adj, App |
| `ALERT-DUE-SOON` | `dueDate within 3 days AND statusCategory != CLOSED` | INFO | Inv, Adj, App |
| `ALERT-NEW-ASSIGNMENT` | `assigneeId == principalId AND createdAt within 24h` | INFO | Inv, Adj |
| `ALERT-NEW-PVQ-ISSUE` | A `PVQ_ISSUE` created within 7 days whose `parentCaseRef` is a case assigned to the principal | WARNING | Inv |
| `ALERT-BLOCKED` | `statusCategory == BLOCKED` | WARNING | Inv, Adj |
| `ALERT-STALLED` | `statusCategory == IN_PROGRESS AND lastActivityAt older than 14 days` | INFO | Inv, Adj |
| `ALERT-ACTION-REQUIRED` | An `IEP_TASK` or eApp case in `INFORMATION_REQUESTED` for the applicant's own subject | WARNING | App |
| `ALERT-ORCHESTRATION-INCOMPLETE` | An orchestration transaction in `PARTIALLY_COMPLETED` or `NEEDS_ATTENTION` authored by the principal | WARNING | Inv |

Additional rules:
1. Alerts are **read-only over spoke data**: alert generation never mutates a spoke, so it never needs to be undone (PRD F15).
2. Alerts are computed on request, not stored as durable rows — except for read state (`FR-F15-03`), which is hub-local.
3. Every alert carries `{ alertId (deterministic hash of ruleId + workItemId), ruleId, severity, title, message, workItemId, sourceSystem, generatedAt, actionHref }`. Determinism matters: the same condition produces the same `alertId` across requests, so read state sticks.
4. Alerts respect the principal's scope; an alert can never reference an item the principal may not open.
5. When a source is unavailable, alerts derived from it are absent, and the notifications surface says so: "Alerts from {System} aren't available right now." — an absent alert is never presented as an all-clear.
6. `ALERT-NEW-PVQ-ISSUE` is the dashboard on-ramp to the flagship workflow (`FR-F04-02` widget 3).

**Outputs:** `alerts[]` on `GET /api/notifications` and in dashboard widgets.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Source unavailable | 200 | — | "Alerts from {System} aren't available right now." |
| No alerts | 200 | — | "You have no alerts right now." |

**Acceptance criteria:**
- AC-1: Every rule fires against seeded data for at least one persona (`FR-F17-07`).
- AC-2: Alert counts match the queue's filtered counts exactly.
- AC-3: No alert links to an item the principal cannot open.

---

### FR-F15-02 — Alert presentation: dashboard, header indicator, list (SCR-21)

**Processing / business rules:**
1. **Dashboard alerts panel** (`FR-F04-02` widget 2) shows the top alerts by severity then due date, each linking directly to the item that produced it, preserving context.
2. **Header indicator** shows an unread count as text plus icon with an accessible name: "Notifications: 4 unread." It is a link to SCR-21, never a hover-only popover, so it is operable by keyboard and touch alike.
3. **SCR-21 notifications list** shows all current alerts and announcements for the principal, filterable by type (`Alert | Announcement`) and severity, sortable by date and severity, with a designed empty state.
4. Each row: severity (text + icon), title, message, source system badge (alerts only), generated/issued date, read state, and a link to the originating item or the announcement detail.
5. The list is a real table with a caption and announced result counts (`FR-F14-04`).
6. New alerts arriving during a session are announced once via a polite live region — "You have 1 new alert." — **without stealing focus** (`FR-F14-07`).
7. Alert polling occurs every 60 seconds and is suspended while a modal is open or a form has unsaved input, so an announcement never interrupts an action in progress.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Notifications unavailable | 200 | — | "We couldn't load your notifications. Try again." with a retry control. |
| Empty | 200 | — | "You have no notifications. New alerts and announcements will appear here." |

**Acceptance criteria:**
- AC-1: The header count matches SCR-21's unread count exactly.
- AC-2: Every alert link resolves to a real, permitted item.
- AC-3: New-alert announcements do not move focus.

---

### FR-F15-03 — Read/unread state

**Processing / business rules:**
1. Read state is hub-local, per principal per `alertId` (`Y0a.alert_read_state`). It is not spoke state, because whether a user has noticed something is a hub concern.
2. `POST /api/notifications/{alertId}/read` marks one read; `POST /api/notifications/read-all` marks all currently visible alerts read.
3. The control is an accessible button labelled "Mark as read" with a confirmation announced politely: "Marked as read. 3 unread remaining."
4. Read state does not hide an alert; it only changes its visual and textual treatment and the unread count. A still-overdue item still shows as an alert, because dismissing awareness does not resolve work.
5. When the underlying condition clears (the item is completed), the alert disappears on the next computation, and its read-state row is garbage-collected.
6. Read state is per principal; it never affects another user.
7. Marking read is **not** audited — it is not a state change to mission data, and auditing it would flood the trail. This exclusion is deliberate and recorded here rather than left implicit.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Alert no longer exists | 200 | — | No error; the request is a no-op and the list refreshes. |
| Persist failure | 500 | `INTERNAL_ERROR` | "We couldn't save that. The alert will stay unread for now." |

**Acceptance criteria:**
- AC-1: Read state persists across sessions and is per user.
- AC-2: A resolved condition removes its alert automatically.

---

### FR-F15-04 — System announcements rendering

**Description:** Administrator-authored notices as users see them. Authoring is `FR-F11-06`.

**Processing / business rules:**
1. An announcement is shown to a principal when: `now` is between `effectiveFrom` and `expiresAt`, `principal.activeRole ∈ targetRoles`, and the principal has not dismissed it.
2. Rendering uses the USWDS site-alert pattern with severity mapping: `INFO` → informative, `WARNING` → warning, `EMERGENCY` → emergency.
3. Announcements render in a dedicated region **below** the demo banner and the header, and **never** overlay, replace, or reduce the visibility of the demo banner (`FR-F03-03`).
4. `INFO` and `WARNING` announcements are dismissible; `EMERGENCY` announcements are not (`FR-F11-06` rule 6), and their non-dismissibility is explained in the component: "This notice can't be dismissed."
5. Dismissal is per user per announcement, persisted in `Y0a.announcement_dismissals`, and takes effect immediately without a reload.
6. Announcement body is plain text, escaped on render. No HTML, no scripts, no links embedded in body text; a single optional `actionHref` and `actionLabel` provide a link, so link destinations are structured rather than smuggled into prose.
7. Announcements also appear on SCR-21 with their full text and issued date, including dismissed ones (shown as "Dismissed"), so a user can retrieve something they dismissed by accident.
8. New announcements arriving mid-session are announced politely once, and `EMERGENCY` ones use `role="alert"`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Dismiss failed | 500 | `INTERNAL_ERROR` | "We couldn't save that. The notice will reappear until we can." |

**Acceptance criteria:**
- AC-1: An announcement targeted at Investigator appears for that role and not for others.
- AC-2: Dismissal persists per user and is retrievable on SCR-21.
- AC-3: An announcement never obscures the demo banner, verified visually and by DOM assertion.

---

### FR-F15-05 — Distinction from the demo banner

**Description:** An explicit non-conflict requirement, because conflating the two would compromise NFR-13.

**Processing / business rules:**
1. The demo banner is chrome, permanent, non-dismissible, and rendered by the shell (`FR-F03-03`). It is not an announcement, is not stored in `announcements`, and is not affected by any announcement setting.
2. No announcement, alert, modal, or overlay may cover, hide, or scroll the demo banner out of the document. Overlays render below it in stacking order.
3. An automated assertion verifies banner visibility with an active `EMERGENCY` announcement and an open modal simultaneously — the worst case, tested explicitly.

**Acceptance criteria:**
- AC-1: The banner remains visible under every announcement and overlay combination (NFR-13, SM-10).

---

### FR-F15-06 — Notifications list screen behavior (SCR-21)

**Processing / business rules:**
1. Reachable from the header indicator and from primary navigation for all roles.
2. Sections: "Needs your attention" (unread warnings), "Other alerts", "Announcements". Each section has a heading and a count; empty sections render their own empty state rather than disappearing, so the page's structure is stable.
3. Filters: type, severity, source system, read state. Filter chips and clear-all, matching the queue pattern.
4. Bulk "Mark all as read" with a confirmation announcement.
5. Every row's primary link opens the originating work item; announcements expand in place to full text.
6. Degraded sources are named at the top of the page when alerts could not be computed for them.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| All sources unavailable | 200 | — | "We can't check for new alerts right now. Announcements are still shown below." |
| No notifications at all | 200 | — | "You have no notifications. New alerts and announcements will appear here." |

**Acceptance criteria:**
- AC-1: The page is fully populated for the investigator persona and shows designed empty states for the zero-item applicant.
- AC-2: All filters work and are announced.
- AC-3: The page passes the accessibility scan.

---
