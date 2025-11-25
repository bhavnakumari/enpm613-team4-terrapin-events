"""
Event management endpoints.
Only organizers and admins can create/modify events.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
import secrets
import logging

from app.database import get_db
from app.schemas.event import CreateEventRequest, UpdateEventRequest
from app.models.event import Event, EventStatus
from app.utils.security import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.api.auth import get_current_user  

router = APIRouter(prefix="/api/events", tags=["Events"])
security = HTTPBearer()
logger = logging.getLogger(__name__)

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

async def require_admin(user: dict = Depends(get_current_user)):
    """Allow only admins to perform this action."""
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can approve or reject events"
        )
    return user

@router.post("", response_model=Event, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: CreateEventRequest,
    user: dict = Depends(require_organizer_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Create a new event.
    
    Only organizers and admins can create events.
    Status can be:
    - 'draft': Save for later (default)
    - 'pending_approval': Submit for admin review immediately
    """
    # Validate requested admin exists if provided and get admin email
    requested_admin_email = None
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
        requested_admin_email = admin_user["email"]
    
    # Validate time constraints
    if event_data.end_time and event_data.end_time <= event_data.start_time:
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
    current_time = datetime.now(timezone.utc)
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
        status=event_data.status,
        organizer_id=user["directory_id"],
        organizer_email=user["email"],
        requested_admin_id=event_data.requested_admin_id,
        requested_admin_email=requested_admin_email,
        approved_by_admin_id=None,
        created_at=current_time,
        updated_at=current_time,
        is_paid=event_data.is_paid,
        price=event_data.price,
        currency=event_data.currency
    )
    
    # Insert into database
    await db.events.insert_one(event.model_dump())
    
    return event


