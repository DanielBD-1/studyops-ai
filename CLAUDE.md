# CLAUDE.md — StudyOps AI

Instructions for Claude (and Claude Code) in this repository. **AGENTS.md** and **docs/PRD.md** take precedence on conflicts.

---

## Session Start Checklist

1. Read `docs/IMPLEMENTATION_STATUS.md` — what is built vs deferred (especially APIs and generate route).
2. Read `docs/AGENT_MEMORY.md` for phase history and pitfalls.
3. Read `docs/PRD.md` sections relevant to the task (future MVP scope).
4. Read `AGENTS.md` (roles, approval phrases, off-limits, DoD).
5. Complete **ADR Understanding Gate** (cite ADRs 001–005 that apply).
6. Open the **explicit workflow** for the phase—do not self-delegate dynamically.
7. Read `DESIGN.md` only for **approved frontend UI** work—not for backend, DB, security, or docs-only phases.
8. **Code phases:** run `npm run lint` and `npm test` in each touched package; `npm run build` in `frontend/` if frontend changed. **Docs-only phases:** no lint/test unless non-doc files change.

---

## DESIGN.md (UI phases only)

`DESIGN.md` is guidance for **approved UI phases only**. It does **not** override PRD, `AGENTS.md`, ADRs, or workflow scope. Do not perform full styling passes or add scope without explicit human approval (`approved — apply DESIGN styling pass` for polish; separate approval for new features).

---

## Behavioral Rules

- **MVP only:** Do not add PDF upload, OAuth, payments, polling, Redux, or credential storage unless the human explicitly expands scope.
- **No packages without approval:** Do not run `npm install` or add dependencies without human approval (see AGENTS.md).
- **No app scaffolding unless tasked:** Context layer exists first; implementation follows approved workflows.
- **Prefer small diffs:** One workflow step per PR when possible.
- **Ask before governance edits:** PRD, ADRs, workflows, AGENTS.md, CLAUDE.md, SKILLS.md.

---

## Architecture Reminders

```
React (frontend)
    → Express backend (modules: auth, courses, tasks, flashcards, trello, focus, dashboard, admin)
    → document-service (POST /process → Gemini)
    → Supabase (auth + Postgres)
```

- JWT from Supabase; middleware order: CORS → JSON → auth → routes → error handler.
- React Router v6 — implemented routes in `docs/IMPLEMENTATION_STATUS.md` (not all PRD routes exist yet).
- State: `useState`/`useEffect` + Context (auth, dashboard refetch)—no Redux.

---

## Code Conventions (When Implementing)

| Area | Convention |
|------|------------|
| Validation | Zod in `backend` and `document-service`; mirror limits in frontend forms |
| Responses | `success` / `data` / `error` / `meta` envelope |
| Errors | Use PRD error codes (`AUTH_REQUIRED`, `GEMINI_INVALID_RESPONSE`, etc.) |
| Logging | Redact prompts, credentials, and PII in api_logs |
| Trello sync | `POST /api/trello/sync` body: `{ apiKey, token, listId, taskIds }` |
| Generation (implemented) | `POST /api/study-materials/:materialId/generate` with body `{}`; backend loads saved owned `content`; ephemeral `plan` in UI — no DB persistence |
| Generation (PRD deferred) | `POST /api/courses/:courseId/generate` with client `studyText` — not implemented |

---

## Human Approval (Claude Must Stop)

Same as AGENTS.md: new packages, schema changes, auth changes, CI edits, destructive git, governance doc edits.

Use:

```
⚠️ APPROVAL REQUIRED: [action]
```

---

## Off-Limits (Claude)

- Never read or output real `.env` contents.
- Never commit secrets or suggest committing `.env`.
- Never call Gemini or document-service from frontend code. Frontend uses backend only (e.g. `POST /api/study-materials/:materialId/generate`).
- Never put `GEMINI_API_KEY` or service role in frontend env.
- Never persist Trello credentials.
- Do not persist Gemini `plan` to the database without an approved persistence phase and Security Review.
- Never skip Zod validation before **future** saving of Gemini output (not persisted today).

---

## Agent roles and approvals

Same as `AGENTS.md`: Orchestrator, **Planning Agent** (`approved — begin Phase X planning only`), Implementation Agent, Testing Agent, **Supervisor Review Agent** (Process Supervisor), Security Review Agent, Documentation Agent (`approved — Phase X complete`), Design Agent later.

## Agent File Pointers

| File | Purpose |
|------|---------|
| `docs/IMPLEMENTATION_STATUS.md` | Built routes, APIs, env, deferred work |
| `.claude/agents/orchestrator.md` | Workflow selection, approvals |
| `.claude/agents/testing-agent.md` | Test-only boundaries |
| `.claude/agents/supervisor-agent.md` | Diff review prompt |
| `.claude/agents/security-review-agent.md` | Security audit prompt |
| `.claude/agents/documentation-agent.md` | Memory and doc updates |

---

## Definition of Done

See AGENTS.md. Claude must not mark work complete without **lint**, **tests**, reviews (when required), and CI consideration. Minimum checks when code changed: `npm run lint` and `npm test` in each touched package; `npm run build` in `frontend/` if frontend code changed.

---

## Conflicts

If PRD, ADR, workflow, and memory disagree:

1. `docs/IMPLEMENTATION_STATUS.md` wins for **what is built today**.
2. PRD wins for **target MVP product behavior** (including future scope).
3. ADR wins for architecture.
4. `docs/AGENT_MEMORY.md` wins for phase decisions and approved refinements.
5. Ask human if still ambiguous—use `docs/workflows/conflict-resolution-workflow.md`.
