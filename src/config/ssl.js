/*
 * PostgreSQL TLS policy.
 *
 * Remote connections verify the server certificate by default. The insecure
 * options exist only for local development against a self-signed certificate
 * (DB_SSL=no-verify) or a server without TLS (DB_SSL=false), and both must be
 * requested explicitly. DATABASE_URL is never part of the values built here.
 */

/*
 * Map the DB_SSL environment value to a mode. Anything unrecognised falls back
 * to full verification, so an accidental typo can never weaken TLS.
 */
function resolveSslMode(env) {
  const raw = typeof env.DB_SSL === 'string' ? env.DB_SSL.trim().toLowerCase() : '';

  if (raw === 'false' || raw === 'disable') {
    return 'disable';
  }

  if (raw === 'no-verify') {
    return 'no-verify';
  }

  return 'verify';
}

/*
 * Translate a mode into the node-postgres `ssl` option. `ca` is an optional PEM
 * string used to verify a private CA (for example the Supabase CA).
 */
function buildSslOptions(mode, ca) {
  if (mode === 'disable') {
    return false;
  }

  const options = { rejectUnauthorized: mode === 'verify' };

  if (ca) {
    options.ca = ca;
  }

  return options;
}

/*
 * Query-string parameters that node-postgres' connection-string parser turns
 * into the `ssl` option. ConnectionParameters merges the parsed URL *over* the
 * options object we pass (pg/lib/connection-parameters.js), so any of these in
 * DATABASE_URL replaces the value built above -- most commonly dropping DB_SSL_CA
 * and producing SELF_SIGNED_CERT_IN_CHAIN. Removing them keeps DB_SSL and
 * DB_SSL_CA the single source of truth for TLS.
 */
const SSL_URL_PARAMETERS = [
  'ssl',
  'sslmode',
  'sslrootcert',
  'sslcert',
  'sslkey',
  'sslpassword',
  'sslcrl',
  'sslcrldir',
  'sslsni',
  'requiressl',
  'uselibpqcompat',
  'sslnegotiation'
];

/*
 * Drop TLS-related query parameters from a connection string. Host, port,
 * credentials, database and unrelated options are preserved verbatim. The
 * returned value is still a secret and must never be logged.
 */
function stripSslUrlParameters(connectionString) {
  if (typeof connectionString !== 'string' || connectionString === '') {
    return connectionString;
  }

  const queryIndex = connectionString.indexOf('?');

  if (queryIndex === -1) {
    return connectionString;
  }

  const base = connectionString.slice(0, queryIndex);
  const kept = connectionString
    .slice(queryIndex + 1)
    .split('&')
    .filter((pair) => pair !== '' && SSL_URL_PARAMETERS.indexOf(pair.split('=')[0].toLowerCase()) === -1);

  return kept.length === 0 ? base : base + '?' + kept.join('&');
}

module.exports = {
  resolveSslMode,
  buildSslOptions,
  stripSslUrlParameters
};
