-- ============================================================================
-- SentinelChain – AI Powered Blockchain Evidence Chain
-- PostgreSQL Database Schema
-- Version: 2.0.0
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";         -- Password hashing (bcrypt)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- Trigram fuzzy text search

-- ============================================================================
-- 1. ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'admin',
    'investigator',
    'analyst',
    'viewer'
);

CREATE TYPE case_status AS ENUM (
    'open',
    'active',
    'under_review',
    'closed',
    'archived'
);

CREATE TYPE case_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE evidence_status AS ENUM (
    'pending',
    'processing',
    'verified',
    'flagged',
    'rejected',
    'archived'
);

CREATE TYPE evidence_category AS ENUM (
    'document',
    'image',
    'video',
    'audio',
    'digital_forensics',
    'email',
    'log_file',
    'other'
);

CREATE TYPE audit_action AS ENUM (
    'USER_LOGIN',
    'USER_LOGOUT',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DELETED',
    'CASE_CREATED',
    'CASE_UPDATED',
    'CASE_CLOSED',
    'EVIDENCE_UPLOADED',
    'EVIDENCE_VERIFIED',
    'EVIDENCE_FLAGGED',
    'EVIDENCE_REJECTED',
    'EVIDENCE_DELETED',
    'EVIDENCE_DOWNLOADED',
    'CUSTODY_TRANSFERRED',
    'BLOCKCHAIN_SUBMITTED',
    'BLOCKCHAIN_VERIFIED',
    'AI_ANALYSIS_REQUESTED',
    'AI_ANALYSIS_COMPLETED',
    'SETTINGS_CHANGED'
);

CREATE TYPE tx_status AS ENUM (
    'pending',
    'submitted',
    'confirmed',
    'failed',
    'reverted'
);

