# Current State — StudyOps AI

**Purpose:** Short starting point for the owner and for agents. Read this first, then drill into linked docs.

**Last updated:** 2026-06-02 (Phase **DOCS-A3** — documentation alignment after DOCS-A2 audit)

---

## Current stable state

StudyOps AI is a **functional MVP web app**: React frontend → Express backend → document-service (Gemini) → Supabase Auth + Postgres. CI runs lint, tests, and frontend build on Node.js 22.

**Production UI today:** Warm canvas / calm indigo from `frontend/src/styles/tokens.css` (Phases **8A**, **8C**, **B1**–**B3**). Global **`AppShell`**, cockpit layouts, Source | AI material detail (**12A-1**), generated plan history (**11A-3**). **Not live:** BX-I1 dark/glass Stitch skin (docs-only in `DESIGN.md`).

**Branch (as of DOCS-A3):** `phase-b-global-visual-system`

---

## Current phase

| Phase | Status | Notes |
|-------|--------|-------|
| **DOCS-A1** | **Complete** | Source-of-truth cleanup (CURRENT_STATE, AGENT_MEMORY, PRD clarifications). |
| **DOCS-A2** | **Complete** | Documentation reality-check audit only — no file changes. |
| **DOCS-A3** | **Complete** | Closed DOCS-A2 gaps in **`IMPLEMENTATION_STATUS`** + phase pointers. **Documentation only.** |
| **BX-I1** | **Docs written; suspended** | Stitch visual direction in `DESIGN.md` v2.3 (local uncommitted edits may exist). **Not approved for code.** |
| **B4** | **Not started** | Global styling rollout — **suspended** until Supervisor Review after docs cleanup. |
| **BX-I2+** | **Not started** | Dark theme, dashboard hero, charts, course accents **in code** — not approved. |

---

## What is implemented

Full detail: **`docs/IMPLEMENTATION_STATUS.md`**.

| Area | Shipped |
|------|---------|
| **Auth** | Register, login, protected routes, profiles + admin role |
| **Courses & materials** | CRUD; material detail editor |
| **AI generate** | Material-scoped `POST …/generate` body `{}`; persisted plan; history (max 10/material); import tasks/flashcards with dedupe (**10B**) |
| **Tasks** | Course + global UI; filters; edit pending; focus link |
| **Flashcards** | Material + global UI; plan study + saved library CRUD |
| **Trello** | Manual credentials; board/list picker; sync (max 50 tasks); audit logs |
| **Focus** | 25-min timer MVP; start/complete |
| **Dashboard** | Aggregate stats; invalidation-only cross-page refresh (**5C.1**) |
| **Admin** | Aggregate stats only (`/admin`) — no logs, user list, or role UI |
| **Presentation** | **8C-3D**, **12A-1**, **B1**–**B3** (tokens rhythm, shell/cockpit polish, cards/badges) — detail in **`IMPLEMENTATION_STATUS`** § UI polish / **12A-1** / **B1**–**B3** |

---

## What is partial

| Item | Built | Missing / deferred |
|------|-------|-------------------|
| **Dashboard** | Stat tiles + course breakdown | Decision-first hero, charts, weekly focus buckets (BX-1 direction — docs only) |
| **Courses** | List/detail/tasks/materials | Per-course accent identity; plan-coverage indicators (docs only) |
| **Material detail** | Source \| AI cockpit + history | Stitch dark/glass command-column skin (docs only) |
| **Trello** | Manual sync + picker | OAuth, stored credentials, persistence, card update/delete |
| **Admin** | Platform aggregate counts | Logs, user management, role management, Gemini metrics |
| **Design captures** | 14 Phase 2I PNGs + 3 Stitch refs | `15-processing-with-ai.png` pending; many PNGs predate **8C** / **11A-3** |

---

## What is not started

Requires **explicit human approval** (see `AGENTS.md`, `IMPLEMENTATION_STATUS` deferred list):

- **B4** — global visual system rollout beyond B1–B3
- **BX-I2+** — dark graphite theme, glass surfaces, dashboard hero, charts, course accents **in code**
- Sidebar shell migration (Stitch sidebar is reference-only)
- Course-level paste-generate (`POST /api/courses/:courseId/generate`)
- PDF upload/parsing; Trello OAuth; payments; spaced repetition; production deployment
- Dashboard polling / WebSockets / cross-tab sync
- `api_logs` / admin logs UI

---

## Current design direction

**Presentation authority:** `DESIGN.md` (v2.3) — UI/UX only; does **not** change product scope or APIs.

**Live values:** `frontend/src/styles/tokens.css` — authoritative for colors, spacing, shadows in production.

