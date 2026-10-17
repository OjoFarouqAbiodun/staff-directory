const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

/*
 * Authentication responses reflect per-session state, so they must never be
 * stored or reused by a browser or intermediary cache. Scoping the header to
 * this router leaves the useful ETag revalidation of the public directory
 * endpoints untouched.
 */
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
