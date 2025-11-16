"""
Registration model for event registrations.
Tracks user registrations and waitlist status.
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class RegistrationStatus(str, Enum):
    REGISTERED = "registered"
    WAITLISTED = "waitlisted"
    CANCELLED = "cancelled"

class Registration(BaseModel):
    registration_id: str = Field(...)
    event_id: str = Field(...)
    user_id: str = Field(...)
    user_email: EmailStr = Field(...)  # 👈 required
    status: RegistrationStatus = Field(default=RegistrationStatus.REGISTERED)
    waitlist_position: Optional[int] = None
    registered_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "registration_id": "reg_123456",
                "event_id": "evt_abc123",
                "user_id": "118123456",
                "user_email": "student@umd.edu",
                "status": "waitlisted",
                "waitlist_position": 5,
                "registered_at": "2025-11-14T10:00:00"
            }
        }