# Implementation Status — StudyOps AI

**Purpose:** Describe what is **built today** in the repository. For full product intent and future features, see `docs/PRD.md`. For post-MVP framing, see `docs/POST_MVP.md`. For phase-by-phase history, see `docs/AGENT_MEMORY.md`.

**Product state:** Initial MVP baseline is **complete**. StudyOps AI is an actively developed web product; many post-MVP phases are already merged. **Future work should not be rejected merely because it is beyond MVP** — evaluate it through explicit human approval, cost gates, Security Review (when applicable), and migration approval (when applicable). **Trello current state: A2–A6 shipped** (connect, encrypted storage, stored-token sync, connected UX, A5C hardening, board/list defaults). Shipped behavior is documented in this file; deferred work remains gated.

**Product platform:** StudyOps AI is a **browser-based web application only** — not a native mobile app, Android/iOS app, phone app, or app-store product. **Responsive web layout** (including checks at **~375px browser viewport** width) is in scope; that is **narrow responsive browser layout** testing, **not** mobile-app product scope. See **`AGENTS.md`** § Product platform and **`docs/CURRENT_STATE.md`** § Product platform.

**Last aligned:** Phase **DOCS-FLASHCARD-REVIEW-A3** (**2026-06-07**) — **FLASHCARD-REVIEW-A3** frontend-only review-state filter for **saved DB flashcards** shipped; **`filterFlashcardsByReviewState`** in **`flashcard-filters.js`**; surfaces: global **`/flashcards`** **`GlobalFlashcardsSection`** and material detail **`DbFlashcardsSection`**; filter options **All**, **New + Learning** (`needs_review`), **New**, **Learning**, **Known** — client-side over already-loaded cards by **`mastery`**; filters study deck and manage list; composes with existing course/material filters on **`/flashcards`**; **no** backend **`?mastery=`**; **no** URL-persisted filters; **no** sorting by **`lastReviewedAt`**; **FLASHCARD-REVIEW-A2** Known/Unknown unchanged (**no** refetch on review; **no** auto-advance); plan JSON **`GeneratedPlanSection`** unchanged; **not** full SRS; **no** **`next_review_at`**; **no** SM-2/Anki; **no** dashboard due cards; **no** review history table; Supervisor Review **approved with notes**; Security Review **not required**; **`npm run lint`**, **`npm test`**, **`npm run build`** passed; main CI **green**. Prior **DOCS-FLASHCARD-REVIEW-A2** (**2026-06-06**) — **FLASHCARD-REVIEW-A2** frontend Known/Unknown review buttons for **saved DB flashcards** shipped; surfaces: material detail **`DbFlashcardsSection`** and global **`/flashcards`** **`GlobalFlashcardsSection`**; after answer reveal, **Known** / **Unknown** call existing **`POST /api/flashcards/:flashcardId/review`** body `{ outcome: "known" | "unknown" }` via **`reviewFlashcard`** in **`flashcards.service.js`**; successful review merges returned flashcard into local state by id (**no** full reload/refetch on review); user stays on same card (**no** auto-advance); **`GeneratedPlanSection`** plan JSON flashcards **unchanged** — **no** Known/Unknown, **no** review API, **no** persisted review claim; factual mastery/review-count meta on DB cards after first review only; **not** full SRS; **no** **`next_review_at`**; **no** SM-2/Anki; **no** review queue; **no** dashboard due cards; **no** mastery filters; Supervisor Review **approved with notes**; Security Review **not required** (frontend-only over authenticated backend endpoint); main CI **green**; **`npm run lint`**, **`npm test`** (**337** pass), **`npm run build`** passed. Prior **DOCS-FLASHCARD-REVIEW-A1** (**2026-06-06**) — **FLASHCARD-REVIEW-A1** backend/database foundation for persisted flashcard review state shipped; migration **`013_flashcard_review_state.sql`** **applied successfully** on Supabase; **`POST /api/flashcards/:flashcardId/review`** body `{ outcome: "known" | "unknown" }`; aggregate columns on **`public.flashcards`**: **`mastery`**, **`last_reviewed_at`**, **`review_count`**, **`known_count`**, **`unknown_count`**; **`known`** → `mastery = "known"`, increments **`review_count`** + **`known_count`**; **`unknown`** → `mastery = "learning"`, increments **`review_count`** + **`unknown_count`**; **`last_reviewed_at`** set on review; list/GET/PATCH responses include review fields; review state **not** writable via PATCH/create; **no** frontend Known/Unknown buttons; **no** SRS scheduling; **no** **`next_review_at`**; **no** SM-2/Anki; **no** review history table; **no** dashboard due cards; Supervisor Review **approved with notes**; Security Review **PASS WITH NOTES**; main CI **green**; backend tests passed. Prior **DOCS-TASK-MATERIAL-DETAIL-A3** (**2026-06-06**) — frontend-only read-only **Related study tasks** band on material detail shipped (**TASK-MATERIAL-DETAIL-A3**); **`MaterialRelatedTasksSection`** on **`/study-materials/:materialId`** between cockpit and **Saved flashcards**; **`listCourseTasks(courseId)`** + client-side **`getMaterialLinkedTasks`**; pending/completed/total counts; up to **5** compact read-only preview rows (pending before completed); loading/empty/error + **Try again**/populated; **`Link`** to **`/courses/:courseId`**; refreshes after plan task import; distinguishes saved DB tasks from AI plan JSON preview; **no** **`TaskCard`**, edit, complete, delete, or Focus; **no** backend **`materialId`** query params, DB/migration/API changes, or URL query params; Security Review not required; backend **`materialId`** query params, URL-persisted task filters, and “tasks without material” filter remain deferred. Prior **DOCS-TASK-MATERIAL-FILTERS-A2** (**2026-06-06**) — frontend-only study material filters on course and global task lists shipped (**TASK-MATERIAL-FILTERS-A2**); course **`/courses/:id`** always shows a **Study material** filter using course-page materials; global **`/tasks`** shows material filter only after selecting a specific course (loads materials via existing **`listMaterials`**); filters already-loaded tasks by **`task.materialId`** in memory; composes with status/course filters; global course change resets material filter to **All materials in course**; unknown/stale material filter id safely shows all tasks; **no** backend **`materialId`** query params, DB/migration/API changes, or URL query params; Security Review not required. Prior **DOCS-TASK-MATERIAL-LINKS-A1** (**2026-06-06**) — **`TaskCard`** material navigation links (**TASK-MATERIAL-LINKS-A1**). Prior **POST-MVP-LANGUAGE-A1** (**2026-06-04**) — post-MVP framing alignment; **Trello OAuth A2–A6** is **live** (connect/disconnect + callback; **connected-account sync** primary **`/trello` UX**; manual fallback **when disconnected only**; **A5C** blocks connected + manual `{ apiKey, token }`; board/list defaults **A6**). Prior **DOCS-CONSISTENCY-FIX** (**2026-06-04**) — removed stale “OAuth not live”, “manual-only sync path”, “A5/A5B deferred”, and “not user-facing until A4” language across **PRD**, **README**, **IMPLEMENTATION_STATUS**, and **AGENT_MEMORY**. Prior **DOCS-TRELLO-OAUTH-A5C** — **A5C** backend manual-credential hardening. Prior **DOCS-TRELLO-OAUTH-A5B** — **A5B** frontend connected-account sync. Prior **DOCS-TRELLO-OAUTH-A5A** — **A5A** backend stored-token mode. Prior **DOCS-BX-I10A6-QA** — Trello failed-row live verification **complete** (**Pass with notes**, review only). Prior **DOCS-BX-I10A5** / **BX-I10A5** (commit **`38aa561`**). Prior **DOCS-BX-I9C** + **BX-I9C-Auth** final visual QA **complete**. **Current status (Trello):** **A2–A6 complete** — account connect + stored-token boards/lists/sync + connected frontend UX + manual-credential hardening while connected + board/list defaults (**A6**); **BX-I10A6-QA** Trello failed-row live verification **complete** (**Pass with notes**, review only); **BX-I10A5** **complete** (**CSS-only** — **`components.css`** + **`layout.css`** only); **BX-I10A4**–**BX-I10A1** **complete**; **BX-I9C** + **BX-I9C-Auth** visual QA **passed with notes**; **BX-I9B2d**–**BX-I9B1** token alignment **complete**; **BX-I8E**–**BX-I7** sequence **complete**. **`npm.cmd run lint`**, **`npm.cmd test`** (**442** pass at **A5A** gate), **`npm.cmd run build`** passed at prior frontend gates. Deferred optional follow-ups (**not automatic**, separate phase gate each): optional material editor/library elevation alignment; optional global shadow/token cleanup only if explicitly approved; **ROADMAP-A1** background automations + AWS architecture planning; optional material detail course accent JSX if explicitly approved; narrow nav focus / material source-type pill polish only if separately approved. Prior **DOCS-BX-I9B2d-HOUSEKEEPING**. Prior **DOCS-BX-I8E-HOUSEKEEPING**. Prior **DOCS-BX-I8D-HOUSEKEEPING**. Prior **DOCS-BX-I8C-HOUSEKEEPING**. Prior **DOCS-BX-I8B-HOUSEKEEPING**. Prior **DOCS-BX-I7F-HOUSEKEEPING** / **BX-I7 closeout**. Prior **DOCS-BX-I7E3-HOUSEKEEPING**. Prior **DOCS-BX-I7E1-HOUSEKEEPING**. Prior **DOCS-BX-I7D-HOUSEKEEPING**. Prior **DOCS-BX-I7C-HOUSEKEEPING**. Prior **DOCS-BX-I7A-DESKTOP-LAYOUT-ALIGN**; **BX-I7A** audit complete (documentation only). Prior **DOCS-B4F3B-HOUSEKEEPING**; **B4-F3B** complete (commit **`ee5357f`**). Prior **B4-F3B** documentation housekeeping; **B4-F3B** state surface wrapper hooks shipped (commit **`ee5357f`**) — **frontend presentation-only** in four approved files: **`CourseDetail.jsx`**, **`CourseTasksSection.jsx`**, **`DbFlashcardsSection.jsx`**, **`layout.css`**; explicit wrapper **`className`** hooks for secondary in-page loading/error/empty surfaces; **`layout.css`** selector migration from brittle **B4-F3A** direct-child/generic selectors to stable wrapper selectors; six wrappers: **`course-workspace__materials-loading`**, **`course-workspace__materials-error`**, **`course-workspace__materials-error-actions`**, **`course-workspace__materials-empty`**, **`course-workspace__tasks-filter-empty`**, **`flashcard-library__loading`**; **no** copy/behavior/API/service/auth/backend/route/**`LoadingState.jsx`**/**`ErrorMessage.jsx`**/**`EmptyState.jsx`**/**`tokens.css`**/**`components.css`**/role/**`aria-live`** changes; **no** StudyMaterialDetail generate-lane, **GeneratedPlanHistory** preview, Trello, Dashboard, or global tasks/flashcards changes; wrapper divs **no** roles/**`aria-live`**; Try again / EmptyState CTA handlers unchanged; visual output intended unchanged; **narrow responsive browser viewport ~375px** preserved — **not** phone/native design; StudyOps AI remains **browser-based WEB platform / SaaS dashboard / AI study cockpit**; Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed; authenticated browser smoke **not live-tested**. Prior **DOCS-B4F3C-STATE-ALIGN**; **B4-F3C** sub-series **complete**; prior **B4-F3C3** documentation housekeeping; **B4-F3C3** GeneratedPlanHistory preview **`aria-live`** / error semantics cleanup shipped (commit **`ab28307`**) — **frontend-only** in **`frontend/src/components/materials/GeneratedPlanHistorySection.jsx`** only; removed **`aria-live="polite"`** from preview panel wrapper **`plan-history__preview plan-history__preview-panel`**; preview loading **`<p>`** now has **`role="status"`** and **`aria-live="polite"`** for **Loading preview…** only; **`previewError`** still **`ErrorMessage`** / **`role="alert"`** unchanged; preview success (truncated snippet + aggregate meta/counts only) **not** inside **`aria-live`** — success **not** live-announced; **no** full generated plan body/tasks/flashcards/key topics/raw JSON rendered; full plan may remain in React state after **`getGeneratedPlanById`** (unchanged, not newly DOM-exposed); **no** **`LoadingState.jsx`**/**`ErrorMessage.jsx`**/**`EmptyState.jsx`**/CSS/services/API/auth/backend/package/**`StudyMaterialDetail`**/**`TrelloTaskSelector`**/preview-helper changes; visual UI and behavior unchanged; **no** sensitive logging or unsafe rendering; StudyOps AI remains **browser-based WEB platform / SaaS dashboard / AI study cockpit**; **375px** = **narrow responsive browser viewport** — **not** phone/native design; Supervisor Review **approved**; Security / Trust Review **approved** — **no** Critical or Important issues; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed; manual smoke **limited** — authenticated generated-plan-history preview QA not live-tested; **B4-F3C** sub-series (**B4-F3C1**, **B4-F3C2**, **B4-F3C3**) **complete**; prior **B4-F3C2** documentation housekeeping (**2026-06-02**); **B4-F3C2** AI processing lane **`aria-live`** cleanup shipped (commit **`d1a3c69`**) — **frontend-only** in **`frontend/src/pages/StudyMaterialDetail.jsx`** only; removed duplicate **`aria-live="polite"`** from outer **`ai-panel__loading--active`** wrapper; **`LoadingState`** remains single polite live region (**`role="status"`**, **`aria-live="polite"`**) for **Processing with AI…**; preserved visible processing panel and disabled generate button label; **no** **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`EmptyState.jsx`**, CSS, services/API/auth/backend/package, generate/**`generateError`**/copy changes; **no** **`TrelloTaskSelector`** or **`GeneratedPlanHistorySection`** changes; **no** B4-F3C3 work; **no** sensitive logging or unsafe rendering; StudyOps AI remains **browser-based WEB platform / SaaS dashboard / AI study cockpit**; **375px** = **narrow responsive browser viewport** — **not** phone/native design; Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed; manual smoke **limited** — authenticated generate-flow QA not live-tested; prior **B4-F3C1** documentation housekeeping (**2026-06-02**); **B4-F3C1** **TrelloTaskSelector** empty-state bug fix shipped (commit **`d0393d7`**) — **frontend-only** in **`frontend/src/components/trello/TrelloTaskSelector.jsx`** only; removed invalid **`EmptyState`** **`message`** prop usage and unused import; zero-tasks state now plain informational **`<p className="trello-picker__empty trello-picker__status" role="status">`** with preserved copy **No study tasks yet. Create tasks on a course or the All study tasks page.**; **no** CSS (**`layout.css`**, **`components.css`**, **`tokens.css`**) changes; **no** **`EmptyState.jsx`**, **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`TrelloSyncSection.jsx`**, Trello services, sync payload, credentials/board/list flow, or Trello sync behavior changes; **no** backend/API/database/package/auth/route guard changes; **no** new CTAs, navigation, or **Try again** button changes; **no** B4-F3C2 AI processing lane **`aria-live`** cleanup; **no** B4-F3C3 **GeneratedPlanHistorySection** preview **`aria-live`** / error semantics work; material AI processing lane **not touched**; **GeneratedPlanHistorySection** **not touched**; task selection, Select all, Clear, 50-task limit, **`overLimit`** **`role="alert"`**, disabled behavior, checkbox labels, and task title/meta when tasks exist **unchanged**; zero-tasks state exposes **no** credentials/payloads/tokens/session/user/task titles; **no** console logging; **no** unsafe rendering; StudyOps AI remains **browser-based WEB platform / SaaS dashboard / AI study cockpit**; **375px** = **narrow responsive browser viewport** — **not** phone/native design; Supervisor Review **approved**; Security / Trust Review **approved** — **no** Critical, Important, or Minor issues; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed; manual smoke **limited** — authenticated **`/trello`** QA not live-tested; prior **B4-F3A** documentation housekeeping (**2026-06-02**); **B4-F3A** secondary in-page state surface polish shipped (commit **`596e869`**) — **CSS-only** in **`frontend/src/styles/layout.css`** only; polished **CourseDetail** materials loading/error/empty; **CourseTasksSection** filter-empty via **`.section__meta`**; material saved flashcards library loading/error/empty; material cockpit **plan-panel__error** / **plan-history__error** spacing/wrapping; **narrow responsive browser viewport ~375px** wrap/padding and safe action spacing; **no** JSX/**`components.css`**/**`tokens.css`**/shared UI component/page/service/API/auth/data-fetching/error-mapping/retry/copy changes; **no** new/removed **Try again** buttons; **no** role/**`aria-live`** changes; **B4-F2** route-level wrappers unchanged; AI processing lane **not touched**; **GeneratedPlanHistory** preview **`aria-live`** **not touched**; **TrelloTaskSelector** EmptyState prop bug **deferred at B4-F3A** — **fixed in B4-F3C1**; **At B4-F3A time:** **B4-F3B**/**B4-F3C** deferred (**B4-F3C** sub-series now **complete** — **B4-F3B** **not started**); **`LoadingState`** **`role="status"`** / **`aria-live="polite"`** and **`ErrorMessage`** **`role="alert"`** unchanged; minor note: **flashcard-library__error** and **plan-panel__error** neutral outer shells — inner **`.alert--error`** remains clear (non-blocking); StudyOps AI remains **browser-based WEB platform / SaaS dashboard / AI study cockpit**; Supervisor Review **approved with notes**; Security / Trust Review **approved with notes**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed; manual smoke **limited** — full authenticated visual QA not live-tested; prior **B4-F2** documentation housekeeping (**2026-06-02**); **B4-F2** route state surface framing shipped (commit **`ee50b8e`**) — **frontend presentation-only** in five approved files: **`DashboardStub.jsx`**, **`CoursesList.jsx`**, **`CourseDetail.jsx`**, **`StudyMaterialDetail.jsx`**, **`layout.css`**; route-level loading/error/not-found visual framing for Dashboard page loading/error wrappers, Courses page loading/error wrappers, CourseDetail early-return loading/error/not-found wrappers, StudyMaterialDetail early-return loading/error/not-found wrappers; scoped route-state CSS; neutral not-found decks for course/material missing-resource states; wrapped error action rows for existing **Try again** buttons (**loadStats**, **loadCourses**, **loadCourse**, **loadMaterial** — unchanged handlers and visibility); **narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI; StudyOps AI remains a **browser-based WEB platform / SaaS dashboard / AI study cockpit** only; **no** backend/API/database/package/auth/route guard/**`AppShell`**/service/data-fetching/error-mapping/retry/copy/**`components.css`**/**`tokens.css`**/shared UI component changes; **no** B4-F3 work at B4-F2 time; **TrelloTaskSelector** EmptyState prop bug **not fixed at B4-F2** — **fixed in B4-F3C1**; CourseDetail nested materials / StudyMaterialDetail success cockpit / AI / plan / flashcards sections / material AI processing lane **not touched**; **`LoadingState`** **`role="status"`** / **`aria-live="polite"`** and **`ErrorMessage`** **`role="alert"`** unchanged; **no** duplicate **`aria-live`** wrappers; back links remain **`Link`** elements; **`h1`** in not-found states; not-found copy neutral — **no** forbidden/admin semantics; minor note: not-found and page-error decks share neutral glass framing with primary top accent — error still uses **`ErrorMessage`** danger styling inside deck (non-blocking); Supervisor Review **approved with notes**; Security / Trust Review **approved with notes**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed; manual smoke **limited** — authenticated visual QA not live-tested (unauthenticated fake course UUID redirected to sign-in); prior **B4-F1** documentation housekeeping (**2026-06-02**); **B4-F1** shared state primitives CSS polish shipped (commit **`ea8a899`**) — **CSS-only** in **`frontend/src/styles/components.css`** only; polished **`.loading`**, **`.empty-state`**, **`.alert`** / **`.alert--error`**, **`.protected-loading`** (glass/dark UI, spinner + reduced-motion preserved, error visibility with danger tokens + left accent, **narrow responsive browser viewport ~375px** wrap rules); **no** **`LoadingState.jsx`**, **`EmptyState.jsx`**, **`ErrorMessage.jsx`**, **`layout.css`**, **`tokens.css`**, page, route, service, API, auth, or data-fetching changes; **no** copy changes; **no** new/removed **Try again** buttons; **TrelloTaskSelector** EmptyState prop bug **not fixed at B4-F1** — **fixed in B4-F3C1**; material AI nested-panel note cosmetic/non-blocking; Supervisor Review **approved with notes**; Security / Trust Review **approved with notes**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed; manual smoke **limited**; prior **B4-E** documentation housekeeping (**2026-06-02**); **B4-E** focus page body polish shipped (commit **`7f4bf6b`**) — **frontend presentation-only** in two approved files on **`/focus/:taskId`** only: **`FocusPage.jsx`**, **`layout.css`** (**`focus-workspace`** session deck / command band; improved task context, timer panel, action area, loading/error/done wrappers; factual session cockpit copy; **removed noisy `aria-live` from active timer panel**; static timer **`aria-label`** from **`session.durationMinutes`** only — **no** per-second live countdown announcements; **no** timer/session logic changes — **`DEFAULT_DURATION_MINUTES = 25`**, auto-start, countdown, **`beginFocusStart`** / **`focusStartRequests`**, phase machine, **`completeFocusSession`**, checkbox, **`refreshStats`**, error handling, navigation state/back links, **AUTH_REQUIRED** unchanged; **no** **`focus.service.js`**, **`TaskCard`**, **`App.jsx`**, **`AppShell`**, backend/API/database/package/auth/route changes; **no** pause/reset/duration picker/history/charts/streaks/fake scores/AI coach; **no** token/session/user/focus payload logging; **`taskTitle`** plain React text only; **no** `dangerouslySetInnerHTML` / `innerHTML` / eval / markdown / external assets; **narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI); **no** dashboard/courses/tasks/flashcards/Trello/admin/material/**`components.css`**/**`tokens.css`** changes; Supervisor Review **approved with notes**; Security / Trust Review **approved with notes**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed; manual smoke **limited** — no authenticated session/safe pending task; prior **B4-D** documentation housekeeping (**2026-06-02**); **B4-D** admin page body polish shipped (commit **`905ee4d`**) — **frontend presentation-only** in two approved files on **`/admin`** only: **`AdminDashboardPage.jsx`**, **`layout.css`** (**`admin-workspace`** root; admin command/read surface / command band; improved aggregate stat-band hierarchy; page loading/error/forbidden wrappers; trust note with **`role="note"`**; forbidden-card polish; **Backend status** band title rename only — same **`stats.systemHealth.backend`** / **`formatBackendHealth`**; aggregate counts only — **no** emails/user IDs/logs/credentials/sessions/full API payloads; **no** token/session/admin payload logging; **no** **`AdminRoute.jsx`**, **`App.jsx`**, **`AppShell`**, **`admin.service.js`**, auth/route/**`user?.role`**/**`getAdminStats`**/**`loadStats`**/refresh/**FORBIDDEN**/**AUTH_REQUIRED**/SEC-6A3-1 changes; **narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI); **no** backend/API/database/package/auth changes; **no** dashboard/courses/tasks/flashcards/Trello/material/focus/**`components.css`**/**`tokens.css`** changes; **no** users/roles/logs/charts/new admin actions or fake security/risk/health/AI/admin metrics; Supervisor Review **approved with notes**; Security / Trust Review **approved with notes**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed; manual smoke **limited** — logged-out **`/admin` → `/`** confirmed; prior **B4-C** Trello page body polish shipped (commit **`cf50729`**) — **frontend presentation-only** in seven approved files on **`/trello`** only: **`TrelloSyncPage.jsx`**, **`TrelloSyncSection.jsx`**, **`TrelloSyncForm.jsx`**, **`TrelloBoardListPicker.jsx`**, **`TrelloTaskSelector.jsx`**, **`TrelloSyncResults.jsx`**, **`layout.css`** (Trello integration command surface / command band, step framing for credentials/board-list/tasks/sync/results, page loading/error wrappers, results zone framing, factual manual-sync copy; **B4-C-F1** removed courses-level **Try again** — courses error **`ErrorMessage`**-only; API key/token remain **`type="password"`** with **`autoComplete="off"`**; credentials not displayed/logged/stored; **`clearCredentials`** / **`clearCredentialsAfterSync`** unchanged; trust notes honest; **narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI); **no** backend/API/database/package/auth/routes/services, **`trello.service.js`**, validation/utils, `tokens.css`, **`components.css`**, credential lifecycle, sync payload, board/list/task loading, selection, result rendering, or sync behavior changes; **no** fake AI/smart-sync/health/progress/quality/priority/urgency semantics; prior **B4-B** flashcards page body polish (commit **`f91415d`**) — **frontend presentation-only** in **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`layout.css`** on **`/flashcards`** only (flashcards command surface / command band, filters/create/study/manage framing, scoped loading/error/empty/filter-empty/action-error wrappers, manage list readability, filter **`role="group"`** + **`aria-label="Filter saved flashcards"`**; manage list truncated question only — answers not newly exposed; **`actionError`** presentation-only move still **`ErrorMessage`** / **`role="alert"`**; **narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI); **no** backend/API/database/package/auth/routes/services, `tokens.css`, **`components.css`**, **`FlashcardStudy.jsx`**, **`DbFlashcardsSection.jsx`**, flashcard CRUD/filter/study/reveal/**`refreshStats`** changes, or other route changes; **no** fake AI/mastery/progress/health/priority/urgency/status semantics; prior **B4-A** tasks page body polish (commit **`4ae80ee`**) — **frontend presentation-only** in **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`layout.css`** on **`/tasks`** only (task command surface / command band, filter toolbar framing, create/list/empty/error/loading wrappers, semantic **`ul > li`** task list, native status filter **`aria-pressed`** on real DOM — **B4-A-F1**; selected filter **not** color-only; **narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI); **no** backend/API/database/package/auth/routes/services, `tokens.css`, **`components.css`**, task CRUD/filter/validation/**Focus**/**`refreshStats`** changes, or other route changes; **no** fake AI/health/urgency/status/priority semantics; prior **BX-I6D** global shell / top navigation chrome polish (commit **`9252ba9`**) — **CSS-only** in **`layout.css`** only; prior **BX-I6C** courses / course-detail visual alignment (commit **`6a1e6ad`**) — frontend-only in **`CourseCard.jsx`**, **`MaterialCard.jsx`**, **`CoursesList.jsx`**, **`CourseDetail.jsx`**, **`layout.css`**, **`components.css`** on **`/courses`** and **`/courses/:id`** only; prior **BX-I6B** dashboard visual upgrade (commit **`cceb4e0`**); prior **BX-I5** material cockpit visual polish (commit **`c2288d4`**); prior **BX-I4** deterministic course accents (**2026-06-02**, commit **`ff65e21`**) — frontend-only in **`CourseCard.jsx`**, **`CourseDetail.jsx`**, **`DashboardStub.jsx`**, **`components.css`**, **`tokens.css`**, **`course-accent.js`**, **`dashboard-format.test.js`**; prior **BX-I3** dashboard decision layout (**2026-06-02**, commit **`bdd6f2a`**) — frontend-only in **`DashboardStub.jsx`**, **`layout.css`**, **`dashboard-recommendation.js`**, **`dashboard-format.test.js`**; prior **BX-I2** dark glass token foundation (**2026-06-02**, commit **`03ee9df`**) — CSS-only in **`tokens.css`**, **`components.css`**, **`layout.css`**; prior **DOCS-A3** alignment (**2026-06-02**) documents **12A-1**, **B1**–**B3** (commits **`00a76de`**, **`ccca764`**, **`f2de33f`**, **`e865c09`**). Prior **11A-3** (generated plan history frontend UI — **2026-05-30**); **11A-2** history REST API; **11A-1** active history DB; **10B** plan import dedupe; **10C** governance alignment; **9B** post-8C alignment. **Functional MVP** complete through **6A-3** (auth, courses, materials, material-scoped AI generate + persisted generated plan, tasks, flashcards, Trello sync with board/list picker, focus sessions, student dashboard, admin aggregate stats). **Generated plan history (11A-1 + 11A-2 + 11A-3):** migrations **010** and **011** applied manually on Supabase; multiple rows per material with one **`is_active`**; retention max **10** rows per material; GET/DELETE/generate backward compatible; history list/get-by-id/activate/delete-version REST APIs (**11A-2**); metadata-only history UI with lazy preview, restore, and delete inactive (**11A-3**); **`totalGeneratedPlans`** counts active rows only. **Plan import dedupe (10B):** material-scoped import endpoints with **`source='plan'`** and dedupe (migration **009** applied). **Hardening / docs alignment** phases **7A**–**7C** complete (**2026-05-29**). **UI / presentation polish** complete through **B4-F3C3** (**2026-06-02**) plus **8C-3D** (**2026-05-30**), **12A-1** material Source | AI cockpit (**2026-06-01**), and **B1**–**B3** global visual tokens / shell / cards (**2026-06-01**): **8A** baseline polish; **8B** design-reference docs alignment; **8C-1** global **`AppShell`** + design system; **8C-2A** dashboard/courses/course detail; **8C-2B** study material detail + AI zones; **8C-3A** tasks + focus; **8C-3B** flashcards; **8C-3C** Trello; **8C-3D** admin; **12A-1** material cockpit layout; **B1** tokens/typography; **B2** shell/cockpit width; **B3** cards/badges/filters; **BX-I2** dark graphite / glass token foundation + filled-button contrast fix; **BX-I3** dashboard decision layout (rule-based next-up hero, study pulse, course workload rows); **BX-I4** deterministic course accents (**`amber` | `rose` | `emerald`**) on course list/detail and dashboard workload rows; **BX-I5** material detail cockpit visual polish (Source | AI hierarchy, editor well, source-type pill, AI command surfaces, plan/history/import/library styling); **BX-I6B** dashboard command-center visual upgrade (flagship recommendation hero, Study pulse cockpit band, course workload command deck, tertiary **At a glance**, **narrow responsive browser viewport ~375px** polish, reduced-motion for decorative effects); **BX-I6C** courses / course-detail visual alignment (subject shelf, course workspace hierarchy, document shelf deck, honest local material count subtitle, tasks/danger framing, **narrow responsive browser viewport ~375px** — no horizontal overflow); **BX-I6D** global shell / top navigation chrome polish (glass shell bar, accent strip, brand/nav/logout hover and **`:focus-visible`**, active route styling **not** color-only, logout visible and labeled, **narrow responsive browser viewport ~375px** WEB top-nav horizontal scroll — **no** bottom tabs/drawer/hamburger-first/phone-style UI, **`prefers-reduced-motion`** for shell transitions — **`layout.css`** only); **B4-A** tasks page body polish (task command surface / command band, filter toolbar framing, create/list/empty/error/loading wrappers, semantic **`ul > li`** task list, native status filter **`aria-pressed`** — **B4-A-F1**, selected filter **not** color-only — **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`layout.css`** only); **B4-B** flashcards page body polish (flashcards command surface / command band, filters/create/study/manage framing, scoped wrappers, manage list readability — **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`layout.css`** only); **B4-C** Trello page body polish; **B4-D** admin page body polish; **B4-E** focus page body polish; **B4-F1** shared state primitives CSS polish; **B4-F2** route state surface framing (Dashboard/Courses loading/error wrappers; CourseDetail/StudyMaterialDetail early-return loading/error/not-found wrappers); **B4-F3A** secondary in-page state surfaces; **B4-F3C1** **TrelloTaskSelector** empty-state bug fix. **Production UI values:** dark graphite / glass in **`frontend/src/styles/tokens.css`** (Phase **BX-I2**) — electric blue primary, violet AI accent, cyan data accent; course accent token values and subtle/border aliases wired via **BX-I4**. **BX-I1** Stitch direction in **`DESIGN.md` v2.3** remains the presentation spec; chart UI, sidebar shell, **B4-F3B**, and remaining **B4** work are **not automatic** (**B4-A** through **B4-F3C3** body polish, route-state framing, secondary state surfaces, **B4-F3C** sub-series, and related fixes are **complete**; **B4-F3B** **not started**). Application phases **1A–1G** and **2A–2G** are complete unless noted otherwise. Existing design screenshots may predate **8C** / **BX-I2** / **BX-I3** / **BX-I4** / **BX-I5** / **B4-A** visuals unless recaptured (see **`docs/design/SCREENSHOT_INDEX.md`**). Generated plan persistence (Phases **2L-a/b/c**), **`study_tasks` table** (Phase **3A-a**), **`study_tasks` backend API** (Phase **3A-b**), **course-level manual task UI** (Phases **3A-c**–**3A-c.3** on `/courses/:id`), **global manual task UI** (Phases **3A-d**–**3A-e** on `/tasks`), **plan → task import** (Phase **3A-f**, superseded by **10B** import API), **flashcard study UI** (Phase **3B-a**), **`flashcards` DB foundation** (Phase **3B-b**), **flashcards backend API** (Phase **3B-c**), **flashcards frontend integration** (Phase **3B-d**), **flashcards manual CRUD UI** (Phase **3B-e**), **global flashcards page** (Phase **3B-f**), **global create flashcard UI** (Phase **3B-g**), **plan-sourced import dedupe** (Phase **10B**), **`trello_sync_logs` DB foundation** (Phase **4A-0**), **backend Trello sync API** (Phase **4A-1**), **frontend Trello sync page** (Phase **4A-2**), **Trello UI polish** (Phase **4A-3**), **backend Trello board/list discovery** (Phase **4B-1**), **frontend Trello board/list picker** (Phase **4B-2**), **`focus_sessions` DB foundation** (Phase **4C-0**), **backend Focus Sessions API** (Phase **4C-1**), **frontend Focus Sessions UI** (Phase **4C-2**), **Focus Sessions manual smoke** (Phase **4C-3**), **backend Dashboard Stats API** (Phase **5B**), **Dashboard frontend UI** (Phase **5C**), **Dashboard cross-page refresh** (Phase **5C.1**), **admin authorization foundation** (Phase **6A-1**), **backend admin aggregate stats API** (Phase **6A-2**), and **frontend admin dashboard UI** (Phase **6A-3**) are documented below.

