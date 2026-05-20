# Workflow: Security Review

**Owner:** Security Review Agent  
**Trigger:** Before merging any PR that touches security-sensitive areas  
**Definition:** `.claude/agents/security-review-agent.md`

---

## When This Workflow Is Mandatory

- Authentication or JWT middleware
- Supabase config or RLS/schema
- Admin routes or role checks
- Trello handlers or logging
- Gemini / document-service
- Environment variable handling
- CI secret scanning config
- Logger / api_logs changes

Skip only for purely cosmetic UI with no data access (Supervisor still required).

---

## Steps (Execute in Order)

### 1. Gather context

- [ ] PR description lists ADRs and scope
- [ ] Read diff: `backend/`, `document-service/`, `frontend/` (as applicable)
- [ ] Confirm no `.env` in diff

### 2. Run Security Review prompt

Use the full prompt in `.claude/agents/security-review-agent.md`.

Output required sections:

1. **Summary** (pass / pass with notes / block)
2. **Findings** (severity: critical, high, medium, low)
3. **Anti-pattern check** (AGENTS.md list)
4. **Recommendation** (merge / fix required)

### 3. Block merge if any critical/high

| Severity | Action |
|----------|--------|
| Critical | Block — fix before merge |
| High | Block unless human explicitly accepts risk |
| Medium | Document in PR; fix or ticket |
| Low | Optional follow-up |

### 4. Human judgment

- [ ] Human reads Security Review output
- [ ] Human approves merge or requests fixes

### 5. Documentation

- [ ] If new security convention: append AGENT_MEMORY (no secrets)

---

## Security Anti-Patterns Checklist

Verify **none** appear in diff:

- [ ] Hardcoded API keys
- [ ] No direct frontend calls to external Gemini or Trello APIs. The frontend may call the backend endpoints such as `POST /api/trello/sync`, but external API calls must go through the backend or document-service.
- [ ] Service role key in frontend
- [ ] Admin route without role check
- [ ] Missing `user_id` ownership filter
- [ ] Unvalidated Gemini JSON saved
- [ ] Live external APIs in tests
- [ ] Logging credentials or full prompts
- [ ] Trello credentials in query params
- [ ] Bypassing review gates

---

## Definition of Done (Security)

- [ ] Security Review prompt completed
- [ ] No open critical/high findings
- [ ] Human acknowledged review

---

## Escalation

If Security and Supervisor disagree, use `docs/workflows/conflict-resolution-workflow.md`.
