# Installation & Setup

This guide will walk you through installing @axrxvm/betterdiscordjs and setting up your development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.9.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- A **Discord Application** with a bot token

## Creating a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to the "Bot" section in the sidebar
4. Click "Add Bot" and confirm
5. Copy the bot token (keep this secure!)
6. Under "Privileged Gateway Intents", enable:
   - Message Content Intent (for prefix commands)
   - Server Members Intent (for member events)

## Installation Methods

### Method 1: Clone the Repository (Recommended)

```bash
# Clone the @axrxvm/betterdiscordjs repository
git clone https://github.com/your-repo/@axrxvm/betterdiscordjs.git
cd @axrxvm/betterdiscordjs

# Install dependencies
npm install

# Copy the example bot
cp -r testbot my-bot
cd my-bot

# Install bot-specific dependencies
npm install
```

### Method 2: NPM Package (Coming Soon)

```bash
# Create a new project
mkdir my-discord-bot
cd my-discord-bot
npm init -y

# Install @axrxvm/betterdiscordjs (when published)
npm install @axrxvm/betterdiscordjs

# Install peer dependencies
npm install discord.js dotenv
```

### Method 3: Manual Setup

```bash
# Create project directory
mkdir my-discord-bot
cd my-discord-bot
npm init -y

# Install dependencies
npm install discord.js@14.22.1 dotenv chalk lowdb node-cron

# Create basic structure
mkdir commands events plugins utils
```

## Environment Configuration

Create a `.env` file in your project root:

```env
# Required
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id_here

# Optional but recommended
DEV_GUILD=your_development_guild_id
BOT_OWNER_ID=your_user_id_here
BOT_LOG_CHANNEL=log_channel_id_here

# Optional settings
PREFIX=!
MAINTENANCE_MODE=false
```

### Getting Your IDs

To get Discord IDs, enable Developer Mode in Discord:
1. User Settings → Advanced → Developer Mode
2. Right-click on servers, channels, or users to copy their IDs

## Project Structure

After installation, your project should look like this:

```
my-discord-bot/
├── commands/           # Command files
│   ├── general/
│   ├── fun/
│   └── utility/
├── events/            # Event handlers
├── plugins/           # Custom plugins
├── utils/             # Utility functions
├── data/              # Database files
├── .env               # Environment variables
├── .env.example       # Environment template
├── index.js           # Main bot file
├── package.json       # Project configuration
└── README.md          # Project documentation
```

## Verification

Test your installation by creating a simple bot:

```javascript
// index.js
const { Bot } = require('./path/to/@axrxvm/betterdiscordjs');
require('dotenv').config();

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!'
});

bot.command('test', async (ctx) => {
  await ctx.reply('@axrxvm/betterdiscordjs is working! 🎉');
});

bot.on('ready', (ctx) => {
  console.log(`✅ ${ctx.user.tag} is ready!`);
});

bot.start();
```

Run your bot:

```bash
node index.js
```

If you see the ready message and can use the `!test` command, you're all set!

## Development Tools (Optional)

### Nodemon for Auto-Restart

```bash
npm install -g nodemon
# or locally
npm install --save-dev nodemon
```

Add to your `package.json`:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### VS Code Extensions

Recommended extensions for VS Code:
- **Discord.js IntelliSense** - Autocomplete for Discord.js
- **JavaScript (ES6) code snippets** - Useful code snippets
- **Prettier** - Code formatting
- **ESLint** - Code linting

## Troubleshooting

### Common Issues

**"Cannot find module '@axrxvm/betterdiscordjs'"**
- Ensure you've installed dependencies: `npm install`
- Check your require path is correct

**"Invalid token"**
- Verify your bot token in the `.env` file
- Ensure no extra spaces or characters

**"Missing permissions"**
- Check your bot has necessary permissions in the Discord server
- Verify the bot is added to your server

**"Command not found"**
- Ensure your commands directory path is correct
- Check file naming conventions (see [Commands Guide](../core/commands.md))

### Getting Help

If you encounter issues:
1. Check the [FAQ](../faq.md)
2. Review the [troubleshooting guide](../troubleshooting.md)
3. Join our [Discord server](https://discord.gg/your-server)
4. Create an [issue on GitHub](https://github.com/your-repo/@axrxvm/betterdiscordjs/issues)

## Next Steps

Now that you have @axrxvm/betterdiscordjs installed:

1. 📖 Read the [Quick Start Guide](./quick-start.md)
2. 🔧 Learn about [Configuration](./configuration.md)
3. 🤖 Build [Your First Bot](./first-bot.md)
4. 📚 Explore the [Core Concepts](../core/README.md)

---

**Tip**: Keep your bot token secure and never commit it to version control. Always use environment variables!






