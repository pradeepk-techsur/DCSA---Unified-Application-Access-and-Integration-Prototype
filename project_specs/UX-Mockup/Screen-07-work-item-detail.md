### Screen: SCR-14 — Work-item detail (generic)

**Purpose:** The page where work actually gets done. The generic `DetailPage` every item type specialises — SCR-15 (eApp), SCR-16 (PVQ), SCR-17 (PDT), SCR-18 (IEP), SCR-19 (IM) are all this screen with a different content profile.
**User Stories:** US-050, US-051, US-052, US-053, US-054, US-055, US-056, US-057, US-058, US-126 · **Features:** F6, F2, F13, F16
**Template:** `DetailPage`

> **One dynamic route serves every item type** (`/work/[workItemId]` where `workItemId = {sourceSystem}:{nativeId}`). The body renders from the registry-supplied `contentProfile`, so **a sixth application's detail page exists the moment it is registered** — no new route, no new file. Unknown profiles fall back to a labelled definition list, never an empty page.

#### Layout — region order is normative

```
│ ‹ Back to work queue          ← persistent, ABOVE the <h1>, restores        │
│                                 filters+sort+page+focus                     │
│                                                                             │
│ Work Queue › ▣ eApp Case A-1042        ← usa-breadcrumb, cross-system      │
│                                                                             │
│ Case A-1042 — Section 13A employment history              <h1>              │
│                                                                             │
│ ┌── SUMMARY HEADER ───────────────────────────────────────────────────────┐ │
│ │ System of record: eApp — Electronic Application       ← REPEATED IN TEXT│ │
│ │ Synthetic record — demo data                          ← per FR-F17-08   │ │
│ │                                                                         │ │
│ │ Subject     SUBJ-00418 · Theodore Q. Lansbury                           │ │
│ │ Status      Under review              Priority   Routine                │ │
│ │ Due         19 September 2026 (in 4 days)                               │ │
│ │ Assignee    Marcus Vale (you)                                           │ │
│ │ Last activity  12 September 2026 09:11 UTC (3 days ago)                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌── TYPE-SPECIFIC CONTENT SECTIONS ──────────────────── <h2> ─────────────┐ │
│ │  Rendered from contentProfile. See SCR-15…19 for each profile.          │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌── RELATED ITEMS IN OTHER SYSTEMS ──────────────────── <h2> ─────────────┐ │
│ │  Grouped by relationship type, each group with a heading and a count.   │ │
│ │  See Y0-patterns and SCR-15 for the full treatment — this panel is the  │ │
│ │  ON-RAMP TO THE FLAGSHIP WORKFLOW.                                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌── ACTIONS ─────────────────────────────────────────── <h2> ─────────────┐ │
│ │  Server-computed ActionDescriptor[] only. See Y0-patterns §Action panel.│ │
│ │                                                                         │ │
│ │  [ Record finding ]              ← at most ONE primary                  │ │
│ │  [ Request clarification ]       ← usa-button--outline                  │ │
│ │  [ Acknowledge assignment ] (disabled)                                  │ │
│ │  Investigation Management isn't responding right now. Try again when    │ │
│ │  it's back.          ← disabledReason as ADJACENT TEXT, aria-describedby│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌── ACTIVITY HISTORY ────────────────────────────────── <h2> ─────────────┐ │
│ │  ONE chronology merging the spoke's own history with hub audit records. │ │
│ │                                                                         │ │
│ │  2026-09-15 15:04 UTC (2 hours ago)                                     │ │
│ │  Marcus Vale · Investigator                                             │ │
│ │  Resolved issue ISS-2207 — Substantiated                                │ │
│ │  ▣ Recorded by PVQ          01JD7K2Q… [ View audit chain → ]            │ │
│ │  ─────────────────────────────────────────────────────────────────────  │ │
│ │  2026-09-15 15:04 UTC (2 hours ago)                                     │ │
│ │  Marcus Vale · Investigator                                             │ │
│ │  Outstanding issues: 1 → 0                                              │ │
│ │  ▣ Recorded by the unified layer   01JD7K2Q… [ View audit chain → ]     │ │
│ │  ─────────────────────────────────────────────────────────────────────  │ │
│ │  2026-09-12 09:11 UTC (3 days ago)                                      │ │
│ │  PVQ system                                                             │ │
│ │  Issue raised against Section 13A — Employment history                  │ │
│ │  ▣ Recorded by PVQ                                                      │ │
│ │                                                                         │ │
│ │  [ Load more ]   ← appends, announces "20 more entries loaded."         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ [ Back to work queue ]        ← repeated in the action-panel footer         │
```

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | Item title (`<h1>`) + summary header | Top | Identity and state at a glance |
| **Primary** | System of record, **in text** | Summary header | Attribution survives every context change |
| **Primary** | Type-specific content | Main body | The substance of the work |
| **Primary** | Related items | After content, before actions | Discovery **precedes** action — the flagship on-ramp |
| **Primary** | Action panel | After related items | Where work gets done |
| Secondary | Activity history | Bottom | The record left behind |
| Secondary | Back-to-queue | Above `<h1>` **and** in the action footer | Return is always one control away |
| Tertiary | Synthetic-record marker | Summary header | Honesty invariant per record |

