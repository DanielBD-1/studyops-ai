# StudyOps AI

Web app that turns study material into tasks, flashcards, Trello cards, and focus sessions.

**Phase 1B (current):** Supabase & environment setup — Zod-validated env, Supabase client factories (no schema, no auth UI yet).

**Phase 1A (done):** Project scaffold — health checks.

## Repository layout

```
frontend/           # React + Vite
backend/            # Express modular monolith
document-service/   # Document processing (Gemini in later phases)
docs/               # PRD, ADRs, workflows
```

## Prerequisites

- **Node.js 20.6 or newer** (required — backend and document-service scripts use `node --env-file=.env`, which needs Node 20.6.0+)
- npm 9+

## Setup (after dependencies installed)

Install per package (requires human approval per workflow):

```bash
cd backend && npm install
cd ../document-service && npm install
cd ../frontend && npm install
```

Copy environment templates (placeholders only — use your real Supabase project values locally):

```bash
cp backend/.env.example backend/.env
cp document-service/.env.example document-service/.env
cp frontend/.env.example frontend/.env
```

Never commit `.env`. **Do not put the service role key in `frontend/.env`** — only `VITE_SUPABASE_ANON_KEY`.

### Required variables (Phase 1B)

| Package | Variables |
|---------|-----------|
| **backend** | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, optional `SUPABASE_ANON_KEY`, `DOCUMENT_SERVICE_URL`, `PORT` |
| **frontend** | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| **document-service** | `PORT` only (`GEMINI_API_KEY` optional, commented in example) |

Env is validated with **Zod** at startup (backend, document-service) or app load (frontend). Invalid config fails fast with field errors (values are not logged).

### Loading `.env` locally

Backend and document-service `npm run dev` / `npm start` use `node --env-file=.env` (Node 20.6+). Copy each package’s `.env.example` to `.env` before starting.

Alternatively, export variables in your shell if you run Node without `--env-file`.

## Run locally (Phase 1A)

```bash
# Terminal 1 — backend (default PORT 3001)
cd backend && npm run dev

# Terminal 2 — document-service (default PORT 3002)
cd document-service && npm run dev

# Terminal 3 — frontend (default http://localhost:5173)
cd frontend && npm run dev
```

## Health checks

- Backend: `GET http://localhost:3001/health`
- Document service: `GET http://localhost:3002/health`

## Documentation

- Product: `docs/PRD.md`
- Agents: `AGENTS.md`, `CLAUDE.md`, `SKILLS.md`
- Phase 1A workflow: `docs/workflows/phase-1a-scaffold-workflow.md`
