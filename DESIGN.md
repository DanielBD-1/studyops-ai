# DESIGN.md — StudyOps AI

**Status:** Phase 1G guidance (documentation only)  
**Last updated:** 2026-05-20  
**Authority:** `docs/PRD.md` remains the product source of truth. This file defines UI/UX direction only—it does not change scope or APIs.

---

## Purpose

Provide lightweight UI/UX guidance for the **Courses Frontend UI** phase and related auth/dashboard surfaces. Agents should use this document to stay consistent while building **working flows first**. A dedicated **visual styling pass** comes later, after course CRUD works end-to-end against the backend API.

---

## Product feeling

StudyOps AI should feel like a **clean, focused student workspace**—not a social feed, not a corporate admin console, and not a gamified app.

| Quality | Intent |
|--------|--------|
| Calm | Reduce noise; one primary action per screen |
| Trustworthy | Clear labels, predictable errors, no dark patterns |
| Study-first | Courses and tasks are the center of gravity |
| Honest | Loading and empty states explain what is happening |
| Lightweight | Fast to scan; avoid dense dashboards in early phases |

**Tone:** Supportive and direct. Copy should sound like a helpful study tool (“Add your first course”), not marketing hype.

---

## Inspiration (do not copy brands)

Draw **principles** from these categories—not logos, colors, or layouts to clone:

| Source type | What to borrow |
|-------------|----------------|
| Academic productivity tools | Clear hierarchy, course-centric navigation, readable lists |
| Minimal note/task apps | Simple forms, restrained chrome, strong whitespace |
| Learning platforms (high level) | Progress and “what’s next” without turning MVP into a full LMS |
| Native OS patterns | System fonts, familiar form controls, accessible focus states |

**Do not:** Copy Notion, Linear, Duolingo, or any brand’s exact palette, typography, icons, or marketing layout. StudyOps should feel **familiar** but **original**.

---

## Layout principles

1. **Single column on small screens** — content width capped (~640–720px for forms; slightly wider for course lists).
2. **Clear page title** — every screen has one `<h1>` describing where the user is.
3. **Primary action visible** — e.g. “New course” on the courses list without hunting in menus.
4. **Consistent vertical rhythm** — predictable spacing between sections (use rem-based spacing when styling is applied).
5. **Auth vs app shell** — login/register stay simple centered layouts; authenticated areas can add a light header/nav later (functional first).
6. **No sidebar requirement for MVP courses phase** — a top bar with app name + logout is enough until more modules exist.

---

## Screen guidance

### Login (`/`)

- Centered **FormCard** with email + password.
- Link to Register.
- Show **ErrorMessage** for validation and API failures (generic message for auth failures per backend).
- **LoadingState** on submit (“Signing in…”).
- On success → navigate to dashboard or courses per routing decision (PRD: dashboard exists; courses list may be linked from dashboard stub).

### Register (`/register`)

- Same layout pattern as Login.
- Fields: email, password (and confirm only if PRD/workflow requires—match existing validation).
- Link back to Login.
- Success → sign in flow or redirect per existing auth behavior.

### Dashboard (`/dashboard`)

- **Phase 1G:** Remains a simple authenticated landing—not a stats hub.
- Show signed-in identity (email/role) if already present.
- **Primary CTA:** Navigate to **Courses** (e.g. “View courses” / “My courses”).
- Logout remains available.
- **Do not** add Gemini logs, Trello status, focus timers, or analytics widgets in this phase.

### Courses list (`/courses` — to be added)

- Page title: **My courses** (or **Courses**).
- **LoadingState** while `GET /api/courses` runs.
- **ErrorMessage** on fetch failure with retry affordance when practical.
- **EmptyState** when `courses.length === 0` (see Course UI below).
- Grid or vertical list of **CourseCard** components.
- Prominent **Button** to create a course (opens inline form, modal, or `/courses/new`—pick one pattern and stay consistent).

### Course create / edit

- **Create:** Title only (3–100 characters, trimmed)—align with backend Zod and DB rules.
- **Edit:** PATCH title only; no `user_id` / `userId` fields in UI or payload.
- Use **FormCard** + **Input** + submit **Button**; cancel returns to list.
- Client-side validation messages should mirror PRD: *“Course title must be between 3 and 100 characters”* where applicable.
- **Delete:** Confirm before `DELETE /api/courses/:id` (native `confirm()` acceptable in functional phase; replace with accessible dialog in styling pass).

### Course detail (`/courses/:id` — optional in 1G)

- If implemented: show **title** only plus navigation back to list.
- **Do not** surface `stats` from `GET /api/courses/:id` as real metrics in Phase 1G—the API returns a **zero-value stub** (`totalTasks`, `completedTasks`, `totalFlashcards` all 0). Do not build charts, progress rings, or “0 tasks” dashboards that imply features that do not exist yet.

---

## Reusable components (conceptual)

Build these as small, composable React components during the Courses UI phase. In Phase 1G they may use minimal inline styles; the **styling pass** will centralize tokens later.

| Component | Role |
|-----------|------|
| **Button** | Primary (submit/create), secondary (cancel), danger (delete). Disabled when loading. |
| **Input** | Labeled text/email/password; associates `htmlFor` + `id`; shows validation hint. |
| **FormCard** | Wraps auth and course forms—title, children, consistent padding. |
| **ErrorMessage** | `role="alert"`; one concise message; never expose stack traces or tokens. |
| **LoadingState** | Text or skeleton for lists/forms; avoid layout shift where possible. |
| **EmptyState** | Icon optional later; headline + short description + primary CTA. |
| **CourseCard** | Displays `course.title` as **plain text** (React text node, not `dangerouslySetInnerHTML`). Optional: relative `createdAt` as secondary muted text. Link or button to edit. |

