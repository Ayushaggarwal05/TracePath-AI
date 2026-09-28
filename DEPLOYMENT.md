# TracePath AI — Production Deployment Guide 🚀

This guide outlines deployment options for TracePath AI in production environments.

---

## Architecture Topology

```
                       GitHub Webhooks / Users
                                  │
                                  ▼
                   ┌───────────────────────────────┐
                   │    Frontend (React + Vite)    │
                   │       Vercel / Netlify        │
                   └──────────────┬────────────────┘
                                  │
                                  ▼
                   ┌───────────────────────────────┐
                   │    Backend (FastAPI + Async)  │
                   │     Render / Railway / ECS    │
                   └──────────────┬────────────────┘
                                  │
                                  ▼
                   ┌───────────────────────────────┐
                   │      Database (PostgreSQL)    │
                   │      Supabase / AWS RDS       │
                   └───────────────────────────────┘
```

---

## 1. Deploying Backend (Render / Railway / AWS ECS)

1. Connect your repository and select root directory `/backend`.
2. Configure Start Command:
   ```bash
   alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
3. Set Production Environment Variables:
   - `ENVIRONMENT`: `production`
   - `DEBUG`: `false`
   - `DATABASE_URL`: `postgresql+asyncpg://...`
   - `SYNC_DATABASE_URL`: `postgresql://...`
   - `SECRET_KEY`: High-entropy 64-char key (`openssl rand -hex 32`)
   - `CORS_ORIGINS`: `["https://your-frontend-domain.com"]`
   - `AGENT_1_API_KEY`, `AGENT_2_API_KEY`, `AGENT_3_API_KEY`

---

## 2. Deploying Frontend (Vercel)

1. Connect your repository to Vercel and set root directory to `frontend`.
2. Build Settings:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL`: `https://api.yourdomain.com/api/v1`
4. The included `vercel.json` provides automatic SPA history fallback rewrites and secure headers.

---

## 3. Database Layer (Supabase PostgreSQL)

- TracePath AI is optimized for Supabase cloud PostgreSQL.
- Database models feature UUID primary keys, cascade deletion, and selectin eager loading.
- Enable connection pooling (Transaction mode on port 6543 or Session mode on port 5432) for high concurrent webhook throughput.
