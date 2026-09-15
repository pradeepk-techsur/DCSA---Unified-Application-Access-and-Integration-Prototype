### Screen: SCR-28 — Application registration (multi-step)

**Purpose:** Onboard a sixth application as a **configuration action performed live**, not a code change. The screen that turns "extensible" into something a reviewer watches happen.
**User Stories:** US-094, US-095, US-096, US-097, US-098, US-099, US-100 · **Features:** F12, F8, F11
**Template:** `FormPage` with `usa-step-indicator` · **Target:** complete in **under 5 minutes, live** (SM-11)

> Full flow narrative, branch logic, and the paired investigator-window observation are in `Flow-05-admin-onboarding`. This chunk specifies the screen itself.

#### Layout — step frame (constant across all five steps)

```
│ Admin console › Connected applications › Register an application              │
│                                                                               │
│ Register an application                                         <h1>          │
│    ↑ CONSTANT across steps, so screen-reader users get a stable page identity │
│                                                                               │
│ ┌── usa-step-indicator ───────────────────────────────────────────────────┐  │
│ │  ①────────②────────③────────④────────⑤                                  │  │
│ │ Identity Connection Test  Capabil.  Access                               │  │
│ │           ▲ aria-current="step"                                          │  │
│ │  Step 2 of 5   ← TEXT COUNTER, because progress must never be conveyed   │  │
│ │                  by segment colour alone                                 │  │
│ │  Completed steps are interactive; future steps are not.                  │  │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ Connection                                                      <h2>          │
│    ↑ the CHANGING sub-heading                                                 │
│                                                                               │
│ [ ── error summary renders here on failure, role="alert", receives focus ── ] │
│                                                                               │
│ [ ── step fields ── ]                                                         │
│                                                                               │
│ [ Back ]                                              [ Continue ]            │
```

#### Step 1 — Identity

```
│ Display name (required)                                                       │
│ ┌────────────────────────────────────┐  usa-hint: 3–60 characters. This is   │
│ │ Continuous Vetting Service         │  what users will see.                 │
│ └────────────────────────────────────┘                                       │
│                                                                               │
│ Application ID (required)                                                     │
│ ┌────────────────────────────────────┐  usa-hint: 2–16 characters: capital   │
│ │ CVS                                │  letters, numbers, and underscores,   │
│ └────────────────────────────────────┘  starting with a letter. This can't   │
│                                          be changed later.                    │
│                                                                               │
│ Description (optional)          usa-character-count: 0 of 500                 │
│ ┌────────────────────────────────────────────────────────────────────────┐   │
│ └────────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│ Icon (required)                                                               │
│ ┌──────────────────────────┐  usa-combo-box · TOKEN PICKER, not a colour     │
│ │ visibility           ▾   │  picker. Options presented by NAME and SHAPE.   │
│ └──────────────────────────┘                                                  │
│                                                                               │
│ [?] What does an application need to support?  → onboarding documentation     │
│     ↑ linked WHERE IT IS NEEDED, not only in a repository (FR-F12-08 rule 2) │
```

#### Step 2 — Connection

```
│ Base endpoint (required)      [ http://cvs:8086                        ]      │
│ Health endpoint (required)    [ /health                                ]      │
│ Adapter type (required)       [ rest-generic-v1                     ▾  ]      │
│                                                                               │
│ ▸ Resilience policy (usa-accordion — collapsed, ALL PRE-FILLED WITH DEFAULTS) │
│   Request timeout      [ 5000  ] ms      Action timeout    [ 10000 ] ms       │
│   Health timeout       [ 3000  ] ms      Max retries       [ 2     ]          │
│   Backoff initial      [ 250   ] ms      Backoff multiplier[ 2.0   ]          │
│   Circuit threshold    [ 5     ]         Circuit open for  [ 30000 ] ms       │
│   Health probe interval[ 30    ] s                                            │
│   ↑ COLLAPSED BY DEFAULT: a five-minute live demo must not require reading    │
│     nine tuning fields, but they must be present and editable.               │
```

#### Step 3 — Test connection (the gate)

```
│ Test connection                                                 <h2>          │
│                                                                               │
│ We'll call the application's health and capability endpoints now.             │
│ Nothing is saved yet.                                                         │
│                                                                               │
│ [ Run connection test ]                                                       │
│                                                                               │
│ ── RESULTS (usa-icon-list — TEXT status per check, plus icon) ──              │
│ ✓ Reachable at http://cvs:8086                              42 ms             │
│ ✓ Health check responded                                    HEALTHY           │
│ ✓ Capability description received                                             │
│ ✓ Integration version supported                             v1                │
│ ✓ Work-item types declared                                  1                 │
│ ✓ Actions declared                                          3                 │
│ ✓ Permissions valid                                                           │
│                                                                               │
│ announced once: "Connection test complete. 7 of 7 checks passed."             │
│                                                                               │
│ [ Back ]                                              [ Continue ]            │
│                                                                               │
│ ╔═══ THREE OUTCOMES ══════════════════════════════════════════════════════╗  │
│ ║ PASS    → Continue ENABLED                                              ║  │
│ ║ WARNING → Continue enabled ONLY after an explicit acknowledgement:      ║  │
│ ║           [ ] I understand and want to register this application anyway.║  │
│ ║ FAIL    → Continue DISABLED (out of tab order) + reason as adjacent     ║  │
│ ║           text + [ Test again ].                                        ║  │
│ ║           REGISTRATION IS NOT POSSIBLE UNTIL IT PASSES — a broken       ║  │
│ ║           registration is caught in the FORM, not discovered by users.  ║  │
│ ╚═════════════════════════════════════════════════════════════════════════╝  │
```

