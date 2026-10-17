const os = require('os');
const path = require('path');
const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert/strict');

/*
 * End-to-end HTTP tests over a throwaway SQLite database. DATABASE_URL is
 * removed before the application is loaded, and DB_FILE points at a temp file,
 * so the real data/staff-directory.db and the live deployment are untouched.
 */
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'staff-directory-api-'));
process.env.DB_FILE = path.join(tempDir, 'api.db');
delete process.env.DATABASE_URL;

const app = require('../src/app');
const db = require('../src/database/db');
const { seedDatabase } = require('../src/database/seed');

let server;
let baseUrl;
let adminCookie = '';

test.before(async () => {
  await seedDatabase();

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = 'http://127.0.0.1:' + server.address().port;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await db.close();
});

async function request(pathname, options) {
  const response = await fetch(baseUrl + pathname, options);
  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch (error) {
    body = text;
  }

  return { status: response.status, body, headers: response.headers };
}

function jsonBody(value) {
  return {
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value)
  };
}

function authHeaders() {
  return { cookie: adminCookie, 'content-type': 'application/json' };
}

function parseCookie(headers) {
  const raw = headers.get('set-cookie');
  return raw ? raw.split(';')[0] : '';
}

test('health check responds', async () => {
  const response = await request('/api/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.data.status, 'ok');
});

test('the staff directory is public', async () => {
  const response = await request('/api/staff');

  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 18);
});

test('staff search is case-insensitive over HTTP', async () => {
  const response = await request('/api/staff?search=OKONKWO');

  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].full_name, 'Amara Okonkwo');
});

test('departments and roles are listed', async () => {
  const departments = await request('/api/departments');
  const roles = await request('/api/roles');

  assert.equal(departments.status, 200);
  assert.equal(roles.status, 200);
  assert.equal(departments.body.data.length, 6);
  assert.equal(roles.body.data.length, 9);
});

test('administrator-only endpoints require a session', async () => {
  const tasks = await request('/api/tasks');
  const dashboard = await request('/api/admin/dashboard');

  assert.equal(tasks.status, 401);
  assert.equal(dashboard.status, 401);
});

test('registration creates an administrator and starts a session', async () => {
  const response = await request(
    '/api/auth/register',
    Object.assign(
      { method: 'POST' },
      jsonBody({
        username: 'ApiAdmin',
        email: 'api.admin@example.com',
        password: 'supersecret1',
        full_name: 'API Administrator'
      })
    )
  );

  assert.equal(response.status, 201);
  assert.equal(response.body.data.admin.username, 'ApiAdmin');

  adminCookie = parseCookie(response.headers);
  assert.ok(adminCookie.startsWith('admin_session='));
});

test('a second registration with the same email is rejected', async () => {
  const response = await request(
    '/api/auth/register',
    Object.assign(
      jsonBody({
        username: 'AnotherAdmin',
        email: 'api.admin@example.com',
        password: 'supersecret1',
        full_name: 'Another Administrator'
      }),
      { method: 'POST' }
    )
  );

  assert.equal(response.status, 409);
});

test('the session identifies the current administrator', async () => {
  const response = await request('/api/auth/me', { headers: { cookie: adminCookie } });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.admin.username, 'ApiAdmin');
});

test('administrators can create and manage staff and tasks', async () => {
  const created = await request('/api/staff', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      first_name: 'Nia',
      last_name: 'Robinson',
      email: 'nia.robinson@brightpath.example',
      employment_status: 'Active'
    })
  });

  assert.equal(created.status, 201);
  assert.equal(created.body.data.full_name, 'Nia Robinson');

  const staffList = await request('/api/staff');
  const staffId = staffList.body.data.find((row) => row.email === 'nia.robinson@brightpath.example').id;

  const task = await request('/api/tasks', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      title: 'Prepare onboarding pack',
      staff_id: staffId,
      priority: 'High',
      status: 'Pending',
      due_date: '2024-05-06'
    })
  });

  assert.equal(task.status, 201);
  assert.equal(task.body.data.due_date, '2024-05-06');
  assert.equal(typeof task.body.data.due_date, 'string');

  const taskId = task.body.data.id;

  const patched = await request('/api/tasks/' + taskId + '/status', {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status: 'In Progress' })
  });

  assert.equal(patched.status, 200);
  assert.equal(patched.body.data.status, 'In Progress');

  const deleted = await request('/api/tasks/' + taskId, {
    method: 'DELETE',
    headers: authHeaders()
  });

  assert.equal(deleted.status, 200);
});

