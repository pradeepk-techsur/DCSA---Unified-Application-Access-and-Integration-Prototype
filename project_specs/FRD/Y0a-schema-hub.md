## Y0a — Database Schema: Hub Namespace

**Namespace:** `hub`. **Owned by:** the unified application layer only. **Accessible by:** the hub service credential only. No spoke service has any grant on this namespace, and this namespace has no grant on any spoke namespace (`FR-F09-01`, NFR-08).

DDL below is logical: it specifies entities, fields, keys, constraints, and isolation boundaries. The physical engine is a TechArch decision. Types are written in ANSI-ish SQL for clarity.

---

### Isolation statement

```sql
-- Seven independent namespaces, each with its own credential.
-- Grants are the enforcement mechanism; convention is not.
CREATE SCHEMA hub;   -- hub service only
CREATE SCHEMA eapp;  -- eApp service only
CREATE SCHEMA iep;   -- IEP service only
CREATE SCHEMA pvq;   -- PVQ service only
CREATE SCHEMA pdt;   -- PDT service only
CREATE SCHEMA im;    -- IM service only
CREATE SCHEMA cvs;   -- Continuous Vetting Service only

GRANT USAGE ON SCHEMA hub TO hub_service;
REVOKE ALL ON SCHEMA hub FROM eapp_service, iep_service, pvq_service,
                              pdt_service, im_service, cvs_service;
-- and symmetrically for each spoke schema.
-- NO table appears in more than one schema. NO cross-schema foreign key exists.
```

---

### Identity and session

```sql
CREATE TABLE hub.users (
  principal_id        VARCHAR(26)  PRIMARY KEY,           -- ULID
  display_name        VARCHAR(120) NOT NULL,
  subject_ref         VARCHAR(32)  NULL,                  -- non-null only for APPLICANT (FR-F00-05)
  organization        VARCHAR(64)  NOT NULL,
  clearance_tier      VARCHAR(4)   NOT NULL CHECK (clearance_tier IN ('T1','T3','T5')),
  assigned_region     VARCHAR(32)  NOT NULL,
  enabled             BOOLEAN      NOT NULL DEFAULT TRUE,
  synthetic_marker    VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  created_at          TIMESTAMPTZ  NOT NULL,
  last_activity_at    TIMESTAMPTZ  NULL
);

CREATE TABLE hub.roles (
  role_id     VARCHAR(16) PRIMARY KEY,   -- INVESTIGATOR | ADJUDICATOR | APPLICANT | ADMINISTRATOR
  label       VARCHAR(64) NOT NULL,
  description VARCHAR(500) NOT NULL
);

CREATE TABLE hub.user_roles (
  principal_id VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  role_id      VARCHAR(16) NOT NULL REFERENCES hub.roles(role_id),
  assigned_at  TIMESTAMPTZ NOT NULL,
  assigned_by  VARCHAR(26) NULL,
  PRIMARY KEY (principal_id, role_id)
);

CREATE TABLE hub.user_case_assignments (          -- attribute input for ATTR-INV-01/02
  principal_id   VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  source_system  VARCHAR(16) NOT NULL,            -- registry applicationId (opaque, no FK to a spoke)
  native_case_id VARCHAR(64) NOT NULL,
  assigned_at    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (principal_id, source_system, native_case_id)
);

CREATE TABLE hub.user_auth_methods (              -- which IdP pools an identity belongs to (FR-F00-02/03/04)
  principal_id VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  method_id    VARCHAR(16) NOT NULL CHECK (method_id IN ('CAC_PIV','ECA','GENERIC_MFA')),
  username     VARCHAR(128) NULL,                 -- GENERIC_MFA only
  cert_subject_cn      VARCHAR(160) NULL,         -- CAC_PIV / ECA, synthetic
  cert_subject_org     VARCHAR(160) NULL,
  cert_issuer          VARCHAR(160) NULL,         -- 'DEMO-DOD-CA-59 (synthetic)' / 'DEMO-ECA-VENDOR-07 (synthetic)'
  cert_serial          VARCHAR(64)  NULL,         -- '00:DEMO:...'
  cert_valid_from      DATE NULL,
  cert_valid_to        DATE NULL,
  PRIMARY KEY (principal_id, method_id),
  UNIQUE (method_id, username)
);

CREATE TABLE hub.auth_transactions (              -- FR-F00-02/03/04
  transaction_id   VARCHAR(26)  PRIMARY KEY,
  method_id        VARCHAR(16)  NOT NULL,
  state            VARCHAR(24)  NOT NULL CHECK (state IN
                     ('AWAITING_SELECTION','AWAITING_OTP','CONSUMED','LOCKED','EXPIRED')),
  bound_principal_id VARCHAR(26) NULL,            -- null when username did not resolve
  otp_hash         VARCHAR(128) NULL,
  attempt_count    SMALLINT     NOT NULL DEFAULT 0,
  attempted_username VARCHAR(128) NULL,
  created_at       TIMESTAMPTZ  NOT NULL,
  expires_at       TIMESTAMPTZ  NOT NULL
);

CREATE TABLE hub.sessions (                       -- FR-F01-01
  session_id          VARCHAR(26)  PRIMARY KEY,
  principal_id        VARCHAR(26)  NOT NULL REFERENCES hub.users(principal_id),
  identity_method     VARCHAR(16)  NOT NULL,
  active_role         VARCHAR(16)  NOT NULL REFERENCES hub.roles(role_id),
  status              VARCHAR(16)  NOT NULL CHECK (status IN ('ACTIVE','TERMINATED','EXPIRED')),
  auth_event_count    SMALLINT     NOT NULL DEFAULT 1,   -- asserted == 1 by SM-02
  created_at          TIMESTAMPTZ  NOT NULL,
  last_activity_at    TIMESTAMPTZ  NOT NULL,
  idle_expires_at     TIMESTAMPTZ  NOT NULL,
  absolute_expires_at TIMESTAMPTZ  NOT NULL,
  user_agent_hash     VARCHAR(64)  NOT NULL,
  ip_hash             VARCHAR(64)  NOT NULL,
  csrf_token_hash     VARCHAR(64)  NOT NULL
);
CREATE INDEX ix_sessions_principal ON hub.sessions(principal_id, status);

CREATE TABLE hub.spoke_contexts (                 -- FR-F01-04
  session_id     VARCHAR(26) NOT NULL REFERENCES hub.sessions(session_id),
  application_id VARCHAR(16) NOT NULL,
  context_handle VARCHAR(256) NOT NULL,
  established_at TIMESTAMPTZ NOT NULL,
  last_used_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (session_id, application_id)
);
```

