# ADR 003: Zod for Runtime Validation

**Status:** Accepted  
**Date:** 2026-05-20  
**Deciders:** Project team (MVP)

---

## Context

The system accepts user input, environment configuration, and non-deterministic JSON from Gemini. Runtime validation prevents bad data from reaching the database or the UI.

---

## Decision

Use **Zod** for runtime schema validation in:

| Layer | Validates |
|-------|-----------|
| `document-service` | Gemini JSON output (`GeminiOutputSchema` per PRD Section 8) |
| `backend` | API request bodies, shared env config (`env.js`) |
| `frontend` | Form inputs (mirror PRD limits in `utils/validation.js`) |

**Gemini pipeline (mandatory):**

1. `JSON.parse()` raw model response
2. `GeminiOutputSchema.parse(data)`
3. On `ZodError`: log redacted details, throw `GEMINI_INVALID_RESPONSE`, **do not save**
4. No retry on validation failure

---

## Consequences

**Positive:**

- Single schema source of truth for AI output shape
- Consistent `VALIDATION_ERROR` responses for bad input

**Negative:**

- Strict schema may reject usable-but-slightly-off AI responses (acceptable—user retries)

---

## Compliance Rules for Agents

- Never persist Gemini output without successful Zod parse.
- Never trust `JSON.parse` alone.
- Share schema definitions between document-service and tests; avoid duplicate conflicting schemas.
- Env boot must fail fast if required env vars invalid (Zod in `config/env.js`).

---

## References

- PRD Section 6.5, 8, 10 (Security)
- PRD testing: Zod pass/fail cases required
