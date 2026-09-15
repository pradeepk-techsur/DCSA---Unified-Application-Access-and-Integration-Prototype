-- ============================================================================
-- 900_spoke_ops.sql — the two operational tables every spoke carries
-- Expanded from the shared template in TechArch/04-data-model-spokes.md §4.1
-- for each of the six namespaces: eapp, pvq, iep, pdt, im, cvs.
--
-- Injection state lives INSIDE each spoke's own schema deliberately: the failure
-- is genuinely inside the service being demonstrated, not a hub-side mock that
-- intercepts calls. A reviewer who inspects the spoke sees a service that is
-- actually misbehaving.
-- ============================================================================

-- ---- eapp ------------------------------------------------------------------
CREATE TABLE eapp.idempotency_records (          -- FR-F09-07 rule 3
  idempotency_key VARCHAR(26)  PRIMARY KEY,
  request_hash    VARCHAR(64)  NOT NULL,
  response_status SMALLINT     NOT NULL,
  response_body   JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ  NOT NULL          -- created_at + 24h
);
CREATE INDEX ix_eapp_idem_expiry ON eapp.idempotency_records(expires_at);

CREATE TABLE eapp.injection_state (              -- FR-F16-11, demo failure injection
  id             SMALLINT    PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode           VARCHAR(16) NOT NULL DEFAULT 'NORMAL'
                   CHECK (mode IN ('NORMAL','UNAVAILABLE','SLOW','ERROR')),
  slow_ms        INTEGER     NULL CHECK (slow_ms BETWEEN 100 AND 30000),
  error_rate_pct SMALLINT    NULL CHECK (error_rate_pct BETWEEN 1 AND 100),
  expires_at     TIMESTAMPTZ NULL
);
INSERT INTO eapp.injection_state (id, mode) VALUES (1, 'NORMAL');

-- ---- pvq -------------------------------------------------------------------
CREATE TABLE pvq.idempotency_records (           -- FR-F09-07 rule 3
  idempotency_key VARCHAR(26)  PRIMARY KEY,
  request_hash    VARCHAR(64)  NOT NULL,
  response_status SMALLINT     NOT NULL,
  response_body   JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ  NOT NULL          -- created_at + 24h
);
CREATE INDEX ix_pvq_idem_expiry ON pvq.idempotency_records(expires_at);

CREATE TABLE pvq.injection_state (               -- FR-F16-11, demo failure injection
  id             SMALLINT    PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode           VARCHAR(16) NOT NULL DEFAULT 'NORMAL'
                   CHECK (mode IN ('NORMAL','UNAVAILABLE','SLOW','ERROR')),
  slow_ms        INTEGER     NULL CHECK (slow_ms BETWEEN 100 AND 30000),
  error_rate_pct SMALLINT    NULL CHECK (error_rate_pct BETWEEN 1 AND 100),
  expires_at     TIMESTAMPTZ NULL
);
INSERT INTO pvq.injection_state (id, mode) VALUES (1, 'NORMAL');

-- ---- iep -------------------------------------------------------------------
CREATE TABLE iep.idempotency_records (           -- FR-F09-07 rule 3
  idempotency_key VARCHAR(26)  PRIMARY KEY,
  request_hash    VARCHAR(64)  NOT NULL,
  response_status SMALLINT     NOT NULL,
  response_body   JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ  NOT NULL          -- created_at + 24h
);
CREATE INDEX ix_iep_idem_expiry ON iep.idempotency_records(expires_at);

CREATE TABLE iep.injection_state (               -- FR-F16-11, demo failure injection
  id             SMALLINT    PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode           VARCHAR(16) NOT NULL DEFAULT 'NORMAL'
                   CHECK (mode IN ('NORMAL','UNAVAILABLE','SLOW','ERROR')),
  slow_ms        INTEGER     NULL CHECK (slow_ms BETWEEN 100 AND 30000),
  error_rate_pct SMALLINT    NULL CHECK (error_rate_pct BETWEEN 1 AND 100),
  expires_at     TIMESTAMPTZ NULL
);
INSERT INTO iep.injection_state (id, mode) VALUES (1, 'NORMAL');

-- ---- pdt -------------------------------------------------------------------
CREATE TABLE pdt.idempotency_records (           -- FR-F09-07 rule 3
  idempotency_key VARCHAR(26)  PRIMARY KEY,
  request_hash    VARCHAR(64)  NOT NULL,
  response_status SMALLINT     NOT NULL,
  response_body   JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ  NOT NULL          -- created_at + 24h
);
CREATE INDEX ix_pdt_idem_expiry ON pdt.idempotency_records(expires_at);

CREATE TABLE pdt.injection_state (               -- FR-F16-11, demo failure injection
  id             SMALLINT    PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode           VARCHAR(16) NOT NULL DEFAULT 'NORMAL'
                   CHECK (mode IN ('NORMAL','UNAVAILABLE','SLOW','ERROR')),
  slow_ms        INTEGER     NULL CHECK (slow_ms BETWEEN 100 AND 30000),
  error_rate_pct SMALLINT    NULL CHECK (error_rate_pct BETWEEN 1 AND 100),
  expires_at     TIMESTAMPTZ NULL
);
INSERT INTO pdt.injection_state (id, mode) VALUES (1, 'NORMAL');

-- ---- im --------------------------------------------------------------------
CREATE TABLE im.idempotency_records (            -- FR-F09-07 rule 3
  idempotency_key VARCHAR(26)  PRIMARY KEY,
  request_hash    VARCHAR(64)  NOT NULL,
  response_status SMALLINT     NOT NULL,
  response_body   JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ  NOT NULL          -- created_at + 24h
);
CREATE INDEX ix_im_idem_expiry ON im.idempotency_records(expires_at);

CREATE TABLE im.injection_state (                -- FR-F16-11, demo failure injection
  id             SMALLINT    PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode           VARCHAR(16) NOT NULL DEFAULT 'NORMAL'
                   CHECK (mode IN ('NORMAL','UNAVAILABLE','SLOW','ERROR')),
  slow_ms        INTEGER     NULL CHECK (slow_ms BETWEEN 100 AND 30000),
  error_rate_pct SMALLINT    NULL CHECK (error_rate_pct BETWEEN 1 AND 100),
  expires_at     TIMESTAMPTZ NULL
);
INSERT INTO im.injection_state (id, mode) VALUES (1, 'NORMAL');

-- ---- cvs -------------------------------------------------------------------
CREATE TABLE cvs.idempotency_records (           -- FR-F09-07 rule 3
  idempotency_key VARCHAR(26)  PRIMARY KEY,
  request_hash    VARCHAR(64)  NOT NULL,
  response_status SMALLINT     NOT NULL,
  response_body   JSONB        NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ  NOT NULL          -- created_at + 24h
);
CREATE INDEX ix_cvs_idem_expiry ON cvs.idempotency_records(expires_at);

CREATE TABLE cvs.injection_state (               -- FR-F16-11, demo failure injection
  id             SMALLINT    PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode           VARCHAR(16) NOT NULL DEFAULT 'NORMAL'
                   CHECK (mode IN ('NORMAL','UNAVAILABLE','SLOW','ERROR')),
  slow_ms        INTEGER     NULL CHECK (slow_ms BETWEEN 100 AND 30000),
  error_rate_pct SMALLINT    NULL CHECK (error_rate_pct BETWEEN 1 AND 100),
  expires_at     TIMESTAMPTZ NULL
);
INSERT INTO cvs.injection_state (id, mode) VALUES (1, 'NORMAL');
