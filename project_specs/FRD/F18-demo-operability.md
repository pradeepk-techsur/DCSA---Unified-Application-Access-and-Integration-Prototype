## F18 — Demo Operability: Single-Command Run and Scripted Demonstration Path

**Traces to:** PRD F18 (P0 — deliverability constraint); NFR-18, SM-21, SM-22, R-08. **Screens:** SCR-37 demo operations / service status.

**Description:** The prototype must build, run, and be demonstrated from a single documented command sequence, with scripted paths that drive the flagship workflow reliably. A prototype nobody can start is a prototype that scored zero.

**Terminology:**
- **Pre-flight** — the environment check run before startup.
- **Demo script** — a numbered, deterministic click sequence with expected observable state at each step.
- **Operator** — the person running the demo, who may not be the person who built it.

---

### FR-F18-01 — Single startup command

**Processing / business rules:**
1. One documented command brings up, from a clean checkout on a clean machine: the hub API, the web UI, all five spoke services, the CVS sixth service (running, unregistered), all seven data namespaces, and the seeded data.
2. The command is idempotent: running it on an already-running environment reports current state rather than erroring or duplicating.
3. Startup is ordered: databases → namespace migrations → seed → spoke services → hub → UI, with the hub waiting for spoke health (bounded, 60 s) before declaring ready. A spoke that fails to start does **not** block hub startup — it starts `DOWN`, which is exactly the degraded state the product is designed to handle.
4. On completion the command prints: the UI URL, the hub API URL, every spoke's URL and port, the four demo persona sign-ins, the reset command, and the shutdown command.
5. Total time from command to signed-in-ready is under 10 minutes on a clean machine including image pulls (SM-21).
6. Ports are configurable via a single environment file so a port clash is resolvable without editing code.

**Error handling:**

| Scenario | Behavior | Operator message |
|---|---|---|
| Port in use | Pre-flight fails before starting | "Port {n} is already in use by another process. Stop it, or change {VAR} in .env and try again." |
| Missing prerequisite | Pre-flight fails | "{Tool} {version} or later is required. Found: {found}. Install it and try again." |
| Insufficient resources | Pre-flight warns | "This environment has {n} GB of memory available. At least {m} GB is recommended." |
| Spoke failed to start | Startup continues | "{Service} didn't start. The application will run with {Service} unavailable — you'll see a degraded warning. Check logs with {command}." |

**Acceptance criteria:**
- AC-1: A reviewer with no prior exposure reaches a signed-in dashboard in under 10 minutes following the README (SM-21, PRD F18 acceptance signal).
- AC-2: The command is verified on a clean machine before the demo (NFR-18).

---

### FR-F18-02 — Per-service control

**Processing / business rules:**
1. Each of the seven services (hub, UI, five spokes, CVS) is independently startable, stoppable, and restartable by documented command — because "what happens when IM is down" must be a real experiment, not a simulation of one.
2. Stopping a spoke produces genuine unavailability at the network level, distinct from failure injection (`FR-F16-11`), which simulates it inside a running service. Both paths are documented, and the demo script says which to use when: stopping the process is the more convincing demonstration; injection is the safer one mid-demo because it auto-clears.
3. Logs are viewable per service by documented command.
4. Restarting a spoke requires no hub restart and no user re-authentication (SM-17).

**Acceptance criteria:**
- AC-1: Stopping any single spoke leaves the hub and remaining services fully functional (PRD F9 acceptance signal).
- AC-2: Restarting it restores full function automatically.

---

### FR-F18-03 — Pre-flight checks, seeding, and reset

**Processing / business rules:**
1. Pre-flight verifies: required tool versions, port availability for all seven services, available disk and memory, and network access for image pulls. Each failure reports what is wrong and what to do — never a bare exit code.
2. The deterministic seed (`FR-F17-05`) is applied automatically on first startup, and seed validation (`FR-F17-10`) runs immediately after. Validation failure fails startup with a specific message.
3. The `reset` command (`FR-F17-11`) restores baseline in under 30 seconds and is runnable mid-demo without a restart.
4. Reset prints a confirmation listing what was restored, including "CVS de-registered" and "Failure injection cleared," so the operator knows the environment is demo-ready.