---

### Authorization policy

```sql
CREATE TABLE hub.permissions (                    -- closed vocabulary of action strings (FR-F02-02)
  action        VARCHAR(48) PRIMARY KEY,          -- e.g. 'WORK_ITEM.ACT'
  resource_type VARCHAR(24) NOT NULL,
  description   VARCHAR(500) NOT NULL
);

CREATE TABLE hub.role_permissions (               -- the matrix, as DATA not code
  role_id VARCHAR(16) NOT NULL REFERENCES hub.roles(role_id),
  action  VARCHAR(48) NOT NULL REFERENCES hub.permissions(action),
  PRIMARY KEY (role_id, action)
);

CREATE TABLE hub.attribute_rules (                -- FR-F02-03, rule IDs surfaced in denials
  rule_id       VARCHAR(24) PRIMARY KEY,          -- e.g. 'ATTR-INV-01'
  role_id       VARCHAR(16) NOT NULL REFERENCES hub.roles(role_id),
  resource_type VARCHAR(24) NOT NULL,
  applies_to_action_pattern VARCHAR(48) NOT NULL, -- e.g. 'WORK_ITEM.*'
  expression    TEXT        NOT NULL,             -- declarative predicate over principal+resource attributes
  description   VARCHAR(500) NOT NULL,
  enabled       BOOLEAN     NOT NULL DEFAULT TRUE
);
```

---

### Application registry

