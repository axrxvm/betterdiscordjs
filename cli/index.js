#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
  dim: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`)
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

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
  
${colors.bright}Commands:${colors.reset}
  create <name>     Create a new bot project
  
${colors.bright}Options:${colors.reset}
  --template, -t    Template to use (basic|advanced|minimal)
  --yes, -y         Skip prompts and use defaults
  --no-install      Don't install dependencies automatically
  --help, -h        Show this help message
  
${colors.bright}Examples:${colors.reset}
  ${colors.dim}# Interactive setup${colors.reset}
  npx @axrxvm/betterdiscordjs create my-bot
  
  ${colors.dim}# Quick setup with defaults${colors.reset}
  npx @axrxvm/betterdiscordjs create my-bot --yes
  
  ${colors.dim}# Use advanced template${colors.reset}
  npx @axrxvm/betterdiscordjs create my-bot --template advanced
  
${colors.bright}Documentation:${colors.reset}
  https://github.com/axrxvm/betterdiscordjs
`);
}

async function createProject(projectName, options = {}) {
  showBanner();
  
  const projectPath = path.join(process.cwd(), projectName);
  
  // Check if directory exists
  if (fs.existsSync(projectPath)) {
    log.error(`Directory "${projectName}" already exists!`);
    process.exit(1);
  }
  
  log.info(`Creating new betterdiscordjs project: ${colors.bright}${projectName}${colors.reset}`);
  
  // Gather project info
  let config = {
    template: options.template || 'basic',
    prefix: '!',
    installDeps: !options.noInstall
  };
  
  if (!options.yes) {
    log.title('Project Configuration');
    
    const templateChoice = await question(
      `${colors.cyan}?${colors.reset} Choose template (basic/advanced/minimal) [basic]: `
    );
    config.template = templateChoice.trim() || 'basic';
    
    const prefixChoice = await question(
      `${colors.cyan}?${colors.reset} Command prefix [!]: `
    );
    config.prefix = prefixChoice.trim() || '!';
    
    const installChoice = await question(
      `${colors.cyan}?${colors.reset} Install dependencies? (Y/n): `
    );
    config.installDeps = !installChoice.trim().toLowerCase().startsWith('n');
  }
  
  rl.close();
  
  // Create project structure
  log.info('Creating project structure...');
  createProjectStructure(projectPath, projectName, config);
  
  // Install dependencies
  if (config.installDeps) {
    log.info('Installing dependencies...');
    try {
      process.chdir(projectPath);
      execSync('npm install', { stdio: 'inherit' });
      log.success('Dependencies installed!');
    } catch (error) {
      log.warn('Failed to install dependencies. Run "npm install" manually.');
    }
  }
  
  // Success message
  log.title('🎉 Project created successfully!');
  console.log(`${colors.bright}Next steps:${colors.reset}
  
  ${colors.cyan}cd ${projectName}${colors.reset}
  ${colors.dim}# Configure your bot token in .env${colors.reset}
  ${colors.cyan}nano .env${colors.reset}
  ${colors.dim}# Start your bot${colors.reset}
  ${colors.cyan}node index.js${colors.reset}
  
${colors.bright}Documentation:${colors.reset} https://github.com/axrxvm/betterdiscordjs/tree/main/docs
${colors.bright}Examples:${colors.reset} Check the ${colors.cyan}commands/${colors.reset} directory for example commands!
`);
}

function createProjectStructure(projectPath, projectName, config) {
  const templatesDir = path.join(__dirname, 'templates');
  
  // Create directories
  fs.mkdirSync(projectPath, { recursive: true });
  fs.mkdirSync(path.join(projectPath, 'commands'), { recursive: true });
  fs.mkdirSync(path.join(projectPath, 'events'), { recursive: true });
  fs.mkdirSync(path.join(projectPath, 'data'), { recursive: true });
  
  // Create package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: 'A Discord bot built with betterdiscordjs',
    main: 'index.js',
    scripts: {
      start: 'node index.js',
      dev: 'node --watch index.js'
    },
    keywords: ['discord', 'bot', 'betterdiscordjs'],
    author: '',
    license: 'MIT',
    dependencies: {
      '@axrxvm/betterdiscordjs': '^1.0.1',
      'dotenv': '^17.2.2'
    }
  };
  
  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  log.success('Created package.json');
  
  // Create .env file
  const envContent = `# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
DEV_GUILD=your_dev_guild_id_here

# Bot Settings
PREFIX=${config.prefix}

# Optional: Bot Owner ID
BOT_OWNER_ID=your_user_id_here
`;
  
  fs.writeFileSync(path.join(projectPath, '.env'), envContent);
  log.success('Created .env');
  
  // Create .env.example
  fs.writeFileSync(
    path.join(projectPath, '.env.example'),
    envContent.replace(/=.+/g, '=')
  );
  
  // Create .gitignore
  const gitignoreContent = `# Dependencies
node_modules/

# Environment
.env

# Data
data/*.json
!data/.gitkeep

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
`;
  
  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignoreContent);
  log.success('Created .gitignore');
  
  // Create data/.gitkeep
  fs.writeFileSync(path.join(projectPath, 'data', '.gitkeep'), '');
  
  // Create main index.js based on template
  createMainFile(projectPath, config);
  
  // Create example commands
  createExampleCommands(projectPath, config);
  
  // Create example events
  createExampleEvents(projectPath, config);
  
  // Create README
  createReadme(projectPath, projectName, config);
  
  // Create config.json if advanced template
  if (config.template === 'advanced') {
    createConfigFile(projectPath, config);
  }
}

