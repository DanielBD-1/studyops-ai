# Screenshot index — StudyOps AI (Phase 2I)

**Purpose:** Checklist for humans capturing the **current functional UI** before Stitch sessions.  
**Folder:** `docs/design/screenshots/`  
**Rules:** Fake data only · no real student content · no secrets · no `.env` values

---

## How to capture

1. Run the app locally (`frontend` + `backend` + Supabase per `README.md`).
2. Use a **test account** with obviously fake email (e.g. `demo.student@example.test`).
3. Create **fake courses and materials** using placeholder titles and lorem-style content (≥100 characters for material body).
4. Desktop baseline: **1440×900** (or full browser width with consistent zoom).
5. Save PNG (or WebP) using the filenames below.
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

**Optional:** Repeat key screens at **390×844** (mobile) with suffix `-mobile` (e.g. `04-courses-list-mobile.png`).

---

## Required screenshots

| # | Filename | Route / state | What must be visible |
|---|----------|---------------|----------------------|
| 1 | `01-login.png` | `/` | Email + password form, link to Register, StudyOps branding/title if present |
| 2 | `02-register.png` | `/register` | Register form, link to Login |
| 3 | `03-dashboard.png` | `/dashboard` | Stub only: signed-in identity (fake email), link/CTA to Courses, logout — **no charts or stats** |
| 4 | `04-courses-list.png` | `/courses` | ≥2 fake courses in list, create affordance visible |
| 5 | `05-courses-empty.png` | `/courses` | Empty state copy + primary CTA to create first course |
| 6 | `06-course-detail.png` | `/courses/:id` | Course title, materials list (≥1 material), navigation back to courses |
| 7 | `07-create-material.png` | `/courses/:id` | Create material form open: title, content, source type fields |
| 8 | `08-material-edit.png` | `/study-materials/:materialId` | Edit form with fake title and long placeholder content |
| 9 | `09-generate-action.png` | `/study-materials/:materialId` | **Generate study plan** button/section visible (plan may be hidden) |
| 10 | `10-generated-plan.png` | `/study-materials/:materialId` | Generated plan section visible: summary, topics, tasks/flashcards as read-only |
| 11 | `11-unsaved-warning.png` | `/study-materials/:materialId` | Unsaved changes warning when generate attempted with dirty form |
| 12 | `12-processing-ai.png` | `/study-materials/:materialId` | Loading / “Processing with AI…” during generate |
| 13 | `13-validation-error.png` | Any form screen | Inline validation (e.g. title too short or content &lt;100 chars) |
| 14 | `14-not-found.png` | Course or material | Neutral not-found message (invalid id or deleted resource) |

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

1. Attach all available PNGs from `docs/design/screenshots/`.
2. Paste the prompt block from `docs/STITCH_BRIEF.md` §17.
3. Cross-check outputs against `docs/STITCH_BRIEF.md` §6 (out of scope) and §14 (review checklist).

---

## Status

| Item | Status |
|------|--------|
| Screenshot files in repo | **Pending** — human capture after local run |
| `STITCH_BRIEF.md` | **Ready** — Phase 2I |
| `DESIGN.md` v2 | **Pending** — after Stitch review |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-20 | Initial screenshot index for Phase 2I |
| 2026-05-20 | Security hardening: capture crop rules, dummy password, pre-commit PNG check |
