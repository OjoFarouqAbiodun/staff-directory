const db = require('../database/db');
const dialect = require('../database/dialect');

/*
 * The tasks listing always joins the assigned staff member so that every
 * response carries the identification details without a second query per row.
 */
const BASE_SELECT = `
  SELECT
    t.id,
    t.title,
    t.description,
    t.staff_id,
    t.priority,
    t.status,
    t.due_date,
    t.created_by_admin_id,
    t.created_at,
    t.updated_at,
    s.first_name AS staff_first_name,
    s.last_name AS staff_last_name,
    s.email AS staff_email,
    s.job_title AS staff_job_title
  FROM tasks t
  JOIN staff s ON t.staff_id = s.id
`;

const DEFAULT_ORDER = 'ORDER BY t.created_at DESC, t.id DESC';

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    staff_id: row.staff_id,
    staff: {
      id: row.staff_id,
      first_name: row.staff_first_name,
      last_name: row.staff_last_name,
      full_name: (row.staff_first_name + ' ' + row.staff_last_name).trim(),
      email: row.staff_email,
      job_title: row.staff_job_title
    },
    priority: row.priority,
    status: row.status,
    due_date: row.due_date,
    created_by_admin_id: row.created_by_admin_id,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function buildWhereClause(filters) {
  const conditions = [];
  const params = {};

  if (filters.staffId !== undefined && filters.staffId !== null) {
    conditions.push('t.staff_id = @staff_id');
    params.staff_id = filters.staffId;
  }

  if (filters.status) {
    conditions.push('t.status = @status');
    params.status = filters.status;
  }

  if (filters.priority) {
    conditions.push('t.priority = @priority');
    params.priority = filters.priority;
  }

  return {
    where: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '',
    params
  };
}

async function findAll(filters) {
  const { where, params } = buildWhereClause(filters || {});
  const result = await db.query(BASE_SELECT + ' ' + where + ' ' + DEFAULT_ORDER, params);

  return result.rows.map(mapRow);
}

async function findById(id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }

  const result = await db.query(BASE_SELECT + ' WHERE t.id = @id', { id: numericId });

  return mapRow(result.rows[0]);
}

async function findByStaffId(staffId, status) {
  const params = { staff_id: staffId };
  let where = 'WHERE t.staff_id = @staff_id';

  if (status) {
    where += ' AND t.status = @status';
    params.status = status;
  }

  const result = await db.query(BASE_SELECT + ' ' + where + ' ' + DEFAULT_ORDER, params);

  return result.rows.map(mapRow);
}

const INSERT_TASK = `
  INSERT INTO tasks (
    title,
    description,
    staff_id,
    priority,
    status,
    due_date,
    created_by_admin_id
  )
  VALUES (
    @title,
    @description,
    @staff_id,
    @priority,
    @status,
    @due_date,
    @created_by_admin_id
  )
`;

async function create(input) {
  const result = await db.query(INSERT_TASK + ' RETURNING id', {
    title: input.title,
    description: input.description,
    staff_id: input.staffId,
    priority: input.priority,
    status: input.status,
    due_date: input.dueDate,
    created_by_admin_id: input.createdByAdminId
  });

  return result.rows[0].id;
}

async function updateStatus(id, status) {
  const result = await db.query(
    'UPDATE tasks SET status = @status, updated_at = ' + dialect.now + ' WHERE id = @id RETURNING id',
    { id: Number(id), status }
  );

  return result.rowCount;
}

async function update(id, input) {
  const sets = [];
  const params = { id: Number(id) };

  function setColumn(column, value) {
    sets.push(column + ' = @' + column);
    params[column] = value;
  }

  setColumn('title', input.title);
  setColumn('staff_id', input.staffId);

  if (input.priority !== undefined) {
    setColumn('priority', input.priority);
  }

  if (input.description !== undefined) {
    setColumn('description', input.description);
  }

  if (input.dueDate !== undefined) {
    setColumn('due_date', input.dueDate);
  }

  sets.push('updated_at = ' + dialect.now);

  const result = await db.query(
    'UPDATE tasks SET ' + sets.join(', ') + ' WHERE id = @id RETURNING id',
    params
  );

  return result.rowCount;
}

async function remove(id) {
  const result = await db.query('DELETE FROM tasks WHERE id = @id RETURNING id', {
    id: Number(id)
  });

  return result.rowCount;
}

module.exports = {
  findAll,
  findById,
  findByStaffId,
  create,
  updateStatus,
  update,
  remove
};
