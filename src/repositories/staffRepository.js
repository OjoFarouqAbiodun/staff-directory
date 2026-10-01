const { getDatabase } = require('../database/db');

const BASE_SELECT = `
  SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.email,
    s.phone,
    s.job_title,
    s.department_id,
    s.role_id,
    s.location,
    s.avatar_url,
    s.bio,
    s.employment_status,
    s.created_at,
    s.updated_at,
    d.name AS department,
    r.name AS role
  FROM staff s
  LEFT JOIN departments d ON s.department_id = d.id
  LEFT JOIN roles r ON s.role_id = r.id
`;

const DEFAULT_ORDER = 'ORDER BY s.last_name ASC, s.first_name ASC';

function normalize(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

function escapeLikeTerm(value) {
  return value.replace(/[\\%_]/g, (character) => '\\' + character);
}

function buildSearchClause(term, params) {
  params.search = '%' + escapeLikeTerm(term) + '%';

  return `(
      s.first_name LIKE @search ESCAPE '\\'
      OR s.last_name LIKE @search ESCAPE '\\'
      OR (s.first_name || ' ' || s.last_name) LIKE @search ESCAPE '\\'
      OR s.email LIKE @search ESCAPE '\\'
      OR s.job_title LIKE @search ESCAPE '\\'
    )`;
}

function buildDepartmentClause(value, params) {
  params.department = value;
  return 'd.name = @department COLLATE NOCASE';
}

function buildRoleClause(value, params) {
  params.role = value;
  return 'r.name = @role COLLATE NOCASE';
}

function buildStatusClause(value, params) {
  params.status = value;
  return 's.employment_status = @status COLLATE NOCASE';
}

function buildWhereClause(filters) {
  const conditions = [];
  const params = {};

  const search = normalize(filters.search);
  if (search) {
    conditions.push(buildSearchClause(search, params));
  }

  const department = normalize(filters.department);
  if (department) {
    conditions.push(buildDepartmentClause(department, params));
  }

  const role = normalize(filters.role);
  if (role) {
    conditions.push(buildRoleClause(role, params));
  }

  const status = normalize(filters.status);
  if (status) {
    conditions.push(buildStatusClause(status, params));
  }

  return {
    where: conditions.length ? 'WHERE ' + conditions.join(' AND ') : '',
    params
  };
}

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    full_name: (row.first_name + ' ' + row.last_name).trim(),
    email: row.email,
    phone: row.phone,
    job_title: row.job_title,
    department_id: row.department_id,
    department: row.department,
    role_id: row.role_id,
    role: row.role,
    location: row.location,
    avatar_url: row.avatar_url,
    bio: row.bio,
    employment_status: row.employment_status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function findAll(filters) {
  const db = getDatabase();
  const { where, params } = buildWhereClause(filters || {});

  const rows = db.prepare(BASE_SELECT + ' ' + where + ' ' + DEFAULT_ORDER).all(params);

  return rows.map(mapRow);
}

function findById(id) {
  const db = getDatabase();
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }

  const row = db.prepare(BASE_SELECT + ' WHERE s.id = @id').get({ id: numericId });

  return mapRow(row);
}

function countAll(filters) {
  const db = getDatabase();
  const { where, params } = buildWhereClause(filters || {});

  const row = db
    .prepare(
      'SELECT COUNT(*) AS total FROM staff s ' +
        'LEFT JOIN departments d ON s.department_id = d.id ' +
        'LEFT JOIN roles r ON s.role_id = r.id ' +
        where
    )
    .get(params);

  return row.total;
}

module.exports = {
  findAll,
  findById,
  countAll
};
