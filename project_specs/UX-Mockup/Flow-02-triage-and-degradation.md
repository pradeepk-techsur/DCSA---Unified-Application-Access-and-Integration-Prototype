### Flow 2: Monday-morning triage, and surviving a downed system

Two journeys sharing one screen (SCR-13). They are documented together because the **degraded** variant is only meaningful against the **healthy** variant — the whole design argument is that the user can tell them apart.

**User Stories:** US-040, US-042, US-043, US-045, US-046, US-047, US-048, US-049, US-098, US-126, US-127, US-129, US-132
**Features:** F5 (queue), F8 (registry fan-out), F12 (registration propagation), F16 (health/resilience)
**Personas:** PER-01 Marcus Vale (Investigator)
**Demo path:** Segment 3b (triage, observing CVS arrive) · ✅ Segment 2a (degradation, driven from the other window)

---

#### Flow 2a: Triage — one queue answers "what do I work next"

**Trigger:** Start of the working day; and again after every 10–60 minute interruption.
**Journey:** JRN-01.02

```
[SCR-01 → one sign-in over a mediocre VPN]
   ▼
[SCR-09 Investigator dashboard]
   │  "41 open · 4 overdue · 1 new issue"
   │  one composed answer to "what is mine, what is urgent, what changed"
   ▼  "View all work"
[SCR-13 Unified work queue — DEFAULT VIEW]
   │  ✓ assigned to me, due date ascending — applied WITHOUT configuration
   │  ✓ default filters shown as REMOVABLE CHIPS  ← a silently pre-filtered
   │                                                list is a lie about completeness
   │  28–34 items · ≥4 of 5 spokes · pagination exercised at 25/page
   │
   ├─ Narrow ──▶ add source filter + due-date range
   │     chips appear · URL updates · announced:
   │     "9 work items. Showing 1 to 9. 5 of 5 systems reporting."
   │
   ├─ Read a row and commit ──▶ scan source badges + status text
   │     ▣ PVQ · due Thursday · Elevated  ← "that's the one that blocks a case"
   │     normalized date and priority semantics ACROSS sources, so a
   │     sorted list cannot be wrong in a way he cannot see
   │     ▼
   │  [SCR-14/15/16 detail]  ── returnTo encodes filters+sort+page
   │     │
   │     ▼  "Back to work queue"
   │  ◀──┘ restores filters, sort, page AND FOCUS TO THE ORIGINATING ROW
   │
   ├─ INTERRUPTION (40 minutes) ──▶ returns via browser
   │     ✓ queue is exactly where he left it — state lives in the URL
   │     ✓ or SCR-06 timeout warning → extend → nothing lost
   │
   └─ A SIXTH SOURCE APPEARS  ← driven by Flow 5 in the other window
         registryVersion poll (≤30s) → entitlements invalidated
         ▣ CVS filter option appears · 4 CVS-badged rows appear
         announced POLITELY via live region — focus NOT stolen,
         content NOT reordered under the cursor
         ✓ NO sign-out.  NO reload.  NO restart.  (SM-12)
```

| # | Step | Screen / component | Design obligation |
|---|---|---|---|
| 1 | Take the temperature | SCR-09 widgets | Counts derive from the **same aggregation path** as the queue, so dashboard and queue can never disagree |
| 2 | Open the queue | SCR-13 default view | Answers the question **without configuration**; defaults visible as chips |
| 3 | Narrow | Filter rail + chips | Filtering is **server-side and scoped to the principal** — never a client-side filter over an over-fetched list |
| 4 | Commit | Row → detail | Resource-level authorization on open; queue context captured for the return trip |
| 5 | Return from interruption | URL state | **The delight moment for this persona** — worth more than any feature that looks better in a screenshot |
| 6 | Notice CVS arrive | Source filter + new rows | Registry-driven fan-out with **no special-casing anywhere in the hub** |

**Exit criteria:** ≥4 of 5 spokes correctly attributed (SM-14), rising to 6 after CVS registration · correct next item ≤2 clicks from dashboard · every filter facet returns ≥1 result on the default range · pagination exercised · return restores filters/sort/page · CVS items appear **without signing out or reloading** (SM-12).

---

#### Flow 2b: Keep working while Investigation Management is down

> **The product's answer to the worst failure mode in the problem space:** today, an empty list is indistinguishable from an outage — and *an empty list that might be a lie is worse than an error*.

**Trigger:** A spoke becomes unhealthy while the user has an open session — detected by the **background health monitor**, not by the user.
**Journey:** JRN-01.03 · driven from the other window by Flow 6b (failure injection)

