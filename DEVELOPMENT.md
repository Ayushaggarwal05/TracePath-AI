# TracePath AI — Local Development Guide

This guide walks you through setting up and running TracePath AI locally.

---

## Prerequisites

- **Node.js**: v18+ and `npm`
- **Python**: 3.10+ (with `venv` or `conda`)
- **Git**

---

## 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy development environment file
cp .env.example .env

# Run database migrations (SQLite dev database is pre-configured)
alembic upgrade head

# Run backend development server
uvicorn app.main:app --reload --port 8000
```

The backend server is now running at `http://localhost:8000`.
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/v1/health`

---

## 2. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Copy development environment variables
cp .env.example .env

# Start Vite development server
npm run dev
```

The frontend application is now running at `http://localhost:5173`.

---

## 3. Running Automated Tests

### Backend Unit, Pipeline & Agent Tests
```bash
cd backend
pytest tests -v
```

All 31+ test cases verify:
- 3 independent AI agents (`AnalysisAgent`, `DecisionAgent`, `DocGeneratorAgent`)
- Context builder token bounds
- Webhook signature verification and loop prevention
- Path traversal sanitization
- Webhook idempotency
- Full end-to-end sync pipeline

### Frontend Production Type Checking & Build
```bash
cd frontend
npm run build
```
Ensures 0 TypeScript errors and builds production bundle to `dist/`.
