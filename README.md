# TracePath AI ⚡

**TracePath AI** is an autonomous, multi-agent documentation synchronization platform built for modern engineering teams.

Whenever code is pushed to a connected GitHub repository, TracePath AI automatically analyzes the change, determines the exact documentation impact across PRDs, Architecture diagrams, and API docs, and commits verified, minimal markdown updates or opens a Pull Request.

---

## 🏗️ Multi-Agent Architecture

TracePath AI coordinates **three independent AI agents**, ensuring separation of concerns, high accuracy, and zero hallucinations:

```
                      GitHub Push Event
                             │
                             ▼
                 [Bounded Context Builder]
                             │
                             ▼
                ┌─────────────────────────┐
                │ AGENT 1: ANALYSIS AGENT │
                │  - Semantic Code Diff   │
                │  - Architecture Impact  │
                │  - Behavioral Changes   │
                └────────────┬────────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │ AGENT 2: DECISION AGENT │
                │  - Differential Matrix  │
                │  - No-op Diff Filter    │
                │  - Target Doc Decision  │
                └────────────┬────────────┘
                             │
                      [If Affected]
                             │
                             ▼
                ┌─────────────────────────┐
                │ AGENT 3: DOC GENERATOR  │
                │  - Minimal Delta Edits  │
                │  - Syntax & Heading Val │
                │  - Unified Diff Output  │
                └────────────┬────────────┘
                             │
                             ▼
              [Deterministic Backend Commit/PR]
```

1. **Agent 1 — Analysis Agent**: Understands the code changes deeply and factually from git diffs and commit metadata.
2. **Agent 2 — Differential / Decision Agent**: Evaluates existing documentation (`ARCHITECTURE.md`, `PRD.md`, `README.md`, etc.) to determine if updates are strictly necessary, preventing unnecessary churn on trivial bug fixes.
3. **Agent 3 — Documentation Generator**: Generates minimal, surgical markdown edits that preserve document structure, heading hierarchy, and formatting.

---

## 🔒 Security & Reliability Architecture

- **Prompt Injection Defense**: All repository inputs, commit messages, and diffs are wrapped in untrusted boundary tags (`<UNTRUSTED_REPOSITORY_INPUT>`) with strict instructions to ignore embedded instructions.
- **Infinite Loop Prevention**: Detects and rejects self-triggered webhooks using `bot@tracepath.dev` and `[tracepath-sync]` signature tags.
- **Webhook HMAC-SHA256**: Timing-attack safe signature verification using `hmac.compare_digest`.
- **Zero-Diff Safety**: Never commits or creates empty Pull Requests when documentation is unchanged.
- **Path Traversal Protection**: Sanitizes all file paths to prevent directory traversal outside the repository.
- **No Private Secret Exposure**: The frontend never receives GitHub credentials, private keys, or AI tokens.

---

## 📁 Repository Structure

```
TracePath AI/
├── backend/                  # FastAPI Python backend
│   ├── alembic/              # Database schema migrations
│   ├── app/                  # Application source code
│   │   ├── agents/           # 3 Independent AI agents (Analysis, Decision, DocGenerator)
│   │   ├── api/              # Versioned REST APIs (Repositories, Executions, Activity, Webhooks)
│   │   ├── core/             # Configuration, logging, security
│   │   ├── database/         # Async SQLAlchemy 2.0 engine & sessions
│   │   ├── github/           # GitHub REST API client & loop prevention
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── pipeline/         # Bounded context builder & pipeline orchestrator
│   │   └── repositories/     # Data access CRUD layer
│   ├── tests/                # Automated pytest suite (31 tests)
│   ├── Dockerfile            # Production backend Docker image
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # UI components (Agent traces, Diff viewers, Breadcrumbs, Modals)
│   │   ├── pages/            # Workspace, Execution detail, Repositories, Dashboard
│   │   ├── services/         # Typed API clients connected to FastAPI
│   │   └── types/            # TypeScript domain interfaces
│   ├── Dockerfile            # Production frontend Docker image (Nginx)
│   └── vercel.json           # Vercel SPA routing & security headers
├── docker-compose.yml        # Multi-service production/local orchestration
├── DEPLOYMENT.md             # Cloud deployment guide (Vercel, Render, Railway, Docker)
├── DEVELOPMENT.md            # Local development setup instructions
├── GITHUB_SETUP.md           # GitHub OAuth & Webhook configuration guide
└── AI_PROVIDERS.md           # AI model configuration for OpenAI, Anthropic, Gemini
```

---

## ⚡ Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/Ayushaggarwal05/TracePath-AI.git
cd TracePath-AI

# Start PostgreSQL, Backend, and Frontend
docker-compose up -d --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

### Option 2: Local Development

**1. Backend:**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Or source venv/bin/activate on Linux/macOS
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**2. Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🧪 Testing & Verification

Run the comprehensive backend test suite (31 tests covering agents, pipeline, webhooks, security, and APIs):
```bash
cd backend
pytest tests -v
```

Build and validate the frontend production bundle:
```bash
cd frontend
npm run build
```

---

## 📖 Documentation Guides

- [Production Deployment Guide (Vercel, Render, Railway, Docker)](DEPLOYMENT.md)
- [Local Development Guide](DEVELOPMENT.md)
- [GitHub App & Webhook Configuration](GITHUB_SETUP.md)
- [Multi-Agent AI Provider Configuration](AI_PROVIDERS.md)

---

## 📄 License

MIT License. Built for high-velocity software teams.
