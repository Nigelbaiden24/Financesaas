from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.database import get_db
from app.models.client import Household
from app.models.user import User
from app.schemas.client import HouseholdCreate, HouseholdUpdate, HouseholdResponse
from app.core.auth import get_current_user, check_permissions

router = APIRouter()

@router.get("/", response_model=List[HouseholdResponse])
async def get_households(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(check_permissions(["clients:view"])),
    db: Session = Depends(get_db)
):
    """Get all households for the current organization"""
    households = db.query(Household).filter(
        Household.organization_id == current_user.organization_id
    ).offset(skip).limit(limit).all()
    
    return households

@router.get("/{household_id}", response_model=HouseholdResponse)
async def get_household(
    household_id: str,
    current_user: User = Depends(check_permissions(["clients:view"])),
    db: Session = Depends(get_db)
):
    """Get a specific household by ID"""
    household = db.query(Household).filter(
        and_(
            Household.id == household_id,
            Household.organization_id == current_user.organization_id
        )
    ).first()
    
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found"
        )
    
    return household

@router.post("/", response_model=HouseholdResponse)
async def create_household(
    household_data: HouseholdCreate,
    current_user: User = Depends(check_permissions(["clients:create"])),
    db: Session = Depends(get_db)
):
    """Create a new household"""
    # Ensure household belongs to current user's organization
    household_data.organization_id = current_user.organization_id
    
    # Create new household
    db_household = Household(**household_data.model_dump())
    db.add(db_household)
    db.commit()
    db.refresh(db_household)
    
    return db_household

@router.put("/{household_id}", response_model=HouseholdResponse)
async def update_household(
    household_id: str,
    household_data: HouseholdUpdate,
    current_user: User = Depends(check_permissions(["clients:edit"])),
    db: Session = Depends(get_db)
):
    """Update an existing household"""
    # Find household
    household = db.query(Household).filter(
        and_(
            Household.id == household_id,
            Household.organization_id == current_user.organization_id
        )
    ).first()
    
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found"
        )
    
    # Update household fields
    update_data = household_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(household, field, value)
    
    db.commit()
    db.refresh(household)
    
    return household

@router.delete("/{household_id}")
async def delete_household(
    household_id: str,
    current_user: User = Depends(check_permissions(["clients:delete"])),
    db: Session = Depends(get_db)
):
    """Delete a household"""
    household = db.query(Household).filter(
        and_(
            Household.id == household_id,
            Household.organization_id == current_user.organization_id
        )
    ).first()
    
    if not household:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found"
        )
    
    db.delete(household)
    db.commit()
    
    return {"message": "Household deleted successfully"}