**Acceptance criteria:**
- AC-1: Pre-flight catches a port clash and a missing prerequisite with actionable messages.
- AC-2: Reset restores baseline in under 30 seconds and validation passes afterwards.

---

### FR-F18-04 — README

**Processing / business rules:** The README covers, in this order:
1. What this is, and the synthetic-data statement.
2. Prerequisites with versions.
3. The single start command.
4. The UI URL.
5. The four demo personas: name, role, sign-in method, and exactly what to click to sign in as each.
6. The flagship demo script pointer (`FR-F18-05`).
7. The reset command.
8. The shutdown command.
9. Troubleshooting for the three likeliest failures (`FR-F18-09`).
10. Per-service URLs and ports, for direct spoke queries (`FR-F09-08`).

**Rules:** the README is verified by a fresh-machine dry run before the demo, and the verification date is recorded in it. A README that has not been tested on a clean machine is an untested deliverable.

**Acceptance criteria:**
- AC-1: A reviewer following only the README reaches a signed-in dashboard (SM-21).
- AC-2: The dry-run date is present and recent.

---

### FR-F18-05 — Flagship demo script (F7)

**Description:** The numbered, deterministic path that drives the product's most important feature.

**Processing / business rules:** The script specifies, per step: the action, the exact control to activate, and the **expected observable state**.

| # | Action | Expected observable state |
|---|---|---|
| 0 | Run `reset` | "Baseline restored. CVS de-registered. Failure injection cleared." |
| 1 | Open the UI | SCR-01 with three methods and the demo banner |
| 2 | Sign in as Marcus Vale via CAC/PIV | SCR-02 lists synthetic certificates; selecting Marcus lands on SCR-09 |
| 3 | Observe the dashboard | "Newly raised PVQ issues" widget shows the ISS-2207 alert; assigned work shows ≥4 source systems |
| 4 | Open the work queue | SCR-13, 28–34 items, chips showing the default filter, items from eApp, PVQ, PDT, IM |
| 5 | Open eApp Case A-1042 | SCR-15; header shows "1 outstanding issue"; breadcrumb `Work Queue › eApp Case A-1042` |
| 6 | Observe the related items panel | PVQ issue ISS-2207 labelled "Issue raised against Section 13A — Employment history", plus PDT and IM relationships |
| 7 | Open the related PVQ issue | SCR-16 inside the same shell; breadcrumb adds `› Related PVQ Issue ISS-2207`; no login prompt; case context strip present |
| 8 | Review the quoted answer | Section 13A question, answer snapshot, and section label displayed |
| 9 | Resolve: disposition `SUBSTANTIATED`, narrative, confirm checkbox | Action panel shows "This updates PVQ and eApp" before submission |
| 10 | Submit | SCR-20: "Resolution complete"; per-system table shows PVQ `Resolved — Substantiated` and eApp `No outstanding issues`, each from a fresh read |
| 11 | Return to eApp Case A-1042 | SCR-15 shows "No outstanding issues"; case state `Review complete — pending adjudication` |
| 12 | Verify independently | `curl` the PVQ and eApp APIs directly (`FR-F09-08`); both show the updated state (SM-03) |
| 13 | Open the audit chain | SCR-34 shows one correlated chain of ≥5 records with the summary line naming both systems (SM-20) |
| 14 | Confirm continuity | Header shows one sign-in; `authEventCount == 1`; no identifier was typed at any step (SM-02, SM-04) |

**Rules:**
1. The script states the starting persona, the reset precondition, and a fallback item (the second seeded open issue, `FR-F17-03` rule 6) if the primary has been consumed.
2. It is completable by a reviewer in under 3 minutes (PRD F7 acceptance signal).
3. It is rehearsed as part of pre-demo verification and matches the automated E2E test's path exactly, so a passing test means a working demo.

**Acceptance criteria:**
- AC-1: A reviewer completes the script unaided in under 3 minutes.
- AC-2: Each step's expected state matches actual behavior on a freshly reset environment.

---

### FR-F18-06 — Secondary demo scripts

**Processing / business rules:** Four additional scripts, each with the same step/expected-state structure:

