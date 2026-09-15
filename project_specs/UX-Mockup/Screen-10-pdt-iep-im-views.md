### Screens: SCR-17, SCR-18, SCR-19 — PDT, IEP, and IM views

Lighter than the flagship screens, but **real screens with real states — no dead nav**. Each is the `DetailPage` template with a different `contentProfile`. Every navigation item that reaches them resolves to populated content under seeded data (US-032, SM-05).

---

### Screen: SCR-17 — PDT designation view

**Purpose:** Review a position sensitivity/risk designation and the investigation tier it produced — including **the rule that produced it, stated in text**.
**User Stories:** US-050, US-055, US-057 · **Features:** F6, F2, F9 · **Roles:** Adjudicator (act), Investigator (read), Administrator (read via admin context)

```
│ ‹ Back to work queue                                                          │
│ Work Queue › ▣ PDT Designation PDT-0771                                       │
│                                                                               │
│ Designation PDT-0771 — Systems analyst, Northbridge Systems     <h1>          │
│                                                                               │
│ ┌── SUMMARY ───────────────────────────────────────────────────────────────┐ │
│ │ System of record: PDT — Position Designation Tool                        │ │
│ │ Synthetic record — demo data                                             │ │
│ │ Position     Systems analyst          Organization  Northbridge Systems  │ │
│ │ Status       ● Pending review         Submitted     28 July 2026         │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── POSITION DETAILS ─────────────────────────────────── <h2> ─────────────┐ │
│ │ Position title · Duty location · Supervisory status · Access required    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── SENSITIVITY AND RISK FACTORS ─────────────────────── <h2> ─────────────┐ │
│ │ <caption>Risk factors assessed for this position — 5 factors</caption>   │ │
│ │ ┌────────────────────────────┬────────────┬───────────────────────────┐ │ │
│ │ │ Factor                     │ Assessment │ Contributes to tier       │ │ │  ← th scope="col"
│ │ ├────────────────────────────┼────────────┼───────────────────────────┤ │ │
│ │ │ National security duties   │ Yes        │ Yes                       │ │ │  ← th scope="row"
│ │ │ IT system privilege level  │ Elevated   │ Yes                       │ │ │
│ │ │ Fiduciary responsibility   │ No         │ No                        │ │ │
│ │ │ Public contact             │ Limited    │ No                        │ │ │
│ │ │ Access to classified info  │ Secret     │ Yes                       │ │ │
│ │ └────────────────────────────┴────────────┴───────────────────────────┘ │ │
│ │   ★ AN ACCESSIBLE TABLE, not a risk-matrix graphic                       │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── COMPUTED INVESTIGATION TIER ──────────────────────── <h2> ─────────────┐ │
│ │ usa-summary-box                                                          │ │
│ │                                                                          │ │
│ │   Tier 5 — Single Scope Background Investigation                         │ │
│ │                                                                          │ │
│ │   Why this tier                                                          │ │
│ │   This position was designated Tier 5 because it involves national       │ │
│ │   security duties AND access to classified information at the Secret     │ │
│ │   level or above.                                                        │ │
│ │     ↑ THE RULE THAT PRODUCED IT, STATED IN TEXT — not an opaque output.  │ │
│ │       An adjudicator approving a designation must be able to see the     │ │
│ │       reasoning, not just the result. (FR-F06-09 rule 1)                 │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── ACTIONS ──────────────────────────────────────────── <h2> ─────────────┐ │
│ │  ADJUDICATOR:  [ Approve designation ]                                   │ │
│ │                [ Return designation ]  ← requires a reason               │ │
│ │  INVESTIGATOR: (read-only — no actions rendered)                         │ │
│ │                "You can view this designation but not change it."        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── REVIEW HISTORY ───────────────────────────────────── <h2> ─────────────┐ │
```

| State | Appearance | Copy |
|---|---|---|
| Ready | Populated as above | — |
| Loading | Section skeletons, `aria-busy` | sr-only "Loading designation" |
| Empty (risk factors) | `usa-alert--info --slim` in-table | "No risk factors were recorded for this position." |
| PDT down | Error inside shell | "PDT isn't responding right now, so we can't show this item. Your other work is still available." + `[Try again]` + `[Back to work queue]` |
| Not authorised | → SCR-30, non-enumerable | — |
| Investigator viewing | Action panel shows explanatory text, **no controls** | Read-only actions are **omitted**, not disabled — the role may never perform them |
| Approve submitted | `usa-alert--success`, focus moved | "Designation PDT-0771 approved in PDT." Single-system write |
| Return — missing reason | Error summary, focus moved, in-page link | "Enter a reason for returning this designation." |

**Accessibility:** `<h1>` → `<h2>` per region → `<h3>` where subsections exist, gap-free. Risk factors are a real `<table>` with `<caption>`, `scope="col"`, `scope="row"` — **information conveyed by a chart is always also available as a table** (FR-F14-06 rule 6). The tier rationale is prose, not a colour-coded badge. Assessments ("Yes"/"Elevated"/"Secret") are text. Focus moves to the success alert on completion. 320px: the risk table reflows to stacked cards retaining row-header semantics.

