# DESIGN.md — StudyOps AI (v2)

**Status:** Phase 2I-c UI/UX specification; styling applied Phase **2J**; polish refined Phase **8A**; global shell + workspace presentation complete Phase **8C-1** through **8C-3D**

**Last updated:** 2026-05-30 (Phase **9B** docs alignment)
**Supersedes:** Phase 1G `DESIGN.md` (2026-05-20)

---

## 0. Document control and authority

| Document | Role |
|----------|------|
| **`docs/PRD.md`** | Product intent and future MVP features |
| **`docs/IMPLEMENTATION_STATUS.md`** | **What is built today** — routes, APIs, deferred work |
| **`DESIGN.md` (this file)** | **Presentation and UX only** — does not change scope, APIs, database, or security |
| **`docs/STITCH_BRIEF.md`** | **Historical** Stitch session input (Phase 2I — advisory); informed v2; **not** current product scope |
| **Stitch mockups / exports** | **Inspiration only** — not source of truth; never merge HTML/React into the repo |

**Stitch review:** Human-approved **NotebookLM-inspired** visual direction (academic study workspace, source-first, calm productivity). StudyOps is **not** a NotebookLM clone—borrow principles and feeling, not branding, layout identity, or NotebookLM-only features.

**Screenshots:** Reference captures live under `docs/design/screenshots/` (see `docs/design/SCREENSHOT_INDEX.md`). **`11-generated-plan-visible.png`** — **captured** (Phase 2K-c). **Pending:** `15-processing-with-ai.png` — do not fabricate. **Visual drift:** committed PNGs may predate Phase **8C** workspace polish (AppShell, cockpit layouts, AI zones) unless recaptured.

---

## 1. Purpose and scope

This document defines how the **implemented** StudyOps AI frontend should look and behave. **Styling was applied in Phase 2J**, **refined in Phase 8A**, and **workspace presentation completed in Phase 8C-1 through 8C-3D** (global **`AppShell`**, design tokens, cockpit layouts on all workspace routes). Further presentation changes require explicit human approval. It applies to:

- Auth (`/`, `/register`)
- Student dashboard with functional stats UI (`/dashboard`)
- Courses (`/courses`, `/courses/:id`)
- Study materials (`/study-materials/:materialId`) including **Generate study plan** and **load/clear latest saved plan**
- Tasks (`/tasks`, course-level task UI on `/courses/:id`)
- Flashcards (`/flashcards`, saved flashcards on material detail)
- Trello sync (`/trello`)
- Focus sessions (`/focus/:taskId`)
- Admin aggregate stats (`/admin`)

**Out of this document’s authority:** New routes or features beyond what **`docs/IMPLEMENTATION_STATUS.md`** lists as built; deployment; backend changes; saved-plan **library** or plan **history** UI. **Note:** Tasks, flashcards, Trello, focus, admin aggregate stats, and dashboard analytics **are implemented** — this file guides **presentation only** for those screens, not product scope.

**Goal:** A **NotebookLM-inspired academic study workspace**—clean, Google-like productivity, source-first, modern AI study cockpit—without clinical aesthetics or scope creep.

---

## 2. Product feeling and positioning

### Positioning

StudyOps AI is a **source-first learning workspace** where a student organizes **courses** and **study materials** (saved text), then runs **AI-assisted study planning** on saved content. It should feel like a calm place to read, edit, and plan—not a social app, hospital system, or corporate analytics dashboard.

### Qualities

| Quality | Intent |
|---------|--------|
| **Academic & calm** | NotebookLM-inspired restraint; focus on reading and sources |
| **Productive** | Clean Google-like clarity; predictable chrome |
| **Source-first** | Materials feel like “documents in a course,” not generic CRUD rows |
| **Trustworthy** | Honest empty/loading/error states; no fake metrics |
| **Grounded AI** | Generate feels helpful and connected to saved material—not flashy or gamified |
| **Readable** | Long study text is comfortable to read and edit |
| **Modern** | Professional, pleasant, slightly contemporary—non-clinical |

