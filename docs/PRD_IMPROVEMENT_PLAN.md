# PRD Improvement Plan: StudyOps AI

**Document Version:** 1.0  
**Date:** 2026  
**Purpose:** Actionable plan to resolve ambiguities and gaps in the PRD before implementation

---

## Executive Summary

The original PRD is comprehensive but contains critical ambiguities that would cause implementation confusion, especially for AI coding agents. This improvement plan:

1. **Classifies** all recommendations into Must Update / Post-MVP / Ignore
2. **Provides** exact replacement text for critical sections
3. **Maintains** small MVP scope without feature creep
4. **Eliminates** ambiguity in technical decisions

**Key Decisions Made:**

- Zod for schema validation
- React Context + useState for state management
- Manual refetch (no real-time updates)
- Trello tokens NOT persisted (re-enter each time)
- Standard API response envelope
- Clear file structure and implementation order

---

## Classification of All Recommendations

### ✅ MUST UPDATE PRD BEFORE CODING (18 items)

These are critical blockers that would cause incorrect implementation:

1. **File structure** - Agent needs explicit folder hierarchy
2. **API response format** - Inconsistent responses will break frontend
3. **API endpoints** - Agent needs complete endpoint specifications
4. **Permissions matrix** - Authorization bugs without this
5. **Error states** - Core user flows need defined error handling
6. **Test cases** - Required tests must be explicit
7. **UI screens** - Frontend implementation needs clear specs
8. **Implementation order** - Avoid building in wrong sequence
9. **Trello token handling** - Security risk if unclear
10. **Dashboard update mechanism** - Real-time vs polling vs manual
11. **Frontend state management** - Redux vs Context vs local state
12. **Schema validation library** - Must specify Zod
13. **Editable task fields** - Which fields can students edit?
14. **Text input limits** - Min/max character counts
15. **Loading/empty states** - UX is broken without these
16. **Session timeout** - Auth behavior needs definition
17. **Password requirements** - Security requirement
18. **Focus timer implementation** - Client vs server-side

### 🔮 POST-MVP / FUTURE FEATURES (20 items)

These are valuable but not critical for initial demo:

1. User profile editing (change email, password)
2. Course deletion
3. Task/flashcard deletion
4. Data export/retention policies
5. Pagination for large lists (>50 items)
6. Search & filtering by tags/difficulty
7. Bulk operations (mark multiple complete, bulk sync)
8. Performance SLAs (response time <500ms)
9. API versioning strategy
10. Logging retention policies
11. Real-time monitoring/alerting
12. Automated database backups
13. Full WCAG accessibility compliance
14. Internationalization (i18n)
15. Multi-timezone support
16. Advanced error recovery (retry logic)
17. Load/stress testing
18. Database migration/rollback testing
19. Advanced security hardening
20. Browser compatibility matrix

### ❌ IGNORE FOR STUDENT MVP (15 items)

These are production concerns, out of scope for academic demo:

1. GDPR compliance and data retention
2. APM tools (Sentry, PostHog, DataDog)
3. Full Trello OAuth flow
4. Advanced search with filters/sorting
5. Production deployment strategy
6. Docker containerization
7. Advanced concurrency patterns
8. Database connection pooling tuning
9. CDN/caching strategies
10. Professional security audit
11. Penetration testing
12. Multi-browser automated testing
13. Performance benchmarking at scale
14. Rate limiting per user
15. Advanced analytics

---

## Exact PRD Additions and Replacements

### 🆕 NEW SECTION: 6.5 Tech Stack Details

**Location:** Insert after Section 6 (Tech Stack)

```markdown
## 6.5 Tech Stack Details

### Schema Validation
- **Zod** for runtime schema validation
- Use Zod to validate:
  - Gemini API responses
  - API request bodies
  - Environment variables
  - Form inputs

### Frontend State Management
- **React useState/useEffect** for local component state
- **React Context** for shared state (auth, user profile)
- **No Redux** for MVP
- Manual refetch after mutations (create course, complete task, etc.)

### Frontend Routing
- **React Router v6**
- Protected routes using custom `<ProtectedRoute>` wrapper
- Route structure:
  - `/` - landing/login
  - `/register` - registration
  - `/dashboard` - student dashboard
  - `/courses` - course list
  - `/courses/:id` - single course view
  - `/courses/:id/generate` - study material input
  - `/tasks` - all tasks view
  - `/flashcards` - flashcards view
  - `/trello` - Trello integration
  - `/focus/:taskId` - focus session
  - `/admin` - admin dashboard (role-protected)

### API Structure
- **Express REST API**
- **JSON** request/response bodies
- **JWT** authentication (from Supabase)
- Middleware order: CORS → JSON parser → auth → routes → error handler
```

---

### 🆕 NEW SECTION: 7.10 Input Validation Rules

**Location:** Insert after Section 7.9 (Admin Dashboard)

```markdown
## 7.10 Input Validation Rules

### Study Material Text
- **Minimum:** 100 characters
- **Maximum:** 50,000 characters (~10,000 words)
- **Validation:** Non-empty, trim whitespace
- **Error message:** "Study material must be between 100 and 50,000 characters"

### Course Title
- **Minimum:** 3 characters
- **Maximum:** 100 characters
- **Validation:** Non-empty, trim whitespace, no leading/trailing spaces
- **Error message:** "Course title must be between 3 and 100 characters"

### Password (Registration)
- **Minimum:** 8 characters
- **Requirements:** At least one letter and one number
- **Error message:** "Password must be at least 8 characters with letters and numbers"

### Task Editable Fields
Students can edit:
- ✅ Title (3-200 chars)
- ✅ Description (0-1000 chars, optional)
- ✅ Priority (low, medium, high)
- ✅ Estimated minutes (5-480, must be positive integer)

Students cannot edit:
- ❌ Difficulty (AI-generated, read-only)
- ❌ Tags (AI-generated, read-only)
- ❌ Created date
- ❌ Course association
- ❌ User ownership

### Session Timeout
- **Duration:** 24 hours
- **Behavior:** Supabase auto-refresh token when active
- **On expiry:** Redirect to login with message "Session expired, please log in again"
```