test('protected endpoints reject anonymous writes', async () => {
  const response = await request('/api/staff', Object.assign(jsonBody({}), { method: 'POST' }));

  assert.equal(response.status, 401);
});

test('dashboard requires a session and returns integer counts', async () => {
  const response = await request('/api/admin/dashboard', { headers: { cookie: adminCookie } });

  assert.equal(response.status, 200);
  assert.equal(typeof response.body.data.staff.total, 'number');
  assert.equal(typeof response.body.data.tasks.total, 'number');
  assert.equal(typeof response.body.data.tasks.overdue, 'number');
});

test('logout clears the session and invalid credentials are rejected', async () => {
  const logout = await request('/api/auth/logout', {
    method: 'POST',
    headers: { cookie: adminCookie }
  });

  assert.equal(logout.status, 200);

  const afterLogout = await request('/api/auth/me', { headers: { cookie: adminCookie } });
  assert.equal(afterLogout.status, 401);

  const badLogin = await request(
    '/api/auth/login',
    Object.assign(
      jsonBody({ email: 'api.admin@example.com', password: 'not-the-password' }),
      { method: 'POST' }
    )
  );

  assert.equal(badLogin.status, 401);

  const goodLogin = await request(
    '/api/auth/login',
    Object.assign(
      jsonBody({ email: 'api.admin@example.com', password: 'supersecret1' }),
      { method: 'POST' }
    )
  );

  assert.equal(goodLogin.status, 200);
  adminCookie = parseCookie(goodLogin.headers);
  assert.ok(adminCookie.startsWith('admin_session='));
});

async function loginWithValidCredentials() {
  return request(
    '/api/auth/login',
    Object.assign(
      jsonBody({ email: 'api.admin@example.com', password: 'supersecret1' }),
      { method: 'POST' }
    )
  );
}

test('login responses are not storable by caches', async () => {
  const response = await loginWithValidCredentials();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('authenticated /api/auth/me returns 200 and is not storable by caches', async () => {
  const login = await loginWithValidCredentials();
  const sessionCookie = parseCookie(login.headers);

  const response = await request('/api/auth/me', { headers: { cookie: sessionCookie } });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.admin.username, 'ApiAdmin');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('anonymous /api/auth/me returns 401 and is not storable by caches', async () => {
  const response = await request('/api/auth/me');

  assert.equal(response.status, 401);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('an anonymous conditional GET to /api/auth/me cannot turn a 401 into a 304', async () => {
  const first = await request('/api/auth/me');

  assert.equal(first.status, 401);

  const etag = first.headers.get('etag');
  assert.ok(etag, 'expected the 401 response to carry an ETag');

  const conditional = await request('/api/auth/me', { headers: { 'if-none-match': etag } });

  assert.equal(conditional.status, 401);
  assert.equal(conditional.body.success, false);
});

test('logout responses are not storable by caches', async () => {
  const login = await loginWithValidCredentials();
  const sessionCookie = parseCookie(login.headers);

  const response = await request('/api/auth/logout', {
    method: 'POST',
    headers: { cookie: sessionCookie }
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('public directory endpoints keep their ETag revalidation behaviour', async () => {
  const departments = await request('/api/departments');
  const staff = await request('/api/staff');

  assert.equal(departments.status, 200);
  assert.ok(departments.headers.get('etag'), 'expected departments to carry an ETag');
  assert.equal(departments.headers.get('cache-control'), null);

  assert.equal(staff.status, 200);
  assert.ok(staff.headers.get('etag'), 'expected staff to carry an ETag');
  assert.equal(staff.headers.get('cache-control'), null);
});
