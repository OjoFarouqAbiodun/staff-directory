# Staff Directory Web Application

## 1. Project Description

This is a responsive staff directory web application developed as a SIWES project for
**Rids Cloud Digital Solution**.

It provides a single, centralized interface for browsing staff information, searching staff
records, filtering staff, and viewing detailed staff profiles, so that a colleague's contact
details, department, role and location can be found quickly instead of by asking around or
searching spreadsheets.

The directory itself is open to everyone: staff information is read from a database through a
REST API and displayed in the browser. A signed-in administrator can add staff members through a
protected endpoint and an Add Staff screen, manage tasks assigned to staff through an
administrator-only Tasks screen, and view an administrator-only Dashboard that summarises the
directory and current task workload from the live database; everything else in the interface
stays read-only.

> **Sample data:** all staff records currently in the database are **fictional**, created
> specifically for demonstration and testing. No real person's personal information is used.
> Sample email addresses use the reserved `.example` domain, which cannot receive real mail.

---

## 2. Features

The application currently provides:

- **Staff directory** — all staff listed as cards in a responsive grid
- **Staff profile cards** — avatar, full name, job title, department, role, location and
  employment status
- **Staff profile modal** — a detailed panel with large avatar, name, job title, department,
  role, email, phone, location, employment status and biography
- **Search** — debounced search across first name, last name, full name, email and job title
- **Department filtering** — filter the directory by department
- **Role filtering** — filter the directory by role
- **Employment-status filtering** — filter by Active, On Leave or Inactive
- **Combined filters** — search, department, role and status can be applied together
- **Clear/reset filters** — one button returns the directory to the full staff list
- **Loading state** — skeleton cards shown while data is being fetched
- **Empty state** — a clear "No staff members found" message when nothing matches
- **Error state with retry** — a friendly message with a "Try again" button if a request fails
- **Administrator sign in and sign up** — a Sign In screen and a Sign Up screen wired to the
  existing `/api/auth/*` endpoints, with visible labels, autocomplete, inline validation, loading
  and disabled states, and the backend's own error messages
- **Session detection on load** — the browser asks `/api/auth/me` at start-up and the navigation
  shows either **Sign In / Sign Up** or the signed-in administrator's identity and **Sign out**
- **Staff creation (administrators only)** — a signed-in administrator can add a staff member
  from a dedicated Add Staff screen; the new record appears in the directory immediately without
  a page reload, while visitors without a session never see or use the form
- **Task management API (administrators only)** — protected endpoints to create, list, filter,
  view, update, reassign, change the status of, and delete tasks assigned to staff members, with
  every task tracked to the administrator who created it
- **Task management screen (administrators only)** — a signed-in administrator can create and edit
  tasks, assign them to any staff member, change a task's status from the list, and delete a task
  after a confirmation that names it; visitors without a session never see or use the screen
- **Task filtering** — the task list filters by staff member, status and priority, combined or
  individually, with one click to clear them
- **Task status controls** — each task card carries its own status dropdown that updates the task
  through `PATCH /api/tasks/:id/status`; editing a task never changes its status (the edit form has
  no status field, matching the API contract)
- **Open the assigned staff profile** — the staff member's name on a task card opens the existing
  profile modal, so the task view reuses the directory's staff details panel
- **Dashboard (administrators only)** — a signed-in administrator sees summary cards for staff
  and task counts, an employment-status breakdown, a task-status breakdown, overdue workload,
  the staff members carrying the most open tasks, and the most recently updated tasks, all
  calculated from the live database at request time
- **Dashboard links into the app** — each summary card and breakdown row links to the directory
  or Tasks view with the matching filter already applied (for example **On Leave** opens the
  directory filtered to On Leave staff, and **Pending** opens the task list filtered to Pending)
- **Responsive desktop / tablet / mobile interface**
- **REST API** — the frontend reads all data from the backend over HTTP
- **Relational database** — six related tables (`departments`, `roles`, `staff`, `admins`,
  `admin_sessions`, `tasks`); PostgreSQL (Supabase) in production, SQLite for local development
  and tests

---

## 3. Technology Stack

Only the following technologies are used:

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Markup     | HTML5                             |
| Styling    | Tailwind CSS, loaded via CDN      |
| Frontend   | Vanilla JavaScript (no framework) |
| Runtime    | Node.js                           |
| Web server | Express.js                        |
| Database   | SQLite locally; PostgreSQL (Supabase) in production |
| DB driver  | better-sqlite3 (SQLite); pg (PostgreSQL)           |
| API style  | REST, using native browser `fetch()` |
| Dev server | Nodemon                           |

There is no front-end framework, no build step, no bundler, no ORM and no external runtime
dependency beyond Tailwind's CDN script. Frontend and backend code communicates only through
the REST API.

---

## 4. Project Structure

