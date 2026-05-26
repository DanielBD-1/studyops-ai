# StudyOps AI

[![CI](https://github.com/DanielBD-1/studyops-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielBD-1/studyops-ai/actions/workflows/ci.yml)

Web app that helps students turn study material into summaries, tasks, flashcards, Trello cards, and focus sessions.

**Current status:** Phases **1A–1G**, **2A–2G**, **2L-a/b/c/d**, and **3A-a/b** are implemented — auth, courses, study materials, Gemini document-service, backend generate + saved-plan APIs, frontend load/clear UI, and a **manual study tasks backend API** (`study_tasks` table on Supabase). There is **still no task UI** (Phase **3A-c/d** deferred). See **[docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md)** for routes and boundaries. Phase history: **[docs/AGENT_MEMORY.md](docs/AGENT_MEMORY.md)**. Future work (task **UI**, generated-plan import into tasks, flashcards **table/UI**, Trello, dashboard, deployment) requires explicit human approval — see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## What works today

- **Auth** — register, login, protected routes
- **Courses** — CRUD API + UI
- **Study materials** — CRUD API + UI (`/study-materials/:materialId`)
- **AI generate (persisted latest plan)** — save material → **Generate study plan** → latest plan stored per material → **reloads on refresh** → **Clear plan** removes saved plan via backend; read-only plain-text display (not task/flashcard management)
- **Study tasks (backend only)** — manual CRUD via `/api/courses/:id/tasks` and `/api/tasks` (Bearer JWT); **no** `/tasks` or course task UI yet; **no** import from generated plan JSON
- **document-service** — `POST /process` (internal; Gemini key server-side only)
- **CI** — lint, tests, frontend build on Node.js 22

## Architecture

```
frontend (React + Vite)
    → backend (Express, :3001)
        → document-service POST /process (:3002)
            → Gemini
    → Supabase (Auth + Postgres)
```

Details: [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) · ADRs in [docs/adrs/](docs/adrs/)

## Repository layout

```
frontend/           # React + Vite
backend/            # Express modular monolith
document-service/   # Gemini + Zod (POST /process)
docs/               # PRD, IMPLEMENTATION_STATUS, ADRs, workflows, AGENT_MEMORY
supabase/           # Migrations (human apply only)
```

## Prerequisites

- **Node.js 20.6+** (backend/document-service use `node --env-file=.env`)
- npm 9+

## Setup

Install per package (new packages require human approval per workflow):

```bash
cd backend && npm install
cd ../document-service && npm install
cd ../frontend && npm install
```

Copy environment templates (placeholders only — never commit `.env`):

```bash
cp backend/.env.example backend/.env
cp document-service/.env.example document-service/.env
cp frontend/.env.example frontend/.env
```

**Never put the Supabase service role key in `frontend/.env`.** Frontend uses `VITE_SUPABASE_ANON_KEY` only.

### Environment variables

| Package | Variables | Security |
|---------|-----------|----------|
| **backend** | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DOCUMENT_SERVICE_URL`, `FRONTEND_URL`, `PORT` | Service role **backend only** |
| **document-service** | `GEMINI_API_KEY`, `GEMINI_MODEL` (optional, default `gemini-2.5-flash-lite`), `PORT` | Gemini key **never** in frontend or backend |
| **frontend** | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Calls backend API only |

Zod validates env at startup (backend, document-service) or app load (frontend). Invalid config fails fast without logging secret values.

`GEMINI_API_KEY` is required in document-service for real `POST /process` / generate smoke tests (use a local key; never commit it).

## Run locally

```bash
# Terminal 1 — backend (default :3001)
cd backend && npm run dev

# Terminal 2 — document-service (default :3002)
cd document-service && npm run dev

# Terminal 3 — frontend (default http://localhost:5173)
cd frontend && npm run dev
```

## Health checks

- Backend: `GET http://localhost:3001/health`
- Document service: `GET http://localhost:3002/health`

## Quality checks (before PR)

```bash
cd backend && npm ci && npm run lint && npm test
cd ../document-service && npm ci && npm run lint && npm test
cd ../frontend && npm ci && npm run lint && npm test && npm run build
```

**Windows** (after `npm ci` in each package):

```powershell
.\scripts\check-all.ps1
```

GitHub Actions runs the same lint → test → build steps on **Node.js 22**.

## Documentation

| Doc | Use for |
|-----|---------|
| [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) | **What is built now** (routes, APIs, env, deferred work) |
| [docs/PRD.md](docs/PRD.md) | MVP product spec (includes future scope) |
| [docs/AGENT_MEMORY.md](docs/AGENT_MEMORY.md) | Completed phases and pitfalls |
| [CONTRIBUTING.md](CONTRIBUTING.md) | PR workflow, reviews, lint |
| [SECURITY.md](SECURITY.md) | Secrets, keys, Security Review triggers |
| [AGENTS.md](AGENTS.md) · [CLAUDE.md](CLAUDE.md) · [SKILLS.md](SKILLS.md) | Agent roles and rules |
| [DESIGN.md](DESIGN.md) | UI guidance for approved frontend phases only (styling pass not started) |
