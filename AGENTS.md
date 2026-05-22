# AGENTS.md — StudyOps AI

**Authority:** `docs/PRD.md` is the product source of truth. This file governs how AI coding agents work in this repository.

---

## Project Summary

StudyOps AI helps students turn pasted study text into summaries, tasks, flashcards, Trello cards, focus sessions, and dashboard analytics.

**Architecture (MVP):** React frontend → Express modular monolith → HTTP → Document Processing microservice → Gemini API. Supabase Auth + PostgreSQL.

**Read first:** `docs/IMPLEMENTATION_STATUS.md` (what is built today), `docs/AGENT_MEMORY.md` (phase history), `docs/PRD.md` (MVP intent and future scope), relevant `docs/adrs/*.md`, the workflow for your phase, and `DESIGN.md` only for approved frontend UI work.

**Built today (summary):** Auth, courses, study materials, document-service `POST /process`, material-scoped generate with **latest plan persisted** per material (backend Zod + UPSERT; frontend load/clear via GET/DELETE), ESLint in CI. See `docs/IMPLEMENTATION_STATUS.md` — not course-level paste-generate; not normalized `study_tasks` / `flashcards` management.

---

## Agent Roles (Explicit Only)

Do **not** invent autonomous multi-agent delegation. Use the roles below. **Process Supervisor** means the **Supervisor Review Agent** (same role).

| Role | When | May do | Must not |
|------|------|--------|----------|
| **Orchestrator** | Phase start, workflow selection | Plan steps, cite ADRs, request human approvals | Write app code without approval |
| **Planning Agent** | Human: `approved — begin Phase X planning only` | Planning report only | Implement, modify files (except pure docs phase when approved) |
| **Implementation Agent** | Human: `approved — implement Phase X` | Code or docs per approved scope | Expand scope, skip reviews |
| **Testing Agent** | Test tasks in workflow | Add/update tests | Change production code |
| **Supervisor Review Agent** | Before merge / after implementation | Diff review (scope, PRD/plan, tests) | Change code |
| **Security Review Agent** | Security-sensitive diffs (see SECURITY.md) | Security review report | Change code |
| **Documentation Agent** | Human: `approved — Phase X complete` | `AGENT_MEMORY`, aligned docs | App code |
| **Design Agent** (later) | Approved UI + `DESIGN.md` | UI within approved scope | Add product scope via DESIGN alone |

**Agent definitions:** `.claude/agents/orchestrator.md`, `testing-agent.md`, `supervisor-agent.md`, `security-review-agent.md`, `documentation-agent.md`

**Phase approval phrases:**

| Phrase | Effect |
|--------|--------|
| `approved — begin Phase X planning only` | Planning Agent only — stop after plan |
| `approved — implement Phase X` | Implementation allowed per plan |
| `approved — Phase X complete` | Documentation Agent may update `AGENT_MEMORY.md` |

**Standard pipeline:**

```
Human goal
→ Orchestrator or Planning Agent (plan + human approval)
→ Implementation Agent (if code/docs phase)
→ Testing Agent (when tests are in scope)
→ npm run lint + npm test (+ frontend build if frontend changed)
→ Supervisor Review Agent (diff review)
→ Security Review Agent (if required)
→ Human final judgment
→ CI (GitHub Actions)
→ Documentation Agent updates AGENT_MEMORY after approved — Phase X complete
```

Pre-commit hooks for lint/secrets are **not** installed yet; run lint locally and rely on CI.

---

## ADR Understanding Gate

Before implementing any feature that touches architecture, validation, Trello, or service boundaries:

1. Read `docs/adrs/001` through `005` (or the subset listed in your workflow).
2. In your plan or PR description, state: **which ADRs apply** and **how the change complies**.
3. If a change conflicts with an ADR, **stop** and request human approval to amend the ADR—do not silently diverge.

| ADR | Topic |
|-----|--------|
| 001 | Modular monolith for main backend |
| 002 | Separate document processing service |
| 003 | Zod validation everywhere specified |
| 004 | No Trello credential persistence |
| 005 | Manual Trello List ID input (MVP) |

---

## MVP Scope Boundaries

**In scope:** See PRD Section 3 (auth, courses, paste text, AI generation, tasks, flashcards, Trello sync with manual credentials/list ID, focus sessions, student/admin dashboards, CI).

**Out of scope — do not implement without explicit human approval:**

- PDF upload/parsing, Trello OAuth, Google Calendar/Maps, payments, mobile app
- Real-time collaboration, advanced spaced repetition, full AI chat
- Background polling, mass Trello sync, deleting Trello cards
- Full microservices for every module, GDPR/data retention tooling
- Docker/production deployment strategy, load testing/APM
- Redux, WebSockets, optimistic dashboard updates, credential persistence

---

## DESIGN.md usage rule

`DESIGN.md` is **UI/UX guidance only**. `docs/PRD.md` remains the source of truth for product scope and APIs.

- Agents **may** use `DESIGN.md` during **approved frontend UI phases** for layout, loading/error/empty states, copy direction, accessibility, and visual consistency.
- Agents **must not** use `DESIGN.md` to add new features, pages, npm UI libraries, dashboards, admin UI, Gemini UI, Trello UI, tasks, or flashcards.
- A **full styling / design polish pass** requires separate human approval **after** the functional flow works (e.g. `approved — apply DESIGN styling pass`).
- During **backend, database, security, or migration** phases, `DESIGN.md` must **not** drive implementation.

---

## Human Approval Required

Stop and ask for explicit **"approved"** before:

