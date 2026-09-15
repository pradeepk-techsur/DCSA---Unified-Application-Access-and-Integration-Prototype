-- ============================================================================
-- 150_im.sql   credential: im_service
-- Copied verbatim from TechArch/04-data-model-spokes.md §4.7.
-- IM is the designated outage-demonstration spoke (FR-F09-06 rule 6).
--
-- subject_ref and eapp_case_ref are opaque with NO FK across schemas. In
-- im.assignments, (assigned_native_user IS NOT NULL AND assigned_principal_id
-- IS NULL) is a seeded edge state: "assigned to someone we can't resolve."
-- All FKs here are intra-schema (-> im.investigations).
-- ============================================================================

CREATE TABLE im.investigations (
  investigation_id     VARCHAR(32)  PRIMARY KEY,  -- 'INV-7741'
  subject_ref          VARCHAR(32)  NOT NULL,     -- opaque
  subject_display_name VARCHAR(120) NOT NULL,
  eapp_case_ref        VARCHAR(32)  NULL,         -- opaque
  title                VARCHAR(160) NOT NULL,
  status               VARCHAR(24)  NOT NULL CHECK (status IN
                         ('OPEN','IN_PROGRESS','PENDING_INFORMATION','COMPLETE','CLOSED')),
  priority             VARCHAR(12)  NOT NULL CHECK (priority IN ('ROUTINE','ELEVATED','URGENT')),
  sensitivity_tier     VARCHAR(4)   NOT NULL CHECK (sensitivity_tier IN ('T1','T3','T5')),
  organization         VARCHAR(64)  NOT NULL,
  region               VARCHAR(32)  NOT NULL,
  opened_at            TIMESTAMPTZ  NOT NULL,
  due_date             DATE         NULL,
  last_activity_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  synthetic_marker     VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version        VARCHAR(32)  NOT NULL,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX ix_im_inv_status  ON im.investigations(status, priority, due_date);
CREATE INDEX ix_im_inv_org     ON im.investigations(organization, region);
CREATE INDEX ix_im_inv_subject ON im.investigations(subject_ref);

CREATE TABLE im.assignments (
  assignment_id         VARCHAR(32)  PRIMARY KEY,
  investigation_id      VARCHAR(32)  NOT NULL REFERENCES im.investigations(investigation_id)
                                       ON DELETE CASCADE,
  assigned_principal_id VARCHAR(26)  NULL,        -- NULL = unassigned (a seeded edge state)
  assigned_native_user  VARCHAR(120) NULL,        -- set with NULL principal_id = unresolvable assignee
  assigned_display_name VARCHAR(120) NULL,
  assigned_at           TIMESTAMPTZ  NULL,
  accepted_at           TIMESTAMPTZ  NULL,
  due_date              DATE         NULL,
  state_version         VARCHAR(32)  NOT NULL
);
CREATE INDEX ix_im_assign_principal ON im.assignments(assigned_principal_id);
CREATE INDEX ix_im_assign_inv       ON im.assignments(investigation_id);

CREATE TABLE im.leads (
  lead_id          VARCHAR(32)   PRIMARY KEY,
  investigation_id VARCHAR(32)   NOT NULL REFERENCES im.investigations(investigation_id)
                                   ON DELETE CASCADE,
  title            VARCHAR(160)  NOT NULL,
  status           VARCHAR(20)   NOT NULL,
  due_date         DATE          NULL,
  notes            VARCHAR(4000) NULL,
  state_version    VARCHAR(32)   NOT NULL
);
CREATE INDEX ix_im_leads_inv ON im.leads(investigation_id);

CREATE TABLE im.investigator_workload (           -- derived; refreshed on assignment change
  principal_id  VARCHAR(26) PRIMARY KEY,
  open_count    INTEGER     NOT NULL DEFAULT 0,
  overdue_count INTEGER     NOT NULL DEFAULT 0,
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE im.im_activity (
  activity_id        VARCHAR(26)  PRIMARY KEY,
  investigation_id   VARCHAR(32)  NOT NULL REFERENCES im.investigations(investigation_id)
                                    ON DELETE CASCADE,
  occurred_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  actor_display_name VARCHAR(120) NOT NULL,
  action             VARCHAR(48)  NOT NULL,
  summary            VARCHAR(500) NOT NULL,
  correlation_id     VARCHAR(26)  NULL
);
CREATE INDEX ix_im_activity ON im.im_activity(investigation_id, occurred_at DESC);
