import numpy as np
from PIL import Image
from typing import Dict, Any, List

class DeepfakeDetector:
    """
    Deepfake & AI Synthetic Image Detector.
    Analyzes facial crops using FFT Frequency Spectrum Analysis,
    high-frequency power distribution, and facial boundary blending artifacts.
    """

    @staticmethod
    def analyze(image: Image.Image) -> Dict[str, Any]:
        """
        Detect AI-generated faces or GAN/Diffusion facial manipulation artifacts.
        """
        faces_detected: List[Dict[str, Any]] = []
        is_deepfake = False
        deepfake_probability = 0.0
        explanations: List[str] = []

        try:
            import cv2
            img_np = np.array(image.convert("RGB"))
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            h, w = gray.shape

            # Face Detection using OpenCV Haar Cascade
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            face_cascade = cv2.CascadeClassifier(cascade_path)
            
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(40, 40)
            )

            for (x, y, fw, fh) in faces:
                face_crop = gray[y:y+fh, x:x+fw]

                # 1. 2D Discrete Fourier Transform (FFT) Frequency Analysis
                f = np.fft.fft2(face_crop)
                fshift = np.fft.fftshift(f)
                magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-5)

                # High-frequency power ratio calculation
                cy, cx = fh // 2, fw // 2
                r = min(fh, fw) // 6
                y_grid, x_grid = np.ogrid[:fh, :fw]
                mask = (x_grid - cx)**2 + (y_grid - cy)**2 <= r**2

                high_freq_power = float(np.mean(magnitude_spectrum[~mask]))
                low_freq_power = float(np.mean(magnitude_spectrum[mask]))
                freq_ratio = high_freq_power / (low_freq_power + 1e-5)

                # 2. Facial Edge & Blending Gradient Analysis (detect unnatural smoothing)
                laplacian_var = float(cv2.Laplacian(face_crop, cv2.CV_64F).var())

                # GAN / Deepfake synthesis typically has attenuated high-frequency power or over-smooth gradients
                face_risk_score = 0.0
                face_reasons = []

                if freq_ratio < 0.35:
                    face_risk_score += 45.0
                    face_reasons.append("FFT spectrum shows suppressed high-frequency power (synthetic face generation artifact)")
                elif freq_ratio > 0.85:
                    face_risk_score += 35.0
                    face_reasons.append("Abnormal high-frequency noise spikes in facial frequency spectrum")

                if laplacian_var < 35.0:
                    face_risk_score += 35.0
                    face_reasons.append("Excessive skin texture smoothing (Neural network face swap artifact)")

                if face_risk_score >= 40.0:
                    is_deepfake = True
                    deepfake_probability = max(deepfake_probability, min(98.5, round(face_risk_score + 15.0, 1)))
                    explanations.extend(face_reasons)

                faces_detected.append({
                    "bbox": [int(x), int(y), int(fw), int(fh)],
                    "deepfake_score": round(face_risk_score, 1),
                    "fft_freq_ratio": round(freq_ratio, 3),
                    "blurriness_laplacian": round(laplacian_var, 2),
                    "is_suspicious": face_risk_score >= 40.0
                })

        except Exception as err:
            print(f"⚠️ OpenCV Deepfake analysis notice: {err}")

        return {
            "deepfake_detected": is_deepfake,
            "deepfake_probability": deepfake_probability,
            "faces_count": len(faces_detected),
            "faces": faces_detected,
            "indicators": list(set(explanations)),
            "summary": f"Analyzed {len(faces_detected)} faces. " + ("CRITICAL: Facial synthesis / Deepfake artifacts detected!" if is_deepfake else "No synthetic deepfake artifacts detected.")
        }
