#!/usr/bin/env node
'use strict';

/*
 * Explicit, one-off SQLite -> PostgreSQL data migration.
 *
 * This is deliberately NOT wired into application startup. Run it by hand,
 * once, after the PostgreSQL target has been created and before pointing the
 * application at it:
 *
 *   DATABASE_URL=... node scripts/migrate-sqlite-to-postgres.js
 *
 * It copies the existing rows into PostgreSQL, preserving primary-key ids and
 * the stored admin password hash, then advances each identity sequence so
 * future inserts do not collide with the imported ids.
 *
 * Safety model:
 *   - The destination must be empty. If any target table already holds rows the
 *     import refuses to run, so it can never silently skip a row whose existing
 *     id contains different data, and it never overwrites or deletes records.
 *   - Rows are inserted with a plain INSERT inside one transaction. Any
 *     conflict (duplicate id or duplicate natural key) aborts the transaction
 *     and rolls back every change.
 *
 * Options:
 *   --dry-run           Report what would be copied without connecting.
 *   --verify            Read-only comparison of source and destination counts,
 *                       ids and natural keys. Writes nothing.
 *   --include-sessions  Also copy admin_sessions (skipped by default so every
 *                       administrator signs in again against the new store).
 *
 * The source file is read with better-sqlite3 in read-only mode; the SQLite
 * database and its backup are never modified. Credentials are never printed.
 */

const path = require('path');
const fs = require('fs');
const { X509Certificate } = require('crypto');

const { loadEnvFile } = require('../src/config/env');

/* The optional project-root .env; loaded before config reads process.env. */
const envFilePath = path.join(__dirname, '..', '.env');

loadEnvFile(envFilePath);

const config = require('../src/config/config');
const db = require('../src/database/db');
const { redactSecrets } = require('../src/database/poolErrors');
const { isMissingRelationError } = require('../src/database/errors');

/*
 * Insertion order follows the foreign-key graph: referenced tables first.
 * `timestamps` columns are converted to unambiguous UTC ISO strings so the
 * result does not depend on the target's session time zone. `naturalKeys` lists
 * a table's independent UNIQUE constraints, each as an array of columns, so
 * --verify checks every unique key separately. `identity` marks the tables whose
 * integer identity sequence must be realigned.
 */
const TABLES = [
  {
    name: 'departments',
    columns: ['id', 'name', 'description', 'created_at'],
    timestamps: ['created_at'],
    naturalKeys: [['name']],
    identity: true
  },
  {
    name: 'roles',
    columns: ['id', 'name', 'description', 'created_at'],
    timestamps: ['created_at'],
    naturalKeys: [['name']],
    identity: true
  },
  {
    name: 'admins',
    columns: ['id', 'username', 'email', 'password_hash', 'full_name', 'created_at', 'updated_at'],
    timestamps: ['created_at', 'updated_at'],
    naturalKeys: [['username'], ['email']],
    identity: true
  },
  {
    name: 'staff',
    columns: [
      'id',
      'first_name',
      'last_name',
      'email',
      'phone',
      'job_title',
      'department_id',
      'role_id',
      'location',
      'avatar_url',
      'bio',
      'employment_status',
      'created_at',
      'updated_at'
    ],
    timestamps: ['created_at', 'updated_at'],
    naturalKeys: [['email']],
    identity: true
  },
  {
    name: 'tasks',
    columns: [
      'id',
      'title',
      'description',
      'staff_id',
      'priority',
      'status',
      'due_date',
      'created_by_admin_id',
      'created_at',
      'updated_at'
    ],
    timestamps: ['created_at', 'updated_at'],
    naturalKeys: [],
    identity: true
  },
  {
    name: 'admin_sessions',
    columns: ['id', 'admin_id', 'expires_at', 'created_at'],
    timestamps: ['expires_at', 'created_at'],
    naturalKeys: [],
    identity: false,
    optional: true
  }
];

const MAX_LISTED_IDS = 20;

function printUsage() {
  console.log(
    'Usage: node scripts/migrate-sqlite-to-postgres.js [--dry-run] [--verify] [--include-sessions]'
  );
}

function parseArgs(argv) {
  const options = { dryRun: false, verify: false, includeSessions: false };

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verify') {
      options.verify = true;
    } else if (arg === '--include-sessions') {
      options.includeSessions = true;
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else {
      throw new Error('Unknown option: ' + arg);
    }
  }

  return options;
}

/*
 * Validate the PostgreSQL target before anything is read or printed. The
 * connection string itself is never included in an error message.
 */
