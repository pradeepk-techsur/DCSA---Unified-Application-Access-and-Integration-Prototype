
### JRN-01.02: Monday-Morning Triage Across the Whole Caseload

**Persona:** PER-01 (Marcus Vale)
**Scenario:** 0705 on a Monday, laptop on a hotel desk over a VPN. Forty-one open cases, a weekend of accumulation, and a day that will be interrupted a dozen times. Marcus needs one trustworthy answer to "what is assigned to me and what is due first" before he starts making phone calls — and he needs that answer to survive the interruptions, so that when he comes back at 0940 after a source calls him, the queue is still where he left it. This journey is also where a newly registered sixth application (CVS) becomes visible to him without signing out, which is why it is paired with JRN-04.01 in the demo.
**Related Jobs:** JTBD-01.2 *(primary)*, JTBD-01.3 *(recent activity and the record)*, JTBD-04.1 *(as the observing half of the extensibility proof)*
**Entry Trigger:** Start of the working day, and again after every interruption of 10–60 minutes.
**Demo Path:** Supporting — **Segment 3b**. Marcus's queue is the window an evaluator watches while Priya registers CVS in the other window.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | PER-01's queue contains **28–34 items** spanning **at least four of five** spokes, so pagination at 25 per page is exercised and SM-14 is observable. |
| P2 | im | Overdue assignments owned by PER-01, so the overdue alert rule and due-date sort have real material rather than a contrived single row. |
| P3 | eapp / pvq / pdt | Items owned by PER-01 in each namespace with varied status and priority, so **every filter facet returns at least one result** — a filter that always returns nothing looks broken. |
| P4 | hub | Default saved view for the investigator role: "assigned to me, due date ascending", applied without configuration. |
| P5 | hub | Two active announcements targeted at the investigator role, one of which is dismissible per user, plus ~4 alerts of distinct types (overdue, newly raised issue, blocked case, approaching due). |
| P6 | cvs | Nine CVS alerts, four of them assignable to PER-01, seeded but **unreachable until CVS is registered** — the visible consequence of JRN-04.01. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Sign in | Authenticates once by CAC/PIV over a VPN that is having a mediocre morning | SCR-01 → SCR-02 | "Please just let me in once." | Impatient | **Today:** three logins with three session lifetimes; the one he needs third has already expired | One session, honored by every adapter for its whole life (F1) |
| 2. Take the temperature | Reads assigned-work counts, alerts, and due-date widgets | SCR-09 investigator dashboard | "Forty-one open. Four overdue. One new issue. Okay." | Braced but oriented | **Today:** the shape of his own workload has to be reconstructed from three systems and memory | One composed answer to "what is mine, what is urgent, what changed" (F4) |
| 3. Open the queue | Activates "View all work" and lands on the default view | SCR-13 unified work queue, "assigned to me, due date ascending" | "It already sorted it the way I would have." | Mildly surprised | **Today:** three lists, three sort orders, none prioritized against the others, so he prioritizes by whoever called him last | A default view that answers the question without configuration; next action ≤ 2 clicks from sign-in |
| 4. Narrow | Adds a source-system filter and a due-date range; chips appear with a clear-all | SCR-13 → filter chips + result count | "Show me just what's overdue this week." | In control | **Today:** narrowing means re-querying each system separately and comparing by hand | Server-scoped filtering with removable chips and an announced result count (F5, F14) |
| 5. Read a row and commit | Scans source badges and status text, opens the highest-consequence item | SCR-13 row → SCR-14/SCR-15 detail | "PVQ badge, due Thursday. That's the one that blocks a case." | Decisive | **Today:** priority and due-date semantics differ invisibly between systems, so a sorted list can be wrong in a way he cannot see | Normalized date and priority semantics with visible source attribution on every row |
| 6. Get interrupted, come back | A source calls; he abandons the screen for forty minutes, then returns via the browser | SCR-13 restored with prior filters, sort, and page | "It's exactly where I left it. I don't have to rebuild this." | Relieved | **Today:** he rebuilds filters and scroll position from scratch a dozen times a day | Queue context preserved across return navigation and interruption (F6) |
| 7. Notice something new arrive | A sixth source appears in the filter list and four new items appear in the queue, correctly attributed — without him signing out | SCR-13 → source filter + new CVS-badged rows | "Where did those come from? Nobody restarted anything." | Curious, then impressed | **Today:** a new application means a new login, a new URL, and an engineering project that took months | Registry-driven fan-out: a newly registered application reaches an open session on the next poll (F8, F12, SM-12) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Sign in | One server-side session; entitlements computed server-side and returned to build navigation, so the UI never advertises what he cannot do | F0, F1, F2 |
| 2. Take the temperature | Dashboard composed per role from live spoke data with widget-level loading states, so a slow spoke never blanks the page; alert rules computed server-side | F4, F15, F16 |
| 3. Open the queue | Single fan-out request across all registered adapters with per-source partial-failure tolerance; normalized work-item model with source attribution retained | F5, F8 |
| 4. Narrow | Filtering, sorting, and search evaluated **server-side and scoped to what this principal may see** — never a client-side filter over an over-fetched list | F5, F2, F14 |
| 5. Read a row and commit | Resource-level authorization on open; queue context (filters, sort, page) captured for the return trip | F2, F6 |
| 6. Get interrupted, come back | Saved view state restored; session still live, or SCR-06 timeout warning with an accessible path back that does not discard anything | F6, F0 |
| 7. Notice something new arrive | Registry version poll (≤ 30 s) delivers updated navigation and fan-out targets to an open session; CVS items normalized and badged like any other source, with **no special-casing anywhere in the hub** | F8, F12, F5 |

