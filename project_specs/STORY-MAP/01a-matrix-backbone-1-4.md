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
