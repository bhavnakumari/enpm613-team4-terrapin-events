# Mock CAS Login - Setup & Testing Guide

## ✅ What We Built

**Production-ready authentication system with:**
- Mock CAS login (directory_id + password)
- Bcrypt password hashing
- JWT access tokens (24h expiration)
- MongoDB async with Motor
- 3 test users (participant, organizer, admin)

---

## 🚀 Step-by-Step Setup

### 1. Rebuild Docker Containers

Since we updated requirements.txt, rebuild:

```cmd
cd c:\Users\vinee\OneDrive\Desktop\academics\Projects\TerrapinEvents\enpm613-team4-terrapin-events
docker compose -f infra\docker-compose.yml down
docker compose -f infra\docker-compose.yml build --no-cache backend
docker compose -f infra\docker-compose.yml up mongo backend
```

Wait for logs showing:
```
INFO - Successfully connected to database: terrapin_events
INFO - Application startup complete
```

### 2. Seed Test Users

Open a NEW terminal and run:

```cmd
docker exec -it cems_backend python -m app.scripts.seed_users
```

You'll see:
```
===========================================================
TEST USER CREDENTIALS
============================================================

1. PARTICIPANT
   Directory ID: 118123456
   Password: participant123

2. ORGANIZER
   Directory ID: 118234567
   Password: organizer123

3. ADMIN
   Directory ID: 118345678
   Password: admin123
============================================================
```

### 3. Test Login Endpoint

**Option A: Using curl**
```cmd
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"directory_id\":\"118123456\",\"password\":\"participant123\"}"
```

**Option B: Using PowerShell**
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"directory_id":"118123456","password":"participant123"}'
```

**Option C: Using API Docs (Easiest)**
1. Open http://localhost:8000/docs
2. Click POST /api/auth/login
3. Click "Try it out"
4. Enter:
   ```json
   {
     "directory_id": "118123456",
     "password": "participant123"
   }
   ```
5. Click "Execute"

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "directory_id": "118123456",
    "email": "participant@umd.edu",
    "first_name": "John",
    "last_name": "Doe",
    "role": "participant"
  }
}
```

---

## 📋 Test Cases

### ✅ Test 1: Successful Login (Participant)
```json
POST /api/auth/login
{
  "directory_id": "118123456",
  "password": "participant123"
}
```
**Expected:** 200 OK + JWT token + user info

### ✅ Test 2: Successful Login (Organizer)
```json
{
  "directory_id": "118234567",
  "password": "organizer123"
}
```
**Expected:** 200 OK + role="organizer"

### ✅ Test 3: Successful Login (Admin)
```json
{
  "directory_id": "118345678",
  "password": "admin123"
}
```
**Expected:** 200 OK + role="admin"

### ❌ Test 4: Wrong Password
```json
{
  "directory_id": "118123456",
  "password": "wrongpassword"
}
```
**Expected:** 401 Unauthorized
```json
{
  "detail": "Invalid directory ID or password"
}
```

### ❌ Test 5: Non-existent User
```json
{
  "directory_id": "999999999",
  "password": "anypassword"
}
```
**Expected:** 401 Unauthorized

---

## 🔧 How To Change Test Users

### Edit the seed script:
`backend/app/scripts/seed_users.py`

Change credentials here:
```python
test_users = [
    {
        "directory_id": "YOUR_ID_HERE",  # ← Change this
        "password_hash": hash_password("YOUR_PASSWORD"),  # ← And this
        "email": "youremail@umd.edu",
        # ... rest of fields
    }
]
```

Then re-run:
```cmd
docker exec -it cems_backend python -m app.scripts.seed_users
```

---

## 🏗️ Architecture Overview

```
Frontend (Mock CAS UI)
    ↓
    POST /api/auth/login
    { directory_id, password }
    ↓
Backend (FastAPI)
    ↓
1. Find user in MongoDB by directory_id
2. Verify password with bcrypt
3. Create JWT token with user data
    ↓
Response: { access_token, user }
```

**JWT Token Contains:**
- directory_id
- role
- expiration (24 hours)
- issued_at timestamp

---

## 📁 File Structure Created

```
backend/
├── app/
│   ├── main.py                 ✅ FastAPI app with auth router
│   ├── config.py               ✅ Environment configuration
│   ├── database.py             ✅ MongoDB async connection
│   │
│   ├── models/
│   │   └── user.py             ✅ User data models
│   │
│   ├── schemas/
│   │   └── auth.py             ✅ Login request/response
│   │
│   ├── api/
│   │   └── auth.py             ✅ Login endpoint
│   │
│   ├── utils/
│   │   └── security.py         ✅ Password & JWT functions
│   │
│   └── scripts/
│       └── seed_users.py       ✅ Test user seeding
│
├── requirements.txt            ✅ Updated dependencies
└── .env                        ✅ Configuration

```

---

## 🎯 What Frontend Needs To Do

### 1. Show Mock CAS Login UI
```html
<form>
  <input name="directory_id" placeholder="Directory ID" />
  <input name="password" type="password" placeholder="Password" />
  <button>Login via CAS</button>
</form>
```

### 2. Call Login API
```javascript
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    directory_id: '118123456',
    password: 'participant123'
  })
});

const data = await response.json();
// data.access_token
// data.user
```

### 3. Store Token
```javascript
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### 4. Use Token in Future Requests
```javascript
fetch('http://localhost:8000/api/events', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

---

## 🔐 Security Features

✅ **Passwords never stored in plain text** - Bcrypt hashing with 12 rounds
✅ **JWT tokens expire** - 24 hours (configurable)
✅ **Constant-time password comparison** - Prevents timing attacks
✅ **No sensitive data in responses** - password_hash never exposed
✅ **Account status checking** - Inactive accounts rejected
✅ **Last login tracking** - Updates on each successful login

---

## 🚨 Troubleshooting

**Problem:** Module import errors
```
ImportError: No module named 'motor'
```
**Solution:** Rebuild container
```cmd
docker compose -f infra\docker-compose.yml build --no-cache backend
```

**Problem:** Database connection failed
```
Failed to connect to MongoDB
```
**Solution:** Ensure MongoDB is running
```cmd
docker compose -f infra\docker-compose.yml up mongo
```

**Problem:** Users not found
```
401 Unauthorized
```
**Solution:** Re-run seed script
```cmd
docker exec -it cems_backend python -m app.scripts.seed_users
```

---

## ✨ Next Steps

Now that authentication works, you can:
1. **Add protected endpoints** - Require JWT for certain routes
2. **Build event CRUD** - Create/read/update/delete events
3. **Add role-based access** - Different permissions for admin/organizer/participant
4. **Frontend integration** - Connect your mock CAS UI to this API

---

## 📝 Quick Reference

**Login Endpoint:** `POST /api/auth/login`

**Test Users:**
| Role | Directory ID | Password | Email |
|------|-------------|----------|-------|
| Participant | 118123456 | participant123 | participant@umd.edu |
| Organizer | 118234567 | organizer123 | organizer@umd.edu |
| Admin | 118345678 | admin123 | admin@umd.edu |

**JWT Expiration:** 24 hours (1440 minutes)

**API Docs:** http://localhost:8000/docs
