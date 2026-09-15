import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: ['**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 30000,
    pool: 'forks',
    sequence: { concurrent: false },
    // Integration suites mutate a single shared Postgres (schemas/roles are
    // created and dropped in setup/teardown). Running spec files in parallel
    // forks races those mutations — one suite drops hub.schema_migrations while
    // another is mid-migration. Serialise file execution so DB-backed suites do
    // not clobber each other.
    fileParallelism: false,
  },
});
