from __future__ import annotations

import logging
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path
from typing import Optional

from app.config import settings
from app.models.registration import RegistrationStatus

logger = logging.getLogger(__name__)

# Base directory: /app/app
BASE_DIR = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = BASE_DIR / "email_Templates"
STATIC_DIR = BASE_DIR / "static"


def load_template(filename: str) -> str:
    """
    Load an HTML email template from app/templates/.
    """
    path = TEMPLATES_DIR / filename
    try:
        return path.read_text(encoding="utf-8")
    except Exception as e:
        logger.error("Failed to load email template %s: %s", path, e)
        # Fallback to simple HTML so email still sends
        return "<html><body><p>Email content could not be loaded.</p></body></html>"


def _send_email_with_image(
    to_email: str,
    subject: str,
    html_body: str,
    image_filename: str,
    image_cid: str = "eventlogo",
):
    """
    Reusable helper that sends an email with an embedded image (CID).
    - image_filename is relative to app/static/
    """

    # If SMTP not configured, skip
    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        logger.warning("SMTP not configured; skipping email.")
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email

    # Plain-text fallback
    msg.set_content(
        "This email contains HTML content. Please view it in an HTML-capable email client."
    )

    # HTML part (this is where our CID image will be referenced)
    msg.add_alternative(html_body, subtype="html")

    # Attach image
    image_path = STATIC_DIR / image_filename
    try:
        with image_path.open("rb") as img:
            # msg.get_payload()[1] is the HTML alternative part
            msg.get_payload()[1].add_related(
                img.read(),
                maintype="image",
                subtype="png",  # change if you use jpg
                cid=f"<{image_cid}>",
            )
        logger.info("Attached image %s to email", image_path)
    except Exception as e:
        logger.error("Failed to attach image %s: %s", image_path, e)

    # Send via SMTP
    context = ssl.create_default_context()
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls(context=context)
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("Email sent to %s with subject '%s'", to_email, subject)
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, e)


# ─────────────────────────────
#  Registration confirmation
# ─────────────────────────────

def send_registration_email(
    to_email: str,
    event_title: str,
    event_start_time: Optional[datetime],
    event_location: str,
    status: RegistrationStatus,
):
    when = (
        event_start_time.strftime("%A, %B %d %Y, %I:%M %p")
        if event_start_time
        else "To be announced"
    )

    # Load external HTML template
    html_template = load_template("registration_email.html")

    # You can adjust text based on status if you want
    status_text = (
        "Your registration is <strong>CONFIRMED 🎉</strong>"
        if status == RegistrationStatus.REGISTERED
        else "You have been added to the <strong>WAITLIST ⏳</strong>"
    )

    # Replace placeholders
    html_body = (
        html_template
        .replace("{{status_block}}", status_text)
        .replace("{{event_title}}", event_title)
        .replace("{{event_datetime}}", when)
        .replace("{{event_location}}", event_location)
    )

    _send_email_with_image(
        to_email=to_email,
        subject=f"[Terrapin Events] Registration for {event_title}",
        html_body=html_body,
        image_filename="umd.jpg",  # file in app/static/logo.png
        image_cid="eventlogo",
    )


# ─────────────────────────────
#  Cancellation
# ─────────────────────────────

def send_cancellation_email(
    to_email: str,
    event_title: str,
    event_start_time: Optional[datetime],
    event_location: str,
):
    when = (
        event_start_time.strftime("%A, %B %d %Y, %I:%M %p")
        if event_start_time
        else "To be announced"
    )

    # You can use a separate template (cancellation_email.html),
    # or reuse the same and change the text.
    html_template = load_template("cancellation_email.html")

    html_body = (
        html_template
        .replace("{{event_title}}", event_title)
        .replace("{{event_datetime}}", when)
        .replace("{{event_location}}", event_location)
    )

    _send_email_with_image(
        to_email=to_email,
        subject=f"[Terrapin Events] Cancellation for {event_title}",
        html_body=html_body,
        image_filename="umd.jpg",
        image_cid="eventlogo",
    )


# ─────────────────────────────
#  Waitlist promotion
# ─────────────────────────────

def send_waitlist_promotion_email(
    to_email: str,
    event_title: str,
    event_start_time: Optional[datetime],
    event_location: str,
):
    when = (
        event_start_time.strftime("%A, %B %d %Y, %I:%M %p")
        if event_start_time
        else "To be announced"
    )

    html_template = load_template("waitlist_promotion_email.html")

    html_body = (
        html_template
        .replace("{{event_title}}", event_title)
        .replace("{{event_datetime}}", when)
        .replace("{{event_location}}", event_location)
    )

    _send_email_with_image(
        to_email=to_email,
        subject=f"[Terrapin Events] You're off the waitlist for {event_title}!",
        html_body=html_body,
        image_filename="umd.jpg",
        image_cid="eventlogo",
    )