# Post-MVP — StudyOps AI

**Purpose:** Clarify product framing for owners and agents. This is **not** a feature backlog and does **not** approve any future work.

---

## Initial MVP is closed

The initial MVP baseline (auth through admin aggregate stats, core study workflows, Trello sync foundation, focus, dashboard, CI) is **complete**. StudyOps AI is an **actively developed browser-based web product**, not a demo-only or MVP-limited experiment.

Many **post-MVP phases are already merged**, including generated plan history (**11A**), material cockpit (**12A-1**), presentation polish (**B1**–**B4**, **BX-I***), **Trello OAuth A2–A6** (connect, encrypted token storage, connected-account sync, board/list defaults), and **Gemini generate UX polish** (**GEMINI-GENERATE-UX-A1**).

---

## Future work still requires explicit approval

Post-MVP framing does **not** auto-approve new features. Every new phase still needs explicit human approval (e.g. `approved — begin Phase X planning only` / `approved — implement Phase X`).

**This document does not approve any specific future feature** — including PDF upload, admin logs, spaced repetition, Trello card lifecycle, payments, native mobile, or production deployment.

---

## Existing gates still apply

Sensitive or high-impact work still requires the project's existing discipline:

| Gate | Examples |
|------|----------|
| **Security Review** | Auth, admin, Trello, Gemini, env/secrets, RLS/service_role |
| **Database migration approval** | Schema changes, new Supabase migrations |
| **Paid-service / cost approval** | New SaaS, paid APIs, paid storage tiers |
| **Env / secrets review** | New secrets, env renames, `.env` handling |
| **CI / deployment approval** | `.github/workflows/*`, deployment strategy |
| **Supervisor Review** | Diff review before merge (scope, tests, PRD/plan alignment) |

See **`AGENTS.md`**, **`CONTRIBUTING.md`**, and **`docs/IMPLEMENTATION_STATUS.md`** § Operating constraints.

---

## Authoritative shipped state

- **`docs/IMPLEMENTATION_STATUS.md`** — what is built today (routes, APIs, deferred list)
- **`docs/CURRENT_STATE.md`** — short starting point for agents
- **`docs/AGENT_MEMORY.md`** — phase history and pitfalls (append-only journal)

When docs disagree on **shipped behavior**, **`IMPLEMENTATION_STATUS`** wins.

---

## Still deferred (not approved by this document)

Including but not limited to:

- **PDF upload/parsing**
- **`api_logs` / admin log UI**
- **Spaced repetition** / advanced flashcard study
- **Production deployment** (cloud/hosted) — local dev + CI only unless separately approved
- **Payments**, native/mobile app, course-level paste-generate, dashboard polling/WebSockets

---

**End of POST_MVP.md**
