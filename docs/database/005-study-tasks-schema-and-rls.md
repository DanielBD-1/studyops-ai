# 005 — Study Tasks Schema and RLS (Phase 3A-a)

**Status:** **Applied manually** on Supabase (Phase 3A-a complete; Supervisor + Security Review approved; catalog + behavioral verification passed).
**Migration file:** `supabase/migrations/005_study_tasks.sql`
**Prerequisite:** `001_profiles.sql`, `002_courses.sql`, and `003_study_materials.sql` applied and verified
**PRD reference:** Section 9 (`study_tasks`), Section 7 (study tasks — management deferred until 3A-b/c), Section 9.5 (permissions)

---

## Purpose

Phase 3A-a adds `public.study_tasks`, the **normalized manual study task** table so StudyOps is useful without Gemini. Students will own tasks via `user_id`, scoped to a `course_id`, with an optional `material_id` link.

**In this phase:** SQL migration + this document only.

**Not in this phase:** backend REST API (3A-b), frontend UI (3A-c/d), AI plan import into rows, flashcards, Trello sync, focus sessions, dashboard metrics, admin policies.

---

## Phase 3A product rules (Supervisor)

| Field | Phase 3A-a storage | Phase 3A-b/c/d behavior |
|-------|-------------------|-------------------------|
| `difficulty` | Column present; default `'medium'` | **Not** accepted on create/PATCH; **not** shown as editable in UI |
| `tags` | Column present; default `'{}'` | **Not** accepted on create/PATCH; **not** shown as editable in UI |
| Editable later | — | Requires **separate explicit product refinement approval** |

Manual tasks created in later phases should set `difficulty = 'medium'` and `tags = '{}'` server-side unless a future import slice populates them.

---

## Identity and ownership

### `user_id` + `course_id` + optional `material_id`

```text
auth.users(id) = auth.uid() = profiles.id
        │
        ├── study_tasks(user_id)              ← direct owner
        │
        └── courses(user_id)
                │
                ├── study_materials(course_id)
                │
                └── study_tasks(course_id, material_id nullable)
```

| Rule | Detail |
|------|--------|
| **Owner column** | `study_tasks.user_id` = `auth.uid()` |
| **Course scope** | Every task has `course_id`; must match `courses.user_id` |
| **Material link** | `material_id` optional; when set, `study_materials.course_id` must equal `study_tasks.course_id` |
| **Triggers** | Enforce `user_id` ↔ `courses.user_id` and material/course alignment on INSERT/UPDATE (including service_role) |
| **Delete material** | `material_id` → `SET NULL` (task remains on course) |
| **Delete course** | Tasks deleted (`ON DELETE CASCADE`) |

The backend (Phase 3A-b) must use **service role** only on the server, set `user_id` from JWT (never from client body), filter every query with `.eq('user_id', req.user.id)`, verify course/material ownership before writes, and return **neutral 404** `"Task not found"` for wrong-owner or missing ids.

The **frontend** must **not** write tasks via Supabase client — all access through Express API with Bearer JWT.

---

## Table: `public.study_tasks`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | Owner |
| `course_id` | `uuid` | NOT NULL, FK → `courses(id)` ON DELETE CASCADE | |
| `material_id` | `uuid` | NULLABLE, FK → `study_materials(id)` ON DELETE SET NULL | Optional material scope |
| `title` | `text` | NOT NULL, CHECK trim **3–200** | |
| `description` | `text` | NOT NULL, DEFAULT `''`, CHECK trim **0–1000** | |
| `priority` | `text` | NOT NULL, DEFAULT `'medium'`, CHECK `low` \| `medium` \| `high` | |
| `estimated_minutes` | `integer` | NOT NULL, CHECK **5–480** | Required on insert (no DB default) |
| `difficulty` | `text` | NOT NULL, DEFAULT `'medium'`, CHECK `easy` \| `medium` \| `hard` | Stored; not editable in 3A-b/c/d |
| `tags` | `text[]` | NOT NULL, DEFAULT `'{}'`, CHECK `cardinality <= 5` | Stored; not editable in 3A-b/c/d |
| `status` | `text` | NOT NULL, DEFAULT `'pending'`, CHECK `pending` \| `completed` | |
| `source` | `text` | NOT NULL, DEFAULT `'manual'`, CHECK **`manual` or `plan`** (Phase **10B** via `009_plan_source_import_dedupe.sql`) | `manual` for user-created tasks; `plan` for material-scoped AI plan imports |
| `trello_card_id` | `text` | NULLABLE | No sync in 3A |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | `BEFORE UPDATE` trigger |

**Indexes:**

