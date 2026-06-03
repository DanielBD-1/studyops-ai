# Trello OAuth foundation — security notes (A2 + A3)

**Phases:** TRELLO-OAUTH-A2-DB (storage/crypto foundation); TRELLO-OAUTH-A3 (backend connect/authorize routes)
**Status:** **A2 + A3 implemented in repo**; **OAuth is not live for users** — manual key/token sync on `/trello` is unchanged.

---

## What is shipped (A2)

- Migration `012_trello_connections.sql` — encrypted token columns; **service_role** only
- Backend: `trello-token-crypto.js` (AES-256-GCM), `trello-connection.repository.js`
- Optional env placeholders: `TRELLO_API_KEY`, `TRELLO_TOKEN_ENCRYPTION_KEY` in `backend/.env.example`

## What is shipped (A3 — backend only)

- **`GET /api/trello/connection`** — sanitized connection status (metadata only; no token/ciphertext)
- **`GET /api/trello/authorize-url`** — Trello authorize URL for implicit grant (fragment callback)
- **`POST /api/trello/connect/complete`** — body `{ token }`; validates via Trello; encrypts before DB write
- **`POST /api/trello/disconnect`** — body `{}`; best-effort revoke; hard-deletes local row
- All four routes: **`requireAuth`**; user scope via `req.user.id` only
- Connected response contract (flat): `{ connected: true, trelloMemberId, trelloUsername, scopes, expirationPolicy, expiresAt, defaultBoardId, defaultListId, connectedAt, updatedAt }`
- **Reviews:** Supervisor **Pass with notes**; Security **Security approved with notes** — no blocking issues

## What is not shipped

- Frontend Connect Trello UI, Connect button, or `/trello/connect/callback` route
- OAuth **state/nonce** validation and fragment callback handling (**A4** — separate Security Review)
- Refactor boards/lists/sync to use stored token (**A5**, if approved)
- Any change to manual **`POST /api/trello/boards`**, **`/lists`**, **`/sync`** credential flow

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
- **Encrypted at rest** with `TRELLO_TOKEN_ENCRYPTION_KEY` before insert; decrypt only in backend process when calling Trello (disconnect revoke today; sync/boards/lists in **A5** if approved)
- Repository **metadata** queries exclude ciphertext columns; decrypt helpers are backend-internal only

---

## `trello_connections` access model

- RLS enabled; **no** policies for `authenticated` / `anon`
- Grants: **`service_role`** only (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
- Application must filter by `user_id` from JWT on every operation (service role bypasses RLS)

Frontend must use **sanitized backend APIs** for connection status — never PostgREST on this table.

---

## Manual MVP (still live)

- User enters apiKey + token on `/trello`; sent in POST body to `/api/trello/boards`, `/lists`, `/sync`
- Credentials cleared from React state after sync; **not** stored in DB, localStorage, or sessionStorage
- See ADR 004 for ephemeral manual flow; ADR 006 for stored-token path when **A4/A5** ship

---

## Security Review

| Phase | Status |
|-------|--------|
| A2 storage/crypto/repository | Reviewed — passed |
| A3 connect/authorize/disconnect routes | Reviewed — **Security approved with notes** |
| **A4** OAuth callback, state/nonce, fragment handling | **Pending** — required before OAuth is live for users |
| Refactoring sync/boards/lists to stored tokens (**A5**) | **Pending** — separate review when implemented |

See `SECURITY.md` and `AGENTS.md`.
