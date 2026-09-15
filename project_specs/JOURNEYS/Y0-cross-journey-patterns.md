
## Cross-Journey Patterns

### Common Pain Points (the "today" costs that recur across personas)

These are the frictions that appeared in **three or more** journeys. Each is a single root cause with four different symptoms — which is precisely why a unified layer, rather than four better applications, is the right response.

| # | Recurring pain (today) | Appears in | Single cause | Solved once by |
|---|------------------------|-----------|--------------|----------------|
| X-01 | **Multiple logins for one piece of work**, with mismatched session lifetimes so the system needed last has always expired | JRN-01.01, 01.02, 02.01, 03.01 | Identity is owned per application | F0 + F1 — one session, honored by every adapter, for its whole life |
| X-02 | **Identifiers hand-carried between systems** in a scratch document, with transposition as a recurring error class | JRN-01.01, 02.01, 03.01 | No system accepts a reference from another | F6 related items + F7 — relationships resolved live by the hub |
| X-03 | **An empty screen that might be a lie** — no way to distinguish "nothing here" from "the source could not be reached" | JRN-01.03, 02.02, 04.02, 04.03 | Aggregation without per-source status | F16 — designed empty states and named, quantified degraded states as two different screens |
| X-04 | **Discovery is accidental** — work, notices, and exceptions are found late or second-hand | JRN-01.02, 02.02, 03.01 | Nothing computes exceptions across systems | F15 + F4 — server-side alert rules linking directly to the item that produced them |
| X-05 | **Confirmation that names nothing** — "Saved" with no system, no state, no evidence — forcing manual re-verification | JRN-01.01, 02.01, 03.01 | Writes are per-system and unattributed | F6 + F7 — confirmations naming system and resulting state, read back per spoke |
| X-06 | **Correlation by hand** — reconstructing "what happened, in what order, across which systems" by merging timestamps | JRN-01.01, 02.01, 04.02 | No correlation ID was ever issued | F13 — one correlation ID spanning an entire cross-system action |
| X-07 | **Role meaning differs per system**, so nobody can say what they are actually entitled to and effort is invested in actions that turn out to be forbidden | JRN-01.02, 02.01, 03.02, 04.01 | Authorization is implemented four times, four ways | F2 — one server-side policy engine, action sets computed per principal per resource |
| X-08 | **Context lost at every boundary** — filters, sort, page, and the user's own train of thought | JRN-01.01, 01.02, 02.01, 03.01 | Each application is a separate destination | F3 + F6 — one shell, breadcrumbs that carry cross-application context, restored queue state |
| X-09 | **Internal vocabulary leaking to people who cannot decode it** | JRN-03.01, 03.02 | Status display is an internal state dump | F4 + F14 — plain-language mapping applied server-side before anything reaches an applicant |
| X-10 | **Degradation cannot be rehearsed**, so resilience behavior is first observed in production | JRN-01.03, 02.02, 04.03 | No controlled failure mechanism exists | F16 failure injection — resilience becomes a test, not a hope |

### Shared Opportunities (built once, paid for by every persona)

- **One session, four experiences.** F0/F1 eliminate X-01 for every persona simultaneously. This is the single highest-leverage capability in the product, and it is invisible when it works — which is why the audit log's "exactly one authentication event" is the observable that proves it (SM-02).
- **Per-source status on every aggregate.** Every list, panel, and widget knows whether each source answered, failed, or answered with nothing. That one design decision produces the investigator's named warning (JRN-01.03), the adjudicator's refusal to decide blind (JRN-02.02), and the administrator's health picture (JRN-04.02) from the same substrate.
- **Server-computed action sets.** The same mechanism that keeps Dana from resolving an issue (JRN-02.01), Renée from touching another subject's record (JRN-03.02), and Priya from reading mission content (JRN-04.01/04.02) is one policy engine, evaluated per resource, on every request. **Three different demo moments, one implementation.**
- **The correlation ID as connective tissue.** Issued at the browser, propagated hub → adapter → spoke, landing in both the audit trail and the integration error log. It is what turns Marcus's flagship action into one chain (JRN-01.01), lets Priya answer a report in minutes (JRN-04.02), and gives every error state something a user can hand to an administrator.
- **Accessible data tables as a single pattern.** The work queue, the notices list, the audit viewer, the inventory, the health history, and the error log are the **same accessible table** with different columns. Building it once and well serves every persona; building it six times is how the console ends up non-conformant.
- **Designed empty states as a first-class deliverable.** Every journey has at least one path that ends in nothing to show. An empty state that explains and offers a next action is the difference between "the system is working and I have nothing to do" and "the system is broken."

### Convergence Points (where journeys meet)

| Convergence | Journeys | What happens | Why it matters to the demo |
|-------------|----------|--------------|----------------------------|
| **The same work item, two roles** | JRN-01.01 ↔ JRN-02.01 | Marcus resolves `ISS-2207`; Dana can read it and its narrative but is **not offered** the resolve action | The clearest live RBAC demonstration in the product — show them back to back |
| **Producer → consumer of the record** | JRN-01.01 → JRN-02.01 | Marcus's disposition and narrative are the material Dana adjudicates weeks later, out of context | Makes the audit and narrative-quality requirements concrete rather than abstract |
| **One outage, two consequences** | JRN-04.03 → JRN-01.03 + JRN-02.02 | Priya injects once; the investigator sees a named, quantified queue gap, the adjudicator sees a refusal to present an ambiguous empty list | One induced failure yields two persona-appropriate designed responses — the strongest evidence that resilience was designed, not patched |
| **One registration, one user-visible consequence** | JRN-04.01 → JRN-01.02 | CVS registered in one window; its items appear in an open investigator session in the other | Extensibility is proven by the second window, not by the wizard |
| **Mediated, never shared** | JRN-01.01 ↔ JRN-03.01 | Marcus acts on Renée's record; she never sees his findings, his notes, or that an issue was raised against her answer. Their only touchpoint is a request for information: a task to her, a pending item to him | A deliberate access-control boundary, not an oversight — and the setup for the zero-trust demonstration |
| **Every action lands in the same trail** | all ten | Authentications, traversals, writes, denials, adapter failures, console actions | The audit viewer is where every journey in this document can be seen to have happened |

### Cross-Cutting Accessibility Commitments

Stated once here because they apply to **every** journey and should be verified per journey rather than per screen:

1. **Every journey in this document is completable keyboard-only and with a screen reader, start to finish.** This is a completion criterion, not a note (SM-08).
2. **Cross-application traversal preserves focus and announces context.** The highest-risk step in the product (JRN-01.01, Stage 7) and the one a screen-reader user will notice first if it is wrong.
3. **Asynchronous updates — queue refreshes, action results, degraded warnings, new notices — are delivered via live regions and never steal focus**, with the single deliberate exception of a result the user is explicitly waiting for (the dual-system confirmation).
4. **Status is never colour-only**, anywhere, for anyone — including the administrator console, where a red/green health dot is both a conformance failure and an operational hazard (NFR-02).
5. **Source attribution lives in the accessible name**, not in a coloured badge. An adjudicator who cannot attribute a field cannot use it.
6. **Long, high-consequence forms** — issue resolution, determination, applicant submission, application registration — all require an error summary with focus management and in-page links to offending fields. A lost narrative is a lost user in four different ways.
7. **Usable at 200% zoom and 320px-equivalent width**, with the applicant surface (JRN-03.01) as the hardest case and the non-dismissible demo banner as a real layout constraint to test against (NFR-13, NFR-16).
8. **Denial, empty, degraded, and error pages are in scope for 508** — they are pages like any other, and they are where a user is already frustrated.

---
