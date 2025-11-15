# Terrapin Events - Backend API

FastAPI-based backend for the Terrapin Events campus event management system.

## Tech Stack

- **FastAPI 0.111.0** - Modern async web framework
- **Motor 3.5.0** - Async MongoDB driver
- **Pydantic 2.8.2** - Data validation and settings
- **JWT Authentication** - Token-based auth with bcrypt password hashing
- **Python 3.11** - Runtime environment

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # MongoDB connection manager
│   ├── api/                 # API endpoints
│   │   └── auth.py          # Authentication routes
│   ├── models/              # Database models
│   │   └── user.py          # User model (3 roles: participant, organizer, admin)
│   ├── schemas/             # Request/response schemas
│   │   └── auth.py          # Auth request/response models
│   ├── utils/               # Helper functions
│   │   └── security.py      # Password hashing, JWT functions
│   └── scripts/             # Utility scripts
│       └── seed_users.py    # Populate test users
├── requirements.txt         # Python dependencies
└── Dockerfile              # Container configuration
```

## Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp ../.env.example ../.env
```

Generate a secure JWT secret:

```bash
openssl rand -hex 32
```

Update `.env` with your secret key.

### 2. Run with Docker (Recommended)

From project root:

```bash
docker compose -f infra/docker-compose.yml up --build
```

API will be available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Run Locally (Development)

**Install dependencies:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Start MongoDB:**

```bash
docker compose -f ../infra/docker-compose.yml up mongo
```

**Update `.env` for local development:**

```env
MONGODB_URL=mongodb://localhost:27017
```

**Run server:**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Database Seeding

After containers are running, seed test users:

```bash
docker exec -it cems_backend python -m app.scripts.seed_users
```

This creates 3 test accounts:

| Role | Directory ID | Password | Email |
|------|-------------|----------|-------|
| Participant | 118123456 | participant123 | participant@umd.edu |
| Organizer | 118234567 | organizer123 | organizer@umd.edu |
| Admin | 118345678 | admin123 | admin@umd.edu |

## API Endpoints

### Authentication

**POST** `/api/auth/login`

Mock CAS login endpoint.

**Request:**
```json
{
  "directory_id": "118123456",
  "password": "participant123"
}
```

**Response (200 OK):**
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

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `422 Unprocessable Entity` - Validation error

## Configuration

All configuration is managed via environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://mongo:27017` |
| `MONGODB_DB_NAME` | Database name | `terrapin_events` |
| `JWT_SECRET_KEY` | Secret for JWT signing | *Required* |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | `1440` (24h) |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `CORS_ORIGINS` | Allowed origins (JSON array) | `["http://localhost:5173","http://localhost:3000"]` |

## Development

**Format code:**
```bash
black app/
isort app/
```

**Type checking:**
```bash
mypy app/
```

**Run tests:**
```bash
pytest
```

## Security Features

- ✅ **Bcrypt password hashing** - 12 rounds (configurable)
- ✅ **JWT tokens** - 24h expiration, HS256 algorithm
- ✅ **CORS protection** - Configurable allowed origins
- ✅ **Input validation** - Pydantic models for all requests
- ✅ **No password storage** - Only bcrypt hashes stored
- ✅ **Constant-time comparison** - Prevents timing attacks

## Troubleshooting

**Issue: Import errors**
```
ImportError: No module named 'motor'
```
**Solution:** Rebuild container
```bash
docker compose -f infra/docker-compose.yml build --no-cache backend
```

**Issue: Database connection failed**
```
Failed to connect to MongoDB
```
**Solution:** Ensure MongoDB is running
```bash
docker compose -f infra/docker-compose.yml up mongo
```

**Issue: Authentication always fails**
```
401 Unauthorized
```
**Solution:** Re-run seed script to create users
```bash
docker exec -it cems_backend python -m app.scripts.seed_users
```

## License

University of Maryland - ENPM613 Team 4
