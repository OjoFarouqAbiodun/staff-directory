const { EventEmitter } = require('node:events');
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  redactSecrets,
  describePoolError,
  attachPoolErrorHandler
} = require('../src/database/poolErrors');

test('redactSecrets removes connection strings and password assignments', () => {
  const text =
    'connect ECONNREFUSED postgres://admin:hunter2@db.internal:5432/staff password=hunter2';

  const safe = redactSecrets(text);

  assert.equal(safe.includes('hunter2'), false);
  assert.equal(safe.includes('postgres://'), false);
  assert.equal(safe.includes('[redacted connection string]'), true);
  assert.equal(safe.includes('[redacted secret]'), true);
});

test('redactSecrets also covers postgresql:// URLs', () => {
  const safe = redactSecrets('failed to connect to postgresql://user:pw@host:5432/db');

  assert.equal(safe.includes('user:pw'), false);
  assert.equal(safe.includes('postgresql://'), false);
});

test('redactSecrets tolerates non-string and empty input', () => {
  assert.equal(redactSecrets(null), '');
  assert.equal(redactSecrets(undefined), '');
  assert.equal(redactSecrets(''), '');
});

test('describePoolError logs a short sanitized line', () => {
  const lines = [];
  const line = describePoolError(
    new Error('terminating connection to postgres://admin:hunter2@db.internal:5432/staff'),
    (message) => lines.push(message)
  );

  assert.deepEqual(lines, [line]);
  assert.match(line, /PostgreSQL pool error/);
  assert.equal(line.includes('hunter2'), false);
  assert.equal(line.includes('postgres://'), false);
});

test('attachPoolErrorHandler turns an unhandled error into a logged one', () => {
  const pool = new EventEmitter();
  const lines = [];

  attachPoolErrorHandler(pool, (message) => lines.push(message));

  assert.equal(pool.listenerCount('error'), 1);

  /* An EventEmitter 'error' with no listener throws; this must not. */
  assert.doesNotThrow(() => pool.emit('error', new Error('idle client lost')));

  assert.equal(lines.length, 1);
  assert.match(lines[0], /PostgreSQL pool error/);
});

test('the handler never logs the connection string', () => {
  const pool = new EventEmitter();
  const lines = [];

  attachPoolErrorHandler(pool, (message) => lines.push(message));
  pool.emit('error', new Error('password authentication failed for postgres://u:sekret@h/d'));

  assert.equal(lines[0].includes('sekret'), false);
  assert.equal(lines[0].includes('postgres://'), false);
});
