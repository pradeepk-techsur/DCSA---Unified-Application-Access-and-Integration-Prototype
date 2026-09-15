## Y0b — Database Schema: Spoke Namespaces (Isolated)

**Namespaces:** `eapp`, `iep`, `pvq`, `pdt`, `im`, `cvs`. Each is owned by exactly one service, with its own credential. **No table is shared. No cross-schema foreign key exists anywhere in this document.** The isolation is a deliverable, not an implementation detail (`FR-F09-01`, NFR-08, SM-13).

Cross-system relationships are expressed **only** as opaque string references (`subject_ref`, `parent_case_ref`, `outstanding_issue_refs`) that the owning service stores but never resolves. Resolution happens exclusively in the hub, through adapters (`FR-F07a-01`).

---

### Conventions common to every spoke

Each spoke's tables carry these columns unless noted:

```sql
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',  -- FR-F17-08
  state_version    VARCHAR(32) NOT NULL,   -- changes on any user-visible field change (FR-F08a-03)
  created_at       TIMESTAMPTZ NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL
```

Each spoke also carries these two operational tables:

```sql
CREATE TABLE <ns>.idempotency_records (          -- FR-F09-07 rule 3
  idempotency_key VARCHAR(26)  PRIMARY KEY,
  request_hash    VARCHAR(64)  NOT NULL,
  response_status SMALLINT     NOT NULL,
  response_body   JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL,
  expires_at      TIMESTAMPTZ  NOT NULL          -- created_at + 24h
);

CREATE TABLE <ns>.injection_state (              -- FR-F16-11; demo failure injection
  id           SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode         VARCHAR(16) NOT NULL DEFAULT 'NORMAL'
                 CHECK (mode IN ('NORMAL','UNAVAILABLE','SLOW','ERROR')),
  slow_ms      INTEGER  NULL,
  error_rate_pct SMALLINT NULL,
  expires_at   TIMESTAMPTZ NULL
);
```

---

## §eApp — `eapp` namespace

```sql
CREATE TABLE eapp.subjects (
  subject_ref      VARCHAR(32)  PRIMARY KEY,      -- 'SUBJ-00418'; opaque, no FK anywhere
  display_name     VARCHAR(120) NOT NULL,
  date_of_birth    DATE         NOT NULL,         -- fabricated
  synthetic_ssn    VARCHAR(11)  NOT NULL,         -- '900-00-####', invalid by construction
  email            VARCHAR(160) NOT NULL,         -- '@example.invalid'
  phone            VARCHAR(20)  NOT NULL,         -- '555-01##'
  address_line     VARCHAR(160) NOT NULL,
  postal_code      VARCHAR(10)  NOT NULL,         -- '000##', invalid by construction
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE eapp.cases (
  case_id                VARCHAR(32) PRIMARY KEY,  -- 'CASE-A-1042'
  subject_ref            VARCHAR(32) NOT NULL REFERENCES eapp.subjects(subject_ref),
  case_state             VARCHAR(40) NOT NULL CHECK (case_state IN
                           ('DRAFT','SUBMITTED','UNDER_REVIEW','INFORMATION_REQUESTED',
                            'REVIEW_COMPLETE_PENDING_ADJUDICATION','ADJUDICATED','CLOSED')),
  sensitivity_tier       VARCHAR(4)  NOT NULL CHECK (sensitivity_tier IN ('T1','T3','T5')),
  organization           VARCHAR(64) NOT NULL,     -- ABAC input
  region                 VARCHAR(32) NOT NULL,     -- ABAC input
  assigned_principal_id  VARCHAR(26) NULL,         -- hub principal id, opaque to eApp
  assigned_display_name  VARCHAR(120) NULL,
  priority               VARCHAR(12) NOT NULL DEFAULT 'ROUTINE',
  submitted_at           TIMESTAMPTZ NULL,
  due_date               DATE        NULL,
  outstanding_issue_count SMALLINT   NOT NULL DEFAULT 0,
  outstanding_issue_refs  JSONB      NOT NULL DEFAULT '[]',  -- ["ISS-2207"] — OPAQUE PVQ refs, never resolved here
  pdt_designation_ref     VARCHAR(32) NULL,        -- opaque PDT ref
  im_assignment_ref       VARCHAR(32) NULL,        -- opaque IM ref
  last_activity_at        TIMESTAMPTZ NOT NULL,
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX ix_eapp_cases_subject  ON eapp.cases(subject_ref);
CREATE INDEX ix_eapp_cases_assignee ON eapp.cases(assigned_principal_id);
CREATE INDEX ix_eapp_cases_org      ON eapp.cases(organization, region);

CREATE TABLE eapp.questionnaire_sections (
  section_id    VARCHAR(48) PRIMARY KEY,           -- 'CASE-A-1042#SECTION_13A'
  case_id       VARCHAR(32) NOT NULL REFERENCES eapp.cases(case_id),
  section_code  VARCHAR(24) NOT NULL,              -- 'SECTION_13A' — the anchorable locus
  section_label VARCHAR(120) NOT NULL,             -- 'Section 13A — Employment history'
  sort_order    SMALLINT    NOT NULL,
  completed     BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE eapp.answers (
  answer_id    VARCHAR(48) PRIMARY KEY,
  section_id   VARCHAR(48) NOT NULL REFERENCES eapp.questionnaire_sections(section_id),
  answer_path  VARCHAR(120) NOT NULL,              -- 'employer[0].endDate' — targeted by PVQ answer_locus
  question_text VARCHAR(500) NOT NULL,
  answer_text  VARCHAR(2000) NOT NULL,
  UNIQUE (section_id, answer_path)
);

CREATE TABLE eapp.case_activity (                  -- eApp's OWN history, independent of hub audit
  activity_id  VARCHAR(26) PRIMARY KEY,
  case_id      VARCHAR(32) NOT NULL REFERENCES eapp.cases(case_id),
  occurred_at  TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  actor_principal_id VARCHAR(26) NULL,
  action       VARCHAR(48) NOT NULL,
  summary      VARCHAR(500) NOT NULL,
  correlation_id VARCHAR(26) NULL
);
CREATE INDEX ix_eapp_activity ON eapp.case_activity(case_id, occurred_at DESC);
```

