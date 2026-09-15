## F3 — Unified Navigation Shell and Global Chrome

**Traces to:** PRD F3 (P0); NFR-13, NFR-14, NFR-16, SM-05, SM-06, SM-10. **Screens:** SCR-08 (the shell itself) plus the full screen inventory below. **API:** `Y1a §Entitlements`.

**Description:** The persistent application frame every authenticated screen lives inside — DCSA-themed global header, role-aware primary navigation, breadcrumbs that express cross-application context, session controls, footer, skip link, and the non-dismissible demo banner. This is the presentation-layer feature that makes five systems read as one product, and it is where the "every button works" promise is kept or broken. It is specified as its own requirement set with its own screens and states; it is not a byproduct of any API feature.

**Terminology:**
- **Shell** — the chrome: banner, header, nav, breadcrumb, main landmark, footer. Every route renders inside it, including errors.
- **Page template** — one of four reusable layouts (List, Detail, Form, Console) every screen is built from.
- **Cross-application breadcrumb** — a trail whose segments may belong to different source systems.
- **Dead route** — a navigation target that 404s, renders an empty shell, or shows a non-functional control. The product tolerates zero.

---

### FR-F03-01 — Shell composition and landmark structure (SCR-08)

**Description:** The structural frame and its accessibility semantics.

**Inputs:** `GET /api/entitlements`, `GET /api/session`, current route.

**Processing / business rules:**
1. Document order: skip link → demo banner → USWDS government banner → header (wordmark, primary nav, session controls) → breadcrumb → `<main id="main-content">` → footer.
2. Landmarks: exactly one `<header role="banner">`, one `<nav aria-label="Primary">`, one `<nav aria-label="Breadcrumb">`, one `<main>`, one `<footer role="contentinfo">`. Additional navs carry distinct `aria-label`s.
3. Exactly one `<h1>` per page, which is the page's own title, not the product name.
4. `document.title` is set on every navigation as `{Page name} — DCSA Unified Layer`, and the new page's `<h1>` receives focus on client-side route change so screen-reader users are not stranded.
5. The shell renders for authenticated and unauthenticated routes alike; unauthenticated routes show the banner and footer but no primary nav.
6. Responsive: at <640px the primary nav collapses to a USWDS menu button with `aria-expanded`, focus trapped while open, Escape closes and restores focus. No horizontal scrolling at 320px; usable at 200% zoom (NFR-16).

**Outputs:** A consistent frame on every route.

**Validation rules:** A route MUST NOT render outside the shell. A CI check asserts the shell's landmark set and single-`h1` rule on every route for every role.

**Error handling:** If entitlements fail to load, the shell renders with the banner, header identity, and an inline alert "We couldn't load your menu. Refresh the page — reference {correlationId}." The user is never left with a bare page.

**Acceptance criteria:**
- AC-1: Every route for every role renders the full landmark set (automated).
- AC-2: Page title and focus update on client-side navigation.
- AC-3: No horizontal scroll at 320px on any route.

---

### FR-F03-02 — Screen inventory (every route maps to a real screen)

**Description:** The complete enumeration of screens, their purpose, the roles that can reach them, their data sources, and their required states. Every primary navigation item maps to a row here; every row is implemented. There are no placeholder screens.

