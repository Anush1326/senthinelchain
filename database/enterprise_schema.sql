-- ============================================================================
-- SentinelChain Enterprise Digital Forensics Database Schema
-- Version: 3.0.0 (Enterprise Production Grade)
-- PostgreSQL 16 Target
-- Includes: 17 Normalized Tables, RBAC, Table Partitioning, Soft Deletes,
--           Trigger Automation, Stored Procedures, Views & GIN Trigram Indexes.
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS & SETUP
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- UUIDv4 primary keys
CREATE EXTENSION IF NOT EXISTS "pgcrypto";         -- Cryptographic utilities & hashing
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- Trigram indexing for fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- Combined B-tree & GIN multi-column indexes

-- Set default timezone
SET timezone = 'UTC';

-- ============================================================================
-- 1. ENUM TYPES
-- ============================================================================

CREATE TYPE case_status_enum AS ENUM (
    'open',
    'active',
    'under_review',
    'pending_court',
    'closed',
    'archived'
);

CREATE TYPE case_priority_enum AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE investigation_status_enum AS ENUM (
    'initiated',
    'evidence_collection',
    'forensic_analysis',
    'reporting',
    'completed',
    'suspended'
);

CREATE TYPE evidence_status_enum AS ENUM (
    'pending_ingest',
    'processing',
    'verified',
    'flagged_tampered',
    'rejected',
    'archived'
);

CREATE TYPE evidence_category_enum AS ENUM (
    'disk_image',
    'memory_dump',
    'network_pcap',
    'log_file',
    'document',
    'image',
    'video',
    'audio',
    'email_mailbox',
    'mobile_extraction',
    'database_dump',
    'other'
);

CREATE TYPE hash_algorithm_enum AS ENUM (
    'sha256',
    'sha512',
    'md5',
    'sha3_256',
    'blake2b'
);

CREATE TYPE blockchain_tx_status_enum AS ENUM (
    'pending',
    'submitted',
    'confirmed',
    'failed',
    'reverted'
);

CREATE TYPE notification_type_enum AS ENUM (
    'evidence_uploaded',
    'tampering_alert',
    'custody_transferred',
    'case_assigned',
    'blockchain_confirmed',
    'report_approved',
    'system_alert'
);

