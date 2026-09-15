// Integration test for @ual/migrate against a REAL Postgres.
//
// Requires `docker compose up -d ual-db` running and reachable on the host at
// the port declared in .env (UAL_DB_PORT). Connection details and the seven
// UAL_PW_* passwords are read from process.env, which the test loads from .env.

import { createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pg from 'pg';

import { runMigrations } from '../src/runner.js';

const { Client } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const CANONICAL_SQL_DIR = path.resolve(__dirname, '..', 'sql');

/** Minimal .env loader — no dependency, just KEY=VALUE lines. */
async function loadDotEnv(): Promise<void> {
  const envPath = path.join(REPO_ROOT, '.env');
  const text = await readFile(envPath, 'utf8');
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    // Strip trailing inline comments and surrounding whitespace.
    let value = line.slice(eq + 1);
    const hash = value.indexOf(' #');
    if (hash !== -1) value = value.slice(0, hash);
    value = value.trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function ownerClient(): pg.Client {
  return new Client({
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.UAL_DB_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'ual',
    user: process.env.POSTGRES_USER ?? 'ual_owner',
    password: process.env.POSTGRES_PASSWORD,
  });
}

/** Drop everything this suite creates so it can be run repeatedly. */
async function resetDatabase(): Promise<void> {
  const client = ownerClient();
  await client.connect();
  try {
    for (const ns of ['hub', 'eapp', 'pvq', 'iep', 'pdt', 'im', 'cvs']) {
      await client.query(`DROP SCHEMA IF EXISTS ${ns} CASCADE`);
    }
    for (const ns of ['hub', 'eapp', 'pvq', 'iep', 'pdt', 'im', 'cvs']) {
      const role = `${ns}_service`;
      // A role cannot be dropped while it still holds grants (e.g. CONNECT on
      // the database). DROP OWNED BY clears those dependencies first.
      const { rows } = await client.query<{ present: boolean }>(
        'SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname = $1) AS present',
        [role],
      );
      if (rows[0]?.present) {
        await client.query(`DROP OWNED BY ${role} CASCADE`);
        await client.query(`DROP ROLE ${role}`);
      }
    }
  } finally {
    await client.end();
  }
}

/** Copy the canonical sql/ into a temp dir so a tampering test can mutate it. */
async function scratchSqlDir(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'ual-migrate-'));
  for (const f of await readdir(CANONICAL_SQL_DIR)) {
    if (f.endsWith('.sql')) {
      await copyFile(path.join(CANONICAL_SQL_DIR, f), path.join(dir, f));
    }
  }
  return dir;
}

beforeAll(async () => {
  await loadDotEnv();
  await resetDatabase();
});

afterAll(async () => {
  await resetDatabase();
});

describe('@ual/migrate runner', () => {
  it('applies migrations, is idempotent, and creates 7 schemas + 7 login roles', async () => {
    const first = await runMigrations(CANONICAL_SQL_DIR);
    expect(first.applied).toContain('000_bootstrap.sql');
    expect(first.schemaCount).toBe(7);
    expect(first.roleCount).toBe(7);

    // A second run applies nothing (idempotence) and row count is unchanged.
    const client = ownerClient();
    await client.connect();
    let countAfterFirst: number;
    try {
      const r = await client.query<{ n: string }>(
        'SELECT count(*)::text AS n FROM hub.schema_migrations',
      );
      countAfterFirst = Number(r.rows[0]?.n ?? -1);
    } finally {
      await client.end();
    }

    const second = await runMigrations(CANONICAL_SQL_DIR);
    expect(second.applied).toHaveLength(0);
    expect(second.skipped).toContain('000_bootstrap.sql');

    const client2 = ownerClient();
    await client2.connect();
    try {
      const r = await client2.query<{ n: string }>(
        'SELECT count(*)::text AS n FROM hub.schema_migrations',
      );
      expect(Number(r.rows[0]?.n ?? -1)).toBe(countAfterFirst);
    } finally {
      await client2.end();
    }
  });

  it('aborts non-zero with a checksum message when an applied file is mutated', async () => {
    // Reset then apply from a scratch dir we can then tamper with.
    await resetDatabase();
    const dir = await scratchSqlDir();
    await runMigrations(dir);

    // Mutate the already-applied file's bytes (a trailing comment shifts sha256).
    const file = path.join(dir, '000_bootstrap.sql');
    const original = await readFile(file, 'utf8');
    const tampered = `${original}\n-- tampered ${Date.now()}\n`;
    await writeFile(file, tampered);
    expect(createHash('sha256').update(tampered).digest('hex')).not.toBe(
      createHash('sha256').update(original).digest('hex'),
    );

    await expect(runMigrations(dir)).rejects.toThrow(/checksum mismatch/i);
  });
});
