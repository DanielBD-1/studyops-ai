# Implementation Status — StudyOps AI

**Purpose:** Describe what is **built today** in the repository. For full MVP intent and future features, see `docs/PRD.md`. For phase-by-phase history, see `docs/AGENT_MEMORY.md`.

**Last aligned:** Phase 4C-2 (frontend Focus Sessions UI). Application phases **1A–1G** and **2A–2G** are complete unless noted otherwise. Generated plan persistence (Phases **2L-a/b/c**), **`study_tasks` table** (Phase **3A-a**), **`study_tasks` backend API** (Phase **3A-b**), **course-level manual task UI** (Phases **3A-c**–**3A-c.3** on `/courses/:id`), **global manual task UI** (Phases **3A-d**–**3A-e** on `/tasks`), **plan → task import** (Phase **3A-f**), **flashcard study UI** (Phase **3B-a**), **`flashcards` DB foundation** (Phase **3B-b**), **flashcards backend API** (Phase **3B-c**), **flashcards frontend integration** (Phase **3B-d**), **flashcards manual CRUD UI** (Phase **3B-e**), **global flashcards page** (Phase **3B-f**), **global create flashcard UI** (Phase **3B-g**), **`trello_sync_logs` DB foundation** (Phase **4A-0**), **backend Trello sync API** (Phase **4A-1**), **frontend Trello sync page** (Phase **4A-2**), **Trello UI polish** (Phase **4A-3**), **backend Trello board/list discovery** (Phase **4B-1**), **frontend Trello board/list picker** (Phase **4B-2**), **`focus_sessions` DB foundation** (Phase **4C-0**), **backend Focus Sessions API** (Phase **4C-1**), and **frontend Focus Sessions UI** (Phase **4C-2**) are documented below.

---

## Architecture (current)

```
React frontend (Vite)
    → Express backend (modular monolith, port 3001)
        → document-service POST /process (port 3002)
            → Gemini API (server-side only)
    → Supabase Auth + PostgreSQL (profiles, courses, study_materials, material_generated_plans, study_tasks, flashcards, trello_sync_logs, focus_sessions)
```

- **ADR 002:** Gemini is called only from `document-service`.
- **ADR 003:** Zod validates env, requests, and Gemini output shape.
- Frontend uses the **backend REST API** with Bearer JWT — not service role, not document-service, not Gemini directly.

---

## Environment boundaries (placeholders in `.env.example` only)

| Variable / key | Package | Notes |
|----------------|---------|--------|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | **backend** | Service role is **backend-only** — never in frontend or `VITE_*` |
| `DOCUMENT_SERVICE_URL` | **backend** | Internal URL to document-service (e.g. `http://localhost:3002`) |
| `FRONTEND_URL` | **backend** | CORS allowlist |
| `GEMINI_API_KEY` | **document-service** | Required for `POST /process`; never in backend or frontend |
| `VITE_API_URL` | **frontend** | Backend base URL (e.g. `http://localhost:3001`) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | **frontend** | Anon key only — session + client auth |

Never commit real `.env` files. Never document or paste real keys in issues or PRs.

---

## Database (Supabase)

**Applied tables:** `public.profiles`, `public.courses`, `public.study_materials`, `public.material_generated_plans`, `public.study_tasks`, `public.flashcards`, `public.trello_sync_logs`, `public.focus_sessions`

**`material_generated_plans` (Phase 2L-a):** One **latest** validated generated plan per `study_material_id` (`UNIQUE`); `plan` jsonb (object, size-capped); RLS for `authenticated`; **`anon` has no access**; backend writes via **service role** with ownership filters (see `docs/database/004-material-generated-plans-schema-and-rls.md`). **No** plan history, failed-attempt rows, raw Gemini payloads, or duplicated material `content`.

**`study_tasks` (Phase 3A-a):** Manual study task rows (`user_id`, `course_id`, optional `material_id`); RLS by `user_id = auth.uid()`; **`anon` has no access**; `source = manual` only in DB CHECK for now. Table **applied and verified** on Supabase (see `docs/database/005-study-tasks-schema-and-rls.md`). **Frontend import** from saved generated `plan.tasks` (Phase **3A-f**) creates rows via existing create API — still stored as `source = manual` server-side.

**`study_tasks` backend API (Phase 3A-b):** Express routes with **`requireAuth`**; service-role queries always filter by authenticated `user_id`. Task responses are **camelCase** and do **not** include `userId`, study material `content`, or generated `plan` JSON. **`difficulty`** / **`tags`** are returned (defaults on create) but **not client-editable**. **`status`** is **not** PATCHable — use **`POST /api/tasks/:taskId/complete`** only. Wrong-owner or missing task → neutral **`404`** “Task not found”. **Frontend** task UI: course-level Phases **3A-c**–**3A-c.3**, global Phases **3A-d**–**3A-e**, and plan import Phase **3A-f** (below).

**`flashcards` (Phases 3B-a through 3B-g):**

| Phase | Status |
|-------|--------|
| **3B-a** | Generated-plan **FlashcardStudy** UI on material detail (`plan.flashcards`) |
| **3B-b** | **`public.flashcards`** table + RLS (applied on Supabase) |
| **3B-c** | Backend flashcards REST API |
| **3B-d** | Material detail: saved DB flashcards + import `plan.flashcards` |
| **3B-e** | Material detail: manual create / edit / delete |
| **3B-f** | Global **`/flashcards`** page: list, study, filter, edit, delete |
| **3B-g** | Global **`/flashcards`** create: required course + optional material |

Normalized flashcard rows (`user_id`, `course_id`, optional `material_id`, `question`, `answer`, `tags`, `source = manual` only in DB CHECK for now). RLS by `user_id = auth.uid()`; **`anon` has no access**; ownership triggers mirror `study_tasks`. Table **applied and verified** on Supabase on **2026-05-26** (see `docs/database/006-flashcards-schema-and-rls.md`). Material detail shows **saved DB flashcards** (study + create/edit/delete) and **generated-plan flashcards** (both may appear after import). Global page shows **all saved flashcards** with course/material filters, **create**, study, edit, and delete. **No** course-level flashcard management UI.

**`trello_sync_logs` (Phase 4A-0):** Append-only per-task Trello sync attempt log (`user_id`, `task_id`, `status` = `success` \| `failed` \| `skipped`, optional `trello_card_id`, optional sanitized `error_message` max 500). **No** credential columns (ADR 004). RLS: `authenticated` **SELECT** own rows; **`service_role` SELECT + INSERT**; owner trigger on INSERT. Table **applied and verified** on Supabase on **2026-05-26** (see `docs/database/007-trello-sync-logs-schema-and-rls.md`). **`study_tasks.trello_card_id`** is updated by **`POST /api/trello/sync`** (Phase **4A-1**) on successful card creation; still **omitted** from task GET/PATCH API responses. **Trello sync + board/list picker (4A + 4B):** end-to-end on **`/trello`** — Load boards → select board/list → sync tasks; **manually smoke-tested** (Phase **4B** picker flow, **2026-05-29**).