---

### 🆕 NEW SECTION: 8.5 API Response Format

**Location:** Insert after Section 8 (Gemini Output Schema)

```markdown
## 8.5 API Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": {
    // actual response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // optional, only in development
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Standard Error Codes

- `AUTH_REQUIRED` - 401
- `FORBIDDEN` - 403
- `NOT_FOUND` - 404
- `VALIDATION_ERROR` - 400
- `GEMINI_API_ERROR` - 500
- `GEMINI_TIMEOUT` - 504
- `GEMINI_RATE_LIMIT` - 429
- `TRELLO_AUTH_ERROR` - 401
- `TRELLO_API_ERROR` - 500
- `DATABASE_ERROR` - 500
- `SERVER_ERROR` - 500

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Validation error
- `401` - Authentication required
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `429` - Rate limit exceeded
- `500` - Server error
- `504` - Gateway timeout (Gemini timeout)

```

---

### 🆕 NEW SECTION: 8.6 API Endpoints

**Location:** Insert after Section 8.5

```markdown
## 8.6 API Endpoints

### Authentication
**POST /api/auth/register** - Register new user
- Body: `{ email, password, role? }` (role defaults to 'student')
- Returns: `{ user, session }`

**POST /api/auth/login** - Login
- Body: `{ email, password }`
- Returns: `{ user, session }`

**POST /api/auth/logout** - Logout
- Returns: `{ success: true }`

**GET /api/auth/me** - Get current user
- Returns: `{ user }`

### Courses
**GET /api/courses** - List user's courses
- Returns: `{ courses: [...] }`

**POST /api/courses** - Create course
- Body: `{ title }`
- Returns: `{ course }`

**GET /api/courses/:id** - Get single course
- Returns: `{ course, stats: { totalTasks, completedTasks, totalFlashcards } }`

### Study Materials & Generation
**POST /api/courses/:courseId/generate** - Generate study plan
- Body: `{ studyText }`
- Returns: `{ material, tasks: [...], flashcards: [...] }`
- Flow:
  1. Validate studyText (100-50000 chars)
  2. Call Document Processing Microservice
  3. Microservice calls Gemini
  4. Validate response with Zod
  5. Save material, tasks, flashcards
  6. Return all data

### Tasks
**GET /api/tasks** - List all user tasks (across all courses)
- Query params: `?courseId=...&status=pending|completed`
- Returns: `{ tasks: [...] }`

**GET /api/tasks/:id** - Get single task
- Returns: `{ task }`

**PATCH /api/tasks/:id** - Update task
- Body: `{ title?, description?, priority?, estimatedMinutes?, status? }`
- Returns: `{ task }`

**POST /api/tasks/:id/complete** - Mark task complete
- Returns: `{ task }`

### Flashcards
**GET /api/flashcards** - List flashcards
- Query params: `?courseId=...`
- Returns: `{ flashcards: [...] }`

### Trello Integration
**POST /api/trello/sync** - Sync tasks to Trello
- Body: `{ apiKey, token, boardId?, listId?, taskIds: [...] }`
- Returns: `{ results: [{ taskId, success, trelloCardId?, error? }] }`
- Note: apiKey and token are NOT persisted for MVP

**GET /api/trello/boards** - Fetch Trello boards (optional for MVP)
- Query params: `?apiKey=...&token=...`
- Returns: `{ boards: [...] }`

### Focus Sessions
**POST /api/focus** - Start focus session
- Body: `{ taskId, durationMinutes }` (durationMinutes defaults to 25)
- Returns: `{ session }`

**POST /api/focus/:sessionId/complete** - End focus session
- Body: `{ completedTask: boolean }` (whether to mark task as complete)
- Returns: `{ session, task? }`

### Dashboard
**GET /api/dashboard/stats** - Get student stats
- Returns:
```json
{
  "totalTasks": 42,
  "completedTasks": 15,
  "totalFocusMinutes": 350,
  "trelloSyncedTasks": 8,
  "courseStats": [
    { "courseId": "...", "courseName": "...", "completedTasks": 5, "totalTasks": 10 }
  ]
}
```

### Admin (role='admin' required)

**GET /api/admin/logs** - Get system logs

- Query params: `?service=gemini|trello|system&limit=100`
- Returns: `{ logs: [...] }`

**GET /api/admin/stats** - Get admin statistics

- Returns:

```json
{
  "totalUsers": 50,
  "totalCourses": 120,
  "totalTasks": 1500,
  "geminiCallsToday": 45,
  "trelloSyncsToday": 12,
  "errorsToday": 3
}
```

### Document Processing Microservice

**POST /process** - Process study material

- Body: `{ studyText }`
- Returns: Gemini output schema (see Section 8)
- Internal endpoint, not exposed to frontend

```

---

### 🆕 NEW SECTION: 9.5 Permissions Matrix

**Location:** Insert after Section 9 (Data Model Draft)

