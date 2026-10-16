const db = require('../database/db');
const dialect = require('../database/dialect');

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
      ${dialect.caseInsensitiveLike('s.first_name', '@search')}
      OR ${dialect.caseInsensitiveLike('s.last_name', '@search')}
      OR ${dialect.caseInsensitiveLike("(s.first_name || ' ' || s.last_name)", '@search')}
      OR ${dialect.caseInsensitiveLike('s.email', '@search')}
      OR ${dialect.caseInsensitiveLike('s.job_title', '@search')}
    )`;
}

function buildDepartmentClause(value, params) {
  params.department = value;
  return dialect.caseInsensitiveEquals('d.name', '@department');
}

function buildRoleClause(value, params) {
  params.role = value;
  return dialect.caseInsensitiveEquals('r.name', '@role');
}

function buildStatusClause(value, params) {
  params.status = value;
  return dialect.caseInsensitiveEquals('s.employment_status', '@status');
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

  const result = await db.query(BASE_SELECT + ' WHERE s.id = @id', { id: numericId });

  return mapRow(result.rows[0]);
}

const INSERT_STAFF = `
  INSERT INTO staff (
    first_name,
    last_name,
    email,
    phone,
    job_title,
    department_id,
    role_id,
    location,
    avatar_url,
    bio,
    employment_status
  )
  VALUES (
    @first_name,
    @last_name,
    @email,
    @phone,
    @job_title,
    @department_id,
    @role_id,
    @location,
    @avatar_url,
    @bio,
    @employment_status
  )
  RETURNING id
`;

/*
 * The schema's UNIQUE constraint on staff.email is case-sensitive, but the
 * directory treats an address as the person's identity. Comparing without
 * regard to case keeps two look-alike addresses from becoming two people.
 */
async function emailExists(email) {
  const result = await db.query(
    'SELECT id FROM staff WHERE ' + dialect.caseInsensitiveEquals('email', '@email'),
    { email: String(email) }
  );

  return result.rows.length > 0;
}

async function create(input) {
  const result = await db.query(INSERT_STAFF, {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    job_title: input.jobTitle,
    department_id: input.departmentId,
    role_id: input.roleId,
    location: input.location,
    avatar_url: input.avatarUrl,
    bio: input.bio,
    employment_status: input.employmentStatus
  });

  return result.rows[0].id;
}

async function countAll(filters) {
  const { where, params } = buildWhereClause(filters || {});

  const result = await db.query(
    `SELECT ${dialect.count('*')} AS total FROM staff s ` +
      'LEFT JOIN departments d ON s.department_id = d.id ' +
      'LEFT JOIN roles r ON s.role_id = r.id ' +
      where,
    params
  );

  return result.rows[0].total;
}

module.exports = {
  findAll,
  findById,
  countAll,
  emailExists,
  create
};