```text
staff-directory/
├── data/
│   └── staff-directory.db          # Local SQLite database (created by the seed script)
│
├── public/                         # Everything the browser downloads
│   ├── index.html                  # Page shell: sidebar, header, search, filters,
│   │                               # states, staff grid, add-staff and tasks views, modals
│   └── assets/
│       ├── css/
│       │   └── styles.css          # Small custom CSS on top of Tailwind
│       ├── images/
│       │   └── placeholders/
│       │       └── avatar.svg      # Placeholder avatar image
│       └── js/
│           ├── api.js              # API client: builds URLs, calls fetch(), handles errors
│           ├── ui.js               # Renders staff cards, filters and UI states
│           ├── filters.js          # Search/filter state and requests
│           ├── modal.js            # Profile modal open/close, focus and keyboard
│           ├── auth.js             # Sign-in/sign-up/session state and the view router
│           ├── staff-create.js     # Add Staff screen (form, validation, save)
│           ├── tasks.js            # Tasks screen (list, filters, dialogs, status, delete)
│           ├── dashboard.js        # Dashboard screen (summary, breakdowns, lists)
│           └── app.js              # Startup: initial load and module wiring
│
├── screenshots/                    # Evidence images used by SIWES_PROJECT_REPORT.md
│
├── src/                            # Backend code
│   ├── app.js                      # Express app: static files, routes, error handling
│   ├── config/
│   │   └── config.js               # Port and database file location
│   ├── controllers/                # Handle HTTP requests, send JSON
│   │   ├── staffController.js
│   │   ├── departmentController.js
│   │   ├── roleController.js
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── dashboardController.js
│   ├── database/
│   │   ├── db.js                   # Database facade (PostgreSQL or SQLite)
│   │   ├── schema.sql              # SQLite table definitions, keys and indexes
│   │   ├── schema.postgres.sql     # PostgreSQL table definitions, keys and indexes
│   │   └── seed.js                 # Creates the schema and inserts sample data
│   ├── middleware/
│   │   ├── authenticate.js         # 401 guard for session-protected routes
│   │   ├── errorHandler.js         # Central error handling
│   │   ├── notFound.js             # Handles unmatched routes
│   │   └── parseCookies.js         # Reads the cookie header into req.cookies
│   ├── repositories/               # All SQL queries live here
│   │   ├── staffRepository.js
│   │   ├── departmentRepository.js
│   │   ├── roleRepository.js
│   │   ├── adminRepository.js
│   │   ├── sessionRepository.js
│   │   ├── taskRepository.js
│   │   └── dashboardRepository.js
│   ├── routes/
│   │   ├── healthRoutes.js
│   │   ├── staffRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── roleRoutes.js
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/                   # Password hashing and session tokens
│   │   ├── passwordService.js      # scrypt hashing and constant-time comparison
│   │   └── sessionService.js       # Session create/resolve/end helpers
│   └── utils/
│       └── cookies.js              # Cookie parsing and Set-Cookie serialisation
│
├── scripts/
│   └── migrate-sqlite-to-postgres.js  # One-time SQLite -> PostgreSQL import (see section 8)
│
├── .gitignore
├── FRONTEND-CORE-RULES.md          # Reusable frontend engineering standard
├── PROJECT_SPEC.md                 # Authoritative technical specification
├── README.md                       # This file
├── SIWES_PROJECT_REPORT.md         # SIWES project report
├── package.json                    # Dependencies and npm scripts
├── package-lock.json               # Exact dependency versions
├── render.yaml                     # Render blueprint (historical only — see section 8)
└── server.js                       # Server entry point
```

**Key folders and files**

- **`public/`** — the frontend. `index.html` holds the page structure; the JavaScript modules are
  loaded in order (`api.js` first, then `ui.js`, `filters.js`, `modal.js`, `auth.js`,
  `staff-create.js`, `tasks.js`, `dashboard.js`, then `app.js`) and each has a single
  responsibility. The admin-only views (`account`, `dashboard`, `add-staff` and `tasks`) are
  gated by the router in `auth.js` and are only reached through a live administrator session.
- **`src/`** — the backend, split into routes → controllers → repositories, with cross-cutting
  helpers in `middleware/`, `services/` and `utils/`. Repositories are the only place where SQL is
  written.
- **`data/`** — holds the **local** SQLite database, created automatically by the seed script,
  so it is not committed. It is used for local development and the test suite only; a hosted
  deployment uses PostgreSQL instead (see section 8). Because SQLite runs in WAL mode, you may
  also see `staff-directory.db-wal` and `staff-directory.db-shm` files beside it while the
  server is running; these are normal and can be ignored.
- **`scripts/`** — `migrate-sqlite-to-postgres.js`, the one-time import that copies the local
  SQLite data into PostgreSQL. It is never run automatically.
- **`render.yaml`** — a Render Blueprint retained for **historical reference only**. It describes a
  **single** service and does **not** reproduce the live two-service deployment (see section 8). Do
  not apply or sync it to the existing Render services.
- **`certs/`** — an optional, git-ignored folder holding the Supabase CA certificate used to
  verify the database TLS certificate locally. On Render the same file is supplied as a secret
  file instead.
- **`screenshots/`** — the evidence images referenced by `SIWES_PROJECT_REPORT.md`.
- **`server.js`** — starts the Express application.
- **`PROJECT_SPEC.md`** — the authoritative technical specification this project was built against.

---

## 5. Requirements

You need:

- **Node.js 22 or newer** (which includes **npm**)

`package.json` declares `"engines": { "node": ">=22" }`. This project was developed and verified
on **Node.js 24.20.0**, so use a currently supported Node.js release.

Check your installation with:

```bash
node --version
npm --version
```

`better-sqlite3` is a native module. Most platforms install a prebuilt binary automatically; if
your platform has no prebuilt binary you will also need a C/C++ build toolchain (for example
Visual Studio Build Tools on Windows, or Xcode Command Line Tools on macOS).

---

## 6. Installation

From the project root:

```bash
npm install
```

This downloads the dependencies listed in `package.json` — `express`, `better-sqlite3` and
`pg` for running the application, and `nodemon` as a development dependency. It also regenerates
`node_modules/`, the folder that holds the installed packages.

After this finishes, continue to section 7 to create the database.

---

## 7. Database Setup

The application runs on one of two database engines, chosen automatically at startup:

- **SQLite** when `DATABASE_URL` is **not** set — the default for local development and the
  test suite. Everything below in this section applies to it.
- **PostgreSQL** when `DATABASE_URL` **is** set — the production database (Supabase). See
  section 8 for the hosted setup and the one-time data import.

The local application uses a single SQLite file at:

```text
data/staff-directory.db
```

The database is created automatically by the seed script — you do not need to create tables or
a database file by hand. Two npm scripts are available, and both run the same script
(`node src/database/seed.js`):

```bash
npm run db:init
```

```bash
npm run db:seed
```

Either command:

1. creates the `data/` folder and the database file if they do not exist,
2. applies `src/database/schema.sql` (tables, foreign keys and indexes), and
3. inserts the sample data.

The two names are equivalent; use whichever reads better. The script is **idempotent** — running
it repeatedly will not create duplicate records, so it is safe to re-run at any time. When it
finishes it prints the record counts, for example:

```text
Seed complete.
  departments: 6
  roles: 9
  staff: 18
```

The seeded data is **fictional sample data** for demonstration and testing: 6 departments,
9 roles and 18 staff members, all invented.

