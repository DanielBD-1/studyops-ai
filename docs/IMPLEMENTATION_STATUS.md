# Implementation Status — StudyOps AI

**Purpose:** Describe what is **built today** in the repository. For full MVP intent and future features, see `docs/PRD.md`. For phase-by-phase history, see `docs/AGENT_MEMORY.md`.

**Last aligned:** Phase **BX-I5** documentation housekeeping (**2026-06-02**); **BX-I5** material cockpit visual polish shipped (commit **`c2288d4`**) — frontend-only in **`StudyMaterialDetail.jsx`**, **`GeneratedPlanSection.jsx`**, **`GeneratedPlanHistorySection.jsx`**, **`layout.css`**, **`components.css`**; prior **BX-I4** deterministic course accents (**2026-06-02**, commit **`ff65e21`**) — frontend-only in **`CourseCard.jsx`**, **`CourseDetail.jsx`**, **`DashboardStub.jsx`**, **`components.css`**, **`tokens.css`**, **`course-accent.js`**, **`dashboard-format.test.js`**; prior **BX-I3** dashboard decision layout (**2026-06-02**, commit **`bdd6f2a`**) — frontend-only in **`DashboardStub.jsx`**, **`layout.css`**, **`dashboard-recommendation.js`**, **`dashboard-format.test.js`**; prior **BX-I2** dark glass token foundation (**2026-06-02**, commit **`03ee9df`**) — CSS-only in **`tokens.css`**, **`components.css`**, **`layout.css`**; prior **DOCS-A3** alignment (**2026-06-02**) documents **12A-1**, **B1**–**B3** (commits **`00a76de`**, **`ccca764`**, **`f2de33f`**, **`e865c09`**). Prior **11A-3** (generated plan history frontend UI — **2026-05-30**); **11A-2** history REST API; **11A-1** active history DB; **10B** plan import dedupe; **10C** governance alignment; **9B** post-8C alignment. **Functional MVP** complete through **6A-3** (auth, courses, materials, material-scoped AI generate + persisted generated plan, tasks, flashcards, Trello sync with board/list picker, focus sessions, student dashboard, admin aggregate stats). **Generated plan history (11A-1 + 11A-2 + 11A-3):** migrations **010** and **011** applied manually on Supabase; multiple rows per material with one **`is_active`**; retention max **10** rows per material; GET/DELETE/generate backward compatible; history list/get-by-id/activate/delete-version REST APIs (**11A-2**); metadata-only history UI with lazy preview, restore, and delete inactive (**11A-3**); **`totalGeneratedPlans`** counts active rows only. **Plan import dedupe (10B):** material-scoped import endpoints with **`source='plan'`** and dedupe (migration **009** applied). **Hardening / docs alignment** phases **7A**–**7C** complete (**2026-05-29**). **UI / presentation polish** complete through **BX-I5** (**2026-06-02**) plus **8C-3D** (**2026-05-30**), **12A-1** material Source | AI cockpit (**2026-06-01**), and **B1**–**B3** global visual tokens / shell / cards (**2026-06-01**): **8A** baseline polish; **8B** design-reference docs alignment; **8C-1** global **`AppShell`** + design system; **8C-2A** dashboard/courses/course detail; **8C-2B** study material detail + AI zones; **8C-3A** tasks + focus; **8C-3B** flashcards; **8C-3C** Trello; **8C-3D** admin; **12A-1** material cockpit layout; **B1** tokens/typography; **B2** shell/cockpit width; **B3** cards/badges/filters; **BX-I2** dark graphite / glass token foundation + filled-button contrast fix; **BX-I3** dashboard decision layout (rule-based next-up hero, study pulse, course workload rows); **BX-I4** deterministic course accents (**`amber` | `rose` | `emerald`**) on course list/detail and dashboard workload rows; **BX-I5** material detail cockpit visual polish (Source | AI hierarchy, editor well, source-type pill, AI command surfaces, plan/history/import/library styling). **Production UI values:** dark graphite / glass in **`frontend/src/styles/tokens.css`** (Phase **BX-I2**) — electric blue primary, violet AI accent, cyan data accent; course accent token values and subtle/border aliases wired via **BX-I4**. **BX-I1** Stitch direction in **`DESIGN.md` v2.3** remains the presentation spec; chart UI, sidebar shell, and **BX-I6** / **B4** are **not automatic**. Application phases **1A–1G** and **2A–2G** are complete unless noted otherwise. Existing design screenshots may predate **8C** / **BX-I2** / **BX-I3** / **BX-I4** / **BX-I5** visuals unless recaptured (see **`docs/design/SCREENSHOT_INDEX.md`**). Generated plan persistence (Phases **2L-a/b/c**), **`study_tasks` table** (Phase **3A-a**), **`study_tasks` backend API** (Phase **3A-b**), **course-level manual task UI** (Phases **3A-c**–**3A-c.3** on `/courses/:id`), **global manual task UI** (Phases **3A-d**–**3A-e** on `/tasks`), **plan → task import** (Phase **3A-f**, superseded by **10B** import API), **flashcard study UI** (Phase **3B-a**), **`flashcards` DB foundation** (Phase **3B-b**), **flashcards backend API** (Phase **3B-c**), **flashcards frontend integration** (Phase **3B-d**), **flashcards manual CRUD UI** (Phase **3B-e**), **global flashcards page** (Phase **3B-f**), **global create flashcard UI** (Phase **3B-g**), **plan-sourced import dedupe** (Phase **10B**), **`trello_sync_logs` DB foundation** (Phase **4A-0**), **backend Trello sync API** (Phase **4A-1**), **frontend Trello sync page** (Phase **4A-2**), **Trello UI polish** (Phase **4A-3**), **backend Trello board/list discovery** (Phase **4B-1**), **frontend Trello board/list picker** (Phase **4B-2**), **`focus_sessions` DB foundation** (Phase **4C-0**), **backend Focus Sessions API** (Phase **4C-1**), **frontend Focus Sessions UI** (Phase **4C-2**), **Focus Sessions manual smoke** (Phase **4C-3**), **backend Dashboard Stats API** (Phase **5B**), **Dashboard frontend UI** (Phase **5C**), **Dashboard cross-page refresh** (Phase **5C.1**), **admin authorization foundation** (Phase **6A-1**), **backend admin aggregate stats API** (Phase **6A-2**), and **frontend admin dashboard UI** (Phase **6A-3**) are documented below.

---

## Operating constraints (cost & quotas)

- **Free Tier / minimal-cost:** Assume Free Tier or minimal-cost infrastructure (Supabase, Gemini, hosting) unless the human explicitly approves paid tiers, new subscriptions, or billable services.
- **Paid dependencies:** Do not add paid third-party APIs, new SaaS subscriptions, paid storage tiers, or other **cost-increasing** architecture without explicit human approval (same gate as new npm packages — see `AGENTS.md`).
- **Gemini quota:** HTTP **429** / `GEMINI_RATE_LIMIT` is expected **quota exhaustion**, not necessarily an application defect. Details: `docs/workflows/document-processing-workflow.md` (§ Gemini usage & quota). Live smoke: **one** Generate per attempt; **no** retry loops.
- **Before implementation:** Verify built vs deferred state in **this file**, the phase workflow, and applicable ADRs — do not assume PRD body describes what is shipped today.

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

**Backend modules (mounted in `backend/src/app.js`):** `auth`, `courses`, `study-materials`, `tasks`, `flashcards`, `trello`, `focus`, `dashboard`, `admin`.

**Authenticated UI shell (Phase 8C-1):** Protected routes render inside **`AppShell`** (sticky top bar: brand, main nav — Dashboard, Courses, Tasks, Flashcards, Trello — optional Admin link for admins, logout). Auth routes **`/`** and **`/register`** remain outside the shell.

---

## Environment boundaries (placeholders in `.env.example` only)

| Variable / key | Package | Notes |
|----------------|---------|--------|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | **backend** | Service role is **backend-only** — never in frontend or `VITE_*` |
| `SUPABASE_ANON_KEY` | **backend** | Optional in `backend/.env.example`; not exposed via `VITE_*` |
| `DOCUMENT_SERVICE_URL` | **backend** | Internal URL to document-service (e.g. `http://localhost:3002`) |
| `FRONTEND_URL` | **backend** | CORS allowlist |
| `GEMINI_API_KEY` | **document-service** | Required for `POST /process`; never in backend or frontend |
| `GEMINI_MODEL` | **document-service** | Optional model ID (default `gemini-2.5-flash-lite` in `.env.example`) |
| `VITE_API_URL` | **frontend** | Backend base URL (e.g. `http://localhost:3001`) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | **frontend** | Anon key only — session + client auth |

Never commit real `.env` files. Never document or paste real keys in issues or PRs.

---

## Database (Supabase)

**Applied tables:** `public.profiles`, `public.courses`, `public.study_materials`, `public.material_generated_plans`, `public.study_tasks`, `public.flashcards`, `public.trello_sync_logs`, `public.focus_sessions`

**`material_generated_plans` (Phases 2L-a + 11A-1 + 11A-2 + 11A-3 UI):** Multiple validated generated plan rows per `study_material_id` with **`is_active boolean`** — exactly **one active** row per material (partial unique index); inactive history retained up to **10** total rows per material (retention prunes oldest inactive after generate). `plan` jsonb (object, size-capped); RLS for `authenticated` (unchanged from **2L-a**); **`anon` has no access**; backend writes via **service role** + RPCs **`activate_material_generated_plan`** (generate) and **`reactivate_material_generated_plan`** (history activate — Phase **11A-2**) with ownership filters (see `docs/database/004-material-generated-plans-schema-and-rls.md`, **`docs/database/010-material-generated-plans-active-history.md`**, **`docs/database/011-reactivate-material-generated-plan.md`**; migrations **010** and **011** **applied manually** on Supabase). Frontend history UI (Phase **11A-3**) — metadata-only list; full plan fetched on Preview only. **No** failed-attempt rows, raw Gemini payloads, or duplicated material `content`.

