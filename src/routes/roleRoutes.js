const express = require('express');
const roleController = require('../controllers/roleController');

const router = express.Router();

router.get('/', roleController.getRoles);
router.get('/:id', roleController.getRoleById);

module.exports = router;
