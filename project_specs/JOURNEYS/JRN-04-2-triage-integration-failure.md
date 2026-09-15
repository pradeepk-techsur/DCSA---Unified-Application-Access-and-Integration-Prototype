
### JRN-04.02: Triage a Reported Integration Failure — Health View → Error Log → Correlation ID → Audit Chain

**Persona:** PER-04 (Priya Raghunathan)
**Scenario:** 0916. An investigator messages: "my queue is missing things and an action wouldn't submit — here's the reference number off the error screen." Priya has minutes, not an afternoon, to establish which of four possibilities this is: a spoke outage, an adapter misconfiguration, an authorization denial, or user error. Today that means exporting logs from the hub and every candidate system and lining up timestamps by hand, with nothing tying the records to one another — because nothing ever issued a correlation ID. In the unified layer she starts at the health view, confirms the symptom in the integration-issue log, takes the correlation ID the user already gave her, and follows it into the audit chain where the whole cross-system action reads as one narrative. Then she decides whether to contain.
**Related Jobs:** JTBD-04.2 *(know before anyone complains)*, JTBD-04.3 *(classify in minutes from one place)*, JTBD-04.4 *(account for who did what, to what, when)*
**Entry Trigger:** A user report carrying a correlation ID — or, better, the start-of-day health check that catches the same failure before the report arrives.
**Demo Path:** Supporting — **Segment 6**, the accountability closer. Runs best immediately after Segment 2 (resilience), because the injected outage has already produced real error-log entries and a real degraded history to triage. Also the natural place to show the denials produced in JRN-03.02.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | Health history for each registered application with **at least one prior degraded episode**, so the health view shows a history rather than a single green row — a monitor with no past is not credible. |
| P2 | hub | Pre-seeded **integration error entries** across more than one application and more than one error class (timeout, connection refused, contract violation), so filtering is meaningful rather than decorative. |
| P3 | hub | ~120 pre-seeded audit events so the viewer, its filters, and its pagination are populated on first load. |
| P4 | hub | **At least one complete correlated chain** in the seed — a multi-spoke action under a single correlation ID — so the chain view is demonstrable even before the live demo produces one. |
| P5 | hub | Audit coverage for **authorization denials**, adapter failures, authentication events, and registration changes — not only successful mutations. |
| P6 | hub | The administrator's **own** prior console actions present in the trail, attributed to her — "administrators are not exempt" must be visible, not just stated. |
| P7 | hub | Correlation IDs surfaced in **user-facing error states**, so the premise of this journey (a user hands her an ID) is real. |
| P8 | hub | A disable/enable capability on a registered application, audited, with immediate effect on user-facing navigation and queue. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Start where the truth is | Opens the health view and reads status, last successful check, latency, and recent history for all applications | SCR-24 admin console — system health | "Is this one system or the whole platform?" | Alert, methodical | **Today:** health is checked per system, by different teams, with different definitions of "up," and the first signal is a phone call | One consolidated health surface, read from the registry, refreshed by a background monitor (F11, F16) |
| 2. Confirm the symptom | Sees the implicated application degraded with a recent transition time | SCR-24 → application row + check history | "Degraded at 09:07. His message was 09:14. That fits." | Focused, quietly relieved it is explainable | **Today:** she cannot tell whether the user's complaint and the system's state are the same event | Time-ordered health history makes symptom and cause line up without guessing |
| 3. Read the failures | Filters the integration-issue log by application and time window | SCR-25 admin console — integration issues | "Connection refused, twelve times, one operation. That's the spoke, not the adapter." | Confident in the classification | **Today:** diagnosis is manual log correlation across the hub and every candidate system, by hand, in a spreadsheet | Filterable error log with timestamp, application, operation, error class, correlation ID, and affected principal (F11) |
| 4. Take the thread | Pastes the correlation ID the user gave her and filters on it | SCR-25 filter → SCR-33 audit viewer | "One identifier. Let's see how far it actually goes." | Testing the claim | **Today:** there is no correlation ID because nothing ever issued one; the trace stops wherever she stops assembling it | Correlation IDs propagated end to end, browser → hub → spoke, into **both** audit and error logs (NFR-15) |
| 5. Read it as one story | Opens the chain view and reads every hub and adapter operation belonging to that one user action | SCR-34 audit record detail & chain view | "Read the case, read the issue, wrote PVQ, failed on eApp. That's the whole thing, in order." | **Satisfaction** — the answer is a record, not a reconstruction | **Today:** the result is an assertion she has to ask people to believe, heavily caveated | A cross-system action retrievable as a **single correlated chain** (SM-20) |
| 6. Classify and answer | Determines it is a spoke outage, not misconfiguration, not denial, not user error — and says so, with references | SCR-34 → copy correlation ID into the ticket | "Spoke outage. Twelve items withheld. He wasn't doing anything wrong." | Decisive | **Today:** she guesses the failure class from the symptom and escalates to whichever team seems most likely | Four candidate causes distinguished from **one place**, in minutes |
| 7. Contain if needed | Disables the implicated application from the console, with an accessible confirmation | SCR-23 application detail → disable (confirmed) | "Take it out of their queue until it's stable. Better a named absence than intermittent failure." | In control | **Today:** containment requires someone else's deployment, so the failing integration stays in users' faces | Enable/disable at runtime, **audited**, and immediately reflected in user navigation and queue (F11, F8) |
| 8. Close the loop | Confirms her own console action appears in the audit trail attributed to her; posts an announcement targeted at the affected roles | SCR-33 audit viewer (filtered to her) → SCR-29 announcements | "My own action is in there under my name. As it should be." | Accountable, done | **Today:** auditability is per-system, administrative actions least of all, and she communicates by emailing everyone | **Administrators are not exempt**; targeted announcements replace the email blast (F11, F13, F15) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Start where the truth is | Background health monitor's recorded status, latency, and check history per registered application, with status conveyed by **text and/or icon, never a dot alone** | F11, F16, F14 |
| 2. Confirm the symptom | Check history with transition times; circuit-breaker state visible in its effects — the hub stopped hammering the failing spoke | F16, F8 |
| 3. Read the failures | Chronological, filterable adapter-failure log with timestamp, application, operation, error class, correlation ID, and affected principal, **linked to the corresponding audit entries** | **F11**, F13 |
| 4. Take the thread | The same correlation ID resolves in both the error log and the audit trail; it is present as **selectable, copyable text**, never a truncated cell | F13, F10, NFR-15 |
| 5. Read it as one story | Chain view returns every record sharing the correlation ID: hub operations and adapter calls, in sequence, with actor, roles/attributes at the time, target system and resource, and outcome | **F13** |
| 6. Classify and answer | Denials, adapter failures, authentication events, and successful mutations are all in the same trail, so the four candidate causes are distinguishable without leaving the console | F13, F11, F2 |
| 7. Contain if needed | Disable writes an audit record and takes effect immediately in entitlements, navigation, and queue fan-out — no restart; users see a named absence rather than intermittent failure | F11, F8, F13 |
| 8. Close the loop | Her console actions are authorized server-side and audited under her identity; announcements are authored with severity, target roles, and effective/expiry dates, rendered on the right dashboards and dismissible per user, **never obscuring the demo banner** | F11, F13, F15 |

