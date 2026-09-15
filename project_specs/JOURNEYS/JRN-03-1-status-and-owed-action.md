
## PER-03: Renée Ashford

*The individual being vetted — a private-sector systems engineer at a cleared defense contractor undergoing an initial Tier 3 investigation. Her start date on billable work depends on this process completing. She has no mental model of DCSA's internal system boundaries and must never need one. Short, anxious, frequently interrupted sessions, often on a phone, sometimes eleven days apart.*

---

### JRN-03.01: On a Phone at Lunch — Where Do I Stand, What Do I Owe, Do It Now

**Persona:** PER-03 (Renée Ashford)
**Scenario:** It has been eleven days since Renée last looked. She is eating lunch at her desk with her phone in one hand. She wants one thing: a plain-language answer to *where am I in this process and what do I owe you next.* She has forgotten the interface entirely and will not learn it again. She signs in with a non-CAC method — she has no CAC, will never have one, and is not a government employee — reads her status in a sentence she understands, finds one outstanding task with a due date, completes it, and sees the status change as a result. She never learns that the answer was assembled from two systems, and she never sees anything belonging to anyone else.
**Related Jobs:** JTBD-03.1 *(where do I stand)*, JTBD-03.2 *(what do I owe, do it now)*, JTBD-03.3 *(notices where she already looks)*
**Entry Trigger:** Anxiety plus elapsed time — roughly 70% of her sessions exist for the status question alone. Secondarily, a notice issued to her since her last visit.
**Demo Path:** Supporting — **Segment 5a**, immediately before the zero-trust demonstration in JRN-03.02. Show it **on a narrow viewport**; the applicant surface is the one an evaluator is most likely to resize.

#### Preconditions (Seed Data Required)

| # | Namespace | Required seed state |
|---|-----------|---------------------|
| P1 | hub | An APPLICANT identity bound to PER-03 with **`subjectRef = SUBJ-00622`** and a **non-CAC authentication method** (generic MFA with a visible deterministic demo code, or ECA). The applicant persona must never require a CAC — she does not have one, and a CAC-only applicant would be a domain error on screen. |
| P2 | iep | A status record for `SUBJ-00622` at a mid-process stage, plus **at least one unread notice** and **one OPEN task with a due date** in the `INFORMATION_REQUESTED` shape — this is the action-required path. |
| P3 | eapp | Her own submitted case for `SUBJ-00622` with submission date and current state, so the plain-language narrative is assembled from **two** systems (IEP + eApp) and the "one process, not two system statuses" claim is real. |
| P4 | iep | Prior completed submissions in her history, so Stage 8 and JRN-03.02 have evidence to show rather than an empty list. |
| P5 | pvq | **A PVQ issue raised against one of her answers that she must never see.** Its existence in the seed is what makes the access boundary demonstrable; its absence from every applicant screen is the test. |
| P6 | hub | A **zero-item applicant** identity seeded separately, so every applicant empty state ("You don't have anything to do right now.") is demonstrable without emptying Renée's account. |
| P7 | hub | Plain-language copy mapping for every internal state code that could surface on an applicant screen — no tier codes, no `INFORMATION_REQUESTED`, no `SOI`, no system names. The mapping is seed/configuration, not per-screen improvisation. |

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|-------|--------|------------|----------|---------|------------|-------------|
| 1. Get in | Signs in with username and a one-time code on her phone | SCR-01 login → SCR-04 → SCR-05 generic MFA | "Please don't make me reset a password again." | Tense, low expectations | **Today:** one login for the questionnaire, another for the portal that sends notices; she has reset one of them twice, each reset costing an evening | One credential for the whole process, with the simulated auth labelled honestly (F0) |
| 2. Read where she stands | Reads a one-sentence status and a short progress structure, above the fold, on a 320px screen | SCR-11 applicant dashboard → status widget | "Okay — they have it, it's being reviewed, nothing is wrong." | **Relief** — the whole point of the session | **Today:** two screens with different terminology for the same state, and she cannot tell whether they describe the same thing | One plain-language progress narrative assembled from IEP and eApp, presented as one process (F4) |
| 3. Understand, not decode | Reads the status without hitting an acronym or an internal state name | SCR-11 → plain-language copy, no tier codes, no system names | "Nothing here I have to look up. Good." | Respected | **Today:** "Pending SOI transmittal" is presented as a status; it is not a status, it is a barrier | Zero internal system names, tier codes, or state abbreviations without plain-language explanation |
| 4. See what she owes | Sees one outstanding task with a due date, stated as an obligation not a systems inventory | SCR-11 → outstanding tasks list | "One thing. Due Friday. That I can do at lunch." | Focused, faintly anxious about the date | **Today:** she learns she owes something when the deadline has nearly passed, via a forwarded email from her security officer | A short, ordered, unambiguous task list with due dates (F4, F5) |
| 5. Read the notice | Opens the unread notice sitting in the same place she checks status | SCR-11 notices region → SCR-21 notifications | "It's here, not in an email I lost." | Reassured | **Today:** notices arrive by email, sometimes second-hand, and get lost; she cannot tell what she has already handled | Notices in-app, retained, with read/unread state (F15) |
| 6. Do the thing | Activates the task, completes the form, uploads/enters what was asked, submits | SCR-18 IEP task → task action form (USWDS, labelled, validated) | "Am I giving them the right thing? …Yes, it says exactly what they want." | Concentrating; mildly uncomfortable disclosing personal detail | **Today:** the task has no path from where she found it; she re-reads an email chain to work out which system it refers to | **Every task links directly to the action that discharges it** — no dead ends, no "contact your security officer" as a primary path (NFR-14) |
| 7. Get a real confirmation | Reads a confirmation naming what was received and what happens next | SCR-18 confirmation | "Received. Reviewed in about two weeks. That's an answer." | **Relief, then done** | **Today:** a bare "Submitted" leaves her unsure anything happened, so she calls her security officer anyway | Confirmation names what was received **and what happens next** (F6) |
| 8. See it land | Returns to the dashboard; the task is gone, the status line reflects the submission, and the item appears in her history | SCR-11 refreshed → SCR-18 submission history | "The screen changed because of something I did. It's actually connected." | Confident | **Today:** nothing visibly changes, so she assumes nothing happened and checks again tomorrow | Her action changes her status narrative — the system is legibly responsive (F4, F6) |

