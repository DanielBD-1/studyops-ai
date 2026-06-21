# 015 — Study Tasks Optional Due Date (Phase DASHBOARD-DEPTH-P0)

**Status:** **Applied manually** on Supabase (Phase DASHBOARD-DEPTH-P0 complete; Supervisor Re-review + Security Review approved; catalog + persistence smoke verification passed).  
**Migration file:** `supabase/migrations/015_study_tasks_due_date.sql`  
**Prerequisite:** `005_study_tasks.sql` applied and verified  
**Schema reference:** `docs/database/005-study-tasks-schema-and-rls.md` (Phase 3A-a baseline; see **Later schema extensions** below)

---

## Purpose

Phase DASHBOARD-DEPTH-P0 adds an optional **day-level** calendar due date on `public.study_tasks` so students can set deadlines on manual tasks. **NULL** means no deadline.

**In P0:** SQL migration + backend API + frontend forms/display + tests. **Not** a full deadline-planning or dashboard-intelligence system.

**Phase DASHBOARD-DEPTH-A2 (complete):** Reads **`due_date`** for authenticated-user **aggregate** overdue/due-today counts on **`GET /api/dashboard/stats`**. Migration **015** is **unchanged** — **no** new schema, indexes, or timezone persistence in A2.

**Phase TASK-DUE-FILTERS-A1 (complete):** Reads **`due_date`** for authenticated-user **backend-filtered** overdue/due-today **task list** results on **`GET /api/tasks`** and **`GET /api/courses/:courseId/tasks`**. Migration **015** is **unchanged** — **no** new schema, indexes, or timezone persistence in A1.

**Phase TASK-DUE-SORT-A1 (complete):** Reads **`due_date`** and **`created_at`** for authenticated-user **backend-owned list ordering** on the same list routes. Migration **015** is **unchanged** — **no** new schema, indexes, or timezone persistence in **TASK-DUE-SORT-A1**.

**Phase TASK-UPCOMING-FILTERS-A1 (complete):** Reads **`due_date`** for authenticated-user **backend-filtered** bounded **Next 7 days** task list results on **`GET /api/tasks`** and **`GET /api/courses/:courseId/tasks`**, plus **`dueNext7DaysPendingTasks`** aggregate on **`GET /api/dashboard/stats`**. Migration **015** is **unchanged** — **no** new schema, indexes, timezone persistence, or package dependency in **TASK-UPCOMING-FILTERS-A1**.

**Phase TASK-MATERIAL-BACKEND-A1 (complete):** Reads existing **`material_id`** for authenticated-user **backend-filtered** task list **material membership** on **`GET /api/tasks`** and **`GET /api/courses/:courseId/tasks`** (optional **`materialId`** omitted / UUID / **`none`**). Migration **015** is **unchanged** — **no** new schema, indexes, or package dependency in **TASK-MATERIAL-BACKEND-A1**.

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

**Unchanged:** `status` still via **`POST /api/tasks/:taskId/complete`** only; completing a task **preserves** `due_date`.

**List ordering (TASK-DUE-SORT-A1):** Both **`GET /api/tasks`** and **`GET /api/courses/:courseId/tasks`** use the same backend contract (frontend renders API order — **no** client-side **`.sort()`**, **no** sort query param):

| Mode | When | Order |
|------|------|-------|
| **Pending / deadline** | **`status=pending`**, or **`deadline=overdue`**, or **`deadline=due_today`**, or **`deadline=next_7_days`** | **`due_date ASC NULLS LAST` → `created_at DESC` → `id ASC`** |
| **Completed / All** | **`status=completed`**, or both **`status`** and **`deadline`** omitted | **`created_at DESC` → `id ASC`** |

Do **not** describe **Completed** or **All** lists as due-date sorted. **Priority** is **not** part of sorting.

---

## Task list deadline filters (TASK-DUE-FILTERS-A1 + TASK-UPCOMING-FILTERS-A1)

Both list routes accept optional deadline query parameters (migration **015** unchanged):

| Route | Optional query |
|-------|----------------|
| **`GET /api/tasks`** | **`deadline=overdue|due_today|next_7_days`**, **`referenceDate=YYYY-MM-DD`** |
| **`GET /api/courses/:courseId/tasks`** | **`deadline=overdue|due_today|next_7_days`**, **`referenceDate=YYYY-MM-DD`** |