> **Which database does this touch?** `npm run db:init` and `npm run db:seed` operate on whichever
> database `DATABASE_URL` selects. The standalone seed script has **no production guard**: with
> `DATABASE_URL` set it targets the hosted PostgreSQL database. Use these commands for **local
> SQLite development only** — never run them against production (see Section 8).

---

## 8. Running the Application

Run the normal server:

```bash
npm start
```

Or run the development server:

```bash
npm run dev
```

The difference:

- **`npm start`** runs `node server.js` and stops when you stop it.
- **`npm run dev`** runs the same server through **Nodemon**, which watches your files and
  restarts the server automatically when you save a change. It is a **long-running development
  process**: it is expected to keep running, and it will not exit on its own. Stop it with
  `Ctrl + C` when you are finished.

Either way, once the server has started, open the application in your browser at:

```text
http://localhost:3000
```

The server listens on port 3000 by default. To use a different port, set the `PORT`
environment variable, for example `PORT=4000 npm start` (PowerShell:
`$env:PORT=4000; npm start`).

### Deploying to Render (PostgreSQL/Supabase)

> **Correction.** Earlier versions of this section (and of `render.yaml`) stated that the
> application runs as a **single** service with "no separate static site and no `/api` rewrite".
> That is **not** how the project is deployed. The **live deployment is two separate Render
> services**, and the static frontend reaches the backend through an `/api` rewrite configured in
> the Render dashboard. The text below has been corrected to match the verified deployment.

The project runs as **two separate Render services**:

| Service  | Render name                     | URL                                              | Role                                        |
| -------- | ------------------------------- | ------------------------------------------------ | ------------------------------------------- |
| Backend  | `staff-directory-gc6d`          | `https://staff-directory-gc6d.onrender.com`      | Express REST API on `/api/*` + PostgreSQL   |
| Frontend | `siwes-staff-directory-static`  | `https://siwes-staff-directory-static.onrender.com` | Static files from `public/`              |

The **frontend is a static site** that serves the files in `public/` and calls the backend at the
same origin under `/api/*`. The browser request is forwarded to the backend by an **`/api`
rewrite/proxy rule configured in the Render dashboard**. There is **no rewrite configuration in
this repository** (no `_redirects`, `netlify.toml`, `vercel.json` or similar file), so the exact
rule cannot be confirmed from source: **verify the rewrite in the Render dashboard** (frontend
service → Redirects/Rewrites) before changing anything. Do not assume the rule's exact form from
this document.

> **Do not apply or sync `render.yaml` to the existing services.** The Blueprint in this repository
> describes only a **single** service (named `staff-directory`, not the live
> `staff-directory-gc6d`) and does **not** reproduce the two-service topology. Applying or syncing
> it could create a **duplicate service** or alter the working deployment. It is retained for
> historical reference only. The live two-service topology has deliberately **not** been added to
> the Blueprint in this task.

In production the database is **PostgreSQL hosted by Supabase**, chosen automatically because
`DATABASE_URL` is set. Live records are stored in that managed database, **not** on the service's
own filesystem: there is **no persistent disk and no `DB_FILE`** on the host, and the Render
instance's local storage is not where the data lives. A managed database is expected to keep its
data independently of the application service, but **persistence across a restart or redeploy has
not been verified end-to-end for this deployment** and should be confirmed with a real restart test
before it is relied upon. If `DATABASE_URL` is missing while `NODE_ENV=production`, the server
**refuses to start** rather than silently falling back to an ephemeral SQLite file.

The **backend** service (`staff-directory-gc6d`) uses these build settings:

| Setting       | Value                                  |
| ------------- | -------------------------------------- |
| Runtime       | Node                                   |
| Build command | `npm ci`                               |
| Start command | `npm start`                            |
| Health check  | `/api/health`                          |
| Node version  | `NODE_VERSION=22` (the app needs >=22) |

#### Environment variables (Render Dashboard → service → Environment)

| Variable       | Value / source                                                                 |
| -------------- | ------------------------------------------------------------------------------ |
| `NODE_ENV`     | `production`                                                                   |
| `DATABASE_URL` | The Supabase **Session Pooler** connection string — a **secret**. Percent-encode reserved characters in the password. `render.yaml` marks it `sync: false`, so Render prompts for it and it is never committed. |
| `DB_SSL_CA`    | `/etc/secrets/supabase-root-ca.crt` (the secret file below)                    |

These variables belong to the **backend** service (`staff-directory-gc6d`). The **static frontend**
service needs no database variables — it only serves `public/` and forwards `/api/*` to the backend.

Leave `DB_SSL` unset: TLS is verified by default, and the driver ignores any TLS query parameters
inside `DATABASE_URL`, so `DB_SSL` / `DB_SSL_CA` are the single source of truth. Do **not** set
`DB_SSL=no-verify` or `DB_SSL=false` in production. Leave `SEED_ON_STARTUP` unset as well —
seeding is **off by default on PostgreSQL** so a first boot cannot populate the target before the
one-time import runs.

#### Providing the CA certificate as a Render secret file

Supabase presents a certificate signed by the **Supabase Root 2021 CA**. That certificate is a
public file, but it is not committed; on Render it is supplied as a **secret file**:

1. Keep the PEM locally (this project uses the git-ignored `certs/supabase-root-ca.crt`, named by
   `DB_SSL_CA` in the local `.env`).
2. In the Render Dashboard open the service, choose **Environment**, and under **Secret Files**
   click **+ Add Secret File**.
3. Name the file exactly `supabase-root-ca.crt` and paste its contents.
4. Save. Render mounts it at `/etc/secrets/supabase-root-ca.crt`, which is what `DB_SSL_CA`
   points at, so the database connection stays fully verified (`rejectUnauthorized: true`).

#### One-time data import

The tables are created automatically at startup, but the rows are not. The existing SQLite data is
copied into PostgreSQL **once, by hand**, with `scripts/migrate-sqlite-to-postgres.js`:

```bash
npm run db:migrate:pg -- --dry-run   # report what would be copied (no connection)
npm run db:migrate:pg -- --verify    # read-only comparison against DATABASE_URL
npm run db:migrate:pg                # the import itself — run once
```

