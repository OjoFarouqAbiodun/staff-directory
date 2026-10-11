# STAFF DIRECTORY WEB APPLICATION

## OpenCode Master Prompt v2 — SIWES Project

You are the coding agent responsible for implementing this project.

Your job is to build the application **step-by-step**, verify each step, and stop after each task until I explicitly tell you to continue.

I am a beginner with limited programming knowledge, so **do not assume I understand undocumented decisions**. Keep the implementation simple, maintainable, and appropriate for a SIWES student project.

---

# 0. EXPANDED SCOPE — OWNER-APPROVED REVISIONS

> **Status of this section.** This specification originally described a read-only Staff
> Directory with three database tables and seven public `GET` endpoints. After the original
> directory, search, filtering, profile modal and responsive interface were completed and
> verified, the owner **explicitly approved** an expanded scope. The following capabilities were
> requested, implemented and verified as Tasks 1–6. **Where a later section of this document
> still describes the original read-only design — for example "no authentication", "read-only
> API", "exactly three tables", or login/registration/dashboards listed as forbidden — that
> statement is superseded here and marked `REVISED` in place.** The original Staff Directory
> requirements remain in force and are unchanged.

**Task 1 — Administrator authentication backend.** A `POST /api/auth/register` endpoint creates
an administrator account (username, email, `crypto.scrypt` password hash with a unique salt —
never plaintext), and `POST /api/auth/login`, `POST /api/auth/logout` and `GET /api/auth/me`
manage server-side sessions stored in an `admin_sessions` table and carried in an `HttpOnly`,
`SameSite=Lax`, 7-day `admin_session` cookie (`Secure` in production). Registration creates an
administrator account; **no default administrator credentials are provided.** The auth routes
are mounted separately under `/api/auth`; no existing directory endpoint changed.

**Task 2 — Authentication interface.** Sign In / Sign Up screens in the existing SPA, session
detection on page load via `GET /api/auth/me`, an account view, sign-out, auth-aware navigation,
loading/error/session-expiry states, and responsive behaviour at 375px / 768px / 1440px.

**Task 3 — Admin-only staff creation.** A protected `POST /api/staff` endpoint (requires a valid
`admin_session` cookie; otherwise HTTP 401) and an Add Staff screen that publishes the new
record in the directory immediately. Visitors without a session never see or reach the form.

**Task 4 — Task management backend.** A `tasks` table plus seven protected endpoints to create,
list (with validated `staff_id` / `status` / `priority` filters), view, update, reassign, change
the status of, and delete tasks assigned to staff. `created_by_admin_id` is taken from the
session, never from the request body. `GET /api/staff/:id/tasks` lists one staff member's tasks;
`GET /api/staff/:id` itself remains public.

**Task 5 — Task management interface.** A signed-in-only Tasks screen: create and edit tasks,
assign staff, change status from the list, delete after a confirmation naming the task, and
filter/clear filters. Visitors are routed away from it.

**Task 6 — Administrator dashboard.** A protected `GET /api/admin/dashboard` endpoint plus a
Dashboard screen. Every number is recomputed from the database at request time (aggregate SQL,
no N+1): staff total and employment-status counts; task total, per-status counts and overdue
count (due date before SQLite UTC `date('now')`, excluding Completed/Cancelled); up to ten
overdue tasks (oldest first), the five staff members with the most open tasks and the five most
recently updated tasks. The response carries no passwords, hashes or session material. Zero-data
databases return all-zero counts. Summary cards and rows link into the Directory/Tasks views with
their filters pre-applied.

**Resulting endpoint inventory (20 total).** Seven public directory endpoints (health, staff,
staff by id, departments, departments by id, roles, roles by id), four authentication endpoints,
one protected staff-creation endpoint, seven protected task endpoints and one protected dashboard
endpoint. The public endpoints are unchanged in method, path and response shape.

---

# 1. PROJECT OBJECTIVE

Build a polished, modern **Staff Directory Web Application** for an organization.

The application must allow users to:

* Browse staff members
* Search staff by:

  * First name
  * Last name
  * Full name
  * Email
  * Job title
* Filter staff by:

  * Department
  * Role
  * Employment status
* Combine search and filters
* View detailed staff profiles
* Use the application comfortably on desktop, tablet, and mobile

The final result should look like a real modern internal company directory, not a basic school CRUD demonstration.

---

# 2. EXACT TECHNOLOGY STACK

