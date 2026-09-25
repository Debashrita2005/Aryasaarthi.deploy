"""
AryaSaarthi Backend Service — Eligibility Service
Evaluates rule-based eligibility for schemes against user profile.
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from .ml_service import ml_service
from .scheme_service import scheme_service
from ..models.profile import Profile


class EligibilityService:

    @staticmethod
    def check_eligibility(
        db: Session,
        scheme_id: str,
        user_id: Optional[int] = None,
        profile_override: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Checks rule-based eligibility for a scheme."""
        scheme = scheme_service.get_scheme_by_id(db, scheme_id)
        if not scheme:
            return {
                "scheme_id": scheme_id,
                "scheme_name": None,
                "status": "not_eligible",
                "matched_conditions": [],
                "failed_conditions": [f"Scheme ID '{scheme_id}' was not found in verified knowledge base."],
                "missing_information": [],
                "explanation": "Scheme not found."
            }

        # Resolve profile
        profile_data = {}
        if user_id:
            user_profile = db.query(Profile).filter(Profile.user_id == user_id).first()
            if user_profile:
                profile_data = user_profile.to_dict()

        if profile_override:
            profile_data.update(profile_override)

        # Run deterministic evaluation via ML module
        result = ml_service.evaluate_eligibility(profile_data, scheme)
        result["scheme_id"] = scheme["scheme_id"]
        result["scheme_name"] = scheme["name"]
        return result


eligibility_service = EligibilityService()