The importer is deliberately **safe and one-shot**: the destination must be empty (it refuses to
run otherwise, so it can never overwrite or silently skip a row), every insert happens inside one
transaction that rolls back on any conflict, primary-key ids and the stored password hash are
preserved, and each identity sequence is advanced afterwards. `--include-sessions` also copies
`admin_sessions` (skipped by default so every administrator signs in again). Credentials are never
printed. Run `--verify`, then the import, before relying on the deployed service.

> **Run the import at most once.** `npm run db:migrate:pg` is a **one-time** import. Do **not**
> re-run it against the production database. The script refuses to run when the destination already
> contains rows, but treat re-running as forbidden regardless. Never run `npm run db:init` or
> `npm run db:seed`, and never set `SEED_ON_STARTUP`, against the production database — the
> standalone seed script has **no production guard** and writes the fictional sample data to
> whichever database `DATABASE_URL` selects. If you are unsure which database a command will touch,
> stop and confirm the engine first (Section 7).

#### Safe post-deployment verification (read-only)

After a deploy, verify the live services **without changing any data**:

1. `GET https://staff-directory-gc6d.onrender.com/api/health` returns HTTP 200.
2. The frontend loads at `https://siwes-staff-directory-static.onrender.com/` and lists staff —
   this is a `GET` only and modifies nothing.
3. The frontend's `/api/*` calls reach the backend (open the browser Network tab; responses come
   from the backend URL above).
4. Sign in with the **existing** administrator account. Do not reset, recreate or re-seed the
   password.
5. Confirm a trivial `GET /api/staff/1` returns a record.

Write operations (Add Staff, task changes) should be exercised only on a **throwaway** database, or
after the organization has authorized a test record in production. Data persistence across a
restart or redeploy has **not** been verified and must not be claimed as tested until a real
restart test is performed.

#### Backups, restore and rollback

- **Backups.** The Supabase project provides its own backup and point-in-time facilities — confirm
  the current schedule and retention in the Supabase dashboard. A manual logical backup can be
  taken with `pg_dump` against the Session Pooler using the same credentials, but run it
  **read-only** and never paste the dump or the connection string into documentation, chat or the
  repository.
- **Restore.** A restore **overwrites** existing data. It must only be attempted **with explicit
  authorization and a verified backup**, and ideally into a scratch project first. This repository
  contains **no** restore script; do not improvise one from these notes.
- **Rollback (application).** To roll back a bad deploy, redeploy the previous Render build (or the
  previous commit) from the Render dashboard. Rolling back the *application* does **not** undo
  database rows written after that build; coordinate the two if a schema change is involved.

#### Production troubleshooting

| Symptom | Likely cause / check |
| ------- | -------------------- |
| Backend will not start; log says it "refuses to start" | `DATABASE_URL` is missing while `NODE_ENV=production`. Set it on the **backend** service only. |
| `self-signed certificate in certificate chain` | The CA secret file is missing, or `DB_SSL_CA` does not point at `/etc/secrets/supabase-root-ca.crt`. Re-add the secret file (see above). |
| `password authentication failed` | Wrong or rotated database password, or reserved characters in `DATABASE_URL` that are not percent-encoded. Do not print the value while debugging. |
| Frontend loads but the directory shows errors | The `/api` rewrite is missing or points at the wrong backend. Confirm it in the Render dashboard — no repository file defines it. |
| Data appears to "reset" after a deploy | The backend is actually using SQLite, not PostgreSQL. Confirm `DATABASE_URL` is set on the backend service. |

---

## 9. Using the Application

1. Open `http://localhost:3000` in a browser. The directory loads automatically.
2. **Browse** — scroll through the staff cards. Each card shows a summary, and the count above
   the grid (for example "18 people") tells you how many staff match the current criteria.
3. **Search** — type into the search box. Results update shortly after you stop typing. Search
   matches first name, last name, full name, email, and job title.
4. **Filter** — use the Department, Role and Status dropdowns.
5. **Combine** — use search and any combination of dropdowns together. All active criteria are
   applied at once.
6. **Reset** — click **Clear filters** to return to the full directory.
7. **View a profile** — click any staff card to open a modal with that person's full details.
8. **Close the profile** — click the close button (top right of the panel), click outside the
   panel on the shaded backdrop, or press the **Escape** key. Focus returns to the card you
   clicked.

If a request fails, an error message appears with a **Try again** button, and the controls you
had selected are left untouched so you can retry without re-entering anything.

### Signing in and signing up

9. **Sign up** — open **Create account** in the sidebar (or **Sign up** in the mobile header),
   fill in your full name, username, email and a password of at least 8 characters, then submit.
   The account is created and you are signed in straight away, landing on the account view with
   no second sign-in step.
10. **Sign in** — open **Sign in** and enter your email and password. While a request is in
    progress the submit button is disabled and shows a loading label, and duplicate submissions
    are ignored. Once signed in, the **Sign In / Sign Up** links are replaced by your identity
    and a **Sign out** button.
11. **Your account** — the account view shows your full name, username and email. From here a
    signed-in administrator can **Dashboard**, **Add staff**, **Manage tasks** or browse the
    directory using the actions on the view.
12. **Add staff** — the **Add staff** action is available only while signed in, from the sidebar,
    the directory header and the account view. It opens a form with contact details, position and
    profile fields; department and role options come from the live backend endpoints. On a
    successful save you are returned to the directory, where a confirmation is announced and the
    new record is already on screen.
13. **Dashboard** — the **Dashboard** action is available only while signed in, from the
    sidebar, the directory header and the account view. It shows summary cards for total staff,
    active staff, total tasks and overdue tasks, staff counts by employment status, task counts by
    status, the current overdue workload, the staff members carrying the most open tasks, and the
    most recently updated tasks. Every number is recalculated from the database when the view is
    opened. Clicking a summary card or one of the breakdown rows jumps to the directory or the
    Tasks view with the matching filter already applied — for example **On Leave** opens the
    directory filtered to On Leave staff, and **Pending** opens the task list filtered to Pending
    tasks.
