# DESIGN.md — StudyOps AI (v2.1)

**Status:** Phase **2I-c** UI/UX specification; styling applied Phase **2J**; polish refined Phase **8A**; global shell + workspace presentation complete Phase **8C-1** through **8C-3D**; **approved visual direction** codified Phase **A** (docs only)

**Last updated:** 2026-06-01 (Phase **A** — web-app platform clarification)

**Supersedes:** Phase 1G `DESIGN.md` (2026-05-20); partial updates through Phase **9B** / **12A-0**

---

## 0. Document control and authority

| Document | Role |
|----------|------|
| **`docs/PRD.md`** | Product intent and future MVP features |
| **`docs/IMPLEMENTATION_STATUS.md`** | **What is built today** — routes, APIs, deferred work |
| **`DESIGN.md` (this file)** | **Presentation and UX only** — does not change scope, APIs, database, or security |
| **`frontend/src/styles/tokens.css`** | **Implementation source of truth** for exact color, spacing, radius, shadow, and layout token **values** |
| **`docs/STITCH_BRIEF.md`** | **Historical** Stitch session input (Phase 2I — advisory); informed v2; **not** current product scope |
| **Stitch mockups / exports** | **Inspiration only** — not source of truth; never merge HTML/React into the repo |
| **`docs/design/screenshots/*.png`** | **Reference captures only** — layout/flow hints; may be **outdated** (see `SCREENSHOT_INDEX.md`) |

**Platform:** StudyOps AI is a **browser-based web application** (React in the browser). All guidance in this file applies to the **web app UI** only. **Desktop and laptop browsers** are the primary presentation target; smaller viewports are supported through **responsive web layout** in the browser—not a native iOS/Android app, app-store product, or phone-first native experience.

**Approved visual identity (Phase A):** StudyOps AI is a **modern, enjoyable AI study command center for students** — **calm enough for serious studying**, **smart enough to feel AI-powered**, and **polished enough to feel like a real product** rather than a student CRUD app.

It combines a **NotebookLM-style source workspace** (source-first, readable) with **Linear/Raycast-style** command clarity (filters, status, focused actions). **Cursor** informs the **source/editor + AI sidecar** on material detail. **Claude/ChatGPT artifacts** inform **durable AI outputs** (saved plan, bounded history), not open-ended chat.

**Design balance:** **trust** · **clarity** · **motivation** · **delight** · **focus** — never sacrifice trust or clarity for decoration; never confuse motivation with gamification.

**Inspiration references are principles only.** Do **not** clone NotebookLM, Notion, Linear, Raycast, Cursor, or Claude branding, layouts, or product features.

**Screenshots:** Reference captures live under `docs/design/screenshots/` (see `docs/design/SCREENSHOT_INDEX.md`). **`11-generated-plan-visible.png`** — **captured** (Phase 2K-c). **Pending:** `15-processing-with-ai.png` — do not fabricate. **Visual drift:** committed PNGs were captured during Phase **2I-b** / **2K-c** and may **predate Phase 8C** (AppShell, cockpit layouts, AI zones, stat tiles, plan history UI) unless recaptured. **When screenshots disagree with this file or the live app, trust `IMPLEMENTATION_STATUS.md` + this file + `tokens.css`.**

---

## 1. Purpose and scope

This document defines how the **implemented** StudyOps AI **web** frontend should look and behave in the browser. Styling was applied in Phase **2J**, refined in Phase **8A**, and workspace presentation completed in Phase **8C-1** through **8C-3D** (`AppShell`, `PageHeader`, cockpit layouts, component families). Phase **A** aligns this spec with the approved hybrid direction and current product state (including **bounded generated plan history**). **Further visual implementation** requires explicit human approval after Supervisor Review of Phase A.

**Not in scope for this document:** Native mobile apps (iOS/Android), app-store listings or screenshots, bottom-tab native navigation, push notifications, device-specific mobile features, or any design that implies a installable native product. Mobile mentions elsewhere mean **responsive web behavior** only.

It applies to:

- Auth (`/`, `/register`)
- Student dashboard (`/dashboard`)
- Courses (`/courses`, `/courses/:id`)
- Study materials (`/study-materials/:materialId`) — editor, **Generate study plan**, **active plan**, **bounded plan history**, import actions, saved flashcards
- Tasks (`/tasks`, course-level task UI on `/courses/:id`)
- Flashcards (`/flashcards`, saved flashcards on material detail)
- Trello sync (`/trello`)
- Focus sessions (`/focus/:taskId`)
- Admin aggregate stats (`/admin`)

