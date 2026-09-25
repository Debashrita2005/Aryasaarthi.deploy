"""
AryaSaarthi — Ask Arya Multi-Script OCR & Image Preprocessing Engine
Extracts text from user-uploaded images, photos of documents, handwritten notes, and flyers.
Uses OpenCV for image preprocessing (deskew, contrast enhancement, noise removal)
and multi-script Tesseract OCR with word-level confidence computation.
"""

import io
import logging
import re
from typing import Dict, Any, Tuple, Optional
import numpy as np
from PIL import Image

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

logger = logging.getLogger("chatbot.ocr")

# Minimum OCR confidence threshold to qualify as reliable text (scale 0-100)
MIN_OCR_CONFIDENCE_THRESHOLD = 45.0
MIN_OCR_BENGALI_CONFIDENCE_THRESHOLD = 25.0
MIN_EXTRACTED_CHARACTERS = 3

LANG_TO_TESSERACT = {
    "bn": "ben", "ben": "ben", "bengali": "ben",
    "hi": "hin", "hin": "hin", "hindi": "hin",
    "ta": "tam", "tam": "tam", "tamil": "tam",
    "te": "tel", "tel": "tel", "telugu": "tel",
    "mr": "mar", "mar": "mar", "marathi": "mar",
    "gu": "guj", "guj": "guj", "gujarati": "guj",
    "pa": "pan", "pan": "pan", "punjabi": "pan",
    "kn": "kan", "kan": "kan", "kannada": "kan",
    "ml": "mal", "mal": "mal", "malayalam": "mal",
    "or": "ori", "ori": "ori", "odia": "ori",
    "en": "eng", "eng": "eng", "english": "eng",
}


def validate_tesseract_languages(required_langs: Optional[list] = None) -> Dict[str, Any]:
    """
    Validates installed Tesseract language packs at app boot / startup.
    Fails loudly with clear diagnostics if claimed languages are missing.
    """
    if required_langs is None:
        required_langs = ["eng", "hin", "ben"]

    if not TESSERACT_AVAILABLE:
        msg = "Tesseract OCR binary or pytesseract library is NOT installed. Falling back to EasyOCR."
        logger.warning(msg)
        return {
            "tesseract_installed": False,
            "installed_languages": [],
            "missing_languages": required_langs,
            "status": "fallback_to_easyocr",
            "message": msg,
        }

    try:
        installed = pytesseract.get_languages()
        missing = [l for l in required_langs if l not in installed]
        if missing:
            msg = (
                f"CRITICAL OCR WARNING: Tesseract is missing language packs: {missing}. "
                f"Installed: {installed}. Bengali/Indic OCR will use EasyOCR deep learning fallback."
            )
            logger.warning(msg)
        else:
            msg = f"Tesseract language pack validation passed. Available: {installed}"
            logger.info(msg)
        return {
            "tesseract_installed": True,
            "installed_languages": installed,
            "missing_languages": missing,
            "status": "ok" if not missing else "partial_missing",
            "message": msg,
        }
    except Exception as e:
        msg = f"Could not query Tesseract languages: {e}"
        logger.warning(msg)
        return {
            "tesseract_installed": False,
            "installed_languages": [],
            "missing_languages": required_langs,
            "status": "error",
            "message": msg,
        }