function createMainFile(projectPath, config) {
  let content = '';
  
  if (config.template === 'minimal') {
    content = `const { Bot } = require('@axrxvm/betterdiscordjs');
require('dotenv').config();

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: process.env.PREFIX || '${config.prefix}'
});

// Quick inline command
bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
});

bot.on('ready', (ctx) => {
  console.log(\`✓ \${ctx.user.tag} is ready!\`);
});

bot.start();
`;
  } else if (config.template === 'advanced') {
    content = `const { Bot, plugins } = require('@axrxvm/betterdiscordjs');
require('dotenv').config();

const config = require('./config.json');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: process.env.PREFIX || config.prefix,
  commandsDir: './commands',
  eventsDir: './events',
  devGuild: process.env.DEV_GUILD,
  clientId: process.env.CLIENT_ID,
  database: {
    type: 'json',
    path: './data/database.json'
  }
});

// Load plugins
if (config.plugins.welcome) {
  bot.use(plugins.WelcomePlugin);
}
if (config.plugins.moderation) {
  bot.use(plugins.ModerationPlugin);
}

// Global command hooks
bot.onCommandRun((cmd, ctx) => {
  ctx.info(\`Command executed: \${cmd.name} by \${ctx.user.tag}\`);
});

bot.onCommandError((err, cmd, ctx) => {
  ctx.error(\`Error in \${cmd.name}: \${err.message}\`);
});

// Scheduled tasks
bot.every('30m', () => {
  console.log('Running scheduled task...');
});

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

bot.start();
`;
  } else {
    // Basic template
    content = `const { Bot } = require('@axrxvm/betterdiscordjs');
require('dotenv').config();

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: process.env.PREFIX || '${config.prefix}',
  commandsDir: './commands',
  eventsDir: './events',
  devGuild: process.env.DEV_GUILD,
  clientId: process.env.CLIENT_ID
});

// Global command hooks
bot.onCommandRun((cmd, ctx) => {
  console.log(\`✓ Command: \${cmd.name} by \${ctx.user.tag}\`);
});

bot.on('ready', (ctx) => {
  console.log(\`✓ Bot is ready! Logged in as \${ctx.user.tag}\`);
  ctx.client.user.setActivity('${config.prefix}help', { type: 'LISTENING' });
});

bot.start();
`;
  }
  
  fs.writeFileSync(path.join(projectPath, 'index.js'), content);
  log.success('Created index.js');
}

