import datetime
from typing import Dict
from fastapi import status
from tests.helper import bearer, seed_event

from app.utils.security import create_access_token  # helper to mint JWTs

# =============== POST /api/events/{event_id}/register =================

def test_register_success_registered(client, test_db, seed_user_participant, seed_user_organizer):
    """
    Description:
      Registers a participant for an APPROVED event that has available capacity.
      Expect status 201 with "registered".
    Input:
      - Event: status="approved", capacity=3
      - Auth: participant bearer token
      - Body: (none) path-only call
    Output:
      - HTTP 201
      - JSON: {"status": "registered", ...}
    """
    seed_event(test_db, status="approved", capacity=3)
    hdrs = bearer(seed_user_participant["directory_id"], "participant")
    r = client.post("/api/events/evt_test/register", headers=hdrs)
    assert r.status_code == status.HTTP_201_CREATED
    assert r.json()["status"] == "registered"


def test_register_waitlisted_when_full(client, test_db, seed_user_participant, seed_user_organizer):
    """
    Description:
      When the event is already full, a subsequent registration goes to the waitlist.
      Expect status 201 with "waitlisted" and position 1.
    Input:
      - Event: status="approved", capacity=1 (first user fills seat)
      - Auth: second participant bearer token
    Output:
      - HTTP 201
      - JSON: {"status": "waitlisted", "waitlist_position": 1}
    """
    seed_event(test_db, status="approved", capacity=1)
    # Fill the only seat with another user
    other = {
        "directory_id": "118000010",
        "password_hash": seed_user_participant["password_hash"],
        "email": "p2@umd.edu",
        "first_name": "P2",
        "last_name": "U",
        "role": "participant",
    }
    test_db.users.docs.append(other)
    hdrs1 = bearer(other["directory_id"], "participant")
    assert client.post("/api/events/evt_test/register", headers=hdrs1).json()["status"] == "registered"

    hdrs2 = bearer(seed_user_participant["directory_id"], "participant")
    r2 = client.post("/api/events/evt_test/register", headers=hdrs2)
    assert r2.status_code == status.HTTP_201_CREATED
    assert r2.json()["status"] == "waitlisted"
    assert r2.json()["waitlist_position"] == 1


def test_register_duplicate_blocked(client, test_db, seed_user_participant, seed_user_organizer):
    """
    Description:
      Prevent a user from registering twice for the same event.
    Input:
      - Event: approved with capacity
      - Two POSTs from same participant to /register
    Output:
      - First: HTTP 201
      - Second: HTTP 400
    """
    seed_event(test_db, status="approved", capacity=2)
    hdrs = bearer(seed_user_participant["directory_id"], "participant")
    r1 = client.post("/api/events/evt_test/register", headers=hdrs)
    assert r1.status_code == status.HTTP_201_CREATED

    r2 = client.post("/api/events/evt_test/register", headers=hdrs)
    assert r2.status_code == status.HTTP_400_BAD_REQUEST


def test_register_event_not_found(client, test_db, seed_user_participant):
    """
    Description:
      Return 404 if the target event_id does not exist.
    Input:
      - POST /api/events/evt_missing/register with participant token
    Output:
      - HTTP 404
    """
    hdrs = bearer(seed_user_participant["directory_id"], "participant")
    r = client.post("/api/events/evt_missing/register", headers=hdrs)
    assert r.status_code == status.HTTP_404_NOT_FOUND


def test_register_unapproved_event_rejected(client, test_db, seed_user_participant, seed_user_organizer):
    """
    Description:
      Reject registration for events that are not approved (e.g., "draft"/"pending").
    Input:
      - Event: status="draft"
      - POST /register with participant token
    Output:
      - HTTP 400
    """
    seed_event(test_db, status="draft", capacity=2)
    hdrs = bearer(seed_user_participant["directory_id"], "participant")
    r = client.post("/api/events/evt_test/register", headers=hdrs)
    assert r.status_code == status.HTTP_400_BAD_REQUEST


def test_register_before_window_opens(client, test_db, seed_user_participant, seed_user_organizer):
    """
    Description:
      Reject registration if current time is before registration_open_time.
    Input:
      - Event: approved, registration_open_time = now + 1 day
      - POST /register with participant token
    Output:
      - HTTP 400
    """
    future = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    seed_event(test_db, status="approved", capacity=2, reg_open=future)
    hdrs = bearer(seed_user_participant["directory_id"], "participant")
    r = client.post("/api/events/evt_test/register", headers=hdrs)
    assert r.status_code == status.HTTP_400_BAD_REQUEST


