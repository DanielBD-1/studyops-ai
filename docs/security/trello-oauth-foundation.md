# Trello OAuth foundation — security notes (A2 + A3 + A4-STATE + A4-FRONTEND)

**Phases:** TRELLO-OAUTH-A2-DB (storage/crypto foundation); TRELLO-OAUTH-A3 (backend connect/authorize routes); TRELLO-OAUTH-A4-STATE (signed OAuth state on connect flow); TRELLO-OAUTH-A4-FRONTEND (frontend Connect/Disconnect UI + callback)
**Status:** **A2 + A3 + A4-STATE + A4-FRONTEND implemented in repo** — users can **connect/disconnect** a Trello account from **`/trello`**. **Stored-token sync is not implemented** — manual apiKey/token on **`/trello`** remains the **only active sync path** until **A5**.

---

## What is shipped (A2)

- Migration `012_trello_connections.sql` — encrypted token columns; **service_role** only
- Backend: `trello-token-crypto.js` (AES-256-GCM), `trello-connection.repository.js`
- Optional env placeholders: `TRELLO_API_KEY`, `TRELLO_TOKEN_ENCRYPTION_KEY` in `backend/.env.example`

## What is shipped (A3 — backend only)

- **`GET /api/trello/connection`** — sanitized connection status (metadata only; no token/ciphertext)
- **`GET /api/trello/authorize-url`** — Trello authorize URL for implicit grant (fragment callback)
- **`POST /api/trello/connect/complete`** — validates token via Trello; encrypts before DB write (see **A4-STATE** for `{ token, state }` contract)
- **`POST /api/trello/disconnect`** — body `{}`; best-effort revoke; hard-deletes local row
- All four routes: **`requireAuth`**; user scope via `req.user.id` only
- Connected response contract (flat): `{ connected: true, trelloMemberId, trelloUsername, scopes, expirationPolicy, expiresAt, defaultBoardId, defaultListId, connectedAt, updatedAt }`
- **Reviews:** Supervisor **Pass with notes**; Security **Security approved with notes** — no blocking issues

## What is shipped (A4-STATE — backend only)

- **`trello-oauth-state.js`** — HMAC-SHA256 signed state: payload `{ sub, n, iat, exp, pur }` with purpose `trello_oauth_connect`, **10-minute TTL**, 128-bit nonce
- **`GET /api/trello/authorize-url`** — creates state bound to authenticated user; embeds in `return_url` as `/trello/connect/callback?state=<signed-state>`; returns `{ authorizeUrl }` only (state not returned separately)
- **`POST /api/trello/connect/complete`** — strict body `{ token, state }`; verifies signature, expiry, purpose, and `sub === req.user.id` **before** Trello `/members/me` and **before** DB upsert
- Invalid/missing/tampered/expired/foreign state → `TRELLO_OAUTH_STATE_INVALID` / 400 / generic message (exact failure reason not exposed)
- Signing key: prefer **`TRELLO_OAUTH_STATE_SECRET`** (32-byte base64); fallback: domain-separated HMAC derive from **`TRELLO_TOKEN_ENCRYPTION_KEY`**; missing/invalid config → safe `SERVER_ERROR` / 503
- **Reviews:** Supervisor **Pass**; Security **Security approved with notes**

### CSRF protection and residual risk

- **Blocks:** account-linking CSRF where a logged-in user is tricked into completing connect with an attacker’s Trello token without a victim-bound signed state
- **State is stateless and not single-use** — nonce is not stored server-side
- **MVP accepted residual risk:** replay within the 10-minute TTL if an attacker captures `{ token, state }` plus a valid session — mitigated by auth requirement and `sub` binding; acceptable for MVP
- **Future hardening (not a blocker):** single-use nonce persistence (server-side store)

## What is shipped (A4-FRONTEND — frontend only)

- **`/trello`** — `TrelloConnectionPanel`: Connect account (`fetchTrelloAuthorizeUrl` → redirect); Disconnect (`disconnectTrello`); displays safe metadata (`@trelloUsername`); trust note that sync below still uses manual API key/token
- Protected **`/trello/connect/callback`** — `TrelloConnectCallbackPage`
- **Parse:** `state` from **query string** only; Trello OAuth `token` from **URL hash fragment** only (token in query is ignored)
- **URL hygiene:** `sanitizeOAuthCallbackUrl` via `history.replaceState` clears query and hash **before** `POST /api/trello/connect/complete`
- **Complete:** `completeTrelloConnection({ token, state })` — body only; never in URL path/query
- **StrictMode:** `beginOAuthExchange` — at most one in-flight complete POST per callback load; guard holds promise only (no token/state/URL)
- **Missing token/state:** safe redirect to **`/trello`** with error flash; **no** backend POST
- **`TRELLO_OAUTH_STATE_INVALID`:** user message “Connection request expired or invalid. Please try again.”
- **Frontend does not validate or sign state** — relies on **A4-STATE** backend
- **Secrets not persisted client-side:** no `localStorage` / `sessionStorage`; not stored in React state; not logged or rendered
- **Reviews:** Supervisor **Pass**; Security **Pass** — **`npm test` 271**; **`npm run lint`**; **`npm run build`**

## What is not shipped

- Refactor boards/lists/sync to use stored token (**A5**, if approved)
- Remove manual apiKey/token fields from sync section (**A5**)
- Any change to manual **`POST /api/trello/boards`**, **`/lists`**, **`/sync`** credential flow (still ephemeral body credentials)

---

## Tier-1 secrets

| Secret | Location | Notes |
|--------|----------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Backend only | Required for `trello_connections` access |
| `TRELLO_TOKEN_ENCRYPTION_KEY` | Backend only | 32-byte random value, base64-encoded; generate locally — never commit |
| `TRELLO_OAUTH_STATE_SECRET` | Backend only | Optional dedicated 32-byte base64 HMAC key for OAuth state; **production should prefer dedicated secret**; falls back to derive from encryption key when unset |
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

## Manual MVP sync (still live — only active sync path)

- User enters apiKey + token on **`/trello`**; sent in POST body to `/api/trello/boards`, `/lists`, `/sync`
- Credentials cleared from React state after sync; **not** stored in DB, localStorage, or sessionStorage
- See ADR 004 for ephemeral manual flow; ADR 006 for stored-token path when **A5** ships

---

## Security Review

| Phase | Status |
|-------|--------|
| A2 storage/crypto/repository | Reviewed — passed |
| A3 connect/authorize/disconnect routes | Reviewed — **Security approved with notes** |
| **A4-STATE** signed OAuth state on connect flow | Reviewed — **Security approved with notes** |
| **A4-FRONTEND** OAuth callback, fragment handling, Connect UI | Reviewed — **Pass** |
| Refactoring sync/boards/lists to stored tokens (**A5**) | **Pending** — separate review when implemented |

See `SECURITY.md` and `AGENTS.md`.
