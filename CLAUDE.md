# CLAUDE.md — StudyOps AI

Instructions for Claude (and Claude Code) in this repository. **AGENTS.md** and **docs/PRD.md** take precedence on conflicts.

---

## Session Start Checklist

1. Read `docs/PRD.md` sections relevant to the task.
2. Read `AGENTS.md` (approval rules, off-limits, DoD).
3. Complete **ADR Understanding Gate** (cite ADRs 001–005 that apply).
4. Open the **explicit workflow** for the phase—do not self-delegate to sub-agents dynamically.
5. Check `docs/AGENT_MEMORY.md` for prior decisions and pitfalls.
6. Read `DESIGN.md` only when implementing an **approved frontend UI** phase—not for backend, DB, or security work.

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
- React Router v6 routes per PRD Section 6.5.
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
| Generation | `POST /api/courses/:courseId/generate` with `studyText` 100–50,000 chars |

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
- Never call the Gemini API directly from frontend code. Frontend must use backend endpoints such as `POST /api/courses/:id/generate`, which internally call the document-service.
- Never persist Trello credentials.
- Never skip Zod validation before saving Gemini output.

---

## Agent File Pointers

| File | Purpose |
|------|---------|
| `.claude/agents/orchestrator.md` | Workflow selection, approvals |
| `.claude/agents/testing-agent.md` | Test-only boundaries |
| `.claude/agents/supervisor-agent.md` | Diff review prompt |
| `.claude/agents/security-review-agent.md` | Security audit prompt |
| `.claude/agents/documentation-agent.md` | Memory and doc updates |

---

## Definition of Done

See AGENTS.md. Claude must not mark work complete without tests, reviews (when required), and CI consideration.

---

## Conflicts

If PRD, ADR, workflow, and memory disagree:

1. PRD wins for product behavior.
2. ADR wins for architecture.
3. Ask human if still ambiguous—use `docs/workflows/conflict-resolution-workflow.md`.
