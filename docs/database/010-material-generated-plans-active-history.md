# 010 — Material Generated Plans Active History (Phase 11A-1)

**Status:** **Applied manually** on Supabase (Phase 11A-1 complete; Security Review passed; manual smoke passed — **2026-05-30**).  
**Migration file:** `supabase/migrations/010_material_generated_plans_active_history.sql`  
**Prerequisite:** `004_material_generated_plans.sql` applied and verified  
**Supersedes (in part):** one-row-per-material model in `docs/database/004-material-generated-plans-schema-and-rls.md`

---

## Purpose

Phase 11A-1 evolves `public.material_generated_plans` from **one row per study material** to **multiple historical rows** with exactly **one active row** per material. The backend keeps existing GET/DELETE/generate routes backward compatible; retention caps total rows per material for Free Tier storage.

**In this phase:** SQL migration + backend persistence/count changes + tests. **Not in this phase:** history list UI, version REST APIs, document-service changes.

---

## Model changes

| Rule | Detail |
|------|--------|
| **Cardinality** | Multiple rows per `study_material_id` |
| **Active flag** | `is_active boolean not null default false` |
| **One active** | Partial unique index on `study_material_id` where `is_active = true` |
| **Backfill** | Existing rows set `is_active = true` before dropping old UNIQUE |
| **Generate** | Inserts new active row; deactivates previous active in same transaction (RPC) |
| **GET** | Returns active row only |
| **DELETE** | Deletes active row only; inactive rows remain until prune |
| **Retention** | After successful generate persist, max **10** rows per `study_material_id` (active + inactive); delete oldest **inactive** by `created_at ASC`; never delete `is_active = true` |
| **Counts** | Dashboard/admin `totalGeneratedPlans` count **active rows only** |

---

## Indexes

| Index | Columns | Notes |
|-------|---------|-------|
| `material_generated_plans_one_active_per_material_idx` | `(study_material_id)` | UNIQUE partial `where is_active = true` |
| `material_generated_plans_active_lookup_idx` | `(study_material_id, course_id)` | Partial `where is_active = true` |
| `material_generated_plans_inactive_prune_idx` | `(study_material_id, course_id, created_at)` | Partial `where is_active = false` — oldest-first prune |

---

## RPC: `activate_material_generated_plan`

**Signature:** `(p_study_material_id uuid, p_course_id uuid, p_plan jsonb, p_max_rows int default 10)`  
**Returns:** `(plan_id uuid, saved_at timestamptz)`  
**Grant:** `EXECUTE` to `service_role` only  
**Security:** `SECURITY DEFINER`, `search_path = public`

**Steps (single transaction):**

1. `UPDATE` prior active rows for the material/course → `is_active = false`
2. `INSERT` new row with `is_active = true` and validated `plan` jsonb
3. Count rows for the material/course; if count > `p_max_rows`, `DELETE` oldest inactive rows (`created_at ASC`, `is_active = false`) until within cap

The Express backend validates Gemini output with Zod **before** calling this RPC. Invalid plans are never passed to the function.

---

## Backend API (unchanged routes)

| Route | Behavior after 11A-1 |
|-------|----------------------|
| `POST .../generate` | Body `{}` only; one Gemini call per click; RPC after validation |
| `GET .../generated-plan` | Active plan only; optional additive `planId` |
| `DELETE .../generated-plan` | Active plan only |

Ownership: same course-chain checks and neutral **404** for wrong-owner access.

---

## Apply instructions

1. Confirm `004_material_generated_plans.sql` is already applied.
2. **Applied** — `supabase/migrations/010_material_generated_plans_active_history.sql` run manually in Supabase SQL Editor on **2026-05-30**.
3. Verify:
   - Column `is_active` exists
   - Partial unique index exists
   - `activate_material_generated_plan` callable by service role
   - Existing rows have `is_active = true`

Do **not** re-run on an environment where 010 changes already exist.

---

## Free Tier controls

| Control | Rationale |
|---------|-----------|
| **Max 10 rows / material** | Bounded history without unbounded jsonb growth |
| **Prune inactive only** | Active plan always retained until replaced or user DELETE |
| **No failure rows** | Unchanged — failed generates do not insert |
| **CASCADE deletes** | Unchanged — plans removed with material/course |
