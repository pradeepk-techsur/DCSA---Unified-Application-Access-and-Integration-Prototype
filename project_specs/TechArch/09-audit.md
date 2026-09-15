## 9. Audit Architecture

The audit trail is not instrumentation. **An action that cannot be audited does not complete.** That sentence is only credible if the guarantee is structural, so this chunk is mostly about mechanism: where the write happens, why it cannot be forgotten, why it cannot be deferred, and why it cannot be undone.

---

### 9.1 Three Layers of Enforcement

| Layer | What it prevents | Mechanism |
|---|---|---|
| **1. Database grant** | Any modification or deletion of a record, by any code, ever | `hub_service` holds `INSERT, SELECT` on `hub.audit_events` and nothing else. `UPDATE` raises `42501`. |
| **2. Pipeline interceptor** | A developer forgetting to write an audit record | The `onSend` hook refuses to emit a 2xx for a route declared `mutating: true` unless an audit record for that `requestId` exists |
| **3. Boot-time contract check** | A mutating route being added without declaring its audit action type | The process exits non-zero if any `POST`/`PATCH`/`PUT`/`DELETE` route lacks `config.auditActionType`, or names one absent from `hub.audit_action_types` |

Layer 2 is the one that makes the difference in practice. A rule like "remember to call `audit.write()`" is a convention that decays at the third sprint. A hook that will not let the response leave is not.

---

### 9.2 The Interceptor

```ts
// packages/audit/src/interceptor.ts
// Registered ONCE at the Fastify root. No route can remove it.

export const auditHook: FastifyPluginAsync = async (app) => {
  // A per-request ledger. The handler records intent; the hook enforces the guarantee.
  app.decorateRequest('auditIntents', null);

  app.addHook('onRequest', async (req) => { req.auditIntents = []; });

  app.addHook('onSend', async (req, reply, payload) => {
    const cfg = req.routeOptions.config as RouteConfig;

    // --- Denials are always audited, on any route, mutating or not ---------
    if (reply.statusCode === 403 || reply.statusCode === 401) {
      await auditStore.write(denialRecord(req, reply));
      return payload;
    }

    if (!cfg.mutating) return payload;
    if (reply.statusCode >= 400) return payload;   // failures audit their own outcome

    // --- THE GUARANTEE ----------------------------------------------------
    // A successful mutation with no recorded audit intent is a DEFECT, and the
    // correct response to a defect here is to refuse the success, not to log a
    // warning and carry on. Reporting an unaudited action as done is the one
    // outcome the trail exists to prevent.
    if (req.auditIntents.length === 0) {
      throw new AuditContractViolation(cfg.action, req.routeOptions.url);  // → 500, alerts in CI
    }

    try {
      // Written INSIDE the request, BEFORE the success body is emitted.
      // Not queued. Not batched. Not deferred to a worker. Deferral is what
      // turns a guarantee into a hope.
      for (const intent of req.auditIntents) await auditStore.write(intent);
    } catch (err) {
      if (spokeAlreadyCommitted(req)) {
        // Unavoidable in a distributed write: the spoke wrote, we cannot record it.
        // We say so, loudly and honestly, rather than hiding the gap.
        await markTransactionAuditGap(req);
        await integrationIssues.record({ errorClass: 'AUDIT_WRITE_FAILED', ...ctxOf(req) });
        return errorEnvelope('AUDIT_WRITE_FAILED', req);   // 500 — "It may have been applied…"
      }
      return errorEnvelope('AUDIT_UNAVAILABLE', req);      // 503 — "…this action wasn't completed."
    }
    return payload;
  });
};
```

The two failure messages are deliberately different, and the difference is the whole ethic of the design:

- **`AUDIT_UNAVAILABLE` (503)** — nothing was written anywhere. *"We can't record actions right now, so this action wasn't completed. Try again shortly."* Unambiguous: nothing changed.
- **`AUDIT_WRITE_FAILED` (500)** — the spoke committed but the audit did not. *"We couldn't record this action. It may have been applied in {System} — check the item's current status. An administrator has been notified."* The uncertainty is stated rather than concealed, the transaction is marked `AUDIT_GAP`, and an integration issue surfaces it to a human.

A system that reported the second case as success would have a trail that quietly disagrees with reality, which is worse than having no trail at all.

---

### 9.3 Record Structure and the Hash Chain

