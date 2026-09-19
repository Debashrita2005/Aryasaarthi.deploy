"""
AryaSaarthi — NLU Layer 3: Semantic Similarity Matcher
Uses local SentenceTransformer ('all-MiniLM-L6-v2') cached locally.
Zero network calls at inference.
Includes graceful fallback if model is still downloading, offline, or unavailable.
"""

import os
import time
import logging
from typing import List, Optional

try:
    from config import settings
except ImportError:
    class DummySettings:
        SIMILARITY_THRESHOLD = 0.45
        SIMILARITY_BOUNDARY_DELTA = 0.05
        SIMILARITY_LOG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "near_boundary_scores.log")
    settings = DummySettings()

logger = logging.getLogger("chatbot.similarity")

# Module-level singleton
_model = None
_model_failed = False
_model_load_attempted = False

def log_near_boundary_score(user_text: str, candidate: str, score: float, threshold: float):
    """
    Logs near-boundary similarity scores (e.g. within ±0.05 of threshold) to a log file for offline tuning.
    """
    try:
        log_path = getattr(settings, "SIMILARITY_LOG_PATH", "near_boundary_scores.log")
        log_dir = os.path.dirname(log_path)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)

        diff = score - threshold
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        entry = (
            f"[{timestamp}] text=\"{user_text}\" candidate=\"{candidate}\" "
            f"score={score:.4f} threshold={threshold:.4f} diff={diff:+.4f}\n"
        )
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(entry)
    except Exception as e:
        logger.debug("Failed to write to near_boundary_scores.log: %s", e)

def get_sentence_transformer():
    """Loads SentenceTransformer model once at startup or on first call (module-level singleton)."""
    global _model, _model_failed, _model_load_attempted
    if _model is not None:
        return _model
    if _model_failed:
        return None

    _model_load_attempted = True
    try:
        from sentence_transformers import SentenceTransformer
        logger.info("Loading sentence-transformers 'all-MiniLM-L6-v2'...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("SentenceTransformer 'all-MiniLM-L6-v2' loaded successfully.")
        return _model
    except Exception as e:
        logger.warning(
            "SentenceTransformer failed to load (%s). Gracefully falling back to keyword/token matching.", e
        )
        _model_failed = True
        return None

def is_sentence_transformer_loaded() -> bool:
    """Returns True if the SentenceTransformer model is currently loaded in memory."""
    return _model is not None

def is_sentence_transformer_failed() -> bool:
    """Returns True if the SentenceTransformer model load was attempted and failed."""
    return _model_failed

# Semantic keyword synonym dictionary for fallback
SYNONYMS: dict[str, list[str]] = {
    "tailoring": ["tailor", "tailoring", "boutique", "stitching", "cloth", "garment", "dress", "sewing"],
    "beauty_parlor": ["beauty", "parlor", "parlour", "salon", "cosmetics", "makeup"],
    "dairy": ["dairy", "cow", "buffalo", "milk", "cattle", "ghee", "livestock", "animal husbandry"],
    "grocery": ["grocery", "kirana", "shop", "retail", "general store", "provisions"],
    "higher_education": ["college", "university", "btech", "mbbs", "degree", "higher studies", "education", "study"],
    "vocational": ["vocational", "diploma", "iti", "polytechnic", "skill", "training"],
    "transport": ["auto", "rickshaw", "car", "taxi", "vehicle", "driver", "transport", "e-rickshaw", "tempo"],
    "electric_rickshaw": ["electric auto", "e-rickshaw", "battery auto", "electric rickshaw"],
    "solar_installation": ["solar", "rooftop solar", "green energy", "solar panel"],
    "manufacturing": ["manufacturing", "factory", "workshop", "production", "making"],
    "handicrafts": ["handicraft", "pottery", "weaving", "handloom", "artisan"],
    "poultry": ["poultry", "chicken", "broiler", "egg", "bird farming"],
    "goat_farming": ["goat", "bakri", "sheep", "goat farming"]
}

def _fallback_similarity_match(
    user_text: str, 
    eligible_labels: List[str], 
    threshold: Optional[float] = None
) -> Optional[str]:
    """Token & Jaccard / Synonym semantic fallback if SentenceTransformer is unavailable."""
    if threshold is None:
        threshold = getattr(settings, "SIMILARITY_THRESHOLD", 0.45)
    delta = getattr(settings, "SIMILARITY_BOUNDARY_DELTA", 0.05)

    text_lower = user_text.lower()
    best_label = None
    best_score = 0.0

    for label in eligible_labels:
        # Check direct substring
        if label.lower().replace("_", " ") in text_lower:
            return label

        # Check synonyms
        syns = SYNONYMS.get(label, [label.replace("_", " ")])
        matches = sum(1 for s in syns if s in text_lower)
        score = matches / max(1, len(syns))

        # Direct token match
        tokens = set(label.replace("_", " ").split())
        user_tokens = set(text_lower.split())
        overlap = len(tokens.intersection(user_tokens)) / max(1, len(tokens))
        total_score = max(score, overlap)

        if total_score > best_score:
            best_score = total_score
            best_label = label

    # Try rapidfuzz if available
    try:
        from rapidfuzz import fuzz
        for label in eligible_labels:
            readable = label.replace("_", " ")
            ratio = fuzz.partial_ratio(readable, text_lower) / 100.0
            if ratio > best_score:
                best_score = ratio
                best_label = label
    except ImportError:
        pass

    # Boundary logging check
    if best_label and abs(best_score - threshold) <= delta:
        log_near_boundary_score(user_text, best_label, best_score, threshold)

    if best_score >= threshold and best_label:
        return best_label

    return None

def match_project_type(
    user_text: str, 
    eligible_labels: List[str], 
    threshold: Optional[float] = None
) -> Optional[str]:
    """
    Computes cosine similarity between user_text and eligible_labels using SentenceTransformer.
    Uses configurable threshold and logs near-boundary scores within ±0.05 of threshold.
    Falls back gracefully if the neural model is not yet cached or offline.
    """
    if not user_text or not eligible_labels:
        return None

    if threshold is None:
        threshold = getattr(settings, "SIMILARITY_THRESHOLD", 0.45)
    delta = getattr(settings, "SIMILARITY_BOUNDARY_DELTA", 0.05)

    model = get_sentence_transformer()
    if model is not None:
        try:
            from sentence_transformers import util
            user_emb = model.encode(user_text, convert_to_tensor=True)
            label_embs = model.encode(eligible_labels, convert_to_tensor=True)
            scores = util.cos_sim(user_emb, label_embs)[0]
            best_idx = int(scores.argmax())
            best_score = float(scores[best_idx])
            best_label = eligible_labels[best_idx]

            # Log near-boundary scores for offline tuning
            if abs(best_score - threshold) <= delta:
                log_near_boundary_score(user_text, best_label, best_score, threshold)

            if best_score >= threshold:
                return best_label
            return None
        except Exception as e:
            logger.warning("Neural similarity failed (%s). Falling back.", e)

    # Fallback path
    return _fallback_similarity_match(user_text, eligible_labels, threshold=threshold)
