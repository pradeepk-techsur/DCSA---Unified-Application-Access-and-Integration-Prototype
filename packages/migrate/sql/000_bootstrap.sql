-- ============================================================================
-- 000_bootstrap.sql — namespaces, roles, and the grants that ARE the isolation
-- Run once, as the database owner, before any table is created.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS hub;
CREATE SCHEMA IF NOT EXISTS eapp;
CREATE SCHEMA IF NOT EXISTS pvq;
CREATE SCHEMA IF NOT EXISTS iep;
CREATE SCHEMA IF NOT EXISTS pdt;
CREATE SCHEMA IF NOT EXISTS im;
CREATE SCHEMA IF NOT EXISTS cvs;

CREATE ROLE hub_service  LOGIN PASSWORD :'hub_pw'  NOINHERIT;
CREATE ROLE eapp_service LOGIN PASSWORD :'eapp_pw' NOINHERIT;
CREATE ROLE pvq_service  LOGIN PASSWORD :'pvq_pw'  NOINHERIT;
CREATE ROLE iep_service  LOGIN PASSWORD :'iep_pw'  NOINHERIT;
CREATE ROLE pdt_service  LOGIN PASSWORD :'pdt_pw'  NOINHERIT;
CREATE ROLE im_service   LOGIN PASSWORD :'im_pw'   NOINHERIT;
CREATE ROLE cvs_service  LOGIN PASSWORD :'cvs_pw'  NOINHERIT;

-- Nobody gets anything by default.
REVOKE ALL ON SCHEMA hub, eapp, pvq, iep, pdt, im, cvs FROM PUBLIC;
REVOKE ALL ON DATABASE ual FROM PUBLIC;
GRANT CONNECT ON DATABASE ual TO
  hub_service, eapp_service, pvq_service, iep_service, pdt_service, im_service, cvs_service;

-- Exactly one schema per role. This loop is the whole isolation model.
GRANT USAGE ON SCHEMA hub  TO hub_service;
GRANT USAGE ON SCHEMA eapp TO eapp_service;
GRANT USAGE ON SCHEMA pvq  TO pvq_service;
GRANT USAGE ON SCHEMA iep  TO iep_service;
GRANT USAGE ON SCHEMA pdt  TO pdt_service;
GRANT USAGE ON SCHEMA im   TO im_service;
GRANT USAGE ON SCHEMA cvs  TO cvs_service;

-- Table privileges follow, applied per schema after its tables exist:
--   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA <ns> TO <ns>_service;
--   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA <ns> TO <ns>_service;
-- with the single, deliberate exception of hub.audit_events (see 999_grants.sql).

-- Explicit denial, stated rather than implied, so a reviewer can read the intent:
REVOKE ALL ON SCHEMA hub  FROM eapp_service, pvq_service, iep_service,
                               pdt_service, im_service, cvs_service;
REVOKE ALL ON SCHEMA eapp FROM hub_service, pvq_service, iep_service,
                               pdt_service, im_service, cvs_service;
REVOKE ALL ON SCHEMA pvq  FROM hub_service, eapp_service, iep_service,
                               pdt_service, im_service, cvs_service;
REVOKE ALL ON SCHEMA iep  FROM hub_service, eapp_service, pvq_service,
                               pdt_service, im_service, cvs_service;
REVOKE ALL ON SCHEMA pdt  FROM hub_service, eapp_service, pvq_service,
                               iep_service, im_service, cvs_service;
REVOKE ALL ON SCHEMA im   FROM hub_service, eapp_service, pvq_service,
                               iep_service, pdt_service, cvs_service;
REVOKE ALL ON SCHEMA cvs  FROM hub_service, eapp_service, pvq_service,
                               iep_service, pdt_service, im_service;

-- Migration bookkeeping (owner-only).
CREATE TABLE hub.schema_migrations (
  filename    VARCHAR(160) PRIMARY KEY,
  checksum    VARCHAR(64)  NOT NULL,
  applied_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
