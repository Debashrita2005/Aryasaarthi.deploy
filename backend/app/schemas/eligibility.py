"""
AryaSaarthi Pydantic Schemas — Eligibility
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class EligibilityCheckRequest(BaseModel):
    scheme_id: str
    user_id: Optional[int] = None
    profile: Optional[Dict[str, Any]] = None


class EligibilityResponse(BaseModel):
    scheme_id: str
    scheme_name: Optional[str] = None
    status: str  # "eligible" | "potentially_eligible" | "not_eligible" | "insufficient_information"
    matched_conditions: List[str]
    failed_conditions: List[str]
    missing_information: List[str]
    explanation: str
