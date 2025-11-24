"""
Test configuration and fixtures for backend tests.
"""
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from datetime import datetime, timezone

from app.main import app
from app.utils.security import hash_password


# Test database configuration
TEST_DB_NAME = "terrapin_events_test"
# Use localhost for tests instead of Docker service name
TEST_MONGODB_URL = "mongodb://localhost:27017"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_db() -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    """
    Create a test database for each test function.
    Cleans up after the test completes.
    """
    client = AsyncIOMotorClient(
        TEST_MONGODB_URL,
        serverSelectionTimeoutMS=5000,  # Fail fast if MongoDB isn't running
        connectTimeoutMS=5000
    )
    db = client[TEST_DB_NAME]
    
    # Create indexes
    await db.users.create_index("directory_id", unique=True)
    await db.users.create_index("email", unique=True, sparse=True)
    await db.events.create_index("event_id", unique=True)
    await db.registrations.create_index("registration_id", unique=True)
    await db.registrations.create_index([("event_id", 1), ("user_id", 1)], unique=True)
    
    yield db
    
    # Cleanup: drop all collections
    await db.users.drop()
    await db.events.drop()
    await db.registrations.drop()
    client.close()


@pytest.fixture
async def sample_users(test_db: AsyncIOMotorDatabase):
    """Create sample users for testing."""
    users = [
        {
            "directory_id": "admin001",
            "password_hash": hash_password("admin123"),
            "email": "admin@umd.edu",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        },
        {
            "directory_id": "org001",
            "password_hash": hash_password("organizer123"),
            "email": "organizer@umd.edu",
            "first_name": "Event",
            "last_name": "Organizer",
            "role": "organizer",
            "major": "Computer Science",
            "year": "senior",
            "created_at": datetime.now(timezone.utc),
        },
        {
            "directory_id": "user001",
            "password_hash": hash_password("user123"),
            "email": "participant@umd.edu",
            "first_name": "Test",
            "last_name": "Participant",
            "role": "participant",
            "major": "Engineering",
            "year": "junior",
            "created_at": datetime.now(timezone.utc),
        },
        {
            "directory_id": "user002",
            "password_hash": hash_password("user456"),
            "email": "participant2@umd.edu",
            "first_name": "Another",
            "last_name": "Participant",
            "role": "participant",
            "created_at": datetime.now(timezone.utc),
        },
    ]
    
    await test_db.users.insert_many(users)
    return users


@pytest.fixture
async def admin_token(test_db: AsyncIOMotorDatabase, sample_users):
    """Generate admin JWT token for testing."""
    from app.utils.security import create_access_token
    
    token = create_access_token(
        data={"directory_id": "admin001", "role": "admin"}
    )
    return token


@pytest.fixture
async def organizer_token(test_db: AsyncIOMotorDatabase, sample_users):
    """Generate organizer JWT token for testing."""
    from app.utils.security import create_access_token
    
    token = create_access_token(
        data={"directory_id": "org001", "role": "organizer"}
    )
    return token


@pytest.fixture
async def participant_token(test_db: AsyncIOMotorDatabase, sample_users):
    """Generate participant JWT token for testing."""
    from app.utils.security import create_access_token
    
    token = create_access_token(
        data={"directory_id": "user001", "role": "participant"}
    )
    return token


@pytest.fixture
async def sample_event(test_db: AsyncIOMotorDatabase, sample_users):
    """Create a sample approved event for testing."""
    from datetime import timedelta
    
    event = {
        "event_id": "evt_test001",
        "title": "Test Event",
        "description": "This is a test event",
        "category": "workshop",
        "location": "Stamp Student Union",
        "banner": None,
        "start_time": datetime.now(timezone.utc) + timedelta(days=7),
        "end_time": datetime.now(timezone.utc) + timedelta(days=7, hours=2),
        "registration_open_time": datetime.now(timezone.utc) - timedelta(days=1),
        "registration_close_time": datetime.now(timezone.utc) + timedelta(days=6),
        "capacity": 50,
        "status": "approved",
        "organizer_id": "org001",
        "organizer_email": "organizer@umd.edu",
        "requested_admin_id": "admin001",
        "requested_admin_email": "admin@umd.edu",
        "approved_by_admin_id": "admin001",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_paid": False,
        "price": 0.0,
        "currency": "USD",
    }
    
    await test_db.events.insert_one(event)
    return event


@pytest.fixture
async def sample_paid_event(test_db: AsyncIOMotorDatabase, sample_users):
    """Create a sample paid event for testing payment flows."""
    from datetime import timedelta
    
    event = {
        "event_id": "evt_paid001",
        "title": "Paid Workshop",
        "description": "This is a paid workshop event",
        "category": "workshop",
        "location": "Engineering Building",
        "banner": None,
        "start_time": datetime.now(timezone.utc) + timedelta(days=14),
        "end_time": datetime.now(timezone.utc) + timedelta(days=14, hours=3),
        "registration_open_time": datetime.now(timezone.utc) - timedelta(days=1),
        "registration_close_time": datetime.now(timezone.utc) + timedelta(days=13),
        "capacity": 30,
        "status": "approved",
        "organizer_id": "org001",
        "organizer_email": "organizer@umd.edu",
        "requested_admin_id": "admin001",
        "requested_admin_email": "admin@umd.edu",
        "approved_by_admin_id": "admin001",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_paid": True,
        "price": 25.00,
        "currency": "USD",
    }
    
    await test_db.events.insert_one(event)
    return event
