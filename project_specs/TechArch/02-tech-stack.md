## 2. Technology Stack

Every selection below is pinned to a specific version, carries one line of rationale, and was filtered through four hard constraints stated first. Where a popular alternative was rejected, the rejection is recorded in an ADR (chunk 16) rather than left implicit.

---

### 2.1 The Four Hard Constraints

| # | Constraint | What it eliminates | What it forces |
|---|---|---|---|
| **C1** | **USWDS v3 must be consumed cleanly**, components and design tokens, with theming by token override only (`FR-F14-01`, `NFR-03`). | Any framework whose styling model fights Sass — CSS-in-JS, utility-first frameworks with their own scale (Tailwind), and component libraries that duplicate USWDS (MUI, Chakra, Ant). | A Sass build pipeline using `@uswds/compile`, and a component layer that is a thin wrapper over USWDS markup rather than a parallel design system. |
| **C2** | **One documented command builds and runs everything** on an evaluator's machine (`FR-F18-01`, `NFR-18`). | Multi-repo layouts, per-service manual bootstrapping, cloud-only dependencies, anything requiring a managed database. | Docker Compose with a single `run.sh up`, a single npm workspaces lockfile, and a containerized Postgres. |
| **C3** | **Offline / air-gapped-ish.** No external SaaS, no CDN, no license server, no telemetry endpoint at runtime (`Y3 §1`, PRD §9). | Auth0/Okta/Cognito, hosted Postgres, Sentry/Datadog, Google Fonts, CDN-hosted USWDS assets, any AI/API service. | Vendored fonts and assets, a local simulated IdP, file/stdout logging, and a `postinstall` that touches nothing on the network at run time. |
| **C4** | **Boring and deterministic.** A demo that behaves differently on the third run is worse than one that is plain (`SM-22`, `FR-F19-10`). | Bleeding-edge releases, alpha/canary/RC versions, packages with fewer than two stable years, anything with nondeterministic ordering. | Exact-version pins, a committed lockfile, a fixed seed constant, and a fixed seed reference date. |

---

### 2.2 Runtime and Language

| Layer | Selection | Version | Rationale |
|---|---|---|---|
| Runtime | Node.js LTS | `22.11.0` (pinned in `.nvmrc` and `node:22.11-bookworm-slim`) | Active LTS through 2027; native `fetch` with `AbortSignal.timeout` gives adapter deadlines without an HTTP-client dependency; one runtime for hub, spokes, UI, and tests. |
| Language | TypeScript | `5.6.3` | `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` on. The adapter contract is the primary deliverable; it must be a compiler-checked interface, not documentation. |
| Package manager | npm workspaces | npm `10.9.x` (bundled with Node 22) | Already present with Node — no extra tool for an evaluator to install (C2). One `package-lock.json` is the determinism guarantee (C4). |
| Build | `tsc` (services) + `next build` (UI) | — | No bundler for server code. Fewer moving parts, readable stack traces, faster to diagnose at 9:58 before a 10:00 demo. |
| Process orchestration (non-Docker fallback) | `concurrently` | `9.1.0` | `npm run dev:all` for engineers who prefer not to containerize; Compose remains the documented path. |

---

### 2.3 Frontend

