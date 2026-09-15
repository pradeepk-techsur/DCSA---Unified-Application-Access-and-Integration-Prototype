
### JRN-01.03: Keep Working While Investigation Management Is Down

**Persona:** PER-01 (Marcus Vale)
**Scenario:** Mid-morning, Marcus is at an employer site working over a VPN. Unknown to him, Investigation Management has just been forced into an unavailable state — in the demo, deliberately, by Priya from the failure-injection controls (JRN-04.03); in production, by an ordinary outage. He refreshes his queue. Today, the symptom of an unhealthy back-end is an empty list, and an empty list that might be a lie is worse than an error: he cannot distinguish "no items" from "the system couldn't be reached," so he stops trusting every screen. This journey is the product's answer: degradation that is **named, quantified, and survivable**, with the other four sources fully usable and recovery that costs him nothing.
**Related Jobs:** JTBD-01.4 *(primary)*, JTBD-01.2 *(the queue he is still working)*
**Entry Trigger:** A spoke becomes unhealthy while Marcus has an open session — detected by the background health monitor, not by Marcus.
**Demo Path:** ✅ **SECONDARY SCRIPTED DEMO — Segment 2a.** Driven from the other window by JRN-04.03. The evaluator watches this window.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | im | **IM is the designated outage-demonstration spoke.** Its seed data must include items owned by PER-01 — including overdue ones — so that removing it **visibly changes counts**. A degradation demo against an empty source is abstract and unconvincing. |
| P2 | hub | A populated `work_item_counts_cache` for PER-01 × IM from a prior successful fan-out, so the warning can quantify the gap ("12 items are not shown") rather than fall back to the unquantified copy. |
| P3 | eapp / pvq / pdt | Enough PER-01-owned items in the remaining spokes that the queue is still substantively useful with IM removed — the claim is "the rest of your work is up to date," and it has to be true on screen. |
| P4 | im | At least one **in-flight action target** owned by PER-01 in IM, so the pre-emptively disabled action state is demonstrable rather than theoretical. |
| P5 | hub | Failure-injection controls available to the administrator identity (SCR-38), demo-scoped and administrator-only. |
| P6 | hub | Circuit-breaker thresholds and health-probe interval configured tightly enough that the demo does not require an awkward silence — degradation and recovery must both be observable inside one health-check interval. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Refresh the queue | Returns to the queue after a call and the page refreshes | SCR-13 unified work queue | "Hang on — that's fewer rows than it was." | Suspicious | **Today:** an empty or short list is indistinguishable from an outage, so he cannot trust what he is looking at | Partial results by default: what is available renders, what is missing is stated |
| 2. Read the warning | Reads a prominent site-alert: **"Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date."** | SCR-13 → degraded-system banner | "Twelve missing, and I know which system. Fine — that's not my problem to solve." | Annoyed but oriented | **Today:** he calls the administrator or a colleague to ask whether "it's just me," and waits | Degradation named **and quantified**, so the gap is bounded rather than unknown (NFR-10) |
| 3. Keep working the rest | Filters to eApp and PVQ and continues triaging | SCR-13 → source filter, remaining four sources fully actionable | "Four out of five still works. I can use the morning." | Productive again | **Today:** one unhealthy back-end stalls the page or blanks the list, and he stops working entirely | One slow or dead spoke never stalls the aggregate request; the rest stays actionable (SM-16) |
| 4. Hit a blocked action | Opens an item whose action targets IM; the action is visibly disabled with a plain explanation | SCR-14 work-item detail → disabled action + explanatory text | "It's telling me now, not after I typed three paragraphs." | Respected | **Today:** the action is offered, accepted, and fails mid-submission, taking his typed input with it | Actions against an unavailable spoke are **pre-emptively disabled with an explanation**, never allowed to fail mid-flight |
| 5. Check whether it is just him | Glances at the header status indicator; the warning is consistent everywhere incomplete data is shown | SCR-08 shell header → SCR-09 dashboard degraded notice | "Same message on the dashboard. It's the system, not me." | Settled | **Today:** each screen fails differently, so he cannot form a single picture of what is wrong | Consistent, specific degraded treatment wherever incomplete data appears (F16) |
| 6. Recovery arrives | The next successful health check restores IM; the warning clears and the missing items reappear | SCR-13 live-region update — **no reload, no re-authentication** | "It came back on its own. I didn't have to do anything." | Reassured | **Today:** recovery means a page reload at best and a fresh login at worst, usually discovered by trial and error | Automatic recovery via half-open circuit probing; the user does nothing (SM-17) |
| 7. Resume with a full picture | Clears the filter and sees all five sources and the restored count | SCR-13 full queue + announced result count | "Back to forty-one. Nothing got lost." | Confident | **Today:** he re-verifies each source by hand before he trusts the total again | Counts reconcile after recovery, so trust is restored rather than merely assumed |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Refresh the queue | Fan-out returns HTTP 200 with partial results and a per-source status list; the failing adapter's error is logged with a correlation ID into the integration error log | F5, F16, F8, F11 |
| 2. Read the warning | Degraded banner rendered from per-source status, naming the application and quantifying the omission from the last successful count; where no prior count exists the copy omits the number rather than guessing | F16, F14, NFR-10 |
| 3. Keep working the rest | Circuit breaker opens after the configured failure threshold, so the hub stops hammering IM and the remaining adapters answer at full speed | F16, F8, F9 |
| 4. Hit a blocked action | Server-computed action list marks IM-targeted actions unavailable with a reason; the client renders them disabled with explanatory text rather than hiding them, so the capability is legible | F6, F2, F16 |
| 5. Check whether it is just him | Degraded state is surfaced consistently on dashboard, queue, and detail; **no error page and no blank screen appears anywhere** in the application | F4, F16, F3 |
| 6. Recovery arrives | Half-open probing succeeds, the circuit closes, health flips to healthy, polling delivers restored data to the open session; the warning clears through the same live region that raised it | F16, F1 |
| 7. Resume with a full picture | Full fan-out resumes; `work_item_counts_cache` refreshed; result count announced | F5, F16, F14 |

