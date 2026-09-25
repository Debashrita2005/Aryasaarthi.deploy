"""
AryaSaarthi Database Models — Profile Model
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Profile(Base):
    __tablename__ = "profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    age = Column(Integer, nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    occupation = Column(String(100), nullable=True)
    land_area = Column(Float, nullable=True)
    land_unit = Column(String(50), default="acre", nullable=True)
    crop = Column(String(100), nullable=True)
    annual_income = Column(Float, nullable=True)
    loan_requirement = Column(Float, nullable=True)
    assistance_requirement = Column(String(150), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "age": self.age,
            "state": self.state,
            "district": self.district,
            "occupation": self.occupation,
            "land_area": self.land_area,
            "land_unit": self.land_unit,
            "crop": self.crop,
            "annual_income": self.annual_income,
            "loan_requirement": self.loan_requirement,
            "assistance_requirement": self.assistance_requirement,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
