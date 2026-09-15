
### JRN-02.02: Manage the Clock — and Refuse to Decide on Data That Is Quietly Missing

**Persona:** PER-02 (Dana Okonkwo)
**Scenario:** Last week of the month. Dana's timeliness metrics are about to be reported, and she needs to know which of her pending determinations are aging, which are blocked waiting on someone else, and which she can actually close today. Partway through the sweep she opens a subject whose issue list is empty — and this is the moment the product either earns her permanently or loses her permanently. An empty list that is actually an outage would be a career-relevant error, made invisibly. This journey covers both halves of her clock problem: surfacing aging and blocked work without building a report, and being able to tell a genuine absence from an unreachable source.
**Related Jobs:** JTBD-02.3 *(aging and blocked)*, JTBD-02.4 *(never decide on missing data)*
**Entry Trigger:** End-of-month timeliness push; and, within it, opening any subject whose issue list renders empty.
**Demo Path:** Supporting — **Segment 2c.** Run immediately after JRN-01.03 while PVQ (or IM) is still injected as unavailable: the same outage that degrades the investigator's queue produces a *different and equally specific* consequence for the adjudicator. One induced failure, two persona-appropriate responses.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | Pending determinations for PER-02 spanning a **range of ages**, including at least two past their timeliness threshold and two approaching it, so "aging" is visible without contrivance. |
| P2 | hub | At least one determination in a **blocked-pending-investigator-response** state, created by a seeded clarification request, so "waiting on someone else" is distinguishable from "waiting on me". |
| P3 | pvq | **A subject with a genuinely empty issue set.** This is the control case: the designed empty state must be demonstrably different from the degraded state, and that comparison is impossible without a true empty. |
| P4 | hub | Alert rules for overdue, approaching-due, and blocked/stalled computed server-side, each resolving to a **real, populated destination** — an alert that links to an empty page is worse than no alert. |
| P5 | hub | Failure-injection control able to force **PVQ** specifically (not only IM) into unavailable, so the adjudicator-facing consequence is demonstrable. |
| P6 | im / eapp / pdt | Remaining sources populated for her scope so the queue stays useful during the injected PVQ outage. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Ask the clock question | Opens her dashboard and reads the aging and blocked widgets | SCR-10 adjudicator dashboard → alerts panel | "What's aging, and what's not actually mine to move?" | Businesslike, slightly braced | **Today:** aging is invisible until it is a metric someone else reports; she learns a case is late from a report | Aging and blocked computed server-side and surfaced continuously, not retrospectively (F4, F15) |
| 2. Separate mine from theirs | Filters the queue to "blocked" and reads what each is waiting on | SCR-13 queue → status filter + blocked reason | "Three are waiting on investigators. Those aren't my delay." | Relieved of some guilt | **Today:** she tracks "waiting on investigator" in memory or a side list, because nothing models the wait | Blocked state modelled and attributed, so the clock is managed by evidence (F6, F15) |
| 3. Sort by age | Sorts by age across sources and confirms the ordering is explainable | SCR-13 → sortable headers announcing sort state | "The dates mean the same thing across all of these — I can defend this order." | In control | **Today:** date semantics differ silently between systems, so a sorted list can be wrong in a way she cannot see | Consistent, normalized date semantics regardless of which spoke supplied the row (F5) |
| 4. Open the next determination | Opens the oldest and begins the read | SCR-15 eApp case view | "Let's close this one before the month ends." | Focused | **Today:** the read begins with four logins and an assembly job | One reading path (see JRN-02.01) |
| 5. **Hit the empty issue list** | Reaches the issues section and finds nothing listed | SCR-15 → related issues panel | "No issues at all? On a Tier 3? That's either very clean or very wrong." | Suspicion — the pivotal moment | **Today:** an empty PVQ list looks identical whether the subject has no issues or the service is down, and the cost of guessing wrong is asymmetric and invisible | The screen must answer the question she is already asking, before she asks it |
| 6. Read which one it is | Reads either a **designed empty state** ("No issues have been raised against this subject.") or a **named degraded warning** ("Issue data from PVQ is unavailable — issues for this subject are not shown.") | SCR-15 → empty state **or** degraded banner (visibly and semantically different) | "It's the system, not the subject. I'm not deciding this today." | Vindicated, then decisive | **Today:** there is no signal either way, so she either delays everything or accepts the risk silently | Absence and outage are two different screens with two different sentences (F16, NFR-10) |
| 7. Act on the distinction | Defers the determination with a reason, or — on a genuine empty — proceeds and decides | SCR-14 action set (determination actions disabled while the source is unavailable, with explanation) | "Deferring with a recorded reason is defensible. Deciding blind is not." | Professionally safe | **Today:** she delays cases she is unsure about, adding to the aging problem she is separately measured on | Actions that depend on an unavailable source are disabled with an explanation rather than permitted to fail (F16) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Ask the clock question | Alert rules for overdue, approaching-due, and blocked/stalled evaluated server-side over aggregated spoke data; each alert deep-links to the item that produced it; alert counts reconcile with the queue | F4, F15, F5 |
| 2. Separate mine from theirs | Blocked state and its reason carried on the normalized work item; clarification requests tracked until the investigator responds | F6, F15, F8 |
| 3. Sort by age | Date fields normalized at the adapter boundary so cross-source sorting is semantically valid; sort state announced | F5, F8, F14 |
| 4. Open the next determination | Resource-level authorization; full detail assembled across adapters with source attribution | F2, F6 |
| 5. Hit the empty issue list | Per-source status accompanies every aggregated panel — the UI always knows whether a source answered, failed, or answered with nothing | F16, F6, F8 |
| 6. Read which one it is | Two distinct, designed states with different copy and different structure: empty vs. degraded. Degraded names the application and what is missing; announced via live region **without stealing focus** | **F16**, F14, NFR-10 |
| 7. Act on the distinction | Determination actions that depend on the unavailable source are pre-emptively disabled with a reason; the deferral is a real audited action with its own record | F16, F6, F2, F13 |

