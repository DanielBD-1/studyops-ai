# Current State — StudyOps AI

**Purpose:** Short starting point for the owner and for agents. Read this first, then drill into linked docs.

**Last updated:** 2026-06-02 (Phase **B4-B** — flashcards page body polish documentation housekeeping; prior **B4-A**)

---

## Product platform (web only)

**StudyOps AI is a browser-based web application only.** It is **not** a mobile app, native mobile app, Android/iOS app, phone app, app-store product, or mobile-first/native product.

- **In scope:** The same React web app in desktop and mobile **browsers**; **responsive web layout** at narrow browser widths.
- **375px QA:** References to **~375px** width in recent phases and follow-up QA mean **narrow responsive browser viewport** / **small viewport web layout** testing — **not** mobile-app product scope.
- **Terminology for agents:** Use **narrow responsive browser layout**, **small viewport web layout**, or **responsive web viewport** — not “mobile app”, “native mobile”, “phone app”, “mobile direction”, “mobile navigation”, “bottom tabs”, or “app-store flow”.
- **Stitch / DESIGN:** Visual inspiration for the **web UI only** — does not approve native mobile work, sidebar implementation (unless separately approved), or mobile-specific navigation / app-store patterns.
- **BX-I6 / B4:** Future visual phases must **not** expand scope into mobile/native/app-store products without explicit human approval.

---

## Current stable state

StudyOps AI is a **functional MVP web app**: React frontend → Express backend → document-service (Gemini) → Supabase Auth + Postgres. CI runs lint, tests, and frontend build on Node.js 22.

