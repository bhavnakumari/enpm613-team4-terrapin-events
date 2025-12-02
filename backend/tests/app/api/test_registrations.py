"""
Tests for event registration endpoints.
"""
import pytest
from datetime import datetime, timedelta, timezone
from httpx import AsyncClient
from app.main import app


class TestEventRegistrations:
    """Test event registration and waitlist functionality."""
    
    @pytest.mark.asyncio
    async def test_register_for_event_success(self, test_db, sample_users, sample_event, participant_token):
        """Test successful event registration."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_test001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 201
        data = response.json()
        assert data["event_id"] == "evt_test001"
        assert data["user_id"] == "user001"
        assert data["status"] == "registered"
        assert "registration_id" in data
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_register_for_nonexistent_event(self, test_db, sample_users, participant_token):
        """Test registering for non-existent event."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/nonexistent_event/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_duplicate_registration_prevented(self, test_db, sample_users, sample_event, participant_token):
        """Test that duplicate registrations are prevented."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # First registration
            response1 = await ac.post(
                "/api/events/evt_test001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
            assert response1.status_code == 201
            
            # Second registration attempt
            response2 = await ac.post(
                "/api/events/evt_test001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
            assert response2.status_code == 400
            assert "already registered" in response2.json()["detail"]
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_register_for_unapproved_event(self, test_db, sample_users, participant_token):
        """Test that registration fails for unapproved events."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create draft event
        event = {
            "event_id": "evt_draft",
            "title": "Draft Event",
            "description": "Not approved yet",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 50,
            "status": "draft",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc) ,
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_draft/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 400
        assert "not approved" in response.json()["detail"]
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_waitlist_when_event_full(self, test_db, sample_users, participant_token):
        """Test waitlist functionality when event is at capacity."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # Create event with capacity 1
            event = {
                "event_id": "evt_small",
                "title": "Small Event",
                "description": "Only 1 spot",
                "category": "workshop",
                "location": "Test Location",
                "start_time": datetime.utcnow() + timedelta(days=5),
                "end_time": datetime.utcnow() + timedelta(days=5, hours=2),
                "registration_open_time": datetime.utcnow() - timedelta(days=1),
                "registration_close_time": datetime.utcnow() + timedelta(days=4),
                "capacity": 1,
                "status": "approved",
                "organizer_id": "org001",
                "organizer_email": "organizer@umd.edu",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "is_paid": False,
                "price": 0.0,
                "currency": "USD"
            }
            await test_db.events.insert_one(event)
            
            # Register first user (fills capacity)
            from app.utils.security import create_access_token
            user2_token = create_access_token(
                data={"directory_id": "user002", "role": "participant"}
            )
            
            response1 = await ac.post(
                "/api/events/evt_small/register",
                headers={"Authorization": f"Bearer {user2_token}"}
            )
            assert response1.status_code == 201
            assert response1.json()["status"] == "registered"
            
            # Second user should be waitlisted
            response2 = await ac.post(
                "/api/events/evt_small/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
            assert response2.status_code == 201
            assert response2.json()["status"] == "waitlisted"
            assert response2.json()["waitlist_position"] == 1
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_cancel_registration(self, test_db, sample_users, sample_event, participant_token):
        """Test canceling a registration."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # First register
            response1 = await ac.post(
                "/api/events/evt_test001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
            assert response1.status_code == 201
            
            # Then cancel
            response2 = await ac.delete(
                "/api/events/evt_test001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
            assert response2.status_code == 204
        
        app.dependency_overrides.clear()
        registration = await test_db.registrations.find_one({
            "event_id": "evt_test001",
            "user_id": "user001"
        })
        assert registration["status"] == "cancelled"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_paid_event_registration_with_payment(self, test_db, sample_users, sample_paid_event, participant_token):
        """Test registration for paid event with payment info."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Use the magic test card
        payment_data = {
            "card_number": "4242424242424242",
            "expiry_month": 12,
            "expiry_year": 2030,
            "cvc": "123"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_paid001/register",
                headers={"Authorization": f"Bearer {participant_token}"},
                json=payment_data
            )
        
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "registered"
        assert data["payment_status"] == "paid"
        assert data["amount_paid"] == 25.00
        assert "payment_transaction_id" in data
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_paid_event_registration_without_payment_fails(self, test_db, sample_users, sample_paid_event, participant_token):
        """Test that paid event registration without payment fails."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_paid001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 400
        assert "payment" in response.json()["detail"].lower()
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_paid_event_registration_with_invalid_card(self, test_db, sample_users, sample_paid_event, participant_token):
        """Test paid event registration with invalid payment card."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Invalid card number
        payment_data = {
            "card_number": "1111222233334444",
            "expiry_month": 12,
            "expiry_year": 2030,
            "cvc": "123"
        }
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_paid001/register",
                headers={"Authorization": f"Bearer {participant_token}"},
                json=payment_data
            )
        
        assert response.status_code == 400
        assert "payment failed" in response.json()["detail"].lower()
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_my_registrations(self, test_db, sample_users, sample_event, participant_token):
        """Test getting current user's registrations."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # Register for event
            await ac.post(
                "/api/events/evt_test001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
            
            # Get registrations
            response = await ac.get(
                "/api/events/registrations/my-registrations-with-events",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(r["event_id"] == "evt_test001" for r in data)
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_event_registrations_as_organizer(self, test_db, sample_users, sample_event, organizer_token, participant_token):
        """Test organizer can view registrations for their event."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Register a participant
        async with AsyncClient(app=app, base_url="http://test") as ac:
            await ac.post(
                "/api/events/evt_test001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
            
            # Organizer views registrations
            response = await ac.get(
                "/api/events/evt_test001/registrations",
                headers={"Authorization": f"Bearer {organizer_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_event_registrations_forbidden_for_non_owner(self, test_db, sample_users, sample_event, participant_token):
        """Test non-organizer cannot view event registrations."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create event by different organizer
        event = {
            "event_id": "evt_other_org",
            "title": "Other Organizer Event",
            "description": "Different owner",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.utcnow() + timedelta(days=7),
            "capacity": 50,
            "status": "approved",
            "organizer_id": "org999",
            "organizer_email": "other_org@umd.edu",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/events/evt_other_org/registrations",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 403
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_registration_outside_window_fails(self, test_db, sample_users, participant_token):
        """Test registration fails outside registration window."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create event with closed registration
        event = {
            "event_id": "evt_closed_reg",
            "title": "Closed Registration Event",
            "description": "Registration window closed",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.utcnow() + timedelta(days=7),
            "registration_open_time": datetime.utcnow() - timedelta(days=10),
            "registration_close_time": datetime.utcnow() - timedelta(days=1),
            "capacity": 50,
            "status": "approved",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_closed_reg/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 400
        assert "registration" in response.json()["detail"].lower()
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_registration_before_window_opens_fails(self, test_db, sample_users, participant_token):
        """Test registration fails before window opens."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create event with future registration opening
        event = {
            "event_id": "evt_future_reg",
            "title": "Future Registration Event",
            "description": "Registration not open yet",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.utcnow() + timedelta(days=14),
            "registration_open_time": datetime.utcnow() + timedelta(days=7),
            "registration_close_time": datetime.utcnow() + timedelta(days=13),
            "capacity": 50,
            "status": "approved",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/events/evt_future_reg/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 400
        assert "not open" in response.json()["detail"].lower()
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_cancel_already_cancelled_registration_fails(self, test_db, sample_users, sample_event, participant_token):
        """Test cannot cancel already cancelled registration."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # Register
            await ac.post(
                "/api/events/evt_test001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
            
            # Cancel once
            await ac.delete(
                "/api/events/evt_test001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
            
            # Try to cancel again
            response = await ac.delete(
                "/api/events/evt_test001/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 404
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_waitlist_promotion_when_user_cancels(self, test_db, sample_users, participant_token):
        """Test that cancelling promotes next waitlist user."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        # Create event with capacity 1
        event = {
            "event_id": "evt_waitlist_promo",
            "title": "Waitlist Promotion Test",
            "description": "Test promotion",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.utcnow() + timedelta(days=7),
            "registration_open_time": datetime.utcnow() - timedelta(days=1),
            "registration_close_time": datetime.utcnow() + timedelta(days=6),
            "capacity": 1,
            "status": "approved",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD"
        }
        await test_db.events.insert_one(event)
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # First user registers (fills capacity)
            await ac.post(
                "/api/events/evt_waitlist_promo/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
            
            # Create second user token
            from app.utils.security import create_access_token
            user2_token = create_access_token(
                data={"directory_id": "user002", "role": "participant"}
            )
            
            # Second user gets waitlisted
            resp2 = await ac.post(
                "/api/events/evt_waitlist_promo/register",
                headers={"Authorization": f"Bearer {user2_token}"}
            )
            assert resp2.status_code == 201
            assert resp2.json()["status"] == "waitlisted"
            
            # First user cancels
            await ac.delete(
                "/api/events/evt_waitlist_promo/register",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        # Check that second user got promoted
        user2_reg = await test_db.registrations.find_one({
            "event_id": "evt_waitlist_promo",
            "user_id": "user002"
        })
        assert user2_reg["status"] == "registered"
        assert user2_reg.get("waitlist_position") is None
        
        app.dependency_overrides.clear()
