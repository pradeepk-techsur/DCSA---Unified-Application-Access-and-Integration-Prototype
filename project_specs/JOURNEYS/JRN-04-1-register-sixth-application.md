
## PER-04: Priya Raghunathan

*Platform administrator for the unified layer itself, in the Integrated Enterprise program office. Not a mission user — she is responsible for the thing all three other personas depend on. Expert: reads OpenAPI docs, calls endpoints with curl, and tries to break the authorization model on purpose. She is the reviewer archetype an evaluator will emulate. **Administrators are not exempt** — her own actions are authorized server-side and audited, and platform privilege is explicitly not privilege over mission content.*

---

### JRN-04.01: Register the Sixth Application Live, Through the UI

**Persona:** PER-04 (Priya Raghunathan)
**Scenario:** A sixth application — the Continuous Vetting Service — is running, conformant, and completely invisible to the platform: no registry row, nothing in navigation, nothing in any queue, nothing in the console. Priya onboards it herself, in the UI, in one sitting, while an investigator stays signed in at the next desk. Identity, connection, a live connection test, capabilities auto-discovered from the application's own `describe()`, role access, review, submit. No pull request, no deployment, no restart. Ninety seconds later CVS is in the inventory, being health-probed, in role navigation, and its work items are in Marcus's queue — and he never signed out. This is the product's **extensibility proof**, and it is the claim that determines whether the platform's premise holds beyond the five systems it launched with.
**Related Jobs:** JTBD-04.1 *(primary)*, JTBD-04.2 *(it starts reporting health)*, JTBD-04.4 *(the registration is audited)*
**Entry Trigger:** A new mission application becomes available to join the platform — in the demo, the moment an evaluator asks "what does it take to add another one?"
**Demo Path:** ✅ **SECONDARY SCRIPTED DEMO — Segment 3a.** Run **two windows side by side**: Priya registering in one, Marcus's already-signed-in queue in the other (JRN-01.02, Stage 7). The consequence in the second window is the proof; the wizard alone is just a form.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | An ADMINISTRATOR identity bound to PER-04, `org=DCSA-HQ`, with console, registry, audit, and failure-injection entitlements — and **no** access to mission work-item content. |
| P2 | hub | Exactly **five** registered applications at baseline (eApp, IEP, PVQ, PDT, IM). **CVS is deliberately absent from the registry.** Its absence from navigation, queue, and console before registration is itself part of the demonstration. |
| P3 | cvs | The Continuous Vetting Service **running** as a sixth spoke process with its own data namespace, implementing the full adapter contract and passing the conformance suite — including a working `describe()` and health endpoint. |
| P4 | cvs | Nine seeded `CVS_ALERT` work items, **four assignable to the investigator persona**, so registration produces an immediately visible change in his queue. The demo needs a visible consequence, not just a new console row. |
| P5 | hub | A retired-identifier table and duplicate-identifier validation, so the "identifier already in use" error path is demonstrable without breaking the happy path. |
| P6 | hub | Reset (`FR-F17-11`) returns CVS to **unregistered**, so the registration demo is repeatable identically (SM-22). |
| P7 | hub | An investigator session already open at the start of the segment, so "without signing out" is observed rather than claimed. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Show the "before" | Opens the connected-applications inventory: five rows, no CVS anywhere | SCR-22 admin console — connected applications | "Five. Nothing up my sleeve." | Matter-of-fact | **Today:** there is no inventory at all; what is connected lives in an informal list that drifts from reality | A registry-backed inventory that is the single answer to "what is attached right now" (F11, F8) |
| 2. Start the flow | Activates "Register application" and enters identity: display name, identifier, description, icon token | SCR-28 registration wizard, step 1 of 5 | "This is a form, not a ticket to an engineering team." | Purposeful | **Today:** onboarding is a bespoke project — requirements, custom code, a release, a regression cycle; weeks to months per application | Onboarding as a **configuration action she performs herself** (F12) |
| 3. Describe the connection | Enters base endpoint, health endpoint, adapter type; accepts pre-filled timeout, retry, backoff, and circuit-breaker defaults | SCR-28 step 2 — connection | "Sensible defaults. I don't have to invent a retry policy to get started." | Comfortable | **Today:** every integration re-invents timeout and failure policy, differently, in code | Per-adapter resilience policy as registry configuration, not code (F8) |
| 4. Test it before committing | Runs the **live connection test**; reads pass/fail with latency, announced in a live region | SCR-28 step 3 — test connection | "It answered. I'm not submitting into the dark." | Increasingly confident | **Today:** she cannot try an integration before committing to it; an unreachable endpoint is discovered *after* the work is done | A live test that **gates submission** — unreachable endpoints are caught here, not later (F12) |
| 5. Let it describe itself | Reviews work-item types and supported actions **pre-populated from the application's own `describe()`**, confirms and edits | SCR-28 step 4 — capabilities (auto-discovered) | "It told the platform what it can do. I just confirmed it." | Impressed — the architectural point lands here | **Today:** capabilities are discovered by reading someone else's documentation, or by asking their team | Capability negotiation via `describe()`: applications declare themselves (F8, F12) |
| 6. Decide who sees it | Selects which roles may see CVS; nothing pre-selected | SCR-28 step 5 — access | "Investigators and adjudicators. Not applicants." | Deliberate | **Today:** role visibility for a new system is configured separately in that system, on its own terms | Role-scoped visibility set once, at the hub, and honored everywhere (F2, F8) |
| 7. Review and submit | Reads the full read-only review with per-step edit links, submits | SCR-28 review → confirmation | "Two minutes. No deployment." | Satisfied | **Today:** the equivalent milestone is a release note, weeks later | Registry row created; `registryVersion` incremented; the change is audited naming her and the configuration (F12, F13) |
| 8. Watch it come alive | Sees CVS in the inventory and in health monitoring, with a **first probe issued immediately** rather than at the next interval | SCR-22 inventory → SCR-24 system health | "It's already being monitored. Nobody restarted anything." | **Delight** | **Today:** monitoring for a new system is a separate onboarding with a separate team and its own definition of "up" | Registry-driven behavior everywhere: navigation, fan-out, console, and health all read from the same source (F8, F11, F16) |
| 9. Prove the consequence | Looks at the investigator's window: CVS-badged items in his queue, on a session that never ended | *(second window)* SCR-13 unified work queue | "That's the whole claim, right there." | Vindicated | **Today:** a new application means a new URL, a new login, and a user who has to be told it exists | An open session receives updated navigation and fan-out on the next registry poll — **zero code changes, zero restarts** (SM-11, SM-12) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Show the "before" | Inventory rendered from the registry: display name, identifier, adapter type, endpoint, work-item types, supported actions, enabled state, registration date. There is **no hard-coded list of applications anywhere in the hub** | F11, F8 |
| 2. Start the flow | Multi-step form with per-step validation and state preserved across steps; duplicate and retired identifiers rejected with clear guidance | F12, F14 |
| 3. Describe the connection | Timeout, retry, backoff, and circuit-breaker fields pre-filled with defaults and stored as registry configuration for this adapter | F12, F8, F16 |
| 4. Test it before committing | Hub calls the candidate's health and `describe()` endpoints live; result displayed **and announced via a live region**; the step cannot be passed on failure without an explicit acknowledgement of a warning-level result | **F12**, F14, F16 |
| 5. Let it describe itself | `describe()` output parsed into work-item types and supported actions, pre-populated for confirmation; an application supporting fewer actions degrades its UI affordances rather than erroring | **F8**, F12 |
| 6. Decide who sees it | `visibleToRoles` written to the registry and enforced server-side in entitlements, navigation, and queue fan-out | F2, F8 |
| 7. Review and submit | Registry row created, `registryVersion` incremented, **`APPLICATION_REGISTERED` audit record written** naming the administrator, the application ID, and a configuration summary | F12, F13 |
| 8. Watch it come alive | Appears at once in inventory, health monitoring (first probe issued immediately), role-scoped navigation, work-queue fan-out, search fan-out, and related-item resolution targets — **with no hub restart** | F11, F16, F8, F5 |
| 9. Prove the consequence | Open investigator sessions receive updated navigation on their next `registryVersion` poll (≤ 30 s) without signing out or reloading; CVS items are normalized and badged like any other source, with **no special-casing anywhere in the hub** | F5, F8, F1, F12 |

