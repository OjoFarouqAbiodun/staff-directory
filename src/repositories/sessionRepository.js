const db = require('../database/db');
const dialect = require('../database/dialect');

const SELECT_COLUMNS = `
  SELECT
    id,
    admin_id,
    expires_at,
    created_at
  FROM admin_sessions
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

async function create(sessionId, adminId, lifetimeDays) {
  await db.query(
    'INSERT INTO admin_sessions (id, admin_id, expires_at) VALUES (@id, @admin_id, ' +
      dialect.sessionExpiry +
      ')',
    {
      id: sessionId,
      admin_id: adminId,
      lifetime_days: lifetimeDays
    }
  );

  return sessionId;
}

async function findActive(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId) {
    return null;
  }

  const result = await db.query(
    SELECT_COLUMNS + ' WHERE id = @id AND expires_at > ' + dialect.now,
    { id: sessionId }
  );

  return mapRow(result.rows[0]);
}

async function remove(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId) {
    return 0;
  }

  const result = await db.query('DELETE FROM admin_sessions WHERE id = @id RETURNING id', {
    id: sessionId
  });

  return result.rowCount;
}

module.exports = {
  create,
  findActive,
  remove
};
