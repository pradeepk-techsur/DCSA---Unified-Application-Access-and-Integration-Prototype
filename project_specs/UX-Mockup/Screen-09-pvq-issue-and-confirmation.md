### Screen: SCR-16 — PVQ issue detail and resolution form

**Purpose:** The destination of the flagship traversal, and the product's **most consequential write**. Present the flagged answer in context, take a disposition and a narrative, and hand off to the orchestrated dual-system update.
**User Stories:** US-062, US-063, US-052, US-113, US-126 · **Features:** F7, F6, F2, F14, F16
**Template:** `DetailPage` + `FormPage` action region · **Seeded demo issue:** `PVQ:ISS-2207`

#### Layout

```
│ ‹ Back to eApp Case A-1042                                                    │
│ Work Queue › ▣ eApp Case A-1042 › ▣ PVQ Related Issue ISS-2207               │
│   ↑ THE CONTINUITY PROOF: breadcrumb names BOTH systems, in one line,        │
│     with no identifier typed by the user                                     │
│                                                                               │
│ Issue ISS-2207 — Section 13A employment end date                <h1>          │
│                                                     ← focus lands HERE on    │
│                                                       traversal              │
│ ┌══ RELATED CASE CONTEXT STRIP ═══════════════════════════════════════════┐  │
│ │ ▣ eApp   Part of Case A-1042 — Theodore Q. Lansbury        [ Open → ]   │  │
│ │   ↑ the case context travels WITH him. He never has to remember where   │  │
│ │     he came from, and the way back is one control. (FR-F07a-03 rule 3)  │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── ISSUE SUMMARY ─────────────────────────────────────────────────────────┐ │
│ │ System of record: PVQ — Personnel Vetting Questionnaire                  │ │
│ │ Synthetic record — demo data                                             │ │
│ │ Status  ○ Open      Raised  12 Sep 2026 (3 days ago)                     │ │
│ │ Subject SUBJ-00418 · Theodore Q. Lansbury                                │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── THE FLAGGED ANSWER, QUOTED IN CONTEXT ───────────── <h2> ──────────────┐ │
│ │  usa-summary-box                                                         │ │
│ │                                                                          │ │
│ │  Section 13A — Employment history                                        │ │
│ │                                                                          │ │
│ │  Question                                                                │ │
│ │  "Provide the end date of your employment with this employer."           │ │
│ │                                                                          │ │
│ │  Answer as submitted                          ← answerSnapshot, stored   │ │
│ │  ┌────────────────────────────────────────┐    by PVQ so the issue stays │ │
│ │  │  March 2019                            │    readable even if the      │ │
│ │  └────────────────────────────────────────┘    answer later changes      │ │
│ │                                                                          │ │
│ │  Why this was raised                                                     │ │
│ │  The end date does not reconcile with the employer's HR record.          │ │
│ │                                                                          │ │
│ │  [ View this section in the case → ]  ← deep-anchors to #SECTION_13A     │ │
│ │                                          on SCR-15 and MOVES FOCUS       │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── RESOLVE THIS ISSUE ──────────────────────────────── <h2> ──────────────┐ │
│ │                                                                          │ │
│ │  <fieldset>  <legend>Resolution disposition (required)</legend>          │ │
│ │                                     ← RADIO not select: the options are  │ │
│ │  ( ) Substantiated                    few and CONSEQUENTIAL              │ │
│ │      The discrepancy is confirmed and material to the investigation.     │ │
│ │  ( ) Unsubstantiated                  ← each option carries hint text    │ │
│ │      The discrepancy was not confirmed; the answer stands.                 via aria-describedby
│ │  ( ) Resolved with clarification                                         │ │
│ │      The subject or a source provided information that resolves it.      │ │
│ │  ( ) Referred for further review                                         │ │
│ │      Requires escalation. This does NOT clear the case's outstanding     │ │
│ │      issue.                     ← the non-clearing path, stated UP FRONT │ │
│ │  </fieldset>                                                             │ │
│ │                                                                          │ │
│ │  Resolution narrative (required)                                         │ │
│ │  How you resolved this issue. An adjudicator may read this months from   │ │
│ │  now without other context.        ← usa-hint, aria-describedby          │ │
│ │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│ │  │ Contacted Meridian Logistics HR on 11 September. Their record       │ │ │
│ │  │ shows separation in January 2019, not March...                      │ │ │
│ │  └────────────────────────────────────────────────────────────────────┘ │ │
│ │  usa-character-count: 247 of 4000 characters                             │ │
│ │   ↑ announced POLITELY at 90% and 100% ONLY — never per keystroke        │ │
│ │                                                                          │ │
│ │  [x] I have reviewed the flagged answer (required)                       │ │
│ │      ↑ the DELIBERATE-ACTION GATE                                        │ │
│ │                                                                          │ │
│ │  ┌──────────────────────────────────────────────────────────────────┐   │ │
│ │  │ ⓘ This updates PVQ and eApp.                                     │   │ │
│ │  │   ↑ THE USER IS TOLD BEFORE THEY ACT that two systems change.    │   │ │
│ │  │     Text updates LIVE as the disposition selection changes —     │   │ │
│ │  │     "Referred for further review" changes it to "This updates    │   │ │
│ │  │     PVQ." (FR-F06-03 rule 3)                                     │   │ │
│ │  └──────────────────────────────────────────────────────────────────┘   │ │
│ │                                                                          │ │
│ │  [ Resolve issue ]        [ Cancel ]                                     │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── ISSUE HISTORY ────────────────────────────────────── <h2> ─────────────┐ │
```

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | Related-case context strip | Directly under `<h1>` | Continuity: he must never wonder where he is or how to get back |
| **Primary** | The flagged answer, quoted | Above the form | **He cannot write a defensible narrative without the answer on screen.** Today he writes it blind and over-explains to compensate |
| **Primary** | Disposition radios | Form top | The consequential choice |
| **Primary** | Narrative textarea | Form middle | The record an adjudicator reads in nine months |
| **Primary** | Dual-system notice | Immediately above submit | Blast radius disclosed **before** the act |
| Secondary | Issue summary | Under the context strip | Status, dates, subject |
| Secondary | Issue history | Bottom | — |

