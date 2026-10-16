const db = require('../database/db');

const SELECT_COLUMNS = `
  SELECT
    id,
    name,
    description,
    created_at
  FROM departments
`;

const DEFAULT_ORDER = 'ORDER BY name ASC';

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    created_at: row.created_at
  };
}

async function findAll() {
  const result = await db.query(SELECT_COLUMNS + ' ' + DEFAULT_ORDER);

  return result.rows.map(mapRow);
}

async function findById(id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }

  const result = await db.query(SELECT_COLUMNS + ' WHERE id = @id', { id: numericId });

  return mapRow(result.rows[0]);
}

module.exports = {
  findAll,
  findById
};