Use ONLY this stack unless there is a genuine technical necessity:

### Frontend

* HTML5
* Tailwind CSS through CDN
* Vanilla JavaScript

### Backend

* Node.js
* Express.js

### Database

* SQLite
* `better-sqlite3`

### Communication

* REST API
* Native browser `fetch()`

---

# 3. TECHNOLOGIES YOU MUST NOT INTRODUCE

Do NOT introduce:

* React
* Vue
* Angular
* Next.js
* TypeScript
* Bootstrap
* Material UI
* Vite
* Webpack
* Prisma
* Sequelize
* MongoDB
* PostgreSQL
* MySQL
* Firebase
* Supabase
* Redux
* Axios
* ~~Authentication systems~~ — **`REVISED`**: the owner approved administrator authentication
  using Node's built-in `crypto` for password hashing and an internal `admin_sessions` table; no
  third-party authentication library was added.
* ~~Admin dashboards~~ — **`REVISED`**: the owner approved a read-only administrator dashboard
  (Task 6) that summarises the live database; no third-party dashboard or charting library was
  added.
* Unnecessary third-party UI libraries

Do not add technologies simply because they are popular.

The goal is a straightforward, reliable SIWES project.

---

# 4. STRICT MVP RULE

The priority is getting the core project completed successfully.

Do NOT add extra functionality until the following are completely working:

1. Modern UI
2. SQLite database
3. Express backend
4. Staff API
5. Staff cards
6. Search
7. Department filter
8. Role filter
9. Employment-status filter
10. Combined filtering
11. Staff profile modal
12. Responsive design
13. Error/loading/empty states

Do NOT spend time building:

* ~~Login~~ — **`REVISED`**: approved as Task 2 (Sign In screen wired to `POST /api/auth/login`).
* ~~Registration~~ — **`REVISED`**: approved as Tasks 1–2 (administrator sign-up).
* ~~Admin panel~~ — **`REVISED`**: approved as Tasks 2, 3, 5 and 6 (account view, Add Staff,
  Tasks and Dashboard screens, all administrator-only).
* ~~Staff creation/editing UI~~ — **`REVISED`**: staff creation UI approved as Task 3. Staff
  **editing and deletion** remain out of scope and are not implemented.
* Staff deletion UI — still out of scope; not implemented.
* ~~Authentication~~ — **`REVISED`**: approved as Task 1 (backend) and Task 2 (interface).
* ~~Authorization~~ — **`REVISED`**: approved for the actions that change data (staff creation,
  all task endpoints, the dashboard) via the `authenticate` middleware; the directory's read
  endpoints deliberately stay public.
* Pagination — still out of scope.
* Deployment configuration — still out of scope beyond the existing Render-ready setup.
* Complex analytics — still out of scope; the dashboard is a simple read-only summary.
* Notifications — still out of scope.
* Dark mode — still out of scope.
* Unnecessary animations — still out of scope.
* Unnecessary features — still out of scope.

unless I explicitly request them later. Items above marked **`REVISED`** were explicitly
requested later and are now implemented.

---

# 5. DESIGN DIRECTION

The application must have a polished modern SaaS/internal-company visual style.

Use visual inspiration from modern:

* Dribbble interfaces
* Behance dashboards
* SaaS employee directories
* Modern HR/internal company tools

The visual language should include:

* Clean sidebar
* Clear page header
* Search interface
* Persistent filters
* Bento/grid-style staff cards
* Rounded but professional components
* Strong typography hierarchy
* Generous spacing
* Subtle borders
* Subtle shadows
* Neutral professional color palette
* Clear visual hierarchy
* Smooth micro-interactions
* Responsive layout

Avoid:

* Generic Bootstrap-looking layouts
* Huge gradients
* Excessive glassmorphism
* Neon colors
* Overly colorful cards
* Excessive rounded containers
* Huge unnecessary shadows
* AI-generated-looking dashboard layouts
* Excessive decorative elements

The application should look like something an actual organization could use.

---

# 6. RESPONSIVE DESIGN

The interface must work on:

* Desktop
* Laptop
* Tablet
* Mobile

Desktop should provide the full sidebar and spacious staff grid.

On smaller screens:

* Sidebar should adapt appropriately
* Search should remain usable
* Filters should remain accessible
* Cards should resize/reflow
* Profile modal should fit the viewport
* No horizontal overflow

---

# 7. PROJECT STRUCTURE

Use approximately this structure:

```text
staff-directory/
├── data/
│   └── staff-directory.db
│
├── public/
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   ├── app.js
│   │   │   ├── api.js
│   │   │   ├── ui.js
│   │   │   ├── filters.js
│   │   │   ├── modal.js
│   │   │   ├── auth.js          (REVISED — Task 1–2: sign-in/sign-up/session router)
│   │   │   ├── staff-create.js  (REVISED — Task 3: Add Staff screen)
│   │   │   ├── tasks.js         (REVISED — Task 5: Tasks screen)
│   │   │   └── dashboard.js     (REVISED — Task 6: Dashboard screen)
│   │   ├── images/
│   │   │   └── placeholders/
│   │   └── favicon.svg
│
├── src/
│   ├── config/
│   │   └── config.js
│   ├── database/
│   │   ├── db.js
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── controllers/
│   │   ├── staffController.js
│   │   ├── departmentController.js
│   │   ├── roleController.js
│   │   ├── authController.js    (REVISED — Task 1)
│   │   ├── taskController.js    (REVISED — Task 4)
│   │   └── dashboardController.js (REVISED — Task 6)
│   ├── routes/
│   │   ├── staffRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── roleRoutes.js
│   │   ├── authRoutes.js        (REVISED — Task 1)
│   │   ├── taskRoutes.js        (REVISED — Task 4)
│   │   └── dashboardRoutes.js   (REVISED — Task 6)
│   ├── repositories/
│   │   ├── staffRepository.js
│   │   ├── departmentRepository.js
│   │   ├── roleRepository.js
│   │   ├── adminRepository.js   (REVISED — Task 1)
│   │   ├── sessionRepository.js (REVISED — Task 1)
│   │   ├── taskRepository.js    (REVISED — Task 4)
│   │   └── dashboardRepository.js (REVISED — Task 6)
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   ├── parseCookies.js      (REVISED — Task 1)
│   │   └── authenticate.js      (REVISED — Task 1: session check for protected routes)
│   └── app.js
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

Do not create unnecessary folders or files.

---

# 8. DATABASE DESIGN

Create these tables.

## departments

```text
id
name
description
created_at
```

`name` must be unique.

## roles

```text
id
name
description
created_at
```

`name` must be unique.

## staff

```text
id
first_name
last_name
email
phone
job_title
department_id
role_id
location
avatar_url
bio
employment_status
created_at
updated_at
```

Requirements:

* `email` must be unique
* `department_id` references departments
* `role_id` references roles
* employment status defaults to `Active`
* foreign keys must be enabled
* use parameterized SQL
* use appropriate indexes

Use:

```sql
PRAGMA foreign_keys = ON;
```

Foreign keys should use:

```text
ON UPDATE CASCADE
ON DELETE RESTRICT
```

Create indexes for commonly filtered/searched fields such as:

* department_id
* role_id
* employment_status
* last_name

## admins  (REVISED — Task 1)

```text
id
username        (TEXT NOT NULL UNIQUE)
email           (TEXT NOT NULL UNIQUE, stored lowercase)
password_hash   (TEXT NOT NULL — crypto.scrypt with a unique salt; never plaintext)
full_name       (TEXT NOT NULL)
created_at
updated_at
```

## admin_sessions  (REVISED — Task 1)

```text
id          (TEXT PRIMARY KEY — a random 256-bit opaque session token, not a sequential id)
admin_id    (INTEGER NOT NULL, FOREIGN KEY → admins.id)
expires_at  (TEXT NOT NULL — 7 days after creation; expired sessions are rejected with 401)
created_at
```

## tasks  (REVISED — Task 4)

```text
id                  (INTEGER PRIMARY KEY AUTOINCREMENT)
title               (TEXT NOT NULL, max 200 characters)
description         (TEXT, nullable, max 2000 characters)
staff_id            (INTEGER NOT NULL, FOREIGN KEY → staff.id)
priority            (TEXT NOT NULL DEFAULT 'Medium', CHECK in Low/Medium/High/Urgent)
status              (TEXT NOT NULL DEFAULT 'Pending', CHECK in Pending/In Progress/Completed/On Hold/Cancelled)
due_date            (TEXT, nullable — ISO YYYY-MM-DD, must be a real calendar date)
created_by_admin_id (INTEGER NOT NULL, FOREIGN KEY → admins.id; set from the authenticated session)
created_at
updated_at
```

The final schema contains **six tables**: `departments`, `roles`, `staff`, `admins`,
`admin_sessions` and `tasks`. The database also declares indexes on `admin_sessions(admin_id,
expires_at)` and on `tasks(staff_id, status, created_by_admin_id, due_date)` in addition to the
four staff indexes. No administrator is seeded — the first account is created through
`POST /api/auth/register`.

---

# 9. SEED DATA

Create realistic fictional seed data.

Minimum:

### Departments

5

### Roles

8

### Staff

15

Do NOT use real people's personal information.

Create believable fictional employees with:

* Names
* Emails
* Phone numbers
* Job titles
* Departments
* Roles
* Locations
* Bios
* Avatar URLs/placeholders
* Employment statuses

The seed process should be safe to run repeatedly without creating duplicate records.

---

# 10. API

Create these REST endpoints.

### Staff

```http
GET /api/staff
GET /api/staff/:id
```

### Departments

```http
GET /api/departments
GET /api/departments/:id
```

### Roles

```http
GET /api/roles
GET /api/roles/:id
```

### Health

```http
GET /api/health
```

### Administrator authentication  (REVISED — Task 1; mounted under `/api/auth`)

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Registration creates an administrator account and starts a session. Login validates
`email` + `password` and returns the same generic 401 (`Invalid email or password`) whether the
account exists or the password is wrong, so responses never reveal account existence. All
responses expose only `{ id, username, email, full_name }` for the administrator — never the
password hash or session token.

### Staff creation  (REVISED — Task 3; protected)

```http
POST /api/staff
```

Requires a valid `admin_session` cookie; answers HTTP 401 without one. Returns 201 with the
created record (same shape as `GET /api/staff/:id`), 400 for invalid input, 409 for a duplicate
email.

### Task management  (REVISED — Task 4; all protected)

```http
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PATCH  /api/tasks/:id/status
PUT    /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/staff/:id/tasks
```

All require a valid `admin_session` cookie and answer HTTP 401 without one. `GET /api/tasks`
accepts validated `staff_id`, `status` and `priority` filters. `created_by_admin_id` always comes
from the session.

### Administrator dashboard  (REVISED — Task 6; protected)

```http
GET /api/admin/dashboard
```

Requires a valid `admin_session` cookie. Recomputes staff/task totals, status breakdowns, overdue
count and the overdue/recent/top-staff lists from the live database at request time. Carries no
credentials, hashes or tokens.

### Authorization summary

The seven directory endpoints are public and unchanged. Only `POST /api/staff`, the seven task
endpoints and `GET /api/admin/dashboard` require an administrator session, enforced by the
`authenticate` middleware.

---

# 11. STAFF FILTER API

`GET /api/staff` should support query parameters such as:

```text
search
department
role
status
```

Example:

```text
/api/staff?search=john
```

```text
/api/staff?department=Engineering
```

```text
/api/staff?role=Manager
```

```text
/api/staff?search=john&department=Engineering&role=Developer
```

Search should cover relevant fields including:

* first name
* last name
* combined/full name
* email
* job title

Default sorting:

```text
last_name ASC
first_name ASC
```

If an invalid ID or invalid request is received, return an appropriate HTTP status and JSON error.

---

# 12. API RESPONSE FORMAT

Use consistent JSON responses.

Success example:

```json
{
  "success": true,
  "data": []
}
```

Error example:

```json
{
  "success": false,
  "error": {
    "message": "Staff member not found"
  }
}
```

Do not expose stack traces to users.

---

# 13. FRONTEND ARCHITECTURE

### index.html

Responsible for:

* Page shell
* Sidebar
* Header
* Search
* Filters
* Staff grid
* Loading state
* Empty state
* Error state
* Profile modal
* Tailwind CDN

### api.js

Responsible for:

* API requests
* Fetch wrappers
* Error handling

### ui.js

Responsible for:

* Rendering staff cards
* Rendering departments
* Rendering roles
* Loading state
* Empty state
* Error state

### filters.js

Responsible for:

* Search state
* Department filter
* Role filter
* Status filter
* Clear filters
* Filter changes

### modal.js

Responsible for:

* Opening profile modal
* Closing profile modal
* Rendering profile data
* Escape-key closing
* Backdrop closing

### app.js

Responsible for:

* Application startup
* Initial data loading
* Event registration
* Connecting API/data/UI logic

### auth.js  (REVISED — Task 1–2)

Responsible for:

* Sign In / Sign Up / account view routing and the session state
* Asking `/api/auth/me` on load and switching the navigation between the account actions
  and the signed-in identity
* Honest session-expiry handling (`handleSessionExpired`) shared with staff creation, tasks
  and the dashboard
* Stripping `?…` query-fragment intents from the URL after a view loads them

### staff-create.js  (REVISED — Task 3)

Responsible for the Add Staff form: live department/role options, client-side validation,
saving through the protected `POST /api/staff`, success confirmation, directory refresh.

### tasks.js  (REVISED — Task 5)

Responsible for the Tasks screen: list rendering, staff/status/priority filters, the create
and edit dialog, per-card status updates, delete confirmation, and filter-intent arrival.

### dashboard.js  (REVISED — Task 6)

Responsible for the Dashboard screen: loading, content, error-with-retry and session-expiry
states, `aria-live` announcements, and links that carry complete Directory/Tasks filter
intents.

---

# 14. FRONTEND STATE

Use a simple state structure similar to:

```javascript
const state = {
  filters: {
    search: "",
    department: "",
    role: "",
    status: ""
  },

  staff: [],
  departments: [],
  roles: [],

  loading: false,
  error: null
};
```

Keep the state simple.

Do not introduce Redux or another state-management library.

---

# 15. SEARCH BEHAVIOR

Search should:

* Update the staff results
* Work with filters
* Search multiple relevant staff fields
* Have a small debounce around 250–350ms
* Not cause unnecessary API requests

Example:

```text
Search: "designer"
+
Department: "Design"
+
Role: "Senior Designer"
```

All active criteria should work together.

---

# 16. FILTER BEHAVIOR

Provide filters for:

* Department
* Role
* Employment status

Filters must be persistent while browsing the current page.

Provide a clear/reset option.

Clear filters should return the directory to the default staff list.

---

# 17. STAFF CARD DESIGN

Each staff card should display useful summary information such as:

* Avatar
* Full name
* Job title
* Department
* Role
* Location
* Employment status

Cards should have subtle hover interactions.

Use smooth transitions around:

```text
150–250ms
```

Do not over-animate the application.

Clicking a card should open the staff profile.

---

# 18. STAFF PROFILE MODAL

The profile modal should display:

* Large avatar
* Full name
* Job title
* Department
* Role
* Email
* Phone
* Location
* Employment status
* Bio

The modal must support:

* Close button
* Escape key
* Backdrop click
* Keyboard accessibility
* Responsive mobile layout

---

# 19. LOADING / EMPTY / ERROR STATES

Implement proper UI states.

### Loading

Show skeleton cards or another polished loading indicator.

### Empty

When no staff match the filters, show a clear message such as:

```text
No staff members found.
Try adjusting your search or filters.
```

### Error

If the API fails, show a friendly error message.

Do not leave the page blank.

---

# 20. ACCESSIBILITY

Use:

* Semantic HTML
* Proper labels
* Button elements for buttons
* Keyboard navigation where appropriate
* Visible focus states
* Accessible modal behavior
* Appropriate ARIA attributes when needed
* Good color contrast

Do not sacrifice usability for visual appearance.

---

# 21. SECURITY / CODE QUALITY

Use:

* Parameterized SQL queries
* Input validation
* Safe DOM rendering
* Proper error handling
* No secrets committed to source control
* No stack traces exposed to users

Avoid unsafe use of `innerHTML` where user-controlled content could be inserted.

Keep functions reasonably small and understandable.

---

# 22. SERVER

Use Express.

The server should:

* Serve the frontend
* Expose the REST API
* Connect to SQLite
* Handle unknown routes
* Handle application errors
* Start on port 3000 by default

Allow:

```text
PORT
```

to override the default port.

---

# 23. PACKAGE SCRIPTS

Use scripts similar to:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:init": "node src/database/seed.js",
    "db:seed": "node src/database/seed.js"
  }
}
```