| Layer | Selection | Version | Rationale |
|---|---|---|---|
| Framework | **Next.js (App Router)** | `15.1.3` | Server-rendered shell is required: the demo banner must be in the initial document with no state path to hide it (`FR-F03-03` rule 1), page titles must be server-set and unique, and route-level `error.tsx`/`not-found.tsx` map exactly onto SCR-32/SCR-31. Version **≥ 15** is mandatory because we use `next.config.ts` — see §2.9. |
| UI library | React | `19.0.0` | Stable pairing with Next 15.1; Server Components let the shell render without shipping session logic to the browser. |
| Design system | **`@uswds/uswds`** | `3.11.0` | The federal standard and a hard requirement. Adopted wholesale: no bespoke component library (`FR-F14-01` rule 1). |
| USWDS build | `@uswds/compile` | `1.2.1` | Official Sass pipeline. Compiles `packages/theme/_uswds-theme.scss` (token overrides only) plus USWDS sources into one stylesheet, and copies fonts/images into `apps/web/public/assets` — so nothing is fetched from a CDN (C3). |
| Sass | `sass` (dart-sass) | `1.83.0` | Required by `@uswds/compile`; the only CSS preprocessor in the stack. |
| Server state | **TanStack Query** | `5.62.x` | Nearly all client state is server state. Gives per-widget loading/error states (`FR-F16-06` granularity), 30-second polling for `registry-version` and `health/summary`, refetch-on-focus, and cache invalidation after a mutation — all behaviors the FRD requires and that a hand-rolled fetcher gets subtly wrong. |
| Client state | React Context + **URL search params** | — | Queue filters, sort, and page live in the URL. That makes "return to queue with your filters, sort, and page intact" (`FR-F05-01`, `FR-F06-01`) a property of the address bar rather than a synchronization problem. No Redux — see ADR-006. |
| Forms | `react-hook-form` | `7.54.x` | Field-level validation with programmatic `setFocus`, which is how `FR-F14-03` rule 5 ("focus moves to the error summary, summary links focus their fields") is implemented rather than approximated. |
| Validation | `@sinclair/typebox` + `ajv` | `0.34.x` / `8.17.x` | The **same schema object** validates on the client and on the server, satisfying `FR-F14-03` rule 9 ("client validation never blocks a submission the server would accept") structurally instead of by review. |
| Icons | USWDS sprite (`@uswds/uswds`) | 3.11.0 | Vendored SVG sprite; no icon package, no network fetch. |
| Typography | Public Sans, self-hosted | shipped with USWDS 3.11 | Required by the assumed theme; self-hosting is a C3 requirement. |

---

### 2.4 Hub and Spoke Services

| Layer | Selection | Version | Rationale |
|---|---|---|---|
| HTTP framework | **Fastify** | `5.2.0` | Chosen over Express for three specific reasons: (a) its hook lifecycle gives a genuinely ordered, non-bypassable pipeline matching `FR-F10-01`'s eleven steps; (b) plugin encapsulation means a child route cannot drop a parent hook, which is how "every endpoint invokes the PDP" becomes structural; (c) route schemas are JSON Schema, so OpenAPI is *generated from the implementation* as `FR-F10-06` rule 1 demands. See ADR-003. |
| Schema / types | `@sinclair/typebox` | `0.34.x` | One declaration yields the TS type, the ajv validator, and the OpenAPI schema. Three artifacts that must agree, derived from one source. |
| OpenAPI | `@fastify/swagger` + `@fastify/swagger-ui` | `9.4.x` / `5.2.x` | Serves `/api/docs` and `/api/docs/openapi.json`, and writes the spec to a file at build time for the repository (`FR-F10-06` rule 2). |
| Cookies / CSRF | `@fastify/cookie`, `@fastify/csrf-protection` | `11.0.x` / `7.0.x` | Signed `HttpOnly` session cookie carrying only a `sessionId`; double-submit CSRF token as a separate readable cookie plus `X-CSRF-Token` header (`FR-F01-01` rules 2 and 4). |
| Rate limiting | `@fastify/rate-limit` | `10.2.x` | Demo-grade, per-session and per-IP limits from `FR-F10-07`, set generously enough that no scripted demo path can trip them. |
| Principal assertion | **`jose`** (EdDSA / Ed25519 JWT) | `5.9.x` | Zero-dependency, standards-based, works offline. The `aud` claim maps directly onto `FR-F01-02`'s audience binding, so "replaying a PVQ assertion at eApp is rejected" is a library guarantee rather than custom crypto. |
| IDs | `ulid` | `2.3.0` | ULIDs are lexicographically sortable and match the `^[0-9A-HJKMNP-TV-Z]{26}$` validation the FRD already specifies for correlation IDs. |
| Logging | `pino` | `9.5.x` | Structured JSON with declarative `redact` paths, which is how `FR-F08b-05` rule 4 ("logs never contain the assertion, cookie, one-time codes, or action payloads") is enforced at the logger rather than at each call site. |
| HTTP client (adapters only) | Node 22 built-in `fetch` | — | Native `AbortSignal.timeout()` implements the absolute deadline; no dependency; available only inside `packages/adapter-*`. |
| Circuit breaker | **hand-written**, `packages/adapter-runtime/circuit.ts` | ~140 lines | Rejected `opossum`: the required semantics are unusual — health probes must *bypass* the open circuit (`FR-F08a-05` rule 5), `performAction` timeouts must *never* auto-retry (rule 1), and every transition must write an `integration_issues` row (rule 6). Bending a general library into those shapes costs more code than writing the state machine. See ADR-007. |

---

### 2.5 Persistence

