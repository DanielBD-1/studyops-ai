# Workflow: Document Processing & Study Plan Generation

**Owner:** Orchestrator  
**Prerequisite:** Phase 1 complete (auth, courses, DB)  
**ADR gate:** 002, 003 (mandatory)

---

## Goal

Implement `document-service` Gemini integration with Zod validation, backend `POST /api/courses/:courseId/generate`, persistence of materials/tasks/flashcards, and frontend generate UI.

---

## Human Approval Checkpoints

| Step | Requires approval? |
|------|-------------------|
| Start this workflow | Yes |
| Add `zod`, `@google/generative-ai` (or chosen SDK) | Yes |
| DB tables: study_materials, study_tasks, flashcards | Yes |
| Gemini API key in document-service env | Yes (human provides key locally) |

---

## Steps (Execute in Order)

### 1. Orchestrator — Plan

- [ ] ADR 002: Gemini only in document-service
- [ ] ADR 003: `GeminiOutputSchema` per PRD Section 8
- [ ] Request human approval to start

### 2. Implementation Agent — Document service

- [ ] `POST /process` — accepts `{ studyText }`, validates length 100–50,000
- [ ] `gemini.service.js` — 30s timeout, no retry on timeout
- [ ] `gemini.schema.js` — Zod schema matching PRD
- [ ] Parse → validate → return or `GEMINI_INVALID_RESPONSE`
- [ ] Logger redacts full prompts in production logs

### 3. Implementation Agent — Backend orchestration

- [ ] `POST /api/courses/:courseId/generate` with `{ studyText }`
- [ ] Verify course ownership
- [ ] HTTP call to document-service
- [ ] Save study_materials, study_tasks, flashcards only after validation
- [ ] Standard API envelope; error codes: `GEMINI_*`, `VALIDATION_ERROR`

### 4. Implementation Agent — Frontend

- [ ] StudyMaterialInput on `/courses/:id/generate`
- [ ] Character count 100–50,000
- [ ] Loading: "Processing with AI..."
- [ ] GeneratedPlan: summary, key topics, tasks, flashcards
- [ ] Error messages per PRD 11.5

### 5. Testing Agent

- [ ] Zod passes valid fixture; fails invalid fixture
- [ ] Mocked Gemini success creates DB records
- [ ] Mocked timeout → `GEMINI_TIMEOUT` / 504
- [ ] Mocked invalid JSON → validation error
- [ ] **No live Gemini in CI**

### 6. Supervisor Agent — Diff review

### 7. Security Review Agent

Required (Gemini key, new endpoints, logging).

### 8. Human — Final judgment

- [ ] Paste sample text → see tasks and flashcards

### 9. Documentation Agent

- [ ] AGENT_MEMORY: document-service URL env var, schema version

---

## Definition of Done

- [ ] End-to-end generate flow works with mocked tests in CI
- [ ] Unvalidated AI output never saved
- [ ] ADR 002/003 cited in PR description
- [ ] Security + Supervisor reviews passed

---

## Forbidden

- No direct frontend calls to external Gemini or Trello APIs. The frontend may call the backend endpoints such as `POST /api/courses/:courseId/generate`, but external API calls must go through the backend or document-service.
- Saving raw model string without Zod
- Retry on Zod failure or timeout
