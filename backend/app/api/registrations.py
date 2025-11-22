"""
Registration endpoints.
Users can register for events.
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field
from fastapi.responses import HTMLResponse
from app.utils.ticket import generate_ticket_qr_data, format_event_datetime
from app.utils.email import load_template  # we already had this loader for email templates
import secrets

from app.database import get_db
from app.models.registration import Registration, RegistrationStatus
from app.models.event import Event
from app.utils.email import (
    send_registration_email,
    send_cancellation_email,
    send_waitlist_promotion_email,
)
from app.api.auth import get_current_user
from fastapi.security import HTTPAuthorizationCredentials  # optional, may be unused

router = APIRouter(prefix="/api/events", tags=["Registrations"])

class PaymentRequest(BaseModel):
    card_number: str = Field(..., min_length=12, max_length=19)
    expiry_month: int = Field(..., ge=1, le=12)
    expiry_year: int = Field(..., ge=2024)
    cvc: str = Field(..., min_length=3, max_length=4)


def _process_mock_payment(payment: PaymentRequest, amount: float) -> bool:
    """
    Fake payment processor: only accepts a single magic test card.

    Magic card (for now):
      - Number: 4242 4242 4242 4242
      - Exp: 12 / 2030
      - CVC: 123
    """
    return (
        payment.card_number.replace(" ", "") == "4242424242424242"
        and payment.expiry_month == 12
        and payment.expiry_year == 2030
        and payment.cvc == "123"
    )

@router.post("/{event_id}/register", response_model=Registration, status_code=status.HTTP_201_CREATED)
async def register_for_event(
    event_id: str,
    background_tasks: BackgroundTasks,
    payment: Optional[PaymentRequest] = None,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Register the current user for an event.
    Handles:
      - event approval and registration window
      - duplicate registrations
      - capacity & waitlist
      - mock payment for paid events
      - confirmation email
    """

    # 1. Check if event exists
    event_doc = await db.events.find_one({"event_id": event_id})
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found",
        )

    event = Event(**event_doc)

    # 2. Check if event is approved
    if event.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot register for events that are not approved",
        )

    # 3. Check registration window (timezone-safe)
    current_time = datetime.now(timezone.utc)

    open_time = event.registration_open_time
    close_time = event.registration_close_time

    if open_time and open_time.tzinfo is None:
        open_time = open_time.replace(tzinfo=timezone.utc)
    if close_time and close_time.tzinfo is None:
        close_time = close_time.replace(tzinfo=timezone.utc)

    if open_time and current_time < open_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration has not opened yet",
        )

    if close_time and current_time > close_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration has closed",
        )

    # 4. Check if user already registered (registered or waitlisted)
    existing_registration = await db.registrations.find_one(
        {
            "event_id": event_id,
            "user_id": user["directory_id"],
            "status": {"$in": ["registered", "waitlisted"]},
        }
    )

    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already registered for this event",
        )

    # 5. Count current confirmed registrations
    registered_count = await db.registrations.count_documents(
        {"event_id": event_id, "status": "registered"}
    )

    # 6. Decide registration status and waitlist position
    registration_status = RegistrationStatus.REGISTERED
    waitlist_position: Optional[int] = None

    if registered_count >= event.capacity:
        registration_status = RegistrationStatus.WAITLISTED
        waitlisted_count = await db.registrations.count_documents(
            {"event_id": event_id, "status": "waitlisted"}
        )
        waitlist_position = waitlisted_count + 1

    # 7. Initialize payment fields to avoid UnboundLocalError
    payment_status: str = "not_required"
    amount_paid: Optional[float] = None

    # 8. Payment logic for paid events (only if user is actually getting a seat)
    is_paid_event = getattr(event, "is_paid", False)
    price = getattr(event, "price", None)

    if (
        is_paid_event
        and price is not None
        and price > 0
        and registration_status == RegistrationStatus.REGISTERED
    ):
        # Paid event and user is confirmed → require payment
        if payment is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment required for this event. Please provide card details.",
            )

        if not _process_mock_payment(payment, price):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Payment failed. Use the test card: "
                    "4242 4242 4242 4242, exp 12/2030, CVC 123."
                ),
            )

        payment_status = "paid"
        amount_paid = price
    else:
        # Free events or waitlisted → no charge now
        payment_status = "not_required"
        amount_paid = None

    # 9. Generate unique registration ID
    registration_id = f"reg_{secrets.token_hex(6)}"

    # 10. Build Registration model (include payment fields)
    registration = Registration(
        registration_id=registration_id,
        event_id=event_id,
        user_id=user["directory_id"],
        user_email=user["email"],  # ✅ ADD THIS LINE
        status=registration_status,
        waitlist_position=waitlist_position,
        registered_at=current_time,
        payment_status=payment_status,
        amount_paid=amount_paid,
    )

    # 11. Insert into database
    await db.registrations.insert_one(registration.model_dump())

    # 12. Send confirmation / waitlist email in the background
    participant_email = user.get("email")
    if participant_email:
        background_tasks.add_task(
            send_registration_email,
            to_email=participant_email,
            event_title=event.title,
            event_start_time=event.start_time,
            event_location=event.location,
            status=registration.status,
        )

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


