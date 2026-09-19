"""
AryaSaarthi — Ask Arya Chatbot API Routes
FastAPI endpoints for conversational scheme recommendation.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from .dialogue_manager import dialogue_manager, SESSIONS, LAST_RESPONSE_LATENCY_MS
from .similarity_matcher import is_sentence_transformer_loaded, is_sentence_transformer_failed
from .nlu import get_spacy_nlp

try:
    from config import settings
except ImportError:
    class DummySettings:
        SIMILARITY_THRESHOLD = 0.45
        SESSION_TTL_MINUTES = 15
    settings = DummySettings()

router = APIRouter(prefix="/chatbot", tags=["Ask Arya Chatbot"])

class ChatMessageRequest(BaseModel):
    session_id: str = Field(..., description="Unique user session ID")
    text: str = Field(..., description="User message text")
    lang: Optional[str] = Field("en", description="Language code e.g. hi, en, bn, ta, mr")

class ChatMessageResponse(BaseModel):
    session_id: str
    reply: str
    quick_replies: Optional[List[str]] = None
    matched_schemes: Optional[List[Dict[str, Any]]] = None
    slots: Optional[Dict[str, Any]] = None

class ResetRequest(BaseModel):
    session_id: str

@router.get("/health")
async def get_chatbot_health():
    """
    Lightweight health endpoint for live judge demonstrations:
    Reports model load status and last response latency in milliseconds.
    """
    from . import dialogue_manager as dm_mod
    spacy_obj = get_spacy_nlp()
    return {
        "status": "healthy",
        "spacy_loaded": spacy_obj is not None,
        "sentence_transformers_loaded": is_sentence_transformer_loaded(),
        "sentence_transformers_failed": is_sentence_transformer_failed(),
        "last_response_latency_ms": getattr(dialogue_manager, "last_latency_ms", 0.0),
        "active_sessions_count": len(SESSIONS),
        "similarity_threshold": getattr(settings, "SIMILARITY_THRESHOLD", 0.45),
        "session_ttl_minutes": getattr(settings, "SESSION_TTL_MINUTES", 15),
    }

@router.post("/message", response_model=ChatMessageResponse)
async def post_chatbot_message(req: ChatMessageRequest):
    """
    Main dialogue endpoint:
    Accepts user text, updates slot state via multi-tier NLU, evaluates schemes when complete.
    """
    try:
        result = await dialogue_manager.handle_message(req.session_id, req.text, lang=req.lang or "en")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot dialogue error: {str(e)}")

@router.get("/session/{session_id}")
async def get_chatbot_session(session_id: str):
    """
    Retrieves current slot state and history for debugging and judge demonstrations.
    """
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return SESSIONS[session_id]

@router.post("/reset")
async def reset_chatbot_session(req: ResetRequest):
    """
    Resets conversation state for the given session ID.
    """
    dialogue_manager.reset_session(req.session_id)
    return {
        "status": "success",
        "message": f"Session '{req.session_id}' reset successfully."
    }
