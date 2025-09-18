from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.database import get_db
from app.models.portfolio import Portfolio, Holding
from app.models.client import Client
from app.models.user import User
from app.schemas.portfolio import (
    PortfolioCreate, PortfolioUpdate, PortfolioResponse,
    HoldingCreate, HoldingUpdate, HoldingResponse
)
from app.core.auth import get_current_user, check_permissions

router = APIRouter()

@router.get("/", response_model=List[PortfolioResponse])
async def get_portfolios(
    client_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(check_permissions(["portfolios:view"])),
    db: Session = Depends(get_db)
):
    """Get all portfolios, optionally filtered by client"""
    query = db.query(Portfolio).join(Client).filter(
        Client.organization_id == current_user.organization_id
    )
    
    if client_id:
        query = query.filter(Portfolio.client_id == client_id)
    
    portfolios = query.offset(skip).limit(limit).all()
    return portfolios

@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: str,
    current_user: User = Depends(check_permissions(["portfolios:view"])),
    db: Session = Depends(get_db)
):
    """Get a specific portfolio by ID"""
    portfolio = db.query(Portfolio).join(Client).filter(
        and_(
            Portfolio.id == portfolio_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    return portfolio

@router.post("/", response_model=PortfolioResponse)
async def create_portfolio(
    portfolio_data: PortfolioCreate,
    current_user: User = Depends(check_permissions(["portfolios:create"])),
    db: Session = Depends(get_db)
):
    """Create a new portfolio"""
    # Verify client exists and belongs to organization
    client = db.query(Client).filter(
        and_(
            Client.id == portfolio_data.client_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Create new portfolio
    db_portfolio = Portfolio(**portfolio_data.model_dump())
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    
    return db_portfolio

@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: str,
    portfolio_data: PortfolioUpdate,
    current_user: User = Depends(check_permissions(["portfolios:edit"])),
    db: Session = Depends(get_db)
):
    """Update an existing portfolio"""
    # Find portfolio
    portfolio = db.query(Portfolio).join(Client).filter(
        and_(
            Portfolio.id == portfolio_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    # Update portfolio fields
    update_data = portfolio_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(portfolio, field, value)
    
    db.commit()
    db.refresh(portfolio)
    
    return portfolio

@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    current_user: User = Depends(check_permissions(["portfolios:delete"])),
    db: Session = Depends(get_db)
):
    """Delete a portfolio"""
    portfolio = db.query(Portfolio).join(Client).filter(
        and_(
            Portfolio.id == portfolio_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    # Set to inactive instead of hard delete
    portfolio.is_active = False
    db.commit()
    
    return {"message": "Portfolio deactivated successfully"}

# Holdings endpoints
@router.get("/{portfolio_id}/holdings", response_model=List[HoldingResponse])
async def get_portfolio_holdings(
    portfolio_id: str,
    current_user: User = Depends(check_permissions(["portfolios:view"])),
    db: Session = Depends(get_db)
):
    """Get all holdings for a portfolio"""
    # Verify portfolio exists and belongs to organization
    portfolio = db.query(Portfolio).join(Client).filter(
        and_(
            Portfolio.id == portfolio_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio_id).all()
    return holdings