CREATE TYPE tx_type AS ENUM (
    'evidence_submission',
    'evidence_verification',
    'custody_transfer',
    'status_update',
    'verifier_management'
);

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1  USERS
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- identity
    first_name        VARCHAR(100)  NOT NULL,
    last_name         VARCHAR(100)  NOT NULL,
    email             VARCHAR(255)  NOT NULL,
    password_hash     VARCHAR(255)  NOT NULL,
    phone             VARCHAR(20),

    -- role & access
    role              user_role     NOT NULL DEFAULT 'viewer',
    department        VARCHAR(150),
    badge_number      VARCHAR(50),
    is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
    email_verified    BOOLEAN       NOT NULL DEFAULT FALSE,

    -- blockchain
    wallet_address    VARCHAR(42),

    -- profile
    avatar_url        TEXT,
    bio               TEXT,
    last_login_at     TIMESTAMP WITH TIME ZONE,
    last_login_ip     INET,

    -- timestamps
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- constraints
    CONSTRAINT uq_users_email          UNIQUE (email),
    CONSTRAINT uq_users_wallet         UNIQUE (wallet_address),
    CONSTRAINT ck_users_email_format   CHECK  (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE  users IS 'Platform users – investigators, analysts, admins, viewers';
COMMENT ON COLUMN users.wallet_address IS 'Ethereum-compatible wallet address (0x + 40 hex chars)';

-- ----------------------------------------------------------------------------
-- 2.2  CASES
-- ----------------------------------------------------------------------------
CREATE TABLE cases (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- identification
    case_number       VARCHAR(50)   NOT NULL,
    title             VARCHAR(255)  NOT NULL,
    description       TEXT,

    -- classification
    status            case_status   NOT NULL DEFAULT 'open',
    priority          case_priority NOT NULL DEFAULT 'medium',
    category          VARCHAR(100),
    tags              TEXT[],

    -- assignment
    created_by        UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to       UUID          REFERENCES users(id) ON DELETE SET NULL,

    -- dates
    opened_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at         TIMESTAMP WITH TIME ZONE,
    due_date          DATE,

    -- metadata
    metadata          JSONB         DEFAULT '{}',
    notes             TEXT,

    -- timestamps
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- constraints
    CONSTRAINT uq_cases_case_number UNIQUE (case_number)
);

COMMENT ON TABLE  cases IS 'Investigation cases that group related evidence items';
COMMENT ON COLUMN cases.case_number IS 'Human-readable case identifier (e.g., SC-2026-00042)';

-- ----------------------------------------------------------------------------
-- 2.3  EVIDENCE
-- ----------------------------------------------------------------------------
CREATE TABLE evidence (
    id                    UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- parent case
    case_id               UUID              NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,

    -- descriptive
    title                 VARCHAR(255)      NOT NULL,
    description           TEXT,
    category              evidence_category NOT NULL DEFAULT 'other',
    status                evidence_status   NOT NULL DEFAULT 'pending',

    -- file info
    original_file_name    VARCHAR(255)      NOT NULL,
    file_type             VARCHAR(100)      NOT NULL,
    file_size             BIGINT            NOT NULL CHECK (file_size > 0),
    file_hash_sha256      VARCHAR(64)       NOT NULL,
    file_hash_md5         VARCHAR(32),

    -- IPFS / decentralised storage
    ipfs_hash             VARCHAR(255),
    ipfs_url              TEXT,

    -- blockchain anchoring
    contract_evidence_id  INTEGER,

    -- classification & search
    tags                  TEXT[],
    metadata              JSONB             DEFAULT '{}',

    -- AI analysis
    ai_analysis           JSONB             DEFAULT '{}',
    ai_confidence_score   DECIMAL(5,4)      CHECK (ai_confidence_score BETWEEN 0 AND 1),
    ai_risk_level         VARCHAR(20),

    -- ownership
    uploaded_by           UUID              NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verified_by           UUID              REFERENCES users(id) ON DELETE SET NULL,
    verified_at           TIMESTAMP WITH TIME ZONE,

    -- timestamps
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- constraints
    CONSTRAINT uq_evidence_file_hash UNIQUE (file_hash_sha256)
);

COMMENT ON TABLE  evidence IS 'Digital evidence items linked to investigation cases';
COMMENT ON COLUMN evidence.file_hash_sha256 IS 'SHA-256 hash ensuring uniqueness and integrity';
COMMENT ON COLUMN evidence.ipfs_hash IS 'Content-addressable IPFS CID from Pinata';

-- ----------------------------------------------------------------------------
-- 2.4  BLOCKCHAIN_TRANSACTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE blockchain_transactions (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- linked entities
    evidence_id         UUID        REFERENCES evidence(id) ON DELETE SET NULL,
    initiated_by        UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- transaction data
    tx_hash             VARCHAR(66) NOT NULL,
    block_number        BIGINT,
    block_hash          VARCHAR(66),
    from_address        VARCHAR(42) NOT NULL,
    to_address          VARCHAR(42) NOT NULL,
    gas_used            BIGINT,
    gas_price_gwei      DECIMAL(20,9),
    tx_fee_matic        DECIMAL(30,18),

    -- classification
    tx_type             tx_type     NOT NULL,
    status              tx_status   NOT NULL DEFAULT 'pending',

    -- network
    network_name        VARCHAR(50) NOT NULL DEFAULT 'polygon_amoy',
    chain_id            INTEGER     NOT NULL DEFAULT 80002,

    -- payload
    input_data          TEXT,
    decoded_data        JSONB       DEFAULT '{}',
    contract_address    VARCHAR(42),
    event_logs          JSONB       DEFAULT '[]',

    -- error handling
    error_message       TEXT,
    retry_count         INTEGER     NOT NULL DEFAULT 0,

    -- timing
    submitted_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at        TIMESTAMP WITH TIME ZONE,

    -- timestamps
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- constraints
    CONSTRAINT uq_blockchain_tx_hash UNIQUE (tx_hash)
);

COMMENT ON TABLE  blockchain_transactions IS 'On-chain transaction records for evidence anchoring on Polygon Amoy';
COMMENT ON COLUMN blockchain_transactions.tx_hash IS 'Keccak-256 transaction hash (0x + 64 hex chars)';

-- ----------------------------------------------------------------------------
-- 2.5  AUDIT_LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- who
    user_id           UUID          REFERENCES users(id) ON DELETE SET NULL,
    user_email        VARCHAR(255),
    user_role         user_role,

    -- what
    action            audit_action  NOT NULL,
    entity_type       VARCHAR(100)  NOT NULL,
    entity_id         UUID,

    -- context
    description       TEXT,
    details           JSONB         DEFAULT '{}',
    old_values        JSONB,
    new_values        JSONB,

    -- request metadata
    ip_address        INET,
    user_agent        TEXT,
    request_method    VARCHAR(10),
    request_path      TEXT,

    -- timestamp (audit logs are immutable — no updated_at)
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  audit_logs IS 'Immutable audit trail of every significant action in the platform';
COMMENT ON COLUMN audit_logs.old_values IS 'Snapshot of entity state before the action';
COMMENT ON COLUMN audit_logs.new_values IS 'Snapshot of entity state after the action';

-- ----------------------------------------------------------------------------
-- 2.6  CHAIN_OF_CUSTODY  (junction / log table)
-- ----------------------------------------------------------------------------
CREATE TABLE chain_of_custody (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

    evidence_id       UUID        NOT NULL REFERENCES evidence(id) ON DELETE RESTRICT,
    from_user_id      UUID        NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
    to_user_id        UUID        NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,

    action            VARCHAR(100) NOT NULL,
    reason            TEXT,
    notes             TEXT,

    -- blockchain proof
    tx_id             UUID         REFERENCES blockchain_transactions(id) ON DELETE SET NULL,

    -- location / device context
    location          VARCHAR(255),
    device_info       VARCHAR(255),

    -- timestamp
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE chain_of_custody IS 'Tamper-proof chain-of-custody log for evidence transfers';

-- ----------------------------------------------------------------------------
-- 2.7  VERIFICATION_RECORDS
-- ----------------------------------------------------------------------------
CREATE TABLE verification_records (
    id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

    evidence_id           UUID        NOT NULL REFERENCES evidence(id) ON DELETE RESTRICT,
    verifier_id           UUID        NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,

    verification_method   VARCHAR(100) NOT NULL,
    result                BOOLEAN      NOT NULL,
    confidence            DECIMAL(5,4) CHECK (confidence BETWEEN 0 AND 1),
    details               JSONB        DEFAULT '{}',

    -- blockchain cross-reference
    blockchain_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
    tx_id                 UUID        REFERENCES blockchain_transactions(id) ON DELETE SET NULL,

    -- timestamp
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE verification_records IS 'Detailed verification attempt records for evidence items';

-- ============================================================================
-- 3. TRIGGER FUNCTION — auto-update `updated_at`
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_evidence_updated_at
    BEFORE UPDATE ON evidence
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_blockchain_transactions_updated_at
    BEFORE UPDATE ON blockchain_transactions
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- users
CREATE INDEX idx_users_email           ON users (email);
CREATE INDEX idx_users_role            ON users (role);
CREATE INDEX idx_users_is_active       ON users (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_wallet          ON users (wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_department      ON users (department)     WHERE department IS NOT NULL;

-- cases
CREATE INDEX idx_cases_case_number     ON cases (case_number);
CREATE INDEX idx_cases_status          ON cases (status);
CREATE INDEX idx_cases_priority        ON cases (priority);
CREATE INDEX idx_cases_created_by      ON cases (created_by);
CREATE INDEX idx_cases_assigned_to     ON cases (assigned_to)    WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_cases_opened_at       ON cases (opened_at DESC);
CREATE INDEX idx_cases_tags            ON cases USING GIN (tags);
CREATE INDEX idx_cases_title_trgm      ON cases USING GIN (title gin_trgm_ops);

-- evidence
CREATE INDEX idx_evidence_case_id           ON evidence (case_id);
CREATE INDEX idx_evidence_status            ON evidence (status);
CREATE INDEX idx_evidence_category          ON evidence (category);
CREATE INDEX idx_evidence_file_hash         ON evidence (file_hash_sha256);
CREATE INDEX idx_evidence_ipfs_hash         ON evidence (ipfs_hash)           WHERE ipfs_hash IS NOT NULL;
CREATE INDEX idx_evidence_uploaded_by       ON evidence (uploaded_by);
CREATE INDEX idx_evidence_verified_by       ON evidence (verified_by)         WHERE verified_by IS NOT NULL;
CREATE INDEX idx_evidence_created_at        ON evidence (created_at DESC);
CREATE INDEX idx_evidence_tags              ON evidence USING GIN (tags);
CREATE INDEX idx_evidence_ai_analysis       ON evidence USING GIN (ai_analysis jsonb_path_ops);
CREATE INDEX idx_evidence_title_trgm        ON evidence USING GIN (title gin_trgm_ops);

-- blockchain_transactions
CREATE INDEX idx_btx_tx_hash                ON blockchain_transactions (tx_hash);
CREATE INDEX idx_btx_evidence_id            ON blockchain_transactions (evidence_id)    WHERE evidence_id IS NOT NULL;
CREATE INDEX idx_btx_initiated_by           ON blockchain_transactions (initiated_by);
CREATE INDEX idx_btx_status                 ON blockchain_transactions (status);
CREATE INDEX idx_btx_tx_type                ON blockchain_transactions (tx_type);
CREATE INDEX idx_btx_network                ON blockchain_transactions (network_name, chain_id);
CREATE INDEX idx_btx_submitted_at           ON blockchain_transactions (submitted_at DESC);
CREATE INDEX idx_btx_block_number           ON blockchain_transactions (block_number)   WHERE block_number IS NOT NULL;

-- audit_logs
CREATE INDEX idx_audit_user_id              ON audit_logs (user_id)        WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_action               ON audit_logs (action);
CREATE INDEX idx_audit_entity               ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_created_at           ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_ip_address           ON audit_logs (ip_address)     WHERE ip_address IS NOT NULL;

-- chain_of_custody
CREATE INDEX idx_coc_evidence_id            ON chain_of_custody (evidence_id);
CREATE INDEX idx_coc_from_user              ON chain_of_custody (from_user_id);
CREATE INDEX idx_coc_to_user                ON chain_of_custody (to_user_id);
CREATE INDEX idx_coc_created_at             ON chain_of_custody (created_at DESC);

-- verification_records
CREATE INDEX idx_vr_evidence_id             ON verification_records (evidence_id);
CREATE INDEX idx_vr_verifier_id             ON verification_records (verifier_id);
CREATE INDEX idx_vr_result                  ON verification_records (result);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
