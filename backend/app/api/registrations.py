"""
Registration endpoints.
Users can register for events.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import secrets

from app.database import get_db
from app.models.registration import Registration, RegistrationStatus
from app.models.event import Event
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/events", tags=["Registrations"])


@router.post("/{event_id}/register", response_model=Registration, status_code=status.HTTP_201_CREATED)
async def register_for_event(
    event_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Register for an event.
    
    Automatically handles:
    - Registration validation (event status, time window, capacity)
    - Waitlisting when event is full
    - Duplicate registration prevention
    
    Returns:
        Registration object with status (registered or waitlisted)
    """
    # Check if event exists
    event_doc = await db.events.find_one({"event_id": event_id})
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )
    
    event = Event(**event_doc)
    
    # Check if event is approved
    if event.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot register for events that are not approved"
        )
    
    # Check registration window
    current_time = datetime.utcnow()
    
    if event.registration_open_time and current_time < event.registration_open_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration has not opened yet"
        )
    
    if event.registration_close_time and current_time > event.registration_close_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration has closed"
        )
    
    # Check if user already registered
    existing_registration = await db.registrations.find_one({
        "event_id": event_id,
        "user_id": user["directory_id"],
        "status": {"$in": ["registered", "waitlisted"]}
    })
    
    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already registered for this event"
        )
    
    # Count current registrations (not waitlisted or cancelled)
    registered_count = await db.registrations.count_documents({
        "event_id": event_id,
        "status": "registered"
    })
    
    # Determine registration status and waitlist position
    registration_status = RegistrationStatus.REGISTERED
    waitlist_position = None
    
    if registered_count >= event.capacity:
        registration_status = RegistrationStatus.WAITLISTED
        # Calculate waitlist position (count existing waitlisted users + 1)
        waitlisted_count = await db.registrations.count_documents({
            "event_id": event_id,
            "status": "waitlisted"
        })
        waitlist_position = waitlisted_count + 1
    
    # Generate unique registration ID
    registration_id = f"reg_{secrets.token_hex(6)}"
    
    # Create registration
    registration = Registration(
        registration_id=registration_id,
        event_id=event_id,
        user_id=user["directory_id"],
        user_email=user["email"],
        status=registration_status,
        waitlist_position=waitlist_position,
        registered_at=datetime.utcnow()
    )
    
    # Insert into database
    await db.registrations.insert_one(registration.model_dump())
    
    return registration


@router.get("/{event_id}/registrations", response_model=list[Registration])
async def get_event_registrations(
    event_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    event_doc = await db.events.find_one({"event_id": event_id})
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )
    
    event = Event(**event_doc)
    
    # Authorization: Only organizer of this event or admin can view registrations
    if user["role"] != "admin" and user["directory_id"] != event.organizer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the event organizer or admin can view registrations"
        )
    
    # Fetch all registrations for this event
    registrations = []
    cursor = db.registrations.find({"event_id": event_id}).sort("registered_at", 1)
    
    async for reg_doc in cursor:
        registrations.append(Registration(**reg_doc))
    
    return registrations


@router.get("/registrations/my-registrations", response_model=list[Registration])
async def get_my_registrations(
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Fetch all registrations for this user
    registrations = []
    cursor = db.registrations.find({
        "user_id": user["directory_id"],
        "status": {"$in": ["registered", "waitlisted"]}  # Exclude cancelled
    }).sort("registered_at", -1)  # Most recent first
    
    async for reg_doc in cursor:
        registrations.append(Registration(**reg_doc))
    
    return registrations


@router.delete("/{event_id}/register", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_registration(
    event_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Cancel registration for an event.
    
    Automatically handles:
    - Marking registration as cancelled
    - Promoting first waitlisted person if a spot opens up
    - Updating waitlist positions for remaining people
    
    Logic:
    - If user was REGISTERED: Promote person at waitlist position 1
    - If user was WAITLISTED: Decrement positions for people after them
    """
    # Find user's active registration
    registration_doc = await db.registrations.find_one({
        "event_id": event_id,
        "user_id": user["directory_id"],
        "status": {"$in": ["registered", "waitlisted"]}
    })
    
    if not registration_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active registration found for this event"
        )
    
    registration = Registration(**registration_doc)
    
    # Mark registration as cancelled
    await db.registrations.update_one(
        {"registration_id": registration.registration_id},
        {"$set": {"status": "cancelled", "waitlist_position": None}}
    )
    
    # If user was REGISTERED, promote first waitlisted person
    if registration.status == RegistrationStatus.REGISTERED:
        # Find first person in waitlist (position 1)
        first_waitlisted = await db.registrations.find_one({
            "event_id": event_id,
            "status": "waitlisted",
            "waitlist_position": 1
        })
        
        if first_waitlisted:
            # NOTIFICATION: Person being promoted from waitlist (user_email available)
            promoted_email = first_waitlisted.get("user_email")
            
            # Promote to registered
            await db.registrations.update_one(
                {"registration_id": first_waitlisted["registration_id"]},
                {"$set": {
                    "status": "registered",
                    "waitlist_position": None
                }}
            )
            
            # Update all remaining waitlist positions (decrement by 1)
            waitlist_cursor = db.registrations.find({
                "event_id": event_id,
                "status": "waitlisted",
                "waitlist_position": {"$gt": 1}
            })
            
            async for waitlist_reg in waitlist_cursor:
                await db.registrations.update_one(
                    {"registration_id": waitlist_reg["registration_id"]},
                    {"$set": {"waitlist_position": waitlist_reg["waitlist_position"] - 1}}
                )
    
    # If user was WAITLISTED, update positions for people after them
    elif registration.status == RegistrationStatus.WAITLISTED:
        # Find all waitlisted people after this user
        waitlist_cursor = db.registrations.find({
            "event_id": event_id,
            "status": "waitlisted",
            "waitlist_position": {"$gt": registration.waitlist_position}
        })
        
        async for waitlist_reg in waitlist_cursor:
            await db.registrations.update_one(
                {"registration_id": waitlist_reg["registration_id"]},
                {"$set": {"waitlist_position": waitlist_reg["waitlist_position"] - 1}}
            )
    
    return None
