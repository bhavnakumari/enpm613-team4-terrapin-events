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


class AcademicYear(str, Enum):
    FRESHMAN = "freshman"
    SOPHOMORE = "sophomore"
    JUNIOR = "junior"
    SENIOR = "senior"
    GRADUATE = "graduate"
    FACULTY = "faculty"
    STAFF = "staff"


class UserInDB(BaseModel):
    directory_id: str = Field(..., description="UMD Directory ID (unique identifier)")
    password_hash: str = Field(..., description="Bcrypt hashed password")
    email: EmailStr = Field(..., description="User email address")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = Field(default=UserRole.PARTICIPANT)
    
    # University-specific profile fields (optional, editable)
    major: Optional[str] = Field(None, max_length=100, description="Academic major/department")
    year: Optional[AcademicYear] = Field(None, description="Academic year or affiliation")
    pronouns: Optional[str] = Field(None, max_length=50, description="Preferred pronouns")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    address: Optional[str] = Field(None, max_length=500, description="Mailing address")
    bio: Optional[str] = Field(None, max_length=500, description="Short bio or description")
    
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
                "major": "Computer Science",
                "year": "junior",
                "pronouns": "he/him",
                "phone": "+1-301-555-0123",
                "address": "1234 Campus Drive, College Park, MD 20742",
                "bio": "CS student interested in web development and AI"
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
    major: Optional[str] = None
    year: Optional[AcademicYear] = None
    pronouns: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "directory_id": "118123456",
                "email": "student@umd.edu",
                "first_name": "John",
                "last_name": "Doe",
                "role": "participant",
                "major": "Computer Science",
                "year": "junior",
                "pronouns": "he/him",
                "phone": "+1-301-555-0123",
                "address": "1234 Campus Drive, College Park, MD 20742",
                "bio": "CS student interested in web development and AI"
            }
        }
