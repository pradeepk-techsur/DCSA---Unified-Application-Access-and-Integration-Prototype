-- ============================================================================
-- 130_iep.sql   credential: iep_service
-- Copied verbatim from TechArch/04-data-model-spokes.md §4.5.
--
-- subject_ref is the same opaque string as eApp/PVQ with NO FK across schemas.
-- All FKs here are intra-schema (-> iep.individuals).
-- ============================================================================

CREATE TABLE iep.individuals (
  subject_ref      VARCHAR(32)  PRIMARY KEY,      -- same string as eApp/PVQ — NO FK
  display_name     VARCHAR(120) NOT NULL,
  email            VARCHAR(160) NOT NULL,         -- '@example.invalid'
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE iep.status_records (
  status_record_id  VARCHAR(32)  PRIMARY KEY,
  subject_ref       VARCHAR(32)  NOT NULL REFERENCES iep.individuals(subject_ref),
  stage             VARCHAR(32)  NOT NULL CHECK (stage IN
                      ('SUBMITTED','UNDER_REVIEW','INFORMATION_REQUESTED','COMPLETE')),
  stage_explanation VARCHAR(500) NOT NULL,        -- plain-language copy stored as DATA, not code
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  state_version     VARCHAR(32)  NOT NULL,
  synthetic_marker  VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);
CREATE INDEX ix_iep_status_subject ON iep.status_records(subject_ref);

CREATE TABLE iep.notices (
  notice_id        VARCHAR(32)   PRIMARY KEY,
  subject_ref      VARCHAR(32)   NOT NULL REFERENCES iep.individuals(subject_ref),
  title            VARCHAR(160)  NOT NULL,
  body             VARCHAR(4000) NOT NULL,
  severity         VARCHAR(12)   NOT NULL CHECK (severity IN ('INFO','ACTION_REQUIRED','URGENT')),
  issued_at        TIMESTAMPTZ   NOT NULL,
  read_at          TIMESTAMPTZ   NULL,            -- IEP owns read state for ITS notices
  state_version    VARCHAR(32)   NOT NULL,
  synthetic_marker VARCHAR(16)   NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);
CREATE INDEX ix_iep_notices_subject ON iep.notices(subject_ref, issued_at DESC);

CREATE TABLE iep.tasks (
  task_id          VARCHAR(32)   PRIMARY KEY,
  subject_ref      VARCHAR(32)   NOT NULL REFERENCES iep.individuals(subject_ref),
  title            VARCHAR(160)  NOT NULL,
  description      VARCHAR(2000) NOT NULL,
  consequence_text VARCHAR(500)  NOT NULL,        -- "what happens if you don't act", plain language
  status           VARCHAR(16)   NOT NULL CHECK (status IN ('OPEN','COMPLETE')),
  due_date         DATE          NULL,
  response_schema  JSONB         NULL,            -- drives the completion form
  response_payload JSONB         NULL,
  completed_at     TIMESTAMPTZ   NULL,
  last_activity_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
  state_version    VARCHAR(32)   NOT NULL,
  synthetic_marker VARCHAR(16)   NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  CHECK (status <> 'COMPLETE' OR completed_at IS NOT NULL)
);
CREATE INDEX ix_iep_tasks_subject ON iep.tasks(subject_ref, status, due_date);

CREATE TABLE iep.iep_activity (
  activity_id        VARCHAR(26)  PRIMARY KEY,
  target_type        VARCHAR(16)  NOT NULL CHECK (target_type IN ('NOTICE','TASK','STATUS')),
  target_id          VARCHAR(32)  NOT NULL,
  occurred_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  actor_display_name VARCHAR(120) NOT NULL,
  action             VARCHAR(48)  NOT NULL,
  summary            VARCHAR(500) NOT NULL,
  correlation_id     VARCHAR(26)  NULL
);
CREATE INDEX ix_iep_activity ON iep.iep_activity(target_type, target_id, occurred_at DESC);