---

## Operating constraints (cost & quotas)

- **Free Tier / minimal-cost:** Assume Free Tier or minimal-cost infrastructure (Supabase, Gemini, hosting) unless the human explicitly approves paid tiers, new subscriptions, or billable services.
- **Paid dependencies:** Do not add paid third-party APIs, new SaaS subscriptions, paid storage tiers, or other **cost-increasing** architecture without explicit human approval (same gate as new npm packages — see `AGENTS.md`).
- **Gemini quota:** HTTP **429** / `GEMINI_RATE_LIMIT` is expected **quota exhaustion**, not necessarily an application defect. Details: `docs/workflows/document-processing-workflow.md` (§ Gemini usage & quota). Live smoke: **one** Generate per attempt; **no** retry loops.
- **Before implementation:** Verify built vs deferred state in **this file**, the phase workflow, and applicable ADRs — do not assume PRD body describes what is shipped today.

---

## UI maturity and desktop layout (BX-I7A audit + BX-I7B foundation + BX-I7C dashboard grid + BX-I7D Tier 1 courses shelves + BX-I7E1 Tasks desktop panels + BX-I7E2 Flashcards desktop panels + BX-I7E3 Tier A Trello desktop setup panels + BX-I7E4 Admin desktop stats panels + BX-I7F Material cockpit desktop pass + BX-I8B AI command surfaces polish + BX-I8C Auth + PageHeader intro chrome + BX-I8D Motion micro-pass + BX-I8E Shared controls / card surfaces — **BX-I7 sequence complete**)

**Functional core + presentation hardening:** Auth through admin aggregate stats, material-scoped AI generate + plan history, tasks, flashcards, Trello sync, focus, dashboard decision layout, dark graphite / glass tokens (**BX-I2**), **B4**/**BX-I6** polish phases (**BX-I3**–**BX-I6D**, **B4-A**–**B4-F3C3**), **BX-I7B** global shell widening, **BX-I7C** dashboard desktop grid, **BX-I7D Tier 1** courses/course detail desktop shelves, **BX-I7E1** Tasks desktop panels, **BX-I7E2** Flashcards desktop panels, **BX-I7E3 Tier A** Trello desktop setup panels, **BX-I7E4** Admin desktop stats panels, **BX-I7F** Material cockpit desktop pass, **BX-I8B** AI command surfaces polish, **BX-I8C** Auth + PageHeader intro chrome, **BX-I8D** Motion micro-pass, **BX-I8E** Shared controls / card surface alignment, **BX-I9B1** Radius token alignment (Stitch Round Eight), **BX-I9B2a** Canvas/shell color token alignment (Stitch v2.2), **BX-I9B2b** Primary/cyan color token alignment (Stitch v2.2), **BX-I9B2c** AI/violet color token alignment (Stitch v2.2), **BX-I9B2d** Danger/error color token alignment (Stitch v2.2), **BX-I9C** / **BX-I9C-Auth** final visual QA (**Pass with notes**, review only), **BX-I10A1** flashcard study glass polish (commit **`e62c1b0`**), **BX-I10A2** material-only AI Generate gradient (commit **`b90108e`**), **BX-I10A3** filter-toolbar / command-surface glass unification (commit **`cb54ec5`**), and **BX-I10A4** course/document accent rail consistency (commit **`7e5e61f`**), **BX-I10A5** targeted glass/elevation pass (commit **`38aa561`**), and **BX-I10A6-QA** Trello failed-row live verification (**Pass with notes**, review only) are **shipped** or **recorded complete**. That work improved visual consistency, state surfaces, page-level polish, the global cockpit/shell cap, Dashboard desktop density, Courses/Course Detail desktop density, **`/tasks`** desktop density, **`/flashcards`** desktop density, **`/trello`** desktop setup density, **`/admin`** desktop stats deck density, and **`/study-materials/:materialId`** cockpit/library desktop density — but the UI is **not** final **Stitch-level** presentation yet.

**BX-I7A finding (documentation audit — no code change):** On wide **desktop browser** viewports the app could feel **too narrow and list-like** partly because the global cap was **1120px** and many routes use **one-column** stacks inside the cap.

**BX-I7B shipped (commit `00d3255` — CSS/tokens only):**

| Item | Production after **BX-I7B** |
|------|---------------------------|
| Global content cap | **`--content-max-cockpit`** and **`--content-max-shell`** = **1280px** (`frontend/src/styles/tokens.css`) — **1120px** is **no longer** the current production cap |
| Unchanged width tokens | **`--content-max-form`**, **`--content-max-workspace`**, **`--content-max-reading`** — **not** changed |
| Files changed | **`frontend/src/styles/tokens.css`**, **`frontend/src/styles/layout.css`** only |
| Page shell | **`page--cockpit`** + **`app-shell__inner`** stay aligned at the new cap |
| Layout polish | Desktop-only **`.page`** horizontal padding at **`min-width: 1280px`** |
| Narrow viewport | **Narrow responsive browser viewport ~375px** behavior **preserved** |
| Out of scope | **No** JSX, components, pages, services, backend, API, auth, routes; **no** per-page grid redesign; **no** fake metrics, sidebar, or mobile/native UI |

**BX-I7C shipped (commit `583922d` — CSS-only, `layout.css` only):**

| Item | Production after **BX-I7C** |
|------|---------------------------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`DashboardStub.jsx`**, API/backend/database/service/context/recommendation/copy changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — dashboard success body only via **`:has(.dashboard-hero)`** (loading/error unaffected) |
| **Grid** | **PageHeader** full width; **dashboard-hero** + **dashboard-study-pulse** side-by-side (hero **1 / -1** when study pulse absent); **dashboard-courses** / **dashboard-secondary** full width below |
| **Course list** | **`.page--dashboard .dashboard-course-list`** → 2-column grid on desktop |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Fake metrics, charts, sidebar, mobile/native UI; other page layouts |

**BX-I7D Tier 1 shipped (commit `52c68ab` — CSS-only, `layout.css` only):**

| Item | Production after **BX-I7D Tier 1** |
|------|-------------------------------------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`CoursesList.jsx`**, **`CourseDetail.jsx`**, component, API/backend/database/service/context/recommendation/copy changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** |
| **`/courses`** | **`.page--courses .courses-shelf--deck .courses-shelf__list`** → **3-column** grid (`repeat(3, minmax(0, 1fr))`); relies on existing **768px** `display: grid` cascade |
| **`/courses/:id`** | **`.page--course-detail .document-shelf--deck`** → **2-column** grid (`repeat(2, minmax(0, 1fr))`) when populated document shelf renders |
| **State surfaces** | Page loading/error/empty on **`/courses`**; material loading/error/empty on **`/courses/:id`** **unaffected** (grid targets success-body shelves only) |
| **Tasks** | Remain **below** materials — **unchanged**; **no** side-by-side materials \| tasks workspace |
| **Tier 2 not shipped** | **No** **`.course-workspace`** full-page grid; **no** materials \| tasks side-by-side; **no** task margin/border reset; **no** DOM reorder; **no** CSS **`order`**; **no** **`grid-template-areas`**; **no** **`CourseCard`** / **`MaterialCard`** / **`CourseTasksSection`** / **`StudyMaterialForm`** changes |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Fake metrics, charts, sidebar, mobile/native UI |

**BX-I7E1 shipped (commit `d0db43e` — CSS-only, `layout.css` only):**

| Item | Production after **BX-I7E1** |
|------|------------------------------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`TaskCard.jsx`**, component, API/backend/database/service/context/copy changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — all selectors scoped under **`.page--tasks`** |
| **Command controls** | **`.task-workspace__command-controls`** → horizontal desktop band (`flex-direction: row`, wrap); filters **`flex: 1 1 20rem`**; toolbar **`margin-left: auto`** when space allows |
| **Populated task list** | **`.command-body:has(.task-workspace__list) .task-workspace__list`** → **2-column** grid (`repeat(2, minmax(0, 1fr))`) |
| **Create form** | Remains full-width — **not** inside list grid |
| **Inline edit** | **`.task-workspace__list-item:has(.task-workspace__edit-card)`** → **`grid-column: 1 / -1`** (intended full width) |
| **State surfaces** | Loading/error/empty/filter-empty **unaffected** (grid gated by **`:has(.task-workspace__list)`**) |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Flashcards, Trello, Admin; fake metrics, charts, sidebar, mobile/native UI |

**BX-I7E2 shipped (commit `b18304c` — CSS-only, `layout.css` only):**

| Item | Production after **BX-I7E2** |
|------|------------------------------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`FlashcardStudy.jsx`**, component, API/backend/database/service/context/copy changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — all selectors scoped under **`.page--flashcards`** |
| **Command controls** | **`.flashcards-workspace__command-controls`** → horizontal desktop band; filters **`flex: 1 1 20rem`**; toolbar **`margin-left: auto`** when space allows |
| **Populated library** | **`.flashcard-library:has(.flashcards-workspace__study-zone)`** → **2-column** grid — study zone column 1, manage zone column 2 |
| **Manage list** | **`.manage-zone:has(.flashcards-workspace__list) .flashcards-workspace__list`** → **2-column** grid when populated |
| **Create / inline edit** | Create block children and **`:has(form)`** list items → **`grid-column: 1 / -1`** (full-width/readable) |
| **State surfaces** | Intro/loading/error/empty/filter-empty/status/create-cta remain full-width; **`actionError`** outside **`.flashcard-library`** unaffected |
| **Trust** | Manage list still truncated questions only — **no** answers newly exposed in manage list; study reveal remains primary answer surface outside edit forms |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Trello, Admin; fake metrics, charts, sidebar, mobile/native UI; mastery/AI/memory/health score |

**BX-I7E3 Tier A shipped (commit `cba6dde` — CSS-only, `layout.css` only):**

| Item | Production after **BX-I7E3 Tier A** |
|------|-------------------------------------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** Trello JSX/components/services/API/backend changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — all selectors scoped under **`.page--trello`** |
| **Wizard flow grid** | **`.trello-workspace__flow`** → **2-column** grid (`repeat(2, minmax(0, 1fr))`) |
| **Steps 1–2** | **`.trello-workspace__step--credentials`** + **`.trello-workspace__step--destination`** side-by-side (auto-placed columns 1 and 2) |
| **Steps 3–4 + messages** | **`.trello-workspace__step--tasks`**, **`.trello-sync__messages`**, **`.trello-workspace__step--sync`**, **`.trello-sync__submit`** → **`grid-column: 1 / -1`** (full-width) |
| **Results** | **`.trello-workspace__results-zone`** remains **outside** command band — below wizard (unchanged DOM) |
| **Step order** | DOM order unchanged: credentials → destination → tasks → messages → sync → results |
| **Tier B** | **Not implemented** — no 2-column task list, no results grid, no wizard/results side-by-side, no scroll-height override |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Admin; fake metrics, charts, sidebar, mobile/native UI; credential/sync/API behavior changes |

**BX-I7E4 shipped (commit `467ccd9` — CSS-only, `layout.css` only):**

| Item | Production after **BX-I7E4** |
|------|------------------------------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`AdminDashboardPage.jsx`**, API/backend/services/auth/copy changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — all selectors scoped under **`.page--admin-dashboard`** |
| **Stats deck grid** | **`.admin-workspace__stats-deck`** → **2-column** grid (`repeat(2, minmax(0, 1fr))`) |
| **Full-width bands** | Platform overview (**`.dashboard-band--admin-overview`**), Trello today (**`.dashboard-band--trello-today`**), Backend status (**`.dashboard-band--health`**) → **`grid-column: 1 / -1`** |
| **Side-by-side rows** | Tasks|Focus and Learning|Trello **`.admin-workspace__stats-row`** blocks sit as adjacent grid cells |
| **Inner stat grids** | **`.admin-workspace__stats`** unchanged — existing auto-fill minmax grids preserved |
| **State surfaces** | Loading/error/forbidden/**`AdminRoute`** unaffected — selectors target success-body deck only |
| **Trust** | All stats remain API-backed via **`getAdminStats()`**; backend status remains honest **`stats.systemHealth.backend`** only — **no** fake metrics, charts, health scores, new KPIs, or monitoring chrome |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Material cockpit; fake metrics; charts; sidebar; mobile/native UI; JSX/API/backend/services/auth/copy changes |

**BX-I7F shipped (commit `25988dc` — CSS-only, `layout.css` only):**

| Item | Production after **BX-I7F** |
|------|------------------------------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** JSX, API, services, backend, auth, AI generate/import/save/history behavior, or logging/content-exposure changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — selectors scoped under **`.page--material-detail`** |
| **Cockpit ratio** | **`.page--material-detail.material-workspace:has(.material-workspace__cockpit) .material-workspace__cockpit`** → **1.15fr \| 0.85fr** (source slightly wider than AI); loading/error/not-found/page-error shells omit cockpit — unaffected |
| **AI action rows** | **`.material-workspace__cockpit-ai .plan-history__actions`** and **`.plan-import-toolbar__actions`** → horizontal row with wrap; buttons **`width: auto`** at **≥1280px** on material detail |
| **Material library** | **`.flashcard-library--material:has(.flashcard-library__study)`** under **`.material-workspace__library`** → **2-column** grid (study \| manage); intro/loading/error/empty/form/status/alert/create-cta full-width |
| **Manage list** | **`.flashcard-library__manage:has(.flashcard-library__list) .flashcard-library__list`** → **2-column** grid when populated; **`:has(form)`** items → **`grid-column: 1 / -1`** |
| **Trust** | Manage list still truncated questions only in JSX — **no** answer exposure added; plan history list remains single-column; preview behavior unchanged |
| **`/flashcards`** | **Unaffected** — all selectors require **`.page--material-detail`** |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Fake metrics; charts; sidebar; mobile/native UI; course detail Tier 2; Trello Tier B |

**BX-I7 desktop layout sequence:** **Complete** — **BX-I7B**, **BX-I7C**, **BX-I7D Tier 1**, **BX-I7E1**, **BX-I7E2**, **BX-I7E3 Tier A**, **BX-I7E4**, **BX-I7F**. Optional later **BX-I7D Tier 2** (materials \| tasks side-by-side workspace) and **BX-I7E3 Tier B** (Trello task-list grid, results grid, wizard/results side-by-side, scroll-height override) require separate planning + explicit approval — **not automatic**. Authenticated visual smoke for **BX-I7F** **recommended before merge** if not yet done (optional). Authenticated visual smoke for **BX-I7E4** **recommended before merge** if not yet done (optional). Authenticated visual smoke for **BX-I7E3 Tier A** **recommended before merge** if not yet done (optional). Loading/error/**`actionError`** / console / keyboard tab smoke for **BX-I7E2** **recommended before merge** if not yet done (optional). Inline edit and console smoke for **BX-I7E1** **recommended before merge** if not yet done. Authenticated visual smoke for **BX-I7C** / **BX-I7D Tier 1** remains **recommended before merge** if not yet done.

**Do not claim:** Stitch is fully implemented in production; UI is final Stitch-perfect product; optional Tier 2 / Tier B work is shipped; **BX-I7** alone completed every remaining visual direction item (charts, sidebar, course accents on material detail still deferred).

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

**Authenticated UI shell (Phase 8C-1 + BX-I6D):** Protected routes render inside **`AppShell`** (sticky top bar: brand, main nav — Dashboard, Courses, Tasks, Flashcards, Trello — optional Admin link for admins, labeled logout). Visual chrome polished **BX-I6D** (**`layout.css`** only). Auth routes **`/`** and **`/register`** remain outside the shell.

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
| `TRELLO_API_KEY` | **backend** | Optional until OAuth connect — Trello app key; placeholders in `backend/.env.example` only |
| `TRELLO_TOKEN_ENCRYPTION_KEY` | **backend** | Optional until OAuth connect — 32-byte value, base64; tier-1 secret; **never** frontend or `VITE_*` |
| `TRELLO_OAUTH_STATE_SECRET` | **backend** | Optional — 32-byte value, base64; dedicated HMAC key for OAuth state signing; production should prefer dedicated secret; falls back to domain-separated derive from `TRELLO_TOKEN_ENCRYPTION_KEY` when unset; placeholders in `backend/.env.example` only |

Never commit real `.env` files. Never document or paste real keys in issues or PRs.

---

## Database (Supabase)

**Applied tables:** `public.profiles`, `public.courses`, `public.study_materials`, `public.material_generated_plans`, `public.study_tasks`, `public.flashcards`, `public.trello_sync_logs`, `public.trello_connections`, `public.focus_sessions`

**Trello connection table (A2, live after A5A/A5B/A5C):** `public.trello_connections` — migration `012_trello_connections.sql`; encrypted Trello user token storage; **`service_role` only**; see `docs/database/012-trello-connections-schema-and-rls.md`. Stores encrypted Trello tokens for connected users and is **used** by live boards/lists/sync routes in connected mode (**A5A**/**A5B**/**A5C**); frontend sends **`POST /api/trello/boards`** `{}`, **`/boards/:boardId/lists`** `{}`, **`/sync`** `{ listId, taskIds }` only when linked. Manual apiKey/token fallback remains available **only when disconnected** (ADR 004).

**`material_generated_plans` (Phases 2L-a + 11A-1 + 11A-2 + 11A-3 UI):** Multiple validated generated plan rows per `study_material_id` with **`is_active boolean`** — exactly **one active** row per material (partial unique index); inactive history retained up to **10** total rows per material (retention prunes oldest inactive after generate). `plan` jsonb (object, size-capped); RLS for `authenticated` (unchanged from **2L-a**); **`anon` has no access**; backend writes via **service role** + RPCs **`activate_material_generated_plan`** (generate) and **`reactivate_material_generated_plan`** (history activate — Phase **11A-2**) with ownership filters (see `docs/database/004-material-generated-plans-schema-and-rls.md`, **`docs/database/010-material-generated-plans-active-history.md`**, **`docs/database/011-reactivate-material-generated-plan.md`**; migrations **010** and **011** **applied manually** on Supabase). Frontend history UI (Phase **11A-3**) — metadata-only list; full plan fetched on Preview only. **No** failed-attempt rows, raw Gemini payloads, or duplicated material `content`.

**`study_tasks` (Phase 3A-a; source extended in Phase 10B):** Study task rows (`user_id`, `course_id`, optional `material_id`); RLS by `user_id = auth.uid()`; **`anon` has no access**; `source` CHECK **`manual` or `plan`** (Phase **10B** via `009_plan_source_import_dedupe.sql`). Table **applied and verified** on Supabase (see `docs/database/005-study-tasks-schema-and-rls.md`). **Plan import** (Phase **10B**) creates rows with **`source = plan`** via material-scoped import API; manual create remains **`source = manual`**.

**`study_tasks` backend API (Phase 3A-b):** Express routes with **`requireAuth`**; service-role queries always filter by authenticated `user_id`. Task responses are **camelCase** and do **not** include `userId`, study material `content`, or generated `plan` JSON. **`difficulty`** / **`tags`** are returned (defaults on create) but **not client-editable**. **`status`** is **not** PATCHable — use **`POST /api/tasks/:taskId/complete`** only. Wrong-owner or missing task → neutral **`404`** “Task not found”. **Frontend** task UI: course-level Phases **3A-c**–**3A-c.3**, global Phases **3A-d**–**3A-e**, frontend material filters (**TASK-MATERIAL-FILTERS-A2**), material detail related tasks band (**TASK-MATERIAL-DETAIL-A3**); plan import on material detail via Phase **10B** (below).

**`flashcards` (Phases 3B-a through 3B-g + FLASHCARD-REVIEW-A1 + FLASHCARD-REVIEW-A2 + FLASHCARD-REVIEW-A3):**

| Phase | Status |
|-------|--------|
| **3B-a** | Generated-plan **FlashcardStudy** UI on material detail (`plan.flashcards`) |
| **3B-b** | **`public.flashcards`** table + RLS (applied on Supabase) |
| **3B-c** | Backend flashcards REST API |
| **3B-d** | Material detail: saved DB flashcards + import `plan.flashcards` |
| **3B-e** | Material detail: manual create / edit / delete |
| **3B-f** | Global **`/flashcards`** page: list, study, filter, edit, delete |
| **3B-g** | Global **`/flashcards`** create: required course + optional material |
| **FLASHCARD-REVIEW-A1** | Aggregate review state columns + **`POST /api/flashcards/:flashcardId/review`** (backend/database) |
| **FLASHCARD-REVIEW-A2** | Frontend Known/Unknown buttons for **saved DB flashcards** only (material detail + **`/flashcards`**) |
| **FLASHCARD-REVIEW-A3** | Frontend review-state filter for **saved DB flashcards** (material detail + **`/flashcards`**) — client-side by **`mastery`** |

Normalized flashcard rows (`user_id`, `course_id`, optional `material_id`, `question`, `answer`, `tags`, `source` CHECK **`manual` or `plan`** — Phase **10B** via `009_plan_source_import_dedupe.sql`). **Review state (FLASHCARD-REVIEW-A1):** aggregate columns **`mastery`** (`new` \| `learning` \| `known`), **`last_reviewed_at`**, **`review_count`**, **`known_count`**, **`unknown_count`** — migration **`013_flashcard_review_state.sql`** **applied successfully** on Supabase; **not** SRS scheduling (**no** **`next_review_at`**, **no** review history table). **Review UI (FLASHCARD-REVIEW-A2):** saved DB flashcards on material detail and **`/flashcards`** show **Known** / **Unknown** after answer reveal; frontend calls **`POST /api/flashcards/:flashcardId/review`** and merges response locally (**no** refetch on review); plan JSON **`FlashcardStudy`** in **`GeneratedPlanSection`** has **no** review buttons. **Review-state filter (FLASHCARD-REVIEW-A3):** **`filterFlashcardsByReviewState`** in **`flashcard-filters.js`** filters already-loaded saved DB cards by **`mastery`** — **All**, **New + Learning** (`needs_review`), **New**, **Learning**, **Known**; affects study deck and manage list on material detail and **`/flashcards`**; composes with course/material filters on global page; **no** backend **`?mastery=`**; **no** URL-persisted filters. RLS by `user_id = auth.uid()`; **`anon` has no access**; ownership triggers mirror `study_tasks`. Base table **applied and verified** on Supabase on **2026-05-26** (see `docs/database/006-flashcards-schema-and-rls.md`). Material detail shows **saved DB flashcards** (study + create/edit/delete + review + review-state filter) and **generated-plan flashcards** (both may appear after import). Global page shows **all saved flashcards** with course/material/review-state filters, **create**, study, edit, delete, and review. **No** course-level flashcard management UI. **Not** full SRS; **no** **`next_review_at`**, SM-2/Anki, review history table, or dashboard due cards (**FLASHCARD-REVIEW-A4** and related deferred).

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
| **frontend** | **Generate** (`generateMaterial`, body `{}`); **load** saved plan on material detail (`GET`); **Clear** via backend `DELETE`; read-only plain-text display (summary, key topics, difficulty, tasks, flashcards); optional **Last saved** from `savedAt`. **Generate UX polish (GEMINI-GENERATE-UX-A1):** source editor draft character count (100–50,000); generate readiness indicator from **saved** `material.content` (ready / save first / too short); **`formatGenerateError`** maps `GEMINI_*` / `SERVER_ERROR` / `VALIDATION_ERROR` to stable user messages; Generate disabled when not ready. **Import plan tasks/flashcards** (Phase **10B**) — batch import via **`POST .../import/tasks`** and **`POST .../import/flashcards`** from visible `plan` (see **10B** section). **Plan history UI (11A-3):** **`GeneratedPlanHistorySection`** — metadata-only list (`listGeneratedPlans`); **Active** / **Previous version** badges; lazy **Preview** for inactive only (`getGeneratedPlanById`); **Make active** / Restore (`activateGeneratedPlan`, body `{}`); delete inactive with confirm (`deleteGeneratedPlanVersion`); active row has no Preview / Make active / Delete; activate updates main plan section; history refreshes after generate/clear/activate/delete. **No** `localStorage` / `sessionStorage` for plans/history; **no** direct Supabase plan writes; **no** polling; **no** bulk full-plan fetch on list load |

**Generate and persistence rules:**

- `materialId` from route only — not from body.
- Body must not include `studyText`, `content`, `courseId`, `userId`, `plan`, or ownership fields.
- Backend uses **saved** material `content` after ownership check (user must save edits before generate if form is dirty).
- **One active plan per material** (Phase **11A-1**) — regenerate inserts a new active row; prior active becomes inactive; up to **10** rows per material retained (oldest inactive pruned). **History REST APIs** (Phase **11A-2**) — list/get-by-id/activate/delete-version. **History UI** (Phase **11A-3**) — metadata-only list; Preview inactive only; Restore via activate (no Gemini); delete inactive with confirm.
- Generated `plan` is **untrusted display data** — validated on the backend immediately before DB write; rendered as plain React text in the UI.
- Missing active plan → `404` “Generated plan not found” → **empty state** (not a scary error). Wrong-owner/missing material → neutral `404` “Study material not found”.

**PRD drift (approved refinement):** PRD §9 describes `POST /api/courses/:courseId/generate` with `{ studyText }`. The **implemented** route is material-scoped (above). Course-level paste-generate remains **deferred**. **`public.flashcards` table** (3B-b), **backend API** (3B-c + **FLASHCARD-REVIEW-A1** review endpoint), **material-detail frontend** (3B-d: saved list + plan import; 3B-e: manual create/edit/delete; **FLASHCARD-REVIEW-A2**: Known/Unknown on saved DB cards; **FLASHCARD-REVIEW-A3**: client-side review-state filter on saved DB cards), and **global `/flashcards`** (3B-f: list/study/filter/edit/delete + **FLASHCARD-REVIEW-A2** review + **FLASHCARD-REVIEW-A3** review-state filter; 3B-g: global create) exist; **bulk create**, course-level management, full SRS scheduling, backend mastery query params, and other advanced study features remain **deferred**.

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

**UI:** Optional **Link to material (optional)** `<select>` on create and edit forms (values from course `materials` list only — no free-text IDs). **`TaskCard`** material line (**TASK-MATERIAL-LINKS-A1**): when `task.materialId` is set, **`Material:`** with React Router **`Link`** to **`/study-materials/:materialId`** — link text is `materialLabel` when provided, otherwise fallback **View study material**; when `task.materialId` is absent, no material line. On **`/courses/:id`**, parent passes loaded `materials` so titles usually resolve. Edit form shows **Linked material unavailable** option when task has orphan `materialId`. **Completed** tasks: material link display only — **no** edit (unchanged from **3A-c.1**).

**Client Zod:** `materialIdSchema`; `createTaskFormSchema` — optional UUID; `updateTaskFormSchema` — UUID or `null` (strict).

**Not in 3A-c.3:** filtering tasks by `materialId` (added in **TASK-MATERIAL-FILTERS-A2**), generated-plan → `study_tasks` import, global `/tasks` (added in **3A-d**), mark incomplete, URL-persisted filters, flashcards, Trello, dashboard/admin. Material **navigation** links from **`TaskCard`** added in **TASK-MATERIAL-LINKS-A1** (below).

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

**UI:** **`TasksPage`** + **`GlobalTasksSection`** — `listCourses()` for course filter dropdown; `listAllTasks({ courseId?, status? })` with allowlisted query params only (**no** `materialId` query param — material filtering is frontend-only in **TASK-MATERIAL-FILTERS-A2**). **Course filter:** All courses + one option per owned course (in-memory). **Status filter:** All / Pending / Completed (in-memory). **Material filter (TASK-MATERIAL-FILTERS-A2):** shown only when a specific owned course is selected; options from **`listMaterials(courseFilter)`**; filters already-loaded tasks in memory; changing course resets material filter to **All materials in course**. Filter changes cancel edit and refetch (status/course) or filter in memory (material). **`TaskCard`** shows **Course:** with **link to `/courses/:id`**; when `task.materialId` is set, **`Material:`** **`Link`** to **`/study-materials/:materialId`** (**TASK-MATERIAL-LINKS-A1** — `materialLabel` or fallback **View study material**; **TASK-MATERIAL-FILTERS-A2** resolves labels from loaded course materials when a course is selected). **Pending:** edit, complete, delete. **Completed:** no edit; delete allowed. **Edit:** reuses **`updateTaskFormSchema`**; **`listMaterials(task.courseId)`** lazy-loaded on edit open only (not on page load). **No create** on `/tasks` at **3A-d** ship — create added in **3A-e** (below). Empty state: manual-task copy + navigate to `/courses`.

**Nav:** Links to `/tasks` from Dashboard and Courses list headers.

**Not in 3A-d:** create task on `/tasks`, `GET /api/tasks/:id`, Start Focus / focus sessions, generated-plan → `study_tasks` import, mark incomplete, material filtering (added in **TASK-MATERIAL-FILTERS-A2**), URL-persisted filters, flashcards, Trello, dashboard/admin.

**Tests (frontend):** `npm test` **72/72** (adds `listAllTasks` query-variant service tests). Lint passed (one pre-existing `AuthContext.jsx` warning). Build passed. Backend tests not re-run (backend untouched).

**Known limitations:** `/tasks` renders task section only after `listCourses()` succeeds; when **All courses** is selected, material labels may show fallback **View study material** until a specific course is selected (**TASK-MATERIAL-FILTERS-A2** loads course materials for label resolution when a course is selected). **Create on `/tasks`** added in Phase **3A-e** (below).

---

## Implemented — Study tasks (global create, Phase 3A-e)

**Frontend-only addition to protected `/tasks`** — inline **create** manual **`study_tasks`** from the global page using existing backend **`POST /api/courses/:courseId/tasks`**. **No** backend, database, migration, document-service, or package changes. **Only** `frontend/src/components/tasks/GlobalTasksSection.jsx` changed in implementation.

| Action | API |
|--------|-----|
| Create | `POST /api/courses/:courseId/tasks` — body: `title`, `estimatedMinutes`, optional `description`, `priority`, optional `materialId` (course id in URL only) |

**UI:** **Add study task** when user has at least one course and status filter is **not** Completed (also hidden while list is loading or has load error). Inline create form: **required course** dropdown (`Select a course` + owned courses from `listCourses()` prop); **title**, **estimated minutes**, **priority**; optional **description**; optional **Link to material** — **`listMaterials(createCourseId)`** lazy-loaded only after a valid owned course is selected (not preloaded for all courses). **None** omits `materialId` from POST; selected material sends UUID. Client Zod: **`createTaskFormSchema`** (unchanged). Opening create cancels edit; opening edit closes create; filter changes close create and cancel edit. After success: form closes, fields reset, list refetches, **`courseFilter`** set to created course so the new **pending** task is visible.

**Not in 3A-e:** `GET /api/tasks/:id`, Start Focus / focus sessions, generated-plan → `study_tasks` import, mark incomplete, material filtering (added in **TASK-MATERIAL-FILTERS-A2**), URL-persisted filters, flashcards, Trello, dashboard/admin.

**Tests (frontend):** `npm test` **72/72** (unchanged — no service/validation file changes). Lint passed (one pre-existing `AuthContext.jsx` warning). Build passed. Backend tests not re-run (backend untouched).

**Reviews:** Supervisor — approved with notes. Security Review — no blockers.

**Known limitations / minor notes:** Possible **double refetch** after create (explicit `loadTasks` overrides + filter `useEffect`); brief **loading flash** after create; create **`NOT_FOUND`** may display **“Course not found”** even for material mismatch (UX only, not security); with **All courses** selected, material link text may show fallback **View study material** (**TASK-MATERIAL-FILTERS-A2** improves label resolution when a specific course is selected); tasks created without a material link may be hidden under an active material filter (expected frontend-only behavior); `/tasks` task section gated on successful `listCourses()`.

---

## Implemented — Task card material navigation links (Phase TASK-MATERIAL-LINKS-A1)

**Frontend-only** — **`TaskCard`** on **`/courses/:id`** and **`/tasks`** renders linked study materials as React Router **`Link`** elements to **`/study-materials/:materialId`**. **No** backend, API, database, migration, or package dependency changes (`frontend/package.json` **`test`** script updated to include new unit test file only).

| Condition | Behavior |
|-----------|----------|
| `task.materialId` absent | No material line rendered |
| `task.materialId` present + `materialLabel` provided | **`Material:`** line with **`Link`** to **`/study-materials/:materialId`**; link text = `materialLabel` |
| `task.materialId` present + `materialLabel` missing | Same **`Link`**; fallback link text **View study material** |

**Known limitations:** Global **`/tasks`** with **All courses** selected may show fallback **View study material** on list cards (**TASK-MATERIAL-FILTERS-A2** resolves labels from loaded course materials when a specific course is selected). **`/courses/:id`** usually resolves titles from loaded course `materials`.

**Not in TASK-MATERIAL-LINKS-A1:** filter tasks by study material (shipped in **TASK-MATERIAL-FILTERS-A2**); URL-persisted task filters; material-scoped task bands on material detail (shipped in **TASK-MATERIAL-DETAIL-A3**); other **`TaskCard`** behavior changes (course link, Start Focus, CRUD actions unchanged).

**Implementation files:** `frontend/src/components/tasks/TaskCard.jsx`, `frontend/tests/unit/task-card-material-link.test.js`, `frontend/package.json` (test script only).

**Reviews:** Supervisor Review — passed. Security Review — **not required** (frontend navigation only).

**Tests (frontend):** `npm test` passed; lint passed; build passed. GitHub CI on **main** green. Backend tests not re-run (backend untouched).

---

## Implemented — Task material filters (Phase TASK-MATERIAL-FILTERS-A2)

**Frontend-only** — client-side study material filtering on **`/courses/:id`** and **`/tasks`**. Filters already-loaded task lists by **`task.materialId`**; composes with existing status filters (and course filter on global **`/tasks`**). **No** backend, API, database, migration, document-service, or URL query param changes.

| Surface | Material filter behavior |
|---------|-------------------------|
| **`/courses/:id`** | **Study material** `<select>` always visible; options from course-page **`materials`** prop (**All materials in course** + each course material); **no** extra materials API call in **`CourseTasksSection`** |
| **`/tasks`** | Material filter shown **only** when course filter is a specific owned course (hidden for **All courses**); loads materials via existing **`listMaterials(courseFilter)`**; changing course resets material filter to **All materials in course** via **`resetMaterialFilterForCourseChange()`** |
| **Filter logic** | **`filterTasksByMaterial(tasks, materialFilter, materials)`** in **`frontend/src/utils/task-filters.js`** — when filter is **`all`**, returns full list; when filter is an unknown or unowned material id, returns full list (safe fallback); otherwise returns tasks where **`task.materialId === materialFilter`** |
| **Composition** | Material filter applies **after** status/course API fetch — status still uses backend **`?status=`**; course still uses backend **`?courseId=`**; material is **not** sent to the API |
| **Empty state** | **No tasks match the selected filters.** when combined filters yield zero visible tasks (existing filter-empty wrappers) |
| **Labels** | Global **`/tasks`** builds **`materialTitleById`** from loaded filter materials (and edit materials when editing) so **`TaskCard`** **`materialLabel`** resolves where possible when a course is selected |

**UI:** **`CourseTasksSection`** — material filter in filter toolbar alongside All/Pending/Completed; filter changes cancel create/edit. **`GlobalTasksSection`** — material filter between course and status controls when **`showMaterialFilter`**; material filter disabled while filter materials load; CRUD actions unchanged under active material filter.

**Not in TASK-MATERIAL-FILTERS-A2:** backend **`GET /api/tasks?materialId=`** or **`GET /api/courses/:id/tasks?materialId=`**; URL-persisted task filters; material detail related tasks band (shipped in **TASK-MATERIAL-DETAIL-A3**); filter for tasks **without** a material link; Study Rooms / collaboration; PDF; SRS; dashboard charts.

**Implementation files:** `frontend/src/utils/task-filters.js`, `frontend/src/components/tasks/CourseTasksSection.jsx`, `frontend/src/components/tasks/GlobalTasksSection.jsx`, `frontend/tests/unit/task-filters.test.js`, `frontend/package.json` (test script only).

**Reviews:** Supervisor Review — passed. Manual smoke — **Pass with notes** (non-blocking: demo account unavailable locally; tasks without material link hidden under active material filter). Security Review — **not required** (frontend-only filtering over already authenticated, already-loaded task data).

**Tests (frontend):** `npm test` passed; lint passed; build passed. Backend tests not re-run (backend untouched).

---

## Implemented — Material detail related study tasks band (Phase TASK-MATERIAL-DETAIL-A3)

**Frontend-only** — read-only **Related study tasks** band on **`/study-materials/:materialId`**. Renders between the material cockpit and **Saved flashcards**. **No** backend, API, database, migration, document-service, or URL query param changes.

| Aspect | Detail |
|--------|--------|
| **Component** | **`MaterialRelatedTasksSection`** — mounted from **`StudyMaterialDetail.jsx`** |
| **Data load** | Existing **`listCourseTasks(courseId)`** — full course task list; client-side filter only |
| **Filter helpers** | **`getMaterialLinkedTasks`**, **`summarizeLinkedTaskCounts`**, **`selectLinkedTaskPreview`** in **`frontend/src/utils/task-filters.js`** |
| **Preview** | Up to **5** compact read-only rows; pending tasks before completed; title + status badge + priority + estimated minutes |
| **Counts** | `{pending} pending · {completed} completed · {total} total` |
| **States** | Loading (**Loading related tasks…**); empty (informational copy — import from plan or link on course page); error + **Try again**; populated preview + optional “N more linked tasks on the course page” |
| **Navigation** | **`Link`** to **`/courses/:courseId`** — **View tasks on course** (always shown when not loading/error) |
| **Refresh** | **`refreshKey`** prop — **`StudyMaterialDetail`** calls **`refreshRelatedTasks()`** after successful or partially successful plan task import |
| **Distinction** | Section subtitle: saved DB tasks linked to this material — **not** the AI plan preview above |
| **Not rendered** | **`TaskCard`**; edit, complete, delete, Start Focus, or inline CRUD inside the band |

**UI:** Scoped styles under **`.material-workspace__related-tasks`** / **`.material-related-tasks__*`** in **`layout.css`**.

**Not in TASK-MATERIAL-DETAIL-A3:** backend **`GET /api/tasks?materialId=`** or **`GET /api/courses/:id/tasks?materialId=`**; URL-persisted task filters; filter for tasks **without** a material link; **`TaskCard`** or task actions inside the band; new backend routes or query params.

**Implementation files:** `frontend/src/components/materials/MaterialRelatedTasksSection.jsx`, `frontend/src/pages/StudyMaterialDetail.jsx`, `frontend/src/utils/task-filters.js`, `frontend/src/styles/layout.css`, `frontend/tests/unit/material-linked-tasks.test.js`, `frontend/package.json` (test script only).

**Reviews:** Supervisor Review — passed. Manual smoke — passed. Follow-up manual smoke — passed. Security Review — **not required** (frontend-only display/filter over already authenticated **`listCourseTasks`** responses; no new API surface or credential handling).

**Tests (frontend):** `npm test` passed; lint passed; build passed. Backend tests not re-run (backend untouched).

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

Frontend-only on **`/study-materials/:materialId`** — when `plan.flashcards` exists and length > 0, `GeneratedPlanSection` renders a flip/reveal study UI (`FlashcardStudy`) showing **one card at a time** (question first, **“Show answer”**, answer as plain text), with **Previous/Next** navigation and a **“Card X of N”** counter. Reveal state resets on navigation; current card index resets when the study deck identity changes (**`buildStudySetKey`** — **FLASHCARD-REVIEW-A2**). This block reads **only** from generated plan JSON (`material_generated_plans.plan`) — **no** **`onReviewOutcome`**, **no** Known/Unknown buttons, **no** review API calls. **Saved DB flashcards** (Phase **3B-d** + **FLASHCARD-REVIEW-A2**) use a separate **Saved flashcards** section and the same `FlashcardStudy` component via **`GET /api/flashcards?materialId=`** with Known/Unknown review when cards have DB ids. Tags are rendered as plain React text metadata (no HTML injection).

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

**Post-A5C note (current):** Stored-token sync (**A5A**), connected-account frontend sync (**A5B**), connected manual-credential block (**A5C**), and board/list persistence (**A6**) are **shipped**. **Still deferred:** Trello card update/delete; force re-sync; single-use OAuth state nonce persistence. **When connected:** primary sync uses **`POST /api/trello/boards`** `{}`, **`/boards/:boardId/lists`** `{}`, **`/sync`** `{ listId, taskIds }` — **no** `apiKey`/`token` from frontend; connected + manual credentials → **`TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED`** / **400**. **When disconnected:** manual apiKey/token fallback only (ADR 004). **At 4A-3 ship (historical):** manual apiKey/token was the only active sync path; connect UI and stored-token sync shipped in **A4–A5C**.

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

## Implemented — Trello OAuth storage foundation (Phase TRELLO-OAUTH-A2-DB)

**Storage/security foundation only** — prepares for OAuth. **At A2 ship (historical):** this phase did **not** change live Trello UX or HTTP behavior; manual apiKey/token on **`/trello`** and ephemeral POST bodies (ADR 004) were the **only** production path. **Today (after A4–A5C):** connected-account sync is the **primary** **`/trello`** path when linked; manual fallback is available **only when disconnected** (see **A5A**–**A5C**).

| Item | Detail |
|------|--------|
| Migration | `supabase/migrations/012_trello_connections.sql` — apply manually on Supabase when approved |
| Table | `public.trello_connections` — one row per user; AES-256-GCM token fields; optional `default_board_id` / `default_list_id` |
| Access | **`service_role` only** — no `authenticated` policies; frontend must not use PostgREST on this table |
| Backend | `trello-token-crypto.js`, `trello-connection.repository.js`; optional env placeholders in `backend/.env.example` |
| Tests | Unit tests for crypto + repository (mocked Supabase) |
| ADR | [006 — encrypted connections](adrs/006-trello-oauth-encrypted-connections.md); ADR 004 partially superseded when connect ships |

**Not in A2 (was deferred at A2 — now shipped in A4–A5C):**

- Frontend Connect Trello UI or `/trello/connect/callback` — **A4-FRONTEND**
- Stored-token `POST /api/trello/boards`, `/lists`, `/sync` — **A5A**; connected frontend UX — **A5B**; manual override while connected blocked — **A5C**
- Manual apiKey/token hidden when connected on **`/trello`** — **A5B** (fallback when disconnected only)

**Moved to A3 (see below):** OAuth authorize URL route, connection status, connect/complete, disconnect HTTP APIs.

**See:** `docs/database/012-trello-connections-schema-and-rls.md`, `docs/security/trello-oauth-foundation.md`

---

## Implemented — Trello OAuth backend connect routes (Phase TRELLO-OAUTH-A3)

**Backend-only** — four authenticated routes on `/api/trello`; builds on **A2** encrypted storage. **At A3 ship (historical):** connect was backend-only; user-facing connect shipped in **A4-FRONTEND**; stored-token boards/lists/sync in **A5A**; connected-account sync UX in **A5B**; manual-credential hardening while connected in **A5C**. **Today:** account connect and connected-account sync are **live** on **`/trello`**; manual fallback when **disconnected** only (ADR 004).

| Item | Detail |
|------|--------|
| Routes | `GET /api/trello/connection` — sanitized connection status |
| | `GET /api/trello/authorize-url` — Trello authorize URL (`response_type=token`, `callback_method=fragment`, `scope=read,write`, `expiration=never`, `name=StudyOps`; `return_url` = `FRONTEND_URL/trello/connect/callback?state=<signed-state>` — see **A4-STATE**) |
| | `POST /api/trello/connect/complete` — body `{ token, state }` strict (see **A4-STATE**); validates signed state before Trello `GET /members/me`; encrypts and upserts `trello_connections` |
| | `POST /api/trello/disconnect` — body `{}` strict; best-effort Trello token revoke; hard-deletes local row |
| Auth | **`requireAuth`** on all four routes; user scope via `req.user.id` only — **no** `user_id` in request body |
| Connected response (A3 contract) | `{ connected: true, trelloMemberId, trelloUsername, scopes, expirationPolicy, expiresAt, defaultBoardId, defaultListId, connectedAt, updatedAt }` — flat shape; **no** token, ciphertext, iv, or tag |
| Disconnected response | `{ connected: false }` |
| Backend modules | `trello-connection.service.js`, `trello.controller.js`, `trello.routes.js`, `trello.schema.js`; `getMemberMe` / `deleteToken` in `trello.client.js` |
| Unchanged at A3 | **`POST /api/trello/boards`**, **`/lists`**, **`/sync`** — manual `{ apiKey, token }` until **A5A** added stored-token mode |

**Reviews (A3):** Supervisor Review **Pass with notes**; Security Review **Security approved with notes** — **no blocking security issues**. **`npm test`:** **396** pass; **`npm run lint`:** pass.

**Not in A3 (was deferred at A3 — now shipped or still deferred):**

- **Shipped:** frontend callback **`/trello/connect/callback`** (**A4-FRONTEND**); Connect/Disconnect on **`/trello`**; stored-token boards/lists/sync (**A5A**); connected-account sync UX (**A5B**); connected + manual credentials blocked (**A5C**)
- **Still deferred:** Trello card update/delete; force re-sync

**Moved to A4-STATE (see below):** OAuth signed **state** protection on authorize-url / connect/complete.

**See:** `docs/security/trello-oauth-foundation.md`, ADR [006](adrs/006-trello-oauth-encrypted-connections.md)

---

## Implemented — Trello OAuth signed state (Phase TRELLO-OAUTH-A4-STATE)

**Backend-only** — HMAC-signed OAuth state on connect flow; blocks account-linking CSRF where a logged-in user could be tricked into completing connect with an attacker’s Trello token. **At A4-STATE ship (historical):** no frontend callback yet — connect UI shipped in **A4-FRONTEND**; sync path evolution **A5A**–**A5C** (see above).

| Item | Detail |
|------|--------|
| State module | `trello-oauth-state.js` — HMAC-SHA256 signed payload (`sub`, `n`, `iat`, `exp`, `pur`); 10-minute TTL; purpose `trello_oauth_connect` |
| `GET /api/trello/authorize-url` | Creates signed state bound to `req.user.id`; embeds in `return_url` query (`/trello/connect/callback?state=…`); returns `{ authorizeUrl }` only — **no** separate `state` field |
| `POST /api/trello/connect/complete` | Strict body `{ token, state }`; verifies state **before** Trello `GET /members/me` and **before** DB upsert; invalid/missing/tampered/expired/foreign state → `TRELLO_OAUTH_STATE_INVALID` / 400 / generic message (no exact reason echoed) |
| Signing key | Prefer `TRELLO_OAUTH_STATE_SECRET` (32-byte base64); fallback: domain-separated HMAC derive from `TRELLO_TOKEN_ENCRYPTION_KEY`; missing/invalid config → safe `SERVER_ERROR` / 503 |
| Unchanged | **`POST /api/trello/boards`**, **`/lists`**, **`/sync`**, **`/connection`**, **`/disconnect`** behavior (except connect/complete now requires `state`) |

**Security (A4-STATE):**

- Signed state blocks account-linking CSRF (attacker token without victim-bound state fails)
- State is **stateless** and **not single-use**
- **MVP residual risk:** replay within 10-minute TTL if full `{ token, state }` + session captured — acceptable for MVP; document as future hardening
- **Future hardening:** single-use nonce persistence (server-side store)

**Reviews (A4-STATE):** Supervisor Review **Pass**; Security Review **Security approved with notes** — **no blocking security issues**. **`npm test`:** **417** pass; **`npm run lint`:** pass.

**Not in A4-STATE (was deferred at A4-STATE — now shipped in A4-FRONTEND + A5A–A5C):**

- Frontend `/trello/connect/callback` and Connect/Disconnect UX — **A4-FRONTEND**
- Stored-token boards/lists/sync — **A5A**; connected frontend sync — **A5B**; manual override while connected blocked — **A5C**

**See:** `docs/security/trello-oauth-foundation.md`, ADR [006](adrs/006-trello-oauth-encrypted-connections.md)

**User-facing connect:** shipped in **TRELLO-OAUTH-A4-FRONTEND** (see below). **A5A** adds backend stored-token mode on boards/lists/sync. **A5B** adds frontend connected-account sync UX. **A5C** adds backend manual-credential hardening while connected (see below).

---

## Implemented — Trello OAuth backend manual-credential hardening (Phase TRELLO-OAUTH-A5C)

**Backend only** — hardens **`trello-credentials.resolver.js`** so connected users cannot override stored token with manual `{ apiKey, token }` on boards/lists/sync. Builds on **A5A** stored-token mode and **A5B** frontend connected-account UX. **No route path changes.** **No frontend changes.**

| Item | Detail |
|------|--------|
| **Connected + stored** | `{}` / `{ listId, taskIds }` — unchanged stored-token path |
| **Connected + manual** | **`TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED`** / **400** — static message: *Use your connected Trello account, or disconnect before using manual credentials.* |
| **Disconnected + manual** | Unchanged — ephemeral manual fallback (ADR 004) |
| **Disconnected + stored** | **`TRELLO_NOT_CONNECTED`** / **400** (unchanged) |
| **Partial credentials** | **`VALIDATION_ERROR`** / **400** (unchanged) |
| **Reject boundary** | Before **`decryptTokenForUser`**, Trello API call, and **`trello_sync_logs`** write |
| **Error safety** | Response includes **no** `apiKey`/`token`/request-body details |
| **Implementation** | **`assertManualCredentialsAllowed(userId)`** — metadata-only **`getConnectionByUserId(userId)`** scoped to **`req.user.id`** |

**Security (A5C — reviewed):**

- Wrong-account manual sync while connected **blocked at backend**
- Reject before decrypt, Trello call, sync log write
- Manual fallback available **only when disconnected** — user must disconnect first to use manual credentials
- Closes hardening gap deferred from **A5A**/**A5B**

