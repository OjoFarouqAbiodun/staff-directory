const staffRepository = require('../repositories/staffRepository');
const taskRepository = require('../repositories/taskRepository');

const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const ALLOWED_STATUSES = ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;

const DEFAULT_PRIORITY = 'Medium';
const DEFAULT_STATUS = 'Pending';

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

function readBody(req) {
  return req.body && typeof req.body === 'object' ? req.body : {};
}

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function readFilter(query, key) {
  const value = query ? query[key] : undefined;

  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

/*
 * "Missing" (not supplied) is separate from "supplied but unusable": the
 * staff_id field is required, so only a well-formed positive integer is valid.
 */
function readId(value) {
  if (value === undefined || value === null || value === '') {
    return { supplied: false, valid: false, value: null };
  }

  const numeric = typeof value === 'number' ? value : Number(readString(value));

  if (!Number.isInteger(numeric) || numeric < 1) {
    return { supplied: true, valid: false, value: null };
  }

  return { supplied: true, valid: true, value: numeric };
}

/* Optional columns become NULL rather than an empty string. */
function readOptionalText(value) {
  const text = readString(value);
  return text === '' ? null : text;
}

/*
 * Due dates use the ISO YYYY-MM-DD format and must be real calendar dates:
 * 2026-02-30 is rejected because it rolls over to March.
 */
function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parts = value.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isForeignKeyConstraintError(error) {
  return Boolean(error && error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY');
}

function getTasks(req, res) {
  try {
    const filters = {};

    const staffId = readFilter(req.query, 'staff_id');
    if (staffId) {
      const parsed = readId(staffId);
      if (!parsed.valid || !staffRepository.findById(parsed.value)) {
        sendError(res, 400, 'Select a valid staff member');
        return;
      }
      filters.staffId = parsed.value;
    }

    const status = readFilter(req.query, 'status');
    if (status) {
      if (ALLOWED_STATUSES.indexOf(status) === -1) {
        sendError(res, 400, 'Status must be Pending, In Progress, Completed, On Hold or Cancelled');
        return;
      }
      filters.status = status;
    }

    const priority = readFilter(req.query, 'priority');
    if (priority) {
      if (ALLOWED_PRIORITIES.indexOf(priority) === -1) {
        sendError(res, 400, 'Priority must be Low, Medium, High or Urgent');
        return;
      }
      filters.priority = priority;
    }

    sendSuccess(res, taskRepository.findAll(filters));
  } catch (error) {
    console.error('Failed to load tasks:', error.message);
    sendError(res, 500, 'Unable to load tasks');
  }
}

function getTaskById(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    sendError(res, 400, 'Invalid task id');
    return;
  }

  try {
    const task = taskRepository.findById(id);

    if (!task) {
      sendError(res, 404, 'Task not found');
      return;
    }

    sendSuccess(res, task);
  } catch (error) {
    console.error('Failed to load task:', error.message);
    sendError(res, 500, 'Unable to load task');
  }
}

function readTaskInput(req) {
  const body = readBody(req);

  return {
    title: readString(body.title),
    description: readOptionalText(body.description),
    staffId: readId(body.staff_id),
    priority: readString(body.priority),
    status: readString(body.status),
    dueDate: readOptionalText(body.due_date)
  };
}

function validateTaskInput(input) {
  if (!input.title) {
    return 'Title is required';
  }

  if (input.title.length > TITLE_MAX) {
    return 'Title must be 200 characters or fewer';
  }

  if (input.description && input.description.length > DESCRIPTION_MAX) {
    return 'Description must be 2000 characters or fewer';
  }

  if (!input.staffId.supplied) {
    return 'Staff is required';
  }

  if (!input.staffId.valid) {
    return 'Select a valid staff member';
  }

  if (input.priority && ALLOWED_PRIORITIES.indexOf(input.priority) === -1) {
    return 'Priority must be Low, Medium, High or Urgent';
  }

  if (input.status && ALLOWED_STATUSES.indexOf(input.status) === -1) {
    return 'Status must be Pending, In Progress, Completed, On Hold or Cancelled';
  }

  if (input.dueDate !== null && !isValidDateString(input.dueDate)) {
    return 'Due date must be a valid date in YYYY-MM-DD format';
  }

  return null;
}

function createTask(req, res) {
  const input = readTaskInput(req);
  const validationError = validateTaskInput(input);

  if (validationError) {
    sendError(res, 400, validationError);
    return;
  }

  try {
    if (!staffRepository.findById(input.staffId.value)) {
      sendError(res, 400, 'Select a valid staff member');
      return;
    }

    let taskId;

    try {
      /* The creator is the authenticated administrator; the body is ignored. */
      taskId = taskRepository.create({
        title: input.title,
        description: input.description,
        staffId: input.staffId.value,
        priority: input.priority || DEFAULT_PRIORITY,
        status: input.status || DEFAULT_STATUS,
        dueDate: input.dueDate,
        createdByAdminId: req.admin.id
      });
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        sendError(res, 400, 'Select a valid staff member');
        return;
      }

      throw error;
    }

    const task = taskRepository.findById(taskId);

    if (!task) {
      sendError(res, 500, 'Unable to create task');
      return;
    }

    sendSuccess(res, task, 201);
  } catch (error) {
    console.error('Failed to create task:', error.message);
    sendError(res, 500, 'Unable to create task');
  }
}

