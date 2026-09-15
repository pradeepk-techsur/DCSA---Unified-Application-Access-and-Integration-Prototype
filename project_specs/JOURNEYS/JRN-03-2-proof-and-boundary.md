
### JRN-03.02: Prove What I Submitted — and Watch the Boundary Around My Record Hold

**Persona:** PER-03 (Renée Ashford)
**Scenario:** Renée's facility security officer emails to ask whether she sent in the employment documentation two weeks ago. She wants to answer with evidence rather than memory — and while she is in there, she wants the quieter reassurance that the most sensitive information she has ever disclosed is visible **only** to her. This journey has two audiences. For Renée it is a five-minute errand ending in relief. For an evaluator it is the **headline zero-trust demonstration in the product**: an authenticated applicant is the strictest access scope in the system, and the denial is shown live — from the UI and then from curl — with the denial itself written to the audit trail.
**Related Jobs:** JTBD-03.4 *(primary)*, JTBD-03.1 *(the reassurance that keeps her from calling)*
**Entry Trigger:** A third party asks her to prove a prior submission; and, for the demo, the evaluator asking "what stops one applicant from reading another's file?"
**Demo Path:** ✅ **SECONDARY SCRIPTED DEMO — Segment 5b.** Runs immediately after JRN-03.01. Drive stages 1–3 in the browser, stages 4–6 with **curl against the hub API**, then show the audited denials in the audit viewer as the administrator. Zero-trust claims that are asserted but not demonstrable are worth nothing here.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | iep / eapp | A **completed prior submission** for `SUBJ-00622` with a real timestamp and a retrievable record, so "prove it" has something to prove. |
| P2 | hub | Self-scoped audit/activity records for her identity covering her own submissions — and **nothing else**. Her history view is audit scoped to self, not the platform trail. |
| P3 | hub | A **second applicant** (different `subjectRef`, e.g. `SUBJ-00418`) with a known, real resource ID. The denial demo requires a resource that genuinely exists: denying a request for something non-existent proves nothing about enumeration. |
| P4 | pvq / im | Investigative content about Renée that exists and is deliberately unreachable from every applicant surface — a PVQ issue raised against her answer, and an IM assignment naming an investigator. |
| P5 | hub | A published API surface an evaluator can call directly (OpenAPI documentation available), with a **consistent non-enumerable error contract** and correlation IDs on every response. |
| P6 | hub | Audit coverage for **authorization denials**, not just successes, so the denials produced during this demo appear in the viewer within seconds. |
| P7 | hub | An administrator identity available in a second window to display the audit trail immediately after the denials are produced. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Look for proof | Signs in and opens her own submission history | SCR-11 dashboard → SCR-18 submission history | "Did I actually send that, or did I just mean to?" | Uncertain, slightly defensive | **Today:** she searches personal email to prove what she submitted, and keeps her own copies because she cannot retrieve them from the system | A self-scoped history showing what she sent and when, with links back to the item (F6, F13 self-scoped) |
| 2. Find the entry | Reads the dated entry: what was submitted, when, and its current state | SCR-18 history row → item link | "Sent on the 3rd. There it is, with a date." | **Relief** | **Today:** she answers from memory and hopes; her security officer re-asks a week later | Evidence, not recollection — answerable in one screenshot |
| 3. Check the edges | Notices there is nothing on any of her screens about investigators, findings, or issues raised against her answers | SCR-11 / SCR-18 — investigative content absent by design | "This is my file. Just mine. Nothing about anybody else, and nothing I shouldn't have." | Quietly reassured | **Today:** no visible assurance that the system shows her only her own record, which is unsettling given what the record contains | Privacy legibility: the scope she is in is evident from the shape of what she can reach |
| 4. **(Evaluator) Try the side door — wrong subject** | An authenticated applicant session calls a legitimate endpoint with **another subject's real resource ID** | Hub API via curl (`GET /api/work-items/{other-subject-item}`) | *(Evaluator:)* "Does the check happen on the resource, or only on the route?" | Evaluator: testing | **Today:** each system interprets scope on its own terms; nobody can demonstrate the boundary, only describe it | **Resource-level** entitlement check against her `subjectRef` on **every** read — route-level checks alone are a defect (F2) |
| 5. **(Evaluator) Try the side door — wrong role** | The same session calls the **investigator-only resolve endpoint** directly | Hub API via curl (`POST /api/…/actions/RESOLVE_ISSUE`) | *(Evaluator:)* "And if she just calls the mission endpoint?" | Evaluator: testing | **Today:** authorization lives partly in each UI, so bypassing the UI is an untested path | Server-side authorization on every request; client-side hiding is presentation, never the control (NFR-04, NFR-05) |
| 6. **(Evaluator) Read the denials** | The administrator opens the audit viewer and filters to the last minute | SCR-33 audit viewer → SCR-34 record detail | *(Evaluator:)* "So the attempt is on the record, not just blocked." | Evaluator: convinced | **Today:** denials are not recorded anywhere reconstructable, so an attempted breach leaves no trail | Denials audited with actor, target, outcome, and correlation ID (F13) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Look for proof | Audit/activity query **scoped to her identity** server-side; she cannot widen it by parameter, because the scope is applied server-side rather than requested by the client | F13, F2, F6 |
| 2. Find the entry | Submission record read back through the owning adapter with its real timestamp and current state, linked to the item | F6, F9 |
| 3. Check the edges | Navigation and entitlements are server-computed: investigative surfaces are not rendered, not linked, and not reachable by URL. The PVQ issue against her answer exists in the seed and resolves for mission roles only | **F2**, F3, F4 |
| 4. Wrong subject | Denied **server-side** with a **consistent non-enumerable error** that does not reveal whether the resource exists, plus a correlation ID; **the denial is written to the audit trail** | **F2**, F10, F13 |
| 5. Wrong role | Denied server-side with the identical error shape and status as the wrong-subject case — the two failures are indistinguishable to the caller, which is the point | **F2**, F10, F13 |
| 6. Read the denials | Audit viewer returns both denial records with actor identity, roles/attributes held at the time, action type, target system and resource, outcome `DENIED`, and correlation ID, filterable and paginated | F13, F11 |