| ID | Screen | Purpose | Roles | Data source | Owning FR |
|---|---|---|---|---|---|
| SCR-01 | Login — method selection | Choose auth method | Anonymous | `/api/auth/methods` | FR-F00-01 |
| SCR-02 | CAC/PIV certificate picker | Select synthetic cert identity | Anonymous | `/api/auth/initiate` | FR-F00-02 |
| SCR-03 | ECA identity selection | Select ECA identity | Anonymous | `/api/auth/initiate` | FR-F00-03 |
| SCR-04 | Generic MFA — username | Enter demo username | Anonymous | `/api/auth/initiate` | FR-F00-04 |
| SCR-05 | Generic MFA — one-time code | Enter demo code | Anonymous | `/api/auth/complete` | FR-F00-04 |
| SCR-06 | Session timeout warning (modal) | Extend or end session | All | `/api/session/extend` | FR-F00-06 |
| SCR-07 | Signed out | Confirm termination | Anonymous | — | FR-F00-07 |
| SCR-08 | Application shell | Chrome for all routes | All | `/api/entitlements` | FR-F03-01 |
| SCR-09 | Investigator dashboard | Caseload, alerts, due dates | Investigator | `/api/dashboard` | FR-F04-02 |
| SCR-10 | Adjudicator dashboard | Determination queue, status mix | Adjudicator | `/api/dashboard` | FR-F04-03 |
| SCR-11 | Applicant dashboard | Plain-language status, tasks, notices | Applicant | `/api/dashboard` | FR-F04-04 |
| SCR-12 | Administrator dashboard | Platform health, issues, registry | Administrator | `/api/dashboard` | FR-F04-05 |
| SCR-13 | Unified work queue | All assigned work, all sources | Inv, Adj, App | `/api/work-items` | FR-F05-01 |
| SCR-14 | Work-item detail | Review and act | Inv, Adj, App | `/api/work-items/{id}` | FR-F06-01 |
| SCR-15 | eApp case view | Full questionnaire case + related items | Inv, Adj, App (own) | `/api/work-items/EAPP:*` | FR-F06-08 |
| SCR-16 | PVQ issue detail & resolution | Resolve a questionnaire issue | Investigator | `/api/work-items/PVQ:*` | FR-F07a-04 |
| SCR-17 | PDT designation view | Review/approve position designation | Inv, Adj, Admin(read) | `/api/work-items/PDT:*` | FR-F06-09 |
| SCR-18 | IEP applicant status view | Status, notices, outstanding tasks | Applicant | `/api/work-items/IEP:*` | FR-F06-10 |
| SCR-19 | IM case assignment view | Case assignment and leads | Inv, Adj | `/api/work-items/IM:*` | FR-F06-11 |
| SCR-20 | Dual-system confirmation | Per-spoke result of an orchestrated action | Investigator | `/api/orchestration/*` | FR-F07b-04 |
| SCR-21 | Notifications & announcements | All alerts and notices | All | `/api/notifications` | FR-F15-06 |
| SCR-22 | Admin console — connected applications | Registry inventory | Administrator | `/api/admin/applications` | FR-F11-01 |
| SCR-23 | Admin console — application detail | Config, health history, errors, test connection | Administrator | `/api/admin/applications/{id}` | FR-F11-04 |
| SCR-24 | Admin console — system health | Per-app health and latency | Administrator | `/api/admin/health` | FR-F11-02 |
| SCR-25 | Admin console — integration issues | Adapter failure log | Administrator | `/api/admin/integration-issues` | FR-F11-03 |
| SCR-26 | Admin console — identities & roles | Who holds what | Administrator | `/api/admin/users` | FR-F02-08 |
| SCR-27 | Identity detail | Roles, attributes, recent activity | Administrator | `/api/admin/users/{id}` | FR-F02-08 |
| SCR-28 | Application registration (multi-step) | Onboard a new application | Administrator | `/api/admin/applications` | FR-F12-01 |
| SCR-29 | Announcement management | Create/edit/expire announcements | Administrator | `/api/admin/announcements` | FR-F15-04 |
| SCR-30 | Access denied | Explain denial, offer exits | All | — | FR-F02-07 |
| SCR-31 | Not found | Explain missing route, offer exits | All | — | FR-F03-08 |
| SCR-32 | Unexpected error | Global error boundary | All | — | FR-F16-10 |
| SCR-33 | Audit trail viewer | Filterable audit table | Admin (all), others (own) | `/api/audit` | FR-F13-05 |
| SCR-34 | Audit record detail & chain view | One record + its correlation chain | Admin (all), others (own) | `/api/audit/{id}` | FR-F13-06 |
| SCR-35 | Global search results | Search across permitted work items | Inv, Adj, App | `/api/search` | FR-F03-07 |
| SCR-36 | Accessibility statement | Conformance and known limits | All + anonymous | static | FR-F14-11 |
| SCR-37 | Demo operations / service status | Service readiness at a glance | Administrator | `/api/admin/status` | FR-F18-07 |
| SCR-38 | Failure injection controls | Force spoke states for demo | Administrator | `/api/admin/failure-injection` | FR-F16-11 |

