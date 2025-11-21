from pydantic import BaseModel, Field
from app.models.user import UserPublic


class LoginRequest(BaseModel):
    directory_id: str = Field(..., min_length=1, description="UMD Directory ID")
    password: str = Field(..., min_length=1, description="User password")

    class Config:
        json_schema_extra = {
            "example": {
                "directory_id": "118123456",
                "password": "password123"
            }
        }

class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserPublic = Field(..., description="User information")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "directory_id": "118123456",
                    "email": "student@umd.edu",
                    "first_name": "John",
                    "last_name": "Doe",
                    "role": "participant"
                }
            }
        }


class TokenData(BaseModel):
    directory_id: str
    role: str
