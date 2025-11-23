# TerrapinEvents - Quick Setup Guide

## Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)

---

## 1. Start All Services with Docker

### Build and Start Everything
```bash
cd enpm613-team4-terrapin-events
docker-compose -f infra/docker-compose.yml up --build
```

This starts:
- MongoDB (port 27017)
- Backend API (port 8000)
- Frontend (port 3000)

**Wait for all services to start (about 1-2 minutes)**

---

## 2. Setup Database

Open a new terminal and run:

### Create Indexes
```bash
docker exec -it cems_backend python -m app.scripts.create_indexes
```

### Seed Test Users
```bash
docker exec -it cems_backend python -m app.scripts.seed_users
```

**Test Accounts Created:**
- **Participant 1**: `bhavna` / `participant123`
- **Participant 2**: `abhigna` / `participant123`
- **Participant 3**: `teja` / `participant123`
- **Participant 4**: `vineet` / `participant123`
- **Organizer**: `organiser` / `organizer2`
- **Admin**: `admin` / `admin123`

---

## 3. Email Setup (Optional)

### Edit Backend Environment File
```bash
# Edit backend/.env file
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `SMTP_PASSWORD`

### Restart Backend
```bash
docker-compose -f infra/docker-compose.yml restart backend
```

---

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MongoDB**: localhost:27017

---

## Quick Commands

### Stop All Services
```bash
docker-compose -f infra/docker-compose.yml down
```

### Restart All Services
```bash
docker-compose -f infra/docker-compose.yml restart
```

### View Logs
```bash
# All services
docker-compose -f infra/docker-compose.yml logs -f

# Specific service
docker-compose -f infra/docker-compose.yml logs -f backend
docker-compose -f infra/docker-compose.yml logs -f frontend
```

---

## Troubleshooting

### Services won't start
```bash
docker-compose -f infra/docker-compose.yml down
docker-compose -f infra/docker-compose.yml up --build
```

### Reset Database
```bash
docker exec -it cems_mongo mongosh
use terrapin_events
db.dropDatabase()
exit
# Re-run create_indexes and seed_users
```

### Clear Everything and Restart
```bash
docker-compose -f infra/docker-compose.yml down -v
docker-compose -f infra/docker-compose.yml up --build
# Re-run database setup (create_indexes and seed_users)
```

---

## Test the Application

1. Open http://localhost:3000
2. Login with: `bhavna` / `participant123`
3. Browse events and register
4. Logout and login as organizer: `organiser` / `organizer2`
5. Create events and manage drafts
6. Login as admin: `admin` / `admin123` to approve events

Done! 🎉
