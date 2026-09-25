"""
AryaSaarthi ML Pipeline — Intent Inference & Confidence Estimation
Implements calibrated confidence scoring with three-tier thresholds:
- Confident: confidence >= 0.70
- Cautious / Clarification: 0.50 <= confidence < 0.70
- Unknown / Rephrase: confidence < 0.50
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional
import joblib
import numpy as np

from .preprocess import clean_text


ROOT_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT_DIR / "models"
VEC_PATH = MODELS_DIR / "tfidf_vectorizer.pkl"
CLF_PATH = MODELS_DIR / "intent_classifier.pkl"

HIGH_CONFIDENCE = 0.70
LOW_CONFIDENCE = 0.50

# Lazy global model singletons
_vectorizer = None
_classifier = None


def load_models():
    """Loads vectorizer and classifier once into memory."""
    global _vectorizer, _classifier
    if _vectorizer is None or _classifier is None:
        if not VEC_PATH.exists() or not CLF_PATH.exists():
            # If not yet trained, trigger training
            from .train_intent_model import train
            train()

        _vectorizer = joblib.load(VEC_PATH)
        _classifier = joblib.load(CLF_PATH)
    return _vectorizer, _classifier


def predict_intent(text: str) -> Dict[str, Any]:
    """
    Predicts intent and calibrated confidence from user text.
    Returns:
    {
        "intent": str,
        "confidence": float,
        "status": "confident" | "cautious" | "uncertain",
        "raw_intent": str
    }
    """
    if not text or not text.strip():
        return {
            "intent": "unknown",
            "confidence": 0.0,
            "status": "uncertain",
            "raw_intent": "unknown"
        }

    cleaned = clean_text(text)
    if not cleaned:
        return {
            "intent": "unknown",
            "confidence": 0.0,
            "status": "uncertain",
            "raw_intent": "unknown"
        }

    vec, clf = load_models()
    X = vec.transform([cleaned])

    # Check for empty vector (out of vocabulary / zero matches)
    if X.nnz == 0:
        return {
            "intent": "unknown",
            "confidence": 0.0,
            "status": "uncertain",
            "raw_intent": "unknown"
        }

    # Multi-class calibrated probability estimation via temperature scaling on logits
    try:
        dec = clf.decision_function(X)[0]
        # Temperature T = 0.28 calibrates logits across 21 classes
        t_scaled = dec / 0.28
        exp_vals = np.exp(t_scaled - np.max(t_scaled))
        probs = exp_vals / np.sum(exp_vals)
    except Exception:
        probs = clf.predict_proba(X)[0]

    best_idx = int(np.argmax(probs))
    raw_intent = clf.classes_[best_idx]
    confidence = float(probs[best_idx])

    # Calibrated confidence gate
    if confidence >= HIGH_CONFIDENCE:
        status = "confident"
        intent = raw_intent
    elif confidence >= LOW_CONFIDENCE:
        status = "cautious"
        intent = raw_intent
    else:
        status = "uncertain"
        intent = "unknown"

    return {
        "intent": intent,
        "confidence": round(confidence, 4),
        "status": status,
        "raw_intent": raw_intent
    }
