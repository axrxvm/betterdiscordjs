const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const log = require('./logger');

/**
 * Generate project files from templates
 * @param {string} projectPath - Path to create project
 * @param {object} config - Project configuration
 */
function generateProject(projectPath, config) {
  const { projectName, language, template, prefix, description } = config;
  
  // Create base directories
  createDirectories(projectPath, language);
  
  // Create package.json
  createPackageJson(projectPath, projectName, language, description, template);
  
  // Create environment files
  createEnvFiles(projectPath, prefix);
  
  // Create .gitignore
  createGitignore(projectPath, language);
  
  // Create README
  createReadme(projectPath, projectName, language, template, prefix);
  
  // Create template-specific files
  if (template !== 'minimal') {
    createCommands(projectPath, language, template, prefix);
    createEvents(projectPath, language, template, prefix);
  }
  
  // Create main entry file
  createMainFile(projectPath, language, template, prefix);
  
  // Create config file for advanced template
  if (template === 'advanced') {
    createConfig(projectPath, language, prefix);
  }
  
  // Create TypeScript config if needed
  if (language === 'typescript') {
    createTsConfig(projectPath, template);
  }
}

function createDirectories(projectPath, language) {
  fs.mkdirSync(projectPath, { recursive: true });
  
  if (language === 'typescript') {
    fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'commands'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src', 'events'), { recursive: true });
  } else {
    fs.mkdirSync(path.join(projectPath, 'commands'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'events'), { recursive: true });
  }
  
  fs.mkdirSync(path.join(projectPath, 'data'), { recursive: true });
  fs.writeFileSync(path.join(projectPath, 'data', '.gitkeep'), '');
}

function createPackageJson(projectPath, projectName, language, description, template) {
  const isTypescript = language === 'typescript';
  
  // Try to use template package.json
  const templatePath = path.join(__dirname, '..', 'templates', language, template, 'package.json');
  
  let packageJson;
  
  if (fs.existsSync(templatePath)) {
    // Load template package.json and replace placeholders
    let content = fs.readFileSync(templatePath, 'utf8');
    content = content
      .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
      .replace(/\{\{DESCRIPTION\}\}/g, description || 'A Discord bot built with betterdiscordjs');
    
    packageJson = JSON.parse(content);
  } else {
    // Fallback: generate package.json
    packageJson = {
      name: projectName,
      version: '1.0.0',
      description: description || 'A Discord bot built with betterdiscordjs',
      main: isTypescript ? 'dist/index.js' : 'index.js',
      scripts: {
        start: isTypescript ? 'node dist/index.js' : 'node index.js',
        dev: isTypescript ? 'npm run build && npm start' : 'node --watch index.js',
        ...(isTypescript && {
          build: 'tsc',
          'build:watch': 'tsc --watch',
          typecheck: 'tsc --noEmit'
        })
      },
      keywords: ['discord', 'bot', 'betterdiscordjs'],
      author: '',
      license: 'MIT',
      dependencies: {
        '@axrxvm/betterdiscordjs': '^1.0.2',
        'dotenv': '^17.2.2'
      },
      ...(isTypescript && {
        devDependencies: {
          '@types/node': '^20.10.0',
          'typescript': '^5.3.3'
        }
      })
    };
  }
  
  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  log.success('Created package.json');
}

function createEnvFiles(projectPath, prefix) {
  const envContent = `# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
DEV_GUILD=your_dev_guild_id_here

# Bot Settings
PREFIX=${prefix}

# Optional: Bot Owner ID
BOT_OWNER_ID=your_user_id_here
`;
  
  fs.writeFileSync(path.join(projectPath, '.env'), envContent);
  fs.writeFileSync(
    path.join(projectPath, '.env.example'),
    envContent.replace(/=.+/g, '=')
  );
  log.success('Created .env and .env.example');
}

function createGitignore(projectPath, language) {
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

${language === 'typescript' ? `# TypeScript
dist/
*.tsbuildinfo
` : ''}
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
}

