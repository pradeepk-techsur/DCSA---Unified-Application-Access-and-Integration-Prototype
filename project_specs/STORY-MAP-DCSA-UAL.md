# User Story Map
## DCSA Unified Application Access and Integration Prototype (DCSA-UAL)

| Field | Value |
|-------|-------|
| **Product Name** | DCSA Unified Application Access and Integration Prototype |
| **Project Acronym** | DCSA-UAL |
| **Document Type** | User Story Map |
| **Status** | Draft v1.0 |
| **Date** | 2026-09-15 |
| **Related Personas** | `project_specs/PERSONAS-DCSA-UAL.md` (PER-01 … PER-04) |
| **Related Journeys** | `project_specs/JOURNEYS-DCSA-UAL.md` (JRN-01.01 … JRN-04.03) |
| **Related JTBD** | `project_specs/JTBD-DCSA-UAL.md` (JTBD-01.1 … JTBD-04.4) |
| **Related User Stories** | `project_specs/UserStories-DCSA-UAL.md` (US-001 … US-151) |
| **Related PRD** | `project_specs/PRD-DCSA-UAL.md` (§5 Feature Requirements F0–F19) |
| **Related Charter** | `.planning/PROJECT.md` |

> **DEMO — SYNTHETIC DATA ONLY.** This map organizes a demonstration prototype. No real DCSA personnel, applicants, cases, or systems are represented. Every NaC below is written to be **watched happening** on synthetic data in front of an evaluator.

---

## Overview

### What this document is

This map takes the **151 existing user stories** in `UserStories-DCSA-UAL.md` and places each one at the intersection of two axes. It creates no new stories.

- **Horizontal axis (the backbone)** — the user's path through the unified experience, derived from the journey stages in `JOURNEYS-DCSA-UAL.md`, **not** from the PRD feature list. The backbone reads as a day of work, not as an architecture diagram:

  > **Authenticate → Orient → Find work → Work an item → Resolve across systems → Verify & Audit → Administer & Extend**

  This ordering is deliberate. The product's entire argument is that a single piece of work crosses system boundaries; a feature-ordered backbone would hide exactly the seam the prototype exists to prove. Every backbone step below appears in at least one journey stage table, and the flagship journey JRN-01.01 traverses all seven in sequence.

- **Vertical axis (the releases)** — three increments, each of which completes journeys rather than feature areas. R1 is a walking skeleton that ends with the flagship journey demonstrable end to end; R2 adds role breadth and the trust claims; R3 adds extensibility and operability.

### What NaC means here

**Natural Acceptance Criteria** are what the *user* would say has to be true, phrased in their own words, derived from a JTBD **desired outcome** applied to a specific journey stage. They are not implementation assertions. Each one is written so an evaluator could watch it happen — or fail — in a live demonstration.

```
JTBD desired outcome  ×  journey stage context  =  NaC
"Minimize the number      "JRN-01.01:Traverse"      "I cross from the case to the
 of authentication                                    issue and nothing asks me to
 events…"                                             sign in again."
```

NaC are **not invented**. Every one traces to a JTBD outcome ID in the NaC Derivation Table. Seven structural stories have no JTBD ancestor at all — those are parented instead to a **PRD product principle ID** (`PRIN-01`…`PRIN-06`, PRD §3) and are called out honestly in the Gap Analysis rather than given a fabricated JTBD parent.

### How to read the matrix

Each `###` section below is one **backbone step** and carries one activity table with a fixed six-column shape:

`| Activity | Persona | Epic | Stories | NaC | Release |`

Each story is owned by exactly one activity row, in the backbone step where the user actually encounters it. Three stories (US-061, US-067, US-107) carry a second row marked *(shared)* because they deliver two distinct user-observable claims at the same stage; the second row adds no scope. Cross-cutting epics (F14 accessibility, F13 audit, F2 authorization) are distributed to the step where their behaviour is *observable*, not collected into a technical lane — because an accessibility story nobody can point at during a demo is an accessibility story nobody will build.

---
## Story Map Matrix

**Backbone:** Authenticate → Orient → Find work → Work an item → Resolve across systems → Verify & Audit → Administer & Extend

**Legend.** `Release` is the increment in which the story must be complete. Where a story's scope legitimately splits across increments (seed breadth, spoke depth), both are named. A `PRIN-nn` citation in the NaC column marks a criterion derived from a **PRD product principle** (PRD §3) rather than a JTBD outcome — see Gap Analysis.

---

### Authenticate

*One door. Journey stages: JRN-01.01:1, JRN-01.02:1, JRN-02.01:1, JRN-03.01:1.*

| Activity | Persona | Epic | Stories | NaC | Release |
|---|---|---|---|---|---|
| Choose a sign-in method and get in with a card | PER-01…04 | Epic 0 (F0) | US-001, US-002 | JTBD-01.1: "One card, one door — and I am not asked for a credential again anywhere in this session." | R1 |
| Carry that one session into every connected system | PER-01, PER-04 | Epic 1 (F1) | US-009, US-010 | JTBD-01.1: "I touched work from five different systems and signed in once. The log says once, too." | R1 |
| See who I am, in which role, and how long I have | PER-01 | Epic 1 (F1) | US-012 | JTBD-01.1: "I can tell at a glance who the system thinks I am, so I'm never surprised by what it lets me do." | R1 |
| Tie every step of one action to one thread | PER-04 | Epic 1 (F1) | US-014 | JTBD-04.4: "One reference follows my action from the browser all the way to the spoke, so the answer later is a lookup, not a reconstruction." | R1 |
| Sign out and know access really ended everywhere | PER-01 | Epic 0 (F0) | US-007 | JTBD-03.4: "When I leave, I have left — nothing is still open on my behalf in some other system." | R1 |
| Never be misled into thinking the authentication is real | PER-04 | Epic 0 (F0) | US-008 | `PRIN-06` (Honest demo): "Nothing on this screen lets me believe a certificate was actually validated." | R1 |
| Sign in through a second identity provider | PER-01 | Epic 0 (F0) | US-003 | JTBD-03.1: "The other half of my process doesn't need a different login." | R2 |
| Sign in from home, on a phone, without a card | PER-03 | Epic 0 (F0) | US-004 | JTBD-03.1: "I got in from my kitchen with a code on my phone — no certificate, no second password to reset." | R2 |
| Be refused cleanly, and told nothing useful | PER-03 | Epic 0 (F0) | US-005 | JTBD-03.4: "A failed sign-in tells me it failed and nothing about whether that account exists." | R2 |
| Follow a deep link and land there after one sign-in | PER-02 | Epic 1 (F1) | US-011 | JTBD-02.1: "A link someone sent me opens the thing itself, not a login page that forgets where I was going." | R2 |
| Switch between the roles I hold without signing in again | PER-01, PER-02 | Epic 1 (F1) | US-013 | JTBD-02.2: "Changing which hat I am wearing is explicit and visible, so I always know which authority I am acting under." | R2 |
| Not be punished by a timer for working at my own pace | PER-03, PER-01 | Epic 0 (F0), Epic 14 (F14) | US-006, US-117 | JTBD-03.2: "The doorbell rang, I came back twenty minutes later, and everything I had typed was still there." | R2 |

---

### Orient

*What is mine, what is urgent, what changed. Journey stages: JRN-01.01:2, JRN-01.02:2, JRN-02.02:1, JRN-03.01:2–5, JRN-04.02:1.*

| Activity | Persona | Epic | Stories | NaC | Release |
|---|---|---|---|---|---|
| Land inside one consistent frame that says this is one product | PER-01…04 | Epic 3 (F3) | US-026, US-028 | JTBD-01.1: "Same header, same chrome, wherever the work came from — I never have to notice which system I am in." | R1 |
| Always see that the data is synthetic | PER-04 | Epic 3 (F3) | US-027 | `PRIN-06` (Honest demo): "The synthetic-data label is on every screen I can reach, and there is no way to close it." | R1 |
| Always know where I am when I cross a system boundary | PER-01 | Epic 3 (F3) | US-029 | JTBD-01.1: "The trail at the top still says which case I came from after I've crossed into another system." | R1 |
| Read my caseload posture the moment I sign in | PER-01 | Epic 4 (F4) | US-033 | JTBD-01.2: "Forty-one open, four overdue, one new issue — I did not have to assemble that from three systems and memory." | R1 |
| Be told an issue was raised on a case I own | PER-01 | Epic 15 (F15) | US-119 | JTBD-01.2: "Nobody had to call me. The issue that sat for three days is on the screen the moment I sign in." | R1 |
| Act on anything my dashboard shows me | PER-01 | Epic 4 (F4) | US-039 | JTBD-01.2: "Every number and every alert takes me to the actual thing — the next item I should work is two clicks from sign-in." | R1 |
| See what awaits my determination, and what is aging | PER-02 | Epic 4 (F4) | US-034 | JTBD-02.3: "My workspace tells me what is aging and what is blocked. I do not learn it from someone else's report." | R2 |
| Understand where I am in plain language | PER-03 | Epic 4 (F4) | US-035 | JTBD-03.1: "I read one sentence on my phone and knew where I stood — no acronym, no tier code, no scrolling past jargon." | R2 |
| See at a glance that something is waiting for me | PER-02 | Epic 15 (F15) | US-120, US-121 | JTBD-02.3: "The count in the header matches what is actually in my queue, and marking one read doesn't make it vanish." | R2 |
| Read a notice where I already look | PER-03 | Epic 15 (F15) | US-122 | JTBD-03.3: "The notice was waiting where I check my status — I did not have to find it in an email my security officer forwarded." | R2 |
| Never have a notice hide the demo banner | PER-04 | Epic 15 (F15) | US-123 | `PRIN-06` (Honest demo): "No announcement, however urgent, ever covers the synthetic-data label." | R2 |
| Search across everything I am allowed to see | PER-02, PER-03 | Epic 3 (F3) | US-030 | JTBD-02.1: "I can find a subject by name or number once, instead of searching four systems with an identifier I copied." | R2 |
| Land somewhere useful when a page does not exist | PER-01, PER-03 | Epic 3 (F3) | US-031 | JTBD-01.4: "A wrong URL gives me a way back to my work, not a stack trace." | R2 |
| See the state of the platform at start of day | PER-04 | Epic 4 (F4) | US-036 | JTBD-04.2: "I learn a system is failing from my own console, not from an investigator calling to say his queue is empty." | R3 |
| Have a slow system degrade one widget, not my whole page | PER-01 | Epic 4 (F4) | US-037 | JTBD-01.4: "One sluggish system slows one box. The rest of the page is already usable." | R3 |
| Be told what is missing rather than shown a partial picture | PER-02 | Epic 4 (F4) | US-038 | JTBD-02.4: "The dashboard says which system it could not reach, so I never mistake a gap for a fact." | R3 |
| Not be told all is well when alerts could not be computed | PER-02 | Epic 15 (F15) | US-124 | JTBD-02.4: "An empty alerts panel means nothing needs me — never that the rules could not run." | R3 |

