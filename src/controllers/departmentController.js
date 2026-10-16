const departmentRepository = require('../repositories/departmentRepository');

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

async function getDepartments(req, res) {
  try {
    sendSuccess(res, await departmentRepository.findAll());
  } catch (error) {
    console.error('Failed to load departments:', error.message);
    sendError(res, 500, 'Unable to load departments');
  }
}

async function getDepartmentById(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    sendError(res, 400, 'Invalid department id');
    return;
  }

  try {
    const department = await departmentRepository.findById(id);

    if (!department) {
      sendError(res, 404, 'Department not found');
      return;
    }

    sendSuccess(res, department);
  } catch (error) {
    console.error('Failed to load department:', error.message);
    sendError(res, 500, 'Unable to load department');
  }
}

module.exports = {
  getDepartments,
  getDepartmentById
};
