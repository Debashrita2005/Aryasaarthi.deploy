"""
AryaSaarthi ML Pipeline — Deterministic Rule-Based Eligibility Engine
Evaluates candidate scheme rules against user profile attributes.
Returns controlled states: eligible, potentially_eligible, not_eligible, insufficient_information.
Never claims official or legal eligibility.
"""

from typing import Dict, Any, List


def evaluate_eligibility(profile: Dict[str, Any], scheme: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates rule-based eligibility for a scheme against user profile attributes.
    Returns:
    {
        "status": "eligible" | "potentially_eligible" | "not_eligible" | "insufficient_information",
        "matched_conditions": list[str],
        "failed_conditions": list[str],
        "missing_information": list[str],
        "explanation": str
    }
    """
    elig_rules = scheme.get("eligibility_data", {})
    matched = []
    failed = []
    missing = []

    # 1. State / Location check
    allowed_states = elig_rules.get("states", ["All"])
    user_state = profile.get("state")
    if "All" in allowed_states or not allowed_states:
        matched.append("Geographic location: open nationally")
    elif not user_state:
        missing.append("state (to verify regional eligibility)")
    elif user_state in allowed_states or any(user_state.lower() == s.lower() for s in allowed_states):
        matched.append(f"State residency: matches {user_state}")
    else:
        failed.append(f"Scheme is restricted to {', '.join(allowed_states)} (your profile state: {user_state})")

    # 2. Occupation check
    allowed_occs = elig_rules.get("occupations", [])
    user_occ = profile.get("occupation")
    if not allowed_occs:
        matched.append("Occupation: unrestricted")
    elif not user_occ:
        missing.append("occupation (e.g. farmer, artisan, student)")
    else:
        user_occ_clean = user_occ.lower().strip()
        is_occ_match = any(
            o.lower() in user_occ_clean or user_occ_clean in o.lower()
            for o in allowed_occs
        )
        if is_occ_match:
            matched.append(f"Occupation matches: {user_occ}")
        else:
            failed.append(f"Eligible occupations are {', '.join(allowed_occs)} (your profile: {user_occ})")

    # 3. Land ownership requirement
    requires_land = elig_rules.get("requires_land", False)
    user_land = profile.get("land_area")
    if requires_land:
        if user_land is None:
            missing.append("land holding area (acres/bigha)")
        elif float(user_land) > 0:
            matched.append(f"Land holding: {user_land} {profile.get('land_unit', 'acres')} meets requirement")
        else:
            failed.append("Scheme requires landholding, but profile indicates 0 land area")

    # 4. Maximum Land Area Limit (e.g., small/marginal farmer schemes)
    max_land = elig_rules.get("max_land_area")
    if max_land is not None:
        if user_land is None:
            missing.append("land holding area to confirm small farmer ceiling")
        elif float(user_land) <= max_land:
            matched.append(f"Land area {user_land} acres within ceiling of {max_land} acres")
        else:
            failed.append(f"Land holding ({user_land} acres) exceeds scheme maximum limit of {max_land} acres")

    # 5. Annual Income Limit
    max_inc = elig_rules.get("max_income")
    user_inc = profile.get("annual_income")
    if max_inc is not None:
        if user_inc is None:
            missing.append("annual family income (to verify income ceiling)")
        elif float(user_inc) <= max_inc:
            matched.append(f"Annual income ₹{user_inc:,.0f} is within ceiling of ₹{max_inc:,.0f}")
        else:
            failed.append(f"Annual income ₹{user_inc:,.0f} exceeds scheme ceiling of ₹{max_inc:,.0f}")

    # 6. Age limits
    min_age = elig_rules.get("min_age")
    max_age = elig_rules.get("max_age")
    user_age = profile.get("age")
    if min_age is not None:
        if user_age is None:
            missing.append("age")
        elif int(user_age) >= min_age:
            matched.append(f"Age {user_age} meets minimum age of {min_age}")
        else:
            failed.append(f"Age {user_age} is below minimum requirement of {min_age} years")

    if max_age is not None:
        if user_age is not None:
            if int(user_age) <= max_age:
                matched.append(f"Age {user_age} is within maximum limit of {max_age}")
            else:
                failed.append(f"Age {user_age} exceeds maximum age limit of {max_age} years")

    # 7. Gender requirement
    req_gender = elig_rules.get("gender")
    user_gender = profile.get("gender")
    if req_gender:
        if not user_gender:
            missing.append("gender (scheme designated for specific demographic)")
        elif req_gender.lower() == user_gender.lower():
            matched.append(f"Gender: matches required {req_gender}")
        else:
            failed.append(f"Scheme is designated for {req_gender} applicants")

    # Determine controlled status
    if failed:
        status = "not_eligible"
        explanation = f"You do not meet one or more criteria: {'; '.join(failed)}."
    elif missing and not matched:
        status = "insufficient_information"
        explanation = f"We need additional information to evaluate: {', '.join(missing)}."
    elif missing:
        status = "potentially_eligible"
        explanation = f"You match several criteria ({len(matched)} met), but need to provide: {', '.join(missing)}."
    else:
        status = "eligible"
        explanation = f"All {len(matched)} evaluated criteria match your current profile."

    return {
        "status": status,
        "matched_conditions": matched,
        "failed_conditions": failed,
        "missing_information": missing,
        "explanation": explanation
    }
