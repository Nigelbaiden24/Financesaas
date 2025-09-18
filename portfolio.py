from sqlalchemy import Column, String, Text, DateTime, Numeric, Boolean, JSON
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text)
    account_type = Column(Text, nullable=False)  # ISA, SIPP, General Investment, etc.
    provider = Column(Text)  # Platform provider
    account_number = Column(Text)
    total_value = Column(Numeric(12, 2), default=0)
    currency = Column(Text, default="GBP")
    model_portfolio = Column(Text)  # Reference to model portfolio if using one
    asset_allocation = Column(JSON, default=dict)  # {equities: 60, bonds: 30, cash: 10}
    benchmark_index = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Holding(Base):
    __tablename__ = "holdings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    portfolio_id = Column(String, nullable=False)
    symbol = Column(Text, nullable=False)  # Ticker or ISIN
    name = Column(Text, nullable=False)
    asset_class = Column(Text, nullable=False)  # equity, bond, cash, property, commodity, alternative
    sector = Column(Text)
    region = Column(Text)
    quantity = Column(Numeric(15, 6), nullable=False)
    average_cost = Column(Numeric(10, 4))
    current_price = Column(Numeric(10, 4), nullable=False)
    market_value = Column(Numeric(12, 2), nullable=False)
    unrealized_gain_loss = Column(Numeric(12, 2))
    weight = Column(Numeric(5, 2))  # Percentage of portfolio
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class PortfolioTransaction(Base):
    __tablename__ = "portfolio_transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    portfolio_id = Column(String, nullable=False)
    type = Column(Text, nullable=False)  # buy, sell, dividend, interest, fee, deposit, withdrawal
    symbol = Column(Text)  # For trades
    quantity = Column(Numeric(15, 6))
    price = Column(Numeric(10, 4))
    amount = Column(Numeric(12, 2), nullable=False)
    fees = Column(Numeric(10, 2), default=0)
    net_amount = Column(Numeric(12, 2), nullable=False)
    trade_date = Column(DateTime, nullable=False)
    settlement_date = Column(DateTime)
    description = Column(Text)
    reference = Column(Text)  # External reference
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)