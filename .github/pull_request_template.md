## Summary

<!-- What changed and why (1–3 sentences) -->

## Scope

<!-- Phase/workflow this PR belongs to (e.g. Phase 1G Courses UI). Confirm no out-of-scope work. -->

- [ ] Matches approved phase / human gate (e.g. `approved — …`)
- [ ] No scope creep (no Gemini, Trello, tasks, flashcards, admin, dashboard stats, etc. unless explicitly in scope)

## Changed files

<!-- List main paths or areas touched -->

## Tests run

<!-- Commands and results -->

- [ ] `cd backend && npm test`
- [ ] `cd document-service && npm test`
- [ ] `cd frontend && npm test`
- [ ] `cd frontend && npm run build` (if frontend touched)
- [ ] GitHub Actions CI green (if pushed)

## Screenshots (if UI)

<!-- Add screenshots for UI changes, or N/A -->

## Database / migration changes

- [ ] **No** schema or migration changes
- [ ] **Yes** — link migration file and note human approval to apply

## Context docs (check when relevant)

- [ ] `docs/PRD.md` (product scope / APIs)
- [ ] `AGENTS.md` / `CLAUDE.md` (agent rules, approvals)
- [ ] `docs/AGENT_MEMORY.md` (prior decisions)
- [ ] `DESIGN.md` — **only** for approved frontend UI phases (not backend/CI)

## Security checklist

- [ ] No secrets, API keys, or real credentials in the diff
- [ ] No `.env` or credential files committed
- [ ] No Supabase **service role** in frontend
- [ ] Service-role backend queries filter by `user_id = req.user.id` (no unfiltered `courses` / user data access)
- [ ] No scope creep via UI/docs that bypasses PRD

## Review checklist

- [ ] **Supervisor Review** needed? (most implementation PRs: yes)
- [ ] **Security Review** needed? (auth, env, Supabase, admin, Trello, Gemini, CI secrets, courses ownership)
- [ ] **Human approval gate** satisfied before implementation (cite phrase if applicable)

## Notes for reviewers

<!-- Optional: ADRs touched, follow-ups, known limitations -->
