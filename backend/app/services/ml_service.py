"""
AryaSaarthi Backend Service — ML Service
Loads and caches local ML models, intent classifier, and knowledge retriever.
Operates 100% offline without external LLM inference APIs.
"""

import logging
from typing import Dict, Any, List, Optional
from ml import (
    predict_intent as ml_predict_intent,
    extract_profile as ml_extract_profile,
    retrieve_schemes as ml_retrieve_schemes,
    recommend_schemes as ml_recommend_schemes,
    evaluate_eligibility as ml_evaluate_eligibility,
    load_models as ml_load_models
)


logger = logging.getLogger("backend.services.ml")


class MLService:
    _instance = None
    _is_loaded = False

    @classmethod
    def get_instance(cls) -> "MLService":
        if cls._instance is None:
            cls._instance = MLService()
        return cls._instance

    def initialize(self):
        """Preloads vectorizer and classifier once at application boot."""
        if not self._is_loaded:
            logger.info("Initializing AryaSaarthi local ML models...")
            ml_load_models()
            self._is_loaded = True
            logger.info("AryaSaarthi ML models loaded successfully.")

    def is_healthy(self) -> bool:
        return self._is_loaded

    def predict_intent(self, text: str) -> Dict[str, Any]:
        """Classifies citizen query intent and calibrated confidence."""
        return ml_predict_intent(text)

    def extract_profile(self, text: str) -> Dict[str, Any]:
        """Extracts structured citizen profile attributes deterministically."""
        return ml_extract_profile(text)

    def retrieve_schemes(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Semantic knowledge retrieval over verified schemes database."""
        return ml_retrieve_schemes(query, top_k=top_k)

    def recommend_schemes(self, profile: Dict[str, Any], schemes: Optional[List[Dict[str, Any]]] = None, top_k: int = 5) -> List[Dict[str, Any]]:
        """Multi-factor transparent scheme ranking and scoring."""
        return ml_recommend_schemes(profile, schemes=schemes, top_k=top_k)

    def evaluate_eligibility(self, profile: Dict[str, Any], scheme: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based statutory condition evaluation."""
        return ml_evaluate_eligibility(profile, scheme)


ml_service = MLService.get_instance()