| Layer | Selection | Version | Rationale |
|---|---|---|---|
| Database | **PostgreSQL** | `17.2` (`postgres:17.2-alpine`) | Selected specifically because schema-level `GRANT`/`REVOKE` is the enforcement mechanism the FRD requires: seven schemas with seven roles and no cross-schema grants (`Y0a` isolation statement), plus `INSERT, SELECT` only on `hub.audit_events` (`FR-F13-03` rule 2). SQLite cannot express either, which would reduce both guarantees to convention — precisely what the mandate forbids. See ADR-004. |
| Driver | `pg` (node-postgres) | `8.13.x` | Mature, no ORM. Each service constructs its pool with **its own role's credentials**, so isolation is exercised on every query rather than asserted once. |
| Query style | **Hand-written SQL**, no ORM | — | The DDL in the FRD is normative, and the applicant-scoping predicate must be visibly injected into the SQL at the data layer (`FR-F02-04` rule 1). An ORM would hide exactly the thing a reviewer needs to see. See ADR-005. |
| Migrations | Numbered `.sql` files + `@ual/migrate` runner | ~80-line runner | Applied in filename order inside one transaction per file, tracked in `hub.schema_migrations`. No migration DSL to learn, no framework version to reconcile — the files *are* the schema in this document. |
| Session store | `hub.sessions` table | — | Server-side sessions with no client-held claims. An in-memory store would lose sessions on a hub restart mid-demo. |

---

### 2.6 Testing and Quality

| Layer | Selection | Version | Rationale |
|---|---|---|---|
| Unit / integration | **Vitest** | `2.1.8` | Native TypeScript and ESM, fast watch loop, compatible assertion API. Used with `fastify.inject()` so API tests exercise the full hook chain — including the PDP and the audit write — without binding a port. |
| E2E | **Playwright** | `1.49.x` | Drives the real browser against the real stack for the flagship workflow, the keyboard-only pass (`FR-F19-07`), and the degraded/registration scripts. Deterministic waiting removes the flake class that `FR-F19-10` rule 4 refuses to tolerate. |
| Accessibility | **`@axe-core/playwright`** | `4.10.x` | The CI gate: build fails on any serious or critical violation across every route × every role, including error, empty, degraded, loading, and open-modal states (`FR-F19-06`, `FR-F14-12`). |
| Adapter conformance | `@ual/conformance` (Vitest programmatic API) | — | The ten-item suite of `FR-F08a-08`, runnable standalone against an arbitrary adapter with one command — which is what makes onboarding a sixth application a bounded task. |
| Lint (code) | **ESLint** flat config | `9.17.x` | Plus two project rules that enforce architecture: `no-restricted-imports` (hub core may not import adapters or an HTTP client) and a custom rule failing on spoke name literals in hub core (`FR-F08b-02` rule 1). |
| Lint (styles) | **Stylelint** | `16.12.x` | Fails the build on any hex, `rgb()`, `hsl()`, named color, `font-family` literal, or raw `px`/`rem` outside the USWDS token scale — the mechanical form of `NFR-03` / `FR-F14-01` rule 3. |
| Formatting | Prettier | `3.4.x` | Zero-argument formatting; no style debates in review. |
| CI | GitHub Actions (or any runner) | — | Workflow is plain `npm` scripts, so it runs identically on a laptop. Nothing in the pipeline requires a hosted service. |

---

### 2.7 Container and Run Tooling

| Layer | Selection | Version | Rationale |
|---|---|---|---|
| Containers | Docker Engine | ≥ `24.0` | Pre-flight checks the version and reports what to install if it is absent (`FR-F18-01` error table). |
| Orchestration | **Docker Compose v2** (`compose.yaml`) | ≥ `2.24` | Nine services, one file, `depends_on: condition: service_completed_successfully` for the migrate/seed jobs. Kubernetes is rejected as demo-hostile (ADR-002). |
| Entry point | `./run.sh` | — | One script wrapping `up`, `down`, `reset`, `logs`, `stop <service>`, `start <service>`, `token`, `test`. Pre-flight runs first and reports actionable failures rather than exit codes. |
| Base images | `node:22.11-bookworm-slim`, `postgres:17.2-alpine` | pinned by digest | Digest pinning means the image an evaluator pulls is the image that was rehearsed against. |

---

### 2.8 What Was Deliberately Not Used

