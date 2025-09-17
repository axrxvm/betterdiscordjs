const chalk = require("chalk").default;

/**
 * Logs an informational message to the console.
 * @param {string} msg - The message to log.
 */
function info(msg) {
  console.log(chalk.blue("[INFO]"), msg);
}

/**
 * Logs a warning message to the console.
 * @param {string} msg - The message to log.
 */
function warn(msg) {
  console.log(chalk.yellow("[WARN]"), msg);
}

/**
 * Logs an error message to the console.
 * @param {string} msg - The message to log.
 */
function error(msg) {
  console.log(chalk.red("[ERROR]"), msg);
}

module.exports = { info, warn, error };


