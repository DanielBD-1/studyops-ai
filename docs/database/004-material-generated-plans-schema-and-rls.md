# 004 — Material Generated Plans Schema and RLS (Phase 2L-a)

**Status:** **Applied manually** on Supabase (Phase 2L-a complete; Security Review approved).  
**Migration file:** `supabase/migrations/004_material_generated_plans.sql`  
**Prerequisite:** `001_profiles.sql`, `002_courses.sql`, and `003_study_materials.sql` applied and verified  
**PRD reference:** Section 8 (Gemini output shape), Section 9 (persistence model — latest plan per material implemented in Phases 2L-b/c)

**Supersession (Phase 11A-1):** `010_material_generated_plans_active_history.sql` **applied manually** on Supabase (**2026-05-30**). The one-row-per-material `UNIQUE (study_material_id)` model is replaced by multiple rows with `is_active` and retention. See `docs/database/010-material-generated-plans-active-history.md`.

---

## Purpose

Phase 2L-a adds `public.material_generated_plans` to store **one latest validated AI-generated study plan per study material**. This is the database foundation for persistence after `POST /api/study-materials/:materialId/generate` succeeds (implemented in Phase 2L-b).

**In this phase:** SQL migration + this document only.

**Not in this phase (2L-a only):** backend write/read API, frontend save/load UI, document-service changes, `study_tasks` / `flashcards` tables, plan history, failed-attempt logging, raw Gemini response storage. (API/UI implemented in **2L-b/c** — see `docs/IMPLEMENTATION_STATUS.md`.)

---

## Model: one latest plan per material

| Rule | Detail |
|------|--------|
| **Cardinality** | At most **one row** per `study_material_id` (`UNIQUE`) |
| **Replace** | Regenerate (later) **UPSERT** overwrites `plan` and `updated_at` |
| **No history** | No version table, no attempt log |
| **No failures** | Do not store rows for failed or partial Gemini calls |
| **No content copy** | Do not duplicate `study_materials.content` in this table |
| **No raw AI** | `plan` is validated JSON only — not raw Gemini payloads |

---

## Free Tier controls

| Control | Rationale |
|---------|-----------|
| **Bounded rows** | Row count ≤ number of study materials |
| **No history** | Avoid unbounded growth |
| **CASCADE deletes** | Plan removed when material or course is deleted |
| **JSONB size cap** | `pg_column_size(plan) <= 262144` (256 KiB) in DB; stricter shape limits in backend Zod (Phase 2L-b) |
| **No analytics tables** | No usage logs or generate audit in 2L-a |

---

## Identity and ownership

### Course-chain only (no `user_id` on this table)

```text
auth.users(id) = auth.uid() = profiles.id
        │
        └── courses(user_id)                    ← direct owner
                │
                ├── study_materials(course_id)
                │
                └── material_generated_plans(course_id, study_material_id)
```

| Rule | Detail |
|------|--------|
| **Parent material** | `study_material_id` → `public.study_materials(id)` ON DELETE CASCADE |
| **Parent course** | `course_id` → `public.courses(id)` ON DELETE CASCADE |
| **Owner check** | `courses.user_id = auth.uid()` |
| **Material alignment** | `study_materials.id = study_material_id` AND `study_materials.course_id = course_id` (RLS + `BEFORE INSERT OR UPDATE` trigger) |
| **No `user_id`** | On `material_generated_plans`; ownership via course chain only |

The backend (Phase 2L-b) must use **service role** only on the server, verify `study_material_id` → `course_id` → `courses.user_id = req.user.id` before any write, and return **neutral 404** for wrong-owner or missing resources (match existing study materials IDOR behavior).

The **frontend** must **not** insert/update/delete saved plans via Supabase client — all persistence goes through the Express API with Bearer JWT.

---

## Table: `public.material_generated_plans`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | |
| `study_material_id` | `uuid` | NOT NULL, **UNIQUE**, FK → `study_materials(id)` ON DELETE CASCADE | One plan per material |
| `course_id` | `uuid` | NOT NULL, FK → `courses(id)` ON DELETE CASCADE | Denormalized for RLS; must match material’s course |
| `plan` | `jsonb` | NOT NULL, CHECK object + size ≤ 256 KiB | Validated server-side before write (2L-b) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | First persist |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Last overwrite |

**Indexes:**

| Index | Columns | Purpose |
|-------|---------|---------|
| `material_generated_plans_course_id_idx` | `(course_id)` | Course-scoped lookups (optional admin-free student queries later) |
| (implicit) | `study_material_id` UNIQUE | Primary access path per material |

**Triggers:**

| Trigger | Function | Purpose |
|---------|----------|---------|
| `material_generated_plans_set_updated_at` | `set_material_generated_plans_updated_at()` | Maintain `updated_at` on UPDATE |
| `material_generated_plans_enforce_course_match` | `enforce_material_generated_plan_course_match()` | Reject `study_material_id` / `course_id` mismatch (including service_role writes) |

**`plan` shape (application layer, Phase 2L-b):** Align with document-service `GeminiOutputSchema` — `summary`, `keyTopics`, `difficulty`, `tasks[]`, `flashcards[]`. DB only enforces JSON object + size; **Zod validation is required before INSERT/UPDATE**.

---

## GRANT vs RLS (both required)

| Layer | What it controls |
|-------|------------------|
| **`GRANT`** | Whether `authenticated` / `service_role` may access the table via Supabase Data API |
| **RLS** | Which rows `authenticated` may see or change |

**Both are required:**

