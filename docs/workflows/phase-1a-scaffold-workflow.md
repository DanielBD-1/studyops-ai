# Workflow: Phase 1A — Project Scaffold

**Owner:** Orchestrator  
**Prerequisite:** Context engineering reviewed; human approves Phase 1A start  
**ADR gate:** 001 (modular monolith layout), 002 (separate `document-service/` directory—no Gemini yet)

---

## 1. Purpose

Phase 1A is the **first implementation step only**: create empty project shells for `frontend/`, `backend/`, and `document-service/` with minimal configuration, placeholder environment files, and health-check endpoints so the repo can build and run locally—**without** auth, database, or feature logic.

After Phase 1A completes, the team reviews the scaffold diff and **stops** before Phase 1 Foundation (auth, courses, Supabase) per `docs/workflows/phase-1-foundation-workflow.md`.

**Do not re-run Phase 1A** if `frontend/`, `backend/`, and `document-service/` directories already exist with package.json files. Use `phase-1-foundation-workflow.md` Step 3+ instead.

---

## 2. Scope

**In scope for Phase 1A:**

| Item | Detail |
|------|--------|
| Directories | `frontend/`, `backend/`, `document-service/` (shells only) |
| Config | Root and per-package `.gitignore`, `package.json` (scripts/deps declared; install gated) |
| Env templates | `.env.example` at root and/or per package—placeholders only |
| Backend shell | Express app skeleton, modular folder stubs per PRD 13.5 (empty modules, no routes beyond health) |
| Document-service shell | Express app skeleton, no Gemini client |
| Frontend shell | Vite + React minimal app, no auth/routing beyond a placeholder page optional |
| Health checks | `GET /health` (or equivalent) on backend and document-service returning JSON OK |
| Verification | Manual or minimal script check that health endpoints respond after `npm install` (post-approval) |

**Explicitly allowed verification:**

- Smoke request to health endpoints after dependencies installed
- No integration test suite beyond scaffold/health-check verification

---

## 3. Out of Scope

Do **not** implement in Phase 1A:

| Area | Reason |
|------|--------|
| Auth (Supabase, JWT, login/register) | Phase 1 Foundation |
| Courses CRUD | Phase 1 Foundation |
| Supabase schema / migrations / RLS | Requires separate human approval |
| Gemini / document processing | `document-processing-workflow.md` |
| Trello | `trello-sync-workflow.md` |
| Tasks, flashcards, focus sessions | Later phases |
| Student or admin dashboards | Later phases |
| Admin routes or middleware | Later phases |
| Zod env validation (beyond empty stub file optional) | Phase 1 Foundation |
| CI/CD workflows (`.github/workflows`) | Human approval required |
| Real API keys or secrets in any file | Forbidden |

---

## 4. Required Input Documents

Before starting, Implementation Agent must read:

| Document | Why |
|----------|-----|
| `docs/PRD.md` | Sections 5, 6, 13.5 (target structure), 13.6 (implementation order) |
| `AGENTS.md` | Approval rules, off-limits, anti-patterns, DoD |
| `docs/adrs/001-modular-monolith.md` | Backend module layout |
| `docs/adrs/002-separate-document-service.md` | Separate `document-service/`; `POST /process` not exposed publicly in later phases |
| `docs/workflows/phase-1-foundation-workflow.md` | What comes **after** 1A (do not implement yet) |

---

## 5. Allowed Files/Folders to Create

### Directories (structure only)

```
frontend/
  src/                    # minimal entry (e.g. App.jsx, main.jsx)
  public/                 # if Vite default
backend/
  src/
    modules/              # empty or .gitkeep stubs: auth, courses, tasks, etc.
    shared/middleware/    # placeholder or health-only
    config/               # empty stub ok; no real secrets
  tests/                  # optional: health-check test only
document-service/
  src/
    controllers/          # health only
    config/               # stub
  tests/                  # optional: health-check test only
```

### Files allowed

| Path | Notes |
|------|-------|
| `frontend/package.json` | Name, scripts; deps listed but install needs approval |
| `backend/package.json` | Same |
| `document-service/package.json` | Same |
| `frontend/vite.config.js` | Minimal Vite config |
| `frontend/index.html` | Vite default |
| `backend/src/server.js` or `app.js` | Express listen + health route |
| `document-service/src/server.js` or `app.js` | Express listen + health route |
| `**/.env.example` | Placeholders only, e.g. `PORT=3001`, `GEMINI_API_KEY=your_key_here` |
| `.gitignore` (root + packages) | Must include `.env`, `node_modules`, `dist`, `build` |
| Root `README.md` | **Update only** setup/run section for scaffold—no secrets |

