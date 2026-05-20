# AGENTS.md — StudyOps AI

**Authority:** `docs/PRD.md` is the product source of truth. This file governs how AI coding agents work in this repository.

---

## Project Summary

StudyOps AI helps students turn pasted study text into summaries, tasks, flashcards, Trello cards, focus sessions, and dashboard analytics.

**Architecture (MVP):** React frontend → Express modular monolith → HTTP → Document Processing microservice → Gemini API. Supabase Auth + PostgreSQL.

**Read first:** `docs/PRD.md`, relevant `docs/adrs/*.md`, and the workflow file for your current phase.

---

## Agent Roles (Explicit Only)

Do **not** invent autonomous multi-agent delegation. Follow the workflow named in your task.

| Role | Definition |
|------|------------|
| **Orchestrator** | Selects workflow, lists steps, requests human approval before implementation. See `.claude/agents/orchestrator.md` |
| **Implementation Agent** | Writes application code per approved workflow and PRD |
| **Testing Agent** | Writes/updates tests only; see `.claude/agents/testing-agent.md` |
| **Supervisor Agent** | Reviews diffs before merge; see `.claude/agents/supervisor-agent.md` |
| **Security Review Agent** | Reviews security-sensitive changes; see `.claude/agents/security-review-agent.md` |
| **Documentation Agent** | Updates docs/memory after approved changes; see `.claude/agents/documentation-agent.md` |

**Standard pipeline:**

```
Human goal
→ Orchestrator picks workflow (human approves)
→ Implementation Agent (code)
→ Testing Agent (tests)
→ Pre-commit: lint / tests / secrets
→ Supervisor Agent (diff review)
→ Security Review Agent (if security-relevant)
→ Human final judgment
→ CI (GitHub Actions)
→ Documentation Agent updates AGENT_MEMORY if needed
```

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
- No direct frontend calls to external Gemini or Trello APIs. The frontend may call backend endpoints such as `POST /api/courses/:id/generate` and `POST /api/trello/sync`, but external API calls must go through the backend or document-service.
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
2. **Gemini:** Only `document-service` calls Gemini; main backend calls `POST /process` on document-service.
3. **Zod:** Validate env, request bodies, and Gemini output per ADR 003.
4. **API format:** `{ success, data|error, meta }` per PRD Section 8.5.
5. **Ownership:** Every query filters by authenticated user; admin is explicit exception for logs/stats.
6. **Trello:** Credentials in POST body only; never persist; clear from frontend state after sync.
7. **Dashboard:** Manual refetch after mutations—no polling/WebSockets.
8. **Tests:** Mock external APIs; no live Gemini/Trello in CI.

---

## Definition of Done

A feature or phase item is **done** only when **all** apply:

- [ ] Matches PRD MVP scope (no scope creep)
- [ ] Complies with applicable ADRs (gate documented)
- [ ] Does not violate this file or `CLAUDE.md`
- [ ] Code + tests implemented; required PRD tests covered
- [ ] Lint passes locally
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
- **Session memory:** `docs/AGENT_MEMORY.md`
- **Supervisor prompt:** `.claude/agents/supervisor-agent.md`
- **Security prompt:** `.claude/agents/security-review-agent.md`