### Tone

Supportive and direct. Example: *“Save changes before generating — generation uses your last saved material.”* Avoid hype, streaks, or “AI magic” marketing copy.

### Inspiration (principles only — do not clone)

| Borrow | Do not copy |
|--------|-------------|
| Warm canvas + white cards + soft elevation | NotebookLM logo, exact layout, purple/brand lock-in |
| Source/document card metaphor for materials | Source drawer, library search, recent sources panel |
| Subject workspace for course detail | Multi-panel notebook, citations, audio overview |
| Subtle AI accent zone on generate/plan | Neon gradients, hacker terminal, medical teal |

Earlier briefs referenced Notion/Linear/Raycast **principles**; v2 primary visual direction is **NotebookLM-inspired academic workspace** within the same guardrails (familiar, original).

---

## 3. Visual language

### Canvas and surfaces

- **Page background:** Warm off-white or light gray (`--color-bg`).
- **Cards / forms:** Clean white (`--color-surface`) on canvas.
- **Borders:** Soft, low-contrast (`--color-border`)—not harsh black lines.
- **Shadows:** Subtle (`--shadow-sm` on cards; `--shadow-md` on hover/focus elevation only).
- **Corners:** Rounded (`--radius-md` for cards; `--radius-sm` for inputs/buttons).

### Color

- **Text:** Charcoal / near-black (`--color-text`); secondary copy muted (`--color-text-muted`).
- **Primary accent:** Calm blue or muted indigo (`--color-primary`) for primary actions and links.
- **AI zones only:** Very soft blue/lavender tint (`--color-primary-subtle`) for Generate block and generated plan card—**not** full-page gradients.
- **Danger:** Restrained red for delete (`--color-danger`).
- **Avoid:** Medical/clinical teal, excessive neon, dark hacker-terminal default theme.

### Typography

