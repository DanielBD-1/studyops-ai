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

**Status:** Phase 1A–1D complete. Phase 1C `public.profiles` and Phase 1E `public.courses` **applied and verified** on Supabase. Phase 1F Courses Backend API and Phase 1G Courses Frontend UI complete. GitHub Actions CI is configured and verified green on GitHub using Node.js 22. Node.js 20.6+ required locally. `DESIGN.md` exists as lightweight UI guidance only.

**Architecture locked by ADRs:**

- Main backend = modular monolith (001).
- Document processing = separate service (002).
- Zod for Gemini output, requests, env (003).
- Trello credentials not persisted (004).
- Manual List ID required for MVP Trello sync (005).

**Next implementation:** Requires separate human approval per PRD/workflow (e.g. study plan generation, tasks, document-service). Do not start tasks, flashcards, Gemini, Trello, dashboard stats, admin, or a full DESIGN styling pass without explicit approval. Do not restart Phase 1D, 1F, or 1G.

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
