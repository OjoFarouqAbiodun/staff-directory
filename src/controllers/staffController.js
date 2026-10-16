const staffRepository = require('../repositories/staffRepository');
const departmentRepository = require('../repositories/departmentRepository');
const roleRepository = require('../repositories/roleRepository');
const { isForeignKeyConstraintError, isUniqueConstraintError } = require('../database/errors');

const SUPPORTED_FILTERS = ['search', 'department', 'role', 'status'];
const SUPPORTED_STATUSES = ['Active', 'On Leave', 'Inactive'];

/* Same shape the authentication controller already uses. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMAIL_MAX = 254;

const DUPLICATE_STATUS = 409;

function sendSuccess(res, data, status) {
  res.status(status || 200).json({
    success: true,
    data
  });
}

function sendError(res, status, message) {
  res.status(status).json({
    success: false,
    error: {
      message
    }
  });
}

function readFilter(query, key) {
  const value = query ? query[key] : undefined;

  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

async function getStaff(req, res) {
  try {
    const filters = {};

    for (const key of SUPPORTED_FILTERS) {
      filters[key] = readFilter(req.query, key);
    }

    sendSuccess(res, await staffRepository.findAll(filters));
  } catch (error) {
    console.error('Failed to load staff:', error.message);
    sendError(res, 500, 'Unable to load staff');
  }
}

async function getStaffById(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    sendError(res, 400, 'Invalid staff id');
    return;
  }

  try {
    const staff = await staffRepository.findById(id);

    if (!staff) {
      sendError(res, 404, 'Staff member not found');
      return;
    }

    sendSuccess(res, staff);
  } catch (error) {
    console.error('Failed to load staff member:', error.message);
    sendError(res, 500, 'Unable to load staff member');
  }
}

function readBody(req) {
  return req.body && typeof req.body === 'object' ? req.body : {};
}

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/* Optional columns become NULL rather than an empty string. */
function readOptionalText(value) {
  const text = readString(value);
  return text === '' ? null : text;
}

/*
 * "Not supplied" (missing, null or an empty string) is kept apart from
 * "supplied but unusable". Only the second one is a client error, because
 * department_id and role_id are nullable in the schema.
 */
function readReferenceId(value) {
  if (value === undefined || value === null || value === '') {
    return { supplied: false, valid: true, value: null };
  }

  const numeric = typeof value === 'number' ? value : Number(readString(value));

  if (!Number.isInteger(numeric) || numeric < 1) {
    return { supplied: true, valid: false, value: null };
  }

  return { supplied: true, valid: true, value: numeric };
}

function readCreationInput(req) {
  const body = readBody(req);

  return {
    firstName: readString(body.first_name),
    lastName: readString(body.last_name),
    email: readString(body.email),
    phone: readOptionalText(body.phone),
    jobTitle: readOptionalText(body.job_title),
    departmentId: readReferenceId(body.department_id),
    roleId: readReferenceId(body.role_id),
    location: readOptionalText(body.location),
    avatarUrl: readOptionalText(body.avatar_url),
    bio: readOptionalText(body.bio),
    employmentStatus: readString(body.employment_status)
  };
}

function validateCreationInput(input) {
  if (!input.firstName) {
    return 'First name is required';
  }

  if (!input.lastName) {
    return 'Last name is required';
  }

  if (!input.email) {
    return 'Email is required';
  }

  if (input.email.length > EMAIL_MAX || !EMAIL_PATTERN.test(input.email)) {
    return 'Email must be a valid email address';
  }

  if (!input.employmentStatus) {
    return 'Employment status is required';
  }

  if (SUPPORTED_STATUSES.indexOf(input.employmentStatus) === -1) {
    return 'Employment status must be Active, On Leave or Inactive';
  }

  if (!input.departmentId.valid) {
    return 'Select a valid department';
  }

  if (!input.roleId.valid) {
    return 'Select a valid role';
  }

  return null;
}

async function createStaff(req, res) {
  const input = readCreationInput(req);
  const validationError = validateCreationInput(input);

  if (validationError) {
    sendError(res, 400, validationError);
    return;
  }

  try {
    if (input.departmentId.supplied && !(await departmentRepository.findById(input.departmentId.value))) {
      sendError(res, 400, 'Select a valid department');
      return;
    }

    if (input.roleId.supplied && !(await roleRepository.findById(input.roleId.value))) {
      sendError(res, 400, 'Select a valid role');
      return;
    }

    if (await staffRepository.emailExists(input.email)) {
      sendError(res, DUPLICATE_STATUS, 'A staff member with this email address already exists');
      return;
    }

    let staffId;

    try {
      staffId = await staffRepository.create({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        jobTitle: input.jobTitle,
        departmentId: input.departmentId.supplied ? input.departmentId.value : null,
        roleId: input.roleId.supplied ? input.roleId.value : null,
        location: input.location,
        avatarUrl: input.avatarUrl,
        bio: input.bio,
        employmentStatus: input.employmentStatus
      });
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        sendError(res, 400, 'Select a valid department or role');
        return;
      }

      if (isUniqueConstraintError(error)) {
        sendError(res, DUPLICATE_STATUS, 'A staff member with this email address already exists');
        return;
      }

      throw error;
    }

    const staff = await staffRepository.findById(staffId);

    if (!staff) {
      sendError(res, 500, 'Unable to add staff member');
      return;
    }

    sendSuccess(res, staff, 201);
  } catch (error) {
    console.error('Failed to add staff member:', error.message);
    sendError(res, 500, 'Unable to add staff member');
  }
}

module.exports = {
  getStaff,
  getStaffById,
  createStaff
};
