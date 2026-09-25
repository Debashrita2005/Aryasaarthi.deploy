"""
AryaSaarthi API Router — Chat Endpoints
Endpoints:
- POST /api/chat
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.chat import ChatRequest, ChatResponse
from ..services.chat_service import chat_service
from ..dependencies import get_optional_current_user


router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
def handle_chat_message(
    request: ChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Primary conversational endpoint:
    - Analyzes message intent and calibrated confidence
    - Extracts profile entities and progressively persists to user profile
    - Retrieves verified schemes or generates transparent recommendations
    - Returns explainable deterministic response without external LLMs
    """
    clean_msg = request.message.strip() if request.message else ""
    if not clean_msg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )

    result = chat_service.process_message(
        db,
        message_text=clean_msg,
        conversation_id=request.conversation_id,
        user=current_user
    )
    return result
