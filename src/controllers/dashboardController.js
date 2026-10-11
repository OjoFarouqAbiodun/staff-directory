const dashboardRepository = require('../repositories/dashboardRepository');

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

/*
 * Everything the dashboard shows is derived from the current database at
 * request time. The lists are small and bounded (no pagination needed): the
 * ten oldest overdue tasks, the five most recently updated and the five staff
 * members carrying the most open tasks.
 */
function getDashboard(req, res) {
  try {
    const staff = dashboardRepository.getStaffSummary();
    const tasks = dashboardRepository.getTaskSummary();

    sendSuccess(res, {
      staff,
      tasks: Object.assign({}, tasks, {
        overdue_tasks: dashboardRepository.getOverdueTasks(),
        recent_tasks: dashboardRepository.getRecentTasks(),
        top_open_staff: dashboardRepository.getTopOpenStaff()
      })
    });
  } catch (error) {
    console.error('Failed to load dashboard:', error.message);
    sendError(res, 500, 'Unable to load the dashboard');
  }
}

module.exports = {
  getDashboard
};