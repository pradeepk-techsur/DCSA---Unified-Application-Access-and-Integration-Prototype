### Screens: SCR-33 / SCR-34 — Audit trail viewer, record detail, and chain view

**Purpose:** Make "who did what, to what, when" readable — and make a cross-system action read as **one narrative rather than four disconnected rows**.
**User Stories:** US-068, US-101, US-102, US-103, US-104, US-105, US-106, US-107, US-108 · **Features:** F13, F7
**Template:** `ListPage` (SCR-33), `DetailPage` (SCR-34)

> **Role-scoped by the same navigation item.** Administrators reach this as **"Audit Trail"** (full trail, `AUDIT.READ_ALL`); mission users and applicants reach it as **"My Activity"** (own records only, `AUDIT.READ_OWN`). Scoping is applied **in the query**, not after retrieval.

---

### Screen: SCR-33 — Audit trail viewer

```
│ Audit trail                                                     <h1>          │
│                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Integrity verified — 1,284 records checked at 15:04 UTC                 │ │
│ │   Each record is hash-chained to the one before it, so tampering is       │ │
│ │   detectable.                              [ Verify again ]               │ │
│ │   ↑ TEXT + ICON, never colour alone                                       │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── FILTERS ────────────┐ ┌── RESULTS ─────────────────────────────────────┐ │
│ │ <form> aria-label=     │ │ Active: [Last 24 hours ✕]  [ Clear all ]       │ │
│ │ "Filter audit records" │ │                                                │ │
│ │                        │ │ <caption>Audit records — 142 results,          │ │
│ │ Search                 │ │   newest first</caption>                       │ │
│ │ [🔍 actor, resource,   │ │ ┌──────────┬────────┬──────┬───────────┬─────┐│ │
│ │  or action ]           │ │ │Timestamp▼│ Actor  │ Role │ Action    │ Out ││ │
│ │  ↑ does NOT match      │ │ ├──────────┼────────┼──────┼───────────┼─────┤│ │
│ │    summaries — which   │ │ │15:04:12Z │M. Vale │Invest│CASE_ISSUE_│ ✓   ││ │  ← th scope="row"
│ │    could otherwise be  │ │ │          │        │igator│CLEARED    │Succ ││ │
│ │    used to fish for    │ │ │          │ ▣ eApp │ CASE-A-1042      │     ││ │
│ │    narrative content   │ │ │          │ 01JD7K2Q9X8V3MZ4R6T  →chain     ││ │
│ │                        │ │ ├──────────┼────────┼──────┼───────────┼─────┤│ │
│ │ Actor                  │ │ │15:04:11Z │M. Vale │Invest│ISSUE_     │ ✓   ││ │
│ │ [ All ▾ ]              │ │ │          │ ▣ PVQ  │igator│RESOLVED   │Succ ││ │
│ │                        │ │ │          │ ISS-2207 · 01JD7K2Q… →chain     ││ │
│ │ Role at action         │ │ ├──────────┼────────┼──────┼───────────┼─────┤│ │
│ │ [ All ▾ ]              │ │ │14:58:02Z │R.Ashford│Appli│AUTHZ_     │ ⊘   ││ │
│ │                        │ │ │          │ ▣ PVQ   │cant │DENIED     │Denied││ │
│ │ Action type            │ │ │          │ rule ATTR-APP-01                ││ │
│ │ [ All ▾ ]              │ │ └──────────┴────────┴──────┴───────────┴─────┘│ │
│ │                        │ │                                                │ │
│ │ Target system          │ │  Showing 1 to 25 of 142                        │ │
│ │ ☐ HUB ☐ eApp ☐ IEP     │ │  ‹ Prev [1] 2 3 4 5 6 Next ›                   │ │
│ │ ☐ PVQ ☐ PDT ☐ IM       │ │                                                │ │
│ │                        │ │  [ Export CSV ]  [ Export JSON ]               │ │
│ │ Outcome                │ └────────────────────────────────────────────────┘ │
│ │ ☐ Success ☐ Denied     │                                                   │
│ │ ☐ Failed  ☐ Partial    │  ★ OPENING THIS VIEWER WRITES AN AUDIT_VIEWED     │
│ │                        │    RECORD. The audit trail audits its own         │
│ │ Date range             │    reading — which is both correct and            │
│ │ From [2026-09-14]      │    demonstrable. (FR-F13-05 rule 8)               │
│ │ To   [2026-09-15]      │                                                   │
│ │  max 90 days           │                                                   │
│ │                        │                                                   │
│ │ Correlation ID         │                                                   │
│ │ [                    ] │                                                   │
│ │                        │                                                   │
│ │ [ Apply ] [ Reset ]    │                                                   │
│ └────────────────────────┘                                                   │
```

