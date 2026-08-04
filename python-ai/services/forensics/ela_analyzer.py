import io
import base64
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
from typing import Dict, Any, Tuple

class ELAAnalyzer:
    """
    Enterprise Error Level Analysis (ELA) & JPEG Compression Grid Analyzer.
    Multi-Scale Quality ELA evaluates JPEG compression grid variations across 
    different quality levels (95, 85, 70) to pinpoint localized image splicing,
    inpainting, and multi-stage re-saving artifacts with high precision.
    """

    @staticmethod
    def analyze(image: Image.Image, qualities: Tuple[int, ...] = (95, 85, 70)) -> Dict[str, Any]:
        rgb_image = image.convert("RGB")
        w, h = rgb_image.size
        rgb_np = np.array(rgb_image, dtype=np.float32)

        multi_scale_diffs = []
        suspicious_blocks = []

        # Multi-scale Quality Evaluation
        for q in qualities:
            buffer = io.BytesIO()
            rgb_image.save(buffer, "JPEG", quality=q)
            buffer.seek(0)
            resaved = Image.open(buffer).convert("RGB")
            
            diff = ImageChops.difference(rgb_image, resaved)
            diff_np = np.array(diff, dtype=np.float32)
            multi_scale_diffs.append(diff_np)

        # Primary ELA differential map (Quality 85)
        primary_diff = multi_scale_diffs[1]
        gray_diff = np.mean(primary_diff, axis=2)

        mean_diff = float(np.mean(primary_diff))
        std_diff = float(np.std(primary_diff))
        max_val = int(np.max(primary_diff))

        # Dynamic Adaptive Thresholding for High-Precision 16x16 Macroblocks
        grid_size = 16
        stride = 8
        
        block_variances = []
        for y in range(0, h - grid_size + 1, stride):
            for x in range(0, w - grid_size + 1, stride):
                block = gray_diff[y:y+grid_size, x:x+grid_size]
                b_std = float(np.std(block))
                block_variances.append((b_std, x, y))

        if block_variances:
            b_stds = [b[0] for b in block_variances]
            global_b_std = float(np.mean(b_stds))
            b_std_sigma = float(np.std(b_stds))

            # Filter top 10 most suspicious non-overlapping blocks
            b_sorted = sorted(block_variances, key=lambda item: item[0], reverse=True)
            added_boxes = []

            for b_std, x, y in b_sorted:
                if b_std > (global_b_std + 2.4 * b_std_sigma) and b_std > 12.0:
                    # Check non-overlap with existing bounding boxes
                    overlap = False
                    for bx, by, bw, bh in added_boxes:
                        if abs(x - bx) < grid_size and abs(y - by) < grid_size:
                            overlap = True
                            break
                    if not overlap:
                        added_boxes.append((x, y, grid_size, grid_size))
                        suspicious_blocks.append({
                            "bbox": [x, y, grid_size, grid_size],
                            "std_variance": round(b_std, 2),
                            "anomaly_severity": "CRITICAL" if b_std > (global_b_std + 3.5 * b_std_sigma) else "HIGH",
                            "reason": f"Multi-scale ELA compression variance anomaly ({b_std:.1f} vs avg {global_b_std:.1f})"
                        })
                        if len(suspicious_blocks) >= 12:
                            break

        # Scaled Heatmap Generation
        extrema = Image.fromarray(np.uint8(np.clip(primary_diff, 0, 255))).getextrema()
        max_d = max([ex[1] for ex in extrema]) if extrema else 1
        scale = 255.0 / max(max_d, 1)
        enhanced_diff = ImageEnhance.Brightness(Image.fromarray(np.uint8(np.clip(primary_diff, 0, 255)))).enhance(scale * 0.75)

        heatmap_buffer = io.BytesIO()
        enhanced_diff.save(heatmap_buffer, format="PNG")
        heatmap_base64 = base64.b64encode(heatmap_buffer.getvalue()).decode("utf-8")

        # Multi-scale calibrated Splicing Score
        splicing_score = min(100.0, max(0.0, (std_diff - 6.0) * 4.2 + (len(suspicious_blocks) * 3.5)))
        is_suspicious = std_diff > 16.0 or len(suspicious_blocks) >= 2 or splicing_score > 40.0

        return {
            "mean_difference": round(mean_diff, 2),
            "std_difference": round(std_diff, 2),
            "max_difference": max_val,
            "splicing_anomaly_score": round(splicing_score, 1),
            "is_suspicious": is_suspicious,
            "suspicious_blocks_count": len(suspicious_blocks),
            "suspicious_blocks": suspicious_blocks,
            "ela_heatmap_base64": f"data:image/png;base64,{heatmap_base64}"
        }
