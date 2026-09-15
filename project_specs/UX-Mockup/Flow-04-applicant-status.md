### Flow 4: Applicant — on a phone at lunch: where do I stand, what do I owe, do it now

> **This is the widest accessibility exposure in the product.** Applicants are the general public and the entire cleared workforce. The population includes screen-reader, keyboard-only, magnification, and cognitive/reading-disability users — **and users whose disability is directly relevant to what the vetting process is asking about**. A failure here is the one most likely to be noticed externally.

**Trigger:** Anxiety plus elapsed time. ~70% of this persona's sessions exist for the status question **alone**.
**User Stories:** US-004, US-015, US-018, US-035, US-044, US-049, US-057, US-107, US-112, US-113, US-116, US-117, US-122
**Features:** F0 (non-CAC auth), F2 (resource-level isolation), F4 (applicant dashboard), F6 (task completion), F15 (notices)
**Persona:** PER-03 Renée Ashford (Applicant) — `subjectRef = SUBJ-00622`
**Demo path:** Segment 5a — **show it on a narrow viewport**; the applicant surface is the one an evaluator is most likely to resize.

```
╔══ 320px — PHONE-FIRST. This is the primary design target, not a ══╗
║   responsive afterthought.                                        ║
╚═══════════════════════════════════════════════════════════════════╝

[SCR-01] → [SCR-04 username] → [SCR-05 demo code]
   │   NON-CAC path. She has no CAC, will never have one, and is not
   │   a government employee. A CAC-only applicant would be a domain
   │   error on screen.
   ▼
┌─────────────────────────────────┐  ← 320px
│ Demo — Synthetic Data Only.     │  units(4)   ← truncated lede
├─────────────────────────────────┤
│ ▣ An official website ▾         │  units(4)   ← usa-banner, CLOSED
├─────────────────────────────────┤
│ [DCSA]              [☰]         │  units(7)   ← compact header row
├─────────────────────────────────┤
│                                 │
│ Your security clearance         │  ← <h1>, FIRST content in <main>
│ application                     │     no breadcrumb above it
│                                 │
│ ┌─────────────────────────────┐ │
│ │ We have your application    │ │  ← THE ANSWER, ABOVE THE FOLD
│ │ and it is being reviewed.   │ │     ONE SENTENCE. NO JARGON.
│ │ Nothing is needed from you  │ │     usa-summary-box
│ │ on this right now.          │ │
│ └─────────────────────────────┘ │
│                                 │  ═══ FOLD (568px viewport) ═══
│ Where you are                   │
│  ✓ Submitted                    │  ← usa-step-indicator, VERTICAL
│  ● Under review  ← you are here │     current step marked IN TEXT
│  ○ Information requested        │     as well as visually
│  ○ Complete                     │
│                                 │
│ What you need to do (1)         │
│ ┌─────────────────────────────┐ │
│ │ Confirm your address        │ │
│ │ history for 2019–2021       │ │
│ │ Due Friday 18 September     │ │
│ │ If we don't hear from you   │ │  ← consequence stated in
│ │ by then, your application   │ │     PLAIN LANGUAGE
│ │ will pause.                 │ │
│ │ [ Start this task ]  ───────┼─┼──▶ SCR-18
│ └─────────────────────────────┘ │
│                                 │
│ Your notices (1 unread)         │
│  ● Interview scheduling ───────┼──▶ SCR-21 / SCR-18
│    12 September                 │
│                                 │
│ Your submission                 │
│  Reference AP-00622-1           │
│  Submitted 2 August 2026        │
│  [ View what I submitted ]      │
└─────────────────────────────────┘
```

#### The 320px chrome budget — a measured acceptance criterion

> ⚠ **RESOLVED TENSION: NFR-13 (banner always visible) vs SM-25 (status answer ≤30s, above the fold).** Resolved by the measured chrome budget now normative in FR-F03-03 rule 3a.

| Element | Budget at 320px | Mechanism |
|---|---|---|
| Demo banner | `units(4)` | Truncated to bold lede; full sentence remains in DOM for screen readers and the CI copy-scan |
| USWDS government banner | `units(4)` | `usa-banner` renders in **closed** accordion state |
| Header | `units(7)` | Wordmark + `usa-menu-btn` only; identity/role/timer move into the menu |
| **Total chrome** | **≤ `units(15)` (~120px)** | |
| `<h1>` + status sentence | Immediately follows | **No breadcrumb, no page-level alert region, no announcement region above them on SCR-11** |

**Acceptance:** on a 320×568 viewport, the status sentence is visible **without scrolling**. This is tested, not assumed.

#### Steps

| # | Step | Screen / component | Design obligation |
|---|---|---|---|
| 1 | Get in | SCR-04 → SCR-05, `usa-summary-box` with visible demo code | Non-CAC path; simulation labelled honestly; no "verified"/"validated" language |
| 2 | **Read where she stands** | SCR-11 `usa-summary-box` | **One sentence, above the fold, on 320px.** For 70% of her sessions this *is* the product. Everything else is secondary |
| 3 | Understand, not decode | Plain-language copy mapping | **Zero** internal system names, tier codes, or state abbreviations without explanation. "Pending SOI transmittal" is not a status — it is a barrier |
| 4 | See what she owes | "What you need to do" list | Ordered by due date; each task states the **consequence of not acting** in plain language |
| 5 | Read the notice | Notices region → SCR-21/SCR-18 | In-app, retained, with read/unread state — not an email she lost |
| 6 | Do the thing | SCR-18 task form | **Every task links directly to the action that discharges it.** No dead ends; "contact your security officer" is never a primary path (NFR-14) |
| 7 | Get a real confirmation | SCR-18 confirmation | Names **what was received AND what happens next** — a bare "Submitted" leaves her calling her security officer anyway |
| 8 | See it land | SCR-11 refreshed | The task is gone, the status line reflects the submission, the item appears in her history. **Her action visibly changed her status narrative** |