function createMainFile(projectPath, language, template, prefix) {
  const isTypescript = language === 'typescript';
  const filePath = path.join(projectPath, isTypescript ? 'src' : '', 'index.' + (isTypescript ? 'ts' : 'js'));
  
  const templatePath = path.join(__dirname, '..', 'templates', language, template, isTypescript ? 'src/index.ts' : 'index.js');
  
  let content;
  if (fs.existsSync(templatePath)) {
    content = fs.readFileSync(templatePath, 'utf8');
  } else {
    // Fallback basic content
    content = getMainFileContent(language, template, prefix);
  }
  
  content = content.replace(/\{\{PREFIX\}\}/g, prefix);
  
  fs.writeFileSync(filePath, content);
  log.success(`Created ${isTypescript ? 'src/' : ''}index.${isTypescript ? 'ts' : 'js'}`);
}

function getMainFileContent(language, template, prefix) {
  const isTS = language === 'typescript';
  const imp = isTS ? "import { Bot } from '@axrxvm/betterdiscordjs';\nimport { config } from 'dotenv';\n\nconfig();" : "const { Bot } = require('@axrxvm/betterdiscordjs');\nrequire('dotenv').config();";
  const token = isTS ? 'process.env.DISCORD_TOKEN!' : 'process.env.DISCORD_TOKEN';
  
  if (template === 'minimal') {
    return `${imp}

const bot = new Bot(${token}, {
  prefix: process.env.PREFIX || '${prefix}'
});

bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
});

bot.on('ready', (ctx) => {
  console.log(\`✓ \${ctx.user.tag} is ready!\`);
});

bot.start();
`;
  }
  
  const commandsDir = isTS ? './dist/commands' : './commands';
  const eventsDir = isTS ? './dist/events' : './events';
  
  return `${imp}

const bot = new Bot(${token}, {
  prefix: process.env.PREFIX || '${prefix}',
  commandsDir: '${commandsDir}',
  eventsDir: '${eventsDir}',
  devGuild: process.env.DEV_GUILD,
  clientId: process.env.CLIENT_ID
});

bot.onCommandRun((cmd, ctx) => {
  console.log(\`✓ Command: \${cmd.name} by \${ctx.user.tag}\`);
});

bot.on('ready', (ctx) => {
  console.log(\`✓ Bot is ready! Logged in as \${ctx.user.tag}\`);
});

bot.start();
`;
}

function createCommands(projectPath, language, template, prefix) {
  const isTypescript = language === 'typescript';
  const commandsDir = path.join(projectPath, isTypescript ? 'src' : '', 'commands');
  const ext = isTypescript ? 'ts' : 'js';
  
  const commands = ['ping', 'help', 'userinfo'];
  if (template === 'advanced') {
    commands.push('poll', 'remind');
  }
  
  commands.forEach(cmd => {
    const templatePath = path.join(__dirname, '..', 'templates', language, template, isTypescript ? 'src/' : '', 'commands', `${cmd}.${ext}`);
    const targetPath = path.join(commandsDir, `${cmd}.${ext}`);
    
    if (fs.existsSync(templatePath)) {
      let content = fs.readFileSync(templatePath, 'utf8');
      content = content.replace(/\{\{PREFIX\}\}/g, prefix);
      fs.writeFileSync(targetPath, content);
    }
  });
  
  log.success(`Created ${commands.length} command files`);
}

function createEvents(projectPath, language, template, prefix) {
  const isTypescript = language === 'typescript';
  const eventsDir = path.join(projectPath, isTypescript ? 'src' : '', 'events');
  const ext = isTypescript ? 'ts' : 'js';
  
  const events = ['ready', 'guildCreate'];
  if (template === 'advanced') {
    events.push('messageCreate');
  }
  
  events.forEach(evt => {
    const templatePath = path.join(__dirname, '..', 'templates', language, template, isTypescript ? 'src/' : '', 'events', `${evt}.${ext}`);
    const targetPath = path.join(eventsDir, `${evt}.${ext}`);
    
    if (fs.existsSync(templatePath)) {
      let content = fs.readFileSync(templatePath, 'utf8');
      content = content.replace(/\{\{PREFIX\}\}/g, prefix);
      fs.writeFileSync(targetPath, content);
    }
  });
  
  log.success(`Created ${events.length} event files`);
}

