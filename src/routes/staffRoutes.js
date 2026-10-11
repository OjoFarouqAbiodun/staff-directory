const express = require('express');
const staffController = require('../controllers/staffController');
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/* The directory stays public: reading staff needs no session. */
router.get('/', staffController.getStaff);

/* Only staff creation is administrator-only. */
router.post('/', authenticate, staffController.createStaff);

/*
 * The tasks sub-route is administrator-only and does not change the access
 * rules of the public endpoints above.
 */
router.get('/:id/tasks', authenticate, taskController.getStaffTasks);

router.get('/:id', staffController.getStaffById);

module.exports = router;
