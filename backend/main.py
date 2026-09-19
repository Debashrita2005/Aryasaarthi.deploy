import logging
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from models import (
    RecommendationRequest,
    RecommendationResponse,
    SchemeModel,
    PartnerModel
)
from engine import RuleEngine
from database import db

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing Sahayak Rule Engine & MongoDB connection...")
    await db.connect()

    # Module-level model singletons (loaded once at startup, never per-request)
    try:
        from chatbot.nlu import get_spacy_nlp
        logger.info("Preloading spaCy model singleton...")
        get_spacy_nlp()
    except Exception as e:
        logger.warning("spaCy startup preload: %s", e)

    try:
        from chatbot.similarity_matcher import get_sentence_transformer
        logger.info("Preloading SentenceTransformer model singleton...")
        get_sentence_transformer()
    except Exception as e:
        logger.warning("SentenceTransformer startup preload: %s", e)

    yield
    # Shutdown
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance asynchronous Python Rule Engine for NSFDC & NDFDC Welfare Schemes with MongoDB",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Ask Arya Chatbot routes
from chatbot.routes import router as chatbot_router
app.include_router(chatbot_router)

@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "mongo_connected": db.is_connected
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "database": "connected" if db.is_connected else "in_memory_fallback",
        "engine": "active"
    }

@app.post("/api/evaluate", response_model=RecommendationResponse)
async def evaluate_scheme_recommendation(request: RecommendationRequest):
    """
    Evaluates applicant profile using Two-Stage Rule Engine:
    Stage 1: Boolean Hard-Rule Filters (Income, Age, Caste, Purpose, Project Cost).
    Stage 2: Multi-Attribute Utility Fit Scoring (0.0 to 1.0).
    Stage 3: Bilingual Explainable Reasoning (English & Hindi).
    """
    try:
        # Load active schemes from MongoDB (or cached store)
        schemes = await db.get_all_schemes()
        engine = RuleEngine(schemes=schemes)
        response = engine.evaluate(request)

        # Log recommendation to MongoDB asynchronously
        log_payload = {
            "requestId": response.requestId,
            "evaluatedAt": response.evaluatedAt,
            "request": request.model_dump(),
            "bestMatchCode": response.bestMatch.schemeCode if response.bestMatch else None,
            "bestMatchScore": response.bestMatch.score if response.bestMatch else None,
            "candidatesCount": len(response.candidateSchemes)
        }
        await db.log_recommendation(log_payload)

        return response
    except Exception as e:
        logger.error(f"Evaluation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Recommendation evaluation failed: {str(e)}")

@app.get("/api/schemes", response_model=List[SchemeModel])
async def list_schemes(purpose: Optional[str] = None):
    """Returns list of all active welfare schemes."""
    schemes = await db.get_all_schemes()
    if purpose:
        return [s for s in schemes if s.purpose.upper() == purpose.upper() or s.purpose == "BOTH"]
    return schemes

@app.get("/api/schemes/{code}", response_model=SchemeModel)
async def get_scheme(code: str):
    """Returns specific scheme details by code."""
    schemes = await db.get_all_schemes()
    for s in schemes:
        if s.code.upper() == code.upper() or s.slug.lower() == code.lower():
            return s
    raise HTTPException(status_code=404, detail=f"Scheme '{code}' not found.")

@app.post("/api/schemes", response_model=SchemeModel, status_code=201)
async def create_scheme(scheme: SchemeModel):
    """Dynamically creates or inserts a new scheme into MongoDB."""
    existing = await db.get_all_schemes()
    if any(s.code.upper() == scheme.code.upper() for s in existing):
        raise HTTPException(status_code=400, detail=f"Scheme with code '{scheme.code}' already exists.")
    saved = await db.upsert_scheme(scheme)
    return saved

@app.put("/api/schemes/{code}", response_model=SchemeModel)
async def update_scheme(code: str, scheme: SchemeModel):
    """Dynamically updates an existing scheme's parameters, interest rates, or eligibility in MongoDB."""
    saved = await db.upsert_scheme(scheme)
    return saved

@app.delete("/api/schemes/{code}")
async def delete_scheme(code: str):
    """Deletes or archives a scheme from MongoDB."""
    success = await db.delete_scheme(code)
    if not success:
        raise HTTPException(status_code=404, detail=f"Scheme '{code}' not found.")
    return {"status": "success", "message": f"Scheme '{code}' removed successfully."}

@app.get("/api/partners/nearby")
async def get_nearby_partners(state: str = Query(..., description="State name to query")):
    """Returns verified partner agencies and SCAs for the requested state."""
    partners = await db.get_partners_by_state(state)
    return {"state": state, "count": len(partners), "partners": partners}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
