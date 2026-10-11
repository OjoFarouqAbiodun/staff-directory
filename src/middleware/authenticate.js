const sessionService = require('../services/sessionService');

function authenticate(req, res, next) {
  const sessionId = sessionService.getSessionId(req);

  if (!sessionId) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required'
      }
    });
    return;
  }

  const admin = sessionService.resolveSession(sessionId);

  if (!admin) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Session is invalid or has expired'
      }
    });
    return;
  }

  req.admin = admin;

  next();
}

module.exports = authenticate;
