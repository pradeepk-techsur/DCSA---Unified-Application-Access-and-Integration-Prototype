// ============================================================================
// tests/integration/isolation.spec.ts
//
// The automated PROOF of separation — success criterion 2 of Phase 1. This is
// the artifact that forecloses the suspicion of a shared database: rather than
// asserting isolation in prose, it introspects a REAL Postgres and exercises
// every service credential against every foreign schema.
//
// Implements the eight-row checklist from TechArch/04-data-model-spokes.md §4.9,
// adjusted for the Phase-1 table set (the hub.audit_events row is Phase 2/F13
// and is visibly deferred as test.todo rather than silently missing).
//
// Requires `docker compose up -d ual-db` reachable on the host at UAL_DB_PORT.
// Connection details and the seven UAL_PW_* passwords are read from process.env,
// which this suite loads from .env. Every failure message NAMES the offending
// object so a red run is diagnosable.
// ============================================================================

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pg from 'pg';

import { runMigrations } from '../../packages/migrate/src/runner.js';

const { Client, Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SQL_DIR = path.resolve(REPO_ROOT, 'packages', 'migrate', 'sql');

/** The seven namespaces. Each maps 1:1 to a schema and a `<ns>_service` role. */
const NAMESPACES = ['hub', 'eapp', 'pvq', 'iep', 'pdt', 'im', 'cvs'] as const;
type Namespace = (typeof NAMESPACES)[number];
const SPOKE_NAMESPACES: Namespace[] = ['eapp', 'pvq', 'iep', 'pdt', 'im', 'cvs'];

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
    port: Number(process.env.UAL_DB_PORT ?? process.env.PGPORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'ual',
    user: process.env.POSTGRES_USER ?? 'ual_owner',
    password: process.env.POSTGRES_PASSWORD,
  });
}

/** One pool per service role, scoped to that role's own schema on search_path. */
function poolForRole(ns: Namespace): pg.Pool {
  const password = process.env[`UAL_PW_${ns.toUpperCase()}`];
  if (!password) throw new Error(`Missing UAL_PW_${ns.toUpperCase()} in environment`);
  return new Pool({
    user: `${ns}_service`,
    password,
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.UAL_DB_PORT ?? process.env.PGPORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'ual',
    options: `-c search_path=${ns}`,
    max: 2,
  });
}

const rolePools = new Map<Namespace, pg.Pool>();

/**
 * A representative table in each schema, referenced by its fully-qualified name
 * so a probe from a foreign role must cross the schema boundary to reach it.
 */
const PROBE_TABLE: Record<Namespace, string> = {
  hub: 'hub.registered_applications',
  eapp: 'eapp.cases',
  pvq: 'pvq.issues',
  iep: 'iep.individuals',
  pdt: 'pdt.designations',
  im: 'im.investigations',
  cvs: 'cvs.alerts',
};

beforeAll(async () => {
  await loadDotEnv();
  // Idempotent: applies nothing if the schema is already migrated, and rebuilds
  // it if a sibling suite (e.g. runner.spec.ts) dropped it. Ordering between
  // suites therefore does not matter — this suite is self-sufficient.
  await runMigrations(SQL_DIR);
  for (const ns of NAMESPACES) rolePools.set(ns, poolForRole(ns));
}, 60_000);

afterAll(async () => {
  await Promise.all([...rolePools.values()].map((p) => p.end()));
});

