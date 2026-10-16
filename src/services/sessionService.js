const crypto = require('crypto');
const config = require('../config/config');
const adminRepository = require('../repositories/adminRepository');
const sessionRepository = require('../repositories/sessionRepository');

const SESSION_ID_BYTES = 32;

function generateSessionId() {
  return crypto.randomBytes(SESSION_ID_BYTES).toString('base64url');
}

async function startSession(adminId) {
  const sessionId = generateSessionId();

  await sessionRepository.create(sessionId, adminId, config.session.lifetimeDays);

  return sessionId;
}

async function endSession(sessionId) {
  return sessionRepository.remove(sessionId);
}

async function resolveSession(sessionId) {
  const session = await sessionRepository.findActive(sessionId);

  if (!session) {
    return null;
  }

  return adminRepository.findById(session.admin_id);
}

function getSessionId(req) {
  if (!req.cookies) {
    return '';
  }

  const value = req.cookies[config.session.cookieName];

  return typeof value === 'string' ? value : '';
}

module.exports = {
  startSession,
  endSession,
  resolveSession,
  getSessionId
};
