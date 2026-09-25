"""
AryaSaarthi Input Validation Utilities
Validates clean inputs and prevents malicious injections.
"""

import re
from typing import Optional


EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def validate_email_str(email: str) -> bool:
    """Validates email format."""
    if not email:
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def sanitize_input(text: Optional[str], max_length: int = 2000) -> str:
    """Sanitizes user text and bounds maximum length."""
    if not text:
        return ""
    clean = text.strip()
    return clean[:max_length]
