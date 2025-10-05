# Terrapin Events (CEMS) — React + FastAPI + MongoDB
# Team 4

Centralized campus event management for UMD: **event creation/approval**, **registration + waitlist**, **payments**, **notifications**, and **calendar integration**.  
Stack: **React (Vite)** · **FastAPI (Python 3.11)** · **MongoDB** · **Docker** · **Akamai Connected Cloud**.

---

## ✨ Features (MVP)
- CAS SSO + JWT RBAC (Admin, Organizer, Participant)
- Event creation & approval, ticket types & capacity
- Registration & **automated waitlist**
- Payments via gateway (e.g., Stripe) with webhooks
- Notifications (email) for confirmations & updates
- Calendar integration (Add-to-Calendar + iCal feed)
- Reporting exports (CSV)

---

## Architecture
```
frontend/  # React Vite client
backend/   # FastAPI service (REST & Swagger)
mongo      # MongoDB (Docker)
```
- Auth: UMD CAS → FastAPI → JWT cookie
- Payments: server-side intents; webhook endpoint `/webhooks/payments`
- Calendar: iCal feed + personal calendar buttons

---

## Getting Started (Local)

### Prerequisites
- Node 20+, Python 3.11+
- Docker & Docker Compose

### 1) Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your keys (Mongo, CAS, Stripe, SMTP).

### 2) Run with Docker Compose
```bash
docker compose -f infra/docker-compose.yml up --build
```
- Frontend → http://localhost:5173  
- API (Swagger) → http://localhost:8000/docs  
- Mongo → mongodb://localhost:27017

### 3) Run manually (alternative)
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd ../frontend
npm install
npm run dev
```

---

## Testing
```bash
# Backend
pytest -q

# Frontend
npm run test
```

---

## Security & Compliance
- FERPA-aware data handling; no card PAN stored (tokenization via provider)
- CAS + JWT; secure cookies, CORS, CSRF protection
- Keep secrets in env / GitHub Secrets; never commit `.env`

---

## Deploy (Akamai Connected Cloud)
- Build/push Docker images from CI
- Provision VM/container instance on Akamai (Linode)
- Pull images and run via compose or systemd
- CI/CD pipeline uses `AKAMAI_API_TOKEN` (placeholder) for automation

See `.github/workflows/ci.yml` and `infra/docker-compose.yml`.

---

## 📁 Repo Layout
```
.
├─ frontend/                # React app (Vite)
├─ backend/                 # FastAPI app
├─ infra/                   # Docker Compose and deploy configs
├─ docs/                    # Diagrams / Postman etc.
├─ .github/workflows/ci.yml # Build/test pipeline
├─ .env.example
└─ README.md
```
# enpm613-team4-event-management-system