**Reviews (A5C):** Supervisor Review **Pass with notes**; Security Review **Security approved with notes**. **`npm test`:** **448** pass; **`npm run lint`:** pass.

**Not in A5C (deferred):**

- Trello card update/delete; force re-sync

**See:** `docs/security/trello-oauth-foundation.md`, `docs/workflows/trello-sync-workflow.md`, ADR [006](adrs/006-trello-oauth-encrypted-connections.md)

---

## Implemented — Trello board/list persistence (Phase TRELLO-A6)

**Connected mode only** — persists preferred Trello board/list on `trello_connections.default_board_id` / `default_list_id` (schema from **A2**). Builds on **A5A**–**A5C** connected-account sync. **No migration.** Manual fallback when disconnected unchanged (no server defaults; no browser storage).

| Item | Detail |
|------|--------|
| Route | **`PATCH /api/trello/connection/defaults`** — body `{ boardId, listId }` strict; **`requireAuth`**; connected users only |
| Response | Sanitized connected metadata (same flat shape as **`GET /api/trello/connection`**) — includes updated `defaultBoardId` / `defaultListId`; **no** token/ciphertext |
| Not connected | **`TRELLO_NOT_CONNECTED`** / **400** |
| Reconnect | Same `trello_member_id` → preserve defaults; different member → clear defaults |
| Disconnect | Hard-delete row → defaults removed (unchanged **A3**) |
| Frontend **`/trello`** | Passes saved defaults from connection into sync section; after **Load boards**, preselects saved board/list when still available; auto-saves on list selection (connected); inline notice when saved board/list missing; non-blocking error if save fails |
| Storage | DB via backend only — **not** localStorage/sessionStorage |

**Not in A6 (deferred):**

- Auto-load boards on mount; Trello card update/delete; force re-sync

**See:** `docs/database/012-trello-connections-schema-and-rls.md`, `docs/security/trello-oauth-foundation.md`

---

## Implemented — Trello OAuth frontend connected-account sync (Phase TRELLO-OAUTH-A5B)

**Frontend only** — **`/trello`** sync section uses **connected-account mode** when `TrelloConnectionPanel` reports a connected account. Builds on **A5A** backend stored-token mode; **no backend contract changes** in this phase. OAuth Connect/Disconnect from **A4-FRONTEND** unchanged.

| Item | Detail |
|------|--------|
| **Connected mode** | **`POST /api/trello/boards`** body **`{}`**; **`POST /api/trello/boards/:boardId/lists`** body **`{}`**; **`POST /api/trello/sync`** body **`{ listId, taskIds }`** only — **no** `apiKey`/`token` keys from frontend |
| **Connected UI** | Manual apiKey/token inputs **hidden**; trust note that boards/lists/sync use connected account (`@trelloUsername`) |
| **Disconnected / manual mode** | Connect account prompt; **Advanced manual credentials** in collapsed `<details>`; sends `{ apiKey, token }` only when user explicitly uses manual fallback |
| **Manual credentials** | Ephemeral React form state only; cleared after manual sync attempt and on connected/disconnected transitions; **not** in localStorage/sessionStorage/URL/logs |
| **Service** | `fetchTrelloBoards()`, `fetchTrelloBoardLists({ boardId })`, `syncTasksToTrello({ listId, taskIds })` in connected mode — credential args omitted |
| **Validation** | `validateTrelloLoadBoards` / `validateTrelloSyncForm` skip credential requirement in `connected` mode |
| **Errors** | `mapTrelloSyncError` — separate from connect errors; connected `TRELLO_AUTH_ERROR` tells user to reconnect; no raw Trello tokens/URLs in UI |
| **State transitions** | Disconnect clears connected boards/lists/results; `loading`/`syncing` disable unsafe actions |
| **Unchanged** | OAuth callback (**A4**); backend routes/schemas (**A5A**); no direct `api.trello.com` from browser |

**Security (A5B — reviewed PASS):**

- Connected frontend requests contain **no** `apiKey`/`token`
- **No** direct Trello API calls from frontend
- **No** credential storage in localStorage/sessionStorage
- **No** credential logging
- Manual credentials only in manual form state when fallback is used
- OAuth token handling from **A4** unchanged
- **A5C** (backend): connected manual credentials rejected — see above

**Reviews (A5B):** Supervisor Review **Pass with notes**; Security Review **PASS**. **`npm test`:** **289** pass; **`npm run lint`:** pass (2 pre-existing react-refresh warnings); **`npm run build`:** pass (chunk-size warning only).

**Not in A5B at ship (historical — A6 added board/list defaults later):**

- Trello card update/delete; force re-sync

**See:** `docs/security/trello-oauth-foundation.md`, `docs/workflows/trello-sync-workflow.md`, ADR [006](adrs/006-trello-oauth-encrypted-connections.md)

---

## Implemented — Trello OAuth backend stored-token mode (Phase TRELLO-OAUTH-A5A)

**Backend only** — additive, backward-compatible stored-token support on existing discovery/sync routes. Builds on **A2** encrypted storage, **A3** connect routes, and **A4-STATE** signed state. **Frontend connected-account UX shipped in A5B** (see above).

| Item | Detail |
|------|--------|
| Routes (unchanged paths) | **`POST /api/trello/boards`**, **`POST /api/trello/boards/:boardId/lists`**, **`POST /api/trello/sync`** — all **`requireAuth`** |
| **Stored mode** | Body has **no** `apiKey`/`token` keys → backend uses server **`TRELLO_API_KEY`** + decrypted token from **`trello_connections`** for `req.user.id` |
| **Manual mode** | Body has **both** `apiKey` and `token` keys → manual flow when **disconnected** only; **A5C** rejects when connection row exists |
| **Partial credentials** | Only one of `apiKey`/`token` present → **`VALIDATION_ERROR`** / **400** |
| **Not connected** | Stored mode requested but no connection row → **`TRELLO_NOT_CONNECTED`** / **400** |
| Sync stored body | `{ listId, taskIds }` strict — credential keys rejected |
| Boards/lists stored body | `{}` strict — extra fields rejected |
| Classification | `classifyTrelloCredentialMode` — key **presence**, not truthiness |
| Backend modules | **`trello-credentials.resolver.js`** (new); **`trello.schema.js`** (stored schemas + classifier); **`trello.controller.js`** (delegates to resolver); **`trello-connection.service.js`** (exports **`requireTrelloApiKey`** only) |
| Unchanged | **`trello.routes.js`**, **`trello.service.js`**, **`trello.client.js`**, **`trello-token-crypto.js`**, **`trello-connection.repository.js`** logic; no new dependencies; no frontend changes |

**Security (A5A — reviewed):**

- Stored token decrypted **backend-side only**; scoped to **`req.user.id`**
- **`service_role`** remains backend-only; frontend must not access **`trello_connections`**
- **No** token, ciphertext, iv, or tag in API responses
- **No** token in **`trello_sync_logs`**
- Manual credentials remain **ephemeral** — not stored in DB
- Manual override while connected was **A5A** compatibility — **closed by A5C** (see above)

**Reviews (A5A):** Supervisor Review **Approved** (after test-wiring fix); Security Review **PASS**. **`npm test`:** **442** pass; **`npm run lint`:** pass.

**Not in A5A at ship (historical — A6 added board/list defaults later):**

- Trello card update/delete; force re-sync

**Frontend connected-account sync:** shipped in **TRELLO-OAUTH-A5B** (see above).

**See:** `docs/security/trello-oauth-foundation.md`, `docs/workflows/trello-sync-workflow.md`, ADR [006](adrs/006-trello-oauth-encrypted-connections.md)

---

## Implemented — Trello OAuth frontend connect UI (Phase TRELLO-OAUTH-A4-FRONTEND)

**Frontend only** — Trello **account connection** UX on **`/trello`** and protected OAuth callback. Builds on **A2** encrypted storage, **A3** backend connect routes, and **A4-STATE** signed state validation. **A5A** added backend stored-token mode; **A5B** added connected-account sync UX (see above).

| Item | Detail |
|------|--------|
| **`/trello`** | `TrelloConnectionPanel` — connection status (`@trelloUsername` when connected); **Connect account** (`fetchTrelloAuthorizeUrl` → redirect); **Disconnect** (`disconnectTrello`); trust note when connected: boards/lists/sync use the connected Trello account; manual credential fields hidden until disconnected (**A5B**). **At A4-FRONTEND ship (historical):** trust note stated manual API key/token for sync below |
| Callback route | Protected **`/trello/connect/callback`** — `TrelloConnectCallbackPage` |
| Parse | `state` from **query string** only; Trello `token` from **URL hash fragment** only (not from query) |
| URL hygiene | `sanitizeOAuthCallbackUrl` clears query and hash via `history.replaceState` **before** any network request |
| Complete | `completeTrelloConnection({ token, state })` → `POST /api/trello/connect/complete` with strict JSON body only (not in URL path/query) |
| StrictMode | `beginOAuthExchange` dedupes in-flight exchange — at most one complete POST per callback load |
| Missing params | Missing `token` or `state` → safe redirect to **`/trello`** with error flash; **no** backend POST |
| State errors | `TRELLO_OAUTH_STATE_INVALID` → “Connection request expired or invalid. Please try again.” |
| Frontend CSRF | Frontend does **not** validate or sign `state` — relies on **A4-STATE** backend |
| Sync UX at A4 ship (historical) | `TrelloSyncSection`, board/list picker, manual apiKey/token fields, `syncTasksToTrello` — manual MVP flow only. **After A5B:** connected-account sync is primary when linked (`{}` / `{ listId, taskIds }`); manual fields hidden until disconnected — see **A5B** |

**Security (A4-FRONTEND — reviewed):**

- OAuth callback `token`/`state` are **not** stored in `localStorage`, `sessionStorage`, React state, or module-level variables (exchange guard holds promise only)
- `token`/`state`/hash/full callback URL are **not** logged or rendered in UI
- All Trello API calls from frontend go to **`/api/trello/*`** only — **no** direct `api.trello.com`

**Reviews (A4-FRONTEND):** Supervisor Review **Pass**; Security Review **Pass**. **`npm test`:** **271** pass; **`npm run lint`:** pass; **`npm run build`:** pass.

**Post-A4 status (at ship time / later shipped or still deferred):**

- **Shipped after A4:** backend stored-token mode (**A5A**); frontend connected-account sync (**A5B**); backend manual-credential hardening while connected (**A5C**)
- **Still deferred:** Trello card update/delete; force re-sync; single-use OAuth state nonce persistence

**Frontend connected-account sync:** shipped in **TRELLO-OAUTH-A5B** (see above).

**See:** `docs/security/trello-oauth-foundation.md`, `docs/workflows/trello-sync-workflow.md`, ADR [006](adrs/006-trello-oauth-encrypted-connections.md)

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
| `POST` | `/api/flashcards/:flashcardId/review` | Record review outcome — body: `{ outcome: "known" \| "unknown" }` strict (**FLASHCARD-REVIEW-A1**) |
| `PATCH` | `/api/flashcards/:flashcardId` | Update allowed fields only — **not** review state |
| `DELETE` | `/api/flashcards/:flashcardId` | Delete owned flashcard |

**Create (server-set, not in body):** `user_id` from JWT; `course_id` from route `:id`; `source` = `manual` (DB default/CHECK).

**List filters:** Wrong-owner or missing course → **`404`** “Course not found”. Wrong-owner, missing, or cross-course material → **`404`** “Study material not found”. Unfiltered list returns only rows for **`req.user.id`**.

**Bugfix (2026-05-29) — material-specific list filter:** **`GET /api/flashcards?courseId=&materialId=`** now works for valid owned course+material pairs (**200**; was **`500`** `DATABASE_ERROR` when PostgREST rejected the ownership query missing **`courses!inner`**). Ownership validation unchanged — enforced via material **`course_id`** and joined **`courses.user_id`**. **`materialId`** filter returns only flashcards linked to that material (excludes course-level / unlinked flashcards with **`material_id` null**). Course-only listing (**`?courseId=`** without **`materialId`**) still includes course-level flashcards. **No** frontend or API contract change.

**Responses:** camelCase; include `source`; include review fields **`mastery`**, **`lastReviewedAt`**, **`reviewCount`**, **`knownCount`**, **`unknownCount`** (**FLASHCARD-REVIEW-A1**); **do not** include `userId`. Wrong-owner/missing flashcard on PATCH/DELETE/review → **`404`** “Flashcard not found”.

**Validation (Zod):** Question 10–500; answer 10–2000; tags max 5 (each 1–50); strict bodies (reject `userId`, `courseId`, `source`, timestamps, review fields on create); update requires ≥1 allowed field and accepts **only** `question`, `answer`, `tags`, `materialId`; review body accepts **only** `{ outcome: "known" | "unknown" }` — rejects `mastery`, counters, `userId`, etc.

**Implementation files:** `backend/src/modules/flashcards/*`, `backend/src/shared/validation/flashcard.schema.js`, `backend/src/modules/courses/courses.routes.js` (create route), `backend/src/app.js` (mount `/api/flashcards`).

**Tests:** `backend/tests/integration/flashcards.test.js`, `backend/tests/unit/flashcards.service.test.js`, `backend/tests/helpers/mockSupabaseFlashcards.js`, `backend/tests/helpers/mockSupabaseStudyMaterials.js`. **`backend/package.json`** `npm test` script lists flashcards test files explicitly (**no** dependency or lockfile change). `cd backend && npm run lint` and `npm test` passed — **287** tests, **0** failures after **2026-05-29** material-filter bugfix (CI runs same script).

**Reviews:** Supervisor — approved with notes. Security Review — no blockers (initial **3B-c** and **2026-05-29** bugfix). Review endpoint added in **FLASHCARD-REVIEW-A1** — Supervisor **approved with notes**; Security Review **PASS WITH NOTES**; main CI **green**.

**Not in 3B-c (historical — review endpoint shipped in FLASHCARD-REVIEW-A1; frontend Known/Unknown in FLASHCARD-REVIEW-A2):** Frontend DB flashcards UI; frontend `/api/flashcards` client; global `/flashcards` page; import `plan.flashcards[]` into rows; pagination/rate limiting; wiring **3B-a** UI to DB rows. **Review persistence** shipped in **FLASHCARD-REVIEW-A1**; **Known/Unknown UI** shipped in **FLASHCARD-REVIEW-A2** — see below; **no** SRS.

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

## Implemented — Flashcard review state backend (Phase FLASHCARD-REVIEW-A1)

**Backend + database only** — aggregate review state on existing **`public.flashcards`** rows. **Not** full SRS. **No** frontend changes in this phase.

| Layer | What exists |
|-------|-------------|
| **Migration** | **`supabase/migrations/013_flashcard_review_state.sql`** — **applied successfully** on Supabase; adds **`mastery`** (`new` \| `learning` \| `known`, default **`new`**), **`last_reviewed_at`**, **`review_count`**, **`known_count`**, **`unknown_count`** with non-negative CHECK constraints; **no** **`next_review_at`**; **no** review history table; **no** new indexes; existing RLS row policies unchanged |
| **Backend API** | **`POST /api/flashcards/:flashcardId/review`** — **`requireAuth`**; body **`{ outcome: "known" \| "unknown" }`** strict (Zod); wrong-owner/missing flashcard → neutral **`404`** “Flashcard not found”; **`known`** sets **`mastery = "known"`**, increments **`review_count`** and **`known_count`**, sets **`last_reviewed_at`**; **`unknown`** sets **`mastery = "learning"`**, increments **`review_count`** and **`unknown_count`**, sets **`last_reviewed_at`** |
| **Bypass protection** | Create/PATCH schemas and **`updateFlashcard`** service whitelist **do not** accept review fields; review state changes **only** via **`POST /review`** |
| **Responses** | **`GET /api/flashcards`**, create, PATCH, and review return camelCase flashcard including **`mastery`**, **`lastReviewedAt`**, **`reviewCount`**, **`knownCount`**, **`unknownCount`**; **no** **`userId`** |

**Implementation files:** `supabase/migrations/013_flashcard_review_state.sql`, `backend/src/modules/flashcards/*`, `backend/src/shared/validation/flashcard.schema.js`, `backend/tests/integration/flashcards.test.js`, `backend/tests/unit/flashcards.service.test.js`, `backend/tests/helpers/mockSupabaseFlashcards.js`.

