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

## Environment and service boundaries

| Secret / config | Allowed location |
|-----------------|------------------|
| `GEMINI_API_KEY` | **document-service only** — never frontend, never backend `VITE_*` |
| `DOCUMENT_SERVICE_URL` | **backend only** — frontend must not call document-service |
| `SUPABASE_SERVICE_ROLE_KEY` | **backend only** |
| `VITE_SUPABASE_ANON_KEY` | **frontend only** (public anon key by design) |

- **`POST /process`** on document-service is **internal-only** (backend orchestration). Browsers must not call it directly.
- **Trello (manual MVP — live):** `POST /api/trello/boards`, `/boards/:boardId/lists`, `/sync` accept ephemeral `{ apiKey, token }` in the **body** only. Credentials are **not** stored in the database, browser storage, or logs. Frontend must not call `api.trello.com` directly.
- **Trello OAuth account connection (A2 + A3 + A4-STATE + A4-FRONTEND):** `public.trello_connections` stores **encrypted** user tokens after connect. **A4-STATE** HMAC-signed state on authorize-url / connect/complete blocks account-linking CSRF. **A4-FRONTEND** callback reads token from hash and state from query only; clears URL before complete POST; does not persist OAuth secrets client-side. Table is **`service_role` only** — frontend must not access it via Supabase client. **Manual sync** (`boards`/`lists`/`sync`) still uses ephemeral apiKey/token until **A5**. See [docs/security/trello-oauth-foundation.md](docs/security/trello-oauth-foundation.md) and ADR 006.
- **Generate (implemented):** `POST /api/study-materials/:materialId/generate` with strict empty body `{}`. Backend loads saved material `content` only after ownership checks. Frontend must not send `studyText`, `content`, `courseId`, `userId`, or `plan` in the generate body.
- **Saved plan (implemented):** `GET` / `DELETE` `/api/study-materials/:materialId/generated-plan` — frontend loads/clears **active** plan via backend only; **no** direct Supabase client writes to `material_generated_plans`.
- **Plan history (implemented — Phases 11A-1/2/3):** Multiple rows per material in `public.material_generated_plans` with exactly one **`is_active`**; history REST APIs — `GET …/generated-plans` (metadata only), `GET …/generated-plans/:planId`, `POST …/generated-plans/:planId/activate` (body `{}` — **no** Gemini), `DELETE …/generated-plans/:planId` (inactive only). Frontend history UI loads metadata list only; full plan fetched on **Preview** for inactive versions; **Restore** uses activate endpoint only.

## AI output — generated study plans (persisted)

- **Multiple validated plan rows per study material** in `public.material_generated_plans` — exactly **one active** per material; up to **10** total rows retained (Phase **11A-1**); **no** cross-material saved-plan library, **no** raw Gemini response storage, **no** persistence of failed generate attempts.
- **Backend-only persistence:** service role writes after **Zod** validation of document-service output; ownership via material → course → user before any plan table access (service role bypasses RLS — app must filter). Generate and history **activate** are separate paths — restore/reactivate **must not** call Gemini.
- **Frontend:** Load/clear active plan and history through backend REST only; display in React state for rendering — **not** `localStorage` / `sessionStorage` for plans or history; **never** POST client `plan` JSON to save; **no** bulk full-plan fetch on history list load.
- Treat model output as **untrusted** in the UI — plain **React text** only; **no** `dangerouslySetInnerHTML`.
- Tasks and flashcards **inside** the plan JSON are **read-only display** — not task/flashcard **management** or Trello sync.
- Missing saved plan → empty UI (backend `404` “Generated plan not found”). Wrong-owner or missing material → neutral `404` “Study material not found”.

## Trello credentials and tokens

**Manual sync (live today):**

- User-supplied Trello **API key** and **token** are secrets — validate format only; **never** persist, log, or return them in responses.
- Frontend clears credential state after sync; **never** use `localStorage` or `sessionStorage` for Trello credentials.

**OAuth account connection (A2 + A3 + A4-STATE + A4-FRONTEND — storage + backend + frontend callback; manual sync still live):**

