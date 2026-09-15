-- ============================================================================
-- 010_hub_identity.sql
-- Copied verbatim from TechArch/03-data-model-hub.md §3.4 (identity subset).
--
-- PHASE BOUNDARY. Phase 1 ships only the identity tables F8/F9/F17 require.
-- hub.auth_transactions, hub.sessions and hub.spoke_contexts (also §3.4) belong
-- to Phase 2 (F0/F1) and are deliberately omitted here; the runner applies files
-- in filename order, so Phase 2 appends 050_*/060_* without touching this file.
-- ============================================================================

CREATE TABLE hub.users (
  principal_id        VARCHAR(26)  PRIMARY KEY,                 -- ULID
  display_name        VARCHAR(120) NOT NULL,
  subject_ref         VARCHAR(32)  NULL,                        -- non-null only for APPLICANT
  organization        VARCHAR(64)  NOT NULL,
  clearance_tier      VARCHAR(4)   NOT NULL CHECK (clearance_tier IN ('T1','T3','T5')),
  assigned_region     VARCHAR(32)  NOT NULL,
  enabled             BOOLEAN      NOT NULL DEFAULT TRUE,
  synthetic_marker    VARCHAR(16)  NOT NULL DEFAULT 'DEMO-SYNTHETIC',
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  last_activity_at    TIMESTAMPTZ  NULL
);
CREATE INDEX ix_users_subject ON hub.users(subject_ref) WHERE subject_ref IS NOT NULL;

CREATE TABLE hub.roles (
  role_id     VARCHAR(16)  PRIMARY KEY,   -- INVESTIGATOR|ADJUDICATOR|APPLICANT|ADMINISTRATOR
  label       VARCHAR(64)  NOT NULL,
  description VARCHAR(500) NOT NULL
);

CREATE TABLE hub.user_roles (
  principal_id VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  role_id      VARCHAR(16) NOT NULL REFERENCES hub.roles(role_id),
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by  VARCHAR(26) NULL,
  PRIMARY KEY (principal_id, role_id)
);
CREATE INDEX ix_user_roles_role ON hub.user_roles(role_id);

-- ABAC input. native_case_id deliberately has NO foreign key: the case lives in
-- another service's schema and the hub must not be able to join to it.
CREATE TABLE hub.user_case_assignments (
  principal_id   VARCHAR(26) NOT NULL REFERENCES hub.users(principal_id),
  source_system  VARCHAR(16) NOT NULL,
  native_case_id VARCHAR(64) NOT NULL,
  assigned_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (principal_id, source_system, native_case_id)
);

CREATE TABLE hub.user_auth_methods (
  principal_id     VARCHAR(26)  NOT NULL REFERENCES hub.users(principal_id),
  method_id        VARCHAR(16)  NOT NULL CHECK (method_id IN ('CAC_PIV','ECA','GENERIC_MFA')),
  username         VARCHAR(128) NULL,                    -- GENERIC_MFA only
  cert_subject_cn  VARCHAR(160) NULL,                    -- synthetic; never parsed
  cert_subject_org VARCHAR(160) NULL,
  cert_issuer      VARCHAR(160) NULL,                    -- 'DEMO-DOD-CA-59 (synthetic)'
  cert_serial      VARCHAR(64)  NULL,                    -- '00:DEMO:...'
  cert_valid_from  DATE NULL,
  cert_valid_to    DATE NULL,
  PRIMARY KEY (principal_id, method_id),
  UNIQUE (method_id, username)
);
