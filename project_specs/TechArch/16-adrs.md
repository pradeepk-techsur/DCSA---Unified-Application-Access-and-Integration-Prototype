## 16. Architecture Decision Records

Each record states the context, the decision, the alternatives that were genuinely considered, and the consequences — including the bad ones. A record listing only benefits is marketing, not a decision record.

---

### ADR-001 — Hub-and-Spoke with a Common Adapter Interface

**Status:** Accepted · **Drives:** the entire build

**Context.** The Innovation Call names the target architecture: transition from siloed legacy capabilities to an integrated platform of modular components supporting phased integration and modernization **without disrupting the user experience**. A monolithic replacement is off the table. The prototype must prove two things: genuinely continuous cross-application work, and that a sixth application can be onboarded as configuration.

**Decision.** Hub-and-spoke. The hub owns identity, session, navigation, aggregation, orchestration, authorization, and audit. Five (plus one demo) spokes run as separate processes with separate data namespaces, reachable **only** through a per-spoke adapter implementing one common eight-operation interface. The adapter seam is treated as the primary deliverable, not an implementation detail.

**Alternatives considered.**
- *Shared database with a unified UI.* Far simpler and far faster to build. Rejected because it would invalidate the entire argument — a reviewer who suspects a shared schema has no reason to believe the integration story, and the FRD's isolation checklist exists precisely to foreclose this.
- *API gateway with per-system pass-through.* No normalization layer, so the unified queue could not exist and the hub could not compute a cross-system action list.
- *Event-driven with a shared bus.* Cross-system consistency becomes eventual and invisible; the flagship workflow's dual-system confirmation would be unimplementable.

**Consequences.**
- (+) The integration boundary is real and demonstrable: separate ports, separate credentials, separate processes.
- (+) Onboarding is bounded — one adapter plus one registry row.
- (+) Spokes remain independently replaceable, which is the modernization story.
- (−) Every cross-system read is N HTTP calls instead of one join. Slower, and deliberately so.
- (−) The hub must implement normalization, partial-failure aggregation, and saga orchestration that a shared database would make unnecessary.
- (−) No distributed transaction is available, which is why ADR-011 exists.

---

### ADR-002 — Docker Compose, Not Kubernetes

**Status:** Accepted

**Context.** "Must build, run, and be demoed from a single documented command sequence" is a scored deliverability constraint. The target machine is an evaluator's laptop.

**Decision.** Docker Compose v2, nine containers, one `compose.yaml`, wrapped by `./run.sh`.

**Alternatives.** *Kubernetes/kind/k3d* — closer to a production target but adds a cluster, manifests, and a class of startup failure that is hard to diagnose under time pressure. *Bare `npm` scripts with `concurrently`* — kept as a documented fallback, but cannot provide Postgres or deterministic port isolation. *A single monolithic process* — would destroy the separation the demonstration depends on.

**Consequences.**
- (+) One command; under ten minutes on a clean machine.
- (+) Per-service stop/start makes "what happens when IM is down" a real experiment.
- (−) Not a production deployment artifact; a production path would need manifests.
- (−) Requires Docker installed, checked by pre-flight with an actionable message.

---

### ADR-003 — Fastify over Express for the Hub

**Status:** Accepted

**Context.** Two guarantees must be structural rather than conventional: every endpoint invokes the PDP, and every mutating endpoint writes audit before responding. A third requirement is that OpenAPI documentation be **generated from the implementation**, not hand-maintained.

**Decision.** Fastify 5 with root-scoped hooks implementing the eleven-step pipeline, TypeBox route schemas, and `@fastify/swagger` for generated OpenAPI.

**Alternatives.**
- *Express 5.* Ubiquitous and familiar. Rejected on three counts: middleware ordering is positional and easy to subvert per-route; there is no native schema-to-OpenAPI path, so documentation would drift; and nothing prevents a router from being mounted without the authorization middleware.
- *NestJS.* Guards and interceptors express this well, but the decorator/DI weight is disproportionate for roughly 40 endpoints and slows onboarding for planners reading the code.
- *Hono / Elysia.* Lighter and pleasant, but younger ecosystems — a constraint-C4 violation.