**Out of this document’s authority:** New routes or features beyond **`docs/IMPLEMENTATION_STATUS.md`**; deployment; backend changes.

**Goal:** A **source-first learning workspace** with a **focused AI command stack** that students **want to open**—readable, trustworthy, motivating, and polished—without feeling dry, childish, clinical, or gamified.

---

## 2. Product feeling and positioning

### Official direction

**StudyOps AI is a modern, enjoyable AI study command center for students:** calm enough for serious studying, smart enough to feel AI-powered, and polished enough to feel like a real product rather than a student CRUD app.

The product must **not** feel dry, boring, or purely academic. It should feel **innovative**, **modern**, **enjoyable to use**, **motivating**, **smooth**, **student-friendly**, and **polished**—with **slightly playful micro-interactions** that reward progress, never childish chrome.

### Design balance

| Pillar | Meaning in StudyOps |
|--------|---------------------|
| **Trust** | Honest data, plain disclaimers on AI output, safe errors, no fake metrics |
| **Clarity** | Obvious hierarchy, one primary action per zone, scannable filters and status |
| **Motivation** | Progress you can see (tasks completed, plan saved, imports succeeded)—without XP or streaks |
| **Delight** | Satisfying motion, friendly empty states, small wins after generate/complete/import |
| **Focus** | Reduced noise; stress-lowering layout; source and AI zones stay purposeful |

### Target audience

**Busy students** who are stressed and overloaded—courses, assignments, exams, PDFs, slides, and deadlines. The UX should **reduce stress** and create a feeling of **control**, **progress**, and **clarity**: *“I know what to do next on this material.”*

Presentation should respect cognitive load: calm canvas, clear zones, fast scan paths—not more dashboards to decode.

### Positioning

StudyOps AI is a **source-first learning workspace** where a student organizes **courses** and **study materials** (saved text), then runs **AI-assisted study planning** on saved content. The UI should feel like a calm place to **read, edit, and plan**—and like a **study command center** for the current course/material—not a social app, hospital system, noisy analytics dashboard, open-ended chat product, or generic admin CRUD.

### Qualities

| Quality | Intent |
|---------|--------|
| **Calm & serious** | Warm canvas, readable long-form text—room to think, not a sterile archive |
| **Innovative & AI-forward** | Distinct AI column, processing lane, artifact-style plan—feels like modern productivity SaaS |
| **Enjoyable & smooth** | Transitions, feedback, and interactions feel responsive and intentional |
| **Motivating** | Visible progress (counts, completion, saved plan) and encouraging copy—no guilt or hype |
| **Student-friendly** | Approachable language, helpful empty states, forgiving errors |
| **Polished** | Consistent tokens, card families, cockpit layout—shipping-quality product |
| **Slightly playful** | Micro-delight on success paths only—never cartoonish |
| **Command-center clear** | Obvious primary action per zone; filters and status pills scannable (Linear + Raycast) |
| **Source-first** | Materials feel like documents in a course; editor is the anchor (NotebookLM) |
| **Grounded AI** | AI sidecar stack—generate, processing, artifact plan, history (Cursor + Claude artifacts) |
| **Trustworthy** | Honest empty/loading/error states; no fake metrics or achievements |

### What “fun” means (and does not)

**Fun in StudyOps** = professional delight and relief under pressure—not games.

| Fun **is** | Fun **is not** |
|------------|----------------|
| Satisfying button press, card hover, and plan-reveal motion | Gamification loops, streaks, XP, levels |
| Friendly, specific **empty states** (one clear next step) | Cartoons, mascots, childish illustration |
| Smooth route and panel transitions (`prefers-reduced-motion` respected) | Confetti, celebration explosions, noisy animations |
| Clear **progress feedback** (e.g. task completion %, import summary, “Last saved”) | Fake achievements, badges for fake milestones |
| Pleasant **visual hierarchy**—eyes land on the right action | Childish palettes, neon “game UI” colors |
| **Motivational but mature** copy (“Nice — plan saved”, “You’re set for this material”) | Streak shame, leaderboard pressure, hype |
| Modern **AI / productivity SaaS** feel (Raycast/Linear clarity + warm workspace) | Chart-heavy dashboards, KPI theater |
| Small **moments of delight** after generate, clear plan, complete task, successful import | Reward popups, daily login bonuses |

### Tone

Supportive, direct, and **lightly encouraging**—like a capable study partner, not a mascot or marketer.

- Good: *“Save changes before generating — generation uses your last saved material.”*
- Good: *“Plan saved. Review tasks below or import them to your course.”*
- Avoid: streaks, guilt, “AI magic,” infantilizing slang, fake urgency.

### Anti-patterns (feeling)

