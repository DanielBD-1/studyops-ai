# 008 — Focus Sessions Schema and RLS (Phase 4C-0)

**Status:** **Applied manually** on Supabase (Phase 4C-0 complete; Supervisor + Security + Migration Review approved; catalog + behavioral verification passed on **2026-05-29**).  
**Migration file:** `supabase/migrations/008_focus_sessions.sql`  
**Apply method:** Supabase SQL Editor (not CLI) — **Success. No rows returned.**  
**Prerequisite:** migrations **001–007** applied and verified  
**PRD reference:** Section 7.7 (Focus Session), Section 8.4 (`focus_sessions`), Section 10 (`POST /api/focus`)

---

## Purpose

Phase 4C-0 adds the **database foundation** for Focus Sessions MVP by creating `public.focus_sessions` with:

- one row per **focus session** tied to an owned `study_tasks` row
- **provisional** `duration_minutes` at start (session ceiling / planned Pomodoro length)
- **actual** completed focus minutes after `ended_at` is set (backend overwrites `duration_minutes` on complete — Phase **4C-1**)
- optional **`completed_task`** flag (whether the student chose to mark the task complete when finishing)
- **no** task description, study material content, Trello fields, or credential columns

**In this phase:** SQL migration + this document only. **No** application code.

**Not implemented in Phase 4C-0:**

- **No** `POST /api/focus` or `POST /api/focus/:sessionId/complete` (Phase **4C-1** — Security Review when implemented).
- **No** frontend `/focus/:taskId` page (Phase **4C-2**).
- **No** `GET /api/dashboard/stats` / `totalFocusMinutes` (Phase **5B**).
- **No** focus history UI, timer persistence, notifications, or break-cycle timers.
- **No** `planned_duration_minutes` column (single `duration_minutes` column; semantics change at complete).

**Phase 4C-1 backend obligations (not enforced by this migration alone):**

- Compute **actual** elapsed minutes on complete from `started_at` and `ended_at` (server-side only; **never** trust client-reported elapsed time).
- Clamp actual minutes: minimum **1**, maximum **min(120, session ceiling)** where session ceiling is the value stored at insert.
- Filter all `service_role` access by **`user_id = req.user.id`**.
- Wrong-owner session → neutral **404** “Focus session not found”.
- Do not log task descriptions or study material content when handling focus sessions.

---

## Schema summary

### Table: `public.focus_sessions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | Owner |
| `course_id` | `uuid` | NOT NULL, FK → `public.courses(id)` ON DELETE CASCADE | From task |
| `task_id` | `uuid` | NOT NULL, FK → `public.study_tasks(id)` ON DELETE CASCADE | Focus target |
| `duration_minutes` | `integer` | NOT NULL, CHECK **1–120** | See duration semantics below |
| `completed_task` | `boolean` | NOT NULL, default `false` | Set on complete in 4C-1 |
| `started_at` | `timestamptz` | NOT NULL, default `now()` | Session start |
| `ended_at` | `timestamptz` | NULLABLE | NULL = in progress / abandoned |

### Intentionally absent columns

| Not stored | Reason |
|------------|--------|
| `planned_duration_minutes` | MVP uses one column; ceiling at start, actual at complete |
| Task `title` / `description` | Normalize via `study_tasks`; no duplication |
| Trello / Gemini / credential fields | Out of scope; ADR 004 |
| `updated_at` | Complete via single `UPDATE` setting `ended_at` + `duration_minutes` |

---

## Duration semantics

| Phase | `duration_minutes` meaning | `ended_at` |
|-------|---------------------------|------------|
| **After INSERT (start)** | **Provisional session ceiling** (e.g. 25 from API default). Represents max earnable minutes for this session. | `NULL` |
| **After complete (4C-1)** | **Actual completed focus minutes**, computed server-side from `started_at` → `ended_at`, clamped to **1 … min(120, ceiling)**. Overwrites the provisional value. | Set to completion time |
| **Dashboard (5B+)** | Sum **`duration_minutes`** only where **`ended_at IS NOT NULL`**. In-progress/abandoned rows (`ended_at IS NULL`) are **excluded**. | |

**Client rule:** The browser must **not** send elapsed minutes. Only the backend sets final `duration_minutes` on complete.

---

## Relationships and cascade behavior

### Relationship graph

```text
auth.users(id) = auth.uid()
        │
        ├── focus_sessions(user_id)
        │
        ├── courses(user_id)
        │       └── focus_sessions(course_id)
        │
        └── study_tasks(user_id, course_id)
                └── focus_sessions(task_id)
```