def test_register_after_window_closed(client, test_db, seed_user_participant, seed_user_organizer):
    """
    Description:
      Reject registration if current time is after registration_close_time.
    Input:
      - Event: approved, registration_close_time = yesterday
      - POST /register with participant token
    Output:
      - HTTP 400
    """
    past = datetime.datetime.utcnow() - datetime.timedelta(days=1)
    seed_event(
        test_db,
        status="approved",
        capacity=2,
        reg_open=past - datetime.timedelta(days=1),
        reg_close=past,
    )
    hdrs = bearer(seed_user_participant["directory_id"], "participant")
    r = client.post("/api/events/evt_test/register", headers=hdrs)
    assert r.status_code == status.HTTP_400_BAD_REQUEST


# ======== GET /api/events/{event_id}/registrations (organizer/admin only) ========

def test_get_event_registrations_authz(client, test_db, seed_user_organizer, seed_user_admin):
    """
    Description:
      Only the event organizer or an admin can view the registration list.
    Input:
      - Event owned by organizer
      - GET as random participant -> 403
      - GET as organizer -> 200
      - GET as admin -> 200
    Output:
      - 403 for non-owner participant
      - 200 for organizer and 200 for admin
    """
    evt = seed_event(
        test_db,
        status="approved",
        capacity=2,
        organizer_id=seed_user_organizer["directory_id"],
        organizer_email=seed_user_organizer["email"],
    )

    # random participant -> forbidden
    rand_user = {
        "directory_id": "118777777",
        "password_hash": "x",
        "email": "x@umd.edu",
        "role": "participant",
    }
    test_db.users.docs.append(rand_user)
    r_forbidden = client.get(
        f"/api/events/{evt['event_id']}/registrations",
        headers=bearer(rand_user["directory_id"], "participant"),
    )
    assert r_forbidden.status_code == status.HTTP_403_FORBIDDEN

    # organizer allowed
    r_org = client.get(
        f"/api/events/{evt['event_id']}/registrations",
        headers=bearer(seed_user_organizer["directory_id"], "organizer"),
    )
    assert r_org.status_code == status.HTTP_200_OK

    # admin allowed
    r_admin = client.get(
        f"/api/events/{evt['event_id']}/registrations",
        headers=bearer(seed_user_admin["directory_id"], "admin"),
    )
    assert r_admin.status_code == status.HTTP_200_OK


def test_get_event_registrations_event_missing(client, test_db, seed_user_admin):
    """
    Description:
      Return 404 when requesting registrations for a non-existent event.
    Input:
      - GET /api/events/evt_missing/registrations as admin
    Output:
      - HTTP 404
    """
    r = client.get(
        "/api/events/evt_missing/registrations",
        headers=bearer(seed_user_admin["directory_id"], "admin"),
    )
    assert r.status_code == status.HTTP_404_NOT_FOUND


# ========== GET /api/events/registrations/my-registrations (participant) ==========

def test_get_my_registrations_returns_active(client, test_db, seed_user_participant, seed_user_organizer):
    """
    Description:
      Only active registrations (registered/waitlisted) should be returned for the user;
      cancelled ones are filtered out.
    Input:
      - One "registered" and one "cancelled" reg for the same user
      - GET /api/events/registrations/my-registrations as that user
    Output:
      - HTTP 200
      - List length == 1 and status in {"registered","waitlisted"}
    """
    evt = seed_event(test_db, status="approved", capacity=1)
    # create one active reg + one cancelled for the user
    test_db.registrations.docs.append(
        {
            "registration_id": "reg1",
            "event_id": evt["event_id"],
            "user_id": seed_user_participant["directory_id"],
            "user_email": seed_user_participant["email"],
            "status": "registered",
            "waitlist_position": None,
            "registered_at": datetime.datetime.utcnow(),
        }
    )
    test_db.registrations.docs.append(
        {
            "registration_id": "reg2",
            "event_id": evt["event_id"],
            "user_id": seed_user_participant["directory_id"],
            "user_email": seed_user_participant["email"],
            "status": "cancelled",
            "waitlist_position": None,
            "registered_at": datetime.datetime.utcnow(),
        }
    )
    r = client.get(
        "/api/events/registrations/my-registrations",
        headers=bearer(seed_user_participant["directory_id"], "participant"),
    )
    assert r.status_code == status.HTTP_200_OK
    data = r.json()
    assert len(data) == 1 and data[0]["status"] in ("registered", "waitlisted")


# ===== DELETE /api/events/{event_id}/register (cancel + waitlist management) =====

