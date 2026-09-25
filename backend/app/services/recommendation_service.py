"""
AryaSaarthi Backend Service — Recommendation Service
Generates transparent ranked scheme recommendations for user profiles.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from .ml_service import ml_service
from .scheme_service import scheme_service
from ..models.profile import Profile


class RecommendationService:

    @staticmethod
    def get_recommendations(
        db: Session,
        user_id: Optional[int] = None,
        profile_override: Optional[Dict[str, Any]] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Ranks schemes using transparent multi-factor scoring against user profile."""
        profile_data = {}
        if user_id:
            user_profile = db.query(Profile).filter(Profile.user_id == user_id).first()
            if user_profile:
                profile_data = user_profile.to_dict()

        if profile_override:
            profile_data.update(profile_override)

        # Get all active schemes from database
        schemes = scheme_service.get_all_schemes(db, active_only=True)
        if not schemes:
            return []

        # Run transparent recommendation engine
        return ml_service.recommend_schemes(profile_data, schemes=schemes, top_k=top_k)


recommendation_service = RecommendationService()