**Validation rules:** Every row has an implemented route, a populated state under seeded data, a designed empty state, and a designed error state. No row is marked "coming soon."

**Acceptance criteria:**
- AC-1: An automated crawl per role reaches every reachable screen with HTTP 200 and non-empty `<main>` (SM-05).
- AC-2: Every interactive control on every screen has a handler that produces an observable result (SM-06).

---

### FR-F03-03 — Non-dismissible demo banner

**Description:** A permanent, unhideable indicator that all data is synthetic.

**Processing / business rules:**
1. Rendered server-side into the document at the top of the shell, above the USWDS government banner, on **every** route including SCR-01, SCR-30, SCR-31, SCR-32.
2. Copy: **"Demo — Synthetic Data Only. This prototype contains no real DCSA data, no real personal information, and no connection to any government system."**
3. The element has no close control, no `hidden` attribute path, no CSS class toggled by state, and is not conditional on any feature flag. It carries `data-permanent="true"`.
3a. **Responsive chrome budget (normative).** The banner competes with primary content at 320px, where SCR-11's plain-language status answer must remain above the fold. The resolution is a measured budget, never dismissal:
   - **≥ 1024px:** full copy, single line, ≤ `units(4)`.
   - **640–1023px:** full copy, may wrap to two lines, ≤ `units(6)`.
   - **< 640px:** the **visible** copy truncates to its bold lede — "Demo — Synthetic Data Only." — while **the full sentence in rule 2 remains verbatim in the accessible DOM** in a visually-hidden span, ≤ `units(4)`. The USWDS government banner collapses to its closed accordion state, the header compacts to a single `units(7)` row, and on SCR-11 the `<h1>` and status sentence are the first content in `<main>` with no breadcrumb, page-alert, or announcement region above them.
   - **Total chrome budget at 320px: ≤ `units(15)` (~120px)**, so the status sentence is visible in a 320×568 viewport without scrolling. This is a measured acceptance criterion on SCR-11 (NFR-16, SM-25), not an aspiration.
   Truncation of the *visible* copy is the only permitted variation. It is not a dismissal path, and it never applies to the accessible text.
4. It is not `aria-hidden`, is inside the `banner` landmark, and meets AA contrast in both default and forced-colors modes.
5. It is not the same component as announcements (`FR-F15-04`), which are dismissible, and an announcement MUST NOT overlay it.

**Validation rules:** A CI assertion (`FR-F19-08`) loads every route, for every role, plus error routes, and fails if the banner's **verbatim accessible text** is absent, if a close control exists, or if the banner element is removed from the accessibility tree (`display:none`, `visibility:hidden`, `aria-hidden`, or zero height). The assertion runs at 320px, 768px and 1280px and evaluates **accessible text, not visible text**, so the rule 3a truncation cannot fail a conformant build — while a genuinely hidden banner still fails at every width.

**Error handling:** If banner rendering fails, the page fails — a page without the banner is not served.

**Acceptance criteria:**
- AC-1: 100% of routes present the banner (SM-10, NFR-13), at 320px, 768px and 1280px.
- AC-2: Zero dismissal paths exist, verified by DOM inspection and by grep for a close handler.
- AC-3: At 320×568 the total chrome above `<main>` measures ≤ `units(15)` and SCR-11's status sentence is visible without scrolling (SM-25, NFR-16), while the banner's full sentence is still returned verbatim by the accessibility tree.

