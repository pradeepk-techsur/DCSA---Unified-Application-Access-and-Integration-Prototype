// packages/assertions/src/keys.ts
//
// A DETERMINISTIC Ed25519 keypair derived from UAL_ASSERTION_KEY_SEED.
//
// Determinism is load-bearing: the hub mints and the spokes verify in separate
// processes, and `./run.sh reset` must not invalidate a token mid-demo. An
// Ed25519 private key IS its 32-byte seed, so we take sha256(seed) as those 32
// bytes and wrap them in the fixed PKCS#8 prefix RFC 8410 defines for
// Ed25519. The same input seed therefore always yields the same keypair.

import { createHash, createPrivateKey, createPublicKey, type KeyObject } from 'node:crypto';

// RFC 8410 §7 — the fixed PKCS#8 DER prefix for an Ed25519 private key, followed
// by the 32-byte raw seed. 0x2e total length; 0x04 0x22 introduces the 34-byte
// OCTET STRING whose payload is another OCTET STRING (0x04 0x20) of 32 bytes.
const PKCS8_ED25519_PREFIX = Buffer.from(
  '302e020100300506032b657004220420',
  'hex',
);

const ENV_VAR = 'UAL_ASSERTION_KEY_SEED';

function seedBytes(): Buffer {
  const seed = process.env[ENV_VAR];
  if (!seed) {
    throw new Error(
      `${ENV_VAR} is not set. The hub cannot mint or verify principal assertions without it.`,
    );
  }
  // sha256 collapses any seed string to the exact 32 bytes Ed25519 requires.
  return createHash('sha256').update(seed, 'utf8').digest();
}

function derivePrivateKey(): KeyObject {
  const pkcs8 = Buffer.concat([PKCS8_ED25519_PREFIX, seedBytes()]);
  return createPrivateKey({ key: pkcs8, format: 'der', type: 'pkcs8' });
}

let cachedPrivate: KeyObject | undefined;
let cachedPublic: KeyObject | undefined;

/** The hub's Ed25519 signing key. Only the hub (the minter) ever holds this. */
export function getSigningKey(): KeyObject {
  cachedPrivate ??= derivePrivateKey();
  return cachedPrivate;
}

/** The Ed25519 public key every spoke uses to verify a hub-minted assertion. */
export function getPublicKey(): KeyObject {
  cachedPublic ??= createPublicKey(getSigningKey());
  return cachedPublic;
}

/**
 * Test-only: drop the memoized keys so a changed seed re-derives. Production code
 * never calls this; the seed is fixed for the life of a process.
 */
export function _resetKeyCacheForTests(): void {
  cachedPrivate = undefined;
  cachedPublic = undefined;
}
