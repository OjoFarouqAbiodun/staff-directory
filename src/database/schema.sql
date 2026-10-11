PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS departments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS staff (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  phone             TEXT,
  job_title         TEXT,
  department_id     INTEGER,
  role_id           INTEGER,
  location          TEXT,
  avatar_url        TEXT,
  bio               TEXT,
  employment_status TEXT NOT NULL DEFAULT 'Active',
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (department_id) REFERENCES departments (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (role_id) REFERENCES roles (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id         TEXT PRIMARY KEY,
  admin_id   INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (admin_id) REFERENCES admins (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS tasks (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  title               TEXT NOT NULL,
  description         TEXT,
  staff_id            INTEGER NOT NULL,
  priority            TEXT NOT NULL DEFAULT 'Medium',
  status              TEXT NOT NULL DEFAULT 'Pending',
  due_date            TEXT,
  created_by_admin_id INTEGER NOT NULL,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (staff_id) REFERENCES staff (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (created_by_admin_id) REFERENCES admins (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  CHECK (status IN ('Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff (department_id);
CREATE INDEX IF NOT EXISTS idx_staff_role_id ON staff (role_id);
CREATE INDEX IF NOT EXISTS idx_staff_employment_status ON staff (employment_status);
CREATE INDEX IF NOT EXISTS idx_staff_last_name ON staff (last_name);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_tasks_staff_id ON tasks (staff_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by_admin_id ON tasks (created_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date);
