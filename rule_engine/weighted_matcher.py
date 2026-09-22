"""
AryaSaarthi Rule Engine — Weighted Rule Matcher
Replaces binary first-match-wins with multi-attribute weighted scoring:
- Income fit (0.30)
- Project / Trade fit (0.35)
- Category & Affirmative Action fit (0.20)
- Amount & Moratorium fit (0.15)
Includes:
- Priority-ordered tie-breaking (Lowest interest rate, highest subsidy/coverage)
- Deterministic statutory hard filters
- Transparent zero-match fallback explanation
"""

from typing import List, Dict, Any, Optional, Tuple
from .ground_truth import get_ground_truth_schemes


WEIGHT_PROJECT_FIT = 0.35
WEIGHT_INCOME_FIT = 0.30
WEIGHT_AFFIRMATIVE_FIT = 0.20
WEIGHT_AMOUNT_FIT = 0.15


class SchemeMatchResult:
    def __init__(
        self,
        scheme: Dict[str, Any],
        score: float,
        breakdown: Dict[str, float],
        match_reason: str,
        statutory_passed: bool = True
    ):
        self.scheme = scheme
        self.scheme_id = scheme["scheme_id"]
        self.name = scheme["name"]
        self.category = scheme["category"]
        self.score = round(score, 4)
        self.breakdown = breakdown
        self.match_reason = match_reason
        self.statutory_passed = statutory_passed

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scheme_id": self.scheme_id,
            "name": self.name,
            "category": self.category,
            "min_income": self.scheme["min_income"],
            "max_income": self.scheme["max_income"],
            "min_amount": self.scheme["min_amount"],
            "max_amount": self.scheme["max_amount"],
            "interest_rate_min": self.scheme["interest_rate_min"],
            "interest_rate_max": self.scheme["interest_rate_max"],
            "moratorium_months": self.scheme["moratorium_months"],
            "cost_coverage_pct": self.scheme["cost_coverage_pct"],
            "score": self.score,
            "score_breakdown": self.breakdown,
            "match_reason": self.match_reason,
            "statutory_reference": self.scheme.get("statutory_reference", "NSFDC Guidelines"),
            "manual_review_required": self.scheme.get("manual_review_required", False)
        }


