## 12. Frontend Architecture

Accessibility is a hard gate for a federal audience, and the reliable way to pass a hard gate is to make the correct structure the *default* structure. Almost every decision below exists so that a new screen inherits correct semantics rather than re-deriving them — because a pattern re-litigated on 38 screens will be wrong on at least three of them.

---

### 12.1 Routing

Next.js 15 App Router. One route segment per screen in the inventory; zero routes not in the inventory.

```
apps/web/app/
├─ layout.tsx                    # <html lang="en"> + demo banner + USWDS stylesheet
├─ (auth)/                       # unauthenticated: banner + footer, NO primary nav
│  ├─ login/page.tsx                                  SCR-01  method selection
│  ├─ login/cac-piv/page.tsx                          SCR-02  simulated cert picker
│  ├─ login/eca/page.tsx                              SCR-03  ECA identity selection
│  ├─ login/mfa/page.tsx                              SCR-04  username
│  ├─ login/mfa/code/page.tsx                         SCR-05  one-time code
│  └─ signed-out/page.tsx                             SCR-07
└─ (shell)/                      # authenticated: full chrome (SCR-08)
   ├─ layout.tsx                 # header · nav · breadcrumb · main · footer
   ├─ error.tsx                  # SCR-32 global error boundary — INSIDE the shell
   ├─ not-found.tsx              # SCR-31 — inside the shell, HTTP 404
   ├─ dashboard/page.tsx                              SCR-09/10/11/12 by activeRole
   ├─ work/page.tsx                                   SCR-13 unified queue
   ├─ work/[workItemId]/page.tsx                      SCR-14 → 15/16/17/18/19 by contentProfile
   ├─ work/[workItemId]/confirm/[txId]/page.tsx       SCR-20 dual-system confirmation
   ├─ search/page.tsx                                 SCR-35
   ├─ notifications/page.tsx                          SCR-21
   ├─ activity/page.tsx                               SCR-33 (own) / audit viewer (admin)
   ├─ activity/[auditId]/page.tsx                     SCR-34 record + chain view
   ├─ accessibility/page.tsx                          SCR-36
   ├─ denied/page.tsx                                 SCR-30
   └─ admin/
      ├─ applications/page.tsx                        SCR-22
      ├─ applications/[id]/page.tsx                   SCR-23
      ├─ applications/register/page.tsx               SCR-28 multi-step registration
      ├─ health/page.tsx                              SCR-24
      ├─ integration-issues/page.tsx                  SCR-25
      ├─ identities/page.tsx · [id]/page.tsx          SCR-26 · SCR-27
      ├─ announcements/page.tsx                       SCR-29
      ├─ operations/page.tsx                          SCR-37 demo readiness
      └─ failure-injection/page.tsx                   SCR-38
```

**Routing decisions that carry weight:**

| Decision | Why |
|---|---|
| **One dynamic route for all work-item types** (`work/[workItemId]`) | `workItemId` is `{sourceSystem}:{nativeId}`. The detail body renders from `workItemTypes[].contentProfile` supplied by the registry, so **a sixth application's detail page exists the moment it is registered** — no new route, no new file |
| Deep links work unauthenticated | `/work/PVQ:ISS-2207` redirects to SCR-01 with `returnTo` and lands directly on the item after sign-in. **One** authentication, not two |
| Errors render **inside** the shell | `error.tsx` and `not-found.tsx` live under `(shell)`, so the demo banner, navigation, and working exits are always present. A bare error page would violate both the banner invariant and the never-blank rule |
| No route outside the inventory | A CI crawl asserts every `entitlements.navigation[].href` resolves and every inventory row has a populated route |
| Queue state lives in the URL | `?sourceSystem=PVQ&status=OPEN&sort=dueDate&dir=asc&page=2` — so "return to the queue with filters intact" is a property of the address bar, plus the link is shareable and the back button behaves |

---

### 12.2 State Management

Four tiers, each with one job. No global store, because almost nothing here is genuinely client state.

| Tier | Technology | Holds | Refresh trigger |
|---|---|---|---|
| **Server state** | TanStack Query v5 | Work items, detail, dashboard widgets, notifications, health, admin data, audit | Per-query `staleTime`; invalidation after mutations; polling where specified |
| **URL state** | `useSearchParams` | Queue and audit filters, sort, direction, page, search terms | Navigation |
| **Session context** | React Context over `GET /api/session` + `/api/entitlements` | Principal view, roles, active role, navigation, permissions, expiry | Role switch; `registryVersion` change; session resume |
| **Ephemeral UI** | `useState` / `react-hook-form` | Form fields, modal open state, disclosure toggles | Local |