| Outcome | Condition | Copy |
|---|---|---|
| **Fail** | Connection refused / DNS | "We couldn't reach that application at {endpoint}. Check that it's running and the address is correct." |
| **Fail** | Health timeout | "The application didn't respond within {n} milliseconds. Check the address, or increase the health check timeout." |
| **Fail** | `describe()` missing/malformed | "The application responded, but didn't describe what it can do in a format we understand. It may not support this integration version." |
| **Fail** | Version unsupported | "This application uses integration version {v}, which we don't support yet. Supported versions: {list}." |
| **Fail** | Unknown permission | "This application asks for permissions this system doesn't have: {list}." |
| **Warning** | Health `DEGRADED` | "The application responded slowly ({n} ms). You can register it, but users may see delays." |
| **Warning** | Zero work-item types | "This application doesn't provide any work items. It will appear in the admin console but not in users' work queues." |

Test results are stored on the draft and **expire after 10 minutes**; submitting with a stale result **re-runs the test automatically**.

#### Step 4 — Capabilities (auto-discovered)

```
│ Capabilities                                                    <h2>          │
│                                                                               │
│ ⓘ Only capabilities the application reports can be registered.                │
│   ↑ You may REMOVE a declared type or action to limit exposure. You may NOT   │
│     INVENT one — registering a capability the adapter cannot deliver would    │
│     produce exactly the dead controls this product forbids. (FR-F12-04 rule 3)│
│                                                                               │
│ Work-item types                                                               │
│ ┌─ CVS_ALERT — "Continuous vetting alert"        Reported by the application ┐│
│ │   [x] Include this type                                                    ││
│ │   Label          [ Continuous vetting alert         ]  ← editable          ││
│ │   Content profile  alert-summary                       ← not editable      ││
│ │                                                                            ││
│ │   Status map (required — every status must be mapped)                      ││
│ │   <caption>Status map for CVS_ALERT — 4 statuses</caption>                 ││
│ │   │ Native status  │ Normalised category │                                ││
│ │   │ NEW            │ [ Open          ▾ ] │                                ││
│ │   │ UNDER_REVIEW   │ [ In progress   ▾ ] │                                ││
│ │   │ CLEARED        │ [ Closed        ▾ ] │                                ││
│ │   │ ESCALATED      │ [ Blocked       ▾ ] │                                ││
│ │   ★ AN INCOMPLETE MAP BLOCKS PROGRESSION, listing unmapped values by name  ││
│ └────────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│ Actions                                                                       │
│ [x] ACKNOWLEDGE_ALERT  "Acknowledge alert"   requires WORK_ITEM.ACT          │
│ [x] CLEAR_ALERT        "Clear alert"         requires WORK_ITEM.ACT          │
│ [x] ESCALATE_ALERT     "Escalate alert"      requires WORK_ITEM.ACT          │
│                                                                               │
│ If describe() is unsupported: empty lists plus guidance —                     │
│ "This application doesn't describe its own capabilities. It will be           │
│  registered with no work-item types."                                         │
```

#### Step 5 — Access and review

```
│ Access & review                                                 <h2>          │
│                                                                               │
│ <fieldset> <legend>Which roles can see this application? (required)</legend>  │
│  [x] Investigator   [ ] Adjudicator   [ ] Applicant   [ ] Administrator      │
│ </fieldset>                                                                   │
│  ↑ NONE PRE-SELECTED — visibility is an explicit decision, never a default   │
│                                                                               │
│ ── Review ──────────────────────────────────────────────────────────────────  │
│ Identity      Continuous Vetting Service · CVS · visibility icon   [ Edit ]   │
│ Connection    http://cvs:8086 · /health · rest-generic-v1          [ Edit ]   │
│ Test          ✓ 7 of 7 checks passed at 15:02:14Z                  [ Edit ]   │
│ Capabilities  1 work-item type · 3 actions                         [ Edit ]   │
│ Access        Investigator                                         [ Edit ]   │
│   ↑ read-only restatement of EVERY value, with a per-step Edit link          │
│                                                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ ⚠ Continuous Vetting Service will become visible to Investigator and its │ │
│ │   work items will appear in their work queues immediately.               │ │
│ │   ↑ CONSEQUENCES RESTATED at the only point submission is possible       │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ [ Back ]                                        [ Register application ]      │
```

#### Information hierarchy