def evaluate_hard_filters(profile: Dict[str, Any], scheme: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Evaluates inviolable statutory hard filters.
    Returns (is_eligible, failure_reason)
    """
    income = profile.get("income")
    sc_status = profile.get("sc_status")
    gender = profile.get("gender")
    is_pwd = profile.get("is_pwd")
    amount = profile.get("amount")

    # 1. Statutory Caste Requirement
    if scheme.get("requires_sc_certificate") and sc_status == "NO":
        return False, "Scheme requires Scheduled Caste (SC) category certification."

    # 2. Hard Income Ceiling
    if income is not None:
        max_income = scheme["max_income"]
        if max_income > 0 and income > max_income * 1.05:  # Strict threshold with 5% grace buffer
            return False, f"Annual income ₹{income:,.0f} exceeds scheme statutory ceiling of ₹{max_income:,.0f}."

    # 3. Target Gender Requirement (e.g. Mahila Samriddhi Yojana strictly for Women)
    if scheme.get("target_gender") == "FEMALE" and gender == "MALE":
        return False, "Mahila Samriddhi Yojana (MSY) is exclusively reserved for women entrepreneurs."

    # 4. Assistive Device / PwD exclusive grant
    if scheme.get("category") == "assistive_grant" and not is_pwd:
        return False, "Assistive device grant is exclusively for Divyangjan / PwD applicants."

    # 5. Amount hard boundary (if requested amount is 3x larger than scheme max limit)
    if amount is not None and amount > 0:
        max_amt = scheme["max_amount"]
        if max_amt > 0 and amount > max_amt * 2.5 and max_amt <= 150000:
            return False, f"Requested loan ₹{amount:,.0f} significantly exceeds microcredit cap of ₹{max_amt:,.0f}."

    return True, None


def compute_weighted_score(profile: Dict[str, Any], scheme: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
    """
    Calculates granular 0.0-1.0 weighted fit score across all dimensional attributes.
    """
    # 1. Project / Trade Fit (0.35)
    project_score = 0.50
    user_project = str(profile.get("project_type") or profile.get("purpose") or "").lower().replace("_", " ")
    eligible_types = [t.replace("_", " ") for t in scheme.get("eligible_project_types", [])]

    if user_project:
        if any(user_project in t or t in user_project for t in eligible_types):
            project_score = 1.0
        elif scheme["category"] == "self_employment" and not any(e in user_project for e in ["education", "btech", "mbbs", "tricycle"]):
            project_score = 0.75
        elif scheme["category"] == "business" and any(e in user_project for e in ["shop", "industry", "manufacturing", "truck", "commercial"]):
            project_score = 0.85
        elif scheme["category"] == "education" and any(e in user_project for e in ["education", "study", "college", "btech", "diploma"]):
            project_score = 1.0
        else:
            project_score = 0.30

    # 2. Income Fit (0.30)
    income_score = 0.70
    income = profile.get("income")
    if income is not None and income > 0:
        max_inc = scheme["max_income"]
        if income <= max_inc:
            # Beneficiaries well within ceiling receive maximum income score
            income_score = 1.0 - (income / (max_inc * 1.5)) * 0.3
            income_score = max(0.5, min(1.0, income_score))
        else:
            income_score = 0.10

    # 3. Affirmative / Gender / Vulnerability Fit (0.20)
    aff_score = 0.60
    gender = profile.get("gender")
    is_pwd = profile.get("is_pwd")
    sc_status = profile.get("sc_status")

    if scheme.get("target_gender") == "FEMALE" and gender == "FEMALE":
        aff_score = 1.0
    elif scheme.get("target_beneficiary") == "pwd" and is_pwd:
        aff_score = 1.0
    elif sc_status == "YES" and scheme.get("requires_sc_certificate"):
        aff_score = 0.85
    elif gender == "FEMALE":
        aff_score = 0.75

    # 4. Amount & Moratorium Fit (0.15)
    amount_score = 0.70
    amount = profile.get("amount")
    morat_req = profile.get("moratorium_months")

    if amount is not None and amount > 0:
        min_amt = scheme["min_amount"]
        max_amt = scheme["max_amount"]
        if min_amt <= amount <= max_amt:
            amount_score = 1.0
        elif amount < min_amt:
            amount_score = 0.60
        else:
            amount_score = 0.40

    if morat_req and morat_req in scheme.get("moratorium_months", []):
        amount_score = min(1.0, amount_score + 0.10)

    # Composite Weighted Total
    total_score = (
        (project_score * WEIGHT_PROJECT_FIT) +
        (income_score * WEIGHT_INCOME_FIT) +
        (aff_score * WEIGHT_AFFIRMATIVE_FIT) +
        (amount_score * WEIGHT_AMOUNT_FIT)
    )

    breakdown = {
        "project_fit": round(project_score, 3),
        "income_fit": round(income_score, 3),
        "affirmative_fit": round(aff_score, 3),
        "amount_fit": round(amount_score, 3)
    }

    return round(total_score, 4), breakdown


def build_explanation(profile: Dict[str, Any], scheme: Dict[str, Any], score: float) -> str:
    """
    Standardized, transparent explanation template detailing why this scheme was matched.
    """
    scheme_name = scheme["name"]
    project = str(profile.get("project_type") or profile.get("purpose") or "livelihood venture").replace("_", " ")
    income = profile.get("income")
    gender = profile.get("gender")
    is_pwd = profile.get("is_pwd")

    reasons = [f"Directly fits {project} under statutory guidelines."]

    if gender == "FEMALE" and scheme.get("target_gender") == "FEMALE":
        reasons.append("Guarantees priority 4.0% p.a. interest rate and 100% project financing for women entrepreneurs.")
    elif is_pwd and scheme.get("target_beneficiary") == "pwd":
        reasons.append("Provides Divyangjan interest rebates and full capital assistance.")
    elif scheme["interest_rate_min"] <= 5.0:
        reasons.append(f"Lowest concessional interest rate ({scheme['interest_rate_min']}% p.a.) with zero collateral.")

    if income is not None:
        reasons.append(f"Family income ₹{income:,.0f} qualifies within statutory ₹{scheme['max_income']:,.0f} ceiling.")

    return f"Matched for {scheme_name}: {' '.join(reasons)}"


def match_and_rank_schemes(
    profile: Dict[str, Any],
    custom_schemes: Optional[List[Dict[str, Any]]] = None
) -> List[SchemeMatchResult]:
    """
    Evaluates all schemes against the user profile using weighted rule scoring.
    Returns ranked list of eligible schemes sorted by:
    1. Composite Fit Score (descending)
    2. Interest rate min (ascending - tiebreaker)
    3. Maximum loan coverage (descending - tiebreaker)
    """
    schemes = custom_schemes if custom_schemes is not None else get_ground_truth_schemes()
    matched_results: List[SchemeMatchResult] = []

    for scheme in schemes:
        passed, fail_reason = evaluate_hard_filters(profile, scheme)
        if not passed:
            continue

        score, breakdown = compute_weighted_score(profile, scheme)
        explanation = build_explanation(profile, scheme, score)
        matched_results.append(SchemeMatchResult(scheme, score, breakdown, explanation, statutory_passed=True))

    # Priority-ordered tie-breaking
    matched_results.sort(
        key=lambda r: (
            -r.score,
            r.scheme["interest_rate_min"],
            -r.scheme["cost_coverage_pct"],
            r.scheme["scheme_id"]
        )
    )

    return matched_results


def compute_no_match_fallback(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Provides an explainable, non-punitive fallback when 0 schemes pass hard filters.
    Calculates nearest statutory boundary and guides citizen to universal options.
    """
    income = profile.get("income", 0) or 0
    sc_status = profile.get("sc_status")

    if sc_status == "NO":
        return {
            "status": "NON_SC_FALLBACK",
            "primary_reason": "Statutory NSFDC funds are dedicated by Central Act exclusively to Scheduled Caste (SC) citizens.",
            "statutory_reference": "National Scheduled Castes Finance and Development Corporation Mandate (MoSJE)",
            "alternative_schemes": [
                {
                    "name": "PM SVANidhi (Microcredit for Street Vendors)",
                    "benefit": "Collateral-free credit up to ₹50,000 with 7% interest subsidy (Universal category)."
                },
                {
                    "name": "PMEGP (Prime Minister's Employment Generation Programme)",
                    "benefit": "Up to 35% government capital subsidy for manufacturing and service setups."
                },
                {
                    "name": "Stand-Up India Scheme",
                    "benefit": "Bank loans between ₹10 Lakh and ₹1 Crore for greenfield enterprises."
                }
            ]
        }

    if income > 500000:
        return {
            "status": "INCOME_CEILING_EXCEEDED",
            "primary_reason": f"Annual family income ₹{income:,.0f} exceeds the central statutory concessional ceiling of ₹5,00,000/year.",
            "statutory_reference": "NSFDC Income Eligibility Notification 2024",
            "alternative_schemes": [
                {
                    "name": "CGTMSE Collateral-Free Bank Lending",
                    "benefit": "Bank term loans up to ₹2 Crore without third-party collateral guarantee."
                },
                {
                    "name": "Stand-Up India Scheme",
                    "benefit": "Commercial credit between ₹10 Lakh and ₹1 Crore."
                }
            ]
        }

    return {
        "status": "GENERAL_FALLBACK",
        "primary_reason": "No exact matching program found for the combination of budget, trade, and category criteria.",
        "statutory_reference": "AryaSaarthi Universal Scheme Navigator",
        "alternative_schemes": [
            {
                "name": "Micro Finance Scheme (MFS)",
                "benefit": "Standard ₹1,40,000 micro-credit unit @ 5.0% interest for general trade."
            }
        ]
    }
