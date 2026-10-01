const { getDatabase } = require('../database/db');

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

function findAll() {
  const db = getDatabase();
  const rows = db.prepare(SELECT_COLUMNS + ' ' + DEFAULT_ORDER).all();

  return rows.map(mapRow);
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

module.exports = {
  findAll,
  findById
};
