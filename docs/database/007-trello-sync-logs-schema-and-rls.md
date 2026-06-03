# 007 — Trello Sync Logs Schema and RLS (Phase 4A-0)

**Status:** **Applied manually** on Supabase (Phase 4A-0 complete; Supervisor + Security + Migration Review approved; catalog + behavioral verification passed on **2026-05-26**).
**Migration file:** `supabase/migrations/007_trello_sync_logs.sql`
**Apply method:** Supabase SQL Editor (not CLI) — **Success. No rows returned.**
**Prerequisite:** migrations **001–006** applied and verified
**PRD reference:** Section 7.6 (Trello Sync), Section 8.4 (`trello_sync_logs`), ADR 004 (no credential columns in sync logs). **OAuth tokens:** stored separately in `trello_connections` (ADR 006, migration **012**) — not in this table.

---

## Purpose

Phase 4A-0 adds the **database foundation** for Trello sync auditing by creating `public.trello_sync_logs` with:

- one row per **task sync attempt** (success, failed, or skipped)
- optional `trello_card_id` on success
- optional **sanitized** `error_message` (length-capped)
- **no** columns for Trello `apiKey`, `token`, `listId`, raw request bodies, or raw Trello API responses

**In this phase:** SQL migration + this database documentation; table **applied and verified** on Supabase. **No** application code.

**Not implemented in Phase 4A-0:**

- **No** `POST /api/trello/sync` backend route (Phase **4A-1** — requires **Security Review** when implemented).
- **No** frontend `/trello` page (Phase 4A-2).
- **No** credential persistence (ADR 004).
- **No** `api_logs` admin table.

**Phase 4A-1 backend obligations (not enforced by this migration):** sanitize all `error_message` values before insert; **never** insert credentials, `listId`, or raw Trello HTTP responses; filter `service_role` reads by authenticated `user_id` when exposing logs to users.

---

## Schema summary

### Table: `public.trello_sync_logs`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | Owner |
| `task_id` | `uuid` | NOT NULL, FK → `public.study_tasks(id)` ON DELETE CASCADE | Task synced |
| `status` | `text` | NOT NULL, CHECK **`success` \| `failed` \| `skipped`** | Per-attempt outcome |
| `trello_card_id` | `text` | NULLABLE | Trello card id on success; null otherwise |
| `error_message` | `text` | NULLABLE, CHECK trim **1–500** when not null | Sanitized message only |
| `created_at` | `timestamptz` | NOT NULL default `now()` | Append-only timestamp |

### Intentionally absent columns

| Not stored | Reason |
|------------|--------|
| `api_key`, `token`, `list_id` | ADR 004 — credentials ephemeral; never persist |
| Raw Trello JSON / HTTP body | Could contain secrets or PII; backend stores safe messages only |
| `updated_at` | Append-only log; no row updates in MVP |

### Field reasoning

- **`skipped`** supports “already synced” and similar cases without calling Trello (Phase 4A-1 behavior).
- **`error_message`** length cap (500) limits accidental storage of large upstream error payloads; backend must sanitize before insert.
- **`listId` is not stored** — avoids retaining unnecessary external identifiers; sync context is tied to `task_id` and owner `user_id`.

---

## Relationships and cascade behavior

### Relationship graph

```text
auth.users(id) = auth.uid()
        │
        ├── trello_sync_logs(user_id)
        │
        └── study_tasks(user_id)
                └── trello_sync_logs(task_id)
```

### Cascades

| Delete action | Effect on `trello_sync_logs` |
|---------------|------------------------------|
| Delete **user** | Log rows deleted (FK `user_id ... ON DELETE CASCADE`) |
| Delete **study task** | Log rows deleted (FK `task_id ... ON DELETE CASCADE`) |

---

## Constraints and triggers

### CHECK constraints

| Constraint | Rule |
|-----------|------|
| `trello_sync_logs_status_allowed` | `status in ('success', 'failed', 'skipped')` |
| `trello_sync_logs_error_message_length` | If not null, `char_length(trim(error_message))` between **1** and **500** |

