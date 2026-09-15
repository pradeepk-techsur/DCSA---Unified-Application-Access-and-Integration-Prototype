### Flow 1: FLAGSHIP — eApp case → related PVQ issue → dual-system update

> **This is the single most important flow in the product.** It maps PRD **F7**, JTBD-01.1, and JRN-01.01. Per the project charter: *if everything else fails, this must work.* Target: complete manually in **under three minutes** following the demo script.

**Trigger:** Dashboard alert `ALERT-NEW-PVQ-ISSUE` — "New issue raised on CASE-A-1042 — 3 days ago."
**User Stories:** US-059, US-060, US-061, US-062, US-063, US-064, US-065, US-066, US-067, US-068, US-069
**Features:** F7 (flagship), F1 (session), F2 (authz), F3 (shell), F5 (queue), F6 (detail), F13 (audit), F14 (a11y)
**Persona:** PER-01 Marcus Vale (Investigator)
**Demo path:** ✅ PRIMARY SCRIPTED DEMO — Segment 1

```
[SCR-09 Investigator dashboard]
   │  "Newly raised PVQ issues" widget
   │  ▣ PVQ  "Issue raised against Section 13A — Employment history"
   │         Case A-1042 · raised 3 days ago
   │
   ▼  activate alert link                            ← ≤2 clicks from sign-in
[SCR-13 Unified work queue]
   │  default view: assigned to me, due date ascending
   │  chips visible: [Assigned to: me ✕] [Status: Open, In progress ✕]
   │  EAPP:CASE-A-1042 on page 1, NO filtering required
   │
   │  ┌───────────────────────────────────────────────────────┐
   │  │ Case A-1042 — Section 13A employment history          │
   │  │ ▣ eApp │ SUBJ-00418 │ Under review │ Routine │ 4 days │
   │  └───────────────────────────────────────────────────────┘
   │
   ▼  activate row  (returnTo encodes filters+sort+page)
[SCR-15 eApp case view]                    ◀── THE HINGE ───────────────┐
   │  breadcrumb: Work Queue › ▣ eApp Case A-1042                       │
   │  header: "1 outstanding issue"  ← LINK, moves focus to panel       │
   │                                                                    │
   │  Questionnaire sections (usa-accordion, anchored #SECTION_13A)     │
   │    ▸ Section 13A — Employment history                             │
   │        employer[0].endDate  ·  "March 2019"   ← the flagged answer │
   │                                                                    │
   │  ╔═ Related items in other systems ═══════════════════════════╗   │
   │  ║ Issues raised against this case (1)                        ║   │
   │  ║  ▣ PVQ  ISS-2207 · Open · raised 3 days ago                ║   │
   │  ║  "Issue raised against Section 13A — Employment history"   ║   │
   │  ║       ↑ label sourced LIVE from PVQ's answerSectionLabel,  ║   │
   │  ║         not composed by the UI, not hard-coded             ║   │
   │  ║ Position designation (1)   ▣ PDT  PDT-0771 · Approved      ║   │
   │  ║ Case assignment (1)        ▣ IM   IM-3310 · Active         ║   │
   │  ╚════════════════════════════════════════════════════════════╝   │
   │        ↑ THREE relationship types — the cross-system story is      │
   │          not a single link                                         │
   │                                                                    │
   ▼  activate the related PVQ issue                                    │
   │                                                                    │
   │  ╔══ THE TRAVERSAL — highest-risk step in the product ══════════╗ │
   │  ║ • in-shell client route change, header/banner/nav STAY MOUNTED║ │
   │  ║ • NO new tab, NO iframe, NO redirect to a spoke origin        ║ │
   │  ║ • NO credential prompt, NO interstitial                       ║ │
   │  ║ • ZERO identifiers typed, copied, or re-entered   (SM-04)     ║ │
   │  ║ • focus moves to the new <h1>; document.title updates         ║ │
   │  ║ • RELATED_ITEM_TRAVERSED audit record written — the chain      ║ │
   │  ║   shows the PATH, not just the endpoints                      ║ │
   │  ╚═══════════════════════════════════════════════════════════════╝ │
   ▼                                                                    │
[SCR-16 PVQ issue detail & resolution]                                  │
   │  breadcrumb: Work Queue › ▣ eApp Case A-1042 › ▣ PVQ Issue ISS-2207│
   │  "Related case" strip: Part of eApp Case A-1042 — {subject} ───────┘
   │
   │  The flagged answer quoted IN CONTEXT:
   │    question text · answerSnapshot ("March 2019") · section label
   │    [ View this section in the case → ] deep-anchors to #SECTION_13A
   │
   │  ┌─ Resolve this issue ─────────────────────────────────┐
   │  │ usa-fieldset / legend "Resolution disposition"        │
   │  │  ( ) Substantiated          ← radio, each with hint   │
   │  │  ( ) Unsubstantiated                                  │
   │  │  ( ) Resolved with clarification                      │
   │  │  ( ) Referred for further review                      │
   │  │                                                        │
   │  │ Resolution narrative (required)  usa-character-count   │
   │  │ [ 20–4000 chars ]                                     │
   │  │                                                        │
   │  │ [x] I have reviewed the flagged answer   ← gate        │
   │  │                                                        │
   │  │ ⓘ This updates PVQ and eApp.   ← BEFORE they act      │
   │  │ [ Resolve issue ]                                     │
   │  └───────────────────────────────────────────────────────┘
   │
   ▼  submit
   │  "Resolving issue. This updates two systems." (aria-busy, button disabled)
   │  NOT OPTIMISTIC — no state shown until both spokes answer
   │
   ├─── VALIDATION FAILS ──▶ error summary, focus to summary, in-page
   │                          links, NARRATIVE PRESERVED VERBATIM
   │                          → back to form
   │
   ├─── EITHER SYSTEM DOWN PRE-FLIGHT ──▶ refused BEFORE any write
   │       "eApp isn't responding right now, so nothing was changed."
   │       (the action was already disabled — see Flow 2)
   │
   ▼  orchestration: authorize BOTH → validate → verify relationship →
   │  pre-flight health → reconciliation row → PVQ leg → eApp leg
   │
[SCR-20 Dual-system confirmation]
   │
   ├── BOTH LEGS COMMITTED ──▶ ✓ "Resolution complete"
   │      ┌──────────┬──────────────────┬─────────────────────┬─────────┐
   │      │ System   │ What we asked for│ What it reports NOW │ Outcome │
   │      │ ▣ PVQ    │ Resolve as       │ Resolved —          │ ✓       │
   │      │          │ Substantiated    │ Substantiated       │ Updated │
   │      │ ▣ eApp   │ Clear ISS-2207   │ No outstanding      │ ✓       │
   │      │          │                  │ issues              │ Updated │
   │      └──────────┴──────────────────┴─────────────────────┴─────────┘
   │        ↑ values RE-READ from each spoke, not what the hub intended
   │
   └── eApp LEG FAILED ──▶ ! "Partly completed"    ← word "success" ABSENT
          PVQ ✓ Updated  ·  eApp ✕ Not updated (1 outstanding issue)
          "we're retrying automatically"  [ Retry eApp update ]
          → SCR-15 shows advisory, still says "1 outstanding issue"
            because THAT IS GENUINELY eApp's STATE. UI never fakes convergence.
   │
   ▼  three real destinations + the audit link
   ├── "View the updated issue in PVQ" ──▶ SCR-16, re-read from PVQ
   ├── "Return to eApp Case A-1042"    ──▶ SCR-15, re-read, "No outstanding issues"
   ├── "Back to work queue"            ──▶ SCR-13, ORIGINAL filters/sort/page
   └── "View audit trail for this action" ──▶ SCR-34 chain view
          ┌────────────────────────────────────────────────────────┐
          │ "Investigator Marcus Vale resolved PVQ issue ISS-2207  │
          │  against eApp case A-1042 on 2026-09-15.               │
          │  Both systems updated."                                │
          │  1 WORK_ITEM_VIEWED        ▣ eApp                      │
          │  2 RELATED_ITEMS_RESOLVED  HUB                         │
          │  3 RELATED_ITEM_TRAVERSED  HUB    ← the path, not just │
          │  4 WORK_ITEM_VIEWED        ▣ PVQ     the endpoints     │
          │  5 ORCHESTRATION_STARTED   HUB                         │
          │  6 ISSUE_RESOLVED          ▣ PVQ  status: Open →       │
          │                                   Resolved—Substantiated│
          │  7 CASE_ISSUE_CLEARED      ▣ eApp outstanding: 1 → 0   │
          │  8 ORCHESTRATION_COMPLETED HUB                         │
          │  ── all eight share ONE correlationId ──               │
          └────────────────────────────────────────────────────────┘
```

