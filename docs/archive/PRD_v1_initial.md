# PRD — StudyOps AI

## 1. Product Overview

### Product Name

StudyOps AI

### One-line Description

StudyOps AI is a web application that helps students turn raw study material into actionable study tasks, flashcards, Trello cards, focus sessions, and progress analytics.

### Product Goal

The goal of StudyOps AI is to help students move from unstructured study material to an organized learning workflow.

Instead of only storing tasks like a regular to-do app, StudyOps AI analyzes study content and creates a practical study plan that the student can actually execute.

### Core Value

Students often have many documents, summaries, slides, assignments, exams, and deadlines, but they struggle to convert this material into a concrete action plan.

StudyOps AI solves this by transforming study material into:

- summaries
- key topics
- study tasks
- flashcards
- Trello cards
- focus sessions
- progress analytics

---

## 2. Target Users

### Primary User — Student

A student who wants to organize study material into actionable work.

The student can:

- create courses
- paste study material
- generate AI-based study tasks and flashcards
- send selected tasks to Trello
- run focus sessions
- track progress

### Secondary User — Admin

An admin user who monitors system usage and operational logs.

The admin can view:

- Gemini API logs
- Trello sync logs
- system errors
- usage statistics
- basic system activity

---

## 3. MVP Scope

### In Scope for MVP

The MVP will include:

1. User authentication
  - register
  - login
  - student/admin role handling
2. Course management
  - create course
  - view user courses
3. Study material input
  - paste study text
  - PDF upload is not required for MVP
4. AI document processing
  - send study text to Document Processing Microservice
  - call Gemini API from the microservice only
  - generate summary, key topics, tasks, flashcards, difficulty, and tags/topics
5. Study tasks
  - display generated tasks
  - allow editing basic task fields if needed
  - mark tasks as completed
6. Flashcards
  - display generated flashcards
  - basic question/answer view
7. Trello integration
  - manual Trello API key/token input for MVP
  - fetch boards/lists if feasible
  - send selected study tasks as Trello cards
  - log sync success/failure
8. Focus sessions
  - Pomodoro-style 25/5 option
  - start focus session from a task
  - finish session
  - optionally mark task completed
  - save focus minutes
9. Student dashboard
  - number of generated tasks
  - number of completed tasks
  - total focus minutes
  - number of tasks synced to Trello
  - progress by course
10. Admin dashboard

- Gemini API logs
- Trello sync logs
- system errors
- API usage statistics
- basic logs view

1. Development workflow artifacts

