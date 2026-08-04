# SentinelChain — Advanced Digital Evidence Attack Simulation & Verification Engine

> **Version**: 4.0 &nbsp;|&nbsp; **Route**: `/simulator` &nbsp;|&nbsp; **Target Engine**: Node.js Express + Python FastAPI
> **Compliance**: IPFS Content-Addressed Immutability Rules & Polygon Amoy Smart Contract Verification

---

## 1. Core Architectural Workflow

```
       ┌────────────────────────────────────────────────────────┐
       │ SCENARIO 1: ORIGINAL EVIDENCE INGEST                   │
       │ • File SHA-256 Hash Generated                         │
       │ • Uploaded to IPFS -> Receives CID_v1                  │
       │ • Anchored on Polygon Amoy Block #48521000             │
       │ • PKI Digital Signature & Initial Custody Logged       │
       │ • Status = VERIFIED                                    │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │ SCENARIO 2: ATTACK SIMULATION (15 TAMPERING VECTORS)   │
       │ • Attacker downloads original file                     │
       │ • Applies tampering (1-pixel edit, inpainting, blur,  │
       │   JPEG recompression, EXIF clock shift, etc.)          │
       │ • NEW SHA-256 generated                                │
       │ • Uploaded to IPFS -> Receives NEW CID (CID_v2)        │
       │ • STRICT IPFS RULE: CID_v1 is NEVER overwritten!       │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │ SCENARIO 3 & 4: VERIFICATION & FORENSIC ANALYSIS       │
       │ • On-Chain Check: Original SHA-256 vs Modified SHA-256  │
       │ • Content Check: Original CID_v1 vs Modified CID_v2    │
       │ • SSIM Index & Pixel Divergence Rate (%)               │
       │ • ELA Compression Grid & Bounding Box Overlays          │
       │ • YOLO Object Difference List & EXIF Discrepancy Matrix │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │ SCENARIO 5: VERDICT & COURT REPORT GENERATOR           │
       │ • MATCH:    ✓ ORIGINAL EVIDENCE VERIFIED (SAFE)        │
       │ • MISMATCH: ❌ TAMPERED EVIDENCE DETECTED (CRITICAL)   │
       │   - Exact Reason: SHA-256 Changed, CID Changed        │
       │   - Recommendation: Reject as Original Evidence        │
       └────────────────────────────────────────────────────────┘
```

---

## 2. Supported 15 Attack Vectors

1. `one_pixel_mod`: 1-Pixel RGB Alteration Attack
2. `object_removal`: Inpainting Object / Stamp Removal
3. `object_addition`: Unauthorized Object Insertion
4. `face_blur`: Facial Anonymization & Blur Tampering
5. `cropping`: Border Pixel Cropping (-5%)
6. `rotate_image`: Geometric Rotation & Shear (90°)
7. `brightness_contrast`: Brightness & Contrast Manipulation
8. `jpeg_recompression`: JPEG Re-compression (Quality 70)
9. `exif_removal`: Complete EXIF Metadata Stripping
10. `fake_metadata`: Synthetic EXIF Header Injection
11. `png_to_jpg`: Format Transcode (PNG to JPEG)
12. `resize_image`: Bicubic Image Rescaling (4K to 1080p)
13. `watermark_add_remove`: Watermark Addition / Removal
14. `copy_move`: Copy-Move Region Cloning Attack
15. `splicing`: Image Splicing & Overlay Attack

---

## 3. Front-End Dashboard Component

- **File**: [`client/src/pages/AttackSimulator.jsx`](file:///c:/Users/VICTUS/Documents/sairam/client/src/pages/AttackSimulator.jsx)
- **Route**: `/simulator` (Icon: `Zap` in [`Layout.jsx`](file:///c:/Users/VICTUS/Documents/sairam/client/src/components/Layout.jsx#L40))
- **Printable Court Report**: One-click printable report generation.