**Approved direction (documented, not fully built):**

1. **Phase A / BX-1** — Modern AI study command center; decision-first dashboard; honest chart rules; course accents; strong Source | AI cockpit.
2. **BX-S / BX-I1** — Stitch-selected **dark graphite / glass** reference (`docs/design/STITCH_SELECTED_REFERENCE.md`, `docs/design/STITCH_VISUAL_STYLE_GUIDE.md`, `stitch-*.png`). **Reference only** — do not copy Stitch HTML/React into `frontend/src`.

**MVP navigation:** Top **`AppShell`** bar remains approved; Stitch sidebar mockups are visual reference only.

**Editing `DESIGN.md` does not approve implementation.** Separate gates required for `tokens.css`, frontend/CSS, chart libraries, fonts/CDN, and API extensions.

---

## Next approved / suspended phases

| Phase | Gate |
|-------|------|
| **DOCS-A3** | **Complete** — **Supervisor Review** before continuing visual work |
| **BX-I1 implementation** | **Suspended** — wait for Supervisor Review after DOCS-A3; doc edits alone are not implement approval |
| **B4** | **Suspended** — not started; requires explicit `approved — implement Phase B4` (or equivalent) after review |
| **BX-I2+** | **Not approved** — dark theme, dashboard hero, charts, course accents in code |

**Human next step (typical):** Supervisor Review of **DOCS-A3** → decide whether to commit `DESIGN.md` BX-I1 delta → plan BX-I2 or B4 with explicit implement approval.

---

## Source-of-truth hierarchy

When documents disagree, resolve in this order:

1. **`docs/IMPLEMENTATION_STATUS.md`** + application code + `supabase/migrations/` — **what is shipped**
2. **`docs/CURRENT_STATE.md`** (this file) — **where we are in phases** and what is suspended
3. **`docs/PRD.md`** — product vision, target MVP, **future / not-yet-built** features
4. **`docs/adrs/*`** — architecture boundaries
5. **`SECURITY.md`** — trust boundaries and Security Review triggers
6. **`AGENTS.md`** / **`docs/workflows/*`** — process and approvals
7. **`docs/AGENT_MEMORY.md`** — historical journal + pitfalls (append-only; must not override 1–4)
8. **`DESIGN.md`** + **`tokens.css`** — presentation (DESIGN = direction; tokens = live values)
9. **Stitch / prototype / screenshots** — inspiration only

Conflict workflow: `docs/workflows/conflict-resolution-workflow.md`

---

## Forbidden assumptions

Do **not** assume without checking **`IMPLEMENTATION_STATUS`** and this file:

| Assumption | Reality |
|------------|---------|
| PRD section describes live behavior | PRD includes **future scope** — verify shipped state |
| `DESIGN.md` or BX-I1 doc update = implement approval | Requires **`approved — implement Phase X`** |
| Stitch exports are production code | **Reference only** — never merge into `frontend/src` |
| Course-level generate with client `studyText` exists | **Deferred** — material-scoped generate with body `{}` only |
| Trello OAuth or stored credentials | **Not implemented** — ephemeral body credentials only |
| Admin logs / user list / role UI | **Not implemented** — aggregate stats only |
| Dashboard charts / hero / dark theme | **Documented direction only** — warm canvas still in production |
| B4 or BX-I2 already approved | **Suspended / not started** until human + Supervisor Review |
| `AGENT_MEMORY` tail entry is current | Read **this file** and **`IMPLEMENTATION_STATUS`** first |
| DOCS-A3 doc sync = BX-I2/B4 implement approval | Requires **`approved — implement Phase X`** |
| `IMPLEMENTATION_STATUS` “Last aligned” before **12A-1** / **B1–B3** | Fixed in **DOCS-A3** — if lag recurs, verify code + **`AGENT_MEMORY`** |
| Screenshots match live UI | Many PNGs **predate 8C / 11A-3 / B1–B3** — trust code + status docs |

**Operating constraints:** Free Tier / minimal cost; no new paid APIs or npm packages without approval; Gemini **429** = quota, not necessarily a bug.

---

## Quick links

| Doc | Use for |
|-----|---------|
| [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) | Routes, APIs, env, DB, deferred work |
| [`PRD.md`](PRD.md) | Product vision and target MVP (includes future scope) |
| [`AGENT_MEMORY.md`](AGENT_MEMORY.md) | Phase history and pitfalls |
| [`../DESIGN.md`](../DESIGN.md) | Presentation spec |
| [`../AGENTS.md`](../AGENTS.md) | Agent approvals and DoD |
| [`../SECURITY.md`](../SECURITY.md) | Security boundaries |