```markdown
## 9.5 Permissions Matrix

| Resource | Student (Own) | Student (Other) | Admin | Anonymous |
|----------|---------------|-----------------|-------|-----------|
| Register/Login | ✅ | - | ✅ | ✅ |
| View own profile | ✅ | ❌ | ✅ | ❌ |
| Create course | ✅ | ❌ | ✅ | ❌ |
| View own course | ✅ | ❌ | ✅ (all) | ❌ |
| View own tasks | ✅ | ❌ | ✅ (all) | ❌ |
| Edit own task | ✅ | ❌ | ✅ (all) | ❌ |
| Complete own task | ✅ | ❌ | ✅ (all) | ❌ |
| View own flashcards | ✅ | ❌ | ✅ (all) | ❌ |
| Generate study plan | ✅ | ❌ | ✅ | ❌ |
| Sync to Trello | ✅ (own tasks) | ❌ | ✅ | ❌ |
| Start focus session | ✅ (own tasks) | ❌ | ✅ | ❌ |
| View own dashboard | ✅ | ❌ | ✅ | ❌ |
| View admin logs | ❌ | ❌ | ✅ | ❌ |
| View admin stats | ❌ | ❌ | ✅ | ❌ |

### Enforcement Rules
1. All API routes check `req.user.id` from JWT
2. Admin routes check `req.user.role === 'admin'`
3. Resource access checks: `WHERE user_id = req.user.id`
4. No cross-user data leakage
5. 401 if not authenticated
6. 403 if authenticated but insufficient permissions
```

---

### 🆕 NEW SECTION: 10.5 Trello Token Handling (MVP)

**Location:** Insert after Section 10 (Security Requirements)

```markdown
## 10.5 Trello Token Handling (MVP)

### MVP Approach: No Persistence
For MVP, Trello credentials are **NOT stored in database**.

**Flow:**
1. User enters Trello API key and token in frontend form
2. Frontend sends credentials + taskIds in sync request
3. Backend uses credentials immediately to call Trello API
4. Backend logs sync success/failure (without credentials)
5. Credentials are discarded after request completes

**Why:**
- Simpler implementation
- No encryption key management needed
- No risk of credential leakage from database
- Forces user to have credentials ready (acceptable for demo)

**User Experience:**
- User must enter Trello credentials each time they sync
- Frontend can temporarily store in component state during session
- Clear warning: "Credentials are not saved, you'll need them again next time"

### Post-MVP: Encrypted Storage
If credentials must be persisted later:
1. Use AES-256-GCM encryption
2. Store encryption key in environment variable (not in database)
3. Encrypt before saving to `trello_connections` table
4. Decrypt only when making Trello API calls
5. Never return decrypted credentials in API responses

### Security Rules
- ✅ Credentials only in request body, never in URL params
- ✅ Log Trello sync results, not credentials
- ✅ Mask credentials in error messages
- ✅ Use HTTPS for all Trello API calls
- ✅ Frontend validates credentials format before sending
- ❌ Never log `apiKey` or `token`
- ❌ Never include credentials in frontend state beyond sync flow
- ❌ Never return credentials in GET requests
```

---

### 📝 REPLACE SECTION: 7.6 Trello Sync

**Replace existing Section 7.6 with:**

```markdown
## 7.6 Trello Sync

- Student opens Trello integration screen
- Student enters Trello API key and token (not saved for MVP)
- Student selects study tasks to sync (checkboxes)
- Student clicks "Sync to Trello"
- Frontend sends: `{ apiKey, token, taskIds: [...] }`
- Backend validates credentials format
- Backend calls Trello API for each selected task
- Backend creates Trello card with:
  - `name` = task.title
  - `desc` = task.description + tags
  - Default list (or user-selected list if implemented)
- Backend saves sync log for each task
- Backend returns results: `{ results: [{ taskId, success, trelloCardId?, error? }] }`
- Frontend displays success count and any errors
- Frontend clears credentials from state after sync

Success criteria:
- Selected tasks become Trello cards
- Sync result is logged (without credentials)
- Partial success handled: if task 1 succeeds but task 2 fails, both are logged separately
- User sees clear feedback on which tasks succeeded/failed

Error states:
- Invalid Trello token format (validate before sending)
- Trello API authentication error (401)
- Trello API unavailable (500, 503)
- Trello rate limit (429) - show "Please wait and try again"
- Partial sync failure - some tasks succeed, some fail
- Network timeout - show "Connection timeout, please retry"
- User tries to sync another user's task (should never happen, frontend filters by ownership)
```

---

### 🆕 NEW SECTION: 11.5 Error States Specification

**Location:** Insert after Section 11 (Testing Strategy)