| Avoid feeling | Instead aim for |
|---------------|-----------------|
| Dry / boring / purely academic | Warm, alive, product-grade |
| Student-project CRUD | Cockpit workspace + AI command stack |
| Childish / gamified | Polished + subtle delight |
| Stressful / chaotic | Control, clarity, calm density |

---

## 3. Design references (principles only — do not clone)

For each inspiration source: what StudyOps **borrows**, what it **must not copy**, and how it **translates** into existing screens. **No new product features** may be justified from this table.

### 3.1 NotebookLM (Google)

| Borrow | Do not copy | StudyOps translation |
|--------|-------------|----------------------|
| Source-first journey: **documents → work → outputs** | Three-panel shell, Discover Sources, Studio (audio/slides/infographics), chat-first UI, citations drawer, purple brand | **Course detail** = honest materials list (`MaterialCard`). **Material detail** = **Source column** (editor) + **AI column** (generate → plan → history → import)—**no** middle chat column. **Generate + plan** = durable output zone, not a thread |

### 3.2 Notion

| Borrow | Do not copy | StudyOps translation |
|--------|-------------|----------------------|
| Warm neutral canvas; **section rhythm** (`h1` → zone subtitle → content); comfortable 16px body | Block editor OS, infinite nested pages, full sidebar databases, Notion purple lock-in | **`PageHeader` intro** + `section__title` / `section__subtitle` on course/material/tasks. **`FormCard`** as light block containers. **Filter toolbars** on `/tasks` and `/flashcards` like simplified database filters |

### 3.3 Linear

| Borrow | Do not copy | StudyOps translation |
|--------|-------------|----------------------|
| Dimmed chrome vs bright workspace; **status pills**; **segmented filters**; list scannability | Dark-first UI, issue IDs, cycles/roadmaps, sidebar-as-primary nav | **`filter-toolbar--segmented`** on tasks/flashcards. **`source-card--task`** with pending/completed/priority pills. **`AppShell`** active nav state. **Dashboard/admin** stat tiles flat, not marketing-hover |

### 3.4 Raycast

| Borrow | Do not copy | StudyOps translation |
|--------|-------------|----------------------|
| **Command-surface** clarity: one primary action, grouped secondary actions, frosted top chrome, tabular numerals | Dark charcoal default, macOS launcher layout, extension-store aesthetic | **`app-shell__bar`** frosted header. **`PageHeader` actions** cluster (e.g. Refresh stats, New course). **AI panel** single primary CTA. **Focus timer** and stat values use tabular nums where styled |

### 3.5 Cursor

| Borrow | Do not copy | StudyOps translation |
|--------|-------------|----------------------|
| **Editor + AI sidecar**; busy/disabled during AI; structured output blocks | IDE tabs, file tree, terminal, dark code theme, agent composer as home | **`material-workspace__cockpit`** grid ≥1024px: source left, AI right. **Processing lane** inside AI panel (not full-screen). **Generated plan** = structured sections, not chat bubbles |

### 3.6 Claude / ChatGPT artifacts

| Borrow | Do not copy | StudyOps translation |
|--------|-------------|----------------------|
| **Durable output pane** separate from conversation; version list; disclaimer meta | Open-ended chat route, public artifact gallery, artifact app builder | **`GeneratedPlanSection`** = artifact (read-only, disclaimer, last saved). **`GeneratedPlanHistorySection`** = bounded versions (metadata, lazy preview, restore). **No** general chat UI unless separately approved |

---

## 4. Layout and app chrome

### 4.1 Authenticated shell — `AppShell`

Implemented Phase **8C-1** (`frontend/src/components/layout/AppShell.jsx`):

- Sticky top bar: brand link, main nav (**Dashboard**, **Courses**, **Tasks**, **Flashcards**, **Trello**), optional **Admin** when `user?.role === 'admin'`, **Log out**
- Workspace routes render **inside** `AppShell`; auth routes (`/`, `/register`) render **outside**

**Do not add:** Sidebar navigation hub, Search Library, Source Drawer, AI Sidebar as **new** product features.

### 4.2 Page header — `PageHeader`

Implemented (`frontend/src/components/layout/PageHeader.jsx`):

- **Standard:** `h1` + optional lead + optional `children` (actions)
- **Intro mode:** title + lead + note + actions — used on dashboard, course detail, material detail, tasks, flashcards, Trello, admin
- **Back link:** optional `backTo` above header on nested routes

**Guidance:** One clear **`h1`** per route. Primary page action belongs in **`page-header__actions`**, not buried in body forms.

### 4.3 Layout modes (when to use which)

