import os
import datetime
from PIL import Image, ExifTags
from typing import Dict, Any, List

class MetadataExtractor:
    """
    Forensic EXIF Metadata & Header Consistency Analyzer.
    Extracts camera metadata, software signatures, GPS location, and timestamp offsets.
    Flags suspicious editing software tags (e.g. Photoshop, Canva, GIMP, Stable Diffusion).
    """

    SUSPICIOUS_SOFTWARE_KEYWORDS = [
        "photoshop", "gimp", "canva", "pixlr", "paint.net",
        "stable diffusion", "midjourney", "dall-e", "adobe",
        "snapseed", "lightroom", "inshot", "facetune"
    ]

    @staticmethod
    def analyze(image: Image.Image, filename: str = "", file_bytes: bytes = b"") -> Dict[str, Any]:
        exif_dict: Dict[str, Any] = {}
        suspicious_tags: List[str] = []
        is_metadata_modified = False

        try:
            raw_exif = image._getexif()
            if raw_exif:
                for tag_id, value in raw_exif.items():
                    tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                    if isinstance(value, (bytes, bytearray)):
                        try:
                            value = value.decode("utf-8", errors="ignore").strip('\x00')
                        except Exception:
                            value = str(value)
                    exif_dict[tag_name] = str(value)

                # Check Software Tag for Editing Tools
                software = exif_dict.get("Software", "").lower()
                for kw in MetadataExtractor.SUSPICIOUS_SOFTWARE_KEYWORDS:
                    if kw in software:
                        is_metadata_modified = True
                        suspicious_tags.append(f"Editing software signature detected in EXIF: '{exif_dict['Software']}'")
                        break

                # Check DateTime vs DateTimeOriginal discrepancies
                dt_mod = exif_dict.get("DateTime")
                dt_orig = exif_dict.get("DateTimeOriginal")
                if dt_mod and dt_orig and dt_mod != dt_orig:
                    is_metadata_modified = True
                    suspicious_tags.append(f"Timestamp discrepancy: Original ({dt_orig}) differs from Modified ({dt_mod})")

        except Exception as err:
            print(f"⚠️ EXIF extraction notice: {err}")

        # Check if EXIF is completely stripped on a JPEG file (often done by social media or editing software)
        is_jpeg = filename.lower().endswith(('.jpg', '.jpeg'))
        if is_jpeg and not exif_dict:
            suspicious_tags.append("EXIF metadata header is completely stripped/removed")

        consistency_score = max(0.0, 100.0 - (len(suspicious_tags) * 30.0))

        return {
            "exif_metadata": exif_dict,
            "has_exif": len(exif_dict) > 0,
            "is_metadata_modified": is_metadata_modified,
            "consistency_score": round(consistency_score, 1),
            "suspicious_tags": suspicious_tags,
            "camera_make": exif_dict.get("Make", "Unknown"),
            "camera_model": exif_dict.get("Model", "Unknown"),
            "software": exif_dict.get("Software", "Original Camera Firmware")
        }