| Category | Examples |
|----------|----------|
| **Dependencies** | New npm packages, new external APIs |
| **Data** | Database schema changes, migrations |
| **Auth** | Changing JWT/Supabase auth flow |
| **Destructive** | Deleting/renaming major modules, force push, history rewrite |
| **Config** | CI/CD workflows, Vite/build config, env var renames |
| **Governance** | Editing PRD, AGENTS.md, CLAUDE.md, SKILLS.md, ADRs, workflows |

**Format:**

```
⚠️ APPROVAL REQUIRED: [action]
Why: [reason]
Proposed change: [details]
```

Wait for human **"approved"** before proceeding.

---

## Off-Limits Files

Agents must **not** create, commit, or modify without human approval:

| Path | Reason |
|------|--------|
| `.env`, `.env.local`, `**/.env` | Secrets |
| `**/credentials.json`, `**/*secret*` | Secrets |
| `docs/PRD.md` | Product contract — human approval only |
| `AGENTS.md`, `CLAUDE.md`, `SKILLS.md` | Governance — human approval only |
| `docs/adrs/*` | Architecture decisions — human approval only |
| `docs/workflows/*` | Process contract — human approval only |
| `.github/workflows/*` | CI — human approval only |
| `node_modules/`, `dist/`, `build/` | Generated artifacts |

Agents **may** read `.env.example` and must keep placeholders only—never real keys.

---

## Security Anti-Patterns (Forbidden)

- Hardcoded API keys or tokens
- No direct frontend calls to external Gemini or Trello APIs. The frontend calls backend REST endpoints only (e.g. `POST /api/study-materials/:materialId/generate` with body `{}` for generate today; future `POST /api/trello/sync`). Gemini runs in document-service only; `/process` is internal.
- Supabase **service role** key in frontend
- Admin routes without `role === 'admin'` check
- Resource access without `user_id = req.user.id`
- Saving or returning unvalidated Gemini JSON
- Logging Trello `apiKey`, `token`, or full study text prompts
- Trello credentials in URL query parameters
- Real Gemini/Trello calls in automated tests
- Committing `.env` or secrets
- Bypassing Supervisor or Security review gates for "speed"

---

## Implementation Rules

1. **Modular monolith:** Backend modules under `backend/src/modules/` — no separate deployable services except `document-service`.
2. **Gemini:** Only `document-service` calls Gemini (`GEMINI_API_KEY` there only); backend uses `DOCUMENT_SERVICE_URL` and `POST /process`; frontend calls `POST /api/study-materials/:materialId/generate` (empty body `{}`) and load/clear via `GET`/`DELETE` `.../generated-plan` — **one latest plan per material** persisted after backend validation (no client `plan` POST).
3. **Zod:** Validate env, request bodies, and Gemini output per ADR 003.
4. **API format:** `{ success, data|error, meta }` per PRD Section 8.5.
5. **Ownership:** Every query filters by authenticated user; admin is explicit exception for logs/stats.
6. **Trello:** Credentials in POST body only; never persist; clear from frontend state after sync.
7. **Dashboard:** Manual refetch after mutations—no polling/WebSockets.
8. **Tests:** Mock external APIs; no live Gemini/Trello in CI.
9. **Lint:** Run `npm run lint` in `backend/`, `document-service/`, and `frontend/` before claiming work complete. CI runs the same commands after `npm ci`. Use `npm run lint:fix` only for mechanical fixes you review; do not add new ESLint plugins or change rule severity without human approval.

---

## Definition of Done

A feature or phase item is **done** only when **all** apply:

- [ ] Matches approved phase scope and `docs/IMPLEMENTATION_STATUS.md` (no scope creep)
- [ ] Complies with applicable ADRs (gate documented)
- [ ] Does not violate this file or `CLAUDE.md`
- [ ] Code + tests implemented; required PRD tests covered
- [ ] Lint passes locally in each package: `cd backend && npm run lint`, `cd document-service && npm run lint`, `cd frontend && npm run lint`
- [ ] No secrets in diff; `.env` not committed
- [ ] Supervisor diff review completed (no blocking issues)
- [ ] Security review completed if auth, Trello, Gemini, admin, or env touched
- [ ] Human gave final judgment on the change
- [ ] CI green on PR
- [ ] `docs/AGENT_MEMORY.md` updated if behavior, APIs, or conventions changed

---

## Workflows (Use These — Do Not Improvise)

| Workflow | When to use |
|----------|-------------|
| `docs/workflows/phase-1a-scaffold-workflow.md` | Shells + health only (first code step) |
| `docs/workflows/phase-1-foundation-workflow.md` | Auth, courses (skip scaffold Step 2 if 1A done) |
| `docs/workflows/document-processing-workflow.md` | Gemini microservice + generation |
| `docs/workflows/trello-sync-workflow.md` | Trello integration |
| `docs/workflows/security-review-workflow.md` | Before merging security-sensitive PRs |
| `docs/workflows/conflict-resolution-workflow.md` | Merge conflicts, contradictory guidance |

---

## Repository Layout (Target)

```
frontend/          # React + Vite
backend/           # Express modular monolith
document-service/  # Gemini + Zod validation
docs/              # PRD, ADRs, workflows, AGENT_MEMORY
```

Do not scaffold application code until the assigned workflow step and human approval (if required) are satisfied.

---

## Quick References

- **Skills index:** `SKILLS.md`
- **Claude-specific rules:** `CLAUDE.md`
- **Built state:** `docs/IMPLEMENTATION_STATUS.md`
- **Session memory:** `docs/AGENT_MEMORY.md`
- **UI/UX guidance (UI phases only):** `DESIGN.md`
- **Supervisor prompt:** `.claude/agents/supervisor-agent.md`
- **Security prompt:** `.claude/agents/security-review-agent.md`
