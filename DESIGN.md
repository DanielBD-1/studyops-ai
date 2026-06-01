# DESIGN.md — StudyOps AI (v2.3)

**Status:** Phase **2I-c** UI/UX specification; styling applied Phase **2J**; polish refined Phase **8A**; global shell + workspace presentation complete Phase **8C-1** through **8C-3D**; **approved visual direction** codified Phase **A** (docs only); **dashboard decision layout, chart rules, course accents, and AI command emphasis** codified Phase **BX-1** (docs only); **Stitch-selected visual presentation** codified Phase **BX-I1** (docs only)

**Last updated:** 2026-06-01 (Phase **BX-I1** — Stitch visual delta; dark graphite / glass command center)

**Supersedes:** Phase 1G `DESIGN.md` (2026-05-20); partial updates through Phase **9B** / **12A-0**; v2.1 through Phase **A**; v2.2 through Phase **BX-1**

---

## 0. Document control and authority

| Document | Role |
|----------|------|
| **`docs/PRD.md`** | Product intent and future MVP features |
| **`docs/IMPLEMENTATION_STATUS.md`** | **What is built today** — routes, APIs, deferred work |
| **`DESIGN.md` (this file)** | **Presentation and UX only** — does not change scope, APIs, database, or security |
| **`frontend/src/styles/tokens.css`** | **Implementation source of truth** for exact color, spacing, radius, shadow, and layout token **values** |
| **`docs/STITCH_BRIEF.md`** | **Historical** Stitch session input (Phase 2I — advisory); informed v2; **not** current product scope |
| **`docs/design/PROTOTYPE_REFERENCES.md`** | **BX-0** Canvas + prototype PNG direction — **reference only**; informs BX-1+ presentation; **not** implementation scope |
| **`docs/design/STITCH_SELECTED_REFERENCE.md`** | **BX-S** — **selected external visual reference** (Phase BX-S); records approved Stitch direction; **reference only**; **not** production code or product scope |
| **`docs/design/STITCH_VISUAL_STYLE_GUIDE.md`** | **BX-S** — Stitch palette, typography, glass, and component **principles** — **reference only**; informs token and CSS phases; **never** merge Stitch-generated HTML/React/CSS into `frontend/src` |
| **Stitch mockups / exports** (`docs/design/screenshots/stitch-*.png`) | **Inspiration only** — not source of truth; never merge HTML/React into the repo |
| **Canvas prototype (`.canvas.tsx`)** | **Layout/hierarchy reference only** — IDE-managed; **never** copy into `frontend/src` (see `PROTOTYPE_REFERENCES.md`) |
| **`docs/design/screenshots/*.png`** | **Reference captures only** — layout/flow hints; may be **outdated** (see `SCREENSHOT_INDEX.md`); **`proto-*`** = BX-0 prototype captures when present |

**Platform:** StudyOps AI is a **browser-based web application** (React in the browser). All guidance in this file applies to the **web app UI** only. **Desktop and laptop browsers** are the primary presentation target; smaller viewports are supported through **responsive web layout** in the browser—not a native iOS/Android app, app-store product, or phone-first native experience.

**Approved visual identity (Phase A + BX-1 + BX-I1):** StudyOps AI is a **modern AI study command center for students** — **calm enough for serious studying**, **smart enough to feel AI-powered**, and **polished enough to feel like shipping-quality SaaS** rather than a student CRUD app, generic admin console, or BI dashboard.

**Selected presentation skin (Phase BX-S / BX-I1 — not yet in `tokens.css` or production UI):** An **accessible dark graphite / deep slate** command-center environment with **frosted glass** card surfaces, **electric blue** primary actions, **violet** AI/command accents, **cyan** data and focus accents, and a small **course accent palette** (stable per-course identity). The product should feel like a **focused study flight deck**—not beige/indigo calm UI, not a hacker terminal, and not corporate analytics chrome.

The **dashboard** is a **decision hub**: it answers **“What should I study next?”** before aggregate counts. **Charts and progress visuals** support **student decisions** (what to do, where time went, what is overloaded)—not KPI theater. **Course surfaces** carry light **accent identity** so subjects feel distinct without gamified chrome.

On **material detail**, the **Source | AI cockpit** stays the signature layout: a **source workspace** (read/edit/save) beside a **strong AI command panel** (generate → plan artifact → history → imports → plan flashcard study)—both columns **first-class**; the AI stack should **visually evolve** toward the Stitch **dark/glass command column** in later approved implementation phases (see §4.4, §6.3).

