const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveSslMode, buildSslOptions, stripSslUrlParameters } = require('../src/config/ssl');

test('TLS verification is selected by default for a remote database', () => {
  assert.equal(resolveSslMode({}), 'verify');
  assert.equal(resolveSslMode({ DB_SSL: 'true' }), 'verify');
  assert.equal(resolveSslMode({ DB_SSL: 'TRUE' }), 'verify');
  /* An unrecognised value must not weaken TLS. */
  assert.equal(resolveSslMode({ DB_SSL: 'yes' }), 'verify');
  assert.equal(resolveSslMode({ DB_SSL: 'garbage' }), 'verify');
});

test('disabling TLS requires an explicit setting', () => {
  assert.equal(resolveSslMode({ DB_SSL: 'false' }), 'disable');
  assert.equal(resolveSslMode({ DB_SSL: 'disable' }), 'disable');
  assert.equal(resolveSslMode({ DB_SSL: 'FALSE' }), 'disable');
});

test('no-verify is an explicit local-development mode', () => {
  assert.equal(resolveSslMode({ DB_SSL: 'no-verify' }), 'no-verify');
  assert.equal(resolveSslMode({ DB_SSL: 'no-verify ' }), 'no-verify');
});

test('buildSslOptions verifies certificates by default', () => {
  assert.deepEqual(buildSslOptions('verify', null), { rejectUnauthorized: true });
});

test('buildSslOptions allows an explicit insecure local-development mode', () => {
  assert.deepEqual(buildSslOptions('no-verify', null), { rejectUnauthorized: false });
});

test('buildSslOptions disables the transport when asked', () => {
  assert.equal(buildSslOptions('disable', null), false);
});

test('buildSslOptions attaches a private CA when provided', () => {
  const ca = '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----';

  assert.deepEqual(buildSslOptions('verify', ca), { rejectUnauthorized: true, ca });
  assert.deepEqual(buildSslOptions('no-verify', ca), { rejectUnauthorized: false, ca });
  assert.equal(buildSslOptions('disable', ca), false);
});

test('stripSslUrlParameters removes sslmode so the configured ssl is used', () => {
  assert.equal(
    stripSslUrlParameters('postgresql://user:pw@host:5432/db?sslmode=require'),
    'postgresql://user:pw@host:5432/db'
  );
});

test('stripSslUrlParameters removes every TLS parameter node-postgres would apply', () => {
  const url =
    'postgresql://user:pw@host:5432/db?sslmode=verify-full&sslrootcert=/tmp/ca&sslcert=/tmp/c&sslkey=/tmp/k&uselibpqcompat=true&sslnegotiation=direct';

  assert.equal(stripSslUrlParameters(url), 'postgresql://user:pw@host:5432/db');
});

test('stripSslUrlParameters keeps unrelated query parameters in order', () => {
  assert.equal(
    stripSslUrlParameters('postgresql://user:pw@host:5432/db?sslmode=require&application_name=app&connect_timeout=10'),
    'postgresql://user:pw@host:5432/db?application_name=app&connect_timeout=10'
  );
});

test('stripSslUrlParameters leaves a URL without TLS parameters unchanged', () => {
  assert.equal(stripSslUrlParameters('postgresql://user:pw@host:5432/db'), 'postgresql://user:pw@host:5432/db');
  assert.equal(stripSslUrlParameters('postgresql://user:pw@host:5432/db?connect_timeout=10'), 'postgresql://user:pw@host:5432/db?connect_timeout=10');
  assert.equal(stripSslUrlParameters(''), '');
});
