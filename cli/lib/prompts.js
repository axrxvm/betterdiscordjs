const readline = require('readline');
const colors = require('./colors');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function confirm(message, defaultValue = true) {
  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  const answer = await question(`${colors.cyan}?${colors.reset} ${message} (${defaultText}): `);
  
  if (!answer.trim()) return defaultValue;
  
  const normalized = answer.trim().toLowerCase();
  return normalized === 'y' || normalized === 'yes';
}

async function select(message, choices, defaultChoice = 0) {
  console.log(`${colors.cyan}?${colors.reset} ${message}`);
  
  choices.forEach((choice, index) => {
    const marker = index === defaultChoice ? colors.cyan + '❯' : ' ';
    console.log(`  ${marker} ${choice}${colors.reset}`);
  });
  
  const answer = await question(`  ${colors.dim}Enter choice (1-${choices.length}) [${defaultChoice + 1}]:${colors.reset} `);
  
  if (!answer.trim()) return choices[defaultChoice];
  
  const index = parseInt(answer.trim()) - 1;
  if (index >= 0 && index < choices.length) {
    return choices[index];
  }
  
  return choices[defaultChoice];
}

async function input(message, defaultValue = '') {
  const defaultText = defaultValue ? ` [${defaultValue}]` : '';
  const answer = await question(`${colors.cyan}?${colors.reset} ${message}${defaultText}: `);
  return answer.trim() || defaultValue;
}

function close() {
  rl.close();
}

module.exports = {
  question,
  confirm,
  select,
  input,
  close
};
