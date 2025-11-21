# FastAPI TestClient + in-memory DB override + seed users
import os
import datetime
import pytest
from fastapi.testclient import TestClient

# Ensure test mode before importing the app
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("MONGODB_URL", "mongodb://test:27017")
os.environ.setdefault("MONGODB_DB_NAME", "terrapin_events_test")

from app.main import app
from app.database import get_db, db_manager
from app.utils.security import hash_password

# --------- monkeypatch the real DB connect/disconnect to avoid talking to Docker/Mongo ----------
async def _noop(*args, **kwargs):
    return None

db_manager.connect = _noop          # skip real Mongo connection during tests
db_manager.disconnect = _noop       # skip real disconnect

# --------- simple in-memory “collections” to mimic Motor APIs we use in handlers ----------
class InsertOneResult:
    def __init__(self, inserted_id=None): self.inserted_id = inserted_id

class UpdateResult:
    def __init__(self, matched): self.matched_count = 1 if matched else 0

class AsyncCursor:
    def __init__(self, docs): self._docs = docs
    def sort(self, field, direction):
        reverse = direction == -1
        self._docs.sort(key=lambda d: d.get(field), reverse=reverse)
        return self
    def __aiter__(self):
        self._it = iter(self._docs)
        return self
    async def __anext__(self):
        try:
            return next(self._it)
        except StopIteration:
            raise StopAsyncIteration

class InMemoryCollection:
    def __init__(self): self.docs = []
    async def insert_one(self, doc):
        self.docs.append(doc.copy())
        return InsertOneResult()
    async def find_one(self, query):
        for d in self.docs:
            ok = True
            for k, v in query.items():
                if isinstance(v, dict) and "$in" in v:
                    if d.get(k) not in v["$in"]:
                        ok = False; break
                else:
                    if d.get(k) != v:
                        ok = False; break
            if ok:
                return d.copy()
        return None
    async def update_one(self, query, update):
        d = await self.find_one(query)
        if not d:
            return UpdateResult(False)
        self.docs = [x for x in self.docs if x is not d]
        d.update(update.get("$set", {}))
        self.docs.append(d)
        return UpdateResult(True)
    async def count_documents(self, query):
        c = 0
        for d in self.docs:
            ok = True
            for k, v in query.items():
                if isinstance(v, dict) and "$in" in v:
                    if d.get(k) not in v["$in"]:
                        ok = False; break
                else:
                    if d.get(k) != v:
                        ok = False; break
            if ok: c += 1
        return c
    def find(self, query):
        out = []
        for d in self.docs:
            ok = True
            for k, v in query.items():
                if isinstance(v, dict) and "$in" in v:
                    if d.get(k) not in v["$in"]:
                        ok = False; break
                elif isinstance(v, dict) and "$gt" in v:
                    if not (isinstance(d.get(k), int) and d.get(k) > v["$gt"]):
                        ok = False; break
                else:
                    if d.get(k) != v:
                        ok = False; break
            if ok: out.append(d.copy())
        return AsyncCursor(out)

class InMemoryDB:
    def __init__(self):
        self.users = InMemoryCollection()
        self.events = InMemoryCollection()
        self.registrations = InMemoryCollection()

# Provide this DB via FastAPI dependency
@pytest.fixture(scope="session")
def test_db():
    return InMemoryDB()

@pytest.fixture(scope="session", autouse=True)
def override_db(test_db):
    app.dependency_overrides[get_db] = lambda: test_db
    yield
    app.dependency_overrides.clear()

# Test client (uses the app with overrides above)
@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

# Seed users
@pytest.fixture
def seed_user_participant(test_db):
    u = {
        "directory_id": "118000001",
        "password_hash": hash_password("Passw0rd!"),
        "email": "student@umd.edu",
        "first_name": "Stu",
        "last_name": "Dent",
        "role": "participant",
        "created_at": datetime.datetime.utcnow(),
    }
    test_db.users.docs.append(u)
    return u

@pytest.fixture
def seed_user_organizer(test_db):
    u = {
        "directory_id": "118000002",
        "password_hash": hash_password("Passw0rd!"),
        "email": "org@umd.edu",
        "first_name": "Org",
        "last_name": "Anizer",
        "role": "organizer",
        "created_at": datetime.datetime.utcnow(),
    }
    test_db.users.docs.append(u)
    return u

@pytest.fixture
def seed_user_admin(test_db):
    u = {
        "directory_id": "118999999",
        "password_hash": hash_password("Admin!23"),
        "email": "admin@umd.edu",
        "first_name": "Ad",
        "last_name": "Min",
        "role": "admin",
        "created_at": datetime.datetime.utcnow(),
    }
    test_db.users.docs.append(u)
    return u
