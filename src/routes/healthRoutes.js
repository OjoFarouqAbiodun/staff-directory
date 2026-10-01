const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'Staff Directory API',
      uptime: Math.round(process.uptime())
    }
  });
});

module.exports = router;
