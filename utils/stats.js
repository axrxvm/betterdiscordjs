const stats = { commands: {}, users: {} };

function logCommand(cmd, userId) {
  stats.commands[cmd] = (stats.commands[cmd] || 0) + 1;
  stats.users[userId] = (stats.users[userId] || 0) + 1;
}

function getTopCommands(n = 5) {
  return Object.entries(stats.commands)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

module.exports = { logCommand, getTopCommands };
