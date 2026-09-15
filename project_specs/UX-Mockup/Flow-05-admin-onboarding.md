### Flow 5: Register the sixth application live — extensibility as an observable event

> The feature that turns "extensible" from an assertion into something a reviewer watches happen. Registration is a **configuration action**: no code change, no redeploy, no restart.

**Trigger:** A new mission application ("Continuous Vetting Service", `CVS`) needs onboarding. It ships **running but unregistered** — its absence from navigation, queue, and console before registration is itself part of the demonstration.
**User Stories:** US-070, US-094, US-095, US-096, US-097, US-098, US-099, US-100
**Features:** F8 (registry), F12 (registration), F11 (console), F16 (health)
**Persona:** PER-04 Priya Raghunathan (Administrator)
**Demo path:** ✅ SECONDARY SCRIPTED DEMO — Segment 3a. Target: **under 5 minutes, live** (SM-11). Paired with Flow 2a in the other window.

```
BEFORE: CVS appears NOWHERE in the UI. Not in nav, not in the queue,
        not in the console, not in health monitoring. Verified on screen.

[SCR-12 Administrator dashboard]
   │  "Connected applications: 5 registered · 5 enabled · 0 disabled"
   ▼
[SCR-22 Connected applications]
   │  usa-table — 5 rows: eApp, IEP, PVQ, PDT, IM
   │  [ Register an application ]  ← primary usa-button
   ▼
[SCR-28 Application registration — usa-step-indicator, 5 steps]

  ┌─ Step 1 of 5 · Identity ────────────────────────────────────┐
  │ Display name    [ Continuous Vetting Service        ]        │
  │ Application ID  [ CVS                               ]        │
  │   ^[A-Z][A-Z0-9_]{1,15}$ · unique INCLUDING de-registered   │
  │      IDs, because audit records refer to them               │
  │ Description     [ ...                               ]        │
  │ Icon            [ visibility ▾ ]  ← token picker, NOT a      │
  │                                     colour picker           │
  │ [?] What does an application need to support? → onboarding   │
  │                                                  docs        │
  │                                          [ Continue ]        │
  └──────────────────────────────────────────────────────────────┘
           │
  ┌─ Step 2 of 5 · Connection ──────────────────────────────────┐
  │ Base endpoint    [ http://cvs:8086                  ]        │
  │ Health endpoint  [ /health                          ]        │
  │ Adapter type     [ rest-generic-v1 ▾ ]                       │
  │ ▸ Resilience policy (usa-accordion, ALL PRE-FILLED)          │
  │   timeoutMs 5000 · actionTimeoutMs 10000 · maxRetries 2      │
  │   backoff 250ms ×2.0 · circuit 5 failures / 30000ms          │
  │   healthProbeIntervalSec 30                                  │
  │                                [ Back ]  [ Continue ]        │
  └──────────────────────────────────────────────────────────────┘
           │
  ┌─ Step 3 of 5 · Test connection ─────────────────────────────┐
  │              ← LIVE. Calls healthCheck() then describe().    │
  │                Nothing is persisted.                         │
  │ [ Run connection test ]                                      │
  │                                                              │
  │ ✓ Reachable at http://cvs:8086            42 ms              │
  │ ✓ Health check responded                  HEALTHY            │
  │ ✓ Capability description received                            │
  │ ✓ Integration version supported           v1                 │
  │ ✓ Work-item types declared                1                  │
  │ ✓ Actions declared                        3                  │
  │ ✓ Permissions valid                                          │
  │        announced: "Connection test complete. 7 of 7 passed."  │
  │                                [ Back ]  [ Continue ]        │
  │                                                              │
  │  ── BRANCHES ──────────────────────────────────────────────  │
  │  PASS      → Continue ENABLED                                │
  │  WARNING   → Continue enabled only after explicit            │
  │              [x] "I understand and want to register this     │
  │                   application anyway."                       │
  │  FAIL      → Continue DISABLED + reason + [ Test again ]     │
  │              Registration is NOT POSSIBLE until it passes.   │
  │              A broken registration is caught in the FORM,    │
  │              not discovered by users.                        │
  └──────────────────────────────────────────────────────────────┘
           │
  ┌─ Step 4 of 5 · Capabilities (AUTO-DISCOVERED) ──────────────┐
  │ Work-item types                     "Reported by the         │
  │  ▸ CVS_ALERT — "Continuous vetting alert"   application"     │
  │      contentProfile: alert-summary                           │
  │      Status map (editable table):                            │
  │        NEW           → Open                                  │
  │        UNDER_REVIEW  → In progress                           │
  │        CLEARED       → Closed                                │
  │        ESCALATED     → Blocked                               │
  │      ← an INCOMPLETE map BLOCKS progression, listing the     │
  │        unmapped values by name                               │
  │ Actions                                                      │
  │  [x] ACKNOWLEDGE_ALERT   [x] CLEAR_ALERT   [x] ESCALATE_ALERT│
  │                                                              │
  │ ⓘ Only capabilities the application reports can be           │
  │   registered.  ← may REMOVE, may NOT INVENT. Inventing would │
  │                  register capabilities the adapter cannot    │
  │                  deliver — exactly the dead controls the     │
  │                  product forbids.                            │
  │                                [ Back ]  [ Continue ]        │
  └──────────────────────────────────────────────────────────────┘
           │
  ┌─ Step 5 of 5 · Access & review ─────────────────────────────┐
  │ Visible to roles (required, NONE pre-selected)               │
  │  [x] Investigator  [ ] Adjudicator  [ ] Applicant  [ ] Admin │
  │                                                              │
  │ ── Review every value, with [Edit] per step ──               │
  │                                                              │
  │ ⚠ Continuous Vetting Service will become visible to          │
  │   Investigator and its work items will appear in their       │
  │   work queues immediately.                                   │
  │                                                              │
  │                    [ Back ]  [ Register application ]        │
  └──────────────────────────────────────────────────────────────┘
           ▼
[SCR-23 Application detail — CVS]
   │  ✓ usa-alert--success, focus moved to it
   │    "Continuous Vetting Service is registered. Health checks
   │     have started."
   │
   ▼  PROPAGATION — all of it, within 30 seconds, NO RESTART:
      • SCR-22 inventory        → 6 rows
      • SCR-24 health           → first probe issued IMMEDIATELY
      • role-scoped navigation  → for every role in visibleToRoles
      • work-queue fan-out      → CVS included
      • search fan-out          → if supportsSearch
      • related-item resolution → CVS is a valid target system
      • APPLICATION_REGISTERED audit record

        ┌─────────────────────────────────────────────────────┐
        │ OTHER WINDOW — Flow 2a, investigator ALREADY SIGNED  │
        │ IN, never signed out:                               │
        │   registryVersion poll (≤30s)                        │
        │   → ▣ CVS appears in the source filter               │
        │   → 4 CVS-badged rows appear in his queue            │
        │   → announced POLITELY, focus not stolen             │
        │ THE DEMO ASSERTION: zero code changes, zero restarts │
        └─────────────────────────────────────────────────────┘
```

