# 002 — Courses Schema and RLS (Phase 1E)

**Status:** **Applied manually** on Supabase (Phase 1E complete; catalog + behavioral verification passed on **2026-05-20**).
**Migration file:** `supabase/migrations/002_courses.sql`  
**Prerequisite:** `001_profiles.sql` applied and verified  
**PRD reference:** Section 9 (`courses`), Section 7.2 (create course), Section 9.5 (permissions), Section 10.4 (title validation)

---

## Purpose

Phase 1E adds `public.courses`, the first user-owned content table. Students own courses via `user_id`. This step includes **RLS policies** and **explicit Data API grants** because the Supabase project has **“Automatically expose new tables” disabled**.

**Not in this phase:** course API routes, course UI, `study_materials` / `study_tasks` / `flashcards`, Gemini, Trello, dashboard stats, admin policies.

---

## Identity and ownership

### `courses.user_id` = `auth.uid()` = `profiles.id`

| Rule | Detail |
|------|--------|
| **Owner column** | `public.courses.user_id` |
| **Foreign key** | `references auth.users(id) on delete cascade` |
| **Same uuid** | `courses.user_id` = JWT `sub` = `auth.uid()` = `profiles.id` |
| **Profiles** | `profiles` has **no** `user_id`; only `id` (= auth user id) |

```text
auth.users(id)
    │
    ├── 1:1 ── public.profiles(id)
    │
    └── 1:N ── public.courses(user_id)
```

The backend (later, Courses API phase) must treat `req.user.id` from the JWT as `courses.user_id` and filter every service-role query with `.eq('user_id', req.user.id)` even though RLS is bypassed by the service role.

---

## Table: `public.courses`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | Course id for `/courses/:id` later |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | Owner |
| `title` | `text` | NOT NULL, CHECK trimmed length 3–100 | PRD §10.4; app Zod in API phase |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Set on UPDATE via trigger |

**Indexes:**

| Index | Columns | Purpose |
|-------|---------|---------|
| `courses_user_id_idx` | `(user_id)` | List courses for current user |
| `courses_user_id_created_at_idx` | `(user_id, created_at desc)` | Ordered list by recency |

**Trigger:** `courses_set_updated_at` → `set_courses_updated_at()` sets `updated_at = now()` on `BEFORE UPDATE`.

---

## GRANT vs RLS (both required)

This project does **not** auto-expose new tables to the Data API. For `public.courses` you need **two** layers:

| Layer | What it controls | Without it |
|-------|------------------|------------|
| **`GRANT`** | Whether role `authenticated` (or `service_role`) may **access the table at all** via Supabase PostgREST / client SDK | Permission denied on the table, even with a valid JWT and correct RLS policies |
| **RLS** | **Which rows** that role may read or write after table access is granted | User could see or change every row granted by table privileges |

**Both are required:**

1. `GRANT SELECT, INSERT, UPDATE, DELETE … TO authenticated` — signed-in users can reach `public.courses` through the Data API.
2. RLS policies with `auth.uid() = user_id` — each user only sees and mutates their own courses.

**`anon`:** The migration **does not grant** anything to `anon` and includes `REVOKE ALL ON public.courses FROM anon` for clarity. Anonymous clients cannot access courses via the Data API.

**`service_role`:** Explicit `GRANT` for backend `getSupabaseAdmin()`. Service role **bypasses RLS**; the application must still filter by `user_id = req.user.id` in code (same rule as profiles).

---

## Row Level Security (Phase 1E)

RLS is **enabled** on `public.courses`. Policies apply to role **`authenticated`** only.

| Operation | Policy | Rule |
|-----------|--------|------|
| **SELECT** | `courses_select_own` | `auth.uid() = user_id` |
| **INSERT** | `courses_insert_own` | `WITH CHECK (auth.uid() = user_id)` |
| **UPDATE** | `courses_update_own` | `USING` and `WITH CHECK`: `auth.uid() = user_id` |
| **DELETE** | `courses_delete_own` | `auth.uid() = user_id` |

**Not included:** admin “view all courses” policies (deferred; admin uses service role with explicit filters in a later phase).

---

## Data API grants (in migration)

```sql
revoke all on table public.courses from anon;

grant select, insert, update, delete on table public.courses to authenticated;
grant select, insert, update, delete on table public.courses to service_role;
```

---

## Applying this migration (human gates)

1. **Draft created** — `approved — create courses migration draft` (complete).
2. **Applied on Supabase** — human ran `supabase/migrations/002_courses.sql` in SQL Editor on **2026-05-20**.
3. **Verified** — catalog + behavioral probes; documented in `docs/AGENT_MEMORY.md`.

Do **not** re-apply this migration on an environment where `public.courses` already exists.

---

## Verification checklist (after apply)

Run as an authenticated student (Supabase SQL Editor with JWT, or app client after Courses API exists).

| # | Check | Expected |
|---|--------|----------|
| 1 | Table exists | `public.courses` present |
| 2 | RLS enabled | `relrowsecurity = true` on `courses` |
| 3 | `anon` grants | No privileges on `public.courses` for `anon` |
| 4 | `authenticated` grants | `SELECT`, `INSERT`, `UPDATE`, `DELETE` on `public.courses` |
| 5 | Insert own course | `user_id = auth.uid()`, valid title → success |
| 6 | Insert other user’s `user_id` | Denied by RLS |
| 7 | Select | Only rows where `user_id = auth.uid()` |
| 8 | Update own row | Success; `updated_at` changes |
| 9 | Update other user’s row | Denied |
| 10 | Delete own row | Success |
| 11 | Delete other user’s row | Denied |
| 12 | Title CHECK | Title &lt; 3 or &gt; 100 chars (trimmed) → constraint error |
| 13 | Profiles/auth | No regression on `001_profiles` / auth flows |

---

## Out of scope (Phase 1E)

- `study_materials`, `study_tasks`, `flashcards`, `focus_sessions`, `trello_sync_logs`, `api_logs`
- `GET/POST /api/courses`, course list UI, generate flow
- Gemini, Trello, dashboard aggregates, admin modules
- npm packages, Supabase CLI apply in agent session

---

## Related artifacts

- `supabase/migrations/001_profiles.sql` — identity and `profiles.id` model
- `docs/database/001-profiles-schema-and-rls.md`
- `docs/PRD.md` §9, §9.5, §10.4
- `docs/workflows/phase-1-foundation-workflow.md` — Step 5 (Courses API/UI) follows apply + approval
