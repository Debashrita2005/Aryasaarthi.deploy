"""
AryaSaarthi — Ask Arya Chatbot API Routes
FastAPI endpoints for conversational scheme recommendation with Multi-Modal (OCR / ASR / TTS) support.
"""

import base64
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from .dialogue_manager import dialogue_manager, SESSIONS, LAST_RESPONSE_LATENCY_MS
from .similarity_matcher import is_sentence_transformer_loaded, is_sentence_transformer_failed
from .nlu import get_spacy_nlp
from .llm_client import llm_client
from .input_handler import input_handler

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
    text: Optional[str] = Field(None, description="User message text")
    image_base64: Optional[str] = Field(None, description="Base64 encoded photo/document for OCR extraction")
    audio_base64: Optional[str] = Field(None, description="Base64 encoded voice recording for ASR")
    lang: Optional[str] = Field("en", description="User preferred language code e.g. hi, en, bn, ta, mr")
    voice_mode: Optional[bool] = Field(False, description="Whether to return synthesized audio TTS")
    is_handwritten: Optional[bool] = Field(False, description="Whether the uploaded image contains handwriting")


class ChatMessageResponse(BaseModel):
    session_id: str
    reply: str
    reply_en: Optional[str] = None
    quick_replies: Optional[List[str]] = None
    matched_schemes: Optional[List[Dict[str, Any]]] = None
    slots: Optional[Dict[str, Any]] = None
    resolved_lang: Optional[str] = None
    audio_base64: Optional[str] = None
    modality: Optional[str] = "text"


class ResetRequest(BaseModel):
    session_id: str


@router.get("/health")
async def get_chatbot_health():
    """
    Lightweight health endpoint for live judge demonstrations:
    Reports model load status and last response latency in milliseconds.
    """
    spacy_obj = get_spacy_nlp()
    return {
        "status": "healthy",
        "ollama_available": llm_client.is_available(),
        "ollama_model": llm_client.model,
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
    Main dialogue endpoint with Multi-Modal routing:
    Accepts text, camera photo (OCR), or voice recording (ASR).
    Translates to English -> Evaluates State Machine & Rules -> Translates output to user's language.
    """
    try:
        image_bytes = None
        if req.image_base64:
            # Clean data URI prefix if present (e.g. data:image/jpeg;base64,...)
            raw_b64 = req.image_base64
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",", 1)[1]
            image_bytes = base64.b64decode(raw_b64)

        audio_bytes = None
        if req.audio_base64:
            raw_audio_b64 = req.audio_base64
            if "," in raw_audio_b64:
                raw_audio_b64 = raw_audio_b64.split(",", 1)[1]
            audio_bytes = base64.b64decode(raw_audio_b64)

        result = await input_handler.handle_turn(
            session_id=req.session_id,
            text=req.text,
            audio_bytes=audio_bytes,
            image_bytes=image_bytes,
            source_lang=req.lang,
            site_preference_lang=req.lang or "en",
            voice_mode=req.voice_mode or False,
            is_handwritten=req.is_handwritten or False,
        )
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
