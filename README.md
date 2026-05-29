# StudyOps AI

[![CI](https://github.com/DanielBD-1/studyops-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielBD-1/studyops-ai/actions/workflows/ci.yml)

Web app that helps students turn study material into summaries, tasks, flashcards, Trello cards, and focus sessions.

**Current status:** Phases **1A–1G**, **2A–2G**, **2L-a/b/c/d**, **3A-a/b/c/c.1/c.2/c.3/d/e/f**, **3B-a/b/c/d/e/f/g**, **4A-0**–**4A-3**, **4B-1**, **4B-2**, **4C-0**, and **4C-1** are implemented — auth, courses, study materials, Gemini document-service, backend generate + saved-plan APIs, frontend load/clear/**import plan tasks** UI, **saved DB flashcards**, **`study_tasks`** API and task UI, **`public.trello_sync_logs`** and **Trello board/list picker end-to-end** on **`/trello`** (**manual smoke test passed**), **`public.focus_sessions`** database foundation (**applied on Supabase**, **2026-05-29**), and **backend Focus Sessions API** (`POST /api/focus`, `POST /api/focus/:sessionId/complete`). **`/focus/:taskId` UI** and dashboard focus minutes are still pending (**4C-2** / **5B**). See **[docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md)** and **[docs/AGENT_MEMORY.md](docs/AGENT_MEMORY.md)**. Future work (**Trello OAuth / Connect Trello** still deferred, focus frontend, dashboard, deployment, etc.) requires explicit human approval — see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## What works today

- **Auth** — register, login, protected routes
- **Courses** — CRUD API + UI
- **Study materials** — CRUD API + UI (`/study-materials/:materialId`)
- **AI generate (persisted latest plan)** — save material → **Generate study plan** → latest plan stored per material → **reloads on refresh** → **Clear plan** removes saved plan via backend; read-only plain-text display; **Import tasks to course** copies plan tasks into `study_tasks` (linked to that material; appears on course and `/tasks` pages)
- **Saved DB flashcards (material detail)** — on `/study-materials/:materialId`, **Saved flashcards** loads rows via `GET /api/flashcards?materialId=`, supports **manual create**, **edit**, and **delete** (inline forms; comma-separated tags), and reuses flip/reveal study UI for saved cards
- **Import plan flashcards to library** — copies `plan.flashcards` into saved flashcards (validate all, sequential `POST /api/courses/:id/flashcards`); does not clear the generated plan; duplicate warning before import
- **Flashcard study UI (generated plan)** — reveal and navigate flashcards from the **saved generated plan** (`plan.flashcards`); unchanged from Phase 3B-a; both plan and saved sections may show cards after import
- **Flashcards backend API** — `GET /api/flashcards`, `POST /api/courses/:id/flashcards`, `PATCH` / `DELETE /api/flashcards/:flashcardId` (auth + ownership; frontend uses full CRUD on material detail and global page)
- **Global saved flashcards (`/flashcards`)** — protected page listing all saved flashcards across your account; **create** new cards (required course, optional study material link); **filter by course and study material**; **study filtered cards** with flip/reveal UI; **edit** and **delete** saved cards; links to course and material pages (plan import remains on study material detail)
- **Study tasks (course UI)** — on `/courses/:id`: **All/Pending/Completed filters**, list, **create**, **edit pending** tasks (`PATCH`), optional **link/unlink** study materials, mark complete, delete (Bearer JWT)
- **Study tasks (global UI)** — on **`/tasks`**: protected cross-course list; **course + status filters** (in-memory); **create**, **edit pending**, mark complete, delete; includes tasks created manually or **imported from a generated plan**
- **Focus Sessions (backend API)** — `POST /api/focus` (start session for owned pending task) and `POST /api/focus/:sessionId/complete` (server-calculated actual minutes; optional task completion); **`public.focus_sessions`** table on Supabase; **no** `/focus/:taskId` UI yet
- **Trello sync (manual MVP, with board/list picker)** — protected **`/trello`** page: enter apiKey/token (not stored), **Load boards** and choose board/list in the app (**manual listId lookup not required**), select owned tasks (max 50), sync via StudyOps backend only (frontend never calls Trello directly); view summary and per-task results (`success` / `skipped` / `failed`); credentials cleared after sync attempt; **manually smoke-tested** (card created, duplicate sync skipped); backend writes `trello_sync_logs` and updates `study_tasks.trello_card_id` on success
- **Trello not implemented** — OAuth / Connect Trello; stored credentials; board/list persistence; Trello card update/delete; force re-sync
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