`db:init` / `db:seed` create the schema (including the `admins`, `admin_sessions` and `tasks`
tables added by the expanded scope) and the sample data; the seed is idempotent.

Use only necessary dependencies.

Expected core dependencies:

* express
* better-sqlite3

Development dependency:

* nodemon

Do not add packages without a clear reason.

---

# 24. README

Create a clear README containing:

* Project description
* Features
* Technology stack
* Project structure
* Installation
* How to initialize/seed the database
* How to run the application
* API endpoints
* How to use the application
* Troubleshooting basics

Assume the reader is a beginner.

---

# 25. DEVELOPMENT PHASES

Work through the following phases in order.

## PHASE 1 — ENVIRONMENT AND DATABASE

### Task 1.1

Initialize the project.

Requirements:

* Create package.json
* Install necessary dependencies
* Create project directories
* Create initial server entry point
* Create `.gitignore`
* Confirm Node/npm environment
* Do not implement unrelated functionality

Verify the project can start.

STOP.

Wait for confirmation.

---

### Task 1.2

Create SQLite database connection module.

Verify the database can be opened/created.

STOP.

Wait for confirmation.

---

### Task 1.3

Create database schema.

Create:

* departments
* roles
* staff

Add:

* constraints
* foreign keys
* indexes

Verify the schema.

