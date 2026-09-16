# TracePath AI — Production Deployment Guide

This guide covers production deployment strategies for TracePath AI:
1. **Docker Compose (Full-stack single node)**
2. **Backend on Cloud Platform (Render, Railway, Fly.io, AWS ECS)**
3. **Frontend on Vercel or Netlify**
4. **PostgreSQL Database (Supabase, Neon, AWS RDS)**

---

## Architecture Overview

```
                          GitHub Webhooks
                                │
                                ▼
                       ┌────────────────┐
                       │ FastAPI Backend│
                       │   Port: 8000   │
                       └───────┬────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
     │   Agent 1    │   │   Agent 2    │   │   Agent 3    │
     │   Analysis   │   │   Decision   │   │  Generator   │
     └──────────────┘   └──────────────┘   └──────────────┘
                               │
                       ┌───────┴────────┐
                       │ PostgreSQL DB  │
                       └────────────────┘
```

---

## 1. Single-Command Docker Deployment

Deploy the entire platform (PostgreSQL + FastAPI backend + React frontend) on any Linux VM (Ubuntu, Debian, AWS EC2):

```bash
# Clone the repository
git clone https://github.com/Ayushaggarwal05/TracePath-AI.git
cd TracePath-AI

# Create your production environment file
cp backend/.env.example backend/.env

# Launch services in detached mode
docker-compose up -d --build
```

Access points:
- **Frontend App**: `http://<your-server-ip>:3000`
- **Backend API**: `http://<your-server-ip>:8000/api/v1`
- **Interactive Swagger Docs**: `http://<your-server-ip>:8000/docs`

---

## 2. Frontend Deployment (Vercel)

TracePath AI frontend is configured for instant Vercel zero-config deployments:

1. Import the `frontend/` folder into Vercel.
2. Set Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://api.yourdomain.com/api/v1`
   - `VITE_GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
4. Deploy! The [`vercel.json`](file:///k:/Work/projects/TracePath%20AI/frontend/vercel.json) automatically configures SPA routing rewrites and security headers (`X-Frame-Options`, `X-Content-Type-Options`).

---

## 3. Backend Deployment (Render / Railway / Fly.io)

### Environment Variables Required
Configure the following in your host provider's dashboard:

| Variable | Description | Example |
|---|---|---|
| `ENVIRONMENT` | Environment name | `production` |
| `DEBUG` | Debug mode | `false` |
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://user:pass@host:5432/db` |
| `SYNC_DATABASE_URL` | Sync PostgreSQL connection string (for Alembic) | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | 32+ character random secret for JWTs | `openssl rand -hex 32` |
| `CORS_ORIGINS` | JSON list of allowed frontend origins | `["https://app.tracepath.ai"]` |
| `GITHUB_APP_CLIENT_ID` | GitHub App Client ID | `Iv1.xxxxxxxxxxxx` |
| `GITHUB_APP_CLIENT_SECRET` | GitHub App Client Secret | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `GITHUB_WEBHOOK_SECRET` | Webhook HMAC secret | `your-webhook-secret` |
| `AGENT_1_MODEL` | Analysis Agent Model | `gpt-4o-mini` or `gemini-1.5-flash` |
| `AGENT_1_API_KEY` | Model API Key | `sk-...` |
| `AGENT_2_MODEL` | Decision Agent Model | `gpt-4o` or `gemini-1.5-pro` |
| `AGENT_2_API_KEY` | Model API Key | `sk-...` |
| `AGENT_3_MODEL` | Doc Generator Model | `gpt-4o` or `claude-3-5-sonnet` |
| `AGENT_3_API_KEY` | Model API Key | `sk-...` |

### Database Migrations
On startup, execute:
```bash
alembic upgrade head
```

---

## 4. Health & Observability

- **Health Check**: `GET /api/v1/health` &rarr; Returns status `healthy` and timestamp.
- **Activity Stream**: `GET /api/v1/activity` &rarr; Real-time synchronization log stream.
- **Execution Pipeline**: `GET /api/v1/executions/{id}` &rarr; Complete multi-agent trace logs and unified diffs.
