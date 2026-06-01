# Phase BX-S — Selected Stitch visual direction

**Phase:** BX-S  
**Last updated:** 2026-06-01

---

## Status

**Selected external visual reference only.**

This document records the user’s choice of Stitch as the target visual direction for StudyOps AI. It is **not** implementation scope, **not** production code, and **not** product truth until the direction is translated into `DESIGN.md`, `frontend/src/styles/tokens.css`, and separately approved frontend phases.

Do **not** copy Stitch-generated code into `frontend/src`. Do **not** edit production UI based on this file alone.

---

## Why Stitch was selected

Among the external design tools tested for StudyOps AI, **Stitch** offered the strongest visual direction:

- **Strongest visual direction** among tested tools — clearest match to “modern AI study command center”
- **More alive, bold, modern, and premium** than calmer beige/indigo alternatives
- **Better AI study command center feeling** — product reads as student-facing SaaS, not internal tooling
- **Stronger dashboard hierarchy** — decision-first layout; “What should I study next?” reads as the hero story
- **Useful charts and progress visuals** — study-oriented data presentation (subject to honest-data rules at implementation time)
- **Better course accent identity** — courses feel distinct without gamified chrome
- **Stronger AI cockpit** — Source | AI command stack feels first-class on material detail
- **Less boring CRUD/admin-panel feeling** — avoids generic BI/admin dashboard tone while staying student-serious

---

## Referenced files

| Asset | Path |
|-------|------|
| Visual style guide | `docs/design/STITCH_VISUAL_STYLE_GUIDE.md` |
| Dashboard screenshot | `docs/design/screenshots/stitch-01-dashboard.png` |
| Courses screenshot | `docs/design/screenshots/stitch-02-courses.png` |
| Material cockpit screenshot | `docs/design/screenshots/stitch-03-material-cockpit.png` |

Related context (read-only; not superseded by this selection doc):

- `docs/design/PROTOTYPE_REFERENCES.md` — Phase BX-0 Canvas prototype reference
- `DESIGN.md` — current product presentation spec (v2.2; Phase BX-1 direction)
- `docs/AGENT_MEMORY.md` — agent session memory and phase gates

---

## Visual qualities to preserve

When this direction is later translated into design tokens and UI, preserve these qualities from the Stitch reference:

- **Dark graphite/slate app shell** — deep surfaces, readable contrast, command-center atmosphere
- **Electric blue / violet / cyan accents** — energetic AI/product highlights without childish gamification
- **Frosted glass cards** — layered depth; polished SaaS feel
- **Bold “What should I study next?” hero** — decision-first dashboard story before aggregate counts
- **Useful study charts** — honest, student-meaningful progress and workload visuals (not KPI theater)
- **Course accent colors** — light per-course identity on cards and headers
- **Strong AI command panel** — material detail AI column as a first-class surface
- **Modern SaaS/product feel** — shipping-quality polish, clear CTAs, confident typography
- **Polished CTAs** — obvious primary actions; restrained but deliberate micro-interaction
- **Less beige/indigo calm UI** — move away from the current calmer Phase A/B presentation where approved

---

## Important notes

### Shell and navigation

- The **Stitch reference uses a sidebar-style shell** (persistent left navigation).
- The **current StudyOps app uses `AppShell` with top navigation** (see `DESIGN.md` and implemented `frontend/src`).
- **Sidebar or full shell redesign requires separate human approval** before any implementation phase. This selection doc does **not** approve sidebar migration.

### Design system and theme

- A **dark visual system** in the Stitch reference is **not** live in production today.
- **`DESIGN.md` and `tokens.css` must be updated** (separate approved doc phases) before frontend work applies a dark Stitch-aligned theme.

### Charts and data

- **Charts must later use honest data only** — no fabricated KPIs, placeholder metrics in production, or decorative numbers (per `DESIGN.md` v2.2 / BX-1 chart rules).
- **No chart libraries or packages** unless separately approved in an implementation gate.

### Code boundary

- **Do not copy Stitch-generated HTML/React/CSS into `frontend/src`.** Screenshots and `STITCH_VISUAL_STYLE_GUIDE.md` are **reference only**, same authority class as Stitch mockups noted in `DESIGN.md`.

---

## Constraints

StudyOps AI product constraints apply to any future translation of this reference:

| Constraint | Rule |
|------------|------|
| Platform | **React browser-based web app** only — no native mobile app |
| Data honesty | **No fake KPIs** — charts and stats reflect real APIs when built |
| Gamification | **No XP, streaks, confetti**, or childish reward chrome |
| Tone | **No clinical/hospital look** |
| Tone | **No generic BI/admin dashboard** — student command center, not corporate analytics |

---

## Next step

1. **Supervisor Review** of this selected reference (`STITCH_SELECTED_REFERENCE.md` + linked style guide and screenshots).
2. After approval, decide the **next implementation planning path** (each item is a separate gate; none are started by BX-S):
   - **`DESIGN.md` delta** for Stitch-selected direction (docs only first)
   - **`tokens.css` plan** — dark surfaces, accents, glass, typography rhythm
   - **Shell/navigation plan** — top nav vs sidebar; explicit approval required for shell change
   - **Phased implementation plan** — dashboard hero, course accents, material AI cockpit, charts (honest data; no new packages without approval)

**Forbidden from BX-S:** editing root `DESIGN.md`, `frontend/src`, `tokens.css`, backend, package files; implementing sidebar, dark theme, or charts; starting Phase **B4**; commit or push.

---

## Document control

| Field | Value |
|-------|-------|
| Phase | BX-S |
| Type | Documentation / reference only |
| Supersedes | — (selection record; does not replace `DESIGN.md`) |
| Implementation | **None** — await Supervisor Review and downstream planning gates |
