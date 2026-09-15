### Release R3 — Extensibility and Operability

> **Theme:** The two architectural claims a reviewer will actually test — *can you onboard the next application as configuration?* and *can you operate this thing when a spoke misbehaves?* — proved by doing them live rather than describing them.

R1 and R2 deliver a product. R3 delivers the **argument for the platform**: that integration stops being an engineering project, and that degradation is designed for rather than merely handled. Both claims are proved by PER-04 in front of the evaluator, in two windows, with PER-01's session open in the other one.

**Stories (50):**

| Backbone step | Stories |
|---|---|
| Orient | US-036, US-037, US-038, US-124 |
| Find work | US-048, US-079 |
| Work an item | US-058, US-126 |
| Verify & Audit | US-032, US-084, US-085, US-108, US-118, US-147, US-148, US-149, US-150, US-151 |
| Administer & Extend | US-025, US-071, US-072, US-073, US-074, US-075, **US-086…US-093**, **US-094…US-100**, US-125, US-127, US-128, US-129, US-131, US-132, US-139, US-141, US-142, US-143, US-144 |

**Personas served — who can do meaningful work at the end of R3:**

| Persona | Can do meaningful work? | What they can actually do |
|---|---|---|
| **PER-01 Marcus Vale** | ✅ Fully *(plus)* | Keeps working through a deliberately induced outage with a named, quantified warning, is stopped before starting an action that cannot succeed, watches recovery happen without reloading, and sees a sixth application's items arrive in a session he never ended. |
| **PER-02 Dana Okonkwo** | ✅ Fully *(plus)* | Can finally tell a genuine empty issue list from an unreachable PVQ — the distinction her whole risk profile depends on. |
| **PER-03 Renée Ashford** | ✅ Fully *(plus)* | Gets designed empty states and a published accessibility statement. |
| **PER-04 Priya Raghunathan** | ✅ **Fully — finally the operator she is defined as** | Inventory, per-application health with latency and history, integration error log, correlation-ID tracing into the audit chain, live connection test, announcements, enable/disable, failure injection, and the guided five-step registration of the sixth application — live, in under five minutes, with zero code changes and zero restarts. |

**Journeys demonstrable at the end of R3 — all ten:**

| Journey | Status | Closed by |
|---|---|---|
| JRN-01.01 *(flagship)* | ✅ Complete since R1 | — |
| **JRN-01.02** Monday-morning triage | ✅ **Now complete, all 7 stages** | US-098 closes stage 7 — CVS appearing in an open session |
| **JRN-01.03** Keep working while IM is down | ✅ **Complete, all 7 stages** | US-048, US-126, US-127, US-128, US-132 |
| JRN-02.01 Assemble and determine | ✅ Complete since R2 | — |
| **JRN-02.02** Aging queue and missing data | ✅ **Now complete, all 7 stages** | US-129 closes stages 5–6 — empty vs. degraded |
| JRN-03.01 / JRN-03.02 | ✅ Complete since R2 | — |
| **JRN-04.01** Register the sixth application | ✅ **Complete, all 9 stages** | US-094…100 |
| **JRN-04.02** Triage an integration failure | ✅ **Complete, all 8 stages** | US-086…093 |
| **JRN-04.03** Rehearse degradation on purpose | ✅ **Complete, all 6 stages** | US-131, US-143, US-125, US-132 |

**Slicing justification:**

- **Extensibility and operability ship together, not separately.** They look like two themes but they are one dependency graph: the registration wizard (F12) writes a registry row that the health monitor (F16) must immediately begin probing and the inventory (F11) must immediately display. Splitting them would produce a release where a newly registered application is invisible to monitoring, which is worse than not shipping either.
- **US-036 (administrator dashboard) lands here, not in R2 with the other dashboards.** It is the only one of the four whose widgets have nothing to show until the console, health monitor, and error log exist. Shipping it earlier would mean shipping placeholder widgets, which the PRD's "every button works" principle forbids outright.
- **All of Epic 16 lands here** because degraded-system behaviour is only *demonstrable* once the failure-injection control exists to cause it on demand (US-131, US-143). Resilience you cannot induce is resilience you cannot show, and the Innovation Call names it as an explicit evaluation concern.
- **The full verification suite (US-147…151) lands last by necessity, not by preference.** A conformance suite for adapters (US-147) needs the sixth adapter to prove itself against; a route-and-role accessibility crawl (US-149) needs every route and every role to exist; a "every button works" crawl (US-150) needs the last button. Each earlier release carries its own partial gate so quality is not deferred wholesale — only the *complete* sweep waits.
- **The remaining demo-operability stories (US-139, US-141…144)** land here as instructed. US-141 (scripts for the other four claims) and US-143 (take a system down and put it back) cannot precede the capabilities they script. US-142 (pre-flight check) and US-144 (contingency for the three likeliest demo-day failures) are rehearsal infrastructure for the full six-segment demonstration path, which only exists once every segment does.
- **Nothing in R3 is optional.** Every story here is P1 in the PRD, and P1 means *"the demonstration survives without it, but the prototype reads as unfinished to an evaluator."* If time compresses, R3 yields to R1 — never the reverse.

