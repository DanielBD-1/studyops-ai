# Workflow: Trello Sync

**Owner:** Orchestrator  
**Prerequisite:** Phase 3 tasks exist (task list + DB)  
**ADR gate:** 004, 005 (mandatory). **OAuth account connect:** ADR 006 + **A3** + **A4-STATE** + **A4-FRONTEND** (Connect/Disconnect + callback on **`/trello`**) — **separate** from this manual sync workflow. **Backend stored-token mode:** **A5A** shipped on **`POST /api/trello/boards`**, **`/lists`**, **`/sync`** when body omits `apiKey`/`token` keys. **Frontend stored-token sync:** **A5B** — **not** shipped; **not** this workflow.

**Current live UI sync path:** Manual apiKey/token in POST body (ADR 004) — **unchanged on `/trello`**. Phases **A2–A4-FRONTEND** added encrypted storage, backend connect routes, signed state, and account connection UI. **A5A** added backend stored-token support; **A5B** is required before the frontend switches to connected-account sync.

---

## Goal

Implement `POST /api/trello/sync`, optional `POST /api/trello/boards`, frontend Trello page, sync logs, partial success handling—per PRD 7.6 and 10.5.

---

## Human Approval Checkpoints

| Step | Requires approval? |
|------|-------------------|
| Start workflow | Yes |
| New npm packages (HTTP client if not present) | Yes |
| `trello_sync_logs` table | Yes |
| Optional boards endpoint | Human decides if in MVP timebox |

---

## Steps (Execute in Order)

### 1. Orchestrator — Plan

- [ ] ADR 004: no credential persistence
- [ ] ADR 005: manual List ID required
- [ ] Confirm UI warning copy with human

### 2. Implementation Agent — Backend

- [ ] `trello.service.js` — create card: `name`, `desc` (+ tags), `idList`
- [ ] `POST /api/trello/sync` — body `{ apiKey, token, listId, taskIds }`
- [ ] Validate credential **format** before external call (not stored)
- [ ] Per-task results: `{ taskId, success, trelloCardId?, error? }`
- [ ] Log to `trello_sync_logs` without credentials
- [ ] Ownership check on every taskId
- [ ] Handle 401, 429, 500, timeout, partial failure
- [ ] Optional: `POST /api/trello/boards` — credentials in body only

### 3. Implementation Agent — Frontend

- [ ] `/trello` — TrelloSyncForm
- [ ] Required fields: API key, token, List ID
- [ ] Checkbox task selection; select all
- [ ] Clear credentials from state after sync
- [ ] Display success count and per-task errors
- [ ] Disable sync until all required fields filled

### 4. Testing Agent

- [ ] Correct Trello payload from task
- [ ] Mocked success/failure per task
- [ ] Partial success (2 ok, 1 fail)
- [ ] **No real Trello API in tests**
- [ ] Assert logs contain no apiKey/token

### 5. Supervisor Agent — Diff review

### 6. Security Review Agent

**Mandatory** for this workflow.

### 7. Human — Final judgment

- [ ] Sync with test Trello board (manual credentials)

### 8. Documentation Agent

- [ ] AGENT_MEMORY: sync endpoint contract, log fields

---

## Definition of Done

- [ ] Credentials never in DB or logs
- [ ] List ID required in MVP UI
- [ ] PRD error UX for auth, rate limit, invalid list
- [ ] Dashboard `trelloSyncedTasks` updates via refetch after sync

---

## Forbidden

- Storing **manual** apiKey/token in DB or browser storage (ADR 004 — live)
- Using `trello_connections` in sync/boards handlers without an approved OAuth connect phase (ADR 006 foundation is separate)
- GET endpoints with credentials in query string
- Deleting Trello cards (out of scope)
- Mass/background sync
