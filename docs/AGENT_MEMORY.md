# AGENT_MEMORY.md — StudyOps AI

## Executive Summary

**Read order for agents and owner:**

1. **`docs/CURRENT_STATE.md`** — where the project is now (phase, suspended work, forbidden assumptions).
2. **`docs/IMPLEMENTATION_STATUS.md`** — authoritative **shipped** behavior (routes, APIs, DB, deferred list).
3. **This file (`AGENT_MEMORY.md`)** — **historical journal + pitfalls** only. Append-only; entries below are not a substitute for (1) or (2).

**Branch / phase (2026-06-03):** post-**DOCS-BX-I10A6-QA** — **BX-I10A6-QA** Trello failed-row live verification **complete** (**Pass with notes**, review only, **no** repo file changes); prior **DOCS-BX-I10A5** / **BX-I10A5** targeted glass/elevation pass **complete** (commit **`38aa561`**); **BX-I10A5-SMOKE** **Pass with notes**; prior **BX-I10A4** (commit **`7e5e61f`**); prior **BX-I10A3**–**BX-I10A1**; prior **BX-I9C** + **BX-I9C-Auth** final visual QA **complete** (**Pass with notes**); prior **BX-I9B2d** (commit **`ae5cfc8`**); **BX-I9B2** color token sub-sequence **complete**; **BX-I7** desktop layout sequence **complete**; Stitch visual style guide **v2.2** at **`docs/design/studyops_ai_visual_style_guide_v2_2.md`** (**reference artifact only**). Deferred optional follow-ups (**not automatic**): optional material editor/library elevation alignment; optional global shadow/token cleanup only if explicitly approved; **ROADMAP-A1** background automations + AWS architecture planning; optional material detail course accent JSX if explicitly approved. Next optional polish is **separate-gated** — **not automatic** (**BX-I10A6-QA complete** — **no** fix phase required). **BX-I7E4** Admin desktop stats panels **complete** (commit **`467ccd9`**); **BX-I7E3 Tier A** Trello desktop setup panels **complete** (commit **`cba6dde`**); **BX-I7E2** Flashcards desktop panels **complete** (commit **`b18304c`**); **BX-I7E1** Tasks desktop panels **complete** (commit **`d0db43e`**); **BX-I7D Tier 1** courses/course detail desktop shelf expansion **complete** (commit **`52c68ab`**); **BX-I7C** dashboard desktop grid **complete** (commit **`583922d`**); **BX-I7B** global desktop cockpit shell widening **complete** (commit **`00d3255`**); **B4-F3A** / **B4-F3B** / **B4-F3C** all **complete**; **BX-I7A** audit **complete** (documentation only); optional **BX-I7D Tier 2** and **BX-I7E3 Tier B** **proposed**, **not started**; next implementation phase **not automatic**. Phase **DOCS-WEB-ONLY** complete — web-only product scope clarified in governance and status docs. Docs phases **DOCS-A3** and **BX-I1** complete; **BX-I2** implementation complete (commit **`03ee9df`**); **BX-I3** implementation complete (commit **`bdd6f2a`**); **BX-I4** implementation complete (commit **`ff65e21`**); **BX-I5** implementation complete (commit **`c2288d4`**); **BX-I6B** implementation complete (commit **`cceb4e0`**); **BX-I6C** implementation complete (commit **`6a1e6ad`**); **BX-I6D** implementation complete (commit **`9252ba9`**); **B4-A** implementation complete (commit **`4ae80ee`**); **B4-B** implementation complete (commit **`f91415d`**); **B4-C** implementation complete (commit **`cf50729`**); **B4-D** implementation complete (commit **`905ee4d`**); **B4-E** implementation complete (commit **`7f4bf6b`**); **B4-F1** implementation complete (commit **`ea8a899`**); **B4-F2** implementation complete (commit **`ee50b8e`**); **B4-F3A** implementation complete (commit **`596e869`**); **B4-F3B** implementation complete (commit **`ee5357f`**); **B4-F3C1** implementation complete (commit **`d0393d7`**); **B4-F3C2** implementation complete (commit **`d1a3c69`**); **B4-F3C3** implementation complete (commit **`ab28307`**). **`DESIGN.md` v2.3** (commit **`6041932`**) documents Stitch-selected visual direction. Functional MVP through **6A-3** + **10B** + **11A-3** + **12A-1** + **B1**–**B3** + **BX-I2** + **BX-I3** + **BX-I4** + **BX-I5** + **BX-I6B** + **BX-I6C** + **BX-I6D** + **B4-A** + **B4-B** + **B4-C** + **B4-D** + **B4-E** + **B4-F1** + **B4-F2** + **B4-F3A** + **B4-F3B** + **B4-F3C1** + **B4-F3C2** + **B4-F3C3** + **BX-I8B** — authoritative detail in **`docs/IMPLEMENTATION_STATUS.md`**; phase gates in **`docs/CURRENT_STATE.md`**.

**Major caution — do not proceed without explicit approval:**

- **Phase BX-I10A6-QA** is **complete** (**review only** — **no** implementation commit). **Pass with notes** on Vite dev **`http://localhost:5173`**; route **`/trello`** at **~375px** / **1280px** (**narrow responsive browser viewport**, **not** native mobile). Failed sync row triggered live with harmless fake Trello API key/token — **no** real credentials, **no** Trello cards created; backend **HTTP 401** / **`TRELLO_AUTH`** / structured **`trello_api_error`** only. Step 5 **Sync results**: failed row/badge/error readable; danger/error styling distinct from course rose and success green; Trello command deck, picker, Sync button, and credential hygiene regressions held; results/failed row **no** horizontal overflow. **Non-blocking:** placeholder list ID via one-time runtime **`onListChange`** workaround; top-nav horizontal scroll at **~375px** pre-existing shell behavior; full frontend console history not captured retroactively. **No** fix phase required. **BX-I10A6-QA completion does not automatically approve** optional material editor/library elevation, global shadow/token cleanup, top-nav shell polish, **ROADMAP-A1**, material detail course accent JSX, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension.
- **Phase BX-I10A5** is **complete** (**CSS-only** — commit **`38aa561`**). **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only — softened navigable-card hover (**`--elevation-1`**, **`transform: none`**); quiet inline glass on tasks create/edit, flashcards library/create, Trello wizard/sync/results steps, course settings/create-material/materials empty; optional **`.trello-task-list__label`** polish + Focus session outer panel softening; **`prefers-reduced-motion`** disables new glass **`backdrop-filter`**; **no** JSX/API/backend/package/**`tokens.css`**/**`base.css`** changes; **BX-I10A1** flashcard study, **BX-I10A2** Generate gradient, **BX-I10A3** filter toolbar, **BX-I10A4** accent rails, dashboard hero, material AI cockpit, material editor/library elevation **unchanged**. Supervisor Review **Pass with notes**. Security / Trust Review **Pass with notes**. **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed. **BX-I10A5-SMOKE** **Pass with notes** on **`http://localhost:5173`** at **~375px** / **1280px** (**narrow responsive browser viewport**, **not** native mobile) — full authenticated route matrix + material spot check; **no** horizontal overflow; **no** sensitive logging in UI. **Non-blocking:** materials empty dashed state not reachable (QA course had one material); real pointer hover not fully MCP-verified; MCP console export limited. **BX-I10A5 completion did not automatically approve** **BX-I10A6-QA** (now **complete** — **Pass with notes**), optional material editor/library elevation, global shadow/token cleanup, **ROADMAP-A1**, material detail course accent JSX, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension.
- **Phase BX-I10A4** is **complete** (**CSS-only** — commit **`7e5e61f`**). **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only — **6px** course identity rails on course surfaces; dashboard course rows inherit stronger rail; course detail intro inset **4px**; materials primary **4px** top rule; **3px** muted document-shelf hint via **`color-mix`** on course detail (full accent on hover); document/material cards remain secondary; **no** JSX/**`StudyMaterialDetail.jsx`**/**`tokens.css`**/**`base.css`**/backend/API/package changes; **BX-I10A1** flashcard study, **BX-I10A2** Generate gradient, **BX-I10A3** filter toolbar, material AI cockpit unchanged. Supervisor Review **Approve with notes**. Security / Trust Review **Pass with notes**. **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed. **BX-I10A4-SMOKE** **Pass with notes** on **`http://localhost:5173`** at **~375px** / **1280px** (**narrow responsive browser viewport**, **not** native mobile) — **`/courses`**, **`/dashboard`**, **`/courses/:id`**, material + flashcards spot checks; **no** horizontal overflow; danger zone clearly destructive. **Non-blocking:** rose accent not in QA seed; document-shelf pointer hover not fully verified; MCP console export limited. **BX-I10A4 completion did not automatically approve** **BX-I10A5** (now **complete** at **`38aa561`**), **BX-I10A6-QA**, **ROADMAP-A1**, material detail course accent JSX, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension.
- **Phase BX-I10A3** is **complete** (**CSS-only** — commit **`cb54ec5`**). **`frontend/src/styles/layout.css`** only — global **`.filter-toolbar`** glass/inset surface; **`.filter-toolbar--segmented .filter-toolbar__segment`** restrained inset glass; task/flashcard/course-detail filters inherit shared glass; quiet-glass filter-empty strips (**`.task-workspace__filter-empty`**, **`.flashcards-workspace__filter-empty`**, **`.course-workspace__tasks-filter-empty`**) — global **`.section__meta`** **not** broadly rewritten; tasks/flashcards **`.empty-state`** downgrades removed; **`prefers-reduced-motion`** disables toolbar backdrop blur; **no** JSX/API/backend/package/**`components.css`**/**`tokens.css`**/**`base.css`** changes; filter/search/task behavior unchanged. Supervisor Review **Approve with notes**. Security / Trust Review **Pass with notes**. **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed. **BX-I10A3-SMOKE** **Pass with notes** on **`http://localhost:5173`** — **`/tasks`**, **`/flashcards`**, **`/courses/:id`** at **~375px** / **1280px**; material spot check; **no** horizontal overflow; **BX-I10A1** study surface, **BX-I10A2** Generate gradient, material AI cockpit unchanged; **no** sensitive logging in UI. **Non-blocking:** flashcards filter-empty and true empty state not reachable with QA seed; MCP console export limited. **BX-I10A3 completion does not automatically approve** **BX-I10A4** accent rails, **BX-I10A5** glass/elevation pass, **BX-I10A6-QA**, **ROADMAP-A1**, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension.
- **Phase BX-I10A2** is **complete** (**CSS-only** — commit **`b90108e`**). **`frontend/src/styles/components.css`** only — scoped violet→blue AI gradient on material **Generate study plan** CTA via **`.page--material-detail .material-workspace__cockpit-ai .material-workspace__generate .ai-panel__actions .btn.btn--primary`**; global **`.btn--primary`** unchanged; **Save changes** and other route primary buttons remain standard blue; **no** JSX/API/backend/package/token/layout/base changes; generate handler, loading/disabled logic, API flow, and copy **unchanged**. Supervisor Review **Approve with notes**. Security / Trust Review **Pass with notes**. **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed. **BX-I10A2-SMOKE** **Pass with notes** on **`http://localhost:5173`** — **`/study-materials/:id`** at **~375px** / **1280px**; spot checks **`/dashboard`**, **`/`**, **`/register`**, **`/flashcards`**, **`/trello`**; **no** horizontal overflow; **Source \| AI** desktop layout held; **no** sensitive console logs. **Non-blocking:** Generate loading not live-triggered; plan history/import buttons not visible (no saved plan); expected generated-plan **404** as empty state. **BX-I10A2 completion did not automatically approve** **BX-I10A3** (now **complete** at **`cb54ec5`**) or later polish phases.
- **Phase BX-I10A1** is **complete** (**CSS-only** — commit **`e62c1b0`**). **`frontend/src/styles/components.css`** only — frosted glass **`.flashcard-study`** stage (centered max-width, gradient surface, glass border, backdrop blur); improved Q/A hierarchy and counter readability; **`flashcard-study--plan`** violet accent CSS preserved; **no** JSX/API/backend/package/token/behavior changes; **FlashcardStudy** unchanged (reveal, prev/next, counter, plain-text rendering). At **BX-I10A1** time material **Generate** was still primary blue; gradient shipped in **BX-I10A2**. Supervisor Review **Approve — safe to commit**. Security / Trust Review **Pass**. **BX-I10A1-SMOKE** **Pass with notes**. **Non-blocking:** **`flashcard-study--plan`** not live-verified. **BX-I10A1 completion did not automatically approve** **BX-I10A2** (now **complete** at **`b90108e`**) or later polish phases.
- **Phase BX-I9C** + **BX-I9C-Auth** are **complete** (**review only** — **no** implementation commit). **BX-I9C** initial pass: **Pass with notes** on **`/`**, **`/register`**; authenticated matrix blocked. **BX-I9C-Auth** on Vite dev **`http://localhost:5173`** at **~375px** / **1280px** / **1440px**: all required authenticated routes verified; **Pass with notes**; **no** critical or blocking important issues; **no** repo file changes. Runtime test data only (**not** repo): **`bx-i9c-auth-20260603@example.test`**, **BX-I9C QA Course**, **BX-I9C QA Material**, **BX-I9C QA Task**. **Non-blocking at BX-I9C-Auth time:** Trello failed rows not exercised (later covered in **BX-I10A6-QA**); keyboard/focus automation limited. **Not** final Stitch-perfect. **BX-I9C completion did not automatically approve** **BX-I10A1** (now **complete** at **`e62c1b0`**) or **BX-I10A2** AI Generate gradient, glass/elevation pass, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension.
- **Phase BX-I9B2d** is **complete** (**CSS-only** — commit **`ae5cfc8`**). Danger/error visual QA **completed** in **BX-I9C** / **BX-I9C-Auth**. Completes **BX-I9B2** color token sub-sequence — does **not** complete full Stitch-level UI. **BX-I9B2d completion does not automatically approve** AI Generate gradient, **flashcard-study** glass polish, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases.
- **Phase BX-I9B2c** is **complete** (**CSS-only** — commit **`19d444e`**). **`frontend/src/styles/tokens.css`**, **`components.css`**, **`layout.css`** — Stitch v2.2 AI Accent **`#8B5CF6`**: **`--color-ai-accent`** **`#8b5cf6`**; AI rgba family re-based to **rgb(139, 92, 246)**; **`--glow-ai`** **`rgba(139, 92, 246, 0.2)`**; **`components.css`** **20** mechanical **`rgba(208, 188, 255, α)` → `rgba(139, 92, 246, α)`** replacements; **`layout.css`** **3** replacements; alphas preserved; stale lavender check **`rg "208,\s*188,\s*255|#d0bcff" frontend/src/styles`** — **no matches**; **no** selector/layout/spacing/motion/border-width changes; **no** radius/canvas/shell/primary/cyan/danger/error changes; **no** JSX/API/backend/package/behavior/copy/logging changes; **Generate** CTA remains primary blue; indirect cascade via **`var(--color-ai-*)`** / **`var(--glow-ai)`** **expected**; **375px** layout unchanged. Supervisor Review **PASS**. Security / Trust Review **PASS**. Authenticated visual smoke **recommended before merge** — **not blocking**. Improves AI/violet alignment — does **not** complete full Stitch-level UI or **BX-I9B2d** color work. **BX-I9B2c completion does not automatically approve** **BX-I9B2d**, AI Generate gradient, **flashcard-study** glass polish, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases.
- **Phase BX-I9B2b** is **complete** (**CSS-only** — commit **`b4d7b93`**). **`frontend/src/styles/tokens.css`** only — Stitch v2.2 primary blue + cyan/data color alignment: **`--color-primary`** **`#3B82F6`**; **`--color-primary-hover`** **`#2563EB`**; **`--color-primary-subtle`** / **`--color-primary-border`** re-based to **rgb(59, 130, 246)**; **`--color-primary-fill`** **`#2563EB`** / **`--color-primary-fill-hover`** **`#1D4ED8`** (**not** **`#3B82F6`** — WCAG AA white labels on filled primary controls); **`--color-focus-ring`** remains **`var(--color-primary)`**; **`--shadow-focus`** / **`--shadow-focus-subtle`** / **`--shadow-focus-field`** / **`--glow-primary`** re-based to **rgb(59, 130, 246)**; **`--color-data-accent`** **`#06B6D4`**; **`--color-chart-series-1`** **`#06B6D4`**; **`--color-chart-series-2`** **`#3B82F6`**; **`--color-chart-fill`** **`rgba(6, 182, 212, 0.5)`**; **no** **`--radius-*`** changes; **no** canvas/shell (**BX-I9B2a**), AI/violet, danger/error/success/warning, surface/text/editor, course-accent, admin, or **`--glow-ai`** changes; **`components.css`** / **`layout.css`** / **`base.css`** untouched; **no** JSX/API/backend/package/behavior/copy/logging changes; indirect cascade via existing **`var(--color-primary*)`** / data-accent / chart / focus vars **expected**; **375px** layout unchanged. Supervisor Review **PASS**. Security / Trust Review **PASS**. Authenticated visual smoke **recommended before merge** (especially primary links on glass/cards, dashboard hero cyan eyebrow, shell/nav/field focus) — **not blocking**. Known QA: primary links on glass may be slightly weaker; hero eyebrow depends on gradient — verify visually. Improves primary/cyan alignment — does **not** complete full Stitch-level UI or **BX-I9B2c**–**BX-I9B2d** color work. **BX-I9B2b completion does not automatically approve** **BX-I9B2c** AI/violet color token alignment, **BX-I9B2d**, AI Generate gradient, **flashcard-study** glass polish, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases.
- **Phase BX-I9B2a** is **complete** (**CSS-only** — commit **`f92cbda`**). **`frontend/src/styles/tokens.css`** only — Stitch v2.2 canvas/shell environment color alignment: **`--color-bg`** **`#0F172A`**; **`--color-bg-subtle`** harmonized (**`#1a2332`**); **`--color-bg-auth`** gradient harmonized; **`--color-shell-bg`** toward **`#0B0F1A`** with translucency preserved; **`--color-shell-border`** slightly softened; **no** **`--radius-*`** changes; **no** primary/AI/cyan/danger/focus/glow/shadow/surface/text/editor/chart/course-accent token changes; **`components.css`** / **`layout.css`** / **`base.css`** untouched; **no** JSX/API/backend/package/behavior/copy/logging changes; **no** AI Generate gradient; **no** flashcard-study polish; **no** glass/elevation pass; indirect cascade via existing **`layout.css`** **`var(--color-bg*)`** / shell vars **expected**; **375px** layout unchanged. Supervisor Review **PASS**. Security / Trust Review **PASS**. Authenticated visual smoke **recommended before merge**, **not blocking**. Improves canvas/shell alignment — does **not** complete full Stitch-level UI or **BX-I9B2c**–**BX-I9B2d** color work (**BX-I9B2b** primary/cyan shipped separately at **`b4d7b93`**). **BX-I9B2a completion does not automatically approve** **BX-I9B2b** (now **complete** at **`b4d7b93`**), **BX-I9B2c**, **BX-I9B2d**, AI Generate gradient, **flashcard-study** glass polish, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases.
- **Phase BX-I9B1** is **complete** (**CSS-only** — commit **`9ec2917`**). **`frontend/src/styles/tokens.css`** + **`frontend/src/styles/components.css`** only — Stitch Round Eight radius alignment: **`--radius-sm`**: **8px**; **`--radius-md`**: **12px**; **`--radius-lg`** / **`--radius-xl`** unchanged; **`.btn`** / **`.link-btn`** use **`--radius-md`**; **`.field__*`** remain **`--radius-sm`**; **no** color/shadow/spacing/typography token changes; **`layout.css`** / **`base.css`** untouched; **no** JSX/API/backend/routes/services/behavior/copy/logging changes; **no** AI Generate gradient; **no** flashcard-study polish; **no** **BX-I9B2** color work; indirect token cascade to pills/cards **expected**; **375px** layout unchanged. Prior Security / Trust Review **PASS**. Authenticated visual smoke **recommended before merge**, **not blocking**. Improves radius scale — does **not** complete full Stitch-level UI or **BX-I9B2** color work. **BX-I9B1 completion does not automatically approve** **BX-I9B2** color token alignment, AI Generate gradient, **flashcard-study** glass polish, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases.
- **Phase BX-I8E** is **complete** (**CSS-only** — commit **`52b7b78`**). **`frontend/src/styles/components.css`** only — conservative shared primitive alignment: global **`.form-card`** baseline glass-border + subtle raised gradient; **`.source-card`** baseline glass-border only; **`.link-btn--primary`** / **`.link-btn--danger`** parity with **`.btn`** variants (unused in JSX until adopted); **`.link-btn--secondary:hover:not(.link-btn--disabled)`** and **`.link-btn--disabled`** **`transform: none`**; **`.alert--success`** visual parity with **`.alert--error`**; **`layout.css`** / **`tokens.css`** / **`base.css`** untouched at **BX-I8E** time (radius tokens updated later in **BX-I9B1**); **375px** stacked; **no** JSX/API/backend/routes/services/behavior/copy/logging changes; **no** fake metrics/charts/scores/sidebar/mobile-native UI; optional scope **not implemented**. Visual Style Guide v2.2 alignment check **passed** — font/AI-gradient gaps **deferred** (radius addressed in **BX-I9B1**). **BX-I8E completion did not automatically approve** **BX-I9B1** (now **complete** at **`9ec2917`**), **BX-I9B2**, AI Generate gradient, or **flashcard-study** polish — separate gated phases each.
- **Phase BX-I8D** is **complete** (**CSS-only** — commit **`51cdc77`**). **`frontend/src/styles/components.css`** + **`frontend/src/styles/base.css`** only — processing opacity pulse on **`.ai-panel__loading--active .loading`** only during real AI generate (**`generating`** + Processing Lane); short one-shot **`plan-fade-in`** on **`.plan-panel__status--success`**, **`.plan-history__preview-panel`**, **`.focus-done`**; **`prefers-reduced-motion`** disables pulse, entrances, and press/hover transforms; **375px** stacked; **BX-I7** / **BX-I8B** / **BX-I8C** layouts preserved; **no** JSX/JS/API/backend/routes/tokens/behavior/copy/**`aria-live`** changes; **no** route transitions, **`App.jsx`**, **`useLocation`**, fake idle AI thinking, fake metrics/charts, or idle decorative infinite animation. Prior Security / Trust Review **PASS**. Manual smoke **recommended before merge**, **not blocking**. Improves motion on real processing/success paths — does **not** complete full Stitch-level UI. **BX-I8D completion does not automatically approve** **BX-I8E** (now **complete** at **`52b7b78`**), **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases.
- **Phase BX-I8C** is **complete** (**CSS-only** — commit **`8008dc1`**). **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only — auth screens use glass/command-center **`.page--auth .form-card`** chrome; intro **`PageHeader`** uses glass intro band + top gradient rule (**.page-header--intro** only; non-intro **`.page-header`** unchanged); **`.auth-brand`** gradient bar + soft glow on **`/`** and **`/register`**; course accent header on **`CourseDetail`** preserved; **375px** stacked layout preserved; **BX-I7** desktop grids and **BX-I8B** material AI cockpit layout preserved; **no** `tokens.css`, **`base.css`**, JSX, API, services, backend, auth, routes, behavior, copy, logging, or content-exposure changes; **no** fake metrics, charts, scores, sidebar, or mobile-native UI. Prior Security / Trust Review **PASS**. Focus-visible clipping smoke on intro header actions **recommended but not blocking**. Improves auth/intro chrome — does **not** complete full Stitch-level UI. **BX-I8C completion does not automatically approve** **BX-I8D**, **BX-I8E**, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases.
- **Phase BX-I8B** is **complete** (**CSS-only** — commit **`bda2645`**). **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only — on **`/study-materials/:materialId`**: material-detail AI command surfaces use stronger violet/glass treatment (generate panel, loading lane, plan output, history, import bands, cockpit AI shell); **Generate** CTA remains electric blue / primary; **375px** stacked; **BX-I7F** material cockpit layout preserved; **no** `tokens.css`, JSX, API, services, backend, auth, routes, behavior, copy, logging, or content-exposure changes; **no** fake metrics, charts, scores, sidebar, or mobile-native UI; generate/import/save/history/flashcards library behavior unchanged. Improves AI command surface polish — does **not** complete full Stitch-level UI. Authenticated visual smoke **recommended before merge** if not yet done (optional — does **not** block commit). **BX-I8B completion does not automatically approve** **BX-I8C** (now **complete** at **`8008dc1`**), **BX-I8D**, **BX-I8E**, **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases.
- **Phase BX-I7F** is **complete** (**CSS-only** — commit **`25988dc`**). **`frontend/src/styles/layout.css`** only — at **`min-width: 1280px`** on **`/study-materials/:materialId`**: success-body cockpit **Source | AI** **1.15fr | 0.85fr** (`:has(.material-workspace__cockpit)`); **plan-history** / **plan-import** action rows horizontal with wrap; material flashcards library **study | manage** **2-column** (`:has(.flashcard-library__study)`); manage list **2-column**; create/inline edit full-width (`:has(form)`); loading/error/not-found/page-error unaffected; **375px** stacked; **`/flashcards`** unaffected; **no** JSX/API/services/backend/auth/AI behavior/logging/content-exposure changes; plan history list/preview unchanged. Improves material cockpit desktop density — does **not** complete full Stitch-level UI. Authenticated visual smoke **recommended before merge** if not yet done (optional).
- **Phase BX-I7E4** is **complete** (**CSS-only** — commit **`467ccd9`**). **`frontend/src/styles/layout.css`** only — at **`min-width: 1280px`**: **`/admin`** stats deck **`.admin-workspace__stats-deck`** → **2-column** grid; Platform overview, Trello today (UTC), and Backend status bands remain full-width (`grid-column: 1 / -1`); Tasks|Focus and Learning|Trello **`.admin-workspace__stats-row`** blocks sit side-by-side as adjacent grid cells; inner **`.admin-workspace__stats`** stat grids unchanged; loading/error/forbidden/**`AdminRoute`** states unaffected; **narrow responsive browser viewport ~375px** stacked; **no** **`AdminDashboardPage.jsx`**, API/backend/services/auth/copy changes; **no** fake metrics, charts, health scores, new KPIs, sidebar, or mobile/native UI; backend status remains existing honest **`stats.systemHealth.backend`** value only — **no** fake monitoring chrome. Improves Admin desktop density — does **not** complete full Stitch-level UI. Authenticated visual smoke **recommended before merge** if not yet done (optional).
- **Phase BX-I7E3 Tier A** is **complete** (**CSS-only** — commit **`cba6dde`**). **`frontend/src/styles/layout.css`** only — at **`min-width: 1280px`**: **`/trello`** wizard flow grid on **`.trello-workspace__flow`** — Step 1 credentials + Step 2 destination side-by-side; Step 3 tasks, **`.trello-sync__messages`**, and Step 4 sync remain full-width; sync results stay below command band in **`.trello-workspace__results-zone`**; DOM step order unchanged (credentials → destination → tasks → messages → sync → results); **narrow responsive browser viewport ~375px** stacked; **no** Trello JSX/components/services/API/backend changes; **no** fake metrics, charts, sidebar, mobile/native UI; **Tier B not implemented** — no 2-column task list, no results grid, no wizard/results side-by-side, no scroll-height override. Improves Trello desktop setup density — does **not** complete full Stitch-level UI. Authenticated visual smoke **recommended before merge** if not yet done (optional).
- **Phase BX-I7E2** is **complete** (**CSS-only** — commit **`b18304c`**). **`frontend/src/styles/layout.css`** only — at **`min-width: 1280px`**: **`/flashcards`** horizontal command-controls desktop band (filters use available width; toolbar / Create flashcard aligns right when space allows); populated flashcard library **study \| manage** **2-column** layout (`:has(.flashcards-workspace__study-zone)`); manage list **2-column** grid when populated; create form and inline edit full-width (`:has(form)`); intro/loading/error/empty/filter-empty/status/create-cta full-width; **`actionError`** outside **`.flashcard-library`** unaffected; manage list truncated questions only — **no** answers newly exposed; **narrow responsive browser viewport ~375px** stacked; **no** **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`FlashcardStudy.jsx`**, component, API/backend/database/service/context/copy changes; **no** fake metrics, charts, sidebar, mobile/native UI; **no** mastery/AI/memory/health score. Improves Flashcards desktop density — does **not** complete full Stitch-level UI. Loading/error/**`actionError`** / console / keyboard tab smoke **recommended before merge** if not yet done (optional).
- **Phase BX-I7E1** is **complete** (**CSS-only** — commit **`d0db43e`**). **`frontend/src/styles/layout.css`** only — at **`min-width: 1280px`**: **`/tasks`** horizontal command-controls desktop band (filters use available width; toolbar / Add study task aligns right when space allows); populated task list **2-column** grid (`:has(.task-workspace__list)`); create task FormCard full-width; inline edit item intended full width via **`:has(.task-workspace__edit-card)`**; loading/error/empty/filter-empty unaffected; **narrow responsive browser viewport ~375px** stacked; **no** **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`TaskCard.jsx`**, component, API/backend/database/service/context/copy changes; **no** fake metrics, charts, sidebar, mobile/native UI. Improves Tasks desktop density — does **not** complete full Stitch-level UI. Inline edit and console smoke **recommended before merge** if not yet done.
- **Phase BX-I7D Tier 1** is **complete** (**CSS-only** — commit **`52c68ab`**). **`frontend/src/styles/layout.css`** only — at **`min-width: 1280px`**: **`/courses`** course shelf **3-column** grid; **`/courses/:id`** populated document/material shelf **2-column** grid; loading/error/empty unaffected; tasks remain below materials unchanged; **narrow responsive browser viewport ~375px** stacked; **no** **`CoursesList.jsx`**, **`CourseDetail.jsx`**, component, API/backend/database/service/context/recommendation/copy changes; **no** fake metrics, charts, sidebar, mobile/native UI; **Tier 2** side-by-side workspace **not implemented**. Improves Courses/Course Detail desktop density — does **not** complete full Stitch-level UI. Authenticated visual smoke **recommended before merge** if not yet done.
- **Phase BX-I7C** is **complete** (**CSS-only** — commit **`583922d`**). **`frontend/src/styles/layout.css`** only — dashboard desktop grid at **`min-width: 1280px`**: **PageHeader** full width; **dashboard-hero** + **dashboard-study-pulse** side-by-side (hero full width when study pulse absent); **dashboard-courses** / **dashboard-secondary** full width below; **dashboard-course-list** 2-column grid; loading/error unaffected via **`:has(.dashboard-hero)`**; **narrow responsive browser viewport ~375px** stacked; **no** **`DashboardStub.jsx`**, API/backend/database/service/context/recommendation/copy changes; **no** fake metrics, charts, sidebar, mobile/native UI. Improves Dashboard desktop density — does **not** complete full Stitch-level UI. Authenticated dashboard visual smoke **recommended before merge** if not yet done.
- **Phase BX-I7B** is **complete** (**CSS-only** — commit **`00d3255`**). **`--content-max-cockpit`** / **`--content-max-shell`** **1280px** (was **1120px**); **`tokens.css`** + **`layout.css`** only; **foundation only**. **B4-F3A** / **B4-F3B** / **B4-F3C** all **complete**. **BX-I7** desktop layout sequence **complete** through **BX-I7F**. Optional **BX-I7D Tier 2** and **BX-I7E3 Tier B** **proposed**, **not started**, **not automatic**. **Do not** start **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar shell, chart UI, chart APIs, backend/API/database/package changes, or fonts/packages/CDN without explicit human **`approved — implement Phase X`** after Supervisor Review of **each** phase.
- **BX-I7F completion does not automatically approve** **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases. **BX-I7E4 completion does not automatically approve** **BX-I7F** (now **complete**), **BX-I7D Tier 2**, **BX-I7E3 Tier B**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases. **BX-I7E3 Tier A completion does not automatically approve** **BX-I7E3 Tier B**, **BX-I7E4**, **BX-I7F**, **BX-I7D Tier 2**, sidebar, chart UI/APIs, or backend/API extension — those are separate gated phases. **BX-I7E2 completion does not automatically approve** **BX-I7E3 Tier A**–**BX-I7E4**, **BX-I7F**, **BX-I7D Tier 2**, sidebar, chart UI/APIs, or backend/API extension. **BX-I7E1 completion does not automatically approve** **BX-I7E2**–**BX-I7E4**, **BX-I7F**, **BX-I7D Tier 2**, sidebar, chart UI/APIs, or backend/API extension. **BX-I7D Tier 1 completion does not automatically approve** **BX-I7D Tier 2**, **BX-I7E2**–**BX-I7E4**, **BX-I7F**, sidebar, chart UI/APIs, or backend/API extension. **Current status (not journal history):** **B4-F3A** + **B4-F3B** + **B4-F3C** + **BX-I7B** through **BX-I7F** + **BX-I8B** through **BX-I8E** + **BX-I9B1** + **BX-I9B2a**–**BX-I9B2d** + **BX-I9C** / **BX-I9C-Auth** **complete** — **BX-I9B2** token alignment + final visual QA **Pass with notes**; optional **BX-I7D Tier 2** / **BX-I7E3 Tier B** **not started**; AI Generate gradient, **flashcard-study** polish, glass/elevation pass **separate-gated** — **not automatic**.
- **Web-only product:** StudyOps AI is a **browser-based web application / SaaS dashboard / AI study cockpit** only — not a native mobile/app-store product. **~375px** QA notes mean **narrow responsive browser viewport** testing, not mobile-app scope. Use terminology from **`AGENTS.md`** § Product platform.

The **“Current state as of 2026-06-02 (post B4-F3B)”** section below is a **point-in-time snapshot** — prefer **`CURRENT_STATE.md`** for up-to-date phase gates.

---

**Purpose:** Durable, append-only session memory for AI agents. Update after merged changes that affect behavior, APIs, or conventions.

**Rules:**

- Append new entries at the bottom (newest last).
- One entry per meaningful change—not per file touched.
- Do not store secrets, credentials, or full study text.
- Do not contradict PRD or ADRs; if something changed, note human approval.

---

## Entry Template

```markdown
### YYYY-MM-DD — [Short title]

**Workflow:** [e.g. phase-1-foundation]
**ADR refs:** [001, 003, ...]
**Summary:** What changed and why.
**APIs affected:** [endpoints or "none"]
**Tests:** [what was added/updated]
**Pitfalls:** [optional — things the next agent should avoid]
**Follow-up:** [optional — open items]
```

---

## Current state as of 2026-06-02 (post B4-F3C3)

**Read first:** **`docs/IMPLEMENTATION_STATUS.md`** — authoritative built-vs-deferred snapshot.

**Functional MVP:** Complete through **6A-3** (auth, courses, materials, material-scoped generate + persisted generated plan, tasks, flashcards, focus, Trello sync with board/list picker, student dashboard, admin aggregate stats API + UI).

**Generated plan history:** **11A-1** complete — migration **010** applied manually on Supabase; multiple rows per material with **`is_active`** (one active); retention max **10** rows per material; GET/DELETE/generate routes backward compatible; dashboard/admin **`totalGeneratedPlans`** counts active rows only. **11A-2** complete — migration **011** applied manually on Supabase; history REST APIs (list metadata-only, get-by-id, activate inactive, delete inactive); RPC **`reactivate_material_generated_plan`** with ROW_COUNT hardening; Security Review **passed**; manual smoke **passed**; backend **`341/341`** tests. **11A-3** complete — frontend-only **`GeneratedPlanHistorySection`** on material detail; metadata-only history list; lazy Preview for inactive versions; Restore (**Make active**) via activate endpoint (no Gemini); delete inactive with confirm; history refreshes after generate/clear/activate/delete; Security Review **passed**; manual smoke **passed**; frontend lint/test/build passed (**205/205**).

**Design direction (docs):** Phase A complete (**2026-06-01**) — commit **`dedb35c`** (`docs: align StudyOps AI design direction`); hybrid Source | AI cockpit direction; **`STITCH_BRIEF.md`** / **`SCREENSHOT_INDEX.md`** authority notes. Phase **BX-1** complete (**2026-06-01**) — commit **`303dc4b`** (`docs: update design direction for ai study cockpit`); **`DESIGN.md` v2.1 → v2.2** — modern AI study command center; decision-first dashboard (“What should I study next?”); honest chart/data-viz rules; course accent identity; AI command panel emphasis; **`docs/design/PROTOTYPE_REFERENCES.md`** (BX-0) as reference-only. Phase **BX-S** complete (**2026-06-01**) — commit **`2b4a881`** (`docs: archive selected stitch visual direction`); **Stitch** selected as preferred **external visual reference only** — archived in **`docs/design/STITCH_SELECTED_REFERENCE.md`**, **`docs/design/STITCH_VISUAL_STYLE_GUIDE.md`**, and **`stitch-*.png`** screenshots. Phase **BX-I1** complete (**2026-06-01**) — commit **`6041932`** (`docs: align design with stitch visual direction`); **`DESIGN.md` v2.2 → v2.3** — Stitch-selected presentation codified: **accessible dark graphite / glass** command-center direction; **electric blue** primary, **violet** AI, **cyan** data accents; **course accent** palette; **dashboard decision hub**; stronger **Source | AI** / AI command panel; **top navigation remains MVP**; Stitch **sidebar reference-only** (separate approved shell phase). **Supervisor Review:** Approved with notes. **BX-I1 does not authorize:** **`tokens.css`** edits, frontend/CSS implementation, charts, fonts/packages/CDN, backend/API changes, sidebar implementation, or **B4**. **Boundaries:** Stitch is reference only — **do not** copy Stitch code into **`frontend/src`**.

**Study material cockpit layout:** **12A-1** complete (**2026-06-01**) — commit **`00a76de`** (`feat: add study material cockpit layout`); presentation-only frontend/CSS on **`/study-materials/:materialId`** — Source | AI split; AI column groups generate, active plan, and plan history; flashcards library and danger zone below cockpit; **`npm run build`** passed; **no** backend/API/database/package changes.

**Phase B1 (global tokens):** **B1** complete (**2026-06-01**) — commit **`ccca764`** (`style: add global tokens and typography rhythm`); CSS-only — global design tokens, typography rhythm, tabular number utility, semantic warning/focus/AI/on-primary tokens; hardcoded global CSS values moved toward tokens in **`tokens.css`**, **`base.css`**, **`layout.css`**, **`components.css`**. **`npm run lint`** / **`npm test`** (**205/205**) / **`npm run build`** passed; **no** React/JSX/backend/API/database/package changes.

**Phase B2 (AppShell + PageHeader + cockpit width):** **B2** complete (**2026-06-01**) — commit **`f2de33f`** (`style: polish shell headers and cockpit widths`); presentation-only — **AppShell** visual polish (nav active/focus, responsive shell inner), **PageHeader** intro grid/layout polish, main hub routes moved **`page--workspace`** → **`page--cockpit`** on dashboard, courses, course detail, tasks, flashcards, Trello, admin, focus. **`AppShell.jsx`** / **`PageHeader.jsx`** / **`StudyMaterialDetail.jsx`** unchanged (material detail already **`page--cockpit`**; inherits global PageHeader CSS). Supervisor Review **Approved with notes**; Security Review **Approved**. **`npm run lint`** / **`npm test`** (**205/205**) / **`npm run build`** passed; **no** backend/API/database/package changes; **no** new routes/features/sidebar/chat/mobile-native UI.

**Phase B3 (cards, controls, badges, filters):** **B3** complete (**2026-06-01**) — commit **`e865c09`** (`style: polish cards controls badges and filters`); presentation-only — **card hover policy** (`source-card--navigable` on **`CourseCard`**, **`MaterialCard`**, dashboard per-course cards; task cards excluded — no lift); **static dashboard/admin stat tiles** (dashboard stat hover de-emphasized); **read-only plan/history surfaces** no longer feel editable on hover; **badge/pill consistency** (shared pill base for source cards, plan tasks, plan history, Trello sync status); **segmented filter** visual polish; **button/link-button** CSS consistency (danger focus, link-btn active, disabled unchanged). JSX: className-only **`source-card--navigable`** on three files. Supervisor Review **Approved with notes**; Security Review **Approved**. **`npm run lint`** / **`npm test`** (**205/205**) / **`npm run build`** passed; **no** backend/API/database/package/auth/routing/service changes; **no** new routes/features/sidebar/chat/mobile-native UI/charts/gamification. **B4** **not started** (BX-1 updated **`DESIGN.md`** direction only; does not implement B4).

**Phase BX-I2 (dark glass token foundation):** **BX-I2** complete (**2026-06-02**) — commit **`03ee9df`** (`style: add dark glass token foundation`); **CSS-only** — **`frontend/src/styles/tokens.css`**, **`components.css`**, **`layout.css`** only; **no** JSX/React, backend, API, database, package, or docs changes in the implementation commit. Dark graphite / glass global tokens; electric blue primary; violet AI accent; cyan data accent; dark-friendly danger/success/warning; source editor surface; chart/course accent **values only** (not wired into UI). **Filled-button contrast fix:** `--color-primary-fill`, `--color-primary-fill-hover`, `--color-danger-fill`, `--color-danger-fill-hover` for WCAG AA on `.btn--primary` / `.btn--danger`. Supervisor Review **Approved with notes**; Security Review **Approved with limitation** (authenticated visual QA deferred — no valid local test account). **`npm run lint`** / **`npm test`** (**205/205**) / **`npm run build`** passed. **Not in BX-I2:** sidebar, dashboard hero, charts, course accent wiring, material cockpit structure redesign, **BX-I3** / **BX-I4** / **BX-I5** / **B4**.

**Phase BX-I3 (dashboard decision layout):** **BX-I3** complete (**2026-06-02**) — commit **`bdd6f2a`** (`feat: add dashboard next-up recommendation`); **frontend-only** — **`frontend/src/pages/DashboardStub.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/utils/dashboard-recommendation.js`**, **`frontend/tests/unit/dashboard-format.test.js`** only; **no** backend, API, database, package, **`AppShell`**, route, service, or context changes in the implementation commit. Dashboard **“What should I study next?”** decision hero with **rule-based** next-up recommendation (**not** AI-based); study pulse / task progress bars from existing stats only; enhanced course workload rows with derived pending counts; prior stat bands moved to secondary **At a glance** section; uses existing **`GET /api/dashboard/stats`** only. **No fake metrics added:** no fake AI priority, deadlines/due-soon, weekly focus chart, streaks, health score, next exam/deadline, or specific task/material title in recommendation copy. Supervisor Review **Approved with notes**; Security / Trust Review **Approved with limitation** (authenticated dashboard manual smoke not fully completed — no approved valid local test account). **`npm run lint`** / **`npm test`** (**219/219**, including **14** recommendation unit tests) / **`npm run build`** passed. **Not in BX-I3:** chart library/UI, sidebar shell, course accent wiring, material cockpit structure redesign, **BX-I4** / **BX-I5** / **BX-I6** / **B4**.

**Phase BX-I4 (deterministic course accents):** **BX-I4** complete (**2026-06-02**) — commit **`ff65e21`** (`feat: add deterministic course accents`); **frontend-only** — **`frontend/src/components/courses/CourseCard.jsx`**, **`frontend/src/pages/CourseDetail.jsx`**, **`frontend/src/pages/DashboardStub.jsx`**, **`frontend/src/styles/components.css`**, **`frontend/src/styles/tokens.css`**, **`frontend/src/utils/course-accent.js`**, **`frontend/tests/unit/dashboard-format.test.js`** only; **no** backend, API, database, package, logging, or accent persistence in the implementation commit. Deterministic course accent helper with stable mapping from existing course **ID / name / title** only; accent keys enum-only **`amber` | `rose` | `emerald`** — **no** raw user strings as class names. **`CourseCard`** accent rail/pill tint; **`CourseDetail`** header accent; dashboard course workload row accents; subtle/border token aliases for existing course accent colors. Accents are **supplementary visual chrome only** — **no** health score, priority, urgency, active/quiet course status, AI classification, fake progress signals, study pulse recoloring, or dashboard recommendation changes. Supervisor Review **Approved with notes**; Security / Trust Review **Approved** (authenticated visual QA not fully completed — no approved valid local test account). **`npm run lint`** / **`npm test`** (**228/228**, including course-accent tests in normal test path) / **`npm run build`** passed. **Not in BX-I4:** course accent DB persistence; random colors; sidebar shell; chart UI; material detail cockpit visual polish; **BX-I5** / **BX-I6** / **B4**.

**Phase BX-I5 (material cockpit visual polish):** **BX-I5** complete (**2026-06-02**) — commit **`c2288d4`** (`style: polish material cockpit`); **frontend-only** — **`frontend/src/pages/StudyMaterialDetail.jsx`**, **`frontend/src/components/materials/GeneratedPlanSection.jsx`**, **`frontend/src/components/materials/GeneratedPlanHistorySection.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/styles/components.css`** only; **no** backend, API, database, package, auth, routes, services, behavior, or request-payload changes; **no** `tokens.css` changes in the implementation commit. Material detail cockpit visual polish on **`/study-materials/:materialId`**: improved Source \| AI hierarchy; darker readable source/editor well; source-type display pill from existing **`sourceTypeLabel`**; AI command/control column wrapper and section dividers; polished generate panel, active plan, and plan history surfaces; improved generated plan scanability; import toolbar/action band styling; history preview inset panel; saved flashcards library visual consistency; responsive polish at existing breakpoints. **No unsafe rendering:** **no** `dangerouslySetInnerHTML`, **no** `innerHTML`, **no** markdown renderer; material content remains **`Textarea`** / plain React text; generated plan and history preview remain plain React text. **No fake metrics:** **no** fake AI confidence, priority, urgency, or status signals. Supervisor Review **Approved with notes**; Security / Trust Review **PASS** (authenticated manual smoke / visual QA **not completed** — no approved valid local test account). **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. **Not in BX-I5:** backend/API/database/package/auth changes; course accents on material detail; sidebar shell; chart UI; markdown renderer; new packages; **BX-I6B** / **BX-I6C** / **BX-I6D** / **B4**. **Known non-blocking notes:** some hardcoded `rgba` AI border colors in **`components.css`** (acceptable for BX-I5); **`sourceTypeLabel`** redundancy in PageHeader note + source pill; **narrow responsive browser viewport ~375px** visual QA not manually verified (no test account).

**Phase BX-I6B (dashboard visual upgrade):** **BX-I6B** complete (**2026-06-02**) — commit **`cceb4e0`** (`style: upgrade dashboard command center`); **frontend-only** — **`frontend/src/pages/DashboardStub.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/styles/components.css`** only; **no** backend, API, database, package, auth, routes, services, **`DashboardContext`**, **`dashboard.service.js`**, or **`dashboard-recommendation.js`** logic changes; **no** `tokens.css` changes. Dashboard **AI Study Command Center** presentation on **`/dashboard`** only: flagship rule-based recommendation hero; glass/depth/glow via existing tokens; Study pulse cockpit band with factual **Pending / Completed / Total** from existing stats; richer course workload command deck; **At a glance** visually tertiary; **narrow responsive browser viewport ~375px** — no mid-word stat label breaks, no horizontal overflow; **`prefers-reduced-motion`** for decorative dashboard effects. **No fake metrics:** **no** fake AI confidence, urgency, priority, health score, or analytics. **No unsafe rendering** changes — plain React text only. Supervisor Review **Approved with notes**; Supervisor re-check **Approved with notes**; Security / Trust Review **Approved with notes**; manual authenticated dashboard smoke **passed**. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. **Not in BX-I6B:** chart libraries; sidebar; weekly focus chart; new packages; course/material pages; AppShell changes; **BX-I6C** / **BX-I6D** / **B4**. **Known non-blocking notes:** duplicate JSDoc above **`PulseMetric`**; **`dashboard-hero--flagship`** / **`dashboard-study-pulse--cockpit`** semantic hooks; contrast reviewed statically/manual-smoke not lab-measured.

**Phase BX-I6C (courses visual alignment):** **BX-I6C** complete (**2026-06-02**) — commit **`6a1e6ad`** (`style: align courses visual surfaces`); **frontend-only** — **`frontend/src/components/courses/CourseCard.jsx`**, **`frontend/src/components/materials/MaterialCard.jsx`**, **`frontend/src/pages/CoursesList.jsx`**, **`frontend/src/pages/CourseDetail.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/styles/components.css`** only; **no** backend, API, database, package, auth, routes, services, `tokens.css`, dashboard, AppShell, or material cockpit changes. **`/courses`:** polished subject shelf (`courses-shelf--deck`), semantic **`ul > li > article`**, **`source-card--course-shelf`**, glass create form, empty-state wrapper. **`/courses/:id`:** subject workspace hierarchy; **Subject** pill using existing course accent (chrome only); settings secondary band; materials primary glass zone; **`document-shelf--deck`** / **`source-card--document-shelf`**; honest material count subtitle from already-loaded **`materials.length` only** (hidden during loading/error/empty — **not** health/progress/coverage/priority/AI); stronger tasks framing and danger-zone separation; **narrow responsive browser viewport ~375px** — no horizontal overflow; **`prefers-reduced-motion`** for shelf card hover transforms. **No fake metrics:** **no** fake course health, priority, urgency, status labels, or AI classification. **No unsafe rendering** — plain React text; **no** full material body on course/material cards. Supervisor Review **Approved with notes**; Security / Trust Review **Approved with notes**; manual authenticated smoke **passed** (`/courses` empty state not smoke-tested). **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. **Not in BX-I6C:** chart libraries; sidebar; new packages; dashboard/AppShell/material cockpit; **BX-I6D** / **B4**. **Known non-blocking notes:** `/courses` empty state not manually smoke-tested; empty-state double framing may be cosmetic follow-up; console audit not fully instrumented.

**Phase BX-I6D (global shell chrome polish):** **BX-I6D** complete (**2026-06-02**) — commit **`9252ba9`** (`style: polish global shell chrome`); **CSS-only** — **`frontend/src/styles/layout.css`** only; **no** `AppShell.jsx`, `App.jsx`, backend, API, database, package, auth, routes, services, `tokens.css`, dashboard, course, or material page changes. Global **`AppShell`** top navigation / WEB dashboard **visual chrome** on all protected routes: stronger glass shell bar; restrained top accent strip (decorative only); improved brand hover/focus/hit area; improved nav active/hover/**`:focus-visible`** (active route **not** color-only); logout remains visible, labeled, and lower priority than primary nav; **narrow responsive browser viewport ~375px** — two-row header (brand + logout, then horizontal nav scroll row); **no** bottom tabs, drawer, hamburger-first layout, or phone-style UI; **`prefers-reduced-motion`** for shell transitions. **No route animation:** **no** route fade, page transitions, content remounting, `useLocation` animation, or `key={location.pathname}`. **No fake metrics:** **no** misleading AI/priority/urgency/health/status copy. Supervisor Review **Approved with notes**; Security / Trust Review **Approved with notes**; authenticated **375px** shell spot-check **passed with notes**. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. **Not in BX-I6D:** **B4-A** / **B4-B**; sidebar; chart UI; tasks/flashcards/Trello/admin page body polish; backend/API extension. **Known non-blocking notes:** Flashcards focus may sit slightly near/past nav right edge before nav scroll catches up — optional **`scroll-margin-inline`** polish only if needed.

**Phase B4-A (tasks page body polish):** **B4-A** complete (**2026-06-02**) — commit **`4ae80ee`** (`style: polish tasks command surface`); **frontend presentation-only** — **`frontend/src/components/tasks/GlobalTasksSection.jsx`**, **`frontend/src/pages/TasksPage.jsx`**, **`frontend/src/styles/layout.css`** only; **no** backend, API, database, package, auth, routes, services, `tokens.css`, **`components.css`**, task CRUD/filter/validation/**Focus** navigation/**`refreshStats`** behavior changes. **`/tasks`** page body only: task command surface / command band (`task-workspace__command-band--deck`); improved page hierarchy; filter toolbar visual framing (`role="group"`, `aria-label="Filter study tasks"`); create/list/empty/error/loading wrappers; scoped empty/error/list visual treatment; semantic **`ul.task-workspace__list > li.task-workspace__list-item > TaskCard` article or FormCard section** with `aria-label="Study tasks"`. Status filters: native **`<button type="button">`** with **`aria-pressed`** on real DOM (**B4-A-F1** — fixes prior issue where **`Button.jsx`** did not forward **`aria-pressed`**); selected filter **`btn--primary`**, non-selected **`btn--secondary`** — selected state **not** color-only. **Trust / framing:** **“Task command”** is approved **UI framing only** — **not** an AI/automation claim; **`task.priority`** remains API-backed only. **No fake metrics:** **no** fake AI/health/urgency/status/priority semantics; **no** new task data exposure; **no** task/user/session logging. **Narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI. Supervisor Review **PASS**; Security / Trust Review **Approved with notes**; **B4-A-F1** focused re-check **Approved**; authenticated manual smoke **limited** — static review + automated checks passed. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. **Not in B4-A:** AppShell, dashboard, courses, course detail, material cockpit, flashcards, Trello, admin, focus page changes; **B4-B** flashcards page body polish; Trello/admin/focus/shared-state polish; backend/API extension.

**Phase B4-B (flashcards page body polish):** **B4-B** complete (**2026-06-02**) — commit **`f91415d`** (`style: polish flashcards command surface`); **frontend presentation-only** — **`frontend/src/components/flashcards/GlobalFlashcardsSection.jsx`**, **`frontend/src/pages/FlashcardsPage.jsx`**, **`frontend/src/styles/layout.css`** only; **no** backend, API, database, package, auth, routes, services, `tokens.css`, **`components.css`**, **`FlashcardStudy.jsx`**, **`DbFlashcardsSection.jsx`**, flashcard CRUD/filter/study/reveal/**`refreshStats`** behavior changes. **`/flashcards`** page body only: flashcards command surface / command band (`flashcards-workspace__command-band--deck`); improved page hierarchy; filters/create/study/manage visual framing; page-level loading/error wrappers; scoped loading/error/empty/filter-empty/action-error wrappers; manage list readability (`overflow-wrap` on truncated questions). Filters: native labeled course/material **`<select>`** elements; **`role="group"`** + **`aria-label="Filter saved flashcards"`**. **Trust / framing:** **“Flashcard library”** / **“Filter, study, and manage saved cards”** are factual **UI framing only** — **not** AI/automation claims; deck/command styling is visual chrome only. **Content safety:** manage list still shows **truncated question only** — **no** answers newly exposed in manage list; full answers remain in existing **`FlashcardStudy`** reveal and edit flows only; delete confirmation and destructive action clarity **unchanged**; **`actionError`** moved outside **`FormCard`** into **`flashcards-workspace__action-error`** — presentation-only, still **`ErrorMessage`** / **`role="alert"`**. **No fake metrics:** **no** fake AI/mastery/progress/health/priority/urgency/status semantics; **no** flashcard/user/session/token logging. **Narrow responsive browser viewport ~375px** scoped CSS in **`layout.css`** only — **not** phone/native UI. Supervisor Review **Approved with notes**; Security / Trust Review **Approved with notes**; authenticated manual smoke **partial** — populated library, filters, study/reveal, 375px passed; create/edit/delete persistence and filter-empty/global-empty not exercised. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. **Not in B4-B:** AppShell, dashboard, courses, course detail, tasks, material cockpit, Trello, admin, focus page changes; admin/focus/shared-state polish; backend/API extension.

**Phase B4-C (Trello page body polish):** **B4-C** complete (**2026-06-02**) — commit **`cf50729`** (`style: polish trello integration surface`); **frontend presentation-only** — seven approved files only: **`frontend/src/pages/TrelloSyncPage.jsx`**, **`frontend/src/components/trello/TrelloSyncSection.jsx`**, **`frontend/src/components/trello/TrelloSyncForm.jsx`**, **`frontend/src/components/trello/TrelloBoardListPicker.jsx`**, **`frontend/src/components/trello/TrelloTaskSelector.jsx`**, **`frontend/src/components/trello/TrelloSyncResults.jsx`**, **`frontend/src/styles/layout.css`**; **no** backend, API, database, package, auth, routes, services, **`trello.service.js`**, validation/utils, `tokens.css`, **`components.css`**, credential lifecycle, sync payload, board/list/task loading, selection, result rendering, or sync behavior changes. **`/trello`** page body only: Trello integration command surface / command band (`trello-workspace__command-band--deck`); improved step framing for credentials, board/list picker, task selector, sync submit, and results; page-level loading/error wrappers; results zone visual framing. **B4-C-F1:** removed courses-level **Try again** (Supervisor flagged behavior change) — courses error remains **`ErrorMessage`**-only inside **`trello-workspace__page-error`**; task-load **Try again** unchanged. **Credentials:** API key/token remain **`type="password"`** with **`autoComplete="off"`**; **no** reveal/show-token; credentials not displayed, logged, or stored in browser storage; **`clearCredentials`** and **`clearCredentialsAfterSync`** unchanged; trust notes honest — **no** OAuth, permanent integration, or server-side storage implied. **Trust / framing:** manual sync creates Trello cards in selected list — **not** automatic or AI-driven; **no** fake AI/smart-sync/health/progress/quality/priority/urgency language; results from returned sync data only. **Narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI. Supervisor Review **Approved with notes**; **B4-C-F1** Supervisor re-check **Approved**; Security / Trust Review **Approved with notes**; authenticated manual smoke **partial** — `/trello` load, masked credentials, task selector, 375px passed; no safe Trello credentials — no real sync, board/list load, or post-sync results exercised live. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. **Not in B4-C:** AppShell, dashboard, courses, course detail, tasks, flashcards, material, admin, focus page changes; admin/focus/shared-state polish; backend/API extension.

**Phase B4-D (admin page body polish):** **B4-D** complete (**2026-06-02**) — commit **`905ee4d`** (`style: polish admin control surface`); **frontend presentation-only** — two approved files only: **`frontend/src/pages/AdminDashboardPage.jsx`**, **`frontend/src/styles/layout.css`**; **no** backend, API, database, package, auth, routes, **`AdminRoute.jsx`**, **`App.jsx`**, **`AppShell`**, **`admin.service.js`**, **`user?.role`**, role-check, **`getAdminStats`**, **`loadStats`**, refresh, **Try again**, **FORBIDDEN**, **AUTH_REQUIRED**, or SEC-6A3-1 behavior changes. **`/admin`** page body only: **`admin-workspace`** root; admin command/read surface / command band (`admin-workspace__command-band--deck`); improved aggregate stat-band visual hierarchy; page-level loading/error/API-forbidden wrappers; trust note / disclaimer framing (`role="note"` — aggregate counts only); forbidden-card visual polish. **Backend status:** band title renamed from **System health** — still **`stats.systemHealth.backend`** via **`formatBackendHealth`** only; **no** fake security/risk/health score or AI monitoring. **Trust / framing:** **“Platform control”** is read-only aggregate UI framing — **not** user/role/logs management (Security / Trust Review **approved with notes**; optional **“Platform overview”** copy softening non-blocking). **Security boundary:** frontend role check remains UX-only; backend **`GET /api/admin/stats`** remains authoritative; aggregate counts only — **no** emails, user IDs, logs, credentials, sessions, or full API payloads; **no** token/session/admin payload logging. **Narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI. Supervisor Review **Approved with notes**; Security / Trust Review **Approved with notes**; manual smoke **limited** — logged-out **`/admin` → `/`** confirmed; admin success/non-admin/API 403/375px success layout not live-tested. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. **Not in B4-D:** dashboard, courses, tasks, flashcards, Trello, material, focus, **`components.css`**, **`tokens.css`**; shared empty/loading/error state polish; backend/API extension.

**Phase B4-E (focus page body polish):** **B4-E** complete (**2026-06-02**) — commit **`7f4bf6b`** (`style: polish focus session cockpit`); **frontend presentation-only** — two approved files only: **`frontend/src/pages/FocusPage.jsx`**, **`frontend/src/styles/layout.css`**; **no** backend, API, database, package, auth, routes, **`focus.service.js`**, **`TaskCard.jsx`**, **`App.jsx`**, **`AppShell`**, or timer/session behavior changes (logic above JSX `return` in **`FocusPage.jsx`** unchanged). **`/focus/:taskId`** page body only: **`focus-workspace`** session deck / command band (`focus-workspace__command-band--deck`); improved task context framing; improved timer panel, action area, and loading/error/done visual wrappers. **Timer / session trust:** **`DEFAULT_DURATION_MINUTES = 25`**; auto-start, countdown math, **`beginFocusStart`** / **`focusStartRequests`**, phase machine, **`completeFocusSession`**, checkbox, **`refreshStats`**, error handling, navigation state/back links, and **AUTH_REQUIRED** handling **unchanged**; explicit **Complete session** and **Mark task as complete** remain user-controlled; done summary still uses backend **`completedSession.durationMinutes`**. **Accessibility:** **removed** noisy `aria-live` from active timer panel; static timer **`aria-label`** from **`session.durationMinutes`** only — **no** per-second live countdown announcements; error/done **`aria-live="polite"`** retained. **Trust / framing:** factual session cockpit copy only — **no** pause, reset, duration picker, history, charts, streaks, fake scores, AI focus coach, or smart timer semantics; **25-minute** copy accurate now (future duration changes should update copy). **Content safety:** **`taskTitle`** plain React text only; **no** token/session/user/focus payload logging; **no** `dangerouslySetInnerHTML`, `innerHTML`, `eval`, markdown renderer, or external assets. **Narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI. Supervisor Review **Approved with notes**; Security / Trust Review **Approved with notes**; manual smoke **limited** — no authenticated session/safe pending task; static review + automated checks passed. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. **Not in B4-E:** dashboard, courses, tasks, flashcards, Trello, admin, material, **`components.css`**, **`tokens.css`**; shared empty/loading/error state polish; backend/API extension.

**Phase B4-F1 (shared state primitives CSS polish):** **B4-F1** complete (**2026-06-02**) — commit **`ea8a899`** (`style: polish shared state primitives`); **CSS-only** — **`frontend/src/styles/components.css`** only; **no** backend, API, database, package, auth, routes, page JSX, services, or shared UI component file changes. Polished shared primitives **`.loading`**, **`.empty-state`**, **`.alert`** / **`.alert--error`**, **`.protected-loading`** — glass/dark UI aligned with B4 command surfaces; spinner + **`prefers-reduced-motion`** preserved; error visibility preserved (danger tokens + left accent — errors **not** hidden or softened into success/healthy); **narrow responsive browser viewport ~375px** safety via **`min-width: 0`**, **`overflow-wrap: anywhere`**, scoped padding at **`max-width: 640px`**. **Accessibility preserved:** **`LoadingState.jsx`** unchanged — **`role="status"`**, **`aria-live="polite"`**; **`ErrorMessage.jsx`** unchanged — **`role="alert"`**; **`EmptyState.jsx`** unchanged — props + primary CTA behavior. **Trust / safety:** **no** copy changes; **no** new/removed **Try again** buttons; **no** new empty/loading/error states; **no** fake AI/health/priority/urgency/status semantics; **no** route/page/service/API/auth/data-fetching/error-mapping changes; **no** **`layout.css`** or **`tokens.css`** changes; **TrelloTaskSelector** EmptyState invalid **`message`** prop **intentionally not fixed**; material AI processing lane may look slightly nested (glass **`.loading`** inside **`.ai-panel__loading--active`**) — cosmetic/non-blocking per reviews; **no** token/session/user/content/error-payload logging; **no** unsafe rendering. Supervisor Review **Approved with notes**; Security / Trust Review **Approved with notes** — **no** Critical or Important issues. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. Manual smoke **limited** — full authenticated visual QA not live-tested. **Not in B4-F1:** **B4-F2** route state framing (now complete — **`ee50b8e`**); **B4-F3** secondary empty surfaces CSS; backend/API extension.

**Phase B4-F2 (route state surface framing):** **B4-F2** complete (**2026-06-02**) — commit **`ee50b8e`** (`style: frame route state surfaces`); **frontend presentation-only** — five approved files only: **`DashboardStub.jsx`**, **`CoursesList.jsx`**, **`CourseDetail.jsx`**, **`StudyMaterialDetail.jsx`**, **`layout.css`**; **no** backend, API, database, package, auth, route guard, **`AppShell`**, service, data-fetching, error-mapping, retry, or copy changes. Route-level loading/error/not-found visual framing: **`/dashboard`** page loading/error wrappers; **`/courses`** page loading/error wrappers; **`CourseDetail`** early-return loading/error/not-found wrappers; **`StudyMaterialDetail`** early-return loading/error/not-found wrappers; scoped route-state CSS; neutral not-found decks for course/material missing-resource states; wrapped error action rows for existing **Try again** buttons only (**loadStats**, **loadCourses**, **loadCourse**, **loadMaterial** — unchanged handlers and visibility). **Not-found trust:** copy remains neutral (**Course not found** / **Study material not found** — **no** admin/forbidden/permission-denied wording); wrong-owner **`NOT_FOUND`** behavior remains neutral; **`AdminRoute`** and admin forbidden surfaces **not touched**. **Accessibility preserved:** **`LoadingState`** still **`role="status"`** / **`aria-live="polite"`**; **`ErrorMessage`** still **`role="alert"`**; **no** duplicate **`aria-live`** wrappers; back links remain **`Link`** elements; **`h1`** in not-found states. **Visual note (non-blocking):** not-found and page-error decks share neutral glass framing with primary top accent — error still uses **`ErrorMessage`** danger styling inside deck. **Narrow responsive browser viewport ~375px** scoped CSS — **not** phone/native UI. **Not in B4-F2:** **`components.css`**, **`tokens.css`**, shared UI components, **B4-F3A** work (now complete — **`596e869`**), **TrelloTaskSelector** EmptyState bug fix, **CourseDetail** nested materials states (polished in **B4-F3A** via CSS only), **StudyMaterialDetail** success cockpit / AI / plan / flashcards sections (error blocks polished in **B4-F3A** via CSS only), material AI processing lane, Tasks/Flashcards/Trello/Admin/Focus pages, route transitions, sidebar/drawer/bottom-tabs. Supervisor Review **Approved with notes**; Security / Trust Review **Approved with notes** — **no** Critical or Important issues. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. Manual smoke **limited** — authenticated visual QA not live-tested (unauthenticated fake course UUID redirected to sign-in).

**Phase B4-F3A (secondary in-page state surfaces):** **B4-F3A** complete (**2026-06-02**) — commit **`596e869`** (`style: polish secondary state surfaces`); **CSS-only** — **`frontend/src/styles/layout.css`** only; **no** JSX, **`components.css`**, **`tokens.css`**, shared UI component, page, route, service, API, auth, data-fetching, error-mapping, retry, handler, or copy changes. Secondary in-page state surface polish: **CourseDetail** materials area loading/error/empty; **CourseTasksSection** filter-empty via **`.section__meta`** (filter-scoped — **not** deletion/data-loss semantics); material saved flashcards library loading/error/empty; material cockpit **plan-panel__error** / **plan-history__error** block spacing, wrapping, and safe **Try again** spacing; **narrow responsive browser viewport ~375px** via **`min-width: 0`**, **`overflow-wrap: anywhere`**, scoped padding at **`max-width: 640px`**. **Accessibility preserved:** **`LoadingState`** **`role="status"`** / **`aria-live="polite"`**; **`ErrorMessage`** **`role="alert"`**; **no** duplicate **`aria-live`** wrappers; **Try again** / EmptyState CTA behavior unchanged. **Trust / security:** empty states remain informational; **no** raw API payloads or sensitive details newly exposed; **no** full material/plan/flashcard content newly shown in state panels; **no** token/session/user/content/error-payload logging; **no** unsafe rendering. **Visual note (non-blocking):** **flashcard-library__error** and **plan-panel__error** neutral outer shells — inner **`.alert--error`** remains clearly error-oriented. **Not in B4-F3A:** **B4-F2** route-level wrappers (unchanged); material AI processing lane (**`ai-panel__loading`**, “Processing with AI…”); **GeneratedPlanHistory** preview **`aria-live`**; **TrelloTaskSelector** EmptyState prop bug fix (deferred — **fixed in B4-F3C1**); **B4-F3B** wrapper **`className`** work; **B4-F3C2** / **B4-F3C3**; Dashboard in-body empty; **TrelloBoardListPicker** / **TrelloSyncResults**. StudyOps AI remains **browser-based WEB platform / SaaS dashboard / AI study cockpit** only. Supervisor Review **Approved with notes**; Security / Trust Review **Approved with notes** — **no** Critical or Important issues. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. Manual smoke **limited** — full authenticated visual QA not live-tested.

**Phase B4-F3C3 (GeneratedPlanHistory preview aria-live cleanup):** **B4-F3C3** complete (**2026-06-02**) — commit **`ab28307`** (`fix: narrow generated plan preview live region`); **frontend-only** — **`frontend/src/components/materials/GeneratedPlanHistorySection.jsx`** only; **no** backend, API, database, package, auth, routes, CSS (**`layout.css`**, **`components.css`**, **`tokens.css`**), **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`EmptyState.jsx`**, services, **`getGeneratedPlanById`**, preview helpers (**`generated-plan-history-preview.js`**), **`StudyMaterialDetail.jsx`**, **`TrelloTaskSelector.jsx`**, or preview/history button/copy/behavior changes. Removed **`aria-live="polite"`** from preview panel wrapper **`plan-history__preview plan-history__preview-panel`**; preview loading **`<p>`** now has **`role="status"`** and **`aria-live="polite"`** for **Loading preview…** only; **`previewError`** still **`ErrorMessage`** / **`role="alert"`** unchanged; preview success (truncated snippet + aggregate meta/counts only) **not** inside **`aria-live`** — success **not** live-announced. **Generated-content exposure:** **no** full plan body, task list, flashcards, key topics list, raw JSON, or raw API payloads rendered; full plan may remain in React state after **`getGeneratedPlanById`** (unchanged — not newly DOM-exposed). **Trust / security:** loading remains visible — **not** hidden or softened into success; **no** fake AI/health/productivity semantics; **no** generated plan payload/token/session/user/material/raw-error logging; **no** console logging; **no** unsafe rendering. **B4-F3C** sub-series (**B4-F3C1**, **B4-F3C2**, **B4-F3C3**) **complete**. StudyOps AI remains **browser-based WEB platform / SaaS dashboard / AI study cockpit** only; **375px** = **narrow responsive browser viewport** — **not** phone/native design. Supervisor Review **approved**; Security / Trust Review **approved** — **no** Critical or Important issues. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. Manual smoke **limited** — authenticated generated-plan-history preview QA not live-tested.

**Phase B4-F3C2 (AI processing lane aria-live cleanup):** **B4-F3C2** complete (**2026-06-02**) — commit **`d1a3c69`** (`fix: remove duplicate ai processing live region`); **frontend-only** — **`frontend/src/pages/StudyMaterialDetail.jsx`** only; **no** backend, API, database, package, auth, routes, CSS (**`layout.css`**, **`components.css`**, **`tokens.css`**), **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`EmptyState.jsx`**, services, generate/**`handleGenerate`**/**`generateDisabled`**/**`generateError`**/plan/history/flashcards/material-editor behavior or copy changes. Removed duplicate **`aria-live="polite"`** from outer **`<div className="ai-panel__loading ai-panel__loading--active">`** in **`{generating && (…)}`** block; **`LoadingState`** remains single polite live region for **Processing with AI…** (**`role="status"`**, **`aria-live="polite"`**); preserved visible processing panel and disabled generate button label **Processing with AI…**. **Trust / security:** processing state remains visible — **not** hidden or softened into success; **`generateError`** still **`ErrorMessage`** / **`role="alert"`**; **no** material content, generated plan payloads, tokens, sessions, users, or raw error-payload logging; **no** console logging; **no** unsafe rendering. **Not in B4-F3C2:** **`TrelloTaskSelector`**, **`GeneratedPlanHistorySection`**. StudyOps AI remains **browser-based WEB platform / SaaS dashboard / AI study cockpit** only; **375px** = **narrow responsive browser viewport** — **not** phone/native design. Supervisor Review **approved with notes**; Security / Trust Review **approved with notes** — **no** Critical or Important issues. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. Manual smoke **limited** — authenticated generate-flow QA not live-tested.

**Phase B4-F3C1 (TrelloTaskSelector empty-state bug fix):** **B4-F3C1** complete (**2026-06-02**) — commit **`d0393d7`** (`fix: repair trello empty task state`); **frontend-only** — **`frontend/src/components/trello/TrelloTaskSelector.jsx`** only; **no** backend, API, database, package, auth, routes, CSS (**`layout.css`**, **`components.css`**, **`tokens.css`**), **`EmptyState.jsx`**, **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`TrelloSyncSection.jsx`**, Trello services, sync payload, credentials/board/list flow, or Trello sync behavior changes. Fixed zero-tasks empty state: removed invalid **`EmptyState`** usage with unsupported **`message`** prop (could render blank heading/description/button and undefined **`onAction`** click risk); removed unused **`EmptyState`** import; replaced with plain informational **`<p className="trello-picker__empty trello-picker__status" role="status">`** preserving exact copy **No study tasks yet. Create tasks on a course or the All study tasks page.**; **no** new CTAs, navigation, or **Try again** button changes. **Accessibility:** zero-tasks **`role="status"`**; existing **`overLimit`** **`role="alert"`** unchanged; **no** duplicate **`aria-live`** wrappers in empty branch. **Trust / security:** empty message factual/static — **no** sync success/failure claims, **no** data-loss implication; **no** credentials, payloads, tokens, session/user data, or task titles in zero-tasks state; **no** console logging; **no** unsafe rendering. Task selection, Select all, Clear, 50-task limit, disabled behavior, checkbox labels, and task title/meta when tasks exist **unchanged**. **Not in B4-F3C1:** **B4-F3C2** AI processing lane **`aria-live`** cleanup; **B4-F3C3** **GeneratedPlanHistorySection** preview **`aria-live`** / error semantics; material AI processing lane; **GeneratedPlanHistorySection**. StudyOps AI remains **browser-based WEB platform / SaaS dashboard / AI study cockpit** only; **375px** = **narrow responsive browser viewport** — **not** phone/native design. Supervisor Review **Approved**; Security / Trust Review **Approved** — **no** Critical, Important, or Minor issues. **`npm run lint`** / **`npm test`** (**228/228**) / **`npm run build`** passed. Manual smoke **limited** — authenticated **`/trello`** QA not live-tested.

**Plan import dedupe:** **10B** complete — material-scoped plan import with `source='plan'`, dedupe, migration **009** applied, manual smoke passed.

**Hardening / docs:** **7A**–**7C** complete (**2026-05-29**).

**UI polish:** Complete through **8C-3D** (**2026-05-30**) — global **`AppShell`**, design system, and presentation upgrades on all workspace routes. Material detail cockpit layout added in **12A-1**. Design screenshots may predate **8C** / **12A-1** visuals.

**Still deferred:** admin logs / user management / role management; Gemini admin metrics; Trello OAuth / stored credentials; course-level generate; PDF upload; real-time dashboard; spaced repetition; payments; production deployment; **B4-F3B** wrapper **`className`** work; remaining **B4** global styling rollout beyond **B4-A** + **B4-B** + **B4-C** + **B4-D** + **B4-E** + **B4-F1** + **B4-F2** + **B4-F3A** + **B4-F3C1** + **B4-F3C2** + **B4-F3C3** (**B4-F3C** sub-series **complete** — commits **`d0393d7`**, **`d1a3c69`**, **`ab28307`**; other **B4** commits **`4ae80ee`**, **`f91415d`**, **`cf50729`**, **`905ee4d`**, **`7f4bf6b`**, **`ea8a899`**, **`ee50b8e`**, **`596e869`**); sidebar shell / chart UI / chart APIs / backend/API extension **in code** (**not started** — separate approval each); course accent persistence in DB (**not shipped**); course accents on material detail (**not shipped**).

**Next phase (planning only — human):** Optional **BX-I2**, **BX-I3**, **BX-I4**, **BX-I5**, **B4-A**, **B4-B**, **B4-C**, **B4-D**, **B4-E**, **B4-F1**, **B4-F2**, **B4-F3A**, **B4-F3C1**, **B4-F3C2**, and **B4-F3C3 follow-up** — authenticated visual QA when a test account exists (**B4-F3C3:** study material with generated plan history → Preview inactive version → **Loading preview…** visible (polite announcement if testable) → snippet + meta only on success → **`previewError`** if safely triggerable → keyboard on Preview / Make active / Delete → **narrow responsive browser viewport ~375px** → console clean; **B4-F3C2:** study material **Generate study plan**, disabled button + panel **Processing with AI…**, single polite live region via **`LoadingState`** if testable; **B4-F3C1:** **`/trello`** zero tasks, **`/trello`** with tasks; **B4-F3A**–**B4-F2** as previously documented). **Do not** automatically start **B4-F3B**, remaining **B4** / **BX-I6** work, or backend/API extension — each requires separate planning and explicit **`approved — implement Phase X`**. **B4-F3C** sub-series is **complete** — next implementation phase is **not automatic**. **B4-F3B**, AppShell/global motion beyond **BX-I6D**, charts, sidebar shell, and backend/API extension remain **not built** until separately approved. Future visual phases must **not** expand scope into mobile/native/app-store products.

---

## Project Baseline (2026-05-20)

**Status:** Phase 1A–1G complete (through courses UI). Phase 2A `public.study_materials` **applied and verified** on Supabase. Phase 2B Study Materials Backend API and Phase 2C Study Materials Frontend UI **complete** (Supervisor + Security approved). **Manual smoke test passed** after Phase 2C. Phase 2D Gemini document-service **complete** (Supervisor + Security approved; `POST /process`, tests 27/27 mocked). Phase 2E Backend Generate Orchestration **complete** (Supervisor + Security approved; backend tests 99/99 mocked). Phase 2F Frontend Generate UI **complete** (Supervisor + Security approved; material-detail generate flow; frontend tests 34/34 mocked). Phase 2G Quality/Lint **complete** (Supervisor + Security approved; ESLint in all packages + CI + `check-all.ps1`). Phase 2H Docs / Agent Workflow **complete** (Supervisor + Security approved; `docs/IMPLEMENTATION_STATUS.md` hub, governance docs aligned). Phase 2I-a Stitch / DESIGN brief prep **complete** (Supervisor + Security approved; `docs/STITCH_BRIEF.md`, screenshot index, security hardening). Phase 2I-b design screenshots **complete** (Supervisor + Security approved; **14 PNGs** under `docs/design/screenshots/` including **`11-generated-plan-visible.png`** from Phase 2K-c). Phase 2I-c **`DESIGN.md` v2** **complete** (Supervisor + Security approved; NotebookLM-inspired presentation spec only — **not** product scope). Phase 2J **Frontend Styling Pass** **complete** (Supervisor + Security approved; DESIGN.md v2 applied via plain CSS — presentation only, no behavior changes). Phase 2K-a **Generate live smoke** **attempted** — pipeline verified through UI/backend; **blocked by Gemini HTTP 429** (no plan captured; **no code bug suspected**). Phase 2K-b **Generate live smoke and pending screenshots** **attempted** — pre-flight passed; **one** Generate click; processing UI observed; **blocked again by Gemini HTTP 429** (no repo PNGs; persistence success path **not** verified live; **no code bug suspected**). Phase 2L-a **`public.material_generated_plans`** **complete** (Supervisor + Security approved; migration **applied manually** on Supabase — one latest plan per material, RLS + grants). Phase 2L-b **Backend Generated Plan Persistence** **complete** (Supervisor + Security approved; UPSERT on successful generate, GET/DELETE latest plan, backend Zod before write; backend tests **118/118** mocked). Phase 2L-c **Frontend Generated Plan Load/Clear** **complete** (Supervisor + Security approved; load/clear via backend GET/DELETE; plain React text; frontend tests **43/43** mocked). Phase 2L-d **Docs and Smoke Alignment** **complete** (Supervisor + Security approved; governance docs + manual smoke checklist aligned to persisted latest plan). Phase 2M **Seeded Persisted Plan Smoke** **complete** — persistence GET/load/refresh/Clear validated **without Gemini** (fake DB seed + UI smoke; **no** Generate click; **no** official screenshots). Phase 2O-b **Gemini model env configuration** **complete** (Supervisor + Security approved; `GEMINI_MODEL` env, default **`gemini-2.5-flash-lite`**; no longer hardcoded `gemini-2.0-flash`; document-service tests **31/31** mocked). Phase 2O-c **Gemini prompt/schema contract hardening** **complete** (Supervisor + Security approved; strengthened `buildGeminiPrompt()` contract; **`GeminiOutputSchema` not loosened**; document-service tests **43/43** mocked; **no live Gemini** during implementation). Phase 2O-c **live external AI Generate smoke** **passed** — **one** Generate click with **`gemini-2.5-flash-lite`**; Gemini **HTTP 200**; document-service Zod pass; backend UPSERT + frontend display; refresh reload **without** second Generate; confirms **live external AI API success** for material-scoped Generate. Phase 2K-c **`11-generated-plan-visible.png` captured** from that saved plan (**no** extra Generate). **`15-processing-with-ai.png`** still **pending**. **Read first for built state:** `docs/IMPLEMENTATION_STATUS.md`. Public tables: `profiles`, `courses`, `study_materials`, `material_generated_plans`, `study_tasks` (3A-a DB + **3A-b backend task API** — **no** task UI yet). GitHub Actions CI: `npm ci` → `npm run lint` → `npm test` per package; frontend also `npm run build` (Node.js 22 in CI). Node.js 20.6+ required locally. **UI spec:** `DESIGN.md` v2 (2026-05-22); **styled in code** via `frontend/src/styles/**`.

**Architecture locked by ADRs:**

- Main backend = modular monolith (001).
- Document processing = separate service (002).
- Zod for Gemini output, requests, env (003).
- Trello credentials not persisted (004).
- Manual List ID required for MVP Trello sync (005).

Phase 3A-a **`public.study_tasks`** **complete** (Supervisor + Security Review approved; migration **applied manually** on Supabase and **verified** — schema/RLS only). Phase 3A-b **Study Tasks Backend API** **complete** (Supervisor + Security Review approved; manual `study_tasks` CRUD via Express). Phase 3A-b.1 **Docs alignment** **complete** — entry-point docs reflect **3A-a/b**. Phase 3A-c **Course-level Manual Tasks UI (MVP)** **complete** (list, create, complete, delete on `/courses/:id`). Phase 3A-c.1 **Pending-task edit UI** **complete**. Phase 3A-c.2 **Course task status filters** **complete**. Phase 3A-c.3 **Task ↔ study material linking** **complete**. Phase 3A-d **Global `/tasks` page** **complete** (protected cross-course list; `GET /api/tasks` with optional `courseId`/`status`; edit/complete/delete; lazy `listMaterials` on edit). Phase 3A-e **Create task on global `/tasks`** **complete** (inline create in `GlobalTasksSection`; required owned-course dropdown; optional `materialId` via lazy `listMaterials`; `POST /api/courses/:courseId/tasks`; create hidden on Completed filter / no courses). Phase 3A-f **Generated plan → `study_tasks` import** **complete** (frontend-only on `/study-materials/:materialId`; sequential `createCourseTask` from `plan.tasks[]`; validate-all-before-POST; confirm warns duplicates; plan not cleared). Phase **3B-a** **flashcard study UI** **complete** (frontend-only; plan JSON). Phase **3B-b** **`public.flashcards` schema/RLS** **complete** (applied Supabase). Phase **3B-c** **flashcards backend REST API** **complete** (`GET/POST/PATCH/DELETE`; Supervisor approved with notes; Security no blockers; backend **180** tests). Phase **3B-d** **flashcards frontend integration** **complete** (material-detail saved DB flashcards + import `plan.flashcards[]`; Supervisor approved with notes; Security no blockers; frontend **115** tests). Phase **3B-e** **flashcards manual CRUD UI** **complete** (material-detail create/edit/delete saved flashcards; Supervisor approved with notes; Security no blockers; frontend **138** tests). Phase **3B-f** **global flashcards page** **complete** (protected `/flashcards`; list/study/filter/edit/delete across account; Supervisor approved with notes; Security no blockers; frontend **146** tests). Phase **3B-g** **global create flashcard UI** **complete** (inline create on `/flashcards`; required course + optional material; reuses **3B-c** `POST`; optional `materialId` in `buildCreateFlashcardBody`; post-create filter/refetch; Supervisor approved with notes; Security no blockers; frontend **149** tests). Phase **4A-0** **`public.trello_sync_logs` schema/RLS** **complete** (migration **007** + database doc; **applied manually** on Supabase **2026-05-26**; catalog + behavioral verification passed). Phase **4A-1** **backend Trello sync API** **complete** (`POST /api/trello/sync`; native `fetch` Trello client; strict Zod body; ownership by `req.user.id`; sequential sync; `trello_sync_logs` inserts for owned tasks only; `study_tasks.trello_card_id` update on success; sanitized errors; **no** credential persistence/logging; Supervisor approved with notes; Security no blockers; backend **208** tests). Phase **4A-2** **frontend Trello sync page** **complete** (protected **`/trello`**; Dashboard link; **`trello.service.js`** → backend `POST /api/trello/sync` only — **never** `api.trello.com`; `TrelloSyncForm` / `TrelloTaskSelector` / `TrelloSyncResults`; credentials React-state only — **not** localStorage/sessionStorage/URL; cleared after backend sync attempt + **Clear credentials**; results show summary + per-task `status` / `trelloCardId` / sanitized errors only; Supervisor approved with notes; Security no blockers; frontend **161** tests; lint + build passed). Phase **4A-3** **Trello `/trello` UI polish** **complete** (presentation-only: header layout, credentials spacing, card-style task rows, result status badges, scoped **`frontend/src/index.css`**; **no** sync/API/validation/credential-lifecycle changes; Supervisor approved with notes; Security no blockers; lint/test/build passed). Phase **4C-0** **`public.focus_sessions`** database foundation **complete** (migration **008** applied on Supabase **2026-05-29**). Phase **4C-1** **backend Focus Sessions API** **complete** (`POST /api/focus`, `POST /api/focus/:sessionId/complete`; server-side actual minutes; optional owned task completion; Supervisor approved with notes; Security no blockers; backend **270** tests). Phase **4C-2** **frontend Focus Sessions UI** **complete** (protected **`/focus/:taskId`**; Start Focus on pending tasks; display-only **25**-minute timer; complete **`{ completedTask }`** only; S1 in-flight Promise Map fix; Supervisor Re-review approved with notes; Security no blockers; frontend **174** tests). Phase **4C-3** **Focus Sessions manual smoke test** **passed** (**2026-05-29**) — Start Focus from pending tasks; complete without/with marking task complete; course page flow; network and console clean; **Focus Sessions MVP complete** through DB + backend + frontend + smoke. Phase **5B** **backend Dashboard Stats API** **complete** (`GET /api/dashboard/stats`; auth-protected user-owned aggregates; **`totalFocusMinutes`** from completed focus sessions only; generated plans counted without returning plan JSON; Trello stats DB-only; Supervisor approved with notes; Security no blockers; backend **283** tests). Phase **5C** **Dashboard frontend UI** **complete** (protected **`/dashboard`** consumes **`GET /api/dashboard/stats`** via **`dashboard.service.js`**; aggregate stats + **`courseStats[]`** display; read-only; frontend-only; no direct Supabase stats queries; Supervisor approved with notes; Security no blockers; frontend **181** tests). **Trello manual sync MVP end-to-end** (demo-ready UI) (apiKey/token/listId + selected tasks). Public tables include **`trello_sync_logs`**. Frontend tests **80/80** at 3A-f; lint + build passed. **No** backend, database, migration, document-service, or dependency changes in 3A-f; **`frontend/package.json`** `test` script only (+`plan-import.test.js`). **Follow-up (non-blocking):** if `listCourses` fails, sync UI does not mount; optional courses retry; manual smoke with real Trello test board. Other product work — material **navigation** / **filtering**, flashcards **bulk create** / course-level management, import dedupe / `source='plan'`, known/unknown, spaced repetition, Anki, focus, dashboard/admin, deployment, etc. — requires **separate** human approval; see `docs/IMPLEMENTATION_STATUS.md` deferred list. **Optional design artifact, not a product phase:** **`15-processing-with-ai.png`** remains **pending** and requires a **separately approved** live Generate attempt; **do not fabricate**. **Pitfall for screenshot work:** do not **Clear plan** on materials used for **`15-`** capture until screenshot/demo decision is complete. PRD course-level paste-generate remains **deferred**. **2K-a / 2K-b:** earlier **Gemini 429** — superseded for Generate success path by **2O-c live smoke PASS**. **2M** validated persistence without Gemini. **2O-b/c:** model env + prompt hardening + **live Generate PASS** (`gemini-2.5-flash-lite`). If **429** returns on a future smoke, stop — **no retry loops**. **Lint is required** for code PRs (see `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`). **Agent workflow:** planning → implement → lint/tests (code phases) → Supervisor + Security when required → `approved — Phase X complete` → `AGENT_MEMORY`. Do not restart **2O-c** implementation/live smoke, **2O-b**, **2L-a/b/c/d**, **2M**, or re-apply 003. Do not use `npm audit fix --force` without explicit human approval.

**Known constraints:**

- Study text: 100–50,000 characters.
- Gemini timeout: 30s, no retry on timeout/validation failure.
- Session: 24h with Supabase refresh; redirect on expiry.
- Admin users: manual creation in Supabase (not self-register).

---

## Memory Log

<!-- Append entries below this line. Physical order may differ from execution order when entries are backfilled (see ordering clarification entries). -->

### 2026-05-20 — Context engineering layer

**Workflow:** N/A (pre-implementation)
**ADR refs:** 001–005 documented
**Summary:** Created AGENTS.md, CLAUDE.md, SKILLS.md, ADRs, workflows, and Claude agent definitions. Application directories not scaffolded yet.
**APIs affected:** none
**Tests:** none
**Pitfalls:** Do not scaffold frontend/backend/document-service until Phase 1 workflow is approved.
**Follow-up:** Human review of context files before Phase 1 implementation.

### 2026-05-20 — Phase 1A project scaffold

**Workflow:** phase-1a-scaffold-workflow.md
**ADR refs:** 001 (backend module stubs), 002 (separate document-service shell)
**Summary:** Created frontend/, backend/, document-service/ with package.json, .env.example, Express health routes, Vite+React shell. React Router v6 listed in frontend deps; routes not configured. No auth, Supabase, Gemini, Trello, or feature APIs.
**APIs affected:** GET /health on backend (3001) and document-service (3002) only
**Tests:** Node built-in test runner health tests in backend/tests and document-service/tests (require npm install)
**Pitfalls:** Do not re-run Phase 1A; Foundation workflow skips Step 2, starts at Step 3. npm install pending G1 approval.
**Follow-up:** Human G1 for npm install; verify health; G4 before Phase 1 Foundation.

### 2026-05-20 — Phase 1A G1 npm install verified

**Workflow:** phase-1a-scaffold-workflow.md (Step 6–7)
**Summary:** `npm install` completed in backend, document-service, frontend. Backend and document-service `npm test` pass (Node built-in runner). Frontend `npm run build` succeeds. Live smoke: GET /health on :3001 and :3002 OK.
**Pitfalls:** Frontend npm audit reports 2 moderate issues in dev deps (vite chain)—no action in 1A unless human requests.
**Follow-up:** Await G4 (`approved — Phase 1A complete`) before Phase 1 Foundation Step 3+.

### 2026-05-20 — Phase 1A complete (G4)

**Workflow:** phase-1a-scaffold-workflow.md
**Human gates:** G0 begin 1A, G1 npm install, G4 Phase 1A complete — all satisfied
**Reviews:** Supervisor — Approved with notes (I1/I2 doc updates accepted by human). Security — Approved with notes (no critical/high). No blocking issues.
**Summary:** Scaffold closed. `frontend/`, `backend/`, `document-service/` with health checks, lockfiles, tests passing. Foundation **not started** per human instruction.
**Next:** When ready, human approves Phase 1 Foundation; Orchestrator skips Foundation Step 2 (scaffold), starts at Step 3 (Supabase & env). Track SEC-I1 (CORS), SEC-I2 (frontend npm audit), commit hygiene for dist/node_modules.

### 2026-05-20 — Phase 1B Supabase & environment setup

**Workflow:** phase-1-foundation Step 3 (scoped as Phase 1B by human)
**ADR refs:** 001 (config layout), 003 (Zod env validation)
**Summary:** Added Zod `parseEnv`/`getEnv` in backend, document-service, frontend. Backend `getSupabaseAdmin()` (service role); frontend `getSupabaseBrowser()` (anon). Updated `.env.example` placeholders. Unit tests use mock env only. No schema, auth UI, courses, Gemini, Trello.
**Packages added:** backend: zod, @supabase/supabase-js; document-service: zod; frontend: zod, @supabase/supabase-js
**APIs affected:** none (startup validation only)
**Follow-up:** Schema/migrations need approval; Phase 1C auth routes + UI; copy `.env` from examples locally.

### 2026-05-20 — Node.js 20.6+ standardized

**Workflow:** Documentation/metadata (post–Phase 1B review)
**Summary:** PRD §6 Runtime, README, and all package `engines` require Node.js >=20.6.0 for `node --env-file=.env` on backend and document-service.
**Follow-up:** Refresh package-lock `engines` metadata on next approved npm install if needed.

### 2026-05-20 — Phase 1B complete (G4)

**Workflow:** Phase 1B (Foundation Step 3 env slice)
**Human gates:** G1 npm install (zod, @supabase/supabase-js per package), G4 Phase 1B complete — satisfied
**Reviews:** Supervisor — Approved with notes. Security — Approved with notes. No blocking issues.
**Summary:** Env validation (Zod) and Supabase client factories in place. No schema, migrations, auth UI/routes, courses, Gemini, or Trello. Foundation/auth **not started** until next human approval.
**Tracked follow-ups (do not `npm audit fix --force`):**
- Frontend Vite/esbuild **2 moderate** audit (GHSA-67mh-4wv8-2f99, dev-only) — plan upgrade with approval
- **RLS required** before any Supabase data access from frontend (anon key will be public in bundle)
- **`getSupabaseAdmin()`** server-side only — never import in frontend or expose service role via `VITE_*`
- **CORS allowlist** — configure in Foundation/Auth phase (current `cors()` is permissive from 1A)
- Foundation Step 3 split: **3a env done**; **3b schema/migrations** pending human approval
**Next:** Human approval for schema and/or `approved — begin Phase 1C: Auth` (or full Foundation Step 4+).

### 2026-05-20 — Phase 1C migration draft complete (G4)

**Workflow:** Phase 1C / Foundation Step 3b
**Human gates:** `approved — create profiles migration`; `approved — Phase 1C migration draft complete`
**Reviews:** Supervisor — Approved with notes. Security — Approved with notes. No blocking issues.
**Artifacts:** `docs/database/001-profiles-schema-and-rls.md`, `supabase/migrations/001_profiles.sql` (draft, **not applied**)
**PRD:** §9 profiles updated — `id` = `auth.users.id`; no `user_id` on profiles; future tables use `user_id = auth.uid()`
**Summary:** RLS SELECT own only; no client INSERT/UPDATE/DELETE; `handle_new_user` trigger (role `student`); admin promotion manual/service role only.
**Apply status:** Superseded — migration applied 2026-05-20 (see entry below).
**Next:** Phase 1D Auth (routes + UI) or apply migration first — per human order

### 2026-05-20 — Phase 1C profiles migration applied and fully verified

**Workflow:** `approved — apply profiles migration`
**Apply method:** Supabase SQL Editor (not CLI)
**Migration:** `supabase/migrations/001_profiles.sql` — applied to real Supabase project
**Apply status:** **Applied and fully verified** on Supabase project
**Full verification checklist (all passed):**
- `public.profiles` exists
- RLS is enabled on `public.profiles`
- `profiles_select_own` is the only client policy
- No INSERT, UPDATE, or DELETE client policies exist
- `on_auth_user_created` trigger exists and is enabled
- Signup creates one profile row automatically
- `profile_id` equals `auth.users.id` (`profiles.id` = `auth.users.id`)
- Default role is `student`
**Not started:** Phase 1D Auth (routes + UI) — per human instruction
**Follow-up:** Admin promotion remains manual/service role only; optional JWT-level write tests in Auth phase

### 2026-05-20 — Phase 1E courses migration draft complete (G4)

**Workflow:** Phase 1E / Foundation Step 3b (courses schema slice)
**Human gates:** `approved — create courses migration draft`; `approved — Phase 1E courses migration draft complete`
**Reviews:** Supervisor — Approved with notes. Security — Approved with notes. No blocking issues.
**Artifacts:** `docs/database/002-courses-schema-and-rls.md`, `supabase/migrations/002_courses.sql` (draft, **not applied**)
**Prerequisite:** `001_profiles.sql` applied and verified
**Summary:** `public.courses` with `user_id` → `auth.users(id)`; RLS SELECT/INSERT/UPDATE/DELETE own rows (`auth.uid() = user_id`); explicit `GRANT` to `authenticated` and `service_role` (auto-expose disabled); `REVOKE ALL` from `anon`; title CHECK 3–100 chars after trim; `updated_at` trigger with `search_path = public`.
**Apply status:** **Draft only** — do **not** apply without separate `approved — apply courses migration`.
**Tracked follow-ups:**
- Courses API (later): always filter service-role queries `.eq('user_id', req.user.id)`; trim `title` before insert/update
- After apply: verify grants, RLS enabled, CRUD ownership (checklist in `002-courses-schema-and-rls.md`)
- Do **not** start Courses API/UI until human approval
**Next:** Human `approved — apply courses migration` when ready; then Courses API/UI phase (Foundation Step 5) as separate approval

### 2026-05-20 — Phase 1D Auth complete

**Workflow:** Phase 1D / Foundation Step 4  
**ADR refs:** 001, 003  
**Summary:** Implemented Supabase Auth flow: backend auth endpoints, requireAuth middleware, frontend AuthContext, login/register pages, ProtectedRoute, dashboard stub, logout flow, CORS allowlist with FRONTEND_URL, and PRD response envelope. Supabase session handling uses setSession/getSession only; no manual token storage.  
**APIs affected:** POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me  
**Tests:** Backend auth/validation/response/profile retry tests passed; frontend validation tests and build passed. Security fixes #19, #20, and #17 were applied and re-reviewed.  
**Pitfalls:** Do not add admin routes/pages in Auth phase. Do not store tokens manually. /api/auth/me must always read only the current user's own profile. Service-role profile reads must stay filtered by id = req.user.id.  
**Follow-up:** NODE_ENV=production required in production deploy. Track Vite/esbuild audit, rate limiting, and auth error normalization.

### 2026-05-20 — Memory ordering clarification

**Workflow:** Documentation/metadata  
**Summary:** Phase 1D Auth was completed **before** Phase 1E Courses migration draft. The Phase 1D memory entry appears **after** the Phase 1E entry because `AGENT_MEMORY.md` is append-only and 1D was logged later. Do **not** interpret physical entry order as execution order.  
**Execution order (phases):** 1D Auth complete → 1E courses migration draft complete.  
**Current state (at time of entry):** Phase 1D complete; Phase 1E draft complete (not applied). Superseded by later apply entry.

### 2026-05-20 — Phase 1E courses migration applied and fully verified

**Workflow:** `approved — apply courses migration`  
**Apply method:** Supabase SQL Editor (not CLI)  
**Migration:** `supabase/migrations/002_courses.sql` — applied to real Supabase project  
**Apply status:** **Applied and fully verified** on Supabase project  
**Grant file check:** `002_courses.sql` confirmed — `SELECT`/`INSERT`/`UPDATE`/`DELETE` to `authenticated` and `service_role` only; `REVOKE ALL` from `anon`; no `GRANT ALL`  
**Full verification checklist (all passed):**
- `public.courses` exists
- RLS is enabled on `public.courses`
- Policies: `courses_select_own`, `courses_insert_own`, `courses_update_own`, `courses_delete_own` (no admin policies)
- `anon` has no table grants on `public.courses`
- `authenticated` has only `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- `service_role` has only `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- Trigger `courses_set_updated_at` exists and is enabled
- Function `set_courses_updated_at` exists
- Constraint `courses_title_length` exists
**Not started:** Courses API/UI — per human instruction; requires separate approval (Phase 1F)  
**Follow-up (Courses API phase):** Service-role queries must `.eq('user_id', req.user.id)`; trim `title` on insert/update

### 2026-05-20 — Phase 1F Courses Backend API complete (G4)

**Workflow:** Phase 1F / Foundation Step 5 (courses API slice)  
**Human gates:** `approved — begin Phase 1F`; `approved — Phase 1F complete` — satisfied  
**Reviews:** Supervisor — Approved with notes. Security — Approved with notes. No blocking issues.  
**Summary:** Implemented courses CRUD backend module with JWT auth, server-side ownership, and service-role Supabase queries filtered by `req.user.id`. No frontend, schema, tasks, flashcards, Gemini, Trello, dashboard, or admin.  
**APIs affected:**
- GET /api/courses — list own courses
- POST /api/courses — create course (201, `{ course }`)
- GET /api/courses/:id — `{ course, stats }` (stats zero-value stub)
- PATCH /api/courses/:id — update title only
- DELETE /api/courses/:id — `{ deleted: true }`  
**Security contract:**
- All routes use `requireAuth`
- All service-role `courses` queries filter `.eq('user_id', req.user.id)`; by-id routes also `.eq('id', courseId)`
- POST sets `user_id` server-side from `req.user.id` (never from body)
- PATCH updates `{ title }` only — cannot change `user_id`
- DELETE filters by `id` and `user_id`
- Wrong-owner or missing course → **404** `NOT_FOUND` (not 403)
- Course API responses: camelCase `{ id, title, createdAt, updatedAt }` — no `user_id` or `userId`  
**Tests:** Backend courses validation, service, and integration tests passed (mock Supabase; no live project)  
**Pitfalls:** Any future `from('courses')` call must filter by `user_id = req.user.id`. Do not expose service role to frontend. Courses UI must not send `user_id`/`userId` in request bodies.  
**Not started:** Courses frontend UI — per human instruction  
**Tracked follow-ups:**
- Add PATCH/DELETE integration tests later or before frontend if desired
- Courses UI must safely render `title` (escape/display; API does not HTML-sanitize)
- Rate limiting on course CRUD deferred to production hardening
- Frontend Vite/esbuild **2 moderate** audit unchanged (dev-only) — upgrade with approval; no `npm audit fix --force`
**Next:** Human approval before Courses frontend UI; optional manual smoke JWT + CRUD against live Supabase

### 2026-05-20 — DESIGN.md created as Phase 1G UI guidance

**Workflow:** Phase 1G preparation / UI context engineering  
**ADR refs:** none  
**Summary:** Added DESIGN.md as lightweight UI/UX guidance for the upcoming Courses Frontend UI phase. DESIGN.md defines product feeling, layout principles, screen guidance, reusable component expectations, accessibility basics, responsive behavior, and course UI rules. It does not change PRD scope, APIs, backend behavior, database schema, or feature priorities.  
**APIs affected:** none  
**Tests:** none — documentation only  
**Pitfalls:** DESIGN.md must not be used to justify scope creep. Do not add Gemini, Trello, tasks, flashcards, dashboard analytics, admin UI, or new UI libraries because of DESIGN.md. Do not run a full styling pass until functionality works and a human explicitly approves a styling pass.  
**Follow-up:** Use DESIGN.md as lightweight guidance during Phase 1G Courses Frontend UI. Full visual polish requires separate approval: `approved — apply DESIGN styling pass`.

### 2026-05-20 — Phase 1G Courses Frontend UI complete (G4)

**Workflow:** Phase 1G / Foundation courses UI slice  
**Human gates:** `approved — begin Phase 1G`; `approved — Phase 1G complete` — satisfied  
**Reviews:** Supervisor — Approved with notes. Security — Approved with notes. No blocking issues.  
**Summary:** Implemented protected courses UI: list, create, detail, edit title, and delete against existing `/api/courses` endpoints. Dashboard links to My courses. Minimal functional styling per DESIGN.md; no full styling pass.  
**Frontend routes added:**
- `/courses` — course list + create
- `/courses/:id` — course detail + edit + delete  
**Security / API contract (frontend):**
- Bearer token via existing Supabase `getSession()` + `apiFetch` (no manual token storage)
- Request bodies: `{ title }` only — never `user_id` / `userId`
- Course model/display: `{ id, title, createdAt, updatedAt }` only
- `course.title` rendered as plain React text (no `dangerouslySetInnerHTML`)
- `GET /api/courses/:id` stats stub not shown as real metrics
- 404 UI: neutral copy (“Course not found”; “This course may have been deleted.”)  
**APIs consumed:** GET/POST `/api/courses`; GET/PATCH/DELETE `/api/courses/:id` (backend unchanged in this phase)  
**Tests:** Frontend unit tests passed (courses validation + service mocks; 17 total with existing)  
**Build:** Frontend `npm run build` passed  
**Not added:** Backend changes, schema/migrations, new packages, Gemini, Trello, tasks, flashcards, admin, dashboard stats  
**Tracked follow-ups:**
- Full visual styling pass: `approved — apply DESIGN styling pass`
- Task/flashcard/Gemini/Trello features: separate phases with human approval
- Future UI polish may reference DESIGN.md (does not expand scope)
- Frontend Vite/esbuild **2 moderate** audit unchanged (dev-only)
- Optional human manual smoke: login → courses CRUD against live backend  
**Next:** Await human approval for next PRD phase; do not self-start generate, tasks, or styling pass

### 2026-05-21 — GitHub Actions CI workflow complete

**Workflow:** CI / repository automation  
**Human gates:** `approved — CI workflow complete` — satisfied  
**Reviews:** Supervisor — Approved with notes. Security — Approved with notes. No blocking issues.  
**Artifact:** `.github/workflows/ci.yml`  
**Summary:** Added GitHub Actions CI that runs on `push` and `pull_request` with `permissions: contents: read` on `ubuntu-latest`.  
**CI steps:**
- **Backend:** `npm ci` + `npm test`
- **Document service:** `npm ci` + `npm test`
- **Frontend:** `npm ci` + `npm test` + `npm run build`  
**Runtime:** Node.js **22** (`actions/setup-node@v4`); installs use **`npm ci`** (lockfile-pinned), not `npm install`  
**Security (workflow):** No GitHub secrets; no `SUPABASE_SERVICE_ROLE_KEY` or real Supabase credentials; no `.env` files created in CI; no env printing; no deployment; no Supabase migrations; tests rely on existing mocks only  
**Verification:** CI run **green on GitHub Actions** on branch `phase-1g-courses-frontend-ui`  
**Not changed:** Application code, `package.json` dependencies, workflow file after approval gate (this entry is documentation only)

### 2026-05-21 — GitHub Actions CI added and verified

**Workflow:** CI / GitHub Actions  
**ADR refs:** none  
**Summary:** Added `.github/workflows/ci.yml` for automated CI on `push` and `pull_request`. The workflow uses Node.js 22 and runs backend tests, document-service tests, frontend tests, and frontend build using `npm ci`. The workflow was verified green on GitHub Actions on branch `phase-1g-courses-frontend-ui`.  
**APIs affected:** none  
**Tests:** GitHub Actions CI passed: backend `npm test`, document-service `npm test`, frontend `npm test`, and frontend `npm run build`.  
**Pitfalls:** CI must not use Supabase secrets, `SUPABASE_SERVICE_ROLE_KEY`, real Supabase credentials, `.env` files, migrations, deployments, or `npm audit fix`.  
**Follow-up:** Re-review the workflow if future changes add secrets, deployment, Supabase CLI, live integration tests, or `pull_request_target`.

### 2026-05-21 — GitHub workflow templates added

**Workflow:** GitHub repository workflow / PR and issue templates  
**ADR refs:** none  
**Summary:** Added GitHub repository templates for Pull Requests, bug reports, feature requests, and security review requests. The templates support the project’s branch-based workflow, human approval gates, Supervisor Review, Security Review, PRD alignment, and no-secrets hygiene. DESIGN.md is referenced only as UI guidance for approved frontend phases, not as product scope authority.  
**APIs affected:** none  
**Tests:** none — documentation/config templates only. Supervisor Review and Security Review passed with notes; no blockers.  
**Pitfalls:** Templates must not be used to bypass human approval gates. Do not ask users to paste secrets, `.env` contents, API keys, tokens, service role keys, or credentials into issues or PRs.  
**Follow-up:** After push, verify in GitHub UI that Pull Request and Issue templates appear correctly. Optional: create repository labels `bug`, `enhancement`, and `security`.

### 2026-05-21 — Contributing docs and CI badge

**Workflow:** Repository documentation  
**ADR refs:** none  
**Summary:** Added `CONTRIBUTING.md` (branch workflow, PR/issue templates, local tests, Supervisor/Security/human gates, secrets hygiene, DESIGN.md scope limit, migration approval). Added GitHub Actions CI badge and Contributing link in `README.md`. Documented manual GitHub Branch Protection / Ruleset setup (require PR, require CI, block force push).  
**APIs affected:** none  
**Tests:** none — documentation only  
**Pitfalls:** CONTRIBUTING does not replace human approval in `AGENTS.md`; branch protection must be configured in GitHub UI by a maintainer.  
**Follow-up:** Maintainer configures rulesets on `main`; verify CI badge URL matches `DanielBD-1/studyops-ai`. Superseded/extended by developer workflow QoL entry below for full artifact list.

### 2026-05-21 — Developer workflow QoL (full set)

**Workflow:** Repository documentation / developer QoL  
**ADR refs:** none  
**Summary:** Completed developer workflow quality-of-life documentation and config (documentation-only). Artifacts:
- `README.md` — GitHub Actions CI badge, doc links (including `CONTRIBUTING.md`, `SECURITY.md`)
- `CONTRIBUTING.md` — branch/PR workflow, local tests, templates, review gates, branch protection notes
- `SECURITY.md` — secrets hygiene, service role backend-only, Security Review triggers
- `.editorconfig` — UTF-8, LF, spacing conventions
- `.gitattributes` — LF normalization; binary file protection
- `scripts/check-all.ps1` — Windows script for backend/document-service/frontend tests + frontend build  
**APIs affected:** none  
**Tests:** `.\scripts\check-all.ps1` run locally and **passed** — backend **36/36**, document-service **4/4**, frontend **17/17**, frontend **build succeeded**  
**Not changed:** Application source code, `package.json` dependencies, migrations, `.github/workflows/ci.yml`, secrets, deploy automation  
**Pitfalls:** `check-all.ps1` does not run `npm ci`; install dependencies first. Script does not create `.env`, run migrations, or deploy.  
**Follow-up:** Optional README phase-detail refresh beyond status line; link `check-all.ps1` usage in CONTRIBUTING (done in doc follow-up)

### 2026-05-21 — Phase 2A Study Materials schema/RLS draft complete (G4)

**Workflow:** Phase 2A / study materials migration draft  
**Human gates:** `approved — begin Phase 2A`; `approved — create study materials migration draft`; `approved — Phase 2A study materials migration draft complete` — satisfied  
**Reviews:** Supervisor — Approved with notes. Security — Approved with notes. No blocking issues.  
**Artifacts:** `docs/database/003-study-materials-schema-and-rls.md`, `supabase/migrations/003_study_materials.sql` (draft, **not applied**)  
**Summary:** Planned `public.study_materials` with course-chain ownership (no `user_id` on materials). PRD refinement documented: `content` maps to PRD `input_text` / API `studyText`; Gemini output columns deferred.  
**Schema (planned):**
- Columns: `id`, `course_id`, `title`, `content`, `source_type`, `created_at`, `updated_at`
- Ownership: `study_materials.course_id` → `courses.id` → `courses.user_id = auth.uid()`
- `source_type` only `manual` and `paste`
- CHECK: title 3–150 trim; content 100–50,000 trim  
**Security (planned):**
- RLS enabled; policies use `EXISTS` on `public.courses`
- `anon`: no access
- `authenticated` / `service_role`: `SELECT`, `INSERT`, `UPDATE`, `DELETE` only (no `GRANT ALL`)
- No admin select-all policies  
**Apply status:** **Draft only** — not applied to Supabase  
**Not started:** Study Materials backend API, frontend UI, Gemini, Trello, tasks, flashcards, dashboard, admin  
**Tracked follow-ups:**
- Apply migration requires separate approval: `approved — apply study materials migration`
- After apply: verify cross-user INSERT/SELECT/UPDATE/DELETE; verify UPDATE cannot move `course_id` to another user’s course
- Future Study Materials API: every service-role query must prove parent course `user_id = req.user.id`; do not log full `content`
- Gemini generation / `summary`, `key_topics`, `difficulty` columns remain a later phase

### 2026-05-21 — Phase 2A study materials migration applied and fully verified

**Workflow:** `approved — apply study materials migration`  
**Apply method:** Supabase SQL Editor (not CLI)  
**Migration:** `supabase/migrations/003_study_materials.sql` — applied to real Supabase project  
**Human gates:** `approved — study materials migration applied and verified` — satisfied  
**Grant file alignment:** Migration grants section updated in repo to match verified DB state — explicit `REVOKE ALL` from `anon`, `authenticated`, `service_role`, then grant only `SELECT`, `INSERT`, `UPDATE`, `DELETE` to `authenticated` and `service_role` (no REFERENCES, TRIGGER, TRUNCATE, or GRANT ALL). Extra privileges removed during human verification.  
**Apply status:** **Applied and fully verified** on Supabase project  
**Full verification checklist (all passed):**
- `public.study_materials` exists
- RLS enabled on `public.study_materials`
- Policies: `study_materials_select_own_course`, `study_materials_insert_own_course`, `study_materials_update_own_course`, `study_materials_delete_own_course`
- `anon`: no table grants on `public.study_materials`
- `authenticated`: only `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- `service_role`: only `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- CHECK constraints: `study_materials_title_length`, `study_materials_content_length`, `study_materials_source_type_allowed`
- Indexes: `study_materials_course_id_idx`, `study_materials_course_id_created_at_idx`
- Trigger `study_materials_set_updated_at` exists and is enabled
- Function `set_study_materials_updated_at` uses `search_path=public`
- Public tables: `profiles`, `courses`, `study_materials` only (no extra MVP tables)
**Ownership:** Course-chain only — `study_materials.course_id` → `courses.user_id = auth.uid()`; no `user_id` on materials; `content` = PRD `input_text` / `studyText`  
**Not started:** Study Materials API/UI, Gemini, Trello, tasks, flashcards, dashboard, admin  
**Tracked follow-ups:**
- Future Study Materials API: every service-role `study_materials` query must prove parent course `user_id = req.user.id`
- Do not log full material `content`
- Behavioral RLS tests with real authenticated student JWT can be done in API/manual QA phase
- Gemini generation (`summary`, `key_topics`, `difficulty` columns) remains a later phase

### 2026-05-22 — Phase 2B Study Materials Backend API complete

**Workflow:** `approved — implement Phase 2B Study Materials Backend API`; Supervisor fixes applied; `approved — Phase 2B complete`  
**Human gates:** Planning (`approved — begin Phase 2B` planning), implementation, Supervisor review (passed with notes — fixes applied), Security review (passed) — satisfied  
**Reviews:** Supervisor — Approved with notes (23514 mapping, null-data guards — fixed). Security — Approved (including Supervisor fixes). No blocking issues.  
**Artifacts:** `backend/src/modules/study-materials/` (`study-materials.service.js`, `study-materials.controller.js`, `study-materials.routes.js`); `courses.routes.js` extended; `shared/validation/schemas.js` material schemas; tests (`study-materials.validation.test.js`, `study-materials.service.test.js`, `study-materials.test.js`, `mockSupabaseStudyMaterials.js`)  
**APIs added (all `requireAuth`):**
- `GET /api/courses/:id/materials` — list `MaterialSummary` (no `content`)
- `POST /api/courses/:id/materials` — create `MaterialDetail` (201)
- `GET /api/study-materials/:materialId` — detail with `content`
- `PATCH /api/study-materials/:materialId` — update (no `course_id` move)
- `DELETE /api/study-materials/:materialId` — `{ deleted: true }`  
**Response shapes:** `MaterialSummary` = `id`, `courseId`, `title`, `sourceType`, `createdAt`, `updatedAt`; `MaterialDetail` adds `content`. CamelCase API only; no snake_case or nested `courses` in responses.  
**Ownership:** `study_materials.course_id` → `courses.id` → `courses.user_id = req.user.id`. List/create: `assertCourseOwned` before scoped `study_materials` queries. Get/patch/delete: `getOwnedMaterialOrThrow` via `courses!inner` + `.eq('courses.user_id', userId)` — no unfiltered `study_materials` lookup by `materialId` alone. PATCH/DELETE also filter by resolved owned `course_id`. Wrong/missing course or material → **404** (not 403).  
**Validation:** Strict Zod bodies; `sourceType` optional `manual`|`paste`, default `manual`; rejects `course_id`, `courseId`, `user_id`, `userId`, `input_text`, `studyText`, `summary`, `key_topics`, `difficulty`, etc.  
**Error hardening:** Postgres `23514` mapped by constraint name (`study_materials_title_length`, `study_materials_content_length`, `study_materials_source_type_allowed`) or neutral `"Invalid study material data"`; null `data` without error → 404 via `assertRowPresent`.  
**Tests:** Backend `npm test` — **76/76** passed (mock Supabase only).  
**Not added:** Frontend, schema/migrations, packages, Gemini, Trello, tasks, flashcards, dashboard, admin, generate route.  
**Pitfalls:** Do not log full material `content`. Any future service-role `study_materials` query must prove parent course ownership.  
**Tracked follow-ups:**
- Gemini generation remains a later phase
- Behavioral RLS tests with real authenticated JWT optional in UI/manual QA phase

### 2026-05-22 — Phase 2C Study Materials Frontend UI complete

**Workflow:** `approved — implement Phase 2C Study Materials Frontend UI`; `approved — Phase 2C complete`  
**Human gates:** Planning (`approved — begin Phase 2C` planning), implementation, Supervisor review (passed with notes), Security review (passed with notes) — satisfied  
**Reviews:** Supervisor — Approved with notes. Security — Approved with notes. No blocking issues.  
**Artifacts:** `frontend/src/services/study-materials.service.js`; `frontend/src/pages/StudyMaterialDetail.jsx`; `frontend/src/pages/CourseDetail.jsx` (materials section); `frontend/src/components/materials/MaterialCard.jsx`; `frontend/src/components/ui/Textarea.jsx`; `frontend/src/utils/validation.js` (material schemas); `frontend/src/App.jsx` (route); tests (`study-materials.service.test.js`, `study-materials.validation.test.js`)  
**Routes (all `ProtectedRoute`):**
- `/courses/:id` — existing course edit/delete + **study materials list** + **create material** (course id from route only)
- `/study-materials/:materialId` — **view/edit/delete** material (content on detail only)  
**UI/API rules:**
- Bearer token via existing `apiFetch` + Supabase session (no service role, no manual token storage)
- List uses `MaterialSummary` only — **no `content` or content preview** in list/`MaterialCard`
- Detail displays full `content` as plain React text in controlled `Input`/`Textarea` — **no `dangerouslySetInnerHTML`**
- Create body: `{ title, content, sourceType? }` only; update body: `{ title?, content?, sourceType? }` only
- Never sends `course_id`, `courseId`, `user_id`, `userId` in request bodies
- 404: “Course not found” / “Study material not found”; 401: existing logout + redirect
- Delete uses `window.confirm`  
**Tests:** Frontend `npm test` — **32/32** passed; `npm run build` passed (mock API only)  
**Not added:** Backend, schema/migrations, packages, Gemini, generate route, Trello, tasks, flashcards, dashboard, admin, full styling pass  
**Pitfalls:** Do not log full material `content`; continue rendering content as plain text only  
**Tracked follow-ups:**
- Gemini generation remains a later separate phase
- Tasks and flashcards remain later separate phases
- Full styling pass requires separate approval (e.g. `approved — apply DESIGN styling pass`)
- Optional later polish: separate read-only view mode on material detail

### 2026-05-22 — Phase 2C manual smoke test passed

**Workflow:** `approved — manual smoke test passed`  
**Human gate:** Manual end-to-end verification after Phase 2C — satisfied  
**Environment:**
- Backend ran locally on port **3001**
- Frontend ran locally on port **5173**
- Real Supabase project (authenticated JWT), not mock tests  
**Local fixes during smoke (not app code in repo unless docs-only):**
- Frontend `.env` placeholder values corrected so Vite/client config loads
- `public.profiles` grants fixed in Supabase: `authenticated` and `service_role` have **SELECT**; **`anon` has no access**  
**Verified flows:**
- Login succeeded
- **Courses:** list, create, open detail, edit, delete
- **Study materials:** list materials, create material, open detail, edit material, delete material  
**Not tested / not started:** Gemini, generate route, Trello, tasks, flashcards, dashboard, admin  
**Application code:** No repo application code changed during smoke test (this entry is docs-only)  
**Tracked follow-ups:**
- Align `supabase/migrations/001_profiles.sql` and `docs/database/001-profiles-schema-and-rls.md` with verified `public.profiles` grants (SELECT for `authenticated`/`service_role`, no `anon` access)
- Continue to keep **service_role** backend-only; frontend uses anon key + session Bearer only
- Future UI polish / Stitch / `DESIGN.md` styling pass remains later (separate approval)
- Backend generate orchestration calling document-service remains a later separate phase (Phase 2D service layer complete)

### 2026-05-22 — Phase 2D Gemini document-service complete

**Workflow:** `approved — implement Phase 2D Gemini document-service`; `approved — Phase 2D complete`  
**Human gates:** Phase 2D planning + implementation + Supervisor Review + Security Review — satisfied (no blocking issues)  
**Summary:** Smallest safe Gemini processing layer in `document-service` only. Internal **`POST /process`** with strict body `{ studyText }` (trimmed, **100–50,000** chars). Gemini via server-side **`GEMINI_API_KEY`** and Node **`fetch`** (`gemini-2.0-flash`); **30s** timeout; **no retries** on timeout, API error, invalid JSON, or Zod failure. Output validated with PRD §8 **`GeminiOutputSchema`** before success. PRD §8.5 envelopes on `/process`.  
**APIs affected:** `POST /process` (document-service internal, default port **3002**); `GET /health` unchanged  
**Error codes:** `VALIDATION_ERROR` (400), `GEMINI_TIMEOUT` (504), `GEMINI_RATE_LIMIT` (429), `GEMINI_API_ERROR` (500), `GEMINI_INVALID_RESPONSE` (500), `SERVER_ERROR` (500)  
**Logging:** Redacted metadata only (`studyTextLength`, `durationMs`, `httpStatus`, `errorCode`, `zodIssueCount`, `zodPaths`) — no full studyText, prompt, raw Gemini response, API key, or request URL logs  
**Tests:** `document-service` `npm test` — **27/27** passed; mocks/fake key only; no real Gemini calls  
**Packages:** None added (`express`, `zod`, Node `fetch` only)  
**Scope boundary:** No backend/frontend/supabase/.github/root changes; no DB persistence; no `POST /api/courses/:id/generate`; no Generate UI; no Study Tasks / Flashcards / Trello / dashboard / admin  
**Security Review notes:**
- `/process` is **internal-only** for later backend orchestration; not frontend-facing
- `npm start` / `npm run dev` require **`GEMINI_API_KEY`** in `.env` (placeholder OK locally; real key must never be committed)
- Gemini REST uses API key in **request URL query string** — future deployment must avoid logging outbound URLs/query strings at infra/proxy layer
- **Security re-review required** when backend invokes `/process` or if document-service is exposed beyond localhost/private network  
**Pitfalls:** Do not log Gemini URL or key; treat model JSON as untrusted until Zod passes; continue mocking Gemini in CI  
**Tracked follow-ups:**
- Backend generate orchestration requires separate approval
- Persistence of Gemini output requires separate DB/API phase
- Frontend Generate UI requires separate approval
- Continue mocking Gemini in CI (no real secrets)
- Re-review security if `/process` exposure, auth, or shared-secret strategy changes (backend invoke satisfied in Phase 2E — see entry below; infra log hygiene remains)

### 2026-05-22 — Phase 2E Backend Generate Orchestration complete

**Workflow:** `approved — implement Phase 2E backend generate orchestration`; `approved — Phase 2E complete`  
**Human gates:** Phase 2E planning + implementation + Supervisor Review + Security Review — satisfied (no blocking issues)  
**ADR refs:** 002 (document processing in separate service; backend uses `DOCUMENT_SERVICE_URL` only)  
**Summary:** Backend-only orchestration: load owned study material content from DB, call document-service `POST /process`, return ephemeral AI plan without persistence. No `GEMINI_API_KEY` on backend; no direct Gemini calls.  
**APIs added (backend, all `requireAuth`):**
- `POST /api/study-materials/:materialId/generate` — strict empty body `{}`; response `{ materialId, courseId, plan }` (ephemeral; **no DB write**)  
**PRD refinement:** Phase 2E uses **material-scoped** `POST /api/study-materials/:materialId/generate` instead of PRD course-level paste route `POST /api/courses/:courseId/generate` with client `studyText`. **Reason:** smallest safe slice — backend loads `content` from an already-owned saved material instead of trusting `studyText` from the client body. Course-level paste/generate route remains **deferred**.  
**Request body:** `generateStudyMaterialBodySchema` = `z.object({}).strict()` — rejects `studyText`, `courseId`, `course_id`, `userId`, `user_id`, and ownership fields.  
**Ownership (before content use):** `study_materials.course_id` → `courses.id` → `courses.user_id = req.user.id`. Reuses `getOwnedMaterialOrThrow(userId, materialId)`. Wrong-owner or missing material → neutral **404** `"Study material not found"`. Full material `content` loaded only after ownership passes.  
**Document-service call:** `processStudyText` → `POST {DOCUMENT_SERVICE_URL}/process` with body `{ studyText: material.content.trim() }` (length 100–50,000 enforced before call). Backend env: `DOCUMENT_SERVICE_URL` only — **not** `GEMINI_API_KEY`. `GEMINI_API_KEY` remains **document-service only**.  
**Error mapping (client-safe):** `VALIDATION_ERROR`, `NOT_FOUND`, `GEMINI_TIMEOUT`, `GEMINI_RATE_LIMIT`, `GEMINI_API_ERROR`, `GEMINI_INVALID_RESPONSE`, `SERVER_ERROR` / service unavailable — mapped messages only; raw document-service errors/bodies not leaked.  
**Logging:** Redacted metadata only (`contentLength`, `durationMs`, `httpStatus`, `documentServiceErrorCode`, etc.) — no full material `content`, `studyText`, document-service request/response bodies, URLs, tokens, `Authorization`, service role, or secrets.  
**Artifacts:** `backend/src/clients/document-service.client.js`; `generateFromMaterial` in `study-materials.service.js`; controller/route/schema updates; tests (`study-materials-generate.test.js`, `document-service.client.test.js`, service/validation tests).  
**Tests:** Backend `npm test` — **99/99** passed; mocked `fetch` / document-service only; no real Gemini or real document-service calls.  
**Packages:** None added.  
**Scope boundary:** **Backend only** — no frontend, document-service, supabase, `.github`, or root changes. No generated output persisted. No `study_tasks` / `flashcards` tables. No frontend Generate UI. No Trello, dashboard, admin, styling, or deployment.  
**Security Review (Phase 2E):** Approved with notes — closes Phase 2D follow-up “re-review when backend invokes `/process`”. Treat `plan` as untrusted AI output until a future persistence phase re-validates before any DB write. Keep document-service on private/internal network; avoid logging request bodies/URLs at infra/proxy layer.  
**Pitfalls:** Do not persist `plan` without separate approval and Security Review. Do not add `GEMINI_API_KEY` to backend. Do not log `content` or `studyText`. Do not expose `DOCUMENT_SERVICE_URL` to frontend.  
**Tracked follow-ups:**
- Frontend Generate UI requires separate approval
- Persistence of summary/tasks/flashcards requires separate DB/API phase and Security Review
- Re-validate AI output before any future DB write
- Trello / tasks / flashcards / dashboard / admin remain separate future phases
- Keep document-service private/internal; avoid logging request bodies/URLs in infra logs
- Optional: PRD course-level paste/generate route when explicitly approved

### 2026-05-22 — Phase 2F Frontend Generate UI complete

**Workflow:** `approved — implement Phase 2F Frontend Generate UI`; `approved — Phase 2F complete`  
**Human gates:** Phase 2F planning + implementation + Supervisor Review + Security Review — satisfied (no blocking issues)  
**Summary:** Smallest safe frontend slice to call Phase 2E generate from study material detail: **Generate study plan** button, ephemeral in-page plan display, no persistence. Frontend calls backend only via existing `apiFetch` + Bearer session.  
**UI (route unchanged):** `/study-materials/:materialId` — `StudyMaterialDetail` + `GeneratedPlanSection`  
**Frontend API consumed:**
- `POST /api/study-materials/:materialId/generate` via `generateMaterial(materialId)` in `study-materials.service.js`  
**Request contract:**
- `materialId` from route params only
- Body exactly `{}` — does **not** send `studyText`, `content`, `courseId`, `course_id`, `userId`, `user_id`, or ownership fields  
**Generated plan (ephemeral):**
- Stored in React state only — no DB, `localStorage`, or `sessionStorage`
- Read-only display: summary, key topics, difficulty, tasks, flashcards
- Plain React text only — **no** `dangerouslySetInnerHTML`
- **Clear plan** clears local state only (no API)
- Refresh/navigation/`loadMaterial` clears plan  
**UX / safety:**
- Generate disabled while loading, generating, saving, deleting, or form has unsaved changes
- Unsaved changes message: *“Save changes before generating — generation uses your last saved material.”*
- Loading copy: *“Processing with AI…”*
- **401:** existing logout + redirect (`AUTH_REQUIRED`)
- **404:** neutral “Study material not found” (unchanged)  
**Artifacts:** `frontend/src/services/study-materials.service.js` (`generateMaterial`, `StudyPlan` typedef); `frontend/src/pages/StudyMaterialDetail.jsx`; `frontend/src/components/materials/GeneratedPlanSection.jsx`; `frontend/tests/unit/study-materials.service.test.js`  
**Tests:** Frontend `npm test` — **34/34** passed; `npm run build` succeeded; mocks only (`__setApiFetchForTests`) — no real backend, document-service, or Gemini  
**Packages:** None added  
**Scope boundary:** **Frontend only** — no backend, document-service, supabase, `.github`, or root changes. No task/flashcard management UI, Trello, dashboard, admin, styling pass, or deployment.  
**Security notes:** No `GEMINI_API_KEY`, `DOCUMENT_SERVICE_URL`, or service role in frontend. Do not log material `content`, generated `plan`, tokens, or `Authorization`. Treat `plan` as **untrusted display data** until a persistence phase validates storage rules.  
**Pitfalls:** Do not persist `plan` without separate approval and Security Review. Do not send `content` in generate body. Do not call document-service or Gemini from frontend.  
**Tracked follow-ups:**
- Optional UX hardening: clear generated plan after successful save to avoid stale plan display
- Persistence of AI output requires separate DB/API phase and Security Review
- Task/flashcard management UI remains separate future work
- Trello / dashboard / admin / styling / Stitch remain separate future phases
- Re-validate AI output before any future DB write

### 2026-05-22 — Phase 2G Quality/Lint complete

**Workflow:** `approved — implement Phase 2G Quality/Lint`; `approved — Phase 2G complete`  
**Human gates:** Phase 2G planning + implementation + Supervisor Review + Security Review — satisfied (no blocking issues)  
**Summary:** Aligned repo tooling with documented lint workflow (AGENTS.md, PRD §12). Added **ESLint only** (flat config) to `backend/`, `document-service/`, and `frontend/` — no Prettier, Husky, pre-commit hooks, `npm audit fix`, or dependency upgrade sweep.  
**Artifacts:**
- `backend/eslint.config.js`, `document-service/eslint.config.js`, `frontend/eslint.config.js`
- Per-package `package.json` scripts: `npm run lint`, `npm run lint:fix`
- `.github/workflows/ci.yml` — lint after `npm ci`, before tests/build
- `scripts/check-all.ps1` — lint before tests/build per package
- `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` — lint required in workflow / Definition of Done  
**Lint devDependencies (no runtime deps added):**
- **Backend / document-service:** `eslint`, `@eslint/js`, `globals`
- **Frontend:** above + `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (no `eslint-plugin-react` in this phase)  
**Config baseline:**
- `@eslint/js` recommended; Node ESM globals (backend/document-service); browser + React hooks/refresh (frontend)
- `no-console: off` (intentional structured logging unchanged)
- `^_` ignore for unused args/vars; `react-hooks/set-state-in-effect: off` (gradual)
- Frontend `**/*.jsx`: `no-unused-vars` **off** (JSX usage not visible without `eslint-plugin-react`)  
**Minimal lint fixes (tests only):** removed unused test imports; renamed omitted destructuring bindings to `_SUPABASE_URL` / `_VITE_SUPABASE_ANON_KEY` — no behavior change  
**Not changed:** App `src/` feature/API/database/auth/UI behavior; Supabase/migrations; secrets/env; deploy/publish; CI `permissions: contents: read`  
**Checks passed:**
- Backend: `npm run lint`; `npm test` **99/99**
- Document-service: `npm run lint`; `npm test` **27/27**
- Frontend: `npm run lint` (1 warning); `npm test` **34/34**; `npm run build`
- `scripts/check-all.ps1`  
**Known notes:**
- Frontend **1 warning:** `react-refresh/only-export-components` on `AuthContext.jsx` (`useAuth` export) — acceptable for Phase 2G  
**Tracked follow-ups:**
- Optional: add `eslint-plugin-react` and tighten JSX unused-import detection
- Optional: secret scanning in CI (PRD suggested; not added in 2G)
- Optional: stricter logging lint rules if desired
- Do not use `npm audit fix --force` without explicit human approval
- Adding new ESLint plugins or changing rule severity requires human approval (per `AGENTS.md`)

### 2026-05-22 — Phase 2H Docs / Agent Workflow complete

**Workflow:** `approved — begin Phase 2H Docs / Agent Workflow planning only`; `approved — implement Phase 2H Docs / Agent Workflow`; `approved — Phase 2H complete`  
**Human gates:** Phase 2H planning + implementation + Supervisor Review + Security Review — satisfied (no blocking issues)  
**Summary:** Docs-only alignment so README, governance files, security guide, PRD drift note, and workflows match the system built through Phase 2G. No application, package, CI, env, or `DESIGN.md` changes.  
**Artifacts (docs only):**
- **New:** `docs/IMPLEMENTATION_STATUS.md` — readable **current-state hub** (architecture, env boundaries, implemented APIs/routes, deferred work, agent summary)
- **Updated:** `README.md` — status through 2G, what works today, env table, lint/test/build commands
- **Updated:** `AGENTS.md`, `CLAUDE.md` — formal **agent-role workflow** and phase approval phrases
- **Updated:** `CONTRIBUTING.md` — agent-assisted workflow; docs-only PR expectations
- **Updated:** `SECURITY.md` — environment/service boundaries and AI output rules
- **Updated:** `docs/PRD.md` — **Implementation Status / drift note only** (no MVP rewrite)
- **Updated:** `docs/workflows/document-processing-workflow.md` — implemented (2D–2F) vs deferred (persistence, course-level generate)  
**Documented implemented generate (current):**
- `POST /api/study-materials/:materialId/generate` — body **`{}`**; backend loads saved owned `content` after ownership; ephemeral `{ materialId, courseId, plan }` — **no DB persistence**
- Course-level `POST /api/courses/:courseId/generate` with client `{ studyText }` — **deferred** (PRD target)  
**Documented env / security boundaries:**
- `GEMINI_API_KEY` — **document-service only**
- `DOCUMENT_SERVICE_URL` — **backend only**
- Frontend — `VITE_API_URL` + `VITE_SUPABASE_*` anon key only
- `SUPABASE_SERVICE_ROLE_KEY` — **backend only** (never frontend / `VITE_*`)
- `POST /process` — **internal-only** (not browser-facing)  
**Agent roles formalized:** Orchestrator; **Planning Agent**; Implementation Agent; Testing Agent; **Supervisor Review Agent** (Process Supervisor); **Security Review Agent**; **Documentation Agent**; **Design Agent** (later, `DESIGN.md` UI guidance only)  
**Phase gates documented:** `approved — begin Phase X planning only` | `approved — implement Phase X` | `approved — Phase X complete`  
**AI output (docs):** Generated `plan` is **ephemeral** UI state only; **untrusted** until validated; **persisting** to DB requires future phase + **Security Review**  
**Not started (unchanged):** Persistence of AI output; `study_tasks` / `flashcards` tables; task/flashcard management UI; Trello; dashboard/admin; deployment; Stitch / full DESIGN styling pass  
**Security Review (Phase 2H) notes:** Docs use placeholders only (no real secrets); `/process` remains internal-only; docs do **not** instruct frontend to send `studyText`/`content`; ownership/RLS boundaries not weakened; docs-only lint/test exemption applies only when **no app files** change; **code phases** still require lint/tests/build and Security Review when triggers apply  
**Pitfalls:** For **what is built**, use `docs/IMPLEMENTATION_STATUS.md` before assuming PRD §9 course-level generate or persistence. PRD body below appendix still describes future MVP — appendix + memory are authoritative for current behavior.  
**Tracked follow-ups:**
- Optional: `eslint-plugin-react`; secret scanning in CI; PRD §9 cross-link to Implementation Status appendix
- Persistence phase + Security Review before any AI DB writes
- Course-level paste/generate, tasks UI, Trello, dashboard, admin, deployment, styling pass — separate approvals

### 2026-05-22 — Phase 2I-a Stitch / DESIGN brief prep complete

**Workflow:** `approved — begin Phase 2I Stitch / DESIGN.md planning only`; `approved — implement Phase 2I Stitch / DESIGN brief`; `approved — apply Phase 2I Security Review doc hardening only`; `approved — Phase 2I-a Stitch brief prep complete`  
**Human gates:** Phase 2I planning + brief implementation + Security hardening + Supervisor Review + Security Review (including hardening re-review) — satisfied (no blocking issues)  
**Summary:** Design-prep **documentation only** for human-reviewed Stitch work and future `DESIGN.md` v2. No application code, styling, packages, CI, env, or `DESIGN.md` changes.  
**Artifacts (docs only):**
- **New:** `docs/STITCH_BRIEF.md` — advisory Stitch input; implemented screens only; out-of-scope list; design direction; animation spec for **later** styling phase; paste-ready Stitch prompt (§17)
- **New:** `docs/design/SCREENSHOT_INDEX.md` — 14 required screenshots; fake-data rules; capture safety (steps 7–10)
- **New:** `docs/design/screenshots/.gitkeep` — placeholder for human PNGs (no screenshots committed yet)  
**Security hardening (docs):**
- Screenshots: application UI only; crop excludes DevTools, Network/Application/Storage tabs, extension panels, terminals, IDE `.env` views, JWTs, session tokens, API keys, Authorization headers
- Dedicated test account (e.g. `demo.student@example.test`) and **dummy password only** (e.g. `TestPassword123!`) — never real/production credentials
- Before `git add` of PNGs: manually re-check crops for PII, tokens, secrets
- Stitch: do **not** upload repo, backend/document-service source, `.env`, or service-role documentation; use only brief + screenshots + short `IMPLEMENTATION_STATUS` excerpt
- §14 checklist: screenshot crops exclude DevTools, network panels, terminals, JWTs, `.env` snippets  
**Design direction (documented, not implemented):**
- Modern **AI Study Cockpit** — polished, professional, pleasant, modern, cool UI
- Productivity SaaS feel — Notion + Linear + Raycast **principles only** (do not clone brands)
- Tasteful animations and smooth page transitions planned for **later styling phase** (`prefers-reduced-motion` when implemented)
- **Avoid:** clinical/hospital look, medical teal, childish gamification, generic dashboards, excessive neon, heavy motion  
**Stitch workflow (rules):**
- `STITCH_BRIEF.md` is **advisory** design input — **not** product scope
- Stitch must **not** invent product features or design unimplemented screens
- Stitch must **not** generate frontend code for direct merge into `frontend/`
- Stitch designs **only** implemented routes (auth, dashboard stub, courses, materials, generate, ephemeral plan display, loading/empty/validation/not-found states)
- **`DESIGN.md` v2** requires separate human approval **after** Stitch review and design-direction choice
- Applying styling to `frontend/` requires separate future phase and approval (e.g. `approved — apply DESIGN styling pass`)  
**Scope boundary (unchanged):**
- No `frontend/`, `backend/`, `document-service/`, `supabase/`, `.github/`, `package.json`, `package-lock.json`, `eslint.config.js`, `scripts/check-all.ps1`, `.env` / `.env.example` changes
- No Stitch output committed as app code; no styling pass started
- `DESIGN.md` unchanged (still Phase 1G guidance)  
**APIs affected:** none  
**Tests:** none — documentation only  
**Pitfalls:** Do not treat Stitch mockups as shipped UI or PRD scope. Do not commit screenshots with real student content, credentials, tokens, or DevTools/network panels visible. Do not upload full repo or secrets to Stitch. Generated AI plan in designs remains **ephemeral** and **untrusted display** — no “saved plans” UI.  
**Tracked follow-ups:**
- Human: capture screenshots per `docs/design/SCREENSHOT_INDEX.md` (fake data only)
- Human: run/review Stitch using `docs/STITCH_BRIEF.md`
- Human: choose design direction before `DESIGN.md` v2
- `DESIGN.md` v2 — separate approval (not automatic from Stitch)
- Frontend styling pass — separate branch and `approved — apply DESIGN styling pass` (or equivalent)
- **Full Phase 2I not complete** until screenshots + Stitch review + `DESIGN.md` v2 decision are handled or explicitly waived by human
- Persistence, tasks/flashcard management UI, Trello, dashboard/admin, deployment — still separate future phases

### 2026-05-22 — Phase 2I-b design screenshots complete

**Workflow:** `approved — implement Phase 2I Stitch / DESIGN brief` (2I-a); `approved — apply Phase 2I-b screenshot index alignment only`; `approved — apply Phase 2I-b Stitch brief filename nit only`; `approved — Phase 2I-b design screenshots complete`  
**Human gates:** Supervisor Review + Security Review (screenshots + index alignment + filename nit) + human screenshot safety check — satisfied (no blocking issues)  
**Summary:** **Screenshot-only** design reference assets for Stitch. **13 PNGs** added under `docs/design/screenshots/` using fake/demo data only. Aligned `docs/design/SCREENSHOT_INDEX.md` and `docs/STITCH_BRIEF.md` to captured and pending filenames. No application code, styling, packages, CI, env, or `DESIGN.md` changes.  
**Captured screenshots (13):**
- `01-login.png`, `02-register.png`, `03-dashboard.png`
- `04-courses-empty.png`, `05-create-course-form.png`, `06-courses-list.png`
- `07-course-detail-materials.png`, `08-create-material-form.png`, `09-study-material-detail.png`
- `10-generate-study-plan.png`, `12-unsaved-changes-warning.png`, `13-validation-error.png`, `14-not-found.png`  
**Pending screenshots (do not fabricate):**
- `11-generated-plan-visible.png` — pending until live Generate output is available
- `15-processing-with-ai.png` — pending until processing UI can be captured reliably  
**Docs updated (2I-b alignment):**
- `docs/design/SCREENSHOT_INDEX.md` — authoritative captured vs pending tables; do-not-fabricate rules
- `docs/STITCH_BRIEF.md` — §5 filenames aligned; pointer to index; optional mobile `06-courses-list-mobile.png` (not `15-` prefix)  
**Security notes:**
- Human reviewed crops for PII/auth artifacts before commit intent
- Stitch: use only `STITCH_BRIEF.md`, captured screenshots, short `IMPLEMENTATION_STATUS` excerpt — **not** full repo, backend/document-service source, `.env`, or service-role documentation
- Stitch remains **advisory** only; `DESIGN.md` v2 and frontend styling pass require **separate** approvals/branches  
**Scope boundary (unchanged):**
- No `frontend/`, `backend/`, `document-service/`, `supabase/`, `.github/`, `package.json`, `package-lock.json`, CI, `.env` changes
- No Stitch output as app code; no styling pass started; `DESIGN.md` unchanged  
**APIs affected:** none  
**Tests:** none — screenshots + docs only  
**Pitfalls:** Do not fabricate `11-` or `15-processing-with-ai` PNGs. Do not attach pending files to Stitch. Do not treat screenshots as product scope or persistence/Trello/admin features.  
**Tracked follow-ups (historical — superseded by 2I-c):** Stitch review and `DESIGN.md` v2 completed in Phase 2I-c; see entry below.

### 2026-05-22 — Phase 2I-c DESIGN.md v2 complete

**Workflow:** `approved — begin Phase 2I-c DESIGN.md v2 planning only`; `approved — implement Phase 2I-c DESIGN.md v2`; `approved — Phase 2I-c complete`  
**Human gates:** Phase 2I-c planning + implementation + Supervisor Review + Security Review — satisfied (no blocking issues; no Security Review file changes required)  
**Summary:** Rewrote **`DESIGN.md` to v2** as **presentation-only** UI/UX specification. Encodes human-approved **NotebookLM-inspired** academic study workspace direction (not a NotebookLM clone). No application code, styling, packages, CI, env, or screenshot changes. No Stitch HTML/React/code merged.  
**Artifact:** `DESIGN.md` v2 (2026-05-22) — supersedes Phase 1G guidance; framework-agnostic CSS token proposal; screen guidance for all implemented routes; concept-only generated-plan and processing sections; styling implementation guide for future Phase 2J  
**Approved visual direction (documented, not implemented in code):**
- NotebookLM-inspired academic study workspace — **not** a clone
- Clean Google-like productivity; source-first / document-card materials; modern AI study cockpit
- Warm off-white / light gray canvas; white cards; soft borders; subtle shadows; rounded corners
- Calm blue / muted indigo accent; soft lavender/blue tint **only** for AI/generate zones
- Excellent long-form study material readability; Generate helpful and grounded, not flashy
- Professional, pleasant, modern, **non-clinical**  
**Guardrails encoded in DESIGN.md v2:**
- **Presentation only** — does not authorize new product features, routes, APIs, or persistence
- No Tailwind, Google Fonts, Material Icons, or new UI library **required** (system font stack; plain CSS/CSS modules)
- No Stitch HTML/React merge; no Source Drawer, Search Library, Recent Sources, Drafting Space, AI Sidebar as product feature
- No NotebookLM-only features: audio overview, source upload, citations panel, notebook sharing
- No tasks UI, flashcard management UI, Trello, admin/dashboard analytics, saved plan library, persistence UI  
**Generate / security rules (unchanged, reinforced in v2):**
- `POST /api/study-materials/:materialId/generate` — body `{}`; material-scoped; backend-owned; ownership before content use
- Frontend must **not** send `studyText` or `content` on generate; no `document-service` / `GEMINI_API_KEY` in client
- Generated `plan`: **session-only** (React state), **read-only**, **untrusted**, **not persisted**; plain text only
- Pending screens **concept-only:** `11-generated-plan-visible.png`, `15-processing-with-ai.png` — do not fabricate
- No `service_role`, API keys, tokens, or `.env` values in frontend; do not weaken auth/RLS boundaries  
**Scope boundary:**
- No `frontend/`, `backend/`, `document-service/`, `supabase/`, `.github/`, `package.json`, `package-lock.json`, CI, `.env` changes
- No styling pass started; `docs/STITCH_BRIEF.md`, `docs/design/**` unchanged in 2I-c  
**APIs affected:** none  
**Tests:** none — documentation only  
**Pitfalls:** Do not treat DESIGN.md v2 as PRD scope. Styling pass must not add persistence, upload UI, Stitch paste-in, or new routes. Do not add interactive task checkboxes on generated plan display.  
**Tracked follow-ups (historical — styling pass completed in Phase 2J):**
- Optional: capture `11-generated-plan-visible.png` and `15-processing-with-ai.png` when live Generate/processing UI available
- Persistence, tasks/flashcard management UI, Trello, dashboard/admin, deployment — separate future phases

### 2026-05-22 — Phase 2J Frontend Styling Pass complete

**Workflow:** `approved — begin Phase 2J Frontend Styling Pass planning only`; `approved — implement Phase 2J Frontend Styling Pass`; Supervisor Review + Security Review + manual smoke; `approved — Phase 2J complete`  
**Human gates:** Supervisor Review + Security Review + manual smoke — satisfied (no blocking issues)  
**Summary:** Applied **`DESIGN.md` v2** to the existing frontend using **plain CSS**, design tokens, and **className-based** styling. Presentation-only pass on implemented screens and components; **no app behavior changed**.  
**CSS architecture added:**
- `frontend/src/styles/tokens.css` — DESIGN.md v2 design tokens (colors, typography, spacing, radii, shadows, content max widths)
- `frontend/src/styles/base.css` — reset, body typography, links, global `:focus-visible`, `prefers-reduced-motion`
- `frontend/src/styles/layout.css` — page shells, workspace/reading widths, stacks, auth centering, not-found
- `frontend/src/styles/components.css` — buttons, fields, cards, AI-tinted form cards, plan blocks, source cards, loading/empty/error, responsive polish  
**Frontend wiring:**
- `frontend/src/main.jsx` — imports tokens → base → layout → components, then minimal `index.css`
- `frontend/src/index.css` — comment-only pointer to styles layer  
**Restyled (existing only):**
- UI primitives: `Button`, `Input`, `Textarea`, `FormCard` (+ `ai` prop for generate zones), `ErrorMessage`, `LoadingState`, `EmptyState`
- Cards: `CourseCard`, `MaterialCard`
- Generate: `GeneratedPlanSection` (read-only; “AI-generated — not saved” disclaimer)
- Auth: `LoginForm`, `RegisterForm`, `ProtectedRoute`
- Pages: `Landing`, `Register`, `DashboardStub`, `CoursesList`, `CourseDetail`, `StudyMaterialDetail`  
**Approved visual direction (implemented in CSS):**
- NotebookLM-inspired academic study workspace — **not** a clone
- Warm off-white canvas; white cards; soft borders; subtle shadows; rounded corners
- Calm blue / muted indigo accent; AI/generate zones use soft blue/lavender tint
- Source-first document-card feeling; professional, pleasant, modern, **non-clinical** UI
- Excellent readability for long-form study material; Generate area helpful and grounded, not flashy  
**Polish (CSS-only):** hover lift on cards; button press feedback; `:focus-visible` rings; short transitions; `prefers-reduced-motion` guard (global + plan fade-in)  
**Unchanged (explicit):**
- No app behavior, routes, APIs, auth, generate logic, or persistence
- No backend, document-service, Supabase/database/migration changes
- No `package.json` / `package-lock.json`, CI, or `.env` changes
- No Tailwind, Google Fonts, Material Icons, UI libraries, or Stitch HTML/React code
- No AppShell; `window.confirm` retained for delete flows  
**Security notes (verified in review):**
- Generated plan remains **session-only**, **read-only**, plain React text, **untrusted**, **not persisted**
- No `dangerouslySetInnerHTML`
- Frontend still does **not** send `studyText` / `content` / `courseId` / `userId` to generate; `generateMaterial` still `POST /api/study-materials/:materialId/generate` with body `{}`
- Frontend still does **not** call document-service directly
- No `service_role`, Gemini key, API keys, tokens, session values, or env values exposed in UI
- 401 logout/redirect and neutral not-found behavior unchanged
- Delete confirmations still use existing `window.confirm` behavior  
**Scope boundary:**
- No `backend/`, `document-service/`, `supabase/`, `.github/`, `package.json`, `package-lock.json`, CI, `.env` changes
- No new routes, AppShell, custom confirm dialogs, persistence UI, tasks/Trello/admin UI, source upload, audio overview, citations, NotebookLM clone features  
**APIs affected:** none  
**Verification:**
- `cd frontend && npm run lint` — passed (0 errors; pre-existing `AuthContext` react-refresh warning)
- `cd frontend && npm test` — **34/34** passed
- `cd frontend && npm run build` — passed
- `.\scripts\check-all.ps1` — passed
- Manual smoke — passed  
**Pitfalls:** Do not treat styling as authorization for new features or persistence. Do not add `dangerouslySetInnerHTML` for plan/content. Do not send material body on generate. Re-run Security Review if plan/content rendering or auth surfaces change materially.  
**Tracked follow-ups (historical — see Phase 2K-a for live Generate smoke status):**
- Optional: capture `11-generated-plan-visible.png` after live Generate succeeds (blocked as of 2K-a)
- Optional: capture `15-processing-with-ai.png` when processing UI can be reliably captured
- Optional: future accessibility polish may replace `window.confirm` with a custom dialog — **not** in 2J
- Any future changes to plan/content rendering or auth surfaces require **Security Review**
- Persistence, tasks/flashcard management UI, Trello, dashboard/admin, deployment — separate future phases

### 2026-05-22 — Phase 2K-a Generate live smoke (blocked by Gemini rate limit)

**Workflow:** `approved — begin Phase 2K Generate live smoke / missing screenshots planning only`; `approved — run Phase 2K Generate live smoke`; `approved — run Phase 2K Generate live smoke retry`; `approved — run Phase 2K Generate live smoke retry 3`; `approved — record Phase 2K-a Generate live smoke blocked by Gemini rate limit`  
**Summary:** **Live smoke only** — multiple attempts to verify end-to-end Generate locally. **No repository changes** during smoke (no code, screenshots, packages, CI, env files, or other docs). Infrastructure and UI guards **passed**; **Generate did not complete** because **Gemini returned HTTP 429** (rate limit). **No code bug suspected.**  
**Smoke scope:** Manual verification of document-service → backend orchestration → frontend Generate on material detail; optional pending design screenshots **not** captured or fabricated.  
**What passed (retries 2–3, representative):**
- `GET http://localhost:3002/health` — document-service **ok**
- `GET http://localhost:3001/health` — backend **ok**
- Frontend **http://localhost:5173/** — loaded
- Demo user login — **ok** (`demo.student@example.test` fake account)
- Fake course/material flow — **ok** (e.g. **Operating Systems**, material **Chapter 4 — Sorting Algorithms (smoke test)** with placeholder content ≥100 characters, saved)
- Generate invoked from `/study-materials/:materialId` — **one click per retry 3** (no spam)
- Request contract (private check, no tokens logged): `POST /api/study-materials/:materialId/generate` with body **`{}`** strict; frontend did **not** send `studyText`, `content`, `courseId`, or `userId`
- Processing UI — **appeared** (“Processing with AI…” button + loading copy)
- Unsaved-changes guard — **ok** (Generate disabled + save-before-generate warning)
- Neutral not-found — **ok** for valid non-existent UUID (e.g. `ffffffff-ffff-4fff-bfff-ffffffffffff`)  
**What failed:**
- **Generate completion** — no read-only plan rendered in session
- **Root cause:** **Gemini / external API** — HTTP **429** rate limit; user-visible paraphrase: *“Service temporarily unavailable, please wait 1 minute”* (and on first retry, *“Processing service unavailable, please try later”*)
- Retry 1 additionally blocked by missing `GEMINI_API_KEY` in document-service env and unconfirmed demo login before human env/auth setup  
**Security / contract (unchanged, observed):**
- Generated plan would remain session-only, read-only, plain React text, untrusted, not persisted — **not observed** because plan never returned
- No `dangerouslySetInnerHTML`; frontend does not call document-service directly  
**Scope boundary (smoke session):**
- No `frontend/`, `backend/`, `document-service/`, `supabase/`, `.github/`, `package.json`, `package-lock.json`, CI, `.env`, `DESIGN.md`, or screenshot file changes
- No persistence, new routes, or generate behavior changes  
**APIs affected:** none (smoke only)  
**Tests / lint / build:** not run for 2K-a smoke (live manual only)  
**Pitfalls:** Do not fabricate `11-generated-plan-visible.png` or `15-processing-with-ai.png`. Do not spam Generate while 429 persists. Do not treat rate limit as a code defect without evidence.  
**Human ops note:** **Supabase Confirm email** should be restored to **ON** after the smoke session (may have been disabled to allow demo login).  
**Tracked follow-ups:**
- Retry live Generate smoke only after **Gemini quota cooldown** or **quota/model adjustment** — use **single** Generate click per attempt (`approved — run Phase 2K Generate live smoke retry` or equivalent)
- `11-generated-plan-visible.png` — **pending** until successful live plan display
- `15-processing-with-ai.png` — **pending** but **appears capturable** (processing UI observed); do not fabricate
- After successful smoke + human PNG safety check: `approved — capture Phase 2K pending screenshots` then `approved — Phase 2K complete` for memory alignment
- Persistence, tasks/flashcard management UI, Trello, dashboard/admin, deployment — separate future phases

### 2026-05-23 — Phase 2L-a DB schema and RLS complete

**Workflow:** `approved — begin Phase 2L Generated Plan Persistence planning only`; `approved — implement Phase 2L-a DB schema and RLS`; Supervisor Review + Security Review; human manual apply on Supabase; `approved — Phase 2L-a complete`  
**Human gates:** Supervisor Review + Security Review — satisfied (no blocking issues); migration applied manually in Supabase SQL Editor (**Success. No rows returned.**)  
**Summary:** Added **`public.material_generated_plans`** — database foundation for persisting **one latest validated AI-generated plan per study material**. SQL migration + database doc only; **no** backend, frontend, document-service, package, CI, or env changes.  
**Artifacts:**
- `supabase/migrations/004_material_generated_plans.sql`
- `docs/database/004-material-generated-plans-schema-and-rls.md`  
**Model:**
- **One row per `study_material_id`** (`UNIQUE`) — latest plan only
- **No** history table, failed-attempt table, raw Gemini response column, or duplicated `study_materials.content`  
**Schema (applied):**
- `id` uuid PK; `study_material_id` uuid UNIQUE FK → `study_materials` ON DELETE CASCADE
- `course_id` uuid FK → `courses` ON DELETE CASCADE
- `plan` jsonb NOT NULL — `jsonb_typeof(plan) = 'object'`; `pg_column_size(plan) <= 262144` (256 KiB)
- `created_at`, `updated_at` timestamptz  
**Integrity triggers:**
- `material_generated_plans_set_updated_at` — maintain `updated_at` on UPDATE
- `material_generated_plans_enforce_course_match` — reject mismatched `study_material_id` / `course_id` (including service-role writes)  
**RLS and grants:**
- RLS **enabled**; policies for `authenticated` SELECT/INSERT/UPDATE/DELETE via owned `course_id` → `courses.user_id = auth.uid()` plus material/course alignment
- `REVOKE ALL` then `GRANT SELECT, INSERT, UPDATE, DELETE` to `authenticated` and `service_role` (project style)
- **`anon`:** no access
- **`service_role`:** backend-only; bypasses RLS — app must filter  
**Security notes (for 2L-b):**
- AI `plan` is **untrusted** until backend Zod validation immediately before DB write
- Backend must verify **study_material_id → course_id → courses.user_id** before service-role writes
- Wrong-owner or missing plan/material → **neutral 404** at API layer
- Frontend must **not** persist plans via direct Supabase client writes  
**Scope boundary:**
- No `backend/`, `frontend/`, `document-service/`, `.github/`, `package.json`, `package-lock.json`, CI, `.env` changes in 2L-a  
**APIs affected:** none (schema only)  
**Tests:** none — migration/docs only  
**Pitfalls:** Do not store plan history, failed generates, or raw Gemini payloads. Do not skip backend validation in 2L-b. Do not expose service_role to frontend.  
**Tracked follow-ups:**
- **Phase 2L-b:** backend persistence API — **complete** (see 2026-05-24 entry)
- **Phase 2L-c:** frontend save/load/clear UI — **complete** (see 2026-05-23 entry)
- **Phase 2L-d:** docs/smoke alignment — **complete** (see 2026-05-24 entry)
- Optional: live Generate smoke / screenshots `11-`, `15-` after Gemini quota allows (Phase 2K follow-ups)
- `study_tasks` / `flashcards` normalization tables — still separate future phases

### 2026-05-24 — Phase 2L-b Backend Generated Plan Persistence complete

**Workflow:** `approved — implement Phase 2L-b backend generated plan persistence`; Supervisor Review + Security Review; `approved — Phase 2L-b complete`  
**Human gates:** Supervisor Review — passed; Security Review — passed (Approved with notes; no blocking issues; no Security Review file changes)  
**Summary:** Implemented **backend-only** persistence for the **latest generated plan per study material** in `public.material_generated_plans`. Successful Generate UPSERTs a Zod-validated plan; GET/DELETE expose the saved plan for owned materials. No frontend, document-service, Supabase migration, package-lock, CI, or env changes.  
**Generate contract (unchanged):**
- `POST /api/study-materials/:materialId/generate` — request body **strict `{}`**
- Frontend still does **not** send `studyText`, `content`, `courseId`, `userId`, or `plan`
- Backend loads **saved material content** from DB itself
- Backend calls **document-service once** per Generate
- Backend **re-validates** generated plan with Zod **before** any DB write  
**Persistence behavior:**
- Successful Generate **UPSERT** into `public.material_generated_plans` (`onConflict: study_material_id`)
- `study_material_id` and `course_id` from **owned material row only** — never from client input
- **Failed** Generate attempts are **not** persisted
- **Invalid** generated plans are **not** persisted (`GEMINI_INVALID_RESPONSE` — safe 500, no DB write)
- **Raw Gemini** responses are **not** stored
- **Material content** is **not** duplicated into `material_generated_plans`
- Generate response adds **`savedAt`** (`updated_at` from upsert): `{ materialId, courseId, plan, savedAt }`  
**New APIs:**
- `GET /api/study-materials/:materialId/generated-plan` — `{ materialId, courseId, plan, savedAt }`
- `DELETE /api/study-materials/:materialId/generated-plan` — `{ deleted: true }`  
**Error / ownership:**
- Missing saved plan → neutral **404** “Generated plan not found”
- Wrong-owner or missing material → neutral **404** “Study material not found”
- DB errors → generic `DATABASE_ERROR` (no Supabase internals to client)
- `service_role` remains **backend-only**; app does **not** rely on RLS alone because service_role bypasses RLS
- All generated-plan operations call **`getOwnedMaterialOrThrow`** before service-role table access; SELECT/DELETE filtered by `study_material_id` **and** owned `course_id`  
**Changed backend areas:**
- `backend/src/shared/validation/generated-plan.schema.js` — generated plan Zod schema
- `backend/src/modules/study-materials/study-materials.service.js` — persist / GET / DELETE
- `backend/src/modules/study-materials/study-materials.controller.js` — handlers
- `backend/src/modules/study-materials/study-materials.routes.js` — routes (`generated-plan` before `/:materialId`)
- `backend/tests/helpers/mockSupabaseStudyMaterials.js` — mocked `material_generated_plans` store
- `backend/tests/integration/study-materials-generated-plan.test.js` — GET/DELETE + persistence
- `backend/tests/integration/study-materials-generate.test.js` — `savedAt`, body contract, invalid plan / upsert failure
- `backend/tests/unit/generated-plan.schema.test.js` — schema unit tests
- `backend/tests/unit/study-materials.service.test.js` — generate persists + `savedAt`
- `backend/package.json` — **test script entries only** (no new dependencies)  
**Scope boundary:**
- No `frontend/`, `document-service/`, `supabase/`, `.github/`, `package-lock.json`, CI, `.env` changes
- No client endpoint to save client-supplied plan JSON  
**APIs affected:** `POST .../generate` (adds `savedAt` + UPSERT); `GET .../generated-plan`; `DELETE .../generated-plan`  
**Tests:** Mocked only — no live Gemini, no real Supabase. `cd backend && npm run lint` passed; `npm test` **118/118** passed; `.\scripts\check-all.ps1` passed  
**Pitfalls:** Do not accept plan JSON from client on Generate or any route. Do not skip ownership check before service-role plan table access. Do not log full plans or material content. Do not start 2L-c without explicit approval.  
**Tracked follow-ups:**
- **Phase 2L-c:** frontend generated plan load/clear — **complete** (see 2026-05-23 entry)
- **Phase 2L-d:** docs/smoke alignment — **complete** (see 2026-05-24 entry)
- Optional hardening: re-validate `row.plan` on GET (backend)
- Optional test hardening: `content` in generate body rejection assertion; failed-generate no-persist assertions
- Phase 2K-a live Generate smoke / screenshots `11-`, `15-` — still pending Gemini quota (do not fabricate)
- `study_tasks` / `flashcards` tables — separate future phases

### 2026-05-23 — Phase 2L-c Frontend Generated Plan Load/Clear complete

**Workflow:** `approved — begin Phase 2L-c Frontend Generated Plan Load/Clear planning only`; `approved — implement Phase 2L-c frontend generated plan load and clear`; Supervisor Review + Security Review; `approved — Phase 2L-c complete`  
**Human gates:** Supervisor Review — passed; Security Review — passed (Approved with notes; no blocking issues; no Security Review file changes)  
**Summary:** Frontend-only slice to **load**, **display**, and **clear** the latest persisted generated plan per study material using Phase 2L-b backend APIs. Material detail still generates via `POST .../generate` with strict `{}`; plans rehydrate on page load from GET; Clear calls DELETE. No backend, document-service, Supabase, package-lock, CI, or env changes.  
**Frontend API usage:**
- `GET /api/study-materials/:materialId/generated-plan` — load `plan` + `savedAt` after material loads
- `DELETE /api/study-materials/:materialId/generated-plan` — clear persisted plan
- `POST /api/study-materials/:materialId/generate` — body **`{}` only**; still does **not** send `plan`, `studyText`, `content`, `courseId`, or `userId`  
**Security / UX behavior:**
- **No** direct frontend Supabase writes for `material_generated_plans`
- **No** frontend `service_role`, Gemini key, or document-service calls
- **No** `localStorage` / `sessionStorage` plan persistence
- Missing saved plan (`NOT_FOUND` + “Generated plan not found”) → **empty state** / idempotent clear — not a scary error
- Wrong-owner or missing material → neutral **“Study material not found”** (unchanged)
- Clear plan: backend **DELETE first**, then clear UI state; `Generated plan not found` on DELETE → treat as already cleared
- Failed Clear (non-404): **safe error**, plan stays visible
- Failed Generate: does **not** overwrite existing `plan` / `savedAt`
- Generated plans: **plain React text only**; **no** `dangerouslySetInnerHTML`
- `savedAt` shown as plain text (`toLocaleString()`)
- Tasks/flashcards remain **read-only display** — no task management, flashcard management, Trello, admin/dashboard, upload, or **new routes**  
**Changed frontend areas:**
- `frontend/src/services/study-materials.service.js` — `getGeneratedPlan`, `deleteGeneratedPlan`; `generateMaterial` includes `savedAt`
- `frontend/src/utils/generated-plan-errors.js` — 404 message helpers
- `frontend/src/pages/StudyMaterialDetail.jsx` — load material → load saved plan; generate/clear state flow
- `frontend/src/components/materials/GeneratedPlanSection.jsx` — saved copy, `savedAt`, clearing state
- `frontend/src/styles/components.css` — minor plan panel / `savedAt` / `visually-hidden` utilities
- `frontend/tests/unit/study-materials.service.test.js` — GET/DELETE/savedAt tests
- `frontend/tests/unit/generated-plan-errors.test.js` — helper tests
- `frontend/tests/unit/study-materials-plan-persistence.test.js` — no browser storage / strict generate body
- `frontend/package.json` — **test script entries only**  
**Scope boundary:**
- No `backend/`, `document-service/`, `supabase/`, `docs/IMPLEMENTATION_STATUS.md`, `SECURITY.md`, `DESIGN.md`, `.github/`, CI, `.env` changes in 2L-c  
**APIs affected:** none (frontend consumes existing 2L-b endpoints)  
**Tests:** Mocked `apiFetch` only — no live backend/Gemini. `cd frontend && npm run lint` passed; `npm test` **43/43** passed; `.\scripts\check-all.ps1` passed  
**Pitfalls:** Do not POST client `plan` JSON. Do not clear plan locally without DELETE. Do not use `dangerouslySetInnerHTML` on model fields. Do not start 2L-d without explicit approval.  
**Tracked follow-ups:**
- **Phase 2L-d:** docs/smoke alignment — **complete** (see 2026-05-24 entry)
- Optional: backend distinct error code for missing plan vs missing material
- Optional UX: validate `savedAt` before display
- Optional: component tests if frontend test stack expands (RTL)
- Phase 2K-a live Generate smoke / screenshots `11-`, `15-` — pending quota; refresh may show persisted plan after reload
- `study_tasks` / `flashcards` tables — separate future phases

### 2026-05-24 — Phase 2L-d Docs and Smoke Alignment complete

**Workflow:** `approved — begin Phase 2L-d Docs and Smoke Alignment planning only`; `approved — implement Phase 2L-d docs and smoke alignment`; minor hygiene fixes (`approved — apply Phase 2L-d minor doc hygiene fixes`); Supervisor Review + Security Review; `approved — Phase 2L-d complete`  
**Human gates:** Supervisor Review — passed; Security Review — passed (Approved with notes; minor hygiene applied; no blocking issues)  
**Summary:** **Documentation-only** alignment so governance docs match Phase **2L-a/b/c** generated plan persistence. No backend, frontend, document-service, Supabase migration SQL, package-lock, CI, env, or screenshot PNG changes.  
**Documented persistence model:**
- **One latest validated generated plan per study material** in `public.material_generated_plans` (`plan` jsonb)
- **No** plan history/library, failed-attempt rows, raw Gemini response storage, or duplicated `study_materials.content` in the plan table
- **Generate:** `POST /api/study-materials/:materialId/generate` — body **`{}` strict**; backend Zod validation before UPSERT; frontend must **not** send `plan`, `studyText`, `content`, `courseId`, or `userId`
- **Load:** `GET /api/study-materials/:materialId/generated-plan` — missing plan → **empty state** (not a security error)
- **Clear:** `DELETE /api/study-materials/:materialId/generated-plan` — idempotent when already cleared
- Wrong-owner/missing material → neutral **404** “Study material not found”
- **Frontend:** plain React text only; **no** `dangerouslySetInnerHTML`; **no** `localStorage` / `sessionStorage` for plans; **no** direct Supabase plan writes
- **`service_role`** remains **backend-only**
- Manual smoke checklist added to `docs/IMPLEMENTATION_STATUS.md` (docs reference; **not** live Gemini in CI/tests)  
**Changed docs (2L-d):**
- `docs/IMPLEMENTATION_STATUS.md` — persisted latest plan section, DB table, deferred boundaries, manual smoke, pending `11-`/`15-`
- `SECURITY.md` — AI output persisted model + Security Review bullet update
- `DESIGN.md` — saved-plan copy, §8/§9 rules (no “not saved” / refresh clears / local-only clear)
- `README.md` — current status + what works today
- `docs/PRD.md` — small implementation-status table (not broad PRD rewrite)
- `docs/STITCH_BRIEF.md` — persisted latest plan workflow (light touch)
- `docs/design/SCREENSHOT_INDEX.md` — pending screenshot expectations + 2K-a 429 note
- `docs/database/004-material-generated-plans-schema-and-rls.md` — status **applied manually** (header/clarification only; SQL unchanged)
- `AGENTS.md`, `CLAUDE.md` — tiny alignment (no ephemeral / no DB persistence yet)  
**Minor hygiene fixes (same phase):**
- `IMPLEMENTATION_STATUS.md` — Phase **2I-c** + **2J** styling reflected **complete** (removed “styling pass not started”)
- `SCREENSHOT_INDEX.md` — `DESIGN.md` v2 **complete**; Full Phase 2I **partial** (`11-`/`15-` still pending)
- `PRD.md` — implementation status header points to **`docs/IMPLEMENTATION_STATUS.md`** as latest source of truth (aligned through 2L-d)  
**Scope boundary:**
- No `backend/`, `frontend/`, `document-service/`, `supabase/migrations/`, `.github/`, `package-lock.json`, CI, `.env`, PNG changes in 2L-d  
**APIs affected:** none (docs only)  
**Tests:** Docs-only — no lint/test run required  
**Pitfalls:** Do not imply plan library/history, task/flashcard management, Trello sync, or client plan POST. Do not claim `11-`/`15-` screenshots captured. Do not restart 2L-a/b/c/d without explicit approval.  
**Tracked follow-ups:**
- **Phase 2K:** optional retry / screenshot capture after Gemini quota cooldown (`11-generated-plan-visible.png`, `15-processing-with-ai.png`) — **do not fabricate**
- Any other work → **new branch** + `approved — begin Phase X planning only`
- Optional: backend distinct error code for missing plan vs missing material; optional `savedAt` display guard; optional backend GET re-validation
- `study_tasks` / `flashcards` normalized tables — separate future phases

### 2026-05-25 — Phase 2K-b Generate live smoke and pending screenshots (blocked by Gemini rate limit)

**Workflow:** `approved — begin Phase 2K-b Generate live smoke and pending screenshots planning only`; `approved — run Phase 2K-b Generate live smoke and pending screenshots`; `approved — Phase 2K-b complete as blocked by Gemini rate limit`  
**Summary:** **Live smoke + screenshot attempt only** — **no repository changes** (memory update only). Pre-flight **passed**; **one** Generate click on fake material; processing UI **observed**; **Generate failed** with **Gemini / external API HTTP 429** rate-limit pattern. **No retry loop.** **No code bug suspected.** Persistence success path (refresh reload, Clear plan) **not verified live** because Generate did not complete.  
**Pre-flight (passed):**
- Git working tree **clean**
- `GET http://localhost:3002/health` — document-service **ok**
- `GET http://localhost:3001/health` — backend **ok**
- Frontend **http://localhost:5173/** — loaded
- Demo login — **ok** (`demo.student@example.test` fake account)
- Fake material opened — **Dijkstra Notes** on course **Algorithms 2**; saved placeholder content **>100 characters**  
**Generate session:**
- Material route: `/study-materials/3f364393-5ad0-4136-b34f-a1ed403d7b70`
- **One** click on **Generate study plan** only (no spam)
- Processing UI — **observed** (“Processing with AI…” disabled button + loading copy)
- **Failure:** user-visible paraphrase *“Service temporarily unavailable, please wait 1 minute”* — **Gemini 429 / rate limit** (external quota, not app defect)
- Request contract (code + prior smoke; no tokens logged): `POST /api/study-materials/:materialId/generate` with body **`{}`** strict; frontend does **not** send `studyText`, `content`, `courseId`, `userId`, or `plan`  
**What was not verified (Generate did not succeed):**
- Read-only generated plan display, saved-as-latest disclaimer, `savedAt` / Last saved
- Refresh reloads same plan without regenerating
- Clear plan → DELETE → refresh shows no plan  
**Spot check (no extra Generate):**
- Valid non-existent UUID — neutral **“Study material not found”** (**ok**)  
**Screenshots:**
- `11-generated-plan-visible.png` — **pending** (not captured; do not fabricate)
- `15-processing-with-ai.png` — **pending**; temp browser capture during processing did **not** meet processing-only bar (error overlay likely); **not committed** to `docs/design/screenshots/`  
**Scope boundary (smoke session):**
- No `frontend/`, `backend/`, `document-service/`, `supabase/`, `.github/`, `package.json`, `package-lock.json`, CI, `.env`, `docs/design/SCREENSHOT_INDEX.md`, or committed PNG changes  
**APIs affected:** none (smoke only)  
**Tests / lint / build:** not run (live manual only)  
**Pitfalls:** Do not fabricate `11-` or `15-` PNGs. Do not spam Generate while 429 persists. Do not treat rate limit as a code defect without evidence. Do not claim live persistence smoke passed until Generate succeeds once.  
**Human ops note:** If **Supabase Confirm email** was disabled for demo login, restore it to **ON** after testing.  
**Tracked follow-ups:**
- Retry live Generate + screenshots only after **Gemini quota cooldown/reset** or **quota/model adjustment** — **one** Generate click per attempt; new branch + explicit approval
- `11-generated-plan-visible.png` — **pending** until successful live plan display
- `15-processing-with-ai.png` — **pending** until processing-only frame captured reliably (do not commit mixed error/processing crops)
- After successful smoke + PNG safety review: commit screenshots + update `SCREENSHOT_INDEX.md` under separate approval; then memory alignment if needed
- Persistence, tasks/flashcard management UI, Trello, dashboard/admin, deployment — separate future phases

### 2026-05-23 — Phase 2M Seeded Persisted Plan Smoke complete

**Workflow:** `approved — begin Phase 2M Seeded Persisted Plan Smoke planning only`; `approved — run Phase 2M seeded persisted plan smoke`; `approved — Phase 2M complete`  
**Summary:** **Manual smoke only** — validated **generated-plan persistence without Gemini**. One fake row seeded into `public.material_generated_plans`; UI exercised load → refresh → Clear → refresh. **Passed.** **No repository file changes** during smoke (memory update only). **No Generate click.** **No** official screenshots captured.  
**Purpose:** Close the persistence validation gap left by **2K-a/2K-b** (Gemini HTTP 429) without calling live Generate or document-service `/process`.  
**Pre-flight (passed):**
- Git working tree **clean**
- `GET http://localhost:3001/health` — backend **ok**
- Frontend **http://localhost:5173/** — loaded
- Demo login — **ok** (`demo.student@example.test` fake account)  
**Fake demo data only:**
- Demo-owned course **Algorithms 2**
- Fake material **Dijkstra Notes** — placeholder content **>100 characters** (saved)  
**Seed:**
- **One** fake generated plan row upserted into `public.material_generated_plans` (smoke-only JSON; planning-template shape)
- Equivalent to approved SQL Editor template — **no seed SQL committed to repo**  
**Smoke (passed):**
- `GET /api/study-materials/:materialId/generated-plan` — saved plan loaded on material detail
- Plan card displayed; **saved-as-latest** disclaimer; **Last saved** timestamp
- Plan content rendered as **plain React text** (summary, topics, difficulty, tasks, flashcards)
- Hard refresh — same saved plan reloaded **without Generate**
- **Clear plan** — frontend → `DELETE /api/study-materials/:materialId/generated-plan`; plan section disappeared
- Hard refresh after Clear — **no** saved-plan section
- DB row cleanup confirmed via **UI Clear** path (row removed)
- Invalid material UUID — neutral **“Study material not found”**  
**Not in scope / unchanged:**
- **No** `POST …/generate`; **no** Gemini; **no** document-service `/process`
- **No** code, package, CI, env, doc, or screenshot file changes during smoke
- **No** commit or push during smoke  
**Screenshots:**
- `11-generated-plan-visible.png` — **pending** (official capture still requires **real** live Generate success later)
- `15-processing-with-ai.png` — **pending** (do not fabricate)  
**Security notes:**
- Seeded plan was **fake smoke-only** data
- **No** `service_role`, JWTs, API keys, `.env` values, tokens, or real study data exposed in reports
- **No** Supabase dashboard screenshots or secrets committed
- Seeded smoke **does not** replace live Gemini smoke or official screenshot capture
- Future live Generate retry remains **gated** and **one-click only** (Gemini Free Tier 429 history in 2K-a/2K-b)  
**Scope boundary:**
- No `frontend/`, `backend/`, `document-service/`, `supabase/migrations/`, `.github/`, `package.json`, `package-lock.json`, CI, `.env`, PNG, or other doc changes in 2M smoke session  
**APIs affected:** none (smoke only; exercised existing GET/DELETE)  
**Tests / lint / build:** not run (live manual only)  
**Pitfalls:** Do not treat 2M as proof of end-to-end Generate. Do not fabricate `11-`/`15-` PNGs from seeded data. Do not restart **2L-a/b/c/d** or **2M** without explicit approval. Do not spam Generate on 429.  
**Human ops note:** If **Supabase Confirm email** was disabled for demo login, restore it to **ON** after testing.  
**Tracked follow-ups:**
- **Phase 2K:** optional retry / official screenshots after Gemini quota cooldown — **one** Generate click per session; **do not fabricate**
- Any other work → **new branch** + `approved — begin Phase X planning only`
- `study_tasks` / `flashcards` normalized tables — separate future phases

### 2026-05-23 — Phase 2O-b Gemini model env configuration complete

**Workflow:** `approved — begin Phase 2O External AI API Live Success planning only`; `approved — implement Phase 2O-b Gemini model env configuration`; Supervisor Review + Security Review; `approved — Phase 2O-b complete`  
**Human gates:** Supervisor Review — passed; Security Review — **Approved with notes** (no blocking issues; no Security Review file changes)  
**Summary:** **document-service code + tests + minimal README** — configurable Gemini model via env so live demo can try a lighter model without another code change. Removed forced hardcoded **`gemini-2.0-flash`**. **`GEMINI_API_KEY`** remains required and server-side only. **No live Gemini** call during implementation or tests.  
**Configuration:**
- **`GEMINI_MODEL`** — optional Zod env; default **`gemini-2.5-flash-lite`**
- Explicit override supported (e.g. **`gemini-2.5-flash`**)
- **`generateStudyPlan()`** passes configured model to `callGeminiApi`
- Unchanged: `responseMimeType: application/json`, `temperature: 0.2`, prompt shape, **no retries**, **no provider fallback**  
**Changed files:**
- `document-service/src/config/env.js` — `DEFAULT_GEMINI_MODEL`, `GEMINI_MODEL`, `resetEnvForTests()`
- `document-service/src/services/gemini.service.js` — env-driven model
- `document-service/.env.example` — `GEMINI_MODEL` name/default example only
- `document-service/tests/unit/env.test.js` — default + explicit model tests
- `document-service/tests/unit/gemini.service.test.js` — `generateStudyPlan` URL model tests (mocked fetch)
- `README.md` — env table documents `GEMINI_MODEL` name/default only (no secrets)  
**Scope boundary:**
- **Changed in 2O-b:** `document-service/` (env + Gemini service + unit tests), `document-service/.env.example`, `README.md` env table line only — see **Changed files** above
- **Not changed:** `frontend/`, `backend/`, `supabase/`, `.github/`, `package.json`, `package-lock.json`, CI, real `.env`
- **`AGENT_MEMORY.md`:** updated on `approved — Phase 2O-b complete` only; no additional code changes during that memory update  
**APIs affected:** none (config only; `POST /process` behavior unchanged except model ID in upstream Gemini URL)  
**Tests / lint / build:**
- `cd document-service && npm run lint` — passed
- `cd document-service && npm test` — **31/31** passed (mocked fetch/local only)
- `.\scripts\check-all.ps1` — passed  
**Security notes:**
- `GEMINI_API_KEY` not printed or exposed; tests use fake keys only
- Frontend/backend still have no access to `GEMINI_MODEL` or `GEMINI_API_KEY`
- Generated AI output still validated with existing Zod schemas before success/persistence  
**Pitfalls:** Do not assume env change alone guarantees live success (429 may persist). Do not spam Generate. Do not restart **2O-b** without explicit approval. Human must restart document-service after local `.env` model change.  
**Tracked follow-ups:**
- Human local **document-service** `.env` (not committed): `GEMINI_MODEL=gemini-2.5-flash-lite` or fallback `GEMINI_MODEL=gemini-2.5-flash`; restart service
- **Next gated step:** `approved — run Phase 2O live external AI Generate smoke` — **one** Generate click only; AI Studio quota check first
- If **429** persists, stop; consider separate fallback-provider planning phase (Groq/OpenRouter/etc.)
- Optional hardening (non-blocking): stricter `GEMINI_MODEL` validation; `resetEnvForTests` test-only guard
- Official screenshots **`11-`**, **`15-`** still **pending** until real live Generate succeeds

### 2026-05-23 — Phase 2O-c Gemini Prompt/Schema Contract Hardening complete

**Workflow:** `approved — begin Phase 2O-c Gemini prompt/schema contract hardening planning only`; `approved — implement Phase 2O-c Gemini prompt/schema contract hardening`; Supervisor Review + Security Review; `approved — Phase 2O-c complete`  
**Human gates:** Supervisor Review — passed; Security Review — **Approved with notes** (no blocking issues; no Security Review file changes)  
**Summary:** **document-service prompt hardening only** — strengthened `buildGeminiPrompt()` so Gemini output is more likely to satisfy the existing **`GeminiOutputSchema`** after Phase 2O live smoke reached Gemini (**HTTP 200**) but document-service rejected output because **`flashcards.0.answer`** was shorter than the Zod minimum (`gemini_schema_validation_failed`). **Not** a **429** quota failure. **Not** a backend persistence failure. **Not** a frontend failure. **`GeminiOutputSchema` not loosened.** Backend **`generated-plan.schema.js` not loosened.** **No live Gemini** call during implementation or tests.  
**Unchanged behavior:**
- `responseMimeType: application/json`, `temperature: 0.2`, **30s** timeout, model/env via **`GEMINI_MODEL`**
- **No retries**, **no provider fallback**, **no parsing/repair heuristics** added
- Zod validation remains before success/persistence; logging remains redacted (`zodPaths`, no raw response/prompt/study text)  
**Changed files:**
- `document-service/src/services/gemini.service.js` — `buildGeminiPrompt()` schema contract (JSON-only, field mins/maxes, enums, flashcard answer expansion rule; example template aligned to mins)
- `document-service/tests/unit/gemini.service.test.js` — `buildGeminiPrompt` contract tests (mocked/local)
- `document-service/tests/unit/gemini.schema.test.js` — rejects `flashcards[0].answer` shorter than 10 characters  
**Scope boundary:**
- **Changed in 2O-c:** `document-service/` prompt + unit tests only — see **Changed files** above
- **Not changed:** `GeminiOutputSchema`, `env.js`, `.env.example`, `frontend/`, `backend/`, `supabase/`, `.github/`, `package.json`, `package-lock.json`, CI, real `.env`, README, other docs (except this memory entry)  
**APIs affected:** none (`POST /process` contract unchanged; upstream prompt text only)  
**Tests / lint / build:**
- `cd document-service && npm run lint` — passed
- `cd document-service && npm test` — **43/43** passed (mocked/local only)
- `.\scripts\check-all.ps1` — passed  
**Security notes:** Tests use fake keys and placeholder study text only; no secrets logged; AI output still untrusted until Zod passes.  
**Pitfalls:** Do not assume prompt hardening guarantees live success (model may still miss mins). Do not spam Generate. **Restart document-service** before next live smoke so new prompt is loaded. Do not restart **2O-c** without explicit approval. On live failure, inspect only safe **`zodPaths`** / error codes — not raw Gemini response.  
**Tracked follow-ups:**
- **Live smoke:** completed — see **`### 2026-05-23 — Phase 2O-c live external AI Generate smoke complete`** below
- Optional future hardening (non-blocking): align **`keyTopics`** non-empty Zod rule with prompt; consider document-service schema **`.strict()`** alignment with backend in a separate phase

### 2026-05-23 — Phase 2O-c live external AI Generate smoke complete

**Workflow:** `approved — run Phase 2O-c live external AI Generate smoke`; `approved — Phase 2O-c live smoke complete`  
**Summary:** **Live smoke only** — **passed**. **One** Generate click only (**no retry loop**). Confirms **live external AI API success** for StudyOps AI material-scoped Generate after **2O-c prompt/schema contract hardening**. Prior pre-2O-c failure class (**`flashcards.0.answer` too short** / `gemini_schema_validation_failed`) **did not recur** on this run. **Not** **429** quota. **Not** `GEMINI_INVALID_RESPONSE`. **Not** backend persistence failure. **Not** frontend failure. **No repository file changes** during smoke (memory update only). **No live Gemini** in tests/CI. **No official screenshots** captured yet.  
**Model:** **`gemini-2.5-flash-lite`** (name only; no key or `.env` values recorded)  
**Pipeline (this run):**
- Gemini **HTTP 200**; document-service **Zod validation passed**
- Backend **persisted** generated plan (UPSERT)
- Frontend displayed **saved generated plan** (read-only plain text)
- Hard **refresh** reloaded same plan **without** another Generate click
- **Clear plan** **not** clicked — saved plan remains for possible screenshot capture  
**Safe smoke details:**
- Backend health **passed**; document-service health **passed**; frontend **loaded**
- Demo/fake user session; fake course/material (**Dijkstra Notes**)
- Short fake material content saved (~192 chars, over app minimum)
- **Processing with AI…** observed during generate
- **Saved-as-latest** disclaimer visible; **Last saved** timestamp visible
- Plan sections visible: summary, key topics, difficulty, tasks, flashcards  
**Safe log metadata (no secrets, no raw response/prompt/material):**
- document-service: `gemini_success`, `httpStatus: 200`, `studyTextLength: 192`, `durationMs: ~3497`
- backend: `document_service_success`, `httpStatus: 200`, `contentLength: 192`, `durationMs: ~3520`  
**Scope boundary:**
- **No** code, package, CI, `.env`, PNG, or other doc changes in smoke session (except this memory entry)  
**APIs exercised:** `POST /api/study-materials/:materialId/generate` (body `{}`); document-service `POST /process`; `GET` generated-plan on refresh — live only, not CI  
**Tests / lint / build:** not run (live manual smoke only)  
**Pitfalls:** Do not spam Generate on quota cooldown. Do not fabricate **`11-`** / **`15-`** PNGs. Do not **Clear plan** before screenshot decision. Do not log raw Gemini output. Do not restart **2O-c live smoke** without explicit approval.  
**Tracked follow-ups:**
- **`11-generated-plan-visible.png`:** captured in Phase 2K-c — see below
- **`15-processing-with-ai.png`** still **pending** unless captured during a future approved live Generate attempt
- Screenshot rules: fake data only; no DevTools, tokens, `.env`, terminal, or secrets in frame
- Optional: `approved — Phase 2O complete` memory consolidation if Supervisor wants one umbrella entry for 2O-b + 2O-c + live smoke
- Fallback-provider planning remains **deferred** unless new failures appear

### 2026-05-23 — Phase 2K-c generated plan screenshot captured

**Workflow:** `approved — begin Phase 2K-c generated plan screenshot capture planning only`; `approved — capture Phase 2K-c generated plan screenshot 11-generated-plan-visible.png`; `approved — Phase 2K-c complete`  
**Summary:** **Screenshot capture only** — **`docs/design/screenshots/11-generated-plan-visible.png`** captured successfully from the **already-saved** generated plan created during **Phase 2O-c live external AI Generate smoke**. **No** additional **Generate** click. **No** live Gemini call. **Clear plan** **not** clicked — saved plan **remained in DB**. Post-capture safety review: **no** DevTools, terminal, `.env`, tokens, API keys, JWTs, Supabase dashboard, or real personal data visible in crop.  
**Screenshot content (visible in frame):**
- **Generated study plan** card with **saved-as-latest** disclaimer and **Last saved** timestamp
- Read-only **Summary**, **Key topics**, **Difficulty**, start of **Tasks** (flashcards below fold in crop)
- Fake demo material **Dijkstra Notes**; **Generate study plan** section above plan for context  
**Changed files:**
- `docs/design/screenshots/11-generated-plan-visible.png` — **added**
- `docs/design/SCREENSHOT_INDEX.md` — `11-` marked **captured**; captured count **14** PNGs; `15-processing-with-ai.png` **pending**
- `docs/AGENT_MEMORY.md` — this entry only (on `approved — Phase 2K-c complete`)  
**Scope boundary:**
- **Not changed:** `frontend/`, `backend/`, `document-service/`, `supabase/`, `package.json`, `package-lock.json`, `.github/`, CI, `.env`, `.env.example`, code  
**APIs affected:** none (UI screenshot only; plan loaded via existing `GET .../generated-plan`)  
**Tests / lint / build:** not run (manual capture only)  
**Pitfalls:** Do not fabricate **`15-processing-with-ai.png`**. Do not **Clear plan** until **`15-`** / demo screenshot decision is complete. Do not restart **2K-c** capture without explicit approval.  
**Tracked follow-ups:**
- **`15-processing-with-ai.png`** — **pending**; requires future **separately approved** live Generate attempt (processing frame only); **do not fabricate**
- Optional: commit PNG + `SCREENSHOT_INDEX.md` when human approves
- Any other work → **new branch** + `approved — begin Phase X planning only`

### 2026-05-23 — Phase 3A-a study_tasks schema and RLS complete

**Workflow:** Phase 3A-a study_tasks schema and RLS
**ADR refs:** 001, 003
**Human gates:** `approved — implement Phase 3A-a study_tasks schema and RLS`; Supervisor Review + Security Review (APPROVE WITH NOTES / PASS WITH NOTES); human manual apply on Supabase (**Success. No rows returned.**); catalog + behavioral verification; `approved — finalize Phase 3A-a study_tasks schema and RLS docs/memory only`
**Summary:** Added **`public.study_tasks`** — database foundation for **manual** study tasks (product useful without Gemini). SQL migration + database doc only; table **applied and verified** on Supabase. **No** backend API, frontend UI, document-service, Gemini, Trello, focus, or dashboard work.
**Artifacts:**
- `supabase/migrations/005_study_tasks.sql` (applied manually — do not re-run)
- `docs/database/005-study-tasks-schema-and-rls.md` — status updated to applied/verified
**Model:**
- `user_id` + `course_id` + optional `material_id` (SET NULL on material delete)
- `status` `pending` \| `completed`; `source` `manual` only in 3A-a CHECK
- `difficulty` default `medium`, `tags` default `{}` — **stored** for PRD/future import; **not editable** in Phase 3A-b/c/d (Supervisor rule)
**RLS and grants (verified):**
- RLS **enabled**; policies `study_tasks_select_own`, `study_tasks_insert_own`, `study_tasks_update_own`, `study_tasks_delete_own` (`user_id = auth.uid()` + course/material alignment on write)
- **`anon`:** no grants; **`authenticated`** and **`service_role`:** SELECT, INSERT, UPDATE, DELETE only
**Integrity triggers (verified):** `enforce_study_task_user_course_owner`, `enforce_study_task_course_material_match`, `set_study_tasks_updated_at`
**Scope boundary:** No `backend/`, `frontend/`, `document-service/`, `.github/`, `package.json`, CI, or `.env` changes in 3A-a finalize (docs/memory only).
**APIs affected:** none
**Tests:** SQL/manual DB verification only (catalog queries + behavioral constraint/trigger probes); no `npm test` / lint / `check-all`
**Pitfalls:**
- Phase **3A-b** service-role queries **must** filter by `user_id` (RLS bypassed); wrong-owner → neutral **404**
- Do **not** accept `difficulty` or `tags` on create/PATCH in 3A-b/c/d without separate product approval
- Do **not** mix with Trello, Gemini, focus, dashboard, or `material_generated_plans` behavior changes in 3A slices
- Do **not** re-apply `005_study_tasks.sql` on environments where the table already exists
**Follow-up:** Phase **3A-b** backend API (`GET/PATCH/complete`, course-scoped create) requires **separate approval** and **Security Review**; Phase 3A-c/d frontend deferred

### 2026-05-23 — Phase 3A-b Study Tasks Backend API complete

**Workflow:** Phase 3A-b backend API
**ADR refs:** 001, 003
**Human gates:** `approved — implement Phase 3A-b study_tasks backend API`; Supervisor Review (Approved with notes); Security Review (Pass with notes); `approved — finalize Phase 3A-b backend API docs/memory only`
**Summary:** Backend task API implemented for manual **`study_tasks`** — course-scoped list/create routes plus global list, PATCH, complete, and DELETE. **Backend only**; **no** frontend task UI, document-service, Supabase migration, or Gemini/Trello/focus/dashboard work in this slice.
**APIs affected:**
- `GET /api/courses/:id/tasks` — list tasks for owned course (`?status` optional)
- `POST /api/courses/:id/tasks` — create manual task (server sets `user_id`, `course_id`, `difficulty=medium`, `tags=[]`, `source=manual`, `status=pending`)
- `GET /api/tasks` — list caller’s tasks (`?courseId`, `?status` optional)
- `PATCH /api/tasks/:taskId` — update title, description, priority, estimatedMinutes, materialId only
- `POST /api/tasks/:taskId/complete` — mark completed (body `{}` strict; idempotent)
- `DELETE /api/tasks/:taskId` — delete owned task
**Not implemented (intentional):** `GET /api/tasks/:id` (PRD) — deferred to a future slice if needed
**Tests:** Backend `npm run lint` passed; backend `npm test` **147/147** (mocked Supabase)
**Security:**
- All routes **`requireAuth`**
- Every `study_tasks` service-role query filters by **`user_id = req.user.id`**
- `user_id` set from **`req.user.id` only** — never from request body
- **`getOwnedMaterialOrThrow` not used** in task routes (it selects `content`)
- Task-specific **`assertMaterialBelongsToOwnedCourse`** uses minimal select (`id`, `course_id`, `courses!inner(id)`) only
- **No** `study_materials.content` or **`material_generated_plans.plan`** selected or returned from task routes
- Wrong-owner or missing task/course/material → neutral **404** (“Task not found”, “Course not found”, “Study material not found”)
**Pitfalls:**
- Task API exists, but **frontend task UI does not** — UI must call backend with Bearer JWT only
- **`difficulty`** / **`tags`** are returned with defaults but **not client-editable** (create/PATCH reject them)
- **`status`** changes only via **`POST …/complete`** — not PATCHable
- **No** Trello, focus, flashcards table/UI, dashboard/admin, Gemini, or AI plan import into `study_tasks` in 3A-b
**Follow-up:**
- Phase **3A-c** frontend course-level tasks UI requires **separate** planning/approval
- Phase **3A-d** global `/tasks` UI requires **separate** planning/approval
- PRD **`GET /api/tasks/:id`** remains **intentionally deferred**

### 2026-05-26 — Phase 3A-b.1 docs alignment complete

**Workflow:** Phase 3A-b.1 workspace + documentation alignment (docs-only)
**ADR refs:** none (documentation only)
**Human gates:** `approved — implement Phase 3A-b.1`; `approved — Phase 3A-b.1 complete` — satisfied
**Summary:** Aligned entry-point documentation with verified built state through **Phase 3A-b**. Updated `docs/PRD.md` implementation status (through **3A-b**; `study_tasks` table + manual backend API documented; **`flashcards`** and task UI still deferred), `README.md` (3A-a/b status + backend-only tasks bullet), `AGENTS.md` (clarifies backend API exists; normalized task UI and plan import still deferred), and `docs/workflows/document-processing-workflow.md` (`study_tasks` table/API marked done; plan → `study_tasks` import deferred). **No** application code, config, CI, env, or Supabase migration files changed.
**APIs affected:** none
**Tests:** none (docs-only phase)
**Pitfalls:** Do not treat doc updates as task UI or plan-import scope. **`IMPLEMENTATION_STATUS.md`** was already aligned at 3A-b — not modified in this slice.
**Follow-up:** Phase **3A-c** course-level tasks UI or **3A-d** global `/tasks` UI — separate planning/approval; task **UI** and generated-plan → **`study_tasks`** import remain **deferred**

### 2026-05-26 — Phase 3A-c course-level manual tasks UI complete

**Workflow:** Phase 3A-c course-level manual tasks UI (MVP)
**ADR refs:** 001 (frontend → backend REST), 003 (client Zod mirrors backend create limits)
**Human gates:** `approved — begin Phase 3A-c planning only`; `approved — implement Phase 3A-c`; Supervisor Review (approved); Security Review (pass, no blockers); `approved — Phase 3A-c complete` — satisfied
**Summary:** Frontend-only MVP on **`/courses/:id`**: **`CourseTasksSection`** + **`TaskCard`** + **`tasks.service.js`** — list course tasks, create manual task, mark complete (`POST …/complete` with `{}`), delete; loading/empty/error states; create-form Zod validation. Uses **`GET/POST /api/courses/:id/tasks`**, **`POST /api/tasks/:taskId/complete`**, **`DELETE /api/tasks/:taskId`** only — **no** `PATCH`, **no** `GET /api/tasks`, **no** `materialId` in create body. Plain React text for title/description. **`frontend/package.json`** `test` script updated to include new unit test files (no dependency changes).
**APIs affected (frontend client only):** course task list/create; task complete; task delete — backend unchanged
**Tests:** Frontend `npm run lint` passed (1 pre-existing warning in `AuthContext.jsx`); `npm test` **54/54**; `npm run build` passed. Backend tests not re-run (backend untouched).
**Security:** Bearer JWT via existing auth flow; no service role; no direct Supabase task writes; neutral **404** copy; Security Review — no blockers.
**Not implemented (intentional):** Edit task; status filters; `materialId` linking; mark incomplete; global `/tasks` (3A-d); generated-plan import; flashcards/Trello/dashboard/admin.
**Pitfalls:** Do not add checkboxes to **generated plan** task lines (`GeneratedPlanSection`). Do not call `PATCH` or send `materialId` without a new approved phase. **`PATCH`** on backend exists but has no UI.
**Follow-up:** Phase **3A-d** global `/tasks` UI — separate planning/approval; optional **PRD/README** alignment to mention 3A-c by name; task edit/filters/import remain **deferred**

### 2026-05-26 — Phase 3A-c.1 pending-task edit UI complete

**Workflow:** Phase 3A-c.1 course task polish (frontend-only)
**ADR refs:** 001 (frontend → backend REST), 003 (client Zod mirrors backend PATCH limits for exposed fields)
**Human gates:** `approved — begin Phase 3A-c.1 planning only`; `approved — implement Phase 3A-c.1`; Supervisor Review (approved with notes, no blockers); Security Review (pass, no blockers); `approved — Phase 3A-c.1 complete` — satisfied
**Summary:** Frontend-only edit for **pending** manual tasks on **`/courses/:id`**: **Edit** on `TaskCard`, inline form in `CourseTasksSection`, **`updateTask`** → **`PATCH /api/tasks/:taskId`** with `title`, `estimatedMinutes`, `description`, `priority` only. Completed tasks have **no** Edit (delete still allowed). **No** status filters, `materialId`, mark incomplete, global `/tasks`, or plan import.
**APIs affected (frontend client only):** `PATCH /api/tasks/:taskId` — backend unchanged
**Tests:** Frontend `npm run lint` passed (1 pre-existing warning in `AuthContext.jsx`); `npm test` **58/58**; `npm run build` passed. Backend tests not re-run (backend untouched).
**Security:** Bearer JWT; no service role; no direct Supabase task writes; strict PATCH body; neutral **404** copy; Security Review — no blockers.
**Not implemented (intentional):** Status filters; `materialId` linking; edit completed tasks; mark incomplete; global `/tasks` (3A-d); generated-plan → `study_tasks` import; flashcards/Trello/dashboard/admin.
**Pitfalls:** Do not send `status`, `materialId`, `difficulty`, or `tags` in PATCH from UI. Do not add checkboxes to **generated plan** task lines.
**Follow-up:** Phase **3A-d** global `/tasks` UI or `materialId` linking — separate planning/approval

### 2026-05-26 — Phase 3A-c.2 course task status filters complete

**Workflow:** Phase 3A-c.2 course task status filters (frontend-only)
**ADR refs:** 001 (frontend → backend REST read-only GET)
**Human gates:** `approved — begin Phase 3A-c.2 planning only`; `approved — implement Phase 3A-c.2`; Supervisor Review (approved, no issues); Security Review (no blockers); `approved — Phase 3A-c.2 complete` — satisfied
**Summary:** Frontend-only **All / Pending / Completed** filter bar on **`/courses/:id`** using existing backend `?status=` query support. `statusFilter` state drives `loadTasks`; switching filter cancels open edit, closes create form, refetches list. Create form/button visible on **All** only. Per-filter empty states (no misleading create CTA on Pending/Completed). Filter values allowlisted (`'pending' | 'completed' | undefined`) before URL construction — no user-controlled string concatenation. Filter is **in-memory only** (not URL-persisted).
**APIs affected (frontend client only):** `GET /api/courses/:courseId/tasks[?status=pending|completed]` — backend unchanged
**Tests:** Frontend `npm run lint` passed (1 pre-existing warning in `AuthContext.jsx`); `npm test` **61/61**; `npm run build` passed. Backend tests not re-run (backend untouched).
**Security:** GET-only; closed enum allowlist; ownership enforced server-side; no write path; Security Review — no blockers.
**Not implemented (intentional):** URL-persisted filters; `materialId` linking; mark incomplete; global `/tasks` (3A-d); generated-plan import; flashcards/Trello/dashboard/admin.
**Pitfalls:** Filter state is component-local — resets on unmount. Do not pass arbitrary strings to `listCourseTasks` `status` param.
**Follow-up:** Phase **3A-d** global `/tasks` UI or material navigation/filtering — separate planning/approval

### 2026-05-26 — Phase 3A-c.3 task ↔ study material linking complete

**Workflow:** Phase 3A-c.3 course task material linking (frontend-only)
**ADR refs:** 001 (frontend → backend REST), 003 (client Zod for `materialId` UUID / null)
**Human gates:** `approved — begin Phase 3A-c.3 planning only`; `approved — implement Phase 3A-c.3`; Supervisor Review (approved with notes, no blockers); Security Review (no blockers); `approved — Phase 3A-c.3 complete` — satisfied
**Summary:** Frontend-only optional **`materialId`** linking for manual course tasks on **`/courses/:id`**. Create: optional **Link to material** dropdown — no selection omits `materialId` from POST; selection sends UUID. Edit: dropdown link or **None** → `materialId: null` unlink via PATCH. **`TaskCard`** shows linked material title or neutral **unavailable** label. **`CourseDetail`** passes existing loaded **`materials`** into **`CourseTasksSection`** — **no** new materials API call in tasks section. Uses existing backend **`POST /api/courses/:id/tasks`** and **`PATCH /api/tasks/:taskId`** `materialId` support (3A-b).
**APIs affected (frontend client only):** create/update task bodies may include `materialId` — backend unchanged
**Tests:** Frontend `npm run lint` passed (1 pre-existing warning in `AuthContext.jsx`); `npm test` **68/68**; `npm run build` passed. Backend tests not re-run (backend untouched).
**Security:** Bearer JWT; no service role; no direct Supabase writes; strict Zod; material IDs from course dropdown only (UUID validated); Security Review — no blockers.
**Reviews:** Supervisor — approved with notes (minor NOT_FOUND copy). Security — no blockers.
**Not implemented (intentional):** Material navigation links; filter tasks by `materialId`; generated-plan → `study_tasks` import; global `/tasks` (3A-d); mark incomplete; URL-persisted filters; flashcards/Trello/dashboard/admin.
**Pitfalls:** Do not add materials fetch inside `CourseTasksSection`. Do not send `status`, `courseId`, or `userId` in task bodies. Orphan `materialId` on tasks shows unavailable — do not probe other users’ materials.
**Follow-up:** Optional UX — map `NOT_FOUND` “Study material not found” separately from course/task not found (non-blocking). Phase **3A-d** global `/tasks` UI — separate planning/approval.

### 2026-05-26 — Phase 3A-d global /tasks page complete

**Workflow:** Phase 3A-d global study tasks UI (frontend-only)
**ADR refs:** 001 (frontend → backend REST), 003 (client Zod for edit PATCH; allowlisted `GET /api/tasks` query params)
**Human gates:** `approved — begin Phase 3A-d planning only`; `approved — implement Phase 3A-d`; Supervisor Review (approved with notes, no blockers); Security Review (no blockers); `approved — Phase 3A-d complete` — satisfied
**Summary:** Frontend-only protected **`/tasks`** page — **`TasksPage`** + **`GlobalTasksSection`** + **`listAllTasks()`** using existing **`GET /api/tasks`** (`courseId`, `status` optional). **Course filter** (All + owned courses from `listCourses()`); **status filter** (All/Pending/Completed); in-memory only. **Pending:** edit (`PATCH` + `updateTaskFormSchema`, incl. `materialId` link/unlink), complete, delete. **Completed:** no edit; delete allowed. **`listMaterials(task.courseId)`** lazy on edit open only. **`TaskCard`** course link to `/courses/:id` only — no material links. **No create** on `/tasks`. Empty state → `/courses`. Nav from Dashboard and Courses list.
**APIs affected (frontend client only):** `GET /api/tasks[?courseId&status]`; existing PATCH/complete/DELETE — backend unchanged
**Tests:** Frontend `npm run lint` passed (1 pre-existing warning in `AuthContext.jsx`); `npm test` **72/72**; `npm run build` passed. Backend tests not re-run (backend untouched).
**Security:** ProtectedRoute; Bearer JWT; allowlisted query params; strict PATCH body; Security Review — no blockers.
**Reviews:** Supervisor — approved with notes. Security — no blockers.
**Not implemented (intentional):** Create on `/tasks`; `GET /api/tasks/:id`; Start Focus; generated-plan import; mark incomplete; material filter/nav links; URL-persisted filters; flashcards/Trello/dashboard/admin.
**Known limitations:** Material titles on list cards often **unavailable** until edit loads materials; `/tasks` task section gated on successful `listCourses()`.
**Pitfalls:** Do not pass arbitrary `courseId`/`status` strings to `listAllTasks`. Do not fetch materials for every course on page load. (Create on `/tasks` shipped in **3A-e** — see below.)
**Follow-up:** Trello, focus, flashcards table/UI, dashboard analytics — separate approval. (Plan → task import shipped in **3A-f**.)

### 2026-05-26 — Phase 3A-e create task on global /tasks complete

**Workflow:** Phase 3A-e global create-task UI (frontend-only)
**ADR refs:** 001 (frontend → backend REST), 003 (client `createTaskFormSchema` before POST; allowlisted create body)
**Human gates:** `approved — begin Phase 3A-e planning only`; `approved — implement Phase 3A-e`; Supervisor Review (approved with notes); Security Review (no blockers); `approved — Phase 3A-e complete` — satisfied
**Summary:** Frontend-only **create** on protected **`/tasks`** — **`GlobalTasksSection.jsx` only** (implementation). Inline form: required **course** from owned `courses` prop; **title**, **estimated minutes**, **priority**; optional **description**; optional **material** via **`listMaterials(createCourseId)`** after valid course selected (not preloaded for all courses). **`createCourseTask(createCourseId, body)`** → **`POST /api/courses/:courseId/tasks`**; **`createTaskFormSchema`**. **None** omits `materialId`. After success: close/reset form, refetch list, set **course filter** to created course. **Add study task** hidden when no courses, **Completed** filter, or list loading/error. Create/edit mutual exclusion; filter change closes create and edit.
**APIs affected (frontend client only):** `POST /api/courses/:courseId/tasks`; `GET /api/courses/:id/materials` on create (lazy) — backend unchanged
**Tests:** Frontend `npm run lint` passed (1 pre-existing warning in `AuthContext.jsx`); `npm test` **72/72**; `npm run build` passed. No new unit tests (services/validation untouched). Backend tests not re-run (backend untouched).
**Security:** Bearer JWT via existing services; `createCourseId` from `courses` prop + `courses.some(...)`; `materialId` from `listMaterials` dropdown only; strict Zod + allowlisted POST body; no direct Supabase writes; Security Review — no blockers.
**Reviews:** Supervisor — approved with notes. Security — no blockers.
**Not implemented (intentional):** `GET /api/tasks/:id`; Start Focus; generated-plan import; mark incomplete; material filter/nav links; URL-persisted filters; flashcards/Trello/dashboard/admin.
**Known limitations / minor notes:** Possible double refetch after create; brief loading flash; create `NOT_FOUND` may show “Course not found” for material mismatch (UX only); material titles on list often unavailable until edit; `/tasks` gated on `listCourses()`.
**Pitfalls:** Do not send `courseId`/`userId`/`status` in create body. Do not preload materials for all courses. Do not add free-text course/material IDs.
**Follow-up:** Trello, focus, flashcards table/UI, dashboard analytics — separate approval. (Plan import: **3A-f**.)

### 2026-05-26 — Phase 3A-f generated plan → study_tasks import complete

**Workflow:** Phase 3A-f plan → task import (frontend-only)
**ADR refs:** 001 (frontend → backend REST only), 003 (`createTaskFormSchema` on every mapped body before POST)
**Human gates:** `approved — begin Phase 3A-f planning only`; `approved — implement Phase 3A-f`; Supervisor Review (approved with notes); Security Review (no blockers); `approved — Phase 3A-f complete` — satisfied
**Summary:** On **`/study-materials/:materialId`**, **Import tasks to course** converts visible **`plan.tasks[]`** into **`study_tasks`** via sequential **`createCourseTask(material.courseId, body)`** → **`POST /api/courses/:courseId/tasks`**. **`plan-import.js`**: map allowlisted fields; validate all with **`createTaskFormSchema`** before any POST (invalid → zero creates); stop on first POST failure. **`materialId`** from route; **`courseId`** path only. Confirm: re-import may duplicate. Plan **not** cleared after import. Hidden when unsaved edits / generating / clearing / importing.
**Files:** `plan-import.js`, `plan-import.test.js`, `StudyMaterialDetail.jsx`, `GeneratedPlanSection.jsx`; **`package.json`** — `npm test` file list only (+`plan-import.test.js`; no deps/lockfile change).
**Tests:** Lint passed (1 pre-existing `AuthContext.jsx` warning); `npm test` **80/80**; build passed. Backend tests not re-run.
**Security:** Untrusted plan tasks re-validated client-side; strict POST allowlist; no Supabase/Gemini on import; Security Review — no blockers.
**Reviews:** Supervisor — approved with notes. Security — no blockers.
**Not implemented (intentional):** Backend batch import; `source='plan'`; flashcard import; dedupe system; atomic batch; Trello/focus/dashboard/admin.
**Known limitations:** Rows look like manual tasks; partial import possible; duplicate risk on re-import.
**Pitfalls:** Do not spread raw `planTask` into POST body. Do not skip validate-all-before-POST. Do not call generate/clear during import loop.
**Follow-up:** Flashcards table/UI, Trello, focus, material nav/filtering, backend batch/`source='plan'` — separate approval.

### 2026-05-26 — Phase 3B-a frontend-only flashcard study UI complete

**Workflow:** Phase 3B-a flashcard study UI (frontend-only)
**ADR refs:** none (UI-only; read-only plan rendering)
**Human gates:** `approved — implement Phase 3B-a`; Supervisor Review approved with notes; Security Review not required (no new writes, no new API call, and safe plain-text rendering)
**Summary:** On **`/study-materials/:materialId`**, `GeneratedPlanSection` renders `FlashcardStudy` when `plan.flashcards` exists (length > 0). The UI shows **one card at a time** with **question first**, a **“Show answer”** reveal interaction (answer shown as plain text), **Previous/Next** navigation, and a **“Card X of N”** counter. Reveal state resets when navigating; the current card index resets to `0` when the `flashcards` array changes. No study progress/persistence, no known/unknown tracking, and no spaced repetition.
**Backend/DB/document-service impact:** none (frontend-only UI; no backend/API/DB/migration/document-service changes and no dependency changes)
**APIs affected:** none
**Tests:** Frontend `npm run lint` passed (1 pre-existing warning in `AuthContext.jsx`); `npm test` passed with **92** tests; `npm run build` passed.
**Changed files:** `frontend/src/components/materials/FlashcardStudy.jsx`, `frontend/src/utils/flashcard-study.js`, `frontend/src/components/materials/GeneratedPlanSection.jsx`, `frontend/tests/unit/flashcard-study.test.js`, `frontend/package.json` (test-script wiring only).
**Helper-file note:** `frontend/src/utils/flashcard-study.js` was added for pure UI/helper logic to keep component code simple and enable helper-level unit tests; it has no API calls and no storage usage.
**package.json note:** `frontend/package.json` `scripts.test` was updated only to include `tests/unit/flashcard-study.test.js` in the existing `node --test ...` list; no deps/devDeps or lockfile changes.
**Pitfalls / minor notes:** Tags are displayed as plain-text metadata (shown alongside the question). Unit tests cover helper logic and expected reveal/navigation state transitions; no full DOM/component rendering tests were added.
**Follow-up:** Still deferred: `flashcards` table + management UI, global `/flashcards` page, backend flashcard API, flashcard import/persistence, known/unknown tracking, and spaced repetition. (**`public.flashcards` table shipped in 3B-b** — see below.)

### 2026-05-26 — Phase 3B-b flashcards schema/RLS complete

**Workflow:** Phase 3B-b flashcards database foundation (schema/RLS only)
**ADR refs:** none (database only; future API will use 001, 003)
**Human gates:** `approved — implement Phase 3B-b`; Supervisor Review approved with notes; Security Review no blockers; optional security doc polish; migration **applied manually** on Supabase SQL Editor **2026-05-26**; `approved — Phase 3B-b complete` — satisfied
**Summary:** Created and **applied** `public.flashcards` with `user_id`, `course_id`, optional `material_id`, `question`, `answer`, `tags`, `source = manual` only, timestamps, ownership triggers, RLS (own-row for `authenticated`), and Data API grants (`anon` none). Mirrors `study_tasks` ownership patterns. **No** backend API, frontend management UI, plan import into rows, or app wiring to DB flashcards.
**Apply:** `supabase/migrations/006_flashcards.sql` in SQL Editor — **Success. No rows returned.**
**Verification:** Catalog passed (table, RLS, columns, policies, grants, indexes, triggers, CHECK/FK). Behavioral: valid course-level insert, CHECK rejects (short question, too many tags, invalid source). Cross-user RLS probe **skipped** (no second auth user). Test row inserted then **cleaned** (`remaining_test_flashcards = 0`).
**Files:** `006_flashcards.sql` (comments updated post-apply), `docs/database/006-flashcards-schema-and-rls.md`
**APIs affected:** none
**Tests:** none (schema-only phase; no npm changes)
**Security:** Supervisor + Security Review approved; doc includes service_role filter, no frontend Supabase writes, no Q/A logging, neutral 404 guidance for future API.
**Not implemented (intentional):** Backend flashcard API (3B-c), frontend DB UI, import `plan.flashcards[]`, global `/flashcards`, known/unknown, spaced repetition, Gemini/document-service/package changes.
**Pitfalls:** Do not re-apply migration where table exists. Backend must filter `user_id` on every service-role query when API ships. **3B-a** UI still uses plan JSON only.
**Follow-up:** Phase **3B-c** backend flashcards API — **complete** (see below); frontend DB UI/import/global page remain separate approval.

### 2026-05-26 — Phase 3B-c flashcards backend API complete

**Workflow:** Phase 3B-c flashcards backend REST API (backend-only)
**ADR refs:** 001 (modular monolith), 003 (Zod validation)
**Human gates:** `approved — implement Phase 3B-c`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 3B-c complete`
**Summary:** Backend CRUD for **`public.flashcards`** via Express with **`requireAuth`** and service-role Supabase filtered by **`user_id = req.user.id`** on every flashcard query/mutation. Create is registered on the **courses** router (same pattern as tasks): **`POST /api/courses/:id/flashcards`**. List/update/delete on **`/api/flashcards`**. GET optional filters **`courseId`** / **`materialId`** verify ownership before listing (neutral **404** for wrong-owner/missing course or material). Responses are camelCase and omit **`userId`**; **`source`** exposed as metadata (`manual` from DB default). **No** frontend service/UI, **no** plan import into rows, **no** global `/flashcards` page.
**Endpoints implemented:**
- `GET /api/flashcards` — optional `?courseId`, `?materialId`
- `POST /api/courses/:id/flashcards` — body: `question`, `answer`, optional `tags`, optional `materialId`
- `PATCH /api/flashcards/:flashcardId`
- `DELETE /api/flashcards/:flashcardId`
**Files:** `backend/src/app.js`, `backend/src/modules/courses/courses.routes.js`, `backend/src/modules/flashcards/*`, `backend/src/shared/validation/flashcard.schema.js`, `backend/tests/helpers/mockSupabaseFlashcards.js`, `backend/tests/unit/flashcards.service.test.js`, `backend/tests/integration/flashcards.test.js`, `backend/package.json` (**test script file list only** — added flashcards test paths; **no** deps/devDeps or lockfile change)
**APIs affected:** flashcards REST (new)
**Tests:** `cd backend && npm run lint` passed; `cd backend && npm test` passed — **180** tests, **0** failures; flashcards suites included in explicit `npm test` list (runs in CI)
**Security:** All routes require auth; no unfiltered service-role flashcard access; path/body cannot set `userId`, `courseId`, `source`, timestamps; neutral 404s; no full question/answer/tags logging
**Scope boundary:** **Backend only** — no frontend, DB/migration, document-service, Gemini schema/prompt, or dependency changes
**Not implemented (intentional):** Frontend DB flashcards UI; frontend `/api/flashcards` client; global `/flashcards` route; import `plan.flashcards[]` into rows; known/unknown; spaced repetition; Anki; pagination/rate limiting
**Pitfalls:** Do not mount create under `/api/flashcards/courses/:id`. Do not list by `courseId`/`materialId` without ownership pre-check. **3B-a** material-detail study UI still reads **plan JSON only** — not this API.
**Follow-up:** Phase **3B-d** frontend integration — **complete** (see below). Global `/flashcards`, manual create/edit-delete UI, dedupe/`source='plan'` — separate approval.

### 2026-05-26 — Phase 3B-d flashcards frontend integration complete

**Workflow:** Phase 3B-d flashcards frontend integration (frontend-only)
**ADR refs:** 003 (Zod validation on import bodies); 002 boundary unchanged (backend REST only)
**Human gates:** `approved — implement Phase 3B-d`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 3B-d complete`
**Summary:** On **`/study-materials/:materialId`**, frontend consumes **3B-c** flashcards API: **`flashcards.service.js`** (list/create/update/delete); **`DbFlashcardsSection`** loads **`GET /api/flashcards?materialId=`** and reuses **`FlashcardStudy`** for saved rows; **Import flashcards to library** in **`GeneratedPlanSection`** copies **`plan.flashcards[]`** via **`plan-flashcard-import.js`** (validate-all-before-POST, sequential **`POST /api/courses/:id/flashcards`**, duplicate confirm, stop on error, refetch saved list). **3B-a** generated-plan **`FlashcardStudy`** remains visible and unchanged. Plan is **not** cleared or mutated on import. Both plan and saved sections may show similar cards after import (expected).
**Files:** `frontend/src/services/flashcards.service.js`, `frontend/src/utils/plan-flashcard-import.js`, `frontend/src/utils/validation.js` (flashcard schemas), `frontend/src/components/materials/DbFlashcardsSection.jsx`, `frontend/src/components/materials/GeneratedPlanSection.jsx`, `frontend/src/pages/StudyMaterialDetail.jsx`, `frontend/tests/unit/flashcards.service.test.js`, `frontend/tests/unit/plan-flashcard-import.test.js`, `frontend/package.json` (**test script list only** — +2 test files; **no** deps/devDeps or lockfile change)
**APIs affected:** frontend calls existing 3B-c flashcards REST (no backend change)
**Tests:** `cd frontend && npm run lint` passed (1 pre-existing `AuthContext.jsx` warning); `cd frontend && npm test` passed — **115** tests, **0** failures; `cd frontend && npm run build` passed
**Security:** Backend REST only (no Supabase table access for flashcards); Bearer JWT via existing pattern; plan flashcards re-validated before POST; plain-text Q/A/tags; no `dangerouslySetInnerHTML`; no full Q/A/tags/token/plan logging
**Scope boundary:** **Frontend only** — no backend, DB/migration, document-service, Gemini, or dependency changes
**Not implemented (intentional):** Global `/flashcards` page; manual create flashcard UI; edit/delete flashcard UI; known/unknown; spaced repetition; Anki; client-side import dedupe; pagination/rate limiting
**Pitfalls:** Do not call Supabase for flashcard rows. Do not clear generated plan after import. Empty saved-flashcards copy assumes user generates a plan below before import is available.
**Follow-up:** Phase **3B-e** manual CRUD UI — **complete** (see below). Global `/flashcards`, course-level management, `source='plan'` / dedupe; advanced study features — separate approval.

### 2026-05-26 — Phase 3B-e flashcards manual CRUD UI complete

**Workflow:** Phase 3B-e flashcards manual CRUD UI (frontend-only)
**ADR refs:** 003 (Zod on create/edit bodies); 002 boundary unchanged (backend REST only)
**Human gates:** `approved — begin Phase 3B-e planning only`; `approved — implement Phase 3B-e`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 3B-e complete`
**Summary:** On **`/study-materials/:materialId`**, **Saved flashcards** (`DbFlashcardsSection`) adds **manual create**, **edit**, and **delete** for DB rows via existing **3B-c** API: inline forms (question, answer, comma-separated tags); compact management list (truncated question + tags); read-only **`FlashcardStudy`** with title **“Study saved cards”**; generic delete confirm (no answer in dialog); **`onMutated`** refetches after mutations. **`flashcard-form.js`** builds validated create/update bodies; **`updateFlashcardFormSchema`** added. Create uses **`material.courseId`** + route **`materialId`**; update/delete use ids from loaded list. **3B-d** import and **3B-a** plan study unchanged.
**Files:** `frontend/src/components/materials/DbFlashcardsSection.jsx`, `frontend/src/pages/StudyMaterialDetail.jsx`, `frontend/src/utils/validation.js`, `frontend/src/utils/flashcard-form.js`, `frontend/src/components/materials/FlashcardStudy.jsx` (optional `title` prop), `frontend/tests/unit/flashcards.validation.test.js`, `frontend/tests/unit/flashcard-form.test.js`, `frontend/package.json` (**test script list only** — +2 test files; **no** deps/devDeps or lockfile change)
**APIs affected:** frontend calls existing 3B-c flashcards REST (no backend change)
**Tests:** `cd frontend && npm run lint` passed (1 pre-existing `AuthContext.jsx` warning); `cd frontend && npm test` passed — **138** tests, **0** failures; `cd frontend && npm run build` passed
**Security:** Backend REST only; no Supabase table writes; bodies exclude `userId`/`courseId`/`source`/timestamps; plain-text Q/A/tags; no `dangerouslySetInnerHTML`; no full Q/A/tags/token logging; neutral 404 on delete
**Scope boundary:** **Frontend only** — no backend, DB/migration, document-service, Gemini, or dependency changes
**Not implemented (intentional):** Global `/flashcards` page; course-level flashcard management; known/unknown; spaced repetition; Anki; client-side import/manual dedupe; `source = 'plan'`; pagination/rate limiting
**Pitfalls:** Do not add CRUD to generated-plan section. Do not send forbidden fields in POST/PATCH bodies. Manual CRUD is not blocked by unsaved material edits (import still is).
**Follow-up:** Phase **3B-f** global `/flashcards` page — **complete** (see below). Global create; course-level management; dedupe/`source='plan'`; advanced study features — separate approval.

### 2026-05-26 — Phase 3B-f global flashcards page complete

**Workflow:** Phase 3B-f global flashcards page (frontend-only)
**ADR refs:** 003 (Zod on edit bodies); 002 boundary unchanged (backend REST only)
**Human gates:** `approved — begin Phase 3B-f planning only`; `approved — implement Phase 3B-f`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 3B-f complete`
**Summary:** Protected **`/flashcards`** route — **`FlashcardsPage`** loads owned courses; **`GlobalFlashcardsSection`** lists all saved flashcards via **`listFlashcards()`** with optional **course** / **material** filters (`resolveFlashcardListFilters` — owned IDs only); **`FlashcardStudy`** on filtered set (`title="Study filtered cards"`); **edit/delete** only (reuses **`flashcard-form.js`**); course/material links on rows; nav from Dashboard and Tasks. **No** global create (Option B). Material detail **3B-e** create/import unchanged.
**Files:** `frontend/src/App.jsx`, `frontend/src/pages/FlashcardsPage.jsx`, `frontend/src/components/flashcards/GlobalFlashcardsSection.jsx`, `frontend/src/utils/flashcard-filters.js`, `frontend/src/pages/DashboardStub.jsx`, `frontend/src/pages/TasksPage.jsx`, `frontend/tests/unit/flashcard-filters.test.js`, `frontend/package.json` (**test script list only** — +1 test file; **no** deps/devDeps or lockfile change)
**APIs affected:** frontend calls existing 3B-c flashcards REST + `listCourses` / `listMaterials` (no backend change)
**Tests:** `cd frontend && npm run lint` passed (1 pre-existing `AuthContext.jsx` warning); `cd frontend && npm test` passed — **146** tests, **0** failures; `cd frontend && npm run build` passed
**Security:** `ProtectedRoute` on `/flashcards`; backend REST only; filter helper rejects unknown course/material IDs; edit/delete ids from authenticated list; plain-text Q/A/tags; generic delete confirm; no sensitive logging
**Scope boundary:** **Frontend only** — no backend, DB/migration, document-service, Gemini, or dependency changes
**Not implemented (intentional):** Global create flashcard UI; course-level flashcard management; known/unknown; spaced repetition; Anki; URL-persisted filters; pagination/rate limiting; shared CRUD form extraction (optional follow-up)
**Pitfalls:** Do not add free-text UUID filters. Do not send forbidden fields on PATCH. Filter change cancels edit.
**Follow-up:** Phase **3B-g** global create on `/flashcards` — **complete** (see below). Bulk create; course-level management; dedupe/`source='plan'`; advanced study features — separate approval.

### 2026-05-26 — Phase 3B-g global create flashcard UI complete

**Workflow:** Phase 3B-g global create flashcard UI (frontend-only)
**ADR refs:** 003 (Zod on create bodies; optional `materialId` aligned with backend); 002 boundary unchanged (backend REST only)
**Human gates:** `approved — begin Phase 3B-g planning only`; `approved — implement Phase 3B-g`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 3B-g complete`
**Summary:** **`GlobalFlashcardsSection`** — **Create flashcard** / **Add another flashcard**; inline form (required **course** from owned list; optional **material** via `listMaterials(createCourseId)` + **Not linked to a material**; Q/A/tags); **`createCourseFlashcard(courseId, body)`** (`courseId` path only; `materialId` in body when selected); **`buildCreateFlashcardBody`** / **`createFlashcardFormSchema`** support optional `materialId`; after success — close form, success message, adjust **courseFilter** / **materialFilter**, refetch so new card visible. **3B-f** list/study/filter/edit/delete unchanged. Material detail **3B-e** create/import unchanged.
**Files:** `frontend/src/components/flashcards/GlobalFlashcardsSection.jsx`, `frontend/src/utils/flashcard-form.js`, `frontend/src/utils/validation.js`, `frontend/tests/unit/flashcard-form.test.js`, `frontend/tests/unit/flashcards.validation.test.js` (**no** `package.json`, lockfile, backend, DB, or doc changes in implementation)
**APIs affected:** frontend calls existing **3B-c** `POST /api/courses/:id/flashcards` (no backend change)
**Tests:** `cd frontend && npm run lint` passed (1 pre-existing `AuthContext.jsx` warning); `cd frontend && npm test` passed — **149** tests, **0** failures; `cd frontend && npm run build` passed
**Security:** `ProtectedRoute` on `/flashcards`; backend REST only; course/material from owned dropdowns only; body excludes `userId`/`courseId`/`source`/timestamps; plain-text Q/A/tags; no sensitive logging; backend neutral 404 on ownership failure
**Scope boundary:** **Frontend only** — no backend, DB/migration, document-service, Gemini, package, or dependency changes during implementation
**Not implemented (intentional):** Bulk create; AI/Gemini flashcard generation; plan import on `/flashcards`; dedupe/`source='plan'`; known/unknown; spaced repetition; Anki; URL-persisted filters; course-level flashcard management; shared CRUD extraction; styling redesign
**Pitfalls:** Do not add free-text UUID fields. Do not send forbidden fields on POST. Filter/create/edit mutual exclusion — filter change cancels create and edit.
**Follow-up:** Bulk create; course-level management; dedupe/`source='plan'`; advanced study features — separate approval.

### 2026-05-26 — Phase 4A-0 Trello sync logs schema applied and verified

**Workflow:** Phase 4A-0 Trello sync logs database (schema/RLS only)
**ADR refs:** 004 (no credential persistence); 003 (CHECK constraints on status and error_message length)
**Human gates:** `approved — implement Phase 4A-0`; Supervisor Review **approved with notes**; Security Review **no blockers**; Migration Review **approved for human apply**; migration **applied manually** in Supabase SQL Editor **2026-05-26**; `approved — Phase 4A-0 applied and verified`
**Summary:** Added **`supabase/migrations/007_trello_sync_logs.sql`** and **`docs/database/007-trello-sync-logs-schema-and-rls.md`**. Table **`public.trello_sync_logs`** — append-only per-task sync outcomes (`success` \| `failed` \| `skipped`); optional `trello_card_id` and sanitized `error_message` (max 500); **no** apiKey/token/listId/raw payloads. RLS: authenticated **SELECT** own rows only; **`service_role` SELECT + INSERT**; owner trigger on INSERT. Applied on Supabase (**Success. No rows returned.**); catalog + behavioral verification passed; owner-mismatch / cross-user probes **skipped/limited** (single auth user); test row cleaned up.
**Files:** `007_trello_sync_logs.sql`, `007-trello-sync-logs-schema-and-rls.md` (+ hub docs on phase complete)
**APIs affected:** none (no backend/frontend routes)
**Tests:** none (schema-only phase; manual SQL verification)
**Security:** No credential columns; append-only grants; owner trigger for service_role inserts; **4A-1** must sanitize `error_message` and never log/store credentials — **Security Review still required for 4A-1**
**Scope boundary:** **Database + documentation only** — no backend, frontend, document-service, Gemini, or package changes
**Not implemented (intentional):** `POST /api/trello/sync`; `/trello` UI; Trello HTTP client; `study_tasks.trello_card_id` updates from sync; `api_logs`
**Pitfalls:** Do not re-apply **007** if table exists. Do not store raw Trello errors in `error_message`. Cleanup verification rows with SQL Editor **postgres** role (not `service_role` DELETE).
**Follow-up:** Phase **4A-1** backend Trello sync API — **complete** (see below). Phase **4A-2** frontend `/trello` — separate approval.

### 2026-05-26 — Phase 4A-1 backend Trello sync API complete

**Workflow:** Phase 4A-1 backend Trello sync API
**ADR refs:** 001 (modular monolith `modules/trello`); 003 (Zod `trelloSyncBodySchema`); 004 (no credential persistence); 005 (manual `listId` in request body)
**Human gates:** `approved — begin Phase 4A-1 planning only`; `approved — implement Phase 4A-1`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 4A-1 complete`
**Summary:** **`POST /api/trello/sync`** mounted at `/api/trello` with **`requireAuth`**. Body: `{ apiKey, token, listId, taskIds }` (strict Zod; max 50 unique UUIDs). **`trello.client.js`** — native `fetch`, `setTrelloFetchForTests`, sanitized HTTP error mapping. **`trello.service.js`** — load owned tasks; sequential per-task sync; skip when `trello_card_id` set; create Trello card (`name` = title, `desc` = description + tags); update `study_tasks.trello_card_id` on success; append **`trello_sync_logs`** (`success` \| `failed` \| `skipped`) for **owned** tasks only; missing/wrong-owner → `failed` / `"Task not found"` **without** log insert; short-circuit after Trello auth/list errors. Response: `{ results[], summary }` with per-task `status` enum (PRD boolean `success` refinement). **No** credentials stored, logged, or returned.
**Files:** `backend/src/app.js`, `modules/trello/*`, `clients/trello.client.js`, `shared/validation/trello.schema.js`, tests (`mockSupabaseTrello`, integration + unit); **`backend/package.json`** `test` script only (+3 trello test files)
**APIs affected:** `POST /api/trello/sync` (new)
**Tests:** `cd backend && npm run lint` passed; `cd backend && npm test` passed — **208** tests, **0** failures (mocked Trello; no live Trello in CI)
**Security:** Credentials in POST body only (not query); never persisted or logged; neutral wrong-owner handling; sanitized `error_message` in logs; task GET APIs still omit `trelloCardId` from responses
**Scope boundary:** **Backend only** — no frontend, DB/migration, document-service, Gemini, or dependency/lockfile changes
**Not implemented (intentional):** `/trello` UI; boards/lists fetch; OAuth; credential storage; Trello card update/delete; force re-sync; admin/focus/dashboard
**Pitfalls:** Do not log `apiKey`/`token`/full Trello URL. Wrong-owner taskIds must not insert logs (FK/trigger). Frontend **4A-2** must call backend only and clear credentials after sync.
**Known MVP note:** If Trello card is created but DB update fails, an **orphan Trello card** may exist without saved `trello_card_id` — accepted operational risk.
**Follow-up:** Phase **4A-2** frontend Trello sync page — **complete** (see below).

### 2026-05-29 — Phase 4A-2 frontend Trello sync page complete

**Workflow:** Phase 4A-2 frontend Trello sync page
**ADR refs:** 001 (frontend → backend modular monolith only); 004 (no credential persistence); 005 (manual `listId` in form)
**Human gates:** `approved — implement Phase 4A-2`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 4A-2 complete`
**Summary:** Protected route **`/trello`** (`TrelloSyncPage` + `TrelloSyncSection` orchestration). Dashboard link to **`/trello`**. **`syncTasksToTrello`** in **`frontend/src/services/trello.service.js`** — `POST /api/trello/sync` with Bearer JWT only; **no** browser calls to Trello hosts. **`TrelloSyncForm`** — password fields for apiKey/token, `autoComplete="off"`, manual listId, **Clear credentials**. **`TrelloTaskSelector`** — `listAllTasks()` checkboxes (max 50); safe metadata (title, status, priority, minutes, course title). **`TrelloSyncResults`** + **`trello-sync-results.js`** — summary counts and per-task `success` \| `failed` \| `skipped`, `trelloCardId` on success only, sanitized backend errors. **`trello-sync-validation.js`** — trim-required credentials, 1–50 tasks, submit disabled while syncing/invalid. Credentials live in React state only; cleared in **`finally`** after any backend sync attempt; local validation failure keeps fields for correction. **No** localStorage/sessionStorage/cookies/URL/query persistence; **no** credential logging or post-sync DOM display.
**Files:** `frontend/src/App.jsx`, `pages/TrelloSyncPage.jsx`, `pages/DashboardStub.jsx`, `components/trello/*`, `services/trello.service.js`, `utils/trello-sync-validation.js`, `utils/trello-sync-results.js`, unit tests; **`frontend/package.json`** `test` script only (+3 trello test files)
**APIs affected:** frontend consumer of `POST /api/trello/sync` (no new backend routes)
**Tests:** `cd frontend && npm run lint` passed (pre-existing `AuthContext` react-refresh warning only); `cd frontend && npm test` passed — **161** tests, **0** failures; `cd frontend && npm run build` passed
**Security:** ProtectedRoute; auth errors → logout/`/`; frontend→backend boundary only; credentials ephemeral in memory/one POST; task descriptions/material body not displayed or sent in sync body (`taskIds` only)
**Scope boundary:** **Frontend only** — no backend, DB/migration, document-service, Gemini, dependency, or lockfile changes
**Not implemented (intentional):** OAuth; `POST /api/trello/boards`; credential storage; Trello card update/delete; force re-sync; boards/lists picker; exposing `trello_card_id` on task list APIs before sync
**Pitfalls:** Do not call `api.trello.com` from frontend. Do not persist credentials. Do not log request bodies. Manual smoke still recommended with a test Trello board.
**Known UX notes (not security blockers):** If **`listCourses`** fails, **`TrelloSyncSection`** does not mount (no courses retry yet). Credentials visible in DevTools during entry/POST — expected for manual-credential MVP. **`listId`** plain text while typing. Already-synced tasks not shown pre-submit (task APIs omit `trello_card_id`; backend returns **`skipped`** after sync).
**Follow-up:** Phase **4A-3** Trello UI polish — **complete** (see below). Manual end-to-end smoke with real Trello credentials; optional courses-load retry/decouple; dashboard refetch for `trelloSyncedTasks` when dashboard metrics exist (future).

### 2026-05-29 — Phase 4A-3 Trello sync page UI polish complete

**Workflow:** Phase 4A-3 Trello sync page UI polish
**ADR refs:** none changed (004/005 behavior unchanged)
**Human gates:** `approved — implement Phase 4A-3`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 4A-3 complete`
**Summary:** **Presentation-only** polish for protected **`/trello`** — no sync logic, service, validation, or credential-lifecycle changes. **`TrelloSyncPage`** — cleaner header (`page-header__intro`, lead + credential note, nav). **`TrelloSyncForm`** — improved field/button spacing. **`TrelloTaskSelector`** — card-style rows (no bullet list), aligned checkboxes, title/metadata separation (`status · priority · minutes · course`), toolbar + selection count. **`TrelloSyncResults`** — readable summary and per-task rows with status pills (`success` / `skipped` / `failed`). **`frontend/src/index.css`** — scoped styles (`.page--trello`, `.trello-sync`, `.trello-task-list*`, `.trello-sync-results*`); submit area spacing; scrollable task list on laptop widths.
**Files:** `frontend/src/pages/TrelloSyncPage.jsx`, `frontend/src/components/trello/*` (markup/classNames only), `frontend/src/index.css`
**APIs affected:** none
**Tests:** `cd frontend && npm run lint` passed (pre-existing `AuthContext` react-refresh warning only); `cd frontend && npm test` passed — **161** tests, **0** failures; `cd frontend && npm run build` passed
**Security:** Unchanged from **4A-2** — credentials React-state only; cleared after backend attempt; no storage/URL/logging; no direct Trello API; no new network paths
**Scope boundary:** **Frontend UI polish only** — no backend, DB/migration, document-service, Gemini, service/validation edits, dependency/lockfile, or docs (until this entry)
**Not implemented (intentional):** OAuth; boards/lists picker; credential storage; Trello card update/delete; force re-sync; app-wide DESIGN pass
**Pitfalls:** Do not treat **4A-3** as permission to change credential handling or add `api.trello.com` calls. Scoped CSS must stay under Trello class prefixes.
**Known UX notes (unchanged):** Duplicate credential-not-saved copy (page + form); courses-load failure still gates sync section; manual Trello smoke still recommended.
**Follow-up:** Optional tokenize hardcoded status/hover colors; optional courses retry; commit **4A-2** + **4A-3** frontend together or separate polish commit per human preference.

### 2026-05-29 — Phase 4B-1 backend Trello board/list discovery complete

**Workflow:** Phase 4B-1 backend Trello board/list discovery
**ADR refs:** 001 (modular monolith `modules/trello`); 003 (Zod `trelloBoardsBodySchema`, `trelloBoardListsBodySchema`, `trelloBoardIdParamSchema`); 004 (no credential persistence); 005 (manual credentials in POST body — discovery uses same ephemeral pattern as sync)
**Human gates:** `approved — implement Phase 4B-1`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 4B-1 complete`
**Summary:** Backend-only Trello discovery proxy — **`POST /api/trello/boards`** and **`POST /api/trello/boards/:boardId/lists`**, both behind existing **`requireAuth`** on `/api/trello`. Body: `{ apiKey, token }` (strict Zod; no `userId`, no `listId`). Backend calls Trello REST (`GET /members/me/boards`, `GET /boards/:boardId/lists`) via native `fetch`; returns sanitized **`{ boards: [{ id, name }] }`** or **`{ lists: [{ id, name }] }`** only (open items, sorted by name, max 500). **No** DB/Supabase reads or writes on discovery paths; **no** credential persistence or board/list metadata storage. **`POST /api/trello/sync`** unchanged. Approved refinement vs older PRD nested boards+lists example: **two endpoints** with lazy list load after board selection (simpler, safer, more efficient for MVP).
**Files:** `backend/src/clients/trello.client.js` (`getBoards`, `getBoardLists`, shared discovery fetch + logging); `backend/src/shared/validation/trello.schema.js`; `backend/src/modules/trello/*`; integration + unit tests (mocked Trello only)
**APIs affected:** `POST /api/trello/boards` (new); `POST /api/trello/boards/:boardId/lists` (new)
**Tests:** `cd backend && npm run lint` passed; `cd backend && npm test` passed — **235** tests, **0** failures (no live Trello in CI)
**Security:** Credentials in POST body only; never stored, logged, or returned; full Trello URL/query string and raw Trello body never logged or returned; discovery does not use `service_role` / Supabase
**Scope boundary:** **Backend only** — no frontend, DB/migration, document-service, Gemini, docs (until this entry), dependency, or lockfile changes
**Not implemented (intentional):** Frontend board/list picker (**4B-2**); OAuth; credential storage; board/list persistence; Trello card update/delete; force re-sync
**Known UX note (not security):** Rare 404 on `/members/me/boards` may surface a less ideal message (“Trello list not found”) — acceptable for MVP; optional follow-up.
**Follow-up:** Phase **4B-2** frontend board/list picker on `/trello` — **complete** (see below).

### 2026-05-29 — Phase 4B-2 frontend Trello board/list picker complete

**Workflow:** Phase 4B-2 frontend Trello board/list picker
**ADR refs:** 001 (frontend → backend only); 004 (no credential persistence); 005 (ephemeral credentials in POST body — list chosen via picker, not manual paste)
**Human gates:** `approved — implement Phase 4B-2`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 4B-2 complete`
**Summary:** Protected **`/trello`** — **manual listId input removed** from primary UX. Flow: enter apiKey/token → **Load boards** → select board → app loads lists → select list → select StudyOps tasks → **Sync to Trello**. **`fetchTrelloBoards`** / **`fetchTrelloBoardLists`** in **`trello.service.js`** call **`POST /api/trello/boards`** and **`POST /api/trello/boards/:boardId/lists`** with Bearer JWT only; **no** browser calls to `api.trello.com`. **`TrelloBoardListPicker`** + **`mapTrelloNamedOptions`** (`trello-picker.js`) — board/list names only in dropdowns. **`validateTrelloLoadBoards`**; sync requires selected list (`Select a Trello list`). Credentials React-state only; cleared after backend sync attempt; **Clear credentials** resets apiKey/token and picker state. Board/list labels may remain after sync (non-secret). **`syncTasksToTrello`** unchanged — sends `selectedListId` as `listId`. With **4B-1**, Trello picker flow is **end-to-end** in repo.
**Files:** `frontend/src/services/trello.service.js`, `utils/trello-sync-validation.js`, `utils/trello-picker.js`, `components/trello/TrelloBoardListPicker.jsx`, `TrelloSyncForm.jsx`, `TrelloSyncSection.jsx`, `index.css` (scoped `.trello-picker`); unit tests; **`frontend/package.json`** test script only (+`trello-picker.test.js`)
**APIs affected:** frontend consumer of `POST /api/trello/boards`, `POST /api/trello/boards/:boardId/lists`, `POST /api/trello/sync` (no new backend routes)
**Tests:** `cd frontend && npm run lint` passed (pre-existing `AuthContext` react-refresh warning); `cd frontend && npm test` passed — **168** tests, **0** failures; `cd frontend && npm run build` passed
**Security:** Backend-only Trello boundary; no storage/URL/logging of credentials; password fields + `autoComplete="off"`; sanitized error strings only
**Scope boundary:** **Frontend only** — no backend, DB/migration, document-service, Gemini, dependency, or lockfile changes
**Not implemented (intentional):** OAuth / Connect Trello; credential storage; board/list persistence; Trello card update/delete; force re-sync
**Known UX notes (not security blockers):** After sync, board/list dropdown labels may remain while apiKey/token clear; re-entering credentials without **Load boards** may reuse prior `selectedListId` — Security Review: operational/UX only. Optional hardening: clear `selectedListId` after sync or require fresh board load after credential clear.
**Follow-up:** Manual smoke test — **passed** (see below).

### 2026-05-29 — Phase 4B Trello board/list picker manual smoke test passed

**Workflow:** `approved — document Phase 4B smoke test passed`
**Context:** Phase **4B-2** implemented, reviewed, merged to **main**; CI green.
**Summary:** Manual end-to-end smoke on protected **`/trello`** with real Trello credentials — **passed**. Verified: page loads for authenticated user; manual **listId** input removed; **Load boards** → board selection loads lists → list selection; sync creates Trello card; duplicate sync of same task returns **skipped** / “Already synced to Trello”; **apiKey/token** cleared after sync. Browser **Network**: only StudyOps backend calls (`POST /api/trello/boards`, `POST /api/trello/boards/:boardId/lists`, `POST /api/trello/sync`) — **no** `api.trello.com`. **Console**: no Trello credentials logged. **localStorage/sessionStorage**: no Trello apiKey/token (Supabase auth session in localStorage expected, not Trello-related).
**Scope boundary:** Documentation only — no code changes in this step.

### 2026-05-29 — Phase 4C-0 focus_sessions database migration applied and verified

**Workflow:** Phase 4C-0 Focus Sessions database foundation
**ADR refs:** 001 (modular monolith — future `focus` module); 003 (future Zod on API)
**Human gates:** `approved — implement Phase 4C-0`; Supervisor Review **approved with notes**; Security / Migration Review **no blockers**; `approved — Phase 4C-0 applied and verified`
**Summary:** **`public.focus_sessions`** table created on Supabase via **`008_focus_sessions.sql`** (manual SQL Editor apply). RLS enabled; policies **`focus_sessions_select_own`**, **`focus_sessions_insert_own`**, **`focus_sessions_update_own`**; **no** student DELETE policy. Grants: **`authenticated`** and **`service_role`** SELECT/INSERT/UPDATE only; **`anon`** none. Trigger **`focus_sessions_enforce_task_owner`** enforces `user_id` and `course_id` alignment with **`study_tasks`** on INSERT/UPDATE. Catalog + behavioral verification passed **2026-05-29**.
**Duration semantics:** **`duration_minutes`** is a **provisional session ceiling** while **`ended_at IS NULL`**; after complete (Phase **4C-1**), backend overwrites with **actual** elapsed minutes from **`started_at`** / **`ended_at`** (server-side only; not client-reported). Dashboard (**5B**) will sum **`duration_minutes`** only where **`ended_at IS NOT NULL`**.
**APIs affected:** none (database only)
**Tests:** none in this phase (schema/docs only)
**Security:** Own-row RLS; ownership trigger; no credentials or study content columns; frontend must use Express API only in later phases (no direct `service_role`)
**Scope boundary:** SQL migration file + `docs/database/008-focus-sessions-schema-and-rls.md` only — **no** backend, frontend, or app tests in 4C-0
**Not implemented (intentional):** `POST /api/focus`; `POST /api/focus/:sessionId/complete`; `/focus/:taskId` UI; `totalFocusMinutes` on dashboard
**Follow-up:** Phase **4C-1** backend Focus Sessions API — `approved — implement Phase 4C-1` when ready

### 2026-05-29 — Phase 4C-1 backend Focus Sessions API complete

**Workflow:** Phase 4C-1 backend Focus Sessions API
**ADR refs:** 001 (modular monolith — `focus` module); 003 (Zod on request bodies/params)
**Human gates:** `approved — implement Phase 4C-1`; Supervisor Review **approved with notes**; Security Review **no blockers** / pass with notes; `approved — Phase 4C-1 complete`
**Summary:** Backend **`focus`** module mounted at **`/api/focus`** with **`requireAuth`**. **`POST /api/focus`** starts a session for an owned **pending** `study_tasks` row — body `{ taskId, durationMinutes? }` (default **25**, int **5–120**, strict); inserts **`public.focus_sessions`** with provisional ceiling in **`duration_minutes`**; returns **`{ session }`** (camelCase). **`POST /api/focus/:sessionId/complete`** — body `{ completedTask }` strict; **no** client elapsed minutes; server sets **`ended_at`** and overwrites **`duration_minutes`** with actual minutes from **`started_at`** → **`ended_at`**, clamped **1 … min(120, session ceiling)**; optional task completion via existing **`completeTask`** when **`completedTask === true`**; returns **`{ session }`** or **`{ session, task }`**. Wrong-owner task/session → neutral **404**; completed task at start → **400**; already completed session → **409**.
**APIs affected:** `POST /api/focus`, `POST /api/focus/:sessionId/complete`
**Tests:** `backend/tests/integration/focus.test.js`, `backend/tests/unit/focus.service.test.js`, `backend/tests/unit/focus.validation.test.js`, `backend/tests/helpers/mockSupabaseFocus.js`; **`cd backend && npm run lint`** passed; **`npm test`** **270/270** passed
**Security:** Service-role queries filter **`user_id = req.user.id`**; start task select minimal (`id`, `course_id`, `status`); no material content or credentials in module; Security Review **no blockers**
**Known edge case (SEC-1, non-blocking):** In **`completeFocusSession`**, the focus session row is updated (closed) **before** **`completeTask`**. If the session update succeeds but **`completeTask`** fails (e.g. transient **`DATABASE_ERROR`**), the session may show completed with **`completed_task: true`** while the task stays **pending**; retry on the same session returns **409**. User can still complete the task via **`POST /api/tasks/:taskId/complete`**. Optional future hardening: complete task first, then session; transaction/RPC; recovery path when session says completed but task is pending.
**Scope boundary:** Backend module, Zod schemas, app mount, tests, **`backend/package.json`** `test` script only — **no** frontend, migration, dependency, or **`package-lock`** changes
**Not implemented (intentional):** `/focus/:taskId` UI (Phase **4C-2**); manual smoke (Phase **4C-3**); dashboard **`totalFocusMinutes`** (Phase **5B**)
**Follow-up:** Phase **4C-2** frontend Focus page + Start Focus entry points

### 2026-05-29 — Phase 4C-2 frontend Focus Sessions UI complete

**Workflow:** Phase 4C-2 frontend Focus Sessions UI
**ADR refs:** 001 (frontend → backend only); 003 (mirrors backend request shapes)
**Human gates:** `approved — implement Phase 4C-2`; Initial Supervisor Review changes requested (S1 duplicate start on remount); S1 fixed; Targeted Supervisor Re-review **approved with notes**; Security Review **no blockers**; `approved — Phase 4C-2 complete`
**Summary:** Protected **`/focus/:taskId`** route; **`focus.service.js`** → backend only (`POST /api/focus`, `POST /api/focus/:sessionId/complete`); **`FocusPage`**: auto-starts session once (fixed **25**-minute display countdown); Complete sends **`{ completedTask }` only**; success message uses backend **`session.durationMinutes`**; optional **Mark task as complete** checkbox. **Start Focus** link on **pending** tasks only (`TaskCard` on **`/tasks`** and **`/courses/:id`**); global tasks return to **`/tasks`**, course tasks to **`/courses/:courseId`**. **No** pause/resume, duration picker, **localStorage**/sessionStorage, direct Supabase, or external APIs. **S1 fix:** module-level in-flight **`Promise` Map** keyed by **`taskId:durationMinutes`** dedupes concurrent **`POST /api/focus`** on remount/Strict Mode; entries removed in **`finally`**.
**APIs affected:** Frontend calls existing **`POST /api/focus`**, **`POST /api/focus/:sessionId/complete`** only
**Tests:** `frontend/tests/unit/focus.service.test.js`, `frontend/tests/unit/focus-persistence.test.js`; **`cd frontend && npm run lint`** passed (pre-existing AuthContext warning); **`npm test`** **174/174**; **`npm run build`** passed; **`frontend/package.json`** `test` script only
**Security:** Security Review **no blockers**; complete body strictly **`{ completedTask }`**; timer display-only; no browser persistence of session/timer state
**Known gaps (non-blocking):** No automated test for promise-map dedupe / Strict Mode; no component test for Start Focus hidden on completed tasks or busy-state span; **`returnTo`** validated with **`startsWith('/')`** only (MVP acceptable)
**Scope boundary:** Frontend pages/components/services/tests + **`frontend/package.json`** `test` script only — **no** backend, migration, dependency, or **`package-lock`** changes
**Not implemented (intentional):** Manual smoke (Phase **4C-3**); dashboard **`totalFocusMinutes`** (Phase **5B**); pause/resume; duration picker
**Follow-up:** Phase **4C-3** manual focus smoke test + docs/status finalization; Phase **5B** dashboard focus totals later

### 2026-05-29 — Phase 4C-3 Focus Sessions manual smoke test passed

**Workflow:** Phase 4C-3 Focus Sessions manual smoke (docs/status update only)
**ADR refs:** 001 (frontend → backend only); 003 (request shapes verified in browser)
**Human gates:** `approved — Phase 4C-3 focus smoke passed`
**Summary:** Manual Focus Sessions smoke test **passed** on branch **`phase-4c-3-focus-smoke`**. Verified flows: login; **`/tasks`** loads; **Start Focus** on **pending** tasks only (hidden on completed); navigation to **`/focus/:taskId`**; focus page timer loads; **`POST /api/focus`** sends only **`taskId`** and **`durationMinutes`**; complete session **without** “Mark task as complete” → **`POST /api/focus/:sessionId/complete`** sends only **`{ completedTask: false }`** → task remains **pending**; second session with **Mark task as complete** → **`{ completedTask: true }`** → task becomes **completed** and **Start Focus** hidden; **course page** Start Focus flow works; back navigation to **`/tasks`** / **`/courses/:courseId`** works. **Network clean:** focus requests through backend only — **no** direct Supabase **`focus_sessions`** calls, **no** Trello/Gemini. **Console clean:** no serious errors; no token/Authorization/study-material content logs.
**APIs affected:** none (verification only)
**Tests:** none (manual smoke only; no automated test changes)
**Security:** Confirmed browser does not call Supabase focus tables or external APIs; complete body strictly **`{ completedTask }`** only
**Scope boundary:** Documentation/status update only — **no** frontend, backend, DB, migration, test, or package changes
**MVP status:** **Focus Sessions MVP complete** through **4C-0** (DB) + **4C-1** (backend) + **4C-2** (frontend) + **4C-3** (manual smoke)
**Not implemented (intentional):** Dashboard **`totalFocusMinutes`** (Phase **5B**)
**Follow-up:** Phase **5B** dashboard backend stats API (or dashboard planning if needed)

### 2026-05-29 — Phase 5B backend Dashboard Stats API complete

**Workflow:** Phase 5B backend Dashboard Stats API
**ADR refs:** 001 (modular monolith — `dashboard` module); 003 (N/A — GET only, no request body)
**Human gates:** `approved — implement Phase 5B`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 5B complete`
**Summary:** Backend **`dashboard`** module mounted at **`/api/dashboard`** with **`requireAuth`**. **`GET /api/dashboard/stats`** returns auth-protected, user-owned **aggregate counts only** — **`totalCourses`**, **`totalStudyMaterials`**, **`totalGeneratedPlans`**, **`totalTasks`**, **`pendingTasks`**, **`completedTasks`**, **`totalFlashcards`**, **`totalFocusMinutes`**, **`completedFocusSessions`**, **`trelloSyncedTasks`**, and **`courseStats[]`** (`courseId`, `courseName`, `totalTasks`, `completedTasks`, `totalFlashcards`). All queries scoped to **`req.user.id`** or owned parent records (service-role + explicit filters). **`totalFocusMinutes`** sums **`duration_minutes`** only where **`ended_at IS NOT NULL`** (completed sessions). **`totalGeneratedPlans`** counts owned plans only — **no** plan JSON returned. **`trelloSyncedTasks`** is DB count of owned tasks with **`trello_card_id`** — **no** Trello HTTP calls, **no** card IDs in response. **No** study material content, task descriptions, credentials, or raw DB rows returned.
**APIs affected:** `GET /api/dashboard/stats`
**Tests:** `backend/tests/integration/dashboard.test.js`, `backend/tests/unit/dashboard.service.test.js`, `backend/tests/helpers/mockSupabaseDashboard.js`; **`cd backend && npm run lint`** passed; **`npm test`** **283/283** passed; **`backend/package.json`** `test` script only
**Security:** Security Review **no blockers**; cross-user isolation tested; sensitive-field assertions on response (no `content`, `plan`, `description`, `apiKey`, `token`, `trelloCardId`, `trello_card_id`)
**Known gaps (non-blocking):** Query fan-out (~13 parallel DB round-trips) acceptable for MVP; sensitive-field tests could add `userId`/`email`/`Authorization` checks later
**Scope boundary:** Backend module, app mount, tests, **`backend/package.json`** `test` script only — **no** frontend, migration, dependency, or **`package-lock`** changes
**Not implemented (intentional):** Dashboard frontend UI consuming stats (shipped in **5C**); admin dashboard
**Follow-up:** Phase **5C** Dashboard frontend UI (see below)

### 2026-05-29 — Phase 5C Dashboard frontend UI complete

**Workflow:** Phase 5C Dashboard frontend UI
**ADR refs:** N/A — frontend-only; consumes existing **5B** backend API; no architecture boundary change
**Human gates:** `approved — implement Phase 5C`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 5C complete`
**Summary:** Protected **`/dashboard`** (`DashboardStub.jsx`) now consumes **`GET /api/dashboard/stats`** via **`frontend/src/services/dashboard.service.js`** (authenticated **`apiFetch`** pattern — Bearer JWT from Supabase session only; **no** direct Supabase table queries; **no** `service_role`; **no** Trello/Gemini/document-service calls). Displays user-owned aggregate stats: **`totalCourses`**, **`totalStudyMaterials`**, **`totalGeneratedPlans`**, **`totalTasks`**, **`pendingTasks`**, **`completedTasks`**, **`totalFlashcards`**, **`totalFocusMinutes`** (formatted via **`dashboard-format.js`**), **`completedFocusSessions`**, **`trelloSyncedTasks`**, and per-course **`courseStats[]`** (`courseName`, task/flashcard counts, link to **`/courses/:courseId`**). **Read-only** — fetch on mount + manual **Try again** only; **no** polling; **no** `DashboardContext`/cross-page refresh wiring. Loading/error/empty states; **`AUTH_REQUIRED`** → logout + redirect; generic error copy (no raw API payloads). Course names rendered as React text — **no** `dangerouslySetInnerHTML`. **Does not** fetch or display material content, plan JSON, task descriptions, Trello card IDs/credentials, or raw DB rows.
**Files:** `frontend/src/services/dashboard.service.js`, `frontend/src/utils/dashboard-format.js`, `frontend/src/pages/DashboardStub.jsx`, `frontend/src/styles/layout.css`, `frontend/tests/unit/dashboard.service.test.js`, `frontend/tests/unit/dashboard-format.test.js`; **`frontend/package.json`** `test` script only (+2 test files; **no** deps/devDeps or lockfile change)
**Tests:** **`cd frontend && npm run lint`** passed (one pre-existing `AuthContext.jsx` warning); **`npm test`** **181/181** passed; **`npm run build`** passed
**Security:** Security Review **no blockers**; frontend → backend only; no new external API attack surface; no package/dependency changes; no chart library
**Known gaps (non-blocking):** optional `AUTH_REQUIRED` service test; optional `DashboardStub` component tests; optional negative/NaN `formatFocusMinutes` tests; optional `ApiRequestError` import locality cleanup
**Scope boundary:** Frontend service, page, CSS, unit tests, **`frontend/package.json`** `test` script only — **no** backend, DB, migration, dependency, or **`package-lock`** changes
**Not implemented (intentional):** `DashboardContext`/cross-page auto-refresh (PRD §12.5 — separate approved phase if needed); admin dashboard; dashboard styling polish pass beyond minimal layout CSS
**Follow-up:** Decide whether to add **`DashboardContext`/cross-page refresh** in a separate approved phase, or continue to next product feature (admin dashboard, polish, etc.)

### 2026-05-29 — Phase 5C.1 Dashboard refresh / cross-page freshness complete

**Workflow:** Phase 5C.1 Dashboard refresh
**ADR refs:** N/A — frontend-only invalidation notifier; no backend/API/DB boundary change; aligns with PRD §12.5 manual refetch-after-mutations intent (invalidation-only refinement vs PRD example that stores stats in context)
**Human gates:** `approved — implement Phase 5C.1`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 5C.1 complete`
**Summary:** Added **invalidation-only** dashboard refresh mechanism — **`DashboardContext`** exposes **`refreshStats()`** and **`subscribeToRefresh()`** only; **does not** store dashboard stats or fetch stats inside context. **`dashboardRefreshNotifier.js`** coalesces duplicate **`refreshStats()`** calls via **`queueMicrotask`** before notifying subscribers. **`DashboardStub`** keeps local **`stats`/`loading`/`error`** state; stats still load only via **`getDashboardStats()`** → **`GET /api/dashboard/stats`**. **Manual Refresh stats** button on dashboard; **silent refresh** when dashboard is mounted and stat-changing actions call **`refreshStats()`** (at most one queued follow-up silent refresh while in-flight). **`refreshStats()`** wired after successful: create/update/delete course; create/delete material; generate/clear plan; import plan tasks/flashcards; create/complete/delete task; create/delete flashcard; Trello sync when **`summary.success > 0`**; focus session complete. **No** polling; **no** WebSockets; **no** **`BroadcastChannel`**; **no** **`localStorage`/`sessionStorage`** cross-tab sync; **no** visibility/focus refetch; **no** backend/API/DB/migration changes.
**Files:** `frontend/src/context/dashboardRefreshNotifier.js`, `frontend/src/context/DashboardContext.jsx`, `frontend/src/main.jsx` (`DashboardProvider` inside `AuthProvider`), `frontend/src/pages/DashboardStub.jsx`, mutation call sites (`CoursesList`, `CourseDetail`, `StudyMaterialDetail`, `CourseTasksSection`, `GlobalTasksSection`, `DbFlashcardsSection`, `GlobalFlashcardsSection`, `TrelloSyncSection`, `FocusPage`), `frontend/tests/unit/dashboard-context.test.js`; **`frontend/package.json`** `test` script only (+1 test file; **no** deps/devDeps or lockfile change)
**Tests:** **`cd frontend && npm run lint`** passed (**0** errors; **3** `react-refresh` warnings on context files — same class as **`AuthContext`**); **`npm test`** **186/186** passed; **`npm run build`** passed; **`git diff --check`** clean
**Security:** Security Review **no blockers** — frontend-only; no **`service_role`**; no direct Supabase stats queries; no Gemini/Trello/document-service calls for dashboard refresh; no secrets/token logging; no polling/storage/cross-tab sync; dashboard refresh remains read-only **`GET`**; request volume bounded to user actions + coalescing
**Known gaps (non-blocking):** **`DashboardStub`** subscription effect re-subscribes when **`stats`/`loading`** change; silent refresh during error UI may update stats without clearing error; boundary test label scans notifier file only; **`react-refresh`** warnings follow existing **`AuthContext`** pattern
**Scope boundary:** Frontend context/notifier, provider placement, dashboard subscription, mutation wiring, unit tests, **`frontend/package.json`** `test` script only — **no** backend, DB, migration, dependency, or **`package-lock`** changes
**Not implemented (intentional):** global stats cache in context; polling; WebSockets; cross-tab sync; visibility/focus refetch; admin dashboard; chart library; further dashboard refresh work unless separately approved
**Follow-up:** Choose next product feature (admin dashboard, polish pass, etc.) — **not** more dashboard refresh unless explicitly approved

### 2026-05-29 — Flashcards material filter bugfix complete

**Workflow:** Bugfix — flashcards material filter (backend only)
**ADR refs:** 001 (modular monolith), 003 (Zod unchanged — query validation only)
**Human gates:** `approved — flashcards material filter bugfix complete`
**Summary:** Fixed **`500 DATABASE_ERROR`** (“Failed to access study material”) on **`GET /api/flashcards?courseId=&materialId=`** when selecting a study material on **`/flashcards`**. Root cause: **`assertMaterialBelongsToOwnedCourseForFlashcards`** in **`flashcards.service.js`** filtered by **`courses.user_id`** without embedding **`courses!inner(...)`** in the PostgREST select — real PostgREST rejected the query. Fix: **`MATERIAL_OWNERSHIP_SELECT`** = **`'id, course_id, courses!inner(id)'`** on the material ownership query (same pattern as **`tasks.service.js`**). Ownership checks preserved — material **`id`**, **`course_id`**, and joined **`courses.user_id`** still enforced; wrong owner / wrong course / cross-course material remain neutral **`404`** “Study material not found”. Valid owned course+material now returns **`200`**. When **`materialId`** is specified, course-level flashcards (**`material_id` null**) are excluded from results; course-only listing unchanged.
**APIs affected:** **`GET /api/flashcards`** (behavior fix only — no contract change)
**Tests:** **`backend/tests/integration/flashcards.test.js`**, **`backend/tests/unit/flashcards.service.test.js`**, **`mockSupabaseFlashcards.js`**, **`mockSupabaseStudyMaterials.js`** (PostgREST fidelity for missing inner join). **`cd backend && npm run lint`** passed; **`npm test`** **287/287** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes**; Security Review **no blockers** (no ownership weakening; no content/plan selected in ownership query; no raw PostgREST errors exposed)
**Scope boundary:** Backend service + tests only — **no** frontend, DB/migration/RLS, auth, package, or dependency changes
**Pitfalls:** **`assertMaterialOwnedForFlashcards`** still uses inline select string (optional DRY follow-up only)

### 2026-05-29 — Phase 6A-1 Admin Authorization Foundation complete

**Workflow:** Phase 6A-1 Admin Authorization Foundation
**ADR refs:** 001 (modular monolith — `backend/src/modules/admin/*`), 003 (Zod unchanged — no new request schemas)
**Human gates:** `approved — implement Phase 6A-1`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 6A-1 complete`
**Summary:** Backend admin authorization foundation only — **`requireAdmin`** middleware loads **`profiles.role`** from DB for **`req.user.id`** (after **`requireAuth`**); **does not** trust frontend, JWT role claims, or client-supplied role. Mounted **`/api/admin`** router with middleware order **`requireAuth` → `requireAdmin` → handler**. Minimal protected endpoint **`GET /api/admin/access-check`** returns only **`{ admin: true }`** — no email, userId, profile object, stats, logs, or cross-user data. **401 `AUTH_REQUIRED`** for missing/invalid token; **403 `FORBIDDEN`** / `"Admin access required"` for authenticated student or missing profile (same generic response — no enumeration); **200** for verified admin. **`req.user.role = 'admin'`** attached only after DB verification. No frontend **`/admin`** route/UI; no full admin stats; no **`GET /api/admin/stats`** or **`GET /api/admin/logs`**; no user list; no role mutation API; no DB/migration/RLS changes (**`profiles.role`** already exists).
**APIs affected:** **`GET /api/admin/access-check`** (new)
**Tests:** **`backend/tests/integration/admin.auth.test.js`**, **`backend/tests/helpers/mockSupabaseAdmin.js`**; **`backend/package.json`** `test` script only (+admin auth test). **`cd backend && npm run lint`** passed; **`npm test`** **290/290** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes**; Security Review **no blockers** — no critical or important issues
**Known gaps (non-blocking):** integration test for valid JWT + missing profile → **403**; isolated **`requireAdmin`** unit tests
**Scope boundary:** Backend admin module + integration tests + **`backend/package.json`** `test` script only — **no** frontend, DB/migration, dependency, or **`package-lock`** changes
**Not implemented (intentional):** full admin aggregate stats API (**Phase 6A-2**); frontend **`/admin`** UI (**Phase 6A-3**); **`api_logs`** / admin logs endpoints
**Follow-up:** **Phase 6A-2** — backend admin aggregate stats API (separate human approval)

### 2026-05-29 — Phase 6A-2 Backend Admin Aggregate Stats API complete

**Workflow:** Phase 6A-2 Backend Admin Aggregate Stats API
**ADR refs:** 001 (modular monolith — `backend/src/modules/admin/*`), 003 (Zod unchanged — no new request schemas)
**Human gates:** `approved — implement Phase 6A-2`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 6A-2 complete`
**Summary:** Backend-only platform-wide admin aggregate stats — **`GET /api/admin/stats`** on existing **`/api/admin`** router with middleware order **`requireAuth` → `requireAdmin` → getStats**. Returns **aggregate numeric counts only** plus static **`systemHealth.backend: "ok"`** — **no** raw rows, user lists, emails, content, titles, plan JSON, flashcard Q/A, Trello card IDs, or logs. Metrics: **`totalUsers`**, **`totalCourses`**, **`totalStudyMaterials`**, **`totalGeneratedPlans`**, **`totalTasks`**, **`pendingTasks`**, **`completedTasks`**, **`totalFlashcards`**, **`totalFocusMinutes`**, **`completedFocusSessions`**, **`trelloSyncedTasks`**, **`trelloSyncAttemptsToday`**, **`trelloSyncSucceededToday`**, **`trelloSyncFailedToday`**, **`trelloSyncSkippedToday`**. Platform-wide service-role aggregate reads are an **intentional admin-only exception** to the normal user-owned service-role filtering rule because the route is protected by **`requireAuth` + `requireAdmin`**, the response is aggregate-only, and no private row payloads or PII are returned. **No** frontend, DB migration, **`GET /api/admin/logs`**, **`api_logs`**, Gemini metrics, document-service call, Trello API call, role mutation, or admin mutation endpoints.
**APIs affected:** **`GET /api/admin/stats`** (new)
**Tests:** **`backend/tests/integration/admin.stats.test.js`**, **`backend/tests/helpers/mockSupabaseAdminStats.js`**; **`backend/package.json`** `test` script only (+admin stats test). **`cd backend && npm run lint`** passed; **`npm test`** **297/297** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes**; Security Review **no blockers** — no critical or important issues
**Known gaps (non-blocking):** at larger scale, **`totalFocusMinutes`** can move from in-memory **`duration_minutes`** summation to DB-side **`SUM`**; forbidden-field regression test can later add **`courseId`**, **`materialId`**, **`generatedPlan`**; no dedicated **`admin.service`** unit test (integration coverage accepted)
**Scope boundary:** Backend admin module + integration tests + **`backend/package.json`** `test` script only — **no** frontend, DB/migration, dependency, or **`package-lock`** changes
**Not implemented (intentional):** frontend **`/admin`** UI (**Phase 6A-3**); **`api_logs`** / **`GET /api/admin/logs`**; Gemini/system error metrics (no **`api_logs`** table)
**Follow-up:** **Phase 6A-3** — frontend **`/admin`** UI consuming **`GET /api/admin/stats`**

### 2026-05-29 — Phase 6A-3 Frontend Admin Dashboard UI complete

**Workflow:** Phase 6A-3 Frontend Admin Dashboard UI
**ADR refs:** 001 (frontend → Express backend only), 003 (envelope + typed aggregate display; no client plan persistence)
**Human gates:** `approved — implement Phase 6A-3`; Supervisor Review **approved with notes**; Security Review **no blockers**; `approved — Phase 6A-3 complete`
**Summary:** Frontend admin dashboard only — protected route **`/admin`** with nesting **`ProtectedRoute` → `AdminRoute` → `AdminDashboardPage`**. **`AdminRoute`** is a **UX guard** (`user?.role === 'admin'` from **`AuthContext`** / **`GET /api/auth/me`**) — **not** the security boundary; backend **`requireAuth` + `requireAdmin`** on **`GET /api/admin/stats`** remains authoritative. **`getAdminStats()`** in **`admin.service.js`** calls **`GET /api/admin/stats`** via existing **`apiFetch`** + session Bearer token pattern (Supabase browser client for **`access_token` only** — **no** direct Supabase table reads, **no** **`service_role`**). Dashboard nav shows **Admin** link only when **`user?.role === 'admin'`**. UI states: loading; success with aggregate stat sections (platform overview, tasks, focus, learning assets, Trello today metrics, system health); forbidden **“Admin access required”**; **`AUTH_REQUIRED`** → existing logout/redirect; generic API error + **Try again**; all-zero stats valid; manual **Refresh stats** (no polling). Renders **aggregate numbers and safe labels only** — **no** email, user IDs, user lists, content, plan JSON, flashcard Q/A, Trello card IDs, logs, raw JSON, or private row data.
**APIs affected:** frontend consumes existing **`GET /api/admin/stats`** only — **does not** call **`GET /api/admin/access-check`**, Gemini, Trello, or document-service
**Tests:** **`frontend/tests/unit/admin.service.test.js`**; **`frontend/package.json`** `test` script only (+admin service test). **`cd frontend && npm run lint`** passed (**0** errors, **2** pre-existing warnings); **`npm test`** **190/190** passed; **`npm run build`** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes**; Security Review **no blockers** — no critical or important issues
**Scope boundary:** Frontend route, guard, page, service, unit tests, **`frontend/package.json`** `test` script only — **no** backend, DB/migration/RLS, dependency, or **`package-lock`** changes
**Manual smoke:** **Passed** (2026-05-29) — admin **`/admin`** access and aggregate stat sections; **Admin** link for admin on **`/dashboard`** only; student no link + direct **`/admin`** → neutral **“Admin access required”**; network **`GET /api/admin/stats`** only (no direct Supabase stats reads); console clean (no token, **Authorization** header, or full response dump); **`/dashboard`** regression OK
**Known gaps (non-blocking):** **SEC-6A3-1** — silent refresh after admin demotion can leave previously loaded aggregate stats visible (backend still blocks new data); optional extract duplicated **`StatItem`** / **`StatSection`**; optional reduce layered loading UX
**Not implemented (intentional):** **`/admin/logs`**; user management; role management; **`api_logs`** / **`GET /api/admin/logs`**
**Follow-up:** Admin logs/user management remain deferred per PRD

### 2026-05-29 — Phase 7B DB docs status alignment complete

**Workflow:** Phase 7B — Database docs status alignment
**Summary:** Docs-only update. Updated `docs/database/001–004` status headers and “Applying this migration” sections to reflect applied migrations on Supabase. Aligned database docs with `docs/IMPLEMENTATION_STATUS.md` and AGENT_MEMORY apply records.
**APIs affected:** none
**Tests:** none (docs-only; no lint/test/build run per phase scope)
**Scope boundary:** `docs/database/001–004` + `docs/AGENT_MEMORY.md` only — no SQL, migrations, backend, frontend, tests, packages, or CI changed
**Reviews:** Security Review not required (docs-only)

### 2026-05-29 — Phase 7A Hardening audit complete

**Workflow:** Phase 7A — Hardening audit (read-only)
**Summary:** Read-only repository audit after Phases 6A-1 through 6A-3. Ran automated checks only — **`npm run lint`**, **`npm test`**, **`npm run build`** (frontend) — all green. **No files changed** during audit. Verdict: **Stable with notes** (non-blocking gaps documented in audit report; no code fixes in this phase).
**Scope boundary:** Audit only — no application code, SQL, migrations, packages, tests, or CI changed
**Reviews:** Security Review not required (read-only; no diff)

### 2026-05-29 — Phase 7C Markdown docs consistency update complete

**Workflow:** Phase 7C — Markdown docs consistency update
**Summary:** Docs-only alignment after Phases 6A, 7A, and 7B. Updated **`AGENTS.md`**, **`SECURITY.md`**, **`docs/PRD.md`**, **`DESIGN.md`**, **`docs/workflows/document-processing-workflow.md`**, **`SKILLS.md`**, **`docs/IMPLEMENTATION_STATUS.md`**, and supporting optional corrections to match current implementation through **6A-3**. Fixed stale “tasks/flashcards deferred”, admin deferred, dashboard stub, and document-processing workflow deferred wording.
**APIs affected:** none (documentation only)
**Tests:** none (docs-only; no lint/test/build run per phase scope)
**Scope boundary:** Allowed markdown docs only — **no** code, SQL, migrations, packages, package-lock, tests, or CI changed
**Reviews:** **Security Review required** — **`SECURITY.md`** trust-boundary documentation changed (admin aggregate stats exception). Supervisor Review required.
**Not changed:** ADRs, application code, database migrations, governance workflows

### 2026-05-29 — Phase 8A UI polish pass complete

**Workflow:** Phase 8A — UI/UX polish pass
**ADR refs:** none (presentation-only; no architecture change)
**Human gates:** `approved — implement Phase 8A`; Supervisor Review **approved with notes**; post-review cosmetic cleanup applied
**Summary:** Frontend-only UI/CSS/className/markup polish across auth, dashboard, courses, study materials, tasks, flashcards, Trello, focus, and admin — modern study-cockpit presentation per **`DESIGN.md`** v2 principles (warm canvas, card elevation, stat tiles, filter toolbars, focus timer panel, loading/error/empty states). **No** backend, API, DB/migration, package, **`package-lock`**, CI, or test-infra changes intended. **No** behavior, auth, data-fetching, or validation changes intended. Post–Supervisor Review fix: scoped admin heading suffix **`· Admin`** to **`page--admin-dashboard`** on **`AdminDashboardPage`** only (forbidden **`AdminRoute`** screen no longer shows **“Admin · Admin”**).
**APIs affected:** none
**Tests:** no test changes; **`cd frontend && npm run lint`** passed (**0** errors, **2** pre-existing warnings); **`npm test`** **190/190** passed; **`npm run build`** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes** — no critical or important issues; Security Review **not required** beyond lightweight spot-check judgment (auth/admin logic and sensitive boundaries unchanged)
**Manual smoke:** **Passed** — login/register, dashboard, courses, study material generate/plan/import, tasks, flashcards, Trello sync (credentials clear as before), focus timer/complete, admin stats for admin / student forbidden; console and network clean (no direct document-service/Gemini/Trello API from browser)
**Scope boundary:** **`frontend/src/styles/**`**, shared UI components, pages, and scoped feature components — docs unchanged except this memory entry
**Follow-up:** branch **`phase-8a-ui-polish`** ready for commit/push after final **`git status`** check

### 2026-05-30 — Phase 8B Post-UI docs & design-reference alignment (complete)

**Workflow:** Phase 8B — docs-only alignment after **2J**/**8A**
**Summary:** Updated **`README.md`**, **`DESIGN.md`**, **`STITCH_BRIEF.md`**, **`SCREENSHOT_INDEX.md`**, **`IMPLEMENTATION_STATUS.md`**, **`006-flashcards-schema-and-rls.md`** — stale pre-**2J**/pre-**8A** wording reconciled; **`STITCH_BRIEF`** reframed as historical/advisory; dashboard screenshot index corrected; **`DESIGN.md`** visual direction preserved. Post–Supervisor Review cleanup (**S1**–**S3**): **`DESIGN.md`** §6 LoadingState parenthetical aligned with §8.2; header metadata blank line; **`006-flashcards-schema-and-rls.md`** Field reasoning points to superseded/current-state note.
**Scope boundary:** Docs-only — **no** application code, screenshots, packages, CI, or SQL changed
**Reviews:** Supervisor Review **approved with notes** — no critical or important issues; Security Review **not required** (docs-only; **`SECURITY.md`** unchanged)
**Follow-up:** branch **`phase-8b-post-ui-docs-design-reference-alignment`** ready for commit/push after final **`git status`** check

### 2026-05-30 — Phase 8C-1 Global shell and design system complete

**Workflow:** Phase 8C-1 — Global shell and design system
**ADR refs:** 001 (frontend → Express backend only; modular monolith unchanged), 003 (no new validation surfaces)
**Human gates:** `approved — implement Phase 8C-1`; Supervisor Review **approved with notes** (no critical/important issues); lightweight Security spot-check **no blockers**; manual smoke **passed**
**Summary:** Frontend-only global shell and design-system pass. **`AppShell`** with sticky top bar (brand, main nav, logout) wraps authenticated routes via **`AuthenticatedPage`** (`ProtectedRoute` → **`AppShell`** → page content). Auth pages (**`/`**, **`/register`**) remain **outside** the shell. Design tokens and global layout/auth visual polish in **`frontend/src/styles/tokens.css`**, **`base.css`**, **`layout.css`**, **`components.css`**. **`PageHeader`** shared across workspace pages. **`/admin`** route structure unchanged: **`ProtectedRoute` → `AppShell` → `AdminRoute` → `AdminDashboardPage`**; student direct **`/admin`** still shows neutral **“Admin access required”** inside the shell. **Admin** nav link remains **UX-only** (`user?.role === 'admin'`); backend **`requireAuth` + `requireAdmin`** on **`GET /api/admin/stats`** unchanged.
**APIs affected:** none
**Tests:** no test changes; **`cd frontend && npm run lint`** passed (**0** errors, **2** pre-existing warnings); **`npm test`** **190/190** passed; **`npm run build`** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes**; Security spot-check **no blockers**
**Manual smoke:** **Passed** — shell/nav on authenticated routes; auth pages without shell; admin stats + student forbidden inside shell; long unbroken flashcard/plan text no longer overflows cards after CSS-only smoke fix
**Post-smoke fix (CSS only):** **`frontend/src/styles/components.css`**, **`frontend/src/styles/layout.css`** — `overflow-wrap: anywhere`, `word-break: break-word`, `min-width: 0` on card/study surfaces and shell content; **no** behavior, auth, API, or data-fetching changes
**Scope boundary:** **`frontend/**`** presentation only — **no** backend, document-service, Supabase, API, DB/migration, package, **`package-lock`**, or CI changes
**Follow-up:** branch **`phase-8c-1-global-shell-design-system`** ready for commit/push after final **`git status`** check

### 2026-05-30 — Phase 8C-2A Dashboard, Courses, and Course Detail UI upgrade complete

**Workflow:** Phase 8C-2A — Dashboard, Courses, and Course Detail UI upgrade
**ADR refs:** none (presentation-only; no architecture change)
**Human gates:** Supervisor Review **approved with notes** (no critical or important issues); Security Review **not required** (presentation-only); manual smoke **passed**
**Summary:** Frontend presentation-only upgrade for **`/dashboard`**, **`/courses`**, **`/courses/:id`**, **`CourseCard`**, **`MaterialCard`**, **`CourseTasksSection`** (markup/classes), **`TaskCard`** (optional **`className`** only), and scoped CSS in **`frontend/src/styles/layout.css`** + **`components.css`**. Dashboard uses cockpit-style grouping and refreshed stat presentation (**existing metrics only** — no charts, KPI hub, streaks, or invented stats). Courses list uses stronger workspace presentation and subject-style cards. Course detail uses workspace **`PageHeader`**, document-shelf presentation, material cards, and improved course task section styling. Danger zone and all primary actions (refresh stats, create course/material, save, delete, task filters/CRUD, Start Focus) remain visible and behaviorally unchanged.
**APIs affected:** none
**Tests:** no test changes; **`cd frontend && npm run lint`** passed (**0** errors, **2** pre-existing warnings); **`npm test`** **190/190** passed; **`npm run build`** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes**; Security Review **not required**
**Manual smoke:** **Passed** — dashboard stats load/refresh, empty CTA → **`/courses`**, per-course links → **`/courses/:id`**; courses list/create/cancel/open; course edit/save, create material → **`/study-materials/:id`**, materials list links, course tasks filters/create/edit/complete/delete/Start Focus, delete course with confirm; **375px** no horizontal scroll; console and network clean
**Scope boundary:** Nine frontend files only — **no** **`StudyMaterialDetail.jsx`**, **`GeneratedPlanSection.jsx`**, **`DbFlashcardsSection.jsx`**, **`FlashcardStudy.jsx`**, AI/generate/import/clear logic, backend/API/DB/package/CI/services/context, route/auth/data-fetching/validation changes. **No** **`dangerouslySetInnerHTML`**, **`service_role`**, direct Supabase table reads, or console logs/debug JSON.
**Not touched (intentional):** global **`/tasks`**, **`/flashcards`**, Trello, Focus, Admin redesign; **`PageHeader`** consumed from **8C-1** (component file unchanged in this phase)
**Follow-up:** **Phase 8C-2B** **not started** — should cover **`StudyMaterialDetail`** + Generated Plan / AI zones later. Branch **`phase-8c-2a-dashboard-courses-course-detail`** ready for commit/push after final **`git status`** check

### 2026-05-30 — Phase 8C-2B Study Material Detail and AI Zones UI upgrade complete

**Workflow:** Phase 8C-2B — Study Material Detail and AI Zones UI upgrade
**ADR refs:** none (presentation-only; no architecture change)
**Human gates:** Supervisor Review **approved with notes** (no critical or important issues); lightweight Security spot-check **no blockers**; manual smoke **passed**
**Summary:** Frontend presentation-only upgrade for **`/study-materials/:materialId`**, **`StudyMaterialDetail.jsx`**, **`GeneratedPlanSection.jsx`**, **`DbFlashcardsSection.jsx`**, **`FlashcardStudy.jsx`**, and scoped CSS in **`frontend/src/styles/layout.css`** + **`components.css`**. Study material detail has stronger workspace/**`PageHeader`**/editor presentation. Saved flashcards have clearer library/study visual separation. Generate AI panel has stronger visual treatment. Generated plan has premium read-only output styling. Import tasks/import flashcards/clear plan UI improved. Section order preserved: editor → saved flashcards → generate AI panel → generated plan → danger zone. **No** backend/API/DB/package/CI/services/context changes. **No** Dashboard/Courses/CourseDetail files touched. **No** behavior/auth/data-fetching/validation changes. Generate request body remains **`{}`**. Generated plan/material/flashcards render as React text nodes only — **no** **`dangerouslySetInnerHTML`**, raw JSON rendering, console logs/debug JSON, **`service_role`**, or direct Supabase/Gemini/document-service calls.
**APIs affected:** none
**Tests:** no test changes; **`cd frontend && npm run lint`** passed (**0** errors, **2** pre-existing warnings); **`npm test`** **190/190** passed; **`npm run build`** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes**; Security spot-check **no blockers**
**Manual smoke:** **Passed** — material editor, dirty state, generate body **`{}`**, plan display, import tasks, import flashcards, clear plan, saved flashcards CRUD/study, delete material, **375px** mobile, console/network clean
**Scope boundary:** Six frontend files only — **no** backend, document-service, Supabase, API, DB/migration, package, **`package-lock`**, or CI changes
**Security boundaries preserved:** generate remains backend-mediated with empty body; import/clear remain backend-mediated; auth/route protection unchanged
**Follow-up:** branch **`phase-8c-2b-study-material-ai-zones`** ready for commit/push after final **`git status`** check

### 2026-05-30 — Phase 8C-3A Tasks and Focus UI upgrade complete

**Workflow:** Phase 8C-3A — Tasks and Focus UI upgrade
**ADR refs:** none (presentation-only; no architecture change)
**Human gates:** Supervisor Review **approved with notes** (no critical or important issues); Security Review **not required** (presentation-only; no auth/Trello/Admin/security boundary touched); manual smoke **passed**
**Summary:** Frontend presentation-only upgrade for **`/tasks`**, **`/focus/:taskId`**, **`TasksPage.jsx`**, **`FocusPage.jsx`**, **`GlobalTasksSection.jsx`**, **`TaskCard.jsx`**, and scoped CSS in **`frontend/src/styles/layout.css`** + **`components.css`**. Tasks page has stronger workspace/**`PageHeader`** presentation. Global task list has improved section hierarchy, filter toolbar styling, task list spacing, and create area. Task cards have improved pending/completed styling, status/priority pills, and styled Start Focus link (**`Link`** target **`/focus/:taskId`** and navigation **`state`** unchanged). Focus page has stronger focus workspace, timer surface, task context block, and completion-state presentation. Focus timer/session logic unchanged. **No** Flashcards/Trello/Admin/backend/API/DB/package/CI/services/context/**`AppShell`**/routing/auth changes. **No** behavior/data-fetching/validation changes. **No** **`dangerouslySetInnerHTML`**, raw JSON rendering, console logs/debug JSON, **`service_role`**, or direct Supabase calls.
**APIs affected:** none
**Tests:** no test changes; **`cd frontend && npm run lint`** passed (**0** errors, **2** pre-existing warnings); **`npm test`** **190/190** passed; **`npm run build`** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes**; Security Review **not required**
**Manual smoke:** **Passed** — **`/tasks`** load; course/status filters; create/edit/complete/delete task; Start Focus → **`/focus/:taskId`** with correct task context/back navigation; timer start/countdown/complete session; mark task complete from focus flow; **375px** no horizontal scroll; task/focus actions usable; console and network clean
**Scope boundary:** Six frontend files only — **no** Flashcards/Trello/Admin, backend, document-service, Supabase, API, DB/migration, package, **`package-lock`**, or CI changes
**Follow-up:** branch **`phase-8c-3a-tasks-focus`** ready for commit/push after final **`git status`** check

### 2026-05-30 — Phase 8C-3B Flashcards UI upgrade complete

**Workflow:** Phase 8C-3B — Flashcards UI upgrade
**ADR refs:** none (presentation-only; no architecture change)
**Human gates:** Supervisor Review **approved with notes** (no critical or important issues); Security Review **not required** (presentation-only; no auth/Trello/Admin/security boundary touched); manual smoke **passed**
**Process note:** Implementation began before the exact phrase **`approved — implement Phase 8C-3B`**; Supervisor Review treated this as a **workflow deviation only** (diff stayed within approved planning scope; no commit/push before review). **Future phases must wait for exact implementation approval before coding.**
**Summary:** Frontend presentation-only upgrade for **`/flashcards`**, **`FlashcardsPage.jsx`**, **`GlobalFlashcardsSection.jsx`**, and scoped CSS in **`frontend/src/styles/layout.css`** + **`components.css`**. Flashcards page has stronger workspace/**`PageHeader`** presentation. Global flashcards section has clearer library/study/manage visual structure (filters, create/edit/delete, study mode, **`EmptyState`**, mobile presentation). **`FlashcardStudy.jsx`** unchanged (caller passes **`className="flashcard-study--library"`**). **No** **`StudyMaterialDetail.jsx`**, **`GeneratedPlanSection.jsx`**, **`DbFlashcardsSection.jsx`**, Tasks/Focus/Trello/Admin/backend/API/DB/package/CI/services/context/**`AppShell`**/routing/auth changes. **No** flashcards behavior/data-fetching/validation/API logic changes. **No** **`dangerouslySetInnerHTML`**, raw JSON rendering, console logs/debug JSON, **`service_role`**, or direct Supabase calls.
**APIs affected:** none
**Tests:** no test changes; **`cd frontend && npm run lint`** passed (**0** errors, **2** pre-existing warnings); **`npm test`** **190/190** passed; **`npm run build`** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes**; Security Review **not required**
**Manual smoke:** **Passed** — **`/flashcards`** load; course/material filters; create/edit/delete flashcard; study reveal/show answer; next/previous; global and filtered empty states; **375px** no horizontal scroll; filters/buttons usable; **`/study-materials/:id`** saved flashcards regression OK; console and network clean
**Scope boundary:** Four frontend files only — **no** backend, document-service, Supabase, API, DB/migration, package, **`package-lock`**, or CI changes
**Follow-up:** branch **`phase-8c-3b-flashcards`** ready for commit/push after final **`git status`** check

### 2026-05-30 — Phase 8C-3C Trello UI upgrade complete

**Workflow:** Phase 8C-3C — Trello UI upgrade
**ADR refs:** 004 (no Trello credential persistence), 005 (manual credential + list selection flow unchanged)
**Human gates:** Supervisor Review **approved with notes** (no critical or important issues); lightweight Security spot-check **no blockers**; manual smoke **passed** with valid Trello credentials
**Summary:** Frontend presentation-only upgrade for **`/trello`**, **`TrelloSyncPage.jsx`**, **`TrelloSyncSection.jsx`**, **`TrelloSyncForm.jsx`**, **`TrelloBoardListPicker.jsx`**, **`TrelloTaskSelector.jsx`**, **`TrelloSyncResults.jsx`**, and scoped CSS in **`frontend/src/styles/layout.css`** + **`components.css`**. Trello page has stronger integration-workspace presentation. Flow is visually organized into step-based sections: credentials/connect → board/list selection → task selection → sync → results. Trello-specific CSS migrated from **`frontend/src/index.css`** into **`layout.css`**/**`components.css`**; **`index.css`** remains imported but carries no active Trello styling (migration comment only). **No** backend/API/DB/package/CI/services/context changes. **No** Tasks/Focus/Flashcards/Dashboard/Courses/StudyMaterial/Admin files touched. **No** **`AppShell`**/routing/auth changes. **No** behavior/data-fetching/validation changes. Credential fields remain **`type="password"`**; **`autoComplete="off"`** unchanged. **No** **`localStorage`**/**`sessionStorage`** or credential persistence added. **No** direct **`api.trello.com`** browser calls — Trello operations remain backend-mediated through **`/api/trello/*`**. Sync payload shape unchanged: **`{ apiKey, token, listId, taskIds }`**. **No** **`dangerouslySetInnerHTML`**, raw JSON rendering, console logs/debug JSON, **`service_role`**, or direct Supabase calls. Credentials are not rendered in UI and not logged.
**APIs affected:** none
**Tests:** no test changes; **`cd frontend && npm run lint`** passed (**0** errors, **2** pre-existing warnings); **`npm test`** **190/190** passed; **`npm run build`** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes**; Security spot-check **no blockers**
**Manual smoke:** **Passed** — **`/trello`** load; credentials masked; Load boards; board/list selection; task selection; sync; results display; credentials clear after sync; no **`apiKey`**/**`token`** in **`localStorage`**/**`sessionStorage`**; network **`/api/trello/*`** only (no direct **`api.trello.com`**); **375px** mobile passed; quick regression on **`/tasks`**, **`/flashcards`**, **`/dashboard`** passed
**Scope boundary:** Nine frontend files only — **no** backend, document-service, Supabase, API, DB/migration, package, **`package-lock`**, or CI changes
**Security boundaries preserved:** credential rendering, in-memory-only storage, backend-mediated Trello calls, post-sync credential clearing unchanged
**Follow-up:** branch **`phase-8c-3c-trello-ui`** ready for commit/push after final **`git status`** check

### 2026-05-30 — Phase 8C-3D Admin UI upgrade complete

**Workflow:** Phase 8C-3D — Admin UI upgrade
**ADR refs:** none (presentation-only; no architecture change)
**Human gates:** Supervisor Review **approved with notes** after one important CSS scoping fix; Short Supervisor Verification **approved**; lightweight Security spot-check **no blockers**; manual smoke **passed**
**Summary:** Frontend presentation-only upgrade for **`/admin`**, **`AdminRoute.jsx`**, **`AdminDashboardPage.jsx`**, and scoped CSS in **`frontend/src/styles/layout.css`** only. Admin dashboard upgraded into a cockpit-style aggregate stats surface with clearer dashboard bands/cards. Refresh stats moved into **`PageHeader`** actions while preserving **`loadStats({ silent: true })`** behavior. **`AdminRoute`** forbidden/access-denied surface upgraded visually. Dashboard page title keeps the **` · Admin`** suffix only on **`.page--admin-dashboard`**; forbidden page title remains **“Admin”** only (not **“Admin · Admin”**) — **`.page--admin-forbidden`** no longer receives the **`h1::after`** suffix. **No** **`components.css`** or **`tokens.css`** changes. **No** **`App.jsx`**, **`AppShell`**, **`AuthContext`**, **`admin.service.js`**, backend/API/DB/package/CI/services/context, or non-admin page changes. **No** new admin metrics, charts, user list, logs viewer, role management, or endpoints. Aggregate stats remain aggregate-only — **no** user emails, IDs, names, content, logs, tokens, raw API response, or private data displayed. **No** raw JSON rendering, **`JSON.stringify(stats)`**, **`dangerouslySetInnerHTML`**, console logs/debug JSON, **`service_role`**, or direct Supabase reads.
**APIs affected:** none
**Tests:** no test changes; **`cd frontend && npm run lint`** passed (**0** errors, **2** pre-existing warnings); **`npm test`** **190/190** passed; **`npm run build`** passed; **`git diff --check`** clean
**Reviews:** Supervisor Review **approved with notes** (one important fix: forbidden **`h1`** suffix scoped to **`.page--admin-dashboard`** only); Short Supervisor Verification **approved**; Security spot-check **no blockers**
**Manual smoke:** **Passed** — admin **`/admin`** loads; aggregate stats visible only; Refresh stats works; **`GET /api/admin/stats`** appears only for admin; no raw JSON/private data; no console errors; student has no Admin link; student direct **`/admin`** shows forbidden card; student title is **Admin** only (not **Admin · Admin**); student direct **`/admin`** does not call **`/api/admin/stats`**; **375px** mobile passed; **`/dashboard`** regression passed; logout works
**Scope boundary:** Three frontend files only — **`AdminRoute.jsx`**, **`AdminDashboardPage.jsx`**, **`layout.css`** — **no** backend, document-service, Supabase, API, DB/migration, package, **`package-lock`**, or CI changes
**Security boundaries preserved:** **`AdminRoute`** **`user?.role !== 'admin'`** guard unchanged; **`AdminDashboardPage`** mounts only for admins; backend **`requireAuth` + `requireAdmin`** on **`GET /api/admin/stats`** remains authoritative; student direct **`/admin`** shows forbidden UI only and does not fetch admin stats
**Follow-up:** branch **`phase-8c-3d-admin-ui`** ready for commit/push after final **`git status`** check

### 2026-05-30 — Phase 9B Post-8C documentation and implementation-status alignment (complete)

**Workflow:** Phase 9B — docs-only alignment after **8C-3D**
**ADR refs:** none (docs-only; no architecture change)
**Human gates:** `approved — implement Phase 9B`
**Summary:** Docs-only update to align **`docs/IMPLEMENTATION_STATUS.md`**, **`docs/PRD.md`**, **`docs/AGENT_MEMORY.md`**, **`README.md`**, **`DESIGN.md`**, and **`docs/design/SCREENSHOT_INDEX.md`** with post-**8C** completed state. Added **Current state as of 2026-05-30** pointer; documented functional MVP through **6A-3**, hardening **7A**–**7C**, UI polish through **8C-3D** (**AppShell**, all workspace routes), backend modules, and unchanged deferred scope (admin logs/user management, Trello OAuth, course-level generate, PDF, real-time dashboard, spaced repetition, payments, deployment). **No** application code, packages, CI, migrations, or governance doc changes.
**APIs affected:** none
**Tests:** not run (docs-only phase)
**Reviews:** Supervisor Review required before merge; Security Review **not required** (no trust-boundary or security policy doc changes)
**Follow-up:** none — future agents should use **`docs/IMPLEMENTATION_STATUS.md`** as built-state source of truth

### 2026-05-30 — Phase 10C documentation and governance alignment (complete)

**Workflow:** Phase 10C — docs-only governance and operating-constraints alignment
**ADR refs:** none (docs-only; no architecture change)
**Human gates:** `approved — Phase 10C complete`
**Summary:** Docs-only phase documenting operating constraints and governance alignment across project docs. **Operating constraints recorded:** Free Tier / minimal-cost assumption; no paid APIs, services, subscriptions, or storage tiers without explicit human approval; Gemini quota / 429 guidance in document-processing workflow; no retry loops or automatic Gemini calls without approval; PDF upload remains deferred (storage, parsing, security, cost complexity); planning approval is not implementation approval; one focused scope per branch/PR; update only relevant Markdown docs after phases (not every doc on every phase).
**Files updated:** **`docs/IMPLEMENTATION_STATUS.md`**, **`docs/workflows/document-processing-workflow.md`**, **`CONTRIBUTING.md`**, **`.claude/agents/documentation-agent.md`**, **`README.md`**, **`AGENTS.md`**, **`CLAUDE.md`**, **`docs/AGENT_MEMORY.md`** (this entry).
**APIs affected:** none
**Tests:** not run (docs-only phase)
**Reviews:** Supervisor Review required before merge; Security Review **not required** (governance/process docs only; no trust-boundary code changes)
**Follow-up:** none — agents should treat **`docs/IMPLEMENTATION_STATUS.md`** operating-constraints section and aligned governance docs as authoritative for cost, Gemini discipline, approval gates, and doc-update scope

### 2026-05-30 — Phase 10B plan-sourced import dedupe complete

**Workflow:** Phase 10B — plan-sourced import deduplication for AI-generated tasks and flashcards
**ADR refs:** 001 (modular monolith), 003 (Zod validation on import bodies)
**Human gates:** `approved — Phase 10B complete`
**Summary:** Material-scoped plan import with server-set **`source='plan'`** and dedupe for tasks and flashcards. Migration **`009_plan_source_import_dedupe.sql`** **applied manually** on Supabase. Backend import routes: **`POST /api/study-materials/:materialId/import/tasks`**, **`POST /api/study-materials/:materialId/import/flashcards`** — **`requireAuth`**, ownership via **`getOwnedMaterialOrThrow`**, **`course_id`** from owned material; strict Zod bodies reject client **`source`**, **`userId`**, **`courseId`**, **`materialId`**. Dedupe queries and partial unique indexes scope to same **`user_id`**, same **`material_id`**, **`source='plan'`** only (normalized **`lower(trim(...))`**). Manual create remains **`source='manual'`**; manual duplicates still allowed. Frontend material detail calls import endpoints via **`study-materials.service.js`** (not sequential create). **No** Gemini/document-service/Trello/PDF/plan-history/admin-logs/deployment/CI/package dependency changes.
**APIs affected:** **`POST /api/study-materials/:materialId/import/tasks`**, **`POST /api/study-materials/:materialId/import/flashcards`**
**Tests:** backend **`320/320`** passed; frontend lint/test/build passed (**`190/190`**, build pass)
**Reviews:** Security Review **passed**; Supervisor Review pending
**Manual smoke:** **Passed** — first import creates rows; re-import skips duplicates; no duplicate rows on re-import; manual task/flashcard create still works; dashboard counts increase only on first import
**Pitfalls:** Do not trust client for **`source`** or ownership fields; dedupe is **`plan`** + material-scoped only — not global across manual rows or other materials
**Follow-up:** none

### 2026-05-30 — Phase 11A-1 generated plan active history complete

**Workflow:** Phase 11A-1 — generated plan history DB/backend active compatibility
**ADR refs:** 001 (modular monolith), 003 (Zod before DB write)
**Human gates:** `approved — Phase 11A-1 complete`
**Summary:** Evolved **`public.material_generated_plans`** from one row per material to multiple historical rows with exactly one **`is_active`** row per **`study_material_id`**. Migration **`010_material_generated_plans_active_history.sql`** **applied manually** on Supabase. Generate inserts a new active version via atomic RPC **`activate_material_generated_plan`** (service role only) after Zod validation; prior active row becomes inactive; retention cap **10** rows per material (active + inactive) — prune deletes oldest **inactive** only. **`GET` / `DELETE` …/generated-plan** operate on **active** row only; optional additive **`planId`** on GET. Dashboard/admin **`totalGeneratedPlans`** count **active** rows only. Frontend unchanged (no history UI; no version list/get-by-id/activate/delete-version endpoints). **No** document-service/Gemini prompt/Trello/PDF/admin logs/packages/CI changes.
**APIs affected:** same routes — **`POST /api/study-materials/:materialId/generate`**, **`GET` / `DELETE` …/generated-plan** (behavior refined); **`GET /api/dashboard/stats`**, **`GET /api/admin/stats`** (count semantics)
**Tests:** backend tests passed; frontend lint/test/build passed
**Reviews:** Security Review **passed**; Supervisor Review pending
**Manual smoke:** **Passed** after migration **010** apply — generate creates new active version; GET returns active only; DELETE removes active only; inactive history retained until prune; dashboard/admin counts reflect active rows only
**Pitfalls:** Do not expose RPC to clients; do not skip ownership check before RPC; invalid Gemini output must not reach persistence or retention
**Follow-up:** optional RLS SELECT hardening for inactive rows (Security Review note, non-blocking); plan history **UI** (Phase **11A-3**) remains deferred; version REST APIs shipped in **11A-2**

### 2026-05-30 — Phase 11A-2 generated plan history REST API complete

**Workflow:** Phase 11A-2 — generated plan history backend REST API
**ADR refs:** 001 (modular monolith), 003 (Zod validation on plan read/activate response)
**Human gates:** `approved — Phase 11A-2 complete` (docs cleanup pending Supervisor Review)
**Summary:** Backend Generated Plan History API for **`material_generated_plans`**. Migration **`011_reactivate_material_generated_plan.sql`** **applied manually** on Supabase **2026-05-30**. RPC **`reactivate_material_generated_plan(p_study_material_id, p_course_id, p_plan_id)`** — **`SECURITY DEFINER`**, `search_path = public`, **`EXECUTE`** for **`service_role`** only; ROW_COUNT hardening after target activation update (Security Review passed after hardening). **Routes:** **`GET /api/study-materials/:materialId/generated-plans`** (metadata only — no plan JSON); **`GET …/generated-plans/:planId`** (full plan for owned material + matching planId); **`POST …/generated-plans/:planId/activate`** (body **`{}` strict** — no Gemini/document-service, no insert, no retention prune; returns full plan); **`DELETE …/generated-plans/:planId`** (inactive only — active delete → **409**; response `{ deleted, planId }`). **`GET …/generated-plan`** backward compatible (active only). **No** frontend history UI (**11A-3** deferred); **no** document-service/Gemini/Trello/PDF/admin-logs/packages/CI changes.
**APIs affected:** **`GET /api/study-materials/:materialId/generated-plans`**, **`GET …/generated-plans/:planId`**, **`POST …/generated-plans/:planId/activate`**, **`DELETE …/generated-plans/:planId`**
**Tests:** backend **`341/341`** passed; frontend lint/test/build passed earlier — no frontend files changed in 11A-2
**Reviews:** Security Review **passed** (after RPC ROW_COUNT hardening); Supervisor Review pending
**Manual smoke:** **Passed** — list history works; list metadata only (no plan JSON); get-by-id works; activate inactive works; activate response includes plan; exactly one active after activate; old **`GET …/generated-plan`** returns current active; delete inactive works; delete active returns **409**
**Pitfalls:** Do not expose RPC to clients; activate must not call Gemini or run retention; list endpoint must not return plan JSON; delete active must return **409**
**Follow-up:** Phase **11A-3** frontend history UI (deferred); optional RLS SELECT hardening for inactive rows (non-blocking)

### 2026-05-30 — Phase 11A-3 generated plan history UI complete

**Workflow:** Phase 11A-3 — frontend Generated Plan History UI
**ADR refs:** 001 (modular monolith — frontend consumes backend only), 003 (display validated plan from backend responses)
**Human gates:** `approved — Phase 11A-3 complete` (docs-only update)
**Summary:** Frontend-only Generated Plan History UI on **`/study-materials/:materialId`**. Consumes Phase **11A-2** REST APIs only — **no** backend, migration, document-service, Gemini, Trello, PDF, admin, or package changes. **`GeneratedPlanHistorySection`** — metadata-only history list (**`listGeneratedPlans`**); **Active** badge on active row; **Previous version** on inactive rows; version heading with Saved/Created metadata; lazy **Preview** for inactive plans only (**`getGeneratedPlanById`** — no bulk full-plan fetch); **Make active** / Restore for inactive via **`activateGeneratedPlan`** (body **`{}` strict** — no Gemini/document-service); **Delete** inactive with confirm (**`deleteGeneratedPlanVersion`**). Active row has no Preview / Make active / Delete. Activate response updates main **Generated study plan** section; history refreshes after generate, clear, activate, and delete. Generate, Clear, Import tasks, and Import flashcards flows preserved. Plain React text rendering only; **no** `localStorage` / `sessionStorage` for history/plans; **no** polling.
**APIs affected:** none (frontend consumes existing **`GET …/generated-plans`**, **`GET …/generated-plans/:planId`**, **`POST …/generated-plans/:planId/activate`**, **`DELETE …/generated-plans/:planId`**)
**Tests:** frontend lint passed; **`205/205`** passed; build passed. Backend tests not re-run (backend untouched).
**Reviews:** Supervisor Review **passed**; Security Review **passed**; UI clarity fix **passed**
**Manual smoke:** **Passed** — plan history section; Active / Previous version badges; version heading; Make active on one line; Preview inactive; Restore inactive; active plan section updates after restore; exactly one active after restore; delete inactive with confirm; Generate / Clear / Import tasks / Import flashcards still work; console clean; no unexpected Gemini/document-service browser calls
**Pitfalls:** Do not fetch full plan JSON for every history row on list load; restore must use activate endpoint only (not generate); active row must not expose delete or re-activate actions
**Follow-up:** optional polish or a new separate phase — not automatically started; optional RLS SELECT hardening for inactive rows (non-blocking, from **11A-2**)

### 2026-06-01 — Phase A DESIGN.md alignment (docs only)

**Workflow:** Phase A — DESIGN.md alignment
**ADR refs:** none (documentation only)
**Human gates:** Phase A documentation gate (awaiting Supervisor Review before visual implementation)
**Summary:** Updated **`DESIGN.md`** to codify approved hybrid visual direction (NotebookLM-style source workspace + Linear/Raycast AI command center; Cursor sidecar; Claude-style durable artifacts). Added design references (§3), layout modes including cockpit and Source|AI split (§4), component families (§6), AI workspace rules including bounded plan history (§8), resolved contradictions (history in scope, `tokens.css` authority, outdated screenshots). Short authority notes in **`STITCH_BRIEF.md`** and **`SCREENSHOT_INDEX.md`**. **No** frontend, backend, CSS, React, database, or package changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not implement visual changes until Supervisor approves Phase A and a separate implementation gate is issued
**Follow-up:** Supervisor Review → optional Visual Design Direction implementation phases (B–E per planning reports)

### 2026-06-01 — Phase A enjoyable-product clarification (docs only)

**Workflow:** Phase A — DESIGN.md addendum
**Summary:** Clarified official direction: modern **enjoyable** AI study command center (not dry/CRUD); target audience (stressed, overloaded students); design balance (trust, clarity, motivation, delight, focus); explicit **fun is / fun is not** table (delight without gamification); tone and motion guidance for micro-delight on success paths. **No** code changes.
**APIs affected:** none

### 2026-06-01 — Phase 12A-1 study material cockpit layout complete

**Workflow:** Phase 12A-1 — study material detail cockpit layout (frontend/CSS)
**ADR refs:** 001 (modular monolith — frontend consumes backend only), 003 (display validated plan from backend responses)
**Commit:** **`00a76de`** — `feat: add study material cockpit layout`
**Prerequisite docs:** Phase A **`dedb35c`** — `docs: align StudyOps AI design direction` (**`DESIGN.md`** Source | AI cockpit direction before this frontend commit)
**Summary:** Presentation-only frontend/CSS upgrade on **`/study-materials/:materialId`** (**`StudyMaterialDetail.jsx`** and related material components). Material detail uses a **cockpit** layout with **Source | AI** split at **`≥1024px`**: source column (editor/metadata) and AI column (generate panel, active generated plan, plan history). Flashcards library and danger zone remain **below** the cockpit band. Scoped styles in **`layout.css`**, **`components.css`**, **`tokens.css`** (`--content-max-cockpit`, `--color-danger-border`, `--color-success-border`). **No** behavior, API, routing, auth, or data-fetching changes intended. **Phase B** (global visual direction rollout) **not started**.
**Files:** `frontend/src/pages/StudyMaterialDetail.jsx`; `frontend/src/components/materials/GeneratedPlanSection.jsx`; `frontend/src/components/materials/GeneratedPlanHistorySection.jsx`; `frontend/src/components/materials/DbFlashcardsSection.jsx`; `frontend/src/styles/layout.css`; `frontend/src/styles/components.css`; `frontend/src/styles/tokens.css`
**APIs affected:** none
**Tests:** **`npm run build`** passed before commit; frontend tests not re-run in this phase gate (frontend-only presentation)
**Pitfalls:** Do not treat this as Phase B; do not change backend/history APIs; preserve generate/clear/import/history restore flows; cockpit AI column action stacking applies at **`≥1024px`** and **`≤640px`** only
**Follow-up:** Supervisor Review; optional manual smoke on material detail; push branch; Phase B remains separately gated

### 2026-06-01 — Phase B1 global tokens and typography rhythm complete

**Workflow:** Phase B1 — global design tokens and typography rhythm (CSS-only)
**ADR refs:** none (presentation layer; aligns with **`DESIGN.md`** token authority from Phase A)
**Commit:** **`ccca764`** — `style: add global tokens and typography rhythm`
**Prerequisite docs:** Phase A **`dedb35c`**; Phase **12A-1** **`00a76de`** (material-detail cockpit preceded global token rollout)
**Summary:** CSS-only global visual foundation. Global design tokens and typography rhythm; tabular number utility; semantic **warning**, **focus**, **AI**, and **on-primary** tokens; hardcoded global CSS values migrated toward tokens. Touched only **`tokens.css`**, **`base.css`**, **`layout.css`**, **`components.css`**. **No** React/JSX, backend, API, database, or package changes. **B2** (AppShell + PageHeader + cockpit layout width), **B3**, and **B4** **not started**.
**Files:** `frontend/src/styles/tokens.css`; `frontend/src/styles/base.css`; `frontend/src/styles/layout.css`; `frontend/src/styles/components.css`
**APIs affected:** none
**Tests:** **`npm run lint`** passed; **`npm test`** **205/205**; **`npm run build`** passed
**Pitfalls:** Do not treat B1 as B2; do not change AppShell/PageHeader/cockpit width without a separate B2 gate; preserve existing component behavior and routes
**Follow-up:** **B2** — AppShell + PageHeader + cockpit layout width — pending separate human approval; **B3** and **B4** not started

### 2026-06-01 — Phase B2 AppShell, PageHeader, and cockpit layout width complete

**Workflow:** Phase B2 — AppShell, PageHeader, and cockpit layout width (presentation-only)
**ADR refs:** none (presentation layer; aligns with **`DESIGN.md`** v2.1 §4.2–4.3 layout modes)
**Commit:** **`f2de33f`** — `style: polish shell headers and cockpit widths`
**Prerequisite docs:** Phase A **`dedb35c`**; Phase **12A-1** **`00a76de`**; Phase **B1** **`ccca764`**
**Summary:** Presentation-only frontend/layout polish. **AppShell:** visual polish in **`layout.css`** (active nav accent, focus-visible, responsive shell inner alignment). **PageHeader:** intro-mode grid layout (title/lead/note vs actions), mobile stack reset, scoped lead/note spacing. **Cockpit width:** main hub pages moved **`page--workspace`** → **`page--cockpit`** (`--content-max-cockpit` per **`DESIGN.md`**) on **`/dashboard`**, **`/courses`**, **`/courses/:id`**, **`/tasks`**, **`/flashcards`**, **`/trello`**, **`/admin`**, **`/focus/:taskId`**. **No** backend, API, database, or package changes. **No** new routes, features, sidebar, chat UI, or mobile-native UI. **`AppShell.jsx`** and **`PageHeader.jsx`** unchanged. **`StudyMaterialDetail.jsx`** unchanged (already cockpit; global PageHeader CSS applies). **B3** (cards, controls, badges, filters) and **B4** **not started**.
**Files:** `frontend/src/styles/layout.css`; `frontend/src/pages/DashboardStub.jsx`; `frontend/src/pages/CoursesList.jsx`; `frontend/src/pages/CourseDetail.jsx`; `frontend/src/pages/TasksPage.jsx`; `frontend/src/pages/FlashcardsPage.jsx`; `frontend/src/pages/TrelloSyncPage.jsx`; `frontend/src/pages/AdminDashboardPage.jsx`; `frontend/src/pages/FocusPage.jsx`
**APIs affected:** none
**Tests:** **`npm run lint`** passed; **`npm test`** **205/205**; **`npm run build`** passed
**Reviews:** Supervisor Review **Approved with notes**; Security Review **Approved**
**Pitfalls:** Do not treat B2 as B3/B4; do not change card hover policy, badge/filter system, button system, route transitions, skeletons, or empty/loading/error redesign without separate gates; **`AdminRoute`** forbidden view still **`page--workspace`** (cosmetic only)
**Follow-up:** **B3** — Card, controls, badges, and filters system — pending separate human approval; **B4** not started

### 2026-06-01 — Phase B3 cards, controls, badges, and filters complete

**Workflow:** Phase B3 — cards, controls, badges, and filters (presentation-only)
**ADR refs:** none (presentation layer; aligns with **`DESIGN.md`** card and control patterns)
**Commit:** **`e865c09`** — `style: polish cards controls badges and filters`
**Prerequisite docs:** Phase A **`dedb35c`**; Phase **12A-1** **`00a76de`**; Phase **B1** **`ccca764`**; Phase **B2** **`f2de33f`**
**Summary:** Presentation-only card and control polish. **Card hover policy:** hover elevation limited to **`source-card--navigable`** (added className-only on **`CourseCard`**, **`MaterialCard`**, dashboard per-course cards); **`TaskCard`** unchanged — task/completed cards explicitly suppress lift. **Static tiles:** dashboard stat cards no longer elevate on hover. **Read-only surfaces:** plan output, plan history, and plan form cards excluded from “editable” hover border treatment. **Badges/pills:** shared base styles for **`source-card__pill`**, **`plan-task-item__badge`**, **`plan-history__badge`**, **`trello-sync-results__status`**. **Segmented filters:** scoped toolbar segment styling in **`layout.css`**. **Buttons:** danger **`focus-visible`**, link-button active scale; **`.btn:disabled`** / **`.link-btn--disabled`** unchanged. **No** backend, API, database, package, auth, routing, service, or data-fetching changes. **No** filter logic, ownership logic, Trello credential behavior, or admin gating changes. **No** new routes, features, sidebar, chat UI, mobile-native UI, charts, or gamification. **B4** **not started**.
**Files:** `frontend/src/components/courses/CourseCard.jsx`; `frontend/src/components/materials/MaterialCard.jsx`; `frontend/src/pages/DashboardStub.jsx`; `frontend/src/styles/components.css`; `frontend/src/styles/layout.css`
**APIs affected:** none
**Tests:** **`npm run lint`** passed; **`npm test`** **205/205**; **`npm run build`** passed
**Reviews:** Supervisor Review **Approved with notes**; Security Review **Approved**
**Pitfalls:** Do not treat B3 as B4; do not change **`TaskCard.jsx`** / **`Button.jsx`** behavior without a separate gate; preserve navigable vs task hover split; do not commit **`frontend/dist/`** build artifacts
**Follow-up:** Before **B4**, discuss **Visual Direction Breakout** / Base44 design inspiration — current **`DESIGN.md`** and token direction may still be too calm/basic; **B4** pending separate human approval

### 2026-06-01 — Phase BX-1 DESIGN.md direction delta complete (docs only)

**Workflow:** Phase BX-1 — DESIGN.md direction delta (documentation only)
**ADR refs:** none (documentation only)
**Commit:** **`303dc4b`** — `docs: update design direction for ai study cockpit`
**Prerequisite docs:** Phase A **`dedb35c`**; Phase **BX-0** **`docs/design/PROTOTYPE_REFERENCES.md`** (Canvas/prototype reference — not in this commit); Phases **B1** **`ccca764`**, **B2** **`f2de33f`**, **B3** **`e865c09`** (presentation baseline unchanged by BX-1)
**Summary:** Updated **`DESIGN.md` v2.1 → v2.2** to codify approved visual direction from BX-1 planning + prototype references. **Identity:** StudyOps AI as a **modern AI study command center** (not CRUD/admin/BI). **Dashboard:** lead with **“What should I study next?”** (next-up hero); **study pulse** charts secondary; compact stat bands tertiary; move away from stat-grid-first layout. **Data visualization:** charts only for **real student decisions**; **honest API-backed** data; **no** fake KPIs, decorative sparklines, random placeholder production data, or chart npm libraries without separate approval; missing API fields labeled **future API / deferred**. **Courses:** accent identity, active vs quiet states, plan coverage only when computable. **Material detail:** stronger **Source | AI** cockpit; **AI command panel** as first-class surface (generate → plan artifact → history → imports → plan flashcard study). **Boundaries:** Canvas/prototype remain **inspiration only** — never copy into **`frontend/src`**. **No** implementation files changed.
**Files:** **`DESIGN.md`** only
**APIs affected:** none
**Tests:** none (docs-only)
**Implementation:** **none** — **no** `frontend/src`, **`tokens.css`**, backend, database, package, or chart implementation
**B4:** **not started** — BX-1 does not authorize B4 or dashboard/course visual implementation in code
**Pitfalls:** Do not implement dashboard charts, course accents, or hero layout from **`DESIGN.md` v2.2** without a separate implementation gate; do not add chart libraries or dashboard API fields under BX-1; do not copy Canvas `.canvas.tsx` into production
**Follow-up:** Human chooses — (1) external design pass (Base44 / Lovable / Stitch) using **`DESIGN.md` v2.2** + **`PROTOTYPE_REFERENCES.md`**, or (2) **BX-2 / BX-3** implementation planning and gated build of dashboard/course/material presentation per v2.2

### 2026-06-01 — Phase BX-S selected Stitch visual direction archived (docs only)

**Workflow:** Phase BX-S — selected Stitch visual direction (documentation only)
**ADR refs:** none (documentation only)
**Commit:** **`2b4a881`** — `docs: archive selected stitch visual direction`
**Prerequisite docs:** Phase A **`dedb35c`**; Phase **BX-1** **`303dc4b`** (`DESIGN.md` v2.2); Phases **B1** **`ccca764`**, **B2** **`f2de33f`**, **B3** **`e865c09`** (presentation baseline unchanged by BX-S)
**Summary:** Archived user-selected **Stitch** as the preferred **external visual reference** for StudyOps AI. Target feel: darker, bolder **AI study command center** — deep slate/graphite app shell; electric blue/violet/cyan accents; frosted glass cards; bold **“What should I study next?”** dashboard hierarchy; useful study charts and progress visuals (subject to honest-data rules at implementation); per-course accent identity; strong **Source | AI** material cockpit; modern SaaS polish; move away from beige/indigo calm UI and generic CRUD/admin-panel tone. **Stitch is reference only** — never copy Stitch-generated code into **`frontend/src`**. **Not authorized by BX-S:** dark theme in production, sidebar/shell redesign, chart libraries or dashboard chart UI, **`tokens.css`** edits, or any frontend/backend/package changes.
**Archived files:** **`docs/design/STITCH_SELECTED_REFERENCE.md`**; **`docs/design/STITCH_VISUAL_STYLE_GUIDE.md`**; **`docs/design/screenshots/stitch-01-dashboard.png`**; **`docs/design/screenshots/stitch-02-courses.png`**; **`docs/design/screenshots/stitch-03-material-cockpit.png`**
**Files changed in commit:** BX-S archive paths above only — **`DESIGN.md`**, **`frontend/src`**, **`tokens.css`**, backend, database, and packages **unchanged**
**APIs affected:** none
**Tests:** none (docs-only)
**Implementation:** **none** — **no** `frontend/src`, **`tokens.css`**, backend, database, package, dark theme, sidebar, or chart implementation
**B4:** **not started** — BX-S does not authorize B4 or Stitch-aligned UI in code
**Pitfalls:** Do not treat Stitch screenshots or style guide as shipped UI; do not paste Stitch HTML/React into **`frontend/src`**; Stitch reference uses sidebar shell — current app uses top-nav **`AppShell`** until separately approved; do not implement charts without honest API-backed data and separate gates; do not edit **`DESIGN.md`** or **`tokens.css`** under BX-S scope
**Follow-up:** **Planning only** next — translate Stitch direction into **`DESIGN.md`**, **`tokens.css`**, and separately approved frontend phases; **do not** jump directly into implementation

### 2026-06-02 — Phase DOCS-A3 documentation alignment complete

**Workflow:** Phase DOCS-A3 — documentation alignment after DOCS-A2 audit (documentation only)
**ADR refs:** none
**Summary:** Closed DOCS-A2 **Important** gaps without application changes. **`docs/IMPLEMENTATION_STATUS.md`:** updated **Last aligned** to DOCS-A3; added shipped sections for **12A-1** (material Source | AI cockpit), **B1** (global tokens), **B2** (shell/cockpit width), **B3** (cards/badges/filters); extended UI polish table through **B3**; clarified warm **`tokens.css`** vs BX-I1 docs-only direction; env table additions (`SUPABASE_ANON_KEY`, `GEMINI_MODEL`); **3B-b** `source` footnote for migration **009**; frontend routes and deferred list updates; current test totals footnote (backend **341**, frontend **205**, document-service **43**). **`docs/CURRENT_STATE.md`:** DOCS-A1/A2/A3 phase table; Supervisor Review gate on DOCS-A3; forbidden-assumption rows. **`docs/AGENT_MEMORY.md`:** executive summary cross-reference fix.
**Files:** **`docs/IMPLEMENTATION_STATUS.md`**, **`docs/CURRENT_STATE.md`**, **`docs/AGENT_MEMORY.md`**
**APIs affected:** none
**Tests:** none (docs-only); verified counts unchanged from DOCS-A2 audit
**Implementation:** **none** — **no** `frontend/src`, **`tokens.css`**, backend, database, or package changes
**Pitfalls:** Do not treat DOCS-A3 doc sync as BX-I1/B4/BX-I2 implement approval; PRD §9 data model and AGENTS built-summary drift remain **Tier 2** (optional, explicit human approval)
**Follow-up:** Supervisor Review of DOCS-A3; optional Tier 2 PRD/governance refresh if human approves expanded scope

### 2026-06-01 — Phase BX-I1 Stitch visual direction codified in DESIGN.md (docs only)

**Workflow:** Phase BX-I1 — Stitch visual delta in `DESIGN.md` (documentation only)
**ADR refs:** none (documentation only)
**Commit:** **`6041932`** — `docs: align design with stitch visual direction`
**Prerequisite docs:** Phase **BX-S** **`2b4a881`**; Phase **BX-1** **`303dc4b`** (`DESIGN.md` v2.2); Phases **B1**–**B3** (presentation baseline unchanged by BX-I1)
**Summary:** Updated **`DESIGN.md` v2.2 → v2.3** to align the product presentation spec with the **selected Stitch visual direction** (BX-S reference). Codified **accessible dark graphite / glass** command-center presentation; **electric blue** primary, **violet** AI/command, **cyan** data semantic roles; **course accent** palette; **dashboard as decision hub** (“What should I study next?”); stronger **Source | AI** cockpit and **AI command panel** emphasis. **Top navigation remains MVP** — Stitch sidebar is **reference-only**; sidebar shell migration requires a **separate approved shell phase**. **Supervisor Review:** Approved with notes.
**Files changed in commit:** **`DESIGN.md`** only — **`frontend/src`**, **`tokens.css`**, backend, database, packages **unchanged**
**APIs affected:** none
**Tests:** none (docs-only)
**Implementation:** **none** — BX-I1 does **not** approve **`tokens.css`** edits, frontend/CSS implementation, charts, fonts/packages/CDN, backend/API changes, sidebar implementation, or **B4**
**B4:** **not started** — BX-I1 does not authorize B4 or Stitch-aligned UI in code
**Pitfalls:** Do not treat **`DESIGN.md` v2.3** as approval for BX-I2, dark theme in production, sidebar, charts, or fonts/packages; do not paste Stitch HTML/React into **`frontend/src`**; production UI still uses warm **`tokens.css`** until BX-I2+
**Follow-up:** **Planning/approval for BX-I2** — `tokens.css` dark/glass token system; **do not** jump directly to frontend implementation; **do not** start **B4**

### 2026-06-02 — Phase BX-I2 dark glass token foundation complete (CSS only)

**Workflow:** Phase BX-I2 — dark graphite / glass global token foundation (CSS only)
**ADR refs:** none (presentation only)
**Commit:** **`03ee9df`** — `style: add dark glass token foundation`
**Prerequisite:** Phase **BX-I1** **`6041932`** (`DESIGN.md` v2.3); Phases **B1**–**B3** (presentation baseline)
**Summary:** Replaced warm canvas token values with dark graphite / glass foundation in **`tokens.css`**, **`components.css`**, **`layout.css`** only. Electric blue primary, violet AI accent, cyan data accent, dark-friendly semantic states, source editor surface, chart/course accent token values (not wired into UI). **Filled-button contrast fix:** `--color-primary-fill`, `--color-primary-fill-hover`, `--color-danger-fill`, `--color-danger-fill-hover` for WCAG AA on `.btn--primary` / `.btn--danger`; semantic `--color-primary` / `--color-danger` unchanged for links, borders, alerts, AI surfaces. **Supervisor Review:** Approved with notes. **Security Review:** Approved with limitation — authenticated-route visual smoke not fully completed (no valid local test account).
**Files changed in commit:** **`frontend/src/styles/tokens.css`**, **`components.css`**, **`layout.css`** only — **no** JSX/React, backend, database, package, or docs changes
**APIs affected:** none
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**205/205**); `npm run build` passed
**Implementation:** CSS-only token foundation — **does not** authorize sidebar, dashboard hero, charts, course accent wiring, material cockpit structure redesign, **BX-I3** / **BX-I4** / **BX-I5**, or **B4**
**Pitfalls:** Do not treat BX-I2 as approval for BX-I3+ or B4; do not wire chart/course accent tokens without separate phase; authenticated visual QA still pending
**Follow-up:** Authenticated visual QA when a test account exists (dashboard, courses, material detail / AI panel / plan history / disclaimer, Trello, admin forbidden vs admin dashboard, keyboard focus-visible on authenticated shell); plan **BX-I3** / **BX-I4** / **BX-I5** / **B4** separately with explicit implement approval

### 2026-06-02 — Phase BX-I3 dashboard decision layout complete (frontend only)

**Workflow:** Phase BX-I3 — dashboard **“What should I study next?”** decision layout (frontend only)
**ADR refs:** none (presentation + client-side rule logic only)
**Commit:** **`bdd6f2a`** — `feat: add dashboard next-up recommendation`
**Prerequisite:** Phase **BX-I2** **`03ee9df`** (dark glass tokens); Phases **5C** / **5C.1** (dashboard stats UI + refresh); Phases **B1**–**B3** (presentation baseline)
**Summary:** Decision-first dashboard layout on **`/dashboard`**. **Rule-based** next-up recommendation via **`deriveDashboardRecommendation`** in **`dashboard-recommendation.js`** — **not** AI-based; uses existing **`GET /api/dashboard/stats`** data only. Hero **“What should I study next?”** with honest context copy (*“Based on your pending tasks and active study plans.”*). Study pulse / task progress bars from pending and completed counts only. Enhanced course workload rows with derived pending counts. Prior stat bands moved to secondary **At a glance** section. **No fake metrics:** no fake AI priority, deadlines/due-soon, weekly focus chart, streaks, health score, next exam/deadline, or specific task/material title. **Supervisor Review:** Approved with notes. **Security / Trust Review:** Approved with limitation — authenticated dashboard manual smoke not fully completed (no approved valid local test account).
**Files changed in commit:** **`frontend/src/pages/DashboardStub.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/utils/dashboard-recommendation.js`**, **`frontend/tests/unit/dashboard-format.test.js`** only — **no** backend, database, package, **`AppShell`**, route, service, or context changes; **no** docs changes in implementation commit
**APIs affected:** none (consumes existing **`GET /api/dashboard/stats`** only)
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**219/219**, including **14** recommendation unit tests); `npm run build` passed
**Implementation:** Dashboard decision layout only — **does not** authorize chart library/UI, sidebar shell, course accent wiring, material cockpit structure redesign, backend/API extension, **BX-I4** / **BX-I5** / **BX-I6**, or **B4**
**Pitfalls:** Do not treat BX-I3 as approval for BX-I4+ or B4; do not describe recommendation as AI-based; do not add fake deadline/streak/health metrics without a gated phase; authenticated dashboard visual QA still pending
**Follow-up:** Authenticated dashboard visual QA when a test account exists (dashboard with data, empty dashboard if possible, hero primary/secondary CTA navigation, refresh stats, study pulse / progress bars, mobile width ~375px, console check for no token/secret/material-content logs); plan **BX-I4** / **BX-I5** / **BX-I6** / **B4** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase BX-I4 deterministic course accents complete (frontend only)

**Workflow:** Phase BX-I4 — deterministic course accent chrome (frontend only)
**ADR refs:** none (presentation + client-side deterministic mapping only)
**Commit:** **`ff65e21`** — `feat: add deterministic course accents`
**Prerequisite:** Phase **BX-I2** **`03ee9df`** (dark glass tokens + course accent token values); Phase **BX-I3** **`bdd6f2a`** (dashboard course workload rows); Phases **B1**–**B3** (presentation baseline)
**Summary:** Stable per-course accent chrome on **`/courses`**, **`/courses/:id`**, and dashboard course workload rows. **`course-accent.js`** maps existing course **ID / name / title** to enum-only accent keys **`amber` | `rose` | `emerald`** — **no** raw user strings as class names. **`CourseCard`** accent rail/pill tint; **`CourseDetail`** header accent; dashboard workload row accents; subtle/border token aliases in **`tokens.css`** / **`components.css`**. Accents are **supplementary visual chrome only** — **no** health score, priority, urgency, active/quiet course status, AI classification, fake progress, study pulse recoloring, or dashboard recommendation changes. **No** logging, persistence, backend/API, database, or package changes. **Supervisor Review:** Approved with notes. **Security / Trust Review:** Approved — authenticated visual QA not fully completed (no approved valid local test account).
**Files changed in commit:** **`frontend/src/components/courses/CourseCard.jsx`**, **`frontend/src/pages/CourseDetail.jsx`**, **`frontend/src/pages/DashboardStub.jsx`**, **`frontend/src/styles/components.css`**, **`frontend/src/styles/tokens.css`**, **`frontend/src/utils/course-accent.js`**, **`frontend/tests/unit/dashboard-format.test.js`** only — **no** backend, database, package, logging, or docs changes in implementation commit
**APIs affected:** none (uses existing course data only)
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**228/228**, including course-accent tests integrated into normal test path); `npm run build` passed
**Implementation:** Deterministic course accents only — **does not** authorize sidebar shell, chart UI, material cockpit structure redesign, course accent DB persistence, backend/API extension, **BX-I5** / **BX-I6**, or **B4**
**Pitfalls:** Do not treat BX-I4 as approval for BX-I5+ or B4; do not use accents as health/priority/urgency signals; do not persist accents in DB without a gated phase; do not use raw user strings as class names; authenticated visual QA still pending
**Follow-up:** Authenticated visual QA when a test account exists (**`/courses`** list, **`/courses/:id`** detail header, **`/dashboard`** course workload rows; same course shows same accent across list/detail/dashboard; ~375px width; keyboard focus on course links/cards; console check for no token/secret/course-data logs); plan **BX-I5** / **BX-I6** / **B4** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase BX-I5 material cockpit visual polish complete (frontend only)

**Workflow:** Phase BX-I5 — material detail cockpit visual polish (frontend only)
**ADR refs:** none (presentation-only CSS/className changes)
**Commit:** **`c2288d4`** — `style: polish material cockpit`
**Prerequisite:** Phase **12A-1** **`00a76de`** (Source | AI cockpit layout); Phases **B1**–**B3** (presentation baseline); Phase **BX-I2** **`03ee9df`** (dark glass tokens)
**Summary:** Material detail cockpit visual polish on **`/study-materials/:materialId`** only. Improved Source \| AI hierarchy; darker readable source/editor well; source-type display pill from existing **`sourceTypeLabel`**; AI command/control column wrapper and section dividers; polished generate panel, active plan, and plan history surfaces; improved generated plan scanability; import toolbar/action band styling; history preview inset panel; saved flashcards library visual consistency; responsive polish at existing breakpoints. **No** backend/API/database/package/auth/routes/services, behavior, or request-payload changes. **No** `tokens.css` changes. **No** unsafe rendering — **no** `dangerouslySetInnerHTML`, **no** `innerHTML`, **no** markdown renderer; material and AI-generated plan content remain plain React text. **No** fake metrics, fake AI confidence, fake priority/urgency/status. **Supervisor Review:** Approved with notes. **Security / Trust Review:** PASS — authenticated manual smoke / visual QA **not completed** (no approved valid local test account).
**Files changed in commit:** **`frontend/src/pages/StudyMaterialDetail.jsx`**, **`frontend/src/components/materials/GeneratedPlanSection.jsx`**, **`frontend/src/components/materials/GeneratedPlanHistorySection.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/styles/components.css`** only — **no** backend, database, package, or docs changes in implementation commit
**APIs affected:** none
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**228/228**); `npm run build` passed
**Implementation:** Material cockpit visual polish only — **does not** authorize sidebar shell, chart UI, course accents on material detail, backend/API extension, **BX-I6**, or **B4**
**Pitfalls:** Do not treat BX-I5 as approval for BX-I6+ or B4; do not add markdown/HTML rendering for plan content without Security Review; authenticated material-detail visual QA still pending; **`components.css`** hardcoded `rgba` AI borders acceptable for BX-I5 but may be cleaned up later
**Follow-up:** Authenticated material-detail visual QA when a test account exists (edit/save, unsaved blocks generate, generate/clear/restore/delete history, import tasks/flashcards, saved flashcards study, delete material danger zone, fake UUID/not found, **narrow responsive browser viewport ~375px**, console check for no token/secret/full material content logs); plan **BX-I6** / **B4** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase DOCS-WEB-ONLY product scope clarification (documentation only)

**Workflow:** DOCS-WEB-ONLY — web-only product scope clarification
**ADR refs:** none
**Summary:** Documentation-only update so future agents understand StudyOps AI is a **browser-based web application only** — not a mobile app, native mobile app, Android/iOS app, phone app, app-store product, or mobile-first/native product. Clarified that **375px** checks are **narrow responsive browser viewport** / **small viewport web layout** testing, not mobile-app scope. Added agent terminology rules to **`AGENTS.md`** and **`CLAUDE.md`**; product platform notes in **`docs/PRD.md`**, **`DESIGN.md`**, **`docs/CURRENT_STATE.md`**, **`docs/IMPLEMENTATION_STATUS.md`**; Stitch web-UI-only boundary in **`DESIGN.md`** and **`docs/design/STITCH_SELECTED_REFERENCE.md`** / **`STITCH_VISUAL_STYLE_GUIDE.md`**. **No** application code, feature scope expansion, or BX-I6 implementation.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not treat responsive web CSS or ~375px browser QA as authorization for native mobile, sidebar, bottom tabs, or app-store work; do not use “mobile app” wording when meaning narrow browser viewport; Stitch references are **web UI inspiration only**
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase BX-I6B dashboard visual upgrade complete (frontend only)

**Workflow:** Phase BX-I6B — dashboard visual upgrade / AI Study Command Center presentation (frontend only)
**ADR refs:** none (presentation-only CSS/className changes)
**Commit:** **`cceb4e0`** — `style: upgrade dashboard command center`
**Prerequisite:** Phase **BX-I3** **`bdd6f2a`** (dashboard decision layout); Phase **BX-I4** **`ff65e21`** (course workload accents); Phases **B1**–**B3** + **BX-I2** **`03ee9df`** (tokens/presentation baseline)
**Summary:** Dashboard command-center **presentation** on **`/dashboard`** only. Flagship **“What should I study next?”** hero (existing **rule-based** recommendation — **`dashboard-recommendation.js` unchanged**); glass/depth/glow using existing design tokens; Study pulse cockpit band with factual **Pending / Completed / Total** metrics from existing stats; richer course workload command deck with improved stat chips; **At a glance** visually demoted as tertiary; **narrow responsive browser viewport ~375px** — no mid-word stat label breaks, no horizontal overflow; **`prefers-reduced-motion`** for decorative effects. **No** backend/API/database/package/auth/routes/services changes. **No** `tokens.css`, **`DashboardContext`**, **`dashboard.service.js`**, chart libraries, sidebar, weekly focus chart, or new packages. **No** fake AI confidence, urgency, priority, health score, or analytics. **Supervisor Review:** Approved with notes. **Supervisor re-check:** Approved with notes. **Security / Trust Review:** Approved with notes. **Manual authenticated dashboard smoke:** passed.
**Files changed in commit:** **`frontend/src/pages/DashboardStub.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/styles/components.css`** only — **no** backend, database, package, or docs in implementation commit
**APIs affected:** none (still **`GET /api/dashboard/stats`** only)
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**228/228**); `npm run build` passed
**Implementation:** Dashboard presentation only — **does not** authorize **BX-I6C**, **BX-I6D**, courses/course-detail visual alignment, AppShell/global motion, sidebar shell, chart UI/APIs, backend/API extension, or **B4**
**Pitfalls:** Do not treat BX-I6B as approval for BX-I6C+ or B4; do not assume hero styling implies AI recommendation engine; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; authenticated QA for other routes (BX-I2–I5) may still be pending
**Follow-up:** Optional cleanup of duplicate JSDoc above **`PulseMetric`**; plan **BX-I6C** / **BX-I6D** / remaining **BX-I6** / **B4** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase BX-I6B documentation housekeeping (documentation only)

**Workflow:** BX-I6B docs — record implementation commit **`cceb4e0`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after BX-I6B implementation commit **`cceb4e0`**. Records frontend-only scope (three approved files), web-only / narrow responsive browser viewport wording, reviews, tests (**228/228**), and manual authenticated dashboard smoke. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate BX-I6B presentation with **`dashboard-recommendation.js`** logic changes; do not auto-start BX-I6C/BX-I6D/B4
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase BX-I6C courses visual alignment complete (frontend only)

**Workflow:** Phase BX-I6C — courses / course-detail visual alignment (frontend only)
**ADR refs:** none (presentation-only CSS/className changes)
**Commit:** **`6a1e6ad`** — `style: align courses visual surfaces`
**Prerequisite:** Phase **BX-I4** **`ff65e21`** (deterministic course accents); Phases **B1**–**B3** + **BX-I2** **`03ee9df`** (tokens/presentation baseline); **8C-2A** courses/course-detail cockpit layout
**Summary:** Courses and course-detail **presentation** on **`/courses`** and **`/courses/:id`** only. **`/courses`:** subject shelf (`courses-shelf--deck`), semantic **`ul > li > article`**, **`source-card--course-shelf`**, glass create form, empty-state wrapper. **`/courses/:id`:** subject workspace hierarchy; **Subject** pill under header (existing **`data-course-accent`** — chrome only); settings secondary band; materials primary glass zone; document shelf deck; honest material count subtitle (**`materials.length`**, no new API; hidden during loading/error/empty); stronger tasks and danger-zone framing; **narrow responsive browser viewport ~375px** — no horizontal overflow. **No** backend/API/database/package/auth/routes/services, `tokens.css`, dashboard, AppShell, or material cockpit changes. **No** chart libraries, sidebar, new packages, or fake course health/priority/urgency/status/AI classification. **Supervisor Review:** Approved with notes. **Security / Trust Review:** Approved with notes. **Manual authenticated smoke:** passed (`/courses` empty state not smoke-tested).
**Files changed in commit:** **`frontend/src/components/courses/CourseCard.jsx`**, **`frontend/src/components/materials/MaterialCard.jsx`**, **`frontend/src/pages/CoursesList.jsx`**, **`frontend/src/pages/CourseDetail.jsx`**, **`frontend/src/styles/layout.css`**, **`frontend/src/styles/components.css`** only — **no** backend, database, package, or docs in implementation commit
**APIs affected:** none
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**228/228**); `npm run build` passed
**Implementation:** Courses/course-detail visual alignment only — **does not** authorize **BX-I6D**, AppShell/global motion, sidebar shell, chart UI/APIs, dashboard changes, backend/API extension, or **B4**
**Pitfalls:** Do not treat BX-I6C as approval for BX-I6D/B4; do not treat material count subtitle as health/progress/AI; do not use accents as status signals; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; `/courses` empty state not manually smoke-tested
**Follow-up:** Optional `/courses` empty-state visual smoke; plan **BX-I6D** / remaining **BX-I6** / **B4** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase BX-I6C documentation housekeeping (documentation only)

**Workflow:** BX-I6C docs — record implementation commit **`6a1e6ad`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after BX-I6C implementation commit **`6a1e6ad`**. Records frontend-only scope (six approved files), **`/courses`** + **`/courses/:id`** presentation only, web-only / narrow responsive browser viewport wording, reviews, tests (**228/228**), and manual authenticated smoke with notes. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate BX-I6C with backend/API or dashboard changes; do not auto-start BX-I6D/B4
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase BX-I6D global shell chrome polish complete (CSS only)

**Workflow:** Phase BX-I6D — global shell / top navigation / visual chrome polish (CSS only)
**ADR refs:** none (presentation-only CSS changes)
**Commit:** **`9252ba9`** — `style: polish global shell chrome`
**Prerequisite:** Phases **B2** + **8C-1** **`AppShell`** layout; **BX-I2** **`03ee9df`** (tokens/presentation baseline)
**Summary:** Global **`AppShell`** WEB dashboard chrome on all protected routes — **`frontend/src/styles/layout.css`** only. Stronger glass shell bar; restrained top accent strip; brand/nav/logout hover and **`:focus-visible`**; active route styling **not** color-only; logout visible and labeled; **narrow responsive browser viewport ~375px** — WEB top-nav horizontal scroll row (**not** phone UI); **no** bottom tabs, drawer, hamburger-first layout; **`prefers-reduced-motion`** for shell transitions. **No** `AppShell.jsx`, `App.jsx`, auth, route guards, route fade, page transitions, content remounting, `useLocation`, or `key={location.pathname}`. **No** backend/API/database/package/tokens/dashboard/course/material page changes. **No** misleading AI/priority/urgency/health/status copy. **Supervisor Review:** Approved with notes. **Security / Trust Review:** Approved with notes. **Authenticated 375px shell spot-check:** passed with notes. **Manual authenticated smoke:** passed with notes.
**Files changed in commit:** **`frontend/src/styles/layout.css`** only — **no** backend, database, package, or docs in implementation commit
**APIs affected:** none
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**228/228**); `npm run build` passed
**Implementation:** Global shell chrome only — **does not** authorize **B4**, sidebar shell, chart UI/APIs, tasks/flashcards/Trello/admin page body polish, or backend/API extension
**Pitfalls:** Do not treat BX-I6D as approval for **B4** or page-body polish; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; do not add route fade or `useLocation` animation without a separate phase
**Follow-up:** Optional Flashcards **`scroll-margin-inline`** polish; plan **B4** / remaining **BX-I6** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase BX-I6D documentation housekeeping (documentation only)

**Workflow:** BX-I6D docs — record implementation commit **`9252ba9`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after BX-I6D implementation commit **`9252ba9`**. Records **CSS-only** scope (**`layout.css`** only), global shell / top navigation chrome, web-only / narrow responsive browser viewport wording, reviews (Supervisor, Security/Trust, authenticated **375px** spot-check), tests (**228/228**), and manual authenticated smoke with notes. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate BX-I6D with auth/route/JSX changes; do not auto-start **B4-B** or other page-body polish
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-A tasks page body polish complete (frontend only)

**Workflow:** Phase B4-A — tasks page body / task command surface polish (frontend only)
**ADR refs:** none (presentation-only CSS/className/semantic markup changes)
**Commit:** **`4ae80ee`** — `style: polish tasks command surface`
**Prerequisite:** Phases **8C-3A** + **B2** + **B3** (tasks workspace baseline); **BX-I2** **`03ee9df`** (tokens/presentation baseline); **BX-I6D** **`9252ba9`** (global shell chrome)
**Summary:** Tasks page body **presentation** on **`/tasks`** only. Task command surface / command band; improved page hierarchy; filter toolbar visual framing; create/list/empty/error/loading wrappers; scoped empty/error/list visual treatment; semantic **`ul.task-workspace__list > li.task-workspace__list-item > TaskCard` article or FormCard section**; native status filter **`<button type="button">`** with **`aria-pressed`** on real DOM (**B4-A-F1** — fixes prior issue where **`Button.jsx`** did not forward **`aria-pressed`**); selected filter **not** color-only; **narrow responsive browser viewport ~375px** scoped CSS. **“Task command”** is approved **UI framing only** — **not** an AI/automation claim. **No** backend/API/database/package/auth/routes/services, `tokens.css`, **`components.css`**, task CRUD/filter/validation/**Focus**/**`refreshStats`** changes. **No** AppShell, dashboard, courses, course detail, material cockpit, flashcards, Trello, admin, or focus page changes. **No** fake AI/health/urgency/status/priority semantics; **no** new task data exposure. **Supervisor Review:** PASS. **Security / Trust Review:** Approved with notes. **B4-A-F1** focused re-check: Approved. **Manual authenticated smoke:** limited — static review + automated checks passed.
**Files changed in commit:** **`frontend/src/components/tasks/GlobalTasksSection.jsx`**, **`frontend/src/pages/TasksPage.jsx`**, **`frontend/src/styles/layout.css`** only — **no** backend, database, package, or docs in implementation commit
**APIs affected:** none
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**228/228**); `npm run build` passed
**Implementation:** Tasks page body polish only — **does not** authorize **B4-B**, flashcards/Trello/admin/focus page body polish, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat **“Task command”** as AI/automation; do not treat B4-A as approval for **B4-B** or B4; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; do not use shared **`Button`** for **`aria-pressed`** toggle groups without prop forwarding
**Follow-up:** Authenticated **`/tasks`** visual QA when a test account exists (populated state, filters, create/edit/complete/delete, Start Focus, **narrow responsive browser viewport ~375px**, console check); plan **B4-B** / remaining **B4** / **BX-I6** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-A documentation housekeeping (documentation only)

**Workflow:** B4-A docs — record implementation commit **`4ae80ee`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-A implementation commit **`4ae80ee`**. Records frontend presentation-only scope (three approved files), **`/tasks`** page body polish only, web-only / narrow responsive browser viewport wording, semantic **`ul/li`** task list and **`aria-pressed`** accessibility fix (**B4-A-F1**), reviews (Supervisor PASS, Security/Trust approved with notes, B4-A-F1 focused re-check approved), tests (**228/228**), and limited manual authenticated smoke. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-A with task CRUD/filter/validation changes; do not auto-start **B4-B** or other page-body polish
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-B flashcards page body polish complete (frontend only)

**Workflow:** Phase B4-B — flashcards page body / flashcards command surface polish (frontend only)
**ADR refs:** none (presentation-only CSS/className/semantic markup changes)
**Commit:** **`f91415d`** — `style: polish flashcards command surface`
**Prerequisite:** Phases **8C-3B** + **B2** + **B3** (flashcards workspace baseline); **BX-I2** **`03ee9df`** (tokens/presentation baseline); **BX-I6D** **`9252ba9`** (global shell chrome); **B4-A** **`4ae80ee`** (tasks command surface pattern reference)
**Summary:** Flashcards page body **presentation** on **`/flashcards`** only. Flashcards command surface / command band; improved page hierarchy; filters/create/study/manage visual framing; page-level loading/error wrappers; scoped loading/error/empty/filter-empty/action-error wrappers; manage list readability. Filter group **`role="group"`** + **`aria-label="Filter saved flashcards"`** on native labeled **`<select>`** elements. **“Flashcard library”** / **“Filter, study, and manage saved cards”** are factual **UI framing only** — **not** AI/automation claims. Manage list still shows **truncated question only** — **no** answers newly exposed; full answers remain in existing **`FlashcardStudy`** reveal and edit flows. **`actionError`** moved outside **`FormCard`** — presentation-only, still **`ErrorMessage`** / **`role="alert"`**. Delete confirmation and destructive action clarity **unchanged**. **No** backend/API/database/package/auth/routes/services, `tokens.css`, **`components.css`**, **`FlashcardStudy.jsx`**, **`DbFlashcardsSection.jsx`**, flashcard CRUD/filter/study/reveal/**`refreshStats`** changes. **No** AppShell, dashboard, courses, course detail, tasks, material cockpit, Trello, admin, or focus page changes. **No** fake AI/mastery/progress/health/priority/urgency/status semantics. **Supervisor Review:** Approved with notes. **Security / Trust Review:** Approved with notes. **Manual authenticated smoke:** partial — populated library, filters, study/reveal, 375px passed; create/edit/delete persistence and filter-empty/global-empty not exercised.
**Files changed in commit:** **`frontend/src/components/flashcards/GlobalFlashcardsSection.jsx`**, **`frontend/src/pages/FlashcardsPage.jsx`**, **`frontend/src/styles/layout.css`** only — **no** backend, database, package, or docs in implementation commit
**APIs affected:** none
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**228/228**); `npm run build` passed
**Implementation:** Flashcards page body polish only — **does not** authorize **B4-C**, Trello/admin/focus page body polish, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat **“Flashcard library”** as AI/automation; do not treat B4-B as approval for **B4-C** or B4; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; do not expose answers in manage list
**Follow-up:** Authenticated **`/flashcards`** visual QA when a test account exists (filter-empty/global-empty, create/edit/delete on safe test cards, delete-failure **`actionError`**, **narrow responsive browser viewport ~375px**, console check); plan **B4-C** / remaining **B4** / **BX-I6** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-B documentation housekeeping (documentation only)

**Workflow:** B4-B docs — record implementation commit **`f91415d`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-B implementation commit **`f91415d`**. Records frontend presentation-only scope (three approved files), **`/flashcards`** page body polish only, web-only / narrow responsive browser viewport wording, content-safety notes (truncated manage list, no new answer exposure), reviews (Supervisor and Security/Trust approved with notes), tests (**228/228**), and partial manual authenticated smoke. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-B with flashcard CRUD/filter/study/reveal changes; do not auto-start **B4-C** or other page-body polish
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-C Trello page body polish complete (frontend only)

**Workflow:** Phase B4-C — Trello page body / Trello integration command surface polish (frontend only)
**ADR refs:** ADR 004 unchanged (ephemeral credentials; backend-only Trello API)
**Commit:** **`cf50729`** — `style: polish trello integration surface`
**Prerequisite:** Phases **8C-3C** + **4B-2** (Trello step workspace + board/list picker); **BX-I6D** **`9252ba9`** (global shell chrome); **B4-A** / **B4-B** (command-band pattern reference)
**Summary:** Trello page body **presentation** on **`/trello`** only. Trello integration command surface / command band; step framing for credentials, board/list picker, task selector, sync submit, and results; page-level loading/error wrappers; results zone visual framing; scoped **`layout.css`** polish. **B4-C-F1:** removed courses-level **Try again** — courses error **`ErrorMessage`**-only (Supervisor flagged behavior deviation). Credentials remain **`type="password"`** with **`autoComplete="off"`**; trust notes honest; manual sync framing only. **No** backend/API/database/package/auth/routes/services, **`trello.service.js`**, validation/utils, credential lifecycle, sync payload, board/list/task loading, selection, result rendering, or sync behavior changes. **No** fake AI/smart-sync/health/progress/quality/priority/urgency semantics. **Supervisor Review:** Approved with notes. **B4-C-F1** Supervisor re-check **Approved**. **Security / Trust Review:** Approved with notes. **Manual authenticated smoke:** partial — `/trello` load, masked credentials, task selector, 375px passed; no safe Trello credentials — no real sync exercised.
**Files changed in commit:** seven approved frontend files only — **no** backend, database, package, or docs in implementation commit
**APIs affected:** none
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**228/228**); `npm run build` passed
**Implementation:** Trello page body polish only — **does not** authorize admin/focus/shared-state polish, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat B4-C as approval for admin/focus polish; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; do not re-add courses-level **Try again**; do not change credential lifecycle or sync behavior in presentation phases
**Follow-up:** Authenticated **`/trello`** visual QA with safe Trello credentials when available (board/list load, sync results, clear-credentials after sync, console check); plan admin/focus/shared-state polish separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-C documentation housekeeping (documentation only)

**Workflow:** B4-C docs — record implementation commit **`cf50729`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-C implementation commit **`cf50729`**. Records frontend presentation-only scope (seven approved files), **`/trello`** page body polish only, **B4-C-F1** courses error scope fix, web-only / narrow responsive browser viewport wording, credential/trust notes, reviews (Supervisor approved with notes, B4-C-F1 re-check approved, Security/Trust approved with notes), tests (**228/228**), and partial manual authenticated smoke. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-C with Trello service/sync behavior changes; do not auto-start admin/focus/shared-state polish
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-D Admin page body polish complete (frontend only)

**Workflow:** Phase B4-D — Admin page body / admin command read surface polish (frontend only)
**ADR refs:** none (presentation-only; admin trust boundaries unchanged from **6A-3**)
**Commit:** **`905ee4d`** — `style: polish admin control surface`
**Prerequisite:** Phases **6A-3** + **8C-3D** (admin aggregate UI); **BX-I6D** **`9252ba9`** (global shell chrome); **B4-A** / **B4-B** / **B4-C** (command-band pattern reference)
**Summary:** Admin page body **presentation** on **`/admin`** only. **`admin-workspace`** root; admin command/read surface / command band; improved aggregate stat-band hierarchy; page loading/error/forbidden wrappers; trust note (`role="note"`); forbidden-card polish; **Backend status** title rename only — same **`stats.systemHealth.backend`** / **`formatBackendHealth`**. **No** **`AdminRoute.jsx`**, **`App.jsx`**, **`AppShell`**, **`admin.service.js`**, auth/route/**`user?.role`**/**`getAdminStats`**/**`loadStats`**/refresh/**FORBIDDEN**/**AUTH_REQUIRED**/SEC-6A3-1 changes. Aggregate-only — **no** PII/logs/payload display or logging. **No** users/roles/logs/charts/new admin actions or fake security/risk/health/AI metrics. **Supervisor Review:** Approved with notes. **Security / Trust Review:** Approved with notes (**“Platform control”** accepted; optional copy softening non-blocking). **Manual smoke:** limited — logged-out **`/admin` → `/`** confirmed; admin/non-admin/403/375px success not live-tested.
**Files changed in commit:** two approved frontend files only — **no** backend, database, package, or docs in implementation commit
**APIs affected:** none
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**228/228**); `npm run build` passed
**Implementation:** Admin page body polish only — **does not** authorize focus/shared-state polish, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat B4-D as approval for focus/shared-state polish; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; do not change **`AdminRoute`**, **`admin.service.js`**, or admin fetch/error behavior in presentation phases; do not treat **“Platform control”** as user/role management
**Follow-up:** Authenticated **`/admin`** visual QA when admin/non-admin sessions exist; plan focus/shared-state polish separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-D documentation housekeeping (documentation only)

**Workflow:** B4-D docs — record implementation commit **`905ee4d`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-D implementation commit **`905ee4d`**. Records frontend presentation-only scope (two approved files), **`/admin`** page body polish only, web-only / narrow responsive browser viewport wording, admin security/role/API boundary notes, reviews (Supervisor approved with notes, Security/Trust approved with notes), tests (**228/228**), and limited manual smoke. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-D with **`admin.service.js`** or **`AdminRoute`** behavior changes; do not auto-start shared empty/loading/error state polish
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-E Focus page body polish complete (frontend only)

**Workflow:** Phase B4-E — Focus page body / session cockpit polish (frontend only)
**ADR refs:** none (presentation-only; focus session trust boundaries unchanged from **4C-2** / **4C-3**)
**Commit:** **`7f4bf6b`** — `style: polish focus session cockpit`
**Prerequisite:** Phases **4C-2** + **4C-3** (focus sessions UI + smoke); **B2** **`page--cockpit`** on focus; **B4-A**–**B4-D** (command-band pattern reference)
**Summary:** Focus page body **presentation** on **`/focus/:taskId`** only. **`focus-workspace`** session deck / command band; improved task context, timer panel, action area, loading/error/done wrappers. **JSX/markup only** — logic above `return` in **`FocusPage.jsx`** unchanged. **No** **`focus.service.js`**, **`TaskCard`**, **`App.jsx`**, **`AppShell`**, backend/API/package/auth/route changes. Timer/session behavior unchanged (**`DEFAULT_DURATION_MINUTES = 25`**, auto-start, countdown, phase machine, complete/checkbox/**`refreshStats`**, errors, nav state, **AUTH_REQUIRED**). **Removed** `aria-live` from active timer panel; static timer **`aria-label`** only. **No** pause/reset/duration picker/history/charts/streaks/fake scores/AI coach. **No** token/session/user/focus payload logging. **Supervisor Review:** Approved with notes. **Security / Trust Review:** Approved with notes. **Manual smoke:** limited — no authenticated session/safe pending task; static review + automated checks passed.
**Files changed in commit:** two approved frontend files only — **no** backend, database, package, or docs in implementation commit
**APIs affected:** none
**Tests:** `cd frontend && npm run lint` passed; `npm test` passed (**228/228**); `npm run build` passed
**Implementation:** Focus page body polish only — **does not** authorize shared empty/loading/error state polish, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat B4-E as approval for shared-state polish or timer/session logic changes; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; do not re-add per-second `aria-live` on active countdown; future duration changes must update hardcoded **25-minute** copy
**Follow-up:** Authenticated **`/focus/:taskId`** visual QA when session + safe pending task exist; plan shared empty/loading/error state polish separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-E documentation housekeeping (documentation only)

**Workflow:** B4-E docs — record implementation commit **`7f4bf6b`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-E implementation commit **`7f4bf6b`**. Records frontend presentation-only scope (two approved files), **`/focus/:taskId`** page body polish only, web-only / narrow responsive browser viewport wording, timer/session behavior preservation, a11y timer panel fix, reviews (Supervisor approved with notes, Security/Trust approved with notes), tests (**228/228**), and limited manual smoke. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-E with **`focus.service.js`** or timer/session logic changes; do not auto-start **B4-F2** / **B4-F3** shared-state follow-up

### 2026-06-02 — Phase B4-F1 shared state primitives CSS polish complete (CSS only)

**Workflow:** Phase B4-F1 — shared empty/loading/error primitive visual polish (**CSS-only**)
**ADR refs:** none
**Summary:** **CSS-only** polish in **`frontend/src/styles/components.css`** only (commit **`ea8a899`**). Polished **`.loading`**, **`.empty-state`**, **`.alert`** / **`.alert--error`**, **`.protected-loading`** with glass/dark UI; spinner + reduced-motion preserved; error visibility with danger tokens + left accent; **narrow responsive browser viewport ~375px** wrap rules. **No** **`LoadingState.jsx`**, **`EmptyState.jsx`**, **`ErrorMessage.jsx`**, **`layout.css`**, **`tokens.css`**, page, route, service, API, auth, copy, or Try-again behavior changes. **TrelloTaskSelector** EmptyState prop bug **not fixed**. Material AI nested-panel note cosmetic/non-blocking.
**APIs affected:** none
**Tests:** **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed
**Implementation:** Shared primitives CSS polish only — **does not** authorize **B4-F2**, **B4-F3**, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat B4-F1 as approval for **B4-F2** / **B4-F3**; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; do not change shared component JSX without separate gate
**Follow-up:** Authenticated visual QA when test account exists; plan **B4-F2** / **B4-F3** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-F1 documentation housekeeping (documentation only)

**Workflow:** B4-F1 docs — record implementation commit **`ea8a899`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-F1 implementation commit **`ea8a899`**. Records **CSS-only** scope (**`components.css`** only), shared primitives polish, web-only / narrow responsive browser viewport wording, a11y/behavior preservation (**LoadingState** **`role="status"`** / **`aria-live="polite"`**, **ErrorMessage** **`role="alert"`**, **EmptyState** CTA unchanged), reviews (Supervisor approved with notes, Security/Trust approved with notes), tests (**228/228**), limited manual smoke, **B4-F2** / **B4-F3** not started. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-F1 with **B4-F2** / **B4-F3**; do not auto-start unframed route wrappers without explicit approval
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-F2 route state surface framing complete (frontend presentation only)

**Workflow:** Phase B4-F2 — route-level loading/error/not-found visual framing
**ADR refs:** none
**Summary:** **Frontend presentation-only** in five approved files (commit **`ee50b8e`**). Route-level loading/error/not-found visual framing for Dashboard, Courses, CourseDetail early returns, StudyMaterialDetail early returns; scoped **`layout.css`** route-state styles; neutral not-found decks; wrapped error action rows for existing **Try again** buttons. **No** backend/API/database/package/auth/route guard/service/data-fetching/error-mapping/retry/copy/**`components.css`**/**`tokens.css`**/shared UI component changes. **B4-F3** not started; **TrelloTaskSelector** EmptyState bug not fixed; nested materials / material success cockpit / AI lane not touched. A11y preserved (**LoadingState** **`role="status"`** / **`aria-live="polite"`**, **ErrorMessage** **`role="alert"`**, back links, **`h1`** in not-found). Minor deck-framing note non-blocking.
**APIs affected:** none
**Tests:** **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed
**Implementation:** Route state framing only — **does not** authorize **B4-F3**, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat B4-F2 as approval for **B4-F3**; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; not-found/error deck visual parity is cosmetic/non-blocking
**Follow-up:** Authenticated visual QA when test account exists; plan **B4-F3** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-F2 documentation housekeeping (documentation only)

**Workflow:** B4-F2 docs — record implementation commit **`ee50b8e`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-F2 implementation commit **`ee50b8e`**. Records **frontend presentation-only** scope (five approved files), route state framing, web-only / narrow responsive browser viewport wording, a11y/behavior/security preservation, reviews (Supervisor approved with notes, Security/Trust approved with notes), tests (**228/228**), limited manual smoke, **B4-F3** not started. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-F2 with **B4-F3**; do not auto-start secondary empty surfaces without explicit approval
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-F3A secondary in-page state surfaces complete (CSS only)

**Workflow:** Phase B4-F3A — secondary in-page state surface CSS polish
**ADR refs:** none
**Summary:** **CSS-only** polish in **`frontend/src/styles/layout.css`** only (commit **`596e869`**). Polished **CourseDetail** materials loading/error/empty; course tasks filter-empty; material saved flashcards library loading/error/empty; material cockpit plan/history error block spacing/wrapping; **narrow responsive browser viewport ~375px** wrap/padding. **No** JSX, **`components.css`**, **`tokens.css`**, page, route, service, API, auth, copy, or Try-again behavior changes. **B4-F2** route wrappers unchanged. AI processing lane and history preview **`aria-live`** **not touched**. **TrelloTaskSelector** EmptyState prop bug **not fixed**. **B4-F3B**/**B4-F3C** **not started**. Minor neutral outer shells on **flashcard-library__error** / **plan-panel__error** — inner **`.alert--error`** clear (non-blocking).
**APIs affected:** none
**Tests:** **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed
**Implementation:** Secondary in-page state surfaces only — **does not** authorize **B4-F3B**, **B4-F3C**, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat B4-F3A as approval for **B4-F3B**/**B4-F3C**; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; neutral error outer shells still require inner **`.alert--error`** to read as errors
**Follow-up:** Authenticated visual QA when test account exists; plan **B4-F3B** / **B4-F3C** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-F3A documentation housekeeping (documentation only)

**Workflow:** B4-F3A docs — record implementation commit **`596e869`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-F3A implementation commit **`596e869`**. Records **CSS-only** scope (**`layout.css`** only), secondary in-page state surface polish, web-only / narrow responsive browser viewport wording, a11y/behavior/security preservation, reviews (Supervisor approved with notes, Security/Trust approved with notes), tests (**228/228**), limited manual smoke, **B4-F3B**/**B4-F3C** not started. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-F3A with **B4-F3B**/**B4-F3C**; do not auto-start wrapper className or AI/a11y work without explicit approval
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-F3C3 documentation housekeeping (documentation only)

**Workflow:** B4-F3C3 docs — record implementation commit **`ab28307`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-F3C3 implementation commit **`ab28307`**. Records one-file **`GeneratedPlanHistorySection.jsx`** preview **`aria-live`** cleanup scope (wrapper **`aria-live`** removed; loading **`<p>`** **`role="status"`** + **`aria-live="polite"`**; **`previewError`** still **`ErrorMessage`** / **`role="alert"`**; success snippet + meta not live-announced; no full plan exposure), web-only / narrow responsive browser viewport wording, a11y/behavior/security preservation, reviews (Supervisor approved, Security/Trust approved), tests (**228/228**), limited manual smoke, **B4-F3C** sub-series complete, **B4-F3B** not started. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-F3C3 with **B4-F3B**; do not auto-start wrapper className work without explicit approval
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-F3C3 GeneratedPlanHistory preview aria-live cleanup complete (frontend only)

**Workflow:** Phase B4-F3C3 — **GeneratedPlanHistorySection** preview **`aria-live`** / error semantics cleanup
**ADR refs:** none
**Summary:** **Frontend-only** one-file a11y cleanup in **`frontend/src/components/materials/GeneratedPlanHistorySection.jsx`** only (commit **`ab28307`**). Removed **`aria-live="polite"`** from preview panel wrapper; loading **`<p>`** now has **`role="status"`** + **`aria-live="polite"`** for **Loading preview…** only; **`previewError`** still **`ErrorMessage`** / **`role="alert"`**; success snippet + meta not live-announced; preview still truncated snippet + counts only — **no** full plan/tasks/flashcards/key topics/raw JSON in DOM. **No** CSS, shared UI, services, **`StudyMaterialDetail`**, **`TrelloTaskSelector`**, or preview-helper changes. **B4-F3C** sub-series **complete**. **No** sensitive logging or unsafe rendering.
**APIs affected:** none
**Tests:** **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed
**Implementation:** **GeneratedPlanHistory** preview **`aria-live`** cleanup only — **does not** authorize **B4-F3B**, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat B4-F3C3 as approval for **B4-F3B**; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope
**Follow-up:** Authenticated generated-plan-history preview visual/a11y QA when test account exists; plan **B4-F3B** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-F3C2 AI processing lane aria-live cleanup complete (frontend only)

**Workflow:** Phase B4-F3C2 — material detail AI processing lane duplicate **`aria-live`** cleanup
**ADR refs:** none
**Summary:** **Frontend-only** one-file a11y cleanup in **`frontend/src/pages/StudyMaterialDetail.jsx`** only (commit **`d1a3c69`**). Removed duplicate **`aria-live="polite"`** from outer **`ai-panel__loading--active`** wrapper; **`LoadingState`** remains single polite live region (**`role="status"`**, **`aria-live="polite"`**) for **Processing with AI…**. **No** CSS, **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, services, generate/**`generateError`** behavior, **`TrelloTaskSelector`**, or **`GeneratedPlanHistorySection`** changes. **No** B4-F3C3 work. **No** sensitive logging or unsafe rendering.
**APIs affected:** none
**Tests:** **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed
**Implementation:** AI lane **`aria-live`** cleanup only — **does not** authorize **B4-F3B**, **B4-F3C3**, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat B4-F3C2 as approval for **B4-F3C3**; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope
**Follow-up:** Authenticated generate-flow visual/a11y QA when test account exists; plan **B4-F3B** / **B4-F3C3** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-F3C2 documentation housekeeping (documentation only)

**Workflow:** B4-F3C2 docs — record implementation commit **`d1a3c69`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-F3C2 implementation commit **`d1a3c69`**. Records one-file **`StudyMaterialDetail.jsx`** duplicate **`aria-live`** cleanup scope, web-only / narrow responsive browser viewport wording, a11y/behavior/security preservation, reviews (Supervisor approved with notes, Security/Trust approved with notes), tests (**228/228**), limited manual smoke, **B4-F3B**/**B4-F3C3** not started. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-F3C2 with **B4-F3C3**; do not auto-start GeneratedPlanHistory preview work without explicit approval
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-F3C1 TrelloTaskSelector empty-state bug fix complete (frontend only)

**Workflow:** Phase B4-F3C1 — isolated **TrelloTaskSelector** zero-tasks empty-state bug fix
**ADR refs:** none
**Summary:** **Frontend-only** fix in **`frontend/src/components/trello/TrelloTaskSelector.jsx`** only (commit **`d0393d7`**). Removed invalid **`EmptyState`** usage with unsupported **`message`** prop and unused import; zero-tasks state now plain **`<p className="trello-picker__empty trello-picker__status" role="status">`** with preserved copy. **No** CSS, **`EmptyState.jsx`**, **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`TrelloSyncSection.jsx`**, Trello services, sync behavior, backend/API/package/auth changes. Task selection / Select all / Clear / 50-task limit / **`overLimit`** **`role="alert"`** unchanged. **No** B4-F3C2 AI lane or B4-F3C3 **GeneratedPlanHistory** work. **No** credentials/payload/token/session/user exposure or logging.
**APIs affected:** none
**Tests:** **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed
**Implementation:** **TrelloTaskSelector** empty-state fix only — **does not** authorize **B4-F3B**, **B4-F3C2**, **B4-F3C3**, sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat B4-F3C1 as approval for **B4-F3C2**/**B4-F3C3**; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope
**Follow-up:** Authenticated **`/trello`** visual QA when test account exists; plan **B4-F3B** / **B4-F3C2** / **B4-F3C3** separately with explicit implement approval — next implementation phase is **not automatic**

### 2026-06-02 — Phase B4-F3C1 documentation housekeeping (documentation only)

**Workflow:** B4-F3C1 docs — record implementation commit **`d0393d7`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-F3C1 implementation commit **`d0393d7`**. Records isolated **TrelloTaskSelector** empty-state bug fix scope, web-only / narrow responsive browser viewport wording, a11y/behavior/security preservation, reviews (Supervisor approved, Security/Trust approved), tests (**228/228**), limited manual smoke, **B4-F3B**/**B4-F3C2**/**B4-F3C3** not started. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-F3C1 with **B4-F3C2**/**B4-F3C3**; do not auto-start AI lane or GeneratedPlanHistory work without explicit approval
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase DOCS-B4F3C-STATE-ALIGN current-status doc alignment (documentation only)

**Workflow:** DOCS-B4F3C-STATE-ALIGN — align **B4-F3C** complete vs **B4-F3B** deferred wording in status docs after next-phase planning
**ADR refs:** none
**Summary:** Documentation-only cleanup in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, and executive summary in **`AGENT_MEMORY.md`**. Fixed stale current-status phrasing that could read as **B4-F3C** / **B4-F3C2** / **B4-F3C3** still **not started** (notably **B4-F3A** stable paragraph, phase table row, forbidden-assumption rows, **IMPLEMENTATION_STATUS** **Last aligned** / **B4-F3A** table, **B4-F1**/**B4-F2** “Not in” lines, **B3** historical **B4 not started**). **Current status now explicit:** **B4-F3C1** (**`d0393d7`**), **B4-F3C2** (**`d1a3c69`**), **B4-F3C3** (**`ab28307`**) **complete**; **B4-F3C** sub-series **complete**; **B4-F3B** wrapper **`className`** work **not started**; next implementation phase **not automatic**. **No** application code changes; **no** B4-F3B implementation plan added.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Older **AGENT_MEMORY** journal entries may still say “**B4-F3C** not started” — treat as **historical at entry time**; use **`CURRENT_STATE.md`** + **`IMPLEMENTATION_STATUS.md`** for gates
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase B4-F3B state surface wrapper hooks complete (frontend presentation only)

**Workflow:** Phase B4-F3B — explicit wrapper className hooks + layout.css selector migration
**ADR refs:** none
**Summary:** **Frontend presentation-only** in four approved files (commit **`ee5357f`**). Adds explicit wrapper **`className`** hooks around existing secondary in-page loading/error/empty state surfaces in **`CourseDetail.jsx`**, **`CourseTasksSection.jsx`**, **`DbFlashcardsSection.jsx`**; migrates brittle **B4-F3A** direct-child/generic **`layout.css`** selectors to stable wrapper selectors. Six wrappers: **`course-workspace__materials-loading`**, **`course-workspace__materials-error`**, **`course-workspace__materials-error-actions`**, **`course-workspace__materials-empty`**, **`course-workspace__tasks-filter-empty`**, **`flashcard-library__loading`**. **No** copy, behavior, API/service/auth/route, **`LoadingState.jsx`**, **`ErrorMessage.jsx`**, **`EmptyState.jsx`**, **`tokens.css`**, **`components.css`**, role, or **`aria-live`** changes. **No** StudyMaterialDetail generate-lane, **GeneratedPlanHistory** preview, Trello, Dashboard, or global tasks/flashcards changes. Wrapper divs **no** roles/**`aria-live`** — **no** nested live regions. Try again / EmptyState CTA handlers unchanged. Visual output intended unchanged. **Narrow responsive browser viewport ~375px** preserved — **not** phone/native UI. StudyOps AI remains **browser-based WEB platform / SaaS dashboard / AI study cockpit**. **B4-F3A** / **B4-F3B** / **B4-F3C** all **complete**.
**APIs affected:** none
**Tests:** **`npm run lint`**, **`npm test`** (**228/228**), **`npm run build`** passed
**Implementation:** State surface wrapper hooks only — **does not** authorize sidebar shell, chart UI/APIs, or backend/API extension
**Pitfalls:** Do not treat B4-F3B as approval for sidebar/charts/backend; **375px** QA is **narrow responsive browser viewport** only — not mobile/native scope; wrapper divs must not add roles/**`aria-live`**
**Follow-up:** Authenticated visual QA when test account exists; next implementation phase is **not automatic** — requires separate planning + explicit approval

### 2026-06-02 — Phase DOCS-B4F3B-HOUSEKEEPING documentation housekeeping (documentation only)

**Workflow:** DOCS-B4F3B-HOUSEKEEPING — record implementation commit **`ee5357f`** in **`CURRENT_STATE`**, **`IMPLEMENTATION_STATUS`**, **`AGENT_MEMORY`**
**ADR refs:** none
**Summary:** Documentation-only housekeeping after B4-F3B implementation commit **`ee5357f`**. Records four approved files, six wrapper classNames, **B4-F3A** selector migration, presentation-only scope, behavior/copy/API/auth/backend preservation, a11y/security/trust preservation (**LoadingState** **`role="status"`** / **`aria-live="polite"`**, **ErrorMessage** **`role="alert"`**, wrapper divs **no** roles/**`aria-live`**), reviews (Supervisor approved with notes, Security/Trust approved with notes), tests (**228/228**), limited manual smoke, **B4-F3A**/**B4-F3B**/**B4-F3C** all **complete**, next implementation phase **not automatic**. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not conflate B4-F3B docs with sidebar/charts/backend approval; older journal entries may say **B4-F3B not started** — treat as historical at entry time
**Follow-up:** none — stop before commit per phase gate

### 2026-06-02 — Phase DOCS-BX-I7A-DESKTOP-LAYOUT-ALIGN documentation alignment (documentation only)

**Workflow:** DOCS-BX-I7A-DESKTOP-LAYOUT-ALIGN — align status docs after **BX-I7A** desktop WEB layout width audit
**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, and **`AGENT_MEMORY.md`**. Records **BX-I7A** audit findings: production UI still capped at **`--content-max-cockpit`** / **`--content-max-shell`** (**1120px**); **`page--cockpit`** and **`app-shell__inner`** center at that width; many routes remain one-column/list-like stacks; Stitch/**`DESIGN.md`** imply wider desktop SaaS cockpit — **not solved**. Clarifies **B4**/**BX-I6** polish improved consistency but UI is **not** final Stitch-level. **BX-I7B** proposed next implementation: global desktop content width tokens / page shell widening — **`tokens.css`** + **`layout.css`** only; **no** JSX, behavior, backend, fake metrics, sidebar, mobile/native patterns; requires explicit approval — **not automatic** after **BX-I7A**. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not treat **BX-I7A** doc alignment as **BX-I7B** implement approval; do not claim desktop width fixed or Stitch fully shipped; **375px** remains **narrow responsive browser viewport** — not mobile-app scope
**Follow-up:** Plan **BX-I7B** separately if owner prioritizes desktop width; stop before commit per phase gate

### 2026-06-02 — Phase DOCS-BX-I7B-HOUSEKEEPING documentation alignment (documentation only)

**Workflow:** DOCS-BX-I7B-HOUSEKEEPING — align status docs after **BX-I7B** implementation commit **`00d3255`**
**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale **1120px** cockpit references only). Records **BX-I7B** **complete** (**CSS-only**, commit **`00d3255`**): **`frontend/src/styles/tokens.css`** + **`frontend/src/styles/layout.css`** only; **`--content-max-cockpit`** / **`--content-max-shell`** **1120px → 1280px**; **`--content-max-form`**, **`--content-max-workspace`**, **`--content-max-reading`** unchanged; **`AppShell`** + **`page--cockpit`** aligned; desktop-only **`.page`** padding at **`min-width: 1280px`**; **narrow responsive browser viewport ~375px** preserved; **no** JSX/components/pages/services/backend/API/auth/routes; **no** per-page grid redesign, fake metrics, sidebar, or mobile/native UI. **Foundation only** — does **not** fully solve Stitch/design gap; remaining gap = internal one-column/list-like layouts. **BX-I7C**–**BX-I7F** proposed follow-ups — **not started**, **not automatic**. Supervisor Review approved with notes; lint/test/build passed; authenticated visual smoke limited — recommended. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-level or desktop layout gap fully solved; do not treat **BX-I7B** docs as **BX-I7C**–**BX-I7F** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; older journal entries may say **BX-I7B not started** or **1120px** current cap — treat as historical at entry time
**Follow-up:** Optional authenticated visual QA for **BX-I7B**; plan **BX-I7C**–**BX-I7F** separately; stop before commit per phase gate

### 2026-06-02 — Phase DOCS-BX-I7C-HOUSEKEEPING documentation alignment (documentation only)

**Workflow:** DOCS-BX-I7C-HOUSEKEEPING — align status docs after **BX-I7C** implementation commit **`583922d`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale per-page dashboard grid status in §4.3 only). Records **BX-I7C** **complete** (**CSS-only**, commit **`583922d`**): **`frontend/src/styles/layout.css`** only; dashboard desktop grid at **`min-width: 1280px`** — **PageHeader** full width; **dashboard-hero** + **dashboard-study-pulse** side-by-side (hero full width when study pulse absent); **dashboard-courses** / **dashboard-secondary** full width below; **dashboard-course-list** 2-column grid; loading/error unaffected via **`:has(.dashboard-hero)`**; **narrow responsive browser viewport ~375px** stacked; **no** **`DashboardStub.jsx`**, API/backend/database/service/context/recommendation/copy changes; **no** fake metrics, charts, sidebar, mobile/native UI. Improves Dashboard desktop density — does **not** complete full Stitch-level UI or solve all desktop layout gaps. **BX-I7D**–**BX-I7F** proposed follow-ups — **not started**, **not automatic**. Supervisor Review approved with notes; Security / Trust Review approved with notes; lint/test/build passed; authenticated dashboard visual smoke **not completed** — recommended before merge. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-level or all desktop layout gaps fully solved; do not treat **BX-I7C** docs as **BX-I7D**–**BX-I7F** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; older journal entries may say **BX-I7C not started** — treat as historical at entry time
**Follow-up:** Authenticated dashboard visual QA for **BX-I7C** before merge if not yet done; plan **BX-I7D**–**BX-I7F** separately; stop before commit per phase gate

### 2026-06-02 — Phase DOCS-BX-I7D-HOUSEKEEPING documentation alignment (documentation only)

**Workflow:** DOCS-BX-I7D-HOUSEKEEPING — align status docs after **BX-I7D Tier 1** implementation commit **`52c68ab`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale courses/course detail desktop shelf status in §4.3 only). Records **BX-I7D Tier 1** **complete** (**CSS-only**, commit **`52c68ab`**): **`frontend/src/styles/layout.css`** only; at **`min-width: 1280px`**: **`/courses`** course shelf **3-column** grid; **`/courses/:id`** populated document/material shelf **2-column** grid; loading/error/empty unaffected; tasks remain below materials unchanged; settings form, create material form, danger zone unchanged; **narrow responsive browser viewport ~375px** stacked; **no** **`CoursesList.jsx`**, **`CourseDetail.jsx`**, component, API/backend/database/service/context/recommendation/copy changes; **no** fake metrics, charts, sidebar, mobile/native UI; **Tier 2** (materials | tasks side-by-side **`.course-workspace`** grid, DOM/CSS reorder) **not implemented**. Improves Courses/Course Detail desktop density — does **not** complete full Stitch-level UI or solve all desktop layout gaps. **BX-I7E**–**BX-I7F** and optional **BX-I7D Tier 2** proposed follow-ups — **not started**, **not automatic**. Supervisor Review approved with notes; Security / Trust Review approved with notes; lint/test/build passed; authenticated visual smoke **not completed** — recommended before merge. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-level or all desktop layout gaps fully solved; do not treat **BX-I7D Tier 1** docs as **BX-I7D Tier 2** / **BX-I7E**–**BX-I7F** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; older journal entries may say **BX-I7D not started** — treat as historical at entry time
**Follow-up:** Authenticated visual QA for **`/courses`** and **`/courses/:id`** at wide desktop + **375px** before merge if not yet done; plan **BX-I7E**–**BX-I7F** and optional **BX-I7D Tier 2** separately; stop before commit per phase gate

### 2026-06-02 — Phase DOCS-BX-I7E1-HOUSEKEEPING documentation alignment (documentation only)

**Workflow:** DOCS-BX-I7E1-HOUSEKEEPING — align status docs after **BX-I7E1** implementation commit **`d0db43e`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale **`/tasks`** desktop layout status in §4.3 only). Records **BX-I7E1** **complete** (**CSS-only**, commit **`d0db43e`**): **`frontend/src/styles/layout.css`** only; at **`min-width: 1280px`**: **`/tasks`** horizontal command-controls desktop band (filters use available width; toolbar / Add study task aligns right when space allows); populated task list **2-column** grid (`:has(.task-workspace__list)`); create task FormCard full-width; inline edit item intended full width via **`:has(.task-workspace__edit-card)`**; loading/error/empty/filter-empty unaffected; **narrow responsive browser viewport ~375px** stacked; **no** **`GlobalTasksSection.jsx`**, **`TasksPage.jsx`**, **`TaskCard.jsx`**, component, API/backend/database/service/context/copy changes; **no** fake metrics, charts, sidebar, mobile/native UI. Improves Tasks desktop density — does **not** complete full Stitch-level UI or solve all desktop layout gaps. **BX-I7E2** (Flashcards), **BX-I7E3** (Trello), **BX-I7E4** (Admin), and **BX-I7F** (material cockpit) proposed follow-ups — **not started**, **not automatic**. Supervisor Review approved with notes; Security / Trust Review approved with notes; lint/test/build passed; inline edit not visually smoke-tested (no pending task); console audit not run — inline edit / console smoke recommended before merge if not yet done. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-level or all desktop layout gaps fully solved; do not treat **BX-I7E1** docs as **BX-I7E2**–**BX-I7E4** / **BX-I7F** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; older journal entries may say **BX-I7E not started** — treat as historical at entry time
**Follow-up:** Inline edit + console smoke on **`/tasks`** at **≥1280px** before merge if not yet done; plan **BX-I7E2**–**BX-I7E4** and **BX-I7F** separately; stop before commit per phase gate

### 2026-06-02 — Phase DOCS-BX-I7E2-HOUSEKEEPING documentation alignment (documentation only)

**Workflow:** DOCS-BX-I7E2-HOUSEKEEPING — align status docs after **BX-I7E2** implementation commit **`b18304c`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale **`/flashcards`** desktop layout status in §4.3 only). Records **BX-I7E2** **complete** (**CSS-only**, commit **`b18304c`**): **`frontend/src/styles/layout.css`** only; at **`min-width: 1280px`**: **`/flashcards`** horizontal command-controls desktop band (filters use available width; toolbar / Create flashcard aligns right when space allows); populated flashcard library **study \| manage** **2-column** layout (`:has(.flashcards-workspace__study-zone)`); manage list **2-column** grid when populated; create form and inline edit full-width (`:has(form)`); intro/loading/error/empty/filter-empty/status/create-cta full-width; **`actionError`** outside **`.flashcard-library`** unaffected; manage list truncated questions only — **no** answers newly exposed in manage list; **narrow responsive browser viewport ~375px** stacked; **no** **`GlobalFlashcardsSection.jsx`**, **`FlashcardsPage.jsx`**, **`FlashcardStudy.jsx`**, component, API/backend/database/service/context/copy changes; **no** fake metrics, charts, sidebar, mobile/native UI; **no** mastery/AI/memory/health score. Improves Flashcards desktop density — does **not** complete full Stitch-level UI or solve all desktop layout gaps. **BX-I7E3** (Trello), **BX-I7E4** (Admin), and **BX-I7F** (material cockpit) proposed follow-ups — **not started**, **not automatic**. Supervisor Review approved with notes; Security / Trust Review approved with notes; lint/test/build passed; **1536px** not explicitly smoke-tested; loading/error/**`actionError`** not intentionally triggered; console audit and formal keyboard tab smoke not run — optional recommended before merge. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-level or all desktop layout gaps fully solved; do not treat **BX-I7E2** docs as **BX-I7E3**–**BX-I7E4** / **BX-I7F** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; older journal entries may say **BX-I7E2 not started** — treat as historical at entry time
**Follow-up:** Optional loading/error/**`actionError`** / console / keyboard tab smoke on **`/flashcards`** at **≥1280px** before merge; plan **BX-I7E3 Tier A**–**BX-I7E4** and **BX-I7F** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I7E3-HOUSEKEEPING documentation alignment (documentation only)

**Workflow:** DOCS-BX-I7E3-HOUSEKEEPING — align status docs after **BX-I7E3 Tier A** implementation commit **`cba6dde`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale **`/trello`** desktop layout status in §4.3 only). Records **BX-I7E3 Tier A** **complete** (**CSS-only**, commit **`cba6dde`**): **`frontend/src/styles/layout.css`** only; at **`min-width: 1280px`**: **`/trello`** Step 1 credentials + Step 2 destination side-by-side on **`.trello-workspace__flow`**; Step 3 tasks, **`.trello-sync__messages`**, and Step 4 sync remain full-width; sync results stay below command band in **`.trello-workspace__results-zone`**; DOM step order unchanged (credentials → destination → tasks → messages → sync → results); **narrow responsive browser viewport ~375px** stacked; **no** Trello JSX/components/services/API/backend changes; **no** fake metrics, charts, sidebar, mobile/native UI; **Tier B not implemented** — no 2-column task list, no results grid, no wizard/results side-by-side, no scroll-height override. Improves Trello desktop setup density — does **not** complete full Stitch-level UI or solve all desktop layout gaps. **BX-I7E4** (Admin) and **BX-I7F** (material cockpit) and optional **BX-I7E3 Tier B** proposed follow-ups — **not started**, **not automatic**. Supervisor Review **approved**; Security / Trust Review **approved**; lint/test/build passed; authenticated visual smoke not live-tested — optional recommended before merge. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-level or all desktop layout gaps fully solved; do not treat **BX-I7E3 Tier A** docs as **BX-I7E3 Tier B** / **BX-I7E4** / **BX-I7F** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; older journal entries may say **BX-I7E3 not started** — treat as historical at entry time
**Follow-up:** Optional authenticated visual smoke on **`/trello`** at **≥1280px** and **375px** before merge; plan **BX-I7E4** and **BX-I7F** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I7E4-HOUSEKEEPING documentation alignment (documentation only)

**Workflow:** DOCS-BX-I7E4-HOUSEKEEPING — align status docs after **BX-I7E4** implementation commit **`467ccd9`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale **`/admin`** desktop layout status in §4.3 only). Records **BX-I7E4** **complete** (**CSS-only**, commit **`467ccd9`**): **`frontend/src/styles/layout.css`** only; at **`min-width: 1280px`**: **`/admin`** stats deck **`.admin-workspace__stats-deck`** → **2-column** grid; Platform overview, Trello today (UTC), and Backend status bands remain full-width (`grid-column: 1 / -1`); Tasks|Focus and Learning|Trello **`.admin-workspace__stats-row`** blocks sit side-by-side as adjacent grid cells; inner **`.admin-workspace__stats`** stat grids unchanged; loading/error/forbidden/**`AdminRoute`** states unaffected; **narrow responsive browser viewport ~375px** stacked; **no** **`AdminDashboardPage.jsx`**, API/backend/services/auth/copy changes; **no** fake metrics, charts, health scores, new KPIs, sidebar, or mobile/native UI; backend status remains existing honest **`stats.systemHealth.backend`** value only — **no** fake monitoring chrome. Improves Admin desktop stats deck density — does **not** complete full Stitch-level UI or solve all desktop layout gaps. **BX-I7F** (material cockpit final desktop pass) and optional **BX-I7E3 Tier B** / **BX-I7D Tier 2** proposed follow-ups — **not started**, **not automatic**. Supervisor Review **approved**; Security / Trust Review **approved**; lint/test/build passed; authenticated visual smoke not live-tested — optional recommended before merge. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-level or all desktop layout gaps fully solved; do not treat **BX-I7E4** docs as **BX-I7F** / **BX-I7E3 Tier B** / **BX-I7D Tier 2** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; older journal entries may say **BX-I7E4 not started** — treat as historical at entry time
**Follow-up:** Optional authenticated visual smoke on **`/admin`** at **≥1280px** and **375px** before merge; plan **BX-I7F** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I7F-HOUSEKEEPING / BX-I7 closeout documentation alignment (documentation only)

**Workflow:** DOCS-BX-I7F-HOUSEKEEPING — align status docs after **BX-I7F** implementation commit **`25988dc`** (`style: complete material cockpit desktop pass`)

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale material cockpit / **BX-I7** desktop status in §4.3). Records **BX-I7F** **complete** (**CSS-only**, commit **`25988dc`**): **`frontend/src/styles/layout.css`** only; at **`min-width: 1280px`** on **`/study-materials/:materialId`**: success-body cockpit **Source | AI** **1.15fr | 0.85fr** (`:has(.material-workspace__cockpit)`); **plan-history** / **plan-import** action rows horizontal with wrap; material flashcards library **study | manage** **2-column** (`:has(.flashcard-library__study)`); manage list **2-column**; create/inline edit full-width (`:has(form)`); loading/error/not-found/page-error unaffected; **375px** stacked; **`/flashcards`** unaffected; **no** JSX/API/services/backend/auth/AI generate/import/save/history behavior/logging/content-exposure changes; plan history list/preview unchanged. **BX-I7** desktop layout sequence **now complete**: **BX-I7B**, **BX-I7C**, **BX-I7D Tier 1**, **BX-I7E1**, **BX-I7E2**, **BX-I7E3 Tier A**, **BX-I7E4**, **BX-I7F**. UI improved but **not** claimed as final Stitch-perfect product. Optional deferred only: **BX-I7D Tier 2** (course detail materials | tasks side-by-side), **BX-I7E3 Tier B** (Trello task-list grid) — **not started**, **not automatic**. Prior Security / Trust Review **PASS** for implementation gate. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect or optional Tier 2 / Tier B is shipped; do not treat **BX-I7F** docs as **BX-I7D Tier 2** / **BX-I7E3 Tier B** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; older journal entries may say **BX-I7F not started** or material cockpit gap remains — treat as historical at entry time
**Follow-up:** Optional authenticated visual smoke on **`/study-materials/:id`** at **≥1280px** and **375px** before merge; plan optional **BX-I7D Tier 2** / **BX-I7E3 Tier B** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I8B-HOUSEKEEPING — BX-I8B documentation alignment (documentation only)

**Workflow:** DOCS-BX-I8B-HOUSEKEEPING — align status docs after **BX-I8B** implementation commit **`bda2645`** (`style: polish ai command surfaces`)

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale AI command surface / Stitch polish status in §6.3). Records **BX-I8B** **complete** (**CSS-only**, commit **`bda2645`**): **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only; on **`/study-materials/:materialId`**: material-detail AI command surfaces use stronger violet/glass treatment; **Generate** CTA remains electric blue / primary; **375px** stacked; **BX-I7F** material cockpit layout preserved; **no** `tokens.css`, JSX, API, services, backend, auth, routes, behavior, copy, logging, or content-exposure changes; **no** fake metrics, charts, scores, sidebar, or mobile-native UI. Prior Security / Trust Review **PASS** for implementation gate. UI improved but **not** claimed as final Stitch-perfect product. Next likely phases **BX-I8C** (Auth + PageHeader intro chrome), **BX-I8D** (Motion micro-pass), **BX-I8E** (Global controls / card shape alignment) — **proposed**, **not started**, **not automatic**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I8B** docs as **BX-I8C**/**BX-I8D**/**BX-I8E** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; authenticated visual smoke recommended before merge — optional, does **not** block commit
**Follow-up:** Optional authenticated visual smoke on material-detail AI command surfaces; plan **BX-I8C**–**BX-I8E** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I8C-HOUSEKEEPING — BX-I8C documentation alignment (documentation only)

**Workflow:** DOCS-BX-I8C-HOUSEKEEPING — align status docs after **BX-I8C** implementation commit **`8008dc1`** (`style: polish auth and page header chrome`)

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale auth/PageHeader intro polish status in §6.3). Records **BX-I8C** **complete** (**CSS-only**, commit **`8008dc1`**): **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only; auth screens use glass/command-center **`.page--auth .form-card`** chrome; intro **`PageHeader`** uses glass intro band + top gradient rule (**.page-header--intro** only); **`.auth-brand`** polish; course accent header preserved; **375px** stacked; **BX-I7** / **BX-I8B** layouts preserved; **no** `tokens.css`, **`base.css`**, JSX, API, services, backend, auth, routes, behavior, copy, logging, or content-exposure changes; **no** fake metrics, charts, scores, sidebar, or mobile-native UI. Prior Security / Trust Review **PASS** for implementation gate. Focus-visible clipping smoke on intro header actions **recommended but not blocking**. UI improved but **not** claimed as final Stitch-perfect product. Next likely phases **BX-I8D** (Motion micro-pass), **BX-I8E** (Global controls / card shape alignment) — **proposed**, **not started**, **not automatic**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I8C** docs as **BX-I8D**/**BX-I8E** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; focus-visible clipping smoke recommended but not blocking
**Follow-up:** Optional auth + intro **`PageHeader`** visual smoke; plan **BX-I8D**–**BX-I8E** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I8D-HOUSEKEEPING — BX-I8D documentation alignment (documentation only)

**Workflow:** DOCS-BX-I8D-HOUSEKEEPING — align status docs after **BX-I8D** implementation commit **`51cdc77`** (`style: motion micro-pass for processing and success states`)

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale motion/processing status in §6.3, §6.9, §8.2, §10). Records **BX-I8D** **complete** (**CSS-only**, commit **`51cdc77`**): **`frontend/src/styles/components.css`** + **`frontend/src/styles/base.css`** only; processing opacity pulse on **`.ai-panel__loading--active .loading`** only during real AI generate; one-shot **`plan-fade-in`** on **`.plan-panel__status--success`**, **`.plan-history__preview-panel`**, **`.focus-done`**; **`prefers-reduced-motion`** disables pulse/entrances/press transforms; **375px** stacked; **BX-I7** / **BX-I8B** / **BX-I8C** layouts preserved; **no** JSX/JS/API/backend/routes/tokens/behavior/copy/**`aria-live`** changes; **no** route transitions, **`App.jsx`**, **`useLocation`**, fake idle AI thinking, fake metrics/charts, or idle decorative infinite animation. Prior Security / Trust Review **PASS** for implementation gate. Manual smoke **recommended before merge**, **not blocking**. UI improved but **not** claimed as final Stitch-perfect product. Next likely phase **BX-I8E** (Global controls / card shape alignment) — **proposed**, **not started**, **not automatic**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I8D** docs as **BX-I8E** approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; manual smoke recommended before merge — optional, does **not** block commit
**Follow-up:** Optional motion visual smoke (generate pulse, success/preview, focus complete, reduce motion); plan **BX-I8E** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I8E-HOUSEKEEPING — BX-I8E documentation alignment (documentation only)

**Workflow:** DOCS-BX-I8E-HOUSEKEEPING — align status docs after **BX-I8E** implementation commit **`52b7b78`** (`style: align shared controls and card surfaces`)

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale global control/card baseline status in §6.2–§6.3). Records **BX-I8E** **complete** (**CSS-only**, commit **`52b7b78`**): **`frontend/src/styles/components.css`** only; conservative shared primitive alignment — **`.form-card`** baseline glass-border + subtle raised gradient; **`.source-card`** baseline glass-border only; **`.link-btn`** parity with **`.btn`** variants (**`--primary`** / **`--danger`** unused in JSX); **`.alert--success`** visual parity with error alerts; **`layout.css`** / **`tokens.css`** / **`base.css`** untouched; **375px** stacked; **no** JSX/API/backend/routes/services/behavior/copy/logging changes; **no** fake metrics/charts/scores/sidebar/mobile-native UI; optional scope **not implemented** (no **`dashboard-empty-cta__link`**, empty/status unification, command-band/hero/AI cockpit/auth PageHeader/**BX-I7** grid). Visual Style Guide v2.2 alignment check **passed** — token/radius/font/AI-gradient gaps **deferred**. Prior Security / Trust Review **PASS**. Manual smoke **recommended before merge**, **not blocking**. UI improved but **not** claimed as final Stitch-perfect product. Deferred follow-ups: token/radius alignment phase, optional AI Generate gradient phase, optional **flashcard-study** glass polish, optional Stitch visual guide artifact documentation — **proposed**, **not automatic**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I8E** docs as token/radius/gradient phase approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; manual smoke recommended before merge — optional, does **not** block commit
**Follow-up:** Optional shared-control/card visual smoke; plan deferred token/radius/gradient phases separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-I8F — Stitch visual style guide v2.2 reference artifact (documentation only)

**Workflow:** DOCS-I8F — record Stitch Visual Style Guide v2.2 as reference artifact only
**ADR refs:** none
**Summary:** Documentation-only alignment in **`DESIGN.md`**, **`docs/CURRENT_STATE.md`**, **`docs/IMPLEMENTATION_STATUS.md`**, and **`docs/AGENT_MEMORY.md`**. Confirms **`docs/design/studyops_ai_visual_style_guide_v2_2.md`** exists and contains Visual Style Guide **v2.2** content (palette, course accents, typography, UI patterns, component guidance, UX rules). **`DESIGN.md` remains the official project design document**; the v2.2 guide is **reference only** and does **not** automatically approve new features or code changes; each design implementation still requires a **separate phase gate**. Records **BX-I8E** shared controls / card surfaces alignment check **passed** against the guide. Records **BX-I8F** visual smoke audit **passed with notes**. Deferred optional follow-ups (**not automatic**): token/radius alignment; AI Generate gradient; flashcard-study glass polish; course accent width alignment; Hanken Grotesk only with separate font approval; narrow nav focus / material source-type pill polish only if separately approved. **No** `frontend/src/**`, **no** `backend/**`, **no** `package.json` / lockfile, **no** `tokens.css` changes in this phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not treat the v2.2 guide as implementation approval; do not merge Stitch HTML/CSS into **`frontend/src`**; do not start deferred polish without explicit **`approved — implement Phase X`**
**Follow-up:** Plan deferred follow-ups as separate gated phases; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I9B1-HOUSEKEEPING — BX-I9B1 documentation alignment (documentation only)

**Workflow:** DOCS-BX-I9B1-HOUSEKEEPING — align status docs after **BX-I9B1** implementation commit **`9ec2917`** (`style: align radius tokens with stitch guide`)

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale radius/token status in §6.2–§6.3). Records **BX-I9B1** **complete** (**CSS-only**, commit **`9ec2917`**): **`frontend/src/styles/tokens.css`** + **`frontend/src/styles/components.css`** only; Stitch Round Eight — **`--radius-sm`**: **8px**; **`--radius-md`**: **12px**; **`--radius-lg`** / **`--radius-xl`** unchanged; **`.btn`** / **`.link-btn`** use **`--radius-md`**; **`.field__*`** remain **`--radius-sm`**; **no** color/shadow/spacing/typography token changes; **`layout.css`** / **`base.css`** untouched; **no** JSX/API/backend/routes/services/behavior/copy/logging changes; **no** AI Generate gradient; **no** flashcard-study polish; **no** **BX-I9B2** color work; indirect token cascade to pills/cards **expected**. Prior Security / Trust Review **PASS**. Authenticated visual smoke **recommended before merge**, **not blocking**. Next likely phase **BX-I9B2** color token alignment — **planning only**, **not started**, **not automatic**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I9B1** docs as **BX-I9B2** color phase approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; indirect radius cascade is intentional — not a scope leak
**Follow-up:** Optional authenticated radius visual smoke; plan **BX-I9B2** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I9B2a-HOUSEKEEPING — BX-I9B2a documentation alignment (documentation only)

**Workflow:** DOCS-BX-I9B2a-HOUSEKEEPING — align status docs after **BX-I9B2a** implementation commit **`f92cbda`** (`style: align canvas and shell tokens with stitch guide`)

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale canvas/shell color status in §6.2–§6.3). Records **BX-I9B2a** **complete** (**CSS-only**, commit **`f92cbda`**): **`frontend/src/styles/tokens.css`** only; canvas/shell environment tokens — **`--color-bg`** **`#0F172A`**; **`--color-bg-subtle`** harmonized; **`--color-bg-auth`** harmonized; **`--color-shell-bg`** toward **`#0B0F1A`** (translucency preserved); **`--color-shell-border`** slightly softened; **no** **`--radius-*`** changes; **no** primary/AI/cyan/danger/focus/glow/shadow/surface/text/editor/chart/course-accent token changes; **`components.css`** / **`layout.css`** / **`base.css`** untouched; **no** JSX/API/backend/package changes; **no** AI Generate gradient; **no** flashcard-study polish; **no** glass/elevation pass; indirect cascade via **`layout.css`** **`var(--color-bg*)`** / shell vars **expected**. Supervisor Review **PASS**. Security / Trust Review **PASS**. Authenticated visual smoke **recommended before merge**, **not blocking**. **BX-I9B2b** primary/cyan color token alignment — **planning only**, **not started**, **not automatic**. **BX-I9B2c** / **BX-I9B2d** **not started**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I9B2a** docs as **BX-I9B2b**–**BX-I9B2d** color phase approval; **375px** = **narrow responsive browser viewport** — not mobile-app scope; indirect canvas/shell cascade is intentional — not a scope leak
**Follow-up:** Optional authenticated canvas/shell visual smoke; plan **BX-I9B2b** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I9B2b-HOUSEKEEPING — BX-I9B2b documentation alignment (documentation only)

**Workflow:** DOCS-BX-I9B2b-HOUSEKEEPING — align status docs after **BX-I9B2b** implementation commit **`b4d7b93`** (`style: align primary and cyan tokens with stitch guide`)

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (stale primary/cyan color status in §6.2–§6.3). Records **BX-I9B2b** **complete** (**CSS-only**, commit **`b4d7b93`**): **`frontend/src/styles/tokens.css`** only; primary/cyan/data/chart/focus/glow-primary tokens — **`--color-primary`** **`#3B82F6`**; **`--color-primary-hover`** **`#2563EB`**; subtle/border rgba **rgb(59, 130, 246)**; **`--color-primary-fill`** **`#2563EB`** / **`--color-primary-fill-hover`** **`#1D4ED8`** (**not** **`#3B82F6`** on fill — WCAG AA white labels); focus/glow/shadow-focus* re-based **rgb(59, 130, 246)**; **`--color-data-accent`** **`#06B6D4`**; chart series-1/2/fill harmonized; **no** radius/canvas/shell/AI/violet/danger/surface/text/editor/course-accent/admin/**`--glow-ai`** changes; **`components.css`** / **`layout.css`** / **`base.css`** untouched; **no** JSX/API/backend/package changes. Supervisor Review **PASS**. Security / Trust Review **PASS**. Authenticated visual smoke **recommended before merge** (primary links on glass/cards, dashboard hero cyan eyebrow, focus rings) — **not blocking**. **BX-I9B2c** AI/violet color token alignment — **planning only**, **not started**, **not automatic**. **BX-I9B2d** **not started**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I9B2b** docs as **BX-I9B2c**–**BX-I9B2d** or AI/violet phase approval; do not set **`--color-primary-fill`** to **`#3B82F6`** in future work without WCAG review; **375px** = **narrow responsive browser viewport** — not mobile-app scope; indirect primary/cyan cascade is intentional — not a scope leak; primary links on glass may need follow-up QA — not fixed in **BX-I9B2b**
**Follow-up:** Optional authenticated **BX-I9B2b** visual smoke; plan **BX-I9B2c** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I9B2c-HOUSEKEEPING — BX-I9B2c documentation alignment (documentation only)

**Workflow:** DOCS-BX-I9B2c-HOUSEKEEPING — align status docs after **BX-I9B2c** implementation commit **`19d444e`** (`style: align AI violet tokens with stitch guide`)

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, **`DESIGN.md`** (§6.2–§6.3), and **`docs/design/STITCH_VISUAL_STYLE_GUIDE.md`** (stale M3 **`#d0bcff`** vs production **`#8B5CF6`** mapping). Records **BX-I9B2c** **complete** (**CSS-only**, commit **`19d444e`**): **`tokens.css`** AI/violet family + **`--glow-ai`**; **`components.css`** **20** + **`layout.css`** **3** mechanical lavender replacements; alphas preserved; stale lavender check passed; **no** radius/canvas/shell/primary/cyan/danger/error changes; **no** JSX/API/backend/package changes; **Generate** CTA remains primary blue. Supervisor Review **PASS**. Security / Trust Review **PASS**. Authenticated visual smoke **recommended before merge** (material AI cockpit, dashboard hero violet tint, AppShell accent strip, auth brand gradient) — **not blocking**. **BX-I9B2d** danger/error color token alignment — **planning only**, **not started**, **not automatic**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I9B2c** docs as **BX-I9B2d** or AI Generate gradient approval; M3 YAML **`secondary: #d0bcff`** in Stitch export is **not** production AI accent — use **`#8B5CF6`**; **375px** = **narrow responsive browser viewport** — not mobile-app scope
**Follow-up:** Optional authenticated **BX-I9B2c** visual smoke; plan **BX-I9B2d** separately; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I9B2d-HOUSEKEEPING — BX-I9B2d documentation alignment (documentation only)

**Workflow:** DOCS-BX-I9B2d-HOUSEKEEPING — align status docs after **BX-I9B2d** implementation commit **`ae5cfc8`** (`style: align danger and error tokens with stitch guide`)

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (§6.2–§6.3). Records **BX-I9B2d** **complete** (**CSS-only**, commit **`ae5cfc8`**): **`frontend/src/styles/tokens.css`** only — Stitch v2.2 Error / Rose Red **`#E11D48`** danger/error family; **`--color-danger-fill`** **`#be123c`** (**not** **`#e11d48`**); **`--color-error`** **`#fda4af`** (**not** **`#e11d48`**); course accent rose tokens **unchanged**; stale red check passed; **no** **`components.css`** / **`layout.css`** / JSX / API / backend changes. Supervisor Review **PASS**. Security / Trust Review **PASS**. Merge QA **recommended** (danger border vs course rose border; delete buttons; **`.alert--error`**; **`.field__error`**; Trello failed rows) — **not blocking**. Completes **BX-I9B2** color token sub-sequence (**BX-I9B2a**–**BX-I9B2d**). Next likely **final visual QA / smoke pass** — **not automatic**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I9B2d** docs as AI Generate gradient or **flashcard-study** polish approval; **`--color-danger-border`** and **`--color-course-accent-rose-border`** may share **`rgba(251, 113, 133, 0.35)`** — verify visually; **375px** = **narrow responsive browser viewport** — not mobile-app scope
**Follow-up:** Optional merge-time visual QA for danger/error vs course rose; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I10A2 — BX-I10A2 material-only AI Generate gradient record (documentation only)

**Workflow:** DOCS-BX-I10A2 — record **BX-I10A2** implementation + reviews + **BX-I10A2-SMOKE** after commit **`b90108e`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (§6.3). Records **BX-I10A2** **complete** (**CSS-only**, commit **`b90108e`**): **`frontend/src/styles/components.css`** only — scoped violet→blue gradient on material **Generate study plan** via **`.page--material-detail .material-workspace__cockpit-ai .material-workspace__generate .ai-panel__actions .btn.btn--primary`**; global **`.btn--primary`** unchanged; **Save** / auth / dashboard / flashcards / Trello / task primaries remain standard blue; generate handler, loading/disabled, API flow, copy **unchanged**; **no** JSX/API/backend/package/token/layout/base changes. Supervisor Review **Approve with notes**. Security / Trust Review **Pass with notes**. **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed. **BX-I10A2-SMOKE** **Pass with notes** on Vite dev **`http://localhost:5173`** — material detail **~375px** / **1280px**; spot checks dashboard, auth, flashcards, Trello; **no** horizontal overflow; **Source \| AI** desktop layout held; **no** sensitive logging. **Non-blocking:** Generate loading not live-triggered; plan history/import not visible on QA material; expected generated-plan **404** as empty state. **BX-I10A3**–**BX-I10A5** and **ROADMAP-A1** **proposed**, **not started**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I10A2** docs as **BX-I10A3**+ or glass/elevation approval; gradient applies **only** to material AI generate panel primary button — not global primary tokens; use Vite dev origin for QA — not **`vite preview`** at **`127.0.0.1:4173`**; **375px** = **narrow responsive browser viewport** — not mobile-app scope
**Follow-up:** Optional live Generate loading QA; plan history/import QA after generating a plan; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I10A1 — BX-I10A1 flashcard study glass polish record (documentation only)

**Workflow:** DOCS-BX-I10A1 — record **BX-I10A1** implementation + **BX-I10A1-SMOKE** after commit **`e62c1b0`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (§6.6). Records **BX-I10A1** **complete** (**CSS-only**, commit **`e62c1b0`**): **`frontend/src/styles/components.css`** only — frosted glass centered **`.flashcard-study`** stage; improved Q/A hierarchy; saved library study variant verified in smoke; **FlashcardStudy** behavior unchanged (reveal, prev/next, counter, plain-text); **Generate** CTA remains primary blue; **no** JSX/API/backend/package/token changes. Supervisor Review **Approve — safe to commit**. Security / Trust Review **Pass**. **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed. **BX-I10A1-SMOKE** **Pass with notes** on Vite dev **`http://localhost:5173`** at **~375px** / **1280px** — **`/flashcards`**, **`/study-materials/:id`**; **no** horizontal overflow; material **Source \| AI** desktop layout held; **no** console errors or sensitive logging observed. **Non-blocking:** **`flashcard-study--plan`** not live-verified (no plan with flashcards on QA material). **BX-I10A2** Material-only AI Generate gradient **proposed**, **not started**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I10A1** docs as **BX-I10A2** or glass/elevation approval; use Vite dev origin for QA — not **`vite preview`** at **`127.0.0.1:4173`**; **375px** = **narrow responsive browser viewport** — not mobile-app scope
**Follow-up:** Optional plan-variant flashcard smoke after generate; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I9C — BX-I9C final visual QA record (documentation only)

**Workflow:** DOCS-BX-I9C — record **BX-I9C** + **BX-I9C-Auth** visual QA outcomes after **BX-I9B1** + **BX-I9B2a**–**BX-I9B2d**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (§6.2–§6.3). Records **BX-I9C** **complete** (**review only**, **Pass with notes**): initial pass on **`/`**, **`/register`**; authenticated matrix incomplete until **BX-I9C-Auth**. Records **BX-I9C-Auth** **complete** (**review only**, **Pass with notes**) on **`http://localhost:5173`** at **~375px** / **1280px** / **1440px** — routes **`/dashboard`**, **`/courses`**, **`/courses/:id`**, **`/study-materials/:id`**, **`/tasks`**, **`/flashcards`**, **`/trello`** (partial), **`/focus/:taskId`**, **`/admin`** forbidden, auth routes. Verified radius/canvas/primary/cyan/AI/violet/danger/error held; material cockpit side-by-side at desktop; **Generate** CTA primary blue; course accents distinct from danger; **no** horizontal overflow on checked routes; **no** console errors or sensitive logging. Runtime test data only (**not** repo): **`bx-i9c-auth-20260603@example.test`**, **BX-I9C QA Course**, **BX-I9C QA Material**, **BX-I9C QA Task**. **Non-blocking:** Trello failed rows not exercised; keyboard/focus automation limited. **Not** final Stitch-perfect. CI on **main** already green after **BX-I9B2d**. **No** application code changes.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I9C** docs as AI Generate gradient / **flashcard-study** / glass/elevation approval; use Vite dev origin for QA — not **`vite preview`** at **`127.0.0.1:4173`**; **375px** = **narrow responsive browser viewport** — not mobile-app scope
**Follow-up:** Optional separate-gated polish only; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I10A3 — BX-I10A3 filter-toolbar glass unification record (documentation only)

**Workflow:** DOCS-BX-I10A3 — record **BX-I10A3** implementation + reviews + **BX-I10A3-SMOKE** after commit **`cb54ec5`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (§6.3). Records **BX-I10A3** **complete** (**CSS-only**, commit **`cb54ec5`**): **`frontend/src/styles/layout.css`** only — global **`.filter-toolbar`** glass/inset surfaces; segmented filter inset glass; task/flashcard/course filter surfaces inherit shared style; quiet-glass filter-empty strips (scoped selectors, **not** global **`.section__meta`** rewrite); tasks/flashcards empty-state downgrades neutralized; **`prefers-reduced-motion`** disables toolbar backdrop blur; **no** JSX/API/backend/package/**`components.css`**/**`tokens.css`** changes; filter/search/task behavior unchanged. Supervisor Review **Approve with notes**. Security / Trust Review **Pass with notes**. **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed. **BX-I10A3-SMOKE** **Pass with notes** on Vite dev **`http://localhost:5173`** at **~375px** / **1280px** — **`/tasks`**, **`/flashcards`**, **`/courses/:id`**, material spot check; **no** horizontal overflow; **BX-I10A1** study surface, **BX-I10A2** Generate gradient, material AI cockpit unchanged; **no** sensitive logging in UI. **Non-blocking:** flashcards filter-empty and true empty state not reachable with QA seed; MCP console export limited. **BX-I10A4**–**BX-I10A5**, **BX-I10A6-QA**, and **ROADMAP-A1** **proposed**, **not started**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I10A3** docs as **BX-I10A4**+ or glass/elevation approval; filter glass is **`layout.css`** only — does **not** change **BX-I10A2** Generate gradient (**`components.css`**) or **BX-I10A1** study surface; use Vite dev origin for QA — not **`vite preview`** at **`127.0.0.1:4173`**; **375px** = **narrow responsive browser viewport** — not mobile-app scope
**Follow-up:** Optional flashcards filter-empty QA with empty-library seed; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I10A4 — BX-I10A4 course/document accent rail record (documentation only)

**Workflow:** DOCS-BX-I10A4 — record **BX-I10A4** implementation + reviews + **BX-I10A4-SMOKE** after commit **`7e5e61f`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (§6.3). Records **BX-I10A4** **complete** (**CSS-only**, commit **`7e5e61f`**): **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only — **6px** course identity rails on subject shelf, course-shelf, dashboard course cards; dashboard stat chips **~3px**; course detail header inset **4px**; materials primary section **4px** top rule; **3px** muted document-shelf left hint with **`color-mix(in srgb, var(--course-accent-border) 55%, var(--color-border-strong))`** (hover full accent); document/material cards remain secondary; **no** JSX/**`StudyMaterialDetail.jsx`**/**`tokens.css`**/**`base.css`**/backend/API/package/docs changes during implementation; **BX-I10A1** flashcard study, **BX-I10A2** Generate gradient, **BX-I10A3** filter toolbar, material AI cockpit unchanged. Supervisor Review **Approve with notes**. Security / Trust Review **Pass with notes**. **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed. **BX-I10A4-SMOKE** **Pass with notes** on Vite dev **`http://localhost:5173`** at **~375px** / **1280px** — **`/courses`**, **`/dashboard`**, **`/courses/:id`**, material + flashcards spot checks; **no** horizontal overflow; **no** sensitive logging in UI. **Non-blocking:** rose accent not in QA seed; document-shelf pointer hover not fully verified; MCP console export limited. **BX-I10A5**, **BX-I10A6-QA**, **ROADMAP-A1**, and material detail course accent JSX **proposed**, **not started**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I10A4** docs as **BX-I10A5** glass/elevation or Trello failed-row approval; accent rails are presentation-only — **no** behavior/API changes; use Vite dev origin for QA — not **`vite preview`** at **`127.0.0.1:4173`**; **375px** = **narrow responsive browser viewport** — not mobile-app scope; **`color-mix`** fallback drops muted tint only — not a danger state
**Follow-up:** Optional rose-accent QA course seed; optional pointer-hover verification on document shelf; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I10A5 — BX-I10A5 targeted glass/elevation pass record (documentation only)

**Workflow:** DOCS-BX-I10A5 — record **BX-I10A5** implementation + reviews + **BX-I10A5-SMOKE** after commit **`38aa561`**

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (§6.3). Records **BX-I10A5** **complete** (**CSS-only**, commit **`38aa561`**): **`frontend/src/styles/components.css`** + **`frontend/src/styles/layout.css`** only — softened navigable-card hover (**`--elevation-1`**, **`transform: none`**); quiet inline glass on tasks create/edit, flashcards library/create, Trello wizard/sync/results steps, course settings/create-material/materials empty; optional **`.trello-task-list__label`** polish + Focus session outer panel softening; **`prefers-reduced-motion`** disables new glass **`backdrop-filter`**; **no** JSX/API/backend/package/**`tokens.css`**/**`base.css`** changes during implementation; **BX-I10A1** flashcard study, **BX-I10A2** Generate gradient, **BX-I10A3** filter toolbar, **BX-I10A4** accent rails, dashboard hero, material AI cockpit, material editor/library elevation **unchanged**. Supervisor Review **Pass with notes**. Security / Trust Review **Pass with notes**. **`npm.cmd run lint`**, **`npm.cmd test`**, **`npm.cmd run build`** passed. **BX-I10A5-SMOKE** **Pass with notes** on Vite dev **`http://localhost:5173`** at **~375px** / **1280px** (**narrow responsive browser viewport**, **not** native mobile) — **`/dashboard`**, **`/courses`**, **`/courses/:id`**, **`/tasks`**, **`/flashcards`**, **`/trello`**, **`/focus/:taskId`**, **`/study-materials/:id`** spot check; **no** horizontal overflow; **no** sensitive logging in UI. **Non-blocking:** materials empty dashed state not reachable (QA course had one material); real pointer hover not fully MCP-verified; MCP console export limited. **BX-I10A6-QA**, optional material editor/library elevation, global shadow/token cleanup, and **ROADMAP-A1** **proposed**, **not started**. **No** application code changes in this housekeeping phase.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim UI is final Stitch-perfect; do not treat **BX-I10A5** docs as **BX-I10A6-QA** Trello failed-row or material editor elevation approval; glass/elevation pass is presentation-only — **no** behavior/API changes; use Vite dev origin for QA — not **`vite preview`** at **`127.0.0.1:4173`**; **375px** = **narrow responsive browser viewport** — not mobile-app scope; hardcoded inset **`rgba(218, 226, 253, …)`** highlights are cosmetic — not security issues
**Follow-up:** Optional materials-empty QA on zero-material course; optional manual pointer-hover spot-check on navigable cards; stop before commit per phase gate

### 2026-06-03 — Phase DOCS-BX-I10A6-QA — BX-I10A6-QA Trello failed-row live verification record (documentation only)

**Workflow:** DOCS-BX-I10A6-QA — record **BX-I10A6-QA** review-only QA after **BX-I9B2d** danger/error tokens + **BX-I10A5** glass/elevation pass

**ADR refs:** none
**Summary:** Documentation-only alignment in **`CURRENT_STATE.md`**, **`IMPLEMENTATION_STATUS.md`**, **`AGENT_MEMORY.md`**, and **`DESIGN.md`** (§6.3). Records **BX-I10A6-QA** **complete** (**review only**, **Pass with notes**, **no** repo file changes). Live verification on Vite dev **`http://localhost:5173`**: route **`/trello`** at **~375px** / **1280px** (**narrow responsive browser viewport**, **not** native mobile). Failed sync row triggered with harmless fake Trello API key/token — **no** real credentials, **no** Trello cards created; backend **HTTP 401** / **`TRELLO_AUTH`** / structured **`trello_api_error`** only. Step 5 **Sync results**: failed row, **FAILED** badge, and error text readable; danger/error tokens distinct from course rose and success green; Trello command deck, picker, Sync button, and credential hygiene regressions held; results/failed row **no** horizontal overflow. **Non-blocking:** placeholder list ID via one-time runtime **`onListChange`** workaround; top-nav horizontal scroll at **~375px** pre-existing shell behavior; full frontend console history not captured retroactively. **Recommendation:** close **BX-I10A6-QA** — **no** separate fix phase. **ROADMAP-A1**, optional material detail course accent JSX, optional material editor/library elevation, optional top-nav shell polish **proposed**, **not started**.
**APIs affected:** none
**Tests:** none (docs-only)
**Pitfalls:** Do not claim **BX-I10A6-QA** approved Trello implementation fixes or top-nav shell changes; do not treat failed-row QA as proof of real Trello integration; use Vite dev origin — not **`vite preview`** at **`127.0.0.1:4173`**; **375px** = **narrow responsive browser viewport** — not mobile-app scope; list ID workaround is QA-only — not a product requirement
**Follow-up:** **ROADMAP-A1** only with explicit approval; optional polish phases remain separate-gated
