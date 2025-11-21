"""
Shared test utilities for Terrapin Events backend tests.

Includes:
- bearer(): generate Authorization headers with JWT.
- seed_event(): create an in-memory event for test_db.
"""

import datetime
from typing import Dict
from app.utils.security import create_access_token


def bearer(directory_id: str, role: str) -> Dict[str, str]:
    """Create a Bearer Authorization header with a signed JWT token."""
    token = create_access_token({"directory_id": directory_id, "role": role})
    return {"Authorization": f"Bearer {token}"}


def seed_event(
    db,
    *,
    event_id: str = "evt_test",
    organizer_id: str = "118000002",
    organizer_email: str = "org@umd.edu",
    title: str = "Workshop",
    location: str = "Lab A",
    status: str = "draft",
    capacity: int = 25,
    start: datetime.datetime | None = None,
    reg_open: datetime.datetime | None = None,
    reg_close: datetime.datetime | None = None,
) -> dict:
    """Insert a mock event document into the in-memory DB."""
    now = datetime.datetime.utcnow()
    event = {
        "event_id": event_id,
        "title": title,
        "description": "Desc",
        "category": "seminar",
        "location": location,
        "banner": None,
        "start_time": start or now,
        "end_time": None,
        "registration_open_time": reg_open,
        "registration_close_time": reg_close,
        "capacity": capacity,
        "status": status,
        "organizer_id": organizer_id,
        "organizer_email": organizer_email,
        "requested_admin_id": None,
        "requested_admin_email": None,
        "approved_by_admin_id": None,
        "created_at": now,
        "updated_at": now,
    }
    db.events.docs.append(event)
    return event