---

### Screen: SCR-18 — IEP applicant status view

**Purpose:** The applicant's task and notice surface — plain language, phone-first, with **every task linking directly to the action that discharges it**.
**User Stories:** US-035, US-049, US-057, US-113, US-122 · **Features:** F6, F2, F15 · **Role:** Applicant (own records only)

```
│ ‹ Back to your dashboard                                                      │
│                                                                               │
│ Confirm your address history for 2019–2021                      <h1>          │
│                                                                               │
│ ┌── WHAT WE NEED ─────────────────────────────────────── <h2> ─────────────┐ │
│ │ usa-summary-box                                                          │ │
│ │                                                                          │ │
│ │ We need you to confirm where you lived between January 2019 and          │ │
│ │ December 2021. The dates you gave us have a gap of about four months.    │ │
│ │                                                                          │ │
│ │ ⚠ Due Friday 18 September 2026                                           │ │
│ │                                                                          │ │
│ │ If we don't hear from you by then, your application will pause until     │ │
│ │ you reply.        ← CONSEQUENCE IN PLAIN LANGUAGE, not a bare due date   │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── YOUR ANSWER ──────────────────────────────────────── <h2> ─────────────┐ │
│ │                                                                          │ │
│ │  Address (required)                                                      │ │
│ │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│ │  │                                                                    │ │ │
│ │  └────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                          │ │
│ │  Lived there from (required)      Lived there to (required)             │ │
│ │  ┌──────────────────┐             ┌──────────────────┐                  │ │
│ │  │ MM / YYYY        │             │ MM / YYYY        │  usa-date-picker │ │
│ │  └──────────────────┘             └──────────────────┘                  │ │
│ │                                                                          │ │
│ │  Anything else we should know (optional)                                 │ │
│ │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│ │  └────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                          │ │
│ │  Supporting document (optional)                                          │ │
│ │  [ Choose file ]  usa-file-input                                         │ │
│ │  usa-hint: PDF, JPG, or PNG. Up to 10 MB.                               │ │
│ │                                                                          │ │
│ │  [ Send this to DCSA ]      [ Save and finish later ]                    │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │

          ── ON SUCCESS ──

│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓  We've received your address history.                                  │ │
│ │                                                                          │ │
│ │    What happens next                                                     │ │
│ │    Someone will review what you sent within about two weeks. You don't   │ │
│ │    need to do anything else right now. We'll let you know if we need     │ │
│ │    more.                                                                 │ │
│ │      ↑ NAMES WHAT WAS RECEIVED **AND** WHAT HAPPENS NEXT.                │ │
│ │        A bare "Submitted" leaves her calling her security officer        │ │
│ │        anyway. (JRN-03.01 stage 7)                                       │ │
│ │                                                                          │ │
│ │    [ Back to your dashboard ]                                            │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
```

#### Notices variant

```
│ Interview scheduling                                            <h1>          │
│ ● Unread · 12 September 2026                                                 │
│ ┌── NOTICE ───────────────────────────────────────────────────────────────┐  │
│ │ [ plain-text notice body, escaped, never rendered as HTML ]             │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│ [ Mark as read ]   ← state persists in IEP's OWN store, because it is       │
│                       IEP's record — not the hub's (FR-F06-10 rule 3)        │
```

| State | Appearance | Copy |
|---|---|---|
| Ready | Task form or notice body | — |
| Loading | Skeleton preserving layout | sr-only "Loading" |
| **Empty (no tasks)** | `usa-alert--info` | "You don't have anything to do right now. We'll let you know if that changes." |
| **Empty (no notices)** | `usa-alert--info` | "You have no notices." |
| Validation failure | Error summary, focus moved, in-page links, **plain-language messages, no field codes**; **content preserved** | "Enter the address where you lived." / "Enter the month and year you moved in." |
| IEP down | De-jargoned notice | "Some of your information isn't available right now. Please check back shortly." |
| Not her record | → SCR-30, **identical in body and timing** to a non-existent record | — |
| Session timeout mid-form | SCR-06 → extend → **entered data intact** | — |
| Submitting | Button busy, `aria-busy` | "Sending…" announced once |

> **The zero-item applicant persona** exists precisely so these empty states are demonstrable rather than theoretical (FR-F17-06).

**Accessibility:** `<h1>` is the task name, not "Task detail". Labels are programmatically associated (`for`/`id`), never placeholders. Required marked with the **text** "(required)". Hint text via `aria-describedby`. Error summary `role="alert"` with focus moved and in-page links; fields get `aria-invalid="true"`. `usa-file-input` has a real label and states accepted formats and size in text. Due dates carry the word "Due"/"Overdue" plus an icon, never a red date. Read/unread is text + icon. Success alert receives focus and is announced. **Phone-first: ≥44×44 px targets, 320px with no horizontal scroll, 200% zoom without clipping.** No internal system names in body copy.

---

### Screen: SCR-19 — IM case assignment view