**Tests:** `cd backend && npm run lint` and `npm test` passed. Main CI **green**.

**Reviews:** Supervisor Review **approved with notes**. Security Review **PASS WITH NOTES** (non-atomic counter increment under concurrency accepted for A1 — optional SQL-side atomic increment deferred).

**Not in FLASHCARD-REVIEW-A1:** Frontend Known/Unknown buttons (shipped in **FLASHCARD-REVIEW-A2**); review-state filter UI (shipped in **FLASHCARD-REVIEW-A3**); full SRS scheduling; **`next_review_at`**; SM-2 / Anki; dashboard due cards; review history table; **`FLASHCARD-REVIEW-A4`** (not shipped — separate phase gate).

**Release order:** Migration **013** must be applied before deploying this backend revision against real Supabase (backend selects new columns on all flashcard queries).

---

## Implemented — Flashcard review Known/Unknown UI (Phase FLASHCARD-REVIEW-A2)

**Frontend-only** — Known / Unknown self-rating for **saved DB flashcards** only. Consumes **FLASHCARD-REVIEW-A1** **`POST /api/flashcards/:flashcardId/review`**. **Not** full SRS.

| Layer | What exists |
|-------|-------------|
| **Material detail** | **`DbFlashcardsSection`** passes DB **`id`**, **`mastery`**, **`reviewCount`** into **`FlashcardStudy`** with **`onReviewOutcome`**; **`StudyMaterialDetail`** merges reviewed card via **`onFlashcardUpdated`** into **`dbFlashcards`** by id (**no** **`loadDbFlashcards`** on successful review) |
| **Global `/flashcards`** | **`GlobalFlashcardsSection`** — same **`FlashcardStudy`** review wiring; **`setFlashcards`** map-merge by id on success (**no** **`loadFlashcards`** on successful review) |
| **Plan JSON** | **`GeneratedPlanSection`** — **`FlashcardStudy`** **without** **`onReviewOutcome`**; plan cards have **no** DB id / **no** review buttons / **no** review API |
| **UX gates** | Known/Unknown only when **`onReviewOutcome`**, answer revealed, and **`card.id`** present; buttons disabled while saving; user stays on same card; **no** auto-advance after review |
| **API client** | **`reviewFlashcard(flashcardId, { outcome: "known" \| "unknown" })`** in **`flashcards.service.js`** — Bearer JWT via existing **`request`** / **`apiFetch`** pattern only |
| **Position stability** | **`buildStudySetKey`** in **`flashcard-study.js`** — review metadata updates keep same deck key so **`currentIndex`** / reveal state are not reset |

**Implementation files:** `frontend/src/services/flashcards.service.js`, `frontend/src/utils/flashcard-study.js`, `frontend/src/components/materials/FlashcardStudy.jsx`, `frontend/src/components/materials/DbFlashcardsSection.jsx`, `frontend/src/components/flashcards/GlobalFlashcardsSection.jsx`, `frontend/src/pages/StudyMaterialDetail.jsx`, `frontend/tests/unit/flashcards.service.test.js`, `frontend/tests/unit/flashcard-study.test.js`, `frontend/tests/unit/flashcard-study-review.test.js`.

**Tests:** `cd frontend && npm run lint`, `npm test` (**337** pass), `npm run build` passed. Main CI **green**.

**Reviews:** Supervisor Review **approved with notes**. Security Review **not required** (frontend-only over existing authenticated backend endpoint).

**Not in FLASHCARD-REVIEW-A2:** Review-state filter (shipped in **FLASHCARD-REVIEW-A3**); full SRS scheduling; **`next_review_at`**; SM-2 / Anki; dashboard due cards (**FLASHCARD-REVIEW-A4** and related — not shipped); plan JSON review persistence; backend/database/migration changes; auto-advance after review.

---

## Implemented — Flashcard review-state filter (Phase FLASHCARD-REVIEW-A3)

**Frontend-only** — client-side review-state filter / simple review queue for **saved DB flashcards** already loaded from the API. Filters by aggregate **`mastery`** from **FLASHCARD-REVIEW-A1**. **Not** full SRS.

| Layer | What exists |
|-------|-------------|
| **Filter helper** | **`filterFlashcardsByReviewState(flashcards, reviewFilter)`** in **`flashcard-filters.js`** — **`all`** returns all cards; **`needs_review`** → **`new`** + **`learning`**; **`new`** / **`learning`** / **`known`** exact **`mastery`** match; unknown filter value returns all (defensive); empty or non-array input → **`[]`** |
| **Global `/flashcards`** | **`GlobalFlashcardsSection`** — **`reviewFilter`** state (default **`all`**); **`displayedFlashcards`** via helper; study deck and manage list use **`displayedFlashcards`**; **Review state** select (**All**, **New + Learning**, **New**, **Learning**, **Known**) composes with course/material filters; filtered-empty vs true-empty messaging |
| **Material detail** | **`DbFlashcardsSection`** — same **`reviewFilter`** / **`displayedFlashcards`** pattern in saved DB flashcards area only (plan JSON section unchanged) |
| **A2 preserved** | Known/Unknown unchanged — same **`POST /api/flashcards/:flashcardId/review`**; local merge by id; **no** refetch on review; **no** auto-advance |
| **Plan JSON** | **`GeneratedPlanSection`** — **no** review filter; **no** Known/Unknown; **no** review API |

**Implementation files:** `frontend/src/utils/flashcard-filters.js`, `frontend/src/components/flashcards/GlobalFlashcardsSection.jsx`, `frontend/src/components/materials/DbFlashcardsSection.jsx`, `frontend/tests/unit/flashcard-filters.test.js`, `frontend/tests/unit/flashcard-study-review.test.js`.

**Tests:** `cd frontend && npm run lint`, `npm test`, `npm run build` passed. Main CI **green**.

**Reviews:** Supervisor Review **approved with notes**. Security Review **not required** (frontend-only filter over already-loaded user-owned data).

**Not in FLASHCARD-REVIEW-A3:** Full SRS; **`next_review_at`**; SM-2 / Anki; due dates; dashboard due cards; review history table; backend **`GET /api/flashcards?mastery=`**; URL-persisted filters; sorting by **`lastReviewedAt`**; plan JSON review persistence; auto-advance after review; backend/database/migration changes (**FLASHCARD-REVIEW-A4** and related — not shipped).

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
| **PageHeader** | Intro-mode grid layout; narrow-viewport stack at small breakpoints; scoped lead/note spacing |
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

**Not in B3 (historical):** Charts; gamification; BX-I1 dark/glass; **B4** global rollout was **not started at B3** (**B4** partial as of **2026-06-02** — **B4-F3A** / **B4-F3B** / **B4-F3C** all **complete**; see **`CURRENT_STATE.md`**).

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

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with limitation** — authenticated dashboard manual smoke **not fully completed** (no approved valid local test account); follow-up authenticated visual QA required (dashboard with data, empty dashboard if possible, hero primary/secondary CTA navigation, refresh stats, study pulse / progress bars, **narrow responsive browser viewport ~375px**, console check for no token/secret/material-content logs).

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

**Known non-blocking notes:** **`components.css`** uses some hardcoded `rgba` AI border colors (acceptable for BX-I5; possible future cleanup); **`sourceTypeLabel`** appears in both **`PageHeader`** note and new source pill (acceptable redundancy); **narrow responsive browser viewport ~375px** visual QA not manually verified (no test account).

**Follow-up authenticated QA when a test account exists:** open material detail; edit/save material; verify unsaved state blocks generate; generate plan; clear active plan; restore from history; delete history item; import tasks; import flashcards; saved flashcards section/study; delete material danger zone; fake material UUID / not found; **narrow responsive browser viewport ~375px**; console check for no token/secret/full material content logs.

**Not in BX-I5:** backend/API/database/package/auth/routes/services changes; `tokens.css` changes; behavior or API payload changes; course accents on material detail; sidebar shell; chart UI; **BX-I6** / **B4** — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/pages/StudyMaterialDetail.jsx`, `frontend/src/components/materials/GeneratedPlanSection.jsx`, `frontend/src/components/materials/GeneratedPlanHistorySection.jsx`, `frontend/src/styles/layout.css`, `frontend/src/styles/components.css`.

---

## Implemented — Dashboard visual upgrade (Phase BX-I6B)

**Frontend/CSS/className-only** on protected **`/dashboard`** (`DashboardStub.jsx`) — AI Study Command Center **presentation** polish only; **no** backend, API, database, package, auth, routes, services, **`DashboardContext`**, **`dashboard.service.js`**, or **`dashboard-recommendation.js`** logic changes; **no** `tokens.css` changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/pages/DashboardStub.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/styles/components.css`** only — commit **`cceb4e0`** |
| **Presentation** | Flagship **“What should I study next?”** recommendation hero (existing **rule-based** copy from **`deriveDashboardRecommendation`**); glass/depth/glow using **existing** design tokens; Study pulse upgraded to cockpit data band with factual **Pending / Completed / Total** metrics from existing stats; course workload upgraded to richer command deck with improved stat chips; **At a glance** visually demoted as tertiary section |
| **Responsive** | **Narrow responsive browser viewport ~375px** — no mid-word course stat label breaks (`white-space: nowrap` on labels); no horizontal overflow; **not** mobile/native/app-store scope |
| **Motion** | `@media (prefers-reduced-motion: reduce)` disables decorative progress transitions and hero glow |
| **Safety** | **No** unsafe rendering — plain React text only; **no** new API calls or changed refresh/invalidation semantics |
| **Commit** | **`cceb4e0`** — `style: upgrade dashboard command center` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Supervisor re-check **approved with notes**; Security / Trust Review **approved with notes**.

**Manual authenticated dashboard smoke (passed):** populated **`/dashboard`**; recommendation hero readable and honest; **Refresh stats**; primary/secondary CTAs; course workload links; Study pulse readable; **At a glance** visually tertiary; **narrow responsive browser viewport ~375px** — no horizontal overflow, readable course stat labels; **no** fake AI confidence / urgency / priority / health copy observed.

**Honest data boundaries (not added):** **no** fake AI confidence; **no** fake urgency; **no** fake priority; **no** fake health score; **no** fake analytics; **no** “AI picked/ranked/certainty” claims; course accents remain supplementary chrome (**not** health/priority/status).

**Known non-blocking notes:** duplicate/orphaned JSDoc above **`PulseMetric`** in **`DashboardStub.jsx`**; **`dashboard-hero--flagship`** and **`dashboard-study-pulse--cockpit`** are semantic modifier hooks (most styling from base dashboard classes); contrast reviewed statically and via manual smoke — not lab-measured.

**Not in BX-I6B:** backend/API/database/package/auth/routes/services changes; **`dashboard-recommendation.js`** logic changes; **`DashboardContext`** / **`dashboard.service.js`** changes; `tokens.css` changes; chart libraries; sidebar shell; weekly focus chart; new packages; course/material page changes; AppShell/sidebar changes; **BX-I6C** / **BX-I6D** / **B4** — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/pages/DashboardStub.jsx`, `frontend/src/styles/layout.css`, `frontend/src/styles/components.css`.

---

## Implemented — Courses visual alignment (Phase BX-I6C)

**Frontend/CSS/className-only** on protected **`/courses`** and **`/courses/:id`** — courses / course workspace **presentation** polish only; **no** backend, API, database, package, auth, routes, services, `tokens.css`, dashboard, AppShell, or material cockpit changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/components/courses/CourseCard.jsx`**, **`frontend/src/components/materials/MaterialCard.jsx`**, **`frontend/src/pages/CoursesList.jsx`**, **`frontend/src/pages/CourseDetail.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/styles/components.css`** only — commit **`6a1e6ad`** |
| **`/courses`** | Polished **subject shelf** (`courses-shelf--deck`); semantic list **`ul > li > article`**; **`source-card--course-shelf`** on **`CourseCard`**; glass instrument create form; empty-state wrapper |
| **`/courses/:id`** | Subject workspace hierarchy; **Subject** pill under header using existing **`data-course-accent`** (chrome only); settings as secondary band; materials as primary glass workspace zone; **`document-shelf--deck`** + **`source-card--document-shelf`**; stronger tasks section framing; stronger danger-zone separation |
| **Material count subtitle** | Honest local UI — **`materials.length`** from already-loaded materials only; **no** new API call; shown only when `!materialsLoading && !materialsError && materials.length > 0`; otherwise **Document shelf** only; **not** health, progress, coverage, quality, priority, or AI analysis |
| **Responsive** | **Narrow responsive browser viewport ~375px** — no horizontal overflow; **not** mobile/native/app-store scope |
| **Motion** | `@media (prefers-reduced-motion: reduce)` disables hover `transform` on course/document shelf cards |
| **Safety** | **No** unsafe rendering — plain React text for titles; **no** full material body on course/material cards; **no** new API calls or changed auth/delete/create/material/task behavior |
| **Commit** | **`6a1e6ad`** — `style: align courses visual surfaces` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated smoke (passed with notes):** populated **`/courses`**; create form open; populated **`/courses/:id`**; materials count subtitle; material card navigation; tasks section; danger zone still clearly destructive; **narrow responsive browser viewport ~375px** — no horizontal overflow; **no** fake health/priority/urgency/status/AI copy observed. **`/courses` empty state not smoke-tested** (account has courses). Console audit not fully instrumented — code review and smoke found **no** new sensitive logging.

**Honest data boundaries (not added):** **no** fake course health; **no** fake priority; **no** fake urgency; **no** fake status labels; **no** AI course classification; **no** fake analytics or progress claims; course accents remain supplementary visual identity chrome (**not** status/health/priority).

**Known non-blocking notes:** `/courses` empty state not manually smoke-tested; empty-state double framing may be cosmetic follow-up; heading-level note pre-existing; console audit not fully instrumented.

**Not in BX-I6C:** backend/API/database/package/auth/routes/services changes; `tokens.css` changes; **`DashboardStub.jsx`** / **`dashboard-recommendation.js`** / **`DashboardContext`** changes; AppShell/sidebar changes; material detail cockpit changes; chart libraries; new packages; **BX-I6D** / **B4** — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/components/courses/CourseCard.jsx`, `frontend/src/components/materials/MaterialCard.jsx`, `frontend/src/pages/CoursesList.jsx`, `frontend/src/pages/CourseDetail.jsx`, `frontend/src/styles/layout.css`, `frontend/src/styles/components.css`.

---

## Implemented — Global shell chrome polish (Phase BX-I6D)

**CSS-only** — global **`AppShell`** top navigation / WEB dashboard **visual chrome** presentation on all protected routes; **no** `AppShell.jsx`, `App.jsx`, auth, route guard, backend, API, database, package, `tokens.css`, dashboard, course, or material page changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/layout.css`** only — commit **`9252ba9`** |
| **Shell bar** | Stronger glass WEB dashboard shell bar (gradient background, glass border, backdrop blur); restrained top accent strip (`::before` — decorative chrome only, **not** health/status semantics) |
| **Brand** | Improved hover/focus/hit area; **`:focus-visible`** ring |
| **Nav links** | Improved hover/active/**`:focus-visible`**; active route styling **not** color-only (weight, border, gradient fill, inset underline — navigation state only) |
| **Logout** | Remains visible, labeled **Log out**, lower visual priority than primary nav; top row beside brand at **narrow responsive browser viewport ~375px** |
| **Responsive (~375px)** | Two-row grid: brand + logout, then full-width nav with **horizontal scroll** — WEB top-nav row; **no** bottom tabs, drawer, hamburger-first layout, or phone-style UI; **no** page-level horizontal overflow observed in authenticated spot-check |
| **Motion** | `@media (prefers-reduced-motion: reduce)` disables shell brand/nav/logout transitions |
| **Safety** | **No** route fade, page transitions, content remounting, `useLocation` animation, or `key={location.pathname}`; **no** new nav items; **no** auth/logout behavior changes; **no** misleading AI/priority/urgency/health/status copy |
| **Commit** | **`9252ba9`** — `style: polish global shell chrome` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or confirmed Important issues.

**Manual authenticated smoke (passed with notes):** **`/dashboard`**, **`/courses`**, **`/courses/:id`** (Courses remains active), **`/study-materials/:id`**, **`/tasks`**, **`/flashcards`**, **`/trello`**, **`/admin`** (admin session); logout visible and labeled; **narrow responsive browser viewport ~375px** — nav items keyboard-reachable, off-screen items scroll into view, **no** page-level horizontal overflow; design reads as WEB dashboard / SaaS cockpit chrome; **no** token/session/user/course/material logs observed. **Authenticated 375px shell spot-check** **passed with notes**.

**Known non-blocking notes:** Flashcards focus may sit slightly near/past nav right edge before nav scroll catches up — approved as minor; optional future **`scroll-margin-inline`** polish only if needed.

**Not in BX-I6D:** `AppShell.jsx` / `App.jsx` changes; auth/logout behavior; route guards; route fade; page transitions; content remounting; `useLocation` / `key={location.pathname}`; `tokens.css` / `components.css` changes; dashboard/course/material page body changes; backend/API/database/package changes; sidebar; drawer; bottom tabs; hamburger-first layout; phone/native-style navigation; misleading AI/priority/urgency/health/status copy; **B4** / tasks-flashcards-Trello-admin page body polish — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/styles/layout.css`.

---

## Implemented — Global desktop cockpit shell widening (Phase BX-I7B)

**CSS/tokens only** — global desktop content width foundation; **no** JSX, components, pages, services, backend, API, auth, or routes; **no** per-page grid redesign.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/tokens.css`** and **`frontend/src/styles/layout.css`** only |
| **Tokens** | **`--content-max-cockpit`** and **`--content-max-shell`**: **1120px → 1280px**; **`--content-max-form`**, **`--content-max-workspace`**, **`--content-max-reading`** unchanged |
| **Alignment** | **`AppShell`** inner and **`page--cockpit`** routes stay aligned at the new cap |
| **Layout** | Desktop-only **`.page`** horizontal padding at **`min-width: 1280px`** |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** behavior preserved — **not** phone/native UI |
| **Out of scope** | Per-page grid/density (dashboard, tasks, course detail, material cockpit, etc.); fake metrics; sidebar; mobile/native patterns |
| **Commit** | **`00d3255`** — `style: widen desktop cockpit shell` (**2026-06-02**) |
| **Checks** | `npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; **no** Critical or Important code blockers.

**Manual authenticated visual smoke:** **Limited / not fully completed** — authenticated wide-desktop + **375px** spot-check remains **recommended**.

**Foundation only:** Does **not** fully solve Stitch/design gap; **BX-I7** per-route desktop density is **complete** through **BX-I7F** — UI improved but **not** claimed as final Stitch-perfect product. Likely follow-ups: optional **BX-I7D Tier 2** and **BX-I7E3 Tier B** — each **not automatic**.

**Implementation files:** `frontend/src/styles/tokens.css`, `frontend/src/styles/layout.css`.

---

## Implemented — Dashboard desktop grid expansion (Phase BX-I7C)

**CSS-only** — dashboard desktop grid at wide browser viewports; **no** JSX, API, backend, database, service, context, recommendation logic, or copy changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/layout.css`** only |
| **Breakpoint** | **`@media (min-width: 1280px)`** |
| **Activation** | **`.page--dashboard.dashboard-workspace:has(.dashboard-hero)`** — loading/error-only states **not** forced into grid |
| **Layout** | **PageHeader** **`grid-column: 1 / -1`**; **dashboard-hero** column 1 + **dashboard-study-pulse** column 2 side-by-side; hero spans full width when study pulse absent; **dashboard-courses** / **dashboard-secondary** full width below |
| **Course list** | **`.page--dashboard .dashboard-course-list`** → **`display: grid`** with **`repeat(2, minmax(0, 1fr))`** |
| **DOM** | Reading/focus order unchanged — **no** CSS **`order`** reordering |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | **`DashboardStub.jsx`**; **`dashboard.service.js`**; **`DashboardContext`**; **`dashboard-recommendation.js`**; API/backend/database/auth/routes; fake metrics; charts; sidebar; mobile/native UI |
| **Commit** | **`583922d`** — `style: expand dashboard desktop grid` (**2026-06-02**) |
| **Checks** | `npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated visual smoke:** **Not completed** at gate — authenticated dashboard visual smoke **recommended before merge** (`:has()` graceful fallback = stacked layout on unsupported browsers; **`.dashboard-course-list`** selector breadth accepted as low risk).

**Density only:** Improves Dashboard desktop density — does **not** complete full Stitch-level UI or solve all desktop layout gaps.

**Implementation files:** `frontend/src/styles/layout.css`.

---

## Implemented — Courses / course detail desktop shelf expansion (Phase BX-I7D Tier 1)

**CSS-only** — courses/course detail desktop shelf grids at wide browser viewports; **no** JSX, component, API, backend, database, service, context, recommendation logic, or copy changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/layout.css`** only |
| **Breakpoint** | **`@media (min-width: 1280px)`** |
| **`/courses`** | **`.page--courses .courses-shelf--deck .courses-shelf__list`** → **`grid-template-columns: repeat(3, minmax(0, 1fr))`**; **`display: grid`** from existing **768px** rule (cascade) |
| **`/courses/:id`** | **`.page--course-detail .document-shelf--deck`** → **`display: grid`** with **`repeat(2, minmax(0, 1fr))`** when populated materials shelf renders |
| **Activation** | Success-body shelves only — page loading/error/empty on **`/courses`**; material loading/error/empty on **`/courses/:id`** **not** grid targets |
| **Tasks / settings / danger** | Tasks section remains **below** materials — **unchanged**; settings form, create material form, danger zone **unchanged** |
| **DOM / a11y** | Reading/focus order unchanged — **no** CSS **`order`**; **no** **`grid-template-areas`** visual reorder |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Tier 2 not shipped** | **No** **`.course-workspace`** full-page grid; **no** materials \| tasks side-by-side; **no** **`CourseCard`** / **`MaterialCard`** / **`CourseTasksSection`** / **`StudyMaterialForm`** changes |
| **Out of scope** | **`CoursesList.jsx`**, **`CourseDetail.jsx`**, API/backend/database/service/context/recommendation/copy; fake metrics; charts; sidebar; mobile/native UI |
| **Commit** | **`52c68ab`** — `style: expand courses desktop shelves` (**2026-06-02**) |
| **Checks** | `npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated visual smoke:** **Not completed** at gate — authenticated visual smoke for **`/courses`** and **`/courses/:id`** at wide desktop + **narrow responsive browser viewport ~375px** **recommended before merge** if not yet done.

**Density only:** Improves Courses/Course Detail desktop density — does **not** complete full Stitch-level UI or solve all desktop layout gaps. **Tier 2** side-by-side workspace **not implemented**.

**Implementation files:** `frontend/src/styles/layout.css`.

---

## Implemented — Tasks desktop panels (Phase BX-I7E1)

**CSS-only** — **`/tasks`** desktop panel expansion at wide browser viewports; **no** JSX, component, API, backend, database, service, context, or copy changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`TaskCard.jsx`** changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — selectors scoped under **`.page--tasks`** |
| **Command controls** | Horizontal desktop band: **`.task-workspace__command-controls`** row layout; filters use available width; toolbar / Add study task aligns right when space allows |
| **Populated list** | **2-column** desktop grid on **`.task-workspace__list`** when list exists (`:has(.task-workspace__list)`) |
| **Create form** | Create task **FormCard** remains full-width/readable — outside list grid |
| **Inline edit** | Edit row spans full width via **`:has(.task-workspace__edit-card)`** + **`grid-column: 1 / -1`** |
| **State surfaces** | Loading/error/empty/filter-empty remain full-width/unaffected |
| **DOM / a11y** | Reading/focus order unchanged — **no** CSS **`order`**; **no** **`grid-template-areas`** visual reorder |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Flashcards, Trello, Admin; API/backend/database/service/context/copy; fake metrics; charts; sidebar; mobile/native UI |
| **Commit** | **`d0db43e`** — `style: expand tasks desktop panels` (**2026-06-02**) |
| **Checks** | `npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated visual smoke:** Populated list, filter-empty, create form, and responsive widths **completed**; inline edit **not** visually smoke-tested (no pending task); loading/error **not** triggered; console audit **not** run — inline edit and console smoke **recommended before merge** if not yet done.

**Density only:** Improves **`/tasks`** desktop density — does **not** complete full Stitch-level UI or solve all desktop layout gaps.

**Implementation files:** `frontend/src/styles/layout.css`.

---

## Implemented — Material cockpit desktop pass (Phase BX-I7F)

**CSS-only** — **`/study-materials/:materialId`** desktop cockpit/library expansion at wide browser viewports; **no** JSX, component, API, backend, database, service, auth, AI behavior, or logging/content-exposure changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`StudyMaterialDetail.jsx`**, **`DbFlashcardsSection.jsx`**, **`GeneratedPlanHistorySection.jsx`**, services, or backend changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — selectors scoped under **`.page--material-detail`** |
| **Cockpit ratio** | Success-body cockpit **Source \| AI** → **minmax(0, 1.15fr) \| minmax(0, 0.85fr)** via **`:has(.material-workspace__cockpit)`** on **`.page--material-detail.material-workspace`** |
| **AI action rows** | **plan-history__actions** and **plan-import-toolbar__actions** → horizontal flex with wrap; buttons not forced full-width at **≥1280px** on material detail |
| **Material library** | **study \| manage** **2-column** grid on **`.flashcard-library--material:has(.flashcard-library__study)`** inside **`.material-workspace__library`**; status/loading/error/empty/create paths full-width |
| **Manage list** | **2-column** grid when **`.flashcard-library__list`** present; edit/create items span full width (**`:has(form)`**) |
| **State surfaces** | Page loading/error/not-found and library loading/error/empty unaffected when layout gates do not match |
| **Plan history** | List remains single-column; preview panel / lazy preview behavior unchanged |
| **Trust** | Manage list truncated questions only — **no** answer exposure in list; **no** material content / full plan / token logging added |
| **`/flashcards`** | **Unaffected** |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | **`/flashcards`**; fake metrics; charts; sidebar; JSX/API/backend; AI generate/import/save/history behavior changes |
| **Commit** | **`25988dc`** — `style: complete material cockpit desktop pass` (**2026-06-03**) |
| **Checks** | Prior gate: Security / Trust Review **PASS**; implementation **`layout.css`** only |

**Reviews:** Security / Trust Review **PASS** (prior BX-I7F gate — documentation records outcome).

**Manual authenticated visual smoke:** **Recommended before merge** if not yet done (optional — does **not** block commit).

**Density only:** Improves **`/study-materials/:materialId`** desktop density — does **not** complete full Stitch-level UI.

**Implementation files:** `frontend/src/styles/layout.css`.

---

## Implemented — AI command surfaces polish (Phase BX-I8B)

**CSS-only** — material-detail AI command column violet/glass polish on **`/study-materials/:materialId`**; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or content-exposure changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only — **no** JSX, **`tokens.css`**, API, services, backend, auth, or routes changes |
| **Route** | **`/study-materials/:materialId`** — AI command column only (**`.material-workspace__cockpit-ai`**) |
| **Surfaces** | Generate panel (**`.ai-panel`**), active loading lane (**`.ai-panel__loading--active`**), plan output (**`.plan-output`** / **`.form-card--plan`**), plan history, import toolbar/bands, cockpit AI shell |
| **Visual** | Stronger violet/glass treatment — gradients, frosted **`backdrop-filter`**, restrained **`--glow-ai`**, violet borders; **Generate** CTA remains electric blue / primary (**`.btn--primary`**) |
| **Layout** | **375px** stacked layout preserved; **BX-I7F** material cockpit desktop layout (**1.15fr \| 0.85fr** at **≥1280px**) preserved |
| **Motion** | **`prefers-reduced-motion`** disables decorative **`backdrop-filter`** on cockpit AI surfaces |
| **Trust** | **No** fake metrics, charts, scores, sidebar, or mobile-native UI; **no** material content / plan JSON / token logging added |
| **Behavior** | Generate / import / save / history / flashcards library behavior unchanged; **`/flashcards`** unaffected |
| **Commit** | **`bda2645`** — `style: polish ai command surfaces` (**2026-06-03**) |
| **Checks** | Prior gate: Security / Trust Review **PASS**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed |

**Reviews:** Security / Trust Review **PASS** (prior BX-I8B gate — documentation records outcome).

**Manual authenticated visual smoke:** **Recommended before merge** if not yet done (optional — does **not** block commit).

**Polish only:** Improves material-detail AI command surface presentation — does **not** complete full Stitch-level UI.

**Likely follow-ups (not automatic):** token/radius alignment phase; optional AI Generate gradient phase; optional **flashcard-study** glass polish; optional Stitch visual guide artifact documentation — each requires separate planning + explicit approval.

**Implementation files:** `frontend/src/styles/components.css`, `frontend/src/styles/layout.css`.

---

## Implemented — Auth + PageHeader intro chrome (Phase BX-I8C)

**CSS-only** — glass/command-center polish on auth form cards and intro page headers; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or content-exposure changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only — **no** **`tokens.css`**, **`base.css`**, JSX, API, services, backend, auth, or routes changes |
| **Auth** | **`/`** and **`/register`** — **`.page--auth .form-card`**: glass gradient surface, primary top accent, frosted **`backdrop-filter`**; **`.auth-brand`** gradient bar + soft glow (**`auth-brand::before`** / **`auth-brand::after`**); **`.auth-footer`** border uses **`--color-glass-border`** (auth forms only) |
| **PageHeader intro** | Routes using **`PageHeader`** with **`intro`** — **`.page-header--intro`**: glass intro band, top gradient rule (**`::before`**), **`elevation-1`**; non-intro **`.page-header`** unchanged |
| **Course accent** | **`.page--course-detail[data-course-accent] .page-header--intro`** — inset accent bar preserved; adds **`elevation-1`** alongside existing accent shadow |
| **Layout** | **375px** stacked layout preserved (**`max-width: 640px`** intro padding tweak); **BX-I7** desktop grids and **BX-I8B** material AI cockpit layout preserved |
| **Motion** | **`prefers-reduced-motion`** disables **`backdrop-filter`** on auth card + intro header; hides **`.auth-brand::after`** glow |
| **Trust** | **No** fake metrics, charts, scores, sidebar, or mobile-native UI; **no** token/session/user logging added |
| **Behavior** | Auth validation, redirects, routes, copy, and error handling unchanged |
| **Commit** | **`8008dc1`** — `style: polish auth and page header chrome` (**2026-06-03**) |
| **Checks** | Prior gate: Security / Trust Review **PASS**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed |

**Reviews:** Security / Trust Review **PASS** (prior BX-I8C gate — documentation records outcome).

**Manual smoke:** Focus-visible clipping smoke on intro header action buttons **recommended but not blocking**; optional authenticated visual smoke on auth + intro routes before merge.

**Polish only:** Improves auth and intro header presentation — does **not** complete full Stitch-level UI.

**Likely follow-ups (not automatic):** token/radius alignment phase; optional AI Generate gradient phase; optional **flashcard-study** glass polish — each requires separate planning + explicit approval.

**Implementation files:** `frontend/src/styles/components.css`, `frontend/src/styles/layout.css`.

---

## Implemented — Radius token alignment (Phase BX-I9B1)

**CSS-only** — Stitch Round Eight radius tokens in **`tokens.css`**; primary control radius in **`components.css`**; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or color-token changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/tokens.css`** + **`frontend/src/styles/components.css`** only — **no** **`layout.css`**, **`base.css`**, JSX, API, services, backend, auth, or routes changes |
| **Radius tokens** | **`--radius-sm`**: **8px** (was 6px); **`--radius-md`**: **12px** (was 10px); comment documents Stitch Round Eight intent |
| **Unchanged tokens** | **`--radius-lg`**: **14px**; **`--radius-xl`**: **18px**; **no** color, shadow, spacing, or typography token changes |
| **`.btn` / `.link-btn`** | **`border-radius: var(--radius-md)`** (was **`--radius-sm`**) |
| **Fields** | **`.field__input`**, **`.field__textarea`**, **`.field__select`** remain **`var(--radius-sm)`** — fields stay visually tighter than buttons/cards |
| **Indirect cascade** | Pills, badges, cards, and **`layout.css`** consumers using **`var(--radius-sm)`** / **`var(--radius-md)`** pick up new values without selector edits — **expected** |
| **Out of scope** | AI Generate gradient; **flashcard-study** glass polish; color token work (canvas/shell subset later shipped as **BX-I9B2a**); width/padding/breakpoint changes |
| **Layout** | **375px** stacked layout preserved — no padding/margin/size/breakpoint edits in this diff |
| **Trust** | **No** fake metrics, charts, scores, sidebar, or mobile-native UI; presentation-only |
| **Commit** | **`9ec2917`** — `style: align radius tokens with stitch guide` (**2026-06-03**) |
| **Checks** | Prior gate: Security / Trust Review **PASS**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed |

**Reviews:** Security / Trust Review **PASS** (prior BX-I9B1 gate — documentation records outcome).

**Manual smoke:** Authenticated visual smoke (buttons, link-buttons, fields, pills, cards at **375px** / **≥1280px**) **recommended before merge** — **not blocking**.

**Polish only:** Aligns radius scale with Stitch Round Eight — does **not** complete full Stitch-level UI or remaining color work (**BX-I9B2a** canvas/shell and **BX-I9B2b** primary/cyan shipped separately; **BX-I9B2c**–**BX-I9B2d** **not started**).

**Likely follow-ups (at BX-I9B1 time, not automatic):** color token alignment (later split into **BX-I9B2a**–**BX-I9B2d**); optional AI Generate gradient; optional **flashcard-study** glass polish.

**Implementation files:** `frontend/src/styles/tokens.css`, `frontend/src/styles/components.css`.

---

## Implemented — Canvas/shell color token alignment (Phase BX-I9B2a)

**CSS-only** — Stitch v2.2 canvas/shell environment color tokens in **`tokens.css`** only; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or radius/accent-token changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/tokens.css`** only — **no** **`components.css`**, **`layout.css`**, **`base.css`**, JSX, API, services, backend, auth, routes, or package changes |
| **Canvas & shell tokens** | **`--color-bg`**: **`#0F172A`**; **`--color-bg-subtle`**: **`#1a2332`** (harmonized); **`--color-bg-auth`**: gradient harmonized (**`#0f172a`** → **`#0b0f1a`** → **`#1a2332`**); **`--color-shell-bg`**: **`rgba(11, 15, 26, 0.82)`** (toward **`#0B0F1A`**, translucency preserved); **`--color-shell-border`**: **`rgba(51, 65, 85, 0.65)`** (slightly softened) |
| **Unchanged tokens** | **`--radius-*`**; primary/AI/cyan/danger/focus/glow/shadow; glass **surface** / **text** / **editor** / **chart** / **course-accent** tokens — **no** changes |
| **Indirect cascade** | Existing **`layout.css`** consumers of **`var(--color-bg)`**, **`var(--color-bg-subtle)`**, **`var(--color-bg-auth)`**, **`var(--color-shell-bg)`** pick up new values without selector edits — **expected** |
| **Out of scope** | **BX-I9B2b** primary/cyan color work; **BX-I9B2c** / **BX-I9B2d**; AI Generate gradient; **flashcard-study** glass polish; glass/elevation pass; width/padding/breakpoint changes |
| **Layout** | **375px** stacked layout preserved — no padding/margin/size/breakpoint edits in this diff |
| **Trust** | **No** fake metrics, charts, scores, sidebar, or mobile-native UI; presentation-only |
| **Commit** | **`f92cbda`** — `style: align canvas and shell tokens with stitch guide` (**2026-06-03**) |
| **Checks** | Supervisor Review **PASS**; Security / Trust Review **PASS**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed |

**Reviews:** Supervisor Review **PASS**; Security / Trust Review **PASS** (BX-I9B2a gate — documentation records outcome).

**Manual smoke:** Authenticated visual smoke (auth canvas gradient, shell bar brand/nav/active/**`:focus-visible`** at **375px** / **≥1280px**) **recommended before merge** — **not blocking**.

**Polish only:** Aligns canvas/shell environment with Stitch v2.2 — does **not** complete full Stitch-level UI or **BX-I9B2c**–**BX-I9B2d** color work (**BX-I9B2b** primary/cyan shipped separately at **`b4d7b93`**).

**Likely follow-ups (not automatic):** **BX-I9B2b** primary/cyan color token alignment — **now complete** at **`b4d7b93`**; **BX-I9B2c** / **BX-I9B2d** (**not started**); optional AI Generate gradient phase; optional **flashcard-study** glass polish — each requires separate planning + explicit approval.

**Implementation files:** `frontend/src/styles/tokens.css`.

---

## Implemented — Primary/cyan color token alignment (Phase BX-I9B2b)

**CSS-only** — Stitch v2.2 primary blue + cyan/data color tokens in **`tokens.css`** only; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or canvas/shell/radius/AI/violet/danger changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/tokens.css`** only — **no** **`components.css`**, **`layout.css`**, **`base.css`**, JSX, API, services, backend, auth, routes, or package changes |
| **Primary family** | **`--color-primary`**: **`#3B82F6`**; **`--color-primary-hover`**: **`#2563EB`**; **`--color-primary-subtle`**: **`rgba(59, 130, 246, 0.12)`**; **`--color-primary-border`**: **`rgba(59, 130, 246, 0.35)`** |
| **Filled controls** | **`--color-primary-fill`**: **`#2563EB`**; **`--color-primary-fill-hover`**: **`#1D4ED8`** — **not** **`#3B82F6`** (WCAG AA white label contrast on **`.btn--primary`** / **`.link-btn--primary`**) |
| **Focus / glow** | **`--color-focus-ring`**: **`var(--color-primary)`** (unchanged ref); **`--shadow-focus`** / **`--shadow-focus-subtle`** / **`--shadow-focus-field`** / **`--glow-primary`**: re-based to **rgb(59, 130, 246)** |
| **Cyan / data / chart** | **`--color-data-accent`**: **`#06B6D4`**; **`--color-chart-series-1`**: **`#06B6D4`**; **`--color-chart-series-2`**: **`#3B82F6`**; **`--color-chart-fill`**: **`rgba(6, 182, 212, 0.5)`** |
| **Unchanged tokens** | **`--radius-*`**; canvas/shell (**BX-I9B2a**); AI/violet; danger/error/success/warning; surface/text/editor; course-accent; admin; **`--glow-ai`**; **`--color-chart-series-3`**; **`--color-chart-track`** |
| **Indirect cascade** | Existing **`layout.css`** / **`components.css`** / **`base.css`** consumers of **`var(--color-primary*)`**, **`var(--color-data-accent)`**, chart vars, focus/glow pick up new values without selector edits — **expected** |
| **Out of scope** | **BX-I9B2c** AI/violet color work; **BX-I9B2d**; AI Generate gradient; **flashcard-study** glass polish; glass/elevation pass; link-contrast fixes on glass cards (follow-up QA only) |
| **Layout** | **375px** stacked layout preserved — no padding/margin/size/breakpoint edits in this diff |
| **Trust** | **No** fake metrics, charts, scores, sidebar, or mobile-native UI; presentation-only |
| **Commit** | **`b4d7b93`** — `style: align primary and cyan tokens with stitch guide` (**2026-06-03**) |
| **Checks** | Supervisor Review **PASS**; Security / Trust Review **PASS**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed |

**Reviews:** Supervisor Review **PASS**; Security / Trust Review **PASS** (BX-I9B2b gate — documentation records outcome).

**Manual smoke:** Authenticated visual smoke **recommended before merge** — **not blocking** — especially: primary links on glass/card surfaces; dashboard hero cyan eyebrow; shell/nav/field **`:focus-visible`** at **375px** / **≥1280px**; primary filled buttons; **/study-materials/:id** Generate CTA remains blue (AI column violet unchanged).

