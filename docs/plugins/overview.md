# Plugin System Overview

@axrxvm/betterdiscordjs features a powerful plugin system that allows you to create modular, reusable components for your Discord bot. Plugins can contain commands, events, scheduled tasks, and more.

## What are Plugins?

Plugins are self-contained modules that extend your bot's functionality. They provide:

- **Modularity**: Organize related features together
- **Reusability**: Share plugins across different bots
- **Hot-swapping**: Load/unload plugins without restarting
- **Dependency Management**: Handle plugin dependencies automatically
- **Configuration**: Per-plugin settings and data storage

## Plugin Architecture

```
Plugin System
├── PluginManager (manages all plugins)
├── BasePlugin (base class for all plugins)
├── Built-in Plugins (welcome, moderation, etc.)
└── Custom Plugins (your own plugins)
```

## Quick Start

### Using Built-in Plugins

```javascript
const { Bot, plugins } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN)
  .use(plugins.WelcomePlugin)
  .use(plugins.ModerationPlugin)
  .use(plugins.AutoModPlugin);

bot.start();
```

### Creating a Simple Plugin

```javascript
// plugins/GreetingPlugin.js
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class GreetingPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'greeting';
    this.version = '1.0.0';
    this.description = 'Provides greeting commands';
    this.author = 'Your Name';
  }

  async onLoad() {
    // Add commands
    this.addCommand('hello', this.helloCommand.bind(this), {
      description: 'Say hello',
      slash: true
    });
    
    // Add events
    this.addEvent('guildMemberAdd', this.onMemberJoin.bind(this));
    
    this.log('Greeting plugin loaded!');
  }

  async helloCommand(ctx) {
    await ctx.reply(`Hello, ${ctx.user.username}! 👋`);
  }

  async onMemberJoin(member) {
    const channel = member.guild.systemChannel;
    if (channel) {
      await channel.send(`Welcome to the server, ${member.user.username}!`);
    }
  }
}

module.exports = GreetingPlugin;
```

### Loading Your Plugin

```javascript
const GreetingPlugin = require('./plugins/GreetingPlugin');

const bot = new Bot(process.env.DISCORD_TOKEN)
  .use(GreetingPlugin);

bot.start();
```

## Plugin Structure

### Basic Plugin Template

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class MyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    // Plugin metadata (required)
    this.name = 'myplugin';
    this.version = '1.0.0';
    this.description = 'My awesome plugin';
    this.author = 'Your Name';
    
    // Optional metadata
    this.dependencies = ['otherplugin']; // Plugin dependencies
    this.website = 'https://example.com';
    this.repository = 'https://github.com/user/plugin';
  }

  async onLoad() {
    // Plugin initialization code
    this.log('Plugin loaded!');
  }

  async onUnload() {
    // Cleanup code (optional - BasePlugin handles most cleanup)
    this.log('Plugin unloaded!');
  }
}

module.exports = MyPlugin;
```

### Plugin Directory Structure

For file-based plugins, organize them in the `plugins/` directory:

```
plugins/
├── myplugin/
│   ├── index.js          # Main plugin file
│   ├── commands/         # Plugin commands
│   │   ├── hello.js
│   │   └── goodbye.js
│   ├── events/           # Plugin events
│   │   └── memberJoin.js
│   ├── config.json       # Plugin configuration
│   └── README.md         # Plugin documentation
└── config.json           # Global plugin config
```

## Plugin Features

### Commands

Add commands to your plugin:

```javascript
async onLoad() {
  // Simple command
  this.addCommand('greet', this.greetCommand.bind(this), {
    description: 'Greet someone',
    slash: true,
    cooldown: '5s'
  });
  
  // Command with aliases
  this.addCommand('hello', this.helloCommand.bind(this), {
    description: 'Say hello',
    aliases: ['hi', 'hey'],
    slash: true
  });
}

async greetCommand(ctx) {
  const target = ctx.args[0] || ctx.user.username;
  await ctx.reply(`Hello, ${target}! 🎉`);
}
```

### Events

Handle Discord events:

```javascript
async onLoad() {
  // Regular event
  this.addEvent('messageCreate', this.onMessage.bind(this));
  
  // One-time event
  this.addEvent('ready', this.onReady.bind(this), true);
}

async onMessage(message) {
  if (message.content.includes('hello') && !message.author.bot) {
    await message.react('👋');
  }
}

async onReady() {
  this.log('Bot is ready!');
}
```

### Scheduled Tasks

Add recurring tasks and cron jobs:

```javascript
async onLoad() {
  // Interval task
  this.addInterval(() => {
    this.log('Periodic task executed');
  }, 60000); // Every minute
  
  // Cron job
  this.addCron('0 0 * * *', () => {
    this.log('Daily task at midnight');
  });
}
```

### Configuration

Manage plugin configuration:

```javascript
async onLoad() {
  // Get configuration with default
  const welcomeMessage = this.getConfig('welcomeMessage', 'Welcome to the server!');
  
  // Set configuration
  this.setConfig('lastRun', new Date().toISOString());
}

