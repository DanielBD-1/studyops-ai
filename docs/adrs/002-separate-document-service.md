# ADR 002: Separate Document Processing Service

**Status:** Accepted  
**Date:** 2026-05-20  
**Deciders:** Project team (MVP)

---

## Context

Study material processing uses the Gemini API with different operational characteristics than CRUD:

- External dependency and rate limits
- Slow responses (up to 30s timeout)
- Risk of invalid JSON from the model
- Strict Zod schema validation before persistence

Mixing this into every backend module would blur error handling and secret management.

---

## Decision

Implement a **Document Processing Microservice** at `document-service/`:

- Owns Gemini API key (server-side only)
- Exposes internal `POST /process` with body `{ studyText }`
- Returns validated structured output per PRD Section 8
- Main backend calls this service over HTTP; the frontend does not call document-service or external Gemini directly—it uses backend endpoints (e.g. `POST /api/courses/:courseId/generate`)

---

## Consequences

**Positive:**

- Isolates AI failures, timeouts, and validation
- Gemini key only in document-service env
- Easier to mock in backend integration tests

**Negative:**

- Extra process to run locally
- Network failure between backend and document-service must be handled (`microservice unavailable` UX)

---

## Compliance Rules for Agents

- **Never** call the Gemini API directly from `frontend/` or from main backend modules. Frontend calls backend endpoints; backend calls document-service; only document-service calls Gemini.
- Main backend orchestrates: validate input → HTTP to document-service → save validated result.
- `POST /process` is internal—only accessible to the main backend server, never exposed to browser clients or public internet.
- Do not merge document-service into backend without ADR amendment.

---

## References

- PRD Section 5, 8, 8.6 (Document Processing Microservice)
- ADR 003 (Zod validation in document-service)
