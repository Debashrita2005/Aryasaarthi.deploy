"""
AryaSaarthi Routers Module
"""

from .auth import router as auth_router
from .profile import router as profile_router
from .schemes import router as schemes_router
from .eligibility import router as eligibility_router
from .recommendations import router as recommendations_router
from .chat import router as chat_router
from .ocr import router as ocr_router
from .asr import router as asr_router

__all__ = [
    "auth_router",
    "profile_router",
    "schemes_router",
    "eligibility_router",
    "recommendations_router",
    "chat_router",
    "ocr_router",
    "asr_router",
]