STOP.

Wait for confirmation.

---

### Task 1.4

Create seed data.

Insert:

* 5+ departments
* 8+ roles
* 15+ fictional staff members

Make seeding idempotent.

Verify the database contains the expected records.

STOP.

Wait for confirmation.

---

# PHASE 2 — BACKEND

### Task 2.1

Create Express application.

Configure:

* Express
* JSON parsing
* static frontend serving
* basic middleware

Verify server starts.

STOP.

---

### Task 2.2

Create `/api/health`.

Verify it returns successful JSON.

STOP.

---

### Task 2.3

Create department repository/controller/routes.

Implement:

```text
GET /api/departments
GET /api/departments/:id
```

Verify both endpoints.

STOP.

---

### Task 2.4

Create role repository/controller/routes.

Implement:

```text
GET /api/roles
GET /api/roles/:id
```

Verify both endpoints.

STOP.

---

### Task 2.5

Create staff repository.

Implement database access for:

* all staff
* individual staff
* search
* department filtering
* role filtering
* status filtering
* combined filters

Verify SQL behavior.

STOP.

---

### Task 2.6

Create staff controller/routes.

Implement:

```text
GET /api/staff
GET /api/staff/:id
```

Verify:

* normal request
* search
* department filter
* role filter
* status filter
* combined filters
* invalid ID