```markdown
## 11.5 Error States Specification

### Authentication Errors
| Error | UI Behavior |
|-------|-------------|
| Invalid credentials | Show "Invalid email or password" below form |
| Session expired | Redirect to login with toast "Session expired, please log in" |
| Network error during login | Show "Connection error, please try again" |

### Course Creation Errors
| Error | UI Behavior |
|-------|-------------|
| Empty course title | Disable submit button, show "Title required" |
| Title too short (<3 chars) | Show "Title must be at least 3 characters" |
| Database error | Show "Failed to create course, please try again" |

### Study Plan Generation Errors
| Error | UI Behavior |
|-------|-------------|
| Empty study text | Disable submit, show "Please paste study material" |
| Text too short (<100 chars) | Show "Text must be at least 100 characters" |
| Text too long (>50000 chars) | Show "Text too long (max 50,000 characters)" |
| Gemini API error | Show "AI processing failed, please try again" |
| Gemini timeout (>30s) | Show "Request timed out, please try shorter text" |
| Gemini rate limit | Show "Service temporarily unavailable, please wait 1 minute" |
| Invalid Gemini response | Show "Invalid response from AI, please try again" |
| Microservice unavailable | Show "Processing service unavailable, please try later" |

### Task Edit Errors
| Error | UI Behavior |
|-------|-------------|
| Title empty | Show "Title required" |
| Estimated minutes < 5 | Show "Minimum 5 minutes" |
| Estimated minutes > 480 | Show "Maximum 8 hours (480 minutes)" |
| Unauthorized (not your task) | Show "Access denied" (should not happen in normal flow) |

### Trello Sync Errors
| Error | UI Behavior |
|-------|-------------|
| Missing API key or token | Disable sync button until both filled |
| Invalid token format | Show "Invalid token format" |
| Trello auth error (401) | Show "Invalid Trello credentials, please check and retry" |
| Trello API error (500) | Show "Trello service error, please try again later" |
| Trello rate limit (429) | Show "Rate limit reached, please wait 30 seconds" |
| Network timeout | Show "Connection timeout, please check internet and retry" |
| Partial sync failure | Show "Synced 3/5 tasks. Failed: [task names]. See errors below." |

### Focus Session Errors
| Error | UI Behavior |
|-------|-------------|
| Task not found | Show "Task not found" and redirect to tasks list |
| Session save failed | Show "Failed to save session, but you can continue" |
| Timer accuracy warning | If client/server time differs >5s, show warning |

### Loading States
| Screen | Loading Behavior |
|--------|------------------|
| Login/Register | Disable form, show spinner on button |
| Course list | Show skeleton loaders for 3 course cards |
| Study plan generation | Show "Processing with AI..." with spinner, disable all buttons |
| Tasks list | Show skeleton loaders for 5 task cards |
| Flashcards | Show "Loading flashcards..." |
| Trello sync | Show "Syncing..." on button, disable form |
| Dashboard stats | Show skeleton numbers/charts |

### Empty States
| Screen | Empty State Message |
|--------|---------------------|
| No courses | "No courses yet. Create your first course to get started!" + CTA button |
| No tasks | "No study tasks yet. Generate a study plan to create tasks." + link to generate |
| No flashcards | "No flashcards yet. Generate a study plan to create flashcards." |
| No focus sessions | "No focus sessions yet. Start a session from any task." |
| Admin logs (empty) | "No logs found for this filter." |
```

---

### 🆕 NEW SECTION: 11.6 Required Test Cases

**Location:** Insert after Section 11.5

```markdown
## 11.6 Required Test Cases

### Unit Tests (Backend)
1. **Gemini schema validation**
   - ✅ Valid Gemini response passes validation
   - ✅ Missing required field fails validation
   - ✅ Wrong field type fails validation
   - ✅ Invalid enum value fails validation

2. **Input validation**
   - ✅ Course title validation (empty, too short, too long)
   - ✅ Study text validation (empty, too short, too long)
   - ✅ Task field validation (title, estimatedMinutes range)

3. **Dashboard calculations**
   - ✅ Correctly counts total tasks
   - ✅ Correctly counts completed tasks
   - ✅ Correctly sums focus minutes
   - ✅ Correctly counts Trello synced tasks
   - ✅ Correctly groups stats by course

4. **Trello payload building**
   - ✅ Builds correct card object from task
   - ✅ Includes task description and tags in card description

### Integration Tests (Backend)
1. **Authentication**
   - ✅ Register new user creates profile in database
   - ✅ Login returns valid JWT
   - ✅ Invalid credentials return 401
   - ✅ Protected route rejects missing JWT

2. **Course management**
   - ✅ Create course for authenticated user
   - ✅ List courses returns only user's courses
   - ✅ Cannot access another user's course (403)

3. **Study plan generation**
   - ✅ Generate plan with mocked Gemini (valid response)
   - ✅ Saves material, tasks, flashcards to database
   - ✅ Returns error on Gemini timeout (mocked 30s delay)
   - ✅ Returns error on invalid Gemini JSON (mocked malformed response)
   - ✅ Returns error on text too short
   - ✅ Returns error on text too long

4. **Task operations**
   - ✅ List tasks returns only user's tasks
   - ✅ Update task succeeds for own task
   - ✅ Update task fails for another user's task (403)
   - ✅ Mark task complete updates status and timestamp

5. **Trello sync**
   - ✅ Sync task to Trello with mocked Trello API
   - ✅ Saves sync log on success
   - ✅ Saves sync log on failure
   - ✅ Returns partial success when some tasks fail
   - ✅ Returns 401 on invalid Trello credentials (mocked)
   - ✅ Does not sync another user's task (403)

6. **Focus sessions**
   - ✅ Create focus session for user's task
   - ✅ Complete session saves duration
   - ✅ Complete session with completedTask=true marks task complete
   - ✅ Cannot create session for another user's task

7. **Authorization**
   - ✅ Student cannot access admin routes (403)
   - ✅ Admin can access admin routes (200)
   - ✅ Unauthenticated user redirected to login (401)

### Frontend Tests (Component Tests)
1. **Form validation**
   - ✅ Course creation form disables submit when title empty
   - ✅ Study text form shows error when text < 100 chars
   - ✅ Task edit form validates estimated minutes range

2. **Error display**
   - ✅ Login error displays below form
   - ✅ Gemini timeout shows correct error message
   - ✅ Trello sync shows per-task success/failure

3. **Loading states**
   - ✅ Login button shows spinner during request
   - ✅ Study plan generation shows "Processing with AI..." message
   - ✅ Dashboard shows skeleton loaders before data loads

4. **Empty states**
   - ✅ Course list shows "No courses" message when empty
   - ✅ Task list shows "No tasks" with CTA when empty

### E2E Test (Optional, Single Happy Path)
1. ✅ Login as student
2. ✅ Create course "Calculus 101"
3. ✅ Navigate to course
4. ✅ Paste study text (>100 chars)
5. ✅ Click "Generate Study Plan"
6. ✅ Verify tasks appear
7. ✅ Verify flashcards appear
8. ✅ Select one task
9. ✅ Enter mocked Trello credentials
10. ✅ Sync to Trello
11. ✅ Verify success message
12. ✅ Start focus session on task
13. ✅ Complete session
14. ✅ View dashboard
15. ✅ Verify stats updated (1 completed task, 25 focus minutes, 1 Trello sync)

### Mocking Rules
- ✅ All tests use mocked Gemini API (nock or jest.mock)
- ✅ All tests use mocked Trello API (nock or jest.mock)
- ✅ No real external API calls in automated tests
- ✅ Mock responses use actual Gemini schema structure
- ✅ Mock errors (timeout, 429, invalid JSON) to test error handling
```

