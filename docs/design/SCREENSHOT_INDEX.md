# Screenshot index — StudyOps AI (Phase 2I)

**Purpose:** Checklist and **authoritative filename list** for screenshots under `docs/design/screenshots/`. Used for human capture and Stitch design reference only — **not** app implementation.

**Folder:** `docs/design/screenshots/`  
**Rules:** Fake data only · no real student content · no secrets · no `.env` values

**Phase 2I note:** Screenshots are design reference only. **`DESIGN.md` v2** (Phase 2I-c) and the **Phase 2J styling pass** are **complete**; only `11-generated-plan-visible.png` and `15-processing-with-ai.png` remain **pending** (do not fabricate).

---

## How to capture

1. Run the app locally (`frontend` + `backend` + Supabase per `README.md`).
2. Use a **test account** with obviously fake email (e.g. `demo.student@example.test`).
3. Create **fake courses and materials** using placeholder titles and lorem-style content (≥100 characters for material body).
4. Desktop baseline: **1440×900** (or full browser width with consistent zoom).
5. Save PNG (or WebP) using the filenames in the tables below.
6. Do not include OS notifications, API keys, or real PII in crops.
7. Capture **application UI only**. Crop so screenshots do not include:
   - Browser DevTools
   - Network tab
   - Application/Storage tab
   - Extension panels
   - Terminal windows
   - IDE editors showing `.env` or environment exports
   - JWTs
   - Session tokens
   - API keys
   - Authorization headers
8. Use a **dedicated test account only** (e.g. `demo.student@example.test`).
9. Use a **dummy password only** (e.g. `TestPassword123!`) — never real credentials or a production/personal account.
10. Before `git add` of PNGs, re-check crops for PII, tokens, and secrets.

**Optional:** Repeat key screens at **390×844** (mobile) with suffix `-mobile` (e.g. `06-courses-list-mobile.png`).

**Do not fabricate:** Do not create fake PNGs for generated-plan or processing states if live Generate output is unavailable.

---

## Captured screenshots (Phase 2I-b — in repo)

These files are committed under `docs/design/screenshots/`:

| # | Filename | Route / state | What must be visible |
|---|----------|---------------|----------------------|
| 1 | `01-login.png` | `/` | Email + password form, link to Register, StudyOps branding/title if present |
| 2 | `02-register.png` | `/register` | Register form, link to Login |
| 3 | `03-dashboard.png` | `/dashboard` | Stub only: signed-in identity (fake email), link/CTA to Courses, logout — **no charts or stats** |
| 4 | `04-courses-empty.png` | `/courses` | Empty state copy + primary CTA to create first course |
| 5 | `05-create-course-form.png` | `/courses` | Create course form visible (title field, submit) |
| 6 | `06-courses-list.png` | `/courses` | ≥2 fake courses in list, create affordance visible |
| 7 | `07-course-detail-materials.png` | `/courses/:id` | Course title, materials list (≥1 material), navigation back to courses |
| 8 | `08-create-material-form.png` | `/courses/:id` | Create material form open: title, content, source type fields |
| 9 | `09-study-material-detail.png` | `/study-materials/:materialId` | Edit form with fake title and long placeholder content |
| 10 | `10-generate-study-plan.png` | `/study-materials/:materialId` | **Generate study plan** button/section visible (plan not required in this capture) |
| 12 | `12-unsaved-changes-warning.png` | `/study-materials/:materialId` | Unsaved changes message when generate is blocked with dirty form |
| 13 | `13-validation-error.png` | Any form screen | Inline validation (e.g. title too short or content &lt;100 chars) |
| 14 | `14-not-found.png` | Course or material | Neutral not-found message (invalid id or deleted resource) |

**Captured count:** 13 PNGs

---

## Pending screenshots (do not fabricate)

Capture only when live Generate (and processing UI) are available locally. **Do not** create placeholder or edited PNGs.

| Filename | Route / state | What must be visible | Reason pending |
|----------|---------------|----------------------|----------------|
| `11-generated-plan-visible.png` | `/study-materials/:materialId` | Generated plan section: read-only summary, topics, difficulty, tasks/flashcards; **saved-as-latest** disclaimer; optional **Last saved** plain text | **Pending** — Phase 2K-a blocked by Gemini HTTP 429; do not fabricate |
| `15-processing-with-ai.png` | `/study-materials/:materialId` | Loading / “Processing with AI…” during generate (processing-only frame) | **Pending** — do not fabricate; processing UI observed in 2K-a |

**Note:** `12-unsaved-changes-warning.png` is **captured** (unsaved-before-generate). Do not reuse the `12-` prefix for the processing screenshot — use `15-processing-with-ai.png` when added.

---

## Suggested fake data (copy-paste safe)

Use variations; do not use real school assignments or personal essays.

| Field | Example |
|-------|---------|
| Email | `demo.student@example.test` |
| Course titles | `Intro to Algorithms`, `Organic Chemistry Lab` |
| Material title | `Chapter 4 — Sorting Algorithms` |
| Material content | `Placeholder study notes for design capture only. Lorem ipsum dolor sit amet…` (ensure ≥100 characters) |
| Source type | `notes` or `textbook` per UI options |

---

## Stitch usage

When running Stitch:

1. Attach **captured** PNGs from `docs/design/screenshots/` (see table above). Do not attach fabricated pending files.
2. Paste the prompt block from `docs/STITCH_BRIEF.md` §17.
3. State in the session that `11-generated-plan-visible.png` and `15-processing-with-ai.png` are **pending** — do not invent a **multi-plan library**, task-management UI, or fake plan content. Latest-plan persistence is **implemented**; screenshot capture is separate.
4. Cross-check outputs against `docs/STITCH_BRIEF.md` §6 (out of scope) and §14 (review checklist).

---

## Status

| Item | Status |
|------|--------|
| Captured screenshots (13) | **In repo** — Phase 2I-b |
| `11-generated-plan-visible.png` | **Pending** — do not fabricate (2K-a: Gemini 429) |
| `15-processing-with-ai.png` | **Pending** — do not fabricate (capture separate from 2L-d) |
| `STITCH_BRIEF.md` | **Ready** — Phase 2I-a |
| `DESIGN.md` v2 | **Complete** — Phase 2I-c (UI/UX spec); styled in code via Phase 2J |
| Full Phase 2I | **Partial** — 13 screenshots in repo; `11-` / `15-` still **pending** (do not fabricate) |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-20 | Initial screenshot index for Phase 2I |
| 2026-05-20 | Security hardening: capture crop rules, dummy password, pre-commit PNG check |
| 2026-05-22 | Phase 2I-b alignment: filenames match captured PNGs; pending generate/processing documented |
