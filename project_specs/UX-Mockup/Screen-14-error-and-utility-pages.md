### Screens: SCR-30, SCR-31, SCR-32 — Error pages, and SCR-21 / SCR-35 / SCR-36 utility screens

---

## Error pages — plain language, actionable, never terminal

**Purpose:** Three distinct, recoverable presentations. **Every one renders inside the shell** — demo banner, header, navigation, and footer all present — so an error is never a dead end and never violates the banner invariant.
**User Stories:** US-024, US-031, US-054, US-130 · **Features:** F2, F3, F16, F14

> **The rule that governs all three:** no blank page, no stack trace, no framework default error page, no browser default. Ever. Verified by a fault-injection crawl (US-130, NFR-09).

Each error page has: **a heading, plain-language explanatory text, at least one concrete next action, and a copyable correlation ID** where applicable. Each sets a descriptive `<title>`, **moves focus to the `<h1>`**, and announces via a live region.

---

### Screen: SCR-30 — Access denied (403)

```
│ [ demo banner · gov banner · header · PRIMARY NAV all present ]              │
│                                                                              │
│ <main>                                                                       │
│                                                                              │
│  ⊘  You don't have access to this page                          <h1>        │
│                                                  ← focus lands here          │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ You don't have access to this item.                                    │ │
│  │                                                                        │ │
│  │ If you think this is a mistake, contact your administrator and give    │ │
│  │ them the reference below.                                              │ │
│  │                                                                        │ │
│  │ Reference  01JD7K2Q9X8V3MZ4R6T          [⧉ Copy ]                       │ │
│  │                                                                        │ │
│  │      usa-alert--error · role="alert" · aria-live="assertive"           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  [ Go to my dashboard ]      [ Go to my work queue ]                         │
│       ↑ TWO WORKING EXITS, role-appropriate. An applicant gets               │
│         "Go to my dashboard" and "Go to my tasks" instead.                   │
│                                                                              │
│  <title>Access denied — DCSA Unified Layer</title>                           │
```

**Non-enumeration is the design constraint here.** A forbidden resource and a non-existent one return **the same status, the same code, the same message, and the same response shape**, with response time normalised to a 120ms floor. The page therefore:

- **Never** names the resource that was requested.
- **Never** shows a title, subject name, or any existence hint.
- **Never** varies its copy by reason — "you lack the role", "it's another unit's case", "it doesn't exist" all render identically.
- **Always** writes an `AUTHZ_DENIED` audit record carrying the failing `ruleId`, which is visible to administrators in SCR-33 but **never surfaced to the denied user**.

**Embedded denials** (a dashboard widget, a related-items panel) render an **inline `usa-alert`** rather than replacing the page: "You don't have access to the related item in PVQ."

---

### Screen: SCR-31 — Not found (404)

```
│  ⓘ  We couldn't find that page                                  <h1>        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ The address you tried doesn't match anything in this application.      │ │
│  │ It may have been mistyped, or the item may have been removed.          │ │
│  │                                                                        │ │
│  │ You tried:                                                             │ │
│  │   /work/EAPP:CASE-A-9999                                               │ │
│  │   ↑ shown AS TEXT, ESCAPED, NEVER rendered as HTML                     │ │
│  │                                                                        │ │
│  │ Reference  01JD7K2Q9X8V3MZ4R6T          [⧉ Copy ]                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  [ Go to my dashboard ]      [ Go to my work queue ]                         │
│                                                                              │
│  HTTP 404 · <title>Page not found — DCSA Unified Layer</title>               │
│  ★ SCR-31 IS ITSELF ERROR HANDLING — it never 500s, and it always            │
│    includes the demo banner.                                                 │
```

> **Deliberate distinction from SCR-30.** A *route* that does not exist (`/admin/wdgets`) gets SCR-31. A *resource* the principal may not see gets SCR-30 — because confirming "this case ID doesn't exist" would itself be a disclosure. The two pages are never interchanged.

---

### Screen: SCR-32 — Unexpected error (500 / client boundary)

```
│  ✕  Something went wrong                                        <h1>        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Something went wrong on our side. Nothing was changed.                 │ │
│  │   ↑ STATES WHETHER ANYTHING CHANGED — every failure message does       │ │
│  │                                                                        │ │
│  │ We've logged the problem. If it keeps happening, give your             │ │
│  │ administrator the reference below.                                     │ │
│  │                                                                        │ │
│  │ Reference  01JD7K2Q9X8V3MZ4R6T          [⧉ Copy ]                       │ │
│  │                                                                        │ │
│  │      usa-alert--error · role="alert"                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  [ Try again ]      [ Go to my dashboard ]                                   │
│                                                                              │
│  <title>Something went wrong — DCSA Unified Layer</title>                    │
│                                                                              │
│  ★ NO stack trace. NO exception class. NO hostname, port, or SQL.            │
│    Errors caught by the boundary are reported to the server with their       │
│    correlation ID, so they appear in the integration log for an              │
│    administrator — the detail goes where it belongs, not to the user.        │
```

