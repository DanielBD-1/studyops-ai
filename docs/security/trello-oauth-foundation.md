# Trello OAuth foundation — security notes (A2 + A3 + A4-STATE + A4-FRONTEND + A5A + A5B + A5C)

**Phases:** TRELLO-OAUTH-A2-DB (storage/crypto foundation); TRELLO-OAUTH-A3 (backend connect/authorize routes); TRELLO-OAUTH-A4-STATE (signed OAuth state on connect flow); TRELLO-OAUTH-A4-FRONTEND (frontend Connect/Disconnect UI + callback); TRELLO-OAUTH-A5A (backend stored-token mode on boards/lists/sync); TRELLO-OAUTH-A5B (frontend connected-account sync UX); TRELLO-OAUTH-A5C (backend manual-credential hardening while connected)
**Status:** **A2 + A3 + A4-STATE + A4-FRONTEND + A5A + A5B + A5C implemented in repo** — users can **connect/disconnect** a Trello account from **`/trello`**. When **connected**, **`/trello`** sync uses **stored-token mode** (frontend sends `{}` / `{ listId, taskIds }` only). When **disconnected**, **Advanced manual credentials** fallback remains available (collapsed). **A5C:** connected users **cannot** send manual `{ apiKey, token }` to boards/lists/sync — backend returns **`TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED`** / **400**; user must disconnect before manual fallback.

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

- **`/trello`** — `TrelloConnectionPanel`: Connect account (`fetchTrelloAuthorizeUrl` → redirect); Disconnect (`disconnectTrello`); displays safe metadata (`@trelloUsername`)
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

## What is shipped (A5A — backend only)

Additive, backward-compatible **stored-token mode** on existing discovery/sync routes. **No route path changes.**

| Route | Stored mode body | Manual mode body |
|-------|------------------|------------------|
| **`POST /api/trello/boards`** | `{}` strict | `{ apiKey, token }` strict (unchanged) |
| **`POST /api/trello/boards/:boardId/lists`** | `{}` strict | `{ apiKey, token }` strict (unchanged) |
| **`POST /api/trello/sync`** | `{ listId, taskIds }` strict | `{ apiKey, token, listId, taskIds }` strict (unchanged) |

**Credential mode classification (`classifyTrelloCredentialMode`):**

- Uses **key presence**, not truthiness (`Object.prototype.hasOwnProperty.call`)
- No `apiKey`/`token` keys → **stored** mode
- Both keys present → **manual** mode (allowed only when user has **no** connection row — **A5C** rejects when connected)
- Only one key present → **`VALIDATION_ERROR`** / 400
- Stored mode, user not connected → **`TRELLO_NOT_CONNECTED`** / 400

**Stored mode resolution (`trello-credentials.resolver.js`):**

- Server **`TRELLO_API_KEY`** + **`decryptTokenForUser(req.user.id)`** — scoped to authenticated user only
- Decrypted token used only inside backend process for Trello upstream calls
- **Unchanged:** `trello.routes.js`, `trello.service.js`, `trello.client.js`, `trello-token-crypto.js`, `trello-connection.repository.js` logic

**Security (A5A — reviewed PASS):**

- Stored token decrypted **backend-side only**
- **`service_role`** remains backend-only; frontend must not access `trello_connections` via PostgREST
- **No** token returned to frontend in API responses
- **No** token, ciphertext, iv, or tag in API responses
- **No** token in **`trello_sync_logs`**
- Manual credentials remain **ephemeral** — not stored in DB
- Manual override while connected was **A5A** backward compatibility — **closed by A5C** (see below)

**Reviews (A5A):** Supervisor Review **Approved** (after test-wiring fix); Security Review **PASS**. **`npm test`:** **442** pass; **`npm run lint`:** pass.

## What is shipped (A5B — frontend only)

**Connected-account sync UX** on **`/trello`**. Builds on **A5A** stored-token backend mode. **No backend contract changes.**

| Mode | Frontend behavior |
|------|-------------------|
| **Connected** | `fetchTrelloBoards()` → `{}`; `fetchTrelloBoardLists({ boardId })` → `{}`; `syncTasksToTrello({ listId, taskIds })` → no credential keys; manual apiKey/token inputs **hidden**; UI states boards/lists/sync use connected account |
| **Disconnected / manual fallback** | Connect account prompt; **Advanced manual credentials** in collapsed `<details>`; sends `{ apiKey, token }` only when user explicitly uses fallback |

**Security (A5B — reviewed PASS):**

- Connected frontend requests contain **no** `apiKey`/`token`
- **No** direct Trello API calls from frontend (`api.trello.com`)
- **No** credential storage in localStorage/sessionStorage
- **No** credential logging
- Manual credentials only in manual form state when fallback is used; cleared after manual sync and on mode transitions
- OAuth token handling from **A4** unchanged (callback reads token from hash; URL sanitized before complete POST)
- Stored Trello token **never** received, rendered, or logged by frontend

