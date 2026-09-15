## Release Planning

The product is a **time-boxed demonstration prototype evaluated live**. That single fact drives the slicing below more than anything else in the PRD. Releases are not feature groupings; they are answers to the question *"if we stopped here and an evaluator walked in, what could they watch happen?"* Each release therefore completes journeys, not feature areas, and R1 is deliberately the thinnest thing that lets an evaluator watch the flagship journey finish.

Risk **R-03 — "scope breadth starves the flagship"** is the risk this slicing exists to manage. 151 stories will compete for finite build time and the centrepiece is the thing that must not be under-polished.

---

### Release R1 — Walking Skeleton: the flagship journey, end to end

> **Theme:** One sign-in, one shell, a case-advancing action that spans eApp and PVQ, and both spokes independently confirming the change. If only one thing is ever demonstrated, it is this.

**Scope test applied to every story in this release:** *is this slice needed for an evaluator to watch JRN-01.01 complete?* If no, it is not in R1. This rule is why there is no adjudicator dashboard, no admin console, no RBAC negative path, no degraded-system behaviour, and no application registration here — all of them are genuinely important, and none of them is on the flagship path.

**Stories (67):**

| Backbone step | Stories |
|---|---|
| Authenticate | US-001, US-002, US-007, US-008, US-009, US-010, US-012, US-014 |
| Orient | US-026, US-027, US-028, US-029, US-033, US-039, US-119 |
| Find work | US-040, US-041, US-042, US-043, US-045, US-046, US-047, US-078 *(eApp/PVQ/IM)*, US-110, US-114, US-133 *(PER-01)*, US-135, US-136, US-137 |
| Work an item | US-015, US-016, US-050, US-051, US-052, US-053, US-055, US-059, US-060, US-062, US-080, US-109, US-111, US-112, US-113, US-115, US-116 |
| Resolve across systems | **US-061, US-063, US-064, US-065, US-066**, US-081, US-083, US-101 |
| Verify & Audit | **US-067, US-068, US-069**, US-056, US-076, US-077, US-102, US-106, US-107, US-145 |
| Administer & Extend | US-070, US-138, US-140 |

**Personas served — who can do meaningful work at the end of R1:**

| Persona | Can do meaningful work? | What they can actually do |
|---|---|---|
| **PER-01 Marcus Vale** | ✅ **Fully** | Signs in once, reads his dashboard and the new-issue alert, works his unified queue across eApp/PVQ/IM with filter, sort, pagination, and return-to-context, opens the blocked case, discovers and traverses to the related PVQ issue, resolves it, sees both systems answer, verifies, and reads the correlated chain — keyboard-only if he chooses. |
| **PER-04 Priya Raghunathan** | ◐ **Partially — as verifier, not as administrator** | Starts the prototype with one command, drives the scripted flagship path, queries each spoke's API directly to prove the dual-system change, and reads the correlated audit chain. She has **no console, no health view, no registration flow** yet. |
| **PER-02 Dana Okonkwo** | ❌ **No** | Can authenticate, but has no adjudicator dashboard, no determination action, and no aging queue. Deliberately deferred to R2. |
| **PER-03 Renée Ashford** | ❌ **No** | Deliberately deferred to R2. Her sign-in method (generic MFA) is itself R2. |

**Journeys demonstrable at the end of R1:**

| Journey | Status | Note |
|---|---|---|
| **JRN-01.01** Clear the blocking issue *(flagship)* | ✅ **Complete, all 11 stages** | Including the partial-completion failure path (US-066) and the keyboard-only pass (US-069). This is the release's reason to exist. |
| **JRN-01.02** Monday-morning triage | ◐ Stages 1–6 | Stage 7 ("a sixth source appears") requires F12 and lands in R3. |
| All others | ❌ Not demonstrable | By design. |

**Slicing justification — why each inclusion earns its place, and each exclusion is safe:**

- **Included: the whole of Epic 7 (US-059…069).** Non-negotiable. This *is* the release.
- **Included: US-070 (registry-driven fan-out), even though registration is R3.** The R1 queue must fan out from a registry rather than a hard-coded list of five systems. If it does not, R3's live registration has nothing to plug into and the extensibility claim becomes a retrofit. The mechanism ships in R1; the UI over it ships in R3.
- **Included: the accessibility stories US-109…116.** Accessibility is a hard federal gate, not polish, and the flagship traversal (stage 7) is the single highest-risk accessibility step in the product. Retrofitting focus management onto a completed traversal is more expensive than building it once.
- **Included: US-136, US-137 (reset and seed validation).** The flagship consumes `ISS-2207`. Without a reset command the demo is single-use, and without seed validation a broken corpus is discovered live rather than at start-up. These are what make the release *rehearsable*, which is a precondition for being demonstrable.
- **Included: US-102, US-106 (actor attributes, chain view) but not US-105 (the full audit viewer).** SM-20 requires the flagship action to render as one correlated chain. The chain view reachable from the item's activity history delivers that; the filterable platform-wide viewer is an administrator surface and waits for R2.
- **Excluded: all RBAC negative paths (US-018…024).** The flagship demonstrates the *positive* authorization path via US-016 (resource-level entitlement on `CASE-A-1042`). The negatives are what make the zero-trust claim credible, but no evaluator needs them to watch the workflow complete. R2.
- **Excluded: all degraded-system behaviour (Epic 16).** An outage is not on the flagship path. Building resilience before the thing being made resilient exists inverts the dependency.
- **Excluded: IEP and PDT depth (US-078 partial).** The flagship touches eApp, PVQ, and IM. PDT and IM appear in the related-items panel as *references* (US-055, US-080) so the cross-system story is more than a single link, but their full domain behaviour waits for R2.

**Deviation from the stated slicing, declared.** The instruction places demo scripts and run instructions in R3. Two F18 stories are pulled forward:

- **US-138 (one command to start)** — a walking skeleton nobody can start is a walking skeleton that scored zero. The charter names this a deliverability constraint.
- **US-140 (the flagship demo script)** — R1's acceptance condition is that an evaluator *watches* the journey complete. The script is the instrument of that observation, not documentation about it.

The remaining five F18 stories (US-139, US-141…144) stay in R3 as instructed.

**Acceptance Gate:**

- [ ] All NaC for the included stories pass, verified in a live run rather than by inspection.
- [ ] JRN-01.01 completes end to end, manually, from the script, in **under three minutes** (SM-01).
- [ ] The audit log contains **exactly one** authentication event for the session (SM-02).
- [ ] `GET {pvq}/issues/ISS-2207` and `GET {eapp}/cases/CASE-A-1042`, called directly against the spokes with the hub out of the path, both return the updated state (SM-03).
- [ ] **Zero** manual re-entry of subject, case, or issue identifiers at any step (SM-04).
- [ ] The whole action is retrievable as a **single correlated chain** (SM-20).
- [ ] The flagship path completes **keyboard-only** in a separate verification pass, with zero serious or critical accessibility violations on the four screens involved (SM-08, SM-07).
- [ ] The queue renders correctly attributed items from **at least three** spokes, with eApp, PVQ, and IM all contributing (partial SM-14 — full four-of-five lands with R2's IEP/PDT depth).
- [ ] The demonstration runs **three times identically** with a reset between runs (SM-22).
- [ ] The synthetic-data banner is present on 100% of reachable routes with no path to hide it (SM-10, R1 routes only).

---