**Production UI today:** Dark graphite / glass token foundation from `frontend/src/styles/tokens.css` (Phase **BX-I2**, commit **`03ee9df`**) — electric blue primary, violet AI accent, cyan data accent, dark-friendly semantic states, source editor surface, filled-button WCAG AA contrast fix. Global **`AppShell`** top navigation / WEB dashboard chrome polished (**BX-I6D**, commit **`9252ba9`**) — **CSS-only** in **`layout.css`** only: stronger glass shell bar, restrained top accent strip, improved brand/nav active/hover/**`:focus-visible`** styling (active route **not** color-only), labeled **Log out** remains visible on the brand row at **narrow responsive browser viewport ~375px** with horizontal nav scroll (WEB top-nav row — **no** bottom tabs, drawer, hamburger-first, or phone-style UI); **`prefers-reduced-motion`** for shell transitions; **no** `AppShell.jsx`, auth, route guards, route fade, page transitions, or `useLocation` animation. Cockpit layouts, Source | AI material detail (**12A-1** + **BX-I5** visual polish, commit **`c2288d4`**), generated plan history (**11A-3**), dashboard **AI Study Command Center** presentation (**BX-I6B**, commit **`cceb4e0`**) on top of **rule-based** **“What should I study next?”** decision layout (Phase **BX-I3**, commit **`bdd6f2a`**) — uses existing **`GET /api/dashboard/stats`** only; flagship recommendation hero, glass/depth/glow via existing tokens, Study pulse cockpit band with factual Pending/Completed/Total metrics, richer course workload command deck, **At a glance** visually tertiary; **no** `dashboard-recommendation.js` logic changes; **no** fake AI confidence, urgency, priority, health score, or analytics; **no** chart libraries, sidebar, weekly focus chart, or new packages. **Deterministic course accents** (Phase **BX-I4**, commit **`ff65e21`**) — stable **`amber` | `rose` | `emerald`** mapping from existing course ID/name/title only; accent rail/pill on **`CourseCard`**, header accent on **`CourseDetail`**, workload-row accents on **`/dashboard`**; supplementary visual chrome only (**no** health score, priority, urgency, active/quiet state, or AI classification); **no** raw user strings as class names; **no** logging, persistence, backend/API, DB, or package changes. **Material cockpit visual polish** (**BX-I5**, commit **`c2288d4`**) — improved Source | AI hierarchy, darker readable source/editor well, source-type pill from existing **`sourceTypeLabel`**, AI command-column wrapper/dividers, polished generate/active-plan/history surfaces, plan scanability, import toolbar band, history preview inset, flashcards library consistency, responsive polish at existing breakpoints; **frontend/CSS/className-only** — **no** `tokens.css` change, **no** behavior/API/payload change, **no** unsafe rendering (material and plan content remain plain React text). **Courses / course workspace presentation (BX-I6C, commit `6a1e6ad`):** Polished **subject shelf** on **`/courses`** (`courses-shelf--deck`, semantic **`ul > li > article`**, **`source-card--course-shelf`**, glass create form, empty-state wrapper); **subject workspace** on **`/courses/:id`** (subject pill using existing course accent, settings as secondary band, materials as primary glass zone, **`document-shelf--deck`** / **`source-card--document-shelf`**, honest local material count subtitle from already-loaded **`materials.length` only** — hidden during loading/error/empty; not health/progress/coverage/priority/AI); stronger tasks framing and danger-zone separation; **narrow responsive browser viewport ~375px** verified (no horizontal overflow); **no** backend/API/database/package/auth/routes/services changes; **no** `tokens.css`, dashboard, AppShell, or material cockpit changes; **no** chart libraries, sidebar, new packages, or fake course health/priority/urgency/status/AI classification; course accents remain supplementary visual chrome only; cards show titles/metadata only — **no** full material body on list/detail cards.

**Tasks / global task workspace presentation (B4-A, commit `4ae80ee`):** Polished **`/tasks`** page body only — task command surface / command band (`task-workspace__command-band--deck`), improved page hierarchy, filter toolbar visual framing, create/list/empty/error/loading wrappers, scoped empty/error/list visual treatment; semantic **`ul.task-workspace__list > li.task-workspace__list-item > TaskCard` article or FormCard section**; status filters use native **`<button type="button">`** with **`aria-pressed`** on the real DOM button (**B4-A-F1** — fixes prior issue where **`Button.jsx`** did not forward **`aria-pressed`**); selected status filter **not** color-only; **“Task command”** is approved UI framing only — **not** an AI/automation claim; **`task.priority`** remains API-backed only; **narrow responsive browser viewport ~375px** scoped CSS support; **frontend presentation-only** in **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`layout.css`** only; **no** backend/API/database/package/auth/routes/services changes; **no** `tokens.css` or **`components.css`** changes; **no** task CRUD/filter/validation/**Focus** navigation/**`refreshStats`** behavior changes; **no** AppShell, dashboard, courses, course detail, material cockpit, flashcards, Trello, admin, or focus page changes; **no** fake AI/health/urgency/status/priority semantics or new task data exposure.

**Flashcards / global flashcard library presentation (B4-B, commit `f91415d`):** Polished **`/flashcards`** page body only — flashcards command surface / command band (`flashcards-workspace__command-band--deck`), improved page hierarchy, filters/create/study/manage visual framing, page-level loading/error wrappers, scoped loading/error/empty/filter-empty/action-error wrappers, manage list readability (`overflow-wrap` on truncated questions); filter group **`role="group"`** + **`aria-label="Filter saved flashcards"`** on native labeled course/material **`<select>`** elements; **“Flashcard library”** / **“Filter, study, and manage saved cards”** are factual UI framing only — **not** AI/automation claims; manage list still shows **truncated question only** — **no** answers newly exposed in manage list; full answers remain in existing study reveal (**`FlashcardStudy`**) and edit flows only; **`actionError`** moved outside **`FormCard`** into **`flashcards-workspace__action-error`** — presentation-only, still **`ErrorMessage`** / **`role="alert"`**; delete confirmation and destructive action clarity **unchanged**; **narrow responsive browser viewport ~375px** scoped CSS in **`layout.css`** only — **not** phone/native UI; **frontend presentation-only** in **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`layout.css`** only; **no** backend/API/database/package/auth/routes/services changes; **no** `FlashcardStudy.jsx`, **`DbFlashcardsSection.jsx`**, **`components.css`**, or **`tokens.css`** changes; **no** flashcard business logic / generated plan logic / create/edit/delete/study/reveal behavior changes; **no** AppShell, dashboard, courses, course detail, tasks, material cockpit, Trello, admin, or focus page changes; **no** fake AI/mastery/progress/health/priority/urgency/status semantics; **no** token/session/user/flashcard logging.

**Not live:** chart UI, sidebar shell, course accents on material detail, **B4-C** Trello page body polish, admin/focus/shared-state page body polish, remaining **B4** global styling rollout beyond **B4-A** + **B4-B** — require separate planning and explicit approval.

**Branch (as of B4-B docs):** post-**B4-B** (commit **`f91415d`**)

---

## Current phase

| Phase | Status | Notes |
|-------|--------|-------|
| **DOCS-WEB-ONLY** | **Complete** | Product scope clarification — StudyOps is **web-only**; 375px = responsive browser viewport; agent terminology; Stitch = web UI reference only. **Documentation only.** |
| **DOCS-A1** | **Complete** | Source-of-truth cleanup (CURRENT_STATE, AGENT_MEMORY, PRD clarifications). |
| **DOCS-A2** | **Complete** | Documentation reality-check audit only — no file changes. |
| **DOCS-A3** | **Complete** | Closed DOCS-A2 gaps in **`IMPLEMENTATION_STATUS`** + phase pointers. **Documentation only.** |
| **BX-I1** | **Complete** | Stitch visual direction in `DESIGN.md` v2.3 (commit **`6041932`**) — **docs only**. |
| **BX-I2** | **Complete** | Dark graphite / glass global token foundation — **CSS-only** (commit **`03ee9df`**); **`tokens.css`**, **`components.css`**, **`layout.css`** only. Supervisor Review **approved with notes**; Security Review **approved with limitation** (authenticated visual QA deferred — no local test account). |
| **BX-I3** | **Complete** | Dashboard decision layout — **frontend-only** (commit **`bdd6f2a`**); rule-based **“What should I study next?”** hero, study pulse / task progress bars, enhanced course workload rows, secondary **At a glance** stat bands; **`GET /api/dashboard/stats`** only; **14** recommendation unit tests (**219/219** total). Supervisor Review **approved with notes**; Security / Trust Review **approved with limitation** (authenticated dashboard manual smoke not fully completed — no approved local test account). |
| **BX-I4** | **Complete** | Deterministic course accents — **frontend-only** (commit **`ff65e21`**); seven approved files only; stable **`amber` | `rose` | `emerald`** mapping from existing course ID/name/title; **`CourseCard`** rail/pill, **`CourseDetail`** header, dashboard workload rows; enum-only accent keys — **no** raw user strings as class names; **no** logging, persistence, backend/API, DB, or package changes; accents are supplementary chrome only (**no** health score, priority, urgency, active/quiet state, or AI classification). **228/228** tests. Supervisor Review **approved with notes**; Security / Trust Review **approved** (authenticated visual QA not fully completed — no approved valid local test account). |
| **BX-I5** | **Complete** | Material cockpit visual polish — **frontend-only** (commit **`c2288d4`**); five approved files only on **`/study-materials/:materialId`**; improved Source \| AI hierarchy, darker source/editor well, source-type pill, AI command-column surfaces, plan/history/import/flashcards library polish, responsive breakpoints; **no** `tokens.css`, backend/API/database/package/auth/routes/services, behavior, or payload changes; **no** unsafe rendering (`dangerouslySetInnerHTML`, `innerHTML`, markdown renderer — material and plan content remain plain React text). **228/228** tests. Supervisor Review **approved with notes**; Security / Trust Review **PASS** (authenticated manual smoke / visual QA **not completed** — no approved valid local test account). |
| **BX-I6B** | **Complete** | Dashboard visual upgrade / AI Study Command Center presentation — **frontend-only** (commit **`cceb4e0`**); three approved files only on **`/dashboard`**: **`DashboardStub.jsx`**, **`layout.css`**, **`components.css`**; flagship recommendation hero, glass/depth/glow (existing tokens), Study pulse cockpit band (Pending/Completed/Total from stats), richer course workload deck, **At a glance** tertiary; **narrow responsive browser viewport ~375px** — no mid-word stat label breaks, no horizontal overflow; reduced-motion for decorative effects; **no** `tokens.css`, backend/API/database/package/auth/routes/services, **`dashboard-recommendation.js`**, **`DashboardContext`**, **`dashboard.service.js`**, chart libraries, sidebar, weekly focus chart, or new packages; **no** fake AI confidence/urgency/priority/health/analytics. **228/228** tests; lint + build passed. Supervisor Review **approved with notes**; Supervisor re-check **approved with notes**; Security / Trust Review **approved with notes**; manual authenticated dashboard smoke **passed**. |
| **BX-I6C** | **Complete** | Courses / course-detail visual alignment — **frontend-only** (commit **`6a1e6ad`**); six approved files only: **`CourseCard.jsx`**, **`MaterialCard.jsx`**, **`CoursesList.jsx`**, **`CourseDetail.jsx`**, **`layout.css`**, **`components.css`**; **`/courses`** subject shelf + create form glass panel + empty wrapper; **`/courses/:id`** subject workspace hierarchy, materials primary zone, document shelf deck, tasks/danger framing; semantic **`ul > li > article`**; honest material count subtitle (**`materials.length`**, no new API); **narrow responsive browser viewport ~375px** — no horizontal overflow; **no** backend/API/database/package/auth/routes/services, `tokens.css`, dashboard, AppShell, or material cockpit changes; **no** chart libraries, sidebar, new packages, or fake health/priority/urgency/status/AI metrics. **228/228** tests; lint + build passed. Supervisor Review **approved with notes**; Security / Trust Review **approved with notes**; manual authenticated smoke **passed** (empty state not smoke-tested). |
| **BX-I6D** | **Complete** | Global shell / top navigation / visual chrome polish — **CSS-only** (commit **`9252ba9`**); **`frontend/src/styles/layout.css`** only; glass WEB dashboard shell bar, accent strip, brand/nav/logout hover and **`:focus-visible`**; active route styling **not** color-only; logout visible and labeled; **narrow responsive browser viewport ~375px** — WEB top-nav horizontal scroll row (**not** phone UI); **no** bottom tabs, drawer, hamburger-first layout; **`prefers-reduced-motion`** for shell transitions; **no** `AppShell.jsx`, `App.jsx`, auth, route guards, route fade, page transitions, `useLocation`, `key={location.pathname}`, tokens/dashboard/course/material page changes, backend/API/database/package changes, or misleading AI/priority/urgency/status copy. **228/228** tests; lint + build passed. Supervisor Review **approved with notes**; Security / Trust Review **approved with notes**; authenticated **375px** shell spot-check **passed with notes** (Flashcards focus near nav edge — minor, non-blocking). |
| **B4-A** | **Complete** | Tasks page body polish — **frontend presentation-only** (commit **`4ae80ee`**); three approved files only: **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`layout.css`** on **`/tasks`** only; task command surface / command band, filter toolbar framing, create/list/empty/error/loading wrappers, semantic **`ul > li`** task list; native status filter buttons with **`aria-pressed`** on real DOM (**B4-A-F1**); selected filter **not** color-only; **narrow responsive browser viewport ~375px** scoped CSS; **no** backend/API/database/package/auth/routes/services, `tokens.css`, **`components.css`**, task CRUD/filter/validation/**Focus**/**`refreshStats`** changes, or other route changes; **no** fake AI/health/urgency/status/priority semantics. **228/228** tests; lint + build passed. Supervisor Review **PASS**; Security / Trust Review **approved with notes**; **B4-A-F1** focused re-check **approved**; authenticated manual smoke **limited** — static review + automated checks passed. |
| **B4-B** | **Complete** | Flashcards page body polish — **frontend presentation-only** (commit **`f91415d`**); three approved files only: **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`layout.css`** on **`/flashcards`** only; flashcards command surface / command band, filters/create/study/manage framing, scoped loading/error/empty/filter-empty/action-error wrappers, manage list readability; filter **`role="group"`** + **`aria-label="Filter saved flashcards"`**; manage list truncated question only — answers not newly exposed; **`actionError`** presentation-only move still **`ErrorMessage`** / **`role="alert"`**; **narrow responsive browser viewport ~375px** scoped CSS; **no** backend/API/database/package/auth/routes/services, `tokens.css`, **`components.css`**, **`FlashcardStudy.jsx`**, **`DbFlashcardsSection.jsx`**, flashcard CRUD/filter/study/reveal/**`refreshStats`** changes, or other route changes; **no** fake AI/mastery/progress/health/priority/urgency/status semantics. **228/228** tests; lint + build passed. Supervisor Review **approved with notes**; Security / Trust Review **approved with notes**; authenticated manual smoke **partial** — populated library, filters, study/reveal, 375px passed; create/edit/delete persistence and filter-empty/global-empty not exercised. |
| **B4** | **Partial** | **B4-A** **`/tasks`** and **B4-B** **`/flashcards`** page body presentation **complete** (commits **`4ae80ee`**, **`f91415d`**); **B4-C** Trello page body polish, admin/focus/shared-state polish, and remaining global styling rollout **not started** — each requires separate planning and explicit approval. |
| **BX-I6** (umbrella) | **Partial** | **BX-I6B**, **BX-I6C**, **BX-I6D**, **B4-A**, and **B4-B** presentation **complete**; sidebar shell, chart UI, chart APIs, Trello/admin/focus page body polish, and backend/API extension **not started** — separate gates each. |

---

## What is implemented

Full detail: **`docs/IMPLEMENTATION_STATUS.md`**.

| Area | Shipped |
|------|---------|
| **Auth** | Register, login, protected routes, profiles + admin role |
| **Courses & materials** | CRUD; material detail editor |
| **AI generate** | Material-scoped `POST …/generate` body `{}`; persisted plan; history (max 10/material); import tasks/flashcards with dedupe (**10B**) |
| **Tasks** | Course + global UI; filters; edit pending; focus link |
| **Flashcards** | Material + global UI; plan study + saved library CRUD |
| **Trello** | Manual credentials; board/list picker; sync (max 50 tasks); audit logs |
| **Focus** | 25-min timer MVP; start/complete |
| **Dashboard** | Aggregate stats; invalidation-only cross-page refresh (**5C.1**); rule-based **“What should I study next?”** decision hero, study pulse / task progress bars, course workload rows (**BX-I3**) |
| **Admin** | Aggregate stats only (`/admin`) — no logs, user list, or role UI |
| **Presentation** | **8C-3D**, **12A-1**, **B1**–**B3**, **BX-I2** (dark glass tokens, shell/cockpit polish, cards/badges), **BX-I4** (deterministic course accents on list/detail/dashboard), **BX-I5** (material detail cockpit visual polish), **BX-I6B** (dashboard command-center visual upgrade), **BX-I6C** (courses / course-detail visual alignment), **BX-I6D** (global shell / top navigation chrome — **`layout.css`** only), **B4-A** (tasks page body / task command surface — **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`layout.css`** only), **B4-B** (flashcards page body / flashcards command surface — **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`layout.css`** only) — detail in **`IMPLEMENTATION_STATUS`** § UI polish |

---

## What is partial

| Item | Built | Missing / deferred |
|------|-------|-------------------|
| **Dashboard** | Decision hero, Study pulse cockpit band, course workload command deck, tertiary **At a glance** (**BX-I3** + **BX-I6B** presentation) | Chart UI, weekly focus buckets, course health / streak / deadline signals (BX-1 direction — docs only; **not** shipped) |
| **Courses** | List/detail/tasks/materials; deterministic per-course accent chrome (**BX-I4**); subject shelf + course workspace visual alignment (**BX-I6C**) | Plan-coverage indicators (docs only); accent persistence in DB (not shipped); `/courses` empty state not manually smoke-tested |
| **Material detail** | Source \| AI cockpit + history + **BX-I2** dark tokens + **BX-I5** visual polish | Course accents on material detail (**not shipped**); authenticated visual QA pending (no test account) |
| **Trello** | Manual sync + picker | OAuth, stored credentials, persistence, card update/delete |
| **Admin** | Platform aggregate counts | Logs, user management, role management, Gemini metrics |
| **Design captures** | 14 Phase 2I PNGs + 3 Stitch refs | `15-processing-with-ai.png` pending; many PNGs predate **8C** / **11A-3** |

---

## What is not started

Requires **explicit human approval** (see `AGENTS.md`, `IMPLEMENTATION_STATUS` deferred list):

- **B4-C** — Trello page body polish (requires separate planning and explicit approval; **B4-A** tasks **`/tasks`** and **B4-B** **`/flashcards`** body polish are **complete** — commits **`4ae80ee`**, **`f91415d`**)
- **B4** (remaining) — admin/focus/shared-state page body polish and remaining global styling rollout beyond **B4-A** + **B4-B** (requires separate planning and explicit approval each)
- **BX-I6** (remaining) — sidebar shell, chart UI, chart APIs, flashcards/Trello/admin/focus page body polish, backend/API extension **in code** (requires separate planning and explicit approval each)
- Sidebar shell migration (Stitch sidebar is reference-only)
- Course-level paste-generate (`POST /api/courses/:courseId/generate`)
- PDF upload/parsing; Trello OAuth; payments; spaced repetition; production deployment
- Dashboard polling / WebSockets / cross-tab sync
- `api_logs` / admin logs UI

---

## Current design direction

**Presentation authority:** `DESIGN.md` (v2.3) — UI/UX only; does **not** change product scope or APIs.

**Live values:** `frontend/src/styles/tokens.css` — authoritative for colors, spacing, shadows in production (dark graphite / glass after **BX-I2**).

**Approved direction (documented, not fully built):**

1. **Phase A / BX-1** — Modern AI study command center; decision-first dashboard; honest chart rules; course accents; strong Source | AI cockpit.
2. **BX-S / BX-I1** — Stitch-selected **dark graphite / glass** reference (`docs/design/STITCH_SELECTED_REFERENCE.md`, `docs/design/STITCH_VISUAL_STYLE_GUIDE.md`, `stitch-*.png`). **Reference only** — do not copy Stitch HTML/React into `frontend/src`.

**MVP navigation:** Top **`AppShell`** bar remains approved; Stitch sidebar mockups are visual reference only.

**Editing `DESIGN.md` does not approve implementation.** Separate gates required for `tokens.css`, frontend/CSS, chart libraries, fonts/CDN, and API extensions.

---

## Next approved / suspended phases

| Phase | Gate |
|-------|------|
| **BX-I2** | **Complete** (commit **`03ee9df`**) — follow-up: authenticated visual QA when a test account exists |
| **BX-I3** | **Complete** (commit **`bdd6f2a`**) — follow-up: authenticated dashboard visual QA when a test account exists (dashboard with data, empty dashboard, hero CTAs, refresh stats, study pulse / progress bars, **narrow responsive browser viewport ~375px**, console check for no token/secret/material-content logs) |
| **BX-I4** | **Complete** (commit **`ff65e21`**) — follow-up: authenticated visual QA when a test account exists (**`/courses`** list, **`/courses/:id`** detail header, **`/dashboard`** course workload rows; same course shows same accent across list/detail/dashboard; **narrow responsive browser viewport ~375px**; keyboard focus on course links/cards; console check for no token/secret/course-data logs) |
| **BX-I5** | **Complete** (commit **`c2288d4`**) — follow-up: authenticated material-detail visual QA when a test account exists (edit/save, unsaved blocks generate, generate/clear/restore/delete history, import tasks/flashcards, saved flashcards study, delete material danger zone, fake UUID/not found, **narrow responsive browser viewport ~375px**, console check for no token/secret/full material content logs) |
| **BX-I6B** | **Complete** (commit **`cceb4e0`**) — dashboard command-center visual upgrade on **`/dashboard`** only; authenticated manual smoke **passed**; known non-blocking: duplicate JSDoc above **`PulseMetric`**, semantic modifier hooks **`dashboard-hero--flagship`** / **`dashboard-study-pulse--cockpit`**, contrast reviewed statically/manual-smoke not lab-measured |
| **BX-I6C** | **Complete** (commit **`6a1e6ad`**) — courses / course-detail visual alignment on **`/courses`** and **`/courses/:id`** only; six approved frontend files; authenticated manual smoke **passed** with notes (`/courses` empty state not smoke-tested; empty-state double framing may be cosmetic follow-up) |
| **BX-I6D** | **Complete** (commit **`9252ba9`**) — global shell / top navigation chrome; **`layout.css`** only; authenticated **375px** shell spot-check **passed with notes** (Flashcards focus near nav edge — minor, non-blocking) |
| **B4-A** | **Complete** (commit **`4ae80ee`**) — tasks page body polish on **`/tasks`** only; three approved frontend files; native status filter **`aria-pressed`** fix (**B4-A-F1**); authenticated manual smoke **limited** — future recommended check: populated **`/tasks`**, filters, create/edit/complete/delete on safe test task, Start Focus, **narrow responsive browser viewport ~375px**, console check |
| **B4-B** | **Complete** (commit **`f91415d`**) — flashcards page body polish on **`/flashcards`** only; three approved frontend files; authenticated manual smoke **partial** — future recommended check: filter-empty/global-empty, create/edit/delete on safe test cards, delete-failure **`actionError`** visibility, **narrow responsive browser viewport ~375px**, console check |
| **B4-C / remaining B4 / remaining BX-I6** | **Not started** — **B4-C** Trello page body polish, admin/focus/shared-state polish, sidebar, chart UI/APIs, and backend/API extension each require separate planning and explicit **`approved — implement Phase X`** |

**Human next step (typical):** Optional authenticated visual QA for **BX-I2**, **BX-I3**, **BX-I4**, **BX-I5**, **B4-A**, and **B4-B** when a valid local test account exists → plan **B4-C**, remaining **B4** / **BX-I6** work (sidebar, chart UI/APIs, Trello/admin/focus page body polish), or other surfaces separately with explicit implement approval. **Do not** start **B4-C**, chart libraries, sidebar shell, dashboard/course/material page changes, or backend/API extension without a separately approved phase. **B4-B** is **complete** — next implementation phase is **not automatic**.

---

## Source-of-truth hierarchy

When documents disagree, resolve in this order:

1. **`docs/IMPLEMENTATION_STATUS.md`** + application code + `supabase/migrations/` — **what is shipped**
2. **`docs/CURRENT_STATE.md`** (this file) — **where we are in phases** and what is suspended
3. **`docs/PRD.md`** — product vision, target MVP, **future / not-yet-built** features
4. **`docs/adrs/*`** — architecture boundaries
5. **`SECURITY.md`** — trust boundaries and Security Review triggers
6. **`AGENTS.md`** / **`docs/workflows/*`** — process and approvals
7. **`docs/AGENT_MEMORY.md`** — historical journal + pitfalls (append-only; must not override 1–4)
8. **`DESIGN.md`** + **`tokens.css`** — presentation (DESIGN = direction; tokens = live values)
9. **Stitch / prototype / screenshots** — inspiration only

Conflict workflow: `docs/workflows/conflict-resolution-workflow.md`

---

## Forbidden assumptions

Do **not** assume without checking **`IMPLEMENTATION_STATUS`** and this file:

| Assumption | Reality |
|------------|---------|
| PRD section describes live behavior | PRD includes **future scope** — verify shipped state |
| `DESIGN.md` or BX-I1 doc update = implement approval | Requires **`approved — implement Phase X`** |
| Stitch exports are production code | **Reference only** — never merge into `frontend/src` |
| Course-level generate with client `studyText` exists | **Deferred** — material-scoped generate with body `{}` only |
| Trello OAuth or stored credentials | **Not implemented** — ephemeral body credentials only |
| Admin logs / user list / role UI | **Not implemented** — aggregate stats only |
| Dashboard charts / sidebar | **Documented direction only** — **not wired in code**; dark token foundation live via **BX-I2**; rule-based decision hero live via **BX-I3** |
| Course accents not wired | **BX-I4** shipped deterministic accents on **`/courses`**, **`/courses/:id`**, and dashboard workload rows — **`amber` | `rose` | `emerald`** from course ID/name/title only; supplementary chrome only; **no** DB persistence |
| Dashboard hero implies AI recommendation | **BX-I3** hero is **rule-based** only — derived from existing **`GET /api/dashboard/stats`** counts; **no** AI recommendation API |
| Course accent implies health / priority / urgency | **BX-I4** accents are **visual chrome only** — **no** health score, priority, urgency, active/quiet state, or AI classification |
| B4 already approved | **Partial** — **B4-A** **`/tasks`** and **B4-B** **`/flashcards`** page body polish are **complete** (commits **`4ae80ee`**, **`f91415d`**); **B4-C** Trello and remaining **B4** page-body polish are **not** started; each sub-phase requires explicit approval |
| BX-I6D complete = B4 or page-body polish approved | **BX-I6D** was global shell chrome (**`layout.css`** only); **B4-A** and **B4-B** are **complete** separately; **B4-C**, admin/focus polish, sidebar, charts, and backend/API extension need separate gates |
| B4-A complete = B4-B or other page-body polish approved | **B4-A** was **`/tasks`** page body presentation only — three approved files; **B4-B** is **complete** separately; **B4-C**, admin/focus polish, sidebar, charts, and backend/API extension need separate gates |
| B4-B complete = B4-C or other page-body polish approved | **B4-B** was **`/flashcards`** page body presentation only — three approved files; **B4-C**, admin/focus polish, sidebar, charts, and backend/API extension need separate gates |
| Material cockpit polish not wired | **BX-I5** shipped visual polish on **`/study-materials/:materialId`** only — **no** behavior/API change; course accents on material detail **not shipped** |
| `AGENT_MEMORY` tail entry is current | Read **this file** and **`IMPLEMENTATION_STATUS`** first |
| BX-I6C complete = B4 or page-body polish approved | **BX-I6C** was **`/courses`** + **`/courses/:id`** visual presentation only; **B4-A** and **B4-B** are **complete** separately; **B4-C**, remaining page-body polish, sidebar, and chart UI/APIs need separate gates |
| BX-I6D complete = B4 or page-body polish approved | **BX-I6D** was global shell chrome (**`layout.css`** only) — **no** route fade, page transitions, or auth changes; **B4-A** and **B4-B** are **complete** separately; **B4-C** and other per-route body polish need separate gates |
| “Flashcard library” on `/flashcards` implies AI automation | **B4-B** **“Flashcard library”** / **“Filter, study, and manage saved cards”** are factual **UI framing only** — **not** AI/automation claims; deck/command styling is visual chrome only |
| “Task command” on `/tasks` implies AI automation | **B4-A** **“Task command”** is approved **UI framing only** — **not** an AI/automation claim; **`task.priority`** remains API-backed only |
| Dashboard BX-I6B implies new recommendation logic | **BX-I6B** changed presentation/CSS only — **`dashboard-recommendation.js`** unchanged; hero remains **rule-based** |
| 375px / “mobile” in QA notes | Means **narrow responsive browser viewport** testing only — **not** native mobile app scope |
| Native mobile / app-store assumed from Stitch or DESIGN | **Web UI reference only** — native mobile, sidebar, and app-store patterns require separate explicit approval |
| `IMPLEMENTATION_STATUS` “Last aligned” before **12A-1** / **B1–B3** | Fixed in **DOCS-A3** — if lag recurs, verify code + **`AGENT_MEMORY`** |
| Screenshots match live UI | Many PNGs **predate 8C / 11A-3 / B1–B3** — trust code + status docs |

**Operating constraints:** Free Tier / minimal cost; no new paid APIs or npm packages without approval; Gemini **429** = quota, not necessarily a bug.

---

## Quick links

| Doc | Use for |
|-----|---------|
| [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) | Routes, APIs, env, DB, deferred work |
| [`PRD.md`](PRD.md) | Product vision and target MVP (includes future scope) |
| [`AGENT_MEMORY.md`](AGENT_MEMORY.md) | Phase history and pitfalls |
| [`../DESIGN.md`](../DESIGN.md) | Presentation spec |
| [`../AGENTS.md`](../AGENTS.md) | Agent approvals and DoD |
| [`../SECURITY.md`](../SECURITY.md) | Security boundaries |
