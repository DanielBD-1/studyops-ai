# 003 — Study Materials Schema and RLS (Phase 2A)

**Status:** Draft — **not applied** to any Supabase project yet.  
**Migration file:** `supabase/migrations/003_study_materials.sql`  
**Prerequisite:** `001_profiles.sql` and `002_courses.sql` applied and verified  
**PRD reference:** Section 3 (study material input), Section 7.3 (generate flow — later), Section 7.10 (study text validation), Section 9 (`study_materials`)

---

## Purpose

Phase 2A adds `public.study_materials`, the first table for stored study content under a course. Students access materials only when the parent course belongs to them. This step includes **RLS policies** and **explicit Data API grants** because the Supabase project has **“Automatically expose new tables” disabled**.

**Not in this phase:** study materials API routes, paste/generate UI, Gemini output columns, `study_tasks` / `flashcards`, Trello, dashboard stats, admin policies, applying this SQL.

---

## PRD refinement (deliberate)

PRD Section 9 lists `study_materials` with `user_id`, `input_text`, `summary`, `key_topics`, and `difficulty`. Phase 2A **narrows** the schema intentionally:

| PRD concept | Phase 2A implementation |
|-------------|-------------------------|
| Ownership via user | **No `user_id` on `study_materials`** — ownership is **course-chain only** |
| `input_text` / paste body (`studyText` in API) | Single column **`content`** (do not add `input_text`) |
| `summary`, `key_topics`, `difficulty` | **Deferred** until a Gemini/generation phase |
| `source_type` upload / generated | **Deferred** — only `manual` and `paste` in 2A |

This avoids duplicated ownership fields and keeps migration scope to **storage of pasted material** under an owned course.

---

## Identity and ownership

### Course-chain only

```text
auth.users(id) = auth.uid() = profiles.id
        │
        └── courses(user_id)     ← direct owner
                │
                └── study_materials(course_id)   ← indirect owner (no user_id column)
```

| Rule | Detail |
|------|--------|
| **Parent** | `study_materials.course_id` → `public.courses(id)` ON DELETE CASCADE |
| **Owner check** | `courses.user_id = auth.uid()` |
| **No `user_id`** | On `study_materials`; do not add for 2A |

The backend (future Study Materials API) must treat `req.user.id` as `courses.user_id` and ensure **every** service-role query on `study_materials` proves the parent course belongs to the current user (see below).

---

## Table: `public.study_materials`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | |
| `course_id` | `uuid` | NOT NULL, FK → `public.courses(id)` ON DELETE CASCADE | Deleting course deletes materials |
| `title` | `text` | NOT NULL, CHECK trimmed **3–150** | UI label |
| `content` | `text` | NOT NULL, CHECK trimmed **100–50,000** | PRD paste / `studyText` rules |
| `source_type` | `text` | NOT NULL, DEFAULT `'manual'`, CHECK `manual` \| `paste` | No `upload` / `generated_later` in 2A |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | `BEFORE UPDATE` trigger |

**Indexes:**

| Index | Columns | Purpose |
|-------|---------|---------|
| `study_materials_course_id_idx` | `(course_id)` | Materials per course |
| `study_materials_course_id_created_at_idx` | `(course_id, created_at desc)` | Recent-first per course |

**Trigger:** `study_materials_set_updated_at` → `set_study_materials_updated_at()` with `search_path = public`.

---

## GRANT vs RLS (both required)

| Layer | What it controls | Without it |
|-------|------------------|------------|
| **`GRANT`** | Whether `authenticated` / `service_role` may **access the table at all** via Supabase Data API | Permission denied on the table |
| **RLS** | **Which rows** may be read or written after access is granted | Cross-user data exposure |

**Both are required:**

1. Explicit `GRANT SELECT, INSERT, UPDATE, DELETE` to `authenticated` and `service_role` (no `GRANT ALL`).
2. RLS policies using `EXISTS` on `public.courses` where `courses.user_id = auth.uid()`.

**`anon`:** `REVOKE ALL` — no anonymous access.

**`service_role`:** Has table `GRANT` but **bypasses RLS**. Application code must enforce course ownership on every query.

---

## Service-role rule (future API)

When the backend uses `getSupabaseAdmin()` on `study_materials`:

- Every `SELECT` / `INSERT` / `UPDATE` / `DELETE` must ensure the material’s **parent course** has `courses.user_id = req.user.id`.
- Typical patterns: filter by `course_id` only after verifying that course id belongs to the user, or join `courses` with `.eq('courses.user_id', req.user.id)`.
- **Never** unfiltered `from('study_materials')` reads or writes.
- Wrong-owner or missing rows should surface as **404** at the API layer (match courses IDOR behavior).

---

## Row Level Security (Phase 2A)

RLS is **enabled** on `public.study_materials`. Policies apply to **`authenticated`** only.

**Ownership predicate** (used in all policies):

```sql
exists (
  select 1
  from public.courses c
  where c.id = study_materials.course_id
    and c.user_id = auth.uid()
)
```

| Operation | Policy | Rule |
|-----------|--------|------|
| **SELECT** | `study_materials_select_own_course` | `USING (predicate)` |
| **INSERT** | `study_materials_insert_own_course` | `WITH CHECK (predicate)` — cannot attach to another user’s course |
| **UPDATE** | `study_materials_update_own_course` | `USING` and `WITH CHECK (predicate)` — cannot update others’ rows or move `course_id` to another user’s course |
| **DELETE** | `study_materials_delete_own_course` | `USING (predicate)` |

**Not included:** admin “view all materials” policies.

---

## Data API grants (in migration)

```sql
revoke all on table public.study_materials from anon;

grant select, insert, update, delete on table public.study_materials to authenticated;
grant select, insert, update, delete on table public.study_materials to service_role;
```

---

## Applying this migration (human gates)

This file is a **draft**. Do **not** assume it has been run until documented in `docs/AGENT_MEMORY.md`.

1. **Draft created** — `approved — create study materials migration draft`.
2. **Apply to Supabase** — separate approval, e.g. `approved — apply study materials migration`, before SQL Editor apply.
3. **Verify** — checklist below.

Do **not** run Supabase CLI apply in an agent session unless explicitly directed.

---

## Verification checklist (after apply)

Run as an authenticated student (Supabase SQL Editor with JWT, or app client after API exists).

| # | Check | Expected |
|---|--------|----------|
| 1 | Table exists | `public.study_materials` present |
| 2 | RLS enabled | `relrowsecurity = true` |
| 3 | Policies | `study_materials_select_own_course`, `_insert_`, `_update_`, `_delete_` |
| 4 | `anon` grants | No privileges on `public.study_materials` |
| 5 | `authenticated` grants | `SELECT`, `INSERT`, `UPDATE`, `DELETE` only |
| 6 | `service_role` grants | `SELECT`, `INSERT`, `UPDATE`, `DELETE` only (no `GRANT ALL`) |
| 7 | FK | Invalid `course_id` → FK error |
| 8 | INSERT own course | Valid title, content, `manual` or `paste` → success |
| 9 | INSERT other user’s course | Denied by RLS |
| 10 | SELECT | Only materials for courses where `user_id = auth.uid()` |
| 11 | UPDATE own row | Success; `updated_at` changes |
| 12 | UPDATE `course_id` to other user’s course | Denied (`WITH CHECK`) |
| 13 | UPDATE other user’s material | Denied |
| 14 | DELETE own material | Success |
| 15 | DELETE other user’s material | Denied |
| 16 | Title CHECK | Trimmed length &lt; 3 or &gt; 150 → constraint error |
| 17 | Content CHECK | Trimmed length &lt; 100 or &gt; 50000 → constraint error |
| 18 | `source_type` CHECK | Value not in (`manual`, `paste`) → constraint error |
| 19 | CASCADE | Delete course → its materials deleted |
| 20 | Regression | `profiles`, `courses`, auth flows unchanged |

---

## Out of scope (Phase 2A)

- `GET/POST/PATCH/DELETE` study materials API, frontend paste/generate UI
- Gemini columns (`summary`, `key_topics`, `difficulty`) and `POST /api/courses/:id/generate`
- `source_type` values `upload`, `generated_later` (later migration when approved)
- `study_tasks`, `flashcards`, `focus_sessions`, `trello_sync_logs`, `api_logs` tables
- npm packages, applying migration in CI, admin RLS policies

---

## Related artifacts

- `supabase/migrations/002_courses.sql` — parent table and ownership model
- `docs/database/002-courses-schema-and-rls.md`
- `docs/PRD.md` §7.10, §9
- `SECURITY.md` — service-role and RLS expectations