**`focus_sessions` (Phases 4C-0 + 4C-1 + 4C-2):** Per-task Pomodoro-style focus session rows (`user_id`, `course_id`, `task_id`, `duration_minutes`, `completed_task`, `started_at`, `ended_at`). **4C-0:** table + RLS + ownership trigger (see `docs/database/008-focus-sessions-schema-and-rls.md`; **applied and verified** on Supabase **2026-05-29**). **4C-1 backend API:** `POST /api/focus` (start for owned **pending** task; body `{ taskId, durationMinutes? }` default **25**, int **5–120**); `POST /api/focus/:sessionId/complete` (body `{ completedTask }`; server-side actual minutes from `started_at` / `ended_at`, clamped **1 … min(120, session ceiling)**; optional task completion via existing `completeTask`). **4C-2 frontend UI:** protected **`/focus/:taskId`**; **Start Focus** on **pending** tasks (`/tasks`, `/courses/:id`); frontend → backend only via **`focus.service.js`**; fixed **25**-minute **display-only** countdown; complete sends **`{ completedTask }` only**; success uses backend **`session.durationMinutes`**; **no** pause/resume, duration picker, or browser storage. **`duration_minutes`:** provisional **session ceiling** while `ended_at IS NULL`; **actual completed minutes** after complete. **No** task description or material content on start load; session responses camelCase. Wrong-owner → neutral **404**; already completed session → **409**. **Known MVP note (SEC-1):** session row is closed before `completeTask`; rare DB failure after session update may leave task **pending** while session is ended (user can still `POST /api/tasks/:taskId/complete`). **Not implemented:** manual smoke (Phase **4C-3**); dashboard **`totalFocusMinutes`** (Phase **5B** — sum `duration_minutes` where `ended_at IS NOT NULL`).

**Not created yet:** `api_logs` admin table, etc. (PRD future scope). **Plan task import** (3A-f) copies `plan.tasks[]` into `study_tasks` only.

**Study materials ownership:** `study_materials.course_id` → `courses.id` → `courses.user_id` (no `user_id` on materials row). Backend uses service role with explicit ownership filters.

---

## Implemented — Authentication & profiles

- Register / login / logout / `GET /api/auth/me`
- Supabase session; frontend Bearer token via `apiFetch`
- Profiles via `auth.users` + `public.profiles` (RLS own-row SELECT)

---

## Implemented — Courses

- **API:** `GET/POST /api/courses`, `GET/PATCH/DELETE /api/courses/:id` (all `requireAuth`)
- **UI:** `/courses`, `/courses/:id` — list, create, edit title, delete
- Course stats in API response are a **zero stub** (not real dashboard metrics)

---

## Implemented — Study materials

- **API:**
  - `GET/POST /api/courses/:id/materials`
  - `GET/PATCH/DELETE /api/study-materials/:materialId`
- **UI:** Materials on course detail; `/study-materials/:materialId` — view/edit/delete content
- **Validation:** Title 3–150; content 100–50,000 (trimmed)

---

## Implemented — AI study plan generation (persisted latest plan)

Delivered in phases **2D–2F** (generate orchestration + UI) and **2L-a/b/c** (DB + backend persistence + frontend load/clear). Not the monolithic PRD flow with client paste on the course page.

| Layer | What exists |
|-------|-------------|
| **document-service** | `POST /process` — body `{ studyText }` (100–50k chars); Gemini via `GEMINI_API_KEY`; output validated with PRD §8 schema; **internal only** |
| **backend** | `POST /api/study-materials/:materialId/generate` — body **`{}` strict**; `requireAuth`; ownership before reading saved `content`; one document-service call; **Zod-validates** plan before **UPSERT** to `material_generated_plans`; returns `{ materialId, courseId, plan, savedAt }`. `GET` / `DELETE` `/api/study-materials/:materialId/generated-plan` for load/clear. **No** client-supplied plan JSON; **no** raw Gemini storage; **no** failed-generate persistence |
| **frontend** | **Generate** (`generateMaterial`, body `{}`); **load** saved plan on material detail (`GET`); **Clear** via backend `DELETE`; read-only plain-text display (summary, key topics, difficulty, tasks, flashcards); optional **Last saved** from `savedAt`. **Import tasks to course** (Phase **3A-f**) — sequential `POST /api/courses/:courseId/tasks` from visible `plan.tasks` (see below). **No** `localStorage` / `sessionStorage` for plans; **no** direct Supabase plan writes |

**Generate and persistence rules:**

- `materialId` from route only — not from body.
- Body must not include `studyText`, `content`, `courseId`, `userId`, `plan`, or ownership fields.
- Backend uses **saved** material `content` after ownership check (user must save edits before generate if form is dirty).
- **One latest plan per material** — regenerate **replaces** the row; **no** plan history or saved-plan library UI.
- Generated `plan` is **untrusted display data** — validated on the backend immediately before DB write; rendered as plain React text in the UI.
- Missing saved plan → `404` “Generated plan not found” → **empty state** (not a scary error). Wrong-owner/missing material → neutral `404` “Study material not found”.

**PRD drift (approved refinement):** PRD §9 describes `POST /api/courses/:courseId/generate` with `{ studyText }`. The **implemented** route is material-scoped (above). Course-level paste-generate remains **deferred**. **`public.flashcards` table** (3B-b), **backend API** (3B-c), **material-detail frontend** (3B-d: saved list + plan import; 3B-e: manual create/edit/delete), and **global `/flashcards`** (3B-f: list/study/filter/edit/delete; 3B-g: global create) exist; **bulk create**, course-level management, and advanced study features remain **deferred**.

---

## Implemented — Study tasks (backend API, Phase 3A-b)

