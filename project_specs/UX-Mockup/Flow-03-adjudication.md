### Flow 3: Adjudication — assemble the cross-system picture, render a determination

**Trigger:** An item reaches the adjudicator's "Awaiting my determination" queue.
**User Stories:** US-017, US-019, US-034, US-038, US-050, US-055, US-056, US-057, US-068, US-124
**Features:** F2 (RBAC action sets), F4 (adjudicator dashboard), F6 (detail, related items, history), F13 (audit)
**Persona:** PER-02 Dana Okonkwo (Adjudicator)
**Demo path:** ✅ SECONDARY SCRIPTED DEMO — Segment 4 (zero trust, role-level)

```
[SCR-10 Adjudicator dashboard]           ← visibly DIFFERENT composition
   │  "Awaiting my determination"  · "Case status distribution" (as a TABLE)
   │  "Approaching determination deadlines" · "Returned for clarification"
   │  scope: ACROSS {organization} — stated in the widget heading,
   │         because adjudicator scope is org-wide, not assignee-based
   ▼
[SCR-13 Work queue — adjudicator default: statusCategory = In progress]
   ▼
[SCR-15 eApp case view — SAME SCREEN the investigator uses]
   │
   │  ╔═══════════════ THE RBAC DEMONSTRATION ═══════════════════════╗
   │  ║ Same work item. Same URL. Different server-computed action   ║
   │  ║ set. Nothing is hidden client-side — the server simply       ║
   │  ║ returns a different ActionDescriptor[].                      ║
   │  ║                                                              ║
   │  ║  INVESTIGATOR sees          │  ADJUDICATOR sees              ║
   │  ║  ─────────────────────────  │  ───────────────────────────── ║
   │  ║  [ Acknowledge assignment ] │  [ Adjudicate case ]  ← primary║
   │  ║  [ Request clarification ]  │  [ Return for clarification ]  ║
   │  ║  [ Record finding ]         │                                ║
   │  ║                             │  (no Record finding — omitted, ║
   │  ║                             │   not disabled: an action the  ║
   │  ║                             │   role may NEVER perform is    ║
   │  ║                             │   omitted entirely)            ║
   │  ╚══════════════════════════════════════════════════════════════╝
   │
   │  On the related PVQ issue (SCR-16), the contrast is sharper:
   │    INVESTIGATOR: [ Resolve issue ]      ← holds ISSUE.RESOLVE
   │    ADJUDICATOR:  (absent)               ← does NOT hold ISSUE.RESOLVE
   │                  [ Request clarification ]  ← holds that one
   │
   ▼  assemble the picture — WITHOUT leaving the shell
   │
   │  ╔═ Related items in other systems ═══════════════════════════╗
   │  ║  ▣ PVQ  ISS-2207 · Resolved — Substantiated                ║
   │  ║  ▣ PDT  PDT-0771 · Tier 5 designation · Approved           ║
   │  ║  ▣ IM   IM-3310  · Assignment · Closed                     ║
   │  ╚════════════════════════════════════════════════════════════╝
   │
   │  ╔═ Activity history — ONE chronology, not four merged by hand ═╗
   │  ║ 2026-09-15 15:04Z  Marcus Vale (Investigator)                ║
   │  ║   Resolved issue ISS-2207 — Substantiated                    ║
   │  ║   Recorded by PVQ          [01JD7K…  View audit chain →]     ║
   │  ║ 2026-09-15 15:04Z  Unified layer                             ║
   │  ║   Outstanding issues: 1 → 0                                  ║
   │  ║   Recorded by the unified layer                              ║
   │  ║ 2026-09-12 09:11Z  PVQ system                                ║
   │  ║   Issue raised against Section 13A                           ║
   │  ║   Recorded by PVQ                                            ║
   │  ╚══════════════════════════════════════════════════════════════╝
   │        ↑ spoke-native history MERGED with hub audit records;
   │          each row badged with its ORIGIN
   ▼
   ├── [ Adjudicate case ] ──▶ usa-modal confirmation ──▶ single-system
   │        write to eApp ──▶ confirmation naming what changed and where:
   │        "Case A-1042 adjudicated in eApp."
   │
   └── [ Return for clarification ] ──▶ form: required reason
            ──▶ writes to eApp, item reappears in the investigator's queue
            ──▶ and in the adjudicator's "Returned for clarification" widget
                when it comes back updated
```

#### Steps