- PRD
- [AGENTS.md](http://AGENTS.md)
- [CLAUDE.md](http://CLAUDE.md)
- [SKILLS.md](http://SKILLS.md)
- ADRs
- AGENT_[MEMORY.md](http://MEMORY.md)
- explicit workflows
- Testing Agent
- Supervisor Agent
- Security Review Agent
- CI/CD

---

## 4. Out of Scope for MVP

The following are intentionally excluded from the first version:

- full PDF upload and parsing
- full Trello OAuth
- Google Calendar integration
- Google Maps integration
- Stripe or payments
- mobile app
- real-time collaboration
- advanced spaced repetition algorithm
- full AI chat interface
- background polling
- mass Trello synchronization
- deleting Trello cards
- full microservices architecture for every module

These may be listed as future features.

---

## 5. High-Level Architecture

### Architecture Decision

The system will use a Modular Monolith for the main backend plus a separate Document Processing Microservice.

### Architecture Diagram

```text
React Frontend
      ↓
Main Backend / API Gateway
      ↓
Modules:
- Auth
- Courses
- Study Tasks
- Flashcards
- Trello
- Focus Sessions
- Admin
- Logs

      ↓ HTTP

Document Processing Microservice
      ↓
Gemini API

```

### Rationale

The main backend remains a modular monolith to keep the MVP feasible, simple to deploy, and easy to reason about.

The Document Processing Microservice is separated because Gemini processing has different characteristics from normal CRUD logic:

- external AI API dependency
- rate limits
- invalid JSON risk
- slower responses
- schema validation requirements
- different error handling needs

---

## 6. Tech Stack

### Frontend

- React
- Vite

### Backend

- Node.js
- Express

### Document Processing Microservice

- Node.js
- Express
- Gemini API

### Database and Auth

- Supabase Auth
- Supabase PostgreSQL

### Optional Storage

- Supabase Storage, only if PDF upload is later added

### External APIs

- Gemini API
- Trello API

### Testing

- Jest / Vitest
- Supertest for backend integration tests
- Optional Playwright for E2E tests

### CI/CD

- GitHub Actions

### AI Development Tools

- NotebookLM
- ChatGPT / Claude
- Cursor
- GitHub Copilot
- Stitch, optional for design
- Codex CLI, optional

---

## 7. Core User Flows

### 7.1 Student Registration and Login

1. User opens the application.
2. User registers or logs in.
3. System authenticates user through Supabase Auth.
4. User is redirected to student dashboard.

Success criteria:

- user can register
- user can login
- user cannot access protected pages without login
- student cannot access admin pages

Error states:

- invalid credentials
- expired session
- Supabase auth error

---

### 7.2 Create Course

1. Logged-in student clicks Create Course.
2. User enters course name.
3. Backend creates course linked to the current user.
4. Course appears in dashboard.

Success criteria:

- course is saved in database
- course belongs to current user
- other users cannot access it

Error states:

- empty course name
- database error
- unauthorized request

---

### 7.3 Generate Study Plan from Text

1. Student selects a course.
2. Student pastes study material text.
3. Student clicks Generate Study Plan.
4. Backend sends request to Document Processing Microservice.
5. Document Processing Microservice calls Gemini API.
6. Gemini returns structured study output.
7. Microservice validates output schema.
8. Backend saves clean structured output in Supabase.
9. Frontend displays summary, tasks, and flashcards.

Success criteria:

- generated output includes summary, key topics, tasks, flashcards, difficulty, and tags/topics
- output is saved in database
- user can view generated content

Error states:

- empty text
- too short text
- Gemini API failure
- Gemini rate limit / quota error
- invalid Gemini JSON
- schema validation failure
- microservice unavailable

---

### 7.4 View and Manage Study Tasks

1. Student views generated study tasks.
2. Student can see title, description, priority, estimated minutes, difficulty, and tags/topics.
3. Student can mark task as completed.
4. Dashboard updates progress.

Success criteria:

- tasks are linked to course and user
- completed tasks update dashboard
- user cannot see another user's tasks

Error states:

- missing task
- unauthorized access
- database update failure

---

### 7.5 View Flashcards

1. Student opens flashcards section.
2. System displays generated question/answer cards.
3. Student can flip or view answer.

Success criteria:

- flashcards are loaded from database
- flashcards are linked to course and user

Error states:

- no flashcards generated
- unauthorized access
- database error

---

### 7.6 Trello Sync

1. Student opens Trello integration screen.
2. Student manually enters Trello API key/token for MVP.
3. Student selects board/list if implemented.
4. Student selects study tasks to sync.
5. Backend creates Trello cards from selected tasks.
6. Backend saves Trello sync log.
7. UI shows success or failure per task.

Success criteria:

- selected tasks become Trello cards
- Trello token is never exposed to frontend responses
- sync result is logged
- partial success is handled correctly

Error states:

- invalid Trello token
- Trello API unavailable
- Trello rate limit / 429
- partial sync failure
- duplicate sync attempt
- user tries to sync another user's task

---

### 7.7 Focus Session

1. Student chooses a study task.
2. Student clicks Start Focus.
3. System starts a Pomodoro-style session, for example 25 minutes focus and 5 minutes break.
4. Student finishes session.
5. System saves focus session duration.
6. Student can optionally mark task as completed.
7. Dashboard updates focus minutes and progress.

Success criteria:

- focus session is saved
- focus minutes update dashboard
- task completion can be updated

Error states:

- task not found
- unauthorized task access
- session save failure

---

### 7.8 Student Dashboard

Dashboard should show:

- total generated tasks
- completed tasks
- total focus minutes
- tasks synced to Trello
- progress by course

Success criteria:

- dashboard uses only current user's data
- numbers update after task completion, Trello sync, and focus session

---

### 7.9 Admin Dashboard

Admin dashboard should show:

- Gemini API logs
- Trello sync logs
- system errors
- API usage statistics
- basic operational logs

Success criteria:

- only admin can access admin dashboard
- admin routes require role=admin
- secrets are never displayed

Error states:

- regular user tries to access admin route
- logs unavailable
- database error

---

## 8. Gemini Output Schema

The Document Processing Microservice must return structured JSON.

```json
{
  "summary": "string",
  "keyTopics": ["string"],
  "difficulty": "easy | medium | hard",
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "low | medium | high",
      "estimatedMinutes": 30,
      "difficulty": "easy | medium | hard",
      "tags": ["string"]
    }
  ],
  "flashcards": [
    {
      "question": "string",
      "answer": "string",
      "tags": ["string"]
    }
  ]
}

```

Rules:

- Never trust raw Gemini output.
- Always parse and validate schema.
- If validation fails, return controlled error.
- Do not save malformed output.
- Automated tests must mock Gemini.

---

## 9. Data Model Draft

### profiles

- id
- user_id
- email
- role: student | admin
- created_at

### courses

- id
- user_id
- title
- created_at
- updated_at

### study_materials

- id
- course_id
- user_id
- input_text
- summary
- key_topics
- difficulty
- created_at

### study_tasks

- id
- course_id
- material_id
- user_id
- title
- description
- priority
- estimated_minutes
- difficulty
- tags
- status: pending | completed
- trello_card_id nullable
- created_at
- updated_at

### flashcards

- id
- course_id
- material_id
- user_id
- question
- answer
- tags
- created_at

### focus_sessions

- id
- user_id
- course_id
- task_id
- duration_minutes
- completed_task boolean
- started_at
- ended_at

### trello_connections

- id
- user_id
- api_key_reference or encrypted storage reference
- token_reference or encrypted storage reference
- created_at
- updated_at

### trello_sync_logs

- id
- user_id
- task_id
- status: success | failed | partial
- trello_card_id nullable
- error_message nullable
- created_at

### api_logs

- id
- user_id nullable
- service: gemini | trello | supabase | system
- operation
- status
- error_message nullable
- metadata redacted
- created_at

---

## 10. Security Requirements

### General

- Do not commit secrets.
- Do not expose secrets to frontend.
- Use environment variables for secrets.
- `.env` must never be committed.
- `.env.example` may include placeholders only.

### Supabase

- Supabase service role key must never be used in frontend.
- Student users may access only their own data.
- Admin routes must require role=admin.
- Database schema changes require human approval.

### Gemini

- Gemini API key must be server-side only.
- Frontend must never call Gemini directly.
- Gemini output must be schema-validated.
- Gemini failures must be logged with redacted metadata.

### Trello

- Trello token must not be exposed in API responses.
- Trello token must not be logged.
- Trello token must not be committed.
- Trello tests must use mocks.

### Security Anti-Patterns

Forbidden patterns:

- hardcoded API keys
- frontend Gemini calls
- exposing Trello tokens
- Supabase service role key in frontend
- admin route without role check
- missing user ownership checks
- trusting raw Gemini output
- real external API calls in tests
- unsafe logging
- bypassing quality gates

---

## 11. Testing Strategy

### Unit Tests

Required unit tests:

- validate Gemini response schema
- build Trello card payload
- validate study text input
- calculate dashboard progress
- focus session duration handling

### Integration Tests

Required integration tests:

- create course for authenticated user
- block unauthenticated course creation
- generate study plan with mocked Gemini
- save generated tasks and flashcards
- sync selected task to Trello with mocked Trello API
- block student from admin route
- block access to another user's data

### Optional E2E Test

A single E2E workflow may cover:

1. login
2. create course
3. paste study material
4. generate tasks and flashcards
5. sync selected task to Trello mock
6. start focus session
7. view dashboard update

### Testing Rules

- Automated tests must not call real Gemini API.
- Automated tests must not call real Trello API.
- Tests must not require real secrets.
- External APIs must be mocked.

---

## 12. CI/CD Requirements

GitHub Actions should run on:

- push
- pull_request

Required checks:

- install dependencies
- build frontend
- run lint
- run tests
- run dependency audit if configured
- run secret scan if configured

Suggested jobs:

- frontend checks
- backend checks
- document-service checks
- security checks

A feature cannot be considered complete if CI fails.

---

## 13. Agentic Development Requirements

The project must demonstrate Agentic Software Engineering, not just code generation.

Required artifacts:

- [PRD.md](http://PRD.md)
- PRD_[REVIEW.md](http://REVIEW.md)
- [AGENTS.md](http://AGENTS.md)
- [CLAUDE.md](http://CLAUDE.md)
- [SKILLS.md](http://SKILLS.md)
- AGENT_[MEMORY.md](http://MEMORY.md)
- ADRs
- explicit workflows
- Testing Agent definition
- Supervisor Agent definition
- Security Review Agent definition
- CI/CD workflow
- Supervisor review prompt
- Security audit prompt

### Required Agent Workflow

```text
Human goal
→ Orchestrator creates explicit workflow
→ Human approves
→ Implementation Agent writes code
→ Testing Agent writes tests
→ Pre-commit hooks run lint/tests/secrets
→ Supervisor Agent reviews diff
→ Security Review Agent reviews risks
→ Human performs final judgment
→ GitHub Actions validates
→ Documentation and memory update if needed

```

### Definition of Done

A feature is done only if:

- it matches PRD scope
- it respects relevant ADRs
- it does not violate [AGENTS.md](http://AGENTS.md)
- tests were added or updated
- lint passes
- no secrets are exposed
- Supervisor review passed
- Security review passed if relevant
- documentation updated if behavior changed
- CI passes

---

## 14. Human Approval Required

Agents must stop and request human approval before:

- changing architecture
- adding external services
- installing dependencies
- changing database schema
- changing authentication or authorization logic
- modifying CI/CD
- modifying pre-commit hooks
- deleting files
- renaming major folders
- changing environment variable names
- modifying ADRs
- modifying [AGENTS.md](http://AGENTS.md) / [CLAUDE.md](http://CLAUDE.md) / [SKILLS.md](http://SKILLS.md)
- using `git commit --no-verify`
- performing destructive Git operations

Rule:

If a change affects scope, architecture, security, database, dependencies, deployment, or Git history, the agent must stop and ask for human approval.

---

## 15. Demo Plan

The demo should show both the product and the development methodology.

### Product Demo

1. Login as student.
2. Create course.
3. Paste study material.
4. Generate study plan with Gemini.
5. Show summary, tasks, and flashcards.
6. Send selected task to Trello.
7. Start and finish focus session.
8. Show dashboard progress.
9. Login/view as admin.
10. Show Gemini logs, Trello sync logs, errors, and usage statistics.

### Methodology Demo

Show:

- [PRD.md](http://PRD.md)
- [AGENTS.md](http://AGENTS.md)
- [SKILLS.md](http://SKILLS.md)
- ADRs
- explicit workflow file
- Supervisor review prompt
- Security review prompt
- GitHub Actions
- example of AGENT_MEMORY entry

---

## 16. Future Features

Possible future features:

- PDF upload and parsing
- Trello OAuth
- Google Calendar integration
- advanced spaced repetition
- recommendation engine for “what to study today”
- email reminders
- Sentry monitoring
- PostHog analytics
- deployment to cloud
- more advanced admin dashboard
- E2E automation with Playwright

---

## 17. Open Questions

The following decisions can be finalized later:

1. Whether PDF upload enters MVP or remains future feature.
2. Whether backend and document-service are deployed or run locally for demo.
3. Whether Trello credentials are stored encrypted or only used temporarily for demo.
4. Whether Admin dashboard displays full user list or only logs/statistics.
5. Whether Stitch-generated [DESIGN.md](http://DESIGN.md) will be applied before final demo.

---

## 18. Final Positioning

StudyOps AI is both a useful student productivity product and a demonstration of Agentic Software Engineering.

The project demonstrates:

- real web application architecture
- external APIs
- database and authentication
- AI document processing
- Trello integration
- admin dashboard
- testing and CI
- context engineering
- multi-agent workflow
- supervisor review
- security review
- ADRs
- auto-memory
- human judgment

The central idea is not only to build an app with AI, but to show how AI coding agents can be managed through a professional, controlled, and safe software engineering workflow.