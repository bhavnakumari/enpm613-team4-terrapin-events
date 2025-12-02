"""
Tests for authentication endpoints.
"""
import pytest
from httpx import AsyncClient
from app.main import app


class TestAuthentication:
    """Test authentication endpoints."""
    
    @pytest.mark.asyncio
    async def test_login_success(self, test_db, sample_users):
        """Test successful login with valid credentials."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/auth/login",
                json={
                    "directory_id": "admin001",
                    "password": "admin123"
                }
            )
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["directory_id"] == "admin001"
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == "admin@umd.edu"
    
    @pytest.mark.asyncio
    async def test_login_invalid_directory_id(self, test_db, sample_users):
        """Test login with non-existent directory ID."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/auth/login",
                json={
                    "directory_id": "nonexistent",
                    "password": "password123"
                }
            )
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 401
        assert "Invalid directory ID or password" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_login_wrong_password(self, test_db, sample_users):
        """Test login with incorrect password."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post(
                "/api/auth/login",
                json={
                    "directory_id": "admin001",
                    "password": "wrongpassword"
                }
            )
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 401
        assert "Invalid directory ID or password" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_login_different_roles(self, test_db, sample_users):
        """Test login for different user roles."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # Test organizer login
            response = await ac.post(
                "/api/auth/login",
                json={
                    "directory_id": "org001",
                    "password": "organizer123"
                }
            )
            assert response.status_code == 200
            assert response.json()["user"]["role"] == "organizer"
            
            # Test participant login
            response = await ac.post(
                "/api/auth/login",
                json={
                    "directory_id": "user001",
                    "password": "user123"
                }
            )
            assert response.status_code == 200
            assert response.json()["user"]["role"] == "participant"
        
        app.dependency_overrides.clear()
    
    @pytest.mark.asyncio
    async def test_protected_endpoint_without_token(self, test_db):
        """Test accessing protected endpoint without authentication."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/api/users/me")
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_protected_endpoint_with_valid_token(self, test_db, sample_users, participant_token):
        """Test accessing protected endpoint with valid token."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/users/me",
                headers={"Authorization": f"Bearer {participant_token}"}
            )
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 200
        data = response.json()
        assert data["directory_id"] == "user001"
    
    @pytest.mark.asyncio
    async def test_protected_endpoint_with_invalid_token(self, test_db):
        """Test accessing protected endpoint with invalid token."""
        async def override_get_db():
            yield test_db
        
        from app.database import get_db
        app.dependency_overrides[get_db] = override_get_db
        
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get(
                "/api/users/me",
                headers={"Authorization": "Bearer invalid_token_here"}
            )
        
        app.dependency_overrides.clear()
        
        assert response.status_code == 401