-- ============================================================================
-- 2. ORGANIZATIONAL & IAM / RBAC TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 DEPARTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE departments (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code          VARCHAR(50) UNIQUE NOT NULL,
    name          VARCHAR(150) NOT NULL,
    agency_type   VARCHAR(100) NOT NULL, -- e.g., 'Police Cyber Unit', 'Forensic Lab', 'High Court'
    jurisdiction  VARCHAR(150) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    phone         VARCHAR(30),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at    TIMESTAMP WITH TIME ZONE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2.2 ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'investigator', 'forensic_analyst', 'prosecutor', 'judge'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2.3 PERMISSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'evidence:upload', 'evidence:verify', 'case:close'
    module      VARCHAR(50) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2.4 ROLE_PERMISSIONS (Junction Table)
-- ----------------------------------------------------------------------------
CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- ----------------------------------------------------------------------------
-- 2.5 USERS
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id   UUID REFERENCES departments(id) ON DELETE RESTRICT,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    badge_number    VARCHAR(50),
    phone           VARCHAR(30),
    wallet_address  VARCHAR(42) UNIQUE, -- Ethereum/Polygon address
    public_key_pem  TEXT,               -- Public key for digital signature verification
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_mfa_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret      VARCHAR(100),
    last_login_at   TIMESTAMP WITH TIME ZONE,
    last_login_ip   INET,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2.6 USER_ROLES (Junction Table)
-- ----------------------------------------------------------------------------
CREATE TABLE user_roles (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================================
-- 3. CASES & INVESTIGATIONS TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 CASES
-- ----------------------------------------------------------------------------
CREATE TABLE cases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number     VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'CYBER-2026-00482'
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    status          case_status_enum NOT NULL DEFAULT 'open',
    priority        case_priority_enum NOT NULL DEFAULT 'medium',
    lead_investigator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    court_reference VARCHAR(100),
    tags            TEXT[],
    metadata        JSONB DEFAULT '{}',
    opened_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at       TIMESTAMP WITH TIME ZONE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3.2 INVESTIGATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE investigations (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    title             VARCHAR(255) NOT NULL,
    objective         TEXT NOT NULL,
    assigned_analyst_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status            investigation_status_enum NOT NULL DEFAULT 'initiated',
    start_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completion_date   TIMESTAMP WITH TIME ZONE,
    findings_summary  TEXT,
    metadata          JSONB DEFAULT '{}',
    is_deleted        BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at        TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. EVIDENCE VAULT & ARTIFACT TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 EVIDENCE
-- ----------------------------------------------------------------------------
CREATE TABLE evidence (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id               UUID NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    investigation_id      UUID REFERENCES investigations(id) ON DELETE SET NULL,
    title                 VARCHAR(255) NOT NULL,
    description           TEXT,
    category              evidence_category_enum NOT NULL DEFAULT 'other',
    status                evidence_status_enum NOT NULL DEFAULT 'pending_ingest',
    original_file_name    VARCHAR(255) NOT NULL,
    file_type             VARCHAR(100) NOT NULL,
    file_size_bytes       BIGINT NOT NULL CHECK (file_size_bytes > 0),
    storage_path          TEXT, -- Local or Cloud Object Storage URI
    ipfs_cid              VARCHAR(255),
    ipfs_pinned_at        TIMESTAMP WITH TIME ZONE,
    blockchain_anchored   BOOLEAN NOT NULL DEFAULT FALSE,
    current_custodian_id  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    uploaded_by_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at            TIMESTAMP WITH TIME ZONE,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4.2 EVIDENCE_METADATA (Key-Value & Technical EXIF/Header Breakdown)
-- ----------------------------------------------------------------------------
CREATE TABLE evidence_metadata (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id     UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    device_model    VARCHAR(150),
    device_serial   VARCHAR(150),
    operating_system VARCHAR(100),
    file_system     VARCHAR(50),
    exif_data       JSONB DEFAULT '{}',
    system_headers  JSONB DEFAULT '{}',
    geo_latitude    NUMERIC(10, 8),
    geo_longitude   NUMERIC(11, 8),
    captured_at     TIMESTAMP WITH TIME ZONE,
    custom_attributes JSONB DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4.3 EVIDENCE_VERSIONS (Versioning for Sanitized / Exported Images)
-- ----------------------------------------------------------------------------
CREATE TABLE evidence_versions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id         UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    version_number      INTEGER NOT NULL CHECK (version_number >= 1),
    file_name           VARCHAR(255) NOT NULL,
    file_size_bytes     BIGINT NOT NULL,
    sha256_hash         VARCHAR(64) NOT NULL,
    change_summary      TEXT NOT NULL,
    created_by_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    storage_path        TEXT NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_evidence_version UNIQUE (evidence_id, version_number)
);

-- ----------------------------------------------------------------------------
-- 4.4 EVIDENCE_HASHES (Multi-Algorithm Cryptographic Receipts)
-- ----------------------------------------------------------------------------
CREATE TABLE evidence_hashes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id     UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    algorithm       hash_algorithm_enum NOT NULL,
    hash_value      VARCHAR(128) NOT NULL,
    computed_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    computed_by_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_evidence_hash_algorithm UNIQUE (evidence_id, algorithm)
);

-- ============================================================================
-- 5. BLOCKCHAIN & SIGNATURE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 BLOCKCHAIN_RECORDS
-- ----------------------------------------------------------------------------
CREATE TABLE blockchain_records (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id         UUID NOT NULL REFERENCES evidence(id) ON DELETE RESTRICT,
    tx_hash             VARCHAR(66) UNIQUE NOT NULL,
    block_number        BIGINT,
    block_hash          VARCHAR(66),
    contract_address    VARCHAR(42) NOT NULL,
    network_name        VARCHAR(50) NOT NULL DEFAULT 'polygon_amoy',
    chain_id            INTEGER NOT NULL DEFAULT 80002,
    from_address        VARCHAR(42) NOT NULL,
    to_address          VARCHAR(42) NOT NULL,
    status              blockchain_tx_status_enum NOT NULL DEFAULT 'pending',
    gas_used            BIGINT,
    raw_payload         TEXT,
    submitted_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5.2 DIGITAL_SIGNATURES (PKI Legal Non-Repudiation)
-- ----------------------------------------------------------------------------
CREATE TABLE digital_signatures (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id         UUID REFERENCES evidence(id) ON DELETE RESTRICT,
    report_id           UUID, -- Forward reference handled via constraint later
    signed_by_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    signature_data      TEXT NOT NULL, -- Base64 encoded RSA/ECDSA signature
    signing_algorithm   VARCHAR(50) NOT NULL DEFAULT 'SHA256withRSA',
    certificate_thumbprint VARCHAR(64) NOT NULL,
    signed_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verification_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. CHAIN OF CUSTODY & AI ANALYSIS TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6.1 CHAIN_OF_CUSTODY (Tamper-Proof Audit Trail of Custody Transfer)
-- ----------------------------------------------------------------------------
CREATE TABLE chain_of_custody (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id         UUID NOT NULL REFERENCES evidence(id) ON DELETE RESTRICT,
    releasing_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    receiving_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action_taken        VARCHAR(100) NOT NULL, -- e.g., 'SEIZED', 'TRANSFERRED', 'ANALYZED', 'SUBMITTED_TO_COURT'
    transfer_reason     TEXT NOT NULL,
    physical_location   VARCHAR(255),
    blockchain_tx_id    UUID REFERENCES blockchain_records(id) ON DELETE SET NULL,
    signature_id        UUID REFERENCES digital_signatures(id) ON DELETE SET NULL,
    transferred_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes               TEXT
);

-- ----------------------------------------------------------------------------
-- 6.2 AI_ANALYSIS (Deepfake, ELA, Metadata Consistency Results)
-- ----------------------------------------------------------------------------
CREATE TABLE ai_analysis (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id           UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    model_name            VARCHAR(100) NOT NULL, -- e.g., 'gpt-4o', 'ela_cnn_v2'
    model_version         VARCHAR(50) NOT NULL,
    confidence_score      NUMERIC(5, 4) CHECK (confidence_score BETWEEN 0 AND 1),
    tampering_detected    BOOLEAN NOT NULL DEFAULT FALSE,
    risk_level            VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    ela_score             NUMERIC(5, 2),
    detected_objects      TEXT[],
    anomalies_detected    JSONB DEFAULT '[]',
    raw_ai_response       JSONB DEFAULT '{}',
    analysis_duration_ms  INTEGER,
    analyzed_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. REPORTING & NOTIFICATION TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 REPORTS
-- ----------------------------------------------------------------------------
CREATE TABLE reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id             UUID NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    investigation_id    UUID REFERENCES investigations(id) ON DELETE SET NULL,
    title               VARCHAR(255) NOT NULL,
    report_type         VARCHAR(50) NOT NULL, -- 'INITIAL_ASSESSMENT', 'FULL_FORENSIC', 'EXPERT_WITNESS_TESTIMONY'
    summary             TEXT NOT NULL,
    content_markdown    TEXT NOT NULL,
    generated_by_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    pdf_storage_path    TEXT,
    signature_id        UUID REFERENCES digital_signatures(id) ON DELETE SET NULL,
    is_approved         BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Circular Foreign Key constraint for digital_signatures.report_id
ALTER TABLE digital_signatures
    ADD CONSTRAINT fk_digital_signatures_report
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 7.2 NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            notification_type_enum NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    link_url        TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. AUDIT LOGS (PARTITIONED BY RANGE ON created_at)
-- ============================================================================

CREATE TABLE audit_logs (
    id              UUID DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email      VARCHAR(255),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       UUID,
    details         JSONB DEFAULT '{}',
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Partition definitions (Quarterly Partitions for 2026)
CREATE TABLE audit_logs_2026_q1 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-04-01 00:00:00+00');

CREATE TABLE audit_logs_2026_q2 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-04-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

CREATE TABLE audit_logs_2026_q3 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');

CREATE TABLE audit_logs_2026_q4 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

-- Default partition for future logs
CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;

-- ============================================================================
-- 9. TRIGGERS & FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 9.1 Automatic `updated_at` Timestamp Refresher Trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_investigations_updated_at BEFORE UPDATE ON investigations FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_evidence_updated_at BEFORE UPDATE ON evidence FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_evidence_metadata_updated_at BEFORE UPDATE ON evidence_metadata FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_blockchain_records_updated_at BEFORE UPDATE ON blockchain_records FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ----------------------------------------------------------------------------
-- 9.2 Chain of Custody Auto Custodian Synchronizer
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_sync_custodian_on_transfer()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE evidence
    SET current_custodian_id = NEW.receiving_user_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.evidence_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_chain_of_custody_sync
    AFTER INSERT ON chain_of_custody
    FOR EACH ROW EXECUTE FUNCTION fn_sync_custodian_on_transfer();

-- ============================================================================
-- 10. STORED PROCEDURES & PROCEDURAL FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 10.1 SHA-256 Hash Verification & Integrity Audit Procedure
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_verify_evidence_integrity(
    p_evidence_id UUID,
    p_scanned_sha256 VARCHAR(64),
    p_verifier_id UUID
)
RETURNS TABLE (
    is_valid BOOLEAN,
    original_sha256 VARCHAR(64),
    scanned_sha256 VARCHAR(64),
    blockchain_anchored BOOLEAN,
    blockchain_tx_hash VARCHAR(66),
    message TEXT
) AS $$
DECLARE
    v_orig_hash VARCHAR(64);
    v_anchored BOOLEAN;
    v_tx_hash VARCHAR(66);
BEGIN
    SELECT eh.hash_value, e.blockchain_anchored
    INTO v_orig_hash, v_anchored
    FROM evidence e
    JOIN evidence_hashes eh ON eh.evidence_id = e.id AND eh.algorithm = 'sha256'
    WHERE e.id = p_evidence_id AND e.is_deleted = FALSE;

    IF v_orig_hash IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, p_scanned_sha256, FALSE, NULL::VARCHAR, 'Evidence record or SHA-256 hash not found'::TEXT;
        RETURN;
    END IF;

    SELECT br.tx_hash INTO v_tx_hash
    FROM blockchain_records br
    WHERE br.evidence_id = p_evidence_id AND br.status = 'confirmed'
    ORDER BY br.confirmed_at DESC LIMIT 1;

    IF LOWER(v_orig_hash) = LOWER(p_scanned_sha256) THEN
        RETURN QUERY SELECT TRUE, v_orig_hash, p_scanned_sha256, v_anchored, v_tx_hash, 'CRYPTOGRAPHIC_MATCH_CONFIRMED: Integrity intact'::TEXT;
    ELSE
        RETURN QUERY SELECT FALSE, v_orig_hash, p_scanned_sha256, v_anchored, v_tx_hash, 'CRITICAL_MISMATCH_ALERT: Evidence tampering flagged'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 10.2 Procedure to Safely Close Case
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_close_case(
    p_case_id UUID,
    p_user_id UUID,
    p_notes TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE cases
    SET status = 'closed',
        closed_at = CURRENT_TIMESTAMP,
        metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{closing_notes}', to_jsonb(p_notes))
    WHERE id = p_case_id AND is_deleted = FALSE;

    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, 'CASE_CLOSED', 'Case', p_case_id, jsonb_build_object('notes', p_notes));
END;
$$;

-- ============================================================================
-- 11. VIEWS & MATERIALIZED VIEWS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 11.1 Evidence Chain of Custody Summary View
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_evidence_custody_summary AS
SELECT
    e.id AS evidence_id,
    e.title AS evidence_title,
    e.category,
    e.status AS evidence_status,
    c.case_number,
    c.title AS case_title,
    u_cust.first_name || ' ' || u_cust.last_name AS current_custodian,
    u_cust.email AS custodian_email,
    d.name AS department_name,
    eh.hash_value AS sha256_hash,
    e.ipfs_cid,
    br.tx_hash AS blockchain_tx_hash,
    br.status AS blockchain_status,
    e.created_at AS uploaded_at
FROM evidence e
JOIN cases c ON e.case_id = c.id
JOIN users u_cust ON e.current_custodian_id = u_cust.id
JOIN departments d ON c.department_id = d.id
LEFT JOIN evidence_hashes eh ON eh.evidence_id = e.id AND eh.algorithm = 'sha256'
LEFT JOIN blockchain_records br ON br.evidence_id = e.id AND br.status = 'confirmed'
WHERE e.is_deleted = FALSE AND c.is_deleted = FALSE;

-- ----------------------------------------------------------------------------
-- 11.2 Monthly Evidence & AI Analytics (Materialized View)
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW mv_monthly_evidence_analytics AS
SELECT
    DATE_TRUNC('month', e.created_at) AS month_bucket,
    d.name AS department_name,
    e.category,
    COUNT(e.id) AS total_evidence_count,
    SUM(e.file_size_bytes) AS total_bytes_stored,
    COUNT(CASE WHEN e.status = 'verified' THEN 1 END) AS verified_count,
    COUNT(CASE WHEN e.status = 'flagged_tampered' THEN 1 END) AS flagged_tampered_count,
    ROUND(AVG(ai.confidence_score), 4) AS avg_ai_confidence
FROM evidence e
JOIN cases c ON e.case_id = c.id
JOIN departments d ON c.department_id = d.id
LEFT JOIN ai_analysis ai ON ai.evidence_id = e.id
WHERE e.is_deleted = FALSE
GROUP BY 1, 2, 3
WITH DATA;

-- Unique index to support concurrent refresh
CREATE UNIQUE INDEX idx_mv_monthly_analytics ON mv_monthly_evidence_analytics (month_bucket, department_name, category);

-- ============================================================================
-- 12. INDEXES & QUERY OPTIMIZATION
-- ============================================================================

-- Partial Indexes for Non-Deleted Rows (High Selectivity)
CREATE INDEX idx_users_active ON users (email) WHERE is_active = TRUE AND is_deleted = FALSE;
CREATE INDEX idx_cases_active ON cases (case_number, status) WHERE is_deleted = FALSE;
CREATE INDEX idx_evidence_active ON evidence (case_id, status) WHERE is_deleted = FALSE;

-- Foreign Key B-Tree Indexes
CREATE INDEX idx_evidence_case ON evidence (case_id);
CREATE INDEX idx_evidence_custodian ON evidence (current_custodian_id);
CREATE INDEX idx_evidence_uploader ON evidence (uploaded_by_id);
CREATE INDEX idx_evidence_hashes_lookup ON evidence_hashes (hash_value, algorithm);
CREATE INDEX idx_blockchain_tx_lookup ON blockchain_records (tx_hash, status);
CREATE INDEX idx_chain_of_custody_evidence ON chain_of_custody (evidence_id, transferred_at DESC);
CREATE INDEX idx_ai_analysis_evidence ON ai_analysis (evidence_id, risk_level);
CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

-- GIN Trigram Indexes for Fast Fuzzy Text Search
CREATE INDEX idx_cases_title_trgm ON cases USING GIN (title gin_trgm_ops);
CREATE INDEX idx_evidence_title_trgm ON evidence USING GIN (title gin_trgm_ops);
CREATE INDEX idx_evidence_filename_trgm ON evidence USING GIN (original_file_name gin_trgm_ops);

-- GIN JSONB Path Indexes
CREATE INDEX idx_evidence_metadata_exif ON evidence_metadata USING GIN (exif_data jsonb_path_ops);
CREATE INDEX idx_ai_analysis_anomalies ON ai_analysis USING GIN (anomalies_detected jsonb_path_ops);
CREATE INDEX idx_audit_logs_details ON audit_logs USING GIN (details jsonb_path_ops);

-- ============================================================================
-- END OF ENTERPRISE SCHEMA
-- ============================================================================