**Consequences.**
- (+) Plugin encapsulation means a child route **cannot** remove a parent hook; the PDP and audit interceptor are unbypassable by construction.
- (+) One TypeBox declaration yields TS types, the ajv validator, and the OpenAPI schema.
- (+) A route missing `config.action` or a schema fails the boot check and the process exits.
- (−) Smaller middleware ecosystem than Express; a few small pieces are written in-house.
- (−) Fastify's hook model is less familiar to some engineers than Express middleware.

---

### ADR-004 — PostgreSQL with Schema-per-Service and Role-per-Service

**Status:** Accepted

**Context.** Two isolation guarantees must be enforced by a mechanism, not a convention: no spoke may read another spoke's data, and no code path may modify an audit record.

**Decision.** One PostgreSQL 17 instance, seven schemas, seven roles, each service connecting with only its own credential. `hub_service` holds `INSERT, SELECT` on `hub.audit_events` and nothing else.

**Alternatives.**
- *SQLite per service.* Lighter and file-based. Rejected decisively: SQLite cannot express per-schema grants or an INSERT-only table, so **both** guarantees would degrade to "we didn't write that code," which is exactly the class of claim the mandate forbids.
- *Seven separate Postgres containers.* More theatrical but no more true — the enforcement is the grant, not the container. Costs five containers and ~400 MB against the deliverability constraint.
- *One schema with a `tenant_id` column.* A shared schema by another name. Disqualifying.

**Consequences.**
- (+) `SET ROLE pvq_service; SELECT * FROM eapp.cases;` fails with `permission denied` — a one-line live demonstration of isolation.
- (+) `UPDATE hub.audit_events` raises `42501` regardless of what the application code says.
- (+) Seeding uses the seven credentials, so a wrong grant fails before any demo runs.
- (−) Requires a Postgres container; heavier than a file database.
- (−) Seven credentials to manage; generated deterministically from `.env` for the demo.

---

### ADR-005 — Hand-Written SQL, No ORM

**Status:** Accepted

**Context.** The FRD's DDL is normative, and the applicant-scoping predicate must be **visibly** injected at the data layer rather than applied to a fetched list.

**Decision.** `pg` with hand-written SQL. Migrations are numbered `.sql` files applied by a small runner.

**Alternatives.** *Prisma* — excellent DX, but its generated client obscures the exact `WHERE` clause a reviewer needs to see, and its migration engine would own the schema this document specifies. *Drizzle* — closer to SQL, but still a layer between the reviewer and the predicate. *TypeORM* — heavier, and its entity model fights schema-per-service.

**Consequences.**
- (+) The scoping predicate is readable in the query, which is what makes the data-layer claim inspectable.
- (+) The DDL in chunks 03 and 04 **is** the migration content; no translation step, no drift.
- (−) No compile-time checking of column names; mitigated by integration tests against a real database.
- (−) More boilerplate for simple CRUD.

---

### ADR-006 — TanStack Query + URL State, No Global Store

**Status:** Accepted

**Context.** Almost all state in this application is server state. The queue must restore filters, sort, and page on return. Widgets need independent loading and error states. Two endpoints need polling.

**Decision.** TanStack Query v5 for server state; URL search params for queue and audit view state; React Context for session and entitlements; `useState` for ephemeral UI.

**Alternatives.** *Redux Toolkit* — would duplicate server state into a client store and require hand-written cache invalidation. *Zustand/Jotai* — lighter, but the duplication problem is identical. *Server Components only* — cannot express per-widget polling or optimistic-free mutation feedback.

**Consequences.**
- (+) "Return to queue with context intact" is a property of the address bar; links are shareable and the back button behaves.
- (+) Per-widget loading and error states come from the library rather than from hand-rolled flags.
- (+) Registry-version and health polling are three lines each.
- (−) Two state locations (URL and query cache) to reason about.
- (−) Deep-linked filter state must round-trip through server-side validation, which is more work than a client store — and also more correct.

---

### ADR-007 — Hand-Written Circuit Breaker

**Status:** Accepted

**Context.** Three required behaviors are unusual: health probes must **bypass** the open circuit so recovery stays detectable; `performAction` timeouts must **never** auto-retry; every transition must write an integration issue with the configured per-application thresholds.

**Decision.** ~140 lines in `packages/adapter-runtime/circuit.ts`, state persisted in `hub.application_health`.

