# Workflow: Conflict Resolution

**Owner:** Orchestrator (facilitates); Human (decides)  
**Trigger:** Contradictory instructions, merge conflicts, or failed review disagreement

---

## Triggers

Use this workflow when:

- PRD vs ADR vs workflow vs AGENT_MEMORY disagree
- Supervisor blocks but Implementation believes PRD requires the change
- Security Review blocks for a pattern Implementation claims is necessary
- Git merge conflicts across `frontend/`, `backend/`, `document-service`
- Two agents produced incompatible guidance

**Do not** resolve by guessing or expanding MVP scope.

---

## Steps (Execute in Order)

### 1. Stop implementation

- [ ] Halt coding until resolution
- [ ] Post: `⚠️ CONFLICT: [one-line description]`

### 2. Document the conflict

```markdown
## Conflict Report

**Sources:**
- A: [file/section] says ...
- B: [file/section] says ...

**Task context:** [what agent was doing]

**Impact:** [what breaks if wrong choice]

**ADR refs:** [if any]
```

### 3. Apply precedence (default)

Unless human overrides:

| Priority | Source |
|----------|--------|
| 1 | Human explicit instruction in current session |
| 2 | `docs/PRD.md` (product behavior) |
| 3 | `docs/adrs/*.md` (architecture) |
| 4 | `docs/workflows/*.md` (process) |
| 5 | `AGENTS.md` / `CLAUDE.md` |
| 6 | `docs/AGENT_MEMORY.md` (historical—may be stale) |

### 4. Propose resolution options

Offer **2–3 options**, each with:

- What to change
- Whether ADR/PRD amendment needed
- MVP scope impact (none / requires approval)

### 5. Human decision

- [ ] Wait for explicit human choice
- [ ] If PRD/ADR must change → **APPROVAL REQUIRED** per AGENTS.md

### 6. Git merge conflicts (technical)

- [ ] Pull latest base branch
- [ ] Resolve conflicts preserving both PRD behavior and reviewed security patterns
- [ ] Re-run tests and lint
- [ ] Re-run Supervisor on resolved diff
- [ ] Re-run Security Review if conflict touched auth/secrets

### 7. Record outcome

- [ ] Documentation Agent appends AGENT_MEMORY with resolution and date
- [ ] If ADR changed, update ADR status section

---

## Forbidden Resolutions

- Silently expanding MVP scope to "make it work"
- Ignoring Security critical findings
- Overwriting PRD without human approval
- Force-push without explicit human request

---

## Definition of Done

- [ ] Conflict report written
- [ ] Human decision recorded
- [ ] Implementation resumed only after decision
- [ ] AGENT_MEMORY updated if precedent set
