const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config/config');

function ensureDataDirectory(filePath) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

let db = null;

function getDatabase() {
  if (db) {
    return db;
  }

  ensureDataDirectory(config.dbFile);

  db = new Database(config.dbFile);

  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

function initializeSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  db.exec(schema);
}

module.exports = {
  getDatabase,
  closeDatabase,
  initializeSchema,
  dbFile: config.dbFile
};
