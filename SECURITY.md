# Security Policy

## Reporting vulnerabilities

If you discover a security issue, **do not** open a public issue with exploit details or paste secrets.

1. Contact the repository maintainers privately.
2. Use the **Security review request** issue template (`.github/ISSUE_TEMPLATE/security_review.md`) only for **process** questions—not for sharing credentials or full exploit payloads in public.

## Never share secrets

Do **not** include in issues, pull requests, chat logs, screenshots, or CI output:

- API keys or tokens (Supabase, Gemini, Trello, etc.)
- `.env` files or file contents
- Supabase **service role** keys
- Passwords or session tokens
- Full study text or PII unless explicitly required and approved

Use redacted error messages and placeholders in bug reports.

## Supabase keys

| Key | Where it belongs |
|-----|------------------|
| **Anon key** | Frontend only (`VITE_SUPABASE_ANON_KEY`) — public in the client bundle by design |
| **Service role key** | **Backend only** (`SUPABASE_SERVICE_ROLE_KEY`) — bypasses RLS; never in frontend, never in `VITE_*` |

The frontend must call the **Express API** with a Bearer JWT for data operations—not direct service-role access to user tables.

## Service-role queries (backend)

When the backend uses `getSupabaseAdmin()`:

- Every query on user-owned data must filter by **`user_id = req.user.id`** (or equivalent ownership rule).
- Do not add unfiltered `select` / `update` / `delete` on `courses`, profiles, or future user tables.
- Wrong-owner access should return **404**, not 403, where documented for courses.

## Security Review required

Request **Security Review** (see `AGENTS.md` and PR template) before merge when changes touch:

- **Authentication** — JWT, session, `requireAuth`, login/register flows
- **Supabase** — RLS, policies, grants, triggers, schema
- **Migrations** — `supabase/migrations/*.sql` (human approval to apply separately)
- **Service-role data access** — any new `from('…')` using admin client
- **CI / GitHub Actions** — secrets, permissions, `pull_request_target`, deploy steps
- **Admin routes** or role checks
- **Trello / Gemini** — credentials, logging, external API boundaries
- **Frontend security** — token storage, XSS (`dangerouslySetInnerHTML`), exposing ownership fields

Supervisor Review and human approval gates still apply per `CONTRIBUTING.md`.

## Safe development practices

- Copy from `.env.example` locally; **never commit** `.env`.
- Do not run `npm audit fix --force` without maintainer approval.
- Automated tests must **mock** Supabase, Gemini, and Trello—no live secrets in CI (see `.github/workflows/ci.yml`).
- Do not apply Supabase migrations without explicit human approval.

## Related docs

- `CONTRIBUTING.md` — branch workflow and reviews
- `AGENTS.md` — security anti-patterns
- `docs/PRD.md` — permissions and API contract
