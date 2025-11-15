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
from app.utils.security import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/events", tags=["Events"])
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Extract and validate user from JWT token."""
    token = credentials.credentials
    token_data = decode_access_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get full user info from database
    user = await db.users.find_one({"directory_id": token_data.directory_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


async def require_organizer_or_admin(user: dict = Depends(get_current_user)):
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
    # Generate unique event ID
    event_id = f"evt_{secrets.token_hex(6)}"
    
    # Create event document
    event = Event(
        event_id=event_id,
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        location=event_data.location,
        banner=event_data.banner,
        start_time=event_data.start_time,
        end_time=event_data.end_time,
        capacity=event_data.capacity,
        status=EventStatus.DRAFT,
        organizer_id=user["directory_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Insert into database
    await db.events.insert_one(event.model_dump())
    
    return event


@router.get("/", response_model=list[Event])
async def get_all_events(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    events = []
    cursor = db.events.find({})
    
    async for event_doc in cursor:
        events.append(Event(**event_doc))
    
    return events


@router.get("/{event_id}", response_model=Event)
async def get_event_by_id(
    event_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
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
    event_doc = await db.events.find_one({"event_id": event_id})
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )
    
    # Prepare update data (only include fields that were provided)
    update_fields = update_data.model_dump(exclude_unset=True)
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Check if trying to update status
    if "status" in update_fields:
        if user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can change event status"
            )
    
    # Always update the updated_at timestamp
    update_fields["updated_at"] = datetime.utcnow()
    
    # Update in database
    await db.events.update_one(
        {"event_id": event_id},
        {"$set": update_fields}
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
    event_doc = await db.events.find_one({"event_id": event_id})
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )
    
    # Delete the event
    result = await db.events.delete_one({"event_id": event_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete event"
        )
    
    return None