---

### 🆕 NEW SECTION: 12.5 Dashboard Update Mechanism

**Location:** Insert after Section 12 (CI/CD Requirements)

```markdown
## 12.5 Dashboard Update Mechanism

### Approach: Manual Refetch After Mutations

**No real-time updates, no polling, no WebSockets for MVP.**

### Implementation
1. Dashboard fetches stats on mount: `GET /api/dashboard/stats`
2. User performs action (complete task, sync to Trello, finish focus session)
3. After successful mutation, frontend calls refetch function
4. Dashboard updates with new data

### Example Flow
```javascript
// Dashboard component
const [stats, setStats] = useState(null);

const fetchStats = async () => {
  const response = await api.get('/dashboard/stats');
  setStats(response.data.data);
};

useEffect(() => {
  fetchStats();
}, []);

// When task completed (from task list component)
const completeTask = async (taskId) => {
  await api.post(`/tasks/${taskId}/complete`);
  // Trigger refetch via context or prop callback
  onTaskCompleted(); // This calls dashboard's fetchStats()
};
```

### State Management Pattern

Use **React Context** for sharing refetch triggers:

```javascript
// DashboardContext.js
const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  
  const refreshStats = async () => {
    const response = await api.get('/dashboard/stats');
    setStats(response.data.data);
  };
  
  return (
    <DashboardContext.Provider value={{ stats, refreshStats }}>
      {children}
    </DashboardContext.Provider>
  );
};

// Usage in task component
const { refreshStats } = useContext(DashboardContext);

const completeTask = async (taskId) => {
  await api.post(`/tasks/${taskId}/complete`);
  refreshStats(); // Dashboard auto-updates
};
```

### When to Refetch

- ✅ After creating course
- ✅ After completing task
- ✅ After Trello sync
- ✅ After finishing focus session
- ✅ On dashboard page navigation (always fresh on visit)

### What NOT to Do

- ❌ No polling every N seconds
- ❌ No WebSocket connections
- ❌ No optimistic updates (too complex for MVP)
- ❌ No caching strategy (use browser cache defaults)

```

---

### 🆕 NEW SECTION: 13.5 File Structure

**Location:** Insert after Section 13 (Agentic Development Requirements)

```markdown
## 13.5 File Structure

### Frontend Structure
```

/frontend
  /src
    /components
      /auth
        LoginForm.jsx
        RegisterForm.jsx
        ProtectedRoute.jsx
      /courses
        CourseList.jsx
        CourseCard.jsx
        CreateCourseModal.jsx
      /study
        StudyMaterialInput.jsx
        GeneratedPlan.jsx
      /tasks
        TaskList.jsx
        TaskCard.jsx
        TaskEditModal.jsx
      /flashcards
        FlashcardList.jsx
        FlashcardCard.jsx
      /trello
        TrelloSyncForm.jsx
      /focus
        FocusTimer.jsx
      /dashboard
        StudentDashboard.jsx
        StatsCard.jsx
      /admin
        AdminDashboard.jsx
        LogsTable.jsx
      /common
        Button.jsx
        Input.jsx
        Modal.jsx
        Loading.jsx
        EmptyState.jsx
    /context
      AuthContext.jsx
      DashboardContext.jsx
    /services
      api.js          # Axios instance with interceptors
      auth.service.js
      courses.service.js
      tasks.service.js
      trello.service.js
      focus.service.js
    /utils
      validation.js   # Zod schemas for frontend validation
      formatters.js
    /pages
      Landing.jsx
      Dashboard.jsx
      CoursePage.jsx
      TasksPage.jsx
      FlashcardsPage.jsx
      TrelloPage.jsx
      FocusPage.jsx
      AdminPage.jsx
    App.jsx
    main.jsx
  package.json
  vite.config.js

```

### Backend Structure
```

/backend
  /src
    /modules
      /auth
        auth.routes.js
        auth.controller.js
        auth.middleware.js
      /courses
        courses.routes.js
        courses.controller.js
        courses.service.js
      /tasks
        tasks.routes.js
        tasks.controller.js
        tasks.service.js
      /flashcards
        flashcards.routes.js
        flashcards.controller.js
      /trello
        trello.routes.js
        trello.controller.js
        trello.service.js
      /focus
        focus.routes.js
        focus.controller.js
      /dashboard
        dashboard.routes.js
        dashboard.controller.js
      /admin
        admin.routes.js
        admin.controller.js
        admin.middleware.js
    /shared
      /middleware
        errorHandler.js
        cors.js
        logger.js
      /utils
        logger.js
        response.js   # Standard response formatter
      /validation
        schemas.js    # Zod schemas
    /config
      supabase.js
      env.js          # Environment validation with Zod
    server.js
    app.js            # Express app setup
  /tests
    /integration
      auth.test.js
      courses.test.js
      tasks.test.js
      trello.test.js
    /unit
      validation.test.js
      dashboard.test.js
  package.json

```

### Document Processing Microservice
```