#### Steps

| # | Step | Screen | Design obligation |
|---|---|---|---|
| 1 | Open the inventory | SCR-22 | Five rows; CVS **visibly absent** — the "before" state is part of the proof |
| 2 | Identity | SCR-28 step 1 | `applicationId` uniqueness includes de-registered IDs; onboarding docs linked **where they are needed** |
| 3 | Connection | SCR-28 step 2 | Every resilience value pre-filled with a sane default, editable, bounded |
| 4 | **Test connection** | SCR-28 step 3 | **Live call before submission.** Fail blocks progression entirely |
| 5 | Capabilities | SCR-28 step 4 | Auto-discovered from `describe()`, marked "Reported by the application" |
| 6 | Access & review | SCR-28 step 5 | Roles required, **none pre-selected**; consequences restated before submit |
| 7 | Submit | → SCR-23 | Registry row + `registryVersion` bump + immediate probe + audit |
| 8 | Observe propagation | SCR-22/24 + other window | The visible consequence that makes registration **real** rather than administrative |

#### Failure and alternate paths

| Condition | What the administrator sees | Recovery |
|---|---|---|
| Application not running | **Fail:** "We couldn't reach that application at {endpoint}. Check that it's running and the address is correct." Continue disabled | Start it, `[Test again]` |
| Health timeout | **Fail:** "The application didn't respond within {n} ms. Check the address, or increase the health check timeout." | Adjust step 2, re-test |
| `describe()` missing/malformed | **Fail:** "The application responded, but didn't describe what it can do in a format we understand." | — |
| Contract version unsupported | **Fail:** "This application uses integration version {v}, which we don't support yet. Supported: {list}." | — |
| Unknown required permission | **Fail:** "This application asks for permissions this system doesn't have: {list}." | — |
| Health `DEGRADED` | **Warning:** "The application responded slowly ({n} ms). You can register it, but users may see delays." | Acknowledge checkbox → Continue |
| Zero work-item types | **Warning:** "This application doesn't provide any work items. It will appear in the admin console but not in users' work queues." | Acknowledge → Continue. Review step restates it plainly |
| Duplicate `applicationId` | Field error: "That application ID is already in use. Choose a different one." — **specific, not generic** | Change the ID |
| Duplicate display name | "Another application already uses that name. Choose a different one." | — |
| Incomplete status map | Blocks step 4: "Map every status this application can report. **Unmapped: {list}.**" | Complete the map |
| Draft expired (>60 min) | "Your registration draft expired. Start again — your entries weren't saved." | Restart |
| Submitted with a stale test (>10 min) | Test **re-runs automatically** before submission | — |
| Submitted with no test | `CONNECTION_TEST_REQUIRED`: "Test the connection before you register this application." | Go to step 3 |
| Attempt to change `applicationId` in edit mode | Read-only with explanation: "The application ID can't be changed because existing records refer to it." | — |

