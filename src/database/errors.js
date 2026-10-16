/*
 * Constraint-violation detection that works for both database engines.
 *
 * PostgreSQL reports SQLSTATE codes; SQLite (via better-sqlite3) reports the
 * extended SQLITE_CONSTRAINT_* code. Controllers only need to distinguish a
 * duplicate row from a broken foreign key reference, so the engine-specific
 * details stay here. Constraints that are neither (CHECK, NOT NULL) must fall
 * through so controllers can report them as validation errors rather than
 * duplicates.
 */

const POSTGRES_UNIQUE_VIOLATION = '23505';
const POSTGRES_FOREIGN_KEY_VIOLATION = '23503';

/*
 * better-sqlite3 reports SQLite's extended result codes, e.g.
 * SQLITE_CONSTRAINT_UNIQUE (2067) and SQLITE_CONSTRAINT_PRIMARYKEY (1555).
 * Only those two mean "a row with this key already exists"; CHECK, NOT NULL and
 * the bare SQLITE_CONSTRAINT code are deliberately excluded.
 */
const SQLITE_UNIQUE_VIOLATION = 'SQLITE_CONSTRAINT_UNIQUE';
const SQLITE_PRIMARY_KEY_VIOLATION = 'SQLITE_CONSTRAINT_PRIMARYKEY';
const SQLITE_FOREIGN_KEY_VIOLATION = 'SQLITE_CONSTRAINT_FOREIGNKEY';

function codeOf(error) {
  return error && typeof error.code === 'string' ? error.code : '';
}

function isForeignKeyConstraintError(error) {
  const code = codeOf(error);
  return code === POSTGRES_FOREIGN_KEY_VIOLATION || code === SQLITE_FOREIGN_KEY_VIOLATION;
}

function isUniqueConstraintError(error) {
  const code = codeOf(error);
  return (
    code === POSTGRES_UNIQUE_VIOLATION ||
    code === SQLITE_UNIQUE_VIOLATION ||
    code === SQLITE_PRIMARY_KEY_VIOLATION
  );
}

module.exports = {
  isForeignKeyConstraintError,
  isUniqueConstraintError
};
