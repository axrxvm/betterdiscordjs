# CLI Tool

The betterdiscordjs CLI provides scaffolding tools to quickly create new Discord bot projects with proper structure and example files.

## Installation

The CLI is included with the betterdiscordjs package and can be run using `npx`:

```bash
npx @axrxvm/betterdiscordjs create my-bot
```

No global installation required!

## Commands

### `create <project-name>`

Create a new Discord bot project with the specified name.

```bash
npx @axrxvm/betterdiscordjs create my-awesome-bot
```

This will:
- Create a new directory with your project name
- Set up the proper file structure
- Install dependencies (unless `--no-install` is specified)
- Create example commands and events
- Configure `.env` and `.gitignore` files
- Generate a README with setup instructions

## Options

### `--template, -t <type>`

Choose a project template. Available templates:

- **basic** (default) - Complete setup with example commands and events
- **advanced** - Includes plugins, advanced features, and configuration
- **minimal** - Bare minimum setup for experienced users

```bash
# Use the advanced template
npx @axrxvm/betterdiscordjs create my-bot --template advanced

# Use the minimal template
npx @axrxvm/betterdiscordjs create my-bot -t minimal
```

### `--yes, -y`

Skip interactive prompts and use default values.

```bash
npx @axrxvm/betterdiscordjs create my-bot --yes
```

### `--no-install`

Don't automatically install npm dependencies after creating the project.

```bash
npx @axrxvm/betterdiscordjs create my-bot --no-install
```

### `--help, -h`

Show help information.

```bash
npx @axrxvm/betterdiscordjs --help
```

## Templates

### Basic Template (Default)

Perfect for most users. Includes:

- ✅ Organized file structure (`commands/`, `events/`, `data/`)
- ✅ Example commands (ping, help, userinfo)
- ✅ Example events (ready, guildCreate)
- ✅ Environment configuration (.env)
- ✅ Git ignore file
- ✅ README with setup instructions

**File Structure:**
```
my-bot/
├── commands/
│   ├── ping.js
│   ├── help.js
│   └── userinfo.js
├── events/
│   ├── ready.js
│   └── guildCreate.js
├── data/
│   └── .gitkeep
├── index.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Advanced Template

For users who want more features out of the box. Includes everything in Basic plus:

- ✅ Plugin system integration
- ✅ Configuration file (config.json)
- ✅ Advanced commands (poll, remind)
- ✅ Advanced events (messageCreate with auto-moderation)
- ✅ Database setup
- ✅ Scheduled tasks
- ✅ Global command hooks and error handling

**Additional Features:**
- Welcome Plugin setup
- Moderation Plugin setup
- Auto-moderation example
- Database configuration
- Scheduled task examples
- Advanced logging

### Minimal Template

Bare minimum for experienced developers:

- ✅ Basic index.js with bot setup
- ✅ Simple inline command example
- ✅ Environment configuration
- ✅ Package.json

**File Structure:**
```
my-bot/
├── index.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Usage Examples

### Quick Start (Interactive)

```bash
npx @axrxvm/betterdiscordjs create my-bot
# Follow the interactive prompts
```

### Quick Start (Non-Interactive)

```bash
npx @axrxvm/betterdiscordjs create my-bot --yes
cd my-bot
# Edit .env file with your bot token
npm start
```

### Advanced Setup

```bash
npx @axrxvm/betterdiscordjs create my-bot --template advanced
cd my-bot
# Configure .env and config.json
npm start
```

### Minimal Setup for Experts

```bash
npx @axrxvm/betterdiscordjs create my-bot -t minimal -y
cd my-bot
# Build your bot from scratch
npm start
```

### Skip Dependency Installation

```bash
npx @axrxvm/betterdiscordjs create my-bot --no-install
cd my-bot
# Install dependencies later or use a different package manager
pnpm install
```

## After Creating a Project

Once your project is created, follow these steps:

### 1. Configure Your Bot

