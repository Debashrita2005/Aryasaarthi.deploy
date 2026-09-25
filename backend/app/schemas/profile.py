"""
AryaSaarthi Pydantic Schemas — Profile
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel


class ProfileUpdateRequest(BaseModel):
    age: Optional[int] = None
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    land_area: Optional[float] = None
    land_unit: Optional[str] = "acre"
    crop: Optional[str] = None
    annual_income: Optional[float] = None
    loan_requirement: Optional[float] = None
    assistance_requirement: Optional[str] = None


class ProfileResponse(BaseModel):
    user_id: int
    age: Optional[int] = None
    state: Optional[str] = None
    district: Optional[str] = None
    occupation: Optional[str] = None
    land_area: Optional[float] = None
    land_unit: Optional[str] = "acre"
    crop: Optional[str] = None
    annual_income: Optional[float] = None
    loan_requirement: Optional[float] = None
    assistance_requirement: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ProfileExtractRequest(BaseModel):
    text: str
