const roleRepository = require('../repositories/roleRepository');

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

function getRoles(req, res) {
  try {
    sendSuccess(res, roleRepository.findAll());
  } catch (error) {
    console.error('Failed to load roles:', error.message);
    sendError(res, 500, 'Unable to load roles');
  }
}

function getRoleById(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    sendError(res, 400, 'Invalid role id');
    return;
  }

  try {
    const role = roleRepository.findById(id);

    if (!role) {
      sendError(res, 404, 'Role not found');
      return;
    }

    sendSuccess(res, role);
  } catch (error) {
    console.error('Failed to load role:', error.message);
    sendError(res, 500, 'Unable to load role');
  }
}

module.exports = {
  getRoles,
  getRoleById
};