**Behavioral notes (`FR-F09-02`):** `CLEAR_OUTSTANDING_ISSUE(issue_ref)` removes `issue_ref` from `outstanding_issue_refs` if present, decrements the count, and is a **no-op success** if absent — this idempotency is what makes flagship retry safe. When the count reaches zero from non-zero, `case_state` moves `UNDER_REVIEW → REVIEW_COMPLETE_PENDING_ADJUDICATION`.

---

## §PVQ — `pvq` namespace

```sql
CREATE TABLE pvq.questionnaires (
  questionnaire_id VARCHAR(32) PRIMARY KEY,
  subject_ref      VARCHAR(32) NOT NULL,           -- same string as eapp.subjects.subject_ref; NO FK
  subject_display_name VARCHAR(120) NOT NULL,
  form_type        VARCHAR(40) NOT NULL,
  submitted_at     TIMESTAMPTZ NULL,
  status           VARCHAR(24) NOT NULL,
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE pvq.issues (                          -- PVQ OWNS the eApp↔PVQ relationship (FR-F07a-01)
  issue_id            VARCHAR(32) PRIMARY KEY,     -- 'ISS-2207'
  questionnaire_id    VARCHAR(32) NULL REFERENCES pvq.questionnaires(questionnaire_id),
  subject_ref         VARCHAR(32) NOT NULL,        -- cross-checked by the hub against eApp's subject
  subject_display_name VARCHAR(120) NOT NULL,
  parent_system       VARCHAR(16) NOT NULL DEFAULT 'EAPP',
  parent_case_ref     VARCHAR(32) NOT NULL,        -- 'CASE-A-1042' — OPAQUE; PVQ never queries eApp
  answer_locus        VARCHAR(160) NOT NULL,       -- 'SECTION_13A.employer[0].endDate'
  answer_section_label VARCHAR(120) NOT NULL,      -- 'Section 13A — Employment history'
  answer_snapshot     VARCHAR(2000) NOT NULL,      -- the answer as it stood when raised
  title               VARCHAR(160) NOT NULL,
  description         VARCHAR(2000) NOT NULL,
  status              VARCHAR(32) NOT NULL CHECK (status IN
                        ('OPEN','IN_REVIEW','RESOLVED_SUBSTANTIATED','RESOLVED_UNSUBSTANTIATED',
                         'RESOLVED_WITH_CLARIFICATION','REFERRED')),
  priority            VARCHAR(12) NOT NULL DEFAULT 'ELEVATED',
  organization        VARCHAR(64) NOT NULL,
  region              VARCHAR(32) NOT NULL,
  assigned_principal_id VARCHAR(26) NULL,
  assigned_display_name VARCHAR(120) NULL,
  raised_at           TIMESTAMPTZ NOT NULL,
  due_date            DATE        NULL,
  disposition         VARCHAR(32) NULL CHECK (disposition IN
                        ('SUBSTANTIATED','UNSUBSTANTIATED','RESOLVED_WITH_CLARIFICATION',
                         'REFERRED_FOR_FURTHER_REVIEW')),
  resolution_narrative VARCHAR(4000) NULL,
  resolved_by         VARCHAR(120) NULL,
  resolved_by_principal_id VARCHAR(26) NULL,
  resolved_at         TIMESTAMPTZ NULL,
  last_activity_at    TIMESTAMPTZ NOT NULL,
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX ix_pvq_issues_parent  ON pvq.issues(parent_system, parent_case_ref);
CREATE INDEX ix_pvq_issues_subject ON pvq.issues(subject_ref);
CREATE INDEX ix_pvq_issues_status  ON pvq.issues(status, due_date);

CREATE TABLE pvq.issue_activity (
  activity_id  VARCHAR(26) PRIMARY KEY,
  issue_id     VARCHAR(32) NOT NULL REFERENCES pvq.issues(issue_id),
  occurred_at  TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  actor_principal_id VARCHAR(26) NULL,
  action       VARCHAR(48) NOT NULL,
  summary      VARCHAR(500) NOT NULL,
  correlation_id VARCHAR(26) NULL
);
```

