const test = require('node:test');
const assert = require('node:assert/strict');

/*
 * These assertions pin the SQLite SQL fragments. No DATABASE_URL is set, so the
 * dialect module selects the SQLite spellings — the same ones the production
 * schema.sql and the original synchronous data layer used.
 */
delete process.env.DATABASE_URL;

const dialect = require('../src/database/dialect');

test('the SQLite dialect is selected when DATABASE_URL is absent', () => {
  assert.equal(dialect.driver, 'sqlite');
  assert.equal(dialect.isPostgres, false);
});

test('SQLite time and date fragments keep their original spelling', () => {
  assert.equal(dialect.now, "datetime('now')");
  assert.equal(dialect.currentDate, "date('now')");
  assert.equal(dialect.count('*'), 'COUNT(*)');
  assert.equal(dialect.count('t.id'), 'COUNT(t.id)');
});

test('SQLite case-insensitive fragments use the original COLLATE and LIKE forms', () => {
  assert.equal(
    dialect.caseInsensitiveEquals('email', '@email'),
    'email = @email COLLATE NOCASE'
  );
  assert.equal(
    dialect.caseInsensitiveEquals('d.name', '@department'),
    'd.name = @department COLLATE NOCASE'
  );
  assert.equal(
    dialect.caseInsensitiveLike('s.first_name', '@search'),
    "s.first_name LIKE @search ESCAPE '\\'"
  );
});

test('the session expiry modifier stays a named parameter', () => {
  assert.equal(dialect.sessionExpiry, "datetime('now', '+' || @lifetime_days || ' days')");
});