**Emotion curve (1 anxious → 5 confident):** Show the before **4** *(she is in control; this is her console)* → Step 1 **4** → Connection **3** *(endpoints and policy are where mistakes happen)* → **Live test 5** *(it answered — the relief moment)* → Auto-discovery **5** → Access **4** → Submit **4** *(brief: did it take?)* → Inventory and health **5** → Investigator's queue **5** *(peak)*.

#### Key Moments

- **Decision Point — Stage 4.** The live connection test is the gate. Passing it converts "I hope this endpoint is right" into "the platform just talked to it," and it is the step that makes submitting feel safe.
- **Delight Opportunity — Stage 5.** Capability auto-discovery. The application declaring its own work-item types and actions is the moment the architectural claim becomes concrete for a technical evaluator.
- **Demo Moment — Stage 9.** Work items appearing in an already-signed-in investigator's queue. Do not narrate this; switch windows and let it be seen. **Under five minutes, zero code changes, zero restarts** (SM-11, SM-12).
- **Risk of Abandonment — any stage.** Any step that requires a developer, a pull request, a redeploy, or a restart. That is precisely the status quo she is trying to escape, and one such step invalidates the whole journey.
- **Credibility Risk — the whole journey.** A registration flow that works only for the one application shipped with the demo is hard-coded extensibility. The conformance suite and the absence of CVS-specific code in the hub are what make this honest.

