# TracePath AI — Backend Service ⚡

TracePath AI backend is a production-grade FastAPI service managing the multi-agent documentation synchronization pipeline, GitHub webhooks, secure user authentication, and Supabase PostgreSQL data persistence.

---

## 🏗️ Architecture & Processing Flow

```
                      GitHub Webhook / Push Event
                                  │
                                  ▼
                        [HMAC Verification]
                                  │
                                  ▼
                   [Loop Prevention & Deduplication]
                                  │
                                  ▼
                      [Bounded Context Builder]
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │   Agent 1: Change Analyzer  │
                   │    - Semantic Git Diff      │
                   │    - Architecture Impacts   │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │   Agent 2: Impact Planner   │
                   │    - Evaluates Target Docs  │
                   │    - Filters No-Op Changes  │
                   └──────────────┬──────────────┘
                                  │
                           [If Affected]
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │  Agent 3: Document Writer   │
                   │    - Minimal Surgical Edits │
                   │    - Generates Markdown Diff│
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │       GitHub Client         │
                   │    - Direct Commit / PR     │
                   └─────────────────────────────┘
```

---

## 📁 Directory Structure

```
backend/
├── alembic/                  # Alembic database migration scripts
│   ├── versions/             # Versioned schema migrations
│   └── env.py                # Async database migration configuration
├── app/
│   ├── agents/               # 3 Decoupled AI agents (Analysis, Decision, DocGenerator)
│   │   ├── analysis_agent.py # Agent 1: Semantic code change analysis
│   │   ├── decision_agent.py # Agent 2: Documentation delta evaluation
│   │   ├── doc_generator.py  # Agent 3: Surgical markdown updates
│   │   ├── llm_client.py     # Resilient multi-provider LLM abstraction
│   │   └── prompts.py        # System prompts with prompt injection defenses
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── activity.py     # Activity stream and event cards
│   │   │   │   ├── auth.py         # Email/password auth, JWT cookies, GitHub link
│   │   │   │   ├── executions.py   # Execution lifecycle & progress streaming
│   │   │   │   ├── github.py       # GitHub OAuth, repository sync, and webhooks
│   │   │   │   ├── health.py       # Health check & system status
│   │   │   │   ├── repositories.py # Repository settings, docs & automations
│   │   │   │   ├── users.py        # User profile endpoints
│   │   │   │   └── webhooks.py     # Webhook ingestion & verification
│   │   │   └── api.py              # Root API v1 router
│   │   └── dependencies.py         # Async database session & user resolution
│   ├── core/
│   │   ├── config.py         # Pydantic v2 application settings
│   │   ├── exceptions.py     # Domain exceptions and error handlers
│   │   ├── logging.py        # Structured JSON logging
│   │   └── security.py       # bcrypt hashing, JWT tokens, AES-256 Fernet cipher
│   ├── database/
│   │   └── session.py        # Async SQLAlchemy 2.0 engine for Supabase
│   ├── github/
│   │   ├── client.py         # GitHub API client (Trees, Commits, Pull Requests)
│   │   └── loop_prevention.py# Deduplication and self-sync loop rejection
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── base.py           # Base model with UUID & timestamps
│   │   ├── execution.py      # Execution records & diffs
│   │   ├── github_connection.py # Encrypted OAuth & PAT connections
│   │   ├── repository.py     # Repositories catalog
│   │   ├── repository_automation.py # Target branches, tracked docs, commit modes
│   │   └── user.py           # User accounts & hashed credentials
│   ├── pipeline/
│   │   ├── context_builder.py# Bounded context retrieval with token truncation
│   │   └── orchestrator.py   # Full pipeline coordinator
│   ├── repositories/         # Database CRUD access layer
│   ├── schemas/              # Pydantic validation schemas
│   ├── services/             # Business domain services
│   └── main.py               # FastAPI application entrypoint
├── tests/                    # 31 comprehensive pytest test suites
├── .env.example              # Environment variables template
├── alembic.ini               # Alembic configuration
├── Dockerfile                # Production container specification
└── requirements.txt          # Python dependencies
```

---

## ⚡ Getting Started

### 1. Prerequisites
- Python 3.11+
- Supabase PostgreSQL (or local PostgreSQL)

### 2. Environment Setup
```bash
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Linux/macOS

pip install -r requirements.txt
cp .env.example .env
```

### 3. Database Migrations
```bash
alembic upgrade head
```

### 4. Running the Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Interactive API Docs (Swagger): `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/v1/health`

---

## 🧪 Automated Testing

Execute the comprehensive test suite (all 31 tests):

```bash
pytest tests -v
```

Covered scenarios:
- Multi-agent reasoning (Feature addition, Bug fix no-op, Caching architecture updates)
- Unified git diff generation and syntax validation
- Bounded context truncation and token guardrails
- Password hashing & JWT cookie authentication
- Webhook signature verification and loop prevention
- Path traversal doc sanitization
- Repository and execution lifecycle state machines

---

## 📡 Key API Routes

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/auth/signup` | `POST` | Register user with email + password |
| `/api/v1/auth/login` | `POST` | Authenticate user & issue JWT cookie |
| `/api/v1/auth/me` | `GET` | Get current verified user profile |
| `/api/v1/auth/connect-github` | `POST` | Link GitHub PAT / username with AES-256 encryption |
| `/api/v1/repositories` | `GET`, `POST` | List & register tracked repositories |
| `/api/v1/repositories/{id}/automation` | `GET`, `PATCH` | Configure target branches, tracked docs, commit modes |
| `/api/v1/repositories/{id}/automation/activate` | `POST` | Enable autonomous documentation sync |
| `/api/v1/executions` | `GET`, `POST` | List and trigger synchronization executions |
| `/api/v1/activity` | `GET` | Consolidated event audit stream |
| `/api/v1/github/webhook` | `POST` | Ingest push webhooks from GitHub |
