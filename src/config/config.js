const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

module.exports = {
  port: Number(process.env.PORT) || 3000,

  dbFile: process.env.DB_FILE
    ? path.resolve(process.env.DB_FILE)
    : path.join(rootDir, 'data', 'staff-directory.db'),

  dataDir: path.join(rootDir, 'data'),
  publicDir: path.join(rootDir, 'public')
};
