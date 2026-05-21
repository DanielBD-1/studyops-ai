---
name: Feature request
about: Propose work that may need PRD scope and human approval
title: "[Feature]: "
labels: enhancement
---

## Problem / goal

<!-- What user or product problem does this solve? -->

## Proposed solution

<!-- High-level approach -->

## PRD / MVP alignment

- [ ] I checked `docs/PRD.md` — this is **in MVP** or needs explicit scope expansion
- [ ] Human **"approved"** gate will be required before implementation (see `AGENTS.md`)

## Affected areas

- [ ] Backend (modular monolith)
- [ ] Frontend (React)
- [ ] Document service (Gemini)
- [ ] Database / migrations
- [ ] CI / workflows
- [ ] Docs only

## Context docs

- `docs/PRD.md` — source of truth for scope and APIs  
- `AGENTS.md` / `CLAUDE.md` — approvals and agent rules  
- `docs/AGENT_MEMORY.md` — completed phases and pitfalls  
- `DESIGN.md` — **only** if this is an **approved UI phase** (layout/states; not scope authority)

## Out of scope reminder

Do not bundle: PDF upload, Trello OAuth, payments, admin self-registration, full styling pass, or unrelated modules without separate approval.

## Acceptance criteria

<!-- Bullet list of done conditions -->

## Additional context

<!-- Links, mockups, related issues -->

Do not include API keys, tokens, credentials, service role keys, or .env contents.
