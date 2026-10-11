const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/* The dashboard summarises internal data, so a session is required. */
router.use(authenticate);

router.get('/', dashboardController.getDashboard);

module.exports = router;