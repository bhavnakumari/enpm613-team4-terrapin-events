# app/models/feedback.py
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, EmailStr


class Feedback(BaseModel):
    """
    Stored event feedback from a participant.
    """
    feedback_id: str = Field(..., description="Unique feedback identifier")
    event_id: str = Field(..., description="ID of the event this feedback belongs to")
    user_id: str = Field(..., description="Directory ID of the user who submitted the feedback")
    user_email: EmailStr = Field(..., description="Email of the user who submitted the feedback")
    rating: int = Field(..., ge=1, le=5, description="Star rating from 1 to 5")
    comment: Optional[str] = Field(None, max_length=2000, description="Optional free-text comment")
    tags: List[str] = Field(default_factory=list, description="Optional list of feedback tags")
    is_anonymous: bool = Field(False, description="If true, UI may hide user identity")
    created_at: datetime = Field(..., description="Timestamp when feedback was submitted")