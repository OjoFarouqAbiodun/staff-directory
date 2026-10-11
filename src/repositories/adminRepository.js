const { getDatabase } = require('../database/db');

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
    full_name,
    password_hash,
    created_at,
    updated_at
  FROM admins
`;

const INSERT_ADMIN = `
  INSERT INTO admins (username, email, password_hash, full_name)
  VALUES (@username, @email, @password_hash, @full_name)
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

  return Object.assign(mapRow(row), { password_hash: row.password_hash });
}

function findById(id) {
  const db = getDatabase();
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }

  const row = db.prepare(SELECT_COLUMNS + ' WHERE id = @id').get({ id: numericId });

  return mapRow(row);
}

function emailExists(email) {
  const db = getDatabase();
  const row = db.prepare('SELECT id FROM admins WHERE email = @email').get({ email });

  return Boolean(row);
}

// Usernames are compared without case so that "Admin" and "admin" are
// rejected as the same account rather than creating two look-alike accounts.
function usernameExists(username) {
  const db = getDatabase();
  const row = db
    .prepare('SELECT id FROM admins WHERE username = @username COLLATE NOCASE')
    .get({ username });

  return Boolean(row);
}

function findCredentialsByEmail(email) {
  const db = getDatabase();
  const row = db.prepare(SELECT_CREDENTIALS + ' WHERE email = @email').get({ email });

  return mapCredentials(row);
}

function create(admin) {
  const db = getDatabase();
  const info = db.prepare(INSERT_ADMIN).run({
    username: admin.username,
    email: admin.email,
    password_hash: admin.passwordHash,
    full_name: admin.fullName
  });

  return Number(info.lastInsertRowid);
}

module.exports = {
  findById,
  emailExists,
  usernameExists,
  findCredentialsByEmail,
  create
};
