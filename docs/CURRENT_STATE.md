# Current State — StudyOps AI

**Purpose:** Short starting point for the owner and for agents. Read this first, then drill into linked docs.

**Last updated:** 2026-06-02 (Phase **BX-I3** documentation housekeeping — after commit **`bdd6f2a`**)

---

## Current stable state

StudyOps AI is a **functional MVP web app**: React frontend → Express backend → document-service (Gemini) → Supabase Auth + Postgres. CI runs lint, tests, and frontend build on Node.js 22.

**Production UI today:** Dark graphite / glass token foundation from `frontend/src/styles/tokens.css` (Phase **BX-I2**, commit **`03ee9df`**) — electric blue primary, violet AI accent, cyan data accent, dark-friendly semantic states, source editor surface, filled-button WCAG AA contrast fix. Global **`AppShell`**, cockpit layouts, Source | AI material detail (**12A-1**), generated plan history (**11A-3**), and dashboard **“What should I study next?”** decision hero with **rule-based** next-up recommendation (Phase **BX-I3**, commit **`bdd6f2a`**) — uses existing **`GET /api/dashboard/stats`** only; **no** fake AI priority, deadlines, streaks, health scores, weekly focus charts, or specific task/material titles. **Not live:** chart UI, course accent wiring, sidebar shell, or material cockpit structure redesign (**BX-I4+** / **B4** — require separate planning and explicit approval).

**Branch (as of BX-I3 docs):** `phase-bx-i3-dashboard-decision-layout`

---

## Current phase

| Phase | Status | Notes |
|-------|--------|-------|
| **DOCS-A1** | **Complete** | Source-of-truth cleanup (CURRENT_STATE, AGENT_MEMORY, PRD clarifications). |
| **DOCS-A2** | **Complete** | Documentation reality-check audit only — no file changes. |
| **DOCS-A3** | **Complete** | Closed DOCS-A2 gaps in **`IMPLEMENTATION_STATUS`** + phase pointers. **Documentation only.** |
| **BX-I1** | **Complete** | Stitch visual direction in `DESIGN.md` v2.3 (commit **`6041932`**) — **docs only**. |
| **BX-I2** | **Complete** | Dark graphite / glass global token foundation — **CSS-only** (commit **`03ee9df`**); **`tokens.css`**, **`components.css`**, **`layout.css`** only. Supervisor Review **approved with notes**; Security Review **approved with limitation** (authenticated visual QA deferred — no local test account). |
| **BX-I3** | **Complete** | Dashboard decision layout — **frontend-only** (commit **`bdd6f2a`**); rule-based **“What should I study next?”** hero, study pulse / task progress bars, enhanced course workload rows, secondary **At a glance** stat bands; **`GET /api/dashboard/stats`** only; **14** recommendation unit tests (**219/219** total). Supervisor Review **approved with notes**; Security / Trust Review **approved with limitation** (authenticated dashboard manual smoke not fully completed — no approved local test account). |
| **B4** | **Not started** | Global styling rollout beyond BX-I2 token foundation — requires explicit **`approved — implement Phase B4`**. |
| **BX-I4 / BX-I5 / BX-I6** | **Not started** | Sidebar shell, chart UI, course accent wiring, material cockpit redesign, backend/API extension — **not automatic** after BX-I3; require separate planning and explicit approval each. |

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
| **Dashboard** | Aggregate stats; invalidation-only cross-page refresh (**5C.1**); rule-based **“What should I study next?”** decision hero, study pulse / task progress bars, course workload rows (**BX-I3**) |
| **Admin** | Aggregate stats only (`/admin`) — no logs, user list, or role UI |
| **Presentation** | **8C-3D**, **12A-1**, **B1**–**B3**, **BX-I2** (dark glass tokens, shell/cockpit polish, cards/badges) — detail in **`IMPLEMENTATION_STATUS`** § UI polish / **BX-I2** |

---

## What is partial

