const config = require('../config/config');

const POSTGRES = config.databaseDriver === 'postgres';

/*
 * The small set of SQL fragments whose spelling differs between SQLite and
 * PostgreSQL. Keeping them here lets every repository stay a single, dialect
 * neutral implementation while both engines behave identically at runtime.
 */
module.exports = {
  driver: POSTGRES ? 'postgres' : 'sqlite',

  isPostgres: POSTGRES,

  /* Current UTC timestamp, for `SET updated_at = <now>`. */
  now: POSTGRES ? 'now()' : "datetime('now')",

  /*
   * Current UTC calendar date. PostgreSQL's CURRENT_DATE follows the session
   * time zone, so derive the date from an explicit UTC instant instead.
   * SQLite's date('now') is already UTC.
   */
  currentDate: POSTGRES ? "(now() AT TIME ZONE 'UTC')::date" : "date('now')",

  /*
   * COUNT(...) is a 64-bit integer. node-postgres returns bigint as a string,
   * so cast it down to a 32-bit integer and keep the API returning numbers.
   */
  count(expression) {
    return POSTGRES ? `COUNT(${expression})::int` : `COUNT(${expression})`;
  },

  /*
   * Case-insensitive equality. SQLite compares with COLLATE NOCASE; PostgreSQL
   * compares both sides lowercased.
   */
  caseInsensitiveEquals(column, param) {
    return POSTGRES ? `LOWER(${column}) = LOWER(${param})` : `${column} = ${param} COLLATE NOCASE`;
  },

  /*
   * Case-insensitive substring match, with an escape character so that terms
   * containing % or _ are matched literally. SQLite's LIKE is already ASCII
   * case-insensitive; PostgreSQL's LIKE is case-sensitive, hence ILIKE.
   */
  caseInsensitiveLike(column, param) {
    return POSTGRES
      ? `${column} ILIKE ${param} ESCAPE '\\'`
      : `${column} LIKE ${param} ESCAPE '\\'`;
  },

  /* A session's expiry: the current instant plus @lifetime_days days. */
  sessionExpiry: POSTGRES
    ? "now() + (@lifetime_days * interval '1 day')"
    : "datetime('now', '+' || @lifetime_days || ' days')"
};
