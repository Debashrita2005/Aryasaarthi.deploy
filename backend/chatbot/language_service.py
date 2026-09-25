"""
AryaSaarthi — Ask Arya Bhashini Multilingual Adapter & Language Service
Implements the Pivot-Through-English architecture for 22 Indian languages + English.
Translates all inputs to English before rule engine processing,
and translates English outputs back to the citizen's resolved language.
"""

import os
import re
import json
import logging
from typing import Dict, Any, Optional, Tuple
import requests

try:
    from langdetect import detect as langdetect_detect
    LANGDETECT_AVAILABLE = True
except ImportError:
    LANGDETECT_AVAILABLE = False

from .multilingual import get_language_pack

logger = logging.getLogger("chatbot.language_service")

BHASHINI_API_KEY = os.getenv("BHASHINI_API_KEY", "")
BHASHINI_USER_ID = os.getenv("BHASHINI_USER_ID", "")
BHASHINI_PIPELINE_ID = os.getenv("BHASHINI_PIPELINE_ID", "")
BHASHINI_ULCA_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

# Multilingual Language Overrides Regex Patterns
OVERRIDE_PATTERNS = [
    # English triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:english|angrezi)\b', re.I), 'en'),
    # Hindi triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:hindi|hindustani)\b', re.I), 'hi'),
    (re.compile(r'\b(?:hindi\s+mein\s+(?:bolo|batao|kaho|likho|jawab))\b', re.I), 'hi'),
    (re.compile(r'[\u0900-\u097F]+\s*(?:में\s*बोलो|में\s*बताएं|हिंदी\s*में)', re.I), 'hi'),
    # Bengali triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:bengali|bangla)\b', re.I), 'bn'),
    (re.compile(r'\b(?:bangla\s+te\s+(?:bolo|bolun|kotha))\b', re.I), 'bn'),
    (re.compile(r'[\u0980-\u09FF]+\s*(?:বাংলায়\s*বলুন|বাংলায়\s*লিখুন)', re.I), 'bn'),
    # Tamil triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:tamil|thamizh)\b', re.I), 'ta'),
    (re.compile(r'[\u0B80-\u0BFF]+\s*(?:தமிழில்\s*பேசு|தமிழில்\s*சொல்லு)', re.I), 'ta'),
    # Telugu triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:telugu)\b', re.I), 'te'),
    (re.compile(r'[\u0C00-\u0C7F]+\s*(?:తెలుగులో\s*చెప్పండి)', re.I), 'te'),
    # Marathi triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:marathi)\b', re.I), 'mr'),
    (re.compile(r'[\u0900-\u097F]+\s*(?:मराठीत\s*बोला|मराठीत\s*सांगा)', re.I), 'mr'),
    # Gujarati triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:gujarati)\b', re.I), 'gu'),
    # Punjabi triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:punjabi)\b', re.I), 'pa'),
    # Urdu triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:urdu)\b', re.I), 'ur'),
    # Kannada triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:kannada)\b', re.I), 'kn'),
    # Malayalam triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:malayalam)\b', re.I), 'ml'),
    # Odia triggers
    (re.compile(r'\b(?:talk|reply|speak|answer|write|switch|in)\s+(?:in\s+)?(?:odia|oriya)\b', re.I), 'or'),
]

# Quick offline dictionary mappings for key loan and financial phrases across languages
OFFLINE_PHRASE_DICTIONARY: Dict[str, Dict[str, str]] = {
    "hi": {
        "hello": "नमस्ते",
        "tailoring": "सिलाई / बुटीक",
        "dairy": "डेयरी / पशुपालन",
        "education": "शिक्षा",
        "loan": "ऋण",
        "income": "आय",
        "amount": "राशि",
        "yes": "हाँ",
        "no": "नहीं",
    },
    "bn": {
        "hello": "নমস্কার",
        "tailoring": "দর্জি কাজ",
        "dairy": "দুগ্ধ খামার",
        "education": "শিক্ষা",
        "loan": "ঋণ",
        "income": "আয়",
        "amount": "টাকা",
        "yes": "হ্যাঁ",
        "no": "না",
    },
    "ta": {
        "hello": "வணக்கம்",
        "tailoring": "தையல்",
        "dairy": "பால் பண்ணை",
        "education": "கல்வி",
        "loan": "கடன்",
        "income": "வருமானம்",
        "yes": "ஆம்",
        "no": "இல்லை",
    }
}


def detect_language_override(text: str) -> Optional[str]:
    """
    Detects if the user is explicitly requesting a language change
    (e.g., 'reply in Bengali', 'hindi mein bolo', 'বাংলায় বলুন').
    Checked every turn BEFORE translation.
    """
    if not text:
        return None

    clean_text = text.strip()
    for pattern, lang_code in OVERRIDE_PATTERNS:
        if pattern.search(clean_text):
            return lang_code

    return None