STOP.

---

### Task 2.7

Implement centralized error handling.

Verify expected error responses.

STOP.

---

# PHASE 3 — FRONTEND

### Task 3.1

Build the main application shell.

Create:

* sidebar
* page header
* content area
* search area
* staff area

Use Tailwind CDN.

STOP.

---

### Task 3.2

Build sidebar.

Include appropriate directory navigation/branding.

Keep it visually clean.

STOP.

---

### Task 3.3

Build search and filter interface.

Include:

* Search
* Department
* Role
* Status
* Clear filters

STOP.

---

### Task 3.4

Build staff cards and responsive grid.

Use fictional/mock data temporarily if necessary.

Focus on visual quality.

STOP.

---

### Task 3.5

Add:

* loading state
* empty state
* error state

STOP.

---

### Task 3.6

Build staff profile modal.

Implement:

* open
* close
* Escape
* backdrop
* responsive behavior

STOP.

---

# PHASE 4 — INTEGRATION

### Task 4.1

Connect frontend API client to backend.

STOP.

---

### Task 4.2

Load departments and roles dynamically.

STOP.

---

### Task 4.3

Load real staff data from SQLite through the API.

Replace temporary/mock data.

STOP.

---

### Task 4.4

Connect search functionality.

Verify actual API results.

STOP.

---

### Task 4.5

Connect all filters.

Verify combined filtering.

STOP.

---

### Task 4.6

Implement clear/reset filters.

STOP.

---

### Task 4.7

Connect profile modal to real staff API data.

STOP.

---

### Task 4.8

Perform final visual polish.

Fix:

* spacing
* typography
* card hierarchy
* responsive issues
* hover states
* modal appearance
* loading states
* empty states
* filter layout
* sidebar behavior

Do not redesign the entire application.

STOP.

---

# 26. VISUAL QUALITY GATE

Before declaring the frontend complete, actually inspect the application in a browser if browser inspection is available.

Do not assume that code which technically works automatically looks good.

Check:

* Desktop appearance
* Mobile appearance
* Alignment
* Spacing
* Typography
* Card consistency
* Sidebar
* Search
* Filters
* Modal
* Empty state
* Loading state
* Overflow
* Console errors

If something visibly looks broken, fix it before moving forward.

---

# 27. FINAL QA

Before declaring the project finished, verify all of the following.

## Installation

