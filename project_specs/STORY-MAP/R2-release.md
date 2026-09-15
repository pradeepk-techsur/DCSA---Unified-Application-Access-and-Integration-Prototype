### Release R2 — Role Breadth and Trust

> **Theme:** The same unified layer, composed differently and enforced differently for four roles. This is the release that turns "it works" into "it is credible."

R1 proves the product does one thing extremely well for one persona. An evaluator's next two questions are predictable: *does this compose for anyone other than the investigator?* and *is the zero-trust story enforcement or decoration?* R2 answers both, and it is the release where the other three personas become real.

**Stories (34):**

| Backbone step | Stories |
|---|---|
| Authenticate | US-003, US-004, US-005, US-006, US-011, US-013, US-117 |
| Orient | US-030, US-031, US-034, US-035, US-120, US-121, US-122, US-123 |
| Find work | US-044, US-049, US-078 *(IEP/PDT)*, US-133 *(PER-02…04)*, US-134 |
| Work an item | US-017, US-054, US-057 |
| Resolve across systems | **US-018, US-019, US-020, US-021, US-022, US-023**, US-024, US-082, US-130 |
| Verify & Audit | US-103, US-104, US-105, US-146 |

**Personas served — who can do meaningful work at the end of R2:**

| Persona | Can do meaningful work? | What they can actually do |
|---|---|---|
| **PER-01 Marcus Vale** | ✅ Fully *(unchanged from R1, plus)* | Now sees his own failures classified properly (US-054), can search, and is subject to region and tier checks he can watch being enforced. |
| **PER-02 Dana Okonkwo** | ✅ **Fully** | Signs in, reads a determination-shaped dashboard, works an aging and blocked queue, assembles the whole cross-system record for one subject, sees a **different server-computed action set** on the same issue Marcus resolved, renders a determination, and reads the correlated trail. |
| **PER-03 Renée Ashford** | ✅ **Fully** | Signs in with a code on her phone, reads a plain-language status, discharges an outstanding task, reads a notice where she already looks, proves what she submitted — and is the subject of the headline resource-level denial. |
| **PER-04 Priya Raghunathan** | ◐ **Partially — as auditor, not yet as operator** | Gains the filterable platform-wide audit viewer and can read denials and authentication events. Still has **no inventory, no health view, no error log, no registration flow**. |

**Journeys demonstrable at the end of R2:**

| Journey | Status | Note |
|---|---|---|
| JRN-01.01 *(flagship)* | ✅ Complete | Held stable; US-146 now regression-tests its authorization assumptions. |
| JRN-01.02 Monday-morning triage | ◐ Stages 1–6 | Stage 7 still needs F12 (R3). |
| **JRN-02.01** Assemble and determine | ✅ **Complete, all 9 stages** | Including stage 6 — the side-by-side action-set difference, the clearest live RBAC demonstration in the product. |
| **JRN-02.02** Aging queue and missing data | ◐ Stages 1–4, 7 | Stages 5–6 (the empty-vs-degraded distinction) need F16 and land in R3. |
| **JRN-03.01** Where do I stand, what do I owe | ✅ **Complete, all 8 stages** | On a 320px viewport. |
| **JRN-03.02** Proof and boundary | ✅ **Complete, all 6 stages** | Including the live curl denials and reading them back out of the audit viewer. |

**Slicing justification:**

- **The three remaining dashboards (US-034, US-035, US-036) do not all land here.** US-034 and US-035 do, because PER-02 and PER-03 are mission users whose journeys are the point of this release. US-036 — the administrator dashboard — is held to R3 because it is an *operations* surface with nothing to display until the console, health monitor, and error log exist behind it. Shipping it in R2 would mean shipping empty widgets, which the PRD forbids ("empty states are designed, not blank"; "no placeholder screens").
- **All six negative-path stories (US-018…023) land together, not piecemeal.** A zero-trust claim demonstrated for one boundary and not the others invites exactly the question you cannot answer on stage. They ship as a set, with US-024 (the consistent non-enumerable error contract) and US-082 (the uniform error shape) alongside them, because a denial that leaks through an inconsistent error shape is not a denial.
- **US-130 (global error boundary) is pulled from Epic 16 into R2**, ahead of the rest of resilience. Justification: R2 triples the reachable surface area — three new dashboards, a determination form, an applicant portal, and six deliberate denial paths. The guarantee "never a blank page, never a stack trace" has to land with the surfaces it protects, not a release later. The *degraded-system* stories it is normally grouped with stay in R3, because those depend on the health monitor.
- **US-105 (audit viewer) lands here rather than R3** even though it is an administrator screen, because JRN-03.02 stage 6 — reading the curl denials back out of the trail — is the closing beat of the zero-trust demonstration. Without it the denial is asserted rather than shown.
- **US-078 completes (IEP and PDT domain depth) and US-133 completes (seed breadth for all four personas).** This is what raises the queue from three contributing spokes to four-of-five and satisfies SM-14 properly.
- **Deferred deliberately:** everything operational. No health, no error log, no failure injection, no registration. An evaluator who has watched R1 and R2 has seen a complete, credible, multi-role product that cannot yet be *operated* — which is precisely the gap R3 closes.

**Acceptance Gate:**

- [ ] All NaC for the included stories pass.
- [ ] All four personas produce a **visibly different, fully populated dashboard** with no empty or placeholder widget — except the administrator dashboard, which is explicitly out of scope until R3 (F4 acceptance signal, partial).
- [ ] PER-01 and PER-02 open **the same PVQ work item** and are presented with **different, server-computed action sets** (SM-18, F2 acceptance signal).
- [ ] An authenticated Applicant calling an investigator-only endpoint, **and** calling a legitimate endpoint with another subject's resource ID, is denied server-side with a **byte-identical non-enumerable error**, and both denials appear in the audit trail (SM-18).
- [ ] The queue renders correctly attributed items from **at least four of five** spokes (SM-14).
- [ ] Every navigation item, for every one of the four roles, resolves to a real, populated page (partial SM-05 — full crawl verification is R3).
- [ ] No blank page and no stack trace is reachable from any route, for any role (SM-06, partial).
- [ ] Automated accessibility scan across all R1 and R2 routes reports zero serious or critical violations (SM-07, partial).
- [ ] JRN-01.01 still completes in under three minutes and still writes exactly one authentication event — **regression gate, run every release**.

---