### Cascades

| Delete action | Effect on `focus_sessions` |
|---------------|---------------------------|
| Delete **user** | Session rows deleted (FK `user_id … CASCADE`) |
| Delete **course** | Session rows deleted (FK `course_id … CASCADE`) |
| Delete **study task** | Session rows deleted (FK `task_id … CASCADE`) |

---

## Constraints and triggers

### CHECK constraints

| Constraint | Rule |
|-----------|------|
| `focus_sessions_duration_minutes_range` | `duration_minutes` between **1** and **120** (inclusive) |
| `focus_sessions_ended_at_after_started` | `ended_at IS NULL` OR `ended_at >= started_at` |

### Triggers (defense in depth)

| Trigger | Purpose |
|---------|---------|
| `focus_sessions_enforce_task_owner` | On INSERT/UPDATE, ensures `user_id` and `course_id` match `study_tasks` for `task_id` |

Runs even when RLS is bypassed via `service_role`, so the backend cannot attach sessions to another user’s tasks or mismatched courses.

---

## Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| `focus_sessions_user_id_idx` | `user_id` | Filter by owner |
| `focus_sessions_user_id_ended_at_idx` | `(user_id, ended_at)` | Dashboard-style sums on completed sessions |
| `focus_sessions_task_id_idx` | `task_id` | Lookup sessions per task |
| `focus_sessions_course_id_idx` | `course_id` | Course-scoped queries (consistent with `flashcards`) |

---

## RLS plan and grants

### RLS

`public.focus_sessions` has **RLS enabled**.

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| `focus_sessions_select_own` | SELECT | `authenticated` | `user_id = auth.uid()` |
| `focus_sessions_insert_own` | INSERT | `authenticated` | `user_id = auth.uid()` and owned `course_id` |
| `focus_sessions_update_own` | UPDATE | `authenticated` | Same as insert (USING + WITH CHECK) |

**No DELETE policy** for `authenticated` in MVP.

**Backend (4C-1+):** Inserts/updates via **`service_role`** (bypasses RLS). Application **must** filter every query by **`user_id = req.user.id`**.

### Grants

The migration revokes access from `anon`, `authenticated`, and `service_role`, then grants:

| Role | Grants |
|------|--------|
| `anon` | None |
| `authenticated` | `SELECT`, `INSERT`, `UPDATE` |
| `service_role` | `SELECT`, `INSERT`, `UPDATE` |

**No DELETE** grant in MVP.

### service_role warning

`service_role` bypasses RLS. Triggers enforce task/user/course alignment on INSERT/UPDATE, but the backend must **still** filter by **`user_id`** on SELECT and when loading sessions by `id` for complete.

---

## Security notes

| Topic | Requirement |
|-------|-------------|
| **Cross-user access** | RLS blocks `authenticated` cross-user SELECT/UPDATE; backend uses 404 neutral messages |
| **Trigger** | Prevents mismatched `user_id` / `course_id` / `task_id` even under `service_role` |
| **No secrets** | No API keys, tokens, or credential columns |
| **No content duplication** | No material `content` or task `description` on this table |
| **Logging** | Do not log full task descriptions or session payloads (see `SECURITY.md`) |
| **Frontend** | Future UI must call **Express API only** — not direct `service_role` |

---

## Out of scope (this migration)

- Backend Focus API (`POST /api/focus`, complete endpoint)
- Frontend `/focus/:taskId` page and Pomodoro timer
- Student Dashboard `totalFocusMinutes`
- Admin logs / `api_logs`
- Focus session history list UI
- Timer persistence across refresh
- Browser notifications
- 5-minute break cycle
- Student DELETE of focus rows
- `planned_duration_minutes` column

---

## Applying this migration (human gates)

1. Confirm migrations **001–007** are applied on the target Supabase project.
2. Human approval: **`approved — implement Phase 4C-0`** (implementation in repo) and explicit OK to run SQL on Supabase.
3. Open **Supabase SQL Editor** → paste contents of `supabase/migrations/008_focus_sessions.sql` → run once.
4. Expected: **Success. No rows returned.** (DDL only)
5. Run verification checklist below (catalog + behavioral).
6. Do **not** re-run on an environment where `public.focus_sessions` already exists.

**Applied on Supabase:** **2026-05-29** — migration run in SQL Editor; catalog and behavioral checks passed (see Verification record below).

---

## Verification record (applied 2026-05-29)