**Alternatives.** *opossum* — the standard choice, but expressing "this one call type ignores the breaker" and "this operation class is never retried on timeout" requires wrapping and bypassing it enough that the library stops carrying its weight. *cockatiel* — similar policy-composition mismatch. *No breaker* — a hung spoke would stall the aggregate queue, which the partial-failure requirement forbids.

**Consequences.**
- (+) Exactly the required semantics, including the health-probe bypass that makes automatic recovery work.
- (+) State is persisted and therefore inspectable by an administrator and assertable by a test.
- (−) ~140 lines to own and test. Fully covered by the conformance suite.

---

### ADR-008 — USWDS v3 Wholesale, Token-Only Theming, No Second Component Library

**Status:** Accepted · **Assumption flagged for revisit**

**Context.** Section 508 / WCAG 2.1 AA is a hard gate. The DCSA Ecosystem Style Guide (Attachment 1) **was not supplied**.

**Decision.** USWDS v3.11 adopted wholesale. All visual values are design tokens; DCSA theming is expressed **only** as token overrides in `packages/theme/_uswds-theme.scss`. A Stylelint rule fails the build on any hex, `rgb()`, `hsl()`, named colour, font-family literal, or raw spacing outside the token scale.

**Alternatives.** *Tailwind* — its scale competes with USWDS tokens and invites literals the lint rule forbids. *MUI/Chakra/Ant* — reimplements components USWDS provides, and a second component library is explicitly prohibited. *Bespoke components* — would require re-deriving accessibility that USWDS already solved and tested.

**Consequences.**
- (+) Accessibility primitives are inherited rather than re-litigated.
- (+) Adopting the real style guide is a token edit plus an asset swap — **not** a component rewrite. That containment is the entire reason for the token rule.
- (+) The federal audience recognizes the design language immediately.
- (−) USWDS components are opinionated; some layouts must be composed rather than configured.
- (−) Sass toolchain required alongside the JS build.
- (!) **Revisit the moment Attachment 1 is available.** Divergence is recorded as a change to F14.

---

### ADR-009 — Simulated Identity Providers, Confined to One Boundary

**Status:** Accepted

**Context.** Real CAC/PIV, ECA, and PKI are impossible outside the government environment. The evaluable behavior is SSO continuity across applications, not certificate mathematics.

**Decision.** Three simulated IdPs with genuinely separate identity pools and separate issuer namespaces. The simulation is confined to exactly one boundary: which row of `hub.users` a session belongs to. Everything downstream — session issuance, principal propagation, authorization, audit — is a real mechanism.

**Alternatives.** *Keycloak/Auth0* — an external dependency violating the offline constraint, and real federation is not what is being demonstrated. *One IdP with three buttons* — would fail the multi-IdP requirement; the pools are partially disjoint (Ingrid is ECA-only) so the distinction is observable.

**Consequences.**
- (+) Multi-IdP support is demonstrable without PKI.
- (+) Replacing the simulation changes the code behind `/api/auth/*` and nothing else.
- (+) No network dependency at sign-in.
- (−) Nothing about certificate validation is demonstrated, which the UI states plainly.
- (!) Every authentication screen is labelled simulated, and the verbs "verified", "validated", "authenticated against", and "trusted certificate" are prohibited and scanned for.

---

### ADR-010 — The Retry Queue Is a Database Table

**Status:** Accepted

**Context.** Partial orchestration completions need durable, scheduled, bounded retry with an audit record per attempt.

**Decision.** `hub.orchestration_retry_queue` with `next_attempt_at`, drained by an in-process worker on a 5-second tick using `FOR UPDATE SKIP LOCKED`.

**Alternatives.** *BullMQ + Redis* — adds a container and a failure mode for four retries on a 5/15/45/135-second schedule. *Kafka* — wildly disproportionate. *In-memory timers* — lost on restart, which defeats the durability that is the entire point of a reconciliation record.

**Consequences.**
- (+) No additional container, no additional failure mode.
- (+) Retry state is visible in the same database as the transaction it belongs to, and inspectable by an administrator.
- (+) `SKIP LOCKED` keeps it correct if the hub is ever scaled out.
- (−) Polling rather than push; a 5-second worst-case latency, which is immaterial against a 5-second first backoff.

---

### ADR-011 — Forward-Recovery Saga, Not Compensating Rollback

**Status:** Accepted · **Highest-stakes decision in the document**

**Context.** The flagship action mutates PVQ and eApp — two independent systems with no shared transaction. The second write can fail.

