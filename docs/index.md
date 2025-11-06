# @axrxvm/betterdiscordjs Documentation

Welcome to the comprehensive documentation for **@axrxvm/betterdiscordjs** - a modern, modular, and extensible Discord bot framework for Node.js.

## 📚 Documentation Structure

### Getting Started
- [Installation & Setup](./getting-started/installation.md)
- [Quick Start Guide](./getting-started/quick-start.md)
- [CLI Tool](./getting-started/cli.md)
- [Configuration](./getting-started/configuration.md)
- [Your First Bot](./getting-started/first-bot.md)
- [Migration from Discord.js](./getting-started/migration.md)

### Core Concepts
- [Bot Class](./core/bot-class.md)
- [Context (Ctx) Object](./core/context.md)
- [Commands](./core/commands.md)
- [Events](./core/events.md)
- [Database & Storage](./core/database.md)

### Plugin System
- [Plugin Overview](./plugins/overview.md)
- [Creating Plugins](./plugins/creating-plugins.md)
- [Built-in Plugins](./plugins/built-in-plugins.md)
- [Plugin API Reference](./plugins/api-reference.md)

### Utilities
- [Logger](./utilities/logger.md)
- [Time Parser](./utilities/time.md)
- [Rate Limiting](./utilities/rate-limiting.md)
- [Scheduler](./utilities/scheduler.md)
- [Cache System](./utilities/cache.md)

### Advanced Features
- [Embed Builder](./advanced/embed-builder.md)
- [Component Interactions](./advanced/components.md)
- [Modals & Forms](./advanced/modals.md)
- [Pagination](./advanced/pagination.md)
- [Error Handling](./advanced/error-handling.md)
- [Middleware & Hooks](./advanced/middleware.md)

### Examples
- [Basic Bot Examples](./examples/basic-bots.md)
- [Command Examples](./examples/commands.md)
- [Plugin Examples](./examples/plugins.md)
- [Advanced Use Cases](./examples/advanced.md)

### API Reference
- [Bot Class API](./api/bot.md)
- [Context API](./api/context.md)
- [Plugin API](./api/plugin.md)
- [Utilities API](./api/utilities.md)

### Deployment Guide
- [Deployment Guide](./deployment/deployment.md)
- [Best Practices](./deployment/best-practices.md)

## 🚀 What is @axrxvm/betterdiscordjs?

@axrxvm/betterdiscordjs is a powerful Discord bot framework built on top of discord.js that provides:

- **🎯 Unified Command System**: Support for both prefix and slash commands
- **🔧 Advanced Context Object**: Simplified Discord API interactions
- **📦 Plugin Architecture**: Modular, reusable components
- **⚡ Built-in Utilities**: Caching, rate limiting, scheduling, and more
- **🎨 Rich Embed Builder**: Intuitive embed creation with fluent API
- **🔄 Hot Reloading**: Development-friendly command and event reloading
- **📊 Statistics & Logging**: Built-in command tracking and beautiful logs
- **🛡️ Error Handling**: Comprehensive error management system

## 🎯 Key Features

### Modern JavaScript
- ES6+ syntax support
- Promise-based architecture
- Async/await throughout

### Developer Experience
- Intuitive API design
- Comprehensive error messages
- Hot reloading for development
- Beautiful, color-coded logging

### Production Ready
- Built-in rate limiting
- Database integration
- Plugin system for modularity
- Graceful error handling
- Performance optimizations

### Discord.js Integration
- Full discord.js v14 compatibility
- Enhanced with additional utilities
- Maintains all original functionality

## 🏗️ Architecture

@axrxvm/betterdiscordjs follows a modular architecture:

```
┌─────────────────┐
│   Your Bot      │
├─────────────────┤
│   @axrxvm/betterdiscordjs    │
│   Framework     │
├─────────────────┤
│   discord.js    │
├─────────────────┤
│   Node.js       │
└─────────────────┘
```

## 📖 Quick Example

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events'
});

// Inline command
bot.command('hello', async (ctx) => {
  await ctx.reply('Hello, World!');
});

// Event handler
bot.on('ready', (ctx) => {
  console.log(`${ctx.user.tag} is ready!`);
});

bot.start();
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

@axrxvm/betterdiscordjs is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

## 🆘 Support

- 📖 [Documentation](./index.md)
- 🐛 [Issue Tracker](https://github.com/axrxvm/betterdiscordjs/issues)
- 💬 [Discord Server](https://discord.gg/your-server)

---

*Built with ❤️ for the Discord developer community*#
# Next Steps

Ready to start building? Here's your learning path:

1. 🚀 [Quick Start](./getting-started/quick-start.md) - Get up and running in minutes
2. 📦 [Installation Guide](./getting-started/installation.md) - Detailed setup instructions  
3. 🏗️ [Your First Bot](./getting-started/first-bot.md) - Build your first bot step by step
4. ⚙️ [Configuration](./getting-started/configuration.md) - Master bot configuration options