- **Stack:** Manrope-like geometric sans **via system fonts only** unless a human separately approves webfonts:

  `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

- **Material body:** Comfortable size (e.g. 16px base), line-height ~1.6 in `Textarea` and plan summary.
- **Hierarchy:** One clear `h1` per page; section titles `h2`/`h3` with consistent scale.

### Iconography

- **No Material Icons** or icon font libraries unless separately approved.
- Prefer text labels, native controls, and minimal inline SVG (added in Phase 2J/8A).

---

## 4. Layout and app chrome

### Authenticated shell

Global **`AppShell`** header/nav (implemented in Phase **8C-1**; refined through **8C-3D**):

- Brand / app wordmark (text header)
- Nav links: **Dashboard**, **Courses**, **Tasks**, **Flashcards**, **Trello**
- **Admin** link when **`user?.role === 'admin'`** (admins only)
- **Log out**

**Do not add:** Sidebar navigation hub, Search Library, Source Drawer, AI Sidebar as **new** product features.

### Content width

| Context | Max width (guideline) |
|---------|------------------------|
| Login / Register | ~420px centered (`--content-max-form`) |
| Dashboard, lists, course detail | ~720px (`--content-max-workspace`) |
| Study material editor / reading | ~800px (`--content-max-reading`) |

### Layout patterns

- **Single column** default on mobile and desktop for MVP screens.
- **Auth:** Centered `FormCard` on canvas.
- **Lists:** Vertical stack of cards with consistent gap (`--space-4`–`--space-6`).
- **Course detail:** Title/edit card → materials list → add material form (inline) → danger zone separated.
- **Material detail:** Back link → `h1` title → edit card → generate section → saved plan (when present) → danger zone.

---

## 5. Design tokens (framework-agnostic CSS variables)

**Implemented** in `frontend/src/styles/tokens.css` (Phase **2J**; values refined in **8A**). Token names and target values below remain **design guidance** for future polish.

```css
:root {
  /* Color */
  --color-bg: #f8f7f5;
  --color-bg-subtle: #eeedeb;
  --color-surface: #ffffff;
  --color-border: #e5e2dd;
  --color-text: #1a1a1a;
  --color-text-muted: #5c5c5c;
  --color-primary: #4f6bed;
  --color-primary-hover: #3d56c9;
  --color-primary-subtle: #eef2ff;
  --color-danger: #b42318;
  --color-danger-hover: #912018;
  --color-error: #b42318;
  --color-focus-ring: var(--color-primary);

  /* Typography */
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --line-height-body: 1.6;
  --line-height-tight: 1.35;

  /* Spacing (4px base) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Radius & shadow */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);

  /* Layout */
  --content-max-form: 420px;
  --content-max-workspace: 720px;
  --content-max-reading: 800px;
}
```

**Implementation notes:**

- Use plain CSS or CSS modules—**not** Tailwind unless separately approved.
- No `@import` from Google Fonts CDN unless separately approved.
- Map inline styles in pages/components to these tokens incrementally when further polish is approved.

---

## 6. Component guidance

Map to existing React components under `frontend/src/components/`. Updates are **presentation only**—**no behavior or API changes**.

### Button (`components/ui/Button.jsx`)

| Variant | Use |
|---------|-----|
| **primary** | Save, Create, Generate study plan, main CTAs |
| **secondary** | Cancel, Try again, Clear plan |
| **danger** | Delete course / delete material |

- Min height ~44px when styled; clear `:focus-visible` ring.
- Disabled: reduced opacity + `cursor: not-allowed` (loading, generating, unsaved blocking generate).
- No icon-only delete without `aria-label`.

### Input (`components/ui/Input.jsx`)

- Visible `<label>` + `id` / `htmlFor`.
- Full width in forms; border `var(--color-border)`; focus ring primary.
- Auth: email, password. Courses: title. Materials: title.

### Textarea (`components/ui/Textarea.jsx`)

- **Study material** body: tall (e.g. 12+ rows), `line-height: var(--line-height-body)`.
- Monospace **not** required; prioritize readability.
- Validation: content 100–50,000 characters (trimmed) per backend.

### FormCard (`components/ui/FormCard.jsx`)

- White surface, padding `var(--space-6)`, radius `var(--radius-md)`, shadow `var(--shadow-sm)`.
- Optional `title` prop as `h2` for section (“Edit study material”, “Add study material”).

### ErrorMessage (`components/ui/ErrorMessage.jsx`)

- `role="alert"`; color `var(--color-error)`; short user-safe text.
- Never show stack traces, tokens, or raw API bodies.

### LoadingState (`components/ui/LoadingState.jsx`)

- Muted text or minimal skeleton; preserve layout to avoid shift.
- Copy: “Loading courses…”, “Loading study material…”, “Processing with AI…” (implemented for generate loading — see §8.2).

### EmptyState (`components/ui/EmptyState.jsx`)

- Headline + one sentence + primary CTA.
- Courses empty: drive “create first course” (see §7.4).

### CourseCard (`components/courses/CourseCard.jsx`)

- Card metaphor: title as primary link (plain text), optional `createdAt` muted.
- Hover: subtle shadow lift; no fake progress or task counts.
- **Security:** `course.title` as React text node only.

### MaterialCard (`components/materials/MaterialCard.jsx`)

- **Source/document card** feel: title link, `sourceType` + updated date secondary line.
- List on course detail only—**no** `content` preview in list (API summary shape).
- **Security:** `material.title` as plain text only.

### GeneratedPlanSection (`components/materials/GeneratedPlanSection.jsx`)

- Read-only sections: Summary, Key topics, Difficulty, Tasks (ordered list), Flashcards.
- Plain text for all model strings—**no** `dangerouslySetInnerHTML`.
- **Clear plan** → secondary button; calls backend **DELETE** (then clears display).
- Disclaimer (implemented): *“AI-generated — saved as the latest plan for this material. Reference only; verify before you study.”*
- Optional **Last saved:** plain-text line from `savedAt` (e.g. `toLocaleString()`).
- Tasks/flashcards **inside this section** remain **read-only** plain-text display (no inline edit here). **Import** and **CRUD** flows live elsewhere on the material detail page and on **`/tasks`** / **`/flashcards`** (implemented — see **`docs/IMPLEMENTATION_STATUS.md`**).

---

## 7. Screen-by-screen guidance (implemented only)

Reference screenshots: `docs/design/SCREENSHOT_INDEX.md`.

### 7.1 Login (`/`)

**Screenshot:** `01-login.png`

- Centered `FormCard` on `--color-bg`.
- Title: StudyOps AI; subcopy: “Sign in to continue.”
- Email + password; primary **Sign in**; link to Register.
- `ErrorMessage` for validation/auth failures (generic auth message per backend).
- `LoadingState` on submit: “Signing in…”

### 7.2 Register (`/register`)

**Screenshot:** `02-register.png`

- Same auth layout as login.
- Email, password, confirm password (if present in UI).
- Subcopy: student registration only.
- Link back to Login.

### 7.3 Student dashboard (`/dashboard`)

**Screenshot:** `03-dashboard.png` (baseline layout; live UI shows real stats from **`GET /api/dashboard/stats`**)

- **Implemented:** read-only aggregate stats (Overview, Tasks, Focus, Learning assets, Trello sync count, per-course breakdown); **Try again** + **Refresh stats**; cross-page silent refresh when mounted (**5C.1**).
- **Not** an analytics hub—no charts, KPIs, streaks, or Gemini logs on this page.
- Optional **Admin** nav link when **`user?.role === 'admin'`** (UX only).
- Links to **My courses**, **Tasks**, **Flashcards**, **Trello** as implemented today.

### 7.4 Courses — empty state (`/courses`)

**Screenshot:** `04-courses-empty.png`

- `h1`: My courses (or Courses).
- `EmptyState`: “No courses yet” + short body + primary create CTA.
- Optional top link to Dashboard.

### 7.5 Courses — create course form (`/courses`)

**Screenshot:** `05-create-course-form.png`

- Inline or toggled form (match existing UX—do not add `/courses/new` route).
- `FormCard` or equivalent: title field only (3–100 chars).
- Primary create; secondary cancel.
- `POST /api/courses` body `{ title }` only.

### 7.6 Courses — list (`/courses`)

**Screenshot:** `06-courses-list.png`

- `h1` + primary **New course**.
- `LoadingState` / `ErrorMessage` as today.
- Vertical list of `CourseCard` components (≥2 in reference shot).
- Optional link: Dashboard.

### 7.7 Course detail — materials (`/courses/:id`)

**Screenshot:** `07-course-detail-materials.png`

- Back link: ← Back to courses.
- `h1`: course title.
- **Edit course** card: title + Save changes.
- **Study materials** section: list of `MaterialCard` or empty state (“No study materials yet” + Add CTA).
- **Do not** show `stats` stub as real metrics (zeros)—no progress rings.
- **Danger zone** visually separated: Delete course (confirm).

### 7.8 Course detail — create material form (`/courses/:id`)

**Screenshot:** `08-create-material-form.png`

- **Add study material** `FormCard`: title, source type (`manual` | `paste`), `Textarea` for content (100–50k).
- Create + Cancel.
- `POST` body: `{ title, content, sourceType? }` — never `courseId` from client body (route owns course).

### 7.9 Study material detail (`/study-materials/:materialId`)

**Screenshot:** `09-study-material-detail.png`

- **Reading/editing workspace:** ← Back to course; `h1` = material title.
- **Edit study material** card: title, source type select, large `Textarea`, Save changes.
- Below: **Generate study plan** section (see §7.10).
- **Danger zone:** Delete study material (confirm).

### 7.10 Generate study plan action (`/study-materials/:materialId`)

**Screenshot:** `10-generate-study-plan.png`

- Section `h2`: Generate study plan.
- Background: `var(--color-primary-subtle)` optional padding/border—grounded, not flashy.
- Primary button: **Generate study plan**.
- Disabled when: loading, saving, deleting, generating, or **unsaved changes** (see §7.11).

### 7.11 Unsaved changes warning (`/study-materials/:materialId`)

**Screenshot:** `12-unsaved-changes-warning.png`

- Muted helper text above generate button:

  *“Save changes before generating — generation uses your last saved material.”*

- Generate button disabled until save succeeds.

### 7.12 Validation error (forms)

**Screenshot:** `13-validation-error.png`

- Inline error under field and/or `ErrorMessage`.
- Examples: course title length; material title 3–150; content 100–50,000.
- Red text + message—not color alone.

### 7.13 Neutral not-found

**Screenshot:** `14-not-found.png`

- Course: “Course not found” + neutral explanation + back to courses.
- Material: “Study material not found” + “may have been deleted” + back link.
- **404** messaging—not “access denied” (backend uses neutral 404 for wrong owner).

### 7.14 Tasks — global and course (`/tasks`, `/courses/:id`)

- **Filter toolbar:** Course + status filters (in-memory); consistent with dashboard stat-tile aesthetic from **8A**.
- **Task list:** Card or row stack on white surface; pending vs completed visually distinct (muted completed).
- **Actions:** Create, edit pending, mark complete, delete — primary/secondary/danger button variants per §6.
- **Start Focus:** Visible on **pending** tasks only; links to **`/focus/:taskId`**.

### 7.15 Flashcards — global and material (`/flashcards`, material detail)

- **Saved flashcards:** Card list with course/material context; filter toolbar on global page.
- **Study mode:** Flip/reveal on `--color-surface`; calm, readable question/answer typography.
- **CRUD:** Inline create/edit forms in `FormCard`; import-from-plan remains on material detail only.

### 7.16 Trello sync (`/trello`)

- **Credentials:** Ephemeral fields only — never persisted; clear after sync attempt.
- **Board/list picker:** Sequential Load boards → select board → select list; loading/error states per §6.
- **Task selection + results:** Checkbox list (max 50); per-task sync summary (`success` / `skipped` / `failed`).

### 7.17 Focus session (`/focus/:taskId`)

- **Timer panel:** Centered countdown (25-minute display); calm accent, not gamified.
- **Complete flow:** Primary complete action; optional “mark task complete” checkbox; success copy uses backend **`durationMinutes`**.

### 7.18 Admin aggregate stats (`/admin`)

- **Scope:** Platform-wide **aggregate counts only** — no emails, content, plan JSON, or raw rows.
- **Presentation:** Stat tiles consistent with student dashboard; **`· Admin`** suffix on page heading only.
- **Access:** **`AdminRoute`** is UX-only; backend **`requireAdmin`** remains authoritative.

---

## 8. Pending screenshot — processing state (feature implemented; capture pending)

**Do not fabricate PNGs.** **`11-generated-plan-visible.png`** is **captured** (see `docs/design/screenshots/`). **`15-processing-with-ai.png`** remains pending per `SCREENSHOT_INDEX.md`.

### 8.1 Generated plan visible (**implemented — screenshot captured**)

**Reference file:** `11-generated-plan-visible.png` (Phase 2K-c)

- Render `GeneratedPlanSection` below generate block when a **saved** plan exists (loaded on visit or after Generate).
- Card on `--color-primary-subtle` or white with subtle border.
- Sections: summary, key topics, difficulty, tasks, flashcards—all **read-only** plain text.
- **Clear plan** → backend DELETE; idempotent if already cleared.
- **No** “Save plan”, multi-plan library, sync, or history UI.
- Copy: saved as **latest** plan for this material; AI output is **untrusted reference**.
- **Refresh** reloads saved plan from backend when one exists.

### 8.2 Processing with AI (**implemented UI — screenshot pending**)

**Pending file:** `15-processing-with-ai.png`

- While `generating`: disable button; show `LoadingState`—“Processing with AI…”
- Optional subtle pulse on loading text only—no full-screen overlay.
- On success: reveal plan per §8.1; on error: `ErrorMessage` with safe mapped message.

---

## 9. Generate and AI display rules

| Rule | UI requirement |
|------|----------------|
| **Route** | `materialId` from URL only |
| **Request** | `POST /api/study-materials/:materialId/generate` with body **`{}` strict** |
| **No client studyText** | UI must **not** send `studyText`, `content`, or paste-upload on generate |
| **Saved content** | Backend reads **saved** DB `content` after ownership check |
| **Persisted latest plan** | Backend `material_generated_plans` (one row per material); UI via GET on load; React state for display only—no `localStorage` / `sessionStorage`; no plan history library |
| **Untrusted display** | Treat all plan fields as model output; plain text rendering |
| **Read-only** | No inline edit of tasks/flashcards that implies DB writes |
| **No saved library** | No list of past plans, no “synced” indicators |
| **document-service** | Not called from frontend; no `GEMINI_API_KEY` in client |

---

## 10. Motion and animation

Applied in Phase **2J** and refined in **8A**. Further motion changes require explicit approval. Respect `prefers-reduced-motion: reduce`.

| Pattern | Guidance |
|---------|----------|
| Route transition | Optional 150–200ms opacity or ≤8px translate |
| Card hover | `shadow-sm` → `shadow-md` |
| Button press | Slight darken or scale 0.98 |
| Generate loading | Gentle pulse on loading label only |
| Plan reveal | Short fade-in when plan appears |

**Avoid:** Parallax, heavy neon animations, distracting looped gradients.

---

## 11. Accessibility

- One **`h1`** per route; logical heading order for sections.
- Every control has a visible **label** (not placeholder-only).
- **`role="alert"`** / `aria-live` for errors and generate failures.
- **`:focus-visible`** ring using `--color-focus-ring` (≥3:1 contrast).
- Touch targets **≥44px** height on primary actions.
- Errors: text + color (not color-only).
- Delete: accessible confirm (upgrade from `window.confirm` optional in future polish).
- Generated plan lists: semantic `ul`/`ol`; task items not interactive checkboxes.
- Material `Textarea`: comfortable contrast on white surface (body text ≥4.5:1).

---

## 12. Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| **&lt;640px** | Single column; full-width buttons; padding `var(--space-4)` |
| **≥640px** | Centered main column at max-width tokens; cards full width within column |

- Avoid horizontal scroll on forms and long titles (wrap; truncate with `title` attribute only if needed).
- Optional `06-courses-list-mobile.png` not required for MVP styling.

---

## 13. API and security (UI-facing)

- **Auth:** Bearer via Supabase session + `apiFetch`—no manual token storage in `localStorage`.
- **No service role** in frontend; no `VITE_*` service keys.
- **Ownership:** Never send `user_id`, `userId`, `courseId` in generate body; course id from route for materials create only via URL.
- **XSS:** Render `course.title`, `material.title`, `material.content`, and all `plan` fields as **React text**—never `dangerouslySetInnerHTML`.
- **401:** Existing logout + redirect (`AUTH_REQUIRED`).
- **Logging:** Do not log material `content`, `plan`, tokens, or `Authorization` in frontend consoles for production hygiene.
- **Env:** No secrets, API keys, or `.env` values in UI copy or design assets.

---

## 14. Explicitly out of scope (design)

Do **not** design or implement **new product features** beyond current **`docs/IMPLEMENTATION_STATUS.md`**:

- Admin **logs**, user list, role management, Gemini error metrics UI
- Charts, KPI widgets, streaks, or fake progress rings on dashboard/course pages
- Saved generated plan library or “plan history”
- Client “save plan” UI or POST of plan JSON
- Course-level paste-generate page with client `studyText`
- Source **upload** UI, file picker, or drive connectors
- Audio overview, citations panel, notebook sharing
- Search Library, Source Drawer, Recent Sources, Drafting Space
- AI Sidebar as a permanent product navigation feature
- Footer links (Privacy, Terms, Help Center) unless separately approved
- Permanent sidebar navigation **hub** (multi-module app shell beyond minimal top bar)
- Social feed, gamification, leaderboards
- Dark “hacker terminal” default theme or medical/clinical teal palette
- Trello OAuth, stored credentials, PDF upload, payments, polling/WebSockets

**Implemented screens** (tasks, flashcards, Trello, focus, admin aggregate stats) **may** receive presentation polish per this document — do **not** treat them as design-forbidden.

Label any future mock: **concept only — not implemented**.

---

## 15. What not to do

- Do **not** use Stitch HTML/React as source of truth or paste into `frontend/`.
- Do **not** add **Tailwind**, **Google Fonts**, **Material Icons**, or new UI libraries without human approval.
- Do **not** clone NotebookLM branding, layout, or NotebookLM-only features.
- Do **not** use this file to justify new routes, APIs, tables, or persistence.
- Do **not** imply frontend sends `studyText` on generate.
- Do **not** show fake dashboard stats or course `stats` stub as real data.
- Do **not** add checkboxes on generated tasks (implies task DB).
- Do **not** add “Saved plan” or sync badges.
- Do **not** weaken auth, RLS, or service boundaries in presentation choices.
- Do **not** embed external scripts, CDNs for fonts/icons, or env values in design docs/screenshots.

---

## 16. When agents may apply DESIGN.md

| Situation | Allowed |
|-----------|---------|
| **Phase 2I-c** — authoring/updating this file | Yes (documentation only) |
| **Planning / Stitch / screenshots** | Use `STITCH_BRIEF.md` (historical) + `SCREENSHOT_INDEX.md`; this file is output of 2I-c |
| **Frontend styling (2J / 8A)** | **Complete** — further CSS/presentation changes require explicit approval |
| **Functional feature work** | Follow `IMPLEMENTATION_STATUS` for behavior; use this file only for presentation |
| **Scope expansion** | **Never** — PRD + human approval required |

**Gates:**

- Updating **`DESIGN.md` v2`** required `approved — implement Phase 2I-c DESIGN.md v2` (historical).
- Applying CSS/tokens beyond **2J**/**8A** requires a **separate** styling approval (e.g. `approved — apply DESIGN styling pass`).

---

## 17. Styling implementation guide (Phase 2J — complete; 8A polish applied)

**Historical reference** — styling was applied as follows (do not re-run without approval):

1. Added `frontend/src/styles/tokens.css` from §5; imported once in app entry (e.g. `main.jsx`).
2. Restyled in order: `components/ui/*` → `CourseCard` / `MaterialCard` → `GeneratedPlanSection` → pages → tasks/flashcards/Trello/focus/admin (**8A**).
3. Replaced inline styles with token-based classes or CSS modules incrementally.
4. Minimal **top app bar** per §4 — no feature sidebar.
5. Kept all routes, API calls, validation, and generate behavior **unchanged**.
6. Run `npm run lint`, `npm test`, `npm run build` in `frontend/`; `check-all.ps1` if touching multiple packages.
7. Compare visuals to `docs/design/screenshots/` and this document—not to Stitch exports.
8. Re-run **Security Review** if changing how plan/content is rendered or auth surfaces.

**Forbidden in future polish:** New dependencies (Tailwind, icon fonts, Google Fonts) without approval; persistence UI; Stitch code merge.

---

## 18. Related documents

- `docs/IMPLEMENTATION_STATUS.md` — built vs deferred
- `docs/STITCH_BRIEF.md` — historical Stitch advisory input (Phase 2I-a; not product scope)
- `docs/design/SCREENSHOT_INDEX.md` — screenshot filenames (captured vs pending)
- `docs/AGENT_MEMORY.md` — phase history
- `docs/PRD.md` — product intent
- `AGENTS.md` — approval gates and agent roles
- `SECURITY.md` — secrets and service boundaries

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-20 | Initial DESIGN.md for Phase 1G Courses Frontend UI guidance |
| 2026-05-22 | **v2** — NotebookLM-inspired study workspace spec; materials + generate; tokens; generated plan + processing sections; styling guide (Phase 2I-c) |
| 2026-05-30 | **Phase 8B** — align wording with **2J**/**8A** implementation; tokens.css exists; §7.14–7.18 for implemented screens; §14 reframed (new features vs presentation) |
