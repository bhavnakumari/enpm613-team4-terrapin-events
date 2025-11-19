"""
Registration model for event registrations.
Tracks user registrations and waitlist status.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
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
    user_email: str = Field(..., description="Email of the registered user")
    status: RegistrationStatus = Field(default=RegistrationStatus.REGISTERED)
    waitlist_position: Optional[int] = Field(None, description="Position in waitlist (null if registered)")
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


class NotificationData(BaseModel):
    """Data needed for sending email notifications"""
    email: str = Field(..., description="Recipient email address")
    user_id: str = Field(..., description="User directory ID")
    notification_type: str = Field(..., description="Type of notification (registered, waitlisted, promoted, cancelled)")


class RegistrationWithNotifications(BaseModel):
    """Registration response with notification data"""
    registration: Registration
    notifications_to_send: List[NotificationData] = Field(default_factory=list, description="List of notifications to send")
