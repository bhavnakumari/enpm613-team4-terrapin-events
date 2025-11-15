"""
Seed script to populate test users in the database.
Run this once to create participant, organizer, and admin users.

Usage:
    python -m app.scripts.seed_users
"""
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
            "directory_id": "118123456",
            "password_hash": hash_password("participant123"),
            "email": "participant@umd.edu",
            "first_name": "John",
            "last_name": "Doe",
            "role": "participant"
        },
        {
            "directory_id": "118234567",
            "password_hash": hash_password("organizer123"),
            "email": "organizer@umd.edu",
            "first_name": "Jane",
            "last_name": "Smith",
            "role": "organizer"
        },
        {
            "directory_id": "118345678",
            "password_hash": hash_password("admin123"),
            "email": "admin@umd.edu",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin"
        }
    ]
    
    # Clear existing test users (optional - comment out if you want to keep them)
    await db.users.delete_many({
        "directory_id": {"$in": ["118123456", "118234567", "118345678"]}
    })
    print("Cleared existing test users")
    
    # Insert test users
    result = await db.users.insert_many(test_users)
    print(f"Created {len(result.inserted_ids)} test users")
    
    # Display credentials
    print("\n" + "="*60)
    print("TEST USER CREDENTIALS")
    print("="*60)
    print("\n1. PARTICIPANT")
    print("   Directory ID: 118123456")
    print("   Password: participant123")
    print("   Email: participant@umd.edu")
    
    print("\n2. ORGANIZER")
    print("   Directory ID: 118234567")
    print("   Password: organizer123")
    print("   Email: organizer@umd.edu")
    
    print("\n3. ADMIN")
    print("   Directory ID: 118345678")
    print("   Password: admin123")
    print("   Email: admin@umd.edu")
    
    print("\n" + "="*60)
    print("You can now login with any of these credentials!")
    print("="*60 + "\n")
    
    # Close connection
    client.close()
    print("Database connection closed")


if __name__ == "__main__":
    asyncio.run(seed_users())
