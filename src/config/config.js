const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

const SESSION_LIFETIME_DAYS = 7;

module.exports = {
  port: Number(process.env.PORT) || 3000,

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
