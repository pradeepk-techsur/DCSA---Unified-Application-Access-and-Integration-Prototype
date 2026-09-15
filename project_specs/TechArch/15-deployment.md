## 15. Deployment and Run Architecture

A prototype nobody can start is a prototype that scored zero. Deliverability is a scored criterion here, not a convenience, so the run architecture gets the same design attention as the adapter seam.

---

### 15.1 The Single Command

```bash
git clone <repo> && cd dcsa-ual
./run.sh up
```

That is the whole instruction. It brings up, from a clean checkout on a clean machine: PostgreSQL with seven schemas and seven roles, the hub API, the web UI, all five spoke services, the CVS sixth service (running and **unregistered**), and the validated seed corpus.

```bash
$ ./run.sh up

Pre-flight
  ✓ Docker 27.3.1 (>= 24.0 required)
  ✓ Docker Compose v2.29.7 (>= 2.24 required)
  ✓ Ports 3000, 7100-7106, 7199 available
  ✓ 6.2 GB memory available (4 GB recommended)
  ✓ 12.4 GB disk available

Building  ........................................ 2m14s
Starting
  ✓ ual-db        healthy
  ✓ ual-migrate   completed (23 migrations, 7 schemas, 7 roles)
  ✓ ual-seed      completed (seed DCSA-UAL-2026-09-14; validation PASSED)
  ✓ ual-eapp :7101   ual-pvq :7102   ual-iep :7103
  ✓ ual-pdt  :7104   ual-im  :7105   ual-cvs :7106  (unregistered — by design)
  ✓ ual-hub  :7100   healthy   5 applications registered, all HEALTHY
  ✓ ual-web  :3000   healthy

────────────────────────────────────────────────────────────────────────
  Open  →  http://localhost:3000

  Sign in as:
    Investigator    Marcus Vale           CAC/PIV  → select his certificate
    Adjudicator     Dana Okonkwo          CAC/PIV
    Applicant       Theodore Q. Lansbury  Generic MFA  user: tlansbury  code: 482913
    Administrator   Priya Raghunathan     CAC/PIV

  Flagship demo (3 min)   docs/DEMO-SCRIPTS.md §1
  Reset baseline          ./run.sh reset          (< 30s, safe mid-demo)
  Stop one spoke          ./run.sh stop im        (drives the degraded demo)
  Shut down               ./run.sh down
────────────────────────────────────────────────────────────────────────
Total elapsed: 3m41s
```

**Properties of the command:**

1. **Idempotent.** Running it on an already-running environment reports current state rather than erroring or duplicating.
2. **Ordered startup:** database → migrations → seed → spokes → hub → UI, via `depends_on: condition: service_completed_successfully` for the two job containers.
3. **The hub does not wait on spoke health.** A spoke that fails to start registers `DOWN`, and the product enters exactly the degraded mode it was designed for. A demo that refuses to start because one of six services is unhappy has the failure mode backwards.
4. **Under 10 minutes on a clean machine** including image pulls.
5. **Every port comes from `.env`**, so a clash is resolved without editing code.
6. **Pre-flight fails with instructions, never a bare exit code.**

| Failure | Message |
|---|---|
| Port in use | "Port 3000 is already in use by another process. Stop it, or change `UAL_WEB_PORT` in .env and try again." |
| Missing prerequisite | "Docker Compose v2.24 or later is required. Found: v2.11.2. Install it and try again." |
| Low memory | "This environment has 2.1 GB of memory available. At least 4 GB is recommended." |
| Spoke failed to start | "ual-im didn't start. The application will run with Investigation Management unavailable — you'll see a degraded warning. Check logs with `./run.sh logs im`." |

---

### 15.2 `compose.yaml`

