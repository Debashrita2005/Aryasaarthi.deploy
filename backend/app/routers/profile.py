"""
AryaSaarthi API Router — Profile Endpoints
Endpoints:
- GET /api/profile
- PUT /api/profile
- POST /api/profile/extract
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.profile import Profile
from ..schemas.profile import ProfileResponse, ProfileUpdateRequest, ProfileExtractRequest
from ..dependencies import get_current_user
from ..services.ml_service import ml_service


router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("", response_model=ProfileResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves profile of the authenticated user."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile.to_dict()


@router.put("", response_model=ProfileResponse)
def update_user_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates user profile attributes."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    req_data = request.model_dump(exclude_unset=True)
    for field, val in req_data.items():
        setattr(profile, field, val)

    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return profile.to_dict()


@router.post("/extract")
def extract_profile_from_text(request: ProfileExtractRequest):
    """
    Extracts structured profile entities from arbitrary user text.
    Runs 100% locally via deterministic entity extractor.
    """
    entities = ml_service.extract_profile(request.text)
    return entities