#### States

| Region | State | Appearance | Copy |
|---|---|---|---|
| **Page** | Loading | Section-level skeletons preserving layout; summary header settles first | sr-only "Loading work item" |
| | **Not authorised / not found** | → SCR-30 inside the shell | "You don't have access to this item. If you think this is a mistake, contact your administrator and give them reference {id}." **A forbidden item and a non-existent item are indistinguishable** |
| | **Owning system unavailable** | Error state **inside the shell**, never blank | "{System} isn't responding right now, so we can't show this item. Your other work is still available." + `[Try again]` + `[Back to work queue]` |
| | **Application disabled** | Error state | "{System} is turned off in this environment. Contact your administrator if you need access." |
| | **Malformed spoke response** | Error state | "We couldn't read this item from {System}. We've logged the problem — reference {id}." |
| **Related items** | Ready | Grouped list with badges | — |
| | Empty | `usa-alert--info --slim` | "No related items in other systems." |
| | **Target down** | Entry renders **with an explanation, not a broken link** | "{System} isn't responding right now, so this related item can't be opened." |
| | **Not entitled to target** | Entry renders with explanation | "You don't have access to the related item in {System}." |
| | **Unconfirmable reference** | Entry renders | "This related item couldn't be confirmed. We've logged the problem — reference {id}." |
| **Actions** | Ready | Server-computed set | — |
| | Disabled | Control disabled + adjacent reason text | Per `disabledReason` |
| | Submitting | Button busy, `aria-busy` | "Recording finding…" announced once |
| **Activity history** | Ready | Merged chronology, 20/page | — |
| | Empty | `usa-alert--info --slim` | "No activity recorded yet." |
| | **Spoke history unavailable** | Hub records still render + notice | "Some history from {System} isn't available right now." |

#### The four failure classes (never conflated)

Every failure resolves to exactly one of four user-visible classes, each with its own recovery — and **every message states whether anything changed** (FR-F06-07):

| Class | Copy | Recovery offered | Changed anything? |
|---|---|---|---|
| **Not permitted** | "You don't have permission to do that." | Return to item — **no retry**, because retrying will not help | No |
| **Input invalid** | Error summary + per-field guidance | Fix and resubmit | No |
| **Source unavailable** | "{System} isn't responding right now, so nothing was changed." | `[Try again]` + `[Back to work queue]` | **No** |
| **Unexpected error** | "Something went wrong on our side. Nothing was changed. Reference {id}." | `[Try again]` + `[Go to dashboard]` | **No** |

> **The one permitted ambiguity** is `UPSTREAM_INDETERMINATE`: "We're not sure whether {System} completed this action. Refresh this item to check its current status before trying again — reference {id}." Its copy **explicitly says the outcome is unknown** and tells the user how to check. Every other message is definite.