@router.get("/catalog")
async def get_events_catalog(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Get events catalog with registration statistics and user registration status.
    Optimized single-query endpoint using MongoDB aggregation pipeline.
    
    Returns:
        List of approved events with:
        - attendee_count: Number of confirmed registrations
        - is_user_registered: Whether current user is registered
        - user_registration_status: User's registration status (if registered)
    """
    pipeline = [
        {"$match": {"status": "approved"}},
        {
            "$lookup": {
                "from": "registrations",
                "let": {"event_id": "$event_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$event_id", "$$event_id"]},
                                    {"$eq": ["$status", "registered"]}
                                ]
                            }
                        }
                    },
                    {"$count": "count"}
                ],
                "as": "registration_stats"
            }
        },
        {
            "$lookup": {
                "from": "registrations",
                "let": {"event_id": "$event_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$event_id", "$$event_id"]},
                                    {"$eq": ["$user_id", user["directory_id"]]},
                                    {"$in": ["$status", ["registered", "waitlisted"]]}
                                ]
                            }
                        }
                    }
                ],
                "as": "user_registration"
            }
        },
        {
            "$addFields": {
                "attendee_count": {
                    "$ifNull": [{"$arrayElemAt": ["$registration_stats.count", 0]}, 0]
                },
                "is_user_registered": {"$gt": [{"$size": "$user_registration"}, 0]},
                "user_registration_status": {
                    "$arrayElemAt": ["$user_registration.status", 0]
                }
            }
        },
        {"$project": {"_id": 0, "registration_stats": 0, "user_registration": 0}},
        {"$sort": {"start_time": 1}}
    ]
    
    events = await db.events.aggregate(pipeline).to_list(None)
    return events


@router.get("/categories/stats")
async def get_category_stats(db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Get event count statistics by category for approved events.
    Optimized endpoint to avoid fetching full event objects when only counts are needed.
    
    Returns:
        List of category counts: [{"category": "academic", "count": 15}, ...]
    """
    pipeline = [
        {"$match": {"status": "approved"}},
        {"$group": {
            "_id": "$category",
            "count": {"$sum": 1}
        }},
        {"$project": {
            "category": "$_id",
            "count": 1,
            "_id": 0
        }},
        {"$sort": {"category": 1}}
    ]
    
    stats = await db.events.aggregate(pipeline).to_list(None)
    return stats


@router.get("/my-events")
async def get_my_events(
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get all events created by the current organizer.
    Returns events with all statuses (draft, pending_approval, approved, rejected, cancelled).
    """
    events = []
    cursor = db.events.find(
        {"organizer_id": user["directory_id"]}
    ).sort("created_at", -1)
    
    async for event_doc in cursor:
        events.append(Event(**event_doc).model_dump())
    
    return events


@router.get("/admin/pending-events")
async def get_pending_events(
    user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Admin-only endpoint to get events awaiting approval with organizer details.
    Returns events with status=pending_approval.
    Optimized for admin approval workflow.
    
    Returns:
        List of events with organizer_info embedded
    """
    pipeline = [
        {"$match": {"status": "pending_approval"}},
        {
            "$lookup": {
                "from": "users",
                "localField": "organizer_id",
                "foreignField": "directory_id",
                "as": "organizer_info"
            }
        },
        {"$unwind": {
            "path": "$organizer_info",
            "preserveNullAndEmptyArrays": True
        }},
        {
            "$addFields": {
                "organizer_name": {
                    "$concat": [
                        {"$ifNull": ["$organizer_info.first_name", ""]},
                        " ",
                        {"$ifNull": ["$organizer_info.last_name", ""]}
                    ]
                },
                "organizer_department": {"$ifNull": ["$organizer_info.major", "N/A"]}
            }
        },
        {"$project": {
            "_id": 0,
            "organizer_info._id": 0,
            "organizer_info.password_hash": 0
        }},
        {"$sort": {"created_at": 1}}  # Oldest submissions first
    ]
    
    events = await db.events.aggregate(pipeline).to_list(None)
    return events


@router.get("", response_model=list[Event])
async def get_all_events(
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Return all events in the system.
    Drops Mongo _id and safely converts to Event models.
    Any malformed events are logged and skipped instead of causing 500.
    """
    events: list[Event] = []

    # Drop Mongo's internal _id field to avoid schema mismatch
    cursor = db.events.find({}, {"_id": 0})

    async for event_doc in cursor:
        try:
            events.append(Event(**event_doc))
        except Exception as e:
            # Log and skip bad docs instead of crashing
            logger.error(
                "Failed to parse event from DB (event_id=%s): %s",
                event_doc.get("event_id"),
                e,
            )
            continue

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
    
    # Validate time constraints if being updated
    if "end_time" in update_fields and "start_time" not in update_fields:
        # Check against existing start_time
        if update_fields["end_time"] <= event_doc["start_time"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event end time must be after start time"
            )
    
    if "start_time" in update_fields and "end_time" in update_fields:
        if update_fields["end_time"] <= update_fields["start_time"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event end time must be after start time"
            )
    
    # Check if trying to update status
    if "status" in update_fields:
        current_status = event_doc["status"]
        new_status = update_fields["status"]
        
        # Organizers can change draft → pending_approval (submitting for review)
        if user["role"] == "organizer":
            if current_status == "draft" and new_status == "pending_approval":
                # Allow organizers to submit their drafts
                pass
            else:
                # Organizers cannot change any other status
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only admins can change event status"
                )
        
        # Admins can change any status
        if user["role"] == "admin":
            # Track which admin approved/rejected the event
            if new_status in ["approved", "rejected"]:
                update_fields["approved_by_admin_id"] = user["directory_id"]
    
    # Handle capacity decrease - move excess registered users to waitlist
    if "capacity" in update_fields:
        new_capacity = update_fields["capacity"]
        current_capacity = event_doc["capacity"]
        
        # Only rebalance if capacity is being decreased
        if new_capacity < current_capacity:
            # Count current registered users
            registered_count = await db.registrations.count_documents({
                "event_id": event_id,
                "status": "registered"
            })
            
            # If registered users exceed new capacity, move excess to waitlist
            if registered_count > new_capacity:
                # Get all registered users sorted by registration time (earliest first)
                registered_users = await db.registrations.find(
                    {"event_id": event_id, "status": "registered"}
                ).sort("registered_at", 1).to_list(None)
                
                # Keep first 'new_capacity' users as registered, move rest to waitlist
                users_to_keep = registered_users[:new_capacity]
                users_to_waitlist = registered_users[new_capacity:]
                
                # Get current max waitlist position
                max_waitlist = await db.registrations.find_one(
                    {"event_id": event_id, "status": "waitlisted"},
                    sort=[("waitlist_position", -1)]
                )
                next_position = (max_waitlist["waitlist_position"] if max_waitlist else 0) + 1
                
                # Bulk move excess users to waitlist with proper positioning
                from pymongo import UpdateOne
                bulk_updates = [
                    UpdateOne(
                        {"registration_id": user_reg["registration_id"]},
                        {"$set": {
                            "status": "waitlisted",
                            "waitlist_position": next_position + idx
                        }}
                    )
                    for idx, user_reg in enumerate(users_to_waitlist)
                ]
                
                if bulk_updates:
                    await db.registrations.bulk_write(bulk_updates)
    
    # Always update the updated_at timestamp
    update_fields["updated_at"] = datetime.now(timezone.utc)
    
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
    if not updated_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found after update"
        )
    return Event(**updated_event)


@router.post("/{event_id}/submit", response_model=Event)
async def submit_event_for_approval(
    event_id: str,
    user: dict = Depends(require_organizer_or_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Submit a draft event for admin approval.
    Changes status from DRAFT → PENDING_APPROVAL.
    
    Only the event organizer or admin can submit.
    """
    # Fetch event
    event_doc = await db.events.find_one({"event_id": event_id})
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )

    event = Event(**event_doc)

    # Authorization: Only organizer or admin
    if user["role"] != "admin" and user["directory_id"] != event.organizer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the event organizer or admin can submit this event"
        )

    # Validate current status
    if event.status != EventStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only draft events can be submitted. Current status: {event.status}"
        )

    # Update status to pending_approval
    await db.events.update_one(
        {"event_id": event_id},
        {"$set": {
            "status": EventStatus.PENDING_APPROVAL,
            "updated_at": datetime.now(timezone.utc)
        }}
    )

    updated_doc = await db.events.find_one({"event_id": event_id})
    if not updated_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found after update"
        )
    
    logger.info(f"Event {event_id} submitted for approval by {user['directory_id']}")
    return Event(**updated_doc)


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


