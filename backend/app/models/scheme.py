"""
AryaSaarthi Database Models — Scheme Model
"""

import json
from sqlalchemy import Column, Integer, String, Text, Boolean
from ..database import Base


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scheme_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)
    eligibility_data = Column(Text, nullable=False)  # JSON-encoded dict
    documents = Column(Text, nullable=False)         # JSON-encoded list
    application_process = Column(Text, nullable=True)
    official_source = Column(String(255), nullable=True)
    state = Column(String(100), default="Central", nullable=False)
    active = Column(Boolean, default=True, nullable=False)

    def to_dict(self):
        try:
            elig_dict = json.loads(self.eligibility_data) if self.eligibility_data else {}
        except Exception:
            elig_dict = {}

        try:
            docs_list = json.loads(self.documents) if self.documents else []
        except Exception:
            docs_list = []

        return {
            "id": self.id,
            "scheme_id": self.scheme_id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "benefits": self.benefits,
            "eligibility_data": elig_dict,
            "documents": docs_list,
            "application_process": self.application_process,
            "official_source": self.official_source,
            "state": self.state,
            "active": self.active
        }