| Mode | CSS / class | Max width token | Use when |
|------|-------------|-----------------|----------|
| **Reading layout** | `page--reading` | `--content-max-reading` (800px) | Long-form text focus if a route uses a single reading column without cockpit grid |
| **Workspace layout** | `page--workspace` | `--content-max-workspace` (720px) | Narrow lists or legacy single-column pages if not upgraded to cockpit |
| **Cockpit layout** | `page--cockpit` | `--content-max-cockpit` (1120px) | **Default for main app hubs:** `/dashboard`, `/courses`, `/courses/:id`, `/tasks`, `/flashcards`, `/trello`, `/admin`, `/focus/:taskId`, `/study-materials/:materialId` |
| **Form layout** | centered auth | `--content-max-form` (420px) | Login, register |

**Cockpit width:** Main app hubs use **`--content-max-cockpit: 1120px`** (also `--content-max-shell` for shell inner alignment). Prefer **`page--cockpit`** on dashboard, courses, tasks, flashcards, Trello, admin, and material detail so wide screens show **operational density**, not blog-width stacks.

**Responsive default:** Single column on small viewports; cockpit grids activate at documented breakpoints (e.g. material **Source | AI** split at **≥1024px**).

### 4.4 Study material detail — Source | AI split

Flagship **hybrid cockpit** (`StudyMaterialDetail.jsx`):

| Zone | DOM / class | Role |
|------|-------------|------|
| **Source column** | `material-workspace__cockpit-source` | Edit study material (`material-workspace__editor` + instrument-style `FormCard`) |
| **AI column** | `material-workspace__cockpit-ai` | Generate panel → active plan → plan history → import toolbars |
| **Library band** | `material-workspace__library` (full width below cockpit) | Saved DB flashcards |
| **Danger zone** | `material-workspace__danger` | Delete material |

**≥1024px:** Two-column grid (`1fr | 1fr`); AI column gets subtle background, border, **3px primary top rule**. **&lt;1024px:** Stack **Source first**, then AI stack (generate before plan output).

### 4.5 Other layout patterns

- **Auth:** Centered `FormCard` on canvas gradient.
- **Lists:** Vertical stacks or responsive grids of **Source Cards** with `--space-4`–`--space-6` gaps.
- **Dashboard / admin:** `dashboard-cockpit` rows of **Stat Tiles** inside **bands**.

---

## 5. Design tokens

**Exact values:** `frontend/src/styles/tokens.css` — **authoritative** for hex, rem sizes, shadows, and layout widths. This section describes **semantic roles** only; if §5 ever disagrees with `tokens.css`, **trust `tokens.css`**.

| Role | Semantic guidance |
|------|-------------------|
| **Canvas** | Warm paper `--color-bg` |
| **Surfaces** | White cards `--color-surface` on canvas |
| **Text** | Charcoal primary; muted secondary/subtle tertiary |
| **Primary** | Calm indigo `--color-primary` — actions, links, focus ring |
| **AI zones** | `--color-primary-subtle`, `--color-primary-border`; top accent on AI column |
| **Admin** | `--color-admin-accent` / `--color-admin-subtle` — admin-only surfaces |
| **Danger** | Restrained red; danger zones only |

**Typography:** System stack in `tokens.css` unless a human separately approves one webfont. Material body: ~16px, `line-height-body` ~1.6. Use **tabular numerals** for stats, timers, and “Card X of N”.

**Implementation notes:**

- Plain CSS / CSS modules — **not** Tailwind unless separately approved.
- No Google Fonts CDN unless separately approved.
- No Material Icons unless separately approved.

---

## 6. Component families

Presentation families map to existing React/CSS. **No new components or behavior** are required by this section.

### 6.1 Source Card (`source-card`)

**Purpose:** Represent **courses**, **materials**, **tasks**, and **dashboard course rows** as scannable documents/rows.

| Variant | Class hints | Use |
|---------|-------------|-----|
| Subject | `source-card--subject` | Course list (`CourseCard`) |
| Document | `source-card--document` | Material list (`MaterialCard`) |
| Task | `source-card--task` | Task lists (`TaskCard`) |
| Dashboard course | `source-card--dashboard-course` | Per-course breakdown on dashboard |

**Rules:** Title as plain text or link; pills for type/status/priority; **no** fake progress rings or fabricated counts. Hover lift on **clickable** cards only.

### 6.2 Instrument Card

**Purpose:** Primary **forms and editors**—the “instrument” the student works in.

**Implementation:** `FormCard` (+ `material-workspace__editor-card` on material detail): white surface, `elevation-2`, optional **left accent** on source editor.

