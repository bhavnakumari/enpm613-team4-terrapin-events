"""
MongoDB database connection manager using Motor (async driver).
Handles connection lifecycle and provides database access.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    """
    Manages MongoDB connection with async Motor driver.
    Follows singleton pattern for connection pooling.
    """
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    async def connect(self):
        """
        Establish connection to MongoDB.
        Called during application startup.
        """
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
        """
        Close MongoDB connection.
        Called during application shutdown.
        """
        if self.client:
            logger.info("Closing MongoDB connection")
            self.client.close()
            logger.info("MongoDB connection closed")

    async def _create_indexes(self):
        """
        Create database indexes for optimal query performance.
        """
        try:
            # Users collection - unique directory_id for authentication
            await self.db.users.create_index("directory_id", unique=True)
            await self.db.users.create_index("email", unique=True, sparse=True)
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.warning(f"Error creating indexes: {e}")

    def get_database(self) -> AsyncIOMotorDatabase:
        """
        Get database instance for dependency injection.
        """
        if self.db is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.db


# Global database manager instance
db_manager = DatabaseManager()


async def get_db() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency for database access.
    
    Usage:
        @app.get("/endpoint")
        async def my_endpoint(db: AsyncIOMotorDatabase = Depends(get_db)):
            users = await db.users.find_one({"directory_id": "123"})
    """
    return db_manager.get_database()