#### The boundary — what she must never see

```
SEEDED BUT INVISIBLE:
  • A PVQ issue raised against one of her own answers  (precondition P5)
  • Investigator narratives, issue internal notes, adjudication rationale
  • Any PDT designation, any IM case record, any other subject's anything

ENFORCEMENT (not a UI decision):
  • Every read is resource-level entitlement-checked against subjectRef
  • Scope predicate injected at the DATA LAYER — spokes apply it in their
    own query; the hub re-applies it after receiving results
  • Redacted fields are ABSENT FROM THE PAYLOAD, not hidden in the DOM
  • The UI does NOT render a "hidden content" placeholder that implies
    concealed material about her  (FR-F06-02 rule 3)

VISIBLE CONSEQUENCE: there is nothing on any applicant screen to inspect,
because there is nothing in the response to inspect. That asymmetry is a
deliberate access-control boundary, not an omission — and it is the setup
for the zero-trust curl demonstration (Segment 5b).
```

#### Failure and alternate paths

| Condition | What she sees | Recovery |
|---|---|---|
| **Session times out mid-form** | SCR-06 with countdown and an accessible re-auth path that **does not discard entered data**. Her sessions are short and interrupted — she *will* be timed out, and she will not start a personal-detail form a third time in one week | Re-authenticate and continue; nothing re-typed |
| Validation error on a personal-detail field | Inline error + error summary with focus management and in-page links. **Plain-language message, no field codes.** Entered content preserved | Fix the named field |
| She has nothing outstanding | Designed empty state: "You don't have anything to do right now. We'll let you know if that changes." — **never a blank panel**. Demonstrable via the seeded zero-item applicant persona | Session ends reassured |
| IEP unavailable | Named warning **without jargon**: "Some of your information isn't available right now. Please check back shortly." | Returns automatically on recovery; nothing she must do |
| She tries an investigator URL | SCR-30, non-enumerable, with exits to **her** dashboard; denial audited | Returns to her dashboard |
| A notice arrives while signed in | Announced via live region **without stealing focus**, with unread state | She reads it when ready |
| Another subject's resource ID, by URL or curl | 403, **identical in body and timing** to a request for a non-existent record. Denial visible in the audit trail | — (this is Segment 5b's demonstration) |

#### Exit criteria

- She answers **"where am I in this process"** within **30 seconds of signing in, on a 320px viewport, without scrolling past a fold of jargon** (SM-25, NFR-16).
- **Zero** internal system names, tier codes, or state abbreviations without plain-language explanation.
- **100%** of outstanding tasks link directly to the action that discharges them (SM-06, NFR-14).
- A submission produces a confirmation naming **what was received and what happens next**, then appears in her own history.
- Her dashboard is **visibly and substantively different** from the three mission dashboards (SM-23).
- **No applicant screen** exposes investigative content, investigator identity, PVQ issues, PDT designations, or IM records.

#### Accessibility notes

- **Plain language is an accessibility requirement, not a tone preference.** Short sentences, defined terms, no unexplained acronyms, one explicit next action. **Jargon is the failure mode here, not layout** — one unexplained acronym and she concludes the system is not for her.
- **Keyboard-only and screen-reader completable end to end**, including sign-in, task completion, and mark-as-read.
- **Heading hierarchy:** `<h1>` "Your security clearance application" → `<h2>` per widget ("Where you are", "What you need to do", "Your notices", "Your submission"). Gap-free. The `<h1>` is the **first** thing in `<main>`.
- **Landmarks:** skip link → demo banner → gov banner → `banner` → `nav[Primary]` → `main` → `contentinfo`. The skip link is the first focusable element and moves focus to `<main>` (US-112).
- **Step indicator:** `usa-step-indicator` conveys progress by **text and structure**, not a colour-coded graphic. Current step carries `aria-current="step"` **and** the visible words "you are here" (NFR-02).
- **Forms:** programmatically associated labels (never a placeholder as a label); `aria-describedby` hint text for anything ambiguous; required indicated by the **text** "required", not colour or asterisk alone; inline errors with `aria-invalid="true"`; error summary with focus management. She is entering personal detail she may find uncomfortable to disclose — a confusing validation error compounds that.
- **Touch targets ≥ 44×44 CSS px**, with adequate spacing. Task cards are fully tappable, not just the button.
- **320px, no horizontal scroll; 200% zoom, no clipping or overlap.** Content reflows; nothing requires two-dimensional scrolling.
- **Live regions without focus theft** for arriving notices and async status updates (US-115).
- **Reduced motion:** `prefers-reduced-motion: reduce` disables skeleton shimmer and all transitions.
- **No hover-only content.** Any tooltip content is available on focus and is never the sole source of essential information.
- **Timing:** no time limit other than the session timeout; extending preserves entered form data (US-117).

---