**Emotion curve (1 anxious → 5 confident):** Report arrives **2** *(unknown scope, a user waiting, the clock running)* → Health view **3** → Symptom confirmed **4** → Error log **4** → Correlation ID **4** → **Chain view 5** *(the whole action in one place — the moment the afternoon becomes four minutes)* → Classify **5** → Contain **5** → Close the loop **5**.

#### Key Moments

- **Decision Point — Stage 7.** Contain or wait. Disabling an application is user-visible and audited; she needs to make it quickly, from evidence, and be able to justify it later.
- **Delight Opportunity — Stage 5.** One identifier resolving the entire cross-system chain. This is the difference between an answer that is a record and an answer that is an assertion she asks people to believe.
- **Demo Moment — Stage 8.** Her own console action, in the audit trail, under her name — paired with the fact that she **cannot** read the mission content of the work item she just triaged. "Administrators are not exempt" and "platform privilege is not content privilege" are demonstrable claims, not policy statements.
- **Risk of Abandonment — Stage 4.** A trace that stops at the hub boundary and never reaches the adapter call. If the chain is partial, she goes back to manual log merging and the console becomes a dashboard she does not open.
- **Credibility Risk — Stage 1.** A health view that reports "up" while users are experiencing failures. A dashboard that lies is worse than no dashboard, and this persona will catch it.

