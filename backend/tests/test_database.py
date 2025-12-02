"""
Integration tests for database operations.
"""
import pytest
from datetime import datetime, timedelta, timezone
from app.models.user import UserInDB, UserRole
from app.models.event import Event, EventStatus, EventCategory
from app.models.registration import Registration, RegistrationStatus
from app.utils.security import hash_password


class TestDatabaseOperations:
    """Test direct database operations and data integrity."""
    
    @pytest.mark.asyncio
    async def test_user_creation_and_retrieval(self, test_db):
        """Test creating and retrieving a user from database."""
        user = {
            "directory_id": "db_test_001",
            "password_hash": hash_password("password123"),
            "email": "dbtest@umd.edu",
            "first_name": "Database",
            "last_name": "Test",
            "role": "participant",
            "created_at": datetime.now(timezone.utc),
        }
        
        # Insert user
        result = await test_db.users.insert_one(user)
        assert result.inserted_id is not None
        
        # Retrieve user
        retrieved = await test_db.users.find_one({"directory_id": "db_test_001"})
        assert retrieved is not None
        assert retrieved["email"] == "dbtest@umd.edu"
        assert retrieved["role"] == "participant"
    
    @pytest.mark.asyncio
    async def test_unique_directory_id_constraint(self, test_db):
        """Test that directory_id uniqueness is enforced."""
        user1 = {
            "directory_id": "unique_test",
            "password_hash": hash_password("password1"),
            "email": "user1@umd.edu",
            "first_name": "User",
            "last_name": "One",
            "role": "participant",
            "created_at": datetime.now(timezone.utc),
        }
        
        user2 = {
            "directory_id": "unique_test",  # Same directory_id
            "password_hash": hash_password("password2"),
            "email": "user2@umd.edu",
            "first_name": "User",
            "last_name": "Two",
            "role": "participant",
            "created_at": datetime.now(timezone.utc),
        }
        
        # First insert should succeed
        await test_db.users.insert_one(user1)
        
        # Second insert should fail due to unique constraint
        with pytest.raises(Exception):  # DuplicateKeyError
            await test_db.users.insert_one(user2)
    
    @pytest.mark.asyncio
    async def test_event_creation_and_update(self, test_db, sample_users):
        """Test creating and updating an event."""
        event = {
            "event_id": "db_evt_001",
            "title": "Database Test Event",
            "description": "Testing database operations",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "end_time": datetime.now(timezone.utc) + timedelta(days=5, hours=2),
            "capacity": 100,
            "status": "draft",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD",
        }
        
        # Insert event
        await test_db.events.insert_one(event)
        
        # Update event
        update_result = await test_db.events.update_one(
            {"event_id": "db_evt_001"},
            {"$set": {"status": "approved", "title": "Updated Title"}}
        )
        
        assert update_result.modified_count == 1
        
        # Verify update
        updated_event = await test_db.events.find_one({"event_id": "db_evt_001"})
        assert updated_event["status"] == "approved"
        assert updated_event["title"] == "Updated Title"
    
    @pytest.mark.asyncio
    async def test_registration_cascade_query(self, test_db, sample_users, sample_event):
        """Test querying registrations with event details."""
        # Create registration
        registration = {
            "registration_id": "reg_db_001",
            "event_id": "evt_test001",
            "user_id": "user001",
            "user_email": "participant@umd.edu",
            "status": "registered",
            "registered_at": datetime.now(timezone.utc),
            "payment_status": "not_required",
        }
        
        await test_db.registrations.insert_one(registration)
        
        # Query registration with event details using aggregation
        pipeline = [
            {"$match": {"user_id": "user001"}},
            {
                "$lookup": {
                    "from": "events",
                    "localField": "event_id",
                    "foreignField": "event_id",
                    "as": "event_details"
                }
            },
            {"$unwind": "$event_details"}
        ]
        
        result = await test_db.registrations.aggregate(pipeline).to_list(None)
        
        assert len(result) == 1
        assert result[0]["event_id"] == "evt_test001"
        assert result[0]["event_details"]["title"] == "Test Event"
    
    @pytest.mark.asyncio
    async def test_count_registered_users_for_event(self, test_db, sample_event):
        """Test counting registered users for an event."""
        # Create multiple registrations
        registrations = [
            {
                "registration_id": f"reg_count_{i}",
                "event_id": "evt_test001",
                "user_id": f"user00{i}",
                "user_email": f"user{i}@umd.edu",
                "status": "registered",
                "registered_at": datetime.now(timezone.utc),
                "payment_status": "not_required",
            }
            for i in range(1, 4)
        ]
        
        await test_db.registrations.insert_many(registrations)
        
        # Count registered users (excluding waitlisted)
        count = await test_db.registrations.count_documents({
            "event_id": "evt_test001",
            "status": "registered"
        })
        
        assert count == 3
    
    @pytest.mark.asyncio
    async def test_event_capacity_validation(self, test_db, sample_users):
        """Test event capacity management."""
        event = {
            "event_id": "evt_capacity",
            "title": "Capacity Test",
            "description": "Testing capacity",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 2,
            "status": "approved",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD",
        }
        
        await test_db.events.insert_one(event)
        
        # Register 2 users (fill capacity)
        registrations = [
            {
                "registration_id": f"reg_cap_{i}",
                "event_id": "evt_capacity",
                "user_id": f"user00{i}",
                "user_email": f"user{i}@umd.edu",
                "status": "registered",
                "registered_at": datetime.now(timezone.utc),
                "payment_status": "not_required",
            }
            for i in range(1, 3)
        ]
        
        await test_db.registrations.insert_many(registrations)
        
        # Check if event is at capacity
        event_doc = await test_db.events.find_one({"event_id": "evt_capacity"})
        registered_count = await test_db.registrations.count_documents({
            "event_id": "evt_capacity",
            "status": "registered"
        })
        
        assert registered_count == event_doc["capacity"]
        assert registered_count == 2
    
    @pytest.mark.asyncio
    async def test_waitlist_position_management(self, test_db, sample_users):
        """Test waitlist position assignment."""
        event = {
            "event_id": "evt_waitlist",
            "title": "Waitlist Test",
            "description": "Testing waitlist",
            "category": "workshop",
            "location": "Test Location",
            "start_time": datetime.now(timezone.utc) + timedelta(days=5),
            "capacity": 1,
            "status": "approved",
            "organizer_id": "org001",
            "organizer_email": "organizer@umd.edu",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_paid": False,
            "price": 0.0,
            "currency": "USD",
        }
        
        await test_db.events.insert_one(event)
        
        # Create registrations with waitlist
        registrations = [
            {
                "registration_id": "reg_wl_1",
                "event_id": "evt_waitlist",
                "user_id": "user001",
                "user_email": "user1@umd.edu",
                "status": "registered",
                "waitlist_position": None,
                "registered_at": datetime.now(timezone.utc),
                "payment_status": "not_required",
            },
            {
                "registration_id": "reg_wl_2",
                "event_id": "evt_waitlist",
                "user_id": "user002",
                "user_email": "user2@umd.edu",
                "status": "waitlisted",
                "waitlist_position": 1,
                "registered_at": datetime.now(timezone.utc),
                "payment_status": "not_required",
            },
            {
                "registration_id": "reg_wl_3",
                "event_id": "evt_waitlist",
                "user_id": "user003",
                "user_email": "user3@umd.edu",
                "status": "waitlisted",
                "waitlist_position": 2,
                "registered_at": datetime.now(timezone.utc),
                "payment_status": "not_required",
            },
        ]
        
        await test_db.registrations.insert_many(registrations)
        
        # Query waitlist in order
        waitlist = await test_db.registrations.find({
            "event_id": "evt_waitlist",
            "status": "waitlisted"
        }).sort("waitlist_position", 1).to_list(None)
        
        assert len(waitlist) == 2
        assert waitlist[0]["waitlist_position"] == 1
        assert waitlist[1]["waitlist_position"] == 2
    
    @pytest.mark.asyncio
    async def test_user_role_query(self, test_db, sample_users):
        """Test querying users by role."""
        # Count users by role
        admin_count = await test_db.users.count_documents({"role": "admin"})
        organizer_count = await test_db.users.count_documents({"role": "organizer"})
        participant_count = await test_db.users.count_documents({"role": "participant"})
        
        assert admin_count == 1
        assert organizer_count == 1
        assert participant_count == 2
    
    @pytest.mark.asyncio
    async def test_event_status_filter(self, test_db, sample_users):
        """Test filtering events by status."""
        # Create events with different statuses
        events = [
            {
                "event_id": f"evt_status_{status}",
                "title": f"{status.title()} Event",
                "description": f"Event in {status} state",
                "category": "workshop",
                "location": "Test Location",
                "start_time": datetime.now(timezone.utc) + timedelta(days=5),
                "capacity": 50,
                "status": status,
                "organizer_id": "org001",
                "organizer_email": "organizer@umd.edu",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
                "is_paid": False,
                "price": 0.0,
                "currency": "USD",
            }
            for status in ["draft", "pending_approval", "approved", "rejected"]
        ]
        
        await test_db.events.insert_many(events)
        
        # Query approved events
        approved_events = await test_db.events.find({"status": "approved"}).to_list(None)
        
        # Should include sample_event plus the one we created
        assert len(approved_events) >= 1
        assert all(e["status"] == "approved" for e in approved_events)
    
    @pytest.mark.asyncio
    async def test_index_performance(self, test_db):
        """Test that indexes are created for performance."""
        # Get indexes for users collection
        user_indexes = await test_db.users.index_information()
        
        # Check that directory_id index exists
        assert any("directory_id" in str(idx) for idx in user_indexes.values())
        
        # Get indexes for events collection
        event_indexes = await test_db.events.index_information()
        
        # Check that event_id index exists
        assert any("event_id" in str(idx) for idx in event_indexes.values())