It combines a **NotebookLM-style source workspace** (source-first, readable) with **Linear/Raycast-style** command clarity (filters, status, focused actions). **Cursor** informs the **source/editor + AI sidecar** layout. **Claude/ChatGPT artifacts** inform **durable AI outputs** (saved plan, bounded history, flashcard study card), not open-ended chat.

**Prototype alignment (BX-0 / BX-1):** `docs/design/PROTOTYPE_REFERENCES.md` and optional `proto-*.png` captures describe richer **student-facing data presentation** than today’s stat-tile-only dashboard. They inform **presentation direction** only until a separately approved implementation phase.

**Stitch alignment (BX-S / BX-I1):** `docs/design/STITCH_SELECTED_REFERENCE.md`, `docs/design/STITCH_VISUAL_STYLE_GUIDE.md`, and `stitch-*.png` screenshots are the **approved external visual reference** for palette, glass, hierarchy, and cockpit emphasis. They are **reference only**—same authority class as other mockups; **do not** copy Stitch-generated code into `frontend/src`.

**Design balance:** **trust** · **clarity** · **motivation** · **delight** · **focus** — never sacrifice trust or clarity for decoration; never confuse motivation with gamification.

**Inspiration references are principles only.** Do **not** clone NotebookLM, Notion, Linear, Raycast, Cursor, or Claude branding, layouts, or product features.

**Screenshots:** Reference captures live under `docs/design/screenshots/` (see `docs/design/SCREENSHOT_INDEX.md`). **`11-generated-plan-visible.png`** — **captured** (Phase 2K-c). **Pending:** `15-processing-with-ai.png` — do not fabricate. **Visual drift:** committed PNGs were captured during Phase **2I-b** / **2K-c** and may **predate Phase 8C** (AppShell, cockpit layouts, AI zones, stat tiles, plan history UI) unless recaptured. **When screenshots disagree with this file or the live app, trust `IMPLEMENTATION_STATUS.md` + this file + `tokens.css`.**

---

## 1. Purpose and scope

This document defines how the **implemented** StudyOps AI **web** frontend should look and behave in the browser—and the **approved presentation direction** for the next visual passes. Styling was applied in Phase **2J**, refined in Phase **8A**, and workspace presentation completed in Phase **8C-1** through **8C-3D** (`AppShell`, `PageHeader`, cockpit layouts, component families). Phase **A** aligned this spec with the approved hybrid direction and current product state (including **bounded generated plan history**). Phase **BX-1** adds the **decision-first dashboard**, **honest chart rules**, **course accent identity**, and **AI command-panel emphasis** without changing product scope. Phase **BX-I1** adds the **Stitch-selected visual presentation direction** (dark graphite / glass / accent system) without changing product scope.

**BX-1 and BX-I1 are documentation only.** They do **not** implement dark theme, charts, course accents, sidebar shell, `tokens.css` changes, or frontend/CSS work; do **not** add chart libraries, fonts/CDN, or extend dashboard APIs; and do **not** start Phase **B4**. **Further visual implementation** (tokens, shell skin, dashboard hero, charts, course accents, material cockpit styling) requires **separate** explicit human approval after Supervisor Review of each phase (e.g. BX-I2+).

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

**StudyOps AI is a modern AI study command center for students:** calm enough for serious studying, smart enough to feel AI-powered, and **polished enough to feel like shipping-quality SaaS**—not a student CRUD app, not a generic admin console, and not a BI dashboard.

The product must **not** feel dry, boring, or purely academic. It should feel **innovative**, **modern**, **enjoyable to use**, **motivating**, **smooth**, **student-friendly**, and **polished**—with **stronger UX hierarchy** (one obvious primary story per screen) and **useful data visualization** where data exists—with **slightly playful micro-interactions** that reward progress, never childish chrome.

**Student-focused, not childish:** approachable copy and calm density for stressed students; **no** mascots, XP, streaks, or cartoon chrome.

### Design balance

