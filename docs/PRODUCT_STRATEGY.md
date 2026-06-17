# Product Strategy — StudyOps AI

**Purpose:** Human-approved product sequencing and strategic direction for owners and agents.

---

## Purpose and authority

This document records **human-approved product sequencing and strategic direction** for StudyOps AI.

It is **guidance for planning future phases**. It helps agents and owners understand **in what order** product directions should be considered — not **what is built today** and not **what is approved to implement**.

**This document does not approve implementation.** No epic, migration, API, deployment, package, or phase is authorized by this file alone.

**This document does not replace:**

- **`docs/IMPLEMENTATION_STATUS.md`** — authoritative **shipped** behavior (routes, APIs, database, deferred list)
- **`docs/CURRENT_STATE.md`** — current phase position, gates, and suspended work
- **`docs/PRD.md`** — product contract, vision, and future scope
- **`docs/adrs/*`** — architecture decisions
- **`AGENTS.md`** — approval workflow, agent roles, and Definition of Done

When this document and shipped-state docs disagree on **what exists in the repository**, **`IMPLEMENTATION_STATUS`** and application code win.

---

## What this document is not

This file is **not**:

- A PRD or product requirements specification
- A shipped-feature inventory or route/API catalog
- A roadmap, backlog, or ranked epic list
- An implementation specification (schemas, endpoints, UI designs)
- Automatic approval for any epic, migration, API, deployment, or npm package

---

## Governing strategy: personal study engine first

The human-approved sequencing decision is:

**Strengthen and connect the personal study engine before opening a collaboration layer.**

Students should have a coherent personal workflow — materials, generated plans, tasks, flashcards, focus, dashboard, and integrations such as Trello — before social or shared features are introduced.

**Collaboration remains deferred** until explicitly opened through a separate planning gate. Mentioning collaboration here describes **direction only**, not approval to build Study Rooms or related features.

---

## Architectural principle: collaboration extends existing entities

If collaboration is ever approved in a future phase, it should **reference or extend** existing user-owned concepts — not replace them with a parallel application.

At a high level, future shared or social features should build on concepts already in the product, such as:

- Study materials
- Generated plans (material-scoped)
- Study tasks
- Flashcards
- Focus and progress data
- Existing user-owned integrations (for example Trello sync on personal tasks)

Future collaboration must **not** create a disconnected second application or a parallel task/material universe that duplicates personal ownership models.

This section states a **principle only**. It does not specify schemas, endpoints, permissions, room designs, invite flows, or realtime architecture.

---

## Evidence on main

This strategy has **already guided completed work** on the main branch. The following are **shipped examples** of personal-engine depth — **not** proposed next work:

- **`TASK-MATERIAL-*`** — strengthened connectivity between study materials and study tasks (navigation links, filters, material-detail task band, deep links, URL-persisted filters on `/tasks`, and related phases).
- **`FLASHCARD-REVIEW-*`** (through **A5c** and stabilization) — added review depth and **SRS-lite** scheduling on saved database flashcards, plus dashboard due-flashcard awareness.

For exact phase IDs, routes, APIs, and behavior, see **`docs/IMPLEMENTATION_STATUS.md`**.

**SRS-lite is shipped** (review endpoint, scheduling columns, Due now filtering, and related UI on saved DB flashcards).

**Full SM-2 / Anki behavior**, ease factors, review-history tables, and backend query parameters such as `?due=now` / `?mastery=` remain **deferred** unless a future phase explicitly approves them.

---

## Strategic non-goals

Until separately approved through explicit human phase gates, this strategy does **not** approve:

- Study Rooms or shared study spaces
- Invitations or member management
- Shared parallel task or material systems
- Realtime chat or presence
- Gmail, Google Meet, Google Drive, or similar integrations
- PDF upload or parsing
- Dashboard charts or advanced analytics visualizations
- Production deployment or hosted operations strategy
- Admin logs, user management, or role-management UI
- Full spaced repetition (SM-2 / Anki-class algorithms and infrastructure)
- Any other “obvious next epic” inferred from deferred lists or competitor products

Deferred items may appear in **`docs/PRD.md`**, **`docs/POST_MVP.md`**, or **`docs/IMPLEMENTATION_STATUS.md`**. Listing them here does **not** schedule or approve them.

---

## Approval and phase gates

All future work still requires **explicit human approval** per **`AGENTS.md`** and **`docs/POST_MVP.md`**.

Distinguish these layers:

| Layer | Meaning |
|-------|---------|
| **Strategy direction** | This document — sequencing and principles only |
| **Planning approval** | Human authorizes planning-only work for a named phase |
| **Implementation approval** | Human authorizes code, migrations, or other application changes for a named phase |
| **Shipped state** | What is merged and documented in **`IMPLEMENTATION_STATUS`** |

Strategy direction does **not** substitute for planning or implementation approval. Planning approval does **not** substitute for implementation approval.

Existing approval phrases in **`AGENTS.md`** (for example, planning-only vs implement phrases) remain the operational workflow. This document does not redefine that workflow.

---

## Where to look next

| Question | Authoritative doc |
|----------|-------------------|
| What is shipped today? | **`docs/IMPLEMENTATION_STATUS.md`** (+ code + `supabase/migrations/`) |
| How are future directions sequenced? | **`docs/PRODUCT_STRATEGY.md`** (this file) |
| Where is the project in phases and gates? | **`docs/CURRENT_STATE.md`** |
| Product contract and future scope | **`docs/PRD.md`** |
| Post-MVP framing and approval discipline | **`docs/POST_MVP.md`** |
| Phase history and pitfalls | **`docs/AGENT_MEMORY.md`** |
| Architecture boundaries | **`docs/adrs/`** |

**Suggested read order for a fresh agent proposing new work:**

1. **`docs/IMPLEMENTATION_STATUS.md`**
2. **`docs/PRODUCT_STRATEGY.md`**
3. **`docs/CURRENT_STATE.md`**
4. Other documents only as required by the task

---

## Document history

| Event | Notes |
|-------|-------|
| **CORE-DEPTH-BEFORE-COLLAB-PLAN** | Planning-only conversation; human-approved sequencing decision recorded outside the repository |
| **CORE-DEPTH-BEFORE-COLLAB-DOCS-A1** | Codified in **`docs/PRODUCT_STRATEGY.md`**; discoverability cross-reference in **`docs/CURRENT_STATE.md`** |