def detect_language(text: str, default_lang: str = "en") -> str:
    """
    Detects language using Unicode script matching, local langdetect, or Bhashini.
    """
    if not text or not text.strip():
        return default_lang

    # 1. Unicode Script based detection (fastest, 100% reliable for Indic scripts)
    for ch in text:
        code = ord(ch)
        if 0x0900 <= code <= 0x097F:
            return "hi"  # Devanagari (Hindi/Marathi)
        elif 0x0980 <= code <= 0x09FF:
            return "bn"  # Bengali / Assamese
        elif 0x0B80 <= code <= 0x0BFF:
            return "ta"  # Tamil
        elif 0x0C00 <= code <= 0x0C7F:
            return "te"  # Telugu
        elif 0x0A80 <= code <= 0x0AFF:
            return "gu"  # Gujarati
        elif 0x0A00 <= code <= 0x0A7F:
            return "pa"  # Punjabi
        elif 0x0C80 <= code <= 0x0CFF:
            return "kn"  # Kannada
        elif 0x0D00 <= code <= 0x0D7F:
            return "ml"  # Malayalam
        elif 0x0B00 <= code <= 0x0B7F:
            return "or"  # Odia

    # 2. Local langdetect library
    if LANGDETECT_AVAILABLE:
        try:
            detected = langdetect_detect(text)
            if detected:
                return detected.lower()
        except Exception:
            pass

    return default_lang


def resolve_session_language(
    user_text: str,
    site_preference: Optional[str] = None,
    current_session_lang: Optional[str] = None
) -> str:
    """
    Resolves target language following strict priority order:
    1. Explicit in-conversation override ("reply in Hindi")
    2. Persisted current session language (if explicitly set previously)
    3. Site-wide user preference
    4. Auto-detected language of current message
    5. Default English
    """
    override = detect_language_override(user_text)
    if override:
        return override

    if current_session_lang and current_session_lang != "en":
        return current_session_lang

    if site_preference and site_preference != "en":
        return site_preference

    detected = detect_language(user_text, default_lang="en")
    if detected and detected != "en":
        return detected

    return current_session_lang or site_preference or "en"


def translate(text: str, source_lang: str = "auto", target_lang: str = "en") -> str:
    """
    Translates text between Indian languages and English using Bhashini NMT.
    Falls back gracefully to original text with localized pack when offline.
    """
    if not text or not text.strip():
        return ""

    if source_lang == "auto":
        source_lang = detect_language(text, default_lang="en")

    if source_lang == target_lang:
        return text

    # Attempt Bhashini NMT API call if credentials present
    if BHASHINI_API_KEY and BHASHINI_ULCA_URL:
        try:
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "translation",
                        "config": {
                            "language": {
                                "sourceLanguage": source_lang,
                                "targetLanguage": target_lang
                            }
                        }
                    }
                ],
                "inputData": {
                    "input": [{"source": text}]
                }
            }
            headers = {
                "Content-Type": "application/json",
                "Authorization": BHASHINI_API_KEY,
                "userId": BHASHINI_USER_ID
            }
            resp = requests.post(BHASHINI_ULCA_URL, json=payload, headers=headers, timeout=2.5)
            if resp.status_code == 200:
                data = resp.json()
                translated_val = data.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("target", "")
                if translated_val:
                    return translated_val
        except Exception as e:
            logger.warning("Bhashini translation exception (%s -> %s): %s", source_lang, target_lang, e)

    # Offline translation fallback:
    # If translating English output to a target Indian language, check localized language packs
    if source_lang == "en" and target_lang in ("hi", "bn", "ta", "te", "mr", "gu"):
        pack = get_language_pack(target_lang)
        if "Great news" in text or "Found" in text:
            # Scheme recommendation response formatting in target language
            return text  # Scheme cards already contain localized headers
        elif "confirm if you or your family" in text.lower():
            return pack.get("greeting", text)
        elif "annual family income" in text.lower():
            return pack.get("income_prompt", text)
        elif "purpose" in text.lower():
            return pack.get("purpose_prompt", text)
        elif "how much loan" in text.lower():
            return pack.get("amount_prompt", text)

    # When translating Indic input into English, pass through clean text for NLU slot extractor
    return text


def speech_to_text(audio_bytes: bytes, source_lang: str = "hi") -> str:
    """
    Transcribes audio bytes into text using Bhashini ASR.
    """
    if not audio_bytes or len(audio_bytes) == 0:
        return ""

    if BHASHINI_API_KEY:
        try:
            import base64
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "asr",
                        "config": {
                            "language": {
                                "sourceLanguage": source_lang
                            }
                        }
                    }
                ],
                "inputData": {
                    "audio": [{"audioContent": audio_b64}]
                }
            }
            headers = {
                "Content-Type": "application/json",
                "Authorization": BHASHINI_API_KEY
            }
            resp = requests.post(BHASHINI_ULCA_URL, json=payload, headers=headers, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json()
                transcription = data.get("pipelineResponse", [{}])[0].get("output", [{}])[0].get("source", "")
                if transcription:
                    return transcription
        except Exception as e:
            logger.warning("Bhashini ASR transcription error: %s", e)

    return ""


def text_to_speech(text: str, target_lang: str = "hi") -> Optional[bytes]:
    """
    Synthesizes speech audio from text using Bhashini TTS.
    """
    if not text or not text.strip() or not BHASHINI_API_KEY:
        return None

    try:
        import base64
        payload = {
            "pipelineTasks": [
                {
                    "taskType": "tts",
                    "config": {
                        "language": {
                            "sourceLanguage": target_lang
                        },
                        "gender": "female"
                    }
                }
            ],
            "inputData": {
                "input": [{"source": text[:250]}]  # Cap first 250 chars for instant playback
            }
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": BHASHINI_API_KEY
        }
        resp = requests.post(BHASHINI_ULCA_URL, json=payload, headers=headers, timeout=3.5)
        if resp.status_code == 200:
            data = resp.json()
            audio_b64 = data.get("pipelineResponse", [{}])[0].get("audio", [{}])[0].get("audioContent", "")
            if audio_b64:
                return base64.b64decode(audio_b64)
    except Exception as e:
        logger.warning("Bhashini TTS synthesis error: %s", e)

    return None
