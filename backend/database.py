import os
import json
import logging
from typing import List, Dict, Any, Optional
from config import settings
from engine import DEFAULT_SCHEMES
from models import SchemeModel, PartnerModel

logger = logging.getLogger("backend.database")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
SCHEMES_FILE = os.path.join(DATA_DIR, "schemes.json")
PARTNERS_FILE = os.path.join(DATA_DIR, "partners.json")
LOGS_FILE = os.path.join(DATA_DIR, "recommendations.jsonl")

def _load_initial_schemes() -> List[Dict[str, Any]]:
    if os.path.exists(SCHEMES_FILE):
        try:
            with open(SCHEMES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error("Error loading schemes.json: %s", e)
    return [s.model_dump() for s in DEFAULT_SCHEMES]

def _load_initial_partners() -> List[Dict[str, Any]]:
    if os.path.exists(PARTNERS_FILE):
        try:
            with open(PARTNERS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error("Error loading partners.json: %s", e)
    return []

# Persistent Storage Container (In-Memory + Disk Synced)
_STORAGE: Dict[str, List[Dict[str, Any]]] = {
    "schemes": _load_initial_schemes(),
    "partners": _load_initial_partners(),
    "recommendation_logs": [],
    "inquiries": []
}

def _persist_schemes_to_disk():
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(SCHEMES_FILE, "w", encoding="utf-8") as f:
            json.dump(_STORAGE["schemes"], f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error("Failed to persist schemes to disk: %s", e)

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected = False

    async def connect(self):
        """Attempts to connect to MongoDB; gracefully uses persistent disk store if unavailable."""
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=1000
            )
            # Verify server availability
            await self.client.admin.command('ping')
            self.db = self.client[settings.MONGODB_DB_NAME]
            self.is_connected = True
            logger.info("Successfully connected to live MongoDB: %s", settings.MONGODB_URI)

            # Ensure indexes
            await self.create_indexes()
        except Exception as e:
            self.is_connected = False
            logger.info("MongoDB not connected (%s). Operating with persistent disk storage in backend/data/.", str(e))

    async def create_indexes(self):
        """Creates compound and geospatial 2dsphere indexes in MongoDB."""
        if not self.is_connected or self.db is None:
            return
        try:
            # Schemes index
            await self.db.schemes.create_index("code", unique=True)
            await self.db.schemes.create_index([("status", 1), ("purpose", 1)])
            
            # Partners geospatial index
            await self.db.partners.create_index([("location", "2dsphere")])
            await self.db.partners.create_index([("state", 1), ("district", 1)])
            logger.info("MongoDB indexes verified.")
        except Exception as err:
            logger.error("Error creating indexes: %s", str(err))

    async def get_all_schemes(self) -> List[SchemeModel]:
        """Fetches all active schemes from MongoDB (or persistent storage)."""
        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.schemes.find({"status": "ACTIVE"})
                docs = await cursor.to_list(length=200)
                if docs:
                    return [SchemeModel(**d) for d in docs]
            except Exception as e:
                logger.error("Error reading from MongoDB schemes collection: %s", e)

        # Fallback to persistent disk-synced storage
        return [SchemeModel(**s) for s in _STORAGE["schemes"]]

    async def log_recommendation(self, log_data: Dict[str, Any]):
        """Persists recommendation decision and applicant inputs to MongoDB & disk."""
        if self.is_connected and self.db is not None:
            try:
                await self.db.recommendation_logs.insert_one(log_data)
            except Exception as e:
                logger.error("Error logging recommendation to MongoDB: %s", e)

        _STORAGE["recommendation_logs"].append(log_data)
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            with open(LOGS_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_data, ensure_ascii=False) + "\n")
        except Exception as err:
            logger.warning("Could not append recommendation to log file: %s", err)

    async def upsert_scheme(self, scheme: SchemeModel) -> SchemeModel:
        """Dynamically adds or updates a scheme in MongoDB and persists it to disk."""
        scheme_doc = scheme.model_dump()
        if self.is_connected and self.db is not None:
            try:
                await self.db.schemes.update_one({"code": scheme.code}, {"$set": scheme_doc}, upsert=True)
            except Exception as e:
                logger.error("Error upserting scheme to MongoDB: %s", e)

        # Disk & in-memory store update
        existing_idx = next((i for i, s in enumerate(_STORAGE["schemes"]) if s["code"].upper() == scheme.code.upper()), None)
        if existing_idx is not None:
            _STORAGE["schemes"][existing_idx] = scheme_doc
        else:
            _STORAGE["schemes"].append(scheme_doc)

        _persist_schemes_to_disk()
        return scheme

    async def delete_scheme(self, code: str) -> bool:
        """Deletes or archives a scheme by code in MongoDB and updates disk."""
        if self.is_connected and self.db is not None:
            try:
                res = await self.db.schemes.delete_one({"code": code.upper()})
            except Exception as e:
                logger.error("Error deleting scheme from MongoDB: %s", e)

        orig_len = len(_STORAGE["schemes"])
        _STORAGE["schemes"] = [s for s in _STORAGE["schemes"] if s["code"].upper() != code.upper()]
        if len(_STORAGE["schemes"]) < orig_len:
            _persist_schemes_to_disk()
            return True
        return False

    async def get_partners_by_state(self, state_name: str) -> List[Dict[str, Any]]:
        """Finds channelizing partner agencies by state."""
        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.partners.find({"state": {"$regex": state_name, "$options": "i"}})
                return await cursor.to_list(length=50)
            except Exception as e:
                logger.error("Error querying partners by state: %s", e)

        state_lower = state_name.lower()
        return [p for p in _STORAGE["partners"] if state_lower in p.get("state", "").lower()]

db = Database()
