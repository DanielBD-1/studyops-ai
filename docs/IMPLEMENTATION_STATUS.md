# Implementation Status — StudyOps AI

**Purpose:** Describe what is **built today** in the repository. For full MVP intent and future features, see `docs/PRD.md`. For phase-by-phase history, see `docs/AGENT_MEMORY.md`.

**Last aligned:** Phase 3B-d (flashcards frontend integration). Application phases **1A–1G** and **2A–2G** are complete unless noted otherwise. Generated plan persistence (Phases **2L-a/b/c**), **`study_tasks` table** (Phase **3A-a**), **`study_tasks` backend API** (Phase **3A-b**), **course-level manual task UI** (Phases **3A-c**–**3A-c.3** on `/courses/:id`), **global manual task UI** (Phases **3A-d**–**3A-e** on `/tasks`), **plan → task import** (Phase **3A-f**), **flashcard study UI** (Phase **3B-a**), **`flashcards` DB foundation** (Phase **3B-b**), **flashcards backend API** (Phase **3B-c**), and **flashcards frontend integration** (Phase **3B-d**) are documented below.

---

## Architecture (current)

```
React frontend (Vite)
    → Express backend (modular monolith, port 3001)
        → document-service POST /process (port 3002)
            → Gemini API (server-side only)
    → Supabase Auth + PostgreSQL (profiles, courses, study_materials, material_generated_plans, study_tasks, flashcards)
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

**Applied tables:** `public.profiles`, `public.courses`, `public.study_materials`, `public.material_generated_plans`, `public.study_tasks`, `public.flashcards`

**`material_generated_plans` (Phase 2L-a):** One **latest** validated generated plan per `study_material_id` (`UNIQUE`); `plan` jsonb (object, size-capped); RLS for `authenticated`; **`anon` has no access**; backend writes via **service role** with ownership filters (see `docs/database/004-material-generated-plans-schema-and-rls.md`). **No** plan history, failed-attempt rows, raw Gemini payloads, or duplicated material `content`.

**`study_tasks` (Phase 3A-a):** Manual study task rows (`user_id`, `course_id`, optional `material_id`); RLS by `user_id = auth.uid()`; **`anon` has no access**; `source = manual` only in DB CHECK for now. Table **applied and verified** on Supabase (see `docs/database/005-study-tasks-schema-and-rls.md`). **Frontend import** from saved generated `plan.tasks` (Phase **3A-f**) creates rows via existing create API — still stored as `source = manual` server-side.

**`study_tasks` backend API (Phase 3A-b):** Express routes with **`requireAuth`**; service-role queries always filter by authenticated `user_id`. Task responses are **camelCase** and do **not** include `userId`, study material `content`, or generated `plan` JSON. **`difficulty`** / **`tags`** are returned (defaults on create) but **not client-editable**. **`status`** is **not** PATCHable — use **`POST /api/tasks/:taskId/complete`** only. Wrong-owner or missing task → neutral **`404`** “Task not found”. **Frontend** task UI: course-level Phases **3A-c**–**3A-c.3**, global Phases **3A-d**–**3A-e**, and plan import Phase **3A-f** (below).

**`flashcards` (Phase 3B-b through 3B-d):** Normalized flashcard rows (`user_id`, `course_id`, optional `material_id`, `question`, `answer`, `tags`, `source = manual` only in DB CHECK for now). RLS by `user_id = auth.uid()`; **`anon` has no access**; ownership triggers mirror `study_tasks`. Table **applied and verified** on Supabase on **2026-05-26** (see `docs/database/006-flashcards-schema-and-rls.md`). **Backend REST API** (Phase **3B-c**) and **frontend integration** (Phase **3B-d**) — see sections below. Material detail shows **saved DB flashcards** and **generated-plan flashcards** (both may appear after import). **No** global `/flashcards` page; **no** manual create/edit/delete flashcard UI.

**Not created yet:** focus sessions, admin log tables, etc. (PRD future scope). **Plan task import** (3A-f) copies `plan.tasks[]` into `study_tasks` only.

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

**PRD drift (approved refinement):** PRD §9 describes `POST /api/courses/:courseId/generate` with `{ studyText }`. The **implemented** route is material-scoped (above). Course-level paste-generate remains **deferred**. **`public.flashcards` table** (3B-b), **backend API** (3B-c), and **material-detail frontend** (3B-d: saved list + plan import) exist; **global `/flashcards`**, manual CRUD UI, and advanced study features remain **deferred**.

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

**Not implemented (API):** `GET /api/tasks/:id` (PRD) — intentionally deferred. **No** Trello sync, focus sessions, dashboard metrics, admin, or **batch** plan-import endpoint (frontend uses repeated create in **3A-f**).

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

**Service:** `frontend/src/services/flashcards.service.js` — `listFlashcards`, `createCourseFlashcard`, `updateFlashcard`, `deleteFlashcard` (update/delete implemented for tests/future; **no** edit/delete UI in 3B-d).

**Validation:** `createFlashcardFormSchema` in `frontend/src/utils/validation.js` — question 10–500, answer 10–2000, tags max 5 (each 1–50), strict bodies.

**Implementation files:** `DbFlashcardsSection.jsx`, `GeneratedPlanSection.jsx`, `StudyMaterialDetail.jsx`, `plan-flashcard-import.js`, `flashcards.service.js`.

**Tests:** `frontend/tests/unit/flashcards.service.test.js`, `frontend/tests/unit/plan-flashcard-import.test.js`. **`frontend/package.json`** `npm test` lists both (**no** dependency or lockfile change). `cd frontend && npm run lint`, `npm test` (**115** tests, **0** failures), and `npm run build` passed.

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Not in 3B-d:** Global `/flashcards` page; manual create flashcard form; edit/delete flashcard UI; known/unknown; spaced repetition; Anki; client-side import dedupe; `source = 'plan'`; pagination/rate limiting.

**Known limitations:** Re-import can duplicate saved rows; partial import possible; plan and saved sections may both show similar content after import.

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
| `/study-materials/:materialId` | Material detail, edit, **generate**, **load/clear latest saved plan**, **import plan tasks** to `study_tasks`, **saved DB flashcards** (list + study), **import plan flashcards** to library, and **generated-plan** flashcard study UI (`plan.flashcards`, flip/reveal) |

**Not implemented:** `/courses/:id/generate`, `/flashcards`, `/trello`, `/focus/:taskId`, `/admin` (PRD future).

---

## Deferred / not started (requires separate approval)

- Material **navigation** links from task cards; **filtering** tasks by `materialId`; **backend batch** plan-import endpoint; `source = 'plan'` / import dedupe system for flashcards; global **`/flashcards`** page; flashcard **manual create** / **edit** / **delete** UI; known/unknown tracking; spaced repetition; Anki ( **`public.flashcards` table + RLS** in **3B-b**; **backend API** in **3B-c**; **material-detail saved list + plan import** in **3B-d**; **plan JSON study** in **3B-a**; **plan tasks** import in **3A-f**); edit **completed** tasks or mark incomplete (pending-only edit shipped in **3A-c.1**); **URL-persisted** task filters (in-memory filters shipped in **3A-c.2** / **3A-d** / **3A-e**)
- Saved generated **plan library** or plan **history** (only one latest plan per material is stored)
- Course-level `POST /api/courses/:courseId/generate` with client `studyText` (PRD-style paste on course page)
- Trello sync UI and backend
- Student dashboard analytics (real metrics)
- Admin dashboard and logs
- Focus sessions
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