---

### Find work

*One queue, five sources, one answer to "what first." Journey stages: JRN-01.01:3, JRN-01.02:3–7, JRN-01.03:1–3, JRN-02.02:2–3, JRN-03.01:4.*

| Activity | Persona | Epic | Stories | NaC | Release |
|---|---|---|---|---|---|
| See everything assigned to me in one list | PER-01 | Epic 5 (F5) | US-040 | JTBD-01.2: "One list, and it has work from at least four of the five systems I actually own cases in." | R1 |
| Always know which system owns an item | PER-02 | Epic 5 (F5) | US-041 | JTBD-02.1: "I can say, for any row on this screen, which system it came from — and my screen reader says it too." | R1 |
| Open the queue already scoped the way I would have scoped it | PER-01…03 | Epic 5 (F5) | US-046 | JTBD-01.2: "It already sorted it the way I would have: assigned to me, soonest due first. I configured nothing." | R1 |
| Narrow the queue to what I need right now | PER-01 | Epic 5 (F5) | US-042 | JTBD-01.2: "I can say 'just what's overdue this week' in one move, and the chips show me exactly what I asked for." | R1 |
| Order the queue by what is most urgent | PER-01 | Epic 5 (F5) | US-043 | JTBD-01.2: "A sorted list is defensible — dates mean the same thing whichever system supplied the row." | R1 |
| Page through a long queue and know how much there is | PER-01 | Epic 5 (F5) | US-045 | JTBD-01.2: "I always know how many there are, and the count is announced when I change the filter." | R1 |
| Come back after an interruption to exactly the queue I left | PER-01 | Epic 5 (F5) | US-047 | JTBD-01.2: "Forty minutes and a phone call later, it is exactly where I left it. I do not rebuild the view." | R1 |
| Operate the whole queue with a screen reader | PER-01, PER-02 | Epic 14 (F14) | US-110, US-114 | JTBD-01.2: "I can work the queue without seeing it — sort state is announced and overdue is a word, not a colour." | R1 |
| Find each system behaving like the real thing behind the queue | PER-01…03 | Epic 9 (F9) | US-078 | JTBD-01.2: "The rows look like real cases, real issues, real assignments — not three of everything." | R1 (eApp/PVQ/IM) · R2 (IEP/PDT) |
| Find every screen populated, whichever persona I use | PER-01…04 | Epic 17 (F17) | US-133 | JTBD-01.2: "Every filter I try returns something. A facet that always comes back empty looks broken." | R1 (PER-01) · R2 (PER-02…04) |
| Trust that nothing here resembles a real person | PER-04 | Epic 17 (F17) | US-135 | `PRIN-06` (Honest demo — synthetic data labelled as synthetic): "Nothing on this screen could be mistaken for a real person or a valid identifier." | R1 |
| Get the same demonstration every time I run it | PER-04 | Epic 17 (F17) | US-136 | JTBD-04.1: "One reset command and the flagship case is back to open — three identical runs in a row." | R1 |
| Refuse to start rather than demonstrate on broken data | PER-04 | Epic 17 (F17) | US-137 | JTBD-04.2: "If the seed is wrong, it fails loudly at start-up — not silently in front of a reviewer." | R1 |
| Find one specific item by name or number | PER-02, PER-03 | Epic 5 (F5) | US-044 | JTBD-02.1: "I search once, in one place, instead of pasting an identifier into four systems." | R2 |
| Get guidance rather than a blank table | PER-03 | Epic 5 (F5) | US-049 | JTBD-02.4: "'Nothing to do' is a designed screen that says so in words — it never looks like a failure." | R2 |
| Reach every non-happy state without breaking something | PER-01, PER-03 | Epic 17 (F17) | US-134 | JTBD-01.4: "Every unpleasant state — overdue, blocked, denied, partial, orphaned — exists in the data and can be shown on demand." | R2 |
| Keep working when one connected system is down | PER-01, PER-04 | Epic 5 (F5) | US-048 | JTBD-01.4: "Investigation Management is unavailable — twelve items are not shown. The rest of my work is up to date, and I can still act on it." | R3 |
| Keep using the product when one system is stopped outright | PER-01 | Epic 9 (F9) | US-079 | JTBD-01.4: "Somebody stopped a whole service and I am still working. The hub did not go down with it." | R3 |

---

### Work an item

*Read the record, and do the thing the role exists to do. Journey stages: JRN-01.01:4–6, JRN-02.01:3–8, JRN-02.02:4–7, JRN-03.01:6–8, JRN-01.03:4.*

| Activity | Persona | Epic | Stories | NaC | Release |
|---|---|---|---|---|---|
| Review the full record for a single work item | PER-01, PER-02 | Epic 6 (F6) | US-050 | JTBD-02.1: "Everything bearing on this item is on one reading path, and every panel says which system it came from." | R1 |
| See only the actions I can take — and why the others are not offered | PER-01 | Epic 6 (F6) | US-051 | JTBD-02.2: "The buttons on my screen are exactly the things I am entitled to do. Nothing here will be refused after I try it." | R1 |
| Have my entitlement to *this specific record* checked | PER-01 | Epic 2 (F2) | US-016 | JTBD-01.1: "Opening this case checked that it is *my* case — not merely that investigators may open cases." | R1 |
| See only the navigation and controls I am entitled to | PER-03 | Epic 2 (F2) | US-015 | JTBD-03.4: "The menu I see is built from what I may actually do — it never advertises somewhere I cannot go." | R1 |
| Find the eApp case in my queue and open it | PER-01 | **Epic 7 (F7)** | **US-059** | JTBD-01.1: "The blocked case is on page one of my normal queue. The flagship starts from my ordinary day." | **R1** |
| Discover, on the case itself, that an issue was raised against one of its answers | PER-01 | **Epic 7 (F7)** | **US-060**, US-055 | JTBD-01.1: "It is already connected. The issue is on the case, labelled 'raised against Section 13A employment history', and I did not have to go find it." | **R1** |
| Read the flagged answer in context before I decide | PER-01 | **Epic 7 (F7)** | **US-062** | JTBD-01.1: "I am resolving this on the evidence — the answer is quoted right here, not behind a reference number in another system." | **R1** |
| Complete an action through a form that validates properly | PER-01 | Epic 6 (F6), Epic 14 (F14) | US-052, US-113 | JTBD-01.1: "A validation error tells me which field and puts me on it. My long narrative is still there, word for word." | R1 |
| Be told exactly what changed and in which system | PER-01 | Epic 6 (F6) | US-053 | JTBD-01.3: "The confirmation names the system and says what it now says. It never just says 'Saved'." | R1 |
| Read one history instead of merging four by hand | PER-02, PER-03 | Epic 6 (F6) | US-056 | JTBD-01.3: "One chronology, spoke history and hub records together, with who did it and which system it landed in." | R1 |
| See relationships as references, never as database joins | PER-04 | Epic 9 (F9) | US-080 | JTBD-04.1: "The link between the case and the issue is a reference one system resolves for me — not a shortcut through a shared database." | R1 |
| Do this entire job from the keyboard | PER-01 | Epic 14 (F14) | US-109, US-111, US-112 | JTBD-01.1: "I can reach and operate every step without a mouse, and I can always see where my focus is." | R1 |
| Use the product zoomed, small, and without animation | PER-03, PER-02 | Epic 14 (F14) | US-116 | JTBD-03.1: "It works on my phone and at 200% zoom — no sideways scrolling, nothing lost." | R1 |
| Be told about asynchronous changes without losing my place | PER-01 | Epic 14 (F14) | US-115 | JTBD-01.4: "Something refreshed behind me and I was told — but it did not snatch my cursor out of a half-written narrative." | R1 |
| Know which kind of failure I am looking at | PER-01 | Epic 6 (F6) | US-054 | JTBD-01.3: "'You are not permitted', 'the source is unavailable' and 'your input was invalid' are three different screens with three different ways out." | R2 |
| Complete the action my role exists to perform | PER-02, PER-03 | Epic 6 (F6) | US-057 | JTBD-02.2: "I render a determination, and the change is visible through eApp's own API — not only through the hub that wrote it." | R2 |
| See a different action set than my colleague on the same item | PER-02 | Epic 2 (F2) | US-017 | JTBD-02.2: "I open the same issue Marcus opened, and resolve simply is not offered to me. The server decided that, not the page." | R2 |
| See an unavailable system's screen degrade cleanly | PER-01 | Epic 6 (F6) | US-058 | JTBD-01.4: "The item still opens and tells me which part is missing. It does not hand me a broken page." | R3 |
| Be stopped before starting an action that cannot succeed | PER-01 | Epic 16 (F16) | US-126 | JTBD-01.4: "It tells me now, not after I typed three paragraphs — the action is greyed with a reason I can read." | R3 |

