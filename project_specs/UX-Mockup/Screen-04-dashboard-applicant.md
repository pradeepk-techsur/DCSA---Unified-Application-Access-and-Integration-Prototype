### Screen: SCR-11 — Applicant dashboard (PER-03) — MOBILE-FIRST

**Purpose:** A plain-language answer to "where am I in this process and what do I owe you next," assembled from eApp and IEP **without ever naming internal systems as a burden on the user**.
**User Stories:** US-035, US-049, US-107, US-112, US-113, US-116, US-122 · **Features:** F4, F5, F15 · **Persona:** PER-03 Renée Ashford
**Template:** Widget grid, **phone-first**

> **This persona is phone-first, not phone-tolerant.** ~70% of her sessions exist for the status question alone, on a phone, at lunch, eleven days apart. **The 320px layout below is the primary design; the desktop layout is the adaptation.**

#### Layout — 320px (PRIMARY)

```
┌─────────────────────────────────┐ ─┐
│ Demo — Synthetic Data Only.     │  │ units(4)  truncated lede
├─────────────────────────────────┤  │
│ ▣ An official website ▾         │  │ units(4)  usa-banner CLOSED
├─────────────────────────────────┤  ├─ CHROME BUDGET ≤ units(15) (~120px)
│ [DCSA]                    [☰]   │  │ units(7)  compact header
├─────────────────────────────────┤ ─┘
│ <main>                          │
│                                 │
│ Your security clearance         │  ← <h1>, FIRST content in <main>.
│ application                     │    NO breadcrumb, NO page-level alert
│                                 │    region, NO announcement region above it
│ ┌─────────────────────────────┐ │
│ │ We have your application    │ │  ★ THE ANSWER. ONE SENTENCE.
│ │ and it is being reviewed.   │ │    usa-summary-box
│ │ Nothing is needed from you  │ │    ABOVE THE FOLD at 320×568.
│ │ on this right now.          │ │    This is the acceptance criterion.
│ └─────────────────────────────┘ │
│                                 │
│ ══════ FOLD (320×568) ══════════│
│                                 │
│ Where you are            <h2>   │
│ ┌─────────────────────────────┐ │  ← usa-step-indicator, VERTICAL at 320px
│ │ ✓ Submitted                 │ │    current step marked IN TEXT
│ │   Completed 2 August        │ │    ("you are here") as well as visually
│ │ ● Under review              │ │    aria-current="step"
│ │   ▸ You are here            │ │
│ │   We're checking the        │ │  ← one-sentence explanation of the
│ │   information you gave us.  │ │    CURRENT step. Not a glossary.
│ │   This usually takes 4–8    │ │
│ │   weeks.                    │ │
│ │ ○ Information requested     │ │
│ │ ○ Complete                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ What you need to do (1)  <h2>   │
│ ┌─────────────────────────────┐ │
│ │ Confirm your address        │ │
│ │ history for 2019–2021       │ │
│ │                             │ │
│ │ ⚠ Due Friday 18 September   │ │  ← text + icon, never a red date
│ │                             │ │
│ │ If we don't hear from you   │ │  ★ CONSEQUENCE STATED IN PLAIN
│ │ by then, your application   │ │    LANGUAGE — not a bare due date
│ │ will pause.                 │ │
│ │                             │ │
│ │ [ Start this task      → ]  │ │  ← ≥44×44px; WHOLE CARD tappable
│ └─────────────────────────────┘ │    100% of tasks link DIRECTLY to
│                                 │    the action that discharges them
│ Your notices (1 unread)  <h2>   │
│ ┌─────────────────────────────┐ │
│ │ ● Unread                    │ │  ← read/unread is TEXT + icon
│ │ Interview scheduling        │ │
│ │ 12 September                │ │
│ │ [ Read ]  [ Mark as read ]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Your submission          <h2>   │
│ ┌─────────────────────────────┐ │
│ │ Reference  AP-00622-1       │ │
│ │ Submitted  2 August 2026    │ │
│ │ Status     Being reviewed   │ │
│ │ [ View what I submitted → ] │ │
│ └─────────────────────────────┘ │
│ </main>                         │
├─────────────────────────────────┤
│ usa-identifier (stacked)        │
│ Accessibility statement         │
└─────────────────────────────────┘
```