**Reviews (A5B):** Supervisor Review **Pass with notes**; Security Review **PASS**. **`npm test`:** **289** pass; **`npm run lint`:** pass; **`npm run build`:** pass.

## What is shipped (A5C — backend only)

**Manual-credential hardening** on existing discovery/sync routes. **No route path changes.** **No frontend changes.**

| Scenario | Result |
|----------|--------|
| Connected + stored `{}` / `{ listId, taskIds }` | Unchanged — stored-token path (**A5A**) |
| Connected + manual `{ apiKey, token }` | **`TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED`** / **400** — reject **before** decrypt, Trello API call, or sync log write |
| Disconnected + manual `{ apiKey, token }` | Unchanged — ephemeral manual fallback (ADR 004) |
| Disconnected + stored body | **`TRELLO_NOT_CONNECTED`** / **400** (unchanged) |
| Partial credentials (one key only) | **`VALIDATION_ERROR`** / **400** (unchanged) |

**Implementation (`trello-credentials.resolver.js`):**

- **`assertManualCredentialsAllowed(userId)`** — metadata-only **`getConnectionByUserId(userId)`**; if connection exists, throw **`TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED`** with static message: *Use your connected Trello account, or disconnect before using manual credentials.*
- Applied on manual path for boards, board-lists, and sync before credential return, decrypt, or upstream Trello calls
- Error response includes **no** `apiKey`/`token`/request-body details

**Security (A5C — reviewed):**

- Wrong-account manual sync while connected **blocked at backend**
- Reject before **`decryptTokenForUser`**
- Reject before Trello API call
- Reject before **`trello_sync_logs`** write
- Manual fallback still available **only when disconnected** (user must disconnect first to switch accounts via manual credentials)
- Closes the hardening gap deferred from **A5A**/**A5B**

**Reviews (A5C):** Supervisor Review **Pass with notes**; Security Review **Security approved with notes**. **`npm test`:** **448** pass; **`npm run lint`:** pass.

## What is not shipped

- Board/list persistence; Trello card update/delete; force re-sync

---

## Tier-1 secrets

| Secret | Location | Notes |
|--------|----------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Backend only | Required for `trello_connections` access |
| `TRELLO_TOKEN_ENCRYPTION_KEY` | Backend only | 32-byte random value, base64-encoded; generate locally — never commit |
| `TRELLO_OAUTH_STATE_SECRET` | Backend only | Optional dedicated 32-byte base64 HMAC key for OAuth state; **production should prefer dedicated secret**; falls back to derive from encryption key when unset |
| `TRELLO_API_KEY` | Backend only | Trello app key (public per Trello docs); used for stored mode and connect flow |

Never put these in frontend `VITE_*`, issues, PRs, or logs.

---

## Trello user tokens

- Treat as **secrets** — same sensitivity as passwords for Trello account access
- **Must not** appear in logs, API responses, frontend state persistence, or Supabase Data API for browsers
- **Encrypted at rest** with `TRELLO_TOKEN_ENCRYPTION_KEY` before insert; decrypt only in backend process when calling Trello (disconnect revoke; **A5A** boards/lists/sync stored mode)
- Repository **metadata** queries exclude ciphertext columns; decrypt helpers are backend-internal only

---

## `trello_connections` access model

- RLS enabled; **no** policies for `authenticated` / `anon`
- Grants: **`service_role`** only (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
- Application must filter by `user_id` from JWT on every operation (service role bypasses RLS)

Frontend must use **sanitized backend APIs** for connection status — never PostgREST on this table.

---

## Sync modes on `/trello`

**Connected mode (A5B — primary UX when linked):**

- Frontend sends `{}` / `{ listId, taskIds }` to StudyOps backend only
- Backend resolves stored token (**A5A**)
- **No** apiKey/token keys in connected frontend request bodies

**Manual fallback (disconnected only — A5C):**

- User enters apiKey + token in collapsed advanced credentials; sent in POST body to `/api/trello/boards`, `/lists`, `/sync`
- **Only when disconnected** — if user is connected, backend rejects manual credentials with **`TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED`** / **400**; user must **Disconnect** first
- Credentials cleared from React state after manual sync; **not** stored in DB, localStorage, or sessionStorage
- See ADR 004 for ephemeral manual flow

---

## Security Review

| Phase | Status |
|-------|--------|
| A2 storage/crypto/repository | Reviewed — passed |
| A3 connect/authorize/disconnect routes | Reviewed — **Security approved with notes** |
| **A4-STATE** signed OAuth state on connect flow | Reviewed — **Security approved with notes** |
| **A4-FRONTEND** OAuth callback, fragment handling, Connect UI | Reviewed — **Pass** |
| **A5A** stored-token mode on boards/lists/sync (backend) | Reviewed — **PASS** |
| **A5B** frontend connected-account sync UX | Reviewed — **PASS** |
| **A5C** backend manual-credential hardening while connected | Reviewed — **Security approved with notes** |

See `SECURITY.md` and `AGENTS.md`.
