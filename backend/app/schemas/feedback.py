# app/schemas/feedback.py
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CreateFeedbackRequest(BaseModel):
    """
    Request body when a participant submits feedback.
    """
    rating: int = Field(..., ge=1, le=5, description="Star rating from 1 to 5")
    comment: Optional[str] = Field(None, max_length=2000)
    tags: List[str] = Field(
        default_factory=list,
        description="Optional tags like ['Informative', 'Organized', 'Fun']",
    )
    is_anonymous: bool = Field(
        default=False,
        description="If true, frontend should hide name when displaying feedback",
    )


class FeedbackResponse(BaseModel):
    """
    What we return to the UI for each feedback item.
    If anonymous, we omit user identity fields.
    """
    feedback_id: str
    event_id: str
    rating: int
    comment: Optional[str]
    tags: List[str]
    created_at: datetime
    # These will be None in response if is_anonymous=True
    user_id: Optional[str] = None
    user_email: Optional[str] = None


class FeedbackSummary(BaseModel):
    """
    Aggregated stats for an event.
    """
    event_id: str
    total_feedback: int
    average_rating: Optional[float]
    rating_counts: dict[int, int] = Field(
        default_factory=dict,
        description="Counts by rating, e.g., {5: 10, 4: 3, 3: 1}",
    )