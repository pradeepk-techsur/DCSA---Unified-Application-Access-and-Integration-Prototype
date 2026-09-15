### Screen: SCR-15 — eApp case view — THE HINGE OF THE FLAGSHIP JOURNEY

> **This is where the product's thesis is either proven or lost.** Everything else is supporting cast. The design question this screen answers: **how is a cross-system relationship made visible and traversable without leaving the shell?**

**Purpose:** Present a full eApp questionnaire case, and surface the **related PVQ issue inline** — explained in words, resolved live through the adapter, and traversable in one activation without a login, a new tab, or a re-typed identifier.
**User Stories:** US-059, US-060, US-061, US-062, US-055, US-050, US-056 · **Features:** F7, F6, F2, F9, F13, F14
**Template:** `DetailPage` · **Seeded demo case:** `EAPP:CASE-A-1042`, subject `SUBJ-00418`

#### Layout

```
│ ‹ Back to work queue                                                          │
│ Work Queue › ▣ eApp Case A-1042                                               │
│                                                                               │
│ Case A-1042 — Security questionnaire review                     <h1>          │
│                                                                               │
│ ┌── CASE SUMMARY ──────────────────────────────────────────────────────────┐ │
│ │ System of record: eApp — Electronic Application                          │ │
│ │ Synthetic record — demo data                                             │ │
│ │                                                                          │ │
│ │ Case reference   CASE-A-1042        Submitted   2 August 2026            │ │
│ │ Subject          SUBJ-00418 · Theodore Q. Lansbury                       │ │
│ │ Case status      Under review       Due         19 Sep 2026 (4 days)     │ │
│ │ Investigator     Marcus Vale (you)                                       │ │
│ │                                                                          │ │
│ │ ╔══════════════════════════════════════════════════════════════════════╗ │ │
│ │ ║ ⚠  1 outstanding issue                            [ Go to issue ↓ ]  ║ │ │
│ │ ╚══════════════════════════════════════════════════════════════════════╝ │ │
│ │   ★ FIRST-CLASS ELEMENT, not a field in a list. It is a LINK that moves  │ │
│ │     FOCUS to the related-items panel heading. When the flagship workflow │ │
│ │     resolves the issue this becomes "No outstanding issues" — THE        │ │
│ │     VISIBLE PROOF THAT eApp CHANGED. Sourced from eApp's OWN API, never  │ │
│ │     a hub-computed guess. (FR-F06-08 rule 2)                             │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── QUESTIONNAIRE SECTIONS ──────────────────────────── <h2> ──────────────┐ │
│ │  usa-accordion — collapsible, heading-structured, STABLE ANCHORS         │ │
│ │                                                                          │ │
│ │  ▸ Section 12 — Where you have lived            #SECTION_12       <h3>   │ │
│ │  ▾ Section 13A — Employment history             #SECTION_13A      <h3>   │ │
│ │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│ │  │ ⚠ Issue raised on this section                                     │ │ │
│ │  │   ↑ TEXT MARKER, shown when arrived at via the related-item link   │ │ │
│ │  │                                                                    │ │ │
│ │  │ Employer 1                                                         │ │ │
│ │  │   Employer name    Meridian Logistics Group                        │ │ │
│ │  │   Position         Systems analyst                                 │ │ │
│ │  │   Start date       June 2016                                       │ │ │
│ │  │   End date         March 2019      ◀── THE FLAGGED ANSWER          │ │ │
│ │  │                                        answerLocus:                │ │ │
│ │  │                                        SECTION_13A.employer[0]     │ │ │
│ │  │                                                     .endDate       │ │ │
│ │  │ Employer 2                                                         │ │ │
│ │  │   Employer name    Northbridge Systems                             │ │ │
│ │  │   Start date       April 2019                                      │ │ │
│ │  └────────────────────────────────────────────────────────────────────┘ │ │
│ │  ▸ Section 13B — Employment record              #SECTION_13B      <h3>   │ │
│ │  ▸ Section 22 — Police record                   #SECTION_22       <h3>   │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ╔══ RELATED ITEMS IN OTHER SYSTEMS ═══════════════════ <h2> ═══════════════╗ │
│ ║  ★★★ THE MOMENT THE PRODUCT EARNS THIS PERSONA ★★★                       ║ │
│ ║  Resolved LIVE through the PVQ, PDT, and IM adapters. No joins, no        ║ │
│ ║  shared schema, no hard-coded links. The main case content does NOT      ║ │
│ ║  wait on this panel — it renders its own skeleton and settles            ║ │
│ ║  independently. (FR-F07a-02 rule 4)                                      ║ │
│ ║                                                                          ║ │
│ ║  ┌─ Issues raised against this case (1) ───────────────── <h3> ───────┐ ║ │
│ ║  │                                                                     │ ║ │
│ ║  │  ▣ PVQ   Issue ISS-2207                              ○ Open        │ ║ │
│ ║  │                                                                     │ ║ │
│ ║  │  "Issue raised against Section 13A — Employment history"            │ ║ │
│ ║  │    ↑ THE RELATIONSHIP EXPLAINED IN WORDS.                           │ ║ │
│ ║  │      Sourced from PVQ's answerSectionLabel — NOT composed by the    │ ║ │
│ ║  │      UI, NOT hard-coded. Changing the seeded label changes what     │ ║ │
│ ║  │      appears here. (FR-F07a-03 AC-3)                                │ ║ │
│ ║  │                                                                     │ ║ │
│ ║  │  Raised 12 September 2026 (3 days ago)                              │ ║ │
│ ║  │                                                                     │ ║ │
│ ║  │  [ Open this issue → ]  ◀══ THE TRAVERSAL                           │ ║ │
│ ║  │                             in-shell · no tab · no login · no       │ ║ │
│ ║  │                             identifier typed                        │ ║ │
│ ║  └─────────────────────────────────────────────────────────────────────┘ ║ │
│ ║                                                                          ║ │
│ ║  ┌─ Position designation (1) ──────────────────────────── <h3> ───────┐ ║ │
│ ║  │  ▣ PDT   PDT-0771 · Tier 5 designation · ✓ Approved                │ ║ │
│ ║  │  "Position designation for this case"          [ Open → ] SCR-17   │ ║ │
│ ║  └─────────────────────────────────────────────────────────────────────┘ ║ │
│ ║                                                                          ║ │
│ ║  ┌─ Case assignment (1) ───────────────────────────────── <h3> ───────┐ ║ │
│ ║  │  ▣ IM    IM-3310 · Assignment · ● Active                           │ ║ │
│ ║  │  "Investigation assignment for this case"      [ Open → ] SCR-19   │ ║ │
│ ║  └─────────────────────────────────────────────────────────────────────┘ ║ │
│ ║                                                                          ║ │
│ ║  ★ THREE relationship types, THREE systems. The cross-system story is    ║ │
│ ║    not a single link — it is a genuine web, resolved live. (seed P4, P5) ║ │
│ ╚══════════════════════════════════════════════════════════════════════════╝ │
│                                                                               │
│ ┌── ACTIONS ──────────────────────────────────────────── <h2> ─────────────┐ │
│ │  INVESTIGATOR: [ Record finding ] [ Request clarification ]              │ │
│ │                [ Acknowledge assignment ]                                │ │
│ │  ADJUDICATOR:  [ Adjudicate case ] [ Return for clarification ]          │ │
│ │  APPLICANT (own, only when INFORMATION_REQUESTED):                       │ │
│ │                [ Submit response ]                                       │ │
│ │   ↑ SAME SCREEN, DIFFERENT SERVER-COMPUTED SETS — see Flow 3             │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── ACTIVITY HISTORY ─────────────────────────────────── <h2> ─────────────┐ │
│ │  Merged spoke + hub chronology with origin badges and correlation links  │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
```

