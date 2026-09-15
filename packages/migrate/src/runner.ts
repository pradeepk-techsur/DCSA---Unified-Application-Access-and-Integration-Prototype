// @ual/migrate — the numbered-SQL migration runner (TechArch §2.5).
//
// - Reads packages/migrate/sql/*.sql in FILENAME order.
// - Connects as the database OWNER (POSTGRES_USER/POSTGRES_PASSWORD) — the owner
//   credential is used ONLY here, never by a service pool.
// - Applies ONE transaction per file; records {filename, checksum, applied_at}
//   in hub.schema_migrations.
// - Skips a file already recorded with a matching sha256 checksum. If the
//   filename is recorded but the checksum differs, aborts non-zero: a mutated
//   applied migration is how a demo database silently diverges from the schema.
// - Supports psql-style :'var' substitution for the seven role passwords,
//   sourced from UAL_PW_* — no password literal ever lives in the SQL file.

import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dist/runner.js -> ../sql at package root (sql/ sits beside src/, not in dist/).
const DEFAULT_SQL_DIR = path.resolve(__dirname, '..', 'sql');

/**
 * The fixed allow-list of substitution tokens. Every `:'<ns>_pw'` in a SQL file
 * maps to exactly one UAL_PW_<NS> environment variable. Nothing outside this map
 * is ever substituted, so no user-supplied string can reach the SQL text.
 */
const PW_NAMESPACES = ['hub', 'eapp', 'pvq', 'iep', 'pdt', 'im', 'cvs'] as const;

export interface MigrationFile {
  filename: string;
  checksum: string;
  sql: string;
}

export interface MigrationStatusRow {
  filename: string;
  applied: boolean;
}

export interface RunResult {
  applied: string[];
  skipped: string[];
  schemaCount: number;
  roleCount: number;
}

function sha256(buf: Buffer | string): string {
  return createHash('sha256').update(buf).digest('hex');
}

/** PostgreSQL single-quoted string literal quoting: double any embedded quote. */
function quoteLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Substitute psql-style :'<ns>_pw' tokens with the quoted value of UAL_PW_<NS>.
 * Only the fixed allow-list is honoured; an unknown token is an error rather
 * than a silent pass-through.
 */
export function substituteVars(sql: string, env: NodeJS.ProcessEnv = process.env): string {
  return sql.replace(/:'([a-z_]+)_pw'/g, (match, ns: string) => {
    if (!(PW_NAMESPACES as readonly string[]).includes(ns)) {
      throw new Error(`Unknown migration variable ${match}: no such namespace '${ns}'`);
    }
    const envKey = `UAL_PW_${ns.toUpperCase()}`;
    const value = env[envKey];
    if (!value) {
      throw new Error(`Missing ${envKey} in environment (required by migration token ${match})`);
    }
    return quoteLiteral(value);
  });
}

/** Read and checksum every *.sql file in the directory, in filename order. */
export async function loadMigrations(sqlDir: string = DEFAULT_SQL_DIR): Promise<MigrationFile[]> {
  const entries = (await readdir(sqlDir)).filter((f) => f.endsWith('.sql')).sort();
  const files: MigrationFile[] = [];
  for (const filename of entries) {
    const bytes = await readFile(path.join(sqlDir, filename));
    files.push({ filename, checksum: sha256(bytes), sql: bytes.toString('utf8') });
  }
  return files;
}

function ownerClient(): pg.Client {
  return new Client({
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.UAL_DB_PORT ?? process.env.PGPORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'ual',
    user: process.env.POSTGRES_USER ?? 'ual_owner',
    password: process.env.POSTGRES_PASSWORD,
  });
}

/**
 * Whether hub.schema_migrations exists yet. On the very first run it does not —
 * the 000 bootstrap migration is what creates it — so we must not pre-create it
 * (that would collide with 000's own `CREATE TABLE`). We read prior checksums
 * only once the table is present.
 */
async function bookkeepingExists(client: pg.Client): Promise<boolean> {
  const { rows } = await client.query<{ present: boolean }>(
    `SELECT to_regclass('hub.schema_migrations') IS NOT NULL AS present`,
  );
  return rows[0]?.present ?? false;
}

async function recordedChecksums(client: pg.Client): Promise<Map<string, string>> {
  if (!(await bookkeepingExists(client))) {
    return new Map();
  }
  const { rows } = await client.query<{ filename: string; checksum: string }>(
    'SELECT filename, checksum FROM hub.schema_migrations',
  );
  return new Map(rows.map((r) => [r.filename, r.checksum]));
}

async function countSchemas(client: pg.Client): Promise<number> {
  const { rows } = await client.query<{ n: string }>(
    `SELECT count(*)::text AS n FROM information_schema.schemata
       WHERE schema_name IN ('hub','eapp','pvq','iep','pdt','im','cvs')`,
  );
  return Number(rows[0]?.n ?? 0);
}

async function countRoles(client: pg.Client): Promise<number> {
  const { rows } = await client.query<{ n: string }>(
    `SELECT count(*)::text AS n FROM pg_roles
       WHERE rolcanlogin AND rolname IN
         ('hub_service','eapp_service','pvq_service','iep_service','pdt_service','im_service','cvs_service')`,
  );
  return Number(rows[0]?.n ?? 0);
}

/**
 * Apply all pending migrations. Idempotent by checksum; aborts (throws) if an
 * already-applied file's bytes have changed.
 */
export async function runMigrations(sqlDir: string = DEFAULT_SQL_DIR): Promise<RunResult> {
  const files = await loadMigrations(sqlDir);
  const client = ownerClient();
  await client.connect();
  const applied: string[] = [];
  const skipped: string[] = [];
  try {
    const recorded = await recordedChecksums(client);

    for (const file of files) {
      const priorChecksum = recorded.get(file.filename);
      if (priorChecksum !== undefined) {
        if (priorChecksum !== file.checksum) {
          throw new Error(
            `Migration ${file.filename} changed after it was applied (checksum mismatch). ` +
              `Migrations are immutable.`,
          );
        }
        skipped.push(file.filename);
        continue;
      }

      const substituted = substituteVars(file.sql);
      await client.query('BEGIN');
      try {
        await client.query(substituted);
        await client.query(
          'INSERT INTO hub.schema_migrations (filename, checksum) VALUES ($1, $2)',
          [file.filename, file.checksum],
        );
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
      applied.push(file.filename);
    }

    const schemaCount = await countSchemas(client);
    const roleCount = await countRoles(client);
    return { applied, skipped, schemaCount, roleCount };
  } finally {
    await client.end();
  }
}

/** List each migration file and whether it is already applied. */
export async function migrationStatus(
  sqlDir: string = DEFAULT_SQL_DIR,
): Promise<MigrationStatusRow[]> {
  const files = await loadMigrations(sqlDir);
  const client = ownerClient();
  await client.connect();
  try {
    const recorded = await recordedChecksums(client);
    return files.map((f) => ({ filename: f.filename, applied: recorded.has(f.filename) }));
  } finally {
    await client.end();
  }
}