```sql
CREATE TABLE hub.registered_applications (        -- FR-F08b-01
  application_id            VARCHAR(16)  PRIMARY KEY
                              CHECK (application_id ~ '^[A-Z][A-Z0-9_]{1,15}$'),
  display_name              VARCHAR(60)  NOT NULL UNIQUE,
  description               VARCHAR(500) NULL,
  adapter_type              VARCHAR(32)  NOT NULL,
  base_endpoint             VARCHAR(512) NOT NULL,
  health_endpoint           VARCHAR(512) NOT NULL,
  contract_version          VARCHAR(16)  NOT NULL,
  work_item_types           JSONB        NOT NULL,   -- [{type,label,contentProfile,statusMap,priorityNative}]
  supported_actions         JSONB        NOT NULL,   -- [{actionId,label,appliesToTypes,requiredPermission,formSchema,targetSystems}]
  capabilities              JSONB        NOT NULL,
  visible_to_roles          JSONB        NOT NULL,   -- ["INVESTIGATOR", ...] , length >= 1
  relationship_types_emitted JSONB       NOT NULL DEFAULT '[]',
  icon_token                VARCHAR(64)  NOT NULL,   -- token name, never a color or URL (NFR-03)
  timeout_ms                INTEGER      NOT NULL DEFAULT 5000  CHECK (timeout_ms BETWEEN 500 AND 30000),
  action_timeout_ms         INTEGER      NOT NULL DEFAULT 10000 CHECK (action_timeout_ms BETWEEN 1000 AND 30000),
  health_timeout_ms         INTEGER      NOT NULL DEFAULT 2000  CHECK (health_timeout_ms BETWEEN 500 AND 10000),
  max_retries               SMALLINT     NOT NULL DEFAULT 2     CHECK (max_retries BETWEEN 0 AND 5),
  backoff_initial_ms        INTEGER      NOT NULL DEFAULT 200   CHECK (backoff_initial_ms BETWEEN 50 AND 5000),
  backoff_multiplier        NUMERIC(3,1) NOT NULL DEFAULT 2.0   CHECK (backoff_multiplier BETWEEN 1.0 AND 4.0),
  backoff_jitter_pct        SMALLINT     NOT NULL DEFAULT 20    CHECK (backoff_jitter_pct BETWEEN 0 AND 50),
  circuit_failure_threshold SMALLINT     NOT NULL DEFAULT 5     CHECK (circuit_failure_threshold BETWEEN 2 AND 50),
  circuit_open_ms           INTEGER      NOT NULL DEFAULT 30000 CHECK (circuit_open_ms BETWEEN 5000 AND 300000),
  circuit_half_open_probes  SMALLINT     NOT NULL DEFAULT 1     CHECK (circuit_half_open_probes BETWEEN 1 AND 5),
  health_probe_interval_sec INTEGER      NOT NULL DEFAULT 30    CHECK (health_probe_interval_sec BETWEEN 10 AND 600),
  degraded_latency_ms       INTEGER      NOT NULL DEFAULT 1500,
  enabled                   BOOLEAN      NOT NULL DEFAULT TRUE,
  config_state              VARCHAR(16)  NOT NULL DEFAULT 'VALID'
                              CHECK (config_state IN ('VALID','INVALID','INCOMPATIBLE')),
  config_problem            VARCHAR(500) NULL,
  is_demo_sixth_app         BOOLEAN      NOT NULL DEFAULT FALSE,
  last_describe_at          TIMESTAMPTZ  NULL,
  last_describe_payload     JSONB        NULL,
  registered_at             TIMESTAMPTZ  NOT NULL,
  registered_by             VARCHAR(26)  NOT NULL REFERENCES hub.users(principal_id),
  updated_at                TIMESTAMPTZ  NULL,
  updated_by                VARCHAR(26)  NULL
);

CREATE TABLE hub.retired_application_ids (        -- FR-F12-02 rule 2: IDs are never reused
  application_id VARCHAR(16) PRIMARY KEY,
  display_name   VARCHAR(60) NOT NULL,
  retired_at     TIMESTAMPTZ NOT NULL,
  retired_by     VARCHAR(26) NOT NULL
);

CREATE TABLE hub.registry_version (               -- single row; bumped on any registry change
  id              SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  version         BIGINT   NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE hub.application_registration_drafts (  -- FR-F12-01 rule 3
  draft_id       VARCHAR(26) PRIMARY KEY,
  session_id     VARCHAR(26) NOT NULL REFERENCES hub.sessions(session_id),
  payload        JSONB       NOT NULL,
  test_result    JSONB       NULL,
  test_result_at TIMESTAMPTZ NULL,
  created_at     TIMESTAMPTZ NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL
);
```

---

### Health and integration issues