**Emotion curve (1 anxious → 5 confident):** Sign in **2** *(Monday, VPN, forty-one cases)* → Dashboard **3** → Queue **4** → Narrow **4** → Commit **4** → Return from interruption **5** *(the context survived)* → New source appears **5**.

#### Key Moments

- **Decision Point — Stage 5.** He commits his morning to an ordering. If the sort is wrong in a way he cannot explain, the whole day is mis-spent and he goes back to checking each system by hand.
- **Delight Opportunity — Stage 6.** Returning after forty minutes to filters, sort, and page exactly as he left them. For an investigator with a severe interruption profile, this is worth more than any feature that looks better in a screenshot.
- **Risk of Abandonment — Stage 3.** A queue that shows fewer sources than he knows he has work in. He will not report it; he will quietly resume checking each system directly, and the product has lost its only value.
- **Demo Moment — Stage 7.** New work arriving in an already-signed-in session without a restart is the visible consequence that makes JRN-04.01's registration real rather than administrative.

#### Success Exit Criteria

- The queue renders correctly attributed items from **at least four of five** spokes (SM-14), rising to six after CVS registration.
- The correct next item is reachable from the dashboard in **two clicks or fewer**.
- Every filter facet returns at least one result on the default date range; pagination is exercised (> 1 page).
- Returning from an item restores filters, sort, and page.
- Sort changes announce sort state; filter changes announce a result count.
- Newly registered CVS items appear **without signing out or reloading the application** (SM-12).

#### Failure and Alternate Paths

| Condition | What Marcus sees | Recovery |
|-----------|------------------|----------|
| One spoke unavailable | Remaining sources render fully plus a named, quantified warning — see JRN-01.03 | Keep working; recovery is automatic |
| Genuinely empty filter result | A **designed empty state** explaining what would appear here and offering "clear filters" — visibly different from a degraded state | Clear or widen the filters |
| Session expires during a long interruption | SCR-06 warning while still signed in; if it lapses, sign-in returns him to the requested path via `returnTo` | Re-authenticate; queue view state is restored |
| An item he may see but may not act on | The item opens; the action set is computed server-side and simply does not offer what he is not entitled to do | No wasted effort on an action he cannot complete |
| Search returns another investigator's case by identifier guess | Denied at resource level, non-enumerably; the denial is audited | Continue within his own scope |

#### Accessibility Notes

- **Keyboard-only:** the entire journey — filter chips, sortable headers, pagination, row activation, clear-all — is reachable and operable by keyboard with a visible focus order that follows the visual order. No keyboard traps in the filter panel.
- **Screen reader:** the queue is a proper data table with caption and header scope; sortable headers announce current sort state; filter and pagination changes announce the new result count via a live region; source attribution is in each row's accessible name.
- Announcements and alerts arriving asynchronously (including CVS appearing at Stage 7) are delivered through live regions **without stealing focus** — he may be mid-form elsewhere.
- Overdue, blocked, and new states are conveyed by text and/or icon, never color alone (NFR-02).
- Usable at 200% zoom and at 320px-equivalent width with no horizontal scrolling; the queue reflows rather than requiring lateral scroll (NFR-16).

#### Success Outcome

Marcus's unified queue renders correctly attributed items from at least four of five spokes and he opens the correct next item from the dashboard in **two clicks or fewer** — the success measure of JTBD-01.2 (SM-14, SM-24) — with his working context surviving a 40-minute interruption and a newly onboarded sixth application reaching his open session without a sign-out (SM-12).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Sign in | F0, F1, F2 |
| 2. Take the temperature | F4, F15, F16, F17 |
| 3. Open the queue | F5, F8, F17 |
| 4. Narrow | F5, F2, F14 |
| 5. Read a row and commit | F5, F6, F2 |
| 6. Get interrupted, come back | F6, F0, F3 |
| 7. Notice something new arrive | F8, F12, F5, F16 |

---