**Behavioral notes (`FR-F09-03`):** `RESOLVE_ISSUE` is permitted only from `OPEN` or `IN_REVIEW`; from a resolved state it returns a business rejection ("This issue has already been resolved."). It is idempotent on `X-UAL-Idempotency-Key`. `parent_case_ref` is stored and returned, never dereferenced.

---

## §IEP — `iep` namespace

```sql
CREATE TABLE iep.individuals (
  subject_ref      VARCHAR(32)  PRIMARY KEY,       -- same string as eApp/PVQ; NO FK
  display_name     VARCHAR(120) NOT NULL,
  email            VARCHAR(160) NOT NULL,          -- '@example.invalid'
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE iep.status_records (
  status_record_id VARCHAR(32)  PRIMARY KEY,
  subject_ref      VARCHAR(32)  NOT NULL REFERENCES iep.individuals(subject_ref),
  stage            VARCHAR(32)  NOT NULL CHECK (stage IN
                     ('SUBMITTED','UNDER_REVIEW','INFORMATION_REQUESTED','COMPLETE')),
  stage_explanation VARCHAR(500) NOT NULL,         -- plain-language copy stored as DATA, not code
  updated_at       TIMESTAMPTZ  NOT NULL,
  state_version    VARCHAR(32)  NOT NULL,
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE iep.notices (
  notice_id        VARCHAR(32)  PRIMARY KEY,
  subject_ref      VARCHAR(32)  NOT NULL REFERENCES iep.individuals(subject_ref),
  title            VARCHAR(160) NOT NULL,
  body             VARCHAR(4000) NOT NULL,
  severity         VARCHAR(12)  NOT NULL CHECK (severity IN ('INFO','ACTION_REQUIRED','URGENT')),
  issued_at        TIMESTAMPTZ  NOT NULL,
  read_at          TIMESTAMPTZ  NULL,              -- IEP owns read state for ITS notices
  state_version    VARCHAR(32)  NOT NULL,
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE iep.tasks (
  task_id          VARCHAR(32)  PRIMARY KEY,
  subject_ref      VARCHAR(32)  NOT NULL REFERENCES iep.individuals(subject_ref),
  title            VARCHAR(160) NOT NULL,
  description      VARCHAR(2000) NOT NULL,
  consequence_text VARCHAR(500) NOT NULL,          -- "what happens if you don't act", plain language
  status           VARCHAR(16)  NOT NULL CHECK (status IN ('OPEN','COMPLETE')),
  due_date         DATE         NULL,
  response_schema  JSONB        NULL,              -- drives the completion form
  response_payload JSONB        NULL,
  completed_at     TIMESTAMPTZ  NULL,
  last_activity_at TIMESTAMPTZ  NOT NULL,
  state_version    VARCHAR(32)  NOT NULL,
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE iep.iep_activity (
  activity_id VARCHAR(26) PRIMARY KEY,
  target_type VARCHAR(16) NOT NULL CHECK (target_type IN ('NOTICE','TASK','STATUS')),
  target_id   VARCHAR(32) NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  action      VARCHAR(48) NOT NULL,
  summary     VARCHAR(500) NOT NULL,
  correlation_id VARCHAR(26) NULL
);
```

