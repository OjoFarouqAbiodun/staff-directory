const API_PREFIX = '/api';

const INTERNAL_SERVER_ERROR = 500;
const GENERIC_MESSAGE = 'Internal server error';

function isApiRequest(req) {
  const originalUrl = req.originalUrl || req.url || '';
  const pathname = originalUrl.split('?')[0];

  return pathname === API_PREFIX || pathname.startsWith(API_PREFIX + '/');
}

function resolveStatus(err) {
  const candidate = err && (err.status || err.statusCode);

  if (typeof candidate !== 'number' || !Number.isInteger(candidate)) {
    return INTERNAL_SERVER_ERROR;
  }

  if (candidate < 400 || candidate > 599) {
    return INTERNAL_SERVER_ERROR;
  }

  return candidate;
}

function errorHandler(err, req, res, next) {
  const status = resolveStatus(err);

  console.error('Unhandled error:', err && (err.stack || err.message || err));

  if (res.headersSent) {
    return;
  }

  if (isApiRequest(req)) {
    res.status(status).json({
      success: false,
      error: {
        message: status === INTERNAL_SERVER_ERROR ? GENERIC_MESSAGE : 'Request failed'
      }
    });
    return;
  }

  res.status(status).send(status === INTERNAL_SERVER_ERROR ? 'Internal server error' : 'Request failed');
}

module.exports = errorHandler;
