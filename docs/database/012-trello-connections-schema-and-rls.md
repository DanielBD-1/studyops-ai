# 012 — Trello Connections Schema and RLS (Phase TRELLO-OAUTH-A2-DB)

**Status:** Migration file added in repo; apply manually on Supabase when approved for deployment.
**Migration file:** `supabase/migrations/012_trello_connections.sql`
**Apply method:** Supabase SQL Editor (not CLI) — verify **Success. No rows returned.** after apply.
**Prerequisite:** migrations **001–011** applied and verified
**PRD / plan reference:** TRELLO-OAUTH-A1-PLAN; [ADR 006](../adrs/006-trello-oauth-encrypted-connections.md) — supersedes ADR 004 **user token persistence** **only after** connect flow ships (A3+)

---

## Purpose

Phase **TRELLO-OAUTH-A2-DB** adds the **database foundation** for storing **encrypted** Trello user tokens per StudyOps user:

- one row per user (`user_id` unique)
- AES-256-GCM fields: `token_ciphertext`, `token_iv`, `token_tag`
- optional UX defaults: `default_board_id`, `default_list_id`
- member metadata: `trello_member_id`, `trello_username`
- **no** plaintext Trello token column

**In this phase:** SQL migration + this documentation + backend crypto/repository (no HTTP connect routes, no frontend).

**Not implemented in A2:**

- `GET /api/trello/connection`, authorize URL, connect/complete, disconnect
- Frontend `/trello/connect/callback`
- Refactor of `POST /api/trello/boards`, `/lists`, `/sync` to use stored token
- Manual apiKey/token removal from UI

**Later phase behavior:** `POST /api/trello/disconnect` will **hard-delete** the row (no soft-delete).

---

## Schema summary

### Table: `public.trello_connections`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, UNIQUE, FK → `auth.users(id)` ON DELETE CASCADE | One Trello link per user |
| `token_ciphertext` | `text` | NOT NULL | Base64 ciphertext |
| `token_iv` | `text` | NOT NULL | Base64 IV (12-byte nonce for GCM) |
| `token_tag` | `text` | NOT NULL | Base64 GCM auth tag |
| `encryption_key_version` | `smallint` | NOT NULL default `1` | Backend key rotation |
| `scopes` | `text` | NOT NULL | e.g. `read,write` |
| `expiration_policy` | `text` | NULLABLE | e.g. `never`, `30days` |
| `expires_at` | `timestamptz` | NULLABLE | Optional expiry |
| `trello_member_id` | `text` | NOT NULL | From Trello `/members/me` |
| `trello_username` | `text` | NULLABLE | Display only |
| `default_board_id` | `text` | NULLABLE | Non-secret UX default |
| `default_list_id` | `text` | NULLABLE | Non-secret UX default |
| `connected_at` | `timestamptz` | NOT NULL default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL default `now()` | Trigger-maintained |

### Intentionally absent columns

| Not stored | Reason |
|------------|--------|
| Plaintext `token` | Secret — encrypt at rest in backend before insert |
| Trello `api_key` | Server env `TRELLO_API_KEY` (public per Trello; not per-user) |
| Raw Trello OAuth responses | Could contain secrets |

---

## Why tokens are encrypted

Trello user tokens grant access to the member's Trello account. A database breach must not expose usable tokens. The backend encrypts with **AES-256-GCM** using `TRELLO_TOKEN_ENCRYPTION_KEY` (32-byte value, base64 in env) before insert. Decryption occurs only in the backend process when calling Trello API (phases A3+).

---

## Frontend access

**The frontend must not access this table directly** (no PostgREST grants to `authenticated` or `anon`). Connection status for UI will come from **sanitized backend API responses** in later phases (no token, no ciphertext).

---

## Backend access

- **`service_role` only** — `SELECT`, `INSERT`, `UPDATE`, `DELETE` on `public.trello_connections`
- Backend repository filters every operation by `user_id` from JWT (`req.user.id`)
- Never log or return plaintext token or ciphertext to clients

---

## Row Level Security

| Role | Access |
|------|--------|
| `anon` | Revoked all |
| `authenticated` | Revoked all — **no policies** (cannot read/write via Data API) |
| `service_role` | Full table access; RLS bypassed — application must enforce `user_id` |

---

## Indexes and triggers

- **Unique** `user_id` (one connection per user)
- Index `trello_connections_user_id_idx` on `user_id`
- **`trello_connections_set_updated_at`** — sets `updated_at = now()` on `UPDATE`

---

## Cascade behavior

| Delete action | Effect |
|---------------|--------|
| Delete **user** (`auth.users`) | Connection row deleted (FK `ON DELETE CASCADE`) |

---

## Verification checklist (after manual apply)

1. Table exists: `public.trello_connections`
2. RLS enabled; no `authenticated` policies
3. Grants: `service_role` has `SELECT, INSERT, UPDATE, DELETE`; `authenticated` has none
4. Unique constraint on `user_id`
5. Trigger `trello_connections_set_updated_at` present

---

## Related files (application)

| File | Role |
|------|------|
| `backend/src/modules/trello/trello-token-crypto.js` | Encrypt/decrypt |
| `backend/src/modules/trello/trello-connection.repository.js` | CRUD via service_role |
