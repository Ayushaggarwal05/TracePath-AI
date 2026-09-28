# TracePath AI — Local Development Guide 🛠️

This guide walks you through setting up, configuring, and developing TracePath AI locally.

---

## Prerequisites

- **Node.js**: v18.0+ and `npm`
- **Python**: v3.11+
- **PostgreSQL / Supabase**: Connection string configured
- **Git**

---

## 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows PowerShell
# source venv/bin/activate # Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env
```

### Configure `.env`
Ensure your backend `.env` contains:
```env
PROJECT_NAME="TracePath AI"
VERSION="0.1.0"
ENVIRONMENT="development"
DEBUG=true

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql+asyncpg://<user>:<password>@<host>:5432/<dbname>"
SYNC_DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<dbname>"

# Security & Sessions
SECRET_KEY="your-super-secret-key-at-least-32-chars-long"

# AI Model Configuration
AGENT_1_MODEL="gpt-4o-mini"
AGENT_1_API_KEY="sk-..."
AGENT_2_MODEL="gpt-4o-mini"
AGENT_2_API_KEY="sk-..."
AGENT_3_MODEL="gpt-4o"
AGENT_3_API_KEY="sk-..."
```

### Run Migrations & Start Server
```bash
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/v1/health`

---

## 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start Vite dev server
npm run dev
```

- Web App: `http://localhost:5173`

---

## 3. Testing & Code Quality

### Backend Test Suite (31 Tests)
```bash
cd backend
pytest tests -v
```

### Frontend Build & Typecheck
```bash
cd frontend
npm run build
```

---

## 4. Key Workflows

- **User Sign-up / Login**: Navigate to `http://localhost:5173/#/auth` to register or log in.
- **GitHub Link**: Link your GitHub PAT on `#/connect` to import all your repositories.
- **Configure & Sync**: Open any repository modal on `#/repositories` to adjust tracked paths and commit modes.