**Two polls, both cheap and both deliberate:**

```ts
// Registry changes — this is what makes registering CVS appear WITHOUT a reload
useQuery({
  queryKey: ['registry-version'],
  queryFn: () => api.get('/api/registry-version'),
  refetchInterval: 30_000,
  refetchOnWindowFocus: true,
  onSuccess: (v) => { if (v.version !== known) invalidate(['entitlements']); },
});

// Health — polled only WHILE a degraded notice is displayed, plus on refocus
useQuery({
  queryKey: ['health-summary'],
  queryFn: () => api.get('/api/health/summary'),
  refetchInterval: anyDegraded ? 30_000 : false,   // reads stored state; never probes
  refetchOnWindowFocus: true,
});
```

**No optimistic updates on mutations.** The UI reflects state only after the spoke confirms the write, so displayed state never diverges from the system of record. An optimistic queue that shows "Resolved" before PVQ agreed would undermine the exact claim this product is making.

---

### 12.3 USWDS Integration and Token-Only Theming

**The rule: zero hard-coded visual values anywhere in the codebase**, enforced by a build-failing lint rule rather than by review.

```scss
// packages/theme/_uswds-theme.scss
// THE ONLY FILE IN THE REPOSITORY CONTAINING A COLOR VALUE.
// Swapping in the real DCSA Ecosystem Style Guide is a change to THIS FILE plus
// an asset swap — not a component rewrite. That is the whole point of tokens.
@use "uswds-core" with (
  $theme-image-path:            "/assets/uswds/img",
  $theme-font-path:             "/assets/uswds/fonts",

  // Palette — token NAMES from the USWDS system palette, never literals
  $theme-color-primary-family:   "blue",
  $theme-color-primary:          "blue-warm-60v",
  $theme-color-primary-darker:   "blue-warm-80v",
  $theme-color-primary-vivid:    "blue-warm-70v",
  $theme-color-base-family:      "gray-cool",
  $theme-color-accent-cool:      "cyan-30v",

  // Typography — Public Sans, self-hosted (no CDN, constraint C3)
  $theme-font-type-sans:         "public-sans",
  $theme-type-scale-lg:          7,
  $theme-body-font-family:       "sans",

  // Spacing and radius from the USWDS scale, never raw px
  $theme-site-margins-width:     "desktop",
  $theme-border-radius-md:       "md",

  // Focus — visible, 3:1 minimum, never removed
  $theme-focus-color:            "blue-warm-40v",
  $theme-focus-width:            0.25rem,
  $theme-focus-offset:           0,

  // Ship only what is used; keeps the offline bundle small
  $theme-show-compile-warnings:  false,
  $theme-banner-background-color: "ink"
);
```

```js
// stylelint.config.cjs — the mechanical enforcement of NFR-03
module.exports = {
  rules: {
    'color-no-hex': true,
    'declaration-property-value-disallowed-list': {
      '/color/':       [/^rgb/, /^hsl/, /^#/, /^(red|blue|green|black|white|gray|grey)$/],
      'font-family':   [/.+/],           // fonts come from tokens only
      '/^(margin|padding|gap)/': [/^\d+px$/],   // spacing comes from the token scale only
    },
    'declaration-property-value-allowed-list': {
      'outline': [/^units\(/, /^0$/],    // outline:none without a replacement is prohibited
    },
  },
  ignoreFiles: ['packages/theme/_uswds-theme.scss'],   // the one permitted exception
};
```

**Component adoption.** Every UI element is a USWDS v3 component or composed from USWDS primitives. `apps/web/components/uswds/` holds thin typed wrappers that emit USWDS markup and class names — they add TypeScript props and nothing else. No bespoke component library, and no reimplementation of anything USWDS already provides. A pull request introducing a component that duplicates a USWDS one fails design review, and the list of provided components is enumerated in the contributing guide so the question is answerable without debate.

**Theme swap path.** If the real DCSA Ecosystem Style Guide arrives: edit `_uswds-theme.scss`, replace the seal/wordmark asset in `public/assets/dcsa/`, re-run `@uswds/compile`. No component file changes. A test asserts this by compiling with a deliberately different palette and confirming every screen re-renders without a component edit.

