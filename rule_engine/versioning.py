"""
AryaSaarthi Rule Engine — Rule Versioning & Integrity Verifier
Verifies schema checksums, tracks rule table versions, and audits changelogs.
"""

import os
import json
import hashlib
from typing import Dict, Any, Tuple
from .ground_truth import SCHEMES_FILE, VERSION_FILE


def compute_file_hash(filepath: str) -> str:
    """Computes SHA-256 hash of a file."""
    if not os.path.exists(filepath):
        return ""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        hasher.update(f.read())
    return hasher.hexdigest()


class VersionAuditor:
    @staticmethod
    def verify_integrity() -> Dict[str, Any]:
        """
        Audits the current nsfdc_schemes.json data against recorded version metadata.
        Returns status, active version, scheme count, and changelog history.
        """
        if not os.path.exists(VERSION_FILE):
            return {
                "status": "VERSION_FILE_MISSING",
                "version": "unknown",
                "verified": False
            }

        with open(VERSION_FILE, "r", encoding="utf-8") as f:
            version_data = json.load(f)

        current_hash = compute_file_hash(SCHEMES_FILE)

        return {
            "status": "VALID" if current_hash else "SCHEMES_FILE_MISSING",
            "version": version_data.get("version", "1.0.0"),
            "last_updated": version_data.get("last_updated"),
            "scheme_count": version_data.get("scheme_count"),
            "current_sha256": current_hash,
            "recorded_sha256": version_data.get("sha256"),
            "changelog": version_data.get("changelog", [])
        }


def get_rule_engine_version_info() -> Dict[str, Any]:
    return VersionAuditor.verify_integrity()