---

### FR-F03-04 — Role-differentiated primary navigation

**Description:** Each role gets a distinct navigation set, generated from server entitlements, where every item leads somewhere real.

**Inputs:** `entitlements.navigation` (`FR-F02-06`).

**Processing / business rules:**
1. Default nav sets:
   - **Investigator:** Dashboard, Work Queue, Notifications, My Activity (audit-own), Search
   - **Adjudicator:** Dashboard, Work Queue, Notifications, My Activity, Search
   - **Applicant:** Dashboard, My Tasks, My Notices, My Status, Help
   - **Administrator:** Dashboard, Connected Applications, System Health, Integration Issues, Audit Trail, Identities & Roles, Announcements, Demo Operations
2. Items are ordered by `order` from entitlements; badge counts (e.g. unread alerts) are supplied server-side and rendered as text plus count, never color-only.
3. Current page indication uses `aria-current="page"` plus a visible non-color indicator (weight/underline).
4. Navigation items sourced from registry-backed applications disappear when the application is disabled, without a redeploy.
5. Keyboard: nav is a list of links; dropdowns (if any) are USWDS nav submenus with arrow-key support and Escape to close.

**Outputs:** Rendered primary nav.

**Validation rules:** Zero items without a route; zero routes reachable by a role whose entitlements omit them (server enforces regardless).

**Error handling:** A nav item whose target application is DOWN still renders and still resolves; the destination screen shows the degraded state (`FR-F16-05`) rather than a broken link.

**Acceptance criteria:**
- AC-1: Four roles produce four distinct nav sets, each fully populated.
- AC-2: Disabling an app removes its nav item within one registry poll with no restart (SM-12 inverse).

---

### FR-F03-05 — Session and identity controls in the header

**Description:** Header-resident controls for identity, role context, session time, and sign-out.

**Processing / business rules:**
1. Renders: "Signed in as {displayName}", role badge "{activeRole}", method label "via {method} (simulated)", session timer, account menu.
2. Account menu items: "Switch role" (only when >1 role, listing held roles), "Accessibility statement," "Sign out."
3. Role switch calls `POST /api/session/active-role`, re-fetches entitlements, re-renders nav, and announces via `aria-live="polite"`: "Role changed to {role}. Your menu has been updated."
4. Sign-out posts to `/api/auth/logout` (`FR-F00-07`).
5. On viewports <640px, controls collapse into the menu button but remain reachable — nothing becomes unreachable at small sizes.

**Validation rules:** Role switch offers only held roles; a POST with an unheld role returns `ROLE_NOT_HELD`.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Role switch to unheld role | 403 | `ROLE_NOT_HELD` | "You don't have that role. Your available roles are shown in the account menu." |
| Session info unavailable | 401 | `SESSION_INVALID` | "You're not signed in. Sign in to continue." |

**Acceptance criteria:**
- AC-1: Role switch changes navigation and dashboard without re-authentication and writes one audit record.
- AC-2: All header controls are keyboard-reachable with visible focus.

---

### FR-F03-06 — Cross-application breadcrumbs

**Description:** Breadcrumbs that express where the user is across system boundaries, so the flagship workflow never feels like a context switch.

**Inputs:** Route parameters plus server-provided `breadcrumbTrail` on detail responses.

**Processing / business rules:**
1. Detail endpoints return `breadcrumbTrail: [{ label, href, sourceSystem | null }]`. The client does not invent labels from IDs.
2. Cross-system example, exactly as the flagship workflow produces it:
   `Work Queue › eApp Case A-1042 › Related PVQ Issue ISS-2207`
   with the second segment badged "eApp" and the third badged "PVQ".