**Known QA notes (non-blocking):** Primary text links on glass surfaces (~**#1e293b**) may be slightly weaker than pre-**BX-I9B2b**; hero eyebrow contrast depends on layered hero gradient — verify visually.

**Polish only:** Aligns primary/cyan with Stitch v2.2 — does **not** complete full Stitch-level UI or **BX-I9B2c**–**BX-I9B2d** color work.

**Likely follow-ups (not automatic):** **BX-I9B2d** danger/error color token alignment — **now complete** at **`ae5cfc8`**; optional AI Generate gradient; optional **flashcard-study** glass polish — each requires separate planning + explicit approval.

**Implementation files:** `frontend/src/styles/tokens.css`.

---

## Implemented — AI/violet color token alignment (Phase BX-I9B2c)

**CSS-only** — Stitch v2.2 AI Accent **`#8B5CF6`** in **`tokens.css`** plus mechanical hardcoded lavender sweep in **`components.css`** and **`layout.css`**; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or primary/cyan/danger/radius/canvas/shell changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/tokens.css`**, **`frontend/src/styles/components.css`**, **`frontend/src/styles/layout.css`** only — **no** **`base.css`**, JSX, API, services, backend, auth, routes, or package changes |
| **AI accent tokens** | **`--color-ai-accent`**: **`#8b5cf6`**; **`--color-ai-surface`**: **`rgba(139, 92, 246, 0.1)`**; **`--color-ai-gradient-end`**: **`rgba(139, 92, 246, 0.22)`**; **`--color-ai-gradient-end-soft`**: **`rgba(139, 92, 246, 0.14)`**; **`--color-ai-gradient-end-faint`**: **`rgba(139, 92, 246, 0.08)`** |
| **Glow** | **`--glow-ai`**: **`0 0 15px rgba(139, 92, 246, 0.2)`** |
| **Mechanical sweep** | **`components.css`**: **20** replacements **`rgba(208, 188, 255, α)` → `rgba(139, 92, 246, α)`**; **`layout.css`**: **3** replacements — alpha values **preserved** |
| **Stale lavender check** | **`rg "208,\s*188,\s*255|#d0bcff" frontend/src/styles`** — **no matches** |
| **Unchanged** | **`--radius-*`**; canvas/shell (**BX-I9B2a**); primary/cyan/focus/glow-primary (**BX-I9B2b**); danger/error/success/warning; surface/text/editor; course-accent; admin; chart track/series-3 |
| **Selectors / layout** | **No** selector, layout, spacing, motion, or border-width changes — color values only |
| **Generate CTA** | **`.btn--primary`** / primary fill tokens **unchanged** — **Generate** remains electric blue / primary |
| **Indirect cascade** | AI column / AI chrome using **`var(--color-ai-*)`**, **`var(--color-ai-accent)`**, and **`var(--glow-ai)`** pick up new violet family — **expected** |
| **Out of scope** | **BX-I9B2d** danger/error color work; AI Generate gradient; **flashcard-study** glass polish; glass/elevation pass |
| **Layout** | **375px** stacked layout preserved — no padding/margin/size/breakpoint edits in this diff |
| **Trust** | **No** fake metrics, charts, scores, sidebar, or mobile-native UI; presentation-only |
| **Commit** | **`19d444e`** — `style: align AI violet tokens with stitch guide` (**2026-06-03**) |
| **Checks** | Supervisor Review **PASS**; Security / Trust Review **PASS**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed |

**Reviews:** Supervisor Review **PASS**; Security / Trust Review **PASS** (BX-I9B2c gate — documentation records outcome).

**Manual smoke:** Authenticated visual smoke **recommended before merge** — **not blocking** — especially: material AI cockpit at **375px** and **≥1280px**; dashboard hero violet tint; **AppShell** accent strip; auth brand gradient; **/study-materials/:id** **Generate** CTA remains blue.

**Polish only:** Aligns AI/violet with Stitch v2.2 — does **not** complete full Stitch-level UI or **BX-I9B2d** color work.

**Likely follow-ups (not automatic):** optional AI Generate gradient; optional **flashcard-study** glass polish; final visual QA / smoke pass — each requires separate planning + explicit approval.

**Implementation files:** `frontend/src/styles/tokens.css`, `frontend/src/styles/components.css`, `frontend/src/styles/layout.css`.

---

## Implemented — Danger/error color token alignment (Phase BX-I9B2d)

**CSS-only** — Stitch v2.2 Error / Rose Red **`#E11D48`** danger/error family in **`tokens.css`** only; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or canvas/shell/primary/cyan/AI/radius changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/tokens.css`** only — **no** **`components.css`**, **`layout.css`**, **`base.css`**, JSX, API, services, backend, auth, routes, or package changes |
| **Danger tokens** | **`--color-danger`**: **`#e11d48`**; **`--color-danger-hover`**: **`#be123c`**; **`--color-danger-fill`**: **`#be123c`** (**not** **`#e11d48`** — WCAG AA white labels on **`.btn--danger`** / **`.link-btn--danger`**); **`--color-danger-fill-hover`**: **`#9f1239`**; **`--color-danger-subtle`**: **`rgba(225, 29, 72, 0.12)`**; **`--color-danger-border`**: **`rgba(251, 113, 133, 0.35)`** |
| **Error token** | **`--color-error`**: **`#fda4af`** (**not** **`#e11d48`** — readable error copy on dark glass via **`.field__error`**, **`.alert--error`**, etc.) |
| **Course rose** | **`--color-course-accent-rose`** and rose subtle/border tokens **unchanged** (**`#fb7185`**) |
| **Unchanged** | **`--radius-*`**; canvas/shell (**BX-I9B2a**); primary/cyan/focus/glow-primary (**BX-I9B2b**); AI/violet (**BX-I9B2c**); success/warning; surface/text/editor; chart; admin |
| **Stale red check** | **`rg -i "f2555a|d63a3f|d94449|c93237|ffb4ab|242,\s*85,\s*90|255,\s*180,\s*171" frontend/src/styles`** — **no matches** |
| **Indirect cascade** | Existing **`var(--color-danger*)`** / **`var(--color-error)`** consumers in **`components.css`** / **`layout.css`** pick up new values — **expected** (no component file edits in this phase) |
| **Out of scope** | AI Generate gradient; **flashcard-study** glass polish; glass/elevation pass; course rose border deduplication |
| **Layout** | **375px** stacked layout preserved — no padding/margin/size/breakpoint edits |
| **Trust** | **No** fake metrics, charts, scores, sidebar, or mobile-native UI; presentation-only token alignment |
| **Commit** | **`ae5cfc8`** — `style: align danger and error tokens with stitch guide` (**2026-06-03**) |
| **Checks** | Supervisor Review **PASS**; Security / Trust Review **PASS**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed |

**Reviews:** Supervisor Review **PASS**; Security / Trust Review **PASS** (BX-I9B2d gate — documentation records outcome).

**Known QA notes (non-blocking):** **`--color-danger-border`** and **`--color-course-accent-rose-border`** both use **`rgba(251, 113, 133, 0.35)`** — visually verify danger/error UI next to course rose accents; spot-check delete buttons, **`.alert--error`**, **`.field__error`**, Trello failed rows.

**Manual smoke:** Merge-time visual QA **recommended** — **not blocking** — especially: destructive buttons with white text; error text on dark glass; danger bordered alerts vs rose course chrome side-by-side.

**Polish only:** Aligns danger/error with Stitch v2.2 — completes **BX-I9B2** color token sub-sequence (**BX-I9B2a**–**BX-I9B2d**); does **not** complete full Stitch-level UI.

**Likely follow-ups (not automatic):** optional AI Generate gradient; optional **flashcard-study** glass polish; optional glass/elevation pass — each requires separate planning + explicit approval. **Final visual QA** completed in **BX-I9C** / **BX-I9C-Auth** (**Pass with notes**).

**Implementation files:** `frontend/src/styles/tokens.css`.

---

## Implemented — Flashcard study glass polish (Phase BX-I10A1)

**CSS-only** — frosted glass study stage for **`.flashcard-study`**; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or token changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/components.css`** only — **no** **`layout.css`**, **`tokens.css`**, **`base.css`**, JSX, API, services, backend, auth, routes, or package changes |
| **Study surface** | **`.flashcard-study`** — centered stage (`max-width: min(100%, 42rem)`, `margin-inline: auto`); frosted gradient background; **`--color-glass-border`**; **`backdrop-filter`** blur; inset highlight; **`elevation-1`** shadow |
| **Q/A hierarchy** | Larger question/answer type on study card; **`.flashcard-study__label`** badges; inner card gradient + glass border (replaces dashed neutral well); improved header/counter typography |
| **Variants** | **`.flashcard-study--library`** (saved DB / global filtered study) verified in smoke; **`.flashcard-study--plan`** CSS preserved (violet left accent, AI-tinted gradient) — **not** live-verified in smoke (no generated plan with flashcards on QA material) |
| **Behavior unchanged** | **`FlashcardStudy`** — reveal toggle, **Previous** / **Next** (when `total > 1`), **Card N of M** counter, plain-text question/answer rendering only |
| **Regression held** | **Generate study plan** remains **`btn btn--primary`** (primary blue); material **Source \| AI** cockpit side-by-side at desktop; **no** horizontal overflow on smoked routes |
| **Commit** | **`e62c1b0`** — `style: polish flashcard study glass surface` (**2026-06-03**) |
| **Checks** | **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed |

**Reviews:** Supervisor Review **Approve — safe to commit**. Security / Trust Review **Pass**.

**Manual smoke (BX-I10A1-SMOKE):** Logged-in on Vite dev **`http://localhost:5173`** (**not** `vite preview`). **Verdict:** **Pass with notes**. Routes: **`/flashcards`**, **`/study-materials/4a9e66e1-b2e2-4235-bcb8-0d64dd9acf1b`** (BX-I9C QA material). Viewports: **~375px**, **1280px**. **Show answer** works; counter readable; saved library study variant correct; **no** console errors or token/password/full material/full plan logs observed. **Non-blocking:** **`flashcard-study--plan`** variant not exercised — optional separate QA after generating a plan with flashcards.

**Polish only:** Improves flashcard study presentation — does **not** complete full Stitch-level UI. Material **Generate** CTA gradient shipped separately in **BX-I10A2** (commit **`b90108e`**).

**Likely follow-ups (not automatic):** optional plan-variant flashcard smoke after plan generate — each requires separate planning + explicit approval.

**Implementation files:** `frontend/src/styles/components.css`.

---

## Implemented — Material-only AI Generate gradient (Phase BX-I10A2)

**CSS-only** — scoped violet→blue gradient on material **Generate study plan** CTA; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or token changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/components.css`** only — **no** **`layout.css`**, **`tokens.css`**, **`base.css`**, JSX, API, services, backend, auth, routes, or package changes |
| **Selector** | **`.page--material-detail .material-workspace__cockpit-ai .material-workspace__generate .ai-panel__actions .btn.btn--primary`** (+ `:hover:not(:disabled)`, `:focus-visible`) |
| **Gradient** | Restrained violet→blue **`linear-gradient(135deg, #7c3aed → #6d28d9 → #2563eb)`**; white label (**`--color-on-primary`**) |
| **Global primary unchanged** | Base **`.btn--primary`** remains **`--color-primary-fill`** standard blue |
| **Regression held** | **Save changes**, auth submit, dashboard, flashcards **Show answer**, Trello sync, task/flashcard create buttons remain standard blue; material **Source \| AI** cockpit layout unchanged |
| **Behavior unchanged** | Generate handler, loading/disabled logic, API flow, and copy **unchanged** |
| **Commit** | **`b90108e`** — `style: add AI gradient to material generate CTA` (**2026-06-03**) |
| **Checks** | **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed |

**Reviews:** Supervisor Review **Approve with notes**. Security / Trust Review **Pass with notes**.

**Manual smoke (BX-I10A2-SMOKE):** Logged-in on Vite dev **`http://localhost:5173`** (**not** `vite preview`). **Verdict:** **Pass with notes**. Routes: **`/study-materials/4a9e66e1-b2e2-4235-bcb8-0d64dd9acf1b`** (BX-I9C QA material) at **~375px** / **1280px**; spot checks **`/dashboard`**, **`/`**, **`/register`**, **`/flashcards`**, **`/trello`**. **Verified:** Generate CTA violet→blue gradient only in AI generate panel; readable white text; **no** horizontal overflow; **Source \| AI** side-by-side at **1280px**, stacked at **375px**; other primary buttons standard blue; **no** console errors or token/password/full material/full plan logs. **Non-blocking:** Generate loading state not live-triggered; plan history/import primary buttons not visible (no saved plan); expected **`GET .../generated-plan`** **404** handled as empty state. Working tree after smoke **clean**.

**Polish only:** Improves material Generate CTA distinction — does **not** complete full Stitch-level UI, filter-toolbar unification, accent rails, or glass/elevation pass.

**Likely follow-ups (not automatic):** **BX-I10A5** glass/elevation pass; optional plan-variant flashcard smoke — each requires separate planning + explicit approval.

**Implementation files:** `frontend/src/styles/components.css`.

---

## Implemented — Targeted glass/elevation pass (Phase BX-I10A5)

**CSS-only** — restrained glass/elevation polish on navigable cards, quiet inline workspace panels, and scoped optional surfaces; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or token changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only — **no** **`tokens.css`**, **`base.css`**, JSX, API, services, backend, auth, routes, package, or docs changes during implementation |
| **Navigable card hover** | **`.source-card--navigable`** and related dashboard/course/document shelf hovers — **`--elevation-2` → `--elevation-1`**; **`translateY(-1px)` removed** / **`transform: none`**; border-color hover retained; task cards remain no-lift |
| **Quiet inline glass panels** | Surface gradient (**`--color-surface-raised` → `--color-surface`**), **`--color-glass-border`**, **`elevation-1`**, inset highlight, optional **`backdrop-filter: blur(var(--blur-glass))`** on: tasks create/edit **`.form-card`**; flashcards library/create; Trello wizard step cards, **`.trello-sync__submit`**, results step; course settings/create-material **`.form-card`**; course materials empty **`.empty-state`** (dashed glass border) |
| **Optional scoped additions** | **`.trello-task-list__label`** subtle glass polish (selected state **`.trello-task-list__label--selected`** unchanged); **`.focus-workspace__session-panel.focus-panel`** outer shell softened — timer surface/actions unchanged |
| **Reduced motion** | **`prefers-reduced-motion: reduce`** disables new glass-panel **`backdrop-filter`**; navigable-card hover **`transform: none`** reinforced |
| **Regression held** | **BX-I10A1** **`.flashcard-study*`** unchanged; **BX-I10A2** material Generate gradient unchanged; **BX-I10A3** **`.filter-toolbar*`** / filter-empty unchanged; **BX-I10A4** course/document accent rails unchanged; dashboard hero unchanged; material AI cockpit unchanged; material editor/library elevation **not** changed |
| **Trust** | Quiet glass uses surface tokens — **no** danger/error palette on normal panels; **no** AI/violet styling on non-AI panels; panels do **not** imply disabled/error state |
| **Commit** | **`38aa561`** — `style: refine glass elevation surfaces` (**2026-06-03**) |
| **Checks** | **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed |

**Reviews:** Supervisor Review **Pass with notes**. Security / Trust Review **Pass with notes**.

**Manual smoke (BX-I10A5-SMOKE):** Logged-in on Vite dev **`http://localhost:5173`** (**not** `vite preview`). **Verdict:** **Pass with notes**. Viewports: **~375px**, **1280px** — **narrow responsive browser viewport**, **not** native mobile. Routes: **`/dashboard`**, **`/courses`**, **`/courses/d8d8c474-7bf1-4d1c-8819-e95d79ed9fe3`**, **`/tasks`**, **`/flashcards`**, **`/trello`**, **`/focus/1efeb385-149a-4233-a6c2-f571ae99baef`**, **`/study-materials/4a9e66e1-b2e2-4235-bcb8-0d64dd9acf1b`** (spot check). **Verified:** softer navigable-card elevation; quiet glass on inline workspace panels; Trello picker readable with clear selected state; Focus session panel readable with timer/actions unchanged; **BX-I10A1**–**BX-I10A4** + dashboard hero + material cockpit + Generate gradient regressions held; material editor elevation unchanged; **no** horizontal overflow; **no** token/password/full material/full plan logs observed in UI. **Non-blocking:** materials empty dashed state not reachable (QA course had one material); real pointer hover not fully exercised by MCP; full DevTools console history limited — **no** visible runtime failures observed. Working tree after smoke **clean**.

**Polish only:** Improves glass/elevation consistency — does **not** complete full Stitch-level UI, material editor/library elevation alignment, or global shadow/token rewrite.

**Likely follow-ups (not automatic):** optional material editor/library elevation alignment; optional global shadow/token cleanup only if explicitly approved; optional top-nav narrow viewport shell polish only if separately approved; **ROADMAP-A1** background automations + AWS architecture planning — each requires separate planning + explicit approval. (**BX-I10A6-QA** Trello failed-row live verification **complete** — **Pass with notes**, **no** fix phase required.)

**Implementation files:** `frontend/src/styles/components.css`, `frontend/src/styles/layout.css`.

---

## QA complete — Trello failed-row live verification (Phase BX-I10A6-QA)

**Review only** — **no** repository file changes during QA.

| Aspect | Detail |
|--------|--------|
| **Scope** | Post-**BX-I9B2d** danger/error tokens + **BX-I10A5** glass/elevation pass — live failed sync row verification on Vite dev **`http://localhost:5173`** |
| **Verdict** | **Pass with notes** |
| **Route** | **`/trello`** only |
| **Viewports** | **~375px**, **1280px** — **narrow responsive browser viewport**, **not** native mobile |
| **Failed row** | Triggered live via harmless fake Trello API key/token + **Sync to Trello** submit; placeholder list ID set via one-time runtime **`onListChange`** workaround (real Trello credentials out of scope for QA); **no** real credentials; **no** Trello cards created |
| **Backend** | Expected handled failure — **HTTP 401**, **`TRELLO_AUTH`**, structured **`trello_api_error`** log only (**no** API key/token/payload dumps) |
| **UI verified** | Step 5 **Sync results** renders failed row; **FAILED** badge and error text readable; left accent / badge / error use danger/error tokens (**`--color-error`** / danger subtle) — **not** course rose (**`#fb7185`**); success stat chip remains green and distinct; results/failed item **no** horizontal overflow at **~375px** |
| **Trello regressions** | Command deck glass intact; picker rows readable; selected picker state clear (primary blue); **Sync to Trello** remains standard primary blue; credential fields **`type="password"`**, values cleared after sync; **no** credentials in visible DOM text |
| **Non-blocking** | List ID runtime workaround; top-nav internal horizontal scroll at **~375px** (pre-existing **BX-I6D** shell — unrelated to failed-row styling); full frontend console history not captured retroactively — **no** UI-visible runtime failures observed |
| **Recommendation** | Close **BX-I10A6-QA** — **no** separate fix phase required |

**Implementation files:** none (QA phase only).

---

## QA complete — Logged-in visual smoke after BX-I10A5 (Phase BX-I10A5-SMOKE)

**Review only** — **no** repository file changes during smoke.

| Aspect | Detail |
|--------|--------|
| **Scope** | Post-**BX-I10A5** (commit **`38aa561`**) logged-in responsive browser visual smoke on **`http://localhost:5173`** |
| **Verdict** | **Pass with notes** |
| **Routes** | **`/dashboard`**, **`/courses`**, **`/courses/:id`**, **`/tasks`**, **`/flashcards`**, **`/trello`**, **`/focus/:taskId`**, **`/study-materials/:id`** (spot check) |
| **Viewports** | **~375px**, **1280px** — **narrow responsive browser viewport**, **not** native mobile |
| **Verified** | Softer navigable-card hover; quiet inline glass panels; Trello picker + Focus panel notes; protected-area regressions held; **no** horizontal overflow |
| **Non-blocking** | Materials empty dashed state not reachable; pointer hover not fully MCP-verified; MCP console export limited |
| **Console / logging** | **No** visible runtime failures; **no** sensitive logs observed in UI |

**Implementation files:** none (QA phase only).

---

## Implemented — Course/document accent rail consistency (Phase BX-I10A4)

**CSS-only** — aligned course identity rails and muted document hints on course-related surfaces; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or token changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only — **no** **`tokens.css`**, **`base.css`**, JSX, API, services, backend, auth, routes, package, or docs changes during implementation |
| **Course identity rails** | **6px** left rail on **`.source-card--subject`**, **`.page--courses .source-card--course-shelf`**, and related course identity surfaces; dashboard course workload cards inherit **6px** accent rail; dashboard **`.source-card__stat`** accent **3px** |
| **Course detail framing** | **`.page--course-detail[data-course-accent] .page-header--intro`** inset accent **3px → 4px**; **`.course-workspace__materials--primary`** top rule **3px → 4px** (lighter than **6px** course card rails) |
| **Document shelf hint** | **`.page--course-detail[data-course-accent] .source-card--document-shelf`** — **3px** left rail with muted **`color-mix(in srgb, var(--course-accent-border) 55%, var(--color-border-strong))`**; hover restores full **`--course-accent-border`**; document/material cards read as secondary to course identity (**muted pill**, thinner rail) |
| **Trust** | Course identity uses **`--course-accent-*`** tokens only — **no** **`--color-danger*`** / **`--color-error`** on normal course rails; danger zone / **`.btn--danger`** unchanged |
| **Regression held** | **BX-I10A1** flashcard study glass unchanged; **BX-I10A2** material Generate gradient unchanged; **BX-I10A3** filter-toolbar glass unchanged; material AI cockpit / **Source \| AI** layout unchanged |
| **Not touched** | **`StudyMaterialDetail.jsx`**; material detail course accent JSX wiring (optional future phase) |
| **Commit** | **`7e5e61f`** — `style: align course and document accent rails` (**2026-06-03**) |
| **Checks** | **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed |

**Reviews:** Supervisor Review **Approve with notes**. Security / Trust Review **Pass with notes**.

**Manual smoke (BX-I10A4-SMOKE):** Logged-in on Vite dev **`http://localhost:5173`** (**not** `vite preview`). **Verdict:** **Pass with notes**. Viewports: **~375px**, **1280px** — **narrow responsive browser viewport**, **not** native mobile. Routes: **`/courses`**, **`/dashboard`**, **`/courses/d8d8c474-7bf1-4d1c-8819-e95d79ed9fe3`** (BX-I9C QA course, emerald accent), **`/study-materials/4a9e66e1-b2e2-4235-bcb8-0d64dd9acf1b`** (spot check), **`/flashcards`** (spot check). **Verified:** **6px** course identity rails clear but not overpowering; document shelf **~3px** muted hint; materials **4px** top rule lighter than course rails; course accents distinct from danger zone (**Delete course** destructive fill unchanged); **BX-I10A3** segmented filter toolbar unchanged; **BX-I10A2** Generate violet→blue gradient; **BX-I10A1** flashcard study glass surface; material **Source \| AI** two-column grid at **1280px**; **no** horizontal overflow on checked routes. **Non-blocking:** rose accent not in QA seed (rose-vs-danger not visually exercised); document-shelf pointer hover not fully verified in automation; full DevTools console export limited — **no** visible runtime failures; **no** token/password/full material/full plan logs observed in UI. Working tree after smoke **clean**.

**Polish only:** Improves course/document accent hierarchy — does **not** complete full Stitch-level UI or glass/elevation pass.

**Likely follow-ups (not automatic):** optional material detail course accent JSX — each requires separate planning + explicit approval. (**BX-I10A5** glass/elevation pass **complete** at **`38aa561`**; **BX-I10A6-QA** Trello failed-row verification **complete** — **Pass with notes**.)

**Implementation files:** `frontend/src/styles/components.css`, `frontend/src/styles/layout.css`.

---

## QA complete — Logged-in visual smoke after BX-I10A4 (Phase BX-I10A4-SMOKE)

**Review only** — **no** repository file changes during smoke.

| Aspect | Detail |
|--------|--------|
| **Scope** | Post-**BX-I10A4** (commit **`7e5e61f`**) logged-in visual smoke on **`http://localhost:5173`** |
| **Verdict** | **Pass with notes** |
| **Routes** | **`/courses`**, **`/dashboard`**, **`/courses/:id`** (BX-I9C QA course); **`/study-materials/:id`** (spot check); **`/flashcards`** (spot check) |
| **Viewports** | **~375px**, **1280px** — **narrow responsive browser viewport**, **not** native mobile |
| **Verified** | Course rails **6px**; document hint subtler than course rails; danger zone clearly destructive; regressions held for **BX-I10A1**–**BX-I10A3** and material cockpit; **no** horizontal overflow |
| **Non-blocking** | Rose accent not in QA seed; document-shelf hover not pointer-verified; MCP console export limited |
| **Console / logging** | **No** visible runtime failures; **no** sensitive logs observed in UI |

**Implementation files:** none (QA phase only).

---

## Implemented — Filter-toolbar / command-surface glass unification (Phase BX-I10A3)

**CSS-only** — unified glass/inset filter-toolbar and quiet filter-empty strips; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or token changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`components.css`**, **`tokens.css`**, **`base.css`**, JSX, API, services, backend, auth, routes, or package changes |
| **Global toolbar** | **`.filter-toolbar`** — gradient surface (**`--color-surface-raised`** → **`--color-surface`**), **`--color-glass-border`**, **`elevation-1`**, **`backdrop-filter`** blur; **`min-width: 0`** |
| **Segmented tracks** | **`.filter-toolbar--segmented .filter-toolbar__segment`** — restrained inset glass gradient rail, inset highlight, glass border; primary/secondary/hover/focus-visible button rules preserved |
| **Page inheritance** | **`/tasks`**, **`/flashcards`**, **`/courses/:id`** filter surfaces inherit shared **`.filter-toolbar`** glass (removed duplicate page-local toolbar backgrounds) |
| **Filter-empty strips** | Scoped quiet glass (**dashed** **`--color-glass-border`**, muted text, soft gradient): **`.page--tasks .task-workspace__filter-empty`**, **`.page--flashcards .flashcards-workspace__filter-empty`**, **`.page--course-detail .course-workspace__tasks-filter-empty`** — **not** a global **`.section__meta`** rewrite |
| **Empty-state downgrades** | Removed tasks/flashcards **`.empty-state`** background/border overrides so true empty states use global **`.empty-state`** (distinct from filter-empty) |
| **Reduced motion** | **`prefers-reduced-motion: reduce`** disables **`backdrop-filter`** on filter toolbars |
| **Behavior unchanged** | Filter/search/task status logic, **`aria-pressed`** segmented buttons, course/material **`<select>`** filters — unchanged |
| **Regression held** | **BX-I10A1** flashcard study glass (**`components.css`**) unchanged; **BX-I10A2** material Generate gradient unchanged; material AI cockpit / **Source \| AI** layout unchanged |
| **Commit** | **`cb54ec5`** — `style: unify filter toolbar glass surfaces` (**2026-06-03**) |
| **Checks** | **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed |

**Reviews:** Supervisor Review **Approve with notes**. Security / Trust Review **Pass with notes**.

**Manual smoke (BX-I10A3-SMOKE):** Logged-in on Vite dev **`http://localhost:5173`** (**not** `vite preview`). **Verdict:** **Pass with notes**. Routes: **`/tasks`**, **`/flashcards`**, **`/courses/d8d8c474-7bf1-4d1c-8819-e95d79ed9fe3`** (BX-I9C QA course) at **~375px** / **1280px**; spot check **`/study-materials/4a9e66e1-b2e2-4235-bcb8-0d64dd9acf1b`**. **Verified:** course/status filters readable; selected filter state clear (primary segment); filter-empty **“No completed tasks.”** on tasks and course detail; segmented inset glass on course tasks; materials area unchanged; course accents not confused with danger zone; **no** document horizontal overflow; **BX-I10A1** study surface present; **BX-I10A2** Generate violet→blue gradient; material **Source \| AI** two-column grid at **1280px**; **no** token/password/full material/full plan logs in UI. **Non-blocking:** **`/flashcards`** filter-empty not reachable (1 QA card always shown); true empty state not reachable with current QA seed; full browser console export limited by MCP — no visible runtime failures observed. Working tree after smoke **clean**.

**Polish only:** Improves filter/command-surface visual consistency — does **not** complete full Stitch-level UI, accent rails, or glass/elevation pass.

**Likely follow-ups (not automatic):** **BX-I10A5** glass/elevation pass; **BX-I10A6-QA** Trello failed-row live verification — each requires separate planning + explicit approval. (**BX-I10A4** accent rails **complete** at **`7e5e61f`**.)

**Implementation files:** `frontend/src/styles/layout.css`.

---

## QA complete — Logged-in visual smoke after BX-I10A3 (Phase BX-I10A3-SMOKE)

**Review only** — **no** repository file changes during smoke.

| Aspect | Detail |
|--------|--------|
| **Scope** | Post-**BX-I10A3** (commit **`cb54ec5`**) logged-in visual smoke on **`http://localhost:5173`** |
| **Verdict** | **Pass with notes** |
| **Routes** | **`/tasks`**, **`/flashcards`**, **`/courses/:id`** (BX-I9C QA course); **`/study-materials/:id`** (spot check) |
| **Viewports** | **~375px**, **1280px** — **narrow responsive browser viewport**, **not** native mobile |
| **Verified** | Glass filter toolbars readable; selected filter clear; filter-empty neutral (not danger); materials + AI cockpit regressions held; **no** horizontal overflow |
| **Non-blocking** | Flashcards filter-empty and true empty state not reachable with QA seed; MCP console export limited |
| **Console / logging** | **No** visible runtime failures; **no** sensitive logs observed in UI |

**Implementation files:** none (QA phase only).

---

## QA complete — Logged-in visual smoke after BX-I10A2 (Phase BX-I10A2-SMOKE)

**Review only** — **no** repository file changes during smoke.

| Aspect | Detail |
|--------|--------|
| **Scope** | Post-**BX-I10A2** (commit **`b90108e`**) logged-in visual smoke on **`http://localhost:5173`** |
| **Verdict** | **Pass with notes** |
| **Routes** | **`/study-materials/:id`** (primary); **`/dashboard`**, **`/`**, **`/register`**, **`/flashcards`**, **`/trello`** (spot checks) |
| **Viewports** | **~375px**, **1280px** on material detail |
| **Verified** | Generate gradient scoped to material AI panel only; Save and other primaries standard blue; **no** horizontal overflow; desktop **Source \| AI** layout held |
| **Non-blocking** | Generate loading not live-triggered; plan history/import buttons not visible on QA material; expected generated-plan **404** as empty state |
| **Console / logging** | **No** errors or sensitive logs observed during session |

**Implementation files:** none (QA phase only).

---

## QA complete — Logged-in visual smoke after BX-I10A1 (Phase BX-I10A1-SMOKE)

**Review only** — **no** repository file changes during smoke.

| Aspect | Detail |
|--------|--------|
| **Scope** | Post-**BX-I10A1** (commit **`e62c1b0`**) logged-in visual smoke on **`http://localhost:5173`** |
| **Verdict** | **Pass with notes** |
| **Routes** | **`/flashcards`** (saved library + study filtered cards); **`/study-materials/:id`** (study saved cards) |
| **Viewports** | **~375px**, **1280px** |
| **Verified** | Study surface centered/readable; Q/A hierarchy; **Show answer**; counter readable; **no** horizontal overflow; **Generate** primary blue; material **Source \| AI** desktop layout |
| **Non-blocking** | **`flashcard-study--plan`** not live-verified (no plan with flashcards on QA material); **Previous** / **Next** not shown with single-card deck (expected) |
| **Console / logging** | **No** errors or sensitive logs observed during session |

**Implementation files:** none (QA phase only).

---

## QA complete — Final visual smoke after BX-I9B token alignment (Phase BX-I9C + BX-I9C-Auth)

**Review only** — **no** repository file changes during either audit. Validates cumulative **BX-I9B1** radius + **BX-I9B2a**–**BX-I9B2d** color alignment on the live Vite dev app.

| Aspect | Detail |
|--------|--------|
| **Scope** | **BX-I9C** — initial pass on auth routes + unauthenticated redirects; **BX-I9C-Auth** — full authenticated matrix on **`http://localhost:5173`** (Vite dev). **Do not** use **`vite preview`** at **`127.0.0.1:4173`** for QA — API login failed there (likely CORS / `FRONTEND_URL` origin mismatch) |
| **Verdict** | **Pass with notes** — **no** critical issues; **no** blocking important issues |
| **Viewports** | **~375px**, **1280px**, **1440px** on checked routes |
| **Routes verified** | **`/`**, **`/register`**; **`/dashboard`**; **`/courses`**; **`/courses/:id`**; **`/study-materials/:id`**; **`/tasks`**; **`/flashcards`**; **`/trello`** (**partial** — workspace OK; failed sync rows **not exercised**); **`/focus/:taskId`**; **`/admin`** as student (**forbidden** state) |
| **Verified (held)** | Radius (**8px** inputs, **12px** buttons/cards, larger hero/cockpit shells); canvas/shell balanced; primary/cyan readable (dashboard cyan eyebrow, primary CTAs, glass-surface links); AI/violet cohesive; danger/error readable (alerts, danger zone, high-priority pills, delete buttons white-on-fill); material **Source \| AI** side-by-side at **1280px**/**1440px**, stacked at **375px** without horizontal overflow; **Generate** CTA primary blue; course accents distinct from danger/error (e.g. emerald accent on QA course) |
| **Console / logging** | **No** console errors observed during authenticated session; **no** token/secret/password/full material/full plan JSON logging observed |
| **Non-blocking notes** | Trello failed rows not live-tested; keyboard/**`:focus-visible`** automation limited (CSS defines field/button focus) |
| **Runtime test data** | Created during **BX-I9C-Auth** in Supabase/runtime only — **not** repo content: **`bx-i9c-auth-20260603@example.test`**, course **BX-I9C QA Course**, material **BX-I9C QA Material**, task **BX-I9C QA Task** |
| **Out of scope** | **Not** claimed final Stitch-perfect; **no** AI Generate gradient; **no** flashcard-study polish; **no** glass/elevation pass; **no** sidebar/charts/fake metrics |

**Reviews:** Documentation gate **DOCS-BX-I9C** records audit outcomes only.

**Polish only:** Confirms **BX-I9B** token alignment holds in the live UI — does **not** implement new visual phases.

**Likely follow-ups (not automatic):** AI Generate gradient; **flashcard-study** glass polish; glass/elevation pass; optional Trello failed-row check after controlled sync — each requires separate planning + explicit approval.

**Implementation files:** none (QA phases only).

---

## Implemented — Shared controls / card surface alignment (Phase BX-I8E)

**CSS-only** — conservative shared primitive alignment in **`components.css`**; **no** JSX, component, API, backend, database, service, auth, behavior, copy, logging, or content-exposure changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/components.css`** only — **no** **`layout.css`**, **`tokens.css`**, **`base.css`**, JSX, API, services, backend, auth, or routes changes |
| **`.form-card` baseline** | Subtle raised gradient surface + **`--color-glass-border`**; **`.form-card--ai`** / **`.form-card--plan`** overrides preserved; page-specific rules in **`layout.css`** (e.g. **`.page--auth .form-card`**) still apply |
| **`.source-card` baseline** | Border token **`--color-glass-border`** only — background/padding/hover variants unchanged |
| **`.link-btn` parity** | **`--primary`** / **`--danger`** variants mirror **`.btn--*`** (unused in JSX until adopted); **`--secondary:hover:not(.link-btn--disabled)`**; **`--disabled`** adds **`transform: none`** |
| **`.alert--success`** | Visual parity with **`.alert--error`** (gradient, left accent, **`elevation-1`**) — success semantics unchanged; **`RegisterForm`** **`role="status"`** unchanged |
| **Optional scope not shipped** | **No** **`dashboard-empty-cta__link`**; **no** empty/status block unification; **no** command-band / hero / AI cockpit / auth PageHeader / **BX-I7** grid edits |
| **Style guide** | Visual Style Guide v2.2 alignment check **passed** — safe to continue; token/radius/font/AI-gradient gaps **deferred** |
| **Layout** | **375px** stacked layout preserved — no padding/margin/size changes in this diff |
| **Trust** | **No** fake metrics, charts, scores, sidebar, or mobile-native UI; **no** new data exposure or misleading verification chrome |
| **Commit** | **`52b7b78`** — `style: align shared controls and card surfaces` (**2026-06-03**) |
| **Checks** | Prior gate: Security / Trust Review **PASS**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed |

**Reviews:** Security / Trust Review **PASS** (prior BX-I8E gate — documentation records outcome).

**Manual smoke:** Authenticated visual smoke (generic **FormCard**, **source-card** shelf, register success alert, disabled **link-btn** at **375px** / **≥1280px**) **recommended before merge** — **not blocking**.

**Polish only:** Aligns shared controls and card baselines — does **not** complete full Stitch-level UI or deferred token/radius work.

**Likely follow-ups (not automatic):** token/radius alignment phase; optional AI Generate gradient phase; optional **flashcard-study** glass polish; optional Stitch visual guide artifact documentation — each requires separate planning + explicit approval.

**Implementation files:** `frontend/src/styles/components.css`.

---

## Implemented — Motion micro-pass (Phase BX-I8D)

**CSS-only** — scoped processing pulse and one-shot success/preview/focus entrances; **no** JSX, component, API, backend, database, service, auth, behavior, copy, or **`aria-live`** changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/components.css`** + **`frontend/src/styles/base.css`** only — **no** **`layout.css`**, **`tokens.css`**, JSX, API, services, backend, auth, or routes changes |
| **Processing pulse** | **`processing-label-pulse`** on **`.ai-panel__loading--active .loading`** only — real AI generate lane when **`generating`** renders Processing Lane; **not** idle; spinner still uses existing **`loading-spin`** on **`::before`** |
| **One-shot entrances** | **`plan-fade-in`** on **`.plan-panel__status--success`**, **`.plan-history__preview-panel`**, **`.focus-done`** (250ms / 200ms) — no infinite loop |
| **Reduced motion** | **`prefers-reduced-motion`** disables pulse and entrance animations; **`base.css`** neutralizes **`:active`** / **`:hover`** transforms on **`.btn`**, **`.link-btn`**, **`.source-card--navigable`**, **`.dashboard-empty-cta__link`** |
| **Layout** | **375px** stacked layout preserved; **BX-I7** / **BX-I8B** / **BX-I8C** layouts preserved |
| **Trust** | **No** fake idle AI thinking, fake metrics/charts/scores, or aggressive idle decorative infinite animation; **no** route transitions, **`App.jsx`**, **`useLocation`**, or new JS timers/state/classes |
| **Behavior** | Generate, plan load, history preview, focus complete, and **`LoadingState`** copy/**`aria-live`** unchanged |
| **Commit** | **`51cdc77`** — `style: motion micro-pass for processing and success states` (**2026-06-03**) |
| **Checks** | Prior gate: Security / Trust Review **PASS**; **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed |

**Reviews:** Security / Trust Review **PASS** (prior BX-I8D gate — documentation records outcome).

**Manual smoke:** Authenticated visual smoke (generate pulse, success banner, history preview, focus complete, reduce motion) **recommended before merge** — **not blocking**.

**Polish only:** Improves motion feedback on real processing and success paths — does **not** complete full Stitch-level UI.

**Likely follow-ups (not automatic):** token/radius alignment phase; optional AI Generate gradient phase; optional **flashcard-study** glass polish — each requires separate planning + explicit approval.

**Implementation files:** `frontend/src/styles/components.css`, `frontend/src/styles/base.css`.

---

## Implemented — Admin desktop stats panels (Phase BX-I7E4)

**CSS-only** — **`/admin`** desktop stats deck expansion at wide browser viewports; **no** JSX, component, API, backend, database, service, auth, or copy changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`AdminDashboardPage.jsx`**, **`AdminRoute.jsx`**, **`admin.service.js`**, or backend changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — selectors scoped under **`.page--admin-dashboard`** |
| **Stats deck grid** | **`.admin-workspace__stats-deck`** → **2-column** grid with **`gap: var(--space-4)`**, **`align-items: start`**, **`min-width: 0`** |
| **Full-width bands** | **`.dashboard-band--admin-overview`**, **`.dashboard-band--trello-today`**, **`.dashboard-band--health`** → **`grid-column: 1 / -1`** |
| **Side-by-side rows** | Tasks|Focus and Learning|Trello **`.admin-workspace__stats-row`** blocks sit as adjacent grid cells |
| **Inner stat grids** | **`.admin-workspace__stats`** unchanged — existing auto-fill minmax grids preserved |
| **State surfaces** | Loading/error/forbidden/**`AdminRoute`** unaffected — selectors target success-body deck only |
| **Trust** | All stats remain API-backed; backend status remains honest **`stats.systemHealth.backend`** only — **no** fake metrics, charts, health scores, new KPIs, or monitoring chrome |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Material cockpit; JSX/API/backend/services/auth/copy; fake metrics; charts; sidebar; mobile/native UI |
| **Commit** | **`467ccd9`** — `style: expand admin desktop stats deck grid` (**2026-06-03**) |
| **Checks** | `npm run lint`, `npm test`, `npm run build` passed |

**Reviews:** Supervisor Review **approved**; Security / Trust Review **approved** — **no** Critical or Important issues.

**Manual authenticated visual smoke:** **Not live-tested** during gate — structural/CSS review only; authenticated visual smoke at **≥1280px** and **375px** **recommended before merge** if not yet done (optional — does **not** block commit).

**Density only:** Improves **`/admin`** desktop stats deck density — does **not** complete full Stitch-level UI or solve all desktop layout gaps.

**Implementation files:** `frontend/src/styles/layout.css`.

---

## Implemented — Trello desktop setup panels Tier A (Phase BX-I7E3 Tier A)

**CSS-only** — **`/trello`** desktop setup panel expansion at wide browser viewports; **no** JSX, component, API, backend, database, service, context, or copy changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`TrelloSyncPage.jsx`**, **`TrelloSyncSection.jsx`**, **`components/trello/*`**, **`trello.service.js`**, or backend changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — selectors scoped under **`.page--trello`** |
| **Wizard flow grid** | **`.trello-workspace__flow`** → **2-column** grid with **`gap: var(--space-4)`**, **`align-items: start`**, **`min-width: 0`** |
| **Steps 1–2** | **`.trello-workspace__step--credentials`** + **`.trello-workspace__step--destination`** side-by-side |
| **Steps 3–4 + messages** | **`.trello-workspace__step--tasks`**, **`.trello-sync__messages`**, **`.trello-workspace__step--sync`**, **`.trello-sync__submit`** → full-width (`grid-column: 1 / -1`) |
| **Results** | **`.trello-workspace__results-zone`** stays below **`.trello-workspace__command-band`** — not in wizard grid |
| **Step order** | DOM order unchanged: credentials → destination → tasks → messages → sync → results |
| **Tier B** | **Not implemented** — no 2-column task list, no results grid, no wizard/results side-by-side, no scroll-height override |
| **DOM / a11y** | Reading/focus order unchanged — **no** CSS **`order`**; **no** **`grid-template-areas`** visual reorder |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Admin; API/backend/database/service/context/copy; credential/sync/API behavior; fake metrics; charts; sidebar; mobile/native UI |
| **Commit** | **`cba6dde`** — `style: align trello desktop setup panels` (**2026-06-03**) |
| **Checks** | `npm run lint`, `npm test`, `npm run build` passed |

**Reviews:** Supervisor Review **approved**; Security / Trust Review **approved** — **no** Critical or Important issues.

**Manual authenticated visual smoke:** **Not live-tested** during gate — structural/CSS review only; authenticated visual smoke at **≥1280px** and **375px** **recommended before merge** if not yet done (optional — does **not** block commit).

**Density only:** Improves **`/trello`** desktop setup density — does **not** complete full Stitch-level UI or solve all desktop layout gaps.

**Implementation files:** `frontend/src/styles/layout.css`.

---

## Implemented — Flashcards desktop panels (Phase BX-I7E2)

**CSS-only** — **`/flashcards`** desktop panel expansion at wide browser viewports; **no** JSX, component, API, backend, database, service, context, or copy changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`frontend/src/styles/layout.css`** only — **no** **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`FlashcardStudy.jsx`** changes |
| **Breakpoint** | **`@media (min-width: 1280px)`** — selectors scoped under **`.page--flashcards`** |
| **Command controls** | Horizontal desktop band: **`.flashcards-workspace__command-controls`** row layout; filters use available width; toolbar / Create flashcard aligns right when space allows |
| **Populated library** | **Study \| manage** **2-column** desktop layout on **`.flashcard-library:has(.flashcards-workspace__study-zone)`** — study zone column 1, manage zone column 2 |
| **Manage list** | **2-column** desktop grid on **`.flashcards-workspace__list`** when list exists (`:has(.flashcards-workspace__list)`) |
| **Create / inline edit** | Create block children and **`:has(form)`** list items span full width (`grid-column: 1 / -1`) |
| **State surfaces** | Intro/loading/error/empty/filter-empty/status/create-cta remain full-width; **`actionError`** outside **`.flashcard-library`** unaffected |
| **Trust** | Manage list still **truncated question only** — **no** answers newly exposed in manage list; full answers remain in study reveal and edit flows only |
| **DOM / a11y** | Reading/focus order unchanged — **no** CSS **`order`**; **no** **`grid-template-areas`** visual reorder |
| **Narrow viewport** | **Narrow responsive browser viewport ~375px** remains stacked — **not** phone/native UI |
| **Out of scope** | Trello, Admin; API/backend/database/service/context/copy; fake metrics; charts; sidebar; mobile/native UI; mastery/AI/memory/health score |
| **Commit** | **`b18304c`** — `style: expand flashcards desktop panels` (**2026-06-02**) |
| **Checks** | `npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated visual smoke:** Populated library, filter-empty, create, inline edit, study reveal, and **1440px** / **1920px** / **375px** **completed**; **1536px** not explicitly tested; loading/error/**`actionError`** not intentionally triggered; console audit and formal keyboard tab smoke **not** run — optional **recommended before merge**.

**Density only:** Improves **`/flashcards`** desktop density — does **not** complete full Stitch-level UI or solve all desktop layout gaps.

**Implementation files:** `frontend/src/styles/layout.css`.

---

## Implemented — Tasks page body polish (Phase B4-A)

**Frontend presentation-only** — **`/tasks`** page body visual polish; **no** backend, API, database, package, auth, routes, services, task CRUD/filter/validation/**Focus** navigation/**`refreshStats`** behavior changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`/tasks`** only — commit **`4ae80ee`** |
| **Command surface** | Task command surface / command band (`task-workspace__command-band--deck`); improved page hierarchy; filter toolbar visual framing (`role="group"`, `aria-label="Filter study tasks"`) |
| **Wrappers** | Create/list/empty/error/loading/action-error wrappers for clearer page structure |
| **Task list** | Semantic **`ul.task-workspace__list > li.task-workspace__list-item > TaskCard` article or FormCard section** with `aria-label="Study tasks"` |
| **Status filters** | Native **`<button type="button">`** elements with **`aria-pressed`** on the real DOM button (**B4-A-F1** — fixes prior issue where shared **`Button.jsx`** did not forward **`aria-pressed`**); selected filter uses **`btn--primary`**, non-selected **`btn--secondary`** — selected state **not** color-only |
| **Trust / framing** | **“Task command”** is approved **UI framing only** — **not** an AI/automation claim; existing **`task.priority`** remains API-backed only; **no** fake AI/health/urgency/status/priority semantics; **no** new task data exposure; **no** task/user/session logging |
| **Responsive (~375px)** | Scoped CSS for **narrow responsive browser viewport** — **not** phone/native UI |
| **Safety** | **No** `tokens.css` / **`components.css`** changes; **no** AppShell, dashboard, courses, course detail, material cockpit, flashcards, Trello, admin, or focus page changes; **no** route transitions |
| **Commit** | **`4ae80ee`** — `style: polish tasks command surface` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **PASS**; Security / Trust Review **approved with notes**; **B4-A-F1** focused Supervisor/Security re-check **approved** — **no** Critical or remaining Important issues.

**Manual authenticated smoke:** **Limited / not fully available** during review — static review + automated checks passed. **Future recommended check:** populated **`/tasks`**, filters, create/edit/complete/delete on safe test task, Start Focus, **narrow responsive browser viewport ~375px**, console check.

**Not in B4-A:** backend/API/database/package/auth/routes/services changes; `tokens.css` / **`components.css`** changes; task CRUD/filter/validation logic changes; **`refreshStats`** behavior changes; Focus navigation changes; AppShell/dashboard/courses/course detail/material cockpit/flashcards/Trello/admin/focus page changes; fake AI/health/urgency/status/priority semantics; admin/focus/shared-state polish — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/components/tasks/GlobalTasksSection.jsx`, `frontend/src/pages/TasksPage.jsx`, `frontend/src/styles/layout.css`.

---

## Implemented — Flashcards page body polish (Phase B4-B)

**Frontend presentation-only** — **`/flashcards`** page body visual polish; **no** backend, API, database, package, auth, routes, services, flashcard CRUD/filter/study/reveal/**`refreshStats`** behavior changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`/flashcards`** only — commit **`f91415d`** |
| **Command surface** | Flashcards command surface / command band (`flashcards-workspace__command-band--deck`); improved page hierarchy; filters/create/study/manage visual framing |
| **Wrappers** | Page-level loading/error wrappers; scoped loading/error/empty/filter-empty/action-error wrappers (`flashcards-workspace__action-error` for **`actionError`** — still **`ErrorMessage`** / **`role="alert"`**, presentation-only) |
| **Filters** | Native labeled course/material **`<select>`** elements; **`role="group"`** + **`aria-label="Filter saved flashcards"`** |
| **Manage list** | Truncated question only via existing **`truncateFlashcardQuestion`** — **no** answers newly exposed in manage list; **`overflow-wrap`** readability for long questions |
| **Trust / framing** | **“Flashcard library”** / **“Filter, study, and manage saved cards”** are factual **UI framing only** — **not** AI/automation claims; deck/command styling is visual chrome only; **no** fake AI/mastery/progress/health/priority/urgency/status semantics; **no** flashcard/user/session/token logging |
| **Content safety** | Full answers remain in existing **`FlashcardStudy`** reveal and edit flows only; delete confirmation text and destructive action clarity **unchanged** |
| **Responsive (~375px)** | Scoped CSS in **`layout.css`** for **narrow responsive browser viewport** — **not** phone/native UI; no page-level horizontal overflow observed in review |
| **Safety** | **No** `tokens.css` / **`components.css`** changes; **no** **`FlashcardStudy.jsx`** or **`DbFlashcardsSection.jsx`** changes; **no** AppShell, dashboard, courses, course detail, tasks, material cockpit, Trello, admin, or focus page changes; **no** route transitions |
| **Commit** | **`f91415d`** — `style: polish flashcards command surface` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated smoke:** **Partial** — populated **`/flashcards`**, course filter, material filter when course selected, study mode, reveal answer, previous/next present, create form opened and cancelled without saving, **narrow responsive browser viewport ~375px** passed; create/edit/delete persistence **not** exercised (avoid mutating shared data); filter-empty/global-empty **not** manually triggered; console not fully instrumented — changed files added **no** `console` logging.

**Not in B4-B:** backend/API/database/package/auth/routes/services changes; `tokens.css` / **`components.css`** changes; **`FlashcardStudy.jsx`** / **`DbFlashcardsSection.jsx`** changes; flashcard business logic / generated plan logic changes; create/edit/delete/study/reveal behavior changes; AppShell/dashboard/courses/course detail/tasks/material cockpit/Trello/admin/focus page changes; admin/focus/shared-state polish — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/components/flashcards/GlobalFlashcardsSection.jsx`, `frontend/src/pages/FlashcardsPage.jsx`, `frontend/src/styles/layout.css`.

---

## Implemented — Trello page body polish (Phase B4-C)

**Frontend presentation-only** — **`/trello`** page body visual polish; **no** backend, API, database, package, auth, routes, services, **`trello.service.js`**, validation/utils, credential lifecycle, sync payload, board/list/task loading, selection, result rendering, or sync behavior changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`/trello`** only — commit **`cf50729`** |
| **Command surface** | Trello integration command surface / command band (`trello-workspace__command-band--deck`); improved page hierarchy; step framing for credentials (Step 1), board/list picker (Step 2), task selector (Step 3), sync submit (Step 4), and results (Step 5) |
| **Wrappers** | Page-level loading/error visual wrappers (`trello-workspace__page-loading`, `trello-workspace__page-error`); results zone visual framing (`trello-workspace__results-zone`); scoped **`layout.css`** polish |
| **B4-C-F1** | Removed courses-level **Try again** button (Supervisor flagged behavior change); courses error remains **`ErrorMessage`**-only inside **`trello-workspace__page-error`**; task-load **Try again** unchanged |
| **Trust / framing** | Manual user-initiated sync creates Trello cards in the selected list — **not** automatic or AI-driven; **no** fake “AI sync”, “smart sync”, “quality score”, “health”, “urgency”, “priority”, or “progress prediction” language; results remain based on returned sync data only |
| **Credentials** | API key and token remain **`type="password"`** with **`autoComplete="off"`**; **no** reveal/show-token; credentials not displayed outside password inputs; **no** logging; **no** `localStorage` / `sessionStorage` / cookies for credentials; **`clearCredentials`** and **`clearCredentialsAfterSync`** unchanged; trust notes honest — **no** OAuth, permanent integration, or server-side credential storage implied |
| **Content safety** | Task titles/details remain plain React text; sync result errors remain plain text; enum-only status CSS classes (`success` \| `failed` \| `skipped`); **no** `dangerouslySetInnerHTML` / `innerHTML` |
| **Responsive (~375px)** | Scoped CSS in **`layout.css`** for **narrow responsive browser viewport** — **not** phone/native UI; no page/main horizontal overflow observed in review |
| **Safety** | **No** `tokens.css` / **`components.css`** changes; **no** **`trello.service.js`** or validation/utils changes; **no** AppShell, dashboard, courses, course detail, tasks, flashcards, material, admin, or focus page changes; **no** route transitions |
| **Commit** | **`cf50729`** — `style: polish trello integration surface` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes** (courses-level **Try again** flagged — fixed in **B4-C-F1**); **B4-C-F1** Supervisor re-check **approved**; Security / Trust Review **approved with notes** — **no** Critical or Important issues remaining.

**Manual authenticated smoke:** **Partial** — **`/trello`** loaded; credential fields verified masked (`type="password"`, `autocomplete="off"`); task selector, Select all / Clear, sync submit disabled without credentials/list as expected; **narrow responsive browser viewport ~375px** passed (no page/main horizontal overflow; focus ring visible); **no** safe Trello credentials used — **no** real sync, board/list load, or post-sync results exercised live (static review of unchanged logic only).

**Not in B4-C:** backend/API/database/package/auth/routes/services changes; **`trello.service.js`** / validation/utils changes; `tokens.css` / **`components.css`** changes; credential lifecycle, sync payload, board/list/task loading, selection, result rendering, or sync behavior changes; AppShell/dashboard/courses/course detail/tasks/flashcards/material/admin/focus page changes; admin/focus/shared-state polish — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/pages/TrelloSyncPage.jsx`, `frontend/src/components/trello/TrelloSyncSection.jsx`, `frontend/src/components/trello/TrelloSyncForm.jsx`, `frontend/src/components/trello/TrelloBoardListPicker.jsx`, `frontend/src/components/trello/TrelloTaskSelector.jsx`, `frontend/src/components/trello/TrelloSyncResults.jsx`, `frontend/src/styles/layout.css`.

---

## Implemented — Admin page body polish (Phase B4-D)

**Frontend presentation-only** — **`/admin`** page body visual polish; **no** backend, API, database, package, auth, routes, **`AdminRoute.jsx`**, **`App.jsx`**, **`AppShell`**, **`admin.service.js`**, role-check, or admin stats fetch/refresh/error behavior changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`/admin`** only — commit **`905ee4d`** |
| **Command surface** | **`admin-workspace`** root; admin command/read surface / command band (`admin-workspace__command-band--deck`); improved aggregate stat-band visual hierarchy inside stats deck |
| **Wrappers** | Page-level loading/error/forbidden visual wrappers (`admin-workspace__page-loading`, `admin-workspace__page-error`, `admin-workspace__forbidden`); forbidden-card visual polish via scoped **`layout.css`** |
| **Trust / framing** | Trust note with **`role="note"`** — aggregate counts only; **no** emails, content, or individual records; PageHeader lead unchanged (platform-wide aggregates; **no** individual user data); **“Platform control”** is read-only aggregate UI framing — **not** user/role/logs management (Security / Trust Review accepted; optional **“Platform overview”** copy softening non-blocking) |
| **Backend status** | Band title **System health** → **Backend status** only; value still from **`stats.systemHealth.backend`** via existing **`formatBackendHealth`** — **no** fake security/risk/health score, AI monitoring, or incident detection |
| **Security boundary** | **`AdminRoute.jsx`**, **`App.jsx`** route tree, **`AppShell`** Admin nav, **`user?.role`**, and **`getAdminStats`** unchanged; frontend role check remains UX-only; backend **`GET /api/admin/stats`** remains authoritative; **SEC-6A3-1** unchanged (silent refresh after demotion may leave prior aggregates visible until forbidden is set on non-silent load) |
| **Content safety** | Stat values remain React text children; static BEM classes only; **no** `dangerouslySetInnerHTML` / `innerHTML`; **no** token/session/user/admin payload logging |
| **Responsive (~375px)** | Scoped CSS in **`layout.css`** for **narrow responsive browser viewport** — **not** phone/native UI; stacks stat rows, tightens deck padding, full-width Refresh in header actions |
| **Safety** | **No** `tokens.css` / **`components.css`** changes; **no** dashboard, courses, tasks, flashcards, Trello, material, or focus page changes; **no** new admin capabilities (users, roles, logs, charts, destructive actions, permissions) |
| **Commit** | **`905ee4d`** — `style: polish admin control surface` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated smoke:** **Limited** — logged-out **`/admin`** redirected to **`/`** (sign-in) confirmed in Security / Trust Review; admin success state, Refresh, non-admin **`AdminRoute`** forbidden, API **403** in-page forbidden, and **375px** success layout **not** live-tested (no admin/non-admin sessions); **375px** admin success layout reviewed statically.

**Not in B4-D:** backend/API/database/package/auth/routes/services changes; **`AdminRoute.jsx`**, **`App.jsx`**, **`AppShell`**, **`admin.service.js`** changes; `tokens.css` / **`components.css`** changes; **`loadStats`**, refresh, **Try again**, **FORBIDDEN**, **AUTH_REQUIRED**, or SEC-6A3-1 behavior changes; dashboard/courses/course detail/tasks/flashcards/Trello/material/focus page changes; focus/shared-state polish — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/pages/AdminDashboardPage.jsx`, `frontend/src/styles/layout.css`.

---

## Implemented — Focus page body polish (Phase B4-E)

**Frontend presentation-only** — **`/focus/:taskId`** page body visual polish; **no** backend, API, database, package, auth, routes, **`focus.service.js`**, **`TaskCard.jsx`**, **`App.jsx`**, **`AppShell`**, or focus session start/complete behavior changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`/focus/:taskId`** only — commit **`7f4bf6b`** |
| **Command surface** | **`focus-workspace`** session deck / command band (`focus-workspace__command-band--deck`); **Session cockpit** section title and factual subtitle copy only |
| **Wrappers** | Improved task context framing (`focus-workspace__task-context`); timer panel (`focus-timer-surface`, `focus-workspace__timer-zone`); action area (`focus-workspace__action-zone`); page-level loading/error/done zones (`focus-workspace__page-loading`, `focus-workspace__page-error`, `focus-workspace__done-zone`) |
| **Trust / framing** | Factual session cockpit copy — **no** pause, reset, duration picker, session history, charts, streaks, productivity/health/deep-work scores, AI focus coach, or smart timer semantics; PageHeader lead mentions **optional completion when you finish**; **25-minute** copy accurate because **`DEFAULT_DURATION_MINUTES = 25`** (future duration changes should update hardcoded copy) |
| **Timer / session behavior** | **Unchanged** — logic above JSX `return` in **`FocusPage.jsx`** not modified: auto-start via **`beginFocusStart`** / **`focusStartRequests`**; client-side 1s countdown with same math; phase machine (`starting` → `active` → `start-error` / `done`); **`completeFocusSession(session.id, markTaskComplete)`**; explicit **Complete session** button; explicit **Mark task as complete** checkbox; **`refreshStats()`** after successful complete; error classification/messages; **Try again** only for network start errors; **`location.state`** (`taskTitle`, `courseId`, `returnTo`) and back links unchanged; **AUTH_REQUIRED** → logout + redirect unchanged |
| **Accessibility** | **Removed** `aria-live="polite"` from active timer panel (avoids noisy per-second announcements); static timer **`aria-label`** uses **`session.durationMinutes`** only; error/done sections retain **`aria-live="polite"`**; **`LoadingState`** for starting; **`ErrorMessage`** / **`role="alert"`** for errors |
| **Content safety** | **`taskTitle`** plain React text child only — not in `className`, dynamic `aria-label`, `title`, or `data-*`; static BEM classes only; **no** token/session/user/focus payload logging |
| **Responsive (~375px)** | Scoped CSS in **`layout.css`** for **narrow responsive browser viewport** — **not** phone/native UI; `min-width: 0`, `overflow-wrap: anywhere` on task title, `clamp` timer size, stacked full-width actions |
| **Safety** | **No** `tokens.css` / **`components.css`** changes; **no** dashboard, courses, tasks, flashcards, Trello, admin, or material page changes; **no** new focus product features |
| **Commit** | **`7f4bf6b`** — `style: polish focus session cockpit` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated smoke:** **Limited** — no authenticated session or safe pending task; static review verified logic unchanged; automated checks passed. **Future recommended check:** Start Focus from pending task; starting → active timer; complete without/with checkbox on safe test task; done summary uses backend **`completedSession.durationMinutes`**; Back to tasks/course; **narrow responsive browser viewport ~375px**; keyboard focus; console check for no token/session/user/focus payload logs.

**Not in B4-E:** backend/API/database/package/auth/routes/services changes; **`focus.service.js`**, **`TaskCard.jsx`**, **`App.jsx`**, **`AppShell`** changes; `tokens.css` / **`components.css`** changes; timer interval, countdown math, **`beginFocusStart`**, **`focusStartRequests`**, phase machine, **`completeFocusSession`** payload, checkbox, **`refreshStats`**, error handling, navigation state/back links, or **AUTH_REQUIRED** behavior changes; pause/reset/duration picker/history/charts/streaks/fake metrics; shared empty/loading/error state polish — each requires separate planning and explicit approval.

**Implementation files:** `frontend/src/pages/FocusPage.jsx`, `frontend/src/styles/layout.css`.

---

## Implemented — Shared state primitives polish (Phase B4-F1)

**CSS-only presentation** — shared **`.loading`**, **`.empty-state`**, **`.alert`** / **`.alert--error`**, and **`.protected-loading`** visual polish; **no** backend, API, database, package, auth, routes, page JSX, services, or shared UI component behavior changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | Global shared primitives — commit **`ea8a899`** |
| **File** | **`frontend/src/styles/components.css`** only |
| **Polish** | Glass/dark UI alignment with B4 command surfaces: loading panel with spinner; empty-state glass deck card; error alert with danger tokens + 3px left accent; protected-loading gradient + centered nested loading cap |
| **Responsive (~375px)** | **`min-width: 0`**, **`overflow-wrap: anywhere`**, scoped padding at **`max-width: 640px`** — **narrow responsive browser viewport** only (**not** phone/native UI) |
| **Accessibility** | **`LoadingState.jsx`** unchanged — **`role="status"`**, **`aria-live="polite"`**; **`ErrorMessage.jsx`** unchanged — **`role="alert"`**; **`EmptyState.jsx`** unchanged — props + primary CTA; **no** extra **`aria-live`** wrappers added |
| **Trust / safety** | Errors **not** hidden or softened into success/healthy states; **no** copy changes; **no** new/removed **Try again** buttons; **no** new empty/loading/error states; **no** fake AI/health/priority/urgency/status semantics; **no** token/session/user/content/error-payload logging; **no** unsafe rendering |
| **Compatibility** | B4-A/B empty-state scoped overrides in **`layout.css`** preserved; forbidden/not-found surfaces structurally unchanged; material AI processing lane may look slightly nested (glass **`.loading`** inside **`.ai-panel__loading--active`**) — cosmetic/non-blocking |
| **Not fixed** | **TrelloTaskSelector** EmptyState invalid **`message`** prop — intentionally deferred |
| **Commit** | **`ea8a899`** — `style: polish shared state primitives` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated smoke:** **Limited** — full visual QA not live-tested. **Future recommended check:** material generate processing lane; dashboard/courses loading + error; courses/tasks/flashcards empty states; admin forbidden vs error; protected loading; **narrow responsive browser viewport ~375px**; keyboard focus on EmptyState CTA / Try again; console clean.

**Not in B4-F1:** **`LoadingState.jsx`**, **`EmptyState.jsx`**, **`ErrorMessage.jsx`**, **`layout.css`**, **`tokens.css`**, page/route/service/API/auth/data-fetching/error-mapping changes; **B4-F2** route state framing (now complete — commit **`ee50b8e`**); **B4-F3A** secondary in-page state surfaces (now complete — commit **`596e869`**); **B4-F3B** state surface wrapper hooks (now complete — commit **`ee5357f`**); **B4-F3C** sub-series (now complete — **`d0393d7`**, **`d1a3c69`**, **`ab28307`**).

**Implementation files:** `frontend/src/styles/components.css`.

---

## Implemented — Route state surface framing (Phase B4-F2)

**Frontend presentation-only** — route-level loading/error/not-found visual framing; **no** backend, API, database, package, auth, route guard, service, data-fetching, error-mapping, retry, or copy changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | Dashboard, Courses, CourseDetail early returns, StudyMaterialDetail early returns — commit **`ee50b8e`** |
| **Files** | **`frontend/src/pages/DashboardStub.jsx`**, **`CoursesList.jsx`**, **`CourseDetail.jsx`**, **`StudyMaterialDetail.jsx`**, **`frontend/src/styles/layout.css`** only |
| **Framing** | **`/dashboard`** page loading/error wrappers; **`/courses`** page loading/error wrappers; **`CourseDetail`** early-return loading/error/not-found wrappers; **`StudyMaterialDetail`** early-return loading/error/not-found wrappers; scoped route-state CSS; neutral not-found decks for course/material missing-resource states; wrapped error action rows for existing **Try again** buttons |
| **Responsive (~375px)** | **`min-width: 0`**, **`overflow-wrap: anywhere`**, **`flex-wrap`** on error action rows, scoped padding — **narrow responsive browser viewport** only (**not** phone/native UI) |
| **Accessibility** | **`LoadingState.jsx`** unchanged — **`role="status"`**, **`aria-live="polite"`**; **`ErrorMessage.jsx`** unchanged — **`role="alert"`**; **no** duplicate **`aria-live`** wrappers; back links remain React Router **`Link`** elements; **`h1`** preserved in not-found states |
| **Trust / safety** | Not-found copy neutral (**Course not found** / **Study material not found** — **no** admin/forbidden/permission-denied wording); wrong-owner **`NOT_FOUND`** behavior remains neutral; **no** copy changes; **no** new/removed **Try again** buttons; existing handlers unchanged (**loadStats**, **loadCourses**, **loadCourse**, **loadMaterial**); error states still use **`ErrorMessage`** danger styling inside deck; **no** token/session/user/content/error-payload logging; **no** unsafe rendering |
| **Visual note** | Course/material not-found and page-error decks share neutral glass deck framing with primary top accent — error still uses **`ErrorMessage`** danger styling inside deck (non-blocking) |
| **Not touched** | **`components.css`**, **`tokens.css`**, shared UI components, **`AppShell`**, **`AdminRoute`**, auth route guards, **CourseDetail** nested materials states, **StudyMaterialDetail** success cockpit / AI / plan / flashcards sections (secondary in-page states later polished **CSS-only** in **B4-F3A** — commit **`596e869`**), material AI processing lane, Tasks/Flashcards/Trello/Admin/Focus pages |
| **Not fixed** | **TrelloTaskSelector** EmptyState invalid **`message`** prop — intentionally deferred |
| **Commit** | **`ee50b8e`** — `style: frame route state surfaces` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated smoke:** **Limited** — full visual QA not live-tested; unauthenticated fake course UUID redirected to sign-in. **Future recommended check:** dashboard loading/error + **Try again**; courses loading/error/empty + **Try again**; course fake UUID not-found; material fake UUID not-found; **narrow responsive browser viewport ~375px**; keyboard focus on **Try again**/back links; console clean.

**Not in B4-F2:** **B4-F3A** secondary in-page state surfaces (now complete — commit **`596e869`**); **B4-F3B** state surface wrapper hooks (now complete — commit **`ee5357f`**); **B4-F3C** sub-series (now complete).

**Implementation files:** `frontend/src/pages/DashboardStub.jsx`, `frontend/src/pages/CoursesList.jsx`, `frontend/src/pages/CourseDetail.jsx`, `frontend/src/pages/StudyMaterialDetail.jsx`, `frontend/src/styles/layout.css`.

---

## Implemented — Secondary in-page state surfaces (Phase B4-F3A)

**CSS-only** — secondary in-page state surface polish on course detail and material detail; **no** backend, API, database, package, auth, route guard, service, data-fetching, error-mapping, retry, handler, or copy changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **CourseDetail** materials loading/error/empty; course tasks filter-empty; material saved flashcards library loading/error/empty; material cockpit plan/history error blocks — commit **`596e869`** |
| **File** | **`frontend/src/styles/layout.css`** only |
| **Surfaces** | **`.page--course-detail .course-workspace__materials--primary`** loading/error/empty; **`.page--course-detail .course-workspace__tasks .section__meta`** filter-empty; **`.page--material-detail .material-workspace__library`** flashcard library loading/**`flashcard-library__error`**/**`flashcard-library__empty`**; **`.material-workspace__cockpit-ai .plan-panel__error`** and **`.plan-history__error`** spacing/wrapping |
| **Responsive (~375px)** | **`min-width: 0`**, **`overflow-wrap: anywhere`**, scoped padding at **`max-width: 640px`** — **narrow responsive browser viewport** only (**not** phone/native UI) |
| **Accessibility** | **`LoadingState.jsx`** unchanged — **`role="status"`**, **`aria-live="polite"`**; **`ErrorMessage.jsx`** unchanged — **`role="alert"`**; **no** duplicate **`aria-live`** wrappers; **Try again** / EmptyState CTA behavior unchanged |
| **Trust / safety** | Empty states remain informational — **not** data-loss/deletion semantics; filter-empty remains filter-scoped; errors remain visible via inner **`.alert--error`**; **no** copy changes; **no** new/removed **Try again** buttons; **no** raw API payloads or sensitive details newly exposed; **no** full material/plan/flashcard content newly shown in state panels; **no** token/session/user/content/error-payload logging; **no** unsafe rendering |
| **Visual note** | **`flashcard-library__error`** and **`plan-panel__error`** have neutral outer card shells — inner **`ErrorMessage`** / **`.alert--error`** remains clearly error-oriented (non-blocking) |
| **Not touched** | **`components.css`**, **`tokens.css`**, all JSX/shared UI components, **`AppShell`**, auth route guards, **B4-F2** route-level **`__page-loading`** / **`__page-error`** / **`__not-found`** wrappers, material AI processing lane (**`ai-panel__loading`**, “Processing with AI…”), **GeneratedPlanHistory** preview **`aria-live`**, Dashboard in-body empty, **TrelloBoardListPicker** / **TrelloSyncResults**, Tasks/Flashcards/Trello/Admin/Focus pages |
| **Not fixed** | **TrelloTaskSelector** EmptyState invalid **`message`** prop — intentionally deferred |
| **Deferred at B4-F3A (historical)** | **B4-F3B** wrapper **`className`** work (**now complete** — commit **`ee5357f`**); **B4-F3C** AI/a11y/bug-fix work (**B4-F3C** sub-series **complete** — commits **`d0393d7`**, **`d1a3c69`**, **`ab28307`**) |
| **Commit** | **`596e869`** — `style: polish secondary state surfaces` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated smoke:** **Limited** — full visual QA not live-tested. **Future recommended check:** **`/courses/:id`** materials loading/error/empty; tasks filter-empty; **`/study-materials/:id`** flashcards loading/error/empty; plan/history error if safely triggerable; **narrow responsive browser viewport ~375px**; keyboard focus on **Try again**/CTA; console clean.

**Not in B4-F3A:** **B4-F3B** wrapper **`className`** work (**now complete** — commit **`ee5357f`**); **B4-F3C** AI/a11y/bug-fix work (**B4-F3C** sub-series **complete** separately).

**Implementation files:** `frontend/src/styles/layout.css`.

---

## Implemented — State surface wrapper hooks (Phase B4-F3B)

**Frontend presentation-only** — explicit wrapper **`className`** hooks around existing secondary in-page loading/error/empty state surfaces plus **`layout.css`** selector migration from brittle **B4-F3A** direct-child/generic selectors; **no** backend, API, database, package, auth, route guard, service, data-fetching, error-mapping, retry, handler, copy, role, **`aria-live`**, or shared UI primitive file changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **CourseDetail** materials loading/error/empty wrappers; **CourseTasksSection** filter-empty wrapper; **DbFlashcardsSection** saved flashcards loading wrapper; **`layout.css`** selector migration — commit **`ee5357f`** |
| **Files** | **`frontend/src/pages/CourseDetail.jsx`**, **`frontend/src/components/tasks/CourseTasksSection.jsx`**, **`frontend/src/components/materials/DbFlashcardsSection.jsx`**, **`frontend/src/styles/layout.css`** only |
| **Wrappers added** | **`course-workspace__materials-loading`**, **`course-workspace__materials-error`**, **`course-workspace__materials-error-actions`**, **`course-workspace__materials-empty`**, **`course-workspace__tasks-filter-empty`**, **`flashcard-library__loading`** — all fixed string classNames |
| **Selector migration** | Replaced brittle **B4-F3A** selectors (e.g. **`.course-workspace__materials--primary > .loading`**, **`.alert--error + .btn`**, **`.course-workspace__tasks .section__meta`**, **`.flashcard-library > .loading`**) with stable wrapper selectors; **640px** responsive rules migrated equivalently |
| **Responsive (~375px)** | **`min-width: 0`**, **`overflow-wrap: anywhere`**, scoped padding at **`max-width: 640px`** preserved — **narrow responsive browser viewport** only (**not** phone/native UI) |
| **Accessibility** | Wrapper divs/p **no** new **`role`** or **`aria-live`** — **no** nested live regions; **`LoadingState.jsx`** unchanged — **`role="status"`**, **`aria-live="polite"`**; **`ErrorMessage.jsx`** unchanged — **`role="alert"`**; **`EmptyState.jsx`** props and CTA behavior unchanged; Try again handlers unchanged |
| **Trust / safety** | **No** copy changes; **no** new/removed buttons; **no** behavior/API/service/auth/route changes; **no** sensitive data newly rendered; **no** token/session/user/material/generated-plan/raw-error logging; **no** console logging; **no** unsafe rendering; **no** raw user/API strings as CSS classes; **no** fake AI/health/productivity/priority/status semantics |
| **Not touched** | **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`EmptyState.jsx`**, **`tokens.css`**, **`components.css`**, **`StudyMaterialDetail.jsx`** generate lane, **`GeneratedPlanHistorySection.jsx`**, Trello components, Dashboard, global tasks/flashcards pages, backend/API/database/package/auth/services |
| **B4-F3 series status** | **B4-F3A** (**`596e869`**) / **B4-F3B** (**`ee5357f`**) / **B4-F3C** (**B4-F3C1** **`d0393d7`**, **B4-F3C2** **`d1a3c69`**, **B4-F3C3** **`ab28307`**) all **complete** |
| **Commit** | **`ee5357f`** — `style: add state surface wrapper hooks` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated smoke:** **Limited** — full visual QA not live-tested. **Future recommended check:** **`/courses/:id`** materials loading/error/empty; Try again and EmptyState CTA; Pending/Completed filter-empty; **`/study-materials/:id`** flashcards library loading/error/empty; **narrow responsive browser viewport ~375px**; keyboard focus on Try again / EmptyState CTA; console clean (no token/session/user/material/generated-plan/raw-error logs).

**Not in B4-F3B:** backend/API/database/package/auth changes; service changes; new features; copy changes; role/**`aria-live`** changes; shared UI primitive changes; StudyMaterialDetail generate-lane; GeneratedPlanHistory preview; Trello; Dashboard; global tasks/flashcards. Next implementation phase is **not automatic** — requires separate planning and explicit approval.

**Implementation files:** `frontend/src/pages/CourseDetail.jsx`, `frontend/src/components/tasks/CourseTasksSection.jsx`, `frontend/src/components/materials/DbFlashcardsSection.jsx`, `frontend/src/styles/layout.css`.

---

## Implemented — TrelloTaskSelector empty-state bug fix (Phase B4-F3C1)

**Frontend-only** isolated bug fix — zero-tasks empty state in **`TrelloTaskSelector`**; **no** backend, API, database, package, auth, route guard, service, CSS, Trello sync payload, or shared UI component behavior changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **`TrelloTaskSelector`** zero-tasks branch only — commit **`d0393d7`** |
| **File** | **`frontend/src/components/trello/TrelloTaskSelector.jsx`** only |
| **Fix** | Removed invalid **`EmptyState`** usage with unsupported **`message`** prop (could render blank heading/description/button and undefined **`onAction`** click risk); removed unused **`EmptyState`** import; replaced with plain informational **`<p className="trello-picker__empty trello-picker__status" role="status">`** |
| **Copy** | Preserved exact empty message: **No study tasks yet. Create tasks on a course or the All study tasks page.** — **no** new CTAs, navigation, or **Try again** button changes |
| **Responsive (~375px)** | Uses existing **`trello-picker__empty`** / **`trello-picker__status`** CSS — **no** CSS file changes; **narrow responsive browser viewport** only (**not** phone/native UI) |
| **Accessibility** | Zero-tasks state uses **`role="status"`** (informational); existing **`overLimit`** **`role="alert"`** unchanged; **no** duplicate **`aria-live`** wrappers added in empty branch; task-branch **`aria-live="polite"`** on selection count unchanged |
| **Trust / safety** | Empty message is factual and static — **no** Trello sync success/failure claims, **no** data-loss implication; **no** credentials, payloads, tokens, session/user data, or task titles in zero-tasks state; **no** console logging; **no** unsafe rendering (`dangerouslySetInnerHTML`, `innerHTML`, `eval`, markdown renderer, external assets) |
| **Behavior preserved** | Task selection, **`selectedTaskIds`**, select/deselect, Select all, Clear, 50-task limit (**`TRELLO_SYNC_MAX_TASKS`**), **`overLimit`** condition, checkbox rendering/labels, disabled behavior, task title/meta when tasks exist, **`TrelloSyncSection`** integration, credentials/board/list flow, sync payload behavior — **unchanged** |
| **Not touched** | **`EmptyState.jsx`**, **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`TrelloSyncSection.jsx`**, **`layout.css`**, **`components.css`**, **`tokens.css`**, Trello services, backend/API/database/package/auth; material AI processing lane; **GeneratedPlanHistorySection** |
| **Complete separately** | **B4-F3B** wrapper hooks (**complete** — commit **`ee5357f`**) |
| **Commit** | **`d0393d7`** — `fix: repair trello empty task state` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved**; Security / Trust Review **approved** — **no** Critical, Important, or Minor issues.

**Manual authenticated smoke:** **Limited** — full **`/trello`** visual QA not live-tested. **Future recommended check:** **`/trello`** with zero tasks (correct empty message, no blank heading/button, console clean); **`/trello`** with tasks (select/deselect, Select all, Clear, over-limit alert); **narrow responsive browser viewport ~375px**; keyboard focus; console clean.

**Not in B4-F3C1:** **B4-F3C2** AI lane **`aria-live`** cleanup (**complete** — commit **`d1a3c69`**); **B4-F3C3** **GeneratedPlanHistory** preview review/fix (**complete** — commit **`ab28307`**) — **B4-F3C** sub-series **complete**; **B4-F3B** wrapper hooks (**complete** — commit **`ee5357f`**); remaining phases require separate planning and explicit approval.

**Implementation files:** `frontend/src/components/trello/TrelloTaskSelector.jsx`.

---

## Implemented — AI processing lane aria-live cleanup (Phase B4-F3C2)

**Frontend-only** one-file accessibility cleanup — duplicate nested **`aria-live`** on material detail AI processing lane; **no** backend, API, database, package, auth, route guard, service, CSS, generate behavior, or shared UI component file changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | Material detail generate processing lane only — commit **`d1a3c69`** |
| **File** | **`frontend/src/pages/StudyMaterialDetail.jsx`** only |
| **Fix** | Removed **`aria-live="polite"`** from outer **`<div className="ai-panel__loading ai-panel__loading--active">`** in **`{generating && (…)}`** block; kept **`className`** and **`<LoadingState message="Processing with AI…" />`** unchanged |
| **Accessibility** | **`LoadingState`** remains single polite live region — **`role="status"`**, **`aria-live="polite"`**; outer wrapper no longer creates nested duplicate live region; **`generateError`** still **`ErrorMessage`** / **`role="alert"`**; **GeneratedPlanHistorySection** preview **`aria-live`** **not touched** |
| **Trust / safety** | Processing state remains visible (panel + button label unchanged); processing does **not** look complete/successful; **no** fake AI/health/productivity semantics; **no** material content, generated plan payloads, tokens, sessions, users, or raw error-payload logging; **no** console logging; **no** unsafe rendering |
| **Behavior preserved** | **`generating`** condition, **`handleGenerate`**, **`generateMaterial`**, **`generateDisabled`**, button labels (**Processing with AI…** / **Generate study plan**), plan/history refresh, active plan, import/clear/delete, flashcards library, material editor, **AUTH_REQUIRED** handling — **unchanged** |
| **Not touched** | **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`EmptyState.jsx`**, **`layout.css`**, **`components.css`**, **`tokens.css`**, **`TrelloTaskSelector.jsx`**, **`GeneratedPlanHistorySection.jsx`**, services, backend/API/database/package/auth |
| **Complete separately** | **B4-F3B** wrapper hooks (**complete** — commit **`ee5357f`**) |
| **Commit** | **`d1a3c69`** — `fix: remove duplicate ai processing live region` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues.

**Manual authenticated smoke:** **Limited** — full generate-flow visual/a11y QA not live-tested. **Future recommended check:** open study material → **Generate study plan**; disabled button + panel **Processing with AI…**; single polite live region via **`LoadingState`** if testable; success path; **`generateError`** if safely triggerable; **narrow responsive browser viewport ~375px**; keyboard focus; console clean.

**Not in B4-F3C2:** **B4-F3C3** **GeneratedPlanHistory** preview review/fix (**complete** — commit **`ab28307`**) — **B4-F3B** wrapper hooks (**complete** — commit **`ee5357f`**); each remaining phase requires separate planning and explicit approval.

**Implementation files:** `frontend/src/pages/StudyMaterialDetail.jsx`.

---

## Implemented — GeneratedPlanHistory preview aria-live cleanup (Phase B4-F3C3)

**Frontend-only** one-file accessibility cleanup — narrowed preview **`aria-live`** to loading status only; **no** backend, API, database, package, auth, route guard, service, CSS, preview helper, or shared UI component file changes.

| Aspect | Detail |
|--------|--------|
| **Scope** | **GeneratedPlanHistorySection** inactive-version preview panel only — commit **`ab28307`** |
| **File** | **`frontend/src/components/materials/GeneratedPlanHistorySection.jsx`** only |
| **Fix** | Removed **`aria-live="polite"`** from preview panel wrapper **`<div className="plan-history__preview plan-history__preview-panel">`**; added **`role="status"`** and **`aria-live="polite"`** to preview loading **`<p className="plan-panel__status plan-panel__status--loading">`** only — copy unchanged: **Loading preview…** |
| **Accessibility** | Single polite live region for preview loading only; wrapper no longer live-wraps loading/error/success; **`previewError`** still **`ErrorMessage`** / **`role="alert"`**; success snippet + meta **not** live-announced; **no** nested/duplicate **`aria-live`** in preview block |
| **Generated-content exposure** | Preview still renders truncated summary snippet (**`getPlanSummarySnippet`**, max 120 chars) + aggregate meta/counts/difficulty (**`formatPlanPreviewMeta`**) only — **no** full plan body, task list, flashcards, key topics list, raw JSON, or raw API payloads in DOM; full plan may remain in React state after **`getGeneratedPlanById`** (unchanged — not newly exposed by this diff) |
| **Trust / safety** | Loading remains visible — **not** hidden or softened into success; **no** fake AI/health/productivity semantics; **no** generated plan payload/token/session/user/material/raw-error logging; **no** console logging; **no** unsafe rendering; plain React text only |
| **Behavior preserved** | History list, Preview/Hide preview, **`handlePreview`**, **`getGeneratedPlanById`**, **`previewPlanId`** / **`previewPlan`** / **`previewLoading`** / **`previewError`**, Make active, Delete, active row, snippet/meta helpers — **unchanged**; **no** new/removed buttons, routes, API calls, or copy changes |
| **Not touched** | **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`EmptyState.jsx`**, **`StudyMaterialDetail.jsx`**, **`TrelloTaskSelector.jsx`**, **`layout.css`**, **`components.css`**, **`tokens.css`**, **`generated-plan-history-preview.js`**, services, backend/API/database/package/auth |
| **Complete separately** | **B4-F3B** wrapper hooks (**complete** — commit **`ee5357f`**) — **B4-F3C** sub-series (**B4-F3C1**, **B4-F3C2**, **B4-F3C3**) **complete** |
| **Commit** | **`ab28307`** — `fix: narrow generated plan preview live region` (**2026-06-02**) |
| **Checks** | `cd frontend && npm run lint`, `npm test` (**228/228**), `npm run build` passed |

**Reviews:** Supervisor Review **approved**; Security / Trust Review **approved** — **no** Critical or Important issues.

**Manual authenticated smoke:** **Limited** — full generated-plan-history preview visual/a11y QA not live-tested. **Future recommended check:** study material with history → Preview inactive version → **Loading preview…** visible (polite announcement if testable) → success snippet + meta only → **`previewError`** if safely triggerable → keyboard on Preview / Make active / Delete → **narrow responsive browser viewport ~375px** → console clean (no token/session/user/material/full-plan/raw-error logs).

**Not in B4-F3C3:** **B4-F3B** wrapper hooks (**complete** — commit **`ee5357f`**). **B4-F3A** / **B4-F3B** / **B4-F3C** all **complete**; next implementation phase is **not automatic**.

**Implementation files:** `frontend/src/components/materials/GeneratedPlanHistorySection.jsx`.

---

## Implemented — UI presentation polish (Phases 8A–8C, 12A-1, B1–B3, BX-I2, BX-I3, BX-I4, BX-I5, BX-I6B, BX-I6C, BX-I6D, BX-I7B, BX-I7C, BX-I7D Tier 1, BX-I7E1, BX-I7E2, BX-I7E3 Tier A, BX-I7E4, BX-I7F, BX-I8B, BX-I8C, B4-A, B4-B, B4-C, B4-D, B4-E, B4-F1, B4-F2, B4-F3A, B4-F3B, B4-F3C1, B4-F3C2, B4-F3C3)

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
| **BX-I6B** | Complete (**2026-06-02**) | Dashboard command-center visual upgrade — flagship hero, Study pulse cockpit band, course workload deck, tertiary **At a glance** — **`DashboardStub.jsx`**, **`layout.css`**, **`components.css`** only |
| **BX-I6C** | Complete (**2026-06-02**) | Courses / course-detail visual alignment — subject shelf, course workspace, document shelf deck, honest material count subtitle — **`CourseCard.jsx`**, **`MaterialCard.jsx`**, **`CoursesList.jsx`**, **`CourseDetail.jsx`**, **`layout.css`**, **`components.css`** only |
| **BX-I6D** | Complete (**2026-06-02**) | Global shell / top navigation chrome — glass shell bar, brand/nav/logout styling, **narrow responsive browser viewport ~375px** WEB horizontal nav scroll — **`layout.css`** only |
| **BX-I7B** | Complete (**2026-06-02**, commit **`00d3255`**) | Global desktop cockpit shell widening — **`--content-max-cockpit`** / **`--content-max-shell`** **1120px → 1280px**; **`AppShell`** + **`page--cockpit`** aligned; desktop-only **`.page`** padding at **`min-width: 1280px`**; **`--content-max-form`**, **`--content-max-workspace`**, **`--content-max-reading`** unchanged; **narrow responsive browser viewport ~375px** preserved — **`tokens.css`** + **`layout.css`** only; **no** JSX/components/pages/services/backend; **foundation only** |
| **BX-I7C** | Complete (**2026-06-02**, commit **`583922d`**) | Dashboard desktop grid expansion — **`layout.css`** only; at **`min-width: 1280px`**: hero + study pulse side-by-side, **PageHeader** full width, courses/secondary full width below, 2-column **dashboard-course-list**; loading/error unaffected; **375px** stacked; **no** **`DashboardStub.jsx`** or API/service/context/recommendation/copy changes; improves Dashboard density — **not** final Stitch-level UI |
| **BX-I7D Tier 1** | Complete (**2026-06-02**, commit **`52c68ab`**) | Courses/course detail desktop shelf expansion — **`layout.css`** only; at **`min-width: 1280px`**: **`/courses`** 3-column course shelf; **`/courses/:id`** 2-column document/material shelf; loading/error/empty unaffected; tasks below materials unchanged; **375px** stacked; **no** **`CoursesList.jsx`**, **`CourseDetail.jsx`**, component, API/service/context/recommendation/copy changes; **Tier 2** **not implemented**; improves Courses/Course Detail density — **not** final Stitch-level UI |
| **BX-I7E1** | Complete (**2026-06-02**, commit **`d0db43e`**) | Tasks desktop panels — **`layout.css`** only; at **`min-width: 1280px`**: **`/tasks`** horizontal command-controls band, filters use available width, toolbar aligns right when space allows, populated task list **2-column** grid; create FormCard full-width; inline edit intended full width via **`:has(.task-workspace__edit-card)`**; loading/error/empty/filter-empty unaffected; **375px** stacked; **no** **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`TaskCard.jsx`**, API/service/context/copy changes; improves **`/tasks`** density — **not** final Stitch-level UI |
| **BX-I7E2** | Complete (**2026-06-02**, commit **`b18304c`**) | Flashcards desktop panels — **`layout.css`** only; at **`min-width: 1280px`**: **`/flashcards`** horizontal command-controls band, **study \| manage** **2-column** populated library (`:has(.flashcards-workspace__study-zone)`), manage list **2-column** grid when populated, create/inline edit full-width (`:has(form)`); intro/loading/error/empty/filter-empty/status/create-cta full-width; **`actionError`** outside library unaffected; manage list truncated questions only — **no** answer exposure; **375px** stacked; **no** **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`FlashcardStudy.jsx`**, API/service/context/copy changes; **no** mastery/AI/memory/health score; improves **`/flashcards`** density — **not** final Stitch-level UI |
| **BX-I7E3 Tier A** | Complete (**2026-06-03**, commit **`cba6dde`**) | Trello desktop setup panels — **`layout.css`** only; at **`min-width: 1280px`**: **`/trello`** Step 1 credentials + Step 2 destination side-by-side; Step 3 tasks, messages, Step 4 sync full-width; results below command band; DOM order unchanged; **375px** stacked; **no** Trello JSX/components/services/API/backend changes; **Tier B not implemented**; improves **`/trello`** setup density — **not** final Stitch-level UI |
| **BX-I7E4** | Complete (**2026-06-03**, commit **`467ccd9`**) | Admin desktop stats panels — **`layout.css`** only; at **`min-width: 1280px`**: **`/admin`** stats deck **2-column** grid; Platform overview, Trello today, Backend status full-width; Tasks|Focus and Learning|Trello stats rows side-by-side; inner stat grids unchanged; loading/error/forbidden/**`AdminRoute`** unaffected; **375px** stacked; **no** JSX/API/backend/services/auth/copy changes; **no** fake metrics/charts/health scores/new KPIs; improves **`/admin`** stats deck density — **not** final Stitch-level UI |
| **BX-I7F** | Complete (**2026-06-03**, commit **`25988dc`**) | Material cockpit desktop pass — **`layout.css`** only; at **`min-width: 1280px`** on **`/study-materials/:materialId`**: cockpit **1.15fr \| 0.85fr** (`:has(.material-workspace__cockpit)`); plan-history / plan-import action rows horizontal with wrap; library **study \| manage** **2-column** (`:has(.flashcard-library__study)`); manage list **2-column**; create/edit full-width (`:has(form)`); loading/error/not-found unaffected; **375px** stacked; **`/flashcards`** unaffected; **no** JSX/API/services/backend/auth/AI behavior/logging/content-exposure changes; plan history list/preview unchanged; improves material cockpit density — **not** final Stitch-level UI |
| **BX-I8B** | Complete (**2026-06-03**, commit **`bda2645`**) | AI command surfaces polish — **`components.css`** + **`layout.css`** only; on **`/study-materials/:materialId`**: stronger violet/glass on AI command column (generate panel, loading lane, plan output, history, import bands); **Generate** CTA remains electric blue / primary; **375px** stacked; **BX-I7F** layout preserved; **no** `tokens.css`, JSX, API, services, backend, auth, routes, behavior, copy, logging, or content-exposure changes; **no** fake metrics/charts/scores/sidebar/mobile-native UI; improves AI command surface polish — **not** final Stitch-level UI |
| **BX-I8C** | Complete (**2026-06-03**, commit **`8008dc1`**) | Auth + PageHeader intro chrome — **`components.css`** + **`layout.css`** only; auth **`.page--auth .form-card`** glass/command-center card; intro **`PageHeader`** glass band + top gradient (**`.page-header--intro`** only); **`.auth-brand`** polish; course accent header preserved; **375px** stacked; **BX-I7** / **BX-I8B** layouts preserved; **no** `tokens.css`, **`base.css`**, JSX, API, backend, auth, routes, services, behavior, copy, logging changes; **no** fake metrics/charts/sidebar/mobile-native UI; focus-visible clipping smoke **recommended but not blocking** — **not** final Stitch-level UI |
| **BX-I9B1** | Complete (**2026-06-03**, commit **`9ec2917`**) | Radius token alignment — **`tokens.css`** + **`components.css`** only; **`--radius-sm`** **8px** / **`--radius-md`** **12px**; **`--radius-lg`** / **`--radius-xl`** unchanged; **`.btn`** / **`.link-btn`** → **`--radius-md`**; fields **`--radius-sm`**; **no** color tokens; cascade to pills/cards **expected**; manual smoke **recommended before merge**, **not blocking** — **not** final Stitch-level UI |
| **BX-I9B2a** | Complete (**2026-06-03**, commit **`f92cbda`**) | Canvas/shell color token alignment — **`tokens.css`** only; **`--color-bg`** **`#0F172A`**; **`--color-bg-subtle`** / **`--color-bg-auth`** / **`--color-shell-bg`** / **`--color-shell-border`** harmonized; **no** radius or accent-token changes; cascade via **`layout.css`** vars **expected**; manual smoke **recommended before merge**, **not blocking** — **not** final Stitch-level UI |
| **BX-I9B2b** | Complete (**2026-06-03**, commit **`b4d7b93`**) | Primary/cyan color token alignment — **`tokens.css`** only; Stitch **`#3B82F6`** primary + **`#06B6D4`** cyan/data; fill **`#2563EB`** / **`#1D4ED8`** (**not** **`#3B82F6`** on fill); focus/glow/chart tokens harmonized; **no** canvas/shell/AI/violet/danger/radius changes; cascade **expected**; manual smoke **recommended before merge**, **not blocking** — **not** final Stitch-level UI |
| **BX-I9B2c** | Complete (**2026-06-03**, commit **`19d444e`**) | AI/violet color token alignment — **`tokens.css`** + **`components.css`** + **`layout.css`**; Stitch **`#8B5CF6`**; **20** + **3** mechanical lavender replacements; alphas preserved; **Generate** CTA remains primary blue; stale lavender check passed; manual smoke **recommended before merge**, **not blocking** — **not** final Stitch-level UI |
| **BX-I9B2d** | Complete (**2026-06-03**, commit **`ae5cfc8`**) | Danger/error color token alignment — **`tokens.css`** only; Stitch Error / Rose Red **`#E11D48`**; fill **`#be123c`** (**not** **`#e11d48`**); error copy **`#fda4af`** (**not** **`#e11d48`**); course rose accents **unchanged**; stale red check passed; danger/error visual QA **completed** in **BX-I9C** / **BX-I9C-Auth** — **Pass with notes** — **not** final Stitch-level UI |
| **BX-I9C** | Complete (**2026-06-03**) — **Pass with notes** | Final visual QA / smoke audit after **BX-I9B** — **review only**; auth routes + **BX-I9C-Auth** authenticated matrix on **`http://localhost:5173`** at **~375px** / **1280px** / **1440px**; **no** repo file changes; **not** final Stitch-perfect |
| **BX-I9C-Auth** | Complete (**2026-06-03**) — **Pass with notes** | Authenticated visual QA completion for **BX-I9C**; runtime test data in Supabase only (see QA section) |
| **BX-I10A1** | Complete (**2026-06-03**, commit **`e62c1b0`**) | Flashcard study glass polish — **`components.css`** only; **Generate** on material was still primary blue at **BX-I10A1** time; **BX-I10A1-SMOKE** **Pass with notes** |
| **BX-I10A2** | Complete (**2026-06-03**, commit **`b90108e`**) | Material-only AI Generate gradient — **`components.css`** only; scoped selector on material **Generate study plan**; global **`.btn--primary`** unchanged; behavior/API/copy unchanged; Supervisor **Approve with notes**; Security **Pass with notes**; **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed; **BX-I10A2-SMOKE** **Pass with notes** |
| **BX-I10A3** | Complete (**2026-06-03**, commit **`cb54ec5`**) | Filter-toolbar / command-surface glass unification — **`layout.css`** only; global **`.filter-toolbar`** + segmented inset glass; shared filter-empty strips; empty-state downgrades neutralized; behavior/API unchanged; Supervisor **Approve with notes**; Security **Pass with notes**; **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed; **BX-I10A3-SMOKE** **Pass with notes** |
| **BX-I10A5** | Complete (**2026-06-03**, commit **`38aa561`**) | Targeted glass/elevation pass — **`components.css`** + **`layout.css`** only; softened navigable-card hover; quiet inline glass on tasks/flashcards/Trello/course workspace panels; optional Trello picker + Focus outer panel polish; **`prefers-reduced-motion`** safe; **BX-I10A1**–**BX-I10A4** + dashboard hero + material cockpit + editor elevation held; Supervisor **Pass with notes**; Security **Pass with notes**; **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed; **BX-I10A5-SMOKE** **Pass with notes** |
| **BX-I10A4** | Complete (**2026-06-03**, commit **`7e5e61f`**) | Course/document accent rail consistency — **`components.css`** + **`layout.css`** only; **6px** course identity rails; course detail intro **4px** inset; materials primary **4px** top rule; **3px** muted document-shelf hint with **`color-mix`**; **no** JSX/**`StudyMaterialDetail.jsx`**/**`tokens.css`**/backend/package changes; **BX-I10A1**–**BX-I10A3** + material cockpit regressions held; Supervisor **Approve with notes**; Security **Pass with notes**; **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed; **BX-I10A4-SMOKE** **Pass with notes** |
| **BX-I8E** | Complete (**2026-06-03**, commit **`52b7b78`**) | Shared controls / card surfaces — **`components.css`** only; **`.form-card`** baseline glass-border + raised gradient; **`.source-card`** baseline glass-border; **`.link-btn`** / **`.alert--success`** parity; **`layout.css`** / **`tokens.css`** / **`base.css`** untouched at **BX-I8E** time (radius updated in **BX-I9B1**); optional scope **not implemented**; Visual Style Guide v2.2 check **passed**; manual smoke **recommended before merge**, **not blocking** — **not** final Stitch-level UI |
| **BX-I8D** | Complete (**2026-06-03**, commit **`51cdc77`**) | Motion micro-pass — **`components.css`** + **`base.css`** only; processing pulse on **`.ai-panel__loading--active .loading`** during real generate; one-shot **`plan-fade-in`** on success/preview/**`.focus-done`**; **`prefers-reduced-motion`** disables pulse/entrances/press transforms; **375px** stacked; **BX-I7** / **BX-I8B** / **BX-I8C** layouts preserved; **no** JSX/JS/API/backend/routes/tokens/behavior/copy/**`aria-live`** changes; manual smoke **recommended before merge**, **not blocking** — **not** final Stitch-level UI |
| **B4-A** | Complete (**2026-06-02**) | Tasks page body polish — task command surface / command band, filter toolbar framing, semantic **`ul > li`** task list, native status filter **`aria-pressed`** (**B4-A-F1**) — **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`layout.css`** only |
| **B4-B** | Complete (**2026-06-02**) | Flashcards page body polish — flashcards command surface / command band, filters/create/study/manage framing, scoped wrappers, manage list readability, filter **`role="group"`** — **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`layout.css`** only |
| **B4-C** | Complete (**2026-06-02**) | Trello page body polish — Trello integration command surface / command band, step framing, page loading/error wrappers, results zone, **B4-C-F1** courses error scope — **`TrelloSyncPage.jsx`**, **`components/trello/*`**, **`layout.css`** only |
| **B4-D** | Complete (**2026-06-02**) | Admin page body polish — **`admin-workspace`**, admin command/read surface / command band, stat-band hierarchy, page wrappers, trust note, forbidden-card polish, **Backend status** title — **`AdminDashboardPage.jsx`**, **`layout.css`** only |
| **B4-E** | Complete (**2026-06-02**) | Focus page body polish — **`focus-workspace`** session deck / command band, task context, timer panel, action area, loading/error/done wrappers, a11y timer panel fix — **`FocusPage.jsx`**, **`layout.css`** only |
| **B4-F1** | Complete (**2026-06-02**) | Shared state primitives CSS polish — **`.loading`**, **`.empty-state`**, **`.alert`** / **`.alert--error`**, **`.protected-loading`** glass/dark UI — **`components.css`** only |
| **B4-F2** | Complete (**2026-06-02**) | Route state surface framing — Dashboard/Courses loading/error wrappers; CourseDetail/StudyMaterialDetail early-return loading/error/not-found wrappers; neutral not-found decks; wrapped **Try again** action rows — **`DashboardStub.jsx`**, **`CoursesList.jsx`**, **`CourseDetail.jsx`**, **`StudyMaterialDetail.jsx`**, **`layout.css`** only |
| **B4-F3A** | Complete (**2026-06-02**) | Secondary in-page state surfaces — CourseDetail materials loading/error/empty; course tasks filter-empty; material flashcards library states; material cockpit plan/history error blocks — **`layout.css`** only |
| **B4-F3B** | Complete (**2026-06-02**) | State surface wrapper hooks — explicit wrapper classNames + **B4-F3A** selector migration; six wrappers on course materials/tasks filter-empty/flashcards loading — **`CourseDetail.jsx`**, **`CourseTasksSection.jsx`**, **`DbFlashcardsSection.jsx`**, **`layout.css`** only |
| **B4-F3C1** | Complete (**2026-06-02**) | **TrelloTaskSelector** empty-state bug fix — removed invalid **`EmptyState`** **`message`** prop; plain **`<p role="status">`** with existing classes and preserved copy — **`TrelloTaskSelector.jsx`** only |
| **B4-F3C2** | Complete (**2026-06-02**) | AI processing lane **`aria-live`** cleanup — removed duplicate outer **`aria-live`** on **`ai-panel__loading--active`**; **`LoadingState`** single polite live region for **Processing with AI…** — **`StudyMaterialDetail.jsx`** only |
| **B4-F3C3** | Complete (**2026-06-02**) | **GeneratedPlanHistory** preview **`aria-live`** cleanup — removed wrapper **`aria-live`**; loading **`<p>`** has **`role="status"`** + **`aria-live="polite"`**; success snippet + meta not live-announced — **`GeneratedPlanHistorySection.jsx`** only |

**UI polish status:** **Complete** through **B4-F3C3**, **BX-I7B**, **BX-I7C**, **BX-I7D Tier 1**, **BX-I7E1**, **BX-I7E2**, **BX-I7E3 Tier A**, **BX-I7E4**, **BX-I7F**, **BX-I8B**, **BX-I8C**, **BX-I8D**, **BX-I8E**, **BX-I9B1**, **BX-I9B2a**, **BX-I9B2b**, **BX-I9B2c**, **BX-I9B2d**, **BX-I9C** / **BX-I9C-Auth** visual QA (**Pass with notes**, **review only**), **BX-I10A1** flashcard study glass polish (commit **`e62c1b0`**), **BX-I10A2** material-only AI Generate gradient (commit **`b90108e`**), **BX-I10A3** filter-toolbar glass unification (commit **`cb54ec5`**), **BX-I10A4** course/document accent rails (commit **`7e5e61f`**), and **BX-I10A5** targeted glass/elevation pass (commit **`38aa561`**) (after **B3**). **BX-I10A6-QA** and **ROADMAP-A1** are **proposed**, **not started**, **not automatic**. Optional material editor/library elevation alignment and global shadow/token cleanup are **proposed**, **not started**, **not automatic**. **BX-I7** desktop layout sequence **complete**. **B4-F3A** / **B4-F3B** / **B4-F3C** all **complete**. **BX-I7B** (commit **`00d3255`**) widened global cockpit/shell to **1280px** — **foundation only**. **BX-I7C** (commit **`583922d`**) expanded dashboard desktop grid in **`layout.css`** only — improves Dashboard density at **≥1280px**; **not** final Stitch-level UI. **BX-I7D Tier 1** (commit **`52c68ab`**) expanded courses/course detail desktop shelves in **`layout.css`** only — **`/courses`** 3-column + **`/courses/:id`** 2-column at **≥1280px**; **Tier 2** **not implemented**; **not** final Stitch-level UI. **BX-I7E1** (commit **`d0db43e`**) expanded **`/tasks`** desktop panels in **`layout.css`** only — horizontal command-controls band + **2-column** populated task list at **≥1280px**; **not** final Stitch-level UI. **BX-I7E2** (commit **`b18304c`**) expanded **`/flashcards`** desktop panels in **`layout.css`** only — horizontal command-controls band + **study \| manage** **2-column** populated library + **2-column** manage list at **≥1280px**; manage list still does not expose answers; **not** final Stitch-level UI. **BX-I7E3 Tier A** (commit **`cba6dde`**) expanded **`/trello`** desktop setup panels in **`layout.css`** only — Step 1 credentials + Step 2 destination side-by-side at **≥1280px**; tasks/messages/sync full-width; results below command band; **Tier B not implemented**; **not** final Stitch-level UI. **BX-I7E4** (commit **`467ccd9`**) expanded **`/admin`** desktop stats deck in **`layout.css`** only — stats deck **2-column** grid at **≥1280px**; Platform overview, Trello today, Backend status full-width; Tasks|Focus and Learning|Trello stats rows side-by-side; inner stat grids unchanged; **no** JSX/API/backend/services/auth/copy changes; **not** final Stitch-level UI. **BX-I7F** (commit **`25988dc`**) expanded **`/study-materials/:materialId`** material cockpit desktop pass in **`layout.css`** only — cockpit **1.15fr \| 0.85fr**, library **study \| manage** **2-column**, manage list **2-column**, create/edit full-width at **≥1280px**; **`/flashcards`** unaffected; **not** final Stitch-level UI. **BX-I8B** (commit **`bda2645`**) polished material-detail AI command surfaces in **`components.css`** + **`layout.css`** only — stronger violet/glass on AI command column; **Generate** CTA remains primary blue; **375px** stacked; **BX-I7F** layout preserved; **no** tokens/JSX/API/behavior changes; **not** final Stitch-level UI. **BX-I8C** (commit **`8008dc1`**) polished auth **`.page--auth .form-card`** and intro **`PageHeader`** (**`.page-header--intro`**) in **`components.css`** + **`layout.css`** only — glass/command-center card chrome, intro band + top gradient rule, course accent header preserved; **375px** stacked; **BX-I7** / **BX-I8B** layouts preserved; **no** `tokens.css` / **`base.css`** / JSX / API / auth behavior / copy / logging changes; **not** final Stitch-level UI. **BX-I8D** (commit **`51cdc77`**) added scoped motion in **`components.css`** + **`base.css`** only — processing pulse on real AI Processing Lane, one-shot success/preview/focus-done entrances, **`prefers-reduced-motion`** guards; **no** JSX/JS/API/backend/routes/tokens/behavior/copy/**`aria-live`** changes; manual smoke **recommended before merge**, **not blocking**; **not** final Stitch-level UI. **BX-I7** desktop layout sequence **complete** — UI improved but **not** claimed as final Stitch-perfect product. Next likely **BX-I8E** Global controls / card shape alignment **proposed**, **not started**, **not automatic**. Optional **BX-I7E3 Tier B** **not implemented**; optional **BX-I7D Tier 2** requires separate planning + explicit approval. **Phase B4** remaining global styling rollout and remaining **BX-I6** work (sidebar, chart UI, chart APIs, backend/API extension **in code**) are **not started**; each requires separate planning and explicit human approval after Supervisor Review. **BX-I1** codified Stitch direction in **`DESIGN.md` v2.3**; **BX-I2** shipped the token foundation in **`tokens.css`**; **BX-I3** shipped the dashboard decision layout; **BX-I4** wired deterministic course accents; **BX-I5** polished the material detail cockpit; **BX-I6B** upgraded **`/dashboard`** presentation; **BX-I6C** aligned **`/courses`** and **`/courses/:id`** presentation; **BX-I6D** polished global **`AppShell`** chrome; **B4-A** polished **`/tasks`** page body; **B4-B** polished **`/flashcards`** page body; **B4-C** polished **`/trello`** page body; **B4-D** polished **`/admin`** page body; **B4-E** polished **`/focus/:taskId`** page body; **B4-F1** polished shared state primitives in **`components.css`**; **B4-F2** framed route-level loading/error/not-found states on dashboard, courses, course detail, and study material detail; **B4-F3A** polished secondary in-page state surfaces; **B4-F3C1** fixed **TrelloTaskSelector** zero-tasks empty state. Design screenshots under `docs/design/screenshots/` may predate **8C** / **12A-1** / **B1–B3** / **BX-I2** / **BX-I3** / **BX-I4** / **BX-I5** / **BX-I6B** / **BX-I6C** / **BX-I6D** / **B4-A** / **B4-B** / **B4-C** / **B4-D** / **B4-E** / **B4-F1** / **B4-F2** / **B4-F3A** / **B4-F3C1** visuals.

---

## Frontend routes (implemented)

All routes below match `frontend/src/App.jsx`. Protected workspace routes render inside **`AppShell`** (**8C-1** + **BX-I6D** chrome) except auth pages.

| Route | Shell | Purpose |
|-------|-------|---------|
| `/`, `/register` | No (auth pages) | Login / register |
| `/dashboard` | Yes | **Student dashboard cockpit** — real user-owned stats from **`GET /api/dashboard/stats`** (**5B** + **5C** + **5C.1** + **BX-I3** decision layout + **BX-I4** course workload row accents + **BX-I6B** command-center presentation + **BX-I7C** desktop grid at **≥1280px**); read-only; rule-based **“What should I study next?”** flagship hero; Study pulse cockpit band (Pending/Completed/Total + progress bars); course workload command deck; tertiary **At a glance** stat bands; fetch on mount + **Try again** + **Refresh stats**; silent refresh when mounted after stat-changing actions elsewhere; presentation **8C-2A** + **B2** cockpit width + **B3** stat tiles + **BX-I3** + **BX-I6B** + **BX-I7C** (**`layout.css`** grid only) |
| `/admin` | Yes | **Admin aggregate dashboard** — platform-wide stats from **`GET /api/admin/stats`** (**6A-2** + **6A-3**); **`ProtectedRoute` → `AppShell` → `AdminRoute` → `AdminDashboardPage`**; read-only; aggregate counts only — **no** logs, user list, or role management; presentation upgraded **8C-3D** + **B4-D** admin command/read surface / command band, stat-band hierarchy, page wrappers, trust note, forbidden-card polish, **Backend status** label, **narrow responsive browser viewport ~375px** scoped CSS + **BX-I7E4** desktop stats deck at **≥1280px** (stats deck **2-column** grid; Platform overview, Trello today, Backend status full-width; Tasks|Focus and Learning|Trello stats rows side-by-side; inner stat grids unchanged — **`layout.css`** only) — **B4-D** changed **`AdminDashboardPage.jsx`** + scoped **`layout.css`** only (**no** **`AdminRoute.jsx`**, **`App.jsx`**, **`AppShell`**, or **`admin.service.js`** changes); **Admin** also in **`AppShell`** nav when **`user?.role === 'admin'`** (UX only) |
| `/courses` | Yes | Course list + create; presentation upgraded **8C-2A** + **BX-I4** deterministic accent rail/pill on **`CourseCard`** + **BX-I6C** subject shelf (`courses-shelf--deck`, semantic **`ul > li > article`**, glass create form, empty wrapper) + **BX-I7D Tier 1** desktop **3-column** course shelf at **≥1280px** (**`layout.css`** only) |
| `/courses/:id` | Yes | **Course workspace** — materials list/create, **manual study tasks** (status + **study material** filters, create, edit pending, material link/unlink, complete, delete — material filter **TASK-MATERIAL-FILTERS-A2**); presentation upgraded **8C-2A** + **BX-I4** header accent + **BX-I6C** subject workspace (materials primary zone, document shelf deck, honest material count subtitle, tasks/danger framing) + **BX-I7D Tier 1** desktop **2-column** document/material shelf at **≥1280px** when populated (**`layout.css`** only); tasks remain below materials |
| `/tasks` | Yes | **All study tasks** — course + status + **study material** filters (material filter only when a specific course is selected — **TASK-MATERIAL-FILTERS-A2**), create, edit pending, complete, delete, **Start Focus**; **`TaskCard`** material **`Link`** to **`/study-materials/:materialId`** when `task.materialId` set (**TASK-MATERIAL-LINKS-A1**); presentation upgraded **8C-3A** + **B4-A** task command surface / command band, filter toolbar framing, semantic **`ul > li`** task list, native status filter **`aria-pressed`** (**B4-A-F1**), scoped empty/error/loading wrappers + **BX-I7E1** desktop panels at **≥1280px** (horizontal command-controls band, **2-column** populated task list, create FormCard full-width, inline edit intended full width via **`:has(.task-workspace__edit-card)`** — **`layout.css`** only) |
| `/flashcards` | Yes | **All saved flashcards** — filters, create, study, edit/delete, **Known/Unknown review on saved DB cards** (**FLASHCARD-REVIEW-A2**); presentation upgraded **8C-3B** + **B4-B** flashcards command surface / command band, filters/create/study/manage framing, scoped loading/error/empty/filter-empty/action-error wrappers, manage list readability (truncated questions only — answers not exposed in manage list), filter **`role="group"`** + **`aria-label="Filter saved flashcards"`**, **narrow responsive browser viewport ~375px** scoped CSS + **BX-I7E2** desktop panels at **≥1280px** (horizontal command-controls band, **study \| manage** **2-column** populated library, **2-column** manage list when populated, create/inline edit full-width — **`layout.css`** only) |
| `/trello` | Yes | **Trello account connection** (**A4-FRONTEND**): Connect/Disconnect panel; protected **`/trello/connect/callback`**. **Sync UI (A5B):** when **connected**, boards/lists/sync use stored backend token — frontend POST bodies **`{}`** / **`{ listId, taskIds }`** only; manual credential inputs hidden. When **disconnected**, Connect prompt + collapsed **Advanced manual credentials** fallback (ephemeral apiKey/token per session). **A5C (backend):** connected users sending manual `{ apiKey, token }` receive **`TRELLO_MANUAL_CREDENTIALS_NOT_ALLOWED`** / **400** — must disconnect before manual fallback. **Load boards** → board/list picker (**4B-2**); task selection (max 50); sync via backend only; **no** direct `api.trello.com`. Presentation: **8C-3C** + **B4-C** + **BX-I7E3 Tier A** at **≥1280px** |
| `/trello/connect/callback` | Yes | OAuth callback (**A4-FRONTEND**) — protected; reads `state` from query, `token` from hash; clears URL before `POST /api/trello/connect/complete`; redirects to **`/trello`** with flash |
| `/focus/:taskId` | Yes | **Focus session** — auto-start **`POST /api/focus`**; **25**-minute display countdown; complete **`POST /api/focus/:sessionId/complete`**; explicit **Complete session** + optional **Mark task as complete**; presentation upgraded **8C-3A** + **B4-E** **`focus-workspace`** session deck / command band, task context, timer panel, action area, loading/error/done wrappers, static timer **`aria-label`**, active panel **without** per-second **`aria-live`** — **B4-E** changed **`FocusPage.jsx`** + scoped **`layout.css`** only (**no** **`focus.service.js`**, **`TaskCard`**, timer/session logic, or route changes) |
| `/study-materials/:materialId` | Yes | **Study material workspace** — Source \| AI cockpit (**12A-1** + **BX-I5** visual polish + **BX-I7F** desktop pass at **≥1280px** + **BX-I8B** AI command surfaces violet/glass polish — **`components.css`** + **`layout.css`** only: stronger AI command column treatment; **Generate** CTA remains primary blue; **375px** stacked; **BX-I7F** layout preserved); edit content, **generate** (body **`{}`**), load/clear **active** plan, **plan history** (metadata list, lazy preview, restore, delete inactive — **11A-3**), import plan tasks/flashcards, saved DB flashcards CRUD + study + **Known/Unknown review** (**FLASHCARD-REVIEW-A2**), generated-plan flashcard study (plan JSON — **no** review); AI zones **8C-2B** + **B1**–**B3** + **BX-I5** + **BX-I8B** polish |

**Not implemented:** `/courses/:id/generate` (course-level paste-generate — deferred).

---

## Deferred / not started (requires separate approval)

- **BX-I7D Tier 2** — optional materials | tasks side-by-side **`.course-workspace`** full-page grid. **Proposed**; **not started**; requires explicit approval
- **BX-I7E3 Tier B** — optional Trello desktop Tier B (2-column task list, results grid, wizard/results side-by-side, scroll-height override). **Proposed**; **not started**; requires explicit approval
- **Backend task filtering by `materialId`** — **`GET /api/tasks?materialId=`** and **`GET /api/courses/:id/tasks?materialId=`** (frontend-only material filter shipped in **TASK-MATERIAL-FILTERS-A2** — filters already-loaded tasks in memory; **no** backend query params added); **URL-persisted** task filters; filter for tasks **without** a material link; **bulk create** flashcards; **AI/Gemini** flashcard generation on `/flashcards`; **plan import** on **`/flashcards`** (global page); **course-level** flashcard management; **full SRS scheduling**; backend **`GET /api/flashcards?mastery=`**; **`next_review_at`**; SM-2 / Anki; review history table; dashboard due cards (**FLASHCARD-REVIEW-A4** and related — not shipped); pagination/rate limiting; **URL-persisted** flashcard filters (in-memory course/material/review-state filters shipped in **3B-f** + **FLASHCARD-REVIEW-A3** — client-side only); optional shared CRUD form extraction; link from `/courses` to `/flashcards` ( **`public.flashcards` table + RLS** in **3B-b**; **backend API** in **3B-c** + review in **FLASHCARD-REVIEW-A1**; **Known/Unknown UI** in **FLASHCARD-REVIEW-A2**; **review-state filter** in **FLASHCARD-REVIEW-A3**; **material-detail** in **3B-d**–**3B-e** + **plan import dedupe** in **10B**; **global page** in **3B-f**–**3B-g**; **plan JSON study** in **3B-a**; **plan tasks** import in **3A-f** superseded by **10B**); edit **completed** tasks or mark incomplete (pending-only edit shipped in **3A-c.1**); in-memory status/course/material task filters (**3A-c.2** / **3A-d** / **3A-e** / **TASK-MATERIAL-FILTERS-A2**) are **not** URL-persisted
- Saved generated **plan library** beyond material-scoped history (DB retains up to **10** rows per material with one **active** since **11A-1**; history REST APIs in **11A-2**; material-detail history UI in **11A-3** — metadata list, lazy preview, restore, delete inactive)
- Course-level `POST /api/courses/:courseId/generate` with client `studyText` (PRD-style paste on course page)
- Trello **post-A6 (still deferred):** Trello card **update/delete**; **force re-sync**. **A2–A6 complete:** encrypted storage, backend connect, signed state, Connect/Disconnect UI + callback, backend stored-token mode, frontend connected-account sync UX, backend manual-credential hardening while connected, board/list persistence
- **Dashboard polling / WebSockets / cross-tab sync / visibility refetch** — **5C.1** ships invalidation-only manual/cross-page refresh only (PRD §12.5 intent); **no** polling, WebSockets, **`BroadcastChannel`**, or browser storage sync
- **`api_logs`** table and **`GET /api/admin/logs`**; admin **user list** / **role management** UI; Gemini/system error metrics for admin dashboard (deferred — no **`api_logs`** table; **`/admin`** ships **aggregate stats UI only** — **`GET /api/admin/access-check`** + **`GET /api/admin/stats`**)
- Production deployment strategy; observability / APM; payments
- **PDF upload/parsing** — deferred: adds file **storage** cost, a **parsing** pipeline, **size/malware validation**, broader **Security Review** surface, and ongoing cost; **paste-text** study materials remain the MVP path
- Real-time dashboard (polling / WebSockets / cross-tab sync); spaced repetition; **full SRS** / SM-2/Anki scheduling, **`next_review_at`**, backend mastery query params, review history table, dashboard due cards (**FLASHCARD-REVIEW-A4** and related — not shipped) — **aggregate review state + Known/Unknown UI + client-side review-state filter shipped** in **FLASHCARD-REVIEW-A1** + **FLASHCARD-REVIEW-A2** + **FLASHCARD-REVIEW-A3** (`POST /api/flashcards/:flashcardId/review`, migration **013**, saved DB cards only; **not** full SRS; **no** **`next_review_at`**); **Trello stored-token sync (A5A/A5B) and A5C hardening are complete**; see Trello post-A5C deferred items above
- **Phase B4** global visual system rollout — **partial** (**B4-A** tasks **`/tasks`**, **B4-B** **`/flashcards`**, **B4-C** **`/trello`**, **B4-D** **`/admin`**, **B4-E** **`/focus/:taskId`**, **B4-F1** shared primitives polish, **B4-F2** route state framing, **B4-F3A** secondary in-page state surfaces, **B4-F3B** state surface wrapper hooks, **B4-F3C1** **TrelloTaskSelector** empty-state fix, **B4-F3C2** AI lane **`aria-live`** cleanup, and **B4-F3C3** **GeneratedPlanHistory** preview **`aria-live`** cleanup **complete** — commits **`4ae80ee`**, **`f91415d`**, **`cf50729`**, **`905ee4d`**, **`7f4bf6b`**, **`ea8a899`**, **`ee50b8e`**, **`596e869`**, **`ee5357f`**, **`d0393d7`**, **`d1a3c69`**, **`ab28307`**). Remaining **B4** work **not started** — each requires explicit `approved — implement Phase X` after Supervisor Review. **Phases 8A–8C**, **12A-1**, **B1**–**B3**, **BX-I2**, **BX-I3**, **BX-I4**, **BX-I5**, **BX-I6B**, **BX-I6C**, **BX-I6D**, **B4-A**, **B4-B**, **B4-C**, **B4-D**, **B4-E**, **B4-F1**, **B4-F2**, **B4-F3A**, **B4-F3B**, **B4-F3C1**, **B4-F3C2**, and **B4-F3C3** are **complete**; **B4-F3A** / **B4-F3B** / **B4-F3C** all **complete** — dark graphite / glass token foundation in **`tokens.css`**; rule-based dashboard decision layout + command-center presentation in **`DashboardStub.jsx`** (**BX-I3** + **BX-I6B**); deterministic course accents on list/detail/dashboard (**BX-I4**); material detail cockpit visual polish (**BX-I5**); courses / course-detail visual alignment (**BX-I6C**); global **`AppShell`** shell chrome (**BX-I6D**, **`layout.css`** only); tasks page body polish (**B4-A**, three approved frontend files on **`/tasks`** only); flashcards page body polish (**B4-B**, three approved frontend files on **`/flashcards`** only); Trello page body polish (**B4-C**, seven approved frontend files on **`/trello`** only); admin page body polish (**B4-D**, two approved frontend files on **`/admin`** only); route state framing (**B4-F2**, five approved frontend files); remaining **BX-I6** / **B4** work (sidebar, chart UI, chart APIs, backend/API extension **in code**) is **not started** — requires separate planning and explicit approval each
- Further **UI styling** beyond **BX-I7** desktop layout sequence (**BX-I7B** through **BX-I7F** complete — UI improved but **not** final Stitch-perfect product; optional **BX-I7D Tier 2** / **BX-I7E3 Tier B**, charts, sidebar, course accents on material detail) requires explicit human approval — **`DESIGN.md` v2.3** direction for charts/sidebar/material accents is **not built** until separately gated phases; optional **BX-I7D Tier 2** / **BX-I7E3 Tier B**, remaining **B4**, or **BX-I6** phases; **`11-generated-plan-visible.png`** **captured** (Phase 2K-c); **`15-processing-with-ai.png`** still **pending** (see `docs/design/SCREENSHOT_INDEX.md`; committed PNGs may predate **8C** / **12A-1** / **B1–B3** / **BX-I2** / **BX-I3** / **BX-I4** / **BX-I5** / **BX-I6B** / **BX-I6C** / **BX-I6D** / **BX-I7B** / **BX-I7C** / **BX-I7D Tier 1** / **BX-I7E1** / **BX-I7E2** / **B4-A** / **B4-B** / **B4-C** / **B4-D** / **B4-E** / **B4-F1** / **B4-F2** / **B4-F3A** / **B4-F3C1** / **B4-F3C2** — **`03-dashboard.png`** is a **pre-5C/pre-8C/pre-BX-I3/pre-BX-I4/pre-BX-I6B** reference)
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