#### Steps

| # | Step | Screen | UI elements | Design obligation |
|---|---|---|---|---|
| 1 | Orient | SCR-09 | "Newly raised PVQ issues" `usa-card` widget | The exception is **announced**, not discovered. Links directly into the item that produced it (F15) |
| 2 | Enter the work | SCR-13 | `usa-table`, source badges, default chips | Case appears on page 1 **without filtering**. Next action ≤2 clicks from sign-in |
| 3 | Open the case | SCR-15 | Row link, `returnTo` | Same chrome, no discontinuity — "I didn't go anywhere" |
| 4 | Read the answer | SCR-15 | `usa-accordion` section, anchor `#SECTION_13A` | The flagged answer is rendered in the same view that links to the issue raised against it |
| 5 | **Discover the relationship** | SCR-15 | Related-items panel, grouped by relationship type | **The delight moment.** Relationship explained in *words*, sourced live from PVQ. Slow down here in the demo |
| 6 | **Traverse** | SCR-15 → SCR-16 | In-shell route change, breadcrumb grows | **The highest-risk step.** Any prompt, tab, or interstitial and the persona stops believing the product |
| 7 | Resolve | SCR-16 | `usa-fieldset` radios + `usa-textarea` + gate checkbox | Most consequential write in the product. Must never fail silently or lose typed text |
| 8 | **See both systems answer** | SCR-20 | Per-system read-back table | **Peak trust.** Each spoke's *own* answer, provable by independent API call |
| 9 | Verify on the case | SCR-15 | Re-read, "No outstanding issues" | Not cached — proves the parent state changed |
| 10 | Leave the record | SCR-34 | Chain view, one correlation ID | "One story, not four rows" |

