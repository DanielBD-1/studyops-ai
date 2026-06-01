# STITCH_BRIEF.md — StudyOps AI (Phase 2I)

**Status:** **Historical / advisory** — Phase 2I Stitch design-discovery input (not current product scope)
**Last updated:** 2026-06-01 (Phase **A** note)
**Purpose:** Preserve the original Stitch session brief that helped derive **`DESIGN.md` v2** direction. This file does **not** change product scope, APIs, or application code. **Current built state:** **`docs/IMPLEMENTATION_STATUS.md`**.

> **Read this first:** **`DESIGN.md`** (Phase **A**, 2026-06-01) is the **current presentation authority** — including the approved **NotebookLM-style source workspace + Linear/Raycast AI command center** hybrid. This Stitch brief is **historical inspiration only**; do not use it to override Phase A design direction or to add features. Use **`IMPLEMENTATION_STATUS.md`** for product truth.

---

## 1. Purpose (historical — Phase 2I)

StudyOps AI had a **functional MVP skeleton** when this brief was written (auth, courses, study materials, **persisted latest** AI study-plan per material). Phase **2I** captured:

- A curated brief for **Google Stitch** (or equivalent design tooling)
- A **screenshot checklist** for humans to capture the live app (`docs/design/SCREENSHOT_INDEX.md`)
- Direction that informed **`DESIGN.md` v2** after human review of Stitch outputs

**Phase 2I did not** (by itself):

- Apply CSS or styling to `frontend/` (that followed in **2J** and **8A**)
- Merge Stitch-generated React/HTML into the repository
- Replace **`DESIGN.md`** automatically from Stitch output

---

## 2. Authority (what wins when docs disagree)

| Document | Role |
|----------|------|
| **`docs/PRD.md`** | Product intent and future MVP features |
| **`docs/IMPLEMENTATION_STATUS.md`** | **What is built today** — routes, APIs, deferred work |
| **`DESIGN.md` (current)** | **Presentation / UX direction** — v2 complete; styled in **2J**, polished in **8A** |
| **`docs/STITCH_BRIEF.md` (this file)** | **Historical** Stitch session input — **not** product scope |
| **Stitch mockups** | **Concept only — not implemented**; informed **`DESIGN.md`**; further styling requires explicit approval |

When Stitch output conflicts with `IMPLEMENTATION_STATUS`, **ignore the mockup feature** and keep layout/visual language only.

---

## 3. Product one-liner and positioning

**One-liner:** StudyOps AI is a **modern AI study cockpit** — a calm, professional workspace where students organize courses and materials, then run **AI-assisted study planning** on saved content.

**Positioning:**

| Dimension | Direction |
|-----------|-----------|
| **Metaphor** | Study cockpit / AI command center for one student’s courses |
| **Feeling** | Notion + Linear + Raycast — **principles only**, do not clone brands |
| **Mood** | Polished, professional, pleasant, modern, cool — beautiful without being flashy |
| **Density** | Medium — readable long-form study material; clear hierarchy |
| **Trust** | Honest loading/empty/error states; no fake metrics |

**User:** Student primary; **admin aggregate stats UI** now exists on **`/admin`** (platform counts only). Admin **logs** / **user management** remain deferred.

**Today’s workflow (at time of brief):** Register/login → courses → course detail → create/edit material → **Generate study plan** → **latest plan persisted** per material → reload on refresh → **Clear** removes saved plan. Read-only plain-text display.

**Since this brief:** Tasks, flashcards, Trello sync, focus sessions, dashboard stats, and admin aggregate UI were implemented in later phases — see **`IMPLEMENTATION_STATUS.md`**.

---

## 4. Routes at time of brief (design focus for Stitch)