**Use:** Auth forms, create course/material, edit course title, edit material, task create/edit, flashcard create/edit, Trello credential steps.

### 6.3 AI Panel (`ai-panel`)

**Purpose:** **Command surface** for generation and AI-adjacent actions.

**Structure:** `ai-panel__header` (title + lead), `ai-panel__hint` (warnings), `ai-panel__actions` (primary CTA), `ai-panel__loading` (**Processing Lane** when active).

**Use:** **Generate study plan** block on material detail. Tint/subtle border distinct from Instrument Cards.

**Rules:** **One primary** per state (Generate vs Processing). Do not compete visually with **Save changes** in the source column.

### 6.4 Stat Tile (`dashboard-stat` + `dashboard-band`)

**Purpose:** Honest **read-only aggregates** on `/dashboard` and `/admin`.

**Implementation:** `StatBand` / `StatItem` → `dashboard-band`, `dashboard-stat`.

**Rules:** Real API counts only; **no** charts, sparklines, or decorative KPI theater. Minimal or no hover lift. Admin bands may use `dashboard-band--admin-*` modifiers.

### 6.5 Task Row Card

**Purpose:** Task list rows with **workflow metadata**.

**Implementation:** `source-card--task` on `TaskCard` — pending/completed pills, priority pill, stat row (minutes), course/material meta, action row (edit, complete, delete, **Start Focus** on pending only).

### 6.6 Study Card (`flashcard-study`)

**Purpose:** **One-card-at-a-time** study mode—largest readable type on the page.

**Implementation:** `FlashcardStudy` — `flashcard-study__card`, question/answer reveal, `flashcard-study__counter`, prev/next.

**Variants:** `flashcard-study--plan` (from generated plan), `flashcard-study--library` (saved DB cards).

### 6.7 Plan History Row (`plan-history`)

**Purpose:** **Bounded** generated plan versions (max **10** per material per backend).

**Implementation:** `GeneratedPlanHistorySection` → `plan-history__list`, `plan-history__item`, badges **Active** / **Previous version**, `plan-history__actions` (Preview inactive only, Make active, Delete inactive).

**Rules:** List load is **metadata-only**; full plan fetched on Preview only. Active row: no Preview / Make active / Delete.

### 6.8 Import Toolbar (`plan-import-toolbar`)

**Purpose:** Batch **apply AI output** to workspace (tasks, flashcards).

**Implementation:** In `GeneratedPlanSection` — label + action row for import buttons; success/error feedback nearby.

**Rules:** Confirm before import; show skip/import counts from API summary; does not clear plan.

### 6.9 Processing Lane

**Purpose:** Visible **in-progress generate** state without full-page overlay.

**Implementation:** `ai-panel__loading--active` — dashed border, `LoadingState` “Processing with AI…”, pulse on label only per §10.

**Screenshot:** Target for pending `15-processing-with-ai.png`.

### 6.10 Shared UI primitives (unchanged roles)

| Component | Guidance |
|-----------|----------|
| **Button** | primary / secondary / danger; ~44px min height; disabled when loading/generating/unsaved |
| **Input / Textarea** | Visible labels; material body uses `Textarea` `reading` mode |
| **FormCard** | Default instrument surface; `form-card--ai` / `form-card--plan` for AI-tinted plan output |
| **ErrorMessage** | `role="alert"`; user-safe text only |
| **LoadingState** | Preserve layout; “Processing with AI…” in generate flow |
| **EmptyState** | Friendly, specific headline + one sentence + single CTA — reduce stress (“No courses yet” → create first course); not bland or childish |

### 6.11 GeneratedPlanSection

Read-only plan artifact: Summary, Key topics, Difficulty, Tasks (`ol`), Flashcards; plain text only; disclaimer; optional **Last saved**; **Clear plan**; hosts **Import Toolbar** and plan **Study Card** block when flashcards exist.

---

## 7. Screen-by-screen guidance (implemented only)

Reference screenshots: `docs/design/SCREENSHOT_INDEX.md` (**may be outdated**—see §0).

### 7.1 Login (`/`) — `01-login.png`

Centered Instrument Card; StudyOps title; email/password; link to Register; `LoadingState` on submit.

### 7.2 Register (`/register`) — `02-register.png`

Same auth layout as login.

### 7.3 Student dashboard (`/dashboard`) — `03-dashboard.png` (likely outdated)

**Layout:** `page--cockpit`, `PageHeader` intro, `dashboard-cockpit` bands.

**Content:** Real stats from **`GET /api/dashboard/stats`** — Overview, Tasks (optional completion %), Focus, Learning assets, Trello sync count, per-course `source-card--dashboard-course` rows.

