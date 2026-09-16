# TracePath AI 🚀

**TracePath AI** is a production-oriented GitHub-native autonomous documentation synchronization platform.

It keeps software engineering documentation synchronized with actual code changes through a multi-agent AI pipeline:

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

---

## Repository Structure

```
TracePath AI/
├── backend/                  # FastAPI Python backend (Phase 1)
│   ├── alembic/              # Database schema migrations
│   ├── app/                  # Application source code
│   │   ├── api/              # Versioned REST APIs & dependencies
│   │   ├── core/             # Configuration, logging, exceptions, security
│   │   ├── database/         # Async engine & session management
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic v2 schemas
│   │   ├── repositories/     # Data access CRUD layer
│   │   ├── services/         # Domain services and state machines
│   │   ├── github/           # GitHub client abstraction & interfaces
│   │   ├── agents/           # 3 Independent AI agent interfaces
│   │   └── pipeline/         # Multi-agent synchronization pipeline
│   ├── tests/                # Automated pytest test suite
│   ├── .env.example          # Backend environment variables template
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Production Docker image definition
└── frontend/                 # React + TypeScript + Vite + Tailwind (Upcoming)
```

---

## Quick Start (Backend)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
5. Run migrations & start dev server:
   ```bash
   alembic upgrade head
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
6. Run test suite:
   ```bash
   pytest tests -v
   ```
