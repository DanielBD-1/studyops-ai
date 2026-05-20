# ADR 001: Modular Monolith for Main Backend

**Status:** Accepted  
**Date:** 2026-05-20  
**Deciders:** Project team (MVP)

---

## Context

StudyOps AI needs auth, courses, tasks, flashcards, Trello, focus sessions, dashboard, and admin APIs. The PRD requires a feasible MVP deployable as a single backend process while keeping code organized.

Alternatives considered:

- Full microservices for every domain module (rejected for MVP complexity)
- Single unstructured Express file (rejected for maintainability)

---

## Decision

The **main backend** is a **modular monolith**:

- One Node.js + Express application
- Feature modules under `backend/src/modules/` (auth, courses, tasks, flashcards, trello, focus, dashboard, admin)
- Shared middleware, validation, and config under `backend/src/shared/`
- One deployment unit for MVP

The **document processing** service is separate (see ADR 002).

---

## Consequences

**Positive:**

- Simpler local dev and demo setup
- Shared auth middleware and DB access patterns
- Clear module boundaries without network overhead between domains

**Negative:**

- Scaling AI workloads independently requires the separate document-service (ADR 002)
- All backend modules share process fate (acceptable for MVP)

---

## Compliance Rules for Agents

- Add new domain features as **modules**, not new deployable services.
- Cross-module calls stay in-process (service layer functions), not HTTP loopback.
- Do not split auth/courses/tasks into separate microservices without a new ADR and human approval.

---

## References

- PRD Section 5 (High-Level Architecture)
- PRD Section 13.5 (Backend Structure)
