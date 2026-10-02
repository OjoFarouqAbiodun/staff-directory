
const BASE_URL = '/api';

const STAFF_FILTERS = ['search', 'department', 'role', 'status'];

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

async function request(path) {
  let response;

  try {
    response = await fetch(BASE_URL + path, {
      headers: {
        Accept: 'application/json'
      }
    });
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

window.StaffDirectoryApi = {
  getStaff,
  getStaffById,
  getDepartments,
  getRoles,
  getHealth
};
