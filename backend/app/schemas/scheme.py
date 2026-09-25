"""
AryaSaarthi Pydantic Schemas — Schemes
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class SchemeResponse(BaseModel):
    id: int
    scheme_id: str
    name: str
    category: str
    description: str
    benefits: str
    eligibility_data: Dict[str, Any]
    documents: List[Any]
    application_process: Optional[str] = None
    official_source: Optional[str] = None
    state: str
    active: bool

    class Config:
        from_attributes = True


class SchemeSearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5


class SchemeRecommendationItem(BaseModel):
    scheme_id: str
    name: str
    category: str
    description: str
    benefits: str
    match_score: float
    component_breakdown: Optional[Dict[str, float]] = None
    eligibility: Optional[Dict[str, Any]] = None
    documents: Optional[List[Any]] = None
    application_process: Optional[str] = None
    official_source: Optional[str] = None
    state: Optional[str] = None
    disclaimer: str = "Matching score is an analytical recommendation and does not constitute official government approval."


class RecommendationRequest(BaseModel):
    user_id: Optional[int] = None
    profile_override: Optional[Dict[str, Any]] = None
    top_k: Optional[int] = 5


class RecommendationResponse(BaseModel):
    user_id: Optional[int] = None
    total_matches: int
    recommendations: List[SchemeRecommendationItem]
