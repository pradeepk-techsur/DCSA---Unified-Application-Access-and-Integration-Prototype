
### JRN-04.03: Rehearse Degradation on Purpose — Induce, Observe, Restore

**Persona:** PER-04 (Priya Raghunathan)
**Scenario:** Before a demonstration — and, in a real program, before a production incident teaches it to her — Priya needs to verify that the platform degrades the way it claims to. She takes Investigation Management offline **on purpose** from the administrator-only failure-injection controls, watches the health monitor notice, watches the integration error log fill with correctly attributed entries, watches an investigator's queue degrade **visibly rather than blankly** in the next window, and then restores the spoke and watches everything clear automatically with nobody reloading and nobody re-authenticating. Today there is no way to induce a controlled failure at all, so resilience behavior is untested until it is production.
**Related Jobs:** JTBD-04.2 *(health before complaint)*, JTBD-04.4 *(resilience is rehearsable)*; drives JTBD-01.4 and JTBD-02.4 from the other side of the glass
**Entry Trigger:** Pre-demo rehearsal, or an evaluator asking "what happens when one of these is down?"
**Demo Path:** ✅ **SECONDARY SCRIPTED DEMO — Segment 2b.** This is the **driving** half of the resilience segment: Priya acts here, the evaluator watches JRN-01.03 (investigator) and JRN-02.02 (adjudicator) in the other window. Always restore before moving to the next segment.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | **Failure-injection controls present, administrator-only, and demo-scoped** (SCR-38), able to force any registered spoke into **unavailable, slow, or erroring** state and restore it. |
| P2 | im | **IM designated as the outage-demonstration spoke**, with seeded items — including overdue ones — owned by the investigator persona, so removing it **visibly changes counts** on the observing screen. |
| P3 | pvq | PVQ independently injectable, because the adjudicator-facing consequence (JRN-02.02) is a different and equally important demonstration. |
| P4 | hub | A populated per-principal, per-source count cache so the degraded warning can **quantify** the omission rather than falling back to unquantified copy. |
| P5 | hub | Health-probe interval and circuit-breaker thresholds tuned so degradation **and** recovery are each observable within a single check interval — a resilience demo with a ninety-second silence in the middle does not land. |
| P6 | hub | An investigator session open in a second window before injection begins, so "no reload, no re-authentication" is observed rather than asserted. |
| P7 | hub | Restore leaves **no residue**: no stuck circuit, no stale degraded flag, no orphaned error state. Verified as part of rehearsal, because a failure injection a restore does not fully clear is a firing criterion for this persona. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Set the stage | Confirms all six applications healthy and the investigator's queue complete in the other window | SCR-24 system health + *(second window)* SCR-13 | "Everything green, everything text-labelled. Baseline established." | Composed | **Today:** she has no baseline view at all; "healthy" is an informal belief per system | A single health surface that makes a baseline statable in one screenshot (F11) |
| 2. Break it deliberately | Forces Investigation Management into **unavailable** from the failure-injection controls | SCR-38 failure-injection controls (administrator-only) | "Down it goes. Now let's see whether we told anyone." | Deliberate, slightly theatrical | **Today:** degradation cannot be rehearsed, so resilience behavior is discovered in production with an audience | Controlled, reversible failure injection — resilience becomes testable rather than hypothetical (F16) |
| 3. Watch the monitor catch it | Watches health flip to unavailable within one check interval, with a transition time and text label | SCR-24 → IM row + check history | "Seven seconds. The monitor found it before any human could have." | Satisfied | **Today:** the first signal of a failing integration is an investigator calling to say his queue is empty | **Detection by monitoring rather than by user report** — the core of JTBD-04.2 |
| 4. Watch the log fill | Reads correctly attributed entries appearing in the integration-issue log with operation, error class, and correlation ID | SCR-25 integration issues | "Attributed to IM, named operation, real error class, and an ID I can follow." | Confident in the instrumentation | **Today:** failures leave traces in several places and nothing ties them together | A correctly attributed error-log entry **within one health-check interval** (PRD F11 acceptance signal) |
| 5. Watch the user experience it | Switches to the investigator window: four sources still rendering, a named and quantified warning, IM-targeted actions disabled with an explanation, **no error page anywhere** | *(second window)* SCR-13 → degraded banner | "He can still work. He knows exactly what he's missing. Nobody had to call me." | **This is the point** | **Today:** the user sees an empty list, assumes the whole system is broken, and stops working | Degradation that is named, quantified, and survivable (SM-15, SM-16) |
| 6. Put it back | Restores IM; watches health return to healthy, the warning clear, and the missing items reappear in the other window | SCR-38 restore → SCR-24 → *(second window)* SCR-13 | "Cleared on its own. He didn't reload, and he never signed in again." | Assured, finished | **Today:** recovery is confirmed by asking users whether it looks better now | **Automatic recovery** via half-open probing, with no user action at all (SM-17) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Set the stage | Health monitor reports current status, last successful check, latency, and recent history for every registered application, status conveyed by text and/or icon | F11, F16 |
| 2. Break it deliberately | Injection applied to the targeted spoke only; the control is administrator-only, server-authorized, and **the injection action is itself audited** | F16, F2, F13 |
| 3. Watch the monitor catch it | Background probe fails; after the configured threshold the **circuit opens** and the hub stops hammering the spoke; health state transitions with a recorded time | **F16**, F8 |
| 4. Watch the log fill | Adapter failures logged with timestamp, application, operation, error class, correlation ID, and affected principal, linked to the corresponding audit entries | F11, F13, F8 |
| 5. Watch the user experience it | Aggregate queue returns partial results with per-source status; the degraded banner names the application and quantifies the omission; actions targeting the unavailable spoke are pre-emptively disabled with a reason; the **global error boundary guarantees no blank page and no stack trace anywhere** | **F16**, F5, F6, F14 |
| 6. Put it back | Half-open probing succeeds, the circuit closes, health returns to healthy, and open sessions receive restored data through polling — **no reload, no re-authentication**; the warning clears through the same live region that raised it | **F16**, F1, F5 |

