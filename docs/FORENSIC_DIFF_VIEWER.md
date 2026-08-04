# SentinelChain — Enterprise Digital Forensic Evidence Difference Viewer

> **Version**: 3.0 &nbsp;|&nbsp; **Route**: `/diff-viewer` &nbsp;|&nbsp; **Microservice Endpoint**: `POST /api/ai/compare-evidence`
> **Technology Stack**: Python (OpenCV, NumPy, PIL, SciPy) + Node Express + React (Tailwind CSS)

---

## 1. Overview

The **Digital Forensic Evidence Difference Viewer** is an enterprise-grade comparison module designed for cyber crime police, forensic labs, and courts. It compares an **Original Evidence Image** against a **Suspected Modified Image**, pinpointing modified pixel regions, structural shifts, and EXIF discrepancies.

---

## 2. Multi-Vector Analysis Modules

| Analysis Vector | Algorithm / Technique | Output & Visualization |
|-----------------|------------------------|------------------------|
| **Pixel-by-Pixel Diff** | Absolute RGB difference thresholding | Changed pixel count & % divergence |
| **SSIM Index** | Structural Similarity Index Measure | 0-100% similarity score & interpretation |
| **Perceptual Hashes** | pHash (DCT), dHash (Diff), aHash (Avg) | Hamming distance comparison + Avalanche explanation |
| **Thermal Heatmap** | Green (Unchanged), Yellow (Suspicious), Red (Modified) | Base64 RGB blended heatmap overlay |
| **Bounding Boxes** | Contour detection & area calculation | Numbered bounding boxes (`#1`, `#2`) with area % |
| **Error Level Analysis** | JPEG re-compression grid variance | Base64 ELA heatmap overlay |
| **EXIF & Metadata** | EXIF header parsing & timestamp diff | Side-by-side discrepancy table |

---

## 3. Interactive UI Viewer Features

- ↔️ **Side-by-Side View**: Dual synchronized viewer with cursor crosshair and real-time pixel inspector.
- ↕️ **Split View**: Vertical draggable divider comparing original vs modified.
- 🎚️ **Swipe Comparison**: Smooth horizontal swipe slider bar with percentage.
- 💡 **Blink Comparison**: Automated 2Hz visual flicker toggle for visual anomaly detection.
- 🔥 **Thermal Heatmap View**: Adjustable opacity slider overlay.
- 🔍 **ELA View**: Error level analysis visualization.
- 📦 **Numbered Bounding Box View**: Highlights altered bounding boxes with area percentages.
- 🎯 **Pixel Inspector HUD**: Mouse coordinates `(X, Y)` and exact RGB color values `(R, G, B)` under cursor.
- 🖨️ **Printable Court Report**: Instant printable report with SSIM score, risk level, hashes, and diff matrices.

---

## 4. API Reference

- **Python FastAPI**: `POST http://127.0.0.1:8000/api/ai/compare-evidence`
  - Accepts `original_file` & `modified_file` via `multipart/form-data`.
- **Node Express Reverse Proxy**: `POST /api/evidence/compare`
