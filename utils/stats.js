/**
 * A simple in-memory statistics tracker.
 * @type {object}
 */
const stats = { commands: {}, users: {} };

/**
 * Logs the usage of a command by a user.
 * @param {string} cmd - The name of the command.
 * @param {string} userId - The ID of the user.
 */
function logCommand(cmd, userId) {
  stats.commands[cmd] = (stats.commands[cmd] || 0) + 1;
  stats.users[userId] = (stats.users[userId] || 0) + 1;
}

/**
 * Gets the most used commands.
 * @param {number} [n=5] - The number of commands to return.
 * @returns {Array<Array<string|number>>} The top commands.
 */
function getTopCommands(n = 5) {
  return Object.entries(stats.commands)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

module.exports = { logCommand, getTopCommands };