**`study_tasks` (Phase 3A-a; source extended in Phase 10B):** Study task rows (`user_id`, `course_id`, optional `material_id`); RLS by `user_id = auth.uid()`; **`anon` has no access**; `source` CHECK **`manual` or `plan`** (Phase **10B** via `009_plan_source_import_dedupe.sql`). Table **applied and verified** on Supabase (see `docs/database/005-study-tasks-schema-and-rls.md`). **Plan import** (Phase **10B**) creates rows with **`source = plan`** via material-scoped import API; manual create remains **`source = manual`**.

**`study_tasks` backend API (Phase 3A-b):** Express routes with **`requireAuth`**; service-role queries always filter by authenticated `user_id`. Task responses are **camelCase** and do **not** include `userId`, study material `content`, or generated `plan` JSON. **`difficulty`** / **`tags`** are returned (defaults on create) but **not client-editable**. **`status`** is **not** PATCHable — use **`POST /api/tasks/:taskId/complete`** only. Wrong-owner or missing task → neutral **`404`** “Task not found”. **Frontend** task UI: course-level Phases **3A-c**–**3A-c.3**, global Phases **3A-d**–**3A-e**; plan import on material detail via Phase **10B** (below).

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

Normalized flashcard rows (`user_id`, `course_id`, optional `material_id`, `question`, `answer`, `tags`, `source` CHECK **`manual` or `plan`** — Phase **10B** via `009_plan_source_import_dedupe.sql`). RLS by `user_id = auth.uid()`; **`anon` has no access**; ownership triggers mirror `study_tasks`. Table **applied and verified** on Supabase on **2026-05-26** (see `docs/database/006-flashcards-schema-and-rls.md`). Material detail shows **saved DB flashcards** (study + create/edit/delete) and **generated-plan flashcards** (both may appear after import). Global page shows **all saved flashcards** with course/material filters, **create**, study, edit, and delete. **No** course-level flashcard management UI.

**`trello_sync_logs` (Phase 4A-0):** Append-only per-task Trello sync attempt log (`user_id`, `task_id`, `status` = `success` \| `failed` \| `skipped`, optional `trello_card_id`, optional sanitized `error_message` max 500). **No** credential columns (ADR 004). RLS: `authenticated` **SELECT** own rows; **`service_role` SELECT + INSERT**; owner trigger on INSERT. Table **applied and verified** on Supabase on **2026-05-26** (see `docs/database/007-trello-sync-logs-schema-and-rls.md`). **`study_tasks.trello_card_id`** is updated by **`POST /api/trello/sync`** (Phase **4A-1**) on successful card creation; still **omitted** from task GET/PATCH API responses. **Trello sync + board/list picker (4A + 4B):** end-to-end on **`/trello`** — Load boards → select board/list → sync tasks; **manually smoke-tested** (Phase **4B** picker flow, **2026-05-29**).

**`focus_sessions` (Phases 4C-0 + 4C-1 + 4C-2 + 4C-3 — MVP complete):** Per-task Pomodoro-style focus session rows (`user_id`, `course_id`, `task_id`, `duration_minutes`, `completed_task`, `started_at`, `ended_at`). **4C-0:** table + RLS + ownership trigger (see `docs/database/008-focus-sessions-schema-and-rls.md`; **applied and verified** on Supabase **2026-05-29**). **4C-1 backend API:** `POST /api/focus` (start for owned **pending** task; body `{ taskId, durationMinutes? }` default **25**, int **5–120**); `POST /api/focus/:sessionId/complete` (body `{ completedTask }`; server-side actual minutes from `started_at` / `ended_at`, clamped **1 … min(120, session ceiling)**; optional task completion via existing `completeTask`). **4C-2 frontend UI:** protected **`/focus/:taskId`**; **Start Focus** on **pending** tasks (`/tasks`, `/courses/:id`); frontend → backend only via **`focus.service.js`**; fixed **25**-minute **display-only** countdown; complete sends **`{ completedTask }` only**; success uses backend **`session.durationMinutes`**; **no** pause/resume, duration picker, or browser storage. **4C-3 manual smoke (passed, 2026-05-29):** Start Focus from pending tasks; complete without/with marking task complete; course page flow; back navigation; network clean (backend only — no direct Supabase focus calls, no Trello/Gemini); console clean. **`duration_minutes`:** provisional **session ceiling** while `ended_at IS NULL`; **actual completed minutes** after complete. **No** task description or material content on start load; session responses camelCase. Wrong-owner → neutral **404**; already completed session → **409**. **Known MVP note (SEC-1):** session row is closed before `completeTask`; rare DB failure after session update may leave task **pending** while session is ended (user can still `POST /api/tasks/:taskId/complete`). **`totalFocusMinutes`** on dashboard is served by **`GET /api/dashboard/stats`** (Phase **5B** — sum `duration_minutes` where `ended_at IS NOT NULL`).

**Not created yet:** `api_logs` admin table, etc. (PRD future scope). **Plan import** on material detail uses Phase **10B** import API (tasks + flashcards with dedupe).

**Study materials ownership:** `study_materials.course_id` → `courses.id` → `courses.user_id` (no `user_id` on materials row). Backend uses service role with explicit ownership filters.

---

## Implemented — Authentication & profiles

