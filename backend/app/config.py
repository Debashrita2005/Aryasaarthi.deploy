"""
AryaSaarthi Backend Configuration
Environment variables and application settings.
"""

import os
from pathlib import Path
try:
    from pydantic_settings import BaseSettings
except ImportError:
    class BaseSettings:
        pass


BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings:
    PROJECT_NAME: str = "AryaSaarthi"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Security & JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "aryasaarthi-super-secret-production-key-sih-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

    # Database: SQLite by default, seamlessly switchable to PostgreSQL via env var
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'aryasaarthi.db'}"
    )

    # CORS origins
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]


settings = Settings()
