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
    user_email: EmailStr
    status: RegistrationStatus
    waitlist_position: Optional[int] = None
    registered_at: datetime
    
    # Payment fields
    payment_status: Optional[str] = Field(
        default="not_required",
        description="paid | not_required | failed | refunded"
    )
    amount_paid: Optional[float] = Field(
        default=None,
        description="Amount charged to the user (if paid event)"
    )
    payment_transaction_id: Optional[str] = Field(
        default=None,
        description="Payment processor transaction ID"
    )
    payment_timestamp: Optional[datetime] = Field(
        default=None,
        description="When payment was processed"
    )
    payment_method_last4: Optional[str] = Field(
        default=None,
        description="Last 4 digits of payment card"
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