#### De-registration (the inverse proof)

```
[SCR-23] ▸ [ De-register ]  ──▶ usa-modal
   │  "This removes Continuous Vetting Service from navigation, the work
   │   queue, search, and health monitoring for all users.
   │   4 work items will stop appearing.
   │   Audit records that mention Continuous Vetting Service are kept."
   │
   │  Type the display name to confirm: [ ___________________ ]
   │  Reason (10–500 chars, required):  [ ___________________ ]
   │                              [ Cancel ]  [ De-register ]
   ▼
   Registry row removed · registryVersion bumped · probing stopped ·
   dropped from EVERY surface — with NO code change and NO errors
   anywhere.  Audit records naming CVS remain READABLE, using the
   STORED display name rather than a lookup, so history stays legible
   after removal.
```

#### Exit criteria

- An administrator completes CVS registration in **under 5 minutes** during a live demo (SM-11).
- The form is completable **using only the keyboard** (US-094).
- Full propagation within **30 seconds** of submission (SM-12).
- A signed-in investigator's navigation and queue update **without re-authentication or reload**.
- Removing an application from the registry removes it cleanly from navigation, queue, search, and console with **no code change and no errors** (PRD F8 acceptance signal).
- Reset returns CVS to unregistered, and the demo **repeats identically** (SM-22).
- **Zero special-casing of CVS anywhere in the hub** — which is the entire point.

#### Accessibility notes

- **Step indicator:** `usa-step-indicator` with `aria-current="step"` on the active step **and** a text counter "Step 3 of 5" — progress is never conveyed by segment colour alone.
- **Heading hierarchy:** `<h1>` "Register an application" (constant across steps) → `<h2>` per step name → `<h3>` per fieldset group. The `<h1>` does **not** change per step; the step name does, so screen-reader users get a stable page identity plus a changing sub-heading.
- **Per-step validation:** each "Continue" validates; failure renders an error summary at the top with `role="alert"`, **focus moved to it**, and in-page links to offending fields.
- **Form state survives** refresh and session extension via a server-side draft — a 5-step form lost to a timeout is a demo-killer.
- **Back navigation preserves entered values**; the step indicator allows returning to any **completed** step (and only completed steps are interactive).
- **Connection-test results** render as a `usa-icon-list` checklist with **text status per check** (pass/fail/warning) plus icon — never a colour-only row. Announced once via polite live region: "Connection test complete. 7 of 7 checks passed."
- **Disabled "Continue"** on a failing test is removed from the tab order, with the blocking reason rendered as **adjacent text** linked by `aria-describedby`.
- **Status-map table** (step 4) is a real `<table>` with `<caption>`, `scope="col"`, and `scope="row"` on the native-status cell; editable cells are labelled `usa-select` controls, not bare inputs.
- **Icon picker** offers icons by **name and shape preview**, with accessible names — it is a token picker, so there is no colour dependency.
- **Destructive confirmation modal** traps focus, closes on Escape, restores focus to the invoking control. Typed-name confirmation field is labelled and its mismatch error is specific: "The name you typed doesn't match. Type {displayName} exactly to confirm."
- **320px:** steps stack vertically; the step indicator collapses to "Step 3 of 5" text plus the current step label; the review table reflows to stacked definition lists.

---
