---
name: Security review request
about: Request a security review for a sensitive change (no secrets in the issue)
title: "[Security]: "
labels: security
---

## What needs review

<!-- PR link, branch name, or diff summary -->

## Change type

- [ ] Auth / session / JWT
- [ ] Supabase / RLS / migrations
- [ ] Courses or user-owned data (`user_id` filtering)
- [ ] Admin routes
- [ ] Trello / external API integration
- [ ] Gemini / document-service
- [ ] Env / CI / GitHub Actions
- [ ] Frontend security (XSS, tokens, API usage)
- [ ] Other:

## Scope of diff

<!-- Files or modules; confirm no unrelated scope creep -->

## Security concerns to focus on

<!-- e.g. IDOR, credential storage, service role exposure, logging -->

## Tests

- [ ] Unit/integration tests updated or N/A
- [ ] No live Supabase / Gemini / Trello in automated tests
- [ ] CI green (if applicable)

## Context docs

- `AGENTS.md` — security anti-patterns  
- `docs/PRD.md` — permissions / API contract  
- `docs/AGENT_MEMORY.md` — phase security notes  
- `DESIGN.md` — UI phases only (not a substitute for security review)

## Checklist (reporter)

- [ ] **No secrets**, tokens, or `.env` contents in this issue
- [ ] **No** `SUPABASE_SERVICE_ROLE_KEY` in frontend
- [ ] Supervisor review status (if applicable):

## Desired outcome

- [ ] Security Review Agent pass before merge
- [ ] Notes only (non-blocking)
