"""
AryaSaarthi API Router — Eligibility Check Endpoints
Endpoints:
- POST /api/eligibility/check
"""

from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.eligibility import EligibilityCheckRequest, EligibilityResponse
from ..services.eligibility_service import eligibility_service
from ..dependencies import get_optional_current_user


router = APIRouter(prefix="/api/eligibility", tags=["Eligibility"])


@router.post("/check", response_model=EligibilityResponse)
def check_scheme_eligibility(
    request: EligibilityCheckRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates rule-based eligibility for a scheme against user profile attributes.
    Operates using transparent deterministic rules without calling external LLMs.
    """
    target_user_id = request.user_id or (current_user.id if current_user else None)
    result = eligibility_service.check_eligibility(
        db,
        scheme_id=request.scheme_id,
        user_id=target_user_id,
        profile_override=request.profile
    )
    return result
