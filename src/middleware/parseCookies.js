const { parseCookieHeader } = require('../utils/cookies');

function parseCookies(req, res, next) {
  req.cookies = parseCookieHeader(req.headers.cookie);

  next();
}

module.exports = parseCookies;
