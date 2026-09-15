
## Journey-to-JTBD Traceability

Every journey stage below maps to the job it serves and the outcome that must be observable in a live synthetic-data demonstration. Stage names are abbreviated; full text is in each journey's stage table.

| Journey Stage | JTBD ID | Expected Outcome |
|---------------|---------|------------------|
| JRN-01.01:Sign in | JTBD-01.1 | One authentication event serves the entire cross-system workflow; the audit log shows exactly one (SM-02) |
| JRN-01.01:Orient | JTBD-01.2 | A newly raised PVQ issue on a case he owns is **announced**, not discovered late, and links directly to the item |
| JRN-01.01:Discover relationship | JTBD-01.1 | The issue raised against a questionnaire answer is visible **on the case**, explained in words, resolved live rather than hard-coded |
| JRN-01.01:Traverse | JTBD-01.1 | Traversal happens inside the same shell with case context carried in the breadcrumb — no interstitial, no new tab, no credential prompt |
| JRN-01.01:Resolve | JTBD-01.1 | Disposition and narrative persist as a real action, re-authorized server-side at execution against **both** target resources |
| JRN-01.01:Dual confirmation | JTBD-01.1 | Both spokes independently return the updated state through their own APIs; a partial write is never reported as success (SM-03) |
| JRN-01.01:Leave the record | JTBD-01.3 | The whole action is retrievable as a **single correlated chain**, with exactly one audit record per state change (SM-19, SM-20) |
| JRN-01.02:Open the queue | JTBD-01.2 | One queue spanning at least four of five spokes replaces three per-system lists; default view answers "what first" (SM-14) |
| JRN-01.02:Narrow | JTBD-01.2 | Filtering and sorting are server-scoped, explainable across sources, and announce result count and sort state |
| JRN-01.02:Return from interruption | JTBD-01.2 | Filters, sort, and page survive a 10–60 minute interruption without rebuilding |
| JRN-01.02:New source appears | JTBD-04.1 | A newly registered application reaches an **open session** without sign-out or reload (SM-12) |
| JRN-01.03:Read the warning | JTBD-01.4 | Degradation **names the application and quantifies the gap**; never a blank screen and never an error page (SM-15, NFR-10) |
| JRN-01.03:Keep working | JTBD-01.4 | Remaining sources render fully and remain actionable while one spoke is down (SM-16) |
| JRN-01.03:Blocked action | JTBD-01.4 | Actions targeting an unavailable spoke are pre-emptively disabled with an explanation rather than failing mid-submission |
| JRN-01.03:Recovery | JTBD-01.4 | The warning clears and data returns **without reload or re-authentication** (SM-17) |
| JRN-02.01:Read what was submitted | JTBD-02.1 | The questionnaire as submitted is reachable in the same path as everything else bearing on the subject |
| JRN-02.01:Follow the issue | JTBD-02.1 | Cross-system relationships resolve inline; traversal replaces four searches and four logins (SM-02, SM-04) |
| JRN-02.01:Read the narrative | JTBD-02.1 | The investigator's **disposition and narrative** are visible, not merely that an issue existed and closed |
| JRN-02.01:Notice what she cannot do | JTBD-02.2 | The same work item presents a **different, server-computed action set** per principal; a direct API call to the investigator-only action is denied and audited (SM-18) |
| JRN-02.01:Render determination | JTBD-02.2 | Exactly one audit record, written before the success response, naming actor and the attributes held at the time (SM-19) |
| JRN-02.02:Ask the clock question | JTBD-02.3 | Aging and blocked determinations are surfaced continuously, each alert resolving to a real populated destination (SM-06, SM-24) |
| JRN-02.02:Sort by age | JTBD-02.3 | Date semantics are consistent across sources, so a sorted list is defensible |
| JRN-02.02:Empty issue list | JTBD-02.4 | A genuine absence and an unreachable source are **two different screens**, distinguishable visually and non-visually |
| JRN-02.02:Read which one it is | JTBD-02.4 | With PVQ offline, a specific named warning appears and **no empty issue list** is presented (SM-15, NFR-10) |
| JRN-03.01:Read where she stands | JTBD-03.1 | "Where am I" answered within 30 seconds on a 320px viewport, as one process rather than two system statuses (SM-25, NFR-16) |
| JRN-03.01:Understand, not decode | JTBD-03.1 | Zero internal system names, tier codes, or state abbreviations without plain-language explanation |
| JRN-03.01:See what she owes | JTBD-03.2 | A short, ordered, unambiguous task list with due dates — not a systems inventory |
| JRN-03.01:Do the thing | JTBD-03.2 | **100% of tasks link directly to the action that discharges them**; nothing is lost to a session timeout (SM-06, NFR-14) |
| JRN-03.01:Confirmation | JTBD-03.2 | The confirmation names what was received and what happens next, then appears in her own history |
| JRN-03.01:Read the notice | JTBD-03.3 | Notices are delivered where status is checked, retained, with unread state, announced without stealing focus |
| JRN-03.02:Find the entry | JTBD-03.4 | A self-scoped history produces evidence of a prior submission in under a minute |
| JRN-03.02:Check the edges | JTBD-03.4 | Investigative content, issue items, designations, and case records are unreachable from every applicant surface |
| JRN-03.02:Wrong subject / wrong role | JTBD-03.4 | Denied **server-side**, with a **consistent non-enumerable error**, and the denial written to the audit trail (SM-18) |
| JRN-03.02:Read the denials | JTBD-04.4 | Denials — not only successes — are on the record, with actor, target, outcome, and correlation ID |
| JRN-04.01:Start the flow | JTBD-04.1 | Onboarding is a guided configuration action performed in the UI, not an engineering project |
| JRN-04.01:Test before committing | JTBD-04.1 | A live connection test gates submission; unreachable endpoints are caught before, not after |
| JRN-04.01:Let it describe itself | JTBD-04.1 | Capabilities auto-discovered via `describe()` and confirmed, not transcribed from documentation |
| JRN-04.01:Review and submit | JTBD-04.4 | Registration writes one audit record naming the administrator, the application, and the configuration |
| JRN-04.01:Watch it come alive | JTBD-04.1 | Immediate appearance in inventory, health, navigation, and queue — **under five minutes, zero code changes, zero restarts** (SM-11) |
| JRN-04.01:Prove the consequence | JTBD-04.1 | An investigator with an open session sees the new source's items **without signing out** (SM-12) |
| JRN-04.02:Start where the truth is | JTBD-04.2 | Health, latency, and check history for every registered application are visible before a user reports a problem |
| JRN-04.02:Read the failures | JTBD-04.3 | A filterable error log with application, operation, error class, correlation ID, and affected principal, linked to audit |
| JRN-04.02:Take the thread | JTBD-04.3 | A correlation ID from a user-facing error state resolves the **complete hub-and-adapter trace in one query** (SM-20) |
| JRN-04.02:Read it as one story | JTBD-04.4 | A cross-system action reads as one correlated chain — a record, not a reconstruction |
| JRN-04.02:Contain if needed | JTBD-04.3 | Disabling an application is immediate in user navigation and queue, and is itself audited |
| JRN-04.02:Close the loop | JTBD-04.4 | The administrator's **own** actions are attributable to her; mission content and audit mutation remain out of reach for everyone (NFR-07) |
| JRN-04.03:Break it deliberately | JTBD-04.4 | Resilience is rehearsable: controlled, reversible, administrator-only failure injection, itself audited |
| JRN-04.03:Monitor catches it | JTBD-04.2 | Degraded/unavailable state and a correctly attributed error-log entry appear **within one health-check interval** |
| JRN-04.03:Watch the user experience it | JTBD-01.4 | A visible, specific degraded warning across the product and **no error page anywhere** (SM-15, SM-16) |
| JRN-04.03:Put it back | JTBD-04.2 | Restoration returns the application to healthy with **no manual intervention** and no user reload or re-authentication (SM-17) |

