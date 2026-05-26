# Workflow: Document Processing & Study Plan Generation

**Owner:** Orchestrator  
**Prerequisite:** Phase 1 complete (auth, courses); study materials schema applied (Phase 2A)  
**ADR gate:** 002, 003 (mandatory)  
**Status:** **Partially complete** — implemented in slices **2D–2F**, **2L** (latest plan persistence), **3A-a/b** (`study_tasks` table + manual backend API); plan → `study_tasks` import, task UI, and PRD course-level generate **deferred**

See **`docs/IMPLEMENTATION_STATUS.md`** for the authoritative built-state summary.

---

## Original goal (PRD-oriented)

End-to-end: document-service Gemini + Zod, backend generate, **persist** materials/tasks/flashcards, frontend generate UI on course paste route.

---

## Implemented (do not re-implement)

| Slice | What was delivered |
|-------|-------------------|
| **2D** | `document-service` `POST /process` — `{ studyText }`, `GEMINI_API_KEY`, Zod `GeminiOutputSchema`, mocked tests |
| **2E** | Backend `POST /api/study-materials/:materialId/generate` — body `{}`, ownership, `DOCUMENT_SERVICE_URL` → `/process`, ephemeral `{ materialId, courseId, plan }` |
| **2F** | Frontend Generate on `/study-materials/:materialId` — plan display |
| **2G** | ESLint in all packages + CI |
| **2L-a/b/c** | Latest generated plan persisted per material; frontend load/clear |
| **3A-a** | `public.study_tasks` schema + RLS (migration applied on Supabase) |
| **3A-b** | Manual `study_tasks` backend API — **no** frontend task UI |

**Implemented generate contract (current):**

- Route: `POST /api/study-materials/:materialId/generate` (not `POST /api/courses/:courseId/generate`)
- Body: `{}` only — backend reads saved `study_materials.content` after ownership
- Latest **`plan` JSON** persisted per material (2L); **no** import of plan tasks into **`study_tasks`** rows; **`flashcards`** table not created

---

## Deferred (requires separate approval)

- [ ] `POST /api/courses/:courseId/generate` with client `{ studyText }` (PRD §9)
- [x] DB table: `study_tasks` (Phase 3A-a)
- [x] Manual `study_tasks` backend API (Phase 3A-b)
- [ ] Import generated plan tasks into `study_tasks` rows
- [ ] DB table: `flashcards` (beyond `study_materials`)
- [x] Persist validated Gemini **latest plan** per material (Phases 2L-a/b/c)
- [ ] Task/flashcard management UI, Trello, dashboard, admin
- [ ] Course page `/courses/:id/generate` route (PRD §6.5)

**Persistence Security Review:** Required before any phase writes AI output to the database.

---

## Human approval checkpoints (for remaining work)

| Step | Requires approval? |
|------|-------------------|
| Persistence schema + API | Yes |
| Course-level paste generate | Yes |
| New npm packages | Yes |
| Gemini API key in document-service env | Yes (human provides locally) |

---

## Reference steps (historical plan)

The steps below describe the **original monolithic workflow**. Completed items are marked; use **IMPLEMENTATION_STATUS** before starting new work.

### 1. Orchestrator — Plan

- [x] ADR 002: Gemini only in document-service
- [x] ADR 003: `GeminiOutputSchema` per PRD Section 8
- [x] Delivered via phased approvals (2D–2F)

### 2. Implementation Agent — Document service

- [x] `POST /process` — accepts `{ studyText }`, validates length 100–50,000
- [x] `gemini.service.js` — 30s timeout, no retry on timeout
- [x] `gemini.schema.js` — Zod schema matching PRD
- [x] Parse → validate → return or `GEMINI_INVALID_RESPONSE`
- [x] Logger redacts full prompts

### 3. Implementation Agent — Backend orchestration

- [x] Material-scoped generate (2E) — **not** course `{ studyText }` route
- [x] Verify ownership via `study_materials` → `courses.user_id`
- [x] HTTP call to document-service
- [ ] Import generated plan tasks into `study_tasks`; save `flashcards` rows — **deferred**
- [x] Standard API envelope; error codes: `GEMINI_*`, `VALIDATION_ERROR`

### 4. Implementation Agent — Frontend

- [x] Generate on `/study-materials/:materialId` (2F) — **not** `/courses/:id/generate` paste page
- [x] Loading: "Processing with AI…"
- [x] Read-only plan: summary, key topics, tasks, flashcards (ephemeral)
- [x] Error messages from backend envelope

### 5. Testing Agent

- [x] Mocked Gemini/document-service in CI (no live keys)
- [ ] Mocked persistence tests — **when persistence phase starts**

### 6. Supervisor Review Agent — Diff review

### 7. Security Review Agent

Required for Gemini, generate, logging, and any future persistence.

### 8. Human — Final judgment

- [x] Generate flow with saved material (manual smoke when env configured)
- [x] Persisted latest plan per material (2L)
- [ ] Task UI, plan → `study_tasks` import, `flashcards` table/UI — **deferred**

### 9. Documentation Agent

- [x] AGENT_MEMORY entries for 2D–2G
- [x] `docs/IMPLEMENTATION_STATUS.md` (Phase 2H)

---

## Definition of Done (remaining monolithic goal)

Not complete until persistence and PRD-aligned features are explicitly approved and delivered. Current slices are **done** per their own phase gates.

---

## Forbidden

- Direct frontend calls to Gemini or `/process`
- Saving raw model JSON without Zod (when persistence is added)
- Retry on Zod failure or timeout
- Sending `studyText` in material-scoped generate body from frontend