---
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
## NaC Derivation Table

Full traceability, one row per derived criterion. **Outcome** is the canonical JTBD desired outcome (direction + metric + object + context) as written in `JTBD-DCSA-UAL.md`. **Journey Stage** is the stage from `JOURNEYS-DCSA-UAL.md` where that outcome becomes observable. **NaC** is the outcome applied to that stage, in the user's words. Nothing here is invented; every row has a parent.

### PER-01 Marcus Vale — Investigator

| JTBD ID | Outcome | Journey Stage | NaC | Story |
|---|---|---|---|---|
| JTBD-01.1 | Minimize the number of authentication events required to complete a single case-advancing action spanning more than one mission system *(target: one per session)* | JRN-01.01:1 Sign in | "One card, one door — and nothing asks me again for the rest of this session." | US-001, US-002, US-009 |
| JTBD-01.1 | *(same outcome, later stage)* | JRN-01.01:7 Traverse | "I crossed from an eApp case into a PVQ issue and no credential prompt, interstitial, or new tab appeared." | US-061 |
| JTBD-01.1 | Minimize the number of identifiers re-typed or pasted by hand when moving between a questionnaire answer and the issue raised against it *(target: zero)* | JRN-01.01:6 Discover the relationship | "The issue is already on the case, described in words — I never opened my scratch document." | US-060, US-055 |
| JTBD-01.1 | *(same outcome)* | JRN-01.01:7 Traverse | "I typed nothing. No case number, no subject ID, no issue reference, at any step." | US-061 |
| JTBD-01.1 | Minimize the time to reach the related issue from the case that is blocked by it, when the relationship already exists in the data | JRN-01.01:4–6 Open case → Discover | "Two clicks from my queue to the answer under question, and one more to the issue raised against it." | US-059, US-062 |
| JTBD-01.1 | Increase the likelihood that both affected systems reflect a completed action, when the action legitimately changes state in two places | JRN-01.01:9 Dual confirmation | "PVQ says resolved. eApp says the case is clear. Both of them said it — I can read each system's own answer." | US-064, US-065 |
| JTBD-01.1 | *(same outcome, verified outside the hub)* | JRN-01.01:10 Verify on the case | "I called eApp and PVQ directly, with the hub out of the path, and both agree." | US-067, US-077 |
| JTBD-01.1 | Minimize the likelihood of being told an action succeeded when only part of it did, when a coordinated write partially fails | JRN-01.01:9 *(failure path)* | "Half-done is reported as half-done, naming which system changed and which did not, with a retry I can press — and the word 'success' appears nowhere." | US-066 |
| JTBD-01.1 | *(whole-job outcome, accessibility dimension)* | JRN-01.01 end-to-end | "I completed the entire cross-application workflow without a mouse, and focus landed where I expected at every boundary." | US-069, US-109 |
| JTBD-01.1 | *(entitlement precondition of the whole job)* | JRN-01.01:4 Open the case | "Opening this case checked it is *my* case — not merely that investigators may open cases." | US-016, US-021, US-022 |
| JTBD-01.2 | Minimize the number of separate systems consulted to establish what is assigned to me, across a caseload spanning four mission applications | JRN-01.02:3 Open the queue | "One list, with work from at least four of the five systems I own cases in, each row saying which system it came from." | US-040, US-041 |
| JTBD-01.2 | Minimize the time to identify the next item to work, when items originate from systems with different native priority semantics | JRN-01.02:3–5 Queue → commit | "It already sorted it the way I would have — assigned to me, soonest due first — and the ordering is explainable across sources." | US-046, US-043, US-045 |
| JTBD-01.2 | *(same outcome, dashboard on-ramp)* | JRN-01.01:2–3 Orient → Enter | "The item I should work next is two clicks from sign-in." | US-033, US-039 |
| JTBD-01.2 | Increase the proportion of caseload changes that are announced rather than discovered, when something new is raised against a case I own | JRN-01.01:2 Orient | "Nobody had to call me. The issue that sat three days was on my screen the moment I signed in, and it linked straight to the case." | US-119 |
| JTBD-01.2 | Minimize the effort to re-establish working context when returning after an interruption of 10–60 minutes | JRN-01.02:6 Get interrupted, come back | "Forty minutes and a phone call later, my filters, sort, and page are exactly where I left them." | US-047, US-042 |
| JTBD-01.3 | Minimize the time to establish the full history of a work item, when that history spans more than one mission system | JRN-01.01:11 Leave the record | "One chronology — what the spoke recorded and what the hub recorded — with actor, action, time, and which system." | US-056 |
| JTBD-01.3 | Increase the proportion of recorded actions whose confirmation names the affected system and the resulting state | JRN-01.01:9 Dual confirmation | "The confirmation names the system and says what it now says. It never just says 'Saved'." | US-053, US-065 |
| JTBD-01.3 | Minimize the effort to reconstruct a cross-system action as a single narrative, when a case is contested or reviewed after the fact | JRN-01.01:11 Leave the record | "One story, not four rows — case read, traversal, both writes, confirmation — in order, with before and after in plain words." | US-068, US-106 |
| JTBD-01.3 | *(audit as a completion condition)* | JRN-01.01:8–9 Resolve | "If it cannot be written down, it did not happen. I am never told something succeeded that nobody recorded." | US-101, US-083 |
| JTBD-01.4 | Minimize the time to distinguish an empty result from an unavailable source, in an aggregated view spanning five systems | JRN-01.03:2 Read the warning | "'Investigation Management is unavailable — 12 items are not shown.' Named and counted. That is a bounded fact, not a mystery." | US-048, US-127 |
| JTBD-01.4 | Maximize the proportion of the work queue that remains usable and actionable, when a single source system is unavailable | JRN-01.03:3 Keep working the rest | "Four of five sources still render in full and I can still act on them. I used the morning." | US-048, US-073 |
| JTBD-01.4 | *(pre-emptive rather than post-hoc failure)* | JRN-01.03:4 Hit a blocked action | "It told me before I typed three paragraphs, not after — the action is disabled with a reason I can read." | US-126 |
| JTBD-01.4 | Minimize the number of unrecoverable states (error pages, blank screens) encountered, when any spoke degrades | JRN-01.03:5 Check whether it is just him | "Same message on the dashboard and on the item. No blank screen and no stack trace anywhere in the product." | US-130, US-058, US-037 |
| JTBD-01.4 | Minimize the user effort required to resume full function, when a degraded system recovers | JRN-01.03:6–7 Recovery → resume | "It came back on its own. I did not reload and I did not sign in again, and the counts reconcile." | US-132 |
| JTBD-01.4 | *(delivery of the warning must not cost focus)* | JRN-01.03:6 Recovery arrives | "Something refreshed behind me and I was told — but it did not snatch my cursor out of a half-written narrative." | US-115 |

### PER-02 Dana Okonkwo — Adjudicator

| JTBD ID | Outcome | Journey Stage | NaC | Story |
|---|---|---|---|---|
| JTBD-02.1 | Minimize the number of authentication events required to review one subject's complete record, when that record spans four mission systems | JRN-02.01:1–7 Sign in → check the tier | "Questionnaire, issue disposition, designation, case status — four systems, one reading path, one sign-in." | US-011, US-050 |
| JTBD-02.1 | Minimize the time to locate all information bearing on a single subject, when that information lives in more than one mission system | JRN-02.01:4 Follow the issue | "The related-items panel took me to the issue. I did not search, and I did not paste an identifier." | US-055, US-044 |
| JTBD-02.1 | Increase the proportion of on-screen fields whose originating system is identifiable | JRN-02.01:3 Read what was submitted | "I can say, for anything on this screen, which system it came from — and my screen reader says it too, not just a coloured badge." | US-041, US-050, US-114 |
| JTBD-02.1 | Minimize the loss of reading context when traversing from a questionnaire answer to the issue raised against it and back | JRN-02.01:5 Read the disposition and narrative | "I read the investigator's actual narrative with the answer it was raised against still in reach — and came back where I was." | US-056, US-030 |
| JTBD-02.2 | Increase confidence that the actions offered to me are exactly the actions I am entitled to perform, on a work item also handled by other roles | JRN-02.01:6 Notice what she cannot do | "I opened the same issue Marcus opened and 'resolve' is simply not offered to me. The server decided that, not the page." | US-017, US-051 |
| JTBD-02.2 | *(same outcome, enforced rather than presented)* | JRN-03.02:5 / JRN-02.01:6 | "A direct call to the investigator-only action is refused by the server and the refusal is on the record." | US-019, US-146 |
| JTBD-02.2 | Increase the proportion of determinations accompanied by a durable, correlated record naming the actor and their attributes at the time of action | JRN-02.01:8 Render the determination | "The record says what roles and attributes I held at that moment — not what I hold today — and it was written before I was told it worked." | US-102, US-057, US-101 |
| JTBD-02.2 | Minimize the probability that an audit record can be altered or deleted through any application path | JRN-02.01:8–9 | "Sequence numbers and hash chaining, and no path anywhere in the application to edit a record — for anyone, including administrators." | US-104, US-023 |
| JTBD-02.2 | Minimize the effort to reconstruct the sequence of events on a case, when the case is contested after the determination | JRN-02.01:5 / JRN-01.01:11 | "One chain, read months later, tells me what happened across both systems as a single event." | US-068, US-105 |
| JTBD-02.3 | Minimize the time to identify which pending determinations are aging or blocked, in a queue assembled from multiple source systems | JRN-02.02:1 Ask the clock question | "My workspace tells me what is aging and what is blocked. I do not build that report myself." | US-034, US-120 |
| JTBD-02.3 | Increase the proportion of timeliness exceptions surfaced proactively rather than reported retrospectively | JRN-02.02:1–2 | "Every alert count reconciles with what is actually in my queue, and every alert opens the item that produced it." | US-120, US-121, US-039 |
| JTBD-02.3 | Minimize the manual effort required to distinguish "waiting on me" from "waiting on someone else" | JRN-02.02:2–3 Separate mine from theirs / Sort by age | "I can filter to blocked and read what each one is waiting on, and sorting by age is defensible across sources." | US-042, US-043, US-057 |
| JTBD-02.4 | Minimize the probability of rendering a determination on incomplete data, when one or more source systems are degraded | JRN-02.02:5–6 Empty issue list → read which one it is | "An empty issue list and an unreachable PVQ are two different screens. I can always tell which one I am looking at." | US-129, US-049 |
| JTBD-02.4 | Increase the proportion of incomplete views that state explicitly what is missing and why | JRN-02.02:6 Read which one it is | "'Issue data from PVQ is unavailable' — named, in words, never an empty list that reads as 'no issues'." | US-038, US-127, US-124 |
| JTBD-02.4 | Minimize the time to distinguish a genuine absence of records from an unavailable source | JRN-02.02:7 Act on the distinction | "Determination actions that depend on the missing source are disabled with a reason, so I cannot decide blind by accident." | US-126, US-058 |

