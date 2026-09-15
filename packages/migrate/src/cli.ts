#!/usr/bin/env node
// @ual/migrate CLI.
//   node packages/migrate/dist/cli.js up      — apply pending migrations
//   node packages/migrate/dist/cli.js status  — list applied / pending

import { migrationStatus, runMigrations } from './runner.js';

async function main(): Promise<void> {
  const command = process.argv[2] ?? 'up';

  if (command === 'up') {
    const result = await runMigrations();
    console.log(
      `${result.applied.length} migrations applied, ${result.schemaCount} schemas, ${result.roleCount} roles`,
    );
    if (result.applied.length > 0) {
      console.log(`  applied: ${result.applied.join(', ')}`);
    }
    if (result.skipped.length > 0) {
      console.log(`  skipped (already applied): ${result.skipped.join(', ')}`);
    }
    return;
  }

  if (command === 'status') {
    const rows = await migrationStatus();
    for (const row of rows) {
      console.log(`${row.applied ? 'applied' : 'pending'}\t${row.filename}`);
    }
    return;
  }

  console.error(`Unknown command: ${command}. Usage: ual-migrate <up|status>`);
  process.exit(2);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