**Emotion curve (1 anxious → 5 confident):** Baseline **4** → Inject **4** *(in control — but this is the moment she finds out whether the claims are real)* → Monitor catches it **5** → Log fills **5** → User's screen **5** *(named, quantified, still working — the payoff)* → Restore **5**.

> **Note on this curve.** Priya's journey is the only one in this document that does not dip below 4. That is correct and deliberate: the anxiety of this scenario belongs to **Marcus and Dana**, in the other window, and the product's job is to keep their curves from collapsing. Priya's flat-confident curve *is* the outcome being demonstrated — an operator who is not surprised.

#### Key Moments

- **Demo Moment — Stage 5.** The window switch. An evaluator seeing "Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date." on a real user's screen, while the rest of that screen keeps working, is the entire resilience argument in one frame.
- **Decision Point — Stage 2.** Which spoke to break. IM is the designated outage spoke because its absence **visibly changes counts** for the investigator persona; injecting a spoke with no seeded work makes the demonstration abstract.
- **Delight Opportunity — Stage 6.** Automatic recovery with no user action. "He didn't reload, and he never signed in again" is the sentence to say out loud.
- **Risk — the whole journey.** Failure injection that leaves the platform in a state a restore does not fully clear. That is a firing criterion for this persona and a demo-day catastrophe: it would poison every segment that follows.
- **Risk — Stage 5.** A single error page, blank screen, or stack trace anywhere in the product during the injection fails the segment outright, regardless of how good the warning looks (SM-15, NFR-09).

#### Success Exit Criteria

- An induced adapter failure produces a **degraded/unavailable health state and a correctly attributed integration-error entry within one health-check interval** (PRD F11 acceptance signal).
- The forced outage produces a **visible, specific degraded warning across the product and no error page anywhere** (SM-15).
- Remaining sources render fully and **remain actionable** (SM-16).
- Restoring the spoke **clears the warning and restores data without user reload or re-authentication** (SM-17).
- The injection and restoration actions are **themselves audited** and attributable to Priya.
- The platform returns to a **clean baseline** — no stuck circuit, no stale flag — so the next demo segment runs on pristine behavior.

#### Failure and Alternate Paths

| Condition | What Priya sees | Recovery |
|-----------|-----------------|----------|
| She injects **slow** rather than **unavailable** | Adapters time out at their configured bounds; the page stays interactive with loading states and then degrades to the named warning; one slow spoke never stalls the aggregate request | Restore; timeout policy verified |
| She injects **erroring** responses | Health reports degraded rather than unavailable; the error log records the error class distinctly; the circuit opens on repeated failure | Restore; error classification verified |
| Two spokes injected at once | Both named in the warning, each with its own count; the composition does not collapse into a generic message | Restore both |
| Recovery does not clear the warning | **A defect, not an alternate path** — automatic recovery is SM-17 and a blocking issue for the demo | Fix before demo |
| A user is mid-form when injection or recovery lands | The live region announces; **focus is never moved**; entered data is untouched | Verified explicitly during rehearsal, because this is the most likely accessibility regression |
| Injection controls reachable by a non-administrator | **A defect.** The controls are administrator-only and server-authorized; a direct API attempt by any other role must be denied and audited | Covered by negative-path tests (F19) |

#### Accessibility Notes

- **Keyboard-only and screen-reader completable end to end**, including the injection controls, the confirmation, and the restore.
- Failure-injection controls are **state-changing and consequential**: they need clear labels, an accessible confirmation with correct focus trapping and restoration, and an announced result — not a bare toggle whose effect is only visible somewhere else on the page.
- **Health and injected state are never colour-only.** "Unavailable (injected)" needs a text label; an operator must be able to tell an induced state from a real one, non-visually, so a demo state is never mistaken for a genuine outage.
- The observed degraded warning in the user window must be verified **with a screen reader during rehearsal**: announced via live region, **without stealing focus**, and also present in the static page structure for anyone arriving after the announcement.
- Check-history and error-log tables follow the standard accessible data-table patterns with announced result counts as new entries arrive.
- Transition times, correlation IDs, and error classes are selectable, copyable text.

#### Success Outcome

Priya induces a controlled spoke failure and observes the specific degraded warning appear across the product with **no error page anywhere**, a correctly attributed error-log entry within one health-check interval, and — on restore — the warning clearing automatically **without any user reloading or re-authenticating**: the demonstrable half of JTBD-04.2 and JTBD-04.4, and the enabling condition for JTBD-01.4 and JTBD-02.4 (SM-15, SM-16, SM-17).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Set the stage | F11, F16, F8 |
| 2. Break it deliberately | **F16**, F2, F13 |
| 3. Watch the monitor catch it | **F16**, F11, F8 |
| 4. Watch the log fill | F11, F13, F9 |
| 5. Watch the user experience it | **F16**, F5, F6, F14 |
| 6. Put it back | **F16**, F1, F5, F11 |

---