| Pillar | Meaning in StudyOps |
|--------|---------------------|
| **Trust** | Honest data, plain disclaimers on AI output, safe errors, no fake metrics |
| **Clarity** | Obvious hierarchy, one primary action per zone, scannable filters and status; dashboard leads with **next action**, not stat grids |
| **Motivation** | Progress you can see (tasks completed, plan saved, focus minutes, imports succeeded)—without XP, streaks, or fake scores |
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
| **Calm & serious** | Focused **dark graphite** canvas (when implemented) or readable surfaces—room to think; long-form material text stays comfortable; not a sterile archive or hacker terminal |
| **Innovative & AI-forward** | Distinct AI column, processing lane, artifact-style plan—feels like modern productivity SaaS |
| **Enjoyable & smooth** | Transitions, feedback, and interactions feel responsive and intentional |
| **Motivating** | Visible progress (counts, completion, saved plan) and encouraging copy—no guilt or hype |
| **Student-friendly** | Approachable language, helpful empty states, forgiving errors |
| **Polished** | Consistent tokens, card families, cockpit layout—**modern product-grade** presentation |
| **Useful data** | Charts and breakdowns answer real student questions; **honest API-backed** numbers only |
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
| Modern **AI / productivity SaaS** feel (Raycast/Linear clarity + dark glass command center) | Chart-heavy dashboards, KPI theater |
| Small **moments of delight** after generate, clear plan, complete task, successful import | Reward popups, daily login bonuses |

### Tone

Supportive, direct, and **lightly encouraging**—like a capable study partner, not a mascot or marketer.

- Good: *“Save changes before generating — generation uses your last saved material.”*
- Good: *“Plan saved. Review tasks below or import them to your course.”*
- Avoid: streaks, guilt, “AI magic,” infantilizing slang, fake urgency.

### Anti-patterns (feeling)

| Avoid feeling | Instead aim for |
|---------------|-----------------|
| Dry / boring / purely academic | Alive, product-grade command center |
| Student-project CRUD / admin panel | Study command center + Source \| AI cockpit |
| Generic BI / KPI dashboard | Decision-first dashboard + honest charts |
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
| Dimmed chrome vs bright workspace; **status pills**; **segmented filters**; list scannability | Dark-first UI, issue IDs, cycles/roadmaps, sidebar-as-primary nav | **`filter-toolbar--segmented`** on tasks/flashcards. **`source-card--task`** with pending/completed/priority pills. **`AppShell`** active nav state. **Dashboard:** decision-first hero + honest charts (BX-1); **stat tiles** flat, tertiary—not marketing-hover |

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

- Sticky **top navigation** bar: brand link, main nav (**Dashboard**, **Courses**, **Tasks**, **Flashcards**, **Trello**), optional **Admin** when `user?.role === 'admin'`, **Log out**
- Workspace routes render **inside** `AppShell`; auth routes (`/`, `/register`) render **outside**

**MVP shell (BX-I1):** The **implemented and approved navigation model** remains **top nav**—not a permanent sidebar hub. Stitch mockups that show a **left sidebar** are **visual reference only** for chrome density, active states, and frosted glass; they do **not** authorize sidebar implementation. **Migrating to a sidebar shell** requires a **separate approved shell phase** (layout, responsive behavior, focus order, and Security Review)—not BX-I1, not BX-I2, and not implied by selecting Stitch as the visual reference.

**Later visual treatment (approved direction, not yet built):** Restyle the existing top bar with **dark frosted glass**, electric-blue active nav, and command-center brand—without changing route structure or nav items.

**Do not add:** Sidebar navigation hub, Search Library, Source Drawer, AI Sidebar as **new** product features—unless a future phase is explicitly approved beyond visual reference.

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

Flagship **hybrid cockpit** (`StudyMaterialDetail.jsx`) — **Source | AI** is the product’s signature layout (BX-1 emphasis):

| Zone | DOM / class | Role |
|------|-------------|------|
| **Source column** | `material-workspace__cockpit-source` | **Source workspace** — edit study material (`material-workspace__editor` + instrument-style `FormCard`); anchor for reading and saving |
| **AI column** | `material-workspace__cockpit-ai` | **AI command stack** — AI Panel (generate) → **generated plan artifact** (`GeneratedPlanSection`) → **plan history** → **import toolbars** → plan **flashcard study card** when present |
| **Library band** | `material-workspace__library` (full width below cockpit) | Saved DB flashcards (distinct from plan flashcards) |
| **Danger zone** | `material-workspace__danger` | Delete material |

**≥1024px:** Two-column grid (`1fr | 1fr`); AI column gets subtle background, border, **3px primary top rule** so the command stack reads as a **dedicated product surface**. **&lt;1024px:** Stack **Source first**, then full AI stack (generate → plan → history → imports → study card).

**BX-1 / BX-I1:** Strengthen visual parity between columns—source is not “the app” with AI attached; both columns are **first-class** (see §6.3, §6.11, §6.6). **Approved visual target (later implementation):** Source column uses a **darker editor well** (readable long-form text); AI column uses **violet-tinted frosted glass**, stronger border/glow, and a clear **command stack** hierarchy matching Stitch cockpit references—without adding chat UI or new product features.

