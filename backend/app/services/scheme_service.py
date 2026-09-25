"""
AryaSaarthi Backend Service — Scheme Service
Manages verified scheme knowledge retrieval, database persistence, and seeding.
"""

import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from ..models.scheme import Scheme


logger = logging.getLogger("backend.services.schemes")
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
SCHEMES_JSON_PATH = ROOT_DIR / "data" / "schemes.json"


def seed_schemes_if_empty(db: Session):
    """Seeds verified schemes into the database from data/schemes.json if table is empty."""
    count = db.query(Scheme).count()
    if count > 0:
        return

    if not SCHEMES_JSON_PATH.exists():
        logger.warning("Schemes JSON file not found at %s. Skipping initial seed.", SCHEMES_JSON_PATH)
        return

    with open(SCHEMES_JSON_PATH, "r", encoding="utf-8") as f:
        schemes_data = json.load(f)

    logger.info("Seeding %d verified schemes into database...", len(schemes_data))
    for s in schemes_data:
        scheme_obj = Scheme(
            scheme_id=s.get("scheme_id"),
            name=s.get("name"),
            category=s.get("category"),
            description=s.get("description"),
            benefits=s.get("benefits"),
            eligibility_data=json.dumps(s.get("eligibility_data", {})),
            documents=json.dumps(s.get("documents", [])),
            application_process=s.get("application_process", ""),
            official_source=s.get("official_source", ""),
            state=s.get("state", "Central"),
            active=s.get("active", True)
        )
        db.add(scheme_obj)

    db.commit()
    logger.info("Schemes successfully seeded into database.")


class SchemeService:

    @staticmethod
    def get_all_schemes(db: Session, active_only: bool = True) -> List[Dict[str, Any]]:
        query = db.query(Scheme)
        if active_only:
            query = query.filter(Scheme.active == True)  # noqa: E712
        schemes = query.all()
        return [s.to_dict() for s in schemes]

    @staticmethod
    def get_scheme_by_id(db: Session, scheme_id: str) -> Optional[Dict[str, Any]]:
        scheme = db.query(Scheme).filter(Scheme.scheme_id == scheme_id).first()
        if not scheme:
            # Also try integer ID
            try:
                scheme = db.query(Scheme).filter(Scheme.id == int(scheme_id)).first()
            except ValueError:
                pass
        return scheme.to_dict() if scheme else None


scheme_service = SchemeService()
