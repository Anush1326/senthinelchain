import uuid
import re

def generate_id() -> str:
    """
    Generate a unique identifier.
    """
    return str(uuid.uuid4())

def sanitize_string(text: str) -> str:
    """
    Remove special characters from string.
    """
    return re.sub(r'[^\w\s-]', '', text).strip()

def format_bytes(size: int) -> str:
    """
    Format bytes to human readable format.
    """
    power = 2**10
    n = 0
    power_labels = {0: '', 1: 'K', 2: 'M', 3: 'G', 4: 'T'}
    while size > power:
        size /= power
        n += 1
    return f"{size:.2f} {power_labels[n]}B"