### Triggers (defense in depth)

| Trigger | Purpose |
|---------|---------|
| `trello_sync_logs_enforce_task_owner` | On INSERT, ensures `user_id` matches `study_tasks.user_id` for `task_id` |

Runs even when RLS is bypassed via `service_role`, so backend cannot attach logs to another user’s tasks by mistake.

---

## Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| `trello_sync_logs_user_id_idx` | `user_id` | Filter logs by owner |
| `trello_sync_logs_task_id_idx` | `task_id` | Lookup attempts per task |
| `trello_sync_logs_created_at_idx` | `created_at desc` | Time-ordered queries |
| `trello_sync_logs_user_id_created_at_idx` | `(user_id, created_at desc)` | Owner timeline (matches `study_tasks` / `flashcards` style) |

---

## RLS plan and grants

### RLS

`public.trello_sync_logs` has **RLS enabled**.

| Operation | Policy | Role | Rule |
|-----------|--------|------|------|
| SELECT | `trello_sync_logs_select_own` | `authenticated` | `user_id = auth.uid()` |
| INSERT | *(none)* | `authenticated` | Direct client inserts **not** allowed |
| UPDATE | *(none)* | `authenticated` | — |
| DELETE | *(none)* | `authenticated` | — |

Backend **`service_role`** bypasses RLS and **INSERT**s log rows after sync attempts. Future backend reads must still filter by `user_id = req.user.id`.

### Grants

After `REVOKE ALL` from `anon`, `authenticated`, and `service_role`:

| Role | Grants |
|------|--------|
| `anon` | **None** |
| `authenticated` | **SELECT** only |
| `service_role` | **SELECT**, **INSERT** |

No `UPDATE` or `DELETE` grants — append-only audit trail for MVP.

---

## Security notes

| Topic | Requirement |
|-------|-------------|
| **Credentials** | Never store Trello `apiKey`, `token`, or `listId` in this table (ADR 004). |
| **error_message** | Backend must insert **sanitized** user-facing text only — not raw Trello HTTP bodies (may echo query params). |
| **Frontend** | Must **not** write to `trello_sync_logs` via Supabase client; use Express `POST /api/trello/sync` only (Phase 4A-1+). |
| **service_role** | Every `select` on this table in backend must filter by authenticated **`user_id`** when exposing logs to a user. |
| **Cross-user reads** | RLS blocks `authenticated` users from reading other users’ logs. |
| **Logging** | Do not log `apiKey` or `token` in application logs when implementing 4A-1 (see `SECURITY.md`). |

---

## Manual verification checklist (run after apply)

Run in Supabase SQL Editor **after** applying `007_trello_sync_logs.sql`.

### Catalog checks

```sql
-- 1) Table exists
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'trello_sync_logs';

-- 2) RLS enabled
select relname, relrowsecurity
from pg_class
where relname = 'trello_sync_logs';

-- 3) Columns
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'trello_sync_logs'
order by ordinal_position;

-- 4) Policies
select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'trello_sync_logs';

-- 5) Indexes
select indexname
from pg_indexes
where schemaname = 'public'
  and tablename = 'trello_sync_logs';

-- 6) Grants (authenticated should be SELECT only; service_role SELECT + INSERT)
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'trello_sync_logs'
order by grantee, privilege_type;
```

| # | Check | Expected |
|---|-------|----------|
| 1 | Table exists | One row: `trello_sync_logs` |
| 2 | RLS enabled | `relrowsecurity = true` |
| 3 | Columns | `id`, `user_id`, `task_id`, `status`, `trello_card_id`, `error_message`, `created_at` — no credential columns |
| 4 | Policies | `trello_sync_logs_select_own` (SELECT, authenticated) only |
| 5 | Indexes | PK + four indexes listed above |
| 6 | Grants `anon` | None |
| 7 | Grants `authenticated` | **SELECT** only |
| 8 | Grants `service_role` | **SELECT**, **INSERT** |
| 9 | Status CHECK | Invalid status rejected |
| 10 | error_message length | Empty or >500 chars rejected when not null |
| 11 | Task owner trigger | Insert with `user_id` not matching task owner fails |

