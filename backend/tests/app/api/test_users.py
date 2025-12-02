"""
Tests for user profile endpoints.
"""
import pytest
from httpx import AsyncClient
from app.main import app


class TestUserProfile:
    """Test user profile management endpoints."""
    
    @pytest.mark.asyncio
    async def test_get_my_profile(self, test_db, sample_users, participant_token):
        """Test getting current user's profile."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/users/me",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["directory_id"] == "user001"
        assert data["email"] == "participant@umd.edu"
        assert data["first_name"] == "Test"
        assert data["last_name"] == "Participant"
        assert data["role"] == "participant"
        assert data["major"] == "Engineering"
        assert data["year"] == "junior"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_update_profile_success(self, test_db, sample_users, participant_token):
        """Test updating user profile with valid data."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.patch(
                "/api/users/me",
                headers={"Authorization": f"Bearer {participant_token}"},
                json={
                    "first_name": "Updated",
                    "major": "Computer Science",
                    "year": "senior"
                }
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"
        assert data["major"] == "Computer Science"
        assert data["year"] == "senior"
        # Unchanged fields should persist
        assert data["last_name"] == "Participant"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_update_profile_validation_error(self, test_db, sample_users, participant_token):
        """Test profile update with invalid data."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.patch(
                "/api/users/me",
                headers={"Authorization": f"Bearer {participant_token}"},
                json={
                    "year": "invalid_year"  # Should be one of: freshman, sophomore, junior, senior
                }
            )
        
        assert response.status_code == 422  # Validation error
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_profile_unauthorized(self, test_db):
        """Test accessing profile without authentication."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/api/users/me")
        
        # FastAPI returns 403 when credentials are not provided
        assert response.status_code in [401, 403]
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_user_by_directory_id(self, test_db, sample_users, participant_token):
        """Test getting another user's profile by directory ID."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/users/admin001",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["directory_id"] == "admin001"
        assert data["email"] == "admin@umd.edu"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_get_user_not_found(self, test_db, sample_users, participant_token):
        """Test getting a user that doesn't exist."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/users/nonexistent999",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        assert response.status_code == 404
        
        app.dependency_overrides.clear()