14. **Manage tasks** — the **Tasks** action is available only while signed in, from the sidebar,
    the directory header and the account view. The tasks view lists every task with its priority,
    status and due date. **New task** opens a form where you pick the assigned staff member,
    priority and due date; the task starts as **Pending**. Each card's status dropdown updates that
    task (status is never changed by editing). **Edit** reopens the form to change the title,
    assignment, priority, description or due date. **Delete** asks for confirmation by naming the
    task, and cancelling leaves it untouched. The staff member's name on a card opens the existing
    profile modal, and the list can be filtered by staff, status and priority (combined or on their
    own) and cleared with one button.
15. **Sign out** — use **Sign out** in the sidebar, the mobile header or the account view. The
    server ends the session first; if that request fails you remain signed in and a message
    explains what happened instead of the interface pretending you were signed out.

Sign in and sign up use the same navigation: `#signin`, `#signup`, `#account`, `#directory` and
the administrator-only `#dashboard`, `#add-staff` and `#tasks`. The server is the source of truth,
so the state is re-checked against `/api/auth/me` on every page load. Browsing, searching and
filtering the directory never requires an account.

---

## 10. API Endpoints

The backend exposes seven public read-only endpoints, three public authentication endpoints
(`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`), `GET /api/auth/me`
(session-protected), one administrator-protected staff-creation endpoint, seven
administrator-protected task-management endpoints and one administrator-protected dashboard
endpoint:

| Method | Endpoint             | Purpose               |
| ------ | -------------------- | --------------------- |
| GET    | /api/health          | API health check      |
| GET    | /api/staff           | Get/filter staff      |
| GET    | /api/staff/:id       | Get one staff profile |
| GET    | /api/departments     | Get departments       |
| GET    | /api/departments/:id | Get one department    |
| GET    | /api/roles           | Get roles             |
| GET    | /api/roles/:id       | Get one role          |

| Method | Endpoint            | Purpose                          |
| ------ | ------------------- | -------------------------------- |
| POST   | /api/auth/register  | Create an administrator account  |
| POST   | /api/auth/login     | Sign in and start a session      |
| POST   | /api/auth/logout    | End the current session          |
| GET    | /api/auth/me        | Get the signed-in administrator  |
| POST   | /api/staff          | Create a staff member (administrator session required) |

| Method | Endpoint                | Purpose                                               |
| ------ | ----------------------- | ----------------------------------------------------- |
| GET    | /api/tasks              | List or filter tasks (newest first)                   |
| GET    | /api/tasks/:id          | Get one task with its assigned staff details          |
| POST   | /api/tasks              | Create and assign a task                              |
| PATCH  | /api/tasks/:id/status   | Update only a task's status                           |
| PUT    | /api/tasks/:id          | Update a task's editable details                      |
| DELETE | /api/tasks/:id          | Delete a task                                         |
| GET    | /api/staff/:id/tasks    | List one staff member's tasks (administrator session required) |
| GET    | /api/admin/dashboard    | Staff/task summary and workload lists (administrator session required) |

The seven directory endpoints remain public and require no authentication. The `/api/auth/*`
endpoints are additive and need no cookie beyond the one they set themselves. Every task
endpoint, the `/api/staff/:id/tasks` sub-route and the dashboard endpoint require a valid
`admin_session` cookie and answer HTTP 401 without one, using the same authentication errors as
the auth endpoints. No existing endpoint changed its method, path or response shape.

All responses use the same JSON envelope. A successful response:

```json
{
  "success": true,
  "data": []
}
```

An error response:

```json
{
  "success": false,
  "error": {
    "message": "Staff member not found"
  }
}
```

### Administrator authentication

| Endpoint                  | Body                                        | Success                                                |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| `POST /api/auth/register` | `username`, `email`, `password`, `full_name` | 201 — creates the account and starts a session         |
| `POST /api/auth/login`    | `email`, `password`                         | 200 — starts a new session                             |
| `POST /api/auth/logout`   | none                                        | 200 — invalidates the session and clears the cookie    |
| `GET /api/auth/me`        | none                                        | 200 with `data.admin` = `id`, `username`, `email`, `full_name` |

Registration requires a username of 3–32 characters drawn from letters, numbers, `.`, `-` and `_`,
a password of 8–128 characters, a well-formed email address and a full name of 2–100 characters.
A duplicate username or a duplicate email is rejected with HTTP 409.

Authentication state is carried by an `admin_session` cookie that is `HttpOnly`, `SameSite=Lax`
and scoped to `Path=/`, expires after 7 days, and gains `Secure` when `NODE_ENV=production`.
Unknown, expired or already-logged-out sessions are rejected with HTTP 401, as is `/api/auth/me`
when no cookie is present. A failed login returns HTTP 401 with the single generic message
`Invalid email or password`, so responses never reveal whether an account exists.

### Creating staff

`POST /api/staff` creates a staff member and is one of the protected routes. It requires a
valid administrator session (the `admin_session` cookie); otherwise it answers HTTP 401 with the
same authentication errors the auth endpoints use.

| Field               | Required | Notes                                                                  |
| ------------------- | -------- | ---------------------------------------------------------------------- |
| `first_name`        | yes      | trimmed                                                                |
| `last_name`         | yes      | trimmed                                                                |
| `email`             | yes      | valid address, at most 254 characters, unique without regard to case   |
| `employment_status` | yes      | one of `Active`, `On Leave`, `Inactive`                                |
| `phone`             | no       | stored as `NULL` when empty                                            |
| `job_title`         | no       | stored as `NULL` when empty                                            |
| `department_id`     | no       | must exist in `departments` when supplied                              |
| `role_id`           | no       | must exist in `roles` when supplied                                    |
| `location`          | no       | stored as `NULL` when empty                                            |
| `avatar_url`        | no       | stored as `NULL` when empty                                            |
| `bio`               | no       | stored as `NULL` when empty                                            |

A successful request returns HTTP 201 with the created record in the same shape as
`GET /api/staff/:id` (including the resolved department and role names). A duplicate email is
rejected with HTTP 409; a malformed, non-numeric or non-existent `department_id` / `role_id` is
rejected with HTTP 400, as are missing required fields, an invalid email and an unsupported
employment status.

### Managing tasks

All task endpoints are administrator-only (the `admin_session` cookie is required; without it they
answer HTTP 401). Task responses carry the task fields together with a light summary of the
assigned staff member: `staff.id`, `staff.first_name`, `staff.last_name`, `staff.full_name`,
`staff.email` and `staff.job_title`. They never include passwords, hashes or session tokens.