1. **RBAC enforcement.** Open the same item as Marcus (Investigator) and Dana (Adjudicator) and observe different available actions; attempt a direct API call to an Investigator-only endpoint as Theodore (Applicant) and observe the server-side denial; show the denial in the audit viewer (SM-18). Includes the cross-org and clearance-tier denials using Ingrid and Harlan.
2. **Degraded-system behavior.** Force IM `UNAVAILABLE` from SCR-38; observe the queue rendering the other four sources with the named, quantified warning; observe the dashboard notice and the disabled action; clear injection; observe automatic recovery with no reload (SM-15, SM-16, SM-17).
3. **Sixth-application registration.** As Priya, register CVS through SCR-28 including the live connection test; then, in a second browser as the already-signed-in Marcus, observe CVS items appearing in the queue within one poll — with zero code changes and zero restarts (SM-11, SM-12).
4. **Audit chain review.** Filter the audit viewer by correlation ID; open the chain view; export the filtered view; show the integrity indicator (SM-20).

**Additional rule:** an **operator token** command (`FR-F09-08`) issues a short-lived assertion so a reviewer can `curl` spoke APIs directly during scripts 1 and 3.

**Acceptance criteria:**
- AC-1: All four scripts run successfully on a freshly reset environment.
- AC-2: Each script names its starting persona and reset precondition.

---

### FR-F18-07 — Service status page (SCR-37)

**Processing / business rules:**
1. Lists every service — hub, UI, five spokes, CVS — with: running state, version, health, latency, port, current failure-injection state, and namespace row counts.
2. A "Demo readiness" summary at the top: green/amber/red with text, checking that all services are up, seed validation passed, CVS is unregistered, and no failure injection is active. This is the single check an operator runs before presenting.
3. Actions: "Run reset" (typed confirmation), "Clear all failure injection," "Re-run seed validation," "Issue operator token."
4. Administrator-only, authorized and audited.
5. It answers, in one glance, "is this environment ready to demo" — which is the question that actually matters at 9:58 before a 10:00 demo.

**Error handling:**

| Scenario | Display | Message |
|---|---|---|
| A service is down | Red | "{Service} isn't running. Start it with {command} before demonstrating." |
| Seed validation failed | Red | "Seed validation failed: {reason}. Run reset before demonstrating." |
| CVS already registered | Amber | "CVS is already registered. Run reset to restore the registration demo." |
| Failure injection active | Amber | "{Service} is in a simulated {mode} state. Clear it before demonstrating unless this is intentional." |

**Acceptance criteria:**
- AC-1: The readiness summary correctly reports amber when CVS is registered or injection is active.
- AC-2: All four actions work from the page.

---

### FR-F18-08 — Clean shutdown

**Processing / business rules:**
1. A single documented command stops all seven services and releases all ports, with no orphaned processes.
2. Shutdown is graceful: in-flight requests complete or are cancelled within 10 seconds.
3. A `--purge` variant additionally removes data volumes, returning the machine to pre-run state.
4. The command reports what was stopped and confirms ports are released.

**Acceptance criteria:**
- AC-1: After shutdown, no process holds any of the configured ports.
- AC-2: A subsequent start command succeeds without manual cleanup.

---

### FR-F18-09 — Documented troubleshooting

**Processing / business rules:** The three likeliest demo-day failures, each with symptom, cause, and fix:

1. **Port already in use.** Symptom: pre-flight fails naming the port. Fix: stop the conflicting process, or change the port in `.env` and restart.
2. **A spoke didn't start.** Symptom: degraded warning naming a system; SCR-37 shows it red. Fix: check that service's log, restart just that service; the rest of the demo continues meanwhile — and the degraded state is itself demonstrable, which is worth saying out loud.
3. **Seed state consumed mid-demo.** Symptom: the flagship issue is already resolved; SCR-16 shows "already resolved." Fix: run `reset` (under 30 s), or use the documented fallback issue.

Plus two more that cost little to document: stale browser session after a reset (fix: sign out and back in), and CVS already registered from a prior run (fix: reset, or de-register from SCR-23).

**Acceptance criteria:**
- AC-1: Each documented symptom is reproducible and each documented fix resolves it.
- AC-2: Troubleshooting is in the README, not only in a separate document.

---
