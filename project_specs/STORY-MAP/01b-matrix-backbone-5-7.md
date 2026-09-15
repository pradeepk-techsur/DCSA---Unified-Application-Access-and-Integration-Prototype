### Resolve across systems

*The seam. This is where the product either earns its thesis or loses it. Journey stages: JRN-01.01:7–9, JRN-02.01:4.*

| Activity | Persona | Epic | Stories | NaC | Release |
|---|---|---|---|---|---|
| Move from the case to the issue without leaving the experience | PER-01 | **Epic 7 (F7)** | **US-061** | JTBD-01.1: "No login. No new tab. No 'you are now leaving this application'. I am still in the same place, and the trail at the top still knows which case I came from." | **R1** |
| Cross that boundary without re-typing a single identifier | PER-01 | **Epic 7 (F7)** | **US-061** *(shared)* | JTBD-01.1: "I typed nothing. No case number, no subject ID, no issue reference — my scratch document is redundant." | **R1** |
| Resolve the issue with a disposition and a narrative | PER-01 | **Epic 7 (F7)** | **US-063** | JTBD-01.1: "Before I submit, the panel tells me this will update PVQ *and* eApp. I know what I am about to change." | **R1** |
| Have the hub coordinate the update across both systems | PER-01 | **Epic 7 (F7)** | **US-064** | JTBD-01.1: "One submission updated both systems correctly, or it changed nothing at all. I never have to do the second half of my own transaction by hand." | **R1** |
| See what each system says about itself afterwards | PER-01 | **Epic 7 (F7)** | **US-065** | JTBD-01.1: "PVQ says resolved. eApp says the case is clear. *Both of them said it* — the middle layer did not say it on their behalf." | **R1** |
| Be told the truth when only one of the two systems updates | PER-01, PER-04 | **Epic 7 (F7)** | **US-066** | JTBD-01.1: "Half-done is reported as half-done, naming which system changed and which did not, with a retry I can press. The word 'success' is nowhere on that screen." | **R1** |
| Have every request pass through one enforcement point | PER-04 | Epic 10 (F10) | US-081 | JTBD-04.4: "There is one place where authorization and audit happen. I can point at it." | R1 |
| Have every state change recorded before I am told it worked | PER-01 | Epic 10 (F10), Epic 13 (F13) | US-083, US-101 | JTBD-01.3: "If it cannot be written down, it did not happen. I am never told something succeeded that nobody recorded." | R1 |
| Get the same shape of error from every endpoint | PER-04 | Epic 10 (F10) | US-082 | JTBD-04.3: "Every failure comes back the same shape with a correlation ID, so I can classify it without guessing." | R2 |
| Be refused another person's record | PER-03 | Epic 2 (F2) | **US-018** | JTBD-03.4: "Somebody used my session to ask for another applicant's file and was refused — and the refusal does not even reveal whether that file exists." | R2 |
| Be refused an action that belongs to another role | PER-01, PER-02 | Epic 2 (F2) | **US-019** | JTBD-02.2: "The determination action is refused to an investigator by the server, not hidden by the page." | R2 |
| Be refused the administrator console | PER-01…03 | Epic 2 (F2) | **US-020** | JTBD-03.4: "No mission user can reach the console, by menu or by typing the URL." | R2 |
| Be refused a case outside my unit, region, or clearance tier | PER-01 | Epic 2 (F2) | **US-021**, **US-022** | JTBD-01.1: "My role is not the whole answer — the system checks my region and my tier against *this* case." | R2 |
| Be refused mission content as an administrator | PER-04 | Epic 2 (F2) | **US-023** | JTBD-04.4: "I run the platform and I still cannot read a questionnaire answer. Administrators are not exempt." | R2 |
| Get a denial that explains itself without revealing anything | PER-01…04 | Epic 2 (F2) | US-024 | JTBD-03.4: "A refusal for a record that exists and a refusal for one that does not are indistinguishable to me." | R2 |
| Never see a blank page or a stack trace | PER-01…04 | Epic 16 (F16) | US-130 | JTBD-01.4: "Whatever goes wrong, I get a page with words on it and a way forward. Never a blank screen." | R2 |

---

### Verify & Audit