/document-service
  /src
    /controllers
      process.controller.js
    /services
      gemini.service.js
      validation.service.js
    /schemas
      gemini.schema.js  # Zod schema for Gemini output
    /middleware
      errorHandler.js
    /config
      env.js
    /utils
      logger.js
    server.js
    app.js
  /tests
    /unit
      gemini.schema.test.js
    /integration
      process.test.js
  package.json

```

### Root Structure
```

/studyops-ai
  /frontend
  /backend
  /document-service
  /docs
    PRD.md
    PRD_REVIEW.md
    PRD_IMPROVEMENT_PLAN.md
    AGENTS.md
    CLAUDE.md
    SKILLS.md
    AGENT_MEMORY.md
    /adrs
      001-modular-monolith.md
      002-separate-document-service.md
      003-zod-validation.md
      004-no-trello-persistence.md
  .gitignore
  README.md

```

```

---

### 🆕 NEW SECTION: 13.6 Implementation Order

**Location:** Insert after Section 13.5

```markdown
## 13.6 Implementation Order

### Phase 1: Foundation (Week 1)
**1. Project setup**
   - Initialize frontend (Vite + React)
   - Initialize backend (Express)
   - Initialize document-service (Express)
   - Set up Supabase project
   - Configure environment variables
   - Set up Git repository
   - Create folder structure

**2. Authentication**
   - Supabase Auth integration
   - Register endpoint
   - Login endpoint
   - JWT validation middleware
   - Frontend login/register forms
   - Protected route component
   - Auth context

**3. Course management**
   - Backend: Create course endpoint
   - Backend: List courses endpoint
   - Backend: Get single course endpoint
   - Frontend: Course list page
   - Frontend: Create course modal
   - Tests: Course creation, authorization

### Phase 2: Core AI Features (Week 2)
**4. Document Processing Microservice**
   - Gemini API integration
   - Zod schema for Gemini output
   - Validation service
   - Error handling for Gemini failures
   - Tests: Schema validation, mocked Gemini calls

**5. Study Plan Generation**
   - Backend: Generate endpoint
   - Backend: Call document-service
   - Backend: Save material, tasks, flashcards
   - Frontend: Study material input form
   - Frontend: Display generated plan
   - Loading/error states
   - Tests: End-to-end generation with mocked Gemini

### Phase 3: Task Management (Week 2-3)
**6. Task features**
   - Backend: List tasks endpoint
   - Backend: Update task endpoint
   - Backend: Complete task endpoint
   - Frontend: Task list page
   - Frontend: Task card component
   - Frontend: Task edit modal
   - Tests: Task CRUD, authorization

**7. Flashcards**
   - Backend: List flashcards endpoint
   - Frontend: Flashcard list page
   - Frontend: Flashcard flip component
   - Tests: Flashcard listing, authorization

### Phase 4: Integrations (Week 3)
**8. Trello sync**
   - Backend: Trello service
   - Backend: Sync endpoint (no persistence)
   - Frontend: Trello sync form
   - Frontend: Display sync results
   - Tests: Mocked Trello API, partial success handling

**9. Focus sessions**
   - Backend: Start session endpoint
   - Backend: Complete session endpoint
   - Frontend: Focus timer component
   - Frontend: Timer with 25/5 countdown
   - Tests: Session creation, duration calculation

### Phase 5: Dashboard & Admin (Week 4)
**10. Student dashboard**
    - Backend: Stats endpoint
    - Backend: Dashboard calculations
    - Frontend: Dashboard page
    - Frontend: Stats cards
    - Frontend: Course progress
    - Dashboard context for refetch
    - Tests: Stats calculations

**11. Admin dashboard**
    - Backend: Admin middleware (role check)
    - Backend: Logs endpoint
    - Backend: Admin stats endpoint
    - Frontend: Admin page
    - Frontend: Logs table
    - Tests: Admin authorization

### Phase 6: Polish & Testing (Week 4)
**12. Error handling & UX**
    - All loading states
    - All empty states
    - All error messages
    - Form validation
    - Input limits enforcement

**13. Testing**
    - Complete unit test coverage
    - Complete integration tests
    - Optional E2E test
    - CI/CD setup

**14. Documentation**
    - Complete all AGENTS.md, CLAUDE.md, SKILLS.md
    - Document workflows
    - Create demo script

### Dependencies
- Phase 1 must complete before Phase 2
- Phases 2-3 can partially overlap (tasks depend on generation)
- Phase 4 depends on Phase 3 (tasks must exist)
- Phase 5 depends on all previous (dashboard aggregates everything)
- Phase 6 is continuous but finalized at end

### Definition of Done for Each Phase
- ✅ All endpoints/components implemented
- ✅ Tests written and passing
- ✅ No console errors/warnings
- ✅ Documented in AGENT_MEMORY.md
- ✅ Reviewed by Supervisor Agent
- ✅ Security reviewed if relevant
- ✅ CI passing
```

---

### 🆕 NEW SECTION: 15.5 UI Screens Specification

**Location:** Insert after Section 15 (Demo Plan)

