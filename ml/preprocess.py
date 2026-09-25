"""
AryaSaarthi ML Pipeline — Text Preprocessing Module
Performs reproducible text normalization preserving critical semantic markers.
"""

import re
import unicodedata
from typing import Optional


# Preserved critical semantic words (never stripped)
CRITICAL_TOKENS = {
    "not", "no", "never", "without", "eligible", "ineligible", "apply", "cannot", "can",
    "sc", "st", "obc", "general", "farmer", "loan", "subsidy", "bengal", "acre", "kcc"
}

# Common phonetic/spelling normalizations in Indian English & agricultural queries
COMMON_TYPO_MAP = {
    "elgible": "eligible",
    "eligble": "eligible",
    "elegible": "eligible",
    "applicaton": "application",
    "aply": "apply",
    "aplication": "application",
    "requirment": "requirement",
    "requird": "required",
    "benifit": "benefit",
    "benifits": "benefits",
    "subcidy": "subsidy",
    "subcedy": "subsidy",
    "agriculcher": "agriculture",
    "agriculter": "agriculture",
    "farmar": "farmer",
    "framar": "farmer",
    "kisan": "kisan",
    "krishak": "krishak",
    "sheme": "scheme",
    "schem": "scheme",
    "documnts": "documents",
    "docoments": "documents",
    "certifcate": "certificate",
    "aadhhar": "aadhaar",
    "adhar": "aadhaar",
    "bengol": "bengal",
    "wb": "west bengal",
    "kcc": "kisan credit card",
    "pmkisan": "pm kisan",
}


def clean_text(text: Optional[str]) -> str:
    """
    Standard preprocessing pipeline:
    1. Unicode normalization (NFKD)
    2. Lowercase conversion
    3. Punctuation normalization (replaces hyphens/slashes with spaces, strips non-alphanumeric except spaces)
    4. Typo correction for common domain terms
    5. Whitespace normalization
    """
    if not text:
        return ""

    # 1. Unicode normalization
    text = unicodedata.normalize("NFKD", str(text))

    # 2. Lowercase conversion
    text = text.lower()

    # 3. Currency symbols and punctuation normalization
    text = text.replace("₹", " rupees ")
    text = re.sub(r'\brs\.?\b', ' rupees ', text)
    text = text.replace("/", " ")
    text = text.replace("-", " ")
    text = text.replace("_", " ")

    # Strip extraneous punctuation but keep alphanumeric and whitespace
    text = re.sub(r'[^\w\s\.]', ' ', text)

    # 4. Typo and domain normalization
    tokens = text.split()
    normalized_tokens = [COMMON_TYPO_MAP.get(token, token) for token in tokens]

    # 5. Whitespace collapsing
    cleaned = " ".join(normalized_tokens).strip()
    return cleaned


def tokenize_preserve(text: str) -> list[str]:
    """Tokenizes text while maintaining domain entities."""
    return clean_text(text).split()
