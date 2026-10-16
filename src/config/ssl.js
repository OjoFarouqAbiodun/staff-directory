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

module.exports = {
  resolveSslMode,
  buildSslOptions
};
