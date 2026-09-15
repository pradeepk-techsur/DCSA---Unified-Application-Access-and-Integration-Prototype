-- ============================================================================
-- 140_pdt.sql   credential: pdt_service
-- Copied verbatim from TechArch/04-data-model-spokes.md §4.6.
-- tier_rules is created FIRST: designations carries a FK to it.
--
-- eapp_case_ref is an opaque eApp reference with NO FK — PDT never queries eApp.
-- All FKs here are intra-schema (-> pdt.tier_rules, pdt.positions, pdt.designations).
-- ============================================================================

CREATE TABLE pdt.tier_rules (                     -- the rule is DATA so the UI can display it
  rule_id            VARCHAR(24)  PRIMARY KEY,
  sensitivity_level  VARCHAR(32)  NOT NULL,
  risk_level         VARCHAR(12)  NOT NULL,
  investigation_tier VARCHAR(4)   NOT NULL CHECK (investigation_tier IN ('T1','T3','T5')),
  rule_text          VARCHAR(500) NOT NULL,
  UNIQUE (sensitivity_level, risk_level)
);

CREATE TABLE pdt.positions (
  position_id      VARCHAR(32)  PRIMARY KEY,
  title            VARCHAR(160) NOT NULL,
  organization     VARCHAR(64)  NOT NULL,
  region           VARCHAR(32)  NOT NULL,
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE pdt.designations (
  designation_id     VARCHAR(32)   PRIMARY KEY,   -- 'DSG-0431'
  position_id        VARCHAR(32)   NOT NULL REFERENCES pdt.positions(position_id),
  subject_ref        VARCHAR(32)   NULL,          -- opaque
  eapp_case_ref      VARCHAR(32)   NULL,          -- opaque eApp ref; PDT never queries eApp
  sensitivity_level  VARCHAR(32)   NOT NULL CHECK (sensitivity_level IN
                       ('NON_SENSITIVE','NONCRITICAL_SENSITIVE','CRITICAL_SENSITIVE','SPECIAL_SENSITIVE')),
  risk_level         VARCHAR(12)   NOT NULL CHECK (risk_level IN ('LOW','MODERATE','HIGH')),
  investigation_tier VARCHAR(4)    NOT NULL CHECK (investigation_tier IN ('T1','T3','T5')),
  tier_rule_id       VARCHAR(24)   NOT NULL REFERENCES pdt.tier_rules(rule_id),
  status             VARCHAR(20)   NOT NULL CHECK (status IN
                       ('DRAFT','PENDING_REVIEW','APPROVED','RETURNED')),
  organization       VARCHAR(64)   NOT NULL,
  region             VARCHAR(32)   NOT NULL,
  reviewed_by        VARCHAR(120)  NULL,
  reviewed_at        TIMESTAMPTZ   NULL,
  return_reason      VARCHAR(1000) NULL,
  last_activity_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  -- DELIBERATE OMISSION: no due_date column and no priority column. PDT declares
  -- priorityNative:false and emits no dueDate, which exercises the hub's normalization
  -- rules and the "Priority not provided by PDT" / nulls-last sorting affordances.
  synthetic_marker   VARCHAR(16)   NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version      VARCHAR(32)   NOT NULL,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (status <> 'RETURNED' OR return_reason IS NOT NULL)
);
CREATE INDEX ix_pdt_desig_status  ON pdt.designations(status);
CREATE INDEX ix_pdt_desig_org     ON pdt.designations(organization, region);
CREATE INDEX ix_pdt_desig_case    ON pdt.designations(eapp_case_ref);

CREATE TABLE pdt.risk_factors (
  factor_id      VARCHAR(32)  PRIMARY KEY,
  designation_id VARCHAR(32)  NOT NULL REFERENCES pdt.designations(designation_id)
                                ON DELETE CASCADE,
  factor_code    VARCHAR(32)  NOT NULL,
  factor_label   VARCHAR(160) NOT NULL,
  weight         VARCHAR(12)  NOT NULL
);

CREATE TABLE pdt.designation_activity (
  activity_id        VARCHAR(26)  PRIMARY KEY,
  designation_id     VARCHAR(32)  NOT NULL REFERENCES pdt.designations(designation_id)
                                    ON DELETE CASCADE,
  occurred_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  actor_display_name VARCHAR(120) NOT NULL,
  action             VARCHAR(48)  NOT NULL,
  summary            VARCHAR(500) NOT NULL,
  correlation_id     VARCHAR(26)  NULL
);
CREATE INDEX ix_pdt_activity ON pdt.designation_activity(designation_id, occurred_at DESC);
