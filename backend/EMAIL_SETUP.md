# Email Configuration Guide

## Why You're Not Receiving Emails

The email functionality is implemented but **SMTP settings are not configured**. The system silently skips sending emails when SMTP is not set up to avoid breaking the registration flow.

## Quick Setup (3 options)

### Option 1: Gmail (Easiest for testing)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and generate a password
   - Copy the 16-character password

3. **Create `.env` file** in `backend/` directory:
```bash
cp .env.example .env
```

4. **Edit `.env` file** with your Gmail credentials:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop  # Your app password (remove spaces)
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Terrapin Events
```

5. **Restart Docker container**:
```bash
cd infra
docker-compose restart backend
```

### Option 2: Mailtrap (Best for development/testing)

Mailtrap captures emails without actually sending them - perfect for testing!

1. **Sign up** at https://mailtrap.io (free tier available)
2. **Get credentials** from your inbox settings
3. **Create `.env` file** in `backend/` directory with:
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USERNAME=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM_EMAIL=noreply@terrapinevent.com
SMTP_FROM_NAME=Terrapin Events
```

4. **Restart Docker**:
```bash
cd infra
docker-compose restart backend
```

### Option 3: SendGrid (Production-ready)

1. **Sign up** at https://sendgrid.com (free tier: 100 emails/day)
2. **Create API Key** from Settings → API Keys
3. **Create `.env` file** in `backend/` directory with:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@terrapinevent.com
SMTP_FROM_NAME=Terrapin Events
```

4. **Restart Docker**:
```bash
cd infra
docker-compose restart backend
```

## Verify Email Configuration

After setting up SMTP, check the backend logs when you register for an event:

**Success:**
```
INFO: Registration email sent successfully to student@umd.edu for event 'Tech Talk'
```

**Not Configured:**
```
WARNING: Email not sent to student@umd.edu: SMTP not configured. Set SMTP_HOST and SMTP_FROM_EMAIL in .env file.
```

**Error:**
```
ERROR: Failed to send email to student@umd.edu: [error details]
```

## Docker Volume Mount

The `.env` file needs to be mounted into the Docker container. Check `infra/docker-compose.yml`:

```yaml
services:
  backend:
    volumes:
      - ../backend/app:/app/app
      - ../backend/.env:/app/.env  # Add this line if missing
```

If you need to add the `.env` mount, restart Docker Compose:
```bash
cd infra
docker-compose down
docker-compose up -d
```

## Testing Emails

1. Register for an event
2. Check backend logs: `docker logs enpm613-team4-terrapin-events-backend-1`
3. For Mailtrap: Check your inbox at https://mailtrap.io
4. For Gmail: Check your email (might be in spam folder)

## Email Features Currently Implemented

✅ Registration confirmation email (registered or waitlisted)
✅ Background task processing (non-blocking)
✅ Graceful failure (registration succeeds even if email fails)
✅ Detailed logging for debugging

## Next Steps After Configuration

Once emails work, you can add:
- Waitlist promotion notifications
- Event reminder emails
- Event update notifications
- Cancellation confirmations
