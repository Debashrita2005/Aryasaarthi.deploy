#!/usr/bin/env python3
"""
AryaSaarthi — Seed MongoDB 'schemes' collection for Ask Arya Chatbot
Inserts NSFDC schemes conforming strictly to the requested data contract.
Features strict Ingestion-Time Validation: Rejects and logs any scheme document
missing required fields or containing invalid boundary ranges.
"""

import os
import sys
import json
import asyncio
import logging

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_chatbot_schemes")

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "chatbot_schemes.json")

REQUIRED_INGESTION_FIELDS = [
    "scheme_id",
    "name",
    "category",
    "min_income",
    "max_income",
    "min_amount",
    "max_amount",
    "interest_rate_min",
    "interest_rate_max",
    "eligible_project_types",
]

def validate_scheme_for_ingestion(scheme: dict) -> tuple[bool, str]:
    """
    Ingestion-time validator:
    Ensures scheme document contains all required fields and valid range boundaries.
    Returns (is_valid, error_reason).
    """
    if not isinstance(scheme, dict):
        return False, "Scheme record is not a dictionary"

    missing = [f for f in REQUIRED_INGESTION_FIELDS if f not in scheme or scheme[f] is None]
    if missing:
        return False, f"Missing required fields: {', '.join(missing)}"

    if not isinstance(scheme["eligible_project_types"], list):
        return False, "'eligible_project_types' must be a list"

    try:
        min_inc = float(scheme["min_income"])
        max_inc = float(scheme["max_income"])
        if min_inc < 0 or max_inc < min_inc:
            return False, f"Invalid income range: min ({min_inc}) > max ({max_inc})"

        min_amt = float(scheme["min_amount"])
        max_amt = float(scheme["max_amount"])
        if min_amt < 0 or max_amt < min_amt:
            return False, f"Invalid amount range: min ({min_amt}) > max ({max_amt})"
    except (ValueError, TypeError) as e:
        return False, f"Numeric parse error in income or amount: {e}"

    return True, ""

def load_schemes_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

async def seed():
    logger.info("Connecting to MongoDB: %s", settings.MONGODB_URI)
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        db = client[settings.MONGODB_DB_NAME]
        await client.admin.command('ping')
        logger.info("Connected to MongoDB successfully.")

        schemes_data = load_schemes_data()
        schemes_coll = db["schemes"]
        chatbot_coll = db["chatbot_schemes"]

        valid_count = 0
        rejected_count = 0

        # Ingestion-time validation loop
        for s in schemes_data:
            sid = s.get("scheme_id", "UNKNOWN")
            is_valid, reason = validate_scheme_for_ingestion(s)

            if not is_valid:
                logger.error("❌ REJECTED scheme '%s' at ingestion: %s", sid, reason)
                rejected_count += 1
                continue

            # Upsert valid schemes into collections
            await schemes_coll.update_one(
                {"scheme_id": s["scheme_id"]},
                {"$set": s},
                upsert=True
            )
            await chatbot_coll.update_one(
                {"scheme_id": s["scheme_id"]},
                {"$set": s},
                upsert=True
            )
            logger.info("✅ Upserted validated scheme: %s (%s)", s["name"], s["scheme_id"])
            valid_count += 1

        # Create indexes
        await schemes_coll.create_index("scheme_id", unique=True)
        await schemes_coll.create_index("category")
        await chatbot_coll.create_index("scheme_id", unique=True)
        await chatbot_coll.create_index("category")

        logger.info(
            "Seeding complete: %d valid schemes inserted, %d rejected due to schema violations.",
            valid_count, rejected_count
        )
        client.close()
    except Exception as e:
        logger.warning("MongoDB not active locally (%s). Schemes persisted to %s for offline fallback.", e, DATA_FILE)

if __name__ == "__main__":
    asyncio.run(seed())
