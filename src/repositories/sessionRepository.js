const { getDatabase } = require('../database/db');

const SELECT_COLUMNS = `
  SELECT
    id,
    admin_id,
    expires_at,
    created_at
  FROM admin_sessions
`;

const INSERT_SESSION = `
  INSERT INTO admin_sessions (id, admin_id, expires_at)
  VALUES (@id, @admin_id, datetime('now', @modifier))
`;

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    admin_id: row.admin_id,
    expires_at: row.expires_at,
    created_at: row.created_at
  };
}

function create(sessionId, adminId, lifetimeDays) {
  const db = getDatabase();

  db.prepare(INSERT_SESSION).run({
    id: sessionId,
    admin_id: adminId,
    modifier: '+' + lifetimeDays + ' days'
  });

  return sessionId;
}

function findActive(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId) {
    return null;
  }

  const db = getDatabase();
  const row = db
    .prepare(SELECT_COLUMNS + ' WHERE id = @id AND expires_at > datetime(\'now\')')
    .get({ id: sessionId });

  return mapRow(row);
}

function remove(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId) {
    return 0;
  }

  const db = getDatabase();
  const info = db.prepare('DELETE FROM admin_sessions WHERE id = @id').run({ id: sessionId });

  return info.changes;
}

module.exports = {
  create,
  findActive,
  remove
};