### Error-page comparison

| | SCR-30 Denied | SCR-31 Not found | SCR-32 Unexpected |
|---|---|---|---|
| HTTP | 403 | 404 | 500 (or client boundary) |
| Icon | `block` ⊘ | `info` ⓘ | `error` ✕ |
| Live region | `assertive` | polite (focus moves) | `role="alert"` |
| Shows what was requested | **Never** | Yes, escaped as text | No |
| Retry offered | **No** — retrying will not help | No | **Yes** |
| Correlation ID | Yes | Yes | Yes |
| Exits | Dashboard, Work queue | Dashboard, Work queue | Try again, Dashboard |
| Audited | Yes — `AUTHZ_DENIED` | No | Yes — via integration log |

### Accessibility notes — all three error pages

- **Render inside the shell**, so the demo banner, landmark set, navigation, and footer are all present and the page is never a bare document.
- **One `<h1>`**, which is the error statement itself in plain language — not "Error 403".
- **Focus moves to the `<h1>`** on render; `document.title` is descriptive and unique.
- **Announced** via the politeness level in the table above; announced **once**, not repeatedly.
- **Plain language, no codes in the visible copy.** "You don't have access to this page" — not `AUTHZ_DENIED`. The machine-readable code exists in the response envelope for support, not on screen.
- **Correlation ID** is monospace, selectable, with a copy control announcing "Reference copied."
- **Every exit is a real, role-appropriate destination** — an Administrator's SCR-30 offers "Go to my dashboard" and "Go to connected applications", not a Work Queue they cannot access.
- **Colour-independent:** each page is identified by heading text and icon **shape**, not by a coloured band.
- **Keyboard:** all controls reachable and operable; the copy control is a real `<button>`.
- **Target sizes** ≥44×44 px.
- **320px:** content reflows, no horizontal scroll; the escaped path on SCR-31 wraps rather than overflowing.
- **These pages are included in the automated accessibility scan**, in every role — error states are scanned, not exempted (FR-F14-12 rule 1).

---

## Screen: SCR-21 — Notifications and announcements

**Purpose:** One place for all current alerts and administrator notices.
**User Stories:** US-119, US-120, US-121, US-122, US-123, US-124 · **Features:** F15 · **Template:** `ListPage`

```
│ Notifications                                                   <h1>          │
│ 3 unread                                                                      │
│                                                                               │
│ Type [ All ▾ ]  Severity [ All ▾ ]  ☐ Unread only    [ Apply ] [ Clear ]      │
│                                                                               │
│ ┌── ALERTS (derived from your work) ─────────────────── <h2> ──────────────┐ │
│ │ ● Unread · ▣ PVQ · 12 Sep                                                │ │
│ │   New issue raised on a case you own                                     │ │
│ │   Issue ISS-2207 against eApp Case A-1042                                │ │
│ │   [ Open the case → ]          [ Mark as read ]                          │ │
│ │ ─────────────────────────────────────────────────────────────────────────│ │
│ │ ● Unread · ▣ IM · 12 Sep                                                 │ │
│ │   Assignment overdue by 3 days                                           │ │
│ │   Case IM-3287                                                           │ │
│ │   [ Open the assignment → ]    [ Mark as read ]                          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌── ANNOUNCEMENTS ───────────────────────────────────── <h2> ──────────────┐ │
│ │ ⓘ Scheduled maintenance Thursday 19:00–21:00 UTC.        [ Dismiss ]     │ │
│ │   ↑ dismissible PER USER, persisted; NEVER overlays the demo banner      │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
```

| State | Copy |
|---|---|
| Empty | "You have no notifications. We'll let you know when something needs your attention." |
| **Alerts uncomputable** | "We couldn't check for alerts right now, so this list may be incomplete." — **never a reassuring empty list it cannot substantiate** (US-124) |
| Degraded | Named + quantified per `Y0-patterns` |
| New alert arrives | Announced politely, **focus not stolen**; unread count updates |

**Every alert links directly to the work item that produced it**, preserving context. Marking as read **does not make the alert disappear** (US-121) — it changes state, so a user who mis-clicks does not lose the item.

**Accessibility:** `<h1>` + `<h2>` per group, gap-free. Read/unread is **text + icon**, never a colour dot. "Mark as read" is a real `<button>` announcing "Marked as read." Alerts arriving asynchronously use `aria-live="polite"` and never move focus or reorder content under the cursor. Source badges in accessible names. 320px: stacks single-column, ≥44×44 px targets.

---

## Screen: SCR-35 — Global search results

**Purpose:** Find one item across everything the principal may see.
**User Stories:** US-030, US-044 · **Features:** F3, F5 · **Template:** `ListPage`

