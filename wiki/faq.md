# Frequently Asked Questions

## General Questions

### What is @axrxvm/betterdiscordjs?

@axrxvm/betterdiscordjs is a modern Discord bot framework built on top of discord.js that provides a unified command system, advanced context object, plugin architecture, and many built-in utilities to make Discord bot development easier and more efficient.

### How is this different from regular discord.js?

While discord.js provides the core Discord API wrapper, @axrxvm/betterdiscordjs adds:
- Unified command system (prefix + slash commands)
- Advanced context object for simplified interactions
- Plugin architecture for modularity
- Built-in utilities (caching, rate limiting, scheduling)
- Rich embed builder with fluent API
- Hot reloading for development
- Comprehensive error handling

### Is @axrxvm/betterdiscordjs compatible with discord.js v14?

Yes! @axrxvm/betterdiscordjs is built on top of discord.js v14 and maintains full compatibility while adding additional features and utilities.

## Installation & Setup

### What Node.js version do I need?

@axrxvm/betterdiscordjs requires Node.js v16.9.0 or higher. We recommend using the latest LTS version for the best experience.

### Can I use this with TypeScript?

While @axrxvm/betterdiscordjs is written in JavaScript, it can be used with TypeScript projects. Type definitions may be added in future releases.

### How do I get a Discord bot token?

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Navigate to the "Bot" section
4. Click "Add Bot"
5. Copy the token from the "Token" section

## Commands

### How do I create both prefix and slash commands?

Set `slash: true` in your command options:

```javascript
bot.command('hello', async (ctx) => {
  await ctx.reply('Hello!');
}, {
  description: 'Say hello',
  slash: true // This enables slash command
});
```

### Can I disable prefix or slash commands globally?

Yes, in your bot configuration:

```javascript
const bot = new Bot(token, {
  prefix: '!',
  disableSlash: true, // Disable all slash commands
  // or
  disablePrefix: true // Disable all prefix commands
});
```

### How do I add command cooldowns?

Use the `cooldown` option in your command configuration:

```javascript
bot.command('limited', async (ctx) => {
  await ctx.reply('This command has a cooldown!');
}, {
  cooldown: '5s' // 5 second cooldown
});
```

## Plugins

### How do I create a custom plugin?

Create a class that extends `BasePlugin`:

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class MyPlugin extends BasePlugin {
  constructor() {
    super('MyPlugin', '1.0.0');
  }

  async onLoad(bot) {
    // Plugin initialization
  }

  async onUnload() {
    // Cleanup
  }
}

module.exports = MyPlugin;
```

### Can I disable built-in plugins?

Yes, in your bot configuration:

```javascript
const bot = new Bot(token, {
  plugins: {
    automod: false, // Disable automod plugin
    welcome: false  // Disable welcome plugin
  }
});
```

## Troubleshooting

### My commands aren't working

1. Check that your bot has the necessary permissions
2. Verify your command files are in the correct directory
3. Ensure your command syntax is correct
4. Check the console for error messages

### Slash commands aren't appearing

1. Make sure `clientId` is set in your bot configuration
2. For development, set `devGuild` to your test server ID
3. Wait a few minutes for Discord to update (global commands can take up to 1 hour)

### "Missing Access" errors

Your bot needs appropriate permissions. Common permissions needed:
- `Send Messages`
- `Use Slash Commands`
- `Embed Links`
- `Attach Files`
- `Read Message History`

## Performance

### How do I optimize my bot for large servers?

1. Use the built-in caching system
2. Implement proper rate limiting
3. Use database connections efficiently
4. Consider using sharding for very large bots (1000+ servers)

### Can I use a database with @axrxvm/betterdiscordjs?

Yes! The framework includes built-in database utilities and supports:
- SQLite (built-in with lowdb)
- MongoDB
- PostgreSQL
- MySQL
- Any database with a Node.js driver

## Development

### How do I enable hot reloading?

Hot reloading is enabled by default in development. Commands and events will automatically reload when files are changed.

### Can I use ES6 modules (import/export)?

Currently, @axrxvm/betterdiscordjs uses CommonJS (require/module.exports). ES6 module support may be added in future releases.

### How do I debug my bot?

1. Enable debug logging in your configuration
2. Use the built-in logger utility
3. Check the console for error messages
4. Use Discord's Developer Mode to get IDs

## Deployment

### How do I deploy my bot to production?

1. Set up a VPS or cloud hosting service
2. Install Node.js and your dependencies
3. Set environment variables
4. Use a process manager like PM2
5. Set up monitoring and logging

### Can I use Docker?

Yes! Here's a basic Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "index.js"]
```

## Support

### Where can I get help?

1. Check this FAQ and the documentation
2. Join our Discord server for community support
3. Create an issue on GitHub for bugs
4. Check existing GitHub issues for similar problems

### How do I report a bug?

1. Go to our [GitHub repository](https://github.com/axrxvm/betterdiscordjs)
2. Click "Issues" → "New Issue"
3. Provide a clear description and reproduction steps
4. Include your Node.js version and relevant code

### Can I contribute to the project?

Absolutely! We welcome contributions. Please read our [Contributing Guide](./CONTRIBUTING.md) for details on how to get started.

---

*Don't see your question here? Join our Discord server or create an issue on GitHub!*