#### States

| State | Appearance | Copy / behaviour |
|---|---|---|
| **Ready** | Form enabled, disposition unselected | — |
| **Loading** | Section skeletons; context strip settles first | sr-only "Loading issue" |
| **Submitting** | Primary button disabled, `aria-busy="true"` | Announced once: "Resolving issue. This updates two systems." **Not optimistic** — no state shown until both spokes answer |
| **Validation failure** | Error summary at form top, `role="alert"`, **focus moved to it**, in-page links; each field `aria-invalid="true"` + inline error; title prefixed "Error: " | "There is a problem. Fix the following, then try again."<br>• "Choose a resolution disposition."<br>• "Enter at least 20 characters describing how you resolved this issue."<br>• "Confirm that you have reviewed the flagged answer."<br>**THE NARRATIVE IS PRESERVED VERBATIM** |
| **Already resolved** | `usa-alert--info` banner; form **disabled with that reason**; the resolve action is **absent** because the server computes it unavailable | "This issue was already resolved by {actor} on {date}. No further action is needed." |
| **PVQ down** | Page-level error inside the shell | "PVQ isn't responding right now, so we can't open this issue. Your other work is still available." + `[Try again]` + `[Back to the case]` |
| **eApp down (pre-emptive)** | Resolve button **disabled before submission**, reason as adjacent text | "eApp isn't responding right now, so this issue can't be resolved yet." **Half-performing a dual write we already know will fail is worse than declining it** |
| **Recovery** | Button re-enables **without reload** | Announced politely: "eApp is available again. You can now resolve this issue." |
| **Not the assignee** | Action absent; explanatory text | "You don't have permission to resolve this issue." |
| **Stale `stateVersion`** | Error alert | "This item changed since you opened it. Refresh to see the latest version, then try again." |
| **Leg-1 (PVQ) failure** | **Stays on SCR-16**, error alert — **not** SCR-20, because there is no dual outcome to confirm | "PVQ isn't responding right now, so nothing was changed." + `[Try again]` |
| **Indeterminate PVQ outcome** | Error alert, the **one permitted ambiguity** | "We're not sure whether PVQ recorded your resolution. Refresh this issue to check its status before trying again — reference {id}." |
| **Adjudicator viewing** | Resolve action **omitted entirely** (role may never perform it); `[Request clarification]` shown instead | The RBAC contrast, demo Segment 4 |