```sql
CREATE TABLE hub.application_health (             -- current state, one row per application
  application_id       VARCHAR(16) PRIMARY KEY REFERENCES hub.registered_applications(application_id),
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

CREATE TABLE hub.application_health_checks (      -- rolling history, last 500 per application
  check_id       BIGSERIAL   PRIMARY KEY,
  application_id VARCHAR(16) NOT NULL,
  checked_at     TIMESTAMPTZ NOT NULL,
  status         VARCHAR(12) NOT NULL,
  latency_ms     INTEGER     NULL,
  error_class    VARCHAR(40) NULL,
  detail         VARCHAR(500) NULL
);
CREATE INDEX ix_health_checks_app_time ON hub.application_health_checks(application_id, checked_at DESC);

CREATE TABLE hub.integration_issues (             -- FR-F16-09, append-only
  issue_id            VARCHAR(26)  PRIMARY KEY,
  occurred_at         TIMESTAMPTZ  NOT NULL,
  application_id      VARCHAR(16)  NOT NULL,
  application_display_name VARCHAR(60) NOT NULL,   -- denormalized: survives de-registration
  operation           VARCHAR(40)  NOT NULL,
  error_class         VARCHAR(40)  NOT NULL,
  spoke_http_status   SMALLINT     NULL,
  response_excerpt    VARCHAR(1000) NULL,          -- escaped; admin-only surface
  attempt             SMALLINT     NOT NULL DEFAULT 1,
  circuit_state_at_failure VARCHAR(12) NULL,
  principal_id        VARCHAR(26)  NULL,
  correlation_id      VARCHAR(26)  NOT NULL,
  adapter_request_id  VARCHAR(26)  NULL,
  orchestration_tx_id VARCHAR(26)  NULL
);
CREATE INDEX ix_issues_time  ON hub.integration_issues(occurred_at DESC);
CREATE INDEX ix_issues_app   ON hub.integration_issues(application_id, occurred_at DESC);
CREATE INDEX ix_issues_corr  ON hub.integration_issues(correlation_id);
```

---

### Audit (append-only)

```sql
CREATE TABLE hub.audit_events (                   -- FR-F13-02; INSERT + SELECT grants ONLY
  audit_id                  VARCHAR(26)  PRIMARY KEY,
  sequence_number           BIGSERIAL    NOT NULL UNIQUE,
  occurred_at               TIMESTAMPTZ  NOT NULL,
  actor_principal_id        VARCHAR(26)  NULL,     -- null only for pre-auth failures
  actor_display_name        VARCHAR(120) NULL,
  actor_roles_at_action     JSONB        NULL,
  actor_active_role_at_action VARCHAR(16) NULL,
  actor_attributes_at_action  JSONB       NULL,    -- snapshot: later changes cannot rewrite history
  action_type               VARCHAR(48)  NOT NULL,
  target_system             VARCHAR(16)  NOT NULL, -- 'HUB' or applicationId
  target_system_display_name VARCHAR(60) NOT NULL, -- denormalized for post-de-registration legibility
  target_resource_type      VARCHAR(24)  NULL,
  target_resource_id        VARCHAR(96)  NULL,
  outcome                   VARCHAR(10)  NOT NULL
                              CHECK (outcome IN ('SUCCESS','FAILURE','DENIED','PARTIAL')),
  reason_code               VARCHAR(48)  NULL,
  policy_rule_id            VARCHAR(24)  NULL,
  before_summary            VARCHAR(500) NULL,
  after_summary             VARCHAR(500) NULL,
  correlation_id            VARCHAR(26)  NOT NULL,
  request_id                VARCHAR(26)  NOT NULL,
  adapter_request_id        VARCHAR(26)  NULL,
  session_id                VARCHAR(26)  NULL,
  identity_method           VARCHAR(16)  NULL,
  client_ip_hash            VARCHAR(64)  NULL,
  client_user_agent_hash    VARCHAR(64)  NULL,
  previous_record_hash      VARCHAR(64)  NOT NULL,
  record_hash               VARCHAR(64)  NOT NULL
);
CREATE INDEX ix_audit_time    ON hub.audit_events(occurred_at DESC);
CREATE INDEX ix_audit_actor   ON hub.audit_events(actor_principal_id, occurred_at DESC);
CREATE INDEX ix_audit_corr    ON hub.audit_events(correlation_id, sequence_number);
CREATE INDEX ix_audit_target  ON hub.audit_events(target_system, target_resource_id);
CREATE INDEX ix_audit_action  ON hub.audit_events(action_type, occurred_at DESC);

-- Immutability is enforced at the grant, not in code (FR-F13-03 rule 2):
GRANT INSERT, SELECT ON hub.audit_events TO hub_service;
REVOKE UPDATE, DELETE, TRUNCATE ON hub.audit_events FROM hub_service;

CREATE TABLE hub.audit_action_types (             -- closed vocabulary; startup-validated
  action_type VARCHAR(48) PRIMARY KEY,
  category    VARCHAR(24) NOT NULL,
  description VARCHAR(500) NOT NULL,
  is_mutation BOOLEAN     NOT NULL
);
```