```yaml
name: dcsa-ual

x-node: &node
  build: { context: ., dockerfile: Dockerfile, target: runtime }
  restart: unless-stopped
  environment: &env
    NODE_ENV: production
    UAL_SEED_CONSTANT:       ${UAL_SEED_CONSTANT}
    UAL_SEED_REFERENCE_DATE: ${UAL_SEED_REFERENCE_DATE}
    UAL_ASSERTION_KEY_SEED:  ${UAL_ASSERTION_KEY_SEED}

x-spoke: &spoke
  <<: *node
  depends_on: { ual-seed: { condition: service_completed_successfully } }
  healthcheck:
    test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
    interval: 10s
    timeout: 3s
    retries: 5
    start_period: 10s

services:
  ual-db:
    image: postgres:17.2-alpine@sha256:<pinned-digest>
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports: ["${UAL_DB_PORT}:5432"]      # published so a reviewer can inspect grants in psql
    volumes: ["ual-pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      retries: 20

  ual-migrate:
    <<: *node
    command: ["node", "packages/migrate/dist/cli.js", "up"]
    restart: "no"                       # a job, not a service
    depends_on: { ual-db: { condition: service_healthy } }

  ual-seed:
    <<: *node
    command: ["node", "packages/seed/dist/cli.js", "--validate"]
    restart: "no"
    depends_on: { ual-migrate: { condition: service_completed_successfully } }

  ual-eapp: { <<: *spoke, command: ["node","services/eapp/dist/server.js"],
              environment: { <<: *env, PORT: "7101", PGSCHEMA: eapp, PGUSER: eapp_service },
              ports: ["${UAL_EAPP_PORT}:7101"] }
  ual-pvq:  { <<: *spoke, command: ["node","services/pvq/dist/server.js"],
              environment: { <<: *env, PORT: "7102", PGSCHEMA: pvq,  PGUSER: pvq_service },
              ports: ["${UAL_PVQ_PORT}:7102"] }
  ual-iep:  { <<: *spoke, command: ["node","services/iep/dist/server.js"],
              environment: { <<: *env, PORT: "7103", PGSCHEMA: iep,  PGUSER: iep_service },
              ports: ["${UAL_IEP_PORT}:7103"] }
  ual-pdt:  { <<: *spoke, command: ["node","services/pdt/dist/server.js"],
              environment: { <<: *env, PORT: "7104", PGSCHEMA: pdt,  PGUSER: pdt_service },
              ports: ["${UAL_PDT_PORT}:7104"] }
  ual-im:   { <<: *spoke, command: ["node","services/im/dist/server.js"],
              environment: { <<: *env, PORT: "7105", PGSCHEMA: im,   PGUSER: im_service },
              ports: ["${UAL_IM_PORT}:7105"] }
  ual-cvs:  { <<: *spoke, command: ["node","services/cvs/dist/server.js"],
              environment: { <<: *env, PORT: "7106", PGSCHEMA: cvs,  PGUSER: cvs_service },
              ports: ["${UAL_CVS_PORT}:7106"] }

  ual-hub:
    <<: *node
    command: ["node", "apps/hub/dist/server.js"]
    # Depends ONLY on the seed job. A down spoke must NOT block hub startup —
    # it starts DOWN, which is precisely the degraded state the product handles.
    depends_on: { ual-seed: { condition: service_completed_successfully } }
    environment:
      <<: *env
      PORT: "7100"
      HOST: "0.0.0.0"
      PGUSER: hub_service
    ports: ["${UAL_HUB_PORT}:7100"]
    healthcheck:
      test: ["CMD","node","-e","fetch('http://127.0.0.1:7100/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 10s
      retries: 6
      start_period: 15s

  ual-web:
    <<: *node
    command: ["node", "apps/web/.next/standalone/server.js"]
    depends_on: { ual-hub: { condition: service_healthy } }
    environment:
      <<: *env
      PORT: "3000"
      HOSTNAME: "0.0.0.0"               # MANDATORY: localhost binding is unreachable
      UAL_HUB_INTERNAL_URL: "http://ual-hub:7100"
    ports: ["${UAL_WEB_PORT}:3000"]
    healthcheck:
      test: ["CMD","node","-e","fetch('http://127.0.0.1:3000/api/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 10s
      retries: 6

volumes: { ual-pgdata: {} }
```

Note that **spoke ports are published to the host**. That is deliberate: direct spoke reads are how the demo proves the dual-system write. Publishing the port does not publish the data — a signed principal assertion or an operator token is still required.

---

### 15.3 `run.sh` Surface