| Priority | Content | Placement |
|---|---|---|
| **Primary** | Current step's fields | Centre |
| **Primary** | Step indicator + "Step n of 5" text | Above fields |
| **Primary** | Error summary (on failure) | Top of step, receives focus |
| **Primary** | Test-result checklist (step 3) | Centre — it is the gate |
| **Primary** | Consequence statement (step 5) | Immediately above submit |
| Secondary | Resilience policy | Collapsed accordion, step 2 |
| Secondary | Per-step Edit links | Review table, step 5 |
| Tertiary | Onboarding documentation link | Step 1 |

#### States

| State | Appearance | Copy |
|---|---|---|
| **Ready** | Step fields, defaults pre-filled | — |
| **Step validation failure** | Error summary at top, `role="alert"`, **focus moved**, in-page links; fields `aria-invalid="true"` + inline errors | "There is a problem. Fix the following, then try again." + per-field copy |
| **Testing** | Button busy, checklist `aria-busy` | "Testing connection…" announced once |
| **Test fail** | Checklist with ✕ rows; Continue disabled with reason | Per the outcome table above |
| **Test warning** | Checklist with ! rows; acknowledgement checkbox appears | Per the outcome table |
| **Draft expired** (>60 min) | Page-level `usa-alert--warning` | "Your registration draft expired. Start again — your entries weren't saved." |
| **Submitted without test** | Error summary | "Test the connection before you register this application." |
| **Duplicate ID** | Field error — **specific, not generic** | "That application ID is already in use. Choose a different one." |
| **Duplicate name** | Field error | "Another application already uses that name. Choose a different one." |
| **Incomplete status map** | Blocks step 4 | "Map every status this application can report. **Unmapped: {list}.**" |
| **Success** | → SCR-23 with `usa-alert--success`, **focus moved to it** | "Continuous Vetting Service is registered. Health checks have started." |
| **Edit mode** | Same screen, values pre-filled; `applicationId` read-only | "The application ID can't be changed because existing records refer to it." |

**Form state is held in a server-side draft** keyed to the administrator's session, so a refresh or a session extension does not lose work. A five-step form lost to a timeout is a demo-killer.

#### Accessibility notes

- **Heading hierarchy:** `<h1>` "Register an application" is **constant** across steps; `<h2>` is the changing step name; `<h3>` per fieldset group. This gives screen-reader users a stable page identity plus a changing sub-heading, rather than an `<h1>` that mutates under them.
- **Step indicator:** `usa-step-indicator` with `aria-current="step"` on the active step **and** a visible text counter "Step 2 of 5". Progress is **never** conveyed by segment colour alone. Completed steps are real links; future steps are not interactive and are not in the tab order.
- **Per-step focus management:** on advancing, focus moves to the new step's `<h2>`; `document.title` updates to include the step name. On validation failure, focus moves to the error summary and the title is prefixed "Error: ".
- **Error summary:** `role="alert"`, heading "There is a problem", each entry an in-page link that focuses its field. Every field carries `aria-invalid="true"` and an inline `usa-error-message` joined into `aria-describedby`.
- **Labels and hints:** every input has a programmatically associated `<label>` — never a placeholder-as-label. Numeric bounds are stated in `usa-hint` text **before** the user errs, not only in the error message. Required marked with the **text** "(required)".
- **Character counters** on description announce politely at 90% and 100% of the limit only.
- **Connection-test checklist** is a `usa-icon-list` where each item carries **text status** plus an icon — never a colour-only row. The result is announced once, politely, and does **not** move focus.
- **Disabled "Continue"** is removed from the tab order with its blocking reason rendered as **adjacent visible text** linked by `aria-describedby`, so a keyboard user learns why rather than finding an inert control.
- **Status-map table** is a real `<table>` with `<caption>`, `<th scope="col">`, and `scope="row"` on the native-status cell; each mapping control is a labelled `usa-select`, not a bare input.
- **Icon picker** is a `usa-combo-box` offering icons by **name with a shape preview** — a token picker with no colour dependency and full keyboard support.
- **Role checkboxes** are grouped in a `<fieldset>` with a `<legend>` posing the question.
- **Review table** is a real `<table>` with `scope="row"` on the step-name cell; each Edit link's accessible name names its step ("Edit step 2, Connection").
- **Keyboard:** the entire five-step form is completable **using only the keyboard** (US-094 AC-2) — including the accordion, combo box, status-map selects, and acknowledgement checkbox. No keyboard traps.
- **Target sizes** ≥44×44 px for all controls including step-indicator links.
- **320px reflow:** steps stack vertically; the step indicator collapses to "Step 2 of 5" plus the current step label; the status-map and review tables reflow to stacked definition lists retaining row-header semantics. No horizontal page scroll; usable at 200% zoom.

#### Acceptance

- An administrator completes CVS registration in **under 5 minutes** during a live demo (SM-11).
- The form is **completable using only the keyboard**.
- Each step's errors are **announced and linked**.
- Every validation rule produces **its exact specified message**; a duplicate `applicationId` is caught with the **specific** message, not a generic failure.
- Registering against a stopped application is **blocked** with the unreachable message.
- An incomplete status map blocks submission **with the unmapped values listed by name**.
- On submission, full propagation occurs within **30 seconds with no restart** (SM-12).

---
