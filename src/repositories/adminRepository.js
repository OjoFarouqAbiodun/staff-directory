const db = require('../database/db');
const dialect = require('../database/dialect');

const SELECT_COLUMNS = `
  SELECT
    id,
    username,
    email,
    full_name,
    created_at,
    updated_at
  FROM admins
`;

const SELECT_CREDENTIALS = `
  SELECT
    id,
    username,
    email,
    password_hash,
    full_name,
    created_at,
    updated_at
  FROM admins
`;

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    full_name: row.full_name,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function mapCredentials(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    full_name: row.full_name,
    password_hash: row.password_hash,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function findById(id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }

  const result = await db.query(SELECT_COLUMNS + ' WHERE id = @id', { id: numericId });

  return mapRow(result.rows[0]);
}

async function emailExists(email) {
  const result = await db.query('SELECT id FROM admins WHERE email = @email', { email });

  return result.rows.length > 0;
}

// Usernames are compared without case so that "Admin" and "admin" are
// rejected as the same account rather than creating two look-alike accounts.
async function usernameExists(username) {
  const result = await db.query(
    'SELECT id FROM admins WHERE ' + dialect.caseInsensitiveEquals('username', '@username'),
    { username }
  );

  return result.rows.length > 0;
}

async function findCredentialsByEmail(email) {
  const result = await db.query(SELECT_CREDENTIALS + ' WHERE email = @email', { email });

  return mapCredentials(result.rows[0]);
}

const INSERT_ADMIN = `
  INSERT INTO admins (
    username,
    email,
    password_hash,
    full_name
  ) VALUES (
    @username,
    @email,
    @password_hash,
    @full_name
  )
`;

async function create(admin) {
  const result = await db.query(INSERT_ADMIN + ' RETURNING id', {
    username: admin.username,
    email: admin.email,
    password_hash: admin.passwordHash,
    full_name: admin.fullName
  });

  return result.rows[0].id;
}

module.exports = {
  findById,
  emailExists,
  usernameExists,
  findCredentialsByEmail,
  create
};