### 4.5 Other layout patterns

- **Auth:** Centered `FormCard` on canvas gradient.
- **Lists:** Vertical stacks or responsive grids of **Source Cards** with `--space-4`–`--space-6` gaps.
- **Dashboard / admin:** `dashboard-cockpit` rows of **Stat Tiles** inside **bands** today; **BX-1 direction** adds a **decision-first** dashboard hierarchy (§4.6) while keeping stat bands as **secondary/tertiary** support.

### 4.6 Dashboard — decision layout (BX-1 direction)

**Today (implemented):** `/dashboard` uses `page--cockpit`, intro `PageHeader`, and `dashboard-cockpit` **Stat Bands** fed by **`GET /api/dashboard/stats`** — honest counts only (Phase **5B** / **5C**).

**Approved presentation target (not yet implemented in code):** Reorder the dashboard so the **primary story** is *what to do next*, not a wall of numbers.

| Zone | Priority | Role |
|------|----------|------|
| **Next-up hero** | **Primary** | Answers **“What should I study next?”** — concrete next action (e.g. pending task, material without active plan, or course needing attention) plus short, honest context; may include a **bounded AI suggestion** only when backed by real product behavior (no fake “AI picked this” without data) |
| **Study pulse / decision charts** | **Secondary** | Small set of **meaningful** visuals—e.g. weekly focus minutes, tasks done vs pending, course workload mix—each tied to a **student question** (see §4.8) |
| **Course workload** | **Secondary** | Per-course breakdown: pending tasks, materials, flashcards—extends today’s `source-card--dashboard-course` rows with clearer scan and optional accent (§4.7) |
| **Deadline timeline** | **Tertiary or deferred** | Scannable upcoming due items **only** when backed by real due-date fields from the API; if not available, **label as future API / deferred**—do not invent dates |
| **Compact stats (Overview, Focus, Trello, etc.)** | **Tertiary** | Today’s **Stat Tiles** remain valid but **support** the hero—they are **not** the main headline |

**Layout guidance:** Hero spans visual top of cockpit; charts sit in a **study pulse** band (not full-width marketing widgets); stat bands move **below** or **beside** charts as compact support. **Refresh stats** stays in `page-header__actions`.

**Prototype reference:** `docs/design/PROTOTYPE_REFERENCES.md` §3 (`DashboardScreen` tab); optional `proto-01-dashboard-*.png` when captured.

### 4.7 Course identity — accents and states (BX-1 direction)

**Today (implemented):** Courses use `source-card--subject` with shared primary border accent; no per-course color in API.

**Approved presentation target (not yet implemented in code):**

| Pattern | Guidance |
|---------|----------|
| **Course accent** | Stable, accessible **accent per course** (border, pill, or header rule)—derived from course id/name hash or a future optional field; must meet contrast rules; **not** neon game colors |
| **Active vs quiet** | **Active** course (recent activity or open context) reads brighter; **quiet** courses recede (muted border/text)—state from **real** activity signals only |
| **Plan coverage** | e.g. “% of materials with an active AI plan” **only** when computable from **`totalGeneratedPlans`** / material counts per course; otherwise **future API / deferred**—no fabricated progress rings |

**Do not** add gamified progress rings, fake completion %, or vanity “health scores.”

### 4.8 Data visualization rules (BX-1)

Charts and progress visuals are **presentation direction** in this file until a separately approved implementation phase. They must **help students decide what to study**, not decorate the UI.

| Rule | Requirement |
|------|-------------|
| **Student questions** | Every chart answers a concrete question—e.g. *Where did my focus time go this week?* *How much is still pending?* *Which course is overloaded?*—not “analytics for analytics.” |
| **Honest data** | Use **API-backed** aggregates only (`GET /api/dashboard/stats`, focus session sums, task counts, per-course `courseStats`, etc.). **No** random placeholder series in production. |
| **No fake KPIs** | No vanity scores, fake productivity index, fabricated trends, or “+N%” without a real time series endpoint. |
| **No decoration** | No sparklines on stat tiles, no chart junk, no generic admin/BI dashboard patterns. |
| **Missing data** | If a visual needs fields the API does not expose (e.g. due dates for a timeline, weekly buckets for focus), show **empty state** or label **future API / deferred concept**—do not invent values. |
| **Libraries** | **No** chart libraries or npm chart packages without **separate human approval** (same gate as Tailwind/fonts). Prefer **CSS/SVG** simple bars or honest tables until approved otherwise. |
| **Implementation boundary** | **DESIGN.md** may describe charts; **implementing** them in React/CSS is a **later approved phase** (not BX-1, not BX-I1, not automatic B4). **Adding API fields** for chart series is a **separate approved product/backend phase**. |

