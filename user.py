from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    domain = Column(String, unique=True)
    subscription_plan = Column(String, default="starter")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(String, default="adviser")  # admin, adviser, paraplanner
    permissions = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())