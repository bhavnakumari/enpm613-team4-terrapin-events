"""
Tests for event management endpoints.
"""
import pytest
from datetime import datetime, timedelta, timezone
from httpx import AsyncClient
from app.main import app


class TestEventManagement:
    """Test event CRUD operations."""
    
    @pytest.mark.asyncio
    async def test_create_event_as_organizer(self, test_db, sample_users, organizer_token):
        """Test creating an event as an organizer."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        event_data = {
            "title": "New Test Event",
            "description": "This is a new test event",
            "category": "workshop",
            "location": "McKeldin Library",
            "start_time": (datetime.now(timezone.utc) + timedelta(days=10)).isoformat(),
            "end_time": (datetime.now(timezone.utc) + timedelta(days=10, hours=2)).isoformat(),
            "registration_open_time": (datetime.now(timezone.utc)).isoformat(),
            "registration_close_time": (datetime.now(timezone.utc) + timedelta(days=9)).isoformat(),
            "capacity": 100,
            "status": "pending_approval",
            "requested_admin_id": "admin001",
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/",
                headers={"Authorization": f"Bearer {organizer_token}"},
                json=event_data
            )
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Test Event"
        assert data["organizer_id"] == "org001"
        assert data["status"] == "pending_approval"
        assert "event_id" in data
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_create_event_as_participant_forbidden(self, test_db, sample_users, participant_token):
        """Test that participants cannot create events."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        event_data = {
            "title": "Unauthorized Event",
            "description": "This should fail",
            "category": "workshop",
            "location": "Test Location",
            "start_time": (datetime.now(timezone.utc) + timedelta(days=10)).isoformat(),
            "capacity": 50,
            "status": "draft",
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/",
                headers={"Authorization": f"Bearer {participant_token}"},
                json=event_data
            )
        
        assert response.status_code == 403
        assert "Only organizers and admins" in response.json()["detail"]
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_create_event_invalid_time_range(self, test_db, sample_users, organizer_token):
        """Test creating event with end time before start time."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        event_data = {
            "title": "Invalid Event",
            "description": "End time before start time",
            "category": "workshop",
            "location": "Test Location",
            "start_time": (datetime.now(timezone.utc) + timedelta(days=10)).isoformat(),
            "end_time": (datetime.now(timezone.utc) + timedelta(days=9)).isoformat(),  # Before start
            "capacity": 50,
            "status": "draft",
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/",
                headers={"Authorization": f"Bearer {organizer_token}"},
                json=event_data
            )
        
        assert response.status_code == 400
        assert "end time must be after start time" in response.json()["detail"]
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_all_events(self, test_db, sample_users, sample_event, participant_token):
        """Test retrieving all events."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/events/",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(e["event_id"] == "evt_test001" for e in data)
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_event_by_id(self, test_db, sample_users, sample_event, participant_token):
        """Test retrieving a specific event by ID."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/events/evt_test001",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["event_id"] == "evt_test001"
        assert data["title"] == "Test Event"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_event(self, test_db, sample_users, participant_token):
        """Test retrieving non-existent event."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/events/nonexistent_id",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 404
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_update_event_as_organizer(self, test_db, sample_users, sample_event, organizer_token):
        """Test updating event as the organizer."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        update_data = {
            "title": "Updated Test Event",
            "description": "Updated description"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.patch(
                "/api/events/evt_test001",
                headers={"Authorization": f"Bearer {organizer_token}"},
                json=update_data
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Test Event"
        assert data["description"] == "Updated description"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.skip(reason="Event approval endpoint not yet implemented")
    @pytest.mark.asyncio
    async def test_approve_event_as_admin(self, test_db, sample_users, admin_token):
        """Test approving an event as admin."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # First create a pending event
        event = {
            "event_id": "evt_pending",
            "title": "Pending Event",
            "description": "Needs approval",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "pending_approval",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "requested_admin_id": "admin001",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_pending/approve",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "approved"
        assert data["approved_by_admin_id"] == "admin001"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.skip(reason="Event rejection endpoint not yet implemented")
    @pytest.mark.asyncio
    async def test_reject_event_as_admin(self, test_db, sample_users, admin_token):
        """Test rejecting an event as admin."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create a pending event
        event = {
            "event_id": "evt_reject",
            "title": "Event to Reject",
            "description": "Will be rejected",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "pending_approval",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "requested_admin_id": "admin001",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_reject/reject",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "rejected"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.skip(reason="Event approval endpoint not yet implemented")
    @pytest.mark.asyncio
    async def test_approve_event_as_non_admin_forbidden(self, test_db, sample_users, organizer_token):
        """Test that non-admins cannot approve events."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        event = {
            "event_id": "evt_noapprove",
            "title": "Cannot Approve",
            "description": "Organizer cannot approve",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "pending_approval",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_noapprove/approve",
                headers={"Authorization": f"Bearer {organizer_token}"}
            )
        
        assert response.status_code == 403
        assert "Only admins" in response.json()["detail"]
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_delete_event(self, test_db, sample_users, organizer_token):
        """Test deleting an event."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create event to delete
        event = {
            "event_id": "evt_delete",
            "title": "Event to Delete",
            "description": "Will be deleted",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "draft",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.delete(
                "/api/events/evt_delete",
                headers={"Authorization": f"Bearer {organizer_token}"}
            )
        
        assert response.status_code == 204
        
        # Verify event is deleted
        async with AsyncClient(app=app, base_url="http://test") as ac:
            deleted_event = await test_db.events.find_one({"event_id": "evt_delete"})
            assert deleted_event is None
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_events_catalog(self, test_db, sample_users, sample_event, participant_token):
        """Test getting events catalog with registration stats."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/events/catalog",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Check that catalog includes registration stats
        if data:
            assert "attendee_count" in data[0]
            assert "is_user_registered" in data[0]
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_category_stats(self, test_db, sample_users, sample_event):
        """Test getting event category statistics."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/api/events/categories/stats")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have at least one category (from sample event)
        assert len(data) >= 1
        if data:
            assert "category" in data[0]
            assert "count" in data[0]
            assert data[0]["count"] > 0
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_my_events(self, test_db, sample_users, organizer_token):
        """Test getting events created by current organizer."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create event as organizer
        event = {
            "event_id": "evt_my_event",
            "title": "My Event",
            "description": "Created by me",
            "category": "academic",
            "location": "My Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=10),
            "capacity": 30,
            "status": "draft",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/events/my-events",
                headers={"Authorization": f"Bearer {organizer_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Verify it's the organizer's event
        my_event = next((e for e in data if e["event_id"] == "evt_my_event"), None)
        assert my_event is not None
        assert my_event["organizer_id"] == "org001"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_pending_events_as_admin(self, test_db, sample_users, admin_token):
        """Test getting pending events as admin."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create pending event
        event = {
            "event_id": "evt_pending_test",
            "title": "Pending Event",
            "description": "Needs approval",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "pending_approval",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "requested_admin_id": "admin001",
            "requested_admin_email": "admin@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/events/admin/pending-events",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should include the pending event
        pending_event = next((e for e in data if e["event_id"] == "evt_pending_test"), None)
        assert pending_event is not None
        assert pending_event["status"] == "pending_approval"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_pending_events_as_non_admin_forbidden(self, test_db, sample_users, participant_token):
        """Test that non-admins cannot access pending events."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/events/admin/pending-events",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 403
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_update_event_capacity_decrease_moves_to_waitlist(self, test_db, sample_users, organizer_token):
        """Test that decreasing event capacity moves excess registrations to waitlist."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create event with capacity 5
        event = {
            "event_id": "evt_capacity_test",
            "title": "Capacity Test Event",
            "description": "Test capacity decrease",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 5,
            "status": "approved",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        # Create 5 registrations
        for i in range(5):
            reg = {
                "registration_id": f"reg_cap_{i}",
                "event_id": "evt_capacity_test",
                "user_id": f"user{i:03d}",
                "user_email": f"user{i}@test.com",
                "status": "registered",
                "registration_type": "free",
                "registered_at": datetime.now(timezone.utc) + timedelta(seconds=i)
            }
            await test_db.registrations.insert_one(reg)
        
        # Decrease capacity to 2
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.patch(
                "/api/events/evt_capacity_test",
                headers={"Authorization": f"Bearer {organizer_token}"},
                json={"capacity": 2}
            )
        
        assert response.status_code == 200
        
        # Check that 2 users are still registered (earliest)
        registered = await test_db.registrations.count_documents({
            "event_id": "evt_capacity_test",
            "status": "registered"
        })
        assert registered == 2
        
        # Check that 3 users moved to waitlist
        waitlisted = await test_db.registrations.count_documents({
            "event_id": "evt_capacity_test",
            "status": "waitlisted"
        })
        assert waitlisted == 3
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_update_event_status_organizer_draft_to_pending(self, test_db, sample_users, organizer_token):
        """Test organizer can change status from draft to pending_approval."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create draft event
        event = {
            "event_id": "evt_draft_status",
            "title": "Draft Event",
            "description": "Test status change",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "draft",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.patch(
                "/api/events/evt_draft_status",
                headers={"Authorization": f"Bearer {organizer_token}"},
                json={"status": "pending_approval"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending_approval"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_update_event_status_organizer_cannot_approve(self, test_db, sample_users, organizer_token):
        """Test organizer cannot approve their own event."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create pending event
        event = {
            "event_id": "evt_no_self_approve",
            "title": "Pending Event",
            "description": "Cannot self-approve",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "pending_approval",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.patch(
                "/api/events/evt_no_self_approve",
                headers={"Authorization": f"Bearer {organizer_token}"},
                json={"status": "approved"}
            )
        
        assert response.status_code == 403
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_submit_event_for_approval(self, test_db, sample_users, organizer_token):
        """Test submitting draft event for approval."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create draft event
        event = {
            "event_id": "evt_submit_test",
            "title": "Draft to Submit",
            "description": "Will be submitted",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "draft",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_submit_test/submit",
                headers={"Authorization": f"Bearer {organizer_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending_approval"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_submit_non_draft_event_fails(self, test_db, sample_users, organizer_token):
        """Test cannot submit non-draft event."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create already pending event
        event = {
            "event_id": "evt_already_pending",
            "title": "Already Pending",
            "description": "Cannot resubmit",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "pending_approval",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_already_pending/submit",
                headers={"Authorization": f"Bearer {organizer_token}"}
            )
        
        assert response.status_code == 400
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_update_event_no_fields_fails(self, test_db, sample_users, sample_event, organizer_token):
        """Test updating event with no fields fails."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.patch(
                "/api/events/evt_test001",
                headers={"Authorization": f"Bearer {organizer_token}"},
                json={}
            )
        
        assert response.status_code == 400
        assert "No fields to update" in response.json()["detail"]
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_update_event_by_non_owner_forbidden(self, test_db, sample_users, organizer_token):
        """Test organizer cannot update another organizer's event."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create event owned by different organizer
        event = {
            "event_id": "evt_other_owner",
            "title": "Other Owner Event",
            "description": "Owned by someone else",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "draft",
            "organizer_id": "org002",  # Different organizer
            "organizer_email": "other@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.patch(
                "/api/events/evt_other_owner",
                headers={"Authorization": f"Bearer {organizer_token}"},
                json={"title": "Hacked Title"}
            )
        
        assert response.status_code == 403
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_admin_dashboard_statistics(self, test_db, sample_users, admin_token):
        """Test admin dashboard returns statistics."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create some test events with various statuses
        events = [
            {
                "event_id": "evt_dash_approved",
                "title": "Approved Event",
                "status": "approved",
                "start_time": datetime.now(timezone.utc) + timedelta(days=10),
                "organizer_id": "org001",
                "capacity": 50,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "event_id": "evt_dash_pending",
                "title": "Pending Event",
                "status": "pending_approval",
                "start_time": datetime.now(timezone.utc) + timedelta(days=5),
                "organizer_id": "org001",
                "capacity": 30,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        await test_db.events.insert_many(events)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/events/admin/stats",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "total_events" in data
        assert "pending_approval" in data
        assert "approved" in data
        assert data["total_events"] >= 2
        
        app.dependency_overrides.clear()
