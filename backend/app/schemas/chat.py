"""
AryaSaarthi Pydantic Schemas — Chat
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from .scheme import SchemeRecommendationItem


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None


class ChatResponse(BaseModel):
    message: str
    intent: str
    confidence: float
    schemes: List[Dict[str, Any]] = []
    eligibility: Optional[Dict[str, Any]] = None
    next_action: Optional[str] = None
    conversation_id: int
    extracted_entities: Optional[Dict[str, Any]] = None
