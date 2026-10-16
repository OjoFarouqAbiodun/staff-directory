const os = require('os');
const path = require('path');
const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert/strict');

/*
 * The repository tests always run against a throwaway SQLite file: DATABASE_URL
 * is removed before any application module is loaded, so config selects the
 * SQLite engine and the real data/staff-directory.db is never touched.
 */
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'staff-directory-repo-'));
process.env.DB_FILE = path.join(tempDir, 'repositories.db');
delete process.env.DATABASE_URL;

const db = require('../src/database/db');
const { seedDatabase } = require('../src/database/seed');
const staffRepository = require('../src/repositories/staffRepository');
const adminRepository = require('../src/repositories/adminRepository');
const sessionRepository = require('../src/repositories/sessionRepository');
const taskRepository = require('../src/repositories/taskRepository');
const dashboardRepository = require('../src/repositories/dashboardRepository');
const departmentRepository = require('../src/repositories/departmentRepository');
const roleRepository = require('../src/repositories/roleRepository');
const sessionService = require('../src/services/sessionService');
const passwordService = require('../src/services/passwordService');

let seeded;
let adminCredentials;

test.before(async () => {
  seeded = await seedDatabase();
});

test.after(async () => {
  await db.close();
});

test('uses the SQLite engine when DATABASE_URL is absent', () => {
  assert.equal(db.driver, 'sqlite');
});

test('seeding populates the reference data and is idempotent', async () => {
  assert.equal(seeded.departments, 6);
  assert.equal(seeded.roles, 9);
  assert.equal(seeded.staff, 18);

  const again = await seedDatabase();

  assert.deepEqual(again, seeded);
});

test('reference repositories return the seeded rows', async () => {
  const departments = await departmentRepository.findAll();
  const roles = await roleRepository.findAll();

  assert.equal(departments.length, 6);
  assert.equal(roles.length, 9);
  assert.equal(departments[0].name < departments[departments.length - 1].name, true);

  const engineering = departments.find((row) => row.name === 'Engineering');
  assert.equal((await departmentRepository.findById(engineering.id)).name, 'Engineering');
  assert.equal(await departmentRepository.findById('not-a-number'), null);

  const role = roles.find((row) => row.name === 'Software Developer');
  assert.equal((await roleRepository.findById(role.id)).name, 'Software Developer');
});

test('staff search ignores case and treats wildcards literally', async () => {
  const lower = await staffRepository.findAll({ search: 'okonkwo' });
  const upper = await staffRepository.findAll({ search: 'OKONKWO' });

  assert.equal(lower.length, 1);
  assert.deepEqual(
    lower.map((row) => row.id),
    upper.map((row) => row.id)
  );
  assert.equal(lower[0].full_name, 'Amara Okonkwo');

  const byJobTitle = await staffRepository.findAll({ search: 'backend' });
  assert.ok(byJobTitle.some((row) => row.job_title === 'Senior Backend Developer'));

  /* A literal % must not behave like a wildcard. */
  assert.equal((await staffRepository.findAll({ search: '%' })).length, 0);
});

test('staff filters ignore case', async () => {
  const lower = await staffRepository.findAll({ department: 'engineering' });
  const upper = await staffRepository.findAll({ department: 'ENGINEERING' });

  assert.ok(lower.length >= 1);
  assert.deepEqual(
    lower.map((row) => row.id),
    upper.map((row) => row.id)
  );
  assert.ok(lower.every((row) => row.department === 'Engineering'));

  const active = await staffRepository.findAll({ status: 'active' });
  assert.ok(active.length > 0);
  assert.ok(active.every((row) => row.employment_status === 'Active'));
});

test('staff counts are returned as numbers', async () => {
  const total = await staffRepository.countAll({});

  assert.equal(typeof total, 'number');
  assert.equal(total, 18);
  assert.equal(typeof (await staffRepository.countAll({ department: 'engineering' })), 'number');
  assert.ok((await staffRepository.countAll({ department: 'engineering' })) > 0);
});

test('staff creation preserves values and rejects look-alike emails', async () => {
  const email = 'Test.Person@brightpath.example';

  assert.equal(await staffRepository.emailExists(email), false);

  const id = await staffRepository.create({
    firstName: 'Test',
    lastName: 'Person',
    email,
    phone: null,
    jobTitle: 'Analyst',
    departmentId: null,
    roleId: null,
    location: null,
    avatarUrl: null,
    bio: null,
    employmentStatus: 'Active'
  });

  assert.ok(Number.isInteger(id) && id > 0);

  const created = await staffRepository.findById(id);
  assert.equal(created.email, email);
  assert.equal(created.full_name, 'Test Person');
  assert.equal(created.avatar_url, null);

  /* The UNIQUE column is case-sensitive; the look-alike check is not. */
  assert.equal(await staffRepository.emailExists('test.person@brightpath.example'), true);
  assert.equal(await staffRepository.findById('nope'), null);
});