```
        ┌─────────────────────────────────────────────────────────┐
        │ OTHER WINDOW: Administrator forces IM → UNAVAILABLE      │
        │ [SCR-38 Failure injection controls]                      │
        └───────────────────────┬─────────────────────────────────┘
                                │  health monitor: 2 consecutive failed probes
                                ▼
[SCR-13 Unified work queue — refreshed]
   │
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ ! Investigation Management is unavailable — 12 items are │
   │  │   not shown. The rest of your work is up to date.        │
   │  │            usa-site-alert--warning  role="status"        │
   │  │            announced ONCE · focus NOT moved              │
   │  └──────────────────────────────────────────────────────────┘
   │  caption: "Work items assigned to you — 29 results.
   │            4 of 5 systems reporting."   ← the total is NEVER
   │                                           presented as complete
   │  ▼ remaining four sources render FULLY and ACTIONABLY
   │
   │  ┌─ THE CRUCIAL DISTINCTION ──────────────────────────────┐
   │  │                                                        │
   │  │  DEGRADED (above)          vs.   EMPTY                 │
   │  │  "IM is unavailable —            "You have no assigned │
   │  │   12 items are not shown"         work right now."     │
   │  │  usa-site-alert--warning          usa-alert--info      │
   │  │  icon: warning  !                 icon: info  ⓘ        │
   │  │  data IS missing                  data is genuinely    │
   │  │                                   absent               │
   │  │  → different WORDING, different STRUCTURE, different   │
   │  │    ICON SHAPE. Legible in grayscale AND non-visually.  │
   │  └────────────────────────────────────────────────────────┘
   │
   ├─ Keep working ──▶ filter to eApp + PVQ, continue triaging
   │     one dead spoke NEVER stalls the aggregate request
   │
   ├─ Hit a blocked action ──▶ [SCR-14 detail, IM-targeted item]
   │     [ Update case status ] (disabled, removed from tab order)
   │     "Investigation Management isn't responding right now.
   │      Try again when it's back."   ← adjacent TEXT, aria-describedby
   │     ✓ told BEFORE typing three paragraphs, not after
   │
   ├─ Cross-check ──▶ same specific message on SCR-09 dashboard
   │     consistent degraded treatment wherever incomplete data appears
   │     ✗ NO error page.  ✗ NO blank screen.  ✗ NO stack trace. ANYWHERE.
   │
   ▼  RECOVERY — one successful probe (DOWN→HEALTHY needs only 1;
   │              HEALTHY→DOWN needs 2. Asymmetry is deliberate.)
   │
   │  warning replaced by a POLITE announcement + explicit control:
   │  "Investigation Management is available again.
   │   Refresh to see 12 more items."        [ Refresh ]
   │   ↑ does NOT silently reorder rows under the cursor
   │
   ▼  clear filter → all five sources → count reconciles → 41 again
      ✓ NO reload.  ✓ NO re-authentication.  ✓ NO admin action. (SM-17)
```

**Steps and system response**

| # | Step | What the user sees | System response |
|---|---|---|---|
| 1 | Refresh the queue | Fewer rows than expected | Fan-out returns **HTTP 200 with partial results** + per-source status list. A partial result is *a success with disclosure, not an error* |
| 2 | Read the warning | Named + quantified degraded banner | Count comes from `work_item_counts_cache`; **omitted rather than guessed** when unknown |
| 3 | Keep working | Four sources fully actionable | Circuit breaker opens so the hub stops hammering IM; remaining adapters answer at full speed |
| 4 | Hit a blocked action | Disabled control + plain reason | Server-computed action list marks IM-targeted actions unavailable **with a reason**; client renders them **disabled, not hidden**, so the capability stays legible |
| 5 | Cross-check | Same message on dashboard | Degraded state surfaced consistently; **no error page anywhere** |
| 6 | Recovery arrives | Polite announcement + Refresh | Half-open probing succeeds, circuit closes, polling delivers restored data to the **open session** |
| 7 | Resume | Counts reconcile | Full fan-out resumes; counts cache refreshed; result count announced |

**Failure and alternate paths**

| Condition | What the user sees | Recovery |
|---|---|---|
| **Two spokes down** | Both named in **one** alert with their own counts. The warning **composes** rather than collapsing into "something went wrong" | Unchanged behaviour |
| Spoke **slow** rather than dead | Widget/section loading states with accessible busy announcements; adapter times out at its bound and degrades to the named warning rather than hanging the page. Rows show inline **"Slow to respond"** | Page stays interactive throughout |
| Omitted count unknown | "Investigation Management is unavailable — **some** items are not shown." Number omitted, never guessed | Count returns on next successful fan-out |
| Spoke returns **but with errors** | Health reports `DEGRADED`, not healthy; warning persists with degraded wording; circuit reopens on repeated failure | Automatic; each failure class recorded |
| **All** sources down | Degraded state with an empty list — **never** an empty state, never a 500, never an error route: "We can't reach any connected systems right now. Your work will appear here automatically when they're back." + `[Try again]` | Automatic |
| Mid-form elsewhere when recovery lands | Live region announces; **focus is not moved; input is untouched** | Finishes the form, sees refreshed queue on return |
| Genuinely empty filter result | Designed empty state explaining what would appear + `[Clear all filters]` — **visibly and structurally different** from degraded | Clear or widen filters |

**Exit criteria**

- Remaining four sources render **fully and actionably** with a **specific named warning** (SM-15, SM-16).
- **No error page, blank screen, or stack trace anywhere in the application** during the outage (NFR-09).
- Actions targeting the unavailable spoke are **disabled with an explanation before submission**, not failed after it.
- Restoring the spoke clears the warning and restores data **without reload or re-authentication** (SM-17).
- The degraded warning is announced to assistive technology **without stealing focus**.
- One correctly attributed entry appears in the integration error log within one health-check interval.

**Accessibility notes**

- **Keyboard-only:** every control remains reachable during degradation. Disabled actions are **removed from the tab order** but their reason renders as **adjacent text** — so a keyboard user learns *why* rather than discovering an inert control.
- **Screen reader:** the degraded warning is delivered through `role="status"` **and is also present in the static page structure**, so a user arriving after the announcement still meets it by navigating headings and landmarks. Announcements **must not** move focus.
- The warning **names the application in text** — health and degraded states are never a red/green dot (NFR-02).
- Loading and busy states carry `aria-busy` and an accessible label; **a skeleton without semantics is a silent screen**.
- The **empty-vs-degraded distinction must be clear non-visually**: different wording, different structure — not merely a different icon colour.
- The degraded banner **must not consume the viewport or push the demo banner out of view** at 320px (NFR-13 vs NFR-16 — tested explicitly).
- Announcements are **debounced**: the 30-second health poll does **not** re-announce an already-displayed warning.

---
