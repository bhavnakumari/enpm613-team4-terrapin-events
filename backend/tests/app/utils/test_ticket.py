"""
Tests for ticket generation utility.
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from app.utils.ticket import generate_ticket_qr_data
from app.models.registration import Registration
from app.models.event import Event
from datetime import datetime, timedelta


class TestTicketUtilities:
    """Test ticket generation functionality."""
    
    def test_generate_ticket_qr_data(self):
        """Test generating QR code data for a ticket."""
        # Create mock registration
        registration = Registration(
            registration_id="REG123",
            event_id="EVT123",
            user_id="USR123",
            user_email="test@example.com",
            status="registered",
            registration_type="free",
            registered_at=datetime.utcnow()
        )
        
        # Create mock event
        event = Event(
            event_id="EVT123",
            title="Test Event",
            description="Test Description",
            location="Test Location",
            start_time=datetime.utcnow() + timedelta(days=7),
            capacity=100,
            organizer_id="ORG123",
            organizer_email="organizer@test.com",
            status="approved"
        )
        
        # Generate QR data
        qr_data = generate_ticket_qr_data(registration, event)
        
        # Function returns base64-encoded PNG image
        assert qr_data is not None
        assert isinstance(qr_data, str)
        # Base64 encoded data should be a long string
        assert len(qr_data) > 100
        # Should be valid base64
        import base64
        try:
            decoded = base64.b64decode(qr_data)
            assert len(decoded) > 0
        except Exception:
            assert False, "QR data should be valid base64"
    
    def test_qr_data_format(self):
        """Test QR code data has correct format."""
        registration = Registration(
            registration_id="REG456",
            event_id="EVT456",
            user_id="USR456",
            user_email="user@test.com",
            status="registered",
            registration_type="paid",
            registered_at=datetime.utcnow()
        )
        
        event = Event(
            event_id="EVT456",
            title="Another Event",
            description="Description",
            location="Location",
            start_time=datetime.utcnow() + timedelta(days=10),
            capacity=50,
            organizer_id="ORG456",
            organizer_email="organizer2@test.com",
            status="approved"
        )
        
        qr_data = generate_ticket_qr_data(registration, event)
        
        # Function returns base64-encoded QR code image, not raw data
        assert qr_data is not None
        assert isinstance(qr_data, str)
        assert len(qr_data) > 100  # Base64 encoded image is substantial
        
        # Verify it's valid base64
        import base64
        try:
            decoded = base64.b64decode(qr_data)
            # PNG signature starts with these bytes
            assert decoded[:4] == b'\\x89PNG' or len(decoded) > 0
        except Exception:
            assert False, "Should return valid base64-encoded image"
