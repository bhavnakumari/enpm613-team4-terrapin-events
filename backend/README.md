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

Create the .env file

```bash
cp .env.example .env
```

From project root:

```bash
docker compose -f infra/docker-compose.yml up --build
```

API will be available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc



### How to test Email functionality(Development)
1. Turn on 2-Step Verification
Google requires this before generating an App Password.
- Go to myaccount.google.com/security
- Under “Signing in to Google”, enable 2-Step Verification
- Complete setup (phone, OTP, etc.)

2. Generate App Password
Once 2FA is on:
- Go to https://myaccount.google.com/apppasswords
- Log in again if asked.
- Under Select the app, choose Mail.
- Under Select device, choose the device you’re using.
- Click Generate.

3. Go to your personal .env file and update the below
- SMTP Server: smtp.gmail.com
- Port: 587 (TLS) or 465 (SSL)
- Username: your gmail address
- Password: your 16-char app password



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

## Testing

### Test Structure

Tests are organized by module in the `tests/` directory:

```
tests/
├── conftest.py                 # Shared fixtures and test configuration
├── app/                        # Tests for app package
│   ├── api/                    # Tests for API endpoints
│   │   ├── test_auth.py        # Authentication endpoints
│   │   ├── test_events.py      # Event management endpoints
│   │   ├── test_registrations.py  # Registration endpoints
│   │   └── test_users.py       # User profile endpoints
│   └── utils/                  # Tests for utility modules
│       ├── test_email.py       # Email utility tests
│       ├── test_security.py    # Security utility tests (JWT, bcrypt)
│       └── test_ticket.py      # Ticket generation tests
├── test_config.py              # Configuration tests
├── test_database.py            # Database integration tests
└── test_main.py                # Main application tests
```

### Running Tests

**Run all tests:**
```bash
pytest -v
```

**Run specific test category:**
```bash
# All API tests
pytest tests/app/api/ -v

# All utility tests
pytest tests/app/utils/ -v

# Core tests only
pytest tests/test_*.py -v
```

**Run specific test file:**
```bash
pytest tests/app/api/test_auth.py -v
pytest tests/test_config.py -v
```

### Coverage Reports

**Run with full coverage:**
```bash
pytest --cov=app --cov-report=term-missing --cov-report=html -v
```

**Run with focused coverage (recommended):**
```bash
pytest --cov=app/api --cov=app/utils --cov=app/config.py --cov=app/database.py --cov=app/main.py --cov-report=term-missing --cov-report=html -v
```

This generates:
- Terminal output with line-by-line coverage
- HTML report in `htmlcov/index.html`

**View HTML coverage report:**
```bash
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

### Current Coverage Stats

**Overall: 87% coverage** (544 statements, 69 missed)

| Module | Coverage | Notes |
|--------|----------|-------|
| `app/api/auth.py` | 93% | Authentication endpoints |
| `app/api/events.py` | 87% | Event management, approval workflow |
| `app/api/registrations.py` | 81% | Registrations, waitlist, payments |
| `app/api/users.py` | 95% | User profile management |
| `app/utils/email.py` | 94% | Email templates and sending |
| `app/utils/security.py` | 93% | JWT and password hashing |
| `app/utils/ticket.py` | 86% | QR code generation |

**Test Count:** 94 tests (94 passed, 3 skipped, 0 failed)

- API Tests: 58 tests (7 auth + 24 events + 16 registrations + 6 users)
- Utility Tests: 19 tests (8 email + 9 security + 2 ticket)
- Core Tests: 20 tests (8 config + 11 database + 7 main)

### Test Fixtures

Shared fixtures are defined in `conftest.py`:
- `test_db`: Clean MongoDB test database
- `sample_users`: Pre-populated test users (admin, organizer, participant)
- `sample_event`: Pre-populated approved test event
- `sample_paid_event`: Pre-populated paid event for payment testing
- `admin_token`, `organizer_token`, `participant_token`: JWT authentication tokens

### Testing Best Practices

1. **Async Tests**: Use `@pytest.mark.asyncio` for async endpoints
2. **Database Cleanup**: Each test gets a fresh database via fixtures
3. **Dependency Override**: Use `app.dependency_overrides` for test database
4. **AsyncClient**: Use `httpx.AsyncClient` for API testing (not TestClient)
5. **Coverage Focus**: Prioritize testing business logic in `api/` and `utils/`

### CI/CD Testing

For continuous integration:
```bash
# Set test environment
export MONGODB_URL="mongodb://localhost:27017"
export JWT_SECRET_KEY="test-secret-key-123"

# Run tests with coverage
pytest --cov=app/api --cov=app/utils --cov=app/config.py --cov=app/database.py --cov=app/main.py --cov-report=term-missing --cov-report=xml -v

# Coverage report will be in coverage.xml
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
