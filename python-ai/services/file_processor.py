import hashlib
import os
from typing import Dict, Any, Tuple
from datetime import datetime

class FileProcessor:
    """
    Utilities for file processing and validation.
    """
    def compute_hash(self, file_path: str, algorithm: str = 'sha256') -> str:
        """
        Compute the hash of a file.
        """
        hash_func = hashlib.new(algorithm)
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_func.update(chunk)
            return hash_func.hexdigest()
        except FileNotFoundError:
            return ""

    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """
        Get file size, type, creation date.
        """
        try:
            stat = os.stat(file_path)
            return {
                "size": stat.st_size,
                "creation_date": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_date": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "extension": os.path.splitext(file_path)[1]
            }
        except FileNotFoundError:
            return {}

    def validate_file(self, file_path: str, allowed_extensions: list[str], max_size: int) -> Tuple[bool, str]:
        """
        Check file validity (size, extension).
        """
        if not os.path.exists(file_path):
            return False, "File does not exist."
            
        stat = os.stat(file_path)
        if stat.st_size > max_size:
            return False, f"File size exceeds maximum allowed ({max_size} bytes)."
            
        ext = os.path.splitext(file_path)[1].lower()
        if ext not in allowed_extensions:
            return False, f"File extension {ext} not allowed."
            
        return True, "File is valid."

    def extract_exif(self, file_path: str) -> Dict[str, Any]:
        """
        Extract EXIF data from images.
        """
        # Placeholder for EXIF extraction
        ext = os.path.splitext(file_path)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png', '.tiff']:
            return {"ImageWidth": 1920, "ImageHeight": 1080, "Make": "Unknown"}
        return {}
