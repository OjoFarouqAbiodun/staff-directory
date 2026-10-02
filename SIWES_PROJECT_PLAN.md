# SIWES PROJECT PLAN

## 1. Project Title

Design and Implementation of a Web-Based Staff Directory System

## 2. Project Overview

The Staff Directory Web Application is a modern, web-based internal company directory designed to make staff information easily accessible to users within the organization. The system allows users to browse, search, and filter staff records through a clean, responsive interface. The purpose is to improve accessibility to accurate staff information by presenting it in a centralized, organized, and user-friendly manner that works across desktop, tablet, and mobile devices.

## 3. Problem Statement

Many organizations store staff information in disconnected records such as spreadsheets, paper files, or separate lists across departments. This makes it difficult to locate staff, verify roles or departments, and view complete staff profiles quickly. The lack of a centralized, searchable staff directory leads to time wasted searching for contacts, inconsistent information, and reduced efficiency in internal communication.

## 4. Aim of the Project

To design and implement a modern web-based staff directory system that centralizes staff information, enables efficient search and filtering, and presents staff profiles through a clean, responsive user interface.

## 5. Specific Objectives

The specific objectives of this project are to:

- Design and implement a relational database to store and manage staff, department, and role information.
- Develop a responsive frontend using HTML5, Tailwind CSS (via CDN), and Vanilla JavaScript.
- Develop a backend/API using Node.js and Express.js to serve staff, department, and role data.
- Implement staff search functionality covering first name, last name, full name, email, and job title.
- Implement department filtering to view staff by department.
- Implement role filtering to view staff by role.
- Implement employment-status filtering to view staff by Active/Inactive/On Leave status.
- Implement staff profile viewing through a detailed profile modal.
- Integrate the frontend with the backend via REST API and native browser `fetch()`.
- Test the system to verify search, filters, API endpoints, and overall functionality.

## 6. Scope of the Project

The system covers the following areas:

- Staff information (names, email, phone, job title, location, bio, avatar, employment status)
- Departments
- Roles
- Search and combined filtering
- Staff profiles
- REST API
- SQLite database
- Responsive web interface

**Features outside the current scope:**
- Authentication (login/registration, sessions, tokens)
- Payroll management
- Attendance tracking
- Leave management
- Recruitment
- Performance management
- Complex administration/HR workflows

## 7. Technologies Used

The project uses only the approved stack specified in `PROJECT_SPEC.md`:

- HTML5
- Tailwind CSS via CDN
- Vanilla JavaScript
- Node.js
- Express.js
- SQLite
- better-sqlite3

No additional frameworks, libraries, or technologies are introduced.

## 8. System Architecture

The planned system flow is:

User → Frontend (HTML/CSS/JS) → REST API → Express.js → SQLite → JSON response → Frontend

The frontend consumes API endpoints and renders staff cards, filters, and profiles dynamically.

## 9. Database Design

### Tables

#### departments
- id (primary key, integer)
- name (text, unique)
- description (text)
- created_at (text/timestamp)

#### roles
- id (primary key, integer)
- name (text, unique)
- description (text)
- created_at (text/timestamp)

#### staff
- id (primary key, integer)
- first_name (text)
- last_name (text)
- email (text, unique)
- phone (text)
- job_title (text)
- department_id (integer, FK → departments.id)
- role_id (integer, FK → roles.id)
- location (text)
- avatar_url (text)
- bio (text)
- employment_status (text, default 'Active')
- created_at (text/timestamp)
- updated_at (text/timestamp)

### Relationships
- Each staff member belongs to one department (staff.department_id → departments.id)
- Each staff member has one role (staff.role_id → roles.id)
- Foreign keys enabled with PRAGMA foreign_keys = ON; ON UPDATE CASCADE; ON DELETE RESTRICT

### Text-based ER Representation
```
departments (1) ───< staff (M)
roles (1) ───< staff (M)

departments(id PK, name UNIQUE, description, created_at)
roles(id PK, name UNIQUE, description, created_at)
staff(id PK, first_name, last_name, email UNIQUE, phone, job_title, department_id FK, role_id FK, location, avatar_url, bio, employment_status, created_at, updated_at)
```

## 10. Main System Features

