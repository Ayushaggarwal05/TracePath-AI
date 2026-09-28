# TracePath AI — Frontend Web Application 💻

The TracePath AI frontend is a high-performance React + TypeScript application powered by Vite and Tailwind CSS. It provides real-time visualization of multi-agent pipeline executions, repository synchronization management, and an interactive audit log.

---

## 🎨 Tech Stack & Architecture

- **Core**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons + Dark Navy Aesthetic (`#060913`)
- **State Management**: React Context (`AuthProvider`) with optimistic local caching
- **Networking**: Native fetch with credentials inclusion and custom typed API services
- **Navigation**: Hash-based lightweight SPA router

---

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── api/                  # Base API client with error normalization
│   ├── components/           # Reusable UI component library
│   │   ├── activity/         # Execution drawers, diff viewers, event cards
│   │   ├── common/           # Buttons, modals, badges, search inputs, toasts
│   │   ├── dashboard/        # Metrics, active repositories bar, live sync stream
│   │   ├── layout/           # Public navigation headers and app layout
│   │   └── repositories/     # Automation settings modal, repository cards
│   ├── context/              # AuthProvider with optimistic state caching
│   ├── hooks/                # Custom React hooks (useRepositories, useAutomation, useExecutions)
│   ├── pages/                # Top-level view routes:
│   │   ├── LandingPage.tsx          # Product overview & feature highlights
│   │   ├── AuthPage.tsx             # Email/password login & registration with password validator
│   │   ├── ConnectGitHubPage.tsx    # GitHub PAT linking & public preview mode
│   │   ├── RepositorySelectPage.tsx # Bulk repository onboarding & import
│   │   ├── DashboardPage.tsx        # System status, metrics & live execution stream
│   │   ├── RepositoriesPage.tsx     # Filterable repository catalog with config modals
│   │   ├── RepositoryDetailPage.tsx # Deep repository document inspection & revision history
│   │   ├── ActivityPage.tsx         # Consolidated audit log & event feed
│   │   └── SettingsPage.tsx         # Account preferences & security options
│   ├── services/             # Typed API integration services:
│   │   ├── authService.ts           # /auth endpoints (signup, login, me, connect-github)
│   │   ├── automationService.ts     # /automation toggles and config patch
│   │   ├── executionService.ts      # /executions listing & pipeline triggers
│   │   ├── githubService.ts         # /github repos & public preview
│   │   └── repositoryService.ts     # /repositories CRUD
│   ├── types/                # TypeScript interface definitions (User, Repository, Execution)
│   ├── App.tsx               # Root component & route dispatcher
│   └── main.tsx              # React DOM mounting entrypoint
├── Dockerfile                # Production Nginx container
├── vercel.json               # SPA routing rewrite rules for Vercel
├── package.json              # NPM dependencies & scripts
└── vite.config.ts            # Vite build configuration with /api proxy
```

---

## ⚡ Development Setup

```bash
# Install dependencies
npm install

# Start local dev server (default port: 5173)
npm run dev

# Build production bundle
npm run build
```