#### System Response by Stage

| Stage | System Response | Features |
|-------|-----------------|----------|
| 1. Get in | Non-CAC path establishes one session; the simulation is labelled on screen so nothing implies real credential validation; no language claiming anything was "verified" or "validated" | F0, F1 |
| 2. Read where she stands | Dashboard composes IEP status and eApp case state into **one** progress narrative server-side; the applicant composition is visibly and substantively different from the three mission dashboards (SM-23) | **F4**, F5, F8 |
| 3. Understand, not decode | Internal state codes translated through the plain-language mapping before they leave the server; raw state names never reach the applicant surface | F4, F14 |
| 4. See what she owes | Outstanding tasks aggregated and ordered by due date, each carrying a working deep link to the action that discharges it | F4, F5, F6 |
| 5. Read the notice | Notices rendered with read/unread state and an accessible mark-as-read; new notices announced via live region **without stealing focus** | F15, F14 |
| 6. Do the thing | **Every read is resource-level entitlement-checked against her `subjectRef`** — route-level checks alone would be a defect; the form validates server-side with an accessible error summary; session-timeout warning offers re-authentication **without discarding entered data** | **F2**, F6, F0, F14 |
| 7. Get a real confirmation | Write executed through the IEP adapter; **one audit record written before the success response returns**; confirmation names the received artifact and the next step | F6, F13 |
| 8. See it land | Status recomposed from live spoke data; the task leaves the open list; the submission appears in her self-scoped history | F4, F6, F13 |

**Emotion curve (1 anxious → 5 confident):** Get in **2** *(eleven days of silence and a password she half-remembers)* → Read status **4** *(the biggest single emotional jump in this document)* → Understand **4** → See what she owes **3** *(a due date is a small spike of stress)* → Read notice **4** → Do the thing **3** *(disclosing personal detail is uncomfortable)* → Confirmation **5** → See it land **5**.

#### Key Moments

- **Delight Opportunity — Stage 2.** Answering "where am I" in one sentence, above the fold, on a phone, in under 30 seconds. For 70% of her sessions this **is** the product. Everything else is secondary.
- **Decision Point — Stage 6.** Whether she completes the task now or defers it "until the weekend" — which historically means a missed deadline and a phone call to three other people.
- **Risk of Abandonment — Stage 3.** One unexplained acronym or internal state name and she concludes the system is not for her and calls her security officer instead. Jargon is the failure mode, not layout.
- **Risk of Abandonment — Stage 6.** Losing a partly completed form to a silent timeout. She will not start it a third time in the same week.
- **Boundary Moment — throughout.** She sees her own record and nothing else. A PVQ issue exists against one of her answers (precondition P5) and appears **nowhere** on any applicant screen. That asymmetry is a deliberate access-control boundary, not an omission, and it is the setup for JRN-03.02.