#### Layout — desktop (≥1024px)

Two columns: **left (2/3)** — "Where you are", "What you need to do", "Your notices"; **right (1/3)** — "Your submission", "Announcements", "System status". The `<h1>` and status sentence remain the first content in `<main>`.

#### The language contract

```
NEVER APPEARS ON THIS SCREEN            INSTEAD
────────────────────────────────────    ────────────────────────────────────
"INFORMATION_REQUESTED"                 "We need something from you"
"Tier 3" / "T3"                         (omitted — irrelevant to her)
"Pending SOI transmittal"               "We're checking the information
                                         you gave us"
"eApp" / "IEP" / "PVQ" in body copy     "your application" / "your notices"
"Adjudication"                          "the final decision"
"Subject" / "SUBJ-00622"                "you" / (omitted)
"Case"                                  "your application"
```

**Rule:** zero internal system names, tier codes, or state abbreviations **without plain-language explanation** (SM-25). Source badges still exist on work-item rows for attribution consistency, but they are **secondary** — smaller, lower-contrast-but-still-AA, and never in a heading. The mapping from internal state → plain language is **seed/configuration**, not per-screen improvisation, so it cannot drift.

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | The one-sentence status answer | Immediately under `<h1>`, above the fold at 320px | **70% of sessions exist for this alone.** Everything else is secondary |
| **Primary** | Where you are (step indicator) | Directly below | Structure, not decoration — answers "how much is left" |
| **Primary** | What you need to do | Below status | The obligation, with due date and consequence |
| Secondary | Your notices | Below tasks | In the same place she checks status — not an email she lost |
| Secondary | Your submission | Right column / bottom | Proof of what she sent |
| Tertiary | Announcements | Right column / bottom | Role-targeted |
| Conditional | System status | Bottom, jargon-free | "Some of your information isn't available right now. Please check back shortly." |

#### States

| Widget | Loading | Empty | Error | Degraded |
|---|---|---|---|---|
| **Where you are** | Skeleton preserving box height | *Not reachable — every applicant has a status* | "We couldn't load your status right now. Try again." | "Part of your status isn't available right now. Please check back shortly." |
| **What you need to do** | Skeleton | **"You don't have anything to do right now. We'll let you know if that changes."** | Error + retry | Named-in-plain-language gap |
| **Your notices** | Skeleton | **"You have no notices."** | Error + retry | "Your notices aren't available right now." |
| **Your submission** | Skeleton | *Not reachable* | Error + retry | Partial with caveat |
| **Announcements** | Skeleton | *Hidden when none* | Silent fail | n/a |

> **The zero-item applicant is a separately seeded persona** (FR-F17-06), specifically so every applicant empty state is **demonstrable rather than theoretical** — without emptying Renée's account. Every empty state here is designed content with a heading and an explanation. **Never a blank panel.**

**Degraded wording is de-jargoned.** Where mission screens say "Investigation Management is unavailable — 12 items are not shown," this screen says "Some of your information isn't available right now. Please check back shortly." Same honesty, no internal system names where they can be avoided.

#### What must never appear

```
SEEDED BUT INVISIBLE ON EVERY APPLICANT SCREEN:
  • A PVQ issue raised against one of her own answers (seed precondition P5)
  • investigatorNotes · issueNarrativeInternal · adjudicationRationale
  • Any PDT designation, any IM case record
  • Any other subject's anything

ENFORCEMENT — not a UI decision:
  • Every row filtered by subjectRef AT THE DATA LAYER
  • Redacted fields are ABSENT FROM THE PAYLOAD, not hidden in the DOM
  • The UI does NOT render a "hidden content" placeholder that would imply
    concealed material about her (FR-F06-02 rule 3)
```

