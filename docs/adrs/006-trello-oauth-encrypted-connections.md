# ADR 006: Encrypted Trello Connection Storage (OAuth)

**Status:** Accepted — **live** (phases **A2–A6** shipped: encrypted storage, connect routes, signed state, Connect UI/callback, stored-token boards/lists/sync, connected frontend UX, A5C hardening, board/list defaults)
**Date:** 2026-06-03  
**Deciders:** Project team  
**Supersedes (partial):** ADR 004 — **encrypted user Trello token persistence** only. Manual apiKey/token in request body remains the **disconnected fallback** (ADR 004) — never stored.

---

## Context

StudyOps supports Trello account connect so students link once instead of pasting API key and token on every sync. That requires durable, per-user storage of Trello **user tokens** with strong access controls.

ADR 004 correctly avoided **manual** credential persistence for the original MVP. Phase **TRELLO-OAUTH-A2-DB** added storage/crypto foundation; **A3–A6** shipped connect flow, stored-token sync, and board/list defaults.

---

## Decision

1. **Table:** `public.trello_connections` — one row per user (`user_id` unique).
2. **Secrets at rest:** Trello user token stored only as **AES-256-GCM** fields (`token_ciphertext`, `token_iv`, `token_tag`); **no** plaintext token column.
3. **Server env:** App-level Trello API key in `TRELLO_API_KEY`; encryption key in `TRELLO_TOKEN_ENCRYPTION_KEY` (32-byte value, base64 in env — placeholders in `backend/.env.example` only); optional `TRELLO_OAUTH_STATE_SECRET` for signed OAuth state.
4. **Access:** **`service_role` only** on `trello_connections`. **No** grants to `authenticated` or `anon`. Frontend must **not** query this table via Supabase client.
5. **Backend:** Repository + crypto utilities use `getSupabaseAdmin()` and filter every operation by JWT `user_id`. Metadata APIs return **no** token, ciphertext, or IV/tag.
6. **Disconnect:** Hard-delete connection row (no soft-delete).
7. **UX fields:** `default_board_id`, `default_list_id`, `trello_member_id`, `trello_username` — safe for sanitized status responses; defaults updated via **`PATCH /api/trello/connection/defaults`** (**A6**).

**Shipped connect/sync routes (A3+):**

- `GET /api/trello/connection`, `GET /api/trello/authorize-url`, `POST /api/trello/connect/complete`, `POST /api/trello/disconnect`
- Frontend Connect/Disconnect on **`/trello`** + protected **`/trello/connect/callback`**
- `POST /api/trello/boards`, `/lists`, `/sync` — stored-token mode when body omits `apiKey`/`token` (**A5A**)
- Connected frontend UX sends `{}` / `{ listId, taskIds }` only (**A5B**); connected + manual credentials blocked (**A5C**)

**Historical (A2 foundation only — superseded by A3+ ship):**

- At A2 ship, connect routes and stored-token sync were **not** yet live; manual body credentials were the only production path.

---

## Consequences

**Positive:**

- Students connect Trello once; sync uses stored encrypted token when linked
- Tokens encrypted at rest; breach of DB alone does not expose usable tokens without `TRELLO_TOKEN_ENCRYPTION_KEY`
- Frontend cannot exfiltrate tokens via PostgREST
- Board/list defaults persist for connected users (**A6**)

**Negative:**

- Operational burden: tier-1 secrets (`SUPABASE_SERVICE_ROLE_KEY`, `TRELLO_TOKEN_ENCRYPTION_KEY`) and key rotation discipline
- Two credential models coexist: connected stored token vs disconnected manual body (ADR 004)

---

## Compliance rules for agents

- **Connected mode (primary when linked):** Backend reads/decrypts stored user token from `trello_connections`; frontend sends `{}` / `{ listId, taskIds }` only — **no** manual apiKey/token.
- **Disconnected mode:** Manual apiKey/token in **`POST /api/trello/*`** body only (ADR 004) — ephemeral; never stored in DB or browser storage.
- **Never** log Trello user tokens (plaintext or decrypted) or manual apiKey/token.
- **Never** return tokens or ciphertext to the frontend.
- **Never** store Trello tokens in `localStorage`, `sessionStorage`, or URLs.
- **Never** add `authenticated` RLS policies on `trello_connections`.
- Connect/disconnect and crypto changes require **Security Review** before merge.

---

## References

- ADR 004 (manual credentials — disconnected fallback only; historical manual-MVP decision preserved)
- ADR 005 (manual list ID — board/list picker is live; A6 persists defaults)
- `docs/database/012-trello-connections-schema-and-rls.md`
- `docs/security/trello-oauth-foundation.md`
- `supabase/migrations/012_trello_connections.sql`
