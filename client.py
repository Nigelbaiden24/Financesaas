from sqlalchemy import Column, String, Text, DateTime, Numeric, Boolean, JSON, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, nullable=False)
    adviser_id = Column(String)  # Primary adviser
    client_number = Column(Text, nullable=False)  # Unique within org
    first_name = Column(Text, nullable=False)
    last_name = Column(Text, nullable=False)
    email = Column(Text)
    phone = Column(Text)
    date_of_birth = Column(DateTime)
    nationality = Column(Text)
    address = Column(JSON)  # {street, city, postcode, country}
    marital_status = Column(Text)  # single, married, divorced, widowed
    employment_status = Column(Text)  # employed, self-employed, retired, unemployed
    employer = Column(Text)
    job_title = Column(Text)
    annual_income = Column(Numeric(12, 2))
    net_worth = Column(Numeric(12, 2))
    risk_tolerance = Column(Text, default="moderate")  # conservative, moderate, aggressive
    investment_experience = Column(Text)  # none, basic, experienced, expert
    objectives = Column(JSON, default=list)  # Array of financial objectives
    dependents = Column(JSON, default=list)  # Array of dependent information
    status = Column(Text, default="prospect")  # prospect, active, inactive, former
    source = Column(Text)  # How they found us
    notes = Column(Text)
    last_review_date = Column(DateTime)
    next_review_date = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Household(Base):
    __tablename__ = "households"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, nullable=False)
    name = Column(Text, nullable=False)
    primary_client_id = Column(String)
    joint_income = Column(Numeric(12, 2))
    joint_net_worth = Column(Numeric(12, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class HouseholdClient(Base):
    __tablename__ = "household_clients"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    household_id = Column(String, nullable=False)
    client_id = Column(String, nullable=False)
    relationship_type = Column(Text, default="member")  # primary, spouse, partner, child, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class FinancialGoal(Base):
    __tablename__ = "financial_goals"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text)
    target_amount = Column(Numeric(12, 2), nullable=False)
    current_amount = Column(Numeric(12, 2), default=0)
    target_date = Column(DateTime, nullable=False)
    priority = Column(Text, default="medium")  # high, medium, low
    status = Column(Text, default="active")  # active, achieved, paused, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())