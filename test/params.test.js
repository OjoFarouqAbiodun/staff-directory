const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeParams, toPostgresQuery } = require('../src/database/params');

test('normalizeParams always yields a plain object', () => {
  assert.deepEqual(normalizeParams(undefined), {});
  assert.deepEqual(normalizeParams(null), {});
  assert.deepEqual(normalizeParams({ id: 1 }), { id: 1 });
});

test('named placeholders become positional and keep their order', () => {
  const { sql, values } = toPostgresQuery(
    'SELECT id FROM staff WHERE email = @email AND id = @id',
    { email: 'amara@example.com', id: 3 }
  );

  assert.equal(sql, 'SELECT id FROM staff WHERE email = $1 AND id = $2');
  assert.deepEqual(values, ['amara@example.com', 3]);
});

test('a repeated placeholder reuses the same $n', () => {
  const { sql, values } = toPostgresQuery(
    `SELECT id FROM staff
      WHERE first_name LIKE @search
         OR last_name LIKE @search
         OR email LIKE @search`,
    { search: '%okon%' }
  );

  assert.equal(sql.includes('$1'), true);
  assert.equal(sql.includes('$2'), false);
  assert.deepEqual(values, ['%okon%']);
});

test('a missing parameter is passed through as undefined for the driver to reject', () => {
  const { sql, values } = toPostgresQuery('SELECT id FROM staff WHERE id = @id', {});

  assert.equal(sql, 'SELECT id FROM staff WHERE id = $1');
  assert.equal(values.length, 1);
  assert.equal(values[0], undefined);
});

test('text without placeholders is returned unchanged', () => {
  const { sql, values } = toPostgresQuery('SELECT sqlite_version()', null);

  assert.equal(sql, 'SELECT sqlite_version()');
  assert.deepEqual(values, []);
});

test('an @name inside a single-quoted literal is left alone', () => {
  const { sql, values } = toPostgresQuery(
    "SELECT '@literal' AS label, email FROM staff WHERE id = @id",
    { id: 7 }
  );

  assert.equal(sql, "SELECT '@literal' AS label, email FROM staff WHERE id = $1");
  assert.deepEqual(values, [7]);
});

test('an email-looking literal is not treated as a placeholder', () => {
  const { sql, values } = toPostgresQuery(
    "SELECT 'admin@example.com' AS note WHERE id = @id",
    { id: 1 }
  );

  assert.equal(sql, "SELECT 'admin@example.com' AS note WHERE id = $1");
  assert.deepEqual(values, [1]);
});

test('a doubled quote inside a literal does not end the literal early', () => {
  const { sql, values } = toPostgresQuery(
    "SELECT 'it''s @not_a_param' AS note WHERE id = @id",
    { id: 2 }
  );

  assert.equal(sql, "SELECT 'it''s @not_a_param' AS note WHERE id = $1");
  assert.deepEqual(values, [2]);
});

test('an @name inside a double-quoted identifier is left alone', () => {
  const { sql, values } = toPostgresQuery(
    'SELECT "@column" FROM staff WHERE id = @id',
    { id: 3 }
  );

  assert.equal(sql, 'SELECT "@column" FROM staff WHERE id = $1');
  assert.deepEqual(values, [3]);
});

test('an @name inside a line comment is left alone', () => {
  const { sql, values } = toPostgresQuery(
    'SELECT id FROM staff -- @not_a_param\nWHERE id = @id',
    { id: 4 }
  );

  assert.equal(sql, 'SELECT id FROM staff -- @not_a_param\nWHERE id = $1');
  assert.deepEqual(values, [4]);
});

test('an @name inside a block comment is left alone', () => {
  const { sql, values } = toPostgresQuery(
    'SELECT id FROM staff /* @not_a_param */ WHERE id = @id',
    { id: 5 }
  );

  assert.equal(sql, 'SELECT id FROM staff /* @not_a_param */ WHERE id = $1');
  assert.deepEqual(values, [5]);
});

test('placeholders on both sides of a literal are still converted', () => {
  const { sql, values } = toPostgresQuery(
    "SELECT id FROM staff WHERE email = @email AND job_title <> '@none' AND id = @id",
    { email: 'a@example.com', id: 9 }
  );

  assert.equal(sql, "SELECT id FROM staff WHERE email = $1 AND job_title <> '@none' AND id = $2");
  assert.deepEqual(values, ['a@example.com', 9]);
});
