import base64
from io import BytesIO
from datetime import datetime
from typing import Optional

import qrcode

from app.models.registration import Registration
from app.models.event import Event


def generate_ticket_qr_data(registration: Registration, event: Event) -> str:
    """
    Generate a QR code as base64 data URL payload for a ticket.
    Encodes a simple structured string that could be used at check-in.
    """
    payload = {
        "type": "TERRAPIN_EVENT_TICKET",
        "registration_id": registration.registration_id,
        "event_id": registration.event_id,
        "user_id": registration.user_id,
        "user_email": registration.user_email,
    }
    # Simple string encoding; you could use JSON instead
    data_str = (
        f"{payload['type']}|{payload['registration_id']}|"
        f"{payload['event_id']}|{payload['user_id']}|{payload['user_email']}"
    )

    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4,
    )
    qr.add_data(data_str)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return base64.b64encode(buffer.read()).decode("utf-8")


def format_event_datetime(dt: Optional[datetime]) -> str:
    if not dt:
        return "To be announced"
    # You can adjust this format as you like
    return dt.strftime("%A, %B %d %Y, %I:%M %p")