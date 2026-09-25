"""
AryaSaarthi API Router — Multi-Script & Handwritten OCR Endpoints
Fast, in-memory OCR service powered by EasyOCR and TrOCR.
Zero external LLM or cloud API dependencies.
"""

import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel

logger = logging.getLogger("backend.app.ocr")

router = APIRouter(prefix="/api/ocr", tags=["OCR"])


class OCRResponse(BaseModel):
    success: bool
    text: str = ""
    confidence: float = 0.0
    is_low_confidence: bool = False
    script: str = "none"
    engine: str = "easyocr"
    error: Optional[str] = None


@router.post("/extract", response_model=OCRResponse)
async def extract_ocr(
    file: UploadFile = File(...),
    is_handwritten: bool = Form(False),
    lang_hint: str = Form("en"),
):
    """
    Fast, in-memory OCR endpoint for image uploads.
    Extracts printed or handwritten text across English, Hindi, and Bengali scripts.
    """
    try:
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file provided."
            )

        from backend.chatbot.ocr import extract_text_from_image
        res = extract_text_from_image(
            content,
            lang_hint=lang_hint,
            is_handwritten=is_handwritten
        )

        return OCRResponse(
            success=True,
            text=res.get("text", "") or "",
            confidence=round(float(res.get("confidence", 0.0)) * 100, 1),
            is_low_confidence=bool(res.get("is_low_confidence", False)),
            script=res.get("script_detected", "Latin") or "Latin",
            engine=res.get("engine", "easyocr") or "easyocr"
        )
    except Exception as e:
        logger.warning("OCR processing error: %s", e)
        return OCRResponse(
            success=False,
            text="",
            confidence=0.0,
            is_low_confidence=True,
            script="none",
            engine="none",
            error=str(e)
        )
