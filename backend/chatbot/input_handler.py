"""
AryaSaarthi — Ask Arya Multi-Modal Input Handler & Routing Adapter
Coordinates text, voice (ASR), and image (OCR) inputs through the Pivot-Through-English architecture.
Guarantees zero modifications to the underlying rule engine and LLM slot extraction.
"""

import os
import time
import json
import logging
import base64
from typing import Dict, Any, Optional, Tuple

from .ocr import extract_text_from_image
from .language_service import (
    detect_language_override,
    detect_language,
    resolve_session_language,
    translate,
    speech_to_text,
    text_to_speech,
)
from .dialogue_manager import dialogue_manager, SESSIONS

logger = logging.getLogger("chatbot.input_handler")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
LOW_CONF_LOG_PATH = os.path.join(DATA_DIR, "low_confidence_extractions.log")


class MultiModalInputHandler:
    """
    Entrypoint router for Text, Speech (ASR), and Image (OCR) inputs.
    """

    async def handle_turn(
        self,
        session_id: str,
        text: Optional[str] = None,
        audio_bytes: Optional[bytes] = None,
        image_bytes: Optional[bytes] = None,
        source_lang: Optional[str] = None,
        site_preference_lang: Optional[str] = "en",
        voice_mode: bool = False,
        is_handwritten: bool = False,
    ) -> Dict[str, Any]:
        """
        Executes multi-modal routing, language translation, dialogue management, and response synthesis.
        """
        session = dialogue_manager.get_or_create_session(session_id)
        current_session_lang = session.get("resolved_lang", "en")

        raw_user_text = (text or "").strip()
        modality_source = "text"

        # -------------------------------------------------------------
        # 1. Image OCR Processing Pipeline (Printed Tesseract vs Handwritten TrOCR/EasyOCR)
        # -------------------------------------------------------------
        if image_bytes and len(image_bytes) > 0:
            modality_source = "image"
            ocr_lang_hint = current_session_lang or site_preference_lang or "en"
            ocr_result = extract_text_from_image(
                image_bytes,
                lang_hint=ocr_lang_hint,
                is_handwritten=is_handwritten
            )
            extracted_ocr_text = ocr_result.get("text", "").strip()
            ocr_conf = ocr_result.get("confidence", 0.0)
            is_low_conf = ocr_result.get("is_low_confidence", True)
            engine_used = ocr_result.get("engine", "tesseract")

            # Log OCR event for iterative model and prompt tuning
            self._log_extraction_event("ocr_image", extracted_ocr_text, ocr_conf, ocr_result)

            # Safety Guard: If OCR is blurry or low confidence, trigger honest, non-frustrating clarification
            if is_low_conf or not extracted_ocr_text:
                resolved_lang = current_session_lang or site_preference_lang or "en"
                if is_handwritten:
                    clarification_msg = (
                        "✍️ **Handwriting Notice:** We couldn't clearly decipher the handwritten text. "
                        "(Note: Handwritten recognition works best for clean English/Latin text; Indic handwriting is best-effort). "
                        "Could you please type your loan requirement or upload a clearer note?"
                    )
                    if resolved_lang == "hi":
                        clarification_msg = (
                            "✍️ **हस्तलिखित नोट सूचना:** हम लिखावट को स्पष्ट रूप से नहीं पढ़ सके। "
                            "(हस्तलिखित पहचान साफ़ लिखावट के लिए बेहतर काम करती है)। "
                            "कृपया अपनी आवश्यकता सीधे टाइप करें या साफ़ फ़ोटो दोबारा अपलोड करें।"
                        )
                else:
                    clarification_msg = (
                        "📷 **Photo Notice:** The image was a bit unclear or blurry to read. "
                        "Could you please retake a clearer photo of your scheme document, or type your loan requirement directly?"
                    )
                    if resolved_lang == "hi":
                        clarification_msg = (
                            "📷 **फ़ोटो सूचना:** अपलोड की गई छवि स्पष्ट नहीं थी। "
                            "कृपया दस्तावेज़ की साफ़ फ़ोटो दोबारा लें, या अपनी आवश्यकता सीधे टाइप करें।"
                        )
                    elif resolved_lang == "bn":
                        clarification_msg = (
                            "📷 **ছবির বিজ্ঞপ্তি:** ছবিটি স্পষ্ট ছিল না। "
                            "দয়া করে পরিষ্কার ছবি তুলুন অথবা সরাসরি টাইপ করুন।"
                        )

                return {
                    "session_id": session_id,
                    "reply": clarification_msg,
                    "reply_en": "The image text was unclear. Please retake or type directly.",
                    "quick_replies": ["Type Loan Need", "Retake Photo", "Restart"],
                    "matched_schemes": session.get("matched_schemes", []),
                    "slots": session.get("slots", {}),
                    "resolved_lang": resolved_lang,
                    "audio_base64": None,
                    "modality": "image",
                    "ocr_confidence": ocr_conf,
                    "ocr_engine": engine_used,
                }

            raw_user_text = extracted_ocr_text

        # -------------------------------------------------------------
        # 2. Audio ASR Processing Pipeline
        # -------------------------------------------------------------
        elif audio_bytes and len(audio_bytes) > 0:
            modality_source = "audio"
            source_asr_lang = source_lang or current_session_lang or "hi"
            transcribed_text = speech_to_text(audio_bytes, source_lang=source_asr_lang)
            if not transcribed_text:
                resolved_lang = current_session_lang or site_preference_lang or "en"
                return {
                    "session_id": session_id,
                    "reply": "🎙️ Could not clearly hear the voice message. Please speak again or type your message.",
                    "reply_en": "Could not clearly hear the voice message. Please speak again or type.",
                    "quick_replies": ["Try Voice Again", "Type Message", "Restart"],
                    "matched_schemes": session.get("matched_schemes", []),
                    "slots": session.get("slots", {}),
                    "resolved_lang": resolved_lang,
                    "audio_base64": None,
                    "modality": "audio",
                }
            raw_user_text = transcribed_text

        # -------------------------------------------------------------
        # 3. Resolve Target Language (Priority 1: Override, Priority 2: Session, etc.)
        # -------------------------------------------------------------
        target_lang = resolve_session_language(
            raw_user_text,
            site_preference=site_preference_lang,
            current_session_lang=current_session_lang,
        )
        session["resolved_lang"] = target_lang

        # -------------------------------------------------------------
        # 4. Pivot Through English: Translate Input to English
        # -------------------------------------------------------------
        if target_lang != "en":
            english_input = translate(raw_user_text, source_lang=target_lang, target_lang="en")
        else:
            english_input = raw_user_text

        # -------------------------------------------------------------
        # 5. Execute Core English State Machine & Rule Engine
        # -------------------------------------------------------------
        dialogue_result = await dialogue_manager.handle_message(session_id, english_input, lang="en")

        english_reply = dialogue_result.get("reply", "")
        english_quick_replies = dialogue_result.get("quick_replies", [])

        # -------------------------------------------------------------
        # 6. Translate Final Response into Citizen's Language
        # -------------------------------------------------------------
        if target_lang != "en":
            translated_reply = translate(english_reply, source_lang="en", target_lang=target_lang)
            translated_quick_replies = [
                translate(qr, source_lang="en", target_lang=target_lang)
                for qr in english_quick_replies
            ]
        else:
            translated_reply = english_reply
            translated_quick_replies = english_quick_replies

        # -------------------------------------------------------------
        # 7. Text-to-Speech (TTS) Synthesis in Voice Mode
        # -------------------------------------------------------------
        audio_b64_output = None
        if voice_mode:
            audio_bytes_out = text_to_speech(translated_reply, target_lang=target_lang)
            if audio_bytes_out:
                audio_b64_output = base64.b64encode(audio_bytes_out).decode("utf-8")

        return {
            "session_id": session_id,
            "reply": translated_reply,
            "reply_en": english_reply,
            "quick_replies": translated_quick_replies,
            "matched_schemes": dialogue_result.get("matched_schemes", []),
            "slots": dialogue_result.get("slots", {}),
            "resolved_lang": target_lang,
            "audio_base64": audio_b64_output,
            "modality": modality_source,
        }

    def _log_extraction_event(self, event_type: str, text: str, conf: float, extra: Dict[str, Any]) -> None:
        """Logs OCR and extraction telemetry for continuous improvement."""
        try:
            with open(LOW_CONF_LOG_PATH, "a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "timestamp": time.time(),
                    "type": event_type,
                    "text": text,
                    "confidence": conf,
                    "extra": extra
                }) + "\n")
        except Exception as e:
            logger.warning("Could not write extraction telemetry: %s", e)


# Global singleton instance
input_handler = MultiModalInputHandler()
