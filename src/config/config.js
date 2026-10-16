const path = require('path');
const { resolveSslMode, sslRootCertFromUrl } = require('./ssl');
const { resolveStatementTimeout, resolveSeedOnStartup } = require('./options');

const rootDir = path.resolve(__dirname, '..', '..');

const SESSION_LIFETIME_DAYS = 7;

/*
 * The PEM file used to verify the server. DB_SSL_CA wins; otherwise a
 * sslrootcert parameter in DATABASE_URL is honoured, because node-postgres reads
 * it and then the URL merge would discard it. Relative paths resolve against the
 * project root so the value never depends on the current directory. The path is
 * never logged and the file's contents are never printed.
 */
function resolveSslCaPath(url) {
  const configured = process.env.DB_SSL_CA || sslRootCertFromUrl(url) || '';

  return configured ? path.resolve(rootDir, configured) : '';
}

/*
 * The application runs on one of two database engines:
 *
 *   - PostgreSQL when DATABASE_URL is supplied (Render/Supabase and any other
 *     hosted deployment), which keeps data across restarts.
 *   - SQLite otherwise (local development and the test suite), using DB_FILE.
 *
 * DATABASE_URL is read from the server environment only; it is never sent to
 * the browser and must never be logged.
 */
const databaseUrl = process.env.DATABASE_URL || '';
const databaseDriver = databaseUrl ? 'postgres' : 'sqlite';

module.exports = {
  port: Number(process.env.PORT) || 3000,

  databaseUrl,
  databaseDriver,

  /*
   * TLS is on by default for a remote DATABASE_URL with certificate
   * verification enabled. DB_SSL=no-verify (TLS without verification) and
   * DB_SSL=false (no TLS) are explicit, local-development-only opt-outs.
   * DB_SSL_CA names a PEM file used to verify a private CA, such as the
   * Supabase CA. None of these values is derived from the URL text and the URL
   * is never logged.
   */
  databaseSslMode: databaseUrl ? resolveSslMode(process.env) : 'disable',
  databaseSslCaPath: resolveSslCaPath(databaseUrl),

  /* Per-connection statement timeout; see resolveStatementTimeout. */
  databaseStatementTimeoutMs: resolveStatementTimeout(process.env),

  /*
   * Seeding is idempotent, but on PostgreSQL it is disabled by default so a
   * first boot cannot silently populate the target before the explicit
   * SQLite -> PostgreSQL import runs. Opt back in with SEED_ON_STARTUP=true.
   */
  seedOnStartup: resolveSeedOnStartup(process.env, databaseDriver),

  dbFile: process.env.DB_FILE
    ? path.resolve(process.env.DB_FILE)
    : path.join(rootDir, 'data', 'staff-directory.db'),

  dataDir: path.join(rootDir, 'data'),
  publicDir: path.join(rootDir, 'public'),

  session: {
    cookieName: 'admin_session',
    lifetimeDays: SESSION_LIFETIME_DAYS,
    maxAgeSeconds: SESSION_LIFETIME_DAYS * 24 * 60 * 60,
    secure: process.env.NODE_ENV === 'production'
  }
};