`POST /api/tasks` creates and assigns a task:

| Field                | Required | Notes                                                                  |
| -------------------- | -------- | ---------------------------------------------------------------------- |
| `title`              | yes      | trimmed, at most 200 characters                                        |
| `description`        | no       | at most 2000 characters; stored as `NULL` when empty or omitted        |
| `staff_id`           | yes      | a valid, existing staff member id                                      |
| `priority`           | no       | `Low`, `Medium`, `High` or `Urgent`; defaults to `Medium`              |
| `status`             | no       | `Pending`, `In Progress`, `Completed`, `On Hold` or `Cancelled`; defaults to `Pending` |
| `due_date`           | no       | ISO `YYYY-MM-DD` and a real calendar date (rejects values such as `2026-02-30`) |

The creator is taken from the authenticated session and stored in `created_by_admin_id`; a
`created_by_admin_id` value in the request body is ignored. A successful request returns HTTP 201
with the created task.

`GET /api/tasks` lists tasks newest first and accepts optional `staff_id`, `status` and `priority`
filters. Filter values are validated — an invalid or non-existent staff id, status or priority is
rejected with HTTP 400 rather than silently ignored.

`PATCH /api/tasks/:id/status` accepts a body containing only the `status` field; any other field
is rejected with HTTP 400. `PUT /api/tasks/:id` updates `title`, `staff_id`, `priority`,
`description` and `due_date`. Optional fields are left unchanged when omitted (an explicitly empty
`description` or `due_date` clears it to `NULL`). `status` cannot be changed here — use the PATCH
endpoint. `DELETE /api/tasks/:id` deletes the task only; it never touches the staff member. All
four routes answer HTTP 404 `Task not found` for unknown tasks and HTTP 400 `Invalid task id` for
malformed ids.

`GET /api/staff/:id/tasks` lists exactly one staff member's tasks (newest first, optional `status`
filter); an unknown staff id returns HTTP 404 `Staff member not found`, and a staff member with no
tasks returns an empty list.

### Dashboard summary

`GET /api/admin/dashboard` is administrator-only (the `admin_session` cookie is required; without
it the answer is HTTP 401 with the standard authentication error). Every number is calculated from
the current database at request time — nothing is cached or stored — and the response carries only
counts, task titles, staff names and dates, never passwords, hashes or session tokens.

A successful response:

```json
{
  "success": true,
  "data": {
    "staff": {
      "total": 18,
      "by_status": { "Active": 14, "On Leave": 2, "Inactive": 2 }
    },
    "tasks": {
      "total": 5,
      "by_status": {
        "Pending": 2,
        "In Progress": 1,
        "Completed": 1,
        "On Hold": 1,
        "Cancelled": 0
      },
      "overdue": 1,
      "overdue_tasks": [],
      "recent_tasks": [],
      "top_open_staff": []
    }
  }
}
```

- `staff.total` and `staff.by_status` count all staff rows, grouped by employment status (zero
  counts are always present).
- `tasks.total` and `tasks.by_status` count all task rows, grouped by status (zero counts are
  always present).
- `tasks.overdue` counts tasks whose due date is **before today** (the database's current UTC
  date, compared against the stored `YYYY-MM-DD` due date) and whose status is neither `Completed`
  nor `Cancelled`. Tasks with no due date are never overdue.
- `tasks.overdue_tasks` lists up to ten of those tasks, most overdue first, each with `id`,
  `title`, `status`, `priority`, `due_date`, `staff_id` and `staff_full_name`.
- `tasks.top_open_staff` lists up to five staff members with the most open (not Completed, not
  Cancelled) tasks, ordered by open-task count descending.
- `tasks.recent_tasks` lists up to five tasks ordered by most recently updated, in the same row
  shape as `overdue_tasks`.

An empty database (no staff, no tasks) returns the same shape with all totals and counts at zero
and the three lists empty.

### Query parameters for `GET /api/staff`

| Parameter    | Description                                                             |
| ------------ | ----------------------------------------------------------------------- |
| `search`     | Matches staff first name, last name, full name, email, or job title      |
| `department` | Matches a department name, for example `Engineering`                     |
| `role`       | Matches a role name, for example `Team Lead`                            |
| `status`     | Matches an employment status: `Active`, `On Leave` or `Inactive`        |

All four are optional and are combined with AND when more than one is supplied. Results are
ordered by last name, then first name.

Example — search:

```text
/api/staff?search=amara
```

Example — combined search plus filters:

```text
/api/staff?search=a&department=Engineering&role=Team%20Lead&status=Active
```

Example — filter by department only:

```text
/api/staff?department=Engineering
```

Other examples:

```text
/api/health
/api/staff
/api/staff/4
/api/departments
/api/departments/1
/api/roles
/api/roles/1
```

---

## 11. Database Design

The database contains six tables.

**`departments`** — the departments staff belong to.

| Column       | Notes                          |
| ------------ | ------------------------------ |
| `id`         | Primary key                    |
| `name`       | Unique, required               |
| `description`|                                |
| `created_at` | Timestamp, set automatically   |

**`roles`** — the job roles staff hold.

| Column       | Notes                          |
| ------------ | ------------------------------ |
| `id`         | Primary key                    |
| `name`       | Unique, required               |
| `description`|                                |
| `created_at` | Timestamp, set automatically   |

**`staff`** — one row per staff member.

| Column             | Notes                                       |
| ------------------ | ------------------------------------------- |
| `id`               | Primary key                                 |
| `first_name`       | Required                                    |
| `last_name`        | Required                                    |
| `email`            | Unique, required                            |
| `phone`            |                                             |
| `job_title`        |                                             |
| `department_id`    | Foreign key → `departments.id`               |
| `role_id`          | Foreign key → `roles.id`                     |
| `location`         |                                             |
| `avatar_url`       | Path to the avatar image                    |
| `bio`              | Short biography                             |
| `employment_status`| Defaults to `Active`                        |
| `created_at`       | Timestamp, set automatically                |
| `updated_at`       | Timestamp, set automatically                |

