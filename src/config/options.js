/*
 * Pure resolvers for optional PostgreSQL settings, kept separate from
 * config.js so they can be tested without touching the environment.
 */

/* Generous for this small application, short enough to free a stuck pool slot. */
const DEFAULT_STATEMENT_TIMEOUT_MS = 30000;

function resolveStatementTimeout(env) {
  const parsed = Number(env.PG_STATEMENT_TIMEOUT_MS);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return DEFAULT_STATEMENT_TIMEOUT_MS;
}

/*
 * Seeding is idempotent, but it must not run automatically against PostgreSQL:
 * a first boot could otherwise populate the target before the explicit
 * SQLite -> PostgreSQL import runs. SQLite keeps the old behaviour.
 */
function resolveSeedOnStartup(env, driver) {
  if (typeof env.SEED_ON_STARTUP === 'string' && env.SEED_ON_STARTUP.trim() !== '') {
    return env.SEED_ON_STARTUP.trim().toLowerCase() === 'true';
  }

  return driver === 'sqlite';
}

module.exports = {
  DEFAULT_STATEMENT_TIMEOUT_MS,
  resolveStatementTimeout,
  resolveSeedOnStartup
};
