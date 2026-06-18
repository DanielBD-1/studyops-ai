# 015 — Study Tasks Optional Due Date (Phase DASHBOARD-DEPTH-P0)

**Status:** **Applied manually** on Supabase (Phase DASHBOARD-DEPTH-P0 complete; Supervisor Re-review + Security Review approved; catalog + persistence smoke verification passed).  
**Migration file:** `supabase/migrations/015_study_tasks_due_date.sql`  
**Prerequisite:** `005_study_tasks.sql` applied and verified  
**Schema reference:** `docs/database/005-study-tasks-schema-and-rls.md` (Phase 3A-a baseline; see **Later schema extensions** below)

---

## Purpose

Phase DASHBOARD-DEPTH-P0 adds an optional **day-level** calendar due date on `public.study_tasks` so students can set deadlines on manual tasks. **NULL** means no deadline.

**In P0:** SQL migration + backend API + frontend forms/display + tests. **Not** a full deadline-planning or dashboard-intelligence system.

**Phase DASHBOARD-DEPTH-A2 (complete):** Reads **`due_date`** for authenticated-user **aggregate** overdue/due-today counts on **`GET /api/dashboard/stats`**. Migration **015** is **unchanged** — **no** new schema, indexes, due-date filters, sorting, or timezone persistence in A2.

---

## Column

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `due_date` | `date` | NULLABLE, **no default** | Optional user-set calendar due date; existing rows remain **NULL** (no backfill) |

**Column comment (in migration):** *Optional user-set calendar due date (day-level). NULL means no deadline.*

**Not added in migration 015:** indexes, triggers, RLS policy changes, backfill, Trello fields.

---

## API mapping

Express task responses use **camelCase** `dueDate`:

| API field | DB column | Type in JSON |
|-----------|-----------|--------------|
| `dueDate` | `due_date` | `YYYY-MM-DD` string or `null` |

**Create (`POST /api/courses/:courseId/tasks`):**

| Body | Persisted value |
|------|-----------------|
| `dueDate` omitted | `NULL` |
| `dueDate: null` | `NULL` |
| `dueDate: "YYYY-MM-DD"` (valid) | exact calendar date |

**Update (`PATCH /api/tasks/:taskId`):**

| Body | Effect |
|------|--------|
| `dueDate` omitted | preserve existing `due_date` |
| `dueDate: null` | clear (`NULL`) |
| `dueDate: "YYYY-MM-DD"` (valid) | replace with new date |

**Validation:** `backend/src/shared/validation/calendar-date.js` + `taskDueDateSchema` — strict `YYYY-MM-DD`; years **0001–9999**; Gregorian leap-year rules (including century years); impossible dates rejected; **past dates allowed**; empty/malformed/non-string → validation error. **No** implicit `new Date('YYYY-MM-DD')` parsing on the backend.

**Unchanged:** `status` still via **`POST /api/tasks/:taskId/complete`** only; completing a task **preserves** `due_date`; list order remains **`created_at DESC`**.

---

## Date semantics

- **Date-only** calendar value — **not** a timestamp; no timezone stored in the column.
- **Backend:** explicit calendar validation (`isValidIsoCalendarDate`).
- **Frontend:** browser-local calendar-day presentation via `frontend/src/utils/task-due-date.js` for labels (future / today / overdue / completed-neutral; include year when different from today).

---

## Plan import and external systems

| Flow | `dueDate` behavior |
|------|-------------------|
| **Plan import** (`POST /api/study-materials/:materialId/import/tasks`) | Does **not** populate `due_date` — imported rows remain `NULL` |
| **Gemini / document-service plan schema** | **Unchanged** — no generated due dates |
| **Trello sync** | **Unchanged** — no Trello due-date read/write |

---

## Dashboard use of `due_date` (DASHBOARD-DEPTH-A2)

Migration **015** remains the sole schema source for **`due_date`**. **DASHBOARD-DEPTH-A2** adds **read-only aggregate** use on **`GET /api/dashboard/stats`**:

| Aggregate | Rule |
|-----------|------|
| **`overduePendingTasks`** | Caller-owned **pending** tasks with non-null **`due_date` < `deadlineReferenceDate`** |
| **`dueTodayPendingTasks`** | Caller-owned **pending** tasks with **`due_date` = `deadlineReferenceDate`** |
| **`deadlineReferenceDate`** | Effective reference calendar date (optional query **`referenceDate=YYYY-MM-DD`**; omitted → server UTC calendar date; frontend sends browser-local date on each request) |

**Excluded from counts:** completed tasks; null **`due_date`**; future dates; other users' tasks. Response remains **aggregate-only** — no task rows or titles.

**A2 does not add:** new migration; indexes; due-date **filters** or **sorting** on task list APIs; overdue-only or due-today-only **`/tasks`** URL params; stored user timezone; calendar integration; notifications.

See **`docs/IMPLEMENTATION_STATUS.md`** § **DASHBOARD-DEPTH-A2** for recommendation priority, hero CTAs, and **At a glance** UI.

---

## Frontend surfaces (P0)

- **Course tasks** — optional due date on create/edit (`CourseTasksSection`)
- **Global `/tasks`** — optional due date on create/edit (`GlobalTasksSection`)
- **`TaskCard`** — due-date line when set (pending future: `Due Jun 24`; today: `Due today`; overdue pending: `Overdue · Due Jun 10`; completed: neutral `Due Jun 10`; no date: no line)
- **Material related tasks preview** — same presentation rules (`MaterialRelatedTasksSection`)

---

## Explicit non-goals (deferred — separate phase gates)

- **Upcoming deadline window** on dashboard
- Due-date **sorting**, **filtering**, or **URL query parameters** on **`/tasks`** (including overdue-only or due-today-only list filters)
- **Reminders**, **notifications**, **exam dates**, **calendar integration**
- **Stored user timezone** persistence
- **Gemini-generated** due dates
- **Trello** due-date synchronization
- **AI scheduling**

Optional task due dates + A2 dashboard aggregates are **not** a complete deadline-planning system.

---

## Verification (phase gates)

**P0:**

- Backend tests: **533/533**
- Frontend tests: **486/486**
- Frontend build passed
- Migration applied and verified on Supabase; persistence smoke test passed
- Supervisor Re-review approved; Security Review approved

**A2 (dashboard aggregates — no migration change):**

- Backend tests: **541/541**
- Frontend tests: **494/494**
- Frontend build passed
- Supervisor Review **PASS**; Security Review **PASS**; manual smoke **PASS**
