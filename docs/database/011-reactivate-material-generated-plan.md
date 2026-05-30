# 011 — Reactivate Material Generated Plan (Phase 11A-2)

**Status:** **Applied manually** on Supabase (Phase 11A-2 complete; Security Review passed after ROW_COUNT hardening; manual smoke passed — **2026-05-30**).  
**Migration file:** `supabase/migrations/011_reactivate_material_generated_plan.sql`  
**Prerequisite:** `010_material_generated_plans_active_history.sql` applied and verified

---

## Purpose

Phase 11A-2 adds an atomic RPC to **reactivate** an existing inactive generated plan row as the current active plan — without inserting a new row, calling Gemini, or running retention prune. The Express backend exposes history REST endpoints (list, get-by-id, activate, delete inactive) that use this RPC for activate only.

**In this phase:** RPC + backend history REST API + tests. **Not in this phase:** history list UI (Phase **11A-3** deferred); document-service changes.

---

## RPC: `reactivate_material_generated_plan`

**Signature:** `(p_study_material_id uuid, p_course_id uuid, p_plan_id uuid)`  
**Returns:** `(plan_id uuid, saved_at timestamptz)` — empty result set if plan not found for material/course  
**Grant:** `EXECUTE` to `service_role` only  
**Security:** `SECURITY DEFINER`, `search_path = public`

**Steps (single transaction):**

1. Look up target row by `p_plan_id`, `p_study_material_id`, `p_course_id` — return empty if not found
2. If target is already active, return its `plan_id` and `updated_at` (idempotent)
3. `UPDATE` current active row(s) for the material/course → `is_active = false`
4. `UPDATE` target row → `is_active = true`
5. **`GET DIAGNOSTICS`** — raise exception if target activation affected **≠ 1** row (ROW_COUNT hardening)
6. Return activated `plan_id` and `updated_at`

**Does not:** insert new rows; call Gemini or document-service; run retention prune (cap remains **10** rows per material from generate path only).

The Express backend calls this RPC **after** ownership checks via `getOwnedMaterialOrThrow`. Invalid plans are not written by this RPC — it toggles existing validated rows only.

---

## Backend API (Phase 11A-2)

| Route | Behavior |
|-------|----------|
| `GET …/generated-plans` | List metadata only — `planId`, `savedAt`, `createdAt`, `updatedAt`, `isActive`; **no** `plan` JSON |
| `GET …/generated-plans/:planId` | Full validated plan for owned material + matching `planId` |
| `POST …/generated-plans/:planId/activate` | Body **`{}` strict**; RPC reactivate; returns full plan; no Gemini/insert/prune |
| `DELETE …/generated-plans/:planId` | Inactive only; active delete → **409**; response `{ deleted: true, planId }` |

**Unchanged from 11A-1:**

| Route | Behavior |
|-------|----------|
| `POST …/generate` | Body `{}` only; one Gemini call; RPC `activate_material_generated_plan` after validation |
| `GET …/generated-plan` | Active plan only |
| `DELETE …/generated-plan` | Active plan only |

Ownership: same course-chain checks and neutral **404** for wrong-owner access.

---

## Apply instructions

1. Confirm `010_material_generated_plans_active_history.sql` is already applied.
2. **Applied** — `supabase/migrations/011_reactivate_material_generated_plan.sql` run manually in Supabase SQL Editor on **2026-05-30**.
3. Verify:
   - Function `reactivate_material_generated_plan` exists
   - `EXECUTE` granted to `service_role` only (revoked from `public`, `anon`, `authenticated`)
   - Activate inactive plan via backend smoke leaves exactly one active row per material

Do **not** re-run on an environment where 011 changes already exist.

---

## Free Tier controls

| Control | Rationale |
|---------|-----------|
| **No insert on reactivate** | Reactivation reuses existing jsonb — no new storage from history browse |
| **No prune on reactivate** | Retention cap enforced only on generate (Phase **11A-1**) |
| **Metadata-only list** | List endpoint avoids returning full plan JSON for every history row |
| **Inactive delete only** | Active plan protected — user must use `DELETE …/generated-plan` or regenerate to remove active |
