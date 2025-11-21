"""
User profile endpoints.
Users can view and update their profiles.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field
from typing import Optional

from app.database import get_db
from app.models.user import UserPublic, AcademicYear
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

class UpdateProfileRequest(BaseModel):
    """
    User profile update request.
    Cannot update: directory_id (immutable), email (requires verification), role (admin only)
    Can update: personal info and university-specific fields
    """
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    major: Optional[str] = Field(None, max_length=100, description="Academic major/department")
    year: Optional[AcademicYear] = Field(None, description="Academic year or affiliation")
    pronouns: Optional[str] = Field(None, max_length=50, description="Preferred pronouns")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    address: Optional[str] = Field(None, max_length=500, description="Mailing address")
    bio: Optional[str] = Field(None, max_length=500, description="Short bio or description")

    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Smith",
                "major": "Computer Science",
                "year": "senior",
                "pronouns": "he/him",
                "phone": "+1-301-555-0123",
                "address": "5678 College Ave, College Park, MD 20742",
                "bio": "Senior CS student passionate about AI and machine learning"
            }
        }


@router.get("/me", response_model=UserPublic)
async def get_my_profile(
    user: dict = Depends(get_current_user)
):
    """Get current user's profile with all details."""
    return UserPublic(
        directory_id=user["directory_id"],
        email=user["email"],
        first_name=user["first_name"],
        last_name=user["last_name"],
        role=user["role"],
        major=user.get("major"),
        year=user.get("year"),
        pronouns=user.get("pronouns"),
        phone=user.get("phone"),
        address=user.get("address"),
        bio=user.get("bio")
    )


@router.patch("/me", response_model=UserPublic)
async def update_my_profile(
    update_data: UpdateProfileRequest,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update current user's profile.
    
    Can update: first_name, last_name, major, year, pronouns, phone, address, bio
    Cannot update: directory_id, email, role, password
    """
    # Prepare update data (only include fields that were provided)
    update_fields = update_data.model_dump(exclude_unset=True)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update user in database
    result = await db.users.update_one(
        {"directory_id": user["directory_id"]},
        {"$set": update_fields}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Fetch and return updated user
    updated_user = await db.users.find_one({"directory_id": user["directory_id"]})
    
    return UserPublic(
        directory_id=updated_user["directory_id"],
        email=updated_user["email"],
        first_name=updated_user["first_name"],
        last_name=updated_user["last_name"],
        role=updated_user["role"],
        major=updated_user.get("major"),
        year=updated_user.get("year"),
        pronouns=updated_user.get("pronouns"),
        phone=updated_user.get("phone"),
        address=updated_user.get("address"),
        bio=updated_user.get("bio")
    )


@router.get("/{directory_id}", response_model=UserPublic)
async def get_user_by_directory_id(
    directory_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get public profile of any user by directory_id.
    No authentication required - public endpoint.
    
    Use case:
    - View event organizer info
    - See who else is registered for an event
    - Display user details in admin panel
    """
    user_doc = await db.users.find_one({"directory_id": directory_id})
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with directory ID '{directory_id}' not found"
        )
    
    return UserPublic(
        directory_id=user_doc["directory_id"],
        email=user_doc["email"],
        first_name=user_doc["first_name"],
        last_name=user_doc["last_name"],
        role=user_doc["role"],
        major=user_doc.get("major"),
        year=user_doc.get("year"),
        pronouns=user_doc.get("pronouns"),
        phone=user_doc.get("phone"),
        address=user_doc.get("address"),
        bio=user_doc.get("bio")
    )