**`admins`** — administrator accounts used by the backend authentication API.

| Column          | Notes                                                        |
| --------------- | ------------------------------------------------------------ |
| `id`            | Primary key                                                  |
| `username`      | Unique, required                                             |
| `email`         | Unique, required, stored in lowercase                        |
| `password_hash` | `crypto.scrypt` hash with a unique random salt — never a plaintext password |
| `full_name`     | Required                                                     |
| `created_at`    | Timestamp, set automatically                                 |
| `updated_at`    | Timestamp, set automatically                                 |

**`admin_sessions`** — one row per server-side session.

| Column       | Notes                                                 |
| ------------ | ----------------------------------------------------- |
| `id`         | Primary key; a random 256-bit session token, not a sequential id |
| `admin_id`   | Foreign key → `admins.id`                             |
| `expires_at` | Expiry timestamp, 7 days after creation               |
| `created_at` | Timestamp, set automatically                          |

**`tasks`** — one row per task assigned to a staff member.

| Column                | Notes                                                        |
| --------------------- | ------------------------------------------------------------ |
| `id`                  | Primary key                                                  |
| `title`               | Required, at most 200 characters                             |
| `description`         | Optional, at most 2000 characters                            |
| `staff_id`            | Foreign key → `staff.id`, required                           |
| `priority`            | Defaults to `Medium`; restricted to `Low`, `Medium`, `High`, `Urgent` by a `CHECK` constraint |
| `status`              | Defaults to `Pending`; restricted to `Pending`, `In Progress`, `Completed`, `On Hold`, `Cancelled` by a `CHECK` constraint |
| `due_date`            | Optional ISO `YYYY-MM-DD` date                               |
| `created_by_admin_id` | Foreign key → `admins.id`, required; set from the signed-in session |
| `created_at`          | Timestamp, set automatically                                 |
| `updated_at`          | Timestamp, set automatically                                 |

No administrator is seeded: the first account is created through `POST /api/auth/register`.

### Relationships

```text
departments (1) ───< staff (M)
roles (1) ───< staff (M)
admins (1) ───< admin_sessions (M)
staff (1) ───< tasks (M)
admins (1) ───< tasks (M)
```

Each staff member belongs to exactly one department and holds exactly one role, so a department
or a role can be referenced by many staff members, and each session belongs to exactly one
administrator. Each task is assigned to exactly one staff member and is created by exactly one
administrator. These links are real foreign keys in the schema, declared with `ON UPDATE CASCADE`
and `ON DELETE RESTRICT`, and foreign-key enforcement is switched on with `PRAGMA foreign_keys = ON`.

Indexes are created for the fields that are filtered and searched most often:
`department_id`, `role_id`, `employment_status` and `last_name`, plus `admin_id` and `expires_at`
on the sessions table, and `staff_id`, `status`, `created_by_admin_id` and `due_date` on the tasks
table. Username and email uniqueness are enforced by `UNIQUE` constraints, and the allowed task
priorities and statuses are additionally guarded by `CHECK` constraints.

---

## 12. Error Handling

- **Consistent responses.** Every API response uses the same shape: successful responses contain
  `success: true` and a `data` value, failures contain `success: false` and an `error.message`.
- **Validation and missing records.** A malformed staff id is rejected with `400`, and an id that
  does not exist returns `404` — both using the standard error shape.
- **Unknown routes.** Any unmatched `/api/...` path returns a `404` JSON error rather than an
  HTML error page, so the frontend can always parse the reply.
- **No stack traces to the browser.** Unexpected server errors are logged on the server and the
  client receives a generic message only.
- **Frontend states.** If a request fails, the user sees a plain-language error message with a
  **Try again** button — never a blank page or a raw technical error. If a filtered request
  fails, the filters the user had chosen stay selected and the previous results stay on screen,
  so nothing is lost. The initial load and filter requests each have their own retry behaviour.

---

## 13. Security and Code Quality

The following practices are actually implemented in this project:

- **Parameterized SQL.** All queries are prepared statements with bound parameters; user input is
  never concatenated into SQL.
- **Search input escaping.** `%`, `_` and `\` in the search term are escaped so a user typing
  those characters searches for them literally instead of changing the query.
- **Input validation.** Route parameters are checked for the expected integer format before use,
  and unknown query parameters are ignored.
- **Safe rendering in the browser.** All staff-supplied text is inserted with
  `textContent`/DOM APIs. The frontend never uses `innerHTML` with data, so staff text cannot
  be interpreted as HTML or script.
- **One network layer.** `fetch()` appears only in `api.js`; no other frontend file talks to the
  network.
- **No secrets in frontend code.** There are no API keys, tokens or credentials, and the
  frontend calls only same-origin relative paths.
- **Fictional sample data.** No real personal information is stored or displayed.
- **Password hashing.** Administrator passwords are stored only as `crypto.scrypt` hashes with a
  unique random salt per password, and verified with `crypto.timingSafeEqual`. No plaintext
  password is ever stored, logged or returned.
- **Server-side sessions.** Sign-in state lives in a random 256-bit token held in an `HttpOnly`,
  `SameSite=Lax` cookie (`Secure` when running in production), backed by the `admin_sessions`
  table with a 7-day expiry. Password hashes and session identifiers never appear in API
  responses, and login failures return one generic message so responses do not reveal whether an
  account exists.
- **The session token never reaches JavaScript.** Because the cookie is `HttpOnly`,
  `document.cookie` cannot read it. The browser never writes tokens, passwords or session
  identifiers to `localStorage`, `sessionStorage`, IndexedDB, or into a URL, and no credentials
  appear in log messages. The only administrator data held by the frontend is the safe `admin`
  object (id, username, email, full name), kept in memory for the current page load and
  re-fetched from `/api/auth/me` whenever the page is loaded again.

This is an educational student demonstration application. It does not include rate limiting or a
Content Security Policy, and the staff directory itself is still publicly readable, so it is not
hardened for public deployment.

---

## 14. Responsive Design

The layout is driven entirely by Tailwind's responsive breakpoints. The behaviour is:

- **Below 1024px** — the fixed sidebar is hidden and replaced by a compact mobile header, and the
  staff cards sit in a single column. The search box, filters and profile modal stay usable and
  nothing overflows horizontally. The compact header also carries the account actions (**Sign in**
  / **Sign up** when signed out, or the administrator's name and **Sign out** when signed in), so
  authentication stays reachable without the sidebar.
- **From 640px** — the grid becomes two columns, so a tablet at 768px gets the two-column staff
  grid under the mobile header.
- **From 1024px** — the fixed left sidebar appears (staying in view while the directory scrolls)
  and the mobile header is replaced by the desktop page header.
- **From 1280px** — the grid grows to three columns, and from 1536px to four columns.

The tasks view uses the same breakpoints: its task cards sit in a single column below 1024px and
two columns from 1024px up, the filter dropdowns stack on small screens, and each card wraps its
status control and buttons instead of overflowing. The dashboard uses the same system: its four
summary cards move from one column below 640px to two columns, then four from 1280px; the
breakdown panels and list panels sit side by side from 1024px and stack below that, with every
link and control keeping a touch-friendly target size. The Add Staff form, the profile modal and
the task dialogs are always centred in the viewport, fit small screens, and can be dismissed with
the close button, the backdrop, or the Escape key.

Layouts were checked during final QA at mobile (375px), tablet (768px) and desktop
(1440px) viewport widths in a Chromium-based browser. The breakpoints are defined with
Tailwind's responsive utilities, so behaviour at other widths follows the same rules, but only
those widths were explicitly inspected.

---

## 15. Troubleshooting

### Port 3000 already in use

Express reports `EADDRINUSE` when something else is already listening on port 3000 — most often
a previous copy of this server that is still running.

- If you started the server in a terminal, go back to it and press `Ctrl + C`, then start it
  again.
- If you are not sure whether a copy is still running, restart your computer or open a new
  terminal and use a different port: `PORT=4000 npm start` (PowerShell:
  `$env:PORT=4000; npm start`), then open `http://localhost:4000`.

