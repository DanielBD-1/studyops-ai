# 006 — Flashcards Schema and RLS (Phase 3B-b)

**Status:** **Applied manually** on Supabase (Phase 3B-b complete; Supervisor + Security Review approved; catalog + behavioral verification passed on **2026-05-26**).
**Migration file:** `supabase/migrations/006_flashcards.sql`
**Apply method:** Supabase SQL Editor (not CLI) — **Success. No rows returned.**
**Prerequisite:** migrations **001–005** applied and verified
**PRD reference:** Section 7.5 (View Flashcards) and Section 9 / 9.5 permissions intent

---
## Purpose

Phase 3B-b adds the **database foundation** for DB-backed flashcards by creating `public.flashcards` with:
- columns matching the generated-plan flashcard data shape (`question`, `answer`, `tags`)
- `source` restricted to `'manual'` in this phase only
- ownership consistency triggers (user/course, and optional material/course)
- RLS policies and PostgREST grants for authenticated users

**In this phase:** SQL migration + this database documentation; table **applied and verified** on Supabase. **No** application code.

**Not implemented in Phase 3B-b:**

- **No backend flashcards API** (REST routes deferred to a later phase, e.g. 3B-c).
- **No frontend flashcards management UI** (deferred).
- **No import of generated-plan flashcards into DB rows** (deferred).
- No global `/flashcards` page, known/unknown tracking, spaced repetition, or Gemini/document-service changes.

> **Superseded (post-3B-b):** Backend flashcards API (**3B-c**), material-detail and global flashcards UI (**3B-d**–**3B-g**), and plan-flashcard import are **implemented**. See **`docs/IMPLEMENTATION_STATUS.md`** for current state — the bullets above describe **3B-b scope only**.

---
## Schema summary

### Table: `public.flashcards`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, `default gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE | Owner |
| `course_id` | `uuid` | NOT NULL, FK → `public.courses(id)` ON DELETE CASCADE | Parent course |
| `material_id` | `uuid` | NULLABLE, FK → `public.study_materials(id)` ON DELETE SET NULL | Optional link to a specific material |
| `question` | `text` | CHECK trim **10–500** | Flashcard question |
| `answer` | `text` | CHECK trim **10–2000** | Flashcard answer |
| `tags` | `text[]` | NOT NULL default `'{}'`, CHECK `cardinality(tags) <= 5` | Up to 5 tags |
| `source` | `text` | NOT NULL default `'manual'`, CHECK **`source in ('manual')`** | Only manual allowed in this phase |
| `created_at` | `timestamptz` | NOT NULL default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL default `now()` | Maintained by trigger |

### Field reasoning

- `question` / `answer` length checks mirror the existing generated-plan constraints so later APIs/import validation can remain consistent.
- `tags` cardinality is constrained to `<= 5` (matches the plan contract).
- `source = 'manual'` only in **3B-b** schema CHECK: plan-flashcard import and broader `source` values were added in later phases — see superseded note under **Not implemented in Phase 3B-b** above and **`docs/IMPLEMENTATION_STATUS.md`**.
- `material_id` is **nullable** so course-level cards can exist without a specific material link (and to match `study_tasks`’ optional `material_id` pattern).

---
## Relationships and cascade behavior

### Relationship graph

```text
auth.users(id) = auth.uid()
        │
        └── flashcards(user_id)
                │
                └── courses(user_id) → flashcards(course_id)

flashcards.material_id → study_materials(id) → study_materials.course_id → courses(id)
```

### Cascades

| Delete action | Effect on `flashcards` |
|--------------|--------------------------|
| Delete **user** | Flashcards deleted (FK `user_id ... ON DELETE CASCADE`) |
| Delete **course** | Flashcards deleted (FK `course_id ... ON DELETE CASCADE`) |
| Delete **study material** | `material_id` set to NULL (FK `ON DELETE SET NULL`) |

---
## Constraints and ownership triggers

### CHECK constraints

| Constraint | Rule |
|-----------|------|
| `flashcards_question_length` | `char_length(trim(question))` between **10** and **500** |
| `flashcards_answer_length` | `char_length(trim(answer))` between **10** and **2000** |
| `flashcards_tags_cardinality` | `cardinality(tags) <= 5` |
| `flashcards_source_allowed` | `source in ('manual')` |

### Triggers (defense in depth)

| Trigger function | Purpose |
|-------------------|---------|
| `set_flashcards_updated_at` | Sets `updated_at = now()` before UPDATE |
| `enforce_flashcard_user_course_owner` | Ensures `flashcards.user_id` matches `courses.user_id` for `flashcards.course_id` on INSERT/UPDATE |
| `enforce_flashcard_course_material_match` | Ensures that if `material_id` is not NULL, the material belongs to the same `course_id` on INSERT/UPDATE |

These triggers run even when RLS is bypassed (e.g., via `service_role`), ensuring ownership consistency at the database level.

---
## RLS plan and grants

### RLS

`public.flashcards` has **RLS enabled**. Policies apply to **`authenticated`** only.

Policies (applied):

| Operation | Policy name | Rule |
|-----------|-------------|------|
| SELECT | `flashcards_select_own` | `user_id = auth.uid()` |
| INSERT | `flashcards_insert_own` | `user_id = auth.uid()` AND course owned AND (no `material_id` OR material belongs to same course) |
| UPDATE | `flashcards_update_own` | same ownership checks as INSERT |
| DELETE | `flashcards_delete_own` | `user_id = auth.uid()` |

### Grants

The migration revokes access from:
- `anon`
- `authenticated`
- `service_role`

