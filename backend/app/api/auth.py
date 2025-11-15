"""
Authentication endpoints for mock CAS login.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

from app.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.models.user import UserInDB, UserPublic
from app.utils.security import verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


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
    
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid directory ID or password"
        )
    
    await db.users.update_one(
        {"directory_id": credentials.directory_id},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token = create_access_token(
        data={
            "directory_id": user.directory_id,
            "role": user.role.value
        }
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserPublic(
            directory_id=user.directory_id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role
        )
    )