#### How the relationship is made visible and traversable — the design decisions

| Decision | What it is | Why |
|---|---|---|
| **Relationship stated in prose, not as an ID** | "Issue raised against Section 13A — Employment history" | An opaque reference (`ISS-2207 → CASE-A-1042`) is what the scratch document already does. The *sentence* is the product |
| **Label sourced from PVQ, not composed by the UI** | `answerSectionLabel` comes over the adapter | Makes the link demonstrably **live**. Editing the seeded label changes the screen — proof it is not hard-coded |
| **Grouped by relationship type with a heading and count** | Three `<h3>` groups | A screen-reader user can navigate by heading straight to "Issues raised against this case" |
| **Panel loads independently of case content** | Separate `DataRegion`, own skeleton | A slow PVQ must not delay the case. Continuity beats completeness in load order |
| **Outstanding-issue indicator is a focus-moving link** | Anchors to the panel heading | The count in the header and the panel below are **the same fact**, connected by one keystroke |
| **Traversal is a client route change** | `/work/PVQ:ISS-2207?returnTo=…&from=EAPP:CASE-A-1042` | The shell **never unmounts**. No tab, no iframe, no spoke origin, no interstitial |
| **`from` is context only, never authorisation** | Used for breadcrumb and audit | Authorisation for the issue is evaluated **independently** — the client does not get to widen its own scope |
| **Traversal itself is audited** | `RELATED_ITEM_TRAVERSED` | The audit chain shows the **path**, not just the endpoints |
| **Unresolvable refs render with an explanation** | Never a broken link, never a silent omission | A reference the hub cannot corroborate is shown as uncertain, with a correlation ID |