def preprocess_image_bytes(image_bytes: bytes) -> Image.Image:
    """
    Applies OpenCV preprocessing pipeline to clean image before OCR:
    1. Decode from bytes
    2. Convert to grayscale
    3. Remove noise via bilateral filtering / median blur
    4. Contrast enhancement using adaptive thresholding / CLAHE
    5. Deskewing to correct orientation angle
    """
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        logger.warning("Failed to open image via PIL: %s", e)
        return Image.new("RGB", (100, 100), color="white")

    if not CV2_AVAILABLE:
        return pil_img

    try:
        # Convert PIL to OpenCV BGR array
        open_cv_image = np.array(pil_img)
        open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2BGR)

        # 1. Grayscale
        gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)

        # 2. Rescale if too small for OCR (minimum height 600px)
        h, w = gray.shape[:2]
        if h < 600 or w < 600:
            scale_factor = max(600.0 / h, 600.0 / w)
            gray = cv2.resize(gray, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)

        # 3. Contrast Limited Adaptive Histogram Equalization (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        contrast_enhanced = clahe.apply(gray)

        # 4. Bilateral filter to smooth texture while keeping sharp text edges
        denoised = cv2.bilateralFilter(contrast_enhanced, 9, 75, 75)

        # 5. Deskew detection
        coords = np.column_stack(np.where(denoised < 128))
        if coords.size > 0:
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            if abs(angle) > 0.5 and abs(angle) < 45.0:
                (h, w) = denoised.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                denoised = cv2.warpAffine(denoised, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

        # Convert back to PIL Image
        return Image.fromarray(denoised)
    except Exception as e:
        logger.warning("OpenCV preprocessing encountered error, using raw image: %s", e)
        return pil_img


def extract_text_from_image(
    image_bytes: bytes,
    lang_hint: Optional[str] = None,
    is_handwritten: bool = False
) -> Dict[str, Any]:
    """
    Extracts text from image bytes with intelligent printed vs. handwritten routing.
    - Printed text -> Multi-script Tesseract OCR engine (Devanagari, Bengali, Tamil, etc.)
    - English/Latin handwriting -> Microsoft TrOCR Transformer model
    - Indic handwriting -> EasyOCR multi-script model
    Returns:
        {
            "text": str,
            "confidence": float (0.0 to 1.0),
            "is_low_confidence": bool,
            "script_detected": str,
            "word_count": int,
            "engine": str
        }
    """
    if not image_bytes or len(image_bytes) == 0:
        return {
            "text": "",
            "confidence": 0.0,
            "is_low_confidence": True,
            "script_detected": "none",
            "word_count": 0,
            "engine": "none"
        }

    processed_pil_img = preprocess_image_bytes(image_bytes)
    normalized_lang_hint = (lang_hint or "en").lower().strip()

    # -------------------------------------------------------------
    # 1. Handwritten OCR Route (TrOCR for Latin, EasyOCR for Indic)
    # -------------------------------------------------------------
    if is_handwritten:
        try:
            from .ocr_handwritten import (
                extract_handwritten_text,
                TROCR_MIN_CONFIDENCE,
                EASYOCR_MIN_CONFIDENCE,
                EASYOCR_BENGALI_MIN_CONFIDENCE,
            )

            is_indic_hint = normalized_lang_hint in ["hi", "bn", "ta", "te", "mr", "kn", "gu", "pa", "or", "ml"]
            hw_text, hw_conf, engine_used = extract_handwritten_text(
                processed_pil_img,
                lang_hint=normalized_lang_hint,
                is_indic=is_indic_hint
            )

            if not hw_text or len(hw_text.strip()) < 3:
                return {
                    "text": "",
                    "confidence": 0.0,
                    "is_low_confidence": True,
                    "script_detected": "none",
                    "word_count": 0,
                    "engine": engine_used,
                    "is_handwritten": True
                }

            if engine_used == "easyocr":
                min_thresh = EASYOCR_BENGALI_MIN_CONFIDENCE if normalized_lang_hint in ["bn", "ben"] else EASYOCR_MIN_CONFIDENCE
            else:
                min_thresh = TROCR_MIN_CONFIDENCE

            is_low = hw_conf < min_thresh or len(hw_text.strip()) < 3

            # Apply numeral normalization on extracted text
            try:
                from .nlu import normalize_indic_text
                hw_text = normalize_indic_text(hw_text)
            except Exception:
                pass

            return {
                "text": hw_text.strip(),
                "confidence": hw_conf,
                "is_low_confidence": is_low,
                "script_detected": detect_script(hw_text),
                "word_count": len(hw_text.strip().split()),
                "engine": engine_used,
                "is_handwritten": True
            }
        except Exception as e:
            logger.warning("Handwritten OCR engine error, trying Tesseract/EasyOCR fallback: %s", e)

    # -------------------------------------------------------------
    # 2. Printed Multi-Script OCR Route (Tesseract with Language Pack Check)
    # -------------------------------------------------------------
    if TESSERACT_AVAILABLE:
        try:
            available_tess = []
            try:
                available_tess = pytesseract.get_languages()
            except Exception:
                pass

            tess_hint = LANG_TO_TESSERACT.get(normalized_lang_hint, "eng")
            
            # If the user specifically wants Bengali or another regional language,
            # verify that Tesseract actually has its traineddata installed before querying
            if tess_hint != "eng" and tess_hint not in available_tess:
                logger.info(
                    "Tesseract language '%s' is not installed in %s. Routing directly to EasyOCR for high accuracy.",
                    tess_hint, available_tess
                )
            else:
                # Build target language list with available languages only
                target_langs = [tess_hint] if tess_hint in available_tess else []
                if "eng" in available_tess and "eng" not in target_langs:
                    target_langs.append("eng")
                
                tess_lang_param = "+".join(target_langs) if target_langs else "eng"
                
                # Get verbose data with confidence scores
                data = pytesseract.image_to_data(
                    processed_pil_img,
                    lang=tess_lang_param,
                    output_type=pytesseract.Output.DICT,
                    config="--psm 3 --oem 3"
                )

                words = []
                confidences = []

                for i in range(len(data.get("text", []))):
                    word = str(data["text"][i]).strip()
                    conf = float(data["conf"][i]) if data["conf"][i] != "-1" else -1.0

                    if word and conf >= 0:
                        words.append(word)
                        confidences.append(conf)

                extracted_text = " ".join(words).strip()
                avg_confidence = float(np.mean(confidences)) if confidences else 0.0
                normalized_conf = round(avg_confidence / 100.0, 3)

                cutoff = MIN_OCR_BENGALI_CONFIDENCE_THRESHOLD if tess_hint == "ben" else MIN_OCR_CONFIDENCE_THRESHOLD
                is_low = (
                    avg_confidence < cutoff or
                    len(extracted_text) < MIN_EXTRACTED_CHARACTERS or
                    len(words) == 0
                )

                if not is_low:
                    try:
                        from .nlu import normalize_indic_text
                        extracted_text = normalize_indic_text(extracted_text)
                    except Exception:
                        pass

                    return {
                        "text": extracted_text,
                        "confidence": normalized_conf,
                        "is_low_confidence": False,
                        "script_detected": detect_script(extracted_text),
                        "word_count": len(words),
                        "engine": "tesseract",
                        "is_handwritten": False
                    }
        except Exception as e:
            logger.warning("pytesseract execution error: %s", e)

    # -------------------------------------------------------------
    # 3. EasyOCR Deep Learning Fallback (English, Hindi, Bengali)
    # -------------------------------------------------------------
    try:
        from .ocr_handwritten import get_easyocr_reader
        target_easy_langs = ["en", "bn"] if normalized_lang_hint in ["bn", "ben", "bengali"] else ["en", "hi"]
        reader = get_easyocr_reader(target_easy_langs)
        if reader:
            img_np = np.array(processed_pil_img)
            results = reader.readtext(img_np)
            if results and len(results) > 0:
                words = []
                confs = []
                for res in results:
                    if len(res) >= 3:
                        text_seg, conf = res[1], float(res[2])
                    elif len(res) >= 2:
                        text_seg, conf = res[1], 0.75
                    else:
                        continue
                    if text_seg and len(text_seg.strip()) > 0:
                        words.append(text_seg.strip())
                        confs.append(conf)
                
                full_text = " ".join(words).strip()
                avg_conf = float(np.mean(confs)) if confs else 0.0
                cutoff_conf = 0.22 if normalized_lang_hint in ["bn", "ben"] else 0.25
                is_low = avg_conf < cutoff_conf or len(full_text) < MIN_EXTRACTED_CHARACTERS
                if full_text and len(full_text) >= 2:
                    try:
                        from .nlu import normalize_indic_text
                        full_text = normalize_indic_text(full_text)
                    except Exception:
                        pass

                    return {
                        "text": full_text,
                        "confidence": round(avg_conf, 3),
                        "is_low_confidence": is_low,
                        "script_detected": detect_script(full_text),
                        "word_count": len(words),
                        "engine": "easyocr",
                        "is_handwritten": False
                    }
    except Exception as easy_err:
        logger.warning("EasyOCR printed text fallback error: %s", easy_err)

    return _fallback_image_analysis(processed_pil_img, is_handwritten=is_handwritten)


def detect_script(text: str) -> str:
    """Detects Unicode script from extracted text."""
    if not text:
        return "none"
    
    script_counts = {
        "Devanagari": 0,
        "Bengali": 0,
        "Tamil": 0,
        "Telugu": 0,
        "Gujarati": 0,
        "Gurmukhi": 0,
        "Kannada": 0,
        "Malayalam": 0,
        "Odia": 0,
        "Latin": 0
    }

    for ch in text:
        code = ord(ch)
        if 0x0900 <= code <= 0x097F:
            script_counts["Devanagari"] += 1
        elif 0x0980 <= code <= 0x09FF:
            script_counts["Bengali"] += 1
        elif 0x0B80 <= code <= 0x0BFF:
            script_counts["Tamil"] += 1
        elif 0x0C00 <= code <= 0x0C7F:
            script_counts["Telugu"] += 1
        elif 0x0A80 <= code <= 0x0AFF:
            script_counts["Gujarati"] += 1
        elif 0x0A00 <= code <= 0x0A7F:
            script_counts["Gurmukhi"] += 1
        elif 0x0C80 <= code <= 0x0CFF:
            script_counts["Kannada"] += 1
        elif 0x0D00 <= code <= 0x0D7F:
            script_counts["Malayalam"] += 1
        elif 0x0B00 <= code <= 0x0B7F:
            script_counts["Odia"] += 1
        elif (0x0041 <= code <= 0x005A) or (0x0061 <= code <= 0x007A):
            script_counts["Latin"] += 1

    top_script = max(script_counts.items(), key=lambda x: x[1])
    return top_script[0] if top_script[1] > 0 else "Latin"


def _fallback_image_analysis(img: Image.Image, is_handwritten: bool = False) -> Dict[str, Any]:
    """Fallback handler when primary OCR engines encounter error or are not installed."""
    w, h = img.size
    # Check if image has minimal dimensions and variance
    if w < 50 or h < 50:
        return {
            "text": "",
            "confidence": 0.0,
            "is_low_confidence": True,
            "script_detected": "none",
            "word_count": 0,
            "engine": "fallback",
            "is_handwritten": is_handwritten
        }

    # Return low confidence flag so input_handler asks user politely for clarification/typing
    return {
        "text": "",
        "confidence": 0.1,
        "is_low_confidence": True,
        "script_detected": "none",
        "word_count": 0,
        "engine": "fallback",
        "is_handwritten": is_handwritten
    }
