# ADR 004: No Manual Trello Credential Persistence (MVP)

**Status:** Accepted — **partially superseded for encrypted user Trello tokens** by [ADR 006](006-trello-oauth-encrypted-connections.md) and **Trello OAuth A2–A6** (connect, stored-token sync, board/list defaults). **Manual apiKey/token flow below remains live as disconnected fallback only.**

**Date:** 2026-05-20  
**Deciders:** Project team (MVP)

---

## Context

Trello integration requires API key and token. Persisting **manual** credentials introduces encryption key management, breach risk, and GDPR-adjacent concerns—out of initial MVP scope per PRD.

Post-MVP, **encrypted user Trello tokens** in `trello_connections` (ADR 006, phases A2–A6) supersede this ADR for **connected-account** mode only. **Manual** apiKey/token remains ephemeral per this ADR when the user is **disconnected**.

---

## Decision (historical — manual MVP)

For the original manual MVP, **Trello API key and token are never stored** in:

- Database
- Server session store
- Logs
- API responses

**Flow (disconnected fallback — still live today):**

1. User expands **Advanced manual credentials** and enters apiKey/token + selects board/list
2. Frontend sends `POST /api/trello/boards`, `/lists`, `/sync` with `{ apiKey, token, ... }` in **body**
3. Backend uses credentials for immediate Trello API calls
4. Backend writes `trello_sync_logs` **without** credentials
5. Credentials discarded after request; frontend clears credential state after sync

When **connected**, stored encrypted user token mode (ADR 006) is primary — frontend sends `{}` / `{ listId, taskIds }` only.

---

## Consequences

**Positive:**

- No encryption infrastructure required for manual-only MVP
- Reduced leak surface from DB dumps for manual credentials

**Negative (manual mode only):**

- User re-enters manual credentials each disconnected sync session
- UX warning required when using manual fallback

---

## Compliance Rules for Agents

- **`trello_connections` IS used in production** for OAuth connect, stored-token boards/lists/sync (**A5A**), and board/list defaults (**A6**). See ADR 006.
- **Manual apiKey/token:** Never store in DB, browser storage, logs, or API responses. Disconnected fallback only (**A5C** blocks manual credentials when connected).
- **Encrypted user tokens (ADR 006):** Stored at rest in `trello_connections` only; never log, never return plaintext/decrypted token to frontend.
- Never log manual `apiKey` or `token`.
- Manual credentials **only** in POST body when disconnected—never query params (see PRD 10.5).

---

## References

- PRD Section 7.6, 10.5
- ADR 005 (List ID handling — board/list picker is live)
- ADR 006 (encrypted connection storage — OAuth A2–A6)