#### Information hierarchy

| Priority | Content | Placement | Rationale |
|---|---|---|---|
| **Primary** | The records, newest first | Right 3/4 | The evidence |
| **Primary** | Integrity indicator | Above everything | Trust in the record precedes reading it (US-104) |
| **Primary** | Correlation ID as a **chain link** on every row | Rightmost column | The affordance that turns rows into narrative |
| **Primary** | Result count in `<caption>` | Table caption | Announced on every change |
| Secondary | Filter rail | Left 1/4 | Same pattern as the work queue — learned once |
| Secondary | Export controls | Below table | Take the evidence away (US-108) |

#### States

| State | Appearance | Copy |
|---|---|---|
| **Ready** | Populated table, default last 24 hours newest first | — |
| **Loading** | Skeleton rows preserving height, `aria-busy` | sr-only "Loading audit records" |
| **Empty** | `usa-alert--info`, caption still present | "No audit records match your filters. Try widening the date range." |
| **Error** | `usa-alert--error` + correlation ID + retry | "We couldn't load the audit trail. Try again — reference {id}." |
| **Degraded** | *Not applicable* — audit is hub-local and never depends on a spoke | — |
| **Integrity FAILED** | `usa-alert--error` replacing the success indicator, naming the **first broken sequence number** | "Audit integrity check failed at record 1,043. Records may have been altered outside the application. Contact your administrator." |
| **Range too large** | Field error | "Choose a date range of 90 days or fewer." |
| **Reversed range** | Field error | "Enter an end date that comes after the start date." |
| **Export too large** | Error alert | "Narrow your filters — exports are limited to 10,000 records." |
| **Mission user view** | Same screen, `<h1>` "My activity"; only own records | An investigator's query returns **zero records authored by another actor** |

**Exports** respect the same role scoping and filters as the on-screen view — an export can never contain a record the user could not see on screen. Each file carries a header block (generated-at, actor, applied filters, count, integrity result) and a first line: `# DEMO — SYNTHETIC DATA ONLY`. Every export writes an `AUDIT_EXPORTED` record.

---

### Screen: SCR-34 — Record detail and chain view