*Prove it happened, and leave a record that holds up. Journey stages: JRN-01.01:10–11, JRN-02.01:5–9, JRN-03.02:1–6, JRN-04.02:4–6.*

| Activity | Persona | Epic | Stories | NaC | Release |
|---|---|---|---|---|---|
| Go back to the case and see it is clean | PER-01 | **Epic 7 (F7)** | **US-067** | JTBD-01.1: "The case now says 'no outstanding issues', and that was re-read from eApp just now — not remembered from before." | **R1** |
| Satisfy myself independently that both systems really changed | PER-01, PER-04 | **Epic 7 (F7)** | **US-067** *(shared)*, US-077 | JTBD-01.1: "I called eApp and PVQ directly, with the hub out of the path, and both of them agree." | **R1** |
| Satisfy myself the five systems are genuinely separate | PER-04 | Epic 9 (F9) | US-076 | JTBD-04.1: "Five processes, five data namespaces, no shared schema. I checked; there is no join to find." | R1 |
| Read the whole cross-system action as one story | PER-02, PER-04 | **Epic 7 (F7)**, Epic 13 (F13) | **US-068**, US-106 | JTBD-01.3: "One story, not four rows. Case read, traversal, both writes, confirmation — one thread, in order, with before and after in plain words." | **R1** |
| Have the record capture who I was when I acted | PER-02 | Epic 13 (F13) | US-102 | JTBD-02.2: "The record says what roles and attributes I held *at that moment* — not what I hold today." | R1 |
| See my own activity without seeing anyone else's | PER-01, PER-03 | Epic 13 (F13) | US-107 | JTBD-03.4: "I can prove what I sent and when, and I can see only mine." | R1 |
| Re-run the whole flagship path keyboard-only | PER-01 | **Epic 7 (F7)**, Epic 14 (F14) | **US-069** | JTBD-01.1: "I completed the entire cross-application workflow without a mouse, and focus landed where I expected at every boundary." | **R1** |
| Know the flagship workflow still works before I demo it | PER-04 | Epic 19 (F19) | US-145 | JTBD-04.2: "A single test run tells me the centrepiece is intact before I stand up in front of anyone." | R1 |
| Find my own proof of a prior submission | PER-03 | Epic 13 (F13) | US-107 *(shared)* | JTBD-03.4: "My security officer asked whether I sent it in. I answered with a dated entry instead of searching my email." | R2 |
| Find authentication, denials, and failures in the trail | PER-04 | Epic 13 (F13) | US-103 | JTBD-04.4: "The refusals are on the record too, not just the successes." | R2 |
| Trust that no one has quietly altered the record | PER-04 | Epic 13 (F13) | US-104 | JTBD-02.2: "Sequence numbers and hash chaining, and no path anywhere in the application to edit or delete a record — for anyone." | R2 |
| Read and filter the trail to answer a question | PER-04 | Epic 13 (F13) | US-105 | JTBD-04.4: "Who did what, to what, when — one query, filtered by actor, action, system, outcome, and date." | R2 |
| Have the access-control claims tested rather than asserted | PER-04 | Epic 19 (F19) | US-146 | JTBD-04.4: "Every negative path is a test that runs, not a paragraph in a document." | R2 |
| Take the evidence away with me | PER-04 | Epic 13 (F13) | US-108 | JTBD-04.4: "I can export exactly what is on screen, and the export still says the data is synthetic." | R3 |
| Read accurate API documentation and exercise it myself | PER-04 | Epic 10 (F10) | US-084 | JTBD-04.3: "The published documentation matches the implementation, and I can drive it with curl." | R3 |
| Have every endpoint tested, including a refusal | PER-04 | Epic 10 (F10), Epic 19 (F19) | US-085, US-148 | JTBD-04.4: "Every endpoint has at least one test that proves it refuses the wrong caller and writes exactly one audit record when it accepts the right one." | R3 |
| Have every adapter proven to behave the same way | PER-04 | Epic 19 (F19) | US-147 | JTBD-04.1: "Any new adapter passes the same conformance suite the five originals passed. The contract is testable, not aspirational." | R3 |
| Have accessibility checked on every route for every role | PER-04 | Epic 19 (F19) | US-149 | JTBD-04.2: "Every route, every role, scanned — zero serious or critical violations, with a dated manual keyboard and screen-reader pass alongside it." | R3 |
| Prove that every button really does work | PER-04 | Epic 19 (F19), Epic 3 (F3) | US-150, US-032 | `PRIN-03` (Every button works): "A crawl of every navigation item for every role finds a real, populated page — no 404, no placeholder, no dead control." | R3 |
| Read the test results without reading a CI log | PER-04 | Epic 19 (F19) | US-151 | JTBD-04.2: "One readable report tells me what passed, what failed, and when it last ran." | R3 |
| Read what the product claims about its own accessibility | PER-04 | Epic 14 (F14) | US-118 | `PRIN-06` (Honest demo): "The accessibility statement names the conformance level and the known limitations, including the style-guide assumption." | R3 |

