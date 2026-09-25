"""
AryaSaarthi ML Module — Unified Clean Python Interface
Exposes clean, API-independent functions consumed by the FastAPI backend:
- predict_intent(text)
- extract_profile(text)
- retrieve_schemes(text, top_k)
- recommend_schemes(profile)
- evaluate_eligibility(profile, scheme)
"""

from .predict import predict_intent, load_models, HIGH_CONFIDENCE, LOW_CONFIDENCE
from .entity_extractor import extract_profile
from .knowledge_retriever import retrieve_schemes, load_schemes_knowledge
from .recommendation_engine import recommend_schemes, compute_match_breakdown
from .eligibility_engine import evaluate_eligibility
from .preprocess import clean_text


__all__ = [
    "predict_intent",
    "extract_profile",
    "retrieve_schemes",
    "recommend_schemes",
    "evaluate_eligibility",
    "load_models",
    "load_schemes_knowledge",
    "compute_match_breakdown",
    "clean_text",
    "HIGH_CONFIDENCE",
    "LOW_CONFIDENCE",
]
