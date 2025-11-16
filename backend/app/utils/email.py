from datetime import datetime
from email.message import EmailMessage
import smtplib
import ssl
import logging
from typing import Optional

from app.config import settings
from app.models.registration import RegistrationStatus

logger = logging.getLogger(__name__)


def send_registration_email(
    to_email: str,
    event_title: str,
    event_start_time: Optional[datetime],
    event_location: str,
    status: RegistrationStatus,
):
    """
    Sends an email to the participant after registration / waitlist.
    Intended to be called as a FastAPI BackgroundTask.
    """

    # If email is not configured, do nothing (avoid breaking registration)
    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        logger.warning("SMTP not configured; skipping registration email.")
        return

    # Pretty status line
    if status == RegistrationStatus.REGISTERED:
        status_line = "Your registration is CONFIRMED."
    elif status == RegistrationStatus.WAITLISTED:
        status_line = "You have been added to the WAITLIST."
    else:
        status_line = f"Your registration status is: {status.value}"

    # Format event date/time
    if event_start_time:
        when = event_start_time.strftime("%A, %B %d %Y, %I:%M %p")
    else:
        when = "To be announced"

    body = f"""Hello,

You have successfully {'registered for' if status == RegistrationStatus.REGISTERED else 'requested to join'} the event:

    "{event_title}"

{status_line}

Event details:
- Event: {event_title}
- Date & Time: {when}
- Location: {event_location}

If you did not initiate this registration, please contact the organizers.

Best regards,
{settings.SMTP_FROM_NAME}
"""

    msg = EmailMessage()
    msg["Subject"] = f"[Terrapin Events] Registration for {event_title}"
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg.set_content(body)

    context = ssl.create_default_context()

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls(context=context)
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("Registration email sent to %s for event '%s'", to_email, event_title)
    except Exception as e:
        # Log but never crash the request
        logger.error("Failed to send registration email to %s: %s", to_email, e)


def send_cancellation_email(
    to_email: str,
    event_title: str,
    event_start_time: Optional[datetime],
    event_location: str,
):
    """
    Sends an email to the participant after they cancel their registration.
    Intended to be used as a BackgroundTask.
    """

    # If SMTP is not configured, skip silently
    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        logger.warning("SMTP not configured; skipping cancellation email.")
        return

    if event_start_time:
        when = event_start_time.strftime("%A, %B %d %Y, %I:%M %p")
    else:
        when = "To be announced"

    body = f"""Hello,

Your registration for the event:

    "{event_title}"

has been successfully CANCELLED.

Event details:
- Event: {event_title}
- Date & Time: {when}
- Location: {event_location}

If you did not request this cancellation, please contact the organizers immediately.

Best regards,
{settings.SMTP_FROM_NAME}
"""

    msg = EmailMessage()
    msg["Subject"] = f"[Terrapin Events] Cancellation for {event_title}"
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg.set_content(body)

    context = ssl.create_default_context()

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls(context=context)
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("Cancellation email sent to %s for event '%s'", to_email, event_title)
    except Exception as e:
        logger.error("Failed to send cancellation email to %s: %s", to_email, e)