function createExampleCommands(projectPath, config) {
  const commandsDir = path.join(projectPath, 'commands');
  
  if (config.template === 'minimal') {
    // Minimal template: just one example in comments
    return;
  }
  
  // ping.js
  const pingCommand = `module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  slash: true,
  run: async (ctx) => {
    const latency = Date.now() - ctx.createdTimestamp;
    const apiLatency = Math.round(ctx.client.ws.ping);
    
    const embed = ctx.embed()
      .title('🏓 Pong!')
      .field('Bot Latency', \`\${latency}ms\`, true)
      .field('API Latency', \`\${apiLatency}ms\`, true)
      .color('green')
      .timestamp();
    
    await embed.send();
  }
};
`;
  fs.writeFileSync(path.join(commandsDir, 'ping.js'), pingCommand);
  
  // help.js
  const helpCommand = `module.exports = {
  name: 'help',
  description: 'Show all available commands',
  slash: true,
  run: async (ctx) => {
    const commands = Array.from(ctx.bot.commands.values())
      .filter(cmd => !cmd.ownerOnly)
      .map(cmd => \`\\\`\${cmd.name}\\\` - \${cmd.description || 'No description'}\`)
      .join('\\n');
    
    const embed = ctx.embed()
      .title('📚 Available Commands')
      .desc(commands || 'No commands available')
      .footer(\`Use ${config.prefix}help <command> for more info\`)
      .color('blue')
      .timestamp();
    
    await embed.send();
  }
};
`;
  fs.writeFileSync(path.join(commandsDir, 'help.js'), helpCommand);
  
  // userinfo.js
  const userinfoCommand = `module.exports = {
  name: 'userinfo',
  description: 'Get information about a user',
  slash: true,
  args: {
    usage: '[user]'
  },
  run: async (ctx) => {
    const user = ctx.interaction 
      ? ctx.interaction.options.getUser('user') || ctx.user
      : await ctx.fetchUser(ctx.args[0]) || ctx.user;
    
    const member = ctx.guild ? await ctx.guild.members.fetch(user.id).catch(() => null) : null;
    
    const embed = ctx.embed()
      .title(\`👤 User Info: \${user.tag}\`)
      .thumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .field('ID', user.id, true)
      .field('Created', \`<t:\${Math.floor(user.createdTimestamp / 1000)}:R>\`, true)
      .field('Bot', user.bot ? 'Yes' : 'No', true)
      .color('blue');
    
    if (member) {
      embed.field('Joined Server', \`<t:\${Math.floor(member.joinedTimestamp / 1000)}:R>\`, true);
      embed.field('Roles', member.roles.cache.size.toString(), true);
    }
    
    await embed.send();
  }
};
`;
  fs.writeFileSync(path.join(commandsDir, 'userinfo.js'), userinfoCommand);
  
  if (config.template === 'advanced') {
    // Add more advanced commands
    
    // poll.js
    const pollCommand = `module.exports = {
  name: 'poll',
  description: 'Create a poll with reactions',
  slash: true,
  args: {
    required: 1,
    usage: '<question>'
  },
  run: async (ctx) => {
    const question = ctx.args.join(' ');
    
    const embed = ctx.embed()
      .title('📊 Poll')
      .desc(question)
      .footer(\`Poll by \${ctx.user.tag}\`)
      .color('purple')
      .timestamp();
    
    const message = await embed.send();
    
    // Add reaction options
    await message.react('👍');
    await message.react('👎');
    await message.react('🤷');
    
    await ctx.success('Poll created!');
  }
};
`;
    fs.writeFileSync(path.join(commandsDir, 'poll.js'), pollCommand);
    
    // remind.js
    const remindCommand = `const { time } = require('@axrxvm/betterdiscordjs');

module.exports = {
  name: 'remind',
  description: 'Set a reminder',
  slash: true,
  args: {
    required: 2,
    usage: '<time> <message>'
  },
  run: async (ctx) => {
    const timeStr = ctx.args[0];
    const message = ctx.args.slice(1).join(' ');
    
    const duration = time.parse(timeStr);
    if (!duration) {
      return ctx.error('Invalid time format! Use: 1h, 30m, 2d, etc.');
    }
    
    await ctx.success(\`I'll remind you in \${timeStr}: \${message}\`);
    
    setTimeout(async () => {
      try {
        await ctx.user.send(\`⏰ Reminder: \${message}\`);
      } catch (error) {
        console.error('Failed to send reminder:', error);
      }
    }, duration);
  }
};
`;
    fs.writeFileSync(path.join(commandsDir, 'remind.js'), remindCommand);
  }
  
  log.success(`Created ${fs.readdirSync(commandsDir).length} example commands`);
}

