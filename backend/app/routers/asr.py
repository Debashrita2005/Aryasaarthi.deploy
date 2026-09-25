"""
AryaSaarthi API Router — Local ASR (Automatic Speech Recognition)
Transcribes voice recordings locally using cached Whisper model without external APIs.
"""

import io
import wave
import base64
import logging
from typing import Optional
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel

logger = logging.getLogger("backend.app.asr")

router = APIRouter(prefix="/api/asr", tags=["ASR"])

_whisper_pipeline = None

def get_whisper_pipeline():
    global _whisper_pipeline
    if _whisper_pipeline is None:
        try:
            from transformers import pipeline
            _whisper_pipeline = pipeline(
                "automatic-speech-recognition",
                model="openai/whisper-tiny",
                chunk_length_s=30,
                stride_length_s=5,
                device="cpu"
            )
            logger.info("Local Whisper ASR pipeline initialized with 30s chunking support.")
        except Exception as e:
            logger.error("Failed to load Whisper ASR pipeline: %s", e)
    return _whisper_pipeline


class ASRResponse(BaseModel):
    success: bool
    text: str = ""
    language: str = "hi"
    source: str = "local_whisper"
    error: Optional[str] = None


@router.post("/transcribe", response_model=ASRResponse)
async def transcribe_audio(
    file: Optional[UploadFile] = File(None),
    audio_base64: Optional[str] = Form(None),
    language: str = Form("hi")
):
    """
    Transcribes audio bytes (WAV format, 16kHz mono) to text using local Whisper.
    """
    try:
        raw_bytes = None
        if file is not None:
            raw_bytes = await file.read()
        elif audio_base64:
            raw_bytes = base64.b64decode(audio_base64)

        if not raw_bytes or len(raw_bytes) < 44:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid audio data provided."
            )

        pipe = get_whisper_pipeline()
        if not pipe:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Local Whisper pipeline is not available."
            )

        # Parse WAV audio into float32 numpy array
        try:
            with wave.open(io.BytesIO(raw_bytes), "rb") as wf:
                sample_rate = wf.getframerate()
                num_channels = wf.getnchannels()
                sample_width = wf.getsampwidth()
                num_frames = wf.getnframes()
                pcm_data = wf.readframes(num_frames)

                if sample_width == 2:
                    audio_np = np.frombuffer(pcm_data, dtype=np.int16).astype(np.float32) / 32768.0
                elif sample_width == 4:
                    audio_np = np.frombuffer(pcm_data, dtype=np.int32).astype(np.float32) / 2147483648.0
                elif sample_width == 1:
                    audio_np = (np.frombuffer(pcm_data, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
                else:
                    audio_np = np.frombuffer(pcm_data, dtype=np.int16).astype(np.float32) / 32768.0

                if num_channels > 1:
                    audio_np = audio_np.reshape(-1, num_channels).mean(axis=1)
        except Exception as wave_err:
            logger.warning("Could not parse as standard WAV, fallback raw PCM: %s", wave_err)
            audio_np = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            sample_rate = 16000

        # Map language codes for Whisper
        lang_str = (language or "").strip().lower()
        if lang_str in ["auto", "detect", ""]:
            whisper_lang = None
        elif lang_str.startswith("en"):
            whisper_lang = "en"
        elif lang_str.startswith("hi"):
            whisper_lang = "hi"
        elif lang_str.startswith("bn"):
            whisper_lang = "bn"
        elif lang_str.startswith("mr"):
            whisper_lang = "mr"
        elif lang_str.startswith("ta"):
            whisper_lang = "ta"
        elif lang_str.startswith("te"):
            whisper_lang = "te"
        elif lang_str.startswith("gu"):
            whisper_lang = "gu"
        else:
            whisper_lang = lang_str[:2] if len(lang_str) >= 2 else "hi"

        generate_kwargs = {"task": "transcribe"}
        if whisper_lang:
            generate_kwargs["language"] = whisper_lang

        result = pipe(
            {"raw": audio_np, "sampling_rate": sample_rate},
            generate_kwargs=generate_kwargs
        )
        transcribed_text = (result.get("text", "") or "").strip()

        return ASRResponse(
            success=True,
            text=transcribed_text,
            language=whisper_lang,
            source="local_whisper"
        )
    except Exception as e:
        logger.error("Local ASR transcription error: %s", e)
        return ASRResponse(
            success=False,
            text="",
            language=language,
            source="local_whisper",
            error=str(e)
        )