**Not:** Charts, KPI widgets, streaks, Gemini logs. **Refresh stats** in header actions; silent refresh when mounted (**5C.1**).

**Recapture** `03-dashboard.png` after future visual phases.

### 7.4 Courses — empty (`/courses`) — `04-courses-empty.png`

`h1` + `EmptyState` + create CTA.

### 7.5 Courses — create form (`/courses`) — `05-create-course-form.png`

Inline/toggled Instrument Card; title only.

### 7.6 Courses list (`/courses`) — `06-courses-list.png`

**Cockpit** layout; `PageHeader` + **New course**; grid/list of **Source Cards** (`source-card--subject`).

### 7.7 Course detail (`/courses/:id`) — `07-course-detail-materials.png`

**Workspace/cockpit** subject hub: course title, edit title Instrument Card, **Study materials** as **document Source Cards**, add material form, **course tasks** section (filters, task rows), danger zone separated. **No** fake `stats` stub metrics.

### 7.8 Create material (`/courses/:id`) — `08-create-material-form.png`

Add material Instrument Card: title, source type, large `Textarea`, create/cancel.

### 7.9 Study material detail (`/study-materials/:materialId`) — `09`–`12`, `11`, pending `15`

**Cockpit + Source | AI split** (§4.4):

- `PageHeader` intro: material title, workspace lead, back to course
- **Source column:** Edit study material; unsaved hint; Save
- **AI column:** AI Panel (generate) → active **GeneratedPlanSection** → **Plan History** → import feedback
- **Library band:** `DbFlashcardsSection` (saved + study)
- **Danger zone:** delete material

**Recapture** screenshots after visual polish; **`15-processing-with-ai.png`** when live Generate is approved.

### 7.10 Generate study plan — `10-generate-study-plan.png`

AI Panel: primary **Generate study plan**; disabled when unsaved/loading/generating.

### 7.11 Unsaved changes — `12-unsaved-changes-warning.png`

`ai-panel__hint--warning`: *“Save changes before generating — generation uses your last saved material.”*

### 7.12 Validation error — `13-validation-error.png`

Inline field error +/or `ErrorMessage`; not color-only.

### 7.13 Not-found — `14-not-found.png`

Neutral copy; back links; not “access denied.”

### 7.14 Tasks (`/tasks`, `/courses/:id`)

**Cockpit** width; **segmented filter toolbar** (course × status); **Task Row Cards**; pending queue visually primary; completed muted; **Start Focus** on pending only; create on `/tasks` when filter allows.

### 7.15 Flashcards (`/flashcards`, material detail)

Filters → **Study Card** stage → manage list. Material page: distinguish **plan flashcards** vs **saved library** section titles.

### 7.16 Trello (`/trello`)

Step-based **workspace**: credentials → board/list picker → task selection (max 50) → results with status pills. Ephemeral credentials only.

### 7.17 Focus (`/focus/:taskId`)

Calm timer panel; tabular countdown; primary complete; optional mark task complete; not gamified.

### 7.18 Admin (`/admin`)

**Cockpit** + admin accent; platform aggregate **Stat Tiles** only; `· Admin` in title; `AdminRoute` forbidden surface for non-admins (UX only).

---

## 8. AI workspace rules

Rules for **material detail AI column** and related surfaces. **No general-purpose chat UI** unless separately approved.

### 8.1 Generate panel

- Section: **Generate study plan** (`ai-panel`)
- Primary: **Generate study plan** → `POST /api/study-materials/:materialId/generate` body **`{}` strict**
- Uses **saved** DB content only — **no** client `studyText`
- Disabled when: saving, deleting, generating, importing, or **unsaved editor changes**

### 8.2 Processing state

- While generating: primary shows “Processing with AI…”; **Processing Lane** visible (`ai-panel__loading--active`)
- Optional pulse on loading label only — no full-screen overlay
- On success: reveal active plan; on error: `ErrorMessage` with safe mapped message
- Official screenshot: **`15-processing-with-ai.png`** (pending — do not fabricate)

### 8.3 Active plan

- One **active** plan per material (backend `is_active`)
- `GeneratedPlanSection`: read-only plain text; disclaimer: *“AI-generated — saved as the latest plan for this material. Reference only; verify before you study.”*
- Optional **Last saved** from `savedAt`
- **Clear plan** → `DELETE` active plan only
- **Refresh** on load uses `GET …/generated-plan`

### 8.4 Plan history (bounded — in scope)

