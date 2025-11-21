import datetime
from typing import Dict
from fastapi import status
from app.utils.security import create_access_token
from tests.helper import bearer, seed_event


# ========================= GET /api/events/ (public list) =========================

def test_list_events_public(client, test_db):
    """
    Description:
      Event list endpoint should be public and return a JSON array.
    Input:
      - GET /api/events/ (no auth)
    Output:
      - HTTP 200
      - JSON: list (possibly empty)
    """
    r = client.get("/api/events/")
    assert r.status_code == status.HTTP_200_OK
    assert isinstance(r.json(), list)


# =================== GET /api/events/{event_id} (public detail) ===================

def test_get_event_by_id_found(client, test_db, seed_user_organizer):
    """
    Description:
      Fetch a specific event by its event_id.
    Input:
      - Seed one event in DB
      - GET /api/events/{event_id}
    Output:
      - HTTP 200
      - JSON has the same event_id
    """
    evt = seed_event(
        test_db,
        event_id="evt_123",
        organizer_id=seed_user_organizer["directory_id"],
        organizer_email=seed_user_organizer["email"],
        status="approved",
    )
    r = client.get(f"/api/events/{evt['event_id']}")
    assert r.status_code == status.HTTP_200_OK
    assert r.json()["event_id"] == "evt_123"


def test_get_event_by_id_not_found(client):
    """
    Description:
      Return 404 when the requested event does not exist.
    Input:
      - GET /api/events/evt_missing
    Output:
      - HTTP 404
    """
    r = client.get("/api/events/evt_missing")
    assert r.status_code == status.HTTP_404_NOT_FOUND


# =========================== POST /api/events/ (create) ===========================

def test_create_event_requires_role(client, seed_user_participant):
    """
    Description:
      Participants cannot create events (only organizer/admin).
    Input:
      - POST /api/events/ with participant bearer token
      - Minimal valid body
    Output:
      - HTTP 403
    """
    payload = {
        "title": "New Talk",
        "location": "Room 101",
        "start_time": datetime.datetime.utcnow().isoformat(),
        "capacity": 10,
    }
    r = client.post("/api/events/", headers=bearer(seed_user_participant["directory_id"], "participant"), json=payload)
    assert r.status_code == status.HTTP_403_FORBIDDEN


def test_create_event_by_organizer_success(client, test_db, seed_user_organizer):
    """
    Description:
      Organizer can create an event. New events should start in 'draft' (per your defaults).
    Input:
      - POST /api/events/ with organizer bearer token
      - Valid CreateEventRequest payload
    Output:
      - HTTP 201
      - JSON includes event_id, organizer_id, and status='draft'
    """
    payload = {
        "title": "Workshop",
        "location": "Lab A",
        "start_time": datetime.datetime.utcnow().isoformat(),
        "capacity": 25,
    }
    r = client.post("/api/events/", headers=bearer(seed_user_organizer["directory_id"], "organizer"), json=payload)
    assert r.status_code == status.HTTP_201_CREATED
    body = r.json()
    assert body["status"] == "draft"
    assert body["organizer_id"] == seed_user_organizer["directory_id"]
    assert "event_id" in body


def test_create_event_validation_errors(client, seed_user_organizer):
    """
    Description:
      Missing required fields or invalid values should yield 422 validation errors.
    Input:
      - POST /api/events/ with organizer token
      - Missing title OR capacity <= 0
    Output:
      - HTTP 422
    """
    bad_payload = {
        # "title": "Missing title triggers 422",
        "location": "Nowhere",
        "start_time": datetime.datetime.utcnow().isoformat(),
        "capacity": 0,  # must be > 0
    }
    r = client.post("/api/events/", headers=bearer(seed_user_organizer["directory_id"], "organizer"), json=bad_payload)
    assert r.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# =========================== PATCH /api/events/{id} ===============================

def test_update_event_fields_by_organizer(client, test_db, seed_user_organizer):
    """
    Description:
      Organizer can update their own event's editable fields (e.g., title/location/capacity).
      This does NOT cover status changes.
    Input:
      - Seed draft event owned by organizer
      - PATCH /api/events/{id} with organizer token and new title/location
    Output:
      - HTTP 200
      - Updated fields reflected in response
    """
    evt = seed_event(
        test_db,
        event_id="evt_u1",
        organizer_id=seed_user_organizer["directory_id"],
        organizer_email=seed_user_organizer["email"],
        status="draft",
    )
    patch = {"title": "Workshop (Updated)", "location": "Lab B", "capacity": 40}
    r = client.patch(
        f"/api/events/{evt['event_id']}",
        headers=bearer(seed_user_organizer["directory_id"], "organizer"),
        json=patch,
    )
    assert r.status_code == status.HTTP_200_OK
    body = r.json()
    assert body["title"] == "Workshop (Updated)"
    assert body["location"] == "Lab B"
    assert body["capacity"] == 40


def test_update_event_status_only_admin(client, test_db, seed_user_organizer, seed_user_admin):
    """
    Description:
      Only an admin can change the event status (e.g., draft -> approved).
      Organizer attempting to change status should get 403.
    Input:
      - Seed draft event owned by organizer
      - PATCH as organizer with {"status":"approved"} -> expect 403
      - PATCH as admin with {"status":"approved"} -> expect 200
    Output:
      - Organizer attempt: HTTP 403
      - Admin attempt: HTTP 200 + status is 'approved'
    """
    evt = seed_event(
        test_db,
        event_id="evt_status",
        organizer_id=seed_user_organizer["directory_id"],
        organizer_email=seed_user_organizer["email"],
        status="draft",
    )

    # Organizer tries to approve -> forbidden
    r1 = client.patch(
        f"/api/events/{evt['event_id']}",
        headers=bearer(seed_user_organizer["directory_id"], "organizer"),
        json={"status": "approved"},
    )
    assert r1.status_code == status.HTTP_403_FORBIDDEN

    # Admin approves -> success
    r2 = client.patch(
        f"/api/events/{evt['event_id']}",
        headers=bearer(seed_user_admin["directory_id"], "admin"),
        json={"status": "approved"},
    )
    assert r2.status_code == status.HTTP_200_OK
    assert r2.json()["status"] == "approved"


def test_update_event_validation_errors(client, test_db, seed_user_organizer):
    """
    Description:
      Invalid update payload (e.g., negative capacity) should yield 422 validation errors.
    Input:
      - PATCH /api/events/{id} with organizer token
      - capacity = -1
    Output:
      - HTTP 422
    """
    evt = seed_event(
        test_db,
        event_id="evt_v1",
        organizer_id=seed_user_organizer["directory_id"],
        organizer_email=seed_user_organizer["email"],
        status="draft",
    )
    r = client.patch(
        f"/api/events/{evt['event_id']}",
        headers=bearer(seed_user_organizer["directory_id"], "organizer"),
        json={"capacity": -1},
    )
    assert r.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