function updateTaskStatus(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    sendError(res, 400, 'Invalid task id');
    return;
  }

  const body = readBody(req);
  const keys = Object.keys(body);

  /* The only editable field on this endpoint is status. */
  if (keys.length !== 1 || keys[0] !== 'status') {
    sendError(res, 400, 'Only status may be updated');
    return;
  }

  const status = readString(body.status);

  if (ALLOWED_STATUSES.indexOf(status) === -1) {
    sendError(res, 400, 'Status must be Pending, In Progress, Completed, On Hold or Cancelled');
    return;
  }

  try {
    const task = taskRepository.findById(id);

    if (!task) {
      sendError(res, 404, 'Task not found');
      return;
    }

    taskRepository.updateStatus(id, status);

    sendSuccess(res, taskRepository.findById(id));
  } catch (error) {
    console.error('Failed to update task status:', error.message);
    sendError(res, 500, 'Unable to update task status');
  }
}

/*
 * PUT updates the editable task details. Optional fields distinguish "not
 * present" (leave the current value alone) from an explicit empty value
 * (clear the field to NULL). Status, the task id, the creator and the
 * creation timestamp can never be changed here.
 */
function readPutTaskInput(req) {
  const body = readBody(req);

  function readPutValue(value) {
    if (value === undefined || value === null || typeof value !== 'string') {
      return undefined;
    }

    const text = value.trim();
    return text === '' ? null : text;
  }

  function readPutPriority(value) {
    if (value === undefined || value === null || typeof value !== 'string') {
      return undefined;
    }

    const text = value.trim();
    return text === '' ? undefined : text;
  }

  return {
    title: readString(body.title),
    staffId: readId(body.staff_id),
    priority: readPutPriority(body.priority),
    description: readPutValue(body.description),
    dueDate: readPutValue(body.due_date)
  };
}

function validatePutTaskInput(input) {
  if (!input.title) {
    return 'Title is required';
  }

  if (input.title.length > TITLE_MAX) {
    return 'Title must be 200 characters or fewer';
  }

  if (!input.staffId.supplied) {
    return 'Staff is required';
  }

  if (!input.staffId.valid) {
    return 'Select a valid staff member';
  }

  if (input.priority !== undefined && ALLOWED_PRIORITIES.indexOf(input.priority) === -1) {
    return 'Priority must be Low, Medium, High or Urgent';
  }

  if (
    input.description !== undefined &&
    input.description !== null &&
    input.description.length > DESCRIPTION_MAX
  ) {
    return 'Description must be 2000 characters or fewer';
  }

  if (input.dueDate !== undefined && input.dueDate !== null && !isValidDateString(input.dueDate)) {
    return 'Due date must be a valid date in YYYY-MM-DD format';
  }

  return null;
}

function updateTask(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    sendError(res, 400, 'Invalid task id');
    return;
  }

  const input = readPutTaskInput(req);
  const validationError = validatePutTaskInput(input);

  if (validationError) {
    sendError(res, 400, validationError);
    return;
  }

  try {
    if (!taskRepository.findById(id)) {
      sendError(res, 404, 'Task not found');
      return;
    }

    if (!staffRepository.findById(input.staffId.value)) {
      sendError(res, 400, 'Select a valid staff member');
      return;
    }

    taskRepository.update(id, {
      title: input.title,
      staffId: input.staffId.value,
      priority: input.priority,
      description: input.description,
      dueDate: input.dueDate
    });

    sendSuccess(res, taskRepository.findById(id));
  } catch (error) {
    console.error('Failed to update task:', error.message);
    sendError(res, 500, 'Unable to update task');
  }
}

function deleteTask(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    sendError(res, 400, 'Invalid task id');
    return;
  }

  try {
    const changes = taskRepository.remove(id);

    if (!changes) {
      sendError(res, 404, 'Task not found');
      return;
    }

    sendSuccess(res, { message: 'Task deleted' });
  } catch (error) {
    console.error('Failed to delete task:', error.message);
    sendError(res, 500, 'Unable to delete task');
  }
}

function getStaffTasks(req, res) {
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

    const status = readFilter(req.query, 'status');

    if (status && ALLOWED_STATUSES.indexOf(status) === -1) {
      sendError(res, 400, 'Status must be Pending, In Progress, Completed, On Hold or Cancelled');
      return;
    }

    sendSuccess(res, taskRepository.findByStaffId(id, status || undefined));
  } catch (error) {
    console.error('Failed to load staff tasks:', error.message);
    sendError(res, 500, 'Unable to load staff tasks');
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getStaffTasks
};