| Index | Columns | Purpose |
|-------|---------|---------|
| `study_tasks_user_id_created_at_idx` | `(user_id, created_at desc)` | Global task list per user |
| `study_tasks_user_id_status_idx` | `(user_id, status)` | Filter pending/completed |
| `study_tasks_course_id_created_at_idx` | `(course_id, created_at desc)` | Course task list |
| `study_tasks_material_id_idx` | `(material_id)` WHERE `material_id is not null` | Material-scoped lookups |
| `study_tasks_plan_import_dedupe_idx` | `(user_id, material_id, lower(trim(title)))` WHERE `source = 'plan' AND material_id IS NOT NULL` | Phase **10B** — race-safe dedupe for plan imports (trimmed, case-insensitive title per user per material) |

**Triggers:**

| Trigger | Function | Purpose |
|---------|----------|---------|
| `study_tasks_set_updated_at` | `set_study_tasks_updated_at()` | Maintain `updated_at` on UPDATE |
| `study_tasks_enforce_user_course_owner` | `enforce_study_task_user_course_owner()` | `user_id` must equal `courses.user_id` for `course_id` |
| `study_tasks_enforce_course_material_match` | `enforce_study_task_course_material_match()` | `material_id` must belong to `course_id` when not null |

---

## GRANT vs RLS (both required)

| Layer | What it controls |
|-------|------------------|
| **`GRANT`** | Whether `authenticated` / `service_role` may access the table via Supabase Data API |
| **RLS** | Which rows `authenticated` may see or change |

**Both are required:**

1. `REVOKE ALL` from `anon`, `authenticated`, `service_role`; then `GRANT SELECT, INSERT, UPDATE, DELETE` to `authenticated` and `service_role` only (no `GRANT ALL`).
2. RLS policies: own-row `user_id = auth.uid()` plus course ownership and material/course alignment on INSERT/UPDATE.

**`anon`:** No privileges.

**`service_role`:** Table grants for backend; **bypasses RLS**. Application must filter by `user_id` on every query.

---

## Row Level Security (Phase 3A-a)

RLS is **enabled** on `public.study_tasks`. Policies apply to **`authenticated`** only.

| Operation | Policy | Rule |
|-----------|--------|------|
| **SELECT** | `study_tasks_select_own` | `user_id = auth.uid()` |
| **INSERT** | `study_tasks_insert_own` | `user_id = auth.uid()` AND course owned AND (no material OR material in course) |
| **UPDATE** | `study_tasks_update_own` | `USING (user_id = auth.uid())` AND `WITH CHECK` same as INSERT alignment |
| **DELETE** | `study_tasks_delete_own` | `user_id = auth.uid()` |

**Not included:** admin “view all tasks” policies.

---

## Data API grants (in migration)

```sql
revoke all on table public.study_tasks from anon;
revoke all on table public.study_tasks from authenticated;
revoke all on table public.study_tasks from service_role;

grant select, insert, update, delete on table public.study_tasks to authenticated;
grant select, insert, update, delete on table public.study_tasks to service_role;
```

---

## Delete cascade behavior

| Action | Effect on `study_tasks` |
|--------|------------------------|
| Delete **user** | Tasks deleted (FK on `user_id`) |
| Delete **course** | Tasks deleted (FK CASCADE on `course_id`) |
| Delete **study material** | `material_id` set to NULL; task row kept |

---

## Security notes

| Topic | Requirement |
|-------|-------------|
| **Ownership** | Backend sets `user_id` from JWT; never trust client `userId` |
| **Service role** | Every `from('study_tasks')` query must include `.eq('user_id', req.user.id)` |
| **IDOR** | Wrong owner or missing task → **404** at API (not 403) |
| **No unfiltered selects** | Never `select('*')` on `study_tasks` without user filter |
| **Secrets** | Service role never in frontend / `VITE_*` |
| **AI plans** | Do not change `material_generated_plans`; plan JSON tasks remain read-only display |
| **Logging** | Do not log full task bodies at scale; no material `content` in task endpoints |
| **Phase 3A-b pitfalls** | Reject `difficulty`, `tags`, `status`, `userId`, `courseId` in PATCH/create body; use defaults for manual create |

---

## Pitfalls for Phase 3A-b backend (checklist)

1. Filter **every** service-role query with `user_id = req.user.id`.
2. On create, set `user_id` from JWT; default `difficulty = 'medium'`, `tags = '{}'`, `source = 'manual'`, `status = 'pending'`.
3. Do **not** expose PATCH fields for `difficulty` or `tags`.
4. Complete task via dedicated endpoint — not PATCH `status` (per PRD).
5. Verify `course_id` owned before insert; if `materialId` provided, verify material belongs to course.
6. Return **404** `"Task not found"` for cross-user id probes.
7. Do not join or return `study_materials.content` or `material_generated_plans.plan` from task routes.

