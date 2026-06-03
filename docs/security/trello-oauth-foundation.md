# Trello OAuth foundation — security notes (A2)

**Phase:** TRELLO-OAUTH-A2-DB (storage/crypto foundation)  
**Status:** Implemented in repo; **OAuth is not live** — manual key/token sync on `/trello` is unchanged.

---

## What is shipped (A2)

- Migration `012_trello_connections.sql` — encrypted token columns; **service_role** only
- Backend: `trello-token-crypto.js` (AES-256-GCM), `trello-connection.repository.js`
- Optional env placeholders: `TRELLO_API_KEY`, `TRELLO_TOKEN_ENCRYPTION_KEY` in `backend/.env.example`

## What is not shipped

- OAuth authorize/callback, connect/disconnect routes, Connect Trello UI
- Any use of stored tokens in boards/lists/sync HTTP handlers

---

## Tier-1 secrets

| Secret | Location | Notes |
|--------|----------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Backend only | Required for `trello_connections` access |
| `TRELLO_TOKEN_ENCRYPTION_KEY` | Backend only | 32-byte random value, base64-encoded; generate locally — never commit |
| `TRELLO_API_KEY` | Backend only | Trello app key (public per Trello docs); not per-user |

Never put these in frontend `VITE_*`, issues, PRs, or logs.

---

## Trello user tokens

- Treat as **secrets** — same sensitivity as passwords for Trello account access
- **Must not** appear in logs, API responses, frontend state persistence, or Supabase Data API for browsers
- **Encrypted at rest** with `TRELLO_TOKEN_ENCRYPTION_KEY` before insert; decrypt only in backend process when calling Trello (future phases)
- Repository **metadata** queries exclude ciphertext columns; decrypt helpers are backend-internal only

---

## `trello_connections` access model

- RLS enabled; **no** policies for `authenticated` / `anon`
- Grants: **`service_role`** only (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
- Application must filter by `user_id` from JWT on every operation (service role bypasses RLS)

Frontend must use **sanitized backend APIs** (future) for connection status — never PostgREST on this table.

---

## Manual MVP (still live)

- User enters apiKey + token on `/trello`; sent in POST body to `/api/trello/boards`, `/lists`, `/sync`
- Credentials cleared from React state after sync; **not** stored in DB, localStorage, or sessionStorage
- See ADR 004 for ephemeral manual flow; ADR 006 for stored-token path when connect ships

---

## Security Review

Required before merge when implementing:

- OAuth callback and state validation
- Connect / complete / disconnect routes
- Any API that returns connection status to the frontend
- Refactoring sync/boards/lists to use stored tokens

See `SECURITY.md` and `AGENTS.md`.