**Emotion curve (1 anxious → 5 confident):** Refresh **2** *(the count is wrong)* → Read warning **3** *(named and bounded — the anxiety converts to information)* → Keep working **4** → Blocked action **4** *(told before, not after)* → Cross-check **4** → Recovery **5** → Resume **5**.

#### Key Moments

- **Decision Point — Stage 2.** Does he keep working or stop and start phoning people? The named, quantified warning is the entire difference. "Investigation Management is unavailable — 12 items are not shown" converts an outage into a bounded, manageable fact.
- **Risk of Abandonment — Stage 1.** If the short list arrives with no explanation, he learns the screen can lie by omission. That trust loss is permanent: he will re-check every source system by hand forever, and the product's only value is gone.
- **Risk — Stage 4.** A warning that steals focus out of a half-written narrative is itself a failure. Degraded notices are polite live-region updates, never focus grabs.
- **Delight Opportunity — Stage 6.** Recovery with **no reload and no re-authentication** is the observable that separates "we handled the error" from "we designed for it" (SM-17).

#### Success Exit Criteria

- The queue renders the remaining four sources **fully and actionably** with a **specific named warning** (SM-15, SM-16).
- **No error page, blank screen, or stack trace appears anywhere in the application** during the outage (NFR-09, SM-15).
- Actions targeting the unavailable spoke are disabled with an explanation before submission, not failed after it.
- Restoring the spoke clears the warning and restores data **without user reload or re-authentication** (SM-17).
- The degraded warning is announced to assistive technology **without stealing focus**.
- A correctly attributed entry appears in the integration error log within one health-check interval (pairs with JRN-04.02).

#### Failure and Alternate Paths

| Condition | What Marcus sees | Recovery |
|-----------|------------------|----------|
| Two spokes down simultaneously | Both named in the warning with their own counts; the remaining sources still render | Unchanged behavior; the warning composes rather than collapsing into "something went wrong" |
| Spoke is **slow** rather than dead | Widget- and section-level loading states with accessible busy announcements; the adapter times out at its configured bound and degrades to the named warning rather than hanging the page | Page remains interactive throughout |
| Omitted count unknown (no cached prior count) | "Investigation Management is unavailable — some items are not shown." The number is omitted rather than guessed | Count returns on the next successful fan-out |
| The spoke returns but with errors | Health reports degraded rather than healthy; the warning persists with the degraded wording; the circuit reopens on repeated failure | Automatic, with the error log recording each failure class |
| Marcus is mid-form in another item when recovery lands | The live region announces the change; **focus is not moved**; his input is untouched | He finishes the form and sees the refreshed queue on return |

#### Accessibility Notes

- **Keyboard-only:** every control remains reachable during degradation. Disabled actions stay **focusable and explained** (or are paired with adjacent explanatory text) so a keyboard user learns *why* rather than finding an inert control.
- **Screen reader:** the degraded warning is delivered through a live region with `aria-live="polite"` and is also present in the page's static structure, so a user who arrives after the announcement still encounters it by navigating headings and landmarks. Announcements **must not** move focus.
- The warning names the application in text — health and degraded states are never conveyed by a red/green dot or color alone (NFR-02).
- Loading and busy states carry accessible busy announcements; a skeleton without semantics is a silent screen.
- The distinction between a **designed empty state** and a **degraded state** must be clear non-visually as well as visually: different wording, different structure, not merely a different icon color.
- Usable at 200% zoom and 320px-equivalent width; the banner must not consume the viewport or push the demo banner out of view (NFR-13, NFR-16).

#### Success Outcome

With a spoke forced offline from the administrator's failure-injection control, Marcus's queue renders the remaining sources plus a **specific named warning with no error page anywhere in the application**, and restoring the spoke clears the warning **without reload or re-authentication** — the success measure of JTBD-01.4 (SM-15, SM-16, SM-17).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Refresh the queue | F5, F16, F8 |
| 2. Read the warning | F16, F14, F5 |
| 3. Keep working the rest | F5, F16, F9 |
| 4. Hit a blocked action | F6, F2, F16 |
| 5. Check whether it is just him | F4, F3, F16 |
| 6. Recovery arrives | F16, F1, F11 |
| 7. Resume with a full picture | F5, F16, F14 |

---