---

### Orchestration

```sql
CREATE TABLE hub.orchestration_definitions (      -- FR-F07b-07: workflows are configuration
  workflow_id     VARCHAR(48) PRIMARY KEY,        -- e.g. 'RESOLVE_PVQ_ISSUE'
  display_name    VARCHAR(120) NOT NULL,
  legs            JSONB       NOT NULL,           -- [{applicationId,operation,payloadMapping,required,order}]
  preconditions   JSONB       NOT NULL,
  on_leg_failure  VARCHAR(20) NOT NULL CHECK (on_leg_failure IN ('ABORT','FORWARD_RECOVER')),
  retry_schedule_sec JSONB    NOT NULL DEFAULT '[5,15,45,135]',
  enabled         BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE hub.orchestration_transactions (     -- FR-F07b-01 step 5
  transaction_id  VARCHAR(26)  PRIMARY KEY,
  workflow_id     VARCHAR(48)  NOT NULL REFERENCES hub.orchestration_definitions(workflow_id),
  correlation_id  VARCHAR(26)  NOT NULL,
  principal_id    VARCHAR(26)  NOT NULL REFERENCES hub.users(principal_id),
  idempotency_key VARCHAR(26)  NOT NULL UNIQUE,
  state           VARCHAR(24)  NOT NULL CHECK (state IN
                    ('IN_PROGRESS','COMPLETED','PARTIALLY_COMPLETED','FAILED',
                     'INDETERMINATE','NEEDS_ATTENTION','AUDIT_GAP')),
  legs            JSONB        NOT NULL,          -- [{system,operation,state,stateBefore,stateAfter,errorClass,attempts}]
  request_payload JSONB        NOT NULL,
  result_payload  JSONB        NULL,
  created_at      TIMESTAMPTZ  NOT NULL,
  completed_at    TIMESTAMPTZ  NULL
);
CREATE INDEX ix_orch_state ON hub.orchestration_transactions(state, created_at);
CREATE INDEX ix_orch_corr  ON hub.orchestration_transactions(correlation_id);

CREATE TABLE hub.orchestration_retry_queue (      -- FR-F07b-03 rule 3
  retry_id        VARCHAR(26) PRIMARY KEY,
  transaction_id  VARCHAR(26) NOT NULL REFERENCES hub.orchestration_transactions(transaction_id),
  application_id  VARCHAR(16) NOT NULL,
  operation       VARCHAR(40) NOT NULL,
  payload         JSONB       NOT NULL,
  attempts        SMALLINT    NOT NULL DEFAULT 0,
  max_attempts    SMALLINT    NOT NULL DEFAULT 4,
  next_attempt_at TIMESTAMPTZ NOT NULL,
  last_error_class VARCHAR(40) NULL,
  state           VARCHAR(16) NOT NULL DEFAULT 'PENDING'
                    CHECK (state IN ('PENDING','SUCCEEDED','EXHAUSTED'))
);
CREATE INDEX ix_retry_due ON hub.orchestration_retry_queue(state, next_attempt_at);

CREATE TABLE hub.idempotency_records (            -- FR-F06-04 rule 6
  idempotency_key VARCHAR(26)  PRIMARY KEY,
  principal_id    VARCHAR(26)  NOT NULL,
  endpoint        VARCHAR(160) NOT NULL,
  request_hash    VARCHAR(64)  NOT NULL,
  response_status SMALLINT     NOT NULL,
  response_body   JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL,
  expires_at      TIMESTAMPTZ  NOT NULL
);
```

---

### Notifications, announcements, and view state