```
│ Audit trail › Record 01JD7K2Q9X8V3MZ4R6T                                      │
│                                                                               │
│ ISSUE_RESOLVED — PVQ issue ISS-2207                             <h1>          │
│                                                                               │
│ ┌── RECORD ───────────────────────────────────────────── <h2> ─────────────┐ │
│ │ <dl> definition list — every field, nothing hidden                       │ │
│ │                                                                          │ │
│ │ Occurred at        2026-09-15 15:04:11 UTC                               │ │
│ │ Sequence number    1,281                                                 │ │
│ │ Actor              Marcus Vale                                           │ │
│ │ Roles at action    Investigator          ← SNAPSHOTTED AT ACTION TIME,   │ │
│ │ Active role        Investigator            so later changes cannot       │ │
│ │ Attributes         org DCSA-FIELD-OPS-EAST rewrite what the actor WAS    │ │
│ │                    tier T5 · region REGION-NE                            │ │
│ │ Action             ISSUE_RESOLVED                                        │ │
│ │ Target system      ▣ PVQ — Personnel Vetting Questionnaire               │ │
│ │ Target resource    PVQ_ISSUE · ISS-2207                                  │ │
│ │ Outcome            ✓ Success                                             │ │
│ │ Before             status: Open                                          │ │
│ │ After              status: Resolved — Substantiated                      │ │
│ │   ↑ PLAIN-LANGUAGE SUMMARIES, not record dumps. The narrative itself     │ │
│ │     lives in PVQ, which is its system of record.                        │ │
│ │ Correlation ID     01JD7K2Q9X8V3MZ4R6T  [⧉ Copy]                         │ │
│ │ Session · method   01JD7… · CAC/PIV (simulated)                          │ │
│ │ Record hash        a3f9…c21   Previous hash  7b12…e44                    │ │
│ │   ↑ shown WITH a short explanation of what they prove                    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ [ View the affected work item → ]  [ View the application → ]                 │
│                                                                               │
│ ╔══ FULL CHAIN — 8 records sharing this correlation ID ═══ <h2> ═══════════╗ │
│ ║                                                                          ║ │
│ ║ ┌─ usa-summary-box ────────────────────────────────────────────────────┐ ║ │
│ ║ │ Investigator Marcus Vale resolved PVQ issue ISS-2207 against eApp    │ ║ │
│ ║ │ case A-1042 on 15 September 2026. Both systems updated.              │ ║ │
│ ║ │   ↑ THE SUMMARY LINE: actor, both systems, outcome — in one sentence │ ║ │
│ ║ └──────────────────────────────────────────────────────────────────────┘ ║ │
│ ║                                                                          ║ │
│ ║ <ol> — ordered narrative with system badges and ELAPSED TIME             ║ │
│ ║                                                                          ║ │
│ ║  1  15:03:41Z  +0s      WORK_ITEM_VIEWED         ▣ eApp     ✓           ║ │
│ ║                         Case A-1042 opened                               ║ │
│ ║  2  15:03:42Z  +1s      RELATED_ITEMS_RESOLVED   HUB        ✓           ║ │
│ ║                         3 related items resolved: PVQ, PDT, IM           ║ │
│ ║  3  15:03:58Z  +17s     RELATED_ITEM_TRAVERSED   HUB        ✓           ║ │
│ ║                         eApp Case A-1042 → PVQ Issue ISS-2207            ║ │
│ ║                         ★ THE PATH IS RECORDED, not just the endpoints   ║ │
│ ║  4  15:03:59Z  +18s     WORK_ITEM_VIEWED         ▣ PVQ      ✓           ║ │
│ ║  5  15:04:10Z  +29s     ORCHESTRATION_STARTED    HUB        ✓           ║ │
│ ║                         2 legs planned: PVQ, eApp                        ║ │
│ ║  6  15:04:11Z  +30s     ISSUE_RESOLVED           ▣ PVQ      ✓  ◀ you    ║ │
│ ║                         status: Open → Resolved — Substantiated          ║ │
│ ║  7  15:04:12Z  +31s     CASE_ISSUE_CLEARED       ▣ eApp     ✓           ║ │
│ ║                         outstanding issues: 1 → 0                        ║ │
│ ║  8  15:04:12Z  +31s     ORCHESTRATION_COMPLETED  HUB        ✓           ║ │
│ ║                         Both legs committed                              ║ │
│ ║                                                                          ║ │
│ ║ [ Export this chain ]                                                    ║ │
│ ╚══════════════════════════════════════════════════════════════════════════╝ │
```

#### Chain variants

| Variant | Rendering |
|---|---|
| **Partial completion** | Record 8 is `ORCHESTRATION_PARTIAL`; additional `ORCHESTRATION_RETRY_ATTEMPTED` records appear **for each retry**, so the history is complete rather than tidied. The failed leg is clearly marked ✕ |
| **Failure** | Record 8 is `ORCHESTRATION_FAILED`; the eApp leg is **absent**, correctly — it was never attempted |
| **Mission user viewing a chain they participated in** | Records by **another actor** render as redacted placeholders — "An action by another user — 15:04:12Z" — rather than being omitted, **so the narrative's shape is honest even when detail is withheld** (FR-F13-04 rule 5) |
| **Integration-issue chain** | Includes `ADAPTER_FAILURE` records with the error class, linked from SCR-25 |