**Emotion curve (1 anxious → 5 confident):** Look for proof **2** *(she genuinely is not sure)* → Find the entry **5** *(evidence, immediately)* → Check the edges **5** → *(evaluator segment — Renée's journey has ended reassured; stages 4–6 are the reviewer's curve: skeptical **2** → tested **3** → convinced **5**)*.

#### Key Moments

- **Delight Opportunity — Stage 2.** Answering her security officer with a dated record in under a minute. Small errand, disproportionate reassurance, and it removes a support contact that today costs three other people time.
- **Demo Moment — Stages 4–6.** This is the product's **headline zero-trust demonstration** (PRD F2 acceptance signal, SM-18). Show it live with curl. An evaluator who has been told about server-side authorization and shown it are two different evaluators.
- **Risk — Stage 4/5.** An error that discloses whether another record exists. A 404-vs-403 distinction, a differing message, or even a differing response time is an enumeration oracle and fails this journey regardless of whether access was granted.
- **Trust-destroying Risk — Stage 3.** Any glimpse of another individual's information, however incidental — a name in a shared header, a count that includes others, an autocomplete leak. One occurrence is unrecoverable for this persona and externally reportable.
- **Risk — Stage 1.** A history that omits something she knows she submitted. A partial record is worse than none, because she will trust it.

#### Success Exit Criteria

- Her submission history shows **everything she submitted and nothing belonging to anyone else**, retrievable in under a minute.
- An authenticated applicant calling an investigator-only endpoint, **or a legitimate endpoint with another subject's resource ID**, is denied **server-side** with a **consistent non-enumerable error**, and the denial **appears in the audit trail** — demonstrable live via curl (SM-18, PRD F2 acceptance signal).
- The two denial classes are **indistinguishable to the caller** in status, body, and timing.
- No applicant screen or reachable URL exposes investigative content, investigator identity, PVQ issue items, PDT designations, IM case records, or adjudicative deliberation.
- Every denial carries a correlation ID that the administrator can resolve in the audit viewer (JRN-04.02).

#### Failure and Alternate Paths

| Condition | What happens | Recovery |
|-----------|--------------|----------|
| She follows a stale deep link to an item that is no longer hers | SCR-30 access denied, non-enumerable, with exits to her dashboard; denial audited | Returns to her own dashboard |
| She guesses another subject's ID in the UI | Identical denial to the API path — the UI is not a second authorization surface, it just renders what the server permits | Same |
| An endpoint is discovered that authorizes only at route level | **This is a defect, not an alternate path.** Negative-path tests must cover every endpoint with an unauthorized resource identifier, not merely an unauthorized role (NFR-04, F19) | Fix before demo; it invalidates the segment |
| Audit write fails during a denial | The denial still stands; the audit failure is itself surfaced and logged — an action that cannot be audited does not complete, and that rule applies to recording denials too | Administrator triages via JRN-04.02 |
| Evaluator asks to try it themselves | Published API documentation and a running endpoint are available; nothing about the demo depends on the evaluator not looking | Encouraged — this persona's scope is the one that best survives inspection |

#### Accessibility Notes

- **Keyboard-only and screen-reader completable end to end** for the applicant-facing stages (1–3): history table, row links, and the return path.
- The **history table** is a proper data table with caption, header scope, and an announced result count; dates are readable as text, not as a graphic or a relative-only phrase ("2 weeks ago") that loses precision when precision is the point.
- **Access-denied pages must be accessible and plain-language**: a clear heading, an explanation that does not leak, a selectable correlation ID, and at least two working exits. A denial is a page like any other and is in scope for 508.
- The correlation ID on a denial must be **selectable, copyable text** — she may be asked to quote it, and the administrator certainly will (JRN-04.02).
- No security state is conveyed by colour alone; "you don't have access" is a sentence, not a red box (NFR-02).
- Usable at 320px width and 200% zoom, since this errand will happen on her phone (NFR-16).

#### Success Outcome

Renée produces evidence of a prior submission in under a minute from a self-scoped history — and an authenticated applicant calling an investigator-only endpoint, or a legitimate endpoint with another subject's resource ID, is denied server-side with a consistent non-enumerable error whose denial appears in the audit trail: the success measure of JTBD-03.4 and the PRD F2 acceptance signal (SM-18).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Look for proof | F6, F13, F2 |
| 2. Find the entry | F6, F9, F17 |
| 3. Check the edges | **F2**, F3, F4 |
| 4. Wrong subject | **F2**, F10, F13, F19 |
| 5. Wrong role | **F2**, F10, F13, F19 |
| 6. Read the denials | F13, F11, F10 |

---