describe('isolation — the proof of separation (TechArch §4.9)', () => {
  // -- 1 -------------------------------------------------------------------
  it('has no cross-schema foreign key anywhere in the database', async () => {
    const client = ownerClient();
    await client.connect();
    try {
      const { rows } = await client.query<{
        constraint_name: string;
        constrained_schema: string;
        referenced_schema: string;
      }>(`
        SELECT tc.constraint_name        AS constraint_name,
               tc.table_schema           AS constrained_schema,
               ccu.table_schema          AS referenced_schema
          FROM information_schema.table_constraints tc
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
           AND ccu.constraint_schema = tc.constraint_schema
         WHERE tc.constraint_type = 'FOREIGN KEY'
           AND tc.table_schema IN ('hub','eapp','pvq','iep','pdt','im','cvs')
           AND tc.table_schema <> ccu.table_schema
      `);
      const violations = rows.map(
        (r) =>
          `${r.constraint_name}: ${r.constrained_schema} -> ${r.referenced_schema}`,
      );
      expect(violations, `cross-schema foreign keys found: ${violations.join('; ')}`).toEqual(
        [],
      );
    } finally {
      await client.end();
    }
  });

  // -- 2 -------------------------------------------------------------------
  it('shares no domain table name across two schemas', async () => {
    const client = ownerClient();
    await client.connect();
    try {
      const { rows } = await client.query<{ table_schema: string; table_name: string }>(`
        SELECT table_schema, table_name
          FROM information_schema.tables
         WHERE table_schema IN ('hub','eapp','pvq','iep','pdt','im','cvs')
           AND table_type = 'BASE TABLE'
      `);
      // The only names permitted to repeat are the per-namespace operational
      // tables and the per-namespace activity tables — each holds its OWN
      // service's data, so a repeated name is not a shared table.
      const allowedRepeats = new Set([
        'idempotency_records',
        'injection_state',
        'schema_migrations',
        'case_activity',
        'issue_activity',
        'iep_activity',
        'designation_activity',
        'im_activity',
        'alert_activity',
      ]);
      const byName = new Map<string, string[]>();
      for (const r of rows) {
        if (allowedRepeats.has(r.table_name)) continue;
        const schemas = byName.get(r.table_name) ?? [];
        schemas.push(r.table_schema);
        byName.set(r.table_name, schemas);
      }
      const shared = [...byName.entries()]
        .filter(([, schemas]) => schemas.length > 1)
        .map(([name, schemas]) => `${name} in {${schemas.join(', ')}}`);
      expect(shared, `domain table names shared across schemas: ${shared.join('; ')}`).toEqual(
        [],
      );
    } finally {
      await client.end();
    }
  });

  // -- 3 -------------------------------------------------------------------
  it('denies every one of the 42 cross-schema reads with SQLSTATE 42501', async () => {
    const failures: string[] = [];
    let probeCount = 0;
    for (const role of NAMESPACES) {
      const pool = rolePools.get(role)!;
      for (const foreign of NAMESPACES) {
        if (foreign === role) continue; // own schema is not a cross-schema probe
        probeCount += 1;
        const target = PROBE_TABLE[foreign];
        try {
          await pool.query(`SELECT 1 FROM ${target} LIMIT 1`);
          // A read that SUCCEEDS is the failure we are hunting for.
          failures.push(`${role}_service could read ${target} (expected 42501)`);
        } catch (err) {
          const code = (err as { code?: string }).code;
          if (code !== '42501') {
            failures.push(
              `${role}_service reading ${target} raised ${code ?? 'unknown'}, expected 42501`,
            );
          }
        }
      }
    }
    expect(probeCount, 'expected exactly 42 cross-schema probes (7 roles x 6 foreign schemas)').toBe(
      42,
    );
    expect(failures, `cross-schema probe failures: ${failures.join('; ')}`).toEqual([]);
  });

  // -- 4 -------------------------------------------------------------------
  it('grants the hub no USAGE on any spoke schema', async () => {
    const client = ownerClient();
    await client.connect();
    try {
      const offenders: string[] = [];
      for (const ns of SPOKE_NAMESPACES) {
        const { rows } = await client.query<{ has: boolean }>(
          `SELECT has_schema_privilege('hub_service', $1, 'USAGE') AS has`,
          [ns],
        );
        if (rows[0]?.has) offenders.push(`hub_service has USAGE on ${ns}`);
      }
      expect(offenders, offenders.join('; ')).toEqual([]);
    } finally {
      await client.end();
    }
  });

  // -- 5 -------------------------------------------------------------------
  it('gives no spoke package an HTTP client with which to call another spoke', async () => {
    const HTTP_CLIENTS = ['undici', 'node-fetch', 'axios', 'got', 'superagent'];
    const candidates = [
      path.join(REPO_ROOT, 'packages', 'spoke-kit', 'package.json'),
    ];
    // In Phase 1 the services/* directories are created by plan 01-04; if absent
    // the assertion passes vacuously. Discover any that already exist.
    const servicesDir = path.join(REPO_ROOT, 'services');
    let serviceEntries: string[] = [];
    try {
      serviceEntries = await readdir(servicesDir);
    } catch {
      serviceEntries = [];
    }
    for (const entry of serviceEntries) {
      candidates.push(path.join(servicesDir, entry, 'package.json'));
    }

    const offenders: string[] = [];
    let inspected = 0;
    for (const pkgPath of candidates) {
      let raw: string;
      try {
        raw = await readFile(pkgPath, 'utf8');
      } catch {
        continue; // package.json absent — nothing to inspect yet
      }
      inspected += 1;
      const pkg = JSON.parse(raw) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      for (const client of HTTP_CLIENTS) {
        if (client in deps) offenders.push(`${pkgPath} depends on HTTP client '${client}'`);
      }
    }
    if (inspected === 0) {
      // eslint-disable-next-line no-console
      console.warn(
        'isolation §4.9 row 5: no spoke packages exist yet (services/* land in 01-04) — assertion passes vacuously',
      );
    }
    expect(offenders, offenders.join('; ')).toEqual([]);
  });

  // Runtime traffic assertion (no spoke->spoke connection observed during the
  // E2E run) is deferred to plan 01-07's end-to-end run.
  it.todo('observes zero spoke->spoke network connections during the E2E run — plan 01-07');

  // -- 6 -------------------------------------------------------------------
  it('leaves every cross-system reference an unconstrained (or intra-schema-only) string', async () => {
    // CROSS-system reference columns. Each must carry no foreign key that leaves
    // its own schema. `eapp.cases.subject_ref` is the one nuance the plan calls
    // out: it DOES carry an intra-schema FK to eapp.subjects, which is expected
    // and correct — the property under test is "no FK crosses a schema
    // boundary", so `intraSchemaOk` marks the columns where an intra-schema FK
    // is legitimate. Every other column here must carry NO foreign key at all.
    const crossSystemColumns: Array<{
      schema: string;
      table: string;
      column: string;
      intraSchemaOk?: boolean;
    }> = [
      { schema: 'eapp', table: 'cases', column: 'subject_ref', intraSchemaOk: true },
      { schema: 'eapp', table: 'cases', column: 'outstanding_issue_refs' },
      { schema: 'eapp', table: 'cases', column: 'pdt_designation_ref' },
      { schema: 'eapp', table: 'cases', column: 'im_assignment_ref' },
      { schema: 'pvq', table: 'issues', column: 'subject_ref' },
      { schema: 'pvq', table: 'issues', column: 'parent_case_ref' },
      { schema: 'pdt', table: 'designations', column: 'subject_ref' },
      { schema: 'pdt', table: 'designations', column: 'eapp_case_ref' },
      { schema: 'im', table: 'investigations', column: 'subject_ref' },
      { schema: 'im', table: 'investigations', column: 'eapp_case_ref' },
      { schema: 'cvs', table: 'alerts', column: 'subject_ref' },
    ];
    const client = ownerClient();
    await client.connect();
    try {
      const offenders: string[] = [];
      for (const { schema, table, column, intraSchemaOk } of crossSystemColumns) {
        // Return each FK on this column together with the schema it references,
        // so we can distinguish an intra-schema FK from a boundary-crossing one.
        const { rows } = await client.query<{ referenced_schema: string }>(
          `
          SELECT rn.nspname AS referenced_schema
            FROM pg_constraint c
            JOIN pg_class t       ON t.oid = c.conrelid
            JOIN pg_namespace tn  ON tn.oid = t.relnamespace
            JOIN pg_class r       ON r.oid = c.confrelid
            JOIN pg_namespace rn  ON rn.oid = r.relnamespace
            JOIN pg_attribute a   ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
           WHERE c.contype = 'f'
             AND tn.nspname = $1
             AND t.relname  = $2
             AND a.attname  = $3
          `,
          [schema, table, column],
        );
        for (const { referenced_schema } of rows) {
          const crossesBoundary = referenced_schema !== schema;
          if (crossesBoundary) {
            offenders.push(
              `${schema}.${table}.${column} has a CROSS-schema FK -> ${referenced_schema}`,
            );
          } else if (!intraSchemaOk) {
            offenders.push(
              `${schema}.${table}.${column} is unexpectedly constrained by a foreign key`,
            );
          }
        }
      }
      expect(offenders, offenders.join('; ')).toEqual([]);
    } finally {
      await client.end();
    }
  });

  // -- 7 -------------------------------------------------------------------
  // hub.audit_events is Phase 2 (F13). The append-only grant proof (UPDATE as
  // hub_service must raise 42501) lands with that table.
  it.todo('hub.audit_events append-only grant — Phase 2, F13');

  // -- 8 -------------------------------------------------------------------
  it('carries a synthetic marker on every record of every marked domain table', async () => {
    const client = ownerClient();
    await client.connect();
    try {
      // Every domain table that actually has a synthetic_marker column.
      const { rows: marked } = await client.query<{ table_schema: string; table_name: string }>(`
        SELECT table_schema, table_name
          FROM information_schema.columns
         WHERE column_name = 'synthetic_marker'
           AND table_schema IN ('hub','eapp','pvq','iep','pdt','im','cvs')
      `);
      const offenders: string[] = [];
      for (const { table_schema, table_name } of marked) {
        const { rows } = await client.query<{ n: string }>(
          `SELECT count(*)::text AS n FROM "${table_schema}"."${table_name}"
             WHERE synthetic_marker IS DISTINCT FROM 'DEMO-SYNTHETIC'`,
        );
        const n = Number(rows[0]?.n ?? 0);
        if (n > 0) {
          offenders.push(`${table_schema}.${table_name} has ${n} row(s) without the synthetic marker`);
        }
      }
      // On an unseeded database this passes vacuously; plan 01-05 makes it
      // meaningful once the corpus is loaded.
      expect(offenders, offenders.join('; ')).toEqual([]);
    } finally {
      await client.end();
    }
  });
});
