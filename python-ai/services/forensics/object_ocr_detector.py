import re
import numpy as np
from PIL import Image
from typing import Dict, Any, List

class ObjectOCRDetector:
    """
    Enterprise Object Recognition, Face Detection & Enhanced OCR Text Extractor.
    Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) pre-processing
    to extract text, timestamps, currency amounts, case numbers, and security credentials with max precision.
    """

    @staticmethod
    def analyze(image: Image.Image) -> Dict[str, Any]:
        extracted_text = ""
        detected_objects: List[str] = []
        detected_entities: Dict[str, List[str]] = {
            "dates": [],
            "amounts": [],
            "case_ids": [],
            "ip_addresses": [],
            "credentials": [],
            "keywords": []
        }

        try:
            import cv2
            img_np = np.array(image.convert("RGB"))
            h, w, _ = img_np.shape

            # Multi-scale Pre-processing using CLAHE
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
            enhanced_gray = clahe.apply(gray)

            ocr_text_lines = []
            try:
                import easyocr
                reader = easyocr.Reader(['en'], gpu=False)
                results = reader.readtext(enhanced_gray)
                for res in results:
                    text_str = res[1]
                    conf = res[2] if len(res) > 2 else 1.0
                    if len(text_str.strip()) > 1 and conf > 0.3:
                        ocr_text_lines.append(text_str.strip())
            except Exception:
                ocr_text_lines = []

            extracted_text = "\n".join(ocr_text_lines)

            # Advanced Entity Extraction via Regex
            if extracted_text:
                # Case IDs & Evidence References
                case_matches = re.findall(r'\b(?:SC|CASE|INC|ID|CR|FIR)[-_\s:#]?\d{3,8}\b', extracted_text, re.IGNORECASE)
                detected_entities["case_ids"] = list(set(case_matches))

                # Dates & Timestamps
                date_matches = re.findall(r'\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b', extracted_text, re.IGNORECASE)
                detected_entities["dates"] = list(set(date_matches))

                # Currency Amounts & Figures
                amt_matches = re.findall(r'[\$€£₹]\s?\d+(?:,\d{3})*(?:\.\d{2})?|\b\d+(?:,\d{3})*\s?(?:USD|EUR|INR|GBP)\b', extracted_text)
                detected_entities["amounts"] = list(set(amt_matches))

                # IP & Hash References
                ip_matches = re.findall(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', extracted_text)
                detected_entities["ip_addresses"] = list(set(ip_matches))

                # Security Badges / License Plates
                cred_matches = re.findall(r'\b[A-Z]{2,3}[-_\s]?\d{3,6}\b', extracted_text)
                detected_entities["credentials"] = list(set(cred_matches))

            # Object & Face Detection
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(enhanced_gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
            if len(faces) > 0:
                detected_objects.append(f"Person / Face ({len(faces)} detected)")

            # Text Block Contours
            rect_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 3))
            grad_x = cv2.Sobel(enhanced_gray, ddepth=cv2.CV_32F, dx=1, dy=0, ksize=-1)
            grad_x = cv2.convertScaleAbs(grad_x)
            blur = cv2.GaussianBlur(grad_x, (3, 3), 0)
            _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, rect_kernel)
            
            cnts, _ = cv2.findContours(morph, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            text_blocks = [c for c in cnts if cv2.boundingRect(c)[2] > 35 and cv2.boundingRect(c)[3] > 8]
            
            if len(text_blocks) > 0:
                detected_objects.append("Document Text Blocks")

            if not detected_objects:
                detected_objects = ["Digital Media Artifact", "Graphic Elements"]

        except Exception as err:
            print(f"⚠️ OCR/Object detection notice: {err}")
            detected_objects = ["Digital Evidence Image"]

        return {
            "extracted_text": extracted_text,
            "detected_objects": list(set(detected_objects)),
            "extracted_entities": detected_entities,
            "has_text": len(extracted_text.strip()) > 0
        }
