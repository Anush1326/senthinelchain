-- ============================================================================
-- Migration 001: Initial Schema
-- SentinelChain – AI Powered Blockchain Evidence Chain
-- ============================================================================
-- This migration creates the complete initial database schema.
-- Run with: psql -U <user> -d sentinelchain -f 001_initial_schema.sql
-- ============================================================================

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum types
CREATE TYPE user_role         AS ENUM ('admin', 'investigator', 'analyst', 'viewer');
CREATE TYPE case_status       AS ENUM ('open', 'active', 'under_review', 'closed', 'archived');
CREATE TYPE case_priority     AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE evidence_status   AS ENUM ('pending', 'processing', 'verified', 'flagged', 'rejected', 'archived');
CREATE TYPE evidence_category AS ENUM ('document', 'image', 'video', 'audio', 'digital_forensics', 'email', 'log_file', 'other');
CREATE TYPE audit_action      AS ENUM ('USER_LOGIN','USER_LOGOUT','USER_CREATED','USER_UPDATED','USER_DELETED','CASE_CREATED','CASE_UPDATED','CASE_CLOSED','EVIDENCE_UPLOADED','EVIDENCE_VERIFIED','EVIDENCE_FLAGGED','EVIDENCE_REJECTED','EVIDENCE_DELETED','EVIDENCE_DOWNLOADED','CUSTODY_TRANSFERRED','BLOCKCHAIN_SUBMITTED','BLOCKCHAIN_VERIFIED','AI_ANALYSIS_REQUESTED','AI_ANALYSIS_COMPLETED','SETTINGS_CHANGED');
CREATE TYPE tx_status         AS ENUM ('pending', 'submitted', 'confirmed', 'failed', 'reverted');
CREATE TYPE tx_type           AS ENUM ('evidence_submission', 'evidence_verification', 'custody_transfer', 'status_update', 'verifier_management');

