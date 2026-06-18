# 015 — Study Tasks Optional Due Date (Phase DASHBOARD-DEPTH-P0)

**Status:** **Applied manually** on Supabase (Phase DASHBOARD-DEPTH-P0 complete; Supervisor Re-review + Security Review approved; catalog + persistence smoke verification passed).  
**Migration file:** `supabase/migrations/015_study_tasks_due_date.sql`  
**Prerequisite:** `005_study_tasks.sql` applied and verified  
**Schema reference:** `docs/database/005-study-tasks-schema-and-rls.md` (Phase 3A-a baseline; see **Later schema extensions** below)

---

## Purpose

Phase DASHBOARD-DEPTH-P0 adds an optional **day-level** calendar due date on `public.study_tasks` so students can set deadlines on manual tasks. **NULL** means no deadline.

**In this phase:** SQL migration + backend API + frontend forms/display + tests. **Not** a full deadline-planning or dashboard-intelligence system.

---

## Column

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `due_date` | `date` | NULLABLE, **no default** | Optional user-set calendar due date; existing rows remain **NULL** (no backfill) |

**Column comment (in migration):** *Optional user-set calendar due date (day-level). NULL means no deadline.*

**Not added in migration 015:** indexes, triggers, RLS policy changes, backfill, dashboard aggregates, Trello fields.

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
| **Dashboard recommendations** | **Unchanged** — hero rules do not use task due dates |

---

## Frontend surfaces (P0)

- **Course tasks** — optional due date on create/edit (`CourseTasksSection`)
- **Global `/tasks`** — optional due date on create/edit (`GlobalTasksSection`)
- **`TaskCard`** — due-date line when set (pending future: `Due Jun 24`; today: `Due today`; overdue pending: `Overdue · Due Jun 10`; completed: neutral `Due Jun 10`; no date: no line)
- **Material related tasks preview** — same presentation rules (`MaterialRelatedTasksSection`)

---

## Explicit non-goals (deferred — separate phase gates)

- Dashboard **overdue** / **due-today** counts
- **Deadline-aware** dashboard hero recommendations
- Due-date **sorting**, **filtering**, or **URL query parameters**
- **Reminders**, **notifications**, **exam dates**, **calendar integration**
- **Gemini-generated** due dates
- **Trello** due-date synchronization
- **AI scheduling**

Optional task due dates are **not** a complete deadline-planning system.

---

## Verification (phase gate)

- Backend tests: **533/533**
- Frontend tests: **486/486**
- Frontend build passed
- Migration applied and verified on Supabase; persistence smoke test passed
- Supervisor Re-review approved; Security Review approved
