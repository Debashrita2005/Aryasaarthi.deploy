"""
AryaSaarthi — Ask Arya Chatbot Rule Engine
Plain transparent Python decision logic over MongoDB scheme documents.
Deterministic, explainable, no black-box outputs.
Includes:
- Standardized template-based match_reason
- Multi-attribute weighted ranking (interest rate, loan fit, moratorium) with interest rate as tiebreaker
- Comprehensive default-value fallbacks for partial/malformed scheme documents
- Explainable no-match advisor computing the closest scheme
"""

from typing import List, Dict, Any, Optional

try:
    from config import settings
except ImportError:
    class DummySettings:
        RANKING_WEIGHT_INTEREST = 0.40
        RANKING_WEIGHT_AMOUNT_FIT = 0.35
        RANKING_WEIGHT_MORATORIUM = 0.25
    settings = DummySettings()


def sanitize_scheme_doc(scheme: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensures safe default-value fallbacks for any missing or optional scheme fields,
    guaranteeing that a partially-filled document never crashes evaluation.
    """
    moratorium = scheme.get("moratorium_months")
    if isinstance(moratorium, list) and len(moratorium) > 0:
        moratorium_list = [int(m) for m in moratorium]
    elif isinstance(moratorium, (int, float)):
        moratorium_list = [int(moratorium)]
    else:
        moratorium_list = [3]

    eligible_types = scheme.get("eligible_project_types")
    if not isinstance(eligible_types, list):
        eligible_types = []

    return {
        "scheme_id": str(scheme.get("scheme_id") or scheme.get("id") or scheme.get("code") or "NSFDC-GEN-01"),
        "name": str(scheme.get("name") or "NSFDC Concessional Scheme"),
        "category": str(scheme.get("category") or "self_employment"),
        "min_income": float(scheme.get("min_income") if scheme.get("min_income") is not None else 0),
        "max_income": float(scheme.get("max_income") if scheme.get("max_income") is not None else 500000),
        "min_amount": float(scheme.get("min_amount") if scheme.get("min_amount") is not None else 0),
        "max_amount": float(scheme.get("max_amount") if scheme.get("max_amount") is not None else 5000000),
        "interest_rate_min": float(scheme.get("interest_rate_min") if scheme.get("interest_rate_min") is not None else 6.0),
        "interest_rate_max": float(scheme.get("interest_rate_max") if scheme.get("interest_rate_max") is not None else 8.5),
        "moratorium_months": moratorium_list,
        "eligible_project_types": [str(t).lower() for t in eligible_types],
        "cost_coverage_pct": float(scheme.get("cost_coverage_pct") if scheme.get("cost_coverage_pct") is not None else 90),
        "target_gender": scheme.get("target_gender"),
        "target_beneficiary": scheme.get("target_beneficiary"),
        "description": str(scheme.get("description") or ""),
    }


def build_standard_reason(user_profile: Dict[str, Any], scheme: Dict[str, Any]) -> str:
    """
    Standardizes match_reason into a fixed template function (not ad-hoc string building)
    so every recommendation explains itself consistently:
    'Matched because income ₹{x} is within ₹{min}-₹{max} and purpose '{type}' is eligible'
    """
    income = float(user_profile.get("income", 0))
    min_inc = float(scheme.get("min_income", 0))
    max_inc = float(scheme.get("max_income", 500000))
    project_type = str(user_profile.get("project_type") or user_profile.get("purpose") or "general activity").replace("_", " ")
    scheme_name = scheme.get("name", "Scheme")

    base_reason = (
        f"Matched because income ₹{income:,.0f} is within ₹{min_inc:,.0f}-₹{max_inc:,.0f} "
        f"and purpose '{project_type}' is eligible under {scheme_name}."
    )

    extras = []
    gender = user_profile.get("gender")
    if gender == "FEMALE" and ("mahila" in scheme_name.lower() or scheme.get("target_gender") == "FEMALE"):
        extras.append("Priority 4.0% interest rate for women entrepreneurs.")
    elif gender == "FEMALE":
        extras.append("Eligible for female beneficiary interest rebate.")

    if user_profile.get("is_pwd"):
        if scheme.get("target_beneficiary") == "pwd" or "divyang" in scheme_name.lower():
            extras.append("Includes Divyangjan concessions and equipment assistance.")

    coverage = scheme.get("cost_coverage_pct", 90)
    extras.append(f"Provides up to {coverage:.0f}% project financing.")

    if extras:
        return f"{base_reason} {' '.join(extras)}"
    return base_reason


# Alias for backward compatibility
build_reason = build_standard_reason


def compute_weighted_ranking_score(
    user_amount: float,
    scheme: Dict[str, Any]
) -> float:
    """
    Computes a configurable multi-attribute weighted score across:
    1. Interest rate (lower interest = higher score)
    2. Loan amount fit (centered well within min/max slab = higher score)
    3. Moratorium length (longer grace period = higher score)
    Interest rate serves as the primary tiebreaker.
    """
    w_interest = getattr(settings, "RANKING_WEIGHT_INTEREST", 0.40)
    w_amount = getattr(settings, "RANKING_WEIGHT_AMOUNT_FIT", 0.35)
    w_moratorium = getattr(settings, "RANKING_WEIGHT_MORATORIUM", 0.25)

    # 1. Normalized interest score (0% interest -> 1.0, 12% interest -> 0.0)
    rate = scheme.get("interest_rate_min", 6.0)
    norm_interest = max(0.0, min(1.0, 1.0 - (rate / 12.0)))

    # 2. Loan amount fit within scheme slab
    min_amt = scheme.get("min_amount", 0)
    max_amt = scheme.get("max_amount", 5000000)
    span = max(1.0, max_amt - min_amt)
    midpoint = min_amt + (span / 2.0)
    # Closer to midpoint or requested amount within span gets up to 1.0
    distance_from_mid = abs(user_amount - midpoint) / (span / 2.0)
    norm_amount = max(0.4, min(1.0, 1.0 - (0.4 * distance_from_mid)))

    # 3. Moratorium score (0 months -> 0.0, 12 months -> 1.0)
    mora_list = scheme.get("moratorium_months") or [3]
    max_mora = max(mora_list)
    norm_moratorium = max(0.0, min(1.0, max_mora / 12.0))

    total_score = (w_interest * norm_interest) + (w_amount * norm_amount) + (w_moratorium * norm_moratorium)
    return round(total_score, 4)


def compute_no_match_explanation(user_profile: Dict[str, Any], schemes: List[Dict[str, Any]]) -> str:
    """
    Computes the closest scheme when no exact match is found and clearly explains
    what change would make the user eligible (e.g. income or amount threshold).
    """
    if not schemes:
        return "No schemes are currently registered in the database for evaluation."

    sanitized_schemes = [sanitize_scheme_doc(s) for s in schemes]
    user_income = float(user_profile.get("income", 0))
    user_amount = float(user_profile.get("amount", 0))
    user_proj = str(user_profile.get("project_type") or "").lower()
    user_gender = user_profile.get("gender")

    closest_scheme = None
    closest_reason = None
    min_distance = float("inf")

    for s in sanitized_schemes:
        # Check income gap
        if user_income > s["max_income"]:
            gap = user_income - s["max_income"]
            if gap < min_distance:
                min_distance = gap
                closest_scheme = s
                closest_reason = f"if your annual family income were under ₹{s['max_income']:,.0f}, you would qualify for {s['name']}"

        # Check amount gap
        elif user_amount > s["max_amount"]:
            gap = user_amount - s["max_amount"]
            if gap < min_distance:
                min_distance = gap
                closest_scheme = s
                closest_reason = f"if your loan requirement were up to ₹{s['max_amount']:,.0f}, you would qualify for {s['name']}"

        elif user_amount < s["min_amount"]:
            gap = s["min_amount"] - user_amount
            if gap < min_distance:
                min_distance = gap
                closest_scheme = s
                closest_reason = f"if your funding requirement were at least ₹{s['min_amount']:,.0f}, you would qualify for {s['name']}"

        # Check gender restriction
        elif s.get("target_gender") == "FEMALE" and user_gender == "MALE":
            closest_scheme = s
            closest_reason = f"Mahila Samriddhi Yojana ({s['name']}) is dedicated exclusively to women entrepreneurs"

        # Check project type mismatch
        elif user_proj and user_proj not in s["eligible_project_types"]:
            approved = ", ".join(s["eligible_project_types"][:3])
            closest_scheme = s
            closest_reason = f"if your business activity was among approved sectors ({approved}), you would qualify for {s['name']}"

    if closest_scheme and closest_reason:
        return f"No exact match found — {closest_reason}."
    return "No exact match found for your requested parameters. Consider adjusting the loan amount or exploring universal government schemes like PM-SVANidhi or PMEGP."


def recommend_schemes(user_profile: Dict[str, Any], schemes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Evaluates applicant profile against MongoDB scheme documents:
    1. Income criteria (min_income <= user_income <= max_income)
    2. Loan amount slab (min_amount <= user_amount <= max_amount)
    3. Project type eligibility (user_project_type in eligible_project_types)
    4. Gender eligibility (e.g. Mahila Samriddhi Yojana reserved for female beneficiaries)
    5. PwD eligibility & prioritization for disabled beneficiaries
    6. Multi-attribute weighted ranking (interest rate, loan amount fit, moratorium length)
       with interest rate and scheme_id as deterministic tiebreakers.
    """
    matches = []
    user_income = float(user_profile.get("income", 0))
    user_amount = float(user_profile.get("amount", 0))
    user_proj = str(user_profile.get("project_type") or "").lower()
    user_category = str(user_profile.get("purpose") or "").lower()
    user_gender = user_profile.get("gender")
    user_is_pwd = bool(user_profile.get("is_pwd"))

    for raw_scheme in schemes:
        scheme = sanitize_scheme_doc(raw_scheme)

        # PwD check: schemes reserved specifically for PwD beneficiaries
        target_ben = scheme.get("target_beneficiary")
        if target_ben == "pwd" and not user_is_pwd and user_proj not in scheme["eligible_project_types"]:
            continue

        # Gender check: schemes specifically for women exclude male applicants
        target_gender = scheme.get("target_gender")
        if target_gender == "FEMALE" or "mahila" in scheme["name"].lower():
            if user_gender == "MALE":
                continue

        # 1. Income bounds check (boundary values inclusive: min_income <= user_income <= max_income)
        if not (scheme["min_income"] <= user_income <= scheme["max_income"]):
            continue

        # 2. Amount slab check (boundary values inclusive: min_amount <= user_amount <= max_amount)
        if not (scheme["min_amount"] <= user_amount <= scheme["max_amount"]):
            continue

        # 3. Project type check
        eligible_types = scheme["eligible_project_types"]
        is_type_match = user_proj in eligible_types if user_proj else False

        # If user is PwD and looking for assistive aids or general self employment:
        if user_is_pwd and scheme.get("target_beneficiary") == "pwd":
            is_type_match = True

        # If user only gave broad category (e.g. education) or project_type matched category
        if not is_type_match and user_category:
            if scheme.get("category", "").lower() == user_category:
                is_type_match = True

        # If project type is general or matches broad scheme
        if not is_type_match and not user_proj:
            is_type_match = True

        if not is_type_match:
            continue

        # Compute multi-attribute ranking score
        score = compute_weighted_ranking_score(user_amount, scheme)

        matches.append({
            **raw_scheme,
            **scheme,
            "ranking_score": score,
            "match_reason": build_standard_reason(user_profile, scheme)
        })

    # Sort matches deterministically:
    # 1. If PwD user, prioritize PwD-specific schemes first
    # 2. Highest weighted ranking_score (descending)
    # 3. Lowest interest_rate_min as tiebreaker (ascending)
    # 4. Scheme ID as final stable tiebreaker
    if user_is_pwd:
        matches.sort(
            key=lambda s: (
                0 if s.get("target_beneficiary") == "pwd" else 1,
                -s.get("ranking_score", 0.0),
                s.get("interest_rate_min", 999.0),
                s.get("scheme_id", "")
            )
        )
    else:
        matches.sort(
            key=lambda s: (
                -s.get("ranking_score", 0.0),
                s.get("interest_rate_min", 999.0),
                s.get("scheme_id", "")
            )
        )

    return matches
