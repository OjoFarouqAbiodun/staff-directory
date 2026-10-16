const sessionService = require('../services/sessionService');

async function authenticate(req, res, next) {
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

  try {
    const admin = await sessionService.resolveSession(sessionId);

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
  } catch (error) {
    next(error);
  }
}

module.exports = authenticate;