### Files not allowed in Phase 1A

- `.env` (real secrets)
- Supabase migration SQL
- Auth middleware with real JWT validation
- Gemini service, Trello service
- `POST /process`, `/api/auth/*`, `/api/courses/*`
- `.github/workflows/*` (without approval)
- Changes to `docs/PRD.md`, ADRs, or governance files without approval

---

## 6. Human Approval Gates

| Gate | Trigger | Human must say |
|------|---------|----------------|
| **G0 — Start Phase 1A** | Before any scaffold files | `approved — begin Phase 1A` |
| **G1 — npm install** | Before `npm install` in any package | `approved — npm install` |
| **G2 — New dependency** | Any package not in approved plan | `approved — add [package]` |
| **G3 — CI workflow** | Adding GitHub Actions | `approved — CI` |
| **G4 — Post-scaffold merge** | Before Phase 1 Foundation | `approved — Phase 1A complete` |

**Format:**

```
⚠️ APPROVAL REQUIRED: [action]
Why: Phase 1A gate [G0–G4]
Proposed: [package list / command]
```

---

## 7. Required Pre-Implementation Summary

Orchestrator outputs this **before** Implementation Agent writes code:

```markdown
## Phase 1A Pre-Implementation Summary

**Workflow:** docs/workflows/phase-1a-scaffold-workflow.md
**ADRs:** 001, 002 — [one-line compliance each]

### Packages to scaffold
- frontend: [Vite + React — planned deps, no versions with secrets]
- backend: [Express — planned deps]
- document-service: [Express — planned deps]

### Health endpoints
- backend: GET /health → { "status": "ok", "service": "backend" }
- document-service: GET /health → { "status": "ok", "service": "document-service" }

### Files to create
- [bulleted list]

### Files explicitly NOT created
- auth, courses, supabase, gemini, trello, dashboards, admin

### Approval needed now
- [ ] G0 begin Phase 1A
- [ ] G1 npm install (deferred until after scaffold commit plan)

### Secrets check
- [ ] Plan contains no hardcoded secrets or API keys
```

Wait for **G0** before implementation.

---

## 8. Implementation Steps

Execute in order. **Stop** at step 10 until human review.

### Step 1 — Orchestrator

- [ ] Publish pre-implementation summary (Section 7)
- [ ] Obtain G0 approval

### Step 2 — Implementation Agent: Root & ignore rules

- [ ] Create/update root `.gitignore`
- [ ] Create root `.env.example` if used (placeholders only)

### Step 3 — Implementation Agent: `backend/` shell

- [ ] `package.json` with scripts: `start`, `dev`, `test` (test may be no-op or health-only)
- [ ] `src/app.js` + `src/server.js` — Express, JSON middleware, `GET /health`
- [ ] Empty `src/modules/*` directory stubs per PRD 13.5
- [ ] `backend/.env.example` — `PORT`, future `SUPABASE_*` placeholders (no real values)
- [ ] **Do not** add auth routes or Supabase client

### Step 4 — Implementation Agent: `document-service/` shell

- [ ] `package.json` with scripts
- [ ] Express + `GET /health` only
- [ ] `document-service/.env.example` — `PORT`, `GEMINI_API_KEY=your_key_here` placeholder
- [ ] **Do not** add Gemini SDK or `POST /process`

### Step 5 — Implementation Agent: `frontend/` shell

- [ ] `package.json` + Vite + minimal React entry
- [ ] React Router v6 in dependencies (no routes configured yet; Foundation adds routes)
- [ ] `frontend/.env.example` — e.g. `VITE_API_URL=http://localhost:3001`
- [ ] **Do not** add auth routes, Supabase client, or API services beyond optional health display

### Step 6 — Human approval: npm install (G1)

- [ ] Request G1 with exact package list
- [ ] Run `npm install` only after approval (per package or monorepo as planned)

### Step 7 — Verification (health only)

- [ ] Start backend → `GET /health` returns 200 + JSON
- [ ] Start document-service → `GET /health` returns 200 + JSON
- [ ] Optional: frontend dev server starts without error
- [ ] No external API calls (no Gemini, Trello, Supabase)

### Step 8 — Testing Agent (limited)

