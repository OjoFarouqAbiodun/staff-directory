/*
 * Constraint classification must be narrow so CHECK and NOT NULL failures are
 * never reported as duplicate conflicts. These are pure error-shape checks and
 * do not touch any database.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  isUniqueConstraintError,
  isForeignKeyConstraintError,
  isMissingRelationError
} = require('../src/database/errors');

function errorWithCode(code) {
  const error = new Error('constraint failed');
  error.code = code;
  return error;
}

test('PostgreSQL unique violations are classified as duplicates', () => {
  const error = errorWithCode('23505');

  assert.equal(isUniqueConstraintError(error), true);
  assert.equal(isForeignKeyConstraintError(error), false);
});

test('PostgreSQL foreign-key violations are classified as references', () => {
  const error = errorWithCode('23503');

  assert.equal(isForeignKeyConstraintError(error), true);
  assert.equal(isUniqueConstraintError(error), false);
});

test('SQLite unique violations are classified as duplicates', () => {
  assert.equal(isUniqueConstraintError(errorWithCode('SQLITE_CONSTRAINT_UNIQUE')), true);
});

test('SQLite primary-key violations are classified as duplicates', () => {
  assert.equal(isUniqueConstraintError(errorWithCode('SQLITE_CONSTRAINT_PRIMARYKEY')), true);
});

test('SQLite foreign-key violations are classified as references', () => {
  const error = errorWithCode('SQLITE_CONSTRAINT_FOREIGNKEY');

  assert.equal(isForeignKeyConstraintError(error), true);
  assert.equal(isUniqueConstraintError(error), false);
});

test('SQLite CHECK failures are not duplicates', () => {
  const error = errorWithCode('SQLITE_CONSTRAINT_CHECK');

  assert.equal(isUniqueConstraintError(error), false);
  assert.equal(isForeignKeyConstraintError(error), false);
});

test('SQLite NOT NULL failures are not duplicates', () => {
  const error = errorWithCode('SQLITE_CONSTRAINT_NOTNULL');

  assert.equal(isUniqueConstraintError(error), false);
  assert.equal(isForeignKeyConstraintError(error), false);
});

test('an unqualified SQLite constraint code is not treated as a duplicate', () => {
  assert.equal(isUniqueConstraintError(errorWithCode('SQLITE_CONSTRAINT')), false);
});

test('unknown or missing error codes are not classified', () => {
  assert.equal(isUniqueConstraintError(undefined), false);
  assert.equal(isUniqueConstraintError(null), false);
  assert.equal(isUniqueConstraintError({}), false);
  assert.equal(isUniqueConstraintError(new Error('no code')), false);
  assert.equal(isForeignKeyConstraintError(undefined), false);
  assert.equal(isForeignKeyConstraintError(new Error('no code')), false);
});

test('a PostgreSQL undefined-table error is a missing relation', () => {
  assert.equal(isMissingRelationError(errorWithCode('42P01')), true);
});

test('a SQLite no-such-table error is a missing relation', () => {
  const error = errorWithCode('SQLITE_ERROR');
  error.message = 'no such table: staff';

  assert.equal(isMissingRelationError(error), true);
});

test('a coded-free does-not-exist message is a missing relation', () => {
  assert.equal(isMissingRelationError(new Error('relation "staff" does not exist')), true);
});

test('connection and authorisation failures are not missing relations', () => {
  /* These must surface as real errors, not "destination table missing". */
  const tls = new Error('self-signed certificate in certificate chain');
  tls.code = 'SELF_SIGNED_CERT_IN_CHAIN';

  assert.equal(isMissingRelationError(tls), false);
  assert.equal(isMissingRelationError(errorWithCode('28P01')), false);
  assert.equal(isMissingRelationError(errorWithCode('42501')), false);
  assert.equal(isMissingRelationError(new Error('connect ETIMEDOUT')), false);
  assert.equal(isMissingRelationError(undefined), false);
});
