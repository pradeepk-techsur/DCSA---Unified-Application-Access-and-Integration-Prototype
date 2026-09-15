-- ============================================================================
-- 160_cvs.sql   credential: cvs_service
-- Copied verbatim from TechArch/04-data-model-spokes.md §4.8.
--
-- SCOPE NOTE: the cvs TABLES are created here so the seven-namespace isolation
-- model is one reviewable artifact. services/cvs and the CVS seed corpus are
-- Phase 7 per the ROADMAP scope note — this phase leaves cvs.alerts EMPTY and
-- creates NO hub.registered_applications row for it. CVS's invisibility until an
-- administrator registers it live is the demonstration of the data-driven
-- registry. subject_ref is opaque with NO FK; all FKs here are intra-schema.
-- ============================================================================

CREATE TABLE cvs.alerts (
  alert_id              VARCHAR(32)   PRIMARY KEY,   -- 'CVA-0091'
  subject_ref           VARCHAR(32)   NOT NULL,      -- opaque; coherent with other namespaces
  subject_display_name  VARCHAR(120)  NOT NULL,
  alert_type            VARCHAR(40)   NOT NULL,
  title                 VARCHAR(160)  NOT NULL,
  description           VARCHAR(2000) NOT NULL,
  status                VARCHAR(20)   NOT NULL CHECK (status IN
                          ('NEW','UNDER_REVIEW','CLEARED','ESCALATED')),
  priority              VARCHAR(12)   NOT NULL CHECK (priority IN ('ROUTINE','ELEVATED','URGENT')),
  organization          VARCHAR(64)   NOT NULL,
  region                VARCHAR(32)   NOT NULL,
  assigned_principal_id VARCHAR(26)   NULL,
  assigned_display_name VARCHAR(120)  NULL,
  raised_at             TIMESTAMPTZ   NOT NULL,
  due_date              DATE          NULL,
  clear_reason          VARCHAR(1000) NULL,
  last_activity_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  synthetic_marker      VARCHAR(16)   NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version         VARCHAR(32)   NOT NULL,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (status <> 'CLEARED' OR clear_reason IS NOT NULL)
);
CREATE INDEX ix_cvs_alerts_status    ON cvs.alerts(status, priority);
CREATE INDEX ix_cvs_alerts_assignee  ON cvs.alerts(assigned_principal_id);
CREATE INDEX ix_cvs_alerts_org       ON cvs.alerts(organization, region);

CREATE TABLE cvs.alert_activity (
  activity_id        VARCHAR(26)  PRIMARY KEY,
  alert_id           VARCHAR(32)  NOT NULL REFERENCES cvs.alerts(alert_id) ON DELETE CASCADE,
  occurred_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  actor_display_name VARCHAR(120) NOT NULL,
  action             VARCHAR(48)  NOT NULL,
  summary            VARCHAR(500) NOT NULL,
  correlation_id     VARCHAR(26)  NULL
);
CREATE INDEX ix_cvs_activity ON cvs.alert_activity(alert_id, occurred_at DESC);
