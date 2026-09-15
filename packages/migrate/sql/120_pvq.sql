-- ============================================================================
-- 120_pvq.sql   credential: pvq_service
-- Copied verbatim from TechArch/04-data-model-spokes.md §4.4.
--
-- PVQ OWNS the eApp<->PVQ relationship. pvq.issues is the flagship table (home
-- of ISS-2207). subject_ref and parent_case_ref carry NO foreign key — they are
-- opaque strings the hub cross-checks and resolves. No REFERENCES clause names a
-- table in another schema.
-- ============================================================================

CREATE TABLE pvq.questionnaires (
  questionnaire_id     VARCHAR(32)  PRIMARY KEY,
  subject_ref          VARCHAR(32)  NOT NULL,     -- same string as eapp.subjects — NO FK
  subject_display_name VARCHAR(120) NOT NULL,
  form_type            VARCHAR(40)  NOT NULL,
  submitted_at         TIMESTAMPTZ  NULL,
  status               VARCHAR(24)  NOT NULL,
  synthetic_marker     VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version        VARCHAR(32)  NOT NULL,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX ix_pvq_q_subject ON pvq.questionnaires(subject_ref);

-- PVQ OWNS the eApp↔PVQ relationship. This table is the flagship workflow.
CREATE TABLE pvq.issues (
  issue_id                 VARCHAR(32)   PRIMARY KEY,     -- 'ISS-2207'
  questionnaire_id         VARCHAR(32)   NULL REFERENCES pvq.questionnaires(questionnaire_id),
  subject_ref              VARCHAR(32)   NOT NULL,        -- hub cross-checks against eApp's subject
  subject_display_name     VARCHAR(120)  NOT NULL,
  parent_system            VARCHAR(16)   NOT NULL DEFAULT 'EAPP',
  parent_case_ref          VARCHAR(32)   NOT NULL,        -- 'CASE-A-1042' — OPAQUE, never queried
  answer_locus             VARCHAR(160)  NOT NULL,        -- 'SECTION_13A.employer[0].endDate'
  answer_section_label     VARCHAR(120)  NOT NULL,        -- 'Section 13A — Employment history'
  answer_snapshot          VARCHAR(2000) NOT NULL,        -- the answer as it stood when raised
  title                    VARCHAR(160)  NOT NULL,
  description              VARCHAR(2000) NOT NULL,
  status                   VARCHAR(32)   NOT NULL CHECK (status IN
                             ('OPEN','IN_REVIEW','RESOLVED_SUBSTANTIATED','RESOLVED_UNSUBSTANTIATED',
                              'RESOLVED_WITH_CLARIFICATION','REFERRED')),
  priority                 VARCHAR(12)   NOT NULL DEFAULT 'ELEVATED'
                             CHECK (priority IN ('ROUTINE','ELEVATED','URGENT')),
  organization             VARCHAR(64)   NOT NULL,
  region                   VARCHAR(32)   NOT NULL,
  assigned_principal_id    VARCHAR(26)   NULL,
  assigned_display_name    VARCHAR(120)  NULL,
  raised_at                TIMESTAMPTZ   NOT NULL,
  due_date                 DATE          NULL,
  disposition              VARCHAR(32)   NULL CHECK (disposition IN
                             ('SUBSTANTIATED','UNSUBSTANTIATED','RESOLVED_WITH_CLARIFICATION',
                              'REFERRED_FOR_FURTHER_REVIEW')),
  resolution_narrative     VARCHAR(4000) NULL,
  resolved_by              VARCHAR(120)  NULL,
  resolved_by_principal_id VARCHAR(26)   NULL,
  resolved_at              TIMESTAMPTZ   NULL,
  last_activity_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  synthetic_marker         VARCHAR(16)   NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version            VARCHAR(32)   NOT NULL,
  created_at               TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ   NOT NULL DEFAULT now(),
  -- A resolved issue must carry its disposition and its resolver.
  CHECK (status NOT LIKE 'RESOLVED%' OR (disposition IS NOT NULL AND resolved_at IS NOT NULL))
);
CREATE INDEX ix_pvq_issues_parent  ON pvq.issues(parent_system, parent_case_ref);
CREATE INDEX ix_pvq_issues_subject ON pvq.issues(subject_ref);
CREATE INDEX ix_pvq_issues_status  ON pvq.issues(status, due_date);
CREATE INDEX ix_pvq_issues_org     ON pvq.issues(organization, region);

CREATE TABLE pvq.issue_activity (
  activity_id        VARCHAR(26)  PRIMARY KEY,
  issue_id           VARCHAR(32)  NOT NULL REFERENCES pvq.issues(issue_id) ON DELETE CASCADE,
  occurred_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  actor_display_name VARCHAR(120) NOT NULL,
  actor_principal_id VARCHAR(26)  NULL,
  action             VARCHAR(48)  NOT NULL,
  summary            VARCHAR(500) NOT NULL,
  correlation_id     VARCHAR(26)  NULL
);
CREATE INDEX ix_pvq_activity      ON pvq.issue_activity(issue_id, occurred_at DESC);
CREATE INDEX ix_pvq_activity_corr ON pvq.issue_activity(correlation_id);
