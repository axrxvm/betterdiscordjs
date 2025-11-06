#!/usr/bin/env node

const path = require('path');
const colors = require('./lib/colors');
const log = require('./lib/logger');
const prompts = require('./lib/prompts');
const validator = require('./lib/validator');
const generator = require('./lib/generator');

function showBanner() {
  console.log(`
${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║           ${colors.cyan}betterdiscordjs${colors.blue} CLI                         ║
║           ${colors.dim}Modern Discord Bot Framework${colors.blue}                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}
  `);
}


function showHelp() {
  showBanner();
  console.log(`${colors.bright}Usage:${colors.reset}
  npx @axrxvm/betterdiscordjs create <project-name> [options]
  betterdjs create <project-name> [options]
  
${colors.bright}Commands:${colors.reset}
  create <name>     Create a new bot project
  
${colors.bright}Options:${colors.reset}
  --template, -t    Template to use (basic|advanced|minimal)
  --typescript      Create a TypeScript project
  --javascript      Create a JavaScript project (default)
  --yes, -y         Skip prompts and use defaults
  --no-install      Don't install dependencies automatically
  --help, -h        Show this help message
  
${colors.bright}Examples:${colors.reset}
  ${colors.dim}# Interactive setup${colors.reset}
  npx @axrxvm/betterdiscordjs create my-bot
  
  ${colors.dim}# TypeScript project${colors.reset}
  npx @axrxvm/betterdiscordjs create my-bot --typescript
  
  ${colors.dim}# Quick setup with defaults${colors.reset}
  npx @axrxvm/betterdiscordjs create my-bot --yes
  
  ${colors.dim}# Advanced template${colors.reset}
  npx @axrxvm/betterdiscordjs create my-bot --template advanced
  
  ${colors.dim}# TypeScript with advanced template${colors.reset}
  npx @axrxvm/betterdiscordjs create my-bot --typescript -t advanced
  
${colors.bright}Templates:${colors.reset}
  ${colors.cyan}basic${colors.reset}     - Complete setup with example commands and events
  ${colors.cyan}advanced${colors.reset}  - Full-featured with plugins and advanced features
  ${colors.cyan}minimal${colors.reset}   - Bare minimum for experienced developers
  
${colors.bright}Documentation:${colors.reset}
  https://github.com/axrxvm/betterdiscordjs
`);
}


