const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const { normalizeParams, toPostgresQuery } = require('./params');
const { attachPoolErrorHandler } = require('./poolErrors');
const { buildSslOptions, stripSslUrlParameters } = require('../config/ssl');

/*
 * One asynchronous database facade over two engines:
 *
 *   - PostgreSQL (pg.Pool) when DATABASE_URL is configured — Render/Supabase.
 *   - SQLite (better-sqlite3) otherwise — local development and tests.
 *
 * Repositories express their SQL once, using @name placeholders, and call
 * query()/transaction() here. The PostgreSQL branch rewrites @name to the
 * positional $1..$n form node-postgres expects and collects the argument
 * values; the SQLite branch hands the named object straight to better-sqlite3.
 *
 * Every exported function is asynchronous, so the rest of the application is
 * written as if PostgreSQL were always in use. The SQLite engine simply
 * resolves immediately, which keeps local development and the tests fast.
 */

const DRIVER = config.databaseDriver;
const POSTGRES = DRIVER === 'postgres';

function ensureDataDirectory(filePath) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

/* ------------------------------------------------------------------ SQLite */

let sqlite = null;

function getSqlite() {
  if (sqlite) {
    return sqlite;
  }

  const Database = require('better-sqlite3');

  ensureDataDirectory(config.dbFile);

  sqlite = new Database(config.dbFile);
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('journal_mode = WAL');

  return sqlite;
}

function querySqlite(text, params) {
  const statement = getSqlite().prepare(text);
  const bound = normalizeParams(params);

  /*
   * RETURNING (used by every write that needs an id or a row count) makes a
   * statement a reader; other statements report their change count instead.
   */
  if (statement.reader) {
    const rows = statement.all(bound);
    return { rows, rowCount: rows.length };
  }

  const info = statement.run(bound);
  return { rows: [], rowCount: info.changes };
}

/* -------------------------------------------------------------- PostgreSQL */

let pg = null;
let pool = null;

function getPg() {
  if (!pg) {
    pg = require('pg');

    /*
     * Keep DATE columns (tasks.due_date) as 'YYYY-MM-DD' strings. By default
     * node-postgres turns them into JS Date objects at local midnight, which
     * can shift the day once serialised to JSON.
     */
    pg.types.setTypeParser(1082, (value) => value);
  }

  return pg;
}

function readSslCa() {
  if (!config.databaseSslCaPath) {
    return null;
  }

  try {
    return fs.readFileSync(config.databaseSslCaPath, 'utf8');
  } catch (error) {
    /* The path is deliberately not included: it may identify the deployment. */
    throw new Error('Unable to read the CA file configured by DB_SSL_CA.');
  }
}

function getPool() {
  if (pool) {
    return pool;
  }

  const { Pool } = getPg();

  pool = new Pool({
    /*
     * node-postgres parses connectionString and merges the result over these
     * options, so a sslmode/sslrootcert parameter in DATABASE_URL would replace
     * the verified ssl value below (dropping the CA). Strip those parameters so
     * DB_SSL and DB_SSL_CA stay authoritative.
     */
    connectionString: stripSslUrlParameters(config.databaseUrl),
    ssl: buildSslOptions(config.databaseSslMode, readSslCa()),
    statement_timeout: config.databaseStatementTimeoutMs,
    max: Number(process.env.PG_POOL_MAX) || 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  /*
   * An error on an idle pooled connection would otherwise be an unhandled
   * 'error' event and crash the process. The handler logs a sanitised message
   * that can never contain the connection string or its password.
   */
  attachPoolErrorHandler(pool, (message) => console.error(message));

  return pool;
}

async function queryPostgres(text, params) {
  const { sql, values } = toPostgresQuery(text, params);
  const result = await getPool().query(sql, values);
  return { rows: result.rows, rowCount: result.rowCount };
}

/* ---------------------------------------------------------------- Facade */

async function query(text, params) {
  if (POSTGRES) {
    return queryPostgres(text, params);
  }

  return querySqlite(text, params);
}

/*
 * Run `work` inside a transaction. The callback receives { query } bound to the
 * same connection so every statement joins the transaction. PostgreSQL uses a
 * dedicated client; SQLite wraps the work in BEGIN/COMMIT on its connection.
 */
async function transaction(work) {
  if (POSTGRES) {
    const client = await getPool().connect();

    try {
      await client.query('BEGIN');

      const runOnConnection = (text, params) => {
        const { sql, values } = toPostgresQuery(text, params);
        return client.query(sql, values).then((result) => ({
          rows: result.rows,
          rowCount: result.rowCount
        }));
      };

      const result = await work({ query: runOnConnection });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        /* The original failure is the one worth reporting. */
      }
      throw error;
    } finally {
      client.release();
    }
  }

  const database = getSqlite();
  database.exec('BEGIN');

  try {
    const result = await work({ query: querySqlite });
    database.exec('COMMIT');
    return result;
  } catch (error) {
    try {
      database.exec('ROLLBACK');
    } catch (rollbackError) {
      /* The original failure is the one worth reporting. */
    }
    throw error;
  }
}

async function initializeSchema() {
  const schemaFile = POSTGRES ? 'schema.postgres.sql' : 'schema.sql';
  const schema = fs.readFileSync(path.join(__dirname, schemaFile), 'utf8');

  if (POSTGRES) {
    await getPool().query(schema);
    return;
  }

  getSqlite().exec(schema);
}

async function close() {
  if (pool) {
    const current = pool;
    pool = null;
    await current.end();
  }

  if (sqlite) {
    sqlite.close();
    sqlite = null;
  }
}

module.exports = {
  driver: DRIVER,
  query,
  transaction,
  initializeSchema,
  close
};