- Staff directory with browsable staff cards
- Search by first name, last name, full name, email, and job title
- Department filter
- Role filter
- Employment-status filter
- Combined filtering (search + department + role + status)
- Staff profile modal with detailed information
- Responsive interface (desktop, tablet, mobile)
- Loading, empty, and error states

## 11. API Documentation Plan

Planned API endpoints (as specified in `PROJECT_SPEC.md`):
- GET /api/health
- GET /api/staff
- GET /api/staff/:id
- GET /api/departments
- GET /api/departments/:id
- GET /api/roles
- GET /api/roles/:id

No additional endpoints are planned.

## 12. Development Methodology

The project follows an incremental development process:
- Requirements/specification
- Database setup
- Backend development
- Frontend development
- Integration
- Testing
- Refinement
- Documentation

## 13. Testing Plan

| Test | Expected Result | Actual Result | Status |
|---|---|---|---|
| Application startup | Server starts successfully, serves frontend | The application started successfully under both `npm start` and `npm run dev`, listened on port 3000 and served the frontend at the root path. The npm dependency installation state was also confirmed valid. | PASS |
| Database initialization | DB file created and schema loaded | `data/staff-directory.db` was created and the schema applied correctly. `PRAGMA integrity_check` returned `ok`, foreign keys and WAL mode were enabled, and seeding produced 6 departments, 9 roles and 18 staff records with no orphaned references. | PASS |
| API health | /api/health returns success JSON | The endpoint returned HTTP 200 with the standard success envelope and an operational status value. | PASS |
| Staff retrieval | /api/staff returns list of staff | The endpoint returned HTTP 200 with all 18 staff records inside the success envelope, correctly ordered by last name then first name and including the related department and role names. | PASS |
| Individual staff retrieval | /api/staff/:id returns valid staff or error | A valid ID returned the corresponding staff record; a non-existent ID returned HTTP 404 and a malformed (non-numeric) ID returned HTTP 400, each using the standard error envelope. | PASS |
| Department retrieval | /api/departments returns list | The list endpoint returned HTTP 200 with all 6 departments, and the single-record endpoint returned the correct department for a valid ID, with 404 and 400 responses for invalid input. | PASS |
| Role retrieval | /api/roles returns list | The list endpoint returned HTTP 200 with all 9 roles, and the single-record endpoint returned the correct role for a valid ID, with 404 and 400 responses for invalid input. | PASS |
| Name search | Search finds staff by first/last/full name | The `search` parameter correctly matched staff on first name, last name and full name, and partial as well as case-insensitive terms returned the expected records. | PASS |
| Email search | Search finds staff by email | Supplying a complete email address returned exactly the matching staff record, and partial, case-insensitive input resolved to the same record. | PASS |
| Job-title search | Search finds staff by job title | Searching by job title returned all staff holding that title, confirming that job title is included among the searchable fields. | PASS |
| Department filtering | Results filtered by selected department | Selecting a department returned only staff belonging to that department, and the returned result set matched the staff count displayed in the interface. | PASS |
| Role filtering | Results filtered by selected role | Selecting a role returned only staff holding that role, and the returned result set matched the staff count displayed in the interface. | PASS |
| Status filtering | Results filtered by employment status | Filtering by employment status returned 14 Active, 2 On Leave and 2 Inactive staff respectively, matching the seeded status distribution, and status values were accepted case-insensitively. | PASS |
| Combined filtering | Multiple criteria apply together | Search, department, role and status filters applied simultaneously using AND semantics; each combination returned the expected intersection, and conflicting combinations (for example, a role outside the selected department) correctly returned an empty result set. The clear/reset control restored the full unfiltered list. | PASS |
| No-result state | Empty state shown with message | A query matching no records returned HTTP 200 with an empty data array, and the interface displayed the designated empty-state message with a count of 0 staff instead of a blank grid. | PASS |
| Profile modal | Modal opens with staff details and closes | Clicking a staff card opened the modal populated with that staff member's complete record from the API (name, job title, department, role, email, phone, location, employment status and bio). The modal closed correctly via the close button and the backdrop, with focus trapped while open and background scrolling locked. | PASS |
| Escape key | Escape key closes modal | Pressing the Escape key while the modal was open closed it and returned keyboard focus to the staff card that opened it. | PASS |
| Responsive behavior | Layout adapts to mobile/tablet/desktop | Layouts were verified at 375px (single-column grid with mobile header), 768px (two-column grid) and 1440px (three-column grid with sidebar). No horizontal overflow occurred at any width, and the profile modal fitted within the mobile viewport. | PASS |
| API error handling | Errors return structured JSON with appropriate status | Unknown API routes returned HTTP 404, invalid identifiers returned HTTP 400 and unexpected failures returned HTTP 500, all as structured JSON using the `{ success, error: { message } }` envelope. No stack traces were exposed to clients. | PASS |
| Browser console errors | No JavaScript errors in console | The browser console recorded zero JavaScript errors, uncaught exceptions, unhandled promise rejections or unexpected failed resource requests throughout the browser test run. | PASS |