#### States

| Region | State | Appearance | Copy |
|---|---|---|---|
| **Outstanding-issue indicator** | Open issues | `usa-alert--warning --slim`, "⚠ 1 outstanding issue" + link | — |
| | **Resolved (post-flagship)** | `usa-alert--success --slim`, "✓ No outstanding issues" | **The visible proof eApp changed.** Re-read from eApp's own API |
| | **Partial completion pending** | `usa-alert--warning`, still "1 outstanding issue" **plus** advisory | "A resolution was recorded in PVQ on {date} but hasn't been applied to this case yet. We're retrying automatically." **The UI never fakes convergence** |
| **Questionnaire** | Loading | Skeleton sections preserving height | sr-only "Loading questionnaire sections" |
| | Ready | Collapsed accordions, first section expanded | — |
| | Arrived via related link | Target section **expanded**, focus on its `<h3>`, text marker "Issue raised on this section" | — |
| **Related items** | Loading | Own skeleton, independent of case body | sr-only "Loading related items" |
| | Ready | Grouped entries with badges | — |
| | Empty | `usa-alert--info --slim` | "No related items in other systems." |
| | **PVQ down** | Entry renders, link disabled, reason shown | "PVQ isn't responding right now, so this related issue can't be opened." |
| | **Not entitled** | Entry renders with explanation | "You don't have access to the related item in PVQ." |
| | **Reference unconfirmable** (subject mismatch / missing case) | Entry renders as uncertain | "This related item couldn't be confirmed. We've logged the problem — reference {id}." |
| | Unknown target system | Entry **dropped and logged** | Never rendered as a dead link |
| **Actions** | eApp down | All disabled with reason | "eApp isn't responding right now." |
| | PVQ down (for the resolve path) | Resolve disabled **pre-emptively** | "eApp isn't responding right now, so this issue can't be resolved yet." |
| **Page** | Owning system down | Error state inside shell | "eApp isn't responding right now, so we can't show this item. Your other work is still available." + `[Try again]` + `[Back to work queue]` |
| | Not authorised | → SCR-30, non-enumerable | — |

#### Interactive elements