1. `REVOKE ALL` from `anon`, `authenticated`, `service_role`; then `GRANT SELECT, INSERT, UPDATE, DELETE` to `authenticated` and `service_role` only (no `GRANT ALL`).
2. RLS policies with course ownership + material/course alignment predicates.

**`anon`:** No privileges.

**`service_role`:** Table grants present for backend server use; **bypasses RLS**. Application code must enforce ownership on every query — never expose service role to the browser.

---

## Row Level Security (Phase 2L-a)

RLS is **enabled** on `public.material_generated_plans`. Policies apply to **`authenticated`** only.

**Ownership predicate** (all policies):

```sql
exists (
  select 1
  from public.courses c
  where c.id = material_generated_plans.course_id
    and c.user_id = auth.uid()
)
and exists (
  select 1
  from public.study_materials sm
  where sm.id = material_generated_plans.study_material_id
    and sm.course_id = material_generated_plans.course_id
)
```

| Operation | Policy | Rule |
|-----------|--------|------|
| **SELECT** | `material_generated_plans_select_own_course` | `USING (predicate)` |
| **INSERT** | `material_generated_plans_insert_own_course` | `WITH CHECK (predicate)` |
| **UPDATE** | `material_generated_plans_update_own_course` | `USING` and `WITH CHECK (predicate)` |
| **DELETE** | `material_generated_plans_delete_own_course` | `USING (predicate)` |

**Not included:** admin “view all plans” policies.

---

## Data API grants (in migration)

```sql
revoke all on table public.material_generated_plans from anon;
revoke all on table public.material_generated_plans from authenticated;
revoke all on table public.material_generated_plans from service_role;

grant select, insert, update, delete on table public.material_generated_plans to authenticated;
grant select, insert, update, delete on table public.material_generated_plans to service_role;
```

---

## Delete cascade behavior

| Action | Effect on `material_generated_plans` |
|--------|--------------------------------------|
| Delete **study material** | Plan row deleted (FK CASCADE) |
| Delete **course** | Materials deleted → plans deleted (via materials and direct `course_id` CASCADE) |
| Delete **user** | Courses deleted → cascade as above |

---

## Security notes

| Topic | Requirement |
|-------|-------------|
| **Untrusted AI output** | Treat `plan` as untrusted until backend Zod validation immediately before write (Phase 2L-b) |
| **Ownership** | Backend verifies material → course → user before UPSERT/GET/DELETE |
| **IDOR** | Wrong owner or missing plan/material → **404** at API (not 403) |
| **Frontend** | No direct Supabase writes for saved plans; anon key only in client |
| **service_role** | Backend server only — never in `VITE_*` or frontend `.env` |
| **Logging** | Do not log full `plan`, full `study_materials.content`, prompts, API keys, or `Authorization` headers |
| **Rendering** | Plain React text only — no `dangerouslySetInnerHTML` (frontend phase) |
| **Generate contract** | Unchanged: `POST .../generate` body `{}`; no client `studyText` on generate |

---

## Applying this migration (human gates)

1. **Draft created** — `approved — implement Phase 2L-a DB schema and RLS` (complete).
2. **Applied on Supabase** — human ran `supabase/migrations/004_material_generated_plans.sql` in SQL Editor on **2026-05-23**.
3. **Verified** — Supervisor + Security Review completed; documented in `docs/AGENT_MEMORY.md`.

Do **not** re-apply this migration on an environment where `public.material_generated_plans` already exists.

---

## Verification checklist (after apply)

Run as an authenticated student (Supabase SQL Editor with JWT, or app after Phase 2L-b API exists).

| # | Check | Expected |
|---|--------|----------|
| 1 | Table exists | `public.material_generated_plans` present |
| 2 | RLS enabled | `relrowsecurity = true` |
| 3 | Policies | `_select_`, `_insert_`, `_update_`, `_delete_` own course |
| 4 | `anon` grants | No privileges |
| 5 | `authenticated` grants | `SELECT`, `INSERT`, `UPDATE`, `DELETE` only |
| 6 | `service_role` grants | Same four privileges (no `GRANT ALL`) |
| 7 | UNIQUE | Second INSERT same `study_material_id` → unique violation |
| 8 | `plan` CHECK | Non-object JSON → constraint error |
| 9 | `plan` size CHECK | Oversized jsonb → constraint error |
| 10 | Course mismatch trigger | `study_material_id` from another course → trigger error |
| 11 | INSERT own material/course | Valid object `plan` → success |
| 12 | INSERT other user’s course | Denied by RLS |
| 13 | SELECT | Only plans for own courses |
| 14 | UPDATE own row | Success; `updated_at` changes |
| 15 | DELETE own plan | Success |
| 16 | CASCADE | Delete material → plan deleted |
| 17 | CASCADE | Delete course → plans deleted |
| 18 | Regression | `profiles`, `courses`, `study_materials` unchanged |

---

## Out of scope (Phase 2L-a)

- Backend persistence API (Phase 2L-b)
- Frontend load/clear UI (Phase 2L-c)
- Live Gemini calls, CI Gemini, screenshot capture
- `study_tasks`, `flashcards`, file upload, Trello, admin analytics
- Plan history, failed-attempt tables, raw Gemini column

---

## Related artifacts

- `supabase/migrations/003_study_materials.sql` — parent material table
- `docs/database/003-study-materials-schema-and-rls.md`
- `document-service/src/schemas/gemini.schema.js` — target plan shape for 2L-b validation
- `SECURITY.md` — AI output persistence and Security Review triggers
- `docs/IMPLEMENTATION_STATUS.md` — built state (updated after later 2L phases)
