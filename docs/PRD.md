# PRD — StudyOps AI (Version 2.0)

**Last Updated:** 2026-06-07 (docs: **DOCS-PRD-FLASHCARD-REVIEW-ALIGNMENT** — SRS-lite flashcard review on saved DB cards; full SM-2/Anki still deferred)
**Status:** Ready for Implementation

---

## How to use this document

**This PRD contains product vision, target MVP requirements, future scope, and features that are not yet built.** Sections below describe the full MVP contract—including routes, APIs, and behaviors that may still be **deferred** in the repository. **Some MVP-era sections (e.g. §10.5 manual-only Trello) are historical** — for stored user tokens and connected sync, see ADR 006 and **`docs/IMPLEMENTATION_STATUS.md`** (Trello **A2–A6**).

**For actual shipped state, use:**

- **`docs/CURRENT_STATE.md`** — short owner/agent starting point (phase gates, suspended work)
- **`docs/IMPLEMENTATION_STATUS.md`** — authoritative detail on what is built today
- **`docs/POST_MVP.md`** — post-MVP framing (initial MVP closed; future work still gated)

Do **not** treat PRD body text alone as proof a feature is live. When PRD and implementation docs disagree on **shipped behavior**, **`IMPLEMENTATION_STATUS`** wins.

---

## Implementation Status — see `docs/IMPLEMENTATION_STATUS.md` for the latest source of truth

This section is a **historical summary only** and may lag the latest merged phases (e.g. **11A-3** plan history, **10B** import dedupe, **FLASHCARD-REVIEW-A1**–**A4c** SRS-lite review on saved DB flashcards, **12A-1** material cockpit, **B1**–**B3** presentation polish). It does **not** replace MVP sections below (future scope remains valid). **Authoritative shipped state:** **`docs/IMPLEMENTATION_STATUS.md`** and **`docs/CURRENT_STATE.md`**; phase history in **`docs/AGENT_MEMORY.md`**.

### Built (summary — functional MVP through 6A-3 and later phases; see IMPLEMENTATION_STATUS for current detail)

**Functional MVP (phases 1A–1G, 2A–2G, 2L-a/b/c/d, 3A-a/b/c/c.1/c.2/c.3/d/e/f, 3B-a/b/c/d/e/f/g, 4A-0, 4A-1, 4A-2, 4A-3, 4B-1, 4B-2, 4C-0, 4C-1, 4C-2, 4C-3, 5B, 5C, 5C.1, 6A-1, 6A-2, 6A-3):**

- Auth, profiles, courses API/UI, study materials API/UI (`study_materials` applied)
- **`material_generated_plans`** — one latest validated plan per study material (Phase 2L-a applied on Supabase)
- **`study_tasks`** — manual task table + RLS (Phase **3A-a**); **manual backend API** (Phase **3A-b**); **course-level task UI** on `/courses/:id` (Phases **3A-c**–**3A-c.3**: list, create, filters, edit, `materialId` link/unlink; **TASK-MATERIAL-FILTERS-A2**: study material filter); **global task UI** on `/tasks` (Phases **3A-d**–**3A-e**: cross-course list, course/status filters, **create** with required course picker + optional material link, edit/complete/delete; **TASK-MATERIAL-FILTERS-A2**: study material filter when a specific course is selected)
- **document-service:** `POST /process` (internal; `GEMINI_API_KEY` in document-service only)
- **Backend generate + saved plan:** `POST /api/study-materials/:materialId/generate` — body **`{}`**; Zod-validated UPSERT; `GET` / `DELETE` `.../generated-plan`; returns `{ materialId, courseId, plan, savedAt }`
- **Frontend:** `/study-materials/:materialId` — Generate, load saved plan on visit, Clear via DELETE; **import plan tasks/flashcards** via **10B** import APIs (`POST .../import/tasks`, `POST .../import/flashcards`; server-set **`source='plan'`**, dedupe); **saved DB flashcards** section (`GET /api/flashcards?materialId=`); **manual create/edit/delete** saved flashcards (inline forms, **3B-e**); **Known/Unknown review**, mastery filter, and **Due now** filter on saved DB cards (**FLASHCARD-REVIEW-A2**–**A4b**); **Plan JSON flashcards** from `plan.flashcards` (flip/reveal only, **3B-a** — **no** review API); plain text rendering
- **`flashcards` table + RLS** (Phase **3B-b**) — `public.flashcards` **applied on Supabase**; review + SRS-lite scheduling columns (**FLASHCARD-REVIEW-A1**, **A4a**)
- **Flashcards backend API** (Phases **3B-c** + **FLASHCARD-REVIEW-A1** + **A4a**) — `GET /api/flashcards`; `POST /api/courses/:id/flashcards`; `PATCH` / `DELETE /api/flashcards/:flashcardId`; **`POST /api/flashcards/:flashcardId/review`** (`{ outcome: "known" | "unknown" }` strict); auth + ownership filters; SRS-lite scheduling computed server-side on review
- **Flashcards frontend integration** (Phases **3B-d**–**3B-g** + **FLASHCARD-REVIEW-A2**–**A4b**) — material-detail saved list, **10B** plan import, manual CRUD, Known/Unknown review, mastery + Due now filters; **global `/flashcards`** page (create, list, study, course/material/review filters, edit/delete); **dashboard `dueFlashcardsCount`** (**A4c**). **Still deferred:** course-level flashcard management; full SM-2/Anki
- **`trello_sync_logs` table + RLS** (Phase **4A-0**) — `public.trello_sync_logs` **applied on Supabase**; append-only audit rows; **no** credential columns (ADR 004); status `success` \| `failed` \| `skipped`
- **Trello backend sync API** (Phase **4A-1**) — `POST /api/trello/sync` with manual `{ apiKey, token, listId, taskIds }` in body; native `fetch` Trello client; per-task `results[]` with `status` enum `success` \| `failed` \| `skipped` (approved refinement vs PRD boolean `success` example); updates `study_tasks.trello_card_id` on success; appends `trello_sync_logs` for owned tasks; **credentials never stored**
- **Trello frontend sync UI** (Phase **4A-2** + **4A-3** polish) — protected **`/trello`**; user enters apiKey/token, selects owned tasks (max 50), frontend calls StudyOps backend only (**no** direct Trello API from browser); displays summary + per-task results; credentials cleared after sync attempt; **not** stored in localStorage/sessionStorage/URL
- **Trello backend board/list discovery** (Phase **4B-1** + **A5A**) — **`POST /api/trello/boards`** and **`POST /api/trello/boards/:boardId/lists`**; **stored mode** `{}` when connected (**A5A**) or manual `{ apiKey, token }` when disconnected; backend proxies to Trello; returns sanitized `{ boards: [{ id, name }] }` / `{ lists: [{ id, name }] }` only; **no** DB writes; **no** credential storage. **Approved refinement:** two endpoints (lazy list load after board pick) instead of one nested boards+lists response in older PRD examples
- **Trello frontend board/list picker** (Phase **4B-2**) — **`/trello`**: Load boards → select board → load lists → select list; **`fetchTrelloBoards`** / **`fetchTrelloBoardLists`** call backend discovery endpoints only; manual listId lookup **not** required for main flow; **`syncTasksToTrello`** sends selected list id as `listId`
- **Trello sync + picker (end-to-end):** 4A-0 logs + 4A-1 sync API + 4A-2/4A-3 UI + 4B-1 discovery + 4B-2 picker — **primary path when connected (A5B + A5A):** `{}` / `{ listId, taskIds }` only; **manual fallback when disconnected (ADR 004):** ephemeral apiKey/token in POST body
- **Trello account connection (A2–A6):** Trello **implicit/token authorization** with **encrypted backend token storage**, **connected-account sync**, and **board/list defaults** — **not** a full enterprise **OAuth2 authorization-code** flow. **`trello_connections`** + crypto (**A2**); connect routes (**A3**); HMAC-signed state (**A4-STATE**); Connect/Disconnect + **`/trello/connect/callback`** (**A4-FRONTEND** — **live**); stored-token boards/lists/sync when body omits `apiKey`/`token` (**A5A**); **`/trello`** primary sync when connected — `{}` / `{ listId, taskIds }` only (**A5B**); connected + manual credentials → **`TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED`** / **400** (**A5C**); board/list defaults (**A6**). Reviews: Supervisor + Security **PASS** / approved with notes per phase
- **Still deferred:** Trello card update/delete; force re-sync
- **`focus_sessions` table + RLS** (Phase **4C-0**) — `public.focus_sessions` **applied on Supabase** (**2026-05-29**); duration semantics: provisional ceiling at start, actual minutes after complete
- **Focus Sessions backend API** (Phase **4C-1**) — `POST /api/focus` (start for owned pending task; `{ taskId, durationMinutes? }`); `POST /api/focus/:sessionId/complete` (`{ completedTask }`; server-side actual minutes; optional task completion)
- **Focus Sessions frontend UI** (Phase **4C-2**) — protected **`/focus/:taskId`**; **Start Focus** on pending tasks; fixed **25**-minute display countdown; complete sends **`{ completedTask }` only**; **no** pause/resume, duration picker, or browser storage
- **Focus Sessions manual smoke** (Phase **4C-3**) — **passed** (**2026-05-29**): Start Focus from pending tasks; complete without/with marking task complete; course page flow; network and console clean. **Focus Sessions MVP complete** through **4C-0**–**4C-3**
- **Dashboard backend stats API** (Phases **5B** + **FLASHCARD-REVIEW-A4c**) — **`GET /api/dashboard/stats`** (`requireAuth`); user-owned aggregate counts including **`totalFocusMinutes`** (completed focus sessions only), **`totalGeneratedPlans`** (count only — no plan JSON), **`trelloSyncedTasks`** (DB count only — no Trello API calls), **`dueFlashcardsCount`** (saved DB flashcards due when **`next_review_at IS NULL OR next_review_at <= now`** — count only, no Q/A)
- **Dashboard frontend UI** (Phase **5C**) — protected **`/dashboard`** consumes **`GET /api/dashboard/stats`** via backend only (Bearer JWT; **no** direct Supabase stats queries); displays aggregate stats + **`courseStats[]`**; read-only; fetch on mount + manual **Try again**
- **Dashboard cross-page refresh** (Phase **5C.1**) — **invalidation-only** **`DashboardContext`**: **`refreshStats()`** after successful stat-changing mutations; **`DashboardStub`** keeps local stats state and refetches via existing **`GET /api/dashboard/stats`** when mounted (manual **Refresh stats** + silent refresh); coalesces duplicate notifications; **not** a global stats cache in context. **Still deferred:** polling; WebSockets; **`BroadcastChannel`**; **`localStorage`/`sessionStorage`** cross-tab sync; visibility/focus refetch
- **Admin authorization foundation** (Phase **6A-1**) — **`requireAdmin`** middleware verifies **`profiles.role`** from DB (not frontend/JWT role); **`GET /api/admin/access-check`** returns **`{ admin: true }`** only
- **Admin aggregate stats API** (Phase **6A-2**) — **`GET /api/admin/stats`** ( **`requireAuth` + `requireAdmin`** ); platform-wide aggregate counts only; Trello sync today breakdown; static **`systemHealth.backend`**
- **Admin dashboard UI** (Phase **6A-3**) — protected **`/admin`** consumes **`GET /api/admin/stats`** via backend only; **`AdminRoute`** is UX-only. **Still deferred:** **`GET /api/admin/logs`** / **`api_logs`**; admin user list; role management UI; Gemini/system error metrics
- **Lint:** ESLint per package; CI runs `npm run lint` before tests (frontend: before build)

