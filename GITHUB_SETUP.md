# GitHub Integration & Webhook Setup Guide

This guide explains how to configure GitHub authorization and webhooks for TracePath AI.

---

## 1. Creating a GitHub OAuth App (User Login & Repo Selection)

1. Go to **GitHub Settings** &rarr; **Developer Settings** &rarr; **OAuth Apps** &rarr; **New OAuth App**.
2. Fill in the fields:
   - **Application name**: `TracePath AI`
   - **Homepage URL**: `https://app.tracepath.ai` (or `http://localhost:5173` for local dev)
   - **Authorization callback URL**: `https://app.tracepath.ai/connect/github/callback` (or `http://localhost:5173/connect/github/callback`)
3. Click **Register application**.
4. Copy the **Client ID** &rarr; Set in frontend `.env` as `VITE_GITHUB_CLIENT_ID`.
5. Generate a **Client Secret** &rarr; Set in backend `.env` as `GITHUB_APP_CLIENT_SECRET`.

---

## 2. Configuring Webhooks on Connected Repositories

When a repository is activated, TracePath AI listens for push events to trigger synchronization:

1. In your GitHub repository, go to **Settings** &rarr; **Webhooks** &rarr; **Add webhook**.
2. Configure settings:
   - **Payload URL**: `https://api.yourdomain.com/api/v1/github/webhooks`
   - **Content type**: `application/json`
   - **Secret**: Set a strong random string (e.g., generated with `openssl rand -hex 20`).
   - **Which events would you like to trigger this webhook?**: Select **Just the `push` event**.
   - **Active**: Check the box.
3. Click **Add webhook**.
4. Set the exact secret in backend `.env`:
   ```env
   GITHUB_WEBHOOK_SECRET=your-chosen-secret
   ```

---

## 3. GitHub Permissions Required

| Scope / Permission | Access Level | Purpose |
|---|---|---|
| `repo` / `contents:read` | Read | Read commit diffs, tree structure, and existing documentation |
| `contents:write` | Write | Commit documentation updates directly to target branches |
| `pull_requests:write` | Write | Open sync Pull Requests with agent-generated doc updates |

---

## 4. Loop Prevention & Autonomous Safety

TracePath AI automatically prevents recursive webhook execution loops:
1. **Committer Identity**: All autonomous commits use committer `TracePath AI <bot@tracepath.dev>`.
2. **Signature Tag**: All commit messages contain `[tracepath-sync:<sha>]`.
3. **Webhook Ingestion Filter**: When GitHub delivers a webhook with these committer identifiers or commit tags, TracePath AI immediately responds with `202 Accepted` and status `skipped`, avoiding recursive triggering.
