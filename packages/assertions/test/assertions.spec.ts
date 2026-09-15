import { describe, it, expect, beforeAll } from 'vitest';
import { SignJWT, decodeJwt } from 'jose';
import type { Principal } from '@ual/adapter-contract';
import { AssertionMinter, verifyPrincipal, PrincipalRejected } from '../src/index.js';
import { getSigningKey, getPublicKey, _resetKeyCacheForTests } from '../src/keys.js';
import { generateKeyPair } from 'node:crypto';
import { promisify } from 'node:util';

const generateKeyPairAsync = promisify(generateKeyPair);

const principal: Principal = {
  principalId: '01JD7K2Q9X8V3MZ4R6TQ0000A',
  displayName: 'Marcus Vale',
  identityMethod: 'CAC_PIV',
  roles: ['INVESTIGATOR', 'ADJUDICATOR'],
  activeRole: 'INVESTIGATOR',
  attributes: {
    organization: 'DCSA-CONUS',
    clearanceTier: 'T5',
    assignedRegion: 'NORTHEAST',
    caseAssignments: ['CASE-A-1042', 'CASE-A-1099'],
    subjectRef: null,
  },
  sessionId: '01JD7K2Q9X8V3MZ4R6TQ0000S',
  issuedAt: '2026-09-14T15:00:00Z',
  expiresAt: '2026-09-14T15:30:00Z',
};

beforeAll(() => {
  // Fix the seed so the derived keypair is deterministic across the suite.
  process.env['UAL_ASSERTION_KEY_SEED'] = 'test-seed-assertions-spec';
  _resetKeyCacheForTests();
});

const minter = new AssertionMinter();

describe('AssertionMinter + verifyPrincipal', () => {
  it('a token minted with audience PVQ verifies against selfId PVQ', async () => {
    const token = await minter.mint(principal, 'PVQ');
    const verified = await verifyPrincipal(token, 'PVQ');
    expect(verified.principalId).toBe(principal.principalId);
    expect(verified.activeRole).toBe('INVESTIGATOR');
  });

  it('the same token FAILS against selfId EAPP — sideways-replay is rejected', async () => {
    const token = await minter.mint(principal, 'PVQ');
    await expect(verifyPrincipal(token, 'EAPP')).rejects.toBeInstanceOf(PrincipalRejected);
  });

  it('an expired token fails', async () => {
    const past = Math.floor(Date.now() / 1000) - 60;
    const expired = await new SignJWT({ principalId: principal.principalId })
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuedAt(past - 300)
      .setNotBefore(past - 300)
      .setExpirationTime(past)              // already elapsed
      .setAudience('PVQ')
      .sign(getSigningKey());
    await expect(verifyPrincipal(expired, 'PVQ')).rejects.toBeInstanceOf(PrincipalRejected);
  });

  it('a token signed with a DIFFERENT key fails', async () => {
    const { privateKey } = await generateKeyPairAsync('ed25519');
    const now = Math.floor(Date.now() / 1000);
    const forged = await new SignJWT({ principalId: principal.principalId })
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuedAt(now)
      .setExpirationTime(now + 300)
      .setAudience('PVQ')
      .sign(privateKey);
    await expect(verifyPrincipal(forged, 'PVQ')).rejects.toBeInstanceOf(PrincipalRejected);
  });

  it('the minted payload contains no caseAssignments key at any depth', async () => {
    const token = await minter.mint(principal, 'PVQ');
    const payload = decodeJwt(token);

    const hasKeyDeep = (value: unknown, key: string): boolean => {
      if (Array.isArray(value)) return value.some((v) => hasKeyDeep(v, key));
      if (value && typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>).some(
          ([k, v]) => k === key || hasKeyDeep(v, key),
        );
      }
      return false;
    };

    expect(hasKeyDeep(payload, 'caseAssignments')).toBe(false);
    // The allow-listed attributes ARE present.
    const attrs = (payload as { attributes?: Record<string, unknown> }).attributes;
    expect(attrs?.['organization']).toBe('DCSA-CONUS');
    expect(attrs?.['assignedRegion']).toBe('NORTHEAST');
  });

  it('two getSigningKey() calls with the same seed produce the same public key (determinism)', () => {
    _resetKeyCacheForTests();
    const pubA = getPublicKey().export({ format: 'der', type: 'spki' }).toString('hex');
    _resetKeyCacheForTests();
    const pubB = getPublicKey().export({ format: 'der', type: 'spki' }).toString('hex');
    expect(pubA).toBe(pubB);
  });
});