#### Decision point — disposition drives which systems are written

The dual write is **disposition-driven, not a blanket rule** — designed so the demo can show both a clearing and a non-clearing path (FR-F07a-04 rule 5):

| Disposition | PVQ result | eApp result | `targetSystems` | Dual-system notice shown? |
|---|---|---|---|---|
| **Substantiated** *(flagship demo path)* | `RESOLVED_SUBSTANTIATED` | outstanding −1; if 0 → `REVIEW_COMPLETE_PENDING_ADJUDICATION` | PVQ, EAPP | ✓ "This updates PVQ and eApp." |
| Unsubstantiated | `RESOLVED_UNSUBSTANTIATED` | outstanding −1, same rule | PVQ, EAPP | ✓ |
| Resolved with clarification | `RESOLVED_WITH_CLARIFICATION` | outstanding −1, same rule | PVQ, EAPP | ✓ |
| **Referred for further review** | `REFERRED` | **unchanged** | PVQ only | ✗ — notice reads "This updates PVQ." |

The notice text updates **live as the radio selection changes**, so the user always knows the blast radius before submitting.

#### Failure and alternate paths

| Condition | What the user sees | Recovery |
|---|---|---|
| **PVQ committed, eApp failed** | SCR-20 in **partial** state. `<h1>` "Partly completed". Per-system table shows one ✓ and one ✕. **"Success" appears nowhere.** Correlation ID + `[Retry eApp update]` | Auto-retry (5s/15s/45s/135s); manual retry available; converges without user action |
| PVQ failed (leg 1) | Error on **SCR-16, not SCR-20** — there is no dual outcome to confirm. "PVQ isn't responding right now, so nothing was changed." | "Try again". eApp verified untouched |
| PVQ timeout, outcome unknown | `UPSTREAM_INDETERMINATE`: "We're not sure whether PVQ recorded your resolution. Refresh this issue to check its status before trying again." | The **only** permitted ambiguity, and it says so explicitly |
| Either system DOWN before submit | Action **pre-emptively disabled** with named reason. Never allowed to fail mid-submission | Auto re-enables on recovery, announced politely, no reload |
| Validation failure | Error summary, focus moved, in-page links, **narrative preserved verbatim** | Fix the named field, resubmit |
| Session timeout mid-narrative | SCR-06 modal, countdown, "Stay signed in" — **entered data not discarded** | Extend in place; or re-auth returns via `returnTo` |
| `ISS-2207` already resolved | Banner on SCR-16: "This issue was already resolved by {actor} on {date}. No further action is needed." Form disabled with that reason; action **absent** because the server computes it unavailable | Run reset, or drive on the second seeded open issue |
| Issue references a non-existent case *(seeded orphan)* | Related panel: "This related item couldn't be confirmed. We've logged the problem — reference {id}." **Not a broken link, not a stack trace** | Documented seed condition — makes mismatch handling demonstrable |
| Subject mismatch between systems | Same "couldn't be confirmed" state; `INTEGRATION_REFERENCE_MISMATCH` logged. **The hub never displays a relationship it cannot corroborate** | Administrator sees it in the issue log |
| Direct URL to another investigator's case | SCR-30 access denied, non-enumerable, correlation ID, exits to dashboard and queue; denial audited | Return to own queue |
| Client submits a `parentCaseId` for a different case | `RELATIONSHIP_MISMATCH` — **the client does not get to tell the server which case to update** | Refresh and retry |

