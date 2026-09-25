"""
AryaSaarthi Backend — Production FastAPI Application
Integrates local ML models with database, authentication, scheme knowledge base,
eligibility engine, and deterministic chatbot.
Zero external LLM API dependencies.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from .config import settings
from .database import engine, init_db, get_db, SessionLocal
from .services.ml_service import ml_service
from .services.scheme_service import seed_schemes_if_empty
from .routers import (
    auth_router,
    profile_router,
    schemes_router,
    eligibility_router,
    recommendations_router,
    chat_router,
    ocr_router,
    asr_router,
)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("backend.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and lifespan manager:
    1. Initializes database schema
    2. Seeds verified schemes from data/schemes.json if table is empty
    3. Preloads ML models once into memory (avoiding per-request reloading)
    """
    logger.info("Initializing AryaSaarthi Database and tables...")
    init_db()

    # Seed schemes
    db = SessionLocal()
    try:
        seed_schemes_if_empty(db)
    finally:
        db.close()

    # Preload ML models once at boot
    logger.info("Preloading AryaSaarthi ML models...")
    ml_service.initialize()
    logger.info("AryaSaarthi backend successfully initialized.")

    yield

    logger.info("AryaSaarthi backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AryaSaarthi — AI-powered government scheme discovery & eligibility engine (100% Local ML)",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Endpoint
@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """
    System health check endpoint:
    Verifies database connection and ML model preload state.
    """
    db_status = "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error("Health check DB error: %s", e)

    ml_status = "loaded" if ml_service.is_healthy() else "initializing"

    return {
        "status": "healthy" if db_status == "connected" and ml_status == "loaded" else "degraded",
        "ml_model": ml_status,
        "database": db_status,
        "version": settings.VERSION
    }


# Include Application Routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(schemes_router)
app.include_router(eligibility_router)
app.include_router(recommendations_router)
app.include_router(chat_router)
app.include_router(ocr_router)
app.include_router(asr_router)