function createExampleEvents(projectPath, config) {
  const eventsDir = path.join(projectPath, 'events');
  
  if (config.template === 'minimal') {
    return;
  }
  
  // ready.js
  const readyEvent = `module.exports = {
  name: 'ready',
  once: true,
  run: (ctx) => {
    console.log(\`✓ \${ctx.user.tag} is online!\`);
    console.log(\`✓ Serving \${ctx.client.guilds.cache.size} guilds\`);
    console.log(\`✓ Loaded \${ctx.bot.commands.size} commands\`);
  }
};
`;
  fs.writeFileSync(path.join(eventsDir, 'ready.js'), readyEvent);
  
  // guildCreate.js
  const guildCreateEvent = `module.exports = {
  name: 'guildCreate',
  run: async (ctx, guild) => {
    console.log(\`✓ Joined new guild: \${guild.name} (\${guild.id})\`);
    
    // Send welcome message to the first available channel
    const channel = guild.channels.cache
      .filter(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages'))
      .first();
    
    if (channel) {
      const embed = ctx.embed()
        .title('👋 Thanks for adding me!')
        .desc(\`Use \\\`${config.prefix}help\\\` to see available commands.\`)
        .color('green');
      
      await channel.send({ embeds: [embed.embed] });
    }
  }
};
`;
  fs.writeFileSync(path.join(eventsDir, 'guildCreate.js'), guildCreateEvent);
  
  if (config.template === 'advanced') {
    // messageCreate.js for advanced logging
    const messageCreateEvent = `module.exports = {
  name: 'messageCreate',
  run: async (ctx, message) => {
    // Ignore bots
    if (message.author.bot) return;
    
    // Log messages (you can add your custom logic here)
    // Example: Auto-response, message filtering, etc.
    
    // Auto-delete messages with invite links (example)
    if (message.content.match(/(discord\\.gg|discord\\.com\\/invite)/gi)) {
      if (message.member.permissions.has('Administrator')) return;
      
      try {
        await message.delete();
        const warning = await message.channel.send(
          \`\${message.author}, invite links are not allowed!\`
        );
        setTimeout(() => warning.delete(), 5000);
      } catch (error) {
        console.error('Failed to delete invite link:', error);
      }
    }
  }
};
`;
    fs.writeFileSync(path.join(eventsDir, 'messageCreate.js'), messageCreateEvent);
  }
  
  log.success(`Created ${fs.readdirSync(eventsDir).length} example events`);
}

function createConfigFile(projectPath, config) {
  const configContent = {
    prefix: config.prefix,
    plugins: {
      welcome: false,
      moderation: false,
      automod: false
    },
    features: {
      commandLogging: true,
      errorReporting: true,
      autoDeleteInvites: false
    }
  };
  
  fs.writeFileSync(
    path.join(projectPath, 'config.json'),
    JSON.stringify(configContent, null, 2)
  );
  log.success('Created config.json');
}

function createReadme(projectPath, projectName, config) {
  const content = `# ${projectName}

A Discord bot built with [betterdiscordjs](https://github.com/axrxvm/betterdiscordjs).

## Setup

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure your bot:**
   - Copy \`.env.example\` to \`.env\`
   - Add your Discord bot token and other credentials
   - Get your bot token from [Discord Developer Portal](https://discord.com/developers/applications)

3. **Start the bot:**
   \`\`\`bash
   npm start
   \`\`\`

## Project Structure

\`\`\`
${projectName}/
├── commands/        # Bot commands
├── events/          # Event handlers
├── data/            # Database and storage
├── index.js         # Main bot file
├── .env             # Configuration (don't commit!)
└── package.json     # Dependencies
\`\`\`

## Adding Commands

Create a new file in \`commands/\`:

\`\`\`javascript
// commands/hello.js
module.exports = {
  name: 'hello',
  description: 'Say hello',
  slash: true,
  run: async (ctx) => {
    await ctx.reply(\`Hello, \${ctx.user.username}!\`);
  }
};
\`\`\`

## Adding Events

Create a new file in \`events/\`:

\`\`\`javascript
// events/messageCreate.js
module.exports = {
  name: 'messageCreate',
  run: async (ctx, message) => {
    // Handle message events
  }
};
\`\`\`

## Documentation

- [betterdiscordjs Documentation](https://github.com/axrxvm/betterdiscordjs/tree/main/docs)
- [Discord.js Guide](https://discordjs.guide/)
- [Discord API Docs](https://discord.com/developers/docs)

## Commands

- \`${config.prefix}help\` - Show all commands
- \`${config.prefix}ping\` - Check bot latency
- \`${config.prefix}userinfo\` - Get user information

## License

MIT
`;
  
  fs.writeFileSync(path.join(projectPath, 'README.md'), content);
  log.success('Created README.md');
}

// CLI Entry Point
const args = process.argv.slice(2);
const command = args[0];
const projectName = args[1];

const options = {
  yes: args.includes('--yes') || args.includes('-y'),
  noInstall: args.includes('--no-install'),
  template: args.includes('--template') || args.includes('-t') 
    ? args[args.indexOf('--template') + 1] || args[args.indexOf('-t') + 1]
    : null,
  help: args.includes('--help') || args.includes('-h')
};

if (options.help || !command) {
  showHelp();
  process.exit(0);
}

if (command === 'create') {
  if (!projectName) {
    log.error('Project name is required!');
    console.log(`\nUsage: npx @axrxvm/betterdiscordjs create <project-name>\n`);
    process.exit(1);
  }
  
  createProject(projectName, options).catch(error => {
    log.error('Failed to create project: ' + error.message);
    process.exit(1);
  });
} else {
  log.error(`Unknown command: ${command}`);
  console.log(`\nRun with --help for usage information\n`);
  process.exit(1);
}