**Candidate visuals (when data exists or API is extended):**

| Visual | Student question | Data source (today or deferred) |
|--------|------------------|--------------------------------|
| Weekly focus minutes | *How much did I focus this week?* | **Deferred** — needs time-bucketed focus API; `totalFocusMinutes` is lifetime aggregate only today |
| Tasks done vs pending | *What’s left on my plate?* | **Today** — `pendingTasks`, `completedTasks`, `totalTasks` on dashboard stats |
| Course workload distribution | *Which course needs attention?* | **Today** — `courseStats[]` per-course task/flashcard counts; extend with materials/plan coverage when API supports |
| Deadline timeline | *What’s due soon?* | **Deferred** — tasks have no due-date field in MVP API |

---

## 5. Design tokens

**Exact values:** `frontend/src/styles/tokens.css` — **authoritative** for hex, rem sizes, shadows, and layout widths. This section describes **semantic roles** only; if §5 ever disagrees with `tokens.css`, **trust `tokens.css`** for live values until a separately approved token phase (e.g. **BX-I2**) updates them.

**Today (implemented):** Production UI still uses the **Phase 8A / B1–B3 warm canvas** and **calm indigo** primary from `tokens.css`. **Approved target (BX-I1 — not yet implemented):** Stitch-aligned **dark graphite command center** semantics below.

| Role | Semantic guidance (approved target) |
|------|-------------------------------------|
| **Canvas** | **Deep graphite / deep slate** app background — focused command-center atmosphere (Stitch reference: deep graphite family, e.g. ~`#0F172A` / `#0b1326` range) |
| **Shell chrome** | **Frosted glass** top bar — translucent slate, subtle border, backdrop blur; not flat white bar |
| **Surfaces** | **Glass cards** — translucent slate elevations on canvas; readable contrast; optional raised surface for hero/modals |
| **Text** | **On-dark** primary, muted, and subtle tiers — light text on dark canvas/surfaces (meet WCAG body contrast) |
| **Primary** | **Electric blue** — primary CTAs, links, focus ring, key nav active state (Stitch reference: electric blue / primary blue family) |
| **AI accent** | **Violet** — AI panel, generate/processing, plan artifact chrome, history emphasis (distinct from primary blue) |
| **Data accent** | **Cyan** — charts, focus metrics, data visualization series (honest stats only) |
| **Course accents** | Small rotating palette (e.g. **amber, rose, emerald**) for per-course borders/pills — derived from course id hash or future optional field; accessible, not neon game UI |
| **AI zones** | Violet-tinted glass + subtle glow on active AI focus; AI column top accent; source editor uses darker **well** surface |
| **Charts** | Dedicated **chart track / fill / series** roles mapped to primary, data cyan, and course accents — for CSS/SVG only until chart libraries are separately approved |
| **Admin** | `--color-admin-accent` / `--color-admin-subtle` — admin-only surfaces (readable on dark canvas) |
| **Danger** | Restrained red; danger zones only |

**Reference-level palette (not `tokens.css` values):** See `docs/design/STITCH_VISUAL_STYLE_GUIDE.md` for Stitch export names (electric blue, vibrant violet, cyan tertiary, subject accent colors). Implementation phases map these into semantic CSS variables in `tokens.css`—do not paste Stitch YAML verbatim as production truth without review.

**Typography:** **System stack** in `tokens.css` unless a human separately approves a webfont (e.g. Hanken Grotesk in Stitch reference requires CDN/package approval). Material body: ~16px, `line-height-body` ~1.6. Use **tabular numerals** for stats, timers, and “Card X of N”. Display/hero may use heavier weights when fonts are approved.

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

**Implementation:** `FormCard` (+ `material-workspace__editor-card` on material detail): instrument surface, `elevation-2`, optional **left accent** on source editor. **Target (BX-I1):** source editor on a **darker well**; glass instrument card on graphite canvas when tokens are updated.

**Use:** Auth forms, create course/material, edit course title, edit material, task create/edit, flashcard create/edit, Trello credential steps.

### 6.3 AI Panel (`ai-panel`) — AI command panel

**Purpose:** **First-class AI command surface** on material detail—the student’s **study command panel** for this material (generate, processing, plan artifact, history)—not a minor form block.

