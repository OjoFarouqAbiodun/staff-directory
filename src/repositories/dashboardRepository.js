const { getDatabase } = require('../database/db');

/*
 * The dashboard endpoint calculates every count at request time from the
 * current database; nothing is cached or stored. All queries are aggregate
 * reads — the staff/task overviews are two grouped counts per table and the
 * supporting lists are single queries with joins, so one request needs no
 * per-row queries (no N+1).
 */

/* Canonical labels, in display order, so zero counts are always present. */
const EMPLOYMENT_STATUS_ORDER = ['Active', 'On Leave', 'Inactive'];
const TASK_STATUS_ORDER = ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

/* Statuses that no longer demand action. */
const CLOSED_TASK_STATUSES = ['Completed', 'Cancelled'];

function countByGroup(rows) {
  return rows.reduce((counts, row) => {
    if (row && row.status && row.count !== undefined) {
      counts[row.status] = row.count;
    }

    return counts;
  }, {});
}

function getStaffSummary() {
  const db = getDatabase();

  const total = db.prepare('SELECT COUNT(*) AS count FROM staff').get().count;

  /*
   * Seed with the known statuses first (a status with zero members must read
   * zero, not be absent), then overlay whatever the database actually holds.
   */
  const counts = EMPLOYMENT_STATUS_ORDER.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  const rows = db
    .prepare(
      'SELECT employment_status AS status, COUNT(*) AS count FROM staff GROUP BY employment_status'
    )
    .all();

  Object.assign(counts, countByGroup(rows));

  return { total, by_status: counts };
}

function getTaskSummary() {
  const db = getDatabase();

  const total = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count;

  const counts = TASK_STATUS_ORDER.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  const rows = db.prepare('SELECT status, COUNT(*) AS count FROM tasks GROUP BY status').all();

  Object.assign(counts, countByGroup(rows));

  /*
   * Overdue means the due date is before today (SQLite's UTC date, matching
   * the stored YYYY-MM-DD format lexically) and the task is still open.
   */
  const overdue = db
    .prepare(
      `SELECT COUNT(*) AS count
         FROM tasks
        WHERE due_date IS NOT NULL
          AND due_date < date('now')
          AND status NOT IN ('Completed', 'Cancelled')`
    )
    .get().count;

  return { total, by_status: counts, overdue };
}

const TASK_LIST_SELECT = `
  SELECT
    t.id,
    t.title,
    t.status,
    t.priority,
    t.due_date,
    s.id AS staff_id,
    s.first_name AS staff_first_name,
    s.last_name AS staff_last_name
  FROM tasks t
  JOIN staff s ON t.staff_id = s.id
`;

function mapTaskRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    due_date: row.due_date,
    staff_id: row.staff_id,
    staff_full_name: (row.staff_first_name + ' ' + row.staff_last_name).trim()
  };
}

/* The most overdue first, newest first when several tasks share a date. */
function getOverdueTasks() {
  const db = getDatabase();

  const rows = db
    .prepare(
      `${TASK_LIST_SELECT}
        WHERE t.due_date IS NOT NULL
          AND t.due_date < date('now')
          AND t.status NOT IN ('Completed', 'Cancelled')
       ORDER BY t.due_date ASC, t.id DESC
       LIMIT 10`
    )
    .all();

  return rows.map(mapTaskRow).filter(Boolean);
}

/* The most recently updated first — the owner sees what changed last. */
function getRecentTasks() {
  const db = getDatabase();

  const rows = db
    .prepare(
      `${TASK_LIST_SELECT}
       ORDER BY t.updated_at DESC, t.id DESC
       LIMIT 5`
    )
    .all();

  return rows.map(mapTaskRow).filter(Boolean);
}

function getTopOpenStaff() {
  const db = getDatabase();

  const rows = db
    .prepare(
      `SELECT
         s.id AS staff_id,
         s.first_name,
         s.last_name,
         COUNT(t.id) AS open_tasks
       FROM staff s
       JOIN tasks t ON t.staff_id = s.id
           AND t.status NOT IN ('Completed', 'Cancelled')
       GROUP BY s.id
       ORDER BY open_tasks DESC, s.last_name ASC, s.first_name ASC
       LIMIT 5`
    )
    .all();

  return rows.map((row) => ({
    staff_id: row.staff_id,
    full_name: (row.first_name + ' ' + row.last_name).trim(),
    open_tasks: row.open_tasks
  }));
}

module.exports = {
  getStaffSummary,
  getTaskSummary,
  getOverdueTasks,
  getRecentTasks,
  getTopOpenStaff,
  CLOSED_TASK_STATUSES,
  EMPLOYMENT_STATUS_ORDER,
  TASK_STATUS_ORDER
};