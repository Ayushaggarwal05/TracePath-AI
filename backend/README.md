# TracePath AI - Backend Foundation (Phase 1)

TracePath AI is a production-oriented GitHub-native autonomous documentation synchronization platform that keeps software engineering documentation synchronized with code changes.

## Architecture

```
GitHub Code Change
  │
  ▼
1. Understand What Changed (Agent 1: Change Analyzer)
  │
  ▼
2. Determine Documentation Impact (Agent 2: Impact Planner)
  │
  ▼
3. Generate Minimal Documentation Updates & Validate (Agent 3: Doc Generator)
  │
  ▼
4. Commit Back to GitHub / Create Pull Request (GitHub Client)
```

## Directory Structure

```
backend/
├── alembic/              # Database schema migrations
│   ├── versions/
│   │   └── 001_initial_schema.py
│   └── env.py
├── app/
│   ├── api/              # FastAPI REST endpoints & dependencies
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── health.py
│   │       │   ├── users.py
│   │       │   ├── repositories.py
│   │       │   └── executions.py
│   │       └── api.py
│   ├── core/             # Config, logging, exceptions, security
│   ├── database/         # Async engine and session management
│   ├── models/           # SQLAlchemy 2.0 ORM models
│   ├── schemas/          # Pydantic v2 schemas
│   ├── repositories/     # Data access CRUD layer
│   ├── services/         # Domain services and state machines
│   ├── github/           # GitHub client abstraction and mocks
│   ├── agents/           # 3 Independent AI agent interfaces
│   ├── pipeline/         # Multi-agent synchronization pipeline
│   └── main.py           # Application entrypoint
├── tests/                # Automated pytest test suite
├── .env.example          # Environment variables template
├── alembic.ini           # Alembic configuration
└── requirements.txt      # Python dependencies
```

## Getting Started

### 1. Requirements
- Python 3.11+
- PostgreSQL (or local SQLite for dev testing)

### 2. Setup Virtual Environment
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Copy `.env.example` to `.env` and adjust variables as required:
```bash
cp .env.example .env
```

### 5. Run Database Migrations
```bash
alembic upgrade head
```

### 6. Run the Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Docs: `http://localhost:8000/api/v1/docs`
- Health Check: `http://localhost:8000/api/v1/health`

### 7. Run Automated Tests
```bash
pytest tests -v
```

## API Endpoints Summary

- **Health Check**: `GET /api/v1/health`
- **Current User**: `GET /api/v1/users/me`
- **Repositories**:
  - `GET /api/v1/repositories`
  - `POST /api/v1/repositories`
  - `GET /api/v1/repositories/{id}`
  - `PATCH /api/v1/repositories/{id}`
- **Repository Automation**:
  - `GET /api/v1/repositories/{id}/automation`
  - `POST /api/v1/repositories/{id}/automation/activate`
  - `POST /api/v1/repositories/{id}/automation/deactivate`
  - `PATCH /api/v1/repositories/{id}/automation`
- **Executions**:
  - `GET /api/v1/executions`
  - `POST /api/v1/executions`
  - `GET /api/v1/executions/{id}`
  - `GET /api/v1/repositories/{id}/executions`
