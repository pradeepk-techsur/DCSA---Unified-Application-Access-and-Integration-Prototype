// @ual/assertions — the Ed25519 audience-bound principal assertion primitive.
// The hub mints; every spoke verifies. Trust is one-way and cryptographic, which
// is what makes SSO propagation a single trust rather than six login integrations.

export { getSigningKey, getPublicKey } from './keys.js';
export { AssertionMinter, mintOperatorToken } from './mint.js';
export { verifyPrincipal, PrincipalRejected } from './verify.js';