---

## §PDT — `pdt` namespace

```sql
CREATE TABLE pdt.positions (
  position_id      VARCHAR(32)  PRIMARY KEY,
  title            VARCHAR(160) NOT NULL,
  organization     VARCHAR(64)  NOT NULL,
  region           VARCHAR(32)  NOT NULL,
  synthetic_marker VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC'
);

CREATE TABLE pdt.designations (
  designation_id    VARCHAR(32) PRIMARY KEY,       -- 'DSG-0431'
  position_id       VARCHAR(32) NOT NULL REFERENCES pdt.positions(position_id),
  subject_ref       VARCHAR(32) NULL,              -- opaque
  eapp_case_ref     VARCHAR(32) NULL,              -- opaque eApp ref; PDT never queries eApp
  sensitivity_level VARCHAR(32) NOT NULL CHECK (sensitivity_level IN
                      ('NON_SENSITIVE','NONCRITICAL_SENSITIVE','CRITICAL_SENSITIVE','SPECIAL_SENSITIVE')),
  risk_level        VARCHAR(12) NOT NULL CHECK (risk_level IN ('LOW','MODERATE','HIGH')),
  investigation_tier VARCHAR(4) NOT NULL CHECK (investigation_tier IN ('T1','T3','T5')),
  tier_rule_id      VARCHAR(24) NOT NULL REFERENCES pdt.tier_rules(rule_id),
  status            VARCHAR(20) NOT NULL CHECK (status IN
                      ('DRAFT','PENDING_REVIEW','APPROVED','RETURNED')),
  organization      VARCHAR(64) NOT NULL,
  region            VARCHAR(32) NOT NULL,
  reviewed_by       VARCHAR(120) NULL,
  reviewed_at       TIMESTAMPTZ NULL,
  return_reason     VARCHAR(1000) NULL,
  last_activity_at  TIMESTAMPTZ NOT NULL,
  -- NOTE: no due_date and no priority column. PDT declares priorityNative:false,
  -- exercising the normalization rules in FR-F05-02 and the "not provided" affordance.
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE pdt.tier_rules (                      -- the rule is DATA so it can be displayed (FR-F06-09)
  rule_id           VARCHAR(24)  PRIMARY KEY,
  sensitivity_level VARCHAR(32)  NOT NULL,
  risk_level        VARCHAR(12)  NOT NULL,
  investigation_tier VARCHAR(4)  NOT NULL,
  rule_text         VARCHAR(500) NOT NULL,
  UNIQUE (sensitivity_level, risk_level)
);

CREATE TABLE pdt.risk_factors (
  factor_id      VARCHAR(32) PRIMARY KEY,
  designation_id VARCHAR(32) NOT NULL REFERENCES pdt.designations(designation_id),
  factor_code    VARCHAR(32) NOT NULL,
  factor_label   VARCHAR(160) NOT NULL,
  weight         VARCHAR(12) NOT NULL
);

CREATE TABLE pdt.designation_activity (
  activity_id    VARCHAR(26) PRIMARY KEY,
  designation_id VARCHAR(32) NOT NULL REFERENCES pdt.designations(designation_id),
  occurred_at    TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  action         VARCHAR(48) NOT NULL,
  summary        VARCHAR(500) NOT NULL,
  correlation_id VARCHAR(26) NULL
);
```

---

## §IM — `im` namespace