```markdown
## 15.5 UI Screens Specification

### 1. Landing/Login Page
- Logo and app name
- Login form (email, password)
- "Register" link
- Error message display area
- Loading state on submit button

### 2. Register Page
- Email input
- Password input (min 8 chars, letter + number)
- Confirm password input
- Role selection (student/admin) - optional, defaults to student
- "Register" button
- "Already have account? Login" link

### 3. Student Dashboard
**Navigation:** Logo, Dashboard, Courses, Tasks, Flashcards, Trello, Logout

**Stats Cards (Top Row):**
- Total Tasks: `42`
- Completed Tasks: `15`
- Focus Minutes: `350`
- Trello Synced: `8`

**Course Progress (Bottom Section):**
- Table or cards showing:
  - Course name
  - Completed tasks / Total tasks
  - Progress bar

**Actions:**
- "Create New Course" button

### 4. Course List Page
**Header:** "My Courses"
**Action:** "Create Course" button

**Course Cards (Grid):**
- Course name
- Created date
- Task stats: `5/10 tasks completed`
- "View Course" button

**Empty State:**
- Icon
- "No courses yet"
- "Create your first course to get started!"
- "Create Course" button

### 5. Single Course Page
**Header:** Course name
**Breadcrumb:** Dashboard > Courses > [Course Name]

**Tabs:**
- Study Material
- Tasks
- Flashcards

**Study Material Tab:**
- Textarea for study text input (100-50,000 chars)
- Character count: `1,234 / 50,000`
- "Generate Study Plan" button
- If already generated:
  - Summary section
  - Key topics (chips/tags)
  - Difficulty badge
  - "Regenerate" button

**Tasks Tab:**
- Filter: All / Pending / Completed
- List of task cards:
  - Title
  - Description (truncated)
  - Priority badge
  - Estimated time
  - Tags
  - "Edit" and "Complete" buttons
  - If completed: checkmark, completed date

**Flashcards Tab:**
- Grid of flashcard cards:
  - Question (front)
  - Click to flip
  - Answer (back)
  - Tags

### 6. Task Edit Modal
- Title input
- Description textarea
- Priority dropdown (low/medium/high)
- Estimated minutes input (5-480)
- Difficulty (read-only, AI-generated)
- Tags (read-only, AI-generated)
- "Save" and "Cancel" buttons

### 7. All Tasks Page
**Header:** "All Tasks"
**Filter:**
- Course dropdown (all courses + "All Courses")
- Status: All / Pending / Completed

**Task List:**
- Same task cards as course tasks tab
- Shows course name on each card
- "Start Focus" button on each task

**Empty State:**
- "No tasks yet"
- "Generate a study plan to create tasks"
- Link to courses

### 8. Trello Sync Page
**Header:** "Sync to Trello"

**Step 1: Credentials**
- Info text: "Enter your Trello API key and token. These are not saved."
- API Key input (link to Trello developer portal)
- Token input (link to token generator)
- "Validate" button (optional)

**Step 2: Select Tasks**
- Checkbox list of all pending tasks
- Select all / Deselect all
- Shows course name for each task

**Step 3: Sync**
- "Sync Selected Tasks" button
- Loading: "Syncing..."
- Results:
  - Success count: `3 tasks synced successfully`
  - Failure list (if any): `Failed to sync: [Task Name] - Error message`
  - Per-task status: checkmark (success) or X (failure)

### 9. Focus Session Page
**Header:** Task title
**Breadcrumb:** Dashboard > Focus > [Task Name]

**Timer Display:**
- Large countdown: `24:35`
- Phase: "Focus" or "Break"
- Progress circle/bar

**Controls:**
- "Pause" / "Resume" button
- "End Session" button

**On Complete:**
- Modal: "Session Complete! 25 minutes focused."
- Checkbox: "Mark task as complete?"
- "Finish" button

### 10. Flashcards Page
**Header:** "Flashcards"
**Filter:** Course dropdown

**Flashcard Display:**
- Current card (large):
  - Question
  - "Flip" button or click to flip
  - Answer (on flip)
- Navigation: Previous / Next
- Counter: `Card 3 of 15`

**Alternative View:** Grid of all flashcards (smaller cards, click to expand)

**Empty State:**
- "No flashcards yet"
- "Generate a study plan to create flashcards"

### 11. Admin Dashboard
**Header:** "Admin Dashboard"
**Navigation:** Dashboard, Logs, Stats, Logout

**Stats Section:**
- Total Users: `50`
- Total Courses: `120`
- Total Tasks: `1,500`
- Gemini Calls Today: `45`
- Trello Syncs Today: `12`
- Errors Today: `3`

**Recent Activity:**
- Last 10 Gemini API calls (timestamp, user, status)
- Last 10 Trello syncs (timestamp, user, status, error if any)

### 12. Admin Logs Page
**Filter:**
- Service dropdown: All / Gemini / Trello / System
- Date range picker (optional)

**Logs Table:**
- Timestamp
- Service
- Operation
- Status (success/failed)
- Error message (if failed)
- Pagination (if implemented post-MVP)

**Empty State:**
- "No logs found for this filter"
```

---

### 📝 REPLACE SECTION: 8 Gemini Output Schema

**Replace existing Section 8 with:**

```markdown
## 8. Gemini Output Schema

The Document Processing Microservice must return structured JSON validated with **Zod**.

### Schema Definition
```typescript
import { z } from 'zod';

