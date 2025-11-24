"""Authentication endpoints for mock CAS login."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.models.user import UserInDB, UserPublic
from app.utils.security import (
    verify_password,
    create_access_token,
    decode_access_token
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> dict:
    """Extract and validate user from JWT token."""
    token = credentials.credentials
    token_data = decode_access_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = await db.users.find_one({"directory_id": token_data.directory_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Find user by directory_id
    user_doc = await db.users.find_one({"directory_id": credentials.directory_id})
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid directory ID or password"
        )
    
    user = UserInDB(**user_doc)
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid directory ID or password"
        )
    
    # Update last login timestamp
    await db.users.update_one(
        {"directory_id": credentials.directory_id},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )
    
    # Create JWT access token
    access_token = create_access_token(
        data={
            "directory_id": user.directory_id,
            "role": user.role.value
        }
    )
    
    # Return token and user profile
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserPublic(
            directory_id=user.directory_id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            major=user_doc.get("major"),
            year=user_doc.get("year"),
            pronouns=user_doc.get("pronouns"),
            phone=user_doc.get("phone"),
            address=user_doc.get("address"),
            bio=user_doc.get("bio")
        )
    )
