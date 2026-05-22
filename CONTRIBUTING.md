# Contributing to StudyOps AI

Thank you for contributing. This project uses a **branch-based workflow**, explicit **human approval gates**, and agent-assisted **Supervisor** and **Security** reviews for implementation work.

## Branch workflow

1. **Create a branch** for each phase or focused change (e.g. `phase-1g-courses-frontend-ui`).
2. Implement only what is **approved** for that phase (see `docs/PRD.md` and `docs/AGENT_MEMORY.md`).
3. **Open a pull request** before merging into `main` (or the repository default branch).
4. Do **not** force-push to shared branches unless a maintainer explicitly requests it.

## Before you open a PR

### Run tests locally

```bash
cd backend && npm ci && npm run lint && npm test
cd ../document-service && npm ci && npm run lint && npm test
cd ../frontend && npm ci && npm run lint && npm test && npm run build
```

**Windows (after `npm ci` in each package):** from the repository root, run:

```powershell
.\scripts\check-all.ps1
```

This runs **lint**, tests, and frontend build in each package. It does **not** install dependencies, run migrations, create `.env` files, or deploy.

CI runs the same steps on **Node.js 22** (see `.github/workflows/ci.yml`): `npm ci`, then `npm run lint`, then `npm test` (and `npm run build` for frontend). Your PR should pass CI before merge.

### Use the PR template

Opening a PR should populate `.github/pull_request_template.md`. Fill in summary, scope, changed files, tests, migration yes/no, security checklist, and review gates.

### Use issue templates when appropriate

- **Bug report** — `.github/ISSUE_TEMPLATE/bug_report.md`
- **Feature request** — `.github/ISSUE_TEMPLATE/feature_request.md`
- **Security review request** — `.github/ISSUE_TEMPLATE/security_review.md`

Do **not** paste API keys, tokens, credentials, service role keys, or `.env` contents in issues or PR descriptions.

## Reviews and approvals

| Gate | When |
|------|------|
| **Human approval** | Before starting a new phase or sensitive change (packages, schema, auth, CI, governance docs). Use explicit **"approved"** phrasing per `AGENTS.md`. |
| **Supervisor Review** | Most implementation PRs — scope, PRD alignment, plan compliance, tests. |
| **Security Review** | Auth, Supabase/RLS, env, admin, courses ownership, Trello, Gemini, CI/secrets, or any security-sensitive diff. |

**Source of truth for product scope:** `docs/PRD.md` — not `DESIGN.md`.

**`DESIGN.md`** is **UI/UX guidance only** for **approved frontend UI phases**. It does not authorize new features, APIs, or MVP scope.

## What never to commit

- `.env` or any file with real secrets
- Supabase **service role** keys in the frontend (or anywhere public)
- `node_modules/`, `dist/`, `build/`, or other generated artifacts
- Credentials, API keys, or tokens in source or docs

Use `.env.example` placeholders locally only.

## Database and Supabase migrations

- Do **not** add or apply `supabase/migrations` without **explicit human approval** to create and apply SQL.
- Migration apply is a **human** step (e.g. Supabase SQL Editor), not automated in CI.

## Context docs (check when relevant)

| Doc | Use for |
|-----|---------|
| `docs/PRD.md` | Product scope, APIs, validation rules |
| `AGENTS.md` / `CLAUDE.md` | Agent rules, off-limits files, Definition of Done |
| `docs/AGENT_MEMORY.md` | Completed phases, pitfalls, CI notes |
| `DESIGN.md` | Layout, states, accessibility — **approved UI work only** |
| `docs/adrs/` | Architecture decisions (001–005) |

## GitHub branch protection (manual setup)

Branch Protection or Rulesets are **not** defined in this repo’s files. A maintainer should configure them in **GitHub → Settings → Rules**:

- **Require a pull request** before merging to `main`
- **Require status checks** — require the **CI** workflow (`.github/workflows/ci.yml`) to pass
- **Block force pushes** to protected branches

Until rules are configured, contributors should still follow the PR + green CI practice above.

## CI

GitHub Actions workflow **CI** runs on every `push` and `pull_request`:

- Backend: `npm ci` + `npm run lint` + `npm test`
- Document service: `npm ci` + `npm run lint` + `npm test`
- Frontend: `npm ci` + `npm run lint` + `npm test` + `npm run build`

No secrets, real Supabase credentials, migrations, or deployments run in CI.

## Questions

Open a **Feature request** or discuss with maintainers before large scope changes. Do not expand MVP (Gemini UI, Trello, tasks, admin, etc.) without explicit approval.