**No failure message contains a stack trace, exception class, hostname, port, SQL, or spoke-internal identifier.** Every failure displays a copyable correlation ID.

#### Action forms

Generated from `ActionDescriptor.formSchema`; each field declares label, type, required, maxLength, options, hint, and validation message.

- Client validation runs **on submit, not on every keystroke**, and mirrors server rules exactly (same schema).
- **Submission is not optimistic.** The UI shows a busy state and reflects new state **only after the spoke confirms the write** — displayed state never diverges from the system of record.
- Double-submit protection via a client-generated `idempotencyKey`; a repeat within 10 minutes returns the original outcome **without re-executing**.
- Success renders a `usa-alert--success` naming **exactly what changed and where** — "Issue ISS-2207 marked Resolved — Substantiated in PVQ." — announced politely, **with focus moved to the alert**.
- **After a successful action the user stays on the detail page** with updated state and the success alert. A secondary control offers "Back to work queue." **The user is never involuntarily navigated away from evidence of what they just did** (FR-F06-12 rule 2).
- `stateVersion` is a hidden field; a mismatch returns `STATE_CONFLICT`: "This item changed since you opened it. Refresh to see the latest version, then try again."

#### Accessibility notes

- **Heading hierarchy:** `<h1>` item title → `<h2>` per region (Summary, content sections, Related items, Actions, Activity history) → `<h3>` per content subsection and per related-item group. Gap-free, no skipped levels.
- **Landmarks:** `main` contains the whole detail; Related items and Actions are `<section aria-labelledby>`; the breadcrumb is `<nav aria-label="Breadcrumb">`.
- **Focus management on entry:** arriving from the queue moves focus to the `<h1>` and updates `document.title`.
- **Focus management on async success:** the success alert **receives focus** — this is a result the user submitted and is waiting for. Contrast with degraded notices, which never take focus.
- **Focus management on validation failure:** focus moves to the error summary; title prefixed "Error: "; each entry links in-page to its field.
- **Focus management on return:** "Back to work queue" restores the queue **and returns focus to the originating row**.
- **Disabled actions** are removed from the tab order, with `disabledReason` rendered as **adjacent visible text** joined via `aria-describedby` — so a keyboard user learns *why* rather than finding an inert control.
- **Related items panel** is a `<section aria-labelledby>` containing an accessible **list**, not a bare set of links. Each entry's accessible name includes the relationship label and the source system.
- **Activity history** is an `<ol>`; each entry names actor, role at action, origin badge ("Recorded by PVQ" / "Recorded by the unified layer"), absolute UTC timestamp **and** relative time. "Load more" appends and announces the count — it does not replace content or move focus.
- **Correlation link** accessible name: "View the full audit chain for this action."
- **Colour-independent meaning:** status, priority, overdue, origin, and outcome are all text + distinct icon shape.
- **Source attribution** appears in the summary header **as text** ("System of record: PVQ — Personnel Vetting Questionnaire"), not only as a badge.
- **Keyboard:** every control — back link, breadcrumb segments, disclosures, form fields, actions, history pagination — reachable and operable in visual order. Modals (destructive confirmations) trap focus, close on Escape, restore focus to the invoking control.
- **Target sizes** ≥44×44 px throughout.
- **320px reflow:** regions stack in the normative order; the summary header becomes a stacked definition list; an `usa-in-page-navigation` jump list is provided so the **action panel is reachable without scrolling past the entire content body**. No horizontal page scroll.

#### Acceptance

- Each role can open at least one item and see full detail with **correct attribution**.
- A forbidden item and a non-existent item are **indistinguishable** in the response.
- With the owning spoke down, the page renders its error state **inside the shell, never a blank page**.
- Each role completes at least one **real, persisted action** visible in both the spoke's own API and the audit trail.
- A double-submitted action **executes once**.
- All four failure classes are reachable and render their designed presentations.

---