---

### 12.4 Accessibility Architecture

Accessibility is inherited from four page templates rather than implemented per screen. Any screen not built on a template fails design review — the templates are the mechanism by which correctness is inherited instead of re-argued.

| Template | Structure | Built-in states |
|---|---|---|
| **`ListPage`** | Filter form + filter chips + `<table>` with `<caption>` + pagination | loading / empty / error / degraded |
| **`DetailPage`** | Summary header + content sections + action panel + activity history | loading / empty / error / degraded |
| **`FormPage`** | Error summary + `<fieldset>` groups + actions | loading / validation-error / submit-error |
| **`ConsolePage`** | Sub-navigation + list/detail split | loading / empty / error / degraded |

#### Focus management

```ts
// apps/web/lib/a11y/useRouteFocus.ts
// Client-side navigation leaves screen-reader users stranded at the top of an unchanged
// DOM unless focus is moved deliberately. This runs on every route change.
export function useRouteFocus(pageTitle: string) {
  const pathname = usePathname();
  useEffect(() => {
    document.title = `${pageTitle} — DCSA Unified Layer`;   // unique, descriptive, per route
    const h1 = document.querySelector<HTMLHeadingElement>('main h1');
    h1?.setAttribute('tabindex', '-1');
    h1?.focus({ preventScroll: false });
  }, [pathname, pageTitle]);
}
```

| Situation | Behavior |
|---|---|
| Client-side navigation | Title updates; focus moves to the new `<h1>` |
| Form validation failure | Focus moves to the error summary; `<title>` prefixed `"Error: "`; each summary entry is an in-page link that focuses its field |
| Modal open | Focus trapped; Escape closes; **focus returns to the invoking control** |
| Action success | Confirmation announced politely **and** receives focus, so a keyboard user knows the action landed |
| Skip link | First focusable element on every route; visible on focus; moves focus to `<main>` |
| Disabled control | Removed from the tab order, with its `disabledReason` rendered **adjacent as text** — so the explanation is readable without focusing an unfocusable element |

#### Live regions

| Politeness | Used for |
|---|---|
| `aria-live="polite"` | Queue refresh and result counts, widget load completion, sort and filter changes, alert counts, health recovery, role switch, connection-test results |
| `role="alert"` / `assertive` | Form error summaries, action failures, session-timeout thresholds, degraded warnings **on first appearance only** |

Announcements are **debounced and deduplicated** — rapid successive changes produce one announcement, not a stream — and a degraded notice is not re-announced on every 30-second poll. Dynamic insertion never moves focus or reorders content under the user's cursor.

#### Landmarks and headings

Document order: skip link → **demo banner** → USWDS government banner → `<header role="banner">` → `<nav aria-label="Primary">` → `<nav aria-label="Breadcrumb">` → `<main id="main-content">` → `<footer role="contentinfo">`. Exactly one `<h1>` per page, and it is the page's own title rather than the product name. Heading hierarchy is gap-free. Additional navs carry distinct `aria-label`s.

#### Non-colour meaning

Status is **never** conveyed by colour alone. Every status, priority, health state, outcome, overdue marker, and validation state is paired with text and a distinct icon shape:

| Domain | Representation |
|---|---|
| Health | "Healthy" ✓ / "Degraded" ! / "Unavailable" ✕ |
| Priority | "Urgent" / "Elevated" / "Routine" as text, with distinct tag shapes |
| Overdue | The word "Overdue" plus an icon — never a red row alone |
| Outcome | "Success" / "Denied" / "Failed" as text |

Verified two ways: an automated contrast check reporting 100% conformance, and a grayscale rendering of every screen retaining all status meaning.

#### Tables

Real `<table>` with `<caption>` stating contents and current result count; `<th scope="col">` on every header and `scope="row"` on the identifying cell; sortable headers containing a `<button>` with `aria-sort` on the `<th>`; USWDS pagination with `aria-current="page"` and **disabled — not hidden** — bounds controls; result-count changes announced politely; horizontal scrolling confined to a labelled, keyboard-scrollable region rather than forcing page-level scroll.

#### Forms

Programmatically associated `<label>` on every input (never a placeholder as a label); hint text via `aria-describedby`; required fields marked with the **text** "required" rather than colour or an asterisk alone; related inputs in `<fieldset>`/`<legend>`; `aria-invalid="true"` on failing fields; character counters announced at 90% and 100% of the limit rather than on every keystroke.

