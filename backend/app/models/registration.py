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
    registration_id: str
    event_id: str
    user_id: str
    user_email: EmailStr         # <-- REQUIRED
    status: RegistrationStatus
    waitlist_position: Optional[int]
    registered_at: datetime

    payment_status: Optional[str]
    amount_paid: Optional[float]
    # 👇 NEW PAYMENT FIELDS
    payment_status: Optional[str] = Field(
        default=None,
        description="paid / not_required / failed"
    )
    amount_paid: Optional[float] = Field(
        default=None,
        description="Amount charged to the user (if paid event)"
    )

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