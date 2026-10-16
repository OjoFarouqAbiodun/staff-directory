const config = require('../config/config');
const adminRepository = require('../repositories/adminRepository');
const passwordService = require('../services/passwordService');
const sessionService = require('../services/sessionService');
const { isUniqueConstraintError } = require('../database/errors');
const { serializeCookie } = require('../utils/cookies');

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const USERNAME_MIN = 3;
const USERNAME_MAX = 32;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const FULL_NAME_MIN = 2;
const FULL_NAME_MAX = 100;
const EMAIL_MAX = 254;

const DUPLICATE_STATUS = 409;

function sendSuccess(res, data, status) {
  res.status(status || 200).json({
    success: true,
    data
  });
}

function sendError(res, status, message) {
  res.status(status).json({
    success: false,
    error: {
      message
    }
  });
}

function readBody(req) {
  return req.body && typeof req.body === 'object' ? req.body : {};
}

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  return readString(value).toLowerCase();
}

function toSafeAdmin(admin) {
  return {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    full_name: admin.full_name
  };
}

function buildSessionCookie(sessionId) {
  return serializeCookie(config.session.cookieName, sessionId, {
    maxAgeSeconds: config.session.maxAgeSeconds,
    httpOnly: true,
    sameSite: 'lax',
    secure: config.session.secure,
    path: '/'
  });
}

function buildClearCookie() {
  return serializeCookie(config.session.cookieName, '', {
    maxAgeSeconds: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure: config.session.secure,
    path: '/'
  });
}

async function startAuthenticatedSession(res, adminId) {
  const sessionId = await sessionService.startSession(adminId);

  res.append('Set-Cookie', buildSessionCookie(sessionId));
}

function readRegistrationInput(req) {
  const body = readBody(req);

  return {
    username: readString(body.username),
    email: normalizeEmail(body.email),
    password: typeof body.password === 'string' ? body.password : '',
    fullName: readString(body.full_name)
  };
}

function validateRegistration(input) {
  if (!input.username) {
    return 'Username is required';
  }

  if (
    input.username.length < USERNAME_MIN ||
    input.username.length > USERNAME_MAX ||
    !USERNAME_PATTERN.test(input.username)
  ) {
    return (
      'Username must be ' +
      USERNAME_MIN +
      '-' +
      USERNAME_MAX +
      ' characters and may only contain letters, numbers, periods, dashes and underscores'
    );
  }

  if (!input.email) {
    return 'Email is required';
  }

  if (input.email.length > EMAIL_MAX || !EMAIL_PATTERN.test(input.email)) {
    return 'Email must be a valid email address';
  }

  if (!input.password) {
    return 'Password is required';
  }

  if (input.password.trim().length < PASSWORD_MIN || input.password.length > PASSWORD_MAX) {
    return 'Password must be between ' + PASSWORD_MIN + ' and ' + PASSWORD_MAX + ' characters';
  }

  if (!input.fullName) {
    return 'Full name is required';
  }

  if (input.fullName.length < FULL_NAME_MIN || input.fullName.length > FULL_NAME_MAX) {
    return 'Full name must be between ' + FULL_NAME_MIN + ' and ' + FULL_NAME_MAX + ' characters';
  }

  return null;
}

async function register(req, res) {
  try {
    const input = readRegistrationInput(req);
    const validationError = validateRegistration(input);

    if (validationError) {
      sendError(res, 400, validationError);
      return;
    }

    if (await adminRepository.usernameExists(input.username)) {
      sendError(res, DUPLICATE_STATUS, 'Username is already taken');
      return;
    }

    if (await adminRepository.emailExists(input.email)) {
      sendError(res, DUPLICATE_STATUS, 'Email address is already registered');
      return;
    }

    let adminId;

    try {
      adminId = await adminRepository.create({
        username: input.username,
        email: input.email,
        passwordHash: passwordService.hashPassword(input.password),
        fullName: input.fullName
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        sendError(res, DUPLICATE_STATUS, 'Username or email is already registered');
        return;
      }

      throw error;
    }

    await startAuthenticatedSession(res, adminId);

    sendSuccess(
      res,
      { admin: { id: adminId, username: input.username, email: input.email, full_name: input.fullName } },
      201
    );
  } catch (error) {
    console.error('Failed to register administrator:', error.message);
    sendError(res, 500, 'Unable to register administrator');
  }
}

let timingPadHash = null;

function getTimingPadHash() {
  if (!timingPadHash) {
    timingPadHash = passwordService.hashPassword('timing-parity-placeholder-value');
  }

  return timingPadHash;
}

async function login(req, res) {
  try {
    const body = readBody(req);
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !EMAIL_PATTERN.test(email)) {
      sendError(res, 400, 'Email is required and must be a valid email address');
      return;
    }

    if (!password) {
      sendError(res, 400, 'Password is required');
      return;
    }

    const credentials = await adminRepository.findCredentialsByEmail(email);
    const passwordMatches = passwordService.verifyPassword(
      password,
      credentials ? credentials.password_hash : getTimingPadHash()
    );

    if (!credentials || !passwordMatches) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    await startAuthenticatedSession(res, credentials.id);

    sendSuccess(res, { admin: toSafeAdmin(credentials) });
  } catch (error) {
    console.error('Failed to log in:', error.message);
    sendError(res, 500, 'Unable to log in');
  }
}

async function logout(req, res) {
  res.append('Set-Cookie', buildClearCookie());

  try {
    const sessionId = sessionService.getSessionId(req);

    if (sessionId) {
      await sessionService.endSession(sessionId);
    }

    sendSuccess(res, { message: 'Signed out' });
  } catch (error) {
    console.error('Failed to log out:', error.message);
    sendError(res, 500, 'Unable to log out');
  }
}

function me(req, res) {
  if (!req.admin) {
    sendError(res, 401, 'Authentication required');
    return;
  }

  sendSuccess(res, { admin: toSafeAdmin(req.admin) });
}

module.exports = {
  register,
  login,
  logout,
  me
};