#### Success Exit Criteria

- She can answer **"where am I in this process"** within **30 seconds of signing in, on a 320px-wide viewport, without scrolling past a fold of jargon** (SM-25, NFR-16).
- The screen contains **zero** internal system names, tier codes, or state abbreviations without plain-language explanation.
- **100% of outstanding tasks link directly to the action that discharges them** (SM-06, NFR-14).
- A submission produces a confirmation naming what was received and what happens next, and then appears in her own history.
- Her dashboard is **visibly and substantively different** from the three mission-role dashboards — same product, different composition (SM-23).
- No applicant screen exposes investigative content, investigator identity, PVQ issue items, PDT designations, or IM case records.

#### Failure and Alternate Paths

| Condition | What Renée sees | Recovery |
|-----------|-----------------|----------|
| Session times out mid-form | SCR-06 warning with a countdown and an accessible re-authentication path that **does not discard entered data** | Re-authenticate and continue; nothing re-typed |
| Validation error on a personal-detail field | Inline error plus an error summary with focus management and in-page links; plain-language message, no field codes | Fix the named field; entered content preserved |
| She has nothing outstanding | Designed empty state: "You don't have anything to do right now. We'll let you know if that changes." — never a blank panel | Nothing owed; the session ends reassured |
| IEP unavailable | A named plain-language warning that part of her status could not be loaded, without jargon and without a raw system name where one can be avoided | Status returns automatically on recovery; nothing she must do |
| She tries a URL for an investigator page | SCR-30 access denied, non-enumerable, with exits back to her dashboard; the denial is audited | Returns to her own dashboard |
| A notice arrives while she is signed in | Announced via live region **without stealing focus**, with unread state | She reads it when she is ready |

#### Accessibility Notes

*This is the **widest accessibility exposure in the product**. Applicants are the general public and the entire cleared workforce; the population includes screen-reader, keyboard-only, magnification, and cognitive/reading-disability users — and users whose disability is directly relevant to what the vetting process is asking about. A failure here is the one most likely to be noticed externally.*

- **Keyboard-only and screen-reader completable end to end**, including sign-in, task completion, and mark-as-read.
- **Plain language is an accessibility requirement, not a tone preference.** Short sentences, defined terms, no unexplained acronyms, one explicit next action.
- **Mobile is a genuine access path, not a responsive checkbox:** usable at **320px width with no horizontal scroll**, at 200% zoom, with adequate touch targets (NFR-16).
- Forms: programmatically associated labels, described-by hint text for anything ambiguous, required-field indication that is **not colour-only**, inline errors, and an error summary with focus management. She is entering personal detail she may find uncomfortable to disclose; a confusing validation error compounds that.
- **Session timeout** needs a clear warning and an accessible re-authentication path that does not discard entered data — her sessions are short and interrupted, and she *will* be timed out (F0).
- Progress is conveyed by **text and structure**, not by a colour-coded graphic alone (NFR-02).
- Notices and asynchronous updates are delivered via live regions **without stealing focus** (F14, F15).
- The non-dismissible demo banner must not consume the top of a 320px viewport to the point where the status answer falls below the fold (NFR-13 vs. SM-25 — resolved by the measured chrome budget in FR-F03-03 rule 3a; tested explicitly).

#### Success Outcome

Renée answers "where am I and what do I owe next" within 30 seconds of signing in on a phone, with zero unexplained internal terms (JTBD-03.1, SM-25) — and 100% of her outstanding tasks link directly to the action that discharges them, with her submission producing a confirmation naming what was received and what happens next, then appearing in her own history (JTBD-03.2, SM-06, NFR-14).

#### Feature Touchpoints

| Stage | Features |
|-------|----------|
| 1. Get in | F0, F1, F3 |
| 2. Read where she stands | **F4**, F5, F9, F17 |
| 3. Understand, not decode | F4, F14 |
| 4. See what she owes | F4, F5, F6 |
| 5. Read the notice | F15, F4, F14 |
| 6. Do the thing | F6, **F2**, F0, F14 |
| 7. Get a real confirmation | F6, F13 |
| 8. See it land | F4, F6, F13 |

---