**Hardening & docs alignment (7A–7C, complete 2026-05-29):** read-only hardening audit (**7A**); database docs alignment (**7B**); markdown consistency through **6A-3** (**7C**).

**UI presentation polish (8A–8C, complete through 8C-3D, 2026-05-30):**

- **8A** — baseline frontend polish per **`DESIGN.md`** v2 (presentation only)
- **8B** — docs-only design-reference alignment
- **8C-1** — global **`AppShell`** (Dashboard, Courses, Tasks, Flashcards, Trello nav; optional Admin link for admins; logout); design tokens + **`PageHeader`**
- **8C-2A** — **`/dashboard`**, **`/courses`**, **`/courses/:id`** cockpit/workspace presentation
- **8C-2B** — **`/study-materials/:materialId`** editor + AI zones (generate panel, generated plan, saved flashcards)
- **8C-3A** — **`/tasks`**, **`/focus/:taskId`**
- **8C-3B** — **`/flashcards`**
- **8C-3C** — **`/trello`** step-based sync workspace (connected-account sync when linked — **A5B**; manual fallback when disconnected; **no** credential persistence)
- **8C-3D** — **`/admin`** aggregate stats cockpit (**no** logs, user list, or role management UI)

**Frontend routes (all implemented):** `/`, `/register`, `/dashboard`, `/courses`, `/courses/:id`, `/tasks`, `/flashcards`, `/trello`, `/trello/connect/callback` (OAuth account connect — **A4-FRONTEND**), `/focus/:taskId`, `/study-materials/:materialId`, `/admin`. Protected workspace routes use **`AppShell`** (callback is authenticated but renders without full workspace chrome during exchange).

**Backend modules (mounted):** auth, courses, study-materials, tasks, flashcards, trello, focus, dashboard, admin.

### Still deferred (requires separate approval)

- **`GET /api/admin/logs`** / **`api_logs`** table; admin **user list**; **role management** UI; Gemini/system error metrics for admin
- Trello card update/delete; force re-sync — **note:** **A2–A6** (encrypted storage, backend connect, signed state, Connect/Disconnect UI + callback, backend stored-token mode, **frontend connected-account sync UX**, **backend manual-credential hardening while connected**, **board/list persistence**) in repo; **connected-account sync is the primary `/trello` UX** when linked; manual fallback when **disconnected** only (ADR 004)
- Course-level **`POST /api/courses/:courseId/generate`** with client `studyText`; route **`/courses/:id/generate`**
- PDF upload/parsing
- Dashboard **polling / WebSockets / cross-tab sync / visibility refetch** (invalidation-only **5C.1** refresh is implemented)
- Full SRS (SM-2 / Anki, `ease_factor`, per-review history table); flashcard backend `?due=now` / `?mastery=`; URL-persisted flashcard filters; dashboard charts; admin due-card metrics; notifications/calendar reminders; payments
- Production deployment strategy; observability / APM
- Further UI styling beyond **8C-3D** (explicit approval required)

### Approved refinement vs §9 / §6.5 below

| PRD (target MVP) | Implemented today |
|------------------|-------------------|
| `POST /api/courses/:courseId/generate` with `{ studyText }` | **Deferred** |
| `POST /api/study-materials/:materialId/generate` with `{}` | **Yes** — backend loads saved owned material `content`; persists validated plan per material |
| Persist **generated plan** per material | **Yes** (2L-a/b/c + **11A-1/2/3**) — one **active** plan per material; up to **10** history rows; history REST + material-detail history UI |
| Course-level **manual task UI** (list / create / complete / delete) | **Yes** (3A-c on `/courses/:id`) |
| Edit **pending** course tasks (`title`, `description`, `priority`, `estimated minutes`) | **Yes** (3A-c.1 — `PATCH /api/tasks/:taskId`; **no** edit on completed tasks) |
| Task **status filters** (All / Pending / Completed) on course tasks | **Yes** (3A-c.2 — in-memory, not URL-persisted) |
| **Study material filter** on course tasks (frontend-only; composes with status) | **Yes** (TASK-MATERIAL-FILTERS-A2 — filters already-loaded tasks by `task.materialId`; uses course-page materials; unknown filter id shows all tasks) |
| **Tasks without material** filter on course and global task lists (frontend-only; `materialFilter === 'none'`) | **Yes** (TASK-MATERIAL-UNLINKED-A1 — **`/courses/:id`** in-memory only; **`/tasks`** in-memory + **`materialId=none`** URL with valid **`courseId`**; unlinked = null/missing/empty **`materialId`** only; **no** backend **`?materialId=`**; **no** cross-course unlinked filter without selected course) |
| **`materialId`** linking on course tasks (create / edit / unlink) | **Yes** (3A-c.3 on `/courses/:id`; 3A-d edit on `/tasks` via lazy `listMaterials`) |
| Global **`/tasks`** UI (list, course/status filters, edit/complete/delete, course link) | **Yes** (3A-d — course/status filters; **TASK-MATERIAL-FILTERS-E1** URL sync on **`/tasks`**) |
| Global **`/tasks`** **study material filter** (only when a specific course is selected) | **Yes** (TASK-MATERIAL-FILTERS-A2 — `listMaterials` for selected course; course change resets material filter; frontend-only) |
| Global **`/tasks`** **URL-persisted filters** (`courseId`, `materialId`, `status`; Back/Forward; defaults omitted) | **Yes** (TASK-MATERIAL-FILTERS-E1 — **`materialId`** client-side only; **no** backend **`?materialId=`**; **no** **`/courses/:id`** URL filters) |
| Create task on **`/tasks`** (required owned-course dropdown; optional `materialId`; `POST /api/courses/:courseId/tasks`) | **Yes** (3A-e — hidden on Completed filter / no courses) |
| Material **navigation** links from task cards (`TaskCard` **`Link`** to **`/study-materials/:materialId`**) | **Yes** (TASK-MATERIAL-LINKS-A1 — `materialLabel` or fallback **View study material**) |
| Material detail **Related study tasks** read-only band (saved DB tasks linked to current material; client-side filter over `listCourseTasks`) | **Yes** (TASK-MATERIAL-DETAIL-A3 — up to 5 compact preview rows; pending before completed; refreshes after plan task import; **no** TaskCard/CRUD/Focus in band) |
| Material detail **View linked tasks** deep link to filtered **`/tasks`** (`/tasks?courseId=<uuid>&materialId=<uuid>` via `buildTasksPageMaterialLink`; secondary **View tasks on course** → `/courses/:courseId`) | **Yes** (TASK-MATERIAL-NAV-B1 — **TASK-MATERIAL-FILTERS-E1** later expanded **`/tasks`** to full URL-persisted bidirectional filters; **TASK-MATERIAL-UNLINKED-A1** added **`materialId=none`**; **`materialId`** client-side only) |
| Backend **`GET /api/tasks?materialId=`** / **`GET /api/courses/:id/tasks?materialId=`**; URL-persisted task filters on **`/courses/:id`** | **Deferred** (**`/tasks`** URL-persisted filters shipped in **TASK-MATERIAL-FILTERS-E1** + **`materialId=none`** in **TASK-MATERIAL-UNLINKED-A1** — **`courseId`**, **`materialId`**, **`status`**; **`materialId`** client-side only; material detail deep link shipped in **TASK-MATERIAL-NAV-B1**)
| Start Focus backend API (`POST /api/focus`, complete endpoint) | **Yes** (4C-1) |
| Start Focus UI (`/focus/:taskId`; pending tasks only; display-only timer) | **Yes** (4C-2 — **no** pause/resume or duration picker) |
| Mark task incomplete after focus | **Deferred** (future) |
| Import generated **plan tasks** into **`study_tasks`** | **Yes** (Phase **10B** — `POST /api/study-materials/:materialId/import/tasks`; server-set **`source='plan'`**; dedupe) |
| Import generated **plan flashcards** into **`public.flashcards`** | **Yes** (Phase **10B** — `POST /api/study-materials/:materialId/import/flashcards`; server-set **`source='plan'`**; dedupe; plan not cleared) |
| Material-detail **manual flashcard CRUD** (create, edit, delete saved rows) | **Yes** (3B-e on `/study-materials/:materialId`) |
| Global **`/flashcards`** page (create, list, study, filter, edit/delete saved rows) | **Yes** (3B-f + **3B-g** — create with required course + optional material) |
| Flashcard **advanced study** (saved DB vs plan JSON) | **Partially shipped** — **saved DB flashcards:** Known/Unknown review (**A2**), mastery filter (**A3**), Due now filter (**A4b**), SRS-lite scheduling on review (**A4a**), dashboard **`dueFlashcardsCount`** (**A4c**). **Plan JSON flashcards** (**3B-a**): flip/reveal only — **no** review API. **Deferred:** course-level management; bulk create; full SM-2/Anki; backend `?due=now` / `?mastery=`; URL-persisted filters; dashboard charts; admin due cards |
| Route `/courses/:id/generate` | **Deferred** — use `/study-materials/:materialId` |
| Table **`study_tasks`** + manual backend API | **Yes** (3A-a/b) — course + global UI (3A-c–3A-e) + plan task import (3A-f) |
| Table **`flashcards`** + RLS | **Yes** (3B-b applied on Supabase) |
| Backend flashcards **CRUD + review API** | **Yes** (3B-c + **FLASHCARD-REVIEW-A1** + **A4a** — includes **`POST /api/flashcards/:flashcardId/review`**) |
| Material-detail **saved DB flashcards** + **plan import** | **Yes** (3B-d) |
| Global route **`/flashcards`** (UI) | **Yes** (3B-f–**3B-g** — create, filter, study, edit/delete; plan import remains on material detail) |
| Table **`trello_sync_logs`** + RLS (no credentials stored) | **Yes** (4A-0 applied on Supabase) |
| Trello sync **`POST /api/trello/sync`** (manual apiKey/token/listId; per-task `status` results) | **Yes** (4A-1 backend) |
| Trello sync **UI** (`/trello`, clear credentials after sync) | **Yes** (4A-2 — frontend calls backend only) |
| Per-row sync status `skipped` (e.g. already synced) | **Yes** (4A-0 schema + 4A-1 API) |
| `POST /api/trello/boards` + `POST /api/trello/boards/:boardId/lists` (backend discovery) | **Yes** (4B-1 — sanitized `{ id, name }`; no persistence) |
| Frontend Trello board/list picker on `/trello` | **Yes** (4B-2 — Load boards, board/list dropdowns) |
| Table **`focus_sessions`** + RLS | **Yes** (4C-0 applied on Supabase) |
| Backend **`POST /api/focus`** + **`POST /api/focus/:sessionId/complete`** | **Yes** (4C-1) |
| Frontend **`/focus/:taskId`** focus timer UI | **Yes** (4C-2) |
| Focus Sessions manual smoke (**4C-3**) | **Yes** — passed **2026-05-29**; MVP complete through DB + backend + frontend + smoke |
| Backend **`GET /api/dashboard/stats`** (aggregate user-owned stats) | **Yes** (5B + **FLASHCARD-REVIEW-A4c** — counts only; includes **`dueFlashcardsCount`**; no plan JSON/content/credentials/Q/A) |
| Dashboard **`totalFocusMinutes`** (backend stat) | **Yes** (5B — completed sessions only) |
| Student dashboard **frontend UI** (`/dashboard`) | **Yes** (5C — consumes **5B** stats API; read-only; mount fetch + **Try again** + **Refresh stats**) |
| **`DashboardContext`/cross-page dashboard refresh after mutations** | **Yes** (5C.1 — invalidation-only **`refreshStats()`**; stats remain local to **`DashboardStub`**; **not** a global stats cache) |
| Dashboard **polling / WebSockets / cross-tab sync / visibility refetch** | **Deferred** — **5C.1** implements PRD §12.5 manual refetch-after-mutations only |
| Admin auth foundation (`requireAdmin`, `GET /api/admin/access-check`) | **Yes** (6A-1) |
| Admin aggregate stats API (`GET /api/admin/stats`) | **Yes** (6A-2 — aggregate-only; Trello sync today breakdown + `systemHealth.backend`) |
| Admin dashboard frontend UI (`/admin`) | **Yes** (6A-3 — consumes stats API; presentation **8C-3D**; no logs/user management) |
| Global **`AppShell`** + workspace UI polish (**8C-1**–**8C-3D**) | **Yes** — all protected workspace routes; auth pages outside shell |
| Admin logs / user list / role management / Gemini admin metrics | **Deferred** — no **`api_logs`** table; **`GET /api/admin/logs`** not implemented |