function assertPostgresTarget() {
  if (config.databaseDriver !== 'postgres') {
    throw new Error('DATABASE_URL is not set; there is no PostgreSQL target to migrate into.');
  }

  let parsed;

  try {
    parsed = new URL(config.databaseUrl);
  } catch (error) {
    throw new Error('DATABASE_URL is not a valid URL.');
  }

  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use the postgres:// or postgresql:// scheme.');
  }

  try {
    require('pg');
  } catch (error) {
    throw new Error('The pg package is required for PostgreSQL but is not installed.');
  }
}

function openSqlite() {
  const Database = require('better-sqlite3');

  return new Database(config.dbFile, { readonly: true, fileMustExist: true });
}

function readRows(sqlite, table) {
  return sqlite.prepare(`SELECT ${table.columns.join(', ')} FROM ${table.name}`).all();
}

/*
 * SQLite stores instants as UTC 'YYYY-MM-DD HH:MM:SS'. Turn them into
 * 'YYYY-MM-DDTHH:MM:SSZ' so PostgreSQL interprets them as UTC regardless of
 * the connection's time zone. Values that already carry a zone are untouched.
 */
function toUtcInstant(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();

  if (text === '') {
    return null;
  }

  if (/[zZ]$/.test(text) || /[+-]\d{2}:?\d{2}$/.test(text)) {
    return text;
  }

  const normalized = text.includes('T') ? text : text.replace(' ', 'T');

  return normalized + 'Z';
}

/* Second precision, so a PostgreSQL millisecond timestamp matches SQLite. */
function toSecondPrecision(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(toUtcInstant(String(value)));

  if (Number.isNaN(date.getTime())) {
    return String(value).trim();
  }

  return date.toISOString().slice(0, 19) + 'Z';
}

function normalizeValue(column, value, table) {
  if (value === null || value === undefined) {
    return null;
  }

  if (table.timestamps.indexOf(column) !== -1 || value instanceof Date) {
    return toSecondPrecision(value);
  }

  return String(value);
}

function rowsDiffer(table, sourceRow, destinationRow) {
  for (const column of table.columns) {
    if (
      normalizeValue(column, sourceRow[column], table) !==
      normalizeValue(column, destinationRow[column], table)
    ) {
      return true;
    }
  }

  return false;
}

/*
 * A stable, internal representation of one unique key. The value is only ever
 * compared, never logged.
 */
function naturalKeyOf(columns, row) {
  if (!columns || columns.length === 0) {
    return null;
  }

  return columns
    .map((column) => {
      const value = row[column];
      return value === null || value === undefined ? '\u0000' : String(value);
    })
    .join('\u0001');
}

/*
 * Compare one table by primary key and by natural key. Returns only ids and
 * column names, so no personal data or password hashes leave this function.
 */
function findConflicts(table, sourceRows, destinationRows) {
  const destinationById = new Map();
  for (const row of destinationRows) {
    destinationById.set(String(row.id), row);
  }

  const sourceIds = new Set();
  const conflictingIds = [];
  const missingInDestination = [];

  for (const row of sourceRows) {
    const id = String(row.id);
    sourceIds.add(id);

    const destinationRow = destinationById.get(id);

    if (!destinationRow) {
      missingInDestination.push(row.id);
    } else if (rowsDiffer(table, row, destinationRow)) {
      conflictingIds.push(row.id);
    }
  }

  const extraInDestination = destinationRows
    .filter((row) => !sourceIds.has(String(row.id)))
    .map((row) => row.id);

  const keyCollisions = [];
  const keyDefinitions = table.naturalKeys || [];

  /*
   * Each entry is one independent UNIQUE constraint, so they are checked
   * separately: a source row that shares only its username (or only its email)
   * with a different destination id is still a collision.
   */
  for (const columns of keyDefinitions) {
    const destinationByKey = new Map();

    for (const row of destinationRows) {
      const key = naturalKeyOf(columns, row);
      if (key !== null) {
        destinationByKey.set(key, row);
      }
    }

    for (const row of sourceRows) {
      const key = naturalKeyOf(columns, row);
      if (key === null) {
        continue;
      }

      const destinationRow = destinationByKey.get(key);
      if (destinationRow && String(destinationRow.id) !== String(row.id)) {
        keyCollisions.push({
          key: columns.join('+'),
          sourceId: row.id,
          destinationId: destinationRow.id
        });
      }
    }
  }

  return { conflictingIds, missingInDestination, extraInDestination, keyCollisions };
}

function mapRow(table, row) {
  const params = {};

  for (const column of table.columns) {
    const value = row[column];
    params[column] = table.timestamps.indexOf(column) === -1 ? value : toUtcInstant(value);
  }

  return params;
}