- Up to **10** rows per material; **one active**
- UI: `GeneratedPlanHistorySection` — metadata list, **Active** / **Previous version** badges
- **Preview** inactive only (lazy `GET …/generated-plans/:planId`)
- **Make active** on inactive → `POST …/activate` body `{}` — **no** Gemini call
- **Delete** inactive only; active delete → backend **409**
- **Not in scope:** cross-material plan library, sync badges, unbounded archive UI

### 8.5 Import actions

- **Import Toolbar** on active plan when tasks/flashcards exist
- `POST …/import/tasks` and `POST …/import/flashcards` with dedupe (`source='plan'`)
- Confirm warns skipped duplicates; plan not auto-cleared

### 8.6 Save-before-generate warning

- When editor dirty: disable generate + `ai-panel__hint--warning` (§7.11)

### 8.7 AI disclaimers

- Plan output is **untrusted reference** — visible disclaimer on active plan and history intro
- No authority implied for exams or grading

### 8.8 No chat UI

- **No** open-ended chat thread, composer, or `/chat` route in design scope
- AI interaction is **generate → structured plan artifact → optional import/history**
- Command palette / keyboard palette: **concept only** — not implemented without approval

---

## 9. Generate and AI display rules (API alignment)

| Rule | UI requirement |
|------|----------------|
| **Route** | `materialId` from URL only |
| **Request** | `POST …/generate` body **`{}` strict** |
| **No client studyText** | UI must not send `studyText`, `content`, or paste on generate |
| **Saved content** | Backend reads saved DB `content` |
| **Persistence** | Backend `material_generated_plans`; one active row; up to 10 rows retained |
| **History APIs** | List metadata-only; get-by-id for preview; activate/delete-version as implemented |
| **Untrusted display** | Plain React text for all plan fields |
| **Read-only plan** | No inline edit implying DB writes in plan section |
| **No chat persistence** | No `localStorage` / `sessionStorage` for plans |
| **document-service** | Not called from frontend |

---

## 10. Motion and animation

Motion supports **smooth**, **enjoyable** use—not spectacle. Respect `prefers-reduced-motion: reduce` (disable transforms and pulse when set).

| Pattern | Guidance |
|---------|------------|
| Route transition | Optional 150–200ms opacity — app feels connected, not jumpy |
| Card hover | `shadow-sm` → `shadow-md` on clickable cards only — satisfying affordance |
| Button press | Slight darken or scale 0.98 — tactile feedback |
| Generate loading | Pulse on loading label only (Processing Lane) — alive, not anxious |
| Plan reveal | Short fade-in (+ optional 4px translateY) when plan appears — **moment of delight** |
| Task complete / import success | Brief success state color or opacity settle — no confetti |
| History preview | Optional height transition on expand |
| Stat refresh | Subtle opacity flash on silent dashboard refresh — progress feels current |

**Slightly playful:** Allowed on **success paths** only (plan visible, import done, task marked complete). **Not** on every hover or idle loop.

**Avoid:** Parallax, neon animations, confetti, streaks, XP popups, looping gradients, cartoon motion.

---

## 11. Accessibility

- One **`h1`** per route; logical heading order
- Visible **labels** on controls
- **`role="alert"`** / `aria-live` for errors and generate failures
- **`:focus-visible`** ring using `--color-focus-ring`
- Touch targets **≥44px** on primary actions
- Errors: text + color
- Semantic `ul`/`ol` in plan output
- Material `Textarea`: comfortable contrast (body ≥4.5:1)

---

## 12. Responsive behavior

**Responsive web only:** Breakpoints below describe how the **web app** reflows in the browser (CSS media queries). They do **not** define a separate native mobile app or phone-first product. Prefer desktop/web layouts for design reviews and screenshots; narrow widths are supported so students can use the same web app on smaller screens without horizontal scroll.

| Breakpoint | Behavior |
|------------|----------|
| **&lt;640px** | Single column; full-width primary buttons; compact padding (`--space-4`); stack all zones vertically |
| **≥640px** | Centered main column at layout max-width tokens (`page--workspace`, `page--reading`, or `page--cockpit` per route) |
| **≥1024px** | **Study material detail:** two-column cockpit — Source column (editor) and AI column (generate, plan, history). **Other cockpit routes** (`/dashboard`, `/courses`, `/tasks`, etc.): wider layout and band/grid patterns where already implemented in CSS |

**Long titles and labels:** Wrap text; use `title` tooltip only when necessary. Avoid horizontal scroll on forms, cards, and headers.

---

## 13. API and security (UI-facing)

- Bearer via Supabase session + `apiFetch`
- No service role or `GEMINI_API_KEY` in frontend
- Never send `user_id`, `userId`, or `courseId` in generate body
- **XSS:** React text only for titles, content, plan fields
- **401:** logout + redirect
- Do not log material `content`, `plan`, or tokens in production consoles

