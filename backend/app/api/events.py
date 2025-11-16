"""
Event management endpoints.
Only organizers and admins can create/modify events.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import secrets

from app.database import get_db
from app.schemas.event import CreateEventRequest, UpdateEventRequest
from app.models.event import Event, EventStatus
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/events", tags=["Events"])


async def require_organizer_or_admin(user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency that ensures the current user has organizer or admin role.
    
    Raises:
        HTTPException: 403 if user is not organizer or admin
    """
    if user["role"] not in ["organizer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organizers and admins can manage events"
        )
    return user


@router.post("/", response_model=Event, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: CreateEventRequest,
    user: dict = Depends(require_organizer_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Create a new event.
    
    Only organizers and admins can create events.
    Organizers can optionally specify which admin should review their event.
    New events start with status=DRAFT.
    """
    # Validate requested admin exists if provided
    if event_data.requested_admin_id:
        admin_user = await db.users.find_one({"directory_id": event_data.requested_admin_id})
        if not admin_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Admin with directory ID '{event_data.requested_admin_id}' not found"
            )
        if admin_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User '{event_data.requested_admin_id}' is not an admin"
            )
    
    # Validate time constraints
    if event_data.end_time <= event_data.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event end time must be after start time"
        )
    
    if event_data.registration_open_time and event_data.registration_close_time:
        if event_data.registration_close_time <= event_data.registration_open_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration close time must be after registration open time"
            )
    
    # Generate unique event ID
    event_id = f"evt_{secrets.token_hex(6)}"
    
    # Create event document
    current_time = datetime.utcnow()
    event = Event(
        event_id=event_id,
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        location=event_data.location,
        banner=event_data.banner,
        start_time=event_data.start_time,
        end_time=event_data.end_time,
        registration_open_time=event_data.registration_open_time,
        registration_close_time=event_data.registration_close_time,
        capacity=event_data.capacity,
        status=EventStatus.DRAFT,
        organizer_id=user["directory_id"],
        requested_admin_id=event_data.requested_admin_id,
        approved_by_admin_id=None,
        created_at=current_time,
        updated_at=current_time
    )
    
    # Insert into database
    await db.events.insert_one(event.model_dump())
    
    return event


@router.get("/", response_model=list[Event])
async def get_all_events(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get all events (public endpoint).
    
    Returns all events sorted by start time (newest first).
    """
    events = []
    cursor = db.events.find({}).sort("start_time", -1)
    
    async for event_doc in cursor:
        events.append(Event(**event_doc))
    
    return events


@router.get("/{event_id}", response_model=Event)
async def get_event_by_id(
    event_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get a specific event by ID (public endpoint).
    
    Args:
        event_id: Unique event identifier
        
    Returns:
        Event details
    """
    event_doc = await db.events.find_one({"event_id": event_id})
    
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )
    
    return Event(**event_doc)


@router.patch("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    update_data: UpdateEventRequest,
    user: dict = Depends(require_organizer_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Update an existing event.
    
    Organizers can update their own events (except status).
    Only admins can change event status (approve/reject).
    """
    # Fetch existing event
    event_doc = await db.events.find_one({"event_id": event_id})
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )
    
    # Check ownership (organizers can only edit their own events)
    if user["role"] == "organizer" and event_doc["organizer_id"] != user["directory_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own events"
        )
    
    # Prepare update data (only include fields that were provided)
    update_fields = update_data.model_dump(exclude_unset=True)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Check if trying to update status (only admins can do this)
    if "status" in update_fields:
        if user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can change event status"
            )
        # Track which admin approved/rejected the event
        if update_fields["status"] in ["approved", "rejected"]:
            update_fields["approved_by_admin_id"] = user["directory_id"]
    
    # Always update the updated_at timestamp
    update_fields["updated_at"] = datetime.utcnow()
    
    # Update in database
    result = await db.events.update_one(
        {"event_id": event_id},
        {"$set": update_fields}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Fetch and return updated event
    updated_event = await db.events.find_one({"event_id": event_id})
    return Event(**updated_event)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    user: dict = Depends(require_organizer_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Delete an event.
    
    Organizers can delete their own events.
    Admins can delete any event.
    Also deletes all associated registrations.
    """
    # Fetch existing event
    event_doc = await db.events.find_one({"event_id": event_id})
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )
    
    # Check ownership (organizers can only delete their own events)
    if user["role"] == "organizer" and event_doc["organizer_id"] != user["directory_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own events"
        )
    
    # Delete all registrations for this event
    await db.registrations.delete_many({"event_id": event_id})
    
    # Delete the event
    result = await db.events.delete_one({"event_id": event_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete event"
        )
    
    return None