- Trello **user tokens** are tier-1 secrets. Encrypt at rest with **`TRELLO_TOKEN_ENCRYPTION_KEY`** (32-byte value, base64 in env — placeholders in `backend/.env.example` only).
- **`TRELLO_OAUTH_STATE_SECRET`** (optional, 32-byte base64) — dedicated HMAC key for OAuth state signing; **production should prefer a dedicated secret**; when unset, backend derives a separate key from **`TRELLO_TOKEN_ENCRYPTION_KEY`** with domain separation.
- OAuth state is **stateless and not single-use**; replay within the **10-minute TTL** is an accepted MVP residual risk if `{ token, state }` plus session are captured — future hardening: single-use nonce persistence (see `docs/security/trello-oauth-foundation.md`).
- **`TRELLO_TOKEN_ENCRYPTION_KEY`**, **`TRELLO_OAUTH_STATE_SECRET`**, and **`SUPABASE_SERVICE_ROLE_KEY`** are tier-1 secrets — backend only, never in frontend or `VITE_*`.
- **`TRELLO_API_KEY`** is backend-only (Trello app key; optional until connect flow is enabled).
- **`trello_connections`:** backend / **`service_role`** only. Frontend must **not** query this table. Future status APIs must expose metadata only (no token, IV, tag, or ciphertext).
- Decrypted tokens must **never** be logged or sent to the client.

**Security Review required** before merge for OAuth callback frontend, connect/complete/disconnect route changes, **A4-STATE**-class state signing changes, or any change that reads stored tokens in boards/lists/sync handlers.

---

## Logging

- Do not log full study material `content`, generated `plan`, Gemini prompts, API keys, Trello tokens (manual or decrypted), or `Authorization` headers.
- Backend/document-service structured logs should remain redacted per phase conventions (see `docs/AGENT_MEMORY.md`).

## Service-role queries (backend)

When the backend uses `getSupabaseAdmin()`:

- Every query on user-owned data must filter by **`user_id = req.user.id`** (or equivalent ownership rule).
- Do not add unfiltered `select` / `update` / `delete` on `courses`, profiles, or future user tables.
- Wrong-owner access should return **404**, not 403, where documented for courses.

## Admin routes and aggregate stats

- **`/api/admin/*`** routes require **`requireAuth`** then **`requireAdmin`** (middleware order: auth → admin gate → handler).
- **`requireAdmin`** verifies **`profiles.role === 'admin'`** from the database for **`req.user.id`** — **not** frontend role state, JWT role claims, or client-supplied role fields.
- Frontend **`AdminRoute`** is a **UX guard only**; backend admin middleware remains the real authorization boundary.
- **`GET /api/admin/stats`** intentionally performs **platform-wide aggregate** reads via **`getSupabaseAdmin()`** (service role). This is an **approved exception** to the normal per-user filtering rule because:
  - the backend admin gate runs first (**`requireAuth` + `requireAdmin`**);
  - the response is **aggregate-only** (numeric counts + static **`systemHealth.backend`**);
  - **no** PII, study content, raw rows, Trello card IDs, emails, or user lists are returned.
- **`SUPABASE_SERVICE_ROLE_KEY`** remains **backend-only** — never in frontend or **`VITE_*`** env.

**Still deferred:** **`GET /api/admin/logs`**, **`api_logs`** table, Gemini/system error metrics, user list, role mutation endpoints.

## Security Review required

Request **Security Review** (see `AGENTS.md` and PR template) before merge when changes touch:

- **Authentication** — JWT, session, `requireAuth`, login/register flows
- **Supabase** — RLS, policies, grants, triggers, schema
- **Migrations** — `supabase/migrations/*.sql` (human approval to apply separately)
- **Service-role data access** — any new `from('…')` using admin client
- **CI / GitHub Actions** — secrets, permissions, `pull_request_target`, deploy steps
- **Admin routes** or role checks
- **Trello / Gemini** — credentials, logging, external API boundaries, `POST /process`, generate orchestration; **`trello_connections`**; OAuth callback/connect; **`TRELLO_TOKEN_ENCRYPTION_KEY`**, **`TRELLO_OAUTH_STATE_SECRET`**
- **AI generated-plan persistence or read/render paths** — any change to how plans are written, loaded, cleared, or displayed (Phases 2L-a/b/c established the baseline)
- **Governance / security docs** — when changing CI permissions, env documentation, or trust boundaries
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
- `docs/IMPLEMENTATION_STATUS.md` — built APIs, env boundaries, deferred work
- `docs/security/trello-oauth-foundation.md` — Trello A2/A3/A4-STATE/A4-FRONTEND storage, connect, and callback boundaries
- `docs/adrs/006-trello-oauth-encrypted-connections.md` — encrypted connection decision
- `docs/PRD.md` — permissions and API contract (MVP + future)
