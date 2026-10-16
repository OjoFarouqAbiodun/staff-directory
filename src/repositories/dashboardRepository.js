const db = require('../database/db');
const dialect = require('../database/dialect');

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

async function getStaffSummary() {
  const totalResult = await db.query(`SELECT ${dialect.count('*')} AS count FROM staff`);
  const total = totalResult.rows[0].count;

  /*
   * Seed with the known statuses first (a status with zero members must read
   * zero, not be absent), then overlay whatever the database actually holds.
   */
  const counts = EMPLOYMENT_STATUS_ORDER.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  const result = await db.query(
    `SELECT employment_status AS status, ${dialect.count('*')} AS count ` +
      'FROM staff GROUP BY employment_status'
  );

  Object.assign(counts, countByGroup(result.rows));

  return { total, by_status: counts };
}

async function getTaskSummary() {
  const totalResult = await db.query(`SELECT ${dialect.count('*')} AS count FROM tasks`);
  const total = totalResult.rows[0].count;

  const counts = TASK_STATUS_ORDER.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  const grouped = await db.query(
    `SELECT status, ${dialect.count('*')} AS count FROM tasks GROUP BY status`
  );

  Object.assign(counts, countByGroup(grouped.rows));

  /*
   * Overdue means the due date is before today (the UTC date, matching the
   * stored YYYY-MM-DD format) and the task is still open.
   */
  const overdueResult = await db.query(
    `SELECT ${dialect.count('*')} AS count
       FROM tasks
      WHERE due_date IS NOT NULL
        AND due_date < ${dialect.currentDate}
        AND status NOT IN ('Completed', 'Cancelled')`
  );

  return { total, by_status: counts, overdue: overdueResult.rows[0].count };
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
async function getOverdueTasks() {
  const result = await db.query(
    `${TASK_LIST_SELECT}
      WHERE t.due_date IS NOT NULL
        AND t.due_date < ${dialect.currentDate}
        AND t.status NOT IN ('Completed', 'Cancelled')
      ORDER BY t.due_date ASC, t.id DESC
      LIMIT 10`
  );

  return result.rows.map(mapTaskRow).filter(Boolean);
}

/* The most recently updated first — the owner sees what changed last. */
async function getRecentTasks() {
  const result = await db.query(
    `${TASK_LIST_SELECT}
     ORDER BY t.updated_at DESC, t.id DESC
     LIMIT 5`
  );

  return result.rows.map(mapTaskRow).filter(Boolean);
}

async function getTopOpenStaff() {
  const result = await db.query(
    `SELECT
       s.id AS staff_id,
       s.first_name,
       s.last_name,
       ${dialect.count('t.id')} AS open_tasks
     FROM staff s
     JOIN tasks t ON t.staff_id = s.id
         AND t.status NOT IN ('Completed', 'Cancelled')
     GROUP BY s.id, s.first_name, s.last_name
     ORDER BY open_tasks DESC, s.last_name ASC, s.first_name ASC
     LIMIT 5`
  );

  return result.rows.map((row) => ({
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
