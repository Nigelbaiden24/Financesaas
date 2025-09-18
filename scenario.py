from sqlalchemy import Column, String, Text, DateTime, Numeric, Boolean, JSON, Integer
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Scenario(Base):
    __tablename__ = "scenarios"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text)
    type = Column(Text, nullable=False)  # retirement, education, house_purchase, etc.
    current_age = Column(Integer, nullable=False)
    target_age = Column(Integer, nullable=False)
    current_savings = Column(Numeric(12, 2), default=0)
    monthly_contribution = Column(Numeric(10, 2), nullable=False)
    expected_return = Column(Numeric(5, 2), nullable=False)
    inflation_rate = Column(Numeric(5, 2), default=2.5)
    target_amount = Column(Numeric(12, 2))
    projected_value = Column(Numeric(12, 2))
    projected_income = Column(Numeric(10, 2))
    assumptions = Column(JSON, default=dict)  # Additional modeling assumptions
    results = Column(JSON, default=dict)  # Detailed scenario results
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())