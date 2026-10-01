/**
 * Staff Directory - API client.
 *
 * Thin wrapper around the REST API using the browser's native fetch().
 * Responsibilities: building URLs, encoding query parameters, and turning
 * responses into either a plain data value or a thrown Error.
 *
 * Deliberately contains no rendering, DOM, or state-management logic.
 */

const BASE_URL = '/api';

/** Filter keys the backend understands. Anything else is ignored. */
const STAFF_FILTERS = ['search', 'department', 'role', 'status'];

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Pulls the server-provided message out of the project error envelope.
 * Returns null when the body does not follow the expected contract.
 */
function extractServerMessage(payload) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (payload.success === false && payload.error && typeof payload.error.message === 'string') {
    return payload.error.message;
  }

  return null;
}

/**
 * Performs a request and returns the `data` value from a successful response.
 * Any non-2xx response, malformed JSON, or network failure rejects.
 */
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

/**
 * Builds a query string from supported, non-empty filters only.
 * Unsupported keys are ignored rather than rejected, so callers can pass
 * wider objects without leaking unexpected parameters to the server.
 */
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

/**
 * Fetches staff, optionally narrowed by search/department/role/status.
 * @returns {Promise<Array<object>>}
 */
async function getStaff(filters) {
  return request('/staff' + buildStaffQuery(filters));
}

/**
 * Fetches a single staff member.
 * Rejects with a 404 ApiError when the record does not exist.
 * @returns {Promise<object>}
 */
async function getStaffById(id) {
  return request('/staff/' + encodeURIComponent(id));
}

/**
 * Fetches all departments.
 * @returns {Promise<Array<object>>}
 */
async function getDepartments() {
  return request('/departments');
}

/**
 * Fetches all roles.
 * @returns {Promise<Array<object>>}
 */
async function getRoles() {
  return request('/roles');
}

/**
 * Fetches API health status.
 * @returns {Promise<object>}
 */
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
