const test = require('node:test');
const assert = require('node:assert/strict');

/*
 * A fake connection string selects the PostgreSQL dialect. Nothing here opens a
 * network connection: the dialect module is pure SQL text and the parameter
 * converter is pure string manipulation, so the compatibility fixes for
 * PostgreSQL can be verified without a live server.
 */
process.env.DATABASE_URL = 'postgres://user:secret@db.example.invalid:5432/staff_directory';
delete process.env.DB_SSL;

const dialect = require('../src/database/dialect');
const { toPostgresQuery } = require('../src/database/params');
const migration = require('../scripts/migrate-sqlite-to-postgres');

test('the PostgreSQL dialect is selected when DATABASE_URL is set', () => {
  assert.equal(dialect.driver, 'postgres');
  assert.equal(dialect.isPostgres, true);
});

test('a valid PostgreSQL connection string passes the importer pre-flight check', () => {
  /* assertPostgresTarget only parses the config; it never opens a connection. */
  assert.doesNotThrow(() => migration.assertPostgresTarget());
});

test('UTC date and time fragments avoid the session time zone', () => {
  assert.equal(dialect.now, 'now()');
  assert.equal(dialect.currentDate, "(now() AT TIME ZONE 'UTC')::date");
});

test('counts are cast to integers so they are not returned as strings', () => {
  assert.equal(dialect.count('*'), 'COUNT(*)::int');
  assert.equal(dialect.count('t.id'), 'COUNT(t.id)::int');
});

test('case-insensitive matching uses LOWER and ILIKE with an escape character', () => {
  assert.equal(dialect.caseInsensitiveEquals('email', '@email'), 'LOWER(email) = LOWER(@email)');
  assert.equal(
    dialect.caseInsensitiveLike('s.first_name', '@search'),
    "s.first_name ILIKE @search ESCAPE '\\'"
  );
});

test('session expiry adds a day interval to the current instant', () => {
  assert.equal(dialect.sessionExpiry, "now() + (@lifetime_days * interval '1 day')");
});

test('a representative query converts cleanly to positional parameters', () => {
  const { sql, values } = toPostgresQuery(
    `SELECT id FROM staff
      WHERE ${dialect.caseInsensitiveLike('email', '@search')}
         OR ${dialect.caseInsensitiveLike('job_title', '@search')}
        AND id = @id`,
    { search: '%okon%', id: 3 }
  );

  assert.equal(
    sql,
    "SELECT id FROM staff\n" +
      "      WHERE email ILIKE $1 ESCAPE '\\'\n" +
      "         OR job_title ILIKE $1 ESCAPE '\\'\n" +
      '        AND id = $2'
  );
  assert.deepEqual(values, ['%okon%', 3]);
});