* npm install works
* server starts
* database is created
* seed process works

## Backend

* `/api/health`
* `/api/staff`
* `/api/staff/:id`
* `/api/departments`
* `/api/departments/:id`
* `/api/roles`
* `/api/roles/:id`

## Search

Test:

* First name
* Last name
* Full name
* Email
* Job title
* No results

## Filters

Test:

* Department
* Role
* Status
* Search + Department
* Search + Role
* Department + Role
* Search + Department + Role

## UI

Test:

* Staff cards
* Profile modal
* Close button
* Escape key
* Backdrop
* Loading state
* Empty state
* Error state
* Clear filters

## Responsive

Test:

* Desktop
* Tablet
* Mobile

## Console

Check for:

* JavaScript errors
* Failed network requests
* Broken resources
* Unhandled promise errors

## Security

Check for:

* Unsafe SQL
* Exposed stack traces
* Obvious unsafe DOM insertion
* Secrets accidentally committed

---

# 28. RECOVERY RULE

If something breaks:

1. Identify the actual error.
2. Determine which file caused it.
3. Fix the smallest necessary part.
4. Re-test.
5. Do not rewrite the entire project.

Do not destroy working functionality just to solve a small issue.

If a previous implementation works, preserve it unless there is a clear reason to change it.

---

# 29. NO UNAUTHORIZED REDESIGN

Once the architecture and design direction are established:

* Do not randomly change the stack.
* Do not replace working architecture.
* Do not redesign unrelated components.
* Do not add frameworks.
* Do not change database technology.
* Do not introduce unnecessary dependencies.

If you think a change is necessary, explain why before making a major architectural change.

---

# 30. DEADLINE MODE

If you encounter a difficult issue and there are multiple technically valid solutions, choose the **simplest reliable solution** that satisfies the requirements.

Do not over-engineer.

The objective is:

```text
WORKING
+
POLISHED
+
RELIABLE
+
EASY TO EXPLAIN
```

not:

```text
MAXIMUM COMPLEXITY
```

---

# 31. GIT / CHECKPOINT RULE

If Git is available:

Create logical checkpoints after major phases.

Recommended checkpoints:

```text
Phase 1 complete
Phase 2 complete
Phase 3 complete
Phase 4 complete
Final QA complete
```

Do not make destructive changes without a recoverable checkpoint.

---

# 32. TASK EXECUTION RULE

This is extremely important.

You must execute **ONLY ONE TASK AT A TIME**.

For example:

If I say:

```text
Start Task 1.1
```

You perform ONLY Task 1.1.

You must:

1. Inspect the current project state.
2. Implement Task 1.1.
3. Run appropriate verification.
4. Fix any problems found.
5. Report the result.
6. STOP.

Do NOT automatically continue to Task 1.2.

Wait for my explicit confirmation.

---

# 33. DO NOT CLAIM SUCCESS WITHOUT VERIFICATION

Never say something is working simply because the code was written.

Actually verify it when possible.

If verification fails, report:

* What failed
* Where it failed
* The likely cause
* What was attempted
* Whether it was fixed

Do not hide errors.

---

# 34. DO NOT MODIFY UNRELATED FILES

When working on a task:

* Change only files relevant to that task.
* Avoid unnecessary refactoring.
* Preserve existing working functionality.

---

# 35. REQUIRED TASK COMPLETION FORMAT

After every task, respond using exactly this structure:

```text
TASK COMPLETED

Task: [Task Number + Task Name]

Implemented:
- [item]
- [item]
- [item]

Files changed:
- [file]
- [file]

Verification performed:
- [verification]
- [verification]

Verification result:
PASS

Known issues:
- None

Waiting for confirmation to continue to the next task.
```

If verification fails, use:

```text
VERIFICATION FAILED

Task: [Task Number + Task Name]

What failed:
- [exact failure]

Likely cause:
- [cause]

Attempted fix:
- [what was attempted]

Current status:
- BLOCKED

Waiting for instruction.
```

Do not continue to the next task after a failed verification.

---

# 36. FIRST COMMAND

You are now starting the project.

Do NOT build the entire project at once.

Your first responsibility is ONLY:

## TASK 1.1 — INITIALIZE THE PROJECT

Perform Task 1.1 now.

Verify it.

Then stop and wait for my confirmation.

Do not start Task 1.2.
Do not create the database schema yet.
Do not build the frontend yet.
Do not implement APIs yet.

Start with Task 1.1 only.
