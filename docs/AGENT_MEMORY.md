# AGENT_MEMORY.md — StudyOps AI

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

## Project Baseline (2026-05-20)

**Status:** Phase 1A–1G complete (through courses UI). Phase 2A `public.study_materials` **applied and verified** on Supabase. Phase 2B Study Materials Backend API and Phase 2C Study Materials Frontend UI **complete** (Supervisor + Security approved). **Manual smoke test passed** after Phase 2C. Phase 2D Gemini document-service **complete** (Supervisor + Security approved; `POST /process`, tests 27/27 mocked). Phase 2E Backend Generate Orchestration **complete** (Supervisor + Security approved; backend tests 99/99 mocked). Phase 2F Frontend Generate UI **complete** (Supervisor + Security approved; ephemeral plan on material detail, frontend tests 34/34 mocked). Phase 2G Quality/Lint **complete** (Supervisor + Security approved; ESLint in all packages + CI + `check-all.ps1`). Public tables: `profiles`, `courses`, `study_materials` only. GitHub Actions CI: `npm ci` → `npm run lint` → `npm test` per package; frontend also `npm run build` (Node.js 22 in CI). Node.js 20.6+ required locally. `DESIGN.md` is lightweight UI guidance only.

**Architecture locked by ADRs:**

- Main backend = modular monolith (001).
- Document processing = separate service (002).
- Zod for Gemini output, requests, env (003).
- Trello credentials not persisted (004).
- Manual List ID required for MVP Trello sync (005).

**Next implementation:** Persistence of Gemini output (summary/tasks/flashcards) requires **separate human approval** — not started. PRD course-level paste route `POST /api/courses/:courseId/generate` with client `studyText` remains **deferred** (Phases 2E–2F use material-scoped generate instead). Task/flashcard management UI, Trello, dashboard, admin, and full DESIGN styling pass require separate approval. **Lint is required** before PRs: `npm run lint` in `backend/`, `document-service/`, and `frontend/` (see `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`). Do not restart Phase 1D, 1F, 1G, 2B backend, 2C frontend, 2D document-service, 2E generate orchestration, 2F Generate UI, 2G Quality/Lint, or re-apply 003. Do not use `npm audit fix --force` without explicit human approval.

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
