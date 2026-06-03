# ADR 004: No Trello Credential Persistence (MVP)

**Status:** Accepted — **partially superseded for user tokens** by [ADR 006](006-trello-oauth-encrypted-connections.md) when OAuth connect ships (A3+). **Manual MVP flow below remains live today** — users still enter apiKey/token per sync; nothing is read from `trello_connections` in production routes yet.

**Date:** 2026-05-20  
**Deciders:** Project team (MVP)

---

## Context

Trello integration requires API key and token. Persisting credentials introduces encryption key management, breach risk, and GDPR-adjacent concerns—out of MVP scope per PRD.

---

## Decision

For MVP, **Trello API key and token are never stored** in:

- Database
- Server session store
- Logs
- API responses

**Flow:**

1. User enters credentials + List ID in frontend form
2. Frontend sends `POST /api/trello/sync` with `{ apiKey, token, listId, taskIds }` in **body**
3. Backend uses credentials for immediate Trello API calls
4. Backend writes `trello_sync_logs` **without** credentials
5. Credentials discarded after request; frontend clears credential state after sync

Optional `POST /api/trello/boards` uses same ephemeral pattern.

---

## Consequences

**Positive:**

- No encryption infrastructure for MVP
- Reduced leak surface from DB dumps

**Negative:**

- User re-enters credentials each sync session
- UX warning required: "Credentials are not saved"

---

## Compliance Rules for Agents

- **Today:** No **use** of `trello_connections` in live sync/boards/lists routes — manual body credentials only.
- **Foundation (A2):** `trello_connections` exists for **future OAuth** — see ADR 006; do not wire stored tokens without an approved connect phase + Security Review.
- Never log `apiKey` or `token` (manual or OAuth).
- Never return credentials in GET responses.
- Credentials **only** in POST body for manual MVP—never query params (see PRD 10.5).

---

## References

- PRD Section 7.6, 10.5
- ADR 005 (List ID handling)
- ADR 006 (encrypted connection storage — OAuth foundation)
