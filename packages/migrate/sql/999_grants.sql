-- ============================================================================
-- 999_grants.sql — applied last, after every table exists
-- From TechArch/03-data-model-hub.md §3.8. These table- and sequence-level
-- grants layer onto the USAGE grants 000_bootstrap.sql established: exactly one
-- schema per role, no exceptions and no cross-schema grant anywhere.
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA hub TO hub_service;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA hub TO hub_service;

-- Integration issues are append-only, for the same reason as the audit trail at
-- lower stakes: the append-only property is a database grant, not application
-- discipline, so no code path and no future refactor can create an edit path.
REVOKE UPDATE, DELETE ON hub.integration_issues FROM hub_service;

-- PHASE BOUNDARY. The hub.audit_events revoke/grant exception from TechArch §3.8
-- belongs to Phase 2 (F13), when that table is created. It is deliberately
-- omitted here rather than forgotten:
--   REVOKE ALL            ON hub.audit_events FROM hub_service;
--   GRANT  INSERT, SELECT ON hub.audit_events TO   hub_service;
--   GRANT  USAGE, SELECT  ON SEQUENCE hub.audit_events_sequence_number_seq TO hub_service;

-- Symmetric per-spoke grants, one schema per role, no exceptions.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA eapp TO eapp_service;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA eapp TO eapp_service;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA pvq TO pvq_service;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA pvq TO pvq_service;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA iep TO iep_service;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA iep TO iep_service;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA pdt TO pdt_service;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA pdt TO pdt_service;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA im TO im_service;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA im TO im_service;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA cvs TO cvs_service;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA cvs TO cvs_service;