- [ ] At most: health endpoint test per service (supertest or fetch)
- [ ] **Do not** add auth, course, or Gemini tests

### Step 9 — Supervisor Agent

- [ ] Run diff review per `.claude/agents/supervisor-agent.md`
- [ ] Confirm scope = scaffold only

### Step 10 — Stop for review

- [ ] Publish post-implementation summary (Section 9)
- [ ] **Stop** — do not start Phase 1 Foundation until G4

---

## 9. Required Post-Implementation Summary

Implementation Agent (or Orchestrator) outputs:

```markdown
## Phase 1A Post-Implementation Summary

### Created
- [list directories and key files]

### Health checks
- backend: [URL, sample response]
- document-service: [URL, sample response]
- frontend: [dev URL, status]

### Dependencies installed (G1)
- [list packages per workspace — or "none yet, pending G1"]

### Not created (confirm)
- auth, courses, supabase schema, gemini, trello, dashboards, admin

### Secrets scan
- [ ] No .env committed
- [ ] No hardcoded API keys in diff

### Known issues / follow-ups
- [any]

### Next step
- Await human G4 → then Phase 1 Foundation workflow
```

---

## 10. Stop Condition

Phase 1A ends when **all** are true:

1. Scaffold files exist per Section 5.
2. Health endpoints work locally (after approved `npm install`).
3. Post-implementation summary published.
4. Supervisor review completed (no blocking scope creep).
5. Human has **not** yet approved Phase 1 Foundation.

**Hard stop:** Do not proceed to auth, Supabase, courses, or feature modules until human issues G4 and explicitly starts `phase-1-foundation-workflow.md`.

---

## 11. Definition of Done

Phase 1A is **done** only when:

- [ ] `frontend/`, `backend/`, `document-service/` exist as shells per PRD 13.5 layout
- [ ] Each package has `package.json` and `.env.example` (placeholders only)
- [ ] `.gitignore` excludes `.env`, `node_modules`, `dist`
- [ ] `GET /health` works on backend and document-service
- [ ] No auth, courses, Supabase schema, Gemini, Trello, dashboards, or admin code
- [ ] No hardcoded secrets or API keys in diff
- [ ] `npm install` ran only with G1 approval
- [ ] New dependencies only with G2 approval
- [ ] Tests limited to scaffold/health-check verification (if any)
- [ ] Supervisor review: APPROVE (or APPROVE WITH NOTES if non-blocking suggestions only)
- [ ] Post-implementation summary delivered
- [ ] Human G4: Phase 1A complete
- [ ] AGENT_MEMORY updated after merge (Documentation Agent)

---

## 12. Review Checklist

### Human reviewer

- [ ] Scope is scaffold-only (no feature creep)
- [ ] No `.env` or real secrets in repo
- [ ] `.env.example` uses placeholders only
- [ ] Backend module folders match monolith layout (ADR 001)
- [ ] `document-service` is separate, no Gemini code (ADR 002)
- [ ] Health endpoints return JSON, no auth required
- [ ] No `POST /process` or public document-service exposure
- [ ] Frontend does not call external Gemini/Trello APIs
- [ ] `package.json` deps are reasonable and approved
- [ ] Ready to approve G4 before Phase 1 Foundation

### Supervisor Agent

- [ ] MVP scope: scaffold only
- [ ] ADR 001/002 respected
- [ ] No tests for auth/courses/Gemini
- [ ] No secrets in diff

### Security Review Agent

**Lightweight pass** for Phase 1A (no auth/DB yet):

- [ ] No committed secrets
- [ ] No hardcoded keys in source
- [ ] `.env.example` safe
- [ ] Health routes expose no sensitive data

---

## Relationship to Other Workflows

| Phase | Workflow | When |
|-------|----------|------|
| **1A** | This file | First code in repo — shells + health |
| **1** | `phase-1-foundation-workflow.md` | After G4 — auth, courses, Supabase |
| **2+** | `document-processing-workflow.md`, etc. | After Foundation |

**Important:** If Phase 1A completes successfully, `phase-1-foundation-workflow.md` Step 2 (Project Scaffold) should be **skipped** since scaffolding is already done. Foundation workflow continues at Step 3 (Supabase & env).

**Orchestrator:** When planning Phase 1 Foundation after Phase 1A completion, omit Step 2 from the plan and begin at Step 3.

**Orchestrator:** Add Phase 1A to plan when human requests "scaffold only" or "begin Phase 1A"—not full Phase 1 in one step.