**Structure:** `ai-panel__header` (title + lead), `ai-panel__hint` (warnings), `ai-panel__actions` (primary CTA), `ai-panel__loading` (**Processing Lane** when active). Stacks with **GeneratedPlanSection** (artifact), **Plan History**, **Import Toolbar**, and plan **Study Card** in the AI column (§4.4).

**Use:** **Generate study plan** on material detail; visually distinct from Instrument Cards (tint, border, cockpit AI column rule at ≥1024px).

**Target presentation (BX-I1 — later CSS phases):** Move the AI command panel and full AI column toward Stitch’s **dark/glass command stack**—violet AI accent, electric-blue primary **Generate** CTA, frosted surfaces, restrained glow on processing/active plan—not a light beige side form. **Generated plan artifact**, **plan history**, **import toolbar**, and **plan flashcard study card** share the same command-column visual family.

**Rules:** **One primary** per state (Generate vs Processing). Do not compete visually with **Save changes** in the source column. AI column should read as **“command stack”** in hierarchy—equal weight to source editor, not an afterthought sidebar.

### 6.4 Stat Tile (`dashboard-stat` + `dashboard-band`)

**Purpose:** Honest **read-only aggregates** on `/dashboard` and `/admin`—**supporting** detail, not the dashboard’s primary story (§4.6).

**Implementation:** `StatBand` / `StatItem` → `dashboard-band`, `dashboard-stat`.

**Rules:** Real API counts from **`GET /api/dashboard/stats`** / **`GET /api/admin/stats`** only; **no** decorative sparklines, fake deltas, or “+12% vs last week” without a real API series. Minimal or no hover lift. Admin bands may use `dashboard-band--admin-*` modifiers.

**BX-1:** Stat tiles move to **secondary/tertiary** hierarchy when dashboard is redesigned; they do **not** disappear— they **stop leading** the page.

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

**Layout (today):** `page--cockpit`, `PageHeader` intro, `dashboard-cockpit` **Stat Bands** + per-course rows.

**Layout (BX-1 direction — not yet in code):** Decision-first cockpit per §4.6 — **Next-up hero** (“What should I study next?”) → **study pulse** charts (honest data only, §4.8) → **course workload** → optional **deadline timeline** (deferred without due-date API) → **compact stat bands** as tertiary support.

**Content (today):** Real stats from **`GET /api/dashboard/stats`** — Overview, Tasks (optional completion % when `totalTasks > 0`), Focus (`totalFocusMinutes`, `completedFocusSessions`), Learning assets, Trello sync count, per-course `source-card--dashboard-course` rows.

**Not:** Fake KPIs, decorative sparklines, streaks, Gemini logs, random placeholder chart data, generic BI layout. **Refresh stats** in header actions; silent refresh when mounted (**5C.1**).

**Prototype:** `proto-01-dashboard-*.png` when captured (`PROTOTYPE_REFERENCES.md`). **Recapture** `03-dashboard.png` after an approved dashboard visual implementation phase.

### 7.4 Courses — empty (`/courses`) — `04-courses-empty.png`

`h1` + `EmptyState` + create CTA.

### 7.5 Courses — create form (`/courses`) — `05-create-course-form.png`

Inline/toggled Instrument Card; title only.

### 7.6 Courses list (`/courses`) — `06-courses-list.png`

**Cockpit** layout; `PageHeader` + **New course**; grid/list of **Source Cards** (`source-card--subject`).

**BX-1 direction:** Per-course **accent identity** and **active vs quiet** states when implemented (§4.7); optional `proto-02-courses-full.png`.

### 7.7 Course detail (`/courses/:id`) — `07-course-detail-materials.png`

**Workspace/cockpit** subject hub: course title, edit title Instrument Card, **Study materials** as **document Source Cards**, add material form, **course tasks** section (filters, task rows), danger zone separated. **No** fake `stats` stub metrics (API course stats remain zero stub until a real metrics phase).

**BX-1 direction:** Course header may carry **accent** (§4.7); **plan coverage** indicator only when computable from real material + active-plan counts—otherwise deferred.

### 7.8 Create material (`/courses/:id`) — `08-create-material-form.png`

Add material Instrument Card: title, source type, large `Textarea`, create/cancel.

### 7.9 Study material detail (`/study-materials/:materialId`) — `09`–`12`, `11`, pending `15`

**Cockpit + Source | AI split** (§4.4) — flagship **AI study command** surface:

