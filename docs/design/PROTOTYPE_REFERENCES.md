# Prototype references — Phase BX-0

**Status:** Design reference only — **not** product truth, **not** implementation scope.

**Last updated:** 2026-06-01 (Phase **BX-0** — capture strategy: multi-section / full-page allowed)

---

## 1. Prototype name

**Phase BX-0 — Hybrid AI Cockpit + Student SaaS visual reference**

### Interactive source (Canvas)

Cursor Canvas `studyops-visual-prototype.canvas.tsx` (IDE-managed path, **outside this repo**):

`C:\Users\bd159\.cursor\projects\c-Users-bd159-OneDrive-Apps-Desktop-studyops-ai\canvases\studyops-visual-prototype.canvas.tsx`

Open beside chat in Cursor; use **Prototype screens** tabs to switch views. Fake placeholder data only.

**Canvas components (for layout reference):** `DashboardScreen`, `CoursesScreen`, `MaterialCockpitScreen`.

### Code as design reference

The Canvas `.tsx` file describes layout structure, section hierarchy, chart placement, and placeholder copy. It may be read for **design direction** during BX-1 and later approved visual work.

It is **not** production code and **must not** be copied into `frontend/src` or wired to the live app.

---

## 2. Screens captured (archive filenames)

Goal: **readable design references**, not a forced aspect ratio. Prototype screens are **taller than 1440×900**; that is expected.

### Capture rules

| Rule | Guidance |
|------|----------|
| **1440×900 single frame** | **Optional** — use only if the full screen fits cleanly at desktop width |
| **Full-page / long capture** | **Allowed** — scroll and capture the full Canvas content for a tab |
| **Section capture** | **Allowed** when a screen is too tall — use top / middle / bottom (or similar) with **clear filenames** |
| **Crop** | Application UI only — no Cursor IDE chrome, side panels, terminal, tokens, secrets, or personal OS UI when avoidable |
| **Width** | Prefer consistent desktop width (e.g. **1440px** content width); height may vary |

Do **not** fabricate PNGs if the Canvas is unavailable.

### Recommended filenames

**Dashboard** (`DashboardScreen` tab):

| File | Typical content |
|------|-----------------|
| `docs/design/screenshots/proto-01-dashboard-top.png` | Header, “What should I study next?”, upper charts |
| `docs/design/screenshots/proto-01-dashboard-middle.png` | Workload, deadlines, mid sections |
| `docs/design/screenshots/proto-01-dashboard-bottom.png` | Course activity rows, footer band |

**Courses** (`CoursesScreen` tab):

| File | Typical content |
|------|-----------------|
| `docs/design/screenshots/proto-02-courses-full.png` | Full tab in one long capture **or** single frame if it fits |

**Material cockpit** (`MaterialCockpitScreen` tab):

| File | Typical content |
|------|-----------------|
| `docs/design/screenshots/proto-03-material-cockpit-top.png` | Page intro, Source column + AI command header |
| `docs/design/screenshots/proto-03-material-cockpit-middle.png` | Active plan, import toolbar |
| `docs/design/screenshots/proto-03-material-cockpit-bottom.png` | Plan history, plan flashcards, library band |

### Status

| Screen | Archive files | Status |
|--------|---------------|--------|
| Dashboard | `proto-01-dashboard-top.png`, `…-middle.png`, `…-bottom.png` | **Pending** — human capture |
| Courses | `proto-02-courses-full.png` | **Pending** — human capture |
| Material cockpit | `proto-03-material-cockpit-top.png`, `…-middle.png`, `…-bottom.png` | **Pending** — human capture |

**Legacy single-file names** (`proto-01-dashboard.png`, `proto-02-courses.png`, `proto-03-material-cockpit.png`) are **deprecated** — use the filenames above.

### Manual capture steps

1. Open the Canvas path in §1 beside chat.
2. Select each **Prototype screens** tab.
3. Capture using full-page, long scroll, or section crops per the table above.
4. Save with **exact** filenames; re-check crops before `git add`.

---

## 3. Key design ideas to preserve

- **“What should I study next?”** as the primary dashboard zone (concrete next action + short AI suggestion).
- **Meaningful charts and progress visuals** that answer student questions, not corporate KPI theater.
- **Weekly focus time chart** (minutes from focus sessions, labeled axes).
- **Tasks done vs pending** (honest queue breakdown).
- **Course workload distribution** (pending tasks + materials needing a plan, per course).
- **Deadline timeline** (scannable upcoming items).
- **Course accent colors** and visual identity per subject.
- **Plan coverage progress** (% of materials with an active AI plan).
- **Source \| AI cockpit layout** on material detail (source left, AI stack right, accent on AI column).
- **AI-generated plan artifact** (read-only summary, topics, tasks, disclaimers).
- **Plan history** (active vs previous, preview / make active — bounded versions).
- **Flashcard study card** (plan flashcards + saved library distinction).

Aligns with **`DESIGN.md`** Phase A direction (command center + source-first workspace) while exploring richer **student-facing** data presentation than current stat-tile-only dashboard bands.

---

## 4. Explicit constraints

- **Reference only** — inspiration for Phase **BX-1** and later approved visual work.
- **No production code copied** — do not import Canvas code into `frontend/src`.
- **No connection to the live app** — no routes, components, services, API, database, or auth changes from this prototype.
- **Browser web app only** — no native mobile / app-store / phone-first design.
- **No gamification** — no XP, streaks, confetti, or achievement theater.
- **No fake KPIs** — no vanity metrics or generic admin/BI dashboard patterns.
- **Stitch / Canvas exports are not source of truth** — same rule as `DESIGN.md` §0; Canvas code and PNGs inform direction only.

---

## 5. Next step

**Phase BX-1** — update **`DESIGN.md`** with a direction delta (presentation spec only) before any implementation phase. Do **not** start **B4** or edit `tokens.css` / `frontend/` until human approval after BX-1 and Supervisor Review.

---

## Related documents

- `DESIGN.md` — current presentation authority (unchanged by BX-0)
- `docs/design/SCREENSHOT_INDEX.md` — live-app screenshot checklist (01–15)
- `docs/IMPLEMENTATION_STATUS.md` — built product scope