| Command | Behavior |
|---|---|
| `./run.sh up` | Pre-flight, build, start, print the demo card |
| `./run.sh down` | Graceful stop of all containers; ports released; reports what stopped |
| `./run.sh down --purge` | Also removes the data volume, returning the machine to pre-run state |
| `./run.sh reset` | Re-seed, de-register CVS, clear injection, clear sessions — under 30 s, safe mid-demo |
| `./run.sh stop <service>` | Stop one service; a **genuine** outage at the network level |
| `./run.sh start <service>` | Restart it; the hub recovers automatically with no restart and no re-authentication |
| `./run.sh logs [service]` | Follow logs, all or one |
| `./run.sh status` | Per-service running state, health, port, injection state, row counts |
| `./run.sh token --audience=PVQ` | Mint a short-lived operator token for direct spoke reads |
| `./run.sh test [suite]` | Run a suite: `flagship`, `rbac`, `a11y`, `isolation`, `conformance`, `all` |
| `./run.sh conformance --adapter=X --endpoint=Y` | Run the adapter conformance suite standalone |

Graceful shutdown completes or cancels in-flight requests within 10 seconds and leaves no orphaned process holding a port; a subsequent `up` succeeds without manual cleanup.

---

### 15.4 Health Endpoints

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /healthz` (hub) | None | Liveness: process up, database reachable. Compose healthcheck target |
| `GET /readyz` (hub) | None | Readiness: migrations applied, seed validated, registry loaded |
| `GET /api/healthz` (web) | None | UI liveness |
| `GET /health` (each spoke) | **None** | `{status, latencyMs, version, checkedAt}` — deliberately unauthenticated so a spoke with a broken auth path is still probeable |
| `GET /api/health/summary` | Session | Per-application status for all users; technical detail withheld from non-administrators |
| `GET /api/admin/health` | `ADMIN.HEALTH.READ` | Latency percentiles, circuit state, consecutive failures, next probe, injection state |
| `GET /api/admin/status` | `ADMIN.HEALTH.READ` | **Demo readiness**: every service, seed validation, CVS registration state, active injection |

---

### 15.5 Demo Readiness (SCR-37)

The single check an operator runs at 9:58 before a 10:00 demo, answering the question that actually matters: *is this environment ready?*

```
Demo readiness                                                    ● READY

  Services         9 of 9 running
  Seed validation  PASSED — 0 failures, 0 warnings
  CVS              Unregistered ✓ (the registration demo is ready)
  Failure injection  None active ✓

  Service          Running  Health    Latency  Port   Injection  Rows
  ──────────────────────────────────────────────────────────────────────
  Hub API          ✓        Healthy    —       7100   —          —
  Web UI           ✓        Healthy    —       3000   —          —
  eApp             ✓        Healthy    23 ms   7101   Normal     412
  PVQ              ✓        Healthy    19 ms   7102   Normal     178
  IEP              ✓        Healthy    21 ms   7103   Normal     319
  PDT              ✓        Healthy    18 ms   7104   Normal     286
  IM               ✓        Healthy    27 ms   7105   Normal     494
  CVS              ✓        Healthy    16 ms   7106   Normal      36   (unregistered)

  [Run reset]  [Clear all failure injection]  [Re-run seed validation]  [Issue operator token]
