const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DEFAULT_STATEMENT_TIMEOUT_MS,
  resolveStatementTimeout,
  resolveSeedOnStartup,
  productionRequiresPostgres
} = require('../src/config/options');

test('the statement timeout has a safe default', () => {
  assert.equal(DEFAULT_STATEMENT_TIMEOUT_MS, 30000);
  assert.equal(resolveStatementTimeout({}), DEFAULT_STATEMENT_TIMEOUT_MS);
});

test('invalid or non-positive statement timeouts fall back to the default', () => {
  assert.equal(resolveStatementTimeout({ PG_STATEMENT_TIMEOUT_MS: '' }), DEFAULT_STATEMENT_TIMEOUT_MS);
  assert.equal(resolveStatementTimeout({ PG_STATEMENT_TIMEOUT_MS: 'abc' }), DEFAULT_STATEMENT_TIMEOUT_MS);
  assert.equal(resolveStatementTimeout({ PG_STATEMENT_TIMEOUT_MS: '0' }), DEFAULT_STATEMENT_TIMEOUT_MS);
  assert.equal(resolveStatementTimeout({ PG_STATEMENT_TIMEOUT_MS: '-5' }), DEFAULT_STATEMENT_TIMEOUT_MS);
  assert.equal(resolveStatementTimeout({ PG_STATEMENT_TIMEOUT_MS: 'NaN' }), DEFAULT_STATEMENT_TIMEOUT_MS);
});

test('the statement timeout is configurable', () => {
  assert.equal(resolveStatementTimeout({ PG_STATEMENT_TIMEOUT_MS: '5000' }), 5000);
  assert.equal(resolveStatementTimeout({ PG_STATEMENT_TIMEOUT_MS: '1500.9' }), 1500);
});

test('startup seeding is on for SQLite but off for PostgreSQL by default', () => {
  assert.equal(resolveSeedOnStartup({}, 'sqlite'), true);
  assert.equal(resolveSeedOnStartup({}, 'postgres'), false);
});

test('an explicit SEED_ON_STARTUP overrides the default', () => {
  assert.equal(resolveSeedOnStartup({ SEED_ON_STARTUP: 'true' }, 'postgres'), true);
  assert.equal(resolveSeedOnStartup({ SEED_ON_STARTUP: 'TRUE' }, 'postgres'), true);
  assert.equal(resolveSeedOnStartup({ SEED_ON_STARTUP: 'false' }, 'sqlite'), false);
  assert.equal(resolveSeedOnStartup({ SEED_ON_STARTUP: '' }, 'postgres'), false);
});

test('production refuses to start without PostgreSQL', () => {
  assert.equal(productionRequiresPostgres({ NODE_ENV: 'production' }, 'sqlite'), true);
  assert.equal(productionRequiresPostgres({ NODE_ENV: 'production' }, 'postgres'), false);
  assert.equal(productionRequiresPostgres({}, 'sqlite'), false);
  assert.equal(productionRequiresPostgres({ NODE_ENV: 'development' }, 'sqlite'), false);
});
