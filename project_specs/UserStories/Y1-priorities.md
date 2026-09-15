## Priority Definitions

Priorities mirror the PRD's definitions exactly, so a story's priority and its feature's priority can never disagree.

| Priority | Definition | Meaning for this prototype |
|----------|------------|----------------------------|
| **P0** | Critical — required for the demonstration to succeed | If this story fails, the demonstration fails. Build these first and keep them working. |
| **P1** | High — required for a complete, credible prototype | The demonstration survives without it, but the prototype reads as unfinished to an evaluator. |
| **P2** | Medium — valuable, cut first under pressure | **Not used.** The PRD deliberately moved everything non-essential to Out of Scope rather than deprioritising it. |
| **P3** | Low — future consideration | **Not used**, for the same reason. |

### Priority distribution

| Priority | Stories | Share |
|---|---|---|
| **P0** | 102 | 68% |
| **P1** | 49 | 32% |
| P2 | 0 | — |
| P3 | 0 | — |
| **Total** | **151** | **100%** |

---

## Build Sequencing Guidance

The PRD's R-03 risk — *"scope breadth starves the flagship"* — applies directly to this story set. One hundred and fifty-one stories will compete for finite build time, and the demonstration centrepiece is the thing that must not be under-polished. The sequencing below is the discipline that keeps that from happening.

**Tier 1 — the vertical slice that proves the thesis.** Build these until the flagship workflow runs end to end, reliably, three times in a row with a reset between each. Nothing else starts until it does.

> US-001 · US-002 · US-009 · US-016 · US-026 · US-027 · US-040 · US-050 · US-059 … US-069 · US-101 · US-133 · US-136 · US-138 · US-140

**Tier 2 — the claims a reviewer will probe next.** The zero-trust negatives, the four distinct dashboards, and the accessibility gate. These are the stories that turn "it works" into "it is credible."

> US-015 · US-017 · US-018 … US-025 · US-033 … US-036 · US-039 · US-041 … US-049 · US-051 … US-058 · US-102 … US-107 · US-109 … US-118 · US-134 · US-135 · US-137 · US-139 · US-141 … US-144

**Tier 3 — the completeness tier.** Operability, extensibility, notifications, resilience polish, and the verification suite. Every one of these is P1; none of them is optional if the prototype is to read as complete, but each yields to Tier 1 if time compresses.

> US-030 · US-037 · US-038 · US-046 · US-070 … US-100 · US-108 · US-119 … US-132 · US-145 … US-151

---

## Traceability

| Charter requirement (`.planning/PROJECT.md`) | PRD feature | Stories |
|---|---|---|
| Simulated MFA login (CAC/PIV, ECA, generic) with SSO across spokes | F0, F1 | US-001 … US-014 |
| Role-based and attribute-aware access control, server-side | F2, F10 | US-015 … US-025, US-081, US-085 |
| Role-specific personalised dashboard | F4, F15 | US-033 … US-039, US-119 … US-124 |
| Unified work queue with filter/sort/search and attribution | F5 | US-040 … US-049 |
| Work-item detail: review, act, view history | F6 | US-050 … US-058 |
| **Flagship cross-application workflow** | **F7** | **US-059 … US-069** |
| Administrator console: apps, health, integration issues | F11, F16 | US-086 … US-093, US-125 … US-132 |
| Application registration flow (onboarding pattern) | F12, F8 | US-094 … US-100, US-070 … US-075 |
| Immutable audit trail, viewable and filterable | F13 | US-101 … US-108 |
| Five spokes as separate services behind common adapters | F9, F8 | US-076 … US-080 |
| USWDS v3 accessible UI (508 / WCAG 2.1 AA) | F14, F3 | US-109 … US-118, US-026 … US-032 |
| Realistic synthetic seed data | F17 | US-133 … US-137 |
| Error / loading / empty states + degraded-system warning | F16 | US-127 … US-130, US-048, US-049, US-054 |
| Demo operability: one command + scripted demo path | F18 | US-138 … US-144 |
| Automated tests (flagship, RBAC, adapters) | F19 | US-145 … US-151 |

### Success-metric coverage

| Metric | Target | Demonstrated by |
|---|---|---|
| SM-01 Flagship workflow completion | End to end in one session | US-059 … US-067 |
| SM-02 Re-authentications during flagship | Exactly zero | US-009, US-061, US-145 |
| SM-03 Dual-system change verified independently | Both spoke APIs agree | US-067, US-077 |
| SM-04 Context loss during workflow | Zero | US-061, US-029 |
| SM-05 Navigation integrity | 100% of items resolve | US-032, US-015 |
| SM-06 Non-functional controls | Zero | US-032, US-150 |
| SM-07 Accessibility violations | Zero serious or critical | US-118, US-149 |
| SM-08 Keyboard-only task completion | Flagship completable | US-069, US-109 |
| SM-09 Colour contrast conformance | 100% | US-114 |
| SM-10 Demo banner presence | 100% of routes | US-027, US-123, US-150 |
| SM-11 Sixth-application registration | Under 5 minutes, live | US-094, US-099 |
| SM-12 Post-registration visibility | Immediate, everywhere | US-098 |
| SM-13 Spoke isolation | Zero cross-namespace access | US-076, US-080 |
| SM-14 Work-queue source coverage | ≥4 of 5 spokes | US-040, US-033 |
| SM-15 Adapter outage behaviour | Visible, specific warning | US-048, US-127, US-131 |
| SM-16 Partial-result rendering | Remaining sources actionable | US-048, US-126 |
| SM-17 Automatic recovery | No reload, no re-auth | US-132, US-038 |
| SM-18 Server-side authorisation coverage | 100% denied | US-018 … US-023, US-146 |
| SM-19 Audit coverage | Exactly one record per mutation | US-101, US-083, US-148 |
| SM-20 Flagship audit chain | One correlated chain | US-068, US-014, US-106 |
| SM-21 Time to running application | Under 10 minutes | US-138, US-139 |
| SM-22 Demo repeatability | 3 identical runs | US-136, US-140 |

---

## Open Items Carried Forward

| # | Item | Effect on these stories |
|---|---|---|
| Q-01 | DCSA Ecosystem Style Guide (Attachment 1) not supplied | US-109 … US-118 assume USWDS v3 with token-based theming. Adopting the real guide is a token and asset swap; acceptance criteria referencing components remain valid. US-118 requires the assumption to be disclosed on the accessibility statement. |
| Q-04 | Exact eApp ↔ PVQ relationship semantics | US-060, US-063, and US-064 encode the modelled semantics: a PVQ issue references a specific eApp case and answer, and resolving it clears that case's outstanding-issue state. Plausible and sufficient for demonstration; would be validated in a real discovery phase. |
| Q-05 | Attribute taxonomy for ABAC | US-021 and US-022 use the synthetic taxonomy of organisation, clearance tier, assigned region, and case assignment. The mechanism is what is demonstrated; the real taxonomy is a discovery output. |
| Q-06 | Identity of the demonstration sixth application | US-099 names the Continuous Vetting Service. Any plausible synthetic service works; the onboarding pattern is the point. |
| — | Seeded identity names differ between the FRD seed corpus and the persona document | Stories reference **roles** rather than seeded individual names, so the two documents cannot drift. Named record identifiers (`EAPP:CASE-A-1042`, `PVQ:ISS-2207`, `CVS`) remain normative because the demonstration script depends on them. |

---

*Document generated by Pivota Spec Framework*
*Last updated: 2026-09-14*
*DEMO — SYNTHETIC DATA ONLY. No real DCSA data, no real PII, no real system connections.*