| Item | Built | Missing / deferred |
|------|-------|-------------------|
| **Dashboard** | Decision hero, study pulse, course workload rows, secondary stat bands (**BX-I3**) | Chart UI, weekly focus buckets, course health / streak / deadline signals (BX-1 direction — docs only; **not** in BX-I3) |
| **Courses** | List/detail/tasks/materials | Per-course accent identity; plan-coverage indicators (docs only) |
| **Material detail** | Source \| AI cockpit + history + **BX-I2** dark tokens | Cockpit structure / command-column skin redesign (**BX-I4+** — not started) |
| **Trello** | Manual sync + picker | OAuth, stored credentials, persistence, card update/delete |
| **Admin** | Platform aggregate counts | Logs, user management, role management, Gemini metrics |
| **Design captures** | 14 Phase 2I PNGs + 3 Stitch refs | `15-processing-with-ai.png` pending; many PNGs predate **8C** / **11A-3** |

---

## What is not started

Requires **explicit human approval** (see `AGENTS.md`, `IMPLEMENTATION_STATUS` deferred list):

- **B4** — global visual system rollout beyond BX-I2 token foundation
- **BX-I4 / BX-I5 / BX-I6** — sidebar shell, chart UI, course accent wiring, material cockpit redesign, backend/API extension **in code** (each requires separate planning and explicit approval)
- Sidebar shell migration (Stitch sidebar is reference-only)
- Course-level paste-generate (`POST /api/courses/:courseId/generate`)
- PDF upload/parsing; Trello OAuth; payments; spaced repetition; production deployment
- Dashboard polling / WebSockets / cross-tab sync
- `api_logs` / admin logs UI

---

## Current design direction

**Presentation authority:** `DESIGN.md` (v2.3) — UI/UX only; does **not** change product scope or APIs.

**Live values:** `frontend/src/styles/tokens.css` — authoritative for colors, spacing, shadows in production (dark graphite / glass after **BX-I2**).

**Approved direction (documented, not fully built):**

1. **Phase A / BX-1** — Modern AI study command center; decision-first dashboard; honest chart rules; course accents; strong Source | AI cockpit.
2. **BX-S / BX-I1** — Stitch-selected **dark graphite / glass** reference (`docs/design/STITCH_SELECTED_REFERENCE.md`, `docs/design/STITCH_VISUAL_STYLE_GUIDE.md`, `stitch-*.png`). **Reference only** — do not copy Stitch HTML/React into `frontend/src`.

**MVP navigation:** Top **`AppShell`** bar remains approved; Stitch sidebar mockups are visual reference only.

**Editing `DESIGN.md` does not approve implementation.** Separate gates required for `tokens.css`, frontend/CSS, chart libraries, fonts/CDN, and API extensions.

---

## Next approved / suspended phases

| Phase | Gate |
|-------|------|
| **BX-I2** | **Complete** (commit **`03ee9df`**) — follow-up: authenticated visual QA when a test account exists |
| **BX-I3** | **Complete** (commit **`bdd6f2a`**) — follow-up: authenticated dashboard visual QA when a test account exists (dashboard with data, empty dashboard, hero CTAs, refresh stats, study pulse / progress bars, ~375px width, console check for no token/secret/material-content logs) |
| **BX-I4 / BX-I5 / BX-I6 / B4** | **Not started** — **not automatic** after BX-I3; each requires separate planning and explicit **`approved — implement Phase X`** |

**Human next step (typical):** Optional authenticated visual QA for **BX-I2** and **BX-I3** when a valid local test account exists → plan **BX-I4**, **BX-I5**, **BX-I6**, or **B4** separately with explicit implement approval. **Do not** start sidebar, chart UI, course accent wiring, material cockpit redesign, or backend/API extension without a separately approved phase. Next implementation phase is **not automatic**.

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
| Dashboard charts / course accents / sidebar | **Documented direction only** — **not wired in code**; dark token foundation live via **BX-I2**; rule-based decision hero live via **BX-I3** |
| Dashboard hero implies AI recommendation | **BX-I3** hero is **rule-based** only — derived from existing **`GET /api/dashboard/stats`** counts; **no** AI recommendation API |
| B4 or BX-I4+ already approved | **Not started** — **BX-I3** decision layout is complete; sidebar, charts, accent wiring, material cockpit redesign, and backend/API extension require explicit approval each |
| `AGENT_MEMORY` tail entry is current | Read **this file** and **`IMPLEMENTATION_STATUS`** first |
| BX-I3 complete = BX-I4/BX-I5/BX-I6/B4 implement approval | **BX-I3** was dashboard decision layout only; sidebar, chart UI, accent wiring, and further phases need separate gates |
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