### Architecture and env (unchanged intent)

- Frontend → Backend → document-service → Gemini (ADR 002)
- `DOCUMENT_SERVICE_URL` — backend only; `GEMINI_API_KEY` — document-service only; frontend — `VITE_API_URL` + Supabase anon key only; service role — backend only

---

## 1. Product Overview

### Product Name

StudyOps AI

### One-line Description

StudyOps AI is a **browser-based web application** that helps students turn raw study material into actionable study tasks, flashcards, Trello cards, focus sessions, and progress analytics.

### Product platform

StudyOps AI is a **web application only** — students use it in a **desktop or mobile browser**. It is **not** a native mobile app, Android app, iOS app, phone app, or app-store product. **Responsive web layout** (including narrow browser viewports, e.g. **~375px** width checks) supports the same web UI in smaller windows; that is **responsive browser testing**, not mobile-app product scope.

### Product Goal

The goal of StudyOps AI is to help students move from unstructured study material to an organized learning workflow.

Instead of only storing tasks like a regular to-do app, StudyOps AI analyzes study content and creates a practical study plan that the student can actually execute.

### Core Value

Students often have many documents, summaries, slides, assignments, exams, and deadlines, but they struggle to convert this material into a concrete action plan.

StudyOps AI solves this by transforming study material into:

- summaries
- key topics
- study tasks
- flashcards
- Trello cards
- focus sessions
- progress analytics

---

## 2. Target Users

### Primary User — Student

A student who wants to organize study material into actionable work.

The student can:

- create courses
- paste study material
- generate AI-based study tasks and flashcards
- send selected tasks to Trello
- run focus sessions
- track progress

### Secondary User — Admin

An admin user who monitors system usage and operational logs.

**Implemented today:** platform **aggregate statistics** on **`/admin`** (**6A-2/6A-3**) — counts only; **no** per-request log tables in UI.

**Planned / not implemented today** (PRD target; requires **`api_logs`** and related APIs):

- Gemini API logs
- Trello sync log viewer (sync **attempts** are stored in **`trello_sync_logs`** for backend audit; **no** admin log UI)
- system error feeds
- detailed operational log browsing

**Note:** Admin users are created manually through Supabase admin panel or database seeding. Students cannot self-register as admins.

---

## 3. MVP Scope

### In Scope for MVP

The MVP will include:

**User authentication**

- register (student role only)
- login
- student/admin role handling

**Course management**

- create course
- view user courses

**Study material input**

- paste study text
- PDF upload is not required for MVP

**AI document processing**

- send study text to Document Processing Microservice
- call Gemini API from the microservice only
- generate summary, key topics, tasks, flashcards, difficulty, and tags/topics

**Study tasks**

- display generated tasks
- edit task fields: title, description, priority, estimated minutes
- mark tasks as completed

**Flashcards**

- display generated flashcards
- basic question/answer view

**Implemented today (saved DB flashcards — beyond MVP-era flip-only scope):** Known/Unknown review after reveal; client-side mastery and **Due now** filters; SRS-lite scheduling via **`POST /api/flashcards/:flashcardId/review`** (not full SM-2/Anki). **Plan JSON flashcards** on material detail remain flip/reveal preview only — no review persistence.

**Trello integration**

- manual Trello API key/token input (not saved)
- manual Trello List ID input for MVP
- send selected study tasks as Trello cards (required)
- optional: fetch boards/lists if time permits
- log sync success/failure

**Focus sessions**

- Pomodoro-style 25/5 option
- start focus session from a task
- finish session
- optionally mark task completed
- save focus minutes

**Student dashboard**

- number of generated tasks
- number of completed tasks
- total focus minutes
- number of tasks synced to Trello
- progress by course

**Admin dashboard**

- Gemini API logs
- Trello sync logs
- system errors
- API usage statistics
- basic logs view

**Development workflow artifacts**

- PRD
- AGENTS.md
- CLAUDE.md
- SKILLS.md
- ADRs
- AGENT_MEMORY.md
- explicit workflows
- Testing Agent
- Supervisor Agent
- Security Review Agent
- CI/CD

---

## 4. Out of Scope for MVP

The following are intentionally excluded from the first version:

- full PDF upload and parsing
- full **OAuth2 authorization-code** Trello integration (shipped today: **implicit/token connect** + encrypted storage + connected-account sync + board/list defaults — **A2–A6**; see built summary above)
- Google Calendar integration
- Google Maps integration
- Stripe or payments
- **native mobile app** (iOS/Android), app-store product, phone-first native shell, or installable native client — **responsive web in the browser remains in MVP scope**
- real-time collaboration
- full **SM-2 / Anki** spaced repetition (`ease_factor`, per-review history table) — **note:** SRS-lite scheduling on **saved DB flashcards** is shipped (**FLASHCARD-REVIEW-A4a**)
- full AI chat interface
- background polling
- mass Trello synchronization
- deleting Trello cards
- full microservices architecture for every module
- GDPR compliance and data retention
- load testing and APM tools
- Docker containerization
- production deployment strategy
- advanced analytics

These may be listed as future features.

---

## 5. High-Level Architecture

### Architecture Decision

The system will use a Modular Monolith for the main backend plus a separate Document Processing Microservice.

### Architecture Diagram

```
React Frontend
      ↓
Main Backend / API Gateway
      ↓
Modules:
- Auth
- Courses
- Study Tasks
- Flashcards
- Trello
- Focus Sessions
- Admin
- Logs

      ↓ HTTP
Document Processing Microservice
      ↓
Gemini API
```

### Rationale

The main backend remains a modular monolith to keep the MVP feasible, simple to deploy, and easy to reason about.

The Document Processing Microservice is separated because Gemini processing has different characteristics from normal CRUD logic:

- external AI API dependency
- rate limits
- invalid JSON risk
- slower responses
- schema validation requirements
- different error handling needs

---

## 6. Tech Stack

### Runtime

- **Node.js 20.6 or newer** (required for `node --env-file` in backend and document-service npm scripts; built-in test runner)

### Frontend

- React
- Vite

### Backend

- Node.js 20.6+
- Express

### Document Processing Microservice

- Node.js 20.6+
- Express
- Gemini API

### Database and Auth

- Supabase Auth
- Supabase PostgreSQL

### Optional Storage

- Supabase Storage, only if PDF upload is later added

### External APIs

- Gemini API
- Trello API

### Testing

- Jest / Vitest
- Supertest for backend integration tests
- Optional Playwright for E2E tests

### CI/CD

- GitHub Actions

### AI Development Tools

- NotebookLM
- ChatGPT / Claude
- Cursor
- GitHub Copilot
- Stitch, optional for design
- Codex CLI, optional

---

## 6.5 Tech Stack Details

### Schema Validation

- **Zod** for runtime schema validation
- Use Zod to validate:
  - Gemini API responses
  - API request bodies
  - Environment variables
  - Form inputs

### Frontend State Management

- **React useState/useEffect** for local component state
- **React Context** for shared state (auth, user profile)
- **No Redux** for MVP
- Manual refetch after mutations (create course, complete task, etc.)

### Frontend Routing

- **React Router v6**
- Protected routes using custom `<ProtectedRoute>` wrapper
- Route structure:
  - `/` - landing/login
  - `/register` - registration
  - `/dashboard` - student dashboard
  - `/courses` - course list
  - `/courses/:id` - single course view
  - `/courses/:id/generate` - study material input
  - `/tasks` - all tasks view
  - `/flashcards` - flashcards view
  - `/trello` - Trello integration
  - `/focus/:taskId` - focus session
  - `/admin` - admin dashboard (role-protected)

### API Structure

- **Express REST API**
- **JSON** request/response bodies
- **JWT** authentication (from Supabase)
- Middleware order: CORS → JSON parser → auth → routes → error handler

---

## 7. Core User Flows

### 7.1 Student Registration and Login

- User opens the application
- User registers with email and password
- System creates user with role='student' (role is NOT selectable)
- System authenticates user through Supabase Auth
- User is redirected to student dashboard

**Success criteria:**

- user can register as student only
- user can login
- user cannot access protected pages without login
- student cannot access admin pages

**Error states:**

- invalid credentials
- expired session
- Supabase auth error

---

### 7.2 Create Course

- Logged-in student clicks Create Course
- User enters course name
- Backend creates course linked to the current user
- Course appears in dashboard

**Success criteria:**

- course is saved in database
- course belongs to current user
- other users cannot access it

**Error states:**

- empty course name
- course name too short (<3 chars) or too long (>100 chars)
- database error
- unauthorized request

---

### 7.3 Generate Study Plan from Text

- Student selects a course
- Student pastes study material text
- Student clicks Generate Study Plan
- Backend sends request to Document Processing Microservice
- Document Processing Microservice calls Gemini API
- Gemini returns structured study output
- Microservice validates output schema with Zod
- Backend saves clean structured output in Supabase
- Frontend displays summary, tasks, and flashcards

**Success criteria:**

- generated output includes summary, key topics, tasks, flashcards, difficulty, and tags/topics
- output is saved in database
- user can view generated content

**Error states:**

- empty text
- text too short (<100 chars)
- text too long (>50,000 chars)
- Gemini API failure
- Gemini rate limit / quota error
- Gemini timeout (>30 seconds)
- invalid Gemini JSON
- Zod schema validation failure
- microservice unavailable

---

### 7.4 View and Manage Study Tasks

- Student views generated study tasks
- Student can see title, description, priority, estimated minutes, difficulty, and tags/topics
- Student can edit: title, description, priority, estimated minutes
- Student cannot edit: difficulty, tags (AI-generated, read-only)
- Student can mark task as completed
- Dashboard updates progress

**Success criteria:**

- tasks are linked to course and user
- completed tasks update dashboard
- user cannot see another user's tasks

**Error states:**

- missing task
- unauthorized access
- database update failure
- invalid field values

---

### 7.5 View Flashcards

- Student opens flashcards section
- System displays question/answer cards
- Student can flip or view answer

**Implemented today — two surfaces:**

- **Saved DB flashcards** (`public.flashcards` on material detail and **`/flashcards`**): flip/reveal study; after reveal, **Known** / **Unknown** call **`POST /api/flashcards/:flashcardId/review`**; client-side mastery and **Due now** filters over already-loaded cards; review state and SRS-lite scheduling returned in camelCase from the API.
- **Plan JSON flashcards** (generated plan preview on material detail): flip/reveal only — **no** review API and **no** persisted review state.