**Client and server validate with the same TypeBox schema**, so client validation can never block a submission the server would accept or accept one the server would reject. That is a structural guarantee of the shared-schema decision, not a discipline.

#### Motion, zoom, and responsive

`prefers-reduced-motion: reduce` disables all non-essential animation including skeleton shimmer. Fully usable at 200% zoom and at 320 px width with no horizontal page scroll. Touch targets at least 44 × 44 CSS pixels. No content requires hover to be discoverable; tooltip content is available on focus and is never the sole source of essential information.

---

### 12.5 The Uniform State Pattern

Every data-bearing region on every screen implements the same five states. Defining them once in the templates is what prevents the thirty-eighth screen from inventing a thirty-eighth interpretation.

```tsx
// apps/web/components/templates/DataRegion.tsx
export function DataRegion<T>({ query, sourceStatus, region, children, empty }: Props<T>) {
  // 1 LOADING — skeleton at REGION granularity, never whole-page blanking
  if (query.isLoading) {
    return (
      <div aria-busy="true" className="usa-skeleton-region">
        <span className="usa-sr-only">Loading {region}</span>
        <Skeleton preserveLayout />       {/* preserves dimensions: no content shift */}
      </div>
    );
  }

  // 2 ERROR — inline within the region; NEVER replaces the page
  if (query.isError) {
    return (
      <Alert type="error" role="alert" heading="We couldn't load this">
        {query.error.message}
        <CorrelationId value={query.error.correlationId} copyable />
        <Button onClick={() => query.refetch()}>Try again</Button>
      </Alert>
    );
  }

  const down = sourceStatus?.filter(s => s.status === 'DOWN') ?? [];

  // 3 EMPTY — and ONLY when the data is genuinely empty. Never when a source failed:
  //   "You have no assigned work" and "We couldn't load your work" are different
  //   statements, and conflating them is the single most consequential error here.
  if (isEmpty(query.data) && down.length === 0) {
    return <EmptyState heading={empty.heading} body={empty.body} action={empty.action} />;
  }

  return (
    <>
      {/* 4 DEGRADED — named, quantified, announced once, above the partial content */}
      {down.length > 0 && (
        <SiteAlert type="warning" role="status" announceOnce>
          {down.map(s => degradedCopy(s.label, s.omittedItemEstimate)).join(' ')}
        </SiteAlert>
      )}
      {/* 5 READY — possibly partial, and the gap above says exactly what is missing */}
      {children(query.data)}
    </>
  );
}
```

Every list, table, widget, and panel in the application is wrapped in this component. The consequence a reviewer sees: with IM forced offline, **every** affected surface degrades identically and says so — the queue, the dashboard, search, notifications, and the related-items panel — with no error page anywhere in the application.

---

### 12.6 Rendering Strategy

| Concern | Strategy | Why |
|---|---|---|
| Demo banner | **Server-rendered** in the root layout | It must be in the initial document with no client state path to hide it |
| Shell chrome | Server Component reading session + entitlements | Navigation is correct on first paint; no flash of a wrong menu |
| Page titles | Set server-side, updated client-side on navigation | Unique and descriptive per route |
| Data regions | Client Components with TanStack Query | Per-widget loading, polling, and invalidation |
| Forms | Client Components with `react-hook-form` | Focus management and inline validation demand client control |
| API calls | Same-origin `/api/*` via the Next rewrite | No CORS, no `SameSite` relaxation, cookie just works |
| USWDS JS | Initialized once in a client boundary in the root layout | Accordions, modals, and nav menus need their behavior attached |

**Never cached:** every authenticated response carries `Cache-Control: no-store`, and no work-item or audit data is statically generated.

---

### 12.7 The Frontend's Security Posture

Stated plainly because it is easy to get backwards:

1. **The client renders what the server says it may see.** Navigation comes from `entitlements.navigation`; action buttons come from server-computed `ActionDescriptor[]`.
2. **The server independently re-decides on every request.** The PDP does not consult, trust, or even see what the client rendered.
3. **Hiding a control is a courtesy, never a control.** The RBAC negative-path suite exercises every forbidden operation by direct API call with the UI bypassed entirely.
4. **The client holds no claims.** The session cookie contains a signed `sessionId` and nothing else. Editing it invalidates the session rather than escalating anything.
5. **The client never talks to a spoke.** Zero links, iframes, or redirects to a spoke origin, asserted by link crawl.

---