def test_cancel_registered_promotes_first_waitlisted_and_shifts(client, test_db, seed_user_organizer):
    """
    Description:
      When a registered user cancels and there is a waitlist, the first waitlisted
      user is promoted to "registered" and remaining waitlist positions shift up by 1.
    Input:
      - Event capacity=1
      - Seed: A=registered, B=waitlisted(1), C=waitlisted(2)
      - DELETE /api/events/{event_id}/register as A
    Output:
      - HTTP 204
      - B becomes "registered", C remains "waitlisted" with position=1
    """
    evt = seed_event(test_db, status="approved", capacity=1)
    A = {"directory_id": "118A", "email": "a@umd.edu", "password_hash": "x", "role": "participant"}
    B = {"directory_id": "118B", "email": "b@umd.edu", "password_hash": "x", "role": "participant"}
    C = {"directory_id": "118C", "email": "c@umd.edu", "password_hash": "x", "role": "participant"}
    test_db.users.docs += [A, B, C]
    now = datetime.datetime.utcnow()
    test_db.registrations.docs += [
        {
            "registration_id": "regA",
            "event_id": evt["event_id"],
            "user_id": A["directory_id"],
            "user_email": A["email"],
            "status": "registered",
            "waitlist_position": None,
            "registered_at": now,
        },
        {
            "registration_id": "regB",
            "event_id": evt["event_id"],
            "user_id": B["directory_id"],
            "user_email": B["email"],
            "status": "waitlisted",
            "waitlist_position": 1,
            "registered_at": now,
        },
        {
            "registration_id": "regC",
            "event_id": evt["event_id"],
            "user_id": C["directory_id"],
            "user_email": C["email"],
            "status": "waitlisted",
            "waitlist_position": 2,
            "registered_at": now,
        },
    ]
    r = client.delete(
        f"/api/events/{evt['event_id']}/register",
        headers=bearer(A["directory_id"], "participant"),
    )
    assert r.status_code == status.HTTP_204_NO_CONTENT

    # Validate promotion/shifting
    promoted = next(d for d in test_db.registrations.docs if d["registration_id"] == "regB")
    shifted = next(d for d in test_db.registrations.docs if d["registration_id"] == "regC")
    assert promoted["status"] == "registered" and promoted["waitlist_position"] is None
    assert shifted["status"] == "waitlisted" and shifted["waitlist_position"] == 1


def test_cancel_waitlisted_shifts_after_them(client, test_db, seed_user_organizer):
    """
    Description:
      If a waitlisted user cancels, only users behind them shift up by 1.
    Input:
      - Waitlist: W1(1), W2(2), W3(3)
      - DELETE /register as W2
    Output:
      - HTTP 204
      - W3 now has waitlist_position=2 (W1 unchanged)
    """
    evt = seed_event(test_db, status="approved", capacity=1)
    W1 = {"directory_id": "118W1", "email": "w1@umd.edu", "password_hash": "x", "role": "participant"}
    W2 = {"directory_id": "118W2", "email": "w2@umd.edu", "password_hash": "x", "role": "participant"}
    W3 = {"directory_id": "118W3", "email": "w3@umd.edu", "password_hash": "x", "role": "participant"}
    test_db.users.docs += [W1, W2, W3]
    now = datetime.datetime.utcnow()
    test_db.registrations.docs += [
        {
            "registration_id": "regW1",
            "event_id": evt["event_id"],
            "user_id": W1["directory_id"],
            "user_email": W1["email"],
            "status": "waitlisted",
            "waitlist_position": 1,
            "registered_at": now,
        },
        {
            "registration_id": "regW2",
            "event_id": evt["event_id"],
            "user_id": W2["directory_id"],
            "user_email": W2["email"],
            "status": "waitlisted",
            "waitlist_position": 2,
            "registered_at": now,
        },
        {
            "registration_id": "regW3",
            "event_id": evt["event_id"],
            "user_id": W3["directory_id"],
            "user_email": W3["email"],
            "status": "waitlisted",
            "waitlist_position": 3,
            "registered_at": now,
        },
    ]
    r = client.delete(
        f"/api/events/{evt['event_id']}/register",
        headers=bearer(W2["directory_id"], "participant"),
    )
    assert r.status_code == status.HTTP_204_NO_CONTENT

    w3 = next(d for d in test_db.registrations.docs if d["registration_id"] == "regW3")
    assert w3["waitlist_position"] == 2


def test_cancel_no_active_registration_404(client, test_db, seed_user_participant, seed_user_organizer):
    """
    Description:
      Cancelling when the user has no active registration for the event should return 404.
    Input:
      - Event: approved
      - DELETE /register as a participant with no "registered" or "waitlisted" record
    Output:
      - HTTP 404
    """
    seed_event(test_db, status="approved", capacity=1)
    r = client.delete(
        "/api/events/evt_test/register",
        headers=bearer(seed_user_participant["directory_id"], "participant"),
    )
    assert r.status_code == status.HTTP_404_NOT_FOUND