```
│ Search results                                                  <h1>          │
│ 4 results for "A-1042". 5 systems searched.                                   │
│   ↑ announced politely on every change                                        │
│                                                                               │
│ [🔍 A-1042                              ]  [ Search ]                         │
│ Source [ All ▾ ]  Type [ All ▾ ]                                              │
│                                                                               │
│ ┌── ▣ eApp (1) ──────────────────────────────────── <h2> ─────────────────┐  │
│ │ Case A-1042 — Section 13A employment history          ★ exact match      │  │
│ │ SUBJ-00418 · Under review · due 19 Sep                                   │  │
│ │ [ Go to this item → ]  ← offered as PRIMARY when it is the sole exact    │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│ ┌── ▣ PVQ (1) ──────────────────────────────────── <h2> ─────────────────┐  │
│ │ Issue ISS-2207 — relates to Case A-1042                                  │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
```

Results are **grouped by source system**, each row badged, ranked by exact-identifier match → title match → recency.

| State | Copy |
|---|---|
| Query too short | "Enter at least 2 characters to search." — **no request is issued** |
| No matches | "No results for '{q}'. Check the spelling, or try a case or subject number." |
| **All sources unavailable** | "We couldn't reach any connected systems. Your search will work again once they're back." |
| Partial source failure | Results render **plus** a named degraded notice listing the systems **not** searched |
| Administrator | Search targets **applications, identities, and audit records** — administrators hold no work-item read permission |

**Search never widens scope**: the ownership predicate is applied **before** matching, so an applicant's search cannot surface another subject's item. The query is escaped for display and **never rendered as HTML**.

**Accessibility:** `<h1>` + `<h2>` per source group, gap-free. Result count announced politely. Source attribution in accessible names. Grouping is semantic (`<section aria-labelledby>` per group with a list), so heading navigation works. 320px: groups stack; no horizontal scroll.

---

## Screen: SCR-36 — Accessibility statement

**Purpose:** State the conformance claim, how it was assessed, what is **not** yet conformant, and how to report a problem. **Reachable from the footer on every screen, including login.**
**User Stories:** US-118 · **Features:** F14 · **Template:** Standalone

```
│ Accessibility statement                                         <h1>          │
│                                                                               │
│ ┌── CONFORMANCE TARGET ─────────────────────────────── <h2> ──────────────┐  │
│ │ This prototype targets Section 508 and WCAG 2.1 Level AA.               │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── HOW WE ASSESSED IT ─────────────────────────────── <h2> ──────────────┐  │
│ │ • Automated axe-core scanning in continuous integration across every    │  │
│ │   route, for every role, including error, empty, and degraded states.   │  │
│ │   The build fails on any serious or critical violation.                │  │
│ │ • A documented manual keyboard-only pass.                              │  │
│ │ • A documented manual screen-reader pass.                              │  │
│ │ Last manual pass: {date} · Tooling: {list} · Findings: {n}             │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── KNOWN LIMITATIONS ──────────────────────────────── <h2> ──────────────┐  │
│ │ Listed WITH DATES rather than claimed to be none.                      │  │
│ │ ★ "We have no known limitations" is not a credible claim and is        │  │
│ │   explicitly not made. (FR-F14-11 AC-2)                                │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── DESIGN SYSTEM ASSUMPTION ───────────────────────── <h2> ──────────────┐  │
│ │ This prototype is built on the U.S. Web Design System (USWDS) v3 with  │  │
│ │ theming applied entirely through design tokens.                        │  │
│ │                                                                        │  │
│ │ The DCSA Ecosystem Style Guide referenced as Attachment 1 of the       │  │
│ │ Innovation Call WAS NOT SUPPLIED to this effort. USWDS v3 with         │  │
│ │ token-based theming was assumed in its place. Adopting the real guide  │  │
│ │ is a token and asset change, not a component rewrite.                  │  │
│ │                                                                        │  │
│ │ ★ HONESTY ABOUT THE ASSUMPTION BELONGS ON THE PAGE THAT CLAIMS         │  │
│ │   CONFORMANCE. (FR-F14-11 rule 3, PRD Q-01)                            │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── SYNTHETIC DATA ─────────────────────────────────── <h2> ──────────────┐  │
│ │ This is a demonstration prototype. All data is synthetic. Authentication│  │
│ │ is simulated; no credential is validated.                              │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│ ┌── REPORT A PROBLEM ───────────────────────────────── <h2> ──────────────┐  │
```

**Accessibility:** the page itself conforms fully — it is the one page where a violation would be self-refuting. `<h1>` → `<h2>` per section, gap-free. Reachable from the `usa-identifier` footer on **every** screen and from the account menu, **including while unauthenticated**. Plain prose, `usa-prose` typography, no tables required to convey meaning. 320px reflow, 200% zoom.

---