| Rule | Behavior |
|------|----------|
| **`deadline` with omitted `status`** | Treated as **pending** |
| **`deadline` with `status=completed`** | **400** validation error |
| **`referenceDate` without `deadline`** | **400** validation error |
| **`referenceDate` omitted on API** | Server **UTC** calendar date |
| **Frontend fetch** | Sends **browser-local** calendar date as **`referenceDate`** when a deadline filter is active |

| Filter | Semantics |
|--------|-----------|
| **Overdue** | **`status = pending`**, **`due_date IS NOT NULL`**, **`due_date < referenceDate`** |
| **Due today** | **`status = pending`**, **`due_date = referenceDate`** |
| **Next 7 days** (**TASK-UPCOMING-FILTERS-A1**) | **`status = pending`**, **`due_date > referenceDate`**, **`due_date <= referenceDate + 7` calendar days** — e.g. **`referenceDate = 2026-06-19`** includes **2026-06-20** through **2026-06-26**; excludes today, overdue, day 8+, null dates, completed tasks |

**Date arithmetic (Next 7 days):** Upper boundary calculated in the backend; seven calendar days added without timezone/DST-dependent millisecond arithmetic; month/year/leap-year boundaries supported; **no** stored user timezone.

**Global `/tasks`:** URL-persisted **`deadline=overdue|due_today|next_7_days`** (implies **`status=pending`**); invalid frontend values canonicalized away; **`referenceDate` is not stored in the browser URL**. Example: **`/tasks?status=pending&deadline=next_7_days`**.

**Course `/courses/:id`:** **Overdue** / **Due today** / **Next 7 days** filters are **local/in-memory** — **not** persisted in the course URL.

**Dashboard:** Recommendation **overdue-tasks** / **due-today-tasks** / **due-next-7-days-tasks** heroes and **At a glance** **Overdue** / **Due today** / **Due next 7 days** statistics link to **`/tasks?status=pending&deadline=overdue`**, **`/tasks?status=pending&deadline=due_today`**, and **`/tasks?status=pending&deadline=next_7_days`**.

See **`docs/IMPLEMENTATION_STATUS.md`** § **TASK-DUE-FILTERS-A1** and § **TASK-UPCOMING-FILTERS-A1** for UI composition; § **TASK-DUE-SORT-A1** for ordering semantics and user-visible behavior.

---

## Task list material membership (TASK-MATERIAL-BACKEND-A1)

Both list routes accept optional **`materialId`** query parameter (reads existing **`material_id`** column — migration **015** unchanged):

| Route | Optional query |
|-------|----------------|
| **`GET /api/tasks`** | **`materialId=<uuid>`** or **`materialId=none`** |
| **`GET /api/courses/:courseId/tasks`** | **`materialId=<uuid>`** or **`materialId=none`** |

| Value | Behavior |
|-------|----------|
| **Omitted** | No material predicate (still scoped by authenticated **`user_id`**) |
| **UUID** | Verify owned material; filter **`material_id = UUID`** (course route: material must belong to route course) |
| **`none`** | Filter **`material_id IS NULL`** — **no** material ownership lookup |

| Security / validation | Detail |
|-----------------------|--------|
| **Material failures** | Missing, wrong-owner, or course/material mismatch → **`404`** neutral **“Study material not found”** |
| **Empty material** | Valid owned material with zero linked tasks → **`200`** **`[]`** |
| **Invalid query** | **`materialId=all`**, malformed UUID, repeated **`materialId`** → **`400`** **`VALIDATION_ERROR`** |
| **Composition** | Composes with **`courseId`**, **`status`**, **`deadline`**, **`referenceDate`** |
| **Ordering** | Unchanged (**TASK-DUE-SORT-A1**) |

**Frontend:** **`GlobalTasksSection`** and **`CourseTasksSection`** map filter UI → omitted / UUID / **`none`** on list fetch; render API results directly. Global **`/tasks`** URL **`materialId`** persistence unchanged (**TASK-MATERIAL-FILTERS-E1** + **TASK-MATERIAL-UNLINKED-A1**); **`/courses/:id`** material filter remains in-memory only.

