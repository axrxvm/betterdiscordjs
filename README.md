# betterdiscordjs

[![npm version](https://badge.fury.io/js/betterdiscordjs.svg)](https://badge.fury.io/js/@axrxvm/betterdiscordjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord.js](https://img.shields.io/badge/discord.js-v14.22.1-blue.svg)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.9.0-brightgreen.svg)](https://nodejs.org/)

A modern, modular and dev-friendly discord.js

## ✨ Features

- 🎯 **Unified Commands** - Support for both slash and prefix commands
- 🔧 **Enhanced Context** - Simplified Discord API interactions with `ctx` object
- 📦 **Plugin System** - Modular architecture with built-in plugins
- ⚡ **Hot Reloading** - Development-friendly command and event reloading
- 🛡️ **Built-in Security** - Rate limiting, permissions, and error handling
- 📊 **Statistics & Logging** - Command tracking with beautiful colored logs
- 🎨 **Rich Embeds** - Intuitive embed builder with fluent API
- ⏰ **Task Scheduling** - Cron jobs and interval-based tasks

## 🚀 Quick Start

```bash
npm install @axrxvm/betterdiscordjs
```

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: '!',
  commandsDir: './commands',
  eventsDir: './events'
});

// Inline command
bot.command('ping', async (ctx) => {
  await ctx.reply('🏓 Pong!');
});

// Event handler
bot.on('ready', (ctx) => {
  console.log(`${ctx.user.tag} is ready!`);
});

bot.start();
```

## 📖 Documentation

- 📚 [Full Documentation](./docs/README.md)
- 🚀 [Quick Start Guide](./docs/getting-started/quick-start.md)
- 🔌 [Plugin Development](./docs/plugins/creating-plugins.md)
- 📋 [API Reference](./docs/api/bot.md)
- 💡 [Examples](./docs/examples/)

## 🏗️ Project Structure

```
├── Bot.js              # Main bot class
├── index.js            # Framework entry point
├── loaders/            # Command and event loaders
├── plugins/            # Plugin system and built-in plugins
├── utils/              # Utilities (cache, logger, scheduler, etc.)
├── testbot/            # Example bot implementation
└── docs/               # Comprehensive documentation
```

## 🔌 Plugin System

betterdiscordjs includes a powerful plugin system with built-in plugins:

```javascript
const { Bot, plugins } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(token)
  .use(plugins.WelcomePlugin)
  .use(plugins.ModerationPlugin)
  .use(plugins.AutoModPlugin);

bot.start();
```

## 🛠️ Requirements

- Node.js 16.9.0 or higher
- Discord.js v14.22.1
- A Discord bot token

## 📦 Installation

### Using the Framework
```bash
npm install @axrxvm/betterdiscordjs
```

### Development Setup
```bash
git clone https://github.com/axrxvm/betterdiscordjs.git
cd betterdiscordjs
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./docs/README.md)
- 🐛 [Issues](https://github.com/axrxvm/betterdiscordjs/issues)
- 💬 [Discussions](https://github.com/axrxvm/betterdiscordjs/discussions)

## 🙏 Acknowledgments

- Built on top of the powerful [discord.js](https://discord.js.org/)
- Inspired by modern web frameworks
- Made with ❤️ for the Discord developer community

---

**[⭐ Star this repo](https://github.com/axrxvm/betterdiscordjs) if you find it helpful!**