**Emotion curve (1 anxious → 5 confident):** Dashboard **3** → Separate blocked **4** → Sort by age **4** → Open determination **4** → **Empty issue list 1** *(the sharpest trust dip in the entire document — she is one screen away from a career-relevant error)* → Read which one it is **4** → Act **5**.

#### Key Moments

- **Decision Point — Stage 6/7.** Decide or defer. The entire value of the degraded-state design is compressed into whether this one screen tells her which world she is in.
- **Trust-destroying Risk — Stage 5.** One instance of an empty list that turns out to have been an outage and the trust loss is **permanent and total** for this persona. She will re-check every source by hand forever, and the product's aggregation value goes to zero.
- **Risk of Abandonment — Stage 1.** An aging view she has to build herself is the workaround she already has; she will keep the spreadsheet and stop opening the dashboard.
- **Delight Opportunity — Stage 2.** Being able to say "three of my late cases are waiting on investigators, and here is the evidence" turns a monthly defensive conversation into a two-minute factual one.

#### Success Exit Criteria

- Her dashboard and queue answer **"what is aging and what is blocked"** without her constructing a report, and **every alert resolves to a real, populated destination** (SM-06, SM-24).
- With PVQ forced offline, the subject record shows a **specific named warning that issue data is unavailable — and never an empty issue list** (SM-15, NFR-10).
- The designed empty state and the degraded state are distinguishable **both visually and non-visually**, by wording and structure rather than by colour or icon alone.
- Actions depending on an unavailable source are disabled with an explanation before submission.
- A generic "something went wrong" appears nowhere: every incomplete view names the system and the gap.

#### Failure and Alternate Paths

| Condition | What Dana sees | Recovery |
|-----------|----------------|----------|
| PVQ recovers while she is still on the page | The warning clears through the same live region and the issue list populates — **no reload, no re-authentication**; focus is not moved | She continues the read with a complete record |
| Alert count disagrees with the queue | *Must not occur.* Counts are computed from the same server-side evaluation as the queue rows; a mismatch is a defect, not a display quirk | Treated as a P0 bug — reconciling counts is a hiring criterion for this persona |
| Blocked item's investigator has responded | The blocked state clears and the item returns to "waiting on me" with the response visible in activity history | She resumes the determination |
| She defers a determination | Recorded as an audited action with a reason; the item remains in her queue flagged as deferred-pending-source | Revisit when health is restored |
| Both PVQ and IM unavailable | Both named, each with its own missing-data statement; she is never left inferring which part of the record is incomplete | Defer; no partial-picture determination is offered |

#### Accessibility Notes

- **Keyboard-only and screen-reader completable end to end**, including the sort, the status filter, and the deferral action.
- **The empty-vs-degraded distinction must be legible non-visually.** Different sentences and different structure — not the same container with a different icon colour. A screen-reader user must reach the same conclusion Dana does, in the same second.
- Degraded warnings arrive via `aria-live="polite"` and **must not steal focus** mid-read; they also persist in the static page structure so a user who arrives later encounters them by heading or landmark navigation.
- Aging and blocked status conveyed by text and/or icon, never colour alone — "overdue," "blocked," "approaching due" must be distinguishable in grayscale (NFR-02).
- Queue sort and filter changes announce sort state and result count.
- Disabled determination actions remain discoverable with their explanation programmatically associated, so a keyboard user learns *why* rather than encountering an inert control.
- Usable at 200% zoom without loss of function (NFR-16).

#### Success Outcome

Dana's dashboard and queue answer "what is aging and what is blocked" without her building a report, every alert resolves to a real destination (JTBD-02.3, SM-06, SM-24) — and with PVQ forced offline she sees a specific named warning that issue data is unavailable rather than an empty list she could misread as "no issues exist" (JTBD-02.4, SM-15, NFR-10).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Ask the clock question | F4, F15, F5 |
| 2. Separate mine from theirs | F6, F15, F5 |
| 3. Sort by age | F5, F8, F14 |
| 4. Open the next determination | F6, F2, F9 |
| 5. Hit the empty issue list | **F16**, F6, F8 |
| 6. Read which one it is | **F16**, F14, F9 |
| 7. Act on the distinction | F16, F6, F2, F13 |

---