### PER-03 Renée Ashford — Applicant

| JTBD ID | Outcome | Journey Stage | NaC | Story |
|---|---|---|---|---|
| JTBD-03.1 | Minimize the time to determine current standing in the vetting process, when that standing is derived from more than one government system | JRN-03.01:2 Read where she stands | "I read one sentence on my phone and knew where I stood — inside thirty seconds, without scrolling." | US-035, US-116 |
| JTBD-03.1 | Minimize the number of unexplained internal terms encountered, when reading one's own status as a first-time applicant | JRN-03.01:3 Understand, not decode | "No acronym, no tier code, no system name I had to look up. I never learned that eApp and IEP are different things." | US-035 |
| JTBD-03.1 | Minimize the number of credentials required to see one process end to end | JRN-03.01:1 Get in | "One login from my kitchen, with a code on my phone. Not two." | US-004, US-003 |
| JTBD-03.1 | *(composition differs by role — the same product, a different answer)* | JRN-03.01:2 | "My page looks nothing like the pages the government people use, and that is right — it answers my question, not theirs." | US-035, US-028, US-015 |
| JTBD-03.2 | Minimize the time to identify every outstanding obligation, when obligations are issued by more than one government system | JRN-03.01:4 See what she owes | "A short ordered list with due dates — an obligation, not an inventory of systems." | US-035, US-040 |
| JTBD-03.2 | Minimize the number of steps between learning that something is required and completing it, in a short interrupted session | JRN-03.01:6 Do the thing | "Every task links straight to the thing that discharges it. No dead ends and no 'contact your security officer'." | US-057, US-052 |
| JTBD-03.2 | Minimize the volume of entered information lost to session expiry, when sessions are short and frequently interrupted | JRN-03.01:6 *(interruption path)* | "The doorbell rang, I came back, and everything I had typed was still there." | US-006, US-117, US-113 |
| JTBD-03.2 | Increase the proportion of requests discharged before their due date | JRN-03.01:7–8 Confirmation → see it land | "The confirmation named what was received and what happens next, and the task left my list." | US-053, US-057 |
| JTBD-03.3 | Minimize the likelihood of missing a required notice, when notices are delivered outside the place status is checked | JRN-03.01:5 Read the notice | "The notice was waiting where I check my status. I did not have to find it in a forwarded email." | US-122 |
| JTBD-03.3 | Minimize the time to determine which notices are new since the last visit, in the context of visits weeks apart | JRN-03.01:5 | "Eleven days later I could tell at a glance which ones I had already handled." | US-121, US-122 |
| JTBD-03.3 | *(delivery must not disrupt)* | JRN-03.01:5 | "A new notice was announced to me without stealing my cursor, and it never covered the banner at the top." | US-115, US-123 |
| JTBD-03.4 | Minimize the time to produce evidence of a prior submission, when asked by an employer's security officer | JRN-03.02:1–2 Look for proof → find the entry | "I answered 'did you send that in?' with a dated entry, in under a minute, instead of searching my email." | US-107 |
| JTBD-03.4 | Increase confidence that only one's own records are accessible, in a system serving many applicants | JRN-03.02:3 Check the edges | "There is nothing anywhere on my screens about investigators, findings, or issues raised against my answers — and no URL gets me there." | US-015, US-020 |
| JTBD-03.4 | Minimize the probability that another party can retrieve an applicant's record through any access path | JRN-03.02:4 Wrong subject | "Someone used my session to ask for another applicant's file and was refused by the server — and the refusal does not even reveal whether that file exists." | US-018, US-024 |
| JTBD-03.4 | *(the refusal must itself be on the record)* | JRN-03.02:6 Read the denials | "The refusals are in the trail too, with who asked, for what, and when." | US-103, US-105 |
| JTBD-03.4 | *(a failed sign-in leaks nothing either)* | JRN-03.01:1 Get in | "A failed sign-in tells me it failed, and nothing about whether that account exists." | US-005 |

### PER-04 Priya Raghunathan — Administrator

| JTBD ID | Outcome | Journey Stage | NaC | Story |
|---|---|---|---|---|
| JTBD-04.1 | Minimize the number of code changes, deployments, and service restarts required to add an application, on a running platform | JRN-04.01:7 Review and submit | "Five steps, in the UI, by me — no developer, no pull request, no redeploy, no restart." | US-094, US-070 |
| JTBD-04.1 | Minimize the elapsed time to make a new application's work visible to its users | JRN-04.01:8–9 Watch it come alive → prove the consequence | "Under five minutes, and Marcus — already signed in in the other window — sees its items without signing out." | US-098, US-099 |
| JTBD-04.1 | Minimize the time to discover what a candidate application can do, when the application can describe its own capabilities | JRN-04.01:5 Let it describe itself | "Its work-item types and actions were filled in from its own declaration. I confirmed them; I did not transcribe them." | US-097 |
| JTBD-04.1 | *(fail before committing, not after)* | JRN-04.01:4 Test it before committing | "I found out the endpoint was unreachable before I submitted, and the result was announced, not just coloured." | US-096, US-095 |
| JTBD-04.1 | Minimize the number of teams that must be involved to complete an onboarding | JRN-04.01:1 / JRN-04.02:7 | "Registering and de-registering are both things I do alone, and both are audited. Removing one leaves nothing behind in navigation or the queue." | US-100, US-071, US-074 |
| JTBD-04.2 | Minimize the time to determine the health of every connected application, across six or more independently operated systems | JRN-04.02:1 Start where the truth is | "Healthy, degraded, or unavailable — in words, with the last successful check and the latency — for everything attached, on one screen." | US-086, US-087, US-125 |
| JTBD-04.2 | Increase the proportion of integration failures detected by monitoring rather than by user report | JRN-04.03:3 Watch the monitor catch it | "I learned it from my console, not from an investigator calling to say his queue is empty." | US-036, US-087 |
| JTBD-04.2 | Minimize the delay between an adapter beginning to fail and that failure being visible in the console | JRN-04.03:4 Watch the log fill | "Within one check interval there is a correctly attributed entry naming the application, the operation, and the error class." | US-088, US-131 |
| JTBD-04.2 | Minimize the effort to confirm recovery, when a previously failing application returns to service | JRN-04.03:6 Put it back | "I restored it and it went healthy on its own — and the warning cleared in the other window with no reload and no re-authentication." | US-132, US-090 |
| JTBD-04.3 | Minimize the time to classify a reported failure by cause, for a request that traverses a hub and multiple spokes | JRN-04.02:3 Read the failures | "Spoke outage, misconfiguration, denial, or user error — I can tell which in minutes, from one filterable log." | US-088 |
| JTBD-04.3 | Increase the proportion of failures whose full trace is retrievable by a single identifier | JRN-04.02:4–5 Take the thread → read it as one story | "The ID the user read off their error screen resolved the whole trace in one query — and it is selectable text I can paste into a ticket." | US-089, US-106, US-082 |
| JTBD-04.3 | Minimize the number of separate log sources that must be consulted to trace one user action end to end | JRN-04.02:5 | "Adapter failures, denials, authentication and successful writes are all in the same trail. I never leave the console." | US-103, US-105 |
| JTBD-04.3 | Minimize the time to decide and execute a containment action | JRN-04.02:7 Contain if needed | "Disabling the application took effect immediately in everyone's navigation and queue — no restart — and my own action is audited." | US-071, US-091 |
| JTBD-04.3 | *(verify rather than assume)* | JRN-04.02:4 | "I read the published API documentation and drove the endpoints myself with curl to check the claim." | US-084, US-025 |
| JTBD-04.4 | Minimize the time to produce a complete account of a cross-system user action, in an inquiry or incident review | JRN-04.02:5 Read it as one story | "'Who did what, to what, when' is a record I retrieve, not a reconstruction I assemble." | US-105, US-068, US-014 |
| JTBD-04.4 | Increase the proportion of platform actions — including administrative ones — attributable to a named actor with the attributes held at the time | JRN-04.02:8 Close the loop | "My own console actions are in the trail under my name. Administrators are not exempt, and administering the hub does not get me case content." | US-093, US-023, US-102 |
| JTBD-04.4 | Minimize the probability that an audit record can be altered or deleted through any application path | JRN-04.02:8 | "There is no endpoint that edits or deletes a record, and a test proves the absence rather than asserting it." | US-104, US-148, US-108 |
| JTBD-04.4 | Minimize the time to verify degraded-system behavior, on a platform whose failure modes cannot otherwise be rehearsed | JRN-04.03:2 Break it deliberately | "I take Investigation Management down on purpose, watch the product degrade visibly, and put it back — and the injection itself is audited." | US-131, US-143, US-141 |

---
## Release Planning

