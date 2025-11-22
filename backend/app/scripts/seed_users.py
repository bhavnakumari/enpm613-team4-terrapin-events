import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.utils.security import hash_password


async def seed_users():
    """Create test users in the database."""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    
    print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    
    # Test users with different roles
    test_users = [
        {
            "directory_id": "bhavna",
            "password_hash": hash_password("participant123"),
            "email": "bhavnaphotos12@gmail.com",
            "first_name": "Bhavna",
            "last_name": "Kumari",
            "role": "participant"
        },
        {
            "directory_id": "abhigna",
            "password_hash": hash_password("participant123"),
            "email": "bhavnaphotos13@gmail.com",
            "first_name": "Abhighna",
            "last_name": "Kandala",
            "role": "participant"
        },
        {
            "directory_id": "teja",
            "password_hash": hash_password("participant123"),
            "email": "appsbekar@gmail.com",
            "first_name": "Teja",
            "last_name": "Tatimatla",
            "role": "participant"
        },
         {
            "directory_id": "vineet",
            "password_hash": hash_password("participant123"),
            "email": "vineetagarwal540@gmail.com",
            "first_name": "John",
            "last_name": "Doe",
            "role": "participant"
        },
        {
            "directory_id": "organiser",
            "password_hash": hash_password("organizer2"),
            "email": "organizer@umd.edu",
            "first_name": "Jane",
            "last_name": "Smith",
            "role": "organizer"
        },
        {
            "directory_id": "admin",
            "password_hash": hash_password("admin123"),
            "email": "admin@umd.edu",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin"
        }
    ]
    
    # Clear existing test users (optional - comment out if you want to keep them)
    await db.users.delete_many({
        "directory_id": {"$in": ["bhavna", "abhigna", "teja", "vineet", "organiser", "admin"]}
    })
    print("Cleared existing test users")
    
if __name__ == "__main__":
    asyncio.run(seed_users())