---

## 14. Explicitly out of scope (design)

Do **not** design or implement **new product features** beyond **`docs/IMPLEMENTATION_STATUS.md`**:

- Admin **logs**, user list, role management, Gemini error metrics UI
- Charts, KPI widgets, streaks, fake progress, gamification, confetti
- **Unbounded** plan library, cross-material plan browser, sync badges
- Client POST of plan JSON; course-level paste-generate with client `studyText`
- Source **upload**, file picker, drive connectors
- Audio overview, citations panel, notebook sharing (NotebookLM clone features)
- Search Library, Source Drawer, Recent Sources, Drafting Space
- AI Sidebar as permanent product navigation
- **General chat route** or ever-scroll chat as primary AI surface
- Permanent sidebar **hub** beyond minimal top bar
- Footer links (Privacy, Terms, Help Center) unless separately approved
- Dark hacker-terminal default or medical/clinical teal palette
- Trello OAuth, stored credentials, PDF upload, payments, polling/WebSockets
- New routes, APIs, tables, or backend changes **justified by this file**

**In scope for presentation:** Bounded **plan history** on material detail (**11A-3**); tasks, flashcards, Trello, focus, dashboard, admin polish.

Label future mocks: **concept only — not implemented**.

---

## 15. What not to do

- Do **not** use Stitch HTML/React as source of truth
- Do **not** add Tailwind, Google Fonts CDN, Material Icons without approval
- Do **not** clone inspiration products’ branding, layouts, or exclusive features
- Do **not** use this file to justify new APIs, tables, or routes
- Do **not** imply client sends `studyText` on generate
- Do **not** show fake dashboard stats
- Do **not** add interactive checkboxes on generated tasks in plan display
- Do **not** treat outdated screenshots as product truth
- Do **not** add chat UI without separate approval

---

## 16. When agents may apply DESIGN.md

| Situation | Allowed |
|-----------|---------|
| **Phase A** — updating this file | Yes (documentation only) |
| **Planning / Stitch / screenshots** | Historical brief + screenshot index; **this file** is presentation authority |
| **Phase 2J / 8A / 8C styling** | **Baseline complete** — further CSS/React presentation requires new approval |
| **Visual Design Direction implementation** | Requires explicit approval (e.g. `approved — implement Visual Design Direction Phase B`) after Supervisor Review of Phase A |
| **Functional feature work** | Follow `IMPLEMENTATION_STATUS`; this file for presentation only |
| **Scope expansion** | **Never** — PRD + human approval |

**Phase A (this update):** Documentation only. **Stop** after doc changes; wait for **Supervisor Review** before visual implementation.

---

## 17. Styling implementation guide (baseline complete)

Phases **2J**, **8A**, and **8C** established:

1. `frontend/src/styles/tokens.css` — source of truth for values
2. `components.css`, `layout.css` — Source Cards, AI Panel, cockpit grids, bands
3. `AppShell`, `PageHeader` on workspace routes
4. Material **Source | AI** cockpit

**Further presentation work:** Requires explicit approval; compare live UI to this file, not pre-8C PNGs alone.

**Forbidden without approval:** New UI libraries; Stitch merge; scope expansion; chat UI.

---

## 18. Related documents

- `docs/IMPLEMENTATION_STATUS.md` — built vs deferred
- `docs/STITCH_BRIEF.md` — historical Stitch input
- `docs/design/SCREENSHOT_INDEX.md` — screenshot checklist and drift notes
- `docs/AGENT_MEMORY.md` — phase history
- `docs/PRD.md` — product intent
- `AGENTS.md` — approval gates
- `SECURITY.md` — secrets and boundaries

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-20 | Initial DESIGN.md (Phase 1G) |
| 2026-05-22 | **v2** — NotebookLM-inspired spec; tokens; generate/plan sections |
| 2026-05-30 | **8B/9B** — 8C AppShell/cockpit; implemented screens §7.14–7.18 |
| 2026-06-01 | **Phase A** — Approved hybrid identity; design references (§3); layout modes + Source\|AI (§4); component families (§6); AI workspace rules (§8); bounded plan history in scope; `tokens.css` authority; screenshot drift; contradictions resolved; no chat UI |
| 2026-06-01 | **Phase A clarification** — Enjoyable/modern/motivating direction; target audience; fun definition; design balance (trust, clarity, motivation, delight, focus); anti dry/CRUD/gamified feelings |
| 2026-06-01 | **Phase A** — Platform note: browser-based web app only; responsive = web reflow; no native mobile/app-store scope |