---

### Administer & Extend

*Operate the platform, and onboard the next application as configuration. Journey stages: JRN-04.01:1–9, JRN-04.02:1–8, JRN-04.03:1–6, JRN-01.02:7, JRN-01.03:5–7.*

| Activity | Persona | Epic | Stories | NaC | Release |
|---|---|---|---|---|---|
| Add or remove an application without touching hub code | PER-04 | Epic 8 (F8) | US-070 | JTBD-04.1: "There is no hard-coded list of five systems anywhere. Navigation, the queue, and the console all read the registry." | R1 |
| Start the whole prototype with one command | PER-04 | Epic 18 (F18) | US-138 | JTBD-04.1: "One documented command, and it is running in under ten minutes on a machine that has never seen it." | R1 *(deviation — see R1 rationale)* |
| Drive the flagship workflow from a written script, unaided | PER-04, PER-01 | Epic 18 (F18) | US-140 | JTBD-04.1: "Someone who has never seen this product completes the flagship workflow from the script in under three minutes." | R1 *(deviation — see R1 rationale)* |
| Inspect the policy rather than infer it | PER-04 | Epic 2 (F2) | US-025 | JTBD-04.3: "I can read what each role is entitled to in one place, instead of deducing it from what the screens show." | R3 |
| See everything connected to the platform | PER-04 | Epic 11 (F11) | US-086 | JTBD-04.2: "One inventory answers 'what is attached to this platform right now' — and it is the registry, not a wiki page that drifted." | R3 |
| Know whether each system is healthy before a user tells me | PER-04 | Epic 11 (F11), Epic 16 (F16) | US-087, US-125 | JTBD-04.2: "Healthy, degraded, or unavailable — in words, with last successful check and latency — before the phone rings." | R3 |
| Diagnose an integration failure from one place | PER-04 | Epic 11 (F11) | US-088 | JTBD-04.3: "Spoke outage, misconfiguration, denial, or user error — I can tell which in minutes, without merging logs by hand." | R3 |
| Follow one correlation ID from the error log into the audit chain | PER-04 | Epic 11 (F11) | US-089 | JTBD-04.3: "The ID the user read off their error screen resolves the whole trace in one query — and I can select and copy it into the ticket." | R3 |
| Test a connection live, in front of a reviewer | PER-04 | Epic 11 (F11) | US-090 | JTBD-04.2: "I can prove right now whether we can reach that system, on demand, and the result is announced not just coloured." | R3 |
| Tell users something without an email blast | PER-04 | Epic 11 (F11) | US-091 | JTBD-04.3: "The announcement lands on exactly the dashboards I targeted, dismissible per person, and never over the demo banner." | R3 |
| Use a console as accessible as the rest of the product | PER-04 | Epic 11 (F11), Epic 14 (F14) | US-092 | JTBD-04.2: "The densest tables in the product — health, error log, audit — are operable by keyboard and screen reader like everything else." | R3 |
| Account for my own actions like everyone else | PER-04 | Epic 11 (F11) | US-093 | JTBD-04.4: "My console actions are authorized server-side and appear in the trail under my name. Administrators are not exempt." | R3 |
| Register a new application through a guided form | PER-04 | Epic 12 (F12) | US-094 | JTBD-04.1: "Five steps, in the UI, by me — no developer, no pull request, no redeploy, no restart." | R3 |
| Be caught before I register something broken | PER-04 | Epic 12 (F12) | US-095 | JTBD-04.1: "A duplicate identifier or an unreachable endpoint is caught at the step, with an error summary I can act on." | R3 |
| Test the connection before I commit to it | PER-04 | Epic 12 (F12) | US-096 | JTBD-04.1: "I found out the endpoint was unreachable *before* I submitted, not after." | R3 |
| Let the application tell me what it can do | PER-04 | Epic 12 (F12) | US-097 | JTBD-04.1: "Its work-item types and actions were filled in from the application's own declaration — I confirmed them, I did not transcribe them." | R3 |
| Watch the new application appear everywhere immediately | PER-04, PER-01 | Epic 12 (F12) | US-098 | JTBD-04.1: "Under five minutes, zero code changes, zero restarts — and Marcus, already signed in in the other window, sees its items without signing out." | R3 |
| Have a sixth application ready to register live | PER-04 | Epic 12 (F12) | US-099 | JTBD-04.1: "A real sixth service ships unregistered, specifically so registration is performed live rather than described." | R3 |
| Change or remove a registered application safely | PER-04 | Epic 12 (F12), Epic 8 (F8) | US-100, US-071 | JTBD-04.1: "De-registering removes it cleanly from navigation, queue, and console — no code change, no errors, and the change is audited." | R3 |
| Have a reduced-capability application degrade its controls | PER-01, PER-04 | Epic 8 (F8) | US-072 | JTBD-04.1: "An application that supports fewer actions simply offers fewer buttons. It does not error." | R3 |
| Have one slow application bounded | PER-01, PER-04 | Epic 8 (F8) | US-073 | JTBD-01.4: "One slow system never stalls the whole queue — it times out at its configured bound and says so." | R3 |
| Prove a new adapter is correct before trusting it | PER-04 | Epic 8 (F8) | US-074 | JTBD-04.1: "There is a conformance suite a candidate adapter must pass, runnable on its own." | R3 |
| Be protected from a mis-registered application | PER-04 | Epic 8 (F8) | US-075 | JTBD-04.2: "A badly configured application degrades itself, not the platform." | R3 |
| Break a system on purpose in front of a reviewer | PER-04 | Epic 16 (F16), Epic 18 (F18) | US-131, US-143 | JTBD-04.2: "I take Investigation Management down deliberately, and put it back — administrator-only, reversible, and the injection itself is audited." | R3 |
| Be told what is missing, where it is missing | PER-01 | Epic 16 (F16) | US-127 | JTBD-01.4: "Twelve missing, and I know which system. That is a bounded fact, not an unknown." | R3 |
| Watch a page fill in rather than sit blank | PER-01 | Epic 16 (F16) | US-128 | JTBD-01.4: "The page is interactive while the slow parts are still arriving, and the busy state is announced." | R3 |
| Never confuse "nothing to do" with "nothing loaded" | PER-02, PER-03 | Epic 16 (F16) | US-129 | JTBD-02.4: "An empty issue list and an unreachable PVQ are two different screens — different words, different structure, distinguishable without looking." | R3 |
| Watch the system heal itself | PER-01 | Epic 16 (F16) | US-132 | JTBD-01.4: "It came back on its own. I did not reload and I did not sign in again." | R3 |
| Be told precisely what is wrong when startup fails | PER-04 | Epic 18 (F18) | US-139 | JTBD-04.3: "A failed start names the port, the container, or the missing dependency — it does not make me read a stack trace." | R3 |
| Demonstrate the other four claims from scripts too | PER-04 | Epic 18 (F18) | US-141 | JTBD-04.1: "Resilience, extensibility, role-level and resource-level zero trust each have a written script with expected state at every step." | R3 |
| Know the environment is ready before I present | PER-04 | Epic 18 (F18) | US-142 | JTBD-04.2: "One pre-flight check confirms all six applications healthy and the flagship case open, before I start." | R3 |
| Recover from the three likeliest demo-day failures | PER-04 | Epic 18 (F18) | US-144 | JTBD-04.3: "There is a written contingency for a consumed flagship case, a spoke that will not start, and a stuck circuit breaker." | R3 |

---
