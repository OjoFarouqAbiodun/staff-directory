const crypto = require('crypto');

const ALGORITHM_PREFIX = 'scrypt';
const SALT_BYTES = 16;
const KEY_BYTES = 64;

function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derivedKey = crypto.scryptSync(String(password), salt, KEY_BYTES);

  return [ALGORITHM_PREFIX, salt.toString('hex'), derivedKey.toString('hex')].join('$');
}

function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') {
    return false;
  }

  const parts = storedHash.split('$');

  if (parts.length !== 3 || parts[0] !== ALGORITHM_PREFIX) {
    return false;
  }

  const salt = Buffer.from(parts[1], 'hex');
  const expectedKey = Buffer.from(parts[2], 'hex');

  if (salt.length === 0 || expectedKey.length === 0) {
    return false;
  }

  const actualKey = crypto.scryptSync(String(password), salt, expectedKey.length);

  // timingSafeEqual throws when the buffers differ in length, so compare lengths
  // first and still perform an equal-time comparison before rejecting.
  if (actualKey.length !== expectedKey.length) {
    crypto.timingSafeEqual(actualKey, actualKey);
    return false;
  }

  return crypto.timingSafeEqual(actualKey, expectedKey);
}

module.exports = {
  hashPassword,
  verifyPassword
};
