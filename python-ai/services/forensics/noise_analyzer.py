import numpy as np
from PIL import Image
from typing import Dict, Any, List

class NoiseAnalyzer:
    """
    Noise Variance & Sensor Pattern Inconsistency Analyzer.
    Detects spliced regions by measuring Laplacian high-frequency noise distribution
    across image blocks. Spliced elements often introduce noise level discrepancies.
    """

    @staticmethod
    def analyze(image: Image.Image, block_size: int = 64) -> Dict[str, Any]:
        """
        Analyze high-frequency noise variance across 64x64 grid tiles.
        """
        gray = image.convert("L")
        img_np = np.array(gray, dtype=np.float32)
        h, w = img_np.shape

        # Approximate High Pass Noise using 3x3 Laplacian kernel
        laplacian_kernel = np.array([
            [0,  1, 0],
            [1, -4, 1],
            [0,  1, 0]
        ], dtype=np.float32)

        # Fast convolution via NumPy slicing padding
        padded = np.pad(img_np, 1, mode='edge')
        lap_map = (
            padded[0:-2, 1:-1] + padded[2:, 1:-1] +
            padded[1:-1, 0:-2] + padded[1:-1, 2:] -
            4 * padded[1:-1, 1:-1]
        )

        block_variances = []
        noise_anomalies: List[Dict[str, Any]] = []

        for y in range(0, h - block_size + 1, block_size):
            for x in range(0, w - block_size + 1, block_size):
                block = lap_map[y:y+block_size, x:x+block_size]
                var = float(np.var(block))
                block_variances.append(var)

        if not block_variances:
            return {
                "overall_noise_std": 0.0,
                "noise_inconsistency_score": 0.0,
                "is_inconsistent": False,
                "noise_anomalies": []
            }

        mean_var = float(np.mean(block_variances))
        std_var = float(np.std(block_variances))

        # Identify blocks with extreme noise deviation (> 2.5 std away from global mean)
        idx = 0
        for y in range(0, h - block_size + 1, block_size):
            for x in range(0, w - block_size + 1, block_size):
                var = block_variances[idx]
                if abs(var - mean_var) > (2.5 * std_var) and var > 5.0:
                    noise_anomalies.append({
                        "bbox": [x, y, block_size, block_size],
                        "variance": round(var, 2),
                        "deviation_sigma": round(abs(var - mean_var) / (std_var + 1e-5), 2)
                    })
                idx += 1

        noise_score = min(100.0, round((std_var / (mean_var + 1.0)) * 50.0 + len(noise_anomalies) * 4.0, 1))

        return {
            "mean_noise_variance": round(mean_var, 2),
            "noise_variance_std": round(std_var, 2),
            "noise_inconsistency_score": noise_score,
            "is_inconsistent": noise_score > 35.0 or len(noise_anomalies) >= 4,
            "anomaly_count": len(noise_anomalies),
            "noise_anomalies": noise_anomalies[:8]
        }
