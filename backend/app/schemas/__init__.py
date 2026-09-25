"""
AryaSaarthi Schemas Module
"""

from .auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from .profile import ProfileUpdateRequest, ProfileResponse, ProfileExtractRequest
from .scheme import SchemeResponse, SchemeSearchRequest, RecommendationRequest, RecommendationResponse, SchemeRecommendationItem
from .eligibility import EligibilityCheckRequest, EligibilityResponse
from .chat import ChatRequest, ChatResponse

__all__ = [
    "UserRegisterRequest",
    "UserLoginRequest",
    "TokenResponse",
    "UserResponse",
    "ProfileUpdateRequest",
    "ProfileResponse",
    "ProfileExtractRequest",
    "SchemeResponse",
    "SchemeSearchRequest",
    "RecommendationRequest",
    "RecommendationResponse",
    "SchemeRecommendationItem",
    "EligibilityCheckRequest",
    "EligibilityResponse",
    "ChatRequest",
    "ChatResponse",
]