Manual **`study_tasks`** management via the main backend only (not document-service, not direct Supabase from the browser). All routes **`requireAuth`**.

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/courses/:id/tasks` | List tasks for an **owned** course (`?status=pending` \| `completed` optional) |
| `POST` | `/api/courses/:id/tasks` | Create task — body: `title`, `estimatedMinutes`, optional `description`, `priority`, `materialId` |
| `GET` | `/api/tasks` | List caller’s tasks (`?courseId`, `?status` optional) |
| `PATCH` | `/api/tasks/:taskId` | Update allowed fields only (see below) |
| `POST` | `/api/tasks/:taskId/complete` | Mark **completed** — body **`{}` strict**; idempotent if already completed |
| `DELETE` | `/api/tasks/:taskId` | Delete owned task |

**Create (server-set, not in body):** `user_id` from JWT; `course_id` from route; `difficulty` = `medium`; `tags` = `[]`; `source` = `manual`; `status` = `pending`.

**PATCH allowed fields:** `title`, `description`, `priority`, `estimatedMinutes`, `materialId` (nullable to unlink). **Rejected in body:** `status`, `difficulty`, `tags`, `source`, `userId` / `user_id`, `courseId` / `course_id`, Trello fields, unknown keys (Zod **strict**).

**`materialId`:** Optional on create; on create/PATCH, material must belong to the **same owned course** as the task (or route course). Otherwise neutral **`404`** “Study material not found”.

**Ownership / errors:** Wrong-owner or missing course → **`404`** “Course not found”. Wrong-owner or missing task → **`404`** “Task not found”. Responses do **not** expose other users’ task existence.

**Not implemented (API):** `GET /api/tasks/:id` (PRD) — intentionally deferred. Dashboard metrics, admin, or **batch** plan-import endpoint (frontend uses repeated create in **3A-f**). Focus: **`POST /api/focus`** + **`POST /api/focus/:sessionId/complete`** + **`/focus/:taskId` UI** implemented (Phases **4C-1** + **4C-2**); manual smoke pending **4C-3**; dashboard **`totalFocusMinutes`** pending **5B**. Trello sync: **`POST /api/trello/sync`** (Phase **4A-1**) + frontend **`/trello`** page (Phases **4A-2** + **4A-3** UI polish).

---

## Implemented — Study tasks (course UI, Phase 3A-c)

**MVP scope on `/courses/:id` only** — manual task management via backend REST (Bearer JWT); **no** direct Supabase writes; **no** new routes in `App.jsx`.

| Action | API used by UI |
|--------|----------------|
| List | `GET /api/courses/:courseId/tasks` (no status filter in MVP UI) |
| Create | `POST /api/courses/:courseId/tasks` — `title`, `estimatedMinutes`, optional `description`, `priority` only (**no** `materialId` in MVP) |
| Mark complete | `POST /api/tasks/:taskId/complete` — body **`{}`** |
| Delete | `DELETE /api/tasks/:taskId` |

**UI:** `CourseTasksSection` on course detail — loading, empty, error, and create form states; plain-text task title/description; **Mark complete** for pending tasks only (**no** reopen / mark incomplete — API has no uncomplete). Client Zod mirrors backend create limits (`frontend/src/utils/validation.js`).

**Not in 3A-c UI:** status filters (added in **3A-c.2**), `materialId` linking (added in **3A-c.3**), global `/tasks` page (Phase **3A-d**), generated-plan → `study_tasks` import, edit task (added in **3A-c.1**).

**Tests (frontend, 3A-c):** `npm test` **54/54** at 3A-c completion. Lint passed (one pre-existing `AuthContext.jsx` warning). Build passed.

---

## Implemented — Study tasks (course UI edit, Phase 3A-c.1)

**Frontend-only polish on `/courses/:id`** — edit **pending** manual tasks via existing backend **`PATCH /api/tasks/:taskId`**. **No** backend, database, migration, or document-service changes.

| Action | API used by UI |
|--------|----------------|
| Edit (pending only) | `PATCH /api/tasks/:taskId` — body: `title`, `estimatedMinutes`, `description`, `priority` only |

**UI:** **Edit** on pending task cards opens inline form (same fields as create); **Save** / **Cancel**; refetch list on success. **Completed** tasks remain read-only for metadata (**no** Edit); **Delete** still available. **No** `status`, `materialId`, `difficulty`, or `tags` in PATCH body. Client Zod: `updateTaskFormSchema` in `frontend/src/utils/validation.js`.

**Not in 3A-c.1:** status filters (added in **3A-c.2**), `materialId` linking (added in **3A-c.3**), mark incomplete, global `/tasks` (Phase **3A-d**), generated-plan → `study_tasks` import.

**Tests (frontend):** `npm test` **58/58** (adds `updateTask` service test + `updateTaskFormSchema` validation tests). Lint passed (one pre-existing `AuthContext.jsx` warning). Build passed.

---

## Implemented — Study tasks (course UI filters, Phase 3A-c.2)

**Frontend-only addition to `/courses/:id`** — **All / Pending / Completed** filter bar using existing backend `?status=` query support. **No** backend, database, migration, or document-service changes.

| Filter | API used |
|--------|----------|
| All (default) | `GET /api/courses/:courseId/tasks` |
| Pending | `GET /api/courses/:courseId/tasks?status=pending` |
| Completed | `GET /api/courses/:courseId/tasks?status=completed` |

**UI:** Filter buttons rendered above the task list; active filter highlighted; switching filter cancels open edit, closes create form, and refetches. **Create form and "Add study task" button visible on All filter only** (new task always creates `pending`). Filtered empty states: "No pending tasks." / "No completed tasks." — no misleading create CTA. Filter is **in-memory only** — not persisted in browser URL.

**Not in 3A-c.2:** URL-persisted filters, `materialId` linking (added in **3A-c.3**), mark incomplete, global `/tasks` (Phase **3A-d**), generated-plan → `study_tasks` import.

**Tests (frontend):** `npm test` **61/61** (adds `listCourseTasks` with `?status=pending`, `?status=completed`, and no-param tests). Lint passed (one pre-existing `AuthContext.jsx` warning). Build passed.

---

## Implemented — Study tasks (course UI material linking, Phase 3A-c.3)

**Frontend-only addition to `/courses/:id`** — optional link between manual **`study_tasks`** and existing course **study materials** using existing backend **`materialId`** on create/PATCH (Phase **3A-b**). **No** backend, database, migration, document-service, or package changes. **No** new materials API call in `CourseTasksSection` — `CourseDetail` passes already-loaded `materials` prop.

| Action | API / body |
|--------|------------|
| Create with material | `POST /api/courses/:courseId/tasks` — includes `materialId` (UUID) when selected |
| Create without material | Same route — **omits** `materialId` from body |
| Edit link material | `PATCH /api/tasks/:taskId` — `materialId` UUID with `title`, `estimatedMinutes`, `description`, `priority` |
| Edit unlink | `PATCH` — `materialId: null` when **None** selected |

**UI:** Optional **Link to material (optional)** `<select>` on create and edit forms (values from course `materials` list only — no free-text IDs). **`TaskCard`** shows `Material: <title>` when title is known; **`Material: unavailable`** when `task.materialId` is set but title is missing (deleted/other course). Edit form shows **Linked material unavailable** option when task has orphan `materialId`. **Completed** tasks: link display only — **no** edit (unchanged from **3A-c.1**).

**Client Zod:** `materialIdSchema`; `createTaskFormSchema` — optional UUID; `updateTaskFormSchema` — UUID or `null` (strict).

**Not in 3A-c.3:** material navigation links, filtering tasks by `materialId`, generated-plan → `study_tasks` import, global `/tasks` (added in **3A-d**), mark incomplete, URL-persisted filters, flashcards, Trello, dashboard/admin.

**Tests (frontend):** `npm test` **68/68** (service tests for create/link/unlink `materialId`; validation tests for UUID/`null`/reject invalid). Lint passed (one pre-existing `AuthContext.jsx` warning). Build passed. Backend tests not re-run (backend untouched).

**Optional UX follow-up (non-blocking):** create/edit may map generic `NOT_FOUND` to “Course not found” / “Task not found” when backend returns “Study material not found” — classified as copy only, not a security issue.

---

## Implemented — Study tasks (global UI, Phase 3A-d)

**Frontend-only protected `/tasks` page** — list and manage manual **`study_tasks`** across all owned courses via existing backend **`GET /api/tasks`** and task mutation routes. **No** backend, database, migration, document-service, or package changes.

| Action | API |
|--------|-----|
| List (all courses) | `GET /api/tasks` |
| List by course | `GET /api/tasks?courseId=<uuid>` |
| List by status | `GET /api/tasks?status=pending` \| `completed` |
| Combined filters | `GET /api/tasks?courseId=<uuid>&status=pending` \| `completed` |
| Edit (pending) | `PATCH /api/tasks/:taskId` — `title`, `estimatedMinutes`, `description`, `priority`, `materialId` (UUID or `null`) |
| Mark complete | `POST /api/tasks/:taskId/complete` — body **`{}`** |
| Delete | `DELETE /api/tasks/:taskId` |

**UI:** **`TasksPage`** + **`GlobalTasksSection`** — `listCourses()` for course filter dropdown; `listAllTasks({ courseId?, status? })` with allowlisted query params only. **Course filter:** All courses + one option per owned course (in-memory). **Status filter:** All / Pending / Completed (in-memory). Filter changes cancel edit and refetch. **`TaskCard`** shows **Course:** with **link to `/courses/:id` only** (no material links). **Pending:** edit, complete, delete. **Completed:** no edit; delete allowed. **Edit:** reuses **`updateTaskFormSchema`**; **`listMaterials(task.courseId)`** lazy-loaded on edit open only (not on page load). List view may show **`Material: unavailable`** until materials are loaded in edit. **No create** on `/tasks` — create remains on `/courses/:id`. Empty state: manual-task copy + navigate to `/courses`.

**Nav:** Links to `/tasks` from Dashboard and Courses list headers.

**Not in 3A-d:** create task on `/tasks`, `GET /api/tasks/:id`, Start Focus / focus sessions, generated-plan → `study_tasks` import, mark incomplete, material filtering/navigation links, URL-persisted filters, flashcards, Trello, dashboard/admin.

**Tests (frontend):** `npm test` **72/72** (adds `listAllTasks` query-variant service tests). Lint passed (one pre-existing `AuthContext.jsx` warning). Build passed. Backend tests not re-run (backend untouched).

**Known limitations:** `/tasks` renders task section only after `listCourses()` succeeds; material titles on list cards often unavailable until edit loads materials. **Create on `/tasks`** added in Phase **3A-e** (below).

---

## Implemented — Study tasks (global create, Phase 3A-e)

**Frontend-only addition to protected `/tasks`** — inline **create** manual **`study_tasks`** from the global page using existing backend **`POST /api/courses/:courseId/tasks`**. **No** backend, database, migration, document-service, or package changes. **Only** `frontend/src/components/tasks/GlobalTasksSection.jsx` changed in implementation.

| Action | API |
|--------|-----|
| Create | `POST /api/courses/:courseId/tasks` — body: `title`, `estimatedMinutes`, optional `description`, `priority`, optional `materialId` (course id in URL only) |

**UI:** **Add study task** when user has at least one course and status filter is **not** Completed (also hidden while list is loading or has load error). Inline create form: **required course** dropdown (`Select a course` + owned courses from `listCourses()` prop); **title**, **estimated minutes**, **priority**; optional **description**; optional **Link to material** — **`listMaterials(createCourseId)`** lazy-loaded only after a valid owned course is selected (not preloaded for all courses). **None** omits `materialId` from POST; selected material sends UUID. Client Zod: **`createTaskFormSchema`** (unchanged). Opening create cancels edit; opening edit closes create; filter changes close create and cancel edit. After success: form closes, fields reset, list refetches, **`courseFilter`** set to created course so the new **pending** task is visible.

**Not in 3A-e:** `GET /api/tasks/:id`, Start Focus / focus sessions, generated-plan → `study_tasks` import, mark incomplete, material filtering/navigation links, URL-persisted filters, flashcards, Trello, dashboard/admin.

**Tests (frontend):** `npm test` **72/72** (unchanged — no service/validation file changes). Lint passed (one pre-existing `AuthContext.jsx` warning). Build passed. Backend tests not re-run (backend untouched).

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Known limitations / minor notes:** Possible **double refetch** after create (explicit `loadTasks` overrides + filter `useEffect`); brief **loading flash** after create; create **`NOT_FOUND`** may display **“Course not found”** even for material mismatch (UX only, not security); material titles on list cards often unavailable until edit loads materials; `/tasks` task section gated on successful `listCourses()`.

---

## Implemented — Generated plan → study_tasks import (Phase 3A-f)

**Frontend-only** on **`/study-materials/:materialId`** — import **`plan.tasks[]`** from the **already visible** saved/generated plan (in-memory `plan` state) into real **`study_tasks`** via existing **`POST /api/courses/:courseId/tasks`**. **No** backend, database, migration, document-service, Gemini prompt/schema, or dependency changes.

| Aspect | Detail |
|--------|--------|
| API | Sequential **`createCourseTask(material.courseId, body)`** — `courseId` in URL only |
| Mapping | `title`, `estimatedMinutes`, optional `description`, optional `priority`, **`materialId`** = current material |
| Not imported | summary, keyTopics, plan/task difficulty, tags, flashcards; no `courseId`/`userId`/`status`/`source` in body |
| Validation | **`buildValidatedImportBodies`** — every body **`createTaskFormSchema.safeParse`** before **any** POST; any failure → **zero** creates, neutral *Plan tasks could not be imported. Try regenerating the plan.* |
| Execution | Sequential `await`; **stop on first POST failure**; partial message *Imported X of N… duplicates may be created* |
| UX | **Import tasks to course** in **`GeneratedPlanSection`** when plan has tasks; confirm warns re-import may duplicate; plan **not** auto-cleared; hidden when unsaved material edits / generating / clearing / importing |

**Implementation files:** `frontend/src/utils/plan-import.js`, `frontend/src/pages/StudyMaterialDetail.jsx`, `frontend/src/components/materials/GeneratedPlanSection.jsx`, `frontend/tests/unit/plan-import.test.js`.

**Tests (frontend):** `npm test` **80/80** (+8 plan-import tests). Lint passed (one pre-existing `AuthContext.jsx` warning). Build passed. Backend tests not re-run (backend untouched).

**package.json (test wiring only):** `npm test` script lists `tests/unit/plan-import.test.js` — **no** dependency, devDependency, or `package-lock.json` change (Supervisor + Security: acceptable minimal test discovery).

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Not in 3A-f:** backend batch import; `source = 'plan'`; flashcard import; dedupe beyond confirm; atomic all-or-nothing; `GET /api/tasks/:id`; Trello, focus, dashboard/admin.

**Known limitations:** Imported rows indistinguishable from manual tasks (`source` stays `manual`); re-import can duplicate; partial import possible on mid-loop API failure (max 20 tasks per plan).

---
## Implemented — Flashcard study UI (Phase 3B-a)

Frontend-only on **`/study-materials/:materialId`** — when `plan.flashcards` exists and length > 0, `GeneratedPlanSection` renders a flip/reveal study UI (`FlashcardStudy`) showing **one card at a time** (question first, **“Show answer”**, answer as plain text), with **Previous/Next** navigation and a **“Card X of N”** counter. Reveal state resets on navigation; current card index resets to `0` when `flashcards` changes. This block reads **only** from generated plan JSON (`material_generated_plans.plan`). **Saved DB flashcards** (Phase **3B-d**) use a separate **Saved flashcards** section and the same `FlashcardStudy` component via **`GET /api/flashcards?materialId=`**. **No** study-progress persistence. Tags are rendered as plain React text metadata (no HTML injection).

Implementation files: `frontend/src/components/materials/GeneratedPlanSection.jsx`, `frontend/src/components/materials/FlashcardStudy.jsx`, `frontend/src/utils/flashcard-study.js`, `frontend/tests/unit/flashcard-study.test.js`.

Tests (frontend): `cd frontend && npm test` includes `flashcard-study.test.js`; `npm run lint` and `npm run build` passed. Reviews: Supervisor approved with notes; Security Review not required (read-only UI; no new writes/API; safe plain-text rendering).

---

## Implemented — Flashcards database (Phase 3B-b)

**Schema/RLS only** — `public.flashcards` on Supabase. **No** backend API, **no** frontend DB-backed management UI, **no** plan → flashcard import, **no** application code in this phase.

| Aspect | Detail |
|--------|--------|
| Migration | `supabase/migrations/006_flashcards.sql` — **applied manually** in Supabase SQL Editor on **2026-05-26** (**Success. No rows returned.**) |
| Ownership | `user_id` + `course_id` + optional `material_id`; triggers enforce user/course and material/course alignment |
| RLS | Own-row policies for `authenticated`; `anon` has no grants |
| `source` | **`manual` only** in DB CHECK (future import may extend) |
| Verification | Catalog + behavioral probes passed; cross-user RLS probe **skipped** (no second auth user); test row cleaned (`remaining_test_flashcards = 0`) |

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Not in 3B-b:** `GET/POST/PATCH/DELETE` flashcard API; global `/flashcards` page; import `plan.flashcards[]` into rows; known/unknown; spaced repetition; wiring **3B-a** UI to DB rows.

**See:** `docs/database/006-flashcards-schema-and-rls.md`

---

## Implemented — Trello sync logs database (Phase 4A-0)

**Schema/RLS only** — `public.trello_sync_logs` on Supabase. **No** backend Trello API, **no** frontend `/trello` page, **no** Trello HTTP client in this phase.

| Item | Detail |
|------|--------|
| Migration | `supabase/migrations/007_trello_sync_logs.sql` — **applied manually** in Supabase SQL Editor on **2026-05-26** (**Success. No rows returned.**) |
| Status values | `success`, `failed`, `skipped` (per-row; PRD §8.4 `partial` refined at row level) |
| Credentials | **Never** stored — no apiKey, token, listId, or raw Trello payloads |
| Verification | Catalog + behavioral probes passed; owner-mismatch / cross-user RLS **skipped/limited** (single auth user); test row cleaned |

**Not in 4A-0:** `POST /api/trello/sync`; updating `study_tasks.trello_card_id` from sync; frontend sync form; credential persistence.

**See:** `docs/database/007-trello-sync-logs-schema-and-rls.md`

---

## Implemented — Backend Trello sync API (Phase 4A-1)

**Backend only** — `POST /api/trello/sync` with ephemeral credentials in request body (ADR 004). **No** frontend `/trello` page, **no** boards/lists fetch, **no** credential persistence.

| Item | Detail |
|------|--------|
| Route | `POST /api/trello/sync` — mounted at `/api/trello`; **`requireAuth`** |
| Body | `{ apiKey, token, listId, taskIds }` — Zod strict; `taskIds` 1–50 unique UUIDs |
| Trello client | `backend/src/clients/trello.client.js` — native `fetch`; mocked in tests |
| Ownership | Tasks loaded/updated with `user_id = req.user.id`; wrong-owner/missing → per-task `failed` / `"Task not found"` **no log row** |
| Skip | `study_tasks.trello_card_id` already set → `skipped`; no Trello call |
| Success | Trello card created; `trello_card_id` updated; `trello_sync_logs` `success` row |
| Logs | Append-only insert for owned tasks only; sanitized `error_message`; **never** credentials |
| Response | `{ results: [{ taskId, status, trelloCardId, error }], summary: { total, success, skipped, failed } }` — `status` ∈ `success` \| `failed` \| `skipped` (PRD boolean refinement) |
| Checks | `cd backend && npm run lint` and `npm test` passed — **208** tests, **0** failures |

**Not in 4A-1:** `/trello` UI; `POST /api/trello/boards`; OAuth; stored credentials; Trello card update/delete; force re-sync; exposing `trelloCardId` on task list APIs.

**Known MVP note:** Orphan Trello card possible if Trello succeeds but DB update fails.

---

## Implemented — Frontend Trello sync page (Phase 4A-2)

**Frontend only** — protected **`/trello`** page; calls backend **`POST /api/trello/sync`** only (ADR 004). **No** direct browser calls to `api.trello.com`. **No** credential persistence.

| Item | Detail |
|------|--------|
| Route | **`/trello`** — `ProtectedRoute`; Dashboard link |
| Service | `frontend/src/services/trello.service.js` — `syncTasksToTrello({ apiKey, token, listId, taskIds })` |
| Form | Password fields for apiKey/token; manual listId; **Clear credentials**; credentials cleared after backend sync attempt |
| Tasks | `listAllTasks()` checkboxes; max **50** selected; metadata: title, status, priority, estimated minutes, course title |
| Results | Summary (`total`, `success`, `skipped`, `failed`); per-task `status` `success` \| `failed` \| `skipped`; `trelloCardId` on success; sanitized `error` strings only |
| Checks | `cd frontend && npm run lint`, `npm test` (**161** tests, **0** failures), `npm run build` passed |

**Not in 4A-2:** OAuth; `POST /api/trello/boards`; boards/lists picker; stored credentials; Trello card update/delete; force re-sync; advanced sync management UI.

**Known UX notes:** If `listCourses` fails, sync section does not mount; no courses retry button yet. Already-synced tasks not visible before submit (task APIs omit `trello_card_id`).

---

## Implemented — Trello `/trello` UI polish (Phase 4A-3)

**Frontend presentation only** — improves readability for demo; **no** changes to sync logic, `trello.service.js`, validation, credential lifecycle, or backend.

| Item | Detail |
|------|--------|
| Scope | `TrelloSyncPage`, `components/trello/*` markup/classNames; scoped CSS in `frontend/src/index.css` (`.page--trello`, `.trello-sync`, task/result lists) |
| Header | Title, lead, credential note, and nav aligned (`page-header__intro`) |
| Tasks | Card-style selectable rows; metadata `status · priority · minutes · course`; toolbar + selection count |
| Results | Summary line; per-task rows with status pills (`success` / `skipped` / `failed`) |
| Checks | `cd frontend && npm run lint`, `npm test` (**161** tests, **0** failures), `npm run build` passed |

**Unchanged from 4A-2:** Password apiKey/token; credentials cleared after backend sync attempt; backend-only `POST /api/trello/sync`; max 50 tasks.

**Still deferred (Trello):** OAuth; stored credentials; board/list **persistence**; Trello card update/delete; force re-sync; advanced sync management beyond manual MVP.

---

## Implemented — Backend Trello board/list discovery (Phase 4B-1)

**Backend only** — proxy endpoints consumed by **4B-2** frontend picker. Ephemeral `{ apiKey, token }` in POST body (ADR 004). **No** DB reads/writes; **no** Supabase on discovery paths; **no** credential or board/list metadata persistence.

| Item | Detail |
|------|--------|
| Routes | `POST /api/trello/boards` — body `{ apiKey, token }` → `{ boards: [{ id, name }] }` |
| | `POST /api/trello/boards/:boardId/lists` — body `{ apiKey, token }` → `{ lists: [{ id, name }] }` |
| Auth | **`requireAuth`** on `/api/trello` (same router as sync) |
| Trello client | `getBoards` → `GET /members/me/boards?filter=open`; `getBoardLists` → `GET /boards/:boardId/lists?filter=open`; native `fetch`; mocked in tests |
| Sanitization | Open boards/lists only; `{ id, name }` only; sorted by name; max **500** items |
| Errors | Safe messages only (auth, rate limit, board not found, failed to load boards/lists); no raw Trello body in responses |
| Unchanged | **`POST /api/trello/sync`** behavior |

**Checks:** `cd backend && npm run lint` passed; `cd backend && npm test` passed — **235** tests, **0** failures.

**Not in 4B-1:** Frontend picker on `/trello` (added in **4B-2**); OAuth; stored credentials; board/list persistence.

**Approved refinement:** Two endpoints (boards, then lists for selected board) instead of one nested PRD example — lazy list load after board selection.

**Known UX note:** Rare 404 on `/members/me/boards` may return a less ideal message — not a security blocker.

---

## Implemented — Frontend Trello board/list picker (Phase 4B-2)

**Frontend only** — board/list picker on **`/trello`**; **manual listId lookup is no longer the primary UX**. End-to-end picker flow: apiKey/token → **Load boards** → select board → load lists → select list → select tasks → sync via **`POST /api/trello/sync`**.

| Item | Detail |
|------|--------|
| Service | `fetchTrelloBoards`, `fetchTrelloBoardLists`, `syncTasksToTrello` — StudyOps backend only; **no** `api.trello.com` from browser |
| Picker | `TrelloBoardListPicker` — Load boards, board/list `<select>`s, loading/empty/error states |
| Form | `TrelloSyncForm` — password apiKey/token only; **Clear credentials** resets picker + credentials |
| Validation | `validateTrelloLoadBoards`; sync requires selected list + 1–50 tasks |
| Credentials | React state only; cleared after sync attempt; **not** stored in localStorage/sessionStorage/URL |
| Sync body | `listId` = selected list id from picker (unchanged backend contract) |

**Checks:** `cd frontend && npm run lint` passed; `npm test` (**168** tests, **0** failures); `npm run build` passed.

**Manual smoke test (passed, 2026-05-29):** Authenticated **`/trello`**; Load boards and board/list picker; sync creates Trello card; second sync **skipped** (duplicate prevention); apiKey/token cleared after sync; browser calls **only** `/api/trello/boards`, `/api/trello/boards/:boardId/lists`, `/api/trello/sync` — **no** direct `api.trello.com`; no Trello credentials in console, **localStorage**, or **sessionStorage** (Supabase auth token in localStorage is expected).

**Not in 4B-2:** OAuth; credential storage; board/list persistence; Trello card update/delete; force re-sync.

**Known UX notes:** After sync, board/list labels may remain while credentials clear; re-entering apiKey/token without **Load boards** may reuse prior list selection — not a security blocker.

---

## Implemented — Focus Sessions backend API (Phase 4C-1)

**Backend only** — `backend/src/modules/focus/*`; mounted at **`/api/focus`**; all routes **`requireAuth`**; service-role queries filter by authenticated **`user_id`**.

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/focus` | Start focus session for owned **pending** task — body `{ taskId, durationMinutes? }` (default **25**, int **5–120**, strict); returns **`{ session }`** (**201**) |
| `POST` | `/api/focus/:sessionId/complete` | End owned in-progress session — body `{ completedTask }` strict; server sets **`ended_at`** and actual **`duration_minutes`**; if **`completedTask === true`**, calls **`completeTask`**; returns **`{ session }`** or **`{ session, task }`** |

**Duration:** Client must **not** send elapsed minutes. Actual minutes = `floor((endedAt - startedAt) / 60000)`, clamped to **1 … min(120, session ceiling)**.

**Ownership / errors:** Missing or wrong-owner task/session → **404** neutral message. Completed task at start → **400**. Already completed session → **409** `CONFLICT`.

**Checks:** `cd backend && npm run lint` passed; `npm test` (**270** tests, **0** failures).

**Known MVP note (SEC-1):** Session update runs before **`completeTask`**; transient failure after session close may leave task **pending** (retry on session blocked by **409**); user may still complete via **`POST /api/tasks/:taskId/complete`**. Security Review: acceptable MVP consistency risk, not a blocker.

**Not in 4C-1:** `/focus/:taskId` UI (**4C-2**); manual smoke (**4C-3**); dashboard **`totalFocusMinutes`** (**5B**).

**Implementation files:** `backend/src/modules/focus/*`, `backend/src/shared/validation/focus.schema.js`, `backend/src/app.js`.

---

## Implemented — Focus Sessions frontend UI (Phase 4C-2)

**Frontend only** — protected **`/focus/:taskId`**; **`focus.service.js`** → StudyOps backend only (Bearer JWT via existing auth pattern); **no** direct Supabase table access, **no** external APIs, **no** `localStorage` / `sessionStorage`.

| Route / entry | Behavior |
|---------------|----------|
| **`/focus/:taskId`** | Protected route; auto-starts session via **`POST /api/focus`** once per visit (fixed **25** minutes); display-only countdown; **Complete session** via **`POST /api/focus/:sessionId/complete`** with body **`{ completedTask }` only**; optional **Mark task as complete** checkbox; success message uses backend **`session.durationMinutes`** |
| **Start Focus** (pending tasks) | Link on **`TaskCard`** from **`/tasks`** (returns to **`/tasks`**) and **`/courses/:id`** (returns to **`/courses/:courseId`**); hidden on completed tasks; non-clickable when card is busy |

**MVP constraints:** **No** pause/resume; **no** duration picker; client timer is **display-only** (backend is source of truth for credited minutes).

**S1 fix:** Module-level in-flight **`Promise` Map** keyed by **`taskId:durationMinutes`** dedupes duplicate **`POST /api/focus`** on remount/Strict Mode; entries removed in **`finally`**.

**Checks:** `cd frontend && npm run lint` passed (pre-existing AuthContext warning); `npm test` (**174** tests, **0** failures); `npm run build` passed.

**Reviews:** Initial Supervisor Review changes requested (S1); S1 fixed; Targeted Supervisor Re-review **approved with notes**; Security Review **no blockers**.

**Known gaps (non-blocking):** No automated test for promise-map dedupe; no component test for Start Focus hidden on completed tasks or busy-state span; **`returnTo`** validated with **`startsWith('/')`** only.

**Not in 4C-2:** Manual smoke (**4C-3**); dashboard **`totalFocusMinutes`** (**5B**); pause/resume; duration picker.

**Implementation files:** `frontend/src/pages/FocusPage.jsx`, `frontend/src/services/focus.service.js`, `frontend/src/App.jsx`, `frontend/src/components/tasks/TaskCard.jsx`, `frontend/src/components/tasks/CourseTasksSection.jsx`, `frontend/src/components/tasks/GlobalTasksSection.jsx`.

---

## Implemented — Flashcards backend API (Phase 3B-c)

Manual **`public.flashcards`** CRUD via the main backend only (not document-service, not direct Supabase from the browser). All routes **`requireAuth`**; service-role queries always filter by authenticated **`user_id`**.

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/flashcards` | List caller’s flashcards (`?courseId`, `?materialId` optional — ownership verified before list) |
| `POST` | `/api/courses/:id/flashcards` | Create flashcard — body: `question`, `answer`, optional `tags`, optional `materialId` |
| `PATCH` | `/api/flashcards/:flashcardId` | Update allowed fields only |
| `DELETE` | `/api/flashcards/:flashcardId` | Delete owned flashcard |

**Create (server-set, not in body):** `user_id` from JWT; `course_id` from route `:id`; `source` = `manual` (DB default/CHECK).

**List filters:** Wrong-owner or missing course → **`404`** “Course not found”. Wrong-owner, missing, or cross-course material → **`404`** “Study material not found”. Unfiltered list returns only rows for **`req.user.id`**.

**Responses:** camelCase; include `source`; **do not** include `userId`. Wrong-owner/missing flashcard on PATCH/DELETE → **`404`** “Flashcard not found”.

**Validation (Zod):** Question 10–500; answer 10–2000; tags max 5 (each 1–50); strict bodies (reject `userId`, `courseId`, `source`, timestamps on create); update requires ≥1 allowed field.

**Implementation files:** `backend/src/modules/flashcards/*`, `backend/src/shared/validation/flashcard.schema.js`, `backend/src/modules/courses/courses.routes.js` (create route), `backend/src/app.js` (mount `/api/flashcards`).

**Tests:** `backend/tests/integration/flashcards.test.js`, `backend/tests/unit/flashcards.service.test.js`, `backend/tests/helpers/mockSupabaseFlashcards.js`. **`backend/package.json`** `npm test` script lists both flashcards test files explicitly (**no** dependency or lockfile change). `cd backend && npm run lint` and `npm test` passed — **180** tests, **0** failures (CI runs same script).

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Not in 3B-c:** Frontend DB flashcards UI; frontend `/api/flashcards` client; global `/flashcards` page; import `plan.flashcards[]` into rows; known/unknown; spaced repetition; pagination/rate limiting; wiring **3B-a** UI to DB rows.

---

## Implemented — Flashcards frontend integration (Phase 3B-d)

**Frontend-only** on **`/study-materials/:materialId`** — consumes **3B-c** API via backend REST (Bearer JWT); **no** direct Supabase access to `public.flashcards`.

| Capability | Detail |
|------------|--------|
| **Saved flashcards** | `DbFlashcardsSection` — `listFlashcards({ materialId })` on material load; loading / error / empty / study via `FlashcardStudy` |
| **Import from plan** | **Import flashcards to library** in `GeneratedPlanSection` when `plan.flashcards.length > 0`; `plan-flashcard-import.js` validates all cards before first POST; sequential `createCourseFlashcard(courseId, body)` with `materialId` from route; confirm warns duplicates; stop on first failure; refetches saved list on success/partial success; **does not** clear or mutate generated plan |
| **Plan study (3B-a)** | Unchanged — `FlashcardStudy` still renders `plan.flashcards` inside generated plan section |

**Service:** `frontend/src/services/flashcards.service.js` — `listFlashcards`, `createCourseFlashcard`, `updateFlashcard`, `deleteFlashcard` (update/delete wired in **3B-e** UI).

**Validation:** `createFlashcardFormSchema` in `frontend/src/utils/validation.js` — question 10–500, answer 10–2000, tags max 5 (each 1–50), strict bodies.

**Implementation files:** `DbFlashcardsSection.jsx`, `GeneratedPlanSection.jsx`, `StudyMaterialDetail.jsx`, `plan-flashcard-import.js`, `flashcards.service.js`.

**Tests:** `frontend/tests/unit/flashcards.service.test.js`, `frontend/tests/unit/plan-flashcard-import.test.js`. **`frontend/package.json`** `npm test` lists both (**no** dependency or lockfile change). `cd frontend && npm run lint`, `npm test` (**115** tests, **0** failures), and `npm run build` passed.

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Not in 3B-d:** Global `/flashcards` page; manual create flashcard form; edit/delete flashcard UI; known/unknown; spaced repetition; Anki; client-side import dedupe; `source = 'plan'`; pagination/rate limiting.

**Known limitations:** Re-import can duplicate saved rows; partial import possible; plan and saved sections may both show similar content after import.

---

## Implemented — Flashcards manual CRUD UI (Phase 3B-e)

**Frontend-only** on **`/study-materials/:materialId`** — manual management of saved DB flashcards via **3B-c** API (Bearer JWT); **no** direct Supabase access.

| Capability | Detail |
|------------|--------|
| **Create** | Inline form in `DbFlashcardsSection` — question, answer, optional comma-separated tags; `createCourseFlashcard(material.courseId, body)` with `materialId` from route; Zod via `flashcard-form.js` / `createFlashcardFormSchema` |
| **Edit** | One inline edit form at a time; `updateFlashcard(id, { question, answer, tags })` |
| **Delete** | `window.confirm` generic copy; `deleteFlashcard(id)`; refetch on success or 404 |
| **Study** | Read-only `FlashcardStudy` (`title="Study saved cards"`) — no CRUD inside carousel |
| **Manage** | Compact list — truncated question, tags, Edit/Delete per card |

**Validation:** `updateFlashcardFormSchema` added; create/edit aligned with backend limits (Q 10–500, A 10–2000, tags max 5).

**Busy state:** CRUD disabled during save/delete material, generate, clear, import tasks/flashcards (`flashcardsCrudDisabled`); **not** blocked by unsaved material text edits.

**Implementation files:** `DbFlashcardsSection.jsx`, `StudyMaterialDetail.jsx`, `flashcard-form.js`, `validation.js`, `FlashcardStudy.jsx` (optional `title` prop).

**Tests:** `frontend/tests/unit/flashcards.validation.test.js`, `frontend/tests/unit/flashcard-form.test.js`. **`frontend/package.json`** `npm test` lists both (**no** dependency or lockfile change). `cd frontend && npm run lint`, `npm test` (**138** tests, **0** failures), and `npm run build` passed.

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Not in 3B-e:** Course-level flashcard management; known/unknown; spaced repetition; Anki; client-side dedupe; `source = 'plan'`; pagination/rate limiting (global `/flashcards` shipped in **3B-f**).

---

## Implemented — Global flashcards page (Phase 3B-f)

**Frontend-only** — protected route **`/flashcards`**; consumes **3B-c** API via backend REST (Bearer JWT); **no** direct Supabase access; global create added in **3B-g**.

| Capability | Detail |
|------------|--------|
| **List** | `listFlashcards()` default; `?courseId=` / `?materialId=` via `resolveFlashcardListFilters` (owned course/material IDs only) |
| **Filters** | Course: All \| owned courses; Material: shown when course selected — `listMaterials(courseId)` then optional `materialId` filter |
| **Study** | `FlashcardStudy` on filtered set (`title="Study filtered cards"`) |
| **Edit / delete** | Reuses `flashcard-form.js` / `updateFlashcard` / `deleteFlashcard`; one edit at a time; filter change cancels edit |
| **Links** | Row meta: course → `/courses/:id`; material → `/study-materials/:materialId` when linked |
| **Nav** | Dashboard and Tasks page link to `/flashcards` |

**Implementation files:** `FlashcardsPage.jsx`, `GlobalFlashcardsSection.jsx`, `flashcard-filters.js`, `App.jsx`, `DashboardStub.jsx`, `TasksPage.jsx`.

**Tests:** `frontend/tests/unit/flashcard-filters.test.js`. **`frontend/package.json`** `npm test` lists it (**no** dependency or lockfile change). `cd frontend && npm run lint`, `npm test` (**146** tests, **0** failures), and `npm run build` passed.

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Not in 3B-f:** Global create flashcard UI (shipped in **3B-g**); course-level flashcard management; known/unknown; spaced repetition; Anki; `source = 'plan'`; import dedupe; URL-persisted filters; pagination/rate limiting.

**Known limitations:** Material titles on “All courses” view may show link-only fallback; materials load error blocks list until retry; duplicate edit/delete UI vs material detail (optional refactor).

---

## Implemented — Global create flashcard UI (Phase 3B-g)

**Frontend-only** — extends **`/flashcards`** **`GlobalFlashcardsSection`**; consumes existing **3B-c** `POST /api/courses/:id/flashcards` (Bearer JWT); **no** direct Supabase access; **no** backend change.

| Capability | Detail |
|------------|--------|
| **Create** | **Create flashcard** / **Add another flashcard**; inline form after filters |
| **Course** | Required `<select>` from owned `courses` only (“Select a course”) |
| **Material** | Optional — `listMaterials(createCourseId)` into `createMaterials`; **Not linked to a material** omits `materialId` from body |
| **Fields** | Question, answer, comma-separated tags; Save / Cancel |
| **Validation** | `buildCreateFlashcardBody` + `createFlashcardFormSchema` (optional `materialId`); client checks owned course/material IDs |
| **Post-create** | Close form; success message; set `courseFilter` / `materialFilter`; refetch with `loadFlashcards` overrides so new card visible |
| **Exclusion** | Open create cancels edit; start edit cancels create; filter change cancels both |

**Implementation files:** `GlobalFlashcardsSection.jsx`, `flashcard-form.js`, `validation.js`.

**Tests:** `frontend/tests/unit/flashcard-form.test.js`, `frontend/tests/unit/flashcards.validation.test.js` extended (**no** `package.json` or lockfile change). `cd frontend && npm run lint`, `npm test` (**149** tests, **0** failures), and `npm run build` passed.

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Not in 3B-g:** Bulk create; AI/Gemini generation; plan import on `/flashcards`; dedupe/`source = 'plan'`; known/unknown; spaced repetition; Anki; URL-persisted filters; course-level management; shared CRUD extraction.

**Known limitations:** Create CTA hidden while list is loading or in list error state; possible duplicate list fetch after create; success message may persist after cancel create (non-blocking).

---

## Implemented — Quality / lint (Phase 2G)

- ESLint flat config in `backend/`, `document-service/`, `frontend/`
- Scripts: `npm run lint`, `npm run lint:fix` per package
- **CI:** `npm ci` → `npm run lint` → `npm test` (frontend: + `npm run build`)
- **Local:** `scripts/check-all.ps1` runs lint before tests per package
- See `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`

---

## Frontend routes (implemented)

| Route | Purpose |
|-------|---------|
| `/`, `/register` | Auth |
| `/dashboard` | Stub landing |
| `/courses` | Course list + create |
| `/courses/:id` | Course detail + materials list/create + **manual study tasks** (list, **All/Pending/Completed filters**, create, **edit pending**, optional **link/unlink study material**, complete, delete) |
| `/tasks` | **All study tasks** across courses — **course + status filters**, **create** (choose owned course; optional material link via lazy `listMaterials`), **edit pending** (incl. `materialId` link/unlink), complete, delete |
| `/flashcards` | **All saved flashcards** — **course + material filters** (in-memory), **create** (required course, optional material), list, **study filtered** cards, **edit/delete**; links to course/material |
| `/trello` | **Trello sync** — apiKey/token (not stored); **Load boards** → board/list picker (**4B-2**); task selection (max 50); sync via backend only (`/api/trello/boards`, `/api/trello/boards/:boardId/lists`, `/api/trello/sync`); credentials cleared after sync attempt; UI polished (**4A-3**) |
| `/focus/:taskId` | **Focus session** — auto-start via **`POST /api/focus`**; fixed **25**-minute display countdown; complete via **`POST /api/focus/:sessionId/complete`** (`{ completedTask }` only); optional mark task complete; **Start Focus** entry from pending tasks on **`/tasks`** and **`/courses/:id`** (**4C-2**) |
| `/study-materials/:materialId` | Material detail, edit, **generate**, **load/clear latest saved plan**, **import plan tasks** to `study_tasks`, **saved DB flashcards** (list, study, **manual create/edit/delete**), **import plan flashcards** to library, and **generated-plan** flashcard study UI (`plan.flashcards`, flip/reveal) |

**Not implemented:** `/courses/:id/generate`, `/admin` (PRD future).

---

## Deferred / not started (requires separate approval)

- Material **navigation** links from task cards; **filtering** tasks by `materialId`; **backend batch** plan-import endpoint; `source = 'plan'` / import dedupe system for flashcards; **bulk create** flashcards; **AI/Gemini** flashcard generation on `/flashcards`; **plan import** on `/flashcards`; **course-level** flashcard management; known/unknown tracking; spaced repetition; Anki; pagination/rate limiting; **URL-persisted** flashcard filters (in-memory filters shipped in **3B-f**); optional shared CRUD form extraction; link from `/courses` to `/flashcards` ( **`public.flashcards` table + RLS** in **3B-b**; **backend API** in **3B-c**; **material-detail** in **3B-d**–**3B-e**; **global page** in **3B-f**–**3B-g**; **plan JSON study** in **3B-a**; **plan tasks** import in **3A-f**); edit **completed** tasks or mark incomplete (pending-only edit shipped in **3A-c.1**); **URL-persisted** task filters (in-memory filters shipped in **3A-c.2** / **3A-d** / **3A-e**)
- Saved generated **plan library** or plan **history** (only one latest plan per material is stored)
- Course-level `POST /api/courses/:courseId/generate` with client `studyText` (PRD-style paste on course page)
- Trello **OAuth**; **stored** credentials; **board/list persistence**; Trello card **update/delete**; **force re-sync**; advanced sync management beyond manual MVP (**4A** sync UI + **4B** board/list picker end-to-end; manual listId paste no longer required)
- Student dashboard analytics (real metrics)
- Admin dashboard and logs
- Focus manual smoke (**4C-3**); dashboard **`totalFocusMinutes`** (**5B**) — database **4C-0**, backend API **4C-1**, and frontend UI **4C-2** complete; **`focus_sessions`** table **4C-0** applied (**2026-05-29**)
- Production deployment strategy
- **`DESIGN.md` v2** (Phase 2I-c) and **frontend styling pass** (Phase 2J) are **complete** — presentation only; **`11-generated-plan-visible.png`** **captured** (Phase 2K-c); **`15-processing-with-ai.png`** still **pending** (see `docs/design/SCREENSHOT_INDEX.md`)
- Pre-commit secret scanning (optional future)
- `eslint-plugin-react` for stricter JSX unused-import lint (optional future)

---

## Manual smoke — persisted generated plan (Phase 2L-d)

**Docs checklist only** — run locally when validating behavior; **not** automated in CI. **Do not** call live Gemini in `npm test` / CI. Design screenshot status (`11-` captured, `15-` pending) is **separate** — see [Design screenshots](#design-screenshots).

| # | Step | Expected |
|---|------|----------|
| 1 | Open owned material with **no** saved plan | No plan section; no scary “failed to load plan” error |
| 2 | Refresh | Still no plan section |
| 3 | Network: `POST …/generate` | Body is **`{}` only** — no `plan`, `studyText`, `content`, `courseId`, `userId` |
| 4 | Generate succeeds (quota permitting) | Plan visible; copy indicates **saved as latest**; optional `Last saved` |
| 5 | Refresh page | Same plan reappears without regenerating |
| 6 | Clear plan | `DELETE …/generated-plan` succeeds; UI empty |
| 7 | Refresh after clear | No plan section |
| 8 | Clear again | No scary error (idempotent) |
| 9 | Invalid / wrong-owner material id | Neutral “Study material not found” |
| 10 | Unsaved form edits | Generate disabled; save-first hint shown |
| 11 | Save → Generate | Works; persists after refresh |
| 12 | Plan in DOM | Plain text nodes only — no `dangerouslySetInnerHTML` |

### Design screenshots

- **`11-generated-plan-visible.png`** — **Captured** (Phase 2K-c). Screenshot taken from the **already-saved** generated plan after Phase 2O-c live external AI smoke; **no** additional Generate click during capture. Shows read-only plan with **saved-as-latest** disclaimer and optional **Last saved** (see `docs/design/screenshots/11-generated-plan-visible.png`).
- **`15-processing-with-ai.png`** — **Pending** (do not fabricate). Requires a **separately approved** live Generate attempt to capture the “Processing with AI…” frame; processing UI was observed in earlier 2K-a/2K-b attempts but the official PNG is not in the repo yet.

---

## Test / CI expectations (code phases)

When changing application code, run per touched package:

```bash
cd backend && npm run lint && npm test
cd document-service && npm run lint && npm test
cd frontend && npm run lint && npm test && npm run build
```

Or from repo root (after `npm ci` in each package): `.\scripts\check-all.ps1`

**Docs-only PRs** do not require lint/test unless non-doc files are changed.

---

## Agent workflow (summary)

See `AGENTS.md` for full role definitions and approval phrases:

| Phase gate | Meaning |
|------------|---------|
| `approved — begin Phase X planning only` | Planning Agent — report only, no implementation |
| `approved — implement Phase X` | Implementation (and tests/lint as applicable) |
| `approved — Phase X complete` | Documentation Agent may update `AGENT_MEMORY.md` |

Roles: Orchestrator, Planning Agent, Implementation Agent, Testing Agent, Supervisor Review Agent, Security Review Agent, Documentation Agent; Design Agent for future approved UI polish only.