function createConfig(projectPath, language, prefix) {
  const isTypescript = language === 'typescript';
  const configPath = path.join(projectPath, isTypescript ? 'src' : '', 'config.json');
  
  const config = {
    prefix: prefix,
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
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log.success('Created config.json');
}

function createTsConfig(projectPath, template) {
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'commonjs',
      lib: ['ES2022'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      moduleResolution: 'node',
      ...(template !== 'minimal' && {
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        removeComments: true
      })
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };
  
  fs.writeFileSync(
    path.join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );
  log.success('Created tsconfig.json');
}

function createReadme(projectPath, projectName, language, template, prefix) {
  const isTypescript = language === 'typescript';
  
  const content = `# ${projectName}

A Discord bot built with [betterdiscordjs](https://github.com/axrxvm/betterdiscordjs)${isTypescript ? ' using TypeScript' : ''}.

## Setup

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure your bot:**
   - Copy \`.env.example\` to \`.env\`
   - Add your Discord bot token and other credentials
   - Get your bot token from [Discord Developer Portal](https://discord.com/developers/applications)

${isTypescript ? `3. **Build the project:**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Start the bot:**` : '3. **Start the bot:**'}
   \`\`\`bash
   npm start
   \`\`\`

## Development

${isTypescript ? `- \`npm run dev\` - Build and start the bot
- \`npm run build:watch\` - Watch for changes and rebuild
- \`npm run typecheck\` - Check TypeScript types without building

` : `- \`npm run dev\` - Start with hot reload (Node.js 18+)

`}## Project Structure

\`\`\`
${projectName}/
${isTypescript ? `├── src/
│   ├── commands/    # Bot commands
│   ├── events/      # Event handlers
│   └── index.ts     # Main entry point
├── dist/            # Compiled output (TypeScript)
` : `├── commands/        # Bot commands
├── events/          # Event handlers
├── index.js         # Main entry point
`}├── data/            # Database and storage
├── .env             # Configuration (don't commit!)
${isTypescript ? `├── tsconfig.json    # TypeScript configuration
` : ''}└── package.json     # Dependencies
\`\`\`

## Adding Commands

Create a new file in \`${isTypescript ? 'src/' : ''}commands/\`:

\`\`\`${language}
${isTypescript ? `import type { Command } from '@axrxvm/betterdiscordjs';

const command: Command = {
  name: 'hello',
  description: 'Say hello',
  slash: true,
  run: async (ctx) => {
    await ctx.reply(\`Hello, \${ctx.user.username}!\`);
  }
};

export default command;` : `module.exports = {
  name: 'hello',
  description: 'Say hello',
  slash: true,
  run: async (ctx) => {
    await ctx.reply(\`Hello, \${ctx.user.username}!\`);
  }
};`}
\`\`\`

## Commands

- \`${prefix}help\` - Show all commands
- \`${prefix}ping\` - Check bot latency
${template !== 'minimal' ? `- \`${prefix}userinfo\` - Get user information` : ''}
${template === 'advanced' ? `- \`${prefix}poll\` - Create a poll
- \`${prefix}remind\` - Set a reminder` : ''}

## Documentation

- [betterdiscordjs Documentation](https://github.com/axrxvm/betterdiscordjs/tree/main/docs)
- [Discord.js Guide](https://discordjs.guide/)
${isTypescript ? '- [TypeScript Documentation](https://www.typescriptlang.org/docs/)' : ''}

## License

MIT
`;
  
  fs.writeFileSync(path.join(projectPath, 'README.md'), content);
  log.success('Created README.md');
}

/**
 * Install dependencies
 * @param {string} projectPath - Project directory
 * @returns {Promise<boolean>}
 */
async function installDependencies(projectPath) {
  try {
    process.chdir(projectPath);
    log.start('Installing dependencies');
    execSync('npm install', { stdio: 'inherit' });
    log.finish('Dependencies installed');
    return true;
  } catch (error) {
    log.fail('Failed to install dependencies');
    log.warn('Run "npm install" manually in the project directory');
    return false;
  }
}

module.exports = {
  generateProject,
  installDependencies
};