#### Validation rules (server-authoritative, mirrored client-side)

| Field | Rule | Message |
|---|---|---|
| `disposition` | One of four values | "Choose a resolution disposition." |
| `resolutionNarrative` | ≥20 chars trimmed | "Enter at least 20 characters describing how you resolved this issue." |
| | ≤4000 chars | "Shorten this to 4000 characters or fewer. You've used {m}." |
| `reviewedAnswerConfirmed` | Must be `true` | "Confirm that you have reviewed the flagged answer." |
| `parentCaseId` | Must match the issue's actual `parentCaseRef`, resolved server-side | "We couldn't confirm which case this issue belongs to. Refresh the page and try again — reference {id}." **The client does not get to tell the server which case to update** |

---

### Screen: SCR-20 — Dual-system confirmation

**Purpose:** **Prove** both systems changed, by reporting what each system independently says about itself. This is the peak-trust moment of the entire product.
**User Stories:** US-064, US-065, US-066, US-067, US-068 · **Features:** F7, F13, F16
**Template:** `DetailPage` · **Pattern:** `Y0-patterns §Confirmation with read-back`

#### Layout — COMPLETED

```
│ Work Queue › ▣ eApp Case A-1042 › ▣ PVQ Issue ISS-2207 › Resolution result   │
│                                                                               │
│ Resolution complete                                             <h1>          │
│                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓  PVQ and eApp both updated.                                            │ │
│ │    usa-alert--success · role="status" · RECEIVES FOCUS on render         │ │
│ │    announced once: "Resolution complete. PVQ and eApp both updated."     │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── RESULTS IN EACH CONNECTED SYSTEM ────────────────── <h2> ──────────────┐ │
│ │ <caption>Results in each connected system</caption>                      │ │
│ │ ┌──────────┬──────────────────────┬────────────────────────┬──────────┐ │ │
│ │ │ System   │ What we asked for    │ What the system        │ Outcome  │ │ │  ← th scope="col"
│ │ │          │                      │ reports now            │          │ │ │
│ │ ├──────────┼──────────────────────┼────────────────────────┼──────────┤ │ │
│ │ │ ▣ PVQ    │ Resolve issue        │ Resolved —             │ ✓        │ │ │  ← th scope="row"
│ │ │          │ ISS-2207 as          │ Substantiated          │ Updated  │ │ │
│ │ │          │ Substantiated        │ read 15:04:11 UTC      │          │ │ │
│ │ ├──────────┼──────────────────────┼────────────────────────┼──────────┤ │ │
│ │ │ ▣ eApp   │ Clear outstanding    │ No outstanding issues  │ ✓        │ │ │
│ │ │          │ issue ISS-2207 on    │ Case state: Review     │ Updated  │ │ │
│ │ │          │ Case A-1042          │ complete, pending      │          │ │ │
│ │ │          │                      │ adjudication           │          │ │ │
│ │ │          │                      │ read 15:04:12 UTC      │          │ │ │
│ │ └──────────┴──────────────────────┴────────────────────────┴──────────┘ │ │
│ │                                                                          │ │
│ │  ★ THE "WHAT THE SYSTEM REPORTS NOW" COLUMN IS A FRESH RE-READ FROM      │ │
│ │    EACH SPOKE — not the value the hub intended to write. The timestamp   │ │
│ │    makes that evident. This screen reports OBSERVED state, not ASSERTED  │ │
│ │    state, and that distinction is the whole point. (FR-F07b-04 rule 1)   │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── WHAT YOU RECORDED ────────────────────────────────── <h2> ─────────────┐ │
│ │ Disposition  Substantiated                                               │ │
│ │ Narrative    "Contacted Meridian Logistics HR on 11 September..."        │ │
│ │   ↑ so the user can confirm what they submitted                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ [ View the updated issue in PVQ ]   → SCR-16, re-read from PVQ               │
│ [ Return to eApp Case A-1042 ]      → SCR-15, re-read, "No outstanding issues"│
│ [ Back to work queue ]              → SCR-13, ORIGINAL filters/sort/page     │
│ [ View audit trail for this action ]→ SCR-34 chain, filtered to correlationId│
│    ↑ ALL FOUR ARE REAL DESTINATIONS. All re-read LIVE from their owning      │
│      spokes — the confirmation does NOT cache a pre-computed result and      │
│      present it as a fresh read. (FR-F07a-05 rule 2)                         │
```