export const GeminiOutputSchema = z.object({
  summary: z.string().min(50).max(2000),
  keyTopics: z.array(z.string()).min(1).max(10),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tasks: z.array(
    z.object({
      title: z.string().min(3).max(200),
      description: z.string().min(0).max(1000),
      priority: z.enum(['low', 'medium', 'high']),
      estimatedMinutes: z.number().int().min(5).max(480),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      tags: z.array(z.string()).max(5)
    })
  ).min(1).max(20),
  flashcards: z.array(
    z.object({
      question: z.string().min(10).max(500),
      answer: z.string().min(10).max(2000),
      tags: z.array(z.string()).max(5)
    })
  ).min(1).max(30)
});
```

### Example Valid Response

```json
{
  "summary": "This study material covers the fundamentals of calculus including limits, derivatives, and integrals. Key concepts include the definition of a limit, derivative rules, and basic integration techniques.",
  "keyTopics": [
    "Limits",
    "Derivatives", 
    "Integration",
    "Chain Rule",
    "Fundamental Theorem of Calculus"
  ],
  "difficulty": "medium",
  "tasks": [
    {
      "title": "Practice limit problems",
      "description": "Solve 10 limit problems from chapter 2, focusing on indeterminate forms and L'Hôpital's rule",
      "priority": "high",
      "estimatedMinutes": 45,
      "difficulty": "medium",
      "tags": ["limits", "practice"]
    },
    {
      "title": "Review derivative rules",
      "description": "Study and memorize power rule, product rule, quotient rule, and chain rule",
      "priority": "medium",
      "estimatedMinutes": 30,
      "difficulty": "easy",
      "tags": ["derivatives", "rules"]
    }
  ],
  "flashcards": [
    {
      "question": "What is the definition of a limit?",
      "answer": "The limit of f(x) as x approaches a is L if f(x) gets arbitrarily close to L as x gets arbitrarily close to a",
      "tags": ["limits", "definition"]
    },
    {
      "question": "State the power rule for derivatives",
      "answer": "If f(x) = x^n, then f'(x) = n*x^(n-1)",
      "tags": ["derivatives", "power rule"]
    }
  ]
}
```

### Validation Rules

1. Parse Gemini response with `JSON.parse()`
2. Validate with `GeminiOutputSchema.parse(data)`
3. If validation fails, throw error with Zod error details
4. Never save unvalidated output to database
5. Return validation errors to user as "AI processing failed"

### Error Handling

```javascript
try {
  const rawResponse = await callGeminiAPI(studyText);
  const parsed = JSON.parse(rawResponse);
  const validated = GeminiOutputSchema.parse(parsed);
  return validated;
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error('Gemini schema validation failed', { errors: error.errors });
    throw new Error('GEMINI_INVALID_RESPONSE');
  }
  throw error;
}
```

### Gemini Prompt Template

```
You are a study assistant. Analyze the following study material and generate a structured study plan.

Study Material:
${studyText}

Generate a JSON response with this exact structure:
{
  "summary": "A 2-3 sentence summary of the material",
  "keyTopics": ["topic1", "topic2", ...],
  "difficulty": "easy" | "medium" | "hard",
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description",
      "priority": "low" | "medium" | "high",
      "estimatedMinutes": 30,
      "difficulty": "easy" | "medium" | "hard",
      "tags": ["tag1", "tag2"]
    }
  ],
  "flashcards": [
    {
      "question": "Question text",
      "answer": "Answer text",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Requirements:
- summary: 50-2000 characters
- keyTopics: 1-10 items
- tasks: 1-20 items, each 5-480 minutes
- flashcards: 1-30 items
- Respond ONLY with valid JSON, no other text
```

### Timeout & Retry

- Gemini API timeout: 30 seconds
- No retry on timeout (return error to user)
- No retry on validation failure
- Log all Gemini calls with redacted prompts

```

---

### 📝 REPLACE SECTION: 14 Human Approval Required

**Replace with simplified version:**

```markdown
## 14. Human Approval Required

For MVP, keep approval simple. Agent must stop and request approval before:

### Architecture & Dependencies
- Adding new npm packages
- Changing database schema
- Creating new external service integrations
- Modifying authentication flow

### Destructive Operations
- Deleting files or folders
- Renaming major modules
- Changing environment variable names
- Git force push or history rewriting

### Configuration
- Modifying CI/CD workflows
- Changing build configuration (Vite, Webpack, etc.)
- Updating deployment scripts

### Process & Documentation
- Modifying PRD, AGENTS.md, CLAUDE.md, SKILLS.md
- Creating new ADRs
- Changing workflows

### How to Request Approval
1. Stop execution
2. Output clear message: "⚠️ APPROVAL REQUIRED: [Action]"
3. Explain why approval is needed
4. Provide details of proposed change
5. Wait for explicit "approved" response before proceeding
6. If denied, request alternative approach
```

---

## Implementation Checklist

Before starting implementation, verify these sections are updated in the PRD:

- Section 6.5: Tech Stack Details (added)
- Section 7.6: Trello Sync (replaced)
- Section 7.10: Input Validation Rules (added)
- Section 8: Gemini Output Schema (replaced with Zod version)
- Section 8.5: API Response Format (added)
- Section 8.6: API Endpoints (added)
- Section 9.5: Permissions Matrix (added)
- Section 10.5: Trello Token Handling (added)
- Section 11.5: Error States Specification (added)
- Section 11.6: Required Test Cases (added)
- Section 12.5: Dashboard Update Mechanism (added)
- Section 13.5: File Structure (added)
- Section 13.6: Implementation Order (added)
- Section 14: Human Approval Required (replaced with simplified version)
- Section 15.5: UI Screens Specification (added)

---

## Key Takeaways

### What This Plan Achieves

1. **Eliminates ambiguity** - AI agents have clear, unambiguous specifications
2. **Maintains MVP scope** - No feature creep, focus on core demo
3. **Enforces security** - Trello tokens not persisted, proper auth checks
4. **Defines standards** - Consistent API responses, error handling, validation
5. **Provides structure** - Clear file organization and implementation order

### What This Plan Avoids

1. **Scope creep** - No GDPR, load testing, production features
2. **Over-engineering** - No real-time updates, no advanced state management
3. **Security risks** - Clear token handling, no credential storage
4. **Implementation confusion** - Every technical decision is explicit

### Next Steps

1. Update PRD with all sections from this plan
2. Review updated PRD with stakeholders
3. Begin Phase 1 implementation (Foundation)
4. Follow implementation order strictly
5. Verify Definition of Done for each phase

---

**End of PRD Improvement Plan**