#### Success Exit Criteria

- Given a correlation ID taken from a user-facing error state, she retrieves **the complete chain of hub and adapter operations for that action in a single filtered query** (SM-20).
- An induced adapter failure produces a **correctly attributed entry in the integration error log and a degraded/unavailable health state within one health-check interval** (PRD F11 acceptance signal).
- Disabling the implicated application is reflected in user navigation and queue **immediately** and is **itself audited**.
- Her own console actions appear in the audit trail **attributed to her**.
- An attempt by her to read mission work-item content, or to mutate an audit record through any application path, is **denied and itself audited** — and **no application path to modify or delete an audit record exists for anyone**, verified by test (NFR-07).
- Total time from report to classification: **minutes**, from one console.

#### Failure and Alternate Paths

| Condition | What Priya sees | Recovery |
|-----------|-----------------|----------|
| The user has no correlation ID | She filters the audit trail by actor, action type, target system, and time window instead — every user-facing error state carries an ID, so this should be rare | Same chain reached by a longer route |
| The failure was an **authorization denial**, not an outage | The trail shows outcome `DENIED` with the principal, the target resource, and the attributes held at the time — user error or a policy question, not an incident | Answer the user; no containment needed |
| The failure was a **contract violation** by the spoke | Error class in the log distinguishes it from a timeout or refusal; the adapter conformance suite is the follow-up | Escalate to the application's team with evidence, not a symptom |
| Health says healthy but users report failures | Manual **"test connection"** from the application detail view performs a live check on demand, settling the disagreement immediately | If the live test fails, the monitor's interval or thresholds are the defect |
| She disables an application by mistake | Re-enable is equally immediate and equally audited; probing restarts at once rather than waiting for the next interval | Both actions are on the record, which is the point |
| Audit query returns a chain with a gap | **A defect, not an alternate path** — a write that produced no audit record, or a denial never recorded, is a P0 bug (NFR-06) | Fix before demo; the segment's whole claim depends on completeness |

#### Accessibility Notes

- **Keyboard-only and screen-reader completable end to end** — health view, error log, audit viewer, chain view, disable confirmation, and announcement authoring.
- **The audit viewer is the densest table in the product and the one an evaluator is most likely to inspect.** It needs header scope, a caption, sort-state announcement, accessible pagination, and announced result counts — the same patterns as the work queue, not a lesser console variant.
- **Correlation IDs must be selectable, copyable text with an accessible full value** — never images, never truncated cells without the full string available. She pastes them into tickets constantly.
- Health status conveyed by **text label and/or icon**, never colour alone. A red/green dot is a conformance failure and an operational hazard (NFR-02).
- **Destructive actions** (disable, de-register) use confirmation dialogs that **trap focus correctly and restore it on close**.
- Filter controls on the error log and audit viewer are keyboard-operable with programmatically associated labels and announced result counts on change.
- Announcement authoring is an ordinary accessible form: labelled fields, inline errors, error summary with focus management.

#### Success Outcome

Priya retrieves the complete hub-and-adapter chain for a reported action from a single correlation ID in one filtered query, classifies the failure from one console in minutes, and contains it with an audited action reflected immediately in user navigation — while her own actions remain attributable to her and mission content remains outside her reach (JTBD-04.2, JTBD-04.3, JTBD-04.4; SM-20, PRD F11 acceptance signal).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Start where the truth is | **F11**, F16, F8 |
| 2. Confirm the symptom | F11, **F16** |
| 3. Read the failures | **F11**, F13, F9 |
| 4. Take the thread | F13, F10, F11 |
| 5. Read it as one story | **F13**, F10 |
| 6. Classify and answer | F13, F11, F2 |
| 7. Contain if needed | F11, F8, F13 |
| 8. Close the loop | F11, F13, F15 |

---