See **`docs/IMPLEMENTATION_STATUS.md`** § **TASK-MATERIAL-BACKEND-A1** for full shipped behavior and supersession notes on historical frontend-only **TASK-MATERIAL-*** phases.

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
| **`dueNext7DaysPendingTasks`** | Caller-owned **pending** tasks with **`due_date > deadlineReferenceDate`** and **`due_date <= deadlineReferenceDate + 7` calendar days** — same boundaries as **`deadline=next_7_days`** list filter (**TASK-UPCOMING-FILTERS-A1**) |
| **`deadlineReferenceDate`** | Effective reference calendar date (optional query **`referenceDate=YYYY-MM-DD`**; omitted → server UTC calendar date; frontend sends browser-local date on each request) |

**Excluded from counts:** completed tasks; null **`due_date`**; other users' tasks. Response remains **aggregate-only** — no task rows or titles.

**A2 does not add:** new migration; indexes; stored user timezone; calendar integration; notifications. **Bounded next-7-days aggregate** added in **TASK-UPCOMING-FILTERS-A1** (migration **015** unchanged).

See **`docs/IMPLEMENTATION_STATUS.md`** § **DASHBOARD-DEPTH-A2** and § **TASK-UPCOMING-FILTERS-A1** for recommendation priority and hero CTAs.

---

## Frontend surfaces (P0 + A1)

- **Course tasks** — optional due date on create/edit; **Overdue** / **Due today** / **Next 7 days** deadline filters in-memory (**TASK-DUE-FILTERS-A1** + **TASK-UPCOMING-FILTERS-A1**)
- **Global `/tasks`** — optional due date on create/edit; URL-persisted **`deadline=overdue|due_today|next_7_days`** (**TASK-DUE-FILTERS-A1** + **TASK-UPCOMING-FILTERS-A1**)
- **`TaskCard`** — due-date line when set (pending future: `Due Jun 24`; today: `Due today`; overdue pending: `Overdue · Due Jun 10`; completed: neutral `Due Jun 10`; no date: no line)
- **Material related tasks preview** — same presentation rules (`MaterialRelatedTasksSection`)
- **Dashboard** — **Overdue** / **Due today** / **Due next 7 days** heroes and **At a glance** stats link to filtered **`/tasks`** URLs (**TASK-DUE-FILTERS-A1** + **TASK-UPCOMING-FILTERS-A1**)

---

## Explicit non-goals (deferred — separate phase gates)

- **Unbounded Upcoming**, **Due soon**, and **This week** filters (bounded **Next 7 days** shipped in **TASK-UPCOMING-FILTERS-A1** — see **Task list deadline filters** above)
- **Priority sorting**, user-selectable sort modes, drag-and-drop / manual ranking (deadline-aware list ordering shipped in **TASK-DUE-SORT-A1** — see **List ordering** above)
- **No-due-date** filter; **custom date ranges**; date picker
- **Reminders**, **notifications**, **exam dates**, **calendar integration**
- **Stored user timezone** persistence
- **Gemini-generated** due dates
- **Trello** due-date synchronization
- **Collaboration/chat**
- **AI scheduling**

Optional task due dates + A2 dashboard aggregates + A1 deadline filters + bounded next-7-days filter are **not** a complete deadline-planning system.

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

**A1 (task list deadline filters — no migration change):**

- Backend tests: **570/570**
- Frontend tests: **512/512**
- Frontend build passed
- Supervisor Review **PASS**; focused Supervisor Re-review **PASS**; Security Review **PASS**; manual browser smoke **PASS**

**TASK-DUE-SORT-A1 (task list ordering — no migration change):**

- Backend tests: **589/589**
- Frontend tests: **512/512**
- Frontend build passed
- Supervisor Review **PASS**; Security Review **APPROVED**; manual browser smoke **PASS**
- **`git diff --check`**: clean

**TASK-UPCOMING-FILTERS-A1 (bounded next-7-days filter + dashboard aggregate — no migration change):**

- Backend tests: **615/615**
- Frontend tests: **521/521**
- Frontend build passed
- Supervisor Review **PASS**; Security Review **APPROVED**; manual browser smoke **PASS**
- **`git diff --check`**: clean

**TASK-MATERIAL-BACKEND-A1 (task list material membership — no migration change):**

- Backend tests: **658/658**
- Frontend tests: **520/520**
- Frontend build passed
- Lint passed
- Supervisor Review **APPROVE WITH NOTES**; focused Supervisor Re-review **PASS**; Security Review **PASS / SECURITY APPROVED**; manual browser smoke **PASS WITH NOTES**
- **`git diff --check`**: clean
