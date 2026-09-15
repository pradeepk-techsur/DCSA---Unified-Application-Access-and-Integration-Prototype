// packages/assertions/src/verify.ts
//
// The verification every spoke performs, identically (TechArch/07-api-spokes.md §7.1).
// A spoke passes its own applicationId as `selfId`; a PVQ-audience assertion
// replayed at eApp fails HERE, inside `jose`, on the audience check.

import { jwtVerify, errors as joseErrors } from 'jose';
import type { Principal } from '@ual/adapter-contract';
import { getPublicKey } from './keys.js';

/**
 * A spoke maps this to `401 PRINCIPAL_REJECTED`. `@ual/spoke-kit` (Phase 1
 * plan 01-04) re-uses it so the mapping is written once.
 */
export class PrincipalRejected extends Error {
  constructor(message = 'PRINCIPAL_REJECTED') {
    super(message);
    this.name = 'PrincipalRejected';
  }
}

export async function verifyPrincipal(header: string, selfId: string): Promise<Principal> {
  try {
    // Resolved lazily so the deterministic seed can be read at first-use rather
    // than at module load; jose treats the KeyObject the same either way.
    const { payload } = await jwtVerify(header, getPublicKey(), {
      algorithms: ['EdDSA'],
      audience: selfId,              // a PVQ-audience assertion replayed at eApp fails HERE
    });                             // expiry (5 min) is checked by jose
    if (!payload['principalId']) throw new PrincipalRejected();
    return payload as unknown as Principal;
  } catch (err) {
    if (err instanceof PrincipalRejected) throw err;
    // Wrong audience, expired, bad signature, malformed — all collapse to one
    // user-safe rejection so a spoke cannot leak why verification failed.
    if (err instanceof joseErrors.JOSEError) throw new PrincipalRejected();
    throw err;
  }
}
