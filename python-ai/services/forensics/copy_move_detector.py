import numpy as np
from PIL import Image
from typing import Dict, Any, List

class CopyMoveDetector:
    """
    Copy-Move Forgery Detector.
    Detects duplicated or cloned areas within the same image using OpenCV
    feature keypoint matching (ORB/SIFT) or block-matching descriptors.
    """

    @staticmethod
    def analyze(image: Image.Image) -> Dict[str, Any]:
        """
        Detect copy-move cloning anomalies using OpenCV keypoint matching.
        """
        cloned_regions: List[Dict[str, Any]] = []
        match_count = 0
        is_cloned = False
        confidence = 0.0

        try:
            import cv2
            
            # Convert PIL image to OpenCV BGR / Gray format
            img_np = np.array(image.convert("RGB"))
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            h, w = gray.shape

            # Resize if image is extremely large to keep performance fast
            max_dim = 1000
            scale = 1.0
            if max(h, w) > max_dim:
                scale = max_dim / float(max(h, w))
                gray = cv2.resize(gray, (int(w * scale), int(h * scale)))

            # Initialize ORB detector
            orb = cv2.ORB_create(nfeatures=1500)
            keypoints, descriptors = orb.detectAndCompute(gray, None)

            if descriptors is not None and len(descriptors) > 10:
                # Match keypoints with BFMatcher (Hamming distance for ORB)
                bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
                matches = bf.match(descriptors, descriptors)

                # Filter out self-matches (distance between keypoint coordinates must be > 30px)
                valid_clones = []
                min_pixel_distance = 35.0 * scale

                for m in matches:
                    if m.queryIdx != m.trainIdx:
                        pt1 = keypoints[m.queryIdx].pt
                        pt2 = keypoints[m.trainIdx].pt
                        dist = np.sqrt((pt1[0] - pt2[0])**2 + (pt1[1] - pt2[1])**2)

                        # High similarity descriptor at distant pixel locations indicates cloning
                        if dist > min_pixel_distance and m.distance < 25:
                            valid_clones.append({
                                "source_pt": [int(pt1[0] / scale), int(pt1[1] / scale)],
                                "target_pt": [int(pt2[0] / scale), int(pt2[1] / scale)],
                                "descriptor_distance": round(float(m.distance), 2),
                                "displacement": round(float(dist / scale), 1)
                            })

                match_count = len(valid_clones)
                if match_count >= 5:
                    is_cloned = True
                    confidence = round(min(99.2, 75.0 + match_count * 1.5), 1)
                    
                    # Group keypoints into bounding region estimates
                    pts = np.array([item["target_pt"] for item in valid_clones[:12]])
                    if len(pts) > 0:
                        min_x, min_y = int(np.min(pts[:, 0])), int(np.min(pts[:, 1]))
                        max_x, max_y = int(np.max(pts[:, 0])), int(np.max(pts[:, 1]))
                        cloned_regions.append({
                            "bbox": [min_x, min_y, max(20, max_x - min_x), max(20, max_y - min_y)],
                            "matched_keypoints": match_count,
                            "type": "COPY_MOVE_CLONE_CLUSTER"
                        })

        except Exception as err:
            print(f"⚠️ OpenCV Copy-Move analysis notice: {err}")

        return {
            "copy_move_detected": is_cloned,
            "confidence_score": confidence,
            "matched_keypoints_count": match_count,
            "cloned_regions": cloned_regions,
            "summary": f"Copy-Move cloning analysis found {match_count} suspicious duplicated keypoint matches." if is_cloned else "No copy-move region duplication detected."
        }