Note on test numbering: this plan lists the tests as a single table of rows. The final report
restates the same executed checks under sequential identifiers `TC-01` through `TC-21`, because the
combined-filtering row above is presented there as two separately recorded cases (applying several
filters together, and clearing/resetting them). The underlying checks and outcomes are identical;
the difference is presentation only, and no additional test case was invented to reach either
count.

## 14. Evidence and Screenshot Checklist

- [x] Main directory (home view) — `screenshots/01-main-directory.png`
- [x] Search results — `screenshots/02-search-results.png`
- [x] Department filtering — `screenshots/03-department-filter.png`
- [x] Role filtering — `screenshots/04-role-filter.png`
- [x] Combined filters — `screenshots/05-combined-filters.png`
- [x] Staff profile (modal) — `screenshots/06-staff-profile-modal.png`
- [x] Empty state — `screenshots/07-empty-state.png`
- [ ] Responsive/mobile layout — no standalone screenshot was retained. Responsive behaviour was
      verified during final QA at 375px, 768px and 1440px (single-column grid with mobile header,
      two-column grid, and three-column grid with sidebar respectively, with no horizontal overflow);
      the result is recorded in the testing plan rather than as a separate image file.
- [x] API response (e.g. /api/staff) — `screenshots/09-api-response.png`
- [x] Database structure (schema/records) — `screenshots/10-database-structure.png`
- [x] Final application — `screenshots/11-final-application.png`

Supporting diagrams, completed and stored alongside the screenshots:

- [x] Entity-relationship diagram — `screenshots/12-er-diagram.png`
- [x] System architecture diagram — `screenshots/13-system-architecture.png`

## 15. Expected Project Outcome

A successfully completed system will provide a centralized, searchable, and responsive staff directory that allows users to browse staff, filter by department/role/status, search across relevant fields, and view detailed staff profiles. The system should be functional, polished, reliable, and easy to explain.

## 16. Project Limitations

- Uses a local SQLite database (not designed for multi-user production scale)
- Contains fictional/sample staff data only
- No authentication or access control
- No administrative management interface for CRUD operations
- No production deployment requirement

## 17. Future Improvements

These are future possibilities, not current requirements:
- Authentication and authorization
- Administrative staff management (create/edit/delete)
- Staff creation/editing UI
- Role-based permissions
- Cloud-hosted database
- Deployment to hosting platform
- Audit logs

## 18. SIWES Report Structure

Recommended structure for the final SIWES report:
- Introduction
- Background
- Problem Statement
- Aim and Objectives
- Scope
- Significance
- Requirements/System Analysis
- System Design
- Database Design
- Implementation
- Testing
- Results
- Limitations
- Conclusion
- Recommendations
- References

## 19. Final SIWES Completion Checklist

- [x] Application completed
- [x] Database working
- [x] API working
- [x] Frontend working
- [x] Search working
- [x] Filters working
- [x] Profile modal working
- [x] Responsive design working
- [x] Testing completed
- [x] Screenshots collected (all planned captures exist except the standalone responsive-layout
      screenshot, which is documented as not retained in section 14)
- [x] ER diagram completed
- [x] Architecture diagram completed
- [x] README completed
- [x] SIWES report completed
- [ ] Presentation prepared — not yet started; no slide deck or presentation file exists yet
- [x] Project successfully demonstrated (running system verified end to end against the API and the
      frontend, with evidence in `screenshots/09-api-response.png`,
      `screenshots/10-database-structure.png` and `screenshots/11-final-application.png`)