#### States

| State | Copy |
|---|---|
| Ready | Full record + chain |
| Loading | Section skeletons, `aria-busy` |
| **Not visible to this principal** | → "You don't have access to this audit record." |
| **Not found** | **Same copy** — non-enumerable |
| Chain of one | Chain section renders with a single record and states "This action produced one record." |

---

### Accessibility notes — SCR-33 and SCR-34

- **Heading hierarchy:** SCR-33 `<h1>` "Audit trail" (or "My activity") → `<h2>` "Filter audit records" / "Results". SCR-34 `<h1>` action + resource → `<h2>` "Record" / "Full chain". Gap-free.
- **Landmarks:** filter rail is a `<form>` landmark with `aria-label="Filter audit records"`; results are a `<section aria-labelledby>`.
- **Accessible data table (SCR-33):** real `<table>` with `<caption>` stating contents and current result count; `<th scope="col">` on every header; **`scope="row"` on the timestamp cell**; sortable headers contain a `<button>` with `aria-sort` on the `<th>`; `usa-pagination` with `aria-label="Audit trail pagination"`, `aria-current="page"`, and **disabled — not hidden — bounds controls**.
- **Result-count announcement** on every filter, sort, or page change: "142 audit records. Showing 1 to 25."
- **Filter chips** carry accessible names of the form "Remove filter: Last 24 hours", with a "Clear all filters" control — the identical pattern to the work queue, so it is learned once.
- **The chain is an `<ol>`**, not a styled `<div>` stack — the ordering is semantic, and a screen-reader user hears "1 of 8", "2 of 8". Elapsed time and system badges are text.
- **Correlation ID** is rendered in a monospace, selectable field with a copy control announcing "Reference copied," and as a link whose accessible name is **"View the full audit chain for this action"** — never a bare ULID read out character by character.
- **Outcome is text + distinct icon shape** — "✓ Success", "⊘ Denied", "✕ Failed", "! Partial". The screen survives a grayscale rendering with all outcome meaning intact.
- **Integrity indicator is text + icon**, never a colour-only state, and names the first broken sequence number on failure.
- **Record detail is a `<dl>`** with programmatic term/description pairing, so every field is announced with its label.
- **Hash values** are marked with `lang` where appropriate and accompanied by a short plain-language explanation of what they prove, rather than presented as unexplained hex.
- **Focus management:** arriving at SCR-34 moves focus to the `<h1>` and updates `document.title`. Following a correlation link from an error message or item history does the same. "Export" announces completion politely and does not move focus.
- **Redacted chain placeholders** are announced as content ("An action by another user"), not skipped — the shape of the narrative must be perceivable non-visually.
- **Keyboard:** the entire screen — filters, date pickers, chips, sortable headers, row links, pagination, copy controls, export buttons — is reachable and operable in visual order. No keyboard traps.
- **Target sizes** ≥44×44 px for sort buttons, chips, pagination, copy, and chain links.
- **320px reflow:** the filter rail collapses into a `usa-accordion` disclosure above the results; the audit table reflows to stacked cards retaining caption and row-header semantics; the chain `<ol>` stacks naturally with elapsed time on its own line. No page-level horizontal scroll; usable at 200% zoom.

### Acceptance

- The **flagship workflow renders as a single correlated chain of ≥5 records** (SM-20).
- The chain summary line correctly names **actor, both systems, and outcome**.
- A partial completion's chain **clearly shows which leg failed and every retry attempt**.
- Every filter works and combines correctly; the table passes the accessibility scan with **proper headers, caption, and announced sort state**.
- Opening the viewer writes **one `AUDIT_VIEWED` record**.
- An investigator's audit query returns **zero records authored by another actor**.
- Denial of an inaccessible record is **non-enumerable**.
- Manually altering a record in the database causes the integrity check to **fail at that record, demonstrably**.

---