---

## Applying this migration (human gates)

1. **Draft created** — `approved — implement Phase 3A-a study_tasks schema and RLS` (complete).
2. **Applied on Supabase** — human ran `supabase/migrations/005_study_tasks.sql` in SQL Editor (**Success. No rows returned.**).
3. **Verified** — catalog queries + behavioral probes (see below); documented in `docs/AGENT_MEMORY.md` on `approved — finalize Phase 3A-a study_tasks schema and RLS docs/memory only`.

Do **not** re-apply this migration on an environment where `public.study_tasks` already exists.

---

## Verification record (applied)

| Check | Result |
|-------|--------|
| Table `public.study_tasks` | Present |
| RLS | `relrowsecurity = true` |
| Policies | `study_tasks_select_own`, `study_tasks_insert_own`, `study_tasks_update_own`, `study_tasks_delete_own` |
| Indexes | `study_tasks_pkey`, `study_tasks_user_id_created_at_idx`, `study_tasks_user_id_status_idx`, `study_tasks_course_id_created_at_idx`, `study_tasks_material_id_idx` (partial) |
| Grants `authenticated` | SELECT, INSERT, UPDATE, DELETE only |
| Grants `service_role` | SELECT, INSERT, UPDATE, DELETE only |
| Grants `anon` | None |
| Trigger functions | `set_study_tasks_updated_at`, `enforce_study_task_user_course_owner`, `enforce_study_task_course_material_match` |
| Behavioral probes | CHECK constraints, integrity triggers, `updated_at` trigger — passed |

---

## Verification checklist (after apply)

Run as an authenticated student (Supabase SQL Editor with JWT, or app after Phase 3A-b API exists).

| # | Check | Expected |
|---|--------|----------|
| 1 | Table exists | `public.study_tasks` present |
| 2 | RLS enabled | `relrowsecurity = true` |
| 3 | Policies | `_select_`, `_insert_`, `_update_`, `_delete_` own user |
| 4 | `anon` grants | No privileges |
| 5 | `authenticated` grants | `SELECT`, `INSERT`, `UPDATE`, `DELETE` only |
| 6 | `service_role` grants | Same four privileges (no `GRANT ALL`) |
| 7 | Title CHECK | Trim length &lt; 3 or &gt; 200 → constraint error |
| 8 | `estimated_minutes` CHECK | &lt; 5 or &gt; 480 → constraint error |
| 9 | `source` CHECK | Value not in (`manual`, `plan`) → constraint error (after Phase **10B** via `009_plan_source_import_dedupe.sql`; pre-10B only `manual` allowed) |
| 10 | User/course trigger | `user_id` not matching `courses.user_id` → trigger error |
| 11 | Material/course trigger | `material_id` from another course → trigger error |
| 12 | INSERT own course | Valid row → success |
| 13 | INSERT other user’s course | Denied by RLS |
| 14 | SELECT | Only own `user_id` rows |
| 15 | UPDATE own row | Success; `updated_at` changes |
| 16 | DELETE own row | Success |
| 17 | CASCADE | Delete course → tasks deleted |
| 18 | SET NULL | Delete material → `material_id` null, task remains |
| 19 | Regression | `profiles`, `courses`, `study_materials`, `material_generated_plans` unchanged |

---

## Out of scope (Phase 3A-a)

- Backend `tasks` module and REST routes (3A-b)
- Frontend task UI (3A-c/d)
- Editing `difficulty` / `tags` via API or UI
- AI import from `material_generated_plans.plan`
- `flashcards`, `trello_sync_logs`, focus sessions
- Kanban/board status values beyond pending/completed
- Live Gemini, Trello, or document-service changes

---

## Later schema extensions

| Migration | Column | Document |
|-----------|--------|----------|
| **015** (`015_study_tasks_due_date.sql`) | `due_date date null` — optional day-level due date (**DASHBOARD-DEPTH-P0**) | `docs/database/015-study-tasks-due-date.md` |

The Phase 3A-a table definition above is the **005 migration baseline**. **`due_date`** was added in migration **015** and is **not** part of the original 3A-a scope.

---

## Related artifacts

- `supabase/migrations/002_courses.sql`, `003_study_materials.sql` — parents
- `docs/database/002-courses-schema-and-rls.md`, `003-study-materials-schema-and-rls.md`
- `backend/src/shared/validation/generated-plan.schema.js` — future import shape alignment (not wired in 3A-a)
- `SECURITY.md` — service role and Security Review triggers
- `docs/IMPLEMENTATION_STATUS.md` — update after apply + later API phases
