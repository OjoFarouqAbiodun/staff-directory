# STAFF DIRECTORY WEB APPLICATION

## OpenCode Master Prompt v2 — SIWES Project

You are the coding agent responsible for implementing this project.

Your job is to build the application **step-by-step**, verify each step, and stop after each task until I explicitly tell you to continue.

I am a beginner with limited programming knowledge, so **do not assume I understand undocumented decisions**. Keep the implementation simple, maintainable, and appropriate for a SIWES student project.

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
* Authentication systems
* Admin dashboards
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

* Login
* Registration
* Admin panel
* Staff creation/editing UI
* Staff deletion UI
* Authentication
* Authorization
* Pagination
* Deployment configuration
* Complex analytics
* Notifications
* Dark mode
* Unnecessary animations
* Unnecessary features

unless I explicitly request them later.

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
│   │   │   └── modal.js
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
│   │   └── roleController.js
│   ├── routes/
│   │   ├── staffRoutes.js
│   │   ├── departmentRoutes.js
│   │   └── roleRoutes.js
│   ├── repositories/
│   │   ├── staffRepository.js
│   │   ├── departmentRepository.js
│   │   └── roleRepository.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── notFound.js
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
    "dev": "nodemon server.js"
  }
}
```

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
