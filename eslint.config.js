// @ual ESLint flat config.
//
// Architecture rule #1 (TechArch §1.3): hub core may import NEITHER an adapter
// package NOR an HTTP client. packages/adapter-* may only be imported by
// apps/hub/src/registry/ and packages/adapter-runtime/.
//
// The second architecture rule — the spoke-name-literal grep gate — is a shell
// script delivered by plan 01-06, not an ESLint rule.

import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.tsbuildinfo'],
  },
  ...tseslint.configs.recommended,
  {
    // hub core may import NEITHER an adapter package NOR an HTTP client.
    files: ['apps/hub/src/**/*.ts'],
    ignores: ['apps/hub/src/registry/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@ual/adapter-*'],
              message:
                'Hub core reaches spokes only through apps/hub/src/spoke-gateway. See TechArch 1.3.',
            },
            {
              group: ['undici', 'node-fetch', 'axios', 'got'],
              message:
                'No HTTP client in hub core. The adapter is the only path to a spoke (FR-F08a-01 AC-2).',
            },
          ],
        },
      ],
    },
  },
);