| Rejected | Why | ADR |
|---|---|---|
| Tailwind CSS | Its spacing/color scale competes with USWDS tokens and invites literal values, which the `NFR-03` lint rule forbids anyway. | ADR-008 |
| MUI / Chakra / Ant Design | Reimplements components USWDS provides; `FR-F14-01` rule 1 prohibits a second component library. | ADR-008 |
| Prisma / TypeORM / Drizzle | Obscures the scoping predicate and the grant model, both of which must be inspectable. | ADR-005 |
| Redux / Zustand / Jotai | Almost all state is server state or URL state; a global store would duplicate both. | ADR-006 |
| Kubernetes / Helm | Cannot be started reliably on an evaluator's laptop in under ten minutes. | ADR-002 |
| Auth0 / Okta / Keycloak | External dependency, and the requirement is a *simulated* multi-IdP selector, not real federation. | ADR-009 |
| Kafka / RabbitMQ / Redis | The retry queue is a database table with a `next_attempt_at` column; a broker adds a container and a failure mode for no behavioral gain. | ADR-010 |
| SQLite / in-memory store | Cannot express per-schema grants or an INSERT-only audit table — isolation would become convention. | ADR-004 |
| `opossum` circuit breaker | Cannot express "health bypasses the open circuit" or "never retry a mutating timeout" without fighting it. | ADR-007 |
| GraphQL | The BFF is screen-shaped by design; a flexible query surface would move authorization decisions into resolvers and dilute the single choke point. | ADR-003 |

---

### 2.9 Next.js Configuration Constraints (mandatory, verified at boot)

These four rules are specific, load-bearing, and each has a known failure mode that produces a blank screen or an unreachable app — the two outcomes `NFR-09` and `FR-F18-01` exist to prevent.

**1. `next.config.ts` requires Next ≥ 15.** We pin `next@15.1.3`, so a TypeScript config file is valid. If the project is ever downgraded to Next 14, the config **must** be renamed to `next.config.mjs` — Next 14 does not load a TypeScript config and will silently run with defaults, which loses the `output: 'standalone'` build and the rewrite to the hub.

**2. Bind `0.0.0.0` on a deterministic port 3000.** The dev script is `next dev --hostname 0.0.0.0 --port 3000` and the production entry is `HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/server.js`. Binding to `localhost` inside a container makes the UI unreachable from the host and from the preview harness.

**3. Never emit a frame-blocking header.** The application is presented inside an embedded preview iframe. `X-Frame-Options: DENY`/`SAMEORIGIN` or CSP `frame-ancestors 'none'`/`'self'` renders the preview blank, which is indistinguishable from a broken build. The hub and the UI therefore emit **no** `X-Frame-Options` header and a CSP with **no** `frame-ancestors` directive. This deliberately supersedes `FR-F10-01` step 2; see **ADR-012**.

**4. No experimental or canary flags.** `reactStrictMode: true`, `output: 'standalone'`, nothing from `experimental` except what is required to compile. Canary features are a C4 violation.

```ts
// apps/web/next.config.ts   (valid only because next >= 15 — see rule 1)
import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',            // small runtime image; deterministic start
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy',        value: 'same-origin' },
        // Intentionally absent: X-Frame-Options and CSP frame-ancestors.
        // See ADR-012. A frame block renders the preview iframe blank.
        { key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "img-src 'self' data:",
            "font-src 'self'",
            "style-src 'self' 'unsafe-inline'",   // USWDS init writes inline styles
            "script-src 'self'",
            "connect-src 'self'",
          ].join('; ') },
      ],
    }];
  },
  async rewrites() {
    // Same-origin API so the session cookie needs no CORS and no SameSite relaxation.
    return [{ source: '/api/:path*', destination: `${process.env.UAL_HUB_INTERNAL_URL}/api/:path*` }];
  },
};
export default config;
```

A boot-time assertion in `apps/web/instrumentation.ts` fails fast if `process.env.HOSTNAME !== '0.0.0.0'` or if the configured port is not 3000, so a misconfiguration surfaces as a clear startup error rather than as an app nobody can reach.

---

### 2.10 Version Pinning Policy

1. Every dependency is pinned to an **exact** version in `package.json` (no `^`, no `~`). `package-lock.json` is committed.
2. Base images are pinned by tag **and** digest in `compose.yaml`.
3. `npm ci` — never `npm install` — in CI and in the Docker build, so the lockfile is authoritative.
4. No alpha, beta, canary, RC, or `next` dist-tag anywhere in the tree. A pre-release dependency in a demo is an unforced error.
5. The stack is re-verified on a clean machine before the demo, and the verification date is recorded in the README (`FR-F18-04` rules).

---
