# 001 — Profiles Schema and RLS (Phase 1C)

**Status:** **Applied manually** on Supabase (Phase 1C complete; catalog + behavioral verification passed on **2026-05-20**).
**Migration file:** `supabase/migrations/001_profiles.sql`  
**PRD reference:** Section 9 (`profiles`), Section 7.1 (registration), Section 9.5 (permissions)

---

## Purpose

Phase 1C adds the first application table: `public.profiles`. It extends Supabase Auth with an app-level `role` (`student` | `admin`). No other PRD tables, auth routes, or UI are included in this step.

---

## Identity model

### `profiles.id` = Supabase Auth user id

| Rule | Detail |
|------|--------|
| **Primary key** | `public.profiles.id` |
| **Foreign key** | `references auth.users(id) on delete cascade` |
| **Same uuid everywhere** | `profiles.id` = JWT `sub` = `auth.uid()` in RLS and PostgREST |
| **Not a separate `user_id` on profiles** | PRD lists `user_id` on *other* tables, not on `profiles` itself |

### Future user-owned tables

Tables such as `courses`, `study_tasks`, and `flashcards` (later migrations) will use a column **`user_id`** where:

```text
user_id = auth.uid() = profiles.id = auth.users.id
```

The backend (later) should treat `req.user.id` from the JWT as that same uuid.

```text
auth.users(id)
    │
    │  1:1
    ▼
public.profiles(id, email, role, created_at)
    │
    │  same uuid referenced as user_id
    ▼
future: courses.user_id, study_tasks.user_id, ...
```

---

## Table: `public.profiles`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, FK → `auth.users(id)` ON DELETE CASCADE | Supabase Auth user id |
| `email` | `text` | NOT NULL | Set from `auth.users.email` at signup via trigger |
| `role` | `text` | NOT NULL, DEFAULT `'student'`, CHECK (`student`, `admin`) | Never `admin` from self-registration |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Index (optional):** `profiles_role_idx` on `(role)` for admin/reporting via service role.

---

## Row creation and admin promotion

### Automatic (students)

1. User signs up through Supabase Auth (future: app register flow).
2. Row inserted into `auth.users`.
3. Trigger `on_auth_user_created` runs `public.handle_new_user()`.
4. Function inserts `public.profiles` with `role = 'student'`.

The trigger uses **SECURITY DEFINER** and **`SET search_path = public`** so it can insert into `public.profiles` safely.

### Manual (admins only)

PRD: admins are **not** self-registered. To create an admin:

1. Create the user in Supabase Auth (or use an existing auth user).
2. Promote via **one** of:
   - Supabase dashboard / SQL editor: `UPDATE public.profiles SET role = 'admin' WHERE id = '<auth-user-uuid>';`
   - Backend script using **service role** (`getSupabaseAdmin()` in StudyOps backend)

Never expose service role to the frontend (`VITE_*`).

---

## Row Level Security (Phase 1C)

RLS is **enabled** on `public.profiles`.

| Operation | Client (`anon` / `authenticated`) | Policy |
|-----------|-----------------------------------|--------|
| **SELECT** | Own row only | `profiles_select_own`: `auth.uid() = id` |
| **INSERT** | Denied | No INSERT policy (default deny) |
| **UPDATE** | Denied | No UPDATE policy in Phase 1C |
| **DELETE** | Denied | No DELETE policy |

### Frontend (anon key + session)

After auth exists in a later phase, the browser Supabase client (`getSupabaseBrowser()`) may **read the signed-in user’s own profile** under `profiles_select_own`. It cannot insert, update, or delete profile rows via client policies in this migration.

### Backend (service role)

`getSupabaseAdmin()` bypasses RLS. Use only on the server for controlled operations (e.g. admin promotion, seeds, future register orchestration). Never ship service role to the client.

### Profile editing

**Deferred.** Email or role changes via client UPDATE are intentionally not allowed in Phase 1C. A later phase may add UPDATE policies and/or backend-only updates.

---

## Trigger summary

| Object | Description |
|--------|-------------|
| `public.handle_new_user()` | `AFTER INSERT` on `auth.users`; inserts profile with `role = 'student'` |
| `on_auth_user_created` | Calls `handle_new_user()` for each new auth user |

---

## Applying this migration (human gates)

1. **Draft created** — `approved — create profiles migration` (complete).
2. **Applied on Supabase** — human ran `supabase/migrations/001_profiles.sql` in SQL Editor on **2026-05-20**.
3. **Verified** — catalog + behavioral probes, documented in `docs/AGENT_MEMORY.md`.

Do **not** re-apply this migration on an environment where `public.profiles` already exists.

---

## Out of scope (Phase 1C)

- `courses`, `study_materials`, `study_tasks`, `flashcards`, `focus_sessions`, `trello_sync_logs`, `api_logs`
- Auth API routes and login/register UI
- Gemini, Trello, dashboard, admin app modules
- INSERT/UPDATE/DELETE RLS on profiles (except via trigger + service role)

---

## Related artifacts

- ADR 003 — Zod validation (app layer; complements DB constraints)
- `docs/AGENT_MEMORY.md` — RLS required before frontend data access; service role server-only
- Phase 1B — `getSupabaseAdmin()` / `getSupabaseBrowser()` prepared, not wired to profiles yet
