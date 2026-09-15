-- ============================================================================
-- 020_hub_policy.sql — the authorization matrix held as DATA, not code branches
-- Copied verbatim from TechArch/03-data-model-hub.md §3.4 (policy subset).
--
-- Why hub.permissions is in Phase 1 even though the PDP is Phase 2: FR-F08a-02
-- rule 4 and FR-F08b-06 rule 1 require registry startup validation to reject an
-- application whose supportedActions[].requiredPermission is not present in the
-- role matrix. The table must exist and be populated for that check to mean
-- anything. Plan 01-05 seeds the permission rows; Phase 2 fills role_permissions
-- and attribute_rules and implements the decision function.
-- ============================================================================

CREATE TABLE hub.permissions (
  action        VARCHAR(48)  PRIMARY KEY,        -- e.g. 'WORK_ITEM.ACT'
  resource_type VARCHAR(24)  NOT NULL,
  description   VARCHAR(500) NOT NULL
);

CREATE TABLE hub.role_permissions (
  role_id VARCHAR(16) NOT NULL REFERENCES hub.roles(role_id),
  action  VARCHAR(48) NOT NULL REFERENCES hub.permissions(action),
  PRIMARY KEY (role_id, action)
);

CREATE TABLE hub.attribute_rules (
  rule_id                   VARCHAR(24)  PRIMARY KEY,   -- 'ATTR-INV-01'; surfaced in denials
  role_id                   VARCHAR(16)  NOT NULL REFERENCES hub.roles(role_id),
  resource_type             VARCHAR(24)  NOT NULL,
  applies_to_action_pattern VARCHAR(48)  NOT NULL,      -- 'WORK_ITEM.*'
  expression                TEXT         NOT NULL,      -- declarative predicate (see chunk 08)
  description               VARCHAR(500) NOT NULL,
  enabled                   BOOLEAN      NOT NULL DEFAULT TRUE
);
CREATE INDEX ix_attr_rules_role ON hub.attribute_rules(role_id, resource_type) WHERE enabled;
