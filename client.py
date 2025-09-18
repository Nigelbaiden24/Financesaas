from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

# Base client schema
class ClientBase(BaseModel):
    client_number: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    nationality: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    marital_status: Optional[str] = None
    employment_status: Optional[str] = None
    employer: Optional[str] = None
    job_title: Optional[str] = None
    annual_income: Optional[Decimal] = None
    net_worth: Optional[Decimal] = None
    risk_tolerance: str = "moderate"
    investment_experience: Optional[str] = None
    objectives: List[Dict[str, Any]] = []
    dependents: List[Dict[str, Any]] = []
    status: str = "prospect"
    source: Optional[str] = None
    notes: Optional[str] = None
    next_review_date: Optional[datetime] = None

class ClientCreate(ClientBase):
    organization_id: str
    adviser_id: Optional[str] = None

class ClientUpdate(BaseModel):
    client_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    nationality: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    marital_status: Optional[str] = None
    employment_status: Optional[str] = None
    employer: Optional[str] = None
    job_title: Optional[str] = None
    annual_income: Optional[Decimal] = None
    net_worth: Optional[Decimal] = None
    risk_tolerance: Optional[str] = None
    investment_experience: Optional[str] = None
    objectives: Optional[List[Dict[str, Any]]] = None
    dependents: Optional[List[Dict[str, Any]]] = None
    status: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    next_review_date: Optional[datetime] = None

class ClientResponse(ClientBase):
    id: str
    organization_id: str
    adviser_id: Optional[str] = None
    last_review_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Household schemas
class HouseholdBase(BaseModel):
    name: str
    primary_client_id: Optional[str] = None
    joint_income: Optional[Decimal] = None
    joint_net_worth: Optional[Decimal] = None

class HouseholdCreate(HouseholdBase):
    organization_id: str

class HouseholdUpdate(BaseModel):
    name: Optional[str] = None
    primary_client_id: Optional[str] = None
    joint_income: Optional[Decimal] = None
    joint_net_worth: Optional[Decimal] = None

class HouseholdResponse(HouseholdBase):
    id: str
    organization_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Financial Goal schemas
class FinancialGoalBase(BaseModel):
    name: str
    description: Optional[str] = None
    target_amount: Decimal
    current_amount: Decimal = 0
    target_date: datetime
    priority: str = "medium"
    status: str = "active"

class FinancialGoalCreate(FinancialGoalBase):
    client_id: str

class FinancialGoalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[Decimal] = None
    current_amount: Optional[Decimal] = None
    target_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class FinancialGoalResponse(FinancialGoalBase):
    id: str
    client_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True