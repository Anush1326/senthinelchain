# SentinelChain – Database Documentation

## Overview

SentinelChain uses **PostgreSQL 15+** as its primary data store. The schema uses UUIDs for all primary keys, JSONB for flexible metadata, PostgreSQL ENUMs for type safety, and array types for tags.

## Quick Start

```bash
# 1. Create database
createdb sentinelchain

# 2. Run schema
psql -U postgres -d sentinelchain -f database/schema.sql

# 3. Load seed data
psql -U postgres -d sentinelchain -f database/seed.sql
```

Or run migrations in order:

```bash
psql -U postgres -d sentinelchain -f database/migrations/001_initial_schema.sql
psql -U postgres -d sentinelchain -f database/migrations/002_add_indexes.sql
psql -U postgres -d sentinelchain -f database/seed.sql
```

## Tables

| Table | Description | PK | Rows (seed) |
|-------|-------------|-----|-------------|
| `users` | Platform users (admin, investigator, analyst, viewer) | UUID | 6 |
| `cases` | Investigation cases grouping related evidence | UUID | 6 |
| `evidence` | Digital evidence items linked to cases | UUID | 10 |
| `blockchain_transactions` | On-chain tx records (Polygon Amoy) | UUID | 7 |
| `audit_logs` | Immutable audit trail | UUID | 12 |
| `chain_of_custody` | Evidence custody transfer log | UUID | 4 |
| `verification_records` | Evidence verification attempts | UUID | 5 |

## Extensions Used

- `uuid-ossp` — UUID generation (`uuid_generate_v4()`)
- `pgcrypto` — Password hashing (`crypt()`, `gen_salt()`)
- `pg_trgm` — Fuzzy text search (trigram indexes)

## ENUM Types

| Type | Values |
|------|--------|
| `user_role` | admin, investigator, analyst, viewer |
| `case_status` | open, active, under_review, closed, archived |
| `case_priority` | low, medium, high, critical |
| `evidence_status` | pending, processing, verified, flagged, rejected, archived |
| `evidence_category` | document, image, video, audio, digital_forensics, email, log_file, other |
| `audit_action` | 20 actions (USER_LOGIN, EVIDENCE_UPLOADED, BLOCKCHAIN_SUBMITTED, etc.) |
| `tx_status` | pending, submitted, confirmed, failed, reverted |
| `tx_type` | evidence_submission, evidence_verification, custody_transfer, status_update, verifier_management |

## Indexes

The schema includes **40+ indexes** for optimal query performance:

- **B-tree** indexes on foreign keys, status fields, and timestamps
- **Partial** indexes (e.g., active users only, non-null wallet addresses)
- **GIN** indexes on JSONB columns (`ai_analysis`, `metadata`)
- **GIN** indexes on array columns (`tags`)
- **Trigram** indexes for fuzzy text search on `title` columns

## Triggers

Auto-updating `updated_at` triggers on: `users`, `cases`, `evidence`, `blockchain_transactions`

## Backup & Restore

```bash
# Backup
pg_dump -U postgres -d sentinelchain -F c -f sentinelchain_backup.dump

# Restore
pg_restore -U postgres -d sentinelchain -c sentinelchain_backup.dump
```

## Connection String

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/sentinelchain
```
