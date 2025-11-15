"""
User model representing a user in the database.
Supports three roles: participant, organizer, admin.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    PARTICIPANT = "participant"
    ORGANIZER = "organizer"
    ADMIN = "admin"


class UserInDB(BaseModel):
    directory_id: str = Field(..., description="UMD Directory ID (unique identifier)")
    password_hash: str = Field(..., description="Bcrypt hashed password")
    email: EmailStr = Field(..., description="User email address")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = Field(default=UserRole.PARTICIPANT)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "directory_id": "118123456",
                "password_hash": "$2b$12$...",
                "email": "student@umd.edu",
                "first_name": "John",
                "last_name": "Doe",
                "role": "participant",
                "is_active": True
            }
        }

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class UserPublic(BaseModel):
    directory_id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole

    class Config:
        json_schema_extra = {
            "example": {
                "directory_id": "118123456",
                "email": "student@umd.edu",
                "first_name": "John",
                "last_name": "Doe",
                "role": "participant",
                "is_active": True
            }
        }
