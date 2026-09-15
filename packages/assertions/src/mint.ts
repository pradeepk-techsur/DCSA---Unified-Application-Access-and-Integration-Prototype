// packages/assertions/src/mint.ts
//
// The hub↔spoke trust primitive: an Ed25519 (EdDSA) JWT, audience-bound to one
// application. A PVQ-audience assertion presented at eApp fails inside `jose`
// because `aud` no longer matches — audience binding is a library guarantee, not
// custom crypto (FR-F01-02, TechArch §7.1).

import { SignJWT } from 'jose';
import type { Principal, Scope } from '@ual/adapter-contract';
import { getSigningKey } from './keys.js';

/** Principal assertion lifetime — 5 minutes (TechArch §7.1). */
const PRINCIPAL_TTL_SECONDS = 5 * 60;
/** Operator token lifetime — 15 minutes (FR-F09-08 rule 4). */
const OPERATOR_TTL_SECONDS = 15 * 60;

/**
 * The EXPLICIT field allow-list carried into a spoke. `attributes.caseAssignments`
 * is deliberately absent: the hub evaluates assignment-based authorization itself,
 * so a spoke can never be induced to widen scope from hub-supplied assignment data
 * (FR-F01-02 rule 5, TechArch §7.1 property 4). Adding a field here is a security
 * decision — the assertions.spec.ts caseAssignments-absent test guards it.
 */
interface PrincipalAssertionClaims {
  principalId: string;
  displayName: string;
  identityMethod: Principal['identityMethod'];
  roles: Principal['roles'];
  activeRole: Principal['activeRole'];
  attributes: {
    organization: string;
    clearanceTier: Principal['attributes']['clearanceTier'];
    assignedRegion: string;
    subjectRef: string | null;
  };
}

function principalClaims(principal: Principal): PrincipalAssertionClaims {
  return {
    principalId: principal.principalId,
    displayName: principal.displayName,
    identityMethod: principal.identityMethod,
    roles: principal.roles,
    activeRole: principal.activeRole,
    attributes: {
      organization: principal.attributes.organization,
      clearanceTier: principal.attributes.clearanceTier,
      assignedRegion: principal.attributes.assignedRegion,
      subjectRef: principal.attributes.subjectRef,
      // caseAssignments intentionally omitted — see the allow-list note above.
    },
  };
}

export class AssertionMinter {
  /**
   * Mint a short-lived (5 min) EdDSA JWT for `principal`, bound to `audience`
   * (the registry applicationId). The signature covers the allow-listed claims;
   * `ctx.scope`, when supplied, travels alongside as an advisory `scope` claim.
   */
  async mint(
    principal: Principal,
    audience: string,
    ctx: { scope?: Scope } = {},
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const claims: Record<string, unknown> = { ...principalClaims(principal) };
    if (ctx.scope) claims['scope'] = ctx.scope;

    return new SignJWT(claims)
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuedAt(now)
      .setNotBefore(now)
      .setExpirationTime(now + PRINCIPAL_TTL_SECONDS)
      .setAudience(audience)
      .sign(getSigningKey());
  }
}

/**
 * The short-lived (15 min) assertion an evaluator uses for direct spoke `curl`s
 * (FR-F09-08 rule 4). It carries an embedded `scope` claim so a spoke can serve a
 * scoped read from the token alone.
 */
export async function mintOperatorToken(opts: {
  audience: string;
  scope: Scope;
  issuedTo: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    principalId: opts.issuedTo,
    operatorToken: true,
    scope: opts.scope,
  })
    .setProtectedHeader({ alg: 'EdDSA' })
    .setIssuedAt(now)
    .setNotBefore(now)
    .setExpirationTime(now + OPERATOR_TTL_SECONDS)
    .setAudience(opts.audience)
    .sign(getSigningKey());
}