| Check | Result |
|-------|--------|
| Table `public.focus_sessions` | Present |
| RLS | `relrowsecurity = true` |
| Columns | `id`, `user_id`, `course_id`, `task_id`, `duration_minutes`, `completed_task`, `started_at`, `ended_at` |
| CHECK constraints | `focus_sessions_duration_minutes_range`, `focus_sessions_ended_at_after_started` |
| Indexes | `focus_sessions_user_id_idx`, `focus_sessions_user_id_ended_at_idx`, `focus_sessions_task_id_idx`, `focus_sessions_course_id_idx` |
| Policies | `focus_sessions_select_own`, `focus_sessions_insert_own`, `focus_sessions_update_own` |
| Grants `authenticated` | SELECT, INSERT, UPDATE only (no DELETE) |
| Grants `service_role` | SELECT, INSERT, UPDATE only (no DELETE) |
| Grants `anon` | None |
| Trigger function | `enforce_focus_session_task_owner` |
| Triggers on table | `focus_sessions_enforce_task_owner` (INSERT, UPDATE) |

### Behavioral verification

| Probe | Result |
|-------|--------|
| Valid insert (owned task, matching `user_id` / `course_id` / `task_id`) | Passed |
| Mismatched `user_id` vs task owner | Rejected (trigger) |
| Mismatched `course_id` vs task course | Rejected (trigger) |
| `DELETE` privilege for `authenticated` | False (no DELETE grant) |
| `DELETE` privilege for `service_role` | False (no DELETE grant) |

Do **not** re-apply this migration on an environment where `public.focus_sessions` already exists.

---

## Manual verification checklist

| # | Check | Expected |
|---|-------|----------|
| 1 | Migration runs without error | No SQL errors |
| 2 | Table exists | `public.focus_sessions` created |
| 3 | Columns | `id`, `user_id`, `course_id`, `task_id`, `duration_minutes`, `completed_task`, `started_at`, `ended_at` |
| 4 | CHECK constraints | `focus_sessions_duration_minutes_range`, `focus_sessions_ended_at_after_started` |
| 5 | Indexes | `focus_sessions_user_id_idx`, `focus_sessions_user_id_ended_at_idx`, `focus_sessions_task_id_idx`, `focus_sessions_course_id_idx` |
| 6 | RLS enabled | `relrowsecurity = true` |
| 7 | Policies | `focus_sessions_select_own`, `focus_sessions_insert_own`, `focus_sessions_update_own` |
| 8 | Grants `anon` | None |
| 9 | Grants `authenticated` | SELECT, INSERT, UPDATE only (no DELETE) |
| 10 | Grants `service_role` | SELECT, INSERT, UPDATE only (no DELETE) |
| 11 | Trigger function | `enforce_focus_session_task_owner` exists |
| 12 | Trigger on table | `focus_sessions_enforce_task_owner` (INSERT, UPDATE) |
| 13 | Valid insert (owned task, matching user/course/task) | Succeeds |
| 14 | Mismatched `user_id` vs task owner | Rejected (trigger) |
| 15 | Mismatched `course_id` vs task course | Rejected (trigger) |
| 16 | `duration_minutes` out of range (0 or 121) | Rejected (CHECK) |
| 17 | `ended_at` before `started_at` | Rejected (CHECK) |
| 18 | SELECT own rows (`authenticated`) | Allowed |
| 19 | SELECT other user rows (`authenticated`) | Blocked by RLS (0 rows) |
| 20 | service_role wrong-owner insert | Rejected (trigger) |

### Example catalog queries (read-only)

```sql
-- Table + RLS
select relname, relrowsecurity
from pg_class
where relname = 'focus_sessions';

-- Policies
select polname, polcmd
from pg_policy
where polrelid = 'public.focus_sessions'::regclass;

-- Grants
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'focus_sessions'
order by grantee, privilege_type;
```

---

## Follow-up phases

| Phase | Work |
|-------|------|
| **4C-1** | Backend `POST /api/focus`, `POST /api/focus/:sessionId/complete`, actual-minute calculation, tests |
| **4C-2** | Frontend `/focus/:taskId`, Start Focus links, timer UX |
| **4C-3** | Manual smoke + `IMPLEMENTATION_STATUS` / `AGENT_MEMORY` / `README` (on `approved — Phase 4C-3 complete`) |
| **5B** | `totalFocusMinutes` = `SUM(duration_minutes)` where `user_id` match and `ended_at IS NOT NULL` |
