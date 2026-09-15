-- ============================================================================
-- 030_hub_registry.sql — the table that makes a sixth application configuration
-- Copied verbatim from TechArch/03-data-model-hub.md §3.5.
--
-- DELIBERATE OMISSION: hub.application_registration_drafts (also §3.5) references
-- hub.sessions, which Phase 2 creates. It is omitted here and created in Phase 7
-- (F12, live registration) alongside the wizard that uses it. Its absence is
-- intentional, not forgotten.
-- ============================================================================

CREATE TABLE hub.registered_applications (
  application_id             VARCHAR(16)  PRIMARY KEY
                               CHECK (application_id ~ '^[A-Z][A-Z0-9_]{1,15}$'),
  display_name               VARCHAR(60)  NOT NULL UNIQUE,
  description                VARCHAR(500) NULL,
  adapter_type               VARCHAR(32)  NOT NULL,          -- 'REST_JSON_V1'
  base_endpoint              VARCHAR(512) NOT NULL,
  health_endpoint            VARCHAR(512) NOT NULL,
  contract_version           VARCHAR(16)  NOT NULL,
  work_item_types            JSONB        NOT NULL,
  supported_actions          JSONB        NOT NULL,
  capabilities               JSONB        NOT NULL,
  visible_to_roles           JSONB        NOT NULL,
  relationship_types_emitted JSONB        NOT NULL DEFAULT '[]',
  icon_token                 VARCHAR(64)  NOT NULL,          -- token name, never a color/URL
  timeout_ms                 INTEGER      NOT NULL DEFAULT 5000
                               CHECK (timeout_ms BETWEEN 500 AND 30000),
  action_timeout_ms          INTEGER      NOT NULL DEFAULT 10000
                               CHECK (action_timeout_ms BETWEEN 1000 AND 30000),
  health_timeout_ms          INTEGER      NOT NULL DEFAULT 2000
                               CHECK (health_timeout_ms BETWEEN 500 AND 10000),
  max_retries                SMALLINT     NOT NULL DEFAULT 2
                               CHECK (max_retries BETWEEN 0 AND 5),
  backoff_initial_ms         INTEGER      NOT NULL DEFAULT 200
                               CHECK (backoff_initial_ms BETWEEN 50 AND 5000),
  backoff_multiplier         NUMERIC(3,1) NOT NULL DEFAULT 2.0
                               CHECK (backoff_multiplier BETWEEN 1.0 AND 4.0),
  backoff_jitter_pct         SMALLINT     NOT NULL DEFAULT 20
                               CHECK (backoff_jitter_pct BETWEEN 0 AND 50),
  circuit_failure_threshold  SMALLINT     NOT NULL DEFAULT 5
                               CHECK (circuit_failure_threshold BETWEEN 2 AND 50),
  circuit_open_ms            INTEGER      NOT NULL DEFAULT 30000
                               CHECK (circuit_open_ms BETWEEN 5000 AND 300000),
  circuit_half_open_probes   SMALLINT     NOT NULL DEFAULT 1
                               CHECK (circuit_half_open_probes BETWEEN 1 AND 5),
  health_probe_interval_sec  INTEGER      NOT NULL DEFAULT 30
                               CHECK (health_probe_interval_sec BETWEEN 10 AND 600),
  degraded_latency_ms        INTEGER      NOT NULL DEFAULT 1500,
  enabled                    BOOLEAN      NOT NULL DEFAULT TRUE,
  config_state               VARCHAR(16)  NOT NULL DEFAULT 'VALID'
                               CHECK (config_state IN ('VALID','INVALID','INCOMPATIBLE')),
  config_problem             VARCHAR(500) NULL,
  is_demo_sixth_app          BOOLEAN      NOT NULL DEFAULT FALSE,
  last_describe_at           TIMESTAMPTZ  NULL,
  last_describe_payload      JSONB        NULL,
  registered_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  registered_by              VARCHAR(26)  NOT NULL REFERENCES hub.users(principal_id),
  updated_at                 TIMESTAMPTZ  NULL,
  updated_by                 VARCHAR(26)  NULL,
  CHECK (jsonb_typeof(visible_to_roles) = 'array' AND jsonb_array_length(visible_to_roles) >= 1)
);
CREATE INDEX ix_reg_apps_enabled ON hub.registered_applications(enabled, config_state);
CREATE INDEX ix_reg_apps_roles   ON hub.registered_applications USING GIN (visible_to_roles);

-- IDs are never reused: audit records and workItemIds refer to them forever.
CREATE TABLE hub.retired_application_ids (
  application_id VARCHAR(16) PRIMARY KEY,
  display_name   VARCHAR(60) NOT NULL,
  retired_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  retired_by     VARCHAR(26) NOT NULL
);

-- Single row by construction, so a client polls one value instead of diffing a list.
CREATE TABLE hub.registry_version (
  id         SMALLINT    PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  version    BIGINT      NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the single registry_version row so it exists by construction.
INSERT INTO hub.registry_version (id, version) VALUES (1, 1);
