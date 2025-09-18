from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
import os

# Security configuration
SECRET_KEY = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user

def check_permissions(required_permissions: List[str]):
    """Decorator to check if user has required permissions"""
    def permission_checker(current_user: User = Depends(get_current_user)):
        user_permissions = current_user.permissions or []
        
        # Admins have all permissions
        if current_user.role == "admin":
            return current_user
            
        # Check if user has all required permissions
        missing_permissions = set(required_permissions) - set(user_permissions)
        if missing_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Missing: {', '.join(missing_permissions)}"
            )
        
        return current_user
    
    return permission_checker

# Permission sets for different roles
ADMIN_PERMISSIONS = [
    "clients:view", "clients:create", "clients:edit", "clients:delete",
    "portfolios:view", "portfolios:create", "portfolios:edit", "portfolios:delete",
    "planning:view", "planning:create", "planning:edit",
    "reports:view", "reports:create", "reports:export",
    "compliance:view", "compliance:manage", "compliance:audit",
    "org:settings", "org:users", "org:billing"
]

ADVISER_PERMISSIONS = [
    "clients:view", "clients:create", "clients:edit",
    "portfolios:view", "portfolios:create", "portfolios:edit",
    "planning:view", "planning:create", "planning:edit",
    "reports:view", "reports:create", "reports:export",
    "compliance:view"
]

PARAPLANNER_PERMISSIONS = [
    "clients:view",
    "portfolios:view",
    "planning:view", "planning:create", "planning:edit",
    "reports:view", "reports:create"
]