#### Exit criteria (the acceptance contract)

- Completes end-to-end in **under three minutes**, manually, from the demo script (SM-01).
- **Exactly one** authentication event in the audit log (SM-02).
- **Zero** manual re-entry of subject, case, or issue identifiers (SM-04).
- `GET {pvq}/issues/ISS-2207` and `GET {eapp}/cases/CASE-A-1042`, called **directly against the spokes**, both return updated state (SM-03).
- Retrievable as a **single correlated chain** of ≥5 records (SM-20).
- Returning to the queue restores prior filters, sort, and page.
- Completed **keyboard-only** in a separate verification pass (SM-08 / US-069).
- **Zero serious or critical** accessibility violations on SCR-13, 15, 16, 20 (SM-07).
- Demo banner present on every screen visited (NFR-13).

#### Accessibility notes

> This is the accessibility pass that matters most, because it is the path a reviewer will watch. **Keyboard-only and screen-reader completable, start to finish.**

- **Queue table (step 2):** `<caption>` with live result count, `<th scope="col">`, `scope="row"` on title. Sortable headers announce sort state. Filter and pagination changes announce result count. Without this the queue is unusable non-visually.
- **The traversal (step 6) is the highest-risk accessibility step in the product.** It **must** produce a descriptive `document.title` change and place focus on the new `<h1>`. If focus drops to document top or lands on a detached element, a screen-reader user loses **precisely the continuity this product claims to deliver**. Verified explicitly, not assumed.
- **Source attribution** (`eApp`, `PVQ`, `PDT`, `IM`) is in the **accessible name** of every row, panel, and breadcrumb segment — never a coloured badge alone (NFR-02).
- **Related-items panel** is a `<section aria-labelledby>` containing an accessible **list**, not a bare set of links. Groups carry a heading and a count per relationship type.
- **Resolution form (step 7):** `<fieldset>`/`<legend>` around the disposition radios; hint text per option via `aria-describedby`; required indicated by the **text** "required"; character counter announced at 90% and 100% only; inline errors + error summary with focus management and in-page links.
- **Dual-system confirmation (step 8):** announced `aria-live="polite"` **and focus moved deliberately to the alert** — this is a result the user is waiting for. **Contrast with degraded warnings, which must never steal focus.** That asymmetry is intentional and must be preserved.
- **Confirmation table:** real `<table>`, `<caption>` "Results in each connected system", `scope` attributes, outcome as text + icon.
- **Status vocabulary** — open, resolved, overdue, blocked — distinguishable in **grayscale** by text and/or icon shape.
- **Focus return:** "Back to work queue" restores filters, sort, page **and returns focus to the row the user came from**.
- **Zoom and reflow:** usable at 200% zoom and at a **320px-equivalent half-width window** with no horizontal scrolling — Marcus routinely runs the browser beside a notes document (NFR-16).
- **Anchor navigation:** "View this section in the case" deep-links to `#SECTION_13A` and moves focus to that section's heading, with a text marker "Issue raised on this section."

---