-- Users
CREATE TABLE users (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name        VARCHAR(100)  NOT NULL,
    last_name         VARCHAR(100)  NOT NULL,
    email             VARCHAR(255)  NOT NULL,
    password_hash     VARCHAR(255)  NOT NULL,
    phone             VARCHAR(20),
    role              user_role     NOT NULL DEFAULT 'viewer',
    department        VARCHAR(150),
    badge_number      VARCHAR(50),
    is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
    email_verified    BOOLEAN       NOT NULL DEFAULT FALSE,
    wallet_address    VARCHAR(42),
    avatar_url        TEXT,
    bio               TEXT,
    last_login_at     TIMESTAMP WITH TIME ZONE,
    last_login_ip     INET,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email          UNIQUE (email),
    CONSTRAINT uq_users_wallet         UNIQUE (wallet_address),
    CONSTRAINT ck_users_email_format   CHECK  (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Cases
CREATE TABLE cases (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number       VARCHAR(50)   NOT NULL,
    title             VARCHAR(255)  NOT NULL,
    description       TEXT,
    status            case_status   NOT NULL DEFAULT 'open',
    priority          case_priority NOT NULL DEFAULT 'medium',
    category          VARCHAR(100),
    tags              TEXT[],
    created_by        UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to       UUID          REFERENCES users(id) ON DELETE SET NULL,
    opened_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at         TIMESTAMP WITH TIME ZONE,
    due_date          DATE,
    metadata          JSONB         DEFAULT '{}',
    notes             TEXT,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cases_case_number UNIQUE (case_number)
);

-- Evidence
CREATE TABLE evidence (
    id                    UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id               UUID              NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    title                 VARCHAR(255)      NOT NULL,
    description           TEXT,
    category              evidence_category NOT NULL DEFAULT 'other',
    status                evidence_status   NOT NULL DEFAULT 'pending',
    original_file_name    VARCHAR(255)      NOT NULL,
    file_type             VARCHAR(100)      NOT NULL,
    file_size             BIGINT            NOT NULL CHECK (file_size > 0),
    file_hash_sha256      VARCHAR(64)       NOT NULL,
    file_hash_md5         VARCHAR(32),
    ipfs_hash             VARCHAR(255),
    ipfs_url              TEXT,
    contract_evidence_id  INTEGER,
    tags                  TEXT[],
    metadata              JSONB             DEFAULT '{}',
    ai_analysis           JSONB             DEFAULT '{}',
    ai_confidence_score   DECIMAL(5,4)      CHECK (ai_confidence_score BETWEEN 0 AND 1),
    ai_risk_level         VARCHAR(20),
    uploaded_by           UUID              NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verified_by           UUID              REFERENCES users(id) ON DELETE SET NULL,
    verified_at           TIMESTAMP WITH TIME ZONE,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_evidence_file_hash UNIQUE (file_hash_sha256)
);

-- Blockchain Transactions
CREATE TABLE blockchain_transactions (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id         UUID        REFERENCES evidence(id) ON DELETE SET NULL,
    initiated_by        UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    tx_hash             VARCHAR(66) NOT NULL,
    block_number        BIGINT,
    block_hash          VARCHAR(66),
    from_address        VARCHAR(42) NOT NULL,
    to_address          VARCHAR(42) NOT NULL,
    gas_used            BIGINT,
    gas_price_gwei      DECIMAL(20,9),
    tx_fee_matic        DECIMAL(30,18),
    tx_type             tx_type     NOT NULL,
    status              tx_status   NOT NULL DEFAULT 'pending',
    network_name        VARCHAR(50) NOT NULL DEFAULT 'polygon_amoy',
    chain_id            INTEGER     NOT NULL DEFAULT 80002,
    input_data          TEXT,
    decoded_data        JSONB       DEFAULT '{}',
    contract_address    VARCHAR(42),
    event_logs          JSONB       DEFAULT '[]',
    error_message       TEXT,
    retry_count         INTEGER     NOT NULL DEFAULT 0,
    submitted_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_blockchain_tx_hash UNIQUE (tx_hash)
);

-- Audit Logs
CREATE TABLE audit_logs (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID          REFERENCES users(id) ON DELETE SET NULL,
    user_email        VARCHAR(255),
    user_role         user_role,
    action            audit_action  NOT NULL,
    entity_type       VARCHAR(100)  NOT NULL,
    entity_id         UUID,
    description       TEXT,
    details           JSONB         DEFAULT '{}',
    old_values        JSONB,
    new_values        JSONB,
    ip_address        INET,
    user_agent        TEXT,
    request_method    VARCHAR(10),
    request_path      TEXT,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Chain of Custody
CREATE TABLE chain_of_custody (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id       UUID        NOT NULL REFERENCES evidence(id) ON DELETE RESTRICT,
    from_user_id      UUID        NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
    to_user_id        UUID        NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
    action            VARCHAR(100) NOT NULL,
    reason            TEXT,
    notes             TEXT,
    tx_id             UUID         REFERENCES blockchain_transactions(id) ON DELETE SET NULL,
    location          VARCHAR(255),
    device_info       VARCHAR(255),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Verification Records
CREATE TABLE verification_records (
    id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id           UUID        NOT NULL REFERENCES evidence(id) ON DELETE RESTRICT,
    verifier_id           UUID        NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
    verification_method   VARCHAR(100) NOT NULL,
    result                BOOLEAN      NOT NULL,
    confidence            DECIMAL(5,4) CHECK (confidence BETWEEN 0 AND 1),
    details               JSONB        DEFAULT '{}',
    blockchain_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
    tx_id                 UUID        REFERENCES blockchain_transactions(id) ON DELETE SET NULL,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_cases_updated_at
    BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_evidence_updated_at
    BEFORE UPDATE ON evidence FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_blockchain_transactions_updated_at
    BEFORE UPDATE ON blockchain_transactions FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

COMMIT;