/* Plain INSERT: a duplicate id or key must abort, never be silently skipped. */
function buildInsert(table) {
  const columns = table.columns.join(', ');
  const params = table.columns.map((column) => '@' + column).join(', ');

  return `INSERT INTO ${table.name} (${columns}) VALUES (${params})`;
}

function selectCountQuery(table) {
  return `SELECT COUNT(*)::int AS count FROM ${table.name}`;
}

function selectAllQuery(table) {
  return `SELECT ${table.columns.join(', ')} FROM ${table.name}`;
}

/*
 * Realign an identity sequence with the imported rows. The third argument to
 * setval() is false for an empty table, so the next generated id is 1.
 */
async function resetSequence(tx, tableName) {
  await tx.query(
    `SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) ` +
      `FROM ${tableName}`
  );
}

function assertDestinationEmpty(counts) {
  const nonEmpty = Object.keys(counts).filter((name) => Number(counts[name]) > 0);

  if (nonEmpty.length > 0) {
    throw new Error(
      'Refusing to import: destination table(s) already contain rows (' +
        nonEmpty.join(', ') +
        '). Run with --verify to compare source and destination, then import into an empty schema. ' +
        'No rows were changed.'
    );
  }
}

/* Count each target table with an injected query function (no live DB needed). */
async function checkDestinationEmpty(queryFn, tables) {
  const counts = {};

  for (const table of tables) {
    const result = await queryFn(selectCountQuery(table));
    counts[table.name] = Number(result.rows[0] ? result.rows[0].count : 0);
  }

  assertDestinationEmpty(counts);

  return counts;
}

/* Read-only comparison; the query function is injected so this is unit-testable. */
async function verifyDestination(queryFn, plan) {
  const report = [];

  for (const { table, rows } of plan) {
    let destinationRows;

    try {
      const result = await queryFn(selectAllQuery(table));
      destinationRows = result.rows;
    } catch (error) {
      /*
       * Only a genuinely absent relation is reported per table. Any other
       * failure (connection, TLS, authentication, permissions) is rethrown so
       * the run fails with the real cause instead of claiming every table is
       * missing.
       */
      if (!isMissingRelationError(error)) {
        throw error;
      }

      report.push({
        table: table.name,
        missingTable: true,
        sourceCount: rows.length,
        destinationCount: null,
        conflictingIds: [],
        missingInDestination: rows.map((row) => row.id),
        extraInDestination: [],
        keyCollisions: []
      });
      continue;
    }

    report.push(
      Object.assign(
        {
          table: table.name,
          missingTable: false,
          sourceCount: rows.length,
          destinationCount: destinationRows.length
        },
        findConflicts(table, rows, destinationRows)
      )
    );
  }

  return report;
}

function listIds(ids) {
  if (!ids || ids.length === 0) {
    return 'none';
  }

  const shown = ids.slice(0, MAX_LISTED_IDS).join(', ');

  return ids.length > MAX_LISTED_IDS ? shown + ' (+' + (ids.length - MAX_LISTED_IDS) + ' more)' : shown;
}

function reportHasProblems(report) {
  return report.some(
    (entry) =>
      entry.missingTable ||
      entry.conflictingIds.length > 0 ||
      entry.missingInDestination.length > 0 ||
      entry.extraInDestination.length > 0 ||
      entry.keyCollisions.length > 0
  );
}

/*
 * Render the verification report using ids and column names only. No row values
 * (and therefore no email addresses, names or password hashes) are printed.
 */
function formatVerifyReport(report) {
  const lines = [];

  for (const entry of report) {
    if (entry.missingTable) {
      lines.push(
        '  ' + entry.table + ': destination table missing (' + entry.sourceCount + ' source row(s) not compared)'
      );
      continue;
    }

    lines.push(
      '  ' + entry.table + ': source ' + entry.sourceCount + ' row(s), destination ' + entry.destinationCount + ' row(s)'
    );
    lines.push('    IDs in source but not in destination: ' + listIds(entry.missingInDestination));
    lines.push('    IDs in destination but not in source: ' + listIds(entry.extraInDestination));
    lines.push('    IDs in both with different values: ' + listIds(entry.conflictingIds));
    lines.push(
      '    Natural-key collisions (same key, different IDs): ' +
        (entry.keyCollisions.length === 0
          ? 'none'
          : entry.keyCollisions
              .slice(0, MAX_LISTED_IDS)
              .map((collision) => collision.key + ' source#' + collision.sourceId + ' vs destination#' + collision.destinationId)
              .join(', '))
    );
  }

  lines.push(
    reportHasProblems(report)
      ? 'Verification found differences. No records were modified.'
      : 'No conflicting IDs or natural-key collisions were found. No records were modified.'
  );

  return lines;
}

