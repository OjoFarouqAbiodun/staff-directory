const staffRepository = require('../repositories/staffRepository');

const SUPPORTED_FILTERS = ['search', 'department', 'role', 'status'];

function sendSuccess(res, data) {
  res.json({
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

function getStaff(req, res) {
  try {
    const filters = {};

    for (const key of SUPPORTED_FILTERS) {
      filters[key] = readFilter(req.query, key);
    }

    sendSuccess(res, staffRepository.findAll(filters));
  } catch (error) {
    console.error('Failed to load staff:', error.message);
    sendError(res, 500, 'Unable to load staff');
  }
}

function getStaffById(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    sendError(res, 400, 'Invalid staff id');
    return;
  }

  try {
    const staff = staffRepository.findById(id);

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

module.exports = {
  getStaff,
  getStaffById
};
