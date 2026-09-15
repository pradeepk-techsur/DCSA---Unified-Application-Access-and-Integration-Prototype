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