**Success criteria:**

- saved DB flashcards are loaded from database and linked to course and user
- review outcomes update server-side mastery and SRS-lite scheduling fields on saved DB cards only

**Error states:**

- no flashcards available
- unauthorized access
- database error

---

### 7.6 Trello Sync

**Implemented (Phases 4A + 4B):** Protected **`/trello`** page; apiKey/token (password fields); **Load boards** → select board → select list (**4B-2**); task checkboxes; frontend → StudyOps backend only (`/api/trello/boards`, `/api/trello/boards/:boardId/lists`, `/api/trello/sync` — never `api.trello.com`); results with `status` `success` \| `failed` \| `skipped` and summary counts; credentials cleared from React state after sync (not persisted in DB or browser storage). Manual Trello list ID lookup is **not** required for the main flow.

**OAuth account connection (A2 + A3 + A4-STATE + A4-FRONTEND):** `trello_connections` + encrypted token storage (ADR 006); backend connect/authorize routes; **A4-STATE** signed state; frontend Connect/Disconnect on **`/trello`** + protected **`/trello/connect/callback`** (token from hash, state from query; URL cleared before complete POST; token/state not stored or logged client-side). **A5A (backend):** boards/lists/sync support stored-token mode when body omits credential keys. **A5B (frontend — live when connected):** **`/trello`** sends `{}` / `{ listId, taskIds }` only; manual credential inputs hidden; UI states sync uses connected account. **A5C (backend):** connected users **cannot** send manual `{ apiKey, token }` — **`TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED`** / **400**; must disconnect before manual fallback. **Manual fallback (disconnected only):** collapsed advanced credentials; ephemeral apiKey/token in React state only (ADR 004).

**Connected flow (A5B — primary UX when linked):**

- Student connects Trello account via Connect account (**A4-FRONTEND**)
- Student clicks **Load boards**, selects board and list from dropdowns
- Frontend sends: **`POST /api/trello/boards`** `{}`; **`POST /api/trello/boards/:boardId/lists`** `{}`; **`POST /api/trello/sync`** `{ listId, taskIds }` — **no** `apiKey`/`token` keys
- Backend uses stored decrypted token (**A5A**)

**Manual fallback flow (disconnected only — A5C):**

- Student opens Trello integration screen
- Student expands **Advanced manual credentials** and enters Trello API key and token (not saved)
- ~~Student enters Trello List ID manually~~ — **replaced by board/list picker (4B-2)** for MVP main flow
- Student enters apiKey and token, clicks **Load boards**, selects board and list from dropdowns (**4B-2**; backend **4B-1** provides `POST /api/trello/boards` then `POST /api/trello/boards/:boardId/lists`)
- Student selects study tasks to sync (checkboxes)
- Student clicks "Sync to Trello"
- Frontend sends: `POST /api/trello/sync` with `{ apiKey, token, listId, taskIds: [...] }` in body
- Backend validates credentials format
- Backend calls Trello API for each selected task
- Backend creates Trello card with:
  - `name` = task.title
  - `desc` = task.description + tags
  - `idList` = provided listId
- Backend saves sync log for each task
- Backend returns results: `{ results: [{ taskId, success, trelloCardId?, error? }] }`
- Frontend displays success count and any errors
- Frontend clears credentials from state after sync

**Success criteria:**

- Selected tasks become Trello cards
- Sync result is logged (without credentials)
- Partial success handled: if task 1 succeeds but task 2 fails, both are logged separately
- User sees clear feedback on which tasks succeeded/failed

**Error states:**

- Invalid Trello token format (validate before sending)
- Trello API authentication error (401)
- Trello API unavailable (500, 503)
- Trello rate limit (429) - show "Please wait and try again"
- Partial sync failure - some tasks succeed, some fail
- Network timeout - show "Connection timeout, please retry"
- User tries to sync another user's task (should never happen, frontend filters by ownership)
- Invalid List ID

---

### 7.7 Focus Session

- Student chooses a study task
- Student clicks Start Focus
- System starts a Pomodoro-style session (25 minutes focus, 5 minutes break)
- Student finishes session
- System saves focus session duration
- Student can optionally mark task as completed
- Dashboard updates focus minutes and progress

**Success criteria:**

- focus session is saved
- focus minutes update dashboard
- task completion can be updated

**Error states:**

- task not found
- unauthorized task access
- session save failure

---

### 7.8 Student Dashboard

Dashboard should show:

- total generated tasks
- completed tasks
- total focus minutes
- tasks synced to Trello
- progress by course

**Success criteria:**

- dashboard uses only current user's data
- numbers update after task completion, Trello sync, and focus session

**Update mechanism:**

- Dashboard fetches stats on mount
- Manual refetch after mutations via React Context
- No real-time updates, no polling

---

### 7.9 Admin Dashboard

**Implemented today:** protected **`/admin`** shows **aggregate** platform stats via **`GET /api/admin/stats`** (**6A-2/6A-3**) — user/course/task/focus/Trello **counts** and Trello sync **today breakdown**; **no** raw log rows, emails, or content.

**PRD target (not implemented today):**

- Gemini API logs
- Trello sync logs (table/UI)
- system errors
- API usage statistics (beyond aggregate counts)
- basic operational logs (`GET /api/admin/logs` / **`api_logs`** — deferred)

**Success criteria:**

- only admin can access admin dashboard
- admin routes require role=admin
- secrets are never displayed

**Error states:**

- regular user tries to access admin route
- logs unavailable
- database error

---

### 7.10 Input Validation Rules

#### Study Material Text

- **Minimum:** 100 characters
- **Maximum:** 50,000 characters (~10,000 words)
- **Validation:** Non-empty, trim whitespace
- **Error message:** "Study material must be between 100 and 50,000 characters"

#### Course Title

- **Minimum:** 3 characters
- **Maximum:** 100 characters
- **Validation:** Non-empty, trim whitespace, no leading/trailing spaces
- **Error message:** "Course title must be between 3 and 100 characters"

#### Password (Registration)

- **Minimum:** 8 characters
- **Requirements:** At least one letter and one number
- **Error message:** "Password must be at least 8 characters with letters and numbers"

#### Task Editable Fields

Students can edit:

- ✅ Title (3-200 chars)
- ✅ Description (0-1000 chars, optional)
- ✅ Priority (low, medium, high)
- ✅ Estimated minutes (5-480, must be positive integer)

Students cannot edit:

- ❌ Difficulty (AI-generated, read-only)
- ❌ Tags (AI-generated, read-only)
- ❌ Created date
- ❌ Course association
- ❌ User ownership

#### Session Timeout

- **Duration:** 24 hours
- **Behavior:** Supabase auto-refresh token when active
- **On expiry:** Redirect to login with message "Session expired, please log in again"

---

## 8. Gemini Output Schema

The Document Processing Microservice must return structured JSON validated with **Zod**.

### Schema Definition

```typescript
import { z } from 'zod';

export const GeminiOutputSchema = z.object({
  summary: z.string().min(50).max(2000),
  keyTopics: z.array(z.string()).min(1).max(10),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tasks: z.array(
    z.object({
      title: z.string().min(3).max(200),
      description: z.string().min(0).max(1000),
      priority: z.enum(['low', 'medium', 'high']),
      estimatedMinutes: z.number().int().min(5).max(480),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      tags: z.array(z.string()).max(5)
    })
  ).min(1).max(20),
  flashcards: z.array(
    z.object({
      question: z.string().min(10).max(500),
      answer: z.string().min(10).max(2000),
      tags: z.array(z.string()).max(5)
    })
  ).min(1).max(30)
});
```

### Example Valid Response

```json
{
  "summary": "This study material covers the fundamentals of calculus including limits, derivatives, and integrals. Key concepts include the definition of a limit, derivative rules, and basic integration techniques.",
  "keyTopics": [
    "Limits",
    "Derivatives", 
    "Integration",
    "Chain Rule",
    "Fundamental Theorem of Calculus"
  ],
  "difficulty": "medium",
  "tasks": [
    {
      "title": "Practice limit problems",
      "description": "Solve 10 limit problems from chapter 2, focusing on indeterminate forms and L'Hôpital's rule",
      "priority": "high",
      "estimatedMinutes": 45,
      "difficulty": "medium",
      "tags": ["limits", "practice"]
    },
    {
      "title": "Review derivative rules",
      "description": "Study and memorize power rule, product rule, quotient rule, and chain rule",
      "priority": "medium",
      "estimatedMinutes": 30,
      "difficulty": "easy",
      "tags": ["derivatives", "rules"]
    }
  ],
  "flashcards": [
    {
      "question": "What is the definition of a limit?",
      "answer": "The limit of f(x) as x approaches a is L if f(x) gets arbitrarily close to L as x gets arbitrarily close to a",
      "tags": ["limits", "definition"]
    },
    {
      "question": "State the power rule for derivatives",
      "answer": "If f(x) = x^n, then f'(x) = n*x^(n-1)",
      "tags": ["derivatives", "power rule"]
    }
  ]
}
```

### Validation Rules

1. Parse Gemini response with `JSON.parse()`
2. Validate with `GeminiOutputSchema.parse(data)`
3. If validation fails, throw error with Zod error details
4. Never save unvalidated output to database
5. Return validation errors to user as "AI processing failed"

### Error Handling

```javascript
try {
  const rawResponse = await callGeminiAPI(studyText);
  const parsed = JSON.parse(rawResponse);
  const validated = GeminiOutputSchema.parse(parsed);
  return validated;
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error('Gemini schema validation failed', { errors: error.errors });
    throw new Error('GEMINI_INVALID_RESPONSE');
  }
  throw error;
}
```

### Gemini Prompt Template

```
You are a study assistant. Analyze the following study material and generate a structured study plan.

Study Material:
${studyText}

Generate a JSON response with this exact structure:
{
  "summary": "A 2-3 sentence summary of the material",
  "keyTopics": ["topic1", "topic2", ...],
  "difficulty": "easy" | "medium" | "hard",
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description",
      "priority": "low" | "medium" | "high",
      "estimatedMinutes": 30,
      "difficulty": "easy" | "medium" | "hard",
      "tags": ["tag1", "tag2"]
    }
  ],
  "flashcards": [
    {
      "question": "Question text",
      "answer": "Answer text",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Requirements:
- summary: 50-2000 characters
- keyTopics: 1-10 items
- tasks: 1-20 items, each 5-480 minutes
- flashcards: 1-30 items
- Respond ONLY with valid JSON, no other text
```

### Timeout & Retry

- Gemini API timeout: 30 seconds
- No retry on timeout (return error to user)
- No retry on validation failure
- Log all Gemini calls with redacted prompts

---