```sql
CREATE TABLE hub.announcements (                  -- FR-F11-06
  announcement_id VARCHAR(26)  PRIMARY KEY,
  title           VARCHAR(120) NOT NULL,
  body            VARCHAR(2000) NOT NULL,         -- plain text; escaped on render
  severity        VARCHAR(12)  NOT NULL CHECK (severity IN ('INFO','WARNING','EMERGENCY')),
  target_roles    JSONB        NOT NULL,          -- length >= 1
  dismissible     BOOLEAN      NOT NULL DEFAULT TRUE,  -- forced FALSE when severity='EMERGENCY'
  action_href     VARCHAR(512) NULL,
  action_label    VARCHAR(60)  NULL,
  effective_from  TIMESTAMPTZ  NOT NULL,
  expires_at      TIMESTAMPTZ  NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL,
  created_by      VARCHAR(26)  NOT NULL REFERENCES hub.users(principal_id),
  updated_at      TIMESTAMPTZ  NULL,
  updated_by      VARCHAR(26)  NULL,
  CHECK (effective_from < expires_at)
);

CREATE TABLE hub.announcement_dismissals (        -- per user, per announcement
  announcement_id VARCHAR(26) NOT NULL REFERENCES hub.announcements(announcement_id),
  principal_id    VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  dismissed_at    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (announcement_id, principal_id)
);

CREATE TABLE hub.alert_read_state (               -- FR-F15-03; alerts themselves are derived, not stored
  principal_id VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  alert_id     VARCHAR(64) NOT NULL,              -- deterministic hash of ruleId + workItemId
  read_at      TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (principal_id, alert_id)
);

CREATE TABLE hub.queue_default_views (            -- FR-F05-08; per role, configuration
  role_id     VARCHAR(16) PRIMARY KEY REFERENCES hub.roles(role_id),
  filters     JSONB       NOT NULL,
  sort_field  VARCHAR(24) NOT NULL,
  sort_dir    VARCHAR(4)  NOT NULL CHECK (sort_dir IN ('asc','desc')),
  page_size   SMALLINT    NOT NULL DEFAULT 25
);

CREATE TABLE hub.user_view_preferences (          -- per principal override
  principal_id VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  view_key     VARCHAR(32) NOT NULL,              -- 'WORK_QUEUE' | 'AUDIT' | ...
  filters      JSONB       NOT NULL,
  sort_field   VARCHAR(24) NOT NULL,
  sort_dir     VARCHAR(4)  NOT NULL,
  page_size    SMALLINT    NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (principal_id, view_key)
);

CREATE TABLE hub.dashboard_compositions (         -- FR-F04-01; widget sets are configuration
  role_id    VARCHAR(16) NOT NULL REFERENCES hub.roles(role_id),
  widget_id  VARCHAR(40) NOT NULL,
  title      VARCHAR(80) NOT NULL,
  data_source VARCHAR(40) NOT NULL,
  href       VARCHAR(160) NOT NULL,
  sort_order SMALLINT    NOT NULL,
  PRIMARY KEY (role_id, widget_id)
);

CREATE TABLE hub.work_item_counts_cache (         -- FR-F05-05 rule 2: quantifying "12 items are not shown"
  principal_id   VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  application_id VARCHAR(16) NOT NULL,
  item_count     INTEGER     NOT NULL,
  counted_at     TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (principal_id, application_id)
);

CREATE TABLE hub.operator_tokens (                -- FR-F09-08; short-lived spoke-query assertions
  token_id     VARCHAR(26) PRIMARY KEY,
  issued_to    VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  audience     VARCHAR(16) NOT NULL,
  issued_at    TIMESTAMPTZ NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ NULL
);
```

---

### Schema notes

1. **No table in `hub` references any spoke table.** `user_case_assignments.native_case_id`, `integration_issues.application_id`, and `audit_events.target_resource_id` are opaque strings by design.
2. **Denormalized display names** (`integration_issues.application_display_name`, `audit_events.target_system_display_name`) exist so history stays legible after an application is de-registered (`FR-F12-07` rule 6).
3. **`audit_events` has no UPDATE or DELETE grant.** This is the enforcement; application-level discipline is the secondary control (`FR-F13-03`).
4. **`hub.registry_version`** is a single-row table deliberately, so a client can poll one value rather than diffing a list.
5. **Alerts are not stored** — only read state is. Storing derived alerts would create a second source of truth that could disagree with the queue (`FR-F15-01` rule 2).

---
