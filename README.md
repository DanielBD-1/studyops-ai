# StudyOps AI

Web app that turns study material into tasks, flashcards, Trello cards, and focus sessions.

**Phase 1A (current):** Project scaffold only — health checks, no auth or features yet.

## Repository layout

```
frontend/           # React + Vite
backend/            # Express modular monolith
document-service/   # Document processing (Gemini in later phases)
docs/               # PRD, ADRs, workflows
```

## Prerequisites

- Node.js 18+
- npm 9+

## Setup (after dependencies installed)

Install per package (requires human approval per workflow):

```bash
cd backend && npm install
cd ../document-service && npm install
cd ../frontend && npm install
```

Copy environment templates:

```bash
cp backend/.env.example backend/.env
cp document-service/.env.example document-service/.env
cp frontend/.env.example frontend/.env
```

Fill in placeholder values only for local dev; never commit `.env`.

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