---

## States: loading, error, empty, success

| State | UX rule |
|-------|---------|
| **Loading** | Disable destructive/submit actions; show in-button label or list placeholder. |
| **Error** | User-safe message from API envelope; map `VALIDATION_ERROR`, `NOT_FOUND`, `AUTH_REQUIRED` without leaking internals. |
| **Empty** | Explain why list is empty + one action (“Create your first course”). |
| **Success** | After create/update/delete: return to list or show brief confirmation; refetch list (manual refetch per PRD—no optimistic dashboard). |

**Auth session expiry:** Redirect to login with a clear message when API returns 401 (existing auth patterns).

---

## Accessibility basics

- One **`<h1>`** per page; logical heading order if subsections exist.
- Every **Input** has a visible **`<label>`** (not placeholder-only).
- **ErrorMessage** uses `role="alert"` (or `aria-live="polite"` for non-blocking hints).
- Buttons and links are keyboard-focusable; visible **focus** style (even a simple outline in functional phase).
- **Delete** actions need confirmation and clear naming (“Delete course”, not “OK”).
- Color must not be the only error indicator (icon or text prefix).
- Respect `prefers-reduced-motion` when animations are added in the styling pass.

---

## Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile (&lt; 640px) | Single column; full-width buttons; touch-friendly tap targets (min ~44px height when styled). |
| Tablet/desktop | Centered content; course list may use 2 columns only if cards remain readable—default to single column for MVP. |

Avoid horizontal scroll on forms. Long course titles wrap; truncate with `title` tooltip only in styling pass if needed.

---

## Course UI (Phase 1G scope)

### List courses

- `GET /api/courses` with Bearer token from existing auth session.
- Render `{ courses }` from API (camelCase items: `id`, `title`, `createdAt`, `updatedAt`).
- Sort: default API order acceptable; optional client sort by `updatedAt` desc later.

### Create course

- `POST /api/courses` body: `{ title }` only.
- Never send `user_id`, `userId`, or role fields.
- On 201 → refresh list or navigate to list with success feedback.

### Edit course

- `PATCH /api/courses/:id` with `{ title }` only.
- 404 → treat as missing course (“Course not found”), not permission messaging.

### Delete course

- `DELETE /api/courses/:id`; expect `{ deleted: true }`.
- Remove from list after success; handle 404 if already deleted.

### Empty state (no courses)

Example copy direction:

- **Headline:** “No courses yet”
- **Body:** “Create a course to organize your study material and tasks.”
- **CTA:** Primary button → create flow

### Explicitly out of scope on course screens (Phase 1G)

- Gemini / document generation UI
- Trello connect or sync UI
- Task or flashcard lists (even if API stats stub exists)
- Dashboard analytics, charts, or “progress by course”
- Admin views or cross-user data

---

## API & security reminders for UI

- Use existing `api` service + auth Bearer header; no Supabase service role in frontend.
- Render **`course.title` as text** to mitigate stored XSS.
- Do not display or edit `user_id` / `userId` (not in API responses).

---

## What not to do

- Do not copy third-party brand visuals or marketing pages.
- Do not add scope (tasks, flashcards, AI, Trello, focus, admin) to “fill space.”
- Do not build a stats-heavy dashboard before course CRUD works.
- Do not use `dangerouslySetInnerHTML` for user-generated titles.
- Do not persist Trello credentials or add new npm UI libraries without human approval.
- Do not block Phase 1G on perfect pixels—**function first**.
- Do not replace PRD validation rules with looser client-only checks.

---

## When agents may apply DESIGN.md

| Phase | Allowed use of DESIGN.md |
|-------|---------------------------|
| **Phase 1G — Courses UI (functional)** | **Yes — lightweight.** Follow layout, components, states, accessibility, and copy direction. Minimal inline/CSS module styling is OK to ship working CRUD. |
| **Before course flow works** | **No full styling pass.** Do not spend the phase on theme tokens, animations, or redesigning auth pages unless required for consistency. |
| **After functional sign-off** | **Yes — styling pass** with human approval (e.g. `approved — apply DESIGN styling pass`). Then unify colors, typography, spacing, and polish Empty/Loading/CourseCard. |
| **Any phase** | **Never** use this file to justify MVP scope creep—only presentation and UX patterns. |

**Gate:** Human approval required before starting Courses frontend implementation (`approved — begin Courses UI` or equivalent per workflow). Applying visual polish requires a **separate** explicit approval from functional completion.

---

## Styling pass (deferred)

When approved, define in a follow-up (not required for Phase 1G doc-only):

- CSS variables: background, surface, text, border, primary, danger, focus ring
- Typography scale (system-ui stack acceptable for MVP)
- Shared `components/ui/*` or equivalent folder
- Optional: light/dark—defer unless requested

Until then, prefer **system-ui** stack and simple spacing consistent with existing auth pages.

---

## Related documents

- `docs/PRD.md` — routes, validation, API shapes
- `docs/AGENT_MEMORY.md` — Phase 1F backend contract
- `docs/database/002-courses-schema-and-rls.md` — title length rules
- `AGENTS.md` — agent workflow and approval gates

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-20 | Initial DESIGN.md for Phase 1G Courses Frontend UI guidance |
