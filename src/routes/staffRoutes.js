const express = require('express');
const staffController = require('../controllers/staffController');

const router = express.Router();

router.get('/', staffController.getStaff);
router.get('/:id', staffController.getStaffById);

module.exports = router;
