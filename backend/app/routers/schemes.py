"""
AryaSaarthi API Router — Scheme Knowledge Base Endpoints
Endpoints:
- GET /api/schemes
- GET /api/schemes/{scheme_id}
- POST /api/schemes/search
- POST /api/schemes/recommend
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.scheme import SchemeResponse, SchemeSearchRequest, RecommendationRequest, RecommendationResponse
from ..services.scheme_service import scheme_service
from ..services.recommendation_service import recommendation_service
from ..services.ml_service import ml_service
from ..dependencies import get_optional_current_user


router = APIRouter(prefix="/api/schemes", tags=["Schemes"])


@router.get("", response_model=List[SchemeResponse])
def list_all_schemes(db: Session = Depends(get_db)):
    """Retrieves all active government schemes from verified knowledge base."""
    return scheme_service.get_all_schemes(db, active_only=True)


@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme_details(scheme_id: str, db: Session = Depends(get_db)):
    """Retrieves detailed information for a specific scheme."""
    scheme = scheme_service.get_scheme_by_id(db, scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{scheme_id}' was not found in verified knowledge base."
        )
    return scheme


@router.post("/search")
def search_schemes(request: SchemeSearchRequest):
    """
    Searches schemes using TF-IDF semantic cosine similarity.
    Returns ranked schemes from local database without fabrication.
    """
    results = ml_service.retrieve_schemes(request.query, top_k=request.top_k or 5)
    return {
        "query": request.query,
        "total_results": len(results),
        "results": results
    }


@router.post("/recommend", response_model=RecommendationResponse)
def recommend_schemes_for_profile(
    request: RecommendationRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Ranks schemes against user profile using transparent multi-factor scoring.
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