The result: there is nothing on screen to inspect, because there is nothing in the response to inspect. Verified by direct API probe with another subject's ID (FR-F04-04 AC-1, AC-3).

#### Interactive elements

| Element | Component | Behaviour |
|---|---|---|
| "Start this task" | `usa-button` (whole card tappable) | → SCR-18 task form |
| Notice "Read" | `usa-link` | → SCR-18 / SCR-21 notice body |
| "Mark as read" | `usa-button--unstyled` | Toggles read state, persisted in **IEP's own store** (it is IEP's record); announced politely |
| "View what I submitted" | `usa-button--outline` | → SCR-18 submission view (redacted per obligations) |
| Step indicator | Non-interactive | Structure only; not a wizard |

#### Accessibility notes

> **This is the widest accessibility exposure in the product.** The population includes screen-reader, keyboard-only, magnification, and cognitive/reading-disability users — and users whose disability is directly relevant to what the vetting process is asking about.

- **Plain language is an accessibility requirement, not a tone preference.** Short sentences, defined terms, no unexplained acronyms, one explicit next action per card. **Jargon is the failure mode here, not layout.**
- **Heading hierarchy:** `<h1>` "Your security clearance application" → `<h2>` per widget. Gap-free. **The `<h1>` is the first element in `<main>`**, with no intervening alert or breadcrumb region — this is what keeps the status answer above the fold.
- **Landmarks:** skip link (first focusable, moves focus to `<main>`) → demo banner → gov banner → `banner` → `nav[Primary]` → `main` → `contentinfo`.
- **Step indicator:** `usa-step-indicator` with `aria-current="step"` **and** the visible words "You are here." Progress conveyed by **text and structure**, never a colour-coded graphic alone (NFR-02).
- **Read/unread state** is text + icon, never a colour dot.
- **Due dates** carry the word "Due" plus an icon; overdue carries the word "Overdue". Never a red date alone.
- **Forms (on SCR-18):** programmatically associated `<label>` on every input — never a placeholder as a label; `aria-describedby` hint text for anything ambiguous; required marked with the **text** "required"; inline `usa-error-message` with `aria-invalid="true"`; error summary with `role="alert"`, focus moved to it, in-page links. **She is entering personal detail she may find uncomfortable to disclose — a confusing validation error compounds that.**
- **Session timing:** she *will* be timed out. SCR-06 gives a clear warning and an accessible re-authentication path that **does not discard entered data**. There is no time limit on completing a form other than the session timeout (US-117).
- **Live regions without focus theft:** an arriving notice is announced politely and does **not** move focus or reorder content under her cursor.
- **Target sizes ≥44×44 CSS px**, generously spaced. The **whole task card** is the target, not just the button text.
- **320px:** no horizontal scroll; **the status sentence is visible without scrolling on a 320×568 viewport** — a measured acceptance criterion, tested explicitly because of the NFR-13 / SM-25 tension documented in `00-overview` and made normative in FR-F03-03 rule 3a.
- **200% zoom:** no clipping, no overlap, content reflows; no two-dimensional scrolling.
- **Reduced motion:** all non-essential animation disabled, including skeleton shimmer.
- **No hover-only content.** Any explanatory text is present inline or available on focus, never tooltip-only.

#### Acceptance

- She answers "where am I in this process" within **30 seconds of signing in, on a 320px viewport, without scrolling past a fold of jargon** (SM-25, NFR-16).
- Shows **only that applicant's records**, verified by direct API probe with another subject's ID.
- The **zero-item applicant persona renders designed empty states in every widget**, with no blank regions.
- **Redacted fields are absent from the response payload**, not merely hidden.
- **Visibly and substantively different** from the three mission dashboards.

---
