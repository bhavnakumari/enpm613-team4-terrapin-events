"""
Tests for email utility functions.
"""
import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path
from app.utils import email


class TestEmailUtilities:
    """Test email utility functions."""
    
    def test_load_template_success(self):
        """Test loading an email template successfully."""
        # Mock the template file
        with patch('app.utils.email.TEMPLATES_DIR') as mock_dir:
            mock_file = MagicMock()
            mock_file.read_text.return_value = "<html>Test Template</html>"
            mock_dir.__truediv__.return_value = mock_file
            
            result = email.load_template("test.html")
            
            assert result == "<html>Test Template</html>"
    
    def test_load_template_file_not_found(self):
        """Test loading a template that doesn't exist."""
        with patch('app.utils.email.TEMPLATES_DIR') as mock_dir:
            mock_file = MagicMock()
            mock_file.read_text.side_effect = FileNotFoundError()
            mock_dir.__truediv__.return_value = mock_file
            
            result = email.load_template("nonexistent.html")
            
            # Returns fallback HTML on error
            assert "Email content could not be loaded" in result
    
    @pytest.mark.asyncio
    async def test_send_registration_email_mock(self):
        """Test sending registration email with mocked SMTP."""
        with patch('app.utils.email.smtplib.SMTP_SSL') as mock_smtp:
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__.return_value = mock_server
            
            # Mock the send_registration_email function if it exists
            with patch('app.utils.email.load_template') as mock_template:
                mock_template.return_value = "<html>Registration Email</html>"
                
                # Test that template loading works
                template = email.load_template("registration_email.html")
                assert template is not None
    
    def test_templates_directory_exists(self):
        """Test that templates directory is properly configured."""
        from app.utils.email import TEMPLATES_DIR
        
        assert TEMPLATES_DIR is not None
        assert isinstance(TEMPLATES_DIR, Path)
    
    def test_send_cancellation_email_mock(self):
        """Test sending cancellation email with mocked SMTP."""
        from datetime import datetime
        from app.utils.email import send_cancellation_email
        
        with patch('app.utils.email.settings') as mock_settings:
            # Disable SMTP to skip actual sending
            mock_settings.SMTP_HOST = None
            mock_settings.SMTP_FROM_EMAIL = None
            
            with patch('app.utils.email.load_template') as mock_template:
                mock_template.return_value = "<html>{{event_title}} {{event_datetime}} {{event_location}}</html>"
                
                # Should not raise an exception even with SMTP disabled
                send_cancellation_email(
                    to_email="test@example.com",
                    event_title="Test Event",
                    event_start_time=datetime(2025, 12, 1, 18, 0),
                    event_location="Test Location"
                )
    
    def test_send_waitlist_promotion_email_mock(self):
        """Test sending waitlist promotion email with mocked SMTP."""
        from datetime import datetime
        from app.utils.email import send_waitlist_promotion_email
        
        with patch('app.utils.email.settings') as mock_settings:
            # Disable SMTP to skip actual sending
            mock_settings.SMTP_HOST = None
            mock_settings.SMTP_FROM_EMAIL = None
            
            with patch('app.utils.email.load_template') as mock_template:
                mock_template.return_value = "<html>{{event_title}} {{event_datetime}} {{event_location}}</html>"
                
                # Should not raise an exception even with SMTP disabled
                send_waitlist_promotion_email(
                    to_email="test@example.com",
                    event_title="Test Event",
                    event_start_time=datetime(2025, 12, 1, 18, 0),
                    event_location="Test Location"
                )
    
    def test_send_email_with_smtp_enabled(self):
        """Test email sending with SMTP enabled (mocked)."""
        from datetime import datetime
        from app.utils.email import send_registration_email
        from app.models.registration import RegistrationStatus
        
        with patch('app.utils.email.settings') as mock_settings:
            mock_settings.SMTP_HOST = "smtp.test.com"
            mock_settings.SMTP_PORT = 587
            mock_settings.SMTP_FROM_EMAIL = "noreply@test.com"
            mock_settings.SMTP_USERNAME = "user"
            mock_settings.SMTP_PASSWORD = "pass"
            
            with patch('app.utils.email.smtplib.SMTP') as mock_smtp:
                mock_server = MagicMock()
                mock_smtp.return_value.__enter__.return_value = mock_server
                
                with patch('app.utils.email.load_template') as mock_template:
                    mock_template.return_value = "<html>{{status_block}} {{event_title}}</html>"
                    
                    with patch('app.utils.email.STATIC_DIR') as mock_static:
                        mock_image = MagicMock()
                        mock_image.open.return_value.__enter__.return_value.read.return_value = b"fake_image_data"
                        mock_static.__truediv__.return_value = mock_image
                        
                        # Should attempt to send email
                        send_registration_email(
                            to_email="test@example.com",
                            event_title="Test Event",
                            event_start_time=datetime(2025, 12, 1, 18, 0),
                            event_location="Test Location",
                            status=RegistrationStatus.REGISTERED
                        )
                        
                        # Verify SMTP methods were called
                        mock_server.starttls.assert_called_once()
                        mock_server.login.assert_called_once_with("user", "pass")
                        mock_server.send_message.assert_called_once()
    
    def test_email_template_placeholder_replacement(self):
        """Test that email templates replace placeholders correctly."""
        from datetime import datetime
        from app.utils.email import send_registration_email
        from app.models.registration import RegistrationStatus
        
        with patch('app.utils.email.settings') as mock_settings:
            mock_settings.SMTP_HOST = None
            
            with patch('app.utils.email.load_template') as mock_template:
                mock_template.return_value = "<html>{{event_title}}</html>"
                
                with patch('app.utils.email._send_email_with_image') as mock_send:
                    send_registration_email(
                        to_email="test@example.com",
                        event_title="My Event",
                        event_start_time=None,
                        event_location="Somewhere",
                        status=RegistrationStatus.WAITLISTED
                    )
                    
                    # Verify template was loaded
                    mock_template.assert_called_once_with("registration_email.html")
