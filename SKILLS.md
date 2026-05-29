# SKILLS.md — StudyOps AI

Index of **when** to apply specialized agent behavior. Skills are not separate npm packages—they are role definitions and workflows in this repo.

---

## How to Use This File

1. Identify the task type below.
2. Open the linked workflow or agent definition.
3. Follow steps in order; do not skip human approval or review gates.

---

## Skill Map

| Task | Skill / Workflow | Agent Definition |
|------|------------------|------------------|
| Start new phase or feature | Phase planning | `.claude/agents/orchestrator.md` + matching `docs/workflows/*.md` |
| Scaffold auth, courses, env | Phase 1 Foundation | `docs/workflows/phase-1-foundation-workflow.md` |
| Gemini + study plan generation | Document Processing | `docs/workflows/document-processing-workflow.md` |
| Trello card sync | Trello Sync | `docs/workflows/trello-sync-workflow.md` |
| Write or fix tests | Testing | `.claude/agents/testing-agent.md` |
| Review PR diff | Supervisor Review | `.claude/agents/supervisor-agent.md` |
| Auth, admin, Trello, Gemini, env | Security Review | `docs/workflows/security-review-workflow.md` + `.claude/agents/security-review-agent.md` |
| Update memory after merge | Documentation | `.claude/agents/documentation-agent.md` |
| PRD vs ADR vs memory conflict | Conflict Resolution | `docs/workflows/conflict-resolution-workflow.md` |
| Architecture decision context | ADR Gate | `docs/adrs/001`–`005` + AGENTS.md |

---

## ADR Understanding Gate (Required Skill)

Before coding:

```
1. List applicable ADRs (001–005).
2. One sentence each: how this task complies.
3. If none apply, state why (rare).
```

---

## PRD-Aligned Skills (MVP)

### Authentication & Courses

- Register: role fixed to `student` (not selectable).
- Protected routes: JWT validation; 401/403 per permissions matrix.
- Course title: 3–100 characters.

### Study Plan Generation

- Paste text only (no PDF in MVP).
- Call document-service per ADR 002; validate with `GeminiOutputSchema` (PRD Section 8).
- Never save unvalidated AI output.

### Tasks & Flashcards

- Editable: title, description, priority, estimated minutes.
- Read-only: difficulty, tags (AI-generated).

### Trello

- Manual API key, token; **board/list picker** via **`POST /api/trello/boards`** and **`POST /api/trello/boards/:boardId/lists`**; sync via **`POST /api/trello/sync`**; POST body only; no persistence (ADR 004, 005).
- Partial success per task in response (`success` \| `failed` \| `skipped`).

### Focus & Dashboard

- Pomodoro 25/5; save session; optional task complete.
- Dashboard: fetch on mount + manual refetch (no polling).

### Admin

- **`requireAuth` + `requireAdmin`** on all `/api/admin/*`; **`requireAdmin`** checks **`profiles.role`** from DB — not frontend role.
- **`GET /api/admin/stats`** and frontend **`/admin`** UI **implemented** (aggregate counts only).
- **`GET /api/admin/logs`**, user management, role management — **deferred**.
- Logs never expose secrets.

---

## Testing Skill Summary

- **Mock** Gemini and Trello in all automated tests.
- Required coverage per PRD Section 11 (auth, zod, trello payload, dashboard math).
- Testing Agent does **not** change production code—see testing-agent.md.

---

## Security Skill Summary

Forbidden: see AGENTS.md Security Anti-Patterns.

Run security workflow when touching: auth middleware, admin routes, Trello handler, Gemini client, env validation, logging.

---

## Definition of Done

Every skill execution ends with AGENTS.md DoD checklist. CI failure = not done.

---

## External Tools (Optional, Human-Driven)

PRD mentions NotebookLM, Stitch, Copilot—these do not replace repo workflows. Generated design assets are advisory until human approves.

---

## No Dynamic Delegation

Orchestrator assigns **named workflow steps**. Subagents do not spawn further subagents autonomously.
