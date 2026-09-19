import os

class Settings:
    PROJECT_NAME: str = "Sahayak NSFDC & NDFDC Python Rule Engine"
    VERSION: str = "2026.09.2-live"
    API_PREFIX: str = "/api"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/sahayak_nsfdc")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "sahayak_nsfdc")
    
    # Official statutory ceilings
    NSFDC_INCOME_CEILING: int = 300000  # ₹3,00,000 for NSFDC credit schemes
    GENERAL_INCOME_CEILING: int = 500000 # ₹5,00,000 general/state ceiling
    MIN_LEGAL_AGE: int = 18

    # 1. NLU / Semantic Similarity Settings
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.45"))
    SIMILARITY_BOUNDARY_DELTA: float = float(os.getenv("SIMILARITY_BOUNDARY_DELTA", "0.05"))
    SIMILARITY_LOG_PATH: str = os.getenv(
        "SIMILARITY_LOG_PATH", 
        os.path.join(os.path.dirname(__file__), "data", "near_boundary_scores.log")
    )

    # 2. Conversation & Session State Settings
    SESSION_TTL_MINUTES: int = int(os.getenv("SESSION_TTL_MINUTES", "15"))

    # 3. Rule Engine Ranking Weights (Must sum to ~1.0)
    RANKING_WEIGHT_INTEREST: float = float(os.getenv("RANKING_WEIGHT_INTEREST", "0.40"))
    RANKING_WEIGHT_AMOUNT_FIT: float = float(os.getenv("RANKING_WEIGHT_AMOUNT_FIT", "0.35"))
    RANKING_WEIGHT_MORATORIUM: float = float(os.getenv("RANKING_WEIGHT_MORATORIUM", "0.25"))

settings = Settings()
