/*
 * The .env loader is optional and dependency-free. These tests cover the rules
 * that matter for configuration: real environment variables win, quotes are
 * stripped, and a missing file is not an error. No file in the project is
 * touched; each case uses a throwaway file in the OS temp directory.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { loadEnvFile } = require('../src/config/env');

function writeTempEnv(content) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'staff-directory-env-'));
  const file = path.join(directory, '.env');
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

test('loadEnvFile sets variables that are not already in the environment', () => {
  const key = 'STAFF_DIRECTORY_TEST_FROM_FILE_' + process.pid;
  delete process.env[key];

  loadEnvFile(writeTempEnv(key + '=from-file\n'));

  assert.equal(process.env[key], 'from-file');
  delete process.env[key];
});

test('loadEnvFile never overrides a real environment variable', () => {
  const key = 'STAFF_DIRECTORY_TEST_KEEP_' + process.pid;
  process.env[key] = 'real-environment';

  loadEnvFile(writeTempEnv(key + '=from-file\n'));

  assert.equal(process.env[key], 'real-environment');
  delete process.env[key];
});

test('loadEnvFile strips surrounding quotes', () => {
  const key = 'STAFF_DIRECTORY_TEST_QUOTED_' + process.pid;
  delete process.env[key];

  loadEnvFile(writeTempEnv(key + '="C:\\certs\\ca.crt"\n'));

  assert.equal(process.env[key], 'C:\\certs\\ca.crt');
  delete process.env[key];
});

test('loadEnvFile ignores comments and malformed lines', () => {
  const key = 'STAFF_DIRECTORY_TEST_CLEAN_' + process.pid;
  delete process.env[key];

  loadEnvFile(writeTempEnv('# a comment\nnot a key value line\n=missing\n' + key + '=value\n'));

  assert.equal(process.env[key], 'value');
  delete process.env[key];
});

test('loadEnvFile tolerates a missing file', () => {
  const missing = path.join(os.tmpdir(), 'staff-directory-missing-' + process.pid);

  assert.equal(loadEnvFile(missing), false);
});
