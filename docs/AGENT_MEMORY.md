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

**Status:** Phase 1A–1G complete (through courses UI). Phase 2A `public.study_materials` **applied and verified** on Supabase. Phase 2B Study Materials Backend API and Phase 2C Study Materials Frontend UI **complete** (Supervisor + Security approved). **Manual smoke test passed** after Phase 2C. Phase 2D Gemini document-service **complete** (Supervisor + Security approved; `POST /process`, tests 27/27 mocked). Phase 2E Backend Generate Orchestration **complete** (Supervisor + Security approved; backend tests 99/99 mocked). Phase 2F Frontend Generate UI **complete** (Supervisor + Security approved; material-detail generate flow; frontend tests 34/34 mocked). Phase 2G Quality/Lint **complete** (Supervisor + Security approved; ESLint in all packages + CI + `check-all.ps1`). Phase 2H Docs / Agent Workflow **complete** (Supervisor + Security approved; `docs/IMPLEMENTATION_STATUS.md` hub, governance docs aligned). Phase 2I-a Stitch / DESIGN brief prep **complete** (Supervisor + Security approved; `docs/STITCH_BRIEF.md`, screenshot index, security hardening). Phase 2I-b design screenshots **complete** (Supervisor + Security approved; **14 PNGs** under `docs/design/screenshots/` including **`11-generated-plan-visible.png`** from Phase 2K-c). Phase 2I-c **`DESIGN.md` v2** **complete** (Supervisor + Security approved; NotebookLM-inspired presentation spec only — **not** product scope). Phase 2J **Frontend Styling Pass** **complete** (Supervisor + Security approved; DESIGN.md v2 applied via plain CSS — presentation only, no behavior changes). Phase 2K-a **Generate live smoke** **attempted** — pipeline verified through UI/backend; **blocked by Gemini HTTP 429** (no plan captured; **no code bug suspected**). Phase 2K-b **Generate live smoke and pending screenshots** **attempted** — pre-flight passed; **one** Generate click; processing UI observed; **blocked again by Gemini HTTP 429** (no repo PNGs; persistence success path **not** verified live; **no code bug suspected**). Phase 2L-a **`public.material_generated_plans`** **complete** (Supervisor + Security approved; migration **applied manually** on Supabase — one latest plan per material, RLS + grants). Phase 2L-b **Backend Generated Plan Persistence** **complete** (Supervisor + Security approved; UPSERT on successful generate, GET/DELETE latest plan, backend Zod before write; backend tests **118/118** mocked). Phase 2L-c **Frontend Generated Plan Load/Clear** **complete** (Supervisor + Security approved; load/clear via backend GET/DELETE; plain React text; frontend tests **43/43** mocked). Phase 2L-d **Docs and Smoke Alignment** **complete** (Supervisor + Security approved; governance docs + manual smoke checklist aligned to persisted latest plan). Phase 2M **Seeded Persisted Plan Smoke** **complete** — persistence GET/load/refresh/Clear validated **without Gemini** (fake DB seed + UI smoke; **no** Generate click; **no** official screenshots). Phase 2O-b **Gemini model env configuration** **complete** (Supervisor + Security approved; `GEMINI_MODEL` env, default **`gemini-2.5-flash-lite`**; no longer hardcoded `gemini-2.0-flash`; document-service tests **31/31** mocked). Phase 2O-c **Gemini prompt/schema contract hardening** **complete** (Supervisor + Security approved; strengthened `buildGeminiPrompt()` contract; **`GeminiOutputSchema` not loosened**; document-service tests **43/43** mocked; **no live Gemini** during implementation). Phase 2O-c **live external AI Generate smoke** **passed** — **one** Generate click with **`gemini-2.5-flash-lite`**; Gemini **HTTP 200**; document-service Zod pass; backend UPSERT + frontend display; refresh reload **without** second Generate; confirms **live external AI API success** for material-scoped Generate. Phase 2K-c **`11-generated-plan-visible.png` captured** from that saved plan (**no** extra Generate). **`15-processing-with-ai.png`** still **pending**. **Read first for built state:** `docs/IMPLEMENTATION_STATUS.md`. Public tables: `profiles`, `courses`, `study_materials`, `material_generated_plans`, `study_tasks` (3A-a DB + **3A-b backend task API** — **no** task UI yet). GitHub Actions CI: `npm ci` → `npm run lint` → `npm test` per package; frontend also `npm run build` (Node.js 22 in CI). Node.js 20.6+ required locally. **UI spec:** `DESIGN.md` v2 (2026-05-22); **styled in code** via `frontend/src/styles/**`.

**Architecture locked by ADRs:**

- Main backend = modular monolith (001).
- Document processing = separate service (002).
- Zod for Gemini output, requests, env (003).
- Trello credentials not persisted (004).
- Manual List ID required for MVP Trello sync (005).

Phase 3A-a **`public.study_tasks`** **complete** (Supervisor + Security Review approved; migration **applied manually** on Supabase and **verified** — schema/RLS only). Phase 3A-b **Study Tasks Backend API** **complete** (Supervisor + Security Review approved; manual `study_tasks` CRUD via Express — **no** frontend task UI). Phase 3A-b.1 **Docs alignment** **complete** — entry-point docs (`docs/PRD.md`, `README.md`, `AGENTS.md`, `docs/workflows/document-processing-workflow.md`) now reflect **3A-a/b**; **no** code, config, or migration changes. **Next implementation:** **No default phase** — start only with a **new branch** and `approved — begin Phase X planning only`. Likely next gated options: **Phase 3A-c** course-level tasks UI or **Phase 3A-d** global `/tasks` UI (each requires separate planning/approval) or **`15-processing-with-ai.png`** — requires a **separately approved** live Generate attempt to capture processing UI — **do not fabricate**. **Do not Clear plan** until **`15-`** screenshot/demo decision is complete. PRD course-level paste-generate remains **deferred**. study_tasks **frontend UI**, flashcards **table/UI**, Trello, focus, dashboard/admin, deployment require separate approval. **2K-a / 2K-b:** earlier **Gemini 429** — superseded for Generate success path by **2O-c live smoke PASS**. **2M** validated persistence without Gemini. **2O-b/c:** model env + prompt hardening + **live Generate PASS** (`gemini-2.5-flash-lite`). If **429** returns on a future smoke, stop — **no retry loops**. **Lint is required** for code PRs (see `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`). **Agent workflow:** planning → implement → lint/tests (code phases) → Supervisor + Security when required → `approved — Phase X complete` → `AGENT_MEMORY`. Do not restart **2O-c** implementation/live smoke, **2O-b**, **2L-a/b/c/d**, **2M**, or re-apply 003. Do not use `npm audit fix --force` without explicit human approval.

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