- `PageHeader` intro: material title, workspace lead, back to course
- **Source column:** Edit study material; unsaved hint; Save
- **AI column (command stack):** **AI Panel** (generate) → **generated plan artifact** (`GeneratedPlanSection`) → **plan history** (`GeneratedPlanHistorySection`) → **import toolbars** → plan **flashcard study card** (`FlashcardStudy--plan`) when `plan.flashcards` exist
- **Library band:** `DbFlashcardsSection` (saved DB flashcards + `FlashcardStudy--library`)
- **Danger zone:** delete material

**BX-1:** Treat AI column as **first-class command panel** (§6.3)—not a secondary form. **Prototype:** `proto-03-material-cockpit-*.png` when captured.

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
- **Implementing** dashboard/course charts in React/CSS during BX-1; **chart npm libraries** without separate approval
- **Placeholder or random** chart data in production UI
- KPI widgets, streaks, fake progress, **fake productivity scores**, gamification, confetti, mascot UI
- **Unbounded** plan library, cross-material plan browser, sync badges
- Client POST of plan JSON; course-level paste-generate with client `studyText`
- Source **upload**, file picker, drive connectors
- Audio overview, citations panel, notebook sharing (NotebookLM clone features)
- Search Library, Source Drawer, Recent Sources, Drafting Space
- AI Sidebar as permanent product navigation
- **General chat route** or ever-scroll chat as primary AI surface
- Permanent sidebar **hub** beyond minimal top bar
- Footer links (Privacy, Terms, Help Center) unless separately approved
- **Dark hacker-terminal** UI (matrix chrome, unreadable neon, monospace “terminal” aesthetic) or **medical/clinical** teal palette
- **Unreadable neon** or decorative glow that fails contrast/accessibility
- **Native mobile / app-store** product scope (responsive web only—see §0)
- **Canvas prototype code** copied into production (`frontend/src`)
- Trello OAuth, stored credentials, PDF upload, payments, polling/WebSockets
- New routes, APIs, tables, or backend changes **justified by this file**
- **Phase B4** global styling rollout—**not started** by BX-1 or BX-I1

**Allowed presentation direction (BX-I1 — documented, not built):** **Accessible dark SaaS** / **graphite study command center** with frosted glass and electric blue / violet / cyan accents—distinct from hacker-terminal and hospital/clinical tropes.

**In scope for presentation (documented, not necessarily built):** Bounded **plan history** on material detail (**11A-3**); tasks, flashcards, Trello, focus, dashboard, admin polish; **BX-1** direction for decision dashboard, honest charts, course accents, AI command emphasis; **BX-I1** Stitch-selected dark/glass/accent skin.

**BX-1 / BX-I1 boundaries:** This file may **describe** charts, dashboard hierarchy, dark theme, and Stitch-aligned surfaces. **Building** them requires later approval (BX-I2+). **BX-I1 does not approve:** `tokens.css` edits, frontend/CSS implementation, dark theme in production, sidebar shell, chart UI, font/CDN/package additions, backend/API changes, or **B4**.

**Dashboard API extensions** (time buckets, due dates, plan coverage per course) require a **separate approved backend/product phase**.

Label future mocks: **concept only — not implemented** or **future API / deferred**.

---

## 15. What not to do

- Do **not** use Stitch HTML/React as source of truth
- Do **not** add Tailwind, Google Fonts CDN, Material Icons without approval
- Do **not** clone inspiration products’ branding, layouts, or exclusive features
- Do **not** use this file to justify new APIs, tables, or routes
- Do **not** imply client sends `studyText` on generate
- Do **not** show fake dashboard stats or **fabricated chart series**
- Do **not** add chart libraries or decorative sparklines without approval
- Do **not** copy Canvas prototype `.tsx` into `frontend/src`
- Do **not** treat BX-1 or BX-I1 doc updates as approval for **B4**, **tokens.css** changes, dark theme in code, sidebar shell, or chart implementation
- Do **not** confuse **accessible dark graphite SaaS** with **hacker-terminal** or unreadable neon styling
- Do **not** add interactive checkboxes on generated tasks in plan display
- Do **not** treat outdated screenshots as product truth
- Do **not** add chat UI without separate approval

---

## 16. When agents may apply DESIGN.md

