"""
Event model representing an event in the database.
Only organizers and admins can create/modify events.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class EventStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class EventCategory(str, Enum):
    ACADEMIC = "academic"
    SPORTS = "sports"
    CULTURAL = "cultural"
    WORKSHOP = "workshop"
    SEMINAR = "seminar"
    SOCIAL = "social"
    CAREER = "career"
    OTHER = "other"


class Event(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, description="Event description")
    category: Optional[EventCategory] = Field(None, description="Event category")
    location: str = Field(..., min_length=1, max_length=200)
    banner: Optional[str] = Field(None, description="URL to event banner image")
    start_time: datetime = Field(..., description="Event start date and time")
    end_time: Optional[datetime] = Field(None, description="Event end date and time")
    registration_open_time: Optional[datetime] = Field(None, description="When registration opens")
    registration_close_time: Optional[datetime] = Field(None, description="When registration closes")
    capacity: int = Field(..., gt=0, description="Maximum number of participants")
    status: EventStatus = Field(default=EventStatus.DRAFT)
    organizer_id: str = Field(..., description="Directory ID of the organizer")
    organizer_email: str = Field(..., description="Email of the organizer for notifications")
    requested_admin_id: Optional[str] = Field(None, description="Directory ID of admin from whom approval is requested")
    requested_admin_email: Optional[str] = Field(None, description="Email of requested admin for approval notifications")
    approved_by_admin_id: Optional[str] = Field(None, description="Directory ID of admin who approved/rejected the event")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # 👇 NEW PAYMENT FIELDS
    is_paid: bool = Field(default=False, description="Whether this event requires payment")
    price: Optional[float] = Field(
        default=None,
        ge=0,
        description="Ticket price if this is a paid event",
    )
    currency: Optional[str] = Field(default="USD", description="Currency code for price")

    status: EventStatus = Field(default=EventStatus.DRAFT)
    organizer_id: str = Field(..., description="Directory ID of the organizer")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "event_id": "evt_123456",
                "title": "Tech Talk: AI in Healthcare",
                "description": "Join us for an exciting discussion about AI applications in healthcare",
                "category": "seminar",
                "location": "Stamp Student Union, Room 2400",
                "banner": "https://example.com/banners/tech-talk.jpg",
                "start_time": "2025-12-01T18:00:00",
                "end_time": "2025-12-01T20:00:00",
                "registration_open_time": "2025-11-20T00:00:00",
                "registration_close_time": "2025-11-30T23:59:59",
                "capacity": 100,
                "status": "draft",
                "organizer_id": "118234567",
                "organizer_email": "organizer@umd.edu",
                "requested_admin_id": "118000001",
                "requested_admin_email": "admin@umd.edu",
                "approved_by_admin_id": None,
                "created_at": "2025-11-14T10:00:00",
                "updated_at": "2025-11-14T10:00:00"
            }
        }

class PaymentRequest(BaseModel):
    card_number: str = Field(..., min_length=12, max_length=19)
    expiry_month: int = Field(..., ge=1, le=12)
    expiry_year: int = Field(..., ge=2024)
    cvc: str = Field(..., min_length=3, max_length=4)