#### Layout — PARTIALLY COMPLETED (the honesty state)

```
│ Partly completed                                                <h1>          │
│                          ↑ NOT "success". The word "success" appears NOWHERE │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ !  PVQ recorded your resolution. eApp hasn't been updated yet —          │ │
│ │    we're retrying automatically. You can also retry now.                 │ │
│ │    Reference 01JD7K2Q9X8V3MZ4R6T   [⧉ Copy]                              │ │
│ │    usa-alert--warning · role="alert" · receives focus                    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────┬──────────────────────┬────────────────────────┬──────────────┐  │
│ │ ▣ PVQ    │ Resolve as           │ Resolved —             │ ✓ Updated    │  │
│ │          │ Substantiated        │ Substantiated          │              │  │
│ ├──────────┼──────────────────────┼────────────────────────┼──────────────┤  │
│ │ ▣ eApp   │ Clear outstanding    │ 1 outstanding issue    │ ✕ Not        │  │
│ │          │ issue ISS-2207       │ (unchanged)            │   updated    │  │
│ └──────────┴──────────────────────┴────────────────────────┴──────────────┘  │
│   ↑ EVERY LEG RENDERS, INCLUDING THE FAILED ONE. A leg is never omitted      │
│     for tidiness. (FR-F07b-04 validation rule)                               │
│                                                                               │
│ [ Retry eApp update ]   ← idempotent; available to the original principal    │
│                           and to Administrators                              │
│ [ View the updated issue in PVQ ]  [ Back to work queue ]                    │
│                                                                               │
│ announced once: "Partly completed. PVQ updated. eApp not updated."           │
│                                                                               │
│ ⓘ PVQ's resolution STANDS. No rollback is attempted — reversing a recorded   │
│   investigative disposition would fabricate a false history in the system    │
│   of record. The strategy is FORWARD RECOVERY. (FR-F07b-03 rule 1)           │
│ ⓘ SCR-15 continues to show "1 outstanding issue", because that is GENUINELY  │
│   eApp's state, plus an advisory that a retry is in progress.                │
│   THE UI NEVER FAKES CONVERGENCE. (rule 8)                                   │
```

#### Three outcome presentations

| `overallOutcome` | `<h1>` | Alert | ARIA | Actions |
|---|---|---|---|---|
| `COMPLETED` | "Resolution complete" | `usa-alert--success` | `role="status"` | 4 destinations |
| `PARTIALLY_COMPLETED` | **"Partly completed"** | `usa-alert--warning` | `role="alert"` | + `[Retry eApp update]` |
| `FAILED` | "Not completed" | `usa-alert--error` | `role="alert"` | `[Try again]`, `[Back to the issue]` |

**Additional states**

