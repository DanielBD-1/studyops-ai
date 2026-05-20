# Workflow: Phase 1 — Foundation

**Owner:** Orchestrator  
**Prerequisite:** Human approval of context files and Phase 1 start  
**ADR gate:** 001 (monolith), 003 (Zod env validation when added)

---

## Goal

Establish repo structure, three packages (frontend, backend, document-service shells), Supabase auth, course CRUD, and baseline tests—per PRD Phase 1 and Section 13.6.

**Out of scope for this workflow:** Gemini generation, Trello, focus, admin dashboards (later workflows).

---

## Human Approval Checkpoints

| Step | Requires approval? |
|------|-------------------|
| Start Phase 1 | Yes — human confirms "begin Phase 1" |
| `npm install` / new packages | Yes |
| Supabase schema/migrations | Yes |
| Create `.github/workflows` | Yes |
| Scaffold `frontend/`, `backend/`, `document-service/` | No (after Phase 1 approved) |

---

## Steps (Execute in Order)

### 1. Orchestrator — Plan

- [ ] Confirm ADR 001, 003 understood
- [ ] Output file list to create (no extra modules)
- [ ] Request human: **"begin Phase 1"**

### 2. Implementation Agent — Project scaffold

**Only after approval:**

- [ ] Initialize `frontend/` (Vite + React, React Router v6)
- [ ] Initialize `backend/` (Express, modular folders per PRD 13.5)
- [ ] Initialize `document-service/` (Express shell—minimal, no Gemini yet)
- [ ] Add `.env.example` files with placeholders only
- [ ] Ensure `.gitignore` excludes `.env`, `node_modules`, `dist`

**Stop:** Do not call `npm install` without approval.

### 3. Implementation Agent — Supabase & env

**After schema approval:**

- [ ] Zod-validated `backend/src/config/env.js`
- [ ] Supabase client in backend (anon/key patterns per PRD—service role server-only)
- [ ] Profiles table with `role: student | admin`

### 4. Implementation Agent — Auth

- [ ] `POST /api/auth/register` — role forced to `student`
- [ ] `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- [ ] JWT middleware; 401/403 behavior
- [ ] Frontend: LoginForm, RegisterForm (no role selector), AuthContext, ProtectedRoute
- [ ] Routes: `/`, `/register`, protected `/dashboard` stub

### 5. Implementation Agent — Courses

- [ ] `GET /api/courses`, `POST /api/courses`, `GET /api/courses/:id`
- [ ] Title validation 3–100 chars
- [ ] Ownership: `user_id = req.user.id`
- [ ] Frontend: CourseList, CreateCourseModal, `/courses`, `/courses/:id` stub

### 6. Testing Agent — Tests

- [ ] Register creates `student` role
- [ ] Protected routes reject unauthenticated
- [ ] Student cannot access admin routes (403) — stub admin route OK
- [ ] Student cannot access another user's course (403)
- [ ] Course creation validation errors

### 7. Supervisor Agent — Diff review

Run prompt in `.claude/agents/supervisor-agent.md` on full Phase 1 diff.

### 8. Security Review Agent

Required for auth + Supabase. Run `docs/workflows/security-review-workflow.md`.

### 9. Human — Final judgment

- [ ] Demo: register → login → create course → list courses
- [ ] Approve merge

### 10. Documentation Agent

- [ ] Append Phase 1 entry to `docs/AGENT_MEMORY.md`
- [ ] Note env vars and schema decisions (no secrets)

---

## Definition of Done (Phase 1)

- [ ] All steps above complete
- [ ] PRD Phase 1 endpoints/components present
- [ ] No Gemini/Trello code added
- [ ] Lint + tests pass
- [ ] CI configured or ticket filed with human approval
- [ ] AGENT_MEMORY updated

---

## Off-Limits During Phase 1

- PDF upload, Trello sync, focus sessions, admin stats
- Gemini API key in frontend
- Redux, WebSockets, polling

---

## Rollback

If human rejects Phase 1 PR: revert scaffold commit; do not proceed to document-processing workflow.
