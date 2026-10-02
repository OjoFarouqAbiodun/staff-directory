# Staff Directory Web Application

## 1. Project Description

This is a responsive staff directory web application developed as a SIWES project for
**Rids Cloud Digital Solution**.

It provides a single, centralized interface for browsing staff information, searching staff
records, filtering staff, and viewing detailed staff profiles, so that a colleague's contact
details, department, role and location can be found quickly instead of by asking around or
searching spreadsheets.

The application is a read-only directory. Staff information is read from a database through a
REST API and displayed in the browser; there is no data-entry interface.

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
- **Responsive desktop / tablet / mobile interface**
- **REST API** — the frontend reads all data from the backend over HTTP
- **SQLite database** — staff, departments and roles stored in a local SQLite file

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
| Database   | SQLite                            |
| DB driver  | better-sqlite3                    |
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
│   └── staff-directory.db          # SQLite database file (created by the seed script)
│
├── public/                         # Everything the browser downloads
│   ├── index.html                  # Page shell: sidebar, header, search, filters,
│   │                               # states, staff grid, profile modal
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
│           └── app.js              # Startup: initial load and module wiring
│
├── src/                            # Backend code
│   ├── app.js                      # Express app: static files, routes, error handling
│   ├── config/
│   │   └── config.js               # Port and database file location
│   ├── controllers/                # Handle HTTP requests, send JSON
│   │   ├── staffController.js
│   │   ├── departmentController.js
│   │   └── roleController.js
│   ├── database/
│   │   ├── db.js                   # Opens/creates the SQLite connection
│   │   ├── schema.sql              # Table definitions, keys and indexes
│   │   └── seed.js                 # Creates the schema and inserts sample data
│   ├── middleware/
│   │   ├── errorHandler.js         # Central error handling
│   │   └── notFound.js             # Handles unmatched routes
│   ├── repositories/               # All SQL queries live here
│   │   ├── staffRepository.js
│   │   ├── departmentRepository.js
│   │   └── roleRepository.js
│   └── routes/
│       ├── healthRoutes.js
│       ├── staffRoutes.js
│       ├── departmentRoutes.js
│       └── roleRoutes.js
│
├── .gitignore
├── package.json                    # Dependencies and npm scripts
├── package-lock.json               # Exact dependency versions
├── server.js                       # Server entry point
├── PROJECT_SPEC.md                 # Authoritative technical specification
└── README.md                       # This file
```

**Key folders and files**

- **`public/`** — the frontend. `index.html` holds the page structure; the five JavaScript
  files are loaded in order (`api.js` first, then `ui.js`, `filters.js`, `modal.js`, then
  `app.js`) and each has a single responsibility.
- **`src/`** — the backend, split into routes → controllers → repositories. Repositories are
  the only place where SQL is written.
- **`data/`** — holds the SQLite database. The database file is created automatically by the
  seed script, so it is not committed. Because SQLite runs in WAL mode, you may also see
  `staff-directory.db-wal` and `staff-directory.db-shm` files beside it while the server is
  running; these are normal and can be ignored.
- **`server.js`** — starts the Express application.
- **`PROJECT_SPEC.md`** — the authoritative technical specification this project was built against.

---

## 5. Requirements

You need:

- **Node.js** (which includes **npm**)

This project was developed and verified on **Node.js 24.20.0**. No minimum version is enforced
by the project, so use a currently supported Node.js release.

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

This downloads the dependencies listed in `package.json` — `express` and `better-sqlite3` for
running the application, and `nodemon` as a development dependency. It also regenerates
`node_modules/`, the folder that holds the installed packages.

After this finishes, continue to section 7 to create the database.

---

## 7. Database Setup

The application uses a single SQLite file at:

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

---

## 10. API Endpoints

The backend exposes seven read-only endpoints:

| Method | Endpoint             | Purpose               |
| ------ | -------------------- | --------------------- |
| GET    | /api/health          | API health check      |
| GET    | /api/staff           | Get/filter staff      |
| GET    | /api/staff/:id       | Get one staff profile |
| GET    | /api/departments     | Get departments       |
| GET    | /api/departments/:id | Get one department    |
| GET    | /api/roles           | Get roles             |
| GET    | /api/roles/:id       | Get one role          |

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

The database contains three tables.

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

### Relationships

```text
departments (1) ───< staff (M)
roles (1) ───< staff (M)
```

Each staff member belongs to exactly one department and holds exactly one role, so a department
or a role can be referenced by many staff members. These links are real foreign keys in the
schema, declared with `ON UPDATE CASCADE` and `ON DELETE RESTRICT`, and foreign-key enforcement
is switched on with `PRAGMA foreign_keys = ON`.

Indexes are created for the fields that are filtered and searched most often:
`department_id`, `role_id`, `employment_status` and `last_name`.

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

This is a student demonstration project on a local database with no authentication or access
control, so it is not hardened for public deployment.

---

## 14. Responsive Design

The layout is driven entirely by Tailwind's responsive breakpoints. The behaviour is:

- **Below 1024px** — the fixed sidebar is hidden and replaced by a compact mobile header, and the
  staff cards sit in a single column. The search box, filters and profile modal stay usable and
  nothing overflows horizontally.
- **From 640px** — the grid becomes two columns, so a tablet at 768px gets the two-column staff
  grid under the mobile header.
- **From 1024px** — the fixed left sidebar appears (staying in view while the directory scrolls)
  and the mobile header is replaced by the desktop page header.
- **From 1280px** — the grid grows to three columns, and from 1536px to four columns.

The profile modal is centered in the viewport, fits small screens, and can be dismissed with the
close button, the backdrop, or the Escape key.

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

### `npm run dev` / Nodemon

- It is supposed to keep running and watch your files; it is not going to return to the prompt.
  Press `Ctrl + C` to stop it.
- If you see `'nodemon' is not recognized`, the development dependency is not installed. Run
  `npm install` and try again.
- The application is at `http://localhost:3000`, not in the terminal.

### A page looks empty or shows a loading message that never finishes

That normally means the server is not running or the database has not been created. Check the
terminal running the server for errors, confirm the server was started, and re-run
`npm run db:init`.

---

## 16. SIWES Project Context

This project was developed as a SIWES attachment for **Rids Cloud Digital Solution**. It
demonstrates practical work across the following areas:

- **Frontend development** — semantic HTML, responsive layout, and vanilla JavaScript
- **Backend development** — a Node.js and Express.js web server organised into routes,
  controllers and repositories
- **REST API development** — seven documented endpoints with a consistent response format
- **Relational database design** — three related tables with keys, constraints, foreign keys and
  indexes in SQLite
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

- **Local SQLite database** — a single local file, not designed for multi-user or production
  scale.
- **Fictional sample data only** — 18 invented staff records; there is no real staff data.
- **No authentication or access control** — the directory is open to anyone who can reach the
  server.
- **No administrative interface** — there is no create, edit or delete functionality. The API and
  interface are read-only.
- **No production deployment** — the application is intended to be run locally; there is no
  hosting, deployment or production configuration.

Possible future directions (not implemented) would include authentication, an administrative
staff-management interface, role-based permissions, a hosted database, deployment to a hosting
platform, and audit logs.

---

## 18. License

The project metadata in `package.json` declares the license as `MIT`. No separate `LICENSE` file is
currently included in the repository, so this statement records the declared metadata only and does
not reproduce the full MIT license text.
