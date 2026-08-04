# SentinelChain — Advanced IPFS Evidence Versioning & Lineage Module

> **Version**: 3.0 &nbsp;|&nbsp; **Route**: `/versioning` &nbsp;|&nbsp; **Target Engine**: Node.js Express + Python FastAPI
> **Compliance**: Strict IPFS Immutability Rules & Polygon Amoy Blockchain Verification

---

## 1. Core IPFS Immutability Rule

> **CRITICAL RULE**: Files stored on IPFS are **never modified or overwritten in-place**. Any modification (whether a 1-pixel edit, EXIF clock shift, or deepfake swap) creates a completely new content payload, producing a **NEW Content Identifier (CID_v2)** while preserving the original **CID_v1** on-chain forever in an immutable version lineage tree.

```
                         ┌────────────────────────────────────────────────────────┐
                         │ VERSION 1.0 (ROOT ANCHOR NODE)                         │
                         │ CID_v1: QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79...     │
                         │ SHA-256: a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6...       │
                         │ Polygon Amoy Block #48521000                           │
                         │ Status: VERIFIED ON-CHAIN                              │
                         └──────────────────────────┬─────────────────────────────┘
                                                    │
                                                    ▼
                         ┌────────────────────────────────────────────────────────┐
                         │ VERSION 2.0 (CHILD MUTATION NODE)                      │
                         │ CID_v2: QmZ9xK7r_QmYwAPJzv5CZsnA6_v2                   │
                         │ SHA-256: f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6...       │
                         │ Parent Version: v1.0 (CID_v1 Preserved Untouched)    │
                         │ Reason: Altered access log timestamp by +30 mins       │
                         │ Status: REJECTED (Hash Mismatch against Block #48521000)│
                         └──────────────────────────┬─────────────────────────────┘
                                                    │
                                                    ▼
                         ┌────────────────────────────────────────────────────────┐
                         │ VERSION 3.0 (COURT CERTIFIED COPY)                     │
                         │ CID_v3: QmCOURT_EXPORT_QmYwAPJzv5CZsn_v3               │
                         │ SHA-256: c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3...       │
                         │ Parent Version: v1.0                                   │
                         │ Reason: Sanitized PII for judicial proceeding          │
                         │ Status: SANITIZED COURT APPROVED                       │
                         └────────────────────────────────────────────────────────┘
```

---

## 2. Supported 17 Modification Vectors

The Versioning Engine supports simulating and creating new versions for 17 distinct modification types:

1. **`one_pixel_mod`**: 1-Pixel RGB Color Alteration
2. **`metadata_mod`**: EXIF Timestamp / Camera Shift
3. **`exif_removal`**: Complete EXIF Header Stripping
4. **`jpeg_recompression`**: JPEG Re-compression (Quality 70)
5. **`cropping`**: Border Pixel Cropping (-5%)
6. **`object_removal`**: Inpainting Object / Stamp Removal
7. **`copy_move`**: Copy-Move Region Cloning
8. **`splicing`**: Image Splicing & Overlay
9. **`deepfake`**: Deepfake Synthetic Face Swap
10. **`brightness_adj`**: Exposure & Brightness +15%
11. **`contrast_adj`**: Contrast Curve Shift +20%
12. **`watermark_removal`**: Watermark Removal Inpainting
13. **`noise_addition`**: Gaussian Noise Injection
14. **`file_rename`**: Filename & Extension Change
15. **`format_conversion`**: Format Transcode (PNG -> JPEG)
16. **`pdf_text_mod`**: PDF Document Text Alteration
17. **`log_file_mod`**: Access Log Timestamp Offset

---

## 3. End-to-End Scenarios Implemented

- **Scenario 1 — Original Ingest**: Uploads original file → SHA-256 → IPFS `CID_v1` → Polygon Block Receipt → PKI Digital Signature → Initial Chain of Custody.
- **Scenario 2 — Evidence Modification**: Creates child versions (`CID_v2`, `CID_v3`) for any of the 17 vectors without overwriting `CID_v1`.
- **Scenario 3 — Blockchain Verification**: Compares `Original SHA-256` vs `New SHA-256`, displaying `Integrity Failed` with technical explanations.
- **Scenario 4 — AI Analysis Integration**: Runs ELA, Noise Variance, Copy-Move, Deepfake, OCR, and EXIF scans.
- **Scenario 5 — Version Lineage Graph**: Renders visual node tree (`v1.0` → `v2.0` → `v3.0 Court Copy`) with full node metadata inspector.
- **Scenario 6 — Chain of Custody Event History**: Event timeline for Upload, Download, View, Verification, Modification, Transfer, Court Submission, Archive.
- **Scenario 7 — Court Forensic Report**: One-click court report generator.
- **Scenario 8 — Advanced Security**: Multi-algorithm hashes (SHA-256, SHA-512, MD5, SHA-3), PKI RSA-2048 signatures, RBAC, and immutable audit logs.
- **Scenario 9 — Lineage Dashboard**: Interactive frontend interface at `/versioning`.

---

## 4. API Reference

- `GET /api/evidence/:id/version-graph` — Returns complete version lineage graph and node metadata tree.
- `POST /api/evidence/:id/create-version` — Creates a new child version with a new IPFS CID (`CID_v2`), preserving parent CID (`CID_v1`).