/*
 * Redact credentials and connection strings from a driver error before it is
 * printed. Reuses the pool redaction so a failed connection can never echo
 * DATABASE_URL or a password.
 */
function sanitizeMigrationError(error) {
  const raw = error && typeof error.message === 'string' ? error.message : String(error);
  return redactSecrets(raw);
}

/*
 * A short, non-secret summary of the effective TLS settings, printed before a
 * real connection. It confirms which CA (if any) will be used, so a missing or
 * mismatched DB_SSL_CA is visible up front instead of surfacing as an opaque
 * SELF_SIGNED_CERT_IN_CHAIN. Credentials and the connection string are never
 * included.
 */
function describeSslConfiguration() {
  let ca = 'not configured (set DB_SSL_CA or sslrootcert in DATABASE_URL)';

  if (config.databaseSslCaPath) {
    try {
      const pem = fs.readFileSync(config.databaseSslCaPath, 'utf8');
      const match = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);

      if (match) {
        const certificate = new X509Certificate(match[0]);
        /* The common name is the last line of the OpenSSL-style subject. */
        const commonName = certificate.subject.split('\n').pop();

        ca = commonName + ' (' + config.databaseSslCaPath + ')';
      } else {
        ca = 'configured but no PEM certificate found (' + config.databaseSslCaPath + ')';
      }
    } catch (error) {
      ca = 'configured but not readable (' + config.databaseSslCaPath + ')';
    }
  }

  /* Report only presence, never the value, of the .env file and the variables. */
  const envFile = fs.existsSync(envFilePath) ? 'present' : 'missing';
  const caEnvironment = process.env.DB_SSL_CA ? 'set' : 'unset';

  return 'TLS: mode=' + config.databaseSslMode + '; .env=' + envFile + '; DB_SSL_CA=' + caEnvironment + '; CA=' + ca;
}

function reportPlan(plan, options) {
  console.log('Source SQLite database: ' + config.dbFile);

  if (options.dryRun) {
    console.log('Dry run: no data will be written.');
  } else if (options.verify) {
    console.log('Verify: read-only comparison against PostgreSQL (DATABASE_URL); nothing will be written.');
  } else {
    console.log('Target: PostgreSQL (DATABASE_URL); the destination must be empty.');
  }

  for (const { table, rows } of plan) {
    console.log('  ' + table.name + ': ' + rows.length + ' row(s)');
  }

  if (!options.includeSessions) {
    console.log('  admin_sessions: skipped (use --include-sessions to copy)');
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  /* Validate the target before reading source data or printing the plan. */
  if (!options.dryRun) {
    assertPostgresTarget();
  }

  const sqlite = openSqlite();

  try {
    const plan = TABLES.filter((table) => !table.optional || options.includeSessions).map((table) => ({
      table,
      rows: readRows(sqlite, table)
    }));

    reportPlan(plan, options);

    if (options.dryRun) {
      return;
    }

    console.log(describeSslConfiguration());

    if (options.verify) {
      const report = await verifyDestination((text, params) => db.query(text, params), plan);

      for (const line of formatVerifyReport(report)) {
        console.log(line);
      }

      if (reportHasProblems(report)) {
        process.exitCode = 1;
      }

      return;
    }

    await db.initializeSchema();

    await checkDestinationEmpty(
      (text, params) => db.query(text, params),
      plan.map((entry) => entry.table)
    );

    const summary = await db.transaction(async (tx) => {
      const inserted = {};

      for (const { table, rows } of plan) {
        const insert = buildInsert(table);
        let count = 0;

        for (const row of rows) {
          const result = await tx.query(insert, mapRow(table, row));
          count += result.rowCount;
        }

        inserted[table.name] = count;
      }

      for (const { table } of plan) {
        if (table.identity) {
          await resetSequence(tx, table.name);
        }
      }

      return inserted;
    });

    console.log('Migration complete. Rows inserted:');

    for (const name of Object.keys(summary)) {
      console.log('  ' + name + ': ' + summary[name]);
    }
  } finally {
    sqlite.close();
  }
}

if (require.main === module) {
  run()
    .then(async () => {
      await db.close();
    })
    .catch(async (error) => {
      console.error('Migration failed: ' + sanitizeMigrationError(error));
      await db.close();
      process.exitCode = 1;
    });
}

module.exports = {
  TABLES,
  toUtcInstant,
  toSecondPrecision,
  mapRow,
  buildInsert,
  parseArgs,
  assertPostgresTarget,
  assertDestinationEmpty,
  checkDestinationEmpty,
  verifyDestination,
  findConflicts,
  rowsDiffer,
  naturalKeyOf,
  sanitizeMigrationError,
  formatVerifyReport,
  reportHasProblems,
  describeSslConfiguration
};
