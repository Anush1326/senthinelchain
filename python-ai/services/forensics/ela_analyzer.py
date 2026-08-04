import io
import base64
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
from typing import Dict, Any, Tuple

class ELAAnalyzer:
    """
    Error Level Analysis (ELA) & JPEG Compression Grid Analyzer.
    Identifies localized compression variations indicative of image splicing,
    editing, or multi-stage JPEG re-saving.
    """

    @staticmethod
    def analyze(image: Image.Image, quality: int = 90) -> Dict[str, Any]:
        """
        Performs Error Level Analysis by resaving the image at a known JPEG quality
        and calculating the pixel-by-pixel differential map.
        """
        rgb_image = image.convert("RGB")
        w, h = rgb_image.size

        # Step 1: Save to buffer at target quality
        buffer = io.BytesIO()
        rgb_image.save(buffer, "JPEG", quality=quality)
        buffer.seek(0)
        resaved_image = Image.open(buffer).convert("RGB")

        # Step 2: Calculate absolute difference image
        diff_image = ImageChops.difference(rgb_image, resaved_image)
        
        # Step 3: Enhance difference for visual analysis (scale brightness)
        extrema = diff_image.getextrema()
        max_diff = max([ex[1] for ex in extrema]) if extrema else 1
        scale = 255.0 / max(max_diff, 1)
        
        enhanced_diff = ImageEnhance.Brightness(diff_image).enhance(scale * 0.6)

        # Step 4: Statistical analysis of difference matrix
        diff_array = np.array(diff_image, dtype=np.float32)
        mean_diff = float(np.mean(diff_array))
        std_diff = float(np.std(diff_array))
        max_val = int(np.max(diff_array))

        # Step 5: Convert enhanced diff to Base64 heatmap
        heatmap_buffer = io.BytesIO()
        enhanced_diff.save(heatmap_buffer, format="PNG")
        heatmap_base64 = base64.b64encode(heatmap_buffer.getvalue()).decode("utf-8")

        # Step 6: Identify suspicious high-variance grid blocks (16x16 macroblocks)
        grid_size = 32
        suspicious_blocks = []
        
        # Convert diff to grayscale array for block analysis
        gray_diff = np.mean(diff_array, axis=2)
        
        for y in range(0, h - grid_size, grid_size):
            for x in range(0, w - grid_size, grid_size):
                block = gray_diff[y:y+grid_size, x:x+grid_size]
                block_std = float(np.std(block))
                if block_std > (std_diff * 2.2) and block_std > 15.0:
                    suspicious_blocks.append({
                        "bbox": [x, y, grid_size, grid_size],
                        "std_variance": round(block_std, 2),
                        "reason": "Localized ELA compression anomaly (splice/paste candidate)"
                    })

        # Calculate Splicing / ELA score (0.0 to 100.0)
        splicing_score = min(100.0, max(0.0, (std_diff - 8.0) * 4.5 + (len(suspicious_blocks) * 3.0)))
        is_suspicious = std_diff > 18.0 or len(suspicious_blocks) >= 3

        return {
            "mean_difference": round(mean_diff, 2),
            "std_difference": round(std_diff, 2),
            "max_difference": max_val,
            "splicing_anomaly_score": round(splicing_score, 1),
            "is_suspicious": is_suspicious,
            "suspicious_blocks_count": len(suspicious_blocks),
            "suspicious_blocks": suspicious_blocks[:10], # Limit to top 10
            "ela_heatmap_base64": f"data:image/png;base64,{heatmap_base64}"
        }
