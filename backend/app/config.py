from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    APP_NAME: str = "Terrapin Events API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    MONGODB_URL: str = "mongodb://mongo:27017"
    MONGODB_DB_NAME: str = "terrapin_events"

    JWT_SECRET_KEY: str = "your-secret-key-change-in-production-use-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"]

    BCRYPT_ROUNDS: int = 12
    
    # Request limits (to prevent abuse)
    MAX_REGISTRATION_BATCH_SIZE: int = 10
    MAX_EVENT_DESCRIPTION_LENGTH: int = 5000
    MAX_UPLOAD_SIZE_MB: int = 10

    # Email / SMTP settings
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    SMTP_FROM_NAME: str = "Terrapin Events"


settings = Settings()
