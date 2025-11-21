from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    async def connect(self):
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}")
            
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000
            )
            
            self.db = self.client[settings.MONGODB_DB_NAME]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info(f"Successfully connected to database: {settings.MONGODB_DB_NAME}")
            
            # Create indexes for performance
            await self._create_indexes()
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def disconnect(self):
        if self.client:
            logger.info("Closing MongoDB connection")
            self.client.close()
            logger.info("MongoDB connection closed")

    async def _create_indexes(self):
        try:
            # User indexes
            await self.db.users.create_index("directory_id", unique=True)
            await self.db.users.create_index("email", unique=True, sparse=True)
            
            # Event indexes
            await self.db.events.create_index("event_id", unique=True)
            await self.db.events.create_index("organizer_id")
            await self.db.events.create_index("status")
            await self.db.events.create_index("start_time")
            
            # Registration indexes
            await self.db.registrations.create_index("registration_id", unique=True)
            await self.db.registrations.create_index("event_id")
            await self.db.registrations.create_index("user_id")
            await self.db.registrations.create_index([("event_id", 1), ("user_id", 1)])
            await self.db.registrations.create_index("status")
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.warning(f"Error creating indexes: {e}")

    def get_database(self) -> AsyncIOMotorDatabase:
        if self.db is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.db


# Global database manager instance
db_manager = DatabaseManager()


async def get_db() -> AsyncIOMotorDatabase:
    return db_manager.get_database()
