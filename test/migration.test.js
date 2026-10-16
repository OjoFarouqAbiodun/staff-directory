const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const test = require('node:test');
const assert = require('node:assert/strict');

/*
 * The migration utility tests never touch PostgreSQL. They exercise the
 * SQLite-reading side (timestamp conversion, row mapping, CLI dry run) and do
 * not require DATABASE_URL or open a network connection.
 */
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'staff-directory-migration-'));
process.env.DB_FILE = path.join(tempDir, 'source.db');
delete process.env.DATABASE_URL;

const db = require('../src/database/db');
const { seedDatabase } = require('../src/database/seed');
const migration = require('../scripts/migrate-sqlite-to-postgres');

test('toUtcInstant normalises SQLite timestamps to unambiguous UTC', () => {
  assert.equal(migration.toUtcInstant('2026-10-16 12:34:56'), '2026-10-16T12:34:56Z');
  assert.equal(migration.toUtcInstant('2026-10-16T12:34:56'), '2026-10-16T12:34:56Z');
  assert.equal(migration.toUtcInstant('2026-10-16T12:34:56Z'), '2026-10-16T12:34:56Z');
  assert.equal(migration.toUtcInstant('2026-10-16T12:34:56+01:00'), '2026-10-16T12:34:56+01:00');
  assert.equal(migration.toUtcInstant(null), null);
  assert.equal(migration.toUtcInstant(''), null);
});

test('mapRow converts timestamp columns but leaves dates alone', () => {
  const table = migration.TABLES.find((entry) => entry.name === 'tasks');
  const mapped = migration.mapRow(table, {
    id: 1,
    title: 'Example',
    description: null,
    staff_id: 2,
    priority: 'Low',
    status: 'Pending',
    due_date: '2024-05-06',
    created_by_admin_id: 1,
    created_at: '2026-10-16 12:34:56',
    updated_at: '2026-10-17 01:02:03'
  });

  assert.equal(mapped.created_at, '2026-10-16T12:34:56Z');
  assert.equal(mapped.updated_at, '2026-10-17T01:02:03Z');
  assert.equal(mapped.due_date, '2024-05-06');
  assert.equal(mapped.description, null);
});

test('buildInsert keeps the explicit id and never silently ignores a conflict', () => {
  const table = migration.TABLES.find((entry) => entry.name === 'admins');
  const sql = migration.buildInsert(table);

  assert.ok(sql.startsWith('INSERT INTO admins ('));
  assert.ok(sql.includes('id'));
  assert.ok(sql.includes('@password_hash'));
  assert.equal(/ON CONFLICT/i.test(sql), false);
});

test('parseArgs understands the documented flags', () => {
  assert.deepEqual(migration.parseArgs([]), { dryRun: false, verify: false, includeSessions: false });
  assert.deepEqual(migration.parseArgs(['--dry-run']), {
    dryRun: true,
    verify: false,
    includeSessions: false
  });
  assert.deepEqual(migration.parseArgs(['--verify']), {
    dryRun: false,
    verify: true,
    includeSessions: false
  });
  assert.deepEqual(migration.parseArgs(['--include-sessions']), {
    dryRun: false,
    verify: false,
    includeSessions: true
  });
  assert.throws(() => migration.parseArgs(['--unknown']), /Unknown option/);
});

test('a PostgreSQL target is required before the plan is printed', () => {
  /* No DATABASE_URL in this process, so there is no target to migrate into. */
  assert.throws(() => migration.assertPostgresTarget(), /DATABASE_URL is not set/);
});

test('the CLI reads the existing SQLite database in dry-run mode', async () => {
  await seedDatabase();
  await db.close();

  const child = spawnSync(
    process.execPath,
    [path.join(__dirname, '..', 'scripts', 'migrate-sqlite-to-postgres.js'), '--dry-run'],
    {
      cwd: path.join(__dirname, '..'),
      env: Object.assign({}, process.env, { DB_FILE: process.env.DB_FILE, DATABASE_URL: '' }),
      encoding: 'utf8'
    }
  );

  assert.equal(child.status, 0, child.stderr);
  assert.match(child.stdout, /Dry run/);
  assert.match(child.stdout, /departments: 6 row/);
  assert.match(child.stdout, /roles: 9 row/);
  assert.match(child.stdout, /staff: 18 row/);
  assert.match(child.stdout, /admin_sessions: skipped/);
});
