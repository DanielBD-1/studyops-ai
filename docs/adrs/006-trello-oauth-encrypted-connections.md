# ADR 006: Encrypted Trello Connection Storage (OAuth Foundation)

**Status:** Accepted (foundation only — connect flow not live)  
**Date:** 2026-06-03  
**Deciders:** Project team  
**Supersedes (partial):** ADR 004 — **user token persistence** only, and **only after** OAuth connect/disconnect routes and UI ship (phases A3+). Manual apiKey/token in request body remains the **live** sync path until then.

---

## Context

Post-MVP, StudyOps will support Trello OAuth so students connect once instead of pasting API key and token on every sync. That requires durable, per-user storage of Trello **user tokens** with strong access controls.

ADR 004 correctly avoided credential persistence for the manual MVP. Phase **TRELLO-OAUTH-A2-DB** adds the **storage and crypto foundation** without turning on OAuth in production UI or routes.

---

## Decision

1. **Table:** `public.trello_connections` — one row per user (`user_id` unique).
2. **Secrets at rest:** Trello user token stored only as **AES-256-GCM** fields (`token_ciphertext`, `token_iv`, `token_tag`); **no** plaintext token column.
3. **Server env:** App-level Trello API key in `TRELLO_API_KEY` (optional until connect flow); encryption key in `TRELLO_TOKEN_ENCRYPTION_KEY` (32-byte value, base64 in env — placeholders in `backend/.env.example` only).
4. **Access:** **`service_role` only** on `trello_connections`. **No** grants to `authenticated` or `anon`. Frontend must **not** query this table via Supabase client.
5. **Backend:** Repository + crypto utilities use `getSupabaseAdmin()` and filter every operation by JWT `user_id`. Metadata APIs (future) return **no** token, ciphertext, or IV/tag.
6. **Disconnect (future):** Hard-delete connection row (no soft-delete).
7. **Non-secret UX fields (optional):** `default_board_id`, `default_list_id`, `trello_member_id`, `trello_username` — safe for sanitized status responses later.

**Still out of scope in A2 (and until later phases):**

- OAuth authorize URL, callback route, connect/complete/disconnect HTTP APIs
- Frontend Connect Trello UI or `/trello/connect/callback`
- Refactoring `POST /api/trello/boards`, `/lists`, `/sync` to use stored token
- Removing manual apiKey/token fields from `/trello`

---

## Consequences

**Positive:**

- Clear path to OAuth without another schema migration
- Tokens encrypted at rest; breach of DB alone does not expose usable tokens without `TRELLO_TOKEN_ENCRYPTION_KEY`
- Frontend cannot exfiltrate tokens via PostgREST

**Negative:**

- Operational burden: tier-1 secrets (`SUPABASE_SERVICE_ROLE_KEY`, `TRELLO_TOKEN_ENCRYPTION_KEY`) and key rotation discipline
- Two Trello credential models coexist until connect flow ships (manual body vs stored token)

---

## Compliance rules for agents

- **Live user flow today:** Manual apiKey/token in **`POST /api/trello/*`** body (ADR 004) — **unchanged** until an approved connect phase explicitly switches routes.
- **Never** log Trello user tokens (plaintext or decrypted).
- **Never** return tokens or ciphertext to the frontend.
- **Never** store Trello tokens in `localStorage`, `sessionStorage`, or URLs.
- **Never** add `authenticated` RLS policies on `trello_connections`.
- OAuth callback/connect/disconnect implementation requires **Security Review** before merge.

---

## References

- ADR 004 (manual MVP — historical; token persistence superseded when connect ships)
- ADR 005 (manual list ID — board/list picker is live; OAuth may persist defaults later)
- `docs/database/012-trello-connections-schema-and-rls.md`
- `docs/security/trello-oauth-foundation.md`
- `supabase/migrations/012_trello_connections.sql`
