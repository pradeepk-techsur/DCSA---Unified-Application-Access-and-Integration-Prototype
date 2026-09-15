// @ual/db — the pg pool factory.
//
// Persistence per TechArch §2.5: driver is `pg` (node-postgres), NO ORM
// (ADR-005), hand-written SQL only. The load-bearing property is that *each
// service constructs its pool with its OWN role's credentials*, so isolation is
// exercised on every query rather than asserted once (§2.5, ADR-004).
//
// createPool pins search_path to the single owning schema so a query that
// accidentally references another namespace fails to resolve rather than
// silently reaching across. This module has NO HTTP client dependency and MUST
// NOT gain one.

import pg from 'pg';

const { Pool } = pg;

export interface PoolOptions {
  /** Login role, e.g. 'pvq_service'. */
  role: string;
  /** The role's password. */
  password: string;
  /** The single schema this role owns, e.g. 'pvq'. Set as the ONLY search_path entry. */
  schema: string;
  host?: string;
  port?: number;
  database?: string;
}

/**
 * The seven service namespaces. Each maps 1:1 to a schema, a login role
 * (`<ns>_service`) and a `UAL_PW_<NS>` environment variable.
 */
export const NAMESPACES = ['hub', 'eapp', 'pvq', 'iep', 'pdt', 'im', 'cvs'] as const;
export type Namespace = (typeof NAMESPACES)[number];

/**
 * Construct a pg Pool for a single role scoped to a single schema.
 *
 * `options: '-c search_path=<schema>'` is passed at the connection level so the
 * schema is the only namespace resolvable on every session in the pool — the
 * isolation model is enforced by the connection, not by convention in queries.
 */
export function createPool(opts: PoolOptions): pg.Pool {
  const schema = opts.schema;
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) {
    // search_path is passed as a libpq connection option, so reject anything
    // that is not a bare identifier rather than risk an injected option string.
    throw new Error(`Invalid schema name for search_path: ${schema}`);
  }

  const config: pg.PoolConfig = {
    user: opts.role,
    password: opts.password,
    host: opts.host ?? process.env.PGHOST ?? 'localhost',
    port: opts.port ?? Number(process.env.UAL_DB_PORT ?? process.env.PGPORT ?? 5432),
    database: opts.database ?? process.env.POSTGRES_DB ?? 'ual',
    // The ONLY entry in search_path: cross-namespace references fail to resolve.
    options: `-c search_path=${schema}`,
  };

  return new Pool(config);
}

/**
 * Build a Pool for a namespace by reading its password from `UAL_PW_<NS>`.
 * The role name is `<ns>_service` and the schema is `<ns>` — the same 1:1
 * mapping the bootstrap grant matrix establishes.
 */
export function roleFor(namespace: Namespace, host?: string, port?: number): pg.Pool {
  const envKey = `UAL_PW_${namespace.toUpperCase()}`;
  const password = process.env[envKey];
  if (!password) {
    throw new Error(`Missing ${envKey} in environment for namespace '${namespace}'`);
  }
  const opts: PoolOptions = {
    role: `${namespace}_service`,
    password,
    schema: namespace,
  };
  if (host !== undefined) opts.host = host;
  if (port !== undefined) opts.port = port;
  return createPool(opts);
}