The product is a **time-boxed demonstration prototype evaluated live**. That single fact drives the slicing below more than anything else in the PRD. Releases are not feature groupings; they are answers to the question *"if we stopped here and an evaluator walked in, what could they watch happen?"* Each release therefore completes journeys, not feature areas, and R1 is deliberately the thinnest thing that lets an evaluator watch the flagship journey finish.

Risk **R-03 — "scope breadth starves the flagship"** is the risk this slicing exists to manage. 151 stories will compete for finite build time and the centrepiece is the thing that must not be under-polished.

---

### Release R1 — Walking Skeleton: the flagship journey, end to end

> **Theme:** One sign-in, one shell, a case-advancing action that spans eApp and PVQ, and both spokes independently confirming the change. If only one thing is ever demonstrated, it is this.

**Scope test applied to every story in this release:** *is this slice needed for an evaluator to watch JRN-01.01 complete?* If no, it is not in R1. This rule is why there is no adjudicator dashboard, no admin console, no RBAC negative path, no degraded-system behaviour, and no application registration here — all of them are genuinely important, and none of them is on the flagship path.

**Stories (67):**

| Backbone step | Stories |
|---|---|
| Authenticate | US-001, US-002, US-007, US-008, US-009, US-010, US-012, US-014 |
| Orient | US-026, US-027, US-028, US-029, US-033, US-039, US-119 |
| Find work | US-040, US-041, US-042, US-043, US-045, US-046, US-047, US-078 *(eApp/PVQ/IM)*, US-110, US-114, US-133 *(PER-01)*, US-135, US-136, US-137 |
| Work an item | US-015, US-016, US-050, US-051, US-052, US-053, US-055, US-059, US-060, US-062, US-080, US-109, US-111, US-112, US-113, US-115, US-116 |
| Resolve across systems | **US-061, US-063, US-064, US-065, US-066**, US-081, US-083, US-101 |
| Verify & Audit | **US-067, US-068, US-069**, US-056, US-076, US-077, US-102, US-106, US-107, US-145 |
| Administer & Extend | US-070, US-138, US-140 |

**Personas served — who can do meaningful work at the end of R1:**

| Persona | Can do meaningful work? | What they can actually do |
|---|---|---|
| **PER-01 Marcus Vale** | ✅ **Fully** | Signs in once, reads his dashboard and the new-issue alert, works his unified queue across eApp/PVQ/IM with filter, sort, pagination, and return-to-context, opens the blocked case, discovers and traverses to the related PVQ issue, resolves it, sees both systems answer, verifies, and reads the correlated chain — keyboard-only if he chooses. |
| **PER-04 Priya Raghunathan** | ◐ **Partially — as verifier, not as administrator** | Starts the prototype with one command, drives the scripted flagship path, queries each spoke's API directly to prove the dual-system change, and reads the correlated audit chain. She has **no console, no health view, no registration flow** yet. |
| **PER-02 Dana Okonkwo** | ❌ **No** | Can authenticate, but has no adjudicator dashboard, no determination action, and no aging queue. Deliberately deferred to R2. |
| **PER-03 Renée Ashford** | ❌ **No** | Deliberately deferred to R2. Her sign-in method (generic MFA) is itself R2. |

**Journeys demonstrable at the end of R1:**

| Journey | Status | Note |
|---|---|---|
| **JRN-01.01** Clear the blocking issue *(flagship)* | ✅ **Complete, all 11 stages** | Including the partial-completion failure path (US-066) and the keyboard-only pass (US-069). This is the release's reason to exist. |
| **JRN-01.02** Monday-morning triage | ◐ Stages 1–6 | Stage 7 ("a sixth source appears") requires F12 and lands in R3. |
| All others | ❌ Not demonstrable | By design. |

**Slicing justification — why each inclusion earns its place, and each exclusion is safe:**

- **Included: the whole of Epic 7 (US-059…069).** Non-negotiable. This *is* the release.
- **Included: US-070 (registry-driven fan-out), even though registration is R3.** The R1 queue must fan out from a registry rather than a hard-coded list of five systems. If it does not, R3's live registration has nothing to plug into and the extensibility claim becomes a retrofit. The mechanism ships in R1; the UI over it ships in R3.
- **Included: the accessibility stories US-109…116.** Accessibility is a hard federal gate, not polish, and the flagship traversal (stage 7) is the single highest-risk accessibility step in the product. Retrofitting focus management onto a completed traversal is more expensive than building it once.
- **Included: US-136, US-137 (reset and seed validation).** The flagship consumes `ISS-2207`. Without a reset command the demo is single-use, and without seed validation a broken corpus is discovered live rather than at start-up. These are what make the release *rehearsable*, which is a precondition for being demonstrable.
- **Included: US-102, US-106 (actor attributes, chain view) but not US-105 (the full audit viewer).** SM-20 requires the flagship action to render as one correlated chain. The chain view reachable from the item's activity history delivers that; the filterable platform-wide viewer is an administrator surface and waits for R2.
- **Excluded: all RBAC negative paths (US-018…024).** The flagship demonstrates the *positive* authorization path via US-016 (resource-level entitlement on `CASE-A-1042`). The negatives are what make the zero-trust claim credible, but no evaluator needs them to watch the workflow complete. R2.
- **Excluded: all degraded-system behaviour (Epic 16).** An outage is not on the flagship path. Building resilience before the thing being made resilient exists inverts the dependency.
- **Excluded: IEP and PDT depth (US-078 partial).** The flagship touches eApp, PVQ, and IM. PDT and IM appear in the related-items panel as *references* (US-055, US-080) so the cross-system story is more than a single link, but their full domain behaviour waits for R2.

**Deviation from the stated slicing, declared.** The instruction places demo scripts and run instructions in R3. Two F18 stories are pulled forward:

- **US-138 (one command to start)** — a walking skeleton nobody can start is a walking skeleton that scored zero. The charter names this a deliverability constraint.
- **US-140 (the flagship demo script)** — R1's acceptance condition is that an evaluator *watches* the journey complete. The script is the instrument of that observation, not documentation about it.

The remaining five F18 stories (US-139, US-141…144) stay in R3 as instructed.

**Acceptance Gate:**

