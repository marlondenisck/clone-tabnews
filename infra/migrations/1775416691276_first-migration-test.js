/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 * @param {() => void | undefined} run
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 * @param {() => void | undefined} run
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {};