**Decision.** PVQ (system of record for the disposition) commits first. If eApp fails, **leg 1 is not rolled back**. The transaction is marked `PARTIALLY_COMPLETED`, the eApp leg is retried automatically on 5/15/45/135 seconds using the same idempotency key, the user is told immediately and precisely, and exhausted retries escalate to an administrator.

**Alternatives.**
- *Compensating rollback.* Reversing a recorded investigative disposition would fabricate a false history in the system of record, require an audited mutation nobody authorized, and destroy the *correct* record to match the *stale* one.
- *Two-phase commit.* Unavailable across independent HTTP services and would couple the spokes — defeating ADR-001.
- *Best-effort with eventual consistency, no user disclosure.* Reporting success for a half-applied action is the one outcome the audit trail exists to prevent.

**Consequences.**
- (+) The system of record keeps the correct record.
- (+) Convergence is automatic in the common case (a transient outage) with no user action.
- (+) The user is told the truth, with per-system detail and a retry path.
- (−) A window exists in which eApp shows "1 outstanding issue" while PVQ shows resolved. **The UI states this explicitly rather than hiding it** — an advisory on the case says a resolution was recorded in PVQ and is being retried.
- (−) Requires idempotency at both the hub and the spoke; eApp's `CLEAR_OUTSTANDING_ISSUE` is specified idempotent on `issueRef` precisely for this.
- (−) The 207 response and partial-state UI are more work than pretending the problem does not exist.

---

### ADR-012 — No Frame-Blocking Headers (deliberate FRD deviation)

**Status:** Accepted · **Supersedes `FR-F10-01` step 2** · **Demo-environment constraint**

**Context.** `FR-F10-01` step 2 specifies `X-Frame-Options: DENY`. The prototype is presented through an **embedded preview iframe**. A frame-blocking header causes the preview to render **blank** — visually indistinguishable from a crashed build, and precisely the failure mode `NFR-09` ("never a blank page") exists to prevent. A demo nobody can see scores the same as a demo that does not run.

**Decision.** Neither the hub nor the UI emits `X-Frame-Options`. The CSP contains **no** `frame-ancestors` directive. All other security headers are emitted: `Content-Security-Policy` with `default-src 'self'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`, `Cache-Control: no-store` on authenticated responses.

**Alternatives.**
- *`frame-ancestors 'self'`.* Still blocks a cross-origin preview harness. No benefit over omission in this environment.
- *Allow-list the preview origin.* Requires knowing the harness origin in advance; brittle, and it hard-codes an environment detail into the application.
- *Keep the header and demo outside the iframe.* Sacrifices the delivery channel the evaluation actually uses.

**Consequences.**
- (+) The application renders in the preview harness, which is the difference between being evaluated and not.
- (−) **Clickjacking is not mitigated by a frame header in this build.** Stated plainly rather than glossed.
- (−) A deliberate, recorded deviation from the FRD.
- Mitigating factors, which are why the residual risk is acceptable here: the environment contains only synthetic data; sessions are `SameSite=Lax`; every mutation requires a CSRF token; and there is no real system or real credential to attack.
- **Production delta:** restore `frame-ancestors 'self'` when the application is not presented through an embedding harness. A single line in one file, documented in chunk 15.

---

### ADR-013 — Web UI on Port 3000 (deliberate FRD deviation)

**Status:** Accepted · **Supersedes `Y1b`'s port 7000 for the web UI**

**Context.** `Y1b` assigns the UI port 7000. The preview harness expects a conventional development port, and the server must bind `0.0.0.0` on a deterministic port to be reachable from the host and the harness.

**Decision.** The web UI binds `0.0.0.0:3000`. Every other port in `Y1b` is adopted unchanged (hub 7100, spokes 7101–7106). All ports come from `.env`. A boot assertion fails fast if the bind host is not `0.0.0.0` or the port is not 3000.

**Alternatives.** *Keep 7000* — risks an unreachable preview. *Bind `localhost`* — unreachable from outside the container; a classic and silent failure.

**Consequences.**
- (+) Reachable from the host and the harness; conventional and predictable.
- (+) A misconfiguration surfaces as a clear startup error rather than an app nobody can open.
- (−) One documented deviation from `Y1b`, corrected in one environment variable if 7000 is ever required.
- (−) Port 3000 is commonly occupied; pre-flight detects the clash and names the variable to change.

