"""
Event request/response schemas for API.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.event import EventCategory, EventStatus


class CreateEventRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[EventCategory] = None
    location: str = Field(..., min_length=1, max_length=200)
    banner: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    registration_open_time: Optional[datetime] = None
    registration_close_time: Optional[datetime] = None
    capacity: int = Field(..., gt=0)
    requested_admin_id: Optional[str] = Field(None, description="Directory ID of admin from whom approval is requested")
    status: EventStatus = Field(EventStatus.DRAFT, description="Event status: draft or pending_approval")

    class Config:
        json_schema_extra = {
            "example": {
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
                "requested_admin_id": "admin"
            }
        }


class UpdateEventRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[EventCategory] = None
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    banner: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    registration_open_time: Optional[datetime] = None
    registration_close_time: Optional[datetime] = None
    capacity: Optional[int] = Field(None, gt=0)
    status: Optional[EventStatus] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Tech Talk: AI in Healthcare (Updated)",
                "capacity": 150,
                "status": "approved"
            }
        }