```

Amber and red conditions carry actionable copy:

| Condition | State | Message |
|---|---|---|
| A service is down | Red | "Investigation Management isn't running. Start it with `./run.sh start im` before demonstrating." |
| Seed validation failed | Red | "Seed validation failed: PVQ issue ISS-2207 is not in OPEN state. Run reset before demonstrating." |
| CVS already registered | Amber | "CVS is already registered. Run reset to restore the registration demo." |
| Injection active | Amber | "Investigation Management is in a simulated UNAVAILABLE state. Clear it before demonstrating unless this is intentional." |

---

### 15.6 How an Evaluator Drives the Demo

Five scripted paths, each in `docs/DEMO-SCRIPTS.md` with numbered steps and the **expected observable state** at each step. Script 1 matches the automated E2E test's path exactly, so a passing test means a working demo.

**Script 1 — The flagship workflow (3 minutes).** `reset` → sign in as Marcus via CAC/PIV → dashboard shows the new-PVQ-issue alert → work queue, 28–34 items across four systems → open eApp Case A-1042, "1 outstanding issue" → related-items panel shows the PVQ issue labelled *"Issue raised against Section 13A — Employment history"*, plus PDT and IM relationships → open the issue **inside the same shell**, breadcrumb carries case context, **no login prompt** → review the quoted answer → resolve as Substantiated with a narrative → SCR-20 shows both systems' **independently re-read** states → return to the case: "No outstanding issues" → **curl PVQ and eApp directly** → open the audit chain: one correlated narrative of ≥5 records → confirm `authEventCount == 1` and that no identifier was typed at any step.

**Script 2 — RBAC enforcement.** Open the same item as Marcus (Investigator) and Dana (Adjudicator); observe different action lists. As Theodore (Applicant), `curl` an Investigator-only endpoint directly and observe the **server-side** denial. Show the denial in the audit viewer with its `policyRuleId`. Repeat with Ingrid (cross-org) and Harlan (T3 vs T5 clearance).

**Script 3 — Degraded behavior.** Force IM `UNAVAILABLE` from SCR-38 (or `./run.sh stop im` for the more convincing version). Observe the queue rendering the other four sources with a named, quantified warning; the dashboard notice; the disabled action with its reason. Clear injection and observe automatic recovery — **no reload, no re-authentication**.

**Script 4 — The sixth application.** As Priya, register CVS through SCR-28 including the live connection test. In a second browser, as an already-signed-in Marcus, watch CVS items appear in the unified queue within one 30-second poll — **zero code changes, zero restarts**.

**Script 5 — Audit chain review.** Filter by correlation ID, open the chain view, export the filtered view, show the integrity indicator.

Each script names its starting persona and its reset precondition. Script 1 documents a fallback item in case the primary was consumed in a prior run.

---

### 15.7 Troubleshooting

Documented in the README, not only in a separate file, because a document nobody opens under pressure is not a document.

| Symptom | Cause | Fix |
|---|---|---|
| Pre-flight fails naming a port | Another process holds it | Stop it, or change the port in `.env` and restart |
| Degraded warning naming a system; SCR-37 shows it red | That spoke didn't start | `./run.sh logs <svc>`, then `./run.sh start <svc>`. The rest of the demo continues meanwhile — **and the degraded state is itself demonstrable, which is worth saying out loud** |
| SCR-16 says "already resolved" | Seed state consumed in a prior run | `./run.sh reset` (< 30 s), or use the documented fallback issue |
| Stale session after a reset | Reset terminates all sessions | Sign out and back in |
| CVS already registered | A prior run registered it | `./run.sh reset`, or de-register from SCR-23 |
| UI unreachable from the host | Server bound to `localhost` instead of `0.0.0.0` | Confirm `HOSTNAME=0.0.0.0`; the boot assertion should have caught this |
| Preview iframe renders blank | A frame-blocking header was reintroduced | Confirm no `X-Frame-Options` and no CSP `frame-ancestors` — see ADR-012 |

---

### 15.8 Production Deltas (Documented, Not Implemented)

Stated explicitly because claiming a protection this build does not implement would be worse than not implementing it.

| Concern | Demo | Production would require |
|---|---|---|
| Transport | Plain HTTP on a private Compose network | TLS everywhere, HSTS, `Secure` cookies enforced |
| Frame headers | **Omitted** so the preview iframe works (ADR-012) | `frame-ancestors 'self'` restored |
| Secrets | `.env`, committed, all values labelled `demo-only-` | A secrets manager; no committed values |
| Assertion key | Derived from a seed constant | A managed keypair with rotation |
| Database | One instance, seven schemas, seven roles | Same isolation model; managed instance, encryption at rest, backups |
| Identity | Three simulated IdPs | Real CAC/PIV, ECA, and MFA integrations behind the same session-issuance seam |
| Scale | Single hub instance | Horizontal scaling — the retry worker already uses `FOR UPDATE SKIP LOCKED` for this |
| Observability | `pino` to stdout | Centralized logging, metrics, tracing on the existing correlation ID |
| ATO | Out of scope | Full security authorization package |

The identity row is the important one. Because the simulation is confined to a single boundary — which row of `hub.users` a session belongs to — replacing it changes the code behind `/api/auth/*` and nothing else. Session handling, principal propagation, authorization, and audit are all real mechanisms already.

---
