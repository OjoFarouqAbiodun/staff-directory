
const BASE_URL = '/api';

const STAFF_FILTERS = ['search', 'department', 'role', 'status'];
const TASK_FILTERS = ['staff_id', 'status', 'priority'];

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function extractServerMessage(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (payload.success === false && payload.error && typeof payload.error.message === 'string') {
    return payload.error.message;
  }

  return null;
}

async function request(path, options) {
  const requestOptions = typeof options === 'object' && options !== null ? options : {};

  const headers = Object.assign({ Accept: 'application/json' }, requestOptions.headers || {});

  let response;

  try {
    response = await fetch(
      BASE_URL + path,
      Object.assign({}, requestOptions, {
        headers,
        credentials: 'same-origin'
      })
    );
  } catch (error) {
    throw new ApiError('Unable to reach the server. Please check your connection.', 0);
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const serverMessage = extractServerMessage(payload);

    throw new ApiError(serverMessage || 'The server could not complete the request.', response.status);
  }

  if (!payload || typeof payload !== 'object') {
    throw new ApiError('The server returned an unexpected response.', response.status);
  }

  if (payload.success !== true) {
    const serverMessage = extractServerMessage(payload);

    throw new ApiError(serverMessage || 'The server could not complete the request.', response.status);
  }

  return payload.data;
}

function buildStaffQuery(filters) {
  const params = new URLSearchParams();

  if (!filters || typeof filters !== 'object') {
    return '';
  }

  for (const key of STAFF_FILTERS) {
    const value = filters[key];

    if (typeof value !== 'string') {
      continue;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      continue;
    }

    params.set(key, trimmed);
  }

  const query = params.toString();

  return query ? '?' + query : '';
}

async function getStaff(filters) {
  return request('/staff' + buildStaffQuery(filters));
}

async function getStaffById(id) {
  return request('/staff/' + encodeURIComponent(id));
}

async function getDepartments() {
  return request('/departments');
}

async function getRoles() {
  return request('/roles');
}

async function getHealth() {
  return request('/health');
}

async function getDashboard() {
  return request('/admin/dashboard');
}

function postJson(path, body) {
  return request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

function sendJson(method, path, body) {
  return request(path, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(typeof body === 'object' && body !== null ? body : {})
  });
}

function buildTaskQuery(filters) {
  const params = new URLSearchParams();

  if (!filters || typeof filters !== 'object') {
    return '';
  }

  for (const key of TASK_FILTERS) {
    const value = filters[key];

    if (typeof value !== 'string') {
      continue;
    }

    const trimmed = value.trim();

    if (!trimmed) {
      continue;
    }

    params.set(key, trimmed);
  }

  const query = params.toString();

  return query ? '?' + query : '';
}

async function getTasks(filters) {
  return request('/tasks' + buildTaskQuery(filters));
}

async function getTaskById(id) {
  return request('/tasks/' + encodeURIComponent(id));
}

async function createTask(details) {
  const input = typeof details === 'object' && details !== null ? details : {};

  return sendJson('POST', '/tasks', {
    title: readField(input.title).trim(),
    description: readField(input.description).trim(),
    staff_id: readField(input.staffId),
    priority: readField(input.priority).trim(),
    status: readField(input.status).trim(),
    due_date: readField(input.dueDate).trim()
  });
}

async function updateTaskStatus(id, status) {
  return sendJson('PATCH', '/tasks/' + encodeURIComponent(id) + '/status', {
    status: readField(status).trim()
  });
}

async function updateTask(id, details) {
  const input = typeof details === 'object' && details !== null ? details : {};

  return sendJson('PUT', '/tasks/' + encodeURIComponent(id), {
    title: readField(input.title).trim(),
    description: readField(input.description).trim(),
    staff_id: readField(input.staffId),
    priority: readField(input.priority).trim(),
    due_date: readField(input.dueDate).trim()
  });
}

async function deleteTask(id) {
  return sendJson('DELETE', '/tasks/' + encodeURIComponent(id), {});
}

function readField(value) {
  return typeof value === 'string' ? value : '';
}

async function getCurrentAdmin() {
  return request('/auth/me');
}

async function registerAdmin(details) {
  const input = typeof details === 'object' && details !== null ? details : {};

  return postJson('/auth/register', {
    username: readField(input.username).trim(),
    email: readField(input.email).trim(),
    password: readField(input.password),
    full_name: readField(input.fullName).trim()
  });
}

async function loginAdmin(details) {
  const input = typeof details === 'object' && details !== null ? details : {};

  return postJson('/auth/login', {
    email: readField(input.email).trim(),
    password: readField(input.password)
  });
}

async function logoutAdmin() {
  return postJson('/auth/logout', {});
}

async function createStaff(details) {
  const input = typeof details === 'object' && details !== null ? details : {};

  return postJson('/staff', {
    first_name: readField(input.firstName).trim(),
    last_name: readField(input.lastName).trim(),
    email: readField(input.email).trim(),
    phone: readField(input.phone).trim(),
    job_title: readField(input.jobTitle).trim(),
    department_id: readField(input.departmentId),
    role_id: readField(input.roleId),
    location: readField(input.location).trim(),
    avatar_url: readField(input.avatarUrl).trim(),
    bio: readField(input.bio).trim(),
    employment_status: readField(input.employmentStatus).trim()
  });
}

window.StaffDirectoryApi = {
  getStaff,
  getStaffById,
  getDepartments,
  getRoles,
  getHealth,
  getDashboard,
  getCurrentAdmin,
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  createStaff,
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  ApiError
};
