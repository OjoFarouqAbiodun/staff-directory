const API_PREFIX = '/api';

function isApiRequest(req) {
  const originalUrl = req.originalUrl || req.url || '';
  const pathname = originalUrl.split('?')[0];

  return pathname === API_PREFIX || pathname.startsWith(API_PREFIX + '/');
}

function notFound(req, res) {
  if (isApiRequest(req)) {
    res.status(404).json({
      success: false,
      error: {
        message: 'Route not found'
      }
    });
    return;
  }

  res.status(404).send('Not found');
}

module.exports = notFound;
