from datetime import datetime
from email.message import EmailMessage
import smtplib
import ssl
from typing import Optional

from app.config import settings
from app.models.registration import RegistrationStatus


def send_registration_email(
    to_email: str,
    event_title: str,
    event_start_time: Optional[datetime],
    event_location: str,
    status: RegistrationStatus,
):
    """
    Sends a simple email to the participant after registration / waitlist.
    This is a synchronous function intended to be run in a FastAPI BackgroundTask.
    """

    # If email is not configured, just skip silently (avoid breaking registration)
    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        return

    # Human-friendly status text
    if status == RegistrationStatus.REGISTERED:
        status_line = "Your registration is CONFIRMED."
    elif status == RegistrationStatus.WAITLISTED:
        status_line = "You have been added to the WAITLIST."
    else:
        status_line = f"Your registration status is: {status.value}"

    # Build email body
    when = event_start_time.strftime("%A, %B %d %Y, %I:%M %p") if event_start_time else "TBA"

    body = f"""Hello,

You have successfully { 'registered for' if status == RegistrationStatus.REGISTERED else 'requested to join' } the event:

    "{event_title}"

{status_line}

Event details:
- Event: {event_title}
- Date & Time: {when}
- Location: {event_location}

If you did not initiate this registration, please contact the organizers.

Best,
{settings.SMTP_FROM_NAME}
"""

    msg = EmailMessage()
    msg["Subject"] = f"[Terrapin Events] Registration for {event_title}"
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg.set_content(body)

    context = ssl.create_default_context()

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls(context=context)
        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)