| # | Step | Screen | Design obligation |
|---|---|---|---|
| 1 | See what awaits determination | SCR-10 | Composition differs from the Investigator's in **at least three widgets** — it is not a relabelled copy (US-034) |
| 2 | Read the status distribution | SCR-10 | Rendered as an **accessible data table**, not a chart-only presentation. Any chart **must** be accompanied by an equivalent table (US-114) |
| 3 | Open the case | SCR-15 | Org-scoped read (`ATTR-ADJ-01`), not assignee-scoped |
| 4 | See the different action set | SCR-15/16 action panel | **The zero-trust demonstration.** Server-computed; client renders what it is given |
| 5 | Assemble the cross-system picture | Related-items panel | Three relationship types resolved live through adapters — no joins |
| 6 | Read one history | Activity history | Spoke-native + hub audit merged into **one** chronology with origin badges |
| 7 | Decide, or refuse to decide | Action panel | See "refuse to decide" below |

#### The "refuse to decide on quietly missing data" path

> JRN-02.02's core insight: an adjudicator must never be shown a confident-looking picture that is silently incomplete.

```
[SCR-15 with PVQ unavailable]
   │
   │  ┌────────────────────────────────────────────────────────┐
   │  │ ! PVQ is unavailable — related issue items can't be     │
   │  │   shown for this case.                                  │
   │  └────────────────────────────────────────────────────────┘
   │
   │  Related items panel:
   │    ▣ PVQ  "PVQ isn't responding right now, so this related
   │            issue can't be opened."          ← NOT a broken link,
   │                                               NOT a silent omission
   │    ▣ PDT  PDT-0771 · Approved               ← still resolves
   │    ▣ IM   IM-3310  · Closed                 ← still resolves
   │
   │  Action panel:
   │    [ Adjudicate case ] (disabled)
   │    "Part of this case's record can't be loaded right now.
   │     Adjudicating on an incomplete picture isn't available
   │     until PVQ is back."
   │
   └──▶ The adjudicator is STOPPED, and told WHY. The design refuses
        to let a determination be rendered against data the product
        knows is missing. (US-038, US-124, US-129)
```

**This is the deliberate inverse of "degrade gracefully."** For read-only screens, partial data plus disclosure is correct. For a **consequential determination**, the product declines and explains. The distinction is encoded in `ActionDescriptor.enabled` + `disabledReason`, computed server-side — not a UI judgement call.

#### Failure and alternate paths

| Condition | What the adjudicator sees | Recovery |
|---|---|---|
| Attempts `ISSUE.RESOLVE` by direct API call | 403 `AUTHZ_DENIED`, "You don't have permission to do that." Denial **audited** with the failing `ruleId` | None — retrying will not help, and no retry is offered |
| Opens a case outside their organization | SCR-30, non-enumerable, identical to a non-existent case | Return to own queue |
| Case above clearance tier | SCR-30; audit record names `ATTR-ADJ-02` | — |
| Alerts could not be computed | Dashboard widget states so explicitly rather than showing a reassuring zero (US-124) | Automatic on recovery |
| Stale `stateVersion` (someone else acted) | `STATE_CONFLICT`: "This item changed since you opened it. Refresh to see the latest version, then try again." | Refresh, re-read, re-decide |

#### Exit criteria

- The adjudicator dashboard differs from the investigator dashboard in **≥3 widgets** (US-034).
- The **same** work item presents **different action sets** to Investigator and Adjudicator, demonstrable live (US-017, demo Segment 4).
- The status distribution is **readable as a table by a screen reader** (US-114).
- Activity history renders spoke and hub origins in one chronology with correlation links (US-056, US-068).
- A determination cannot be rendered while a contributing system's data is knowably missing (US-038).

#### Accessibility notes

- **Heading hierarchy:** `<h1>` case title → `<h2>` per region (Case summary, Questionnaire, Related items, Actions, Activity history) → `<h3>` per questionnaire section and per related-item group. Gap-free.
- **Status distribution table:** real `<table>` with `<caption>`, `<th scope="col">`, `scope="row"` on the status cell. If a chart is added, the table is the **primary** representation, not a hidden fallback.
- **Action panel:** omitted actions are genuinely absent from the DOM (not `display:none`), so a screen-reader user's experience matches the visual one. Disabled actions carry adjacent `disabledReason` text linked by `aria-describedby`.
- **Activity history:** `<ol>` in reverse-chronological order; each entry names actor, role at action, origin ("Recorded by PVQ" / "Recorded by the unified layer"), and absolute UTC timestamp **plus** relative time. Pagination via an accessible "Load more" that appends and announces "{n} more entries loaded."
- **Correlation link:** accessible name "View the full audit chain for this action" — not a bare ULID.
- **Modal confirmations** on `Adjudicate case` and `Return for clarification` trap focus, close on Escape, and restore focus to the invoking button.
- **Required reason field** on `Return for clarification` is labelled, `aria-describedby` hint, error summary on failure, content preserved.
- **320px:** the related-items panel and action panel stack below the case content; no horizontal scroll. The action panel remains reachable without scrolling past the entire questionnaire — it is anchored by an `usa-in-page-navigation` jump list on narrow viewports.

---
