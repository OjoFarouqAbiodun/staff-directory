const fs = require('fs');

/*
 * Optional .env loader for local development.
 *
 * The project (see .gitignore) expects a .env file, but nothing used to read
 * one, so DATABASE_URL/DB_SSL/DB_SSL_CA had to be exported by hand in every
 * shell. Exporting them in one session and running a command in another -- or
 * using a plain PowerShell variable instead of an environment variable --
 * silently dropped the CA and produced SELF_SIGNED_CERT_IN_CHAIN.
 *
 * Rules:
 *   - The file is optional. A missing or unreadable file is ignored.
 *   - Real process environment variables always win, so the shell and hosting
 *     platforms keep overriding the file.
 *   - Only simple KEY=VALUE lines are read; # starts a comment; surrounding
 *     single or double quotes are stripped. Values are never logged.
 *   - The loader never writes to the file.
 */
function loadEnvFile(filePath) {
  let content;

  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return false;
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line === '' || line.startsWith('#')) {
      continue;
    }

    const separator = line.indexOf('=');

    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }

    let value = line.slice(separator + 1).trim();

    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }

  return true;
}

module.exports = {
  loadEnvFile
};
