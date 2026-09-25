"""
AryaSaarthi — Ask Arya Transformer-Based Handwritten OCR Engine
Specialized in deciphering handwritten notes, applications, scheme pamphlets, and forms.
Uses Microsoft TrOCR (VisionEncoderDecoder Transformer) for English handwriting and
EasyOCR for Indic-script handwriting.
Zero paid APIs — runs 100% locally.
"""

import logging
import os
from typing import Tuple, Optional, Dict, Any
from PIL import Image

logger = logging.getLogger("chatbot.ocr_handwritten")

# Global lazy singletons
_trocr_processor = None
_trocr_model = None
_easyocr_reader_cache: Dict[str, Any] = {}

# Calibrated confidence cutoff for TrOCR token probabilities (0.0 to 1.0)
TROCR_MIN_CONFIDENCE = 0.52
EASYOCR_MIN_CONFIDENCE = 0.40
EASYOCR_BENGALI_MIN_CONFIDENCE = 0.28
EASYOCR_INDIC_MIN_CONFIDENCE = 0.30

# Model identifier
DEFAULT_TROCR_MODEL = os.getenv("TROCR_MODEL_NAME", "microsoft/trocr-small-handwritten")


def get_trocr():
    """Lazily initializes and caches TrOCR model & processor."""
    global _trocr_processor, _trocr_model
    if _trocr_processor is None or _trocr_model is None:
        try:
            import torch
            from transformers import TrOCRProcessor, VisionEncoderDecoderModel

            logger.info("Loading TrOCR model (%s)...", DEFAULT_TROCR_MODEL)
            processor = TrOCRProcessor.from_pretrained(DEFAULT_TROCR_MODEL)
            model = VisionEncoderDecoderModel.from_pretrained(DEFAULT_TROCR_MODEL)

            # Move to available accelerator (MPS for Apple Silicon, CUDA, or CPU)
            device = "cpu"
            if torch.cuda.is_available():
                device = "cuda"
            elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                device = "mps"

            model = model.to(device)
            model.eval()

            _trocr_processor = processor
            _trocr_model = model
            logger.info("TrOCR loaded successfully on %s", device)
        except Exception as e:
            logger.warning("Failed to initialize TrOCR model (%s): %s", DEFAULT_TROCR_MODEL, e)
            return None, None

    return _trocr_processor, _trocr_model


def get_easyocr_reader(languages: Optional[list] = None):
    """Lazily initializes EasyOCR reader for specified language group."""
    global _easyocr_reader_cache
    if languages is None:
        languages = ["en", "hi"]
    elif "bn" in languages and "hi" in languages:
        # EasyOCR cannot mix Bengali and Hindi in the same reader
        languages = ["en", "bn"] if languages[0] == "bn" else ["en", "hi"]

    key = "+".join(sorted(languages))
    if key not in _easyocr_reader_cache:
        try:
            import easyocr
            logger.info("Initializing EasyOCR reader for languages: %s", languages)
            reader = easyocr.Reader(languages, gpu=False)
            _easyocr_reader_cache[key] = reader
        except Exception as e:
            logger.warning("Failed to initialize EasyOCR reader: %s", e)
            return None
    return _easyocr_reader_cache.get(key)


def compute_confidence_from_scores(generated_ids, sequences, processor) -> float:
    """
    Derives token-probability-based confidence proxy from generation logits.
    Returns a score between 0.0 and 1.0.
    """
    try:
        import torch
        if not hasattr(generated_ids, "scores") or not generated_ids.scores:
            return 0.70

        scores = generated_ids.scores  # tuple of length sequence_length
        seq = sequences[0]  # tensor of token IDs

        token_probs = []
        # generated_ids.sequences includes decoder_start_token_id as first token
        for step_idx, step_logits in enumerate(scores):
            if step_idx + 1 < len(seq):
                target_token_id = seq[step_idx + 1].item()
                probs = torch.softmax(step_logits[0], dim=-1)
                prob = probs[target_token_id].item()
                token_probs.append(prob)

        if not token_probs:
            return 0.50

        # Harmonic/Arithmetic mean of generated token probabilities
        mean_prob = sum(token_probs) / len(token_probs)
        return round(float(mean_prob), 3)
    except Exception as e:
        logger.debug("Error computing TrOCR confidence: %s", e)
        return 0.65


