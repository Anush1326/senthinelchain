-- ============================================================================
-- Migration 002: Performance Indexes
-- SentinelChain – AI Powered Blockchain Evidence Chain
-- ============================================================================
-- Run AFTER 001_initial_schema.sql
-- ============================================================================

BEGIN;

-- -------------------------------------------------------------------------
-- USERS
-- -------------------------------------------------------------------------
CREATE INDEX idx_users_email           ON users (email);
CREATE INDEX idx_users_role            ON users (role);
CREATE INDEX idx_users_is_active       ON users (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_wallet          ON users (wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_department      ON users (department)     WHERE department IS NOT NULL;

-- -------------------------------------------------------------------------
-- CASES
-- -------------------------------------------------------------------------
CREATE INDEX idx_cases_case_number     ON cases (case_number);
CREATE INDEX idx_cases_status          ON cases (status);
CREATE INDEX idx_cases_priority        ON cases (priority);
CREATE INDEX idx_cases_created_by      ON cases (created_by);
CREATE INDEX idx_cases_assigned_to     ON cases (assigned_to)    WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_cases_opened_at       ON cases (opened_at DESC);
CREATE INDEX idx_cases_tags            ON cases USING GIN (tags);
CREATE INDEX idx_cases_title_trgm      ON cases USING GIN (title gin_trgm_ops);

-- -------------------------------------------------------------------------
-- EVIDENCE
-- -------------------------------------------------------------------------
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

-- -------------------------------------------------------------------------
-- BLOCKCHAIN_TRANSACTIONS
-- -------------------------------------------------------------------------
CREATE INDEX idx_btx_tx_hash                ON blockchain_transactions (tx_hash);
CREATE INDEX idx_btx_evidence_id            ON blockchain_transactions (evidence_id)    WHERE evidence_id IS NOT NULL;
CREATE INDEX idx_btx_initiated_by           ON blockchain_transactions (initiated_by);
CREATE INDEX idx_btx_status                 ON blockchain_transactions (status);
CREATE INDEX idx_btx_tx_type                ON blockchain_transactions (tx_type);
CREATE INDEX idx_btx_network                ON blockchain_transactions (network_name, chain_id);
CREATE INDEX idx_btx_submitted_at           ON blockchain_transactions (submitted_at DESC);
CREATE INDEX idx_btx_block_number           ON blockchain_transactions (block_number)   WHERE block_number IS NOT NULL;

-- -------------------------------------------------------------------------
-- AUDIT_LOGS
-- -------------------------------------------------------------------------
CREATE INDEX idx_audit_user_id              ON audit_logs (user_id)        WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_action               ON audit_logs (action);
CREATE INDEX idx_audit_entity               ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_created_at           ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_ip_address           ON audit_logs (ip_address)     WHERE ip_address IS NOT NULL;

-- -------------------------------------------------------------------------
-- CHAIN_OF_CUSTODY
-- -------------------------------------------------------------------------
CREATE INDEX idx_coc_evidence_id            ON chain_of_custody (evidence_id);
CREATE INDEX idx_coc_from_user              ON chain_of_custody (from_user_id);
CREATE INDEX idx_coc_to_user                ON chain_of_custody (to_user_id);
CREATE INDEX idx_coc_created_at             ON chain_of_custody (created_at DESC);

-- -------------------------------------------------------------------------
-- VERIFICATION_RECORDS
-- -------------------------------------------------------------------------
CREATE INDEX idx_vr_evidence_id             ON verification_records (evidence_id);
CREATE INDEX idx_vr_verifier_id             ON verification_records (verifier_id);
CREATE INDEX idx_vr_result                  ON verification_records (result);

COMMIT;