- Register / login / logout / `GET /api/auth/me`
- Supabase session; frontend Bearer token via `apiFetch`
- Profiles via `auth.users` + `public.profiles` (RLS own-row SELECT); **`profiles.role`** is source of truth for admin (`student` default; admin promotion manual only)
- **Admin authorization (Phase 6A-1):** backend **`requireAdmin`** middleware verifies **`profiles.role === 'admin'`** from DB — see [Admin authorization foundation](#implemented--admin-authorization-foundation-phase-6a-1) below
- **Admin aggregate stats (Phase 6A-2):** **`GET /api/admin/stats`** — platform-wide aggregate counts only; protected by **`requireAuth` + `requireAdmin`** — see [Admin aggregate stats API](#implemented--admin-aggregate-stats-api-phase-6a-2) below
- **Admin dashboard UI (Phase 6A-3):** protected **`/admin`** consumes **`GET /api/admin/stats`** via **`admin.service.js`** — see [Admin dashboard UI](#implemented--admin-dashboard-ui-phase-6a-3) below

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
  - `POST /api/study-materials/:materialId/import/tasks` (Phase **10B**)
  - `POST /api/study-materials/:materialId/import/flashcards` (Phase **10B**)
- **UI:** Materials on course detail; `/study-materials/:materialId` — view/edit/delete content
- **Validation:** Title 3–150; content 100–50,000 (trimmed)

---

## Implemented — AI study plan generation (persisted generated plan)

Delivered in phases **2D–2F** (generate orchestration + UI), **2L-a/b/c** (DB + backend persistence + frontend load/clear), **11A-1** (active history + retention), **11A-2** (history REST API), and **11A-3** (history UI). Not the monolithic PRD flow with client paste on the course page.

| Layer | What exists |
|-------|-------------|
| **document-service** | `POST /process` — body `{ studyText }` (100–50k chars); Gemini via `GEMINI_API_KEY`; output validated with PRD §8 schema; **internal only** |
| **backend** | `POST /api/study-materials/:materialId/generate` — body **`{}` strict**; `requireAuth`; ownership before reading saved `content`; one document-service call; **Zod-validates** plan before atomic RPC persist to `material_generated_plans` (Phase **11A-1**); returns `{ materialId, courseId, plan, savedAt }`. `GET` / `DELETE` `/api/study-materials/:materialId/generated-plan` for load/clear **active** plan only (GET may include optional **`planId`**). **History REST (11A-2):** `GET …/generated-plans` (metadata only — no `plan` JSON); `GET …/generated-plans/:planId` (full plan for owned material + matching planId); `POST …/generated-plans/:planId/activate` (body **`{}` strict** — no Gemini/document-service, no insert, no retention prune; returns full plan); `DELETE …/generated-plans/:planId` (inactive only — active delete → **409**; response `{ deleted, planId }`). **No** client-supplied plan JSON; **no** raw Gemini storage; **no** failed-generate persistence |
| **frontend** | **Generate** (`generateMaterial`, body `{}`); **load** saved plan on material detail (`GET`); **Clear** via backend `DELETE`; read-only plain-text display (summary, key topics, difficulty, tasks, flashcards); optional **Last saved** from `savedAt`. **Import plan tasks/flashcards** (Phase **10B**) — batch import via **`POST .../import/tasks`** and **`POST .../import/flashcards`** from visible `plan` (see **10B** section). **Plan history UI (11A-3):** **`GeneratedPlanHistorySection`** — metadata-only list (`listGeneratedPlans`); **Active** / **Previous version** badges; lazy **Preview** for inactive only (`getGeneratedPlanById`); **Make active** / Restore (`activateGeneratedPlan`, body `{}`); delete inactive with confirm (`deleteGeneratedPlanVersion`); active row has no Preview / Make active / Delete; activate updates main plan section; history refreshes after generate/clear/activate/delete. **No** `localStorage` / `sessionStorage` for plans/history; **no** direct Supabase plan writes; **no** polling; **no** bulk full-plan fetch on list load |

**Generate and persistence rules:**

- `materialId` from route only — not from body.
- Body must not include `studyText`, `content`, `courseId`, `userId`, `plan`, or ownership fields.
- Backend uses **saved** material `content` after ownership check (user must save edits before generate if form is dirty).
- **One active plan per material** (Phase **11A-1**) — regenerate inserts a new active row; prior active becomes inactive; up to **10** rows per material retained (oldest inactive pruned). **History REST APIs** (Phase **11A-2**) — list/get-by-id/activate/delete-version. **History UI** (Phase **11A-3**) — metadata-only list; Preview inactive only; Restore via activate (no Gemini); delete inactive with confirm.
- Generated `plan` is **untrusted display data** — validated on the backend immediately before DB write; rendered as plain React text in the UI.
- Missing active plan → `404` “Generated plan not found” → **empty state** (not a scary error). Wrong-owner/missing material → neutral `404` “Study material not found”.

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

**Not implemented (API):** `GET /api/tasks/:id` (PRD) — intentionally deferred. **Admin implemented (6A-1/2/3):** **`requireAdmin`**, **`GET /api/admin/stats`**, frontend **`/admin`** aggregate UI. **Admin still deferred:** **`GET /api/admin/logs`** / **`api_logs`**, user list, role management, Gemini/system error metrics. Dashboard: **`GET /api/dashboard/stats`** (Phase **5B**) consumed by **`/dashboard`** frontend UI (Phase **5C**). Focus Sessions MVP complete (Phases **4C-0**–**4C-3**). Trello sync: **`POST /api/trello/sync`** (Phase **4A-1**) + frontend **`/trello`** page (Phases **4A-2** + **4A-3** UI polish). **Plan import API** (Phase **10B**) — see below.

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

> **Superseded (import path):** Phase **10B** replaced sequential **`POST /api/courses/:courseId/tasks`** with material-scoped **`POST /api/study-materials/:materialId/import/tasks`** (dedupe + **`source='plan'`**). Section retained for historical context.

**Frontend-only (original 3A-f)** on **`/study-materials/:materialId`** — import **`plan.tasks[]`** from the **already visible** saved/generated plan (in-memory `plan` state) into real **`study_tasks`** via existing **`POST /api/courses/:courseId/tasks`**. **No** backend, database, migration, document-service, Gemini prompt/schema, or dependency changes.

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

**Known limitations (3A-f, pre-10B):** Superseded by **10B** — see below.

---

## Implemented — Plan-sourced import dedupe (Phase 10B)

Material-scoped import of AI-generated **tasks** and **flashcards** from the saved/generated plan on **`/study-materials/:materialId`**, with server-set **`source='plan'`** and dedupe. **No** Gemini/document-service/Trello/PDF/plan-history/admin-logs/deployment/CI/package dependency changes.

| Aspect | Detail |
|--------|--------|
| **Migration** | `supabase/migrations/009_plan_source_import_dedupe.sql` — **applied manually** on Supabase; extends `source` CHECK to **`manual` \| `plan`**; partial unique indexes for plan import dedupe |
| **Backend API** | **`POST /api/study-materials/:materialId/import/tasks`** — body `{ tasks: [...] }` (1–20 items, strict); **`POST /api/study-materials/:materialId/import/flashcards`** — body `{ flashcards: [...] }` (1–30 items, strict); both **`requireAuth`** |
| **Ownership** | **`getOwnedMaterialOrThrow`**; **`course_id`** from owned material; wrong-owner → neutral **`404`** |
| **Client trust** | Body rejects **`source`**, **`userId`**, **`courseId`**, **`materialId`**; backend sets **`source='plan'`** on insert |
| **Dedupe** | Pre-insert query + DB partial unique indexes; scope: same **`user_id`**, same **`material_id`**, **`source='plan'`** only — tasks: **`lower(trim(title))`**; flashcards: **`lower(trim(question)), lower(trim(answer))`** |
| **Manual create** | Unchanged — **`source='manual'`**; manual duplicates with same title/Q+A still allowed |
| **Response** | `{ summary: { imported, skipped, failed, total } }` only — no row bodies |
| **Frontend** | **`importPlanTasks`** / **`importPlanFlashcards`** in **`study-materials.service.js`**; **`plan-import.js`** / **`plan-flashcard-import.js`** validate plan payload before POST |

**Tests:** backend **`320/320`** passed; frontend lint/test/build passed (**`190/190`**, build pass).

**Reviews:** Security Review **passed**; Supervisor Review pending.

**Manual smoke:** **Passed** — first import creates rows; re-import skips duplicates; no duplicate rows on re-import; manual task/flashcard create still works; dashboard counts increase only on first import.

**Not in 10B:** plan import on global **`/flashcards`**; import dedupe across materials or for **`source='manual'`** rows; plan history **UI** (DB history added in **11A-1**); atomic all-or-nothing batch beyond per-item skip/fail counts.

---

## Implemented — Generated plan active history (Phase 11A-1)

DB + backend evolution of **`material_generated_plans`**: multiple rows per material, one **active**, bounded retention. **No** frontend history UI; **no** document-service/Gemini/Trello/PDF/admin-logs/packages/CI changes.

| Aspect | Detail |
|--------|--------|
| **Migration** | `supabase/migrations/010_material_generated_plans_active_history.sql` — **applied manually** on Supabase; adds **`is_active`**, drops one-row **`UNIQUE`**, partial unique index (one active per material), RPC **`activate_material_generated_plan`** (**`EXECUTE`** for **`service_role`** only) |
| **Generate** | **`POST …/generate`** body **`{}`** strict; ownership via **`getOwnedMaterialOrThrow`**; Zod before RPC; RPC deactivates prior active, inserts new active, prunes oldest inactive when count > **10** |
| **GET / DELETE** | **`GET …/generated-plan`** — active row only; optional additive **`planId`**. **`DELETE …/generated-plan`** — active row only; inactive rows remain until prune |
| **Stats** | **`GET /api/dashboard/stats`** and **`GET /api/admin/stats`** — **`totalGeneratedPlans`** counts **`is_active = true`** rows only (no plan JSON returned) |
| **Frontend** | Unchanged — same generate/load/clear flow; compatible with active-only GET |

**Tests:** backend tests passed; frontend lint/test/build passed.

**Reviews:** Security Review **passed**; Supervisor Review pending.

**Manual smoke:** **Passed** after migration **010** apply.

**Not in 11A-1:** history list UI; get-by-id / activate / delete-version endpoints (shipped in **11A-2**); document-service or Gemini prompt changes; background retention jobs.

**See:** `docs/database/010-material-generated-plans-active-history.md`

---

## Implemented — Generated plan history REST API (Phase 11A-2)

Backend history endpoints for **`material_generated_plans`** — list, get-by-id, activate inactive version, delete inactive version. **No** frontend history UI; **no** document-service/Gemini/Trello/PDF/admin-logs/packages/CI changes.

| Aspect | Detail |
|--------|--------|
| **Migration** | `supabase/migrations/011_reactivate_material_generated_plan.sql` — **applied manually** on Supabase **2026-05-30**; RPC **`reactivate_material_generated_plan(p_study_material_id, p_course_id, p_plan_id)`** only — no table/schema changes |
| **RPC security** | **`SECURITY DEFINER`**, `search_path = public`; **`EXECUTE`** granted to **`service_role`** only; **`ROW_COUNT`** hardening after target activation update (Security Review passed after hardening) |
| **List** | **`GET /api/study-materials/:materialId/generated-plans`** — metadata only (`planId`, `savedAt`, `createdAt`, `updatedAt`, `isActive`); **no** `plan` JSON |
| **Get by id** | **`GET …/generated-plans/:planId`** — full validated plan for owned material + matching `planId`; wrong-owner → neutral **404** |
| **Activate** | **`POST …/generated-plans/:planId/activate`** — body **`{}` strict**; **does not** call Gemini/document-service; **does not** insert; **does not** run retention prune; returns full plan (`materialId`, `courseId`, `planId`, `plan`, `savedAt`); exactly one active row after success |
| **Delete** | **`DELETE …/generated-plans/:planId`** — inactive plans only; active delete → **409** `CONFLICT`; response `{ deleted: true, planId }` |
| **Backward compat** | **`GET …/generated-plan`** still returns current **active** plan only |

**Tests:** backend **`341/341`** passed.

**Reviews:** Security Review **passed** (after RPC ROW_COUNT hardening); Supervisor Review pending.

**Manual smoke:** **Passed** — list history works; list metadata only (no plan JSON); get-by-id works; activate inactive works; activate response includes plan; exactly one active after activate; old **`GET …/generated-plan`** returns current active; delete inactive works; delete active returns **409**.

**Not in 11A-2:** history **UI** (added in **11A-3**); document-service or Gemini prompt changes; background retention jobs.

**See:** `docs/database/011-reactivate-material-generated-plan.md`

---

## Implemented — Generated plan history UI (Phase 11A-3)

Frontend-only Generated Plan History UI on **`/study-materials/:materialId`** — consumes Phase **11A-2** REST APIs only. **No** backend, migration, document-service, Gemini, Trello, PDF, admin-logs, packages, or CI changes.

| Aspect | Detail |
|--------|--------|
| **Service** | **`listGeneratedPlans`**, **`getGeneratedPlanById`**, **`activateGeneratedPlan`** (body **`{}` strict**), **`deleteGeneratedPlanVersion`** in **`study-materials.service.js`** |
| **Component** | **`GeneratedPlanHistorySection`** on **`StudyMaterialDetail`** |
| **List** | Metadata only — **Active** badge on active row; **Previous version** on inactive; version heading with Saved/Created metadata |
| **Preview** | Lazy fetch for **inactive** plans only — **`getGeneratedPlanById`**; **no** bulk full-plan fetch on list load |
| **Restore** | **Make active** on inactive via **`POST …/generated-plans/:planId/activate`** — **does not** call Gemini/document-service; response updates main **Generated study plan** section |
| **Delete** | Inactive only with confirm; active row has **no** Preview / Make active / Delete |
| **Refresh** | History list refreshes after generate, clear, activate, and delete |
| **Preserved** | Generate, Clear, Import tasks, Import flashcards flows unchanged |
| **Constraints** | Plain React text rendering only; **no** `localStorage` / `sessionStorage` for history/plans; **no** polling |

**Tests:** frontend lint passed; **`205/205`** passed; build passed. Backend tests not re-run (backend untouched).

**Reviews:** Supervisor Review **passed**; Security Review **passed**; UI clarity fix **passed**.

**Manual smoke:** **Passed** — plan history section; Active / Previous version badges; version heading; Make active on one line; Preview inactive; Restore inactive; active plan section updates after restore; exactly one active after restore; delete inactive with confirm; Generate / Clear / Import tasks / Import flashcards still work; console clean; no unexpected Gemini/document-service browser calls.

**Not in 11A-3:** backend API or migration changes; polling; bulk full-plan list fetch; browser storage for plans/history.

**Follow-up:** optional polish or a new separate phase — not automatically started.

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
| `source` | **`manual` only** in DB CHECK at phase completion — extended to **`manual` \| `plan`** in migration **009** (Phase **10B**) |
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

**Not in 4C-1:** `/focus/:taskId` UI (**4C-2**); manual smoke (**4C-3** — passed); dashboard **`GET /api/dashboard/stats`** (**5B** — implemented).

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

**Not in 4C-2:** Manual smoke (**4C-3** — passed); dashboard stats backend API (**5B** — implemented); pause/resume; duration picker.

**Implementation files:** `frontend/src/pages/FocusPage.jsx`, `frontend/src/services/focus.service.js`, `frontend/src/App.jsx`, `frontend/src/components/tasks/TaskCard.jsx`, `frontend/src/components/tasks/CourseTasksSection.jsx`, `frontend/src/components/tasks/GlobalTasksSection.jsx`.

---

## Implemented — Focus Sessions manual smoke (Phase 4C-3)

**Manual verification only** — no application code changes in this phase.

| Flow | Result |
|------|--------|
| Login; **`/tasks`** loads | Passed |
| **Start Focus** on pending tasks only; hidden on completed | Passed |
| Navigate to **`/focus/:taskId`**; timer loads | Passed |
| **`POST /api/focus`** body | **`taskId`** + **`durationMinutes`** only |
| Complete without mark complete | **`{ completedTask: false }`** only; task stays **pending** |
| Complete with mark complete | **`{ completedTask: true }`** only; task **completed**; **Start Focus** hidden |
| Course page Start Focus | Passed |
| Back navigation to **`/tasks`** / **`/courses/:courseId`** | Passed |
| Network | Focus via backend only — **no** direct Supabase **`focus_sessions`**, **no** Trello/Gemini |
| Console | Clean — no serious errors; no token/Authorization/study-material content logs |

**MVP status:** Focus Sessions **complete** through **4C-0** (DB) + **4C-1** (backend) + **4C-2** (frontend) + **4C-3** (manual smoke).

---

## Implemented — Dashboard backend stats API (Phase 5B)

**Backend only** — `backend/src/modules/dashboard/*`; mounted at **`/api/dashboard`**; all routes **`requireAuth`**; service-role queries filter by authenticated **`user_id`** or owned parent records.

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/dashboard/stats` | Return caller-owned aggregate dashboard stats (**200**) |

**Response fields:**

- **`totalCourses`**, **`totalStudyMaterials`**, **`totalGeneratedPlans`** (active generated plans only — Phase **11A-1**), **`totalTasks`**, **`pendingTasks`**, **`completedTasks`**, **`totalFlashcards`**
- **`totalFocusMinutes`** — sum of **`duration_minutes`** for owned focus sessions where **`ended_at IS NOT NULL`** only (in-progress/abandoned excluded)
- **`completedFocusSessions`** — count of owned sessions where **`ended_at IS NOT NULL`**
- **`trelloSyncedTasks`** — count of owned **`study_tasks`** where **`trello_card_id IS NOT NULL`** (DB only — **no** Trello HTTP calls; **no** card IDs returned)
- **`courseStats[]`** — per owned course: **`courseId`**, **`courseName`**, **`totalTasks`**, **`completedTasks`**, **`totalFlashcards`**

**Data minimization:** Counts and per-course aggregates only — **no** study material **`content`**, generated **`plan`** JSON, task **`description`**, Trello credentials/card IDs, or raw DB rows.

**Empty account:** **200** with all numeric fields **0** and **`courseStats: []`**.

**Checks:** `cd backend && npm run lint` passed; `npm test` (**283** tests, **0** failures).

**Reviews:** Supervisor Review **approved with notes**; Security Review **no blockers**.

**Known MVP notes:** ~13 parallel DB round-trips per request (acceptable for MVP).

**Not in 5B:** Dashboard **frontend UI** (shipped in **5C**); admin dashboard; **`GET /api/courses/:id`** course stats stub still returns zeros.

**Implementation files:** `backend/src/modules/dashboard/*`, `backend/src/app.js`.

---

## Implemented — Dashboard frontend UI (Phase 5C)

**Frontend only** — protected **`/dashboard`** (`DashboardStub.jsx`) consumes **`GET /api/dashboard/stats`** via **`dashboard.service.js`** (Bearer JWT through existing **`apiFetch`** pattern; **no** direct Supabase stats queries; **no** `service_role`; **no** Trello/Gemini/document-service calls).

**Visible sections:**

| Section | Displayed fields |
|---------|------------------|
| **Overview** | `totalCourses`, `totalStudyMaterials`, `totalGeneratedPlans` |
| **Tasks** | `totalTasks`, `pendingTasks`, `completedTasks` (+ completion % when `totalTasks > 0`) |
| **Focus** | `totalFocusMinutes` (formatted), `completedFocusSessions` |
| **Learning assets** | `totalFlashcards` |
| **Trello** | `trelloSyncedTasks` (count only — **no** card IDs) |
| **Per course** | `courseStats[]`: `courseName`, `totalTasks`, `completedTasks`, `totalFlashcards`; link to **`/courses/:courseId`** |

**Behavior (5C baseline):** Fetch on mount; **`LoadingState`** while loading; generic error + **Try again**; **`AUTH_REQUIRED`** → logout + redirect; empty account shows zero stats + CTA to **`/courses`**. **Read-only** — **no** POST/PATCH/DELETE; **no** polling. Cross-page/manual refresh wiring shipped in **5C.1** (below).

**Data minimization (UI):** Aggregate counts and per-course names/counts only — **no** study material **`content`**, generated **`plan`** JSON, task titles/descriptions, Trello credentials/card IDs, or raw API error payloads. Course names rendered as React text — **no** `dangerouslySetInnerHTML`.

**Checks:** `cd frontend && npm run lint` passed (one pre-existing `AuthContext.jsx` warning); `npm test` (**181** tests, **0** failures); `npm run build` passed.

**Reviews:** Supervisor Review **approved with notes**; Security Review **no blockers**.

**Not in 5C:** cross-page auto-refresh (added in **5C.1**); admin dashboard; chart library; dashboard styling polish pass beyond minimal layout CSS.

**Implementation files:** `frontend/src/services/dashboard.service.js`, `frontend/src/utils/dashboard-format.js`, `frontend/src/pages/DashboardStub.jsx`, `frontend/src/styles/layout.css`, `frontend/tests/unit/dashboard.service.test.js`, `frontend/tests/unit/dashboard-format.test.js`; **`frontend/package.json`** `test` script only.

---

## Implemented — Dashboard cross-page refresh (Phase 5C.1)

**Frontend only** — invalidation-only cross-page freshness after stat-changing mutations. **No** backend, database, migration, or API changes. **Not** a global stats cache — **`DashboardContext`** does **not** store dashboard stats and does **not** fetch stats.

| Aspect | Detail |
|--------|--------|
| **Notifier** | `dashboardRefreshNotifier.js` — **`refreshStats()`** coalesces duplicate calls before microtask flush; **`subscribe(listener)`** returns unsubscribe |
| **Context** | `DashboardContext.jsx` — exposes **`refreshStats`** + **`subscribeToRefresh`** only (invalidation-only; no stats in context) |
| **Provider** | `DashboardProvider` in `main.jsx` inside **`AuthProvider`** — does not weaken route protection |
| **Dashboard page** | `DashboardStub.jsx` keeps local **`stats`/`loading`/`error`**; fetch only via **`getDashboardStats()`** → **`GET /api/dashboard/stats`**; **Refresh stats** button (manual silent refresh); subscribes for silent refresh when mounted and initial load succeeded |
| **Wiring** | **`refreshStats()`** after successful: create/update/delete course; create/delete material; generate/clear plan; import plan tasks/flashcards (once per batch); create/complete/delete task; create/delete flashcard; Trello sync when **`summary.success > 0`**; focus session complete |
| **Excluded** | Flashcard **update** (counts unchanged); failed/skipped Trello sync; material content save without stat change |

**Constraints:** **No** polling; **no** WebSockets; **no** **`BroadcastChannel`**; **no** **`localStorage`/`sessionStorage`** cross-tab sync; **no** visibility/focus refetch; **no** direct Supabase stats queries; **no** `service_role`; dashboard refresh remains read-only **`GET`**.

**Checks:** `cd frontend && npm run lint` passed (**0** errors; **3** `react-refresh` warnings on context files); `npm test` (**186** tests, **0** failures); `npm run build` passed.

**Reviews:** Supervisor Review **approved with notes**; Security Review **no blockers**.

**Not in 5C.1:** global stats cache in context; polling; WebSockets; cross-tab sync; admin dashboard; chart library.

**Known gaps (non-blocking):** subscription effect re-subscribes when **`stats`/`loading`** change; silent refresh during error UI may update stats without clearing error; boundary test label could be clearer.

**Implementation files:** `frontend/src/context/dashboardRefreshNotifier.js`, `frontend/src/context/DashboardContext.jsx`, `frontend/src/main.jsx`, `frontend/src/pages/DashboardStub.jsx`, mutation call sites listed above, `frontend/tests/unit/dashboard-context.test.js`; **`frontend/package.json`** `test` script only.

---

## Implemented — Admin authorization foundation (Phase 6A-1)

**Backend only** — `backend/src/modules/admin/*`; mounted at **`/api/admin`**; middleware order **`requireAuth` → `requireAdmin` → handler`. **No DB migration required** — **`public.profiles.role`** already exists (`student` \| `admin`).

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/admin/access-check` | Verify caller is an authenticated admin (**200** `{ admin: true }` only) |

**`requireAdmin` behavior:**

- Runs **after** **`requireAuth`**; uses **`req.user.id`** from validated JWT only
- Loads profile via existing **`getProfileByUserId(req.user.id)`** (service role, scoped to caller)
- Checks **`profiles.role === 'admin'`** — **does not** trust frontend, JWT role claims, request body, query params, or client-supplied role
- **401 `AUTH_REQUIRED`** — missing/invalid token (from **`requireAuth`**)
- **403 `FORBIDDEN`** / `"Admin access required"` — authenticated student **or** missing profile (same generic response)
- **200** — verified admin; response contains only **`{ admin: true }`** (no email, userId, profile, stats, logs, or cross-user data)
- **`req.user.role = 'admin'`** attached only after DB verification (for downstream admin handlers in future phases)

**Data minimization:** Access-check returns a boolean admin confirmation only — **no** user list, aggregate stats, **`api_logs`**, study material content, generated plans, task descriptions, flashcard answers, or Trello credentials/card IDs.

**Checks:** `cd backend && npm run lint` passed; `npm test` (**290** tests, **0** failures).

**Reviews:** Supervisor Review **approved with notes**; Security Review **no blockers**.

**Not in 6A-1:** full admin aggregate stats API (shipped in **6A-2**); frontend **`/admin`** UI (shipped in **6A-3**); **`GET /api/admin/logs`** / **`api_logs`** table; user list; role mutation endpoints; cross-user aggregate queries.

**Known gaps (non-blocking):** integration test for valid JWT + missing profile → **403**; isolated **`requireAdmin`** unit tests.

**Implementation files:** `backend/src/modules/admin/admin.middleware.js`, `admin.routes.js`, `admin.controller.js`, `backend/src/app.js`, `backend/tests/integration/admin.auth.test.js`, `backend/tests/helpers/mockSupabaseAdmin.js`; **`backend/package.json`** `test` script only.

---

## Implemented — Admin aggregate stats API (Phase 6A-2)

**Backend only** — `backend/src/modules/admin/admin.service.js`; mounted at **`GET /api/admin/stats`** on existing **`/api/admin`** router; middleware order **`requireAuth` → `requireAdmin` → getStats**. **No DB migration required** — uses existing tables only.

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/admin/stats` | Return **platform-wide aggregate counts** for verified admin (**200**) |

**Route protection:** **`requireAuth`** then **`requireAdmin`** (same as **6A-1**). **401 `AUTH_REQUIRED`** — missing/invalid token. **403 `FORBIDDEN`** / `"Admin access required"` — authenticated student or missing profile. **200** — verified admin only.

**Response (aggregate-only — no raw rows):**

- **`totalUsers`**, **`totalCourses`**, **`totalStudyMaterials`**, **`totalGeneratedPlans`** (active rows only — Phase **11A-1**), **`totalTasks`**, **`pendingTasks`**, **`completedTasks`**, **`totalFlashcards`**, **`totalFocusMinutes`**, **`completedFocusSessions`**, **`trelloSyncedTasks`**, **`trelloSyncAttemptsToday`**, **`trelloSyncSucceededToday`**, **`trelloSyncFailedToday`**, **`trelloSyncSkippedToday`**
- **`systemHealth.backend`**: static **`"ok"`** (no document-service, Gemini, or Trello health probes)

**Data minimization:** Returns numeric aggregates and static health only — **no** emails, user IDs, profiles, user lists, course/material names, study text, plan JSON, flashcard Q/A, Trello card IDs, credentials, **`api_logs`**, or raw database rows.

**Service-role access:** Platform-wide aggregate reads via **`getSupabaseAdmin()`** are an **intentional admin-only exception** to the normal per-user filtering rule — authorized only after **`requireAuth` + `requireAdmin`**. Count queries use **`id`** with **`count: 'exact', head: true`**; **`totalFocusMinutes`** sums **`duration_minutes`** server-side for completed focus sessions only (rows not returned to client). Trello today metrics count **`trello_sync_logs`** by UTC start-of-day and status — **`error_message`** not selected.

**External calls:** **None** — no Gemini, Trello API, or document-service calls.

**Errors:** Aggregate DB failure → **500 `DATABASE_ERROR`** / `"Failed to load admin stats"` (generic; no raw PostgREST errors).

**Checks:** `cd backend && npm run lint` passed; `npm test` (**297** tests, **0** failures).

**Reviews:** Supervisor Review **approved with notes**; Security Review **no blockers**.

**Not in 6A-2:** frontend **`/admin`** UI (shipped in **6A-3**); **`GET /api/admin/logs`** / **`api_logs`** table; Gemini/system error metrics (deferred — no **`api_logs`** table); user list; role mutation endpoints.

**Known gaps (non-blocking):** at larger scale, **`totalFocusMinutes`** can move to DB-side **`SUM`**; forbidden-field regression test can add **`courseId`**, **`materialId`**, **`generatedPlan`**; no dedicated **`admin.service`** unit test (integration coverage accepted).

**Implementation files:** `backend/src/modules/admin/admin.service.js`, `admin.controller.js`, `admin.routes.js`, `backend/tests/integration/admin.stats.test.js`, `backend/tests/helpers/mockSupabaseAdminStats.js`; **`backend/package.json`** `test` script only.

---

## Implemented — Admin dashboard UI (Phase 6A-3)

**Frontend only** — protected **`/admin`** route; consumes existing **`GET /api/admin/stats`** (**6A-2** backend). **No backend, DB migration, dependency, or `package-lock` change** in this phase.

| Route | Nesting | Purpose |
|-------|---------|---------|
| `/admin` | **`ProtectedRoute` → `AdminRoute` → `AdminDashboardPage`** | Platform-wide **aggregate** admin stats (read-only) |

**Route protection (UX vs security):**

- **`ProtectedRoute`** — unauthenticated users redirect to **`/`**
- **`AdminRoute`** — if **`user?.role !== 'admin'`**, shows neutral **“Admin access required”** + link to dashboard; **`AdminDashboardPage` does not mount**
- **`AdminRoute` does not call the backend** — UX guard only; **`requireAuth` + `requireAdmin`** on **`GET /api/admin/stats`** remains the **real authorization boundary**

**API consumption:**

- **`admin.service.js`** → **`getAdminStats()`** → **`GET /api/admin/stats`** via **`apiFetch`** + session Bearer token (Supabase browser client for **`access_token` only**)
- **Does not** call **`GET /api/admin/access-check`**, document-service, Gemini, Trello API, or direct Supabase table reads
- **No** **`service_role`** in frontend

**Displayed data (aggregate-only):** platform overview (**`totalUsers`**, **`totalCourses`**, **`totalStudyMaterials`**, **`totalGeneratedPlans`**), tasks, focus, flashcards, Trello today sync metrics, **`systemHealth.backend`** as safe health text — **no** emails, user IDs, user lists, course/material names, study text, plan JSON, flashcard Q/A, Trello card IDs, credentials, logs, raw JSON, or API response dumps

**UI states:** loading; success (all-zero stats valid); **403 `FORBIDDEN`** → **“Admin access required”**; **`AUTH_REQUIRED`** → existing logout/redirect; **5xx / `DATABASE_ERROR`** → generic **“Could not load admin stats. Please try again.”** + **Try again**; manual **Refresh stats** (no polling)

**Dashboard nav:** **`/dashboard`** shows **Admin** link only when **`user?.role === 'admin'`** (UX only — not security)

**Checks:** `cd frontend && npm run lint` passed (**0** errors, **2** pre-existing warnings); `npm test` (**190** tests, **0** failures); `npm run build` passed.

**Reviews:** Supervisor Review **approved with notes**; Security Review **no blockers**.

**Manual smoke test (passed, 2026-05-29):** Admin user accesses **`/admin`** and sees aggregate stat sections; **Admin** link in **`AppShell`** nav for admins across authenticated routes; student has no link and direct **`/admin`** shows **“Admin access required”**; browser calls **`GET /api/admin/stats`** only — **no** direct Supabase table reads for admin stats; console clean (no token, **Authorization** header, or full response dump); **`/dashboard`** regression OK.

**Not in 6A-3:** **`/admin/logs`**; user list; role management; **`GET /api/admin/logs`** / **`api_logs`** table; Gemini/system error metrics UI

**Known gaps (non-blocking):** **SEC-6A3-1** — silent refresh after admin demotion may leave previously loaded aggregate stats visible until forbidden state is set (backend still blocks new fetches); optional extract duplicated **`StatItem`** / **`StatSection`**; optional reduce layered loading UX

**Implementation files:** `frontend/src/App.jsx`, `frontend/src/components/auth/AdminRoute.jsx`, `frontend/src/pages/AdminDashboardPage.jsx`, `frontend/src/pages/DashboardStub.jsx` (Admin nav link), `frontend/src/services/admin.service.js`, `frontend/tests/unit/admin.service.test.js`; **`frontend/package.json`** `test` script only.

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

**Bugfix (2026-05-29) — material-specific list filter:** **`GET /api/flashcards?courseId=&materialId=`** now works for valid owned course+material pairs (**200**; was **`500`** `DATABASE_ERROR` when PostgREST rejected the ownership query missing **`courses!inner`**). Ownership validation unchanged — enforced via material **`course_id`** and joined **`courses.user_id`**. **`materialId`** filter returns only flashcards linked to that material (excludes course-level / unlinked flashcards with **`material_id` null**). Course-only listing (**`?courseId=`** without **`materialId`**) still includes course-level flashcards. **No** frontend or API contract change.

**Responses:** camelCase; include `source`; **do not** include `userId`. Wrong-owner/missing flashcard on PATCH/DELETE → **`404`** “Flashcard not found”.

**Validation (Zod):** Question 10–500; answer 10–2000; tags max 5 (each 1–50); strict bodies (reject `userId`, `courseId`, `source`, timestamps on create); update requires ≥1 allowed field.

**Implementation files:** `backend/src/modules/flashcards/*`, `backend/src/shared/validation/flashcard.schema.js`, `backend/src/modules/courses/courses.routes.js` (create route), `backend/src/app.js` (mount `/api/flashcards`).

**Tests:** `backend/tests/integration/flashcards.test.js`, `backend/tests/unit/flashcards.service.test.js`, `backend/tests/helpers/mockSupabaseFlashcards.js`, `backend/tests/helpers/mockSupabaseStudyMaterials.js`. **`backend/package.json`** `npm test` script lists flashcards test files explicitly (**no** dependency or lockfile change). `cd backend && npm run lint` and `npm test` passed — **287** tests, **0** failures after **2026-05-29** material-filter bugfix (CI runs same script).

**Reviews:** Supervisor — approved with notes. Security Review — no blockers (initial **3B-c** and **2026-05-29** bugfix).

**Not in 3B-c:** Frontend DB flashcards UI; frontend `/api/flashcards` client; global `/flashcards` page; import `plan.flashcards[]` into rows; known/unknown; spaced repetition; pagination/rate limiting; wiring **3B-a** UI to DB rows.

---

## Implemented — Flashcards frontend integration (Phase 3B-d)

**Frontend-only** on **`/study-materials/:materialId`** — consumes **3B-c** API via backend REST (Bearer JWT); **no** direct Supabase access to `public.flashcards`.

| Capability | Detail |
|------------|--------|
| **Saved flashcards** | `DbFlashcardsSection` — `listFlashcards({ materialId })` on material load; loading / error / empty / study via `FlashcardStudy` |
| **Import from plan** | **Import flashcards to library** in `GeneratedPlanSection` when `plan.flashcards.length > 0`; validates all cards then **`POST /api/study-materials/:materialId/import/flashcards`** (Phase **10B**); confirm warns already-imported items skipped; refetches saved list on success; **does not** clear or mutate generated plan |
| **Plan study (3B-a)** | Unchanged — `FlashcardStudy` still renders `plan.flashcards` inside generated plan section |

**Service:** `frontend/src/services/flashcards.service.js` — `listFlashcards`, `createCourseFlashcard`, `updateFlashcard`, `deleteFlashcard` (update/delete wired in **3B-e** UI).

**Validation:** `createFlashcardFormSchema` in `frontend/src/utils/validation.js` — question 10–500, answer 10–2000, tags max 5 (each 1–50), strict bodies.

**Implementation files:** `DbFlashcardsSection.jsx`, `GeneratedPlanSection.jsx`, `StudyMaterialDetail.jsx`, `plan-flashcard-import.js`, `flashcards.service.js`.

**Tests:** `frontend/tests/unit/flashcards.service.test.js`, `frontend/tests/unit/plan-flashcard-import.test.js`. **`frontend/package.json`** `npm test` lists both (**no** dependency or lockfile change). `cd frontend && npm run lint`, `npm test` (**115** tests, **0** failures), and `npm run build` passed.

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Not in 3B-d:** Global `/flashcards` page; manual create flashcard form; edit/delete flashcard UI; known/unknown; spaced repetition; Anki; pagination/rate limiting.

**Known limitations:** Plan and saved sections may both show similar content after import; partial import possible when some items fail validation (see **10B** summary counts).

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

**Not in 3B-e:** Course-level flashcard management; known/unknown; spaced repetition; Anki; pagination/rate limiting (global `/flashcards` shipped in **3B-f**).

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

**Not in 3B-f:** Global create flashcard UI (shipped in **3B-g**); course-level flashcard management; known/unknown; spaced repetition; Anki; URL-persisted filters; pagination/rate limiting.

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

**Not in 3B-g:** Bulk create; AI/Gemini generation; plan import on `/flashcards`; known/unknown; spaced repetition; Anki; URL-persisted filters; course-level management; shared CRUD extraction.

**Known limitations:** Create CTA hidden while list is loading or in list error state; possible duplicate list fetch after create; success message may persist after cancel create (non-blocking).

---

## Implemented — Quality / lint (Phase 2G)

- ESLint flat config in `backend/`, `document-service/`, `frontend/`
- Scripts: `npm run lint`, `npm run lint:fix` per package
- **CI:** `npm ci` → `npm run lint` → `npm test` (frontend: + `npm run build`)
- **Local:** `scripts/check-all.ps1` runs lint before tests per package
- See `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`

---

## Implemented — Hardening & docs alignment (Phases 7A–7C)

| Phase | Status | Summary |
|-------|--------|---------|
| **7A** | Complete (**2026-05-29**) | Read-only hardening audit — all automated checks green; verdict **Stable with notes**; no application files changed |
| **7B** | Complete (**2026-05-29**) | Database docs status alignment (`docs/database/*`) |
| **7C** | Complete (**2026-05-29**) | Docs-only consistency update through **6A-3** |

---

## Implemented — Study material cockpit layout (Phase 12A-1)

**Frontend/CSS only** on **`/study-materials/:materialId`** — Source | AI split cockpit; **no** backend, API, database, migration, document-service, or package changes.

| Aspect | Detail |
|--------|--------|
| **Layout** | **`material-workspace__cockpit`** grid (≥1024px): **Source column** (`material-workspace__cockpit-source`) — editor; **AI column** (`material-workspace__cockpit-ai`) — generate panel → active plan → plan history → imports → plan flashcard study |
| **Below cockpit** | **`material-workspace__library`** — saved DB flashcards; **`material-workspace__danger`** — delete material |
| **Responsive** | &lt;1024px: stack Source first, then full AI stack |
| **Commit** | **`00a76de`** — `feat: add study material cockpit layout` (**2026-06-01**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**205/205**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security Review **approved**.

**Not in 12A-1:** BX-I1 dark/glass skin; new routes; sidebar shell; chart UI.

**Implementation files:** `frontend/src/pages/StudyMaterialDetail.jsx`, `frontend/src/styles/layout.css`, `frontend/src/styles/components.css`.

---

## Implemented — Global visual tokens (Phase B1)

**CSS-only** — global design tokens and typography rhythm; **no** React/JSX, backend, API, database, or package changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`tokens.css`**, **`base.css`**, **`layout.css`**, **`components.css`** — semantic tokens (warning, focus, AI, on-primary); tabular numerals; hardcoded global values migrated toward tokens |
| **Live palette (historical)** | Warm canvas / calm indigo primary before **BX-I2** — superseded by dark graphite / glass token foundation |
| **Commit** | **`ccca764`** — `style: add global tokens and typography rhythm` (**2026-06-01**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**205/205**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security Review **approved**.

**Not in B1:** Stitch/dark theme; sidebar; chart libraries.

---

## Implemented — AppShell, PageHeader, and cockpit width (Phase B2)

**Presentation-only** — shell/header polish and hub **`page--cockpit`** width; **no** backend, API, database, or package changes.

| Aspect | Detail |
|--------|--------|
| **AppShell** | Nav active/focus states; responsive shell inner alignment (`layout.css`) |
| **PageHeader** | Intro-mode grid layout; mobile stack; scoped lead/note spacing |
| **Cockpit width** | Hub routes moved **`page--workspace`** → **`page--cockpit`**: **`/dashboard`**, **`/courses`**, **`/courses/:id`**, **`/tasks`**, **`/flashcards`**, **`/trello`**, **`/admin`**, **`/focus/:taskId`** |
| **Unchanged JSX** | **`AppShell.jsx`**, **`PageHeader.jsx`** — CSS-only; **`StudyMaterialDetail.jsx`** already **`page--cockpit`** (inherits global PageHeader CSS) |
| **Commit** | **`f2de33f`** — `style: polish shell headers and cockpit widths` (**2026-06-01**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**205/205**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security Review **approved**.

**Not in B2:** Sidebar shell; new routes; dark theme.

---

## Implemented — Cards, controls, badges, and filters (Phase B3)

**Presentation-only** — card hover policy, static stat tiles, badge/pill consistency, filter/button polish; **no** backend, API, database, package, auth, routing, or data-fetching changes.

| Aspect | Detail |
|--------|--------|
| **Navigable cards** | **`source-card--navigable`** on **`CourseCard`**, **`MaterialCard`**, dashboard per-course cards — hover lift on clickable cards only; **`TaskCard`** excluded |
| **Static tiles** | Dashboard/admin stat tiles — minimal/no hover lift |
| **Read-only surfaces** | Plan output, plan history, plan form cards — no “editable” hover treatment |
| **Badges/pills** | Shared base for source-card pills, plan-task badges, plan-history badges, Trello sync status pills |
| **Filters / buttons** | Segmented filter toolbar polish; danger **`focus-visible`**; link-button active scale |
| **Commit** | **`e865c09`** — `style: polish cards controls badges and filters` (**2026-06-01**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**205/205**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security Review **approved**.

**Not in B3:** Charts; gamification; BX-I1 dark/glass; **B4** global rollout (**not started**).

**Implementation files:** `frontend/src/styles/components.css`, `frontend/src/styles/layout.css`; className-only JSX on **`CourseCard`**, **`MaterialCard`**, dashboard course rows.

---

## Implemented — Dark glass token foundation (Phase BX-I2)

**CSS-only** — global dark graphite / glass token foundation per **`DESIGN.md` v2.3** semantic roles; **no** React/JSX, backend, API, database, package, or docs changes in the implementation commit.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/tokens.css`**, **`components.css`**, **`layout.css`** only — **no other files** in commit **`03ee9df`** |
| **Tokens** | Dark canvas/shell/glass surfaces; electric blue primary; violet AI accent; cyan data accent; dark-friendly danger/success/warning/error; admin accent; source editor surface (`--color-editor-surface`); chart/course accent **values only** (not wired into UI) |
| **Filled-button contrast fix** | `--color-primary-fill`, `--color-primary-fill-hover`, `--color-danger-fill`, `--color-danger-fill-hover` for WCAG AA on `.btn--primary` / `.btn--danger`; semantic `--color-primary` / `--color-danger` unchanged for links, borders, alerts, AI surfaces |
| **Commit** | **`03ee9df`** — `style: add dark glass token foundation` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**205/205**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security Review **approved with limitation** — authenticated-route visual smoke **not fully completed** (no valid local test account); follow-up authenticated visual QA required (dashboard, courses, material detail / AI panel / plan history / disclaimer, Trello, admin forbidden vs admin dashboard, keyboard focus-visible on authenticated shell).

**Not in BX-I2:** JSX/React changes; sidebar shell; dashboard hero; chart UI; course accent class wiring; material cockpit structure redesign; **BX-I3** / **BX-I4** / **BX-I5** / **B4** — each requires separate planning and explicit approval.

---

## Implemented — Dashboard decision layout (Phase BX-I3)

**Frontend only** — decision-first dashboard layout on protected **`/dashboard`** (`DashboardStub.jsx`); consumes existing **`GET /api/dashboard/stats`** via **`getDashboardStats()`** only (**no** new API endpoints, backend, database, package, **`AppShell`**, route, service, or context changes).

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/pages/DashboardStub.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/utils/dashboard-recommendation.js`**, **`frontend/tests/unit/dashboard-format.test.js`** only — commit **`bdd6f2a`** |
| **Decision hero** | **“What should I study next?”** — **rule-based** recommendation ( **`deriveDashboardRecommendation`** ), **not** AI-based; context copy: *“Based on your pending tasks and active study plans.”* |
| **Recommendation rules** | Priority order: no courses → pending tasks (optional most-pending course from **`courseStats`** counts) → plan gap (**`totalStudyMaterials - totalGeneratedPlans`**) → flashcards → add tasks/plans → empty workspace → caught up |
| **Study pulse** | Task progress bars from existing stats only — global and per-course pending/completed counts; subtitle: *“Pending and completed tasks from your stats”* |
| **Course workload** | Per-course rows with derived pending counts and compact progress bars |
| **At a glance** | Prior stat bands (Overview, Tasks, Focus, Learning assets, Trello) moved to secondary section |
| **Checks** | `cd frontend && npm run lint` passed; `npm test` passed (**219/219**, including **14** recommendation unit tests); `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with limitation** — authenticated dashboard manual smoke **not fully completed** (no approved valid local test account); follow-up authenticated visual QA required (dashboard with data, empty dashboard if possible, hero primary/secondary CTA navigation, refresh stats, study pulse / progress bars, mobile width ~375px, console check for no token/secret/material-content logs).

**Honest data boundaries (not added):** **no** fake AI priority; **no** deadlines / due-soon; **no** weekly focus chart; **no** streaks; **no** health score; **no** next exam/deadline; **no** specific task/material title in recommendation copy; **no** decorative/fake chart values.

**Not in BX-I3:** chart library or chart UI; sidebar shell; course accent class wiring; material cockpit structure redesign; backend/API/database/package changes; **BX-I4** / **BX-I5** / **BX-I6** / **B4** — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/pages/DashboardStub.jsx`, `frontend/src/styles/layout.css`, `frontend/src/utils/dashboard-recommendation.js`, `frontend/tests/unit/dashboard-format.test.js` (reuses existing **`dashboard.service.js`** / **`dashboard-format.js`** without modification).

---

## Implemented — Deterministic course accents (Phase BX-I4)

**Frontend only** — stable per-course accent chrome on **`/courses`**, **`/courses/:id`**, and dashboard course workload rows; uses existing course data only (**no** new API endpoints, backend, database, package, logging, or accent persistence).

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/components/courses/CourseCard.jsx`**, **`frontend/src/pages/CourseDetail.jsx`**, **`frontend/src/pages/DashboardStub.jsx`**, **`frontend/src/styles/components.css`**, **`frontend/src/styles/tokens.css`**, **`frontend/src/utils/course-accent.js`**, **`frontend/tests/unit/dashboard-format.test.js`** only — commit **`ff65e21`** |
| **Accent helper** | **`course-accent.js`** — deterministic mapping from existing course **ID / name / title** only |
| **Accent keys** | Enum-only: **`amber` | `rose` | `emerald`** — **no** raw user strings used as class names |
| **Surfaces** | **`CourseCard`** accent rail/pill tint; **`CourseDetail`** header accent; dashboard course workload row accents |
| **Tokens** | Subtle/border token aliases for existing course accent colors in **`tokens.css`** / **`components.css`** |
| **Checks** | `cd frontend && npm run lint` passed; `npm test` passed (**228/228**, including course-accent tests integrated into normal test path); `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved** — authenticated visual QA **not fully completed** (no approved valid local test account); follow-up authenticated visual QA required (**`/courses`** list, **`/courses/:id`** detail header, **`/dashboard`** course workload rows; same course shows same accent across list/detail/dashboard; narrow width ~375px; keyboard focus on course links/cards; console check for no token/secret/course-data logs).

**Visual chrome boundaries (not added):** accents are **supplementary visual chrome only** — **no** health score; **no** priority; **no** urgency; **no** active/quiet course status; **no** AI classification; **no** fake progress signals; **no** study pulse recoloring; **no** dashboard recommendation changes.

**Not in BX-I4:** course accent persistence in DB; random colors; backend/API/database/package changes; logging; sidebar shell; chart UI; material cockpit structure redesign; study pulse recoloring; **BX-I5** / **BX-I6** / **B4** — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/components/courses/CourseCard.jsx`, `frontend/src/pages/CourseDetail.jsx`, `frontend/src/pages/DashboardStub.jsx`, `frontend/src/styles/components.css`, `frontend/src/styles/tokens.css`, `frontend/src/utils/course-accent.js`, `frontend/tests/unit/dashboard-format.test.js`.

---

## Implemented — Material cockpit visual polish (Phase BX-I5)

**Frontend/CSS/className-only** on **`/study-materials/:materialId`** — material detail cockpit visual polish; **no** backend, API, database, package, auth, routes, services, behavior, or request-payload changes; **no** `tokens.css` changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/pages/StudyMaterialDetail.jsx`**, **`frontend/src/components/materials/GeneratedPlanSection.jsx`**, **`frontend/src/components/materials/GeneratedPlanHistorySection.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/styles/components.css`** only — commit **`c2288d4`** |
| **Polish** | Improved Source \| AI cockpit hierarchy; darker readable source/editor well; source-type display pill from existing **`sourceTypeLabel`**; AI command/control column wrapper and section dividers; polished generate panel, active plan, and plan history surfaces; improved generated plan scanability; import toolbar/action band styling; history preview inset panel; saved flashcards library visual consistency; responsive polish at existing breakpoints |
| **Safety** | **No** unsafe rendering — **no** `dangerouslySetInnerHTML`, **no** `innerHTML`, **no** markdown renderer; material content remains **`Textarea`** / plain React text; generated plan and history preview remain plain React text |
| **Not added** | **No** fake metrics, fake AI confidence, fake priority/urgency/status; **no** course accents on material detail; **no** sidebar, chart UI, markdown renderer, or new packages |
| **Commit** | **`c2288d4`** — `style: polish material cockpit` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **PASS** — authenticated manual smoke / visual QA **not completed** (no approved valid local test account).

**Known non-blocking notes:** **`components.css`** uses some hardcoded `rgba` AI border colors (acceptable for BX-I5; possible future cleanup); **`sourceTypeLabel`** appears in both **`PageHeader`** note and new source pill (acceptable redundancy); ~375px visual QA not manually verified (no test account).

**Follow-up authenticated QA when a test account exists:** open material detail; edit/save material; verify unsaved state blocks generate; generate plan; clear active plan; restore from history; delete history item; import tasks; import flashcards; saved flashcards section/study; delete material danger zone; fake material UUID / not found; narrow width ~375px; console check for no token/secret/full material content logs.

**Not in BX-I5:** backend/API/database/package/auth/routes/services changes; `tokens.css` changes; behavior or API payload changes; course accents on material detail; sidebar shell; chart UI; **BX-I6** / **B4** — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/pages/StudyMaterialDetail.jsx`, `frontend/src/components/materials/GeneratedPlanSection.jsx`, `frontend/src/components/materials/GeneratedPlanHistorySection.jsx`, `frontend/src/styles/layout.css`, `frontend/src/styles/components.css`.

---

## Implemented — UI presentation polish (Phases 8A–8C, 12A-1, B1–B3, BX-I2, BX-I3, BX-I4, BX-I5)

Presentation-only frontend work per **`DESIGN.md`** v2 — **no** new product features, APIs, database tables, or behavior changes unless noted in phase history. **Live token values:** **`frontend/src/styles/tokens.css`** (dark graphite / glass after **BX-I2**).

| Phase | Status | Surfaces |
|-------|--------|----------|
| **8A** | Complete (**2026-05-29**) | Baseline polish — warm canvas, cards, stat tiles, filter toolbars, focus timer panel across existing pages |
| **8B** | Complete (**2026-05-30**) | Docs-only — reconciled **`DESIGN.md`**, **`STITCH_BRIEF.md`**, **`SCREENSHOT_INDEX.md`** with post-**2J**/**8A** state |
| **8C-1** | Complete (**2026-05-30**) | Global **`AppShell`** + design tokens + **`PageHeader`**; auth pages outside shell |
| **8C-2A** | Complete (**2026-05-30**) | **`/dashboard`**, **`/courses`**, **`/courses/:id`** — cockpit/workspace presentation |
| **8C-2B** | Complete (**2026-05-30**) | **`/study-materials/:materialId`** — editor, saved flashcards, generate AI panel, generated plan zones (layout refined **12A-1**) |
| **8C-3A** | Complete (**2026-05-30**) | **`/tasks`**, **`/focus/:taskId`** — task workspace + focus timer presentation |
| **8C-3B** | Complete (**2026-05-30**) | **`/flashcards`** — library/study/manage presentation |
| **8C-3C** | Complete (**2026-05-30**) | **`/trello`** — step-based integration workspace (credentials → board/list → tasks → sync → results); ADR 004 unchanged |
| **8C-3D** | Complete (**2026-05-30**) | **`/admin`** — cockpit-style aggregate stats; **`AdminRoute`** forbidden surface |
| **12A-1** | Complete (**2026-06-01**) | **`/study-materials/:materialId`** — Source \| AI cockpit split; library + danger bands below |
| **B1** | Complete (**2026-06-01**) | Global **`tokens.css`** + typography rhythm; semantic token roles |
| **B2** | Complete (**2026-06-01**) | **`AppShell`** / **`PageHeader`** CSS; hub routes **`page--cockpit`** |
| **B3** | Complete (**2026-06-01**) | Card hover policy, static stat tiles, badges/pills, segmented filters, button polish |
| **BX-I2** | Complete (**2026-06-02**) | Dark graphite / glass global tokens; filled-button WCAG AA contrast fix — **`tokens.css`**, **`components.css`**, **`layout.css`** only |
| **BX-I3** | Complete (**2026-06-02**) | Dashboard decision layout — rule-based next-up hero, study pulse, course workload rows, secondary **At a glance** stats — **`DashboardStub.jsx`**, **`layout.css`**, **`dashboard-recommendation.js`**, tests only |
| **BX-I4** | Complete (**2026-06-02**) | Deterministic course accents — **`amber` | `rose` | `emerald`** from course ID/name/title; **`CourseCard`**, **`CourseDetail`**, dashboard workload rows — **`course-accent.js`**, **`components.css`**, **`tokens.css`**, tests |
| **BX-I5** | Complete (**2026-06-02**) | Material detail cockpit visual polish — Source \| AI hierarchy, editor well, source-type pill, AI command surfaces, plan/history/import/library styling — **`StudyMaterialDetail.jsx`**, plan components, **`layout.css`**, **`components.css`** only |

**UI polish status:** **Complete** through **BX-I5** (after **B3**). **Phase B4** global styling rollout and **BX-I6** (sidebar, chart UI, backend/API extension **in code**) are **not started** — **not automatic** after BX-I5; each requires separate planning and explicit human approval after Supervisor Review. **BX-I1** codified Stitch direction in **`DESIGN.md` v2.3**; **BX-I2** shipped the token foundation in **`tokens.css`**; **BX-I3** shipped the dashboard decision layout; **BX-I4** wired deterministic course accents; **BX-I5** polished the material detail cockpit. Design screenshots under `docs/design/screenshots/` may predate **8C** / **12A-1** / **B1–B3** / **BX-I2** / **BX-I3** / **BX-I4** / **BX-I5** visuals.

---

## Frontend routes (implemented)

All routes below match `frontend/src/App.jsx`. Protected workspace routes render inside **`AppShell`** (**8C-1**) except auth pages.

| Route | Shell | Purpose |
|-------|-------|---------|
| `/`, `/register` | No (auth pages) | Login / register |
| `/dashboard` | Yes | **Student dashboard cockpit** — real user-owned stats from **`GET /api/dashboard/stats`** (**5B** + **5C** + **5C.1** + **BX-I3** decision layout + **BX-I4** course workload row accents); read-only; rule-based **“What should I study next?”** hero; study pulse / task progress bars; course workload rows; secondary **At a glance** stat bands; fetch on mount + **Try again** + **Refresh stats**; silent refresh when mounted after stat-changing actions elsewhere; presentation **8C-2A** + **B2** cockpit width + **B3** stat tiles + **BX-I3** decision hero |
| `/admin` | Yes | **Admin aggregate dashboard** — platform-wide stats from **`GET /api/admin/stats`** (**6A-2** + **6A-3**); **`ProtectedRoute` → `AppShell` → `AdminRoute` → `AdminDashboardPage`**; read-only; aggregate counts only — **no** logs, user list, or role management; presentation upgraded **8C-3D**; **Admin** also in **`AppShell`** nav when **`user?.role === 'admin'`** (UX only) |
| `/courses` | Yes | Course list + create; presentation upgraded **8C-2A** + **BX-I4** deterministic accent rail/pill on **`CourseCard`** |
| `/courses/:id` | Yes | **Course workspace** — materials list/create, **manual study tasks** (filters, create, edit pending, material link/unlink, complete, delete); presentation upgraded **8C-2A** + **BX-I4** header accent |
| `/tasks` | Yes | **All study tasks** — course + status filters, create, edit pending, complete, delete, **Start Focus**; presentation upgraded **8C-3A** |
| `/flashcards` | Yes | **All saved flashcards** — filters, create, study, edit/delete; presentation upgraded **8C-3B** |
| `/trello` | Yes | **Trello sync UI** — manual apiKey/token (not stored); **Load boards** → board/list picker (**4B-2**); task selection (max 50); sync via backend only; credentials cleared after sync attempt; presentation upgraded **8C-3C** — **no OAuth**, **no** stored credentials |
| `/focus/:taskId` | Yes | **Focus session** — auto-start **`POST /api/focus`**; **25**-minute display countdown; complete **`POST /api/focus/:sessionId/complete`**; presentation upgraded **8C-3A** |
| `/study-materials/:materialId` | Yes | **Study material workspace** — Source \| AI cockpit (**12A-1** + **BX-I5** visual polish); edit content, **generate** (body **`{}`**), load/clear **active** plan, **plan history** (metadata list, lazy preview, restore, delete inactive — **11A-3**), import plan tasks/flashcards, saved DB flashcards CRUD + study, generated-plan flashcard study; AI zones **8C-2B** + **B1**–**B3** + **BX-I5** polish |

**Not implemented:** `/courses/:id/generate` (course-level paste-generate — deferred).

---

## Deferred / not started (requires separate approval)

- Material **navigation** links from task cards; **filtering** tasks by `materialId`; **bulk create** flashcards; **AI/Gemini** flashcard generation on `/flashcards`; **plan import** on **`/flashcards`** (global page); **course-level** flashcard management; known/unknown tracking; spaced repetition; Anki; pagination/rate limiting; **URL-persisted** flashcard filters (in-memory filters shipped in **3B-f**); optional shared CRUD form extraction; link from `/courses` to `/flashcards` ( **`public.flashcards` table + RLS** in **3B-b**; **backend API** in **3B-c**; **material-detail** in **3B-d**–**3B-e** + **plan import dedupe** in **10B**; **global page** in **3B-f**–**3B-g**; **plan JSON study** in **3B-a**; **plan tasks** import in **3A-f** superseded by **10B**); edit **completed** tasks or mark incomplete (pending-only edit shipped in **3A-c.1**); **URL-persisted** task filters (in-memory filters shipped in **3A-c.2** / **3A-d** / **3A-e**)
- Saved generated **plan library** beyond material-scoped history (DB retains up to **10** rows per material with one **active** since **11A-1**; history REST APIs in **11A-2**; material-detail history UI in **11A-3** — metadata list, lazy preview, restore, delete inactive)
- Course-level `POST /api/courses/:courseId/generate` with client `studyText` (PRD-style paste on course page)
- Trello **OAuth**; **stored** credentials; **board/list persistence**; Trello card **update/delete**; **force re-sync**; advanced sync management beyond manual MVP (**4A** sync UI + **4B** board/list picker end-to-end; manual listId paste no longer required)
- **Dashboard polling / WebSockets / cross-tab sync / visibility refetch** — **5C.1** ships invalidation-only manual/cross-page refresh only (PRD §12.5 intent); **no** polling, WebSockets, **`BroadcastChannel`**, or browser storage sync
- **`api_logs`** table and **`GET /api/admin/logs`**; admin **user list** / **role management** UI; Gemini/system error metrics for admin dashboard (deferred — no **`api_logs`** table; **`/admin`** ships **aggregate stats UI only** — **`GET /api/admin/access-check`** + **`GET /api/admin/stats`**)
- Production deployment strategy; observability / APM; payments
- **PDF upload/parsing** — deferred: adds file **storage** cost, a **parsing** pipeline, **size/malware validation**, broader **Security Review** surface, and ongoing cost; **paste-text** study materials remain the MVP path
- Trello OAuth; stored Trello credentials; real-time dashboard (polling / WebSockets / cross-tab sync); spaced repetition; advanced flashcard study (known/unknown, Anki)
- **Phase B4** global visual system rollout — **not started** (requires explicit `approved — implement Phase B4` after Supervisor Review). **Phases 8A–8C**, **12A-1**, **B1**–**B3**, **BX-I2**, **BX-I3**, **BX-I4**, and **BX-I5** are **complete** — dark graphite / glass token foundation in **`tokens.css`**; rule-based dashboard decision layout in **`DashboardStub.jsx`**; deterministic course accents on list/detail/dashboard (**BX-I4**); material detail cockpit visual polish (**BX-I5**); **BX-I6** (sidebar, chart UI, backend/API extension **in code**) is **not started** — requires separate planning and explicit approval
- Further **UI styling** beyond **BX-I5** (charts, sidebar, course accents on material detail) requires explicit human approval — **`DESIGN.md` v2.3** direction for those surfaces is **not built** until a gated **BX-I6** or **B4** phase; **`11-generated-plan-visible.png`** **captured** (Phase 2K-c); **`15-processing-with-ai.png`** still **pending** (see `docs/design/SCREENSHOT_INDEX.md`; committed PNGs may predate **8C** / **12A-1** / **B1–B3** / **BX-I2** / **BX-I3** / **BX-I4** / **BX-I5** — **`03-dashboard.png`** is a **pre-5C/pre-8C/pre-BX-I3/pre-BX-I4** reference)
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

**Current automated test totals (2026-06-02):** backend **341/341**; frontend **205/205**; document-service **43/43**. Historical phase completion notes may cite earlier counts — re-run `npm test` per package for authoritative totals.

---

## Agent workflow (summary)

See `AGENTS.md` for full role definitions and approval phrases:

| Phase gate | Meaning |
|------------|---------|
| `approved — begin Phase X planning only` | Planning Agent — report only, no implementation |
| `approved — implement Phase X` | Implementation (and tests/lint as applicable) |
| `approved — Phase X complete` | Documentation Agent may update docs per `.claude/agents/documentation-agent.md` |

**Planning approval is not implementation approval.** After a phase ships, update **only relevant** Markdown (matrix in `documentation-agent.md`) — not every doc on every phase.

Roles: Orchestrator, Planning Agent, Implementation Agent, Testing Agent, Supervisor Review Agent, Security Review Agent, Documentation Agent; Design Agent for future approved UI polish only.
