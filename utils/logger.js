const chalk = require("chalk").default;

function info(msg) {
  console.log(chalk.blue("[INFO]"), msg);
}

function warn(msg) {
  console.log(chalk.yellow("[WARN]"), msg);
}

function error(msg) {
  console.log(chalk.red("[ERROR]"), msg);
}

module.exports = { info, warn, error };
