/*
 * Safety net for node-postgres pools.
 *
 * An error on an idle pooled connection is emitted as an 'error' event. With no
 * listener, Node treats that as an unhandled 'error' event and terminates the
 * process, so getPool() always installs one. The message is sanitised first:
 * a connection failure must never echo the connection string or its password.
 */

const CONNECTION_STRING_PATTERN = /\b(?:postgres|postgresql):\/\/\S+/gi;
const KEY_VALUE_SECRET_PATTERN = /\b(?:password|passwd|pwd)\s*=\s*\S+/gi;

function redactSecrets(text) {
  if (typeof text !== 'string' || text === '') {
    return '';
  }

  return text
    .replace(CONNECTION_STRING_PATTERN, '[redacted connection string]')
    .replace(KEY_VALUE_SECRET_PATTERN, '[redacted secret]');
}

function describePoolError(error, logger) {
  const raw = error && typeof error.message === 'string' ? error.message : 'unknown error';
  const message = 'PostgreSQL pool error: ' + redactSecrets(raw);

  if (typeof logger === 'function') {
    logger(message);
  }

  return message;
}

function attachPoolErrorHandler(pool, logger) {
  pool.on('error', (error) => {
    describePoolError(error, logger);
  });

  return pool;
}

module.exports = {
  redactSecrets,
  describePoolError,
  attachPoolErrorHandler
};