### JTBD Coverage Check

All sixteen jobs are exercised by at least one journey; the five demo-critical jobs are exercised by a journey that is on the scripted path.

| JTBD | Journeys | On demo path |
|------|----------|--------------|
| JTBD-01.1 *(flagship)* | **JRN-01.01** | ✅ Segment 1 (primary) |
| JTBD-01.2 | JRN-01.02, JRN-01.01 | ✅ Segment 3b |
| JTBD-01.3 | JRN-01.01, JRN-01.02 | ✅ Segment 1 |
| JTBD-01.4 | JRN-01.03, JRN-04.03 | ✅ Segment 2a |
| JTBD-02.1 | JRN-02.01 | ✅ Segment 4 |
| JTBD-02.2 | JRN-02.01 | ✅ Segment 4 |
| JTBD-02.3 | JRN-02.02 | Segment 2c |
| JTBD-02.4 | JRN-02.02 | Segment 2c |
| JTBD-03.1 | JRN-03.01, JRN-03.02 | ✅ Segment 5a |
| JTBD-03.2 | JRN-03.01 | ✅ Segment 5a |
| JTBD-03.3 | JRN-03.01 | Segment 5a |
| JTBD-03.4 | JRN-03.02 | ✅ Segment 5b |
| JTBD-04.1 | JRN-04.01, JRN-01.02 | ✅ Segment 3a |
| JTBD-04.2 | JRN-04.02, JRN-04.03 | ✅ Segment 2b / 6 |
| JTBD-04.3 | JRN-04.02 | ✅ Segment 6 |
| JTBD-04.4 | JRN-04.02, JRN-04.03, JRN-03.02 | ✅ Segment 6 |

