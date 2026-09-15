// @ual/adapter-contract — the compiler-checked hub↔spoke interface.
// Types plus one error class. This package has ZERO runtime dependencies and must
// never gain an HTTP client, a database driver, or a validation library.

export * from './types.js';
export * from './describe.js';
export * from './errors.js';
export * from './adapter.js';
export * from './registry.js';