```ts
// packages/audit/src/record.ts

export interface AuditRecord {
  auditId: string;                        // ULID
  sequenceNumber: bigint;                 // GENERATED ALWAYS AS IDENTITY — cannot be supplied
  occurredAt: string;                     // server clock, UTC

  // Actor snapshot AT THE TIME OF ACTION. Later role changes cannot rewrite history.
  actorPrincipalId: string | null;        // null only for pre-authentication failures
  actorDisplayName: string | null;
  actorRolesAtAction: RoleId[] | null;
  actorActiveRoleAtAction: RoleId | null;
  actorAttributesAtAction: Record<string, unknown> | null;

  actionType: string;                     // closed vocabulary, FK to hub.audit_action_types
  targetSystem: string;                   // 'HUB' or applicationId
  targetSystemDisplayName: string;        // denormalized: survives de-registration
  targetResourceType: string | null;
  targetResourceId: string | null;

  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'PARTIAL';
  reasonCode: string | null;
  policyRuleId: string | null;            // 'ATTR-INV-03' — which rule denied

  beforeSummary: string | null;           // "status: Open"
  afterSummary: string | null;            // "status: Resolved — Substantiated"

  correlationId: string; requestId: string; adapterRequestId: string | null;
  sessionId: string | null; identityMethod: string | null;
  clientIpHash: string | null; clientUserAgentHash: string | null;

  previousRecordHash: string; recordHash: string;
}

/** recordHash = SHA-256 over the fields that constitute the claim.
 *  The chain makes tampering DETECTABLE; the grant makes it IMPRACTICAL.
 *  Both are stated, because either alone is a weaker story. */
export function computeHash(r: AuditRecord, previousHash: string): string {
  return sha256([
    r.sequenceNumber, r.occurredAt, r.actorPrincipalId ?? '', r.actionType,
    r.targetSystem, r.targetResourceId ?? '', r.outcome,
    r.beforeSummary ?? '', r.afterSummary ?? '', r.correlationId, previousHash,
  ].join('\u001f'));
}
// The first record chains from a documented genesis constant.
```

`beforeSummary` and `afterSummary` are plain-language strings capped at 500 characters — *"outstanding issues: 1 → 0"*, not a record dump. The resolution narrative itself lives in PVQ, which is its system of record; duplicating it into the audit trail would create a second copy that could disagree with the first.

**Concurrency.** `sequenceNumber` is an identity column, so ordering is assigned by the database. Hash-chain linkage is computed inside a short `SERIALIZABLE` transaction that selects the current maximum and inserts, so two concurrent writes cannot both chain from the same predecessor. A retried serialization failure is transparent to the caller.

---

### 9.4 Coverage

**Every mutating endpoint** writes exactly one primary record. The registry of mutating endpoints and their expected action types is derived from the route table, so a new mutating endpoint without an audit assertion fails the build.

| Category | Action types |
|---|---|
| Authentication | `AUTH_SUCCESS`, `AUTH_FAILURE`, `LOGOUT`, `SESSION_EXPIRED`, `ROLE_CONTEXT_SWITCHED` |
| Authorization | `AUTHZ_DENIED` — **every** denial, including CSRF rejections |
| Work items | `WORK_ITEM_VIEWED`, `WORK_ITEM_ACTION_PERFORMED`, `RELATED_ITEMS_RESOLVED`, `RELATED_ITEM_TRAVERSED` |
| Spoke mutations | `ISSUE_RESOLVED`, `CASE_ISSUE_CLEARED`, `CASE_ADJUDICATED`, `DESIGNATION_APPROVED`, `DESIGNATION_RETURNED`, `NOTICE_ACKNOWLEDGED`, `TASK_COMPLETED`, `ASSIGNMENT_ACCEPTED`, `CASE_STATUS_UPDATED`, `LEAD_NOTE_ADDED`, `ALERT_ACKNOWLEDGED`, `ALERT_CLEARED`, `ALERT_ESCALATED` |
| Orchestration | `ORCHESTRATION_STARTED`, `_COMPLETED`, `_PARTIAL`, `_FAILED`, `_RETRY_ATTEMPTED` |
| Administration | `APPLICATION_REGISTERED`, `_UPDATED`, `_ENABLED`, `_DISABLED`, `_DEREGISTERED`, `_PROBED`, `ANNOUNCEMENT_CREATED`, `_UPDATED`, `_EXPIRED`, `FAILURE_INJECTED`, `FAILURE_CLEARED`, `OPERATOR_TOKEN_ISSUED`, `DEMO_RESET_PERFORMED` |
| Identity | `USER_VIEWED`, `ROLE_ASSIGNED` |
| Integration | `ADAPTER_FAILURE` (when it accompanies a user action) |
| Audit | `AUDIT_VIEWED`, `AUDIT_EXPORTED` |

**Read auditing is deliberately limited** to work-item views, related-item resolution, identity views, and audit reads. Routine list reads are not audited, so the trail stays legible — and every exception is enumerated above rather than left to implementer discretion. The audit trail audits its own reading, which is both correct and, in a demo, satisfying to show.

---

### 9.5 Correlated Chains

One user action produces one correlation ID, adopted from a validated client header or generated at the edge, and attached to every hub operation, adapter call, audit record, integration issue, and error envelope belonging to it.

For the flagship workflow the UI generates the ID when the investigator opens the case, and sends it on every subsequent request. The chain reads as one narrative:

| # | Action | Target | Outcome | Summary |
|---|---|---|---|---|
| 1 | `WORK_ITEM_VIEWED` | EAPP | SUCCESS | Case A-1042 opened |
| 2 | `RELATED_ITEMS_RESOLVED` | HUB | SUCCESS | 3 relationships resolved |
| 3 | `RELATED_ITEM_TRAVERSED` | HUB | SUCCESS | Case A-1042 → Issue ISS-2207 |
| 4 | `WORK_ITEM_VIEWED` | PVQ | SUCCESS | Issue ISS-2207 opened |
| 5 | `ORCHESTRATION_STARTED` | HUB | SUCCESS | tx 01JD…, legs: PVQ then EAPP |
| 6 | `ISSUE_RESOLVED` | PVQ | SUCCESS | status: Open → Resolved — Substantiated |
| 7 | `CASE_ISSUE_CLEARED` | EAPP | SUCCESS | outstanding issues: 1 → 0 |
| 8 | `ORCHESTRATION_COMPLETED` | HUB | SUCCESS | Both legs COMMITTED |

Failure paths substitute `ORCHESTRATION_PARTIAL` or `ORCHESTRATION_FAILED` at record 8 and append one `ORCHESTRATION_RETRY_ATTEMPTED` per retry, **including the automatic background ones**. A partial completion's history is complete rather than tidied — the retries that happened are the story.

`GET /api/audit/chain/{correlationId}` returns the records in sequence order plus a computed one-line summary:

> *"Investigator Marcus Vale resolved PVQ issue ISS-2207 against eApp case A-1042 on 14 Sep 2026. Both systems updated."*

**An audit write missing a correlation ID fails the operation.** A record that cannot be placed in its chain is not a record of a cross-system action.

---

### 9.6 Role-Scoped Visibility

| Role | Scope | Applied where |
|---|---|---|
| Administrator (`AUDIT.READ_ALL`) | Every record | — |
| Everyone else (`AUDIT.READ_OWN`) | `actor_principal_id = principalId` | **In the SQL `WHERE` clause**, not after retrieval — the same data-layer discipline as applicant scoping |

Within a chain the user participated in, other actors' records appear as **redacted placeholders** — *"An action by another user — 14 Sep 2026, 15:05"* — rather than being omitted. The narrative's shape stays honest even when its detail is withheld; silently dropping rows would make a partial chain look complete.

Exports respect the identical scoping and filters: an export can never contain a record the user could not see on screen. Each export writes an `AUDIT_EXPORTED` record naming the filters and the count, is capped at 10 000 records, and carries `# DEMO — SYNTHETIC DATA ONLY` as its first line.

---

### 9.7 Integrity Verification

`GET /api/audit/integrity?fromSequence=&toSequence=` recomputes the chain over a range and returns `{ verified, recordsChecked, firstBrokenSequence, checkedAt }`. SCR-33 displays *"Integrity verified — 1,284 records checked at 15:07 UTC"* as text plus icon, never colour alone.

Three verification claims, each independently demonstrable to a reviewer in under a minute:

1. **No application path can modify a record.** Route enumeration finds no `PUT`/`PATCH`/`DELETE` under `/api/audit`; static analysis finds no `UPDATE`/`DELETE` statement against `audit_events`; and a direct attempt using the application credential is refused by the grant with `42501`.
2. **Tampering is detectable.** Altering a row *outside* the application — as the database owner, in `psql` — causes the integrity check to fail **at that sequence number**, which is exactly the story worth telling: the application cannot do it, and if someone bypasses the application, the chain says so.
3. **Sequence numbers are gap-free** across a full demo run.

**Retention.** Records are never purged. The reset command rebuilds the entire environment from scratch rather than deleting rows, so even reset is not a deletion path (`FR-F17-11` rule 2). Reset writes its own `DEMO_RESET_PERFORMED` record into the newly seeded baseline, so the reset itself is visible in the trail.

---

### 9.8 Audit vs. Integration Issues vs. Spoke Activity

Three logs exist deliberately, and confusing them is how audit trails become unusable.

| | **`hub.audit_events`** | **`hub.integration_issues`** | **`<ns>.*_activity`** |
|---|---|---|---|
| Answers | Who did what, to what, when | What broke between hub and spoke | What this system says happened to its own record |
| Audience | Everyone (scoped); administrators (all) | Administrators only | Surfaced to users as the spoke half of item history |
| Content | Plain language, no technical detail | Full technical detail, response excerpts, circuit state | Spoke-native actor and action |
| Mutability | **Append-only, grant-enforced, hash-chained** | Append-only | Append-only by convention |
| Blocking | **Yes** — failure fails the request | No — best-effort, never blocks the user | Yes, within the spoke's own transaction |
| Owner | Hub | Hub | The spoke |

They are joined by `correlationId`, which is what lets an administrator move audit chain → integration issue → application detail → spoke activity for one identifier without correlating logs by hand. Reconstructing a cross-system action from separate per-system logs is precisely the problem this prototype exists to eliminate; the correlation ID is how it eliminates it.

---
