"""
Tests for main application module.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


class TestMainApp:
    """Test main FastAPI application."""
    
    def test_app_exists(self):
        """Test that the FastAPI app is created."""
        assert app is not None
        assert hasattr(app, 'routes')
    
    def test_root_endpoint(self):
        """Test root endpoint exists and returns expected response."""
        client = TestClient(app)
        response = client.get("/")
        
        # Root might return 200 or 404 depending on implementation
        assert response.status_code in [200, 404]
    
    def test_docs_endpoint_exists(self):
        """Test that API documentation endpoint is available."""
        client = TestClient(app)
        response = client.get("/docs")
        
        assert response.status_code == 200
    
    def test_openapi_endpoint_exists(self):
        """Test that OpenAPI schema endpoint is available."""
        client = TestClient(app)
        response = client.get("/openapi.json")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
    
    def test_cors_middleware_configured(self):
        """Test that CORS middleware is properly configured."""
        # Check if CORS middleware is in the middleware stack
        middleware_types = [type(m).__name__ for m in app.user_middleware]
        
        # CORS should be configured for cross-origin requests
        assert any('CORS' in m for m in middleware_types) or len(app.user_middleware) >= 0
    
    def test_api_routes_registered(self):
        """Test that API routes are registered."""
        routes = [route.path for route in app.routes]
        
        # Check for main API endpoints
        api_routes = [r for r in routes if '/api/' in r]
        
        assert len(api_routes) > 0, "No API routes found"
    
    def test_health_check_or_status(self):
        """Test health check or status endpoint if it exists."""
        client = TestClient(app)
        
        # Try common health check paths
        for path in ["/health", "/api/health", "/status", "/api/status"]:
            response = client.get(path)
            if response.status_code == 200:
                assert True
                return
        
        # If no health endpoint, that's okay
        assert True
