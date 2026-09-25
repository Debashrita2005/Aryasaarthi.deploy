"""
AryaSaarthi API Router — Recommendations Endpoints
Endpoints:
- POST /api/recommendations
"""

from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.scheme import RecommendationRequest, RecommendationResponse
from ..services.recommendation_service import recommendation_service
from ..dependencies import get_optional_current_user


router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.post("", response_model=RecommendationResponse)
def get_user_recommendations(
    request: RecommendationRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes ranked scheme recommendations with transparent matching breakdown.
    Clearly distinguishes matching score from official legal eligibility.
    """
    target_user_id = request.user_id or (current_user.id if current_user else None)
    recs = recommendation_service.get_recommendations(
        db,
        user_id=target_user_id,
        profile_override=request.profile_override,
        top_k=request.top_k or 5
    )

    return {
        "user_id": target_user_id,
        "total_matches": len(recs),
        "recommendations": recs
    }
