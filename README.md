# StudyOps AI

[![CI](https://github.com/DanielBD-1/studyops-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/DanielBD-1/studyops-ai/actions/workflows/ci.yml)

Web app that helps students turn study material into summaries, tasks, flashcards, Trello cards, and focus sessions.

**Product platform:** **Browser-based web application only** — not a native mobile app, Android/iOS app, phone app, or app-store product. Responsive layout in the browser (including narrow viewports) is in scope; that is not mobile-app product scope.

**Current status:** Phases **1A–1G**, **2A–2G**, **2L-a/b/c/d**, **3A-a/b/c/c.1/c.2/c.3/d/e/f**, **3B-a/b/c/d/e/f/g**, **4A-0**–**4A-3**, **4B-1**, **4B-2**, **4C-0**, **4C-1**, **4C-2**, **4C-3**, **5B**, **5C**, **5C.1**, **6A-1**, **6A-2**, **6A-3**, **7A**, **7B**, **7C**, **8A**, **8B**, and **8C-1** through **8C-3D** are implemented — functional MVP through admin aggregate stats; hardening/docs alignment **7A**–**7C**; global **`AppShell`** and UI presentation polish through **8C-3D**. See **[docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md)** and **[docs/AGENT_MEMORY.md](docs/AGENT_MEMORY.md)**. **Docs alignment (2026-05-30):** Phase **9B** post-**8C** implementation-status alignment. Future work (**Trello OAuth**, admin logs / user management / role management, course-level generate, PDF upload, dashboard polling/WebSockets/cross-tab sync, spaced repetition, payments, production deployment, etc.) requires explicit human approval — see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## What works today

- **Global AppShell (8C-1)** — authenticated routes use sticky top nav (Dashboard, Courses, Tasks, Flashcards, Trello; Admin link for admins; logout); auth pages stay outside the shell
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
- **Focus Sessions (MVP complete)** — **`public.focus_sessions`** table on Supabase; backend `POST /api/focus` and `POST /api/focus/:sessionId/complete` (server-calculated actual minutes; optional task completion); protected **`/focus/:taskId`** page with **Start Focus** on pending tasks (**25**-minute display timer; complete sends `{ completedTask }` only); **manual smoke test passed** (**4C-3**, **2026-05-29**)
- **Dashboard** — protected **`/dashboard`** displays real user-owned aggregate stats from **`GET /api/dashboard/stats`** (Overview, Tasks, Focus, Learning assets, Trello sync count, per-course breakdown with links); read-only; fetch on mount + **Try again** + **Refresh stats**; when the dashboard is open, stats refresh silently after stat-changing actions elsewhere (**5B** backend + **5C** UI + **5C.1** invalidation-only refresh — **no** backend/API changes in **5C.1**)
- **Admin (6A-1 + 6A-2 + 6A-3)** — backend **`requireAdmin`** + **`GET /api/admin/access-check`** (**`{ admin: true }`** only) and **`GET /api/admin/stats`** (platform-wide aggregate counts; **`requireAuth`** + **`requireAdmin`**); frontend protected **`/admin`** dashboard consumes **`GET /api/admin/stats`** via **`admin.service.js`** (aggregate numbers and safe labels only — no emails, content, plan JSON, or raw rows); **`AdminRoute`** is UX-only — backend remains authoritative; **Admin** link in **`AppShell`** nav for admins; **manual smoke test passed** (**6A-3**, **2026-05-29**); admin logs / user management **not** implemented
- **Trello sync (manual MVP, with board/list picker)** — protected **`/trello`** page: enter apiKey/token per session (**not stored** in DB or browser storage), **Load boards** and choose board/list in the app (**manual listId lookup not required**), select owned tasks (max 50), sync via StudyOps backend only (frontend never calls Trello directly); view summary and per-task results (`success` / `skipped` / `failed`); credentials cleared after sync attempt; **manually smoke-tested** (card created, duplicate sync skipped); backend writes `trello_sync_logs` and updates `study_tasks.trello_card_id` on success — **this is the live user path**
- **Trello OAuth foundation (A2)** — encrypted `trello_connections` storage + backend crypto/repository in repo
- **Trello OAuth backend connect routes (A3 + A4-STATE, not live for users)** — `GET /api/trello/connection`, `GET /api/trello/authorize-url`, `POST /api/trello/connect/complete` (requires `{ token, state }`), `POST /api/trello/disconnect` (backend only; reviewed; signed OAuth state blocks account-linking CSRF; **no** frontend callback or Connect UI); boards/lists/sync still use manual apiKey/token
- **Trello not implemented (user-facing OAuth)** — **A4 frontend:** callback route, fragment handling, Connect UI; **A5:** sync/boards using stored token; board/list persistence; Trello card update/delete; force re-sync
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
| **backend** | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DOCUMENT_SERVICE_URL`, `FRONTEND_URL`, `PORT`; optional until OAuth connect: `TRELLO_API_KEY`, `TRELLO_TOKEN_ENCRYPTION_KEY`, `TRELLO_OAUTH_STATE_SECRET` (placeholders in `.env.example` only) | Service role **backend only**; Trello encryption/state secrets **never** in frontend |
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
| [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) | **What is built now** (routes, APIs, env, deferred work); **operating constraints** (Free Tier, cost gates, Gemini quota) |
| [docs/PRD.md](docs/PRD.md) | MVP product spec (includes future scope) |
| [docs/AGENT_MEMORY.md](docs/AGENT_MEMORY.md) | Completed phases and pitfalls |
| [CONTRIBUTING.md](CONTRIBUTING.md) | PR workflow, reviews, lint |
| [SECURITY.md](SECURITY.md) | Secrets, keys, Security Review triggers |
| [AGENTS.md](AGENTS.md) · [CLAUDE.md](CLAUDE.md) · [SKILLS.md](SKILLS.md) | Agent roles and rules |
| [DESIGN.md](DESIGN.md) | UI/UX presentation guidance (styling applied Phase **2J**, refined **8A**, global shell + workspace polish **8C-1**–**8C-3D** complete; further polish requires approval) |