async function createProject(projectName, options = {}) {
  showBanner();
  
  // Validate project name
  const nameValidation = validator.validateProjectName(projectName);
  if (!nameValidation.valid) {
    log.error(nameValidation.error);
    process.exit(1);
  }
  
  const projectPath = path.join(process.cwd(), projectName);
  
  // Check if directory exists
  const dirCheck = validator.checkDirectory(projectPath);
  if (dirCheck.exists && !dirCheck.isEmpty) {
    log.error(`Directory "${projectName}" already exists and is not empty!`);
    process.exit(1);
  }
  
  log.info(`Creating new betterdiscordjs project: ${colors.bright}${projectName}${colors.reset}\n`);
  
  // Gather project configuration
  let config = {
    projectName,
    template: 'basic',
    language: 'javascript',
    prefix: '!',
    description: '',
    installDeps: true
  };
  
  // Parse CLI options
  if (options.typescript) {
    config.language = 'typescript';
  }
  
  if (options.template) {
    const templateValidation = validator.validateTemplate(options.template);
    if (!templateValidation.valid) {
      log.error(templateValidation.error);
      process.exit(1);
    }
    config.template = options.template.toLowerCase();
  }
  
  if (options.noInstall) {
    config.installDeps = false;
  }
  
  // Interactive prompts (unless --yes flag)
  if (!options.yes) {
    log.title('Project Configuration');
    
    // Language selection
    const languageChoice = await prompts.select(
      'Select language:',
      ['JavaScript', 'TypeScript'],
      config.language === 'typescript' ? 1 : 0
    );
    config.language = languageChoice.toLowerCase();
    
    // Template selection
    const templateChoice = await prompts.select(
      'Choose template:',
      ['basic', 'advanced', 'minimal'],
      config.template === 'basic' ? 0 : config.template === 'advanced' ? 1 : 2
    );
    config.template = templateChoice;
    
    // Command prefix
    const prefixInput = await prompts.input('Command prefix', '!');
    const prefixValidation = validator.validatePrefix(prefixInput);
    if (!prefixValidation.valid) {
      log.error(prefixValidation.error);
      process.exit(1);
    }
    config.prefix = prefixInput;
    
    // Description (optional)
    const descInput = await prompts.input(
      'Project description',
      'A Discord bot built with betterdiscordjs'
    );
    config.description = descInput;
    
    // Install dependencies
    config.installDeps = await prompts.confirm('Install dependencies?', true);
  }
  
  prompts.close();
  
  // Summary
  console.log();
  log.info('Project summary:');
  console.log(`  ${colors.dim}Name:${colors.reset} ${config.projectName}`);
  console.log(`  ${colors.dim}Language:${colors.reset} ${config.language}`);
  console.log(`  ${colors.dim}Template:${colors.reset} ${config.template}`);
  console.log(`  ${colors.dim}Prefix:${colors.reset} ${config.prefix}`);
  console.log();
  
  // Generate project
  try {
    log.start('Creating project structure');
    generator.generateProject(projectPath, config);
    log.finish('Project structure created');
    
    // Install dependencies
    if (config.installDeps) {
      await generator.installDependencies(projectPath);
    }
    
    // Success message
    showSuccessMessage(projectName, config);
    
  } catch (error) {
    log.error(`Failed to create project: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

function showSuccessMessage(projectName, config) {
  const isTypescript = config.language === 'typescript';
  
  log.title('🎉 Project created successfully!');
  
  console.log(`${colors.bright}Next steps:${colors.reset}\n`);
  
  console.log(`  ${colors.cyan}cd ${projectName}${colors.reset}`);
  console.log(`  ${colors.dim}# Configure your bot token in .env${colors.reset}`);
  
  if (process.platform === 'win32') {
    console.log(`  ${colors.cyan}notepad .env${colors.reset}`);
  } else {
    console.log(`  ${colors.cyan}nano .env${colors.reset}`);
  }
  
  if (isTypescript) {
    console.log(`  ${colors.dim}# Build the TypeScript project${colors.reset}`);
    console.log(`  ${colors.cyan}npm run build${colors.reset}`);
  }
  
  console.log(`  ${colors.dim}# Start your bot${colors.reset}`);
  console.log(`  ${colors.cyan}npm start${colors.reset}\n`);
  
  if (!config.installDeps) {
    console.log(`${colors.yellow}⚠${colors.reset} Don't forget to install dependencies:\n`);
    console.log(`  ${colors.cyan}npm install${colors.reset}\n`);
  }
  
  console.log(`${colors.bright}Resources:${colors.reset}`);
  console.log(`  ${colors.dim}Documentation:${colors.reset} https://github.com/axrxvm/betterdiscordjs/tree/main/docs`);
  console.log(`  ${colors.dim}Examples:${colors.reset} Check the ${colors.cyan}${isTypescript ? 'src/' : ''}commands/${colors.reset} directory`);
  console.log(`  ${colors.dim}Discord API:${colors.reset} https://discord.com/developers/docs\n`);
}

// CLI Entry Point
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const projectName = args[1];
  
  const options = {
    yes: args.includes('--yes') || args.includes('-y'),
    noInstall: args.includes('--no-install'),
    typescript: args.includes('--typescript') || args.includes('--ts'),
    javascript: args.includes('--javascript') || args.includes('--js'),
    template: null,
    help: args.includes('--help') || args.includes('-h')
  };
  
  // Get template option
  const templateIndex = args.indexOf('--template');
  const templateIndexShort = args.indexOf('-t');
  if (templateIndex !== -1 && args[templateIndex + 1]) {
    options.template = args[templateIndex + 1];
  } else if (templateIndexShort !== -1 && args[templateIndexShort + 1]) {
    options.template = args[templateIndexShort + 1];
  }
  
  if (options.help || !command) {
    showHelp();
    process.exit(0);
  }
  
  if (command === 'create') {
    if (!projectName) {
      log.error('Project name is required!');
      console.log(`\n${colors.dim}Usage:${colors.reset} betterdjs create <project-name>\n`);
      process.exit(1);
    }
    
    try {
      await createProject(projectName, options);
    } catch (error) {
      log.error('Failed to create project: ' + error.message);
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
  } else {
    log.error(`Unknown command: ${command}`);
    console.log(`\n${colors.dim}Run with --help for usage information${colors.reset}\n`);
    process.exit(1);
  }
}

// Handle process events
process.on('SIGINT', () => {
  console.log('\n\nOperation cancelled by user.');
  prompts.close();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log.error('An unexpected error occurred');
  console.error(error);
  prompts.close();
  process.exit(1);
});

// Run CLI
main().catch(error => {
  log.error('Fatal error: ' + error.message);
  console.error(error);
  prompts.close();
  process.exit(1);
});