**Purpose:** Case assignment, leads, and workload context. **IM is the designated outage-demonstration spoke**, so this screen's unavailable state is a first-class design deliverable, not an afterthought.
**User Stories:** US-050, US-051, US-058, US-126, US-130 · **Features:** F6, F16 · **Roles:** Investigator (act), Adjudicator (read)

```
│ ‹ Back to work queue                                                          │
│ Work Queue › ▣ IM Case assignment IM-3310                                     │
│                                                                               │
│ Assignment IM-3310 — Background investigation, SUBJ-00418       <h1>          │
│                                                                               │
│ ┌── SUMMARY ───────────────────────────────────────────────────────────────┐ │
│ │ System of record: IM — Investigation Management                          │ │
│ │ Synthetic record — demo data                                             │ │
│ │ Case         IM-3310              Status     ● Active                    │ │
│ │ Assigned to  Marcus Vale (you)    Assigned   4 August 2026               │ │
│ │ Due          19 September 2026    Tier       T5                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── INVESTIGATIVE LEADS ──────────────────────────────── <h2> ─────────────┐ │
│ │ <caption>Leads for this assignment — 3 leads</caption>                   │ │
│ │ ┌──────────────────────┬────────────┬──────────────┬──────────────────┐ │ │
│ │ │ Lead                 │ Type       │ Status       │ Last updated     │ │ │
│ │ ├──────────────────────┼────────────┼──────────────┼──────────────────┤ │ │
│ │ │ Meridian Logistics   │ Employment │ ✓ Complete   │ 11 Sep 2026      │ │ │
│ │ │ Northbridge Systems  │ Employment │ ● In progress│ 14 Sep 2026      │ │ │
│ │ │ Residence 2019–2021  │ Residence  │ ○ Open       │ 4 Aug 2026       │ │ │
│ │ └──────────────────────┴────────────┴──────────────┴──────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── WORKLOAD CONTEXT ─────────────────────────────────── <h2> ─────────────┐ │
│ │ You have 12 active assignments in Investigation Management.              │ │
│ │ 4 are overdue.                        [ View in work queue → ]           │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── ACTIONS ──────────────────────────────────────────── <h2> ─────────────┐ │
│ │  INVESTIGATOR: [ Update case status ] [ Add lead note ]                  │ │
│ │                [ Accept assignment ]                                     │ │
│ │  ADJUDICATOR:  (read-only)                                               │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── STATUS TRANSITIONS ───────────────────────────────── <h2> ─────────────┐ │
```

#### The unavailable state — a first-class deliverable

```
│ ‹ Back to work queue                                                          │
│ Work Queue › ▣ IM Case assignment IM-3310                                     │
│                                                                               │
│ Assignment IM-3310                                              <h1>          │
│                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ !  Investigation Management isn't responding right now, so we can't      │ │
│ │    show this item. Your other work is still available.                   │ │
│ │                                                                          │ │
│ │    Reference 01JD7K2Q9X8V3MZ4R6T   [⧉ Copy]                              │ │
│ │                                                                          │ │
│ │    [ Try again ]      [ Back to work queue ]                             │ │
│ │                                                                          │ │
│ │    usa-alert--warning · role="alert" · focus moved to <h1>               │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ✓ RENDERS INSIDE THE SHELL — demo banner, header, nav, footer all present  │
│  ✓ NO blank page.  ✓ NO stack trace.  ✓ NO console errors.                  │
│  ✓ Working exits.  ✓ Passes the accessibility scan in THIS state.           │
│                                                                              │
│  This screen is explicitly covered by the fault-injection crawl (FR-F19-04) │
│  because IM is the spoke the demo deliberately takes down. (FR-F06-11)      │
```

| State | Appearance | Copy |
|---|---|---|
| Ready | Populated as above | — |
| Loading | Section skeletons | sr-only "Loading assignment" |
| Empty (no leads) | `usa-alert--info --slim` in-table | "No leads have been recorded for this assignment yet." |
| **IM unavailable** | As drawn above | "Investigation Management isn't responding right now…" |
| **IM slow** | Content renders + row note | "Slow to respond." Actions remain **enabled** with a warning: "Investigation Management is responding slowly. This may take longer than usual." |
| Actions blocked | Disabled + adjacent reason | "Investigation Management isn't responding right now. Try again when it's back." |
| Recovery | Controls re-enable **without reload** | Announced politely: "Investigation Management is available again." |
| Adjudicator viewing | Actions **omitted**, explanatory text | — |

**Accessibility:** `<h1>` → `<h2>` per region, gap-free. Leads are a real `<table>` with `<caption>`, `scope="col"`, `scope="row"` on the lead name; lead status is text + icon shape. The unavailable state keeps a valid heading structure and landmark set, moves focus to the `<h1>`, announces via `role="alert"`, and **passes the automated a11y scan in its degraded state** — degraded states are scanned too (FR-F14-12 rule 1). Disabled actions are out of the tab order with reasons as adjacent text. 320px: leads table reflows to stacked cards; no horizontal page scroll.

**Acceptance (SCR-19):** with IM down, the screen shows its unavailable state with **working exits and no console errors** (FR-F06-11 AC-1).

---