### `npm install` problems

- Confirm Node.js and npm are installed and on your `PATH` with `node --version` and
  `npm --version`.
- Run `npm install` again from the project root — the folder that must contain `package.json`.
- If the install fails while building `better-sqlite3`, you need a build toolchain for your
  platform (see section 5).
- Run the command in a normal terminal. In PowerShell you may need to allow the script to run.

### The database is missing or the API returns an error

Run the seed script to create the database, schema and sample data:

```bash
npm run db:init
```

It is safe to run as many times as needed — existing rows are not duplicated. Check that
`data/staff-directory.db` exists afterwards.

> This advice is for the **local SQLite** database. The hosted deployment uses PostgreSQL and must
> **not** be re-seeded; see the warnings in Sections 7 and 8.

### `npm run dev` / Nodemon

- It is supposed to keep running and watch your files; it is not going to return to the prompt.
  Press `Ctrl + C` to stop it.
- If you see `'nodemon' is not recognized`, the development dependency is not installed. Run
  `npm install` and try again.
- The application is at `http://localhost:3000`, not in the terminal.

### A page looks empty or shows a loading message that never finishes

That normally means the server is not running. Check the terminal running the server for errors and
confirm the server was started. For a **local SQLite** setup the database is created and seeded
automatically at startup, so restarting the server normally restores it; `npm run db:init` can also
be run manually. In a **hosted deployment the data lives in the managed Supabase PostgreSQL
database**, separate from the application service's own filesystem, so it is not tied to the
ephemeral instance storage; end-to-end persistence across a restart or redeploy has **not yet been
tested** (see Section 8).

---

## 16. SIWES Project Context

This project was developed as a SIWES attachment for **Rids Cloud Digital Solution**. It
demonstrates practical work across the following areas:

- **Frontend development** — semantic HTML, responsive layout, and vanilla JavaScript
- **Backend development** — a Node.js and Express.js web server organised into routes,
  controllers and repositories
- **REST API development** — twenty documented endpoints (seven public directory endpoints,
  three public authentication endpoints, `GET /api/auth/me`, an administrator-protected staff-creation
  endpoint, seven administrator-protected task-management endpoints and one
  administrator-protected dashboard endpoint) with a consistent response format
- **Relational database design** — six related tables with keys, constraints, foreign keys,
  `CHECK` constraints and indexes, on a single SQL dialect across SQLite (local) and PostgreSQL
  (production)
- **Client-server communication** — the browser fetching data from the API and rendering it
  dynamically
- **Search and filtering** — debounced search plus three combinable filters, applied in SQL
- **Responsive interface development** — layouts and behaviour adapted for desktop, tablet and
  mobile
- **Software testing** — verification of API endpoints, search, filters, UI states, modal
  behaviour, accessibility, responsiveness and console cleanliness

---

## 17. Scope and Limitations

The project is a demonstration, and its current limitations are intentional:

- **SQLite locally, PostgreSQL in production** — the local development and test database is a
  single SQLite file; a hosted deployment uses PostgreSQL (Supabase), chosen automatically when
  `DATABASE_URL` is set.
- **Fictional sample data only** — 18 invented staff records; there is no real staff data.
- **Reading the directory is still open to everyone** — the staff directory and its `GET` API
  remain public; authentication is concentrated on the actions that change data. `POST
  /api/staff`, all seven task endpoints and the dashboard endpoint are administrator-only and
  answer HTTP 401 without a valid session.
- **Staff creation only so far** — the administrative interface can add staff members, but it
  cannot edit or delete them yet. Staff records created through the interface make the seed
  counts differ from the original 18 until the sample data is reset.
- **Local database can be reset on demand** — the local SQLite database is re-created and
  re-seeded by the seed script. In the hosted deployment, records live in the managed Supabase
  PostgreSQL database rather than on the service's filesystem, so they are not tied to an ephemeral
  instance; however, **persistence across a restart or redeploy has not been verified end-to-end**
  and should be confirmed by an actual restart test.

Possible future directions (not implemented) would include an administrative interface for
editing and deleting staff, role-based permissions, and audit logs.

---

## 18. License

The project metadata in `package.json` declares the license as `MIT`. No separate `LICENSE` file is
currently included in the repository, so this statement records the declared metadata only and does
not reproduce the full MIT license text.
