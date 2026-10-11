const DEFAULT_PATH = '/';

function parseCookieHeader(header) {
  const cookies = {};

  if (typeof header !== 'string' || header.length === 0) {
    return cookies;
  }

  const pairs = header.split(';');

  for (const pair of pairs) {
    const separatorIndex = pair.indexOf('=');

    if (separatorIndex < 1) {
      continue;
    }

    const name = pair.slice(0, separatorIndex).trim();

    if (!name || Object.prototype.hasOwnProperty.call(cookies, name)) {
      continue;
    }

    const rawValue = pair.slice(separatorIndex + 1).trim();

    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch (error) {
      cookies[name] = rawValue;
    }
  }

  return cookies;
}

function serializeCookie(name, value, options) {
  const settings = options || {};

  const parts = [name + '=' + encodeURIComponent(value), 'Path=' + (settings.path || DEFAULT_PATH)];

  if (typeof settings.maxAgeSeconds === 'number') {
    parts.push('Max-Age=' + Math.floor(settings.maxAgeSeconds));
  }

  if (settings.expires instanceof Date) {
    parts.push('Expires=' + settings.expires.toUTCString());
  }

  if (settings.httpOnly !== false) {
    parts.push('HttpOnly');
  }

  if (settings.sameSite) {
    const sameSite = settings.sameSite;
    parts.push('SameSite=' + sameSite.charAt(0).toUpperCase() + sameSite.slice(1).toLowerCase());
  }

  if (settings.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

module.exports = {
  parseCookieHeader,
  serializeCookie
};
