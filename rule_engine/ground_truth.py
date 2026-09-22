"""
AryaSaarthi Rule Engine — Ground Truth Layer
Loads and validates statutory scheme definitions exclusively from `rule_engine/data/nsfdc_schemes.json`.
Zero hardcoded scheme criteria allowed in downstream rule modules.
"""

import os
import json
from typing import List, Dict, Any, Optional

GROUND_TRUTH_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
SCHEMES_FILE = os.path.join(GROUND_TRUTH_DIR, "nsfdc_schemes.json")
VERSION_FILE = os.path.join(GROUND_TRUTH_DIR, "schema_version.json")
SYNONYMS_FILE = os.path.join(GROUND_TRUTH_DIR, "synonyms.json")


class GroundTruthLoader:
    _instance: Optional["GroundTruthLoader"] = None
    _schemes: Optional[List[Dict[str, Any]]] = None
    _version_info: Optional[Dict[str, Any]] = None
    _synonyms: Optional[Dict[str, Any]] = None

    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or SCHEMES_FILE
        self.reload()

    def reload(self) -> None:
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Ground truth scheme file not found at: {self.data_path}")

        with open(self.data_path, "r", encoding="utf-8") as f:
            raw_schemes = json.load(f)

        self._schemes = [self._normalize_scheme(s) for s in raw_schemes]

        if os.path.exists(VERSION_FILE):
            with open(VERSION_FILE, "r", encoding="utf-8") as f:
                self._version_info = json.load(f)
        else:
            self._version_info = {"version": "unknown", "scheme_count": len(self._schemes)}

        if os.path.exists(SYNONYMS_FILE):
            with open(SYNONYMS_FILE, "r", encoding="utf-8") as f:
                self._synonyms = json.load(f)
        else:
            self._synonyms = {}

    def _normalize_scheme(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalizes a scheme dictionary into a robust, type-checked statutory entity.
        Extracts nested slab/limit definitions into flat runtime properties while preserving
        original audit metadata.
        """
        income_slab = raw.get("income_slab", {})
        loan_limits = raw.get("loan_limits", {})
        interest_rate = raw.get("interest_rate", {})
        repayment = raw.get("repayment", {})

        min_inc = float(income_slab.get("min_income", raw.get("min_income", 0)))
        max_inc = float(income_slab.get("max_income", raw.get("max_income", 500000)))

        min_amt = float(loan_limits.get("min_amount", raw.get("min_amount", 0)))
        max_amt = float(loan_limits.get("max_amount", raw.get("max_amount", 5000000)))
        cost_coverage = float(loan_limits.get("cost_coverage_pct", raw.get("cost_coverage_pct", 90.0)))
        subsidy_max = float(loan_limits.get("subsidy_pct_max", raw.get("subsidy_pct_max", 0.0)))

        rate_min = float(interest_rate.get("rate_min_pct", raw.get("interest_rate_min", 6.0)))
        rate_max = float(interest_rate.get("rate_max_pct", raw.get("interest_rate_max", 8.5)))

        morat_std = repayment.get("moratorium_months_standard", raw.get("moratorium_months", [3]))
        if not isinstance(morat_std, list):
            morat_std = [int(morat_std)]
        morat_std = [int(m) for m in morat_std]

        eligible_types = [str(t).lower() for t in raw.get("eligible_project_types", [])]

        is_review_needed = (
            income_slab.get("manual_review_required", False) or
            loan_limits.get("manual_review_required", False) or
            interest_rate.get("manual_review_required", False) or
            raw.get("manual_review_required", False)
        )

        return {
            "scheme_id": str(raw.get("scheme_id")),
            "code": str(raw.get("code") or raw.get("scheme_id")),
            "name": str(raw.get("name")),
            "category": str(raw.get("category", "self_employment")),
            "target_gender": raw.get("target_gender"),
            "target_beneficiary": raw.get("target_beneficiary"),
            "requires_sc_certificate": bool(raw.get("requires_sc_certificate", True)),
            "min_income": min_inc,
            "max_income": max_inc,
            "min_amount": min_amt,
            "max_amount": max_amt,
            "cost_coverage_pct": cost_coverage,
            "subsidy_pct_max": subsidy_max,
            "interest_rate_min": rate_min,
            "interest_rate_max": rate_max,
            "moratorium_months": morat_std,
            "moratorium_months_max": int(repayment.get("moratorium_months_max", max(morat_std) if morat_std else 6)),
            "eligible_project_types": eligible_types,
            "description": str(raw.get("description", "")),
            "statutory_reference": str(raw.get("statutory_reference", "NSFDC Guidelines")),
            "manual_review_required": is_review_needed,
            "review_notes": raw.get("review_notes") or income_slab.get("review_notes"),
            "raw_data": raw
        }

    def get_all_schemes(self) -> List[Dict[str, Any]]:
        if self._schemes is None:
            self.reload()
        return list(self._schemes or [])

    def get_scheme_by_id(self, scheme_id: str) -> Optional[Dict[str, Any]]:
        for s in self.get_all_schemes():
            if s["scheme_id"] == scheme_id or s["code"] == scheme_id:
                return s
        return None

    def get_manual_review_items(self) -> List[Dict[str, Any]]:
        """
        Returns all schemes or data fields flagged for manual review rather than guessed.
        """
        return [s for s in self.get_all_schemes() if s.get("manual_review_required")]

    def get_synonyms(self) -> Dict[str, Any]:
        if self._synonyms is None:
            self.reload()
        return dict(self._synonyms or {})

    def get_version_info(self) -> Dict[str, Any]:
        return dict(self._version_info or {})


# Global singleton helper
_loader = GroundTruthLoader()

def get_ground_truth_schemes() -> List[Dict[str, Any]]:
    return _loader.get_all_schemes()

def get_ground_truth_synonyms() -> Dict[str, Any]:
    return _loader.get_synonyms()

def get_manual_review_flags() -> List[Dict[str, Any]]:
    return _loader.get_manual_review_items()

def get_schema_version() -> Dict[str, Any]:
    return _loader.get_version_info()