### Behavioral probes (service_role or SQL as table owner)

Use an owned `study_tasks` row for your test user.

```sql
-- Valid success log (replace UUIDs)
insert into public.trello_sync_logs (user_id, task_id, status, trello_card_id)
values (
  '<your-user-id>',
  '<your-task-id>',
  'success',
  'trelloCardIdExample123'
);

-- Skipped with sanitized message
insert into public.trello_sync_logs (user_id, task_id, status, error_message)
values (
  '<your-user-id>',
  '<your-task-id>',
  'skipped',
  'Already synced to Trello'
);

-- Should fail: status invalid
insert into public.trello_sync_logs (user_id, task_id, status)
values ('<your-user-id>', '<your-task-id>', 'partial');

-- Should fail: user_id mismatch for task_id
insert into public.trello_sync_logs (user_id, task_id, status)
values ('<other-user-id>', '<your-task-id>', 'failed');

-- Cleanup test rows
delete from public.trello_sync_logs
where task_id = '<your-task-id>';
```

| Probe | Expected |
|-------|----------|
| Valid success insert | Success |
| Skipped with short error_message | Success |
| Invalid `status` | CHECK violation |
| `user_id` / `task_id` owner mismatch | Trigger exception |
| `error_message` > 500 chars | CHECK violation |

---

## Verification record (applied 2026-05-26)

| Check | Result |
|-------|--------|
| Table `public.trello_sync_logs` | Present |
| RLS | `relrowsecurity = true` |
| Columns | `id`, `user_id`, `task_id`, `status`, `trello_card_id`, `error_message`, `created_at` — **no** credential-like columns |
| Policies | `trello_sync_logs_select_own` (SELECT, authenticated) only |
| Indexes | `trello_sync_logs_pkey`, `trello_sync_logs_user_id_idx`, `trello_sync_logs_task_id_idx`, `trello_sync_logs_created_at_idx`, `trello_sync_logs_user_id_created_at_idx` |
| Grants `anon` | None (SELECT = false) |
| Grants `authenticated` | SELECT only (INSERT/UPDATE/DELETE = false) |
| Grants `service_role` | SELECT, INSERT only (UPDATE/DELETE = false) |
| Trigger | `trello_sync_logs_enforce_task_owner` → `enforce_trello_sync_log_task_owner()` |
| CHECK constraints | `trello_sync_logs_status_allowed`, `trello_sync_logs_error_message_length` |

### Behavioral verification

| Probe | Result |
|-------|--------|
| Valid insert (fake `trello_card_id`) | Passed |
| Invalid `status` | Passed (CHECK) |
| Invalid `error_message` (constraint checks) | Passed |
| Owner `user_id` / `task_id` mismatch | **Skipped/limited** — single auth user in test environment |
| Cross-user authenticated SELECT | **Not run** — no second auth user |
| Test row cleanup | Passed — fake row removed (cleanup via SQL Editor **postgres** role; `service_role` has no DELETE grant) |

Do **not** re-apply this migration on an environment where `public.trello_sync_logs` already exists.

---

## Applying this migration (human gates)

1. **Implementation** — `approved — implement Phase 4A-0` (complete).
2. **Supervisor + Security + Migration Review** — approved for human apply (complete).
3. **Applied on Supabase** — human ran `supabase/migrations/007_trello_sync_logs.sql` in SQL Editor on **2026-05-26** (**Success. No rows returned.**).
4. **Verified** — catalog + behavioral probes (see Verification record above); owner-mismatch / cross-user probes skipped or limited (single auth user).
5. **Phase 4A-1** — implement backend `POST /api/trello/sync` only with **`approved — implement Phase 4A-1`** and **Security Review** on backend/Trello/logging paths.

Do **not** re-apply this migration on an environment where `public.trello_sync_logs` already exists.
