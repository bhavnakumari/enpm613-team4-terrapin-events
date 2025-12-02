# app/api/feedback.py
from datetime import datetime, timezone
import secrets
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.models.event import Event
from app.models.feedback import Feedback
from app.schemas.feedback import (
    CreateFeedbackRequest,
    FeedbackResponse,
    FeedbackSummary,
)
from app.api.auth import get_current_user  # existing helper

router = APIRouter(prefix="/api/events", tags=["Feedback"])


async def _get_event_or_404(event_id: str, db: AsyncIOMotorDatabase) -> Event:
    event_doc = await db.events.find_one({"event_id": event_id})
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found",
        )
    return Event(**event_doc)


async def _ensure_user_attended_event(
    event_id: str, user_id: str, db: AsyncIOMotorDatabase
) -> None:
    """
    Ensure the user has a registration for the event (registered or attended).
    """
    registration_doc = await db.registrations.find_one(
        {
            "event_id": event_id,
            "user_id": user_id,
            "status": {"$in": ["registered", "waitlisted"]},
        }
    )
    if not registration_doc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only give feedback for events you registered for",
        )


@router.post(
    "/{event_id}/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_feedback(
    event_id: str,
    body: CreateFeedbackRequest,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Participant submits feedback for an event.
    Rules:
      - Event must exist
      - Event must have ended
      - User must be registered for the event
      - One feedback per user per event (simple rule)
    """

    # 1. Ensure event exists & has ended
    event = await _get_event_or_404(event_id, db)

    if event.end_time:
        now = datetime.now(timezone.utc)
        end_time = event.end_time
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
        if now < end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback can only be submitted after the event has ended",
            )

    # 2. Ensure user attended / registered
    await _ensure_user_attended_event(event_id, user["directory_id"], db)

    # 3. Optional: prevent multiple feedback submissions by same user
    existing = await db.feedback.find_one(
        {"event_id": event_id, "user_id": user["directory_id"]}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted feedback for this event",
        )

    # 4. Build Feedback model
    feedback_id = f"fb_{secrets.token_hex(6)}"
    now = datetime.now(timezone.utc)

    feedback = Feedback(
        feedback_id=feedback_id,
        event_id=event_id,
        user_id=user["directory_id"],
        user_email=user["email"],
        rating=body.rating,
        comment=body.comment,
        tags=body.tags,
        is_anonymous=body.is_anonymous,
        created_at=now,
    )

    await db.feedback.insert_one(feedback.model_dump())

    # 5. Build response (hide user identity if anonymous)
    return FeedbackResponse(
        feedback_id=feedback.feedback_id,
        event_id=feedback.event_id,
        rating=feedback.rating,
        comment=feedback.comment,
        tags=feedback.tags,
        created_at=feedback.created_at,
        user_id=None if feedback.is_anonymous else feedback.user_id,
        user_email=None if feedback.is_anonymous else feedback.user_email,
    )


@router.get(
    "/{event_id}/feedback",
    response_model=List[FeedbackResponse],
)
async def list_feedback_for_event(
    event_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    List feedback for a given event.
    For now:
      - Admins can see all feedback
      - Organizers can see feedback for their own events
      - Regular users can see feedback but with anonymized identities
    """

    event = await _get_event_or_404(event_id, db)

    # Check permissions for full access
    can_see_identity = False
    if user["role"] == "admin":
        can_see_identity = True
    elif user["role"] == "organizer" and event.organizer_id == user["directory_id"]:
        can_see_identity = True

    feedback_cursor = db.feedback.find({"event_id": event_id})
    results: list[FeedbackResponse] = []

    async for doc in feedback_cursor:
        fb = Feedback(**doc)
        results.append(
            FeedbackResponse(
                feedback_id=fb.feedback_id,
                event_id=fb.event_id,
                rating=fb.rating,
                comment=fb.comment,
                tags=fb.tags,
                created_at=fb.created_at,
                user_id=fb.user_id if (can_see_identity and not fb.is_anonymous) else None,
                user_email=fb.user_email if (can_see_identity and not fb.is_anonymous) else None,
            )
        )

    return results


@router.get(
    "/{event_id}/feedback/summary",
    response_model=FeedbackSummary,
)
async def get_feedback_summary(
    event_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Aggregate feedback for event dashboard.
    Only admins or the organizer of that event can see the summary.
    """

    event = await _get_event_or_404(event_id, db)

    if user["role"] != "admin" and not (
        user["role"] == "organizer" and event.organizer_id == user["directory_id"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or the organizer of this event can view feedback summary",
        )

    cursor = db.feedback.find({"event_id": event_id})
    total = 0
    rating_sum = 0
    rating_counts: dict[int, int] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}

    async for doc in cursor:
        fb = Feedback(**doc)
        total += 1
        rating_sum += fb.rating
        rating_counts[fb.rating] = rating_counts.get(fb.rating, 0) + 1

    avg = rating_sum / total if total > 0 else None

    return FeedbackSummary(
        event_id=event_id,
        total_feedback=total,
        average_rating=avg,
        rating_counts=rating_counts,
    )