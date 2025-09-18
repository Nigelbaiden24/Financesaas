from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from app.database import get_db
from app.models.client import Client, FinancialGoal
from app.models.user import User
from app.schemas.client import (
    ClientCreate, ClientUpdate, ClientResponse,
    FinancialGoalCreate, FinancialGoalUpdate, FinancialGoalResponse
)
from app.core.auth import get_current_user, check_permissions

router = APIRouter()

@router.get("/", response_model=List[ClientResponse])
async def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(check_permissions(["clients:view"])),
    db: Session = Depends(get_db)
):
    """Get all clients for the current organization with optional filtering"""
    query = db.query(Client).filter(Client.organization_id == current_user.organization_id)
    
    # Apply search filter
    if search:
        search_filter = or_(
            Client.first_name.ilike(f"%{search}%"),
            Client.last_name.ilike(f"%{search}%"),
            Client.email.ilike(f"%{search}%"),
            Client.client_number.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Apply status filter
    if status:
        query = query.filter(Client.status == status)
    
    # Apply pagination
    clients = query.offset(skip).limit(limit).all()
    return clients

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    current_user: User = Depends(check_permissions(["clients:view"])),
    db: Session = Depends(get_db)
):
    """Get a specific client by ID"""
    client = db.query(Client).filter(
        and_(
            Client.id == client_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    return client

@router.post("/", response_model=ClientResponse)
async def create_client(
    client_data: ClientCreate,
    current_user: User = Depends(check_permissions(["clients:create"])),
    db: Session = Depends(get_db)
):
    """Create a new client"""
    # Ensure client belongs to current user's organization
    client_data.organization_id = current_user.organization_id
    
    # Check if client number is unique within organization
    existing_client = db.query(Client).filter(
        and_(
            Client.client_number == client_data.client_number,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client number already exists in organization"
        )
    
    # Create new client
    db_client = Client(**client_data.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    return db_client

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    client_data: ClientUpdate,
    current_user: User = Depends(check_permissions(["clients:edit"])),
    db: Session = Depends(get_db)
):
    """Update an existing client"""
    # Find client
    client = db.query(Client).filter(
        and_(
            Client.id == client_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Update client fields
    update_data = client_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    
    return client

@router.delete("/{client_id}")
async def delete_client(
    client_id: str,
    current_user: User = Depends(check_permissions(["clients:delete"])),
    db: Session = Depends(get_db)
):
    """Delete a client (soft delete by setting status to 'former')"""
    client = db.query(Client).filter(
        and_(
            Client.id == client_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Soft delete by setting status
    client.status = "former"
    db.commit()
    
    return {"message": "Client deleted successfully"}

# Financial Goals endpoints
@router.get("/{client_id}/goals", response_model=List[FinancialGoalResponse])
async def get_client_goals(
    client_id: str,
    current_user: User = Depends(check_permissions(["clients:view"])),
    db: Session = Depends(get_db)
):
    """Get all financial goals for a client"""
    # Verify client exists and belongs to organization
    client = db.query(Client).filter(
        and_(
            Client.id == client_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    goals = db.query(FinancialGoal).filter(FinancialGoal.client_id == client_id).all()
    return goals

@router.post("/{client_id}/goals", response_model=FinancialGoalResponse)
async def create_client_goal(
    client_id: str,
    goal_data: FinancialGoalCreate,
    current_user: User = Depends(check_permissions(["planning:create"])),
    db: Session = Depends(get_db)
):
    """Create a new financial goal for a client"""
    # Verify client exists and belongs to organization
    client = db.query(Client).filter(
        and_(
            Client.id == client_id,
            Client.organization_id == current_user.organization_id
        )
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Ensure goal belongs to the correct client
    goal_data.client_id = client_id
    
    # Create new goal
    db_goal = FinancialGoal(**goal_data.model_dump())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    return db_goal