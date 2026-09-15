-- ============================================================================
-- 040_hub_health.sql — health state and the append-only integration issue log
-- Copied verbatim from TechArch/03-data-model-hub.md §3.6 (health subset).
--
-- PHASE BOUNDARY. hub.audit_events and hub.audit_action_types (also §3.6) are
-- Phase 2 (F13) and are deliberately omitted here.
--
-- Why these three tables are Phase 1: FR-F08b-05 rule 2 requires every
-- AdapterError (except ADAPTER_NOT_FOUND and ADAPTER_REJECTED) to insert one
-- hub.integration_issues row — adapter-runtime behavior delivered in plan 01-03.
-- hub.application_health is where the circuit state machine persists (TechArch
-- §5.2). The health monitor loop and the admin console are Phase 6.
-- ============================================================================

CREATE TABLE hub.application_health (
  application_id       VARCHAR(16) PRIMARY KEY
                         REFERENCES hub.registered_applications(application_id) ON DELETE CASCADE,
  status               VARCHAR(12) NOT NULL CHECK (status IN ('HEALTHY','DEGRADED','DOWN')),
  latency_ms           INTEGER     NULL,
  last_checked_at      TIMESTAMPTZ NULL,
  last_success_at      TIMESTAMPTZ NULL,
  consecutive_failures SMALLINT    NOT NULL DEFAULT 0,
  circuit_state        VARCHAR(12) NOT NULL DEFAULT 'CLOSED'
                         CHECK (circuit_state IN ('CLOSED','OPEN','HALF_OPEN')),
  circuit_opened_at    TIMESTAMPTZ NULL,
  injected_mode        VARCHAR(16) NULL CHECK (injected_mode IN ('UNAVAILABLE','SLOW','ERROR')),
  injected_params      JSONB       NULL,
  injected_until       TIMESTAMPTZ NULL
);

CREATE TABLE hub.application_health_checks (     -- rolling history, last 500 per application
  check_id       BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id VARCHAR(16)  NOT NULL,
  checked_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  status         VARCHAR(12)  NOT NULL,
  latency_ms     INTEGER      NULL,
  error_class    VARCHAR(40)  NULL,
  detail         VARCHAR(500) NULL
);
CREATE INDEX ix_health_checks_app_time ON hub.application_health_checks(application_id, checked_at DESC);

CREATE TABLE hub.integration_issues (            -- append-only operational log
  issue_id                 VARCHAR(26)   PRIMARY KEY,
  occurred_at              TIMESTAMPTZ   NOT NULL DEFAULT now(),
  application_id           VARCHAR(16)   NOT NULL,
  application_display_name VARCHAR(60)   NOT NULL,   -- denormalized on purpose
  operation                VARCHAR(40)   NOT NULL,
  error_class              VARCHAR(40)   NOT NULL,
  spoke_http_status        SMALLINT      NULL,
  response_excerpt         VARCHAR(1000) NULL,       -- escaped; administrator-only surface
  attempt                  SMALLINT      NOT NULL DEFAULT 1,
  circuit_state_at_failure VARCHAR(12)   NULL,
  principal_id             VARCHAR(26)   NULL,
  correlation_id           VARCHAR(26)   NOT NULL,
  adapter_request_id       VARCHAR(26)   NULL,
  orchestration_tx_id      VARCHAR(26)   NULL
);
CREATE INDEX ix_issues_time  ON hub.integration_issues(occurred_at DESC);
CREATE INDEX ix_issues_app   ON hub.integration_issues(application_id, occurred_at DESC);
CREATE INDEX ix_issues_corr  ON hub.integration_issues(correlation_id);
CREATE INDEX ix_issues_class ON hub.integration_issues(error_class, occurred_at DESC);
