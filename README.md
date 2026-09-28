# TracePath AI ⚡

**TracePath AI** is an enterprise-grade autonomous, multi-agent documentation synchronization platform built for modern engineering teams.

Whenever code is pushed to a connected GitHub repository, TracePath AI analyzes the commit semantic changes, determines the exact documentation impact across PRDs, Architecture diagrams, and API docs, and commits verified, minimal markdown updates or opens a Pull Request.

---

## 🏗️ Multi-Agent Architecture

TracePath AI coordinates **three independent AI agents**, ensuring separation of concerns, high accuracy, and zero hallucinations:

```
                      GitHub Push Event / Webhook
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

1. **Agent 1 — Analysis Agent**: Understands code changes deeply and factually from git diffs and commit metadata.
2. **Agent 2 — Differential / Decision Agent**: Evaluates existing documentation (`ARCHITECTURE.md`, `PRD.md`, `README.md`, etc.) to determine if updates are strictly necessary, preventing unnecessary churn on trivial bug fixes.
3. **Agent 3 — Documentation Generator**: Generates minimal, surgical markdown edits that preserve document structure, heading hierarchy, and formatting.

---

## 🚀 Key Features

- **🔐 Enterprise Authentication**: Email and Password registration with bcrypt hashing (12 rounds) & secure HTTP-Only JWT session cookies.
- **🐙 Flexible GitHub Integration**: Connect via Fine-Grained Personal Access Tokens (`github_pat_...`), Classic PATs (`ghp_...`), or public username preview with AES-256 encrypted storage at rest.
- **⚡ Instant Zero-Wait UI**: Optimistic local session caching with silent background revalidation (SWR pattern) for 0ms reload latency.
- **📊 Real-Time Dashboard**: Track active automations, executions, documentation revisions, diff comparisons, and live pipeline traces.
- **🛡️ Prompt Injection & Loop Defense**: All untrusted git inputs are sandboxed with boundary markers, and commit loops are rejected deterministically.
- **☁️ Supabase Cloud PostgreSQL**: Production-grade async database layer with relationship cascades and schema migrations.

---

## 📁 Repository Structure

```
TracePath AI/
├── backend/                  # FastAPI Python backend (Async SQLAlchemy + Supabase)
│   ├── alembic/              # Database schema migrations
│   ├── app/                  # Application source code
│   │   ├── agents/           # 3 Independent AI agents (Analysis, Decision, DocGenerator)
│   │   ├── api/              # Versioned REST APIs (Auth, Repositories, Executions, Activity, Webhooks)
│   │   ├── core/             # Security (bcrypt, JWT, AES-256), exceptions, settings
│   │   ├── database/         # Async SQLAlchemy 2.0 session engine
│   │   ├── github/           # GitHub REST API client & loop prevention
│   │   ├── models/           # SQLAlchemy models (User, GitHubConnection, Repository, Execution)
│   │   ├── pipeline/         # Bounded context builder & pipeline orchestrator
│   │   ├── repositories/     # Data access CRUD layer
│   │   └── services/         # Domain business logic (Auth, Automation, Execution, Repository)
│   ├── tests/                # Automated pytest suite (31/31 tests passing)
│   ├── Dockerfile            # Production backend Docker image
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Reusable components (Agent traces, Diff viewer, Modals, Badges)
│   │   ├── context/          # Optimistic AuthProvider and application state
│   │   ├── hooks/            # Custom hooks (useRepositories, useExecutions, useAutomation)
│   │   ├── pages/            # Landing, Auth, ConnectGitHub, SelectRepos, Dashboard, Repositories, Detail, Activity, Settings
│   │   ├── services/         # Typed API client services
│   │   └── types/            # Domain TypeScript models
│   ├── Dockerfile            # Production frontend Docker image (Nginx)
│   └── vercel.json           # Vercel SPA routing & security headers
├── docker-compose.yml        # Multi-service production/local orchestration
├── DEPLOYMENT.md             # Cloud deployment guide (Vercel, Render, Railway, Supabase)
├── DEVELOPMENT.md            # Local development setup instructions
├── GITHUB_SETUP.md           # GitHub Personal Access Token & Webhook setup guide
└── AI_PROVIDERS.md           # AI model configuration (OpenAI, Anthropic, Gemini, Ollama)
```

---

## ⚡ Getting Started

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/v1/health`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start Vite development server
npm run dev
```

- **Application URL**: `http://localhost:5173`

---

## 🧪 Testing & Verification

Run the automated test suite covering agents, auth, pipeline, webhooks, security, and API endpoints:

```bash
# Backend pytest suite (31 tests)
cd backend
pytest tests -v

# Frontend TypeScript & Vite production build
cd frontend
npm run build
```

---

## 🔒 Security Architecture

| Security Feature | Implementation Mechanism |
|---|---|
| **Password Hashing** | 12-round bcrypt with PBKDF2-SHA256 fallback |
| **Session Management** | HTTP-Only, SameSite=Lax JWT cookies signed with HS256 |
| **Token Encryption** | AES-256 Fernet authenticated encryption at rest |
| **Prompt Injection** | Untrusted repository inputs wrapped in `<UNTRUSTED_REPOSITORY_INPUT>` |
| **Loop Prevention** | Automatic detection of `bot@tracepath.dev` and `[tracepath-sync]` commit signatures |
| **Webhook HMAC** | Timing-attack safe SHA-256 validation via `hmac.compare_digest` |
| **Path Traversal** | Strict path sanitization to prevent arbitrary file access |

---

## 📄 License

MIT License. Built with ❤️ for autonomous engineering documentation.
