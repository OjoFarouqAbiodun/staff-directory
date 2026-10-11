const express = require('express');
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/* Every task endpoint requires a valid administrator session. */
router.use(authenticate);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.patch('/:id/status', taskController.updateTaskStatus);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;