- [ ] All NaC for the included stories pass, verified in a live run rather than by inspection.
- [ ] JRN-01.01 completes end to end, manually, from the script, in **under three minutes** (SM-01).
- [ ] The audit log contains **exactly one** authentication event for the session (SM-02).
- [ ] `GET {pvq}/issues/ISS-2207` and `GET {eapp}/cases/CASE-A-1042`, called directly against the spokes with the hub out of the path, both return the updated state (SM-03).
- [ ] **Zero** manual re-entry of subject, case, or issue identifiers at any step (SM-04).
- [ ] The whole action is retrievable as a **single correlated chain** (SM-20).
- [ ] The flagship path completes **keyboard-only** in a separate verification pass, with zero serious or critical accessibility violations on the four screens involved (SM-08, SM-07).
- [ ] The queue renders correctly attributed items from **at least three** spokes, with eApp, PVQ, and IM all contributing (partial SM-14 — full four-of-five lands with R2's IEP/PDT depth).
- [ ] The demonstration runs **three times identically** with a reset between runs (SM-22).
- [ ] The synthetic-data banner is present on 100% of reachable routes with no path to hide it (SM-10, R1 routes only).

---
### Release R2 — Role Breadth and Trust

> **Theme:** The same unified layer, composed differently and enforced differently for four roles. This is the release that turns "it works" into "it is credible."

R1 proves the product does one thing extremely well for one persona. An evaluator's next two questions are predictable: *does this compose for anyone other than the investigator?* and *is the zero-trust story enforcement or decoration?* R2 answers both, and it is the release where the other three personas become real.

**Stories (34):**

| Backbone step | Stories |
|---|---|
| Authenticate | US-003, US-004, US-005, US-006, US-011, US-013, US-117 |
| Orient | US-030, US-031, US-034, US-035, US-120, US-121, US-122, US-123 |
| Find work | US-044, US-049, US-078 *(IEP/PDT)*, US-133 *(PER-02…04)*, US-134 |
| Work an item | US-017, US-054, US-057 |
| Resolve across systems | **US-018, US-019, US-020, US-021, US-022, US-023**, US-024, US-082, US-130 |
| Verify & Audit | US-103, US-104, US-105, US-146 |

**Personas served — who can do meaningful work at the end of R2:**

| Persona | Can do meaningful work? | What they can actually do |
|---|---|---|
| **PER-01 Marcus Vale** | ✅ Fully *(unchanged from R1, plus)* | Now sees his own failures classified properly (US-054), can search, and is subject to region and tier checks he can watch being enforced. |
| **PER-02 Dana Okonkwo** | ✅ **Fully** | Signs in, reads a determination-shaped dashboard, works an aging and blocked queue, assembles the whole cross-system record for one subject, sees a **different server-computed action set** on the same issue Marcus resolved, renders a determination, and reads the correlated trail. |
| **PER-03 Renée Ashford** | ✅ **Fully** | Signs in with a code on her phone, reads a plain-language status, discharges an outstanding task, reads a notice where she already looks, proves what she submitted — and is the subject of the headline resource-level denial. |
| **PER-04 Priya Raghunathan** | ◐ **Partially — as auditor, not yet as operator** | Gains the filterable platform-wide audit viewer and can read denials and authentication events. Still has **no inventory, no health view, no error log, no registration flow**. |

**Journeys demonstrable at the end of R2:**

| Journey | Status | Note |
|---|---|---|
| JRN-01.01 *(flagship)* | ✅ Complete | Held stable; US-146 now regression-tests its authorization assumptions. |
| JRN-01.02 Monday-morning triage | ◐ Stages 1–6 | Stage 7 still needs F12 (R3). |
| **JRN-02.01** Assemble and determine | ✅ **Complete, all 9 stages** | Including stage 6 — the side-by-side action-set difference, the clearest live RBAC demonstration in the product. |
| **JRN-02.02** Aging queue and missing data | ◐ Stages 1–4, 7 | Stages 5–6 (the empty-vs-degraded distinction) need F16 and land in R3. |
| **JRN-03.01** Where do I stand, what do I owe | ✅ **Complete, all 8 stages** | On a 320px viewport. |
| **JRN-03.02** Proof and boundary | ✅ **Complete, all 6 stages** | Including the live curl denials and reading them back out of the audit viewer. |

**Slicing justification:**

- **The three remaining dashboards (US-034, US-035, US-036) do not all land here.** US-034 and US-035 do, because PER-02 and PER-03 are mission users whose journeys are the point of this release. US-036 — the administrator dashboard — is held to R3 because it is an *operations* surface with nothing to display until the console, health monitor, and error log exist behind it. Shipping it in R2 would mean shipping empty widgets, which the PRD forbids ("empty states are designed, not blank"; "no placeholder screens").
- **All six negative-path stories (US-018…023) land together, not piecemeal.** A zero-trust claim demonstrated for one boundary and not the others invites exactly the question you cannot answer on stage. They ship as a set, with US-024 (the consistent non-enumerable error contract) and US-082 (the uniform error shape) alongside them, because a denial that leaks through an inconsistent error shape is not a denial.
- **US-130 (global error boundary) is pulled from Epic 16 into R2**, ahead of the rest of resilience. Justification: R2 triples the reachable surface area — three new dashboards, a determination form, an applicant portal, and six deliberate denial paths. The guarantee "never a blank page, never a stack trace" has to land with the surfaces it protects, not a release later. The *degraded-system* stories it is normally grouped with stay in R3, because those depend on the health monitor.
- **US-105 (audit viewer) lands here rather than R3** even though it is an administrator screen, because JRN-03.02 stage 6 — reading the curl denials back out of the trail — is the closing beat of the zero-trust demonstration. Without it the denial is asserted rather than shown.
- **US-078 completes (IEP and PDT domain depth) and US-133 completes (seed breadth for all four personas).** This is what raises the queue from three contributing spokes to four-of-five and satisfies SM-14 properly.
- **Deferred deliberately:** everything operational. No health, no error log, no failure injection, no registration. An evaluator who has watched R1 and R2 has seen a complete, credible, multi-role product that cannot yet be *operated* — which is precisely the gap R3 closes.

**Acceptance Gate:**

- [ ] All NaC for the included stories pass.
- [ ] All four personas produce a **visibly different, fully populated dashboard** with no empty or placeholder widget — except the administrator dashboard, which is explicitly out of scope until R3 (F4 acceptance signal, partial).
- [ ] PER-01 and PER-02 open **the same PVQ work item** and are presented with **different, server-computed action sets** (SM-18, F2 acceptance signal).
- [ ] An authenticated Applicant calling an investigator-only endpoint, **and** calling a legitimate endpoint with another subject's resource ID, is denied server-side with a **byte-identical non-enumerable error**, and both denials appear in the audit trail (SM-18).
- [ ] The queue renders correctly attributed items from **at least four of five** spokes (SM-14).
- [ ] Every navigation item, for every one of the four roles, resolves to a real, populated page (partial SM-05 — full crawl verification is R3).
- [ ] No blank page and no stack trace is reachable from any route, for any role (SM-06, partial).
- [ ] Automated accessibility scan across all R1 and R2 routes reports zero serious or critical violations (SM-07, partial).
- [ ] JRN-01.01 still completes in under three minutes and still writes exactly one authentication event — **regression gate, run every release**.

---
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
## Coverage Analysis

### Persona Coverage

Who can do **meaningful work** — not merely sign in — at the end of each release.

| Persona | R1 | R2 | R3 |
|---|---|---|---|
| **PER-01** Investigator | ✅ **Full.** Flagship journey end to end, plus triage. 44 stories. | ✅ Full + failure classification, search, region/tier enforcement. +5 | ✅ Full + degradation, recovery, sixth source in an open session. +8 |
| **PER-02** Adjudicator | ❌ None. Authentication only; no dashboard, no determination. | ✅ **Full.** Determination journey and the action-set difference. +12 | ✅ Full + the empty-vs-degraded distinction her risk profile depends on. +4 |
| **PER-03** Applicant | ❌ None. Her sign-in method itself is R2. | ✅ **Full.** Status, task, notice, proof, and the headline denial. +11 | ✅ Full + designed empty states, accessibility statement. +3 |
| **PER-04** Administrator | ◐ **Partial — verifier only.** Starts the prototype, drives the script, queries spokes directly, reads the chain. No console. | ◐ Partial — gains the filterable audit viewer. Still no operations surface. +5 | ✅ **Full.** Inventory, health, error log, registration, failure injection, announcements. +34 |

**Deliberate R1 exclusion.** Two of four personas cannot work at the end of R1. That is the cost of the walking-skeleton rule and it is paid knowingly: an R1 that served all four personas thinly would be an R1 in which the flagship journey was not yet reliable, and the flagship journey is the only thing the charter says must work.

---

### JTBD Coverage

| JTBD ID | Persona | First addressed | Stories carrying it | NaC derived |
|---|---|---|---|---|
| **JTBD-01.1** *(flagship)* | PER-01 | **R1** | US-001, US-002, US-009, US-016, US-021, US-022, US-055, US-059…US-069, US-077, US-109 | **10** |
| JTBD-01.2 | PER-01 | R1 | US-033, US-039, US-040…US-047, US-119 | 5 |
| JTBD-01.3 | PER-01 | R1 | US-053, US-056, US-068, US-083, US-101, US-106 | 4 |
| JTBD-01.4 | PER-01 | R2 *(US-130)* → **R3** | US-037, US-048, US-058, US-073, US-115, US-126, US-127, US-128, US-130, US-132 | 6 |
| JTBD-02.1 | PER-02 | R2 | US-011, US-030, US-041, US-044, US-050, US-055, US-056, US-114 | 4 |
| JTBD-02.2 | PER-02 | R2 | US-013, US-017, US-019, US-051, US-057, US-101, US-102, US-104, US-105, US-146 | 5 |
| JTBD-02.3 | PER-02 | R2 | US-034, US-039, US-042, US-043, US-057, US-120, US-121 | 3 |
| JTBD-02.4 | PER-02 | R2 *(US-049)* → **R3** | US-038, US-049, US-058, US-124, US-126, US-127, US-129 | 3 |
| JTBD-03.1 | PER-03 | R2 | US-003, US-004, US-015, US-028, US-035, US-116 | 4 |
| JTBD-03.2 | PER-03 | R2 | US-006, US-052, US-053, US-057, US-113, US-117 | 4 |
| JTBD-03.3 | PER-03 | R2 | US-115, US-121, US-122, US-123 | 3 |
| JTBD-03.4 | PER-03 | R1 *(US-007, US-015, US-107)* → **R2** | US-005, US-007, US-015, US-018, US-020, US-024, US-103, US-105, US-107 | 5 |
| **JTBD-04.1** *(extensibility)* | PER-04 | R1 *(US-070, US-076, US-080, US-136, US-138, US-140)* → **R3** | US-070, US-071, US-074, US-094…US-100, US-147 | 5 |
| JTBD-04.2 | PER-04 | R1 *(US-137, US-145)* → **R3** | US-036, US-086, US-087, US-090, US-125, US-131, US-132, US-149, US-151 | 4 |
| JTBD-04.3 | PER-04 | R2 *(US-082)* → **R3** | US-025, US-082, US-084, US-088, US-089, US-091, US-103, US-105, US-139, US-144 | 5 |
| JTBD-04.4 | PER-04 | R1 *(US-014, US-081)* → **R3** | US-014, US-023, US-081, US-093, US-102, US-103, US-104, US-108, US-131, US-141, US-143, US-148 | 4 |

**All 16 jobs are addressed.** 74 NaC derived across them. The flagship job JTBD-01.1 carries 10 — the heaviest derivation in the map, which is correct: it is the job with the most stages, the most failure modes, and the most at stake in a live evaluation.

---

### PRD Feature Coverage — F0 through F19

Every PRD feature appears in at least one epic and at least one release. Epic numbering deliberately matches PRD feature numbering, so a feature can never drift from its epic.

| Feature | Epic | Stories | First release | Complete by | Backbone step(s) where it is observable |
|---|---|---|---|---|---|
| F0 Simulated Multi-Method MFA | Epic 0 | US-001…008 | **R1** | R2 | Authenticate |
| F1 Unified Session and SSO | Epic 1 | US-009…014 | **R1** | R2 | Authenticate · Resolve across systems |
| F2 RBAC/ABAC Server-Side | Epic 2 | US-015…025 | **R1** | R3 | Work an item · Resolve across systems |
| F3 Unified Navigation Shell | Epic 3 | US-026…032 | **R1** | R3 | Orient · Verify & Audit |
| F4 Role-Specific Dashboards | Epic 4 | US-033…039 | **R1** | R3 | Orient |
| F5 Unified Work Queue | Epic 5 | US-040…049 | **R1** | R3 | Find work |
| F6 Work-Item Detail and Action | Epic 6 | US-050…058 | **R1** | R3 | Work an item |
| **F7 Flagship Cross-App Workflow** | **Epic 7** | **US-059…069** | **R1** | **R1** | Work an item · **Resolve across systems** · Verify & Audit |
| F8 Adapter Framework and Registry | Epic 8 | US-070…075 | **R1** | R3 | Administer & Extend |
| F9 Five Simulated Spoke Services | Epic 9 | US-076…080 | **R1** | R3 | Find work · Work an item · Verify & Audit |
| F10 Unified Layer API (BFF) | Epic 10 | US-081…085 | **R1** | R3 | Resolve across systems · Verify & Audit |
| F11 Administrator Console | Epic 11 | US-086…093 | R3 | R3 | Administer & Extend |
| F12 Application Registration | Epic 12 | US-094…100 | R3 | R3 | Administer & Extend |
| F13 Immutable Audit Trail | Epic 13 | US-101…108 | **R1** | R3 | Verify & Audit |
| F14 USWDS Accessible Interface | Epic 14 | US-109…118 | **R1** | R3 | Work an item · Find work · Verify & Audit |
| F15 Notifications and Announcements | Epic 15 | US-119…124 | **R1** | R3 | Orient |
| F16 Health, Resilience, Degraded UX | Epic 16 | US-125…132 | R2 *(US-130)* | R3 | Administer & Extend · Find work · Work an item |
| F17 Synthetic Seed Data | Epic 17 | US-133…137 | **R1** | R2 | Find work |
| F18 Demo Operability | Epic 18 | US-138…144 | **R1** *(US-138, US-140)* | R3 | Administer & Extend |
| F19 Test and A11y Verification | Epic 19 | US-145…151 | **R1** *(US-145)* | R3 | Verify & Audit |

✅ **F0–F19: 20 of 20 covered.** No feature is unmapped, and no feature appears only as a label — each has named stories and a named release.

---

### Journey Coverage

Every journey is covered by stories in some release, and every journey is complete by R3.

| Journey | Persona | Demo segment | R1 | R2 | R3 |
|---|---|---|---|---|---|
| **JRN-01.01** Flagship issue resolution | PER-01 | **1 — primary** | ✅ **Complete (11/11)** | ✅ regression | ✅ regression |
| JRN-01.02 Monday-morning triage | PER-01 | 3b | ◐ 6/7 | ◐ 6/7 | ✅ **Complete (7/7)** |
| JRN-01.03 Keep working while IM is down | PER-01 | 2a | — | — | ✅ **Complete (7/7)** |
| JRN-02.01 Assemble and determine | PER-02 | 4 | — | ✅ **Complete (9/9)** | ✅ |
| JRN-02.02 Aging queue, missing data | PER-02 | 2c | — | ◐ 5/7 | ✅ **Complete (7/7)** |
| JRN-03.01 Where I stand, what I owe | PER-03 | 5a | — | ✅ **Complete (8/8)** | ✅ |
| JRN-03.02 Proof and boundary | PER-03 | 5b | — | ✅ **Complete (6/6)** | ✅ |
| JRN-04.01 Register the sixth application | PER-04 | 3a | — | — | ✅ **Complete (9/9)** |
| JRN-04.02 Triage an integration failure | PER-04 | 6 | — | — | ✅ **Complete (8/8)** |
| JRN-04.03 Rehearse degradation | PER-04 | 2b | — | — | ✅ **Complete (6/6)** |

✅ **10 of 10 journeys covered.** ✅ **78 of 78 journey stages have at least one story.**

**Demonstration-path readiness by release:**

| Release | Demo segments runnable |
|---|---|
| R1 | Segment 1 *(the thesis)* |
| R2 | Segments 1, 4 *(role-level zero trust)*, 5a, 5b *(resource-level zero trust)* |
| R3 | **All six segments** — 1 thesis, 2 resilience, 3 extensibility, 4 role-level, 5 resource-level, 6 accountability |

---

### Story Placement Integrity

| Check | Result |
|---|---|
| Stories in `UserStories-DCSA-UAL.md` | 151 |
| Stories placed on the map | **151** |
| Activity rows in the matrix | 135 |
| Stories owned by exactly one activity row | 148 |
| Stories appearing in a second row, marked *(shared)* | 3 — US-061, US-067, US-107 |
| **Orphan stories** (not mapped to any backbone step) | **0** |
| Backbone steps with no stories | 0 of 7 |
| Release totals *(distinct stories)* | R1 **67** · R2 **34** · R3 **50** = 151 |
| Stories whose acceptance splits across two releases | 3 — US-078, US-107, US-133 |

> **On the three shared rows.** US-061 (traverse) and US-067 (verify) each carry two distinct user-observable claims at the same journey stage — *"no login prompt"* and *"no identifier re-typed"*; *"the case is clean"* and *"I checked outside the hub"*. US-107 is self-scoped activity history, which PER-01 uses in R1 (recent activity on the flagship chain) and PER-03 uses in R2 (proving a submission). Splitting them into separate rows keeps each NaC atomic and testable. Each story is still owned by exactly one release-defining row; the second row is marked *(shared)* and adds no new scope.

---

### Gap Analysis

**No blocking gaps.** Every PRD feature, every journey, every JTBD, and every story is accounted for. The findings below are honest disclosures, not omissions.

**1. Seven stories have no JTBD ancestor and are parented to a PRD product principle (`PRIN-nn`).**
US-008, US-027, US-032, US-118, US-123, US-135, US-150. These carry the PRD's product principles — *Honest demo*, *Synthetic data only*, *Every button works* — which are **agency- and evaluator-facing obligations, not user jobs.** No persona's desired outcome is "see a synthetic-data banner." Rather than fabricate a JTBD parent for them, their NaC is derived from the named PRD principle and flagged. **PRD §3 now assigns those principles stable IDs (`PRIN-01`…`PRIN-06`), so these seven citations resolve to a real parent rather than to a prose label** — US-008, US-027, US-118 and US-123 → `PRIN-06` (Honest demo); US-135 → `PRIN-06`; US-032 and US-150 → `PRIN-03` (Every button works). This remains a deliberate modelling decision; if a future revision of `JTBD-DCSA-UAL.md` adds an evaluator or agency persona, these seven should be re-parented to it.

**2. Two personas do no meaningful work at the end of R1.**
PER-02 and PER-03 are excluded from R1 by the walking-skeleton rule. Consequence to manage: **if the build stops after R1, the RBAC/ABAC story is unproven**, because the clearest demonstration of it (US-017 — the same work item, two roles, two action sets) requires PER-02 to exist. R2 is therefore not optional for a credible evaluation; it is the release where the zero-trust claim stops being architecture and starts being evidence.

**3. PER-04's journeys are all in R3 — the single largest release.**
Both architectural claims land in the last increment. This is unavoidable (F12 and F16 depend on everything before them) but it is the map's principal schedule risk: **R3 carries 50 stories and 5 of the 10 journeys.** Mitigation: US-070 (registry-driven fan-out) ships in R1 so the registry seam is exercised from the start; US-145 (flagship regression test) ships in R1 so R3's breadth cannot silently break R1's depth; and R3 now carries an **internal ordering gate** (see R3 §Internal ordering gate) sequencing operability before extensibility with a checkpoint between, so a truncated R3 still leaves the platform operable and Segments 2 and 6 demonstrable.

**4. JRN-01.02 stage 7 and JRN-02.02 stages 5–6 are stranded until R3.**
Both journeys are *mostly* demonstrable from R1/R2 but cannot be walked end to end until R3. This is deliberate — stage 7 is the *consequence* of registration and stages 5–6 are the *consequence* of the health monitor — but rehearsal scripts should not claim these journeys as complete before R3.

**5. `US-078` and `US-133` are split across releases.**
Spoke domain depth (IEP, PDT) and seed breadth (PER-02…04) legitimately land in two increments. Each is one story with two release cells, not two stories. Build tracking should treat these as split-acceptance rather than re-open them as new stories.

**6. Carried forward from upstream — persona/seed name reconciliation. ✅ RESOLVED.**
**Closed.** The FRD seed corpus (`FR-F17-02`) has been reconciled to the design personas — PER-01 Marcus Vale, PER-02 Dana Okonkwo, PER-03 Renée Ashford, PER-04 Priya Raghunathan — with the binding asserted at seed time (`FR-F17-02` AC-3, `FR-F17-10`). This map continues to use **roles and stable record references** (`EAPP:CASE-A-1042`, `PVQ:ISS-2207`, `SUBJ-00418`, `CVS`) and so remains immune to any future renaming.

---
## NaC-to-Acceptance-Criteria Mapping

The NaC in this map is the user's sentence. The acceptance criteria in `UserStories-DCSA-UAL.md` are the builder's test. This table verifies they describe the same thing — that nothing is promised here which the stories do not already commit to, and that no story's criteria have drifted from the outcome that justified them. AC text is quoted from the source document.

### Release R1 — the flagship path

| NaC | Story | AC from UserStories | Aligned? |
|---|---|---|---|
| JTBD-01.1: "One card, one door — and nothing asks me again for the rest of this session." | US-009 | *"Given I have signed in once, when I open at least one work item from each of the five spokes in a single session, then no login screen, credential prompt, or interstitial appears at any point."* · *"…then exactly one `AUTH_SUCCESS` record exists."* | ✅ Yes |
| JTBD-01.2: "Nobody had to call me. The issue that sat three days was on my screen the moment I signed in." | US-119 | *"Given an alert is generated, when it renders, then it carries a severity as text plus icon, a title, a message, the source system badge, a generated date, and a direct link to the item that produced it."* | ✅ Yes |
| JTBD-01.2: "Forty-one open, four overdue, one new issue — I did not have to assemble that from three systems and memory." | US-033 | *"Given 'My assigned work' renders, when I read it, then it shows a total plus a per-source-system breakdown covering at least four of the five spokes, each labelled with its source system and linking into the queue pre-filtered to that system."* | ✅ Yes |
| JTBD-01.2: "One list, with work from at least four of the five systems I own cases in." | US-040 | *"Given I open the work queue, when it renders, then it contains correctly attributed items originating from at least four of the five spokes."* | ✅ Yes — **note:** R1's gate accepts three contributing spokes (eApp/PVQ/IM); the story's full four-of-five bar is met in R2 with US-078/US-133. Split-acceptance, recorded. |
| JTBD-02.1: "I can say, for any row on this screen, which system it came from — and my screen reader says it too." | US-041 | *"Given any queue row, when it renders, then the source system appears as a text label from the registry with an accompanying icon — never colour-only and never icon-only."* · *"…then it announces 'Source system: {display name}'."* | ✅ Yes |
| JTBD-01.1: "The blocked case is on page one of my normal queue." | US-059 | *"Given I sign in and open the work queue at its default view, when page one renders, then `EAPP:CASE-A-1042` is present without my applying any filter."* | ✅ Yes |
| JTBD-01.1: "It is already connected. The issue is on the case, labelled 'raised against Section 13A employment history', and I did not have to go find it." | US-060 | *"Given the related-items panel resolves, when I read the PVQ entry, then it is labelled 'Issue raised against Section 13A — Employment history', badged PVQ…"* · *"Given that label, when I trace its origin, then it comes from PVQ's own record rather than being composed by the UI."* | ✅ Yes — the AC goes further than the NaC by requiring the label be *sourced*, not composed. Correct direction. |
| JTBD-01.1: "No login. No new tab. No 'you are now leaving this application'. The trail still knows which case I came from." | US-061 | *"…it renders inside the same shell with the header, banner, and navigation remaining mounted throughout — no new tab, no window, no iframe, no redirect to a spoke origin."* · *"…the breadcrumb reads `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207`."* | ✅ Yes |
| JTBD-01.1: "I typed nothing. No case number, no subject ID, no issue reference, at any step." | US-061 | *"Given the traversal completes, when I count what I typed, then I typed nothing — no identifier was entered, copied, or pasted at any point."* | ✅ Yes — verbatim intent |
| JTBD-01.1: "Before I submit, the panel tells me this will update PVQ *and* eApp." | US-063 | *"Given the form renders, when I read the action panel, then it states 'This updates PVQ and eApp.' **before** I submit."* | ✅ Yes |
| JTBD-01.1: "One submission updated both systems correctly, or it changed nothing at all." | US-064 | *"…then it authorises both legs before writing anything — a principal authorised for one leg but not the other is denied outright."* · *"Given the PVQ write fails, when the hub responds, then no eApp call is attempted and the message states unambiguously that nothing changed."* | ✅ Yes |
| JTBD-01.1: "PVQ says resolved. eApp says the case is clear. Both of them said it — the middle layer did not say it on their behalf." | US-065 | *"Given that table renders, when I inspect its data, then each row shows a **fresh re-read** from the owning spoke rather than the value the hub intended to write."* | ✅ Yes — this AC is the precise mechanical form of the NaC |
| JTBD-01.1: "Half-done is reported as half-done… and the word 'success' appears nowhere on that screen." | US-066 | *"Given PVQ has committed and the eApp write fails, when the response returns, then the outcome is reported as partially completed and the word 'success' appears nowhere on the screen."* | ✅ Yes |
| JTBD-01.1: "I called eApp and PVQ directly, with the hub out of the path, and both agree." | US-067 | *"Given an operator token issued for the demonstration, when I `curl` the PVQ and eApp APIs directly, then both return the updated state without the hub in the path."* | ✅ Yes |
| JTBD-01.3: "One story, not four rows — case read, traversal, both writes, confirmation — with before and after in plain words." | US-068 | *"…then it contains at least five records covering the case read, the related-item resolution, the traversal, the issue read, both writes, and the completion."* · *"…a plain-language before/after summary such as 'status: Open → Resolved — Substantiated' and 'outstanding issues: 1 → 0'."* | ✅ Yes |
| JTBD-01.1: "I completed the entire workflow without a mouse, and focus landed where I expected at every boundary." | US-069 | *"…every step is reachable and operable with Tab, Shift-Tab, Enter, Space, arrow keys, and Escape."* · *"Given I move between screens, when each loads, then focus lands predictably on the new page's heading."* | ✅ Yes |
| JTBD-01.3: "If it cannot be written down, it did not happen." | US-101 | *"Given the audit store is unavailable, when I attempt an action, then it is reported as not completed — the system never returns success for an unaudited action."* | ✅ Yes |
| JTBD-01.1: "Opening this case checked it is *my* case." | US-016 | *(Epic 2, F2 — resource-level entitlement check on fetch of a specific record)* | ✅ Yes |
| `PRIN-06` (Honest demo): "Nothing on this screen lets me believe a certificate was actually validated." | US-002, US-008 | *"Given the picker is open, when I read any row, then it carries the marker '(synthetic certificate)'."* · issuer `DEMO-DOD-CA-59 (synthetic)`, serial beginning `00:DEMO:` | ✅ Yes — **no JTBD parent** by design; see Gap Analysis item 1 |

### Release R2 — role breadth and trust

| NaC | Story | AC from UserStories | Aligned? |
|---|---|---|---|
| JTBD-03.1: "I read one sentence on my phone and knew where I stood — no acronym, no tier code." | US-035 | *"Given 'Where you are' renders, when I read it, then a step indicator shows Submitted → Under review → Information requested → Complete with the current step marked in **text** as well as visually, plus a one-sentence explanation of that step."* | ✅ Yes |
| JTBD-02.2: "I opened the same issue Marcus opened and 'resolve' is simply not offered to me. The server decided that, not the page." | US-017 | *(Epic 2, F2 — server-computed action set differing by principal on the same work item)* | ✅ Yes |
| JTBD-03.4: "Someone used my session to ask for another applicant's file and was refused — and the refusal does not reveal whether that file exists." | US-018 | *"…then I receive HTTP 403 `AUTHZ_DENIED` from the server, not a filtered empty page."* · *"…then the two responses are byte-identical apart from the correlation ID — status, code, message, and shape all match."* | ✅ Yes — the AC is stronger (byte-identical), which is the right form of the claim |
| JTBD-02.2: "The record says what roles and attributes I held at that moment — not what I hold today." | US-102 | *"Given a role or attribute changes after an action, when I read the historical record, then it still shows what the actor held at the time."* | ✅ Yes |
| JTBD-02.2: "I render a determination, and the change is visible through eApp's own API." | US-057 | *"Given a case awaiting determination, when I record a determination, then the change persists and is visible through eApp's own API independently of the hub."* | ✅ Yes |
| JTBD-04.4: "'Who did what, to what, when' is a record I retrieve, not a reconstruction I assemble." | US-105 | *"Given I filter by actor, role, action type, target system, resource, outcome, correlation ID, or date range, when results return, then the filters combine correctly and appear as removable chips…"* | ✅ Yes |
| JTBD-03.3: "The notice was waiting where I check my status." | US-122 | *"Given an announcement targets my role and is currently effective, when I sign in, then it appears in a dedicated region below the header using the site-alert pattern matching its severity."* | ◐ **Partial — flagged.** US-122's criteria cover *announcements*; the *notice* half of JTBD-03.3 (per-applicant, retained, unread state) is carried by US-121 and the IEP notices surface in US-035. Not a gap, but the two should be verified together in the JRN-03.01 stage-5 pass. |

### Release R3 — extensibility and operability

| NaC | Story | AC from UserStories | Aligned? |
|---|---|---|---|
| JTBD-04.2: "Healthy, degraded, or unavailable — in words, with last successful check and latency — before the phone rings." | US-087 | *"…it summarises counts of healthy, degraded, and unavailable as text plus icon, and lists per-application current status, last successful check, last attempt, current latency, rolling p50/p95, consecutive failure count, circuit state, and next scheduled probe."* | ✅ Yes |
| JTBD-04.1: "Five steps, in the UI, by me — no developer, no pull request, no redeploy, no restart." | US-094 | *"…it presents five steps — Identity, Connection, Test connection, Capabilities, Access and review — with a step indicator, `aria-current=\"step\"` on the active step, and a text counter reading 'Step 3 of 5'."* | ✅ Yes |
| JTBD-04.1: "Under five minutes, and Marcus — already signed in in the other window — sees its items without signing out." | US-098 | *"Given an Investigator is already signed in in another browser, when their registry version next polls within thirty seconds, then their navigation and queue update to include the new application **without signing out, reloading, or re-authenticating**."* | ✅ Yes |
| JTBD-01.4: "'Investigation Management is unavailable — 12 items are not shown.' Named and counted." | US-048, US-127 | *"…shows a warning naming the system and quantifying the gap — 'Investigation Management is unavailable — 12 items are not shown. The rest of your work is up to date.'"* · *"Given no prior successful count exists, when the notice renders, then the number is omitted rather than guessed."* | ✅ Yes — the second AC is the honest edge case the NaC implies |
| JTBD-01.4: "Four of five sources still render in full and I can still act on them." | US-048 | *"Given a source is down, when the queue renders, then no error page appears anywhere in the application and the remaining items stay actionable."* | ✅ Yes |
| JTBD-01.4: "It came back on its own. I did not reload and I did not sign in again." | US-132 | *"Given my client is polling, when the change is detected within thirty seconds, then the degraded notice clears, affected actions are re-enabled, and a polite announcement offers a refresh control."* | ✅ Yes |
| `PRIN-03` (Every button works): "A crawl of every navigation item for every role finds a real, populated page." | US-032, US-150 | *(Epic 3 / Epic 19 — automated crawl across all roles, zero 404s, zero placeholder screens, zero non-functional controls)* | ✅ Yes — **no JTBD parent** by design |

### Summary

| Check | Result |
|---|---|
| NaC statements derived | 74 |
| NaC traceable to a JTBD desired outcome | 68 (92%) |
| NaC derived from a PRD product principle instead *(disclosed)* | 6 cells / 7 stories (8%) |
| Sampled NaC↔AC pairs verified | 32 |
| Fully aligned | 31 |
| Partially aligned and flagged | 1 *(JTBD-03.3 / US-122 — verify with US-121 and US-035)* |
| Misaligned or contradictory | **0** |
| NaC with no story to carry it | **0** |
| Stories with no NaC | **0** |

**Conclusion.** The map promises nothing the stories do not already commit to. One pairing (JTBD-03.3) is split across three stories and should be verified as a set rather than singly; it is flagged rather than closed.

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-09-15*
*DEMO — SYNTHETIC DATA ONLY. No real DCSA data, no real PII, no real system connections.*
