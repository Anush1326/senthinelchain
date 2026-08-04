# SentinelChain — Advanced Digital Forensics Attack Simulation Module

> **Version**: 3.0 &nbsp;|&nbsp; **Route**: `/simulator` &nbsp;|&nbsp; **Target Engine**: Node.js Express + Python FastAPI
> **Compliance**: IPFS Content-Addressed Immutability Rules & Polygon Blockchain Smart Contract Verification

---

## 1. Overview

The **SentinelChain Digital Forensics Attack Simulation Module** allows cyber investigators, forensic analysts, and security auditors to simulate realistic attack vectors around decentralized evidence storage, cryptographic hash anchoring, metadata manipulation, and unauthorized access attempts.

---

## 2. Attack Vectors & Simulation Scenarios

| Scenario ID | Attack Vector | Simulation Workflow | Detection & Mitigation |
|-------------|---------------|---------------------|------------------------|
| `ipfs_reupload_tampering` | **IPFS File Modification & Re-upload** | Downloads original evidence (`QmYwAP...`), alters 1 byte in timestamp header, re-uploads to IPFS. | **IPFS Rules Enforced**: Bitwise change forces generation of **NEW CID (`QmMUTATED...`)**. Polygon smart contract SHA-256 verification **REJECTS** hash mismatch. |
| `replay_tx_attack` | **Blockchain Transaction Replay** | Replays valid signed Polygon transaction receipt (`0xabc123...`) under unauthorized case ID. | **Contract Guard Intercepts**: Replay guard checks transaction nonce and target hash mapping. |
| `unauthorized_access` | **IAM Access Escalation** | Low-privilege user (`viewer`) attempts restricted DELETE API endpoint invocation. | **RBAC Middleware**: Intercepts request and returns `403 Forbidden`. Logs intrusion attempt to `audit_logs`. |
| `exif_manipulation` | **Metadata Clock Shift & Software Editing** | Strips camera serial number (`CAM-SEC-8842`), shifts creation clock by +2h, alters EXIF software tag to Photoshop. | **Metadata Engine**: Flags timestamp offset and editing software signature in metadata consistency check. |
| `splicing_crop` | **AI Image Splicing & Re-compression** | Overlays 120x80 pixel timestamp patch onto CCTV footage, re-saves at JPEG quality 70. | **AI ELA Engine**: ELA variance spike (`std_diff: 28.4`) highlights spliced region in neon red. |

---

## 3. End-to-End Simulation Workflow

```
                                [ Select Target Evidence ]
                                            │
                                            ▼
                              [ Choose Attack Scenario ]
                                            │
                                            ▼
                           [ Execute Attack Simulation ]
                                            │
                  ┌─────────────────────────┼─────────────────────────┐
                  ▼                         ▼                         ▼
        [ IPFS CID Lineage ]      [ Blockchain Verification ]  [ AI Forensic Scan ]
        • Original CID_A          • On-Chain SHA-256 Check     • ELA Compression Grid
        • Mutated CID_B           • Nonce & Receipt Validation  • Noise Variance Map
                  │                         │                         │
                  └─────────────────────────┼─────────────────────────┘
                                            │
                                            ▼
                            [ Granular Diff Matrix Card ]
                            • Original On-Chain Values
                            • After Tampering Values
                            • Red Discrepancy Status Badges
                                            │
                                            ▼
                            [ 5-Step Forensic Timeline ]
                            • Step 1: Original Upload & Anchor
                            • Step 2: Adversary File Download
                            • Step 3: Mutated Content Editing
                            • Step 4: IPFS Re-upload (New CID)
                            • Step 5: Polygon Ledger Audit (REJECTED)
                                            │
                                            ▼
                           [ Immutable Security Audit Log ]
```

---

## 4. API Endpoint Reference

- `GET /api/evidence/attack-scenarios` — Returns all available attack scenario definitions.
- `POST /api/evidence/simulate-attack` — Accepts `{ scenarioId, evidenceId }` and executes step-by-step forensic verification, updating trust scores and writing an immutable `EVIDENCE_TAMPERING_DETECTED` record into PostgreSQL.

---

## 5. Front-End Components

- **Dashboard Page**: [`client/src/pages/AttackSimulator.jsx`](file:///c:/Users/VICTUS/Documents/sairam/client/src/pages/AttackSimulator.jsx)
- **Granular Diff Component**: [`client/src/components/TamperingDiffCard.jsx`](file:///c:/Users/VICTUS/Documents/sairam/client/src/components/TamperingDiffCard.jsx)
- **Navigation Route**: `/simulator` (Icon: `Zap` in [`Layout.jsx`](file:///c:/Users/VICTUS/Documents/sairam/client/src/components/Layout.jsx#L41))