Edit the `.env` file and add your Discord bot credentials:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
DEV_GUILD=your_dev_guild_id_here
PREFIX=!
```

**Getting Your Credentials:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "Bot" section
4. Copy your bot token (DISCORD_TOKEN)
5. Go to "OAuth2" → "General" to find your Client ID
6. Right-click your development server and copy the ID for DEV_GUILD

### 2. Install Dependencies (if skipped)

```bash
npm install
```

### 3. Start Your Bot

```bash
npm start
```

For development with auto-reload (Node.js 18+):
```bash
npm run dev
```

### 4. Invite Your Bot

Generate an invite link:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "OAuth2" → "URL Generator"
4. Select scopes: `bot`, `applications.commands`
5. Select permissions based on your needs
6. Copy and visit the generated URL

## Generated Files Explained

### `index.js`
The main entry point of your bot. Initializes the Bot class and starts the bot.

### `commands/`
Directory containing your bot commands. Each file exports a command object.

### `events/`
Directory containing your event handlers. Each file exports an event object.

### `data/`
Directory for storing data files (database, cache, etc.). Automatically created and git-ignored.

### `.env`
Your environment variables (bot token, etc.). **Never commit this file!**

### `.env.example`
Template for environment variables. Safe to commit.

### `.gitignore`
Specifies which files Git should ignore (node_modules, .env, etc.).

### `package.json`
Your project's dependencies and scripts.

### `README.md`
Project documentation with setup instructions.

### `config.json` (Advanced template only)
Configuration file for bot settings and plugin toggles.

## Adding New Commands

Create a new file in the `commands/` directory:

```javascript
// commands/hello.js
module.exports = {
  name: 'hello',
  description: 'Say hello to the user',
  slash: true, // Enable as slash command
  run: async (ctx) => {
    await ctx.reply(`Hello, ${ctx.user.username}! 👋`);
  }
};
```

The command will be automatically loaded when the bot starts.

## Adding New Events

Create a new file in the `events/` directory:

```javascript
// events/messageDelete.js
module.exports = {
  name: 'messageDelete',
  run: async (ctx, message) => {
    console.log(`Message deleted: ${message.content}`);
  }
};
```

## Customizing Templates

You can modify the CLI to create custom templates:

1. Fork the repository
2. Edit `cli/index.js` and the template generation functions
3. Add your custom templates
4. Publish your modified version

## Troubleshooting

### "command not found: betterdjs"

This is expected when using npx. Always use:
```bash
npx @axrxvm/betterdiscordjs create my-bot
```

### Permission Denied

On Linux/Mac, you might need to make the CLI executable:
```bash
chmod +x node_modules/.bin/betterdjs
```

### Dependencies Not Installing

If automatic installation fails:
```bash
cd my-bot
npm install
```

Or use the `--no-install` flag and install manually:
```bash
npx @axrxvm/betterdiscordjs create my-bot --no-install
cd my-bot
npm install
```

### Project Already Exists

The CLI won't overwrite existing directories. Either:
- Choose a different name
- Delete the existing directory
- Rename the existing directory

## Environment Variables

All templates include these environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your Discord bot token | ✅ Yes |
| `CLIENT_ID` | Your application's client ID | ✅ Yes (for slash commands) |
| `DEV_GUILD` | Guild ID for testing slash commands | ⚠️ Recommended |
| `PREFIX` | Command prefix (e.g., `!`) | ⚠️ Recommended |
| `BOT_OWNER_ID` | Your Discord user ID | ❌ Optional |

## Best Practices

1. **Never commit `.env`** - It contains sensitive credentials
2. **Use `.env.example`** - Document required environment variables
3. **Start with basic template** - Learn the framework before using advanced features
4. **Test in dev guild** - Use `DEV_GUILD` for testing slash commands
5. **Keep commands organized** - One command per file in `commands/`
6. **Use descriptive names** - Name files and commands clearly

## Next Steps

After creating your project:

1. ✅ Read the generated README.md
2. ✅ Configure your .env file
3. ✅ Start the bot and test basic commands
4. ✅ Explore the [full documentation](../README.md)
5. ✅ Check out [example commands](../examples/commands.md)
6. ✅ Learn about [plugins](../plugins/overview.md)
7. ✅ Join the community and share your bot!

## Examples

### Create and Run in One Go

```bash
# Create project
npx @axrxvm/betterdiscordjs create my-bot -y

# Configure and run
cd my-bot
echo "DISCORD_TOKEN=your_token_here" > .env
echo "PREFIX=!" >> .env
npm start
```

### Create Multiple Bots

```bash
# Main bot
npx @axrxvm/betterdiscordjs create main-bot --template advanced

# Testing bot
npx @axrxvm/betterdiscordjs create test-bot --template minimal
```

### Custom Configuration

```bash
# Create with advanced template
npx @axrxvm/betterdiscordjs create my-bot -t advanced

# Edit config.json
cd my-bot
# Enable plugins, configure features
nano config.json

npm start
```

## Contributing

Want to improve the CLI? Contributions are welcome!

1. Fork the repository
2. Edit `cli/index.js`
3. Test your changes
4. Submit a pull request

## Support

- 📖 [Documentation](../README.md)
- 💬 [Discussions](https://github.com/axrxvm/betterdiscordjs/discussions)
- 🐛 [Report Issues](https://github.com/axrxvm/betterdiscordjs/issues)

---

**Happy bot building! 🚀**
