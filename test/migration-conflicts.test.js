/*
 * These tests exercise the importer's decision logic with an injected query
 * function. No PostgreSQL server is contacted and no SQL is executed remotely.
 */
delete process.env.DATABASE_URL;

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  TABLES,
  assertDestinationEmpty,
  checkDestinationEmpty,
  verifyDestination,
  findConflicts,
  rowsDiffer,
  formatVerifyReport,
  reportHasProblems,
  sanitizeMigrationError
} = require('../scripts/migrate-sqlite-to-postgres');

const staffTable = TABLES.find((entry) => entry.name === 'staff');
const adminTable = TABLES.find((entry) => entry.name === 'admins');

/* Build a query function that returns fixed counts per table name. */
function countsAs(counts) {
  return (sql) => {
    const match = /FROM\s+(\w+)/i.exec(sql);
    const name = match ? match[1] : '';
    return Promise.resolve({ rows: [{ count: Object.prototype.hasOwnProperty.call(counts, name) ? counts[name] : 0 }] });
  };
}

test('assertDestinationEmpty accepts an empty target', () => {
  assert.doesNotThrow(() => assertDestinationEmpty({ departments: 0, roles: 0, staff: 0 }));
});

test('assertDestinationEmpty refuses a non-empty target', () => {
  assert.throws(() => assertDestinationEmpty({ departments: 0, roles: 9 }), /Refusing to import/);
});

test('checkDestinationEmpty accepts every table at zero', async () => {
  const counts = await checkDestinationEmpty(countsAs({}), TABLES);

  assert.equal(counts.departments, 0);
  assert.equal(counts.staff, 0);
});

test('checkDestinationEmpty refuses a seeded destination', async () => {
  await assert.rejects(
    () => checkDestinationEmpty(countsAs({ departments: 6, roles: 9, admins: 1, staff: 18 }), TABLES),
    /Refusing to import/
  );
});

test('one populated table is enough to refuse the whole import', async () => {
  await assert.rejects(
    () => checkDestinationEmpty(countsAs({ admins: 1 }), TABLES),
    /admins/
  );
});

test('a same-id/different-data row is reported as a conflict', () => {
  const source = [{ id: 1, first_name: 'A', last_name: 'B', email: 'a@example.com' }];
  const destination = [{ id: 1, first_name: 'A', last_name: 'CHANGED', email: 'a@example.com' }];

  const result = findConflicts(staffTable, source, destination);

  assert.deepEqual(result.conflictingIds, [1]);
  assert.deepEqual(result.missingInDestination, []);
  assert.deepEqual(result.keyCollisions, []);
});

test('rows with the same id and equal values are not conflicts', () => {
  const row = { id: 1, first_name: 'A', last_name: 'B', email: 'a@example.com' };

  assert.equal(rowsDiffer(staffTable, row, { ...row }), false);
});

test('missing and extra ids are listed separately', () => {
  const source = [{ id: 1 }, { id: 2 }];
  const destination = [{ id: 1 }, { id: 3 }];

  const result = findConflicts(staffTable, source, destination);

  assert.deepEqual(result.missingInDestination, [2]);
  assert.deepEqual(result.extraInDestination, [3]);
  assert.deepEqual(result.conflictingIds, []);
});

test('a natural-key collision with different ids is detected without the key value', () => {
  const source = [{ id: 1, email: 'same@example.com' }];
  const destination = [{ id: 99, email: 'same@example.com' }];

  const result = findConflicts(staffTable, source, destination);

  assert.equal(result.keyCollisions.length, 1);
  /* Only the column name and ids are exposed, never the email value. */
  assert.deepEqual(result.keyCollisions[0], { key: 'email', sourceId: 1, destinationId: 99 });
});

test('a natural key shared by the same id is not a collision', () => {
  const source = [{ id: 1, email: 'same@example.com' }];
  const destination = [{ id: 1, email: 'same@example.com' }];

  const result = findConflicts(staffTable, source, destination);

  assert.deepEqual(result.keyCollisions, []);
});

test('independent unique keys are checked separately for admins', () => {
  /* Both the username and the email collide: two separate collisions. */
  const source = [{ id: 1, username: 'ops', email: 'ops@example.com' }];
  const destination = [{ id: 7, username: 'ops', email: 'ops@example.com' }];

  const result = findConflicts(adminTable, source, destination);

  assert.deepEqual(result.keyCollisions, [
    { key: 'username', sourceId: 1, destinationId: 7 },
    { key: 'email', sourceId: 1, destinationId: 7 }
  ]);
});

test('an admins username-only collision is detected', () => {
  const source = [{ id: 1, username: 'ops', email: 'first@example.com' }];
  const destination = [{ id: 7, username: 'ops', email: 'second@example.com' }];

  const result = findConflicts(adminTable, source, destination);

  assert.deepEqual(result.keyCollisions, [{ key: 'username', sourceId: 1, destinationId: 7 }]);
});

test('an admins email-only collision is detected', () => {
  const source = [{ id: 1, username: 'first', email: 'shared@example.com' }];
  const destination = [{ id: 7, username: 'second', email: 'shared@example.com' }];

  const result = findConflicts(adminTable, source, destination);

  assert.deepEqual(result.keyCollisions, [{ key: 'email', sourceId: 1, destinationId: 7 }]);
});