From `docs/IMPLEMENTATION_STATUS.md` **when Phase 2I ran** — Stitch mockups targeted these screens. Additional routes (**`/tasks`**, **`/flashcards`**, **`/trello`**, **`/focus/:taskId`**, **`/admin`**) were added later and styled in **2J**/**8A**; they are **not** in the original Stitch deliverable list below.

| Route | Screen | Notes |
|-------|--------|--------|
| `/` | Login | Centered auth |
| `/register` | Register | Centered auth |
| `/dashboard` | Student dashboard (stats UI) | Real aggregate stats from backend — **not** charts/KPI hub; Stitch brief predates **5B/5C** |
| `/courses` | Courses list | List, create, empty state |
| `/courses/:id` | Course detail | Title edit, materials list, create material |
| `/study-materials/:materialId` | Study material detail | Edit content, generate, load/clear **latest saved** plan display |

**Catch-all:** Unknown paths redirect to `/` — design a neutral “not found” pattern only if it appears in screenshots; do not add a new route in mockups.

---

## 5. Screens in scope (with screenshot filenames)

Humans capture screenshots per `docs/design/SCREENSHOT_INDEX.md`. Stitch should reference these filenames when proposing visual treatments.

**Authoritative filenames (captured vs pending):** `docs/design/SCREENSHOT_INDEX.md` — use only PNGs present under `docs/design/screenshots/`; do not fabricate pending captures.

| # | Filename | Screen |
|---|----------|--------|
| 1 | `01-login.png` | Login |
| 2 | `02-register.png` | Register |
| 3 | `03-dashboard.png` | Student dashboard (stats UI baseline) |
| 4 | `04-courses-empty.png` | Courses empty state |
| 5 | `05-create-course-form.png` | Create course form |
| 6 | `06-courses-list.png` | Courses with ≥2 items |
| 7 | `07-course-detail-materials.png` | Course detail + materials |
| 8 | `08-create-material-form.png` | Create material form visible |
| 9 | `09-study-material-detail.png` | Study material edit state |
| 10 | `10-generate-study-plan.png` | Generate study plan CTA visible |
| 11 | `11-generated-plan-visible.png` | Generated plan visible (**captured** — Phase 2K-c; see index) |
| 12 | `12-unsaved-changes-warning.png` | Unsaved changes before generate |
| 13 | `13-validation-error.png` | Inline validation error |
| 14 | `14-not-found.png` | Neutral not-found copy |
| — | `15-processing-with-ai.png` | Processing with AI (**pending** — see index) |

**Optional (not required for Stitch MVP):** `06-courses-list-mobile.png` — courses list at ~390px width (do not confuse with pending `15-processing-with-ai.png`; see `SCREENSHOT_INDEX.md`).

---

## 6. Out of scope for original Stitch session (historical)

When Phase **2I** ran, Stitch was asked **not** to mock these — they were **not yet built** or were explicitly deferred. **Do not** use this section to infer that implemented screens today must remain unstyled.

Do **not** use this brief to design or add **new** product features:

- Task management UI (`study_tasks`) — **now implemented**; see **`DESIGN.md`** §7.14
- Flashcard management UI — **now implemented**; see **`DESIGN.md`** §7.15
- Trello connect/sync UI — **now implemented** (manual MVP); see **`DESIGN.md`** §7.16
- Admin dashboard — **aggregate stats UI implemented**; logs/user management **deferred**; see **`DESIGN.md`** §7.18
- Real dashboard analytics, charts, KPI cards, streaks — still **out of scope**
- Multi-plan **library** or plan **history** UI (only **one latest** plan per material exists)
- Course-level paste-generate page (`POST /api/courses/:courseId/generate` with client `studyText`)
- Deployment, billing, settings beyond logout
- Sidebar navigation hub to unbuilt modules
- Social feed, gamification, leaderboards

Label any decorative “future hint” in mockups: **concept only — not implemented**.

---

## 7. UI constraints at time of brief (code reality — superseded partly by 2J/8A)

- **Stack:** React (Vite), React Router; presentation uses **`frontend/src/styles/tokens.css`** and shared UI components (Phase **2J**, refined **8A**)
- **Design token system:** **Implemented** in **`frontend/src/styles/tokens.css`** — values align with **`DESIGN.md`** §5
- **Existing components** (style these conceptually, do not output production code):

| Component | Location | Role |
|-----------|----------|------|
| `Button` | `components/ui/Button.jsx` | Primary, secondary, danger |
| `Input` | `components/ui/Input.jsx` | Labeled fields |
| `Textarea` | `components/ui/Textarea.jsx` | Material content |
| `FormCard` | `components/ui/FormCard.jsx` | Auth and forms wrapper |
| `ErrorMessage` | `components/ui/ErrorMessage.jsx` | `role="alert"` |
| `LoadingState` | `components/ui/LoadingState.jsx` | Loading copy |
| `EmptyState` | `components/ui/EmptyState.jsx` | Empty list guidance |
| `CourseCard` | `components/courses/CourseCard.jsx` | Course list item |
| `MaterialCard` | `components/materials/MaterialCard.jsx` | Material list item |
| `GeneratedPlanSection` | `components/materials/GeneratedPlanSection.jsx` | Read-only AI output |
| `LoginForm` / `RegisterForm` | `components/auth/*` | Auth forms |
| `ProtectedRoute` | `components/auth/ProtectedRoute.jsx` | Auth gate |

- **Pages (2I-era names):** `Landing`, `Register`, `DashboardStub`, `CoursesList`, `CourseDetail`, `StudyMaterialDetail` — live routes now include **`/tasks`**, **`/flashcards`**, **`/trello`**, **`/focus/:taskId`**, **`/admin`** (see **`IMPLEMENTATION_STATUS.md`**)
- **Security:** Render user titles and material text as **plain text** (no `dangerouslySetInnerHTML`)

---

## 8. Style direction

### Keywords

Modern **AI Study Cockpit** · productivity SaaS · calm study workspace · AI command center · professional but not boring · beautiful and pleasant · modern, clean, slightly futuristic

### Visual system (proposal for mockups and future `DESIGN.md` v2)

| Element | Direction |
|---------|-----------|
| **Surfaces** | Warm neutral / off-white backgrounds |
| **Text / chrome** | Charcoal or deep navy |
| **Accent** | Indigo, electric blue, or muted violet (pick one primary accent in review) |
| **AI moments** | Subtle gradients **only** around generate / plan reveal — not global neon |
| **Cards** | Soft cards, rounded corners, refined shadows |
| **Hierarchy** | Strong type scale; material body text highly readable |
| **States** | Polished empty, loading, error, not-found |

### Avoid

- Clinical / hospital look
- Medical teal
- Childish gamification
- Generic corporate dashboard (fake KPIs)
- Dark hacker-terminal aesthetic
- Excessive neon
- Heavy or distracting motion in static mockups

### Inspiration (principles, not copies)

Borrow **feel** from Notion, Linear, Raycast: restrained chrome, confident typography, purposeful whitespace, crisp interactive affordances — **do not** copy logos, exact palettes, or proprietary layouts.

---

## 9. Animation guidance (spec for later styling phase only)

Mockups may **suggest** motion; **do not** implement in repo during 2I.

| Pattern | Intent |
|---------|--------|
| Page transitions | Subtle fade/slide between routes |
| Cards | Gentle hover lift |
| Buttons | Press feedback |
| Generate | Loading pulse while “Processing with AI…” |
| Plan reveal | Short reveal when plan appears |
| Global | Smooth, restrained — no parallax or excessive motion |
| Accessibility | Respect `prefers-reduced-motion` when code is styled |

---

## 10. Accessibility requirements

- One `<h1>` per screen; logical heading order
- Visible `<label>` for every input (not placeholder-only)
- Errors: `role="alert"` or `aria-live`; not color-only
- Keyboard focus visible on buttons and links
- Touch targets ~44px when styled
- Long material content: comfortable line length and contrast
- Motion: optional reduced-motion variants in implementation phase

---

## 11. Key UX flows (implemented behavior)

1. **Auth:** Login or register → session → student dashboard or courses
2. **Courses:** List → create (title 3–100) → open course
3. **Course detail:** Edit title, list materials, create material (title 3–150, content 100–50,000, source type)
4. **Material detail:** Edit fields → save → **Generate study plan**
5. **Generate:** `POST /api/study-materials/:materialId/generate` with body `{}` — uses **saved** DB content; warn if form dirty
6. **Plan display:** Read-only in UI — summary, topics, difficulty, tasks, flashcards — loaded from backend when saved; **refresh keeps** latest plan

---

## 12. Generate / AI UX rules (non-negotiable for design)

| Rule | Design implication |
|------|-------------------|
| **One latest plan per material** | No multi-plan library, history list, or sync badges |
| Body is **`{}`** | No paste-upload UI on generate; content comes from saved material |
| **Untrusted display** | Present plan as AI-generated reference, not authoritative fact |
| Save before generate | Show warning when edits unsaved |
| Processing | Clear “Processing with AI…” state |
| Errors | User-safe messages only — no API keys, stack traces, or raw Gemini errors |
| Read-only plan | No inline edit of tasks/flashcards that implies DB persistence |

---

## 13. Deliverables requested from Stitch

Request **visual design artifacts only**:

1. **Screen mockups** for each item in §5 (desktop 1440×900 baseline)
2. **Design token sheet** (CSS variable names + example values) — spec only
3. **Component styling notes** for §7 inventory
4. **Optional:** Light app shell (top bar: app name, Courses, Logout) — **no sidebar** to unbuilt routes
5. **Optional:** Mobile frame for courses + material detail

**Do not deliver:**

- React/Vue/HTML/CSS files for direct merge into `frontend/`
- New routes, npm packages, or backend changes
- Features listed in §6

---

## 14. Review checklist (human + Supervisor)

Before updating `DESIGN.md` v2:

- [ ] Every mock screen maps to an implemented route in §4
- [ ] No tasks/Trello/admin/dashboard/persistence UI slipped in
- [ ] No fake stats or charts on student dashboard stats UI
- [ ] Generate flow matches persisted-latest-plan, material-scoped rules (§12)
- [ ] Palette avoids medical teal / clinical look
- [ ] Motion notes are subtle and include reduced-motion note
- [ ] Screenshots use **fake data only** (no real student content)
- [ ] Screenshot crops exclude DevTools, network panels, terminals, JWTs, and `.env` snippets
- [ ] No secrets, env values, or API keys in exports
- [ ] Mockups labeled **concept only — not implemented** where speculative

---

## 15. Security and privacy (Stitch session)

- **Do not** include real `.env` values, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, JWTs, or user emails from production
- **Do not** use real student essays or PII in screenshot placeholders
- **Do not** upload the repository, backend/document-service source, `.env` files, or service-role documentation to Stitch
- Use only this brief, screenshots, and a short `IMPLEMENTATION_STATUS` excerpt
- Use lorem-style or clearly fake course/material titles
- Generated AI output in designs is **untrusted display data** — may show **saved-as-latest** copy; do not imply multi-plan library, task management, or Trello sync

---

## 16. Workflow after this brief (historical — largely complete)

1. Human captures screenshots → `docs/design/screenshots/` per `SCREENSHOT_INDEX.md` — **14 captured**; **`15-processing-with-ai.png`** still **pending**
2. Human runs Stitch with this brief + screenshots + `IMPLEMENTATION_STATUS` excerpt — **done (Phase 2I)**
3. Human reviews mockups against §14 checklist — **done**
4. Human approves direction → **`DESIGN.md` v2** authored — **done (Phase 2I-c)**
5. **Frontend styling** — **done (Phase 2J)**; **UI polish (Phase 8A)**
6. **Further styling** still requires explicit approval (e.g. `approved — apply DESIGN styling pass`); Cursor/agents must not expand product scope from this brief

---

## 17. Appendix — paste-ready Stitch prompt block (historical)

**Historical reference** — Phase 2I session input. Product scope has grown since; do **not** treat OUT OF SCOPE lines as “must not exist today.” Cross-check **`IMPLEMENTATION_STATUS.md`** before any new design work.

Copy the block below into Stitch (attach screenshots from `docs/design/screenshots/` when available):

```
Project: StudyOps AI — Modern AI Study Cockpit (productivity SaaS)

CONTEXT: Functional React app exists. Design ONLY these implemented screens:
Login (/), Register (/register), Student dashboard (/dashboard), Courses list (/courses),
Course detail (/courses/:id), Study material detail (/study-materials/:materialId)
including create material, Generate study plan, and read-only Generated plan section.

OUT OF SCOPE — do not design: tasks UI, flashcard management, Trello, admin, real dashboard
analytics, saved plan library, course-level paste-generate, new routes, persistence, deployment.

PRODUCT FEEL: Notion + Linear + Raycast principles (do not clone). Calm study workspace,
AI command center, professional, pleasant, modern, slightly futuristic. Warm off-white
surfaces, charcoal/deep navy text, indigo/electric blue/violet accent. Soft cards, rounded
corners, refined shadows. Subtle gradients only on AI/generate moments.

AVOID: medical teal, hospital/clinical look, gamification, fake KPI dashboards, dark hacker
terminal, excessive neon, heavy animation.

AI RULES: Generate uses saved material content only (no upload UI). Plan is session-only,
read-only, untrusted display — no "saved plans" UI. Show save-before-generate warning and
processing state.

ANIMATION (spec only): subtle page fade/slide, card hover lift, button press, generate pulse,
plan reveal — respect reduced motion later.

DELIVERABLES: High-fidelity mockups per attached screenshots, token sheet (CSS variables),
component notes. NO production frontend code. Label anything speculative:
"concept only — not implemented".

Use fake placeholder data only. No secrets or real user content.
```

---

## Related documents

- `docs/design/SCREENSHOT_INDEX.md` — capture checklist
- `docs/IMPLEMENTATION_STATUS.md` — built vs deferred
- `DESIGN.md` — presentation / UX direction (v2; styled **2J**, polished **8A**)
- `AGENTS.md` — approval gates (further styling requires explicit approval)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-20 | Initial STITCH_BRIEF for Phase 2I design discovery |
| 2026-05-20 | Security hardening: Stitch upload limits, screenshot crop checklist |
| 2026-05-22 | Screenshot filename alignment pointer; §5 table matches `SCREENSHOT_INDEX.md` |
| 2026-05-22 | Optional mobile filename: `06-courses-list-mobile.png` (avoids `15-` clash with pending processing) |
| 2026-05-30 | **Phase 8B** — reframe as historical/advisory; note **2J**/**8A** styling and implemented tasks/flashcards/Trello/focus/admin/dashboard stats |
| 2026-06-01 | **Phase A** — header note: **`DESIGN.md`** is current presentation authority; this file is historical Stitch inspiration only |