---

### ADR-014 — Next.js 15 with the App Router

**Status:** Accepted

**Context.** The demo banner must be **in the initial document** with no client state path to hide it. Page titles must be unique and server-set. Error and not-found screens must render **inside** the shell with working exits.

**Decision.** Next.js 15.1 App Router with React 19. `next.config.ts` is valid **only because** the version is ≥ 15; on Next 14 it would be silently ignored and the config must be `next.config.mjs`.

**Alternatives.** *Vite + React SPA* — lighter, but the banner would be client-rendered and a JS failure would produce a blank document carrying no banner, violating two invariants at once. *Remix* — capable and a fine choice; Next was selected for USWDS/Sass integration maturity and familiarity. *Server-rendered templates from Fastify* — would make the queue's interaction model painful.

**Consequences.**
- (+) The banner, shell, and titles are server-rendered; correct on first paint.
- (+) `error.tsx` and `not-found.tsx` map directly onto SCR-32 and SCR-31 inside the shell.
- (+) The `/api/*` rewrite gives a same-origin API — no CORS, no `SameSite` relaxation.
- (−) Server/client component boundaries are a real source of mistakes; the component layer documents which is which.
- (−) Heavier build than a plain SPA.
- (!) **Version guard:** if Next is ever downgraded below 15, `next.config.ts` **must** be renamed to `next.config.mjs` or the standalone output and the API rewrite silently disappear.

---

### ADR-015 — TypeBox as the Single Source of Schema Truth

**Status:** Accepted

**Context.** Five artifacts must agree per endpoint: the TypeScript request type, the response type, the runtime validator, the OpenAPI schema, and the client-side form validator. Maintaining any two by hand guarantees drift, and `FR-F14-03` rule 9 requires client and server validation to be *the same rules*.

**Decision.** One TypeBox declaration per endpoint. Fastify compiles it with ajv; `@fastify/swagger` emits it as OpenAPI; the client imports the same object for `react-hook-form` resolution; TypeScript types are inferred from it.

**Alternatives.** *Zod* — better DX, but it is not JSON Schema, so an OpenAPI conversion step is required and the generated spec can drift from what ajv enforces. *JSON Schema by hand* — accurate but no inferred types. *Separate client and server validation* — the drift this decision exists to prevent.

**Consequences.**
- (+) Generated documentation cannot drift from the implementation.
- (+) Client validation cannot reject what the server would accept, or vice versa.
- (+) `additionalProperties: false` is uniform, so unknown fields are rejected everywhere.
- (−) TypeBox's ergonomics are more verbose than Zod's.
- (−) Complex conditional validation is awkward and lives in the handler where it belongs.

---

### ADR-016 — Structural Enforcement over Developer Discipline

**Status:** Accepted · **Meta-decision governing the others**

**Context.** This prototype makes several strong claims: every request is authorized, every mutation is audited, no spoke reads another's data, no application name is hard-coded, no colour is hard-coded, every button works. Each claim is easy to state and easy to erode by the third sprint.

**Decision.** Every such claim is enforced by a mechanism that **fails loudly**, never by a convention:

| Claim | Mechanism |
|---|---|
| Every request authorized | Root-scoped hook + boot check rejecting a route without `config.action` |
| Every mutation audited | `onSend` interceptor refusing a 2xx without a recorded audit intent |
| Audit is immutable | Database grant denying `UPDATE`/`DELETE` |
| No cross-spoke reads | Seven credentials + 42 failing probe assertions |
| No hard-coded app names | CI grep over hub core |
| No hard-coded colours | Stylelint rule failing the build |
| Every button works | Control-integrity crawl failing on a handler-less control |
| No unmapped status | Conformance suite failing registration |
| Scope always present | Wrapper raising `INTERNAL_ERROR` on absence |

**Alternatives.** *Code review and documentation.* Cheaper up front, and reliable for roughly one sprint. *Runtime warnings.* Warnings are ignored; a build that fails is not.

**Consequences.**
- (+) Claims stay true under change, which is what makes them worth making to an evaluator.
- (+) Each claim is demonstrable in seconds: run the check, show the failure when it is violated.
- (−) More build-time machinery and a slower CI run.
- (−) A legitimate exception requires an explicit, reviewed opt-out — deliberately inconvenient, because the friction is the feature.

---
