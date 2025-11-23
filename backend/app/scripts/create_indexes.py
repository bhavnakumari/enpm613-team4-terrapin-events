"""
Database index creation script.
Run this once to create necessary indexes for preventing race conditions.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def create_indexes():
    """Create database indexes for performance and data integrity."""
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    
    print("Creating database indexes...")
    
    # Helper function to create index if it doesn't exist
    async def create_index_safe(collection, keys, **kwargs):
        index_name = kwargs.get('name', '_'.join([f"{k}_{v}" for k, v in keys]))
        try:
            await collection.create_index(keys, **kwargs)
            return True
        except Exception as e:
            if "already exists" in str(e).lower():
                print(f"  ⚠ Index {index_name} already exists, skipping...")
                return False
            else:
                raise
    
    # 1. Prevent duplicate user registrations for same event (race condition fix)
    # Only one active registration per user per event
    if await create_index_safe(
        db.registrations,
        [("event_id", 1), ("user_id", 1), ("status", 1)],
        name="unique_active_registration",
        unique=True,
        partialFilterExpression={"status": {"$in": ["registered", "waitlisted"]}}
    ):
        print("✓ Created unique index: registrations(event_id, user_id, status)")
    
    # 2. Optimize event lookups
    if await create_index_safe(db.events, [("event_id", 1)], name="event_id_idx", unique=True):
        print("✓ Created unique index: events(event_id)")
    
    # 3. Optimize registration queries by event
    if await create_index_safe(db.registrations, [("event_id", 1), ("status", 1)], name="event_status_idx"):
        print("✓ Created index: registrations(event_id, status)")
    
    # 4. Optimize user registration lookups
    if await create_index_safe(db.registrations, [("user_id", 1), ("registered_at", -1)], name="user_registrations_idx"):
        print("✓ Created index: registrations(user_id, registered_at)")
    
    # 5. Optimize event status filtering
    if await create_index_safe(db.events, [("status", 1), ("start_time", 1)], name="event_status_time_idx"):
        print("✓ Created index: events(status, start_time)")
    
    print("\n✅ Index creation completed!")
    client.close()


if __name__ == "__main__":
    asyncio.run(create_indexes())