### Journey-to-Feature Coverage Check

| Feature | Journeys exercising it | Feature | Journeys exercising it |
|---------|------------------------|---------|------------------------|
| F0 | 01.01, 01.02, 01.03, 02.01, 03.01 | F10 | 01.01, 02.01, 03.02, 04.02 |
| F1 | 01.01, 01.02, 02.01, 03.01, 04.01, 04.03 | F11 | 01.03, 04.01, 04.02, 04.03 |
| F2 | 01.01, 01.02, 02.01, 03.01, 03.02, 04.01, 04.03 | F12 | 01.02, 04.01 |
| F3 | 01.01, 01.02, 03.01, 03.02 | F13 | 01.01, 02.01, 02.02, 03.01, 03.02, 04.01, 04.02, 04.03 |
| F4 | 01.01, 01.02, 02.02, 03.01, 03.02 | F14 | all ten journeys |
| F5 | 01.01, 01.02, 01.03, 02.01, 02.02, 03.01, 04.01, 04.03 | F15 | 01.01, 01.02, 02.02, 03.01, 04.02 |
| F6 | 01.01, 01.02, 01.03, 02.01, 02.02, 03.01, 03.02 | F16 | 01.02, 01.03, 02.02, 04.01, 04.02, 04.03 |
| F7 | **01.01**, 02.01 | F17 | 01.01, 01.02, 02.01, 03.01, 03.02, 04.01 |
| F8 | 01.01, 01.02, 01.03, 02.02, 04.01, 04.02, 04.03 | F18 | the scripted demo path (all six segments) |
| F9 | 01.01, 01.03, 02.01, 02.02, 03.02, 04.01, 04.02 | F19 | 03.02, 04.03 *(negative-path and resilience assertions)* |

**Gap note.** F18 (demo operability) and F19 (test and accessibility verification) are exercised *by* these journeys rather than *within* them — they are the scaffolding that makes every journey repeatable and verifiable. Their acceptance evidence is the scripted demo path in the header and the per-journey Success Exit Criteria throughout.

---

## Downstream Use

| Consumer | What it takes from this document |
|----------|----------------------------------|
| **STORY-MAP** | Journey stages become the story-map backbone steps; per-journey Success Exit Criteria seed acceptance criteria |
| **FRD / Functional Requirements** | Stage → screen (SCR-xx) mapping and Failure/Alternate Path tables define the required states per screen, including the non-happy ones |
| **Seed data (F17)** | Every journey's **Preconditions** table is normative input to the seed corpus and to seed-time validation assertions |
| **Demo script (F18)** | The scripted demonstration path, its six segments, and the per-journey demo flags |
| **Verification / Test Plan (F19)** | Success Exit Criteria map to SM-01 … SM-22; Accessibility Notes define the manual keyboard and screen-reader passes per journey |
| **UX design** | Emotion curves and Key Moments identify where to invest design effort — and where a dip is legitimate and should not be designed away |

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-09-15*
