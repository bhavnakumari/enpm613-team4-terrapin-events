"""
Tests for security utilities (password hashing, JWT tokens).
"""
import pytest
from datetime import datetime, timedelta
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)


class TestPasswordHashing:
    """Test password hashing and verification."""
    
    def test_hash_password(self):
        """Test password hashing."""
        password = "test_password_123"
        hashed = hash_password(password)
        
        assert hashed != password
        assert hashed.startswith("$2b$")
        assert len(hashed) > 50
    
    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "correct_password"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "correct_password"
        hashed = hash_password(password)
        
        assert verify_password("wrong_password", hashed) is False
    
    def test_different_hashes_for_same_password(self):
        """Test that same password produces different hashes (due to salt)."""
        password = "same_password"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        assert hash1 != hash2
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)


class TestJWTTokens:
    """Test JWT token creation and validation."""
    
    def test_create_access_token(self):
        """Test JWT token creation."""
        data = {"directory_id": "test123", "role": "participant"}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 50
        assert "." in token  # JWT tokens have dots
    
    def test_decode_access_token_valid(self):
        """Test decoding valid JWT token."""
        data = {"directory_id": "test123", "role": "organizer"}
        token = create_access_token(data)
        
        decoded = decode_access_token(token)
        
        assert decoded is not None
        assert decoded.directory_id == "test123"
        assert decoded.role == "organizer"
    
    def test_decode_access_token_invalid(self):
        """Test decoding invalid JWT token."""
        invalid_token = "invalid.token.here"
        
        decoded = decode_access_token(invalid_token)
        
        assert decoded is None
    
    def test_decode_access_token_tampered(self):
        """Test decoding tampered JWT token."""
        data = {"directory_id": "test123", "role": "participant"}
        token = create_access_token(data)
        
        # Tamper with the token
        tampered_token = token[:-5] + "xxxxx"
        
        decoded = decode_access_token(tampered_token)
        
        assert decoded is None
    
    def test_token_contains_expiration(self):
        """Test that token contains expiration time."""
        from jose import jwt
        from app.config import settings
        
        data = {"directory_id": "test123", "role": "admin"}
        token = create_access_token(data)
        
        # Decode without verification to check expiration
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        
        assert "exp" in payload
        assert "directory_id" in payload
        assert "role" in payload