@router.get("/registrations/my-registrations-with-events")
async def get_my_registrations_with_events(
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get user's registrations with full event details in a single query.
    Optimized endpoint to avoid N+1 query problem.
    """
    pipeline = [
        {
            "$match": {
                "user_id": user["directory_id"],
                "status": {"$in": ["registered", "waitlisted"]}
            }
        },
        {
            "$lookup": {
                "from": "events",
                "localField": "event_id",
                "foreignField": "event_id",
                "as": "event_details"
            }
        },
        {"$unwind": "$event_details"},
        {"$sort": {"registered_at": -1}},
        {"$project": {"_id": 0, "event_details._id": 0}}
    ]
    
    results = await db.registrations.aggregate(pipeline).to_list(None)
    return results


@router.delete("/{event_id}/register", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_registration(
    event_id: str,
    background_tasks: BackgroundTasks,              # ✅ plain injection
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Cancel the current user's registration for an event.
    Adjusts waitlist and sends:
      - cancellation email to the user cancelling
      - waitlist promotion email (if someone moves from WAITLISTED -> REGISTERED)
    """
    # Find active registration
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

    # Get event details for emails
    event_doc = await db.events.find_one({"event_id": event_id})
    event_title = event_doc["title"] if event_doc else "Unknown Event"
    event_start_time = event_doc.get("start_time") if event_doc else None
    event_location = event_doc.get("location") if event_doc else "Unknown location"

    registration = Registration(**registration_doc)

    # 1️⃣ Mark this user's registration as CANCELLED
    await db.registrations.update_one(
        {"registration_id": registration.registration_id},
        {"$set": {"status": "cancelled", "waitlist_position": None}}
    )

    # 2️⃣ If user was REGISTERED → promote first WAITLISTED
    promoted_user_email = None  # we'll fill this if someone is promoted

    if registration.status == RegistrationStatus.REGISTERED:
        # Find first person in waitlist (position 1)
        first_waitlisted = await db.registrations.find_one({
            "event_id": event_id,
            "status": "waitlisted",
            "waitlist_position": 1
        })

        if first_waitlisted:
            # Promote to registered
            await db.registrations.update_one(
                {"registration_id": first_waitlisted["registration_id"]},
                {"$set": {
                    "status": "registered",
                    "waitlist_position": None
                }}
            )

            # Capture their email for notification
            promoted_user_email = first_waitlisted.get("user_email")

            # Bulk update all remaining waitlist positions (decrement by 1)
            await db.registrations.update_many(
                {
                    "event_id": event_id,
                    "status": "waitlisted",
                    "waitlist_position": {"$gt": 1}
                },
                {"$inc": {"waitlist_position": -1}}
            )

    # 3️⃣ If user was WAITLISTED → bulk shift positions after them
    elif registration.status == RegistrationStatus.WAITLISTED:
        await db.registrations.update_many(
            {
                "event_id": event_id,
                "status": "waitlisted",
                "waitlist_position": {"$gt": registration.waitlist_position}
            },
            {"$inc": {"waitlist_position": -1}}
        )

    # 4️⃣ Send cancellation email to the user who cancelled
    cancelling_email = registration.user_email if hasattr(registration, "user_email") else user.get("email")
    if cancelling_email:
        background_tasks.add_task(
            send_cancellation_email,
            to_email=cancelling_email,
            event_title=event_title,
            event_start_time=event_start_time,
            event_location=event_location,
        )

    # 5️⃣ If someone was promoted from waitlist → send promotion email
    if promoted_user_email:
        background_tasks.add_task(
            send_waitlist_promotion_email,
            to_email=promoted_user_email,
            event_title=event_title,
            event_start_time=event_start_time,
            event_location=event_location,
        )

    return None

@router.get("/{event_id}/ticket", response_class=HTMLResponse)
async def get_ticket_for_event(
    event_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Return an HTML ticket for the current user's registration for a given event.
    Only works if the user is registered (not cancelled).
    """

    # 1. Find the user's active registration for this event
    registration_doc = await db.registrations.find_one({
        "event_id": event_id,
        "user_id": user["directory_id"],
        "status": {"$in": ["registered", "waitlisted"]},  # or only ["registered"] if you prefer
    })

    if not registration_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active registration found for this event",
        )

    registration = Registration(**registration_doc)

    # 2. Fetch event details
    event_doc = await db.events.find_one({"event_id": event_id})
    if not event_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    event = Event(**event_doc)

    # 3. Generate QR image data (base64)
    qr_image_data = generate_ticket_qr_data(registration, event)

    # 4. Format datetime
    event_datetime_str = format_event_datetime(event.start_time)

    # 5. Load HTML template and fill placeholders
    template_html = load_template("ticket.html")

    user_email = registration.user_email  # comes from your Registration model

    html_content = (
        template_html
        .replace("{{event_title}}", event.title)
        .replace("{{event_datetime}}", event_datetime_str)
        .replace("{{event_location}}", event.location or "TBA")
        .replace("{{user_email}}", user_email)
        .replace("{{registration_id}}", registration.registration_id)
        .replace("{{qr_image_data}}", qr_image_data)
    )

    return HTMLResponse(content=html_content, status_code=200)