## 8.5 API Response Format

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "data": {
    // actual response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // optional, only in development
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Standard Error Codes

- `AUTH_REQUIRED` - 401
- `FORBIDDEN` - 403
- `NOT_FOUND` - 404
- `VALIDATION_ERROR` - 400
- `GEMINI_API_ERROR` - 500
- `GEMINI_TIMEOUT` - 504
- `GEMINI_RATE_LIMIT` - 429
- `TRELLO_AUTH_ERROR` - 401
- `TRELLO_API_ERROR` - 500
- `DATABASE_ERROR` - 500
- `SERVER_ERROR` - 500

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Validation error
- `401` - Authentication required
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `429` - Rate limit exceeded
- `500` - Server error
- `504` - Gateway timeout (Gemini timeout)

---

## 8.6 API Endpoints

### Authentication

**POST /api/auth/register** - Register new user

- Body: `{ email, password }`
- Role is automatically set to 'student' (not selectable)
- Returns: `{ user, session }`

**POST /api/auth/login** - Login

- Body: `{ email, password }`
- Returns: `{ user, session }`

**POST /api/auth/logout** - Logout

- Returns: `{ success: true }`

**GET /api/auth/me** - Get current user

- Returns: `{ user }`

---

### Courses

**GET /api/courses** - List user's courses

- Returns: `{ courses: [...] }`

**POST /api/courses** - Create course

- Body: `{ title }`
- Returns: `{ course }`

**GET /api/courses/:id** - Get single course

- Returns: `{ course, stats: { totalTasks, completedTasks, totalFlashcards } }`

---

### Study Materials & Generation

**Implemented (material-scoped — Phases 2D–2F, 2L-a/b/c):**

- **`POST /api/study-materials/:materialId/generate`** — body **`{}` strict**; backend loads saved owned material `content` after ownership check; Zod-validates plan; UPSERTs **latest** plan per material; returns `{ materialId, courseId, plan, savedAt }`
- **`GET /api/study-materials/:materialId/generated-plan`** — load saved plan for owned material
- **`DELETE /api/study-materials/:materialId/generated-plan`** — clear saved plan (idempotent)

Frontend: Generate / load / clear on **`/study-materials/:materialId`**; plain-text display; **import plan tasks** (3A-f) and **import plan flashcards** (3B-d) use separate flows — not part of generate body.

**Deferred (PRD target MVP — not implemented):**

**POST /api/courses/:courseId/generate** - Generate study plan from client paste

- Body: `{ studyText }`
- Returns: `{ material, tasks: [...], flashcards: [...] }`
- Intended flow: validate studyText → document-service → Gemini → Zod → save material/tasks/flashcards in one step. **Use material-scoped generate above instead.**

---

### Tasks

**GET /api/tasks** - List all user tasks (across all courses)

- Query params: `?courseId=...&status=pending|completed`
- Returns: `{ tasks: [...] }`

**GET /api/tasks/:id** - Get single task

- Returns: `{ task }`

**PATCH /api/tasks/:id** - Update task

- Body: `{ title?, description?, priority?, estimatedMinutes? }`
- Returns: `{ task }`
- Note: Cannot update status via this endpoint

**POST /api/tasks/:id/complete** - Mark task complete

- Returns: `{ task }`

---

### Flashcards

**Implemented (Phases 3B-c through 3B-g + FLASHCARD-REVIEW-A1–A4c):** Backend REST (3B-c) + review endpoint (**A1**, **A4a**); material-detail frontend (3B-d **10B** list/import; 3B-e manual CRUD; **A2** Known/Unknown; **A3** mastery filter; **A4b** Due now filter); global **`/flashcards`** (3B-f/3B-g list/filter/study/edit/delete/create + review filters) — see `docs/IMPLEMENTATION_STATUS.md`. **Saved DB flashcards** load via `GET` (optionally filtered by `courseId` / `materialId` only — **no** `?due=now` / `?mastery=`); create via `POST /api/courses/:id/flashcards`; global edit/delete via `PATCH` / `DELETE`; plan import on material detail via **`POST /api/study-materials/:materialId/import/flashcards`** (**10B**). **Plan JSON** flip/reveal study (**3B-a**) has **no** review API.

**GET /api/flashcards** - List flashcards

- Query params: `?courseId=...`, `?materialId=...` (optional; ownership verified before list)
- Returns: `{ flashcards: [...] }` (camelCase; no `userId`; each card may include `source`, `mastery`, `lastReviewedAt`, `reviewCount`, `knownCount`, `unknownCount`, `nextReviewAt`, `reviewIntervalDays`)

**POST /api/courses/:id/flashcards** - Create flashcard

- Body: `{ question, answer, tags?, materialId? }` — strict; cannot set `userId`, `courseId`, `source`, review/scheduling fields, or timestamps
- Returns: `{ flashcard }` (201)

**PATCH /api/flashcards/:flashcardId** - Update flashcard

- Body: at least one of `question`, `answer`, `tags`, `materialId` (nullable to unlink)
- Returns: `{ flashcard }`
- Review/scheduling fields (`mastery`, counters, `nextReviewAt`, `reviewIntervalDays`) are **not** writable via PATCH

**POST /api/flashcards/:flashcardId/review** - Record review outcome (**implemented** — **FLASHCARD-REVIEW-A1** + **A4a**)

- Auth: **`requireAuth`**
- Body: `{ outcome: "known" | "unknown" }` strict (Zod)
- Server computes review state and SRS-lite scheduling: **known** from **new**/**learning** → `mastery = known`, interval **1** day, next review tomorrow; **known** from **known** → interval doubles up to **90** days; **unknown** → `mastery = learning`, interval **0**, next review tomorrow
- Returns: `{ flashcard }` (camelCase; includes review/scheduling fields)
- Wrong-owner or missing → neutral **404** “Flashcard not found”

**DELETE /api/flashcards/:flashcardId** - Delete flashcard

- Returns: `{ deleted: true }`

Wrong-owner or missing resources → neutral **404** (Course / Study material / Flashcard not found).

**Deferred:** Bulk create; AI/Gemini flashcard generation; plan import on `/flashcards`; course-level flashcard management; **full SRS** (SM-2/Anki, `ease_factor`, per-review history table); backend `?due=now` / `?mastery=`; pagination/rate limiting; URL-persisted flashcard filters; dashboard charts; admin due-card metrics; notifications/calendar reminders.

---

### Trello Integration

**POST /api/trello/sync** - Sync tasks to Trello (**implemented** — Phases 4A-1 backend + 4A-2 frontend)

- Body: `{ apiKey, token, listId, taskIds: [...] }`
- Note: Credentials in body, NOT in query params
- Returns: `{ results: [{ taskId, status: "success"|"failed"|"skipped", trelloCardId?, error? }], summary: { total, success, skipped, failed } }` (implemented shape uses `status` enum, not boolean `success` alone)
- Credentials are NOT persisted
- **Frontend:** Route **`/trello`** — credential form, task selection, results display; calls this endpoint only; clears credentials after sync attempt; never calls `api.trello.com` directly

**POST /api/trello/boards** - Fetch Trello boards (**implemented** — Phase **4B-1**)

- Body: `{ apiKey, token }` (strict Zod; unknown fields rejected)
- Note: Credentials in body, NOT in query params; NOT persisted
- Returns: `{ boards: [{ id, name }] }` — open boards only, sorted by name, max 500
- **Frontend:** Wired on `/trello` via **`fetchTrelloBoards`** (**4B-2**); frontend must call this backend route only (never Trello directly)

**POST /api/trello/boards/:boardId/lists** - Fetch lists for a board (**implemented** — Phase **4B-1**)

- Body: `{ apiKey, token }`
- Path: `boardId` — alphanumeric, 1–64 chars
- Returns: `{ lists: [{ id, name }] }` — open lists only, sorted by name, max 500
- **Approved refinement:** Separate from boards endpoint (lazy load after board selection) instead of one nested boards+lists payload in older PRD examples

**GET /api/trello/connection** - Connection status (**implemented** — **A3** + **A4-FRONTEND**)

- Auth: **`requireAuth`**
- Returns: `{ connected: false }` or connected metadata only — `{ connected: true, trelloMemberId, trelloUsername, scopes, expirationPolicy, expiresAt, defaultBoardId, defaultListId, connectedAt, updatedAt }` (flat A3 contract; **no** token/ciphertext)
- **User-facing:** **`TrelloConnectionPanel`** on **`/trello`** via **`fetchTrelloConnection`**

**GET /api/trello/authorize-url** - Trello authorize URL (**implemented** — **A3** + **A4-STATE** + **A4-FRONTEND**)

- Auth: **`requireAuth`**
- Returns: `{ authorizeUrl }` — Trello implicit grant URL (`response_type=token`, `callback_method=fragment`, `scope=read,write`, `expiration=never`, `name=StudyOps`; `return_url` = `FRONTEND_URL/trello/connect/callback?state=<signed-state>`)
- Signed state bound to authenticated user (**A4-STATE**); state not returned separately
- Requires server `TRELLO_API_KEY`; missing key → **503**
- **User-facing:** **Connect account** on **`/trello`** redirects to returned URL

**POST /api/trello/connect/complete** - Validate and store Trello token (**implemented** — **A3** + **A4-STATE** + **A4-FRONTEND**)

- Body: `{ token, state }` strict (trimmed; token max 128 chars; state max 2048 chars)
- Verifies signed OAuth state **before** Trello `GET /members/me` and **before** encrypted upsert
- Invalid/missing/tampered/expired/foreign state → `TRELLO_OAUTH_STATE_INVALID` / 400 (generic message)
- Returns connected metadata only (same flat shape as **GET /connection**)
- **User-facing:** protected **`/trello/connect/callback`** (token from hash, state from query; URL cleared before POST)

**POST /api/trello/disconnect** - Revoke and remove connection (**implemented** — **A3** + **A4-FRONTEND**)

- Body: `{}` strict
- Best-effort Trello token revoke; hard-deletes local `trello_connections` row
- Returns: `{ connected: false }`
- **User-facing:** **Disconnect** on **`/trello`**

**PATCH /api/trello/connection/defaults** - Save preferred board/list (**implemented** — **A6**)

- Auth: **`requireAuth`**
- Body: `{ boardId, listId }` strict (Trello-safe alphanumeric ids; max 64 chars)
- Connected users only — updates authenticated user's `trello_connections.default_board_id` / `default_list_id`
- Returns connected metadata only (same flat shape as **GET /connection**); **no** token/ciphertext
- Not connected → **`TRELLO_NOT_CONNECTED`** / **400**
- **User-facing:** connected **`/trello`** auto-saves on list selection; preselects saved board/list after **Load boards** when still available

---

### Focus Sessions

**POST /api/focus** - Start focus session

- Body: `{ taskId, durationMinutes }` (durationMinutes defaults to 25)
- Returns: `{ session }`

**POST /api/focus/:sessionId/complete** - End focus session

- Body: `{ completedTask: boolean }` (whether to mark task as complete)
- Returns: `{ session, task? }`

---

### Dashboard

**GET /api/dashboard/stats** - Get student stats (**implemented** — Phases **5B** + **FLASHCARD-REVIEW-A4c**)

- Returns aggregate counts only (no plan JSON, flashcard Q/A, or credentials). **`dueFlashcardsCount`** — owned saved DB flashcards where **`next_review_at IS NULL OR next_review_at <= now`** (count only).
- **Frontend (`/dashboard`):** **At a glance** → **Learning assets** shows **Due now** stat; when **`dueFlashcardsCount > 0`**, **Ready for review** links to **`/flashcards`** only (**no** URL query params / deep link to Due now filter).

```json
{
  "totalTasks": 42,
  "completedTasks": 15,
  "totalFocusMinutes": 350,
  "trelloSyncedTasks": 8,
  "dueFlashcardsCount": 3,
  "courseStats": [
    { "courseId": "...", "courseName": "...", "completedTasks": 5, "totalTasks": 10 }
  ]
}
```

---

### Admin (role='admin' required)

**Implemented (Phases 6A-1 + 6A-2 + 6A-3):** Backend **`requireAuth` + `requireAdmin`** on **`/api/admin/*`**; **`requireAdmin`** verifies **`profiles.role`** from DB — not frontend role. **`GET /api/admin/access-check`** returns **`{ admin: true }`** only. **`GET /api/admin/stats`** returns **platform-wide aggregate counts only** (no raw rows, PII, content, or Trello card IDs). Frontend **`/admin`** consumes stats via backend; **`AdminRoute`** is UX-only.

**GET /api/admin/stats** - Get admin statistics (**implemented**)

- Returns aggregate-only JSON, e.g.:

```json
{
  "totalUsers": 50,
  "totalCourses": 120,
  "totalStudyMaterials": 80,
  "totalGeneratedPlans": 40,
  "totalTasks": 1500,
  "pendingTasks": 900,
  "completedTasks": 600,
  "totalFlashcards": 200,
  "totalFocusMinutes": 3200,
  "completedFocusSessions": 128,
  "trelloSyncedTasks": 45,
  "trelloSyncAttemptsToday": 12,
  "trelloSyncSucceededToday": 10,
  "trelloSyncFailedToday": 1,
  "trelloSyncSkippedToday": 1,
  "systemHealth": { "backend": "ok" }
}
```

**Deferred:** **`GET /api/admin/logs`** — Get system logs (requires future **`api_logs`** table)

- Query params: `?service=gemini|trello|system&limit=100`
- Returns: `{ logs: [...] }`
- **Not implemented** — no Gemini call/error metrics in admin stats today

---

### Document Processing Microservice

**POST /process** - Process study material

- Body: `{ studyText }`
- Returns: Gemini output schema (see Section 8)
- Internal endpoint, not exposed to frontend

---

## 9. Data Model Draft

### profiles

- id
- email
- role: student | admin
- created_at

**Note:** In the profiles table, `id` is the Supabase Auth user id (`auth.users.id`). The `profiles` table does not include a separate `user_id` column. Future user-owned tables will use `user_id = auth.uid()`.

### courses

- id
- user_id
- title
- created_at
- updated_at

### study_materials

- id
- course_id
- user_id
- input_text
- summary
- key_topics
- difficulty
- created_at

### study_tasks

- id
- course_id
- material_id
- user_id
- title
- description
- priority
- estimated_minutes
- difficulty
- tags
- status: pending | completed
- trello_card_id nullable
- created_at
- updated_at

### flashcards

- id
- course_id
- material_id
- user_id
- question
- answer
- tags
- source: manual | plan (**10B**)
- mastery: new | learning | known (**FLASHCARD-REVIEW-A1**)
- last_reviewed_at
- review_count
- known_count
- unknown_count
- next_review_at nullable (**FLASHCARD-REVIEW-A4a** — NULL means due immediately / never reviewed)
- review_interval_days (**FLASHCARD-REVIEW-A4a** — whole-day SRS-lite interval; not SM-2/Anki)
- created_at
- updated_at

### focus_sessions

- id
- user_id
- course_id
- task_id
- duration_minutes
- completed_task boolean
- started_at
- ended_at

### trello_sync_logs

- id
- user_id
- task_id
- status: success | failed | partial
- trello_card_id nullable
- error_message nullable
- created_at

### api_logs

- id
- user_id nullable
- service: gemini | trello | supabase | system
- operation
- status
- error_message nullable
- metadata redacted
- created_at

---

## 9.5 Permissions Matrix


| Resource            | Student (Own) | Student (Other) | Admin   | Anonymous |
| ------------------- | ------------- | --------------- | ------- | --------- |
| Register/Login      | ✅             | -               | ✅       | ✅         |
| View own profile    | ✅             | ❌               | ✅       | ❌         |
| Create course       | ✅             | ❌               | ✅       | ❌         |
| View own course     | ✅             | ❌               | ✅ (all) | ❌         |
| View own tasks      | ✅             | ❌               | ✅ (all) | ❌         |
| Edit own task       | ✅             | ❌               | ✅ (all) | ❌         |
| Complete own task   | ✅             | ❌               | ✅ (all) | ❌         |
| View own flashcards | ✅             | ❌               | ✅ (all) | ❌         |
| Generate study plan | ✅             | ❌               | ✅       | ❌         |
| Sync to Trello      | ✅ (own tasks) | ❌               | ✅       | ❌         |
| Start focus session | ✅ (own tasks) | ❌               | ✅       | ❌         |
| View own dashboard  | ✅             | ❌               | ✅       | ❌         |
| View admin logs     | ❌             | ❌               | ✅       | ❌         |
| View admin stats    | ❌             | ❌               | ✅       | ❌         |


### Enforcement Rules

1. All API routes check `req.user.id` from JWT
2. Admin routes check `req.user.role === 'admin'`
3. Resource access checks: `WHERE user_id = req.user.id`
4. No cross-user data leakage
5. 401 if not authenticated
6. 403 if authenticated but insufficient permissions

---

## 10. Security Requirements

### General

- Do not commit secrets
- Do not expose secrets to frontend
- Use environment variables for secrets
- .env must never be committed
- .env.example may include placeholders only

### Supabase

- Supabase service role key must never be used in frontend
- Student users may access only their own data
- Admin routes must require role=admin
- Database schema changes require human approval

### Gemini

- Gemini API key must be server-side only
- No direct frontend calls to external Gemini APIs; the frontend uses backend endpoints (e.g. `POST /api/study-materials/:materialId/generate` with body `{}`). External Gemini calls go through the backend and document-service only.
- Gemini output must be schema-validated with Zod
- Gemini failures must be logged with redacted metadata

### Trello

- Trello credentials must not be exposed in API responses
- Trello credentials must not be logged
- Trello credentials must not be committed
- Trello credentials must be in request body, never in URL query params
- No direct frontend calls to external Trello APIs; the frontend may call backend endpoints such as `POST /api/trello/sync`
- Trello tests must use mocks

### Security Anti-Patterns

Forbidden patterns:

- hardcoded API keys
- direct frontend calls to external Gemini or Trello APIs (frontend may call backend routes such as `POST /api/trello/sync`; external APIs only via backend or document-service)
- exposing Trello credentials
- Supabase service role key in frontend
- admin route without role check
- missing user ownership checks
- trusting raw Gemini output
- real external API calls in tests
- unsafe logging
- bypassing quality gates
- Trello credentials in GET query parameters

---

## 10.5 Trello Token Handling (MVP — historical manual flow; superseded for connected users)

> **Current truth (2026-06):** Connected users use encrypted stored tokens (**ADR 006**, **A2–A6**). Manual apiKey/token below applies **only when disconnected**. See **`docs/IMPLEMENTATION_STATUS.md`** and PRD §7.6 connected flow.

### MVP Approach: No Persistence (manual credentials only)

For the original manual MVP, **manual** Trello apiKey and token are **NOT stored in database** when using disconnected fallback.

**Flow:**

1. User enters Trello API key, token, and List ID in frontend form
2. Frontend sends credentials + listId + taskIds in sync request (POST body)
3. Backend uses credentials immediately to call Trello API
4. Backend logs sync success/failure (without credentials)
5. Credentials are discarded after request completes

**Why:**

- Simpler implementation
- No encryption key management needed
- No risk of credential leakage from database
- Forces user to have credentials ready (acceptable for demo)

**User Experience:**

- User must enter Trello credentials and List ID each time they sync
- Frontend can temporarily store in component state during session
- Clear warning: "Credentials are not saved, you'll need them again next time"

### Board/list discovery (implemented — Phases 4B-1 + 4B-2)

**Backend (4B-1)** — two proxy endpoints (not one nested PRD response):

- **`POST /api/trello/boards`** — `{ apiKey, token }` → `{ boards: [{ id, name }] }`
- **`POST /api/trello/boards/:boardId/lists`** — `{ apiKey, token }` → `{ lists: [{ id, name }] }`

**Frontend (4B-2 + A5B)** — `/trello` picker calls those endpoints via `fetchTrelloBoards` / `fetchTrelloBoardLists`; user selects list; sync uses `listId` from selection. When **connected**, frontend sends **`{}`** / **`{ listId, taskIds }`** only (**A5B** + **A5A**); when **disconnected**, manual `{ apiKey, token }` in body (ADR 004). Credentials in request body only (NOT query params); manual credentials **not** persisted in DB or browser storage; frontend never calls Trello directly. **Account connect (A4-FRONTEND + A3 + A4-STATE)** is **live** on **`/trello`** and **`/trello/connect/callback`**.

### Encrypted token storage (implemented — A2 + ADR 006)

**Shipped:** user Trello tokens are encrypted at rest in **`trello_connections`** (not manual apiKey/token — those remain ephemeral per ADR 004 when disconnected).

If additional credential persistence were required later:

1. Use AES-256-GCM encryption
2. Store encryption key in environment variable (not in database)
3. Encrypt before saving to `trello_connections` table
4. Decrypt only when making Trello API calls
5. Never return decrypted credentials in API responses

### Security Rules

- ✅ Credentials only in request body, never in URL params
- ✅ Log Trello sync results, not credentials
- ✅ Mask credentials in error messages
- ✅ Use HTTPS for all Trello API calls
- ✅ Frontend validates credentials format before sending
- ❌ Never log `apiKey` or `token`
- ❌ Never include credentials in frontend state beyond sync flow
- ❌ Never return credentials in GET requests
- ❌ Never pass credentials as query parameters

---

## 11. Testing Strategy

### Required Tests (MVP)

#### Backend Integration Tests

1. **Authentication & Authorization**
  - ✅ Register creates user with role='student'
  - ✅ Login returns valid JWT
  - ✅ Protected routes reject unauthenticated requests
  - ✅ Student cannot access admin routes (403)
  - ✅ Student cannot access another student's data (403)
2. **Gemini Integration**
  - ✅ Zod schema validation passes for valid Gemini output
  - ✅ Zod schema validation fails for invalid output
  - ✅ Mocked Gemini success creates tasks and flashcards
  - ✅ Mocked Gemini timeout returns proper error
  - ✅ Mocked invalid JSON returns validation error
3. **Trello Integration**
  - ✅ Build correct Trello card payload from task
  - ✅ Mocked Trello sync success creates cards
  - ✅ Mocked Trello sync failure logs error
  - ✅ Partial success (some tasks succeed, some fail)
4. **Dashboard Calculations**
  - ✅ Correctly count total tasks
  - ✅ Correctly count completed tasks
  - ✅ Correctly sum focus minutes
  - ✅ Correctly count Trello synced tasks

### Optional Tests

#### Frontend Component Tests

- Form validation (course creation, task edit)
- Error message display
- Loading states
- Empty states

#### E2E Test (Happy Path)

- Login → Create course → Generate plan → Complete task → Sync to Trello → Focus session → View dashboard

### Testing Rules

- ✅ Automated tests must use mocked Gemini API
- ✅ Automated tests must use mocked Trello API
- ✅ No real external API calls in tests
- ✅ Mock responses must use actual schema structure

---

## 11.5 Error States Specification

### Authentication Errors


| Error                      | UI Behavior                                                   |
| -------------------------- | ------------------------------------------------------------- |
| Invalid credentials        | Show "Invalid email or password" below form                   |
| Session expired            | Redirect to login with toast "Session expired, please log in" |
| Network error during login | Show "Connection error, please try again"                     |


### Course Creation Errors


| Error                      | UI Behavior                                      |
| -------------------------- | ------------------------------------------------ |
| Empty course title         | Disable submit button, show "Title required"     |
| Title too short (<3 chars) | Show "Title must be at least 3 characters"       |
| Database error             | Show "Failed to create course, please try again" |


### Study Plan Generation Errors


| Error                        | UI Behavior                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| Empty study text             | Disable submit, show "Please paste study material"           |
| Text too short (<100 chars)  | Show "Text must be at least 100 characters"                  |
| Text too long (>50000 chars) | Show "Text too long (max 50,000 characters)"                 |
| Gemini API error             | Show "AI processing failed, please try again"                |
| Gemini timeout (>30s)        | Show "Request timed out, please try shorter text"            |
| Gemini rate limit            | Show "Service temporarily unavailable, please wait 1 minute" |
| Invalid Gemini response      | Show "Invalid response from AI, please try again"            |
| Microservice unavailable     | Show "Processing service unavailable, please try later"      |


### Task Edit Errors


| Error                        | UI Behavior                          |
| ---------------------------- | ------------------------------------ |
| Title empty                  | Show "Title required"                |
| Estimated minutes < 5        | Show "Minimum 5 minutes"             |
| Estimated minutes > 480      | Show "Maximum 8 hours (480 minutes)" |
| Unauthorized (not your task) | Show "Access denied"                 |


### Trello Sync Errors


| Error                              | UI Behavior                                                      |
| ---------------------------------- | ---------------------------------------------------------------- |
| Missing API key, token, or List ID | Disable sync button until all filled                             |
| Invalid token format               | Show "Invalid token format"                                      |
| Trello auth error (401)            | Show "Invalid Trello credentials, please check and retry"        |
| Trello API error (500)             | Show "Trello service error, please try again later"              |
| Trello rate limit (429)            | Show "Rate limit reached, please wait 30 seconds"                |
| Network timeout                    | Show "Connection timeout, please check internet and retry"       |
| Partial sync failure               | Show "Synced 3/5 tasks. Failed: [task names]. See errors below." |
| Invalid List ID                    | Show "Invalid List ID, please check and retry"                   |


### Focus Session Errors


| Error               | UI Behavior                                         |
| ------------------- | --------------------------------------------------- |
| Task not found      | Show "Task not found" and redirect to tasks list    |
| Session save failed | Show "Failed to save session, but you can continue" |


### Loading States


| Screen                | Loading Behavior                                               |
| --------------------- | -------------------------------------------------------------- |
| Login/Register        | Disable form, show spinner on button                           |
| Course list           | Show skeleton loaders for 3 course cards                       |
| Study plan generation | Show "Processing with AI..." with spinner, disable all buttons |
| Tasks list            | Show skeleton loaders for 5 task cards                         |
| Flashcards            | Show "Loading flashcards..."                                   |
| Trello sync           | Show "Syncing..." on button, disable form                      |
| Dashboard stats       | Show skeleton numbers/charts                                   |


### Empty States


| Screen             | Empty State Message                                                             |
| ------------------ | ------------------------------------------------------------------------------- |
| No courses         | "No courses yet. Create your first course to get started!" + CTA button         |
| No tasks           | "No study tasks yet. Generate a study plan to create tasks." + link to generate |
| No flashcards      | "No flashcards yet. Generate a study plan to create flashcards."                |
| No focus sessions  | "No focus sessions yet. Start a session from any task."                         |
| Admin logs (empty) | "No logs found for this filter."                                                |


---

## 12. CI/CD Requirements

GitHub Actions should run on:

- push
- pull_request

Required checks:

- install dependencies
- build frontend
- run lint
- run tests
- run dependency audit if configured
- run secret scan if configured

Suggested jobs:

- frontend checks
- backend checks
- document-service checks
- security checks

A feature cannot be considered complete if CI fails.

---

## 12.5 Dashboard Update Mechanism

### Approach: Manual Refetch After Mutations

**No real-time updates, no polling, no WebSockets for MVP.**

### Implementation

1. Dashboard fetches stats on mount: `GET /api/dashboard/stats`
2. User performs action (complete task, sync to Trello, finish focus session)
3. After successful mutation, frontend calls refetch function
4. Dashboard updates with new data

### Example Flow

```javascript
// Dashboard component
const [stats, setStats] = useState(null);

const fetchStats = async () => {
  const response = await api.get('/dashboard/stats');
  setStats(response.data.data);
};

useEffect(() => {
  fetchStats();
}, []);

// When task completed (from task list component)
const completeTask = async (taskId) => {
  await api.post(`/tasks/${taskId}/complete`);
  // Trigger refetch via context or prop callback
  onTaskCompleted(); // This calls dashboard's fetchStats()
};
```

### State Management Pattern

Use **React Context** for sharing refetch triggers:

```javascript
// DashboardContext.js
const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  
  const refreshStats = async () => {
    const response = await api.get('/dashboard/stats');
    setStats(response.data.data);
  };
  
  return (
    <DashboardContext.Provider value={{ stats, refreshStats }}>
      {children}
    </DashboardContext.Provider>
  );
};

// Usage in task component
const { refreshStats } = useContext(DashboardContext);

const completeTask = async (taskId) => {
  await api.post(`/tasks/${taskId}/complete`);
  refreshStats(); // Dashboard auto-updates
};
```

### When to Refetch

- ✅ After creating course
- ✅ After completing task
- ✅ After Trello sync
- ✅ After finishing focus session
- ✅ On dashboard page navigation (always fresh on visit)

### What NOT to Do

- ❌ No polling every N seconds
- ❌ No WebSocket connections
- ❌ No optimistic updates (too complex for MVP)
- ❌ No caching strategy (use browser cache defaults)

---

## 13. Agentic Development Requirements

The project must demonstrate Agentic Software Engineering, not just code generation.

Required artifacts:

- PRD.md
- PRD_REVIEW.md
- AGENTS.md
- CLAUDE.md
- SKILLS.md
- AGENT_MEMORY.md
- ADRs
- explicit workflows
- Testing Agent definition
- Supervisor Agent definition
- Security Review Agent definition
- CI/CD workflow
- Supervisor review prompt
- Security audit prompt

### Required Agent Workflow

Human goal
→ Orchestrator creates explicit workflow
→ Human approves
→ Implementation Agent writes code
→ Testing Agent writes tests
→ Pre-commit hooks run lint/tests/secrets
→ Supervisor Agent reviews diff
→ Security Review Agent reviews risks
→ Human performs final judgment
→ GitHub Actions validates
→ Documentation and memory update if needed

### Definition of Done

A feature is done only if:

- it matches PRD scope
- it respects relevant ADRs
- it does not violate AGENTS.md
- tests were added or updated
- lint passes
- no secrets are exposed
- Supervisor review passed
- Security review passed if relevant
- documentation updated if behavior changed
- CI passes

---

## 13.5 File Structure

### Frontend Structure

```
/frontend
  /src
    /components
      /auth
        LoginForm.jsx
        RegisterForm.jsx
        ProtectedRoute.jsx
      /courses
        CourseList.jsx
        CourseCard.jsx
        CreateCourseModal.jsx
      /study
        StudyMaterialInput.jsx
        GeneratedPlan.jsx
      /tasks
        TaskList.jsx
        TaskCard.jsx
        TaskEditModal.jsx
      /flashcards
        FlashcardList.jsx
        FlashcardCard.jsx
      /trello
        TrelloSyncForm.jsx
      /focus
        FocusTimer.jsx
      /dashboard
        StudentDashboard.jsx
        StatsCard.jsx
      /admin
        AdminDashboard.jsx
        LogsTable.jsx
      /common
        Button.jsx
        Input.jsx
        Modal.jsx
        Loading.jsx
        EmptyState.jsx
    /context
      AuthContext.jsx
      DashboardContext.jsx
    /services
      api.js          # Axios instance with interceptors
      auth.service.js
      courses.service.js
      tasks.service.js
      trello.service.js
      focus.service.js
    /utils
      validation.js   # Zod schemas for frontend validation
      formatters.js
    /pages
      Landing.jsx
      Dashboard.jsx
      CoursePage.jsx
      TasksPage.jsx
      FlashcardsPage.jsx
      TrelloPage.jsx
      FocusPage.jsx
      AdminPage.jsx
    App.jsx
    main.jsx
  package.json
  vite.config.js
```

### Backend Structure

```
/backend
  /src
    /modules
      /auth
        auth.routes.js
        auth.controller.js
        auth.middleware.js
      /courses
        courses.routes.js
        courses.controller.js
        courses.service.js
      /tasks
        tasks.routes.js
        tasks.controller.js
        tasks.service.js
      /flashcards
        flashcards.routes.js
        flashcards.controller.js
      /trello
        trello.routes.js
        trello.controller.js
        trello.service.js
      /focus
        focus.routes.js
        focus.controller.js
      /dashboard
        dashboard.routes.js
        dashboard.controller.js
      /admin
        admin.routes.js
        admin.controller.js
        admin.middleware.js
    /shared
      /middleware
        errorHandler.js
        cors.js
        logger.js
      /utils
        logger.js
        response.js   # Standard response formatter
      /validation
        schemas.js    # Zod schemas
    /config
      supabase.js
      env.js          # Environment validation with Zod
    server.js
    app.js            # Express app setup
  /tests
    /integration
      auth.test.js
      courses.test.js
      tasks.test.js
      trello.test.js
    /unit
      validation.test.js
      dashboard.test.js
  package.json
```

### Document Processing Microservice

```
/document-service
  /src
    /controllers
      process.controller.js
    /services
      gemini.service.js
      validation.service.js
    /schemas
      gemini.schema.js  # Zod schema for Gemini output
    /middleware
      errorHandler.js
    /config
      env.js
    /utils
      logger.js
    server.js
    app.js
  /tests
    /unit
      gemini.schema.test.js
    /integration
      process.test.js
  package.json
```

### Root Structure

```
/studyops-ai
  /frontend
    .env.example
  /backend
    .env.example
  /document-service
    .env.example
  /docs
    PRD.md
    PRD_v2.md
    PRD_REVIEW.md
    PRD_IMPROVEMENT_PLAN.md
    AGENTS.md
    CLAUDE.md
    SKILLS.md
    AGENT_MEMORY.md
    /adrs
      001-modular-monolith.md
      002-separate-document-service.md
      003-zod-validation.md
      004-no-trello-persistence.md
      005-manual-list-id-input.md
  .env.example
  .gitignore
  README.md
```

---

## 13.6 Implementation Order

### Phase 1: Foundation

**Project setup**

- Initialize frontend (Vite + React)
- Initialize backend (Express)
- Initialize document-service (Express)
- Set up Supabase project
- Configure environment variables
- Set up Git repository
- Create folder structure

**Authentication**

- Supabase Auth integration
- Register endpoint (role='student' only)
- Login endpoint
- JWT validation middleware
- Frontend login/register forms
- Protected route component
- Auth context

**Course management**

- Backend: Create course endpoint
- Backend: List courses endpoint
- Backend: Get single course endpoint
- Frontend: Course list page
- Frontend: Create course modal
- Tests: Course creation, authorization

---

### Phase 2: Core AI Features

**Document Processing Microservice**

- Gemini API integration
- Zod schema for Gemini output
- Validation service
- Error handling for Gemini failures
- Tests: Schema validation, mocked Gemini calls

**Study Plan Generation**

- Backend: Generate endpoint
- Backend: Call document-service
- Backend: Save material, tasks, flashcards
- Frontend: Study material input form
- Frontend: Display generated plan
- Loading/error states
- Tests: End-to-end generation with mocked Gemini

---

### Phase 3: Task Management

**Task features**

- Backend: List tasks endpoint
- Backend: Update task endpoint
- Backend: Complete task endpoint
- Frontend: Task list page
- Frontend: Task card component
- Frontend: Task edit modal
- Tests: Task CRUD, authorization

**Flashcards**

- Backend: List flashcards endpoint
- Frontend: Flashcard list page
- Frontend: Flashcard flip component
- Tests: Flashcard listing, authorization

---

### Phase 4: Integrations

**Trello sync**

- Backend: Trello service
- Backend: Sync endpoint (no persistence, manual List ID)
- Frontend: Trello sync form with List ID input
- Frontend: Display sync results
- Optional: Fetch boards endpoint (POST with credentials in body)
- Tests: Mocked Trello API, partial success handling

**Focus sessions**

- Backend: Start session endpoint
- Backend: Complete session endpoint
- Frontend: Focus timer component
- Frontend: Timer with 25/5 countdown
- Tests: Session creation, duration calculation

---

### Phase 5: Dashboard & Admin

**Student dashboard**

- Backend: Stats endpoint
- Backend: Dashboard calculations
- Frontend: Dashboard page
- Frontend: Stats cards
- Frontend: Course progress
- Dashboard context for refetch
- Tests: Stats calculations

**Admin dashboard**

- Backend: Admin middleware (role check)
- Backend: Logs endpoint
- Backend: Admin stats endpoint
- Frontend: Admin page
- Frontend: Logs table
- Tests: Admin authorization

---

### Phase 6: Polish & Testing

**Error handling & UX**

- All loading states
- All empty states
- All error messages
- Form validation
- Input limits enforcement

**Testing**

- Complete required test coverage
- Optional component tests
- Optional E2E test
- CI/CD setup

**Documentation**

- Complete all AGENTS.md, CLAUDE.md, SKILLS.md
- Document workflows
- Create demo script

---

### Dependencies

- Phase 1 must complete before Phase 2
- Phases 2-3 can partially overlap (tasks depend on generation)
- Phase 4 depends on Phase 3 (tasks must exist)
- Phase 5 depends on all previous (dashboard aggregates everything)
- Phase 6 is continuous but finalized at end

### Definition of Done for Each Phase

- ✅ All endpoints/components implemented
- ✅ Tests written and passing
- ✅ No console errors/warnings
- ✅ Documented in AGENT_MEMORY.md
- ✅ Reviewed by Supervisor Agent
- ✅ Security reviewed if relevant
- ✅ CI passing

---

## 14. Human Approval Required

Agent must stop and request approval before:

### Architecture & Dependencies

- Adding new npm packages
- Changing database schema
- Creating new external service integrations
- Modifying authentication flow

### Destructive Operations

- Deleting files or folders
- Renaming major modules
- Changing environment variable names
- Git force push or history rewriting

### Configuration

- Modifying CI/CD workflows
- Changing build configuration (Vite, Webpack, etc.)
- Updating deployment scripts

### Process & Documentation

- Modifying PRD, AGENTS.md, CLAUDE.md, SKILLS.md
- Creating new ADRs
- Changing workflows

### How to Request Approval

1. Stop execution
2. Output clear message: "⚠️ APPROVAL REQUIRED: [Action]"
3. Explain why approval is needed
4. Provide details of proposed change
5. Wait for explicit "approved" response before proceeding
6. If denied, request alternative approach

---

## 15. Demo Plan

The demo should show both the product and the development methodology.

### Product Demo

- Login as student
- Create course
- Paste study material
- Generate study plan with Gemini
- Show summary, tasks, and flashcards
- Send selected task to Trello
- Start and finish focus session
- Show dashboard progress
- Login/view as admin
- Show **aggregate** platform stats on **`/admin`** (**implemented** — **6A-3**)
- **Planned / not implemented today:** per-request **Gemini API logs**, **Trello sync log table UI**, and detailed error/log feeds (no **`api_logs`** table; **`GET /api/admin/logs`** not built)

### Methodology Demo

Show:

- PRD.md
- AGENTS.md
- SKILLS.md
- ADRs
- explicit workflow file
- Supervisor review prompt
- Security review prompt
- GitHub Actions
- example of AGENT_MEMORY entry

---

## 15.5 UI Screens Specification

### 1. Landing/Login Page

- Logo and app name
- Login form (email, password)
- "Register" link
- Error message display area
- Loading state on submit button

### 2. Register Page

- Email input
- Password input (min 8 chars, letter + number)
- Confirm password input
- **No role selection** (automatically student)
- "Register" button
- "Already have account? Login" link

### 3. Student Dashboard

**Navigation:** Logo, Dashboard, Courses, Tasks, Flashcards, Trello, Logout

**Stats Cards (Top Row):**

- Total Tasks: `42`
- Completed Tasks: `15`
- Focus Minutes: `350`
- Trello Synced: `8`

**Implemented today — Learning assets / At a glance:**

- **Due now:** `dueFlashcardsCount` (saved DB flashcards due for SRS-lite review)
- When count **> 0:** **Ready for review** link to **`/flashcards`** (no query params)

**Course Progress (Bottom Section):**

- Table or cards showing:
  - Course name
  - Completed tasks / Total tasks
  - Progress bar

**Actions:**

- "Create New Course" button

### 4. Course List Page

**Header:** "My Courses"
**Action:** "Create Course" button

**Course Cards (Grid):**

- Course name
- Created date
- Task stats: `5/10 tasks completed`
- "View Course" button

**Empty State:**

- Icon
- "No courses yet"
- "Create your first course to get started!"
- "Create Course" button

### 5. Single Course Page

**Header:** Course name
**Breadcrumb:** Dashboard > Courses > [Course Name]

**Tabs:**

- Study Material
- Tasks
- Flashcards

**Study Material Tab:**

- Textarea for study text input (100-50,000 chars)
- Character count: `1,234 / 50,000`
- "Generate Study Plan" button
- If already generated:
  - Summary section
  - Key topics (chips/tags)
  - Difficulty badge
  - "Regenerate" button

**Tasks Tab:**

- Filter: All / Pending / Completed
- List of task cards:
  - Title
  - Description (truncated)
  - Priority badge
  - Estimated time
  - Tags
  - "Edit" and "Complete" buttons
  - If completed: checkmark, completed date

**Flashcards Tab:**

- Grid of flashcard cards:
  - Question (front)
  - Click to flip
  - Answer (back)
  - Tags

### 6. Task Edit Modal

- Title input
- Description textarea
- Priority dropdown (low/medium/high)
- Estimated minutes input (5-480)
- Difficulty (read-only, AI-generated, displayed but not editable)
- Tags (read-only, AI-generated, displayed but not editable)
- "Save" and "Cancel" buttons

### 7. All Tasks Page

**Header:** "All Tasks"
**Filter:**

- Course dropdown (all courses + "All Courses")
- Status: All / Pending / Completed

**Task List:**

- Same task cards as course tasks tab
- Shows course name on each card
- "Start Focus" button on each task

**Empty State:**

- "No tasks yet"
- "Generate a study plan to create tasks"
- Link to courses

### 8. Trello Sync Page

**Header:** "Sync to Trello"

**Step 1: Credentials**

- Info text: "Enter your Trello API key, token, and List ID. These are not saved."
- API Key input (link to Trello developer portal)
- Token input (link to token generator)
- List ID input (text input)
- Optional: "Fetch Boards" button (if implemented)

**Step 2: Select Tasks**

- Checkbox list of all pending tasks
- Select all / Deselect all
- Shows course name for each task

**Step 3: Sync**

- "Sync Selected Tasks" button
- Loading: "Syncing..."
- Results:
  - Success count: `3 tasks synced successfully`
  - Failure list (if any): `Failed to sync: [Task Name] - Error message`
  - Per-task status: checkmark (success) or X (failure)

### 9. Focus Session Page

**Header:** Task title
**Breadcrumb:** Dashboard > Focus > [Task Name]

**Timer Display:**

- Large countdown: `24:35`
- Phase: "Focus" or "Break"
- Progress circle/bar

**Controls:**

- "Pause" / "Resume" button
- "End Session" button

**On Complete:**

- Modal: "Session Complete! 25 minutes focused."
- Checkbox: "Mark task as complete?"
- "Finish" button

### 10. Flashcards Page

**Header:** "Flashcards"
**Filters:** Course dropdown; material dropdown (when course selected); **Review state** (All, Due now, New + Learning, New, Learning, Known) — client-side over loaded cards (**no** URL-persisted filters; **no** backend `?mastery=` / `?due=now`)

**Flashcard Display (saved DB flashcards):**

- Current card (large):
  - Question
  - "Flip" button or click to flip
  - Answer (on flip)
  - After reveal: **Known** / **Unknown** (calls **`POST /api/flashcards/:flashcardId/review`**)
- Navigation: Previous / Next
- Counter: `Card 3 of 15`

**Manage list:** Edit/delete saved rows (truncated questions in list)

**Plan JSON flashcards:** Not on **`/flashcards`** — preview/study remains on material detail only; flip/reveal only, **no** review API.

**Empty State:**

- "No flashcards yet"
- "Generate a study plan to create flashcards"

### 11. Admin Dashboard

**Header:** "Admin Dashboard"
**Navigation:** Dashboard, Logs, Stats, Logout

**Stats Section:**

- Total Users: `50`
- Total Courses: `120`
- Total Tasks: `1,500`
- Gemini Calls Today: `45`
- Trello Syncs Today: `12`
- Errors Today: `3`

**Recent Activity:**

- Last 10 Gemini API calls (timestamp, user, status)
- Last 10 Trello syncs (timestamp, user, status, error if any)

### 12. Admin Logs Page

**Filter:**

- Service dropdown: All / Gemini / Trello / System
- Date range picker (optional)

**Logs Table:**

- Timestamp
- Service
- Operation
- Status (success/failed)
- Error message (if failed)

**Empty State:**

- "No logs found for this filter"

---

## 16. Future Features

Possible future features:

- PDF upload and parsing
- Trello card update/delete; OAuth single-use state nonce (connect/sync **A2–A6** shipped)
- Google Calendar integration
- full SM-2 / Anki spaced repetition (`ease_factor`, per-review history table, notifications/calendar) — SRS-lite on saved DB flashcards is already shipped
- recommendation engine for "what to study today"
- email reminders
- deployment to cloud
- more advanced admin dashboard
- E2E automation with Playwright
- User profile editing
- Course deletion
- Task/flashcard deletion
- Search and filtering
- Pagination for large lists

---

## 17. Open Questions

The following decisions can be finalized later:

- Whether PDF upload enters MVP or remains future feature
- Whether backend and document-service are deployed or run locally for demo
- Whether Admin dashboard displays full user list or only logs/statistics
- Whether Stitch-generated DESIGN.md will be applied before final demo

---

## 18. Final Positioning

StudyOps AI is both a useful student productivity product and a demonstration of Agentic Software Engineering.

The project demonstrates:

- real web application architecture
- external APIs
- database and authentication
- AI document processing
- Trello integration
- admin dashboard
- testing and CI
- context engineering
- multi-agent workflow
- supervisor review
- security review
- ADRs
- auto-memory
- human judgment

The central idea is not only to build an app with AI, but to show how AI coding agents can be managed through a professional, controlled, and safe software engineering workflow.

---

**End of PRD v2.0**