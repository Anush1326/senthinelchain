# SentinelChain — AI Multi-Vector Forensic Analysis Engine

> **Version**: 2.0 &nbsp;|&nbsp; **Service Engine**: Python FastAPI &nbsp;|&nbsp; **Port**: 8000
> **Target Capabilities**: Image Forgery, Deepfake Detection, Copy-Move Cloning, Splicing, Noise Variance, OCR, EXIF Analysis

---

## 1. Overview

The **SentinelChain AI Forensic Engine** (`python-ai`) provides deep multi-vector digital evidence analysis to identify digital tampering, image splicing, facial deepfakes, cloned regions, and metadata inconsistencies.

---

## 2. Forensic Vector Modules Architecture

```
                                  [ Uploaded Evidence Image ]
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
         [ ELA & Splicing ]          [ Noise Variance ]        [ Copy-Move Detector ]
         • JPEG Resave Q90           • 64x64 Grid Tiles        • OpenCV ORB Keypoints
         • Error Difference Map       • Laplacian High-Pass     • Cross-descriptor match
         • Base64 Heatmap Overlay    • Variance Deviation      • Displaced Clone BBox
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
         [ Deepfake Engine ]         [ Metadata Extractor ]   [ Object & EasyOCR ]
         • Haar Face Cascade         • EXIF Make / Model      • OCR Text Extraction
         • 2D FFT Power Spectrum     • Editing Software Tags  • Regex Entity Parse
         • Skin Blur Texture         • Timestamp Offsets      • Face / Text BBoxes
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                                              ▼
                                 [ Master Forensic Engine ]
                                 • Multi-Vector Risk Score (0-100)
                                 • Bounding Box Image Annotation
                                 • Executive Forensic Report JSON
```

---

## 3. Supported Forensic Vector Capabilities

| # | Forensic Analysis Vector | Implementation Technique | Key Metrics Returned |
|---|--------------------------|--------------------------|---------------------|
| 1 | **Image Forgery & Splicing** | Error Level Analysis (ELA) resaving at 90% JPEG quality + difference scaling | `splicing_anomaly_score`, ELA Heatmap Base64, suspicious block bboxes |
| 2 | **Noise Inconsistency Analysis** | 3x3 Laplacian high-pass spatial filter across 64x64 grid tiles | `noise_inconsistency_score`, `noise_variance_std`, anomaly bboxes |
| 3 | **Copy-Move / Cloning Detection** | OpenCV ORB keypoint descriptor matching + pixel distance thresholding | `copy_move_detected`, `matched_keypoints_count`, clone bboxes |
| 4 | **Deepfake & Synthetic Face Scan** | 2D Fast Fourier Transform (FFT) power spectrum + Laplacian edge blur analysis | `deepfake_probability`, `fft_freq_ratio`, synthetic face bboxes |
| 5 | **EXIF Metadata & Software Analysis** | Pillow EXIF parsing + suspicious software signatures (Photoshop, Canva, Midjourney) | `consistency_score`, `is_metadata_modified`, camera model, software |
| 6 | **Object & Face Detection** | OpenCV Haar Cascade classifiers & morphological text contouring | `detected_objects` list, face bounding boxes |
| 7 | **OCR & Text Extraction** | EasyOCR text recognition + Regex parser for Case IDs, dates, currency, IPs | `extracted_text`, `extracted_entities` dictionary |

---

## 4. REST API Endpoint Reference

### `POST /api/ai/analyze` or `POST /api/ai/full-forensic-scan`
**Request**: `multipart/form-data` with `file` (image file)  
**Response**:
```json
{
  "tampered": true,
  "confidence_score": 96.5,
  "risk_assessment": "CRITICAL",
  "risk_score": 88.5,
  "summary": "Multi-vector forensic evaluation completed. Risk Score: 88.5/100 [CRITICAL]. Identified 3 suspicious image region(s).",
  "forensic_report": {
    "title": "SentinelChain AI Multi-Vector Forensic Evaluation",
    "evidence_filename": "cctv_frame_04.png",
    "risk_score": 88.5,
    "risk_level": "CRITICAL",
    "key_findings": [
      "ELA Analysis detected non-uniform JPEG compression variance.",
      "Copy-Move Cloning detector flagged 18 duplicated descriptor keypoints.",
      "Editing software signature detected in EXIF: 'Adobe Photoshop 2026'"
    ],
    "recommendations": [
      "Flag evidence item for manual expert witness inspection",
      "Anchor forensic report hash onto Polygon Amoy blockchain ledger"
    ]
  },
  "suspicious_regions": [
    {
      "bbox": [120, 45, 64, 64],
      "type": "ELA_SPLICING_ANOMALY",
      "label": "ELA Compression Shift (24.8)",
      "color": "#ef4444"
    }
  ],
  "annotated_image_base64": "data:image/jpeg;base64,...",
  "ela_heatmap_base64": "data:image/png;base64,...",
  "ocr_extracted_text": "INCIDENT REPORT 2026-07-28",
  "vector_scores": {
    "ela_splicing_score": 78.5,
    "noise_inconsistency_score": 42.0,
    "copy_move_matched_keypoints": 18,
    "deepfake_probability": 0.0,
    "metadata_consistency": 40.0
  }
}
```

---

## 5. Implementation Files

- **Master Engine**: [`python-ai/services/forensics/forensic_engine.py`](file:///c:/Users/VICTUS/Documents/sairam/python-ai/services/forensics/forensic_engine.py)
- **ELA Module**: [`python-ai/services/forensics/ela_analyzer.py`](file:///c:/Users/VICTUS/Documents/sairam/python-ai/services/forensics/ela_analyzer.py)
- **Noise Analysis**: [`python-ai/services/forensics/noise_analyzer.py`](file:///c:/Users/VICTUS/Documents/sairam/python-ai/services/forensics/noise_analyzer.py)
- **Copy-Move Detector**: [`python-ai/services/forensics/copy_move_detector.py`](file:///c:/Users/VICTUS/Documents/sairam/python-ai/services/forensics/copy_move_detector.py)
- **Deepfake Detector**: [`python-ai/services/forensics/deepfake_detector.py`](file:///c:/Users/VICTUS/Documents/sairam/python-ai/services/forensics/deepfake_detector.py)
- **Object & OCR**: [`python-ai/services/forensics/object_ocr_detector.py`](file:///c:/Users/VICTUS/Documents/sairam/python-ai/services/forensics/object_ocr_detector.py)
- **Metadata EXIF**: [`python-ai/services/forensics/metadata_extractor.py`](file:///c:/Users/VICTUS/Documents/sairam/python-ai/services/forensics/metadata_extractor.py)
