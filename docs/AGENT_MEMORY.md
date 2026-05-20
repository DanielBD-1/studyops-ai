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

**Status:** Phase 1A scaffold + Phase 1B env complete + Phase 1C `public.profiles` applied/verified on Supabase. Node.js 20.6+ required. Auth and other tables not started.

**Architecture locked by ADRs:**

- Main backend = modular monolith (001).
- Document processing = separate service (002).
- Zod for Gemini output, requests, env (003).
- Trello credentials not persisted (004).
- Manual List ID required for MVP Trello sync (005).

**Next implementation:** Foundation Step 3b (schema, after approval) and Step 4+ (auth) per `docs/workflows/phase-1-foundation-workflow.md` — only when human approves. Skip Step 2 (scaffold done in 1A).

**Known constraints:**

- Study text: 100–50,000 characters.
- Gemini timeout: 30s, no retry on timeout/validation failure.
- Session: 24h with Supabase refresh; redirect on expiry.
- Admin users: manual creation in Supabase (not self-register).

---

## Memory Log

<!-- Append entries below this line -->

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
