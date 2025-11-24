"""
Tests for config module.
"""
import pytest
from app.config import Settings, settings


class TestConfig:
    """Test configuration settings."""
    
    def test_settings_instance(self):
        """Test that settings can be instantiated."""
        assert settings is not None
        assert isinstance(settings, Settings)
    
    def test_settings_has_required_fields(self):
        """Test that settings has all required configuration fields."""
        # Database settings
        assert hasattr(settings, 'MONGODB_URL')
        assert hasattr(settings, 'MONGODB_DB_NAME')
        
        # JWT settings
        assert hasattr(settings, 'JWT_SECRET_KEY')
        assert hasattr(settings, 'JWT_ALGORITHM')
        assert hasattr(settings, 'JWT_ACCESS_TOKEN_EXPIRE_MINUTES')
    
    def test_mongodb_url_format(self):
        """Test MongoDB URL is properly formatted."""
        assert isinstance(settings.MONGODB_URL, str)
        assert settings.MONGODB_URL.startswith('mongodb://') or settings.MONGODB_URL.startswith('mongodb+srv://')
    
    def test_jwt_secret_key_exists(self):
        """Test that JWT secret key is configured."""
        assert settings.JWT_SECRET_KEY is not None
        assert len(settings.JWT_SECRET_KEY) > 0
    
    def test_jwt_algorithm_configured(self):
        """Test that JWT algorithm is set."""
        assert settings.JWT_ALGORITHM is not None
        assert settings.JWT_ALGORITHM == "HS256"
    
    def test_app_name_configured(self):
        """Test that app name is configured."""
        assert hasattr(settings, 'APP_NAME')
        assert isinstance(settings.APP_NAME, str)
    
    def test_cors_origins_configured(self):
        """Test that CORS origins are configured."""
        assert hasattr(settings, 'CORS_ORIGINS')
        assert isinstance(settings.CORS_ORIGINS, list)
        assert len(settings.CORS_ORIGINS) > 0
    
    def test_bcrypt_rounds_configured(self):
        """Test that bcrypt rounds are configured."""
        assert hasattr(settings, 'BCRYPT_ROUNDS')
        assert isinstance(settings.BCRYPT_ROUNDS, int)
        assert settings.BCRYPT_ROUNDS >= 10