Then grants:
- `SELECT, INSERT, UPDATE, DELETE` to `authenticated`
- `SELECT, INSERT, UPDATE, DELETE` to `service_role`

### service_role warning

`service_role` bypasses RLS. The backend must **always** filter by `user_id` (`req.user.id`) on every flashcards query, even though triggers enforce insert/update ownership consistency.

---

## Security notes / future backend pitfalls

Flashcard **`question`** and **`answer`** are **private study content** (same sensitivity class as study material `content` and flashcards inside generated plan JSON). Treat them accordingly in future phases.

| Topic | Requirement |
|-------|-------------|
| **Frontend access** | **No direct Supabase writes** to `public.flashcards` from the browser. Future frontend must use **Express backend REST only** with Bearer JWT (same as `study_tasks`). |
| **Service role** | Future backend `getSupabaseAdmin()` queries on `flashcards` must **always** filter by **`user_id = req.user.id`** (or equivalent). Never run unfiltered `select` / `update` / `delete` on this table. |
| **RLS vs service_role** | RLS protects **`authenticated`** users from cross-user row access. **`service_role` bypasses RLS** — triggers help on INSERT/UPDATE alignment, but **backend filtering is still mandatory** for SELECT/DELETE and defense in depth. |
| **Wrong-owner / missing id** | Return neutral **`404`** with message such as **“Flashcard not found”** — not **403** (consistent with courses/tasks). |
| **Logging** | Do **not** log full flashcard `question` or `answer` text. Do **not** log tokens, sessions, secrets, full material `content`, or full generated `plan` JSON. See `SECURITY.md`. |

**Phase 3B-b reminder:** Schema/RLS only — **no** API, UI, or import in this phase.

---
## Verification record (applied 2026-05-26)

| Check | Result |
|-------|--------|
| Table `public.flashcards` | Present |
| RLS | `relrowsecurity = true` |
| Columns | `id`, `user_id`, `course_id`, `material_id`, `question`, `answer`, `tags`, `source`, `created_at`, `updated_at` (incl. `updated_at` NOT NULL, timestamptz, default `now()`) |
| Policies | `flashcards_select_own`, `flashcards_insert_own`, `flashcards_update_own`, `flashcards_delete_own` |
| Indexes | `flashcards_pkey`, `flashcards_user_id_created_at_idx`, `flashcards_course_id_created_at_idx`, `flashcards_material_id_idx` (partial) |
| Grants `authenticated` | SELECT, INSERT, UPDATE, DELETE only |
| Grants `service_role` | SELECT, INSERT, UPDATE, DELETE only |
| Grants `anon` | None |
| Trigger functions | `set_flashcards_updated_at`, `enforce_flashcard_user_course_owner`, `enforce_flashcard_course_material_match` |
| Triggers on table | `flashcards_set_updated_at` (UPDATE); `flashcards_enforce_user_course_owner` (INSERT, UPDATE); `flashcards_enforce_course_material_match` (INSERT, UPDATE) |
| CHECK constraints | `flashcards_question_length`, `flashcards_answer_length`, `flashcards_tags_cardinality`, `flashcards_source_allowed` |
| FK constraints | `user_id`, `course_id`, `material_id` — present |

### Behavioral verification

| Probe | Result |
|-------|--------|
| Valid course-level insert (`material_id` null) | Passed |
| In-test row visible after insert | Passed |
| Short question rejected | Passed (CHECK) |
| Too many tags rejected | Passed (CHECK) |
| Invalid `source` rejected | Passed (CHECK) |
| Cross-user (User A vs User B) RLS | **Not run** — no second auth user available in test environment |
| Test row cleanup | Manual delete; `remaining_test_flashcards = 0` after cleanup |

Do **not** re-apply this migration on an environment where `public.flashcards` already exists.

---
## Manual verification checklist (reference)

| # | Check | Expected |
|---|-------|----------|
| 1 | Migration runs without error | No SQL errors |
| 2 | Table exists | `public.flashcards` created |
| 3 | RLS is enabled | `relrowsecurity = true` |
| 4 | Policies exist | `flashcards_select_own`, `flashcards_insert_own`, `flashcards_update_own`, `flashcards_delete_own` |
| 5 | Grants are correct | `anon` none; `authenticated` + `service_role` CRUD only |
| 6 | Question length CHECK | Insert with too-short/too-long `question` fails |
| 7 | Answer length CHECK | Insert with too-short/too-long `answer` fails |
| 8 | Tags cardinality CHECK | Insert with `cardinality(tags) > 5` fails |
| 9 | Source CHECK | Insert with `source != 'manual'` fails |
|10 | User/course mismatch trigger | Insert with `flashcards.user_id` != `courses.user_id` fails (trigger) |
|11 | Material/course mismatch trigger | Insert with material from different course fails (trigger) |
|12 | User A cannot access User B rows | Authenticated user cannot SELECT/UPDATE/DELETE other user rows (**skipped** in 2026-05-26 apply — no second auth user) |
|13 | Course delete cascade | Deleting a course deletes related flashcards |
|14 | Material delete behavior | Deleting a material sets `flashcards.material_id` to NULL |
|15 | service_role wrong-owner insert rejected | service_role insert with wrong `user_id` for course fails (trigger) |

---
## Applying this migration (human gates)

1. **Draft created** — `approved — implement Phase 3B-b` (complete).
2. **Applied on Supabase** — human ran `supabase/migrations/006_flashcards.sql` in SQL Editor on **2026-05-26** (**Success. No rows returned.**).
3. **Verified** — catalog + behavioral probes (see Verification record above); cross-user RLS probe skipped (no second auth user). Documented on `approved — Phase 3B-b complete`.