3. The final segment is plain text with `aria-current="page"`; preceding segments are links that restore their prior state (queue filters, case scroll position).
4. Trail depth is capped at 4; deeper trails collapse the middle with an accessible "Show full trail" disclosure, never with a silent ellipsis.
5. Breadcrumb source-system badges use text plus icon, never color alone.

**Outputs:** Breadcrumb nav on every detail and form screen.

**Validation rules:** Every non-final segment resolves; a segment whose source system is DOWN still renders and leads to that screen's degraded state.

**Error handling:** Missing `breadcrumbTrail` → client renders a minimal trail from the route table and records a client-side telemetry warning; the page still works.

**Acceptance criteria:**
- AC-1: During F7, the breadcrumb names both the eApp case and the PVQ issue with source badges (SM-04 support).
- AC-2: Clicking the case segment from the issue screen returns to the case with context intact.

---

### FR-F03-07 — Global search entry point (SCR-35)

**Description:** A header search scoped server-side to what the principal may see.

**Inputs:** `q` (string, 2–120 chars), optional `sourceSystem[]`, `type[]`.

**Processing / business rules:**
1. `GET /api/search?q=` fans out to enabled adapters with the principal's scope (`FR-F02-04`) and matches on title, subject reference, and identifier.
2. Results are normalized WorkItems grouped by source system, each row badged with its system, ranked by exact-identifier match, then title match, then recency.
3. Partial-source failure is tolerated exactly as in the work queue (`FR-F05-05`): results render, and a named degraded notice lists the systems not searched.
4. Result count is announced via `aria-live="polite"`: "{n} results for {q}. {m} systems searched."
5. Administrators do not receive work-item search (they hold no work-item read permission); their header search targets applications, identities, and audit records instead.

**Outputs:** SCR-35 with grouped results, or a designed empty state.

**Validation rules:** `q` trimmed, minimum 2 characters after trim; below that the control shows "Enter at least 2 characters to search." and does not issue a request.

**Error handling:**

| Scenario | HTTP | Code | User-facing message |
|---|---|---|---|
| Query too short | 400 | `VALIDATION_FAILED` | "Enter at least 2 characters to search." |
| All sources unavailable | 200 | — | Empty state: "We couldn't reach any connected systems. Your search will work again once they're back." |
| No matches | 200 | — | Empty state: "No results for '{q}'. Check the spelling, or try a case or subject number." |

**Acceptance criteria:**
- AC-1: Searching a seeded case number returns that case, badged with eApp.
- AC-2: An applicant's search never returns another subject's item (`FR-F02-04`).

---

### FR-F03-08 — Not-found route (SCR-31) and page templates

**Description:** Unknown routes and the four reusable layouts.

**Processing / business rules:**
1. Unknown routes render SCR-31 inside the shell: `<h1>` "We couldn't find that page," explanatory sentence, the attempted path shown as text (escaped, never rendered as HTML), correlation ID, and two actions: "Go to my dashboard," "Go to my work queue."
2. SCR-31 returns HTTP 404 with `<title>Page not found — DCSA Unified Layer</title>` and moves focus to the `<h1>`.
3. Four page templates exist and are the only permitted layouts: **List** (filters + table + pagination), **Detail** (summary header + content sections + action panel + activity), **Form** (error summary + fieldsets + actions), **Console** (sub-navigation + list/detail split). New screens inherit correct heading order, landmarks, and state handling from the template.
4. Each template defines loading, empty, error, and degraded presentations so no screen has to invent them (`FR-F16-06`, `FR-F16-07`, `FR-F16-08`).

**Validation rules:** A screen not built on one of the four templates fails design review; the templates are the mechanism by which accessibility is inherited rather than re-litigated per page.

**Error handling:** SCR-31 is itself error handling; it never 500s and always includes the demo banner.

**Acceptance criteria:**
- AC-1: A fabricated URL renders SCR-31 with the banner, a 404 status, and working exit links.
- AC-2: All 38 screens map to one of the four templates (design review artifact).

---
