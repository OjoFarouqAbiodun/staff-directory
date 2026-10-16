const app = require('./src/app');
const config = require('./src/config/config');
const db = require('./src/database/db');
const { seedDatabase } = require('./src/database/seed');

const PORT = Number(process.env.PORT) || 3000;

/*
 * Schema creation is idempotent and always runs. Seeding is idempotent too, but
 * on PostgreSQL it is disabled by default (config.seedOnStartup) so a first boot
 * cannot silently populate the target before the explicit SQLite -> PostgreSQL
 * import runs. The import itself is deliberately NOT run here; it lives in
 * scripts/migrate-sqlite-to-postgres.js and is invoked once, by hand.
 */
async function start() {
  try {
    if (config.seedOnStartup) {
      const counts = await seedDatabase();

      console.log('Database ready (' + db.driver + ')');
      console.log('  departments: ' + counts.departments);
      console.log('  roles: ' + counts.roles);
      console.log('  staff: ' + counts.staff);
    } else {
      await db.initializeSchema();

      console.log(
        'Database ready (' +
          db.driver +
          '); startup seeding is disabled. Run "npm run db:seed" to insert ' +
          'reference data, or set SEED_ON_STARTUP=true.'
      );
    }
  } catch (error) {
    console.error('Database initialization failed: ' + error.message);
    console.error(error.stack);
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port ' + PORT);
  });
}

async function shutdown(signal) {
  console.log(signal + ' received, closing database connection');
  await db.close();
  process.exit(0);
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

start();