test('admin credentials are stored and verified', async () => {
  const passwordHash = passwordService.hashPassword('correct-horse-battery-staple');

  const id = await adminRepository.create({
    username: 'TestAdmin',
    email: 'test.admin@example.com',
    passwordHash,
    fullName: 'Test Administrator'
  });

  adminCredentials = await adminRepository.findCredentialsByEmail('test.admin@example.com');

  assert.equal(adminCredentials.id, id);
  assert.equal(adminCredentials.password_hash, passwordHash);
  assert.equal(passwordService.verifyPassword('correct-horse-battery-staple', passwordHash), true);
  assert.equal(passwordService.verifyPassword('wrong-password', passwordHash), false);

  assert.equal(await adminRepository.usernameExists('testadmin'), true);
  assert.equal(await adminRepository.usernameExists('someone-else'), false);
  assert.equal(await adminRepository.emailExists('test.admin@example.com'), true);
  assert.equal(await adminRepository.emailExists('missing@example.com'), false);

  /* findById must never expose the password hash. */
  const safe = await adminRepository.findById(id);
  assert.equal(safe.password_hash, undefined);
});

test('sessions are created, resolved, and removed', async () => {
  const sessionId = await sessionService.startSession(adminCredentials.id);

  const active = await sessionRepository.findActive(sessionId);
  assert.equal(active.admin_id, adminCredentials.id);

  const resolved = await sessionService.resolveSession(sessionId);
  assert.equal(resolved.id, adminCredentials.id);
  assert.equal(resolved.password_hash, undefined);

  assert.equal(await sessionRepository.remove(sessionId), 1);
  assert.equal(await sessionRepository.findActive(sessionId), null);
  assert.equal(await sessionService.resolveSession(sessionId), null);
});

test('tasks keep the YYYY-MM-DD due date and support the full lifecycle', async () => {
  const staff = await staffRepository.findAll({ search: 'amara' });

  const taskId = await taskRepository.create({
    title: 'Write the migration notes',
    description: 'Document the cutover steps',
    staffId: staff[0].id,
    priority: 'High',
    status: 'Pending',
    dueDate: '2024-01-15',
    createdByAdminId: adminCredentials.id
  });

  const task = await taskRepository.findById(taskId);
  assert.equal(task.due_date, '2024-01-15');
  assert.equal(typeof task.due_date, 'string');
  assert.equal(task.staff.full_name, 'Amara Okonkwo');
  assert.equal(task.status, 'Pending');

  assert.equal(await taskRepository.updateStatus(task.id, 'In Progress'), 1);
  assert.equal((await taskRepository.findById(task.id)).status, 'In Progress');

  const updated = await taskRepository.update(task.id, {
    title: 'Updated title',
    staffId: task.staff_id,
    priority: 'Urgent',
    description: null,
    dueDate: null
  });

  assert.equal(updated, 1);

  const reloaded = await taskRepository.findById(task.id);
  assert.equal(reloaded.title, 'Updated title');
  assert.equal(reloaded.priority, 'Urgent');
  assert.equal(reloaded.description, null);
  assert.equal(reloaded.due_date, null);

  assert.equal(await taskRepository.findByStaffId(task.staff_id).then((rows) => rows.length > 0), true);

  assert.equal(await taskRepository.remove(task.id), 1);
  assert.equal(await taskRepository.findById(task.id), null);
  assert.equal(await taskRepository.remove(task.id), 0);
});

test('dashboard counts are integers and overdue uses the UTC date', async () => {
  const staffId = (await staffRepository.findAll({ search: 'amara' }))[0].id;

  const openTaskId = await taskRepository.create({
    title: 'Overdue open task',
    description: null,
    staffId,
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2000-01-01',
    createdByAdminId: adminCredentials.id
  });

  const closedTaskId = await taskRepository.create({
    title: 'Overdue closed task',
    description: null,
    staffId,
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2000-01-01',
    createdByAdminId: adminCredentials.id
  });

  const staffSummary = await dashboardRepository.getStaffSummary();
  const taskSummary = await dashboardRepository.getTaskSummary();

  assert.equal(typeof staffSummary.total, 'number');
  assert.equal(typeof staffSummary.by_status.Active, 'number');
  assert.ok(staffSummary.total >= 18);

  assert.equal(typeof taskSummary.total, 'number');
  assert.equal(typeof taskSummary.overdue, 'number');
  assert.equal(typeof taskSummary.by_status.Pending, 'number');
  assert.ok(taskSummary.overdue >= 1);

  const overdue = await dashboardRepository.getOverdueTasks();
  assert.ok(overdue.length >= 1);
  assert.ok(overdue.every((row) => typeof row.due_date === 'string'));
  assert.ok(overdue.every((row) => row.status !== 'Completed' && row.status !== 'Cancelled'));

  const recent = await dashboardRepository.getRecentTasks();
  assert.ok(recent.length >= 1);

  const topStaff = await dashboardRepository.getTopOpenStaff();
  assert.ok(topStaff.length >= 1);
  assert.ok(Number.isInteger(topStaff[0].open_tasks));
  assert.ok(topStaff[0].open_tasks >= 1);

  await taskRepository.remove(openTaskId);
  await taskRepository.remove(closedTaskId);
});

test('expired sessions are ignored', { skip: db.driver !== 'sqlite' }, async () => {
  await db.query(
    "INSERT INTO admin_sessions (id, admin_id, expires_at) VALUES (@id, @admin_id, datetime('now', '-1 day'))",
    { id: 'expired-session', admin_id: adminCredentials.id }
  );

  assert.equal(await sessionRepository.findActive('expired-session'), null);
});