```sql
CREATE TABLE im.investigations (
  investigation_id VARCHAR(32) PRIMARY KEY,        -- 'INV-7741'
  subject_ref      VARCHAR(32) NOT NULL,           -- opaque
  subject_display_name VARCHAR(120) NOT NULL,
  eapp_case_ref    VARCHAR(32) NULL,               -- opaque
  title            VARCHAR(160) NOT NULL,
  status           VARCHAR(24) NOT NULL CHECK (status IN
                     ('OPEN','IN_PROGRESS','PENDING_INFORMATION','COMPLETE','CLOSED')),
  priority         VARCHAR(12) NOT NULL CHECK (priority IN ('ROUTINE','ELEVATED','URGENT')),
  sensitivity_tier VARCHAR(4)  NOT NULL,
  organization     VARCHAR(64) NOT NULL,
  region           VARCHAR(32) NOT NULL,
  opened_at        TIMESTAMPTZ NOT NULL,
  due_date         DATE        NULL,
  last_activity_at TIMESTAMPTZ NOT NULL,
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE im.assignments (
  assignment_id        VARCHAR(32) PRIMARY KEY,
  investigation_id     VARCHAR(32) NOT NULL REFERENCES im.investigations(investigation_id),
  assigned_principal_id VARCHAR(26) NULL,          -- NULL = unassigned (seeded edge state)
  assigned_native_user  VARCHAR(120) NULL,         -- set with NULL principal_id = unresolvable assignee
  assigned_display_name VARCHAR(120) NULL,
  assigned_at          TIMESTAMPTZ NULL,
  accepted_at          TIMESTAMPTZ NULL,
  due_date             DATE        NULL,
  state_version        VARCHAR(32) NOT NULL
);
CREATE INDEX ix_im_assign_principal ON im.assignments(assigned_principal_id);

CREATE TABLE im.leads (
  lead_id          VARCHAR(32) PRIMARY KEY,
  investigation_id VARCHAR(32) NOT NULL REFERENCES im.investigations(investigation_id),
  title            VARCHAR(160) NOT NULL,
  status           VARCHAR(20) NOT NULL,
  due_date         DATE        NULL,
  notes            VARCHAR(4000) NULL,
  state_version    VARCHAR(32) NOT NULL
);

CREATE TABLE im.investigator_workload (            -- derived, refreshed on assignment change
  principal_id     VARCHAR(26) PRIMARY KEY,
  open_count       INTEGER     NOT NULL DEFAULT 0,
  overdue_count    INTEGER     NOT NULL DEFAULT 0,
  computed_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE im.im_activity (
  activity_id      VARCHAR(26) PRIMARY KEY,
  investigation_id VARCHAR(32) NOT NULL REFERENCES im.investigations(investigation_id),
  occurred_at      TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  action           VARCHAR(48) NOT NULL,
  summary          VARCHAR(500) NOT NULL,
  correlation_id   VARCHAR(26) NULL
);
```

---

## §CVS — `cvs` namespace (demo sixth application)

```sql
CREATE TABLE cvs.alerts (                          -- FR-F12-06
  alert_id         VARCHAR(32) PRIMARY KEY,        -- 'CVA-0091'
  subject_ref      VARCHAR(32) NOT NULL,           -- opaque, coherent with the other namespaces
  subject_display_name VARCHAR(120) NOT NULL,
  alert_type       VARCHAR(40) NOT NULL,
  title            VARCHAR(160) NOT NULL,
  description      VARCHAR(2000) NOT NULL,
  status           VARCHAR(20) NOT NULL CHECK (status IN
                     ('NEW','UNDER_REVIEW','CLEARED','ESCALATED')),
  priority         VARCHAR(12) NOT NULL,
  organization     VARCHAR(64) NOT NULL,
  region           VARCHAR(32) NOT NULL,
  assigned_principal_id VARCHAR(26) NULL,
  assigned_display_name VARCHAR(120) NULL,
  raised_at        TIMESTAMPTZ NOT NULL,
  due_date         DATE        NULL,
  clear_reason     VARCHAR(1000) NULL,
  last_activity_at TIMESTAMPTZ NOT NULL,
  synthetic_marker VARCHAR(16) NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  state_version    VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE cvs.alert_activity (
  activity_id VARCHAR(26) PRIMARY KEY,
  alert_id    VARCHAR(32) NOT NULL REFERENCES cvs.alerts(alert_id),
  occurred_at TIMESTAMPTZ NOT NULL,
  actor_display_name VARCHAR(120) NOT NULL,
  action      VARCHAR(48) NOT NULL,
  summary     VARCHAR(500) NOT NULL,
  correlation_id VARCHAR(26) NULL
);
```

**Note:** CVS's data exists from first startup, but **no `hub.registered_applications` row exists for it** until an administrator registers it live (`FR-F12-06`). Its invisibility before registration is part of the demonstration.

---

### Isolation verification checklist (`FR-F19-03` item 8)

| Assertion | How verified |
|---|---|
| No cross-schema foreign key exists | Schema introspection: every FK's referenced table is in the same schema |
| No table name appears in two schemas with shared data | Schema inventory diff |
| Each service credential can read only its own schema | Runtime probe per service against every other schema; all must fail |
| No spoke makes an outbound call to another spoke | Network policy assertion during test |
| The hub holds no spoke table grants | Grant inspection |
| Cross-system references are strings with no FK | Column inspection: `subject_ref`, `parent_case_ref`, `eapp_case_ref`, `outstanding_issue_refs`, `pdt_designation_ref`, `im_assignment_ref` all unconstrained |

---
