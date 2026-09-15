-- ============================================================================
-- 110_eapp.sql   credential: eapp_service
-- Copied verbatim from TechArch/04-data-model-spokes.md §4.3.
--
-- No REFERENCES clause in this file names a table in another schema. The FKs
-- here (subject_ref -> eapp.subjects, section_id -> eapp.questionnaire_sections,
-- etc.) are all intra-schema and expected. The cross-system columns
-- (outstanding_issue_refs, pdt_designation_ref, im_assignment_ref) are plain
-- columns holding opaque strings the hub resolves — never dereferenced here.
-- ============================================================================

CREATE TABLE eapp.subjects (
  subject_ref      VARCHAR(32)  PRIMARY KEY,      -- 'SUBJ-00418'; opaque, no FK anywhere
  display_name     VARCHAR(120) NOT NULL,
  date_of_birth    DATE         NOT NULL,         -- fabricated
  synthetic_ssn    VARCHAR(11)  NOT NULL,         -- '900-00-####', never-issued range
  email            VARCHAR(160) NOT NULL,         -- '@example.invalid'
  phone            VARCHAR(20)  NOT NULL,         -- '555-01##'
  address_line     VARCHAR(160) NOT NULL,
  postal_code      VARCHAR(10)  NOT NULL,         -- '000##', invalid by construction
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE eapp.cases (
  case_id                 VARCHAR(32)  PRIMARY KEY,    -- 'CASE-A-1042'
  subject_ref             VARCHAR(32)  NOT NULL REFERENCES eapp.subjects(subject_ref),
  case_state              VARCHAR(40)  NOT NULL CHECK (case_state IN
                            ('DRAFT','SUBMITTED','UNDER_REVIEW','INFORMATION_REQUESTED',
                             'REVIEW_COMPLETE_PENDING_ADJUDICATION','ADJUDICATED','CLOSED')),
  sensitivity_tier        VARCHAR(4)   NOT NULL CHECK (sensitivity_tier IN ('T1','T3','T5')),
  organization            VARCHAR(64)  NOT NULL,       -- ABAC input, returned to the hub
  region                  VARCHAR(32)  NOT NULL,       -- ABAC input
  assigned_principal_id   VARCHAR(26)  NULL,           -- hub principal id; opaque to eApp
  assigned_display_name   VARCHAR(120) NULL,
  priority                VARCHAR(12)  NOT NULL DEFAULT 'ROUTINE'
                            CHECK (priority IN ('ROUTINE','ELEVATED','URGENT')),
  submitted_at            TIMESTAMPTZ  NULL,
  due_date                DATE         NULL,
  outstanding_issue_count SMALLINT     NOT NULL DEFAULT 0 CHECK (outstanding_issue_count >= 0),
  outstanding_issue_refs  JSONB        NOT NULL DEFAULT '[]',   -- ["ISS-2207"] OPAQUE PVQ refs
  pdt_designation_ref     VARCHAR(32)  NULL,           -- opaque PDT ref, never dereferenced here
  im_assignment_ref       VARCHAR(32)  NULL,           -- opaque IM ref, never dereferenced here
  last_activity_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  synthetic_marker        VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version           VARCHAR(32)  NOT NULL,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX ix_eapp_cases_subject  ON eapp.cases(subject_ref);
CREATE INDEX ix_eapp_cases_assignee ON eapp.cases(assigned_principal_id);
CREATE INDEX ix_eapp_cases_org      ON eapp.cases(organization, region);
CREATE INDEX ix_eapp_cases_state    ON eapp.cases(case_state, due_date);

CREATE TABLE eapp.questionnaire_sections (
  section_id    VARCHAR(48)  PRIMARY KEY,         -- 'CASE-A-1042#SECTION_13A'
  case_id       VARCHAR(32)  NOT NULL REFERENCES eapp.cases(case_id) ON DELETE CASCADE,
  section_code  VARCHAR(24)  NOT NULL,            -- 'SECTION_13A' — the anchorable locus
  section_label VARCHAR(120) NOT NULL,            -- 'Section 13A — Employment history'
  sort_order    SMALLINT     NOT NULL,
  completed     BOOLEAN      NOT NULL DEFAULT TRUE,
  UNIQUE (case_id, section_code)
);

CREATE TABLE eapp.answers (
  answer_id     VARCHAR(48)   PRIMARY KEY,
  section_id    VARCHAR(48)   NOT NULL REFERENCES eapp.questionnaire_sections(section_id)
                                ON DELETE CASCADE,
  answer_path   VARCHAR(120)  NOT NULL,           -- 'employer[0].endDate' — PVQ's answer_locus target
  question_text VARCHAR(500)  NOT NULL,
  answer_text   VARCHAR(2000) NOT NULL,
  UNIQUE (section_id, answer_path)
);

CREATE TABLE eapp.case_activity (                 -- eApp's OWN history, independent of hub audit
  activity_id        VARCHAR(26)  PRIMARY KEY,
  case_id            VARCHAR(32)  NOT NULL REFERENCES eapp.cases(case_id) ON DELETE CASCADE,
  occurred_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  actor_display_name VARCHAR(120) NOT NULL,
  actor_principal_id VARCHAR(26)  NULL,
  action             VARCHAR(48)  NOT NULL,
  summary            VARCHAR(500) NOT NULL,
  correlation_id     VARCHAR(26)  NULL             -- echoed from the hub; enables cross-referencing
);
CREATE INDEX ix_eapp_activity      ON eapp.case_activity(case_id, occurred_at DESC);
CREATE INDEX ix_eapp_activity_corr ON eapp.case_activity(correlation_id);