// Guild-specific configuration
async someCommand(ctx) {
  const prefix = await this.getGuildConfig(ctx.guild.id, 'prefix', '!');
  await this.setGuildConfig(ctx.guild.id, 'prefix', '?');
}
```

### Database Access

Access plugin-scoped database:

```javascript
async onLoad() {
  const db = this.getDB();
  
  // Plugin data is automatically scoped
  await db.set('users.count', 0);
  const count = await db.get('users.count');
  
  this.log(`User count: ${count}`);
}
```

### Inter-Plugin Communication

Communicate with other plugins:

```javascript
async onLoad() {
  // Register a hook for other plugins to use
  this.addHook('getGreeting', this.getGreeting.bind(this));
}

async getGreeting(username) {
  return `Hello, ${username}!`;
}

// In another plugin
async someCommand(ctx) {
  try {
    const greeting = await this.callHook('greeting', 'getGreeting', ctx.user.username);
    await ctx.reply(greeting);
  } catch (error) {
    await ctx.reply('Greeting plugin not available');
  }
}
```

## Built-in Plugins

@axrxvm/betterdiscordjs comes with several built-in plugins:

### WelcomePlugin

Handles member join/leave messages:

```javascript
bot.use(plugins.WelcomePlugin);
```

Features:
- Customizable welcome messages
- Member leave notifications
- Role assignment on join
- Welcome DMs

### ModerationPlugin

Provides moderation commands:

```javascript
bot.use(plugins.ModerationPlugin);
```

Features:
- Ban, kick, mute commands
- Bulk message deletion
- Warning system
- Moderation logging

### AutoModPlugin

Automatic content moderation:

```javascript
bot.use(plugins.AutoModPlugin);
```

Features:
- Spam detection
- Bad word filtering
- Link filtering
- Auto-moderation actions

## Plugin Management

### Loading Plugins

```javascript
// Load from class
bot.use(MyPlugin);

// Load from file
await bot.loadPlugin('myplugin');

// Load from class with custom name
await bot.loadPluginFromClass(MyPlugin, 'custom-name');
```

### Managing Plugins at Runtime

```javascript
// List all plugins
const plugins = bot.listPlugins();
console.log(plugins);

// Get specific plugin
const myPlugin = bot.getPlugin('myplugin');

// Reload plugin
await bot.reloadPlugin('myplugin');

// Unload plugin
await bot.unloadPlugin('myplugin');

// Enable/disable plugin
await bot.enablePlugin('myplugin');
await bot.disablePlugin('myplugin');
```

### Plugin Information

```javascript
const plugins = bot.listPlugins();
plugins.forEach(plugin => {
  console.log(`${plugin.name} v${plugin.version} - ${plugin.description}`);
  console.log(`Loaded: ${plugin.loaded}, Enabled: ${plugin.enabled}`);
});
```

## Advanced Plugin Features

### Plugin Dependencies

```javascript
class MyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'myplugin';
    this.dependencies = ['economy', 'moderation']; // Required plugins
  }

  async onLoad() {
    // Access dependency plugins
    const economyPlugin = this.pluginManager.getPlugin('economy');
    if (economyPlugin) {
      // Use economy plugin features
    }
  }
}
```

### Plugin Hooks System

```javascript
// Plugin A - provides hooks
class ProviderPlugin extends BasePlugin {
  async onLoad() {
    this.addHook('calculateScore', this.calculateScore.bind(this));
    this.addHook('formatMessage', this.formatMessage.bind(this));
  }

  async calculateScore(user) {
    // Complex score calculation
    return Math.floor(Math.random() * 100);
  }

  async formatMessage(message, style) {
    return style === 'bold' ? `**${message}**` : message;
  }
}

// Plugin B - uses hooks
class ConsumerPlugin extends BasePlugin {
  async scoreCommand(ctx) {
    try {
      const score = await this.callHook('provider', 'calculateScore', ctx.user);
      const formatted = await this.callHook('provider', 'formatMessage', 
        `Your score: ${score}`, 'bold');
      await ctx.reply(formatted);
    } catch (error) {
      await ctx.reply('Score calculation unavailable');
    }
  }
}
```

### Plugin Configuration Schema

```javascript
// plugins/myplugin/config.json
{
  "enabled": true,
  "settings": {
    "welcomeMessage": "Welcome to the server!",
    "autoRole": null,
    "logChannel": null
  },
  "permissions": {
    "commands": ["hello", "greet"],
    "events": ["guildMemberAdd"]
  }
}
```

## Plugin Examples

### Economy Plugin

```javascript
const { BasePlugin } = require('@axrxvm/betterdiscordjs');

class EconomyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'economy';
    this.version = '1.0.0';
    this.description = 'Economy system with coins and daily rewards';
  }

  async onLoad() {
    // Commands
    this.addCommand('balance', this.balanceCommand.bind(this), {
      description: 'Check your coin balance',
      aliases: ['bal', 'coins'],
      slash: true
    });
    
    this.addCommand('daily', this.dailyCommand.bind(this), {
      description: 'Claim daily coins',
      cooldown: '24h',
      slash: true
    });
    
    this.addCommand('pay', this.payCommand.bind(this), {
      description: 'Pay coins to another user',
      usage: 'pay <user> <amount>',
      slash: true
    });
    
    // Hooks for other plugins
    this.addHook('getBalance', this.getBalance.bind(this));
    this.addHook('addCoins', this.addCoins.bind(this));
    this.addHook('removeCoins', this.removeCoins.bind(this));
  }

  async getBalance(userId) {
    const db = this.getDB();
    return await db.get(`users.${userId}.coins`) || 0;
  }

  async addCoins(userId, amount) {
    const db = this.getDB();
    const current = await this.getBalance(userId);
    await db.set(`users.${userId}.coins`, current + amount);
    return current + amount;
  }

  async removeCoins(userId, amount) {
    const current = await this.getBalance(userId);
    if (current < amount) return false;
    
    const db = this.getDB();
    await db.set(`users.${userId}.coins`, current - amount);
    return true;
  }

  async balanceCommand(ctx) {
    const balance = await this.getBalance(ctx.user.id);
    
    const embed = ctx.embed()
      .title('💰 Coin Balance')
      .desc(`You have **${balance}** coins!`)
      .color('gold');
    
    await embed.send();
  }

  async dailyCommand(ctx) {
    const db = this.getDB();
    const lastDaily = await db.get(`users.${ctx.user.id}.lastDaily`);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (lastDaily && (now - lastDaily) < oneDay) {
      const timeLeft = oneDay - (now - lastDaily);
      const hours = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      return ctx.error(`You can claim your daily reward in ${hours}h ${minutes}m!`);
    }
    
    const reward = Math.floor(Math.random() * 100) + 50; // 50-149 coins
    await this.addCoins(ctx.user.id, reward);
    await db.set(`users.${ctx.user.id}.lastDaily`, now);
    
    await ctx.success(`You claimed your daily reward of **${reward}** coins! 🎉`);
  }

  async payCommand(ctx) {
    const target = ctx.getUser('user') || 
                   (ctx.args[0] ? await ctx.fetchUser(ctx.args[0].replace(/[<@!>]/g, '')) : null);
    const amount = parseInt(ctx.getOption('amount') || ctx.args[1]);
    
    if (!target) {
      return ctx.error('Please specify a valid user to pay!');
    }
    
    if (!amount || amount <= 0) {
      return ctx.error('Please specify a valid amount to pay!');
    }
    
    if (target.id === ctx.user.id) {
      return ctx.error('You cannot pay yourself!');
    }
    
    const success = await this.removeCoins(ctx.user.id, amount);
    if (!success) {
      return ctx.error('You do not have enough coins!');
    }
    
    await this.addCoins(target.id, amount);
    
    await ctx.success(`You paid **${amount}** coins to ${target.username}!`);
  }
}

module.exports = EconomyPlugin;
```

## Best Practices

### 1. Plugin Structure

```javascript
// Good plugin structure
class MyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    // Always set these properties
    this.name = 'myplugin';
    this.version = '1.0.0';
    this.description = 'Clear description';
    this.author = 'Your Name';
  }

  async onLoad() {
    // Initialize plugin
    this.log('Plugin loaded');
  }

  async onUnload() {
    // Cleanup if needed
    this.log('Plugin unloaded');
  }
}
```

### 2. Error Handling

```javascript
async onLoad() {
  try {
    // Plugin initialization
    this.addCommand('test', this.testCommand.bind(this));
    this.log('Commands loaded successfully');
  } catch (error) {
    this.log(`Failed to load commands: ${error.message}`, 'error');
    throw error;
  }
}

async testCommand(ctx) {
  try {
    // Command logic
    await ctx.reply('Test successful!');
  } catch (error) {
    this.log(`Command error: ${error.message}`, 'error');
    await ctx.error('Command failed!');
  }
}
```

### 3. Configuration Management

```javascript
async onLoad() {
  // Set default configuration
  const defaultConfig = {
    enabled: true,
    prefix: '!',
    logChannel: null
  };
  
  // Merge with existing config
  Object.entries(defaultConfig).forEach(([key, value]) => {
    if (this.getConfig(key) === null) {
      this.setConfig(key, value);
    }
  });
}
```

### 4. Resource Cleanup

```javascript
async onUnload() {
  // Clear intervals and timeouts
  this.intervals.forEach(interval => clearInterval(interval));
  
  // Remove event listeners
  this.events.forEach(([event, handler]) => {
    this.bot.client.removeListener(event, handler);
  });
  
  // Clear commands
  this.commands.forEach((cmd, name) => {
    this.bot.commands.delete(name);
  });
  
  this.log('Plugin cleanup completed');
}
```

## Next Steps

- 📖 Learn [Creating Plugins](./creating-plugins.md)
- 🔧 Explore [Built-in Plugins](./built-in-plugins.md)
- 📚 Check the [Plugin API Reference](./api-reference.md)
- 💡 See [Plugin Examples](../examples/plugins.md)

---

The plugin system makes @axrxvm/betterdiscordjs incredibly flexible and allows you to build complex, modular Discord bots with ease.