**Internal ordering gate (schedule-risk control).** R3 is the largest release — 50 stories, 5 of the 10 journeys, and **both** of PER-04's architectural claims. The dependency argument above is why it is not split into two releases; this gate is how the risk is managed inside it. R3 is built in two ordered halves with a checkpoint between them:

| Half | Scope | Closes | Checkpoint |
|---|---|---|---|
| **R3a — operability first** | US-086…US-093 (console, inventory, health, error log, correlation tracing, announcements, admin self-audit), US-125, US-127…US-132, US-131/US-143 (failure injection), US-036…US-038, US-048, US-058, US-079, US-124, US-126 | **Demo Segment 2 (resilience)** and **Segment 6 (accountability)**; journeys JRN-01.03, JRN-02.02, JRN-04.02, JRN-04.03 | Induce an outage, observe the named and quantified warning with no error page anywhere, restore, observe automatic recovery; follow one correlation ID from the error log into the audit chain |
| **R3b — extensibility second** | US-094…US-100 (registration wizard, live connection test, capability discovery, the CVS sixth service), US-071…US-075, US-025, US-139, US-141, US-142, US-144, US-147…US-151 | **Demo Segment 3 (extensibility)**; journeys JRN-04.01, JRN-01.02 stage 7; the full verification sweep | Register CVS live in under five minutes, zero code changes, zero restarts, and an already-signed-in investigator sees its items without signing out |

**Why this order.** If R3 is truncated, the platform is at least **operable** and the resilience and accountability segments are demonstrable — and a newly registered application is never invisible to monitoring, because monitoring shipped first. The reverse order would leave a registration wizard writing registry rows that nothing probes and nothing displays, which is the failure mode the no-split argument exists to prevent. Ordering is a sequencing constraint within one release, not two release gates: **R3 is not complete until R3b's checkpoint passes**, because extensibility is the claim a reviewer is most likely to test.

**Acceptance Gate:**

- [ ] All NaC for the included stories pass.
- [ ] The administrator registers the **sixth application live through the UI in under five minutes**, with zero code changes and zero restarts, and it appears at once in inventory, health, navigation, and the queue (SM-11).
- [ ] An investigator already signed in in another window sees the new application's items **without signing out or reloading**, within thirty seconds (SM-12).
- [ ] Removing an application from the registry removes it cleanly from navigation, queue, and console with no code change and no errors (F8 acceptance signal).
- [ ] With a spoke forced offline, the queue renders the remaining sources plus a **specific named and quantified warning**, and **no error page appears anywhere in the application** (SM-15, SM-16).
- [ ] Restoring the spoke clears the warning and restores data **without user reload or re-authentication** (SM-17).
- [ ] An induced adapter failure produces a correctly attributed integration-error-log entry within one health-check interval (F11 acceptance signal).
- [ ] The administrator's own console actions appear in the audit trail attributed to her; an administrator attempting to read mission work-item content is denied and the attempt is audited (SM-18).
- [ ] No application path exists to modify or delete an audit record — **verified by test, not asserted** (NFR-07).
- [ ] Automated crawl of every navigation item **for every role** returns a real, populated page: zero 404s, zero placeholder screens, zero non-functional controls (SM-05, SM-06).
- [ ] Automated accessibility scan across **every route for every role** reports zero serious or critical violations, with a dated manual keyboard and screen-reader pass recorded alongside (SM-07, SM-09).
- [ ] All six demonstration segments run from their scripts, and the full path is rehearsed three times identically with a reset between runs (SM-21, SM-22).
- [ ] JRN-01.01 still completes in under three minutes and still writes exactly one authentication event — **regression gate**.

---
