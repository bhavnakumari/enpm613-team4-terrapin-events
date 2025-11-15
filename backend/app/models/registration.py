"""
Registration model for event registrations.
Tracks user registrations and waitlist status.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class RegistrationStatus(str, Enum):
    REGISTERED = "registered"
    WAITLISTED = "waitlisted"
    CANCELLED = "cancelled"


class Registration(BaseModel):
    registration_id: str = Field(..., description="Unique registration identifier")
    event_id: str = Field(..., description="Event being registered for")
    user_id: str = Field(..., description="Directory ID of the user")
    status: RegistrationStatus = Field(default=RegistrationStatus.REGISTERED)
    waitlist_position: Optional[int] = Field(None, description="Position in waitlist (null if registered)")
    registered_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "registration_id": "reg_123456",
                "event_id": "evt_abc123",
                "user_id": "118123456",
                "status": "waitlisted",
                "waitlist_position": 5,
                "registered_at": "2025-11-14T10:00:00"
            }
        }