| Element | Component | Behaviour |
|---|---|---|
| "Go to issue" (outstanding indicator) | `usa-link` | Anchors to related-panel heading and **moves focus** there |
| Questionnaire section | `usa-accordion` | `aria-expanded`, expansion announced; stable `#SECTION_*` anchors; deep-linkable |
| **"Open this issue"** | `usa-button--outline` in the related panel | **The flagship traversal** → SCR-16 carrying `returnTo` and `from` |
| PDT / IM related entries | `usa-button--outline` | → SCR-17 / SCR-19, same in-shell pattern |
| Action buttons | Per `Y0-patterns §Action panel` | Server-computed set |
| Breadcrumb "Work Queue" | `usa-breadcrumb` link | Restores filters, sort, page |
| "Back to work queue" | `usa-button--unstyled` | Restores queue **and focus to originating row** |

#### Accessibility notes

- **Heading hierarchy:** `<h1>` "Case A-1042 — Security questionnaire review" → `<h2>` Case summary / Questionnaire sections / Related items in other systems / Actions / Activity history → `<h3>` per questionnaire section and per related-item group. **Gap-free** — a screen-reader user can reach "Issues raised against this case" by heading navigation alone.
- **The related-items panel is a `<section aria-labelledby>` containing an accessible list** (`<ul>` of grouped entries), not a bare pile of links. Each entry's accessible name is the full relationship sentence plus the source system — e.g. "Issue raised against Section 13A — Employment history, source system: Personnel Vetting Questionnaire, status Open."
- **Source attribution is in the accessible name of every panel and row** — never conveyed by a coloured badge alone (NFR-02).
- **Focus management on traversal (the highest-risk a11y step in the product):** activating "Open this issue" **must** produce a descriptive `document.title` change and place focus on SCR-16's new `<h1>`. If focus drops to document top or lands on a detached element, a screen-reader user loses **exactly the continuity this product claims to deliver**. Verified explicitly, not assumed (SM-08).
- **Focus management on anchor navigation:** "Go to issue" and "View this section in the case" both move focus to the target heading, not merely scroll to it.
- **Accordion semantics:** each section header is a `<button>` inside its `<h3>`, with `aria-expanded` and `aria-controls`; expansion state is announced.
- **Anchors are stable and deep-linkable** (`#SECTION_13A`), so a related issue can point at the exact answer and a returning link lands in the right place.
- **The "Issue raised on this section" marker is text**, not a highlight colour — legible in grayscale and to a screen reader.
- **Outstanding-issue indicator** conveys its state by icon shape + text ("⚠ 1 outstanding issue" / "✓ No outstanding issues"), never by colour alone. Its change after the flagship action is announced politely.
- **Related-panel loading is announced once on settle** ("Related items loaded. 3 items.") and **does not move focus** — the user may be reading the questionnaire.
- **Degraded related-item entries stay focusable and explained**; a disabled link is paired with adjacent reason text via `aria-describedby`.
- **Keyboard:** entire screen operable — back link, breadcrumb, accordions, related-item links, actions, history. No keyboard traps. Tab order follows visual order.
- **Target sizes** ≥44×44 px; related-item entries are fully clickable cards.
- **320px reflow:** regions stack in normative order. The related-items panel is **promoted above the questionnaire sections at <640px**, because on a narrow viewport the relationship is the reason the user is here and must not sit below four collapsed accordions. An `usa-in-page-navigation` jump list provides direct access to Related items, Actions, and Activity history. No horizontal scroll; usable at 200% zoom.

#### Acceptance

- Case A-1042 shows its related **PVQ issue, PDT designation, and IM assignment**, each correctly badged (FR-F06-05 AC-1).
- The relationship is **sourced live through the adapter** — deleting it in PVQ's store removes it from the panel with no code change (AC-2).
- The relationship **label is sourced from PVQ's data**, verified by changing the seeded label and observing the UI change.
- The outstanding-issue indicator **reflects eApp's state as returned by its own API**, not a hub-computed guess.
- The case opens from the queue in **one activation with no interstitial**, and **zero authentication events** occur.
- Supports **anchor navigation to a named questionnaire section**.
- Traversal produces **zero authentication events and zero navigations outside the hub origin** (SM-02).

---
