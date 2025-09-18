from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from app.database import get_db
from app.models.scenario import Scenario
from app.models.client import Client
from app.models.user import User
from app.schemas.portfolio import ScenarioCreate, ScenarioUpdate, ScenarioResponse
from app.core.auth import get_current_user, check_permissions

router = APIRouter()

@router.get("/", response_model=List[ScenarioResponse])
async def get_scenarios(
    client_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(check_permissions(["planning:view"])),
    db: Session = Depends(get_db)
):
    """Get all scenarios, optionally filtered by client"""
    query = db.query(Scenario).join(Client).filter(
        Client.organization_id == current_user.organization_id
    )
    
    if client_id:
        query = query.filter(Scenario.client_id == client_id)
    
    scenarios = query.offset(skip).limit(limit).all()
    return scenarios

@router.get("/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(
    scenario_id: str,
    current_user: User = Depends(check_permissions(["planning:view"])),
    db: Session = Depends(get_db)
):
    """Get a specific scenario by ID"""
    scenario = db.query(Scenario).join(Client).filter(
        and_(
            Scenario.id == scenario_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    return scenario

@router.post("/", response_model=ScenarioResponse)
async def create_scenario(
    scenario_data: ScenarioCreate,
    current_user: User = Depends(check_permissions(["planning:create"])),
    db: Session = Depends(get_db)
):
    """Create a new scenario"""
    # Verify client exists and belongs to organization
    client = db.query(Client).filter(
        and_(
            Client.id == scenario_data.client_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Create new scenario
    db_scenario = Scenario(**scenario_data.model_dump())
    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)
    
    return db_scenario

@router.put("/{scenario_id}", response_model=ScenarioResponse)
async def update_scenario(
    scenario_id: str,
    scenario_data: ScenarioUpdate,
    current_user: User = Depends(check_permissions(["planning:edit"])),
    db: Session = Depends(get_db)
):
    """Update an existing scenario"""
    # Find scenario
    scenario = db.query(Scenario).join(Client).filter(
        and_(
            Scenario.id == scenario_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    # Update scenario fields
    update_data = scenario_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(scenario, field, value)
    
    db.commit()
    db.refresh(scenario)
    
    return scenario

@router.delete("/{scenario_id}")
async def delete_scenario(
    scenario_id: str,
    current_user: User = Depends(check_permissions(["planning:edit"])),
    db: Session = Depends(get_db)
):
    """Delete a scenario"""
    scenario = db.query(Scenario).join(Client).filter(
        and_(
            Scenario.id == scenario_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    # Set to inactive instead of hard delete
    scenario.is_active = False
    db.commit()
    
    return {"message": "Scenario deactivated successfully"}