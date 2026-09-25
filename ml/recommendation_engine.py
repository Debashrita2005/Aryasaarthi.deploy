"""
AryaSaarthi ML Pipeline — Transparent Multi-Factor Recommendation Engine
Calculates explainable matching scores across:
score = occupation_match + location_match + land_match + crop_match + income_match + requirement_match
Clearly distinguishes 'matching score' from 'official eligibility'.
"""

from typing import List, Dict, Any, Optional
from .knowledge_retriever import load_schemes_knowledge
from .eligibility_engine import evaluate_eligibility


# Transparent weight distribution (Sums to 1.0)
WEIGHTS = {
    "occupation_match": 0.30,
    "location_match": 0.20,
    "land_match": 0.15,
    "crop_match": 0.10,
    "income_match": 0.15,
    "requirement_match": 0.10
}


def compute_match_breakdown(profile: Dict[str, Any], scheme: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes transparent component scores and total match score [0.0 to 1.0].
    """
    elig_rules = scheme.get("eligibility_data", {})
    breakdown = {}

    # 1. Occupation Match (0.30)
    user_occ = (profile.get("occupation") or "").lower().strip()
    allowed_occs = [o.lower() for o in elig_rules.get("occupations", [])]
    if not allowed_occs or not user_occ:
        breakdown["occupation_match"] = 0.5 if not user_occ else 0.0
    elif any(o in user_occ or user_occ in o for o in allowed_occs):
        breakdown["occupation_match"] = 1.0
    else:
        breakdown["occupation_match"] = 0.0

    # 2. Location Match (0.20)
    user_state = profile.get("state")
    allowed_states = elig_rules.get("states", ["All"])
    if "All" in allowed_states or not allowed_states:
        breakdown["location_match"] = 1.0
    elif user_state and (user_state in allowed_states or any(user_state.lower() == s.lower() for s in allowed_states)):
        breakdown["location_match"] = 1.0
    else:
        breakdown["location_match"] = 0.0

    # 3. Land Match (0.15)
    requires_land = elig_rules.get("requires_land", False)
    user_land = profile.get("land_area")
    if not requires_land:
        breakdown["land_match"] = 1.0
    elif user_land is not None and float(user_land) > 0:
        max_land = elig_rules.get("max_land_area")
        if max_land is None or float(user_land) <= max_land:
            breakdown["land_match"] = 1.0
        else:
            breakdown["land_match"] = 0.2
    else:
        breakdown["land_match"] = 0.0

    # 4. Crop Match (0.10)
    user_crop = (profile.get("crop") or "").lower().strip()
    scheme_crops = [c.lower() for c in elig_rules.get("crops", [])]
    if not scheme_crops:
        breakdown["crop_match"] = 1.0
    elif user_crop and any(user_crop in c or c in user_crop for c in scheme_crops):
        breakdown["crop_match"] = 1.0
    else:
        breakdown["crop_match"] = 0.2

    # 5. Income Match (0.15)
    max_income = elig_rules.get("max_income")
    user_income = profile.get("annual_income")
    if max_income is None:
        breakdown["income_match"] = 1.0
    elif user_income is None:
        breakdown["income_match"] = 0.5
    elif float(user_income) <= max_income:
        breakdown["income_match"] = 1.0
    else:
        breakdown["income_match"] = 0.0

    # 6. Requirement Match (0.10)
    user_req = (profile.get("assistance_requirement") or "").lower()
    keywords = [k.lower() for k in scheme.get("keywords", [])]
    cat = scheme.get("category", "").lower()
    if not user_req:
        breakdown["requirement_match"] = 0.5
    elif any(k in user_req or user_req in k for k in keywords) or user_req in cat:
        breakdown["requirement_match"] = 1.0
    else:
        breakdown["requirement_match"] = 0.1

    # Weighted composite score
    total_score = sum(breakdown[k] * WEIGHTS[k] for k in WEIGHTS)
    return {
        "match_score": round(total_score, 4),
        "component_breakdown": breakdown
    }


def recommend_schemes(
    profile: Dict[str, Any],
    schemes: Optional[List[Dict[str, Any]]] = None,
    min_score: float = 0.35,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Ranks schemes by transparent multi-factor matching score.
    Runs eligibility engine for each candidate scheme.
    Clearly separates 'matching score' from 'official eligibility'.
    """
    if schemes is None:
        schemes = load_schemes_knowledge()

    ranked = []
    for s in schemes:
        scoring = compute_match_breakdown(profile, s)
        score = scoring["match_score"]

        # Run eligibility engine to check rule-based status
        elig = evaluate_eligibility(profile, s)

        # Do not recommend strictly not_eligible schemes unless specifically queried
        if elig["status"] == "not_eligible" and score < 0.60:
            continue

        item = {
            "scheme_id": s.get("scheme_id"),
            "name": s.get("name"),
            "category": s.get("category"),
            "description": s.get("description"),
            "benefits": s.get("benefits"),
            "match_score": score,
            "component_breakdown": scoring["component_breakdown"],
            "eligibility": elig,
            "documents": s.get("documents", []),
            "application_process": s.get("application_process", ""),
            "official_source": s.get("official_source", ""),
            "state": s.get("state", "Central"),
            "disclaimer": "Matching score is an analytical recommendation and does not constitute official government approval."
        }
        ranked.append(item)

    ranked.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked[:top_k]