test('single-column unique keys in other tables are checked independently', () => {
  const departmentTable = TABLES.find((entry) => entry.name === 'departments');
  const source = [{ id: 1, name: 'Engineering' }];
  const destination = [{ id: 4, name: 'Engineering' }];

  const result = findConflicts(departmentTable, source, destination);

  assert.deepEqual(result.keyCollisions, [{ key: 'name', sourceId: 1, destinationId: 4 }]);
});

test('verify reports counts and uses the injected comparison', async () => {
  const plan = [{ table: staffTable, rows: [{ id: 1, email: 'a@example.com' }] }];
  const query = () => Promise.resolve({ rows: [{ id: 1, email: 'a@example.com' }] });

  const report = await verifyDestination(query, plan);

  assert.equal(report[0].sourceCount, 1);
  assert.equal(report[0].destinationCount, 1);
  assert.equal(report[0].missingTable, false);
  assert.deepEqual(report[0].conflictingIds, []);
  assert.equal(reportHasProblems(report), false);
});

test('verify flags a conflict', async () => {
  const plan = [{ table: staffTable, rows: [{ id: 1, email: 'a@example.com' }] }];
  const query = () => Promise.resolve({ rows: [{ id: 1, email: 'changed@example.com' }] });

  const report = await verifyDestination(query, plan);

  assert.deepEqual(report[0].conflictingIds, [1]);
  assert.equal(reportHasProblems(report), true);
});

test('verify reports a missing destination table instead of matching by counts', async () => {
  const plan = [{ table: staffTable, rows: [{ id: 1 }, { id: 2 }] }];
  const query = () => Promise.reject(new Error('relation "staff" does not exist'));

  const report = await verifyDestination(query, plan);

  assert.equal(report[0].missingTable, true);
  assert.equal(reportHasProblems(report), true);

  const lines = formatVerifyReport(report).join('\n');
  assert.match(lines, /destination table missing/);
});

test('verify treats a PostgreSQL undefined-table code as a missing table', async () => {
  const plan = [{ table: staffTable, rows: [{ id: 1 }] }];
  const error = new Error('relation "staff" does not exist');
  error.code = '42P01';
  const query = () => Promise.reject(error);

  const report = await verifyDestination(query, plan);

  assert.equal(report[0].missingTable, true);
});

test('verify surfaces a connection failure instead of reporting missing tables', async () => {
  const plan = [{ table: staffTable, rows: [{ id: 1 }] }];
  const error = new Error('self-signed certificate in certificate chain');
  error.code = 'SELF_SIGNED_CERT_IN_CHAIN';
  const query = () => Promise.reject(error);

  await assert.rejects(() => verifyDestination(query, plan), /self-signed certificate in certificate chain/);
});

test('the verification report prints ids, not personal data or password hashes', async () => {
  const source = [
    {
      id: 1,
      username: 'realadmin',
      email: 'real@person.example',
      password_hash: 'scrypt$deadbeef$cafebabe',
      full_name: 'Real Person'
    }
  ];
  const plan = [{ table: adminTable, rows: source }];
  const query = () =>
    Promise.resolve({
      rows: [
        {
          id: 1,
          username: 'realadmin',
          email: 'real@person.example',
          password_hash: 'scrypt$ffffffff$ffffffff',
          full_name: 'Real Person'
        }
      ]
    });

  const report = await verifyDestination(query, plan);
  const text = formatVerifyReport(report).join('\n');

  assert.deepEqual(report[0].conflictingIds, [1]);
  assert.match(text, /different values: 1/);
  assert.equal(text.includes('scrypt$'), false);
  assert.equal(text.includes('real@person.example'), false);
  assert.equal(text.includes('Real Person'), false);
});

test('the verification summary states that nothing was modified', () => {
  const report = [
    {
      table: 'staff',
      missingTable: false,
      sourceCount: 0,
      destinationCount: 0,
      conflictingIds: [],
      missingInDestination: [],
      extraInDestination: [],
      keyCollisions: []
    }
  ];

  const lines = formatVerifyReport(report);

  assert.match(lines.join('\n'), /No conflicting IDs or natural-key collisions/);
  assert.equal(reportHasProblems(report), false);
});

test('importer errors are redacted before they are printed', () => {
  const message = sanitizeMigrationError(
    new Error('connect failed for postgres://admin:hunter2@db.internal:5432/staff password=hunter2')
  );

  assert.match(message, /PostgreSQL|redacted/);
  assert.equal(message.includes('hunter2'), false);
  assert.equal(message.includes('postgres://'), false);
});

test('sanitizeMigrationError tolerates non-Error values', () => {
  assert.equal(sanitizeMigrationError(undefined), 'undefined');
  assert.equal(sanitizeMigrationError('plain failure'), 'plain failure');
  assert.equal(
    sanitizeMigrationError(new Error('postgres://user:pw@host:5432/db unreachable')),
    '[redacted connection string] unreachable'
  );
});
