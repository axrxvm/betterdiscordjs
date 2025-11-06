const colors = require('./colors');

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
  dim: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`),
  
  // Spinner-like progress
  start: (msg) => {
    process.stdout.write(`${colors.cyan}⠋${colors.reset} ${msg}...`);
  },
  
  update: (msg) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`${colors.cyan}⠋${colors.reset} ${msg}...`);
  },
  
  finish: (msg) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(`${colors.green}✓${colors.reset} ${msg}`);
  },
  
  fail: (msg) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(`${colors.red}✗${colors.reset} ${msg}`);
  }
};

module.exports = log;