| Situation | Allowed |
|-----------|---------|
| **Phase A / BX-1 / BX-I1** — updating this file | Yes (documentation only) |
| **Planning / Stitch / prototype** | `STITCH_SELECTED_REFERENCE.md` + `STITCH_VISUAL_STYLE_GUIDE.md` + historical brief + `PROTOTYPE_REFERENCES.md` + screenshot index; **this file** is presentation authority |
| **Phase 2J / 8A / 8C / B1–B3 styling** | **Baseline complete** — further CSS/React presentation requires new approval |
| **BX-1 direction in code** (dashboard hero, charts, course accents) | Requires explicit approval **after Supervisor Review** — **not** implied by BX-1 doc edit |
| **BX-I1 Stitch visual direction in code** (dark tokens, glass, accents, cockpit skin) | Requires explicit approval **after Supervisor Review of BX-I1** (e.g. BX-I2+) — **not** implied by BX-I1 doc edit |
| **Sidebar shell migration** | **Separate** explicit approval — Stitch sidebar is reference-only in BX-I1 |
| **Chart libraries / new dashboard API fields** | **Separate** explicit approval each |
| **Phase B4** global styling rollout | **Not started** by BX-1 or BX-I1; pending separate gate |
| **Visual Design Direction implementation** | Requires explicit approval (e.g. `approved — implement … Phase B*`) after Supervisor Review |
| **Functional feature work** | Follow `IMPLEMENTATION_STATUS`; this file for presentation only |
| **Scope expansion** | **Never** — PRD + human approval |

**Phase BX-1:** Documentation only. **Stop** after doc changes; wait for **Supervisor Review** before dashboard charts, course accents in CSS, or **B4**.

**Phase BX-I1 (this update):** Documentation only. **Stop** after doc changes; wait for **Supervisor Review** before **`tokens.css`**, dark theme, shell skin, dashboard hero, charts, course accents, material cockpit styling, sidebar, fonts/CDN, or **B4**.

---

## 17. Styling implementation guide (baseline complete)

Phases **2J**, **8A**, **8C**, and **B1–B3** established:

1. `frontend/src/styles/tokens.css` — source of truth for values
2. `components.css`, `layout.css` — Source Cards, AI Panel, cockpit grids, bands
3. `AppShell`, `PageHeader` on workspace routes
4. Material **Source | AI** cockpit

**BX-1 (docs only):** Decision-first dashboard hierarchy, chart honesty rules, course accent direction, AI command-panel emphasis—see §4.6–§4.8. **Not yet applied in CSS/React.**

**BX-I1 (docs only):** Stitch-selected **dark graphite / glass** command-center presentation, electric blue / violet / cyan accents, course accent palette, top-nav MVP (sidebar reference-only)—see §0, §4.1, §5, §6.3. **Not yet applied in `tokens.css` or React/CSS.**

**Further presentation work:** Requires explicit approval; compare live UI to this file + `STITCH_SELECTED_REFERENCE.md` + `PROTOTYPE_REFERENCES.md`, not pre-8C PNGs alone.

**Forbidden without approval:** New UI libraries (including **chart packages**); Stitch/Canvas merge into `frontend/src`; scope expansion; chat UI; **B4** unless explicitly approved.

---

## 18. Related documents

- `docs/IMPLEMENTATION_STATUS.md` — built vs deferred
- `docs/STITCH_BRIEF.md` — historical Stitch input
- `docs/design/SCREENSHOT_INDEX.md` — screenshot checklist and drift notes
- `docs/design/PROTOTYPE_REFERENCES.md` — BX-0 Canvas + prototype capture strategy
- `docs/design/STITCH_SELECTED_REFERENCE.md` — BX-S selected Stitch direction (reference only)
- `docs/design/STITCH_VISUAL_STYLE_GUIDE.md` — Stitch palette, glass, typography principles (reference only)
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
| 2026-06-01 | **Phase BX-1** — Dashboard decision layout (next-up hero, study pulse charts, tertiary stat bands); data visualization rules (honest API-only, no fake KPIs/sparklines/libraries); course accent + active/quiet states; plan coverage deferred; stronger Source \| AI + AI command panel; material cockpit artifact/history/flashcard emphasis; `PROTOTYPE_REFERENCES.md` authority row; BX-1 does not start B4 or chart/API implementation |
| 2026-06-01 | **Phase BX-I1** — Stitch-selected visual delta: dark graphite/glass AI study command center; electric blue primary, violet AI accent, cyan data accent, course accent palette; dashboard as decision hub; stronger Source \| AI / AI command panel direction; **top nav remains MVP**; Stitch **sidebar reference-only** (separate shell phase); accessible dark SaaS allowed—hacker terminal / unreadable neon / clinical / gamification still forbidden; chart/data honesty retained; `STITCH_SELECTED_REFERENCE.md` + `STITCH_VISUAL_STYLE_GUIDE.md` authority rows; BX-I1 does not approve tokens.css, frontend implementation, sidebar, charts, fonts/CDN, API changes, or B4 |