#### Success Exit Criteria

- CVS is registered **live through the UI in under five minutes, with zero code changes and zero restarts** (SM-11, NFR-11).
- It appears **immediately** in admin inventory, health monitoring, role-scoped navigation, and the unified work queue (SM-12).
- An investigator with an **open session** sees CVS work items **without signing out or reloading** (SM-12).
- The registration writes **one audit record** naming the administrator, the application, and the configuration.
- **De-registration is equally clean:** removing CVS from the registry removes it from navigation, queue, and console with no code change and no errors, and is audited (PRD F8 acceptance signal).
- Reset returns the system to the unregistered state and the demo repeats identically (SM-22).

#### Failure and Alternate Paths

| Condition | What Priya sees | Recovery |
|-----------|-----------------|----------|
| Endpoint unreachable at the test step | A named failure with latency and error class, and the step **does not pass** — submission is blocked | Correct the endpoint and re-test; nothing was written |
| `describe()` unsupported or partial | Capabilities step falls back to manual entry; the application registers with fewer declared actions and its UI affordances degrade accordingly rather than erroring | Register with what is declared; refresh capabilities later via "Test connection" |
| Duplicate or retired identifier | Validation error with clear guidance; identifiers are never reused because existing work-item IDs and audit records reference them | Choose a new identifier |
| Step validation failure | Error summary with in-page links; **state preserved across steps**, so nothing already entered is lost | Fix and continue |
| Registration succeeds but the spoke then fails | It appears in inventory as **degraded/unavailable** with an integration-error entry within one health-check interval — registration and health are independent concerns | Triage via JRN-04.02; disable if required |
| She tries to open a CVS **work item's content** | Denied — administrative privilege over the platform is **not** privilege over mission content, and the attempt is itself audited | Console-level operation only; this separation is a defensible-design point worth stating aloud in the demo |

#### Accessibility Notes

*An operations console is a frequent and unexamined accessibility failure point precisely because it is assumed to be "internal tooling." It is not exempt from Section 508.*

- **Keyboard-only and screen-reader completable end to end**, including the wizard, the live test, and the confirmation.
- The multi-step wizard needs **accessible step indication** (current step programmatically conveyed, not just visually), per-step validation with an error summary and focus management, and preserved state across steps.
- The **live connection test must be keyboard-operable and its result announced via a live region** — a result that only appears visually leaves a non-visual user unable to know whether the gate has opened.
- No reliance on drag, hover, or pointer-only interaction anywhere in the flow, including the icon-token picker.
- **Health status is never colour-only:** healthy / degraded / unavailable each need a text label and/or icon. A red/green dot alone is both a conformance failure and an operational hazard (NFR-02).
- Console data tables — inventory, health history — follow the same accessible patterns as the work queue: header scope, captions, sort-state announcement, accessible pagination, announced result counts.
- **Destructive actions** (disable, de-register) use accessible confirmation dialogs that trap focus correctly and restore it on close.
- Endpoints, identifiers, and correlation IDs are **selectable, copyable text**, never truncated cells without an accessible full value.

#### Success Outcome

Priya registers the sixth application live through the UI **in under five minutes with zero code changes and zero restarts**, and the investigator sees its work items in his unified queue **without signing out** — the success measure of JTBD-04.1 (SM-11, SM-12, NFR-11) and the PRD F12 acceptance signal.

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Show the "before" | F11, F8 |
| 2. Start the flow | **F12**, F14 |
| 3. Describe the connection | **F12**, F8, F16 |
| 4. Test it before committing | **F12**, F14, F16, F9 |
| 5. Let it describe itself | **F8**, F12, F9 |
| 6. Decide who sees it | F2, F8, F12 |
| 7. Review and submit | **F12**, F13, F14 |
| 8. Watch it come alive | F11, F16, F8 |
| 9. Prove the consequence | F5, F8, F1, F12 |

---
