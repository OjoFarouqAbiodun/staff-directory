/*
 * Placeholder translation shared by the database facade.
 *
 * Repositories write their SQL once using @name placeholders and pass a plain
 * object of values. SQLite understands that form natively; node-postgres needs
 * positional $1..$n parameters and an ordered argument array, so convert here.
 *
 * A repeated name (staff search matches five columns with one term) maps to the
 * same $n, which PostgreSQL allows.
 *
 * Only placeholders that appear in SQL code are converted. The scanner skips
 * single-quoted string literals, double-quoted identifiers, line comments and
 * block comments, so a literal such as 'admin@example.com' is left untouched.
 *
 * Limitations: PostgreSQL dollar-quoted strings ($tag$ ... $tag$) and escape
 * string literals (E'...\'' ) are not recognised; none appear in this
 * application's SQL. If they are ever introduced here, extend the scanner.
 */

/* Does this character start a @name placeholder (and can it continue one)? */
function isNameStart(character) {
  return /[A-Za-z_]/.test(character || '');
}

function isNamePart(character) {
  return /[A-Za-z0-9_]/.test(character || '');
}

function normalizeParams(params) {
  return params && typeof params === 'object' ? params : {};
}

function toPostgresQuery(text, params) {
  const source = normalizeParams(params);
  const values = [];
  const positions = new Map();
  const length = text.length;

  let sql = '';
  let index = 0;

  while (index < length) {
    const character = text[index];
    const next = text[index + 1];

    /* Single-quoted string literal; '' is an escaped quote. */
    if (character === "'") {
      sql += character;
      index += 1;

      while (index < length) {
        sql += text[index];

        if (text[index] === "'") {
          if (text[index + 1] === "'") {
            sql += text[index + 1];
            index += 2;
            continue;
          }

          index += 1;
          break;
        }

        index += 1;
      }

      continue;
    }

    /* Double-quoted identifier; "" is an escaped quote. */
    if (character === '"') {
      sql += character;
      index += 1;

      while (index < length) {
        sql += text[index];

        if (text[index] === '"') {
          if (text[index + 1] === '"') {
            sql += text[index + 1];
            index += 2;
            continue;
          }

          index += 1;
          break;
        }

        index += 1;
      }

      continue;
    }

    /* Line comment: copy verbatim up to (but not including) the newline. */
    if (character === '-' && next === '-') {
      while (index < length && text[index] !== '\n') {
        sql += text[index];
        index += 1;
      }

      continue;
    }

    /* Block comment: copy verbatim through the closing marker. */
    if (character === '/' && next === '*') {
      sql += '/*';
      index += 2;

      while (index < length && !(text[index] === '*' && text[index + 1] === '/')) {
        sql += text[index];
        index += 1;
      }

      if (index < length) {
        sql += '*/';
        index += 2;
      }

      continue;
    }

    /* A named parameter, e.g. @email or @lifetime_days. */
    if (character === '@' && isNameStart(next)) {
      let end = index + 1;

      while (end < length && isNamePart(text[end])) {
        end += 1;
      }

      const name = text.slice(index + 1, end);
      let position = positions.get(name);

      if (position === undefined) {
        position = values.push(source[name]);
        positions.set(name, position);
      }

      sql += '$' + position;
      index = end;
      continue;
    }

    sql += character;
    index += 1;
  }

  return { sql, values };
}

module.exports = {
  normalizeParams,
  toPostgresQuery
};
