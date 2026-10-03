const app = require('./src/app');
const { getDatabase, initializeSchema } = require('./src/database/db');
const { seedDatabase } = require('./src/database/seed');

const PORT = process.env.PORT || 3000;

function initializeDatabase() {
  getDatabase();
  initializeSchema();

  const counts = seedDatabase();
  getDatabase();

  console.log(
    'Database ready with ' +
      counts.departments +
      ' departments, ' +
      counts.roles +
      ' roles and ' +
      counts.staff +
      ' staff records'
  );
}

try {
  initializeDatabase();
} catch (error) {
  console.error('Database initialization failed: ' + error.message);
  console.error(error.stack);
  process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