def extract_handwritten_trocr(image: Image.Image) -> Tuple[str, float]:
    """
    Extracts handwritten English/Latin text from PIL Image using TrOCR.
    Returns: (extracted_text, confidence_score_0_to_1)
    """
    processor, model = get_trocr()
    if processor is None or model is None:
        return "", 0.0

    try:
        import torch
        rgb_img = image.convert("RGB")
        pixel_values = processor(images=rgb_img, return_tensors="pt").pixel_values

        device = next(model.parameters()).device
        pixel_values = pixel_values.to(device)

        with torch.no_grad():
            generated_ids = model.generate(
                pixel_values,
                output_scores=True,
                return_dict_in_generate=True,
                max_new_tokens=128
            )

        extracted_text = processor.batch_decode(
            generated_ids.sequences,
            skip_special_tokens=True
        )[0].strip()

        if not extracted_text:
            return "", 0.0

        confidence = compute_confidence_from_scores(
            generated_ids,
            generated_ids.sequences,
            processor
        )

        return extracted_text, confidence
    except Exception as e:
        logger.warning("TrOCR handwritten extraction error: %s", e)
        return "", 0.0


def extract_handwritten_easyocr(image: Image.Image, lang: str = "hi") -> Tuple[str, float]:
    """
    Extracts handwritten text using EasyOCR (supporting Indic scripts like Hindi).
    Returns: (extracted_text, confidence_score_0_to_1)
    """
    lang_map = {
        "hi": ["en", "hi"],
        "mr": ["en", "mr", "hi"],
        "bn": ["en", "bn"],
        "ta": ["en", "ta"],
        "te": ["en", "te"],
        "kn": ["en", "kn"],
        "en": ["en"],
    }
    target_langs = lang_map.get(lang, ["en", "hi"])
    reader = get_easyocr_reader(target_langs)

    if reader is None:
        return "", 0.0

    try:
        import numpy as np
        rgb_img = image.convert("RGB")
        img_np = np.array(rgb_img)

        results = reader.readtext(img_np)
        if not results:
            return "", 0.0

        texts = []
        confs = []
        for (bbox, text, conf) in results:
            if text and text.strip():
                texts.append(text.strip())
                confs.append(float(conf))

        extracted_text = " ".join(texts).strip()
        avg_conf = (sum(confs) / len(confs)) if confs else 0.0
        return extracted_text, round(avg_conf, 3)
    except Exception as e:
        logger.warning("EasyOCR extraction error: %s", e)
        return "", 0.0


def extract_handwritten_text(
    image: Image.Image,
    lang_hint: Optional[str] = "en",
    is_indic: bool = False
) -> Tuple[str, float, str]:
    """
    Unified router for handwritten text recognition:
    1. If English/Latin handwriting -> TrOCR (Transformer SOTA)
    2. If Bengali/Indic handwriting -> EasyOCR (TrOCR is English-only)
    Returns: (text, confidence, engine_name)
    """
    lang = (lang_hint or "en").lower()
    is_bengali = lang in ["bn", "ben", "bengali"]

    # Bengali/Indic handwriting MUST NEVER route to TrOCR (TrOCR is English-only)
    if is_bengali or is_indic or lang in ["hi", "mr", "ta", "te", "kn", "gu", "pa", "or", "ml"]:
        target_lang = "bn" if is_bengali else lang
        text, conf = extract_handwritten_easyocr(image, target_lang)
        if text:
            try:
                from .nlu import normalize_indic_text
                text = normalize_indic_text(text)
            except Exception:
                pass
            return text, conf, "easyocr"
        return "", 0.0, "indic_easyocr"

    # Default Latin / English handwriting route
    text, conf = extract_handwritten_trocr(image)
    if text:
        return text, conf, "trocr"

    # Fallback to EasyOCR if TrOCR returned empty
    text, conf = extract_handwritten_easyocr(image, "en")
    if text:
        return text, conf, "easyocr"
    return "", 0.0, "trocr_fallback"