| Condition | Row copy | Control |
|---|---|---|
| Re-read failed for a system | "We couldn't confirm the current state in {System}." | `[Check again]` — the view **degrades honestly rather than omitting the row** |
| Manual retry failed again | "eApp still isn't responding. PVQ's record is unchanged and correct. We'll keep retrying — reference {id}." | `[Retry]` remains |
| Retries exhausted | "eApp couldn't be updated after several attempts. PVQ's record is correct. An administrator has been notified — reference {id}." | Escalated to the integration-issue log |
| Retry on a completed transaction | "This was already completed. Both systems are up to date." | — |
| Referral disposition (single leg) | Table renders **one row** (PVQ only); `<h1>` "Resolution complete" | eApp leg legitimately absent — the transaction had one leg |

#### Accessibility notes — SCR-16 and SCR-20

- **Heading hierarchy:** SCR-16 `<h1>` issue title → `<h2>` The flagged answer / Resolve this issue / Issue history. SCR-20 `<h1>` outcome → `<h2>` Results in each connected system / What you recorded. Gap-free.
- **Focus on traversal arrival (SCR-16):** focus lands on the `<h1>` and `document.title` updates. This is the single most-watched focus behaviour in the product.
- **Focus on confirmation (SCR-20):** the summary alert **receives focus** and is announced once. This is the **one deliberate exception** to "async updates never take focus" — the user submitted this and is waiting for it. Degraded notices elsewhere must never behave this way; preserving that asymmetry is a requirement, not a detail.
- **Form semantics (SCR-16):** `<fieldset>`/`<legend>` around the disposition radios; per-option hint text via `aria-describedby`; required indicated by the **text** "(required)"; `usa-character-count` announced politely at **90% and 100% only**; textarea labelled with `for`/`id`, never a placeholder-as-label.
- **Error summary:** `role="alert"`, focus moved to it, in-page links to each offending field, `aria-invalid="true"` on the field, document title prefixed "Error: ". **The narrative is preserved verbatim** — losing a long free-text narrative to a validation failure is a trust-destroying event and is explicitly prohibited.
- **Dual-system notice** is plain text in a `usa-alert--slim`, **programmatically associated to the submit button via `aria-describedby`**, and its text updates live with the disposition selection — announced politely, once, debounced.
- **Disabled submit** is removed from the tab order with its reason as adjacent text linked by `aria-describedby`.
- **Confirmation table (SCR-20):** real `<table>` with `<caption>` "Results in each connected system", `<th scope="col">` on all four columns, `scope="row"` on the System cell. Outcome is **text + icon shape** ("✓ Updated" / "✕ Not updated") — never colour alone.
- **Read-back timestamps are text**, so the observed-not-asserted distinction is available non-visually.
- **Correlation ID** is monospace, selectable, with a copy control announcing "Reference copied," and linked to the chain view with the accessible name "View the full audit chain for this action."
- **Keyboard:** SCR-16 and SCR-20 are fully keyboard-operable end to end — this is part of the keyboard-only flagship pass (US-069, SM-08).
- **Colour independence:** every outcome, status, and disposition is text + icon. A grayscale render of SCR-20 still distinguishes completed from partial.
- **Target sizes** ≥44×44 px for radios, checkbox, buttons, and copy control.
- **320px reflow:** the disposition radios stack with full-width hit areas; the confirmation table reflows to **stacked per-system cards**, each retaining "System / What we asked for / What it reports now / Outcome" as a labelled definition list — the per-system read-back is never lost to a horizontal scroll.

#### Acceptance

- The confirmation table shows PVQ `Resolved — Substantiated` and eApp `No outstanding issues`, **both from fresh reads** (SM-03).
- In partial state the table shows one committed and one failed row, **with the retry action present**, and **the word "success" appears nowhere** (R-06).
- SCR-20 passes the accessibility scan and is **fully keyboard-operable**.
- The form validates **identically client-side and server-side**; disabling client validation does not permit an invalid submission.
- Submitting a `parentCaseId` for a different case is **rejected**.
- The dual-system notice appears **before** submission, and the referral disposition writes **only PVQ**.

---
