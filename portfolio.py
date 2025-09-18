from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

# Portfolio schemas
class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None
    account_type: str
    provider: Optional[str] = None
    account_number: Optional[str] = None
    total_value: Decimal = 0
    currency: str = "GBP"
    model_portfolio: Optional[str] = None
    asset_allocation: Dict[str, Any] = {}
    benchmark_index: Optional[str] = None
    is_active: bool = True

class PortfolioCreate(PortfolioBase):
    client_id: str

class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    account_type: Optional[str] = None
    provider: Optional[str] = None
    account_number: Optional[str] = None
    total_value: Optional[Decimal] = None
    currency: Optional[str] = None
    model_portfolio: Optional[str] = None
    asset_allocation: Optional[Dict[str, Any]] = None
    benchmark_index: Optional[str] = None
    is_active: Optional[bool] = None

class PortfolioResponse(PortfolioBase):
    id: str
    client_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Holding schemas
class HoldingBase(BaseModel):
    symbol: str
    name: str
    asset_class: str
    sector: Optional[str] = None
    region: Optional[str] = None
    quantity: Decimal
    average_cost: Optional[Decimal] = None
    current_price: Decimal
    market_value: Decimal
    unrealized_gain_loss: Optional[Decimal] = None
    weight: Optional[Decimal] = None

class HoldingCreate(HoldingBase):
    portfolio_id: str

class HoldingUpdate(BaseModel):
    symbol: Optional[str] = None
    name: Optional[str] = None
    asset_class: Optional[str] = None
    sector: Optional[str] = None
    region: Optional[str] = None
    quantity: Optional[Decimal] = None
    average_cost: Optional[Decimal] = None
    current_price: Optional[Decimal] = None
    market_value: Optional[Decimal] = None
    unrealized_gain_loss: Optional[Decimal] = None
    weight: Optional[Decimal] = None

class HoldingResponse(HoldingBase):
    id: str
    portfolio_id: str
    last_updated: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Scenario schemas
class ScenarioBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str
    current_age: int
    target_age: int
    current_savings: Decimal = 0
    monthly_contribution: Decimal
    expected_return: Decimal
    inflation_rate: Decimal = Decimal("2.5")
    target_amount: Optional[Decimal] = None
    projected_value: Optional[Decimal] = None
    projected_income: Optional[Decimal] = None
    assumptions: Dict[str, Any] = {}
    results: Dict[str, Any] = {}
    is_active: bool = True

class ScenarioCreate(ScenarioBase):
    client_id: str

class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    current_age: Optional[int] = None
    target_age: Optional[int] = None
    current_savings: Optional[Decimal] = None
    monthly_contribution: Optional[Decimal] = None
    expected_return: Optional[Decimal] = None
    inflation_rate: Optional[Decimal] = None
    target_amount: Optional[Decimal] = None
    projected_value: Optional[Decimal] = None
    projected_income: Optional[Decimal] = None
    assumptions: Optional[Dict[str, Any]] = None
    results: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class ScenarioResponse(ScenarioBase):
    id: str
    client_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True