@router.get("/admin/stats")
async def get_admin_stats(
    user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get comprehensive admin statistics.
    
    Returns:
        - Total events count
        - Events by status (pending, approved, rejected, draft)
        - Total registrations
        - Active users count
        - Recent activity (recent approvals/rejections)
        - Upcoming approved events with registration stats
    """
    # Get total events and counts by status
    total_events = await db.events.count_documents({})
    pending_count = await db.events.count_documents({"status": "pending_approval"})
    approved_count = await db.events.count_documents({"status": "approved"})
    rejected_count = await db.events.count_documents({"status": "rejected"})
    draft_count = await db.events.count_documents({"status": "draft"})
    
    # Get total registrations
    total_registrations = await db.registrations.count_documents({})
    
    # Get active users (users who have registered for at least one event)
    active_users_pipeline = [
        {"$group": {"_id": "$user_id"}},
        {"$count": "count"}
    ]
    active_users_result = await db.registrations.aggregate(active_users_pipeline).to_list(1)
    active_users = active_users_result[0]["count"] if active_users_result else 0
    
    # Get recent activity (last 10 approved/rejected events)
    recent_activity_pipeline = [
        {
            "$match": {
                "status": {"$in": ["approved", "rejected"]},
                "updated_at": {"$exists": True}
            }
        },
        {"$sort": {"updated_at": -1}},
        {"$limit": 10},
        {
            "$project": {
                "_id": 0,
                "event_id": 1,
                "title": 1,
                "status": 1,
                "updated_at": 1
            }
        }
    ]
    recent_activity = await db.events.aggregate(recent_activity_pipeline).to_list(10)
    
    # Get upcoming approved events with registration stats
    # Get all approved events first, then filter in Python for better debugging
    all_approved_pipeline = [
        {
            "$match": {
                "status": "approved"
            }
        },
        {"$sort": {"start_time": 1}},
        {
            "$lookup": {
                "from": "registrations",
                "localField": "event_id",
                "foreignField": "event_id",
                "as": "registrations"
            }
        },
        {
            "$project": {
                "_id": 0,
                "event_id": 1,
                "title": 1,
                "start_time": 1,
                "capacity": 1,
                "registrations_count": {"$size": "$registrations"}
            }
        }
    ]
    all_approved_events = await db.events.aggregate(all_approved_pipeline).to_list(None)
    
    logger.info(f"Total approved events found: {len(all_approved_events)}")
    
    # Filter for upcoming events in Python (more reliable than MongoDB string comparison)
    current_time = datetime.now(timezone.utc)
    upcoming_events = []
    for event in all_approved_events:
        try:
            start_time_value = event['start_time']
            
            # Handle different start_time formats
            if isinstance(start_time_value, datetime):
                # Already a datetime object
                event_start = start_time_value
            elif isinstance(start_time_value, (int, float)):
                # Unix timestamp
                event_start = datetime.fromtimestamp(start_time_value)
            elif isinstance(start_time_value, str):
                # ISO format string
                event_start = datetime.fromisoformat(start_time_value.replace('Z', '+00:00'))
            else:
                logger.warning(f"Unknown start_time format for event {event.get('event_id')}: {type(start_time_value)}")
                continue
            
            logger.debug(f"Event {event.get('event_id')}: start_time={start_time_value}, parsed={event_start}, current={current_time}, is_future={event_start > current_time}")
            
            if event_start > current_time:
                # Convert datetime to ISO string for JSON serialization
                event['start_time'] = event_start.isoformat()
                upcoming_events.append(event)
                if len(upcoming_events) >= 10:
                    break
        except Exception as e:
            logger.warning(f"Failed to parse start_time for event {event.get('event_id')}: {e}")
            continue
    
    logger.info(f"Found {len(upcoming_events)} upcoming events out of {len(all_approved_events)} approved events")
    logger.info(f"Upcoming events sample: {upcoming_events[:2] if upcoming_events else 'None'}")
    
    return {
        "total_events": total_events,
        "pending_approval": pending_count,
        "approved": approved_count,
        "rejected": rejected_count,
        "draft": draft_count,
        "total_registrations": total_registrations,
        "active_users": active_users,
        "recent_activity": recent_activity,
        "upcoming_events": upcoming_events
    }
